<?php

declare(strict_types=1);

/**
 * Site Control Page Rename — Backend Regression Suite
 *
 * Run: php _studio/tests/SiteControlPageRenameTest.php
 *
 * Tests the Phase 2B.5 page-rename mutation through the REAL endpoint
 * handler (via subprocess), verifying:
 *   1. Validation gates (empty title, no-op, not found, missing pageId)
 *   2. Happy path: title + nav label sync on canonical nav
 *   3. Custom nav label preserved when it differs from old title
 *   4. Legacy nav: title updates, nav.php untouched
 *   5. Homepage rename allowed
 *   6. Rollback on forced write failure
 *   7. DB projection: pages.nav_label stays in sync with file truth
 *
 * Uses temp directory with copied fixtures. Never touches live site.
 */

require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\NavLinksParser;

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

echo "=== Site Control Page Rename Test Suite ===\n\n";

// ═══════════════════════════════════════════
//  Fresh-install guard
// ═══════════════════════════════════════════

$liveDbPath = dirname(__DIR__) . '/data/studio.db';
if (!file_exists($liveDbPath)) {
    echo "ABORT: No database found at {$liveDbPath}.\n";
    exit(1);
}

$livePreviewDir = dirname(__DIR__) . '/preview';
if (!is_dir($livePreviewDir)) {
    echo "ABORT: No preview directory found at {$livePreviewDir}.\n";
    exit(1);
}

try {
    $checkDb = new \SQLite3($liveDbPath, SQLITE3_OPEN_READONLY);
    $pageCount = (int) $checkDb->querySingle("SELECT COUNT(*) FROM pages WHERE page_type = 'page'");
    $checkDb->close();
    if ($pageCount < 2) {
        echo "ABORT: Need at least 2 pages. Found: {$pageCount}\n";
        exit(1);
    }
} catch (\Throwable $e) {
    echo "ABORT: Could not verify database: " . $e->getMessage() . "\n";
    exit(1);
}


// ═══════════════════════════════════════════
//  Fixture setup — temp copies
// ═══════════════════════════════════════════

echo "--- Setup: Creating temp fixtures ---\n";

$tempDir     = sys_get_temp_dir() . '/voxelsite_rename_test_' . uniqid();
$tempDbPath  = $tempDir . '/studio.db';
$tempPreview = $tempDir . '/preview';
$tempAssets  = $tempDir . '/assets';

mkdir($tempDir, 0755, true);

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

putenv("VS_TEST_PREVIEW_DIR={$tempPreview}");
putenv("VS_TEST_ASSETS_DIR={$tempAssets}");

$db = Database::getInstance($tempDbPath);
$fileManager = new FileManager($db);
$fileManager->syncPageRegistry();
$db->exec('PRAGMA wal_checkpoint(TRUNCATE)');

echo "  DB initialized with " . (int) $db->queryOne("SELECT COUNT(*) as c FROM pages")['c'] . " pages\n";

// Find test pages
$testPage = $db->queryOne(
    "SELECT id, slug, title, file_path, is_homepage, nav_label FROM pages WHERE is_homepage = 0 AND page_type = 'page' LIMIT 1"
);
if (!$testPage) {
    echo "ABORT: No non-homepage page found.\n";
    cleanupTemp($tempDir);
    exit(1);
}

$testSlug     = (string) $testPage['slug'];
$testFilePath = (string) $testPage['file_path'];
$testPageId   = 'page:' . $testFilePath;
$testTitle    = (string) ($testPage['title'] ?? '');

echo "  Test page: slug={$testSlug}, title=\"{$testTitle}\", file={$testFilePath}\n";

$homePage = $db->queryOne("SELECT id, slug, title, file_path FROM pages WHERE is_homepage = 1 LIMIT 1");
if ($homePage) {
    echo "  Home page: slug=" . $homePage['slug'] . ", title=\"" . $homePage['title'] . "\"\n";
}


// ═══════════════════════════════════════════
//  1. VALIDATION GATES — through real endpoint handler
// ═══════════════════════════════════════════

echo "\n--- 1. Validation gates ---\n";

$snapshotCountBefore = (int) $db->queryOne("SELECT COUNT(*) as c FROM snapshots")['c'];

// Missing pageId
$r = callEndpoint('POST', '/site-control/page-rename', ['newTitle' => 'Foo']);
record($r['httpCode'] === 400, 'Validation: missing pageId → 400', $errors, $passed, $failed);
record(
    ($r['response']['error']['code'] ?? '') === 'missing_field',
    'Validation: missing pageId error code',
    $errors, $passed, $failed
);

// Empty title
$r = callEndpoint('POST', '/site-control/page-rename', ['pageId' => $testPageId, 'newTitle' => '']);
record($r['httpCode'] === 422, 'Validation: empty title → 422', $errors, $passed, $failed);
record(
    ($r['response']['error']['code'] ?? '') === 'empty_title',
    'Validation: empty title error code',
    $errors, $passed, $failed
);

// Whitespace-only title
$r = callEndpoint('POST', '/site-control/page-rename', ['pageId' => $testPageId, 'newTitle' => '   ']);
record($r['httpCode'] === 422, 'Validation: whitespace title → 422', $errors, $passed, $failed);

// Nonexistent page
$r = callEndpoint('POST', '/site-control/page-rename', ['pageId' => 'page:nonexistent-xyz.php', 'newTitle' => 'Foo']);
record($r['httpCode'] === 404, 'Validation: nonexistent page → 404', $errors, $passed, $failed);
record(
    ($r['response']['error']['code'] ?? '') === 'page_not_found',
    'Validation: nonexistent page error code',
    $errors, $passed, $failed
);

// Same title (no-op)
$r = callEndpoint('POST', '/site-control/page-rename', ['pageId' => $testPageId, 'newTitle' => $testTitle]);
record($r['httpCode'] === 422, 'Validation: same title → 422', $errors, $passed, $failed);
record(
    ($r['response']['error']['code'] ?? '') === 'no_change',
    'Validation: same title error code',
    $errors, $passed, $failed
);

// No snapshots wasted on validation errors
// Re-read from temp DB since validation calls run in subprocesses
$tempDbCheck = new \SQLite3($tempDbPath, SQLITE3_OPEN_READONLY);
$snapshotCountAfter = (int) $tempDbCheck->querySingle("SELECT COUNT(*) FROM snapshots");
$tempDbCheck->close();
record(
    $snapshotCountAfter === $snapshotCountBefore,
    'Validation: no snapshots created for rejected requests',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  2. HAPPY PATH — title rename with nav label sync
// ═══════════════════════════════════════════

echo "\n--- 2. Happy path: rename with nav label sync ---\n";

// Check if nav is canonical (determines expected nav behavior)
$navFilePath = $tempPreview . '/_partials/nav.php';
$navIsCanonical = false;
$navContentBefore = '';
if (file_exists($navFilePath)) {
    $navContentBefore = file_get_contents($navFilePath);
    $navIsCanonical = NavLinksParser::parse($navContentBefore) !== null;
}

echo "  Nav status: " . ($navIsCanonical ? 'canonical' : 'non-canonical') . "\n";

$uniqueTitle = 'Test Renamed ' . time();
$r = callEndpoint('POST', '/site-control/page-rename', [
    'pageId'   => $testPageId,
    'newTitle' => $uniqueTitle,
]);

record($r['httpCode'] === 200, 'Happy path: → 200', $errors, $passed, $failed);
record(
    ($r['response']['ok'] ?? false) === true,
    'Happy path: response.ok = true',
    $errors, $passed, $failed
);

if (($r['response']['ok'] ?? false) === true) {
    $data = $r['response']['data'] ?? [];

    // Response taxonomy
    record($data['status'] === 'renamed', 'Happy path: status = renamed', $errors, $passed, $failed);
    record($data['oldTitle'] === $testTitle, 'Happy path: oldTitle correct', $errors, $passed, $failed);
    record($data['newTitle'] === $uniqueTitle, 'Happy path: newTitle correct', $errors, $passed, $failed);
    record($data['pageSlug'] === $testSlug, 'Happy path: pageSlug unchanged', $errors, $passed, $failed);
    record(isset($data['snapshotId']), 'Happy path: snapshotId present', $errors, $passed, $failed);
    record(isset($data['navStatus']), 'Happy path: navStatus present', $errors, $passed, $failed);
    record(array_key_exists('navLabelUpdated', $data), 'Happy path: navLabelUpdated present', $errors, $passed, $failed);

    // File truth: page file updated
    $pageFileContent = file_get_contents($tempPreview . '/' . $testFilePath);
    record(
        str_contains($pageFileContent, $uniqueTitle),
        'Happy path: page file contains new title',
        $errors, $passed, $failed
    );

    // DB truth: title updated
    $tempDbCheck2 = new \SQLite3($tempDbPath, SQLITE3_OPEN_READONLY);
    $dbTitle = $tempDbCheck2->querySingle("SELECT title FROM pages WHERE slug = '{$testSlug}'");
    $tempDbCheck2->close();
    record(
        $dbTitle === $uniqueTitle,
        'Happy path: DB pages.title updated',
        $errors, $passed, $failed
    );

    // Nav truth: check based on canonical status
    if ($navIsCanonical) {
        record($data['navStatus'] === 'canonical', 'Happy path: navStatus = canonical', $errors, $passed, $failed);

        // If nav label was in sync, it should have been updated
        $navContentAfter = file_get_contents($navFilePath);
        $navLinksAfter = NavLinksParser::parse($navContentAfter);

        if ($navLinksAfter !== null) {
            $pageHref = '/' . $testSlug;
            $foundLabel = null;
            foreach ($navLinksAfter as $entry) {
                if ($entry['href'] === $pageHref) {
                    $foundLabel = $entry['label'];
                    break;
                }
                if (isset($entry['children'])) {
                    foreach ($entry['children'] as $child) {
                        if ($child['href'] === $pageHref) {
                            $foundLabel = $child['label'];
                            break 2;
                        }
                    }
                }
            }

            if ($data['navLabelUpdated']) {
                record(
                    $foundLabel === $uniqueTitle,
                    'Happy path: canonical nav label updated to new title',
                    $errors, $passed, $failed
                );

                // DB projection: pages.nav_label should match
                $tempDbCheck3 = new \SQLite3($tempDbPath, SQLITE3_OPEN_READONLY);
                $dbNavLabel = $tempDbCheck3->querySingle("SELECT nav_label FROM pages WHERE slug = '{$testSlug}'");
                $tempDbCheck3->close();
                record(
                    $dbNavLabel === $uniqueTitle,
                    'Happy path: DB pages.nav_label matches new title',
                    $errors, $passed, $failed
                );
            } else {
                // Custom label was preserved
                record(
                    $foundLabel !== null && $foundLabel !== $uniqueTitle,
                    'Happy path: custom nav label preserved (not overwritten)',
                    $errors, $passed, $failed
                );
            }
        }
    } else {
        // Non-canonical nav: should report not updated
        record(
            $data['navLabelUpdated'] === false,
            'Happy path: non-canonical nav → navLabelUpdated = false',
            $errors, $passed, $failed
        );
    }
}


// ═══════════════════════════════════════════
//  3. HOMEPAGE — rename allowed
// ═══════════════════════════════════════════

echo "\n--- 3. Homepage rename ---\n";

if ($homePage) {
    $homePageId = 'page:' . $homePage['file_path'];
    $homeNewTitle = 'Home Renamed ' . time();

    $r = callEndpoint('POST', '/site-control/page-rename', [
        'pageId'   => $homePageId,
        'newTitle' => $homeNewTitle,
    ]);

    record($r['httpCode'] === 200, 'Homepage: rename → 200', $errors, $passed, $failed);
    record(
        ($r['response']['ok'] ?? false) === true,
        'Homepage: response.ok = true',
        $errors, $passed, $failed
    );

    if (($r['response']['ok'] ?? false) === true) {
        $data = $r['response']['data'] ?? [];
        record($data['newTitle'] === $homeNewTitle, 'Homepage: newTitle correct', $errors, $passed, $failed);
        record($data['pageSlug'] === ($homePage['slug'] ?? 'index'), 'Homepage: slug unchanged', $errors, $passed, $failed);

        // File truth
        $homeFileContent = file_get_contents($tempPreview . '/' . $homePage['file_path']);
        record(
            str_contains($homeFileContent, $homeNewTitle),
            'Homepage: page file contains new title',
            $errors, $passed, $failed
        );
    }
} else {
    echo "  SKIP: No homepage found in test data.\n";
}


// ═══════════════════════════════════════════
//  4. LEGACY NAV — title updates, nav untouched
// ═══════════════════════════════════════════

echo "\n--- 4. Legacy nav: title-only ---\n";

// Temporarily replace nav.php with a legacy format (no $navLinks block)
$legacyNavContent = '<nav><ul class="site-nav__menu">' .
    '<li><a href="/">Home</a></li>' .
    '<li><a href="/' . $testSlug . '">' . $uniqueTitle . '</a></li>' .
    '</ul></nav>';
file_put_contents($navFilePath, $legacyNavContent);

$legacyTitle = 'Legacy Test ' . time();
$r = callEndpoint('POST', '/site-control/page-rename', [
    'pageId'   => $testPageId,
    'newTitle' => $legacyTitle,
]);

record($r['httpCode'] === 200, 'Legacy nav: rename → 200', $errors, $passed, $failed);

if (($r['response']['ok'] ?? false) === true) {
    $data = $r['response']['data'] ?? [];
    record($data['navStatus'] === 'legacy', 'Legacy nav: navStatus = legacy', $errors, $passed, $failed);
    record($data['navLabelUpdated'] === false, 'Legacy nav: navLabelUpdated = false', $errors, $passed, $failed);

    // Nav file should be UNCHANGED (not rewritten)
    $navContentAfterLegacy = file_get_contents($navFilePath);
    record(
        $navContentAfterLegacy === $legacyNavContent,
        'Legacy nav: nav.php content unchanged',
        $errors, $passed, $failed
    );

    // But page file title should be updated
    $pageFileAfterLegacy = file_get_contents($tempPreview . '/' . $testFilePath);
    record(
        str_contains($pageFileAfterLegacy, $legacyTitle),
        'Legacy nav: page file title updated',
        $errors, $passed, $failed
    );
}

// Restore canonical nav for subsequent tests
file_put_contents($navFilePath, $navContentBefore);


// ═══════════════════════════════════════════
//  5. ROLLBACK — forced write failure
// ═══════════════════════════════════════════

echo "\n--- 5. Rollback on forced write failure ---\n";

// Read pre-rollback state
$preRollbackTitle = $legacyTitle; // title from last successful rename
$preRollbackContent = file_get_contents($tempPreview . '/' . $testFilePath);

$rollbackTitle = 'Rollback Test ' . time();
$r = callEndpoint('POST', '/site-control/page-rename', [
    'pageId'   => $testPageId,
    'newTitle' => $rollbackTitle,
], '--fail-rename');

record($r['httpCode'] === 500, 'Rollback: forced failure → 500', $errors, $passed, $failed);
record(
    ($r['response']['ok'] ?? false) === false,
    'Rollback: response.ok = false',
    $errors, $passed, $failed
);

// File should be restored to pre-mutation state
$postRollbackContent = file_get_contents($tempPreview . '/' . $testFilePath);
record(
    $postRollbackContent === $preRollbackContent,
    'Rollback: page file restored to pre-mutation content',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  6. MISSING NAV — title updates, no nav crash
// ═══════════════════════════════════════════

echo "\n--- 6. Missing nav.php ---\n";

// Temporarily remove nav.php
$navBackup = file_get_contents($navFilePath);
unlink($navFilePath);

$missingNavTitle = 'Missing Nav ' . time();
$r = callEndpoint('POST', '/site-control/page-rename', [
    'pageId'   => $testPageId,
    'newTitle' => $missingNavTitle,
]);

record($r['httpCode'] === 200, 'Missing nav: rename → 200', $errors, $passed, $failed);

if (($r['response']['ok'] ?? false) === true) {
    $data = $r['response']['data'] ?? [];
    record($data['navStatus'] === 'missing', 'Missing nav: navStatus = missing', $errors, $passed, $failed);
    record($data['navLabelUpdated'] === false, 'Missing nav: navLabelUpdated = false', $errors, $passed, $failed);
}

// Restore nav.php
file_put_contents($navFilePath, $navBackup);


// ═══════════════════════════════════════════
//  Summary
// ═══════════════════════════════════════════

echo "\n--- Summary ---\n";
echo "Passed: {$passed}\n";
echo "Failed: {$failed}\n";

if (!empty($errors)) {
    echo "\nFailing tests:\n";
    foreach ($errors as $e) {
        echo "  ✗ {$e}\n";
    }
}

cleanupTemp($tempDir);
echo "\nDone.\n";
exit($failed > 0 ? 1 : 0);


// ═══════════════════════════════════════════
//  Endpoint Call Helper
// ═══════════════════════════════════════════

/**
 * Call a site-control endpoint via subprocess (real handler path).
 */
function callEndpoint(string $method, string $routePath, array $body, ?string $failMode = null): array
{
    global $tempDbPath, $tempPreview, $tempAssets;

    $helperPath = __DIR__ . '/helpers/call-nav-endpoint.php';
    $jsonBody = json_encode($body, JSON_UNESCAPED_SLASHES);

    $descriptorSpec = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $cmd = sprintf(
        'php %s %s %s %s %s %s%s',
        escapeshellarg($helperPath),
        escapeshellarg($tempDbPath),
        escapeshellarg($tempPreview),
        escapeshellarg($tempAssets),
        escapeshellarg($method),
        escapeshellarg($routePath),
        $failMode ? ' ' . escapeshellarg($failMode) : ''
    );

    $process = proc_open($cmd, $descriptorSpec, $pipes);
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
