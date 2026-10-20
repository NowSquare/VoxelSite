<?php
declare(strict_types=1);

/** Isolated snapshot ownership checks, including hosts without chown/chgrp. */
require dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Database;
use VoxelSite\Migrator;

$worker = ($argv[1] ?? '') === '--worker';
$root = $worker ? $argv[2] : sys_get_temp_dir() . '/vs-snapshot-ownership-' . bin2hex(random_bytes(6));
if (!$worker) foreach (['preview/nested', 'assets/css', 'snapshots'] as $directory) mkdir($root . '/' . $directory, 0755, true);
foreach (['PREVIEW_DIR' => 'preview', 'ASSETS_DIR' => 'assets', 'SNAPSHOT_DIR' => 'snapshots'] as $key => $directory) putenv('VS_TEST_' . $key . '=' . $root . '/' . $directory);
$db = Database::getInstance($root . '/studio.db');
(new Migrator($db))->run();
$_REQUEST = ['_route_method' => 'GET', '_route_path' => '/test'];
function jsonResponse(mixed $data, int $status = 200): void {}
require dirname(__DIR__) . '/api/endpoints/snapshots.php';
if ($worker) {
    $id = (int) $argv[3];
    $row = $db->queryOne('SELECT filename FROM snapshots WHERE id = ?', [$id]);
    $result = $argv[4] === 'safety' ? restoreSiteControlSnapshot($db, $id)
        : restoreSnapshot($root . '/snapshots/' . $row['filename'], $root . '/preview', $root . '/assets');
    echo json_encode($result, JSON_THROW_ON_ERROR);
    exit;
}

$checks = 0; $failures = [];
function ownershipCheck(bool $condition, string $name): void {
    global $checks, $failures;
    $checks++;
    if (!$condition) $failures[] = $name;
    echo ($condition ? 'PASS ' : 'FAIL ') . $name . "\n";
}
function metadata(string $path): array {
    clearstatcache(true, $path);
    return ['uid' => fileowner($path), 'gid' => filegroup($path), 'mode' => fileperms($path) & 07777];
}
function runWithoutOwnershipFunctions(int $id, string $kind): array {
    global $root;
    $process = proc_open([PHP_BINARY, '-d', 'disable_functions=chown,chgrp', __FILE__, '--worker', $root, (string) $id, $kind],
        [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
    fclose($pipes[0]); $output = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $error = stream_get_contents($pipes[2]); fclose($pipes[2]);
    if (proc_close($process) !== 0) throw new RuntimeException($error . $output);
    return json_decode($output, true, 512, JSON_THROW_ON_ERROR);
}

$path = $root . '/preview/nested/team.php';
$source = '<?php $page=["title"=>"Team"]; ?><h1>Original team</h1>';
file_put_contents($path, $source); chmod($path, 0640);
file_put_contents($root . '/assets/css/style.css', ':root { --color-primary: #123456; }');
$differentGroup = null;
foreach (function_exists('posix_getgroups') && function_exists('chgrp') ? posix_getgroups() : [] as $group) {
    if ($group !== filegroup($path) && @chgrp($path, $group)) { $differentGroup = $group; break; }
}
if ($differentGroup !== null) chgrp($root . '/preview/nested', $differentGroup);
chmod($root . '/preview/nested', $differentGroup !== null ? 02750 : 0750);
$fileMetadata = metadata($path); $directoryMetadata = metadata($root . '/preview/nested');
$safety = createSiteControlSnapshot($db, 'Ownership fixture', 'Verify file and directory ownership');
ownershipCheck($safety['ok'], 'Safety snapshot captures the isolated website');
$id = (int) $safety['snapshot']['id'];
$zip = new ZipArchive(); $zip->open($root . '/snapshots/' . $safety['snapshot']['filename']);
$manifest = json_decode($zip->getFromName('site-control-state.json'), true, 512, JSON_THROW_ON_ERROR); $zip->close();
ownershipCheck(($manifest['files']['preview/nested/team.php']['uid'] ?? null) === $fileMetadata['uid']
    && ($manifest['files']['preview/nested/team.php']['gid'] ?? null) === $fileMetadata['gid'], 'Safety manifest records the original file owner and group');
ownershipCheck(($manifest['directories']['preview/nested']['uid'] ?? null) === $directoryMetadata['uid']
    && ($manifest['directories']['preview/nested']['gid'] ?? null) === $directoryMetadata['gid'], 'Safety manifest records the original directory owner and group');
unlink($path); rmdir($root . '/preview/nested');
$result = restoreSiteControlSnapshot($db, $id);
ownershipCheck($result['ok'] && file_get_contents($path) === $source && metadata($path) === $fileMetadata,
    'Rollback recreates a deleted file with its exact bytes, mode, owner and group');
ownershipCheck(metadata($root . '/preview/nested') === $directoryMetadata, 'Rollback recreates a deleted directory with its original mode, owner and group');

$public = createSnapshot($db, $root . '/snapshots', $root . '/preview', $root . '/assets', 'manual', 'Public ownership');
$publicId = (int) $public['snapshot']['id'];
$zip->open($root . '/snapshots/' . $public['snapshot']['filename']);
$publicManifest = json_decode($zip->getFromName('site-control-state.json'), true, 512, JSON_THROW_ON_ERROR); $zip->close();
ownershipCheck(($publicManifest['files']['preview/nested/team.php']['gid'] ?? null) === $fileMetadata['gid']
    && ($publicManifest['directories']['preview/nested']['gid'] ?? null) === $directoryMetadata['gid'], 'Public snapshots record the same ownership metadata');
unlink($path); rmdir($root . '/preview/nested');
$result = restoreSnapshot($root . '/snapshots/' . $public['snapshot']['filename'], $root . '/preview', $root . '/assets');
ownershipCheck($result['ok'] && file_get_contents($path) === $source && metadata($path) === $fileMetadata,
    'Public restoration recreates a deleted file with its original ownership');
ownershipCheck(metadata($root . '/preview/nested') === $directoryMetadata, 'Public restoration recreates a directory with its original ownership');

if ($differentGroup !== null) {
    unlink($path); rmdir($root . '/preview/nested');
    $result = runWithoutOwnershipFunctions($id, 'safety');
    ownershipCheck(!$result['ok'] && str_contains(strtolower($result['error'] ?? ''), 'ownership'),
        'Rollback cannot claim success when the host cannot restore the original ownership');
    $restored = restoreSiteControlSnapshot($db, $id);
    ownershipCheck($restored['ok'] && metadata($path) === $fileMetadata, 'Restoring with ownership functions available repairs the failed ownership restoration');
    unlink($path); rmdir($root . '/preview/nested');
    $result = runWithoutOwnershipFunctions($publicId, 'public');
    ownershipCheck(!$result['ok'] && ($result['has_mutated'] ?? false) && str_contains(strtolower($result['error'] ?? ''), 'ownership'),
        'Public restoration reports changed files and failure when ownership cannot be restored');
    restoreSiteControlSnapshot($db, $id);
} else {
    echo "SKIP alternate-group restoration: this host supplies no usable supplementary group.\n";
}
$result = runWithoutOwnershipFunctions($id, 'safety');
ownershipCheck($result['ok'], 'An unchanged file owner and group require no chown or chgrp function');

// Older archives have integer directory modes and no ownership fields.
$legacy = $manifest;
foreach ($legacy['files'] as &$file) unset($file['uid'], $file['gid']); unset($file);
foreach ($legacy['directories'] as &$directory) if (is_array($directory)) $directory = $directory['mode']; unset($directory);
$zipPath = $root . '/snapshots/legacy.zip'; $legacyZip = new ZipArchive(); $legacyZip->open($zipPath, ZipArchive::CREATE);
foreach ($legacy['files'] as $entry => $meta) $legacyZip->addFile($root . '/' . $entry, $entry);
$legacyZip->addFromString('site-control-state.json', json_encode($legacy, JSON_THROW_ON_ERROR)); $legacyZip->close();
$result = restoreSnapshot($zipPath, $root . '/preview', $root . '/assets');
ownershipCheck($result['ok'] && metadata($path) === $fileMetadata, 'Older snapshots without owner metadata still restore without changing existing ownership');

echo $checks . ' snapshot ownership checks, ' . count($failures) . ' failed. Fixture: ' . $root . "\n";
exit($failures ? 1 : 0);
