<?php
declare(strict_types=1);
namespace VoxelSite;

require_once __DIR__ . '/SiteControlSnapshots.php';

/** Shared compatibility service for existing draft ZIP archives. */
final class LegacySnapshotService
{
/** Old archives captured draft pages plus shared assets, never a verified live release. */
public static function snapshotArchiveDomains(string $path): array
{
    $result = ['archive_format' => 1, 'domains' => ['draft'], 'legacy_shared_assets' => true];
    $zip = new \ZipArchive();
    if ($zip->open($path) !== true) return ['archive_format' => null, 'domains' => [], 'unavailable' => true];
    try {
        $entry = $zip->statName('site-control-state.json');
        if ($entry !== false && $entry['size'] > 1048576) return ['archive_format' => null, 'domains' => [], 'unavailable' => true];
        if ($entry !== false) {
            $state = json_decode($zip->getFromName('site-control-state.json') ?: '', true);
            if (!is_array($state) || !in_array($state['format'] ?? null, [1, 2], true)) return ['archive_format' => null, 'domains' => [], 'unavailable' => true];
            if (($state['format'] ?? null) === 2) {
                $result = ['archive_format' => 2, 'domains' => ($state['domain'] ?? null) === 'draft' ? ['draft'] : [],
                    'legacy_shared_assets' => false];
            }
        }
    } finally { $zip->close(); }
    return $result;
}

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
public static function createSnapshot(
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

    $workspace = new SiteWorkspace($db);
    $lock = SiteMutationLock::acquire($workspace->mutationLockPath(), $db);
    $workspace->assertReady();
    if (FilesystemPath::realpath($previewDir) !== $workspace->draftRoot() || FilesystemPath::realpath($assetsDir) !== $workspace->draftAssetsRoot()) {
        throw new \RuntimeException('Snapshot paths must be the canonical private draft.');
    }

    $timestamp = date('Y-m-d_H-i-s');
    $filename  = "snapshot_{$type}_{$timestamp}_" . bin2hex(random_bytes(8)) . ".zip";
    $zipPath   = $snapshotDir . '/' . $filename;
    $fileCount = 0;

    $zip = new \ZipArchive();
    if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::EXCL) !== true) {
        return ['ok' => false, 'error' => 'Could not create snapshot archive.'];
    }

    $state = ['format' => 2, 'domain' => 'draft',
        'pages' => $db->query('SELECT * FROM pages ORDER BY id'),
        'collection_indexes' => $db->query('SELECT id, index_page_id FROM collections ORDER BY id'),
        'files' => [], 'directories' => []];
    foreach (scDraftSnapshotEntries($workspace) as $entry => $target) {
        if (is_dir($target)) $state['directories'][$entry] = scSnapshotMetadata($target);
        else {
            $state['files'][$entry] = scSnapshotMetadata($target);
            if (!$zip->addFile($target, $entry)) throw new \RuntimeException('Could not capture draft file: ' . $entry);
            $fileCount++;
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
    if ($enforceLimit) self::enforceSnapshotLimit($db, $settings, $snapshotDir, [$id]);

    return [
        'ok'       => true,
        'snapshot' => [
            'id'            => $id,
            'filename'      => $filename,
            'snapshot_type'  => $type,
            'archive_format' => 2, 'domains' => ['draft'],
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
public static function addDirectoryToZip(\ZipArchive $zip, string $dir, string $zipPrefix): int
{
    $count = 0;
    $realDir = FilesystemPath::realpath($dir);
    if ($realDir === false) throw new \RuntimeException('Snapshot source directory is unavailable.');
    $iterator = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
        \RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($iterator as $file) {
        if ($file->isLink()) continue;
        if ($file->isFile()) {
            $realPath = FilesystemPath::realpath($file->getPathname());
            if ($realPath === false) throw new \RuntimeException('Snapshot source file is unavailable.');
            $relativePath = $zipPrefix . '/' . FilesystemPath::relative($realPath, $realDir);
            if (!$zip->addFile($realPath, $relativePath)) throw new \RuntimeException('Could not capture snapshot file: ' . $relativePath);
            $count++;
        }
    }

    return $count;
}

/**
 * Restore a snapshot ZIP, replacing current preview + assets.
 */
public static function restoreSnapshot(string $zipPath, string $previewDir, string $assetsDir): array
{
    $workspace = new SiteWorkspace(Database::getInstance());
    $lock = SiteMutationLock::acquire($workspace->mutationLockPath(), Database::getInstance());
    $workspace->assertReady();
    if (FilesystemPath::realpath($previewDir) !== $workspace->draftRoot() || FilesystemPath::realpath($assetsDir) !== $workspace->draftAssetsRoot()) {
        return ['ok' => false, 'error' => 'Snapshot paths must be the canonical private draft.', 'has_mutated' => false];
    }
    $zip = new \ZipArchive();
    if ($zip->open($zipPath) !== true) return ['ok' => false, 'error' => 'Could not open snapshot archive.', 'has_mutated' => false];
    $mutated = false;
    try {
        if ($zip->numFiles > SnapshotService::MAX_FILES * 3) throw new \RuntimeException('Snapshot exceeds the supported entry budget.');
        $total = 0; $seen = [];
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $stat = $zip->statIndex($i); $name = $stat['name'];
            $opsys = $attributes = 0;
            if ($zip->getExternalAttributesIndex($i, $opsys, $attributes) && (($attributes >> 16) & 0170000) === 0120000) {
                throw new \RuntimeException('Snapshot symlinks cannot be restored.');
            }
            if (isset($seen[$name]) || str_contains($name, '\\') || str_starts_with($name, '/')
                || in_array('..', explode('/', $name), true)) throw new \RuntimeException('Snapshot contains an unsafe or duplicate path.');
            $seen[$name] = true;
            $total += $stat['size'];
            if ($total > SnapshotService::MAX_BYTES || ($name === 'site-control-state.json' && $stat['size'] > 1048576)) {
                throw new \RuntimeException('Snapshot exceeds the supported decompression budget.');
            }
        }
        $entries = [];
        $manifestText = $zip->getFromName('site-control-state.json');
        $manifest = $manifestText === false ? null : json_decode($manifestText, true, 512, JSON_THROW_ON_ERROR);
        if ($manifest !== null && !in_array($manifest['format'] ?? 1, [1, 2], true)) throw new \RuntimeException('Unsupported snapshot format.');
        if (isset($manifest['domain']) && $manifest['domain'] !== 'draft') throw new \RuntimeException('This archive does not contain a restorable draft.');
        // Read and validate the complete archive before touching the current website.
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if (!is_string($name) || str_ends_with($name, '/')) continue;
            if (!preg_match('~^(preview|assets)/(.+)$~', $name, $match)) continue;
            if (!self::isSafeSnapshotRelativePath($match[2]) || isset($entries[$name])) throw new \RuntimeException('Unsafe or duplicate snapshot entry: ' . $name);
            $content = $zip->getFromIndex($i);
            if ($content === false) throw new \RuntimeException('Could not read snapshot entry: ' . $name);
            if (scDraftSnapshotTarget($workspace, $name) === null) continue;
            $base = $match[1] === 'preview' ? $previewDir : $assetsDir;
            if (!self::canWriteSnapshotEntry($base, $match[2])) throw new \RuntimeException('Cannot write snapshot entry: ' . $name . '. Check file permissions.');
            if (isset($manifest['files'][$name]) && hash('sha256', $content) !== $manifest['files'][$name]['sha256']) throw new \RuntimeException('Snapshot entry failed verification: ' . $name);
            $entries[$name] = ['base' => $base, 'relative' => $match[2], 'content' => $content];
        }
        if (!$entries) throw new \RuntimeException('Snapshot contains no restorable website files.');
        foreach ($manifest['directories'] ?? [] as $name => $mode) {
            if (!preg_match('~^(preview|assets)/(.+)$~', $name, $match) || !self::isSafeSnapshotRelativePath($match[2])) throw new \RuntimeException('Unsafe snapshot directory: ' . $name);
            $base = $match[1] === 'preview' ? $previewDir : $assetsDir;
            $target = scDraftSnapshotTarget($workspace, $name);
            if ($target === null) continue;
            $realBase = FilesystemPath::realpath($base); $realTarget = FilesystemPath::realpath($target);
            if ($realTarget !== false && $realBase !== false && !FilesystemPath::contains($realTarget, $realBase)) throw new \RuntimeException('Snapshot directory escapes website boundary: ' . $name);
        }
        foreach ($manifest['files'] ?? [] as $name => $meta) {
            if (scDraftSnapshotTarget($workspace, $name) === null) continue;
            if (!isset($entries[$name])) throw new \RuntimeException('Snapshot is missing a captured file: ' . $name);
        }
        $draftFiles = [];
        foreach ($entries as $name => $entry) $draftFiles[str_starts_with($name, 'preview/') ? substr($name, 8) : $name] = $entry['content'];
        SnapshotService::validateDraftMetadata(['pages' => $manifest['pages'] ?? []], $draftFiles);
        $zip->close();
        $remove = [];
        // Retain uploaded files added after the archive; replace only draft
        // pages and generated CSS/JS. Never traverse public shared assets.
        foreach (scDraftSnapshotEntries($workspace) as $name => $target) {
            if (!is_file($target) || str_ends_with($name, '.gitkeep') || isset($entries[$name])) continue;
            if (!str_starts_with($name, 'preview/') && !str_starts_with($name, 'assets/css/') && !str_starts_with($name, 'assets/js/')) continue;
            if (!is_writable(dirname($target))) throw new \RuntimeException('Cannot remove old draft file: ' . $name);
            $remove[] = $target;
        }
        foreach ($entries as $name => $entry) {
            $target = scDraftSnapshotTarget($workspace, $name);
            if (@file_get_contents($target) !== $entry['content']) {
                $mutated = true; // A failed write may have truncated the destination.
                if (!self::writeSnapshotEntry($entry['base'], $entry['relative'], $entry['content'])) throw new \RuntimeException('Could not write and verify snapshot entry: ' . $name);
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
            $target = scDraftSnapshotTarget($workspace, $name);
            if ($target === null) continue;
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
public static function canWriteSnapshotEntry(string $baseDir, string $relativePath): bool
{
    if (!self::isSafeSnapshotRelativePath($relativePath)) return false;
    $realBase = FilesystemPath::realpath($baseDir);
    if ($realBase === false) return false;
    try { $target = SiteWorkspace::resolveWithin($baseDir, $relativePath); } catch (\RuntimeException) { return false; }
    if (is_link($target) || is_dir($target) || (file_exists($target) && !is_writable($target))) return false;
    $parent = dirname($target);
    while (!file_exists($parent) && dirname($parent) !== $parent) $parent = dirname($parent);
    $realParent = FilesystemPath::realpath($parent);
    return $realParent !== false && is_dir($parent) && is_writable($parent)
        && FilesystemPath::contains($realParent, $realBase);
}

/**
 * Validate a relative path extracted from a snapshot archive.
 */
public static function isSafeSnapshotRelativePath(string $path): bool
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
public static function writeSnapshotEntry(string $baseDir, string $relativePath, string $content): bool
{
    if (!self::canWriteSnapshotEntry($baseDir, $relativePath)) return false;
    $targetPath = SiteWorkspace::resolveWithin($baseDir, $relativePath);
    $parentDir = dirname($targetPath);
    if (!is_dir($parentDir) && !@mkdir($parentDir, 0755, true) && !is_dir($parentDir)) return false;
    if (!self::canWriteSnapshotEntry($baseDir, $relativePath)) return false;
    return @file_put_contents($targetPath, $content, LOCK_EX) === strlen($content)
        && @file_get_contents($targetPath) === $content;
}

/**
 * Remove all files from a directory (non-recursive on top level).
 */
public static function clearDirectory(string $dir, array $keepExtensions = []): void
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
public static function enforceSnapshotLimit(Database $db, Settings $settings, string $snapshotDir, array $currentIds = []): void
{
    \VoxelSite\SnapshotRetention::enforce($db, $settings, $snapshotDir, $currentIds);
}
}
