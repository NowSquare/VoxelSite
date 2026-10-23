<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/engine/bootstrap.php';
require __DIR__ . '/fixtures/mcp/ServiceFixture.php';
use VoxelSite\{Database, FileManager, Logger, Migrator, RevisionManager, Settings, SiteWorkspace, SnapshotService};
use VoxelSite\Agent\{ActorPolicy, CanonicalJson, JsonSchema, OperationActor, OperationException, OperationStore, PublishPlanService, ReleaseStore, RestorePlanService, WorkspaceFiles};

$checks = 0; $roots = [];
function check(bool $ok, string $label): void
{
    global $checks; $checks++;
    if (!$ok) throw new RuntimeException('FAIL ' . $label);
    echo 'PASS ' . $label . "\n";
}
function reject(callable $fn, string $code, string $label): void
{
    try { $fn(); } catch (OperationException $error) { check($error->errorCode === $code, $label . ' (' . $error->errorCode . ')'); return; }
    check(false, $label);
}
function removeFixture(string $root): void
{
    if (is_link($root) || is_file($root)) { unlink($root); return; }
    if (!is_dir($root)) return;
    foreach (scandir($root) as $entry) if ($entry !== '.' && $entry !== '..') removeFixture($root . '/' . $entry);
    rmdir($root);
}
function fixture(int $budget = 3, ?Closure $hook = null, ?string $givenRoot = null): array
{
    global $roots;
    if ((new ReflectionMethod(FileManager::class, '__construct'))->getNumberOfParameters() < 2) throw new RuntimeException('Explicit FileManager workspace injection required.');
    $root = $givenRoot ?? sys_get_temp_dir() . '/mcp-restore-' . bin2hex(random_bytes(8));
    foreach (['draft/assets', 'live/assets', 'private/actions'] as $path) mkdir($root . '/' . $path, 0700, true);
    $root = realpath($root); $roots[] = $root;
    if (!$root || !str_starts_with($root, realpath(sys_get_temp_dir()) . '/mcp-restore-')) throw new RuntimeException('Canonical temporary fixture required.');
    foreach (['VS_TEST_PREVIEW_DIR' => $root . '/draft', 'VS_TEST_DOC_ROOT' => $root . '/live',
        'VS_TEST_ASSETS_DIR' => $root . '/live/assets', 'VS_TEST_MUTATION_LOCK' => $root . '/private/site.lock',
        'VS_TEST_WORKSPACE_STATE_DIR' => $root . '/private/workspace', 'VS_TEST_REVISIONS_DIR' => $root . '/private/revisions',
        'VS_TEST_SNAPSHOT_DIR' => $root . '/private/legacy'] as $key => $value) putenv($key . '=' . $value);
    foreach (['logDir' => $root . '/private', 'initialized' => true] as $key => $value) (new ReflectionProperty(Logger::class, $key))->setValue(null, $value);
    Database::resetInstance(); $db = Database::getInstance($root . '/private/studio.db');
    (new Migrator($db, new Settings($db)))->run();
    foreach ([1 => 'owner', 2 => 'editor'] as $id => $role) $db->insert('users', ['id' => $id, 'role' => $role,
        'email' => $role . '@fixture.invalid', 'name' => $role, 'password_hash' => 'not-a-login',
        'created_at' => now(), 'updated_at' => now()]);
    $db->update('site_workspace_state', ['format' => 2], 'id = 1');
    file_put_contents($root . '/draft/.htaccess', SiteWorkspace::ACCESS_MARKER . "\nRequire all denied\nDeny from all\n");
    mcpCopyFixture(__DIR__ . '/fixtures/mcp/site-lifecycle/site', $root . '/draft');
    $workspace = new SiteWorkspace($db, $root . '/draft', $root . '/live', $root . '/private/workspace', $root . '/live/assets');
    $files = new FileManager($db, $workspace); $files->syncPageRegistry(true);
    $policy = new ActorPolicy($db); $actor = new OperationActor('user', 1, null, [], 'studio_configured', null);
    $editor = new OperationActor('user', 2, null, [], 'studio_configured', null);
    (new Settings($db))->set('site_url', 'https://fixture.invalid');
    $releases = new ReleaseStore($db, $policy, $root . '/private/releases');
    $operations = new OperationStore($db, $policy, $workspace->mutationLockPath());
    $publish = new PublishPlanService($db, $policy, $workspace, $releases, $operations, $root . '/private/actions', $root . '/private/legacy-published.json', $budget);
    $snapshots = new SnapshotService($db, $policy, $workspace, $releases, $operations, $root . '/private/snapshots', $root . '/private/legacy', $root . '/private/actions', $budget);
    $restore = new RestorePlanService($db, $policy, $workspace, $snapshots, $releases, $operations, $root . '/private/restores', $budget, $hook);
    return compact('root', 'db', 'workspace', 'files', 'policy', 'actor', 'editor', 'releases', 'operations', 'publish', 'snapshots', 'restore');
}
function complete(object $service, OperationActor $actor, array $result, string $id): array
{
    $steps = 0;
    while ($result['status'] === 'applying' && $steps++ < 100) $result = $service->continue($actor, $id, $result['checkpoint']);
    return $result;
}
function publish(array $f, string $id): array
{
    $plan = $f['publish']->prepare($f['actor'], (object) ['request_id' => $id . '-review', 'base_draft_version' => 'draft:' . $f['workspace']->status()['draft_version']]);
    return complete($f['publish'], $f['actor'], $f['publish']->publish($f['actor'], (object) ['plan_id' => $plan['plan_id'], 'digest' => $plan['digest'], 'operation_id' => $id]), $id);
}
function apply(array $f, array $plan, string $id): array
{
    return complete($f['restore'], $f['actor'], $f['restore']->apply($f['actor'], (object) ['plan_id' => $plan['plan_id'], 'digest' => $plan['digest'], 'operation_id' => $id]), $id);
}
function reopen(string $root): array
{
    foreach (['VS_TEST_PREVIEW_DIR' => $root . '/draft', 'VS_TEST_DOC_ROOT' => $root . '/live',
        'VS_TEST_ASSETS_DIR' => $root . '/live/assets', 'VS_TEST_MUTATION_LOCK' => $root . '/private/site.lock',
        'VS_TEST_WORKSPACE_STATE_DIR' => $root . '/private/workspace', 'VS_TEST_REVISIONS_DIR' => $root . '/private/revisions',
        'VS_TEST_SNAPSHOT_DIR' => $root . '/private/legacy'] as $key => $value) putenv($key . '=' . $value);
    foreach (['logDir' => $root . '/private', 'initialized' => true] as $key => $value) (new ReflectionProperty(Logger::class, $key))->setValue(null, $value);
    Database::resetInstance(); $db = Database::getInstance($root . '/private/studio.db');
    $workspace = new SiteWorkspace($db, $root . '/draft', $root . '/live', $root . '/private/workspace', $root . '/live/assets');
    $files = new FileManager($db, $workspace);
    $policy = new ActorPolicy($db); $actor = new OperationActor('user', 1, null, [], 'studio_configured', null);
    $releases = new ReleaseStore($db, $policy, $root . '/private/releases');
    $operations = new OperationStore($db, $policy, $workspace->mutationLockPath());
    $snapshots = new SnapshotService($db, $policy, $workspace, $releases, $operations, $root . '/private/snapshots', $root . '/private/legacy', $root . '/private/actions', 2);
    $restore = new RestorePlanService($db, $policy, $workspace, $snapshots, $releases, $operations, $root . '/private/restores', 2);
    return compact('root', 'db', 'workspace', 'files', 'policy', 'actor', 'releases', 'operations', 'snapshots', 'restore');
}

function revisionEdit(array $f, string $content, string $label): int
{
    $paths = ['index.php', 'assets/css/tailwind.css']; $before = [];
    foreach ($paths as $path) $before[$path] = $f['files']->readFile($path);
    $f['files']->writeExactFile('index.php', $content);
    $f['files']->compileTailwind();
    return (new RevisionManager($f['db'], new Settings($f['db']), $f['files']))->recordAppliedRevision(
        array_map(fn($path) => ['path' => $path, 'action' => 'write'], $paths), $label, 1, $before);
}
try {
    $f = fixture(1);
    $service = new VoxelSite\Agent\RevisionService($f['db'], $f['policy'], $f['workspace'], $f['restore'],
        $f['root'] . '/private/revisions', $f['root'] . '/private/revision-previews');
    foreach (['state', 'list', 'prepare', 'apply', 'get'] as $method) JsonSchema::assertSupported($service::inputSchema($method));
    foreach (['state', 'list', 'prepare', 'get'] as $method) JsonSchema::assertSupported($service::outputSchema($method));
    $first = revisionEdit($f, '<main class="p-4"><h1>First edit</h1></main>', 'First edit');
    $second = revisionEdit($f, '<main class="p-8"><h1>Second edit</h1></main>', 'Second edit');
    $state = $service->state($f['actor']);
    JsonSchema::validate(JsonSchema::output($state), $service::outputSchema('state'));
    $request = (object) ['request_id' => 'review-first-undo', 'action' => 'undo', 'head_version' => $state['head_version'], 'base_draft_version' => $state['draft_version']];
    $plan = $service->prepare($f['actor'], $request);
    JsonSchema::validate(JsonSchema::output($plan), $service::outputSchema('prepare'));
    check($plan['transition'] === 'revisions.undo' && str_contains($f['files']->readFile('index.php'), 'Second edit'), 'Revision review seals bytes without advancing history');
    $applyInput = (object) ['operation_id' => 'reviewed-undo-operation', 'plan_id' => $plan['plan_id'], 'digest' => $plan['digest']];
    $result = complete($f['restore'], $f['actor'], $service->apply($f['actor'], $applyInput), $applyInput->operation_id);
    check($result['status'] === 'succeeded' && str_contains($f['files']->readFile('index.php'), 'First edit')
        && (new Settings($f['db']))->get('revision_pointer') === $first && $f['db']->count('revisions') === 2, 'Reviewed undo advances only the selected transition without appending a competing revision');
    check(CanonicalJson::digest($service->apply($f['actor'], $applyInput)) === CanonicalJson::digest($result), 'Retrying undo does not undo a second revision');
    check(CanonicalJson::digest($service->prepare($f['actor'], $request)) === CanonicalJson::digest($plan), 'A repeated preparation returns its original review after the head moves');
    $f['db']->update('agent_restore_plans', ['expires_at' => time() - 1], 'id = ?', [$plan['plan_id']]);
    check(CanonicalJson::digest($service->apply($f['actor'], $applyInput)) === CanonicalJson::digest($result), 'An applied review expiry does not discard the retained retry outcome');
    $state = $service->state($f['actor']);
    $redo = $service->prepare($f['actor'], (object) ['request_id' => 'review-first-redo', 'action' => 'redo', 'head_version' => $state['head_version'], 'base_draft_version' => $state['draft_version']]);
    $redoInput = (object) ['operation_id' => 'reviewed-redo-operation', 'plan_id' => $redo['plan_id'], 'digest' => $redo['digest']];
    $result = complete($f['restore'], $f['actor'], $service->apply($f['actor'], $redoInput), $redoInput->operation_id);
    check($result['status'] === 'succeeded' && str_contains($f['files']->readFile('index.php'), 'Second edit')
        && (new Settings($f['db']))->get('revision_pointer') === $second, 'Reviewed redo restores its captured files and pointer');
    reject(fn() => $service->prepare($f['actor'], (object) ['request_id' => 'stale-head-review', 'action' => 'undo', 'head_version' => $state['head_version'], 'base_draft_version' => $state['draft_version']]),
        'content_conflict', 'A stale revision head cannot choose a different transition');
    $list = $service->list($f['actor'], (object) ['limit' => 1]);
    JsonSchema::validate(JsonSchema::output($list), $service::outputSchema('list'));
    check($list['total'] === 2 && $list['next_offset'] === 1, 'Revision inspection returns bounded explicit history pages');
    $manager = new VoxelSite\DesignManager($f['db'], $f['workspace'], $f['root'] . '/private/designs');
    $designs = new VoxelSite\Agent\DesignService($f['db'], $f['policy'], $f['workspace'], $manager, $f['restore'],
        $f['operations'], $f['root'] . '/private/actions', $f['root'] . '/private/design-previews', 1);
    foreach (['list', 'save', 'rename', 'delete', 'load', 'new', 'apply', 'get', 'preview'] as $method) JsonSchema::assertSupported($designs::inputSchema($method));
    foreach (['list', 'load', 'new', 'get', 'preview'] as $method) JsonSchema::assertSupported($designs::outputSchema($method));
    foreach (['save', 'rename', 'delete'] as $method) JsonSchema::assertSupported($designs::resultSchema($method));
    $savedInput = (object) ['operation_id' => 'save-design-operation', 'name' => 'Saved design A', 'description' => 'Private archive'];
    $saved = $designs->save($f['actor'], $savedInput);
    check($saved['status'] === 'applying', 'Design saving is a bounded archive operation');
    $saved = complete($designs, $f['actor'], $saved, $savedInput->operation_id);
    check($saved['status'] === 'succeeded', 'Design capture verifies retained bytes before reporting success');
    JsonSchema::validate(JsonSchema::output($saved['result']), $designs::resultSchema('save'));
    $designId = $saved['result']['design']['id'];
    $designFiles = $manager->archive($designId)['domains']['draft']['files'];
    $f['files']->writeExactFile('assets/css/style.css', ':root{--color-primary:#ff0000;}');
    $f['files']->writeExactFile('index.php', '<main>Newer modified draft design</main>');
    $f['files']->writeExactFile('assets/images/kept.png', 'Private uploaded content');
    $f['files']->syncPageRegistry(true);
    $f['db']->update('site_workspace_state', ['draft_version' => 3], 'id = 1');
    $liveBeforeDesign = SiteWorkspace::inventory($f['root'] . '/live');
    $load = $designs->prepareLoad($f['actor'], (object) ['request_id' => 'load-design-review', 'design_id' => $designId, 'base_draft_version' => 'draft:3']);
    $loadInput = (object) ['operation_id' => 'load-design-operation', 'plan_id' => $load['plan_id'], 'digest' => $load['digest']];
    $loaded = complete($f['restore'], $f['actor'], $designs->apply($f['actor'], $loadInput), $loadInput->operation_id);
    check($loaded['status'] === 'succeeded' && $f['files']->readFile('assets/css/style.css') === $designFiles['assets/css/style.css']
        && $f['files']->readFile('assets/images/kept.png') === 'Private uploaded content', 'Loading a design restores its private mutable assets while preserving newer uploaded content');
    check(SiteWorkspace::inventory($f['root'] . '/live') === $liveBeforeDesign, 'Design switching leaves every published file unchanged');
    $preview = $designs->preview($f['actor'], (object) ['design_id' => $designId, 'path' => 'index.php', 'max_bytes' => 65536]);
    JsonSchema::validate(JsonSchema::output($preview), $designs::outputSchema('preview'));
    check($preview['rendered'] && str_contains($preview['html'], 'Second edit') && $preview['archive_format'] === 3, 'Saved design preview uses the shared provider-free private renderer');
    check(count(array_filter(scandir($f['root'] . '/private/design-previews'), fn($name) => !in_array($name, ['.', '..', '.htaccess'], true))) === 0,
        'Saved design preview removes only its temporary clone after rendering');
    $library = $designs->list($f['actor'], (object) ['limit' => 2]);
    JsonSchema::validate(JsonSchema::output($library), $designs::outputSchema('list'));
    $rename = $designs->rename($f['actor'], (object) ['operation_id' => 'rename-design-operation', 'design_id' => $designId,
        'version' => $library['designs'][0]['version'], 'name' => 'Renamed design', 'description' => 'Same retained bytes']);
    check($rename['status'] === 'succeeded' && $manager->readMetadata($designId)['name'] === 'Renamed design', 'Design rename is a retained metadata operation');
    $deleted = $designs->delete($f['actor'], (object) ['operation_id' => 'delete-protected-design', 'design_id' => $designId, 'version' => $rename['result']['design']['version']]);
    check($deleted['status'] === 'failed_restored' && $manager->readMetadata($designId) !== null, 'A design referenced by restoration history cannot be deleted');
    mkdir($manager->root() . '/unsupported/preview', 0700, true);
    file_put_contents($manager->root() . '/unsupported/metadata.json', json_encode(['id' => 'unsupported', 'name' => 'Unsupported archive', 'archive_format' => 99]));
    reject(fn() => $designs->prepareLoad($f['actor'], (object) ['request_id' => 'unsupported-design-review', 'design_id' => 'unsupported',
        'base_draft_version' => 'draft:' . $f['workspace']->status()['draft_version']]), 'content_conflict', 'Unsupported saved design formats are rejected before draft mutation');
    $new = $designs->prepareNew($f['actor'], (object) ['request_id' => 'new-design-review', 'base_draft_version' => 'draft:' . $f['workspace']->status()['draft_version']]);
    $newInput = (object) ['operation_id' => 'new-design-operation', 'plan_id' => $new['plan_id'], 'digest' => $new['digest']];
    $cleared = complete($f['restore'], $f['actor'], $designs->apply($f['actor'], $newInput), $newInput->operation_id);
    check($cleared['status'] === 'succeeded' && $f['files']->readFile('index.php') === null
        && $f['files']->readFile('assets/images/kept.png') === 'Private uploaded content'
        && (new Settings($f['db']))->get('active_design_id') === null, 'New design clears authoring files with retained safety history and preserves uploaded content');
    $state = $service->state($f['actor']);
    $undoNew = $service->prepare($f['actor'], (object) ['request_id' => 'undo-new-design-review', 'action' => 'undo',
        'head_version' => $state['head_version'], 'base_draft_version' => $state['draft_version']]);
    $undoNewInput = (object) ['operation_id' => 'undo-new-design-operation', 'plan_id' => $undoNew['plan_id'], 'digest' => $undoNew['digest']];
    $restoredDesign = complete($f['restore'], $f['actor'], $service->apply($f['actor'], $undoNewInput), $undoNewInput->operation_id);
    check($restoredDesign['status'] === 'succeeded' && (new Settings($f['db']))->get('active_design_id') === $designId
        && $f['files']->readFile('index.php') === $designFiles['index.php'], 'Undoing new design restores captured files and the active-design identity');
    revisionEdit($f, '<main class="p-12">Divergent edit</main>', 'Divergent edit');
    $divergent = $service->state($f['actor']);
    check(!$divergent['can_redo'], 'A divergent edit removes the undone branch from active redo navigation');
    reject(fn() => $service->prepare($f['actor'], (object) ['request_id' => 'divergent-redo-review', 'action' => 'redo',
        'head_version' => $divergent['head_version'], 'base_draft_version' => $divergent['draft_version']]),
        'content_conflict', 'Reviewed redo cannot reselect the discarded branch after a new edit');
    check(CanonicalJson::digest($designs->save($f['actor'], $savedInput)) === CanonicalJson::digest($saved),
        'Retrying a completed design save does not capture the later draft');
    mkdir($manager->root() . '/aabbccdd/preview', 0700, true);
    file_put_contents($manager->root() . '/aabbccdd/metadata.json', json_encode(['id' => 'aabbccdd', 'name' => 'Legacy design']));
    file_put_contents($manager->root() . '/aabbccdd/preview/index.php', '<main>Legacy archive</main>');
    $legacyBefore = file_get_contents($manager->root() . '/aabbccdd/metadata.json');
    $legacyVersion = CanonicalJson::digest($manager->readMetadata('aabbccdd'));
    $legacyRenamed = $designs->rename($f['actor'], (object) ['operation_id' => 'rename-legacy-design', 'design_id' => 'aabbccdd',
        'version' => $legacyVersion, 'name' => 'Legacy retained', 'description' => 'Known draft domain']);
    check($legacyRenamed['status'] === 'succeeded' && $manager->archive('aabbccdd')['metadata']['name'] === 'Legacy retained'
        && file_get_contents($manager->root() . '/aabbccdd/metadata.json') === $legacyBefore, 'Legacy design rename retains original archive bytes and uses shared metadata');
    $legacyDeleted = $designs->delete($f['actor'], (object) ['operation_id' => 'delete-legacy-design', 'design_id' => 'aabbccdd',
        'version' => $legacyRenamed['result']['design']['version']]);
    check($legacyDeleted['status'] === 'succeeded' && $manager->readMetadata('aabbccdd') === null
        && is_file($manager->root() . '/aabbccdd/preview/index.php'), 'Deleting an unprotected design hides it while preserving retained archive bytes');
    $published = publish($f, 'history-unpublish-source');
    file_put_contents($f['root'] . '/live/unrelated.php', '<?php echo "Owner file";');
    $draftBefore = WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace']));
    $pagesBefore = $f['db']->query('SELECT * FROM pages ORDER BY id');
    $pointerBefore = (new Settings($f['db']))->get('revision_pointer');
    $unpublish = new VoxelSite\Agent\UnpublishService($f['policy'], $f['workspace'], $f['restore']);
    foreach (['prepare', 'apply', 'get'] as $method) JsonSchema::assertSupported($unpublish::inputSchema($method));
    $offline = $unpublish->prepare($f['editor'], (object) ['request_id' => 'unpublish-editor-review', 'release_id' => $published['result']['release_id']]);
    check($offline['transition'] === 'site.unpublish' && !in_array('unrelated.php', array_column($offline['files'], 'path'), true),
        'Unpublish retains editor authority and reviews only managed live paths');
    $offlineInput = (object) ['operation_id' => 'editor-unpublish-operation', 'plan_id' => $offline['plan_id'], 'digest' => $offline['digest']];
    $offlineResult = complete($f['restore'], $f['editor'], $unpublish->apply($f['editor'], $offlineInput), $offlineInput->operation_id);
    check($offlineResult['status'] === 'succeeded' && is_file($f['root'] . '/live/unrelated.php')
        && hash_file('sha256', $f['root'] . '/live/index.php') === hash_file('sha256', dirname(__DIR__) . '/data/default-unpublish-index.php'),
        'Unpublish installs exact reviewed offline bytes while retaining unrelated hosting files');
    check(WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace'])) === $draftBefore
        && $f['db']->query('SELECT * FROM pages ORDER BY id') === $pagesBefore
        && (new Settings($f['db']))->get('revision_pointer') === $pointerBefore
        && (new Settings($f['db']))->get('last_published_at') === '', 'Unpublish preserves draft and revision state while clearing publication time');
    check(CanonicalJson::digest($unpublish->apply($f['editor'], $offlineInput)) === CanonicalJson::digest($offlineResult),
        'Unpublish retries return the retained live mutation result');
    check($f['snapshots']->inspect($f['actor'], $offline['safety_snapshot_id'])['validity'] === 'valid',
        'Unpublish retains a verifiable protected live recovery archive');
    $f = fixture(1);
    $manager = new VoxelSite\DesignManager($f['db'], $f['workspace'], $f['root'] . '/private/designs');
    $designs = new VoxelSite\Agent\DesignService($f['db'], $f['policy'], $f['workspace'], $manager, $f['restore'],
        $f['operations'], $f['root'] . '/private/actions', $f['root'] . '/private/design-previews', 1);
    $interrupted = $designs->save($f['actor'], (object) ['operation_id' => 'interrupted-design-save', 'name' => 'Interrupted', 'description' => '']);
    check($interrupted['status'] === 'applying', 'Design capture exposes a bounded continuation before finalizing');
    file_put_contents($f['root'] . '/draft/index.php', '<main>Outside source change</main>');
    $failed = $designs->continue($f['actor'], 'interrupted-design-save', $interrupted['checkpoint']);
    check($failed['status'] === 'failed_restored' && $manager->list() === []
        && $f['files']->readFile('index.php') === '<main>Outside source change</main>'
        && SiteWorkspace::inventory($f['root'] . '/live')['files'] === [],
        'Changed design-capture source fails without publishing an incomplete archive or rewriting draft/live files');
} finally {
    Database::resetInstance();
    foreach (['VS_TEST_PREVIEW_DIR', 'VS_TEST_DOC_ROOT', 'VS_TEST_ASSETS_DIR', 'VS_TEST_MUTATION_LOCK',
        'VS_TEST_WORKSPACE_STATE_DIR', 'VS_TEST_REVISIONS_DIR', 'VS_TEST_SNAPSHOT_DIR'] as $key) putenv($key);
    foreach ($roots as $root) removeFixture($root);
}
echo 'MCP design/history: ' . $checks . " checks passed\n";
