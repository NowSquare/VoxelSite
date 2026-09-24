<?php

declare(strict_types=1);

namespace VoxelSite\Tests;

require_once __DIR__ . '/RouterHeadingFixture.php';

final class RouterLegacyBenchmark
{
    // Exact derived paths, never directories. Existing customer files are protected
    // except the compiler-owned Tailwind output, which the legacy path rebuilds.
    private const DERIVED_OUTPUTS = [
        'preview/_partials/schema.php' => 'create',
        'public/_partials/schema.php' => 'create',
        'public/llms.txt' => 'create',
        'public/robots.txt' => 'create',
        'public/sitemap.xml' => 'create',
        'public/mcp.php' => 'create',
        'assets/js/icon-resolver.js' => 'create',
        'assets/js/navigation.js' => 'create',
        'assets/css/tailwind.css' => 'rebuild',
    ];

    public static function siteSnapshot(string $root): array
    {
        $files = [];
        foreach (['preview' => '/_studio/preview', 'assets' => '/assets'] as $prefix => $directory) {
            foreach (RouterHeadingFixture::snapshot($root . $directory) as $path => $hash) {
                $files[$prefix . '/' . $path] = $hash;
            }
        }
        // Public output is separate from preview and shared assets. Exclude only
        // the disposable app/runtime, dependency loader, and fixture marker.
        foreach (scandir($root) as $name) {
            if (in_array($name, ['.', '..', '_studio', 'vendor', 'assets', '.governor-fixture'], true)) { continue; }
            $path = $root . '/' . $name;
            if (is_dir($path)) {
                foreach (RouterHeadingFixture::snapshot($path) as $relative => $hash) {
                    $files['public/' . $name . '/' . $relative] = $hash;
                }
            } else {
                $files['public/' . $name] = hash_file('sha256', $path);
            }
        }
        ksort($files);
        return $files;
    }

    public static function classifyChanges(array $before, array $after): array
    {
        $changes = ['target' => [], 'derived' => [], 'unexpected' => []];
        $paths = array_unique(array_merge(array_keys($before), array_keys($after)));
        sort($paths);
        foreach ($paths as $path) {
            $old = $before[$path] ?? null;
            $new = $after[$path] ?? null;
            if ($old === $new) { continue; }
            $change = $old === null ? 'created' : ($new === null ? 'deleted' : 'modified');
            $rule = self::DERIVED_OUTPUTS[$path] ?? null;
            $bucket = 'unexpected';
            if ($path === 'preview/index.php') {
                $bucket = 'target';
            } elseif (($rule === 'create' && $old === null && $new !== null)
                || ($rule === 'rebuild' && $new !== null)) {
                $bucket = 'derived';
            }
            $changes[$bucket][$path] = ['change' => $change, 'before_sha256' => $old, 'after_sha256' => $new];
            if ($bucket === 'derived') { $changes[$bucket][$path]['allowed_rule'] = $rule; }
        }
        return $changes;
    }

    public static function run(string $action, string $fault = '', array $settings = [], array $scenario = []): array
    {
        $repo = dirname(__DIR__, 3);
        $root = sys_get_temp_dir() . '/voxelsite-legacy-' . bin2hex(random_bytes(8));
        mkdir($root, 0700);
        try {
            file_put_contents($root . '/.governor-fixture', 'Disposable test application');
            RouterHeadingFixture::copyTree($repo . '/_studio/engine', $root . '/_studio/engine');
            RouterHeadingFixture::copyTree($repo . '/_studio/prompts', $root . '/_studio/prompts');
            RouterHeadingFixture::copyTree($repo . '/_studio/static', $root . '/_studio/static');
            RouterHeadingFixture::copyTree($repo . '/_studio/tests/fixtures/router-heading/site', $root . '/_studio/preview');
            RouterHeadingFixture::copyTree($repo . '/_studio/tests/fixtures/router-heading/site/assets', $root . '/assets');
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
            $runner = 'run-router-legacy.php';
            $process = proc_open([PHP_BINARY, __DIR__ . '/' . $runner, $root, $action, $fault],
                [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
            if (!is_resource($process)) {
                throw new \RuntimeException('Cannot start disposable legacy benchmark');
            }
            fwrite($pipes[0], json_encode(['settings' => $settings, 'scenario' => $scenario], JSON_THROW_ON_ERROR));
            fclose($pipes[0]);
            $stdout = stream_get_contents($pipes[1]);
            $stderr = stream_get_contents($pipes[2]);
            fclose($pipes[1]);
            fclose($pipes[2]);
            if (proc_close($process) !== 0 || !is_file($root . '/legacy-result.json')) {
                throw new \RuntimeException('Legacy fixture failed: ' . $stdout . $stderr);
            }
            $report = json_decode(file_get_contents($root . '/legacy-result.json'), true, 512, JSON_THROW_ON_ERROR);
            $report['sse'] = $stdout;
            return $report;
        } finally {
            RouterHeadingFixture::remove($root);
        }
    }
}
