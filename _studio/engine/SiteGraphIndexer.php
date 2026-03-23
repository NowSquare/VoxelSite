<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * VoxelSite Site Control — Site Graph Indexer (SC-002 through SC-005)
 *
 * Builds a SiteGraph from the database and file system.
 * Dependencies: Database (for page table), FileManager (for file reads).
 *
 * Sub-indexers:
 *   indexPagesAndRoutes — SC-002: pages table + route nodes + serves edges
 *   indexPartials       — SC-002: partial file discovery via listPartialFiles()
 *   indexIncludes       — SC-003: PHP include/require scanning
 *   indexLinks          — SC-004: internal href scanning
 *   indexTokens         — SC-005: CSS custom property scanning
 */
class SiteGraphIndexer
{
    private Database $db;
    private FileManager $fileManager;

    /** @var array<string, int|null> page node ID → raw nav_parent_id from DB */
    private array $rawParents = [];

    /** @var array<int, string> DB page id → page node ID */
    private array $dbIdToNodeId = [];

    public function __construct(?Database $db = null, ?FileManager $fileManager = null)
    {
        $this->db = $db ?? Database::getInstance();
        $this->fileManager = $fileManager ?? new FileManager($this->db);
    }

    /**
     * Build the complete site graph.
     *
     * Orchestrates all sub-indexers in dependency order:
     * 1. Pages + routes (nodes must exist before edges)
     * 2. Partials (nodes must exist before include edges)
     * 3. Includes (edges between pages/partials)
     * 4. Links (edges from pages/partials to routes)
     * 5. Tokens (token nodes + consumer edges)
     */
    public function buildGraph(): SiteGraph
    {
        $graph = new SiteGraph();

        $this->indexPagesAndRoutes($graph);
        $this->computeHierarchy($graph);
        $this->indexPartials($graph);
        $this->indexIncludes($graph);
        $this->indexLinks($graph);
        $this->indexTokens($graph);

        return $graph;
    }

    // ═══════════════════════════════════════════
    //  SC-002 — Pages, Routes, Partials
    // ═══════════════════════════════════════════

    /**
     * Index pages from the database and create route + serves edges.
     *
     * Syncs the page registry first so the DB reflects the current
     * preview file tree (same discipline as listPreviewFiles callers).
     */
    private function indexPagesAndRoutes(SiteGraph $graph): void
    {
        // Ensure page registry is in sync with actual preview files
        $this->fileManager->syncPageRegistry();

        $pages = $this->db->query(
            'SELECT id, slug, title, file_path, page_type, nav_order, nav_label, is_homepage, nav_parent_id
             FROM pages
             ORDER BY is_homepage DESC, nav_order ASC, title ASC'
        );

        // Reset hierarchy maps for this build
        $this->rawParents = [];
        $this->dbIdToNodeId = [];

        foreach ($pages as $row) {
            $filePath = (string) $row['file_path'];
            $slug     = (string) $row['slug'];
            $title    = (string) ($row['title'] ?? $slug);
            $pageId   = 'page:' . $filePath;
            $dbId     = (int) $row['id'];

            // Store DB id → node ID mapping for hierarchy resolution
            $this->dbIdToNodeId[$dbId] = $pageId;
            $this->rawParents[$pageId] = $row['nav_parent_id'] !== null ? (int) $row['nav_parent_id'] : null;

            // Build URL path: "/" for index, "/{slug}" otherwise
            $urlPath = $slug === 'index' ? '/' : '/' . $slug;
            $routeId = 'route:' . $urlPath;

            // Extract section summaries from file content
            $content = $this->fileManager->readFile($filePath);
            $sections = $content !== null ? self::extractSectionSummaries($content) : [];

            // Add page node
            $graph->addNode($pageId, 'page', $title, [
                'file_path'        => $filePath,
                'slug'             => $slug,
                'title'            => $title,
                'pageType'         => $row['page_type'] ?? 'page',
                'navOrder'         => (int) ($row['nav_order'] ?? 0),
                'navLabel'         => $row['nav_label'] ?? null,
                'isHomepage'       => (bool) ($row['is_homepage'] ?? false),
                'sectionSummaries' => $sections,
            ]);

            // Add route node (skip if duplicate slug would create duplicate route)
            if ($graph->getNode($routeId) === null) {
                $graph->addNode($routeId, 'route', $urlPath, [
                    'path'     => $urlPath,
                    'pageNodeId' => $pageId,
                    'isNav'    => ($row['nav_order'] ?? null) !== null,
                    'navOrder' => (int) ($row['nav_order'] ?? 0),
                ]);

                // serves edge: route → page
                $graph->addEdge($routeId, $pageId, 'serves');
            }
        }
    }

    // ═══════════════════════════════════════════
    //  SC-010 — Hierarchy Resolution
    // ═══════════════════════════════════════════

    /**
     * Orchestrator: compute hierarchy metadata on all page nodes.
     *
     * Calls the two pure static helpers using maps built in indexPagesAndRoutes().
     */
    private function computeHierarchy(SiteGraph $graph): void
    {
        $parentMap = self::resolveParentMap($graph, $this->rawParents, $this->dbIdToNodeId);
        self::applyHierarchyMetadata($graph, $parentMap);
    }

    /**
     * Pass 1 — Resolve parent relationships + cycle detection.
     *
     * Pure function. No DB access. Testable in isolation.
     *
     * Precedence: explicit nav_parent_id → URL slug nesting → flat/top-level.
     *
     * @param  SiteGraph $graph         Graph with page nodes already added
     * @param  array<string, int|null>  $rawParents   pageNodeId → DB nav_parent_id
     * @param  array<int, string>       $dbIdToNodeId DB page id → pageNodeId
     * @return array<string, array{parent: string|null, source: string|null}>
     */
    public static function resolveParentMap(SiteGraph $graph, array $rawParents, array $dbIdToNodeId): array
    {
        $pageNodes = $graph->getNodesByType('page');

        // Build slug → nodeId lookup for URL inference
        $slugToNodeId = [];
        foreach ($pageNodes as $node) {
            $slug = $node['meta']['slug'] ?? '';
            if ($slug !== '') {
                $slugToNodeId[$slug] = $node['id'];
            }
        }

        $parentMap = [];

        foreach ($pageNodes as $node) {
            $pageId = $node['id'];
            $rawParentId = $rawParents[$pageId] ?? null;
            $slug = $node['meta']['slug'] ?? '';

            // 1. Explicit: nav_parent_id set
            if ($rawParentId !== null) {
                $parentNodeId = $dbIdToNodeId[$rawParentId] ?? null;

                // Valid explicit parent: exists and is a different page
                if ($parentNodeId !== null && $parentNodeId !== $pageId) {
                    $parentMap[$pageId] = ['parent' => $parentNodeId, 'source' => 'explicit'];
                    continue;
                }

                // Self-parent or missing parent: flatten
                $parentMap[$pageId] = ['parent' => null, 'source' => null];
                continue;
            }

            // 2. Inferred: slug contains '/' (e.g. 'services/web-design')
            if (str_contains($slug, '/')) {
                $prefix = substr($slug, 0, (int) strrpos($slug, '/'));
                if ($prefix !== '' && isset($slugToNodeId[$prefix])) {
                    $parentMap[$pageId] = ['parent' => $slugToNodeId[$prefix], 'source' => 'inferred'];
                    continue;
                }
            }

            // 3. Flat / top-level
            $parentMap[$pageId] = ['parent' => null, 'source' => null];
        }

        // Cycle detection: walk each parent chain with visited-set
        foreach (array_keys($parentMap) as $pageId) {
            $visited = [];
            $current = $pageId;

            while (($parentMap[$current]['parent'] ?? null) !== null) {
                if (isset($visited[$current])) {
                    // Cycle detected: sever the cycle-creating edge
                    $parentMap[$current] = ['parent' => null, 'source' => null];
                    break;
                }
                $visited[$current] = true;
                $current = $parentMap[$current]['parent'];
            }
        }

        return $parentMap;
    }

    /**
     * Pass 2 — Compute levels and child counts, write to node metadata.
     *
     * Pure function. No DB access. Testable in isolation.
     *
     * @param SiteGraph $graph
     * @param array<string, array{parent: string|null, source: string|null}> $parentMap
     */
    public static function applyHierarchyMetadata(SiteGraph $graph, array $parentMap): void
    {
        // Memoized level computation
        $levelMemo = [];

        $getLevel = function (string $pageId) use (&$getLevel, &$parentMap, &$levelMemo): int {
            if (isset($levelMemo[$pageId])) {
                return $levelMemo[$pageId];
            }

            $parent = $parentMap[$pageId]['parent'] ?? null;
            if ($parent === null) {
                $levelMemo[$pageId] = 1;
            } else {
                $levelMemo[$pageId] = $getLevel($parent) + 1;
            }

            return $levelMemo[$pageId];
        };

        // Compute child counts
        $childCounts = [];
        foreach ($parentMap as $entry) {
            $parent = $entry['parent'];
            if ($parent !== null) {
                $childCounts[$parent] = ($childCounts[$parent] ?? 0) + 1;
            }
        }

        // Write metadata to each page node
        foreach ($parentMap as $pageId => $entry) {
            $level = min($getLevel($pageId), 3); // cap at 3

            $graph->updateNodeMeta($pageId, [
                'parentPageId'    => $entry['parent'],
                'hierarchySource' => $entry['source'],
                'level'           => $level,
                'childCount'      => $childCounts[$pageId] ?? 0,
            ]);
        }
    }

    /**
     * Index partial files from the _partials/ directory.
     *
     * Uses FileManager::listPartialFiles() — the recursive public helper
     * that walks the entire _partials/ tree.
     *
     * Do NOT use listPreviewFiles() or listPreviewFilesRecursive() —
     * both explicitly skip _partials/.
     */
    private function indexPartials(SiteGraph $graph): void
    {
        foreach ($this->fileManager->listPartialFiles() as $partial) {
            $path = (string) $partial['path'];
            $partialId = 'partial:' . $path;

            // Skip if already indexed (shouldn't happen, but guard)
            if ($graph->getNode($partialId) !== null) {
                continue;
            }

            $name = (string) $partial['name'];
            $graph->addNode($partialId, 'partial', $name . '.php', [
                'file_path' => $path,
            ]);
        }
    }

    // ═══════════════════════════════════════════
    //  SC-003 — Include/Component Usage Graph
    // ═══════════════════════════════════════════

    /**
     * Scan page and partial files for PHP include/require statements.
     * Creates `includes` edges between the source file and the target partial.
     * After all edges: tag shared partials (2+ incoming includes).
     */
    private function indexIncludes(SiteGraph $graph): void
    {
        $pattern = '/(?:include|include_once|require|require_once)\s*(?:\(?\s*(?:__DIR__\s*\.\s*)?[\'"]([^\'"]+\.php)[\'"]\s*\)?)/i';

        // Scan all pages and partials
        $contentNodes = array_merge(
            $graph->getNodesByType('page'),
            $graph->getNodesByType('partial')
        );

        foreach ($contentNodes as $node) {
            $filePath = $node['meta']['file_path'] ?? null;
            if ($filePath === null) {
                continue;
            }

            $content = $this->fileManager->readFile($filePath);
            if ($content === null) {
                continue;
            }

            if (!preg_match_all($pattern, $content, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE)) {
                continue;
            }

            foreach ($matches as $match) {
                $includePath = $match[1][0] ?? '';
                if ($includePath === '') {
                    continue;
                }

                // Resolve relative path: normalize from the file's directory
                $resolvedPath = $this->resolveIncludePath($filePath, $includePath);
                $targetId = 'partial:' . $resolvedPath;

                // Only add edge if target node exists in graph
                if ($graph->getNode($targetId) === null) {
                    continue;
                }

                // Determine include type from the statement
                $fullMatch = $match[0][0] ?? '';
                $includeType = 'include';
                if (stripos($fullMatch, 'require_once') !== false) {
                    $includeType = 'require_once';
                } elseif (stripos($fullMatch, 'require') !== false) {
                    $includeType = 'require';
                } elseif (stripos($fullMatch, 'include_once') !== false) {
                    $includeType = 'include_once';
                }

                // Calculate approximate line number
                $lineNumber = substr_count($content, "\n", 0, (int) $match[0][1]) + 1;

                $graph->addEdge($node['id'], $targetId, 'includes', [
                    'includeType' => $includeType,
                    'lineNumber'  => $lineNumber,
                ]);
            }
        }

        // Tag shared partials: any partial with 2+ incoming `includes` edges
        foreach ($graph->getNodesByType('partial') as $partial) {
            $consumers = $graph->getConsumers($partial['id']);
            if (count($consumers) >= 2) {
                $graph->updateNodeMeta($partial['id'], [
                    'isShared'     => true,
                    'includeCount' => count($consumers),
                ]);
            } else {
                $graph->updateNodeMeta($partial['id'], [
                    'isShared'     => false,
                    'includeCount' => count($consumers),
                ]);
            }
        }
    }

    /**
     * Resolve an include path relative to the source file's directory.
     *
     * Examples:
     *   resolveIncludePath('index.php', '_partials/header.php') → '_partials/header.php'
     *   resolveIncludePath('_partials/header.php', 'nav.php') → '_partials/nav.php'
     *   resolveIncludePath('_partials/header.php', '_partials/nav.php') → '_partials/nav.php'
     */
    private function resolveIncludePath(string $sourceFile, string $includePath): string
    {
        // Strip leading / from __DIR__-relative includes like __DIR__ . '/nav.php'
        $includePath = ltrim($includePath, '/');

        // If the include path already starts with _partials/, it's absolute-ish
        if (str_starts_with($includePath, '_partials/')) {
            return $includePath;
        }

        // Otherwise resolve relative to the source file's directory
        $sourceDir = dirname($sourceFile);
        if ($sourceDir === '.') {
            return $includePath;
        }

        return $sourceDir . '/' . $includePath;
    }

    // ═══════════════════════════════════════════
    //  SC-004 — Internal Link Graph
    // ═══════════════════════════════════════════

    /**
     * Scan page and partial files for internal <a href> links.
     * Creates `links_to` edges from the source file to the target route.
     *
     * href="/" is explicitly captured (homepage link).
     *
     * Every link occurrence gets its own edge (no per-file deduplication).
     * This matters for URL migration: if nav.php links to /contact three
     * times, the graph must show three edges so the proposal knows exactly
     * how many href rewrites are needed.
     */
    private function indexLinks(SiteGraph $graph): void
    {
        // Capture all href values — we'll filter in code
        $hrefPattern = '/href=["\']([^"\']*?)["\']/i';

        // Patterns to skip
        $skipPrefixes = ['http://', 'https://', 'mailto:', 'tel:', 'javascript:', '<?'];

        $contentNodes = array_merge(
            $graph->getNodesByType('page'),
            $graph->getNodesByType('partial')
        );

        foreach ($contentNodes as $node) {
            $filePath = $node['meta']['file_path'] ?? null;
            if ($filePath === null) {
                continue;
            }

            $content = $this->fileManager->readFile($filePath);
            if ($content === null) {
                continue;
            }

            // Determine file-level base context
            $baseContext = $this->classifyFileContext($filePath, $content);

            if (!preg_match_all($hrefPattern, $content, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE)) {
                continue;
            }

            foreach ($matches as $match) {
                $href = $match[1][0] ?? '';

                // Skip empty, anchor-only, or external
                if ($href === '' || $href === '#') {
                    continue;
                }

                $skip = false;
                foreach ($skipPrefixes as $prefix) {
                    if (str_starts_with($href, $prefix)) {
                        $skip = true;
                        break;
                    }
                }
                if ($skip) {
                    continue;
                }

                // Skip pure anchor links (#section)
                if (str_starts_with($href, '#')) {
                    continue;
                }

                // Must start with / to be an internal path link
                if (!str_starts_with($href, '/')) {
                    continue;
                }

                // Normalize: strip query string and anchor
                $routePath = strtok($href, '?#');
                if ($routePath === false || $routePath === '') {
                    $routePath = '/';
                }

                // Remove trailing slash (except for root)
                if ($routePath !== '/' && str_ends_with($routePath, '/')) {
                    $routePath = rtrim($routePath, '/');
                }

                $routeId = 'route:' . $routePath;

                // Only add edge if route node exists in graph
                if ($graph->getNode($routeId) === null) {
                    continue;
                }

                // Calculate approximate line number
                $lineNumber = substr_count($content, "\n", 0, (int) $match[0][1]) + 1;

                $graph->addEdge($node['id'], $routeId, 'links_to', [
                    'href'       => $href,
                    'context'    => $this->classifyLinkContext($baseContext, $content, (int) $match[0][1]),
                    'lineNumber' => $lineNumber,
                ]);
            }
        }
    }

    /**
     * Classify the file-level base context.
     */
    private function classifyFileContext(string $filePath, string $content): string
    {
        if ($filePath === '_partials/nav.php' || str_contains($content, 'site-nav')) {
            return 'nav';
        }
        if ($filePath === '_partials/footer.php' || str_contains($content, 'site-footer')) {
            return 'footer';
        }
        return 'body';
    }

    /**
     * Classify per-link context by checking the enclosing <a> tag for CTA signals.
     *
     * Finds the opening <a tag (by looking backward from the href match offset),
     * then reads forward to the closing > to capture the complete set of attributes.
     * If the tag's class attribute contains 'cta', 'btn', or 'button', the context
     * is overridden to 'cta' regardless of the file-level base.
     */
    private function classifyLinkContext(string $baseContext, string $content, int $matchOffset): string
    {
        // Look backward for the opening <a tag (up to 200 chars)
        $lookbackStart = max(0, $matchOffset - 200);
        $lookbackLen   = $matchOffset - $lookbackStart;
        $before = substr($content, $lookbackStart, $lookbackLen);

        // Find the last opening <a in the lookback window (case-insensitive)
        $lastTagPos = strripos($before, '<a ');
        if ($lastTagPos === false) {
            // Try <a followed by newline (multi-line attributes)
            $lastTagPos = strripos($before, '<a' . "\n");
        }
        if ($lastTagPos === false) {
            return $baseContext;
        }

        // Absolute position of the <a tag in the content
        $tagStartAbsolute = $lookbackStart + $lastTagPos;

        // Read forward from the tag start to find the closing >
        $closingBracket = strpos($content, '>', $tagStartAbsolute);
        if ($closingBracket === false) {
            $closingBracket = min(strlen($content), $tagStartAbsolute + 500);
        }

        // Extract the full opening tag: <a ... >
        $fullTag = substr($content, $tagStartAbsolute, $closingBracket - $tagStartAbsolute + 1);

        // Extract class attribute value from the full tag
        if (preg_match('/class=["\']([^"\']*)["\']/', $fullTag, $classMatch)) {
            $classList = strtolower($classMatch[1]);
            // CTA signals: class contains 'cta', 'btn', or 'button'
            if (str_contains($classList, 'cta') ||
                str_contains($classList, 'btn') ||
                str_contains($classList, 'button')) {
                return 'cta';
            }
        }

        return $baseContext;
    }

    // ═══════════════════════════════════════════
    //  SC-005 — Design Token Consumer Graph
    // ═══════════════════════════════════════════

    /**
     * Discover CSS custom properties in :root and scan all files for var() usage.
     * Creates token nodes and consumes_token edges.
     */
    private function indexTokens(SiteGraph $graph): void
    {
        // Read the main stylesheet
        $cssContent = $this->fileManager->readFile('assets/css/style.css');
        if ($cssContent === null) {
            return;
        }

        // Extract :root block
        if (!preg_match('/:root\s*\{([^}]+)\}/s', $cssContent, $rootMatch)) {
            return;
        }

        $rootBlock = $rootMatch[1];

        // Extract custom property declarations
        $tokenPattern = '/--([a-z][a-z0-9-]*):\s*([^;]+);/i';
        if (!preg_match_all($tokenPattern, $rootBlock, $tokenMatches, PREG_SET_ORDER)) {
            return;
        }

        // Create token nodes
        foreach ($tokenMatches as $match) {
            $propName  = '--' . $match[1];
            $propValue = trim($match[2]);
            $tokenId   = 'token:' . $propName;

            $graph->addNode($tokenId, 'token', $propName, [
                'name'       => $propName,
                'value'      => $propValue,
                'sourceFile' => 'assets/css/style.css',
            ]);
        }

        // Scan all content files for var(--xxx) usage
        $varPattern = '/var\(--([a-z][a-z0-9-]*)\)/i';

        $contentNodes = array_merge(
            $graph->getNodesByType('page'),
            $graph->getNodesByType('partial')
        );

        foreach ($contentNodes as $node) {
            $filePath = $node['meta']['file_path'] ?? null;
            if ($filePath === null) {
                continue;
            }

            $content = $this->fileManager->readFile($filePath);
            if ($content === null) {
                continue;
            }

            if (!preg_match_all($varPattern, $content, $varMatches)) {
                continue;
            }

            // Deduplicate token references within a single file
            $seenTokens = [];
            foreach ($varMatches[1] as $tokenName) {
                $propName = '--' . $tokenName;
                $tokenId  = 'token:' . $propName;

                if (isset($seenTokens[$tokenId])) {
                    continue;
                }
                $seenTokens[$tokenId] = true;

                if ($graph->getNode($tokenId) === null) {
                    continue;
                }

                $graph->addEdge($node['id'], $tokenId, 'consumes_token');
            }
        }

        // Scan the CSS file itself for var() usage (stylesheet consumers).
        // The stylesheet is a real consumer of its own tokens — e.g. color
        // utilities, spacing helpers. Without this, getTokenConsumers() would
        // miss the single biggest consumer file.
        $cssNodeId = 'asset:assets/css/style.css';
        $graph->addNode($cssNodeId, 'asset', 'style.css', [
            'file_path'   => 'assets/css/style.css',
            'assetType'   => 'css',
        ]);

        if (preg_match_all($varPattern, $cssContent, $cssVarMatches)) {
            $seenCssTokens = [];
            foreach ($cssVarMatches[1] as $tokenName) {
                $propName = '--' . $tokenName;
                $tokenId  = 'token:' . $propName;

                if (isset($seenCssTokens[$tokenId])) {
                    continue;
                }
                $seenCssTokens[$tokenId] = true;

                if ($graph->getNode($tokenId) === null) {
                    continue;
                }

                $graph->addEdge($cssNodeId, $tokenId, 'consumes_token');
            }
        }
    }

    // ═══════════════════════════════════════════
    //  Section Summary Extraction (standalone)
    // ═══════════════════════════════════════════

    /**
     * Extract human-readable section summaries from HTML content.
     *
     * Standalone static method — does not depend on SiteContext.
     * Mirrors the logic from SiteContext::extractSectionSummaries()
     * (lines 798-895) but is independently testable.
     *
     * Signals used (in priority order):
     * 1. HTML comment preceding the section
     * 2. id attribute
     * 3. aria-label attribute
     * 4. First h1/h2/h3 heading
     *
     * @return list<string>
     */
    public static function extractSectionSummaries(string $html): array
    {
        $summaries = [];

        $pattern = '/(?:<!--\s*[═─=\-\s]*([^>]*?)[═─=\-\s]*-->\s*)?<section\b([^>]*)>(.*?)<\/section>/si';

        if (!preg_match_all($pattern, $html, $matches, PREG_SET_ORDER)) {
            return $summaries;
        }

        foreach ($matches as $match) {
            $commentLabel = trim($match[1] ?? '');
            $attrs        = $match[2] ?? '';
            $content      = $match[3] ?? '';

            $parts = [];

            // Signal 1: HTML comment label
            if ($commentLabel !== '') {
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
                $raw = preg_replace('/<br\s*\/?>/i', ' ', $hMatch[1]);
                $heading = trim(html_entity_decode(strip_tags($raw), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                $heading = preg_replace('/\s+/', ' ', $heading);
                if (mb_strlen($heading) > 80) {
                    $heading = mb_substr($heading, 0, 77) . '...';
                }
            }

            // Build the summary
            if (empty($parts) && $ariaLabel) {
                $parts[] = $ariaLabel;
            }

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

            if ($id && stripos($summary, $id) === false) {
                $summary .= " (#{$id})";
            }

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
}
