<?php
declare(strict_types=1);

$root = $argv[1];
$route = $argv[2];
$body = json_decode($argv[3], true, 512, JSON_THROW_ON_ERROR);
foreach (['PREVIEW_DIR' => 'preview', 'ASSETS_DIR' => 'assets', 'SNAPSHOT_DIR' => 'snapshots', 'MUTATION_LOCK' => 'mutation.lock'] as $key => $relative) {
    putenv('VS_TEST_' . $key . '=' . $root . '/' . $relative);
}
require dirname(__DIR__, 2) . '/engine/bootstrap.php';
$db = \VoxelSite\Database::getInstance($root . '/studio.db');
$_REQUEST['_route_method'] = 'POST';
$_REQUEST['_route_path'] = $route;
$_REQUEST['_user'] = ['id' => 1, 'role' => 'owner'];
function getJsonBody(): array { global $body; return $body; }
function jsonResponse(mixed $data, int $status = 200): void {
    \VoxelSite\SiteMutationJournal::finish($data, $status);
    echo json_encode(['httpCode' => $status, 'response' => $data], JSON_THROW_ON_ERROR);
}
try {
    $lock = \VoxelSite\SiteMutationLock::acquire();
    $journal = new \VoxelSite\SiteMutationJournal($db);
    $journal->recoverInterrupted();
    \VoxelSite\SiteRecovery::assertWritable($db);
    $terminal = $journal->begin($body['mutation_id'], 1, $route, $body);
    if ($terminal !== null) {
        jsonResponse($terminal['response'], $terminal['httpCode']);
        exit;
    }
    require dirname(__DIR__, 2) . '/api/endpoints/site-control.php';
} catch (\Throwable $error) {
    jsonResponse(['ok' => false, 'error' => ['code' => 'review_conflict', 'message' => $error->getMessage()]], 409);
}
