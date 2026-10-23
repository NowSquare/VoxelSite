<?php

/** Durable metadata-only job budget, independent of removable call accounting. */
return [
    // Schema-only revision; the program release and VERSION are unchanged.
    'version' => '1.31.0.1',
    'description' => 'Add persistent governed job repair budget',
    'up' => function (\VoxelSite\Database $db) {
        $db->exec("
            CREATE TABLE IF NOT EXISTS governor_job_budget (
                prompt_log_id       INTEGER PRIMARY KEY NOT NULL REFERENCES prompt_log(id) ON DELETE CASCADE,
                target_hash         TEXT NOT NULL CHECK(length(target_hash) = 64 AND target_hash NOT GLOB '*[^a-f0-9]*'),
                generation_started  INTEGER NOT NULL DEFAULT 0 CHECK(generation_started IN (0, 1)),
                repairs_used        INTEGER NOT NULL DEFAULT 0 CHECK(repairs_used BETWEEN 0 AND 2),
                CHECK(generation_started = 1 OR repairs_used = 0)
            )
        ");
    },
    'down' => function (\VoxelSite\Database $db) {
        $db->exec('DROP TABLE IF EXISTS governor_job_budget');
    },
];
