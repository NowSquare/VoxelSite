<?php
declare(strict_types=1);
use VoxelSite\{Database,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,FactoryResetInventory,FactoryResetService,OperationActor,OperationException,OperationStore,PublishPlanService,ReleaseStore};
try{
    $db=Database::getInstance();$workspace=new SiteWorkspace($db);$policy=new ActorPolicy($db);
    $owner=new OperationActor('user',(int)($_REQUEST['_user']['id']??0),null,[],'studio_configured',null);
    $policy->requireOwnerSession($owner);$studio=dirname($workspace->draftRoot());
    $publish=new PublishPlanService($db,$policy,$workspace,new ReleaseStore($db,$policy,$studio.'/data/agent/releases'),
        new OperationStore($db,$policy,$workspace->mutationLockPath()));
    $service=new FactoryResetService($db,$policy,$workspace,new FactoryResetInventory($db,$workspace,$publish));
    $path=$_REQUEST['_route_path'];$method=$_REQUEST['_route_method'];
    if($method==='GET'){
        $data=isset($_GET['plan_id'])?$service->get($owner,(object)['plan_id'=>(string)$_GET['plan_id']])
            :['draft_version'=>'draft:'.$workspace->status()['draft_version'],'provider_calls'=>0];
    }else{
        $raw=file_get_contents('php://input',false,null,0,16385);
        if(!is_string($raw)||strlen($raw)>16384)throw new OperationException('size_limit','Installation request exceeds its budget.');
        $input=json_decode($raw,false,16,JSON_THROW_ON_ERROR);
        if(!$input instanceof stdClass)throw new OperationException('invalid_schema','Send an installation review object.');
        if($path==='/site/reset-install/prepare')$data=$service->prepare($owner,$input);
        elseif($path==='/site/reset-install')$data=$service->start($owner,$input);
        elseif($path==='/site/reset-install/discard')$data=$service->discard($owner,$input);
        else throw new OperationException('invalid_schema','Unknown installation action.');
    }
    jsonResponse(['ok'=>true,'data'=>$data]);
}catch(OperationException $error){
    jsonResponse(['ok'=>false,'error'=>['code'=>$error->errorCode,'message'=>$error->getMessage(),'details'=>$error->details]],
        $error->errorCode==='permission_denied'?403:($error->errorCode==='invalid_schema'?422:409));
}catch(JsonException|TypeError $error){
    jsonResponse(['ok'=>false,'error'=>['code'=>'invalid_schema','message'=>'Send the exact installation review and receipt.']],422);
}
