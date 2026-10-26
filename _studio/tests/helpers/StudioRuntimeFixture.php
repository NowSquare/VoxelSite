<?php
declare(strict_types=1);

namespace VoxelSite\Tests;

/** One complete production runtime for every disposable route/client fixture. */
final class StudioRuntimeFixture
{
    private const PATHS = [
        'vendor',
        '_studio/engine', '_studio/api', '_studio/prompts', '_studio/static', '_studio/worker', '_studio/action-templates',
        '_studio/index.php', '_studio/install.php', '_studio/workspace.php', '_studio/mcp.php',
        '_studio/update-gate.php', '_studio/update-runtime.php',
        '_studio/factory-reset-gate.php', '_studio/factory-reset.php',
        '_studio/agent-capabilities.json', '_studio/mcp-client-qualification.json', '_studio/.htaccess',
        '_studio/data/default-index.php', '_studio/data/default-unpublish-index.php',
        '_studio/data/demo-root-actions-bar.php', 'VERSION',
    ];

    public static function copy(string $projectRoot, ?string $sourceRoot = null): void
    {
        $target = self::canonical($projectRoot);
        $temporary = self::canonical(sys_get_temp_dir());
        $source = self::canonical($sourceRoot ?? dirname(__DIR__, 3));
        if ($target === false || $temporary === false || $source === false
            || !str_starts_with($target, $temporary . '/')
            || $target === $source || str_starts_with($source, $target . '/')
            || is_link($projectRoot) || file_exists($target . '/.git')) {
            throw new \RuntimeException('Runtime fixtures require an existing disposable temporary project root.');
        }
        // A source list deliberately excludes installed data, private history,
        // generated pages and assets. Never copy the installed _studio tree whole.
        foreach (self::PATHS as $path) {
            // Upgrade fixtures intentionally seed an older version; templates may
            // also have been arranged for a reset test before runtime is copied.
            if (($path === 'VERSION' || str_starts_with($path, '_studio/data/'))
                && is_file($target . '/' . $path) && !is_link($target . '/' . $path)) continue;
            self::copyPath($source . '/' . $path, $target . '/' . $path);
        }
    }

    private static function canonical(string $path): string|false
    {
        $real = realpath($path);
        return $real === false ? false : (DIRECTORY_SEPARATOR === '\\' ? str_replace('\\', '/', $real) : $real);
    }

    private static function copyPath(string $source, string $target): void
    {
        if (is_link($source) || is_link($target)) {
            throw new \RuntimeException('Runtime fixture copies refuse symbolic links.');
        }
        $parent = dirname($target);
        if (is_link($parent)) throw new \RuntimeException('Runtime fixture parent cannot be a link.');
        if (!is_dir($parent) && !mkdir($parent, 0700, true)) {
            throw new \RuntimeException('Cannot create runtime fixture directory.');
        }
        if (is_dir($source)) {
            if (!is_dir($target) && !mkdir($target, 0700)) throw new \RuntimeException('Cannot create runtime fixture directory.');
            foreach (new \DirectoryIterator($source) as $entry) {
                if (!$entry->isDot()) self::copyPath($entry->getPathname(), $target . '/' . $entry->getFilename());
            }
        } elseif (!is_file($source) || !copy($source, $target)) {
            throw new \RuntimeException('Cannot copy required runtime fixture source: ' . $source);
        }
    }
}
