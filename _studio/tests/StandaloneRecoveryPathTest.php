<?php
declare(strict_types=1);

// Exercise the actual standalone source with isolated Windows filesystem semantics.
// This covers spelling and boundaries, not native Windows I/O qualification.
namespace VoxelSite\Tests\WindowsRecovery;
const DIRECTORY_SEPARATOR = '\\';
use RuntimeException;
use InvalidArgumentException;
use Throwable;
use Closure;
use PDO;
use DirectoryIterator;
final class Filesystem
{
    public static array $links = [];
    public static int $probes = 0;
    public static function key(string $path): string { return str_replace('\\', '/', $path); }
}
function realpath(string $path): string|false
{
    $path = Filesystem::key($path);
    return in_array($path, ['C:/', 'C:/site', 'C:/site/_studio', 'C:/site/_studio/data',
        '//server/share', '//server/share/site'], true) ? str_replace('/', '\\', $path) : false;
}
function is_link(string $path): bool
{
    if (++Filesystem::$probes > 500) throw new RuntimeException('Unbounded ancestor traversal.');
    return isset(Filesystem::$links[Filesystem::key($path)]);
}
function file_exists(string $path): bool { return realpath($path) !== false; }
function is_dir(string $path): bool { return file_exists($path); }
function dirname(string $path): string
{
    $path = Filesystem::key($path);
    if (preg_match('~^[A-Za-z]:/$~D', $path)) return $path;
    $parent = \dirname($path);
    return preg_match('~^[A-Za-z]:$~D', $parent) ? $parent . '/' : $parent;
}
function check(bool $condition, string $label): void
{ if (!$condition) throw new RuntimeException($label); }
function rejects(callable $call, string $label): void
{
    try { $call(); } catch (Failure|VoxelSiteFactoryResetFailure $error) {
        check($error->errorCode === 'invalid_path', $label); return;
    }
    throw new RuntimeException($label);
}
$studio = \dirname(__DIR__);
$core = file_get_contents($studio . '/static/update-runtime-core.php');
$core = str_replace('namespace VoxelSite\\UpdateRuntime;', 'namespace ' . __NAMESPACE__ . ';', $core);
eval(substr($core, 5));
$factory = file_get_contents($studio . '/static/factory-reset-runtime.php');
$factory = str_replace('declare(strict_types=1);', 'declare(strict_types=1); namespace ' . __NAMESPACE__
    . '; use RuntimeException; use InvalidArgumentException; use Throwable; use Closure; use PDO; use DirectoryIterator;', $factory);
eval(substr($factory, 5));

foreach ([Runtime::class, VoxelSiteFactoryResetRuntime::class] as $runtime) {
    foreach (['', 'relative', 'C:site', '/site'] as $root) rejects(fn() => $runtime::path($root, 'new.json'), $runtime . ' rejects unqualified root');
    check($runtime::path('C:\\site', '_studio/data/new.json') === 'C:/site/_studio/data/new.json', $runtime . ' accepts drive paths');
    check($runtime::path('//server/share/site', 'new.json') === '//server/share/site/new.json', $runtime . ' retains UNC roots');
    foreach (['../outside', 'folder/../outside', '/outside', 'folder\\outside', 'C:outside', 'folder/name. ', 'nul.txt'] as $relative) {
        rejects(fn() => $runtime::path('C:/site', $relative), $runtime . ' rejects ' . $relative);
    }
    Filesystem::$links = ['C:/site' => true];
    rejects(fn() => $runtime::path('C:/site/_studio', 'data/new.json'), $runtime . ' rejects replaced ancestor');
    Filesystem::$links = ['C:/site/_studio' => true];
    rejects(fn() => $runtime::path('C:/site', '_studio/data/new.json'), $runtime . ' rejects child symlink');
    Filesystem::$links = [];
}
new VoxelSiteFactoryResetRuntime('C:\\site\\_studio', 'C:\\site');
check(Filesystem::$probes < 500, 'Drive and UNC ancestor traversal terminates');

// Evaluate only the bridge prelude, before any HTTP/database work.
$bridge = str_replace("\r\n", "\n", file_get_contents($studio . '/update-runtime.php'));
if (!str_contains($bridge, "try{\n")) throw new RuntimeException('Update bridge prelude boundary is missing.');
$bridge = substr($bridge, 5, strpos($bridge, "try{\n") - 5);
$bridge = str_replace('declare(strict_types=1);', 'declare(strict_types=1); namespace ' . __NAMESPACE__ . '; use RuntimeException; use PDO; use stdClass;', $bridge);
eval($bridge);
check($checkedPath('C:\\site\\_studio\\data') === 'C:/site/_studio/data', 'Bridge canonicalizes native paths');
Filesystem::$links = ['C:/site' => true];
try { $checkedPath('C:/site/_studio/data'); throw new RuntimeException('Bridge accepted replaced ancestor'); }
catch (RuntimeException $error) { check($error->getMessage() !== 'Bridge accepted replaced ancestor', 'Bridge rejects ancestors'); }
echo "PASS standalone recovery Windows path simulation (native Windows I/O remains required)\n";
