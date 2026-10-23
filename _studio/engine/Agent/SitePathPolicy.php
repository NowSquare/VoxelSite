<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

/** Application paths only. This is not a sandbox for the PHP being authored. */
final class SitePathPolicy
{
    private const RESERVED = ['submit.php', 'mcp.php', 'actions-submit.php', 'actions-handler.php',
        'action-handler.php', 'router.php', 'install.php', 'config.php', 'localvaletdriver.php'];

    public static function canonical(string $relative, bool $write = false): string
    {
        if ($relative === '' || strlen($relative) > 240 || count(explode('/', $relative)) > 10
            || !preg_match('~\A[A-Za-z0-9_-][A-Za-z0-9_.-]*(?:/[A-Za-z0-9_-][A-Za-z0-9_.-]*)*\z~D', $relative)) {
            self::invalid();
        }
        foreach (explode('/', $relative) as $segment) {
            if (strlen($segment) > 80 || str_ends_with($segment, '.') || str_contains($segment, '..')) self::invalid();
        }
        $kind = self::type($relative);
        if ($kind === null || ($write && in_array($kind, ['immutable', 'derived', 'seo'], true))) self::invalid();
        return $relative;
    }

    public static function type(string $relative): ?string
    {
        $lower = strtolower($relative);
        if (in_array($lower, self::RESERVED, true)) return null;
        if ($relative === 'assets/css/tailwind.css') return 'derived';
        if (preg_match('~^assets/(library|icons)/[A-Za-z0-9_./-]+\.(?:avif|webp|jpe?g|png|gif|svg)$~D', $relative)) return 'immutable';
        if (preg_match('~^assets/(css|js|data|forms)/[A-Za-z0-9_./-]+\.(css|js|mjs|json)$~D', $relative, $m)) {
            $types = ['css' => ['css'], 'js' => ['js','mjs'], 'data' => ['json'], 'forms' => ['json']];
            return in_array($m[2], $types[$m[1]], true) ? $m[1] : null;
        }
        if (preg_match('~^assets/(images|files|fonts|media)/[A-Za-z0-9_./-]+\.(?:avif|webp|jpe?g|png|gif|svg|ico|pdf|txt|md|csv|docx?|xlsx?|woff2?|ttf|otf|mp4|webm|mp3|ogg|wav)$~D', $relative)) return 'binary';
        if (in_array($relative, ['_root/robots.txt', '_root/llms.txt'], true)) return 'seo';
        if (preg_match('~^_partials/[A-Za-z0-9_./-]+\.php$~D', $relative)) return 'partial';
        if (preg_match('~^[A-Za-z0-9][A-Za-z0-9_/-]*\.php$~D', $relative)
            && !preg_match('~^(assets|vendor|config|storage|node_modules|api|actions|i18n|data|dist)/~i', $relative)) return 'page';
        return null;
    }

    /** Resolve existing and future children without following any child symlink. */
    public static function assertContained(string $root, string $relative): string
    {
        self::canonical($relative);
        $base = realpath($root);
        if ($base === false || !is_dir($base)) self::invalid();
        $path = $base;
        $parts = explode('/', $relative);
        foreach ($parts as $index => $part) {
            $path .= '/' . $part;
            clearstatcache(true, $path);
            if (is_link($path) || (file_exists($path) && $index < count($parts) - 1 && !is_dir($path))) self::invalid();
            $real = realpath($path);
            if ($real !== false && !str_starts_with($real, $base . '/')) self::invalid();
        }
        return $path;
    }

    public static function isMergeOnly(string $path): bool
    {
        return in_array($path, ['assets/data/memory.json','assets/data/design-intelligence.json'], true);
    }

    private static function invalid(): never
    {
        throw new OperationException('invalid_path', 'Use a canonical managed site path. Studio internals, shipped handlers, symlinks and generated files are outside this operation.');
    }
}
