<?php
declare(strict_types=1);
use VoxelSite\{Database,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,BusinessRestAdapter,OperationException,ProviderCallPolicy};
try {
    $db=Database::getInstance();
    $actor=(new ActorPolicy($db))->fromRestCredential((int)($_agentContext['keyData']['id']??0),'business');
    $adapter=new BusinessRestAdapter($db,new SiteWorkspace($db));
    agentResponse(['data'=>ProviderCallPolicy::runExternal(fn()=>$adapter->submissions($actor,$_GET))]);
} catch(OperationException $e) {
    agentError(match($e->errorCode){'permission_denied','credential_migration_required'=>403,'not_found'=>404,
        'invalid_schema','size_limit','invalid_path'=>422,default=>409},$e->errorCode,$e->getMessage(),$e->details);
} catch(\RuntimeException $e) {
    agentError(503,'host_capability_unavailable','Business storage is unavailable. Review its status in Studio.');
}
