<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.26',
    'description'=>'Retain bounded, attributable MCP connection events without secrets or sessions',
    'up'=>static function(\VoxelSite\Database $db):void {
        $db->exec("CREATE TABLE studio_mcp_connection_events (
            key_id INTEGER PRIMARY KEY REFERENCES studio_mcp_credentials(key_id) ON DELETE CASCADE,
            first_authenticated_at INTEGER, last_authenticated_at INTEGER, last_used_at INTEGER,
            last_auth_failure_at INTEGER, last_auth_failure_code TEXT,
            last_permission_denial_at INTEGER, last_permission_denial_tool TEXT, last_permission_denial_scopes TEXT,
            last_outcome TEXT CHECK(last_outcome IN ('authenticated','used','authentication_failed','permission_denied'))
        )");
        // A prior last-authentication timestamp is evidence of that event only.
        $db->exec("INSERT INTO studio_mcp_connection_events(key_id,last_authenticated_at,last_outcome)
            SELECT key_id,last_authenticated_at,'authenticated' FROM studio_mcp_credentials WHERE last_authenticated_at IS NOT NULL");
    },
    'down'=>static function(\VoxelSite\Database $db):void {
        throw new \RuntimeException('Connection event history must not be discarded by downgrade.');
    },
];
