<?php

declare(strict_types=1);

/** Token impact follows the actual PHP TailwindCompiler, in an isolated site. */
require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\SiteGraphIndexer;

$root = sys_get_temp_dir() . '/voxelsite_token_graph_' . bin2hex(random_bytes(6));
foreach (['preview/_partials', 'preview/services', 'assets/css'] as $dir) mkdir($root . '/' . $dir, 0755, true);
putenv('VS_TEST_PREVIEW_DIR=' . $root . '/preview');
putenv('VS_TEST_ASSETS_DIR=' . $root . '/assets');
putenv('VS_TEST_MUTATION_LOCK=' . $root . '/mutation.lock');
$db = Database::getInstance($root . '/studio.db');
$migration = require dirname(__DIR__) . '/engine/migrations/001_initial_schema.php';
$migration['up']($db);
$files = new FileManager($db);
$passed = 0;
$failed = 0;
$check = function (bool $condition, string $label) use (&$passed, &$failed): void {
    if ($condition) { $passed++; } else { $failed++; echo "FAIL: {$label}\n"; }
};
$ids = function (array $nodes): array {
    $ids = array_column($nodes, 'id');
    sort($ids);
    return $ids;
};

try {
    file_put_contents($root . '/assets/css/style.css', ':root { --color-primary: #336699; --color-accent: #bb8844; --font-body: Inter, sans-serif; --color-legacy: #117755; --color-unused: #aa0000; }');
    file_put_contents($root . '/preview/_partials/header.php', '<!doctype html><html><body><?php include __DIR__ . "/nav.php"; ?><main>');
    file_put_contents($root . '/preview/_partials/nav.php', '<nav class="hover:bg-accent/50 font-body font-body"><a href="/about">About</a></nav>');
    file_put_contents($root . '/preview/index.php', '<?php $page = ["title" => "Home", "slug" => "index"]; include __DIR__ . "/_partials/header.php"; ?><h1 class="text-primary text-primary hover:bg-primary/50 font-body">Home</h1></main></body></html>');
    file_put_contents($root . '/preview/about.php', '<?php $page = ["title" => "About", "slug" => "about"]; /* class="bg-unused" */ include __DIR__ . "/_partials/header.php"; ?><h1 class="font-bold">About</h1></main></body></html>');
    file_put_contents($root . '/preview/services/team.php', '<?php $page = ["title" => "Team", "slug" => "services/team"]; include dirname(__DIR__) . "/_partials/header.php"; ?><h1 style="color:var(--color-legacy)">Team</h1></main></body></html>');

    require_once __DIR__ . '/helpers/LegacyWorkspaceFixture.php';
    activateLegacyTestWorkspace($db);
    $compile = $files->compileTailwind();
    $compiledCss = file_get_contents($root . '/preview/assets/css/tailwind.css');
    $check($compile['ok'] && str_contains($compiledCss, 'var(--color-primary)'), 'real compiler resolves text-primary and hover:bg-primary/50 to the site color token');
    $check(str_contains($compiledCss, 'var(--font-body)'), 'real compiler resolves font-body to the font token');
    $check(str_contains($compiledCss, 'var(--color-accent)'), 'real compiler resolves shared hover opacity utility');

    $beforeCssHash = hash_file('sha256', $root . '/preview/assets/css/tailwind.css');
    $graph = (new SiteGraphIndexer($db, $files))->buildGraph();
    $check($ids($graph->getTokenConsumers('token:--color-primary')) === ['page:index.php'], 'primary token consumer includes utility-only page exactly once');
    $check(count($graph->getInEdges('token:--color-primary', 'consumes_token')) === 1, 'repeated text and hover classes create one token edge per file');
    $check($ids($graph->getTokenConsumers('token:--color-accent')) === ['partial:_partials/nav.php'], 'shared partial opacity utility is a token consumer');
    $check($ids($graph->getTokenConsumers('token:--font-body')) === ['page:index.php', 'partial:_partials/nav.php'], 'font utility consumers include pages and partials once each');
    $check(count($graph->getBlastRadius('token:--font-body')) === 3, 'font token impact deduplicates direct and transitive consumers');
    $check(count($graph->getBlastRadius('token:--color-accent')) === 3, 'token in nested shared partial reaches flat and nested pages');
    $check($ids($graph->getTokenConsumers('token:--color-legacy')) === ['page:services/team.php'], 'literal var token consumer remains indexed');
    $check(count($graph->getTokenConsumers('token:--color-unused')) === 0, 'PHP comments do not invent utility token consumers');
    $check(hash_file('sha256', $root . '/preview/assets/css/tailwind.css') === $beforeCssHash, 'graph indexing does not write or recompile the site bundle');
} finally {
    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST) as $entry) {
        if ($entry->isDir()) rmdir($entry->getPathname()); else unlink($entry->getPathname());
    }
    rmdir($root);
}

echo "{$passed} passed, {$failed} failed\n";
exit($failed ? 1 : 0);
