<?php
declare(strict_types=1);
// Compatibility for stored shadow values before migration 011. No UI exposes this mode.
require_once __DIR__ . '/helpers/RouterLegacyBenchmark.php';
use VoxelSite\Tests\RouterLegacyBenchmark;
$passed = 0; $errors = [];
function check(bool $ok, string $message): void { global $passed, $errors; $ok ? $passed++ : $errors[] = $message; }
function requests(array $calls): array {
    return array_map(function ($call) { unset($call['duration_ms']); return $call; }, $calls);
}
foreach (['inline_edit', 'section_edit'] as $action) {
    foreach ([false, true] as $preallocated) {
        $base = RouterLegacyBenchmark::run($action, '', [], ['preallocated' => $preallocated]);
        foreach (['ok', 'disagree', 'outage', 'malformed'] as $case) {
            $r = RouterLegacyBenchmark::run($action, '', [], ['mode' => 'shadow', 'key' => true, 'transport' => $case, 'preallocated' => $preallocated]);
            check($r['task_completion'] === 'pass' && $r['files'] === $base['files'], 'Legacy preview preserves successful edit: ' . $case);
            check(requests($r['calls']) === requests($base['calls']), 'Legacy preview preserves exact generation request');
            check(count($r['typesafe_requests']) === 1 && $r['before_classify_unchanged'], 'One classification precedes generation/context/writes');
            check(in_array($r['shadow']['status'], ['preview', 'fallback'], true), 'Legacy preview never applies routing');
            check($r['secrets_excluded'], 'No credential in generation/state/logs');
        }
        foreach ([[], ['mode' => 'off'], ['mode' => 'off', 'key' => true], ['mode' => 'off', 'corrupt_key' => true]] as $off) {
            $r = RouterLegacyBenchmark::run($action, '', [], $off + ['preallocated' => $preallocated]);
            check($r['files'] === $base['files'] && requests($r['calls']) === requests($base['calls']), 'Off is unchanged');
            check($r['client_constructions'] === 0 && $r['typesafe_requests'] === [], 'Off has zero TypeSafe calls');
            check($r['shadow'] === null, 'Off has no routing decision');
        }
        foreach ([['mode' => 'shadow'], ['mode' => 'shadow', 'corrupt_key' => true], ['mode' => 'enforce']] as $fallback) {
            $r = RouterLegacyBenchmark::run($action, '', [], $fallback + ['preallocated' => $preallocated]);
            check($r['status']['status'] === 'success', 'Missing configuration does not block editing');
            check($r['files'] === $base['files'] && requests($r['calls']) === requests($base['calls']), 'Fallback matches Off');
            check($r['typesafe_requests'] === [] && $r['shadow']['reason'] === 'configuration_error', 'No vendor call and visible fallback reason');
        }
    }
}
$r = RouterLegacyBenchmark::run('inline_edit', '', [], ['mode' => 'enforce', 'interactive' => true]);
check(str_contains($r['sse'], '"type":"warning"') && str_contains($r['sse'], '"type":"done"'), 'Studio receives a fallback warning then success');
check($r['task_completion'] === 'pass', 'Interactive fallback completes the edit');
foreach ($errors as $error) { echo "FAIL: $error\n"; }
echo "Passed: $passed\nFailed: " . count($errors) . "\n";
exit($errors === [] ? 0 : 1);
