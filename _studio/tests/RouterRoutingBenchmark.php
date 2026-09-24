<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers/RouterRoutingHarness.php';
use VoxelSite\Tests\RouterRoutingHarness;

// Matched successful requests through production PromptEngine with deterministic
// providers. Byte/4 estimates are not live usage or a dollar-savings claim.
$rows = []; $cuts = [];
foreach (['inline_edit', 'section_edit'] as $action) {
    $pair = [];
    foreach (['off', 'enforce'] as $mode) {
        $result = RouterRoutingHarness::run(['action' => $action, 'mode' => $mode]);
        if ($result['row']['status'] !== 'success' || count($result['calls']) !== 1) {
            throw new RuntimeException('Matched task did not complete: ' . $action . '/' . $mode);
        }
        $call = $result['calls'][0];
        $pair[$mode === 'off' ? 'off' : 'on'] = [
            'generation_input_estimate' => $call['input_tokens'],
            'generation_output_estimate' => $call['output_tokens'],
            'generation_total_estimate' => $call['input_tokens'] + $call['output_tokens'],
            'classification_calls' => count($result['requests']),
            'classification_input_bytes' => $result['requests'] ? strlen(json_encode($result['requests'][0], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) : 0,
            'classification_live_usage' => null, 'cost_usd' => null,
            'output_hash' => hash('sha256', $result['content']),
        ];
    }
    if ($pair['off']['output_hash'] !== $pair['on']['output_hash']) { throw new RuntimeException('Matched output differs: ' . $action); }
    $cut = 100 * (1 - $pair['on']['generation_total_estimate'] / $pair['off']['generation_total_estimate']);
    $cuts[] = $cut;
    $rows[$action] = $pair + ['generation_token_cut_percent' => round($cut, 2), 'matched_output' => true];
}
echo json_encode(['measurement' => 'synthetic byte/4; classifier input bytes exclude transport wrappers; no live usage or cost',
    'requests' => $rows, 'median_generation_cut_percent' => round(array_sum($cuts) / count($cuts), 2),
    'live_50_percent_cut_verified' => false], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
