<?php
return [
    'version' => '1.31.0.4',
    'description' => 'Make previously enabled preview routing active for the AI Router on/off control',
    'up' => function (\VoxelSite\Database $db) {
        // Keep key/model configuration intact. No external calls during migration.
        $db->exec('UPDATE settings SET value = \'"enforce"\' WHERE key = \'governor.mode\' AND value = \'"shadow"\'');
    },
    'down' => function (\VoxelSite\Database $db) { /* Enabled modes cannot be distinguished after migration. */ },
];
