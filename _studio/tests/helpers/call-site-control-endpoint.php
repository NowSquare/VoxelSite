<?php

declare(strict_types=1);

/**
 * Site Control Endpoint Test Runner
 *
 * Subprocess helper that dispatches through the REAL endpoint handler.
 * Sets up execution context (env vars for path redirection, request
 * globals, mock jsonResponse/getJsonBody), then requires site-control.php.
 * The real if-block owns all validation, snapshot, rollback, and response.
 *
 * Usage:
 *   echo '{"routeId":"route:/about","newPath":"/about-us"}' | \
 *     php call-site-control-endpoint.php <dbPath> <previewDir> <assetsDir> [--fail-write]
 *
 * Outputs a single JSON line:
 *   {"httpCode": 200, "response": {"ok": true, "data": {...}}}
 *
 * --fail-write: Sets VS_TEST_SABOTAGE_FILE so that createSiteControlSnapshot
 *   deletes the page file after the snapshot is captured, causing
 *   PageService::updatePage() to throw "source file is missing".
 *   The real endpoint's catch block then triggers auto-rollback.
 */

$dbPath     = $argv[1] ?? '';
$previewDir = $argv[2] ?? '';
$assetsDir  = $argv[3] ?? '';
$failMode   = $argv[4] ?? null;

if ($dbPath === '' || $previewDir === '' || $assetsDir === '') {
    fwrite(STDERR, "Usage: php call-site-control-endpoint.php <dbPath> <previewDir> <assetsDir> [--fail-write]\n");
    exit(2);
}

// Read request body from stdin (blocking)
$inputBody = file_get_contents('php://stdin') ?: '';

// ── Load engine bootstrap ──
require_once dirname(__DIR__, 2) . '/engine/bootstrap.php';

// ── Claim the Database singleton with the test DB ──
\VoxelSite\Database::getInstance($dbPath);

// ── Set env vars so FileManager + snapshot functions use test paths ──
$snapshotDir = dirname($previewDir) . '/snapshots';
if (!is_dir($snapshotDir)) mkdir($snapshotDir, 0755, true);

putenv("VS_TEST_PREVIEW_DIR={$previewDir}");
putenv("VS_TEST_ASSETS_DIR={$assetsDir}");
putenv("VS_TEST_SNAPSHOT_DIR={$snapshotDir}");

// ── --fail-write: tell createSiteControlSnapshot to sabotage a file ──
if ($failMode === '--fail-write') {
    $failBody = json_decode($inputBody, true);
    $failRouteId = trim($failBody['routeId'] ?? '');
    if (str_starts_with($failRouteId, 'route:')) {
        $failSlug = trim(substr($failRouteId, 6), '/');
        if ($failSlug === '' || $failSlug === '/') $failSlug = 'index';
        $failFile = ($failSlug === 'index') ? 'index.php' : $failSlug . '.php';
        putenv("VS_TEST_SABOTAGE_FILE={$failFile}");
    }
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

// ── Set up request context ──
$_REQUEST['_route_method'] = 'POST';
$_REQUEST['_route_path']   = '/site-control/url-rename';
$_REQUEST['_user']         = ['id' => 1, 'email' => 'test@test.com', 'name' => 'Test', 'role' => 'owner'];

// ── Dispatch through the REAL endpoint ──
require __DIR__ . '/../../api/endpoints/site-control.php';

// ── Emit captured response ──
echo json_encode([
    'httpCode' => $__capturedHttpCode,
    'response' => $__capturedResponse,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
exit(0);
