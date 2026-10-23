<?php
declare(strict_types=1);

use VoxelSite\{Database, SiteWorkspace, WebsiteHistoryService};
use VoxelSite\Agent\{OperationActor, OperationException};

$method = $_REQUEST['_route_method'];
$path = $_REQUEST['_route_path'];
$params = $_REQUEST['_route_params'] ?? [];
$db = Database::getInstance();
$history = new WebsiteHistoryService($db, new SiteWorkspace($db));
$actor = new OperationActor('user', (int) ($_REQUEST['_user']['id'] ?? 0), null, [], 'studio_configured', null);
// Numeric legacy URLs remain aliases for the explicit legacy archive identity.
$id = isset($params['id']) ? (string) $params['id'] : null;
if ($id !== null && preg_match('/^[1-9][0-9]*$/D', $id)) $id = 'legacy_' . $id;
try {
    if ($method === 'GET') {
        if ($id !== null && str_ends_with($path, '/delete-review')) {
            $result = $history->snapshots->deletions()->inspect($actor, (object) ['snapshot_id' => $id]);
        } elseif ($id !== null && str_ends_with($path, '/inspect')) {
            $result = $history->snapshots->inspect($actor, $id);
        } elseif ($path === '/snapshots') {
            $input = ['limit' => isset($_GET['limit']) ? (int) $_GET['limit'] : 50];
            if (isset($_GET['offset'])) $input['offset'] = (int) $_GET['offset'];
            if (isset($_GET['inventory_version'])) $input['inventory_version'] = $_GET['inventory_version'];
            $result = $history->snapshots->listPaged($actor, (object) $input);
        } else throw new OperationException('not_found', 'Snapshot endpoint not found.');
        jsonResponse(['ok' => true, 'data' => $result]); return;
    }
    $body = getJsonBody();
    if ($method === 'POST' && $id !== null && str_ends_with($path, '/prepare-restore')) {
        $result = $history->restores->prepare($actor, (object) ['request_id' => $body['request_id'] ?? null,
            'snapshot_id' => $id, 'domain' => $body['domain'] ?? null]);
        jsonResponse(['ok' => true, 'data' => $result]); return;
    }
    if ($method === 'POST' && in_array($path, ['/snapshots', '/snapshots/capture'], true)) {
        $operation = $history->capture($actor, $body);
    } elseif ($method === 'POST' && $id !== null && (str_ends_with($path, '/restore') || str_ends_with($path, '/apply-restore'))) {
        $operation = $history->restoreSnapshot($actor, $id, $body);
    } elseif ($method === 'DELETE' && $id !== null) {
        $operation = $history->deleteSnapshot($actor, $id, $body);
    } else throw new OperationException('not_found', 'Snapshot endpoint not found.');
    $ok = in_array($operation['status'], ['applying', 'succeeded'], true);
    jsonResponse(['ok' => $ok, 'data' => ($operation['result'] ?? []) + ['operation' => $operation],
        'error' => $ok ? null : ($operation['result']['error'] ?? ['code' => $operation['status'], 'message' => 'This snapshot operation needs attention.'])],
        $operation['status'] === 'applying' ? 202 : ($ok ? 200 : 409));
} catch (OperationException $error) {
    jsonResponse(['ok' => false, 'error' => ['code' => $error->errorCode, 'message' => $error->getMessage(), 'details' => $error->details]],
        match ($error->errorCode) { 'permission_denied' => 403, 'not_found' => 404, 'invalid_schema' => 422, default => 409 });
}
