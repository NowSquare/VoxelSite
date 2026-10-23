<?php
declare(strict_types=1);
use VoxelSite\{Database,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,OperationException,StudioAuthoringService};
try {
    $db=Database::getInstance();
    $actor=(new ActorPolicy($db))->fromRestCredential((int)($_agentContext['keyData']['id']??0),'compile');
    $raw=file_get_contents('php://input',false,null,0,16385);
    if(!is_string($raw)||strlen($raw)>16384)throw new OperationException('size_limit','Compile request exceeds 16 KiB.');
    $input=json_decode($raw,true,16,JSON_THROW_ON_ERROR);
    if(!is_array($input)||array_is_list($input))throw new OperationException('invalid_schema','Send a compile operation object.');
    $result=(new StudioAuthoringService($db,new SiteWorkspace($db)))->fileChange($actor,'compile',$input);
    agentResponse(['data'=>$result],$result['operation']['status']==='applying'?202:200);
}catch(OperationException $error){
    agentError($error->errorCode==='permission_denied'?403:($error->errorCode==='invalid_schema'?422:409),
        $error->errorCode,$error->getMessage(),$error->details);
}catch(JsonException|TypeError){
    agentError(422,'invalid_schema','Send a stable operation_id and captured base_draft_version.');
}
