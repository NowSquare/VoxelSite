<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,SiteMutationLock,SiteRecovery,SiteWorkspace};

/** Agents can prepare removal; only a fresh owner session can issue the independent completion capability. */
final class FactoryResetService
{
    private string $root;
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,
        private FactoryResetInventory $inventory)
    {$this->root=dirname($workspace->draftRoot()).'/data/factory-resets';}
    public static function inputSchema(string $method):array
    {
        $c=ToolContracts::class;
        return match($method){
            'prepare'=>$c::object(['operation_id'=>$c::requestId(),'base_draft_version'=>$c::version()]),
            'get'=>$c::object(['plan_id'=>$c::id('factory')]),
            'start'=>$c::object(['plan_id'=>$c::id('factory'),'digest'=>$c::hash(),
                'confirm'=>['const'=>'RESET INSTALLATION'],'receipt_token'=>$c::hash()]),
            default=>throw new \InvalidArgumentException('Unknown installation cleanup method.'),
        };
    }
    public static function outputSchema():array
    {
        $c=ToolContracts::class;
        return $c::object(['plan_id'=>$c::id('factory'),'operation_id'=>$c::requestId(),'digest'=>$c::hash(),
            'requested_by'=>$c::actor(),'status'=>['enum'=>['ready','started','failed_restored','expired']],
            'expires_at'=>$c::integer(),'studio_completion_required'=>['const'=>true],
            'review'=>$c::object(['summary'=>$c::text(1000),'files'=>$c::list($c::reviewFile(),1502),
                'tables'=>$c::list($c::object(['name'=>$c::text(100),'rows'=>$c::integer(),'sha256'=>$c::hash()]),150),
                'preserved'=>$c::list($c::text(1000),20),'final_boundary'=>$c::text(2000)]),'provider_calls'=>['const'=>0]]);
    }
    public function prepare(OperationActor $actor,\stdClass $input):array
    {
        return ProviderCallPolicy::runExternal(fn()=>$this->safe(function()use($actor,$input):array{
            JsonSchema::validate($input,self::inputSchema('prepare'));$this->policy->require($actor,['reset:installation']);
            $request=CanonicalJson::digest($input);
            $prior=$this->db->queryOne('SELECT * FROM agent_factory_plans WHERE actor_key=? AND request_id=?',[$actor->identity(),$input->operation_id]);
            if($prior){
                if(!hash_equals($prior['request_digest'],$request))throw new OperationException('idempotency_conflict','This installation review ID belongs to other input.');
                if($prior['manifest_json']!==null)return $this->get($actor,(object)['plan_id'=>$prior['id']]);
                if((int)$prior['expires_at']<=time())throw new OperationException('review_expired','Discard this interrupted, expired preparation.',
                    ['plan_id'=>$prior['id'],'digest'=>$prior['request_digest']]);
            }
            $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);$this->assertIdle();
            $this->workspace->assertReady();
            if($input->base_draft_version!=='draft:'.$this->workspace->status()['draft_version'])throw new OperationException('content_conflict','Read the current draft version before reviewing installation cleanup.');
            $pending=$this->db->queryOne("SELECT id,digest,request_digest FROM agent_factory_plans WHERE status IN ('preparing','ready','started') LIMIT 1");
            if(!$prior&&$pending)
                throw new OperationException('size_limit','An installation review already retains recovery data. Discard the unused review before preparing another.',
                    $actor->type==='user'?['plan_id'=>$pending['id'],'digest'=>$pending['digest']??$pending['request_digest']]:[]);
            $id=$prior['id']??'factory_'.bin2hex(random_bytes(16));$time=(int)($prior['created_at']??time());
            $row=$prior??['id'=>$id,'actor_key'=>$actor->identity(),'actor_json'=>CanonicalJson::encode($actor->attribution()),
                'request_id'=>$input->operation_id,'request_digest'=>$request,'created_at'=>$time,'expires_at'=>$time+900];
            if(!$prior)$this->db->insert('agent_factory_plans',$row);
            WorkspaceFiles::write($this->root,'.htaccess',"Require all denied\nDeny from all\n");
            $stage=$this->root.'/'.$id;
            if($prior){
                $entries=0;
                foreach(\VoxelSiteFactoryResetRuntime::paths($this->root,$id,$entries) as $path){
                    if(!preg_match('~^factory_[a-f0-9]{32}/(?:before/(?:[0-9]+|config)|after/[0-9]+|prepared\.json)$~D',$path))
                        throw new OperationException('recovery_required','Unexpected staging data prevents preparation retry.');
                    if(!unlink(\VoxelSiteFactoryResetRuntime::path($this->root,$path)))throw new OperationException('host_capability_unavailable','Cannot retry private preparation.');
                }
            }
            $manifest=$this->inventory->capture($stage);
            $manifest+=['id'=>$id,'operation_id'=>$input->operation_id,'requested_by'=>$actor->attribution(),
                'expires_at'=>$time+900,'database_relative'=>\VoxelSite\FilesystemPath::relative($this->inventory->databasePath(),$manifest['roots']['studio']),
                'scan_trees'=>['studio'=>FactoryResetInventory::PRIVATE_TREES,'published'=>['assets/images','assets/files','assets/fonts']]];
            $json=\VoxelSiteFactoryResetRuntime::canonical($manifest);
            if(strlen($json)>2097152)throw new OperationException('size_limit','Installation review exceeds its metadata budget.');
            WorkspaceFiles::write($stage,'prepared.json',$json);
            $this->db->update('agent_factory_plans',['manifest_json'=>$json,'digest'=>hash('sha256',$json),'status'=>'ready',
                'staged_bytes'=>$manifest['staged_bytes']+strlen($json)],'id = ?',[$id]);
            return $this->get($actor,(object)['plan_id'=>$id]);
        }));
    }
    public function get(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('get'));$this->policy->require($actor,['reset:installation']);
        $row=$this->row($input->plan_id);
        if($row['actor_key']!==$actor->identity())$this->policy->requireOwnerSession($actor);
        if($row['manifest_json']===null)throw new OperationException('recovery_required','Installation preparation has not completed.');
        $manifest=$this->manifest($row);$files=[];
        foreach($manifest['files'] as $file)$files[]=['path'=>$file['domain'].'/'.$file['path']]+array_intersect_key($file,array_flip(['effect','before_hash','after_hash','before_bytes','after_bytes']));
        $files[]=['path'=>'studio/data/config.json','effect'=>'delete','before_hash'=>$manifest['config_hash'],'after_hash'=>null,
            'before_bytes'=>$manifest['config_bytes'],'after_bytes'=>0];
        // Database rows are reviewed logically because receipt allocation itself changes SQLite bytes.
        $files[]=['path'=>'studio/'.$manifest['database_relative'],'effect'=>'delete','before_hash'=>null,'after_hash'=>null,'before_bytes'=>0,'after_bytes'=>0];
        $tables=[];foreach($manifest['tables'] as $name=>$value)$tables[]=['name'=>$name]+$value;
        return ['plan_id'=>$row['id'],'operation_id'=>$row['request_id'],'digest'=>$row['digest'],'requested_by'=>json_decode($row['actor_json'],true,16,JSON_THROW_ON_ERROR),
            'status'=>$row['status']==='ready'&&(int)$row['expires_at']<=time()?'expired':$row['status'],'expires_at'=>(int)$row['expires_at'],
            'studio_completion_required'=>true,'review'=>['summary'=>'Remove the reviewed installation data and return to setup.',
                'files'=>$files,'tables'=>$tables,'preserved'=>$manifest['preserved'],
                'final_boundary'=>'Studio completes this reset. First it removes the listed files while retaining originals. You can restore them until database removal begins. After that, only cleanup can continue. Success means originals are erased and the installer is available. Private completion metadata remains; status access expires after seven days. Database contents are verified using the listed table digests.'],
            'provider_calls'=>0];
    }
    public function start(OperationActor $owner,\stdClass $input):array
    {
        return ProviderCallPolicy::runExternal(fn()=>$this->safe(function()use($owner,$input):array{
            JsonSchema::validate($input,self::inputSchema('start'));$this->policy->requireOwnerSession($owner);
            $row=$this->row($input->plan_id);$manifest=$this->manifest($row);
            if(!hash_equals($row['digest'],$input->digest))throw new OperationException('content_conflict','Approve the exact installation review digest.');
            if($row['status']==='started')return (new \VoxelSiteFactoryResetRuntime(...array_values($this->inventory->roots())))->status($row['id'],$input->receipt_token);
            if($row['status']!=='ready'||(int)$row['expires_at']<=time())throw new OperationException('review_expired','Prepare a fresh installation review.');
            $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);$this->assertIdle();
            $this->policy->require($this->original($row),['reset:installation']);
            // Never leave another review's private originals behind after claiming factory removal.
            foreach($this->db->query('SELECT id FROM agent_factory_plans WHERE id<>?',[$row['id']]) as $other){
                $entries=0;
                foreach(['before','after'] as $tree)if(\VoxelSiteFactoryResetRuntime::paths($this->root,$other['id'].'/'.$tree,$entries))
                    throw new OperationException('content_conflict','Discard another review’s retained originals before installation removal.');
            }
            if(CanonicalJson::digest($this->inventory->paths())!==CanonicalJson::digest(array_map(fn($f)=>array_intersect_key($f,['domain'=>true,'path'=>true]),$manifest['files'])))
                throw new OperationException('content_conflict','The installation file set changed after review.');
            foreach($manifest['files'] as $file){
                $hash=\VoxelSiteFactoryResetRuntime::hashPath(\VoxelSiteFactoryResetRuntime::path($manifest['roots'][$file['domain']],$file['path']));
                if($hash!==$file['before_hash'])throw new OperationException('content_conflict','A reviewed installation file changed.');
                if($file['before_hash']!==null&&\VoxelSiteFactoryResetRuntime::hashPath($this->root.'/'.$row['id'].'/before/'.$file['slot'])!==$file['before_hash'])
                    throw new OperationException('recovery_required','A retained original is missing or changed.');
                if($file['after_hash']!==null&&\VoxelSiteFactoryResetRuntime::hashPath($this->root.'/'.$row['id'].'/after/'.$file['slot'])!==$file['after_hash'])
                    throw new OperationException('recovery_required','The retained landing page changed.');
            }
            if(\VoxelSiteFactoryResetRuntime::hashPath(\VoxelSiteFactoryResetRuntime::path($manifest['roots']['studio'],'data/config.json'))!==$manifest['config_hash'])
                throw new OperationException('content_conflict','Installation config changed after review.');
            $manifest['approved_by']=$owner->userId;$bytes=\VoxelSiteFactoryResetRuntime::canonical($manifest);
            $state=['phase'=>'applying','checkpoint'=>0,'cursor'=>0,'irreversible'=>false,'error'=>null,
                'token_hash'=>hash('sha256',$input->receipt_token),'manifest_seal'=>hash_hmac('sha256',$bytes,$input->receipt_token)];
            \VoxelSiteFactoryResetRuntime::write($this->root,$row['id'].'/manifest.json',$bytes);
            \VoxelSiteFactoryResetRuntime::write($this->root,$row['id'].'/state.json',\VoxelSiteFactoryResetRuntime::canonical($state));
            $this->db->transaction(function()use($owner,$row,$manifest,$bytes):void{
                $this->policy->requireOwnerSession($owner);$this->policy->require($this->original($row),['reset:installation']);
                // Force the SQLite writer lock before checking the complete logical database state.
                $this->db->update('agent_factory_plans',['status'=>'started'],'id = ? AND status = ?',[$row['id'],'ready']);
                if(\VoxelSiteFactoryResetRuntime::canonical(\VoxelSiteFactoryResetRuntime::tables($this->db->getPdo()))!==\VoxelSiteFactoryResetRuntime::canonical($manifest['tables']))
                    throw new OperationException('content_conflict','Database rows changed after the installation review.');
                if($this->db->update('site_workspace_state',['reservation_operation_id'=>$row['id']],'id = 1 AND reservation_operation_id IS NULL')!==1)
                    throw new OperationException('site_busy','Another operation reserved the workspace.');
                \VoxelSiteFactoryResetRuntime::write($this->root,'active.json',\VoxelSiteFactoryResetRuntime::canonical(['id'=>$row['id'],'digest'=>hash('sha256',$bytes)]));
            });
            return (new \VoxelSiteFactoryResetRuntime($manifest['roots']['studio'],$manifest['roots']['published']))->status($row['id'],$input->receipt_token);
        }));
    }
    /** Explicit bounded cleanup; active journals and terminal receipts never expire through this path. */
    public function expire(OperationActor $owner,string $id,int $limit=50):array
    {
        $this->policy->requireOwnerSession($owner);$row=$this->row($id);
        if((int)$row['expires_at']>time()||!in_array($row['status'],['preparing','ready','expired'],true))
            throw new OperationException('content_conflict','Only an expired, unstarted review can be discarded.');
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);$this->assertIdle();
        $entries=0;$paths=\VoxelSiteFactoryResetRuntime::paths($this->root,$id,$entries);$removed=0;
        foreach(array_slice($paths,0,max(1,min(100,$limit))) as $path){
            if(!preg_match('~^factory_[a-f0-9]{32}/(?:before/(?:[0-9]+|config)|after/[0-9]+|prepared\.json|manifest\.json|state\.json)$~D',$path))
                throw new OperationException('invalid_path','Unexpected data prevents review staging cleanup.');
            if(!unlink(\VoxelSiteFactoryResetRuntime::path($this->root,$path)))throw new OperationException('host_capability_unavailable','Cannot clear expired review staging.');
            $removed++;
        }
        if($removed===count($paths))$this->db->update('agent_factory_plans',['status'=>'expired','staged_bytes'=>0],'id = ?',[$id]);
        return ['removed'=>$removed,'complete'=>$removed===count($paths),'provider_calls'=>0];
    }
    public function discard(OperationActor $owner,\stdClass $input):array
    {
        JsonSchema::validate($input,ToolContracts::object(['plan_id'=>ToolContracts::id('factory'),'digest'=>ToolContracts::hash()]));
        $this->policy->requireOwnerSession($owner);$row=$this->row($input->plan_id);
        if(!hash_equals($row['digest']??$row['request_digest'],$input->digest)||!in_array($row['status'],['preparing','ready','expired'],true))
            throw new OperationException('content_conflict','Only this exact unstarted review can be discarded.');
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);$this->assertIdle();
        $this->db->update('agent_factory_plans',['expires_at'=>time()-1],'id = ?',[$row['id']]);
        return $this->expire($owner,$row['id']);
    }
    private function assertIdle():void
    {
        SiteRecovery::assertWritable($this->db);
        if(is_file(\VoxelSiteFactoryResetRuntime::path(dirname($this->workspace->draftRoot()),'data/updates/active.json'))
            ||is_file(\VoxelSiteFactoryResetRuntime::path($this->root,'active.json')))
            throw new OperationException('site_busy','Finish the active installation maintenance first.');
        if((int)$this->db->scalar("SELECT COUNT(*) FROM agent_operations WHERE state IN ('prepared','applying','recovery_required')")>0)
            throw new OperationException('site_busy','Finish or recover retained operations before removing the installation.');
    }
    private function row(string $id):array
    {
        JsonSchema::validate($id,ToolContracts::id('factory'));
        return $this->db->queryOne('SELECT * FROM agent_factory_plans WHERE id=?',[$id])??throw new OperationException('not_found','Installation review not found.');
    }
    private function manifest(array $row):array
    {
        if(!is_string($row['manifest_json'])||!hash_equals($row['digest']??'',hash('sha256',$row['manifest_json'])))throw new OperationException('recovery_required','The installation review failed verification.');
        $manifest=json_decode($row['manifest_json'],true,64,JSON_THROW_ON_ERROR);
        if(CanonicalJson::digest($manifest['roots'])!==CanonicalJson::digest($this->inventory->roots()))throw new OperationException('invalid_path','This review belongs to another installation.');
        return $manifest;
    }
    private function original(array $row):OperationActor
    {
        $a=json_decode($row['actor_json'],true,16,JSON_THROW_ON_ERROR);
        return new OperationActor($a['type'],$a['user_id'],$a['credential_id'],['reset:installation'],
            $a['type']==='user'?'studio_configured':'forbidden',$a['client_name']);
    }
    private function safe(callable $fn):array
    {try{return $fn();}catch(\VoxelSiteFactoryResetFailure $e){throw new OperationException($e->errorCode,$e->getMessage());}}
}
