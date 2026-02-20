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
        $this->revisionsPath = dirname(__DIR__) . '/revisions';
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
                file_put_contents($targetFile, $content);
            }
            // If file doesn't exist (new file), no before state needed
        }

        return $revisionId;
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
                    file_put_contents($targetFile, $content);
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

        $filesChanged = json_decode($revision['files_changed'], true);
        $beforePath = $this->revisionsPath . '/' . $pointer . '/before';
        $filesRestored = [];

        foreach ($filesChanged as $file) {
            $beforeFile = $beforePath . '/' . $file['path'];

            if ($file['had_previous'] && file_exists($beforeFile)) {
                // Restore the previous version
                $content = file_get_contents($beforeFile);
                $this->fileManager->writeFile($file['path'], $content);
                $filesRestored[] = $file['path'];
            } elseif (!$file['had_previous']) {
                // File was created by this revision — delete it
                $this->fileManager->deleteFile($file['path']);
                $filesRestored[] = $file['path'];
            }
        }

        // Mark revision as undone
        $this->db->update('revisions', ['is_undone' => 1], 'id = ?', [$pointer]);

        // Move pointer back
        $previousRevision = $this->db->queryOne(
            'SELECT id FROM revisions WHERE id < ? ORDER BY id DESC LIMIT 1',
            [$pointer]
        );
        $newPointer = $previousRevision ? (int) $previousRevision['id'] : 0;
        $this->settings->set('revision_pointer', $newPointer);

        // Sync pages
        $this->fileManager->syncPageRegistry();
        if ($this->fileManager->pathsAffectTailwind($filesRestored)) {
            $this->fileManager->compileTailwind();
        }

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
        $filesChanged = json_decode($nextRevision['files_changed'], true);
        $afterPath = $this->revisionsPath . '/' . $revisionId . '/after';
        $filesRestored = [];

        foreach ($filesChanged as $file) {
            $afterFile = $afterPath . '/' . $file['path'];

            if (($file['action'] === 'write' || $file['action'] === 'merge') && file_exists($afterFile)) {
                // Restore the after version
                $content = file_get_contents($afterFile);
                $this->fileManager->writeFile($file['path'], $content);
                $filesRestored[] = $file['path'];
            } elseif ($file['action'] === 'delete') {
                // Re-delete the file
                $this->fileManager->deleteFile($file['path']);
                $filesRestored[] = $file['path'];
            }
        }

        // Mark revision as not undone
        $this->db->update('revisions', ['is_undone' => 0], 'id = ?', [$revisionId]);

        // Move pointer forward
        $this->settings->set('revision_pointer', $revisionId);

        // Sync pages
        $this->fileManager->syncPageRegistry();
        if ($this->fileManager->pathsAffectTailwind($filesRestored)) {
            $this->fileManager->compileTailwind();
        }

        return [
            'revision_id'    => $revisionId,
            'description'    => $nextRevision['description'],
            'files_restored' => $filesRestored,
        ];
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
        if (!is_dir($path)) {
            mkdir($path, 0755, true);
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
