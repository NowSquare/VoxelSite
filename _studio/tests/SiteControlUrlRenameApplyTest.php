<?php

declare(strict_types=1);

/**
 * Site Control URL Rename Apply — Backend Regression Suite
 *
 * Run: php _studio/tests/SiteControlUrlRenameApplyTest.php
 *
 * Tests the Phase 2A backend mutation path through the actual endpoint
 * wrapper (via subprocess), not just PageService directly.
 *
 * Test categories:
 *   1. Validation gate — bad input returns error, no snapshot created
 *   2. Endpoint success — real rename through the full endpoint path
 *   3. Forced write failure — auto-rollback via --fail-write mode
 *   4. Path contract — slash-delimited paths rejected (Phase 2A)
 *   5. PageService return shape — new metadata keys present
 *
 * Uses temp directory with copied fixtures. Never touches live site.
 */

require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\PageService;

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

echo "=== Site Control URL Rename Apply Test Suite ===\n\n";

// ═══════════════════════════════════════════
//  Fresh-install guard
// ═══════════════════════════════════════════

$liveDbPath = dirname(__DIR__) . '/data/studio.db';
if (!file_exists($liveDbPath)) {
    echo "ABORT: No database found at {$liveDbPath}.\n";
    echo "This test requires a VoxelSite installation with at least one page.\n";
    exit(1);
}

$livePreviewDir = dirname(__DIR__) . '/preview';
if (!is_dir($livePreviewDir)) {
    echo "ABORT: No preview directory found at {$livePreviewDir}.\n";
    exit(1);
}

try {
    $checkDb = new \SQLite3($liveDbPath, SQLITE3_OPEN_READONLY);
    $result = $checkDb->querySingle("SELECT name FROM sqlite_master WHERE type='table' AND name='pages'");
    if (!$result) {
        echo "ABORT: Database exists but 'pages' table is missing.\n";
        $checkDb->close();
        exit(1);
    }
    $pageCount = $checkDb->querySingle("SELECT COUNT(*) FROM pages");
    if ((int) $pageCount < 2) {
        echo "ABORT: Need at least 2 pages to test rename. Found: {$pageCount}\n";
        $checkDb->close();
        exit(1);
    }
    $checkDb->close();
} catch (\Throwable $e) {
    echo "ABORT: Could not verify database schema: " . $e->getMessage() . "\n";
    exit(1);
}

// ═══════════════════════════════════════════
//  Fixture setup — temp copies
// ═══════════════════════════════════════════

echo "--- Setup: Creating temp fixtures ---\n";

$tempDir     = sys_get_temp_dir() . '/voxelsite_sc_test_' . uniqid();
$tempDbPath  = $tempDir . '/studio.db';
$tempPreview = $tempDir . '/preview';
$tempAssets  = $tempDir . '/assets';
$tempSnaps   = $tempDir . '/snapshots';

mkdir($tempDir, 0755, true);
mkdir($tempSnaps, 0755, true);

copy($liveDbPath, $tempDbPath);
copyDirRecursive($livePreviewDir, $tempPreview);

$liveAssetsDir = dirname(__DIR__, 2) . '/assets';
if (is_dir($liveAssetsDir)) {
    copyDirRecursive($liveAssetsDir, $tempAssets);
} else {
    mkdir($tempAssets . '/css', 0755, true);
    mkdir($tempAssets . '/js', 0755, true);
}

echo "  Temp dir: {$tempDir}\n";

// ── Initialize DB + services for unit-level tests ──
// Set env vars so FileManager uses temp paths (same seam as the endpoint subprocess)
putenv("VS_TEST_PREVIEW_DIR={$tempPreview}");
putenv("VS_TEST_ASSETS_DIR={$tempAssets}");

$db = Database::getInstance($tempDbPath);
$fileManager = new FileManager($db);

$fileManager->syncPageRegistry();
// Force WAL checkpoint so subprocess sees the writes
$db->exec('PRAGMA wal_checkpoint(TRUNCATE)');

$pageService = new PageService($db, $fileManager);

// Find test pages
$testPage = $db->queryOne(
    "SELECT slug, file_path, is_homepage FROM pages WHERE is_homepage = 0 AND page_type = 'page' LIMIT 1"
);
if (!$testPage) {
    echo "ABORT: No non-homepage page found.\n";
    cleanupTemp($tempDir);
    exit(1);
}

$testSlug     = (string) $testPage['slug'];
$testFilePath = (string) $testPage['file_path'];
$testRouteId  = 'route:/' . $testSlug;

$conflictPage = $db->queryOne(
    "SELECT slug FROM pages WHERE slug != ? AND is_homepage = 0 AND page_type = 'page' LIMIT 1",
    [$testSlug]
);
$conflictSlug = $conflictPage ? (string) $conflictPage['slug'] : null;

echo "  Test page: slug={$testSlug}, file={$testFilePath}\n";

$snapshotCountBefore = (int) $db->queryOne("SELECT COUNT(*) as c FROM snapshots")['c'];


// ═══════════════════════════════════════════
//  1. PATH CONTRACT — slash-delimited paths forbidden (P1 fix)
// ═══════════════════════════════════════════

echo "\n--- Path contract: single-segment enforcement ---\n";

// Nested path via endpoint → must reject with 422
$nestedResult = callEndpoint(['routeId' => $testRouteId, 'newPath' => '/services/web-design']);
record(
    $nestedResult['httpCode'] === 422,
    'nested path returns 422 (got ' . $nestedResult['httpCode'] . ')',
    $errors, $passed, $failed
);
record(
    ($nestedResult['response']['error']['code'] ?? '') === 'nested_path',
    'nested path error code is "nested_path"',
    $errors, $passed, $failed
);

// Double-nested path
$deepResult = callEndpoint(['routeId' => $testRouteId, 'newPath' => '/a/b/c']);
record(
    $deepResult['httpCode'] === 422,
    'deep nested path returns 422 (got ' . $deepResult['httpCode'] . ')',
    $errors, $passed, $failed
);

// Single-segment with .php suffix → should strip extension and hit same_path
// Using the test slug + .php should normalize to the same slug → 422 same_path
$phpResult = callEndpoint(['routeId' => $testRouteId, 'newPath' => '/' . $testSlug . '.php']);
record(
    ($phpResult['response']['error']['code'] ?? '') !== 'nested_path',
    '.php suffix does not trip nested_path rejection',
    $errors, $passed, $failed
);
record(
    ($phpResult['response']['error']['code'] ?? '') === 'same_path',
    '.php suffix normalizes to same slug → same_path',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  2. VALIDATION GATE — errors before snapshot
// ═══════════════════════════════════════════

echo "\n--- Validation gate: through endpoint wrapper ---\n";

// Missing fields
$missingResult = callEndpoint(['routeId' => '', 'newPath' => '']);
record($missingResult['httpCode'] === 400, 'missing fields → 400', $errors, $passed, $failed);

// Nonexistent route
$bogusResult = callEndpoint(['routeId' => 'route:/nonexistent-xyz-999', 'newPath' => '/anything']);
record($bogusResult['httpCode'] === 404, 'nonexistent route → 404', $errors, $passed, $failed);

// Homepage rename blocked
$homePage = $db->queryOne("SELECT slug FROM pages WHERE is_homepage = 1 LIMIT 1");
if ($homePage) {
    $homeSlug = (string) $homePage['slug'];
    $homeRouteId = $homeSlug === 'index' ? 'route:/' : 'route:/' . $homeSlug;
    $homeResult = callEndpoint(['routeId' => $homeRouteId, 'newPath' => '/new-home']);
    record($homeResult['httpCode'] === 422, 'homepage rename → 422', $errors, $passed, $failed);
    record(
        ($homeResult['response']['error']['code'] ?? '') === 'homepage_blocked',
        'homepage error code is homepage_blocked',
        $errors, $passed, $failed
    );
}

// Same path
$sameResult = callEndpoint(['routeId' => $testRouteId, 'newPath' => '/' . $testSlug]);
record($sameResult['httpCode'] === 422, 'same path → 422', $errors, $passed, $failed);
record(
    ($sameResult['response']['error']['code'] ?? '') === 'same_path',
    'same_path error code',
    $errors, $passed, $failed
);

// Conflict — only testable with single-segment (non-nested) slugs
if ($conflictSlug !== null && !str_contains($conflictSlug, '/')) {
    $conflictResult = callEndpoint(['routeId' => $testRouteId, 'newPath' => '/' . $conflictSlug]);
    record($conflictResult['httpCode'] === 409, 'conflict slug → 409', $errors, $passed, $failed);
    record(
        ($conflictResult['response']['error']['code'] ?? '') === 'conflict',
        'conflict error code',
        $errors, $passed, $failed
    );
} elseif ($conflictSlug !== null) {
    echo "  SKIP: conflict slug '{$conflictSlug}' is nested — would hit nested_path before conflict\n";
} else {
    echo "  SKIP: no second non-homepage page for conflict test\n";
}

// Invalid characters only
$invalidResult = callEndpoint(['routeId' => $testRouteId, 'newPath' => '/!!!']);
record($invalidResult['httpCode'] === 400, 'invalid chars → 400', $errors, $passed, $failed);

// Bad routeId format
$badFormatResult = callEndpoint(['routeId' => 'not-a-route:foo', 'newPath' => '/anything']);
record($badFormatResult['httpCode'] === 404, 'bad routeId format → 404', $errors, $passed, $failed);

// No snapshots created during validation
$snapshotCountAfterValidation = (int) $db->queryOne("SELECT COUNT(*) as c FROM snapshots")['c'];
record(
    $snapshotCountAfterValidation === $snapshotCountBefore,
    'no snapshots created during validation (' . $snapshotCountAfterValidation . ' == ' . $snapshotCountBefore . ')',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  3. ENDPOINT SUCCESS — full rename through wrapper
// ═══════════════════════════════════════════

echo "\n--- Endpoint success: rename through wrapper ---\n";

$newSlug = 'sc-test-' . substr(md5(uniqid()), 0, 6);

$successResult = callEndpoint(['routeId' => $testRouteId, 'newPath' => '/' . $newSlug]);

record($successResult['httpCode'] === 200, 'rename success → 200 (got ' . $successResult['httpCode'] . ')', $errors, $passed, $failed);
record(
    ($successResult['response']['ok'] ?? false) === true,
    'response.ok is true',
    $errors, $passed, $failed
);

if (($successResult['response']['ok'] ?? false) === true) {
    $data = $successResult['response']['data'] ?? [];

    // Response taxonomy
    record(isset($data['oldPath']), 'response has oldPath', $errors, $passed, $failed);
    record(isset($data['newPath']), 'response has newPath', $errors, $passed, $failed);
    record(isset($data['oldPageId']), 'response has oldPageId', $errors, $passed, $failed);
    record(isset($data['newPageId']), 'response has newPageId', $errors, $passed, $failed);
    record(isset($data['pageSlug']), 'response has pageSlug', $errors, $passed, $failed);
    record(isset($data['updatedFiles']), 'response has updatedFiles', $errors, $passed, $failed);
    record(isset($data['snapshotId']), 'response has snapshotId', $errors, $passed, $failed);
    record(isset($data['referenceCount']), 'response has referenceCount', $errors, $passed, $failed);
    record(array_key_exists('suggestedPrompt', $data), 'response has suggestedPrompt', $errors, $passed, $failed);
    record(isset($data['message']), 'response has message', $errors, $passed, $failed);

    // Values correct
    record($data['oldPath'] === '/' . $testSlug, 'oldPath is correct', $errors, $passed, $failed);
    record($data['newPath'] === '/' . $newSlug, 'newPath is correct', $errors, $passed, $failed);
    record($data['pageSlug'] === $newSlug, 'pageSlug is correct', $errors, $passed, $failed);
    record(
        $data['oldPageId'] !== $data['newPageId'],
        'oldPageId differs from newPageId',
        $errors, $passed, $failed
    );

    // Snapshot was created
    record(
        $data['snapshotId'] !== null,
        'snapshotId is non-null (snapshot was created)',
        $errors, $passed, $failed
    );

    // Verify on-disk state (need to reload DB singleton)
    $verifyDb = new \SQLite3($tempDbPath, SQLITE3_OPEN_READONLY);
    $newRow = $verifyDb->querySingle("SELECT slug FROM pages WHERE slug = '{$newSlug}'");
    record($newRow === $newSlug, 'DB has new slug after rename', $errors, $passed, $failed);

    $oldRow = $verifyDb->querySingle("SELECT slug FROM pages WHERE slug = '{$testSlug}'");
    record($oldRow === null || $oldRow === false, 'DB no longer has old slug', $errors, $passed, $failed);
    $verifyDb->close();

    // Verify file on disk
    $expectedNewFile = $newSlug . '.php';
    record(
        file_exists($tempPreview . '/' . $expectedNewFile),
        'new file exists on disk: ' . $expectedNewFile,
        $errors, $passed, $failed
    );
    record(
        !file_exists($tempPreview . '/' . $testFilePath),
        'old file removed from disk: ' . $testFilePath,
        $errors, $passed, $failed
    );

    // Rename back for subsequent tests (via direct PageService, temp DB already loaded)
    $db = Database::getInstance($tempDbPath);
    $fileManager->syncPageRegistry();
    try {
        $pageService->updatePage($newSlug, ['slug' => $testSlug], 'site-control');
        echo "  Renamed back to original for subsequent tests.\n";
    } catch (\Throwable $e) {
        echo "  WARNING: Could not rename back: " . $e->getMessage() . "\n";
    }
}


// ═══════════════════════════════════════════
//  4. FORCED WRITE FAILURE — auto-rollback through endpoint
// ═══════════════════════════════════════════

echo "\n--- Forced write failure: auto-rollback ---\n";

// Verify the test page file still exists before the forced-failure test
record(
    file_exists($tempPreview . '/' . $testFilePath),
    'test page file exists before forced-failure test',
    $errors, $passed, $failed
);

$failSlug = 'fail-test-' . substr(md5(uniqid()), 0, 6);

// Call endpoint with --fail-write: sabotages the page file after snapshot,
// causing PageService::updatePage() to throw "source file is missing."
// The REAL endpoint catch block triggers auto-rollback via restoreSiteControlSnapshot.
$failResult = callEndpoint(
    ['routeId' => $testRouteId, 'newPath' => '/' . $failSlug],
    '--fail-write'
);

record(
    $failResult['httpCode'] !== 200,
    'forced failure does not return 200 (got ' . $failResult['httpCode'] . ')',
    $errors, $passed, $failed
);

record(
    ($failResult['response']['ok'] ?? true) === false,
    'forced failure response.ok is false',
    $errors, $passed, $failed
);

// The real endpoint maps code 404 exceptions to error.code = 'not_found'
$failError = $failResult['response']['error'] ?? [];
record(
    ($failError['code'] ?? '') === 'not_found',
    'forced failure error code is not_found (got ' . ($failError['code'] ?? 'none') . ')',
    $errors, $passed, $failed
);

record(
    str_contains($failError['message'] ?? '', 'missing'),
    'forced failure message mentions "missing"',
    $errors, $passed, $failed
);

// Verify that auto-rollback restored the original file on disk
// (restoreSiteControlSnapshot extracts the snapshot zip back to the preview dir)
record(
    file_exists($tempPreview . '/' . $testFilePath),
    'auto-rollback restored original file on disk',
    $errors, $passed, $failed
);

// Verify the restore also brought the DB back (syncPageRegistry runs inside restore)
$postFailDb = new \SQLite3($tempDbPath, SQLITE3_OPEN_READONLY);
$postFailRow = $postFailDb->querySingle("SELECT slug FROM pages WHERE slug = '{$testSlug}'");
$postFailDb->close();
record(
    $postFailRow === $testSlug,
    'auto-rollback restored page record in DB',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  5. PAGESERVICE RETURN SHAPE — new metadata keys
// ═══════════════════════════════════════════

echo "\n--- PageService: return shape verification ---\n";

// Reload DB state after rollback tests
$db = Database::getInstance($tempDbPath);
$fileManager->syncPageRegistry();

$shapePage = $db->queryOne(
    "SELECT slug FROM pages WHERE is_homepage = 0 AND page_type = 'page' LIMIT 1"
);

if ($shapePage) {
    $shapeSlug = (string) $shapePage['slug'];
    $shapeNewSlug = 'shape-' . substr(md5(uniqid()), 0, 6);

    try {
        $shapeResult = $pageService->updatePage($shapeSlug, ['slug' => $shapeNewSlug], 'site-control');

        $expectedKeys = ['page', 'renamed', 'updated_files', 'reference_updated_files', 'old_file_path', 'new_file_path', 'suggested_prompt'];
        foreach ($expectedKeys as $key) {
            record(
                array_key_exists($key, $shapeResult),
                "return shape: key '{$key}' exists",
                $errors, $passed, $failed
            );
        }

        record(is_bool($shapeResult['renamed']), 'return shape: renamed is bool', $errors, $passed, $failed);
        record(is_array($shapeResult['updated_files']), 'return shape: updated_files is array', $errors, $passed, $failed);
        record(is_array($shapeResult['reference_updated_files']), 'return shape: reference_updated_files is array', $errors, $passed, $failed);
        record(is_string($shapeResult['old_file_path']), 'return shape: old_file_path is string', $errors, $passed, $failed);
        record(is_string($shapeResult['new_file_path']), 'return shape: new_file_path is string', $errors, $passed, $failed);

        $pageService->updatePage($shapeNewSlug, ['slug' => $shapeSlug], 'site-control');
    } catch (\Throwable $e) {
        record(false, 'shape test threw: ' . $e->getMessage(), $errors, $passed, $failed);
    }
}


// ═══════════════════════════════════════════
//  Cleanup
// ═══════════════════════════════════════════

// Clean up env vars
putenv('VS_TEST_PREVIEW_DIR');
putenv('VS_TEST_ASSETS_DIR');

cleanupTemp($tempDir);
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


// ═══════════════════════════════════════════
//  Endpoint Call Helper
// ═══════════════════════════════════════════

/**
 * Call the site-control endpoint via subprocess (real endpoint path).
 *
 * Spawns the helper script with the temp DB/preview/assets paths and
 * passes the request body via stdin. Returns the parsed response.
 *
 * @param array $body   Request body (routeId, newPath)
 * @param string|null $failMode  Optional fail mode flag (e.g. '--fail-write')
 * @return array{httpCode: int, response: array}
 */
function callEndpoint(array $body, ?string $failMode = null): array
{
    global $tempDbPath, $tempPreview, $tempAssets;

    $helperPath = __DIR__ . '/helpers/call-site-control-endpoint.php';
    $jsonBody = json_encode($body, JSON_UNESCAPED_SLASHES);

    $cmd = sprintf(
        'echo %s | php %s %s %s %s%s 2>&1',
        escapeshellarg($jsonBody),
        escapeshellarg($helperPath),
        escapeshellarg($tempDbPath),
        escapeshellarg($tempPreview),
        escapeshellarg($tempAssets),
        $failMode ? ' ' . escapeshellarg($failMode) : ''
    );

    // Use proc_open to capture stderr separately
    $descriptorSpec = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $cmd2 = sprintf(
        'php %s %s %s %s%s',
        escapeshellarg($helperPath),
        escapeshellarg($tempDbPath),
        escapeshellarg($tempPreview),
        escapeshellarg($tempAssets),
        $failMode ? ' ' . escapeshellarg($failMode) : ''
    );

    $process = proc_open($cmd2, $descriptorSpec, $pipes);
    if (!is_resource($process)) {
        return ['httpCode' => 0, 'response' => ['ok' => false, 'error' => ['code' => 'proc_failed']]];
    }

    fwrite($pipes[0], $jsonBody);
    fclose($pipes[0]);

    $stdout = stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[2]);
    proc_close($process);

    if (trim($stderr) !== '') {
        // Only show stderr for non-debug messages
        $lines = explode("\n", trim($stderr));
        foreach ($lines as $line) {
            if (!str_starts_with(trim($line), 'DEBUG')) {
                echo "  HELPER STDERR: {$line}\n";
            }
        }
    }

    $parsed = json_decode($stdout, true);
    if (!is_array($parsed)) {
        echo "  DEBUG callEndpoint output: " . substr($stdout, 0, 300) . "\n";
        echo "  DEBUG callEndpoint cmd: " . $cmd . "\n";
        return ['httpCode' => 0, 'response' => ['ok' => false, 'error' => [
            'code' => 'parse_failed',
            'message' => 'Could not parse: ' . substr($stdout, 0, 200),
        ]]];
    }

    return $parsed;
}


// ═══════════════════════════════════════════
//  Filesystem Helpers
// ═══════════════════════════════════════════

function copyDirRecursive(string $src, string $dst): void
{
    if (!is_dir($src)) return;
    if (!is_dir($dst)) mkdir($dst, 0755, true);

    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($src, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($it as $item) {
        $rel = ltrim(str_replace($src, '', $item->getPathname()), DIRECTORY_SEPARATOR);
        $target = $dst . '/' . $rel;

        if ($item->isDir()) {
            if (!is_dir($target)) mkdir($target, 0755, true);
        } else {
            $parent = dirname($target);
            if (!is_dir($parent)) mkdir($parent, 0755, true);
            copy($item->getRealPath(), $target);
        }
    }
}

function cleanupTemp(string $dir): void
{
    if (!is_dir($dir)) return;
    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($it as $item) {
        if ($item->isDir()) {
            @rmdir($item->getRealPath());
        } else {
            @unlink($item->getRealPath());
        }
    }
    @rmdir($dir);
}
