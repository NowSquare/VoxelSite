<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.21',
    'description'=>'Stage exact system update packages and retain independent activation recovery',
    'up'=>static function(\VoxelSite\Database $db):void {
        $db->exec("CREATE TABLE IF NOT EXISTS agent_update_packages (
            id TEXT PRIMARY KEY, actor_key TEXT NOT NULL,user_id INTEGER NOT NULL,site_key TEXT NOT NULL,
            request_id TEXT NOT NULL,request_digest TEXT NOT NULL,source_kind TEXT NOT NULL DEFAULT 'upload',source_label TEXT NOT NULL,
            expected_bytes INTEGER NOT NULL,expected_hash TEXT NOT NULL,received_bytes INTEGER NOT NULL DEFAULT 0,reserved_bytes INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL CHECK(status IN ('uploading','extracting','staged','prepared','activated','error','expired')),
            extract_index INTEGER NOT NULL DEFAULT 0,manifest_json TEXT,created_at INTEGER NOT NULL,expires_at INTEGER NOT NULL,
            pruned_at INTEGER, UNIQUE(actor_key,request_id)
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS agent_update_chunks (
            package_id TEXT NOT NULL,byte_offset INTEGER NOT NULL,byte_length INTEGER NOT NULL,sha256 TEXT NOT NULL,
            request_id TEXT NOT NULL,PRIMARY KEY(package_id,byte_offset),UNIQUE(package_id,request_id)
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS agent_update_jobs (
            operation_row_id TEXT PRIMARY KEY,package_id TEXT NOT NULL,plan_id TEXT NOT NULL,
            manifest_json TEXT NOT NULL,manifest_sha256 TEXT NOT NULL,runtime_hash TEXT NOT NULL,
            phase TEXT NOT NULL DEFAULT 'prepared',cursor INTEGER NOT NULL DEFAULT 0,
            migration_index INTEGER NOT NULL DEFAULT 0,schema_started INTEGER NOT NULL DEFAULT 0,
            recovery_digest TEXT,recovery_expires_at INTEGER,recovery_owner_id INTEGER,
            recovered_by INTEGER,recovered_at INTEGER
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS agent_update_reviews (
            plan_id TEXT PRIMARY KEY,package_id TEXT NOT NULL UNIQUE,actor_key TEXT NOT NULL,request_id TEXT NOT NULL,manifest_json TEXT NOT NULL,
            UNIQUE(actor_key,request_id)
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS agent_update_sources (
            actor_key TEXT NOT NULL,request_id TEXT NOT NULL,site_key TEXT NOT NULL,
            reserved_bytes INTEGER NOT NULL,metadata_json TEXT,created_at INTEGER NOT NULL,pruned_at INTEGER,
            PRIMARY KEY(actor_key,request_id)
        )");
    },
    'down'=>static function(\VoxelSite\Database $db):void {
        if($db->scalar('SELECT COUNT(*) FROM agent_update_jobs'))throw new \RuntimeException('Retained update recovery cannot be discarded.');
        $db->exec('DROP TABLE IF EXISTS agent_update_sources');$db->exec('DROP TABLE IF EXISTS agent_update_reviews');$db->exec('DROP TABLE IF EXISTS agent_update_chunks');$db->exec('DROP TABLE IF EXISTS agent_update_packages');$db->exec('DROP TABLE IF EXISTS agent_update_jobs');
    },
];
