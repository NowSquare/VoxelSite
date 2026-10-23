<?php
declare(strict_types=1);
return [
    'version' => '1.33.0.17',
    'description' => 'Retain typed configuration requests, prompt versions and mail dispatch intent',
    'up' => static function (\VoxelSite\Database $db): void {
        $db->exec("CREATE TABLE IF NOT EXISTS agent_configuration_requests (
            id TEXT PRIMARY KEY, actor_key TEXT NOT NULL, operation_id TEXT NOT NULL,
            kind TEXT NOT NULL, request_digest TEXT NOT NULL, payload_json TEXT,
            created_at INTEGER NOT NULL, UNIQUE(actor_key,operation_id)
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS agent_mail_dispatches (
            operation_internal_id TEXT PRIMARY KEY, recipient TEXT NOT NULL, configuration_version TEXT NOT NULL,
            state TEXT NOT NULL CHECK(state IN ('dispatching','accepted','failed','unknown')),
            started_at INTEGER NOT NULL, finished_at INTEGER
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS agent_prompt_versions (
            id INTEGER PRIMARY KEY, path TEXT NOT NULL, before_hash TEXT NOT NULL, after_hash TEXT NOT NULL,
            operation_internal_id TEXT NOT NULL UNIQUE, actor_json TEXT NOT NULL,
            before_content TEXT, after_content TEXT, created_at INTEGER NOT NULL
        )");
    },
    'down' => static function (\VoxelSite\Database $db): void {
        foreach (['agent_configuration_requests', 'agent_mail_dispatches', 'agent_prompt_versions'] as $table) {
            if ($db->count($table)) throw new \RuntimeException('Retained configuration history must not be discarded.');
        }
        foreach (['agent_prompt_versions', 'agent_mail_dispatches', 'agent_configuration_requests'] as $table) $db->exec('DROP TABLE ' . $table);
    },
];
