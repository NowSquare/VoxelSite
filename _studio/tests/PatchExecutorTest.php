<?php

declare(strict_types=1);

/**
 * PatchExecutor Test Suite (B7/B8/B9)
 *
 * Run: php _studio/tests/PatchExecutorTest.php
 *
 * Tests:
 *   1. Replace edit — anchored, unique match → success + verification
 *   2. Anchor drift — before_snippet not found → rollback
 *   3. Ambiguous anchor — before_snippet appears multiple times → refuse
 *   4. PHP lint failure — broken syntax after patch → rollback
 *   5. JSON parse verification — valid + invalid
 *   6. CSS brace verification — balanced + unbalanced
 *   7. Insert edit — with before_snippet anchor → correct position
 *   8. Insert edit — without before_snippet → refused
 *   9. Rollback status — hasMutated + clean restore
 *  10. Structured log — phase events have required fields
 *  11. Verification payload — per-file checks with pass/fail
 *  12. All-or-nothing — partial failure rolls back all files
 */

require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\PatchExecutor;

$passed = 0;
$failed = 0;
$errors = [];

function record(bool $condition, string $message, array &$errors, int &$passed, int &$failed): void
{
    if ($condition) {
        $passed++;
        return;
    }
    $failed++;
    $errors[] = $message;
}

echo "=== PatchExecutor Test Suite ===\n\n";

// ═══════════════════════════════════════════
//  Setup — temp directory with test fixtures
// ═══════════════════════════════════════════

$liveDbPath = dirname(__DIR__) . '/data/studio.db';
if (!file_exists($liveDbPath)) {
    echo "ABORT: No database found at {$liveDbPath}.\n";
    exit(1);
}

$livePreviewDir = dirname(__DIR__) . '/preview';
if (!is_dir($livePreviewDir)) {
    echo "ABORT: No preview directory found.\n";
    exit(1);
}

$tempDir     = sys_get_temp_dir() . '/voxelsite_patch_test_' . uniqid();
$tempDbPath  = $tempDir . '/studio.db';
$tempPreview = $tempDir . '/preview';
$tempAssets  = $tempDir . '/assets';

mkdir($tempDir, 0755, true);
copy($liveDbPath, $tempDbPath);

// Minimal preview
mkdir($tempPreview, 0755, true);
mkdir($tempAssets . '/css', 0755, true);
mkdir($tempAssets . '/js', 0755, true);

$liveAssetsDir = dirname(__DIR__, 2) . '/assets';
if (is_dir($liveAssetsDir)) {
    // Copy just enough for FileManager to resolve paths
    foreach (glob($liveAssetsDir . '/css/*.css') as $f) {
        copy($f, $tempAssets . '/css/' . basename($f));
    }
}

putenv("VS_TEST_PREVIEW_DIR={$tempPreview}");
putenv("VS_TEST_ASSETS_DIR={$tempAssets}");

$db = Database::getInstance($tempDbPath);
$fileManager = new FileManager($db);
$fileManager->syncPageRegistry();

echo "  Temp dir: {$tempDir}\n";
echo "  DB initialized.\n\n";


// ═══════════════════════════════════════════
//  Helper: create a test PHP file
// ═══════════════════════════════════════════

function writeTestFile(string $dir, string $name, string $content): string
{
    $path = $dir . '/' . $name;
    $parentDir = dirname($path);
    if (!is_dir($parentDir)) mkdir($parentDir, 0755, true);
    file_put_contents($path, $content);
    return $name;
}


// ═══════════════════════════════════════════
//  1. Replace edit — success + verification
// ═══════════════════════════════════════════

echo "--- 1. Replace edit: anchored, unique match ---\n";

$phpContent = <<<'PHP'
<?php
$page = [
    'title' => 'Old Title',
    'description' => 'Old description text.',
];
?>
<h1><?= $page['title'] ?></h1>
PHP;

writeTestFile($tempPreview, 'test-replace.php', $phpContent);

$executor = new PatchExecutor($fileManager);
$result = $executor->execute([
    [
        'file'           => 'test-replace.php',
        'strategy'       => 'token-edit',
        'anchored'       => true,
        'before_snippet' => "'title' => 'Old Title'",
        'after_snippet'  => "'title' => 'New Title'",
        'description'    => 'Update the title value',
        'region'         => ['start' => 3, 'end' => 3],
    ],
]);

record($result['success'] === true, '1a: Replace succeeds', $errors, $passed, $failed);
record($result['files_changed'] === 1, '1b: 1 file changed', $errors, $passed, $failed);
record(isset($result['duration_ms']), '1c: Has duration_ms', $errors, $passed, $failed);

// Verify file content
$actual = file_get_contents($tempPreview . '/test-replace.php');
record(str_contains($actual, "'title' => 'New Title'"), '1d: File contains new title', $errors, $passed, $failed);
record(!str_contains($actual, "'title' => 'Old Title'"), '1e: File no longer has old title', $errors, $passed, $failed);

// Verify verification report
record(!empty($result['verification']), '1f: Has verification', $errors, $passed, $failed);
if (!empty($result['verification'])) {
    $v = $result['verification'][0];
    record($v['file'] === 'test-replace.php', '1g: Verification for correct file', $errors, $passed, $failed);
    record(count($v['checks']) >= 2, '1h: At least 2 checks (readable + after_snippet)', $errors, $passed, $failed);

    // All checks should pass
    $allPassed = true;
    foreach ($v['checks'] as $c) {
        if (!$c['passed']) $allPassed = false;
    }
    record($allPassed, '1i: All verification checks passed', $errors, $passed, $failed);

    // Check for PHP lint check
    $hasPhpLint = false;
    foreach ($v['checks'] as $c) {
        if ($c['check'] === 'php_lint' && $c['passed']) $hasPhpLint = true;
    }
    record($hasPhpLint, '1j: PHP lint check present and passed', $errors, $passed, $failed);
}


// ═══════════════════════════════════════════
//  2. Anchor drift — before_snippet not found
// ═══════════════════════════════════════════

echo "\n--- 2. Anchor drift ---\n";

writeTestFile($tempPreview, 'test-drift.php', "<?php\n\$x = 'hello';\n");

$executor2 = new PatchExecutor($fileManager);
$result2 = $executor2->execute([
    [
        'file'           => 'test-drift.php',
        'strategy'       => 'token-edit',
        'anchored'       => true,
        'before_snippet' => "THIS DOES NOT EXIST IN THE FILE",
        'after_snippet'  => "replacement",
        'description'    => 'Drift test',
        'region'         => ['start' => 1, 'end' => 2],
    ],
]);

record($result2['success'] === false, '2a: Drift detected', $errors, $passed, $failed);
record(str_contains($result2['error'] ?? '', 'not found'), '2b: Error mentions not found', $errors, $passed, $failed);

// File should be unchanged (no mutation happened before the anchor check)
$driftContent = file_get_contents($tempPreview . '/test-drift.php');
record(str_contains($driftContent, "\$x = 'hello'"), '2c: File unchanged after drift', $errors, $passed, $failed);


// ═══════════════════════════════════════════
//  3. Ambiguous anchor
// ═══════════════════════════════════════════

echo "\n--- 3. Ambiguous anchor ---\n";

writeTestFile($tempPreview, 'test-ambig.php', "<?php\n\$a = 'foo';\n\$b = 'foo';\n");

$executor3 = new PatchExecutor($fileManager);
$result3 = $executor3->execute([
    [
        'file'           => 'test-ambig.php',
        'strategy'       => 'token-edit',
        'anchored'       => true,
        'before_snippet' => "'foo'",
        'after_snippet'  => "'bar'",
        'description'    => 'Ambiguous test',
        'region'         => ['start' => 2, 'end' => 3],
    ],
]);

record($result3['success'] === false, '3a: Ambiguous rejected', $errors, $passed, $failed);
record(str_contains($result3['error'] ?? '', 'Ambiguous'), '3b: Error mentions ambiguous', $errors, $passed, $failed);


// ═══════════════════════════════════════════
//  4. PHP lint failure after patch
// ═══════════════════════════════════════════

echo "\n--- 4. PHP lint failure ---\n";

$validPhp = "<?php\n\$x = 'valid';\n";
writeTestFile($tempPreview, 'test-lint.php', $validPhp);

// Inject a syntax error via patch
$executor4 = new PatchExecutor($fileManager);
$result4 = $executor4->execute([
    [
        'file'           => 'test-lint.php',
        'strategy'       => 'token-edit',
        'anchored'       => true,
        'before_snippet' => "\$x = 'valid';",
        'after_snippet'  => "\$x = 'broken;", // Missing closing quote
        'description'    => 'Break PHP syntax',
        'region'         => ['start' => 2, 'end' => 2],
    ],
]);

record($result4['success'] === false, '4a: Lint failure detected', $errors, $passed, $failed);
record(str_contains($result4['error'] ?? '', 'syntax'), '4b: Error mentions syntax', $errors, $passed, $failed);

// File should be rolled back to valid
$lintContent = file_get_contents($tempPreview . '/test-lint.php');
record(str_contains($lintContent, "'valid'"), '4c: File rolled back to valid state', $errors, $passed, $failed);
record($result4['rollback_clean'] === true, '4d: Rollback was clean', $errors, $passed, $failed);


// ═══════════════════════════════════════════
//  5. JSON parse verification
// ═══════════════════════════════════════════

echo "\n--- 5. JSON parse verification ---\n";

$jsonContent = "{\"name\": \"test\", \"version\": 1}";
writeTestFile($tempPreview, 'test-valid.json', $jsonContent);

$executor5 = new PatchExecutor($fileManager);
$result5 = $executor5->execute([
    [
        'file'           => 'test-valid.json',
        'strategy'       => 'token-edit',
        'anchored'       => true,
        'before_snippet' => '"version": 1',
        'after_snippet'  => '"version": 2',
        'description'    => 'Bump version',
        'region'         => ['start' => 1, 'end' => 1],
    ],
]);

record($result5['success'] === true, '5a: JSON patch succeeds', $errors, $passed, $failed);
if (!empty($result5['verification'])) {
    $jsonChecks = $result5['verification'][0]['checks'] ?? [];
    $hasJsonParse = false;
    foreach ($jsonChecks as $c) {
        if ($c['check'] === 'json_parse' && $c['passed']) $hasJsonParse = true;
    }
    record($hasJsonParse, '5b: JSON parse check present and passed', $errors, $passed, $failed);
}


// ═══════════════════════════════════════════
//  6. CSS brace verification
// ═══════════════════════════════════════════

echo "\n--- 6. CSS brace verification ---\n";

$cssContent = "body { color: red; }\n.foo { display: block; }\n";
writeTestFile($tempPreview, 'test-valid.css', $cssContent);

$executor6 = new PatchExecutor($fileManager);
$result6 = $executor6->execute([
    [
        'file'           => 'test-valid.css',
        'strategy'       => 'token-edit',
        'anchored'       => true,
        'before_snippet' => 'color: red;',
        'after_snippet'  => 'color: blue;',
        'description'    => 'Change color',
        'region'         => ['start' => 1, 'end' => 1],
    ],
]);

record($result6['success'] === true, '6a: CSS patch succeeds', $errors, $passed, $failed);
if (!empty($result6['verification'])) {
    $cssChecks = $result6['verification'][0]['checks'] ?? [];
    $hasCssBraces = false;
    foreach ($cssChecks as $c) {
        if ($c['check'] === 'css_braces' && $c['passed']) $hasCssBraces = true;
    }
    record($hasCssBraces, '6b: CSS brace check present and passed', $errors, $passed, $failed);
}


// ═══════════════════════════════════════════
//  7. Insert with before_snippet anchor
// ═══════════════════════════════════════════

echo "\n--- 7. Anchored insert ---\n";

$insertBase = "<?php\n\$items = [\n    'alpha',\n    'gamma',\n];\n";
writeTestFile($tempPreview, 'test-insert.php', $insertBase);

$executor7 = new PatchExecutor($fileManager);
$result7 = $executor7->execute([
    [
        'file'           => 'test-insert.php',
        'strategy'       => 'block-insert',
        'anchored'       => true,
        'before_snippet' => "    'alpha',",
        'after_snippet'  => "    'beta',",
        'description'    => 'Insert beta after alpha',
        'region'         => ['start' => 3, 'end' => 3],
    ],
]);

record($result7['success'] === true, '7a: Anchored insert succeeds', $errors, $passed, $failed);
$insertResult = file_get_contents($tempPreview . '/test-insert.php');
$insertLines = explode("\n", $insertResult);
$alphaIdx = array_search("    'alpha',", $insertLines);
$betaIdx = array_search("    'beta',", $insertLines);
record($betaIdx !== false, '7b: beta line exists', $errors, $passed, $failed);
if ($alphaIdx !== false && $betaIdx !== false) {
    record($betaIdx === $alphaIdx + 1, '7c: beta is directly after alpha', $errors, $passed, $failed);
}


// ═══════════════════════════════════════════
//  8. Insert without before_snippet — refused
// ═══════════════════════════════════════════

echo "\n--- 8. Unanchored insert ---\n";

writeTestFile($tempPreview, 'test-noanchor.php', "<?php\n\$x = 1;\n");

$executor8 = new PatchExecutor($fileManager);
$result8 = $executor8->execute([
    [
        'file'           => 'test-noanchor.php',
        'strategy'       => 'block-insert',
        'anchored'       => true,
        'before_snippet' => '',
        'after_snippet'  => "\$y = 2;",
        'description'    => 'Insert without anchor',
        'region'         => ['start' => 2, 'end' => 2],
    ],
]);

record($result8['success'] === false, '8a: Unanchored insert refused', $errors, $passed, $failed);
record(str_contains($result8['error'] ?? '', 'no before_snippet'), '8b: Error mentions missing anchor', $errors, $passed, $failed);


// ═══════════════════════════════════════════
//  9. Unanchored edits rejected
// ═══════════════════════════════════════════

echo "\n--- 9. Unanchored edits rejected ---\n";

$executor9 = new PatchExecutor($fileManager);
$result9 = $executor9->execute([
    [
        'file'           => 'test-replace.php',
        'strategy'       => 'token-edit',
        'anchored'       => false,
        'before_snippet' => 'anything',
        'after_snippet'  => 'anything else',
        'description'    => 'Not anchored',
        'region'         => ['start' => 1, 'end' => 1],
    ],
]);

record($result9['success'] === false, '9a: Unanchored edit rejected', $errors, $passed, $failed);
record(str_contains($result9['error'] ?? '', 'No anchored'), '9b: Error mentions no anchored edits', $errors, $passed, $failed);


// ═══════════════════════════════════════════
//  10. Structured log — phase events
// ═══════════════════════════════════════════

echo "\n--- 10. Structured log ---\n";

// Use result from test 1 (successful replace)
$log = $result['log'];
record(count($log) > 0, '10a: Log is non-empty', $errors, $passed, $failed);

// Every entry must have phase, file, status, detail, ms
$allStructured = true;
foreach ($log as $entry) {
    if (!isset($entry['phase'], $entry['file'], $entry['status'], $entry['detail'], $entry['ms'])) {
        $allStructured = false;
        break;
    }
}
record($allStructured, '10b: All log entries have phase/file/status/detail/ms', $errors, $passed, $failed);

// Check phase sequence for a successful single-file edit
$phases = array_column($log, 'phase');
record(in_array('snapshot', $phases), '10c: Has snapshot phase', $errors, $passed, $failed);
record(in_array('read', $phases), '10d: Has read phase', $errors, $passed, $failed);
record(in_array('anchor', $phases), '10e: Has anchor phase', $errors, $passed, $failed);
record(in_array('patch', $phases), '10f: Has patch phase', $errors, $passed, $failed);
record(in_array('verify', $phases), '10g: Has verify phase', $errors, $passed, $failed);
record(in_array('done', $phases), '10h: Has done phase', $errors, $passed, $failed);

// Timing is monotonic
$lastMs = -1;
$monotonic = true;
foreach ($log as $entry) {
    if ($entry['ms'] < $lastMs) {
        $monotonic = false;
        break;
    }
    $lastMs = $entry['ms'];
}
record($monotonic, '10i: Timing is monotonic', $errors, $passed, $failed);


// ═══════════════════════════════════════════
//  11. Multi-file rollback — partial failure
// ═══════════════════════════════════════════

echo "\n--- 11. Multi-file rollback ---\n";

$file1Content = "<?php\n\$a = 'original_a';\n";
$file2Content = "<?php\n\$b = 'original_b';\n\$c = 'original_c';\n";

writeTestFile($tempPreview, 'test-multi-a.php', $file1Content);
writeTestFile($tempPreview, 'test-multi-b.php', $file2Content);

$executorMulti = new PatchExecutor($fileManager);
$resultMulti = $executorMulti->execute([
    // First edit — will succeed
    [
        'file'           => 'test-multi-a.php',
        'strategy'       => 'token-edit',
        'anchored'       => true,
        'before_snippet' => "'original_a'",
        'after_snippet'  => "'modified_a'",
        'description'    => 'Edit file A',
        'region'         => ['start' => 2, 'end' => 2],
    ],
    // Second edit — will fail (anchor drift)
    [
        'file'           => 'test-multi-b.php',
        'strategy'       => 'token-edit',
        'anchored'       => true,
        'before_snippet' => "DOES NOT EXIST",
        'after_snippet'  => "'modified_b'",
        'description'    => 'Edit file B (will fail)',
        'region'         => ['start' => 2, 'end' => 2],
    ],
]);

record($resultMulti['success'] === false, '11a: Multi-file fails on drift', $errors, $passed, $failed);

// File A should be rolled back to original
$multiA = file_get_contents($tempPreview . '/test-multi-a.php');
record(str_contains($multiA, "'original_a'"), '11b: File A rolled back', $errors, $passed, $failed);
record(!str_contains($multiA, "'modified_a'"), '11c: File A does not contain modified content', $errors, $passed, $failed);

// File B should be unchanged
$multiB = file_get_contents($tempPreview . '/test-multi-b.php');
record(str_contains($multiB, "'original_b'"), '11d: File B unchanged', $errors, $passed, $failed);

// Rollback events in log
$rollbackPhases = array_filter($resultMulti['log'], fn($e) => $e['phase'] === 'rollback');
record(count($rollbackPhases) > 0, '11e: Rollback phase events present', $errors, $passed, $failed);
record($resultMulti['rollback_clean'] === true, '11f: Rollback was clean', $errors, $passed, $failed);


// ═══════════════════════════════════════════
//  12. Crash during writeFile — rollback after prior mutation
// ═══════════════════════════════════════════

echo "\n--- 12. Crash rollback (thrown writeFile) ---\n";

// ThrowingFileManager: wraps the real FileManager but throws on writeFile
// for a specific target file, simulating a real server disk failure.
$throwTarget = 'test-crash-b.php';

$throwingFM = new class($fileManager, $throwTarget) extends FileManager {
    private FileManager $inner;
    private string $throwFile;

    public function __construct(FileManager $inner, string $throwFile) {
        // Skip parent constructor — we delegate everything
        $this->inner = $inner;
        $this->throwFile = $throwFile;
    }

    public function readFile(string $path): ?string {
        return $this->inner->readFile($path);
    }

    public function writeFile(string $path, string $content): ?string {
        if ($path === $this->throwFile) {
            throw new \RuntimeException('Simulated disk failure on ' . $path);
        }
        return $this->inner->writeFile($path, $content);
    }
};

// Two files: file A will patch successfully, file B will throw on write
$crashA = "<?php\n\$x = 'crash_a_original';\n";
$crashB = "<?php\n\$y = 'crash_b_original';\n";

writeTestFile($tempPreview, 'test-crash-a.php', $crashA);
writeTestFile($tempPreview, 'test-crash-b.php', $crashB);

// Track emitted phases via onEmit callback
$emittedPhases = [];
$onEmit = function (array $entry) use (&$emittedPhases) {
    $emittedPhases[] = $entry['phase'] . ':' . $entry['status'];
};

$executorCrash = new PatchExecutor($throwingFM, $onEmit);
$resultCrash = $executorCrash->execute([
    // First edit — file A, will succeed (writeFile works for this file)
    [
        'file'           => 'test-crash-a.php',
        'strategy'       => 'token-edit',
        'anchored'       => true,
        'before_snippet' => "'crash_a_original'",
        'after_snippet'  => "'crash_a_modified'",
        'description'    => 'Edit file A (succeeds)',
        'region'         => ['start' => 2, 'end' => 2],
    ],
    // Second edit — file B, writeFile will THROW
    [
        'file'           => 'test-crash-b.php',
        'strategy'       => 'token-edit',
        'anchored'       => true,
        'before_snippet' => "'crash_b_original'",
        'after_snippet'  => "'crash_b_modified'",
        'description'    => 'Edit file B (will crash)',
        'region'         => ['start' => 2, 'end' => 2],
    ],
]);

// 12a: Execute returned failure (not an uncaught exception)
record($resultCrash['success'] === false, '12a: Crash detected as failure', $errors, $passed, $failed);

// 12b: Error message includes the crash reason
record(
    str_contains($resultCrash['error'] ?? '', 'Simulated disk failure'),
    '12b: Error mentions the crash reason',
    $errors, $passed, $failed
);

// 12c: File A is rolled back to original (the critical test)
$crashAContent = file_get_contents($tempPreview . '/test-crash-a.php');
record(
    str_contains($crashAContent, "'crash_a_original'"),
    '12c: File A rolled back to original after crash',
    $errors, $passed, $failed
);
record(
    !str_contains($crashAContent, "'crash_a_modified'"),
    '12d: File A does not contain mutated content',
    $errors, $passed, $failed
);

// 12e: File B is unchanged (crash happened before its write completed)
$crashBContent = file_get_contents($tempPreview . '/test-crash-b.php');
record(
    str_contains($crashBContent, "'crash_b_original'"),
    '12e: File B unchanged (crash before write)',
    $errors, $passed, $failed
);

// 12f: Rollback phases are in the log
$crashRollbacks = array_filter($resultCrash['log'], fn($e) => $e['phase'] === 'rollback');
record(count($crashRollbacks) > 0, '12f: Rollback phase events in log', $errors, $passed, $failed);

// 12g: Crash phase is in the log
$crashPhases = array_filter($resultCrash['log'], fn($e) => $e['phase'] === 'crash');
record(count($crashPhases) > 0, '12g: Crash phase event in log', $errors, $passed, $failed);

// 12m: crash phase must reference the content file, not the PHP source file
$crashEntry = reset($crashPhases);
record(
    $crashEntry['file'] === 'test-crash-b.php',
    '12m: Crash phase file is the content target, not PHP source',
    $errors, $passed, $failed
);

// 12h: rollback_clean is false because ThrowingFileManager also throws during
// rollback of test-crash-b.php — this correctly reflects real-world behavior
// where the same disk that failed the write also fails the restore.
record($resultCrash['rollback_clean'] === false, '12h: Rollback was partial (disk still broken)', $errors, $passed, $failed);

// 12i: onEmit callback fired for partial transcript (phases logged before crash)
record(count($emittedPhases) > 0, '12i: onEmit callback fired (partial transcript)', $errors, $passed, $failed);
record(
    in_array('snapshot:ok', $emittedPhases),
    '12j: Snapshot phase emitted before crash',
    $errors, $passed, $failed
);
record(
    in_array('crash:error', $emittedPhases),
    '12k: Crash phase emitted via callback',
    $errors, $passed, $failed
);
record(
    in_array('rollback:ok', $emittedPhases) || in_array('rollback:partial', $emittedPhases),
    '12l: Rollback phase emitted via callback',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  Cleanup
// ═══════════════════════════════════════════

putenv('VS_TEST_PREVIEW_DIR');
putenv('VS_TEST_ASSETS_DIR');

function cleanupTempDir(string $dir): void
{
    if (!is_dir($dir)) return;
    $items = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($items as $item) {
        $item->isDir() ? rmdir($item->getPathname()) : unlink($item->getPathname());
    }
    rmdir($dir);
}

cleanupTempDir($tempDir);
echo "\n  Temp fixtures cleaned up.\n";


// ═══════════════════════════════════════════
//  Results
// ═══════════════════════════════════════════

echo "\n=== Results ===\n";
echo "Passed: {$passed}\n";
echo "Failed: {$failed}\n";

if (!empty($errors)) {
    echo "\n--- Failures ---\n";
    foreach ($errors as $error) {
        echo "  ✗ {$error}\n";
    }
}

echo "\nTotal: " . ($passed + $failed) . " tests\n";
exit($failed > 0 ? 1 : 0);
