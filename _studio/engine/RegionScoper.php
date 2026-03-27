<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Region Scoper (Phase B-4)
 *
 * Deterministic step — no LLM call.
 * Reads each candidate file from disk, identifies the relevant region(s)
 * based on intent category/keywords, and returns focused excerpts
 * with line numbers.
 *
 * The output feeds PlanBuilder (LLM call #2) with scoped context
 * instead of full file contents — keeping the token budget tight
 * and the edit target precise.
 *
 * Strategy by category:
 *   style   → CSS custom properties, selectors matching keywords, :root block
 *   content → PHP metadata arrays ($page), HTML body sections
 *   seo     → <head>, <title>, meta tags, $page['title'|'description']
 *   nav     → <nav>, <ul> link lists, $navLinks arrays
 *   struct  → full file (structural changes need full context)
 */
class RegionScoper
{
    private FileManager $fileManager;

    public function __construct(?FileManager $fileManager = null)
    {
        $db = Database::getInstance();
        $this->fileManager = $fileManager ?? new FileManager($db);
    }

    /**
     * Scope regions for all candidates.
     *
     * @param array $candidates From SurfaceDiscovery: [{node_id, type, file, reason, ...}]
     * @param array $intent     From IntentClassifier: {category, scope, keywords, summary}
     *
     * @return list<array{
     *   file: string,
     *   type: string,
     *   regions: list<array{start: int, end: int, label: string, content: string}>,
     *   total_lines: int,
     *   strategy: string,
     *   reason: string
     * }>
     */
    public function scope(array $candidates, array $intent): array
    {
        $category = $intent['category'] ?? 'content';
        $keywords = $intent['keywords'] ?? [];
        $scoped = [];

        foreach ($candidates as $candidate) {
            $filePath = $candidate['file'] ?? '';
            if ($filePath === '') continue;

            $content = $this->fileManager->readFile($filePath);
            if ($content === null) {
                $scoped[] = [
                    'file'        => $filePath,
                    'type'        => $candidate['type'] ?? 'unknown',
                    'regions'     => [],
                    'total_lines' => 0,
                    'strategy'    => 'skip',
                    'reason'      => 'File not readable',
                ];
                continue;
            }

            $lines = explode("\n", $content);
            $totalLines = count($lines);

            // Determine strategy and extract regions.
            // $lines passed to all scopers so merged regions can be rebuilt
            // from real source — never synthetic markers.
            $result = match ($category) {
                'style'      => $this->scopeStyle($lines, $keywords, $filePath),
                'seo'        => $this->scopeSeo($lines, $keywords, $filePath),
                'navigation' => $this->scopeNavigation($lines, $keywords, $filePath),
                'content'    => $this->scopeContent($lines, $keywords, $filePath),
                'structure'  => $this->scopeStructure($lines, $filePath),
                default      => $this->scopeContent($lines, $keywords, $filePath),
            };

            $scoped[] = [
                'file'        => $filePath,
                'type'        => $candidate['type'] ?? 'unknown',
                'regions'     => $result['regions'],
                'total_lines' => $totalLines,
                'strategy'    => $result['strategy'],
                'reason'      => $candidate['reason'] ?? '',
            ];
        }

        return $scoped;
    }

    // ═══════════════════════════════════════════
    //  Category-Specific Scopers
    // ═══════════════════════════════════════════

    /**
     * Style: find CSS variables, selectors matching keywords, :root block.
     */
    private function scopeStyle(array $lines, array $keywords, string $filePath): array
    {
        $regions = [];
        $isCss = preg_match('/\.css$/i', $filePath);

        if ($isCss) {
            // Find :root block
            $rootRegion = $this->findBlock($lines, ':root');
            if ($rootRegion) {
                $regions[] = $rootRegion;
            }

            // Find CSS selectors matching keywords
            foreach ($keywords as $kw) {
                $kwLower = strtolower($kw);
                foreach ($lines as $i => $line) {
                    $lineLower = strtolower($line);
                    if (str_contains($lineLower, $kwLower) && preg_match('/\{/', $line)) {
                        $block = $this->findBlockAt($lines, $i);
                        if ($block && !$this->regionOverlaps($regions, $block)) {
                            $regions[] = $block;
                        }
                    }
                }
            }
        } else {
            // PHP file with inline styles or style attributes
            $regions = $this->findKeywordRegions($lines, $keywords, 3);

            // Also look for <style> blocks
            $styleRegion = $this->findHtmlBlock($lines, 'style');
            if ($styleRegion) {
                $regions[] = $styleRegion;
            }
        }

        // If no regions found, include the full file (capped)
        if (empty($regions)) {
            $regions = [$this->fullFileRegion($lines, 'Full file (no specific region matched)')];
        }

        return [
            'strategy' => $isCss ? 'token-edit' : 'attribute-edit',
            'regions'  => $this->sortAndMergeRegions($regions, $lines),
        ];
    }

    /**
     * SEO: find <head>, <title>, meta tags, $page arrays.
     */
    private function scopeSeo(array $lines, array $keywords, string $filePath): array
    {
        $regions = [];

        // <head> block
        $headRegion = $this->findHtmlBlock($lines, 'head');
        if ($headRegion) {
            $regions[] = $headRegion;
        }

        // PHP $page metadata array
        $pageArrayRegion = $this->findPhpArray($lines, '$page');
        if ($pageArrayRegion) {
            $regions[] = $pageArrayRegion;
        }

        // Meta tags anywhere in the file
        $metaRegions = $this->findMatchingLines($lines, '/<meta\b/i', 1);
        foreach ($metaRegions as $r) {
            if (!$this->regionOverlaps($regions, $r)) {
                $regions[] = $r;
            }
        }

        // <title> tag
        $titleRegions = $this->findMatchingLines($lines, '/<title\b/i', 1);
        foreach ($titleRegions as $r) {
            if (!$this->regionOverlaps($regions, $r)) {
                $regions[] = $r;
            }
        }

        if (empty($regions)) {
            $regions = [$this->fullFileRegion($lines, 'Full file (no SEO regions matched)')];
        }

        return [
            'strategy' => 'meta-edit',
            'regions'  => $this->sortAndMergeRegions($regions, $lines),
        ];
    }

    /**
     * Navigation: find <nav>, menu lists, $navLinks arrays.
     */
    private function scopeNavigation(array $lines, array $keywords, string $filePath): array
    {
        $regions = [];

        // <nav> blocks
        $navRegion = $this->findHtmlBlock($lines, 'nav');
        if ($navRegion) {
            $regions[] = $navRegion;
        }

        // PHP nav arrays
        $navArray = $this->findPhpArray($lines, '$navLinks');
        if ($navArray) {
            $regions[] = $navArray;
        }

        // <ul> lists with links
        foreach ($lines as $i => $line) {
            if (preg_match('/<ul\b/i', $line) && $this->blockContainsPattern($lines, $i, '/<a\b/i')) {
                $block = $this->findHtmlBlockAt($lines, $i, 'ul');
                if ($block && !$this->regionOverlaps($regions, $block)) {
                    $regions[] = $block;
                }
            }
        }

        if (empty($regions)) {
            $regions = [$this->fullFileRegion($lines, 'Full file (no nav regions matched)')];
        }

        return [
            'strategy' => 'block-edit',
            'regions'  => $this->sortAndMergeRegions($regions, $lines),
        ];
    }

    /**
     * Content: find body content, text regions, keyword matches.
     */
    private function scopeContent(array $lines, array $keywords, string $filePath): array
    {
        $regions = [];

        // PHP $page metadata
        $pageArray = $this->findPhpArray($lines, '$page');
        if ($pageArray) {
            $regions[] = $pageArray;
        }

        // Keyword-matching regions in the body
        if (!empty($keywords)) {
            $kwRegions = $this->findKeywordRegions($lines, $keywords, 5);
            foreach ($kwRegions as $r) {
                if (!$this->regionOverlaps($regions, $r)) {
                    $regions[] = $r;
                }
            }
        }

        // <main> or <section> blocks
        foreach (['main', 'section', 'article'] as $tag) {
            $block = $this->findHtmlBlock($lines, $tag);
            if ($block && !$this->regionOverlaps($regions, $block)) {
                $regions[] = $block;
                break; // One main content block is usually enough
            }
        }

        if (empty($regions)) {
            $regions = [$this->fullFileRegion($lines, 'Full file (no content regions matched)')];
        }

        return [
            'strategy' => 'content-edit',
            'regions'  => $this->sortAndMergeRegions($regions, $lines),
        ];
    }

    /**
     * Structure: always return full file — structural changes need full context.
     */
    private function scopeStructure(array $lines, string $filePath): array
    {
        return [
            'strategy' => 'full-rewrite',
            'regions'  => [$this->fullFileRegion($lines, 'Full file (structural change)')],
        ];
    }

    // ═══════════════════════════════════════════
    //  Region Detection Helpers
    // ═══════════════════════════════════════════

    /**
     * Find a CSS/PHP block starting with a pattern (e.g. ':root', '.header').
     */
    private function findBlock(array $lines, string $pattern): ?array
    {
        $patternLower = strtolower($pattern);
        foreach ($lines as $i => $line) {
            if (str_contains(strtolower($line), $patternLower)) {
                return $this->findBlockAt($lines, $i);
            }
        }
        return null;
    }

    /**
     * Find the block boundaries starting at a given line (brace-matching).
     */
    private function findBlockAt(array $lines, int $startLine): ?array
    {
        $depth = 0;
        $foundOpen = false;
        $start = max(0, $startLine - 1); // Include preceding comment/selector line

        for ($i = $startLine; $i < count($lines); $i++) {
            $line = $lines[$i];
            $depth += substr_count($line, '{') - substr_count($line, '}');

            if (!$foundOpen && str_contains($line, '{')) {
                $foundOpen = true;
            }

            if ($foundOpen && $depth <= 0) {
                $end = $i;
                $content = implode("\n", array_slice($lines, $start, $end - $start + 1));
                return [
                    'start'   => $start + 1, // 1-indexed
                    'end'     => $end + 1,
                    'label'   => trim($lines[$startLine]),
                    'content' => $content,
                ];
            }
        }

        return null;
    }

    /**
     * Find an HTML block by tag name (<tag>...</tag>).
     */
    private function findHtmlBlock(array $lines, string $tag): ?array
    {
        $openPattern = '/<' . preg_quote($tag, '/') . '\b/i';
        $closePattern = '/<\/' . preg_quote($tag, '/') . '>/i';

        $start = null;
        foreach ($lines as $i => $line) {
            if ($start === null && preg_match($openPattern, $line)) {
                $start = $i;
            }
            if ($start !== null && preg_match($closePattern, $line)) {
                $content = implode("\n", array_slice($lines, $start, $i - $start + 1));
                return [
                    'start'   => $start + 1,
                    'end'     => $i + 1,
                    'label'   => "<{$tag}> block",
                    'content' => $content,
                ];
            }
        }

        return null;
    }

    /**
     * Find an HTML block starting at a specific line.
     */
    private function findHtmlBlockAt(array $lines, int $startLine, string $tag): ?array
    {
        $closePattern = '/<\/' . preg_quote($tag, '/') . '>/i';
        for ($i = $startLine; $i < count($lines); $i++) {
            if (preg_match($closePattern, $lines[$i])) {
                $content = implode("\n", array_slice($lines, $startLine, $i - $startLine + 1));
                return [
                    'start'   => $startLine + 1,
                    'end'     => $i + 1,
                    'label'   => "<{$tag}> block",
                    'content' => $content,
                ];
            }
        }
        return null;
    }

    /**
     * Find a PHP array assignment ($page = [...]).
     */
    private function findPhpArray(array $lines, string $varName): ?array
    {
        $pattern = preg_quote($varName, '/');
        foreach ($lines as $i => $line) {
            if (preg_match("/{$pattern}\s*=\s*\[/", $line)) {
                // Find the closing bracket
                $depth = 0;
                for ($j = $i; $j < count($lines); $j++) {
                    $depth += substr_count($lines[$j], '[') - substr_count($lines[$j], ']');
                    if ($depth <= 0) {
                        $content = implode("\n", array_slice($lines, $i, $j - $i + 1));
                        return [
                            'start'   => $i + 1,
                            'end'     => $j + 1,
                            'label'   => "{$varName} array",
                            'content' => $content,
                        ];
                    }
                }
            }
        }
        return null;
    }

    /**
     * Find lines matching a regex pattern, with context padding.
     */
    private function findMatchingLines(array $lines, string $pattern, int $contextPad = 2): array
    {
        $regions = [];
        foreach ($lines as $i => $line) {
            if (preg_match($pattern, $line)) {
                $start = max(0, $i - $contextPad);
                $end = min(count($lines) - 1, $i + $contextPad);
                $content = implode("\n", array_slice($lines, $start, $end - $start + 1));
                $regions[] = [
                    'start'   => $start + 1,
                    'end'     => $end + 1,
                    'label'   => 'Line ' . ($i + 1) . ': ' . trim($line),
                    'content' => $content,
                ];
            }
        }
        return $regions;
    }

    /**
     * Find regions where keywords appear, with context padding.
     */
    private function findKeywordRegions(array $lines, array $keywords, int $contextPad = 3): array
    {
        $regions = [];
        $matched = [];

        foreach ($keywords as $kw) {
            $kwLower = strtolower($kw);
            foreach ($lines as $i => $line) {
                if (isset($matched[$i])) continue;
                if (str_contains(strtolower($line), $kwLower)) {
                    $matched[$i] = true;
                    $start = max(0, $i - $contextPad);
                    $end = min(count($lines) - 1, $i + $contextPad);
                    $content = implode("\n", array_slice($lines, $start, $end - $start + 1));
                    $regions[] = [
                        'start'   => $start + 1,
                        'end'     => $end + 1,
                        'label'   => "Keyword '{$kw}' at line " . ($i + 1),
                        'content' => $content,
                    ];
                }
            }
        }
        return $regions;
    }

    /**
     * Check if a block starting at $startLine contains a pattern.
     */
    private function blockContainsPattern(array $lines, int $startLine, string $pattern): bool
    {
        // Look ahead up to 30 lines for the pattern
        $end = min(count($lines), $startLine + 30);
        for ($i = $startLine; $i < $end; $i++) {
            if (preg_match($pattern, $lines[$i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Create a full-file region (capped at 150 lines for prompt safety).
     *
     * Content is PURE filesystem text — no synthetic markers.
     * Truncation metadata is carried as a separate field.
     */
    private function fullFileRegion(array $lines, string $label): array
    {
        $total = count($lines);
        $cap = min($total, 150);
        $content = implode("\n", array_slice($lines, 0, $cap));
        return [
            'start'     => 1,
            'end'       => $cap,
            'label'     => $label,
            'content'   => $content,
            'truncated' => $total > $cap ? ($total - $cap) : 0,
        ];
    }

    /**
     * Check if a new region overlaps with any existing region.
     */
    private function regionOverlaps(array $regions, array $newRegion): bool
    {
        foreach ($regions as $existing) {
            if ($newRegion['start'] <= $existing['end'] && $newRegion['end'] >= $existing['start']) {
                return true;
            }
        }
        return false;
    }

    /**
     * Sort regions by start line and merge overlapping ones.
     *
     * Merged regions are rebuilt from the original $lines array
     * so content is always pure filesystem text.
     */
    private function sortAndMergeRegions(array $regions, array $lines): array
    {
        if (count($regions) <= 1) return $regions;

        usort($regions, fn($a, $b) => $a['start'] <=> $b['start']);

        $merged = [$regions[0]];
        for ($i = 1; $i < count($regions); $i++) {
            $last = &$merged[count($merged) - 1];
            $curr = $regions[$i];

            // Merge if overlapping or adjacent (within 3 lines)
            if ($curr['start'] <= $last['end'] + 3) {
                $newEnd = max($last['end'], $curr['end']);
                // Rebuild from real source lines (1-indexed → 0-indexed)
                $startIdx = $last['start'] - 1;
                $endIdx   = $newEnd - 1;
                $last['end'] = $newEnd;
                $last['label'] .= ' + ' . $curr['label'];
                $last['content'] = implode("\n", array_slice($lines, $startIdx, $endIdx - $startIdx + 1));
            } else {
                $merged[] = $curr;
            }
        }

        return $merged;
    }
}
