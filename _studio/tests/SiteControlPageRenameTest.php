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

require_once __DIR__.'/helpers/SiteControlFixture.php';
$tempDir = sys_get_temp_dir().'/vs-control-PageRename-'.bin2hex(random_bytes(8));
$tempDbPath = $tempDir.'/studio.db';
$tempPreview = $tempDir.'/preview';
$tempAssets = $tempDir.'/published/assets';
$tempSnaps = $tempDir.'/snapshots';
[$db,$fileManager] = createSiteControlFixture($tempDir);
$tempDir = realpath($tempDir);

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

$revisionCountBefore = (int) $db->queryOne("SELECT COUNT(*) as c FROM revisions")['c'];

// Missing pageId
$r = callEndpoint('POST', '/site-control/page-rename', ['newTitle' => 'Foo']);
record($r['httpCode'] === 422, 'Validation: missing pageId → 422', $errors, $passed, $failed);
record(
    ($r['response']['error']['code'] ?? '') === 'invalid_schema',
    'Validation: missing pageId error code',
    $errors, $passed, $failed
);

// Empty title
$r = callEndpoint('POST', '/site-control/page-rename', ['pageId' => $testPageId, 'newTitle' => '']);
record($r['httpCode'] === 422, 'Validation: empty title → 422', $errors, $passed, $failed);
record(
    ($r['response']['error']['code'] ?? '') === 'invalid_schema',
    'Validation: empty title error code',
    $errors, $passed, $failed
);

// Whitespace-only title
$r = callEndpoint('POST', '/site-control/page-rename', ['pageId' => $testPageId, 'newTitle' => '   ']);
record($r['httpCode'] === 422, 'Validation: whitespace title → 422', $errors, $passed, $failed);

// Nonexistent page
$r = callEndpoint('POST', '/site-control/page-rename', ['pageId' => 'page:nonexistent-xyz.php', 'newTitle' => 'Foo']);
record($r['httpCode'] === 422, 'Validation: nonexistent page → 422', $errors, $passed, $failed);
record(
    ($r['response']['error']['code'] ?? '') === 'invalid_path',
    'Validation: nonexistent page error code',
    $errors, $passed, $failed
);

// Same title (no-op)
$r = callEndpoint('POST', '/site-control/page-rename', ['pageId' => $testPageId, 'newTitle' => $testTitle]);
record($r['httpCode'] === 422, 'Validation: same title → 422', $errors, $passed, $failed);
record(
    ($r['response']['error']['code'] ?? '') === 'invalid_schema',
    'Validation: same title error code',
    $errors, $passed, $failed
);

// No revisions created on validation errors
// Re-read from temp DB since validation calls run in subprocesses
$tempDbCheck = new \SQLite3($tempDbPath, SQLITE3_OPEN_READONLY);
$revisionCountAfter = (int) $tempDbCheck->querySingle("SELECT COUNT(*) FROM revisions");
$tempDbCheck->close();
record(
    $revisionCountAfter === $revisionCountBefore,
    'Validation: no revisions created for rejected requests',
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
    record(siteControlRetainedOperation($tempDbPath,$data), 'Happy path: retained operation and revision present', $errors, $passed, $failed);
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

record($r['httpCode'] === 409, 'Rollback: forced failure → 409', $errors, $passed, $failed);
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
$missingNavBefore = $db->queryOne('SELECT id,slug,title,file_path,is_homepage,nav_label FROM pages WHERE file_path=?',[$testFilePath]);
$missingNavExpected = $missingNavBefore;
$missingNavExpected['title'] = $missingNavTitle;
$missingNavSource = str_replace($preRollbackTitle,$missingNavTitle,$preRollbackContent,$titleOccurrences);
record($titleOccurrences===1,'Missing nav: fixture has one exact title metadata target',$errors,$passed,$failed);
$missingNavState = siteControlState($tempDbPath);
$missingNavRequest = siteControlRequest($tempDbPath,[
    'pageId'   => $testPageId,
    'newTitle' => $missingNavTitle,
]);
$r = callEndpoint('POST', '/site-control/page-rename', $missingNavRequest);

record($r['httpCode']===200&&($r['response']['ok']??false)===true,'Missing nav: title-only rename succeeds',$errors,$passed,$failed);
record(file_get_contents($tempPreview.'/'.$testFilePath)===$missingNavSource,'Missing nav: only exact title metadata changes in page source',$errors,$passed,$failed);
record($db->queryOne('SELECT id,slug,title,file_path,is_homepage,nav_label FROM pages WHERE file_path=?',[$testFilePath])===$missingNavExpected,'Missing nav: page projection changes only the title',$errors,$passed,$failed);
record(!file_exists($navFilePath),'Missing nav: rename does not recreate navigation',$errors,$passed,$failed);

if (($r['response']['ok'] ?? false) === true) {
    $data = $r['response']['data'] ?? [];
    record($data['navStatus'] === 'missing', 'Missing nav: navStatus = missing', $errors, $passed, $failed);
    record($data['navLabelUpdated'] === false, 'Missing nav: navLabelUpdated = false', $errors, $passed, $failed);
    record(($data['oldTitle']??null)===$preRollbackTitle&&($data['newTitle']??null)===$missingNavTitle&&($data['pageSlug']??null)===$testSlug,'Missing nav: response retains exact old/new titles and unchanged slug',$errors,$passed,$failed);
    record(siteControlRetainedOperation($tempDbPath,$data),'Missing nav: success has a sealed retained operation and attributed revision',$errors,$passed,$failed);
    $reviewRow=$db->queryOne('SELECT manifest_json,payload_json FROM agent_change_sets WHERE id=?',[$data['operation']['result']['change_set_id']]);
    $manifest=json_decode($reviewRow['manifest_json'],true,64,JSON_THROW_ON_ERROR);
    record(($manifest['before'][$testFilePath]??null)===hash('sha256',$preRollbackContent)&&($manifest['after'][$testFilePath]??null)===hash('sha256',$missingNavSource)&&!array_key_exists('_partials/nav.php',$manifest['before'])&&!array_key_exists('_partials/nav.php',$manifest['after']),'Missing nav: retained manifest binds exact title bytes and absent navigation',$errors,$passed,$failed);
    $reviewPayload=json_decode($reviewRow['payload_json'],true,64,JSON_THROW_ON_ERROR);
    $warnings=array_filter($reviewPayload['validation']['warnings']??[],fn($warning)=>($warning['code']??null)==='pre_existing_dependency'&&($warning['path']??null)==='_partials/nav.php');
    record(count($warnings)>0,'Missing nav: retained review reports the pre-existing missing partial warning',$errors,$passed,$failed);
    $missingNavAfter=siteControlState($tempDbPath);
    record(count($missingNavAfter['revisions'])===count($missingNavState['revisions'])+1&&$missingNavAfter['site_workspace_state'][0]['draft_version']===$missingNavState['site_workspace_state'][0]['draft_version']+1,'Missing nav: success advances revision and draft version exactly once',$errors,$passed,$failed);
    $missingNavReplay=callEndpoint('POST','/site-control/page-rename',$missingNavRequest);
    record($missingNavReplay===$r&&siteControlState($tempDbPath)===$missingNavAfter,'Missing nav: identical retry retains its result without another mutation',$errors,$passed,$failed);
    record(!file_exists($navFilePath),'Missing nav: replay also preserves the absent navigation file',$errors,$passed,$failed);
}

// Restore nav.php
file_put_contents($navFilePath, $navBackup);


// A custom source label wins even if the registry still carries the old title.
$customNav=NavLinksParser::parse(file_get_contents($navFilePath));
foreach($customNav as &$entry)if($entry['href']==='/'.$testSlug)$entry['label']='Meet the crew';unset($entry);
file_put_contents($navFilePath,NavLinksParser::replaceNavBlock(file_get_contents($navFilePath),NavLinksParser::serialize($customNav)));
$db->update('pages',['nav_label'=>$preRollbackTitle],'file_path=?',[$testFilePath]);
$customRequest=siteControlRequest($tempDbPath,['pageId'=>$testPageId,'newTitle'=>'Preserve custom navigation']);
$customRename=callEndpoint('POST','/site-control/page-rename',$customRequest);
record($customRename['httpCode']===200,'Custom label: rename succeeds',$errors,$passed,$failed);
$customAfter=NavLinksParser::parse(file_get_contents($navFilePath));
$customEntry=array_values(array_filter($customAfter,fn($entry)=>$entry['href']==='/'.$testSlug))[0];
record($customEntry['label']==='Meet the crew','Custom label: canonical source label preserved despite stale registry',$errors,$passed,$failed);
$versionAfter=$db->queryOne('SELECT draft_version FROM site_workspace_state WHERE id=1')['draft_version'];
$replay=callEndpoint('POST','/site-control/page-rename',$customRequest);
record($replay===$customRename&&$versionAfter===$db->queryOne('SELECT draft_version FROM site_workspace_state WHERE id=1')['draft_version'],'Replay: identical request retains exact result without another revision',$errors,$passed,$failed);
$conflict=callEndpoint('POST','/site-control/page-rename',array_replace($customRequest,['newTitle'=>'Different intent']));
record($conflict['httpCode']===409&&($conflict['response']['error']['code']??'')==='idempotency_conflict','Replay: changed intent cannot reuse identity',$errors,$passed,$failed);
$stale=callEndpoint('POST','/site-control/page-rename',array_replace($customRequest,['operation_id'=>'stale_'.bin2hex(random_bytes(12)),'newTitle'=>'Stale input']));
record($stale['httpCode']===409&&($stale['response']['error']['code']??'')==='content_conflict','Version: old displayed draft rejects a new request',$errors,$passed,$failed);

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
    $stateBefore=siteControlState($tempDbPath);
    if ($method==='POST') $body=siteControlRequest($tempDbPath,$body);

    $helperPath = __DIR__ . '/helpers/call-nav-endpoint.php';
    $jsonBody = json_encode($body, JSON_UNESCAPED_SLASHES);

    $descriptorSpec = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $cmd = sprintf(
        '%s %s %s %s %s %s %s%s',
        escapeshellarg(PHP_BINARY),
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

    siteControlAssertInvariant($tempDbPath,$stateBefore,$parsed,$method,$failMode);
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
