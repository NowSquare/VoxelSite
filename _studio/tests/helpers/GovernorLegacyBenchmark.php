<?php

declare(strict_types=1);

namespace VoxelSite\Tests;

require_once __DIR__ . '/GovernorHeadingFixture.php';

final class GovernorLegacyBenchmark
{
    public static function run(string $action): array
    {
        $repo = dirname(__DIR__, 3);
        $root = sys_get_temp_dir() . '/voxelsite-legacy-' . bin2hex(random_bytes(8));
        mkdir($root, 0700);
        try {
            file_put_contents($root . '/.governor-fixture', 'Disposable test application');
            GovernorHeadingFixture::copyTree($repo . '/_studio/engine', $root . '/_studio/engine');
            GovernorHeadingFixture::copyTree($repo . '/_studio/prompts', $root . '/_studio/prompts');
            GovernorHeadingFixture::copyTree($repo . '/_studio/static', $root . '/_studio/static');
            GovernorHeadingFixture::copyTree($repo . '/_studio/tests/fixtures/governor-heading/site', $root . '/_studio/preview');
            GovernorHeadingFixture::copyTree($repo . '/_studio/tests/fixtures/governor-heading/site/assets', $root . '/assets');
            mkdir($root . '/vendor');
            $autoload = '<?php require ' . var_export($repo . '/vendor/autoload.php', true) . ';' . <<<'PHP'

spl_autoload_register(function ($class) {
    if (str_starts_with($class, 'VoxelSite\\')) {
        $file = dirname(__DIR__) . '/_studio/engine/' . str_replace('\\', '/', substr($class, 10)) . '.php';
        if (is_file($file)) require_once $file;
    }
}, true, true);
PHP;
            file_put_contents($root . '/vendor/autoload.php', $autoload);
            $pipes = [];
            $process = proc_open([PHP_BINARY, __DIR__ . '/run-governor-legacy.php', $root, $action],
                [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
            if (!is_resource($process)) {
                throw new \RuntimeException('Cannot start disposable legacy benchmark');
            }
            fclose($pipes[0]);
            $stdout = stream_get_contents($pipes[1]);
            $stderr = stream_get_contents($pipes[2]);
            fclose($pipes[1]);
            fclose($pipes[2]);
            if (proc_close($process) !== 0 || !is_file($root . '/legacy-result.json')) {
                throw new \RuntimeException('Legacy fixture failed: ' . $stdout . $stderr);
            }
            return json_decode(file_get_contents($root . '/legacy-result.json'), true, 512, JSON_THROW_ON_ERROR);
        } finally {
            GovernorHeadingFixture::remove($root);
        }
    }
}
