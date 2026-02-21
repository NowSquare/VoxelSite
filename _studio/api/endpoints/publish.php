<?php

declare(strict_types=1);

/**
 * Publish API Endpoints
 *
 * POST /publish          — Publish preview → production
 * POST /publish/rollback — Rollback to the pre-publish snapshot
 *
 * Publishing copies PHP page files and _partials/ from _studio/preview/
 * to the document root. CSS/JS assets are already shared (in /assets/)
 * so they don't need copying.
 *
 * Every publish automatically creates a pre_publish snapshot first.
 * This is the safety net: one-click rollback if anything goes wrong.
 *
 * This is the moment the user's website goes live. Protect it.
 */

use VoxelSite\Database;
use VoxelSite\Logger;
use VoxelSite\Settings;

$method = $_REQUEST['_route_method'];
$path   = $_REQUEST['_route_path'];

$db       = Database::getInstance();
$settings = new Settings($db);

$previewDir  = dirname(__DIR__, 2) . '/preview';
$docRoot     = dirname(__DIR__, 3);          // The actual document root
$snapshotDir = dirname(__DIR__, 2) . '/data/snapshots';
$manifestPath = dirname(__DIR__, 2) . '/data/published-manifest.json';
$assetsDir   = $docRoot . '/assets';

// Ensure snapshots directory exists
if (!is_dir($snapshotDir)) {
    mkdir($snapshotDir, 0755, true);
}

// ═══════════════════════════════════════════
//  POST /publish — Copy preview → production
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/publish') {
    // Verify there are files to publish
    $previewFiles = collectPreviewPublishFiles($previewDir);
    if (empty($previewFiles)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'nothing_to_publish',
            'message' => 'No pages to publish. Create a website first.',
        ]], 422);
        return;
    }

    // ── Step 1: Create pre-publish snapshot ──
    $snapshot = createPrePublishSnapshot($db, $snapshotDir, $previewDir, $assetsDir, $docRoot);
    if (!($snapshot['ok'] ?? false)) {
        Logger::error('system', 'Pre-publish snapshot failed', [
            'error' => $snapshot['error'] ?? 'Unknown',
        ]);
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'snapshot_failed',
            'message' => 'Publish aborted: could not create pre-publish snapshot. '
                . ($snapshot['error'] ?? 'Unknown snapshot error.'),
        ]], 500);
        return;
    }

    // ── Step 2: Copy preview files to document root ──
    $published = [];
    $removed = [];
    $errors    = [];

    foreach ($previewFiles as $relativePath) {
        $sourcePath = $previewDir . '/' . $relativePath;
        $targetPath = $docRoot . '/' . $relativePath;

        if (!copyFileAtomic($sourcePath, $targetPath)) {
            $errors[] = "Could not publish: {$relativePath}";
            continue;
        }

        // Bust OPcache so PHP-FPM serves the new file immediately.
        // Without this, the old bytecode stays cached and the site
        // appears unchanged until the cache expires.
        if (function_exists('opcache_invalidate')) {
            opcache_invalidate($targetPath, true);
        }

        $published[] = $relativePath;
    }

    // ── Step 2b: Copy .htaccess from preview when provided ──
    $htaccessPreview = $previewDir . '/.htaccess';
    if (file_exists($htaccessPreview)) {
        $htaccessTarget = $docRoot . '/.htaccess';
        if (copyFileAtomic($htaccessPreview, $htaccessTarget)) {
            $published[] = '.htaccess';
        } else {
            $errors[] = 'Could not publish: .htaccess';
        }
    }

    // ── Step 2c: Remove files that were previously published but no longer in preview ──
    $previousManifest = loadJsonFile($manifestPath, ['files' => []]);
    $previousFiles = is_array($previousManifest['files'] ?? null) ? $previousManifest['files'] : [];

    $toRemove = array_values(array_diff($previousFiles, $previewFiles));
    foreach ($toRemove as $relativePath) {
        $targetPath = $docRoot . '/' . $relativePath;
        if (!file_exists($targetPath)) {
            continue;
        }
        if (is_file($targetPath) && @unlink($targetPath)) {
            $removed[] = $relativePath;
        } else {
            $errors[] = "Could not remove stale file: {$relativePath}";
        }
    }

    if (is_dir($docRoot . '/_partials')) {
        $remainingPartials = glob($docRoot . '/_partials/*.php') ?: [];
        if (empty($remainingPartials)) {
            @rmdir($docRoot . '/_partials');
        }
    }

    // Persist manifest of files under publish management.
    saveJsonFile($manifestPath, [
        'files'      => $previewFiles,
        'updated_at' => now(),
    ]);

    if (empty($published) && empty($removed)) {
        Logger::error('system', 'Publish failed — no files published', [
            'errors'        => $errors,
            'preview_files' => $previewFiles,
        ]);
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'publish_failed',
            'message' => 'No files were published. ' . implode(' ', $errors),
        ]], 500);
        return;
    }

    // ── Step 3: Record publish event ──
    $settings->set('last_published_at', now());
    $settings->set('publish_count', (string) ((int) $settings->get('publish_count', '0') + 1));

    // ── Step 3b: Recompile Tailwind + ensure assets reach docroot ──
    // On Forge atomic deployments, the compiler may write to a shared/symlinked
    // assets directory while the web server reads from the release's own assets/.
    // We compile to BOTH the default path and the explicit docroot path.
    $docRootAssets = $docRoot . '/assets';
    try {
        $fileManager = new \VoxelSite\FileManager($db);
        $compileResult = $fileManager->compileTailwind();

        // Also compile directly to the docroot assets path (may be different due to symlinks)
        $compiler = new \VoxelSite\TailwindCompiler();
        $docRootTw = $docRootAssets . '/css/tailwind.css';
        $compileResult2 = $compiler->compile(null, $docRootTw);

        Logger::info('system', 'Publish: Tailwind compiled', [
            'default_ok'    => $compileResult['ok'] ?? false,
            'default_size'  => $compileResult['css_size'] ?? 0,
            'docroot_ok'    => $compileResult2['ok'] ?? false,
            'docroot_size'  => $compileResult2['css_size'] ?? 0,
            'docroot_path'  => $docRootTw,
            'class_count'   => $compileResult2['class_count'] ?? 0,
        ]);
    } catch (\Throwable $e) {
        $errors[] = 'Tailwind compile: ' . $e->getMessage();
    }

    // Copy style.css, JS, data, and forms from the internal assets path to docroot
    // This ensures AI-written assets survive atomic deploys even without shared dirs
    $internalAssetsDir = dirname(__DIR__, 3) . '/assets';
    syncAssetDirectory($internalAssetsDir, $docRootAssets);

    // ── Step 4: Auto-generate AEO files (llms.txt, robots.txt, Schema.org, MCP) ──
    $aeoFiles = [];
    try {
        $aeo = new \VoxelSite\AEOGenerator();
        $siteUrl = rtrim($settings->get('site_url', ''), '/');
        $aeoResult = $aeo->generateAll($siteUrl);
        $aeoFiles = $aeoResult['generated'] ?? [];
    } catch (\Throwable $e) {
        // AEO generation is non-critical — don't fail the publish
        $errors[] = 'AEO generation: ' . $e->getMessage();
    }

    Logger::info('system', 'Publish completed', [
        'published_count' => count($published),
        'removed_count'   => count($removed),
        'error_count'     => count($errors),
        'aeo_files'       => $aeoFiles,
        'snapshot_id'     => $snapshot['id'] ?? null,
        'published'       => $published,
    ]);

    jsonResponse(['ok' => true, 'data' => [
        'message'      => count($published) . ' file(s) published.',
        'published'    => $published,
        'removed'      => $removed,
        'snapshot_id'  => $snapshot['id'] ?? null,
        'aeo_files'    => $aeoFiles,
        'errors'       => $errors,
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /publish/rollback — Rollback to last pre-publish state
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/publish/rollback') {
    // Find the most recent pre_publish snapshot
    $snapshot = $db->queryOne(
        'SELECT * FROM snapshots
         WHERE snapshot_type = ?
         ORDER BY created_at DESC
         LIMIT 1',
        ['pre_publish']
    );

    if (!$snapshot) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'no_snapshot',
            'message' => 'No pre-publish snapshot found. Cannot rollback.',
        ]], 404);
        return;
    }

    $zipPath = $snapshotDir . '/' . $snapshot['filename'];
    if (!file_exists($zipPath)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'snapshot_missing',
            'message' => 'Snapshot file is missing from disk.',
        ]], 404);
        return;
    }

    // Restore the snapshot payload (preview + assets + production).
    $zip = new \ZipArchive();
    if ($zip->open($zipPath) !== true) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'restore_failed',
            'message' => 'Could not open snapshot archive.',
        ]], 500);
        return;
    }

    $snapshotPreview = [];
    $snapshotAssets = [];
    $snapshotProduction = [];

    // Read snapshot entries into memory (validated paths only).
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $entryName = $zip->getNameIndex($i);
        if (!is_string($entryName) || str_ends_with($entryName, '/')) {
            continue;
        }

        $content = $zip->getFromIndex($i);
        if ($content === false) {
            continue;
        }

        if (str_starts_with($entryName, 'preview/')) {
            $relativePath = substr($entryName, strlen('preview/'));
            if (isSafeRelativePath($relativePath)) {
                $snapshotPreview[$relativePath] = $content;
            }
            continue;
        }

        if (str_starts_with($entryName, 'assets/')) {
            $relativePath = substr($entryName, strlen('assets/'));
            if (isSafeRelativePath($relativePath)) {
                $snapshotAssets[$relativePath] = $content;
            }
            continue;
        }

        if (str_starts_with($entryName, 'production/')) {
            $relativePath = substr($entryName, strlen('production/'));
            if (isSafeRelativePath($relativePath)) {
                $snapshotProduction[$relativePath] = $content;
            }
        }
    }

    $zip->close();

    // Reset current state before applying snapshot payload.
    clearDirectoryRecursive($previewDir, ['gitkeep']);
    clearDirectoryRecursive($assetsDir, ['gitkeep']);
    clearProductionManagedFiles($docRoot);

    foreach ($snapshotPreview as $relativePath => $content) {
        writeSnapshotFile($previewDir, $relativePath, $content);
    }
    foreach ($snapshotAssets as $relativePath => $content) {
        writeSnapshotFile($assetsDir, $relativePath, $content);
    }
    foreach ($snapshotProduction as $relativePath => $content) {
        writeSnapshotFile($docRoot, $relativePath, $content);
    }

    // Sync page registry
    $fileManager = new \VoxelSite\FileManager($db);
    $fileManager->syncPageRegistry();
    $fileManager->compileTailwind();

    // Refresh publish manifest to match restored preview state.
    saveJsonFile($manifestPath, [
        'files'      => collectPreviewPublishFiles($previewDir),
        'updated_at' => now(),
    ]);

    jsonResponse(['ok' => true, 'data' => [
        'message'     => 'Rolled back to pre-publish state.',
        'snapshot_id' => $snapshot['id'],
    ]]);
    return;
}

jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Publish endpoint not found.',
]], 404);

// ═══════════════════════════════════════════════════
//  Helper: Create a pre-publish snapshot
// ═══════════════════════════════════════════════════

/**
 * Create a pre-publish snapshot that captures:
 * - Current preview files
 * - Current assets
 * - Current production files managed by publish/aeo
 *
 * This is saved before every publish so the user can
 * always roll back to exactly what they had before.
 */
function createPrePublishSnapshot(
    Database $db,
    string   $snapshotDir,
    string   $previewDir,
    string   $assetsDir,
    string   $docRoot
): array {
    if (!class_exists('ZipArchive')) {
        return ['ok' => false, 'error' => 'ZipArchive not available.'];
    }

    $timestamp = date('Y-m-d_H-i-s');
    $filename  = "snapshot_pre_publish_{$timestamp}.zip";
    $zipPath   = $snapshotDir . '/' . $filename;
    $fileCount = 0;

    $zip = new \ZipArchive();
    if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
        return ['ok' => false, 'error' => 'Could not create archive.'];
    }

    // Add current preview files
    if (is_dir($previewDir)) {
        $fileCount += addDirToZip($zip, $previewDir, 'preview');
    }

    // Add current assets
    if (is_dir($assetsDir)) {
        $fileCount += addDirToZip($zip, $assetsDir, 'assets');
    }

    // Add current production PHP page files
    $prodPhpFiles = glob($docRoot . '/*.php');
    if ($prodPhpFiles) {
        foreach ($prodPhpFiles as $phpFile) {
            // Skip _studio entry point
            if (basename($phpFile) === '_studio.php') continue;
            $zip->addFile($phpFile, 'production/' . basename($phpFile));
            $fileCount++;
        }
    }

    // Add current production _partials/ directory
    $prodPartialsDir = $docRoot . '/_partials';
    if (is_dir($prodPartialsDir)) {
        $partialFiles = glob($prodPartialsDir . '/*');
        if ($partialFiles) {
            foreach ($partialFiles as $partial) {
                if (is_file($partial)) {
                    $zip->addFile($partial, 'production/_partials/' . basename($partial));
                    $fileCount++;
                }
            }
        }
    }

    // Add publish/aeo root files that may change during publish.
    $prodExtraFiles = ['.htaccess', 'llms.txt', 'robots.txt', 'sitemap.xml', 'mcp.php'];
    foreach ($prodExtraFiles as $filename) {
        $fullPath = $docRoot . '/' . $filename;
        if (is_file($fullPath)) {
            $zip->addFile($fullPath, 'production/' . $filename);
            $fileCount++;
        }
    }

    $zip->close();

    $sizeBytes = filesize($zipPath);

    $id = $db->insert('snapshots', [
        'filename'      => $filename,
        'snapshot_type'  => 'pre_publish',
        'label'         => 'Before publish',
        'description'   => 'Auto-created before publishing to production.',
        'file_count'    => $fileCount,
        'size_bytes'    => $sizeBytes,
        'created_by'    => $_REQUEST['_user']['id'] ?? null,
        'created_at'    => now(),
    ]);

    return ['ok' => true, 'id' => $id, 'filename' => $filename];
}

/**
 * Recursively add directory contents to a ZIP archive.
 */
function addDirToZip(\ZipArchive $zip, string $dir, string $prefix): int
{
    $count = 0;
    $iterator = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
        \RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($iterator as $file) {
        if ($file->isFile()) {
            $realPath = $file->getRealPath();
            $relativePath = $prefix . '/' . ltrim(
                str_replace($dir, '', $realPath),
                DIRECTORY_SEPARATOR
            );
            $relativePath = str_replace('\\', '/', $relativePath);
            $zip->addFile($realPath, $relativePath);
            $count++;
        }
    }

    return $count;
}

/**
 * Collect files managed by publish from preview.
 *
 * Includes:
 * - root-level *.php pages
 * - _partials/*.php shared files
 *
 * @return array<int, string>
 */
function collectPreviewPublishFiles(string $previewDir): array
{
    $files = [];

    foreach (glob($previewDir . '/*.php') ?: [] as $file) {
        $files[] = basename($file);
    }

    foreach (glob($previewDir . '/_partials/*.php') ?: [] as $file) {
        $files[] = '_partials/' . basename($file);
    }

    $files = array_values(array_unique($files));
    sort($files);

    return $files;
}

function copyFileAtomic(string $sourcePath, string $targetPath): bool
{
    if (!file_exists($sourcePath)) {
        return false;
    }

    $dir = dirname($targetPath);
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        return false;
    }

    $content = file_get_contents($sourcePath);
    if ($content === false) {
        return false;
    }

    $tmpPath = $targetPath . '.tmp_' . uniqid('', true);
    if (file_put_contents($tmpPath, $content) === false) {
        @unlink($tmpPath);
        return false;
    }

    if (!rename($tmpPath, $targetPath)) {
        @unlink($tmpPath);
        return false;
    }

    return true;
}

/**
 * Sync asset files from one directory to another.
 *
 * Used during publish to copy compiled CSS/JS from the internal assets
 * path (which may be a shared/symlinked directory on Forge) to the
 * document root's assets directory (which may be a different directory
 * in each atomic release).
 *
 * Only copies files that are missing or differ (size/hash check).
 * Skips .gitkeep and hidden files.
 *
 * @return array<int, string> Relative paths of files that were synced
 */
function syncAssetDirectory(string $sourceDir, string $targetDir): array
{
    $synced = [];
    $subdirs = ['css', 'js', 'data', 'forms'];

    foreach ($subdirs as $subdir) {
        $srcSub = $sourceDir . '/' . $subdir;
        if (!is_dir($srcSub)) {
            continue;
        }

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($srcSub, FilesystemIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $file) {
            if (!$file->isFile()) {
                continue;
            }

            $relativePath = $subdir . '/' . $iterator->getSubPathname();

            // Skip gitkeep and hidden files
            $basename = $file->getBasename();
            if ($basename === '.gitkeep' || str_starts_with($basename, '.')) {
                continue;
            }

            $target = $targetDir . '/' . $relativePath;

            // Skip if target is identical (fast size check, then hash)
            if (file_exists($target)
                && filesize($target) === $file->getSize()
                && md5_file($target) === md5_file($file->getPathname())) {
                continue;
            }

            $dir = dirname($target);
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }

            if (copy($file->getPathname(), $target)) {
                $synced[] = $relativePath;
            }
        }
    }

    return $synced;
}

/**
 * Validate a relative path extracted from a snapshot archive.
 */
function isSafeRelativePath(string $path): bool
{
    if ($path === '' || str_contains($path, "\0")) {
        return false;
    }
    if (str_starts_with($path, '/') || str_contains($path, '../') || str_contains($path, '/./')) {
        return false;
    }
    if (!preg_match('/^[A-Za-z0-9._\/-]+$/', $path)) {
        return false;
    }

    return true;
}

/**
 * Clear all files in a directory recursively.
 *
 * @param array<int, string> $keepExtensions
 */
function clearDirectoryRecursive(string $dir, array $keepExtensions = []): void
{
    if (!is_dir($dir)) {
        return;
    }

    $iterator = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
        \RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($iterator as $item) {
        if ($item->isFile()) {
            $ext = ltrim($item->getExtension(), '.');
            if (!in_array($ext, $keepExtensions, true)) {
                @unlink($item->getPathname());
            }
        } elseif ($item->isDir()) {
            @rmdir($item->getPathname());
        }
    }
}

/**
 * Write a snapshot file into a base directory with boundary checks.
 */
function writeSnapshotFile(string $baseDir, string $relativePath, string $content): bool
{
    if (!isSafeRelativePath($relativePath)) {
        return false;
    }

    $targetPath = rtrim($baseDir, '/') . '/' . $relativePath;
    $parentDir = dirname($targetPath);

    if (!is_dir($parentDir) && !mkdir($parentDir, 0755, true) && !is_dir($parentDir)) {
        return false;
    }

    $realBase = realpath($baseDir) ?: $baseDir;
    $realParent = realpath($parentDir) ?: $parentDir;

    // Check containment via logical path first (handles symlinks),
    // then via resolved path as fallback
    $normParent = rtrim(str_replace('//', '/', $realParent), '/');
    $normBase = rtrim(str_replace('//', '/', $realBase), '/');
    if (!str_starts_with($normParent . '/', $normBase . '/') && $normParent !== $normBase) {
        // Try with the unresolved paths
        $logicalParent = rtrim(str_replace('//', '/', $parentDir), '/');
        $logicalBase = rtrim(str_replace('//', '/', $baseDir), '/');
        if (!str_starts_with($logicalParent . '/', $logicalBase . '/') && $logicalParent !== $logicalBase) {
            return false;
        }
    }

    return file_put_contents($targetPath, $content) !== false;
}

/**
 * Clear production files managed by publish/rollback.
 */
function clearProductionManagedFiles(string $docRoot): void
{
    $preserveRootPhp = ['_studio.php', 'submit.php', 'LocalValetDriver.php'];

    foreach (glob($docRoot . '/*.php') ?: [] as $phpFile) {
        $name = basename($phpFile);
        if (in_array($name, $preserveRootPhp, true)) {
            continue;
        }
        @unlink($phpFile);
    }

    $partialsDir = $docRoot . '/_partials';
    if (is_dir($partialsDir)) {
        clearDirectoryRecursive($partialsDir, ['gitkeep']);
        $remaining = glob($partialsDir . '/*') ?: [];
        if (empty($remaining)) {
            @rmdir($partialsDir);
        }
    }

    foreach (['.htaccess', 'llms.txt', 'robots.txt', 'sitemap.xml', 'mcp.php'] as $file) {
        $fullPath = $docRoot . '/' . $file;
        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }
}

/**
 * @return array<string, mixed>
 */
function loadJsonFile(string $path, array $fallback = []): array
{
    if (!file_exists($path)) {
        return $fallback;
    }

    $raw = file_get_contents($path);
    if ($raw === false || trim($raw) === '') {
        return $fallback;
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $fallback;
}

/**
 * @param array<string, mixed> $data
 */
function saveJsonFile(string $path, array $data): bool
{
    $dir = dirname($path);
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        return false;
    }

    $encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($encoded === false) {
        return false;
    }

    $tmp = $path . '.tmp.' . getmypid();
    if (file_put_contents($tmp, $encoded . "\n") === false) {
        @unlink($tmp);
        return false;
    }

    if (!rename($tmp, $path)) {
        @unlink($tmp);
        return false;
    }

    return true;
}
