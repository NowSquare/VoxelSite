<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.16',
    'description'=>'Retain scoped notes and board mutation identities',
    'up'=>static function(\VoxelSite\Database $db):void {
        $db->exec('CREATE TABLE IF NOT EXISTS notes_board_requests (
            actor_key TEXT NOT NULL, request_id TEXT NOT NULL,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            kind TEXT NOT NULL, request_digest TEXT NOT NULL,
            response_json TEXT, response_bytes INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
            PRIMARY KEY (actor_key, request_id)
        )');
        $db->exec('CREATE INDEX IF NOT EXISTS notes_board_requests_expiry ON notes_board_requests(expires_at)');
    },
    'down'=>static function(\VoxelSite\Database $db):void {$db->exec('DROP TABLE IF EXISTS notes_board_requests');},
];
