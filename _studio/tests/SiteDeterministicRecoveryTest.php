<?php
declare(strict_types=1);

/** Real killed endpoint writes, durable snapshot recovery, and replay safety. */
require dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\Migrator;
use VoxelSite\SiteMutationJournal;
use VoxelSite\SiteMutationLock;
use VoxelSite\SiteRecovery;

$root = sys_get_temp_dir() . '/vs-site-deterministic-' . bin2hex(random_bytes(6));
foreach (['preview/_partials', 'assets/css', 'snapshots'] as $directory) mkdir($root . '/' . $directory, 0755, true);
foreach (['PREVIEW_DIR' => 'preview', 'ASSETS_DIR' => 'assets', 'SNAPSHOT_DIR' => 'snapshots', 'MUTATION_LOCK' => 'mutation.lock'] as $key => $relative) {
    putenv('VS_TEST_' . $key . '=' . $root . '/' . $relative);
}
$db = Database::getInstance($root . '/studio.db');
(new Migrator($db))->run();
$db->insert('users', ['id' => 1, 'email' => 'recovery@example.test', 'name' => 'Recovery', 'role' => 'owner',
    'password_hash' => 'disabled', 'created_at' => now(), 'updated_at' => now()]);
file_put_contents($root . '/assets/css/style.css', ':root { --color-primary: #123456; }');
file_put_contents($root . '/assets/css/tailwind.css', '/* original compiled CSS */');
file_put_contents($root . '/preview/about.php', '<?php $page=["title"=>"About","slug"=>"about"]; ?><h1>About</h1>');
// Multiple real references span bounded continuations; a trusted test hook makes the kill deterministic.
for ($i = 0; $i < 50; $i++) {
    $slug = $i === 0 ? 'index' : 'page-' . $i;
    file_put_contents($root . '/preview/' . $slug . '.php', '<?php $page=["title"=>"Page","slug"=>"' . $slug . '"]; ?><a href="/about">About</a>' . str_repeat('<p>Text</p>', 40));
}
require_once __DIR__ . '/helpers/LegacyWorkspaceFixture.php';
activateLegacyTestWorkspace($db);
file_put_contents($root . '/preview/_partials/header.php', '<!doctype html><html><body><main>');
file_put_contents($root . '/preview/_partials/footer.php', '</main></body></html>');
file_put_contents($root . '/preview/_partials/nav.php', "<?php\n" . \VoxelSite\NavLinksParser::serialize([['href'=>'/','label'=>'Home','home'=>true], ['href'=>'/about','label'=>'About']]));
$fm = new FileManager($db);
$fm->syncPageRegistry();
$db->exec('PRAGMA wal_checkpoint(TRUNCATE)');
$checks = 0;
function check(bool $condition, string $label): void {
    global $checks;
    if (!$condition) throw new RuntimeException('FAIL ' . $label);
    $checks++;
    echo 'PASS ' . $label . "\n";
}
function state(): array {
    global $root;
    $state = [];
    foreach (['preview', 'assets'] as $prefix) {
        foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/' . $prefix, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::SELF_FIRST) as $entry) {
            $path = substr($entry->getPathname(), strlen($root) + 1);
            $state[$path] = [$entry->isDir() ? null : hash_file('sha256', $entry->getPathname()), fileperms($entry->getPathname()) & 0777];
        }
    }
    ksort($state);
    return $state;
}
function worker(string $route, array $body): array {
    global $root;
    $process = proc_open([PHP_BINARY, __DIR__ . '/helpers/site-deterministic-worker.php', $root, $route, json_encode($body, JSON_THROW_ON_ERROR)],
        [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
    fclose($pipes[0]);
    return [$process, $pipes];
}
function response(string $route, array $body): array {
    [$process, $pipes] = worker($route, $body);
    $out = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $err = stream_get_contents($pipes[2]); fclose($pipes[2]);
    if (proc_close($process) !== 0) throw new RuntimeException($err . $out);
    return json_decode($out, true, 512, JSON_THROW_ON_ERROR);
}

$workspace = new \VoxelSite\SiteWorkspace($db);
$actor = new \VoxelSite\Agent\OperationActor('user', 1, null, [], 'studio_configured', null);
$policy = new \VoxelSite\Agent\ActorPolicy($db);
$operations = new \VoxelSite\Agent\OperationStore($db, $policy, $workspace->mutationLockPath());
$changes = new \VoxelSite\Agent\ChangeSetStore($db, $policy, dirname($workspace->draftRoot()) . '/data/agent/changes');
$executor = new \VoxelSite\Agent\ChangeSetExecutor($db, $policy, $workspace, $changes, $operations);
$before = state();
$beforePages = $db->query('SELECT * FROM pages ORDER BY id');
$id = bin2hex(random_bytes(16));
$body = ['operation_id' => $id, 'base_draft_version' => 'draft:' . $workspace->status()['draft_version'], 'routeId' => 'route:/about', 'newPath' => '/company'];
file_put_contents($root . '/pause-enabled', 'pause at reviewed write');
[$process, $pipes] = worker('/site-control/url-rename', $body);
$killed = false; $deadline = microtime(true) + 15;
while (microtime(true) < $deadline) {
    clearstatcache();
    if (is_file($root . '/worker-paused')) { $killed = proc_terminate($process, 9); break; }
    if (!proc_get_status($process)['running']) break;
    usleep(1000);
}
$out = stream_get_contents($pipes[1]); fclose($pipes[1]);
$err = stream_get_contents($pipes[2]); fclose($pipes[2]); proc_close($process);
unlink($root . '/pause-enabled');
check($killed, 'A real URL rename worker is killed after source deletion: ' . $out . $err);
check(state() !== $before && !is_file($root . '/preview/about.php'), 'Process termination leaves an actual partial website mutation');
$pending = $operations->get($actor, $id);
check($pending['state'] === 'applying' && !empty($pending['recovery']['change_set_id']), 'Killed operation retains its mutation identity and verified pre-write archive');
$private = false;
try { $operations->get(new \VoxelSite\Agent\OperationActor('user', 2, null, [], 'studio_configured', null), $id); }
catch (\VoxelSite\Agent\OperationException $error) { $private = $error->errorCode === 'permission_denied'; }
check($private, 'Mutation recovery results are private to the requesting user');
$db->update('agent_operations', ['lease_expires_at' => time() - 1], 'id = ?', [$pending['id']]);
$recovered = $executor->recover($actor, $id);
check($recovered['status'] === 'failed_restored' && $recovered['result']['restoration']['restored'] === true,
    'Recovery retains a confirmed interrupted-and-restored terminal result');
check(state() === $before && $db->query('SELECT * FROM pages ORDER BY id') === $beforePages,
    'Recovery restores every original file, permission, directory, and page ID exactly');
$archiveCount = $db->count('agent_change_sets');
$retry = response('/site-control/url-rename', $body);
check($retry['httpCode'] === 409 && ($retry['response']['error']['details']['operation']['result']['restoration']['restored'] ?? null) === true
    && state() === $before && $db->count('agent_change_sets') === $archiveCount,
    'Retry returns the retained recovery outcome without rerunning the mutation or taking another archive');
$alteredBody = $body; $alteredBody['newPath'] = '/other';
$different = response('/site-control/url-rename', $alteredBody);
check($different['httpCode'] === 409 && ($different['response']['error']['code'] ?? '') === 'idempotency_conflict' && state() === $before,
    'A retry identifier cannot authorize a changed mutation');
$successId = bin2hex(random_bytes(16));
$renameBody = ['operation_id' => $successId, 'base_draft_version' => 'draft:' . $workspace->status()['draft_version'], 'pageId' => 'page:about.php', 'newTitle' => 'Our story'];
$done = response('/site-control/page-rename', $renameBody);
check($done['httpCode'] === 200 && $operations->get($actor, $successId)['state'] === 'succeeded', 'Successful deterministic endpoint retains its terminal response');
$successState = state(); $archiveCount = $db->count('agent_change_sets');
$doneAgain = response('/site-control/page-rename', array_reverse($renameBody, true));
check($doneAgain === $done && state() === $successState && $db->count('agent_change_sets') === $archiveCount,
    'Successful retry is idempotent even when JSON object key order changes');

// Older installations can retain legacy recovery receipts; continue verifying their semantics.
$journal = new SiteMutationJournal($db);
$emptyId = bin2hex(random_bytes(16));
$lock = SiteMutationLock::acquire();
$journal->begin($emptyId, 1, '/site-control/page-delete', ['pageId' => 'page:about.php']);
$journal->recoverInterrupted();
check($journal->get($emptyId, 1)['restored'] === true && state() === $successState,
    'Interrupted validation before snapshot capture confirms no website writes');
unset($lock);

$failedRestoreId = bin2hex(random_bytes(16));
$lock = SiteMutationLock::acquire();
$journal->begin($failedRestoreId, 1, '/site-control/page-delete', ['pageId' => 'page:about.php']);
$safety = createSiteControlSnapshot($db, 'Recovery failure', 'Controlled unwritable restoration');
check($safety['ok'] === true, 'An incomplete recovery retains an existing safety snapshot');
file_put_contents($root . '/preview/about.php', 'partially changed');
// Atomic replacement needs a writable parent, even when the old file itself is writable.
chmod($root . '/preview', 0555);
$journal->recoverInterrupted();
$failedRestore = $journal->get($failedRestoreId, 1);
check($failedRestore['status'] === 'failed' && $failedRestore['restored'] === false
    && $failedRestore['snapshotId'] === $safety['snapshot']['id']
    && str_contains($failedRestore['response']['error']['message'], 'incomplete'),
    'An unwritable recovery is reported as incomplete with its retained snapshot identity');
$blocked = false;
try { SiteRecovery::assertWritable($db); } catch (RuntimeException $error) { $blocked = str_contains($error->getMessage(), '#' . $safety['snapshot']['id']); }
check($blocked, 'Incomplete deterministic recovery blocks later writes with its snapshot identity');
unset($lock);
$partialState = state();
$blockedWrite = response('/site-control/page-rename', ['mutation_id' => bin2hex(random_bytes(16)), 'pageId' => 'page:page-1.php', 'newTitle' => 'Must not be saved']);
check($blockedWrite['httpCode'] === 409 && state() === $partialState,
    'An actual follow-up endpoint cannot save edits that a later safety restore would discard');
$lock = SiteMutationLock::acquire();
chmod($root . '/preview', 0755);
$restored = restoreSiteControlSnapshot($db, $safety['snapshot']['id']);
check($restored['ok'] === true && state() === $successState, 'The reported safety snapshot can recover after permissions are repaired');
$historicalMutation = $journal->get($failedRestoreId, 1)['response'];
SiteRecovery::resolveAfterSnapshot($db, $safety['snapshot']['id']);
SiteRecovery::assertWritable($db);
check($journal->get($failedRestoreId, 1)['restored'] === false
    && $journal->get($failedRestoreId, 1)['response']['recovery_resolved'] === true,
    'Verified explicit snapshot recovery releases the write block without rewriting the failed restoration');
$resolvedMutation = $journal->get($failedRestoreId, 1)['response'];
check($resolvedMutation['error']['message'] === $historicalMutation['error']['message']
    && $resolvedMutation['error']['snapshotId'] === $historicalMutation['error']['snapshotId']
    && $resolvedMutation['error']['recovery_resolved_by_snapshot'] === $safety['snapshot']['id'],
    'Mutation recovery records the selected snapshot separately from the original failure and safety archive');
$aiId = bin2hex(random_bytes(24));
$db->insert('site_control_plans', ['id' => $aiId, 'user_id' => 1, 'status' => 'failed', 'plan_json' => '{}',
    'result_json' => json_encode(['success' => false, 'rollback_clean' => false, 'restoration_verified' => false,
        'remaining_changed_files' => ['about.php'], 'error' => 'Original AI restore failure']),
    'created_at' => time(), 'expires_at' => time() + 100, 'recovery_snapshot_id' => $safety['snapshot']['id']]);
$blocked = false;
try { SiteRecovery::assertWritable($db); } catch (RuntimeException) { $blocked = true; }
check($blocked, 'Incomplete reviewed AI recovery blocks the same later writers');
SiteRecovery::resolveAfterSnapshot($db, $safety['snapshot']['id']);
SiteRecovery::assertWritable($db);
$aiResult = json_decode($db->scalar('SELECT result_json FROM site_control_plans WHERE id = ?', [$aiId]), true);
check($aiResult['recovery_resolved'] === true && $aiResult['error'] === 'Original AI restore failure'
    && $aiResult['rollback_clean'] === false && $aiResult['restoration_verified'] === false
    && $aiResult['remaining_changed_files'] === ['about.php'],
    'Explicit snapshot recovery preserves the original AI restoration flags and affected files');
$later = createSiteControlSnapshot($db, 'Later snapshot', 'A later restore must not rewrite earlier recovery history');
SiteRecovery::resolveAfterSnapshot($db, $later['snapshot']['id']);
check($db->scalar('SELECT result_json FROM site_control_plans WHERE id = ?', [$aiId]) === json_encode($aiResult, JSON_THROW_ON_ERROR)
    && $journal->get($failedRestoreId, 1)['response'] === $resolvedMutation,
    'Later snapshot restores do not overwrite the first verified recovery resolution');
unset($lock);

$missingId = bin2hex(random_bytes(16));
$lock = SiteMutationLock::acquire();
$missing = $journal->resolveMissing($missingId, 1);
check($missing['status'] === 'failed' && $missing['restored'] === true
    && $missing['response']['error']['code'] === 'mutation_not_started',
    'A request lost before reaching the writer gets a durable no-write terminal result');
check($journal->resolveMissing($missingId, 2) === null && $journal->get($missingId, 1) === $missing,
    'Missing-request resolution cannot overwrite or reveal another user’s result');
unset($lock);
$snapshotCount = $db->scalar('SELECT COUNT(*) FROM snapshots');
$lateOriginal = response('/site-control/page-rename', ['mutation_id' => $missingId, 'pageId' => 'page:about.php', 'newTitle' => 'Delayed original']);
check($lateOriginal['httpCode'] === 409 && state() === $successState && $db->scalar('SELECT COUNT(*) FROM snapshots') === $snapshotCount,
    'A delayed original POST cannot run after no-write recovery was confirmed');
echo "$checks deterministic recovery checks passed. Fixture: $root\n";
