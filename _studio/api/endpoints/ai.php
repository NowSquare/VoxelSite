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

if ($method === 'GET' && (in_array($path, ['/ai/history', '/ai/conversations', '/ai/diagnostics'], true)
    || str_starts_with($path, '/ai/conversations/'))) {
    require __DIR__ . '/configuration.php';
    return;
}


// ═══════════════════════════════════════════
//  POST /ai/prompt — The main event
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/ai/prompt') {
    $body = getJsonBody();

    $hasImages = !empty($body['images']) && is_array($body['images']);

    if (empty($body['user_prompt']) && empty($body['action_data']) && !$hasImages) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Say something. The prompt can\'t be empty.',
        ]], 422);
        return;
    }

    // ── Validate images ──
    $validatedImages = [];
    if ($hasImages) {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxImages = 5;
        $maxSizeBytes = 5 * 1024 * 1024; // 5MB decoded

        if (count($body['images']) > $maxImages) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'validation',
                'message' => "Maximum {$maxImages} images per message.",
            ]], 422);
            return;
        }

        foreach ($body['images'] as $i => $img) {
            if (empty($img['data']) || empty($img['media_type'])) {
                continue; // Skip malformed entries
            }

            if (!in_array($img['media_type'], $allowedTypes, true)) {
                jsonResponse(['ok' => false, 'error' => [
                    'code'    => 'validation',
                    'message' => "Image " . ($i + 1) . ": unsupported format. Use JPEG, PNG, GIF, or WebP.",
                ]], 422);
                return;
            }

            // Validate base64 and check decoded size
            $decoded = base64_decode($img['data'], true);
            if ($decoded === false) {
                continue; // Skip invalid base64
            }

            if (strlen($decoded) > $maxSizeBytes) {
                jsonResponse(['ok' => false, 'error' => [
                    'code'    => 'validation',
                    'message' => "Image " . ($i + 1) . ": too large (max 5MB).",
                ]], 422);
                return;
            }

            $validatedImages[] = [
                'data'       => $img['data'],
                'media_type' => $img['media_type'],
            ];
        }
    }

    // ── Recover stale "streaming" prompts ──
    // If the PHP process was killed mid-stream (SIGKILL), the shutdown
    // handler never fires and prompt_log stays in 'streaming' forever.
    // Mark any entry stuck in 'streaming' for >3 minutes as 'partial'.
    //
    // Uses COALESCE(last_progress_at, created_at) so that active heartbeats
    // from both interactive and headless modes prevent false expiry.
    // Old rows without last_progress_at (pre-migration 004) fall back
    // to created_at gracefully.
    $db = Database::getInstance();
    $staleThreshold = gmdate('Y-m-d H:i:s', time() - 180);
    $stale = $db->query(
        "SELECT id FROM prompt_log WHERE status = 'streaming' AND COALESCE(last_progress_at, created_at) < ?",
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
        // Recovery must not mutate site files before an enforced gate, including
        // requests that will report a configuration error in PromptEngine.
        $legacyRecovery = false;
        try {
            $mode = (new \VoxelSite\RouterShadow($db, new \VoxelSite\Settings($db)))->checkConfiguration();
            $legacyRecovery = in_array($mode, ['off', 'shadow'], true);
        } catch (\RuntimeException) {
            // Let PromptEngine emit the normal Studio configuration error.
        }
        if ($legacyRecovery) {
            $fm = new \VoxelSite\FileManager();
            $fm->ensureStyleCssExists();
            $fm->compileTailwind();
        }
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
        'images'          => $validatedImages,
    ]);

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

// ═══════════════════════════════════════════
//  POST /ai/check-url — Validate a reference URL before attaching
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/ai/check-url') {
    $body = getJsonBody();
    $url = trim($body['url'] ?? '');

    if ($url === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'URL is required.',
        ]], 422);
        return;
    }

    $importer = new \VoxelSite\SiteImporter();
    $result = $importer->checkUrl($url);

    if ($result['ok']) {
        jsonResponse(['ok' => true, 'data' => [
            'url'   => $result['url'],
            'title' => $result['title'],
        ]]);
    } else {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'unreachable',
            'message' => $result['error'],
        ]], 422);
    }
    return;
}

jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'AI endpoint not found.',
]], 404);
