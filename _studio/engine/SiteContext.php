<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Build the complete site context for every AI interaction.
 *
 * This is the most critical function in the engine. The quality
 * of the AI's output is directly proportional to the quality of
 * context it receives. Incomplete context → inconsistent edits.
 *
 * The context package typically runs 5,000–15,000 tokens. That's
 * the cost of magic. Every token is worth it because it prevents
 * the AI from guessing colors, forgetting navigation links, or
 * producing designs that clash with the existing site.
 *
 * Efficiency matters: this runs before every AI call. We read
 * files from disk (not a database), cache nothing between requests
 * (the site may have changed), and keep reads minimal.
 */
class SiteContext
{
    private Database $db;
    private Settings $settings;
    private FileManager $fileManager;
    private string $previewPath;
    private string $assetsPath;

    public function __construct(
        ?Database $db = null,
        ?Settings $settings = null,
        ?FileManager $fileManager = null
    ) {
        $this->db = $db ?? Database::getInstance();
        $this->settings = $settings ?? new Settings($this->db);
        $this->fileManager = $fileManager ?? new FileManager($this->db);
        $this->previewPath = dirname(__DIR__) . '/preview';
        $this->assetsPath = dirname(__DIR__, 2) . '/assets';
    }

    /**
     * Build the complete context package for an AI interaction.
     *
     * Reads the actual current state of the website: every page's
     * registration, the full CSS with design tokens, the current
     * navigation and footer HTML, available assets, and optionally
     * the full HTML of a focused page.
     *
     * Context is assembled in priority order. If maxChars is set,
     * lower-priority sections are dropped to fit within budget.
     *
     * @param string|null $focusPageSlug The page being edited (null for site-wide ops)
     * @param string|null $conversationId For including conversation history
     * @param int|null $userId Scope conversation history to an owner
     * @param int $maxChars Maximum character budget. PromptEngine derives this
     *   from the model's actual context window. 0 = unlimited (legacy fallback).
     * @return string Formatted context string ready for prompt injection
     */
    public function build(
        ?string $focusPageSlug = null,
        ?string $conversationId = null,
        ?int $userId = null,
        int $maxChars = 0
    ): string
    {
        // Priority 1 (essential) — always included
        $essential = [];
        $essential[] = $this->buildSiteInfo();

        $siteMemory = $this->buildSiteMemory();
        if ($siteMemory !== null) {
            $essential[] = $siteMemory;
        }

        $essential[] = $this->buildDesignTokens();

        $designIntelligence = $this->buildDesignIntelligence();
        if ($designIntelligence !== null) {
            $essential[] = $designIntelligence;
        }

        $essential[] = $this->buildSiteMap();

        $headerPartial = $this->buildHeaderPartial();
        if ($headerPartial !== null) {
            $essential[] = $headerPartial;
        }

        $navHtml = $this->buildNavigation();
        if ($navHtml !== null) {
            $essential[] = $navHtml;
        }

        $footerHtml = $this->buildFooter();
        if ($footerHtml !== null) {
            $essential[] = $footerHtml;
        }

        // Priority 2 (important) — included if budget allows
        $important = [];

        if ($focusPageSlug !== null) {
            $focusContext = $this->buildFocusPage($focusPageSlug);
            if ($focusContext !== null) {
                $important[] = $focusContext;
            } else {
                // New page — include a reference page so the AI can match
                // the existing design patterns (hero structure, spacing, etc.)
                $refPage = $this->buildReferencePage($focusPageSlug);
                if ($refPage !== null) {
                    $important[] = $refPage;
                }
            }
        }

        $history = $this->buildConversationHistory($conversationId, $userId);
        if ($history !== null) {
            $important[] = $history;
        }

        $important[] = $this->buildAssetList();

        $imageLibrary = $this->buildImageLibrary();
        if ($imageLibrary !== null) {
            $important[] = $imageLibrary;
        }

        $dataLayer = $this->buildDataLayer();
        if ($dataLayer !== null) {
            $important[] = $dataLayer;
        }

        $formSchemas = $this->buildFormSchemas();
        if ($formSchemas !== null) {
            $important[] = $formSchemas;
        }

        // Priority 3 (nice to have) — dropped first when over budget
        $optional = [];

        $optional[] = $this->buildGlobalCSS();

        // Collections disabled for v1.0.0 — ships in v1.1
        // $collections = $this->buildCollections();
        // if ($collections !== null) {
        //     $optional[] = $collections;
        // }

        $iconList = $this->buildIconList();
        if ($iconList !== null) {
            $optional[] = $iconList;
        }

        // Assemble with budget awareness
        $allParts = array_merge($essential, $important, $optional);

        if ($maxChars <= 0) {
            // No budget — include everything
            return implode("\n\n", array_filter($allParts));
        }

        // Progressive trimming: start with all, drop optional sections first
        $result = implode("\n\n", array_filter($allParts));
        if (strlen($result) <= $maxChars) {
            return $result;
        }

        // Drop optional sections one by one (reverse order: icons first, then CSS)
        for ($i = count($optional) - 1; $i >= 0; $i--) {
            array_pop($allParts);
            $result = implode("\n\n", array_filter($allParts));
            if (strlen($result) <= $maxChars) {
                return $result;
            }
        }

        // Drop important sections one by one
        $remaining = array_merge($essential, $important);
        for ($i = count($important) - 1; $i >= 0; $i--) {
            array_pop($remaining);
            $result = implode("\n\n", array_filter($remaining));
            if (strlen($result) <= $maxChars) {
                return $result;
            }
        }

        // Last resort: essentials only
        return implode("\n\n", array_filter($essential));
    }

    /**
     * Site name, tagline, language, page count.
     */
    private function buildSiteInfo(): string
    {
        $name = $this->settings->get('site_name', 'My Website');
        $tagline = $this->settings->get('site_tagline', '');
        $language = $this->settings->get('site_language', 'en');
        $pageCount = $this->db->count('pages');

        $info = "=== SITE INFORMATION ===\n";
        $info .= "Name: {$name}\n";
        if (!empty($tagline)) {
            $info .= "Tagline: {$tagline}\n";
        }
        $info .= "Language: {$language}\n";
        $info .= "Pages: {$pageCount}\n";
        $info .= "Current date: " . date('Y-m-d') . "\n";
        $info .= "Current year: " . date('Y');

        return $info;
    }

    /**
     * Current CSS custom properties from style.css.
     */
    private function buildDesignTokens(): string
    {
        $css = $this->fileManager->readFile('assets/css/style.css');
        $source = 'assets/css/style.css';

        if ($css === null) {
            // Backward-compat fallback for older projects with foundation.css.
            $css = $this->fileManager->readFile('assets/css/foundation.css');
            $source = 'assets/css/foundation.css';
        }

        if ($css === null) {
            return "=== DESIGN TOKENS ===\n(no stylesheet yet — this is a new site)";
        }

        $rootBlock = DesignTokens::getRootBlockForContext($css);

        return "=== DESIGN TOKENS (from {$source}) ===\n{$rootBlock}";
    }

    /**
     * Shared header partial (contains DOCTYPE, <head>, nav include, opening <main>).
     *
     * Handles both naming conventions: header.php (correct) and head.php (legacy).
     * Always presents as a single context section to avoid confusing the AI.
     */
    private function buildHeaderPartial(): ?string
    {
        $headerPhp = $this->fileManager->readFile('_partials/header.php');
        $headPhp = $this->fileManager->readFile('_partials/head.php');

        if ($headerPhp !== null && $headPhp !== null) {
            // Both exist — show both but guide the AI to use header.php
            return "=== CURRENT HEADER PARTIAL (_partials/header.php) ===\n{$headerPhp}\n\n"
                . "Note: _partials/head.php also exists (legacy). Prefer _partials/header.php for all changes.\n"
                . "--- _partials/head.php ---\n{$headPhp}";
        }

        if ($headerPhp !== null) {
            return "=== CURRENT HEADER PARTIAL (_partials/header.php) ===\n{$headerPhp}";
        }

        if ($headPhp !== null) {
            // Legacy naming — show it but label it clearly
            return "=== CURRENT HEADER PARTIAL (_partials/head.php) ===\n{$headPhp}";
        }

        return null;
    }

    /**
     * All pages with slug, title, type, nav order.
     */
    private function buildSiteMap(): string
    {
        $pages = $this->db->query(
            "SELECT slug, title, page_type, nav_order, nav_label,
                    CASE WHEN nav_order IS NOT NULL THEN 'yes' ELSE 'no' END as in_nav
             FROM pages
             ORDER BY nav_order IS NULL, nav_order ASC, title ASC"
        );

        $map = "=== SITE MAP ===\n";

        if (empty($pages)) {
            $map .= "(no pages yet)";
            return $map;
        }

        $map .= "slug | title | type | nav_order | in_nav\n";
        $map .= str_repeat('-', 60) . "\n";

        foreach ($pages as $page) {
            $navOrder = $page['nav_order'] ?? '-';
            $map .= "{$page['slug']} | {$page['title']} | {$page['page_type']} | {$navOrder} | {$page['in_nav']}\n";
        }

        return $map;
    }

    /**
     * Current <nav>/<header> HTML from the shared partial.
     *
     * With PHP includes, navigation lives in _partials/nav.php
     * (or _partials/header.php). We read it directly — no need
     * to parse it from a full page anymore.
     */
    private function buildNavigation(): ?string
    {
        // Try _partials/nav.php first (preferred: just the nav block)
        $navPhp = $this->fileManager->readFile('_partials/nav.php');
        if ($navPhp !== null) {
            return "=== CURRENT NAVIGATION HTML (_partials/nav.php) ===\n{$navPhp}";
        }

        // Fall back to _partials/header.php and extract <nav> from it
        $headerPhp = $this->fileManager->readFile('_partials/header.php');
        if ($headerPhp !== null) {
            $navHtml = SiteParser::extractNavigation($headerPhp);
            if ($navHtml !== null) {
                return "=== CURRENT NAVIGATION HTML (from _partials/header.php) ===\n{$navHtml}";
            }
            // If no <nav> found, return the whole header partial as context
            return "=== CURRENT HEADER PARTIAL (_partials/header.php) ===\n{$headerPhp}";
        }

        // Legacy fallback: read from index.php
        $indexPhp = $this->fileManager->readFile('index.php');
        if ($indexPhp !== null) {
            $navHtml = SiteParser::extractNavigation($indexPhp);
            if ($navHtml !== null) {
                return "=== CURRENT NAVIGATION HTML ===\n{$navHtml}";
            }
        }

        return null;
    }

    /**
     * Current <footer> HTML from the shared partial.
     */
    private function buildFooter(): ?string
    {
        // Try _partials/footer.php first
        $footerPhp = $this->fileManager->readFile('_partials/footer.php');
        if ($footerPhp !== null) {
            return "=== CURRENT FOOTER HTML (_partials/footer.php) ===\n{$footerPhp}";
        }

        // Legacy fallback: extract from index.php
        $indexPhp = $this->fileManager->readFile('index.php');
        if ($indexPhp !== null) {
            $footerHtml = SiteParser::extractFooter($indexPhp);
            if ($footerHtml !== null) {
                return "=== CURRENT FOOTER HTML ===\n{$footerHtml}";
            }
        }

        return null;
    }

    /**
     * Full contents of style.css.
     *
     * The AI needs the complete CSS to understand component
     * patterns, not just the tokens. For very large sites, we
     * fall back to tokens-only (see buildDesignTokens).
     */
    private function buildGlobalCSS(): string
    {
        $styleCss = $this->fileManager->readFile('assets/css/style.css');
        $tailwindCss = $this->fileManager->readFile('assets/css/tailwind.css');

        // Backward-compat: check for legacy foundation.css in older sites
        $foundationCss = $this->fileManager->readFile('assets/css/foundation.css');

        if ($foundationCss === null && $tailwindCss === null && $styleCss === null) {
            return "=== GLOBAL CSS ===\n(no stylesheet yet)";
        }

        $sections = [];

        // Legacy foundation.css (older sites only)
        if ($foundationCss !== null) {
            $sections[] = "/* assets/css/foundation.css (legacy — tokens should be in style.css) */\n" . $foundationCss;
        }

        if ($styleCss !== null) {
            $sections[] = "/* assets/css/style.css */\n" . $styleCss;
        }

        if ($tailwindCss !== null) {
            if (strlen($tailwindCss) > 30000) {
                $sections[] = "/* assets/css/tailwind.css (omitted: large compiled file) */\n"
                    . "(compiled size: " . strlen($tailwindCss) . " bytes)";
            } else {
                $sections[] = "/* assets/css/tailwind.css */\n" . $tailwindCss;
            }
        }

        return "=== GLOBAL CSS ===\n" . implode("\n\n", $sections);
    }

    /**
     * Files in /assets/images/ and /assets/files/ with paths and types.
     *
     * Scans the filesystem directly — no database. This means
     * files added via FTP appear automatically.
     */
    private function buildAssetList(): string
    {
        $assets = [];

        // Scan image directories
        $imageDir = $this->assetsPath . '/images';
        if (is_dir($imageDir)) {
            $this->scanDirectory($imageDir, '/assets/images', $assets);
        }

        // Scan file directories
        $fileDir = $this->assetsPath . '/files';
        if (is_dir($fileDir)) {
            $this->scanDirectory($fileDir, '/assets/files', $assets);
        }

        // Scan font directories
        $fontDir = $this->assetsPath . '/fonts';
        if (is_dir($fontDir)) {
            $this->scanDirectory($fontDir, '/assets/fonts', $assets);
        }

        $list = "=== AVAILABLE ASSETS ===\n";

        if (empty($assets)) {
            $list .= "(no assets uploaded yet)";
            return $list;
        }

        $list .= "path | type | size\n";
        $list .= str_repeat('-', 50) . "\n";

        foreach ($assets as $asset) {
            $list .= "{$asset['path']} | {$asset['type']} | {$asset['size']}\n";
        }

        return $list;
    }

    /**
     * Available Lucide icons from /assets/icons/.
     *
     * Lists all SVG filenames (without extension) so the AI
     * can reference them by name. Returns null if no icons
     * are installed.
     */
    private function buildIconList(): ?string
    {
        $iconDir = $this->assetsPath . '/icons';
        if (!is_dir($iconDir)) {
            return null;
        }

        $icons = [];
        $files = scandir($iconDir);
        if ($files === false) {
            return null;
        }

        foreach ($files as $file) {
            if (str_starts_with($file, '.')) continue;
            if (!str_ends_with($file, '.svg')) continue;
            $icons[] = basename($file, '.svg');
        }

        if (empty($icons)) {
            return null;
        }

        sort($icons);

        $list = "=== AVAILABLE ICONS ===\n";
        $list .= "Lucide SVG icons in /assets/icons/. Use inline SVG (preferred) or <img> reference.\n";
        $list .= "Total: " . count($icons) . " icons\n";
        $list .= "Names: " . implode(', ', $icons) . "\n";

        return $list;
    }

    /**
     * Structured data files in assets/data/.
     *
     * These JSON files are the single source of truth for machine-readable
     * site data. The AI needs them to keep structured data in sync with
     * page content when making edits.
     */
    private function buildDataLayer(): ?string
    {
        $dataDir = $this->assetsPath . '/data';
        if (!is_dir($dataDir)) {
            return null;
        }

        $files = @scandir($dataDir);
        if ($files === false) {
            return null;
        }

        // memory.json and design-intelligence.json have their own dedicated
        // context sections (buildSiteMemory / buildDesignIntelligence).
        // Exclude them from the generic data layer to avoid duplication.
        $excludedFiles = ['memory.json', 'design-intelligence.json'];

        $dataFiles = [];
        foreach ($files as $file) {
            if ($file[0] === '.' || !str_ends_with($file, '.json')) {
                continue;
            }
            if (in_array($file, $excludedFiles, true)) {
                continue;
            }

            $content = @file_get_contents($dataDir . '/' . $file);
            if ($content === false) {
                continue;
            }

            $dataFiles[$file] = $content;
        }

        if (empty($dataFiles)) {
            return null;
        }

        $section = "=== DATA LAYER (assets/data/) ===\n";
        $section .= "These JSON files are the single source of truth for structured site data.\n";
        $section .= "When editing pages that display this data, keep both in sync.\n\n";

        foreach ($dataFiles as $filename => $content) {
            $section .= "--- {$filename} ---\n{$content}\n\n";
        }

        return $section;
    }

    /**
     * Full content of the page being edited.
     */
    private function buildFocusPage(string $slug): ?string
    {
        $filename = $slug === 'index' ? 'index.php' : "{$slug}.php";
        $content = $this->fileManager->readFile($filename);

        if ($content === null) {
            return null;
        }

        return "=== FOCUS PAGE: {$slug} ({$filename}) ===\n{$content}";
    }

    /**
     * Provide a reference page when creating a NEW page.
     *
     * Without seeing an actual page's code, the AI has no concrete example
     * of the hero structure, section spacing, or how to handle the fixed
     * nav overlay. This picks the best reference page (index.php first,
     * then the first available page) and includes it labelled as a
     * design reference so the AI matches the existing patterns.
     */
    private function buildReferencePage(string $newSlug): ?string
    {
        // Try index first — it's the flagship page with the richest design
        $candidates = ['index.php'];

        // Fall back to any existing page
        $pages = $this->db->query(
            "SELECT slug FROM pages ORDER BY nav_order IS NULL, nav_order ASC LIMIT 5"
        );
        foreach ($pages as $page) {
            $file = $page['slug'] === 'index' ? 'index.php' : "{$page['slug']}.php";
            if (!in_array($file, $candidates)) {
                $candidates[] = $file;
            }
        }

        foreach ($candidates as $file) {
            $content = $this->fileManager->readFile($file);
            if ($content !== null) {
                $slug = $file === 'index.php' ? 'index' : pathinfo($file, PATHINFO_FILENAME);
                return "=== REFERENCE PAGE: {$slug} ({$file}) ===\n"
                    . "Use this existing page as a DESIGN REFERENCE for the new '{$newSlug}' page. "
                    . "Match its structure: hero section style, spacing between sections, "
                    . "how it handles the fixed navigation overlay, section padding, "
                    . "card patterns, and visual polish. The new page should feel like "
                    . "it was designed in the same session.\n\n"
                    . $content;
            }
        }

        return null;
    }

    /**
     * Summary of active collections.
     * DISABLED for v1.0.0 — not called. Preserved for v1.1.
     */
    private function buildCollections(): ?string
    {
        return null; // Collections disabled for v1.0.0

        /* v1.1: uncomment to re-enable
        $collections = $this->db->query(
            "SELECT slug, name, item_count FROM collections ORDER BY name"
        );

        if (empty($collections)) {
            return null;
        }

        $summary = "=== COLLECTIONS ===\n";
        $summary .= "slug | name | items\n";
        $summary .= str_repeat('-', 40) . "\n";

        foreach ($collections as $col) {
            $summary .= "{$col['slug']} | {$col['name']} | {$col['item_count']}\n";
        }

        return $summary;
        */
    }

    /**
     * Last N exchanges from the current conversation.
     *
     * Limited to 5 exchanges to keep context manageable.
     * Includes both user prompts and AI summaries.
     */
    private function buildConversationHistory(?string $conversationId, ?int $userId = null): ?string
    {
        if (empty($conversationId)) {
            return null;
        }

        if ($userId !== null) {
            $entries = $this->db->query(
                "SELECT user_prompt, ai_response, action_type, created_at
                 FROM prompt_log
                 WHERE conversation_id = ? AND user_id = ? AND status = 'success'
                 ORDER BY created_at DESC
                 LIMIT 5",
                [$conversationId, $userId]
            );
        } else {
            $entries = $this->db->query(
                "SELECT user_prompt, ai_response, action_type, created_at
                 FROM prompt_log
                 WHERE conversation_id = ? AND status = 'success'
                 ORDER BY created_at DESC
                 LIMIT 5",
                [$conversationId]
            );
        }

        if (empty($entries)) {
            return null;
        }

        // Reverse to chronological order
        $entries = array_reverse($entries);

        $history = "=== CONVERSATION HISTORY ===\n";
        $parser = new \VoxelSite\ResponseParser();

        foreach ($entries as $entry) {
            $history .= "User: {$entry['user_prompt']}\n";

            // Include a brief summary of what the AI did, not the full response
            if (!empty($entry['ai_response'])) {
                $summary = trim($parser->extractAssistantMessage((string) $entry['ai_response']));
                if ($summary !== '') {
                    // Truncate long messages
                    if (mb_strlen($summary) > 300) {
                        $summary = mb_substr($summary, 0, 300) . '...';
                    }
                    $history .= "Assistant: {$summary}\n";
                }
            }

            $history .= "\n";
        }

        return $history;
    }

    /**
     * Scan a directory for files, adding them to the assets array.
     *
     * Non-recursive (one level deep). Skips dotfiles and
     * system files. Returns web-accessible paths.
     *
     * @param array<int, array{path: string, type: string, size: string}> $assets
     */
    private function scanDirectory(string $dir, string $webPrefix, array &$assets): void
    {
        $items = @scandir($dir);
        if ($items === false) {
            return;
        }

        foreach ($items as $item) {
            if ($item[0] === '.') {
                continue;
            }

            $fullPath = $dir . '/' . $item;

            if (is_file($fullPath)) {
                $size = filesize($fullPath);
                $mime = mime_content_type($fullPath) ?: 'application/octet-stream';

                $assets[] = [
                    'path' => $webPrefix . '/' . $item,
                    'type' => $mime,
                    'size' => $this->formatFileSize($size),
                ];
            }
        }
    }

    /**
     * Format file size for human readability.
     */
    private function formatFileSize(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 1) . ' MB';
        }
        if ($bytes >= 1024) {
            return round($bytes / 1024, 1) . ' KB';
        }
        return $bytes . ' B';
    }

    /**
     * Form schema definitions from assets/forms/.
     *
     * When the AI edits a page with a form, it must see the schema
     * to keep field names in sync between HTML and the JSON definition.
     * The handler reads these schemas at runtime; mismatched names = lost data.
     */
    private function buildFormSchemas(): ?string
    {
        $formsDir = dirname($this->assetsPath, 1) . '/assets/forms';
        if (!is_dir($formsDir)) {
            return null;
        }

        $files = @scandir($formsDir);
        if ($files === false) {
            return null;
        }

        $schemas = [];
        foreach ($files as $file) {
            if ($file[0] === '.' || !str_ends_with($file, '.json')) {
                continue;
            }

            $content = @file_get_contents($formsDir . '/' . $file);
            if ($content === false) {
                continue;
            }

            $schemas[$file] = $content;
        }

        if (empty($schemas)) {
            return null;
        }

        $section = "=== FORM SCHEMAS (assets/forms/) ===\n";
        $section .= "These JSON schemas define interactive forms. Field names must match HTML form fields.\n";
        $section .= "The shipped submit.php handler reads these at runtime for validation.\n\n";

        foreach ($schemas as $filename => $content) {
            $section .= "--- {$filename} ---\n{$content}\n\n";
        }

        return $section;
    }

    /**
     * Site Memory — accumulated business knowledge from conversations.
     *
     * Everything the AI has learned about this business: identity,
     * contact details, people, products, audience, preferences,
     * and rejected directions. Injected in full before every AI
     * call so the AI never forgets what it's learned.
     */
    private function buildSiteMemory(): ?string
    {
        $memoryPath = $this->assetsPath . '/data/memory.json';
        if (!is_file($memoryPath)) {
            return null;
        }

        $content = @file_get_contents($memoryPath);
        if ($content === false || trim($content) === '' || trim($content) === '{}') {
            return null;
        }

        $section = "=== SITE MEMORY ===\n";
        $section .= $content;

        return $section;
    }

    /**
     * Design Intelligence — the site's visual personality and patterns.
     *
     * Captures the design decisions the AI made: visual personality,
     * layout patterns, component vocabulary, typography personality,
     * spacing philosophy, image direction, and anti-patterns.
     * Ensures every new section feels like it belongs with the original.
     */
    private function buildDesignIntelligence(): ?string
    {
        $diPath = $this->assetsPath . '/data/design-intelligence.json';
        if (!is_file($diPath)) {
            return null;
        }

        $content = @file_get_contents($diPath);
        if ($content === false || trim($content) === '' || trim($content) === '{}') {
            return null;
        }

        $section = "=== DESIGN INTELLIGENCE ===\n";
        $section .= $content;

        return $section;
    }

    /**
     * Scan a directory for image files and parse metadata from filenames.
     *
     * Returns an array of parsed image records derived from the filename
     * convention:  vs-bg_{subject}_{type}_{mood}_{tone}_{contrast}.png
     *          or: vs-gal_{subject}_{categories}_{tone}_{contrast}.png
     *
     * Every file is unique — no variants, no grouping.
     */
    private function scanImageDirectory(string $dir, string $prefix): array
    {
        if (!is_dir($dir)) {
            return [];
        }

        $files = glob($dir . '/*.png');
        if (!$files) {
            return [];
        }

        $images = [];

        foreach ($files as $file) {
            $basename = pathinfo($file, PATHINFO_FILENAME);
            $segments = explode('_', $basename);

            if ($prefix === 'vs-bg' && count($segments) === 6) {
                // vs-bg_{subject}_{type}_{mood}_{tone}_{contrast}
                $images[] = [
                    'file'     => $basename . '.png',
                    'subject'  => str_replace('-', ' ', $segments[1]),
                    'type'     => $segments[2],
                    'mood'     => $segments[3],
                    'tone'     => $segments[4],
                    'contrast' => $segments[5],
                ];
            } elseif ($prefix === 'vs-gal' && count($segments) === 5) {
                // vs-gal_{subject}_{categories}_{tone}_{contrast}
                $images[] = [
                    'file'       => $basename . '.png',
                    'subject'    => str_replace('-', ' ', $segments[1]),
                    'categories' => explode('-', $segments[2]),
                    'tone'       => $segments[3],
                    'contrast'   => $segments[4],
                ];
            }
        }

        return $images;
    }

    /**
     * Load the built-in image library by scanning the filesystem.
     *
     * Cached after first read — the library is static and ships with the product.
     * Parses metadata directly from the underscore-delimited filenames.
     */
    private function getImageLibrary(): array
    {
        static $library = null;

        if ($library === null) {
            $bgDir  = $this->assetsPath . '/library/backgrounds';
            $galDir = $this->assetsPath . '/library/gallery';

            $library = [
                'backgrounds' => $this->scanImageDirectory($bgDir, 'vs-bg'),
                'gallery'     => $this->scanImageDirectory($galDir, 'vs-gal'),
            ];
        }

        return $library;
    }

    /**
     * Built-in image library for AI-generated websites.
     *
     * Scans /assets/library/backgrounds/ and /assets/library/gallery/,
     * parses metadata from filenames, and builds the prompt context.
     * Adding new images only requires dropping correctly-named files
     * into the right directory.
     *
     * Every image has a unique descriptive name — no variants.
     */
    private function buildImageLibrary(): ?string
    {
        $library = $this->getImageLibrary();

        $backgrounds = $library['backgrounds'] ?? [];
        $gallery     = $library['gallery'] ?? [];

        if (empty($backgrounds) && empty($gallery)) {
            return null;
        }

        $totalFiles = count($backgrounds) + count($gallery);

        $lines = [];
        $lines[] = '=== IMAGE LIBRARY ===';
        $lines[] = "{$totalFiles} built-in images. Use when user has no uploaded photos.";
        $lines[] = 'Backgrounds: 16:9, 1920×1080. Gallery: 1:1, 800×800. All PNG.';
        $lines[] = '';

        // Type labels for prompt clarity
        $typeLabels = [
            'texture'    => 'TEXTURES — use as CSS background-image with a gradient overlay for text legibility',
            'gradient'   => 'GRADIENTS — hero sections, full-bleed backgrounds, CTA sections',
            'abstract'   => 'ABSTRACTS — accent sections, feature areas, visual breaks',
            'atmosphere' => 'ATMOSPHERE — hero overlays, mood sections, cinematic headers',
        ];

        // ── Backgrounds (grouped by type, full path shown) ──
        if (!empty($backgrounds)) {
            $grouped = [];
            foreach ($backgrounds as $img) {
                $type = $img['type'] ?? 'other';
                $grouped[$type][] = $img;
            }

            foreach ($grouped as $type => $images) {
                $label = $typeLabels[$type] ?? strtoupper($type);
                $lines[] = $label . ':';

                foreach ($images as $img) {
                    $path    = '/assets/library/backgrounds/' . $img['file'];
                    $pathCol = str_pad($path, 85);
                    $toneCol = str_pad("[{$img['tone']}, {$img['contrast']}]", 22);
                    $lines[] = "  {$pathCol}{$toneCol}{$img['mood']}, {$img['subject']}";
                }
                $lines[] = '';
            }
        }

        // ── Gallery (grouped by primary category, shuffled for variety) ──
        if (!empty($gallery)) {
            $lines[] = 'GALLERY IMAGES — portfolio grids, carousels, about-page photos (1:1, 800×800):';
            $galCount = count($gallery);
            $lines[] = "  {$galCount} images. Match the category tags to the business type.";
            $lines[] = '';

            // Group by primary category (first segment of the categories field)
            $byCategory = [];
            foreach ($gallery as $img) {
                $primaryCat = $img['categories'][0] ?? 'other';
                $byCategory[$primaryCat][] = $img;
            }

            // Sort categories alphabetically for readability
            ksort($byCategory);

            // Shuffle images within each category for per-request variety
            foreach ($byCategory as $cat => &$images) {
                shuffle($images);
            }
            unset($images);

            foreach ($byCategory as $cat => $images) {
                $catLabel = strtoupper($cat) . ' (' . count($images) . '):';
                $lines[] = "  {$catLabel}";

                foreach ($images as $img) {
                    $path    = '/assets/library/gallery/' . $img['file'];
                    $cats    = implode(', ', $img['categories'] ?? []);
                    $pathCol = str_pad($path, 85);
                    $toneCol = str_pad("[{$img['tone']}, {$img['contrast']}]", 22);
                    $lines[] = "    {$pathCol}{$toneCol}{$cats} — {$img['subject']}";
                }
                $lines[] = '';
            }
        }

        // ── Selection rules ──
        $lines[] = '=== IMAGE SELECTION RULES ===';
        $lines[] = '';
        $lines[] = '1. Match image tone to site colour scheme (warm site → warm images, dark → dark)';
        $lines[] = '2. dark-text contrast → use dark text overlay. light-text contrast → use white/light text.';
        $lines[] = '3. ALWAYS use the Tailwind 4 overlay <div> pattern for background images:';
        $lines[] = '   <section class="relative overflow-hidden" style="background-image: url({path}); background-size: cover; background-position: center;">';
        $lines[] = '     <div class="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-black/50"></div>';
        $lines[] = '     <div class="relative z-10"><!-- content --></div>';
        $lines[] = '   </section>';
        $lines[] = '   Add text-shadow: 0 2px 20px rgba(0,0,0,0.3) on hero text. Never use CSS background: shorthand with gradients.';
        $lines[] = '4. Never reuse the same image on one page';
        $lines[] = '5. Max 3–4 library images per page — less is more';
        $lines[] = '6. User-uploaded images ALWAYS replace library images';
        $lines[] = '7. Always add descriptive alt text based on the subject in the filename';
        $lines[] = '8. Match gallery category tags to the business type — pick from the right category group';
        $lines[] = '9. Use the FULL PATH shown above as-is in src/url() attributes — do not modify it';

        return implode("\n", $lines);
    }
}
