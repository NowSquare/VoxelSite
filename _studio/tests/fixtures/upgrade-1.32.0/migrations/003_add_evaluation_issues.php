<?php

/**
 * Migration 003: Add evaluation_issues to prompt_log
 *
 * Stores the post-generation expert review results so they
 * survive page refresh. The column holds a JSON array of
 * {severity, category, description, suggested_fix, file, line}
 * objects — same shape the evaluator SSE event emits.
 */

return [
    'version' => '1.17.0',
    'description' => 'Store evaluator issues in prompt_log for history persistence',

    'up' => function (\VoxelSite\Database $db) {
        // SQLite ALTER TABLE ADD COLUMN — always nullable, no default needed
        $db->exec("ALTER TABLE prompt_log ADD COLUMN evaluation_issues TEXT NULL");
    },

    'down' => function (\VoxelSite\Database $db) {
        // SQLite doesn't support DROP COLUMN before 3.35.0 (2021-03-12).
        // For safety, just leave it as-is — harmless nullable TEXT.
    },
];
