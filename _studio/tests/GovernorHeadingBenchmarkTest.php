<?php

declare(strict_types=1);

require_once __DIR__ . '/helpers/GovernorLegacyBenchmark.php';

use VoxelSite\Tests\GovernorHeadingFixture as Fixture;
use VoxelSite\Tests\GovernorLegacyBenchmark;

$passed = 0;
$errors = [];
function verify(bool $condition, string $message): void
{
    global $passed, $errors;
    $condition ? $passed++ : $errors[] = $message;
}

$external = Fixture::create();
$before = Fixture::snapshot($external);
$oldPreview = getenv('VS_TEST_PREVIEW_DIR');
$oldAssets = getenv('VS_TEST_ASSETS_DIR');
try {
    putenv('VS_TEST_PREVIEW_DIR=' . $external);
    putenv('VS_TEST_ASSETS_DIR=' . $external . '/assets');
    $legacy = GovernorLegacyBenchmark::run('inline_edit');
    verify(Fixture::snapshot($external) === $before, 'Legacy child must ignore inherited path overrides');
    verify($legacy['task_completion'] === 'pass', 'Legacy child must write its own disposable site');
} finally {
    putenv($oldPreview === false ? 'VS_TEST_PREVIEW_DIR' : 'VS_TEST_PREVIEW_DIR=' . $oldPreview);
    putenv($oldAssets === false ? 'VS_TEST_ASSETS_DIR' : 'VS_TEST_ASSETS_DIR=' . $oldAssets);
    Fixture::remove($external);
}
$pipes = [];
$process = proc_open([PHP_BINARY, __DIR__ . '/GovernorHeadingBenchmark.php'],
    [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
fclose($pipes[0]);
$output = stream_get_contents($pipes[1]);
$error = stream_get_contents($pipes[2]);
fclose($pipes[1]);
fclose($pipes[2]);
verify(proc_close($process) === 0 && $error === '', 'Benchmark runs cleanly: ' . $error);
$report = json_decode($output, true, 512, JSON_THROW_ON_ERROR);
verify(str_contains($report['token_basis'], 'synthetic'), 'Counts must be labeled synthetic');
verify(str_contains($report['routing_status'], 'not implemented'), 'No fake claim of completed router');
verify(count($report['rows']) === 4, 'Both legacy paths and Governor accept/reject rows reported');
foreach ($report['rows'] as $row) {
    foreach (['routing', 'generation', 'gate'] as $kind) {
        foreach (['calls', 'input_tokens', 'output_tokens', 'cost_usd', 'duration_ms'] as $column) {
            verify(array_key_exists($column, $row[$kind]), $row['mode'] . ' reports ' . $kind . '.' . $column);
        }
        verify($row[$kind]['calls'] === 0 || $row[$kind]['cost_usd'] === null, 'Fake call cost is unknown, not free');
    }
    verify(isset($row['retries'], $row['repairs'], $row['task_completion']), 'Retry/repair/completion split present');
    if ($row['task_completion'] === 'reject-correct') {
        verify($row['savings_eligible'] === false, 'Correct rejection is never a savings win');
    }
}
verify(count($report['successful_matched_comparisons']) === 2, 'Only matched successful edits compared');
foreach ($errors as $message) { echo 'FAIL: ' . $message . "\n"; }
echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
exit($errors === [] ? 0 : 1);
