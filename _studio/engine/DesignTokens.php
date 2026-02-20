<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Parse and update CSS custom properties (design tokens).
 *
 * The design token system is the bridge between the AI's decisions
 * and the website's visual identity. When the AI outputs a new
 * style.css, this class reads it. When the context engine needs
 * to tell the AI what the current colors are, this class provides
 * them. When the user asks to "change the primary color," the AI
 * reads the current tokens from context and produces updated ones.
 *
 * All token operations work on the :root block inside style.css.
 * We never modify CSS outside of :root — that's the AI's job.
 */
class DesignTokens
{
    /**
     * Parse all CSS custom properties from a :root block.
     *
     * Extracts every `--property: value;` declaration from the
     * :root selector in a CSS string. Returns them as a flat
     * associative array.
     *
     * @param string $css Full CSS file contents
     * @return array<string, string> Property name => value pairs
     */
    public static function parse(string $css): array
    {
        $tokens = [];

        // Extract the :root block
        $rootBlock = self::extractRootBlock($css);
        if ($rootBlock === null) {
            return $tokens;
        }

        // Match all custom property declarations
        // Handles multi-line values (like font stacks with fallbacks)
        preg_match_all(
            '/\s*(--[\w-]+)\s*:\s*([^;]+);/m',
            $rootBlock,
            $matches,
            PREG_SET_ORDER
        );

        foreach ($matches as $match) {
            $property = trim($match[1]);
            $value = trim($match[2]);
            $tokens[$property] = $value;
        }

        return $tokens;
    }

    /**
     * Extract just the :root block content as a formatted string.
     *
     * This is what gets injected into the AI context — the full
     * :root block so the AI can see every design token at a glance.
     *
     * @param string $css Full CSS file contents
     * @return string The :root { ... } block, or empty string
     */
    public static function extractRootBlock(string $css): ?string
    {
        // Match :root { ... } handling nested braces carefully
        // CSS custom properties don't nest, so we match the first
        // closing brace at the same level
        if (!preg_match('/:root\s*\{([^}]+)\}/s', $css, $match)) {
            return null;
        }

        return $match[1];
    }

    /**
     * Get the :root block as a formatted string for context injection.
     *
     * Returns the full `:root { ... }` including the selector,
     * ready to paste into the context template.
     */
    public static function getRootBlockForContext(string $css): string
    {
        $rootContent = self::extractRootBlock($css);
        if ($rootContent === null) {
            return '(no design tokens found)';
        }

        return ":root {\n{$rootContent}\n}";
    }

    /**
     * Update specific tokens in a CSS string.
     *
     * Replaces the values of specified custom properties within
     * the :root block. Properties not in the $updates array are
     * left unchanged. New properties are appended.
     *
     * @param string               $css     Full CSS file contents
     * @param array<string, string> $updates Property => new value pairs
     * @return string Updated CSS
     */
    public static function update(string $css, array $updates): string
    {
        foreach ($updates as $property => $newValue) {
            // Try to replace existing property
            $pattern = '/(' . preg_quote($property, '/') . '\s*:\s*)([^;]+)(;)/m';

            if (preg_match($pattern, $css)) {
                $css = preg_replace($pattern, '${1}' . $newValue . '${3}', $css, 1);
            } else {
                // Property doesn't exist yet — append to :root block
                $appendLine = '  ' . $property . ': ' . $newValue . ";\n";
                $css = preg_replace(
                    '/(:root\s*\{[^}]*)(}\s*)/s',
                    '${1}' . $appendLine . '${2}',
                    $css,
                    1
                );
            }
        }

        return $css;
    }

    /**
     * Extract color tokens only (for summarized context).
     *
     * When the full CSS is too large for context, we send only
     * the color tokens. This covers 90% of "match my color scheme"
     * requests while keeping token count manageable.
     *
     * @param array<string, string> $tokens Full token array from parse()
     * @return array<string, string> Only color-related tokens
     */
    public static function filterColors(array $tokens): array
    {
        return array_filter($tokens, function (string $value, string $key) {
            return str_starts_with($key, '--color-');
        }, ARRAY_FILTER_USE_BOTH);
    }

    /**
     * Extract typography tokens only.
     *
     * @param array<string, string> $tokens Full token array from parse()
     * @return array<string, string> Only typography-related tokens
     */
    public static function filterTypography(array $tokens): array
    {
        return array_filter($tokens, function (string $value, string $key) {
            return str_starts_with($key, '--font-')
                || str_starts_with($key, '--text-')
                || str_starts_with($key, '--weight-')
                || str_starts_with($key, '--leading-');
        }, ARRAY_FILTER_USE_BOTH);
    }

    /**
     * Format tokens as a readable string for context injection.
     *
     * @param array<string, string> $tokens Token key-value pairs
     * @return string Formatted as CSS custom property declarations
     */
    public static function formatForContext(array $tokens): string
    {
        if (empty($tokens)) {
            return '(no tokens defined)';
        }

        $lines = [];
        $currentCategory = '';

        foreach ($tokens as $property => $value) {
            // Detect category changes for readability
            $parts = explode('-', ltrim($property, '-'));
            $category = $parts[0] ?? '';

            if ($category !== $currentCategory) {
                if (!empty($lines)) {
                    $lines[] = '';
                }
                $currentCategory = $category;
            }

            $lines[] = "  {$property}: {$value};";
        }

        return implode("\n", $lines);
    }
}
