<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,Settings,SiteMutationLock,SiteWorkspace};

/** A site reset is a retained file operation followed by one atomic projection commit. */
final class ResetService
{
    private OperationRunner $runner;
    public const SCOPES=['reset:site'];
    public const MAX_STORAGE=134217728;
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,
        private AdminApprovalStore $approvals,private OperationStore $operations,private ResetInventory $inventory,
        private string $root,private int $filesPerStep=20,private ?\Closure $testHook=null)
    {
        if($filesPerStep<1||$filesPerStep>100)throw new \InvalidArgumentException('Invalid reset checkpoint budget.');
        SiteWorkspace::resolveWithin($root,'.reset-path-check');
        $this->runner=new OperationRunner($db,$policy,$operations,$workspace->mutationLockPath());
    }
    public static function inputSchema(string $method):array
    {
        $c=ToolContracts::class;
        return match($method){
            'prepare'=>$c::object(['operation_id'=>$c::requestId(),'base_draft_version'=>$c::version()]),
            'get'=>$c::object(['plan_id'=>$c::id('admin')]),
            'apply'=>$c::object(['plan_id'=>$c::id('admin'),'digest'=>$c::hash()]),
            default=>throw new \InvalidArgumentException('Unknown reset method.'),
        };
    }
    public static function resultSchema():array
    {
        $c=ToolContracts::class;
        return $c::object(['reset'=>['const'=>'site'],'plan_id'=>$c::id('admin'),'release_id'=>$c::id('release'),
            'files_changed'=>$c::integer(ResetInventory::MAX_FILES),'tables_cleared'=>$c::list($c::text(100),20),
            'draft_version'=>$c::version(),'provider_calls'=>['const'=>0]]);
    }
    public function prepare(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('prepare'));$this->policy->require($actor,self::SCOPES);
        $requestDigest=CanonicalJson::digest($input);
        $prior=$this->db->queryOne('SELECT * FROM agent_reset_plans WHERE actor_key=? AND request_id=?',[$actor->identity(),$input->operation_id]);
        if($prior){
            if(!hash_equals($prior['request_digest'],$requestDigest))throw new OperationException('idempotency_conflict','This reset ID belongs to a different review.');
            if($prior['status']==='expired')throw new OperationException('review_expired','This reset review expired. Use a new request ID.');
            if($prior['approval_id']!==null)return $this->approvals->get($actor,$prior['approval_id']);
            if((int)$prior['expires_at']<=time())throw new OperationException('review_expired','This incomplete reset review expired. Use a new request ID.');
        }
        (new MaintenanceService($this->db,$this->policy,$this->workspace,dirname($this->root)))->run($actor);
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);
        $this->workspace->assertReady();
        if($input->base_draft_version!=='draft:'.$this->workspace->status()['draft_version'])
            throw new OperationException('content_conflict','The draft changed. Review the current version before resetting.');
        $row=$prior??$this->db->transaction(function()use($actor,$input,$requestDigest):array{
            if((int)$this->db->scalar('SELECT COALESCE(SUM(staged_bytes),0) FROM agent_reset_plans')+ResetInventory::MAX_BYTES>self::MAX_STORAGE)
                throw new OperationException('size_limit','Retained reset storage is full. Review retention before preparing another reset.');
            $row=['id'=>'reset_'.bin2hex(random_bytes(16)),'actor_key'=>$actor->identity(),'request_id'=>$input->operation_id,
                'request_digest'=>$requestDigest,'status'=>'preparing','staged_bytes'=>ResetInventory::MAX_BYTES,'created_at'=>time(),'expires_at'=>time()+900];
            $this->db->insert('agent_reset_plans',$row);return $row;
        });
        if($row['manifest_json']??null)$manifest=$this->manifest($row);
        else{
            $stage=$this->stage($row['id'],true);
            $this->clearIncomplete($stage);
            $manifest=$this->inventory->capture($stage);
            $json=CanonicalJson::encode($manifest);
            if(strlen($json)>1048576)throw new OperationException('size_limit','Reset inventory exceeds its review budget.');
            $this->db->update('agent_reset_plans',['status'=>'ready','manifest_json'=>$json,'digest'=>CanonicalJson::digest($manifest),
                'staged_bytes'=>$manifest['staged_bytes']+strlen($json)],'id = ?',[$row['id']]);
        }
        $files=array_map(fn($file)=>['path'=>$file['domain'].'/'.$file['path']]+array_intersect_key($file,array_flip(
            ['effect','before_hash','after_hash','before_bytes','after_bytes'])),$manifest['files']);
        $tables=[];foreach($manifest['tables'] as $name=>$data)$tables[]=['name'=>$name]+$data;
        $review=$this->approvals->prepare($actor,$input->operation_id,'site.reset',
            ['reset_id'=>$row['id'],'digest'=>CanonicalJson::digest($manifest)],
            ['summary'=>'Reset the generated website and its business records.',
                'effects'=>['Remove the exact reviewed draft, managed live content, Action definitions and legacy history files.',
                    'Clear the reviewed page, conversation, revision, snapshot and collection rows.',
                    'Clear form and Action records while retaining retry and delivery receipts.',
                    'Replace the managed homepage with the shipped landing page.'],
                'preserved'=>$manifest['preserved'],'secret_fields'=>[],'files'=>$files,'tables'=>$tables],self::SCOPES);
        $this->db->update('agent_reset_plans',['approval_id'=>$review['plan_id']],'id = ?',[$row['id']]);
        return $review;
    }
    public function get(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('get'));$this->policy->require($actor,self::SCOPES);
        $review=$this->approvals->get($actor,$input->plan_id);
        if($review['action']!=='site.reset')throw new OperationException('invalid_schema','Choose a site reset review.');
        return $review;
    }
    public function apply(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('apply'));$this->policy->require($actor,self::SCOPES);
        $review=$this->get($actor,(object)['plan_id'=>$input->plan_id]);
        if(!hash_equals($review['digest'],$input->digest))throw new OperationException('content_conflict','Use the exact reset review digest.');
        if($review['status']==='authorized'){
            $operation=$this->operations->get($actor,$review['result']['operation_id']);
            if($operation['state']!=='prepared')return OperationRunner::publicState($operation);
            return $this->runner->start($actor,$operation['operation_id'],'site.reset',(object)$operation['request'],
                $operation['before_version'],$operation['preparation_id'],self::SCOPES,
                fn($row)=>$this->step($actor,$row),$this->restore(...));
        }
        // Lock before receipt consumption. A conflict leaves the review unconsumed.
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);
        $approval=$this->approvals->authorizeExecution($actor,$input->plan_id,$input->digest,
            function(array $payload,array $approval)use($actor):string{
                if($approval['action']!=='site.reset')throw new OperationException('invalid_schema','Choose a site reset review.');
                $row=$this->plan($payload['reset_id']);$manifest=$this->manifest($row);
                if(!hash_equals($row['digest'],$payload['digest']))throw new OperationException('content_conflict','Reset manifest changed after review.');
                $this->assertBefore($manifest);
                $this->verifyRetained($row,$manifest);
                $this->operations->prepare($actor,$approval['operation_id'],'site.reset',
                    (object)['plan_id'=>$approval['id'],'reset_id'=>$row['id'],'digest'=>$row['digest']],
                    'draft:'.$manifest['draft_version'],$row['id']);
                return $approval['operation_id'];
            });
        $operation=$this->operations->get($actor,$approval['result']['operation_id']);
        return $this->runner->start($actor,$operation['operation_id'],'site.reset',(object)$operation['request'],
            $operation['before_version'],$operation['preparation_id'],self::SCOPES,
            fn($row)=>$this->step($actor,$row),$this->restore(...));
    }
    public function continue(OperationActor $actor,string $id,int $checkpoint):array
    {
        return $this->runner->continue($actor,$id,$checkpoint,self::SCOPES,
            fn($row)=>$this->step($actor,$row),$this->restore(...),$this->verifyInterrupted(...));
    }
    public function recover(OperationActor $actor,string $id):array
    {return $this->runner->recover($actor,$id,self::SCOPES,$this->restore(...));}
    private function step(OperationActor $actor,array $operation):array
    {
        $row=$this->plan($operation['preparation_id']);$manifest=$this->manifest($row);
        if($operation['kind']!=='site.reset' || $operation['request']['digest']!==$row['digest'])
            throw new OperationException('content_conflict','The operation does not match its reset manifest.');
        $cursor=(int)($operation['checkpoint']['cursor']??0);
        if(!$operation['recovery']){
            $this->assertBefore($manifest);$this->verifyRetained($row,$manifest);
            $this->operations->recordRecovery($actor,$operation['operation_id'],$operation['lease_token'],
                ['reset_id'=>$row['id'],'digest'=>$row['digest']]);
        }
        $end=min(count($manifest['files']),$cursor+$this->filesPerStep);
        for($i=$cursor;$i<$end;$i++){
            $file=$manifest['files'][$i];$current=$this->fileHash($file);
            if($current!==$file['before_hash'] && $current!==$file['after_hash'])
                throw new OperationException('content_conflict','A reviewed reset path changed.',['path'=>$file['domain'].'/'.$file['path']]);
            $this->install($row,$file,'after');
            if($this->testHook)($this->testHook)('after_file',$file);
        }
        if($end<count($manifest['files']))return ['complete'=>false,'phase'=>'reset_files','checkpoint'=>['cursor'=>$end],
            'recovery'=>['reset_id'=>$row['id'],'digest'=>$row['digest']]];
        foreach($manifest['files'] as $file)if($this->fileHash($file)!==$file['after_hash'])
            throw new OperationException('content_conflict','A reset output changed before completion.');
        $releaseId='release_'.substr(hash('sha256',$operation['id']),0,32);
        $afterVersion='draft:'.($manifest['draft_version']+1);
        $result=['reset'=>'site','plan_id'=>$row['approval_id'],'release_id'=>$releaseId,
            'files_changed'=>count($manifest['files']),'tables_cleared'=>array_keys($manifest['tables']),
            'draft_version'=>$afterVersion,'provider_calls'=>0];
        $this->operations->finish($actor,$operation['operation_id'],$operation['lease_token'],'succeeded',$result,$afterVersion,
            function()use($actor,$row,$manifest,$operation,$releaseId):void{
                $this->policy->require($actor,self::SCOPES);
                if(CanonicalJson::digest($this->inventory->tables())!==CanonicalJson::digest($manifest['tables']))throw new OperationException('content_conflict','Reset table contents changed after review.');
                foreach(array_keys($manifest['tables']) as $table)$this->db->exec('DELETE FROM '.$table);
                $settings=new Settings($this->db);$settings->set('revision_pointer',0);$settings->set('last_published_at','');
                if($this->db->update('site_workspace_state',['draft_version'=>$manifest['draft_version']+1,'release_id'=>$releaseId,'updated_at'=>time()],
                    'id = 1 AND draft_version = ? AND release_id IS ?',[$manifest['draft_version'],$manifest['release_id']])!==1)
                    throw new OperationException('content_conflict','Reset workspace version changed.');
                $this->db->insert('site_releases',['id'=>$releaseId,'plan_id'=>$row['id'],'operation_id'=>$operation['id'],
                    'actor_json'=>CanonicalJson::encode($actor->attribution()),'before_release_id'=>$manifest['release_id'],
                    'draft_version'=>$manifest['draft_version']+1,'manifest_json'=>CanonicalJson::encode($manifest['live_after']),
                    'digest'=>CanonicalJson::digest($manifest['live_after']),'created_at'=>time()]);
                $this->db->update('agent_reset_plans',['status'=>'completed'],'id = ?',[$row['id']]);
                if($this->testHook)($this->testHook)('after_projection',[]);
            });
        if($this->testHook)($this->testHook)('after_commit',[]);
        return ['committed'=>true];
    }
    /** Trusted repair only; this never resumes a destructive reset. */
    public function recoveryView(array $operation):array
    {
        $row=$this->plan($operation['preparation_id']);$manifest=$this->manifest($row);
        if(($operation['recovery']['digest']??null)!==$row['digest'] || $operation['kind']!=='site.reset')
            throw new OperationException('recovery_required','The retained reset recovery manifest failed verification.');
        return array_map(fn($file)=>['domain'=>$file['domain'],'path'=>$file['path'],
            'before_hash'=>$file['before_hash'],'after_hash'=>$file['after_hash'],'current_hash'=>$this->fileHash($file)],$manifest['files']);
    }

    /** Trusted repair only; this never resumes a destructive reset. */
    public function restore(array $operation):array
    {
        if(!$operation['recovery'])return ['restored'=>true,'remaining_paths'=>[]];
        $row=$this->plan($operation['preparation_id']);$manifest=$this->manifest($row);
        if(($operation['recovery']['digest']??null)!==$row['digest'])
            return ['restored'=>false,'remaining_paths'=>['reset_manifest']];
        $remaining=[];
        foreach(array_reverse($manifest['files']) as $file){
            $label=$file['domain'].'/'.$file['path'];
            try{
                $current=$this->fileHash($file);
                if($current===$file['before_hash'])continue;
                if($current!==$file['after_hash']){$remaining[]=$label;continue;}
                $this->install($row,$file,'before');
            }catch(\Throwable){$remaining[]=$label;}
        }
        return ['restored'=>!$remaining,'remaining_paths'=>$remaining];
    }
    private function verifyInterrupted(array $operation):bool
    {
        $row=$this->plan($operation['preparation_id']);$manifest=$this->manifest($row);
        if(($operation['recovery']['digest']??null)!==$row['digest'])return false;
        foreach($manifest['files'] as $file)if(!in_array($this->fileHash($file),[$file['before_hash'],$file['after_hash']],true))return false;
        return CanonicalJson::digest($this->inventory->tables())===CanonicalJson::digest($manifest['tables']);
    }
    private function assertBefore(array $manifest):void
    {
        $state=$this->workspace->status();
        if($manifest['site_key']!==CanonicalJson::digest($this->inventory->roots())
            || $state['draft_version']!==$manifest['draft_version'] || $state['release_id']!==$manifest['release_id']
            || CanonicalJson::digest($this->inventory->tables())!==CanonicalJson::digest($manifest['tables'])
            || CanonicalJson::digest($this->inventory->inventories())!==CanonicalJson::digest($manifest['inventories']))
            throw new OperationException('content_conflict','The reviewed reset inventory changed. Prepare a fresh review.');
        foreach($manifest['files'] as $file)if($this->fileHash($file)!==$file['before_hash'])
            throw new OperationException('content_conflict','A reviewed reset path changed.',['path'=>$file['domain'].'/'.$file['path']]);
    }
    private function fileHash(array $file):?string
    {
        $path=$this->inventory->target($file['domain'],$file['path']);clearstatcache(true,$path);
        if(!file_exists($path))return null;
        if(!is_file($path) || is_link($path) || filesize($path)>ResetInventory::MAX_FILE_BYTES)
            throw new OperationException('content_conflict','A reset path is unsafe or too large.');
        if($file['domain']==='business'){
            foreach(['-wal','-journal'] as $suffix)if(is_file($path.$suffix) && filesize($path.$suffix)>0)
                throw new OperationException('content_conflict','Business storage has uncheckpointed writes. Prepare a new reset.');
        }
        $hash=hash_file('sha256',$path);if(!is_string($hash))throw new OperationException('host_capability_unavailable','Cannot verify a reset path.');
        return $hash;
    }
    private function verifyRetained(array $row,array $manifest):void
    {
        foreach($manifest['files'] as $file)foreach(['before','after'] as $side)
            if($file[$side.'_hash']!==null)$this->retained($row,$file,$side);
    }
    private function retained(array $row,array $file,string $side):string
    {
        $path=SiteWorkspace::resolveWithin($this->stage($row['id']),$side.'/'.$file['slot']);
        if(!is_file($path)||is_link($path)||filesize($path)>ResetInventory::MAX_FILE_BYTES)
            throw new OperationException('recovery_required','Reset recovery bytes are missing or unsafe.');
        $bytes=file_get_contents($path,false,null,0,ResetInventory::MAX_FILE_BYTES+1);
        if(!is_string($bytes)||hash('sha256',$bytes)!==$file[$side.'_hash'])
            throw new OperationException('recovery_required','Reset recovery bytes failed verification.');
        return $bytes;
    }
    private function install(array $row,array $file,string $side):void
    {
        $path=$this->inventory->target($file['domain'],$file['path']);
        if($file[$side.'_hash']===null){
            if(file_exists($path)&&!unlink($path))throw new OperationException('host_capability_unavailable','Cannot remove a reviewed reset path.');
        }else WorkspaceFiles::write($this->inventory->roots()[$file['domain']],$file['path'],$this->retained($row,$file,$side));
        if($this->fileHash($file)!==$file[$side.'_hash'])throw new OperationException('recovery_required','Reset path verification failed.');
    }
    private function plan(string $id):array
    {
        JsonSchema::validate($id,ToolContracts::id('reset'));
        $row=$this->db->queryOne('SELECT * FROM agent_reset_plans WHERE id=?',[$id]);
        if(!$row || $row['manifest_json']===null)throw new OperationException('recovery_required','Retained reset manifest is missing.');
        return $row;
    }
    private function manifest(array $row):array
    {
        $manifest=json_decode($row['manifest_json'],true,64,JSON_THROW_ON_ERROR);
        if(!hash_equals($row['digest'],CanonicalJson::digest($manifest))
            || $manifest['site_key']!==CanonicalJson::digest($this->inventory->roots()))
            throw new OperationException('recovery_required','Retained reset manifest failed verification.');
        return $manifest;
    }
    private function stage(string $id,bool $create=false):string
    {
        JsonSchema::validate($id,ToolContracts::id('reset'));
        $path=SiteWorkspace::resolveWithin($this->root,$id);
        if($create){
            if(!is_dir($path)&&!mkdir($path,0700,true))throw new OperationException('host_capability_unavailable','Cannot create private reset staging.');
            WorkspaceFiles::write($this->root,'.htaccess',"Require all denied\nDeny from all\n");
            if(disk_free_space($path)<ResetInventory::MAX_BYTES)throw new OperationException('host_capability_unavailable','Insufficient reset recovery storage.');
        }
        if(!is_dir($path))throw new OperationException('recovery_required','Retained reset staging is missing.');
        return $path;
    }
    private function clearIncomplete(string $stage):void
    {
        $count=0;
        $walk=function(string $dir)use(&$walk,&$count,$stage):void{
            foreach(new \DirectoryIterator($dir) as $entry){
                if($entry->isDot())continue;
                if(++$count>3500)throw new OperationException('size_limit','Incomplete reset staging exceeds its cleanup budget.');
                $path=SiteWorkspace::resolveWithin($stage,\VoxelSite\FilesystemPath::relative($entry->getPathname(),$stage));
                if(is_dir($path)){$walk($path);if(!rmdir($path))throw new OperationException('host_capability_unavailable','Cannot clean reset staging.');}
                elseif(!is_file($path)||!unlink($path))throw new OperationException('host_capability_unavailable','Cannot clean reset staging.');
            }
        };$walk($stage);
    }
}
