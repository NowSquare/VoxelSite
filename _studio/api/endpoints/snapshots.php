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

require_once dirname(__DIR__, 2) . '/engine/SiteControlSnapshots.php';

$method  = $_REQUEST['_route_method'];
$path    = $_REQUEST['_route_path'];
$params  = $_REQUEST['_route_params'] ?? [];

$db       = Database::getInstance();
$settings = new Settings($db);

$snapshotDir = getenv('VS_TEST_SNAPSHOT_DIR') ?: dirname(__DIR__, 2) . '/data/snapshots';
$previewDir  = getenv('VS_TEST_PREVIEW_DIR') ?: dirname(__DIR__, 2) . '/preview';
$assetsDir   = getenv('VS_TEST_ASSETS_DIR') ?: dirname(__DIR__, 3) . '/assets';

// Ensure snapshots directory exists
if (!is_dir($snapshotDir)) {
    mkdir($snapshotDir, 0755, true);
}

// ═══════════════════════════════════════════
//  GET /snapshots — List all snapshots
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/snapshots') {
    $protectedIds = \VoxelSite\SnapshotRetention::protectedIds($db);
    $protectedClause = $protectedIds ? ' OR id IN (' . implode(', ', array_fill(0, count($protectedIds), '?')) . ')' : '';
    $snapshots = $db->query(
        'SELECT id, filename, snapshot_type, label, description,
                trigger_prompt, file_count, size_bytes, created_at
         FROM snapshots
         WHERE id IN (SELECT id FROM snapshots ORDER BY created_at DESC, id DESC LIMIT 50)' . $protectedClause . '
         ORDER BY created_at DESC, id DESC',
        $protectedIds
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

    // A dropped request must leave a durable operation before any restoration writes.
    $restoreMutationId = bin2hex(random_bytes(16));
    $journal = new \VoxelSite\SiteMutationJournal($db);
    $journal->begin($restoreMutationId, (int) $_REQUEST['_user']['id'], $path, ['snapshot_id' => $id]);
    $safety = createSnapshot($db, $snapshotDir, $previewDir, $assetsDir, 'auto', 'Before restore', "Auto-saved before restoring snapshot #{$id}", false);
    if (!$safety['ok']) {
        $response = ['ok' => false, 'error' => ['code' => 'snapshot_failed', 'mutation_id' => $restoreMutationId,
            'restored' => true, 'message' => 'Could not create a safety snapshot. Nothing was restored. ' . ($safety['error'] ?? '')]];
        \VoxelSite\SiteMutationJournal::finish($response, 500);
        jsonResponse($response, 500);
        return;
    }
    $safetyId = (int) $safety['snapshot']['id'];
    $response = ['ok' => true, 'data' => ['message' => 'Snapshot restored. Pages synced.',
        'safetySnapshotId' => $safetyId, 'mutation_id' => $restoreMutationId]];
    $result = restoreSnapshot($zipPath, $previewDir, $assetsDir);
    try {
        if (!$result['ok']) throw new \RuntimeException($result['error']);
        $fileManager = new \VoxelSite\FileManager($db);
        $fileManager->syncPageRegistry(true);
        if (!($fileManager->compileTailwind()['ok'] ?? false)) throw new \RuntimeException('Could not compile restored website styles.');
        \VoxelSite\SiteRecovery::resolveAfterSnapshot($db, $id,
            static fn () => \VoxelSite\SiteMutationJournal::finish($response, 200, false));
    } catch (\Throwable $error) {
        try {
            $restored = (!$result['ok'] && !($result['has_mutated'] ?? true)) || restoreSiteControlSnapshot($db, $safetyId)['ok'];
        } catch (\Throwable) { $restored = false; }
        $response = ['ok' => false, 'error' => [
            'code' => 'restore_failed', 'restored' => $restored, 'snapshotId' => $safetyId, 'mutation_id' => $restoreMutationId,
            'message' => $error->getMessage() . ($restored ? ' Your previous files were preserved or restored.' : ' Recovery is incomplete. Restore safety snapshot #' . $safetyId . ' after fixing the reported permissions.'),
        ]];
        \VoxelSite\SiteMutationJournal::finish($response, 500);
        jsonResponse($response, 500);
        return;
    }
    \VoxelSite\SiteMutationJournal::releaseCommittedOperation();
    try { enforceSnapshotLimit($db, $settings, $snapshotDir, [$safetyId]); }
    catch (\Throwable $error) { \VoxelSite\Logger::warning('snapshots', 'Restored website; old archive cleanup failed', ['error' => $error->getMessage()]); }
    jsonResponse($response);
    return;
}

// ═══════════════════════════════════════════
//  DELETE /snapshots/:id — Delete a snapshot
// ═══════════════════════════════════════════

if ($method === 'DELETE' && isset($params['id'])) {
    $id = (int) $params['id'];

    $snapshot = $db->queryOne('SELECT id, filename FROM snapshots WHERE id = ?', [$id]);

    if (!$snapshot) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Snapshot not found.',
        ]], 404);
        return;
    }

    if (in_array($id, \VoxelSite\SnapshotRetention::protectedIds($db), true)) {
        jsonResponse(['ok' => false, 'error' => ['code' => 'snapshot_required_for_recovery',
            'message' => 'Snapshot #' . $id . ' is needed for website recovery. Wait for the change to finish, or restore a snapshot in Designs → History before deleting it.']], 409);
        return;
    }
    try { \VoxelSite\SnapshotRetention::remove($db, $snapshotDir, $snapshot); }
    catch (\Throwable $error) {
        jsonResponse(['ok' => false, 'error' => ['code' => 'snapshot_delete_failed', 'message' => $error->getMessage()]], 500);
        return;
    }

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
    string    $description = '',
    bool      $enforceLimit = true
): array {
    if (!class_exists('ZipArchive')) {
        return ['ok' => false, 'error' => 'ZipArchive extension is not installed.'];
    }

    $timestamp = date('Y-m-d_H-i-s');
    $filename  = "snapshot_{$type}_{$timestamp}_" . bin2hex(random_bytes(8)) . ".zip";
    $zipPath   = $snapshotDir . '/' . $filename;
    $fileCount = 0;

    $zip = new \ZipArchive();
    if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::EXCL) !== true) {
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

    $state = ['pages' => $db->query('SELECT * FROM pages ORDER BY id'),
        'collection_indexes' => $db->query('SELECT id, index_page_id FROM collections ORDER BY id'),
        'files' => [], 'directories' => []];
    foreach (['preview' => $previewDir, 'assets' => $assetsDir] as $prefix => $dir) {
        if (!is_dir($dir)) continue;
        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS), \RecursiveIteratorIterator::SELF_FIRST) as $file) {
            if ($file->isLink()) continue;
            $name = $prefix . '/' . substr($file->getPathname(), strlen(rtrim($dir, '/')) + 1);
            if ($file->isDir()) { $state['directories'][$name] = scSnapshotMetadata($file->getPathname()); continue; }
            if ($file->isFile()) $state['files'][$name] = scSnapshotMetadata($file->getPathname());
        }
    }
    if (!$zip->addFromString('site-control-state.json', json_encode($state, JSON_THROW_ON_ERROR)) || !$zip->close()) return ['ok' => false, 'error' => 'Could not finish safety snapshot archive.'];
    $verified = new \ZipArchive();
    if ($verified->open($zipPath) !== true) return ['ok' => false, 'error' => 'Could not verify safety snapshot archive.'];
    foreach ($state['files'] as $name => $meta) {
        $captured = $verified->getFromName($name);
        if ($captured === false || hash('sha256', $captured) !== $meta['sha256']) {
            $verified->close();
            @unlink($zipPath);
            return ['ok' => false, 'error' => 'Safety snapshot did not capture every file: ' . $name];
        }
    }
    $verified->close();

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
    \VoxelSite\SiteMutationJournal::attachSnapshot($id);

    // Enforce max snapshots limit
    $settings = new Settings($db);
    if ($enforceLimit) enforceSnapshotLimit($db, $settings, $snapshotDir, [$id]);

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
    $realDir = realpath($dir) ?: $dir;
    $iterator = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
        \RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($iterator as $file) {
        if ($file->isLink()) continue;
        if ($file->isFile()) {
            $realPath = $file->getRealPath();
            $relativePath = $zipPrefix . '/' . ltrim(
                str_replace($realDir, '', $realPath),
                DIRECTORY_SEPARATOR
            );
            // Normalize path separators for ZIP
            $relativePath = str_replace('\\', '/', $relativePath);
            if (!$zip->addFile($realPath, $relativePath)) throw new \RuntimeException('Could not capture snapshot file: ' . $relativePath);
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
    if ($zip->open($zipPath) !== true) return ['ok' => false, 'error' => 'Could not open snapshot archive.', 'has_mutated' => false];
    $mutated = false;
    try {
        $entries = [];
        $manifestText = $zip->getFromName('site-control-state.json');
        $manifest = $manifestText === false ? null : json_decode($manifestText, true, 512, JSON_THROW_ON_ERROR);
        // Read and validate the complete archive before touching the current website.
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if (!is_string($name) || str_ends_with($name, '/')) continue;
            if (!preg_match('~^(preview|assets)/(.+)$~', $name, $match)) continue;
            if (!isSafeSnapshotRelativePath($match[2]) || isset($entries[$name])) throw new \RuntimeException('Unsafe or duplicate snapshot entry: ' . $name);
            $content = $zip->getFromIndex($i);
            if ($content === false) throw new \RuntimeException('Could not read snapshot entry: ' . $name);
            $base = $match[1] === 'preview' ? $previewDir : $assetsDir;
            if (!canWriteSnapshotEntry($base, $match[2])) throw new \RuntimeException('Cannot write snapshot entry: ' . $name . '. Check file permissions.');
            if (isset($manifest['files'][$name]) && hash('sha256', $content) !== $manifest['files'][$name]['sha256']) throw new \RuntimeException('Snapshot entry failed verification: ' . $name);
            $entries[$name] = ['base' => $base, 'relative' => $match[2], 'content' => $content];
        }
        if (!$entries) throw new \RuntimeException('Snapshot contains no restorable website files.');
        foreach ($manifest['directories'] ?? [] as $name => $mode) {
            if (!preg_match('~^(preview|assets)/(.+)$~', $name, $match) || !isSafeSnapshotRelativePath($match[2])) throw new \RuntimeException('Unsafe snapshot directory: ' . $name);
            $base = $match[1] === 'preview' ? $previewDir : $assetsDir;
            $target = $base . '/' . $match[2];
            $realBase = realpath($base); $realTarget = realpath($target);
            if ($realTarget !== false && $realBase !== false && !str_starts_with($realTarget . '/', rtrim($realBase, '/') . '/')) throw new \RuntimeException('Snapshot directory escapes website boundary: ' . $name);
        }
        foreach ($manifest['files'] ?? [] as $name => $meta) {
            if (!isset($entries[$name])) throw new \RuntimeException('Snapshot is missing a captured file: ' . $name);
        }
        $zip->close();
        $remove = [];
        // Preserve user uploads; public restore replaces preview and CSS/JS only.
        foreach (['preview' => $previewDir, 'assets/css' => $assetsDir . '/css', 'assets/js' => $assetsDir . '/js'] as $prefix => $dir) {
            if (!is_dir($dir)) continue;
            foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS)) as $file) {
                if ($file->isLink()) continue;
                if (!$file->isFile() || $file->getExtension() === 'gitkeep') continue;
                $name = $prefix . '/' . substr($file->getPathname(), strlen(rtrim($dir, '/')) + 1);
                if (isset($entries[$name])) continue;
                if (!is_writable(dirname($file->getPathname()))) throw new \RuntimeException('Cannot remove old snapshot file: ' . $name . '. Check directory permissions.');
                $remove[] = $file->getPathname();
            }
        }
        foreach ($entries as $name => $entry) {
            $target = $entry['base'] . '/' . $entry['relative'];
            if (@file_get_contents($target) !== $entry['content']) {
                $mutated = true; // A failed write may have truncated the destination.
                if (!writeSnapshotEntry($entry['base'], $entry['relative'], $entry['content'])) throw new \RuntimeException('Could not write and verify snapshot entry: ' . $name);
                if (getenv('VS_TEST_SNAPSHOT_FAIL_AFTER_WRITE')) {
                    putenv('VS_TEST_SNAPSHOT_FAIL_AFTER_WRITE');
                    throw new \RuntimeException('Injected interruption after snapshot write.');
                }
            }
            if (isset($manifest['files'][$name])) {
                // Ownership restoration can fail after changing an inode's metadata.
                $mutated = true;
                scRestoreSnapshotMetadata($target, $manifest['files'][$name], $name);
            }
        }
        foreach ($remove as $path) {
            if (!@unlink($path)) throw new \RuntimeException('Could not remove old file during restore: ' . basename($path));
            $mutated = true;
        }
        foreach ($entries as $name => $entry) {
            if (@file_get_contents($entry['base'] . '/' . $entry['relative']) !== $entry['content']) throw new \RuntimeException('Restored file failed verification: ' . $name);
        }
        foreach (array_reverse($manifest['directories'] ?? [], true) as $name => $metadata) {
            [$prefix, $relative] = explode('/', $name, 2);
            $target = ($prefix === 'preview' ? $previewDir : $assetsDir) . '/' . $relative;
            if (!is_dir($target) && !@mkdir($target, 0755, true)) throw new \RuntimeException('Could not restore snapshot directory: ' . $name);
            $mutated = true;
            scRestoreSnapshotMetadata($target, $metadata, $name);
        }
        if (is_array($manifest['pages'] ?? null)) {
            $mutated = true;
            scRestoreProjection(Database::getInstance(), $manifest);
        }
        return ['ok' => true, 'has_mutated' => $mutated];
    } catch (\Throwable $error) {
        try { $zip->close(); } catch (\Throwable) {}
        return ['ok' => false, 'error' => $error->getMessage(), 'has_mutated' => $mutated];
    }
}

/** Check the resolved filesystem boundary before creating directories or replacing files. */
function canWriteSnapshotEntry(string $baseDir, string $relativePath): bool
{
    if (!isSafeSnapshotRelativePath($relativePath)) return false;
    $realBase = realpath($baseDir);
    if ($realBase === false) return false;
    $target = rtrim($baseDir, '/\\') . '/' . $relativePath;
    if (is_link($target) || is_dir($target) || (file_exists($target) && !is_writable($target))) return false;
    $parent = dirname($target);
    while (!file_exists($parent) && dirname($parent) !== $parent) $parent = dirname($parent);
    $realParent = realpath($parent);
    return $realParent !== false && is_dir($parent) && is_writable($parent)
        && ($realParent === $realBase || str_starts_with($realParent . '/', rtrim($realBase, '/') . '/'));
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
    if (!canWriteSnapshotEntry($baseDir, $relativePath)) return false;
    $targetPath = rtrim($baseDir, '/\\') . '/' . $relativePath;
    $parentDir = dirname($targetPath);
    if (!is_dir($parentDir) && !@mkdir($parentDir, 0755, true) && !is_dir($parentDir)) return false;
    if (!canWriteSnapshotEntry($baseDir, $relativePath)) return false;
    return @file_put_contents($targetPath, $content, LOCK_EX) === strlen($content)
        && @file_get_contents($targetPath) === $content;
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
function enforceSnapshotLimit(Database $db, Settings $settings, string $snapshotDir, array $currentIds = []): void
{
    \VoxelSite\SnapshotRetention::enforce($db, $settings, $snapshotDir, $currentIds);
}
