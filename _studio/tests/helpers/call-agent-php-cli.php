<?php
declare(strict_types=1);

namespace VoxelSite {
    // Keep the simulated host independent of PHP installations on the test machine.
    // Every other file check and every process invocation uses the real filesystem.
    function is_file(string $path): bool
    {
        if (in_array($path, ['/usr/local/bin/php', '/usr/bin/php'], true)) {
            return false;
        }
        return \is_file($path);
    }
}

namespace {
    $root = $argv[1] ?? '';
    $scenario = $argv[2] ?? '';
    define('VoxelSite\PHP_SAPI', $scenario === 'cli-binary' ? 'cli' : 'apache2handler');
    define('VoxelSite\PHP_BINARY', $root . '/web-binary');
    define('VoxelSite\PHP_BINDIR', $root . "/PHP installation's bin");

    // Neither environment variables nor request fields may select a worker binary.
    putenv('PHP_BINARY=' . $root . '/web-binary');
    putenv('PHP_CLI=' . $root . '/web-binary');
    require __DIR__ . '/call-router-prompt.php';
}
