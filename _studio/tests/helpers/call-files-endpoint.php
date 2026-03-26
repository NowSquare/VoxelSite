<?php

declare(strict_types=1);

/**
 * File Editor Endpoint Test Runner
 *
 * Subprocess helper that dispatches through the REAL files.php endpoint handler.
 *
 * Usage:
 *   echo '{"path":"work/about.php","content":"..."}' | \
 *     php call-files-endpoint.php <dbPath> <previewDir> <assetsDir> <method> <routePath>
 *
 * Outputs a single JSON line:
 *   {"httpCode": 200, "response": {"ok": true, "data": {...}}}
 */

$dbPath     = $argv[1] ?? '';
$previewDir = $argv[2] ?? '';
$assetsDir  = $argv[3] ?? '';
$method     = strtoupper($argv[4] ?? 'GET');
$routePath  = $argv[5] ?? '';

if ($dbPath === '' || $previewDir === '' || $assetsDir === '' || $routePath === '') {
    fwrite(STDERR, "Usage: php call-files-endpoint.php <dbPath> <previewDir> <assetsDir> <method> <routePath>\n");
    exit(2);
}

// Read request body from stdin (non-blocking for GET)
stream_set_blocking(STDIN, false);
$inputBody = file_get_contents('php://stdin') ?: '';
stream_set_blocking(STDIN, true);

// ── Load engine bootstrap ──
require_once dirname(__DIR__, 2) . '/engine/bootstrap.php';

// ── Claim the Database singleton with the test DB ──
\VoxelSite\Database::getInstance($dbPath);

// ── Set env vars so FileManager + endpoint use test paths ──
putenv("VS_TEST_PREVIEW_DIR={$previewDir}");
putenv("VS_TEST_ASSETS_DIR={$assetsDir}");

// ── Mock router/middleware functions ──

$__capturedResponse = null;
$__capturedHttpCode = 200;

function jsonResponse(mixed $data, int $status = 200): void
{
    global $__capturedResponse, $__capturedHttpCode;
    $__capturedResponse = $data;
    $__capturedHttpCode = $status;
}

function getJsonBody(): array
{
    global $inputBody;
    return is_array($d = json_decode($inputBody, true)) ? $d : [];
}

// For GET/DELETE requests, parse query string from body as params
if (($method === 'GET' || $method === 'DELETE') && $inputBody !== '') {
    $params = json_decode($inputBody, true);
    if (is_array($params)) {
        $_GET = array_merge($_GET, $params);
    }
}

// ── Set up request context ──
$_REQUEST['_route_method'] = $method;
$_REQUEST['_route_path']   = $routePath;
$_REQUEST['_user']         = ['id' => 1, 'email' => 'test@test.com', 'name' => 'Test', 'role' => 'owner'];

// ── Dispatch through the REAL endpoint ──
require __DIR__ . '/../../api/endpoints/files.php';

// ── Emit captured response ──
echo json_encode([
    'httpCode' => $__capturedHttpCode,
    'response' => $__capturedResponse,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
exit(0);
