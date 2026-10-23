<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.8',
    'description'=>'Retain credential-bound one-use preview tickets and restricted browser grants',
    'up'=>static function (\VoxelSite\Database $db): void {
        $db->exec('CREATE TABLE IF NOT EXISTS agent_preview_grants (
            id TEXT PRIMARY KEY, credential_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
            site_key TEXT NOT NULL, draft_version TEXT NOT NULL, entry_path TEXT NOT NULL,
            paths_json TEXT NOT NULL, ticket_hash TEXT NOT NULL UNIQUE, ticket_expires_at INTEGER NOT NULL,
            consumed_at INTEGER, cookie_hash TEXT UNIQUE, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
        )');
        $db->exec('CREATE INDEX IF NOT EXISTS idx_agent_preview_expiry ON agent_preview_grants(expires_at)');
    },
    'down'=>static function (\VoxelSite\Database $db): void { $db->exec('DROP TABLE IF EXISTS agent_preview_grants'); },
];
