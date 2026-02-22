<?php

declare(strict_types=1);

/**
 * VoxelSite API Micro-Router
 *
 * Lightweight request routing for all /_studio/api/* endpoints.
 * No framework dependency — just a clean match-and-dispatch loop.
 *
 * Routes are registered as [method, pattern, handler]. Patterns use
 * :param syntax for named segments (e.g., /pages/:slug). The router
 * extracts these into $params and passes them to the handler.
 *
 * Why not use a routing library?
 * - One fewer dependency to audit and maintain.
 * - The API surface is small (~25 endpoints).
 * - Shared hosting buyers never interact with this file.
 */

require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Database;
use VoxelSite\DemoMode;
use VoxelSite\Logger;

// ── CORS headers for same-origin API calls ──
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// ── Parse the request ──
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'] ?? '/';

// Strip query string and the /_studio/api prefix
$path = parse_url($uri, PHP_URL_PATH);
$path = preg_replace('#^/_studio/api#', '', $path);

// If the URI still contains router.php (no URL rewriting), read
// the route path from the _path query parameter instead.
if (str_contains($path, 'router.php')) {
    $path = $_GET['_path'] ?? '/';
}

$path = '/' . trim($path, '/');

// ── Route definitions ──
// Format: [HTTP_METHOD, pattern, endpoint_file]
// Patterns support :param for named segments

$routes = [
    // Install (no auth, no CSRF — runs before system exists)
    ['POST',   '/install/check',           'install.php',      false],
    ['POST',   '/install/test-ai',         'install.php',      false],
    ['POST',   '/install/test-mail',       'install.php',      false],
    ['POST',   '/install/complete',        'install.php',      false],
    ['GET',    '/install/providers',        'install.php',      false],
    ['POST',   '/install/list-models',     'install.php',      false],

    // Auth
    ['POST',   '/auth/login',              'auth.php',         false],
    ['GET',    '/auth/recovery-mode',      'auth.php',         false],
    ['POST',   '/auth/send-reset',         'auth.php',         false],
    ['POST',   '/auth/reset-password',     'auth.php',         false],
    ['POST',   '/auth/reset-with-token',   'auth.php',         false],
    ['POST',   '/auth/logout',             'auth.php',         true],
    ['GET',    '/auth/session',            'auth.php',         true],
    ['PUT',    '/auth/profile',            'auth.php',         true],
    ['PUT',    '/auth/password',           'auth.php',         true],

    // AI
    ['POST',   '/ai/prompt',              'ai.php',            true],
    ['POST',   '/ai/cancel-generation',   'ai.php',            true],
    ['GET',    '/ai/actions',             'actions.php',       true],
    ['GET',    '/ai/actions/:id',         'actions.php',       true],
    ['GET',    '/ai/history',             'ai.php',            true],
    ['GET',    '/ai/conversations',       'ai.php',            true],
    ['GET',    '/ai/conversations/:id',   'ai.php',            true],
    ['GET',    '/ai/diagnostics',         'ai.php',            true],

    // Revisions (Undo/Redo)
    ['POST',   '/revisions/undo',         'revisions.php',     true],
    ['POST',   '/revisions/redo',         'revisions.php',     true],
    ['GET',    '/revisions/state',        'revisions.php',     true],
    ['GET',    '/revisions/list',         'revisions.php',     true],

    // Pages
    ['GET',    '/pages',                  'pages.php',          true],
    ['GET',    '/pages/:slug',            'pages.php',          true],
    ['PUT',    '/pages/:slug/nav',        'pages.php',          true],
    ['PUT',    '/pages/reorder',          'pages.php',          true],
    ['PUT',    '/pages/:slug',            'pages.php',          true],
    ['DELETE', '/pages/:slug',            'pages.php',          true],

    // File editor
    ['GET',    '/files',                  'files.php',          true],
    ['GET',    '/files/content',          'files.php',          true],
    ['PUT',    '/files/content',          'files.php',          true],
    ['POST',   '/files/create',           'files.php',          true],
    ['POST',   '/files/compile-tailwind', 'files.php',          true],
    ['DELETE', '/files',                   'files.php',          true],

    // Assets
    ['GET',    '/assets',                 'assets.php',         true],
    ['POST',   '/assets/upload',          'assets.php',         true],
    ['PUT',    '/assets/meta',            'assets.php',         true],
    ['DELETE', '/assets',                 'assets.php',         true],
    ['POST',   '/assets/folder',          'assets.php',         true],

    // Preview / Publish
    ['GET',    '/preview',                'preview.php',        true],
    ['GET',    '/preview/diff',           'preview.php',        true],
    ['POST',   '/publish',               'publish.php',        true],
    ['POST',   '/publish/rollback',      'publish.php',        true],

    // Export (download)
    ['POST',   '/export',                'export.php',         true],

    // Snapshots
    ['GET',    '/snapshots',             'snapshots.php',      true],
    ['POST',   '/snapshots',             'snapshots.php',      true],
    ['POST',   '/snapshots/:id/restore', 'snapshots.php',      true],
    ['DELETE', '/snapshots/:id',         'snapshots.php',      true],

    // Collections — disabled for v1.0.0, ships in v1.1
    // ['GET',    '/collections',                        'collections.php', true],
    // ['POST',   '/collections',                        'collections.php', true],
    // ['GET',    '/collections/:slug',                  'collections.php', true],
    // ['PUT',    '/collections/:slug',                  'collections.php', true],
    // ['DELETE', '/collections/:slug',                  'collections.php', true],
    // ['GET',    '/collections/:slug/items',            'collections.php', true],
    // ['POST',   '/collections/:slug/items',            'collections.php', true],
    // ['PUT',    '/collections/:slug/items/:itemId',    'collections.php', true],
    // ['DELETE', '/collections/:slug/items/:itemId',    'collections.php', true],

    // Forms & Submissions
    ['GET',    '/forms',                                      'forms.php',       true],
    ['GET',    '/forms/:formId',                              'forms.php',       true],
    ['GET',    '/forms/:formId/submissions',                  'forms.php',       true],
    ['GET',    '/forms/:formId/submissions/export',           'forms.php',       true],
    ['PUT',    '/forms/:formId/submissions/:id',              'forms.php',       true],
    ['DELETE', '/forms/:formId/submissions/:id',              'forms.php',       true],

    // Settings
    ['GET',    '/settings',              'settings.php',       true],
    ['PUT',    '/settings',              'settings.php',       true],
    ['POST',   '/settings/test-api',     'settings.php',       true],
    ['GET',    '/settings/models',       'settings.php',       true],
    ['POST',   '/settings/list-models',  'settings.php',       true],
    ['GET',    '/settings/system',       'settings.php',       true],
    ['GET',    '/settings/mail',         'settings.php',       true],
    ['POST',   '/settings/mail',         'settings.php',       true],
    ['POST',   '/settings/mail/test',    'settings.php',       true],
    ['GET',    '/settings/mail/log',     'settings.php',       true],
    ['GET',    '/settings/usage',        'settings.php',       true],
    ['GET',    '/settings/logs',         'settings.php',       true],
    ['GET',    '/settings/logs/download','settings.php',       true],
    ['DELETE', '/settings/logs',         'settings.php',       true],

    // Site management
    ['POST',   '/site/reset',            'site.php',           true],
    ['POST',   '/site/reset-install',    'site.php',           true],

    // Update
    ['GET',    '/update/dist-packages',  'update.php',         true],
    ['POST',   '/update/apply-local',    'update.php',         true],
    ['POST',   '/update/upload',         'update.php',         true],
];

// ── Load middleware (defines getJsonBody, authenticateRequest, validateCsrf) ──
require_once __DIR__ . '/middleware.php';

// ── Match the request against registered routes ──
$matched = false;

foreach ($routes as [$routeMethod, $routePattern, $endpointFile, $requiresAuth]) {
    if ($method !== $routeMethod) {
        continue;
    }

    $params = matchRoute($routePattern, $path);
    if ($params === null) {
        continue;
    }

    $matched = true;

    // ── Authentication check ──
    if ($requiresAuth) {
        $user = authenticateRequest();
        if ($user === null) {
            Logger::warning('api', 'Auth failed', [
                'method' => $method,
                'path'   => $path,
                'ip'     => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            ]);
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'unauthorized',
                'message' => 'Session expired or invalid. Please sign in again.',
            ]], 401);
            exit;
        }
    }

    // ── CSRF check for state-changing methods ──
    if (in_array($method, ['POST', 'PUT', 'DELETE'], true) && $requiresAuth) {
        if (!validateCsrf()) {
            Logger::warning('api', 'CSRF validation failed', [
                'method' => $method,
                'path'   => $path,
                'ip'     => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            ]);
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'csrf_failed',
                'message' => 'Security token missing or invalid. Please refresh and try again.',
            ]], 403);
            exit;
        }
    }

    // ── Demo mode: block all write operations ──
    if (DemoMode::shouldBlock($method, $path)) {
        DemoMode::blockIfActive();
    }

    // ── Dispatch to endpoint ──
    $endpointPath = __DIR__ . '/endpoints/' . $endpointFile;
    if (!file_exists($endpointPath)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_implemented',
            'message' => 'This endpoint is not yet implemented.',
        ]], 501);
        exit;
    }

    // Make route params and request info available to endpoint
    $_REQUEST['_route_params'] = $params;
    $_REQUEST['_route_path'] = $path;
    $_REQUEST['_route_method'] = $method;
    if (isset($user)) {
        $_REQUEST['_user'] = $user;
    }

    require $endpointPath;
    exit;
}

// ── No matching route ──
if (!$matched) {
    Logger::warning('api', 'No matching route', [
        'method' => $method,
        'path'   => $path,
        'ip'     => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    ]);
    jsonResponse(['ok' => false, 'error' => [
        'code'    => 'not_found',
        'message' => "No endpoint matches {$method} {$path}.",
    ]], 404);
}

// ═══════════════════════════════════════════
//  Helper Functions
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
function matchRoute(string $pattern, string $path): ?array
{
    // Convert :param segments to named capture groups
    $regex = preg_replace('#:([a-zA-Z_]+)#', '(?P<$1>[^/]+)', $pattern);
    $regex = '#^' . $regex . '$#';

    if (!preg_match($regex, $path, $matches)) {
        return null;
    }

    // Extract only named captures (not numeric keys)
    $params = [];
    foreach ($matches as $key => $value) {
        if (is_string($key)) {
            $params[$key] = $value;
        }
    }

    return $params;
}

/**
 * Send a JSON response and exit.
 *
 * @param mixed $data   The response body (will be JSON-encoded)
 * @param int   $status HTTP status code
 */
function jsonResponse(mixed $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
