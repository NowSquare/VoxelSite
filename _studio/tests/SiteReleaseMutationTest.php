<?php

declare(strict_types=1);

/** Isolated filesystem/endpoint regressions for the Site release contract. */
require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\NavLinksParser;
use VoxelSite\PageService;
use VoxelSite\SiteGraphIndexer;

$root = sys_get_temp_dir() . '/voxelsite_site_release_' . bin2hex(random_bytes(6));
foreach (['preview/_partials', 'preview/services', 'assets/css', 'snapshots'] as $dir) mkdir($root . '/' . $dir, 0755, true);
putenv('VS_TEST_PREVIEW_DIR=' . $root . '/preview');
putenv('VS_TEST_ASSETS_DIR=' . $root . '/assets');
putenv('VS_TEST_SNAPSHOT_DIR=' . $root . '/snapshots');
putenv('VS_TEST_MUTATION_LOCK=' . $root . '/mutation.lock');
$db = Database::getInstance($root . '/studio.db');
$migration = require dirname(__DIR__) . '/engine/migrations/001_initial_schema.php';
$migration['up']($db);
$db->insert('users', ['id' => 1, 'email' => 'fixture@example.test', 'password_hash' => 'unused', 'name' => 'Fixture', 'role' => 'owner', 'created_at' => now(), 'updated_at' => now()]);
$fm = new FileManager($db);
$failed = 0;
$passed = 0;

function check(bool $condition, string $label): void {
    global $failed, $passed;
    if ($condition) { $passed++; } else { $failed++; echo "FAIL: {$label}\n"; }
}
function fixture(): void {
    global $root, $fm, $db;
    $db->exec('DELETE FROM pages');
    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/preview', FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST) as $entry) {
        if ($entry->isDir()) rmdir($entry->getPathname()); else unlink($entry->getPathname());
    }
    mkdir($root . '/preview/_partials', 0755, true);
    mkdir($root . '/preview/services', 0755, true);
    file_put_contents($root . '/preview/_partials/header.php', '<!DOCTYPE html><html><body><?php include __DIR__ . "/nav.php"; ?><main>');
    file_put_contents($root . '/preview/_partials/footer.php', '</main><footer>Shared footer</footer></body></html>');
    $nav = [ ['href' => '/', 'label' => 'Home', 'home' => true], ['href' => '/about', 'label' => 'About'], ['href' => '/services', 'label' => 'Services', 'children' => [['href' => '/services/team', 'label' => 'Team']]] ];
    file_put_contents($root . '/preview/_partials/nav.php', "<?php\n" . NavLinksParser::serialize($nav) . "\nforeach (\$navLinks as \$link): ?><a href=\"<?= \$link['href'] ?>\"><?= \$link['label'] ?></a><?php endforeach; ?>");
    foreach (['index', 'about', 'services', 'services/team'] as $slug) {
        $prefix = str_contains($slug, '/') ? '/../' : '/';
        $title = $slug === 'about' ? 'About' : ucfirst($slug);
        $links = '<a href="/about">1</a><a href="/about?from=2#part">2</a><a href="/about.php">3</a><a href="/about/">4</a><a href="/about">5</a>';
        $source = '<?php $page = ["title" => "' . $title . '", "slug" => "' . $slug . '"]; include __DIR__ . "' . $prefix . '_partials/header.php"; ?>' . "\n" . '<section class="text-[var(--color-primary)]"><h1>Fixture</h1>' . $links . '</section><?php include __DIR__ . "' . $prefix . '_partials/footer.php"; ?>';
        file_put_contents($root . '/preview/' . $slug . '.php', $source);
    }
    file_put_contents($root . '/assets/css/style.css', ':root { --color-primary: #336699; --color-text: #111; }');
    file_put_contents($root . '/assets/css/tailwind.css', '/* fixture before compilation */');
    $fm->syncPageRegistry();
    $db->exec('PRAGMA wal_checkpoint(TRUNCATE)');
}
function endpoint(string $route, array $body, ?string $failure = null): array {
    global $root;
    $command = [PHP_BINARY, __DIR__ . '/helpers/call-nav-endpoint.php', $root . '/studio.db', $root . '/preview', $root . '/assets', 'POST', $route];
    if ($failure !== null) $command[] = $failure;
    $proc = proc_open($command, [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
    fwrite($pipes[0], json_encode($body)); fclose($pipes[0]);
    $stdout = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $stderr = stream_get_contents($pipes[2]); fclose($pipes[2]);
    $exit = proc_close($proc);
    if ($exit !== 0) throw new RuntimeException("Endpoint failed: {$stderr} {$stdout}");
    $data = json_decode($stdout, true);
    if (!is_array($data)) throw new RuntimeException("Invalid endpoint response: {$stdout} {$stderr}");
    return $data;
}
function rendered(string $relative): array {
    global $root;
    $proc = proc_open([PHP_BINARY, '-d', 'display_errors=1', $root . '/preview/' . $relative], [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes, $root . '/preview');
    fclose($pipes[0]); $out = stream_get_contents($pipes[1]); fclose($pipes[1]); $err = stream_get_contents($pipes[2]); fclose($pipes[2]);
    return [proc_close($proc), $out, $err];
}
function treeState(): array {
    global $root;
    $out = [];
    foreach (['preview', 'assets'] as $base) foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/' . $base, FilesystemIterator::SKIP_DOTS)) as $entry) {
        if (!$entry->isFile()) continue;
        $out[substr($entry->getPathname(), strlen($root) + 1)] = [hash_file('sha256', $entry->getPathname()), fileperms($entry->getPathname()) & 0777];
    }
    ksort($out); return $out;
}

try {
    fixture();
    $g = (new SiteGraphIndexer($db, $fm))->buildGraph();
    check(count($g->getBlastRadius('partial:_partials/header.php')) === 4, 'nested ../ include contributes to header impact (expected 4)');
    check(count($g->getBlastRadius('partial:_partials/nav.php')) === 4, 'transitive nested nav impact includes every page');
    check(($g->getNode('partial:_partials/nav.php')['meta']['isShared'] ?? false) === true, 'transitively shared nav is marked shared');
    check(count($g->getInEdges('route:/about', 'links_to')) === 21, '20 literal route references plus canonical nav reference are indexed');
    $source = '<a href="../about.php?x=1#cta">A</a>';
    $updated = PageService::rewriteHrefSlug($source, 'about', 'company', 'services/team.php');
    check(str_contains($updated, '/company?x=1#cta'), 'relative nested href resolves to the same target as graph');
    check(PageService::rewriteHrefSlug('<a href="about">A</a>', 'about', 'company', 'services/team.php') === '<a href="about">A</a>', 'unrelated relative nested route is preserved');
    $navContent = file_get_contents($root . '/preview/_partials/nav.php');
    $rewrittenNav = PageService::batchRewriteSlugReferences($navContent, ['about' => 'company']);
    check((NavLinksParser::parse($rewrittenNav)[1]['href'] ?? '') === '/company', 'canonical nav URL references are rewritten');

    check(($g->summary()['warnings'] ?? -1) === 0, 'supported fixture produces no unresolved-reference warnings');
    $oldAbout = file_get_contents($root . '/preview/about.php');
    file_put_contents($root . '/preview/about.php', $oldAbout . '<?php /* include __DIR__ . "/_partials/not-executed.php"; */ include $dynamicPartial; ?><a href="<?= $destination ?>">Unknown</a>');
    $warningGraph = (new SiteGraphIndexer($db, $fm))->buildGraph();
    check(($warningGraph->summary()['warnings'] ?? 0) === 2, 'dynamic include and dynamic href produce explicit lower-bound warnings while comments do not');
    file_put_contents($root . '/preview/about.php', $oldAbout);

    $response = endpoint('/site-control/structural-move', ['pageId' => 'page:about.php', 'targetParent' => 'services']);
    check($response['httpCode'] === 200, 'structural move accepts a valid flat page');
    [$status, $html, $stderr] = rendered('services/about.php');
    check($status === 0 && $stderr === '' && str_contains($html, '<footer>Shared footer</footer>') && str_contains($html, '<!DOCTYPE html>'), 'moved page executes and renders shared layout without warnings');
    check((NavLinksParser::findPosition(NavLinksParser::parse(file_get_contents($root . '/preview/_partials/nav.php')), '/services/about')['parentHref'] ?? '') === '/services', 'moved canonical nav entry points to relocated page');

    if (in_array('--baseline', $argv, true)) { echo "Baseline: {$passed} passed, {$failed} failed. Fixture: {$root}\n"; exit($failed ? 1 : 0); }

    fixture();
    file_put_contents($root . '/preview/about.php', '<?php include $dynamicPartial;', FILE_APPEND);
    $before = treeState();
    $r = endpoint('/site-control/structural-move', ['pageId' => 'page:about.php', 'targetParent' => 'services']);
    check($r['httpCode'] === 422 && ($r['response']['error']['code'] ?? '') === 'unsupported_references', 'moving an unresolved include fails closed before mutation');
    check(treeState() === $before, 'unsupported include move restores every original byte');
    $snapCount = (int) $db->scalar('SELECT COUNT(*) FROM snapshots');
    foreach (['/site-control/url-rename' => ['routeId' => 'route:/about', 'newPath' => '/company'], '/site-control/page-delete' => ['pageId' => 'page:about.php']] as $route => $body) {
        $r = endpoint($route, $body);
        check($r['httpCode'] === 422 && ($r['response']['error']['code'] ?? '') === 'unsupported_references' && !empty($r['response']['error']['warnings']), $route . ' refuses unresolved propagation with actionable warnings');
    }
    check(treeState() === $before && (int) $db->scalar('SELECT COUNT(*) FROM snapshots') === $snapCount, 'unresolved reference rejections create no snapshots or file changes');

    $computedLink = <<<'HTML'
<a href="<?= $link['label'] === 'About' ? '/about' : $link['href'] ?>">Computed</a>
HTML;
    foreach (['unquoted' => '<a href=/about>Unquoted</a>', 'canonical expression' => $computedLink, 'non-anchor href' => '<link rel="canonical" href="/about">'] as $case => $markup) {
        fixture();
        $target = $case === 'canonical expression' ? '/preview/_partials/nav.php' : '/preview/index.php';
        file_put_contents($root . $target, $markup, FILE_APPEND);
        $before = treeState(); $snapCount = (int) $db->scalar('SELECT COUNT(*) FROM snapshots');
        $r = endpoint('/site-control/url-rename', ['routeId' => 'route:/about', 'newPath' => '/company']);
        check($r['httpCode'] === 422 && ($r['response']['error']['code'] ?? '') === 'unsupported_references', $case . ' is refused instead of silently leaving a broken URL');
        check(treeState() === $before && (int) $db->scalar('SELECT COUNT(*) FROM snapshots') === $snapCount, $case . ' refusal creates no snapshot or file changes');
    }
    check(PageService::rewriteHrefSlug('<a href="/about" data-href="/about">A</a>', 'about', 'company') === '<a href="/company" data-href="/about">A</a>', 'rewrite changes actual href and preserves data-href');
    check(PageService::rewriteHrefSlug('<a href="/about" x-href="/services">A</a>', 'about', 'company') === '<a href="/company" x-href="/services">A</a>', 'unrelated hyphenated href attribute cannot hide the actual href');

    fixture();
    $r = endpoint('/site-control/structural-move', ['pageId' => 'page:about.php', 'targetParent' => 'services', 'targetIndex' => 0]);
    $links = NavLinksParser::parse(file_get_contents($root . '/preview/_partials/nav.php'));
    check($r['httpCode'] === 200 && ($links[1]['children'][0]['href'] ?? '') === '/services/about', 'parent move and chosen sibling position apply in one request');
    fixture();
    $before = treeState(); $pagesBefore = $db->query('SELECT * FROM pages ORDER BY id');
    $r = endpoint('/site-control/structural-move', ['pageId' => 'page:about.php', 'targetParent' => 'services', 'targetIndex' => 100]);
    check($r['httpCode'] === 500, 'unavailable sibling position reports failure');
    check(treeState() === $before && $db->query('SELECT * FROM pages ORDER BY id') === $pagesBefore, 'failed sibling placement rolls structural move and references back together');

    fixture();
    $before = treeState();
    $beforePages = $db->query('SELECT * FROM pages ORDER BY id');
    $r = endpoint('/site-control/structural-move', ['pageId' => 'page:about.php', 'targetParent' => 'services'], '--fail-move-nav');
    check($r['httpCode'] === 500 && ($r['response']['ok'] ?? true) === false, 'injected failure after reference rewrites is reported');
    check(treeState() === $before, 'failed move restores every file byte and permission exactly');
    check($db->query('SELECT * FROM pages ORDER BY id') === $beforePages, 'failed move restores exact page projection including IDs');

    fixture();
    $r = endpoint('/site-control/url-rename', ['routeId' => 'route:/about', 'newPath' => '/company']);
    check($r['httpCode'] === 200, 'URL rename succeeds');
    check(($r['response']['data']['referenceCount'] ?? 0) === 21, 'URL response counts reference occurrences rather than changed files');
    check((NavLinksParser::parse(file_get_contents($root . '/preview/_partials/nav.php'))[1]['href'] ?? '') === '/company', 'URL rename rewrites canonical nav file truth');
    $g = (new SiteGraphIndexer($db, $fm))->buildGraph();
    check($g->getNode('route:/about') === null && count($g->getInEdges('route:/company', 'links_to')) === 21, 'fresh graph reflects renamed route and all rewritten references');
    check(str_contains(file_get_contents($root . '/assets/css/tailwind.css'), '--color-primary'), 'required Tailwind compilation targets fixture output and tokens');
    [$status, $html, $stderr] = rendered('company.php');
    check($status === 0 && $stderr === '' && !str_contains($html, 'href="/about'), 'renamed page renders without old links');

    fixture();
    $r = endpoint('/site-control/url-rename', ['routeId' => 'route:/services/team', 'newPath' => '/services/people']);
    check($r['httpCode'] === 200 && file_exists($root . '/preview/services/people.php') && !file_exists($root . '/preview/services/team.php'), 'nested URL rename preserves parent path');
    [$status, $html, $stderr] = rendered('services/people.php');
    check($status === 0 && $stderr === '' && str_contains($html, '<footer>Shared footer</footer>'), 'nested renamed page renders with valid includes');
    $before = treeState();
    $r = endpoint('/site-control/url-rename', ['routeId' => 'route:/services/people', 'newPath' => '/people']);
    check($r['httpCode'] === 422 && ($r['response']['error']['code'] ?? '') === 'parent_change' && treeState() === $before, 'Change URL refuses silent flattening; parent changes use Move');

    fixture();
    file_put_contents($root . '/preview/services/team.php', '<a href="../about.php?x=1#cta">Delete target</a><a href="about">Different route</a>', FILE_APPEND);
    $r = endpoint('/site-control/page-delete', ['pageId' => 'page:about.php']);
    check($r['httpCode'] === 200, 'page deletion succeeds');
    $content = file_get_contents($root . '/preview/index.php');
    check(!str_contains($content, '/about'), 'delete neutralizes query/fragment/php/trailing-slash reference variants');
    $nested = file_get_contents($root . '/preview/services/team.php');
    check(!str_contains($nested, '../about') && str_contains($nested, 'href="about"'), 'delete resolves nested relative references and preserves different nested routes');
    check(!file_exists($root . '/preview/about.php') && $db->queryOne("SELECT * FROM pages WHERE slug='about'") === null, 'delete agrees across filesystem and DB');

    fixture();
    chmod($root . '/preview/about.php', 0640);
    $before = treeState(); $pagesBefore = $db->query('SELECT * FROM pages ORDER BY id');
    $r = endpoint('/site-control/page-rename', ['pageId' => 'page:about.php', 'newTitle' => 'New title'], '--fail-rename');
    check($r['httpCode'] === 500, 'injected title rename failure is reported');
    check(treeState() === $before, 'failed rename restores original modes and content');
    check($db->query('SELECT * FROM pages ORDER BY id') === $pagesBefore, 'failed rename restores exact page projection');

    // Invoke recovery directly with an occupied target to force a real failed write.
    $_REQUEST['_route_method'] = 'GET';
    $_REQUEST['_route_path'] = '/site-control/test-helpers';
    $_REQUEST['_user'] = ['id' => 1, 'role' => 'owner'];
    function jsonResponse(mixed $data, int $status = 200): void {}
    require dirname(__DIR__) . '/api/endpoints/site-control.php';
    $linkedPageId = (int)$db->queryOne("SELECT id FROM pages WHERE slug='about'")['id'];
    $collectionId = $db->insert('collections', ['slug'=>'fixture-posts','name'=>'Posts',
        'index_page_id'=>$linkedPageId,'created_at'=>now(),'updated_at'=>now()]);
    $linkedSnapshot = createSiteControlSnapshot($db, 'Collection recovery', 'Foreign key restoration');
    $db->delete('pages', 'id = ?', [$linkedPageId]);
    $linkedRestore = restoreSiteControlSnapshot($db, $linkedSnapshot['snapshot']['id']);
    check($linkedRestore['ok'] && (int)$db->queryOne('SELECT index_page_id FROM collections WHERE id = ?', [$collectionId])['index_page_id'] === $linkedPageId,
        'restoring a deleted page also restores its collection index association');
    $safety = createSiteControlSnapshot($db, 'Recovery probe', 'Failure injection');
    check($safety['ok'] === true, 'recovery probe snapshot created');
    $original = file_get_contents($root . '/preview/about.php');
    mkdir($root . '/preview/new-empty-directory');
    file_put_contents($root . '/preview/about.php', 'changed after snapshot');
    chmod($root . '/preview/about.php', 0444);
    $restored = restoreSiteControlSnapshot($db, $safety['snapshot']['id']);
    check($restored['ok'] === false && str_contains($restored['error'] ?? '', 'write'), 'unwritable restoration target reports failure instead of false recovery success');
    chmod($root . '/preview/about.php', 0640);
    $restored = restoreSiteControlSnapshot($db, $safety['snapshot']['id']);
    check($restored['ok'] === true && file_get_contents($root . '/preview/about.php') === $original && !is_dir($root . '/preview/new-empty-directory'), 'recovery retries restore content and remove new empty directories');

    $indexedPageId = (int) $db->scalar("SELECT id FROM pages WHERE slug='about'");
    $collectionId = $db->insert('collections', ['slug' => 'restore-probe', 'name' => 'Restore probe', 'index_page_id' => $indexedPageId, 'created_at' => now(), 'updated_at' => now()]);
    $associationSafety = createSiteControlSnapshot($db, 'Association recovery', 'Collection foreign key regression');
    $db->delete('pages', 'id = ?', [$indexedPageId]);
    check($db->scalar('SELECT index_page_id FROM collections WHERE id = ?', [$collectionId]) === null, 'deleting page exercises real SQLite ON DELETE SET NULL');
    $restored = restoreSiteControlSnapshot($db, (int) $associationSafety['snapshot']['id']);
    check($restored['ok'] === true && (int) $db->scalar('SELECT index_page_id FROM collections WHERE id = ?', [$collectionId]) === $indexedPageId, 'snapshot recovery restores collection index association together with stable page ID');

    // Sequential requests in one second must retain independent safety archives.
    $snapshots = $db->query('SELECT filename FROM snapshots');
    check(count(array_unique(array_column($snapshots, 'filename'))) === count($snapshots), 'each successful snapshot has a unique archive name');
    $titleSource = '<?php $page = ["title" => "About", "slug" => "about"]; ?>';
    $metadata = PageService::updatePhpMeta($titleSource, 'Cost $1 and "quotes"', 'about');
    file_put_contents($root . '/metadata.php', $metadata . '<?php echo $page["title"];');
    $actualTitle = shell_exec(escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg($root . '/metadata.php'));
    check($actualTitle === 'Cost $1 and "quotes"', 'page metadata replacement preserves dollars and quote characters');
} finally {
    echo "Site release mutations: {$passed} passed, {$failed} failed. Fixture: {$root}\n";
}
exit($failed ? 1 : 0);
