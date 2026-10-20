<?php
declare(strict_types=1);
require dirname(__DIR__, 2) . '/engine/bootstrap.php';
\VoxelSite\Database::getInstance($argv[1]);
putenv('VS_TEST_PREVIEW_DIR=' . $argv[2]); putenv('VS_TEST_ASSETS_DIR=' . $argv[3]); putenv('VS_TEST_SNAPSHOT_DIR=' . dirname($argv[2]) . '/snapshots');
putenv('VS_TEST_MUTATION_LOCK=' . dirname($argv[2]) . '/mutation.lock');
$lock = \VoxelSite\SiteMutationLock::acquire();
if (($argv[5] ?? '') === '--fail-after-write') putenv('VS_TEST_SNAPSHOT_FAIL_AFTER_WRITE=1');
$_REQUEST['_route_method'] = 'POST'; $_REQUEST['_route_path'] = '/snapshots/' . $argv[4] . '/restore'; $_REQUEST['_route_params'] = ['id' => $argv[4]]; $_REQUEST['_user'] = ['id' => 1, 'role' => 'owner'];
$response = null; $httpCode = 200;
function jsonResponse(mixed $data, int $status = 200): void { global $response, $httpCode; $response = $data; $httpCode = $status; }
function getJsonBody(): array { return []; }
require dirname(__DIR__, 2) . '/api/endpoints/snapshots.php';
echo json_encode(['httpCode' => $httpCode, 'response' => $response], JSON_UNESCAPED_SLASHES);
