<?php
return [
    'version' => '1.31.2.2',
    'description' => 'Retain deterministic Site mutation recovery and retry outcomes',
    'up' => static function (\VoxelSite\Database $db): void {
        $db->exec('CREATE TABLE IF NOT EXISTS site_control_mutations (
            id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
            request_hash TEXT NOT NULL, route_path TEXT NOT NULL, status TEXT NOT NULL,
            snapshot_id INTEGER, response_json TEXT, http_code INTEGER, created_at INTEGER NOT NULL
        )');
    },
    'down' => static function (\VoxelSite\Database $db): void {
        $db->exec('DROP TABLE IF EXISTS site_control_mutations');
    },
];
