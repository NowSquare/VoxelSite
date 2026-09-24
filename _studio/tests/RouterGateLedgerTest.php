<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
require_once __DIR__ . '/helpers/RouterHeadingFixture.php';
use VoxelSite\{AICallLedger, Database, FileManager, RouterSecrets, StagedHeadingPatch};
use VoxelSite\Tests\{RouterHeadingFixture as Fixture, HeadingFakeProvider};

$passed = 0; $errors = [];
function check(bool $ok, string $message): void { global $passed, $errors; $ok ? $passed++ : $errors[] = $message; }
if (!class_exists(AICallLedger::class)) { echo "FAIL: Ledger missing\n"; exit(1); }
$db = Database::getInstance(':memory:');
foreach (glob(dirname(__DIR__) . '/engine/migrations/*.php') as $path) { $migration = require $path; ($migration['up'])($db); }
$fixture = Fixture::manifest();
$secret = bin2hex(random_bytes(32)); RouterSecrets::remember($secret);
foreach (['accept', 'block', 'malformed', 'throw', 'invalid_candidate'] as $case) {
    $root = Fixture::create();
    try {
        $before = Fixture::snapshot($root); $writers = 0;
        $db->exec('DELETE FROM ai_call_ledger');
        $gate = function (array $state) use ($db, $case, $secret, $root, $before, &$writers): array {
            $rows = $db->query("SELECT * FROM ai_call_ledger WHERE kind = 'gate'");
            check(count($rows) === 1 && $rows[0]['status'] === 'running', 'Gate attempt exists before callback');
            check($writers === 0 && Fixture::snapshot($root) === $before, 'Ledger does not bypass in-memory/gate order');
            if ($case === 'throw') { throw new RuntimeException($secret); }
            return ['model' => 'jev-fixture', 'usage' => ['input_tokens' => 12, 'output_tokens' => 3],
                'debug' => $secret, 'answers' => $case === 'malformed' ? [] : ['forbidden_claims' => ['noul' => $case === 'block' ? 0.9 : 0.1]]];
        };
        putenv('VS_TEST_PREVIEW_DIR=' . $root); putenv('VS_TEST_ASSETS_DIR=' . $root . '/assets');
        $patch = new StagedHeadingPatch($root, ['index.php'],
            new HeadingFakeProvider($case === 'invalid_candidate' ? '<script>bad</script>' : $fixture['accepted_candidate']),
            $gate, function () use ($db, &$writers): FileManager { $writers++; return new FileManager($db); }, new AICallLedger($db));
        $result = $patch->execute($fixture['target'], $fixture['prompt'], $fixture['trusted_facts']);
        $rows = $db->query("SELECT * FROM ai_call_ledger WHERE kind = 'gate'");
        check(count($rows) === ($case === 'invalid_candidate' ? 0 : 1), 'Exactly one row only when the gate is actually called');
        if ($rows !== []) {
            check($rows[0]['status'] === (in_array($case, ['accept', 'block']) ? 'success' : 'error'), 'Gate transport/shape outcome is terminal; a valid policy rejection is a successful call');
            check($rows[0]['prompt_log_id'] === null && $rows[0]['finished_at'] !== null, 'Standalone proof has honest null job linkage and terminal timestamp');
            check(!str_contains(json_encode($rows), $secret) && !str_contains(json_encode($rows), 'Fresh sourdough'), 'No gate state, result prose or exception content persisted');
        }
        check($result['status'] === ($case === 'accept' ? 'applied' : 'rejected'), 'Gate outcome unchanged');
        check($writers === ($case === 'accept' ? 1 : 0), 'Writer constructed only after accepted gate');
        if ($case !== 'accept') { check(Fixture::snapshot($root) === $before, 'Rejected gate leaves all files unchanged'); }
    } finally { Fixture::remove($root); }
}
foreach ($errors as $error) { echo 'FAIL: ' . $error . "\n"; }
echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
exit($errors === [] ? 0 : 1);
