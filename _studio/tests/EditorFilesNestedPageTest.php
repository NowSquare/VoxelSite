<?php

declare(strict_types=1);

/**
 * File Editor Nested-Page Contract — Regression Suite
 *
 * Run: php _studio/tests/EditorFilesNestedPageTest.php
 *
 * Tests that the /files API correctly supports nested directory structures:
 *   1. normalizeEditablePath accepts nested PHP page paths
 *   2. listEditableFiles recursively discovers nested pages
 *   3. Read/write on nested page paths works end-to-end
 *   4. Create/delete on nested page paths triggers syncPageRegistry
 *   5. isPreviewPagePhp correctly categorises paths
 *   6. Security: rejects path traversal on nested paths
 *
 * Uses temp directory with copied fixtures. Never touches live site.
 */

require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Database;
use VoxelSite\FileManager;

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

echo "=== Editor Files Nested-Page Contract Test Suite ===\n\n";

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

// ═══════════════════════════════════════════
//  Fixture setup — temp copies
// ═══════════════════════════════════════════

echo "--- Setup: Creating temp fixtures ---\n";

$tempDir     = sys_get_temp_dir() . '/voxelsite_files_test_' . uniqid();
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

echo "  DB initialized with " . (int) $db->queryOne("SELECT COUNT(*) as c FROM pages")['c'] . " pages\n";

// Create a nested test page for the test suite
$nestedDir = $tempPreview . '/testdir';
mkdir($nestedDir, 0755, true);
$nestedPageContent = <<<'PHP'
<?php
$siteName = 'Test';
$page = [
    'title'       => 'Nested Test Page',
    'description' => 'A test page inside a subdirectory.',
    'slug'        => 'testdir/nested-test',
];
include '_partials/header.php';
?>
<section><h1>Nested Test</h1></section>
<?php include '_partials/footer.php'; ?>
PHP;
file_put_contents($nestedDir . '/nested-test.php', $nestedPageContent);

// Create a deeply nested page (testdir/deep/inner.php)
$deepDir = $tempPreview . '/testdir/deep';
mkdir($deepDir, 0755, true);
$deepPageContent = <<<'PHP'
<?php
$siteName = 'Test';
$page = [
    'title'       => 'Deep Inner Page',
    'description' => 'A deeply nested page.',
    'slug'        => 'testdir/deep/inner',
];
include '_partials/header.php';
?>
<section><h1>Deep Inner</h1></section>
<?php include '_partials/footer.php'; ?>
PHP;
file_put_contents($deepDir . '/inner.php', $deepPageContent);

echo "  Created nested test pages: testdir/nested-test.php, testdir/deep/inner.php\n";


// ═══════════════════════════════════════════
//  1. LIST — recursive discovery finds nested pages
// ═══════════════════════════════════════════

echo "\n--- 1. Recursive page discovery ---\n";

$r = callFilesEndpoint('GET', '/files', []);
record($r['httpCode'] === 200, 'List: → 200', $errors, $passed, $failed);
record(
    ($r['response']['ok'] ?? false) === true,
    'List: response.ok = true',
    $errors, $passed, $failed
);

$files = $r['response']['data']['files'] ?? [];
$filePaths = array_column($files, 'path');

// Root-level pages should still be listed
$hasRootPage = false;
foreach ($filePaths as $fp) {
    if (preg_match('#^[^/]+\.php$#', $fp) && !str_starts_with($fp, '_')) {
        $hasRootPage = true;
        break;
    }
}
record($hasRootPage, 'List: root-level PHP pages found', $errors, $passed, $failed);

// Nested page should appear
record(
    in_array('testdir/nested-test.php', $filePaths),
    'List: testdir/nested-test.php discovered',
    $errors, $passed, $failed
);

// Deeply nested page should appear
record(
    in_array('testdir/deep/inner.php', $filePaths),
    'List: testdir/deep/inner.php discovered',
    $errors, $passed, $failed
);

// Partials should NOT appear in nested page discovery (they have their own section)
$hasPartialInPages = false;
foreach ($files as $f) {
    if ($f['group'] === 'page' && str_starts_with($f['path'], '_partials/')) {
        $hasPartialInPages = true;
        break;
    }
}
record(!$hasPartialInPages, 'List: _partials/ pages not in page type', $errors, $passed, $failed);

// Partials should still be listed (separately)
$hasPartials = false;
foreach ($files as $f) {
    if ($f['group'] === 'partial') {
        $hasPartials = true;
        break;
    }
}
record($hasPartials, 'List: partials still listed separately', $errors, $passed, $failed);

// Nested pages should have type = 'page'
$nestedFile = null;
foreach ($files as $f) {
    if ($f['path'] === 'testdir/nested-test.php') {
        $nestedFile = $f;
        break;
    }
}
record(
    $nestedFile !== null && $nestedFile['group'] === 'page',
    'List: nested page has group = page',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  2. READ — nested page content accessible
// ═══════════════════════════════════════════

echo "\n--- 2. Read nested page content ---\n";

$r = callFilesEndpoint('GET', '/files/content', ['path' => 'testdir/nested-test.php']);
record($r['httpCode'] === 200, 'Read nested: → 200', $errors, $passed, $failed);
record(
    ($r['response']['ok'] ?? false) === true,
    'Read nested: response.ok = true',
    $errors, $passed, $failed
);

$content = $r['response']['data']['content'] ?? '';
record(
    str_contains($content, 'Nested Test Page'),
    'Read nested: content contains expected title',
    $errors, $passed, $failed
);

// Read deeply nested
$r = callFilesEndpoint('GET', '/files/content', ['path' => 'testdir/deep/inner.php']);
record($r['httpCode'] === 200, 'Read deep nested: → 200', $errors, $passed, $failed);
record(
    str_contains($r['response']['data']['content'] ?? '', 'Deep Inner Page'),
    'Read deep nested: content contains expected title',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  3. WRITE — save nested page preserves content
// ═══════════════════════════════════════════

echo "\n--- 3. Write nested page content ---\n";

$updatedContent = str_replace('Nested Test Page', 'Nested Test Page Updated', $nestedPageContent);
$r = callFilesEndpoint('PUT', '/files/content', [
    'path'    => 'testdir/nested-test.php',
    'content' => $updatedContent,
]);
record($r['httpCode'] === 200, 'Write nested: → 200', $errors, $passed, $failed);
record(
    ($r['response']['ok'] ?? false) === true,
    'Write nested: response.ok = true',
    $errors, $passed, $failed
);

// Verify file on disk
$writtenContent = file_get_contents($tempPreview . '/testdir/nested-test.php');
record(
    str_contains($writtenContent, 'Nested Test Page Updated'),
    'Write nested: file on disk updated',
    $errors, $passed, $failed
);

// Verify page registry was synced (the page should exist in DB after save)
$tempDbCheck = new \SQLite3($tempDbPath, SQLITE3_OPEN_READONLY);
$dbSlug = $tempDbCheck->querySingle("SELECT slug FROM pages WHERE file_path = 'testdir/nested-test.php'");
$tempDbCheck->close();
record(
    $dbSlug !== false && $dbSlug !== null,
    'Write nested: page registry synced (DB row exists)',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  4. CREATE — new file in nested directory
// ═══════════════════════════════════════════

echo "\n--- 4. Create nested page ---\n";

$createContent = <<<'PHP'
<?php
$siteName = 'Test';
$page = [
    'title'       => 'Brand New Nested',
    'description' => 'Created via API.',
    'slug'        => 'testdir/brand-new',
];
include '_partials/header.php';
?>
<section><h1>Brand New</h1></section>
<?php include '_partials/footer.php'; ?>
PHP;

$r = callFilesEndpoint('POST', '/files/create', [
    'path'    => 'testdir/brand-new.php',
    'content' => $createContent,
]);
record($r['httpCode'] === 200 || $r['httpCode'] === 201, 'Create nested: → 200/201', $errors, $passed, $failed);
record(
    ($r['response']['ok'] ?? false) === true,
    'Create nested: response.ok = true',
    $errors, $passed, $failed
);

// Verify file exists on disk
record(
    file_exists($tempPreview . '/testdir/brand-new.php'),
    'Create nested: file exists on disk',
    $errors, $passed, $failed
);

// Verify page registry was synced
$tempDbCheck2 = new \SQLite3($tempDbPath, SQLITE3_OPEN_READONLY);
$dbSlug2 = $tempDbCheck2->querySingle("SELECT slug FROM pages WHERE file_path = 'testdir/brand-new.php'");
$tempDbCheck2->close();
record(
    $dbSlug2 !== false && $dbSlug2 !== null,
    'Create nested: page registry synced (DB row exists for new page)',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  5. DELETE — nested page removal + registry sync
// ═══════════════════════════════════════════

echo "\n--- 5. Delete nested page ---\n";

$r = callFilesEndpoint('DELETE', '/files', ['path' => 'testdir/brand-new.php']);
record($r['httpCode'] === 200, 'Delete nested: → 200', $errors, $passed, $failed);
record(
    ($r['response']['ok'] ?? false) === true,
    'Delete nested: response.ok = true',
    $errors, $passed, $failed
);

// Verify file removed from disk
record(
    !file_exists($tempPreview . '/testdir/brand-new.php'),
    'Delete nested: file removed from disk',
    $errors, $passed, $failed
);

// Verify page registry was synced (row removed)
$tempDbCheck3 = new \SQLite3($tempDbPath, SQLITE3_OPEN_READONLY);
$dbSlug3 = $tempDbCheck3->querySingle("SELECT slug FROM pages WHERE file_path = 'testdir/brand-new.php'");
$tempDbCheck3->close();
record(
    $dbSlug3 === false || $dbSlug3 === null,
    'Delete nested: page registry synced (DB row removed)',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  6. SECURITY — path traversal rejected
// ═══════════════════════════════════════════

echo "\n--- 6. Security: path traversal ---\n";

// Attempt to read ../etc/passwd via nested path
$r = callFilesEndpoint('GET', '/files/content', ['path' => 'testdir/../../etc/passwd']);
record(
    $r['httpCode'] === 400 || $r['httpCode'] === 403 || $r['httpCode'] === 422,
    'Security: path traversal rejected (../ in path)',
    $errors, $passed, $failed
);

// Attempt to read a file starting with underscore prefixed dir at nested level
// (should be handled by normalizeEditablePath guard)
$r = callFilesEndpoint('GET', '/files/content', ['path' => '_prompts/testdir/foo.php']);
record(
    $r['httpCode'] !== 200 || !($r['response']['ok'] ?? false),
    'Security: _prompts/ nested path rejected or empty',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  7. normalizeEditablePath — unit-level verification
// ═══════════════════════════════════════════

echo "\n--- 7. normalizeEditablePath coverage ---\n";

// Include the endpoint file in a sandboxed way to test normalizeEditablePath directly
// We loaded it via the subprocess helper, so test it via API calls instead.

// Root-level PHP still works
$r = callFilesEndpoint('GET', '/files/content', ['path' => 'index.php']);
record($r['httpCode'] === 200, 'Normalize: root-level PHP accepted (index.php)', $errors, $passed, $failed);

// Single-level nested PHP works
$r = callFilesEndpoint('GET', '/files/content', ['path' => 'testdir/nested-test.php']);
record($r['httpCode'] === 200, 'Normalize: single-nested PHP accepted', $errors, $passed, $failed);

// Two-level nested PHP works
$r = callFilesEndpoint('GET', '/files/content', ['path' => 'testdir/deep/inner.php']);
record($r['httpCode'] === 200, 'Normalize: two-level nested PHP accepted', $errors, $passed, $failed);

// Empty path rejected
$r = callFilesEndpoint('GET', '/files/content', ['path' => '']);
record(
    $r['httpCode'] === 400 || $r['httpCode'] === 403 || $r['httpCode'] === 422,
    'Normalize: empty path rejected',
    $errors, $passed, $failed
);

// Absolute path rejected
$r = callFilesEndpoint('GET', '/files/content', ['path' => '/etc/passwd']);
record(
    $r['httpCode'] === 400 || $r['httpCode'] === 403 || $r['httpCode'] === 422,
    'Normalize: absolute path rejected',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  8. isPreviewPagePhp — integration check via registry sync
// ═══════════════════════════════════════════

echo "\n--- 8. isPreviewPagePhp via write triggers ---\n";

// Write to a partial — should NOT trigger page registry sync for this path
// (the partial already exists in partials, not pages)
$partialPath = '_partials/header.php';
$partialContent = file_get_contents($tempPreview . '/' . $partialPath);

$r = callFilesEndpoint('PUT', '/files/content', [
    'path'    => $partialPath,
    'content' => $partialContent,
]);
record($r['httpCode'] === 200, 'isPreviewPagePhp: partial write succeeds', $errors, $passed, $failed);

// Write to a nested page — SHOULD trigger registry sync
$r = callFilesEndpoint('PUT', '/files/content', [
    'path'    => 'testdir/nested-test.php',
    'content' => $writtenContent, // unchanged content, but triggers sync
]);
record($r['httpCode'] === 200, 'isPreviewPagePhp: nested page write succeeds', $errors, $passed, $failed);


// ═══════════════════════════════════════════
//  Summary
// ═══════════════════════════════════════════

echo "\n=== Results ===\n";
echo "Passed: {$passed}\n";
echo "Failed: {$failed}\n";

if (!empty($errors)) {
    echo "\nFailing tests:\n";
    foreach ($errors as $e) {
        echo "  ✗ {$e}\n";
    }
}

echo "\nTotal: " . ($passed + $failed) . " tests\n";

cleanupTemp($tempDir);
echo "\nDone.\n";
exit($failed > 0 ? 1 : 0);


// ═══════════════════════════════════════════
//  Endpoint Call Helper
// ═══════════════════════════════════════════

/**
 * Call a files endpoint via subprocess (real handler path).
 */
function callFilesEndpoint(string $method, string $routePath, array $bodyOrParams): array
{
    global $tempDbPath, $tempPreview, $tempAssets;

    $helperPath = __DIR__ . '/helpers/call-files-endpoint.php';
    $jsonBody = json_encode($bodyOrParams, JSON_UNESCAPED_SLASHES);

    $descriptorSpec = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $cmd = sprintf(
        'php %s %s %s %s %s %s',
        escapeshellarg($helperPath),
        escapeshellarg($tempDbPath),
        escapeshellarg($tempPreview),
        escapeshellarg($tempAssets),
        escapeshellarg($method),
        escapeshellarg($routePath)
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
        echo "  DEBUG callFilesEndpoint output: " . substr($stdout, 0, 300) . "\n";
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
