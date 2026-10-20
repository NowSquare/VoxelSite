<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers/RouterRoutingHarness.php';

use VoxelSite\Tests\RouterRoutingHarness;

$passed = 0;
$failed = [];
function budgetCheck(bool $ok, string $message): void {
    global $passed, $failed;
    $ok ? $passed++ : $failed[] = $message;
}
$base = ['mode' => 'off', 'action' => 'free_prompt', 'interactive' => true];
$capped = RouterRoutingHarness::run($base + ['max_tokens' => 110000, 'output_cap' => 8192, 'context_window' => 32000]);
budgetCheck(($capped['calls'][0]['options']['max_tokens'] ?? null) === 8192, 'Provider-effective output is resolved before stream options');
budgetCheck(str_contains(json_encode($capped['calls'][0]['messages']), 'ROUTING_DATA_SOURCE_SENTINEL'), 'Context uses effective output reservation, retaining site data');
budgetCheck(($capped['metadata']['token_budget']['configured'] ?? null) === 110000, 'Configured budget persists with prompt');
budgetCheck(($capped['metadata']['token_budget']['effective'] ?? null) === 8192, 'Effective budget persists with prompt');
budgetCheck(str_contains($capped['sse'], '"token_budget"'), 'Interactive stream discloses budget before generation');

$low = RouterRoutingHarness::run($base + ['max_tokens' => 4000]);
budgetCheck(($low['calls'][0]['options']['max_tokens'] ?? null) === 4000, 'Generation never silently raises the user output ceiling');
$focused = RouterRoutingHarness::run(['mode' => 'off', 'action' => 'section_edit', 'max_tokens' => 110000, 'output_cap' => 32000]);
budgetCheck(($focused['calls'][0]['options']['max_tokens'] ?? null) === 16000, 'Visual edits retain their 16000 action cap');
foreach (['length', 'max_tokens', 'MAX_TOKENS'] as $reason) {
    $r = RouterRoutingHarness::run($base + ['response' => '', 'finish_reason' => $reason]);
    budgetCheck($r['row']['status'] === 'error', "$reason: empty exhausted response is an error");
    budgetCheck(str_contains($r['row']['error_message'] ?? '', 'output limit'), "$reason: actionable output-limit message");
    budgetCheck($r['before'] === $r['after'] && $r['revisions'] === 0, "$reason: no files or revisions created");
    budgetCheck(!str_contains($r['sse'], '"type":"done"') && str_contains($r['sse'], '"type":"error"'), "$reason: SSE reports failure");
}
$empty = RouterRoutingHarness::run($base + ['response' => '', 'finish_reason' => 'stop']);
budgetCheck($empty['row']['status'] === 'error', 'Empty non-exhausted output also fails clearly');
$answer = RouterRoutingHarness::run($base + ['response' => '<message>Which page should I edit?</message>']);
budgetCheck($answer['row']['status'] === 'success', 'Valid conversational response without files still succeeds');
$truncated = RouterRoutingHarness::run($base + ['finish_reason' => 'length']);
budgetCheck($truncated['row']['status'] === 'partial', 'Budget exhaustion with useful output records partial success');
budgetCheck(str_contains($truncated['sse'], '"truncated":true'), 'Provider finish reason triggers continuation even at a complete file boundary');
$question = ['mode' => 'enforce', 'action' => 'free_prompt', 'intent' => 'question', 'scope' => 'one_page',
    'max_tokens' => 1000, 'response' => '', 'finish_reason' => 'length'];
$r = RouterRoutingHarness::run($question);
budgetCheck(($r['calls'][0]['options']['max_tokens'] ?? null) === 1000, 'Routed answers respect configured output ceiling');
budgetCheck($r['row']['status'] === 'error', 'Routed empty exhausted answer is not success');
budgetCheck(($r['metadata']['token_budget']['effective'] ?? null) === 1000, 'Routed answer records effective budget');
budgetCheck(($r['metadata']['finish_reason'] ?? null) === 'length', 'Routed answer records finish reason');
$question['response'] = 'The site describes a bakery.';
$r = RouterRoutingHarness::run($question);
budgetCheck($r['row']['status'] === 'partial', 'Routed exhausted answer with text is partial');
budgetCheck($r['before'] === $r['after'] && $r['revisions'] === 0, 'Routed answer remains read only');

foreach ($failed as $failure) { fwrite(STDERR, "FAIL: $failure\n"); }
echo "Generation budget: $passed passed, " . count($failed) . " failed\n";
exit($failed ? 1 : 0);
