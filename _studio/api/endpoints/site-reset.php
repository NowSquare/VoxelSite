<?php
declare(strict_types=1);
use VoxelSite\{Database,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,AdminApprovalStore,JsonSchema,OperationActor,OperationException,OperationRunner,OperationStore,PublishPlanService,ReleaseStore,ResetInventory,ResetService,ToolContracts};

try{
    $db=Database::getInstance();$workspace=new SiteWorkspace($db);$policy=new ActorPolicy($db);
    $actor=new OperationActor('user',(int)($_REQUEST['_user']['id']??0),null,[],'studio_configured',null);
    $policy->requireOwnerSession($actor);
    $studio=dirname($workspace->draftRoot());$private=$studio.'/data/agent';$config=loadConfig()??[];
    if(!is_string($config['app_key']??null))throw new OperationException('feature_disabled','Finish installation before resetting.');
    $approvals=new AdminApprovalStore($db,$policy,$workspace,$config['app_key']);
    $operations=new OperationStore($db,$policy,$workspace->mutationLockPath());
    $publish=new PublishPlanService($db,$policy,$workspace,new ReleaseStore($db,$policy,$private.'/releases'),$operations);
    $service=new ResetService($db,$policy,$workspace,$approvals,$operations,
        new ResetInventory($db,$workspace,$publish,$studio,$studio.'/data/default-index.php'),$private.'/resets');
    $path=$_REQUEST['_route_path'];$method=$_REQUEST['_route_method'];
    if($method==='GET' && $path==='/site/reset'){
        if(isset($_GET['plan_id']))$data=$service->get($actor,(object)['plan_id'=>(string)$_GET['plan_id']]);
        elseif(isset($_GET['operation_id'])){
            $row=$operations->get($actor,(string)$_GET['operation_id']);
            if($row['kind']!=='site.reset')throw new OperationException('invalid_schema','Choose a site reset operation.');
            $data=OperationRunner::publicState($row);
        }else $data=['draft_version'=>'draft:'.$workspace->status()['draft_version'],'provider_calls'=>0];
        jsonResponse(['ok'=>true,'data'=>$data]);return;
    }
    $raw=file_get_contents('php://input',false,null,0,16385);
    if(!is_string($raw)||strlen($raw)>16384)throw new OperationException('size_limit','Reset request exceeds its input budget.');
    $input=json_decode($raw,false,16,JSON_THROW_ON_ERROR);
    if(!$input instanceof stdClass)throw new OperationException('invalid_schema','Send a reset review object.');
    if($path==='/site/reset/prepare')$data=$service->prepare($actor,$input);
    elseif($path==='/site/reset'){
        JsonSchema::validate($input,ToolContracts::object(['plan_id'=>ToolContracts::id('admin'),'digest'=>ToolContracts::hash(),'confirm'=>['const'=>'RESET']]));
        $review=$service->get($actor,(object)['plan_id'=>$input->plan_id]);
        if(in_array($review['status'],['pending','approved'],true))$approvals->approve($actor,$input->plan_id,$input->digest);
        $data=$service->apply($actor,(object)['plan_id'=>$input->plan_id,'digest'=>$input->digest]);
    }elseif(in_array($path,['/site/reset/continue','/site/reset/recover'],true)){
        $fields=['operation_id'=>ToolContracts::requestId()];
        if($path==='/site/reset/continue')$fields['checkpoint']=ToolContracts::integer();
        JsonSchema::validate($input,ToolContracts::object($fields));
        $row=$operations->get($actor,$input->operation_id);
        if($row['kind']!=='site.reset')throw new OperationException('invalid_schema','Choose a site reset operation.');
        $data=$path==='/site/reset/continue'?$service->continue($actor,$input->operation_id,$input->checkpoint):$service->recover($actor,$input->operation_id);
    }else throw new OperationException('invalid_schema','Unknown reset action.');
    jsonResponse(['ok'=>true,'data'=>$data]);
}catch(OperationException $error){
    jsonResponse(['ok'=>false,'error'=>['code'=>$error->errorCode,'message'=>$error->getMessage(),'details'=>$error->details]],
        $error->errorCode==='permission_denied'?403:($error->errorCode==='invalid_schema'?422:409));
}catch(JsonException|TypeError $error){
    jsonResponse(['ok'=>false,'error'=>['code'=>'invalid_schema','message'=>'Send the exact reviewed reset identity.']],422);
}
