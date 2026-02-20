<?php

declare(strict_types=1);

/**
 * AI API Endpoints
 *
 * POST /ai/prompt          — Execute an AI interaction (streaming SSE)
 * GET  /ai/history          — Get prompt history
 * GET  /ai/conversations    — List conversations
 * GET  /ai/conversations/:id — Get conversation detail
 */

use VoxelSite\PromptEngine;
use VoxelSite\Database;
use VoxelSite\ResponseParser;

$method = $_REQUEST['_route_method'];
$path = $_REQUEST['_route_path'];
$params = $_REQUEST['_route_params'] ?? [];
$user = $_REQUEST['_user'];

// ═══════════════════════════════════════════
//  POST /ai/prompt — The main event
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/ai/prompt') {
    $body = getJsonBody();

    if (empty($body['user_prompt']) && empty($body['action_data'])) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Say something. The prompt can\'t be empty.',
        ]], 422);
        return;
    }

    // ── Recover stale "streaming" prompts ──
    // If the PHP process was killed mid-stream (SIGKILL), the shutdown
    // handler never fires and prompt_log stays in 'streaming' forever.
    // Mark any entry stuck in 'streaming' for >3 minutes as 'partial'.
    $db = Database::getInstance();
    $staleThreshold = gmdate('Y-m-d H:i:s', time() - 180);
    $stale = $db->query(
        "SELECT id FROM prompt_log WHERE status = 'streaming' AND created_at < ?",
        [$staleThreshold]
    );
    if (!empty($stale)) {
        foreach ($stale as $row) {
            $db->update('prompt_log', [
                'status'        => 'partial',
                'error_message' => 'Generation was interrupted (process terminated by server).',
            ], 'id = ?', [$row['id']]);
        }
        \VoxelSite\Logger::warning('ai', 'Recovered stale streaming prompts', [
            'count' => count($stale),
            'ids'   => array_column($stale, 'id'),
        ]);
        // Compile Tailwind for whatever files were written before the crash
        $fm = new \VoxelSite\FileManager();
        $fm->ensureStyleCssExists();
        $fm->compileTailwind();
    }

    $engine = new PromptEngine();

    // This method handles its own SSE output and doesn't return JSON
    $engine->execute([
        'action_type'     => $body['action_type'] ?? 'free_prompt',
        'action_data'     => $body['action_data'] ?? [],
        'user_prompt'     => $body['user_prompt'] ?? '',
        'page_scope'      => $body['page_scope'] ?? null,
        'conversation_id' => $body['conversation_id'] ?? null,
        'user_id'         => $user['id'],
    ]);

    return;
}

// ═══════════════════════════════════════════
//  GET /ai/history — Recent prompts
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/ai/history') {
    $db = Database::getInstance();
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));

    $history = $db->query(
        "SELECT id, conversation_id, action_type, user_prompt, files_modified,
                tokens_input, tokens_output, cost_estimate, duration_ms,
                status, created_at
         FROM prompt_log
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ?",
        [$user['id'], $limit]
    );

    jsonResponse(['ok' => true, 'data' => ['history' => $history]]);
    return;
}

// ═══════════════════════════════════════════
//  GET /ai/conversations
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/ai/conversations') {
    $db = Database::getInstance();

    $conversations = $db->query(
        "SELECT id, title, page_scope, is_active, created_at, updated_at
         FROM conversations
         WHERE user_id = ?
         ORDER BY updated_at DESC
         LIMIT 50",
        [$user['id']]
    );

    jsonResponse(['ok' => true, 'data' => ['conversations' => $conversations]]);
    return;
}

// ═══════════════════════════════════════════
//  GET /ai/conversations/:id
// ═══════════════════════════════════════════

if ($method === 'GET' && str_starts_with($path, '/ai/conversations/')) {
    $db = Database::getInstance();
    $parser = new ResponseParser();
    $conversationId = $params['id'] ?? '';
    $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
    $requestedOffset = max(0, (int)($_GET['offset'] ?? 0));
    $hasExplicitOffset = array_key_exists('offset', $_GET);

    $conversation = $db->queryOne(
        'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
        [$conversationId, $user['id']]
    );

    if ($conversation === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Conversation not found.',
        ]], 404);
        return;
    }

    $totalPromptsRow = $db->queryOne(
        "SELECT COUNT(*) AS count
         FROM prompt_log
         WHERE conversation_id = ? AND user_id = ?",
        [$conversationId, $user['id']]
    );
    $totalPrompts = (int)($totalPromptsRow['count'] ?? 0);
    $offset = $hasExplicitOffset
        ? $requestedOffset
        : max(0, $totalPrompts - $limit);

    $prompts = $db->query(
        "SELECT id, action_type, user_prompt, ai_response, files_modified,
                tokens_input, tokens_output, cost_estimate, status, created_at
         FROM prompt_log
         WHERE conversation_id = ? AND user_id = ?
         ORDER BY created_at ASC
         LIMIT ? OFFSET ?",
        [$conversationId, $user['id'], $limit, $offset]
    );

    // Auto-expire stale 'streaming' prompts.
    // If a prompt has been stuck in 'streaming' for more than 3 minutes,
    // the PHP process was killed (SIGKILL, OOM, server restart). Mark it
    // as 'partial' so the UI stops polling and the user can continue.
    $staleThreshold = 180; // 3 minutes
    $hasStale = false;
    foreach ($prompts as &$prompt) {
        if ($prompt['status'] === 'streaming') {
            $createdTs = strtotime($prompt['created_at'] ?? '');
            if ($createdTs && (time() - $createdTs) > $staleThreshold) {
                $db->update('prompt_log', [
                    'status'        => 'partial',
                    'error_message' => 'Generation was interrupted (process terminated by server).',
                ], 'id = ?', [$prompt['id']]);
                $prompt['status'] = 'partial';
                $hasStale = true;
            }
        }

        $prompt['ai_message'] = '';
        if (!empty($prompt['ai_response'])) {
            $prompt['ai_message'] = $parser->extractAssistantMessage((string) $prompt['ai_response']);
        }
    }
    unset($prompt);

    // If we recovered stale prompts, compile Tailwind for the partial files
    if ($hasStale) {
        $fm = new \VoxelSite\FileManager();
        $fm->ensureStyleCssExists();
        $fm->compileTailwind();
    }

    $conversation['prompts'] = $prompts;
    $conversation['pagination'] = [
        'limit' => $limit,
        'offset' => $offset,
        'requested_offset' => $requestedOffset,
        'count' => count($prompts),
        'total' => $totalPrompts,
    ];

    jsonResponse(['ok' => true, 'data' => ['conversation' => $conversation]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /ai/cancel-generation — Cancel a stuck generation
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/ai/cancel-generation') {
    $db = Database::getInstance();
    $body = getJsonBody();
    $promptId = (int) ($body['prompt_id'] ?? 0);

    if ($promptId <= 0) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Missing prompt_id.',
        ]], 422);
        return;
    }

    // Only allow cancelling the user's own streaming prompts
    $prompt = $db->queryOne(
        'SELECT id, status FROM prompt_log WHERE id = ? AND user_id = ?',
        [$promptId, $user['id']]
    );

    if (!$prompt) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Prompt not found.',
        ]], 404);
        return;
    }

    if ($prompt['status'] !== 'streaming') {
        jsonResponse(['ok' => true, 'data' => ['already_resolved' => true]]);
        return;
    }

    $db->update('prompt_log', [
        'status'        => 'error',
        'error_message' => 'Generation was cancelled.',
    ], 'id = ?', [$promptId]);

    jsonResponse(['ok' => true, 'data' => ['cancelled' => true]]);
    return;
}

// ═══════════════════════════════════════════
//  GET /ai/diagnostics — Server environment check
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/ai/diagnostics') {
    $db = Database::getInstance();
    $studioDir = dirname(__DIR__);
    $siteRoot = dirname($studioDir);

    // Check file system
    $assetsDir = $siteRoot . '/assets';
    $cssDir = $assetsDir . '/css';
    $previewDir = $studioDir . '/preview';

    // Recent prompts
    $recentPrompts = $db->query(
        "SELECT id, status, error_message, tokens_output, cost_estimate,
                duration_ms, files_modified, created_at
         FROM prompt_log
         ORDER BY created_at DESC
         LIMIT 5",
        []
    );

    // Check PHP settings that affect execution
    $diagnostics = [
        'server' => [
            'php_version'                => phpversion(),
            'sapi'                       => php_sapi_name(),
            'max_execution_time'         => ini_get('max_execution_time'),
            'max_input_time'             => ini_get('max_input_time'),
            'memory_limit'               => ini_get('memory_limit'),
            'request_terminate_timeout'  => ini_get('request_terminate_timeout') ?: 'not set (unlimited)',
            'ignore_user_abort'          => ini_get('ignore_user_abort') ? 'on' : 'off',
            'output_buffering'           => ini_get('output_buffering'),
            'open_basedir'               => ini_get('open_basedir') ?: 'not set',
            'disable_functions'          => ini_get('disable_functions') ?: 'none',
            'server_software'            => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
        ],
        'paths' => [
            'site_root'         => $siteRoot,
            'site_root_exists'  => is_dir($siteRoot),
            'assets_dir'        => $assetsDir,
            'assets_exists'     => is_dir($assetsDir),
            'assets_writable'   => is_writable($assetsDir),
            'css_dir'           => $cssDir,
            'css_dir_exists'    => is_dir($cssDir),
            'css_dir_writable'  => is_dir($cssDir) && is_writable($cssDir),
            'preview_dir'       => $previewDir,
            'preview_exists'    => is_dir($previewDir),
            'preview_writable'  => is_writable($previewDir),
        ],
        'files' => [
            'style_css_exists'   => file_exists($cssDir . '/style.css'),
            'style_css_size'     => file_exists($cssDir . '/style.css') ? filesize($cssDir . '/style.css') : 0,
            'tailwind_css_exists'=> file_exists($cssDir . '/tailwind.css'),
            'tailwind_css_size'  => file_exists($cssDir . '/tailwind.css') ? filesize($cssDir . '/tailwind.css') : 0,
        ],
        'recent_prompts' => $recentPrompts,
    ];

    // Check if log file is writable
    $logDir = $studioDir . '/logs';
    $diagnostics['paths']['log_dir'] = $logDir;
    $diagnostics['paths']['log_dir_exists'] = is_dir($logDir);
    $diagnostics['paths']['log_dir_writable'] = is_dir($logDir) && is_writable($logDir);

    jsonResponse(['ok' => true, 'data' => $diagnostics]);
    return;
}

jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'AI endpoint not found.',
]], 404);
