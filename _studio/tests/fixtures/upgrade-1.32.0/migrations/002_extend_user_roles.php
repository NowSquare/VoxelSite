<?php

/**
 * Migration 002: Extend User Roles
 *
 * Adds 'editor' and 'viewer' roles to the users table.
 * Existing data is fully preserved — this migration recreates
 * the table with an expanded CHECK constraint while keeping
 * all current users intact.
 *
 * Role mapping:
 * - 'owner' stays 'owner' (the original installer)
 * - 'admin' becomes 'editor' (legacy role name from v1.0)
 * - 'editor' and 'viewer' are newly available
 *
 * This is safe for existing installs: the owner account is
 * untouched. The only change is that 'admin' users (if any
 * exist from manual DB edits) get renamed to 'editor'.
 */

return [
    'version' => '1.11.0',
    'description' => 'Extend user roles — add editor and viewer roles for team members',

    'up' => function (\VoxelSite\Database $db) {

        // SQLite doesn't support ALTER COLUMN or modifying CHECK constraints.
        // We must recreate the table. This is safe inside a transaction.

        // 1. Create new table with expanded CHECK
        $db->exec("
            CREATE TABLE IF NOT EXISTS users_new (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                email         TEXT    NOT NULL UNIQUE,
                password_hash TEXT    NOT NULL,
                name          TEXT    NOT NULL,
                role          TEXT    NOT NULL DEFAULT 'editor' CHECK(role IN ('owner', 'editor', 'viewer')),
                avatar_path   TEXT    NULL,
                last_login_at TEXT    NULL,
                created_at    TEXT    NOT NULL,
                updated_at    TEXT    NOT NULL
            )
        ");

        // 2. Copy existing data — map 'admin' to 'editor', keep 'owner' as-is
        $db->exec("
            INSERT INTO users_new (id, email, password_hash, name, role, avatar_path, last_login_at, created_at, updated_at)
            SELECT id, email, password_hash, name,
                   CASE WHEN role = 'admin' THEN 'editor' ELSE role END,
                   avatar_path, last_login_at, created_at, updated_at
            FROM users
        ");

        // 3. Drop old table and rename new one
        $db->exec("DROP TABLE users");
        $db->exec("ALTER TABLE users_new RENAME TO users");

        // 4. Recreate indexes that reference users (sessions FK is implicit via REFERENCES)
        $db->exec("CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id)");
    },

    'down' => function (\VoxelSite\Database $db) {
        // Revert: recreate with the original CHECK constraint
        $db->exec("
            CREATE TABLE IF NOT EXISTS users_old (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                email         TEXT    NOT NULL UNIQUE,
                password_hash TEXT    NOT NULL,
                name          TEXT    NOT NULL,
                role          TEXT    NOT NULL DEFAULT 'admin' CHECK(role IN ('owner', 'admin')),
                avatar_path   TEXT    NULL,
                last_login_at TEXT    NULL,
                created_at    TEXT    NOT NULL,
                updated_at    TEXT    NOT NULL
            )
        ");

        $db->exec("
            INSERT INTO users_old (id, email, password_hash, name, role, avatar_path, last_login_at, created_at, updated_at)
            SELECT id, email, password_hash, name,
                   CASE WHEN role = 'editor' THEN 'admin' WHEN role = 'viewer' THEN 'admin' ELSE role END,
                   avatar_path, last_login_at, created_at, updated_at
            FROM users
        ");

        $db->exec("DROP TABLE users");
        $db->exec("ALTER TABLE users_old RENAME TO users");
    },
];
