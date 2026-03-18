<?php

/**
 * Migration 006: Add Board (Kanban) table
 *
 * Creates the `cards` table for the Studio Board feature.
 * Cards are shared across the workspace (unlike Notes, which are user-scoped).
 *
 * Key design decisions:
 * - No user_id scoping — the board is a shared collaboration surface
 * - created_by_user_id tracks who created the card
 * - updated_by_user_id tracks who last modified it
 * - source_note_id is metadata only (not a FK) — copy-on-promote from Notes
 * - column_name uses CHECK constraint for the three fixed columns
 * - Partial index on active cards for efficient board rendering
 */

return [
    'version' => '1.23.0',
    'description' => 'Add cards table for Studio Board feature (4020)',

    'up' => function (\VoxelSite\Database $db) {
        $db->exec("
            CREATE TABLE IF NOT EXISTS cards (
                id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                title               TEXT    NOT NULL DEFAULT '',
                body                TEXT    NOT NULL DEFAULT '',
                column_name         TEXT    NOT NULL DEFAULT 'todo'
                                    CHECK(column_name IN ('todo', 'in_progress', 'done')),
                position            INTEGER NOT NULL DEFAULT 0,
                linked_page         TEXT    NULL,
                archived            INTEGER NOT NULL DEFAULT 0,
                created_by_user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                updated_by_user_id  INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
                source_note_id      INTEGER NULL,
                created_at          TEXT    NOT NULL,
                updated_at          TEXT    NOT NULL
            )
        ");

        $db->exec("
            CREATE INDEX IF NOT EXISTS idx_cards_column
                ON cards (column_name, position)
                WHERE archived = 0
        ");

        $db->exec("
            CREATE INDEX IF NOT EXISTS idx_cards_archived
                ON cards (archived, updated_at DESC)
        ");
    },

    'down' => function (\VoxelSite\Database $db) {
        $db->exec('DROP TABLE IF EXISTS cards');
    },
];
