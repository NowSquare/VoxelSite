<?php
declare(strict_types=1);

return [
    'version' => '1.33.0.3',
    'description' => 'Retain actor-bound external authoring briefs and their immutable context',
    'up' => static function (\VoxelSite\Database $db): void {
        $db->exec('CREATE TABLE IF NOT EXISTS agent_briefs (
            id TEXT PRIMARY KEY,
            actor_key TEXT NOT NULL,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            credential_id INTEGER REFERENCES api_keys(id) ON DELETE CASCADE,
            request_id TEXT NOT NULL,
            request_digest TEXT NOT NULL,
            action TEXT NOT NULL,
            base_draft_version TEXT NOT NULL,
            rules_digest TEXT NOT NULL,
            direction_seed TEXT,
            direction_json TEXT,
            context_refs_json TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            payload_digest TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            expires_at INTEGER NOT NULL,
            UNIQUE(actor_key, request_id)
        )');
        $db->exec('CREATE INDEX IF NOT EXISTS idx_agent_briefs_expiry ON agent_briefs(expires_at)');
    },
    'down' => static function (\VoxelSite\Database $db): void {
        $db->exec('DROP TABLE IF EXISTS agent_briefs');
    },
];
