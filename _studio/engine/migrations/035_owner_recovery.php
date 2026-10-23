<?php
declare(strict_types=1);
return [
    'version' => '1.33.0.22',
    'description' => 'Retain owner-reviewed rollback receipts without changing original attribution',
    'up' => static function (\VoxelSite\Database $db): void {
        $db->exec("CREATE TABLE IF NOT EXISTS agent_owner_recovery_reviews (
            id TEXT PRIMARY KEY, operation_id TEXT NOT NULL, owner_id INTEGER NOT NULL,
            site_key TEXT NOT NULL, state_digest TEXT NOT NULL, digest TEXT NOT NULL,
            review_json TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
            result_json TEXT
        )");
        $db->exec('CREATE INDEX IF NOT EXISTS owner_recovery_operation ON agent_owner_recovery_reviews(operation_id,created_at)');
    },
    'down' => static function (\VoxelSite\Database $db): void {
        if ($db->count('agent_owner_recovery_reviews')) throw new \RuntimeException('Recovery attribution must not be discarded.');
        $db->exec('DROP TABLE agent_owner_recovery_reviews');
    },
];
