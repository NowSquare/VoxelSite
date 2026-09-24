<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
require_once __DIR__ . '/helpers/RouterHeadingFixture.php';
use VoxelSite\{AICallLedger, Database, Encryption, FileManager, RouterClaimOverride, RouterSettings, RouterSecrets, Settings, StagedHeadingPatch};
use VoxelSite\Tests\{RouterHeadingFixture as Fixture, HeadingFakeProvider};

$passed = 0; $errors = [];
function check(bool $ok, string $message): void { global $passed, $errors; $ok ? $passed++ : $errors[] = $message; }
function finish(): never {
    global $passed, $errors;
    foreach ($errors as $error) { echo "FAIL: {$error}\n"; }
    echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
    exit($errors === [] ? 0 : 1);
}
check(class_exists(RouterClaimOverride::class), 'Owner override backend must exist');
check(is_file(__DIR__ . '/../engine/migrations/009_router_claim_overrides.php'), 'Owner decisions must have durable audit storage');
if ($errors !== []) { finish(); }

class OverrideWriterProbe extends FileManager {
    public static int $writes = 0;
    public function writeGovernedFile(string $path, string $hash, string $content, string $absolute): void {
        self::$writes++; parent::writeGovernedFile($path, $hash, $content, $absolute);
    }
    public function writeFile(string $path, string $content): ?string { throw new RuntimeException('Legacy writer forbidden'); }
    public function compileTailwind(): array { throw new RuntimeException('CSS forbidden'); }
}
$fixture = Fixture::manifest();
$db = Database::getInstance(':memory:');
foreach (glob(__DIR__ . '/../engine/migrations/*.php') as $path) { $migration = require $path; ($migration['up'])($db); }
$migration = require __DIR__ . '/../engine/migrations/009_router_claim_overrides.php';
($migration['up'])($db);
foreach (['owner', 'editor', 'viewer', 'owner'] as $i => $role) {
    $db->insert('users', ['email' => "fixture{$i}@example.test", 'password_hash' => 'not-a-login', 'name' => 'Fixture',
        'role' => $role, 'created_at' => '2026-09-24', 'updated_at' => '2026-09-24']);
}
$settings = new Settings($db);
$encryption = new Encryption(Encryption::generateKey());
$secret = bin2hex(random_bytes(32));
$cipher = $encryption->encrypt($secret);
$config = new RouterSettings($settings, fn() => $encryption);
$reset = function () use ($settings, $cipher, $db): void {
    $settings->setMany(['governor.mode' => 'enforce', RouterSecrets::KEY => $cipher]);
    $db->update('users', ['role' => 'owner'], 'id = 1');
};
$reset();
$candidate = 'The best bakery in the country';
$candidateHash = hash('sha256', $candidate);
$root = Fixture::create();
$previousPreview = getenv('VS_TEST_PREVIEW_DIR'); $previousAssets = getenv('VS_TEST_ASSETS_DIR');
try {
    $target = $fixture['target'] + ['expected_file_hash' => hash_file('sha256', $root . '/index.php')];
    $service = new RouterClaimOverride($db, $config, 1, $root, ['index.php', 'bakery/index.php']);
    $before = Fixture::snapshot($root);
    $id = $service->approve($target, $candidateHash, 'Owner verified this exact wording.');
    $row = $db->queryOne('SELECT * FROM governor_claim_overrides WHERE id = ?', [$id]);
    check($row['user_id'] === 1 && $row['candidate_hash'] === $candidateHash, 'Audit records the real owner and exact candidate hash');
    check($row['file_path'] === 'index.php' && $row['source_address'] === $target['source_address']
        && $row['content_hash'] === $target['content_hash'] && $row['expected_file_hash'] === $target['expected_file_hash'], 'Audit binds canonical target and original span/whole-file hashes');
    check($row['reason'] === 'Owner verified this exact wording.' && strtotime($row['created_at']) !== false
        && abs(time() - strtotime($row['created_at'])) <= 5 && $row['consumed_at'] === null, 'Reason and server timestamp stored before any consumption');
    check(Fixture::snapshot($root) === $before, 'Approval alone never mutates the site');
    check(!str_contains(json_encode($row), $candidate) && !str_contains(json_encode($row), $secret)
        && !str_contains(json_encode($row), $cipher), 'Audit contains no candidate prose or credentials');
    foreach ([2, 3, 999] as $user) {
        try { (new RouterClaimOverride($db, $config, $user, $root, ['index.php']))->approve($target, $candidateHash, 'Reason'); check(false, 'Non-owner refused'); }
        catch (RuntimeException $e) { check($e->getMessage() === 'override_forbidden', 'Role is resolved from users, never a supplied role label'); }
    }
    foreach (['', '   ', "\u{00a0}", str_repeat('x', 1001), "reason\nmore", $secret, $cipher, "\xff"] as $reason) {
        try { $service->approve($target, $candidateHash, $reason); check(false, 'Invalid reason refused'); }
        catch (RuntimeException $e) { check($e->getMessage() === 'override_invalid', 'Blank/oversized/invalid/secret reason refuses safely'); }
    }
    foreach (['', str_repeat('a', 63), str_repeat('A', 64), $secret, $secret . 'x'] as $hash) {
        try { $service->approve($target, $hash, 'Reason'); check(false, 'Malformed candidate hash refused'); }
        catch (RuntimeException $e) { check($e->getMessage() === 'override_invalid', 'Candidate SHA-256 must be canonical'); }
    }
    foreach ([['file_path' => '../index.php'], ['file_path' => './index.php'], ['file_path' => 'missing.php'],
        ['source_address' => 'missing'], ['source_address' => $secret], ['content_hash' => str_repeat('0', 64)],
        ['expected_file_hash' => null], ['expected_file_hash' => str_repeat('0', 64)]] as $change) {
        try { $service->approve(array_replace($target, $change), $candidateHash, 'Reason'); check(false, 'Invalid/stale target refused'); }
        catch (RuntimeException $e) { check($e->getMessage() === 'override_invalid', 'Approval validates the original canonical target'); }
    }
    check($db->count('governor_claim_overrides') === 1, 'Invalid approvals leave no audit rows');
    foreach (['off', 'shadow', 'missing', 'corrupt'] as $mode) {
        $reset();
        if ($mode === 'missing') { $settings->delete(RouterSecrets::KEY); }
        elseif ($mode === 'corrupt') { $settings->set(RouterSecrets::KEY, 'not-encrypted'); }
        else { $settings->set('governor.mode', $mode); }
        try { $service->approve($target, $candidateHash, 'Reason'); check(false, 'Inactive/misconfigured approval refused'); }
        catch (RuntimeException $e) { check($e->getMessage() === 'governor_configuration', 'Configuration error is fixed and visible'); }
    }
    $reset();
    $reads = 0;
    $changingConfig = new RouterSettings($settings, function () use (&$reads, $settings, $encryption): Encryption {
        // Two reads occur in the first availability check. Revoke during the
        // recheck inside the consumption transaction, after its stored-key read.
        if (++$reads === 3) { $settings->delete(RouterSecrets::KEY); }
        return $encryption;
    });
    $changingService = new RouterClaimOverride($db, $changingConfig, 1, $root, ['index.php']);
    try { $changingService->consume($id, $target, $candidateHash); check(false, 'Mid-decision configuration loss refuses'); }
    catch (RuntimeException $e) { check($e->getMessage() === 'governor_configuration', 'Configuration loss inside audit transaction remains a visible configuration error'); }
    check($db->queryOne('SELECT consumed_at FROM governor_claim_overrides WHERE id = ?', [$id])['consumed_at'] === null,
        'Configuration loss rolls back authorization consumption');
} finally { Fixture::remove($root); $reset(); }

// Each case has independent approval/site state. The gate is always real staged
// control flow with a deterministic fake answer; the writer is the real atomic writer.
$cases = ['approved', 'candidate_b', 'repair_b', 'other_path', 'other_address', 'other_root', 'wrong_service_root', 'other_owner', 'demoted', 'missing_owner',
    'missing_approval', 'gate_down', 'gate_invalid', 'gate_nan', 'gate_string', 'gate_pass', 'cancel', 'hash_drift', 'writer_drift',
    'key_deleted', 'key_deleted_after_gate', 'key_deleted_after_decision', 'mode_off', 'ledger_down', 'ledger_after_gate', 'ledger_after_decision',
    'audit_write_failure', 'audit_ignore', 'invalid_candidate', 'secret_candidate', 'no_strict_ledger'];
foreach ($cases as $case) {
    $root = Fixture::create(); $extraRoot = null; $reset();
    try {
        $target = $fixture['target'] + ['expected_file_hash' => hash_file('sha256', $root . '/index.php')];
        if ($case === 'other_address') {
            file_put_contents($root . '/index.php', "\n<h2>Second heading</h2>\n", FILE_APPEND);
            $target['expected_file_hash'] = hash_file('sha256', $root . '/index.php');
        }
        $service = new RouterClaimOverride($db, $config, 1, $root, ['index.php', 'bakery/index.php']);
        $id = $service->approve($target, $case === 'secret_candidate' ? hash('sha256', $secret) : $candidateHash, 'Owner confirms this claim.');
        if (in_array($case, ['other_root', 'wrong_service_root'])) {
            $extraRoot = $root;
            $root = Fixture::create();
            if ($case === 'other_root') { $service = new RouterClaimOverride($db, $config, 1, $root, ['index.php']); }
        }
        if ($case === 'other_owner') { $service = new RouterClaimOverride($db, $config, 4, $root, ['index.php']); }
        if ($case === 'demoted') { $db->update('users', ['role' => 'editor'], 'id = 1'); }
        if ($case === 'missing_owner') { $service = new RouterClaimOverride($db, $config, 999, $root, ['index.php']); }
        if ($case === 'missing_approval') { $id = 999999; }
        if ($case === 'key_deleted') { $settings->delete(RouterSecrets::KEY); }
        if ($case === 'mode_off') { $settings->set('governor.mode', 'off'); }
        if ($case === 'other_path') { $target['file_path'] = 'bakery/index.php'; $target['expected_file_hash'] = hash_file('sha256', $root . '/bakery/index.php'); }
        if ($case === 'other_address') { $target['source_address'] = '<h2>Second heading</h2>'; $target['content_hash'] = hash('sha256', $target['source_address']); }
        $before = Fixture::snapshot($root); $expected = $before;
        $file = $root . '/' . $target['file_path']; $original = file_get_contents($file);
        putenv('VS_TEST_PREVIEW_DIR=' . $root); putenv('VS_TEST_ASSETS_DIR=' . $root . '/assets');
        $ledger = new AICallLedger($db); $gates = 0; $factories = 0; $cancelled = false; $usedBeforeWriter = false;
        OverrideWriterProbe::$writes = 0;
        $drift = function () use ($file, $root, &$expected): void { file_put_contents($file, "\n<!-- human edit -->\n", FILE_APPEND); $expected = Fixture::snapshot($root); };
        $gate = function (array $state) use ($case, &$gates, &$factories, &$cancelled, $root, $before, $settings, $ledger, $drift, $secret, $cipher): array {
            $gates++;
            check($factories === 0 && Fixture::snapshot($root) === $before, "$case: gate precedes every filesystem mutation and writer");
            check(!isset($state['override']) && !isset($state['reason']) && !isset($state['user_id']), "$case: owner decision is not model input");
            check(!str_contains(json_encode($state), $secret) && !str_contains(json_encode($state), $cipher), "$case: gate state excludes registered secrets");
            if ($case === 'gate_down') { throw new RuntimeException('offline'); }
            if ($case === 'gate_invalid') { return []; }
            if ($case === 'cancel') { $cancelled = true; }
            if ($case === 'hash_drift') { $drift(); }
            if ($case === 'key_deleted_after_gate') { $settings->delete(RouterSecrets::KEY); }
            if ($case === 'ledger_after_gate') { $ledger->markUnavailable(); }
            return ['answers' => ['forbidden_claims' => ['noul' => match($case) { 'gate_nan' => NAN, 'gate_string' => '0.9', 'gate_pass' => 0.1, default => 0.9 }]]];
        };
        $writer = function () use (&$factories, &$usedBeforeWriter, $db, $id, $case, $drift): FileManager {
            $factories++;
            $usedBeforeWriter = $db->queryOne('SELECT consumed_at FROM governor_claim_overrides WHERE id = ?', [$id])['consumed_at'] !== null;
            if ($case === 'writer_drift') { $drift(); }
            return new OverrideWriterProbe($db);
        };
        $cancelProbe = function () use (&$cancelled, $case, $db, $id, $settings, $ledger): bool {
            if ($case === 'key_deleted_after_decision' && $db->queryOne('SELECT consumed_at FROM governor_claim_overrides WHERE id = ?', [$id])['consumed_at'] !== null) {
                $settings->delete(RouterSecrets::KEY);
            }
            if ($case === 'ledger_after_decision' && $db->queryOne('SELECT consumed_at FROM governor_claim_overrides WHERE id = ?', [$id])['consumed_at'] !== null) {
                $ledger->markUnavailable();
            }
            return $cancelled;
        };
        $text = in_array($case, ['candidate_b', 'repair_b']) ? 'An award-winning bakery' : match($case) {
            'invalid_candidate' => '<b>Bad</b>', 'secret_candidate' => $secret, default => $candidate };
        $provider = $case === 'repair_b' ? new HeadingFakeProvider($text) : null;
        if ($case === 'ledger_down') { $ledger->markUnavailable(); }
        if ($case === 'audit_write_failure') { $db->exec("CREATE TRIGGER refuse_override BEFORE UPDATE ON governor_claim_overrides BEGIN SELECT RAISE(ABORT, 'private failure'); END"); }
        if ($case === 'audit_ignore') { $db->exec('CREATE TRIGGER refuse_override BEFORE UPDATE ON governor_claim_overrides BEGIN SELECT RAISE(IGNORE); END'); }
        $patch = new StagedHeadingPatch($root, ['index.php', 'bakery/index.php'], $provider, $gate, $writer, $ledger,
            strictLedger: $case !== 'no_strict_ledger', isCancelled: $cancelProbe,
            claimOverrides: $service, claimOverrideId: $id);
        $result = $patch->execute($target, $fixture['prompt'], $fixture['trusted_facts'], $provider === null ? $text : null,
            $case === 'repair_b' ? 'forbidden_claims' : null);
        $success = in_array($case, ['approved', 'gate_pass']);
        check($result['status'] === ($success ? 'applied' : 'rejected'), "$case: only exact authorized candidate applies");
        check($result['files_changed'] === ($success ? 1 : 0), "$case: reports the true write outcome");
        if ($success) {
            check($gates === 1 && $factories === 1 && OverrideWriterProbe::$writes === 1, "$case: gate then exactly one governed write");
            check($usedBeforeWriter === ($case === 'approved'), "$case: blocked claim consumes audit before writer; safe gate needs no override");
            check($result['reason'] === ($case === 'approved' ? 'accepted_owner_override' : 'accepted'), "$case: override outcome explicit");
            $replacement = preg_replace('/(>)[^<>]*(<\/h[1-6]>)$/', '$1' . $candidate . '$2', $target['source_address']);
            $expected['index.php'] = hash('sha256', str_replace($target['source_address'], $replacement, $original));
        } else {
            check($factories === ($case === 'writer_drift' ? 1 : 0), "$case: failure does not reach writer factory");
        }
        check(Fixture::snapshot($root) === $expected, "$case: rejected/human/unrelated bytes preserved");
        $audit = $db->queryOne('SELECT * FROM governor_claim_overrides WHERE id = ?', [$id]);
        if ($case === 'cancel') {
            check($audit['consumed_at'] !== null && $result['reason'] === 'generation_cancelled', 'Cancellation after decision spends permission but never means applied');
        }
        if (in_array($case, ['candidate_b', 'repair_b', 'other_path', 'other_address', 'other_root', 'wrong_service_root',
            'gate_down', 'gate_invalid', 'gate_nan', 'gate_string', 'gate_pass', 'audit_write_failure', 'audit_ignore'])) {
            check($audit['consumed_at'] === null, "$case: no matching blocked-candidate decision was consumed");
        }
        if (in_array($case, ['key_deleted', 'key_deleted_after_gate', 'key_deleted_after_decision', 'mode_off'])) {
            check($result['reason'] === 'governor_configuration', "$case: visible configuration failure survives override");
        }
        if ($audit !== null) {
            check(!str_contains(json_encode($audit), $secret) && !str_contains(json_encode($audit), $cipher), "$case: audit excludes secrets");
        }
        if ($case === 'approved') {
            file_put_contents($file, $original);
            $factories = 0;
            $replay = $patch->execute($target, $fixture['prompt'], $fixture['trusted_facts'], $candidate);
            check($replay['reason'] === 'forbidden_claims' && $factories === 0 && $gates === 2, 'Consumed approval cannot replay even after restoring original source bytes');
        }
    } finally {
        $db->exec('DROP TRIGGER IF EXISTS refuse_override');
        Fixture::remove($root);
        if ($extraRoot !== null) { Fixture::remove($extraRoot); }
        $reset();
    }
}
putenv($previousPreview === false ? 'VS_TEST_PREVIEW_DIR' : 'VS_TEST_PREVIEW_DIR=' . $previousPreview);
putenv($previousAssets === false ? 'VS_TEST_ASSETS_DIR' : 'VS_TEST_ASSETS_DIR=' . $previousAssets);
finish();
