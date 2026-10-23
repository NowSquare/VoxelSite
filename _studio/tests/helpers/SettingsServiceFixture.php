<?php
declare(strict_types=1);
function settingsFixtureRoots(string $root): void
{
    $real = realpath($root); $temporary = realpath(sys_get_temp_dir());
    if (!$real || !$temporary || !str_starts_with($real, $temporary . '/voxelsite-')
        || !is_file($root . '/.governor-settings-test')) throw new RuntimeException('Canonical disposable settings fixture required.');
    foreach (['draft/assets', 'live/assets', 'logs', 'private'] as $path) if (!is_dir($root . '/' . $path)) mkdir($root . '/' . $path, 0700, true);
    foreach (['VS_TEST_PREVIEW_DIR' => '/draft', 'VS_TEST_DOC_ROOT' => '/live', 'VS_TEST_ASSETS_DIR' => '/live/assets',
        'VS_TEST_MUTATION_LOCK' => '/private/site.lock', 'VS_TEST_WORKSPACE_STATE_DIR' => '/private/workspace',
        'VS_TEST_REVISIONS_DIR' => '/private/revisions', 'VS_TEST_SNAPSHOT_DIR' => '/private/snapshots'] as $key => $suffix) putenv($key . '=' . $real . $suffix);
    foreach (['initialized' => true, 'logDir' => $root . '/logs'] as $key => $value) (new ReflectionProperty(\VoxelSite\Logger::class, $key))->setValue(null, $value);
    file_put_contents($root . '/draft/.htaccess', \VoxelSite\SiteWorkspace::ACCESS_MARKER . "\nRequire all denied\nDeny from all\n");
}
function initializeSettingsServiceFixture(\VoxelSite\Database $db, string $root): void
{
    settingsFixtureRoots($root);
    (new \VoxelSite\Migrator($db, new \VoxelSite\Settings($db)))->run();
    $db->delete('settings', 'key != ?', ['schema_version']);
    $db->update('site_workspace_state', ['format' => 2], 'id=1');
    $db->insert('users', ['id' => 1, 'email' => 'owner@fixture.invalid', 'name' => 'Owner', 'role' => 'owner',
        'password_hash' => 'not-a-login', 'created_at' => gmdate('c'), 'updated_at' => gmdate('c')]);
    $key = $db->insert('api_keys', ['key_hash' => hash('sha256', random_bytes(32)), 'key_prefix' => 'fixture', 'label' => 'Fixture',
        'role' => 'owner', 'scopes' => json_encode(['settings:read', 'settings:write']), 'rate_limit' => 100, 'created_at' => gmdate('c')]);
    $db->insert('agent_rest_owners', ['key_id' => $key, 'user_id' => 1, 'bound_by' => 1, 'bound_at' => time()]);
}
