<?php
declare(strict_types=1);

/** Activate an explicitly seeded disposable draft; never infer installed paths. */
function activateLegacyTestWorkspace(\VoxelSite\Database $db): \VoxelSite\SiteWorkspace
{
    $preview = getenv('VS_TEST_PREVIEW_DIR');
    $assets = getenv('VS_TEST_ASSETS_DIR');
    $temporary = realpath(sys_get_temp_dir());
    foreach ([$preview, $assets] as $path) {
        if (!$path || !is_dir($path) || !str_starts_with((string) realpath($path), $temporary . '/') || is_link($path)) {
            throw new RuntimeException('Legacy fixtures require canonical disposable draft and published assets.');
        }
    }
    $preview = realpath($preview); $assets = realpath($assets);
    putenv('VS_TEST_PREVIEW_DIR=' . $preview); putenv('VS_TEST_ASSETS_DIR=' . $assets);
    $root = dirname($preview);
    putenv('VS_TEST_DOC_ROOT=' . (getenv('VS_TEST_DOC_ROOT') ?: dirname($assets)));
    foreach (['VS_TEST_MUTATION_LOCK' => '/mutation.lock', 'VS_TEST_WORKSPACE_STATE_DIR' => '/data/workspace',
        'VS_TEST_REVISIONS_DIR' => '/data/revisions', 'VS_TEST_SNAPSHOT_DIR' => '/snapshots'] as $key => $suffix) {
        if (!getenv($key)) putenv($key . '=' . $root . $suffix);
    }
    foreach (['logDir' => $root . '/logs', 'initialized' => true] as $key => $value) {
        (new ReflectionProperty(\VoxelSite\Logger::class, $key))->setValue(null, $value);
    }
    $migration = require dirname(__DIR__, 2) . '/engine/migrations/015_private_draft_assets.php';
    ($migration['up'])($db);
    $workspace = new \VoxelSite\SiteWorkspace($db);
    do { $result = (new \VoxelSite\WorkspaceMigration($workspace, $db))->run(); } while (!$workspace->status()['ready']);
    $workspace->assertReady();
    return $workspace;
}
