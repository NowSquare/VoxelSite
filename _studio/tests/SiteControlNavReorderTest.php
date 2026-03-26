<?php

declare(strict_types=1);

/**
 * Site Control Nav Reorder — Backend Regression Suite
 *
 * Run: php _studio/tests/SiteControlNavReorderTest.php
 *
 * Tests the Phase 2B backend mutation path through the REAL endpoint
 * handler (via subprocess), not just parser/helper-level coverage.
 *
 * Test categories:
 *   1. Preflight endpoint — canonical, homepage, missing, nonexistent
 *   2. Reorder endpoint — validation gates (400, 404, 422)
 *   3. Reorder endpoint — successful move through full handler path
 *   4. Parser-level validation gates
 *   5. Rollback — forced write failure auto-restores from snapshot
 *   6. Legacy/malformed preflight + reorder through real handler
 *   7. Normalization — legacy extraction, clean labels, Home detection
 *   8. DB projection — syncNavOrderFromPartial with pinned Home
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

echo "=== Site Control Nav Reorder Test Suite ===\n\n";

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

$tempDir     = sys_get_temp_dir() . '/voxelsite_nav_test_' . uniqid();
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

// Find a test page
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
$testPageId   = 'page:' . $testFilePath;

echo "  Test page: slug={$testSlug}, file={$testFilePath}\n";


// ═══════════════════════════════════════════
//  1. PREFLIGHT — through real endpoint handler
// ═══════════════════════════════════════════

echo "\n--- 1. Preflight endpoint: response taxonomy ---\n";

// Missing pageId
$preflightMissing = callNavEndpoint('GET', '/site-control/nav-preflight', []);
record($preflightMissing['httpCode'] === 400, 'Preflight: missing pageId → 400', $errors, $passed, $failed);
record(
    ($preflightMissing['response']['error']['code'] ?? '') === 'missing_field',
    'Preflight: missing pageId code',
    $errors, $passed, $failed
);

// Nonexistent page
$preflightBogus = callNavEndpoint('GET', '/site-control/nav-preflight', ['pageId' => 'page:nonexistent-xyz.php']);
record($preflightBogus['httpCode'] === 404, 'Preflight: nonexistent page → 404', $errors, $passed, $failed);

// Valid page — canonical nav
$preflightOk = callNavEndpoint('GET', '/site-control/nav-preflight', ['pageId' => $testPageId]);
record($preflightOk['httpCode'] === 200, 'Preflight: valid page → 200', $errors, $passed, $failed);
record(
    ($preflightOk['response']['ok'] ?? false) === true,
    'Preflight: response.ok = true',
    $errors, $passed, $failed
);

if (($preflightOk['response']['ok'] ?? false) === true) {
    $pfData = $preflightOk['response']['data'] ?? [];
    // Response taxonomy
    record(isset($pfData['navStatus']), 'Preflight: has navStatus', $errors, $passed, $failed);
    record(array_key_exists('isInNav', $pfData), 'Preflight: has isInNav', $errors, $passed, $failed);
    record(array_key_exists('isHomepage', $pfData), 'Preflight: has isHomepage', $errors, $passed, $failed);
    record(array_key_exists('currentPosition', $pfData), 'Preflight: has currentPosition', $errors, $passed, $failed);
    record(array_key_exists('navTree', $pfData), 'Preflight: has navTree', $errors, $passed, $failed);
    record(array_key_exists('hasHomeEntry', $pfData), 'Preflight: has hasHomeEntry', $errors, $passed, $failed);

    // If canonical, check values
    if ($pfData['navStatus'] === 'canonical') {
        record(is_bool($pfData['isInNav']), 'Preflight canonical: isInNav is bool', $errors, $passed, $failed);
        record(is_array($pfData['navTree']), 'Preflight canonical: navTree is array', $errors, $passed, $failed);
        record($pfData['isHomepage'] === false, 'Preflight: test page is not homepage', $errors, $passed, $failed);
    }
}

// Homepage page
$homePage = $db->queryOne("SELECT file_path FROM pages WHERE is_homepage = 1 LIMIT 1");
if ($homePage) {
    $homePageId = 'page:' . $homePage['file_path'];
    $preflightHome = callNavEndpoint('GET', '/site-control/nav-preflight', ['pageId' => $homePageId]);
    record($preflightHome['httpCode'] === 200, 'Preflight: homepage → 200', $errors, $passed, $failed);
    if (($preflightHome['response']['ok'] ?? false) === true) {
        record(
            $preflightHome['response']['data']['isHomepage'] === true,
            'Preflight: homepage isHomepage = true',
            $errors, $passed, $failed
        );
    }
}


// ═══════════════════════════════════════════
//  2. REORDER — validation gates through real handler
// ═══════════════════════════════════════════

echo "\n--- 2. Reorder endpoint: validation gates ---\n";

$snapshotCountBefore = (int) $db->queryOne("SELECT COUNT(*) as c FROM snapshots")['c'];

// Missing field
$reorderMissing = callNavEndpoint('POST', '/site-control/nav-reorder', [
    'pageId' => '', 'targetIndex' => 0
]);
record($reorderMissing['httpCode'] === 400, 'Reorder: missing pageId → 400', $errors, $passed, $failed);

// Not found
$reorderBogus = callNavEndpoint('POST', '/site-control/nav-reorder', [
    'pageId' => 'page:nonexistent.php', 'targetParentHref' => null, 'targetIndex' => 0
]);
record($reorderBogus['httpCode'] === 404, 'Reorder: nonexistent page → 404', $errors, $passed, $failed);

// Missing targetIndex
$reorderNoIndex = callNavEndpoint('POST', '/site-control/nav-reorder', [
    'pageId' => $testPageId, 'targetParentHref' => null
]);
record($reorderNoIndex['httpCode'] === 400, 'Reorder: missing targetIndex → 400', $errors, $passed, $failed);

// Homepage locked
if ($homePage) {
    $reorderHome = callNavEndpoint('POST', '/site-control/nav-reorder', [
        'pageId' => $homePageId, 'targetParentHref' => null, 'targetIndex' => 0
    ]);
    record($reorderHome['httpCode'] === 422, 'Reorder: homepage → 422', $errors, $passed, $failed);
    record(
        ($reorderHome['response']['error']['code'] ?? '') === 'homepage_locked',
        'Reorder: homepage_locked code',
        $errors, $passed, $failed
    );
}

// Homepage as parent
$reorderHomeParent = callNavEndpoint('POST', '/site-control/nav-reorder', [
    'pageId' => $testPageId, 'targetParentHref' => '/', 'targetIndex' => 0
]);
record($reorderHomeParent['httpCode'] === 422, 'Reorder: "/" as parent → 422', $errors, $passed, $failed);
record(
    ($reorderHomeParent['response']['error']['code'] ?? '') === 'homepage_parent_locked',
    'Reorder: homepage_parent_locked code',
    $errors, $passed, $failed
);

// Index out of range
$reorderOOR = callNavEndpoint('POST', '/site-control/nav-reorder', [
    'pageId' => $testPageId, 'targetParentHref' => null, 'targetIndex' => 99
]);
record($reorderOOR['httpCode'] === 422, 'Reorder: out-of-range → 422', $errors, $passed, $failed);
record(
    ($reorderOOR['response']['error']['code'] ?? '') === 'target_index_out_of_range',
    'Reorder: target_index_out_of_range code',
    $errors, $passed, $failed
);

// No-change detection (move to same position)
$preflightForPosition = callNavEndpoint('GET', '/site-control/nav-preflight', ['pageId' => $testPageId]);
if (($preflightForPosition['response']['data']['currentPosition'] ?? null) !== null) {
    $curPos = $preflightForPosition['response']['data']['currentPosition'];
    $reorderSame = callNavEndpoint('POST', '/site-control/nav-reorder', [
        'pageId' => $testPageId,
        'targetParentHref' => $curPos['parentHref'],
        'targetIndex' => $curPos['index'],
    ]);
    record($reorderSame['httpCode'] === 422, 'Reorder: no-change → 422', $errors, $passed, $failed);
    record(
        ($reorderSame['response']['error']['code'] ?? '') === 'no_change',
        'Reorder: no_change code',
        $errors, $passed, $failed
    );
}

// No snapshots during validation
$db2 = new \SQLite3($tempDbPath, SQLITE3_OPEN_READONLY);
$snapshotCountAfterValidation = (int) $db2->querySingle("SELECT COUNT(*) FROM snapshots");
$db2->close();
record(
    $snapshotCountAfterValidation === $snapshotCountBefore,
    'No snapshots created during validation gates (' . $snapshotCountAfterValidation . ' == ' . $snapshotCountBefore . ')',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  3. REORDER — successful move through full handler
// ═══════════════════════════════════════════

echo "\n--- 3. Reorder endpoint: successful move ---\n";

// Read nav to know the structure
$navPath = $tempPreview . '/_partials/nav.php';
$origNavContent = file_get_contents($navPath);
$origNavLinks = NavLinksParser::parse($origNavContent);

if ($origNavLinks !== null && count(NavLinksParser::getMovableTree($origNavLinks)) >= 2) {
    $movable = NavLinksParser::getMovableTree($origNavLinks);
    $movePageHref = $movable[count($movable) - 1]['href']; // last movable
    $moveSlug = ltrim($movePageHref, '/');
    $movePageFile = $moveSlug . '.php';
    $movePageId = 'page:' . $movePageFile;

    // Move last movable to position 0
    $reorderSuccess = callNavEndpoint('POST', '/site-control/nav-reorder', [
        'pageId' => $movePageId, 'targetParentHref' => null, 'targetIndex' => 0
    ]);

    record($reorderSuccess['httpCode'] === 200, 'Reorder success → 200 (got ' . $reorderSuccess['httpCode'] . ')', $errors, $passed, $failed);
    record(
        ($reorderSuccess['response']['ok'] ?? false) === true,
        'Reorder success: response.ok = true',
        $errors, $passed, $failed
    );

    if (($reorderSuccess['response']['ok'] ?? false) === true) {
        $rData = $reorderSuccess['response']['data'] ?? [];

        // Response taxonomy
        record(isset($rData['pageId']), 'Response: has pageId', $errors, $passed, $failed);
        record(isset($rData['oldParentHref']) || array_key_exists('oldParentHref', $rData), 'Response: has oldParentHref', $errors, $passed, $failed);
        record(isset($rData['oldIndex']) || array_key_exists('oldIndex', $rData), 'Response: has oldIndex', $errors, $passed, $failed);
        record(array_key_exists('newParentHref', $rData), 'Response: has newParentHref', $errors, $passed, $failed);
        record(array_key_exists('newIndex', $rData), 'Response: has newIndex', $errors, $passed, $failed);
        record(array_key_exists('snapshotId', $rData), 'Response: has snapshotId', $errors, $passed, $failed);
        record(array_key_exists('normalized', $rData), 'Response: has normalized', $errors, $passed, $failed);
        record(array_key_exists('message', $rData), 'Response: has message', $errors, $passed, $failed);

        // Snapshot was created
        record(
            $rData['snapshotId'] !== null,
            'Reorder: snapshot was created (snapshotId non-null)',
            $errors, $passed, $failed
        );

        // Values correct
        record($rData['pageId'] === $movePageId, 'Reorder: pageId matches', $errors, $passed, $failed);
        record($rData['newIndex'] === 0, 'Reorder: newIndex is 0', $errors, $passed, $failed);
        record($rData['newParentHref'] === null, 'Reorder: newParentHref is null (root)', $errors, $passed, $failed);

        // Verify file truth matches
        $verifyNav = NavLinksParser::parse(file_get_contents($navPath));
        if ($verifyNav !== null) {
            $verifyMovable = NavLinksParser::getMovableTree($verifyNav);
            record(
                $verifyMovable[0]['href'] === $movePageHref,
                'File truth: moved page is at position 0',
                $errors, $passed, $failed
            );
        }

        // Verify DB reindex happened
        $db3 = new \SQLite3($tempDbPath, SQLITE3_OPEN_READONLY);
        $movedRow = $db3->querySingle("SELECT nav_order FROM pages WHERE slug = '{$moveSlug}'");
        $db3->close();
        record(
            (int) $movedRow === 1,
            'DB reindex: moved page has nav_order=1 (got ' . $movedRow . ')',
            $errors, $passed, $failed
        );
    }

    // Restore nav for subsequent tests
    file_put_contents($navPath, $origNavContent);
} else {
    echo "  SKIP: Not enough movable entries for reorder test\n";
}


// ═══════════════════════════════════════════
//  4. PARSER VALIDATION GATES — unit-level
// ═══════════════════════════════════════════

echo "\n--- 4. Parser-level validation gates ---\n";

$testNav = [
    ['href' => '/', 'label' => 'Home', 'home' => true],
    ['href' => '/work', 'label' => 'Work', 'children' => [
        ['href' => '/work/design', 'label' => 'Design'],
    ]],
    ['href' => '/about', 'label' => 'About'],
    ['href' => '/services', 'label' => 'Services'],
    ['href' => '/contact', 'label' => 'Contact'],
];

// has_children rejection
$threwHasChildren = false;
try { NavLinksParser::applyMove($testNav, '/work', '/about', 0); }
catch (\RuntimeException $e) { $threwHasChildren = str_contains($e->getMessage(), 'has children'); }
record($threwHasChildren, 'Parser: parent-with-children rejected', $errors, $passed, $failed);

// homepage parent rejection
$threwHomeParent = false;
try { NavLinksParser::applyMove($testNav, '/about', '/', 0); }
catch (\RuntimeException $e) { $threwHomeParent = str_contains($e->getMessage(), 'cannot be used as a parent'); }
record($threwHomeParent, 'Parser: "/" rejected as parent', $errors, $passed, $failed);

// out of range
$threwRange = false;
try { NavLinksParser::applyMove($testNav, '/about', null, 99); }
catch (\RuntimeException $e) { $threwRange = str_contains($e->getMessage(), 'out of range'); }
record($threwRange, 'Parser: out-of-range rejected', $errors, $passed, $failed);

// page not found
$threwNotFound = false;
try { NavLinksParser::applyMove($testNav, '/nonexistent', null, 0); }
catch (\RuntimeException $e) { $threwNotFound = str_contains($e->getMessage(), 'not found'); }
record($threwNotFound, 'Parser: nonexistent page rejected', $errors, $passed, $failed);

// root reorder parent-with-children OK
$reorderedParent = NavLinksParser::applyMove($testNav, '/work', null, 3);
record(
    $reorderedParent[4]['href'] === '/work' && !empty($reorderedParent[4]['children']),
    'Parser: root reorder parent-with-children preserves children',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  5. ROLLBACK — forced write failure auto-restores
// ═══════════════════════════════════════════

echo "\n--- 5. Rollback: forced write failure ---\n";

// Reload clean nav state
$origNavForRollback = file_get_contents($navPath);
$origNavLinksForRollback = NavLinksParser::parse($origNavForRollback);

if ($origNavLinksForRollback !== null && count(NavLinksParser::getMovableTree($origNavLinksForRollback)) >= 2) {
    $rollbackMovable = NavLinksParser::getMovableTree($origNavLinksForRollback);
    $rollbackHref = $rollbackMovable[count($rollbackMovable) - 1]['href'];
    $rollbackSlug = ltrim($rollbackHref, '/');
    $rollbackPageId = 'page:' . $rollbackSlug . '.php';

    // Verify the intended move WOULD produce a different tree (non-trivial rollback)
    $wouldBeMoved = NavLinksParser::applyMove($origNavLinksForRollback, $rollbackHref, null, 0);
    record(
        $wouldBeMoved != $origNavLinksForRollback,
        'Rollback precondition: intended move changes the tree',
        $errors, $passed, $failed
    );

    // Call reorder with --fail-write:
    //   1. Snapshot captures original nav.php
    //   2. Handler applies the move and writes mutated nav.php via file_put_contents
    //   3. Test hook throws AFTER the write
    //   4. Catch block restores from snapshot, repairing the mutation
    //   5. We verify nav.php matches the original (proving real restoration)
    $rollbackResult = callNavEndpoint('POST', '/site-control/nav-reorder', [
        'pageId' => $rollbackPageId, 'targetParentHref' => null, 'targetIndex' => 0
    ], '--fail-write');

    record(
        $rollbackResult['httpCode'] !== 200,
        'Rollback: forced failure does not return 200 (got ' . $rollbackResult['httpCode'] . ')',
        $errors, $passed, $failed
    );
    record(
        ($rollbackResult['response']['ok'] ?? true) === false,
        'Rollback: response.ok is false',
        $errors, $passed, $failed
    );
    record(
        ($rollbackResult['response']['error']['code'] ?? '') === 'write_failed',
        'Rollback: error code is write_failed (got ' . ($rollbackResult['response']['error']['code'] ?? 'none') . ')',
        $errors, $passed, $failed
    );

    // Verify nav.php was restored to original
    $postRollbackContent = file_get_contents($navPath);
    record(
        $postRollbackContent === $origNavForRollback,
        'Rollback: nav.php content restored to original',
        $errors, $passed, $failed
    );

    // Verify file truth still parses as the original tree
    $postRollbackLinks = NavLinksParser::parse($postRollbackContent);
    record(
        $postRollbackLinks !== null && $postRollbackLinks == $origNavLinksForRollback,
        'Rollback: parsed nav matches pre-mutation tree',
        $errors, $passed, $failed
    );
} else {
    echo "  SKIP: Not enough movable entries for rollback test\n";
}


// ═══════════════════════════════════════════
//  6. LEGACY/MALFORMED — preflight + reorder through real handler
// ═══════════════════════════════════════════

echo "\n--- 6. Legacy/malformed: endpoint status mapping ---\n";

$legacyNavSrcPath = dirname(__DIR__) . '/data/designs/1cd9c633/preview/_partials/nav.php';
if (file_exists($legacyNavSrcPath)) {
    $savedNavForLegacy = file_get_contents($navPath);

    // ── 6a. Legacy nav → preflight returns needs_normalization ──
    $legacyContent = file_get_contents($legacyNavSrcPath);
    file_put_contents($navPath, $legacyContent);

    // Find a page that exists in the legacy nav
    $legacyExtracted = NavLinksParser::extractFromLegacyNav($legacyContent);
    $legacyTestPageId = null;
    if ($legacyExtracted !== null) {
        foreach ($legacyExtracted as $le) {
            if (!empty($le['home'])) continue;
            $leSlug = ltrim($le['href'], '/');
            $lePage = $db->queryOne("SELECT file_path FROM pages WHERE slug = ?", [$leSlug]);
            if ($lePage) {
                $legacyTestPageId = 'page:' . $lePage['file_path'];
                break;
            }
        }
    }

    if ($legacyTestPageId !== null) {
        $legacyPreflight = callNavEndpoint('GET', '/site-control/nav-preflight', ['pageId' => $legacyTestPageId]);
        record(
            $legacyPreflight['httpCode'] === 200,
            'Legacy preflight: returns 200',
            $errors, $passed, $failed
        );
        record(
            ($legacyPreflight['response']['data']['navStatus'] ?? '') === 'needs_normalization',
            'Legacy preflight: navStatus is needs_normalization (got ' . ($legacyPreflight['response']['data']['navStatus'] ?? 'none') . ')',
            $errors, $passed, $failed
        );
        record(
            is_array($legacyPreflight['response']['data']['navTree'] ?? null),
            'Legacy preflight: navTree is present',
            $errors, $passed, $failed
        );
    } else {
        echo "  SKIP: No legacy nav page found in DB for endpoint test\n";
    }

    // ── 6b. Malformed nav → preflight returns nav_parse_error ──
    $malformedNav = "<" . "?php\n\$navLinks = [\n  ['href' => getRoute('x'), 'label' => 'X'],\n];\n?" . ">\n<nav></nav>";
    file_put_contents($navPath, $malformedNav);

    $malformedPreflight = callNavEndpoint('GET', '/site-control/nav-preflight', ['pageId' => $testPageId]);
    record(
        $malformedPreflight['httpCode'] === 200,
        'Malformed preflight: returns 200',
        $errors, $passed, $failed
    );
    record(
        ($malformedPreflight['response']['data']['navStatus'] ?? '') === 'nav_parse_error',
        'Malformed preflight: navStatus is nav_parse_error (got ' . ($malformedPreflight['response']['data']['navStatus'] ?? 'none') . ')',
        $errors, $passed, $failed
    );

    // ── 6c. Malformed nav → reorder returns nav_parse_error 422 ──
    $malformedReorder = callNavEndpoint('POST', '/site-control/nav-reorder', [
        'pageId' => $testPageId, 'targetParentHref' => null, 'targetIndex' => 0
    ]);
    record(
        $malformedReorder['httpCode'] === 422,
        'Malformed reorder: returns 422 (got ' . $malformedReorder['httpCode'] . ')',
        $errors, $passed, $failed
    );
    record(
        ($malformedReorder['response']['error']['code'] ?? '') === 'nav_parse_error',
        'Malformed reorder: error code is nav_parse_error (got ' . ($malformedReorder['response']['error']['code'] ?? 'none') . ')',
        $errors, $passed, $failed
    );

    // ── 6d. No nav file → preflight returns nav_missing ──
    unlink($navPath);
    $missingNavPreflight = callNavEndpoint('GET', '/site-control/nav-preflight', ['pageId' => $testPageId]);
    record(
        ($missingNavPreflight['response']['data']['navStatus'] ?? '') === 'nav_missing',
        'Missing nav preflight: navStatus is nav_missing (got ' . ($missingNavPreflight['response']['data']['navStatus'] ?? 'none') . ')',
        $errors, $passed, $failed
    );

    // ── 6e. No nav file → reorder returns nav_file_missing 404 ──
    $missingNavReorder = callNavEndpoint('POST', '/site-control/nav-reorder', [
        'pageId' => $testPageId, 'targetParentHref' => null, 'targetIndex' => 0
    ]);
    record(
        $missingNavReorder['httpCode'] === 404,
        'Missing nav reorder: returns 404',
        $errors, $passed, $failed
    );
    record(
        ($missingNavReorder['response']['error']['code'] ?? '') === 'nav_file_missing',
        'Missing nav reorder: error code is nav_file_missing',
        $errors, $passed, $failed
    );

    // Restore original nav
    file_put_contents($navPath, $savedNavForLegacy);
} else {
    echo "  SKIP: 1cd9c633 legacy nav not found\n";
}


// ═══════════════════════════════════════════
//  7. NORMALIZATION — parser-level verification
// ═══════════════════════════════════════════

echo "\n--- 7. Normalization: parser-level ---\n";

if (file_exists($legacyNavSrcPath)) {
    $legacyContent = file_get_contents($legacyNavSrcPath);

    $extracted = NavLinksParser::extractFromLegacyNav($legacyContent);
    record($extracted !== null, 'Legacy extraction succeeds', $errors, $passed, $failed);

    if ($extracted !== null) {
        foreach ($extracted as $entry) {
            record(
                !str_starts_with($entry['label'], '>'),
                'Label clean: ' . $entry['label'],
                $errors, $passed, $failed
            );
        }

        $homeEntries = array_filter($extracted, fn($e) => !empty($e['home']));
        record(count($homeEntries) > 0, 'Legacy Home entry detected', $errors, $passed, $failed);

        $normalized = NavLinksParser::normalizeFileContent($legacyContent, $extracted);
        record($normalized !== null, 'Normalization produces output', $errors, $passed, $failed);

        if ($normalized !== null) {
            $normParsed = NavLinksParser::parse($normalized);
            record($normParsed !== null, 'Normalized output is parseable', $errors, $passed, $failed);
            record(!str_contains($normalized, "('home')) continue"), 'No Home skip in render scaffold', $errors, $passed, $failed);
        }
    }
} else {
    echo "  SKIP: 1cd9c633 nav not found\n";
}


// ═══════════════════════════════════════════
//  8. DB PROJECTION — pinned Home excluded
// ═══════════════════════════════════════════

echo "\n--- 8. DB projection: pinned Home excluded ---\n";

$workPage = $db->queryOne("SELECT id, slug FROM pages WHERE slug = 'work'");
$aboutPage = $db->queryOne("SELECT id, slug FROM pages WHERE slug = 'about'");
$contactPage = $db->queryOne("SELECT id, slug FROM pages WHERE slug = 'contact'");

if ($workPage && $aboutPage && $contactPage) {
    // Write a canonical nav with Home + Work + About (with Contact as child)
    $hierarchyNav = "<" . "?php\n" .
        "\$navLinks = [\n" .
        "  ['href' => '/', 'label' => 'Home', 'home' => true],\n" .
        "  ['href' => '/work', 'label' => 'Work'],\n" .
        "  ['href' => '/about', 'label' => 'About', 'children' => [\n" .
        "    ['href' => '/contact', 'label' => 'Contact'],\n" .
        "  ]],\n" .
        "];\n?" . ">\n<nav><ul></ul></nav>\n";

    $savedNav = file_get_contents($navPath);
    file_put_contents($navPath, $hierarchyNav);

    // Re-init for reindex
    $db4 = Database::getInstance($tempDbPath);
    $fm4 = new FileManager($db4);
    $fm4->syncNavOrderFromPartial();

    // Pinned Home: index page should NOT get nav_order
    $indexAfter = $db4->queryOne("SELECT nav_order FROM pages WHERE slug = 'index'");
    record(
        $indexAfter === null || $indexAfter['nav_order'] === null,
        'Projection: pinned Home (index) has no nav_order',
        $errors, $passed, $failed
    );

    // Work should be nav_order=1 (first movable)
    $workAfter = $db4->queryOne("SELECT nav_order FROM pages WHERE slug = 'work'");
    record(
        $workAfter !== null && (int) $workAfter['nav_order'] === 1,
        'Projection: /work has nav_order=1 (got ' . ($workAfter['nav_order'] ?? 'null') . ')',
        $errors, $passed, $failed
    );

    // About should be nav_order=2
    $aboutAfter = $db4->queryOne("SELECT nav_order, nav_parent_id FROM pages WHERE slug = 'about'");
    record(
        $aboutAfter !== null && (int) $aboutAfter['nav_order'] === 2,
        'Projection: /about has nav_order=2 (got ' . ($aboutAfter['nav_order'] ?? 'null') . ')',
        $errors, $passed, $failed
    );
    record(
        $aboutAfter !== null && $aboutAfter['nav_parent_id'] === null,
        'Projection: /about has no parent (root)',
        $errors, $passed, $failed
    );

    // Contact should be child of about with nav_order=1
    $contactAfter = $db4->queryOne("SELECT nav_order, nav_parent_id FROM pages WHERE slug = 'contact'");
    record(
        $contactAfter !== null && (int) $contactAfter['nav_parent_id'] === (int) $aboutPage['id'],
        'Projection: /contact parent is /about',
        $errors, $passed, $failed
    );
    record(
        $contactAfter !== null && (int) $contactAfter['nav_order'] === 1,
        'Projection: /contact child nav_order=1',
        $errors, $passed, $failed
    );

    // Restore original nav
    file_put_contents($navPath, $savedNav);
    $fm4->syncNavOrderFromPartial();
} else {
    echo "  SKIP: Missing work/about/contact pages for projection test\n";
}


// ═══════════════════════════════════════════
//  Cleanup
// ═══════════════════════════════════════════

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
 * Call a nav endpoint via subprocess (real handler path).
 */
function callNavEndpoint(string $method, string $routePath, array $body, ?string $failMode = null): array
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
        echo "  DEBUG callNavEndpoint output: " . substr($stdout, 0, 300) . "\n";
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
