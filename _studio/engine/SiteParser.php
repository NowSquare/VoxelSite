<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Extract structural HTML elements from pages.
 *
 * The AI needs to see the current navigation and footer HTML
 * so it can replicate them exactly on every page. This class
 * extracts those elements from PHP/HTML files efficiently.
 *
 * Why not use DOMDocument? It's slow, mangles whitespace, and
 * "corrects" HTML in ways that change the output. Regex on known
 * patterns is faster and preserves the exact formatting the AI
 * produced — which is critical for consistency checks.
 */
class SiteParser
{
    /**
     * Extract the <nav> or <header> block from a PHP/HTML file.
     *
     * Looks for the first <header> element (which typically contains
     * the <nav>). Falls back to a standalone <nav> if no <header>.
     * Returns the complete HTML including the outer tag.
     */
    public static function extractNavigation(string $html): ?string
    {
        // Try <header>...</header> first (most common pattern)
        if (preg_match('/<header[^>]*>.*?<\/header>/si', $html, $match)) {
            return trim($match[0]);
        }

        // Fall back to standalone <nav>...</nav>
        if (preg_match('/<nav[^>]*>.*?<\/nav>/si', $html, $match)) {
            return trim($match[0]);
        }

        return null;
    }

    /**
     * Extract the <footer> block from a PHP/HTML file.
     *
     * Returns the complete <footer>...</footer> HTML.
     * Uses a greedy match to handle nested elements within footer.
     */
    public static function extractFooter(string $html): ?string
    {
        // Match the last <footer> in the document (there should only
        // be one, but if there are multiple, the last is the site footer)
        if (preg_match('/<footer[^>]*>.*<\/footer>/si', $html, $match)) {
            return trim($match[0]);
        }

        return null;
    }

    /**
     * Extract the <title> text from a PHP/HTML file.
     */
    public static function extractTitle(string $html): ?string
    {
        if (preg_match('/<title>([^<]+)<\/title>/i', $html, $match)) {
            return trim(html_entity_decode($match[1], ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        }

        return null;
    }

    /**
     * Extract the meta description from a PHP/HTML file.
     */
    public static function extractMetaDescription(string $html): ?string
    {
        if (preg_match('/<meta\s+name="description"\s+content="([^"]*)"[^>]*>/i', $html, $match)) {
            return trim($match[1]);
        }

        // Also try the reversed attribute order
        if (preg_match('/<meta\s+content="([^"]*)"\s+name="description"[^>]*>/i', $html, $match)) {
            return trim($match[1]);
        }

        return null;
    }

    /**
     * Extract all <section> elements with their IDs and classes.
     *
     * Useful for understanding page structure without reading
     * the full HTML. Returns a lightweight summary.
     *
     * @return array<int, array{tag: string, id: ?string, class: ?string, heading: ?string}>
     */
    public static function extractSections(string $html): array
    {
        $sections = [];

        // Match opening tags of structural elements
        preg_match_all(
            '/<(section|article|aside)[^>]*>/i',
            $html,
            $tagMatches,
            PREG_SET_ORDER | PREG_OFFSET_CAPTURE
        );

        foreach ($tagMatches as $tagMatch) {
            $tag = strtolower($tagMatch[1][0]);
            $fullTag = $tagMatch[0][0];

            // Extract id attribute
            $id = null;
            if (preg_match('/\bid="([^"]+)"/', $fullTag, $idMatch)) {
                $id = $idMatch[1];
            }

            // Extract class attribute
            $class = null;
            if (preg_match('/\bclass="([^"]+)"/', $fullTag, $classMatch)) {
                $class = $classMatch[1];
            }

            // Try to find the first heading inside this section
            $offset = $tagMatch[0][1];
            $remaining = substr($html, $offset, 2000); // Look ahead 2KB
            $heading = null;
            if (preg_match('/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i', $remaining, $headingMatch)) {
                $heading = trim($headingMatch[1]);
            }

            $sections[] = [
                'tag'     => $tag,
                'id'      => $id,
                'class'   => $class,
                'heading' => $heading,
            ];
        }

        return $sections;
    }

    /**
     * Count structural statistics about an HTML page.
     *
     * Quick overview without parsing the full DOM.
     *
     * @return array{sections: int, images: int, links: int, headings: array<string, int>}
     */
    public static function getPageStats(string $html): array
    {
        return [
            'sections' => preg_match_all('/<section[^>]*>/i', $html),
            'images'   => preg_match_all('/<img[^>]*>/i', $html),
            'links'    => preg_match_all('/<a\s[^>]*href/i', $html),
            'headings' => [
                'h1' => preg_match_all('/<h1[^>]*>/i', $html),
                'h2' => preg_match_all('/<h2[^>]*>/i', $html),
                'h3' => preg_match_all('/<h3[^>]*>/i', $html),
            ],
        ];
    }
}
