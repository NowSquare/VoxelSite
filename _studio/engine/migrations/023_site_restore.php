<?php
declare(strict_types=1);
return [
    'version' => '1.33.0.10',
    'description' => 'Retain explicit-domain snapshots, reviewed restorations and archived revision branches',
    'up' => static function (\VoxelSite\Database $db): void {
        $db->exec("CREATE TABLE IF NOT EXISTS site_snapshot_captures (
            id TEXT PRIMARY KEY, actor_key TEXT NOT NULL, user_id INTEGER NOT NULL,
            operation_id TEXT NOT NULL, request_digest TEXT NOT NULL, actor_json TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('capturing','valid','failed')),
            manifest_json TEXT, digest TEXT, label TEXT NOT NULL, domain TEXT NOT NULL,
            staged_bytes INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL,
            UNIQUE(actor_key, operation_id)
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS agent_restore_plans (
            id TEXT PRIMARY KEY, actor_key TEXT NOT NULL, user_id INTEGER NOT NULL, credential_id INTEGER,
            request_id TEXT NOT NULL, request_digest TEXT NOT NULL, snapshot_id TEXT NOT NULL,
            domain TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('preparing','ready','applied')),
            manifest_json TEXT, digest TEXT, payload_json TEXT, staged_bytes INTEGER NOT NULL,
            created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
            UNIQUE(actor_key, request_id)
        )");
        $db->exec('CREATE TABLE IF NOT EXISTS agent_archived_revisions (
            revision_id INTEGER PRIMARY KEY REFERENCES revisions(id) ON DELETE CASCADE,
            archived_at INTEGER NOT NULL
        )');
        $db->exec('CREATE TABLE IF NOT EXISTS agent_revision_projections (
            revision_id INTEGER PRIMARY KEY REFERENCES revisions(id) ON DELETE CASCADE,
            before_json TEXT NOT NULL, after_json TEXT NOT NULL,
            before_collections_json TEXT, after_collections_json TEXT
        )');
    },
    'down' => static function (\VoxelSite\Database $db): void {
        if ($db->scalar('SELECT COUNT(*) FROM site_snapshot_captures')
            || $db->scalar('SELECT COUNT(*) FROM agent_restore_plans')
            || $db->scalar('SELECT COUNT(*) FROM agent_archived_revisions')
            || $db->scalar('SELECT COUNT(*) FROM agent_revision_projections')) {
            throw new \RuntimeException('Retained snapshots, restorations and audit branches must not be discarded by downgrade.');
        }
        $db->exec('DROP TABLE IF EXISTS agent_revision_projections');
        $db->exec('DROP TABLE IF EXISTS agent_archived_revisions');
        $db->exec('DROP TABLE IF EXISTS agent_restore_plans');
        $db->exec('DROP TABLE IF EXISTS site_snapshot_captures');
    },
];
