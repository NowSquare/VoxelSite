<?php

declare(strict_types=1);

/**
 * Nav Reorder / Preflight Endpoint Test Runner
 *
 * Subprocess helper that dispatches through the REAL endpoint handler.
 * Sets up execution context (env vars for path redirection, request
 * globals, mock jsonResponse/getJsonBody), then requires site-control.php.
 *
 * Usage:
 *   echo '{"pageId":"page:about.php"}' | \
 *     php call-nav-endpoint.php <dbPath> <previewDir> <assetsDir> <method> <routePath> [--fail-write]
 *
 *   method:    GET or POST
 *   routePath: /site-control/nav-preflight or /site-control/nav-reorder
 *
 * Outputs a single JSON line:
 *   {"httpCode": 200, "response": {"ok": true, "data": {...}}}
 */

$dbPath     = $argv[1] ?? '';
$previewDir = $argv[2] ?? '';
$assetsDir  = $argv[3] ?? '';
$method     = strtoupper($argv[4] ?? 'GET');
$routePath  = $argv[5] ?? '';
$failMode   = $argv[6] ?? null;

if ($dbPath === '' || $previewDir === '' || $assetsDir === '' || $routePath === '') {
    fwrite(STDERR, "Usage: php call-nav-endpoint.php <dbPath> <previewDir> <assetsDir> <method> <routePath> [--fail-write]\n");
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
$snapshotDir = dirname($previewDir) . '/snapshots';
if (!is_dir($snapshotDir)) mkdir($snapshotDir, 0755, true);

putenv("VS_TEST_PREVIEW_DIR={$previewDir}");
putenv("VS_TEST_ASSETS_DIR={$assetsDir}");
putenv("VS_TEST_SNAPSHOT_DIR={$snapshotDir}");

// ── --fail-write: force write failure after mutation for rollback testing ──
if ($failMode === '--fail-write') {
    putenv('VS_TEST_NAV_FAIL_WRITE=1');
}

// ── --fail-rename: force rename write failure after mutation for rollback testing ──
if ($failMode === '--fail-rename') {
    putenv('VS_TEST_RENAME_FAIL_WRITE=1');
}

// ── --fail-delete-nav: force failure after file delete, before nav write ──
if ($failMode === '--fail-delete-nav') {
    putenv('VS_TEST_DELETE_FAIL_NAV=1');
}

// ── --fail-delete-db: force failure after nav write, before DB delete ──
if ($failMode === '--fail-delete-db') {
    putenv('VS_TEST_DELETE_FAIL_DB=1');
}

// ── --fail-move-refs: force failure after file move, before reference rewrite ──
if ($failMode === '--fail-move-refs') {
    putenv('VS_TEST_MOVE_FAIL_REFS=1');
}

// ── --fail-move-nav: force failure after reference rewrite, before nav write ──
if ($failMode === '--fail-move-nav') {
    putenv('VS_TEST_MOVE_FAIL_NAV=1');
}

// ── --fail-move-db: force failure after nav write, before DB update ──
if ($failMode === '--fail-move-db') {
    putenv('VS_TEST_MOVE_FAIL_DB=1');
}

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

// For GET requests, parse query string from body as params
if ($method === 'GET' && $inputBody !== '') {
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
require __DIR__ . '/../../api/endpoints/site-control.php';

// ── Emit captured response ──
echo json_encode([
    'httpCode' => $__capturedHttpCode,
    'response' => $__capturedResponse,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
exit(0);
