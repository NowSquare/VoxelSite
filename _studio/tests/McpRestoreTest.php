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

if (($argv[1] ?? '') === '--crash') {
    [$phase, $crashRoot] = array_slice($argv, 2);
    $f = fixture(100, static function ($seen) use ($phase): void {
        if ($seen === $phase) posix_kill(getmypid(), SIGKILL);
    }, $crashRoot);
    publish($f, 'crash-publish-a');
    $input = (object) ['operation_id' => 'crash-snapshot-a', 'domain' => 'both', 'label' => 'Crash A'];
    $capture = complete($f['snapshots'], $f['actor'], $f['snapshots']->create($f['actor'], $input), $input->operation_id);
    $draft = WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace']));
    $live = SiteWorkspace::inventory($f['root'] . '/live');
    $f['files']->writeExactFile('index.php', '<main>Crash B</main>');
    $f['files']->writeExactFile('about.php', '<main>Second crash B</main>');
    $f['files']->syncPageRegistry(true);
    $f['db']->update('site_workspace_state', ['draft_version' => 1], 'id = 1');
    publish($f, 'crash-publish-b');
    $plan = $f['restore']->prepare($f['actor'], (object) ['request_id' => 'crash-restore-review',
        'snapshot_id' => $capture['result']['snapshot_id'], 'domain' => 'both']);
    file_put_contents($f['root'] . '/private/crash-state.json', json_encode(compact('plan', 'draft', 'live'), JSON_THROW_ON_ERROR));
    apply($f, $plan, 'crash-restore-operation');
    exit(3);
}
try {
    foreach (['create', 'inspect', 'list'] as $method) JsonSchema::assertSupported(SnapshotService::inputSchema($method));
    JsonSchema::assertSupported(SnapshotService::metadataSchema());
    JsonSchema::assertSupported(SnapshotService::outputSchema('list'));
    JsonSchema::assertSupported(SnapshotService::resultSchema());
    foreach (['prepare', 'apply', 'get'] as $method) JsonSchema::assertSupported(RestorePlanService::inputSchema($method));
    JsonSchema::assertSupported(RestorePlanService::outputSchema());
    JsonSchema::assertSupported(RestorePlanService::resultSchema());
    $f = fixture();
    $a = publish($f, 'publish-release-a');
    check($a['status'] === 'succeeded', 'Release A is published through the real sealed pipeline');
    $draftA = WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace']));
    $liveA = SiteWorkspace::inventory($f['root'] . '/live');
    $input = (object) ['operation_id' => 'snapshot-both-a', 'domain' => 'both', 'label' => 'Website A'];
    $first = $f['snapshots']->create($f['actor'], $input);
    check($first['status'] === 'applying', 'Snapshot capture is bounded and reserves the workspace');
    check(CanonicalJson::digest($first) === CanonicalJson::digest($f['snapshots']->create($f['actor'], $input)), 'Snapshot start retry returns the same checkpoint');
    $capture = complete($f['snapshots'], $f['actor'], $first, $input->operation_id);
    check($capture['status'] === 'succeeded', 'Snapshot continuation seals both domains');
    JsonSchema::validate(JsonSchema::output($capture['result']), SnapshotService::resultSchema());
    $snapshotId = $capture['result']['snapshot_id'];
    $view = $f['snapshots']->inspect($f['actor'], $snapshotId);
    JsonSchema::validate(JsonSchema::output($view), SnapshotService::metadataSchema());
    check($view['format'] === 3 && $view['domains'] === ['draft', 'published'] && $view['validity'] === 'valid'
        && in_array('action_definitions', $view['excluded_domains']), 'Inspection identifies exact domains and excluded business data');
    $retryInput = (object) ['request_id' => 'interrupted-preparation', 'snapshot_id' => $snapshotId, 'domain' => 'draft'];
    $retryPlan = $f['restore']->prepare($f['actor'], $retryInput);
    $f['db']->update('agent_restore_plans', ['status' => 'preparing', 'manifest_json' => null, 'digest' => null, 'payload_json' => null], 'id = ?', [$retryPlan['plan_id']]);
    $abandonedPath = $f['root'] . '/private/restores/' . $retryPlan['plan_id'] . '/candidate/draft/abandoned.php';
    file_put_contents($abandonedPath, '<main>Unsealed attempt</main>');
    check($f['restore']->prepare($f['actor'], $retryInput)['plan_id'] === $retryPlan['plan_id'] && !file_exists($abandonedPath),
        'Interrupted preparation reuses its identity and removes only its unsealed private bytes');
    $f['files']->writeExactFile('index.php', '<main><h1>Newer draft B</h1></main>');
    $f['files']->writeExactFile('assets/images/later-upload.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    $f['files']->syncPageRegistry(true);
    $f['db']->update('site_workspace_state', ['draft_version' => 1], 'id = 1');
    (new Settings($f['db']))->set('draft_test_setting', ['keep' => 'B']);
    $b = publish($f, 'publish-release-b');
    check($b['status'] === 'succeeded', 'Release B publishes without replacing its newer draft');
    $draftB = WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace']));
    $pagesB = $f['db']->query('SELECT * FROM pages ORDER BY id');
    $settingsB = $f['db']->query("SELECT * FROM settings WHERE key NOT IN ('last_published_at','publish_count') ORDER BY key");
    $revisionsB = $f['db']->query('SELECT * FROM revisions ORDER BY id');
    reject(fn() => $f['restore']->prepare($f['editor'], (object) ['request_id' => 'editor-live-restore', 'snapshot_id' => $snapshotId, 'domain' => 'published']),
        'permission_denied', 'Live restoration requires separate owner authority');
    $plan = $f['restore']->prepare($f['actor'], (object) ['request_id' => 'restore-live-a', 'snapshot_id' => $snapshotId, 'domain' => 'published']);
    JsonSchema::validate(JsonSchema::output($plan), RestorePlanService::outputSchema());
    $result = apply($f, $plan, 'restore-live-operation');
    check($result['status'] === 'succeeded', 'Published-only restore completes');
    JsonSchema::validate(JsonSchema::output($result['result']), RestorePlanService::resultSchema());
    check(SiteWorkspace::inventory($f['root'] . '/live') === $liveA, 'Live A bytes are restored exactly');
    check(WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace'])) === $draftB
        && $f['db']->query('SELECT * FROM pages ORDER BY id') === $pagesB
        && $f['db']->query("SELECT * FROM settings WHERE key NOT IN ('last_published_at','publish_count') ORDER BY key") === $settingsB
        && $f['db']->query('SELECT * FROM revisions ORDER BY id') === $revisionsB, 'Published-only restoration preserves newer draft files, page/nav rows, settings and revision pointer');
    check(CanonicalJson::digest($result) === CanonicalJson::digest(apply($f, $plan, 'restore-live-operation')), 'Lost restore response retry returns one retained outcome');
    check($f['snapshots']->inspect($f['actor'], $result['result']['release_id'])['validity'] === 'valid', 'A restored release is inspectable as a retained published archive');
    $liveAfter = SiteWorkspace::inventory($f['root'] . '/live');
    $draftPlan = $f['restore']->prepare($f['actor'], (object) ['request_id' => 'restore-draft-a', 'snapshot_id' => $snapshotId, 'domain' => 'draft']);
    reject(fn() => $f['restore']->get($f['editor'], $draftPlan['plan_id']), 'permission_denied', 'A restore review remains bound to its initiating connection');
    $draftResult = apply($f, $draftPlan, 'restore-draft-operation');
    check($draftResult['status'] === 'succeeded' && WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace'])) === $draftA, 'Draft A restoration installs captured source bytes');
    check(!file_exists($f['root'].'/draft/assets/images/later-upload.svg'), 'Modern complete snapshots remove later uploads absent from their explicit captured domain');
    check(SiteWorkspace::inventory($f['root'] . '/live') === $liveAfter, 'Draft restoration leaves live hashes unchanged');
    check($f['db']->count('revisions') === count($revisionsB) + 1, 'Draft restoration appends its attributed history transition');
    reject(fn() => $f['restore']->prepare($f['actor'], (object) ['request_id' => 'wrong-domain-archive', 'snapshot_id' => $a['result']['release_id'], 'domain' => 'draft']),
        'invalid_schema', 'A published release cannot implicitly replace a draft');
    $safety = $f['snapshots']->inspect($f['actor'], $plan['safety_snapshot_id']);
    check($safety['validity'] === 'valid' && $safety['domains'] === ['published'] && $safety['protected'], 'The retained before-state remains a protected explicit-domain safety archive');

    // A restore after Undo retains the old branch for audit, but navigation
    // must follow the active parent -> restoration branch exclusively.
    $ops = [['path' => 'index.php', 'action' => 'write']];
    $before = $f['files']->readFile('index.php');
    $f['files']->writeExactFile('index.php', '<main><h1>Branch parent</h1></main>');
    $parent = (new RevisionManager($f['db'], new Settings($f['db']), $f['files']))->recordAppliedRevision($ops, 'Parent edit', 1, ['index.php' => $before]);
    $before = $f['files']->readFile('index.php');
    $f['files']->writeExactFile('index.php', '<main><h1>Discarded redo</h1></main>');
    $discarded = (new RevisionManager($f['db'], new Settings($f['db']), $f['files']))->recordAppliedRevision($ops, 'Old future', 1, ['index.php' => $before]);
    (new RevisionManager($f['db'], new Settings($f['db']), $f['files']))->undo();
    $branchPlan = $f['restore']->prepare($f['actor'], (object) ['request_id' => 'restore-after-undo', 'snapshot_id' => $snapshotId, 'domain' => 'draft']);
    $parentProjection = $f['db']->query('SELECT * FROM pages ORDER BY id');
    $branch = apply($f, $branchPlan, 'restore-branch-operation');
    check($branch['status'] === 'succeeded' && $f['db']->count('agent_archived_revisions', 'revision_id = ?', [$discarded]) === 1
        && is_file($f['root'] . '/private/revisions/' . $discarded . '/after/index.php'), 'Restoration preserves discarded redo rows and captured bytes as audit');
    (new RevisionManager($f['db'], new Settings($f['db']), $f['files']))->undo();
    check((new Settings($f['db']))->get('revision_pointer') === $parent
        && str_contains($f['files']->readFile('index.php'), 'Branch parent'), 'Undo restoration selects its active parent, skipping the archived redo branch');
    check(CanonicalJson::digest($f['db']->query('SELECT * FROM pages ORDER BY id')) === CanonicalJson::digest($parentProjection),
        'Undo restoration recovers the captured page and navigation projection');
    $redo = (new RevisionManager($f['db'], new Settings($f['db']), $f['files']))->redo();
    check($redo['revision_id'] === $branch['result']['revision_id']
        && !str_contains($f['files']->readFile('index.php'), 'Discarded redo'), 'Redo returns to the restoration rather than the old future');

    $expired = $f['restore']->prepare($f['actor'], (object) ['request_id' => 'expired-review-test', 'snapshot_id' => $snapshotId, 'domain' => 'draft']);
    $f['db']->update('agent_restore_plans', ['expires_at' => time() - 1], 'id = ?', [$expired['plan_id']]);
    reject(fn() => $f['restore']->get($f['actor'], $expired['plan_id']), 'review_expired', 'Expired restore reviews require a new preparation');
    $beforeExpired = WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace']));
    check(apply($f, $expired, 'expired-restore-operation')['status'] === 'failed_restored'
        && WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace'])) === $beforeExpired, 'Expired apply does not mutate draft files');
    $tampered = $f['restore']->prepare($f['actor'], (object) ['request_id' => 'corrupt-stage-test', 'snapshot_id' => $snapshotId, 'domain' => 'draft']);
    file_put_contents($f['root'] . '/private/restores/' . $tampered['plan_id'] . '/candidate/draft/index.php', 'corrupted private staging');
    check(apply($f, $tampered, 'corrupt-stage-operation')['status'] === 'failed_restored'
        && WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace'])) === $beforeExpired, 'Changed sealed candidate bytes are rejected before mutation');

    $both = $f['restore']->prepare($f['actor'], (object) ['request_id' => 'restore-both-domains', 'snapshot_id' => $snapshotId, 'domain' => 'both']);
    check(apply($f, $both, 'restore-both-operation')['status'] === 'succeeded'
        && WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace'])) === $draftA
        && SiteWorkspace::inventory($f['root'] . '/live') === $liveA, 'An archive with both domains restores both only when explicitly selected');

    mkdir($f['root'] . '/private/legacy', 0700, true);
    $zip = new ZipArchive();
    $zip->open($f['root'] . '/private/legacy/legacy.zip', ZipArchive::CREATE | ZipArchive::EXCL);
    $zip->addFromString('preview/index.php', '<main>Legacy draft</main>');
    $zip->addFromString('assets/css/style.css', ':root{--color-primary:#123456;}');
    $zip->close();
    $legacyId = $f['db']->insert('snapshots', ['filename' => 'legacy.zip', 'snapshot_type' => 'manual',
        'label' => 'Legacy', 'description' => '', 'file_count' => 2, 'size_bytes' => filesize($f['root'] . '/private/legacy/legacy.zip'),
        'created_by' => 1, 'created_at' => now()]);
    $legacy = $f['snapshots']->inspect($f['actor'], 'legacy_' . $legacyId);
    check($legacy['validity'] === 'valid' && $legacy['format'] === 1 && $legacy['domains'] === ['draft'], 'Legacy archives report draft-only recoverable provenance');
    reject(fn() => $f['restore']->prepare($f['actor'], (object) ['request_id' => 'legacy-live-rejected', 'snapshot_id' => 'legacy_' . $legacyId, 'domain' => 'published']),
        'invalid_schema', 'Legacy shared assets are not claimed to be a captured live release');
    $legacyPlan = $f['restore']->prepare($f['actor'], (object) ['request_id' => 'legacy-protected-restore', 'snapshot_id' => 'legacy_' . $legacyId, 'domain' => 'draft']);
    check(in_array($legacyId, VoxelSite\SnapshotRetention::protectedIds($f['db']), true), 'Archive selection is protected from legacy retention while a restore is retained');
    $zip->open($f['root'] . '/private/legacy/legacy.zip');
    $zip->addFromString('site-control-state.json', json_encode(['format' => 2, 'domain' => 'draft', 'pages' => [
        ['id' => 1, 'file_path' => 'index.php', 'nav_parent_id' => 1],
    ]], JSON_THROW_ON_ERROR));
    $zip->close();
    check($f['snapshots']->inspect($f['actor'], 'legacy_' . $legacyId)['validity'] === 'invalid', 'Cyclic archived navigation fails inspection before preparation');
    $listed = $f['snapshots']->list($f['actor']);
    $legacySummary = array_values(array_filter($listed, fn($item) => $item['snapshot_id'] === 'legacy_' . $legacyId))[0];
    check($legacySummary['format'] === 2 && $legacySummary['validity'] === 'not_checked', 'Listing distinguishes format 2 provenance without claiming byte validation');
    $compat = VoxelSite\LegacySnapshotService::restoreSnapshot($f['root'] . '/private/legacy/legacy.zip', $f['root'] . '/draft', $f['root'] . '/draft/assets');
    check(!$compat['ok'] && !$compat['has_mutated'], 'The Studio compatibility path also rejects invalid metadata before writing');
    $zip->open($f['root'] . '/private/legacy/legacy.zip');
    $zip->deleteName('site-control-state.json');
    $zip->addFromString('preview/../escape.php', 'unsafe');
    $zip->close();
    check($f['snapshots']->inspect($f['actor'], 'legacy_' . $legacyId)['validity'] === 'invalid', 'Legacy archive traversal is rejected during inspection');
    $oversized = $f['root'] . '/private/oversized-source';
    $handle = fopen($oversized, 'w'); ftruncate($handle, SnapshotService::MAX_BYTES + 1); fclose($handle);
    $zip->open($f['root'] . '/private/legacy/legacy.zip', ZipArchive::OVERWRITE);
    $zip->addFile($oversized, 'preview/index.php'); $zip->close(); unlink($oversized);
    check($f['snapshots']->inspect($f['actor'], 'legacy_' . $legacyId)['validity'] === 'invalid', 'Compressed archives are bounded before decompression');
    $compat = VoxelSite\LegacySnapshotService::restoreSnapshot($f['root'] . '/private/legacy/legacy.zip', $f['root'] . '/draft', $f['root'] . '/draft/assets');
    check(!$compat['ok'] && !$compat['has_mutated'], 'Oversized legacy restoration cannot begin a Studio website mutation');
    file_put_contents($f['root'] . '/private/snapshots/' . $snapshotId . '/draft/index.php', 'archive changed');
    check($f['snapshots']->inspect($f['actor'], $snapshotId)['validity'] === 'invalid', 'Changed retained archive content is reported invalid');
    foreach ($f['snapshots']->list($f['actor']) as $metadata) JsonSchema::validate(JsonSchema::output($metadata), SnapshotService::metadataSchema());
    $page = $f['snapshots']->listPaged($f['actor'], (object) ['limit' => 2]);
    JsonSchema::validate(JsonSchema::output($page), SnapshotService::outputSchema('list'));
    $ids = array_column($page['snapshots'], 'snapshot_id'); $cursor = $page;
    while ($cursor['next_offset'] !== null) {
        $cursor = $f['snapshots']->listPaged($f['actor'], (object) ['limit' => 2, 'offset' => $cursor['next_offset'], 'inventory_version' => $page['inventory_version']]);
        $ids = array_merge($ids, array_column($cursor['snapshots'], 'snapshot_id'));
    }
    check(count($ids) === $page['total'] && count(array_unique($ids)) === count($ids), 'Stable history pagination returns every retained archive exactly once');
    $f['db']->update('snapshots', ['label' => 'Inventory changed'], 'id = ?', [$legacyId]);
    reject(fn() => $f['snapshots']->listPaged($f['actor'], (object) ['limit' => 2, 'offset' => 2, 'inventory_version' => $page['inventory_version']]),
        'content_conflict', 'Archive metadata changes invalidate continuation cursors');

    $g = fixture(1);
    file_put_contents($g['root'] . '/private/actions/book.json', '{"id":"book","name":"Book","active":true,"fields":[]}');
    $actionRelease = publish($g, 'publish-actions-a');
    file_put_contents($g['root'] . '/private/actions/book.json', '{"id":"book","name":"Changed","active":true,"fields":[]}');
    reject(fn() => $g['restore']->prepare($g['actor'], (object) ['request_id' => 'restore-old-actions', 'snapshot_id' => $actionRelease['result']['release_id'], 'domain' => 'published']),
        'content_conflict', 'Archived Action artifacts are rejected when live definitions differ');
    check(str_contains(file_get_contents($g['root'] . '/private/actions/book.json'), 'Changed'), 'Restoration never rewinds immediate Action definitions');

    $h = fixture(1);
    $releaseH = publish($h, 'publish-recovery-a');
    $h['files']->writeExactFile('index.php', '<main>Recovery B</main>');
    $h['files']->writeExactFile('about.php', '<main>Other B</main>');
    $h['db']->update('site_workspace_state', ['draft_version' => 1], 'id = 1');
    publish($h, 'publish-recovery-b');
    $liveH = SiteWorkspace::inventory($h['root'] . '/live');
    $failed = false;
    $h['restore'] = new RestorePlanService($h['db'], $h['policy'], $h['workspace'], $h['snapshots'],
        $h['releases'], $h['operations'], $h['root'] . '/private/restores', 1,
        static function ($phase) use (&$failed): void { if ($phase === 'after_file' && !$failed) { $failed = true; throw new RuntimeException('Injected write failure'); } });
    $recoveryPlan = $h['restore']->prepare($h['actor'], (object) ['request_id' => 'restore-recovery-plan', 'snapshot_id' => $releaseH['result']['release_id'], 'domain' => 'published']);
    check(apply($h, $recoveryPlan, 'restore-failing-write')['status'] === 'failed_restored'
        && SiteWorkspace::inventory($h['root'] . '/live') === $liveH, 'Mid-restore failure reinstalls and verifies the complete live before-state');
    $j = fixture(1);
    $sourceInput = (object) ['operation_id' => 'snapshot-drift-source', 'domain' => 'draft', 'label' => 'Before drift'];
    $source = complete($j['snapshots'], $j['actor'], $j['snapshots']->create($j['actor'], $sourceInput), $sourceInput->operation_id);
    $j['files']->writeExactFile('index.php', '<main>Drift before B</main>');
    $j['files']->writeExactFile('about.php', '<main>Second drift before B</main>');
    $j['files']->syncPageRegistry(true);
    $j['db']->update('site_workspace_state', ['draft_version' => 1], 'id = 1');
    $driftPlan = $j['restore']->prepare($j['actor'], (object) ['request_id' => 'outside-drift-review', 'snapshot_id' => $source['result']['snapshot_id'], 'domain' => 'draft']);
    $drift = $j['restore']->apply($j['actor'], (object) ['plan_id' => $driftPlan['plan_id'], 'digest' => $driftPlan['digest'], 'operation_id' => 'outside-drift-operation']);
    $driftPath = $driftPlan['files'][0]['path'];
    file_put_contents($j['workspace']->resolveDraft($driftPath), '<main>Unrelated operator bytes</main>');
    $drift = $j['restore']->continue($j['actor'], 'outside-drift-operation', $drift['checkpoint']);
    check($drift['status'] === 'recovery_required' && $j['files']->readFile($driftPath) === '<main>Unrelated operator bytes</main>',
        'Outside drift remains intact and prevents a false successful recovery claim');
    check($j['workspace']->status()['reservation_operation_id'] !== null, 'Unverified restoration retains its workspace reservation');
    $k = fixture();
    publish($k, 'adapter-publish-a');
    $adapterLive = SiteWorkspace::inventory($k['root'] . '/live');
    $k['files']->writeExactFile('index.php', '<main>Adapter newer draft B</main>');
    $k['files']->syncPageRegistry(true);
    $k['db']->update('site_workspace_state', ['draft_version' => 1], 'id = 1');
    publish($k, 'adapter-publish-b');
    $history = new VoxelSite\WebsiteHistoryService($k['db'], $k['workspace'], $k['root'] . '/private');
    reject(fn() => $history->rollback($k['actor'], []), 'invalid_schema', 'Studio live rollback requires a stable operation identity');
    $adapter = $history->rollback($k['actor'], ['operation_id' => 'adapter-rollback']);
    while ($adapter['status'] === 'applying') $adapter = $history->rollback($k['actor'], ['operation_id' => 'adapter-rollback', 'checkpoint' => $adapter['checkpoint']]);
    check($adapter['status'] === 'succeeded' && SiteWorkspace::inventory($k['root'] . '/live') === $adapterLive
        && str_contains($k['files']->readFile('index.php'), 'newer draft B'), 'Studio rollback uses the same exact published-domain journal while preserving the newer draft');
    check(CanonicalJson::digest($history->rollback($k['actor'], ['operation_id' => 'adapter-rollback'])) === CanonicalJson::digest($adapter),
        'Retrying Studio rollback returns its retained result without rolling back another release');
    for ($index = 0; $index < 22; $index++) $k['files']->writeExactFile('assets/data/history-' . $index . '.json', '{"retained":true}');
    $captureInput = ['operation_id' => 'studio-history-capture', 'domain' => 'draft', 'label' => 'Studio shared archive'];
    $capture = $history->capture($k['actor'], $captureInput);
    check($capture['status'] === 'applying', 'Studio snapshot capture returns the shared bounded operation');
    reject(fn() => $history->capture($k['actor'], array_replace($captureInput, ['domain' => 'published', 'checkpoint' => $capture['checkpoint']])),
        'idempotency_conflict', 'Snapshot continuation cannot change its captured domain');
    while ($capture['status'] === 'applying') $capture = $history->capture($k['actor'], $captureInput + ['checkpoint' => $capture['checkpoint']]);
    check($capture['status'] === 'succeeded' && CanonicalJson::digest($history->capture($k['actor'], $captureInput)) === CanonicalJson::digest($capture),
        'Studio capture replay returns its retained archive identity');
    $snapshotId = $capture['result']['snapshot_id'];
    $k['files']->writeExactFile('index.php', '<main>Later Studio work</main>');
    $snapshotReview = $history->restores->prepare($k['actor'], (object) ['request_id' => 'studio-snapshot-review', 'snapshot_id' => $snapshotId, 'domain' => 'draft']);
    $snapshotInput = ['operation_id' => 'studio-snapshot-restore', 'plan_id' => $snapshotReview['plan_id'], 'digest' => $snapshotReview['digest']];
    reject(fn() => $history->restoreSnapshot($k['actor'], 'legacy_1', $snapshotInput), 'idempotency_conflict', 'Studio restoration route cannot substitute a different reviewed archive');
    $restoredSnapshot = $history->restoreSnapshot($k['actor'], $snapshotId, $snapshotInput);
    while ($restoredSnapshot['status'] === 'applying') $restoredSnapshot = $history->restoreSnapshot($k['actor'], $snapshotId, $snapshotInput + ['checkpoint' => $restoredSnapshot['checkpoint']]);
    check($restoredSnapshot['status'] === 'succeeded' && str_contains($k['files']->readFile('index.php'), 'newer draft B')
        && SiteWorkspace::inventory($k['root'] . '/live') === $adapterLive, 'Studio explicit draft restoration uses sealed bytes and preserves the live website');
    check(CanonicalJson::digest($history->restoreSnapshot($k['actor'], $snapshotId, $snapshotInput)) === CanonicalJson::digest($restoredSnapshot),
        'Studio snapshot restore replay returns the original retained operation');
    if (function_exists('posix_kill')) {
        foreach (['after_capture', 'after_file', 'after_projection', 'after_commit'] as $phase) {
            $crashRoot = sys_get_temp_dir() . '/mcp-restore-crash-' . bin2hex(random_bytes(8));
            $process = proc_open([PHP_BINARY, __FILE__, '--crash', $phase, $crashRoot],
                [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
            fclose($pipes[0]); $output = stream_get_contents($pipes[1]); fclose($pipes[1]);
            $errors = stream_get_contents($pipes[2]); fclose($pipes[2]);
            $status = proc_get_status($process);
            for ($attempt = 0; $attempt < 100 && $status['running']; $attempt++) {
                usleep(10000);
                $status = proc_get_status($process);
            }
            proc_close($process);
            $crashRoot = realpath($crashRoot); $roots[] = $crashRoot;
            check($status['signaled'] && $status['termsig'] === SIGKILL && $errors === '',
                'Real process termination at ' . $phase . ($status['signaled'] ? '' : ' ' . json_encode($status) . ' ' . $errors . $output));
            $state = json_decode(file_get_contents($crashRoot . '/private/crash-state.json'), true, 64, JSON_THROW_ON_ERROR);
            $crashed = reopen($crashRoot);
            $op = $crashed['operations']->get($crashed['actor'], 'crash-restore-operation');
            if ($op['state'] !== 'succeeded') {
                $crashed['db']->update('agent_operations', ['lease_expires_at' => time() - 1], 'id = ?', [$op['id']]);
                $resumed = $crashed['restore']->continue($crashed['actor'], 'crash-restore-operation', $op['checkpoint_number']);
                $resumed = complete($crashed['restore'], $crashed['actor'], $resumed, 'crash-restore-operation');
            } else $resumed = apply($crashed, $state['plan'], 'crash-restore-operation');
            check($resumed['status'] === 'succeeded' && WorkspaceFiles::hashes(WorkspaceFiles::read($crashed['workspace'])) === $state['draft']
                && SiteWorkspace::inventory($crashRoot . '/live') === $state['live'], 'Retained continuation verifies both domains after ' . $phase);
            check($crashed['db']->count('revisions') === 1 && $crashed['db']->count('site_releases') === 3
                && $crashed['workspace']->status()['reservation_operation_id'] === null, 'Crash recovery commits exactly one restore revision and release after ' . $phase);
        }
    } else echo "SKIP process termination: posix_kill is unavailable.\n";
} finally {
    Database::resetInstance();
    foreach (['VS_TEST_PREVIEW_DIR', 'VS_TEST_DOC_ROOT', 'VS_TEST_ASSETS_DIR', 'VS_TEST_MUTATION_LOCK',
        'VS_TEST_WORKSPACE_STATE_DIR', 'VS_TEST_REVISIONS_DIR', 'VS_TEST_SNAPSHOT_DIR'] as $key) putenv($key);
    foreach ($roots as $root) removeFixture($root);
}
echo "MCP restore: $checks checks passed\n";
