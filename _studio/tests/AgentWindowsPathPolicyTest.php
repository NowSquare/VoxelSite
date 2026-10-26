<?php
declare(strict_types=1);

// The fixture exercises Windows-only pure policy branches on other hosts.
// Run without the flag on native Windows to verify its actual platform branch.
$fixture = ($argv[1] ?? '') === '--windows-fixture';
if ($fixture) define('VoxelSite\\Agent\\DIRECTORY_SEPARATOR', '\\');
require dirname(__DIR__, 2) . '/vendor/autoload.php';

use VoxelSite\Agent\{OperationException, SitePathPolicy};

$windows = $fixture || DIRECTORY_SEPARATOR === '\\';
$checks = 0;
function checkAgentPath(bool $condition, string $message): void {
    global $checks;
    if (!$condition) throw new RuntimeException($message);
    $checks++;
}

checkAgentPath(SitePathPolicy::type('assets/css/Tailwind.css') === ($windows ? 'derived' : 'css'),
    'Derived stylesheet aliases retain their protected classification');
foreach (['assets/data/Memory.json', 'assets/data/Design-Intelligence.json'] as $path) {
    checkAgentPath(SitePathPolicy::isMergeOnly($path) === $windows, 'Memory aliases retain merge-only classification');
}
foreach (['assets/css/Tailwind.css', 'assets/data/Memory.json', 'assets/data/Design-Intelligence.json'] as $path) {
    $accepted = false;
    try { SitePathPolicy::canonical($path, true); $accepted = true; }
    catch (OperationException $error) { checkAgentPath($error->errorCode === 'invalid_path', 'Alias has a managed-path refusal'); }
    checkAgentPath($accepted === !$windows, 'Ambiguous protected aliases require canonical spelling on Windows');
}
foreach (['Services.php', '_partials/Hero.php', 'assets/images/Portrait.png', 'assets/data/Products.json'] as $path) {
    checkAgentPath(SitePathPolicy::canonical($path, true) === $path, 'Ordinary filename casing is preserved');
}
foreach (['C:/index.php', 'C:\\index.php', '../index.php', 'assets/data/file.json:stream', 'assets//data/site.json'] as $path) {
    try { SitePathPolicy::canonical($path); throw new RuntimeException('Unsafe managed path accepted'); }
    catch (OperationException $error) { checkAgentPath($error->errorCode === 'invalid_path', 'Managed path restrictions remain intact'); }
}
if ($windows) {
    // Real service and authorization, with no operation tables or file writes:
    // protected deletes must stop before any operation can be allocated.
    $db = \VoxelSite\Database::getInstance(':memory:');
    $db->getPdo()->exec("CREATE TABLE users (id INTEGER PRIMARY KEY, role TEXT); INSERT INTO users VALUES (1, 'owner')");
    $root = \VoxelSite\FilesystemPath::realpath(sys_get_temp_dir()) . '/vs-agent-policy-' . bin2hex(random_bytes(6));
    $workspace = new \VoxelSite\SiteWorkspace($db, $root . '/draft', $root . '/published', $root . '/private');
    $service = new \VoxelSite\Agent\StudioAuthoringService($db, $workspace);
    $actor = new \VoxelSite\Agent\OperationActor('user', 1, null, [], 'studio_configured', null);
    foreach (['Index.php', '_partials/Header.php', 'assets/css/Style.css', 'assets/data/Site.json'] as $path) {
        try {
            $service->fileChange($actor, 'delete', ['operation_id' => 'protected_alias_test', 'base_draft_version' => 'draft:0',
                'path' => $path, 'expected_content_sha256' => str_repeat('0', 64)]);
            throw new RuntimeException('Protected core-file alias accepted for deletion');
        } catch (OperationException $error) {
            checkAgentPath($error->errorCode === 'permission_denied', 'Protected core-file aliases are refused before mutation');
        }
    }
    checkAgentPath(!file_exists($root), 'Refused core-file deletion creates no staging or workspace files');
}
echo "Agent path policy: {$checks} checks passed (" . ($windows ? 'Windows' : 'POSIX') . ").\n";
