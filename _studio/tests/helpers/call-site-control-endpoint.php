<?php

declare(strict_types=1);

/**
 * Disposable structural HTTP fixture. Ordinary requests include the real route.
 * Failure modes inject the shared executor after a file, before projection or
 * after projection; no retired snapshot/sabotage environment flags are used.
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
$fixtureRoot = realpath(dirname($dbPath));
if (!$fixtureRoot || !str_starts_with($fixtureRoot, realpath(sys_get_temp_dir()) . '/')
    || (new ReflectionMethod(\VoxelSite\FileManager::class, '__construct'))->getNumberOfParameters() < 2) {
    throw new RuntimeException('Endpoint fixtures require canonical temporary roots and workspace injection.');
}
foreach (['logDir' => $fixtureRoot, 'initialized' => true] as $key => $value) {
    (new ReflectionProperty(\VoxelSite\Logger::class, $key))->setValue(null, $value);
}
\VoxelSite\Database::getInstance($dbPath);

// ── Set env vars so FileManager + endpoint use test paths ──
$snapshotDir = dirname($previewDir) . '/snapshots';
if (!is_dir($snapshotDir)) mkdir($snapshotDir, 0755, true);

putenv("VS_TEST_PREVIEW_DIR={$previewDir}");
putenv("VS_TEST_ASSETS_DIR={$assetsDir}");
putenv("VS_TEST_SNAPSHOT_DIR={$snapshotDir}");
foreach (['VS_TEST_DOC_ROOT' => $fixtureRoot, 'VS_TEST_WORKSPACE_STATE_DIR' => $fixtureRoot . '/data/workspace',
    'VS_TEST_MUTATION_LOCK' => $fixtureRoot . '/site.lock', 'VS_TEST_REVISIONS_DIR' => $fixtureRoot . '/data/revisions'] as $key => $fallback) {
    $existing = getenv($key);
    if (!$existing || ($existing !== $fixtureRoot && !str_starts_with($existing, $fixtureRoot . '/'))) putenv($key . '=' . $fallback);
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
if ($failMode !== null) {
    // The ordinary branch below includes the real HTTP endpoint. Failure-only
    // cases inject the same executor's trusted hook through its shared adapter;
    // no process environment flag can sabotage a production request.
    $hook = static function(string $phase,array $operation) use($failMode):void {
        $wanted=match($failMode){'--fail-delete-db','--fail-move-db'=>'after_projection','--fail-delete-nav','--fail-move-nav'=>'before_projection',default=>'after_file'};
        if($phase!==$wanted)return;
        throw new RuntimeException('Injected shared executor failure: '.$failMode);
    };
    $service=new \VoxelSite\Agent\StudioAuthoringService(\VoxelSite\Database::getInstance(),new \VoxelSite\SiteWorkspace(\VoxelSite\Database::getInstance()),$hook);
    try {
        $result=$service->structuralRequest(\VoxelSite\Agent\StudioAuthoringService::actor(),$_REQUEST['_route_path'],getJsonBody());
        jsonResponse(['ok'=>true,'data'=>$result],$result['operation']['status']==='applying'?202:200);
    }catch(\VoxelSite\Agent\OperationException $error){
        jsonResponse(['ok'=>false,'error'=>['code'=>$error->errorCode,'message'=>$error->getMessage(),'details'=>$error->details]],409);
    }
} else require __DIR__ . '/../../api/endpoints/site-control.php';

// ── Emit captured response ──
echo json_encode([
    'httpCode' => $__capturedHttpCode,
    'response' => $__capturedResponse,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
exit(0);
