<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Design Library — Engine Class
 *
 * Manages saved site designs as directory copies. Each design captures
 * the complete visual identity of a site: PHP pages, CSS tokens,
 * JavaScript, data files, and form definitions. Images and fonts are
 * shared across designs — they are content, not design.
 *
 * Storage uses plain directory copies, not ZipArchive. ZipArchive is
 * a "recommended" PHP extension, not guaranteed on shared hosts.
 * Directory copies work everywhere PHP runs.
 *
 * Storage structure:
 *   _studio/data/designs/
 *     {uuid}/
 *       metadata.json    — name, prompt, tokens, timestamps
 *       preview/         — copy of _studio/preview/
 *       css/             — copy of assets/css/
 *       js/              — copy of assets/js/
 *       data/            — copy of assets/data/
 *       forms/           — copy of assets/forms/
 */
class DesignManager
{
    private string $designsDir;
    private string $previewDir;
    private string $assetsDir;
    private Database $db;
    private Settings $settings;

    public function __construct(?Database $db = null)
    {
        $this->db = $db ?? Database::getInstance();
        $this->settings = new Settings($this->db);
        $this->designsDir = dirname(__DIR__) . '/data/designs';
        $this->previewDir = dirname(__DIR__) . '/preview';
        $this->assetsDir  = dirname(__DIR__, 2) . '/assets';

        if (!is_dir($this->designsDir)) {
            mkdir($this->designsDir, 0755, true);
        }
    }

    // ═══════════════════════════════════════════
    //  List
    // ═══════════════════════════════════════════

    /**
     * List all saved designs with their metadata.
     *
     * Reads metadata.json from each design directory. Corrupted or
     * incomplete designs are silently skipped — a missing metadata
     * file or empty preview directory does not crash the gallery.
     *
     * @return array<int, array<string, mixed>> Sorted by updated_at DESC
     */
    public function list(): array
    {
        if (!is_dir($this->designsDir)) {
            return [];
        }

        $designs = [];

        $dirs = new \DirectoryIterator($this->designsDir);
        foreach ($dirs as $item) {
            if ($item->isDot() || !$item->isDir()) {
                continue;
            }

            $id = $item->getFilename();
            $metaPath = $item->getPathname() . '/metadata.json';

            if (!file_exists($metaPath)) {
                continue; // Corrupted — no metadata
            }

            $raw = @file_get_contents($metaPath);
            if ($raw === false) {
                continue;
            }

            $meta = json_decode($raw, true);
            if (!is_array($meta) || empty($meta['id'])) {
                continue; // Corrupted — invalid JSON or missing ID
            }

            // Validate that the design has at least a preview directory
            if (!is_dir($item->getPathname() . '/preview')) {
                $meta['_corrupted'] = true;
            }

            $designs[] = $meta;
        }

        // Sort by updated_at descending (newest first)
        usort($designs, function (array $a, array $b): int {
            return ($b['updated_at'] ?? '') <=> ($a['updated_at'] ?? '');
        });

        return $designs;
    }

    // ═══════════════════════════════════════════
    //  Save
    // ═══════════════════════════════════════════

    /**
     * Save the current site state as a named design.
     *
     * Copies preview pages, CSS, JS, data, and form definitions
     * into a new design directory. Extracts design tokens from
     * style.css for the preview card. Captures the initial prompt
     * from settings for the card description.
     *
     * @param string $name        Human-readable design name
     * @param string $description Optional description
     * @return array{ok: bool, design?: array<string, mixed>, error?: string}
     */
    public function save(string $name, string $description = ''): array
    {
        $id = $this->generateId();
        $designDir = $this->designsDir . '/' . $id;

        if (!mkdir($designDir, 0755, true)) {
            return ['ok' => false, 'error' => 'Could not create design directory.'];
        }

        // Copy the five design directories
        $fileCount = 0;
        $copyMap = [
            $this->previewDir          => $designDir . '/preview',
            $this->assetsDir . '/css'  => $designDir . '/css',
            $this->assetsDir . '/js'   => $designDir . '/js',
            $this->assetsDir . '/data' => $designDir . '/data',
            $this->assetsDir . '/forms' => $designDir . '/forms',
        ];

        foreach ($copyMap as $src => $dst) {
            if (is_dir($src)) {
                $fileCount += $this->copyDirectory($src, $dst);
            }
        }

        if ($fileCount === 0) {
            // Nothing to save — clean up
            $this->removeDirectory($designDir);
            return ['ok' => false, 'error' => 'Nothing to save — no site files found.'];
        }

        // Extract design tokens from style.css
        $designTokens = $this->extractDesignTokens();

        // Read site metadata
        $siteName = $this->settings->get('site_name', '');
        $initialPrompt = $this->settings->get('initial_prompt', '');

        // Count pages in the saved preview
        $pageCount = $this->countPhpFiles($designDir . '/preview');

        $now = gmdate('Y-m-d\TH:i:s\Z');

        $metadata = [
            'id'              => $id,
            'name'            => $name,
            'description'     => $description,
            'initial_prompt'  => $initialPrompt,
            'site_name'       => $siteName,
            'page_count'      => $pageCount,
            'file_count'      => $fileCount,
            'design_tokens'   => $designTokens,
            'created_at'      => $now,
            'updated_at'      => $now,
        ];

        $metaPath = $designDir . '/metadata.json';
        $written = file_put_contents(
            $metaPath,
            json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );

        if ($written === false) {
            $this->removeDirectory($designDir);
            return ['ok' => false, 'error' => 'Could not write design metadata.'];
        }

        // Track active design
        $this->settings->set('active_design_id', $id);

        return ['ok' => true, 'design' => $metadata];
    }

    // ═══════════════════════════════════════════
    //  Load (Switch)
    // ═══════════════════════════════════════════

    /**
     * Switch to a saved design.
     *
     * Auto-saves the current state first (frictionless), then copies
     * the target design's files into the active locations. After
     * restoration: syncs the page registry, recompiles Tailwind,
     * and clears the revision stack.
     *
     * @param string $id Design UUID to load
     * @param bool $skipAutoSave If true, skip auto-saving the current design before switching
     * @return array{ok: bool, auto_saved?: array<string, mixed>, error?: string}
     */
    public function load(string $id, bool $skipAutoSave = false): array
    {
        $designDir = $this->designsDir . '/' . $this->sanitizeId($id);

        if (!is_dir($designDir) || !file_exists($designDir . '/metadata.json')) {
            return ['ok' => false, 'error' => 'Design not found.'];
        }

        // Auto-save current state before switching (unless caller opted out)
        $autoSave = null;
        if (!$skipAutoSave && $this->hasActiveContent()) {
            $siteName = $this->settings->get('site_name', 'Untitled');
            $timestamp = date('M j, g:ia');
            $autoName = "Auto-saved — {$siteName}";
            $autoResult = $this->save($autoName, "Auto-saved before switching designs ({$timestamp})");
            if ($autoResult['ok']) {
                $autoSave = $autoResult['design'];
            }
        }

        // Clear active directories before restoring
        $this->clearActiveDesignFiles();

        // Restore the design's files into active locations
        $restoreMap = [
            $designDir . '/preview' => $this->previewDir,
            $designDir . '/css'     => $this->assetsDir . '/css',
            $designDir . '/js'      => $this->assetsDir . '/js',
            $designDir . '/data'    => $this->assetsDir . '/data',
            $designDir . '/forms'   => $this->assetsDir . '/forms',
        ];

        foreach ($restoreMap as $src => $dst) {
            if (is_dir($src)) {
                $this->copyDirectory($src, $dst);
            }
        }

        // Post-switch synchronization
        $fileManager = new FileManager($this->db);

        // Sync page registry with restored files
        $fileManager->syncPageRegistry();

        // Recompile Tailwind (saved CSS may not match new pages)
        $fileManager->compileTailwind();

        // Clear undo/redo history — cross-design undo would be confusing
        $this->clearRevisionStack();

        // Track active design
        $this->settings->set('active_design_id', $id);

        // Update site name from the loaded design's metadata
        $meta = $this->readMetadata($id);
        if ($meta && !empty($meta['site_name'])) {
            $this->settings->set('site_name', $meta['site_name']);
        }
        if ($meta && !empty($meta['initial_prompt'])) {
            $this->settings->set('initial_prompt', $meta['initial_prompt']);
        }

        return [
            'ok'         => true,
            'auto_saved' => $autoSave,
        ];
    }

    // ═══════════════════════════════════════════
    //  New Design (Save + Clear)
    // ═══════════════════════════════════════════

    /**
     * Save the current state and clear the workspace for a fresh design.
     *
     * @param bool $skipAutoSave If true, skip the auto-save safety net (caller already saved)
     * @return array{ok: bool, auto_saved?: array<string, mixed>, error?: string}
     */
    public function newDesign(bool $skipAutoSave = false): array
    {
        // Auto-save current state (unless caller already saved explicitly)
        $autoSave = null;
        if (!$skipAutoSave && $this->hasActiveContent()) {
            $siteName = $this->settings->get('site_name', 'Untitled');
            $autoName = "Auto-saved — {$siteName}";
            $autoResult = $this->save($autoName, 'Auto-saved before starting new design');
            if ($autoResult['ok']) {
                $autoSave = $autoResult['design'];
            }
        }

        // Clear workspace using FileManager's clearSite()
        $fileManager = new FileManager($this->db);
        $fileManager->clearSite();

        // Clear active design tracking
        $this->settings->delete('active_design_id');

        return [
            'ok'         => true,
            'auto_saved' => $autoSave,
        ];
    }

    // ═══════════════════════════════════════════
    //  Update
    // ═══════════════════════════════════════════

    /**
     * Update a design's name and/or description.
     *
     * @return array{ok: bool, error?: string}
     */
    public function update(string $id, string $name, string $description = ''): array
    {
        $meta = $this->readMetadata($id);
        if ($meta === null) {
            return ['ok' => false, 'error' => 'Design not found.'];
        }

        $meta['name'] = $name;
        $meta['description'] = $description;
        $meta['updated_at'] = gmdate('Y-m-d\TH:i:s\Z');

        $success = $this->writeMetadata($id, $meta);

        return $success
            ? ['ok' => true]
            : ['ok' => false, 'error' => 'Could not update design metadata.'];
    }

    // ═══════════════════════════════════════════
    //  Delete
    // ═══════════════════════════════════════════

    /**
     * Delete a saved design and all its files.
     *
     * @return array{ok: bool, error?: string}
     */
    public function delete(string $id): array
    {
        $designDir = $this->designsDir . '/' . $this->sanitizeId($id);

        if (!is_dir($designDir)) {
            return ['ok' => false, 'error' => 'Design not found.'];
        }

        $this->removeDirectory($designDir);

        // If this was the active design, clear the tracking
        if ($this->settings->get('active_design_id') === $id) {
            $this->settings->delete('active_design_id');
        }

        return ['ok' => true];
    }

    // ═══════════════════════════════════════════
    //  File Operations
    // ═══════════════════════════════════════════

    /**
     * Recursively copy a directory tree.
     *
     * PHP's copy() only handles single files. This walks the source
     * tree with RecursiveDirectoryIterator, creates the mirrored
     * directory structure, and copies each file individually.
     *
     * @return int Number of files copied
     */
    public function copyDirectory(string $src, string $dst): int
    {
        if (!is_dir($src)) {
            return 0;
        }

        if (!is_dir($dst)) {
            mkdir($dst, 0755, true);
        }

        $count = 0;
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($src, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $item) {
            // Build the target path by replacing the source prefix
            $relativePath = substr($item->getPathname(), strlen($src));
            $targetPath = $dst . $relativePath;

            if ($item->isDir()) {
                if (!is_dir($targetPath)) {
                    mkdir($targetPath, 0755, true);
                }
            } else {
                // Ensure parent directory exists
                $parentDir = dirname($targetPath);
                if (!is_dir($parentDir)) {
                    mkdir($parentDir, 0755, true);
                }
                copy($item->getPathname(), $targetPath);
                $count++;
            }
        }

        return $count;
    }

    /**
     * Recursively remove a directory and all its contents.
     */
    private function removeDirectory(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($iterator as $item) {
            if ($item->isDir()) {
                @rmdir($item->getPathname());
            } else {
                @unlink($item->getPathname());
            }
        }

        @rmdir($dir);
    }

    /**
     * Clear the active design files (preview, css, js, data, forms).
     *
     * Preserves .gitkeep files and directory structure.
     * Does NOT clear images, fonts, or user uploads — those are content.
     */
    private function clearActiveDesignFiles(): void
    {
        // Clear preview directory (PHP pages + _partials)
        $this->clearDirectoryContents($this->previewDir, ['gitkeep']);

        // Clear CSS (style.css, tailwind.css)
        $this->clearDirectoryContents($this->assetsDir . '/css', ['gitkeep']);

        // Clear JS files
        $this->clearDirectoryContents($this->assetsDir . '/js', ['gitkeep']);

        // Clear data files
        $dataDir = $this->assetsDir . '/data';
        if (is_dir($dataDir)) {
            $this->clearDirectoryContents($dataDir, ['gitkeep']);
        }

        // Clear form definitions
        $formsDir = $this->assetsDir . '/forms';
        if (is_dir($formsDir)) {
            $this->clearDirectoryContents($formsDir, ['gitkeep']);
        }
    }

    /**
     * Remove all files from a directory tree, preserving specified extensions.
     */
    private function clearDirectoryContents(string $dir, array $keepExtensions = []): void
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
                // Remove empty subdirectories (but not the root dir)
                @rmdir($item->getPathname());
            }
        }
    }

    // ═══════════════════════════════════════════
    //  Design Token Extraction
    // ═══════════════════════════════════════════

    /**
     * Extract design tokens from the current style.css.
     *
     * Saves ALL color (--color-*) and typography (--font-*) tokens
     * rather than selecting a handful of hardcoded names. Different
     * sites use different naming conventions (--color-accent vs
     * --color-primary, --color-white vs --color-bg, etc.), so we
     * store everything and let the frontend resolve the best match
     * for card rendering via a priority lookup chain.
     *
     * @return array<string, string>
     */
    private function extractDesignTokens(): array
    {
        $stylePath = $this->assetsDir . '/css/style.css';
        if (!file_exists($stylePath)) {
            return [];
        }

        $css = file_get_contents($stylePath);
        if ($css === false) {
            return [];
        }

        $allTokens = DesignTokens::parse($css);

        // Keep all color and font tokens — the frontend needs them
        // to correctly infer bg, surface, primary, text, heading
        $result = [];
        foreach ($allTokens as $key => $value) {
            if (str_starts_with($key, '--color-') || str_starts_with($key, '--font-')) {
                $result[$key] = $value;
            }
        }

        return $result;
    }

    // ═══════════════════════════════════════════
    //  Metadata Helpers
    // ═══════════════════════════════════════════

    /**
     * Read a design's metadata.json.
     *
     * @return array<string, mixed>|null
     */
    private function readMetadata(string $id): ?array
    {
        $metaPath = $this->designsDir . '/' . $this->sanitizeId($id) . '/metadata.json';
        if (!file_exists($metaPath)) {
            return null;
        }

        $raw = @file_get_contents($metaPath);
        if ($raw === false) {
            return null;
        }

        $meta = json_decode($raw, true);
        return is_array($meta) ? $meta : null;
    }

    /**
     * Write a design's metadata.json.
     */
    private function writeMetadata(string $id, array $meta): bool
    {
        $metaPath = $this->designsDir . '/' . $this->sanitizeId($id) . '/metadata.json';
        $json = json_encode($meta, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        return file_put_contents($metaPath, $json) !== false;
    }

    // ═══════════════════════════════════════════
    //  Revision Stack
    // ═══════════════════════════════════════════

    /**
     * Clear the undo/redo revision stack.
     *
     * When switching designs, the revision history belongs to the old
     * design. Cross-design undo would be confusing and architecturally
     * dangerous. Start fresh.
     */
    private function clearRevisionStack(): void
    {
        // Clear revision files
        $revisionsDir = dirname(__DIR__) . '/revisions';
        if (is_dir($revisionsDir)) {
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($revisionsDir, \FilesystemIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::CHILD_FIRST
            );
            foreach ($iterator as $item) {
                if ($item->isDir()) {
                    @rmdir($item->getPathname());
                } else {
                    @unlink($item->getPathname());
                }
            }
        }

        // Clear revision database records
        try {
            $this->db->exec('DELETE FROM revisions');
        } catch (\Throwable $e) {
            // Table may not exist — non-critical
        }

        // Reset revision pointer
        $this->settings->set('revision_pointer', 0);
    }

    // ═══════════════════════════════════════════
    //  Utility
    // ═══════════════════════════════════════════

    /**
     * Check whether the current workspace has any content worth saving.
     *
     * Returns true if at least one PHP file exists in the preview directory.
     */
    private function hasActiveContent(): bool
    {
        if (!is_dir($this->previewDir)) {
            return false;
        }

        $files = glob($this->previewDir . '/*.php');
        return !empty($files);
    }

    /**
     * Count PHP page files in a directory (non-recursive, excludes _partials).
     */
    private function countPhpFiles(string $dir): int
    {
        if (!is_dir($dir)) {
            return 0;
        }

        $files = glob($dir . '/*.php');
        return $files !== false ? count($files) : 0;
    }

    /**
     * Generate a short unique ID for a design.
     *
     * Uses 8 hex characters from random bytes. Collisions are
     * astronomically unlikely in a directory of < 100 designs.
     */
    private function generateId(): string
    {
        return bin2hex(random_bytes(4));
    }

    /**
     * Sanitize a design ID to prevent path traversal.
     *
     * Only allows alphanumeric characters and hyphens.
     */
    private function sanitizeId(string $id): string
    {
        return preg_replace('/[^a-zA-Z0-9-]/', '', $id);
    }
}
