<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, FileManager, SiteMutationLock, SiteWorkspace, TailwindCompiler};

/** Stage all transformations and derived files before sealing the review digest. */
final class ChangeSetService
{
    public function __construct(private Database $db, private ActorPolicy $policy,
        private SiteWorkspace $workspace, private BriefStore $briefs, private ChangeSetStore $store,
        private ?\Closure $assetReader = null) {}

    public static function inputSchema(): array
    {
        $fields = [
            'request_id'=>['type'=>'string','pattern'=>'^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$'],
            'base_draft_version'=>['type'=>'string','pattern'=>'^draft:[0-9]+$'],
            'brief_id'=>['type'=>'string','pattern'=>'^brief_[a-f0-9]{32}$'],
            'summary'=>['type'=>'string','minLength'=>1,'maxLength'=>500],
            'operations'=>['type'=>'array','minItems'=>1,'maxItems'=>100,'items'=>ChangeSetValidator::operationSchema()],
        ];
        return ['type'=>'object','properties'=>$fields,'required'=>array_keys($fields),'additionalProperties'=>false];
    }

    public function prepare(OperationActor $actor, \stdClass $request): array
    {
        JsonSchema::validate($request,self::inputSchema());
        return $this->prepareInternal($actor,$request,null,null);
    }

    /**
     * Server-only deterministic planner seam. The callable cannot come from JSON,
     * and its projection is sealed with the exact source bytes before review.
     */
    public function prepareTrusted(OperationActor $actor, \stdClass $request, \Closure $planner): array
    {
        $this->policy->require($actor,['structure:write','site:read','files:read']);
        return $this->prepareInternal($actor,$request,$planner,'structure');
    }

    /** Server-only asset planner. This grants no structure or root SEO authority. */
    public function prepareAssets(OperationActor $actor, \stdClass $request, \Closure $planner): array
    {
        $this->policy->require($actor,['assets:read','assets:write','files:read']);
        return $this->prepareInternal($actor,$request,$planner,'assets');
    }

    /** Server-only schema planner. Form changes remain private draft changes. */
    public function prepareForms(OperationActor $actor, \stdClass $request, \Closure $planner): array
    {
        $this->policy->require($actor,['forms:read','forms:write','files:read']);
        return $this->prepareInternal($actor,$request,$planner,'forms');
    }

    /** Server-only editor planner: exact hashes, no structure or SEO elevation. */
    public function prepareFiles(OperationActor $actor, \stdClass $request, \Closure $planner): array
    {
        $this->policy->require($actor,['files:read','files:write','changes:apply']);
        return $this->prepareInternal($actor,$request,$planner,'files');
    }

    private function prepareInternal(OperationActor $actor, \stdClass $request, ?\Closure $planner, ?string $purpose): array
    {
        return ProviderCallPolicy::runExternal(function () use ($actor,$request,$planner,$purpose): array {
            $this->policy->require($actor,$planner === null ? ['files:write','changes:apply','context:read'] : ['files:write','changes:apply',$purpose.':write']);
            $lock = SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);
            $this->workspace->assertReady();
            $row = $this->store->reserve($actor,(array)$request);
            if (in_array($row['status'],['ready','applied'],true)) return $row['payload'];
            try {
                $version = 'draft:' . $this->workspace->status()['draft_version'];
                if ($request->base_draft_version !== $version) throw new OperationException('content_conflict','The draft version changed. Read its current context and prepare again.');
                $brief = $planner === null ? $this->briefs->get($actor,$request->brief_id) : ['base_draft_version'=>$version,'rules_digest'=>CanonicalJson::digest(['planner'=>'site-'.$purpose.'-v1'])];
                if ($brief['base_draft_version'] !== $version) throw new OperationException('content_conflict','The authoring brief describes an older draft. Request a fresh brief.');
                $before = WorkspaceFiles::read($this->workspace);
                $planned = $planner === null ? null : $planner($before);
                if (isset($planned['asset_references'])) {
                    if ($purpose !== 'assets') throw new \LogicException('Only the asset planner may retain asset references.');
                    JsonSchema::validate(json_decode(CanonicalJson::encode($planned['asset_references']),false,32,JSON_THROW_ON_ERROR),ToolContracts::assetReferences());
                    if (strlen(CanonicalJson::encode($planned['asset_references']))>65536) throw new OperationException('size_limit','Asset reference effects exceed the 64 KiB review limit.');
                }
                $requestedOperations = $planned['operations'] ?? $request->operations;
                $validator = new ChangeSetValidator();
                $readScopes = match($purpose) {'structure'=>['files:read','site:read'],'assets'=>['files:read','assets:read'],default=>['files:read']};
                foreach ($planned['asset_references']??[] as $reference) {
                    if (SitePathPolicy::type($reference['source_file'])==='forms') {
                        $this->policy->require($actor,['forms:read']);
                        $readScopes[]='forms:read';
                    }
                }
                foreach ($requestedOperations as $requestedOperation) {
                    if ($purpose==='forms' && SitePathPolicy::type($requestedOperation->path)!=='forms') {
                        throw new \LogicException('The form planner can change form schemas only.');
                    }
                    $path = SitePathPolicy::canonical($requestedOperation->path,!($purpose === 'structure' && SitePathPolicy::type($requestedOperation->path) === 'seo'));
                    $type = SitePathPolicy::type($path);
                    if ($type === 'forms') {
                        $this->policy->require($actor,['forms:read','forms:write']);
                        $readScopes[] = 'forms:read';
                    }
                    if ($type === 'binary') {
                        $this->policy->require($actor,['assets:read','assets:write']);
                        $readScopes[] = 'assets:read';
                    }
                }
                $assetReader = function (string $uploadId,string $path) use ($actor,$planned,$purpose): string {
                    $trusted = $purpose === 'assets' ? ($planned['assets'][$uploadId] ?? null) : null;
                    if ($trusted !== null) {
                        if (($trusted['path'] ?? null) !== $path || !is_string($trusted['content'] ?? null)) throw new \LogicException('Trusted asset bytes must bind to one exact destination.');
                        return $trusted['content'];
                    }
                    if ($this->assetReader === null) throw new OperationException('feature_disabled','Asset transfer is unavailable on this connection.');
                    return ($this->assetReader)($actor,$uploadId,$path);
                };
                $projectionChanged = isset($planned['projection']) && CanonicalJson::digest($planned['projection']['before']) !== CanonicalJson::digest($planned['projection']['after']);
                if($purpose==='structure'&&$requestedOperations===[]&&!$projectionChanged)
                    throw new OperationException('invalid_schema','This page change has no effect on the current draft.');
                $resolved = $requestedOperations === [] && (($purpose === 'files' && $request->intent->action === 'compile') || ($purpose === 'structure' && $projectionChanged))
                    ? [] : $validator->resolve($requestedOperations,$before,$assetReader,$purpose === 'structure');
                $proposed = $before;
                foreach ($resolved as $path=>$operation) {
                    if ($operation['content'] === null) unset($proposed[$path]);
                    else $proposed[$path] = $operation['content'];
                }
                if (count($proposed) > WorkspaceFiles::MAX_FILES || array_sum(array_map('strlen',$proposed)) > WorkspaceFiles::MAX_BYTES) {
                    throw new OperationException('size_limit','The proposed draft exceeds 500 files or 32 MiB. Reduce the change before preparing it.');
                }
                unset($proposed);
                // Retry removes both original and proposed leftovers but keeps the
                // same reservation continuously accounted throughout this attempt.
                $this->store->discardIncomplete($actor,$row['id'],false);
                $stageParent = $this->store->stagingRoot($row['id'],true);
                $stageRoot = $stageParent . '/draft';
                if (!mkdir($stageRoot . '/assets',0700,true)) throw new OperationException('host_capability_unavailable','Cannot create the private review workspace.');
                WorkspaceFiles::write($stageRoot,'.htaccess',SiteWorkspace::ACCESS_MARKER . "\nRequire all denied\nDeny from all\n");
                foreach ($before as $path=>$content) WorkspaceFiles::write($stageRoot,$path,$content);
                $stagedWorkspace = new SiteWorkspace($this->db,$stageRoot,$this->workspace->publishedRoot(),
                    $stageParent . '/state',$this->workspace->publishedAssetsRoot(),tracksDraftVersion:false);
                // Dependency injection is mandatory; an older FileManager must
                // fail before PHP could silently ignore a second argument.
                $constructor = new \ReflectionMethod(FileManager::class,'__construct');
                if ($constructor->getNumberOfParameters() < 2) throw new \LogicException('Private staging requires the workspace-aware FileManager.');
                $files = new FileManager($this->db,$stagedWorkspace);
                foreach ($resolved as $path=>$operation) {
                    if ($operation['content'] === null) {
                        $target = $stagedWorkspace->resolveDraft($path,true);
                        if (is_file($target) && !unlink($target)) throw new OperationException('host_capability_unavailable','Cannot stage a file deletion.');
                    } elseif ($operation['binary'] || $operation['type'] === 'merge' || SitePathPolicy::type($path) === 'seo') {
                        WorkspaceFiles::write($stageRoot,$path,$operation['content']);
                    } else {
                        $warning = $files->writeFile($path,$operation['content']);
                        if ($warning !== null) throw new OperationException('invalid_schema','The normalized PHP source is invalid. Correct it before preparing again.',['path'=>$path]);
                    }
                    $this->stagedSourceBytes($stageRoot);
                }
                // Shipped behavior and compilation are part of the reviewed bytes.
                $files->ensureShippedNavigation();
                $files->ensureShippedIconResolver();
                $sourceBytes = $this->stagedSourceBytes($stageRoot);
                $compiledPath = $stagedWorkspace->draftAssetsRoot() . '/css/tailwind.css';
                $oldCompiledBytes = is_file($compiledPath) ? filesize($compiledPath) : 0;
                $cssLimit = min(ChangeSetValidator::MAX_FILE_BYTES,WorkspaceFiles::MAX_BYTES - $sourceBytes + $oldCompiledBytes);
                $compiler = new TailwindCompiler($stagedWorkspace->draftAssetsRoot() . '/css');
                if (($compiler->compile($stageRoot,$compiledPath,$cssLimit)['ok'] ?? false) !== true) {
                    throw new OperationException('host_capability_unavailable','Tailwind compilation failed. No draft or published files changed.');
                }
                $after = WorkspaceFiles::read($stagedWorkspace);
                foreach ($after as $path=>$content) {
                    if (SitePathPolicy::type($path) !== 'binary') {
                        if (strlen($content) > ChangeSetValidator::MAX_FILE_BYTES) throw new OperationException('size_limit','A retained text file exceeds 1 MiB. Reduce its size before preparing a review.',['path'=>$path]);
                        if (($before[$path] ?? null) !== $content) $validator->validateContent($path,$content);
                    }
                }
                $warnings = $validator->dependencies($after,$before);
                $beforeHashes = WorkspaceFiles::hashes($before);
                $afterHashes = WorkspaceFiles::hashes($after);
                $changed = []; $derived = []; $transformations = [];
                foreach (array_unique(array_merge(array_keys($before),array_keys($after))) as $path) {
                    if (($beforeHashes[$path] ?? null) === ($afterHashes[$path] ?? null)) continue;
                    $changed[] = ['path'=>$path,'effect'=>!isset($before[$path]) ? 'create' : (!isset($after[$path]) ? 'delete':'replace'),
                        'before_hash'=>$beforeHashes[$path] ?? null,'after_hash'=>$afterHashes[$path] ?? null,
                        'before_bytes'=>isset($before[$path]) ? strlen($before[$path]):0,
                        'after_bytes'=>isset($after[$path]) ? strlen($after[$path]):0];
                    if (!isset($resolved[$path])) $derived[] = $path;
                    elseif (($afterHashes[$path] ?? null) !== $resolved[$path]['proposed_hash']) $transformations[] = $path;
                }
                if (!$changed && !$projectionChanged && $purpose !== 'files') throw new OperationException('invalid_schema','This change set has no effect on the current draft.');
                // Recheck the whole source set after compilation, including
                // legacy/out-of-process edits that did not bump draft_version.
                if (WorkspaceFiles::hashes(WorkspaceFiles::read($this->workspace)) !== $beforeHashes) throw new OperationException('content_conflict','The workspace changed during preparation. Prepare again from the current draft.');
                $manifest = ['format'=>1,'change_set_id'=>$row['id'],'actor_key'=>$actor->identity(),
                    'base_draft_version'=>$version,'brief_id'=>$request->brief_id,
                    'rules_digest'=>$purpose === 'files' ? (new \VoxelSite\AuthoringRules())->external('edit_page')['sha256'] : $brief['rules_digest'],'read_scopes'=>array_values(array_unique($readScopes)),
                    'before'=>$beforeHashes,'after'=>$afterHashes,'files'=>$changed,
                    'derived_files'=>$derived,'normalized_files'=>$transformations,'summary'=>$request->summary,'expires_at'=>(int)$row['expires_at']];
                if ($planned !== null) {
                    $manifest['required_write_scopes'] = [$purpose.':write'];
                    $manifest['intent'] = (array)$request->intent;
                    if (isset($planned['projection'])) {
                        if ($purpose !== 'structure') throw new \LogicException('Only the structure planner may retain a page projection.');
                        $manifest['projection'] = $planned['projection'];
                        if (CanonicalJson::digest($this->db->query('SELECT * FROM pages ORDER BY id')) !== CanonicalJson::digest($planned['projection']['before'])) {
                            throw new OperationException('content_conflict','Page metadata changed during preparation.');
                        }
                    }
                }
                $payload = ['change_set_id'=>$row['id'],'base_draft_version'=>$version,'status'=>'ready',
                    'expires_at'=>(int)$row['expires_at'],'files'=>$changed,'derived_files'=>$derived,'normalized_files'=>$transformations,
                    'validation'=>['blocking'=>[],'warnings'=>$warnings,'not_run'=>['browser_visual_review','external_design_review','external_accessibility_review']],
                    'diff_resource'=>'voxelsite://changes/' . $row['id'] . '/diff','provider_calls'=>0];
                if ($purpose==='assets') {
                    $manifest['asset_references']=$planned['asset_references']??[];
                    $payload['asset_references']=$manifest['asset_references'];
                }
                if(isset($manifest['projection'])) {
                    $pageChanges=ToolContracts::pageChanges($manifest['projection']['before'],$manifest['projection']['after']);
                    if(strlen(CanonicalJson::encode($pageChanges))>262144)throw new OperationException('size_limit','Page metadata review exceeds 256 KiB.');
                    $payload['page_changes']=$manifest['page_changes']=$pageChanges;
                }
                // Retain originals for the complete review and recovery.
                $retainedBytes = array_sum(array_map('strlen',$after));
                foreach ($changed as $file) {
                    if (isset($before[$file['path']])) {
                        if (SitePathPolicy::type($file['path']) !== 'binary' && strlen($before[$file['path']]) > ChangeSetValidator::MAX_FILE_BYTES) {
                            throw new OperationException('size_limit','The original text exceeds the reviewable 1 MiB limit. Reduce it through Studio first.',['path'=>$file['path']]);
                        }
                        WorkspaceFiles::write($stageParent . '/before',$file['path'],$before[$file['path']]);
                        $retainedBytes += strlen($before[$file['path']]);
                    }
                }
                $retained = $this->store->seal($actor,$row['id'],$manifest,$payload,$retainedBytes);
                return $retained['payload'];
            } catch (\Throwable $e) {
                try { $this->store->discardIncomplete($actor,$row['id']); }
                catch (\Throwable) {
                    throw new OperationException('recovery_required','Incomplete private staging could not be cleared. Its storage reservation is retained. Inspect this preparation in Studio.',['change_set_id'=>$row['id']]);
                }
                throw $e;
            }
        });
    }

    public function get(OperationActor $actor,string $id): array
    {
        $row = $this->store->get($actor,$id);
        if (!in_array($row['status'],['ready','applied'],true)) throw new OperationException('content_conflict','This preparation is incomplete. Retry its original prepare request.');
        return $row['payload'];
    }

    /** Whole-response budgets; each continuation can select its own source side. */
    public function readDiff(OperationActor $actor,string $id,string $path,int $offset=0,int $maxBytes=16384,?string $side=null): array
    {
        $row = $this->store->get($actor,$id);
        if (!in_array($row['status'],['ready','applied'],true)) throw new OperationException('content_conflict','This review is not ready.');
        SitePathPolicy::canonical($path);
        $type = SitePathPolicy::type($path);
        if ($type === 'forms') $this->policy->require($actor,['forms:read']);
        if ($type === 'binary') $this->policy->require($actor,['assets:read']);
        $entry = array_values(array_filter($row['manifest']['files'],static fn ($item)=>$item['path'] === $path))[0] ?? null;
        if ($entry === null) throw new OperationException('invalid_path','This file is not part of the retained review.');
        if ($offset < 0 || $maxBytes < 2048 || $maxBytes > 65536 || !in_array($side,[null,'before','after'],true)) {
            throw new OperationException('invalid_schema','Use a nonnegative byte offset, a 2048–65536 byte response budget, and an optional before/after side.');
        }
        $binary = $type === 'binary';
        $sources = []; $sides = [];
        foreach (['before'=>'before','after'=>'draft'] as $name=>$directory) {
            if ($side !== null && $side !== $name) continue;
            $hash = $entry[$name . '_hash'];
            if ($hash === null) { $sides[$name] = null; continue; }
            $absolute = SiteWorkspace::resolveWithin($this->store->stagingRoot($id) . '/' . $directory,$path);
            $size = is_file($absolute) ? filesize($absolute) : false;
            $limit = $binary ? WorkspaceFiles::MAX_BYTES : ChangeSetValidator::MAX_FILE_BYTES;
            if ($size === false || $size > $limit) throw new OperationException('content_conflict','Retained file size is missing or exceeds its qualified read limit.');
            $source = $binary ? null : file_get_contents($absolute,false,null,0,$limit+1);
            if ($source === false) throw new OperationException('host_capability_unavailable','Cannot read the retained source.');
            $actualHash = $source === null ? hash_file('sha256',$absolute) : hash('sha256',$source);
            if (!is_string($actualHash) || !hash_equals($hash,$actualHash)
                || ($source !== null && (strlen($source) !== $size || !mb_check_encoding($source,'UTF-8')))) {
                throw new OperationException('content_conflict','Retained file integrity verification failed.');
            }
            if (($binary && $offset !== 0) || (!$binary && ($offset > $size || !mb_check_encoding(substr($source,0,$offset),'UTF-8')))) {
                throw new OperationException('invalid_schema','Use this side’s returned next_offset at a UTF-8 boundary. Select before or after when continuing different source lengths.',['side'=>$name]);
            }
            $sources[$name] = $source;
            $sides[$name] = ['hash'=>$hash,'bytes'=>$size,'binary'=>$binary,'content'=>$binary ? null : '',
                'offset'=>$offset,'next_offset'=>!$binary && $offset<$size ? $offset:null,'truncated'=>!$binary && $offset<$size];
        }
        $response = ['change_set_id'=>$id,'digest'=>$row['sealed_digest'],'path'=>$path,'sides'=>$sides,'max_bytes'=>$maxBytes];
        $candidate = function (int $length) use ($response,$sources,$offset): array {
            foreach ($sources as $name=>$source) {
                if ($source === null) continue;
                $content = mb_strcut($source,$offset,$length,'UTF-8');
                $end = $offset + strlen($content);
                $response['sides'][$name]['content'] = $content;
                $response['sides'][$name]['next_offset'] = $end < strlen($source) ? $end : null;
                $response['sides'][$name]['truncated'] = $end < strlen($source);
            }
            return $response;
        };
        if (strlen(CanonicalJson::encode($response)) > $maxBytes) throw new OperationException('size_limit','Increase the review response budget.');
        $low=0; $high=$maxBytes;
        while ($low<$high) {
            $middle=intdiv($low+$high+1,2);
            if (strlen(CanonicalJson::encode($candidate($middle))) <= $maxBytes) $low=$middle;
            else $high=$middle-1;
        }
        $response=$candidate($low);
        foreach ($response['sides'] as $sourceSide) {
            if ($sourceSide !== null && $sourceSide['truncated'] && $sourceSide['content'] === '') {
                throw new OperationException('size_limit','Increase the review response budget to include source content.');
            }
        }
        return $response;
    }

    /** Check generated source size without rereading or hashing the complete draft. */
    private function stagedSourceBytes(string $root): int
    {
        $bytes=0; $files=0; $entries=0;
        $walk = function (string $directory) use (&$walk,&$bytes,&$files,&$entries,$root): void {
            foreach (new \DirectoryIterator($directory) as $entry) {
                if ($entry->isDot()) continue;
                if (++$entries > WorkspaceFiles::MAX_FILES*3) throw new OperationException('size_limit','Generated staging exceeds its directory budget.');
                $relative=\VoxelSite\FilesystemPath::relative($entry->getPathname(),$root);
                $path=SiteWorkspace::resolveWithin($root,$relative);
                if (is_dir($path)) { $walk($path); continue; }
                if ($relative === '.htaccess') continue;
                if (!is_file($path)) throw new OperationException('invalid_path','Staging contains an unsupported filesystem entry.');
                $bytes+=filesize($path);
                if (++$files > WorkspaceFiles::MAX_FILES || $bytes > WorkspaceFiles::MAX_BYTES) {
                    throw new OperationException('size_limit','Generated staging exceeds 500 files or 32 MiB. Split the change into smaller preparations.');
                }
            }
        };
        $walk($root);
        return $bytes;
    }
}
