<?php

declare(strict_types=1);

/**
 * Site Control API Endpoints — Mutations
 *
 * POST /site-control/url-rename       — Apply a URL rename (Phase 2A)
 * GET  /site-control/nav-preflight    — Nav reorder eligibility check (Phase 2B)
 * POST /site-control/nav-reorder      — Apply a nav reorder/reparent (Phase 2B)
 * POST /site-control/page-rename      — Apply a page title rename (Phase 2B.5)
 * POST /site-control/page-delete      — Delete a page (Phase 2C)
 * POST /site-control/structural-move  — Structural move (Phase 4)
 */

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\NavLinksParser;
use VoxelSite\PageService;

$user   = $_REQUEST['_user'] ?? null;
$method = $_REQUEST['_route_method'];
$path   = $_REQUEST['_route_path'];

// ── Role guard: owner and editor only ──
if (($user['role'] ?? '') === 'viewer') {
    jsonResponse(['ok' => false, 'error' => [
        'code'    => 'forbidden',
        'message' => 'Site Control mutations require editor or owner access.',
    ]], 403);
    return;
}

// ═══════════════════════════════════════════
//  POST /site-control/url-rename
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/site-control/url-rename') {
    $body = getJsonBody();

    $routeId = trim($body['routeId'] ?? '');
    $newPath = trim($body['newPath'] ?? '');

    // ── Validate required fields ──
    if ($routeId === '' || $newPath === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Both routeId and newPath are required.',
        ]], 400);
        return;
    }

    $db          = Database::getInstance();
    $fileManager = new FileManager($db);
    $pageService = new PageService($db, $fileManager);

    // ── Resolve routeId → served page ──
    $resolved = resolveRouteToPage($routeId, $db);

    if ($resolved === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Route '{$routeId}' could not be resolved to a page.",
        ]], 404);
        return;
    }

    $oldSlug     = $resolved['slug'];
    $oldPath     = $resolved['path'];
    $oldFilePath = $resolved['file_path'];
    $isHomepage  = $resolved['is_homepage'];
    $oldPageId   = 'page:' . $oldFilePath;

    // ── Pre-write validation (no snapshot I/O for bad input) ──

    // Homepage blocked
    if ($isHomepage) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'homepage_blocked',
            'message' => 'Homepage URL cannot be renamed. The homepage must remain at "/".',
        ]], 422);
        return;
    }

    // Normalize new path → slug (Phase 2A: single-segment only)
    $newSlug = normalizeSiteControlPath($newPath);

    if ($newSlug === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'nested_path',
            'message' => 'Nested URL paths (e.g. /services/web-design) are not supported in this version. Use a single-segment path.',
        ]], 422);
        return;
    }

    if ($newSlug === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'invalid_path',
            'message' => 'The new URL path is invalid. Use lowercase letters, numbers, and hyphens.',
        ]], 400);
        return;
    }

    // Same as current
    if ($newSlug === $oldSlug) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'same_path',
            'message' => 'The new URL is the same as the current URL.',
        ]], 422);
        return;
    }

    // Conflict check
    $existing = $db->queryOne('SELECT id FROM pages WHERE slug = ?', [$newSlug]);
    if ($existing) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'conflict',
            'message' => "The URL \"/{$newSlug}\" is already in use by another page.",
        ]], 409);
        return;
    }

    // ── Create pre-mutation snapshot (only after validation passes) ──
    $snapshotResult = createSiteControlSnapshot(
        $db,
        'Pre-rename',
        "Auto-snapshot before renaming /{$oldSlug} to /{$newSlug}"
    );

    if (!$snapshotResult['ok']) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'snapshot_failed',
            'message' => 'Could not create safety snapshot: ' . ($snapshotResult['error'] ?? 'unknown error'),
        ]], 500);
        return;
    }

    $snapshotId = $snapshotResult['snapshot']['id'] ?? null;

    // ── Delegate rename to PageService::updatePage() ──
    try {
        $result = $pageService->updatePage($oldSlug, ['slug' => $newSlug], 'site-control');
    } catch (\Throwable $e) {
        // Write failed — attempt automatic restore
        if ($snapshotId !== null) {
            $restoreResult = restoreSiteControlSnapshot($db, $snapshotId);
            if (!$restoreResult['ok']) {
                jsonResponse(['ok' => false, 'error' => [
                    'code'    => 'restore_failed',
                    'message' => 'URL rename failed and automatic restore also failed. Manual intervention required. '
                               . 'Original error: ' . $e->getMessage()
                               . ' Restore error: ' . ($restoreResult['error'] ?? 'unknown'),
                ]], 500);
                return;
            }
        }

        // Determine appropriate HTTP status
        $httpStatus = 500;
        $errorCode  = 'write_failed';
        if ($e->getCode() === 404) {
            $httpStatus = 404;
            $errorCode  = 'not_found';
        } elseif ($e->getCode() === 409) {
            $httpStatus = 409;
            $errorCode  = 'conflict';
        } elseif ($e->getCode() === 422) {
            $httpStatus = 422;
            $errorCode  = 'validation';
        }

        jsonResponse(['ok' => false, 'error' => [
            'code'    => $errorCode,
            'message' => $e->getMessage(),
        ]], $httpStatus);
        return;
    }

    // ── Build truthful apply response ──
    $newFilePath      = $result['new_file_path'] ?? ($newSlug . '.php');
    $newPageId        = 'page:' . $newFilePath;
    $updatedFiles     = $result['updated_files'] ?? [];
    $refUpdatedFiles  = $result['reference_updated_files'] ?? [];
    $suggestedPrompt  = $result['suggested_prompt'] ?? null;

    jsonResponse(['ok' => true, 'data' => [
        'oldPath'         => $oldPath,
        'newPath'         => '/' . $newSlug,
        'oldPageId'       => $oldPageId,
        'newPageId'       => $newPageId,
        'pageSlug'        => $newSlug,
        'updatedFiles'    => $updatedFiles,
        'snapshotId'      => $snapshotId,
        'referenceCount'  => count($refUpdatedFiles),
        'suggestedPrompt' => $suggestedPrompt,
        'message'         => "URL updated from {$oldPath} to /{$newSlug}.",
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  GET /site-control/nav-preflight
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/site-control/nav-preflight') {
    $pageId = trim($_GET['pageId'] ?? '');

    if ($pageId === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'missing_field',
            'message' => 'pageId is required.',
        ]], 400);
        return;
    }

    $db = Database::getInstance();

    // Resolve pageId (format: "page:filename.php") to page record
    $filePath = str_starts_with($pageId, 'page:') ? substr($pageId, 5) : $pageId;
    $page = $db->queryOne('SELECT slug, file_path, is_homepage FROM pages WHERE file_path = ?', [$filePath]);

    if (!$page) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'page_not_found',
            'message' => "Page '{$pageId}' not found.",
        ]], 404);
        return;
    }

    $isHomepage = (bool) ($page['is_homepage'] ?? false);
    $slug = (string) $page['slug'];
    $pageHref = $isHomepage ? '/' : '/' . $slug;

    // Read nav.php
    $previewDir = getenv('VS_TEST_PREVIEW_DIR') ?: dirname(__DIR__, 2) . '/preview';
    $navFilePath = $previewDir . '/_partials/nav.php';

    if (!file_exists($navFilePath)) {
        jsonResponse(['ok' => true, 'data' => [
            'navStatus'       => 'nav_missing',
            'isInNav'         => false,
            'isHomepage'      => $isHomepage,
            'currentPosition' => null,
            'navTree'         => [],
            'hasHomeEntry'    => false,
        ]]);
        return;
    }

    $navContent = file_get_contents($navFilePath);
    $navLinks = NavLinksParser::parse($navContent);

    if ($navLinks !== null) {
        // Canonical nav found
        $isInNav = NavLinksParser::isInNav($navLinks, $pageHref);
        $currentPosition = $isInNav ? NavLinksParser::findPosition($navLinks, $pageHref) : null;
        $movableTree = NavLinksParser::getMovableTree($navLinks);
        $hasHome = NavLinksParser::hasHomeEntry($navLinks);

        jsonResponse(['ok' => true, 'data' => [
            'navStatus'       => 'canonical',
            'isInNav'         => $isInNav,
            'isHomepage'      => $isHomepage,
            'currentPosition' => $currentPosition,
            'navTree'         => $movableTree,
            'hasHomeEntry'    => $hasHome,
        ]]);
        return;
    }

    // Not canonical — distinguish missing from malformed
    if (NavLinksParser::hasNavLinksBlock($navContent)) {
        // $navLinks block exists but is malformed
        jsonResponse(['ok' => true, 'data' => [
            'navStatus'       => 'nav_parse_error',
            'isInNav'         => false,
            'isHomepage'      => $isHomepage,
            'currentPosition' => null,
            'navTree'         => [],
            'hasHomeEntry'    => false,
        ]]);
        return;
    }

    // No canonical block - check if legacy is extractable
    $layoutError = NavLinksParser::checkLayoutCompatibility($navContent);

    if ($layoutError !== null) {
        jsonResponse(['ok' => true, 'data' => [
            'navStatus'       => 'unsupported_layout',
            'isInNav'         => false,
            'isHomepage'      => $isHomepage,
            'currentPosition' => null,
            'navTree'         => [],
            'hasHomeEntry'    => false,
        ]]);
        return;
    }

    // Legacy but extractable - try to extract links
    $extractedLinks = NavLinksParser::extractFromLegacyNav($navContent);

    if ($extractedLinks === null) {
        jsonResponse(['ok' => true, 'data' => [
            'navStatus'       => 'unsupported_layout',
            'isInNav'         => false,
            'isHomepage'      => $isHomepage,
            'currentPosition' => null,
            'navTree'         => [],
            'hasHomeEntry'    => false,
        ]]);
        return;
    }

    // Legacy extractable
    $isInNav = NavLinksParser::isInNav($extractedLinks, $pageHref);
    $currentPosition = $isInNav ? NavLinksParser::findPosition($extractedLinks, $pageHref) : null;
    $movableTree = NavLinksParser::getMovableTree($extractedLinks);
    $hasHome = NavLinksParser::hasHomeEntry($extractedLinks);

    jsonResponse(['ok' => true, 'data' => [
        'navStatus'       => 'needs_normalization',
        'isInNav'         => $isInNav,
        'isHomepage'      => $isHomepage,
        'currentPosition' => $currentPosition,
        'navTree'         => $movableTree,
        'hasHomeEntry'    => $hasHome,
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /site-control/nav-reorder
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/site-control/nav-reorder') {
    $body = getJsonBody();

    $pageId          = trim($body['pageId'] ?? '');
    $targetParentHref = isset($body['targetParentHref']) ? $body['targetParentHref'] : null;
    $targetIndex     = $body['targetIndex'] ?? null;

    // ── Validate required fields ──
    if ($pageId === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'missing_field',
            'message' => 'pageId is required.',
        ]], 400);
        return;
    }

    if (!is_int($targetIndex) && !(is_string($targetIndex) && ctype_digit($targetIndex))) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'missing_field',
            'message' => 'targetIndex must be an integer.',
        ]], 400);
        return;
    }
    $targetIndex = (int) $targetIndex;

    $db = Database::getInstance();

    // Resolve pageId to page record
    $filePath = str_starts_with($pageId, 'page:') ? substr($pageId, 5) : $pageId;
    $page = $db->queryOne('SELECT slug, file_path, is_homepage FROM pages WHERE file_path = ?', [$filePath]);

    if (!$page) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'page_not_found',
            'message' => "Page '{$pageId}' not found.",
        ]], 404);
        return;
    }

    $isHomepage = (bool) ($page['is_homepage'] ?? false);
    $slug = (string) $page['slug'];
    $pageHref = $isHomepage ? '/' : '/' . $slug;

    // ── Pre-write validation (no snapshot I/O for bad input) ──

    // Homepage locked
    if ($isHomepage) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'homepage_locked',
            'message' => 'Homepage position is fixed and cannot be moved.',
        ]], 422);
        return;
    }

    // Read nav.php
    $previewDir = getenv('VS_TEST_PREVIEW_DIR') ?: dirname(__DIR__, 2) . '/preview';
    $navFilePath = $previewDir . '/_partials/nav.php';

    if (!file_exists($navFilePath)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'nav_file_missing',
            'message' => 'Navigation file (_partials/nav.php) does not exist.',
        ]], 404);
        return;
    }

    $navContent = file_get_contents($navFilePath);
    $navLinks = NavLinksParser::parse($navContent);
    $needsNormalization = false;

    if ($navLinks === null) {
        // Distinguish malformed canonical from missing
        if (NavLinksParser::hasNavLinksBlock($navContent)) {
            // $navLinks block exists but is malformed or non-literal
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'nav_parse_error',
                'message' => 'The $navLinks block in nav.php exists but could not be parsed. It may contain non-literal values or syntax errors.',
            ]], 422);
            return;
        }

        // No canonical block - check if we can normalize
        $layoutError = NavLinksParser::checkLayoutCompatibility($navContent);
        if ($layoutError !== null) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'normalization_unsupported_layout',
                'message' => 'Navigation layout is too complex for automatic normalization. Structure editing is not available for this navigation style.',
            ]], 422);
            return;
        }

        $navLinks = NavLinksParser::extractFromLegacyNav($navContent);
        if ($navLinks === null) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'normalization_extract_failed',
                'message' => 'Could not extract navigation links from the legacy nav file.',
            ]], 500);
            return;
        }

        $needsNormalization = true;
    }

    // Page must be in nav
    if (!NavLinksParser::isInNav($navLinks, $pageHref)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'page_not_in_nav',
            'message' => "Page \"{$slug}\" is not in the navigation. Adding pages to navigation is a future feature.",
        ]], 422);
        return;
    }

    // Target parent validation (if reparenting)
    if ($targetParentHref !== null) {
        // Homepage cannot be used as a parent target
        if ($targetParentHref === '/') {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'homepage_parent_locked',
                'message' => 'Homepage ("/") cannot be used as a parent. Pages can only be nested under non-homepage root-level pages.',
            ]], 422);
            return;
        }

        // Parent must exist in nav tree
        if (!NavLinksParser::isInNav($navLinks, $targetParentHref)) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'parent_not_found',
                'message' => "Target parent \"{$targetParentHref}\" not found in navigation.",
            ]], 404);
            return;
        }

        // Parent must be root-level (depth-1 enforcement)
        if (NavLinksParser::isNested($navLinks, $targetParentHref)) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'depth_exceeded',
                'message' => 'Target parent is already nested. Only one level of nesting is supported.',
            ]], 422);
            return;
        }

        // Circular check: cannot move under itself
        if ($targetParentHref === $pageHref) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'circular_reparent',
                'message' => 'A page cannot be moved under itself.',
            ]], 422);
            return;
        }

        // Cannot nest a page that has children (would silently drop subtree)
        if (NavLinksParser::hasChildren($navLinks, $pageHref)) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'has_children',
                'message' => 'This page has child pages and cannot be nested under another parent. Move its children first.',
            ]], 422);
            return;
        }
    }

    // Index range validation
    $currentPosition = NavLinksParser::findPosition($navLinks, $pageHref);
    if ($targetParentHref === null) {
        // Root level: count movable siblings (excluding pinned Home)
        $hasHome = NavLinksParser::hasHomeEntry($navLinks);
        $movableCount = count($navLinks) - ($hasHome ? 1 : 0);
        // After removing the page, max index is movableCount - 1
        $adjustedMovableCount = $movableCount - 1;
        if ($currentPosition && $currentPosition['parentHref'] !== null) {
            // Moving from child to root: root gains one entry
            $adjustedMovableCount = $movableCount;
        }
        if ($targetIndex < 0 || $targetIndex > $adjustedMovableCount) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'target_index_out_of_range',
                'message' => "Target index {$targetIndex} is out of range (0-{$adjustedMovableCount}).",
            ]], 422);
            return;
        }
    } else {
        // Child level: count siblings of target parent
        $parentSiblingCount = 0;
        foreach ($navLinks as $entry) {
            if ($entry['href'] === $targetParentHref) {
                $parentSiblingCount = count($entry['children'] ?? []);
                break;
            }
        }
        // If the page is already a child of this parent, subtract one
        if ($currentPosition && $currentPosition['parentHref'] === $targetParentHref) {
            $adjustedCount = $parentSiblingCount - 1;
        } else {
            $adjustedCount = $parentSiblingCount;
        }
        if ($targetIndex < 0 || $targetIndex > $adjustedCount) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'target_index_out_of_range',
                'message' => "Target index {$targetIndex} is out of range (0-{$adjustedCount}).",
            ]], 422);
            return;
        }
    }

    // No-change detection
    if ($currentPosition) {
        $sameParent = ($targetParentHref === $currentPosition['parentHref']);
        $sameIndex  = ($targetIndex === $currentPosition['index']);
        if ($sameParent && $sameIndex) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'no_change',
                'message' => 'The page is already at the requested position.',
            ]], 422);
            return;
        }
    }

    // ── Record old position for response ──
    $oldParentHref = $currentPosition['parentHref'] ?? null;
    $oldIndex      = $currentPosition['index'] ?? 0;

    // ── Create pre-mutation snapshot (only after validation passes) ──
    $label = $targetParentHref !== null
        ? "Move {$slug} under {$targetParentHref}"
        : "Reorder {$slug} to position {$targetIndex}";

    $snapshotResult = createSiteControlSnapshot(
        $db,
        'Pre-nav-reorder',
        "Auto-snapshot before: {$label}"
    );

    if (!$snapshotResult['ok']) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'snapshot_failed',
            'message' => 'Could not create safety snapshot: ' . ($snapshotResult['error'] ?? 'unknown error'),
        ]], 500);
        return;
    }

    $snapshotId = $snapshotResult['snapshot']['id'] ?? null;

    // ── If normalization needed, write the canonical nav.php first ──
    try {
        if ($needsNormalization) {
            // Use the proper normalization method that installs both
            // the canonical $navLinks block AND foreach render scaffolds
            $normalizedContent = NavLinksParser::normalizeFileContent($navContent, $navLinks);
            if ($normalizedContent === null) {
                throw new \RuntimeException('Normalization failed: could not produce a valid canonical nav.php');
            }
            file_put_contents($navFilePath, $normalizedContent);
            // Re-read so we work with the normalized file
            $navContent = file_get_contents($navFilePath);
            $navLinks = NavLinksParser::parse($navContent);
            if ($navLinks === null) {
                throw new \RuntimeException('Normalization produced unparseable output');
            }
        }

        // ── Apply the move ──
        $updatedNavLinks = NavLinksParser::applyMove($navLinks, $pageHref, $targetParentHref, $targetIndex);

        // ── Serialize and write back ──
        $newNavBlock = NavLinksParser::serialize($updatedNavLinks);
        $updatedContent = NavLinksParser::replaceNavBlock($navContent, $newNavBlock);

        if ($updatedContent === null) {
            throw new \RuntimeException('Could not locate $navLinks block for replacement');
        }

        file_put_contents($navFilePath, $updatedContent);

        // Test hook: force failure AFTER the write so rollback must repair real changes
        if (getenv('VS_TEST_NAV_FAIL_WRITE')) {
            throw new \RuntimeException('Forced write failure for testing');
        }

        // ── Round-trip verification ──
        $roundTripContent = file_get_contents($navFilePath);
        $roundTripParsed = NavLinksParser::parse($roundTripContent);

        if ($roundTripParsed === null || $roundTripParsed != $updatedNavLinks) {
            throw new \RuntimeException('Round-trip verification failed: written file does not match intended structure');
        }

    } catch (\Throwable $e) {
        // Write failed - restore from snapshot
        if ($snapshotId !== null) {
            $restoreResult = restoreSiteControlSnapshot($db, $snapshotId);
            if (!$restoreResult['ok']) {
                jsonResponse(['ok' => false, 'error' => [
                    'code'    => 'restore_failed',
                    'message' => 'Nav reorder failed and automatic restore also failed. Manual intervention required. '
                               . 'Original error: ' . $e->getMessage()
                               . ' Restore error: ' . ($restoreResult['error'] ?? 'unknown'),
                ]], 500);
                return;
            }
        }

        // Determine error code from exception
        $errorCode  = 'write_failed';
        $httpStatus = 500;
        if (str_contains($e->getMessage(), 'Round-trip')) {
            $errorCode = 'nav_roundtrip_mismatch';
        } elseif (str_contains($e->getMessage(), 'Normalization')) {
            $errorCode = 'normalization_failed';
        }

        jsonResponse(['ok' => false, 'error' => [
            'code'    => $errorCode,
            'message' => $e->getMessage(),
        ]], $httpStatus);
        return;
    }

    // ── Trigger reindex so DB projections reflect file truth ──
    try {
        $fileManager = new FileManager($db);
        $fileManager->syncNavOrderFromPartial();
    } catch (\Throwable $e) {
        // Reindex failure is non-fatal for the mutation itself
        // The file truth is already written; DB will catch up on next reindex
    }

    // ── Build truthful response ──
    $pageLabel = '';
    foreach ($updatedNavLinks as $entry) {
        if ($entry['href'] === $pageHref) {
            $pageLabel = $entry['label'];
            break;
        }
        if (isset($entry['children'])) {
            foreach ($entry['children'] as $child) {
                if ($child['href'] === $pageHref) {
                    $pageLabel = $child['label'];
                    break 2;
                }
            }
        }
    }

    $destDescription = $targetParentHref !== null
        ? "under \"{$targetParentHref}\", position " . ($targetIndex + 1)
        : "root, position " . ($targetIndex + 1);

    jsonResponse(['ok' => true, 'data' => [
        'pageId'          => $pageId,
        'oldParentHref'   => $oldParentHref,
        'oldIndex'        => $oldIndex,
        'newParentHref'   => $targetParentHref,
        'newIndex'        => $targetIndex,
        'normalized'      => $needsNormalization,
        'snapshotId'      => $snapshotId,
        'message'         => "Moved \"{$pageLabel}\" to {$destDescription}.",
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /site-control/page-rename
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/site-control/page-rename') {
    $body = getJsonBody();

    $pageId  = trim($body['pageId'] ?? '');
    $newTitle = trim($body['newTitle'] ?? '');

    // ── Validate required fields ──
    if ($pageId === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'missing_field',
            'message' => 'pageId is required.',
        ]], 400);
        return;
    }

    if ($newTitle === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'empty_title',
            'message' => 'Page title cannot be empty.',
        ]], 422);
        return;
    }

    $db = Database::getInstance();

    // Resolve pageId to page record (same pattern as nav-reorder)
    $filePath = str_starts_with($pageId, 'page:') ? substr($pageId, 5) : $pageId;
    $page = $db->queryOne(
        'SELECT id, slug, title, file_path, is_homepage, nav_label FROM pages WHERE file_path = ?',
        [$filePath]
    );

    if (!$page) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'page_not_found',
            'message' => "Page '{$pageId}' not found.",
        ]], 404);
        return;
    }

    $slug       = (string) $page['slug'];
    $oldTitle   = (string) ($page['title'] ?? '');
    $currentNavLabel = $page['nav_label'] !== null ? (string) $page['nav_label'] : null;

    // ── No-op detection ──
    if ($newTitle === $oldTitle) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'no_change',
            'message' => 'The new title is the same as the current title.',
        ]], 422);
        return;
    }

    // ── Create pre-mutation snapshot ──
    $snapshotResult = createSiteControlSnapshot(
        $db,
        'Pre-rename',
        "Auto-snapshot before renaming \"{$oldTitle}\" to \"{$newTitle}\""
    );

    if (!$snapshotResult['ok']) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'snapshot_failed',
            'message' => 'Could not create safety snapshot: ' . ($snapshotResult['error'] ?? 'unknown error'),
        ]], 500);
        return;
    }

    $snapshotId = $snapshotResult['snapshot']['id'] ?? null;

    // ── Perform mutations ──
    try {
        $previewDir = getenv('VS_TEST_PREVIEW_DIR') ?: dirname(__DIR__, 2) . '/preview';
        $fileManager = new FileManager($db);

        // 1. Update page file $page['title'] metadata
        $pageFilePath = $previewDir . '/' . $page['file_path'];
        if (!file_exists($pageFilePath)) {
            throw new \RuntimeException("Page source file '{$page['file_path']}' is missing.", 404);
        }

        $pageContent = file_get_contents($pageFilePath);
        $updatedContent = PageService::updatePhpMeta($pageContent, $newTitle, $slug);
        file_put_contents($pageFilePath, $updatedContent);

        // 2. Update pages.title in DB
        $dbUpdates = [
            'title'      => $newTitle,
            'updated_at' => date('Y-m-d H:i:s'),
        ];

        // 3. Nav label sync — only on canonical navs, only when label was in sync
        $navLabelUpdated = false;
        $navStatus       = 'unknown';

        $navFilePath = $previewDir . '/_partials/nav.php';
        if (file_exists($navFilePath)) {
            $navContent = file_get_contents($navFilePath);
            $navLinks   = NavLinksParser::parse($navContent);

            if ($navLinks !== null) {
                $navStatus = 'canonical';

                // Find the entry for this page in $navLinks
                $pageHref = ((bool) ($page['is_homepage'] ?? false)) ? '/' : '/' . $slug;
                $navEntry = null;
                $navEntryIsChild = false;

                foreach ($navLinks as &$entry) {
                    if ($entry['href'] === $pageHref) {
                        $navEntry = &$entry;
                        break;
                    }
                    if (isset($entry['children'])) {
                        foreach ($entry['children'] as &$child) {
                            if ($child['href'] === $pageHref) {
                                $navEntry = &$child;
                                $navEntryIsChild = true;
                                break 2;
                            }
                        }
                        unset($child);
                    }
                }
                unset($entry);

                if ($navEntry !== null) {
                    $navLabel = $navEntry['label'];
                    // Smart sync: update nav label only when it matched the old title
                    $labelMatchesOldTitle = (
                        $navLabel === $oldTitle
                        || $currentNavLabel === null
                        || $currentNavLabel === ''
                        || $currentNavLabel === $oldTitle
                    );

                    if ($labelMatchesOldTitle) {
                        // Update the label in the $navLinks tree
                        $navEntry['label'] = $newTitle;
                        $navLabelUpdated = true;

                        // Serialize and write back
                        $newNavBlock = NavLinksParser::serialize($navLinks);
                        $updatedNav = NavLinksParser::replaceNavBlock($navContent, $newNavBlock);
                        if ($updatedNav !== null) {
                            file_put_contents($navFilePath, $updatedNav);
                        }

                        // Update DB projection
                        $dbUpdates['nav_label'] = $newTitle;
                    }
                }
            } else {
                // Check if it's legacy or malformed
                $navStatus = NavLinksParser::hasNavLinksBlock($navContent) ? 'malformed' : 'legacy';
            }
        } else {
            $navStatus = 'missing';
        }

        $db->update('pages', $dbUpdates, 'id = ?', [(int) $page['id']]);

        // Test hook: force failure AFTER writes so rollback must repair real changes
        if (getenv('VS_TEST_RENAME_FAIL_WRITE')) {
            throw new \RuntimeException('Forced write failure for testing');
        }

        // Re-derive nav_order/nav_parent_id from file truth if nav was updated
        if ($navLabelUpdated) {
            $fileManager->syncNavOrderFromPartial();
        }

        // Tailwind recompile if page file changed
        if ($fileManager->pathAffectsTailwind($page['file_path'])) {
            $fileManager->compileTailwind();
        }

    } catch (\Throwable $e) {
        // Write failed — restore from snapshot
        if ($snapshotId !== null) {
            $restoreResult = restoreSiteControlSnapshot($db, $snapshotId);
            if (!$restoreResult['ok']) {
                jsonResponse(['ok' => false, 'error' => [
                    'code'    => 'restore_failed',
                    'message' => 'Page rename failed and automatic restore also failed. Manual intervention required. '
                               . 'Original error: ' . $e->getMessage()
                               . ' Restore error: ' . ($restoreResult['error'] ?? 'unknown'),
                ]], 500);
                return;
            }
        }

        $httpStatus = 500;
        $errorCode  = 'write_failed';
        if ($e->getCode() === 404) {
            $httpStatus = 404;
            $errorCode  = 'not_found';
        }

        jsonResponse(['ok' => false, 'error' => [
            'code'    => $errorCode,
            'message' => $e->getMessage(),
        ]], $httpStatus);
        return;
    }

    // ── Build truthful response ──
    jsonResponse(['ok' => true, 'data' => [
        'status'          => 'renamed',
        'oldTitle'        => $oldTitle,
        'newTitle'        => $newTitle,
        'navLabelUpdated' => $navLabelUpdated,
        'navStatus'       => $navStatus,
        'snapshotId'      => $snapshotId,
        'pageSlug'        => $slug,
        'message'         => "Page renamed from \"{$oldTitle}\" to \"{$newTitle}\"."
                           . ($navLabelUpdated ? ' Nav label updated.' : ''),
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /site-control/page-delete
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/site-control/page-delete') {
    $body = getJsonBody();

    $pageId = trim($body['pageId'] ?? '');
    $replacementHref = trim($body['replacementHref'] ?? '#');
    if ($replacementHref === '') {
        $replacementHref = '#';
    }

    // ── Validate replacementHref — strict allowlist ──
    // Only allow: '#' or app-relative paths starting with a single '/' (e.g. /404, /foo?x=1)
    // Block: protocol-relative (//evil.com), javascript:, data:, quotes
    $isValidHref = $replacementHref === '#'
        || (
            str_starts_with($replacementHref, '/')
            && !str_starts_with($replacementHref, '//')   // block protocol-relative
            && !str_contains($replacementHref, '"')
            && !str_contains($replacementHref, "'")
        );

    // Extra guard: reject anything that looks like a scheme (word:...)
    if ($isValidHref && preg_match('/^[a-z][a-z0-9+\-.]*:/i', $replacementHref)) {
        $isValidHref = false;
    }

    if (!$isValidHref) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'invalid_replacement_href',
            'message' => 'replacementHref must be "#" or a relative path starting with "/". Schemes and quotes are not allowed.',
        ]], 400);
        return;
    }

    // ── Validate required field ──
    if ($pageId === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'missing_field',
            'message' => 'pageId is required.',
        ]], 400);
        return;
    }

    $db = Database::getInstance();

    // Resolve pageId to page record (same pattern as rename)
    $filePath = str_starts_with($pageId, 'page:') ? substr($pageId, 5) : $pageId;
    $page = $db->queryOne(
        'SELECT id, slug, title, file_path, is_homepage FROM pages WHERE file_path = ?',
        [$filePath]
    );

    if (!$page) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'page_not_found',
            'message' => "Page '{$pageId}' not found.",
        ]], 404);
        return;
    }

    // ── Guard: homepage cannot be deleted ──
    if (!empty($page['is_homepage'])) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'cannot_delete_homepage',
            'message' => 'The homepage cannot be deleted.',
        ]], 400);
        return;
    }

    $slug      = (string) $page['slug'];
    $pageTitle = (string) ($page['title'] ?? ucfirst(str_replace('-', ' ', $slug)));
    $previewDir = getenv('VS_TEST_PREVIEW_DIR') ?: dirname(__DIR__, 2) . '/preview';

    // ── Pre-mutation validation: nav compatibility ──
    // If the page has a nav entry in a non-canonical nav, reject early.
    // This runs before taking a snapshot or touching any files.
    $navFilePath = $previewDir . '/_partials/nav.php';
    if (file_exists($navFilePath)) {
        $navContentForValidation = file_get_contents($navFilePath);
        $navLinksCheck = NavLinksParser::parse($navContentForValidation);

        if ($navLinksCheck === null) {
            // Non-canonical nav (legacy or malformed)
            // Check if the page's href appears in the raw markup
            $pageHrefCheck = '/' . $slug;
            if (stripos($navContentForValidation, 'href="' . $pageHrefCheck . '"') !== false
                || stripos($navContentForValidation, "href='" . $pageHrefCheck . "'") !== false) {
                jsonResponse(['ok' => false, 'error' => [
                    'code'    => 'nav_not_canonical',
                    'message' => 'Cannot delete: this page has a nav entry in a non-canonical navigation file. '
                               . 'Use Move to normalize the nav structure first, then retry Delete.',
                ]], 400);
                return;
            }
        }
    }

    // ── Compute affected references before deletion ──
    // These are inbound links TO this page's route. They will be cleaned up
    // by removePageReferencesAfterDelete() in step 6 — not left broken.
    $routePath = '/' . $slug;
    $affectedReferences = [];
    $totalAffectedRefs  = 0;

    try {
        $indexer = new \VoxelSite\SiteGraphIndexer($db);
        $graph   = $indexer->buildGraph();

        $routeNodeId = 'route:' . $routePath;
        $inboundEdges = $graph->getInEdges($routeNodeId, 'links_to');

        // Group by source node
        $refsBySource = [];
        foreach ($inboundEdges as $edge) {
            $sourceId = $edge['source'];
            if (!isset($refsBySource[$sourceId])) {
                $sourceNode  = $graph->getNode($sourceId);
                $sourceLabel = $sourceNode ? ($sourceNode['label'] ?? $sourceId) : $sourceId;
                $refsBySource[$sourceId] = [
                    'source' => $sourceId,
                    'label'  => $sourceLabel,
                    'count'  => 0,
                ];
            }
            $refsBySource[$sourceId]['count']++;
            $totalAffectedRefs++;
        }

        $affectedReferences = array_values($refsBySource);
    } catch (\Throwable $e) {
        // Graph indexing failure is non-fatal — proceed with deletion
        // but report zero affected references
    }

    // ── Create pre-mutation snapshot ──
    $snapshotResult = createSiteControlSnapshot(
        $db,
        'Pre-delete',
        "Auto-snapshot before deleting page \"{$pageTitle}\" ({$slug})"
    );

    if (!$snapshotResult['ok']) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'snapshot_failed',
            'message' => 'Could not create safety snapshot: ' . ($snapshotResult['error'] ?? 'unknown error'),
        ]], 500);
        return;
    }

    $snapshotId = $snapshotResult['snapshot']['id'] ?? null;

    // ── Perform mutation sequence ──
    $navEntryRemoved     = false;
    $navChildrenPromoted = 0;

    try {
        // 1. Delete the page file
        $pageFilePath = $previewDir . '/' . $page['file_path'];
        if (file_exists($pageFilePath)) {
            if (!@unlink($pageFilePath)) {
                throw new \RuntimeException("Could not delete page file: {$page['file_path']}");
            }
        }

        // Test hook: force failure AFTER file delete so rollback must repair real changes
        if (getenv('VS_TEST_DELETE_FAIL_NAV')) {
            throw new \RuntimeException('Forced nav failure for testing');
        }

        // 2. Remove nav entry & promote children
        $navFilePath = $previewDir . '/_partials/nav.php';
        if (file_exists($navFilePath)) {
            $navContent = file_get_contents($navFilePath);
            $navLinks   = NavLinksParser::parse($navContent);

            if ($navLinks !== null) {
                // Canonical nav — proceed with structural removal
                $pageHref = '/' . $slug;
                $result = scRemoveNavEntryAndPromoteChildren($navLinks, $pageHref);

                if ($result['removed']) {
                    // Serialize and write back — fail hard if write doesn't land
                    $newNavBlock     = NavLinksParser::serialize($result['navLinks']);
                    $updatedNavContent = NavLinksParser::replaceNavBlock($navContent, $newNavBlock);

                    if ($updatedNavContent === null) {
                        throw new \RuntimeException(
                            'Nav entry removal succeeded in memory but replaceNavBlock() failed to produce updated content.'
                        );
                    }

                    $written = file_put_contents($navFilePath, $updatedNavContent);
                    if ($written === false) {
                        throw new \RuntimeException(
                            'Nav entry removal succeeded in memory but file_put_contents() failed to write nav file.'
                        );
                    }

                    $navEntryRemoved     = true;
                    $navChildrenPromoted = $result['promoted'];
                }
            }
            // Non-canonical navs were already rejected in pre-mutation validation above.
        }

        // Test hook: force failure AFTER nav write so rollback must repair changes
        if (getenv('VS_TEST_DELETE_FAIL_DB')) {
            throw new \RuntimeException('Forced DB failure for testing');
        }

        // 3. Delete DB row
        $db->delete('pages', 'slug = ?', [$slug]);

        // 4. Clean up empty parent directory
        $parentDir = dirname($pageFilePath);
        if ($parentDir !== $previewDir && is_dir($parentDir)) {
            $remaining = @scandir($parentDir);
            if ($remaining !== false && count($remaining) <= 2) { // only . and ..
                @rmdir($parentDir);
            }
        }

        // 5. Re-sync nav order projections if nav was updated
        if ($navEntryRemoved) {
            $fileManager = new FileManager($db);
            $fileManager->syncNavOrderFromPartial();
        }

        // 6. Cross-file reference cleanup (neutralize dead links, remove nav items)
        //    Uses the same battle-tested 5-pass engine as the Agent API:
        //    - Partials: remove <li> wrapping dead links, remove standalone <a> elements
        //    - Pages: neutralize <a> tags (replace href with $replacementHref, preserve element)
        //    - Everywhere: remove PHP active-state conditionals, clean empty containers
        if (!isset($fileManager)) {
            $fileManager = new FileManager($db);
        }
        $pageService = new PageService($db, $fileManager);
        $cleanupResult = $pageService->removePageReferencesAfterDelete($slug, $replacementHref);
        $cleanedUpFiles = $cleanupResult['updated_files'] ?? [];

        // 7. Tailwind recompile if any cleaned-up files affect it
        if (!empty($cleanedUpFiles) && $fileManager->pathsAffectTailwind($cleanedUpFiles)) {
            $fileManager->compileTailwind();
        }

    } catch (\Throwable $e) {
        // ── Automatic rollback from snapshot ──
        if ($snapshotId !== null) {
            $restoreResult = restoreSiteControlSnapshot($db, $snapshotId);
            if (!$restoreResult['ok']) {
                jsonResponse(['ok' => false, 'error' => [
                    'code'    => 'restore_failed',
                    'message' => 'Page delete failed and automatic restore also failed. Manual intervention required. '
                               . 'Original error: ' . $e->getMessage()
                               . ' Restore error: ' . ($restoreResult['error'] ?? 'unknown'),
                ]], 500);
                return;
            }
        }

        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'delete_failed',
            'message' => $e->getMessage(),
        ]], 500);
        return;
    }

    $refsCleanedUp = count($cleanedUpFiles);

    // ── Build truthful response ──
    jsonResponse(['ok' => true, 'data' => [
        'deletedPage' => [
            'title'    => $pageTitle,
            'slug'     => $slug,
            'filePath' => (string) $page['file_path'],
        ],
        'navEntryRemoved'         => $navEntryRemoved,
        'navChildrenPromoted'     => $navChildrenPromoted,
        'affectedReferences'      => $affectedReferences,
        'totalAffectedReferences' => $totalAffectedRefs,
        'referencesCleanedUp'     => $refsCleanedUp,
        'cleanedUpFiles'          => $cleanedUpFiles,
        'replacementHref'         => $replacementHref,
        'snapshotId'              => $snapshotId,
        'message'                 => "Page \"{$pageTitle}\" has been deleted."
                                   . ($navEntryRemoved ? ' Nav entry removed.' : '')
                                   . ($navChildrenPromoted > 0 ? " {$navChildrenPromoted} child nav entries promoted." : '')
                                   . ($refsCleanedUp > 0 ? " {$refsCleanedUp} file" . ($refsCleanedUp === 1 ? '' : 's') . " cleaned up." : '')
                                   . ($totalAffectedRefs > 0 && $refsCleanedUp === 0 ? " {$totalAffectedRefs} references may be affected." : ''),
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /site-control/structural-move
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/site-control/structural-move') {
    $body = getJsonBody();

    $pageId       = trim($body['pageId'] ?? '');
    $targetParent = $body['targetParent'] ?? null;

    // ── 3.1 Validate required fields ──
    if ($pageId === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'missing_field',
            'message' => 'pageId is required.',
        ]], 400);
        return;
    }
    if ($targetParent === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'missing_field',
            'message' => 'targetParent is required (use empty string for root).',
        ]], 400);
        return;
    }

    $targetParent = trim((string) $targetParent);

    $db = Database::getInstance();

    // Resolve pageId to page record
    $filePath = str_starts_with($pageId, 'page:') ? substr($pageId, 5) : $pageId;
    $sourcePage = $db->queryOne(
        'SELECT id, slug, title, file_path, is_homepage FROM pages WHERE file_path = ?',
        [$filePath]
    );

    if (!$sourcePage) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'page_not_found',
            'message' => "Page '{$pageId}' not found.",
        ]], 404);
        return;
    }

    // ── Guard: homepage cannot be moved ──
    if (!empty($sourcePage['is_homepage'])) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'cannot_move_homepage',
            'message' => 'The homepage cannot be structurally moved.',
        ]], 400);
        return;
    }

    $sourceSlug     = (string) $sourcePage['slug'];
    $sourceFilePath = (string) $sourcePage['file_path'];
    $sourceTitle    = (string) ($sourcePage['title'] ?? ucfirst(str_replace('-', ' ', basename($sourceSlug))));
    $previewDir     = getenv('VS_TEST_PREVIEW_DIR') ?: dirname(__DIR__, 2) . '/preview';

    // ── 3.2 Validate target parent ──
    $targetParentSlug = '';
    if ($targetParent !== '') {
        $targetPage = $db->queryOne(
            'SELECT id, slug, file_path, is_homepage FROM pages WHERE slug = ?',
            [$targetParent]
        );

        if (!$targetPage) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'invalid_target',
                'message' => "Target parent '{$targetParent}' not found.",
            ]], 400);
            return;
        }

        // Homepage is not a valid parent (would produce index/about.php)
        if (!empty($targetPage['is_homepage'])) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'invalid_target',
                'message' => 'The homepage cannot be used as a parent page.',
            ]], 400);
            return;
        }

        // Phase 4 depth guardrail: target must be root-level (no '/' in slug)
        if (str_contains((string) $targetPage['slug'], '/')) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'invalid_target',
                'message' => 'Target parent must be a root-level page (Phase 4 depth guardrail).',
            ]], 400);
            return;
        }

        // Cannot move a page under itself
        if ((string) $targetPage['slug'] === $sourceSlug) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'invalid_target',
                'message' => 'Cannot move a page under itself.',
            ]], 400);
            return;
        }

        $targetParentSlug = (string) $targetPage['slug'];
    }

    // ── Same-location check ──
    // Determine the current parent prefix of the source
    $currentParent = str_contains($sourceSlug, '/')
        ? implode('/', array_slice(explode('/', $sourceSlug), 0, -1))
        : '';

    if ($currentParent === $targetParentSlug) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'same_location',
            'message' => 'Page is already at the target location.',
        ]], 400);
        return;
    }

    // ── 3.3 Discover subtree (filesystem-first) ──
    // Sync the page registry first so that filesystem-discovered descendants
    // have DB rows before we try to enrich them with metadata.
    $fileManager = new FileManager($db);
    $fileManager->syncPageRegistry();

    $subtreeFiles = scDiscoverSubtreeFromFilesystem($sourceFilePath, $previewDir);

    // Enrich with DB metadata (now guaranteed to exist after sync)
    $subtree = [];
    foreach ($subtreeFiles as $entry) {
        $entrySlug = FileManager::deriveSlugFromFilePath($entry['file_path']);
        $dbRow = $db->queryOne(
            'SELECT id, slug, title, file_path FROM pages WHERE slug = ?',
            [$entrySlug]
        );

        $subtree[] = [
            'db_id'     => $dbRow ? (int) $dbRow['id'] : null,
            'old_slug'  => $entrySlug,
            'old_file'  => $entry['file_path'],
            'title'     => $dbRow ? (string) $dbRow['title'] : ucfirst(str_replace('-', ' ', basename($entrySlug))),
        ];
    }

    // ── 3.4 Compute all old→new paths ──
    $slugMap = [];          // old_slug => new_slug
    $fileMap = [];          // old_file => new_file
    $movedPageDetails = []; // for the response

    foreach ($subtree as &$page) {
        // Compute the leaf part (relative to the source's parent)
        $leafSlug = $page['old_slug'];
        if ($currentParent !== '') {
            $leafSlug = substr($leafSlug, strlen($currentParent) + 1); // strip parent prefix + '/'
        }

        $newSlug = $targetParentSlug === ''
            ? $leafSlug
            : $targetParentSlug . '/' . $leafSlug;

        $newFile = $newSlug . '.php';

        $page['new_slug'] = $newSlug;
        $page['new_file'] = $newFile;

        $slugMap[$page['old_slug']] = $newSlug;
        $fileMap[$page['old_file']] = $newFile;

        $movedPageDetails[] = [
            'oldRoute'    => '/' . $page['old_slug'],
            'newRoute'    => '/' . $newSlug,
            'oldFilePath' => $page['old_file'],
            'newFilePath' => $newFile,
            'title'       => $page['title'],
        ];
    }
    unset($page);

    // ── 3.5 Collision check ──
    foreach ($subtree as $page) {
        $targetPath = $previewDir . '/' . $page['new_file'];
        if (file_exists($targetPath)) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'path_conflict',
                'message' => "Target path '{$page['new_file']}' already exists.",
                'conflicting_page' => [
                    'file_path' => $page['new_file'],
                    'slug'      => $page['new_slug'],
                ],
            ]], 409);
            return;
        }
    }

    // ── 3.6 Legacy nav guard ──
    $navFilePath = $previewDir . '/_partials/nav.php';
    if (file_exists($navFilePath)) {
        $navContentForValidation = file_get_contents($navFilePath);
        $navLinksCheck = NavLinksParser::parse($navContentForValidation);

        if ($navLinksCheck === null) {
            // Non-canonical nav — check if any moved page's href appears in raw markup
            foreach ($subtree as $page) {
                $pageHrefCheck = '/' . $page['old_slug'];
                if (stripos($navContentForValidation, 'href="' . $pageHrefCheck . '"') !== false
                    || stripos($navContentForValidation, "href='" . $pageHrefCheck . "'") !== false) {
                    jsonResponse(['ok' => false, 'error' => [
                        'code'    => 'nav_not_canonical',
                        'message' => 'Cannot move: page has a nav entry in a non-canonical navigation file. '
                                   . 'Normalize the nav structure first, then retry.',
                    ]], 400);
                    return;
                }
            }
        }
    }

    // ── 3.7 Compute affected inbound references ──
    // These are internal links TO the moved routes. They will be rewritten
    // in step 5c, so they are "affected" (impacted-and-rewritten), not "broken".
    $affectedReferences = [];
    $totalAffectedRefs  = 0;

    try {
        $indexer = new \VoxelSite\SiteGraphIndexer($db);
        $graph   = $indexer->buildGraph();

        foreach ($subtree as $page) {
            $routeNodeId  = 'route:/' . $page['old_slug'];
            $inboundEdges = $graph->getInEdges($routeNodeId, 'links_to');

            foreach ($inboundEdges as $edge) {
                $sourceId = $edge['source'];
                // Skip inbound links from other pages in the subtree (they'll be rewritten)
                $isFromSubtree = false;
                foreach ($subtree as $other) {
                    if ($sourceId === 'file:' . $other['old_file']) {
                        $isFromSubtree = true;
                        break;
                    }
                }
                if ($isFromSubtree) {
                    continue;
                }

                if (!isset($affectedReferences[$sourceId])) {
                    $sourceNode  = $graph->getNode($sourceId);
                    $sourceLabel = $sourceNode ? ($sourceNode['label'] ?? $sourceId) : $sourceId;
                    $affectedReferences[$sourceId] = [
                        'source' => $sourceId,
                        'label'  => $sourceLabel,
                        'count'  => 0,
                    ];
                }
                $affectedReferences[$sourceId]['count']++;
                $totalAffectedRefs++;
            }
        }

        $affectedReferences = array_values($affectedReferences);
    } catch (\Throwable $e) {
        // Graph indexing failure is non-fatal
    }

    // ── 3.8 Create pre-mutation snapshot ──
    $snapshotResult = createSiteControlSnapshot(
        $db,
        'Pre-move',
        "Auto-snapshot before moving page \"{$sourceTitle}\" ({$sourceSlug}) to " .
        ($targetParentSlug === '' ? 'root' : "/{$targetParentSlug}")
    );

    if (!$snapshotResult['ok']) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'snapshot_failed',
            'message' => 'Could not create safety snapshot: ' . ($snapshotResult['error'] ?? 'unknown error'),
        ]], 500);
        return;
    }

    $snapshotId = $snapshotResult['snapshot']['id'] ?? null;

    // ── 3.9 Mutation sequence ──
    $refUpdatedFiles    = [];
    $navUpdated         = false;
    $navStatusPerPage   = []; // tracks 'relocated' | 'removed' per old_file

    try {
        // 5a. Move files (create target directories, rename each file)
        foreach ($subtree as $page) {
            $oldAbsPath = $previewDir . '/' . $page['old_file'];
            $newAbsPath = $previewDir . '/' . $page['new_file'];

            // Create target directory if needed
            $newDir = dirname($newAbsPath);
            if (!is_dir($newDir)) {
                if (!mkdir($newDir, 0755, true)) {
                    throw new \RuntimeException("Could not create directory: {$newDir}");
                }
            }

            if (!rename($oldAbsPath, $newAbsPath)) {
                throw new \RuntimeException("Could not move file: {$page['old_file']} → {$page['new_file']}");
            }
        }

        // 5b. Rewrite moved files' embedded metadata (slug in $page array)
        foreach ($subtree as $page) {
            $newAbsPath = $previewDir . '/' . $page['new_file'];
            $content = file_get_contents($newAbsPath);
            if ($content === false) {
                continue;
            }

            $updated = PageService::updatePhpMeta($content, $page['title'], $page['new_slug']);
            if ($updated !== $content) {
                $written = file_put_contents($newAbsPath, $updated);
                if ($written === false) {
                    throw new \RuntimeException("Could not write updated metadata to {$page['new_file']}");
                }
            }
        }

        // Test hook: force failure AFTER file move + meta rewrite
        if (getenv('VS_TEST_MOVE_FAIL_REFS')) {
            throw new \RuntimeException('Forced ref-rewrite failure for testing');
        }

        // 5c. Rewrite other files' references (reuse $fileManager from pre-enrichment sync)
        $pageService  = new PageService($db, $fileManager);
        $refUpdatedFiles = $pageService->rewriteAllReferencesForSlugMap($slugMap);

        // Test hook: force failure AFTER reference rewrite
        if (getenv('VS_TEST_MOVE_FAIL_NAV')) {
            throw new \RuntimeException('Forced nav failure for testing');
        }

        // 5d. Update nav entries
        if (file_exists($navFilePath)) {
            $navContent = file_get_contents($navFilePath);
            $navLinks   = NavLinksParser::parse($navContent);

            if ($navLinks !== null) {
                $navModified = false;

                foreach ($subtree as $page) {
                    $oldHref    = '/' . $page['old_slug'];
                    $newHref    = '/' . $page['new_slug'];
                    $slashCount = substr_count($page['new_slug'], '/');

                    if ($slashCount <= 1) {
                        // Representable in nav (root = 0 slashes, first child = 1 slash)
                        $newParentHref = $slashCount === 0
                            ? null
                            : '/' . implode('/', array_slice(explode('/', $page['new_slug']), 0, -1));
                        $relocResult = scRelocateNavEntry($navLinks, $oldHref, $newHref, $newParentHref);
                        $navLinks = $relocResult['navLinks'];
                        $navStatusPerPage[$page['old_file']] = $relocResult['status'];
                    } else {
                        // depth > 1: remove from nav (page is still routable but hidden)
                        $result = scRemoveNavEntryAndPromoteChildren($navLinks, $oldHref);
                        $navLinks = $result['navLinks'];
                        $navStatusPerPage[$page['old_file']] = 'removed';
                    }
                    $navModified = true;
                }

                if ($navModified) {
                    $newNavBlock     = NavLinksParser::serialize($navLinks);
                    $updatedNavContent = NavLinksParser::replaceNavBlock($navContent, $newNavBlock);

                    if ($updatedNavContent === null) {
                        throw new \RuntimeException('Nav update succeeded in memory but replaceNavBlock() failed.');
                    }

                    $written = file_put_contents($navFilePath, $updatedNavContent);
                    if ($written === false) {
                        throw new \RuntimeException('Nav update succeeded in memory but file_put_contents() failed.');
                    }

                    $navUpdated = true;
                }
            }
        }

        // Test hook: force failure AFTER nav write
        if (getenv('VS_TEST_MOVE_FAIL_DB')) {
            throw new \RuntimeException('Forced DB failure for testing');
        }

        // 5e. Update DB rows
        foreach ($subtree as $page) {
            if ($page['db_id'] !== null) {
                $db->update('pages', [
                    'slug'       => $page['new_slug'],
                    'file_path'  => $page['new_file'],
                    'updated_at' => now(),
                ], 'id = ?', [$page['db_id']]);
            }
        }

        // 5f. Cleanup empty source directories
        foreach ($subtree as $page) {
            $oldDir = dirname($previewDir . '/' . $page['old_file']);
            while ($oldDir !== $previewDir && is_dir($oldDir)) {
                $remaining = @scandir($oldDir);
                if ($remaining !== false && count($remaining) <= 2) {
                    @rmdir($oldDir);
                    $oldDir = dirname($oldDir);
                } else {
                    break;
                }
            }
        }

        // 5g. Re-sync nav order projections
        if ($navUpdated) {
            $fileManager->syncNavOrderFromPartial();
        }

    } catch (\Throwable $e) {
        // ── Automatic rollback from snapshot ──
        if ($snapshotId !== null) {
            $restoreResult = restoreSiteControlSnapshot($db, $snapshotId);
            if (!$restoreResult['ok']) {
                jsonResponse(['ok' => false, 'error' => [
                    'code'    => 'restore_failed',
                    'message' => 'Structural move failed and automatic restore also failed. Manual intervention required. '
                               . 'Original error: ' . $e->getMessage()
                               . ' Restore error: ' . ($restoreResult['error'] ?? 'unknown'),
                ]], 500);
                return;
            }
        }

        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'move_failed',
            'message' => $e->getMessage(),
        ]], 500);
        return;
    }

    // ── 3.11 Build truthful response ──
    jsonResponse(['ok' => true, 'data' => [
        'movedPages'            => array_map(function ($mp) use ($navStatusPerPage) {
            $status = $navStatusPerPage[$mp['oldFilePath']] ?? null;
            if ($status === 'relocated') {
                $mp['navRelocated'] = true;
            } elseif ($status === 'removed') {
                $mp['navRemoved'] = true;
            }
            return $mp;
        }, $movedPageDetails),
        'totalPagesMoved'       => count($subtree),
        'referencesRewritten'   => count($refUpdatedFiles),
        'snapshotId'            => $snapshotId,
        'affectedReferences'    => $affectedReferences,
        'totalAffectedReferences' => $totalAffectedRefs,
        'message'               => "Moved {$sourceTitle} (" . count($subtree) . " page"
                                 . (count($subtree) > 1 ? 's' : '') . ") to "
                                 . ($targetParentSlug === '' ? 'root' : "/{$targetParentSlug}")
                                 . '. ' . count($refUpdatedFiles) . ' file'
                                 . (count($refUpdatedFiles) !== 1 ? 's' : '') . ' updated.'
                                 . ($totalAffectedRefs > 0 ? " {$totalAffectedRefs} inbound references were rewritten." : ''),
    ]]);
    return;
}

// ── Fallback ──
jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Site Control endpoint not found.',
]], 404);

// ═══════════════════════════════════════════
//  Helper Functions
// ═══════════════════════════════════════════

/**
 * Normalize a URL path to a single-segment page slug.
 *
 * Phase 2A constraint: only single-segment paths are supported.
 * Returns null if the path contains slashes (multi-segment).
 * Returns '' if the path normalizes to nothing (invalid chars only).
 */
function normalizeSiteControlPath(string $value): ?string
{
    $value = trim($value, '/ ');
    // Strip .php extension if present
    if (str_ends_with($value, '.php')) {
        $value = substr($value, 0, -4);
    }
    // Reject multi-segment paths (Phase 2A: single-segment only)
    if (str_contains($value, '/')) {
        return null;
    }
    return PageService::normalizeSlug($value);
}

/**
 * Resolve a routeId (e.g. "route:/services") to its served page from the DB.
 *
 * @return array{slug: string, path: string, file_path: string, is_homepage: bool}|null
 */
function resolveRouteToPage(string $routeId, Database $db): ?array
{
    // Parse route path from routeId format "route:/path"
    if (!str_starts_with($routeId, 'route:')) {
        return null;
    }

    $routePath = substr($routeId, strlen('route:'));
    if ($routePath === '') {
        return null;
    }

    // Convert route path to page slug
    // "/" → "index", "/services" → "services"
    $slug = $routePath === '/' ? 'index' : ltrim($routePath, '/');

    $page = $db->queryOne(
        'SELECT slug, file_path, is_homepage FROM pages WHERE slug = ?',
        [$slug]
    );

    if ($page === null || $page === false) {
        return null;
    }

    return [
        'slug'        => (string) $page['slug'],
        'path'        => $routePath,
        'file_path'   => (string) $page['file_path'],
        'is_homepage' => (bool) ($page['is_homepage'] ?? false),
    ];
}

/**
 * Create a pre-mutation safety snapshot.
 *
 * Inlined from snapshots.php because that endpoint file has top-level
 * side effects that would execute on require_once.
 */
function createSiteControlSnapshot(Database $db, string $label, string $description): array
{
    if (!class_exists('ZipArchive')) {
        return ['ok' => false, 'error' => 'ZipArchive extension is not installed.'];
    }

    $snapshotDir = getenv('VS_TEST_SNAPSHOT_DIR') ?: dirname(__DIR__, 2) . '/data/snapshots';
    $previewDir  = getenv('VS_TEST_PREVIEW_DIR')  ?: dirname(__DIR__, 2) . '/preview';
    $assetsDir   = getenv('VS_TEST_ASSETS_DIR')   ?: dirname(__DIR__, 3) . '/assets';

    if (!is_dir($snapshotDir)) {
        mkdir($snapshotDir, 0755, true);
    }

    $timestamp = date('Y-m-d_H-i-s');
    $filename  = "snapshot_auto_{$timestamp}.zip";
    $zipPath   = $snapshotDir . '/' . $filename;
    $fileCount = 0;

    $zip = new \ZipArchive();
    if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
        return ['ok' => false, 'error' => 'Could not create snapshot archive.'];
    }

    // Add preview files
    if (is_dir($previewDir)) {
        $fileCount += scZipAddDir($zip, $previewDir, 'preview');
    }

    // Add assets
    if (is_dir($assetsDir)) {
        $fileCount += scZipAddDir($zip, $assetsDir, 'assets');
    }

    $zip->close();

    if ($fileCount === 0) {
        @unlink($zipPath);
        return ['ok' => false, 'error' => 'Nothing to snapshot — no files found.'];
    }

    $sizeBytes = filesize($zipPath);

    $id = $db->insert('snapshots', [
        'filename'       => $filename,
        'snapshot_type'  => 'auto',
        'label'          => $label ?: null,
        'description'    => $description ?: null,
        'file_count'     => $fileCount,
        'size_bytes'     => $sizeBytes,
        'created_by'     => $_REQUEST['_user']['id'] ?? null,
        'created_at'     => now(),
    ]);

    // Test hook: after snapshot is safely captured, delete a page file to
    // force a write failure in the subsequent updatePage call. This lets
    // the test exercise the real rollback path end-to-end.
    // VS_TEST_SABOTAGE_FILE is never set in production.
    $sabotageFile = getenv('VS_TEST_SABOTAGE_FILE');
    if ($sabotageFile !== false && $sabotageFile !== '') {
        $sabotageTarget = $previewDir . '/' . $sabotageFile;
        if (file_exists($sabotageTarget)) {
            @unlink($sabotageTarget);
        }
    }

    return [
        'ok'       => true,
        'snapshot' => [
            'id'       => $id,
            'filename' => $filename,
        ],
    ];
}

/**
 * Attempt to restore from a snapshot by ID.
 */
function restoreSiteControlSnapshot(Database $db, int $snapshotId): array
{
    $snapshot = $db->queryOne('SELECT * FROM snapshots WHERE id = ?', [$snapshotId]);
    if (!$snapshot) {
        return ['ok' => false, 'error' => 'Snapshot record not found.'];
    }

    $snapshotDir = getenv('VS_TEST_SNAPSHOT_DIR') ?: dirname(__DIR__, 2) . '/data/snapshots';
    $previewDir  = getenv('VS_TEST_PREVIEW_DIR')  ?: dirname(__DIR__, 2) . '/preview';
    $assetsDir   = getenv('VS_TEST_ASSETS_DIR')   ?: dirname(__DIR__, 3) . '/assets';

    $zipPath = $snapshotDir . '/' . $snapshot['filename'];
    if (!file_exists($zipPath)) {
        return ['ok' => false, 'error' => 'Snapshot ZIP file is missing.'];
    }

    $zip = new \ZipArchive();
    if ($zip->open($zipPath) !== true) {
        return ['ok' => false, 'error' => 'Could not open snapshot archive.'];
    }

    // Clear current preview files (keep .gitkeep)
    scClearDir($previewDir, ['gitkeep']);

    // Clear current CSS/JS assets
    scClearDir($assetsDir . '/css');
    scClearDir($assetsDir . '/js');

    // Extract files
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $entry = $zip->getNameIndex($i);
        if (!is_string($entry) || str_ends_with($entry, '/')) continue;

        if (str_starts_with($entry, 'preview/')) {
            $rel     = substr($entry, strlen('preview/'));
            $baseDir = $previewDir;
        } elseif (str_starts_with($entry, 'assets/')) {
            $rel     = substr($entry, strlen('assets/'));
            $baseDir = $assetsDir;
        } else {
            continue;
        }

        $content = $zip->getFromIndex($i);
        if ($content === false) continue;

        $target    = rtrim($baseDir, '/') . '/' . ltrim(str_replace('\\', '/', $rel), '/');
        $parentDir = dirname($target);
        if (!is_dir($parentDir)) @mkdir($parentDir, 0755, true);
        file_put_contents($target, $content);
    }

    $zip->close();

    // Resync page registry after restore
    $fileManager = new \VoxelSite\FileManager($db);
    $fileManager->syncPageRegistry();

    return ['ok' => true];
}

/**
 * Recursively add a directory to a ZipArchive.
 */
function scZipAddDir(\ZipArchive $zip, string $dir, string $prefix): int
{
    $count = 0;
    $realDir = realpath($dir) ?: $dir;
    $it = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
        \RecursiveIteratorIterator::LEAVES_ONLY
    );
    foreach ($it as $file) {
        if ($file->isFile()) {
            $real = $file->getRealPath();
            $rel  = $prefix . '/' . ltrim(str_replace($realDir, '', $real), DIRECTORY_SEPARATOR);
            $zip->addFile($real, str_replace('\\', '/', $rel));
            $count++;
        }
    }
    return $count;
}

/**
 * Recursively remove files from a directory.
 */
function scClearDir(string $dir, array $keepExtensions = []): void
{
    if (!is_dir($dir)) return;
    $it = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
        \RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($it as $item) {
        if ($item->isFile()) {
            if (!in_array(ltrim($item->getExtension(), '.'), $keepExtensions, true)) {
                @unlink($item->getRealPath());
            }
        }
    }
}

/**
 * Remove a nav entry by href and promote its children to the parent level.
 *
 * Walks the tree recursively. When the target entry is found, its children
 * are spliced into the parent array at the same position (preserving order).
 *
 * @param  array  $navLinks    The nav tree
 * @param  string $targetHref  The href of the entry to remove
 * @return array{removed: bool, promoted: int, navLinks: array}
 */
function scRemoveNavEntryAndPromoteChildren(array $navLinks, string $targetHref): array
{
    // Search root level
    foreach ($navLinks as $i => $entry) {
        if ($entry['href'] === $targetHref) {
            $children = $entry['children'] ?? [];
            // Splice: remove this entry, insert its children at the same position
            array_splice($navLinks, $i, 1, $children);
            return ['removed' => true, 'promoted' => count($children), 'navLinks' => $navLinks];
        }
    }

    // Search children of root entries
    foreach ($navLinks as $i => $entry) {
        if (!empty($entry['children'])) {
            foreach ($entry['children'] as $j => $child) {
                if ($child['href'] === $targetHref) {
                    // Children of a nested entry cannot be further nested (depth-1 model),
                    // so they are promoted to the parent entry's children array
                    $grandchildren = $child['children'] ?? [];
                    array_splice($navLinks[$i]['children'], $j, 1, $grandchildren);

                    // Clean up empty children array
                    if (empty($navLinks[$i]['children'])) {
                        unset($navLinks[$i]['children']);
                    }

                    return ['removed' => true, 'promoted' => count($grandchildren), 'navLinks' => $navLinks];
                }
            }
        }
    }

    return ['removed' => false, 'promoted' => 0, 'navLinks' => $navLinks];
}

/**
 * Discover the subtree of a page from the filesystem.
 *
 * Returns a flat list of file paths (relative to preview/). The source file
 * always comes first, followed by any descendants in its sibling directory.
 *
 * @param  string $sourceFilePath Relative file path (e.g. 'about.php' or 'work/about.php')
 * @param  string $previewDir     Absolute path to the preview directory
 * @return array<int, array{file_path: string}>
 */
function scDiscoverSubtreeFromFilesystem(string $sourceFilePath, string $previewDir): array
{
    $pages = [];

    // The source file itself
    $pages[] = ['file_path' => $sourceFilePath];

    // Scan the source file's sibling directory for descendants
    // e.g., if source is 'about.php', check for 'about/' directory
    $childDir = preg_replace('/\.php$/i', '', $sourceFilePath);
    $fullChildDir = $previewDir . '/' . $childDir;

    if (is_dir($fullChildDir)) {
        $it = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($fullChildDir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );
        foreach ($it as $item) {
            if ($item->isFile() && preg_match('/\.php$/i', $item->getFilename())) {
                $relPath = $childDir . '/' . ltrim(
                    str_replace($fullChildDir, '', $item->getPathname()),
                    DIRECTORY_SEPARATOR
                );
                // Normalize directory separators
                $relPath = str_replace('\\', '/', $relPath);
                $pages[] = ['file_path' => $relPath];
            }
        }
    }

    return $pages;
}

/**
 * Relocate a nav entry: change its href AND move it to the correct tree position.
 *
 * This handles the full structural move contract:
 * - If the page was at root and moves under a parent → becomes a child entry
 * - If the page was a child and moves to root → becomes a root entry  
 * - If the page stays at the same depth level → updates href in place
 *
 * @param  array       $navLinks        The nav tree
 * @param  string      $oldHref         Current href of the entry (e.g. '/about')
 * @param  string      $newHref         New href after move (e.g. '/work/about')
 * @param  string|null $newParentHref   Href of the new parent entry, or null for root
 * @return array                        The modified nav tree
 */
function scRelocateNavEntry(array $navLinks, string $oldHref, string $newHref, ?string $newParentHref): array
{
    // Step 1: Extract the entry from its current position (preserve label + children)
    $extracted = null;

    // Search root level
    foreach ($navLinks as $i => $entry) {
        if ($entry['href'] === $oldHref) {
            $extracted = $entry;
            array_splice($navLinks, $i, 1);
            break;
        }
    }

    // Search children of root entries
    if ($extracted === null) {
        foreach ($navLinks as $i => $entry) {
            if (!empty($entry['children'])) {
                foreach ($entry['children'] as $j => $child) {
                    if ($child['href'] === $oldHref) {
                        $extracted = $child;
                        array_splice($navLinks[$i]['children'], $j, 1);
                        if (empty($navLinks[$i]['children'])) {
                            unset($navLinks[$i]['children']);
                        }
                        break 2;
                    }
                }
            }
        }
    }

    if ($extracted === null) {
        // Entry not found in nav — nothing to relocate
        return ['navLinks' => $navLinks, 'status' => 'not_found'];
    }

    // Step 2: Update the href
    $extracted['href'] = $newHref;

    // Step 3: Insert at the correct new position
    if ($newParentHref === null) {
        // Move to root level — append at end
        $navLinks[] = $extracted;
        return ['navLinks' => $navLinks, 'status' => 'relocated'];
    } else {
        // Move under a parent entry
        foreach ($navLinks as $i => $entry) {
            if ($entry['href'] === $newParentHref) {
                if (!isset($navLinks[$i]['children'])) {
                    $navLinks[$i]['children'] = [];
                }
                $navLinks[$i]['children'][] = $extracted;
                return ['navLinks' => $navLinks, 'status' => 'relocated'];
            }
        }

        // Parent not found in nav — entry becomes nav-hidden
        // (don't orphan at root; that would contradict the filesystem hierarchy)
        return ['navLinks' => $navLinks, 'status' => 'removed'];
    }
}
