<?php

declare(strict_types=1);

/**
 * Settings API Endpoints
 *
 * GET  /settings        — Get all settings
 * PUT  /settings        — Update settings
 * POST /settings/test-api — Test AI provider connection
 * GET  /settings/system — System information
 */

use VoxelSite\Settings;
use VoxelSite\Encryption;
use VoxelSite\AIProviderFactory;
use VoxelSite\Validator;

$method = $_REQUEST['_route_method'];
$path = $_REQUEST['_route_path'];

$settings = new Settings();

// ═══════════════════════════════════════════
//  GET /settings — All settings
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/settings') {
    $all = $settings->getAll();

    // Never expose encrypted API keys to the frontend
    // Mask keys for all providers
    $masked = $all;
    $providerIds = ['claude', 'openai', 'gemini', 'deepseek', 'openai_compatible'];
    foreach ($providerIds as $pid) {
        $keyName = "ai_{$pid}_api_key";
        if (!empty($masked[$keyName])) {
            $masked[$keyName] = '••••••••';
            $masked["{$keyName}_set"] = true;
        } else {
            $masked[$keyName] = null;
            $masked["{$keyName}_set"] = false;
        }
    }

    // Include available providers
    $masked['available_providers'] = AIProviderFactory::listProviders();

    jsonResponse(['ok' => true, 'data' => ['settings' => $masked]]);
    return;
}

// ═══════════════════════════════════════════
//  PUT /settings — Update settings
// ═══════════════════════════════════════════

if ($method === 'PUT' && $path === '/settings') {
    $body = getJsonBody();

    // Whitelist of updatable settings
    $allowedKeys = [
        'site_name', 'site_tagline', 'site_language', 'site_url', 'site_favicon',
        'ai_provider',
        'ai_claude_model', 'ai_openai_model', 'ai_gemini_model', 'ai_deepseek_model', 'ai_openai_compatible_model',
        'ai_openai_compatible_base_url',
        'ai_max_tokens',
        'nav_style', 'mobile_nav_style', 'footer_style',
        'auto_snapshot', 'max_snapshots', 'max_revisions',
    ];

    $updates = [];
    foreach ($body as $key => $value) {
        if (in_array($key, $allowedKeys, true)) {
            $updates[$key] = $value;
        }
    }

    // Handle API keys separately (need encryption)
    // Support all providers: ai_claude_api_key, ai_openai_api_key, etc.
    $providerIds = ['claude', 'openai', 'gemini', 'deepseek', 'openai_compatible'];
    foreach ($providerIds as $pid) {
        $keyParam = "ai_{$pid}_api_key";
        if (isset($body[$keyParam]) && !str_starts_with($body[$keyParam], '••')) {
            $keyError = Validator::apiKey($body[$keyParam], $pid);
            if ($keyError !== null) {
                jsonResponse(['ok' => false, 'error' => [
                    'code'    => 'validation',
                    'message' => $keyError,
                ]], 422);
                return;
            }

            $config = loadConfig();
            if ($config && !empty($config['app_key'])) {
                $encryption = new Encryption($config['app_key']);
                $updates[$keyParam] = $encryption->encrypt($body[$keyParam]);
            }
        }
    }

    // Validate site name
    if (isset($updates['site_name'])) {
        $nameError = Validator::siteName($updates['site_name']);
        if ($nameError !== null) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'validation',
                'message' => $nameError,
            ]], 422);
            return;
        }
    }

    if (!empty($updates)) {
        $settings->setMany($updates);
    }

    jsonResponse(['ok' => true, 'data' => ['message' => 'Settings saved.']]);
    return;
}

// ═══════════════════════════════════════════
//  POST /settings/test-api — Test connection
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/settings/test-api') {
    $body = getJsonBody();

    $provider = $body['provider'] ?? 'claude';
    $apiKey = $body['api_key'] ?? '';
    $baseUrl = $body['base_url'] ?? '';

    // OpenAI Compatible doesn't require an API key
    if (empty($apiKey) && $provider !== 'openai_compatible') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'API key is required for the connection test.',
        ]], 422);
        return;
    }

    // Basic format check with descriptive feedback
    $formatHints = [
        'claude'  => ['prefix' => 'sk-ant-', 'hint' => 'Claude API keys start with "sk-ant-". Copy the full key from console.anthropic.com.'],
        'openai'  => ['prefix' => 'sk-',     'hint' => 'OpenAI API keys start with "sk-". Copy the full key from platform.openai.com.'],
        'gemini'  => ['prefix' => 'AIza',    'hint' => 'Gemini API keys start with "AIza". Get one from aistudio.google.com/apikey.'],
    ];

    if (isset($formatHints[$provider]) && !empty($apiKey)) {
        $fmt = $formatHints[$provider];
        if (!str_starts_with($apiKey, $fmt['prefix'])) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'validation',
                'message' => $fmt['hint'],
            ]], 422);
            return;
        }
    }

    try {
        $providerInstance = AIProviderFactory::createWithKey($provider, $apiKey, '', $baseUrl);

        // testConnection() makes a real API call and throws on failure,
        // unlike listModels() which silently falls back to hardcoded defaults.
        $models = $providerInstance->testConnection();

        jsonResponse(['ok' => true, 'data' => [
            'message' => 'Connected. API key is valid.',
            'models'  => $models,
        ]]);
    } catch (\Throwable $e) {
        $msg = $e->getMessage();

        // Translate common error codes into helpful messages
        if (str_contains($msg, 'invalid_api_key') || str_contains($msg, '401') || str_contains($msg, 'authentication_error')) {
            $msg = 'Authentication failed. The API key was rejected by the provider. Double-check that you copied the entire key.';
        } elseif (str_contains($msg, 'rate_limited') || str_contains($msg, '429')) {
            $msg = 'Rate limited. The API key is valid but you\'ve hit a rate limit. Try again in a few seconds.';
        } elseif (str_contains($msg, '500') || str_contains($msg, '502') || str_contains($msg, '503') || str_contains($msg, 'provider_unavailable')) {
            $msg = 'The AI provider is temporarily unavailable. Try again in a moment.';
        } elseif (str_contains($msg, 'connection failed') || str_contains($msg, 'Could not resolve') || str_contains($msg, 'timed out')) {
            $msg = 'Could not reach the API server. Check your internet connection and try again.';
        }

        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'connection_failed',
            'message' => $msg,
        ]], 400);
    }

    return;
}

// ═══════════════════════════════════════════
//  GET /settings/models — fetch models with stored credentials
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/settings/models') {
    try {
        $provider = AIProviderFactory::create($settings);
        $models = $provider->listModels();
        jsonResponse(['ok' => true, 'data' => ['models' => $models]]);
    } catch (\Throwable $e) {
        jsonResponse(['ok' => true, 'data' => ['models' => []]]);
    }

    return;
}

// ═══════════════════════════════════════════
//  POST /settings/list-models — Fetch models
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/settings/list-models') {
    $body = getJsonBody();

    $provider = $body['provider'] ?? 'claude';
    $apiKey = $body['api_key'] ?? '';
    $baseUrl = $body['base_url'] ?? '';

    try {
        $models = AIProviderFactory::fetchModels($provider, $apiKey, $baseUrl);
        jsonResponse(['ok' => true, 'data' => ['models' => $models]]);
    } catch (\Throwable $e) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'fetch_failed',
            'message' => $e->getMessage(),
        ]], 400);
    }

    return;
}

// ═══════════════════════════════════════════
//  GET /settings/system — System info
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/settings/system') {
    $studioPath = dirname(__DIR__, 2);
    $dbPath = $studioPath . '/data/studio.db';
    $dbSize = file_exists($dbPath) ? filesize($dbPath) : 0;

    $previewPath = $studioPath . '/preview';
    $assetsPath = dirname($studioPath) . '/assets';

    $projectRoot = dirname(__DIR__, 3);
    $versionFile = $projectRoot . '/VERSION';
    $version = file_exists($versionFile) ? trim(file_get_contents($versionFile)) : '1.0.0';

    jsonResponse(['ok' => true, 'data' => [
        'system' => [
            'version'      => $version,
            'php_version'  => PHP_VERSION,
            'sqlite_version' => \SQLite3::version()['versionString'] ?? 'unknown',
            'database_size' => $dbSize,
            'preview_size'  => dirSize($previewPath),
            'assets_size'   => dirSize($assetsPath),
            'max_upload'    => formatBytes(min(
                parseBytes(ini_get('upload_max_filesize') ?: '2M'),
                parseBytes(ini_get('post_max_size') ?: '8M')
            )),
            'memory_limit'  => ini_get('memory_limit'),
            'max_execution' => ini_get('max_execution_time'),
        ],
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  GET /settings/mail — Current mail config
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/settings/mail') {
    $mailer = \VoxelSite\Mailer::getInstance();

    jsonResponse(['ok' => true, 'data' => [
        'config' => $mailer->getConfig(),
        'presets' => $mailer->getPresetsWithHostingSuggestion(),
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /settings/mail — Save mail config
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/settings/mail') {
    $body = getJsonBody();

    $updates = [];

    // Driver (whitelist)
    $driver = $body['driver'] ?? null;
    if ($driver !== null && in_array($driver, ['none', 'php_mail', 'smtp', 'mailpit'], true)) {
        $updates['mail.driver'] = $driver;
    }

    // From address & name
    if (!empty($body['from_address']) && filter_var($body['from_address'], FILTER_VALIDATE_EMAIL)) {
        $updates['mail.from_address'] = $body['from_address'];
    }
    if (isset($body['from_name'])) {
        $updates['mail.from_name'] = trim($body['from_name']);
    }

    // SMTP settings
    if (isset($body['smtp_host'])) {
        $updates['mail.smtp.host'] = trim($body['smtp_host']);
    }
    if (isset($body['smtp_port'])) {
        $port = (int) $body['smtp_port'];
        if ($port > 0 && $port <= 65535) {
            $updates['mail.smtp.port'] = $port;
        }
    }
    if (isset($body['smtp_username'])) {
        $updates['mail.smtp.username'] = trim($body['smtp_username']);
    }
    if (isset($body['smtp_encryption']) && in_array($body['smtp_encryption'], ['tls', 'ssl', 'none'], true)) {
        $updates['mail.smtp.encryption'] = $body['smtp_encryption'];
    }

    // SMTP password — encrypt before storing, skip if masked placeholder
    if (!empty($body['smtp_password']) && !str_starts_with($body['smtp_password'], '••')) {
        $config = loadConfig();
        if ($config && !empty($config['app_key'])) {
            $encryption = new Encryption($config['app_key']);
            $updates['mail.smtp.password'] = $encryption->encrypt($body['smtp_password']);
        }
    }

    // Mailpit settings
    if (isset($body['mailpit_host'])) {
        $updates['mail.mailpit.host'] = trim($body['mailpit_host']);
    }
    if (isset($body['mailpit_port'])) {
        $port = (int) $body['mailpit_port'];
        if ($port > 0 && $port <= 65535) {
            $updates['mail.mailpit.port'] = $port;
        }
    }

    if (!empty($updates)) {
        $settings->setMany($updates);
        // Reset mailer singleton so next send() uses new config
        \VoxelSite\Mailer::resetInstance();
    }

    jsonResponse(['ok' => true, 'data' => ['message' => 'Email settings saved.']]);
    return;
}

// ═══════════════════════════════════════════
//  POST /settings/mail/test — Test config
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/settings/mail/test') {
    $body = getJsonBody();

    $testRecipient = $body['test_recipient'] ?? '';
    if (!filter_var($testRecipient, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'validation',
            'message' => 'Please enter a valid email address to send the test to.',
        ]], 422);
        return;
    }

    // Build config array for testing (decrypt password if needed)
    $testConfig = [
        'driver' => $body['driver'] ?? 'php_mail',
        'smtp_host' => $body['smtp_host'] ?? '',
        'smtp_port' => (int) ($body['smtp_port'] ?? 587),
        'smtp_username' => $body['smtp_username'] ?? '',
        'smtp_encryption' => $body['smtp_encryption'] ?? 'tls',
        'mailpit_host' => $body['mailpit_host'] ?? 'localhost',
        'mailpit_port' => (int) ($body['mailpit_port'] ?? 1025),
    ];

    // Handle password: if provided use it, if masked read from stored
    $password = $body['smtp_password'] ?? '';
    if (empty($password) || str_starts_with($password, '••')) {
        // Use stored password
        $storedEncrypted = $settings->get('mail.smtp.password', '');
        if (!empty($storedEncrypted) && is_string($storedEncrypted)) {
            try {
                $config = loadConfig();
                if ($config && !empty($config['app_key'])) {
                    $enc = new Encryption($config['app_key']);
                    $password = $enc->decrypt($storedEncrypted);
                }
            } catch (\Throwable $e) {
                $password = '';
            }
        }
    }
    $testConfig['smtp_password'] = $password;

    try {
        $result = \VoxelSite\Mailer::testConfig($testConfig, $testRecipient);

        if ($result['success']) {
            jsonResponse(['ok' => true, 'data' => [
                'message' => $result['message'],
                'driver' => $result['driver'],
            ]]);
        } else {
            jsonResponse(['ok' => false, 'error' => [
                'code' => 'test_failed',
                'message' => $result['message'],
                'driver' => $result['driver'],
            ]], 400);
        }
    } catch (\Throwable $e) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'test_failed',
            'message' => 'Test failed: ' . $e->getMessage(),
        ]], 400);
    }

    return;
}

// ═══════════════════════════════════════════
//  GET /settings/mail/log — Recent mail log
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/settings/mail/log') {
    $mailer = \VoxelSite\Mailer::getInstance();

    jsonResponse(['ok' => true, 'data' => [
        'entries' => $mailer->getRecentLog(20),
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  GET /settings/usage — AI token usage
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/settings/usage') {
    $db = \VoxelSite\Database::getInstance();

    // Aggregate usage per model
    $rows = $db->query(
        "SELECT
            ai_model,
            COUNT(*) as request_count,
            COALESCE(SUM(tokens_input), 0) as total_input_tokens,
            COALESCE(SUM(tokens_output), 0) as total_output_tokens,
            COALESCE(SUM(cost_estimate), 0) as total_cost,
            MIN(created_at) as first_used,
            MAX(created_at) as last_used
         FROM prompt_log
         WHERE status = 'success' AND ai_model IS NOT NULL
         GROUP BY ai_model
         ORDER BY total_cost DESC"
    );

    // Grand totals
    $totals = $db->queryOne(
        "SELECT
            COUNT(*) as request_count,
            COALESCE(SUM(tokens_input), 0) as total_input_tokens,
            COALESCE(SUM(tokens_output), 0) as total_output_tokens,
            COALESCE(SUM(cost_estimate), 0) as total_cost
         FROM prompt_log
         WHERE status = 'success'"
    );

    jsonResponse(['ok' => true, 'data' => [
        'models' => $rows ?: [],
        'totals' => $totals ?: [
            'request_count' => 0,
            'total_input_tokens' => 0,
            'total_output_tokens' => 0,
            'total_cost' => 0,
        ],
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  GET /settings/logs — List log files
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/settings/logs') {
    $logDir = dirname(__DIR__, 2) . '/logs';
    $files = [];

    if (is_dir($logDir)) {
        foreach (glob($logDir . '/*.log') as $file) {
            $files[] = [
                'name'     => basename($file),
                'size'     => filesize($file),
                'modified' => filemtime($file),
                'lines'    => substr_count(file_get_contents($file), "\n"),
            ];
        }
        // Sort newest first
        usort($files, fn($a, $b) => $b['modified'] <=> $a['modified']);
    }

    jsonResponse(['ok' => true, 'data' => ['logs' => $files]]);
    return;
}

// ═══════════════════════════════════════════
//  GET /settings/logs/download — Download a log file
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/settings/logs/download') {
    $fileName = basename($_GET['file'] ?? '');
    if (empty($fileName) || !str_ends_with($fileName, '.log')) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'validation',
            'message' => 'Invalid log file name.',
        ]], 400);
        return;
    }

    $logDir = dirname(__DIR__, 2) . '/logs';
    $filePath = $logDir . '/' . $fileName;

    if (!file_exists($filePath) || !is_file($filePath)) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'not_found',
            'message' => 'Log file not found.',
        ]], 404);
        return;
    }

    // Security: ensure the resolved path is within the logs directory
    $realPath = realpath($filePath);
    $realLogDir = realpath($logDir);
    if ($realPath === false || $realLogDir === false || !str_starts_with($realPath, $realLogDir)) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'forbidden',
            'message' => 'Access denied.',
        ]], 403);
        return;
    }

    header('Content-Type: text/plain; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $fileName . '"');
    header('Content-Length: ' . filesize($filePath));
    readfile($filePath);
    return;
}

// ═══════════════════════════════════════════
//  DELETE /settings/logs — Delete one or all log files
// ═══════════════════════════════════════════

if ($method === 'DELETE' && $path === '/settings/logs') {
    $body = getJsonBody();
    $logDir = dirname(__DIR__, 2) . '/logs';

    if (!is_dir($logDir)) {
        jsonResponse(['ok' => true, 'data' => ['deleted' => 0]]);
        return;
    }

    $realLogDir = realpath($logDir);
    $fileName = $body['file'] ?? null;

    if ($fileName === '*' || $fileName === null) {
        // Delete all log files
        $count = 0;
        foreach (glob($logDir . '/*.log') as $file) {
            if (@unlink($file)) {
                $count++;
            }
        }
        jsonResponse(['ok' => true, 'data' => ['deleted' => $count]]);
    } else {
        // Delete single file
        $safe = basename($fileName);
        if (!str_ends_with($safe, '.log')) {
            jsonResponse(['ok' => false, 'error' => [
                'code' => 'validation',
                'message' => 'Invalid log file name.',
            ]], 400);
            return;
        }

        $filePath = $logDir . '/' . $safe;
        $realPath = realpath($filePath);
        if ($realPath === false || !str_starts_with($realPath, $realLogDir)) {
            jsonResponse(['ok' => false, 'error' => [
                'code' => 'forbidden',
                'message' => 'Access denied.',
            ]], 403);
            return;
        }

        if (file_exists($filePath) && @unlink($filePath)) {
            jsonResponse(['ok' => true, 'data' => ['deleted' => 1]]);
        } else {
            jsonResponse(['ok' => false, 'error' => [
                'code' => 'not_found',
                'message' => 'Log file not found or could not be deleted.',
            ]], 404);
        }
    }
    return;
}

jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Settings endpoint not found.',
]], 404);

// ── Helpers ──

function dirSize(string $path): int
{
    if (!is_dir($path)) return 0;
    $size = 0;
    foreach (new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS)
    ) as $file) {
        $size += $file->getSize();
    }
    return $size;
}

function parseBytes(string $value): int
{
    $value = trim($value);
    $last = strtolower($value[strlen($value) - 1]);
    $numValue = (int) $value;
    return match($last) {
        'g' => $numValue * 1073741824,
        'm' => $numValue * 1048576,
        'k' => $numValue * 1024,
        default => $numValue,
    };
}

function formatBytes(int $bytes): string
{
    if ($bytes >= 1073741824) return round($bytes / 1073741824, 1) . ' GB';
    if ($bytes >= 1048576) return round($bytes / 1048576, 1) . ' MB';
    if ($bytes >= 1024) return round($bytes / 1024, 1) . ' KB';
    return $bytes . ' B';
}
