<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
require_once __DIR__ . '/helpers/RouterHeadingFixture.php';
use VoxelSite\{Database, DemoMode, Encryption, RouterSettings, Settings};
use VoxelSite\Tests\RouterHeadingFixture as Fixture;

$passed = 0; $errors = [];
function check(bool $ok, string $message): void { global $passed, $errors; $ok ? $passed++ : $errors[] = $message; }
function requestOwner(string $root, array $input): array {
    $child = proc_open([PHP_BINARY, __DIR__ . '/helpers/call-router-owner.php', $root],
        [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
    if (!is_resource($child)) { throw new RuntimeException('Cannot start owner endpoint probe'); }
    fwrite($pipes[0], json_encode($input, JSON_THROW_ON_ERROR)); fclose($pipes[0]);
    $stdout = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $stderr = stream_get_contents($pipes[2]); fclose($pipes[2]);
    if (proc_close($child) !== 0 || $stderr !== '') { throw new RuntimeException('Owner endpoint probe failed (output withheld)'); }
    $result = json_decode($stdout, true, 512, JSON_THROW_ON_ERROR);
    check($result['valid_json'] === true, 'Real router returns a JSON response');
    return $result;
}
function gateCalls(string $root): array {
    $path = $root . '/gate-calls.jsonl';
    return !is_file($path) ? [] : array_map(static fn($line) => json_decode($line, true, 512, JSON_THROW_ON_ERROR),
        file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));
}
function seedPending(Database $db, string $root, string $candidate): string {
    $id = bin2hex(random_bytes(16));
    $target = Fixture::manifest()['target'] + ['expected_file_hash' => hash_file('sha256', $root . '/_studio/preview/index.php')];
    $hash = hash('sha256', $candidate);
    $job = $db->insert('prompt_log', ['user_id' => 1, 'action_type' => 'inline_edit',
        'action_data' => json_encode(['governor_enforce' => ['candidate_hash' => $hash, 'pending_candidate_id' => $id]], JSON_THROW_ON_ERROR),
        'user_prompt' => 'Use this exact heading', 'ai_provider' => 'fake', 'ai_model' => 'fixture',
        'status' => 'error', 'error_message' => 'forbidden_claims', 'created_at' => gmdate('Y-m-d\TH:i:s\Z'), 'api_key_id' => null]);
    $db->insert('governor_pending_headings', ['id' => $id, 'prompt_log_id' => $job, 'candidate' => $candidate,
        'candidate_hash' => $hash, 'target_json' => json_encode($target, JSON_THROW_ON_ERROR),
        'preview_root_hash' => hash('sha256', realpath($root . '/_studio/preview')),
        'created_at' => gmdate('Y-m-d\TH:i:s\Z'), 'status' => 'pending', 'approval_id' => null]);
    return $id;
}
function pendingState(Database $db): array {
    return ['pending' => $db->query('SELECT * FROM governor_pending_headings ORDER BY id'),
        'approvals' => $db->query('SELECT * FROM governor_claim_overrides ORDER BY id'),
        'jobs' => $db->query('SELECT * FROM prompt_log ORDER BY id'), 'calls' => $db->query('SELECT * FROM ai_call_ledger ORDER BY rowid')];
}

$root = sys_get_temp_dir() . '/governor-owner-endpoint-' . bin2hex(random_bytes(8));
mkdir($root, 0700); $root = realpath($root);
file_put_contents($root . '/.governor-owner-endpoint-test', 'disposable');
Database::resetInstance();
$concurrent = [];
try {
    Fixture::copyTree(__DIR__ . '/../engine', $root . '/_studio/engine');
    Fixture::copyTree(__DIR__ . '/../api', $root . '/_studio/api');
    Fixture::copyTree(__DIR__ . '/fixtures/router-heading/site', $root . '/_studio/preview');
    mkdir($root . '/_studio/data', 0700); mkdir($root . '/_studio/logs', 0700); mkdir($root . '/assets', 0700);
    symlink(realpath(dirname(__DIR__, 2) . '/vendor'), $root . '/vendor');
    $db = Database::getInstance($root . '/_studio/data/studio.db');
    foreach (glob(__DIR__ . '/../engine/migrations/*.php') as $file) { $migration = require $file; ($migration['up'])($db); }
    $sessions = [];
    foreach (['owner', 'editor', 'viewer'] as $i => $role) {
        $uid = $db->insert('users', ['email' => $role . '@example.test', 'password_hash' => 'not-a-login', 'name' => 'Fixture',
            'role' => $role, 'created_at' => '2026-09-24', 'updated_at' => '2026-09-24']);
        $sessions[$role] = bin2hex(random_bytes(32));
        $db->insert('sessions', ['id' => $sessions[$role], 'user_id' => $uid, 'ip_address' => '127.0.0.1', 'user_agent' => 'fixture',
            'expires_at' => gmdate('Y-m-d\TH:i:s\Z', time() + 3600), 'created_at' => gmdate('Y-m-d\TH:i:s\Z')]);
    }
    $db->insert('pages', ['slug' => 'index', 'title' => 'Home', 'file_path' => 'index.php', 'page_type' => 'page',
        'created_at' => '2026-09-24', 'updated_at' => '2026-09-24']);
    $appKey = Encryption::generateKey(); $secret = bin2hex(random_bytes(32));
    file_put_contents($root . '/_studio/data/config.json', json_encode(['app_key' => $appKey], JSON_THROW_ON_ERROR));
    $settings = new Settings($db);
    $config = new RouterSettings($settings, static fn() => new Encryption($appKey));
    $settings->setMany($config->prepareUpdates(['governor.mode' => 'enforce', 'governor.typesafe_api_key' => $secret], 'owner'));
    $routeProbe = requestOwner($root, ['method' => 'GET', 'path' => '/governor/pending/' . str_repeat('0', 32)]);
    check($routeProbe['status'] === 401, 'Production owner pending route is registered and requires authentication');
    if ((int) $db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE name = 'governor_pending_headings'") !== 1) {
        throw new RuntimeException('Pending candidate migration is required for endpoint proof');
    }
    $candidate = 'The best bakery in the country';
    $id = seedPending($db, $root, $candidate);
    $getPath = '/governor/pending/' . $id; $postPath = $getPath . '/approve';
    $owner = ['session' => $sessions['owner'], 'csrf' => $sessions['owner']];
    $snapshot = Fixture::snapshot($root . '/_studio/preview');
    $before = pendingState($db);
    $denied = [
        ['unauthenticated read', ['method' => 'GET', 'path' => $getPath], 401],
        ['unauthenticated apply', ['method' => 'POST', 'path' => $postPath], 401],
        ['invalid session', ['method' => 'GET', 'path' => $getPath, 'session' => bin2hex(random_bytes(32))], 401],
        ['editor read', ['method' => 'GET', 'path' => $getPath, 'session' => $sessions['editor']], 403],
        ['editor apply', ['method' => 'POST', 'path' => $postPath, 'session' => $sessions['editor'], 'csrf' => $sessions['editor']], 403],
        ['viewer read', ['method' => 'GET', 'path' => $getPath, 'session' => $sessions['viewer']], 403],
        ['viewer apply', ['method' => 'POST', 'path' => $postPath, 'session' => $sessions['viewer'], 'csrf' => $sessions['viewer']], 403],
        ['missing CSRF', ['method' => 'POST', 'path' => $postPath, 'session' => $sessions['owner']], 403],
        ['wrong CSRF', ['method' => 'POST', 'path' => $postPath, 'session' => $sessions['owner'], 'csrf' => bin2hex(random_bytes(32))], 403],
        ['Bearer plus owner cookie read', ['method' => 'GET', 'path' => $getPath, 'authorization' => 'Bearer ' . bin2hex(random_bytes(32))] + $owner, 403],
        ['Bearer plus owner cookie apply', ['method' => 'POST', 'path' => $postPath, 'authorization' => 'Bearer ' . bin2hex(random_bytes(32))] + $owner, 403],
    ];
    foreach ($denied as [$label, $input, $status]) {
        $result = requestOwner($root, $input + ['body' => ['reason' => 'Owner accepts this exact wording.']]);
        check($result['status'] === $status && ($result['response']['ok'] ?? null) === false, "$label is refused by production routing/middleware");
        check(!str_contains(json_encode($result), $candidate), "$label cannot read the pending candidate");
        check(pendingState($db) === $before && gateCalls($root) === [] && Fixture::snapshot($root . '/_studio/preview') === $snapshot,
            "$label leaves candidate, audit, calls and files unchanged");
    }
    file_put_contents($root . '/.demo', '');
    foreach ([['GET', $getPath], ['POST', $postPath]] as [$method, $path]) {
        foreach ([$owner, ['session' => DemoMode::DEMO_SESSION_TOKEN, 'csrf' => DemoMode::DEMO_SESSION_TOKEN]] as $session) {
            $result = requestOwner($root, ['method' => $method, 'path' => $path, 'body' => ['reason' => 'Reason']] + $session);
            check($result['status'] === 403, 'Demo installation refuses pending read/apply for real and synthetic owner sessions');
            check(!str_contains(json_encode($result), $candidate), 'Demo response does not disclose pending candidate text');
            check(pendingState($db) === $before && gateCalls($root) === [] && Fixture::snapshot($root . '/_studio/preview') === $snapshot,
                'Demo refusal does not reveal/apply candidate or call Jev');
        }
    }
    unlink($root . '/.demo');
    foreach ([['candidate' => 'Different heading'], ['candidate_hash' => str_repeat('a', 64)], ['file_path' => '../index.php'],
        ['role' => 'owner'], ['user_id' => 1], ['approval_id' => 1]] as $extra) {
        $result = requestOwner($root, ['method' => 'POST', 'path' => $postPath, 'body' => ['reason' => 'Reason'] + $extra] + $owner);
        check($result['status'] === 422, 'Client cannot supply candidate/hash/path/identity/approval fields');
        check(pendingState($db) === $before && gateCalls($root) === [] && Fixture::snapshot($root . '/_studio/preview') === $snapshot,
            'Rejected client fields cause no call, audit or file mutation');
    }
    foreach ([[], ['reason' => ''], ['reason' => []]] as $body) {
        $result = requestOwner($root, ['method' => 'POST', 'path' => $postPath, 'body' => $body] + $owner);
        check($result['status'] === 422, 'Missing/empty/non-string reason is rejected');
    }
    foreach (['not-a-pending-id', str_repeat('f', 32)] as $unknown) {
        $result = requestOwner($root, ['method' => 'GET', 'path' => '/governor/pending/' . $unknown] + $owner);
        check(in_array($result['status'], [404, 422], true) && !str_contains(json_encode($result), $candidate),
            'Malformed or unknown pending identity reveals no candidate');
    }
    $read = requestOwner($root, ['method' => 'GET', 'path' => $getPath] + $owner);
    $data = $read['response']['data'] ?? [];
    check($read['status'] === 200 && ($read['response']['ok'] ?? false) === true && ($data['id'] ?? null) === $id,
        'Authenticated owner reads the production pending-candidate resource');
    check(($data['candidate'] ?? null) === $candidate && ($data['candidate_hash'] ?? null) === hash('sha256', $candidate)
        && ($data['file_path'] ?? null) === 'index.php' && ($data['source_address'] ?? null) === Fixture::manifest()['target']['source_address'],
        'Owner sees exact persisted candidate and source address before approval');
    check(pendingState($db) === $before && gateCalls($root) === [] && Fixture::snapshot($root . '/_studio/preview') === $snapshot,
        'Owner inspection is read-only and makes zero Jev calls');
    check(!str_contains(json_encode($read), $secret) && !str_contains(json_encode($read), $appKey)
        && !str_contains(json_encode($read), 'governor.typesafe_api_key'), 'Owner GET excludes provider and encryption secrets');
    $applied = requestOwner($root, ['method' => 'POST', 'path' => $postPath, 'body' => ['reason' => 'Owner has verified this claim.']] + $owner);
    check($applied['status'] === 200 && ($applied['response']['ok'] ?? false) === true, 'Owner consent applies through production endpoint');
    $calls = gateCalls($root);
    check(count($calls) === 1 && ($calls[0]['state']['candidate'] ?? null) === $candidate,
        'Production approval re-evaluates the exact pending candidate through the claim gate');
    $expected = $snapshot;
    $original = file_get_contents(__DIR__ . '/fixtures/router-heading/site/index.php');
    $replacement = '<h1 class="text-4xl font-bold">' . $candidate . '</h1>';
    $expected['index.php'] = hash('sha256', str_replace(Fixture::manifest()['target']['source_address'], $replacement, $original));
    check(Fixture::snapshot($root . '/_studio/preview') === $expected, 'Only the exact heading file changes; unrelated bytes remain identical');
    $row = $db->queryOne('SELECT * FROM governor_pending_headings WHERE id = ?', [$id]);
    check($row['status'] === 'applied' && is_int($row['approval_id']), 'Pending row records its completed owner decision');
    $audit = $db->queryOne('SELECT * FROM governor_claim_overrides WHERE id = ?', [$row['approval_id']]);
    check($audit !== null && $audit['user_id'] === 1 && $audit['candidate_hash'] === hash('sha256', $candidate)
        && $audit['consumed_at'] !== null, 'Applied decision has durable owner/hash/reason consumption');
    $after = pendingState($db);
    $replay = requestOwner($root, ['method' => 'POST', 'path' => $postPath, 'body' => ['reason' => 'Repeat']] + $owner);
    check($replay['status'] === 409 && pendingState($db) === $after && count(gateCalls($root)) === 1
        && Fixture::snapshot($root . '/_studio/preview') === $expected, 'Replay refuses with no new gate call or mutation');

    foreach (['stale', 'missing_key', 'gate_down'] as $fault) {
        file_put_contents($root . '/_studio/preview/index.php', $original);
        $pending = seedPending($db, $root, $candidate);
        if ($fault === 'stale') { file_put_contents($root . '/_studio/preview/index.php', "\n<!-- human edit -->", FILE_APPEND); }
        if ($fault === 'missing_key') { $settings->delete('governor.typesafe_api_key'); }
        $faultSnapshot = Fixture::snapshot($root . '/_studio/preview'); $callCount = count(gateCalls($root));
        $result = requestOwner($root, ['method' => 'POST', 'path' => '/governor/pending/' . $pending . '/approve',
            'body' => ['reason' => 'Reason'], 'gate_mode' => $fault === 'gate_down' ? 'down' : 'blocked'] + $owner);
        check($result['status'] === 409 && ($result['response']['ok'] ?? null) === false, "$fault refuses visibly");
        check(Fixture::snapshot($root . '/_studio/preview') === $faultSnapshot, "$fault does not apply any bytes");
        check(count(gateCalls($root)) === $callCount + ($fault === 'gate_down' ? 1 : 0), "$fault performs only permitted gate work");
        $refused = $db->queryOne('SELECT p.status, a.consumed_at FROM governor_pending_headings p
            LEFT JOIN governor_claim_overrides a ON a.id = p.approval_id WHERE p.id = ?', [$pending]);
        check($refused['status'] !== 'applied' && $refused['consumed_at'] === null, "$fault never consumes owner permission or records apply");
        if ($fault === 'missing_key') { $settings->setMany($config->prepareUpdates(['governor.typesafe_api_key' => $secret], 'owner')); }
    }
    // Keep the winning request inside its fake network call while competing
    // requests traverse the real router, middleware, pending CAS and endpoint.
    file_put_contents($root . '/_studio/preview/index.php', $original);
    $pending = seedPending($db, $root, $candidate);
    $callCount = count(gateCalls($root));
    for ($i = 0; $i < 4; $i++) {
        $child = proc_open([PHP_BINARY, __DIR__ . '/helpers/call-router-owner.php', $root],
            [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
        if (!is_resource($child)) { throw new RuntimeException('Cannot start owner endpoint probe'); }
        $concurrent[] = [$child, $pipes];
        fwrite($pipes[0], json_encode(['method' => 'POST', 'path' => '/governor/pending/' . $pending . '/approve',
            'body' => ['reason' => 'Concurrent exact-candidate approval.'], 'pause_gate' => true] + $owner, JSON_THROW_ON_ERROR));
        fclose($pipes[0]);
    }
    $deadline = microtime(true) + 5;
    while (!is_file($root . '/gate-ready') && microtime(true) < $deadline) { usleep(1000); }
    check(is_file($root . '/gate-ready'), 'One approval request reaches the paused claim gate');
    check(Fixture::snapshot($root . '/_studio/preview') === $snapshot, 'Concurrent approval cannot write while the gate is incomplete');
    $inFlight = $db->queryOne('SELECT p.status, a.consumed_at FROM governor_pending_headings p
        LEFT JOIN governor_claim_overrides a ON a.id = p.approval_id WHERE p.id = ?', [$pending]);
    check($inFlight['status'] === 'applying' && $inFlight['consumed_at'] === null,
        'Pending reservation precedes gate completion, but owner permission remains unconsumed');
    $db->exec('BEGIN IMMEDIATE');
    $db->exec('ROLLBACK');
    check(true, 'Pending approval holds no SQLite write transaction across the claim-gate call');
    file_put_contents($root . '/gate-release', 'release');
    $statuses = [];
    foreach ($concurrent as [$child, $pipes]) {
        $stdout = stream_get_contents($pipes[1]); fclose($pipes[1]);
        $stderr = stream_get_contents($pipes[2]); fclose($pipes[2]);
        check(proc_close($child) === 0 && $stderr === '', 'Concurrent owner request exits cleanly');
        $result = json_decode($stdout, true, 512, JSON_THROW_ON_ERROR);
        check($result['valid_json'] === true, 'Concurrent owner request returns production JSON');
        $statuses[] = $result['status'];
    }
    $concurrent = [];
    check(count(array_filter($statuses, static fn($status) => $status === 200)) === 1
        && count(array_filter($statuses, static fn($status) => $status === 409)) === 3,
        'Four concurrent owner POSTs produce one applied response and three conflicts');
    check(count(gateCalls($root)) === $callCount + 1 && Fixture::snapshot($root . '/_studio/preview') === $expected,
        'Concurrent owner POSTs gate exactly once and apply only the expected heading bytes');
    $final = $db->queryOne('SELECT p.status, a.consumed_at FROM governor_pending_headings p
        LEFT JOIN governor_claim_overrides a ON a.id = p.approval_id WHERE p.id = ?', [$pending]);
    check($final['status'] === 'applied' && $final['consumed_at'] !== null, 'Concurrent winner retains one linked, consumed owner decision');
    $diagnostics = json_encode(gateCalls($root), JSON_THROW_ON_ERROR);
    foreach (glob($root . '/_studio/logs/*') as $log) { if (is_file($log)) { $diagnostics .= file_get_contents($log); } }
    check(!str_contains($diagnostics, $secret) && !str_contains($diagnostics, $appKey), 'Transport state and production diagnostics contain no ephemeral secrets');
} catch (Throwable $error) {
    // Fixed harness errors are safe; backend/provider exception details are not.
    $errors[] = in_array($error->getMessage(), ['Pending candidate migration is required for endpoint proof',
        'Cannot start owner endpoint probe', 'Owner endpoint probe failed (output withheld)'], true)
        ? $error->getMessage() : 'Owner endpoint regression raised an unexpected exception (details withheld).';
} finally {
    foreach ($concurrent as [$child, $pipes]) {
        if (is_resource($child)) { proc_terminate($child); }
        foreach ($pipes as $pipe) { if (is_resource($pipe)) { fclose($pipe); } }
        if (is_resource($child)) { proc_close($child); }
    }
    Database::closeInstance();
    Fixture::remove($root);
}
foreach ($errors as $error) { echo "FAIL: {$error}\n"; }
echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
exit($errors === [] ? 0 : 1);
