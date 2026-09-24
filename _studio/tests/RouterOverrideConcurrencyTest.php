<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
require_once __DIR__ . '/helpers/RouterHeadingFixture.php';

use VoxelSite\{Database, Encryption, RouterClaimOverride, RouterSettings, Settings};
use VoxelSite\Tests\RouterHeadingFixture as Fixture;

// The subprocess executes this file with its own connection and configuration.
// Only ephemeral encryption material travels over stdin, never argv or a fixture.
if (($argv[1] ?? '') === '--contender') {
    try {
        $root = realpath($argv[2] ?? '');
        if ($root === false || !is_file($root . '/.governor-override-concurrency-test')
            || !str_starts_with($root, realpath(sys_get_temp_dir()) . '/')) { exit(2); }
        $input = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
        $db = Database::getInstance($root . '/studio.db');
        $config = new RouterSettings(new Settings($db), static fn() => new Encryption($input['app_key']));
        $service = new RouterClaimOverride($db, $config, $input['owner'], $root . '/preview', ['index.php']);
        file_put_contents($root . '/ready-' . (int) $argv[3], 'ready');
        $deadline = microtime(true) + 10;
        while (!is_file($root . '/start') && microtime(true) < $deadline) { usleep(1000); }
        if (!is_file($root . '/start')) { exit(3); }
        echo $service->consume($input['approval'], $input['target'], $input['candidate_hash']) ? 'consumed' : 'refused';
        Database::closeInstance();
        exit(0);
    } catch (Throwable) {
        // Never print exception/request/config values, including random test keys.
        fwrite(STDERR, "Override contender failed\n");
        exit(4);
    }
}

$passed = 0; $errors = [];
function check(bool $ok, string $message): void { global $passed, $errors; $ok ? $passed++ : $errors[] = $message; }
function unavailable(RouterClaimOverride $service, int $id, array $target, string $candidateHash): bool {
    try { $service->consume($id, $target, $candidateHash); return false; }
    catch (RuntimeException $error) { return $error->getMessage() === 'override_unavailable'; }
}
function report(): never {
    global $passed, $errors;
    foreach ($errors as $error) { echo "FAIL: {$error}\n"; }
    echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
    exit($errors === [] ? 0 : 1);
}
check(class_exists(RouterClaimOverride::class), 'RouterClaimOverride backend must exist before concurrency proof can run');
if ($errors !== []) { report(); }

$root = sys_get_temp_dir() . '/governor-override-concurrency-' . bin2hex(random_bytes(8));
mkdir($root, 0700);
$root = realpath($root);
file_put_contents($root . '/.governor-override-concurrency-test', 'disposable');
$oldLog = ini_set('error_log', $root . '/warnings.log');
$children = [];
Database::resetInstance();
try {
    Fixture::copyTree(__DIR__ . '/fixtures/router-heading/site', $root . '/preview');
    $snapshot = Fixture::snapshot($root . '/preview');
    $target = Fixture::manifest()['target'];
    $target['expected_file_hash'] = hash_file('sha256', $root . '/preview/index.php');
    $candidateHash = hash('sha256', 'The best bakery in the country');
    $db = Database::getInstance($root . '/studio.db');
    foreach (glob(__DIR__ . '/../engine/migrations/*.php') as $path) { $migration = require $path; ($migration['up'])($db); }
    $owner = (int) $db->insert('users', ['email' => 'fixture@example.test', 'password_hash' => 'not-a-login',
        'name' => 'Fixture', 'role' => 'owner', 'created_at' => '2026-09-24', 'updated_at' => '2026-09-24']);
    $appKey = Encryption::generateKey();
    $secret = bin2hex(random_bytes(32));
    $settings = new Settings($db);
    $config = new RouterSettings($settings, static fn() => new Encryption($appKey));
    $settings->setMany($config->prepareUpdates(['governor.mode' => 'enforce', 'governor.typesafe_api_key' => $secret], 'owner'));
    $service = new RouterClaimOverride($db, $config, $owner, $root . '/preview', ['index.php']);
    $approval = $service->approve($target, $candidateHash, 'Owner accepts this exact claim.');
    check($approval > 0, 'Owner approval receives a persisted identity');
    $before = $db->queryOne('SELECT * FROM governor_claim_overrides WHERE id = ?', [$approval]);
    check($before !== null && $before['consumed_at'] === null, 'Approval starts unconsumed');

    for ($i = 0; $i < 6; $i++) {
        $process = proc_open([PHP_BINARY, __FILE__, '--contender', $root, (string) $i],
            [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
        if (!is_resource($process)) { throw new RuntimeException('Cannot start isolated contender'); }
        $children[] = [$process, $pipes];
        fwrite($pipes[0], json_encode(['app_key' => $appKey, 'owner' => $owner, 'approval' => $approval,
            'target' => $target, 'candidate_hash' => $candidateHash], JSON_THROW_ON_ERROR));
        fclose($pipes[0]);
    }
    $deadline = microtime(true) + 5;
    while (count(glob($root . '/ready-*')) < 6 && microtime(true) < $deadline) { usleep(1000); }
    check(count(glob($root . '/ready-*')) === 6, 'All six independent connections reach the consumption barrier');
    file_put_contents($root . '/start', 'start');
    $results = [];
    foreach ($children as [$process, $pipes]) {
        $results[] = stream_get_contents($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[1]); fclose($pipes[2]);
        check(proc_close($process) === 0 && $stderr === '', 'Independent override contender exits cleanly');
    }
    $children = [];
    check(count(array_filter($results, static fn($value) => $value === 'consumed')) === 1
        && count(array_filter($results, static fn($value) => $value === 'refused')) === 5,
        'Six simultaneous consumers grant exactly one authorization');
    $after = $db->queryOne('SELECT * FROM governor_claim_overrides WHERE id = ?', [$approval]);
    check(is_string($after['consumed_at']) && $after['consumed_at'] !== ''
        && $db->count('governor_claim_overrides', 'consumed_at IS NOT NULL') === 1, 'Exactly one durable consumed timestamp exists');
    $after['consumed_at'] = null;
    check($after === $before, 'Contenders preserve owner, reason and exact approval binding');
    check(!$service->consume($approval, $target, $candidateHash), 'Parent connection also refuses replay');

    $nested = $service->approve($target, $candidateHash, 'Separate transaction refusal proof.');
    $db->beginTransaction();
    $db->insert('settings', ['key' => 'override-test-transaction', 'value' => 'caller-owned', 'updated_at' => '2026-09-24']);
    check(unavailable($service, $nested, $target, $candidateHash) && $db->getPdo()->inTransaction(),
        'Nested consume refuses without committing or rolling back the caller transaction');
    check($db->queryOne('SELECT value FROM settings WHERE key = ?', ['override-test-transaction'])['value'] === 'caller-owned'
        && $db->queryOne('SELECT consumed_at FROM governor_claim_overrides WHERE id = ?', [$nested])['consumed_at'] === null,
        'Nested refusal preserves caller changes and leaves approval unconsumed');
    $db->rollBack();
    check($db->queryOne('SELECT value FROM settings WHERE key = ?', ['override-test-transaction']) === null,
        'Caller retains control over rolling back its own transaction');

    foreach (['ABORT', 'IGNORE'] as $behavior) {
        $id = $service->approve($target, $candidateHash, 'Separate durable update failure proof.');
        $row = $db->queryOne('SELECT * FROM governor_claim_overrides WHERE id = ?', [$id]);
        $raise = $behavior === 'ABORT' ? "RAISE(ABORT, 'fixture failure')" : 'RAISE(IGNORE)';
        $db->exec('CREATE TRIGGER refuse_override BEFORE UPDATE ON governor_claim_overrides BEGIN SELECT ' . $raise . '; END');
        check(unavailable($service, $id, $target, $candidateHash), 'Failed or ignored audit update refuses authorization');
        check(!$db->getPdo()->inTransaction() && $db->queryOne('SELECT * FROM governor_claim_overrides WHERE id = ?', [$id]) === $row,
            'Audit failure leaves no partial consumption or open service transaction');
        $db->exec('DROP TRIGGER refuse_override');
        check($service->consume($id, $target, $candidateHash), 'Approval remains available after failed consumption is rolled back');
    }
    $audit = json_encode($db->query('SELECT * FROM governor_claim_overrides'), JSON_THROW_ON_ERROR);
    check(!str_contains($audit, $secret) && !str_contains($audit, $appKey), 'Audit rows contain no ephemeral provider or encryption key');
    $db->exec('DROP TABLE governor_claim_overrides');
    check(unavailable($service, $nested, $target, $candidateHash), 'Missing audit schema refuses authorization');
    check((int) $db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE name = 'governor_claim_overrides'") === 0,
        'Consumption never reconstructs missing schema');
    check(Fixture::snapshot($root . '/preview') === $snapshot, 'Approval and consumption never mutate preview files');
} catch (Throwable) {
    $errors[] = 'Isolated override concurrency proof raised an unexpected exception (details withheld).';
} finally {
    foreach ($children as [$process, $pipes]) {
        if (is_resource($process)) { proc_terminate($process); }
        foreach ($pipes as $pipe) { if (is_resource($pipe)) { fclose($pipe); } }
        if (is_resource($process)) { proc_close($process); }
    }
    Database::closeInstance();
    ini_set('error_log', $oldLog);
    Fixture::remove($root);
}
report();
