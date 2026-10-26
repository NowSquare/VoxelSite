<?php
declare(strict_types=1);

/** Run unchanged on native Windows, Linux and macOS; no filesystem emulation. */
require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';

function nativeRemoveTree(string $path): void
{
    if (is_link($path)) {
        if (DIRECTORY_SEPARATOR === '\\' && is_dir($path)) rmdir($path);
        else unlink($path);
        return;
    }
    if (is_file($path)) { unlink($path); return; }
    if (!is_dir($path)) return;
    foreach (new DirectoryIterator($path) as $entry) {
        if (!$entry->isDot()) nativeRemoveTree($entry->getPathname());
    }
    rmdir($path);
}

function nativeProcess(string $root, string $phase): string
{
    $process = proc_open([PHP_BINARY, '-d', 'memory_limit=256M', __DIR__ . '/helpers/call-native-filesystem-workflow.php', $root, $phase],
        [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes, $root);
    if (!is_resource($process)) throw new RuntimeException('Cannot start native workflow worker.');
    fclose($pipes[0]);
    $stdout = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $stderr = stream_get_contents($pipes[2]); fclose($pipes[2]);
    $exit = proc_close($process);
    if ($exit !== 0 || $stderr !== '') throw new RuntimeException("$phase failed ($exit):\n$stdout\n$stderr");
    return $stdout;
}

$temporary = realpath(sys_get_temp_dir());
if ($temporary === false) throw new RuntimeException('Temporary directory is unavailable.');
// Spaces expose shell quoting assumptions; child processes use argument arrays.
$root = $temporary . '/vs-native-workflow-' . bin2hex(random_bytes(8)) . ' space';
mkdir($root, 0700);
try {
    VoxelSite\Tests\StudioRuntimeFixture::copy($root);
    file_put_contents($root . '/.native-workflow-fixture', 'disposable');
    foreach (['_studio/data/logs', '_studio/preview', 'assets/data', 'assets/css', 'assets/images'] as $path) {
        if (!is_dir($root . '/' . $path)) mkdir($root . '/' . $path, 0700, true);
    }
    file_put_contents($root . '/assets/data/migration.json', '{"source":"published"}');
    file_put_contents($root . '/assets/data/migration-two.json', '{"second":true}');
    $installed = json_decode(nativeProcess($root, 'install'), true, 64, JSON_THROW_ON_ERROR);
    if (($installed['ok'] ?? false) !== true || empty($installed['migrations']['applied'])) {
        throw new RuntimeException('Fresh installer did not apply migrations: ' . json_encode($installed));
    }
    echo 'PASS Real installer created a temporary owner, database and schema without a provider key' . PHP_EOL;
    echo nativeProcess($root, 'workflow');
    echo 'Native filesystem workflow passed on ' . PHP_OS_FAMILY . ' / PHP ' . PHP_VERSION . PHP_EOL;
} finally {
    // All SQLite handles live in terminated workers, including on Windows.
    nativeRemoveTree($root);
}
