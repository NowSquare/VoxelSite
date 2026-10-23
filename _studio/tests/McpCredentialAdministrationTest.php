<?php
declare(strict_types=1);
require __DIR__.'/McpAdministrationTest.php';
use VoxelSite\Agent\{CredentialAdministrationService,JsonSchema,OperationException};

$credentialKey=$credentials->create($owner,1,'read','Credential manager',null,null,['credentials:write']);
$credentialActor=$policy->fromCredential($credentialKey['id']);
$service=new CredentialAdministrationService($db,$policy,$store);
$input=(object)['operation_id'=>'credential-create-fixture-001','intent'=>(object)[
    'type'=>'credential.create','audience'=>'studio_mcp','user_id'=>2,'label'=>'Reviewed editor connection',
    'preset'=>'edit','extra_scopes'=>[],'expires_at'=>time()+86400,
]];
$plan=$service->prepare($credentialActor,$input);
adminCheck($plan['status']==='pending' && str_contains(implode(' ',$plan['review']['effects']),'Studio'),
    'Credential review names its human-only secret delivery boundary');
adminReject(fn()=>$service->apply($credentialActor,(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest']]),
    'approval_required','Credential request cannot mint a key without owner approval');
$store->approve($owner,$plan['plan_id'],$plan['digest']);
$result=$service->apply($credentialActor,(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest']]);
JsonSchema::validate(JsonSchema::output($result),CredentialAdministrationService::outputSchema('apply'));
$newId=$result['result']['entity_id'];
adminCheck($result['result']['secret_delivery']==='studio_once' && !str_contains(json_encode($result),'vxs_'),
    'MCP creation returns metadata only');
adminCheck($service->apply($credentialActor,(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest']])===$result,
    'Credential creation replay returns its retained result');
$pending=$store->pendingSecrets($owner);
adminCheck(count($pending)===1 && $pending[0]['credential_id']===$newId && !str_contains(json_encode($pending),'vxs_'),
    'Owner sees pending reveal metadata without its secret');
adminReject(fn()=>$store->revealSecret($credentialActor,$plan['plan_id']),'permission_denied',
    'A credential cannot claim its own approval secret');
$revealed=$store->revealSecret($owner,$plan['plan_id']);
adminCheck(hash('sha256',$revealed['key'])===$db->scalar('SELECT key_hash FROM api_keys WHERE id=?',[$newId]),
    'Owner-only reveal delivers the correct newly created credential');
adminCheck(!str_contains(json_encode($db->query('SELECT * FROM agent_admin_secrets')),$revealed['key']),
    'Revealed secret is removed from encrypted temporary storage');
adminReject(fn()=>$store->revealSecret($owner,$plan['plan_id']),'secret_unavailable','A secret can be claimed only once');
adminCheck($store->pendingSecrets($owner)===[],'Claimed secret no longer appears in pending reveals');
$listing=$service->list($credentialActor,new stdClass());
JsonSchema::validate(JsonSchema::output($listing),CredentialAdministrationService::outputSchema('list'));
adminCheck(!str_contains(json_encode($listing),'key_hash') && !str_contains(json_encode($listing),$revealed['key']),
    'Credential inventory exposes only bounded metadata and versions');
$target=array_values(array_filter($listing['credentials'],fn($row)=>$row['id']===$newId))[0];
$revoke=$service->prepare($credentialActor,(object)['operation_id'=>'credential-revoke-fixture-001',
    'intent'=>(object)['type'=>'credential.revoke','credential_id'=>$newId,'version'=>$target['version']]]);
$store->approve($owner,$revoke['plan_id'],$revoke['digest']);
$newActor=$policy->fromCredential($newId);
$service->apply($credentialActor,(object)['plan_id'=>$revoke['plan_id'],'digest'=>$revoke['digest']]);
adminReject(fn()=>$policy->require($newActor,['site:read']),'permission_denied','Approved revocation takes effect immediately');
adminReject(fn()=>$service->prepare($credentialActor,(object)['operation_id'=>'credential-self-revoke-001',
    'intent'=>(object)['type'=>'credential.revoke','credential_id'=>$credentialKey['id'],'version'=>str_repeat('a',64)]]),
    'permission_denied','A connected agent must use Studio to revoke its own connection');
adminReject(fn()=>$service->prepare($credentialActor,(object)['operation_id'=>'credential-role-escalation-001',
    'intent'=>(object)['type'=>'credential.create','audience'=>'studio_mcp','user_id'=>2,'label'=>'Cannot elevate',
        'preset'=>'read','extra_scopes'=>['team:write'],'expires_at'=>time()+86400]]),
    'permission_denied','Credential review rejects access exceeding the target account role');
$rest=$service->prepare($credentialActor,(object)['operation_id'=>'credential-rest-create-001','intent'=>(object)[
    'type'=>'credential.create','audience'=>'rest','user_id'=>2,'label'=>'Reviewed REST connection','role'=>'viewer','scopes'=>['pages:read']]]);
$store->approve($owner,$rest['plan_id'],$rest['digest']);
$restResult=$service->apply($credentialActor,(object)['plan_id'=>$rest['plan_id'],'digest'=>$rest['digest']]);
$restId=$restResult['result']['entity_id'];
adminCheck((int)$db->scalar('SELECT user_id FROM agent_rest_owners WHERE key_id=?',[$restId])===2
    && $db->scalar('SELECT audience FROM api_keys WHERE id=?',[$restId])==='rest','REST creation keeps its audience and explicit account binding');
$db->update('agent_admin_secrets',['expires_at'=>time()-1],'plan_id = ?',[$rest['plan_id']]);
adminReject(fn()=>$store->revealSecret($owner,$rest['plan_id']),'secret_unavailable','Expired temporary credential cannot be revealed');
$store->pruneSensitiveInputs();
adminCheck($db->scalar('SELECT ciphertext FROM agent_admin_secrets WHERE plan_id=?',[$rest['plan_id']])===null,
    'Bounded cleanup discards expired encrypted delivery while retaining its receipt');
$listing=$service->list($credentialActor,new stdClass());
$restMeta=array_values(array_filter($listing['credentials'],fn($row)=>$row['id']===$restId))[0];
$stalePlan=$service->prepare($credentialActor,(object)['operation_id'=>'credential-stale-revoke-001','intent'=>(object)[
    'type'=>'credential.revoke','credential_id'=>$restId,'version'=>$restMeta['version']]]);
$store->approve($owner,$stalePlan['plan_id'],$stalePlan['digest']);
$db->update('api_keys',['label'=>'Changed during owner review'],'id = ?',[$restId]);
adminReject(fn()=>$service->apply($credentialActor,(object)['plan_id'=>$stalePlan['plan_id'],'digest'=>$stalePlan['digest']]),
    'content_conflict','Credential edit after approval invalidates the retained action');
adminCheck($db->scalar('SELECT id FROM api_keys WHERE id=?',[$restId])!==false,'Stale review preserves the credential');
$roleChange=$service->prepare($credentialActor,(object)['operation_id'=>'credential-demoted-account-001','intent'=>(object)[
    'type'=>'credential.create','audience'=>'studio_mcp','user_id'=>2,'label'=>'Demoted account connection',
    'preset'=>'edit','extra_scopes'=>[],'expires_at'=>time()+86400]]);
$store->approve($owner,$roleChange['plan_id'],$roleChange['digest']);
$db->update('users',['role'=>'viewer'],'id = 2');
$keyCount=$db->count('api_keys');
adminReject(fn()=>$service->apply($credentialActor,(object)['plan_id'=>$roleChange['plan_id'],'digest'=>$roleChange['digest']]),
    'permission_denied','Account demotion is rechecked after owner approval');
adminCheck($db->count('api_keys')===$keyCount && $store->get($credentialActor,$roleChange['plan_id'])['status']==='approved',
    'Rejected credential creation leaves both key store and receipt consumption unchanged');
$db->update('users',['role'=>'editor'],'id = 2');
echo "MCP credential administration: {$checks} combined checks passed\n";
