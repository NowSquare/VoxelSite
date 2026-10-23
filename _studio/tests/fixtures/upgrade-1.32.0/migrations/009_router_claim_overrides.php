<?php

/** Owner decisions only; candidate text and credentials never belong here. */
return [
    'version' => '1.31.0.2',
    'description' => 'Record candidate-bound owner claim overrides',
    'up' => function (\VoxelSite\Database $db) {
        $db->exec("
            CREATE TABLE IF NOT EXISTS governor_claim_overrides (
                id                 INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at         TEXT NOT NULL,
                reason             TEXT NOT NULL CHECK(length(trim(reason)) BETWEEN 1 AND 1000),
                candidate_hash     TEXT NOT NULL CHECK(length(candidate_hash) = 64 AND candidate_hash NOT GLOB '*[^a-f0-9]*'),
                preview_root_hash  TEXT NOT NULL CHECK(length(preview_root_hash) = 64 AND preview_root_hash NOT GLOB '*[^a-f0-9]*'),
                file_path          TEXT NOT NULL,
                source_address     TEXT NOT NULL,
                content_hash       TEXT NOT NULL CHECK(length(content_hash) = 64 AND content_hash NOT GLOB '*[^a-f0-9]*'),
                expected_file_hash TEXT NOT NULL CHECK(length(expected_file_hash) = 64 AND expected_file_hash NOT GLOB '*[^a-f0-9]*'),
                consumed_at        TEXT NULL
            )
        ");
    },
    'down' => function (\VoxelSite\Database $db) {
        $db->exec('DROP TABLE IF EXISTS governor_claim_overrides');
    },
];
