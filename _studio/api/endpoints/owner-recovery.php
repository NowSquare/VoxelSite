<?php
declare(strict_types=1);
use VoxelSite\{Database, SiteWorkspace, StudioOwnerRecovery};
use VoxelSite\Agent\{JsonSchema, OperationActor, OperationException, ToolContracts};

$db = Database::getInstance();
$actor = new OperationActor('user', (int) ($_REQUEST['_user']['id'] ?? 0), null, [], 'studio_configured', null);
$method = $_REQUEST['_route_method']; $path = $_REQUEST['_route_path']; $id = $_REQUEST['_route_params']['id'] ?? null;
header('Cache-Control: no-store');
try {
    $service = StudioOwnerRecovery::create($db, new SiteWorkspace($db), loadConfig() ?? []);
    if ($method === 'GET') $result = $id === null ? $service->list($actor) : $service->inspect($actor, $id);
    elseif ($method === 'POST' && str_ends_with($path, '/review')) {
        JsonSchema::validate((object) getJsonBody(), ToolContracts::object([]));
        $result = $service->review($actor, $id);
    } elseif ($method === 'POST' && str_ends_with($path, '/restore')) {
        $body = (object) getJsonBody();
        JsonSchema::validate($body, ToolContracts::object(['review_id' => ToolContracts::text(80), 'digest' => ToolContracts::hash()]));
        $result = $service->recover($actor, $id, $body->review_id, $body->digest);
    } else throw new OperationException('invalid_schema', 'Choose an explicit recovery action.');
    jsonResponse(['ok' => true, 'data' => $result]);
} catch (OperationException $error) {
    jsonResponse(['ok' => false, 'error' => ['code' => $error->errorCode, 'message' => $error->getMessage()]],
        $error->errorCode === 'permission_denied' ? 403 : 409);
}
