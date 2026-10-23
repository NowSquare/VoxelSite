<?php
declare(strict_types=1);

/** Isolated archive retention, recovery protection and real public endpoint failures. */
require dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\Migrator;
use VoxelSite\SiteMutationJournal;
use VoxelSite\SiteMutationLock;
use VoxelSite\SitePlanStore;
use VoxelSite\SiteRecovery;

$root = realpath(sys_get_temp_dir()) . '/vs-snapshot-retention-' . bin2hex(random_bytes(6));
foreach (['preview/_partials', 'assets/css', 'snapshots'] as $dir) mkdir($root . '/' . $dir, 0755, true);
foreach (['PREVIEW_DIR' => 'preview', 'ASSETS_DIR' => 'assets', 'SNAPSHOT_DIR' => 'snapshots', 'MUTATION_LOCK' => 'mutation.lock'] as $key => $dir) putenv('VS_TEST_' . $key . '=' . $root . '/' . $dir);
putenv('VS_TEST_DOC_ROOT=' . $root);
foreach (['logDir'=>$root.'/logs','initialized'=>true] as $key=>$value) (new ReflectionProperty(\VoxelSite\Logger::class,$key))->setValue(null,$value);
$db = Database::getInstance($root . '/studio.db');
(new Migrator($db))->run();
(new \VoxelSite\WorkspaceMigration(new \VoxelSite\SiteWorkspace($db,$root.'/preview',$root),$db))->run();
$db->insert('users', ['id' => 1, 'email' => 'retention@example.test', 'name' => 'Retention', 'role' => 'owner', 'password_hash' => 'disabled', 'created_at' => now(), 'updated_at' => now()]);
$_REQUEST = ['_route_method' => 'GET', '_route_path' => '/test', '_user' => ['id' => 1, 'role' => 'owner']];
function jsonResponse(mixed $data, int $status = 200): void {}
require_once dirname(__DIR__) . '/engine/SnapshotCompatibility.php';
require_once dirname(__DIR__) . '/engine/SiteControlSnapshots.php';
$checks = 0; $failures = 0;
function check(bool $condition, string $label): void { global $checks, $failures; $checks++; if (!$condition) $failures++; echo ($condition ? 'PASS ' : 'FAIL ') . $label . "\n"; }
function resetArchives(int $limit = 2): void {
    global $db, $root;
    $db->exec('DELETE FROM site_control_plans'); $db->exec('DELETE FROM site_control_mutations'); $db->exec('DELETE FROM snapshots');
    foreach (glob($root . '/snapshots/*.zip') as $file) unlink($file);
    $db->update('settings', ['value' => (string) $limit], 'key = ?', ['max_snapshots']);
}
function manual(string $label = 'Manual'): array {
    global $db, $root;
    return createSnapshot($db, $root . '/snapshots', $root . '/preview', $root . '/preview/assets', 'manual', $label);
}
function existsSnapshot(int $id): bool {
    global $db, $root;
    $row = $db->queryOne('SELECT filename FROM snapshots WHERE id = ?', [$id]);
    return $row !== null && is_file($root . '/snapshots/' . $row['filename']);
}
function endpoint(string $method, int|string $id, string $flag = ''): array {
    global $root;
    $proc = proc_open([PHP_BINARY, __DIR__ . '/helpers/call-snapshot-retention-endpoint.php', $root, $method, (string) $id, $flag], [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
    fclose($pipes[0]); $out = stream_get_contents($pipes[1]); fclose($pipes[1]); $err = stream_get_contents($pipes[2]); fclose($pipes[2]);
    if (proc_close($proc) !== 0) throw new RuntimeException($out . $err);
    return json_decode($out, true, 512, JSON_THROW_ON_ERROR);
}
function failedMutation(int $snapshotId): string {
    global $db;
    $id = bin2hex(random_bytes(16));
    $db->insert('site_control_mutations', ['id' => $id, 'user_id' => 1, 'request_hash' => $id, 'route_path' => '/site-control/page-delete', 'status' => 'failed', 'snapshot_id' => $snapshotId, 'response_json' => json_encode(['ok' => false, 'error' => ['restored' => false, 'message' => 'Original incomplete recovery']]), 'http_code' => 500, 'created_at' => time()]);
    return $id;
}

$source = '<?php $page=["title"=>"Current","slug"=>"index"]; ?><h1 class="text-red-500">Current</h1>';
file_put_contents($root . '/preview/index.php', $source);
file_put_contents($root . '/preview/assets/css/style.css', ':root { --color-primary: #123456; }');
file_put_contents($root . '/preview/assets/css/tailwind.css', '/* captured CSS */');
$fm = new FileManager($db); $fm->syncPageRegistry(true);
$historyService = new \VoxelSite\WebsiteHistoryService($db,new \VoxelSite\SiteWorkspace($db));
$actor = new \VoxelSite\Agent\OperationActor('user',1,null,[],'studio_configured',null);

// Canonical private assets remain a real directory through restoration.
$bridgeSnapshot = createSiteControlSnapshot($db, 'Private draft assets', 'Canonical private storage');
$bridgeRestore = endpoint('POST', (int) $bridgeSnapshot['snapshot']['id']);
check($bridgeRestore['httpCode'] === 200 && is_dir($root . '/preview/assets') && !is_link($root . '/preview/assets'), 'Canonical private assets survive draft restoration');
file_put_contents($root . '/outside-owned.php', 'Outside file belongs to its owner');
symlink($root . '/outside-owned.php', $root . '/preview/external.php');
$siteRefused = $publicRefused = false;
try { $siteRefused = !createSiteControlSnapshot($db, 'File symlink boundary', 'Refuse external file targets')['ok']; } catch (RuntimeException) { $siteRefused = true; }
try { $publicRefused = !manual('Public file symlink boundary')['ok']; } catch (RuntimeException) { $publicRefused = true; }
check($siteRefused && $publicRefused && file_get_contents($root . '/outside-owned.php') === 'Outside file belongs to its owner', 'Both archive writers refuse file symlink targets without following them');
unlink($root . '/preview/external.php');

resetArchives();
for ($i = 0; $i < 4; $i++) check(createSiteControlSnapshot($db, 'Site ' . $i, '')['ok'], 'Site safety archive ' . $i . ' is captured');
check((int) $db->scalar('SELECT COUNT(*) FROM snapshots') === 2 && count(glob($root . '/snapshots/*.zip')) === 2, 'Repeated Site mutations respect max_snapshots on disk and in SQLite');

resetArchives();
$store = new SitePlanStore($db, $fm);
for ($i = 0; $i < 4; $i++) {
    $plan = ['applicable' => true, 'edits' => [['file' => 'index.php', 'strategy' => 'content-edit', 'anchored' => true, 'before_snippet' => 'Current', 'after_snippet' => 'Updated', 'source_hash' => hash('sha256', $source)]]];
    $id = $store->create(1, $plan); $store->begin($id, 1); $store->finish($id, ['success' => true, 'files_changed' => 0, 'rollback_clean' => true]);
}
check((int) $db->scalar('SELECT COUNT(*) FROM snapshots') === 2 && count(glob($root . '/snapshots/*.zip')) === 2, 'Repeated reviewed Site applies use the same archive limit');

resetArchives();
$recovery = manual('Required recovery'); $recoveryId = (int) $recovery['snapshot']['id'];
$failedId = failedMutation($recoveryId);
for ($i = 0; $i < 4; $i++) manual('Newer manual ' . $i);
check(existsSnapshot($recoveryId), 'Public snapshot creation retains an unresolved deterministic recovery archive');
check((int) $db->scalar('SELECT COUNT(*) FROM snapshots') === 2, 'Pinned recovery and newest ordinary archive share the configured limit');
$deletion = endpoint('DELETE', $recoveryId);
check($deletion['httpCode'] === 409 && existsSnapshot($recoveryId) && str_contains($deletion['response']['error']['message'] ?? '', 'recovery'), 'DELETE refuses an archive required for unresolved recovery');
$selected = manual('Selected recovery');
SiteRecovery::resolveAfterSnapshot($db, (int) $selected['snapshot']['id']);
manual('After recovery'); manual('After recovery again');
check(!existsSnapshot($recoveryId), 'Resolved recovery no longer pins its obsolete archive');
$original = json_decode($db->scalar('SELECT response_json FROM site_control_mutations WHERE id = ?', [$failedId]), true);
check($original['error']['restored'] === false && $original['recovery_resolved'] === true, 'Archive release preserves the failed operation restoration result');

resetArchives(1);
$first = manual('Applying AI');
$db->insert('site_control_plans', ['id' => bin2hex(random_bytes(24)), 'user_id' => 1, 'status' => 'applying', 'plan_json' => '{}', 'created_at' => time(), 'expires_at' => time() + 100, 'recovery_snapshot_id' => $first['snapshot']['id']]);
$second = manual('Applying page operation');
$db->insert('site_control_mutations', ['id' => bin2hex(random_bytes(16)), 'user_id' => 1, 'request_hash' => 'applying', 'route_path' => '/site-control/page-delete', 'status' => 'applying', 'snapshot_id' => $second['snapshot']['id'], 'created_at' => time()]);
$third = manual('Newest manual');
check(existsSnapshot((int) $first['snapshot']['id']) && existsSnapshot((int) $second['snapshot']['id']) && existsSnapshot((int) $third['snapshot']['id']), 'Applying operations and the newly created archive remain available above a smaller soft limit');
check(endpoint('DELETE', (int) $first['snapshot']['id'])['httpCode'] === 409 && endpoint('DELETE', (int) $second['snapshot']['id'])['httpCode'] === 409, 'DELETE also protects active reviewed and deterministic operations');

resetArchives(0);
for ($i = 0; $i < 3; $i++) manual();
check((int) $db->scalar('SELECT COUNT(*) FROM snapshots') === 3, 'An unlimited max_snapshots setting remains unlimited');

resetArchives(2);
$target = manual('Restore target'); $targetId = (int) $target['snapshot']['id'];
file_put_contents($root . '/preview/index.php', str_replace('Current', 'Newer', $source)); $fm->syncPageRegistry(true);
$before = file_get_contents($root . '/preview/index.php'); $beforePages = $db->query('SELECT * FROM pages ORDER BY id');
$failed = endpoint('POST', $targetId, '--fail-rollback');
check($failed['httpCode'] === 409 && ($failed['response']['data']['restoration']['restored'] ?? null) === false && file_get_contents($root . '/preview/index.php') !== $before, 'A real projection failure plus unwritable rollback reports incomplete public restore');
$publicId = $failed['response']['data']['operation']['operation_id'] ?? '';
$retained = $publicId === '' ? null : $historyService->operations->get($actor,$publicId);
check($retained !== null && $retained['state'] === 'recovery_required' && $retained['result']['restoration']['restored'] === false, 'Incomplete public restoration has a durable failed operation');
$originalOutcome = $retained['result'];
$blocked = false; try { $lock=SiteMutationLock::acquire(); unset($lock); } catch (RuntimeException) { $blocked = true; }
check($blocked, 'Incomplete public restoration blocks later website writes');
$safetyId = $failed['review']['safety_snapshot_id'];
$captureBlocked = false; try { manual('While recovery is incomplete'); } catch (RuntimeException) { $captureBlocked = true; }
$safety = $historyService->snapshots->read($actor,$safetyId);
check($captureBlocked && $safety['domains']['draft']['files']['index.php'] === $before && endpoint('DELETE', $safetyId)['httpCode'] === 409, 'Retained safety bytes cannot be deleted or displaced by snapshot creation during incomplete recovery');
$stillFailed = $historyService->restores->recover($actor,$publicId);
check($stillFailed['status'] === 'recovery_required' && $stillFailed['result']['original_outcome']['error'] === $originalOutcome['error']
    && $stillFailed['result']['original_outcome']['restoration'] === $originalOutcome['restoration'], 'Repeated incomplete recovery retains the first failure and reports current failure truthfully');
\VoxelSite\Agent\JsonSchema::validate(\VoxelSite\Agent\JsonSchema::output($stillFailed),\VoxelSite\Agent\ToolContracts::operation());
chmod($root . '/preview', 0755);
$restored = $historyService->restores->recover($actor,$publicId);
$unblocked = true; try { $lock=SiteMutationLock::acquire(); unset($lock); } catch (RuntimeException) { $unblocked = false; }
check($restored['status'] === 'failed_restored' && $restored['result']['restoration']['restored'] === true && $unblocked && file_get_contents($root . '/preview/index.php') === $before && $db->query('SELECT * FROM pages ORDER BY id') === $beforePages, 'Verified explicit operation recovery restores exact source and page identity then releases the write block');
$retained = $historyService->operations->get($actor,$publicId);
check($retained['result']['original_outcome']['restoration'] === $originalOutcome['restoration'] && $retained['result']['original_outcome']['error'] === $originalOutcome['error'], 'Successful later recovery retains the original failed public restoration result');
\VoxelSite\Agent\JsonSchema::validate(\VoxelSite\Agent\JsonSchema::output($restored),\VoxelSite\Agent\CapabilityCatalog::core()->get('voxelsite_operations_get')->outputSchema);

resetArchives(2);
$target = manual('Restore interruption target');
file_put_contents($root . '/preview/index.php', $source . '<p>Before interrupted restore</p>'); $fm->syncPageRegistry(true);
$before = file_get_contents($root . '/preview/index.php'); $beforePages = $db->query('SELECT * FROM pages ORDER BY id'); $beforeCss = file_get_contents($root . '/preview/assets/css/tailwind.css');
$worker = proc_open([PHP_BINARY, __DIR__ . '/helpers/call-snapshot-retention-endpoint.php', $root, 'POST', (string) $target['snapshot']['id'], '--pause-before-projection'], [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
fclose($pipes[0]); $deadline = microtime(true) + 5;
while (!is_file($root . '/restore-paused') && microtime(true) < $deadline && proc_get_status($worker)['running']) usleep(1000);
$killed = is_file($root . '/restore-paused') && proc_terminate($worker, 9);
$out = stream_get_contents($pipes[1]); fclose($pipes[1]); $err = stream_get_contents($pipes[2]); fclose($pipes[2]); proc_close($worker);
check($killed && file_get_contents($root . '/preview/index.php') !== $before, 'A real public restore worker is terminated after replacing source files');
$pending = $db->queryOne("SELECT * FROM agent_operations WHERE state = 'applying'");
$safety = $pending === null ? null : $historyService->snapshots->inspect($actor,'safety_'.substr($pending['preparation_id'],8));
check($pending !== null && $safety['validity'] === 'valid' && $safety['protected'], 'Interrupted public restore retains its operation and pre-restore archive');
// The process was killed; expire only its worker lease so recovery can claim it.
$db->update('agent_operations',['lease_expires_at'=>time()-1],'id=?',[$pending['id']]);
$recovered = $historyService->restores->recover($actor,$pending['operation_id']);
check($recovered['status'] === 'failed_restored' && $recovered['result']['restoration']['restored'] === true && file_get_contents($root . '/preview/index.php') === $before && file_get_contents($root . '/preview/assets/css/tailwind.css') === $beforeCss && $db->query('SELECT * FROM pages ORDER BY id') === $beforePages, 'Interrupted public restore recovers exact source, compiled CSS and page projection');

resetArchives(2);
$fm->syncPageRegistry(true); $pageId = (int) $db->scalar("SELECT id FROM pages WHERE slug = 'index'");
$collectionId = $db->insert('collections', ['slug' => 'ai-archive-probe', 'name' => 'AI archive probe', 'index_page_id' => $pageId, 'created_at' => now(), 'updated_at' => now()]);
chmod($root . '/preview/index.php', 0600);
$plan['edits'][0]['source_hash'] = hash_file('sha256', $root . '/preview/index.php');
$planId = $store->create(1, $plan); $claimed = $store->begin($planId, 1);
$store->finish($planId, ['success' => true, 'files_changed' => 0, 'rollback_clean' => true]);
$archive = $db->queryOne('SELECT filename FROM snapshots WHERE id = ?', [$claimed['recovery_snapshot_id']]);
$zip = new ZipArchive(); $zip->open($root . '/snapshots/' . $archive['filename']); $manifest = json_decode($zip->getFromName('site-control-state.json') ?: 'null', true); $zip->close();
check(isset($manifest['pages'], $manifest['files'], $manifest['directories'], $manifest['collection_indexes']), 'AI apply archives carry the shared full restoration manifest');
chmod($root . '/preview/index.php', 0644); file_put_contents($root . '/preview/index.php', '<?php $page=["title"=>"Later","slug"=>"index"]; ?><h1>Later</h1>');
$db->delete('pages', 'id = ?', [$pageId]);
$restored = endpoint('POST', (int) $claimed['recovery_snapshot_id']);
clearstatcache(true, $root . '/preview/index.php');
check($restored['httpCode'] === 200 && (int) $db->scalar("SELECT id FROM pages WHERE slug = 'index'") === $pageId && (int) $db->scalar('SELECT index_page_id FROM collections WHERE id = ?', [$collectionId]) === $pageId && (fileperms($root . '/preview/index.php') & 0777) === 0600, 'History restoring an AI apply archive restores original page identity, collection association and file mode');

resetArchives(3); chmod($root . '/preview/index.php', 0644);
$target = manual('Atomic recovery target');
$oldFailureId = failedMutation((int) $target['snapshot']['id']);
$historicalFailure = $db->scalar('SELECT response_json FROM site_control_mutations WHERE id = ?', [$oldFailureId]);
file_put_contents($root . '/preview/index.php', $source . '<p>Must survive rejected recovery outcome</p>'); $fm->syncPageRegistry(true);
$before = file_get_contents($root . '/preview/index.php'); $beforePages = $db->query('SELECT * FROM pages ORDER BY id');
$rejected = endpoint('POST', (int) $target['snapshot']['id'], '--fail-outcome');
check($rejected['httpCode'] === 409 && $rejected['response']['data']['restoration']['restored'] === true && file_get_contents($root . '/preview/index.php') === $before && $db->query('SELECT * FROM pages ORDER BY id') === $beforePages, 'Failure to retain a restored outcome rolls back selected restoration and verifies prior source and projection');
check($db->scalar('SELECT response_json FROM site_control_mutations WHERE id = ?', [$oldFailureId]) === $historicalFailure, 'A rejected restored outcome cannot release or rewrite an older recovery gate');

resetArchives(2);
$unknown = manual('Unconfirmed restoration');
$unknownId = failedMutation((int) $unknown['snapshot']['id']);
$db->update('site_control_mutations', ['response_json' => json_encode(['ok' => false, 'error' => ['message' => 'The writer failed without confirming restoration']])], 'id = ?', [$unknownId]);
$blocked = false; try { SiteRecovery::assertWritable($db); } catch (RuntimeException) { $blocked = true; }
check($blocked, 'A retained failed operation without confirmed restoration also keeps the recovery write block');
SiteRecovery::resolveAfterSnapshot($db, (int) $unknown['snapshot']['id']);
$unknownResponse = json_decode($db->scalar('SELECT response_json FROM site_control_mutations WHERE id = ?', [$unknownId]), true);
check(($unknownResponse['recovery_resolved'] ?? false) === true && !array_key_exists('restored', $unknownResponse['error']), 'Verified selected recovery resolves an unconfirmed failure without inventing its original restoration result');

resetArchives(1); manual('Old archive');
$cleanupJournal = new SiteMutationJournal($db); $cleanupId = bin2hex(random_bytes(16));
$cleanupJournal->begin($cleanupId, 1, '/site-control/page-rename', ['pageId' => 'page:index.php']);
$createFunction=method_exists($db->getPdo(),'createFunction') ? 'createFunction' : 'sqliteCreateFunction';
$db->getPdo()->$createFunction('deny_archive_cleanup', static function () use ($root): int { chmod($root . '/snapshots', 0555); return 1; });
$db->exec('CREATE TEMP TRIGGER deny_archive_cleanup AFTER INSERT ON snapshots BEGIN SELECT deny_archive_cleanup(); END');
$before = file_get_contents($root . '/preview/index.php');
$capture = createSiteControlSnapshot($db, 'Archive before cleanup failure', 'No page write should start');
$db->exec('DROP TRIGGER deny_archive_cleanup'); chmod($root . '/snapshots', 0755);
$pending = $cleanupJournal->get($cleanupId, 1);
check(!$capture['ok'] && is_int($pending['snapshotId']) && existsSnapshot($pending['snapshotId']) && file_get_contents($root . '/preview/index.php') === $before, 'A real retention permission failure keeps the verified new archive attached before any website write');
$lock = SiteMutationLock::acquire(); $cleanupJournal->recoverInterrupted(); unset($lock);
check($pending['snapshotId'] !== null && $cleanupJournal->get($cleanupId, 1)['restored'] === true && file_get_contents($root . '/preview/index.php') === $before, 'An interrupted archive cleanup failure can verify original source through its retained recovery journal');

resetArchives(0);
$older = manual('Older required recovery'); failedMutation((int) $older['snapshot']['id']);
$db->update('snapshots', ['created_at' => '2000-01-01T00:00:00Z'], 'id = ?', [$older['snapshot']['id']]);
for ($i = 0; $i < 51; $i++) manual('Later snapshot ' . $i);
$history = endpoint('GET', 0);
check(in_array('legacy_'.$older['snapshot']['id'], array_column($history['response']['data']['snapshots'], 'snapshot_id'), true), 'History includes a required recovery archive even when it is older than the newest50 ordinary snapshots');

echo "$checks snapshot retention checks, $failures failed. Fixture: $root\n";
exit($failures ? 1 : 0);
