<?php
declare(strict_types=1);

use VoxelSite\{Database, Settings, SiteWorkspace, WorkspaceAccessProbe, WorkspaceActivationService};

$db = Database::getInstance();
$method = $_REQUEST['_route_method'];
$path = $_REQUEST['_route_path'];
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

// An expiring nonce proves that an unauthenticated same-server request reached
// this exact installation. It grants no session and returns no website content.
if ($method === 'GET' && $path === '/workspace/probe') {
    $nonce = $_GET['nonce'] ?? '';
    $value = is_string($nonce) && preg_match('/^[a-f0-9]{48}$/D', $nonce)
        ? WorkspaceAccessProbe::control($db, $nonce) : null;
    header('Content-Type: text/plain; charset=utf-8');
    http_response_code($value === null ? 404 : 200);
    echo $value ?? '';
    return;
}

if (($_REQUEST['_user']['role'] ?? null) !== 'owner') {
    jsonResponse(['ok' => false, 'error' => ['code' => 'forbidden', 'message' => 'Only the site owner can prepare or recover private draft storage.']], 403);
    return;
}

$workspace = new SiteWorkspace($db);
$settings = new Settings($db);
try {
    if ($method === 'GET' && $path === '/workspace/status') {
        jsonResponse(['ok' => true, 'data' => $workspace->status() + [
            'base_url' => $settings->get('workspace_base_url', $settings->get('site_url', '')),
            'preflight' => $workspace->preflight(),
            'access_verified' => $settings->get('workspace_access_verified') !== null,
        ]]);
        return;
    }
    // Router authentication and session-bound CSRF are mandatory before dispatch.
    $service = new WorkspaceActivationService($workspace, $db);
    if ($method === 'POST' && $path === '/workspace/migrate') {
        $body = getJsonBody();
        $base = $body['base_url'] ?? $settings->get('workspace_base_url', '');
        if (!is_string($base)) throw new RuntimeException('A configured website URL is required.');
        jsonResponse(['ok' => true, 'data' => $service->continue($base, $_SERVER, 100)]);
        return;
    }
    if ($method === 'POST' && $path === '/workspace/rollback') {
        jsonResponse(['ok' => true, 'data' => $service->rollback()]);
        return;
    }
} catch (Throwable $error) {
    jsonResponse(['ok' => false, 'error' => ['code' => 'workspace_upgrade_failed',
        'message' => $error->getMessage(), 'upgrade_url' => '/_studio/workspace.php']], 409);
    return;
}
jsonResponse(['ok' => false, 'error' => ['code' => 'not_found', 'message' => 'Workspace action not found.']], 404);
