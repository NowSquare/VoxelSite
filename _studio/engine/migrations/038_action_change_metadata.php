<?php
declare(strict_types=1);
return [
    'version'=>'1.33.0.25',
    'description'=>'Journal exact Action release provenance and draft configuration versions',
    'up'=>static function(\VoxelSite\Database $db):void {
        $db->exec('ALTER TABLE agent_business_changes ADD COLUMN metadata_json TEXT');
        $db->exec('ALTER TABLE agent_business_changes ADD COLUMN metadata_digest TEXT');
    },
    'down'=>static function(\VoxelSite\Database $db):void {
        if($db->scalar('SELECT COUNT(*) FROM agent_business_changes WHERE metadata_json IS NOT NULL'))throw new \RuntimeException('Retained Action transitions cannot be discarded.');
    },
];
