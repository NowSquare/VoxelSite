<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Shared $navLinks parser, serializer, and move logic.
 *
 * Consumed by both the Site Control mutation endpoint and
 * FileManager::syncNavOrderFromPartial(). One parser, one truth.
 *
 * The canonical $navLinks contract:
 * - Variable must be named $navLinks
 * - Array must contain only literal values (strings, booleans, arrays)
 * - No function calls, concatenation, conditionals, or variables
 * - Entries have 'href' (string) and 'label' (string)
 * - Optional: 'home' => true (pinned at position 0, immovable)
 * - Optional: 'children' => [...] (depth-1 only)
 * - Optional: 'slug' => '...' (accepted but not required)
 */
class NavLinksParser
{
    // ═══════════════════════════════════════════
    //  Parser — extract $navLinks from file content
    // ═══════════════════════════════════════════

    /**
     * Parse the canonical $navLinks block from nav.php content
     * WITHOUT executing PHP.
     *
     * @param  string $fileContent  Full content of nav.php
     * @return array|null  Parsed navLinks tree, or null if:
     *                     - no $navLinks block found
     *                     - block contains non-literal content
     *                     - syntax is malformed
     */
    public static function parse(string $fileContent): ?array
    {
        // Find the $navLinks = [ declaration
        if (!preg_match('/^\s*\$navLinks\s*=\s*\[/m', $fileContent, $m, PREG_OFFSET_CAPTURE)) {
            return null;
        }

        $startOffset = $m[0][1];

        // Find the opening bracket position within the match
        $bracketPos = strpos($fileContent, '[', $startOffset);
        if ($bracketPos === false) {
            return null;
        }

        // Extract the balanced array literal
        $arrayStr = self::extractBalancedBrackets($fileContent, $bracketPos);
        if ($arrayStr === null) {
            return null;
        }

        // Validate: only literal content allowed
        if (!self::isLiteralOnly($arrayStr)) {
            return null;
        }

        // Parse the PHP array literal into a data structure
        return self::parseLiteralArray($arrayStr);
    }

    /**
     * Extract a balanced [...] block from content starting at $pos.
     *
     * @param  string $content
     * @param  int    $pos  Position of the opening '['
     * @return string|null  The bracketed content including outer brackets, or null
     */
    private static function extractBalancedBrackets(string $content, int $pos): ?string
    {
        if (!isset($content[$pos]) || $content[$pos] !== '[') {
            return null;
        }

        $depth = 0;
        $len = strlen($content);
        $inSingleQuote = false;
        $inDoubleQuote = false;

        for ($i = $pos; $i < $len; $i++) {
            $char = $content[$i];
            $prev = $i > 0 ? $content[$i - 1] : '';

            // Handle string boundaries (skip escaped quotes)
            if ($char === "'" && !$inDoubleQuote && $prev !== '\\') {
                $inSingleQuote = !$inSingleQuote;
                continue;
            }
            if ($char === '"' && !$inSingleQuote && $prev !== '\\') {
                $inDoubleQuote = !$inDoubleQuote;
                continue;
            }

            // Skip characters inside strings
            if ($inSingleQuote || $inDoubleQuote) {
                continue;
            }

            if ($char === '[') {
                $depth++;
            } elseif ($char === ']') {
                $depth--;
                if ($depth === 0) {
                    return substr($content, $pos, $i - $pos + 1);
                }
            }
        }

        return null; // Unbalanced
    }

    /**
     * Validate that an array literal string contains only literals.
     * Rejects function calls, variables ($), concatenation (.), and conditionals.
     *
     * @param  string $arrayStr  The [...] block
     * @return bool
     */
    private static function isLiteralOnly(string $arrayStr): bool
    {
        // Remove string contents to avoid false positives on characters inside strings
        $stripped = self::stripStringContents($arrayStr);

        // Reject PHP variables ($ followed by letter/underscore)
        if (preg_match('/\$[a-zA-Z_]/', $stripped)) {
            return false;
        }

        // Reject function calls: identifier followed by (
        // But allow array keywords: 'true', 'false', 'null'
        if (preg_match('/\b(?!true\b|false\b|null\b|children\b|href\b|label\b|home\b|slug\b)[a-zA-Z_]\w*\s*\(/', $stripped)) {
            return false;
        }

        // Reject string concatenation operator (. not preceded/followed by digits for floats)
        if (preg_match('/[\'\"]\s*\./', $stripped) || preg_match('/\.\s*[\'\"]/', $stripped)) {
            return false;
        }

        // Reject ternary/conditionals
        if (str_contains($stripped, '?') || str_contains($stripped, ':') && !str_contains($stripped, '=>')) {
            // Allow => but reject standalone : (ternary)
            // More precise: look for ? not inside a closing tag
            $withoutClosingTags = str_replace('?>', '', $stripped);
            if (str_contains($withoutClosingTags, '?')) {
                return false;
            }
        }

        return true;
    }

    /**
     * Replace contents of quoted strings with placeholder to avoid false pattern matches.
     */
    private static function stripStringContents(string $str): string
    {
        // Replace single-quoted strings with placeholder
        $str = preg_replace("/'(?:[^'\\\\]|\\\\.)*'/", "'_'", $str) ?? $str;
        // Replace double-quoted strings with placeholder
        $str = preg_replace('/"(?:[^"\\\\]|\\\\.)*"/', '"_"', $str) ?? $str;
        return $str;
    }

    /**
     * Parse a PHP literal array string into a PHP data structure.
     *
     * Handles: ['href' => '/about', 'label' => 'About', 'home' => true, 'children' => [...]]
     *
     * @param  string $arrayStr  The complete [...] block
     * @return array|null  Parsed array, or null on failure
     */
    private static function parseLiteralArray(string $arrayStr): ?array
    {
        // Strategy: use token_get_all for safe parsing of the literal.
        // Wrap in a valid PHP expression to tokenize.
        $php = '<' . '?php $__parsed = ' . $arrayStr . ';';

        // Suppress warnings from tokenizer
        $tokens = @token_get_all($php);
        if (empty($tokens)) {
            return null;
        }

        // Safety check: ensure no T_VARIABLE except $__parsed, no T_STRING used as a function call
        foreach ($tokens as $token) {
            if (!is_array($token)) {
                continue;
            }
            [$id, $value] = $token;

            if ($id === T_VARIABLE && $value !== '$__parsed') {
                return null; // Contains variables
            }
        }

        // Use eval safely - content has been validated as literal-only by isLiteralOnly()
        // isLiteralOnly() has rejected all non-literal content before we reach here
        try {
            $result = @eval('return ' . $arrayStr . ';');
            if (!is_array($result)) {
                return null;
            }
            return self::normalizeEntries($result);
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Normalize parsed entries to ensure consistent structure.
     * Keeps only recognized keys: href, label, home, children, slug.
     *
     * @param  array $entries  Raw parsed array
     * @return array|null  Normalized entries, or null if any entry is invalid
     */
    private static function normalizeEntries(array $entries): ?array
    {
        $result = [];

        foreach ($entries as $entry) {
            if (!is_array($entry) || !isset($entry['href']) || !isset($entry['label'])) {
                return null; // Invalid entry structure
            }

            $normalized = [
                'href'  => (string) $entry['href'],
                'label' => (string) $entry['label'],
            ];

            // Optional: home flag
            if (!empty($entry['home'])) {
                $normalized['home'] = true;
            }

            // Optional: slug (accepted but not required by canonical contract)
            if (isset($entry['slug'])) {
                $normalized['slug'] = (string) $entry['slug'];
            }

            // Optional: children (depth-1)
            if (isset($entry['children']) && is_array($entry['children'])) {
                $children = [];
                foreach ($entry['children'] as $child) {
                    if (!is_array($child) || !isset($child['href']) || !isset($child['label'])) {
                        return null; // Invalid child structure
                    }

                    $normalizedChild = [
                        'href'  => (string) $child['href'],
                        'label' => (string) $child['label'],
                    ];

                    if (isset($child['slug'])) {
                        $normalizedChild['slug'] = (string) $child['slug'];
                    }

                    // Children cannot have their own children (depth-1 only)
                    if (isset($child['children'])) {
                        return null; // Depth > 1 not supported
                    }

                    $children[] = $normalizedChild;
                }

                if (!empty($children)) {
                    $normalized['children'] = $children;
                }
            }

            $result[] = $normalized;
        }

        return $result;
    }

    // ═══════════════════════════════════════════
    //  Serializer — write $navLinks back to PHP source
    // ═══════════════════════════════════════════

    /**
     * Serialize a $navLinks tree back to a PHP source block.
     *
     * @param  array $navLinks  The nav tree
     * @return string  PHP source code for the $navLinks declaration
     */
    public static function serialize(array $navLinks): string
    {
        $lines = ['$navLinks = ['];

        foreach ($navLinks as $entry) {
            $parts = [];
            $parts[] = "'href' => " . self::quoteString($entry['href']);
            $parts[] = "'label' => " . self::quoteString($entry['label']);

            if (!empty($entry['home'])) {
                $parts[] = "'home' => true";
            }

            if (!empty($entry['children'])) {
                $childLines = [];
                foreach ($entry['children'] as $child) {
                    $childParts = [];
                    $childParts[] = "'href' => " . self::quoteString($child['href']);
                    $childParts[] = "'label' => " . self::quoteString($child['label']);
                    $childLines[] = '      [' . implode(', ', $childParts) . ']';
                }
                $parts[] = "'children' => [\n" . implode(",\n", $childLines) . ",\n    ]";
            }

            $lines[] = '  [' . implode(', ', $parts) . '],';
        }

        $lines[] = '];';

        return implode("\n", $lines);
    }

    /**
     * Quote a string for PHP source output.
     */
    private static function quoteString(string $value): string
    {
        return "'" . str_replace(["\\", "'"], ["\\\\", "\\'"], $value) . "'";
    }

    // ═══════════════════════════════════════════
    //  Move logic — apply reorder/reparent
    // ═══════════════════════════════════════════

    /**
     * Apply a move operation to a $navLinks tree.
     *
     * targetIndex is zero-based within the **movable subset**.
     * When a pinned Home entry exists at root, it is excluded from
     * the movable index space: targetIndex=0 means first position
     * after Home.
     *
     * @param  array       $navLinks         The current nav tree
     * @param  string      $pageHref         Href of the page being moved
     * @param  string|null $targetParentHref  null for root, or parent href
     * @param  int         $targetIndex      Zero-based position in movable subset
     * @return array  The modified nav tree
     *
     * @throws \RuntimeException if pageHref not found, targetParent not found,
     *                           or other structural errors
     */
    public static function applyMove(array $navLinks, string $pageHref, ?string $targetParentHref, int $targetIndex): array
    {
        // Guard: homepage ("/") cannot be used as a parent target
        if ($targetParentHref === '/') {
            throw new \RuntimeException('Homepage ("/") cannot be used as a parent target');
        }

        // Guard: cannot reparent an entry that has children (would silently drop subtree)
        if ($targetParentHref !== null && self::hasChildren($navLinks, $pageHref)) {
            throw new \RuntimeException("Page '{$pageHref}' has children and cannot be nested under another parent. Move its children first.");
        }

        // 1. Find and remove the entry from its current position
        $entry = null;
        $navLinks = self::removeEntry($navLinks, $pageHref, $entry);

        if ($entry === null) {
            throw new \RuntimeException("Page '{$pageHref}' not found in nav tree");
        }

        // 2. Insert at the target position
        if ($targetParentHref === null) {
            // Insert at root level, respecting pinned Home
            $hasHomeEntry = self::hasHomeEntry($navLinks);
            $insertAt = $hasHomeEntry ? $targetIndex + 1 : $targetIndex;

            // Validate index
            $movableCount = count($navLinks) - ($hasHomeEntry ? 1 : 0);
            if ($targetIndex < 0 || $targetIndex > $movableCount) {
                throw new \RuntimeException("Target index {$targetIndex} is out of range (0-{$movableCount})");
            }

            array_splice($navLinks, $insertAt, 0, [$entry]);
        } else {
            // Insert as child of target parent
            $found = false;
            foreach ($navLinks as &$parentEntry) {
                if ($parentEntry['href'] === $targetParentHref) {
                    if (!isset($parentEntry['children'])) {
                        $parentEntry['children'] = [];
                    }

                    $childCount = count($parentEntry['children']);
                    if ($targetIndex < 0 || $targetIndex > $childCount) {
                        throw new \RuntimeException("Target index {$targetIndex} is out of range (0-{$childCount})");
                    }

                    array_splice($parentEntry['children'], $targetIndex, 0, [$entry]);
                    $found = true;
                    break;
                }
            }
            unset($parentEntry);

            if (!$found) {
                throw new \RuntimeException("Target parent '{$targetParentHref}' not found in nav tree");
            }
        }

        // 3. Clean up empty children arrays
        return self::cleanupEmptyChildren($navLinks);
    }

    /**
     * Check if the root nav tree has a pinned Home entry.
     */
    public static function hasHomeEntry(array $navLinks): bool
    {
        foreach ($navLinks as $entry) {
            if (!empty($entry['home'])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if a page has children in the nav tree.
     */
    public static function hasChildren(array $navLinks, string $href): bool
    {
        foreach ($navLinks as $entry) {
            if ($entry['href'] === $href) {
                return !empty($entry['children']);
            }
        }
        return false;
    }

    /**
     * Check if a $navLinks block exists in the file content,
     * regardless of whether it parses successfully.
     *
     * Returns true if the file contains '$navLinks = [' syntax.
     * Use this to distinguish 'no canonical block' from 'malformed block'
     * when parse() returns null.
     */
    public static function hasNavLinksBlock(string $fileContent): bool
    {
        return (bool) preg_match('/^\s*\$navLinks\s*=\s*\[/m', $fileContent);
    }

    /**
     * Remove an entry from the nav tree by href (searches recursively).
     *
     * @param  array       $navLinks  The nav tree
     * @param  string      $href      Href to find and remove
     * @param  array|null  &$removed  The removed entry (output)
     * @return array  Modified nav tree with entry removed
     */
    private static function removeEntry(array $navLinks, string $href, ?array &$removed): array
    {
        $result = [];

        foreach ($navLinks as $entry) {
            if ($entry['href'] === $href && $removed === null) {
                $removed = $entry;
                // Don't add to result (removes it)
                continue;
            }

            // Search children
            if (isset($entry['children']) && is_array($entry['children'])) {
                $entry['children'] = self::removeEntry($entry['children'], $href, $removed);
            }

            $result[] = $entry;
        }

        return $result;
    }

    /**
     * Strip children from a specific entry (when moved under a parent,
     * enforcing depth-1).
     */
    private static function stripChildrenFromEntry(array $navLinks, string $href): array
    {
        foreach ($navLinks as &$entry) {
            if (isset($entry['children'])) {
                foreach ($entry['children'] as &$child) {
                    if ($child['href'] === $href) {
                        unset($child['children']);
                    }
                }
                unset($child);
            }
        }
        unset($entry);

        return $navLinks;
    }

    /**
     * Remove empty 'children' arrays from all entries.
     */
    private static function cleanupEmptyChildren(array $navLinks): array
    {
        foreach ($navLinks as &$entry) {
            if (isset($entry['children']) && empty($entry['children'])) {
                unset($entry['children']);
            }
        }
        unset($entry);

        return $navLinks;
    }

    // ═══════════════════════════════════════════
    //  Legacy nav extraction
    // ═══════════════════════════════════════════

    /**
     * Extract nav links from a legacy (non-canonical) nav.php by scanning
     * <a href="..."> patterns.
     *
     * @param  string $fileContent  Full content of nav.php
     * @return array|null  Extracted navLinks array, or null if no links found
     */
    public static function extractFromLegacyNav(string $fileContent): ?array
    {
        // Strip PHP blocks from a working copy to make the HTML parseable.
        // Legacy navs embed PHP echo blocks inside <a> attributes (e.g., for
        // aria-current). The closing tag breaks any [^>]* regex pattern.
        // Stripping PHP blocks first gives clean HTML for matching.
        $cleanHtml = preg_replace('/<' . '\?(?:php|=).*?\?' . '>/si', '', $fileContent);

        if (!preg_match_all('/<a\b[^>]*\bhref\s*=\s*["\']([^"\']+)["\'][^>]*>(.*?)<\/a>/si', $cleanHtml, $matches)) {
            return null;
        }

        $seen = [];
        $navLinks = [];

        foreach ($matches[1] as $i => $href) {
            // Normalize href
            $href = trim($href);

            // Skip anchors, external links, javascript
            if (str_starts_with($href, '#') ||
                str_starts_with($href, 'http') ||
                str_starts_with($href, 'javascript:')) {
                continue;
            }

            // Extract label from link text (strip any residual HTML and whitespace)
            $label = trim(strip_tags($matches[2][$i]));
            if ($label === '' || strlen($label) > 100) {
                continue; // Skip empty or suspiciously long labels
            }

            // Skip common non-nav links (logo links to /, CTA duplicates)
            // Keep if it is an explicit "Home" label pointing to /
            $isHome = ($href === '/' && strtolower($label) === 'home');
            $isLogoLink = ($href === '/' && !$isHome);

            if ($isLogoLink) {
                continue; // Skip logo links that point to / without "Home" label
            }

            // Dedup after all skip checks so filtered links (logo) do not
            // consume href slots needed later (e.g. mobile Home entry)
            if (isset($seen[$href])) {
                continue;
            }
            $seen[$href] = true;

            $entry = [
                'href'  => $href,
                'label' => $label,
            ];

            if ($isHome) {
                $entry['home'] = true;
            }

            $navLinks[] = $entry;
        }

        return !empty($navLinks) ? $navLinks : null;
    }

    /**
     * Check if a legacy nav.php layout is compatible with auto-normalization.
     *
     * Returns null if compatible, or an error key string if unsupported.
     *
     * @param  string $fileContent  Full content of nav.php
     * @return string|null  Error key or null
     */
    public static function checkLayoutCompatibility(string $fileContent): ?string
    {
        // Count distinct <nav> elements
        $navCount = preg_match_all('/<nav\b/i', $fileContent);

        // Allow up to 2 <nav> elements (desktop + mobile is normal)
        if ($navCount > 2) {
            return 'normalization_unsupported_layout';
        }

        // Check for links split across multiple unrelated regions
        // Heuristic: if there are <a> tags with nav-like hrefs before the first <nav>,
        // that suggests a header-bar split
        $firstNavPos = stripos($fileContent, '<nav');
        if ($firstNavPos !== false) {
            $beforeNav = substr($fileContent, 0, $firstNavPos);
            // Count non-logo, non-CTA <a> tags before <nav>
            // Logo links to "/" are OK, but multiple internal links suggest a split layout
            if (preg_match_all('/<a\b[^>]*href\s*=\s*["\']\/[a-z]/', $beforeNav, $preNavLinks)) {
                if (count($preNavLinks[0]) > 1) {
                    return 'normalization_unsupported_layout';
                }
            }
        }

        // Check for CTA links interleaved inside the primary nav list
        // Heuristic: look for <a> tags with CTA-like classes inside <nav>
        // This is a soft check - DOM parsing would be more precise
        if (preg_match('/<nav\b[^>]*>.*?<\/nav>/si', $fileContent, $navBlock)) {
            $navHtml = $navBlock[0];
            // If a link inside <nav> has a class containing 'cta', 'btn', or 'button',
            // it might be an interleaved CTA
            if (preg_match('/<a\b[^>]*class\s*=\s*["\'][^"\']*\b(cta|btn|button)\b[^"\']*["\'][^>]*>/i', $navHtml)) {
                // Only flag if the CTA is inside the nav list, not outside
                // Check if the CTA link is inside a <ul> or <li>
                if (preg_match('/<li[^>]*>.*?<a\b[^>]*class\s*=\s*["\'][^"\']*\b(cta|btn|button)\b/si', $navHtml)) {
                    return 'normalization_unsupported_layout';
                }
            }
        }

        return null; // Layout is compatible
    }

    /**
     * Normalize a legacy nav.php into canonical form.
     *
     * Handles two legacy patterns:
     * 1. foreach-based ($navItems or similar) — renames variable, adds canonical block
     * 2. Hardcoded <a> tags — replaces nav link lists with foreach loops
     *
     * In both cases, the rendered navigation will use the canonical $navLinks
     * array, so subsequent moves via applyMove() are reflected in the output.
     *
     * @param  string $fileContent  Original nav.php content
     * @param  array  $navLinks     Extracted links from extractFromLegacyNav()
     * @return string|null  Normalized file content, or null if normalization failed
     */
    public static function normalizeFileContent(string $fileContent, array $navLinks): ?string
    {
        $canonicalBlock = self::serialize($navLinks);

        // ── Case 1: File uses foreach with a different variable name ──
        // Look for foreach ($navItems ...) or foreach ($someVar ...) patterns
        if (preg_match('/foreach\s*\(\s*\$(\w+)\s+as\b/', $fileContent, $varMatch)) {
            $oldVar = $varMatch[1];
            if ($oldVar !== 'navLinks') {
                // Rename the variable everywhere in this file
                $normalized = preg_replace(
                    '/\$' . preg_quote($oldVar, '/') . '\b/',
                    '$navLinks',
                    $fileContent
                );

                // Check if the array declaration is in this file
                if (preg_match('/\$' . preg_quote($oldVar, '/') . '\s*=\s*\[/m', $fileContent)) {
                    // The old declaration exists — replaceNavBlock will handle it
                    // after the rename, the declaration is now $navLinks = [...]
                    // Just rebuild with the canonical serialization
                    $result = self::replaceNavBlock($normalized, $canonicalBlock);
                    return $result;
                }

                // Array is defined elsewhere (e.g., header.php) — inject at top
                $normalized = self::injectCanonicalBlock($normalized, $canonicalBlock);
                return $normalized;
            }
        }

        // ── Case 2: Fully hardcoded — replace link lists with foreach loops ──
        $normalized = $fileContent;

        // Inject the $navLinks block at the top of the PHP section
        $normalized = self::injectCanonicalBlock($normalized, $canonicalBlock);

        // Find <ul> blocks containing nav links and replace their <li> children
        // with a foreach loop
        $normalized = self::replaceHardcodedLists($normalized, $navLinks);

        if ($normalized === null) {
            return null;
        }

        // Verify the result is parseable
        $verification = self::parse($normalized);
        if ($verification === null) {
            return null; // Something went wrong
        }

        return $normalized;
    }

    /**
     * Inject a $navLinks block at the top of a nav.php file.
     *
     * If the file starts with a PHP open tag, injects after it.
     * If not, wraps in a PHP block at the very top.
     */
    private static function injectCanonicalBlock(string $content, string $canonicalBlock): string
    {
        // Check if file starts with a PHP open tag
        if (preg_match('/^<\s*\?php\b/m', $content, $m, PREG_OFFSET_CAPTURE)) {
            $tagEnd = $m[0][1] + strlen($m[0][0]);
            // Insert after the opening tag
            return substr($content, 0, $tagEnd) . "\n" . $canonicalBlock . "\n" . substr($content, $tagEnd);
        }

        // No PHP block — add one at the top
        return '<' . "?php\n" . $canonicalBlock . "\n?" . ">\n" . $content;
    }

    /**
     * Replace hardcoded <ul> nav link lists with foreach loops.
     *
     * Identifies <ul> blocks that contain <li><a> patterns matching
     * the extracted nav links, then replaces them with a standardized
     * foreach loop that renders from $navLinks.
     */
    private static function replaceHardcodedLists(string $content, array $navLinks): ?string
    {
        // Build a set of known nav hrefs for matching
        $navHrefs = [];
        foreach ($navLinks as $link) {
            $navHrefs[$link['href']] = true;
        }

        // Find all <ul>...</ul> blocks
        $offset = 0;
        $replacements = [];

        while (preg_match('/<ul\b([^>]*)>(.*?)<\/ul>/si', $content, $ulMatch, PREG_OFFSET_CAPTURE, $offset)) {
            $ulFull   = $ulMatch[0][0];
            $ulAttrs  = $ulMatch[1][0];
            $ulInner  = $ulMatch[2][0];
            $ulStart  = $ulMatch[0][1];

            $offset = $ulStart + strlen($ulFull);

            // Count how many <a href="/..."> in this <ul> match our nav links
            $matchCount = 0;
            $totalLinks = 0;
            if (preg_match_all('/href\s*=\s*["\']([^"\']+)["\']/', $ulInner, $hrefMatches)) {
                foreach ($hrefMatches[1] as $href) {
                    $totalLinks++;
                    if (isset($navHrefs[$href])) {
                        $matchCount++;
                    }
                }
            }

            // Skip if fewer than 2 links match, or if less than half match
            if ($matchCount < 2 || ($totalLinks > 0 && $matchCount / $totalLinks < 0.5)) {
                continue;
            }

            // This <ul> contains nav links — replace its contents with a foreach loop
            $foreachLoop = self::buildForeachLoop();
            $replacement = "<ul{$ulAttrs}>\n{$foreachLoop}\n      </ul>";

            $replacements[] = [
                'start'  => $ulStart,
                'length' => strlen($ulFull),
                'replacement' => $replacement,
            ];
        }

        if (empty($replacements)) {
            // No hardcoded lists found — normalization not possible this way
            return null;
        }

        // Apply replacements in reverse order to preserve offsets
        usort($replacements, fn($a, $b) => $b['start'] - $a['start']);
        foreach ($replacements as $r) {
            $content = substr_replace($content, $r['replacement'], $r['start'], $r['length']);
        }

        return $content;
    }

    /**
     * Build the standardized foreach loop scaffold for nav links.
     */
    private static function buildForeachLoop(): string
    {
        // Use concatenation to avoid PHP tags being parsed in this file
        $open  = '<' . '?php';
        $echo  = '<' . '?=';
        $close = '?' . '>';

        return <<<LOOP
        {$open} foreach (\$navLinks as \$link): {$close}
          {$open} \$isActive = (\$page['slug'] ?? '') === ltrim(\$link['href'], '/'); {$close}
          <li>
            <a href="{$echo} \$link['href'] {$close}"
               {$open} if (\$isActive): {$close}aria-current="page"{$open} endif; {$close}>{$echo} \$link['label'] {$close}</a>
          </li>
        {$open} endforeach; {$close}
LOOP;
    }

    // ═══════════════════════════════════════════
    //  Position utilities
    // ═══════════════════════════════════════════

    /**
     * Find a page's current position in the nav tree.
     *
     * Returns position data with indexes in the movable subset
     * (excluding pinned Home from root counting).
     *
     * @param  array  $navLinks  The nav tree
     * @param  string $pageHref  Href to find
     * @return array|null  { parentHref, index, siblingCount } or null if not found
     */
    public static function findPosition(array $navLinks, string $pageHref): ?array
    {
        $hasHome = self::hasHomeEntry($navLinks);

        // Search root level
        $movableIndex = 0;
        foreach ($navLinks as $i => $entry) {
            // Skip pinned Home from movable counting
            if (!empty($entry['home'])) {
                continue;
            }

            if ($entry['href'] === $pageHref) {
                $movableCount = count($navLinks) - ($hasHome ? 1 : 0);
                return [
                    'parentHref'   => null,
                    'index'        => $movableIndex,
                    'siblingCount' => $movableCount,
                ];
            }
            $movableIndex++;
        }

        // Search children
        foreach ($navLinks as $entry) {
            if (isset($entry['children'])) {
                foreach ($entry['children'] as $ci => $child) {
                    if ($child['href'] === $pageHref) {
                        return [
                            'parentHref'   => $entry['href'],
                            'index'        => $ci,
                            'siblingCount' => count($entry['children']),
                        ];
                    }
                }
            }
        }

        return null; // Not found
    }

    /**
     * Get the movable nav tree (excluding pinned Home entry).
     *
     * @param  array $navLinks  The full nav tree
     * @return array  Nav tree without the Home entry
     */
    public static function getMovableTree(array $navLinks): array
    {
        return array_values(array_filter($navLinks, function ($entry) {
            return empty($entry['home']);
        }));
    }

    /**
     * Check if a page href exists anywhere in the nav tree.
     *
     * @param  array  $navLinks  The nav tree
     * @param  string $pageHref  Href to check
     * @return bool
     */
    public static function isInNav(array $navLinks, string $pageHref): bool
    {
        foreach ($navLinks as $entry) {
            if ($entry['href'] === $pageHref) {
                return true;
            }
            if (isset($entry['children'])) {
                foreach ($entry['children'] as $child) {
                    if ($child['href'] === $pageHref) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Check if an entry is nested (not at root level).
     *
     * @param  array  $navLinks  The nav tree
     * @param  string $href      Href to check
     * @return bool
     */
    public static function isNested(array $navLinks, string $href): bool
    {
        foreach ($navLinks as $entry) {
            if (isset($entry['children'])) {
                foreach ($entry['children'] as $child) {
                    if ($child['href'] === $href) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // ═══════════════════════════════════════════
    //  File content manipulation
    // ═══════════════════════════════════════════

    /**
     * Replace the $navLinks block in a nav.php file with new content.
     *
     * Preserves everything before and after the $navLinks declaration.
     *
     * @param  string $fileContent   Original file content
     * @param  string $newNavBlock   New $navLinks = [...]; block from serialize()
     * @return string|null  Updated file content, or null if block not found
     */
    public static function replaceNavBlock(string $fileContent, string $newNavBlock): ?string
    {
        // Find the $navLinks = [ declaration
        if (!preg_match('/^(\s*)\$navLinks\s*=\s*\[/m', $fileContent, $m, PREG_OFFSET_CAPTURE)) {
            return null;
        }

        $lineStart = $m[0][1];

        // Find the opening bracket
        $bracketPos = strpos($fileContent, '[', $lineStart);
        if ($bracketPos === false) {
            return null;
        }

        // Find the closing bracket
        $arrayStr = self::extractBalancedBrackets($fileContent, $bracketPos);
        if ($arrayStr === null) {
            return null;
        }

        // Find the end of the statement (];)
        $blockEnd = $bracketPos + strlen($arrayStr);

        // Skip trailing semicolon and whitespace
        $afterBlock = $blockEnd;
        $len = strlen($fileContent);
        while ($afterBlock < $len && ctype_space($fileContent[$afterBlock])) {
            $afterBlock++;
        }
        if ($afterBlock < $len && $fileContent[$afterBlock] === ';') {
            $afterBlock++;
        }

        // Build the replacement: content before + new block + content after
        $before = substr($fileContent, 0, $lineStart);
        $after = substr($fileContent, $afterBlock);

        return $before . $newNavBlock . $after;
    }
}
