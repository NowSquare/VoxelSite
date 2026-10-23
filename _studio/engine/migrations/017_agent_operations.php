<?php
declare(strict_types=1);
return [
    'version' => '1.33.0.4',
    'description' => 'Retain external operation identity, checkpoints and recovery outcomes',
    'up' => static function (\VoxelSite\Database $db): void {
        // Historical identities intentionally survive account/key deletion. Never
        // cascade away an unresolved operation or its workspace reservation.
        $db->exec("CREATE TABLE IF NOT EXISTS agent_operations (
            id TEXT PRIMARY KEY, operation_id TEXT NOT NULL, actor_key TEXT NOT NULL,
            user_id INTEGER NOT NULL, credential_id INTEGER, actor_json TEXT NOT NULL,
            kind TEXT NOT NULL, request_digest TEXT NOT NULL, request_json TEXT,
            preparation_id TEXT, state TEXT NOT NULL CHECK(state IN
                ('prepared','applying','succeeded','failed_restored','recovery_required','expired','cancelled')),
            phase TEXT NOT NULL DEFAULT 'prepared', checkpoint_number INTEGER NOT NULL DEFAULT 0,
            checkpoint_json TEXT NOT NULL DEFAULT '{}', lease_token TEXT, lease_expires_at INTEGER,
            before_version TEXT NOT NULL, after_version TEXT, recovery_json TEXT NOT NULL DEFAULT '{}',
            result_json TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
            expires_at INTEGER NOT NULL, result_pruned_at INTEGER,
            UNIQUE(actor_key, operation_id)
        )");
        $db->exec('CREATE INDEX IF NOT EXISTS idx_agent_operations_state ON agent_operations(state, updated_at)');
    },
    'down' => static function (\VoxelSite\Database $db): void {
        if ($db->scalar("SELECT COUNT(*) FROM agent_operations WHERE state IN ('applying','recovery_required')")) {
            throw new \RuntimeException('Resolve pending MCP operations before removing their journal.');
        }
        $db->exec('DROP TABLE IF EXISTS agent_operations');
    },
];
