<?php
declare(strict_types=1);
use VoxelSite\{Database,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,BusinessRestAdapter,OperationException,ProviderCallPolicy};
try {
    $db=Database::getInstance();
    $actor=(new ActorPolicy($db))->fromRestCredential((int)($_agentContext['keyData']['id']??0),'business');
    $adapter=new BusinessRestAdapter($db,new SiteWorkspace($db));
    $method=$_agentContext['method'];
    $result=ProviderCallPolicy::runExternal(static function()use($adapter,$actor,$method):array{
        if($method==='GET')return $adapter->tools($actor,$_GET);
        $bytes=file_get_contents('php://input',false,null,0,131073);
        if(!is_string($bytes)||strlen($bytes)>131072)throw new OperationException('size_limit','Tool requests must fit within 128 KiB.');
        $input=json_decode($bytes,false,24,JSON_THROW_ON_ERROR);
        if(!$input instanceof \stdClass)throw new OperationException('invalid_schema','Send a JSON tool request object.');
        return $adapter->invoke($actor,$input);
    });
    agentResponse(['data'=>$result]);
} catch(OperationException $e) {
    agentError(match($e->errorCode){'permission_denied','credential_migration_required'=>403,'not_found'=>404,
        'invalid_schema','size_limit','validation_failed','invalid_path'=>422,default=>409},$e->errorCode,$e->getMessage(),$e->details);
} catch(\JsonException|\TypeError $e) {
    agentError(422,'invalid_schema','Send a valid bounded JSON request.');
} catch(\RuntimeException $e) {
    agentError(503,'host_capability_unavailable','Business storage is unavailable. Review its status in Studio.');
}
