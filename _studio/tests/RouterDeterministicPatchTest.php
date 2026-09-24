<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
require_once __DIR__ . '/helpers/RouterHeadingFixture.php';

use VoxelSite\{AICallLedger, Database, FileManager, StagedHeadingPatch};
use VoxelSite\Tests\{RouterHeadingFixture as Fixture, HeadingFakeProvider};

$passed = 0;
$errors = [];
function check(bool $condition, string $message): void
{
    global $passed, $errors;
    $condition ? $passed++ : $errors[] = $message;
}

class DeterministicHeadingWriter extends FileManager
{
    public int $writes = 0;
    public function writeGovernedFile(string $path, string $expectedHash, string $content, string $expectedAbsolutePath): void
    {
        $this->writes++;
        parent::writeGovernedFile($path, $expectedHash, $content, $expectedAbsolutePath);
    }
    public function writeFile(string $relativePath, string $content): ?string
    {
        throw new RuntimeException('Legacy write is forbidden');
    }
    public function compileTailwind(): array
    {
        throw new RuntimeException('CSS compilation is forbidden');
    }
}

$fixture = Fixture::manifest();
$db = Database::getInstance(':memory:');
foreach (glob(dirname(__DIR__) . '/engine/migrations/*.php') as $path) {
    $migration = require $path;
    ($migration['up'])($db);
}
$cases = [
    'explicit' => [],
    'nested_page' => ['file_path' => 'bakery/index.php'],
    'spaces_and_escaped_text' => ['candidate' => '  Bread & "butter" and \'jam\'  '],
    'utf8_boundary' => ['candidate' => str_repeat('é', 200)],
    'unused_generator' => ['provider' => true],
    'claims' => ['noul' => 0.9, 'reason' => 'forbidden_claims'],
    'claim_threshold' => ['noul' => 0.6, 'reason' => 'forbidden_claims'],
    'gate_outage' => ['gate' => 'throw', 'reason' => 'gate_unavailable'],
    'gate_invalid' => ['gate' => 'invalid', 'reason' => 'gate_invalid'],
    'span_hash_drift' => ['target' => 'span_hash', 'reason' => 'content_changed', 'gates' => 0],
    'file_hash_drift' => ['target' => 'file_hash', 'reason' => 'content_changed', 'gates' => 0],
    'duplicate_heading' => ['target' => 'duplicate', 'reason' => 'ambiguous_address', 'status' => 'clarify', 'gates' => 0],
    'missing_heading' => ['target' => 'missing', 'reason' => 'missing_address', 'status' => 'clarify', 'gates' => 0],
    'hash_drift_in_gate' => ['drift' => 'gate', 'reason' => 'content_changed'],
    'hash_drift_at_write' => ['drift' => 'writer', 'reason' => 'content_changed', 'writers' => 1],
    'cancel_before_candidate' => ['cancel' => 'before', 'reason' => 'generation_cancelled', 'gates' => 0],
    'cancel_before_gate' => ['cancel' => 'before_gate', 'reason' => 'generation_cancelled', 'gates' => 0],
    'cancel_after_gate' => ['cancel' => 'after_gate', 'reason' => 'generation_cancelled'],
    'ledger_missing' => ['ledger' => 'missing', 'reason' => 'ledger_unavailable', 'gates' => 0],
    'ledger_unhealthy' => ['ledger' => 'unhealthy', 'reason' => 'ledger_unavailable', 'gates' => 0],
    'ledger_finish_failure' => ['ledger' => 'finish_failure', 'reason' => 'ledger_unavailable'],
    'empty' => ['candidate' => '', 'reason' => 'invalid_candidate', 'gates' => 0],
    'whitespace' => ['candidate' => '   ', 'reason' => 'invalid_candidate', 'gates' => 0],
    'unicode_whitespace' => ['candidate' => "\u{00a0}\u{2003}", 'reason' => 'invalid_candidate', 'gates' => 0],
    'markup' => ['candidate' => '<em>Fresh bread</em>', 'reason' => 'invalid_candidate', 'gates' => 0],
    'php' => ['candidate' => '<?php echo 1; ?>', 'reason' => 'invalid_candidate', 'gates' => 0],
    'invalid_utf8' => ['candidate' => "Bread \xff", 'reason' => 'invalid_candidate', 'gates' => 0],
    'too_long' => ['candidate' => str_repeat('é', 201), 'reason' => 'invalid_candidate', 'gates' => 0],
    'length_includes_spaces' => ['candidate' => ' ' . str_repeat('a', 199) . ' ', 'reason' => 'invalid_candidate', 'gates' => 0],
    'leading_control' => ['candidate' => "\nBread", 'reason' => 'invalid_candidate', 'gates' => 0],
    'trailing_control' => ['candidate' => "Bread\t", 'reason' => 'invalid_candidate', 'gates' => 0],
    'null_byte' => ['candidate' => "Bread\0", 'reason' => 'invalid_candidate', 'gates' => 0],
    'delete_control' => ['candidate' => "Bread\x7f", 'reason' => 'invalid_candidate', 'gates' => 0],
    'identical' => ['candidate' => 'Discover our freshly baked sourdough every morning', 'status' => 'unchanged', 'reason' => 'identical_candidate'],
    'no_candidate_no_generator' => ['candidate' => null, 'reason' => 'generation_failed', 'gates' => 0],
];
foreach ($cases as $name => $case) {
    $root = Fixture::create();
    $previousPreview = getenv('VS_TEST_PREVIEW_DIR');
    $previousAssets = getenv('VS_TEST_ASSETS_DIR');
    try {
        putenv('VS_TEST_PREVIEW_DIR=' . $root);
        putenv('VS_TEST_ASSETS_DIR=' . $root . '/assets');
        $db->exec('DELETE FROM ai_call_ledger');
        $target = $fixture['target'];
        $target['file_path'] = $case['file_path'] ?? 'index.php';
        $file = $root . '/' . $target['file_path'];
        $original = file_get_contents($file);
        if (($case['target'] ?? '') === 'duplicate') { file_put_contents($file, $original . $target['source_address']); }
        if (($case['target'] ?? '') === 'missing') { file_put_contents($file, str_replace($target['source_address'], '', $original)); }
        $target['expected_file_hash'] = hash_file('sha256', $file);
        if (($case['target'] ?? '') === 'span_hash') { $target['content_hash'] = str_repeat('0', 64); }
        if (($case['target'] ?? '') === 'file_hash') { $target['expected_file_hash'] = str_repeat('0', 64); }
        $before = Fixture::snapshot($root);
        $candidate = array_key_exists('candidate', $case) ? $case['candidate'] : $fixture['accepted_candidate'];
        $ledger = ($case['ledger'] ?? '') === 'missing' ? null : new AICallLedger($db);
        if (($case['ledger'] ?? '') === 'unhealthy') { $ledger->markUnavailable(); }
        $provider = ($case['provider'] ?? false) ? new HeadingFakeProvider('MUST NOT GENERATE') : null;
        if ($provider !== null) { $provider->fail = true; }
        $gateCalls = 0;
        $factoryCalls = 0;
        $cancelChecks = 0;
        $writer = null;
        $events = [];
        $intervening = null;
        $mutate = function () use ($file, &$intervening): void {
            $intervening = str_replace('Visit the bakery', 'A human changed the CTA', file_get_contents($file));
            file_put_contents($file, $intervening);
        };
        $gate = function (array $state) use ($name, $case, $candidate, $fixture, $db, $root, $before,
            &$gateCalls, &$factoryCalls, &$events, $mutate): array {
            $gateCalls++;
            $events[] = 'gate';
            check($state['candidate'] === $candidate, $name . ': gate receives literal replacement bytes');
            check($state['candidate_hash'] === hash('sha256', $candidate), $name . ': gate hash identifies exact candidate');
            check($state['trusted_facts'] === $fixture['trusted_facts'], $name . ': gate receives trusted facts');
            check($factoryCalls === 0 && Fixture::snapshot($root) === $before, $name . ': no writer or filesystem mutation before gate');
            $rows = $db->query('SELECT * FROM ai_call_ledger');
            check(count($rows) === 1 && $rows[0]['kind'] === 'gate' && $rows[0]['status'] === 'running', $name . ': only running gate ledger row at gate');
            if (($case['gate'] ?? '') === 'throw') { throw new RuntimeException('Fake gate outage'); }
            if (($case['gate'] ?? '') === 'invalid') { return ['answers' => []]; }
            if (($case['drift'] ?? '') === 'gate') { $mutate(); }
            if (($case['ledger'] ?? '') === 'finish_failure') { $db->exec('DELETE FROM ai_call_ledger'); }
            return ['answers' => ['forbidden_claims' => ['noul' => $case['noul'] ?? 0.1]]];
        };
        $factory = function () use ($db, &$factoryCalls, &$writer, &$events, $case, $mutate): FileManager {
            $factoryCalls++;
            $events[] = 'writer';
            if (($case['drift'] ?? '') === 'writer') { $mutate(); }
            return $writer = new DeterministicHeadingWriter($db);
        };
        $cancel = function () use ($case, &$cancelChecks, &$gateCalls): bool {
            $cancelChecks++;
            return ($case['cancel'] ?? '') === 'before'
                || (($case['cancel'] ?? '') === 'before_gate' && $cancelChecks === 2)
                || (($case['cancel'] ?? '') === 'after_gate' && $gateCalls > 0);
        };
        $patch = new StagedHeadingPatch($root, ['index.php', 'bakery/index.php'], $provider, $gate, $factory,
            $ledger, true, $cancel, 'fake-gate', 'fixture');
        $result = $patch->execute($target, $fixture['prompt'], $fixture['trusted_facts'], $candidate);
        $expectedStatus = $case['status'] ?? (isset($case['reason']) ? 'rejected' : 'applied');
        check($result['status'] === $expectedStatus, $name . ': status ' . json_encode($result));
        check($result['reason'] === ($case['reason'] ?? 'accepted'), $name . ': expected reason');
        check($provider === null || $provider->calls === [], $name . ': no generator call');
        check($db->query("SELECT * FROM ai_call_ledger WHERE kind = 'generation'") === [], $name . ': zero generation ledger rows');
        check($gateCalls === ($case['gates'] ?? 1), $name . ': exact gate call count');
        check($factoryCalls === ($case['writers'] ?? ($expectedStatus === 'applied' ? 1 : 0)), $name . ': exact writer construction count');
        check($result['files_changed'] === ($expectedStatus === 'applied' ? 1 : 0), $name . ': exact changed-file count');
        if ($result['candidate_hash'] !== null) {
            check($result['candidate_hash'] === hash('sha256', $candidate), $name . ': result binds exact candidate');
        }
        $rows = $db->query('SELECT * FROM ai_call_ledger');
        if ($gateCalls > 0 && ($case['ledger'] ?? '') !== 'finish_failure') {
            check(count($rows) === 1 && $rows[0]['kind'] === 'gate'
                && $rows[0]['status'] === (isset($case['gate']) ? 'error' : 'success'), $name . ': gate ledger terminal outcome');
        } else {
            check($rows === [], $name . ': no spurious ledger rows');
        }
        if ($expectedStatus === 'applied') {
            $replacement = '<h1 class="text-4xl font-bold">'
                . htmlspecialchars($candidate, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</h1>';
            check(file_get_contents($file) === str_replace($target['source_address'], $replacement, $original), $name . ': one exact addressed span and literal escaped text');
            check($writer?->writes === 1 && $events === ['gate', 'writer'], $name . ': one governed write after acceptance');
            $after = Fixture::snapshot($root);
            unset($before[$target['file_path']], $after[$target['file_path']]);
            check($after === $before, $name . ': all unrelated files identical and no extra files');
        } elseif ($intervening !== null) {
            check(file_get_contents($file) === $intervening, $name . ': preserve intervening human edit');
            $after = Fixture::snapshot($root);
            unset($before[$target['file_path']], $after[$target['file_path']]);
            check($after === $before, $name . ': no other filesystem mutations');
        } else {
            check(Fixture::snapshot($root) === $before, $name . ': entire site unchanged');
        }
    } catch (Throwable $error) {
        check(false, $name . ': unexpected ' . $error::class . ' ' . $error->getMessage());
    } finally {
        putenv($previousPreview === false ? 'VS_TEST_PREVIEW_DIR' : 'VS_TEST_PREVIEW_DIR=' . $previousPreview);
        putenv($previousAssets === false ? 'VS_TEST_ASSETS_DIR' : 'VS_TEST_ASSETS_DIR=' . $previousAssets);
        Fixture::remove($root);
    }
}
foreach ($errors as $error) { echo "FAIL: {$error}\n"; }
echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
exit($errors === [] ? 0 : 1);
