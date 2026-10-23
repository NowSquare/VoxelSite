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

try {
    $f = fixture();
    $appKey = VoxelSite\Encryption::generateKey();
    $sends = 0;
    $service = new VoxelSite\Agent\SettingsService($f['db'], $f['policy'], $f['workspace'], $f['operations'], $appKey,
        function (string $recipient) use (&$sends): array { $sends++; return ['success' => true, 'driver' => 'fixture']; });
    $identity = $service->read($f['actor'], (object) ['group' => 'identity']);
    $input = (object) ['operation_id' => 'settings-identity-change', 'group' => 'identity', 'version' => $identity['version'], 'values' => (object) ['site_name' => 'Fixture Site']];
    $result = $service->update($f['actor'], $input);
    check($result['status'] === 'succeeded' && (new Settings($f['db']))->get('site_name') === 'Fixture Site', 'Typed settings update commits through one retained operation');
    check(CanonicalJson::digest($service->update($f['actor'], $input)) === CanonicalJson::digest($result), 'Typed settings retry returns the original result');
    reject(fn() => $service->update($f['editor'], $input), 'permission_denied', 'Owner settings cannot be changed by editor authority');
    $provider = $service->read($f['actor'], (object) ['group' => 'provider']);
    $secret = 'sk-test-provider-secret-1234567890';
    $secretInput = (object) ['operation_id' => 'settings-secret-change', 'group' => 'provider', 'version' => $provider['version'], 'values' => (object) ['ai_openai_api_key' => $secret]];
    $saved = $service->update($f['actor'], $secretInput);
    $read = $service->read($f['actor'], (object) ['group' => 'provider']);
    check($saved['status'] === 'succeeded' && $read['configured']->ai_openai_api_key === true && !str_contains(json_encode($read), $secret), 'Provider secrets read only as configured metadata');
    $op = $f['operations']->get($f['actor'], 'settings-secret-change');
    check(!str_contains(json_encode($op), $secret) && !str_contains(json_encode($op), (new Settings($f['db']))->get('ai_openai_api_key')), 'Retained operations contain neither secret plaintext nor encrypted key material');
    check((new VoxelSite\Encryption($appKey))->decrypt((new Settings($f['db']))->get('ai_openai_api_key')) === $secret, 'Write-only provider secret is encrypted using the existing format');
    check($sends === 0, 'Configuration and provider reads make no test or discovery calls');
    foreach (['read', 'update', 'mail_test'] as $method) JsonSchema::assertSupported($service::inputSchema($method));
    JsonSchema::assertSupported($service::outputSchema());
    foreach ($service::groups() as $group) JsonSchema::validate(JsonSchema::output($service->read($f['actor'], (object) ['group' => $group])), $service::outputSchema());
    check(true, 'Every typed group emits only its declared public schema');
    $changedSecret = clone $secretInput; $changedSecret->values = (object) ['ai_openai_api_key' => $secret . '-changed'];
    reject(fn() => $service->update($f['actor'], $changedSecret), 'idempotency_conflict', 'Secret changes cannot reuse an existing operation identity');
    $stale = clone $input; $stale->operation_id = 'settings-stale-change'; $stale->values = (object) ['site_name' => 'Stale'];
    check($service->update($f['actor'], $stale)['status'] === 'failed_restored' && (new Settings($f['db']))->get('site_name') === 'Fixture Site',
        'Stale setting versions leave current values intact');
    $bad = clone $input; $bad->operation_id = 'settings-mixed-invalid'; $bad->values = (object) ['site_name' => 'Never saved', 'installed_at' => 'bad'];
    reject(fn() => $service->update($f['actor'], $bad), 'invalid_schema', 'Unlisted settings reject the complete request before any write');
    $batchVersions = [];
    foreach (['provider', 'model_limits'] as $group) $batchVersions[$group] = $service->read($f['actor'], (object) ['group' => $group])['version'];
    $batch = ['ai_openai_compatible_base_url' => 'http://localhost:11434', 'ai_openai_compatible_model_limits' => ['base_url' => 'http://localhost:11434', 'models' => ['fixture' => ['context_window' => 32768, 'max_output_tokens' => 4096]]]];
    $batchResult = $service->updateStudio($f['actor'], 'settings-multi-group', $batch, $batchVersions);
    check($batchResult['status'] === 'succeeded' && (new Settings($f['db']))->get('ai_openai_compatible_model_limits')['models']['fixture']['max_output_tokens'] === 4096,
        'Studio saves related typed groups in one validated transaction');
    check(CanonicalJson::digest($service->updateStudio($f['actor'], 'settings-multi-group', $batch, $batchVersions)) === CanonicalJson::digest($batchResult), 'Studio configuration replay retains the complete grouped request');
    $favicon = new VoxelSite\Agent\FaviconService($f['db'], $f['policy'], $f['workspace'], $f['operations']);
    $png = file_get_contents(__DIR__ . '/fixtures/mcp/site-lifecycle/site/assets/images/workshop.png');
    $ico = pack('vvv', 0, 1, 1) . pack('CCCCvvVV', 32, 24, 0, 0, 1, 32, strlen($png), 22) . $png;
    $faviconBefore = $favicon->read($f['actor']); $draftBeforeIcon = WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace']));
    $icon = $favicon->updateBytes($f['actor'], 'favicon-live-configuration', $faviconBefore['version'], $ico);
    check($icon['status'] === 'succeeded' && $icon['result']['effect'] === 'live_configuration'
        && file_get_contents($f['workspace']->publishedRoot() . '/favicon.ico') === $ico
        && WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace'])) === $draftBeforeIcon, 'Favicon update changes the fixed live configuration path and preserves draft bytes');
    check(CanonicalJson::digest($favicon->updateBytes($f['actor'], 'favicon-live-configuration', $faviconBefore['version'], $ico)) === CanonicalJson::digest($icon), 'Favicon replay retains exact reviewed bytes');
    reject(fn() => $favicon->updateBytes($f['editor'], 'favicon-editor-denied', $icon['result']['version'], $ico), 'permission_denied', 'Live favicon remains owner configuration');
    $faviconRelease = publish($f,'favicon-release-before');
    check($faviconRelease['status']==='succeeded' && file_get_contents($f['workspace']->publishedRoot().'/favicon.ico')===$ico,
        'Website publication preserves the independently configured live favicon');
    $faviconSnapshotInput = (object)['operation_id'=>'favicon-domain-snapshot','domain'=>'both','label'=>'Website domains exclude live favicon configuration'];
    $faviconSnapshot = complete($f['snapshots'],$f['actor'],$f['snapshots']->create($f['actor'],$faviconSnapshotInput),$faviconSnapshotInput->operation_id);
    $faviconArchive = $f['snapshots']->read($f['actor'],$faviconSnapshot['result']['snapshot_id']);
    check($faviconSnapshot['status']==='succeeded' && !isset($faviconArchive['domains']['published']['files']['favicon.ico']),
        'Both-domain website snapshots omit live favicon bytes');
    $removedIcon = $favicon->delete($f['actor'], (object) ['operation_id' => 'favicon-delete-reviewed', 'version' => $icon['result']['version']]);
    check($removedIcon['status'] === 'succeeded' && !file_exists($f['workspace']->publishedRoot() . '/favicon.ico'), 'Favicon deletion verifies its reviewed version');
    $f['files']->writeExactFile('index.php','<h1>Website after favicon removal</h1>');
    $faviconLaterRelease = publish($f,'favicon-release-after');
    $faviconRollbackPlan = $f['restore']->prepare($f['actor'],(object)['request_id'=>'favicon-rollback-review',
        'snapshot_id'=>$faviconSnapshot['result']['snapshot_id'],'domain'=>'both']);
    $faviconRollback = apply($f,$faviconRollbackPlan,'favicon-website-rollback');
    check($faviconLaterRelease['status']==='succeeded' && $faviconRollback['status']==='succeeded'
        && !file_exists($f['workspace']->publishedRoot().'/favicon.ico') && $favicon->read($f['actor'])['configured']===false,
        'A later publication and website rollback preserve the newer live favicon removal');
    $studio = new VoxelSite\StudioConfigurationService($f['db'], $f['workspace'], $appKey);
    $studioRead = $studio->readSettings($f['actor']);
    check(isset($studioRead['versions']['mail'], $studioRead['group_keys']['provider']) && !str_contains(json_encode($studioRead), $secret), 'Studio settings adapter exposes reviewed groups without stored secrets');
    $mail = $service->read($f['actor'], (object) ['group' => 'mail']);
    $service->update($f['actor'], (object) ['operation_id' => 'settings-mail-config', 'group' => 'mail', 'version' => $mail['version'],
        'values' => (object) ['mail.driver' => 'php_mail', 'mail.from_address' => 'fixture@example.invalid']]);
    $mail = $service->read($f['actor'], (object) ['group' => 'mail']);
    $testMail = (object) ['operation_id' => 'mail-test-accepted', 'recipient' => 'owner@example.invalid', 'configuration_version' => $mail['version']];
    $accepted = $service->testMail($f['actor'], $testMail);
    check($accepted['status'] === 'succeeded' && $accepted['result']['delivery_status'] === 'accepted' && $sends === 1,
        'Explicit mail test discloses transport acceptance without claiming inbox delivery');
    check(CanonicalJson::digest($service->testMail($f['actor'], $testMail)) === CanonicalJson::digest($accepted) && $sends === 1,
        'Retrying an acknowledged mail test never sends a second message');
    $uncertainId = 'mail-test-interrupted';
    $op = $f['operations']->prepare($f['actor'], $uncertainId, 'mail.test',
        (object) ['recipient' => 'owner@example.invalid', 'configuration_version' => $mail['version'], 'external_send' => true], $mail['version']);
    $lock = VoxelSite\SiteMutationLock::acquire($f['workspace']->mutationLockPath(), $f['db'], $op['id']);
    $op = $f['operations']->claim($f['actor'], $uncertainId, 0);
    $f['db']->insert('agent_mail_dispatches', ['operation_internal_id' => $op['id'], 'recipient' => 'owner@example.invalid',
        'configuration_version' => $mail['version'], 'state' => 'dispatching', 'started_at' => time()]);
    $f['db']->update('agent_operations', ['lease_expires_at' => time() - 1], 'id = ?', [$op['id']]);
    unset($lock);
    $uncertain = $service->continue($f['actor'], $uncertainId, 0);
    check($uncertain['status'] === 'succeeded' && $uncertain['result']['delivery_status'] === 'unknown' && $sends === 1,
        'An interrupted send intent returns unknown without replaying external delivery');
    mkdir($f['root'] . '/private/logs', 0700);
    $diagnostics = new VoxelSite\Agent\DiagnosticsService($f['db'], $f['policy'], $f['workspace'], $f['operations'],
        $f['root'] . '/private/logs', $appKey);
    foreach (['system', 'usage', 'history', 'conversations', 'conversation', 'logs', 'log_read', 'mail_log'] as $method) {
        JsonSchema::assertSupported($diagnostics::inputSchema($method));
        JsonSchema::assertSupported($diagnostics::outputSchema($method));
    }
    $logText = "Configured key: $secret\nAuthorization: Bearer arbitrary-access-token\npassword=\"words separated by spaces\"\n";
    file_put_contents($f['root'] . '/private/logs/system.log', $logText);
    $logs = $diagnostics->logs($f['actor'], (object) ['limit' => 20]);
    $log = $diagnostics->readLog($f['actor'], (object) ['file' => 'system.log', 'offset' => 0, 'max_bytes' => 4096]);
    JsonSchema::validate(JsonSchema::output($logs), $diagnostics::outputSchema('logs'));
    JsonSchema::validate(JsonSchema::output($log), $diagnostics::outputSchema('log_read'));
    check(!str_contains($log['content'], $secret) && !str_contains($log['content'], 'arbitrary-access-token')
        && !str_contains($log['content'], 'separated by spaces'), 'Diagnostic text redacts configured secrets, authorization, and quoted passwords');
    check(file_get_contents($f['root'] . '/private/logs/system.log') === $logText, 'Log reads do not rewrite their source');
    check(!str_contains($diagnostics->exportLog($f['actor'], 'system.log'), $secret), 'Log download uses identical full-source redaction');
    reject(fn() => $diagnostics->readLog($f['editor'], (object) ['file' => 'system.log', 'offset' => 0, 'max_bytes' => 4096]),
        'permission_denied', 'Diagnostics logs preserve owner-only access');
    file_put_contents($f['root'] . '/private/logs/system.log', $logText . 'Changed');
    reject(fn() => $diagnostics->readLog($f['actor'], (object) ['file' => 'system.log', 'offset' => 1, 'max_bytes' => 4096, 'version' => $log['version']]),
        'content_conflict', 'Changed diagnostic logs invalidate byte continuation');
    foreach ([1, 2] as $userId) $f['db']->insert('prompt_log', ['user_id' => $userId, 'user_prompt' => 'Private prompt ' . $secret,
        'ai_response' => '<message>Result ' . $secret . '</message>', 'ai_provider' => 'openai', 'ai_model' => 'fixture-model',
        'status' => 'streaming', 'created_at' => '2000-01-01T00:00:00Z', 'tokens_input' => 10, 'tokens_output' => 20]);
    $beforeDiagnostics = WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace']));
    $historyRead = $diagnostics->history($f['actor'], (object) ['limit' => 20, 'max_bytes' => 4096]);
    JsonSchema::validate(JsonSchema::output($historyRead), $diagnostics::outputSchema('history'));
    check(count($historyRead['history']) === 1 && $historyRead['history'][0]['interrupted']
        && !str_contains(json_encode($historyRead), $secret), 'History is owner-scoped, redacted, and identifies interrupted generation without running it');
    check($f['db']->count('prompt_log', "status = 'streaming'") === 2
        && WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace'])) === $beforeDiagnostics,
        'History reads never repair files, advance statuses, or compile CSS');
    $f['db']->insert('conversations', ['id' => 'diagnostic-conversation', 'user_id' => 1,
        'title' => 'Private ' . $secret, 'created_at' => now(), 'updated_at' => now()]);
    $f['db']->update('prompt_log', ['conversation_id' => 'diagnostic-conversation'], 'user_id=1');
    $detailInput = (object) ['conversation_id' => 'diagnostic-conversation', 'limit' => 20, 'max_bytes' => 8192];
    $detail = $diagnostics->conversation($f['actor'], $detailInput);
    JsonSchema::validate(JsonSchema::output($detail), $diagnostics::outputSchema('conversation'));
    check(count($detail['conversation']['prompts']) === 1 && $detail['conversation']['prompts'][0]['interrupted']
        && !str_contains(json_encode($detail), $secret) && $detail['conversation']['pagination']['total'] === 1,
        'Conversation detail shares bounded redacted history and truthful pagination');
    reject(fn() => $diagnostics->conversation($f['editor'], $detailInput), 'not_found', 'Conversation detail cannot cross account ownership');
    check($f['db']->count('prompt_log', "status = 'streaming'") === 2
        && WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace'])) === $beforeDiagnostics,
        'Conversation detail is a pure read, including interrupted generation');
    $originalPrompt = $f['db']->queryOne('SELECT user_prompt,ai_response FROM prompt_log WHERE user_id=1');
    $f['db']->update('prompt_log', ['user_prompt' => str_repeat("\x01", 9000), 'ai_response' => '<message>' . str_repeat("\x02", 9000) . '</message>'], 'user_id=1');
    $escapedHistory = $diagnostics->history($f['actor'], (object) ['limit' => 20, 'max_bytes' => 4096]);
    check(strlen(CanonicalJson::encode($escapedHistory)) <= 4096 && $escapedHistory['history'][0]['truncated'],
        'History bounds the encoded response even when JSON escapes expand content');
    $f['db']->update('prompt_log', ['evaluation_issues' => str_repeat("\x03", 8000)], 'user_id=1');
    $boundedDetail = $diagnostics->conversation($f['actor'], $detailInput);
    check(strlen(CanonicalJson::encode($boundedDetail)) <= 8192 && $boundedDetail['conversation']['prompts'][0]['truncated'],
        'Conversation detail bounds encoded diagnostics as well as prompt messages');
    $f['db']->update('prompt_log', $originalPrompt, 'user_id=1');
    JsonSchema::validate(JsonSchema::output($diagnostics->system($f['actor'])), $diagnostics::outputSchema('system'));
    JsonSchema::validate(JsonSchema::output($diagnostics->usage($f['actor'], (object) ['all_users' => true])), $diagnostics::outputSchema('usage'));
    check($sends === 1, 'All diagnostics and history reads remain free of external dispatch');
    $entry = $historyRead['history'][0];
    $repairInput = (object) ['operation_id' => 'explicit-style-repair', 'prompt_id' => $entry['id'], 'version' => $entry['version'], 'draft_version' => 'draft:' . $f['workspace']->status()['draft_version']];
    $repaired = $diagnostics->mutate($f['actor'], 'repair', $repairInput);
    check($repaired['status'] === 'succeeded' && $f['db']->scalar('SELECT status FROM prompt_log WHERE id=?', [$entry['id']]) === 'partial', 'Explicit style repair resolves only the selected interrupted prompt');
    check(CanonicalJson::digest($diagnostics->mutate($f['actor'], 'repair', $repairInput)) === CanonicalJson::digest($repaired), 'Style repair replay returns its original revision without repeating work');
    $historyRead = $diagnostics->history($f['actor'], (object) ['limit' => 20, 'max_bytes' => 4096]);
    $entry = $historyRead['history'][0];
    $deletedHistory = $diagnostics->mutate($f['actor'], 'history_delete', (object) ['operation_id' => 'explicit-history-delete', 'entries' => [(object) ['id' => $entry['id'], 'version' => $entry['version']]]]);
    check($deletedHistory['status'] === 'succeeded' && $f['db']->count('prompt_log', 'user_id=1') === 0 && $f['db']->count('prompt_log', 'user_id=2') === 1, 'History deletion keeps other accounts and removes only reviewed entries');
    $logs = $diagnostics->logs($f['actor'], (object) ['limit' => 50]);
    $logDeleteInput = (object) ['operation_id' => 'explicit-log-delete', 'files' => ['system.log'], 'inventory_version' => $logs['inventory_version']];
    $deletedLog = $diagnostics->mutate($f['actor'], 'logs_delete', $logDeleteInput);
    check($deletedLog['status'] === 'succeeded' && !file_exists($f['root'] . '/private/logs/system.log'), 'Log deletion verifies the reviewed inventory and exact captured bytes');
    check(CanonicalJson::digest($diagnostics->mutate($f['actor'], 'logs_delete', $logDeleteInput)) === CanonicalJson::digest($deletedLog), 'Log deletion replay is retained after the original file is gone');
    mkdir($f['root'] . '/private/prompts', 0700);
    file_put_contents($f['root'] . '/private/prompts/system.md', 'Shipped fixture prompt');
    $prompts = new VoxelSite\Agent\PromptService($f['db'], $f['policy'], $f['workspace'], $f['operations'],
        $f['root'] . '/private/prompts', $f['root'] . '/private/custom_prompts');
    foreach (['list', 'read', 'update', 'reset'] as $method) JsonSchema::assertSupported($prompts::inputSchema($method));
    foreach (['list', 'read'] as $method) JsonSchema::assertSupported($prompts::outputSchema($method));
    $originalPrompt = $prompts->read($f['actor'], (object) ['path' => 'system.md', 'offset' => 0, 'max_bytes' => 4096]);
    JsonSchema::validate(JsonSchema::output($originalPrompt), $prompts::outputSchema('read'));
    $promptInput = (object) ['operation_id' => 'custom-prompt-update', 'path' => 'system.md', 'version' => $originalPrompt['version'], 'content' => 'Owner override'];
    $promptUpdated = $prompts->update($f['actor'], $promptInput);
    check($promptUpdated['status'] === 'succeeded' && file_get_contents($f['root'] . '/private/prompts/system.md') === 'Shipped fixture prompt'
        && file_get_contents($f['root'] . '/private/custom_prompts/system.md') === 'Owner override',
        'Prompt editing creates an override and preserves shipped source');
    check(CanonicalJson::digest($prompts->update($f['actor'], $promptInput)) === CanonicalJson::digest($promptUpdated)
        && $f['db']->count('agent_prompt_versions') === 1, 'Prompt replay retains one attributed content version');
    reject(fn() => $prompts->read($f['editor'], (object) ['path' => 'system.md', 'offset' => 0, 'max_bytes' => 4096]),
        'permission_denied', 'Prompt administration uses its separate owner read authority');
    $changedPrompt = clone $promptInput; $changedPrompt->operation_id = 'stale-prompt-update';
    reject(fn() => $prompts->update($f['actor'], $changedPrompt), 'content_conflict', 'Stale prompt versions cannot replace newer overrides');
    $reset = $prompts->reset($f['actor'], (object) ['operation_id' => 'custom-prompt-reset', 'path' => 'system.md', 'version' => $promptUpdated['result']['version']]);
    check($reset['status'] === 'succeeded' && !file_exists($f['root'] . '/private/custom_prompts/system.md')
        && $prompts->read($f['actor'], (object) ['path' => 'system.md', 'offset' => 0, 'max_bytes' => 4096])['content'] === 'Shipped fixture prompt'
        && $f['db']->count('agent_prompt_versions') === 2, 'Reset removes only the override and preserves its versioned history');
} finally {
    Database::resetInstance();
    foreach (['VS_TEST_PREVIEW_DIR', 'VS_TEST_DOC_ROOT', 'VS_TEST_ASSETS_DIR', 'VS_TEST_MUTATION_LOCK', 'VS_TEST_WORKSPACE_STATE_DIR', 'VS_TEST_REVISIONS_DIR', 'VS_TEST_SNAPSHOT_DIR'] as $key) putenv($key);
    foreach ($roots as $root) removeFixture($root);
}
echo 'MCP settings and diagnostics: ' . $checks . " checks passed\n";
