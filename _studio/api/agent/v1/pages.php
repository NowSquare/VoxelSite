<?php
declare(strict_types=1);
use VoxelSite\{Database,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,OperationException,StudioAuthoringService};
try{
    $ctx=$_agentContext;$db=Database::getInstance();$service=new StudioAuthoringService($db,new SiteWorkspace($db));
    $actor=(new ActorPolicy($db))->fromRestCredential((int)($ctx['keyData']['id']??0),'authoring');
    $slug=$ctx['params']['slug']??null;$method=$ctx['method'];
    if($method==='GET'){
        if($slug!==null){$input=(object)['slug'=>$slug];if(isset($_GET['draft_version']))$input->draft_version=$_GET['draft_version'];$result=$service->pages->read($actor,$input);}
        else{
            $page=max(1,(int)($_GET['page']??1));$limit=min(100,max(1,(int)($_GET['per_page']??50)));
            $input=(object)['offset'=>($page-1)*$limit,'limit'=>$limit];if(isset($_GET['draft_version']))$input->draft_version=$_GET['draft_version'];
            $result=$service->pages->list($actor,$input);$result['pagination']=['page'=>$page,'per_page'=>$limit,'total'=>$result['total'],'total_pages'=>(int)ceil($result['total']/$limit)];
        }
        agentResponse(['data'=>$result]);return;
    }
    $raw=file_get_contents('php://input',false,null,0,2097153);
    if(!is_string($raw)||strlen($raw)>2097152)throw new OperationException('size_limit','Page request exceeds 2 MiB.');
    $input=json_decode($raw,true,32,JSON_THROW_ON_ERROR);
    if(!is_array($input)||array_is_list($input))throw new OperationException('invalid_schema','Send a page operation object.');
    $action=match($method){'POST'=>'create','PUT'=>'update','DELETE'=>'delete',default=>throw new OperationException('invalid_schema','Unknown page operation.')};
    $result=$service->pageChange($actor,$action,$slug,$input);$status=$result['operation']['status'];
    agentResponse(['data'=>$result],$status==='applying'?202:($status==='succeeded'?($action==='create'?201:200):409));
}catch(OperationException $error){
    agentError($error->errorCode==='permission_denied'?403:($error->errorCode==='not_found'?404:(in_array($error->errorCode,['invalid_schema','invalid_path'],true)?422:409)),
        $error->errorCode,$error->getMessage(),$error->details);
}catch(JsonException|TypeError){agentError(422,'invalid_schema','Send a stable operation_id, captured draft version and exact page fields.');}
