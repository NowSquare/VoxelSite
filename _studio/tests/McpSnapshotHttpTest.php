<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';

require_once dirname(__DIR__) . '/engine/bootstrap.php';
require __DIR__ . '/fixtures/mcp/ServiceFixture.php';
use VoxelSite\{Database, Logger, Migrator, Settings, SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy, CanonicalJson, CredentialService, OperationActor, OperationException, OperationStore, SnapshotDeletionService};

$root = realpath(sys_get_temp_dir()) . '/vs-snapshot-http-' . bin2hex(random_bytes(8));
$studio = $root . '/_studio'; $data = $studio . '/data'; $checks = 0; $server = null;
function checkHttpSnapshot(bool $ok, string $label): void {
    global $checks; $checks++;
    if (!$ok) throw new RuntimeException('FAIL ' . $label);
    echo 'PASS ' . $label . "\n";
}
function clearHttpSnapshot(string $path): void {
    if (is_file($path) || is_link($path)) { unlink($path); return; }
    if (!is_dir($path)) return;
    foreach (scandir($path) as $name) if ($name !== '.' && $name !== '..') clearHttpSnapshot($path . '/' . $name);
    rmdir($path);
}
foreach (['_studio/data/actions', '_studio/data/snapshots', '_studio/preview/assets/css', 'assets'] as $path) mkdir($root . '/' . $path, 0700, true);
if (realpath($root) !== $root || !str_starts_with($root, realpath(sys_get_temp_dir()) . '/vs-snapshot-http-')) throw new RuntimeException('Temporary canonical fixture required.');
foreach (['VS_TEST_PREVIEW_DIR' => $studio . '/preview', 'VS_TEST_DOC_ROOT' => $root, 'VS_TEST_ASSETS_DIR' => $root . '/assets',
    'VS_TEST_MUTATION_LOCK' => $data . '/site.lock', 'VS_TEST_WORKSPACE_STATE_DIR' => $data . '/workspace',
    'VS_TEST_REVISIONS_DIR' => $studio . '/revisions', 'VS_TEST_SNAPSHOT_DIR' => $data . '/snapshots',
    'VS_TEST_ACTIONS_DIR' => $data . '/actions'] as $key => $value) putenv($key . '=' . $value);
foreach (['logDir' => $data, 'initialized' => true] as $key => $value) (new ReflectionProperty(Logger::class, $key))->setValue(null, $value);
try {
    Database::resetInstance(); $db = Database::getInstance($data . '/studio.db');
    (new Migrator($db, new Settings($db)))->run();
    foreach ([1 => 'owner', 2 => 'editor'] as $id => $role) {
        $db->insert('users', ['id' => $id, 'role' => $role, 'email' => $role . '@fixture.invalid', 'name' => $role,
            'password_hash' => 'not-login', 'created_at' => now(), 'updated_at' => now()]);
        $db->insert('sessions', ['id' => str_repeat((string) $id, 64), 'user_id' => $id, 'ip_address' => '127.0.0.1',
            'user_agent' => 'fixture', 'expires_at' => gmdate('c', time() + 3600), 'created_at' => now()]);
    }
    $db->update('site_workspace_state', ['format' => 2], 'id=1');
    file_put_contents($studio . '/preview/.htaccess', SiteWorkspace::ACCESS_MARKER . "\nRequire all denied\nDeny from all\n");
    file_put_contents($studio . '/preview/index.php', '<main>Captured draft</main>');
    file_put_contents($studio . '/preview/assets/css/style.css', ':root{--color:red}');
    file_put_contents($root . '/index.php', 'Published stays fixed');
    \VoxelSite\Tests\StudioRuntimeFixture::copy($root);
    file_put_contents($data . '/config.json', json_encode(['app_key' => VoxelSite\Encryption::generateKey()]));
    $socket = stream_socket_server('tcp://127.0.0.1:0', $errno, $error);
    if (!$socket) throw new RuntimeException('Loopback unavailable: ' . $error);
    $port = (int) substr(strrchr(stream_socket_get_name($socket, false), ':'), 1); fclose($socket);
    $server = proc_open([PHP_BINARY, '-S', '127.0.0.1:' . $port, '-t', $root], [['pipe', 'r'],
        ['file', $root . '/server.log', 'a'], ['file', $root . '/server.log', 'a']], $pipes, $root);
    fclose($pipes[0]);
    $http = function (string $method, string $path, ?array $body = null, int $user = 1, bool $csrf = true) use ($port): array {
        $curl = curl_init('http://127.0.0.1:' . $port . '/_studio/api/router.php?_path=' . rawurlencode($path));
        $headers = ['Content-Type: application/json', 'Cookie: vs_session=' . str_repeat((string) $user, 64)];
        if ($csrf) $headers[] = 'X-VS-Token: ' . str_repeat((string) $user, 64);
        curl_setopt_array($curl, [CURLOPT_CUSTOMREQUEST => $method, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_HTTPHEADER => $headers]);
        if ($body !== null) curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($body ?: new stdClass()));
        $raw = curl_exec($curl);
        return ['status' => curl_getinfo($curl, CURLINFO_HTTP_CODE), 'body' => json_decode((string) $raw, true), 'raw' => $raw];
    };
    $complete = function (string $method, string $path, array $input) use ($http): array {
        $response = $http($method, $path, $input);
        for ($i = 0; ($response['body']['data']['operation']['status'] ?? '') === 'applying' && $i < 50; $i++) {
            $response = $http($method, $path, $input + ['checkpoint' => $response['body']['data']['operation']['checkpoint']]);
        }
        return $response;
    };
    for ($i = 0; $i < 50; $i++) { if ($probe = @fsockopen('127.0.0.1', $port, $errno, $error, .1)) { fclose($probe); break; } usleep(20000); }
    checkHttpSnapshot($http('POST', '/snapshots', ['label' => 'Old body'])['status'] === 422, 'Legacy create URL rejects requests without stable identity and explicit domain');
    $captureInput = ['operation_id' => 'http-snapshot-create', 'domain' => 'draft', 'label' => 'HTTP capture'];
    checkHttpSnapshot($http('POST', '/snapshots', $captureInput, 1, false)['status'] === 403, 'Snapshot capture retains Studio CSRF protection');
    $capture = $complete('POST', '/snapshots', $captureInput);
    if (($capture['body']['data']['operation']['status'] ?? '') !== 'succeeded') throw new RuntimeException(json_encode($capture));
    $id = $capture['body']['data']['snapshot_id'];
    checkHttpSnapshot(str_starts_with($id, 'snapshot_'), 'Legacy create URL creates a shared explicit-domain capture');
    checkHttpSnapshot(CanonicalJson::digest($http('POST', '/snapshots', $captureInput)['body']) === CanonicalJson::digest($capture['body']), 'HTTP capture retries return the retained result');
    $listed = $http('GET', '/snapshots');
    checkHttpSnapshot(in_array($id, array_column($listed['body']['data']['snapshots'], 'snapshot_id'), true)
        && isset($listed['body']['data']['inventory_version']), 'Default history GET uses the shared paginated inventory');
    file_put_contents($studio . '/preview/index.php', '<main>Newer draft</main>');
    $db->exec('UPDATE site_workspace_state SET draft_version=draft_version+1 WHERE id=1');
    checkHttpSnapshot($http('POST', '/snapshots/' . $id . '/restore', [])['status'] === 422
        && file_get_contents($studio . '/preview/index.php') === '<main>Newer draft</main>', 'Legacy restore URL cannot bypass the exact review');
    $review = $http('POST', '/snapshots/' . $id . '/prepare-restore', ['request_id' => 'http-snapshot-review', 'domain' => 'draft']);
    if (($review['body']['ok'] ?? false) !== true) throw new RuntimeException(json_encode($review));
    $applyInput = ['operation_id' => 'http-snapshot-restore', 'plan_id' => $review['body']['data']['plan_id'], 'digest' => $review['body']['data']['digest']];
    $restored = $complete('POST', '/snapshots/' . $id . '/restore', $applyInput);
    checkHttpSnapshot(($restored['body']['data']['operation']['status'] ?? '') === 'succeeded'
        && file_get_contents($studio . '/preview/index.php') === '<main>Captured draft</main>'
        && file_get_contents($root . '/index.php') === 'Published stays fixed', 'Legacy restore alias applies the sealed draft plan and preserves publication');
    checkHttpSnapshot($http('GET', '/snapshots/' . $id . '/delete-review')['body']['data']['protected'], 'HTTP deletion review protects a referenced capture');
    $fresh = $complete('POST', '/snapshots', ['operation_id' => 'http-capture-for-delete', 'domain' => 'draft', 'label' => 'Delete me']);
    $freshId = $fresh['body']['data']['snapshot_id'];
    $deletionReview = $http('GET', '/snapshots/' . $freshId . '/delete-review');
    checkHttpSnapshot(!$deletionReview['body']['data']['protected'] && count($deletionReview['body']['data']['files']) > 0, 'HTTP deletion review exposes exact archive hashes');
    $deleteInput = ['operation_id' => 'http-delete-snapshot', 'version' => $deletionReview['body']['data']['version']];
    $deleted = $complete('DELETE', '/snapshots/' . $freshId, $deleteInput);
    checkHttpSnapshot(($deleted['body']['data']['deleted'] ?? false) && !is_dir($data . '/agent/snapshots/' . $freshId), 'HTTP deletion uses the retained shared operation');
    checkHttpSnapshot(CanonicalJson::digest($http('DELETE', '/snapshots/' . $freshId, $deleteInput)['body']) === CanonicalJson::digest($deleted['body']), 'HTTP deletion retry remains available after archive removal');
    file_put_contents($data . '/snapshots/legacy.zip', 'Legacy ZIP fixture');
    $legacyId = $db->insert('snapshots', ['filename' => 'legacy.zip', 'snapshot_type' => 'manual', 'label' => 'Legacy', 'file_count' => 1, 'size_bytes' => 18, 'created_at' => now()]);
    $legacyReview = $http('GET', '/snapshots/' . $legacyId . '/delete-review');
    $legacyDone = $complete('DELETE', '/snapshots/' . $legacyId, ['operation_id' => 'http-delete-legacy', 'version' => $legacyReview['body']['data']['version']]);
    checkHttpSnapshot(($legacyDone['body']['data']['snapshot_id'] ?? '') === 'legacy_' . $legacyId
        && !file_exists($data . '/snapshots/legacy.zip'), 'Numeric legacy archive URLs are scoped aliases of shared deletion');
    $recoverCapture = $complete('POST', '/snapshots', ['operation_id' => 'http-capture-recovery', 'domain' => 'draft', 'label' => 'Recover deletion']);
    $recoverId = $recoverCapture['body']['data']['snapshot_id'];
    $workspace = new SiteWorkspace($db, $studio . '/preview', $root, $data . '/workspace', $root . '/assets');
    $policy = new ActorPolicy($db); $owner = new OperationActor('user', 1, null, [], 'studio_configured', null);
    $credential = (new CredentialService($db))->create($owner, 2, 'edit', 'Archive editor', null);
    $externalActor = $policy->fromCredential($credential['id']);
    $operations = new OperationStore($db, $policy, $workspace->mutationLockPath());
    $deletions = new SnapshotDeletionService($db, $policy, $workspace, $operations, $data . '/agent/snapshots', $data . '/snapshots', 1);
    $recoveryReview = $deletions->inspect($externalActor, (object) ['snapshot_id' => $recoverId]);
    $partial = $deletions->delete($externalActor, (object) ['operation_id' => 'http-revoked-delete', 'snapshot_id' => $recoverId, 'version' => $recoveryReview['version']]);
    $operation = $operations->get($externalActor, $partial['operation_id']);
    $db->update('studio_mcp_credentials', ['revoked_at' => time()], 'key_id=?', [$credential['id']]);
    $refused = false;
    try { $deletions->continue($externalActor, $partial['operation_id'], $partial['checkpoint']); }
    catch (OperationException $error) { $refused = $error->errorCode === 'permission_denied'; }
    checkHttpSnapshot($refused, 'Revoked snapshot deletion actor cannot continue');
    $ownerReview = $http('POST', '/settings/recovery/' . $operation['id'] . '/review', []);
    checkHttpSnapshot(($ownerReview['body']['data']['eligible'] ?? false) && count($ownerReview['body']['data']['paths']) > 0,
        'Studio owner recovery resolves the same canonical snapshot archive paths');
    $ownerResult = $http('POST', '/settings/recovery/' . $operation['id'] . '/restore',
        ['review_id' => $ownerReview['body']['data']['review_id'], 'digest' => $ownerReview['body']['data']['digest']]);
    checkHttpSnapshot(($ownerResult['body']['data']['status'] ?? '') === 'failed_restored'
        && $ownerResult['body']['data']['original_actor']['credential_id'] === $credential['id']
        && $deletions->inspect($owner, (object) ['snapshot_id' => $recoverId])['version'] === $recoveryReview['version'],
        'Owner HTTP recovery restores exact originals without changing revoked actor attribution');
    $db->insert('conversations', ['id' => 'http-conversation', 'user_id' => 1, 'title' => 'Owner conversation', 'created_at' => now(), 'updated_at' => now()]);
    $promptId = $db->insert('prompt_log', ['conversation_id' => 'http-conversation', 'user_id' => 1, 'user_prompt' => 'Fixture question',
        'ai_response' => '<message>Fixture response</message>', 'ai_provider' => 'openai', 'ai_model' => 'fixture',
        'status' => 'streaming', 'created_at' => '2000-01-01T00:00:00Z']);
    $detail = $http('GET', '/ai/conversations/http-conversation');
    checkHttpSnapshot(($detail['body']['data']['redacted'] ?? false) && ($detail['body']['data']['conversation']['prompts'][0]['interrupted'] ?? false),
        'Conversation detail HTTP route delegates to shared redacted diagnostics');
    checkHttpSnapshot($http('GET', '/ai/conversations/http-conversation', null, 2)['status'] === 404, 'Conversation detail HTTP route enforces current account ownership');
    checkHttpSnapshot($db->scalar('SELECT status FROM prompt_log WHERE id=?', [$promptId]) === 'streaming', 'Conversation detail GET never repairs interrupted state');
} catch (Throwable $error) {
    echo 'Fixture retained at ' . $root . "\n";
    throw $error;
} finally {
    if (is_resource($server)) { proc_terminate($server); proc_close($server); }
    Database::resetInstance();
}
clearHttpSnapshot($root);
echo $checks . " snapshot and conversation HTTP checks passed.\n";
