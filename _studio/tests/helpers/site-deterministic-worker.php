<?php
declare(strict_types=1);
$root = realpath($argv[1]);
if (!$root || !str_starts_with($root, realpath(sys_get_temp_dir()) . '/vs-site-deterministic-')) throw new RuntimeException('Disposable worker root required.');
$route = $argv[2];
$body = json_decode($argv[3], true, 512, JSON_THROW_ON_ERROR);
foreach (['PREVIEW_DIR' => 'preview', 'ASSETS_DIR' => 'assets', 'SNAPSHOT_DIR' => 'snapshots', 'MUTATION_LOCK' => 'mutation.lock'] as $key => $relative) putenv('VS_TEST_' . $key . '=' . $root . '/' . $relative);
require dirname(__DIR__, 2) . '/engine/bootstrap.php';
$db = \VoxelSite\Database::getInstance($root . '/studio.db');
$_REQUEST = ['_route_method' => 'POST', '_route_path' => $route, '_user' => ['id' => 1, 'role' => 'owner']];
function getJsonBody(): array { global $body; return $body; }
function jsonResponse(mixed $data, int $status = 200): void {
    echo json_encode(['httpCode' => $status, 'response' => $data], JSON_THROW_ON_ERROR);
}
try {
    // Historical recovery receipts must still block delayed old requests.
    if (isset($body['mutation_id'])) {
        $lock = \VoxelSite\SiteMutationLock::acquire();
        $journal = new \VoxelSite\SiteMutationJournal($db);
        $journal->recoverInterrupted();
        \VoxelSite\SiteRecovery::assertWritable($db);
        $terminal = $journal->begin($body['mutation_id'], 1, $route, $body);
        if ($terminal !== null) { jsonResponse($terminal['response'], $terminal['httpCode']); exit; }
        throw new RuntimeException('Legacy fixture only dispatches retained terminal requests.');
    }
    \VoxelSite\SiteRecovery::assertWritable($db);
    $hook = static function(string $phase, array $operation) use($root): void {
        if ($phase === 'after_file' && !is_file($root . '/preview/about.php') && is_file($root . '/pause-enabled')) {
            file_put_contents($root . '/worker-paused', 'A reviewed file was removed.');
            usleep(10000000);
        }
    };
    $service = new \VoxelSite\Agent\StudioAuthoringService($db, new \VoxelSite\SiteWorkspace($db), $hook);
    do {
        $data = $service->structuralRequest(\VoxelSite\Agent\StudioAuthoringService::actor(), $route, $body);
        $body['checkpoint'] = $data['operation']['checkpoint'];
    } while ($data['operation']['status'] === 'applying');
    jsonResponse(['ok' => true, 'data' => $data]);
} catch (\VoxelSite\Agent\OperationException $error) {
    jsonResponse(['ok' => false, 'error' => ['code' => $error->errorCode, 'message' => $error->getMessage(), 'details' => $error->details]], 409);
} catch (\Throwable $error) {
    jsonResponse(['ok' => false, 'error' => ['code' => 'review_conflict', 'message' => $error->getMessage()]], 409);
}
