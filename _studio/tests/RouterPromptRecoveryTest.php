<?php
declare(strict_types=1);
// Exercise the actual endpoint with boundary spies; no site, database or vendor writes.
if (($argv[1] ?? '') === '--child') {
    require __DIR__ . '/helpers/router-prompt-recovery.php';
    exit;
}
$passed = 0; $errors = [];
foreach (['off', 'shadow', 'enforce', 'missing_key', 'invalid_mode'] as $mode) {
    $process = proc_open([PHP_BINARY, __FILE__, '--child', $mode], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    $output = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $stderr = stream_get_contents($pipes[2]); fclose($pipes[2]);
    $exit = proc_close($process);
    $result = json_decode($output, true);
    $expected = in_array($mode, ['off', 'shadow'], true) ? 1 : 0;
    foreach ([
        'endpoint completes' => $exit === 0 && $stderr === '' && is_array($result),
        'engine still handles request and visible errors' => ($result['dispatches'] ?? 0) === 1,
        'stale job metadata recovered' => ($result['updates'] ?? 0) === 1,
        'writer only constructed for legacy mode' => ($result['writers'] ?? -1) === $expected,
        'style recovery only in legacy mode' => ($result['styles'] ?? -1) === $expected,
        'CSS compilation only in legacy mode' => ($result['compiles'] ?? -1) === $expected,
    ] as $label => $ok) {
        if ($ok) { $passed++; } else { $errors[] = "$mode: $label"; }
    }
}
foreach ($errors as $error) { echo "FAIL: $error\n"; }
echo "Passed: $passed\nFailed: " . count($errors) . "\n";
exit($errors === [] ? 0 : 1);
