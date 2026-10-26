<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/static/update-runtime-core.php';
require_once dirname(__DIR__) . '/static/factory-reset-runtime.php';
use VoxelSite\UpdateRuntime\Runtime;

function recoveryCheck(bool $condition, string $message): void
{ if (!$condition) throw new RuntimeException($message); }
function recoveryRejects(callable $call): void
{
    try { $call(); } catch (VoxelSite\UpdateRuntime\Failure|VoxelSiteFactoryResetFailure $error) {
        recoveryCheck($error->errorCode === 'invalid_path', 'Unexpected path error'); return;
    }
    throw new RuntimeException('Unsafe path was accepted');
}
$native = static fn(string $path): string => DIRECTORY_SEPARATOR === '\\' ? str_replace('\\', '/', $path) : $path;
$root = $native(realpath(sys_get_temp_dir())) . '/vs-standalone-recovery-' . bin2hex(random_bytes(8));
mkdir($root . '/site/_studio/data/updates', 0700, true);
$site = $root . '/site';$studio = $site . '/_studio';$database = $studio . '/data/studio.db';
$pdo = new PDO('sqlite:' . $database);$pdo = null;
try {
    $update = new Runtime($site, $studio . '/data/updates', $database, $studio . '/data/site-mutation.lock');
    $factory = new VoxelSiteFactoryResetRuntime($studio, $site);
    Runtime::write($site, 'nested/file.txt', 'first');
    Runtime::write($site, 'nested/file.txt', 'replacement');
    recoveryCheck(Runtime::bytes($site, 'nested/file.txt') === 'replacement', 'Update replacement verified');
    VoxelSiteFactoryResetRuntime::write($studio, 'data/recovery/nested.json', '{}');
    recoveryCheck(VoxelSiteFactoryResetRuntime::readOptional($studio . '/data/recovery/nested.json') === '{}', 'Factory write verified');
    $entries = 0;
    recoveryCheck(VoxelSiteFactoryResetRuntime::paths($studio, 'data/recovery', $entries) === ['data/recovery/nested.json'], 'Relative inventory verified');
    foreach ([Runtime::class, VoxelSiteFactoryResetRuntime::class] as $runtime) {
        foreach (['../escape', '/escape', 'nested\\escape', 'C:escape'] as $path) recoveryRejects(fn() => $runtime::path($site, $path));
    }
    if (DIRECTORY_SEPARATOR === '\\') {
        recoveryCheck(Runtime::path(str_replace('/', '\\', $site), 'nested/file.txt') === $site . '/nested/file.txt', 'Native Windows spelling verified');
        foreach ([Runtime::class, VoxelSiteFactoryResetRuntime::class] as $runtime) {
            foreach (['nested/file.txt.', 'nul.txt'] as $path) recoveryRejects(fn() => $runtime::path($site, $path));
        }
    }
    // Replaced ancestors must fail even when the link targets the original directory.
    $update = null;$factory = null;
    rename($site, $root . '/original');
    if (@symlink($root . '/original', $site)) {
        foreach ([Runtime::class, VoxelSiteFactoryResetRuntime::class] as $runtime) recoveryRejects(fn() => $runtime::path($studio, 'data/new.json'));
        if (DIRECTORY_SEPARATOR === '\\') rmdir($site);
        else unlink($site);
    } else {
        echo "SKIP native symlink checks: this host does not permit symlink creation\n";
    }
    rename($root . '/original', $site);
    echo 'PASS standalone recovery native paths and I/O on ' . PHP_OS_FAMILY . "\n";
} finally {
    unset($update, $factory, $pdo);
    $remove = static function(string $path) use (&$remove): void {
        if (is_link($path)) {
            if (DIRECTORY_SEPARATOR === '\\' && is_dir($path)) rmdir($path);
            else unlink($path);
            return;
        }
        if (is_file($path)) { unlink($path); return; }
        if (!is_dir($path)) return;
        foreach (new DirectoryIterator($path) as $entry) if (!$entry->isDot()) $remove($entry->getPathname());
        rmdir($path);
    };
    $remove($root);
}
