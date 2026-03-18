<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * CardManager — Database logic for the Studio Board feature.
 *
 * All database interaction for board cards funnels through this class.
 * The API endpoint (`cards.php`) is a thin HTTP adapter that delegates
 * to these methods.
 *
 * Design decisions:
 * - Cards are shared across the workspace (no user scoping)
 * - created_by_user_id / updated_by_user_id track who touched the card
 * - source_note_id stores the note a card was promoted from (metadata, not FK)
 * - Positions use gapped integers (1000, 2000, ...) for efficient insertion
 * - Rebalancing triggers when the gap between adjacent positions < 10
 */
class CardManager
{
    private Database $db;

    /** Gap between position values for new cards. */
    private const POSITION_GAP = 1000;

    /** Minimum gap before triggering a column rebalance. */
    private const REBALANCE_THRESHOLD = 10;

    /** Headroom slots left above the first card during rebalance.
     *  e.g. 10 × 1000 = 10000 positions of headroom. */
    private const HEADROOM_SLOTS = 10;

    public function __construct(?Database $db = null)
    {
        $this->db = $db ?? Database::getInstance();
    }

    // ═══════════════════════════════════════════
    //  CRUD
    // ═══════════════════════════════════════════

    /**
     * List all active (non-archived) cards, ordered by column then position.
     *
     * @return array<int, array<string, mixed>>
     */
    public function listActive(): array
    {
        return $this->db->query(
            "SELECT id, title, body, column_name, position, linked_page,
                    archived, created_by_user_id, updated_by_user_id,
                    source_note_id, created_at, updated_at
             FROM cards
             WHERE archived = 0
             ORDER BY column_name, position ASC",
            []
        );
    }

    /**
     * List all archived cards, ordered by updated_at DESC.
     *
     * @return array<int, array<string, mixed>>
     */
    public function listArchived(): array
    {
        return $this->db->query(
            "SELECT id, title, body, column_name, position, linked_page,
                    archived, created_by_user_id, updated_by_user_id,
                    source_note_id, created_at, updated_at
             FROM cards
             WHERE archived = 1
             ORDER BY updated_at DESC",
            []
        );
    }

    /**
     * Create a new card.
     *
     * @return array<string, mixed> The created card row.
     */
    public function create(
        int $userId,
        string $title,
        string $body = '',
        string $columnName = 'todo',
        ?string $linkedPage = null,
        ?int $sourceNoteId = null
    ): array {
        $now = gmdate('Y-m-d\TH:i:s\Z');

        // Place the new card at the top of the column (lowest position)
        $topPosition = $this->getTopPosition($columnName);

        $id = $this->db->insert('cards', [
            'title'              => $title,
            'body'               => $body,
            'column_name'        => $columnName,
            'position'           => $topPosition,
            'linked_page'        => $linkedPage,
            'archived'           => 0,
            'created_by_user_id' => $userId,
            'updated_by_user_id' => null,
            'source_note_id'     => $sourceNoteId,
            'created_at'         => $now,
            'updated_at'         => $now,
        ]);

        return $this->getById($id);
    }

    /**
     * Get a single card by ID.
     * Returns null if not found.
     */
    public function getById(int $id): ?array
    {
        return $this->db->queryOne(
            "SELECT id, title, body, column_name, position, linked_page,
                    archived, created_by_user_id, updated_by_user_id,
                    source_note_id, created_at, updated_at
             FROM cards
             WHERE id = ?",
            [$id]
        );
    }

    /**
     * Update a card's fields.
     * Only updates provided fields. Always bumps updated_at and updated_by_user_id.
     *
     * @param array<string, mixed> $fields Allowed keys: title, body, column_name, linked_page, archived
     * @return array<string, mixed>|null The updated card, or null if not found.
     */
    public function update(int $id, int $userId, array $fields): ?array
    {
        $existing = $this->getById($id);
        if (!$existing) {
            return null;
        }

        $allowed = ['title', 'body', 'column_name', 'linked_page', 'archived'];
        $data = [];

        foreach ($allowed as $key) {
            if (!array_key_exists($key, $fields)) {
                continue;
            }
            $data[$key] = $fields[$key];
        }

        if (empty($data)) {
            return $existing;
        }

        $data['updated_at'] = gmdate('Y-m-d\TH:i:s\Z');
        $data['updated_by_user_id'] = $userId;

        $this->db->update(
            'cards',
            $data,
            'id = ?',
            [$id]
        );

        return $this->getById($id);
    }

    /**
     * Move a card to a new column and/or position.
     * Handles position recalculation for the target column.
     *
     * @return array<string, mixed>|null The moved card, or null if not found.
     */
    public function move(int $id, int $userId, string $columnName, int $position): ?array
    {
        $existing = $this->getById($id);
        if (!$existing) {
            return null;
        }

        // Position 0 = "place at top of column" — calculate server-side
        if ($position <= 0) {
            $position = $this->getTopPosition($columnName);
        }

        $now = gmdate('Y-m-d\TH:i:s\Z');

        $this->db->update(
            'cards',
            [
                'column_name'        => $columnName,
                'position'           => $position,
                'updated_at'         => $now,
                'updated_by_user_id' => $userId,
            ],
            'id = ?',
            [$id]
        );

        // Check if rebalancing is needed in the target column
        $this->rebalanceIfNeeded($columnName);

        return $this->getById($id);
    }

    /**
     * Archive a card (set archived = 1).
     *
     * @return bool True if the card was found and archived.
     */
    public function archive(int $id, int $userId): bool
    {
        $card = $this->getById($id);
        if (!$card || $card['archived']) {
            return false;
        }

        $now = gmdate('Y-m-d\TH:i:s\Z');

        $this->db->update(
            'cards',
            [
                'archived'           => 1,
                'updated_at'         => $now,
                'updated_by_user_id' => $userId,
            ],
            'id = ?',
            [$id]
        );

        return true;
    }

    /**
     * Restore an archived card (moves to Done column).
     *
     * @return array<string, mixed>|null The restored card, or null if not found.
     */
    public function restore(int $id, int $userId): ?array
    {
        $card = $this->getById($id);
        if (!$card || !$card['archived']) {
            return null;
        }

        $topPosition = $this->getTopPosition('done');
        $now = gmdate('Y-m-d\TH:i:s\Z');

        $this->db->update(
            'cards',
            [
                'archived'           => 0,
                'column_name'        => 'done',
                'position'           => $topPosition,
                'updated_at'         => $now,
                'updated_by_user_id' => $userId,
            ],
            'id = ?',
            [$id]
        );

        return $this->getById($id);
    }

    /**
     * Permanently delete a card.
     *
     * @return bool True if the card was found and deleted.
     */
    public function delete(int $id): bool
    {
        $card = $this->getById($id);
        if (!$card) {
            return false;
        }

        $this->db->delete('cards', 'id = ?', [$id]);
        return true;
    }

    // ═══════════════════════════════════════════
    //  Position Helpers
    // ═══════════════════════════════════════════

    /**
     * Calculate the position for a new card at the top of a column.
     * Returns a value lower than the current minimum position.
     *
     * If the gap would be too small (≤ 0), rebalances the column first
     * so that there's always headroom for further insertions.
     */
    private function getTopPosition(string $columnName): int
    {
        $minRow = $this->db->queryOne(
            "SELECT MIN(position) as min_pos FROM cards
             WHERE column_name = ? AND archived = 0",
            [$columnName]
        );

        $currentMin = $minRow['min_pos'] ?? null;

        // Empty column — start above the headroom zone
        if ($currentMin === null) {
            return (self::HEADROOM_SLOTS + 1) * self::POSITION_GAP;
        }

        $candidate = (int) $currentMin - self::POSITION_GAP;

        // If we'd go to 0 or below, rebalance first to create headroom
        if ($candidate <= 0) {
            $this->rebalanceColumn($columnName);

            // Re-read — rebalance leaves HEADROOM_SLOTS gaps above the first card
            $minRow = $this->db->queryOne(
                "SELECT MIN(position) as min_pos FROM cards
                 WHERE column_name = ? AND archived = 0",
                [$columnName]
            );
            $currentMin = (int) ($minRow['min_pos'] ?? ((self::HEADROOM_SLOTS + 1) * self::POSITION_GAP));
            $candidate = $currentMin - self::POSITION_GAP;
        }

        // After rebalance, candidate is guaranteed > 0 because the
        // lowest post-rebalance position is (HEADROOM_SLOTS + 1) * GAP
        // and GAP < that value.  Assert defensively.
        return max(1, $candidate);
    }

    /**
     * Rebalance positions in a column if the gap between any two
     * adjacent cards is below the threshold.
     */
    private function rebalanceIfNeeded(string $columnName): void
    {
        $cards = $this->db->query(
            "SELECT id, position FROM cards
             WHERE column_name = ? AND archived = 0
             ORDER BY position ASC",
            [$columnName]
        );

        if (count($cards) < 2) {
            return;
        }

        // Check if any gap is too small
        for ($i = 1; $i < count($cards); $i++) {
            if (($cards[$i]['position'] - $cards[$i - 1]['position']) < self::REBALANCE_THRESHOLD) {
                $this->rebalanceColumn($columnName);
                return;
            }
        }
    }

    /**
     * Unconditionally rebalance all positions in a column with even gaps.
     *
     * Leaves HEADROOM_SLOTS × POSITION_GAP of empty space above the
     * first card so that top-insertions don't immediately re-trigger
     * another rebalance.  Example with 3 cards and defaults:
     *
     *   Slot 0   =  0      (empty)
     *   ...        ...     (HEADROOM_SLOTS empty slots)
     *   Slot 11  = 11000   ← card 1 (first card)
     *   Slot 12  = 12000   ← card 2
     *   Slot 13  = 13000   ← card 3
     *
     * getTopPosition can then insert at 10000, 9000, … 1000 before
     * needing to rebalance again (10 inserts of headroom).
     */
    private function rebalanceColumn(string $columnName): void
    {
        $cards = $this->db->query(
            "SELECT id FROM cards
             WHERE column_name = ? AND archived = 0
             ORDER BY position ASC",
            [$columnName]
        );

        if (empty($cards)) {
            return;
        }

        $pdo = $this->db->getPdo();
        $stmt = $pdo->prepare(
            "UPDATE cards SET position = ? WHERE id = ?"
        );

        foreach ($cards as $index => $card) {
            $newPosition = ($index + 1 + self::HEADROOM_SLOTS) * self::POSITION_GAP;
            $stmt->execute([$newPosition, $card['id']]);
        }
    }
}
