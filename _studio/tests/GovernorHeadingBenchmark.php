<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
require_once __DIR__ . '/helpers/GovernorLegacyBenchmark.php';

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\StagedHeadingPatch;
use VoxelSite\Tests\GovernorHeadingFixture as Fixture;
use VoxelSite\Tests\GovernorLegacyBenchmark;
use VoxelSite\Tests\HeadingFakeProvider;

function usageTotals(array $calls): array
{
    return ['calls' => count($calls), 'input_tokens' => array_sum(array_column($calls, 'input_tokens')),
        'output_tokens' => array_sum(array_column($calls, 'output_tokens')), 'cost_usd' => $calls === [] ? 0 : null,
        'duration_ms' => array_sum(array_column($calls, 'duration_ms'))];
}

$fixture = Fixture::manifest();
$rows = [];
foreach (['inline_edit', 'section_edit'] as $action) {
    $legacy = GovernorLegacyBenchmark::run($action);
    $rows[] = ['fixture' => 'shorten_selected_heading', 'mode' => 'legacy_' . $action,
        'routing' => usageTotals([]), 'generation' => usageTotals($legacy['calls']), 'gate' => usageTotals([]),
        'retries' => 0, 'repairs' => 0, 'task_completion' => $legacy['task_completion'],
        'engine_status' => $legacy['status'], 'savings_eligible' => $legacy['task_completion'] === 'pass'];
}
if (!in_array('--legacy-only', $argv, true)) {
    foreach (['shorten_selected_heading', 'forbidden_claim_blocks_apply'] as $name) {
        $case = $fixture['cases'][$name];
        $root = Fixture::create();
        $previousPreview = getenv('VS_TEST_PREVIEW_DIR');
        $previousAssets = getenv('VS_TEST_ASSETS_DIR');
        try {
            $before = Fixture::snapshot($root);
            $provider = new HeadingFakeProvider($case['candidate']);
            $gateCalls = [];
            $gate = function (array $state) use ($case, &$gateCalls): array {
                $start = hrtime(true);
                $answer = ['answers' => ['forbidden_claims' => ['noul' => $case['noul']]]];
                $gateCalls[] = ['input_tokens' => (int) ceil(strlen(json_encode($state)) / 4),
                    'output_tokens' => (int) ceil(strlen(json_encode($answer)) / 4), 'cost_usd' => null,
                    'duration_ms' => (hrtime(true) - $start) / 1e6];
                return $answer;
            };
            putenv('VS_TEST_PREVIEW_DIR=' . $root);
            putenv('VS_TEST_ASSETS_DIR=' . $root . '/assets');
            $patch = new StagedHeadingPatch($root, ['index.php'], $provider, $gate,
                fn() => new FileManager(Database::getInstance(':memory:')));
            $result = $patch->execute($fixture['target'], $fixture['prompt'], $fixture['trusted_facts']);
            $after = Fixture::snapshot($root);
            $expectedFile = file_get_contents(__DIR__ . '/fixtures/governor-heading/expected-index.php');
            $completion = 'skip-incorrect';
            if ($case['expected'] === 'rejected' && $result['status'] === 'rejected' && $after === $before) {
                $completion = 'reject-correct';
            } elseif ($case['expected'] === 'applied' && $result['status'] === 'applied' && file_get_contents($root . '/index.php') === $expectedFile) {
                unset($before['index.php'], $after['index.php']);
                $completion = $before === $after ? 'pass' : 'wrong-file';
            }
            $rows[] = ['fixture' => $name, 'mode' => 'governor_heading_proof', 'routing' => usageTotals([]),
                'generation' => usageTotals($provider->calls), 'gate' => usageTotals($gateCalls),
                'retries' => 0, 'repairs' => 0, 'task_completion' => $completion, 'result' => $result,
                'savings_eligible' => $completion === 'pass'];
        } finally {
            putenv($previousPreview === false ? 'VS_TEST_PREVIEW_DIR' : 'VS_TEST_PREVIEW_DIR=' . $previousPreview);
            putenv($previousAssets === false ? 'VS_TEST_ASSETS_DIR' : 'VS_TEST_ASSETS_DIR=' . $previousAssets);
            Fixture::remove($root);
        }
    }
}
$comparison = [];
if (count($rows) > 2 && $rows[2]['savings_eligible']) {
    $governorTokens = $rows[2]['generation']['input_tokens'] + $rows[2]['generation']['output_tokens'];
    foreach (array_slice($rows, 0, 2) as $baseline) {
        if (!$baseline['savings_eligible']) { continue; }
        $tokens = $baseline['generation']['input_tokens'] + $baseline['generation']['output_tokens'];
        $comparison[$baseline['mode']] = ['generation_token_reduction_percent' => round(100 * (1 - $governorTokens / $tokens), 2)];
    }
}
echo json_encode(['fixture_version' => $fixture['fixture_version'], 'token_basis' => 'synthetic ceil(UTF-8 bytes / 4); not provider tokenizer usage',
    'latency_basis' => 'local fake call duration, not network/model latency', 'cost_basis' => 'null for fake calls; zero only when no call occurred',
    'routing_status' => 'not implemented in Phase 0-1; selected target supplied directly',
    'quality_warning' => 'Canned output proves mechanics only; not live routing, quality, or the release stop-rule benchmark',
    'rows' => $rows, 'successful_matched_comparisons' => $comparison], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR), "\n";
foreach ($rows as $row) {
    if (!in_array($row['task_completion'], ['pass', 'reject-correct'], true)) { exit(1); }
}
