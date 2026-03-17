#!/usr/bin/env php
<?php

declare(strict_types=1);

/**
 * VoxelSite Agent API — Detached Prompt Worker
 *
 * This script runs as a background CLI process, spawned via exec() from
 * the POST /prompt endpoint. It executes AI prompts in headless mode
 * (no SSE, no browser connection) and writes progress to the database.
 *
 * Usage (spawned by prompt.php, never called directly):
 *   php prompt-runner.php --job=42 --key-id=7 --root=/path/to/site
 *
 * The process is fully detached from FPM — it outlives the parent request.
 * Progress is tracked via last_progress_at heartbeats in prompt_log.
 *
 * @see _studio/api/agent/v1/prompt.php — the endpoint that spawns this
 * @see agent_api_prompt_feasibility.md — the architecture document
 */

// ── Parse CLI arguments ──
$options = getopt('', ['job:', 'key-id:', 'root:']);

$jobId  = isset($options['job']) ? (int) $options['job'] : 0;
$keyId  = isset($options['key-id']) ? (int) $options['key-id'] : 0;
$siteRoot = $options['root'] ?? '';

if ($jobId <= 0 || $keyId <= 0 || $siteRoot === '') {
    fwrite(STDERR, "Usage: php prompt-runner.php --job=ID --key-id=ID --root=/path\n");
    exit(1);
}

if (!is_dir($siteRoot) || !file_exists($siteRoot . '/_studio/engine/bootstrap.php')) {
    fwrite(STDERR, "Invalid site root: {$siteRoot}\n");
    exit(1);
}

// ── Bootstrap the engine ──
// Change to the site root so all relative paths resolve correctly
chdir($siteRoot);
require $siteRoot . '/_studio/engine/bootstrap.php';

use VoxelSite\Database;
use VoxelSite\Logger;
use VoxelSite\Settings;
use VoxelSite\PromptEngine;

// Remove time limits — prompts can run 10+ minutes
set_time_limit(0);
ini_set('max_execution_time', '0');

Logger::info('prompt-worker', 'Worker started', [
    'job_id'  => $jobId,
    'key_id'  => $keyId,
    'root'    => $siteRoot,
    'pid'     => getmypid(),
]);

try {
    $db = Database::getInstance();
    $settings = new Settings($db);

    // ── Validate: prompt_log row exists with correct state ──
    $job = $db->queryOne(
        'SELECT id, user_id, conversation_id, action_type, action_data,
                user_prompt, status, api_key_id
         FROM prompt_log WHERE id = ? LIMIT 1',
        [$jobId]
    );

    if (!$job) {
        Logger::error('prompt-worker', 'Job not found', ['job_id' => $jobId]);
        exit(1);
    }

    if ($job['status'] !== 'queued') {
        Logger::warning('prompt-worker', 'Job not in queued state, skipping', [
            'job_id' => $jobId,
            'status' => $job['status'],
        ]);
        exit(0);
    }

    if ((int) $job['api_key_id'] !== $keyId) {
        Logger::error('prompt-worker', 'Key ID mismatch', [
            'job_id'   => $jobId,
            'expected' => $keyId,
            'actual'   => $job['api_key_id'],
        ]);
        exit(1);
    }

    // ── Transition: queued → streaming ──
    $db->update('prompt_log', [
        'status'           => 'streaming',
        'status_message'   => 'Starting...',
        'last_progress_at' => now(),
    ], 'id = ?', [$jobId]);

    Logger::info('prompt-worker', 'Job transitioned to streaming', [
        'job_id'  => $jobId,
        'user_id' => $job['user_id'],
    ]);

    // ── Execute the prompt via PromptEngine in headless mode ──
    $engine = new PromptEngine($db, $settings);

    // Read page_scope from the conversation (where the endpoint stored it)
    $pageScope = null;
    if (!empty($job['conversation_id'])) {
        $conv = $db->queryOne(
            'SELECT page_scope FROM conversations WHERE id = ? LIMIT 1',
            [$job['conversation_id']]
        );
        $pageScope = $conv['page_scope'] ?? null;
    }

    $request = [
        'user_id'         => (int) $job['user_id'],
        'user_prompt'     => $job['user_prompt'],
        'action_type'     => $job['action_type'] ?? 'free_prompt',
        'action_data'     => !empty($job['action_data']) ? json_decode($job['action_data'], true) : [],
        'conversation_id' => $job['conversation_id'],
        'page_scope'      => $pageScope,
        'headless'        => true,
        'prompt_log_id'   => $jobId,
    ];

    $engine->execute($request);

    // If execute() completes without exception but doesn't update
    // the status (defensive), mark it success now
    $finalJob = $db->queryOne(
        'SELECT status FROM prompt_log WHERE id = ? LIMIT 1',
        [$jobId]
    );
    if ($finalJob && $finalJob['status'] === 'streaming') {
        $db->update('prompt_log', [
            'status'           => 'success',
            'status_message'   => null,
            'last_progress_at' => now(),
        ], 'id = ?', [$jobId]);
    }

    Logger::info('prompt-worker', 'Job completed', [
        'job_id' => $jobId,
        'status' => $finalJob['status'] ?? 'unknown',
    ]);

} catch (\Throwable $e) {
    Logger::exception('prompt-worker', $e, [
        'job_id' => $jobId,
    ]);

    // Mark as error so the API can report failure
    try {
        $db->update('prompt_log', [
            'status'           => 'error',
            'error_message'    => mb_substr($e->getMessage(), 0, 500),
            'status_message'   => null,
            'last_progress_at' => now(),
        ], 'id = ?', [$jobId]);
    } catch (\Throwable $dbError) {
        // Last resort — at least log it
        fwrite(STDERR, "Could not update job status: {$dbError->getMessage()}\n");
    }

    exit(1);
}
