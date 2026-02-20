<?php

declare(strict_types=1);

/**
 * Installation API endpoints.
 *
 * These are the ONLY endpoints that work before installation.
 * The router allows them through without authentication.
 *
 * POST /install/check      — Run system requirements check
 * POST /install/test-ai    — Test an AI API key
 * POST /install/test-mail  — Test email configuration
 * POST /install/complete    — Execute the full installation
 */

use VoxelSite\Database;
use VoxelSite\Encryption;
use VoxelSite\Migrator;
use VoxelSite\Settings;

$method = $_REQUEST['_route_method'];
$path = $_REQUEST['_route_path'];

// ── Guard: refuse if already installed ──
if (isInstalled()) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => ['code' => 'already_installed', 'message' => 'VoxelSite is already installed.']]);
    exit;
}

/**
 * POST /install/check
 *
 * Check system requirements. Returns pass/fail/warn for each.
 */
if ($method === 'POST' && $path === '/install/check') {
    $checks = [];

    // PHP version
    $phpVersion = PHP_VERSION;
    $phpOk = version_compare($phpVersion, '8.1.0', '>=');
    $checks[] = [
        'name'    => 'PHP Version',
        'detail'  => "PHP {$phpVersion}" . ($phpOk ? '' : ' (requires 8.1+)'),
        'status'  => $phpOk ? 'pass' : 'fail',
        'required' => true,
    ];

    // SQLite3 extension
    $sqliteOk = extension_loaded('pdo_sqlite');
    $sqliteVersion = $sqliteOk ? (new PDO('sqlite::memory:'))->query('SELECT sqlite_version()')->fetchColumn() : 'not available';
    $checks[] = [
        'name'    => 'SQLite3',
        'detail'  => $sqliteOk ? "SQLite {$sqliteVersion}" : 'PDO SQLite extension not loaded',
        'status'  => $sqliteOk ? 'pass' : 'fail',
        'required' => true,
    ];

    // OpenSSL extension (for encryption)
    $opensslOk = extension_loaded('openssl');
    $checks[] = [
        'name'    => 'OpenSSL',
        'detail'  => $opensslOk ? 'Available' : 'Required for API key encryption',
        'status'  => $opensslOk ? 'pass' : 'fail',
        'required' => true,
    ];

    // JSON extension
    $jsonOk = extension_loaded('json');
    $checks[] = [
        'name'    => 'JSON',
        'detail'  => $jsonOk ? 'Available' : 'Required for API communication',
        'status'  => $jsonOk ? 'pass' : 'fail',
        'required' => true,
    ];

    // cURL extension (for AI API calls)
    $curlOk = extension_loaded('curl');
    $checks[] = [
        'name'    => 'cURL',
        'detail'  => $curlOk ? 'Available' : 'Required for AI API calls',
        'status'  => $curlOk ? 'pass' : 'fail',
        'required' => true,
    ];

    // mbstring extension
    $mbstringOk = extension_loaded('mbstring');
    $checks[] = [
        'name'    => 'mbstring',
        'detail'  => $mbstringOk ? 'Available' : 'Recommended for text handling',
        'status'  => $mbstringOk ? 'pass' : 'warn',
        'required' => false,
    ];

    // GD extension (for image processing, optional)
    $gdOk = extension_loaded('gd');
    $checks[] = [
        'name'    => 'GD Library',
        'detail'  => $gdOk ? 'Available (image processing enabled)' : 'Optional — images won\'t be optimized',
        'status'  => $gdOk ? 'pass' : 'warn',
        'required' => false,
    ];

    // ZipArchive extension (for in-app updates, snapshots, exports)
    $zipOk = class_exists('ZipArchive');
    $checks[] = [
        'name'    => 'Zip Archive',
        'detail'  => $zipOk ? 'Available' : 'Required for updates, snapshots, and exports',
        'status'  => $zipOk ? 'pass' : 'fail',
        'required' => true,
    ];

    // Write permissions — _studio/data
    $studioDir = dirname(__DIR__, 2); // _studio/api/endpoints → _studio
    $dataDir = $studioDir . '/data';
    $dataWritable = is_dir($dataDir) && is_writable($dataDir);
    $checks[] = [
        'name'    => 'Data Directory',
        'detail'  => $dataWritable ? 'Writable' : '_studio/data/ is not writable',
        'status'  => $dataWritable ? 'pass' : 'fail',
        'required' => true,
    ];

    // Write permissions — _studio/preview
    $previewDir = $studioDir . '/preview';
    $previewWritable = is_dir($previewDir) && is_writable($previewDir);
    $checks[] = [
        'name'    => 'Preview Directory',
        'detail'  => $previewWritable ? 'Writable' : '_studio/preview/ is not writable',
        'status'  => $previewWritable ? 'pass' : 'fail',
        'required' => true,
    ];

    // Write permissions — /assets
    $rootDir = dirname(__DIR__, 3); // _studio/api/endpoints → project root
    $assetsDir = $rootDir . '/assets';
    $assetsWritable = is_dir($assetsDir) && is_writable($assetsDir);
    $checks[] = [
        'name'    => 'Assets Directory',
        'detail'  => $assetsWritable ? 'Writable' : 'assets/ is not writable',
        'status'  => $assetsWritable ? 'pass' : 'fail',
        'required' => true,
    ];

    // Summarize
    $allRequired = array_filter($checks, fn ($c) => $c['required'] && $c['status'] === 'fail');
    $canProceed = empty($allRequired);

    echo json_encode([
        'ok'          => true,
        'checks'      => $checks,
        'can_proceed' => $canProceed,
    ]);
    exit;
}

/**
 * GET /install/providers
 *
 * List all available AI providers with their config fields.
 */
if ($method === 'GET' && $path === '/install/providers') {
    echo json_encode([
        'ok'   => true,
        'data' => ['providers' => \VoxelSite\AIProviderFactory::listProviders()],
    ]);
    exit;
}

/**
 * POST /install/test-ai
 *
 * Test an AI API key by making a minimal API call.
 * Now uses the AIProviderFactory for all providers.
 */
if ($method === 'POST' && $path === '/install/test-ai') {
    $body = json_decode(file_get_contents('php://input'), true);
    $provider = $body['provider'] ?? 'claude';
    $apiKey = $body['api_key'] ?? '';
    $baseUrl = $body['base_url'] ?? '';

    // OpenAI Compatible doesn't require an API key
    if (empty($apiKey) && $provider !== 'openai_compatible') {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => ['code' => 'missing_api_key', 'message' => 'API key is required.']]);
        exit;
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
            http_response_code(422);
            echo json_encode(['ok' => false, 'error' => ['code' => 'validation', 'message' => $fmt['hint']]]);
            exit;
        }
    }

    try {
        $instance = \VoxelSite\AIProviderFactory::createWithKey($provider, $apiKey, '', $baseUrl);
        $models = $instance->testConnection();

        echo json_encode([
            'ok'   => true,
            'data' => [
                'provider' => $instance->getName(),
                'status'   => 'connected',
                'models'   => $models,
            ],
        ]);
    } catch (\Throwable $e) {
        $msg = $e->getMessage();

        if (str_contains($msg, 'invalid_api_key') || str_contains($msg, '401') || str_contains($msg, 'authentication_error')) {
            $msg = 'Authentication failed. The API key was rejected by the provider. Double-check that you copied the entire key.';
        } elseif (str_contains($msg, 'rate_limited') || str_contains($msg, '429')) {
            $msg = 'Rate limited. The API key is valid but you\'ve hit a rate limit. Try again in a few seconds.';
        } elseif (str_contains($msg, '500') || str_contains($msg, '502') || str_contains($msg, '503') || str_contains($msg, 'provider_unavailable')) {
            $msg = 'The AI provider is temporarily unavailable. Try again in a moment.';
        } elseif (str_contains($msg, 'connection failed') || str_contains($msg, 'Could not resolve') || str_contains($msg, 'timed out')) {
            $msg = 'Could not reach the API server. Check your internet connection and try again.';
        }

        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => ['code' => 'connection_failed', 'message' => $msg]]);
    }
    exit;
}

/**
 * POST /install/list-models
 *
 * Fetch available models for a provider using the provided API key.
 * Used to populate the model dropdown after key verification.
 */
if ($method === 'POST' && $path === '/install/list-models') {
    $body = json_decode(file_get_contents('php://input'), true);
    $provider = $body['provider'] ?? 'claude';
    $apiKey = $body['api_key'] ?? '';
    $baseUrl = $body['base_url'] ?? '';

    try {
        $models = \VoxelSite\AIProviderFactory::fetchModels($provider, $apiKey, $baseUrl);
        echo json_encode(['ok' => true, 'data' => ['models' => $models]]);
    } catch (\Throwable $e) {
        echo json_encode(['ok' => false, 'error' => ['code' => 'fetch_failed', 'message' => $e->getMessage()]]);
    }
    exit;
}

/**
 * POST /install/test-mail
 *
 * Test an email configuration during install (before auth).
 * Uses Mailer::testConfig() to send a test email without saving.
 */
if ($method === 'POST' && $path === '/install/test-mail') {
    $body = json_decode(file_get_contents('php://input'), true);

    $config = $body['config'] ?? [];
    $testRecipient = $body['test_recipient'] ?? '';

    if (!filter_var($testRecipient, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => [
            'code' => 'validation',
            'message' => 'Please enter a valid email address to send the test to.',
        ]]);
        exit;
    }

    // Map frontend config to Mailer::testConfig format
    $testConfig = [
        'driver'          => $config['driver'] ?? 'php_mail',
        'smtp_host'       => $config['smtp_host'] ?? '',
        'smtp_port'       => (int) ($config['smtp_port'] ?? 587),
        'smtp_username'   => $config['smtp_username'] ?? '',
        'smtp_password'   => $config['smtp_password'] ?? '',
        'smtp_encryption' => $config['smtp_encryption'] ?? 'tls',
        'mailpit_host'    => $config['mailpit_host'] ?? 'localhost',
        'mailpit_port'    => (int) ($config['mailpit_port'] ?? 1025),
    ];

    try {
        $result = \VoxelSite\Mailer::testConfig($testConfig, $testRecipient);

        if ($result['success']) {
            echo json_encode(['ok' => true, 'data' => [
                'message' => $result['message'],
                'driver'  => $result['driver'],
            ]]);
        } else {
            echo json_encode(['ok' => false, 'error' => [
                'code'    => 'test_failed',
                'message' => $result['message'],
                'driver'  => $result['driver'],
            ]]);
        }
    } catch (\Throwable $e) {
        echo json_encode(['ok' => false, 'error' => [
            'code'    => 'test_failed',
            'message' => 'Test failed: ' . $e->getMessage(),
        ]]);
    }
    exit;
}

/**
 * POST /install/complete
 *
 * Execute the full installation.
 *
 * Expected body:
 * {
 *   "ai_provider": "claude",
 *   "ai_api_key": "sk-ant-...",
 *   "ai_model": "claude-sonnet-4-20250514",
 *   "admin_name": "...",
 *   "admin_email": "...",
 *   "admin_password": "...",
 *   "site_name": "...",
 *   "site_tagline": "...",
 *   "mail_config": { "driver": "...", ... }
 * }
 */
if ($method === 'POST' && $path === '/install/complete') {
    $body = json_decode(file_get_contents('php://input'), true);

    // ── Validate input ──
    $errors = [];

    $provider = $body['ai_provider'] ?? 'claude';

    if (empty($body['ai_api_key']) && $provider !== 'openai_compatible') {
        $errors[] = 'API key is required.';
    }
    if (empty($body['admin_name'])) {
        $errors[] = 'Admin name is required.';
    }
    if (empty($body['admin_email']) || !filter_var($body['admin_email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'A valid email address is required.';
    }
    if (empty($body['admin_password']) || strlen($body['admin_password']) < 8) {
        $errors[] = 'Password must be at least 8 characters.';
    }
    if (empty($body['site_name'])) {
        $errors[] = 'Site name is required.';
    }

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => ['code' => 'validation', 'message' => implode(' ', $errors)]]);
        exit;
    }

    try {
        // ── Step 1: Generate APP_KEY ──
        $appKey = Encryption::generateKey();

        // ── Step 2: Write config.json ──
        $configPath = dirname(__DIR__, 2) . '/data/config.json';
        $config = [
            'app_key'     => $appKey,
            'installed_at' => gmdate('Y-m-d\TH:i:s\Z'),
            'version'     => '1.0.0',
        ];
        file_put_contents($configPath, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        // ── Step 3: Initialize database ──
        $dbPath = dirname(__DIR__, 2) . '/data/studio.db';
        $db = Database::getInstance($dbPath);

        // ── Step 4: Run migrations (creates all tables) ──
        $migrator = new Migrator($db);
        $migrationResult = $migrator->run();

        // ── Step 5: Store settings ──
        $settings = new Settings($db);
        $encryption = new Encryption($appKey);

        $provider = $body['ai_provider'] ?? 'claude';

        $settingsData = [
            'site_name'                => trim($body['site_name']),
            'site_tagline'             => trim($body['site_tagline'] ?? ''),
            'site_language'            => 'en',
            'ai_provider'              => $provider,
            "ai_{$provider}_model"     => $body['ai_model'] ?? '',
        ];

        // Only encrypt and store API key if provided
        $apiKey = trim($body['ai_api_key'] ?? '');
        if (!empty($apiKey)) {
            $settingsData["ai_{$provider}_api_key"] = $encryption->encrypt($apiKey);
        }

        // Store base_url for OpenAI Compatible
        if ($provider === 'openai_compatible' && !empty($body['ai_base_url'])) {
            $settingsData['ai_openai_compatible_base_url'] = trim($body['ai_base_url']);
        }

        $settings->setMany($settingsData);

        // ── Step 6: Store mail configuration ──
        $mailConfig = $body['mail_config'] ?? null;
        if (is_array($mailConfig)) {
            $mailSettings = [];
            $mailDriver = $mailConfig['driver'] ?? 'none';
            if (in_array($mailDriver, ['none', 'php_mail', 'smtp', 'mailpit'], true)) {
                $mailSettings['mail.driver'] = $mailDriver;
            }

            if (!empty($mailConfig['from_address'])) {
                $mailSettings['mail.from_address'] = $mailConfig['from_address'];
            }
            if (!empty($mailConfig['from_name'])) {
                $mailSettings['mail.from_name'] = trim($mailConfig['from_name']);
            }

            // SMTP settings
            if ($mailDriver === 'smtp') {
                if (!empty($mailConfig['smtp_host'])) {
                    $mailSettings['mail.smtp.host'] = trim($mailConfig['smtp_host']);
                }
                if (isset($mailConfig['smtp_port'])) {
                    $smtpPort = (int) $mailConfig['smtp_port'];
                    if ($smtpPort > 0 && $smtpPort <= 65535) {
                        $mailSettings['mail.smtp.port'] = $smtpPort;
                    }
                }
                if (!empty($mailConfig['smtp_username'])) {
                    $mailSettings['mail.smtp.username'] = trim($mailConfig['smtp_username']);
                }
                if (isset($mailConfig['smtp_encryption']) && in_array($mailConfig['smtp_encryption'], ['tls', 'ssl', 'none'], true)) {
                    $mailSettings['mail.smtp.encryption'] = $mailConfig['smtp_encryption'];
                }
                if (!empty($mailConfig['smtp_password'])) {
                    $mailSettings['mail.smtp.password'] = $encryption->encrypt($mailConfig['smtp_password']);
                }
            }

            // Mailpit settings
            if ($mailDriver === 'mailpit') {
                if (!empty($mailConfig['mailpit_host'])) {
                    $mailSettings['mail.mailpit.host'] = trim($mailConfig['mailpit_host']);
                }
                if (isset($mailConfig['mailpit_port'])) {
                    $mpPort = (int) $mailConfig['mailpit_port'];
                    if ($mpPort > 0 && $mpPort <= 65535) {
                        $mailSettings['mail.mailpit.port'] = $mpPort;
                    }
                }
            }

            if (!empty($mailSettings)) {
                $settings->setMany($mailSettings);
            }
        }

        // ── Step 7: Create admin user ──
        $now = gmdate('Y-m-d\TH:i:s\Z');

        $userId = $db->insert('users', [
            'email'         => strtolower(trim($body['admin_email'])),
            'name'          => trim($body['admin_name']),
            'password_hash' => password_hash(trim($body['admin_password']), PASSWORD_BCRYPT),
            'role'          => 'owner',
            'created_at'    => $now,
            'updated_at'    => $now,
        ]);

        // ── Step 8: Create initial session (auto-login after install) ──
        $token = bin2hex(random_bytes(32)); // 64 hex chars
        $expiresAt = gmdate('Y-m-d\TH:i:s\Z', time() + (30 * 86400));

        $db->insert('sessions', [
            'id'         => $token,
            'user_id'    => $userId,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
            'user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 512),
            'expires_at' => $expiresAt,
            'created_at' => $now,
        ]);

        // Set the session cookie
        $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
        setcookie('vs_session', $token, [
            'expires'  => time() + (30 * 86400),
            'path'     => '/_studio/',
            'httponly'  => true,
            'secure'   => $secure,
            'samesite' => 'Lax',
        ]);

        echo json_encode([
            'ok'         => true,
            'message'    => 'Installation complete.',
            'redirect'   => '/_studio/#/chat',
            'migrations' => $migrationResult,
        ]);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode([
            'ok'    => false,
            'error' => [
                'code'    => 'install_failed',
                'message' => 'Installation failed: ' . $e->getMessage(),
            ],
        ]);
    }
    exit;
}

// ── Fallback ──
http_response_code(404);
echo json_encode(['ok' => false, 'error' => ['code' => 'not_found', 'message' => 'Unknown install action.']]);
exit;

