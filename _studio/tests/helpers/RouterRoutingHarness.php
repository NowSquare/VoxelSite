<?php
declare(strict_types=1);
namespace VoxelSite\Tests;
require_once __DIR__ . '/RouterHeadingFixture.php';

/** Runs production classes in a copied application: no installed settings or site writes. */
final class RouterRoutingHarness
{
    public static function run(array $scenario): array
    {
        $repo = dirname(__DIR__, 3);
        $root = sys_get_temp_dir() . '/voxelsite-routing-' . bin2hex(random_bytes(8));
        mkdir($root, 0700);
        try {
            file_put_contents($root . '/.routing-fixture', 'Disposable routing application');
            foreach (['engine', 'prompts', 'static'] as $directory) {
                RouterHeadingFixture::copyTree($repo . '/_studio/' . $directory, $root . '/_studio/' . $directory);
            }
            $fixture = $repo . '/_studio/tests/fixtures/router-heading/site';
            RouterHeadingFixture::copyTree($fixture, $root . '/_studio/preview');
            RouterHeadingFixture::copyTree($fixture . '/assets', $root . '/assets');
            // Distinctive unrelated-page content proves whether context was actually bounded.
            file_put_contents($root . '/_studio/preview/bakery/index.php', '<main><p>ROUTING_UNRELATED_PAGE_SENTINEL</p></main>');
            mkdir($root . '/vendor');
            file_put_contents($root . '/vendor/autoload.php', '<?php require ' . var_export($repo . '/vendor/autoload.php', true) . ';' . <<<'LOADER'

spl_autoload_register(function ($class) {
    if (str_starts_with($class, 'VoxelSite\\')) {
        $file = dirname(__DIR__) . '/_studio/engine/' . str_replace('\\', '/', substr($class, 10)) . '.php';
        if (is_file($file)) require_once $file;
    }
}, true, true);
LOADER);
            $process = proc_open([PHP_BINARY, __DIR__ . '/run-router-routing.php', $root],
                [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
            if (!is_resource($process)) { throw new \RuntimeException('Cannot start routing fixture'); }
            fwrite($pipes[0], json_encode($scenario, JSON_THROW_ON_ERROR)); fclose($pipes[0]);
            $stdout = stream_get_contents($pipes[1]); $stderr = stream_get_contents($pipes[2]);
            fclose($pipes[1]); fclose($pipes[2]);
            if (proc_close($process) !== 0 || !is_file($root . '/routing-result.json')) {
                throw new \RuntimeException('Routing fixture failed: ' . $stdout . $stderr);
            }
            $report = json_decode(file_get_contents($root . '/routing-result.json'), true, 512, JSON_THROW_ON_ERROR);
            $report['sse'] = $stdout;
            return $report;
        } finally { RouterHeadingFixture::remove($root); }
    }
}
