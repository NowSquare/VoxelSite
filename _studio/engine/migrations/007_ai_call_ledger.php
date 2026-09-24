<?php

/** Metadata-only accounting for logical AI calls. No prompts or responses. */
return [
    'version' => '1.31.0',
    'description' => 'Add secret-safe AI call ledger',
    'up' => function (\VoxelSite\Database $db) {
        $db->exec("
            CREATE TABLE IF NOT EXISTS ai_call_ledger (
                id              TEXT PRIMARY KEY NOT NULL,
                prompt_log_id   INTEGER NULL REFERENCES prompt_log(id) ON DELETE SET NULL,
                kind            TEXT NOT NULL CHECK(kind IN ('classify', 'generation', 'gate', 'repair')),
                provider        TEXT NOT NULL,
                model           TEXT NULL,
                method          TEXT NOT NULL CHECK(method IN ('evaluate', 'complete', 'stream')),
                status          TEXT NOT NULL CHECK(status IN ('running', 'success', 'error')),
                input_tokens    INTEGER NULL CHECK(input_tokens >= 0),
                output_tokens   INTEGER NULL CHECK(output_tokens >= 0),
                cost_usd        REAL NULL CHECK(cost_usd >= 0),
                duration_ms     REAL NULL CHECK(duration_ms >= 0),
                error_code      TEXT NULL,
                started_at      TEXT NOT NULL,
                finished_at     TEXT NULL
            )
        ");
        $db->exec('CREATE INDEX IF NOT EXISTS idx_ai_call_ledger_prompt ON ai_call_ledger (prompt_log_id, started_at)');
    },
    'down' => function (\VoxelSite\Database $db) {
        $db->exec('DROP TABLE IF EXISTS ai_call_ledger');
    },
];
