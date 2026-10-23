<?php
declare(strict_types=1);

return [
    'version' => '1.33.0.1',
    'description' => 'Bind Studio MCP connections to accounts and preserve their separate audience',
    'up' => static function (\VoxelSite\Database $db): void {
        // Existing installs may never have opened API settings.
        $db->exec("CREATE TABLE IF NOT EXISTS api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT, key_hash TEXT NOT NULL UNIQUE,
            key_prefix TEXT NOT NULL, label TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'agent',
            scopes TEXT NOT NULL DEFAULT '[]', rate_limit INTEGER NOT NULL DEFAULT 100,
            last_used_at TEXT, created_at TEXT NOT NULL
        )");
        $columns = array_column($db->query('PRAGMA table_info(api_keys)'), 'name');
        if (!in_array('audience', $columns, true)) {
            $db->exec("ALTER TABLE api_keys ADD COLUMN audience TEXT NOT NULL DEFAULT 'rest' CHECK(audience IN ('rest','studio_mcp'))");
        }
        $db->exec('CREATE TABLE IF NOT EXISTS studio_mcp_credentials (
            key_id INTEGER PRIMARY KEY REFERENCES api_keys(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            client_name TEXT, expires_at INTEGER, revoked_at INTEGER,
            last_authenticated_at INTEGER, created_at INTEGER NOT NULL
        )');
        $db->exec('CREATE INDEX IF NOT EXISTS idx_mcp_credentials_user ON studio_mcp_credentials(user_id)');
    },
    'down' => static function (\VoxelSite\Database $db): void {
        // Remove audience-bound keys too, so rollback never turns them into REST credentials.
        $db->exec("DELETE FROM api_keys WHERE audience = 'studio_mcp'");
        $db->exec('DROP TABLE IF EXISTS studio_mcp_credentials');
    },
];
