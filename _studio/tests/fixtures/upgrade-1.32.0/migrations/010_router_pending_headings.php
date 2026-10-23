<?php
return [
    'version' => '1.31.0.3',
    'description' => 'Retain server-owned claim-blocked headings for owner consent',
    'up' => function (\VoxelSite\Database $db) {
        $db->exec("CREATE TABLE IF NOT EXISTS governor_pending_headings (
            id TEXT PRIMARY KEY NOT NULL,
            prompt_log_id INTEGER NOT NULL REFERENCES prompt_log(id) ON DELETE CASCADE,
            candidate TEXT NOT NULL,
            candidate_hash TEXT NOT NULL,
            target_json TEXT NOT NULL,
            preview_root_hash TEXT NOT NULL,
            created_at TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','applying','applied','failed','superseded')),
            approval_id INTEGER NULL REFERENCES governor_claim_overrides(id) ON DELETE SET NULL
        )");
        $db->exec('CREATE INDEX IF NOT EXISTS idx_governor_pending_job ON governor_pending_headings(prompt_log_id, status)');
    },
    'down' => function (\VoxelSite\Database $db) { $db->exec('DROP TABLE IF EXISTS governor_pending_headings'); },
];
