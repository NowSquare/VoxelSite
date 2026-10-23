<?php

/**
 * Migration 005: Add Notes table
 *
 * Creates the `notes` table for the Studio "business brain" Notes feature.
 * Notes are user-owned scratchpads with pinning, soft-delete, and full-text
 * search. The table schema follows the 4010 specification exactly.
 *
 * Soft-delete (`deleted_at`) preserves note IDs for future Kanban card FKs.
 * The covering index on (user_id, pinned DESC, updated_at DESC) serves the
 * primary list query efficiently, filtered to active notes only.
 */

return [
    'version' => '1.22.0',
    'description' => 'Add notes table for Studio Notes feature (4010)',

    'up' => function (\VoxelSite\Database $db) {
        $db->exec("
            CREATE TABLE IF NOT EXISTS notes (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                title      TEXT    NOT NULL DEFAULT '',
                body       TEXT    NOT NULL DEFAULT '',
                pinned     INTEGER NOT NULL DEFAULT 0,
                user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TEXT    NOT NULL,
                updated_at TEXT    NOT NULL,
                deleted_at TEXT    NULL
            )
        ");

        $db->exec("
            CREATE INDEX IF NOT EXISTS idx_notes_user_updated
                ON notes (user_id, pinned DESC, updated_at DESC)
                WHERE deleted_at IS NULL
        ");
    },

    'down' => function (\VoxelSite\Database $db) {
        $db->exec('DROP TABLE IF EXISTS notes');
    },
];
