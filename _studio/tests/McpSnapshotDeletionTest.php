<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/engine/bootstrap.php';
use VoxelSite\{Database, Logger, Migrator, Settings, SiteMutationLock, SiteWorkspace, SnapshotService, WebsiteHistoryService};
use VoxelSite\Agent\{ActorPolicy, CanonicalJson, JsonSchema, OperationActor, OperationException, OperationStore,
    ReleaseStore, SnapshotDeletionService, WorkspaceFiles};

$checks = 0; $roots = [];
function checkDeletion(bool $ok, string $label): void {
    global $checks; $checks++;
    if (!$ok) throw new RuntimeException('FAIL ' . $label);
    echo 'PASS ' . $label . "\n";
}
function rejectDeletion(callable $call, string $code, string $label): void {
    try { $call(); } catch (OperationException $error) { checkDeletion($error->errorCode === $code, $label . ' (' . $error->errorCode . ')'); return; }
    checkDeletion(false, $label);
}
function fixtureDeletion(?string $existing = null): array {
    global $roots;
    $root = $existing ?? realpath(sys_get_temp_dir()) . '/vs-snapshot-delete-' . bin2hex(random_bytes(8));
    if (!$existing) foreach (['draft/assets/css', 'live/assets', 'private/snapshots', 'private/legacy', 'private/actions'] as $dir) mkdir($root . '/' . $dir, 0700, true);
    if (realpath($root) !== $root || !str_starts_with($root, realpath(sys_get_temp_dir()) . '/vs-snapshot-delete-')) throw new RuntimeException('Canonical temporary root required.');
    $roots[] = $root;
    foreach (['VS_TEST_PREVIEW_DIR' => '/draft', 'VS_TEST_DOC_ROOT' => '/live', 'VS_TEST_ASSETS_DIR' => '/live/assets',
        'VS_TEST_MUTATION_LOCK' => '/private/site.lock', 'VS_TEST_WORKSPACE_STATE_DIR' => '/private/workspace',
        'VS_TEST_REVISIONS_DIR' => '/private/revisions', 'VS_TEST_SNAPSHOT_DIR' => '/private/legacy'] as $key => $path) putenv($key . '=' . $root . $path);
    foreach (['logDir' => $root . '/private', 'initialized' => true] as $key => $value) (new ReflectionProperty(Logger::class, $key))->setValue(null, $value);
    Database::resetInstance(); $db = Database::getInstance($root . '/private/studio.db');
    if (!$existing) {
        (new Migrator($db, new Settings($db)))->run();
        $db->insert('users', ['id' => 1, 'role' => 'owner', 'email' => 'owner@fixture.invalid', 'name' => 'Owner',
            'password_hash' => 'not-login', 'created_at' => now(), 'updated_at' => now()]);
        $db->update('site_workspace_state', ['format' => 2], 'id=1');
        file_put_contents($root . '/draft/.htaccess', SiteWorkspace::ACCESS_MARKER . "\nRequire all denied\nDeny from all\n");
        foreach (['index.php' => '<main>Draft</main>', 'about.php' => '<main>About</main>', 'assets/css/style.css' => ':root{--color:red;}'] as $path => $bytes) file_put_contents($root . '/draft/' . $path, $bytes);
        file_put_contents($root . '/live/index.php', 'Published');
    }
    $workspace = new SiteWorkspace($db, $root . '/draft', $root . '/live', $root . '/private/workspace', $root . '/live/assets');
    $policy = new ActorPolicy($db); $actor = new OperationActor('user', 1, null, [], 'studio_configured', null);
    $operations = new OperationStore($db, $policy, $workspace->mutationLockPath());
    $snapshots = new SnapshotService($db, $policy, $workspace, new ReleaseStore($db, $policy, $root . '/private/releases'),
        $operations, $root . '/private/snapshots', $root . '/private/legacy', $root . '/private/actions', 1);
    $deletions = $snapshots->deletions();
    return compact('root', 'db', 'workspace', 'policy', 'actor', 'operations', 'snapshots', 'deletions');
}
function finishDeletion(object $service, OperationActor $actor, array $operation): array {
    for ($i = 0; $operation['status'] === 'applying' && $i < 100; $i++) $operation = $service->continue($actor, $operation['operation_id'], $operation['checkpoint']);
    return $operation;
}
function captureDeletion(array $f, string $id): string {
    $op = finishDeletion($f['snapshots'], $f['actor'], $f['snapshots']->create($f['actor'], (object) ['operation_id' => $id, 'domain' => 'draft', 'label' => 'Manual']));
    if ($op['status'] !== 'succeeded') throw new RuntimeException(json_encode($op));
    return $op['result']['snapshot_id'];
}
function clearDeletion(string $root): void {
    if (is_link($root) || is_file($root)) { unlink($root); return; }
    if (!is_dir($root)) return;
    foreach (scandir($root) as $name) if ($name !== '.' && $name !== '..') clearDeletion($root . '/' . $name);
    rmdir($root);
}
if (($argv[1] ?? '') === '--crash') {
    $f = fixtureDeletion($argv[2]);
    $service = new SnapshotDeletionService($f['db'], $f['policy'], $f['workspace'], $f['operations'],
        $f['root'] . '/private/snapshots', $f['root'] . '/private/legacy', 1,
        static function (string $phase) { if ($phase === 'after_file') posix_kill(getmypid(), SIGKILL); });
    $service->delete($f['actor'], json_decode(file_get_contents($f['root'] . '/input.json')));
    exit(9);
}
try {
    $f = fixtureDeletion(); extract($f);
    $draft = WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)); $live = hash_file('sha256', $root . '/live/index.php');
    $id = captureDeletion($f, 'capture-delete-one');
    $review = $deletions->inspect($actor, (object) ['snapshot_id' => $id]);
    JsonSchema::validate(JsonSchema::output($review), $deletions::outputSchema());
    checkDeletion(!$review['protected'] && count($review['files']) === 3, 'Completed manual capture exposes exact deletion hashes');
    $input = (object) ['operation_id' => 'delete-capture-one', 'snapshot_id' => $id, 'version' => $review['version']];
    $op = $deletions->delete($actor, $input);
    checkDeletion($op['status'] === 'applying' && $op['checkpoint'] === 1, 'Large archive deletion advances a bounded checkpoint');
    checkDeletion(CanonicalJson::digest($deletions->delete($actor, $input)) === CanonicalJson::digest($op), 'A repeated start reads the same deletion checkpoint');
    $done = finishDeletion($deletions, $actor, $op);
    JsonSchema::validate(JsonSchema::output($done['result']), $deletions::resultSchema());
    checkDeletion($done['status'] === 'succeeded' && !is_dir($root . '/private/snapshots/' . $id), 'Deletion removes exact archive bytes and empty captured directories');
    checkDeletion(CanonicalJson::digest($deletions->delete($actor, $input)) === CanonicalJson::digest($done), 'A terminal deletion replays after its source is gone');
    checkDeletion($db->scalar('SELECT payload_json FROM agent_snapshot_deletions WHERE operation_id=?', [$input->operation_id]) === null
        && $db->scalar('SELECT deleted_at FROM agent_snapshot_deletions WHERE operation_id=?', [$input->operation_id]) !== null,
        'Deletion retains a tombstone and releases original recovery bytes after commit');
    checkDeletion(captureDeletion($f, 'capture-delete-one') === $id && !is_dir($root . '/private/snapshots/' . $id), 'Original capture replay never recreates a deleted archive');
    $changed = clone $input; $changed->version = str_repeat('0', 64);
    rejectDeletion(fn() => $deletions->delete($actor, $changed), 'idempotency_conflict', 'A deletion identity cannot change its reviewed version');
    checkDeletion(WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)) === $draft && hash_file('sha256', $root . '/live/index.php') === $live,
        'Archive deletion preserves current draft and published bytes');

    file_put_contents($root . '/private/legacy/old.zip', 'Bounded legacy archive bytes');
    $legacy = $db->insert('snapshots', ['filename' => 'old.zip', 'snapshot_type' => 'manual', 'label' => 'Old', 'description' => '', 'file_count' => 1, 'size_bytes' => 28, 'created_at' => now()]);
    $legacyId = 'legacy_' . $legacy;
    $legacyReview = $deletions->inspect($actor, (object) ['snapshot_id' => $legacyId]);
    file_put_contents($root . '/private/legacy/old.zip', 'Changed legacy archive');
    rejectDeletion(fn() => $deletions->delete($actor, (object) ['operation_id' => 'delete-stale-legacy', 'snapshot_id' => $legacyId, 'version' => $legacyReview['version']]),
        'content_conflict', 'Changed archive bytes invalidate deletion review');
    $legacyReview = $deletions->inspect($actor, (object) ['snapshot_id' => $legacyId]);
    $legacyDone = $deletions->delete($actor, (object) ['operation_id' => 'delete-legacy-valid', 'snapshot_id' => $legacyId, 'version' => $legacyReview['version']]);
    checkDeletion($legacyDone['status'] === 'succeeded' && !$db->count('snapshots') && !file_exists($root . '/private/legacy/old.zip'), 'Legacy deletion removes only its reviewed ZIP and row');

    $protected = captureDeletion($f, 'capture-delete-protected');
    $db->insert('agent_restore_plans', ['id' => 'restore_' . str_repeat('a', 32), 'actor_key' => $actor->identity(), 'user_id' => 1,
        'request_id' => 'protect-review', 'request_digest' => str_repeat('a', 64), 'snapshot_id' => $protected, 'domain' => 'draft',
        'status' => 'preparing', 'staged_bytes' => 0, 'created_at' => time(), 'expires_at' => time() + 900]);
    checkDeletion($deletions->inspect($actor, (object) ['snapshot_id' => $protected])['protected'], 'Even an interrupted restore preparation protects its source archive');
    rejectDeletion(fn() => $deletions->delete($actor, (object) ['operation_id' => 'delete-protected-capture', 'snapshot_id' => $protected, 'version' => str_repeat('0', 64)]),
        'snapshot_required_for_recovery', 'Referenced snapshot deletion fails before any mutation');
    foreach (['publish_', 'release_', 'safety_'] as $prefix) checkDeletion($deletions->inspect($actor, (object) ['snapshot_id' => $prefix . str_repeat('a', 32)])['protected'], 'Publication and recovery archive families remain protected: ' . $prefix);

    $crashId = captureDeletion($f, 'capture-delete-crash');
    $crashReview = $deletions->inspect($actor, (object) ['snapshot_id' => $crashId]);
    $crashInput = (object) ['operation_id' => 'delete-crash-operation', 'snapshot_id' => $crashId, 'version' => $crashReview['version']];
    file_put_contents($root . '/input.json', json_encode($crashInput));
    $process = proc_open([PHP_BINARY, __FILE__, '--crash', $root], [0 => ['pipe', 'r'], 1 => ['file', $root . '/child.log', 'a'], 2 => ['file', $root . '/child.log', 'a']], $pipes);
    fclose($pipes[0]); $exit = proc_close($process);
    $op = $operations->get($actor, $crashInput->operation_id);
    checkDeletion($exit !== 0 && $op['state'] === 'applying' && $op['recovery'] !== null, 'Real process termination retains deletion originals and reservation before the first unlink');
    $db->update('agent_operations', ['lease_expires_at' => time() - 1], 'id=?', [$op['id']]);
    $recovered = $deletions->recover($actor, $crashInput->operation_id);
    checkDeletion($recovered['status'] === 'failed_restored', 'Explicit recovery restores an interrupted archive deletion');
    checkDeletion($deletions->inspect($actor, (object) ['snapshot_id' => $crashId])['version'] === $crashReview['version'], 'Recovered archive matches the original exact version');

    $driftId = captureDeletion($f, 'capture-delete-drift');
    $driftReview = $deletions->inspect($actor, (object) ['snapshot_id' => $driftId]);
    $driftInput = (object) ['operation_id' => 'delete-with-drift', 'snapshot_id' => $driftId, 'version' => $driftReview['version']];
    $op = $deletions->delete($actor, $driftInput);
    $claimedId = $operations->get($actor, $driftInput->operation_id)['id'];
    $lock = SiteMutationLock::acquire($workspace->mutationLockPath(), $db, $claimedId);
    checkDeletion(SnapshotDeletionService::pruneTerminal($db, $workspace->mutationLockPath()) === 0,
        'Maintenance cannot remove recovery originals while an archive operation owns the reservation');
    unset($lock);
    $path = $driftReview['files'][0]['path']; file_put_contents($root . '/private/snapshots/' . $path, 'Third party replacement');
    $conflict = $deletions->continue($actor, $driftInput->operation_id, $op['checkpoint']);
    checkDeletion($conflict['status'] === 'recovery_required' && file_get_contents($root . '/private/snapshots/' . $path) === 'Third party replacement',
        'Unknown replacement bytes survive both deletion and automatic recovery');
    $lock = SiteMutationLock::acquire($workspace->mutationLockPath(), $db, $claimedId);
    checkDeletion(SnapshotDeletionService::pruneTerminal($db, $workspace->mutationLockPath()) === 0,
        'Unresolved deletion recovery preserves every retained original');
    unset($lock);
    unlink($root . '/private/snapshots/' . $path);
    checkDeletion($deletions->recover($actor, $driftInput->operation_id)['status'] === 'failed_restored', 'Reconciled drift permits explicit exact restoration');
    $lock = SiteMutationLock::acquire($workspace->mutationLockPath(), $db);
    checkDeletion(SnapshotDeletionService::pruneTerminal($db, $workspace->mutationLockPath()) === 0,
        'A recent restored receipt retains recovery evidence for its full retention window');
    $db->update('agent_operations', ['updated_at' => time() - OperationStore::RETENTION_SECONDS - 10], 'operation_id=?', [$crashInput->operation_id]);
    $operations->pruneResults(5);
    checkDeletion(SnapshotDeletionService::pruneTerminal($db, $workspace->mutationLockPath()) === 1
        && $db->scalar('SELECT payload_json FROM agent_snapshot_deletions WHERE operation_id=?', [$crashInput->operation_id]) === null,
        'Expired terminal receipt cleanup releases only its original bytes and keeps the identity tombstone');
    unset($lock);
    checkDeletion($deletions->delete($actor, $crashInput)['result_pruned'], 'Pruned deletion replay reports unavailable result without restarting deletion');
    $expiryId = captureDeletion($f, 'capture-delete-expired');
    $expiryReview = $deletions->inspect($actor, (object) ['snapshot_id' => $expiryId]);
    $expiryInput = (object) ['operation_id' => 'delete-expired-unstarted', 'snapshot_id' => $expiryId, 'version' => $expiryReview['version']];
    $interrupted = new SnapshotDeletionService($db, $policy, $workspace, $operations, $root . '/private/snapshots', $root . '/private/legacy', 1,
        static function (string $phase) { if ($phase === 'after_prepare') throw new RuntimeException('Preparation response interrupted'); });
    try { $interrupted->delete($actor, $expiryInput); } catch (RuntimeException $error) {
        if ($error->getMessage() !== 'Preparation response interrupted') throw $error;
    }
    $db->update('agent_operations', ['expires_at' => time() - 1], 'operation_id=?', [$expiryInput->operation_id]);
    $lock = SiteMutationLock::acquire($workspace->mutationLockPath(), $db);
    checkDeletion(SnapshotDeletionService::pruneTerminal($db, $workspace->mutationLockPath()) === 1,
        'Expired never-started deletion releases bounded preparation storage');
    unset($lock);
    checkDeletion($deletions->delete($actor, $expiryInput)['status'] === 'expired'
        && $deletions->inspect($actor, (object) ['snapshot_id' => $expiryId])['version'] === $expiryReview['version'],
        'Expired preparation keeps exact originals and cannot restart on identity replay');
    foreach ([
        'recovery' => ['recovery_json' => '{"uncertain_write":true}'],
        'lease' => ['lease_expires_at' => time() - 30],
        'checkpoint' => ['checkpoint_number' => 1],
    ] as $case => $state) {
        $guardedInput = clone $expiryInput;
        $guardedInput->operation_id = 'delete-retain-uncertain-' . $case;
        try { $interrupted->delete($actor, $guardedInput); } catch (RuntimeException $error) {
            if ($error->getMessage() !== 'Preparation response interrupted') throw $error;
        }
        $db->update('agent_operations', $state + ['expires_at' => time() - 1], 'operation_id=?', [$guardedInput->operation_id]);
        $lock = SiteMutationLock::acquire($workspace->mutationLockPath(), $db);
        checkDeletion(SnapshotDeletionService::pruneTerminal($db, $workspace->mutationLockPath()) === 0
            && $db->scalar('SELECT payload_json FROM agent_snapshot_deletions WHERE operation_id=?', [$guardedInput->operation_id]) !== null,
            'Expired preparation with ' . $case . ' evidence retains its exact originals');
        unset($lock);
    }
    $linkId = captureDeletion($f, 'capture-delete-link');
    $linkPath = $root . '/private/snapshots/' . $linkId . '/draft/index.php';
    unlink($linkPath); symlink($root . '/live/index.php', $linkPath);
    $refusedLink = false;
    try { $deletions->inspect($actor, (object) ['snapshot_id' => $linkId]); }
    catch (Throwable) { $refusedLink = true; }
    checkDeletion($refusedLink && hash_file('sha256', $root . '/live/index.php') === $live, 'Archive inspection refuses symlinks without following their target');
} finally {
    Database::resetInstance();
    foreach (array_unique($roots) as $root) clearDeletion($root);
}
echo $checks . " snapshot deletion checks passed.\n";
