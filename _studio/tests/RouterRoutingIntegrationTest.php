<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers/RouterRoutingHarness.php';
use VoxelSite\Tests\RouterRoutingHarness;
$passed = 0; $errors = [];
function routingCheck(bool $ok, string $label): void { global $passed, $errors; $ok ? $passed++ : $errors[] = $label; }
function routingRun(string $label, array $scenario): ?array {
    try { return RouterRoutingHarness::run($scenario); }
    catch (Throwable $error) { routingCheck(false, $label . ': ' . $error->getMessage()); return null; }
}
function routingDecision(array $r): array { return $r['metadata']['governor_routing'] ?? $r['metadata']['governor_route'] ?? []; }
function routingModel(array $r, string $expected, string $label): void {
    routingCheck(($r['calls'][0]['options']['model'] ?? null) === $expected, $label . ': actual generation options select ' . $expected);
    routingCheck(($r['row']['ai_model'] ?? null) === $expected, $label . ': prompt log records actual model');
    $generation = array_values(array_filter($r['ledger'], fn($row) => $row['kind'] === 'generation'));
    routingCheck(count($generation) === 1 && $generation[0]['model'] === $expected, $label . ': ledger records actual model once');
    foreach ($r['ledger'] as $call) {
        routingCheck((int) $call['prompt_log_id'] === (int) $r['row']['id'], $label . ': call linked to actual prompt job');
    }
    routingCheck($r['default_model'] === 'routing-default', $label . ': saved default is unchanged');
    routingCheck($r['secrets_excluded'], $label . ': no key in calls, metadata, ledger, or logs');
}
$off = routingRun('off', ['mode' => 'off']);
$shadow = routingRun('preview', ['mode' => 'shadow']);
if ($off && $shadow) {
    routingCheck($off['requests'] === [] && $off['client_constructions'] === 0, 'off: zero TypeSafe construction or calls');
    foreach (['system', 'messages', 'options'] as $key) {
        routingCheck($off['calls'][0][$key] === $shadow['calls'][0][$key], 'preview: exact off equivalence for generation ' . $key);
    }
    routingCheck($off['content'] === $shadow['content'], 'preview: same successful output as off');
    routingCheck(count($shadow['requests']) === 1 && count(array_filter($shadow['ledger'], fn($row) => $row['kind'] === 'classify')) === 1, 'preview: classifier overhead ledgered once');
    routingCheck((routingDecision($shadow)['status'] ?? '') === 'preview', 'preview: records proposed routing');
    routingModel($off, 'routing-default', 'off'); routingModel($shadow, 'routing-default', 'preview');
}
$cases = [
    'paragraph' => ['action' => 'inline_edit', 'intent' => 'edit_copy', 'tier' => 'cheap'],
    'section' => ['action' => 'section_edit', 'intent' => 'edit_layout', 'tier' => 'frontier'],
    'create' => ['action' => 'add_page', 'page_scope' => null, 'intent' => 'add_page', 'scope' => 'one_page', 'tier' => 'frontier', 'prompt' => 'Create a services page.'],
    'restyle' => ['action' => 'restyle_site', 'page_scope' => null, 'intent' => 'restyle', 'scope' => 'whole_site', 'tier' => 'frontier', 'prompt' => 'Restyle the website with a warm editorial design.'],
    'scoped copy' => ['action' => 'free_prompt', 'intent' => 'edit_copy', 'scope' => 'one_page', 'tier' => 'cheap', 'prompt' => 'Shorten the homepage paragraph.'],
];
foreach ($cases as $label => $scenario) {
    $r = routingRun($label, $scenario); if (!$r) { continue; }
    routingCheck($r['row']['status'] === 'success', $label . ': ordinary editing succeeds: ' . ($r['row']['error_message'] ?? ''));
    routingCheck((routingDecision($r)['status'] ?? '') === 'routed', $label . ': routing applied');
    routingModel($r, 'routing-' . $scenario['tier'], $label);
    routingCheck($label === 'create' ? str_contains($r['created'] ?? '', 'ROUTING_CREATED_PAGE') : str_contains($r['content'], 'Fresh bread daily.'), $label . ': actual requested edit saved');
    $input = ($r['calls'][0]['system'] ?? '') . json_encode($r['calls'][0]['messages'] ?? []);
    if (in_array($label, ['paragraph', 'scoped copy'], true)) {
        routingCheck(str_contains($input, 'ROUTING_DATA_SOURCE_SENTINEL'), $label . ': focused context retains JSON data source');
        routingCheck(str_contains($input, 'Sourdough is baked each morning.'), $label . ': selected page source is actually sent');
        routingCheck(!str_contains($input, 'ROUTING_UNRELATED_PAGE_SENTINEL'), $label . ': unrelated page excluded from focused context');
        if ($off) { routingCheck(strlen($r['calls'][0]['system']) < strlen($off['calls'][0]['system']), $label . ': compact system prompt selected'); }
    }
    if ($label === 'restyle') { routingCheck(str_contains($input, 'ROUTING_UNRELATED_PAGE_SENTINEL'), 'restyle: full context retains unrelated page content'); }
}
$r = routingRun('question', ['action' => 'free_prompt', 'intent' => 'question', 'scope' => 'one_page', 'prompt' => 'What does this bakery sell?']);
if ($r) {
    routingCheck($r['row']['status'] === 'success', 'question: successful read-only response');
    routingCheck($r['before'] === $r['after'], 'question: malicious file tags cause zero preview changes including shutdown');
    routingCheck(!str_contains($r['content'], 'MALICIOUS_QUESTION_WRITE'), 'question: response cannot overwrite site');
    routingCheck($r['revisions'] === 0 && $r['before_assets'] === $r['after_assets'], 'question: no revision or derived asset write');
    routingModel($r, 'routing-cheap', 'question');
}
foreach (['outage', 'missing_key', 'map_mismatch', 'low_confidence'] as $fault) {
    $r = routingRun($fault, ['fault' => $fault]); if (!$r) { continue; }
    routingCheck($r['row']['status'] === 'success' && str_contains($r['content'], 'Fresh bread daily.'), $fault . ': fallback still performs requested edit');
    routingCheck((routingDecision($r)['status'] ?? '') === 'fallback' && !empty(routingDecision($r)['reason']), $fault . ': visible default-handling reason');
    routingModel($r, 'routing-default', $fault);
}
$r = routingRun('explicit scope', ['intent' => 'new_site', 'scope' => 'whole_site', 'tier' => 'frontier']);
if ($r) {
    routingCheck((routingDecision($r)['recipe'] ?? '') === 'inline_edit' && $r['row']['action_type'] === 'inline_edit', 'explicit action: authoritative recipe and request action preserved');
    routingCheck(str_contains($r['content'], 'Fresh bread daily.'), 'explicit action: classifier cannot discard selected paragraph operation');
    routingCheck($r['before']['bakery/index.php'] === $r['after']['bakery/index.php'], 'explicit action: classifier cannot broaden selected target');
}
$r = routingRun('stale target', ['stale' => true]);
if ($r) {
    routingCheck(str_contains($r['content'], 'Concurrent owner edit.') && !str_contains($r['content'], 'Fresh bread daily.'), 'stale selected target: concurrent edit preserved');
    routingCheck(count($r['calls']) === 1, 'stale selected target: no automatic retry after generation');
}
foreach ([['interactive' => true], ['preallocated' => true]] as $path) {
    $label = isset($path['interactive']) ? 'interactive' : 'preallocated headless';
    foreach (['edit_copy', 'question'] as $intent) {
        $r = routingRun($label . ' ' . $intent, $path + ['action' => $intent === 'question' ? 'free_prompt' : 'inline_edit', 'intent' => $intent]);
        if (!$r) { continue; }
        routingCheck($r['row']['status'] === 'success' && $r['prompt_count'] === 1, $label . ': shared engine finishes one job');
        routingModel($r, 'routing-cheap', $label . ' ' . $intent);
        if (isset($path['interactive'])) {
            routingCheck(str_contains($r['sse'], '"type":"done"') && str_contains($r['sse'], '"type":"prompt_id"'), 'interactive: real SSE completion and job identity');
        } else {
            routingCheck((int) $r['row']['id'] === $r['preallocated_id'], 'headless: preallocated job reused');
            routingCheck($r['sse'] === '', 'headless: no interactive SSE');
        }
        routingCheck($intent === 'question' ? $r['before'] === $r['after'] : str_contains($r['content'], 'Fresh bread daily.'), $label . ': requested outcome preserved');
    }
}
foreach ([['preallocated' => true], ['interactive' => true]] as $path) {
    $r = routingRun('cancel question', $path + ['action' => 'free_prompt', 'intent' => 'question', 'cancel' => true]);
    if ($r) {
        routingCheck($r['row']['status'] === 'error' && $r['row']['error_message'] === 'Generation was cancelled.', 'question: existing cancellation marker preserved');
        routingCheck($r['before'] === $r['after'] && $r['before_assets'] === $r['after_assets'] && $r['revisions'] === 0, 'question: cancellation makes no site or revision writes');
        routingCheck(count($r['calls']) === 1, 'question: cancelled generation is not retried');
        if (isset($path['interactive'])) { routingCheck(str_contains($r['sse'], '"cancelled":true'), 'question: interactive cancellation reported through SSE'); }
    }
}
$r = routingRun('scoped free restyle', ['action' => 'free_prompt', 'intent' => 'restyle', 'scope' => 'whole_site', 'tier' => 'frontier', 'prompt' => 'Restyle this page.']);
if ($r) {
    $input = json_encode($r['calls'][0]['messages'] ?? []);
    routingCheck($r['row']['status'] === 'success' && str_contains($r['content'], 'Fresh bread daily.'), 'scoped free restyle: editing completes');
    routingCheck(!str_contains($input, 'ROUTING_UNRELATED_PAGE_SENTINEL'), 'scoped free restyle: explicit page scope excludes unrelated page');
    routingCheck($r['before']['bakery/index.php'] === $r['after']['bakery/index.php'], 'scoped free restyle: unrelated page unchanged');
}
$r = routingRun('mapped free create', ['action' => 'free_prompt', 'intent' => 'add_page', 'scope' => 'one_page', 'tier' => 'frontier', 'page_scope' => null,
    'action_data' => ['page_name' => 'Services'], 'prompt' => 'Add the page.']);
if ($r) {
    routingCheck((routingDecision($r)['recipe'] ?? '') === 'add_page', 'mapped free create: code-owned add_page recipe chosen');
    routingCheck(str_contains(json_encode($r['calls'][0]['messages'] ?? []), 'Services'), 'mapped free create: recipe enriches generation with provided page name');
    routingCheck($r['row']['status'] === 'success' && str_contains($r['created'] ?? '', 'ROUTING_CREATED_PAGE'), 'mapped free create: actual page saved');
}
$exactPrompt = 'Replace the selected paragraph with "Fresh bread daily.".';
foreach ([$exactPrompt => '<p>Fresh bread daily.</p>',
    'Replace the selected paragraph with "<script>alert(1)</script>".' => '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>'] as $prompt => $expected) {
    $r = routingRun('exact replacement', ['tier' => 'none', 'prompt' => $prompt]);
    if (!$r) { continue; }
    routingCheck($r['row']['status'] === 'success' && (routingDecision($r)['recipe'] ?? '') === 'replace_text', 'exact replacement: deterministic recipe completes');
    routingCheck($r['calls'] === [] && count($r['ledger']) === 1 && $r['ledger'][0]['kind'] === 'classify', 'exact replacement: one classifier call and no generator');
    routingCheck(str_contains($r['content'], $expected), 'exact replacement: literal text escaped and selected markup preserved');
    $changed = array_keys(array_diff_assoc($r['after'], $r['before']));
    routingCheck($changed === ['index.php'] && $r['before_assets'] === $r['after_assets'], 'exact replacement: only selected file changes');
    routingCheck($r['revisions'] === 1 && (int) $r['row']['revision_id'] > 0, 'exact replacement: normal revision recorded');
}
$r = routingRun('exact replacement undo', ['tier' => 'none', 'prompt' => $exactPrompt, 'undo' => true]);
if ($r) {
    routingCheck($r['undo_result'] !== null && $r['undo_restored'], 'exact replacement: normal undo restores original selected content');
}
$r = routingRun('exact replacement stale', ['tier' => 'none', 'prompt' => $exactPrompt, 'stale_classification' => true]);
if ($r) {
    routingCheck($r['row']['status'] === 'error' && str_contains($r['content'], 'Concurrent owner edit.'), 'exact replacement: stale target cannot overwrite concurrent change');
    routingCheck($r['calls'] === [] && $r['revisions'] === 0, 'exact replacement: stale request adds no generation or revision');
}
$r = routingRun('ambiguous replacement', ['tier' => 'none', 'prompt' => 'Replace the paragraph with something like fresh bread, but improve it.']);
if ($r) {
    routingCheck($r['row']['status'] === 'success' && count($r['calls']) === 1 && (routingDecision($r)['recipe'] ?? '') !== 'replace_text', 'ambiguous replacement: normal generation remains available');
    routingCheck(str_contains($r['content'], 'Fresh bread daily.'), 'ambiguous replacement: generated edit actually saved');
}
$r = routingRun('explicit noop', ['action' => 'free_prompt', 'intent' => 'noop', 'tier' => 'none', 'prompt' => 'No changes.']);
if ($r) {
    routingCheck($r['row']['status'] === 'success' && (routingDecision($r)['recipe'] ?? '') === 'noop', 'explicit noop: acknowledgement succeeds');
    routingCheck($r['calls'] === [] && count($r['ledger']) === 1 && $r['ledger'][0]['kind'] === 'classify', 'explicit noop: classifier only, no generation');
    routingCheck($r['before'] === $r['after'] && $r['before_assets'] === $r['after_assets'] && $r['revisions'] === 0, 'explicit noop: no site mutations or revision');
}
foreach ([['action' => 'section_edit'], ['action' => 'inline_edit', 'max_tokens' => 8000], ['action' => 'free_prompt']] as $configuration) {
    $scenario = $configuration + ['oversized_context' => true, 'intent' => 'edit_copy'];
    $normal = routingRun('oversized off', $scenario + ['mode' => 'off']);
    $fallback = routingRun('oversized fallback', $scenario);
    if (!$normal || !$fallback) { continue; }
    routingCheck((routingDecision($fallback)['reason'] ?? '') === 'context_too_large', 'oversized context: explicit fallback recorded');
    routingCheck($fallback['row']['status'] === 'success' && str_contains($fallback['content'], 'Fresh bread daily.'), 'oversized context: normal editing remains available');
    foreach (['system', 'options', 'messages'] as $part) {
        routingCheck(($fallback['calls'][0][$part] ?? null) === ($normal['calls'][0][$part] ?? null), 'oversized ' . $configuration['action'] . ': normal ' . $part . ' restored exactly');
    }
}
$r = routingRun('oversized stale classification', ['action' => 'free_prompt', 'oversized_context' => true, 'stale_classification' => true]);
if ($r) {
    routingCheck((routingDecision($r)['reason'] ?? '') === 'context_too_large', 'oversized stale: scenario enters context fallback');
    routingCheck($r['row']['status'] === 'error' && str_contains($r['content'], 'Concurrent owner edit.') && !str_contains($r['content'], 'Fresh bread daily.'), 'oversized stale: fallback preserves concurrent owner edit');
    routingCheck($r['revisions'] === 0 && $r['calls'] === [], 'oversized stale: stale classification stops before generation or revision');
}
$r = routingRun('oversized stale stream', ['action' => 'free_prompt', 'oversized_context' => true, 'stale' => true]);
if ($r) {
    routingCheck((routingDecision($r)['reason'] ?? '') === 'context_too_large' && $r['row']['status'] === 'error', 'oversized stale stream: fallback detects concurrent change');
    routingCheck(str_contains($r['content'], 'Concurrent owner edit.') && !str_contains($r['content'], 'Fresh bread daily.'), 'oversized stale stream: buffered output cannot overwrite concurrent owner edit');
    routingCheck($r['revisions'] === 0 && count($r['calls']) === 1, 'oversized stale stream: no revision or retry');
}
foreach ($errors as $error) { echo 'FAIL: ' . $error . "\n"; }
echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
exit($errors === [] ? 0 : 1);
