<?php

declare(strict_types=1);

/**
 * VoxelSite Agent API v1 — Standalone Router
 *
 * Entry point for all /_studio/api/agent/v1/* requests.
 * Uses Bearer token authentication via AgentAuth, NOT session auth.
 *
 * Execution order (each step depends on the previous):
 * 1. Set JSON headers
 * 2. Bootstrap (autoloader — enables DemoMode, Settings, AgentAuth)
 * 3. CORS (needs Settings for allowed origins; try/catch fallback to wildcard)
 * 4. Demo mode guard (DemoMode::isActive() — file check, no DB)
 * 5. Feature toggle (agent_api_enabled setting — fail-closed if DB unavailable)
 * 6. AgentAuth — authenticate Bearer token
 * 7. Rate limit headers on all responses
 * 8. Route dispatch
 * 9. 404 if no match
 */

// ── Step 1: JSON response headers ──
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// ── Step 2: Bootstrap (loads Composer autoloader) ──
// dirname(__DIR__, 3) resolves from _studio/api/agent/v1/ → _studio/
require_once dirname(__DIR__, 3) . '/engine/bootstrap.php';

// ── Response helpers (return-based, not exit-based — testable) ──

function agentResponse(array $data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function agentError(int $code, string $errorCode, string $message, array $details = []): void
{
    http_response_code($code);
    $response = ['error' => ['code' => $errorCode, 'message' => $message]];
    if (!empty($details)) {
        $response['error']['details'] = $details;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

// ── Step 3: CORS (runs before demo/feature guards so error responses are readable) ──

// Instantiate Settings early for CORS + feature toggle.
// Safe after bootstrap — falls back to wildcard if DB unavailable.
try {
    $settings = new \VoxelSite\Settings();
    $allowedRaw = $settings->get('agent_api_allowed_origins', '*');
} catch (\Throwable) {
    $settings = null; // DB not available — feature toggle will use safe default
    $allowedRaw = '*';
}

$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($allowedRaw === '*') {
    header('Access-Control-Allow-Origin: *');
} else {
    $origins = array_filter(array_map('trim', explode("\n", $allowedRaw)));
    if (in_array($requestOrigin, $origins, true)) {
        header('Access-Control-Allow-Origin: ' . $requestOrigin);
        header('Vary: Origin');
    }
    // No match: omit header entirely → browser blocks the request
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Step 3b: Public schema endpoint (no auth, no feature toggle) ──
// Agents need to discover the API contract before authenticating.
// Resolve the request path using the same logic as the main router (Step 8)
// so Apache (_path=schema.php) and Nginx (REQUEST_URI) both work.
$earlyPath = '';
if (isset($_GET['_path'])) {
    $earlyPath = $_GET['_path'];
} else {
    $earlyUri = strtok($_SERVER['REQUEST_URI'] ?? '', '?');
    $earlyBase = '/_studio/api/agent/v1';
    if (str_starts_with($earlyUri, $earlyBase)) {
        $earlyPath = substr($earlyUri, strlen($earlyBase));
    }
}
// Normalize: strip leading/trailing slashes and optional .php extension
// so both /schema and /schema.php (Apache rewrite) resolve identically.
$earlyPathClean = trim($earlyPath, '/');
if (str_ends_with($earlyPathClean, '.php')) {
    $earlyPathClean = substr($earlyPathClean, 0, -4);
}
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $earlyPathClean === 'schema') {
    require __DIR__ . '/_schema-handler.php';
    exit;
}

// ── Step 4: Demo mode guard ──
if (\VoxelSite\DemoMode::isActive()) {
    \VoxelSite\Logger::info('agent-api', 'Request blocked: demo mode', [
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    ]);
    agentError(403, 'feature_disabled', 'Agent API is disabled in demo mode.');
    exit;
}

// ── Step 5: Feature toggle (reuses $settings from CORS step) ──
// Fail-closed: if Settings construction failed (DB unavailable), $settings is null
// and this check returns feature_disabled — the API never opens when the DB is down.
if (!$settings || $settings->get('agent_api_enabled') !== true) {
    \VoxelSite\Logger::info('agent-api', 'Request blocked: feature disabled', [
        'ip'              => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'settings_loaded' => $settings !== null,
    ]);
    agentError(403, 'feature_disabled', 'Agent API is not enabled. Enable it in Settings → API Access.');
    exit;
}

// ── Step 6: Authenticate via AgentAuth ──
try {
    $auth = new \VoxelSite\AgentAuth();
} catch (\RuntimeException $e) {
    \VoxelSite\Logger::exception('agent-api', $e, [
        'operation' => 'auth_init',
        'ip'        => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    ]);
    agentError(503, 'service_unavailable', 'Agent API authentication service is unavailable.');
    exit;
}

$authResult = $auth->authenticate();

// ── Step 7: Handle auth failures + send rate limit headers on ALL responses ──
\VoxelSite\AgentAuth::sendRateLimitHeaders($authResult);

if ($authResult['status'] !== \VoxelSite\AgentAuth::AUTH_OK) {
    $statusMap = [
        \VoxelSite\AgentAuth::AUTH_NO_HEADER   => [401, 'no_header', 'Missing Authorization header. Use: Authorization: Bearer vxs_...'],
        \VoxelSite\AgentAuth::AUTH_MALFORMED    => [401, 'malformed', 'Malformed Authorization header. Expected: Bearer vxs_<64 hex chars>'],
        \VoxelSite\AgentAuth::AUTH_INVALID_KEY  => [401, 'invalid_key', 'Invalid API key. The key may have been revoked or never existed.'],
        \VoxelSite\AgentAuth::AUTH_RATE_LIMITED => [429, 'rate_limited', 'Rate limit exceeded. Check X-RateLimit-Reset header for reset time.'],
    ];

    $info = $statusMap[$authResult['status']] ?? [401, 'auth_failed', 'Authentication failed.'];
    \VoxelSite\Logger::warning('agent-api', 'Auth failed: ' . $info[1], [
        'status'     => $authResult['status'],
        'ip'         => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 200),
    ]);
    agentError($info[0], $info[1], $info[2]);
    exit;
}

$keyData = $authResult['key'];

// ── Step 8: Parse request path and match routes ──
$method = $_SERVER['REQUEST_METHOD'];

// _path is set by Apache rewrite (.htaccess: ?_path=$1).
// On Nginx (no .htaccess), fall back to REQUEST_URI and strip the base prefix.
if (isset($_GET['_path'])) {
    $path = $_GET['_path'];
} else {
    $requestUri = strtok($_SERVER['REQUEST_URI'] ?? '', '?');
    $basePath = '/_studio/api/agent/v1';
    if (str_starts_with($requestUri, $basePath)) {
        $path = substr($requestUri, strlen($basePath));
    } else {
        $path = '';
    }
}
$path = '/' . trim($path, '/');

// Route table: [method, pattern, handler_file, required_scope]
$routes = [
    // Pages
    ['GET',    '/pages',         'pages.php',       'pages:read'],
    ['GET',    '/pages/:slug',   'pages.php',       'pages:read'],
    ['POST',   '/pages',         'pages.php',       'pages:write'],
    ['PUT',    '/pages/:slug',   'pages.php',       'pages:write'],
    ['DELETE', '/pages/:slug',   'pages.php',       'pages:write'],

    // Compile
    ['POST',   '/compile',       'compile.php',     'compile:trigger'],

    // Publish
    ['POST',   '/publish',       'publish.php',     'publish:trigger'],

    // Settings
    ['GET',    '/settings',      'settings.php',    'settings:read'],
    ['PUT',    '/settings',      'settings.php',    'settings:write'],

    // Submissions
    ['GET',    '/submissions',   'submissions.php', 'submissions:read'],

    // Assets
    ['GET',    '/assets',        'assets.php',      'assets:read'],
    ['POST',   '/assets',        'assets.php',      'assets:write'],

    // Tools
    ['GET',    '/tools',         'tools.php',       'tools:invoke'],
    ['POST',   '/tools/invoke',  'tools.php',       'tools:invoke'],

    // Prompt execution (opt-in scope — not in any role's defaults)
    ['POST',   '/prompt',        'prompt.php',      'prompt:execute'],
    ['GET',    '/prompt/:id',    'prompt.php',      'prompt:execute'],
];

$matched = false;

foreach ($routes as [$routeMethod, $routePattern, $handlerFile, $requiredScope]) {
    if ($method !== $routeMethod) {
        continue;
    }

    $params = matchAgentRoute($routePattern, $path);
    if ($params === null) {
        continue;
    }

    $matched = true;

    // ── Scope enforcement ──
    try {
        $auth->requireScope($keyData, $requiredScope);
    } catch (\RuntimeException $e) {
        \VoxelSite\Logger::warning('agent-api', 'Scope denied', [
            'key_label' => $keyData['label'] ?? 'unknown',
            'key_role'  => $keyData['role'] ?? 'unknown',
            'scope'     => $requiredScope,
            'method'    => $method,
            'path'      => $path,
            'ip'        => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        ]);
        agentError(403, 'insufficient_scope', $e->getMessage());
        exit;
    }

    // ── Dispatch to handler ──
    $handlerPath = __DIR__ . '/' . $handlerFile;
    if (!file_exists($handlerPath)) {
        \VoxelSite\Logger::error('agent-api', 'Handler file missing', [
            'handler' => $handlerFile,
            'method'  => $method,
            'path'    => $path,
        ]);
        agentError(501, 'not_implemented', 'This endpoint is not yet implemented.');
        exit;
    }

    // ── Log every dispatched request ──
    \VoxelSite\Logger::info('agent-api', "{$method} {$path}", [
        'handler'   => $handlerFile,
        'scope'     => $requiredScope,
        'key_label' => $keyData['label'] ?? 'unknown',
        'key_role'  => $keyData['role'] ?? 'unknown',
        'key_pre'   => substr($keyData['prefix'] ?? '', 0, 12),
        'ip'        => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    ]);

    // Make context available to endpoint handlers
    $_agentContext = [
        'auth'       => $auth,
        'authResult' => $authResult,
        'keyData'    => $keyData,
        'method'     => $method,
        'path'       => $path,
        'params'     => $params,
        'settings'   => $settings,
    ];

    require $handlerPath;
    exit;
}

// ── Step 9: No matching route ──
if (!$matched) {
    \VoxelSite\Logger::warning('agent-api', 'Route not found', [
        'method' => $method,
        'path'   => $path,
        'ip'     => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    ]);
    agentError(404, 'not_found', "No endpoint matches {$method} {$path}.");
}

// ═══════════════════════════════════════════
//  Route Matching
// ═══════════════════════════════════════════

/**
 * Match a route pattern against a request path.
 *
 * Patterns like /pages/:slug become regex that captures named
 * segments. Returns an associative array of params on match,
 * or null on no match.
 *
 * @return array<string, string>|null
 */
function matchAgentRoute(string $pattern, string $path): ?array
{
    $regex = preg_replace('#:([a-zA-Z_]+)#', '(?P<$1>[^/]+)', $pattern);
    $regex = '#^' . $regex . '$#';

    if (!preg_match($regex, $path, $matches)) {
        return null;
    }

    $params = [];
    foreach ($matches as $key => $value) {
        if (is_string($key)) {
            $params[$key] = $value;
        }
    }

    return $params;
}
