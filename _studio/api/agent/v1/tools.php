<?php

declare(strict_types=1);

/**
 * Agent API — Tools Endpoint
 *
 * GET  /tools        — List available tools (action tools + data tools + form tools)
 * POST /tools/invoke — Invoke a tool by name
 *
 * Tool categories:
 * 1. Action tools (make_*, check_*_availability, cancel_*) — from ActionManager
 * 2. Data tools (get_business_info, get_menu, get_services, get_faq) — from site.json
 * 3. Form tools (list_forms, get_form_schema, submit_form) — from FormValidator
 *
 * Receives $_agentContext from router.php.
 */

use VoxelSite\ActionManager;
use VoxelSite\FormValidator;
use VoxelSite\Logger;

$ctx    = $_agentContext;
$method = $ctx['method'];

$actionManager = new ActionManager();

$docRoot      = dirname(__DIR__, 4);
$siteDataPath = $docRoot . '/assets/data/site.json';
$dataDir      = $docRoot . '/assets/data';
$formsDir     = $docRoot . '/assets/forms';

// ═══════════════════════════════════════════
//  Data tool definitions (static, from site.json)
// ═══════════════════════════════════════════

function getDataToolDefinitions(string $dataDir): array
{
    $tools = [];

    $tools[] = [
        'name'        => 'get_business_info',
        'description' => 'Get business name, description, contact details, and opening hours',
        'inputSchema' => ['type' => 'object', 'properties' => new \stdClass()],
    ];

    if (file_exists($dataDir . '/menu.json')) {
        $tools[] = [
            'name'        => 'get_menu',
            'description' => 'Get the restaurant/cafe menu with items, prices, and dietary information',
            'inputSchema' => [
                'type' => 'object',
                'properties' => [
                    'category' => ['type' => 'string', 'description' => 'Filter by menu category name'],
                ],
            ],
        ];
    }

    if (file_exists($dataDir . '/services.json')) {
        $tools[] = [
            'name'        => 'get_services',
            'description' => 'Get available services with descriptions and pricing',
            'inputSchema' => ['type' => 'object', 'properties' => new \stdClass()],
        ];
    }

    if (file_exists($dataDir . '/faq.json')) {
        $tools[] = [
            'name'        => 'get_faq',
            'description' => 'Get frequently asked questions and answers',
            'inputSchema' => [
                'type' => 'object',
                'properties' => [
                    'query' => ['type' => 'string', 'description' => 'Search query to find relevant FAQ entries'],
                ],
            ],
        ];
    }

    return $tools;
}

/**
 * Form tool definitions — matches MCP server's form tools.
 */
function getFormToolDefinitions(string $formsDir): array
{
    $hasForms = false;
    if (is_dir($formsDir)) {
        foreach (scandir($formsDir) as $ff) {
            if ($ff[0] === '.' || !str_ends_with($ff, '.json')) continue;
            $hasForms = true;
            break;
        }
    }

    if (!$hasForms) {
        return [];
    }

    return [
        [
            'name'        => 'list_forms',
            'description' => 'List all available forms with names, descriptions, and field summaries',
            'inputSchema' => ['type' => 'object', 'properties' => new \stdClass()],
        ],
        [
            'name'        => 'get_form_schema',
            'description' => 'Get the full field definitions for a specific form (so you know what to submit)',
            'inputSchema' => [
                'type' => 'object',
                'properties' => [
                    'form_id' => ['type' => 'string', 'description' => 'The form identifier (e.g., "contact", "reservation")'],
                ],
                'required' => ['form_id'],
            ],
        ],
        [
            'name'        => 'submit_form',
            'description' => 'Submit data to a form. Validates against the form schema before storing.',
            'inputSchema' => [
                'type' => 'object',
                'properties' => [
                    'form_id' => ['type' => 'string', 'description' => 'The form identifier'],
                    'data'    => ['type' => 'object', 'description' => 'Key-value pairs of form field values'],
                ],
                'required' => ['form_id', 'data'],
            ],
        ],
    ];
}

/**
 * Execute a data tool by reading from site.json / feature JSON files.
 */
function executeDataTool(string $toolName, array $args, string $dataDir, string $siteDataPath): ?array
{
    switch ($toolName) {
        case 'get_business_info':
            $siteData = [];
            if (file_exists($siteDataPath)) {
                $siteData = json_decode(file_get_contents($siteDataPath), true) ?? [];
            }
            return $siteData ?: ['message' => 'No business information available.'];

        case 'get_menu':
            $menuPath = $dataDir . '/menu.json';
            if (!file_exists($menuPath)) {
                return ['message' => 'No menu data available.'];
            }
            $menuData = json_decode(file_get_contents($menuPath), true) ?? [];
            $category = $args['category'] ?? null;
            if ($category && isset($menuData['categories'])) {
                $filtered = array_filter($menuData['categories'], fn($c) =>
                    stripos($c['name'] ?? '', $category) !== false
                );
                $menuData['categories'] = array_values($filtered);
            }
            return $menuData;

        case 'get_services':
            $path = $dataDir . '/services.json';
            if (!file_exists($path)) {
                return ['message' => 'No services data available.'];
            }
            return json_decode(file_get_contents($path), true) ?? [];

        case 'get_faq':
            $faqPath = $dataDir . '/faq.json';
            if (!file_exists($faqPath)) {
                return ['message' => 'No FAQ data available.'];
            }
            $faqData = json_decode(file_get_contents($faqPath), true) ?? [];
            $query = $args['query'] ?? null;
            if ($query) {
                $items = $faqData['questions'] ?? $faqData['faq'] ?? $faqData['items'] ?? [];
                $filtered = array_filter($items, fn($item) =>
                    stripos($item['question'] ?? '', $query) !== false ||
                    stripos($item['answer'] ?? '', $query) !== false
                );
                return array_values($filtered);
            }
            return $faqData;

        default:
            return null;
    }
}

/**
 * Execute a form tool using FormValidator.
 */
function executeFormTool(string $toolName, array $args, string $docRoot): ?array
{
    $validator = new FormValidator();

    switch ($toolName) {
        case 'list_forms':
            return ['forms' => $validator->listForms()];

        case 'get_form_schema':
            $formId = $args['form_id'] ?? '';
            $formId = preg_replace('/[^a-z0-9_-]/', '', $formId);
            $schema = $validator->loadSchema($formId);
            if (!$schema) {
                return ['error' => 'not_found', 'message' => "Form not found: {$formId}"];
            }
            return $schema;

        case 'submit_form':
            $formId = $args['form_id'] ?? '';
            $formData = $args['data'] ?? [];

            if (!is_array($formData)) {
                return ['success' => false, 'errors' => ['data must be an object']];
            }

            $schema = $validator->loadSchema($formId);
            if (!$schema) {
                return ['error' => 'not_found', 'message' => "Form not found: {$formId}"];
            }

            // Rate limit check
            $dataPath = $docRoot . '/_data';
            if (!is_dir($dataPath)) mkdir($dataPath, 0755, true);
            $htacc = $dataPath . '/.htaccess';
            if (!file_exists($htacc)) file_put_contents($htacc, "Order deny,allow\nDeny from all\n");

            $sDb = new \PDO('sqlite:' . $dataPath . '/submissions.db');
            $sDb->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
            $sDb->exec('PRAGMA journal_mode=WAL');
            $sDb->exec('CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY AUTOINCREMENT, form_id TEXT NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL DEFAULT \'new\', ip_address TEXT, user_agent TEXT, referrer TEXT, source TEXT DEFAULT \'web\', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, read_at TEXT, notes TEXT)');
            $sDb->exec('CREATE INDEX IF NOT EXISTS idx_submissions_form ON submissions(form_id)');
            $sDb->exec('CREATE INDEX IF NOT EXISTS idx_submissions_source ON submissions(source)');
            $sDb->exec('CREATE TABLE IF NOT EXISTS rate_limits (ip_address TEXT NOT NULL, form_id TEXT NOT NULL, window_start TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 1, PRIMARY KEY (ip_address, form_id, window_start))');

            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $windowStart = date('Y-m-d\TH:00:00');
            $maxPerHour = max(1, (int) ($schema['spam_protection']['max_per_ip_per_hour'] ?? 10));

            $rlRead = $sDb->prepare('SELECT count FROM rate_limits WHERE ip_address = ? AND form_id = ? AND window_start = ?');
            $rlRead->execute([$ipAddress, $formId, $windowStart]);
            $rlRow = $rlRead->fetch(\PDO::FETCH_ASSOC);
            if ($rlRow && (int) $rlRow['count'] >= $maxPerHour) {
                return ['success' => false, 'code' => 'rate_limited', 'message' => 'Too many submissions. Please try again later.'];
            }

            $rlWrite = $sDb->prepare(
                'INSERT INTO rate_limits (ip_address, form_id, window_start, count)
                 VALUES (?, ?, ?, 1)
                 ON CONFLICT(ip_address, form_id, window_start)
                 DO UPDATE SET count = count + 1'
            );
            $rlWrite->execute([$ipAddress, $formId, $windowStart]);

            // Validate submission
            $result = $validator->validate($schema, $formData);
            if (!$result['valid']) {
                return ['success' => false, 'errors' => $result['errors']];
            }

            // Store submission with source = 'api'
            $now = date('c');
            $stmt = $sDb->prepare('INSERT INTO submissions (form_id, data, status, ip_address, user_agent, referrer, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $formId,
                json_encode($result['data'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                $schema['default_status'] ?? 'new',
                $ipAddress,
                $_SERVER['HTTP_USER_AGENT'] ?? '',
                '',
                'api',
                $now,
                $now,
            ]);
            $submissionId = $sDb->lastInsertId();

            // Probabilistic rate limit cleanup
            if (random_int(1, 100) === 1) {
                $sDb->exec("DELETE FROM rate_limits WHERE window_start < datetime('now', '-24 hours')");
            }

            return [
                'success'       => true,
                'submission_id' => (int) $submissionId,
                'message'       => $schema['submission']['success_message'] ?? 'Submission received.',
            ];

        default:
            return null;
    }
}

// ═══════════════════════════════════════════
//  GET /tools — List available tools
// ═══════════════════════════════════════════

if ($method === 'GET') {
    $tools = [];

    // Action tools from ActionManager
    try {
        $tools = $actionManager->listTools();
    } catch (\Throwable $e) {
        Logger::error('agent-api', 'Failed to list action tools', [
            'error' => $e->getMessage(),
        ]);
    }

    // Data tools (conditionally available based on data files)
    $tools = array_merge($tools, getDataToolDefinitions($dataDir));

    // Form tools (conditionally available based on form definitions)
    $tools = array_merge($tools, getFormToolDefinitions($formsDir));

    agentResponse(['data' => ['tools' => $tools]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /tools/invoke — Invoke a tool
// ═══════════════════════════════════════════

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $toolName  = $body['name'] ?? '';
    $arguments = $body['arguments'] ?? [];

    if (empty($toolName)) {
        Logger::warning('agent-api', 'Tool invoke: missing name', [
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentError(422, 'validation_error', 'Tool name is required.');
        return;
    }

    // 1. Try data tools first
    $dataResult = executeDataTool($toolName, $arguments, $dataDir, $siteDataPath);
    if ($dataResult !== null) {
        Logger::info('agent-api', 'Tool invoked: data', [
            'tool'      => $toolName,
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentResponse(['data' => $dataResult]);
        return;
    }

    // 2. Try form tools
    $formResult = executeFormTool($toolName, $arguments, $docRoot);
    if ($formResult !== null) {
        // Check for form-level errors
        if (isset($formResult['error']) && $formResult['error'] === 'not_found') {
            Logger::warning('agent-api', 'Tool invoke: form not found', [
                'tool'      => $toolName,
                'key_label' => $ctx['keyData']['label'] ?? 'unknown',
            ]);
            agentError(404, 'not_found', $formResult['message'] ?? 'Form not found.');
            return;
        }
        if (isset($formResult['success']) && $formResult['success'] === false) {
            $code = $formResult['code'] ?? 'validation_error';
            $httpCode = $code === 'rate_limited' ? 429 : 422;
            Logger::warning('agent-api', 'Tool invoke: form validation failed', [
                'tool'      => $toolName,
                'code'      => $code,
                'errors'    => $formResult['errors'] ?? [],
                'key_label' => $ctx['keyData']['label'] ?? 'unknown',
            ]);
            agentError($httpCode, $code, $formResult['message'] ?? 'Validation failed.', [
                'errors' => $formResult['errors'] ?? [],
            ]);
            return;
        }
        Logger::info('agent-api', 'Tool invoked: form', [
            'tool'      => $toolName,
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentResponse(['data' => $formResult]);
        return;
    }

    // 3. Try ActionManager tools
    try {
        $arguments['_source'] = 'api';
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $result = $actionManager->execute($toolName, $arguments, $ip);

        if (!($result['ok'] ?? false)) {
            $error = $result['error'] ?? 'unknown';
            $httpCode = match ($error) {
                'validation_failed'              => 422,
                'rate_limited'                   => 429,
                'capacity_full', 'duplicate', 'outside_hours' => 409,
                default                          => str_contains($error, 'Unknown') ? 404 : 400,
            };
            Logger::warning('agent-api', 'Tool invoke: action failed', [
                'tool'      => $toolName,
                'error'     => $error,
                'key_label' => $ctx['keyData']['label'] ?? 'unknown',
            ]);
            agentError($httpCode, $error, $result['message'] ?? 'Tool invocation failed.', [
                'errors' => $result['errors'] ?? [],
            ]);
            return;
        }

        Logger::info('agent-api', 'Tool invoked: action', [
            'tool'      => $toolName,
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentResponse(['data' => $result]);
    } catch (\Throwable $e) {
        Logger::exception('agent-api', $e, [
            'operation' => 'tool_invoke',
            'tool'      => $toolName,
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentError(500, 'server_error', 'Tool invocation failed: ' . $e->getMessage());
    }
    return;
}
