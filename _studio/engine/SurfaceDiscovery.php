<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Surface Discovery (Phase B-3)
 *
 * Deterministic step in the orchestration pipeline — no LLM call.
 * Takes the structured intent from IntentClassifier and queries
 * the SiteGraph to find candidate files for editing.
 *
 * Strategy: partials first, then pages, then assets.
 * If a partial covers the change, editing the partial is always
 * better than editing every page that includes it.
 *
 * Returns:
 *   {
 *     "candidates": [
 *       {"node_id": "partial:_partials/header.php", "type": "partial", "file": "_partials/header.php", "reason": "..."},
 *       ...
 *     ],
 *     "affected_pages": [...],   // pages impacted by editing the candidates
 *     "skipped": [...]           // nodes considered but not selected, with reason
 *   }
 */
class SurfaceDiscovery
{
    private SiteGraph $graph;

    public function __construct(SiteGraph $graph)
    {
        $this->graph = $graph;
    }

    /**
     * Discover candidate files from structured intent.
     *
     * @param array $intent {category, scope, keywords, summary}
     * @return array{candidates: list<array>, affected_pages: list<array>, skipped: list<array>}
     */
    public function discover(array $intent): array
    {
        $category = $intent['category'] ?? 'content';
        $scope    = $intent['scope'] ?? 'site-wide';
        $keywords = $intent['keywords'] ?? [];

        // ── Scoped to a specific node ──
        if (str_starts_with($scope, 'page:')) {
            return $this->discoverForPage($scope, $category, $keywords);
        }

        if (str_starts_with($scope, 'partial:')) {
            return $this->discoverForPartial($scope, $category);
        }

        if (str_starts_with($scope, 'token:')) {
            return $this->discoverForToken($scope);
        }

        // ── Site-wide: strategy depends on category ──
        return match ($category) {
            'style'      => $this->discoverStyleSiteWide($keywords),
            'seo'        => $this->discoverSeoSiteWide(),
            'navigation' => $this->discoverNavigationSiteWide(),
            'content'    => $this->discoverContentSiteWide($keywords),
            'structure'  => $this->discoverStructureSiteWide($keywords),
            default      => $this->discoverContentSiteWide($keywords),
        };
    }

    // ═══════════════════════════════════════════
    //  Scoped Discovery
    // ═══════════════════════════════════════════

    /**
     * Discover for a specific page scope.
     */
    private function discoverForPage(string $scope, string $category, array $keywords): array
    {
        $slug = substr($scope, 5); // strip "page:"
        $candidates = [];
        $skipped = [];

        // Find the page node — try common ID patterns
        $pageNode = $this->findPageBySlug($slug);

        if ($pageNode === null) {
            return [
                'candidates'     => [],
                'affected_pages' => [],
                'skipped'        => [['path' => $slug, 'reason' => 'Page not found in graph']],
            ];
        }

        // For style changes on a page, check if there's a shared partial
        // that would be better to edit (e.g. header partial instead of every page)
        if ($category === 'style') {
            // Check if the page includes partials with style-related content
            $deps = $this->graph->getDependencies($pageNode['id']);
            foreach ($deps as $dep) {
                if ($dep['type'] === 'partial' && $this->isStyleRelevant($dep, $keywords)) {
                    $candidates[] = $this->makeCandidate($dep, 'Shared partial with style content');
                }
            }
        }

        // Always include the page itself
        $candidates[] = $this->makeCandidate($pageNode, 'Target page');

        return [
            'candidates'     => $candidates,
            'affected_pages' => [$this->nodeToPageRef($pageNode)],
            'skipped'        => $skipped,
        ];
    }

    /**
     * Discover for a specific partial scope.
     */
    private function discoverForPartial(string $scope, string $category): array
    {
        $partialFile = substr($scope, 8); // strip "partial:"
        $nodeId = 'partial:' . $partialFile;
        $partialNode = $this->graph->getNode($nodeId);

        if ($partialNode === null) {
            return [
                'candidates'     => [],
                'affected_pages' => [],
                'skipped'        => [['path' => $partialFile, 'reason' => 'Partial not found in graph']],
            ];
        }

        $candidates = [$this->makeCandidate($partialNode, 'Direct target')];

        // Compute affected pages via blast radius
        $affectedPages = array_map(
            fn(array $n) => $this->nodeToPageRef($n),
            $this->graph->getBlastRadius($nodeId)
        );

        return [
            'candidates'     => $candidates,
            'affected_pages' => $affectedPages,
            'skipped'        => [],
        ];
    }

    /**
     * Discover for a specific token scope.
     */
    private function discoverForToken(string $scope): array
    {
        $tokenName = substr($scope, 6); // strip "token:"
        $nodeId = 'token:' . $tokenName;
        $tokenNode = $this->graph->getNode($nodeId);

        if ($tokenNode === null) {
            return [
                'candidates'     => [],
                'affected_pages' => [],
                'skipped'        => [['path' => $tokenName, 'reason' => 'Token not found in graph']],
            ];
        }

        // Token consumers are the files that define/use the token
        $consumers = $this->graph->getTokenConsumers($nodeId);
        $candidates = [];
        foreach ($consumers as $consumer) {
            $candidates[] = $this->makeCandidate($consumer, "Consumes token {$tokenName}");
        }

        // Affected pages
        $affectedPages = array_map(
            fn(array $n) => $this->nodeToPageRef($n),
            $this->graph->getBlastRadius($nodeId)
        );

        return [
            'candidates'     => $candidates,
            'affected_pages' => $affectedPages,
            'skipped'        => [],
        ];
    }

    // ═══════════════════════════════════════════
    //  Site-Wide Discovery by Category
    // ═══════════════════════════════════════════

    /**
     * Style changes site-wide: prioritize assets (CSS) and token consumers.
     */
    private function discoverStyleSiteWide(array $keywords): array
    {
        $candidates = [];
        $skipped = [];

        // 1. CSS assets first — editing one CSS file is better than editing every page
        $assets = $this->graph->getNodesByType('asset');
        foreach ($assets as $asset) {
            $filePath = $asset['meta']['file_path'] ?? '';
            if (preg_match('/\.css$/i', $filePath)) {
                $candidates[] = $this->makeCandidate($asset, 'Global stylesheet');
            }
        }

        // 2. Check tokens matching keywords
        if (!empty($keywords)) {
            $tokens = $this->graph->getNodesByType('token');
            foreach ($tokens as $token) {
                $tokenLabel = strtolower($token['label']);
                foreach ($keywords as $kw) {
                    if (str_contains($tokenLabel, strtolower($kw))) {
                        // Find the asset/file that defines this token
                        $tokenConsumers = $this->graph->getTokenConsumers($token['id']);
                        foreach ($tokenConsumers as $consumer) {
                            if ($consumer['type'] === 'asset') {
                                // Already captured above, skip
                                continue;
                            }
                            $candidates[] = $this->makeCandidate($consumer, "Defines token {$token['label']}");
                        }
                        break;
                    }
                }
            }
        }

        // 3. Style-relevant partials (header, footer with inline styles)
        $partials = $this->graph->getNodesByType('partial');
        foreach ($partials as $partial) {
            if ($this->isStyleRelevant($partial, $keywords)) {
                $candidates[] = $this->makeCandidate($partial, 'Partial with style content');
            }
        }

        // Deduplicate by node_id
        $candidates = $this->deduplicateCandidates($candidates);

        // Affected pages: for site-wide style, it's typically all pages
        $allPages = array_map(
            fn(array $n) => $this->nodeToPageRef($n),
            $this->graph->getNodesByType('page')
        );

        return [
            'candidates'     => $candidates,
            'affected_pages' => $allPages,
            'skipped'        => $skipped,
        ];
    }

    /**
     * SEO changes site-wide: all pages need meta tag updates.
     */
    private function discoverSeoSiteWide(): array
    {
        $candidates = [];
        $skipped = [];

        // SEO partials (head, seo, meta) are the best target
        $partials = $this->graph->getNodesByType('partial');
        foreach ($partials as $partial) {
            $file = basename($partial['meta']['file_path'] ?? '');
            if (preg_match('/head|seo|meta/i', $file)) {
                $candidates[] = $this->makeCandidate($partial, 'SEO-relevant partial (shared head)');
            }
        }

        // If no SEO partial, fall back to individual pages
        if (empty($candidates)) {
            $pages = $this->graph->getNodesByType('page');
            foreach ($pages as $page) {
                $candidates[] = $this->makeCandidate($page, 'Direct page (no shared head partial)');
            }
        }

        $allPages = array_map(
            fn(array $n) => $this->nodeToPageRef($n),
            $this->graph->getNodesByType('page')
        );

        return [
            'candidates'     => $candidates,
            'affected_pages' => $allPages,
            'skipped'        => $skipped,
        ];
    }

    /**
     * Navigation changes site-wide: nav partials.
     */
    private function discoverNavigationSiteWide(): array
    {
        $candidates = [];
        $skipped = [];

        $partials = $this->graph->getNodesByType('partial');
        foreach ($partials as $partial) {
            $file = basename($partial['meta']['file_path'] ?? '');
            if (preg_match('/nav|menu|header|sidebar/i', $file)) {
                $candidates[] = $this->makeCandidate($partial, 'Navigation partial');
            }
        }

        // Affected pages: all pages that include these partials
        $affectedPages = [];
        $seen = [];
        foreach ($candidates as $c) {
            foreach ($this->graph->getBlastRadius($c['node_id']) as $page) {
                if (!isset($seen[$page['id']])) {
                    $affectedPages[] = $this->nodeToPageRef($page);
                    $seen[$page['id']] = true;
                }
            }
        }

        return [
            'candidates'     => $candidates,
            'affected_pages' => $affectedPages,
            'skipped'        => $skipped,
        ];
    }

    /**
     * Content changes site-wide: all pages or keyword-matched partials.
     */
    private function discoverContentSiteWide(array $keywords): array
    {
        $candidates = [];
        $skipped = [];

        // Check partials first — shared content partials
        $partials = $this->graph->getNodesByType('partial');
        foreach ($partials as $partial) {
            if ($this->isContentRelevant($partial, $keywords)) {
                $candidates[] = $this->makeCandidate($partial, 'Content partial matching keywords');
            }
        }

        // If no partials matched, all pages are candidates
        if (empty($candidates)) {
            $pages = $this->graph->getNodesByType('page');
            foreach ($pages as $page) {
                $candidates[] = $this->makeCandidate($page, 'Page content (no matching partial found)');
            }
        }

        $allPages = array_map(
            fn(array $n) => $this->nodeToPageRef($n),
            $this->graph->getNodesByType('page')
        );

        return [
            'candidates'     => $candidates,
            'affected_pages' => $allPages,
            'skipped'        => $skipped,
        ];
    }

    /**
     * Structure changes site-wide: all pages.
     */
    private function discoverStructureSiteWide(array $keywords): array
    {
        $candidates = [];

        $pages = $this->graph->getNodesByType('page');
        foreach ($pages as $page) {
            $candidates[] = $this->makeCandidate($page, 'Structure change target');
        }

        return [
            'candidates'     => $candidates,
            'affected_pages' => array_map(fn($n) => $this->nodeToPageRef($n), $pages),
            'skipped'        => [],
        ];
    }

    // ═══════════════════════════════════════════
    //  Helpers
    // ═══════════════════════════════════════════

    /**
     * Find a page node by slug (tries common patterns).
     */
    private function findPageBySlug(string $slug): ?array
    {
        // Try exact node ID match
        $node = $this->graph->getNode("page:{$slug}");
        if ($node !== null) return $node;

        // Try with .php extension
        $node = $this->graph->getNode("page:{$slug}.php");
        if ($node !== null) return $node;

        // Search by slug in meta
        foreach ($this->graph->getNodesByType('page') as $page) {
            if (($page['meta']['slug'] ?? '') === $slug ||
                ($page['meta']['slug'] ?? '') === "/{$slug}") {
                return $page;
            }
        }

        return null;
    }

    /**
     * Check if a partial is relevant to style changes.
     */
    private function isStyleRelevant(array $node, array $keywords): bool
    {
        $file = strtolower(basename($node['meta']['file_path'] ?? $node['id']));
        // Style-adjacent partials
        if (preg_match('/style|css|head|theme/i', $file)) {
            return true;
        }
        // Keyword match in filename
        foreach ($keywords as $kw) {
            if (str_contains($file, strtolower($kw))) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if a partial is relevant to content changes.
     */
    private function isContentRelevant(array $node, array $keywords): bool
    {
        $file = strtolower(basename($node['meta']['file_path'] ?? $node['id']));
        foreach ($keywords as $kw) {
            if (str_contains($file, strtolower($kw))) {
                return true;
            }
        }
        return false;
    }

    /**
     * Convert a graph node to a candidate structure.
     */
    private function makeCandidate(array $node, string $reason): array
    {
        $filePath = $node['meta']['file_path'] ?? '';

        // For page nodes, derive file path from ID
        if ($node['type'] === 'page' && empty($filePath)) {
            $filePath = str_replace('page:', '', $node['id']);
        }

        // For partial nodes
        if ($node['type'] === 'partial' && empty($filePath)) {
            $filePath = str_replace('partial:', '', $node['id']);
        }

        return [
            'node_id' => $node['id'],
            'type'    => $node['type'],
            'label'   => $node['label'],
            'file'    => $filePath,
            'reason'  => $reason,
        ];
    }

    /**
     * Convert a page node to a compact reference.
     */
    private function nodeToPageRef(array $node): array
    {
        return [
            'node_id' => $node['id'],
            'label'   => $node['label'],
            'slug'    => $node['meta']['slug'] ?? '',
        ];
    }

    /**
     * Deduplicate candidates by node_id, keeping the first occurrence.
     */
    private function deduplicateCandidates(array $candidates): array
    {
        $seen = [];
        $result = [];
        foreach ($candidates as $c) {
            if (!isset($seen[$c['node_id']])) {
                $seen[$c['node_id']] = true;
                $result[] = $c;
            }
        }
        return $result;
    }
}
