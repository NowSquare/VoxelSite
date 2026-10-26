<?php
declare(strict_types=1);

$simulated = ($argv[1] ?? '') === '--windows-fixture';
if ($simulated) require __DIR__ . '/helpers/WindowsWorkspaceFilesystem.php';
require_once dirname(__DIR__, 2) . '/vendor/autoload.php';

use VoxelSite\{Database, SiteWorkspace};

$passed = 0; $errors = [];
function pathCheck(bool $ok, string $label): void
{
    global $passed, $errors;
    $ok ? $passed++ : $errors[] = $label;
}
function pathRefuses(callable $operation, string $label, ?string $message = null): void
{
    try { $operation(); pathCheck(false, $label); }
    catch (RuntimeException $error) {
        pathCheck(!str_contains($error->getMessage(), 'did not terminate')
            && ($message === null || $error->getMessage() === $message), $label);
    }
}
// Construction and root integrity do not query the database.
$db = (new ReflectionClass(Database::class))->newInstanceWithoutConstructor();
$trusted = new ReflectionMethod(SiteWorkspace::class, 'trustedRoot');
$windows = $simulated || DIRECTORY_SEPARATOR === '\\';
$root = $simulated ? 'C:\\xampp\\htdocs\\site' : realpath(sys_get_temp_dir());
$native = static fn(string $path): string => $windows ? str_replace('/', '\\', $path) : $path;
$variants = [$root];
if ($windows) $variants[] = str_replace('\\', '/', $root);
foreach ($variants as $variant) {
    try {
        $workspace = new SiteWorkspace($db, $variant . '/_studio/preview', $variant,
            $variant . '/_studio/data/workspace-migration');
        pathCheck($workspace->publishedRoot() === $root, 'Existing root remains native and canonical');
        pathCheck($workspace->migrationRoot() === $native($root . '/_studio/data/workspace-migration'),
            'Missing directories retain an absolute canonical parent');
        $workspace->assertRootIntegrity();
        pathCheck(true, 'Ancestor walk reaches the volume root without hanging');
    } catch (Throwable $error) { $errors[] = $variant . ': ' . $error->getMessage(); }
}
pathRefuses(fn() => new SiteWorkspace($db, $root, $root), 'Reject identical draft and published roots',
    'Draft and published workspace roots must be different.');
pathRefuses(fn() => new SiteWorkspace($db, $root . '/_studio/preview', $root,
    $root . '/_studio/state', $root . '/_studio/preview/assets'), 'Reject shared mutable asset roots',
    'Draft and published workspace roots must be different.');

foreach (['', 'relative/path', '../site', 'C:relative', 'C:', '\\relative',
    'php://filter', 'file:///tmp/site', "C:/site\0", "C:/site\n"] as $path) {
    pathRefuses(fn() => $trusted->invoke(null, $path), 'Reject non-absolute or unsafe root: ' . json_encode($path),
        'Workspace roots must be absolute server paths.');
}
foreach (['../index.php', '/index.php', 'C:/index.php', 'C:\\index.php',
    'assets\\index.php', 'assets//file.php', "index.php\0"] as $path) {
    pathRefuses(fn() => SiteWorkspace::normalizeRelative($path), 'Keep relative-path protection: ' . json_encode($path));
}

if ($simulated) {
    foreach (['C:/', 'C:\\', '//server/share', '\\\\server\\share', '\\\\server\\share\\site'] as $path) {
        try {
            pathCheck($trusted->invoke(null, $path) === $native(VoxelSite\WindowsWorkspaceFilesystem::key($path)), 'Accept volume/share root: ' . $path);
        } catch (Throwable $error) { $errors[] = $path . ': ' . $error->getMessage(); }
    }
    try {
        pathCheck($trusted->invoke(null, 'C://') === 'C:\\', 'Repeated separators retain the drive root');
    } catch (Throwable $error) { $errors[] = 'Repeated drive-root separators: ' . $error->getMessage(); }
    foreach (['//server', '\\\\server', '//?/C:/site', '//./C:/site'] as $path) {
        pathRefuses(fn() => $trusted->invoke(null, $path), 'Reject incomplete or device namespace: ' . $path,
            'Workspace roots must be absolute server paths.');
    }
    VoxelSite\WindowsWorkspaceFilesystem::$links['C:/xampp/htdocs/site'] = true;
    pathRefuses(fn() => $trusted->invoke(null, $root), 'Reject symlink root');
    VoxelSite\WindowsWorkspaceFilesystem::$links = ['C:/xampp' => true];
    if (isset($workspace)) pathRefuses(fn() => $workspace->assertRootIntegrity(), 'Reject replaced ancestor');
} elseif (!$windows) {
    pathCheck($trusted->invoke(null, '/') === '/', 'Preserve the POSIX filesystem root');
    pathCheck($trusted->invoke(null, '///') === '/', 'Repeated separators retain the POSIX root');
}

foreach ($errors as $error) echo "FAIL: $error\n";
echo 'Workspace paths (' . ($simulated ? 'Windows fixture' : PHP_OS_FAMILY) . "): {$passed} passed, " . count($errors) . " failed\n";
exit($errors === [] ? 0 : 1);
