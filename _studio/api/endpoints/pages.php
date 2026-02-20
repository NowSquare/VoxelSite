<?php

declare(strict_types=1);

/**
 * Pages API Endpoints
 *
 * GET    /pages           — List all pages
 * GET    /pages/:slug     — Get a single page (content + metadata)
 * PUT    /pages/:slug/nav — Update page navigation settings
 * PUT    /pages/reorder   — Reorder pages
 * DELETE /pages/:slug     — Delete a page
 */

use VoxelSite\Database;
use VoxelSite\FileManager;

$method = $_REQUEST['_route_method'];
$path = $_REQUEST['_route_path'];
$params = $_REQUEST['_route_params'] ?? [];

$db = Database::getInstance();
$fileManager = new FileManager();

// ═══════════════════════════════════════════
//  GET /pages — List all pages
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/pages') {
    // Keep DB page registry aligned with preview files.
    $fileManager->syncPageRegistry();

    // ── Flat recursive mode ──────────────────────────────
    // ?flat=1 returns ALL page files recursively as a flat array.
    // Filesystem-first: no DB enrichment needed. Used by the Pages modal.
    if (!empty($_GET['flat'])) {
        $allFiles = $fileManager->listPreviewFilesRecursive();

        // Try to enrich with DB title (fast, optional)
        $pages = [];
        foreach ($allFiles as $file) {
            $row = $db->queryOne(
                'SELECT title, is_homepage FROM pages WHERE file_path = ?',
                [$file['path']]
            );

            $title = $row['title']
                ?? ucfirst(str_replace('-', ' ', $file['slug']));
            $isHome = (int) ($row['is_homepage'] ?? ($file['slug'] === 'index' ? 1 : 0));

            $pages[] = [
                'path'        => $file['path'],
                'slug'        => $file['slug'],
                'title'       => $title,
                'is_homepage' => $isHome,
                'size'        => $file['size'],
                'modified'    => $file['modified'],
            ];
        }

        jsonResponse(['ok' => true, 'data' => ['pages' => $pages]]);
        return;
    }

    // Support subfolder browsing via ?dir= parameter
    $dir = trim((string) ($_GET['dir'] ?? ''), '/');

    // Get filesystem listing (directories + files)
    $listing = $fileManager->listPreviewDirectory($dir);

    // Enrich files with DB metadata
    $pages = [];
    foreach ($listing['files'] as $file) {
        $row = $db->queryOne(
            'SELECT id, slug, title, description, file_path, page_type,
                    nav_order, nav_label, is_published, is_homepage,
                    last_ai_edit, created_at, updated_at
             FROM pages WHERE file_path = ?',
            [$file['path']]
        );

        if ($row) {
            $content = $fileManager->readFile($row['file_path']);
            $row['size'] = $content !== null ? strlen($content) : 0;
            $row['path'] = $row['file_path'];
            $row['modified'] = $row['updated_at'];
            $pages[] = $row;
        } else {
            // File exists on disk but not in DB — return basic info
            $pages[] = array_merge($file, [
                'title'       => ucfirst(str_replace('-', ' ', $file['slug'])),
                'nav_order'   => null,
                'is_homepage' => 0,
            ]);
        }
    }

    // When browsing root, also do the original DB query to pick up pages
    // that exist in DB but might have been missed by filesystem listing
    if ($dir === '') {
        $dbRows = $db->query(
            'SELECT id, slug, title, description, file_path, page_type,
                    nav_order, nav_label, is_published, is_homepage,
                    last_ai_edit, created_at, updated_at
             FROM pages
             ORDER BY is_homepage DESC, nav_order ASC, title ASC'
        );

        // Merge: prefer DB data, avoid duplicates
        $existingSlugs = array_column($pages, 'slug');
        foreach ($dbRows as $row) {
            if (!in_array($row['slug'], $existingSlugs, true)) {
                $content = $fileManager->readFile($row['file_path']);
                $row['size'] = $content !== null ? strlen($content) : 0;
                $row['path'] = $row['file_path'];
                $row['modified'] = $row['updated_at'];
                $pages[] = $row;
            }
        }
    }

    // Sort pages to match website navigation order:
    // Homepage first, then by nav_order, then alphabetically by title.
    usort($pages, function ($a, $b) {
        $aHome = (int) ($a['is_homepage'] ?? 0);
        $bHome = (int) ($b['is_homepage'] ?? 0);
        if ($aHome !== $bHome) return $bHome - $aHome; // DESC

        $aNav = $a['nav_order'] ?? 9999;
        $bNav = $b['nav_order'] ?? 9999;
        if ($aNav !== $bNav) return $aNav - $bNav; // ASC

        return strcasecmp($a['title'] ?? '', $b['title'] ?? ''); // ASC
    });

    jsonResponse(['ok' => true, 'data' => [
        'pages'       => $pages,
        'directories' => $listing['directories'],
        'current_dir' => $dir,
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  GET /pages/:slug — Single page detail
// ═══════════════════════════════════════════

if ($method === 'GET' && isset($params['slug'])) {
    $slug = $params['slug'];

    $page = $db->queryOne(
        'SELECT * FROM pages WHERE slug = ?',
        [$slug]
    );

    if (!$page) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Page '{$slug}' not found.",
        ]], 404);
        return;
    }

    // Include file content
    $page['content'] = $fileManager->readFile($page['file_path']);
    $page['size'] = $page['content'] !== null ? strlen($page['content']) : 0;

    jsonResponse(['ok' => true, 'data' => ['page' => $page]]);
    return;
}

// ═══════════════════════════════════════════
//  PUT /pages/:slug — Update page metadata/slug
// ═══════════════════════════════════════════

if ($method === 'PUT' && isset($params['slug']) && $path === '/pages/' . $params['slug']) {
    $slug = (string) $params['slug'];
    $body = getJsonBody();

    $page = $db->queryOne('SELECT * FROM pages WHERE slug = ?', [$slug]);
    if (!$page) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Page '{$slug}' not found.",
        ]], 404);
        return;
    }

    $nextTitle = trim((string) ($body['title'] ?? $page['title']));
    if ($nextTitle === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Page title cannot be empty.',
        ]], 422);
        return;
    }

    $nextNavLabel = array_key_exists('nav_label', $body)
        ? trim((string) $body['nav_label'])
        : (string) ($page['nav_label'] ?? '');

    $nextSlug = $slug;
    $renamed = false;

    if (array_key_exists('slug', $body)) {
        $candidate = normalizePageSlug((string) $body['slug']);
        if ($candidate === '') {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'validation',
                'message' => 'Page slug is invalid.',
            ]], 422);
            return;
        }

        if ((int) ($page['is_homepage'] ?? 0) === 1 && $candidate !== 'index') {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'validation',
                'message' => 'Homepage slug must remain "index".',
            ]], 422);
            return;
        }

        if ($candidate !== $slug) {
            $existing = $db->queryOne('SELECT id FROM pages WHERE slug = ?', [$candidate]);
            if ($existing) {
                jsonResponse(['ok' => false, 'error' => [
                    'code'    => 'slug_taken',
                    'message' => "Page slug '{$candidate}' already exists.",
                ]], 409);
                return;
            }

            $nextSlug = $candidate;
            $renamed = true;
        }
    }

    $updates = [
        'title'      => $nextTitle,
        'nav_label'  => $nextNavLabel !== '' ? $nextNavLabel : null,
        'updated_at' => now(),
    ];
    $tailwindChangedPaths = [];

    $oldFilePath = (string) $page['file_path'];
    $newFilePath = $oldFilePath;

    if ($renamed) {
        $newFilePath = $nextSlug === 'index' ? 'index.php' : $nextSlug . '.php';
        $currentContent = $fileManager->readFile($oldFilePath);

        if ($currentContent === null) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'file_missing',
                'message' => "Page source file '{$oldFilePath}' is missing.",
            ]], 404);
            return;
        }

        $rewritten = updatePagePhpMeta($currentContent, $nextTitle, $nextSlug);
        $fileManager->writeFile($newFilePath, $rewritten);
        $tailwindChangedPaths[] = $newFilePath;
        if ($newFilePath !== $oldFilePath) {
            $fileManager->deleteFile($oldFilePath);
            $tailwindChangedPaths[] = $oldFilePath;
        }

        $tailwindChangedPaths = array_merge(
            $tailwindChangedPaths,
            updatePageReferencesForSlugChange($fileManager, $slug, $nextSlug)
        );

        $updates['slug'] = $nextSlug;
        $updates['file_path'] = $newFilePath;
    } else {
        // Keep PHP metadata coherent with table updates.
        $currentContent = $fileManager->readFile($oldFilePath);
        if ($currentContent !== null) {
            $rewritten = updatePagePhpMeta($currentContent, $nextTitle, $slug);
            if ($rewritten !== $currentContent) {
                $fileManager->writeFile($oldFilePath, $rewritten);
                $tailwindChangedPaths[] = $oldFilePath;
            }
        }
    }

    $db->update('pages', $updates, 'id = ?', [(int) $page['id']]);
    $fileManager->syncPageRegistry();
    $navSynced = syncPrimaryNavMenu($db, $fileManager);
    if ($navSynced) {
        $tailwindChangedPaths[] = '_partials/nav.php';
    }
    if ($fileManager->pathsAffectTailwind($tailwindChangedPaths)) {
        $fileManager->compileTailwind();
    }

    $fresh = $db->queryOne('SELECT * FROM pages WHERE slug = ?', [$nextSlug]);

    $suggestedPrompt = null;
    if ($renamed) {
        $suggestedPrompt = buildRenameCleanupPrompt($slug, $nextSlug, $nextTitle, $tailwindChangedPaths);
    }

    jsonResponse(['ok' => true, 'data' => [
        'page'             => $fresh,
        'renamed'          => $renamed,
        'old_slug'         => $slug,
        'suggested_prompt' => $suggestedPrompt,
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  PUT /pages/:slug/nav — Update nav settings
// ═══════════════════════════════════════════

if ($method === 'PUT' && str_ends_with($path, '/nav') && isset($params['slug'])) {
    $slug = $params['slug'];
    $body = getJsonBody();

    $page = $db->queryOne('SELECT id FROM pages WHERE slug = ?', [$slug]);
    if (!$page) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Page '{$slug}' not found.",
        ]], 404);
        return;
    }

    $updates = [];
    if (isset($body['nav_label'])) $updates['nav_label'] = $body['nav_label'];
    if (isset($body['nav_order'])) $updates['nav_order'] = (int) $body['nav_order'];
    if (isset($body['is_published'])) $updates['is_published'] = $body['is_published'] ? 1 : 0;
    if (isset($body['is_homepage'])) {
        // If setting as homepage, unset all others first
        if ($body['is_homepage']) {
            $db->update('pages', ['is_homepage' => 0], '1 = 1');
        }
        $updates['is_homepage'] = $body['is_homepage'] ? 1 : 0;
    }

    if (!empty($updates)) {
        $updates['updated_at'] = now();
        $db->update('pages', $updates, 'slug = ?', [$slug]);
        $navSynced = syncPrimaryNavMenu($db, $fileManager);
        if ($navSynced) {
            $fileManager->compileTailwind();
        }
    }

    jsonResponse(['ok' => true, 'data' => ['message' => 'Navigation updated.']]);
    return;
}

// ═══════════════════════════════════════════
//  PUT /pages/reorder — Reorder pages
// ═══════════════════════════════════════════

if ($method === 'PUT' && $path === '/pages/reorder') {
    $body = getJsonBody();
    $order = $body['order'] ?? [];

    if (!is_array($order)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Order must be an array of page slugs.',
        ]], 422);
        return;
    }

    foreach ($order as $position => $slug) {
        $db->update('pages', [
            'nav_order'  => $position,
            'updated_at' => now(),
        ], 'slug = ?', [$slug]);
    }
    $navSynced = syncPrimaryNavMenu($db, $fileManager);
    if ($navSynced) {
        $fileManager->compileTailwind();
    }

    jsonResponse(['ok' => true, 'data' => ['message' => 'Page order updated.']]);
    return;
}

// ═══════════════════════════════════════════
//  DELETE /pages/:slug — Delete a page
// ═══════════════════════════════════════════

if ($method === 'DELETE' && isset($params['slug'])) {
    $slug = $params['slug'];

    $page = $db->queryOne('SELECT id, title, file_path, is_homepage FROM pages WHERE slug = ?', [$slug]);

    if (!$page) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Page '{$slug}' not found.",
        ]], 404);
        return;
    }

    if ($page['is_homepage']) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Cannot delete the homepage. Set another page as homepage first.',
        ]], 422);
        return;
    }

    $pageTitle = $page['title'] ?? ucfirst(str_replace('-', ' ', $slug));
    $tailwindChangedPaths = [(string) $page['file_path']];

    // Delete the file
    try {
        $fileManager->deleteFile($page['file_path']);
    } catch (\Throwable $e) {
        // File may already be deleted; continue with DB cleanup
    }

    // Remove from database
    $db->delete('pages', 'slug = ?', [$slug]);

    // Remove references from ALL preview files — nav, footer, cross-links.
    $cleanupResult = removePageReferencesAfterDelete($fileManager, $slug);
    $tailwindChangedPaths = array_merge($tailwindChangedPaths, $cleanupResult['updated_files']);

    // Also try BEM-style nav rebuild as bonus
    $navSynced = syncPrimaryNavMenu($db, $fileManager);
    if ($navSynced) {
        $tailwindChangedPaths[] = '_partials/nav.php';
    }
    if ($fileManager->pathsAffectTailwind($tailwindChangedPaths)) {
        $fileManager->compileTailwind();
    }

    $suggestedPrompt = buildDeleteCleanupPrompt($slug, $pageTitle, $cleanupResult['updated_files']);

    jsonResponse(['ok' => true, 'data' => [
        'message'          => "Page '{$slug}' deleted.",
        'updated_files'    => $cleanupResult['updated_files'],
        'suggested_prompt' => $suggestedPrompt,
    ]]);
    return;
}

jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Pages endpoint not found.',
]], 404);

// ═══════════════════════════════════════════════════
//  Helper: Normalize slug
// ═══════════════════════════════════════════════════

/**
 * Normalize user-provided page slug.
 */
function normalizePageSlug(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9-]+/', '-', $value) ?? '';
    $value = trim($value, '-');
    return $value;
}

// ═══════════════════════════════════════════════════
//  Helper: Update PHP metadata in page files
// ═══════════════════════════════════════════════════

/**
 * Update common `$page` metadata in a generated PHP page file.
 */
function updatePagePhpMeta(string $content, string $title, string $slug): string
{
    $escapedTitle = addslashes($title);
    $escapedSlug = addslashes($slug);

    $updated = preg_replace(
        '/([\'"]title[\'"]\s*=>\s*[\'"])(.*?)([\'"])/i',
        '$1' . $escapedTitle . '$3',
        $content,
        1
    );
    if ($updated === null) {
        $updated = $content;
    }

    $updated = preg_replace(
        '/([\'"]slug[\'"]\s*=>\s*[\'"])(.*?)([\'"])/i',
        '$1' . $escapedSlug . '$3',
        $updated,
        1
    );

    return $updated ?? $content;
}

// ═══════════════════════════════════════════════════
//  Slug Rename: Update references across all files
// ═══════════════════════════════════════════════════

/**
 * Update href references and nav target after a page slug rename.
 *
 * @return array<int, string> updated file paths
 */
function updatePageReferencesForSlugChange(FileManager $fileManager, string $oldSlug, string $newSlug): array
{
    $updatedFiles = [];

    foreach (collectAllPreviewPaths($fileManager) as $path) {
        $content = $fileManager->readFile($path);
        if ($content === null) {
            continue;
        }

        $rewritten = rewriteHrefSlug($content, $oldSlug, $newSlug);
        $rewritten = rewritePageSlugComparisons($rewritten, $oldSlug, $newSlug);
        if ($rewritten !== $content) {
            $fileManager->writeFile($path, $rewritten);
            $updatedFiles[] = $path;
        }
    }

    return $updatedFiles;
}

/**
 * Build a suggested AI prompt after a slug rename for thorough review.
 */
function buildRenameCleanupPrompt(string $oldSlug, string $newSlug, string $newTitle, array $updatedFiles): string
{
    $fileList = empty($updatedFiles)
        ? 'No files were automatically updated.'
        : 'Files updated: ' . implode(', ', $updatedFiles) . '.';

    return "The page \"/{$oldSlug}\" has been renamed to \"/{$newSlug}\" (title: \"{$newTitle}\"). "
        . "{$fileList} "
        . "Please review all navigation menus, footer links, and page cross-references to ensure: "
        . "1) All links now point to /{$newSlug} instead of /{$oldSlug}. "
        . "2) Navigation labels are updated if they should reflect the new title. "
        . "3) Active-state conditionals use the correct slug. "
        . "4) Any CTA buttons referencing the old URL are updated.";
}

// ═══════════════════════════════════════════════════
//  Page Delete: Multi-pass reference cleanup
// ═══════════════════════════════════════════════════

/**
 * Remove all references to a deleted page across preview files.
 *
 * Multi-pass approach:
 * - Pass 1: In partials — remove entire <li> elements containing dead links
 * - Pass 2: In partials — remove standalone <a> elements pointing to deleted page
 * - Pass 3: In page files — unlink <a> tags (keep text content, remove wrapper)
 * - Pass 4: Everywhere — remove PHP active-state conditionals for the deleted slug
 * - Pass 5: Everywhere — clean up empty containers (<ul>/<ol> left empty)
 *
 * @return array{updated_files: string[]}
 */
function removePageReferencesAfterDelete(FileManager $fileManager, string $deletedSlug): array
{
    $updatedFiles = [];
    $hrefPattern = buildSlugHrefPattern($deletedSlug);

    foreach (collectAllPreviewPaths($fileManager) as $path) {
        $content = $fileManager->readFile($path);
        if ($content === null) {
            continue;
        }

        $original = $content;
        $isPartial = str_starts_with($path, '_partials/');

        if ($isPartial) {
            // Partials (nav, footer, header): remove entire navigation items
            $content = removeListItemsForSlug($content, $hrefPattern);
            $content = removeStandaloneLinksForSlug($content, $hrefPattern);
        } else {
            // Page files: unlink dead references (keep visible text)
            $content = unlinkReferencesToSlug($content, $hrefPattern);
        }

        // Clean up PHP active-state conditionals referencing the deleted slug
        $content = removeSlugConditionals($content, $deletedSlug);

        // Remove empty containers left after cleanup
        $content = cleanupEmptyContainers($content);

        if ($content !== $original) {
            $fileManager->writeFile($path, $content);
            $updatedFiles[] = $path;
        }
    }

    return ['updated_files' => $updatedFiles];
}

/**
 * Build a suggested AI prompt for post-delete review.
 */
function buildDeleteCleanupPrompt(string $slug, string $title, array $updatedFiles): string
{
    $fileList = empty($updatedFiles)
        ? 'No files needed automatic cleanup.'
        : 'I automatically cleaned up: ' . implode(', ', $updatedFiles) . '.';

    return "The \"{$title}\" page (/{$slug}) has been deleted. {$fileList} "
        . "Please review all pages and partials to ensure: "
        . "1) No broken links or references to /{$slug} remain anywhere. "
        . "2) Navigation menus (header, mobile, footer) look correct after the removal. "
        . "3) Any CTA buttons, section links, or internal references that pointed to this page are removed or redirected. "
        . "4) The layout still looks balanced after the nav item removal.";
}

// ═══════════════════════════════════════════════════
//  Reference Cleanup Engine — Core Functions
// ═══════════════════════════════════════════════════

/**
 * Collect all preview file paths (pages + partials).
 *
 * @return string[]
 */
function collectAllPreviewPaths(FileManager $fileManager): array
{
    $paths = [];
    foreach ($fileManager->listPreviewFiles() as $file) {
        $paths[] = (string) $file['path'];
    }
    return array_values(array_unique($paths));
}

/**
 * Build a regex pattern that matches all possible href formats for a slug.
 *
 * Matches: /slug, /slug/, /slug.php, slug, slug.php, ./slug, ./slug.php
 */
function buildSlugHrefPattern(string $slug): string
{
    $escaped = preg_quote($slug, '/');
    return '(?:\.?\/?)' . $escaped . '(?:\.php)?(?:\/)?';
}

/**
 * Regex fragment for matching inside HTML tag brackets, handling PHP template syntax.
 *
 * Standard [^>]* fails when PHP template tags appear inside HTML attributes,
 * because the closing sequence gets treated as the tag boundary.
 * This pattern handles that by explicitly matching complete PHP blocks.
 */
function phpAwareTagContent(): string
{
    // Matches: normal chars (not >) OR complete PHP template tags
    return '(?:[^>]|<\?(?:=|php\b).*?\?>)*';
}

/**
 * Remove entire <li> elements that contain links to the given slug.
 *
 * Handles both single-line and multi-line <li> elements.
 * Uses a tempered greedy token to avoid crossing <li> boundaries.
 * Handles PHP template syntax inside HTML attributes.
 */
function removeListItemsForSlug(string $content, string $hrefPattern): string
{
    $tc = phpAwareTagContent();

    // Match: whitespace? li-open content a-href-slug content li-close whitespace?
    // The tempered greedy token prevents crossing li nesting boundaries
    $pattern = '/[ \t]*<li\b' . $tc . '>'
        . '(?:(?!<\/li>|<li\b).)*?'
        . '<a\s' . $tc . '?\bhref\s*=\s*["\']' . $hrefPattern . '["\']' . $tc . '>'
        . '(?:(?!<\/li>).)*?'
        . '<\/li>'
        . '[ \t]*(?:\r?\n)?/si';

    return preg_replace($pattern, '', $content) ?? $content;
}

/**
 * Remove standalone <a> elements pointing to the deleted slug.
 *
 * Used in partials (nav, footer) where links may not be wrapped in <li>.
 * For example: <nav class="flex gap-4"><a href="/about">About</a></nav>
 * After removeListItemsForSlug, only non-<li>-wrapped links remain.
 */
function removeStandaloneLinksForSlug(string $content, string $hrefPattern): string
{
    $tc = phpAwareTagContent();

    // Match: <a ...href="/slug"...>...</a> with surrounding whitespace
    $pattern = '/[ \t]*<a\s' . $tc . '?\bhref\s*=\s*["\']' . $hrefPattern . '["\']' . $tc . '>'
        . '(?:(?!<\/a>).)*?'
        . '<\/a>'
        . '[ \t]*(?:\r?\n)?/si';

    return preg_replace($pattern, '', $content) ?? $content;
}

/**
 * Unlink <a> tags pointing to the deleted slug in page body content.
 *
 * Keeps the visible text/HTML, removes the <a> wrapper.
 * <a href="/slug" class="btn">Read More</a> → Read More
 */
function unlinkReferencesToSlug(string $content, string $hrefPattern): string
{
    $tc = phpAwareTagContent();

    // Replace <a href="/slug"...>CONTENT</a> with just CONTENT
    $pattern = '/<a\s' . $tc . '?\bhref\s*=\s*["\']' . $hrefPattern . '["\']' . $tc . '>'
        . '((?:(?!<\/a>).)*?)'
        . '<\/a>/si';

    return preg_replace($pattern, '$1', $content) ?? $content;
}

/**
 * Remove PHP conditional blocks that reference the deleted slug.
 *
 * Handles inline PHP echo patterns for active-state checks
 * (e.g., slug comparison ternaries injected by nav template builders).
 */
function removeSlugConditionals(string $content, string $slug): string
{
    $escaped = preg_quote($slug, '/');

    // Pattern: inline PHP echo with slug conditional → remove entirely
    $pattern = '/\s*<\?=\s*'
        . '\(?\s*\$page\s*\[\s*[\'"]slug[\'"]\s*\]'
        . '(?:\s*\?\?\s*[\'"][\'"])?\s*\)?'
        . '\s*={2,3}\s*'
        . '[\'"]' . $escaped . '[\'"]\s*'
        . '\?[^?]*?\?>/si';

    return preg_replace($pattern, '', $content) ?? $content;
}

/**
 * Clean up empty containers and excessive whitespace after item removal.
 */
function cleanupEmptyContainers(string $content): string
{
    // Remove <ul>...</ul> with only whitespace content
    $content = preg_replace('/<ul\b[^>]*>\s*<\/ul>\s*/si', '', $content) ?? $content;

    // Remove <ol>...</ol> with only whitespace content
    $content = preg_replace('/<ol\b[^>]*>\s*<\/ol>\s*/si', '', $content) ?? $content;

    // Collapse 3+ consecutive blank lines to 2
    $content = preg_replace('/\n{3,}/', "\n\n", $content) ?? $content;

    return $content;
}

// ═══════════════════════════════════════════════════
//  Href/Slug rewrite helpers (used by rename)
// ═══════════════════════════════════════════════════

/**
 * Rewrite href values that target a given slug.
 */
function rewriteHrefSlug(string $content, string $oldSlug, string $replacement): string
{
    $normalizedOld = strtolower(trim($oldSlug));

    return preg_replace_callback(
        '/(<a\b[^>]*\bhref\s*=\s*[\'"])([^\'"]+)([\'"])/i',
        static function (array $m) use ($normalizedOld, $replacement): string {
            $prefix = $m[1];
            $href = $m[2];
            $suffix = $m[3];

            $parts = preg_split('/([?#].*)/', $href, 2, PREG_SPLIT_DELIM_CAPTURE);
            $path = $parts[0] ?? $href;
            $tail = $parts[1] ?? '';

            $normalized = strtolower(trim($path));
            $matches = [
                '/' . $normalizedOld,
                '/' . $normalizedOld . '/',
                '/' . $normalizedOld . '.php',
                $normalizedOld,
                $normalizedOld . '.php',
                './' . $normalizedOld,
                './' . $normalizedOld . '.php',
            ];

            if (!in_array($normalized, $matches, true)) {
                return $m[0];
            }

            if ($replacement === '#') {
                return $prefix . '#' . $suffix;
            }

            return $prefix . '/' . ltrim($replacement, '/') . $tail . $suffix;
        },
        $content
    ) ?? $content;
}

/**
 * Rewrite page-slug comparisons used for active nav states.
 */
function rewritePageSlugComparisons(string $content, string $oldSlug, string $newSlug): string
{
    $normalizedOld = strtolower(trim($oldSlug));

    $updated = preg_replace_callback(
        '/(\(?\s*\$page\s*\[\s*[\'"]slug[\'"]\s*\](?:\s*\?\?\s*[\'"]\s*[\'"])?\s*\)?\s*===\s*)([\'"])([^\'"]+)(\2)/i',
        static function (array $m) use ($normalizedOld, $newSlug): string {
            if (strtolower(trim($m[3])) !== $normalizedOld) {
                return $m[0];
            }

            return $m[1] . $m[2] . $newSlug . $m[4];
        },
        $content
    ) ?? $content;

    // Broader fallback for variants that don't match the strict null-coalesce form.
    $fallback = preg_replace_callback(
        '/(\$page\s*\[\s*[\'"]slug[\'"]\s*\][^=\r\n]{0,60}={2,3}\s*)([\'"])([^\'"]+)(\2)/i',
        static function (array $m) use ($normalizedOld, $newSlug): string {
            if (strtolower(trim($m[3])) !== $normalizedOld) {
                return $m[0];
            }
            return $m[1] . $m[2] . $newSlug . $m[4];
        },
        $updated
    );

    return $fallback ?? $updated;
}

// ═══════════════════════════════════════════════════
//  BEM Nav Sync (bonus for template-based navs)
// ═══════════════════════════════════════════════════

/**
 * Build the primary nav menu from pages table and inject into nav partial.
 *
 * Only works for navs with the site-nav__menu BEM class.
 * AI-generated Tailwind navs are handled by the multi-pass cleanup above.
 */
function syncPrimaryNavMenu(Database $db, FileManager $fileManager): bool
{
    $content = $fileManager->readFile('_partials/nav.php');
    if ($content === null) {
        return false;
    }

    if (!preg_match('/<ul\b[^>]*class\s*=\s*[\'\"][^\'\"]*\bsite-nav__menu\b[^\'\"]*[\'\"]/i', $content)) {
        return false;
    }

    $rows = $db->query(
        "SELECT slug, title, nav_label, is_homepage
         FROM pages
         WHERE page_type = 'page'
         ORDER BY is_homepage DESC, nav_order ASC, title ASC"
    );

    $items = [];
    foreach ($rows as $row) {
        $slug = strtolower(trim((string) ($row['slug'] ?? '')));
        if ($slug === '') {
            continue;
        }

        $labelRaw = trim((string) (($row['nav_label'] ?? '') !== '' ? $row['nav_label'] : ($row['title'] ?? '')));
        if ($labelRaw === '') {
            $labelRaw = ucfirst(str_replace('-', ' ', $slug));
        }

        $label = htmlspecialchars($labelRaw, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $safeSlug = htmlspecialchars($slug, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $href = $slug === 'index' ? '/' : '/' . ltrim($safeSlug, '/');

        $phpTag = '<' . '?= ($page[\'slug\'] ?? \'\') === \'' . $safeSlug . '\' ? \'aria-current="page"\' : \'\' ?' . '>';
        $items[] = "      <li><a href=\"{$href}\" class=\"site-nav__link\" {$phpTag}>{$label}</a></li>";
    }

    $menuInner = empty($items) ? '' : ("\n" . implode("\n", $items) . "\n    ");
    $updated = preg_replace(
        '/(<ul\b[^>]*class\s*=\s*[\'\"][^\'\"]*\bsite-nav__menu\b[^\'\"]*[\'\"]\s*>)([\s\S]*?)(<\/ul>)/i',
        '$1' . $menuInner . '$3',
        $content,
        1
    );

    if ($updated !== null && $updated !== $content) {
        $fileManager->writeFile('_partials/nav.php', $updated);
        return true;
    }

    return false;
}
