<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.11',
    'description'=>'Explicitly bind REST operation credentials to current accounts',
    'up'=>static function(\VoxelSite\Database $db):void {
        // This is a one-time upgrade decision, never a request-time identity
        // fallback. Replaying the migration must not adopt keys created later.
        $exists=(bool)$db->scalar("SELECT name FROM sqlite_master WHERE type='table' AND name='agent_rest_owners'");
        $db->exec('CREATE TABLE IF NOT EXISTS agent_rest_owners (
            key_id INTEGER PRIMARY KEY REFERENCES api_keys(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            bound_by INTEGER NOT NULL, bound_at INTEGER NOT NULL
        )');
        if($exists)return;
        $owners=$db->query("SELECT * FROM users WHERE role='owner' LIMIT 2");
        if(count($owners)!==1 || !empty($owners[0]['disabled_at'])
            || (array_key_exists('is_active',$owners[0]) && !$owners[0]['is_active']))return;
        // Legacy keys had no account column. The sole existing owner is the
        // only unambiguous identity; key role, grants, audience and hashes stay
        // untouched and ActorPolicy continues to narrow every adapter request.
        $insert=$db->getPdo()->prepare("INSERT INTO agent_rest_owners(key_id,user_id,bound_by,bound_at)
            SELECT id,?,?,? FROM api_keys WHERE audience='rest'");
        $insert->execute([(int)$owners[0]['id'],(int)$owners[0]['id'],time()]);
    },
    'down'=>static function(\VoxelSite\Database $db):void {
        $db->exec('DROP TABLE IF EXISTS agent_rest_owners');
    },
];
