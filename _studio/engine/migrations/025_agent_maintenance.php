<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.12',
    'description'=>'Bound MCP request budgets and retain compact expiry tombstones',
    'up'=>static function(\VoxelSite\Database $db):void {
        $db->exec("CREATE TABLE IF NOT EXISTS agent_request_budgets (
            credential_id INTEGER NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
            bucket TEXT NOT NULL CHECK(bucket IN ('requests','polls')),
            window_start INTEGER NOT NULL, request_count INTEGER NOT NULL,
            PRIMARY KEY(credential_id,bucket)
        )");
        $db->exec('CREATE TABLE IF NOT EXISTS agent_maintenance_state (id INTEGER PRIMARY KEY CHECK(id=1), last_run INTEGER NOT NULL)');
        $db->exec('INSERT OR IGNORE INTO agent_maintenance_state VALUES (1,0)');
        foreach (['agent_briefs','agent_asset_uploads','agent_change_sets'] as $table) {
            if (!in_array('pruned_at',array_column($db->query('PRAGMA table_info('.$table.')'),'name'),true)) {
                $db->exec('ALTER TABLE '.$table.' ADD COLUMN pruned_at INTEGER');
            }
        }
    },
    'down'=>static function(\VoxelSite\Database $db):void {
        $db->exec('DROP TABLE IF EXISTS agent_request_budgets');
        $db->exec('DROP TABLE IF EXISTS agent_maintenance_state');
    },
];
