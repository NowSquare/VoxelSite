<?php
declare(strict_types=1);

namespace VoxelSite;

/** Native filesystem spelling, separate from managed relative paths and URLs. */
final class FilesystemPath
{
    public static function normalize(string $path): string
    {
        return DIRECTORY_SEPARATOR === '\\' ? str_replace('\\', '/', $path) : $path;
    }

    public static function realpath(string $path): string|false
    {
        $real = realpath($path);
        return $real === false ? false : self::normalize($real);
    }

    public static function isAbsolute(string $path): bool
    {
        $path = self::normalize($path);
        if (preg_match('/[\x00-\x1f\x7f]/', $path)) return false;
        return DIRECTORY_SEPARATOR === '\\'
            ? preg_match('~\A(?:[A-Za-z]:/|//(?![?.](?:/|$))[^/:]+/[^/:]+(?:/|$))~', $path) === 1
            : str_starts_with($path, '/');
    }

    /** Server configuration only. Future descendants retain a canonical existing parent. */
    public static function trustedRoot(string $path): string
    {
        $path = self::normalize($path);
        if (!self::isAbsolute($path)) throw new \RuntimeException('Workspace roots must be absolute server paths.');
        $path = self::trimRoot($path);
        if (is_link($path)) throw new \RuntimeException('Workspace roots cannot be symlinks.');
        $existing = $path; $suffix = [];
        while (!file_exists($existing)) {
            $part = basename($existing);
            if ($part === '.' || $part === '..' || $part === '') throw new \RuntimeException('Invalid future workspace root.');
            array_unshift($suffix, $part);
            $parent = self::normalize(dirname($existing));
            if ($parent === $existing || !self::isAbsolute($parent)) throw new \RuntimeException('Workspace root has no existing parent.');
            $existing = $parent;
        }
        $real = self::realpath($existing);
        if ($real === false || !is_dir($real)) throw new \RuntimeException('Workspace root is unavailable.');
        return $suffix === [] ? self::trimRoot($real) : rtrim($real, '/') . '/' . implode('/', $suffix);
    }

    public static function assertNoSymlinkAncestors(string $path, string $message): void
    {
        $path = self::trimRoot(self::normalize($path));
        if (!self::isAbsolute($path)) throw new \RuntimeException($message);
        while (true) {
            clearstatcache(true, $path);
            if (is_link($path)) throw new \RuntimeException($message);
            // A UNC share, like a drive or POSIX root, is the filesystem boundary.
            if ($path === '/' || (DIRECTORY_SEPARATOR === '\\'
                && preg_match('~\A(?:[A-Za-z]:/|//[^/]+/[^/]+)\z~', $path))) break;
            $parent = self::normalize(dirname($path));
            if ($parent === $path || !self::isAbsolute($parent)) break;
            $path = $parent;
        }
    }

    /** Lexical boundary comparison only; callers must separately reject symlinks/traversal. */
    public static function contains(string $path, string $root, bool $allowEqual = true): bool
    {
        if (!self::isAbsolute($root) || !self::isAbsolute($path)) return false;
        $path = self::normalize($path);
        $root = self::trimRoot(self::normalize($root));
        return $path === $root ? $allowEqual : str_starts_with($path, rtrim($root, '/') . '/');
    }

    /** Both iterator pathnames and their canonical base must use the same spelling. */
    public static function relative(string $path, string $root): string
    {
        if (!self::contains($path, $root, false)) throw new \RuntimeException('Filesystem path is outside its root.');
        return substr(self::normalize($path), strlen(rtrim(self::normalize($root), '/')) + 1);
    }

    private static function trimRoot(string $path): string
    {
        $path = rtrim($path, '/');
        if ($path === '' || (DIRECTORY_SEPARATOR === '\\' && preg_match('~\A[A-Za-z]:\z~', $path))) $path .= '/';
        return $path;
    }
}
