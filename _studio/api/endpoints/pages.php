<?php
declare(strict_types=1);
use VoxelSite\{Database,SiteWorkspace};
use VoxelSite\Agent\{OperationException,StudioAuthoringService};
try{
    $db=Database::getInstance();$service=new StudioAuthoringService($db,new SiteWorkspace($db));$actor=StudioAuthoringService::actor();
    $method=$_REQUEST['_route_method'];$path=$_REQUEST['_route_path'];$slug=$_REQUEST['_route_params']['slug']??null;
    if($method==='GET'){
        $result=$slug===null?$service->pages->studioList($actor,$_GET):$service->pages->read($actor,(object)['slug'=>$slug]);
        jsonResponse(['ok'=>true,'data'=>$result]);return;
    }
    $raw=file_get_contents('php://input',false,null,0,2097153);
    if(!is_string($raw)||strlen($raw)>2097152)throw new OperationException('size_limit','Page request exceeds 2 MiB.');
    $input=json_decode($raw,true,32,JSON_THROW_ON_ERROR);
    if(!is_array($input)||array_is_list($input))throw new OperationException('invalid_schema','Send a page operation object.');
    $action=$method==='DELETE'?'delete':($path==='/pages/reorder'?'reorder':(str_ends_with($path,'/nav')?'navigation':'update'));
    $result=$service->pageChange($actor,$action,$slug,$input);$status=$result['operation']['status'];
    jsonResponse(['ok'=>in_array($status,['succeeded','applying'],true),'data'=>$result],$status==='applying'?202:($status==='succeeded'?200:409));
}catch(OperationException $error){
    jsonResponse(['ok'=>false,'error'=>['code'=>$error->errorCode,'message'=>$error->getMessage(),'details'=>$error->details]],
        $error->errorCode==='permission_denied'?403:($error->errorCode==='not_found'?404:(in_array($error->errorCode,['invalid_schema','invalid_path'],true)?422:409)));
}catch(JsonException|TypeError){jsonResponse(['ok'=>false,'error'=>['code'=>'invalid_schema','message'=>'Send a stable operation_id, captured draft version and exact page fields.']],422);}
