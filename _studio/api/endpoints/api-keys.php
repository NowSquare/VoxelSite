<?php

declare(strict_types=1);

/**
 * API Key Management Endpoints (Studio Router — session auth)
 *
 * GET    /settings/api-keys      — List all API keys
 * POST   /settings/api-keys      — Generate a new API key
 * DELETE /settings/api-keys/:id  — Revoke an API key
 *
 * These run inside the Studio router with session auth + CSRF.
 * Only site owners can manage API keys.
 *
 * Demo mode: returns an empty-state response before the owner guard.
 * POST and DELETE are already blocked by the Studio router's
 * DemoMode::shouldBlock() before this handler runs.
 */

use VoxelSite\AgentAuth;
use VoxelSite\DemoMode;

$method = $_REQUEST['_route_method'];
$path   = $_REQUEST['_route_path'];
$params = $_REQUEST['_route_params'] ?? [];
$user   = $_REQUEST['_user'] ?? [];

// ── Demo mode: return empty state BEFORE the owner guard ──
// Demo sessions use role='demo' (see DemoMode::DEMO_USER), which would fail
// the owner check. We want to return a deliberate empty-state response,
// not a misleading 403 "Only owners can manage API keys."
if (DemoMode::isActive()) {
    jsonResponse(['ok' => true, 'data' => [
        'keys'                => [],
        'available_scopes'    => AgentAuth::getAllScopes(),
        'agent_api_available' => false,
    ]]);
    return;
}

// Current database authority is required even when the session contains an older role.
try {
    $db=\VoxelSite\Database::getInstance();
    $policy=new \VoxelSite\Agent\ActorPolicy($db);
    $owner=new \VoxelSite\Agent\OperationActor('user',(int)($user['id']??0),null,[],'studio_configured',null);
    $policy->requireOwnerSession($owner);
    $approvals=new \VoxelSite\Agent\AdminApprovalStore($db,$policy,new \VoxelSite\SiteWorkspace($db),(loadConfig()??[])['app_key']??'');
    $service=new \VoxelSite\Agent\CredentialAdministrationService($db,$policy,$approvals);
    if($method==='GET') {
        $query=['audience'=>'rest'];
        foreach(['offset','inventory_version'] as $field)if(isset($_GET[$field]))$query[$field]=$field==='offset'?(int)$_GET[$field]:$_GET[$field];
        $list=$service->list($owner,(object)$query);
        $keys=$list['credentials'];
        foreach($keys as &$key) {
            $display=$db->queryOne('SELECT key_prefix,last_used_at FROM api_keys WHERE id=?',[$key['id']]);
            $key+=$display??[];
        }
        unset($key);
        jsonResponse(['ok'=>true,'data'=>['keys'=>$keys,'available_scopes'=>AgentAuth::getAllScopes(),
            'total'=>$list['total'],'next_offset'=>$list['next_offset'],'inventory_version'=>$list['inventory_version'],
            'pending_secrets'=>array_values(array_filter($approvals->pendingSecrets($owner),static fn($item)=>$item['audience']==='rest'))]]);return;
    }
    $body=(object)getJsonBody();$c=\VoxelSite\Agent\ToolContracts::class;
    if($method==='POST' && $path==='/settings/api-keys') {
        \VoxelSite\Agent\JsonSchema::validate($body,$c::object(['operation_id'=>$c::requestId(),
            'label'=>['type'=>'string','minLength'=>1,'maxLength'=>100],'role'=>['enum'=>['owner','editor','viewer','agent']],
            'scopes'=>['type'=>'array','uniqueItems'=>true,'minItems'=>1,'maxItems'=>50,'items'=>['enum'=>AgentAuth::getAllScopes()]]]));
        $intent=(object)['type'=>'credential.create','audience'=>'rest','user_id'=>$owner->userId,
            'label'=>$body->label,'role'=>$body->role,'scopes'=>$body->scopes];
    } elseif($method==='DELETE' && isset($params['id']) && ctype_digit($params['id'])) {
        \VoxelSite\Agent\JsonSchema::validate($body,$c::object(['operation_id'=>$c::requestId(),'version'=>$c::hash()]));
        $intent=(object)['type'=>'credential.revoke','credential_id'=>(int)$params['id'],'version'=>$body->version];
    } else throw new \VoxelSite\Agent\OperationException('invalid_schema','Unknown credential action.');
    $result=$service->executeStudio($owner,(object)['operation_id'=>$body->operation_id,'intent'=>$intent]);
    jsonResponse(['ok'=>true,'data'=>$result],$method==='POST'?201:200);
} catch(\VoxelSite\Agent\OperationException $error) {
    jsonResponse(['ok'=>false,'error'=>['code'=>$error->errorCode,'message'=>$error->getMessage()]],
        $error->errorCode==='permission_denied'?403:($error->errorCode==='invalid_schema'?422:409));
}
