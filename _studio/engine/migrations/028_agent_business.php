<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.15',
    'description'=>'Retain exact live Action configuration changes and business request identities',
    'up'=>static function(\VoxelSite\Database $db):void {
        $db->exec("CREATE TABLE IF NOT EXISTS agent_business_changes (
            id TEXT PRIMARY KEY, actor_key TEXT NOT NULL, user_id INTEGER NOT NULL, site_key TEXT NOT NULL, request_id TEXT NOT NULL,
            request_digest TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('prepared','succeeded','failed_restored')),
            payload_json TEXT NOT NULL, result_json TEXT NOT NULL, created_at INTEGER NOT NULL, completed_at INTEGER,
            actor_json TEXT, action_kind TEXT NOT NULL DEFAULT 'action.change',
            recovery_digest TEXT, recovery_expires_at INTEGER, recovery_owner_id INTEGER,
            recovered_by INTEGER, recovered_at INTEGER,
            UNIQUE(actor_key,request_id)
        )");
        // Record receipts and delivery intents deliberately live in each business database:
        // their transaction must include the actual Action/form record, not only Studio metadata.
    },
    'down'=>static function(\VoxelSite\Database $db):void {
        if($db->scalar('SELECT COUNT(*) FROM agent_business_changes'))throw new \RuntimeException('Business mutation identities cannot be discarded by downgrade.');
        $db->exec('DROP TABLE IF EXISTS agent_business_changes');
    },
];
