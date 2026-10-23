<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/engine/bootstrap.php';
use VoxelSite\Agent\{OperationException, SitePathPolicy};
$checks = 0;
function pathCheck(bool $ok, string $label): void {
    global $checks; $checks++;
    if (!$ok) { fwrite(STDERR, "FAIL {$label}\n"); exit(1); }
    echo "PASS {$label}\n";
}
foreach (['index.php','services/repairs.php','_partials/header.php','assets/data/memory.json','assets/js/module.js','assets/images/my-image.png'] as $path) {
    pathCheck(SitePathPolicy::canonical($path, true) === $path, 'Accept ' . $path);
}
foreach (['../config.php','/index.php','index.php/..','assets//css/style.css','assets/css/../data/site.json',
    'assets/data/%2e%2e/config.json','php://filter','_studio/data/config.json','_prompts/system.md',
    'submit.php','MCP.php','LocalValetDriver.php','assets/css/tailwind.css','assets/icons/menu.svg',
    'assets/data/file.php','vendor/install.php','assets/images/exploit.php','index.php.',"index.php\0",
    '_root/robots.txt','assets/images/foo..png'] as $path) {
    try { SitePathPolicy::canonical($path, true); pathCheck(false, 'Reject unsafe path'); }
    catch (OperationException $e) { pathCheck($e->errorCode === 'invalid_path', 'Reject unsafe path'); }
}
$root = sys_get_temp_dir() . '/vs-mcp-path-' . bin2hex(random_bytes(6));
mkdir($root, 0700); mkdir($root . '/_partials');
symlink(sys_get_temp_dir(), $root . '/escape');
try { SitePathPolicy::assertContained($root, 'escape/index.php'); pathCheck(false, 'Reject symlink parent'); }
catch (OperationException) { pathCheck(true, 'Reject symlink parent'); }
symlink('/nonexistent-vs-fixture', $root . '/_partials/header.php');
try { SitePathPolicy::assertContained($root, '_partials/header.php'); pathCheck(false, 'Reject dangling symlink'); }
catch (OperationException) { pathCheck(true, 'Reject dangling symlink'); }
pathCheck(SitePathPolicy::assertContained($root, 'new/page.php') === realpath($root) . '/new/page.php', 'Permit safe future child');
echo "Site paths: {$checks} checks passed\n";
