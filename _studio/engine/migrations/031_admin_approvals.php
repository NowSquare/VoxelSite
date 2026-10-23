<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.18',
    'description'=>'Owner-approved administrative reviews and retained receipts',
    'up'=>static function(\VoxelSite\Database $db):void {
        if(!in_array('disabled_at',array_column($db->query('PRAGMA table_info(users)'),'name'),true))
            $db->exec('ALTER TABLE users ADD COLUMN disabled_at INTEGER');
        $db->exec("CREATE TABLE IF NOT EXISTS agent_admin_plans (
            id TEXT PRIMARY KEY, actor_key TEXT NOT NULL, actor_json TEXT NOT NULL,
            operation_id TEXT NOT NULL, action TEXT NOT NULL, site_key TEXT NOT NULL,
            request_digest TEXT NOT NULL, payload_ciphertext TEXT, review_json TEXT NOT NULL,
            scopes_json TEXT NOT NULL, digest TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('pending','approved','authorized','succeeded','cancelled')),
            approved_by INTEGER, approval_expires_at INTEGER, consumed_at INTEGER,
            result_json TEXT, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
            UNIQUE(actor_key,operation_id)
        )");
    },
    'down'=>static function(\VoxelSite\Database $db):void {
        if($db->count('agent_admin_plans'))throw new \RuntimeException('Administrative approvals and audit history cannot be discarded.');
        $db->exec('DROP TABLE IF EXISTS agent_admin_plans');
    },
];
