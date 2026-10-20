<?php
declare(strict_types=1);
$root = $argv[1];
foreach (['PREVIEW_DIR' => 'preview', 'ASSETS_DIR' => 'assets', 'SNAPSHOT_DIR' => 'snapshots', 'MUTATION_LOCK' => 'mutation.lock'] as $key => $dir) putenv('VS_TEST_' . $key . '=' . $root . '/' . $dir);
require dirname(__DIR__, 2) . '/engine/bootstrap.php';
$db = \VoxelSite\Database::getInstance($root . '/studio.db');
$lock = \VoxelSite\SiteMutationLock::acquire();
if (($argv[4] ?? '') === '--fail-rollback') {
    $db->getPdo()->sqliteCreateFunction('make_rollback_unwritable', static function () use ($root): int {
        chmod($root . '/preview/index.php', 0444);
        return 1;
    });
    $db->exec("CREATE TEMP TRIGGER fail_projection BEFORE UPDATE ON pages BEGIN SELECT make_rollback_unwritable(); SELECT RAISE(ABORT, 'Injected page projection failure'); END");
}
if (($argv[4] ?? '') === '--pause-before-projection') {
    $db->getPdo()->sqliteCreateFunction('pause_projection', static function () use ($root): int {
        file_put_contents($root . '/restore-paused', 'restoration files written');
        usleep(10000000);
        return 1;
    });
    $db->exec('CREATE TEMP TRIGGER pause_projection BEFORE UPDATE ON pages BEGIN SELECT pause_projection(); END');
}
if (($argv[4] ?? '') === '--fail-outcome') {
    $db->exec("CREATE TEMP TRIGGER fail_restore_outcome BEFORE UPDATE ON site_control_mutations WHEN NEW.status = 'applied' BEGIN SELECT RAISE(ABORT, 'Injected restore outcome persistence failure'); END");
}
$_REQUEST = ['_route_method' => $argv[2], '_route_path' => $argv[2] === 'GET' ? '/snapshots' : '/snapshots/' . $argv[3] . ($argv[2] === 'POST' ? '/restore' : ''), '_route_params' => ['id' => $argv[3]], '_user' => ['id' => 1, 'role' => 'owner']];
$response = null; $httpCode = 200;
function jsonResponse(mixed $data, int $status = 200): void { global $response, $httpCode; $response = $data; $httpCode = $status; }
function getJsonBody(): array { return []; }
require dirname(__DIR__, 2) . '/api/endpoints/snapshots.php';
echo json_encode(['httpCode' => $httpCode, 'response' => $response], JSON_THROW_ON_ERROR);
