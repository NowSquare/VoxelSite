<?php

declare(strict_types=1);

/**
 * Snapshots API Endpoints
 *
 * GET    /snapshots             — List all snapshots
 * POST   /snapshots             — Create a manual snapshot
 * POST   /snapshots/:id/restore — Restore a snapshot
 * DELETE /snapshots/:id         — Delete a snapshot
 *
 * Snapshots are ZIP archives that capture the entire site state:
 * all preview PHP page files + _partials/ + all assets. They're the safety net
 * that lets users experiment fearlessly (Commandment VIII).
 */

use VoxelSite\Database;
use VoxelSite\Settings;

$method  = $_REQUEST['_route_method'];
$path    = $_REQUEST['_route_path'];
$params  = $_REQUEST['_route_params'] ?? [];

$db       = Database::getInstance();
$settings = new Settings($db);

$snapshotDir = dirname(__DIR__, 2) . '/data/snapshots';
$previewDir  = dirname(__DIR__, 2) . '/preview';
$assetsDir   = dirname(__DIR__, 3) . '/assets';

// Ensure snapshots directory exists
if (!is_dir($snapshotDir)) {
    mkdir($snapshotDir, 0755, true);
}

// ═══════════════════════════════════════════
//  GET /snapshots — List all snapshots
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/snapshots') {
    $snapshots = $db->query(
        'SELECT id, filename, snapshot_type, label, description,
                trigger_prompt, file_count, size_bytes, created_at
         FROM snapshots
         ORDER BY created_at DESC
         LIMIT 50'
    );

    jsonResponse(['ok' => true, 'data' => ['snapshots' => $snapshots]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /snapshots — Create a snapshot
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/snapshots') {
    $body = getJsonBody();

    $label       = trim($body['label'] ?? '');
    $description = trim($body['description'] ?? '');
    $type        = $body['type'] ?? 'manual';

    if (!in_array($type, ['manual', 'pre_publish', 'auto'], true)) {
        $type = 'manual';
    }

    $result = createSnapshot($db, $snapshotDir, $previewDir, $assetsDir, $type, $label, $description);

    if (!$result['ok']) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'snapshot_failed',
            'message' => $result['error'],
        ]], 500);
        return;
    }

    jsonResponse(['ok' => true, 'data' => [
        'message'  => 'Snapshot created.',
        'snapshot' => $result['snapshot'],
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /snapshots/:id/restore — Restore
// ═══════════════════════════════════════════

if ($method === 'POST' && isset($params['id']) && str_ends_with($path, '/restore')) {
    $id = (int) $params['id'];

    $snapshot = $db->queryOne('SELECT * FROM snapshots WHERE id = ?', [$id]);

    if (!$snapshot) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Snapshot not found.',
        ]], 404);
        return;
    }

    $zipPath = $snapshotDir . '/' . $snapshot['filename'];
    if (!file_exists($zipPath)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Snapshot file is missing from disk.',
        ]], 404);
        return;
    }

    // Create an auto-snapshot before restoring (safety net for the safety net)
    createSnapshot($db, $snapshotDir, $previewDir, $assetsDir, 'auto', 'Before restore', "Auto-saved before restoring snapshot #{$id}");

    // Restore the snapshot
    $result = restoreSnapshot($zipPath, $previewDir, $assetsDir);

    if (!$result['ok']) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'restore_failed',
            'message' => $result['error'],
        ]], 500);
        return;
    }

    // Sync page registry with restored files
    $fileManager = new \VoxelSite\FileManager($db);
    $fileManager->syncPageRegistry();
    $fileManager->compileTailwind();

    jsonResponse(['ok' => true, 'data' => [
        'message' => 'Snapshot restored. Pages synced.',
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  DELETE /snapshots/:id — Delete a snapshot
// ═══════════════════════════════════════════

if ($method === 'DELETE' && isset($params['id'])) {
    $id = (int) $params['id'];

    $snapshot = $db->queryOne('SELECT filename FROM snapshots WHERE id = ?', [$id]);

    if (!$snapshot) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Snapshot not found.',
        ]], 404);
        return;
    }

    // Delete the ZIP file
    $zipPath = $snapshotDir . '/' . $snapshot['filename'];
    if (file_exists($zipPath)) {
        @unlink($zipPath);
    }

    // Delete the database record
    $db->delete('snapshots', 'id = ?', [$id]);

    // Enforce max snapshots limit
    enforceSnapshotLimit($db, $settings, $snapshotDir);

    jsonResponse(['ok' => true, 'data' => ['message' => 'Snapshot deleted.']]);
    return;
}

jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Snapshots endpoint not found.',
]], 404);

// ═══════════════════════════════════════════════════
//  Helper Functions
// ═══════════════════════════════════════════════════

/**
 * Create a snapshot ZIP of the current preview + assets.
 *
 * The ZIP structure mirrors the site:
 *   preview/index.php
 *   preview/about.php
 *   preview/_partials/header.php
 *   preview/_partials/nav.php
 *   preview/_partials/footer.php
 *   assets/css/style.css
 *   assets/js/main.js
 *   ...
 */
function createSnapshot(
    Database  $db,
    string    $snapshotDir,
    string    $previewDir,
    string    $assetsDir,
    string    $type,
    string    $label = '',
    string    $description = ''
): array {
    if (!class_exists('ZipArchive')) {
        return ['ok' => false, 'error' => 'ZipArchive extension is not installed.'];
    }

    $timestamp = date('Y-m-d_H-i-s');
    $filename  = "snapshot_{$type}_{$timestamp}.zip";
    $zipPath   = $snapshotDir . '/' . $filename;
    $fileCount = 0;

    $zip = new \ZipArchive();
    if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
        return ['ok' => false, 'error' => 'Could not create snapshot archive.'];
    }

    // Add preview PHP page files and _partials/
    if (is_dir($previewDir)) {
        $fileCount += addDirectoryToZip($zip, $previewDir, 'preview');
    }

    // Add all assets (css, js, images, fonts, files)
    if (is_dir($assetsDir)) {
        $fileCount += addDirectoryToZip($zip, $assetsDir, 'assets');
    }

    $zip->close();

    if ($fileCount === 0) {
        @unlink($zipPath);
        return ['ok' => false, 'error' => 'Nothing to snapshot — no files found.'];
    }

    $sizeBytes = filesize($zipPath);

    // Record in database
    $id = $db->insert('snapshots', [
        'filename'       => $filename,
        'snapshot_type'   => $type,
        'label'          => $label ?: null,
        'description'    => $description ?: null,
        'file_count'     => $fileCount,
        'size_bytes'     => $sizeBytes,
        'created_by'     => $_REQUEST['_user']['id'] ?? null,
        'created_at'     => now(),
    ]);

    // Enforce max snapshots limit
    $settings = new Settings($db);
    enforceSnapshotLimit($db, $settings, $snapshotDir);

    return [
        'ok'       => true,
        'snapshot' => [
            'id'            => $id,
            'filename'      => $filename,
            'snapshot_type'  => $type,
            'label'         => $label,
            'file_count'    => $fileCount,
            'size_bytes'    => $sizeBytes,
            'created_at'    => now(),
        ],
    ];
}

/**
 * Recursively add a directory to a ZipArchive.
 */
function addDirectoryToZip(\ZipArchive $zip, string $dir, string $zipPrefix): int
{
    $count = 0;
    $iterator = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
        \RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($iterator as $file) {
        if ($file->isFile()) {
            $realPath = $file->getRealPath();
            $relativePath = $zipPrefix . '/' . ltrim(
                str_replace($dir, '', $realPath),
                DIRECTORY_SEPARATOR
            );
            // Normalize path separators for ZIP
            $relativePath = str_replace('\\', '/', $relativePath);
            $zip->addFile($realPath, $relativePath);
            $count++;
        }
    }

    return $count;
}

/**
 * Restore a snapshot ZIP, replacing current preview + assets.
 */
function restoreSnapshot(string $zipPath, string $previewDir, string $assetsDir): array
{
    $zip = new \ZipArchive();
    if ($zip->open($zipPath) !== true) {
        return ['ok' => false, 'error' => 'Could not open snapshot archive.'];
    }

    // Clear current preview files (PHP pages + partials, keep .gitkeep)
    clearDirectory($previewDir, ['gitkeep']);

    // Clear current assets (CSS, JS; keep images/fonts/files since those are user-uploaded)
    clearDirectory($assetsDir . '/css');
    clearDirectory($assetsDir . '/js');

    // Extract files from ZIP to their correct locations
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $zipEntryName = $zip->getNameIndex($i);
        if (!is_string($zipEntryName) || str_ends_with($zipEntryName, '/')) {
            continue;
        }

        // Determine target path
        if (str_starts_with($zipEntryName, 'preview/')) {
            $relativePath = substr($zipEntryName, strlen('preview/'));
            $baseDir = $previewDir;
        } elseif (str_starts_with($zipEntryName, 'assets/')) {
            $relativePath = substr($zipEntryName, strlen('assets/'));
            $baseDir = $assetsDir;
        } else {
            continue; // Unknown prefix, skip
        }

        if (!isSafeSnapshotRelativePath($relativePath)) continue;

        // Write the file
        $content = $zip->getFromIndex($i);
        if ($content === false) continue;

        writeSnapshotEntry($baseDir, $relativePath, $content);
    }

    $zip->close();

    return ['ok' => true];
}

/**
 * Validate a relative path extracted from a snapshot archive.
 */
function isSafeSnapshotRelativePath(string $path): bool
{
    $path = str_replace('\\', '/', trim($path));
    if ($path === '' || str_contains($path, "\0")) return false;
    if (str_starts_with($path, '/')
        || str_contains($path, '../')
        || str_contains($path, '/..')
        || str_contains($path, '/./')) {
        return false;
    }
    if (!preg_match('/^[A-Za-z0-9._\/-]+$/', $path)) {
        return false;
    }
    foreach (explode('/', $path) as $segment) {
        if ($segment === '' || $segment === '.' || $segment === '..') {
            return false;
        }
    }

    return true;
}

/**
 * Write snapshot content into a base directory with boundary checks.
 */
function writeSnapshotEntry(string $baseDir, string $relativePath, string $content): bool
{
    $targetPath = rtrim($baseDir, '/\\') . '/' . ltrim(str_replace('\\', '/', $relativePath), '/');
    $parentDir = dirname($targetPath);
    if (!is_dir($parentDir) && !mkdir($parentDir, 0755, true) && !is_dir($parentDir)) {
        return false;
    }

    // Check logical path containment (handles symlinks)
    $normParent = rtrim(str_replace('//', '/', $parentDir), '/');
    $normBase = rtrim(str_replace('//', '/', $baseDir), '/');
    if (str_starts_with($normParent . '/', $normBase . '/') || $normParent === $normBase) {
        return file_put_contents($targetPath, $content) !== false;
    }

    // Fallback: check resolved paths
    $realBase = realpath($baseDir);
    $realParent = realpath($parentDir);
    if ($realBase !== false && $realParent !== false && str_starts_with($realParent . '/', $realBase . '/')) {
        return file_put_contents($targetPath, $content) !== false;
    }

    return false;
}

/**
 * Remove all files from a directory (non-recursive on top level).
 */
function clearDirectory(string $dir, array $keepExtensions = []): void
{
    if (!is_dir($dir)) return;

    $iterator = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
        \RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($iterator as $item) {
        if ($item->isFile()) {
            $ext = ltrim($item->getExtension(), '.');
            if (!in_array($ext, $keepExtensions, true)) {
                @unlink($item->getRealPath());
            }
        }
    }
}

/**
 * Enforce the maximum number of snapshots.
 * Deletes oldest snapshots beyond the limit.
 */
function enforceSnapshotLimit(Database $db, Settings $settings, string $snapshotDir): void
{
    $maxSnapshots = (int) $settings->get('max_snapshots', '20');
    if ($maxSnapshots <= 0) return;

    $excess = $db->query(
        'SELECT id, filename FROM snapshots
         ORDER BY created_at DESC
         LIMIT -1 OFFSET ?',
        [$maxSnapshots]
    );

    foreach ($excess as $old) {
        $oldPath = $snapshotDir . '/' . $old['filename'];
        if (file_exists($oldPath)) {
            @unlink($oldPath);
        }
        $db->delete('snapshots', 'id = ?', [$old['id']]);
    }
}
