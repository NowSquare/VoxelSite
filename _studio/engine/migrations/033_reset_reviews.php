<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.20',
    'description'=>'Retain exact reset inventories and bounded recovery originals',
    'up'=>static function(\VoxelSite\Database $db):void {
        $db->exec("CREATE TABLE IF NOT EXISTS agent_reset_plans (
            id TEXT PRIMARY KEY, actor_key TEXT NOT NULL, request_id TEXT NOT NULL,
            request_digest TEXT NOT NULL, approval_id TEXT, manifest_json TEXT, digest TEXT,
            status TEXT NOT NULL CHECK(status IN ('preparing','ready','completed','expired')),
            staged_bytes INTEGER NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
            UNIQUE(actor_key,request_id)
        )");
    },
    'down'=>static function(\VoxelSite\Database $db):void {
        if($db->count('agent_reset_plans'))throw new \RuntimeException('Reset identities and recovery originals cannot be discarded.');
        $db->exec('DROP TABLE IF EXISTS agent_reset_plans');
    },
];
