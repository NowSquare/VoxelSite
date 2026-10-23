<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.13',
    'description'=>'Retain reviewed portable exports and hashed single-use download grants',
    'up'=>static function(\VoxelSite\Database $db):void {
        $db->exec("CREATE TABLE IF NOT EXISTS agent_exports (
            id TEXT PRIMARY KEY, actor_key TEXT NOT NULL, actor_type TEXT NOT NULL, user_id INTEGER NOT NULL, site_key TEXT NOT NULL,
            credential_id INTEGER, request_id TEXT NOT NULL, request_digest TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('preparing','ready','created','expired')),
            manifest_json TEXT, payload_json TEXT, digest TEXT, operation_id TEXT,
            staged_bytes INTEGER NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, pruned_at INTEGER,
            UNIQUE(actor_key,request_id), UNIQUE(actor_key,operation_id)
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS agent_download_grants (
            token_hash TEXT PRIMARY KEY, export_id TEXT NOT NULL REFERENCES agent_exports(id) ON DELETE CASCADE,
            site_key TEXT NOT NULL, archive_hash TEXT NOT NULL, created_at INTEGER NOT NULL,
            expires_at INTEGER NOT NULL, consumed_at INTEGER
        )");
    },
    'down'=>static function(\VoxelSite\Database $db):void {
        if ($db->scalar('SELECT COUNT(*) FROM agent_exports')) throw new \RuntimeException('Retained export identities must not be discarded by downgrade.');
        $db->exec('DROP TABLE IF EXISTS agent_download_grants');
        $db->exec('DROP TABLE IF EXISTS agent_exports');
    },
];
