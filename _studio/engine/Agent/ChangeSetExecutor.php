<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, FileManager, RevisionManager, Settings, SiteWorkspace};

/** Applies only sealed staged bytes, in explicitly continued bounded steps. */
final class ChangeSetExecutor
{
    private OperationRunner $runner;
    private FileManager $files;
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,
        private ChangeSetStore $changes,private OperationStore $operations,
        private int $filesPerStep=20,private ?\Closure $testHook=null)
    {
        if ($filesPerStep<1 || $filesPerStep>100) throw new \InvalidArgumentException('Invalid operation step budget.');
        $this->runner = new OperationRunner($db,$policy,$operations,$workspace->mutationLockPath());
        $this->files = new FileManager($db,$workspace);
    }

    public function apply(OperationActor $actor,\stdClass $input): array
    {
        JsonSchema::validate($input,[
            'type'=>'object','properties'=>[
                'change_set_id'=>['type'=>'string','pattern'=>'^change_[a-f0-9]{32}$'],
                'digest'=>['type'=>'string','pattern'=>'^[a-f0-9]{64}$'],
                'operation_id'=>['type'=>'string','pattern'=>'^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$'],
            ],'required'=>['change_set_id','digest','operation_id'],'additionalProperties'=>false,
        ]);
        return $this->runner->start($actor,$input->operation_id,'changes.apply',
            (object)['change_set_id'=>$input->change_set_id,'digest'=>$input->digest],
            'draft:'.$this->workspace->status()['draft_version'],$input->change_set_id,['files:write','changes:apply'],
            fn($operation)=>$this->step($actor,$operation),fn($operation)=>$this->restore($operation));
    }

    public function continue(OperationActor $actor,string $operationId,int $checkpoint): array
    {
        $row=$this->operations->get($actor,$operationId);
        if ($row['kind']!=='changes.apply') throw new OperationException('invalid_schema','Use the continuation for this operation kind.');
        return $this->runner->continue($actor,$operationId,$checkpoint,['files:write','changes:apply'],
            fn($operation)=>$this->step($actor,$operation),fn($operation)=>$this->restore($operation),
            fn($operation)=>$this->consistentPartialState($operation));
    }

    public function recover(OperationActor $actor,string $operationId): array
    {
        $row=$this->operations->get($actor,$operationId);
        if ($row['kind']!=='changes.apply') throw new OperationException('invalid_schema','This operation requires a different recovery service.');
        return $this->runner->recover($actor,$operationId,['files:write','changes:apply','restore:draft'],
            fn($operation)=>$this->restore($operation));
    }

    private function step(OperationActor $actor,array $operation): array
    {
        $this->workspace->assertReady();
        $change=$this->changes->forOperation($actor,$operation);
        if (!hash_equals($change['sealed_digest'] ?? '',$operation['request']['digest'])) throw new OperationException('content_conflict','The apply digest does not match the retained review.');
        if ($change['status']!=='ready') throw new OperationException('content_conflict','This reviewed change set has already been applied.');
        $manifest=$change['manifest'];
        $scopes=array_merge(['files:write','changes:apply'],$manifest['required_write_scopes'] ?? []);
        foreach ($manifest['files'] as $file) {
            if (SitePathPolicy::type($file['path'])==='forms') $scopes[]='forms:write';
            if (SitePathPolicy::type($file['path'])==='binary') $scopes[]='assets:write';
        }
        $this->policy->require($actor,array_values(array_unique($scopes)));
        $recovery=$operation['recovery'];
        if (!$recovery) {
            // Review expiry is checked before any writes, but never makes
            // already captured recovery material inaccessible to a continuation.
            $this->changes->get($actor,$change['id']);
            $state=$this->workspace->status();
            if ('draft:'.$state['draft_version']!==$manifest['base_draft_version']
                || WorkspaceFiles::hashes(WorkspaceFiles::read($this->workspace))!==$manifest['before']) {
                throw new OperationException('content_conflict','The complete draft differs from the reviewed source. Prepare a new change set.');
            }
            if (isset($manifest['projection']) && CanonicalJson::digest($this->db->query('SELECT * FROM pages ORDER BY id')) !== CanonicalJson::digest($manifest['projection']['before'])) {
                throw new OperationException('content_conflict','Page relationships changed after structural review.');
            }
            if (isset($manifest['projection']['before_collections']) && CanonicalJson::digest($this->db->query('SELECT id, index_page_id FROM collections ORDER BY id')) !== CanonicalJson::digest($manifest['projection']['before_collections'])) {
                throw new OperationException('content_conflict','Collection relationships changed after structural review.');
            }
            $this->verifyStaging($change);
            $recovery=['change_set_id'=>$change['id'],'files'=>$manifest['files'],'before'=>$manifest['before'],
                'after'=>$manifest['after'],'pages'=>$this->db->query('SELECT * FROM pages ORDER BY id'),
                'draft_version'=>$state['draft_version'],
                'collection_indexes'=>$this->db->query('SELECT id, index_page_id FROM collections ORDER BY id')];
            $this->operations->recordRecovery($actor,$operation['operation_id'],$operation['lease_token'],$recovery);
            $this->hook('after_capture',$operation);
        } else {
            $this->verifyStaging($change);
            if (!$this->consistentPartialState($operation)) throw new OperationException('content_conflict','The interrupted workspace has bytes outside its retained before/after manifests.');
        }
        $index=(int)($operation['checkpoint']['next_file'] ?? 0);
        $end=min(count($manifest['files']),$index+$this->filesPerStep);
        for (;$index<$end;$index++) {
            $entry=$manifest['files'][$index]; $path=$entry['path'];
            $this->policy->require($actor,array_values(array_unique($scopes)));
            $absolute=$this->workspace->resolveDraft($path,true);
            $current=is_file($absolute)?hash_file('sha256',$absolute):null;
            if ($current===$entry['after_hash']) continue;
            if ($current!==$entry['before_hash']) throw new OperationException('content_conflict','An affected file changed during apply.',['path'=>$path]);
            if ($entry['after_hash']===null) {
                $this->files->deleteFile($path);
            } else {
                $source=SiteWorkspace::resolveWithin($this->changes->stagingRoot($change['id']).'/draft',$path);
                $content=file_get_contents($source);
                if ($content===false || hash('sha256',$content)!==$entry['after_hash']) throw new OperationException('content_conflict','Staged bytes no longer match the review.',['path'=>$path]);
                if (!is_dir(dirname($absolute)) && !mkdir(dirname($absolute),0755,true)) throw new OperationException('host_capability_unavailable','Cannot create a draft directory.');
                $this->files->writeExactFile($path,$content);
            }
            $actual=is_file($absolute)?hash_file('sha256',$absolute):null;
            if ($actual!==$entry['after_hash']) throw new OperationException('host_capability_unavailable','An applied file could not be verified.',['path'=>$path]);
            $this->hook('after_file',$operation+['path'=>$path]);
        }
        if ($index<count($manifest['files'])) return ['complete'=>false,'phase'=>'files',
            'checkpoint'=>['next_file'=>$index,'total_files'=>count($manifest['files'])],'recovery'=>$recovery];
        if (WorkspaceFiles::hashes(WorkspaceFiles::read($this->workspace))!==$manifest['after']) throw new OperationException('content_conflict','The final workspace differs from the exact reviewed manifest.');
        // A sealed editor save/compile may prove there are no changed bytes.
        // Its source preconditions were checked above; retain the receipt only.
        $projectionChanged=isset($manifest['projection'])
            && CanonicalJson::digest($manifest['projection']['before'])!==CanonicalJson::digest($manifest['projection']['after']);
        if ($manifest['files'] === [] && !$projectionChanged) {
            $version = $manifest['base_draft_version'];
            $this->operations->finish($actor,$operation['operation_id'],$operation['lease_token'],'succeeded',[
                'operation_id'=>$operation['operation_id'],'actor'=>$actor->attribution(),
                'before_version'=>$version,'after_version'=>$version,'changed_paths'=>[],
                'revision_id'=>null,'change_set_id'=>$change['id'],'digest'=>$change['sealed_digest'],
                'provider_calls'=>0,'validation'=>$change['payload']['validation'],
                'restoration'=>['required'=>false,'restored'=>null],
            ],$version,fn()=>$this->changes->markApplied($actor,$change['id']));
            return ['committed'=>true];
        }
        $this->hook('before_projection',$operation);
        $before=[];$revisionOps=[];
        foreach ($manifest['files'] as $entry) {
            $path=$entry['path'];
            $before[$path]=$entry['before_hash']===null?null:file_get_contents(
                SiteWorkspace::resolveWithin($this->changes->stagingRoot($change['id']).'/before',$path));
            $revisionOps[]=['path'=>$path,'action'=>$entry['after_hash']===null?'delete':'write'];
        }
        $afterVersion='draft:'.($recovery['draft_version']+1);
        $revisions=new RevisionManager($this->db,new Settings($this->db),$this->files);
        $revisions->recordAppliedRevision($revisionOps,$manifest['summary'],$actor->userId,$before,
            function (int $revisionId) use ($actor,$operation,$change,$manifest,$afterVersion,$recovery,$scopes): void {
                $this->policy->require($actor,array_values(array_unique($scopes)));
                if (CanonicalJson::digest($this->db->query('SELECT * FROM pages ORDER BY id')) !== CanonicalJson::digest($recovery['pages'])
                    || CanonicalJson::digest($this->db->query('SELECT id, index_page_id FROM collections ORDER BY id')) !== CanonicalJson::digest($recovery['collection_indexes'])) {
                    throw new OperationException('content_conflict','Page or collection relationships changed before commit.');
                }
                if (isset($manifest['projection'])) {
                    require_once dirname(__DIR__).'/SiteControlSnapshots.php';
                    \scRestoreProjection($this->db,['pages'=>$manifest['projection']['after']]);
                    $this->db->insert('agent_revision_projections',[
                        'revision_id'=>$revisionId,
                        'before_json'=>CanonicalJson::encode($recovery['pages']),
                        'after_json'=>CanonicalJson::encode($manifest['projection']['after']),
                        'before_collections_json'=>CanonicalJson::encode($recovery['collection_indexes']),
                        'after_collections_json'=>CanonicalJson::encode($this->db->query('SELECT id, index_page_id FROM collections ORDER BY id')),
                    ]);
                } else $this->files->syncPageRegistry(true);
                $this->hook('after_projection',$operation);
                $this->policy->require($actor,array_values(array_unique($scopes)));
                $this->operations->finish($actor,$operation['operation_id'],$operation['lease_token'],'succeeded',[
                    'operation_id'=>$operation['operation_id'],'actor'=>$actor->attribution(),
                    'before_version'=>$manifest['base_draft_version'],'after_version'=>$afterVersion,
                    'changed_paths'=>array_column($manifest['files'],'path'),'revision_id'=>$revisionId,
                    'change_set_id'=>$change['id'],'digest'=>$change['sealed_digest'],'provider_calls'=>0,
                    'validation'=>$change['payload']['validation'],'restoration'=>['required'=>false,'restored'=>null],
                ],$afterVersion,function () use ($actor,$operation,$change,$recovery,$revisionId): void {
                    if ($this->db->update('site_workspace_state',['draft_version'=>$recovery['draft_version']+1,'updated_at'=>time()],
                        'id = 1 AND draft_version = ?',[$recovery['draft_version']])!==1) throw new OperationException('content_conflict','Draft version changed during commit.');
                    $this->changes->markApplied($actor,$change['id']);
                    $this->db->insert('agent_revision_attribution',['revision_id'=>$revisionId,'operation_id'=>$operation['id'],
                        'actor_json'=>CanonicalJson::encode($actor->attribution()),'created_at'=>time()]);
                });
            });
        $this->hook('after_commit',$operation);
        return ['committed'=>true];
    }

    private function verifyStaging(array $change): void
    {
        $root=$this->changes->stagingRoot($change['id']);
        foreach ($change['manifest']['files'] as $entry) {
            foreach (['before'=>'before','after'=>'draft'] as $side=>$directory) {
                if ($entry[$side.'_hash']===null) continue;
                $source=SiteWorkspace::resolveWithin($root.'/'.$directory,$entry['path']);
                if (!is_file($source) || hash_file('sha256',$source)!==$entry[$side.'_hash']) throw new OperationException('content_conflict','Retained review or recovery bytes failed verification.',['path'=>$entry['path']]);
            }
        }
    }

    private function consistentPartialState(array $operation): bool
    {
        $recovery=$operation['recovery'];
        if (!$recovery) return true; // No writes were permitted before recovery capture.
        if (CanonicalJson::digest($this->db->query('SELECT * FROM pages ORDER BY id')) !== CanonicalJson::digest($recovery['pages'])
            || (isset($recovery['collection_indexes']) && CanonicalJson::digest($this->db->query('SELECT id, index_page_id FROM collections ORDER BY id')) !== CanonicalJson::digest($recovery['collection_indexes']))) return false;
        $current=WorkspaceFiles::hashes(WorkspaceFiles::read($this->workspace));
        foreach (array_unique(array_merge(array_keys($current),array_keys($recovery['before']),array_keys($recovery['after']))) as $path) {
            if (($current[$path]??null)!==($recovery['before'][$path]??null)
                && ($current[$path]??null)!==($recovery['after'][$path]??null)) return false;
        }
        return true;
    }

    /** Trusted rollback-only seam; cannot be used as normal actor continuation. */
    public function restoreForOwnerRecovery(array $operation): array
    {
        OwnerRecoveryService::assertClaim($this->db, $this->workspace, $operation);
        return $this->restore($operation);
    }

    private function restore(array $operation): array
    {
        $recovery=$operation['recovery'];
        if (!$recovery) return ['restored'=>true,'remaining_paths'=>[]];
        $root=$this->changes->stagingRoot($recovery['change_set_id']);$remaining=[];
        foreach ($recovery['files'] as $entry) {
            $path=$entry['path'];
            try {
                $target=$this->workspace->resolveDraft($path,true);
                $current=is_file($target)?hash_file('sha256',$target):null;
                if ($current!==$entry['before_hash'] && $current!==$entry['after_hash']) {
                    throw new \RuntimeException('Affected file contains unrelated changes.');
                }
                if ($current===$entry['before_hash']) continue;
                if ($entry['before_hash']===null) {
                    if (is_file($target)) $this->files->deleteFile($path);
                } else {
                    $source=SiteWorkspace::resolveWithin($root.'/before',$path);
                    $content=is_file($source)?file_get_contents($source):false;
                    if ($content===false || hash('sha256',$content)!==$entry['before_hash']) throw new \RuntimeException('Original bytes unavailable.');
                    if (!is_dir(dirname($target)) && !mkdir(dirname($target),0755,true)) throw new \RuntimeException('Cannot restore directory.');
                    $this->files->writeExactFile($path,$content);
                }
                if ((is_file($target)?hash_file('sha256',$target):null)!==$entry['before_hash']) throw new \RuntimeException('Restore verification failed.');
            } catch (\Throwable) { $remaining[]=$path; }
        }
        try {
            // Projection commits atomically with operation success. During an
            // unfinished operation it must still equal the captured original;
            // unrelated SQL changes require explicit repair, never clobbering.
            if (CanonicalJson::digest($this->db->query('SELECT * FROM pages ORDER BY id')) !== CanonicalJson::digest($recovery['pages'])
                || (isset($recovery['collection_indexes']) && CanonicalJson::digest($this->db->query('SELECT id, index_page_id FROM collections ORDER BY id')) !== CanonicalJson::digest($recovery['collection_indexes']))) {
                throw new \RuntimeException('Page relationships contain unrelated changes.');
            }
            require_once dirname(__DIR__).'/SiteControlSnapshots.php';
            \scRestoreProjection($this->db,['pages'=>$recovery['pages'],'collection_indexes'=>$recovery['collection_indexes'] ?? []]);
            if (WorkspaceFiles::hashes(WorkspaceFiles::read($this->workspace))!==$recovery['before']) $remaining[]='workspace_manifest';
        } catch (\Throwable) { $remaining[]='page_projection'; }
        return ['restored'=>$remaining===[],'remaining_paths'=>array_values(array_unique($remaining))];
    }

    private function hook(string $phase,array $operation): void
    {
        if ($this->testHook!==null) ($this->testHook)($phase,$operation);
    }
}
