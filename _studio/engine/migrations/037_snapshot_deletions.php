<?php
declare(strict_types=1);
return [
    'version' => '1.33.0.24',
    'description' => 'Retain exact snapshot deletion identities, originals and terminal tombstones',
    'up' => static function (\VoxelSite\Database $db): void {
        $db->exec("CREATE TABLE IF NOT EXISTS agent_snapshot_deletions (
            id TEXT PRIMARY KEY, actor_key TEXT NOT NULL, operation_id TEXT NOT NULL,
            snapshot_id TEXT NOT NULL, version TEXT NOT NULL, request_digest TEXT NOT NULL,
            payload_json TEXT, payload_digest TEXT NOT NULL, deleted_at INTEGER,
            created_at INTEGER NOT NULL, UNIQUE(actor_key,operation_id)
        )");
    },
    'down' => static function (\VoxelSite\Database $db): void {
        if ($db->count('agent_snapshot_deletions')) throw new \RuntimeException('Snapshot deletion receipts must not be discarded.');
        $db->exec('DROP TABLE agent_snapshot_deletions');
    },
];
