<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers/RouterLegacyBenchmark.php';
use VoxelSite\Tests\RouterLegacyBenchmark;

$passed = 0; $errors = [];
function check(bool $ok, string $message): void { global $passed, $errors; $ok ? $passed++ : $errors[] = $message; }
foreach ([false, true] as $preallocated) {
    foreach (['off', 'ok', 'outage', 'malformed'] as $case) {
        $scenario = ['preallocated' => $preallocated, 'mode' => $case === 'off' ? 'off' : 'shadow', 'key' => true, 'transport' => $case];
        $r = RouterLegacyBenchmark::run('inline_edit', '', [], $scenario);
        $rows = $r['ledger'];
        check(count($rows) === ($case === 'off' ? 1 : 2), 'One row per real method invocation, never double-count observation: ' . $case);
        $generation = array_values(array_filter($rows, fn($row) => $row['kind'] === 'generation'));
        check(count($generation) === 1 && $generation[0]['status'] === 'success' && $generation[0]['method'] === 'stream', 'Actual PromptEngine generation is ledgered');
        $classify = array_values(array_filter($rows, fn($row) => $row['kind'] === 'classify'));
        if ($case === 'off') {
            check($classify === [] && $r['typesafe_requests'] === [], 'Off has no classifier rows or Jev calls');
        } else {
            check(count($classify) === 1 && $classify[0]['status'] === ($case === 'ok' ? 'success' : 'error'), 'Classification terminal status matches adapter');
            check(isset($r['shadow']['call_id']) && $r['shadow']['call_id'] === ($classify[0]['id'] ?? null), 'Observation references its canonical ledger row');
        }
        foreach ($rows as $row) {
            check((int) $row['prompt_log_id'] === $r['prompt_log_id'], 'Studio/Agent invocation linked to the existing prompt job');
            check($row['duration_ms'] >= 0 && $row['finished_at'] !== null && $row['cost_usd'] === null, 'Terminal timing, honest unknown price');
        }
        check($r['secrets_excluded'] && $r['task_completion'] === 'pass', 'Ledger does not leak the runtime key or change task completion');
    }
    $r = RouterLegacyBenchmark::run('inline_edit', '', ['evaluator_enabled' => true], ['preallocated' => $preallocated]);
    $complete = array_values(array_filter($r['ledger'], fn($row) => $row['method'] === 'complete'));
    check(count($complete) === 1 && $complete[0]['status'] === 'error', 'Actual evaluator complete() exception is ledgered despite advisory catch');
    check(count($complete) === 1 && (int) $complete[0]['prompt_log_id'] === $r['prompt_log_id'] && $complete[0]['input_tokens'] === null, 'complete() keeps job linkage and unknown usage');
    check($r['task_completion'] === 'pass', 'Advisory complete failure retains existing generation outcome');
}
foreach ($errors as $error) { echo 'FAIL: ' . $error . "\n"; }
echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
exit($errors === [] ? 0 : 1);
