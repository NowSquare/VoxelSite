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
try {
    if ($method === 'GET' && $path === '/designs') {
        $input = ['limit' => isset($_GET['limit']) ? (int) $_GET['limit'] : 50];
        if (isset($_GET['offset'])) $input['offset'] = (int) $_GET['offset'];
        if (isset($_GET['inventory_version'])) $input['inventory_version'] = $_GET['inventory_version'];
        jsonResponse(['ok' => true, 'data' => $history->designs->list($actor, (object) $input)]);
        return;
    }
    if ($method === 'GET' && isset($params['id']) && str_ends_with($path, '/preview')) {
        $render = $history->designs->previewResponse($actor, $params['id'], (string) ($_GET['path'] ?? 'index.php'), isset($_GET['embed']));
        http_response_code($render['status']);
        header('Content-Type: ' . $render['mime']);
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: no-referrer');
        echo $render['content'];
        return;
    }
    $action = match (true) {
        $method === 'POST' && $path === '/designs' => 'save',
        $method === 'POST' && $path === '/designs/new' => 'new',
        $method === 'POST' && isset($params['id']) && str_ends_with($path, '/load') => 'load',
        $method === 'PUT' && isset($params['id']) => 'rename',
        $method === 'DELETE' && isset($params['id']) => 'delete',
        default => null,
    };
    if ($action !== null) {
        $result = $history->design($actor, $action, getJsonBody(), $params['id'] ?? null);
        $ok = in_array($result['status'], ['applying', 'succeeded'], true);
        jsonResponse(['ok' => $ok, 'data' => ($result['result'] ?? []) + ['operation' => $result, 'auto_saved' => null],
            'error' => $ok ? null : ($result['result']['error'] ?? ['code' => $result['status'], 'message' => 'This design operation needs attention.'])],
            $result['status'] === 'applying' ? 202 : ($ok ? 200 : 409));
        return;
    }
    jsonResponse(['ok' => false, 'error' => ['code' => 'not_found', 'message' => 'Designs endpoint not found.']], 404);
} catch (OperationException $error) {
    jsonResponse(['ok' => false, 'error' => ['code' => $error->errorCode, 'message' => $error->getMessage(), 'details' => $error->details]],
        $error->errorCode === 'permission_denied' ? 403 : 409);
} catch (Throwable $error) {
    VoxelSite\Logger::error('system', 'Design operation failed', ['exception' => $error->getMessage()]);
    jsonResponse(['ok' => false, 'error' => ['code' => 'design_failed', 'message' => 'The saved design could not be verified or processed.']], 409);
}
