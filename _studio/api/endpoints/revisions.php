<?php
declare(strict_types=1);
use VoxelSite\{Database, SiteWorkspace, WebsiteHistoryService};
use VoxelSite\Agent\{OperationActor, OperationException};
$method = $_REQUEST['_route_method']; $path = $_REQUEST['_route_path'];
$db = Database::getInstance();
$history = new WebsiteHistoryService($db, new SiteWorkspace($db));
$actor = new OperationActor('user', (int) ($_REQUEST['_user']['id'] ?? 0), null, [], 'studio_configured', null);
try {
    if ($method === 'GET' && $path === '/revisions/state') {
        jsonResponse(['ok' => true, 'data' => $history->revisions->state($actor)]); return;
    }
    if ($method === 'GET' && $path === '/revisions/list') {
        $input = ['limit' => isset($_GET['limit']) ? (int) $_GET['limit'] : 20];
        if (isset($_GET['offset'])) $input['offset'] = (int) $_GET['offset'];
        if (isset($_GET['head_version'])) $input['head_version'] = $_GET['head_version'];
        jsonResponse(['ok' => true, 'data' => $history->revisions->list($actor, (object) $input)]); return;
    }
    if ($method === 'POST' && in_array($path, ['/revisions/undo', '/revisions/redo'], true)) {
        $result = $history->revision($actor, basename($path), getJsonBody());
        $ok = in_array($result['status'], ['applying', 'succeeded'], true);
        jsonResponse(['ok' => $ok, 'data' => ($result['result'] ?? []) + ['operation' => $result],
            'error' => $ok ? null : ($result['result']['error'] ?? ['code' => $result['status'], 'message' => 'This revision operation needs attention.'])],
            $result['status'] === 'applying' ? 202 : ($ok ? 200 : 409)); return;
    }
    jsonResponse(['ok' => false, 'error' => ['code' => 'not_found', 'message' => 'Revisions endpoint not found.']], 404);
} catch (OperationException $error) {
    jsonResponse(['ok' => false, 'error' => ['code' => $error->errorCode, 'message' => $error->getMessage(), 'details' => $error->details]],
        $error->errorCode === 'permission_denied' ? 403 : 409);
}
