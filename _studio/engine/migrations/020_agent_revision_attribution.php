<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.7',
    'description'=>'Attribute externally authored revisions without invented model usage',
    'up'=>static function (\VoxelSite\Database $db): void {
        $db->exec('CREATE TABLE IF NOT EXISTS agent_revision_attribution (
            revision_id INTEGER PRIMARY KEY, operation_id TEXT NOT NULL UNIQUE,
            actor_json TEXT NOT NULL, created_at INTEGER NOT NULL
        )');
    },
    'down'=>static function (\VoxelSite\Database $db): void { $db->exec('DROP TABLE IF EXISTS agent_revision_attribution'); },
];
