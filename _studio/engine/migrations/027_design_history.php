<?php
declare(strict_types=1);
return [
    'version' => '1.33.0.14',
    'description' => 'Retained design captures and exact design history state',
    'up' => static function (\VoxelSite\Database $db): void {
        $db->exec("CREATE TABLE IF NOT EXISTS agent_designs (
            id TEXT PRIMARY KEY, actor_key TEXT NOT NULL, user_id INTEGER NOT NULL,
            operation_id TEXT NOT NULL, request_digest TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('capturing','valid','deleted','failed')),
            metadata_json TEXT, manifest_json TEXT, digest TEXT, staged_bytes INTEGER NOT NULL,
            created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
            UNIQUE(actor_key,operation_id)
        )");
        $db->exec('CREATE TABLE IF NOT EXISTS agent_revision_design_state (
            revision_id INTEGER PRIMARY KEY REFERENCES revisions(id) ON DELETE CASCADE,
            before_design_id TEXT, after_design_id TEXT
        )');
    },
    'down' => static function (\VoxelSite\Database $db): void {
        if ($db->count('agent_designs') || $db->count('agent_revision_design_state')) throw new \RuntimeException('Retained design history cannot be discarded by downgrade.');
        $db->exec('DROP TABLE IF EXISTS agent_revision_design_state');
        $db->exec('DROP TABLE IF EXISTS agent_designs');
    },
];
