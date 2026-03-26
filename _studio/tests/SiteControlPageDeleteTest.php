<?php

declare(strict_types=1);

/**
 * Site Control Page Delete — Backend Regression Suite
 *
 * Run: php _studio/tests/SiteControlPageDeleteTest.php
 *
 * Tests the Phase 2C page-delete mutation through the REAL endpoint
 * handler (via subprocess), verifying:
 *   1. Validation gates (missing pageId, not found, homepage lock)
 *   2. Happy path: file + DB + nav entry removed, response truthful
 *   3. Nav child auto-promotion when deleting a parent entry
 *   4. Legacy nav: delete blocked when page has nav entry in non-canonical nav
 *   5. Legacy nav: delete succeeds when page is NOT in the legacy nav
 *   6. Missing nav.php: delete succeeds with no nav crash
 *   7. Rollback on forced nav failure (--fail-delete-nav)
 *   8. Rollback on forced DB failure (--fail-delete-db)
 *   9. Broken references reported in response
 *  10. No snapshots wasted on validation rejections
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

echo "=== Site Control Page Delete Test Suite ===\n\n";

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
    if ($pageCount < 3) {
        echo "ABORT: Need at least 3 pages (1 homepage + 2 deletable). Found: {$pageCount}\n";
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

$tempDir     = sys_get_temp_dir() . '/voxelsite_delete_test_' . uniqid();
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

// Find test pages — we need two non-homepage pages for different tests
$testPages = $db->query("SELECT id, slug, title, file_path, is_homepage FROM pages WHERE is_homepage = 0 AND page_type = 'page' LIMIT 2");

if (count($testPages) < 2) {
    echo "ABORT: Need at least 2 non-homepage pages. Found: " . count($testPages) . "\n";
    cleanupTemp($tempDir);
    exit(1);
}

$testPage1 = $testPages[0];
$testPage2 = $testPages[1];

$testSlug1     = (string) $testPage1['slug'];
$testFilePath1 = (string) $testPage1['file_path'];
$testPageId1   = 'page:' . $testFilePath1;
$testTitle1    = (string) ($testPage1['title'] ?? ucfirst(str_replace('-', ' ', $testSlug1)));

$testSlug2     = (string) $testPage2['slug'];
$testFilePath2 = (string) $testPage2['file_path'];
$testPageId2   = 'page:' . $testFilePath2;

$homePage = $db->queryOne("SELECT id, slug, title, file_path FROM pages WHERE is_homepage = 1 LIMIT 1");

echo "  Test page 1: slug={$testSlug1}, title=\"{$testTitle1}\", file={$testFilePath1}\n";
echo "  Test page 2: slug={$testSlug2}, file={$testFilePath2}\n";
if ($homePage) {
    echo "  Home page: slug=" . $homePage['slug'] . ", file=" . $homePage['file_path'] . "\n";
}

// Capture nav state
$navFilePath = $tempPreview . '/_partials/nav.php';
$navIsCanonical = false;
$navContentOriginal = '';
if (file_exists($navFilePath)) {
    $navContentOriginal = file_get_contents($navFilePath);
    $navIsCanonical = NavLinksParser::parse($navContentOriginal) !== null;
}

echo "  Nav status: " . ($navIsCanonical ? 'canonical' : 'non-canonical') . "\n";


// ═══════════════════════════════════════════
//  1. VALIDATION GATES
// ═══════════════════════════════════════════

echo "\n--- 1. Validation gates ---\n";

$snapshotCountBefore = getSnapshotCount($tempDbPath);

// Missing pageId
$r = callEndpoint('POST', '/site-control/page-delete', []);
record($r['httpCode'] === 400, 'Validation: missing pageId → 400', $errors, $passed, $failed);
record(
    ($r['response']['error']['code'] ?? '') === 'missing_field',
    'Validation: missing pageId error code',
    $errors, $passed, $failed
);

// Empty pageId
$r = callEndpoint('POST', '/site-control/page-delete', ['pageId' => '']);
record($r['httpCode'] === 400, 'Validation: empty pageId → 400', $errors, $passed, $failed);

// Nonexistent page
$r = callEndpoint('POST', '/site-control/page-delete', ['pageId' => 'page:nonexistent-xyz.php']);
record($r['httpCode'] === 404, 'Validation: nonexistent page → 404', $errors, $passed, $failed);
record(
    ($r['response']['error']['code'] ?? '') === 'page_not_found',
    'Validation: nonexistent page error code',
    $errors, $passed, $failed
);

// Homepage lock
if ($homePage) {
    $homePageId = 'page:' . $homePage['file_path'];
    $r = callEndpoint('POST', '/site-control/page-delete', ['pageId' => $homePageId]);
    record($r['httpCode'] === 400, 'Validation: homepage → 400', $errors, $passed, $failed);
    record(
        ($r['response']['error']['code'] ?? '') === 'cannot_delete_homepage',
        'Validation: homepage error code',
        $errors, $passed, $failed
    );
}

// No snapshots wasted on validation errors
$snapshotCountAfter = getSnapshotCount($tempDbPath);
record(
    $snapshotCountAfter === $snapshotCountBefore,
    'Validation: no snapshots created for rejected requests',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  2. HAPPY PATH — delete a page
// ═══════════════════════════════════════════

echo "\n--- 2. Happy path: delete page ---\n";

// Verify file and DB row exist before
$pageFileExistsBefore = file_exists($tempPreview . '/' . $testFilePath1);
$dbPageBefore = dbQueryOne($tempDbPath, "SELECT COUNT(*) as c FROM pages WHERE slug = '{$testSlug1}'");
record($pageFileExistsBefore, 'Happy path: page file exists before delete', $errors, $passed, $failed);
record((int) ($dbPageBefore['c'] ?? 0) === 1, 'Happy path: DB row exists before delete', $errors, $passed, $failed);

$r = callEndpoint('POST', '/site-control/page-delete', ['pageId' => $testPageId1]);

record($r['httpCode'] === 200, 'Happy path: → 200', $errors, $passed, $failed);
record(
    ($r['response']['ok'] ?? false) === true,
    'Happy path: response.ok = true',
    $errors, $passed, $failed
);

if (($r['response']['ok'] ?? false) === true) {
    $data = $r['response']['data'] ?? [];

    // Response shape
    record(
        ($data['deletedPage']['title'] ?? '') === $testTitle1,
        'Happy path: deletedPage.title correct',
        $errors, $passed, $failed
    );
    record(
        ($data['deletedPage']['slug'] ?? '') === $testSlug1,
        'Happy path: deletedPage.slug correct',
        $errors, $passed, $failed
    );
    record(
        ($data['deletedPage']['filePath'] ?? '') === $testFilePath1,
        'Happy path: deletedPage.filePath correct',
        $errors, $passed, $failed
    );
    record(
        isset($data['snapshotId']),
        'Happy path: snapshotId present',
        $errors, $passed, $failed
    );
    record(
        array_key_exists('navEntryRemoved', $data),
        'Happy path: navEntryRemoved field present',
        $errors, $passed, $failed
    );
    record(
        array_key_exists('navChildrenPromoted', $data),
        'Happy path: navChildrenPromoted field present',
        $errors, $passed, $failed
    );
    record(
        array_key_exists('affectedReferences', $data),
        'Happy path: affectedReferences field present',
        $errors, $passed, $failed
    );

    // File truth: page file deleted
    record(
        !file_exists($tempPreview . '/' . $testFilePath1),
        'Happy path: page file deleted from disk',
        $errors, $passed, $failed
    );

    // DB truth: row deleted
    $dbPageAfter = dbQueryOne($tempDbPath, "SELECT COUNT(*) as c FROM pages WHERE slug = '{$testSlug1}'");
    record(
        (int) ($dbPageAfter['c'] ?? 1) === 0,
        'Happy path: DB row deleted',
        $errors, $passed, $failed
    );

    // Nav truth: if canonical, entry should be removed
    if ($navIsCanonical && $data['navEntryRemoved']) {
        $navContentAfter = file_get_contents($navFilePath);
        $navLinksAfter   = NavLinksParser::parse($navContentAfter);

        if ($navLinksAfter !== null) {
            $pageHref = '/' . $testSlug1;
            $found = false;
            foreach ($navLinksAfter as $entry) {
                if ($entry['href'] === $pageHref) { $found = true; break; }
                foreach (($entry['children'] ?? []) as $child) {
                    if ($child['href'] === $pageHref) { $found = true; break 2; }
                }
            }
            record(!$found, 'Happy path: nav entry removed from canonical nav', $errors, $passed, $failed);
        }
    }
}


// ═══════════════════════════════════════════
//  3. NAV CHILD AUTO-PROMOTION
// ═══════════════════════════════════════════

echo "\n--- 3. Nav child auto-promotion ---\n";

// Create a synthetic nav structure with parent + children for the second test page
// We'll use the second test page as a parent with synthetic children
$syntheticNavLinks = [
    ['label' => 'Home',       'href' => '/'],
    ['label' => 'Parent',     'href' => '/' . $testSlug2, 'children' => [
        ['label' => 'Child A', 'href' => '/child-a'],
        ['label' => 'Child B', 'href' => '/child-b'],
    ]],
];
$syntheticNavBlock = NavLinksParser::serialize($syntheticNavLinks);

// We need to construct a complete nav file with the block
$syntheticNavFile = "<?php\n" . $syntheticNavBlock . "\n?>\n<nav><?php foreach (\$navLinks as \$link): ?><a href=\"<?= \$link['href'] ?>\"><?= \$link['label'] ?></a><?php endforeach; ?></nav>";
file_put_contents($navFilePath, $syntheticNavFile);

$r = callEndpoint('POST', '/site-control/page-delete', ['pageId' => $testPageId2]);

record($r['httpCode'] === 200, 'Promotion: → 200', $errors, $passed, $failed);

if (($r['response']['ok'] ?? false) === true) {
    $data = $r['response']['data'] ?? [];

    record(
        ($data['navEntryRemoved'] ?? false) === true,
        'Promotion: navEntryRemoved = true',
        $errors, $passed, $failed
    );
    record(
        ($data['navChildrenPromoted'] ?? 0) === 2,
        'Promotion: navChildrenPromoted = 2',
        $errors, $passed, $failed
    );

    // Verify nav file: children should be at root level now
    $navAfterPromotion = file_get_contents($navFilePath);
    $navLinksAfter     = NavLinksParser::parse($navAfterPromotion);

    if ($navLinksAfter !== null) {
        // Should have: Home, Child A, Child B (parent removed, children promoted)
        $labels = array_map(fn($e) => $e['label'], $navLinksAfter);
        record(
            in_array('Child A', $labels) && in_array('Child B', $labels),
            'Promotion: promoted children appear at root level',
            $errors, $passed, $failed
        );
        record(
            !in_array('Parent', $labels),
            'Promotion: parent entry removed from nav',
            $errors, $passed, $failed
        );
    } else {
        record(false, 'Promotion: nav file is still parseable after promotion', $errors, $passed, $failed);
        record(false, 'Promotion: (skipped children check)', $errors, $passed, $failed);
        record(false, 'Promotion: (skipped parent check)', $errors, $passed, $failed);
    }
}

// Restore original nav for subsequent tests
file_put_contents($navFilePath, $navContentOriginal);


// ═══════════════════════════════════════════
//  4. LEGACY NAV — delete blocked
// ═══════════════════════════════════════════

echo "\n--- 4. Legacy nav: delete blocked ---\n";

// Re-create a deletable page (since we already deleted testPage1 and testPage2)
$legacyTestSlug = 'legacy-delete-test';
$legacyTestFile = $legacyTestSlug . '.php';
$legacyTestPath = $tempPreview . '/' . $legacyTestFile;
file_put_contents($legacyTestPath, '<?php $title = "Legacy Test"; ?><h1>Legacy Test</h1>');
$legacyTestPageId = 'page:' . $legacyTestFile;

// Insert into DB
$tempDbInsert = new \SQLite3($tempDbPath);
$now = date('Y-m-d H:i:s');
$tempDbInsert->exec("INSERT INTO pages (slug, title, file_path, page_type, is_homepage, created_at, updated_at) VALUES ('{$legacyTestSlug}', 'Legacy Test', '{$legacyTestFile}', 'page', 0, '{$now}', '{$now}')");
$tempDbInsert->close();

// Write legacy nav with this page's href
$legacyNavContent = '<nav><ul class="site-nav__menu">' .
    '<li><a href="/">Home</a></li>' .
    '<li><a href="/' . $legacyTestSlug . '">Legacy Test</a></li>' .
    '</ul></nav>';
file_put_contents($navFilePath, $legacyNavContent);

$r = callEndpoint('POST', '/site-control/page-delete', ['pageId' => $legacyTestPageId]);

record($r['httpCode'] === 400, 'Legacy nav: delete blocked → 400', $errors, $passed, $failed);
record(
    ($r['response']['error']['code'] ?? '') === 'nav_not_canonical',
    'Legacy nav: error code = nav_not_canonical',
    $errors, $passed, $failed
);

// File should still exist (no writes happened)
record(
    file_exists($legacyTestPath),
    'Legacy nav: page file still exists (no mutation)',
    $errors, $passed, $failed
);

// DB row should still exist
$legacyDbCheck = dbQueryOne($tempDbPath, "SELECT COUNT(*) as c FROM pages WHERE slug = '{$legacyTestSlug}'");
record(
    (int) ($legacyDbCheck['c'] ?? 0) === 1,
    'Legacy nav: DB row still exists (no mutation)',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  5. LEGACY NAV — delete succeeds when page NOT in nav
// ═══════════════════════════════════════════

echo "\n--- 5. Legacy nav: delete succeeds (page not in nav) ---\n";

// Write legacy nav WITHOUT this page's href
$legacyNavNoRef = '<nav><ul class="site-nav__menu">' .
    '<li><a href="/">Home</a></li>' .
    '<li><a href="/other-page">Other Page</a></li>' .
    '</ul></nav>';
file_put_contents($navFilePath, $legacyNavNoRef);

$r = callEndpoint('POST', '/site-control/page-delete', ['pageId' => $legacyTestPageId]);

record($r['httpCode'] === 200, 'Legacy not-in-nav: → 200', $errors, $passed, $failed);
record(
    ($r['response']['ok'] ?? false) === true,
    'Legacy not-in-nav: response.ok = true',
    $errors, $passed, $failed
);

// File should be deleted
record(
    !file_exists($legacyTestPath),
    'Legacy not-in-nav: page file deleted',
    $errors, $passed, $failed
);

// DB row should be deleted
$legacyDbAfter = dbQueryOne($tempDbPath, "SELECT COUNT(*) as c FROM pages WHERE slug = '{$legacyTestSlug}'");
record(
    (int) ($legacyDbAfter['c'] ?? 1) === 0,
    'Legacy not-in-nav: DB row deleted',
    $errors, $passed, $failed
);

// Nav file should be unchanged
$navAfterLegacyDelete = file_get_contents($navFilePath);
record(
    $navAfterLegacyDelete === $legacyNavNoRef,
    'Legacy not-in-nav: nav file untouched',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  6. MISSING NAV — delete succeeds
// ═══════════════════════════════════════════

echo "\n--- 6. Missing nav.php ---\n";

// Create another deletable page
$noNavTestSlug = 'no-nav-test';
$noNavTestFile = $noNavTestSlug . '.php';
$noNavTestPath = $tempPreview . '/' . $noNavTestFile;
file_put_contents($noNavTestPath, '<?php $title = "No Nav Test"; ?><h1>No Nav Test</h1>');
$noNavTestPageId = 'page:' . $noNavTestFile;

$tempDb6 = new \SQLite3($tempDbPath);
$now6 = date('Y-m-d H:i:s');
$tempDb6->exec("INSERT INTO pages (slug, title, file_path, page_type, is_homepage, created_at, updated_at) VALUES ('{$noNavTestSlug}', 'No Nav Test', '{$noNavTestFile}', 'page', 0, '{$now6}', '{$now6}')");
$tempDb6->close();

// Remove nav.php
$navBackup = file_get_contents($navFilePath);
unlink($navFilePath);

$r = callEndpoint('POST', '/site-control/page-delete', ['pageId' => $noNavTestPageId]);

record($r['httpCode'] === 200, 'Missing nav: → 200', $errors, $passed, $failed);
record(
    ($r['response']['ok'] ?? false) === true,
    'Missing nav: response.ok = true',
    $errors, $passed, $failed
);

if (($r['response']['ok'] ?? false) === true) {
    $data = $r['response']['data'] ?? [];
    record(
        ($data['navEntryRemoved'] ?? true) === false,
        'Missing nav: navEntryRemoved = false',
        $errors, $passed, $failed
    );
}

record(
    !file_exists($noNavTestPath),
    'Missing nav: page file deleted',
    $errors, $passed, $failed
);

// Restore nav.php
file_put_contents($navFilePath, $navBackup);


// ═══════════════════════════════════════════
//  7. ROLLBACK — forced nav failure
// ═══════════════════════════════════════════

echo "\n--- 7. Rollback on forced nav failure ---\n";

// Restore canonical nav
file_put_contents($navFilePath, $navContentOriginal);

// Create a deletable page for rollback testing
$rbSlug1 = 'rollback-nav-test';
$rbFile1 = $rbSlug1 . '.php';
$rbPath1 = $tempPreview . '/' . $rbFile1;
file_put_contents($rbPath1, '<?php $title = "Rollback Nav Test"; ?><h1>Rollback Nav Test</h1>');

$tempDb7 = new \SQLite3($tempDbPath);
$now7 = date('Y-m-d H:i:s');
$tempDb7->exec("INSERT INTO pages (slug, title, file_path, page_type, is_homepage, created_at, updated_at) VALUES ('{$rbSlug1}', 'Rollback Nav Test', '{$rbFile1}', 'page', 0, '{$now7}', '{$now7}')");
$tempDb7->close();

$preRollbackContent = file_get_contents($rbPath1);

$r = callEndpoint('POST', '/site-control/page-delete', ['pageId' => 'page:' . $rbFile1], '--fail-delete-nav');

record($r['httpCode'] === 500, 'Rollback nav: forced failure → 500', $errors, $passed, $failed);
record(
    ($r['response']['ok'] ?? false) === false,
    'Rollback nav: response.ok = false',
    $errors, $passed, $failed
);

// File should be restored from snapshot
record(
    file_exists($rbPath1),
    'Rollback nav: page file restored',
    $errors, $passed, $failed
);

$postRollbackContent = file_get_contents($rbPath1);
record(
    $postRollbackContent === $preRollbackContent,
    'Rollback nav: page file content matches pre-mutation',
    $errors, $passed, $failed
);

// DB row should still exist
$rbDbCheck1 = dbQueryOne($tempDbPath, "SELECT COUNT(*) as c FROM pages WHERE slug = '{$rbSlug1}'");
record(
    (int) ($rbDbCheck1['c'] ?? 0) === 1,
    'Rollback nav: DB row still exists',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  8. ROLLBACK — forced DB failure
// ═══════════════════════════════════════════

echo "\n--- 8. Rollback on forced DB failure ---\n";

// Re-create canonical nav with the page entry
$canonNavWithRb = NavLinksParser::serialize([
    ['label' => 'Home',             'href' => '/'],
    ['label' => 'Rollback Nav Test', 'href' => '/' . $rbSlug1],
]);
$canonNavFile = "<?php\n" . $canonNavWithRb . "\n?>\n<nav><?php foreach (\$navLinks as \$link): ?><a href=\"<?= \$link['href'] ?>\"><?= \$link['label'] ?></a><?php endforeach; ?></nav>";
file_put_contents($navFilePath, $canonNavFile);

$navBeforeDbFail = file_get_contents($navFilePath);

$r = callEndpoint('POST', '/site-control/page-delete', ['pageId' => 'page:' . $rbFile1], '--fail-delete-db');

record($r['httpCode'] === 500, 'Rollback DB: forced failure → 500', $errors, $passed, $failed);
record(
    ($r['response']['ok'] ?? false) === false,
    'Rollback DB: response.ok = false',
    $errors, $passed, $failed
);

// File should be restored
record(
    file_exists($rbPath1),
    'Rollback DB: page file restored',
    $errors, $passed, $failed
);

// Nav should be restored (the nav write happened but DB failed, so snapshot restores nav too)
$navAfterDbFail = file_get_contents($navFilePath);
record(
    $navAfterDbFail === $navBeforeDbFail,
    'Rollback DB: nav file restored to pre-mutation',
    $errors, $passed, $failed
);

// DB row should still exist
$rbDbCheck2 = dbQueryOne($tempDbPath, "SELECT COUNT(*) as c FROM pages WHERE slug = '{$rbSlug1}'");
record(
    (int) ($rbDbCheck2['c'] ?? 0) === 1,
    'Rollback DB: DB row still exists',
    $errors, $passed, $failed
);


// ═══════════════════════════════════════════
//  9. BROKEN REFERENCES — reported in response
// ═══════════════════════════════════════════

echo "\n--- 9. Broken references ---\n";

// The rollback test page has no inbound links, so affectedReferences should be empty
// We still verify response shape
// Use the page that survived the rollback tests
file_put_contents($navFilePath, $navContentOriginal);

$r = callEndpoint('POST', '/site-control/page-delete', ['pageId' => 'page:' . $rbFile1]);

record($r['httpCode'] === 200, 'Broken refs: → 200', $errors, $passed, $failed);

if (($r['response']['ok'] ?? false) === true) {
    $data = $r['response']['data'] ?? [];

    record(
        is_array($data['affectedReferences'] ?? null),
        'Affected refs: affectedReferences is array',
        $errors, $passed, $failed
    );
    record(
        is_int($data['totalAffectedReferences'] ?? null),
        'Affected refs: totalAffectedReferences is int',
        $errors, $passed, $failed
    );

    // For a synthetic test page with no links, should be 0
    record(
        ($data['totalAffectedReferences'] ?? -1) === 0,
        'Affected refs: totalAffectedReferences = 0 for isolated page',
        $errors, $passed, $failed
    );

    // New fields from reference cleanup
    record(
        array_key_exists('referencesCleanedUp', $data),
        'Broken refs: referencesCleanedUp field present',
        $errors, $passed, $failed
    );
    record(
        array_key_exists('cleanedUpFiles', $data),
        'Broken refs: cleanedUpFiles field present',
        $errors, $passed, $failed
    );
}


// ═══════════════════════════════════════════
//  9b. REFERENCE CLEANUP — cross-references actually cleaned
// ═══════════════════════════════════════════

echo "\n--- 9b. Reference cleanup (cross-references) ---\n";

// Create a target page that will be deleted
$refTargetSlug = 'ref-target-cleanup';
$refTargetFile = $refTargetSlug . '.php';
$refTargetPath = $tempPreview . '/' . $refTargetFile;
$refTargetPageId = 'page:' . $refTargetFile;
file_put_contents($refTargetPath, '<?php $page = [\'title\' => \'Ref Target\', \'slug\' => \'' . $refTargetSlug . '\']; ?><main><h1>Ref Target</h1></main>');

$tempDb9b = new \SQLite3($tempDbPath);
$now9b = date('Y-m-d H:i:s');
$tempDb9b->exec("INSERT INTO pages (slug, title, file_path, page_type, is_homepage, created_at, updated_at) VALUES ('{$refTargetSlug}', 'Ref Target', '{$refTargetFile}', 'page', 0, '{$now9b}', '{$now9b}')");
$tempDb9b->close();

// Create a "referrer" page that links to the target
$refSourceSlug = 'ref-source-cleanup';
$refSourceFile = $refSourceSlug . '.php';
$refSourcePath = $tempPreview . '/' . $refSourceFile;
$refSourceContent = '<?php $page = [\'title\' => \'Ref Source\', \'slug\' => \'' . $refSourceSlug . '\']; ?>'
    . '<main><h1>Source Page</h1>'
    . '<p>Visit our <a href="/' . $refTargetSlug . '" class="btn">Ref Target</a> page for more info.</p>'
    . '<p>Also see <a href="/' . $refTargetSlug . '">another link</a> here.</p>'
    . '</main>';
file_put_contents($refSourcePath, $refSourceContent);

$tempDb9b2 = new \SQLite3($tempDbPath);
$tempDb9b2->exec("INSERT INTO pages (slug, title, file_path, page_type, is_homepage, created_at, updated_at) VALUES ('{$refSourceSlug}', 'Ref Source', '{$refSourceFile}', 'page', 0, '{$now9b}', '{$now9b}')");
$tempDb9b2->close();

// Create a partial that has a nav item pointing to the target
$partialDir = $tempPreview . '/_partials';
if (!is_dir($partialDir)) mkdir($partialDir, 0755, true);
$footerPartialPath = $partialDir . '/footer.php';
$footerOriginal = file_exists($footerPartialPath) ? file_get_contents($footerPartialPath) : null;
$footerContent = '<footer><ul>'
    . '<li><a href="/">Home</a></li>'
    . '<li><a href="/' . $refTargetSlug . '">Ref Target</a></li>'
    . '<li><a href="/' . $refSourceSlug . '">Ref Source</a></li>'
    . '</ul></footer>';
file_put_contents($footerPartialPath, $footerContent);

// Set up canonical nav
$canonNav9b = NavLinksParser::serialize([
    ['label' => 'Home', 'href' => '/'],
    ['label' => 'Ref Target', 'href' => '/' . $refTargetSlug],
    ['label' => 'Ref Source', 'href' => '/' . $refSourceSlug],
]);
$canonNav9bFile = "<?php\n" . $canonNav9b . "\n?>\n<nav><?php foreach (\$navLinks as \$link): ?><a href=\"<?= \$link['href'] ?>\"><?= \$link['label'] ?></a><?php endforeach; ?></nav>";
file_put_contents($navFilePath, $canonNav9bFile);

// Now delete the target page
$r = callEndpoint('POST', '/site-control/page-delete', ['pageId' => $refTargetPageId]);

record($r['httpCode'] === 200, 'Ref cleanup: → 200', $errors, $passed, $failed);

if (($r['response']['ok'] ?? false) === true) {
    $data = $r['response']['data'] ?? [];

    // Response should report cleanup
    record(
        ($data['referencesCleanedUp'] ?? 0) > 0,
        'Ref cleanup: referencesCleanedUp > 0',
        $errors, $passed, $failed
    );
    record(
        is_array($data['cleanedUpFiles'] ?? null) && count($data['cleanedUpFiles']) > 0,
        'Ref cleanup: cleanedUpFiles is non-empty array',
        $errors, $passed, $failed
    );

    // Verify the SOURCE PAGE was cleaned: <a> tags should be neutralized (href set to #)
    $sourceAfter = file_get_contents($refSourcePath);

    // The link text should still exist
    record(
        str_contains($sourceAfter, 'Ref Target'),
        'Ref cleanup: link text preserved in source page',
        $errors, $passed, $failed
    );

    // The <a> element should still exist (classes, attributes preserved)
    record(
        str_contains($sourceAfter, 'class="btn"'),
        'Ref cleanup: btn class preserved on neutralized link',
        $errors, $passed, $failed
    );

    // The href should now be # instead of the old slug
    record(
        !str_contains($sourceAfter, 'href="/' . $refTargetSlug . '"'),
        'Ref cleanup: dead href removed from source page',
        $errors, $passed, $failed
    );
    record(
        str_contains($sourceAfter, 'href="#"'),
        'Ref cleanup: href replaced with # in source page',
        $errors, $passed, $failed
    );

    // Verify the FOOTER PARTIAL was cleaned: entire <li> should be removed
    $footerAfter = file_get_contents($footerPartialPath);

    // The <li> for the target should be gone
    record(
        !str_contains($footerAfter, 'href="/' . $refTargetSlug . '"'),
        'Ref cleanup: dead href removed from footer partial',
        $errors, $passed, $failed
    );

    // The other <li> entries should remain
    record(
        str_contains($footerAfter, 'href="/"') && str_contains($footerAfter, 'href="/' . $refSourceSlug . '"'),
        'Ref cleanup: other footer links preserved',
        $errors, $passed, $failed
    );
}

// Clean up the synthetic referrer page + restore footer
$tempDb9bClean = new \SQLite3($tempDbPath);
$tempDb9bClean->exec("DELETE FROM pages WHERE slug = '{$refSourceSlug}'");
$tempDb9bClean->close();
if (file_exists($refSourcePath)) @unlink($refSourcePath);
if ($footerOriginal !== null) {
    file_put_contents($footerPartialPath, $footerOriginal);
}


// ═══════════════════════════════════════════
//  9c. CUSTOM REPLACEMENT HREF
// ═══════════════════════════════════════════

echo "\n--- 9c. Custom replacementHref ---\n";

// Create a new target page and source page with a link
$customRefSlug = 'custom-href-target-' . time();
$customRefFile = $customRefSlug . '.php';
$now9c = date('Y-m-d H:i:s');

$tempDb9c = new \SQLite3($tempDbPath);
$tempDb9c->exec("INSERT INTO pages (slug, title, file_path, page_type, is_homepage, created_at, updated_at) VALUES ('{$customRefSlug}', 'Custom Target', '{$customRefFile}', 'page', 0, '{$now9c}', '{$now9c}')");
$tempDb9c->close();
file_put_contents($tempPreview . '/' . $customRefFile, '<?php $page = [\'title\' => \'Custom Target\', \'slug\' => \'' . $customRefSlug . '\']; ?><main><h1>Custom Target</h1></main>');

// Create source with a btn-styled link
$customSourceSlug = 'custom-source-' . time();
$customSourceFile = $customSourceSlug . '.php';
$customSourcePath = $tempPreview . '/' . $customSourceFile;
file_put_contents($customSourcePath, '<?php $page = [\'title\' => \'Custom Source\', \'slug\' => \'' . $customSourceSlug . '\']; ?><main><a href="/' . $customRefSlug . '" class="cta-btn">Get in touch</a></main>');

$tempDb9c2 = new \SQLite3($tempDbPath);
$tempDb9c2->exec("INSERT INTO pages (slug, title, file_path, page_type, is_homepage, created_at, updated_at) VALUES ('{$customSourceSlug}', 'Custom Source', '{$customSourceFile}', 'page', 0, '{$now9c}', '{$now9c}')");
$tempDb9c2->close();

// Delete the target with custom replacementHref
$del9c = callEndpoint('POST', '/site-control/page-delete', [
    'pageId' => 'page:' . $customRefFile,
    'replacementHref' => '/404',
]);

record($del9c['httpCode'] === 200, 'Custom replacementHref: → 200', $errors, $passed, $failed);

if (($del9c['response']['ok'] ?? false) === true) {
    $data9c = $del9c['response']['data'] ?? [];

    // Response should echo back the replacementHref
    record(
        ($data9c['replacementHref'] ?? '') === '/404',
        'Custom replacementHref: response echoes /404',
        $errors, $passed, $failed
    );

    // Source page should now have href="/404" instead of the old slug
    $customSourceAfter = file_get_contents($customSourcePath);
    record(
        str_contains($customSourceAfter, 'href="/404"'),
        'Custom replacementHref: link neutralized to /404',
        $errors, $passed, $failed
    );
    record(
        str_contains($customSourceAfter, 'class="cta-btn"'),
        'Custom replacementHref: cta-btn class preserved',
        $errors, $passed, $failed
    );
    record(
        !str_contains($customSourceAfter, 'href="/' . $customRefSlug . '"'),
        'Custom replacementHref: old slug href gone',
        $errors, $passed, $failed
    );
}

// Clean up
$tempDb9cClean = new \SQLite3($tempDbPath);
$tempDb9cClean->exec("DELETE FROM pages WHERE slug = '{$customSourceSlug}'");
$tempDb9cClean->close();
if (file_exists($customSourcePath)) @unlink($customSourcePath);


// ═══════════════════════════════════════════
//  9d. REPLACEMENT HREF VALIDATION
// ═══════════════════════════════════════════

echo "\n--- 9d. replacementHref validation ---\n";

$dangerousValues = [
    'javascript:alert(1)' => 'javascript scheme blocked',
    'data:text/html,<h1>x</h1>' => 'data scheme blocked',
    'vbscript:MsgBox' => 'vbscript scheme blocked',
    '//evil.com' => 'protocol-relative blocked',
    '/path"onmouseover="alert(1)' => 'quote in path blocked',
    "x'onclick='alert(1)" => 'single quote blocked',
];

foreach ($dangerousValues as $dangerous => $label) {
    $r9d = callEndpoint('POST', '/site-control/page-delete', [
        'pageId' => 'page:about.php',
        'replacementHref' => $dangerous,
    ]);
    record(
        $r9d['httpCode'] === 400 && ($r9d['response']['error']['code'] ?? '') === 'invalid_replacement_href',
        "Href validation: {$label}",
        $errors, $passed, $failed
    );
}


// ═══════════════════════════════════════════
//  10. NO SNAPSHOTS ON VALIDATION REJECTIONS
// ═══════════════════════════════════════════

echo "\n--- 10. Snapshot discipline ---\n";

$snapshotCountFinal = getSnapshotCount($tempDbPath);

// We expect snapshots only for actual mutation attempts (tests 2, 3, 5, 6, 7, 8, 9)
// not for validation rejections (tests 1, 4)
// This is verified implicitly by test 1 above, but we double-check:
// The snapshot count should have increased by the number of mutation attempts, not validation rejects
record(
    $snapshotCountFinal > $snapshotCountBefore,
    'Snapshot discipline: snapshots created for mutation attempts',
    $errors, $passed, $failed
);


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
//  DB / Filesystem Helpers
// ═══════════════════════════════════════════

function getSnapshotCount(string $dbPath): int
{
    $db = new \SQLite3($dbPath, SQLITE3_OPEN_READONLY);
    $count = (int) $db->querySingle("SELECT COUNT(*) FROM snapshots");
    $db->close();
    return $count;
}

function dbQueryOne(string $dbPath, string $sql): ?array
{
    $db = new \SQLite3($dbPath, SQLITE3_OPEN_READONLY);
    $result = $db->querySingle($sql, true);
    $db->close();
    return is_array($result) ? $result : null;
}

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
