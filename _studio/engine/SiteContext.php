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
     * @param string|null $actionType The AI action being performed (e.g. 'restyle_site').
     *   Used to tailor context — e.g. restyle strips component CSS to avoid anchoring.
     * @return array{context: string, metrics: array{
     *   total_chars: int,
     *   budget_chars: int,
     *   budget_used_pct: float|null,
     *   sections: array<string, int>,
     *   trimmed: string[],
     *   focus_page_chars: int,
     *   history_chars: int
     * }}
     */
    public function build(
        ?string $focusPageSlug = null,
        ?string $conversationId = null,
        ?int $userId = null,
        int $maxChars = 0,
        ?string $actionType = null
    ): array
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

        $pageManifest = $this->buildPageManifest($focusPageSlug);
        if ($pageManifest !== null) {
            $essential[] = $pageManifest;
        }

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

        if ($focusPageSlug === '__all__') {
            // Full-site context mode (restyle_site) — include ALL page files
            // so the AI can preserve content while transforming design.
            $allPages = $this->buildAllPages();
            foreach ($allPages as $pageContext) {
                $important[] = $pageContext;
            }
        } elseif ($focusPageSlug !== null) {
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

        // Note: Conversation history is handled by PromptEngine::buildMessages()
        // as proper user/assistant message pairs — not duplicated here as a text block.

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

        $dependencies = $this->buildDataDependencies();
        if ($dependencies !== null) {
            $important[] = $dependencies;
        }

        $activeActions = $this->buildActiveActions();
        if ($activeActions !== null) {
            $important[] = $activeActions;
        }

        // Priority 3 (nice to have) — dropped first when over budget
        $optional = [];

        $optional[] = $this->buildGlobalCSS($actionType);

        // Collections disabled for v1.0.0 — ships in v1.1
        // $collections = $this->buildCollections();
        // if ($collections !== null) {
        //     $optional[] = $collections;
        // }

        $iconList = $this->buildIconList();
        if ($iconList !== null) {
            $optional[] = $iconList;
        }

        // Track each section's size BEFORE trimming
        $sectionSizes = [];
        foreach (array_merge($essential, $important, $optional) as $part) {
            if ($part === null || $part === '') continue;
            $label = $this->extractSectionLabel($part);
            $sectionSizes[$label] = strlen($part);
        }

        // Assemble with budget awareness
        $allParts = array_merge($essential, $important, $optional);

        if ($maxChars <= 0) {
            // No budget — include everything
            $result = implode("\n\n", array_filter($allParts));
            $includedLabels = array_keys($sectionSizes);
        } else {
            // Progressive trimming: start with all, drop optional sections first
            $result = implode("\n\n", array_filter($allParts));
            $includedParts = $allParts;

            if (strlen($result) > $maxChars) {
                // Drop optional sections one by one (reverse order: icons first, then CSS)
                for ($i = count($optional) - 1; $i >= 0; $i--) {
                    array_pop($includedParts);
                    $result = implode("\n\n", array_filter($includedParts));
                    if (strlen($result) <= $maxChars) {
                        break;
                    }
                }
            }

            if (strlen($result) > $maxChars) {
                // Drop important sections one by one
                $includedParts = array_merge($essential, $important);
                for ($i = count($important) - 1; $i >= 0; $i--) {
                    array_pop($includedParts);
                    $result = implode("\n\n", array_filter($includedParts));
                    if (strlen($result) <= $maxChars) {
                        break;
                    }
                }
            }

            if (strlen($result) > $maxChars) {
                // Last resort: essentials only
                $result = implode("\n\n", array_filter($essential));
                $includedParts = $essential;
            }

            // Determine which sections were included after trimming
            $includedLabels = [];
            foreach ($includedParts as $part) {
                if ($part === null || $part === '') continue;
                $includedLabels[] = $this->extractSectionLabel($part);
            }
        }

        // Build metrics
        $trimmedSections = array_values(array_diff(array_keys($sectionSizes), $includedLabels));

        $focusPageChars = $sectionSizes['FOCUS PAGE'] ?? $sectionSizes['REFERENCE PAGE'] ?? 0;
        $historyChars   = $sectionSizes['CONVERSATION HISTORY'] ?? 0;

        $metrics = [
            'total_chars'      => strlen($result),
            'budget_chars'     => $maxChars,
            'budget_used_pct'  => $maxChars > 0
                ? round(strlen($result) / $maxChars * 100, 1)
                : null,
            'sections'         => $sectionSizes,
            'trimmed'          => $trimmedSections,
            'focus_page_chars' => $focusPageChars,
            'history_chars'    => $historyChars,
        ];

        return ['context' => $result, 'metrics' => $metrics];
    }

    /**
     * Extract the section label from a context section string.
     * Looks for "=== LABEL ===" or "=== LABEL (details) ===" headers.
     */
    private function extractSectionLabel(string $section): string
    {
        if (preg_match('/^===\s+(.+?)\s+===/m', $section, $m)) {
            // Trim context-specific details like file paths
            $label = preg_replace('/\s*\(.*\)/', '', $m[1]);
            return trim($label);
        }
        return 'UNKNOWN';
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
     *
     * For restyle_site: strips component classes to prevent the
     * model from anchoring on the old architecture. Only `:root`
     * tokens and structural CSS (mobile menu, nav) are preserved.
     */
    private function buildGlobalCSS(?string $actionType = null): string
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
            // For restyle: strip component classes to avoid anchoring the
            // model on the old CSS architecture. Only show :root tokens
            // so the model understands the OLD design for comparison, but
            // builds NEW CSS from scratch with Tailwind utilities.
            if ($actionType === 'restyle_site') {
                $styleCss = $this->extractRestyleCSS($styleCss);
            }
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
     * For restyle operations: extract only the parts of style.css
     * that the model needs, stripping component classes that would
     * anchour the model on the old architecture.
     *
     * Preserves:
     * - :root { ... } block (design tokens for comparison)
     * - @keyframes blocks (animation definitions)
     * - [data-reveal] rules (scroll animation)
     * - .mobile-menu rules (structural nav)
     * - .site-header / .nav-inner / .nav-toggle rules (nav layout)
     * - .icon rules (icon sizing)
     *
     * Everything else (component classes) is stripped.
     */
    private function extractRestyleCSS(string $css): string
    {
        $preserved = [];
        $preserved[] = "/* RESTYLE MODE: Component classes stripped. Only tokens and structural CSS shown. */";
        $preserved[] = "/* Build a fresh style.css with new :root tokens from the reference site. */";
        $preserved[] = "/* Move ALL component styling to Tailwind utility classes in HTML. */\n";

        // Extract :root block (design tokens)
        if (preg_match('/:root\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s', $css, $m)) {
            $preserved[] = "/* OLD design tokens (for reference — replace with new tokens from reference site) */";
            $preserved[] = $m[0];
        }

        // Extract @keyframes blocks
        if (preg_match_all('/@keyframes\s+[\w-]+\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}/s', $css, $m)) {
            $preserved[] = "\n/* Animations (preserve and adapt as needed) */";
            foreach ($m[0] as $keyframe) {
                $preserved[] = $keyframe;
            }
        }

        // Extract [data-reveal] rules
        if (preg_match_all('/\[data-reveal[^{]*\{[^}]*\}/s', $css, $m)) {
            $preserved[] = "\n/* Scroll reveal transitions (preserve) */";
            foreach ($m[0] as $rule) {
                $preserved[] = $rule;
            }
        }

        // Extract .mobile-menu, .site-header, .nav- rules
        $structuralPatterns = [
            '/\.mobile-menu[^{]*\{[^}]*\}/s',
            '/\.site-header[^{]*\{[^}]*\}/s',
            '/\.nav-inner[^{]*\{[^}]*\}/s',
            '/\.nav-toggle[^{]*\{[^}]*\}/s',
            '/\.nav-desktop[^{]*\{[^}]*\}/s',
            '/\.icon[^{]*\{[^}]*\}/s',
        ];
        $structuralRules = [];
        foreach ($structuralPatterns as $pattern) {
            if (preg_match_all($pattern, $css, $m)) {
                foreach ($m[0] as $rule) {
                    $structuralRules[] = $rule;
                }
            }
        }
        if (!empty($structuralRules)) {
            $preserved[] = "\n/* Structural CSS (nav, mobile menu, icons — preserve) */";
            foreach ($structuralRules as $rule) {
                $preserved[] = $rule;
            }
        }

        // Extract @media prefers-reduced-motion
        if (preg_match_all('/@media\s*\(\s*prefers-reduced-motion[^)]*\)\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}/s', $css, $m)) {
            $preserved[] = "\n/* Accessibility (preserve) */";
            foreach ($m[0] as $rule) {
                $preserved[] = $rule;
            }
        }

        return implode("\n", $preserved);
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
     * Instead of listing all 1,900+ icon names (which would consume
     * ~6K tokens), we tell the AI that the full Lucide set is
     * available and how to reference them. The AI already knows
     * Lucide icon names natively.
     */
    private function buildIconList(): ?string
    {
        $iconDir = $this->assetsPath . '/icons';
        if (!is_dir($iconDir)) {
            return null;
        }

        $count = 0;
        $files = @scandir($iconDir);
        if ($files === false) {
            return null;
        }

        foreach ($files as $file) {
            if (!str_starts_with($file, '.') && str_ends_with($file, '.svg')) {
                $count++;
            }
        }

        if ($count === 0) {
            return null;
        }

        return "=== AVAILABLE ICONS ===\n"
            . "{$count} Lucide SVG icons in /assets/icons/. "
            . "Use any standard Lucide icon name as /assets/icons/{name}.svg "
            . "(e.g. /assets/icons/arrow-right.svg, /assets/icons/check.svg, /assets/icons/menu.svg). "
            . "Embed as inline SVG (preferred) or <img> reference.";
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
     * Page manifest — section-level summary of every page on the site.
     *
     * This is the core of multi-page awareness. It gives the AI a
     * lightweight structural map of all pages without sending full
     * HTML for each one. For a typical 5-page site this adds ~200-400
     * tokens — worth every one, because it's what makes cross-page
     * instructions like "match About to Home" actually work.
     *
     * The focus page is excluded since its full HTML is already in
     * the context. No point summarizing what we're sending in full.
     */
    private function buildPageManifest(?string $focusPageSlug = null): ?string
    {
        $pages = $this->db->query(
            "SELECT slug, title, page_type
             FROM pages
             ORDER BY nav_order IS NULL, nav_order ASC, title ASC"
        );

        if (empty($pages)) {
            return null;
        }

        $manifest = "=== PAGE MANIFEST ===\n";
        $manifest .= "Section-level structure of each page. Use this to understand the full site layout when making cross-page changes.\n\n";

        $count = 0;
        foreach ($pages as $page) {
            $slug = $page['slug'];

            // Skip the focus page — its full HTML is already in context
            if ($focusPageSlug !== null && $slug === $focusPageSlug) {
                continue;
            }

            // Cap at 10 pages to keep token budget reasonable
            if (++$count > 10) {
                $manifest .= "(additional pages omitted for brevity)\n";
                break;
            }

            $filename = $slug === 'index' ? 'index.php' : "{$slug}.php";
            $content = $this->fileManager->readFile($filename);

            if ($content === null) {
                $manifest .= "{$slug} ({$filename}): [file not found]\n";
                continue;
            }

            $sections = $this->extractSectionSummaries($content);

            $manifest .= "{$slug} ({$filename}): \"{$page['title']}\"\n";
            if (!empty($sections)) {
                foreach ($sections as $i => $summary) {
                    $num = $i + 1;
                    $manifest .= "  {$num}. {$summary}\n";
                }
            } else {
                $manifest .= "  (no sections detected)\n";
            }
            $manifest .= "\n";
        }

        return rtrim($manifest);
    }

    /**
     * Extract section summaries from a page's HTML source.
     *
     * Uses multiple signals the AI naturally produces:
     * 1. HTML comments above sections (e.g. <!-- HERO SECTION -->)
     * 2. Section id attributes (e.g. id="menu")
     * 3. aria-label attributes
     * 4. First h1/h2/h3 heading inside the section
     *
     * These combine into a compact description like:
     * "Hero Section (id=hero) — h1: Ember & Oak"
     *
     * @return string[] Array of human-readable section summaries
     */
    private function extractSectionSummaries(string $html): array
    {
        $summaries = [];

        // Find all <section> tags and extract attributes + nearby context
        // The regex captures the full opening tag and optional preceding comment
        $pattern = '/'
            . '(?:<!--\s*[═─=\-\s]*([^>]*?)[═─=\-\s]*-->\s*)?'  // Optional HTML comment
            . '<section\b([^>]*)>'                                // Section opening tag
            . '(.*?)'                                             // Section content
            . '<\/section>/si';

        if (!preg_match_all($pattern, $html, $matches, PREG_SET_ORDER)) {
            return $summaries;
        }

        foreach ($matches as $match) {
            $commentLabel = trim($match[1] ?? '');
            $attrs = $match[2] ?? '';
            $content = $match[3] ?? '';

            $parts = [];

            // Signal 1: HTML comment label (most descriptive)
            if ($commentLabel !== '') {
                // Clean up: remove decorative characters, normalize whitespace
                $label = preg_replace('/[═─=\-]+/u', '', $commentLabel);
                $label = trim(preg_replace('/\s+/', ' ', $label));
                if ($label !== '') {
                    $parts[] = $label;
                }
            }

            // Signal 2: id attribute
            $id = null;
            if (preg_match('/\bid=["\']([^"\']+)["\']/', $attrs, $idMatch)) {
                $id = $idMatch[1];
            }

            // Signal 3: aria-label
            $ariaLabel = null;
            if (preg_match('/\baria-label=["\']([^"\']+)["\']/', $attrs, $ariaMatch)) {
                $ariaLabel = $ariaMatch[1];
            }

            // Signal 4: First heading (h1, h2, or h3)
            $heading = null;
            if (preg_match('/<h[123][^>]*>(.*?)<\/h[123]>/si', $content, $hMatch)) {
                // Replace <br> variants with space before stripping tags
                $raw = preg_replace('/<br\s*\/?>/i', ' ', $hMatch[1]);
                // Strip inner tags, decode entities, trim
                $heading = trim(html_entity_decode(strip_tags($raw), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                // Collapse whitespace and line breaks
                $heading = preg_replace('/\s+/', ' ', $heading);
                // Cap at 80 chars
                if (mb_strlen($heading) > 80) {
                    $heading = mb_substr($heading, 0, 77) . '...';
                }
            }

            // Build the summary line
            if (empty($parts) && $ariaLabel) {
                $parts[] = $ariaLabel;
            }

            // If nothing descriptive yet, use heading or id as fallback
            if (empty($parts)) {
                if ($heading) {
                    $parts[] = $heading;
                } elseif ($id) {
                    $parts[] = ucfirst(str_replace(['-', '_'], ' ', $id));
                } else {
                    $parts[] = 'Section';
                }
            }

            $summary = implode('', $parts);

            // Append id in parentheses if we have one and it's not already mentioned
            if ($id && stripos($summary, $id) === false) {
                $summary .= " (#{$id})";
            }

            // Append heading if we have a comment label AND a heading that adds info
            if ($commentLabel !== '' && $heading && stripos($summary, $heading) === false) {
                $summary .= " — \"{$heading}\"";
            }

            $summaries[] = $summary;

            // Cap at 12 sections per page
            if (count($summaries) >= 12) {
                break;
            }
        }

        return $summaries;
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
     * Load ALL page file contents for full-site operations (restyle_site).
     *
     * Returns each page as a separate context item so the budget trimming
     * logic can drop pages individually from the tail if space runs out.
     * Pages are ordered by nav_order (homepage first) so the most important
     * pages are always retained.
     *
     * @return string[] Array of labelled page context blocks
     */
    private function buildAllPages(): array
    {
        $pages = $this->db->query(
            "SELECT slug FROM pages
             ORDER BY nav_order IS NULL, nav_order ASC, title ASC"
        );

        if (empty($pages)) {
            return [];
        }

        $contexts = [];
        foreach ($pages as $page) {
            $slug = $page['slug'];
            $filename = $slug === 'index' ? 'index.php' : "{$slug}.php";
            $content = $this->fileManager->readFile($filename);

            if ($content === null) {
                continue;
            }

            $contexts[] = "=== CURRENT PAGE: {$slug} ({$filename}) ===\n{$content}";
        }

        return $contexts;
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
     * buildConversationHistory() removed — conversation history is now
     * exclusively provided via PromptEngine::buildMessages() as proper
     * user/assistant message pairs. The previous text-summary approach
     * duplicated the same prompt_log data in an inferior format.
     */

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
     * Cross-file data dependency tracking.
     *
     * When the AI edits a data file (e.g., renames a service), it needs to
     * know what OTHER files depend on that data — form schemas with
     * options_from, pages that json_decode the file, and AEO outputs
     * that propagate the data to public discovery files.
     *
     * Without this, the AI can silently break form dropdowns, page rendering,
     * or structured data by updating one file but not its dependents.
     */
    private function buildDataDependencies(): ?string
    {
        $formsDir = dirname($this->assetsPath, 1) . '/assets/forms';
        $dataDir  = $this->assetsPath . '/data';

        $hasForms = is_dir($formsDir) && !empty(glob($formsDir . '/*.json'));
        $hasData  = is_dir($dataDir)  && !empty(glob($dataDir . '/*.json'));

        if (!$hasForms && !$hasData) {
            return null;
        }

        // 1. Form → Data file (via options_from)
        $formDeps = $hasForms ? $this->scanFormDataDependencies() : [];

        // 2. Page → Data file (via file_get_contents)
        $pageDeps = $hasData ? $this->scanPageDataDependencies() : [];

        // 3. Data → AEO (hardcoded mapping, only for data files that exist)
        $aeoDeps = $hasData ? $this->getAEODependencies() : [];

        if (empty($formDeps) && empty($pageDeps) && empty($aeoDeps)) {
            return null;
        }

        $section = "=== DATA DEPENDENCIES ===\n";
        $section .= "When editing, preserve these linkages — if you change a source file, ";
        $section .= "also update all listed dependents in this response.\n\n";

        if (!empty($formDeps)) {
            $section .= "Form schemas referencing data files:\n";
            foreach ($formDeps as $dep) {
                $section .= "  {$dep['form']} → field \"{$dep['field']}\" ";
                $section .= "pulls options from {$dep['data_file']}\n";
            }
            $section .= "\n";
        }

        if (!empty($pageDeps)) {
            $section .= "Pages reading data files:\n";
            foreach ($pageDeps as $page => $files) {
                $section .= "  {$page} → reads " . implode(', ', array_unique($files)) . "\n";
            }
            $section .= "\n";
        }

        if (!empty($aeoDeps)) {
            $section .= "AEO propagation (changes here update public discovery files on publish):\n";
            foreach ($aeoDeps as $dep) {
                $section .= "  {$dep['source']} → {$dep['targets']}\n";
            }
        }

        return $section;
    }

    /**
     * Scan form schemas for options_from references to data files.
     *
     * Each form schema can have fields with "options_from": "services.json"
     * which means the form dropdown reads its options from that data file.
     * Changing the data file without updating the form = broken dropdown.
     *
     * @return array<int, array{form: string, field: string, data_file: string}>
     */
    private function scanFormDataDependencies(): array
    {
        $formsDir = dirname($this->assetsPath, 1) . '/assets/forms';
        $files = @glob($formsDir . '/*.json');
        if ($files === false || empty($files)) {
            return [];
        }

        $deps = [];
        foreach ($files as $file) {
            $content = @file_get_contents($file);
            if ($content === false) continue;

            $schema = json_decode($content, true);
            if (!is_array($schema) || empty($schema['fields'])) continue;

            $formBasename = 'assets/forms/' . basename($file);

            foreach ($schema['fields'] as $field) {
                if (!empty($field['options_from'])) {
                    $deps[] = [
                        'form'      => $formBasename,
                        'field'     => $field['name'] ?? 'unknown',
                        'data_file' => 'assets/data/' . basename($field['options_from']),
                    ];
                }
            }
        }

        return $deps;
    }

    /**
     * Scan page PHP files for file_get_contents references to data files.
     *
     * Pages read data files with patterns like:
     *   file_get_contents(__DIR__ . '/assets/data/menu.json')
     *
     * If a data file is edited, all pages that render it must be
     * updated in the same response.
     *
     * @return array<string, string[]> Page filename => list of data files
     */
    private function scanPageDataDependencies(): array
    {
        $previewDir = $this->previewPath;
        if (!is_dir($previewDir)) {
            return [];
        }

        $phpFiles = @glob($previewDir . '/*.php');
        if ($phpFiles === false || empty($phpFiles)) {
            return [];
        }

        $pattern = '/file_get_contents\s*\(\s*__DIR__\s*\.\s*[\'"]\\/?assets\/data\/([^\'\"]+)[\'"]/';

        $deps = [];
        foreach ($phpFiles as $file) {
            $content = @file_get_contents($file);
            if ($content === false) continue;

            if (preg_match_all($pattern, $content, $matches)) {
                $pageName = basename($file);
                $deps[$pageName] = [];
                foreach ($matches[1] as $dataFile) {
                    $deps[$pageName][] = 'assets/data/' . $dataFile;
                }
            }
        }

        return $deps;
    }

    /**
     * Hardcoded AEO dependency mapping.
     *
     * These are documented in PR Part XXVII: when certain data files
     * change, the AEO pipeline regenerates public discovery files.
     * Only includes entries for data files that actually exist on disk.
     *
     * @return array<int, array{source: string, targets: string}>
     */
    private function getAEODependencies(): array
    {
        $dataDir = $this->assetsPath . '/data';

        // Mapping: data file → public files it feeds
        $mapping = [
            'site.json'         => 'llms.txt, schema.php, mcp.php, robots.txt',
            'menu.json'         => 'llms.txt (menu section), mcp.php (get_menu tool)',
            'services.json'     => 'llms.txt (services section), mcp.php (get_services tool)',
            'faq.json'          => 'llms.txt (FAQ section), mcp.php (get_faq tool), schema.php (FAQPage)',
        ];

        $deps = [];
        foreach ($mapping as $file => $targets) {
            if (file_exists($dataDir . '/' . $file)) {
                $deps[] = [
                    'source'  => 'assets/data/' . $file,
                    'targets' => $targets,
                ];
            }
        }

        return $deps;
    }

    /**
     * Summary of active agent actions.
     *
     * Gives the AI awareness of what actions exist so it can:
     * - Reference them in generated page content ("Book a table")
     * - Add CTA buttons/links that encourage visitors to use the bar
     * - Not create duplicate functionality via HTML forms
     *
     * Returns null when no active actions exist (no wasted tokens).
     */
    private function buildActiveActions(): ?string
    {
        $actionsDir = dirname(__DIR__) . '/data/actions';
        if (!is_dir($actionsDir)) {
            return null;
        }

        $files = @glob($actionsDir . '/*.json');
        if ($files === false || empty($files)) {
            return null;
        }

        $actions = [];
        foreach ($files as $file) {
            $content = @file_get_contents($file);
            if ($content === false) {
                continue;
            }

            $def = json_decode($content, true);
            if (!is_array($def) || ($def['active'] ?? false) !== true) {
                continue;
            }

            $fieldNames = array_map(
                fn($f) => $f['label'] ?? $f['name'] ?? 'unknown',
                $def['fields'] ?? []
            );

            $actions[] = [
                'name'        => $def['name'] ?? $def['id'],
                'id'          => $def['id'] ?? basename($file, '.json'),
                'description' => $def['description'] ?? '',
                'fields'      => count($def['fields'] ?? []),
                'field_names' => $fieldNames,
            ];
        }

        if (empty($actions)) {
            return null;
        }

        $section = "=== ACTIVE AGENT ACTIONS ===\n";
        $section .= "The site has " . count($actions) . " live agent action(s) accessible via the Actions Bar at the bottom of every page.\n";
        $section .= "The Actions Bar handles the form UI. Do NOT generate HTML forms for these actions.\n\n";

        foreach ($actions as $a) {
            $desc = $a['description'] ? " - {$a['description']}" : '';
            $fields = implode(', ', $a['field_names']);
            $section .= "- {$a['name']} (id: {$a['id']}){$desc}\n";
            $section .= "  Fields ({$a['fields']}): {$fields}\n";
        }

        $section .= "\nWhen generating or editing pages, add CTA buttons or sections that encourage visitors to use these actions. ";
        $section .= "Example: '<a href=\"#\" class=\"btn\" onclick=\"return false\">Book a Table</a>' or a prominent section highlighting the capability. ";
        $section .= "The Actions Bar appears on every page and provides the interactive form.\n";

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
     * convention:  vs-bg_{subject}_{type}_{mood}_{tone}_{contrast}.ext
     *          or: vs-gal_{subject}_{categories}_{tone}_{contrast}.ext
     *
     * Supports: .png, .jpg, .jpeg, .webp, .svg, .gif, .avif
     * Every file is unique — no variants, no grouping.
     */
    private function scanImageDirectory(string $dir, string $prefix): array
    {
        if (!is_dir($dir)) {
            return [];
        }

        $allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'avif'];
        $allFiles = @scandir($dir);
        if ($allFiles === false) {
            return [];
        }

        $images = [];

        foreach ($allFiles as $file) {
            if ($file[0] === '.') continue;

            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (!in_array($ext, $allowedExtensions, true)) continue;

            $basename = pathinfo($file, PATHINFO_FILENAME);
            $segments = explode('_', $basename);

            if ($prefix === 'vs-bg' && count($segments) === 6) {
                // vs-bg_{subject}_{type}_{mood}_{tone}_{contrast}
                $images[] = [
                    'file'     => $file,
                    'subject'  => str_replace('-', ' ', $segments[1]),
                    'type'     => $segments[2],
                    'mood'     => $segments[3],
                    'tone'     => $segments[4],
                    'contrast' => $segments[5],
                ];
            } elseif ($prefix === 'vs-gal' && count($segments) === 5) {
                // vs-gal_{subject}_{categories}_{tone}_{contrast}
                $images[] = [
                    'file'       => $file,
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
     * Load the built-in image library by scanning the filesystem
     * and optionally reading a library.json manifest (VoxelSwarm).
     *
     * Cached after first read. Merges two sources:
     * 1. Local filesystem scan (tenant additions — takes priority)
     * 2. Remote library.json manifest (VoxelSwarm centralized images)
     *
     * Local images appear first in the list so tenant-added images
     * are preferred by the AI.
     */
    private function getImageLibrary(): array
    {
        static $library = null;

        if ($library === null) {
            $bgDir  = $this->assetsPath . '/library/backgrounds';
            $galDir = $this->assetsPath . '/library/gallery';

            // 1. Scan local filesystem (existing behavior — tenant additions)
            $localBackgrounds = $this->scanImageDirectory($bgDir, 'vs-bg');
            $localGallery     = $this->scanImageDirectory($galDir, 'vs-gal');

            // 2. Check for library.json (VoxelSwarm remote library)
            $remoteBackgrounds = [];
            $remoteGallery     = [];
            $jsonPath = $this->assetsPath . '/library.json';

            if (file_exists($jsonPath)) {
                $raw = @file_get_contents($jsonPath);
                $manifest = $raw !== false ? json_decode($raw, true) : null;

                if ($manifest && !empty($manifest['images'])) {
                    $baseUrl = rtrim($manifest['base_url'] ?? '', '/');

                    foreach ($manifest['images'] as $relativePath) {
                        $filename = pathinfo($relativePath, PATHINFO_FILENAME);
                        $segments = explode('_', $filename);

                        if (str_starts_with($relativePath, 'backgrounds/') && count($segments) === 6) {
                            $remoteBackgrounds[] = [
                                'file'     => $baseUrl . '/' . $relativePath,
                                'subject'  => str_replace('-', ' ', $segments[1]),
                                'type'     => $segments[2],
                                'mood'     => $segments[3],
                                'tone'     => $segments[4],
                                'contrast' => $segments[5],
                                'remote'   => true,
                            ];
                        } elseif (str_starts_with($relativePath, 'gallery/') && count($segments) === 5) {
                            $remoteGallery[] = [
                                'file'       => $baseUrl . '/' . $relativePath,
                                'subject'    => str_replace('-', ' ', $segments[1]),
                                'categories' => explode('-', $segments[2]),
                                'tone'       => $segments[3],
                                'contrast'   => $segments[4],
                                'remote'     => true,
                            ];
                        }
                    }
                }
            }

            // 3. Merge: local first (takes priority), remote appended
            $library = [
                'backgrounds' => array_merge($localBackgrounds, $remoteBackgrounds),
                'gallery'     => array_merge($localGallery, $remoteGallery),
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
        $lines[] = 'Backgrounds: 16:9, 1920×1080. Gallery: 1:1, 800×800. All JPEG.';
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
                    $path    = ($img['remote'] ?? false)
                        ? $img['file']
                        : '/assets/library/backgrounds/' . $img['file'];
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
                    $path    = ($img['remote'] ?? false)
                        ? $img['file']
                        : '/assets/library/gallery/' . $img['file'];
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
