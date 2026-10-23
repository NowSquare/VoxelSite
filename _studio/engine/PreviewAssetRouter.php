<?php
declare(strict_types=1);

namespace VoxelSite;

/** Keep preview dependencies behind the same authenticated route as the page. */
final class PreviewAssetRouter
{
    public const BASE = '/_studio/api/router.php?_path=%2Fpreview&path=';

    public static function url(string $reference, string $source = 'index.php', bool $page = false, string $base = self::BASE): string
    {
        $reference = html_entity_decode($reference, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        if ($reference === '' || $reference[0] === '#' || str_starts_with($reference, '//')
            || preg_match('~^[a-z][a-z0-9+.-]*:~i', $reference)) {
            return $reference;
        }
        $parts = parse_url($reference);
        if ($parts === false) return $reference;
        $path = rawurldecode($parts['path'] ?? '');
        if ($path === '') return $reference;
        if (preg_match('/[\x00-\x1f\x7f\\\\]/', $path)) throw new \RuntimeException('Invalid preview dependency path.');
        // Studio endpoints, including another installation, are never draft files.
        if (preg_match('~(?:^|/)_studio(?:/|$)~', $path)) return $reference;
        $prefix = rawurldecode(self::installationPrefix($base));
        if ($prefix !== '' && ($path === $prefix || str_starts_with($path, $prefix . '/'))) {
            $path = substr($path, strlen($prefix)) ?: '/';
        }
        $relative = str_starts_with($path, '/') ? ltrim($path, '/')
            : (dirname($source) === '.' ? '' : dirname($source) . '/') . $path;
        $segments = [];
        foreach (explode('/', $relative) as $segment) {
            if ($segment === '' || $segment === '.') continue;
            if ($segment === '..') {
                if ($segments === []) throw new \RuntimeException('Preview dependency escapes the website.');
                array_pop($segments);
            } else {
                $segments[] = $segment;
            }
        }
        $relative = implode('/', $segments);
        if ($page && ($relative === '' || pathinfo($relative, PATHINFO_EXTENSION) === '')) {
            $relative = $relative === '' ? 'index.php' : rtrim($relative, '/') . '.php';
        }
        if ($relative === '') return $reference;
        SiteWorkspace::normalizeRelative($relative);
        // Keep slashes readable. This also preserves generated JS expressions
        // which concatenate a filename onto a literal "/assets/icons/" prefix.
        $encoded = str_replace('%2F', '/', rawurlencode($relative));
        if (!$page && str_ends_with($path, '/')) $encoded .= '/';
        $query = self::siteQuery($parts['query'] ?? '');
        return $base . $encoded
            . ($query !== '' ? '&' . $query : '')
            . (isset($parts['fragment']) ? '#' . $parts['fragment'] : '');
    }

    /** The transport is supplied by the server, never by authored website URLs. */
    public static function installationPrefix(string $base): string
    {
        $parts = parse_url($base);
        $path = is_array($parts) ? ($parts['path'] ?? '') : '';
        if (!is_array($parts) || isset($parts['scheme']) || isset($parts['host'])
            || !preg_match('~^(/.*)?/_studio/api/(?:router|mcp/preview)\.php$~D', $path, $match)
            || InstallationUrl::studioPath($path) !== ($match[1] ?? '') . '/_studio') {
            throw new \InvalidArgumentException('Preview routes must use a trusted local Studio endpoint.');
        }
        return $match[1] ?? '';
    }

    public static function runtimeRoutes(string $base): array
    {
        $prefix = self::installationPrefix($base);
        if (str_contains((string)parse_url($base, PHP_URL_PATH), '/api/mcp/preview.php')) {
            $endpoint = $prefix . '/_studio/api/mcp/preview.php';
            return ['validation_url'=>$endpoint.'?view=validate', 'manifest_url'=>$endpoint.'?view=manifest'];
        }
        $endpoint = $prefix . '/_studio/api/router.php';
        return ['validation_url'=>$endpoint.'?_path=%2Fpreview%2Fvalidate', 'manifest_url'=>$endpoint.'?_path=%2Fpreview&view=manifest'];
    }

    private static function siteQuery(string $query): string
    {
        return implode('&', array_values(array_filter(explode('&', $query), static function (string $part): bool {
            $key = urldecode(explode('=', $part, 2)[0]);
            $key = str_replace([' ', '.'], '_', explode('[', $key, 2)[0]);
            return $part !== '' && !in_array($key, ['path', 'view', '_path'], true);
        })));
    }

    public static function rewrite(string $content, string $source, string $extension, string $base = self::BASE): string
    {
        $extension = strtolower($extension);
        if (in_array($extension, ['php', 'html', 'htm'], true)) {
            // Only inspect real tag attributes and language bodies. Tailwind
            // arbitrary values and JavaScript strings are not HTML attributes.
            return preg_replace_callback(
                '~<!--.*?-->|<(script|style)\b([^>]*)>(.*?)</\1\s*>|<(?:[^>"\']|"[^"]*"|\'[^\']*\')+>~is',
                static function (array $match) use ($source, $base): string {
                    if (str_starts_with($match[0], '<!--')) return $match[0];
                    if (($match[1] ?? '') !== '') {
                        $tag = strtolower($match[1]);
                        return self::htmlTag('<' . $match[1] . $match[2] . '>', $source, $base)
                            . self::rewrite($match[3], $source, $tag === 'style' ? 'css' : 'js', $base)
                            . '</' . $match[1] . '>';
                    }
                    return self::htmlTag($match[0], $source, $base);
                }, $content) ?? $content;
        }
        if (in_array($extension, ['css'], true)) {
            $content = preg_replace_callback('~url\(\s*(["\']?)([^)"\']+)\1\s*\)~i',
                static fn(array $m): string => 'url("' . self::url(trim($m[2]), $source, false, $base) . '")', $content) ?? $content;
            $content = preg_replace_callback('~(@import\s+)(["\'])([^"\']+)\2~i',
                static fn(array $m): string => $m[1] . $m[2] . self::url($m[3], $source, false, $base) . $m[2], $content) ?? $content;
        }
        if (in_array($extension, ['js', 'mjs'], true)) {
            $content = preg_replace_callback('~(["\'`])(/assets/[^"\'`\r\n]*)\1~',
                static fn(array $m): string => $m[1] . self::scriptUrl($m[2], $m[1], $source, $base) . $m[1], $content) ?? $content;
            if (in_array($extension, ['js', 'mjs'], true)) {
                $content = preg_replace_callback('~(\b(?:from|import)\s*|\b(?:fetch|import)\s*\(\s*)(["\'])(\.{1,2}/[^"\']+)\2~',
                    static fn(array $m): string => $m[1] . $m[2] . self::url($m[3], $source, false, $base) . $m[2], $content) ?? $content;
            }
        }
        return $content;
    }

    private static function htmlTag(string $tag, string $source, string $base): string
    {
        return preg_replace_callback(
            '~\b(src|href|poster|action|srcset|style)\s*=\s*(?:(["\'])(.*?)\2|([^\s"\'=<>`]+))~is',
            static function (array $match) use ($source, $base): string {
                $name = strtolower($match[1]);
                $value = html_entity_decode(($match[2] ?? '') !== '' ? $match[3] : $match[4], ENT_QUOTES | ENT_HTML5, 'UTF-8');
                if ($name === 'style') {
                    $value = self::rewrite($value, $source, 'css', $base);
                } elseif ($name === 'srcset') {
                    if (str_contains($value, 'data:')) return $match[0];
                    $items = array_map(static function (string $item) use ($source, $base): string {
                        $parts = preg_split('/\s+/', trim($item), 2);
                        return self::url($parts[0], $source, false, $base) . (isset($parts[1]) ? ' ' . $parts[1] : '');
                    }, explode(',', $value));
                    $value = implode(', ', $items);
                } else {
                    $value = self::url($value, $source, in_array($name, ['href', 'action'], true), $base);
                }
                return $match[1] . '="' . htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8') . '"';
            }, $tag) ?? $tag;
    }

    private static function scriptUrl(string $reference, string $quote, string $source, string $base): string
    {
        if ($quote === '`' && ($expression = strpos($reference, '${')) !== false) {
            // Route the literal prefix while preserving executable interpolation.
            // Encoding the complete template would turn ${name} into a filename.
            return self::url(substr($reference, 0, $expression), $source, false, $base) . substr($reference, $expression);
        }
        return self::url($reference, $source, false, $base);
    }

}
