<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.23',
    'description'=>'Review installation removal before an independent owner completion boundary',
    'up'=>static function(\VoxelSite\Database $db):void {
        $db->exec("CREATE TABLE IF NOT EXISTS agent_factory_plans (
            id TEXT PRIMARY KEY, actor_key TEXT NOT NULL, actor_json TEXT NOT NULL,
            request_id TEXT NOT NULL, request_digest TEXT NOT NULL, manifest_json TEXT,
            digest TEXT, status TEXT NOT NULL DEFAULT 'preparing', staged_bytes INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
            UNIQUE(actor_key,request_id)
        )");
    },
    'down'=>static function(\VoxelSite\Database $db):void {
        if($db->count('agent_factory_plans'))throw new \RuntimeException('Retained installation reviews cannot be discarded.');
        $db->exec('DROP TABLE agent_factory_plans');
    },
];
