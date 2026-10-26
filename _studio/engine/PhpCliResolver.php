<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Locate a PHP CLI for detached workers using trusted installation paths.
 */
final class PhpCliResolver
{
    /** The current detached worker launcher uses POSIX shell process control. */
    public static function supportsDetachedWorkers(): bool
    {
        return PHP_OS_FAMILY !== 'Windows';
    }

    public static function resolve(): ?string
    {
        if (!function_exists('exec')) {
            return null;
        }

        $candidates = [];
        // Under Apache/FPM, PHP_BINARY may name the web server or FPM binary.
        if (PHP_SAPI === 'cli' && PHP_BINARY !== '') {
            $candidates[] = PHP_BINARY;
        }
        if (PHP_BINDIR !== '') {
            $candidates[] = rtrim(PHP_BINDIR, '/\\') . '/php';
        }
        $candidates[] = '/usr/local/bin/php';
        $candidates[] = '/usr/bin/php';

        foreach (array_unique($candidates) as $candidate) {
            // Suppress open_basedir warnings for conventional paths unavailable
            // on shared hosts. A candidate must pass an actual CLI probe.
            if (!@is_file($candidate) || !@is_executable($candidate)) {
                continue;
            }

            $output = [];
            $exitCode = 1;
            exec(
                escapeshellarg($candidate) . ' -r ' . escapeshellarg('echo PHP_SAPI;') . ' 2>/dev/null',
                $output,
                $exitCode
            );
            if ($exitCode === 0 && implode("\n", $output) === 'cli') {
                return $candidate;
            }
        }

        return null;
    }
}
