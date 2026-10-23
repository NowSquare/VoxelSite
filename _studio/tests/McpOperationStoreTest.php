<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Agent\{ActorPolicy, CredentialService, OperationActor, OperationException, OperationStore};
use VoxelSite\{Database, SiteMutationLock};

$checks = 0;
function opCheck(bool $condition, string $label): void {
    global $checks; $checks++;
    if (!$condition) { fwrite(STDERR, "FAIL {$label}\n"); exit(1); }
    echo "PASS {$label}\n";
}
function opReject(callable $callback, string $code, string $label): void {
    try { $callback(); } catch (OperationException $e) { opCheck($e->errorCode === $code, $label); return; }
    opCheck(false, $label);
}
opCheck(class_exists(OperationStore::class), 'Durable operation store exists');
$root = sys_get_temp_dir() . '/vs-mcp-operations-' . bin2hex(random_bytes(6));
mkdir($root, 0700, true);
putenv('VS_TEST_MUTATION_LOCK=' . $root . '/site-mutation.lock');
$db = Database::getInstance($root . '/studio.db');
$db->exec("CREATE TABLE users (id INTEGER PRIMARY KEY, role TEXT); INSERT INTO users VALUES(1,'owner')");
$db->exec('CREATE TABLE site_workspace_state (id INTEGER PRIMARY KEY, format INTEGER, draft_version INTEGER,
    release_id TEXT, reservation_operation_id TEXT, updated_at INTEGER)');
$db->exec('INSERT INTO site_workspace_state VALUES (1,2,0,NULL,NULL,0)');
foreach (['014_agent_operation_identity', '017_agent_operations'] as $name) {
    $migration = require dirname(__DIR__) . '/engine/migrations/' . $name . '.php'; ($migration['up'])($db);
}
$policy = new ActorPolicy($db);
$credentials = new CredentialService($db);
$owner = new OperationActor('user', 1, null, [], 'studio_configured', null);
$key = $credentials->create($owner, 1, 'edit', 'Test author', null);
$other = $credentials->create($owner, 1, 'edit', 'Other author', null);
$actor = $policy->fromCredential($key['id']);
$otherActor = $policy->fromCredential($other['id']);
$store = new OperationStore($db, $policy);
$request = (object) ['change_set_id' => 'change_test', 'digest' => str_repeat('a',64)];
$op = $store->prepare($actor, 'operation-0001', 'changes.apply', $request, 'draft:0');
$again = $store->prepare($actor, 'operation-0001', 'changes.apply', (object) ['digest' => str_repeat('a',64), 'change_set_id' => 'change_test'], 'draft:0');
opCheck($op['id'] === $again['id'], 'Canonical replay reuses one operation');
opReject(fn () => $store->prepare($actor, 'operation-0001', 'changes.apply', (object) ['change_set_id' => 'different'], 'draft:0'), 'idempotency_conflict', 'Same identity with changed request fails');
opReject(fn () => $store->get($otherActor, 'operation-0001'), 'permission_denied', 'Another credential cannot inspect operation');
$lock = SiteMutationLock::acquire();
$claimed = $store->claim($actor, 'operation-0001', 0);
opCheck($claimed['state'] === 'applying' && $db->scalar('SELECT reservation_operation_id FROM site_workspace_state') === $op['id'], 'Claim durably reserves workspace');
$nested = SiteMutationLock::acquire();
opCheck(SiteMutationLock::held(), 'Nested shared services inherit the claimed reservation');
unset($nested);
try { $clone = clone $lock; opCheck(false, 'Lock guards cannot be cloned'); }
catch (Error) { opCheck(true, 'Lock guards cannot be cloned'); }
unset($lock);
opReject(fn () => SiteMutationLock::acquire(), 'site_busy', 'Every ordinary writer observes persisted reservation');
$readsBefore = $db->scalar('SELECT updated_at FROM agent_operations WHERE id = ?', [$op['id']]);
$read = $store->get($actor, 'operation-0001');
opCheck($read['state'] === 'applying' && $db->scalar('SELECT updated_at FROM agent_operations WHERE id = ?', [$op['id']]) === $readsBefore, 'Status reads never resume or modify operations');
$lock = SiteMutationLock::acquire(null, $db, $op['id']);
opReject(fn () => $store->claim($actor, 'operation-0001', 0), 'site_busy', 'Active lease cannot be taken over');
$store->checkpoint($actor, 'operation-0001', $claimed['lease_token'], 'files', ['next_file' => 1], ['paths' => ['index.php']]);
$paused = $store->get($actor, 'operation-0001');
opCheck($paused['checkpoint_number'] === 1 && $paused['lease_expires_at'] === null, 'Checkpoint releases worker lease while retaining workspace');
opReject(fn () => $store->claim($actor, 'operation-0001', 0), 'content_conflict', 'Stale continuation checkpoint fails');
$claimed = $store->claim($actor, 'operation-0001', 1);
opReject(fn () => $store->finish($actor, 'operation-0001', 'wrong-lease', 'succeeded', ['ok' => true]), 'content_conflict', 'Only claiming worker can commit outcome');
$store->finish($actor, 'operation-0001', $claimed['lease_token'], 'succeeded', ['changed_paths' => ['index.php'], 'provider_calls' => 0], 'draft:1');
opCheck($db->scalar('SELECT reservation_operation_id FROM site_workspace_state') === null, 'Verified terminal outcome releases reservation');
$done = $store->prepare($actor, 'operation-0001', 'changes.apply', $request, 'draft:1');
opCheck($done['state'] === 'succeeded' && $done['result']['changed_paths'] === ['index.php'], 'Lost-response retry returns retained exact result');
unset($lock);
$failure = $store->prepare($actor, 'operation-0002', 'changes.apply', $request, 'draft:1');
$lock = SiteMutationLock::acquire(null, $db, $failure['id']);
$claimed = $store->claim($actor, 'operation-0002', 0);
$store->finish($actor, 'operation-0002', $claimed['lease_token'], 'recovery_required', ['restored' => false]);
opCheck($db->scalar('SELECT reservation_operation_id FROM site_workspace_state') === $failure['id'], 'Unverified recovery preserves reservation');
unset($lock);
opReject(fn () => SiteMutationLock::acquire(), 'recovery_required', 'Incomplete recovery blocks ordinary writes');
$lock = SiteMutationLock::acquire(null,$db,$failure['id']);
$repair = $store->claimRecovery($actor,'operation-0002',['files:write','changes:apply']);
$store->finish($actor,'operation-0002',$repair['lease_token'],'failed_restored',['restored'=>true]);
opCheck($store->get($actor,'operation-0002')['state']==='failed_restored'
    && $db->scalar('SELECT reservation_operation_id FROM site_workspace_state')===null,'Explicit verified recovery resolves retained reservation');
unset($lock);
$credentials->revoke($owner, $key['id']);
opReject(fn () => $store->get($actor, 'operation-0001'), 'permission_denied', 'Revocation applies to retained operation reads');
echo "Operation store: {$checks} checks passed\n";
