<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * PublishService — shared publish orchestration logic.
 *
 * Extracted from _studio/api/endpoints/publish.php so both the
 * Studio UI and the Agent API can trigger publishing through
 * the same pipeline.
 */
class PublishService
{
    private Database $db;
    private Settings $settings;
    private string $previewDir;
    private string $docRoot;
    private string $snapshotDir;
    private string $manifestPath;
    private string $assetsDir;

    public function __construct(?Database $db = null, ?Settings $settings = null)
    {
        $this->db = $db ?? Database::getInstance();
        $this->settings = $settings ?? new Settings($this->db);

        $studioDir = dirname(__DIR__);
        $this->previewDir   = $studioDir . '/preview';
        $this->docRoot      = dirname($studioDir, 1);
        $this->snapshotDir  = $studioDir . '/data/snapshots';
        $this->manifestPath = $studioDir . '/data/published-manifest.json';
        $this->assetsDir    = $this->docRoot . '/assets';

        if (!is_dir($this->snapshotDir)) {
            mkdir($this->snapshotDir, 0755, true);
        }
    }

    /**
     * Execute the full publish pipeline.
     *
     * Steps:
     * 1. Verify preview files exist
     * 2. Create pre-publish snapshot (optional)
     * 3. Copy preview → production
     * 4. Remove stale files
     * 5. Recompile Tailwind + sync assets
     * 6. Generate AEO files
     * 7. Deploy Actions Bar (if active)
     * 8. Update publish state
     *
     * @param bool $createSnapshot Whether to create a pre-publish snapshot
     * @param string $source The source of the publish operation (studio, api)
     * @return array Response data
     * @throws \RuntimeException on critical failures
     */
    public function publish(bool $createSnapshot = true, string $source = 'studio'): array
    {
        // Step 1: Verify files
        $previewFiles = $this->collectPreviewPublishFiles();
        if (empty($previewFiles)) {
            throw new \RuntimeException('No pages to publish. Create a website first.', 422);
        }

        // Step 2: Snapshot
        $snapshot = ['ok' => true, 'id' => null];
        if ($createSnapshot) {
            $snapshot = $this->createPrePublishSnapshot();
            if (!($snapshot['ok'] ?? false)) {
                throw new \RuntimeException(
                    'Publish aborted: could not create pre-publish snapshot. '
                    . ($snapshot['error'] ?? 'Unknown snapshot error.'),
                    500
                );
            }
        }

        // Step 3: Copy preview → production
        $published = [];
        $removed   = [];
        $errors    = [];

        foreach ($previewFiles as $relativePath) {
            $sourcePath = $this->previewDir . '/' . $relativePath;
            $targetPath = $this->docRoot . '/' . $relativePath;

            if (!$this->copyFileAtomic($sourcePath, $targetPath)) {
                $errors[] = "Could not publish: {$relativePath}";
                continue;
            }

            if (function_exists('opcache_invalidate')) {
                opcache_invalidate($targetPath, true);
            }

            $published[] = $relativePath;
        }

        // .htaccess
        $htaccessPreview = $this->previewDir . '/.htaccess';
        if (file_exists($htaccessPreview)) {
            if ($this->copyFileAtomic($htaccessPreview, $this->docRoot . '/.htaccess')) {
                $published[] = '.htaccess';
            } else {
                $errors[] = 'Could not publish: .htaccess';
            }
        }

        // Step 4: Remove stale files
        $previousManifest = $this->loadJsonFile($this->manifestPath, ['files' => []]);
        $previousFiles = is_array($previousManifest['files'] ?? null) ? $previousManifest['files'] : [];
        $toRemove = array_values(array_diff($previousFiles, $previewFiles));

        foreach ($toRemove as $relativePath) {
            $targetPath = $this->docRoot . '/' . $relativePath;
            if (!file_exists($targetPath)) {
                continue;
            }
            if (is_file($targetPath) && @unlink($targetPath)) {
                $removed[] = $relativePath;
            } else {
                $errors[] = "Could not remove stale file: {$relativePath}";
            }
        }

        if (is_dir($this->docRoot . '/_partials')) {
            $remainingPartials = glob($this->docRoot . '/_partials/*.php') ?: [];
            if (empty($remainingPartials)) {
                @rmdir($this->docRoot . '/_partials');
            }
        }

        // Asset hashes + manifest
        $assetHashes = $this->collectAssetHashes();
        $this->saveJsonFile($this->manifestPath, [
            'files'        => $previewFiles,
            'asset_hashes' => $assetHashes,
            'updated_at'   => now(),
        ]);

        if (empty($published) && empty($removed)) {
            throw new \RuntimeException(
                'No files were published. ' . implode(' ', $errors),
                500
            );
        }

        // Step 5: Tailwind + asset sync
        $fileManager = new FileManager($this->db);
        try {
            $fileManager->compileTailwind();
            $compiler = new TailwindCompiler();
            $compiler->compile(null, $this->assetsDir . '/css/tailwind.css');
        } catch (\Throwable $e) {
            $errors[] = 'Tailwind compile: ' . $e->getMessage();
        }

        $internalAssetsDir = dirname(__DIR__, 2) . '/assets';
        if (is_dir($internalAssetsDir) && function_exists('syncAssetDirectory')) {
            syncAssetDirectory($internalAssetsDir, $this->assetsDir);
        }

        // Step 6: AEO generation  
        $aeoFiles = [];
        try {
            $aeo = new AEOGenerator();
            $siteUrl = rtrim($this->settings->get('site_url', ''), '/');
            if (empty($siteUrl) && !empty($_SERVER['HTTP_HOST'])) {
                $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
                $siteUrl = $scheme . '://' . $_SERVER['HTTP_HOST'];
            }
            $aeoResult = $aeo->generateAll($siteUrl);
            $aeoFiles = $aeoResult['generated'] ?? [];
        } catch (\Throwable $e) {
            $errors[] = 'AEO generation: ' . $e->getMessage();
        }

        // Step 7: Actions Bar
        $agenticFiles = [];
        try {
            if ($fileManager->hasActiveActions()) {
                $fileManager->ensureShippedActionsBar($this->docRoot);
                $agenticFiles[] = 'actions-bar.js';
                $agenticFiles[] = 'actions-bar.css';

                $actionManager = new ActionManager();
                $manifest = $actionManager->generateManifest();
                if ($manifest !== null) {
                    $actionsDir = $this->docRoot . '/actions';
                    if (!is_dir($actionsDir)) {
                        mkdir($actionsDir, 0755, true);
                    }
                    file_put_contents(
                        $actionsDir . '/manifest.json',
                        json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
                    );
                    $agenticFiles[] = 'actions/manifest.json';
                }

                $submitSource = dirname(__DIR__) . '/static/actions-submit.php';
                if (file_exists($submitSource)) {
                    $actionsDir = $this->docRoot . '/actions';
                    if (!is_dir($actionsDir)) {
                        mkdir($actionsDir, 0755, true);
                    }
                    copy($submitSource, $actionsDir . '/submit.php');
                    $agenticFiles[] = 'actions/submit.php';
                }

                $i18nSource = dirname(__DIR__) . '/static/i18n';
                if (is_dir($i18nSource)) {
                    $publicI18nRoot = $this->docRoot . '/i18n';
                    if (!is_dir($publicI18nRoot)) {
                        mkdir($publicI18nRoot, 0755, true);
                    }

                    $legacyI18nRoot = $this->docRoot . '/actions/i18n';

                    foreach (glob($i18nSource . '/*', GLOB_ONLYDIR) ?: [] as $localeDir) {
                        $locale = basename($localeDir);
                        $localeDest = $publicI18nRoot . '/' . $locale;

                        if (!is_dir($localeDest)) {
                            mkdir($localeDest, 0755, true);
                        }

                        foreach (glob($localeDir . '/*.json') ?: [] as $namespaceFile) {
                            $filename = basename($namespaceFile);
                            copy($namespaceFile, $localeDest . '/' . $filename);
                            $agenticFiles[] = 'i18n/' . $locale . '/' . $filename;

                            if ($filename === 'actions.json') {
                                if (!is_dir($legacyI18nRoot)) {
                                    mkdir($legacyI18nRoot, 0755, true);
                                }
                                copy($namespaceFile, $legacyI18nRoot . '/' . $locale . '.json');
                                $agenticFiles[] = 'actions/i18n/' . $locale . '.json';
                            }
                        }
                    }
                }

                $fileManager->injectActionsBarIntoFooter($this->docRoot);
                $fileManager->injectActionsBarIntoFooter(null);
            }
        } catch (\Throwable $e) {
            $errors[] = 'Actions Bar deployment: ' . $e->getMessage();
        }

        // Step 8: Update publish state
        $this->settings->set('last_published_at', now());
        $this->settings->set('publish_count', (string) ((int) $this->settings->get('publish_count', '0') + 1));

        Logger::info('system', 'Publish completed', [
            'source'          => $source,
            'published_count' => count($published),
            'removed_count'   => count($removed),
            'error_count'     => count($errors),
            'aeo_files'       => $aeoFiles,
            'agentic_files'   => $agenticFiles,
            'snapshot_id'     => $snapshot['id'] ?? null,
        ]);

        return [
            'message'       => count($published) . ' file(s) published.',
            'published'     => $published,
            'removed'       => $removed,
            'snapshot_id'   => $snapshot['id'] ?? null,
            'aeo_files'     => $aeoFiles,
            'agentic_files' => $agenticFiles,
            'errors'        => $errors,
        ];
    }

    // ═══════════════════════════════════════════
    //  Private Helpers
    // ═══════════════════════════════════════════

    private function collectPreviewPublishFiles(): array
    {
        $files = [];
        foreach (glob($this->previewDir . '/*.php') ?: [] as $file) {
            $files[] = basename($file);
        }
        foreach (glob($this->previewDir . '/_partials/*.php') ?: [] as $file) {
            $files[] = '_partials/' . basename($file);
        }
        $files = array_values(array_unique($files));
        sort($files);
        return $files;
    }

    private function copyFileAtomic(string $sourcePath, string $targetPath): bool
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

    private function collectAssetHashes(): array
    {
        $hashes = [];
        $subdirs = ['css', 'js', 'data'];
        foreach ($subdirs as $subdir) {
            $dir = $this->assetsDir . '/' . $subdir;
            if (!is_dir($dir)) {
                continue;
            }
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::LEAVES_ONLY
            );
            foreach ($iterator as $file) {
                if (!$file->isFile()) {
                    continue;
                }
                if (str_starts_with($file->getFilename(), '.')) {
                    continue;
                }
                $ext = strtolower($file->getExtension());
                if (!in_array($ext, ['css', 'js', 'json'], true)) {
                    continue;
                }
                $relativePath = 'assets/' . $subdir . '/' . ltrim(
                    str_replace('\\', '/', substr($file->getPathname(), strlen($dir))),
                    '/'
                );
                $hash = @hash_file('sha256', $file->getPathname());
                if ($hash !== false) {
                    $hashes[$relativePath] = $hash;
                }
            }
        }
        ksort($hashes);
        return $hashes;
    }

    private function createPrePublishSnapshot(): array
    {
        if (!class_exists('ZipArchive')) {
            return ['ok' => false, 'error' => 'ZipArchive not available.'];
        }

        $timestamp = date('Y-m-d_H-i-s');
        $filename  = "snapshot_pre_publish_{$timestamp}.zip";
        $zipPath   = $this->snapshotDir . '/' . $filename;
        $fileCount = 0;

        $zip = new \ZipArchive();
        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return ['ok' => false, 'error' => 'Could not create archive.'];
        }

        if (is_dir($this->previewDir)) {
            $fileCount += $this->addDirToZip($zip, $this->previewDir, 'preview');
        }
        if (is_dir($this->assetsDir)) {
            $fileCount += $this->addDirToZip($zip, $this->assetsDir, 'assets');
        }

        $prodPhpFiles = glob($this->docRoot . '/*.php');
        if ($prodPhpFiles) {
            foreach ($prodPhpFiles as $phpFile) {
                if (basename($phpFile) === '_studio.php') continue;
                $zip->addFile($phpFile, 'production/' . basename($phpFile));
                $fileCount++;
            }
        }

        $prodPartialsDir = $this->docRoot . '/_partials';
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

        $prodExtraFiles = ['.htaccess', 'llms.txt', 'robots.txt', 'sitemap.xml', 'mcp.php',
                           'actions-bar.js', 'actions-bar.css'];
        foreach ($prodExtraFiles as $extraFilename) {
            $fullPath = $this->docRoot . '/' . $extraFilename;
            if (is_file($fullPath)) {
                $zip->addFile($fullPath, 'production/' . $extraFilename);
                $fileCount++;
            }
        }

        $actionsDir = $this->docRoot . '/actions';
        if (is_dir($actionsDir)) {
            $fileCount += $this->addDirToZip($zip, $actionsDir, 'production/actions');
        }

        $zip->close();
        $sizeBytes = filesize($zipPath);

        $id = $this->db->insert('snapshots', [
            'filename'       => $filename,
            'snapshot_type'  => 'pre_publish',
            'label'          => 'Before publish',
            'description'    => 'Auto-created before publishing to production.',
            'file_count'     => $fileCount,
            'size_bytes'     => $sizeBytes,
            'created_by'     => null,
            'created_at'     => now(),
        ]);

        return ['ok' => true, 'id' => $id, 'filename' => $filename];
    }

    private function addDirToZip(\ZipArchive $zip, string $dir, string $prefix): int
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

    private function loadJsonFile(string $path, array $default): array
    {
        if (!file_exists($path)) {
            return $default;
        }
        $raw = file_get_contents($path);
        if ($raw === false) {
            return $default;
        }
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : $default;
    }

    private function saveJsonFile(string $path, array $data): void
    {
        $dir = dirname($path);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents(
            $path,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
    }
}
