<?php

/**
 * Migration 001: Initial Schema
 *
 * Creates all tables for VoxelSite v1.0. This is the foundational
 * schema that every other component depends on. The table design
 * follows two principles:
 *
 * 1. SQLite stores operational data only — website content lives
 *    in PHP page files, assets on the filesystem, collections in JSON.
 *
 * 2. Every column has a clear purpose documented inline. No mystery
 *    fields, no "we might need this later" columns.
 */

return [
    'version' => '1.0.0',
    'description' => 'Initial schema — all core tables for VoxelSite v1.0',

    'up' => function (\VoxelSite\Database $db) {

        // ── Users ──
        // Single-user in v1.0, but the schema supports multiple
        // admins for future extensibility. The 'owner' role is
        // the original installer; 'admin' is additional users.
        $db->exec("
            CREATE TABLE IF NOT EXISTS users (
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

        // ── Sessions ──
        // Custom session management (not PHP's default) for:
        // - 64-char hex tokens (cryptographically random)
        // - Explicit expiry tracking
        // - HttpOnly + Secure + SameSite=Lax cookies
        $db->exec("
            CREATE TABLE IF NOT EXISTS sessions (
                id         TEXT    PRIMARY KEY,
                user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                ip_address TEXT    NOT NULL,
                user_agent TEXT    NOT NULL,
                expires_at TEXT    NOT NULL,
                created_at TEXT    NOT NULL
            )
        ");
        $db->exec("CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)");

        // ── Pages ──
        // Tracks what pages exist and their navigation order.
        // Content lives in PHP page files on disk — this table is
        // the registry, not the content store.
        $db->exec("
            CREATE TABLE IF NOT EXISTS pages (
                id                 INTEGER PRIMARY KEY AUTOINCREMENT,
                slug               TEXT    NOT NULL UNIQUE,
                title              TEXT    NOT NULL,
                description        TEXT    NULL,
                file_path          TEXT    NOT NULL,
                page_type          TEXT    NOT NULL DEFAULT 'page' CHECK(page_type IN ('page', 'collection_index', 'collection_item')),
                collection_type    TEXT    NULL,
                collection_item_id TEXT    NULL,
                nav_order          INTEGER NULL,
                nav_label          TEXT    NULL,
                nav_parent_id      INTEGER NULL REFERENCES pages(id) ON DELETE SET NULL,
                is_published       INTEGER NOT NULL DEFAULT 1,
                is_homepage        INTEGER NOT NULL DEFAULT 0,
                last_ai_edit       TEXT    NULL,
                created_at         TEXT    NOT NULL,
                updated_at         TEXT    NOT NULL
            )
        ");

        // ── Conversations ──
        // Groups related prompts into threads. A conversation
        // can be scoped to a specific page or site-wide.
        $db->exec("
            CREATE TABLE IF NOT EXISTS conversations (
                id         TEXT    PRIMARY KEY,
                user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title      TEXT    NULL,
                page_scope TEXT    NULL,
                is_active  INTEGER NOT NULL DEFAULT 1,
                created_at TEXT    NOT NULL,
                updated_at TEXT    NOT NULL
            )
        ");

        // ── Prompt Log ──
        // Every AI interaction is recorded for history, debugging,
        // and cost tracking. This is the source of truth for what
        // the AI was asked and what it produced.
        $db->exec("
            CREATE TABLE IF NOT EXISTS prompt_log (
                id                INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id   TEXT    NULL REFERENCES conversations(id) ON DELETE SET NULL,
                revision_id       INTEGER NULL,
                user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                action_type       TEXT    NULL,
                action_data       TEXT    NULL,
                user_prompt       TEXT    NOT NULL,
                system_prompt_hash TEXT   NULL,
                context_summary   TEXT    NULL,
                ai_response       TEXT    NULL,
                ai_provider       TEXT    NOT NULL,
                ai_model          TEXT    NOT NULL,
                files_modified    TEXT    NULL,
                tokens_input      INTEGER NULL,
                tokens_output     INTEGER NULL,
                cost_estimate     REAL    NULL,
                duration_ms       INTEGER NULL,
                status            TEXT    NOT NULL DEFAULT 'success' CHECK(status IN ('success', 'error', 'partial', 'streaming')),
                error_message     TEXT    NULL,
                created_at        TEXT    NOT NULL
            )
        ");

        // ── Revisions ──
        // The undo/redo backbone. Every AI interaction that modifies
        // files creates a revision. The before/after file states live
        // on disk at _studio/revisions/{id}/before/ and /after/.
        // files_changed is a JSON array of {path, action, had_previous}.
        $db->exec("
            CREATE TABLE IF NOT EXISTS revisions (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                prompt_log_id INTEGER NULL REFERENCES prompt_log(id) ON DELETE SET NULL,
                user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                description   TEXT    NOT NULL,
                files_changed TEXT    NOT NULL,
                is_undone     INTEGER NOT NULL DEFAULT 0,
                created_at    TEXT    NOT NULL
            )
        ");
        $db->exec("CREATE INDEX IF NOT EXISTS idx_revisions_created ON revisions(created_at)");

        // Add FK from prompt_log to revisions now that both tables exist
        // (SQLite doesn't support ALTER TABLE ADD CONSTRAINT, but the
        // column is already defined as INTEGER NULL above)

        // ── Snapshots ──
        // Full site state archives. Created manually, before publish,
        // or automatically before destructive operations.
        $db->exec("
            CREATE TABLE IF NOT EXISTS snapshots (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                filename        TEXT    NOT NULL,
                snapshot_type   TEXT    NOT NULL DEFAULT 'manual' CHECK(snapshot_type IN ('manual', 'pre_publish', 'auto')),
                label           TEXT    NULL,
                description     TEXT    NULL,
                trigger_prompt  TEXT    NULL,
                file_count      INTEGER NOT NULL DEFAULT 0,
                size_bytes      INTEGER NOT NULL DEFAULT 0,
                created_by      INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
                created_at      TEXT    NOT NULL
            )
        ");

        // ── Collections ──
        // Lightweight index for structured content groups.
        // Schemas live in JSON files, data in JSON files.
        // This table tracks what collections exist.
        $db->exec("
            CREATE TABLE IF NOT EXISTS collections (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                slug            TEXT    NOT NULL UNIQUE,
                name            TEXT    NOT NULL,
                description     TEXT    NULL,
                schema_version  INTEGER NOT NULL DEFAULT 1,
                item_count      INTEGER NOT NULL DEFAULT 0,
                index_page_id   INTEGER NULL REFERENCES pages(id) ON DELETE SET NULL,
                created_at      TEXT    NOT NULL,
                updated_at      TEXT    NOT NULL
            )
        ");

        // ── Settings ──
        // Key-value store for all configuration. Values are
        // JSON-encoded for flexibility (strings, numbers,
        // booleans, objects all store cleanly).
        $db->exec("
            CREATE TABLE IF NOT EXISTS settings (
                key        TEXT PRIMARY KEY,
                value      TEXT NULL,
                updated_at TEXT NOT NULL
            )
        ");

        // ── Login Attempts ──
        // Rate limiting storage. Max 5 attempts per IP per
        // 15 minutes. Without this, brute-force is trivial.
        $db->exec("
            CREATE TABLE IF NOT EXISTS login_attempts (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                ip_address   TEXT    NOT NULL,
                email        TEXT    NULL,
                success      INTEGER NOT NULL DEFAULT 0,
                attempted_at TEXT    NOT NULL
            )
        ");
        $db->exec("CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts(ip_address, attempted_at)");

        // ── Seed default settings ──
        $now = gmdate('Y-m-d\TH:i:s\Z');
        $defaults = [
            'site_name'          => json_encode('My Website'),
            'site_tagline'       => json_encode(''),
            'site_language'      => json_encode('en'),
            'site_url'           => json_encode(''),
            'site_favicon'       => json_encode(null),
            'ai_provider'        => json_encode('claude'),
            'ai_claude_api_key'  => json_encode(null),
            'ai_claude_model'    => json_encode('claude-sonnet-4-5-20250514'),
            'ai_max_tokens'      => json_encode(32000),
            'design_tokens'      => json_encode(null),
            'nav_style'          => json_encode('standard'),
            'mobile_nav_style'   => json_encode('hamburger'),
            'footer_style'       => json_encode('standard'),
            'installed_at'       => json_encode(null),
            'version'            => json_encode('1.0.0'),
            'schema_version'     => json_encode('1.0.0'),
            'last_published_at'  => json_encode(null),
            'auto_snapshot'      => json_encode(true),
            'max_snapshots'      => json_encode(50),
            'max_revisions'      => json_encode(100),
            'revision_pointer'   => json_encode(0),
        ];

        foreach ($defaults as $key => $value) {
            $db->insert('settings', [
                'key'        => $key,
                'value'      => $value,
                'updated_at' => $now,
            ]);
        }

        // ── Performance indexes ──
        // Hot query paths: conversation listings, per-user history,
        // session lookups. All IF NOT EXISTS for idempotency.
        $db->exec(
            "CREATE INDEX IF NOT EXISTS idx_prompt_log_conversation
             ON prompt_log (conversation_id, created_at)"
        );
        $db->exec(
            "CREATE INDEX IF NOT EXISTS idx_prompt_log_user
             ON prompt_log (user_id, created_at DESC)"
        );
        $db->exec(
            "CREATE INDEX IF NOT EXISTS idx_conversations_user
             ON conversations (user_id, updated_at DESC)"
        );
        $db->exec(
            "CREATE INDEX IF NOT EXISTS idx_sessions_user
             ON sessions (user_id)"
        );
    },

    'down' => function (\VoxelSite\Database $db) {
        $tables = [
            'login_attempts', 'settings', 'collections', 'snapshots',
            'revisions', 'prompt_log', 'conversations', 'pages',
            'sessions', 'users',
        ];
        foreach ($tables as $table) {
            $db->exec("DROP TABLE IF EXISTS {$table}");
        }
    },
];
