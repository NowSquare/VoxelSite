<?php

/**
 * Migration 004: Add prompt API support
 *
 * Rebuilds prompt_log to widen the CHECK constraint (add 'queued' status)
 * and add columns for API prompt tracking: api_key_id, status_message,
 * last_progress_at.
 *
 * Also adds api_key_id to conversations for per-key isolation.
 *
 * IMPORTANT: Uses the "create new → copy → drop old → rename new" pattern
 * for the prompt_log rebuild. This preserves the revisions.prompt_log_id
 * FK because prompt_log is never renamed — it is dropped and replaced.
 * The other pattern (rename old → create new) would break the FK because
 * SQLite rewrites FK references in other tables to point at the renamed
 * table name.
 */

return [
    'version' => '1.21.0',
    'description' => 'Widen prompt_log status CHECK, add api_key_id and progress columns, add api_key_id to conversations',

    'up' => function (\VoxelSite\Database $db) {
        $db->exec('PRAGMA foreign_keys = OFF');

        // Step 1: Create new table with TEMPORARY name, widened CHECK, new columns
        $db->exec("
            CREATE TABLE _prompt_log_new (
                id                INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id   TEXT    NULL REFERENCES conversations(id) ON DELETE SET NULL,
                revision_id       INTEGER NULL,
                user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                api_key_id        INTEGER NULL,
                action_type       TEXT    NULL,
                action_data       TEXT    NULL,
                user_prompt       TEXT    NOT NULL,
                system_prompt_hash TEXT   NULL,
                context_summary   TEXT    NULL,
                ai_response       TEXT    NULL,
                ai_provider       TEXT    NOT NULL,
                ai_model          TEXT    NOT NULL,
                files_modified    TEXT    NULL,
                tokens_input      INTEGER NULL,
                tokens_output     INTEGER NULL,
                cost_estimate     REAL    NULL,
                duration_ms       INTEGER NULL,
                status            TEXT    NOT NULL DEFAULT 'success'
                                  CHECK(status IN ('success','error','partial','streaming','queued')),
                status_message    TEXT    NULL,
                last_progress_at  TEXT    NULL,
                error_message     TEXT    NULL,
                created_at        TEXT    NOT NULL,
                evaluation_issues TEXT    NULL
            )
        ");

        // Step 2: Copy data (new columns get NULL defaults)
        $db->exec("
            INSERT INTO _prompt_log_new (
                id, conversation_id, revision_id, user_id,
                action_type, action_data, user_prompt, system_prompt_hash,
                context_summary, ai_response, ai_provider, ai_model,
                files_modified, tokens_input, tokens_output, cost_estimate,
                duration_ms, status, error_message, created_at,
                evaluation_issues
            )
            SELECT
                id, conversation_id, revision_id, user_id,
                action_type, action_data, user_prompt, system_prompt_hash,
                context_summary, ai_response, ai_provider, ai_model,
                files_modified, tokens_input, tokens_output, cost_estimate,
                duration_ms, status, error_message, created_at,
                evaluation_issues
            FROM prompt_log
        ");

        // Step 3: Drop old table
        // revisions.prompt_log_id FK now has a dangling target — safe
        // because foreign_keys is OFF
        $db->exec('DROP TABLE prompt_log');

        // Step 4: Rename new table to the canonical name
        // This restores the FK target: revisions.prompt_log_id still
        // references "prompt_log"(id) — that name now resolves again.
        $db->exec('ALTER TABLE _prompt_log_new RENAME TO prompt_log');

        // Step 5: Recreate indexes (originals were dropped with the old table)
        $db->exec(
            "CREATE INDEX IF NOT EXISTS idx_prompt_log_conversation
             ON prompt_log (conversation_id, created_at)"
        );
        $db->exec(
            "CREATE INDEX IF NOT EXISTS idx_prompt_log_user
             ON prompt_log (user_id, created_at DESC)"
        );
        $db->exec(
            "CREATE INDEX IF NOT EXISTS idx_prompt_log_api_key
             ON prompt_log (api_key_id)"
        );

        // Step 6: Add api_key_id to conversations for per-key isolation
        $db->exec('ALTER TABLE conversations ADD COLUMN api_key_id INTEGER NULL');

        // Step 7: Verify FK integrity before re-enabling
        $pdo = $db->getPdo();
        $violations = $pdo->query('PRAGMA foreign_key_check')->fetchAll();
        if (!empty($violations)) {
            throw new \RuntimeException(
                'Migration 004: FK integrity check failed with '
                . count($violations) . ' violations'
            );
        }

        $db->exec('PRAGMA foreign_keys = ON');
    },

    'down' => function (\VoxelSite\Database $db) {
        // Reverse is complex (rebuild back to narrower CHECK).
        // Not auto-executed in production — leave as-is.
    },
];
