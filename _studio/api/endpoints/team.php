<?php
declare(strict_types=1);
use VoxelSite\{Auth,Database,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,AdminApprovalStore,AdministrationService,CanonicalJson,OperationActor,OperationException};

// The authenticated owner's explicit Studio form submission approves these
// exact fields. External connections cannot use this session adapter.
$path=$_REQUEST['_route_path'];$method=$_REQUEST['_route_method'];$params=$_REQUEST['_route_params']??[];
try {
    $db=Database::getInstance();$policy=new ActorPolicy($db);
    $actor=new OperationActor('user',(int)($_REQUEST['_user']['id']??0),null,[],'studio_configured',null);
    $policy->requireOwnerSession($actor);
    $approvals=new AdminApprovalStore($db,$policy,new SiteWorkspace($db),(loadConfig()??[])['app_key']??'');
    $service=new AdministrationService($db,$policy,$approvals);
    if($method==='GET' && $path==='/team') {
        $query=[];
        foreach(['offset','limit','inventory_version'] as $field)if(isset($_GET[$field]))$query[$field]=$field==='inventory_version'?$_GET[$field]:(int)$_GET[$field];
        jsonResponse(['ok'=>true,'data'=>$service->team($actor,(object)$query)]);return;
    }
    $raw=file_get_contents('php://input',false,null,0,131073);
    if($raw===false || strlen($raw)>131072)throw new OperationException('size_limit','This team change exceeds its review budget.');
    $body=json_decode($raw,false,16,JSON_THROW_ON_ERROR);
    if(!$body instanceof stdClass)throw new OperationException('invalid_schema','Send a team change object with an operation ID.');
    $input=(array)$body;$operationId=$input['operation_id']??null;unset($input['operation_id']);
    if($method==='POST' && $path==='/team') {
        $intent=(object)(['type'=>'team.create']+$input+['role'=>'editor']);
    } else {
        $version=$input['version']??null;unset($input['version']);
        $identity=['user_id'=>(int)($params['id']??0),'version'=>$version];
        if($method==='PUT')$intent=(object)(['type'=>'team.update']+$identity+['fields'=>(object)$input]);
        elseif($method==='DELETE')$intent=(object)(['type'=>'team.delete']+$identity+$input);
        elseif($method==='POST' && str_ends_with($path,'/password'))$intent=(object)(['type'=>'team.password']+$identity+$input);
        else throw new OperationException('invalid_schema','Unknown team action.');
    }
    $review=$service->prepare($actor,(object)['operation_id'=>$operationId,'intent'=>$intent]);
    if(in_array($review['status'],['pending','approved'],true))$approvals->approve($actor,$review['plan_id'],$review['digest']);
    $operation=$service->apply($actor,(object)['plan_id'=>$review['plan_id'],'digest'=>$review['digest']]);
    $result=['operation_id'=>$operation['operation_id'],'operation'=>$operation];
    if($intent->type==='team.delete')$result['deleted']=true;
    elseif($intent->type==='team.password')$result['message']='Password has been reset.';
    else {
        // Legacy Studio shape is a fresh redacted read. The retained operation
        // result above remains the authoritative mutation receipt on a replay.
        $id=$operation['result']['entity_id'];$member=(new Auth($db))->getUser($id);
        if($member!==null) {
            $row=$db->queryOne('SELECT * FROM users WHERE id=?',[$id]);
            $member['version']=CanonicalJson::digest($row);
        }
        $result['member']=$member;
    }
    jsonResponse(['ok'=>true,'data'=>$result],$intent->type==='team.create'?201:200);
}catch(OperationException $e){
    jsonResponse(['ok'=>false,'error'=>['code'=>$e->errorCode,'message'=>$e->getMessage(),'details'=>$e->details]],
        $e->errorCode==='permission_denied'?403:($e->errorCode==='invalid_schema'?422:409));
}catch(JsonException|TypeError $e){
    jsonResponse(['ok'=>false,'error'=>['code'=>'invalid_schema','message'=>'Send valid team fields, the reviewed member version and an operation ID.']],422);
}
