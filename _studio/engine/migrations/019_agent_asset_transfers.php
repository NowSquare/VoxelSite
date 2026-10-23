<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.6',
    'description'=>'Retain private actor-bound asset upload identities and chunk receipts',
    'up'=>static function (\VoxelSite\Database $db): void {
        $db->exec("CREATE TABLE IF NOT EXISTS agent_asset_uploads (
            id TEXT PRIMARY KEY, actor_key TEXT NOT NULL, user_id INTEGER NOT NULL, credential_id INTEGER,
            path TEXT NOT NULL, mime_type TEXT NOT NULL, expected_bytes INTEGER NOT NULL,
            expected_hash TEXT NOT NULL, received_bytes INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL CHECK(status IN ('uploading','finalized')),
            final_hash TEXT, final_bytes INTEGER, result_json TEXT,
            created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS agent_asset_requests (
            actor_key TEXT NOT NULL, action TEXT NOT NULL, request_id TEXT NOT NULL,
            upload_id TEXT NOT NULL REFERENCES agent_asset_uploads(id),
            request_digest TEXT NOT NULL, result_json TEXT, created_at INTEGER NOT NULL,
            PRIMARY KEY(actor_key, action, request_id)
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS agent_asset_chunks (
            upload_id TEXT NOT NULL REFERENCES agent_asset_uploads(id), byte_offset INTEGER NOT NULL,
            byte_length INTEGER NOT NULL, sha256 TEXT NOT NULL, complete INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY(upload_id, byte_offset)
        )");
        $db->exec('CREATE INDEX IF NOT EXISTS idx_asset_upload_actor ON agent_asset_uploads(actor_key, expires_at)');
    },
    'down'=>static function (\VoxelSite\Database $db): void {
        if ($db->scalar('SELECT COUNT(*) FROM agent_asset_uploads')) {
            throw new \RuntimeException('Retained uploads may be referenced by reviews. Resolve and remove them before removing their journal.');
        }
        $db->exec('DROP TABLE IF EXISTS agent_asset_chunks');
        $db->exec('DROP TABLE IF EXISTS agent_asset_requests');
        $db->exec('DROP TABLE IF EXISTS agent_asset_uploads');
    },
];
