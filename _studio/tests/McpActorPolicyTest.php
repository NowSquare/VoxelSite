<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Agent\ActorPolicy;
use VoxelSite\Agent\CredentialService;
use VoxelSite\Agent\OperationActor;
use VoxelSite\Agent\OperationException;
use VoxelSite\AgentAuth;
use VoxelSite\Database;

$checks = 0;
$errors = [];
function actorCheck(bool $condition, string $label): void
{
    global $checks, $errors;
    $checks++;
    if (!$condition) $errors[] = $label;
    echo ($condition ? 'PASS ' : 'FAIL ') . $label . "\n";
}
function actorDenied(callable $call, string $label): void
{
    try {
        $call();
        actorCheck(false, $label);
    } catch (OperationException $e) {
        actorCheck($e->errorCode === 'permission_denied', $label);
    }
}
if (!class_exists(CredentialService::class)) {
    actorCheck(false, 'MCP credentials bind to a real user and apply current role ceilings');
    exit(1);
}
$root = sys_get_temp_dir() . '/vs-mcp-actors-' . bin2hex(random_bytes(6));
mkdir($root, 0700, true);
$root=realpath($root);
foreach (['logDir'=>$root,'initialized'=>true] as $property=>$value) {
    (new ReflectionProperty(\VoxelSite\Logger::class,$property))->setValue(null,$value);
}
$db = Database::getInstance($root . '/studio.db');
$db->exec("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, role TEXT, disabled_at TEXT)");
$db->exec("INSERT INTO users VALUES (1,'Owner','owner',NULL),(2,'Editor','editor',NULL),(3,'Viewer','viewer',NULL)");
$legacy = new AgentAuth($db);
$migration = require dirname(__DIR__) . '/engine/migrations/014_agent_operation_identity.php';
($migration['up'])($db);
($migration['up'])($db);
$restMigration=require dirname(__DIR__).'/engine/migrations/024_rest_operation_owners.php';
($restMigration['up'])($db);
$service = new CredentialService($db);
$policy = new ActorPolicy($db);
$owner = new OperationActor('user', 1, null, [], 'studio_configured', null);
$editor = new OperationActor('user', 2, null, [], 'studio_configured', null);
$read = $service->create($owner, 1, 'read', 'Example reader', null, time() + 3600);
$write = $service->create($owner, 2, 'edit', 'Example editor', 'Example client', time() + 3600);
actorCheck(!str_contains(json_encode($service->list($owner)), $read['key']), 'Credential listing never returns the secret');
actorCheck($db->scalar('SELECT key_hash FROM api_keys WHERE id = ?', [$read['id']]) === hash('sha256', $read['key']), 'Only a one-way token hash is stored');
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $read['key'];
actorCheck($legacy->authenticate()['status'] === AgentAuth::AUTH_INVALID_KEY, 'MCP key cannot cross into legacy REST');
$actor = $service->authenticate();
actorCheck($actor->userId === 1 && $actor->credentialId === $read['id'] && $actor->providerPolicy === 'forbidden', 'Authentication constructs bound external-only actor');
$policy->require($actor, ['site:read']);
actorDenied(fn () => $policy->require($actor, ['files:write']), 'Read preset cannot author files');
actorDenied(fn () => $service->create($editor, 2, 'edit', 'Forbidden', null), 'Only current owner sessions create credentials');
actorDenied(fn () => $service->create($owner, 3, 'edit', 'Forbidden', null), 'Viewer ceiling forbids authoring preset');
actorDenied(fn () => $service->create($owner, 2, 'publish', 'Forbidden', null, null, ['restore:live']), 'Editor cannot acquire owner-only live restore');
$legacyKey = $legacy->createKey('Existing REST', 'viewer');
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $legacyKey['key'];
actorDenied(fn () => $service->authenticate(), 'Existing REST keys gain no MCP authority');
actorCheck($legacy->authenticate()['status'] === AgentAuth::AUTH_OK, 'Legacy key authentication remains unchanged');
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $write['key'];
$writer = $service->authenticate();
$policy->require($writer, ['files:write']);
$db->update('api_keys', ['audience' => 'rest'], 'id = ?', [$write['id']]);
actorDenied(fn () => $policy->require($writer, ['files:write']), 'Audience changes invalidate an already constructed actor');
$db->update('api_keys', ['audience' => 'studio_mcp', 'scopes' => json_encode(['site:read'])], 'id = ?', [$write['id']]);
actorDenied(fn () => $policy->require($writer, ['files:write']), 'Grant narrowing takes effect on an already constructed actor');
$db->update('api_keys', ['scopes' => json_encode($write['scopes'])], 'id = ?', [$write['id']]);
$db->update('users', ['role' => 'viewer'], 'id = ?', [2]);
actorDenied(fn () => $policy->require($writer, ['files:write']), 'Demotion takes effect on an already constructed actor');
$db->update('users', ['role' => 'editor', 'disabled_at' => now()], 'id = ?', [2]);
actorDenied(fn () => $service->authenticate(), 'Disabled account cannot authenticate');
$db->update('users', ['disabled_at' => null], 'id = ?', [2]);
$service->revoke($owner, $write['id']);
actorDenied(fn () => $policy->require($writer, ['site:read']), 'Revocation invalidates already constructed actor');
actorDenied(fn () => $service->authenticate(), 'Revoked key cannot authenticate');
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $read['key'];
$db->update('studio_mcp_credentials', ['expires_at' => time() - 1], 'key_id = ?', [$read['id']]);
actorDenied(fn () => $service->authenticate(), 'Expired credentials fail closed');
$rest=$legacy->createKey('REST publisher','agent');
try {$policy->fromRestCredential($rest['id']);actorCheck(false,'Unbound REST credentials cannot enter shared mutation services');}
catch (OperationException $error) {actorCheck($error->errorCode==='credential_migration_required','Unbound REST credentials cannot enter shared mutation services');}
actorDenied(fn()=>$policy->bindRestCredential($editor,$rest['id'],2),'An editor session cannot bind REST credentials');
$db->transaction(fn()=>$policy->bindRestCredential($owner,$rest['id'],2));
$restActor=$policy->fromRestCredential($rest['id']);
$policy->require($restActor,['publish:write','files:read','assets:read','forms:read']);
actorCheck($restActor->type==='rest_key' && $restActor->userId===2 && $restActor->providerPolicy==='forbidden',
    'Explicit binding joins an existing transaction and creates an external-only REST actor');
actorDenied(fn()=>$policy->require($restActor,['files:write']),'REST publishing grants no draft write authority');
actorDenied(fn()=>$policy->require($restActor,['restore:live']),'REST publishing grants no live restore authority');
$assetActor=$policy->fromRestCredential($rest['id'],'assets');
$policy->require($assetActor,['assets:read','assets:write','files:write','changes:apply']);
actorCheck(true,'Bound legacy asset grants enter only the fixed asset planner');
actorDenied(fn()=>$policy->require($assetActor,['publish:write']),'The REST asset adapter cannot inherit publication');
actorDenied(fn()=>$policy->require($assetActor,['forms:write']),'Legacy assets never infer permission to rewrite form definitions');
try {$policy->bindRestCredential($owner,$rest['id'],1);actorCheck(false,'Existing REST identity cannot be reassigned');}
catch (OperationException $error) {actorCheck($error->errorCode==='content_conflict','Existing REST identity cannot be reassigned');}
$policy->bindRestCredential($owner,$rest['id'],2);
actorCheck($db->scalar('SELECT COUNT(*) FROM agent_rest_owners WHERE key_id = ?',[$rest['id']])===1,'Same-account REST binding replay is harmless');
$db->update('users',['role'=>'viewer'],'id = 2');
actorDenied(fn()=>$policy->require($restActor,['publish:write']),'REST actor observes current user demotion');
$db->update('users',['role'=>'editor'],'id = 2');
$db->update('api_keys',['scopes'=>'[]'],'id = ?',[$rest['id']]);
actorDenied(fn()=>$policy->require($restActor,['publish:write']),'REST actor observes current scope narrowing');
$db->update('api_keys',['scopes'=>'["publish:trigger"]'],'id = ?',[$rest['id']]);
$policy->require($restActor,['publish:write']);
$_SERVER['HTTP_AUTHORIZATION']='Bearer '.$rest['key'];
actorDenied(fn()=>$service->authenticate(),'Bound REST credentials still cannot authenticate to MCP');
actorCheck(!in_array($rest['id'],array_column($service->list($owner),'id'),true),'MCP connection listing excludes bound REST credentials');
actorCheck(!in_array($read['id'],array_column($legacy->listKeys(),'id'),true),'REST key listing excludes MCP credentials');
$legacy->revokeKey($rest['id']);
try {$policy->require($restActor,['publish:write']);actorCheck(false,'Deleting a REST credential invalidates its retained actor');}
catch (OperationException $error) {actorCheck(in_array($error->errorCode,['credential_migration_required','permission_denied'],true),
    'Deleting a REST credential invalidates its retained actor');}
$fresh = $service->create($owner, 2, 'edit', 'Deleted user', null);
$db->delete('users', 'id = ?', [2]);
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $fresh['key'];
actorDenied(fn () => $service->authenticate(), 'Deleted users cannot authenticate');
actorCheck($legacy->authenticate()['status'] === AgentAuth::AUTH_INVALID_KEY, 'Deleted-user key never becomes a REST credential');
actorCheck($db->scalar('PRAGMA foreign_keys') == 1, 'Foreign keys stay enabled');
echo "Actor policy: {$checks} checks, " . count($errors) . " failures\n";
exit($errors ? 1 : 0);
