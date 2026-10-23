<?php

declare(strict_types=1);

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\SiteWorkspace;
use VoxelSite\SiteMutationLock;

/** Capture permissions and ownership before a mutation can remove the original inode. */
function scSnapshotMetadata(string $path): array
{
    clearstatcache(true, $path);
    if (is_link($path)) throw new \RuntimeException('Cannot snapshot a symlink.');
    $stat = @stat($path);
    if ($stat === false) throw new \RuntimeException('Could not read snapshot file metadata: ' . basename($path));
    $metadata = ['mode' => $stat['mode'] & 07777, 'uid' => $stat['uid'], 'gid' => $stat['gid']];
    if (is_file($path)) {
        $hash = @hash_file('sha256', $path);
        if ($hash === false) throw new \RuntimeException('Could not read snapshot file: ' . basename($path));
        $metadata['sha256'] = $hash;
    }
    return $metadata;
}

/** Older archives contain only directory modes and no original ownership. */
function scRestoreSnapshotMetadata(string $path, array|int $metadata, string $entry): void
{
    if (is_int($metadata)) $metadata = ['mode' => $metadata];
    if (is_link($path)) throw new \RuntimeException('Could not restore snapshot metadata through a symlink: ' . $entry);
    clearstatcache(true, $path);
    $stat = @stat($path);
    if ($stat === false) throw new \RuntimeException('Could not verify snapshot metadata: ' . $entry);
    foreach (['uid' => 'chown', 'gid' => 'chgrp'] as $field => $function) {
        if (!array_key_exists($field, $metadata)) continue;
        $wanted = $metadata[$field];
        if (!is_int($wanted) || $wanted < 0) throw new \RuntimeException('Invalid snapshot ownership: ' . $entry);
        if ($stat[$field] !== $wanted) {
            if (!function_exists($function) || !@$function($path, $wanted)) {
                throw new \RuntimeException('Could not restore snapshot ownership: ' . $entry . '. Check file ownership and hosting permissions.');
            }
            clearstatcache(true, $path);
            $stat = @stat($path);
            if ($stat === false || $stat[$field] !== $wanted) throw new \RuntimeException('Restored snapshot ownership failed verification: ' . $entry);
        }
    }
    $mode = $metadata['mode'] ?? null;
    if (!is_int($mode) || $mode < 0 || $mode > 07777) throw new \RuntimeException('Invalid snapshot permissions: ' . $entry);
    if (($stat['mode'] & 07777) !== $mode && !@chmod($path, $mode)) throw new \RuntimeException('Could not restore snapshot permissions: ' . $entry);
    clearstatcache(true, $path);
    $actual = @stat($path);
    if ($actual === false || ($actual['mode'] & 07777) !== $mode
        || (isset($metadata['uid']) && $actual['uid'] !== $metadata['uid'])
        || (isset($metadata['gid']) && $actual['gid'] !== $metadata['gid'])) {
        throw new \RuntimeException('Restored snapshot metadata failed verification: ' . $entry);
    }
}

/**
 * Create a pre-mutation safety snapshot.
 *
 * Shared by deterministic mutation endpoints and crash recovery without dispatching an endpoint.
 */
function createSiteControlSnapshot(Database $db, string $label, string $description, ?int $createdBy = null, ?SiteWorkspace $workspace = null): array
{
    if (!class_exists('ZipArchive')) {
        return ['ok' => false, 'error' => 'ZipArchive extension is not installed.'];
    }

    $snapshotDir = getenv('VS_TEST_SNAPSHOT_DIR') ?: dirname(__DIR__) . '/data/snapshots';
    $workspace ??= new SiteWorkspace($db);
    $lock = SiteMutationLock::acquire($workspace->mutationLockPath(), $db);
    $workspace->assertReady();
    $previewDir = $workspace->draftRoot();
    $assetsDir = $workspace->draftAssetsRoot();

    if (!is_dir($snapshotDir)) {
        mkdir($snapshotDir, 0755, true);
    }

    $timestamp = date('Y-m-d_H-i-s');
    $filename  = "snapshot_auto_{$timestamp}_" . bin2hex(random_bytes(8)) . ".zip";
    $zipPath   = $snapshotDir . '/' . $filename;
    $fileCount = 0;

    $zip = new \ZipArchive();
    if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::EXCL) !== true) {
        return ['ok' => false, 'error' => 'Could not create snapshot archive.'];
    }

    try {
    $state = ['format' => 2, 'domain' => 'draft',
        'pages' => $db->query('SELECT * FROM pages ORDER BY id'),
        'collection_indexes' => $db->query('SELECT id, index_page_id FROM collections ORDER BY id'),
        'files' => [], 'directories' => []];
    foreach (scDraftSnapshotEntries($workspace) as $entry => $target) {
        if (is_dir($target)) {
            $state['directories'][$entry] = scSnapshotMetadata($target);
        } else {
            $state['files'][$entry] = scSnapshotMetadata($target);
            if (!$zip->addFile($target, $entry)) throw new \RuntimeException('Cannot capture draft file: ' . $entry);
            $fileCount++;
        }
    }
    if (!$zip->addFromString('site-control-state.json', json_encode($state, JSON_THROW_ON_ERROR)) || !$zip->close()) {
        @unlink($zipPath);
        return ['ok' => false, 'error' => 'Could not finish safety snapshot archive.'];
    }

    if ($fileCount === 0) {
        @unlink($zipPath);
        return ['ok' => false, 'error' => 'Nothing to snapshot — no files found.'];
    }

    $verifyZip = new \ZipArchive();
    if ($verifyZip->open($zipPath) !== true) throw new \RuntimeException('Could not verify safety snapshot archive.');
    foreach ($state['files'] as $entry => $meta) {
        $captured = $verifyZip->getFromName($entry);
        if ($captured === false || hash('sha256', $captured) !== $meta['sha256']) {
            $verifyZip->close();
            throw new \RuntimeException('Safety snapshot did not capture every file: ' . $entry);
        }
    }
    $verifyZip->close();
    $sizeBytes = filesize($zipPath);

    $id = $db->insert('snapshots', [
        'filename'       => $filename,
        'snapshot_type'  => 'auto',
        'label'          => $label ?: null,
        'description'    => $description ?: null,
        'file_count'     => $fileCount,
        'size_bytes'     => $sizeBytes,
        'created_by'     => $createdBy ?? $_REQUEST['_user']['id'] ?? null,
        'created_at'     => now(),
    ]);
    \VoxelSite\SiteMutationJournal::attachSnapshot($id);
    \VoxelSite\SnapshotRetention::enforce($db, new \VoxelSite\Settings($db), $snapshotDir, [$id]);

    // Test hook: after snapshot is safely captured, delete a page file to
    // force a write failure in the subsequent updatePage call. This lets
    // the test exercise the real rollback path end-to-end.
    // VS_TEST_SABOTAGE_FILE is never set in production.
    $sabotageFile = getenv('VS_TEST_SABOTAGE_FILE');
    if ($sabotageFile !== false && $sabotageFile !== '') {
        $sabotageTarget = $workspace->resolveDraft($sabotageFile, true);
        if (file_exists($sabotageTarget)) {
            @unlink($sabotageTarget);
        }
    }

    return [
        'ok'       => true,
        'snapshot' => [
            'id'       => $id,
            'filename' => $filename,
        ],
    ];
    } catch (\Throwable $error) {
        try { $zip->close(); } catch (\Throwable) {}
        if (!isset($id)) @unlink($zipPath);
        return ['ok' => false, 'error' => $error->getMessage() . (isset($id) ? ' No website files changed. Safety snapshot #' . $id . ' remains in Designs → History.' : '')];
    }
}

/**
 * Attempt to restore from a snapshot by ID.
 */
function restoreSiteControlSnapshot(Database $db, int $snapshotId, ?SiteWorkspace $workspace = null): array
{
    $snapshot = $db->queryOne('SELECT * FROM snapshots WHERE id = ?', [$snapshotId]);
    if (!$snapshot) {
        return ['ok' => false, 'error' => 'Snapshot record not found.'];
    }

    $snapshotDir = getenv('VS_TEST_SNAPSHOT_DIR') ?: dirname(__DIR__) . '/data/snapshots';
    $workspace ??= new SiteWorkspace($db);
    $lock = SiteMutationLock::acquire($workspace->mutationLockPath(), $db);
    $workspace->assertReady();
    $previewDir = $workspace->draftRoot();
    $assetsDir = $workspace->draftAssetsRoot();

    $zipPath = SiteWorkspace::resolveWithin($snapshotDir, $snapshot['filename']);
    if (!file_exists($zipPath)) {
        return ['ok' => false, 'error' => 'Snapshot ZIP file is missing.'];
    }

    $zip = new \ZipArchive();
    if ($zip->open($zipPath) !== true) {
        return ['ok' => false, 'error' => 'Could not open snapshot archive.'];
    }

    try {
        $state = json_decode($zip->getFromName('site-control-state.json') ?: '', true, 512, JSON_THROW_ON_ERROR);
        if (isset($state['domain']) && $state['domain'] !== 'draft') {
            throw new \RuntimeException('This archive does not contain a draft restoration domain.');
        }
        if (!is_array($state['files'] ?? null) || !is_array($state['pages'] ?? null)) {
            throw new \RuntimeException('Safety snapshot has no verified restoration manifest.');
        }
        $contents = [];
        // Validate the complete archive before replacing any current file.
        foreach ($state['files'] as $entry => $meta) {
            if (!preg_match('~^(preview|assets)/(.+)$~', $entry, $match) || in_array('..', explode('/', $match[2]), true)) {
                throw new \RuntimeException('Unsafe archive path.');
            }
            $content = $zip->getFromName($entry);
            if ($content === false || hash('sha256', $content) !== $meta['sha256']) {
                throw new \RuntimeException('Safety snapshot entry failed verification: ' . $entry);
            }
            $contents[$entry] = $content;
        }
        $zip->close();
        // Legacy safety snapshots may contain shared immutable files. Their
        // bytes were validated above, but restoring a draft never replaces them.
        $wantedFiles = []; $wantedDirectories = [];
        foreach ($contents as $entry => $content) {
            $target = scDraftSnapshotTarget($workspace, $entry);
            if ($target !== null) $wantedFiles[$entry] = $target;
        }
        foreach ($state['directories'] ?? [] as $entry => $metadata) {
            $target = scDraftSnapshotTarget($workspace, $entry);
            if ($target !== null) $wantedDirectories[$entry] = $target;
        }
        $current = scDraftSnapshotEntries($workspace);
        $files = new FileManager($db, $workspace);
        // Restoration also changes directory metadata and page projections.
        // Invalidate before the first possible mutation; nested exact writes
        // share this lock and do not advance the legacy version again.
        $workspace->invalidateDraft();
        foreach ($current as $entry => $target) {
            if (is_file($target) && !isset($wantedFiles[$entry])) {
                $files->deleteFile(str_starts_with($entry, 'preview/') ? substr($entry, 8) : $entry);
            }
        }
        foreach (array_reverse($current, true) as $entry => $target) {
            if (is_dir($target) && !isset($wantedDirectories[$entry]) && !rmdir($target)) {
                throw new \RuntimeException('Could not remove new draft directory: ' . $entry);
            }
        }
        foreach ($wantedDirectories as $entry => $target) {
            if (!is_dir($target) && !mkdir($target, 0755, true)) throw new \RuntimeException('Could not restore directory: ' . $entry);
        }
        foreach ($wantedFiles as $entry => $target) {
            $target = scDraftSnapshotTarget($workspace, $entry);
            if (!is_dir(dirname($target)) && !mkdir(dirname($target), 0755, true)) throw new \RuntimeException('Could not create restoration directory.');
            if (@file_get_contents($target) !== $contents[$entry]) {
                $files->writeExactFile(str_starts_with($entry, 'preview/') ? substr($entry, 8) : $entry, $contents[$entry]);
            }
            scRestoreSnapshotMetadata($target, $state['files'][$entry], $entry);
            if (hash_file('sha256', $target) !== $state['files'][$entry]['sha256']) throw new \RuntimeException('Restored file failed verification: ' . $entry);
        }
        foreach (array_reverse($wantedDirectories, true) as $entry => $target) {
            scRestoreSnapshotMetadata($target, $state['directories'][$entry], $entry);
        }
        scRestoreProjection($db, $state);
    } catch (\Throwable $error) {
        return ['ok' => false, 'error' => $error->getMessage()];
    }

    return ['ok' => true];
}

/** Canonical draft entries without duplicate assets or server access controls. */
function scDraftSnapshotEntries(SiteWorkspace $workspace): array
{
    $entries = [];
    foreach (['preview' => $workspace->draftRoot(), 'assets' => $workspace->draftAssetsRoot()] as $prefix => $root) {
        $inventory = SiteWorkspace::inventory($root, $prefix === 'preview' ? ['assets', '.htaccess', '.user.ini'] : ['library', 'icons']);
        foreach (array_keys($inventory['directories'] + $inventory['files']) as $relative) {
            $entry = $prefix . '/' . $relative;
            $entries[$entry] = scDraftSnapshotTarget($workspace, $entry);
        }
    }
    uksort($entries, static fn(string $a, string $b): int => substr_count($a, '/') <=> substr_count($b, '/') ?: strcmp($a, $b));
    return $entries;
}

/** Null marks immutable/access-control material omitted from legacy draft restoration. */
function scDraftSnapshotTarget(SiteWorkspace $workspace, string $entry): ?string
{
    if (!preg_match('~^(preview|assets)/(.+)$~D', $entry, $match)) throw new \RuntimeException('Unsafe archive path.');
    $relative = SiteWorkspace::normalizeRelative($match[2]);
    if ($match[1] === 'preview' && ($relative === 'assets' || str_starts_with($relative, 'assets/')
        || in_array($relative, ['.htaccess', '.user.ini'], true))) return null;
    $sitePath = $match[1] === 'assets' ? 'assets/' . $relative : $relative;
    if ($workspace->isImmutable($sitePath)) return null;
    return $workspace->resolveDraft($sitePath, true);
}

/**
 * Recursively add a directory to a ZipArchive.
 */
function scZipAddDir(\ZipArchive $zip, string $dir, string $prefix): int
{
    SiteWorkspace::inventory($dir);
    $count = 0;
    $realDir = realpath($dir) ?: $dir;
    $it = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
        \RecursiveIteratorIterator::LEAVES_ONLY
    );
    foreach ($it as $file) {
        if ($file->isLink()) continue;
        if ($file->isFile()) {
            $real = $file->getRealPath();
            $rel  = $prefix . '/' . ltrim(str_replace($realDir, '', $real), DIRECTORY_SEPARATOR);
            if (!$zip->addFile($real, str_replace('\\', '/', $rel))) {
                throw new \RuntimeException('Could not capture safety snapshot file: ' . $rel);
            }
            $count++;
        }
    }
    return $count;
}

/**
 * Recursively remove files from a directory.
 */
function scClearDir(string $dir, array $keepExtensions = []): void
{
    if (!is_dir($dir)) return;
    SiteWorkspace::inventory($dir);
    $it = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
        \RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($it as $item) {
        if ($item->isFile()) {
            if (!in_array(ltrim($item->getExtension(), '.'), $keepExtensions, true)) {
                @unlink($item->getRealPath());
            }
        }
    }
}


/** Restore captured operational relationships without executing a user page. */
function scRestoreProjection(Database $db, array $state): void
{
    // Restore the operational projection exactly, including stable node IDs.
    $pdo = $db->getPdo();
    $ownsTransaction = !$pdo->inTransaction();
    if ($ownsTransaction) $pdo->beginTransaction();
    try {
        $wantedIds = array_column($state['pages'], 'id');
        foreach ($db->query('SELECT id FROM pages') as $current) {
            if (!in_array($current['id'], $wantedIds, true)) $db->delete('pages', 'id = ?', [$current['id']]);
        }
        // Keep surviving rows in place so unrelated foreign keys remain intact.
        foreach ($state['pages'] as $page) {
            $id = $page['id'];
            $page['nav_parent_id'] = null;
            if ($db->queryOne('SELECT id FROM pages WHERE id = ?', [$id])) {
                $db->update('pages', $page, 'id = ?', [$id]);
            } else {
                $db->insert('pages', $page);
            }
        }
        foreach ($state['pages'] as $page) {
            if ($page['nav_parent_id'] !== null) $db->update('pages', ['nav_parent_id' => $page['nav_parent_id']], 'id = ?', [$page['id']]);
        }
        foreach ($state['collection_indexes'] ?? [] as $collection) {
            $db->update('collections', ['index_page_id'=>$collection['index_page_id']], 'id = ?', [$collection['id']]);
            $actual = $db->queryOne('SELECT index_page_id FROM collections WHERE id = ?', [$collection['id']]);
            if ($actual === null || $actual['index_page_id'] !== $collection['index_page_id']) {
                throw new \RuntimeException('Restored collection index association failed verification.');
            }
        }
        if ($ownsTransaction) $pdo->commit();
    } catch (\Throwable $error) {
        if ($ownsTransaction) $pdo->rollBack();
        throw $error;
    }
    // Retained manifests sort object keys; SQL column order is not part of the
    // projection. Preserve strict value and row-order comparison after sorting
    // only the column keys on each side.
    $canonicalRows = static function (array $rows): array {
        foreach ($rows as &$row) ksort($row, SORT_STRING);
        unset($row);
        return $rows;
    };
    if ($canonicalRows($db->query('SELECT * FROM pages ORDER BY id')) !== $canonicalRows($state['pages'])) {
        throw new \RuntimeException('Restored page projection failed verification.');
    }
}
