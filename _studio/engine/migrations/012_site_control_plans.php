<?php
return [
    'version' => '1.31.2.1',
    'description' => 'Retain reviewed Site plans and confirmed apply outcomes',
    'up' => static function (\VoxelSite\Database $db): void {
        $db->exec('CREATE TABLE IF NOT EXISTS site_control_plans (
            id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
            status TEXT NOT NULL, plan_json TEXT NOT NULL, result_json TEXT,
            created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
            recovery_snapshot_id INTEGER, manifest_json TEXT
        )');
    },
    'down' => static function (\VoxelSite\Database $db): void {
        $db->exec('DROP TABLE IF EXISTS site_control_plans');
    },
];
