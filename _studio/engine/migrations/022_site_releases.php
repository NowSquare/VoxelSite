<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.9',
    'description'=>'Retain sealed publish candidates, live recovery snapshots and managed releases',
    'up'=>static function (\VoxelSite\Database $db): void {
        $db->exec("CREATE TABLE IF NOT EXISTS agent_publish_plans (
            id TEXT PRIMARY KEY, actor_key TEXT NOT NULL, user_id INTEGER NOT NULL,
            credential_id INTEGER, request_id TEXT NOT NULL, request_digest TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('preparing','ready','published','expired')),
            manifest_json TEXT, digest TEXT, payload_json TEXT,
            staged_bytes INTEGER NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, pruned_at INTEGER,
            UNIQUE(actor_key,request_id)
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS site_releases (
            id TEXT PRIMARY KEY, plan_id TEXT NOT NULL UNIQUE, operation_id TEXT NOT NULL UNIQUE,
            actor_json TEXT NOT NULL, before_release_id TEXT, draft_version INTEGER NOT NULL,
            manifest_json TEXT NOT NULL, digest TEXT NOT NULL, created_at INTEGER NOT NULL
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS site_shipped_provenance (
            path TEXT PRIMARY KEY, sha256 TEXT NOT NULL, captured_at INTEGER NOT NULL
        )");
    },
    'down'=>static function (\VoxelSite\Database $db): void {
        if ($db->scalar('SELECT COUNT(*) FROM agent_publish_plans')) {
            throw new \RuntimeException('Retained publish reviews and recovery snapshots must not be discarded by downgrade.');
        }
        $db->exec('DROP TABLE IF EXISTS site_releases');
        $db->exec('DROP TABLE IF EXISTS agent_publish_plans');
        $db->exec('DROP TABLE IF EXISTS site_shipped_provenance');
    },
];
