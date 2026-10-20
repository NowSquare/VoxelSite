<?php

declare(strict_types=1);

/** Isolated release contracts. No installed website, credentials or live database required. */
require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\{Database, FileManager, Migrator, PatchExecutor, PlanBuilder, RegionScoper, SiteGraph, SurfaceDiscovery};

$root = sys_get_temp_dir() . '/voxelsite-orchestration-contract-' . bin2hex(random_bytes(6));
mkdir($root . '/preview/_partials', 0755, true);
mkdir($root . '/preview/services', 0755, true);
mkdir($root . '/assets/css', 0755, true);
putenv('VS_TEST_PREVIEW_DIR=' . $root . '/preview');
putenv('VS_TEST_ASSETS_DIR=' . $root . '/assets');
$db = Database::getInstance($root . '/studio.db');
(new Migrator($db))->run();
$fm = new FileManager($db);
$passed = 0;
$failures = [];
function check(bool $condition, string $label): void {
    global $passed, $failures;
    if ($condition) { $passed++; } else { $failures[] = $label; echo "FAIL: {$label}\n"; }
}
function fixture(string $path, string $bytes): void {
    global $root;
    $base = str_starts_with($path, 'assets/') ? $root : $root . '/preview';
    if (!is_dir(dirname($base . '/' . $path))) { mkdir(dirname($base . '/' . $path), 0755, true); }
    file_put_contents($base . '/' . $path, $bytes);
}
function edit(string $file, string $before, string $after, array $extra = []): array {
    return array_merge(['file' => $file, 'strategy' => 'line-replace', 'anchored' => true,
        'before_snippet' => $before, 'after_snippet' => $after, 'region' => ['start' => 1, 'end' => 20]], $extra);
}
function plan(array $edits, array $scoped): array {
    $builder = (new ReflectionClass(PlanBuilder::class))->newInstanceWithoutConstructor();
    return (new ReflectionMethod(PlanBuilder::class, 'parseResponse'))->invoke($builder,
        json_encode(['edits' => $edits, 'summary' => 'Fixture plan', 'risk_level' => 'low']), $scoped);
}

try {
    fixture('assets/css/style.css', ':root { --color-primary: #123456; }');
    fixture('assets/css/tailwind.css', '/* original bundle */');
    fixture('index.php', '<p class="p-2">Old copy</p>');
    $result = (new PatchExecutor($fm))->execute([
        edit('index.php', 'Old copy', 'New copy'),
        edit('index.php', 'missing', 'new', ['anchored' => false]),
    ]);
    check(!$result['success'] && $fm->readFile('index.php') === '<p class="p-2">Old copy</p>', 'Mixed invalid plan refuses every edit before writing');
    check($fm->readFile('assets/css/tailwind.css') === '/* original bundle */', 'Rejected plan does not compile or mutate CSS');

    $oldHash = hash('sha256', $fm->readFile('index.php'));
    fixture('index.php', '<p class="p-2">Old copy</p><!-- later edit -->');
    $result = (new PatchExecutor($fm))->execute([edit('index.php', 'Old copy', 'New copy', ['source_hash' => $oldHash])]);
    check(!$result['success'] && str_contains($fm->readFile('index.php'), 'Old copy'), 'Full-file change after review refuses still-matching snippet');

    fixture('index.php', '<p>alpha beta</p>');
    $result = (new PatchExecutor($fm))->execute([
        edit('index.php', 'alpha', 'alpha plus'), edit('index.php', 'alpha plus', 'omega'),
    ]);
    check(!$result['success'] && $fm->readFile('index.php') === '<p>alpha beta</p>', 'Cascading edits cannot anchor to another edit output');

    fixture('index.php', "<ul>\n<li>Anchor</li>\n</ul>");
    $insertion = edit('index.php', '<li>Anchor</li>', '<li>Inserted</li>', ['strategy' => 'block-insert']);
    $result = (new PatchExecutor($fm))->execute([$insertion, $insertion]);
    check(!$result['success'] && !str_contains($fm->readFile('index.php'), 'Inserted'), 'Overlapping insertions reject whole plan');
    $newlineInsert = edit('index.php', "<li>Anchor</li>\n", '<li>Inserted</li>', ['strategy' => 'block-insert']);
    $result = (new PatchExecutor($fm))->execute([$newlineInsert]);
    check($result['success'] && $fm->readFile('index.php') === "<ul>\n<li>Anchor</li>\n<li>Inserted</li>\n</ul>", 'Insertion with a newline-ending anchor stays before the following closing tag');
    fixture('assets/css/tailwind.css', '/* original bundle */');

    $original = '<head><title>Original</title></head><p>Old copy</p>';
    fixture('index.php', $original);
    fixture('services/design.php', '<p>Another page</p>');
    $failing = new class($db) extends FileManager {
        public function writeExactFile(string $path, string $content): void {
            if ($path === 'services/design.php' && str_contains($content, 'Changed page')) {
                throw new RuntimeException('Injected write failure');
            }
            parent::writeExactFile($path, $content);
        }
    };
    $result = (new PatchExecutor($failing))->execute([
        edit('index.php', 'Old copy', 'New copy'), edit('services/design.php', 'Another page', 'Changed page'),
    ]);
    check(!$result['success'] && $result['rollback_clean'] && $fm->readFile('index.php') === $original, 'Failure after first file restores exact original bytes');
    check($fm->readFile('assets/css/tailwind.css') === '/* original bundle */', 'Failed apply restores exact CSS bundle');
    check(($result['remaining_changed_files'] ?? null) === [], 'Clean rollback reports no remaining changed files');

    $partialFailure = new class($db) extends FileManager {
        public function writeExactFile(string $path, string $content): void {
            if ($path === 'services/design.php' || ($path === 'index.php' && str_contains($content, 'Old copy'))) {
                throw new RuntimeException('Injected restore failure');
            }
            parent::writeExactFile($path, $content);
        }
    };
    $result = (new PatchExecutor($partialFailure))->execute([
        edit('index.php', 'Old copy', 'New copy'), edit('services/design.php', 'Another page', 'Changed page'),
    ]);
    check(!$result['success'] && !$result['rollback_clean'] && ($result['remaining_changed_files'] ?? []) === ['index.php'], 'Incomplete rollback names the file that remains changed');
    check(str_contains($fm->readFile('index.php'), 'New copy'), 'Injected failed restoration leaves observable changed bytes');

    fixture('index.php', '<p>Old copy</p>');
    fixture('services/design.php', '<p>Another page</p>');
    $duringWrite = new class($db) extends FileManager {
        public function writeExactFile(string $path, string $content): void {
            parent::writeExactFile($path, $content);
            if ($path === 'index.php' && str_contains($content, 'New copy')) {
                parent::writeExactFile('services/design.php', '<p>External change</p>');
            }
        }
    };
    $result = (new PatchExecutor($duringWrite))->execute([
        edit('index.php', 'Old copy', 'New copy'), edit('services/design.php', 'Another page', 'Changed page'),
    ]);
    check(!$result['success'] && $fm->readFile('index.php') === '<p>Old copy</p>', 'Late drift rolls back this transaction first write');
    check($fm->readFile('services/design.php') === '<p>External change</p>', 'Rollback preserves external edit to a target never written by this transaction');

    fixture('index.php', '<?php $page = [\'title\' => \'Home\']; ?><p class="p-2">Old copy</p>');
    $compileFail = new class($db) extends FileManager {
        public function compileTailwind(): array { return ['ok' => false, 'class_count' => 0]; }
    };
    $before = $fm->readFile('index.php');
    $result = (new PatchExecutor($compileFail))->execute([edit('index.php', 'Old copy', 'New copy')]);
    check(!$result['success'] && $fm->readFile('index.php') === $before && $result['rollback_clean'], 'Compilation failure restores file and reports failed transaction');

    $result = (new PatchExecutor($fm))->execute([edit('index.php', 'p-2', 'p-12')]);
    check($result['success'] && str_contains($fm->readFile('assets/css/tailwind.css'), '.p-12'), 'Successful utility change compiles actual Tailwind bundle');
    check($db->scalar("SELECT COUNT(*) FROM pages WHERE file_path='index.php'") === 1, 'Successful apply refreshes filesystem page projection');

    $scoped = (new RegionScoper($fm))->scope([['file' => 'index.php', 'type' => 'page']], ['category' => 'content', 'keywords' => []]);
    check(($scoped[0]['source_hash'] ?? '') === hash('sha256', $fm->readFile('index.php')), 'Scoped context captures hash of complete original source');
    $scoped = [['file' => 'index.php', 'source_hash' => hash('sha256', '<p>Old copy</p>'),
        'regions' => [['start' => 1, 'end' => 1, 'content' => '<p>Old copy</p>']]]];
    $valid = edit('index.php', 'Old copy', 'New copy', ['region' => ['start' => 1, 'end' => 1]]);
    $result = plan([$valid, edit('unseen.php', 'old', 'new')], $scoped);
    check(($result['applicable'] ?? true) === false && count($result['edits']) === 2, 'Planner retains out-of-scope edit and refuses whole plan');
    $result = plan([$valid, edit('index.php', 'missing', 'new')], $scoped);
    check(($result['applicable'] ?? true) === false, 'Planner partially anchored plan cannot be applied');
    $result = plan([$valid], $scoped);
    check(($result['applicable'] ?? false) && ($result['edits'][0]['source_hash'] ?? '') === $scoped[0]['source_hash'], 'Valid planner result carries source hash');
    $scoped[0]['source_content'] = '<p>Old copy</p><aside>Old copy</aside>';
    $result = plan([$valid], $scoped);
    check(($result['applicable'] ?? true) === false, 'Planner refuses a source anchor repeated outside the scoped region');
    $badRegion = $valid; unset($badRegion['region']);
    $result = plan([$badRegion], $scoped);
    check(($result['applicable'] ?? true) === false, 'Missing region bounds are invalid rather than normalized to a valid first line');

    $graph = new SiteGraph();
    $graph->addNode('page:index.php', 'page', 'Home', ['file_path' => 'index.php', 'slug' => 'index']);
    $graph->addNode('page:about.php', 'page', 'About', ['file_path' => 'about.php', 'slug' => 'about']);
    $graph->addNode('page:services/design.php', 'page', 'Design', ['file_path' => 'services/design.php', 'slug' => 'services/design']);
    $graph->addNode('page:work/design.php', 'page', 'Design', ['file_path' => 'work/design.php', 'slug' => 'work/design']);
    $graph->addNode('partial:_partials/header.php', 'partial', 'header', ['file_path' => '_partials/header.php']);
    $graph->addNode('asset:assets/css/style.css', 'asset', 'style.css', ['file_path' => 'assets/css/style.css']);
    $graph->addNode('asset:assets/css/tailwind.css', 'asset', 'tailwind.css', ['file_path' => 'assets/css/tailwind.css']);
    $graph->addNode('token:--color-primary', 'token', '--color-primary', ['sourceFile' => 'assets/css/style.css']);
    $graph->addEdge('page:index.php', 'partial:_partials/header.php', 'includes');
    $graph->addEdge('page:about.php', 'partial:_partials/header.php', 'includes');
    $graph->addEdge('page:about.php', 'token:--color-primary', 'consumes_token');
    $discovery = new SurfaceDiscovery($graph);
    $result = $discovery->discover(['category' => 'style', 'scope' => 'page:about', 'keywords' => ['header']]);
    check(count($result['candidates']) === 1 && $result['candidates'][0]['file'] === 'about.php', 'Page-local request does not broaden to shared header');
    $result = $discovery->discover(['category' => 'style', 'scope' => 'site-wide', 'keywords' => ['primary']]);
    check(!in_array('assets/css/tailwind.css', array_column($result['candidates'], 'file')), 'Generated Tailwind bundle is never an AI edit candidate');
    $result = $discovery->discover(['category' => 'style', 'scope' => 'token:--color-primary']);
    check(array_column($result['candidates'], 'file') === ['assets/css/style.css'], 'Token request targets defining token source rather than rewriting consumers');
    $result = $discovery->discover(['category' => 'content', 'scope' => 'page:missing']);
    check($result['candidates'] === [] && count($result['skipped']) === 1, 'Missing explicit page target never falls back to entire site');
    $result = $discovery->discover(['category' => 'content', 'scope' => 'page:/services/design']);
    check(array_column($result['candidates'], 'file') === ['services/design.php'], 'Nested route selector resolves its filesystem page');
    $result = $discovery->discover(['category' => 'content', 'scope' => 'page:Design']);
    check($result['candidates'] === [] && ($result['clarification_required'] ?? false), 'Ambiguous page labels require choosing an exact route');
} finally {
    putenv('VS_TEST_PREVIEW_DIR'); putenv('VS_TEST_ASSETS_DIR');
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($iterator as $item) { $item->isDir() ? rmdir($item->getPathname()) : unlink($item->getPathname()); }
    rmdir($root);
}
echo 'Passed: ' . $passed . "\nFailed: " . count($failures) . "\n";
exit($failures ? 1 : 0);
