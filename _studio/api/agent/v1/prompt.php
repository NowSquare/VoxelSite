<?php

declare(strict_types=1);

/**
 * VoxelSite Agent API v1 — Prompt Endpoint
 *
 * POST /prompt    — Queue an AI prompt for background execution
 * GET  /prompt/:id — Poll prompt status and results
 *
 * Prompts run in a detached CLI worker process so the API can
 * return 202 Accepted immediately. Callers poll GET /prompt/:id
 * for progress and results.
 *
 * Per-key isolation: every prompt is tagged with api_key_id.
 * GET /prompt/:id only returns prompts created by the same key.
 *
 * @see _studio/worker/prompt-runner.php — the background worker
 * @see _studio/engine/PromptEngine.php  — the AI engine (headless mode)
 */

$method  = $_agentContext['method'];
$params  = $_agentContext['params'];
$keyData = $_agentContext['keyData'];
$settings = $_agentContext['settings'];
$db = \VoxelSite\Database::getInstance();

// ═══════════════════════════════════════════
//  POST /prompt — Queue a new prompt
// ═══════════════════════════════════════════

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) {
        agentError(400, 'invalid_json', 'Request body must be valid JSON.');
        return;
    }

    // ── Validate required fields ──
    $userPrompt = trim($body['prompt'] ?? '');
    if ($userPrompt === '') {
        agentError(422, 'validation_error', 'The "prompt" field is required and cannot be empty.');
        return;
    }

    // ── Validate action_type ──
    $allowedActions = [
        'free_prompt', 'edit_page', 'change_design', 'add_section',
        'section_edit', 'optimize_aeo', 'inline_edit',
        // import_site and restyle_site are excluded — they require
        // URL fetching and interactive reference handling.
    ];
    $actionType = $body['action_type'] ?? 'free_prompt';
    if (!in_array($actionType, $allowedActions, true)) {
        agentError(422, 'validation_error', "Invalid action_type: {$actionType}. Allowed: " . implode(', ', $allowedActions));
        return;
    }

    // ── Validate action_data ──
    $actionData = $body['action_data'] ?? [];
    if (!is_array($actionData)) {
        agentError(422, 'validation_error', 'action_data must be an object.');
        return;
    }

    // ── Validate page_scope ──
    $pageScope = $body['page_scope'] ?? null;
    if ($pageScope !== null && !is_string($pageScope)) {
        agentError(422, 'validation_error', 'page_scope must be a string (slug) or null.');
        return;
    }

    // ── Validate continue_from (replaces caller-supplied conversation_id) ──
    $conversationId = null;
    $continueFrom = $body['continue_from'] ?? null;

    if ($continueFrom !== null) {
        // continue_from is a prompt_log ID — look up its conversation
        // and verify it belongs to the same API key
        $prevPrompt = $db->queryOne(
            'SELECT conversation_id, api_key_id FROM prompt_log WHERE id = ? LIMIT 1',
            [(int) $continueFrom]
        );

        if (!$prevPrompt) {
            agentError(404, 'not_found', "Prompt {$continueFrom} not found.");
            return;
        }

        if ((int) ($prevPrompt['api_key_id'] ?? 0) !== (int) $keyData['id']) {
            agentError(403, 'forbidden', 'Cannot continue a prompt from a different API key.');
            return;
        }

        $conversationId = $prevPrompt['conversation_id'];
    }

    // ── Check exec() availability ──
    if (!function_exists('exec')) {
        \VoxelSite\Logger::error('agent-api', 'exec() not available for prompt execution', [
            'key_label' => $keyData['label'] ?? 'unknown',
        ]);
        agentError(503, 'exec_unavailable', 'exec() is not available on this server. Prompt execution requires CLI access.');
        return;
    }

    // ── Resolve the site owner for the prompt ──
    $owner = $db->queryOne(
        "SELECT id FROM users WHERE role = 'owner' ORDER BY id ASC LIMIT 1"
    );
    if (!$owner) {
        agentError(500, 'no_owner', 'No site owner found. The installation may be incomplete.');
        return;
    }
    $ownerId = (int) $owner['id'];

    // ── Create a conversation if needed ──
    if ($conversationId === null) {
        // UUID v4 generation (same as PromptEngine::generateUuid)
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // Version 4
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // Variant 1
        $conversationId = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));

        $title = mb_substr($userPrompt, 0, 60);
        if (mb_strlen($userPrompt) > 60) {
            $title .= '...';
        }

        $db->insert('conversations', [
            'id'         => $conversationId,
            'user_id'    => $ownerId,
            'api_key_id' => (int) $keyData['id'],
            'title'      => $title,
            'page_scope' => $pageScope,
            'is_active'  => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    // ── Pre-allocate the prompt_log row with status 'queued' ──
    $promptLogId = $db->insert('prompt_log', [
        'conversation_id' => $conversationId,
        'user_id'         => $ownerId,
        'api_key_id'      => (int) $keyData['id'],
        'action_type'     => $actionType,
        'action_data'     => !empty($actionData) ? json_encode($actionData) : null,
        'user_prompt'     => $userPrompt,
        'ai_provider'     => $settings->get('ai_provider', 'claude'),
        'ai_model'        => 'pending',
        'status'          => 'queued',
        'status_message'  => 'Waiting for worker...',
        'last_progress_at' => now(),
        'created_at'      => now(),
    ]);

    // ── Spawn the background worker ──
    $phpBinary   = PHP_BINARY ?: '/usr/bin/php';
    $workerScript = dirname(__DIR__, 3) . '/worker/prompt-runner.php';
    $siteRoot    = dirname(__DIR__, 4);
    $logDir      = dirname(__DIR__, 3) . '/logs';
    $logFile     = $logDir . '/prompt-worker.log';

    // Ensure logs directory exists
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0755, true);
    }

    $cmd = sprintf(
        '%s %s --job=%d --key-id=%d --root=%s >> %s 2>&1 &',
        escapeshellarg($phpBinary),
        escapeshellarg($workerScript),
        (int) $promptLogId,
        (int) $keyData['id'],
        escapeshellarg($siteRoot),
        escapeshellarg($logFile)
    );

    exec($cmd);

    \VoxelSite\Logger::info('agent-api', 'Prompt worker spawned', [
        'prompt_log_id'   => $promptLogId,
        'conversation_id' => $conversationId,
        'action_type'     => $actionType,
        'key_label'       => $keyData['label'] ?? 'unknown',
        'command'         => mb_substr($cmd, 0, 300),
    ]);

    // ── Return 202 Accepted ──
    agentResponse([
        'data' => [
            'id'              => $promptLogId,
            'conversation_id' => $conversationId,
            'status'          => 'queued',
            'poll_url'        => "/_studio/api/agent/v1/prompt/{$promptLogId}",
        ],
    ], 202);
    return;
}

// ═══════════════════════════════════════════
//  GET /prompt/:id — Poll prompt status
// ═══════════════════════════════════════════

if ($method === 'GET') {
    $promptId = (int) ($params['id'] ?? 0);
    if ($promptId <= 0) {
        agentError(400, 'invalid_id', 'Prompt ID must be a positive integer.');
        return;
    }

    $row = $db->queryOne(
        'SELECT id, conversation_id, user_id, api_key_id, action_type,
                user_prompt, ai_provider, ai_model, files_modified,
                tokens_input, tokens_output, cost_estimate, duration_ms,
                status, status_message, error_message, last_progress_at,
                created_at
         FROM prompt_log WHERE id = ? LIMIT 1',
        [$promptId]
    );

    if (!$row) {
        agentError(404, 'not_found', "Prompt {$promptId} not found.");
        return;
    }

    // ── Per-key isolation: only return prompts created by this key ──
    if ((int) ($row['api_key_id'] ?? 0) !== (int) $keyData['id']) {
        agentError(404, 'not_found', "Prompt {$promptId} not found.");
        return;
    }

    // ── Stale detection ──
    // Check if the worker appears to have died based on last_progress_at
    $lastProgress = $row['last_progress_at'] ? strtotime($row['last_progress_at']) : 0;
    $elapsed = time() - $lastProgress;

    if ($row['status'] === 'queued' && $elapsed > 60) {
        // Worker never started — mark as failed
        $db->update('prompt_log', [
            'status'        => 'error',
            'error_message' => 'Worker failed to start within 60 seconds.',
        ], 'id = ?', [$promptId]);
        $row['status'] = 'error';
        $row['error_message'] = 'Worker failed to start within 60 seconds.';

        \VoxelSite\Logger::warning('agent-api', 'Stale queued prompt detected', [
            'prompt_id'         => $promptId,
            'elapsed_seconds'   => $elapsed,
            'last_progress_at'  => $row['last_progress_at'],
        ]);
    } elseif ($row['status'] === 'streaming' && $elapsed > 300) {
        // Worker appears dead — mark as partial
        $db->update('prompt_log', [
            'status'        => 'partial',
            'error_message' => 'Worker stopped responding after 300 seconds. Partial results may be available.',
        ], 'id = ?', [$promptId]);
        $row['status'] = 'partial';
        $row['error_message'] = 'Worker stopped responding after 300 seconds. Partial results may be available.';

        \VoxelSite\Logger::warning('agent-api', 'Stale streaming prompt detected', [
            'prompt_id'         => $promptId,
            'elapsed_seconds'   => $elapsed,
            'last_progress_at'  => $row['last_progress_at'],
        ]);
    }

    // ── Build response ──
    $response = [
        'id'              => (int) $row['id'],
        'conversation_id' => $row['conversation_id'],
        'action_type'     => $row['action_type'],
        'prompt'          => $row['user_prompt'],
        'status'          => $row['status'],
        'status_message'  => $row['status_message'],
        'ai_provider'     => $row['ai_provider'],
        'ai_model'        => $row['ai_model'],
        'created_at'      => $row['created_at'],
    ];

    // Include results for completed prompts
    if (in_array($row['status'], ['success', 'partial', 'error'], true)) {
        $response['files_modified'] = $row['files_modified']
            ? json_decode($row['files_modified'], true) : [];
        $response['tokens'] = [
            'input'  => $row['tokens_input'] !== null ? (int) $row['tokens_input'] : null,
            'output' => $row['tokens_output'] !== null ? (int) $row['tokens_output'] : null,
        ];
        $response['cost_estimate'] = $row['cost_estimate'] !== null
            ? (float) $row['cost_estimate'] : null;
        $response['duration_ms'] = $row['duration_ms'] !== null
            ? (int) $row['duration_ms'] : null;
        $response['error_message'] = $row['error_message'];
    }

    agentResponse(['data' => $response]);
    return;
}

// Should not reach here — router validates method
agentError(405, 'method_not_allowed', 'Use POST to queue a prompt, GET to check status.');
