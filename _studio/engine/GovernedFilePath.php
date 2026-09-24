<?php

declare(strict_types=1);

namespace VoxelSite;

use RuntimeException;

/** Read-only path resolution for the narrow governed PHP heading contract. */
final class GovernedFilePath
{
    public static function resolve(string $previewRoot, string $relativePath): string
    {
        $base = realpath($previewRoot);
        if ($base === false || !is_dir($base) || !str_ends_with($relativePath, '.php')) {
            throw new RuntimeException('invalid_target');
        }
        $path = $base;
        foreach (explode('/', $relativePath) as $segment) {
            if (!preg_match('/\A[a-zA-Z0-9_-][a-zA-Z0-9_.-]*\z/D', $segment)) {
                throw new RuntimeException('invalid_target');
            }
            $path .= '/' . $segment;
            clearstatcache(true, $path);
            if (is_link($path)) {
                throw new RuntimeException('invalid_target');
            }
        }
        $real = realpath($path);
        if ($real === false || !str_starts_with($real, rtrim($base, '/') . '/') || !is_file($real)) {
            throw new RuntimeException('invalid_target');
        }
        return $real;
    }
}
