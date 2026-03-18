<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * NoteManager — Database logic for the Studio Notes feature.
 *
 * All database interaction for notes funnels through this class.
 * The API endpoint (`notes.php`) is a thin HTTP adapter that
 * delegates to these methods.
 *
 * Design decisions:
 * - Soft-delete via `deleted_at` (preserves IDs for future Kanban FKs)
 * - Hard-delete piggybacks on list/search queries (no background job)
 * - All list queries exclude soft-deleted notes
 * - Pinned notes sort first, then by updated_at DESC
 * - Max 5 pinned notes per user (soft limit, enforced here)
 */
class NoteManager
{
    private Database $db;

    /** Seconds before a soft-deleted note is hard-deleted. */
    private const HARD_DELETE_AFTER_SECONDS = 30;

    /** Maximum pinned notes per user. */
    private const MAX_PINNED = 5;

    public function __construct(?Database $db = null)
    {
        $this->db = $db ?? Database::getInstance();
    }

    // ═══════════════════════════════════════════
    //  CRUD
    // ═══════════════════════════════════════════

    /**
     * List all active notes for a user, pinned first, then by updated_at DESC.
     * Piggybacks hard-delete of expired soft-deleted notes.
     *
     * @return array<int, array<string, mixed>>
     */
    public function listForUser(int $userId): array
    {
        $this->hardDeleteExpired($userId);

        return $this->db->query(
            "SELECT id, title, body, pinned, user_id, created_at, updated_at
             FROM notes
             WHERE user_id = ? AND deleted_at IS NULL
             ORDER BY pinned DESC, updated_at DESC",
            [$userId]
        );
    }

    /**
     * Create a new note.
     *
     * @return array<string, mixed> The created note row.
     */
    public function create(int $userId, string $title = '', string $body = ''): array
    {
        $now = gmdate('Y-m-d\TH:i:s\Z');

        $id = $this->db->insert('notes', [
            'title'      => $title,
            'body'       => $body,
            'pinned'     => 0,
            'user_id'    => $userId,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        return $this->getById($id, $userId);
    }

    /**
     * Get a single note by ID, scoped to the requesting user.
     * Returns null if not found or soft-deleted.
     */
    public function getById(int $id, int $userId): ?array
    {
        return $this->db->queryOne(
            "SELECT id, title, body, pinned, user_id, created_at, updated_at
             FROM notes
             WHERE id = ? AND user_id = ? AND deleted_at IS NULL",
            [$id, $userId]
        );
    }

    /**
     * Update a note (auto-save target).
     * Only updates provided fields. Always bumps updated_at.
     *
     * @param array<string, mixed> $fields Allowed keys: title, body, pinned
     * @return array{note: ?array, pin_limit: bool}
     */
    public function update(int $id, int $userId, array $fields): array
    {
        $existing = $this->getById($id, $userId);
        if (!$existing) {
            return ['note' => null, 'pin_limit' => false];
        }

        $allowed = ['title', 'body', 'pinned'];
        $data = [];
        $pinLimitHit = false;

        foreach ($allowed as $key) {
            if (!array_key_exists($key, $fields)) {
                continue;
            }

            $value = $fields[$key];

            // Pinned limit enforcement
            if ($key === 'pinned' && (int) $value === 1 && (int) $existing['pinned'] === 0) {
                $pinnedCount = $this->db->count(
                    'notes',
                    'user_id = ? AND pinned = 1 AND deleted_at IS NULL AND id != ?',
                    [$userId, $id]
                );
                if ($pinnedCount >= self::MAX_PINNED) {
                    $pinLimitHit = true;
                    continue;
                }
            }

            $data[$key] = $value;
        }

        if (empty($data)) {
            return ['note' => $existing, 'pin_limit' => $pinLimitHit];
        }

        $data['updated_at'] = gmdate('Y-m-d\TH:i:s\Z');

        $this->db->update(
            'notes',
            $data,
            'id = ? AND user_id = ? AND deleted_at IS NULL',
            [$id, $userId]
        );

        return [
            'note'      => $this->getById($id, $userId),
            'pin_limit' => $pinLimitHit,
        ];
    }

    /**
     * Soft-delete a note (sets deleted_at).
     *
     * @return bool True if the note was found and soft-deleted.
     */
    public function softDelete(int $id, int $userId): bool
    {
        $note = $this->getById($id, $userId);
        if (!$note) {
            return false;
        }

        $now = gmdate('Y-m-d\TH:i:s\Z');

        $this->db->update(
            'notes',
            ['deleted_at' => $now],
            'id = ? AND user_id = ?',
            [$id, $userId]
        );

        return true;
    }

    /**
     * Restore a soft-deleted note (clears deleted_at).
     *
     * @return array<string, mixed>|null The restored note, or null if not found.
     */
    public function restore(int $id, int $userId): ?array
    {
        // Must find a soft-deleted note
        $note = $this->db->queryOne(
            "SELECT id FROM notes WHERE id = ? AND user_id = ? AND deleted_at IS NOT NULL",
            [$id, $userId]
        );

        if (!$note) {
            return null;
        }

        // Clear deleted_at using raw SQL — Database::update() can't set NULL
        // via the convenience method, so use the PDO directly.
        $stmt = $this->db->getPdo()->prepare(
            "UPDATE notes SET deleted_at = NULL WHERE id = ? AND user_id = ?"
        );
        $stmt->execute([$id, $userId]);

        return $this->getById($id, $userId);
    }

    // ═══════════════════════════════════════════
    //  Search
    // ═══════════════════════════════════════════

    /**
     * Search notes by title and body (LIKE '%query%').
     * Title matches rank higher in the result set.
     *
     * @return array<int, array<string, mixed>>
     */
    public function search(int $userId, string $query): array
    {
        $this->hardDeleteExpired($userId);

        $likeQuery = '%' . $query . '%';

        return $this->db->query(
            "SELECT id, title, body, pinned, user_id, created_at, updated_at,
                    CASE
                        WHEN title LIKE ? THEN 1
                        ELSE 0
                    END AS title_match
             FROM notes
             WHERE user_id = ? AND deleted_at IS NULL
               AND (title LIKE ? OR body LIKE ?)
             ORDER BY title_match DESC, pinned DESC, updated_at DESC",
            [$likeQuery, $userId, $likeQuery, $likeQuery]
        );
    }

    // ═══════════════════════════════════════════
    //  Internal: Hard-delete cleanup
    // ═══════════════════════════════════════════

    /**
     * Hard-delete notes whose soft-deletion expired.
     * Runs on every list/search — no background job needed.
     */
    private function hardDeleteExpired(int $userId): void
    {
        $cutoff = gmdate('Y-m-d\TH:i:s\Z', time() - self::HARD_DELETE_AFTER_SECONDS);

        $this->db->delete(
            'notes',
            'user_id = ? AND deleted_at IS NOT NULL AND deleted_at < ?',
            [$userId, $cutoff]
        );
    }
}
