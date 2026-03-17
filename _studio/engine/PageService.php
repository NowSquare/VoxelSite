<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * PageService — shared page CRUD logic.
 *
 * Extracted from _studio/api/endpoints/pages.php so both the
 * Studio UI endpoints and the Agent API can reuse the same logic.
 *
 * This service is stateless — all dependencies are injected.
 *
 * Full behavioral parity with the Studio pages endpoint:
 * - Rename: slug-reference rewrite across all preview files + nav rebuild
 * - Delete: multi-pass reference cleanup across all preview files + nav rebuild
 */
class PageService
{
    private Database $db;
    private FileManager $fileManager;

    public function __construct(?Database $db = null, ?FileManager $fileManager = null)
    {
        $this->db = $db ?? Database::getInstance();
        $this->fileManager = $fileManager ?? new FileManager($this->db);
    }

    // ═══════════════════════════════════════════
    //  Read Operations
    // ═══════════════════════════════════════════

    /**
     * List pages with optional pagination.
     *
     * @return array{pages: array, total: int, page: int, per_page: int}
     */
    public function listPages(int $page = 1, int $perPage = 50): array
    {
        $this->fileManager->syncPageRegistry();

        $total = (int) $this->db->scalar('SELECT COUNT(*) FROM pages');

        $offset = ($page - 1) * $perPage;
        $rows = $this->db->query(
            'SELECT id, slug, title, description, file_path, page_type,
                    nav_order, nav_label, is_published, is_homepage,
                    last_ai_edit, created_at, updated_at
             FROM pages
             ORDER BY is_homepage DESC, nav_order ASC, title ASC
             LIMIT ? OFFSET ?',
            [$perPage, $offset]
        );

        foreach ($rows as &$row) {
            $content = $this->fileManager->readFile($row['file_path']);
            $row['size'] = $content !== null ? strlen($content) : 0;
        }
        unset($row);

        return [
            'pages'    => $rows,
            'total'    => $total,
            'page'     => $page,
            'per_page' => $perPage,
        ];
    }

    /**
     * Get a single page by slug, including content.
     *
     * @return array|null  Page row with 'content' field, or null if not found
     */
    public function getPage(string $slug): ?array
    {
        $page = $this->db->queryOne('SELECT * FROM pages WHERE slug = ?', [$slug]);
        if (!$page) {
            return null;
        }

        $page['content'] = $this->fileManager->readFile($page['file_path']);
        $page['size'] = $page['content'] !== null ? strlen($page['content']) : 0;

        return $page;
    }

    // ═══════════════════════════════════════════
    //  Write Operations
    // ═══════════════════════════════════════════

    /**
     * Create a new page.
     *
     * @return array{page: array}
     * @throws \RuntimeException on validation failures
     */
    public function createPage(string $slug, string $title, string $content = '', string $source = 'studio'): array
    {
        $slug = self::normalizeSlug($slug);
        if ($slug === '') {
            throw new \RuntimeException('Page slug is invalid.');
        }

        $title = trim($title);
        if ($title === '') {
            throw new \RuntimeException('Page title cannot be empty.');
        }

        // Check for duplicate slug
        $existing = $this->db->queryOne('SELECT id FROM pages WHERE slug = ?', [$slug]);
        if ($existing) {
            throw new \RuntimeException("Page slug '{$slug}' already exists.", 409);
        }

        // Build the file content
        $filePath = $slug === 'index' ? 'index.php' : $slug . '.php';

        if ($content === '') {
            $escapedTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
            $content = "<?php \$page = ['title' => '{$escapedTitle}', 'slug' => '{$slug}']; ?>\n"
                . "<main>\n  <h1>{$escapedTitle}</h1>\n  <p>Start editing this page.</p>\n</main>\n";
        }

        $this->fileManager->writeFile($filePath, $content);
        $this->fileManager->syncPageRegistry();

        $now = now();
        $pageId = $this->db->queryOne('SELECT id FROM pages WHERE slug = ?', [$slug]);

        if (!$pageId) {
            // syncPageRegistry should have created it, but just in case
            $this->db->insert('pages', [
                'slug'      => $slug,
                'title'     => $title,
                'file_path' => $filePath,
                'page_type' => 'page',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        } else {
            $this->db->update('pages', [
                'title'      => $title,
                'updated_at' => $now,
            ], 'slug = ?', [$slug]);
        }

        // Nav rebuild + Tailwind recompile
        $this->syncNav();
        if ($this->fileManager->pathAffectsTailwind($filePath)) {
            $this->fileManager->compileTailwind();
        }

        return ['page' => $this->getPage($slug)];
    }

    /**
     * Update page content and/or metadata.
     *
     * On rename: performs slug-reference rewrite across all preview files
     * and nav sync, matching the Studio pages endpoint behavior.
     *
     * @return array{page: array, renamed: bool, updated_files: string[], suggested_prompt: string|null}
     * @throws \RuntimeException on validation failures
     */
    public function updatePage(string $slug, array $updates, string $source = 'studio'): array
    {
        $page = $this->db->queryOne('SELECT * FROM pages WHERE slug = ?', [$slug]);
        if (!$page) {
            throw new \RuntimeException("Page '{$slug}' not found.", 404);
        }

        $dbUpdates = ['updated_at' => now()];
        $tailwindChangedPaths = [];
        $renamed = false;
        $nextSlug = $slug;
        $suggestedPrompt = null;

        // Title update
        if (isset($updates['title'])) {
            $nextTitle = trim($updates['title']);
            if ($nextTitle === '') {
                throw new \RuntimeException('Page title cannot be empty.');
            }
            $dbUpdates['title'] = $nextTitle;
        } else {
            $nextTitle = $page['title'];
        }

        // Nav label update
        if (array_key_exists('nav_label', $updates)) {
            $dbUpdates['nav_label'] = trim($updates['nav_label']) ?: null;
        }

        // Slug rename
        if (isset($updates['slug'])) {
            $candidate = self::normalizeSlug($updates['slug']);
            if ($candidate === '') {
                throw new \RuntimeException('Page slug is invalid.');
            }

            if ((int) ($page['is_homepage'] ?? 0) === 1 && $candidate !== 'index') {
                throw new \RuntimeException('Homepage slug must remain "index".');
            }

            if ($candidate !== $slug) {
                $existing = $this->db->queryOne('SELECT id FROM pages WHERE slug = ?', [$candidate]);
                if ($existing) {
                    throw new \RuntimeException("Page slug '{$candidate}' already exists.", 409);
                }

                $nextSlug = $candidate;
                $renamed = true;

                $oldFilePath = (string) $page['file_path'];
                $newFilePath = $nextSlug === 'index' ? 'index.php' : $nextSlug . '.php';
                $currentContent = $this->fileManager->readFile($oldFilePath);

                if ($currentContent === null) {
                    throw new \RuntimeException("Page source file '{$oldFilePath}' is missing.", 404);
                }

                $rewritten = self::updatePhpMeta($currentContent, $nextTitle, $nextSlug);
                $this->fileManager->writeFile($newFilePath, $rewritten);
                $tailwindChangedPaths[] = $newFilePath;

                if ($newFilePath !== $oldFilePath) {
                    $this->fileManager->deleteFile($oldFilePath);
                    $tailwindChangedPaths[] = $oldFilePath;
                }

                // Cross-file slug-reference rewrite (matching Studio pages.php behavior)
                $refUpdatedFiles = $this->updatePageReferencesForSlugChange($slug, $nextSlug);
                $tailwindChangedPaths = array_merge($tailwindChangedPaths, $refUpdatedFiles);

                $dbUpdates['slug'] = $nextSlug;
                $dbUpdates['file_path'] = $newFilePath;
            }
        }

        // Content update (e.g., from Agent API)
        if (isset($updates['content'])) {
            $filePath = $renamed ? ($dbUpdates['file_path'] ?? $page['file_path']) : $page['file_path'];
            $this->fileManager->writeFile($filePath, $updates['content']);
            $tailwindChangedPaths[] = $filePath;
        } elseif (!$renamed && isset($dbUpdates['title'])) {
            // Keep PHP metadata coherent with table updates.
            $currentContent = $this->fileManager->readFile($page['file_path']);
            if ($currentContent !== null) {
                $rewritten = self::updatePhpMeta($currentContent, $nextTitle, $slug);
                if ($rewritten !== $currentContent) {
                    $this->fileManager->writeFile($page['file_path'], $rewritten);
                    $tailwindChangedPaths[] = $page['file_path'];
                }
            }
        }

        // Apply DB updates
        $this->db->update('pages', $dbUpdates, 'id = ?', [(int) $page['id']]);
        $this->fileManager->syncPageRegistry();

        // Nav sync (always on rename, also catches label/title changes)
        $navSynced = $this->syncNav();
        if ($navSynced) {
            $tailwindChangedPaths[] = '_partials/nav.php';
        }

        // Tailwind recompile
        if ($this->fileManager->pathsAffectTailwind($tailwindChangedPaths)) {
            $this->fileManager->compileTailwind();
        }

        // Build suggested prompt for rename cleanup review
        if ($renamed) {
            $suggestedPrompt = $this->buildRenameCleanupPrompt($slug, $nextSlug, $nextTitle, $tailwindChangedPaths);
        }

        return [
            'page'             => $this->getPage($nextSlug),
            'renamed'          => $renamed,
            'updated_files'    => $tailwindChangedPaths,
            'suggested_prompt' => $suggestedPrompt,
        ];
    }

    /**
     * Delete a page by slug.
     *
     * Performs full cross-file reference cleanup and nav sync,
     * matching the Studio pages endpoint behavior.
     *
     * @throws \RuntimeException if page not found or is homepage
     */
    public function deletePage(string $slug): array
    {
        $page = $this->db->queryOne(
            'SELECT id, title, file_path, is_homepage FROM pages WHERE slug = ?',
            [$slug]
        );

        if (!$page) {
            throw new \RuntimeException("Page '{$slug}' not found.", 404);
        }

        if ($page['is_homepage']) {
            throw new \RuntimeException('Cannot delete the homepage. Set another page as homepage first.', 422);
        }

        $pageTitle = $page['title'] ?? ucfirst(str_replace('-', ' ', $slug));
        $tailwindChangedPaths = [(string) $page['file_path']];

        try {
            $this->fileManager->deleteFile($page['file_path']);
        } catch (\Throwable) {
            // File may already be deleted; continue with DB cleanup
        }

        $this->db->delete('pages', 'slug = ?', [$slug]);

        // Cross-file reference cleanup (matching Studio pages.php behavior)
        $cleanupResult = $this->removePageReferencesAfterDelete($slug);
        $tailwindChangedPaths = array_merge($tailwindChangedPaths, $cleanupResult['updated_files']);

        // Nav rebuild
        $navSynced = $this->syncNav();
        if ($navSynced) {
            $tailwindChangedPaths[] = '_partials/nav.php';
        }

        // Tailwind recompile
        if ($this->fileManager->pathsAffectTailwind($tailwindChangedPaths)) {
            $this->fileManager->compileTailwind();
        }

        $suggestedPrompt = $this->buildDeleteCleanupPrompt($slug, $pageTitle, $cleanupResult['updated_files']);

        return [
            'message'          => "Page '{$slug}' deleted.",
            'slug'             => $slug,
            'updated_files'    => $cleanupResult['updated_files'],
            'suggested_prompt' => $suggestedPrompt,
        ];
    }

    // ═══════════════════════════════════════════
    //  Slug Rename: Cross-file Reference Updates
    // ═══════════════════════════════════════════

    /**
     * Update href references and active-state comparisons across all preview files.
     *
     * @return string[] Updated file paths
     */
    private function updatePageReferencesForSlugChange(string $oldSlug, string $newSlug): array
    {
        $updatedFiles = [];

        foreach ($this->collectAllPreviewPaths() as $path) {
            $content = $this->fileManager->readFile($path);
            if ($content === null) {
                continue;
            }

            $rewritten = self::rewriteHrefSlug($content, $oldSlug, $newSlug);
            $rewritten = self::rewritePageSlugComparisons($rewritten, $oldSlug, $newSlug);
            if ($rewritten !== $content) {
                $this->fileManager->writeFile($path, $rewritten);
                $updatedFiles[] = $path;
            }
        }

        return $updatedFiles;
    }

    // ═══════════════════════════════════════════
    //  Page Delete: Multi-pass Reference Cleanup
    // ═══════════════════════════════════════════

    /**
     * Remove all references to a deleted page across preview files.
     *
     * Multi-pass approach (identical to Studio pages.php):
     * - Pass 1: In partials — remove entire <li> elements containing dead links
     * - Pass 2: In partials — remove standalone <a> elements pointing to deleted page
     * - Pass 3: In page files — unlink <a> tags (keep text content, remove wrapper)
     * - Pass 4: Everywhere — remove PHP active-state conditionals for the deleted slug
     * - Pass 5: Everywhere — clean up empty containers (<ul>/<ol> left empty)
     *
     * @return array{updated_files: string[]}
     */
    private function removePageReferencesAfterDelete(string $deletedSlug): array
    {
        $updatedFiles = [];
        $hrefPattern = self::buildSlugHrefPattern($deletedSlug);

        foreach ($this->collectAllPreviewPaths() as $path) {
            $content = $this->fileManager->readFile($path);
            if ($content === null) {
                continue;
            }

            $original = $content;
            $isPartial = str_starts_with($path, '_partials/');

            if ($isPartial) {
                $content = self::removeListItemsForSlug($content, $hrefPattern);
                $content = self::removeStandaloneLinksForSlug($content, $hrefPattern);
            } else {
                $content = self::unlinkReferencesToSlug($content, $hrefPattern);
            }

            $content = self::removeSlugConditionals($content, $deletedSlug);
            $content = self::cleanupEmptyContainers($content);

            if ($content !== $original) {
                $this->fileManager->writeFile($path, $content);
                $updatedFiles[] = $path;
            }
        }

        return ['updated_files' => $updatedFiles];
    }

    // ═══════════════════════════════════════════
    //  Nav Sync
    // ═══════════════════════════════════════════

    /**
     * Build the primary nav menu from pages table and inject into nav partial.
     * Only works for navs with the site-nav__menu BEM class.
     *
     * @return bool True if nav was updated
     */
    private function syncNav(): bool
    {
        $content = $this->fileManager->readFile('_partials/nav.php');
        if ($content === null) {
            return false;
        }

        if (!preg_match('/\<ul\b[^\>]*class\s*=\s*[\'\""][^\'\""]*\bsite-nav__menu\b[^\'\""]*[\'\""]/i', $content)) {
            return false;
        }

        $rows = $this->db->query(
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
            '/(\<ul\b[^\>]*class\s*=\s*[\'\""][^\'\""]*\bsite-nav__menu\b[^\'\""]*[\'\""]\s*\>)([\s\S]*?)(\<\/ul\>)/i',
            '$1' . $menuInner . '$3',
            $content,
            1
        );

        if ($updated !== null && $updated !== $content) {
            $this->fileManager->writeFile('_partials/nav.php', $updated);
            return true;
        }

        return false;
    }

    // ═══════════════════════════════════════════
    //  Cleanup Prompt Builders
    // ═══════════════════════════════════════════

    private function buildRenameCleanupPrompt(string $oldSlug, string $newSlug, string $newTitle, array $updatedFiles): string
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

    private function buildDeleteCleanupPrompt(string $slug, string $title, array $updatedFiles): string
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

    // ═══════════════════════════════════════════
    //  Reference Cleanup Engine — Core Functions
    //  (Ported from pages.php for behavioral parity)
    // ═══════════════════════════════════════════

    private function collectAllPreviewPaths(): array
    {
        $paths = [];
        foreach ($this->fileManager->listPreviewFiles() as $file) {
            $paths[] = (string) $file['path'];
        }
        return array_values(array_unique($paths));
    }

    private static function buildSlugHrefPattern(string $slug): string
    {
        $escaped = preg_quote($slug, '/');
        return '(?:\.?\\/?)' . $escaped . '(?:\\.php)?(?:\\/)?';
    }

    private static function phpAwareTagContent(): string
    {
        return '(?:[^>]|<\?(?:=|php\b).*?\?>)*';
    }

    private static function removeListItemsForSlug(string $content, string $hrefPattern): string
    {
        $tc = self::phpAwareTagContent();
        $pattern = '/[ \t]*<li\b' . $tc . '>'
            . '(?:(?!<\/li>|<li\b).)*?'
            . '<a\s' . $tc . '?\bhref\s*=\s*["\']' . $hrefPattern . '["\']' . $tc . '>'
            . '(?:(?!<\/li>).)*?'
            . '<\/li>'
            . '[ \t]*(?:\r?\n)?/si';
        return preg_replace($pattern, '', $content) ?? $content;
    }

    private static function removeStandaloneLinksForSlug(string $content, string $hrefPattern): string
    {
        $tc = self::phpAwareTagContent();
        $pattern = '/[ \t]*<a\s' . $tc . '?\bhref\s*=\s*["\']' . $hrefPattern . '["\']' . $tc . '>'
            . '(?:(?!<\/a>).)*?'
            . '<\/a>'
            . '[ \t]*(?:\r?\n)?/si';
        return preg_replace($pattern, '', $content) ?? $content;
    }

    private static function unlinkReferencesToSlug(string $content, string $hrefPattern): string
    {
        $tc = self::phpAwareTagContent();
        $pattern = '/<a\s' . $tc . '?\bhref\s*=\s*["\']' . $hrefPattern . '["\']' . $tc . '>'
            . '((?:(?!<\/a>).)*?)'
            . '<\/a>/si';
        return preg_replace($pattern, '$1', $content) ?? $content;
    }

    private static function removeSlugConditionals(string $content, string $slug): string
    {
        $escaped = preg_quote($slug, '/');
        $pattern = '/\s*<\?=\s*'
            . '\(?\s*\$page\s*\[\s*[\'""]slug[\'""]\s*\]'
            . '(?:\s*\?\?\s*[\'""][\'""])?\\s*\)?\s*'
            . '={2,3}\s*'
            . '[\'""]' . $escaped . '[\'""]\s*'
            . '\?[^?]*?\?>/si';
        return preg_replace($pattern, '', $content) ?? $content;
    }

    private static function cleanupEmptyContainers(string $content): string
    {
        $content = preg_replace('/<ul\b[^>]*>\s*<\/ul>\s*/si', '', $content) ?? $content;
        $content = preg_replace('/<ol\b[^>]*>\s*<\/ol>\s*/si', '', $content) ?? $content;
        $content = preg_replace('/\n{3,}/', "\n\n", $content) ?? $content;
        return $content;
    }

    private static function rewriteHrefSlug(string $content, string $oldSlug, string $replacement): string
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

    private static function rewritePageSlugComparisons(string $content, string $oldSlug, string $newSlug): string
    {
        $normalizedOld = strtolower(trim($oldSlug));

        $updated = preg_replace_callback(
            '/(\(?\s*\$page\s*\[\s*[\'""]slug[\'""]\s*\](?:\s*\?\?\s*[\'""]\\s*[\'"""])?\s*\)?\s*===\s*)([\'"])([^\'"]+)(\2)/i',
            static function (array $m) use ($normalizedOld, $newSlug): string {
                if (strtolower(trim($m[3])) !== $normalizedOld) {
                    return $m[0];
                }
                return $m[1] . $m[2] . $newSlug . $m[4];
            },
            $content
        ) ?? $content;

        $fallback = preg_replace_callback(
            '/(\$page\s*\[\s*[\'""]slug[\'""]\s*\][^=\r\n]{0,60}={2,3}\s*)([\'"])([^\'"]+)(\2)/i',
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

    // ═══════════════════════════════════════════
    //  Static Helpers
    // ═══════════════════════════════════════════

    /**
     * Normalize a page slug to lowercase with only a-z, 0-9, and hyphens.
     */
    public static function normalizeSlug(string $value): string
    {
        $value = strtolower(trim($value));
        $value = preg_replace('/[^a-z0-9-]+/', '-', $value) ?? '';
        $value = trim($value, '-');
        return $value;
    }

    /**
     * Update common $page metadata in a generated PHP page file.
     */
    public static function updatePhpMeta(string $content, string $title, string $slug): string
    {
        $escapedTitle = addslashes($title);
        $escapedSlug = addslashes($slug);

        $updated = preg_replace(
            '/([\'"]title[\'\"]\\s*=>\\s*[\'"])(.*?)([\'"])/i',
            '$1' . $escapedTitle . '$3',
            $content,
            1
        );
        if ($updated === null) {
            $updated = $content;
        }

        $updated = preg_replace(
            '/([\'"]slug[\'\"]\\s*=>\\s*[\'"])(.*?)([\'"])/i',
            '$1' . $escapedSlug . '$3',
            $updated,
            1
        );

        return $updated ?? $content;
    }
}
