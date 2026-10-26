<?php
declare(strict_types=1);
$simulated = ($argv[1] ?? '') === '--windows-fixture';
if ($simulated) require __DIR__ . '/helpers/WindowsWorkspaceFilesystem.php';
require dirname(__DIR__, 2) . '/vendor/autoload.php';
use VoxelSite\FilesystemPath as Path;
$passed = 0;
function checkPath(bool $ok, string $message): void { global $passed; if (!$ok) throw new RuntimeException($message); $passed++; }
function refusesPath(callable $fn): void { try { $fn(); } catch (RuntimeException $e) { checkPath(!str_contains($e->getMessage(), 'did not terminate'), 'Bounded ancestor check'); return; } throw new RuntimeException('Unsafe path accepted'); }
$windows = $simulated || DIRECTORY_SEPARATOR === '\\';
$root = $simulated ? 'C:/xampp/htdocs/site' : Path::realpath(sys_get_temp_dir());
checkPath(!Path::contains($root, ''), 'Empty comparison root refused');
checkPath(!Path::contains($windows ? 'C:/' : '/', $windows ? 'C:/' : '/', false), 'Volume root is not its own descendant');
checkPath(Path::isAbsolute($root), 'Native absolute path');
checkPath(Path::trustedRoot($root . '/new/path') === rtrim($root, '/') . '/new/path', 'Missing root has canonical ancestor');
checkPath(Path::contains($root . '/nested/file.php', $root), 'Nested path contained');
checkPath(!Path::contains($root . '-other/file.php', $root), 'Sibling prefix refused');
checkPath(!Path::contains($root, $root, false), 'Strict descendant check');
checkPath(Path::relative($root . '/nested/file.php', $root) === 'nested/file.php', 'Managed relative output');
refusesPath(fn() => Path::relative($root . '-other/file.php', $root));
foreach (['', 'relative', 'C:relative', 'php://filter', "bad\0path"] as $invalid) checkPath(!Path::isAbsolute($invalid), 'Reject unsafe root');
if ($windows) {
    checkPath(Path::normalize('C:\\xampp\\htdocs') === 'C:/xampp/htdocs', 'Windows separator canonicalization');
    foreach (['C:/', 'C:\\', '//server/share', '\\\\server\\share\\folder'] as $valid) checkPath(Path::isAbsolute($valid), 'Drive/UNC absolute');
    foreach (['/rooted', '\\rooted', '//server', '//?/C:/site', '//./C:/site'] as $invalid) checkPath(!Path::isAbsolute($invalid), 'Reject ambiguous/device root');
    checkPath(Path::contains(str_replace('/', '\\', $root) . '\\assets\\x.png', $root), 'Mixed separator containment');
    checkPath(!Path::contains('C:/different/file', $root), 'Different root refused');
    checkPath(Path::contains('C:/site', 'C:/'), 'Volume root containment');
    checkPath(Path::relative(str_replace('/', '\\', $root) . '\\assets\\x.png', $root) === 'assets/x.png', 'Iterator path normalized');
    if ($simulated) {
        Path::assertNoSymlinkAncestors('C:/', 'unsafe');
        Path::assertNoSymlinkAncestors('//server/share/site', 'unsafe');
        checkPath(Path::trustedRoot('C://') === 'C:/', 'Repeated root separator');
        VoxelSite\WindowsWorkspaceFilesystem::$links['C:/xampp'] = true;
        refusesPath(fn() => Path::assertNoSymlinkAncestors($root, 'unsafe'));
    }
} else {
    checkPath(Path::normalize('/tmp/literal\\name') === '/tmp/literal\\name', 'POSIX backslash filename preserved');
    checkPath(Path::trustedRoot('///') === '/', 'POSIX root retained');
    checkPath(Path::contains('/tmp/file', '/'), 'POSIX root containment');
}
echo "Filesystem paths: $passed passed\n";
