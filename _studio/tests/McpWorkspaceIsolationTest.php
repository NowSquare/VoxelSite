<?php
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/vendor/autoload.php';

use VoxelSite\{Database, FileManager, PreviewAssetRouter, SiteWorkspace, WorkspaceMigration, WorkspaceAccessProbe, WorkspaceActivationService};
require_once dirname(__DIR__) . '/engine/SiteControlSnapshots.php';
if (!function_exists('now')) {
    function now(): string { return gmdate('Y-m-d\TH:i:s\Z'); }
}

$passed = 0; $errors = [];
function check(bool $condition, string $label): void
{
    global $passed, $errors;
    $condition ? $passed++ : $errors[] = $label;
}
function refuses(callable $operation, string $label): void
{
    try { $operation(); check(false, $label); }
    catch (RuntimeException) { check(true, $label); }
}
function removeFixture(string $path): void
{
    if (is_link($path) || is_file($path)) { unlink($path); return; }
    if (!is_dir($path)) { return; }
    foreach (scandir($path) as $name) {
        if ($name !== '.' && $name !== '..') { removeFixture($path . '/' . $name); }
    }
    rmdir($path);
}
function fixture(): array
{
    $root = sys_get_temp_dir() . '/mcp-workspace-' . bin2hex(random_bytes(8));
    foreach (['_studio/preview/_partials', '_studio/data', 'assets/css', 'assets/js', 'assets/data',
        'assets/images', 'assets/forms', 'assets/library', 'assets/icons'] as $path) {
        mkdir($root . '/' . $path, 0700, true);
    }
    file_put_contents($root . '/index.php', '<main>Published</main>');
    file_put_contents($root . '/_studio/preview/index.php', '<main class="p-7">Draft</main>');
    file_put_contents($root . '/assets/css/style.css', ':root { --color-primary: #123456; }');
    file_put_contents($root . '/assets/js/site.js', 'console.log("live");');
    file_put_contents($root . '/assets/data/site.json', '{"title":"Published"}');
    file_put_contents($root . '/assets/images/photo.bin', "\x00\x01image");
    file_put_contents($root . '/assets/forms/contact.json', '{"fields":[]}');
    file_put_contents($root . '/assets/library/example.jpg', 'immutable-image');
    file_put_contents($root . '/assets/icons/example.svg', '<svg/>');
    symlink('../../assets', $root . '/_studio/preview/assets');
    Database::resetInstance();
    $db = Database::getInstance($root . '/_studio/data/test.db');
    $db->exec('CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)');
    $migration = require __DIR__ . '/../engine/migrations/015_private_draft_assets.php';
    ($migration['up'])($db);
    $workspace = new SiteWorkspace($db, $root . '/_studio/preview', $root, $root . '/_studio/data/workspace-migration');
    return [$root, $db, $workspace];
}
check(class_exists(SiteWorkspace::class), 'Canonical workspace resolver exists');
check(class_exists(WorkspaceMigration::class), 'Resumable workspace migration exists');
check(is_file(__DIR__ . '/../engine/migrations/015_private_draft_assets.php'), 'Workspace state migration exists');
check((new ReflectionMethod(FileManager::class, '__construct'))->getNumberOfParameters() >= 2,
    'FileManager must accept an explicit workspace before fixture writes are allowed');
if ($errors !== []) {
    foreach ($errors as $error) { echo "FAIL: {$error}\n"; }
    exit(1);
}

class InterruptingWorkspaceMigration extends WorkspaceMigration
{
    public ?string $failAt = null;
    public ?Closure $during = null;
    protected function checkpoint(string $stage, array $manifest): void
    {
        if ($this->during !== null) { ($this->during)($stage, $manifest); }
        if ($this->failAt === $stage) { throw new RuntimeException('Injected migration interruption'); }
    }
}
class LowDiskWorkspaceMigration extends WorkspaceMigration
{
    protected function availableBytes(string $directory): float { return 0; }
}

$roots = [];
try {
    [$root, $db, $workspace] = fixture(); $roots[] = $root;
    $live = SiteWorkspace::inventory($root . '/assets');
    refuses(fn() => $workspace->resolveDraft('assets/css/style.css', true), 'Legacy draft resolver fails closed');
    $migration = new WorkspaceMigration($workspace, $db);
    $first = $migration->run(1);
    check($first['status'] === 'pending' && $first['copied'] === 1, 'Migration checkpoints after bounded copying');
    check(is_link($root . '/_studio/preview/assets') && $workspace->status()['format'] === 1,
        'Partial copying does not activate private draft');
    check(SiteWorkspace::inventory($root . '/assets') === $live, 'Partial migration leaves all published assets unchanged');
    do { $result = (new WorkspaceMigration($workspace, $db))->run(2); } while ($result['status'] === 'pending');
    check($result['status'] === 'complete' && $workspace->status()['format'] === 2,
        'Fresh migration instance resumes and activates verified draft');
    check(!is_link($workspace->draftAssetsRoot()) && is_dir($workspace->draftAssetsRoot()), 'Known preview/assets symlink becomes a real directory');
    check(str_contains(file_get_contents($workspace->draftRoot() . '/.htaccess'), 'Require all denied'), 'Direct Apache draft access is denied');
    check(!file_exists($workspace->draftAssetsRoot() . '/library') && !file_exists($workspace->draftAssetsRoot() . '/icons'),
        'Immutable shipped library and icons are not duplicated');
    check(file_get_contents($workspace->resolveDraft('assets/library/example.jpg')) === 'immutable-image',
        'Immutable library reads use validated shared source');
    refuses(fn() => $workspace->resolveDraft('assets/icons/example.svg', true), 'Immutable icon replacement is refused');
    refuses(fn() => $workspace->resolveDraft('../index.php', true), 'Parent traversal is refused');
    refuses(fn() => $workspace->resolveDraft('_studio/data/test.db'), 'Studio internals are outside site resolver');
    refuses(fn() => $workspace->resolveDraft('.htaccess', true), 'Generated edits cannot replace draft access protection');
    file_put_contents($workspace->resolveDraft('assets/data/site.json', true), '{"title":"Draft"}');
    check(file_get_contents($workspace->resolvePublished('assets/data/site.json')) === '{"title":"Published"}',
        'Draft JSON changes do not alter public bytes');
    check($migration->run()['status'] === 'complete'
        && file_get_contents($workspace->resolveDraft('assets/data/site.json')) === '{"title":"Draft"}',
        'Repeating completed migration preserves newer draft edits');
    refuses(fn() => $migration->rollback(), 'Rollback refuses to discard a modified draft');
    check(SiteWorkspace::inventory($root . '/assets') === $live, 'Draft changes leave complete published asset map unchanged');
    // Belt-and-suspenders protection: even an accidentally ignored injection can
    // only address this disposable fixture through the legacy path overrides.
    putenv('VS_TEST_PREVIEW_DIR=' . $workspace->draftRoot());
    putenv('VS_TEST_ASSETS_DIR=' . $workspace->draftAssetsRoot());
    $files = new FileManager($db, $workspace);
    $files->writeExactFile('assets/css/style.css', ':root { --color-primary: #abcdef; }');
    $files->writeExactFile('assets/js/site.js', 'console.log("draft");');
    $files->writeExactFile('assets/forms/contact.json', '{"fields":[{"name":"draft"}]}');
    $files->writeFile('about.php', '<main class="p-7"><h1>About</h1></main>');
    $files->ensureShippedNavigation();
    $files->ensureShippedIconResolver();
    $compiled = $files->compileTailwind();
    $files->deleteFile('assets/images/photo.bin');
    check($files->readFile('assets/data/site.json') === '{"title":"Draft"}'
        && str_contains((string) $files->readFile('assets/css/tailwind.css'), '.p-7') && $compiled['ok'],
        'FileManager reads, compiles and writes the same canonical private draft');
    check(SiteWorkspace::inventory($root . '/assets') === $live, 'All FileManager draft writes and derived scripts preserve published bytes');
    refuses(fn() => $files->writeFile('assets/library/example.jpg', 'changed'), 'FileManager refuses writes to immutable shared assets');
    refuses(fn() => $files->writeFile('assets/css/.htaccess', 'Require all granted'), 'Nested access rules cannot bypass draft privacy');
    $privateStyle = $files->readFile('assets/css/style.css');
    rename($workspace->draftAssetsRoot() . '/css', $workspace->draftAssetsRoot() . '/css-real');
    symlink($root . '/assets/css', $workspace->draftAssetsRoot() . '/css');
    refuses(fn() => $files->ensureStyleCssExists(), 'Derived CSS writes refuse symlinked private directories');
    refuses(fn() => $files->compileTailwind(), 'Compiler output resolves through the same no-follow boundary');
    unlink($workspace->draftAssetsRoot() . '/css');
    rename($workspace->draftAssetsRoot() . '/css-real', $workspace->draftAssetsRoot() . '/css');
    check($files->readFile('assets/css/style.css') === $privateStyle, 'Refused derived writes leave private bytes intact');
    $db->exec('CREATE TABLE pages (id INTEGER PRIMARY KEY, nav_parent_id INTEGER)');
    $db->exec('CREATE TABLE collections (id INTEGER PRIMARY KEY, index_page_id INTEGER)');
    $db->exec('CREATE TABLE snapshots (id INTEGER PRIMARY KEY, filename TEXT, snapshot_type TEXT, label TEXT,
        description TEXT, file_count INTEGER, size_bytes INTEGER, created_by INTEGER, created_at TEXT)');
    putenv('VS_TEST_SNAPSHOT_DIR=' . $root . '/_studio/data/snapshots');
    $snapshot = createSiteControlSnapshot($db, 'Private draft', 'Isolation test', null, $workspace);
    check($snapshot['ok'], 'Safety snapshot captures canonical private draft');
    if ($snapshot['ok']) {
        $zip = new ZipArchive();
        $zip->open($root . '/_studio/data/snapshots/' . $snapshot['snapshot']['filename']);
        $state = json_decode($zip->getFromName('site-control-state.json'), true);
        check($state['format'] === 2 && $state['domain'] === 'draft'
            && $zip->getFromName('assets/css/style.css') === $privateStyle
            && $zip->locateName('preview/assets/css/style.css') === false
            && $zip->locateName('preview/.htaccess') === false, 'Archive identifies draft domain and excludes duplicates/access rules');
        $zip->close();
        $files->writeExactFile('assets/css/style.css', 'changed after snapshot');
        $restored = restoreSiteControlSnapshot($db, $snapshot['snapshot']['id'], $workspace);
        check($restored['ok'] && $files->readFile('assets/css/style.css') === $privateStyle,
            'Safety restoration recovers private CSS and retains access protection');
        check(SiteWorkspace::inventory($root . '/assets') === $live, 'Draft snapshot restoration preserves all live asset bytes');
        $zip->open($root . '/_studio/data/snapshots/' . $snapshot['snapshot']['filename']);
        $state['domain'] = 'published';
        $zip->addFromString('site-control-state.json', json_encode($state, JSON_THROW_ON_ERROR));
        $zip->close();
        $files->writeExactFile('assets/css/style.css', 'newer draft must survive');
        $refused = restoreSiteControlSnapshot($db, $snapshot['snapshot']['id'], $workspace);
        check(!$refused['ok'] && $files->readFile('assets/css/style.css') === 'newer draft must survive',
            'Published-domain archives cannot silently replace a newer private draft');
        $files->writeExactFile('assets/css/style.css', $privateStyle);
    }
    $html = PreviewAssetRouter::rewrite('<link href="/assets/css/style.css"><img src="../assets/images/photo.bin" srcset="/assets/images/a.jpg 1x, /assets/images/b.jpg 2x"><a href="../about#team">About</a>',
        'nested/index.php', 'html');
    check(str_contains($html, 'path=assets/css/style.css') && str_contains($html, 'path=assets/images/photo.bin')
        && str_contains($html, 'path=assets/images/b.jpg') && str_contains($html, 'path=about.php#team'),
        'Nested page links, images, styles and srcsets use the authenticated preview route');
    $css = PreviewAssetRouter::rewrite('@import "./theme.css"; a{background:url("../images/a.jpg")}', 'assets/css/style.css', 'css');
    check(str_contains($css, 'path=assets/css/theme.css') && str_contains($css, 'path=assets/images/a.jpg'),
        'CSS relative imports and image URLs stay in the draft');
    $js = PreviewAssetRouter::rewrite('import "./module.js"; fetch("../data/site.json"); fetch("/assets/icons/"+name+".svg");',
        'assets/js/main.js', 'js');
    check(str_contains($js, 'path=assets/js/module.js') && str_contains($js, 'path=assets/data/site.json')
        && str_contains($js, 'path=assets/icons/'), 'JS imports, JSON fetches and icon prefixes stay behind preview authorization');
    check(PreviewAssetRouter::url('https://example.test/photo.jpg') === 'https://example.test/photo.jpg'
        && PreviewAssetRouter::url('#contact') === '#contact', 'Preview routing preserves external URLs and local fragments');
    symlink($root . '/assets/data', $workspace->draftAssetsRoot() . '/escape');
    refuses(fn() => $workspace->resolveDraft('assets/escape/site.json', true), 'Draft resolver refuses symlinked parent escapes');
    unlink($workspace->draftAssetsRoot() . '/escape');
    symlink($root . '/assets/data/site.json', $workspace->draftAssetsRoot() . '/linked.json');
    refuses(fn() => $workspace->resolveDraft('assets/linked.json'), 'Draft reads do not follow symlink files');
    unlink($workspace->draftAssetsRoot() . '/linked.json');

    [$root2, $db2, $workspace2] = fixture(); $roots[] = $root2;
    $live2 = SiteWorkspace::inventory($root2 . '/assets');
    refuses(fn() => (new LowDiskWorkspaceMigration($workspace2, $db2))->run(), 'Insufficient free space fails before replacement');
    check(is_link($workspace2->draftAssetsRoot()) && $workspace2->status()['format'] === 1, 'Low disk preserves legacy layout and format');
    $interrupted = new InterruptingWorkspaceMigration($workspace2, $db2);
    $interrupted->failAt = 'file_copied';
    refuses(fn() => $interrupted->run(), 'Interrupted copy is reported');
    check(SiteWorkspace::inventory($root2 . '/assets') === $live2, 'Interrupted copy preserves every live file');
    file_put_contents($root2 . '/assets/js/site.js', 'changed outside the mutation lock');
    refuses(fn() => (new WorkspaceMigration($workspace2, $db2))->run(), 'Stale migration source hashes refuse activation');
    check(is_link($workspace2->draftAssetsRoot()) && $workspace2->status()['format'] === 1, 'Stale migration remains inactive');
    (new WorkspaceMigration($workspace2, $db2))->rollback();
    check(is_link($workspace2->draftAssetsRoot()), 'Rollback of a stale copy preserves original link');
    check((new WorkspaceMigration($workspace2, $db2))->run()['status'] === 'complete', 'Fresh migration after rollback uses current source bytes');

    [$root3, $db3, $workspace3] = fixture(); $roots[] = $root3;
    $live3 = SiteWorkspace::inventory($root3 . '/assets');
    $broken = new InterruptingWorkspaceMigration($workspace3, $db3);
    $broken->during = static function (string $stage) use ($workspace3): void {
        if ($stage === 'activated') { file_put_contents($workspace3->draftAssetsRoot() . '/css/style.css', 'corrupt'); }
    };
    refuses(fn() => $broken->run(), 'Post-copy verification rejects corrupt activated bytes');
    check(is_link($workspace3->draftAssetsRoot()) && $workspace3->status()['format'] === 1,
        'Failed activation restores legacy link and keeps format unchanged');
    check(SiteWorkspace::inventory($root3 . '/assets') === $live3, 'Failed activation never modifies live data');
    (new WorkspaceMigration($workspace3, $db3))->rollback();
    (new WorkspaceMigration($workspace3, $db3))->run();
    (new WorkspaceMigration($workspace3, $db3))->rollback();
    check(is_link($workspace3->draftAssetsRoot()) && $workspace3->status()['format'] === 1,
        'Unedited successful migration can be rolled back without publishing');

    [$root4, $db4, $workspace4] = fixture(); $roots[] = $root4;
    unlink($workspace4->draftAssetsRoot());
    symlink($root, $workspace4->draftAssetsRoot());
    refuses(fn() => (new WorkspaceMigration($workspace4, $db4))->run(), 'Unknown legacy symlink target is refused');
    unlink($workspace4->draftAssetsRoot());
    symlink('../../assets', $workspace4->draftAssetsRoot());
    symlink($root . '/assets/data/site.json', $root4 . '/assets/data/unsafe.json');
    refuses(fn() => (new WorkspaceMigration($workspace4, $db4))->run(), 'Source symlink is refused without following it');
    unlink($root4 . '/assets/data/unsafe.json');
    file_put_contents($workspace4->draftRoot() . '/custom.php', '<?php echo file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/assets/data/site.json");');
    $preflight = $workspace4->preflight();
    check(!$preflight['ok'] && ($preflight['issues'][0]['code'] ?? '') === 'hardcoded_published_read',
        'Custom PHP document-root reads receive an actionable migration diagnostic');
    refuses(fn() => (new WorkspaceMigration($workspace4, $db4))->run(), 'Unmigrated hardcoded public PHP reads block isolation claim');
    unlink($workspace4->draftRoot() . '/custom.php');
    $db4->update('site_workspace_state', ['reservation_operation_id' => 'other-operation'], 'id = ?', [1]);
    refuses(fn() => (new WorkspaceMigration($workspace4, $db4))->run(), 'An existing workspace reservation blocks migration');

    [$root5, $db5, $workspace5] = fixture(); $roots[] = $root5;
    $live5 = SiteWorkspace::inventory($root5 . '/assets');
    $calls = [];
    $exposePrivate = true;
    $wrongInstall = false;
    $transport = static function (string $url, string $address, int $port) use ($db5, $workspace5, &$calls, &$exposePrivate, &$wrongInstall): array {
        $calls[] = $url;
        check($address === '127.0.0.1' && $port === 443 && str_starts_with($url, 'https://configured.example.test/subsite/'),
            'Privacy probe uses configured canonical base and pinned server address');
        $query = []; parse_str(parse_url($url, PHP_URL_QUERY) ?: '', $query);
        if (isset($query['nonce'])) {
            return ['status' => $wrongInstall ? 404 : 200,
                'body' => $wrongInstall ? '' : WorkspaceAccessProbe::control($db5, $query['nonce'])];
        }
        $relative = explode('/_studio/preview/', parse_url($url, PHP_URL_PATH), 2)[1];
        $target = $workspace5->draftRoot() . '/' . $relative;
        check((fileperms($target) & 0777) === 0644 && (fileperms(dirname($target)) & 0777) === 0755,
            'Canary permissions cannot falsely satisfy privacy verification');
        return ['status' => $exposePrivate ? 200 : 403, 'body' => 'fixture response'];
    };
    $service = new WorkspaceActivationService($workspace5, $db5, new WorkspaceAccessProbe($workspace5, $db5, $transport));
    $server = ['SERVER_ADDR' => '127.0.0.1', 'SERVER_PORT' => '443', 'HTTP_HOST' => 'untrusted.example.test'];
    refuses(fn() => $service->continue('https://configured.example.test/subsite', $server),
        'Reachable private PHP blocks production workspace activation');
    check($workspace5->status()['format'] === 1 && is_link($workspace5->draftAssetsRoot())
        && glob($workspace5->draftRoot() . '/workspace-check-*') === [],
        'Failed privacy verification retains legacy assets and removes canaries');
    $exposePrivate = false; $wrongInstall = true;
    refuses(fn() => $service->continue('https://configured.example.test/subsite', $server),
        'Unrelated same-server 404 responses cannot qualify another installation');
    $wrongInstall = false;
    $result = $service->continue('https://configured.example.test/subsite', $server, 1);
    $probeCount = count($calls);
    while ($result['status'] === 'pending') $result = $service->continue('https://configured.example.test/subsite', $server, 1);
    check($result['status'] === 'complete' && count($calls) === $probeCount,
        'Verified access allows bounded migration continuation without repeated network work');
    check(SiteWorkspace::inventory($root5 . '/assets') === $live5, 'Privacy checks and activation preserve every public asset');
    $service->rollback();
    check(is_link($workspace5->draftAssetsRoot()) && !file_exists($workspace5->draftRoot() . '/.htaccess')
        && $workspace5->status()['format'] === 1, 'Owner rollback restores prior layout and original access configuration');
    refuses(fn() => $service->continue('https://user:password@configured.example.test', $server),
        'Privacy qualification rejects URL credentials');
    refuses(fn() => $service->continue('https://configured.example.test', ['HTTP_HOST' => 'configured.example.test']),
        'Missing server address cannot fall back to forwarded or Host headers');
} finally {
    putenv('VS_TEST_PREVIEW_DIR');
    putenv('VS_TEST_ASSETS_DIR');
    putenv('VS_TEST_SNAPSHOT_DIR');
    Database::resetInstance();
    foreach ($roots as $root) { removeFixture($root); }
}
foreach ($errors as $error) { echo "FAIL: {$error}\n"; }
echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
exit($errors === [] ? 0 : 1);
