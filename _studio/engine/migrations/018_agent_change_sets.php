<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.5',
    'description'=>'Retain immutable actor-bound change sets and reviewed manifests',
    'up'=>static function (\VoxelSite\Database $db): void {
        $db->exec("CREATE TABLE IF NOT EXISTS agent_change_sets (
            id TEXT PRIMARY KEY, actor_key TEXT NOT NULL, user_id INTEGER NOT NULL, credential_id INTEGER,
            request_id TEXT NOT NULL, request_digest TEXT NOT NULL, base_draft_version TEXT NOT NULL,
            brief_id TEXT NOT NULL, summary TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('preparing','ready','applied','expired')),
            manifest_json TEXT, sealed_digest TEXT, payload_json TEXT, staged_bytes INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
            UNIQUE(actor_key, request_id)
        )");
        $db->exec('CREATE INDEX IF NOT EXISTS idx_agent_changes_expiry ON agent_change_sets(status, expires_at)');
    },
    'down'=>static function (\VoxelSite\Database $db): void { $db->exec('DROP TABLE IF EXISTS agent_change_sets'); },
];
