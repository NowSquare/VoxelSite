<?php
declare(strict_types=1);
namespace VoxelSite;
use VoxelSite\Agent\{ActorPolicy,OperationActor,OperationException,OperationRunner,OperationStore,ProviderCallPolicy,PublishPlanService,ReleaseStore};

/** Studio, REST and MCP share the same sealed candidate and journal. */
final class PublishService
{
    private Database $db;
    private SiteWorkspace $workspace;
    private ActorPolicy $policy;
    private OperationStore $operations;
    private PublishPlanService $plans;

    public function __construct(?Database $db=null,?Settings $settings=null,?SiteWorkspace $workspace=null,
        ?PublishPlanService $plans=null)
    {
        $this->db=$db??Database::getInstance();
        $this->workspace=$workspace??new SiteWorkspace($this->db);
        $this->policy=new ActorPolicy($this->db);
        $this->operations=new OperationStore($this->db,$this->policy,$this->workspace->mutationLockPath());
        $data=dirname($this->workspace->draftRoot()).'/data';
        $this->plans=$plans??new PublishPlanService($this->db,$this->policy,$this->workspace,
            new ReleaseStore($this->db,$this->policy,$data.'/agent/releases'),$this->operations,
            $data.'/actions',$data.'/published-manifest.json');
    }

    /** An explicit Studio/REST publish request authorizes sealing the current draft. */
    public function publish(bool $createSnapshot=true,string $source='studio',?OperationActor $actor=null,array $request=[]):array
    {
        return ProviderCallPolicy::runExternal(function() use($actor,$request,$createSnapshot,$source):array {
            if($actor===null)throw new OperationException('credential_migration_required','Publishing requires a current account-bound operation actor.');
            $this->policy->require($actor,['publish:write']);
            $id=$request['operation_id']??($source==='api'?null:'publish_'.bin2hex(random_bytes(16)));
            if(!is_string($id) || !preg_match('/^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$/D',$id))throw new OperationException('invalid_schema','Use a stable publish operation ID.');
            if(array_key_exists('checkpoint',$request)) {
                if(!is_int($request['checkpoint']) || $request['checkpoint']<0)throw new OperationException('invalid_schema','Use the returned publish checkpoint.');
                $state=$this->plans->continue($actor,$id,$request['checkpoint']);
            } else {
                try {$prior=$this->operations->get($actor,$id);}
                catch(OperationException $error) {if($error->errorCode!=='permission_denied')throw $error;$prior=null;}
                if($prior!==null) {
                    if($prior['kind']!=='publish.apply')throw new OperationException('idempotency_conflict','This operation ID belongs to a different operation.');
                    if($prior['state']==='prepared')$state=$this->plans->publish($actor,(object)($prior['request']+['operation_id'=>$id]));
                    else $state=OperationRunner::publicState($prior);
                } else {
                    $plan=$this->plans->prepare($actor,(object)['request_id'=>$id,'base_draft_version'=>'draft:'.$this->workspace->status()['draft_version']]);
                    $state=$this->plans->publish($actor,(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest'],'operation_id'=>$id]);
                }
            }
            $result=$state['result']??[];
            return $result+['message'=>$state['status']==='succeeded'?count($result['published']??[]).' file(s) published.':'Publication '.$state['status'].'.',
                'published'=>[],'removed'=>[],'snapshot_id'=>null,'aeo_files'=>[],'agentic_files'=>[],'errors'=>[],
                'operation'=>$state,'provider_calls'=>0,'recovery_snapshot_required'=>true,
                'optional_archive_requested'=>$createSnapshot];
        });
    }
}
