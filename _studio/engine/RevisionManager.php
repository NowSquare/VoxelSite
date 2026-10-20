<?php

declare(strict_types=1);

namespace VoxelSite;

use RuntimeException;

/**
 * Undo/redo engine — the safety net that makes bold editing possible.
 *
 * Every AI interaction that modifies files creates a revision.
 * Each revision stores the before and after state of every file
 * the AI touched, enabling atomic undo/redo at the interaction level.
 *
 * Storage layout:
 *   _studio/revisions/{id}/before/  — file states before the AI edit
 *   _studio/revisions/{id}/after/   — file states after the AI edit
 *
 * The revision pointer (stored in settings) tracks the current
 * position in the linear revision stack. When the pointer equals
 * the highest revision ID, the user is at HEAD.
 *
 * Performance target: undo/redo < 500ms (file copy, no ZIP extraction).
 */
class RevisionManager
{
    private Database $db;
    private Settings $settings;
    private FileManager $fileManager;
    private string $revisionsPath;

    public function __construct(
        ?Database $db = null,
        ?Settings $settings = null,
        ?FileManager $fileManager = null
    ) {
        $this->db = $db ?? Database::getInstance();
        $this->settings = $settings ?? new Settings($this->db);
        $this->fileManager = $fileManager ?? new FileManager($this->db);
        $this->revisionsPath = getenv('VS_TEST_REVISIONS_DIR') ?: dirname(__DIR__) . '/revisions';
    }

    /**
     * Create a new revision, capturing the "before" state.
     *
     * Called by PromptEngine BEFORE FileManager writes files.
     * Copies the current state of all files that will be modified
     * into revisions/{id}/before/.
     *
     * If the user has previously undone revisions (pointer < HEAD),
     * all "future" revisions are deleted — standard undo behavior.
     *
     * @param array<int, array{path: string, action: string}> $operations
     * @param array<string, string|null> $preCapturedBefore Optional map of path => original content
     * @return int The new revision ID
     */
    public function createRevision(
        array $operations,
        string $description,
        int $userId,
        ?int $promptLogId = null,
        array $preCapturedBefore = []
    ): int
    {
        // ── Truncate future revisions if user had undone ──
        $this->truncateFuture();

        // ── Build files_changed metadata ──
        $filesChanged = [];
        foreach ($operations as $op) {
            $currentContent = array_key_exists($op['path'], $preCapturedBefore)
                ? $preCapturedBefore[$op['path']]
                : $this->fileManager->readFile($op['path']);
            $filesChanged[] = [
                'path'         => $op['path'],
                'action'       => $op['action'],
                'had_previous' => $currentContent !== null,
            ];
        }

        // ── Insert revision record ──
        $now = now();
        $revisionId = $this->db->insert('revisions', [
            'prompt_log_id' => $promptLogId,
            'user_id'       => $userId,
            'description'   => $description,
            'files_changed' => json_encode($filesChanged),
            'created_at'    => $now,
        ]);

        // ── Capture "before" state ──
        $beforePath = $this->revisionsPath . '/' . $revisionId . '/before';
        $this->ensureDir($beforePath);

        foreach ($operations as $op) {
            $content = array_key_exists($op['path'], $preCapturedBefore)
                ? $preCapturedBefore[$op['path']]
                : $this->fileManager->readFile($op['path']);
            if ($content !== null) {
                $targetFile = $beforePath . '/' . $op['path'];
                $this->ensureDir(dirname($targetFile));
                if (file_put_contents($targetFile, $content) !== strlen($content)) {
                    throw new RuntimeException('Cannot save revision before-state.');
                }
            }
            // If file doesn't exist (new file), no before state needed
        }

        return $revisionId;
    }

    /**
     * Record an already applied Site transaction without endangering redo history.
     * The optional callback persists its terminal outcome in the same DB commit.
     */
    public function recordAppliedRevision(array $operations, string $description, int $userId, array $before, ?callable $onRecorded = null): int
    {
        $stage = $this->revisionsPath . '/.pending-site-' . bin2hex(random_bytes(8));
        $committedPath = null;
        $futureIds = [];
        $metadata = [];
        try {
            $this->ensureDir($stage . '/before');
            $this->ensureDir($stage . '/after');
            foreach ($operations as $operation) {
                $path = $operation['path'];
                if (!array_key_exists($path, $before)) throw new RuntimeException('Missing original revision state: ' . $path);
                $after = $this->fileManager->readFile($path);
                if ($after === null) throw new RuntimeException('Cannot capture applied revision: ' . $path);
                $metadata[] = ['path' => $path, 'action' => $operation['action'], 'had_previous' => $before[$path] !== null];
                foreach (['before' => $before[$path], 'after' => $after] as $phase => $content) {
                    if ($content === null) continue;
                    $target = $stage . '/' . $phase . '/' . $path;
                    $this->ensureDir(dirname($target));
                    if (file_put_contents($target, $content) !== strlen($content) || file_get_contents($target) !== $content) {
                        throw new RuntimeException('Cannot save exact revision ' . $phase . '-state.');
                    }
                }
            }
            $id = $this->db->transaction(function () use ($metadata, $description, $userId, $stage, $onRecorded, &$committedPath, &$futureIds) {
                $pointer = $this->normalizePointer();
                $futureIds = array_column($this->db->query('SELECT id FROM revisions WHERE id > ?', [$pointer]), 'id');
                $id = $this->db->insert('revisions', ['prompt_log_id' => null, 'user_id' => $userId,
                    'description' => $description, 'files_changed' => json_encode($metadata, JSON_THROW_ON_ERROR), 'created_at' => now()]);
                $committedPath = $this->revisionsPath . '/' . $id;
                if (file_exists($committedPath) || !rename($stage, $committedPath)) {
                    $committedPath = null;
                    throw new RuntimeException('Cannot finalize captured revision.');
                }
                foreach ($futureIds as $futureId) $this->db->delete('revisions', 'id = ?', [$futureId]);
                $this->settings->set('revision_pointer', $id);
                if ($onRecorded !== null) $onRecorded($id);
                return $id;
            });
        } catch (\Throwable $error) {
            if ($committedPath !== null) $this->removeDir($committedPath);
            $this->removeDir($stage);
            // Settings caches must not retain a pointer from a rolled back DB transaction.
            $this->settings = new Settings($this->db);
            throw $error;
        }
        // Unreferenced future directories are cleanup only, after the durable commit.
        // A cleanup problem must not report a committed Site transaction as failed.
        foreach ($futureIds as $futureId) {
            try { $this->removeDir($this->revisionsPath . '/' . $futureId); }
            catch (\Throwable $error) { Logger::warning('revisions', 'Could not remove discarded revision directory', ['id' => $futureId, 'error' => $error->getMessage()]); }
        }
        return $id;
    }

    /**
     * Capture the "after" state of a revision.
     *
     * Called by PromptEngine AFTER FileManager has written files.
     * Copies the new state of all modified files into
     * revisions/{id}/after/.
     */
    public function captureAfterState(int $revisionId, array $operations): void
    {
        $afterPath = $this->revisionsPath . '/' . $revisionId . '/after';
        $this->ensureDir($afterPath);

        foreach ($operations as $op) {
            if ($op['action'] === 'write' || $op['action'] === 'merge') {
                $content = $this->fileManager->readFile($op['path']);
                if ($content !== null) {
                    $targetFile = $afterPath . '/' . $op['path'];
                    $this->ensureDir(dirname($targetFile));
                    if (file_put_contents($targetFile, $content) !== strlen($content)) {
                        throw new RuntimeException('Cannot save revision after-state.');
                    }
                }
            }
            // For deletes: no after state (file was removed)
        }

        // Update the revision pointer to this revision
        $this->settings->set('revision_pointer', $revisionId);

        // Prune old revisions if over the limit
        $this->pruneOldRevisions();
    }

    /**
     * Undo the current revision.
     *
     * Restores the "before" state of all files changed by the
     * revision at the current pointer. Files that were created
     * by the revision are deleted. Files that were modified are
     * restored to their previous content.
     *
     * @return array{revision_id: int, description: string, files_restored: array}|null
     */
    public function undo(): ?array
    {
        $pointer = $this->normalizePointer();

        if ($pointer === 0) {
            return null; // Nothing to undo
        }

        $revision = $this->db->queryOne(
            'SELECT * FROM revisions WHERE id = ?',
            [$pointer]
        );

        if ($revision === null) {
            return null;
        }

        $filesRestored = $this->restoreRevisionFiles($revision, 'before', function () use ($pointer) {
            $this->db->update('revisions', ['is_undone' => 1], 'id = ?', [$pointer]);
            $previous = $this->db->queryOne('SELECT id FROM revisions WHERE id < ? ORDER BY id DESC LIMIT 1', [$pointer]);
            $this->settings->set('revision_pointer', $previous ? (int) $previous['id'] : 0);
        });

        return [
            'revision_id'    => $pointer,
            'description'    => $revision['description'],
            'files_restored' => $filesRestored,
        ];
    }

    /**
     * Redo the next revision.
     *
     * Restores the "after" state of the revision that was most
     * recently undone. Files are restored to their post-AI state.
     *
     * @return array{revision_id: int, description: string, files_restored: array}|null
     */
    public function redo(): ?array
    {
        $pointer = $this->normalizePointer();

        // Find the next revision after the current pointer
        $nextRevision = $this->db->queryOne(
            'SELECT * FROM revisions WHERE id > ? AND is_undone = 1 ORDER BY id ASC LIMIT 1',
            [$pointer]
        );

        if ($nextRevision === null) {
            return null; // Nothing to redo
        }

        $revisionId = (int) $nextRevision['id'];
        $filesRestored = $this->restoreRevisionFiles($nextRevision, 'after', function () use ($revisionId) {
            $this->db->update('revisions', ['is_undone' => 0], 'id = ?', [$revisionId]);
            $this->settings->set('revision_pointer', $revisionId);
        });

        return [
            'revision_id'    => $revisionId,
            'description'    => $nextRevision['description'],
            'files_restored' => $filesRestored,
        ];
    }

    /** Restore exact history bytes; a failed compiler never advances the pointer. */
    private function restoreRevisionFiles(array $revision, string $phase, callable $finalize): array
    {
        $files = json_decode($revision['files_changed'], true, 512, JSON_THROW_ON_ERROR);
        $sourceRoot = $this->revisionsPath . '/' . $revision['id'] . '/' . $phase;
        $targets = [];
        $originals = [];
        foreach ($files as $file) {
            $path = $file['path'];
            $capture = $sourceRoot . '/' . $path;
            if (is_file($capture)) {
                $targets[$path] = file_get_contents($capture);
                if ($targets[$path] === false) throw new RuntimeException('Cannot read captured revision: ' . $path);
            } elseif (($phase === 'before' && !$file['had_previous']) || ($phase === 'after' && $file['action'] === 'delete')) {
                $targets[$path] = null;
            } else {
                throw new RuntimeException('Captured revision file is missing: ' . $path . '. No files were changed.');
            }
            $originals[$path] = $this->fileManager->readFile($path);
        }
        $originals['assets/css/tailwind.css'] = $this->fileManager->readFile('assets/css/tailwind.css');
        $attempted = [];
        try {
            foreach ($targets as $path => $content) {
                $attempted[] = $path;
                if ($content === null) $this->fileManager->deleteFile($path);
                else $this->fileManager->writeExactFile($path, $content);
                if ($this->fileManager->readFile($path) !== $content) throw new RuntimeException('Revision restoration differs from captured bytes: ' . $path);
            }
            if ($this->fileManager->pathsAffectTailwind(array_keys($targets))) {
                $attempted[] = 'assets/css/tailwind.css';
                $compiled = $this->fileManager->compileTailwind();
                if (($compiled['ok'] ?? false) !== true) throw new RuntimeException('Tailwind compilation failed.');
            }
            $this->db->transaction(function () use ($finalize) {
                $this->fileManager->syncPageRegistry(true);
                $finalize();
            });
        } catch (\Throwable $error) {
            $remaining = [];
            foreach (array_unique($attempted) as $path) {
                try {
                    if ($this->fileManager->readFile($path) !== $originals[$path]) {
                        if ($originals[$path] === null) $this->fileManager->deleteFile($path);
                        else $this->fileManager->writeExactFile($path, $originals[$path]);
                    }
                    if ($this->fileManager->readFile($path) !== $originals[$path]) throw new RuntimeException('Unverified restore');
                } catch (\Throwable) { $remaining[] = $path; }
            }
            try { $this->fileManager->syncPageRegistry(true); } catch (\Throwable) { $remaining[] = 'page registry'; }
            $this->settings = new Settings($this->db);
            throw new RuntimeException($error->getMessage() . ($remaining === []
                ? ' The previous files were restored and verified; history did not move.'
                : ' Recovery is incomplete for: ' . implode(', ', $remaining) . '. Restore the safety snapshot.'), 0, $error);
        }
        return array_keys($targets);
    }

    /**
     * Get the current undo/redo state for the UI.
     *
     * @return array{can_undo: bool, can_redo: bool, undo_description: ?string, redo_description: ?string, current_pointer: int, total_revisions: int}
     */
    public function getState(): array
    {
        $pointer = $this->normalizePointer();

        $undoRevision = $pointer > 0
            ? $this->db->queryOne('SELECT description FROM revisions WHERE id = ?', [$pointer])
            : null;

        $redoRevision = $this->db->queryOne(
            'SELECT description FROM revisions WHERE id > ? AND is_undone = 1 ORDER BY id ASC LIMIT 1',
            [$pointer]
        );

        $total = (int) $this->db->scalar('SELECT COUNT(*) FROM revisions');

        return [
            'can_undo'         => $undoRevision !== null,
            'can_redo'         => $redoRevision !== null,
            'undo_description' => $undoRevision['description'] ?? null,
            'redo_description' => $redoRevision['description'] ?? null,
            'current_pointer'  => $pointer,
            'total_revisions'  => $total,
        ];
    }

    /**
     * Delete all revisions after the current pointer.
     *
     * Standard undo behavior: making a new edit after undoing
     * discards the "future." The user chose a different path.
     */
    private function truncateFuture(): void
    {
        $pointer = $this->normalizePointer();

        // Find revisions to delete
        $futureRevisions = $this->db->query(
            'SELECT id FROM revisions WHERE id > ?',
            [$pointer]
        );

        foreach ($futureRevisions as $rev) {
            $revPath = $this->revisionsPath . '/' . $rev['id'];
            $this->removeDir($revPath);
        }

        $this->db->delete('revisions', 'id > ?', [$pointer]);
    }

    /**
     * Remove old revisions when over the configured limit.
     */
    private function pruneOldRevisions(): void
    {
        $maxRevisions = (int) $this->settings->get('max_revisions', 100);
        $total = (int) $this->db->scalar('SELECT COUNT(*) FROM revisions');

        if ($total <= $maxRevisions) {
            return;
        }

        $excess = $total - $maxRevisions;
        $oldRevisions = $this->db->query(
            'SELECT id FROM revisions ORDER BY id ASC LIMIT ?',
            [$excess]
        );

        foreach ($oldRevisions as $rev) {
            $revPath = $this->revisionsPath . '/' . $rev['id'];
            $this->removeDir($revPath);
            $this->db->delete('revisions', 'id = ?', [$rev['id']]);
        }

        $this->normalizePointer();
    }

    /**
     * Keep revision_pointer consistent with rows that actually exist.
     */
    private function normalizePointer(): int
    {
        $pointer = (int) $this->settings->get('revision_pointer', 0);

        if ($pointer > 0) {
            $exists = $this->db->queryOne('SELECT id FROM revisions WHERE id = ?', [$pointer]);
            if ($exists !== null) {
                return $pointer;
            }
        }

        $fallback = $this->db->queryOne(
            'SELECT id FROM revisions WHERE is_undone = 0 ORDER BY id DESC LIMIT 1'
        );
        $normalized = $fallback ? (int) $fallback['id'] : 0;

        if ($normalized !== $pointer) {
            $this->settings->set('revision_pointer', $normalized);
        }

        return $normalized;
    }

    /**
     * Ensure a directory exists, creating it if needed.
     */
    private function ensureDir(string $path): void
    {
        if (!is_dir($path) && !@mkdir($path, 0755, true) && !is_dir($path)) {
            throw new RuntimeException('Cannot create revision capture directory.');
        }
    }

    /**
     * Recursively remove a directory and its contents.
     */
    private function removeDir(string $path): void
    {
        if (!is_dir($path)) {
            return;
        }

        $items = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($items as $item) {
            if ($item->isDir()) {
                rmdir($item->getPathname());
            } else {
                unlink($item->getPathname());
            }
        }

        rmdir($path);
    }
}
