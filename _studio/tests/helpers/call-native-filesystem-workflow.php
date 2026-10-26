<?php
declare(strict_types=1);

use VoxelSite\{Database, ExportService, FileManager, Migrator, ResponseParser, Settings, SiteWorkspace, WorkspaceMigration};
use VoxelSite\Agent\{ActorPolicy, DownloadGrantStore, OperationActor, OperationStore, ProviderCallPolicy, PublishPlanService, ReleaseStore};

$nativeRoot = realpath($argv[1] ?? '');
$temporary = realpath(sys_get_temp_dir());
$root = $nativeRoot === false ? '' : str_replace('\\', '/', $nativeRoot);
$temp = $temporary === false ? '' : str_replace('\\', '/', $temporary);
if ($root === '' || $temp === '' || !str_starts_with($root, $temp . '/vs-native-workflow-')
    || !is_file($root . '/.native-workflow-fixture') || is_link($argv[1])) {
    throw new RuntimeException('A disposable native workflow fixture is required.');
}
foreach (['VS_TEST_PREVIEW_DIR' => $root . '/_studio/preview', 'VS_TEST_DOC_ROOT' => $root,
    'VS_TEST_ASSETS_DIR' => $root . '/assets', 'VS_TEST_WORKSPACE_STATE_DIR' => $root . '/_studio/data/workspace',
    'VS_TEST_MUTATION_LOCK' => $root . '/_studio/data/site.lock', 'VS_TEST_REVISIONS_DIR' => $root . '/_studio/data/revisions',
    'VS_TEST_SNAPSHOT_DIR' => $root . '/_studio/data/snapshots'] as $name => $value) putenv($name . '=' . $value);
require $root . '/_studio/engine/bootstrap.php';
$loaded = str_replace('\\', '/', (new ReflectionClass(Database::class))->getFileName());
if (!str_starts_with($loaded, $root . '/')) throw new RuntimeException('Production classes escaped the copied runtime.');
foreach (['logDir' => $root . '/_studio/data/logs', 'initialized' => true] as $name => $value) {
    (new ReflectionProperty(VoxelSite\Logger::class, $name))->setValue(null, $value);
}

if (($argv[2] ?? '') === 'install') {
    final class NativeInstallInput
    {
        public mixed $context;
        private int $offset = 0;
        private string $body;
        public function stream_open($path, $mode, $options, &$openedPath): bool
        {
            if ($path !== 'php://input') return false;
            $this->body = json_encode(['ai_setup_mode' => 'external', 'admin_name' => 'Native fixture',
                'admin_email' => 'native@example.invalid', 'admin_password' => 'fixture-password-123',
                'site_name' => 'Native filesystem fixture'], JSON_THROW_ON_ERROR);
            return true;
        }
        public function stream_read($count): string { $part = substr($this->body, $this->offset, $count); $this->offset += strlen($part); return $part; }
        public function stream_eof(): bool { return $this->offset >= strlen($this->body); }
        public function stream_stat(): array { return []; }
    }
    $_SERVER = ['REQUEST_METHOD' => 'POST', 'SCRIPT_NAME' => '/subdirectory/_studio/api/router.php',
        'REQUEST_URI' => '/subdirectory/_studio/api/router.php', 'REMOTE_ADDR' => '127.0.0.1'];
    $_REQUEST = ['_route_method' => 'POST', '_route_path' => '/install/complete'];
    stream_wrapper_unregister('php');
    stream_wrapper_register('php', NativeInstallInput::class);
    register_shutdown_function(static function (): void { stream_wrapper_restore('php'); });
    ProviderCallPolicy::runExternal(static function () use ($root): void { require $root . '/_studio/api/endpoints/install.php'; });
    exit;
}

function nativeCheck(bool $ok, string $label, mixed $details = null): void
{
    if (!$ok) throw new RuntimeException('FAIL ' . $label . ($details === null ? '' : ': ' . json_encode($details)));
    echo 'PASS ' . $label . PHP_EOL;
}

// Exercise production route adapters without emitting their response into test output.
function jsonResponse(mixed $data, int $status = 200): void
{
    $GLOBALS['native_route_response'] = ['status' => $status, 'body' => $data];
}

ProviderCallPolicy::runExternal(static function () use ($root, $nativeRoot): void {
    $db = Database::getInstance();
    $settings = new Settings($db);
    nativeCheck(isInstalled() && $db->count('users') === 1 && $settings->get('ai_provider') === '', 'Installed state has one owner and no configured provider');
    nativeCheck((new Migrator($db, $settings))->run()['applied'] === [], 'Schema migration replay is idempotent');
    // Pass actual host paths, including native backslashes on Windows, into production.
    $workspace = new SiteWorkspace($db, $nativeRoot . DIRECTORY_SEPARATOR . '_studio' . DIRECTORY_SEPARATOR . 'preview',
        $nativeRoot, $nativeRoot . DIRECTORY_SEPARATOR . '_studio' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'workspace',
        $nativeRoot . DIRECTORY_SEPARATOR . 'assets');
    $migration = new WorkspaceMigration($workspace, $db);
    for ($step = 0; $step < 20; $step++) {
        $state = $migration->run(1);
        if ($state['status'] === 'complete') break;
    }
    nativeCheck($state['status'] === 'complete' && $workspace->status()['ready'] && $step > 0, 'Real private workspace migration completes with bounded checkpoints', $state);
    nativeCheck(file_get_contents($workspace->resolveDraft('assets/data/migration.json')) === '{"source":"published"}', 'Migration copied existing published asset bytes into the draft');
    nativeCheck(!str_contains($workspace->draftRoot(), '\\') && !str_contains($workspace->draftAssetsRoot(), '\\'), 'Workspace exposes canonical forward slash roots on the native host');
    $files = new FileManager($db, $workspace);
    $response = <<<'RESPONSE'
<file path="_partials/header.php" action="write">
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Native fixture</title><link href="/assets/css/style.css" rel="stylesheet"><link href="/assets/css/tailwind.css" rel="stylesheet"></head><body><main>
</file>
<file path="_partials/footer.php" action="write">
</main><footer>Native fixture</footer></body></html>
</file>
<file path="index.php" action="write">
<?php $page = ['title' => 'Native home', 'slug' => 'index']; include __DIR__ . '/_partials/header.php'; ?>
<h1 class="text-4xl font-bold">Native filesystem</h1><a href="/work/detail">Read more</a><img src="/assets/images/fixture.svg" alt="Fixture">
<?php include __DIR__ . '/_partials/footer.php'; ?>
</file>
<file path="assets/css/style.css" action="write">
:root { --color-primary: #123456; }
</file>
<file path="assets/data/site.json" action="write">
{"name":"Native fixture","description":"Disposable filesystem regression site"}
</file>
<message>Created a deterministic fixture.</message>
RESPONSE;
    $parsed = (new ResponseParser())->parse($response);
    nativeCheck(count($parsed['operations']) === 5 && $parsed['warnings'] === [], 'Real response parser accepts deterministic generated files', $parsed['warnings']);
    $applied = $files->executeOperations($parsed['operations']);
    nativeCheck($applied['errors'] === [] && count($applied['written']) === 5, 'Real FileManager applies generated pages, partials, stylesheet and data', $applied['errors']);
    $nested = '<?php $page=["title"=>"Nested original","slug"=>"work/detail"]; include __DIR__."/../_partials/header.php"; ?><h1 class="text-2xl">Nested original</h1><?php include __DIR__."/../_partials/footer.php"; ?>';
    $files->writeExactFile('work/detail.php', $nested);
    $files->writeExactFile('assets/images/fixture.svg', '<svg xmlns="http://www.w3.org/2000/svg"><title>Native fixture</title></svg>');
    $files->syncPageRegistry(true);
    nativeCheck(in_array('index.php', array_column($files->listPreviewFiles(), 'path'), true)
        && in_array('work/detail.php', array_column($files->listPreviewFilesRecursive(), 'path'), true), 'Root and recursive page lists find actual files');
    nativeCheck(in_array('work/detail.php', array_column($db->query('SELECT file_path FROM pages'), 'file_path'), true), 'Nested page registry records a portable relative path');
    foreach (['' => 'index.php', 'work' => 'work/detail.php'] as $directory => $expectedPage) {
        $_REQUEST = ['_route_method' => 'GET', '_route_path' => '/pages', '_route_params' => [], '_user' => ['id' => 1]];
        $_GET = ['dir' => $directory];
        $GLOBALS['native_route_response'] = null;
        require $root . '/_studio/api/endpoints/pages.php';
        $response = $GLOBALS['native_route_response'];
        nativeCheck(($response['status'] ?? null) === 200 && ($response['body']['ok'] ?? false)
            && in_array($expectedPage, array_column($response['body']['data']['pages'] ?? [], 'path'), true),
            'Actual Pages GET route constructs StudioAuthoringService and lists ' . $expectedPage, $response);
    }
    $_GET = [];
    $edited = str_replace('Nested original', 'Nested edited', $nested);
    $files->writeExactFile('work/detail.php', $edited);
    $files->writeExactFile('assets/data/migration.json', '{"source":"draft"}');
    nativeCheck(file_get_contents($root . '/assets/data/migration.json') === '{"source":"published"}', 'Editing a migrated asset preserves the published bytes');
    nativeCheck($files->readFile('work/detail.php') === $edited && !file_exists($root . '/work/detail.php'), 'Nested edit changes only private draft bytes');
    nativeCheck($files->compileTailwind()['ok'], 'PHP Tailwind compilation writes the native draft stylesheet');
    nativeCheck(in_array('work/detail.php', VoxelSite\PreviewRenderer::collectManagedPreviewFiles($nativeRoot . DIRECTORY_SEPARATOR . '_studio' . DIRECTORY_SEPARATOR . 'preview'), true),
        'Preview inventory accepts native root separators and preserves nested relative names');
    nativeCheck(isset(VoxelSite\PreviewRenderer::collectCurrentAssetHashes($workspace->draftAssetsRoot())['assets/css/tailwind.css']),
        'Preview asset hashes use portable relative names');
    $instrumented = VoxelSite\PreviewRenderer::createInstrumentedPreviewCopy($workspace->draftRoot(), 'work/detail.php');
    nativeCheck(is_string($instrumented) && is_file($instrumented . '/work/detail.php'), 'Instrumented preview creates a native temporary copy');
    VoxelSite\PreviewRenderer::cleanupTempPreviewDir($instrumented);
    nativeCheck(!is_dir($instrumented), 'Instrumented preview cleanup recognizes its native temporary root');
    nativeCheck($files->readFile('assets/data/migration.json') === '{"source":"draft"}',
        'Instrumented preview cleanup preserves the original asset directory');
    $linkTarget = $root . '/cleanup-link-target';
    $linkContainer = $root . '/cleanup-link-container';
    mkdir($linkTarget, 0700);
    mkdir($linkContainer, 0700);
    file_put_contents($linkTarget . '/preserve.txt', 'Original target bytes');
    if (@symlink($linkTarget, $linkContainer . '/directory-link')) {
        $fileLinkCreated = @symlink($linkTarget . '/preserve.txt', $linkContainer . '/file-link');
        VoxelSite\PreviewRenderer::recursiveDeleteDir($linkContainer);
        clearstatcache();
        nativeCheck(!is_dir($linkContainer) && file_get_contents($linkTarget . '/preserve.txt') === 'Original target bytes',
            'Preview cleanup removes directory links without traversing targets');
        nativeCheck($fileLinkCreated, 'Preview cleanup also removed a native file symlink');
        nativeCheck(symlink($linkTarget, $linkContainer), 'Native cleanup root-link fixture is available');
        VoxelSite\PreviewRenderer::recursiveDeleteDir($linkContainer);
        clearstatcache();
        nativeCheck(!is_link($linkContainer) && file_get_contents($linkTarget . '/preserve.txt') === 'Original target bytes',
            'Preview cleanup refuses to traverse a symlink passed as its root');
    } else {
        rmdir($linkContainer);
        echo "SKIP explicit native symlink cleanup checks: this host does not permit symlink creation\n";
    }
    $uploads = $root . '/_data/uploads/actions';
    mkdir($uploads . '/contact', 0700, true);
    file_put_contents($uploads . '/contact/fixture.txt', 'Attachment bytes');
    $actions = new VoxelSite\ActionManager(uploadsDir: $uploads);
    nativeCheck($actions->getUploadAbsolutePath('_data/uploads/actions/contact/fixture.txt') === $uploads . '/contact/fixture.txt',
        'Action attachments resolve within their native upload directory');
    nativeCheck($actions->getUploadAbsolutePath('_data/uploads/actions/../../outside.txt') === null,
        'Action attachments reject traversal');
    $gitEnvironment = (new ReflectionMethod(VoxelSite\GitUpdater::class, 'env'))->invoke(new VoxelSite\GitUpdater($root));
    $hostPaths = array_filter(getenv(), static fn($key) => strcasecmp($key, 'PATH') === 0, ARRAY_FILTER_USE_KEY);
    $gitPaths = array_filter($gitEnvironment, static fn($key) => strcasecmp($key, 'PATH') === 0, ARRAY_FILTER_USE_KEY);
    nativeCheck($hostPaths === [] || $gitPaths === $hostPaths, 'Git updater preserves the host PATH or Windows Path environment');
    foreach (['../escape.php', 'C:/escape.php', '//server/share/escape.php', '_studio/data/config.json'] as $path) {
        $rejected = false;
        try { $files->writeExactFile($path, 'must not escape'); } catch (RuntimeException) { $rejected = true; }
        nativeCheck($rejected, 'File writes reject unsafe relative input: ' . $path);
    }
    if (PHP_OS_FAMILY === 'Windows') {
        foreach (['CON.php', 'nul.php', 'AUX/page.php', 'work/COM1.php', 'work/LPT9.php', 'work/COM¹.php',
            'work/trailing./page.php', 'work/trailing /page.php', 'assets/files/data.txt:stream', 'work/wild*.php'] as $path) {
            $before = SiteWorkspace::inventory($workspace->draftRoot());
            $rejected = false;
            try { $files->writeExactFile($path, 'Windows protected name'); } catch (RuntimeException) { $rejected = true; }
            nativeCheck($rejected && SiteWorkspace::inventory($workspace->draftRoot()) === $before,
                'Native Windows rejects protected names without changing files: ' . $path);
        }
    }
    require_once $root . '/_studio/engine/SiteControlSnapshots.php';
    $_REQUEST = ['_route_method' => 'GET', '_route_path' => '/native-fixture-unused'];
    require $root . '/_studio/api/endpoints/publish.php';
    foreach (['legacy' => [VoxelSite\LegacySnapshotService::class, 'addDirectoryToZip'],
        'safety' => 'scZipAddDir', 'publish' => 'addDirToZip'] as $kind => $addDirectory) {
        $zip = new ZipArchive();
        $archive = $root . '/_studio/data/' . $kind . '-native.zip';
        nativeCheck($zip->open($archive, ZipArchive::CREATE | ZipArchive::EXCL) === true, $kind . ' ZIP opens for capture');
        $addDirectory($zip, $workspace->draftRoot(), 'preview');
        $zip->close();
        $zip->open($archive);
        nativeCheck($zip->getFromName('preview/work/detail.php') === $edited, $kind . ' ZIP capture preserves nested relative paths');
        $zip->close();
    }
    $snapshot = createSiteControlSnapshot($db, 'Native fixture', 'Native filesystem snapshot', 1, $workspace);
    nativeCheck($snapshot['ok'], 'Snapshot captures draft bytes in a verified ZIP');
    $files->writeExactFile('work/detail.php', 'Changed after snapshot');
    $files->writeExactFile('work/new.php', '<h1>Created after snapshot</h1>');
    $files->writeExactFile('assets/data/migration.json', '{"source":"after-snapshot"}');
    $restored = restoreSiteControlSnapshot($db, (int) $snapshot['snapshot']['id'], $workspace);
    nativeCheck($restored['ok'] && $files->readFile('work/detail.php') === $edited
        && !file_exists($workspace->draftRoot() . '/work/new.php')
        && $files->readFile('assets/data/migration.json') === '{"source":"draft"}', 'Snapshot restore replaces nested pages and assets and removes later files', $restored);
    $legacy = VoxelSite\LegacySnapshotService::createSnapshot($db, $root . '/_studio/data/snapshots',
        $workspace->draftRoot(), $workspace->draftAssetsRoot(), 'manual', 'Native legacy fixture');
    nativeCheck($legacy['ok'], 'Legacy snapshot accepts canonical native draft roots');
    $files->writeExactFile('work/detail.php', 'Changed after legacy snapshot');
    $legacyRestore = VoxelSite\LegacySnapshotService::restoreSnapshot($root . '/_studio/data/snapshots/' . $legacy['snapshot']['filename'],
        $workspace->draftRoot(), $workspace->draftAssetsRoot());
    nativeCheck($legacyRestore['ok'] && $files->readFile('work/detail.php') === $edited,
        'Legacy snapshot restores nested files through native boundary checks', $legacyRestore);
    $settings->set('site_url', 'https://fixture.invalid');
    $policy = new ActorPolicy($db);
    $actor = new OperationActor('user', 1, null, [], 'studio_configured', null);
    $uploads = new VoxelSite\Agent\AssetTransferService($db, $policy, $workspace,
        $nativeRoot . DIRECTORY_SEPARATOR . '_studio' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'native-uploads');
    $uploadBytes = "Native filesystem upload.\n";
    $uploadPath = 'assets/files/native-upload.txt';
    $upload = $uploads->begin($actor, (object) ['request_id' => 'native-upload-begin', 'path' => $uploadPath,
        'bytes' => strlen($uploadBytes), 'sha256' => hash('sha256', $uploadBytes), 'mime_type' => 'text/plain']);
    $chunk = $uploads->chunk($actor, (object) ['request_id' => 'native-upload-chunk', 'upload_id' => $upload['upload_id'],
        'offset' => 0, 'data_base64' => base64_encode($uploadBytes), 'sha256' => hash('sha256', $uploadBytes)]);
    $finalized = $uploads->finish($actor, (object) ['request_id' => 'native-upload-finish', 'upload_id' => $upload['upload_id']]);
    nativeCheck($chunk['next_offset'] === strlen($uploadBytes) && $finalized['sha256'] === hash('sha256', $uploadBytes)
        && $uploads->finalizedBytes($actor, $upload['upload_id'], $uploadPath) === $uploadBytes,
        'Native AssetTransferService stages, verifies and reads finalized upload bytes');
    nativeCheck(!file_exists($workspace->draftRoot() . '/' . $uploadPath) && !file_exists($root . '/' . $uploadPath),
        'Finalized upload remains private staging until attached');
    $releases = new ReleaseStore($db, $policy, $root . '/_studio/data/agent/releases');
    $snapshots = new VoxelSite\SnapshotService($db, $policy, $workspace, $releases,
        new OperationStore($db, $policy, $workspace->mutationLockPath()),
        $nativeRoot . DIRECTORY_SEPARATOR . '_studio' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'agent' . DIRECTORY_SEPARATOR . 'snapshots',
        $root . '/_studio/data/snapshots', $root . '/_studio/data/actions', 2);
    $capture = $snapshots->create($actor, (object) ['operation_id' => 'native-retained-snapshot', 'domain' => 'draft', 'label' => 'Native retained fixture']);
    for ($step = 0; $capture['status'] === 'applying' && $step < 100; $step++) {
        $capture = $snapshots->continue($actor, $capture['operation_id'], $capture['checkpoint']);
    }
    nativeCheck($capture['status'] === 'succeeded' && $capture['result']['provider_calls'] === 0,
        'Retained SnapshotService completes a bounded native capture', $capture);
    $inspection = $snapshots->inspect($actor, $capture['result']['snapshot_id']);
    nativeCheck($inspection['validity'] === 'valid' && $inspection['file_count'] > 0,
        'Retained SnapshotService verifies the native archive', $inspection);
    $publisher = new PublishPlanService($db, $policy, $workspace, $releases,
        new OperationStore($db, $policy, $workspace->mutationLockPath()),
        $root . '/_studio/data/actions', $root . '/_studio/data/published-manifest.json', 2);
    $plan = $publisher->prepare($actor, (object) ['request_id' => 'native-publish-review',
        'base_draft_version' => 'draft:' . $workspace->status()['draft_version']]);
    nativeCheck($plan['status'] === 'ready' && in_array('work/detail.php', array_column($plan['files'], 'path'), true), 'Publish review includes the nested page');
    $published = $publisher->publish($actor, (object) ['plan_id' => $plan['plan_id'], 'digest' => $plan['digest'], 'operation_id' => 'native-publish-operation']);
    for ($step = 0; $published['status'] === 'applying' && $step < 100; $step++) {
        $published = $publisher->continue($actor, $published['operation_id'], $published['checkpoint']);
    }
    nativeCheck($published['status'] === 'succeeded', 'Bounded publication installs the reviewed release', $published);
    foreach ($releases->get($actor, $plan['plan_id'])['manifest']['after'] as $path => $hash) {
        nativeCheck(hash_file('sha256', $workspace->resolvePublished($path)) === $hash, 'Published bytes match reviewed hash: ' . $path);
    }
    $store = new DownloadGrantStore($db, $policy, $workspace, $root . '/_studio/data/agent/exports');
    $exporter = new ExportService($db, $policy, $workspace, $store, $publisher);
    foreach (['php', 'html'] as $format) {
        $review = $exporter->prepare($actor, (object) ['request_id' => 'native-export-' . $format, 'source' => 'published',
            'version' => $exporter->currentVersion('published'), 'format' => $format]);
        $created = $exporter->create($actor, (object) ['export_id' => $review['export_id'], 'digest' => $review['digest'], 'operation_id' => 'native-export-create-' . $format]);
        nativeCheck($created['status'] === 'created' && $review['provider_calls'] === 0, $format . ' export creates a retained portable archive without provider calls');
        $archive = $store->stage($review['export_id']) . '/site.zip';
        nativeCheck(hash_file('sha256', $archive) === $review['archive_sha256'], $format . ' export archive hash matches the review');
        $zip = new ZipArchive();
        nativeCheck($zip->open($archive) === true, $format . ' export opens as a real ZIP');
        nativeCheck($zip->locateName('work/detail.' . ($format === 'php' ? 'php' : 'html')) !== false,
            $format . ' export preserves nested page paths');
        nativeCheck(str_contains((string) $zip->getFromName('work/detail.' . ($format === 'php' ? 'php' : 'html')), 'Nested edited'),
            $format . ' export contains the edited nested page content');
        for ($index = 0; $index < $zip->numFiles; $index++) {
            $name = $zip->getNameIndex($index);
            if (str_contains($name, '\\') || str_starts_with($name, '/') || preg_match('/^[A-Za-z]:/', $name)
                || str_starts_with($name, '_studio/')) {
                throw new RuntimeException('Archive contains a native absolute path: ' . $name);
            }
        }
        $zip->close();
    }
});
