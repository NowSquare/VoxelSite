<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.19',
    'description'=>'Short-lived owner-only credential delivery',
    'up'=>static function(\VoxelSite\Database $db):void {
        $db->exec("CREATE TABLE IF NOT EXISTS agent_admin_secrets (
            plan_id TEXT PRIMARY KEY REFERENCES agent_admin_plans(id),
            credential_id INTEGER NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
            ciphertext TEXT, expires_at INTEGER NOT NULL, claimed_at INTEGER
        )");
    },
    'down'=>static function(\VoxelSite\Database $db):void {
        if($db->count('agent_admin_secrets'))throw new \RuntimeException('Credential delivery history cannot be discarded.');
        $db->exec('DROP TABLE IF EXISTS agent_admin_secrets');
    },
];
