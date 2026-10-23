<?php
declare(strict_types=1);

use VoxelSite\{Database,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,AssetHttpAdapter,OperationException};

$ctx=$_agentContext;
try {
    $db=Database::getInstance();
    $actor=(new ActorPolicy($db))->fromRestCredential((int)($ctx['keyData']['id']??0),'assets');
    $adapter=new AssetHttpAdapter($db,new SiteWorkspace($db),legacyMetadata:dirname(__DIR__,3).'/data/assets-meta.json');
    if ($ctx['method']==='GET') {
        agentResponse(['data'=>$adapter->list($actor,$_GET,false)]);
        return;
    }
    $file=$_FILES['file']??null;
    if (!is_array($file) || !is_string($file['name']??null) || !is_string($file['tmp_name']??null)
        || ($file['error']??null)!==UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
        throw new OperationException('invalid_schema','Send one complete file in the multipart file field.');
    }
    $input=$_POST;
    $input['request_id']??=$_SERVER['HTTP_IDEMPOTENCY_KEY']??null;
    if (!is_string($input['request_id'])) throw new OperationException('invalid_schema','Send a stable request_id or Idempotency-Key so an upload can be retried safely.');
    agentResponse(['data'=>$adapter->upload($actor,$input,$file)],201);
} catch(OperationException $e) {
    agentError($e->errorCode==='permission_denied'?403:($e->errorCode==='invalid_schema'||$e->errorCode==='invalid_path'?422:409),
        $e->errorCode,$e->getMessage(),$e->details);
} catch(\TypeError $e) {
    agentError(422,'invalid_schema','Send valid asset fields.');
} catch(\RuntimeException $e) {
    agentError(503,'host_capability_unavailable','Asset storage is unavailable. Check the private workspace status.');
}
