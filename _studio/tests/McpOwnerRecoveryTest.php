<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';

require_once dirname(__DIR__) . '/engine/bootstrap.php';
require __DIR__ . '/fixtures/mcp/ServiceFixture.php';
use VoxelSite\{Database, FileManager, Logger, Migrator, Settings, SiteMutationLock, SiteWorkspace, StudioOwnerRecovery};
use VoxelSite\Agent\{ActorPolicy, AuthoringBriefService, BriefStore, CanonicalJson, ChangeSetExecutor, ChangeSetService,
    ChangeSetStore, ContextService, CredentialService, JsonSchema, OperationActor, OperationException, OperationStore,
    OwnerRecoveryService, PublishPlanService, ReleaseStore, WorkspaceFiles};

$checks = 0;
function checkOwner(bool $ok, string $label): void { global $checks; $checks++; if (!$ok) throw new RuntimeException('FAIL ' . $label); echo "PASS $label\n"; }
function rejectOwner(callable $fn, string $code, string $label): void {
    try { $fn(); } catch (OperationException $e) { checkOwner($e->errorCode === $code, "$label ({$e->errorCode})"); return; }
    checkOwner(false, $label);
}
function removeOwnerFixture(string $root): void {
    if (is_file($root) || is_link($root)) { unlink($root); return; }
    foreach (scandir($root) as $name) if (!in_array($name, ['.', '..'], true)) removeOwnerFixture($root . '/' . $name);
    rmdir($root);
}
$root = sys_get_temp_dir() . '/vs-owner-recovery-' . bin2hex(random_bytes(8));
foreach (['_studio/data/actions', '_studio/preview/assets', 'assets'] as $path) mkdir($root . '/' . $path, 0700, true);
$root = realpath($root);
if (!$root || !str_starts_with($root, realpath(sys_get_temp_dir()) . '/vs-owner-recovery-')
    || (new ReflectionMethod(FileManager::class, '__construct'))->getNumberOfParameters() < 2) throw new RuntimeException('Isolated workspace required.');
$studio = $root . '/_studio'; $data = $studio . '/data'; $private = $data . '/agent';
foreach (['VS_TEST_PREVIEW_DIR' => $studio . '/preview', 'VS_TEST_DOC_ROOT' => $root, 'VS_TEST_ASSETS_DIR' => $root . '/assets',
    'VS_TEST_MUTATION_LOCK' => $data . '/site.lock', 'VS_TEST_WORKSPACE_STATE_DIR' => $data . '/workspace',
    'VS_TEST_REVISIONS_DIR' => $studio . '/revisions', 'VS_TEST_SNAPSHOT_DIR' => $data . '/snapshots',
    'VS_TEST_ACTIONS_DIR' => $data . '/actions', 'VS_TEST_ACTION_SITE_DATA_PATH' => $studio . '/assets/data/site.json'] as $key => $value) putenv("$key=$value");
foreach (['logDir' => $data, 'initialized' => true] as $key => $value) (new ReflectionProperty(Logger::class, $key))->setValue(null, $value);
try {
    Database::resetInstance(); $db = Database::getInstance($data . '/studio.db');
    (new Migrator($db, new Settings($db)))->run();
    foreach ([1 => 'owner', 2 => 'editor', 3 => 'owner'] as $id => $role) $db->insert('users', ['id' => $id, 'email' => $id . '@fixture.invalid',
        'role' => $role, 'name' => 'Fixture', 'password_hash' => 'not-a-login', 'created_at' => now(), 'updated_at' => now()]);
    $db->update('site_workspace_state', ['format' => 2], 'id=1');
    file_put_contents($studio . '/preview/.htaccess', SiteWorkspace::ACCESS_MARKER . "\nRequire all denied\nDeny from all\n");
    mcpCopyFixture(__DIR__ . '/fixtures/mcp/site-lifecycle/site', $studio . '/preview');
    copy(dirname(__DIR__) . '/static/form-handler.js', $studio . '/preview/assets/js/form-handler.js');
    $workspace = new SiteWorkspace($db, $studio . '/preview', $root, $data . '/workspace', $root . '/assets');
    $files = new FileManager($db, $workspace);
    $files->writeFile('_partials/footer.php', file_get_contents($studio . '/preview/_partials/footer.php'));
    $files->syncPageRegistry(true); $baseVersion = $workspace->status()['draft_version'];
    $policy = new ActorPolicy($db); $owner = new OperationActor('user', 1, null, [], 'studio_configured', null);
    $otherOwner = new OperationActor('user', 3, null, [], 'studio_configured', null);
    $editor = new OperationActor('user', 2, null, [], 'studio_configured', null);
    $credentials = new CredentialService($db);
    $key = $credentials->create($owner, 2, 'edit', 'Original author', null); $actor = $policy->fromCredential($key['id']);
    $operations = new OperationStore($db, $policy, $workspace->mutationLockPath());
    $changes = new ChangeSetStore($db, $policy, $private . '/changes');
    $briefs = new BriefStore($db, $policy);
    $brief = (new AuthoringBriefService(new ContextService($db, $policy, $workspace), $briefs))
        ->create($actor, ['request_id' => 'owner-recovery-brief', 'action' => 'edit_page']);
    $edits = [];
    foreach (['index.php', 'about.php'] as $path) {
        $content = file_get_contents($studio . '/preview/' . $path);
        $edits[] = (object) ['type' => 'replace', 'path' => $path, 'expected_hash' => hash('sha256', $content),
            'content' => str_replace('</section>', '<p>Retained interrupted edit.</p></section>', $content)];
    }
    $plan = (new ChangeSetService($db, $policy, $workspace, $briefs, $changes))->prepare($actor, (object) [
        'request_id' => 'owner-recovery-plan', 'base_draft_version' => 'draft:' . $baseVersion, 'brief_id' => $brief['brief_id'],
        'summary' => 'Interrupted fixture edits', 'operations' => $edits]);
    $before = WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)); $pagesBefore = $db->query('SELECT * FROM pages ORDER BY id');
    $executor = new ChangeSetExecutor($db, $policy, $workspace, $changes, $operations, 1);
    $partial = $executor->apply($actor, (object) ['operation_id' => 'owner-recovery-apply', 'change_set_id' => $plan['change_set_id'], 'digest' => $plan['digest']]);
    checkOwner($partial['status'] === 'applying', 'Real executor stops at a retained file checkpoint');
    $op = $operations->get($actor, $partial['operation_id']); $originalActor = $op['actor'];
    $db->update('studio_mcp_credentials', ['revoked_at' => time()], 'key_id=?', [$key['id']]);
    $db->update('users', ['disabled_at' => now()], 'id=2');
    rejectOwner(fn() => $executor->continue($actor, $op['operation_id'], $partial['checkpoint']), 'permission_denied', 'Revoked removed actor cannot resume');
    $service = StudioOwnerRecovery::create($db, $workspace);
    rejectOwner(fn() => $service->list($actor), 'permission_denied', 'MCP credential cannot invoke owner recovery');
    rejectOwner(fn() => $service->list($editor), 'permission_denied', 'Non-owner session cannot invoke owner recovery');
    $databaseBeforeRead = hash_file('sha256', $data . '/studio.db'); $filesBeforeRead = WorkspaceFiles::hashes(WorkspaceFiles::read($workspace));
    $listing = $service->list($owner); $inspection = $service->inspect($owner, $op['id']);
    checkOwner(count($listing['items']) === 1 && $inspection['eligible'] && count($inspection['paths']) >= 2, 'Current owner sees exact interrupted paths after actor revocation');
    checkOwner($db->count('agent_owner_recovery_reviews') === 0 && hash_file('sha256', $data . '/studio.db') === $databaseBeforeRead
        && WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)) === $filesBeforeRead, 'List and inspect never write receipts or restore files');
    checkOwner(!str_contains(CanonicalJson::encode($listing), $root) && !str_contains(CanonicalJson::encode($listing), '<p>'), 'Recovery views exclude absolute paths and source content');
    $review = $service->review($owner, $op['id']);
    rejectOwner(fn() => $service->recover($otherOwner, $op['id'], $review['review_id'], $review['digest']), 'permission_denied', 'Recovery review is bound to the reviewing owner');
    $path = $inspection['paths'][0]['path']; $target = $workspace->resolveDraft($path, true); $partialBytes = file_get_contents($target);
    file_put_contents($target, 'Unrelated external bytes');
    rejectOwner(fn() => $service->recover($owner, $op['id'], $review['review_id'], $review['digest']), 'content_conflict', 'After-review external drift blocks all recovery');
    checkOwner(file_get_contents($target) === 'Unrelated external bytes' && !$service->inspect($owner, $op['id'])['eligible'], 'Conflicting external bytes remain unchanged');
    file_put_contents($target, $partialBytes);
    $outside = $root . '/outside-fixture.txt'; file_put_contents($outside, 'Outside bytes');
    unlink($target); symlink($outside, $target);
    checkOwner(!$service->inspect($owner, $op['id'])['eligible'] && file_get_contents($outside) === 'Outside bytes', 'Recovery refuses symlink targets without following or changing them');
    unlink($target); file_put_contents($target, $partialBytes); unlink($outside);
    $db->update('agent_owner_recovery_reviews', ['expires_at' => time() - 1], 'id=?', [$review['review_id']]);
    rejectOwner(fn() => $service->recover($owner, $op['id'], $review['review_id'], $review['digest']), 'review_expired', 'Expired owner reviews cannot authorize rollback');
    $review = $service->review($owner, $op['id']);
    $db->update('users', ['role' => 'editor'], 'id=1');
    rejectOwner(fn() => $service->recover($owner, $op['id'], $review['review_id'], $review['digest']), 'permission_denied', 'Owner role is checked again at recovery time');
    $db->update('users', ['role' => 'owner'], 'id=1');
    $backup = $changes->stagingRoot($plan['change_set_id']) . '/before/' . $path;
    $backupBytes = file_get_contents($backup); file_put_contents($backup, 'Corrupt retained original');
    $incomplete = $service->recover($owner, $op['id'], $review['review_id'], $review['digest']);
    checkOwner($incomplete['status'] === 'recovery_required' && $workspace->status()['reservation_operation_id'] === $op['id'],
        'Unavailable original bytes retain an explicit recovery-required reservation');
    $review = $service->review($owner, $op['id']);
    $repeated = $service->recover($owner, $op['id'], $review['review_id'], $review['digest']);
    checkOwner($repeated['status']==='recovery_required' && CanonicalJson::digest($repeated['original_outcome'])
        ===CanonicalJson::digest(['error'=>$incomplete['error'],'restoration'=>$incomplete['restoration']]), 'Repeated owner recovery preserves the first incomplete restoration result');
    file_put_contents($backup, $backupBytes);
    $review = $service->review($owner, $op['id']);
    $restored = $service->recover($owner, $op['id'], $review['review_id'], $review['digest']);
    JsonSchema::validate(JsonSchema::output($restored), OwnerRecoveryService::resultSchema());
    JsonSchema::validate(JsonSchema::output(\VoxelSite\Agent\OperationRunner::publicState($operations->ownerRecoveryGet($owner,$op['id']))),
        \VoxelSite\Agent\CapabilityCatalog::core()->get('voxelsite_operations_get')->outputSchema);
    checkOwner($restored['status'] === 'failed_restored' && $restored['resumed'] === false, 'Owner recovery only rolls back the interrupted operation');
    checkOwner($restored['original_outcome']===$repeated['original_outcome'] && $restored['original_outcome']['restoration']['restored']===false,
        'Successful owner recovery preserves the original failure separately from verified current restoration');
    checkOwner(WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)) === $before
        && $db->query('SELECT * FROM pages ORDER BY id') === $pagesBefore && $workspace->status()['draft_version'] === $baseVersion, 'Original bytes and metadata remain exact');
    checkOwner($restored['original_actor'] === $originalActor && $restored['recovered_by'] === 1
        && $operations->ownerRecoveryGet($owner, $op['id'])['actor'] === $originalActor, 'Original requester and recovering owner are retained separately');
    checkOwner($workspace->status()['reservation_operation_id'] === null, 'Verified rollback releases the retained reservation');
    checkOwner(CanonicalJson::digest($service->recover($owner, $op['id'], $review['review_id'], $review['digest'])) === CanonicalJson::digest($restored), 'Lost recovery response replays the exact receipt');

    // Real publication archives exercise published path resolution and preserve draft state.
    (new Settings($db))->set('site_url', 'https://fixture.invalid');
    $publish = new PublishPlanService($db, $policy, $workspace, new ReleaseStore($db, $policy, $private . '/releases'), $operations, filesPerStep: 1);
    $publishPlan = $publish->prepare($owner, (object) ['request_id' => 'owner-publish-plan', 'base_draft_version' => 'draft:' . $baseVersion]);
    $published = $publish->publish($owner, (object) ['operation_id' => 'owner-publish-interrupted', 'plan_id' => $publishPlan['plan_id'], 'digest' => $publishPlan['digest']]);
    checkOwner($published['status'] === 'applying', 'Publication uses an actual sealed recovery archive');
    $publishOp = $operations->get($owner, $published['operation_id']);
    $publishReview = $service->review($owner, $publishOp['id']);
    checkOwner(count(array_filter($publishReview['paths'], fn($path) => $path['domain'] !== 'published')) === 0, 'Publish recovery lists only managed published paths');
    $publishRestored = $service->recover($owner, $publishOp['id'], $publishReview['review_id'], $publishReview['digest']);
    checkOwner($publishRestored['status'] === 'failed_restored' && WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)) === $before
        && !file_exists($root . '/index.php'), 'Published rollback preserves draft files and removes only the partial release');

    $mail = $operations->prepare($owner, 'owner-mail-unknown', 'mail.test', (object) ['recipient' => 'owner@fixture.invalid'], 'mail:fixture');
    $lock = SiteMutationLock::acquire($workspace->mutationLockPath(), $db, $mail['id']);
    $claimed = $operations->claim($owner, $mail['operation_id'], 0);
    $db->insert('agent_mail_dispatches', ['operation_internal_id' => $mail['id'], 'recipient' => 'owner@fixture.invalid',
        'configuration_version' => str_repeat('a', 64), 'state' => 'dispatching', 'started_at' => time()]);
    unset($lock);
    checkOwner(!$service->inspect($owner, $mail['id'])['eligible'], 'A live worker lease cannot be taken over by the owner');
    $db->update('agent_operations', ['lease_expires_at' => time() - 1], 'id=?', [$mail['id']]);
    $mailReview = $service->review($owner, $mail['id']);
    checkOwner($mailReview['action'] === 'acknowledge_delivery' && $mailReview['delivery_intent']['delivery_status'] === 'unknown', 'Mail review discloses uncertain delivery and never offers rollback');
    $ack = $service->recover($owner, $mail['id'], $mailReview['review_id'], $mailReview['digest']);
    JsonSchema::validate(JsonSchema::output($ack), OwnerRecoveryService::resultSchema());
    checkOwner($ack['status'] === 'succeeded' && $ack['acknowledged'] && $ack['delivery_status'] === 'unknown'
        && $ack['restoration']['restored'] === false && $workspace->status()['reservation_operation_id'] === null,
        'Owner acknowledgement closes uncertain mail without claiming restored or delivered mail');
    checkOwner($db->scalar('SELECT state FROM agent_mail_dispatches WHERE operation_internal_id=?', [$mail['id']]) === 'unknown', 'Dispatch receipt remains unknown without any send callback');
    checkOwner(CanonicalJson::digest($service->recover($owner, $mail['id'], $mailReview['review_id'], $mailReview['digest'])) === CanonicalJson::digest($ack), 'Mail acknowledgement replay is retained without another send');
    $snapshots = new VoxelSite\SnapshotService($db, $policy, $workspace, new ReleaseStore($db, $policy, $private . '/releases'),
        $operations, $private . '/snapshots', $data . '/snapshots', $data . '/actions', 1);
    $capture = $snapshots->create($owner, (object) ['operation_id' => 'owner-capture-interrupted', 'domain' => 'draft', 'label' => 'Partial fixture']);
    $captureOp = $operations->get($owner, $capture['operation_id']);
    $captureReview = $service->review($owner, $captureOp['id']);
    $captureResult = $service->recover($owner, $captureOp['id'], $captureReview['review_id'], $captureReview['digest']);
    checkOwner($captureResult['status'] === 'failed_restored' && $captureReview['paths'] === []
        && $db->scalar('SELECT status FROM site_snapshot_captures WHERE id=?', [$captureOp['preparation_id']]) === 'failed',
        'Private snapshot recovery fails only its incomplete capture without changing website bytes');
    $actions = new VoxelSite\Agent\ActionService($db, $policy, $workspace, $data . '/actions', $root . '/_data/actions.db',
        $studio . '/assets/data/site.json', $studio . '/action-templates');
    $businessId = 'business_' . bin2hex(random_bytes(16)); $actionBefore = '{"id":"fixture","name":"Before"}'; $actionAfter = '{"id":"fixture","name":"After"}';
    file_put_contents($data . '/actions/fixture.json', $actionAfter);
    $db->insert('agent_business_changes', ['id' => $businessId, 'actor_key' => $actor->identity(), 'user_id' => 2,
        'site_key' => $actions->siteKey(), 'request_id' => 'owner-action-interrupted', 'request_digest' => CanonicalJson::digest('fixture'),
        'status' => 'prepared', 'payload_json' => CanonicalJson::encode([['root' => $data . '/actions', 'path' => 'fixture.json', 'before' => $actionBefore, 'after' => $actionAfter]]),
        'result_json' => '{}', 'created_at' => time(), 'actor_json' => CanonicalJson::encode($originalActor), 'action_kind' => 'action.save']);
    $actionView = $service->inspect($owner, $businessId);
    checkOwner($actionView['eligible'] && $db->scalar('SELECT recovery_digest FROM agent_business_changes WHERE id=?', [$businessId]) === null,
        'Unified Action inspection is pure and excludes receipt creation');
    $actionReview = $service->review($owner, $businessId);
    $actionRecovered = $service->recover($owner, $businessId, $actionReview['review_id'], $actionReview['digest']);
    checkOwner($actionRecovered['status'] === 'failed_restored' && file_get_contents($data . '/actions/fixture.json') === $actionBefore
        && $actionRecovered['original_actor'] === $originalActor, 'Unified owner Action recovery restores original immediate configuration with original attribution');
    checkOwner($service->list($owner)['items'] === [], 'Resolved owner recoveries leave no active operation');
    if (in_array('--http', $argv, true)) {
        $httpOp = $operations->prepare($owner, 'owner-http-interrupted', 'settings.update', (object) ['fixture' => true], 'fixture');
        $lock = SiteMutationLock::acquire($workspace->mutationLockPath(), $db, $httpOp['id']);
        $claimed=$operations->claim($owner, $httpOp['operation_id'], 0);
        $httpFailure=['provider_calls'=>0,'error'=>['code'=>'fixture_failure','message'=>'Original interrupted fixture'],
            'restoration'=>['restored'=>false,'remaining_paths'=>['fixture']]];
        $operations->finish($owner,$httpOp['operation_id'],$claimed['lease_token'],'recovery_required',$httpFailure);
        unset($lock);
        $db->update('users', ['disabled_at' => null], 'id=2');
        foreach ([1, 2] as $userId) $db->insert('sessions', ['id' => str_repeat((string) $userId, 64), 'user_id' => $userId,
            'ip_address' => '127.0.0.1', 'user_agent' => 'fixture', 'expires_at' => gmdate('c', time() + 3600), 'created_at' => now()]);
        \VoxelSite\Tests\StudioRuntimeFixture::copy($root);
        file_put_contents($data . '/config.json', json_encode(['app_key' => VoxelSite\Encryption::generateKey()]));
        $socket = stream_socket_server('tcp://127.0.0.1:0', $errno, $error);
        if (!$socket) throw new RuntimeException('Loopback test socket unavailable: ' . $error);
        $port = (int) substr(strrchr(stream_socket_get_name($socket, false), ':'), 1); fclose($socket);
        $server = proc_open([PHP_BINARY, '-S', '127.0.0.1:' . $port, '-t', $root],
            [['pipe', 'r'], ['file', $root . '/server.log', 'a'], ['file', $root . '/server.log', 'a']], $pipes, $root);
        fclose($pipes[0]);
        $http = function (string $method, string $path, ?array $body = null, int $user = 1, bool $csrf = true) use ($port): array {
            $curl = curl_init('http://127.0.0.1:' . $port . '/_studio/api/router.php?_path=' . rawurlencode($path));
            $headers = ['Content-Type: application/json', 'Cookie: vs_session=' . str_repeat((string) $user, 64)];
            if ($csrf) $headers[] = 'X-VS-Token: ' . str_repeat((string) $user, 64);
            curl_setopt_array($curl, [CURLOPT_CUSTOMREQUEST => $method, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_HTTPHEADER => $headers]);
            if ($body !== null) curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($body ?: new stdClass()));
            $raw = curl_exec($curl);
            return ['status' => curl_getinfo($curl, CURLINFO_HTTP_CODE), 'body' => json_decode((string) $raw, true)];
        };
        try {
            for ($i = 0; $i < 50; $i++) { if ($probe = @fsockopen('127.0.0.1', $port, $errno, $error, .1)) { fclose($probe); break; } usleep(20000); }
            $base = '/settings/recovery/' . $httpOp['id'];
            checkOwner($http('GET', '/settings/recovery')['status'] === 200, 'Real Studio router lists recovery under an active reservation');
            checkOwner($http('GET', '/settings/recovery', null, 2)['status'] === 403, 'Real Studio router preserves owner-only inspection');
            checkOwner($http('POST', $base . '/review', [], 1, false)['status'] === 403, 'Recovery review requires Studio CSRF protection');
            $httpReview = $http('POST', $base . '/review', []);
            checkOwner($httpReview['status'] === 200 && isset($httpReview['body']['data']['digest']), 'Explicit HTTP review reaches the reservation-aware service');
            $reviewData = $httpReview['body']['data'];
            $body = ['review_id' => $reviewData['review_id'], 'digest' => $reviewData['digest']];
            checkOwner($http('POST', $base . '/restore', $body, 1, false)['status'] === 403, 'Recovery application requires Studio CSRF protection');
            $httpDone = $http('POST', $base . '/restore', $body);
            checkOwner($httpDone['status'] === 200 && $httpDone['body']['data']['status'] === 'failed_restored', 'HTTP owner recovery completes through its retained service');
            checkOwner(CanonicalJson::digest($httpDone['body']['data']['original_outcome'])
                ===CanonicalJson::digest(['error'=>$httpFailure['error'],'restoration'=>$httpFailure['restoration']]), 'HTTP owner recovery retains the original incomplete failure truth');
            checkOwner(CanonicalJson::digest($http('POST', $base . '/restore', $body)['body']) === CanonicalJson::digest($httpDone['body']),
                'HTTP lost-response replay preserves the exact owner receipt');
        } finally { proc_terminate($server); proc_close($server); }
    }
} finally {
    Database::resetInstance();
    removeOwnerFixture($root);
}
echo "Owner recovery: $checks checks passed\n";
