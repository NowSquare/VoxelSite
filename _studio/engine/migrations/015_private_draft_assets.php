<?php
declare(strict_types=1);

return [
    'version' => '1.33.0.2',
    'description' => 'Track the shared private draft workspace and its operation reservation',
    'up' => static function (\VoxelSite\Database $db): void {
        // Filesystem migration is explicit and checkpointed. Schema upgrades,
        // including fixture databases, must never copy the installed site's files.
        $db->exec('CREATE TABLE IF NOT EXISTS site_workspace_state (
            id INTEGER PRIMARY KEY CHECK(id = 1),
            format INTEGER NOT NULL DEFAULT 1,
            draft_version INTEGER NOT NULL DEFAULT 0,
            release_id TEXT,
            reservation_operation_id TEXT,
            updated_at INTEGER NOT NULL
        )');
        $db->getPdo()->prepare('INSERT OR IGNORE INTO site_workspace_state (id, updated_at) VALUES (1, ?)')
            ->execute([time()]);
    },
    'down' => static function (\VoxelSite\Database $db): void {
        if ((int) $db->scalar('SELECT format FROM site_workspace_state WHERE id = 1') !== 1) {
            throw new \RuntimeException('Roll back the verified workspace migration before removing its state.');
        }
        $db->exec('DROP TABLE IF EXISTS site_workspace_state');
    },
];
