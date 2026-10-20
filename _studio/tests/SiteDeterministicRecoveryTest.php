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
// Enough real references to reliably terminate after source deletion and before propagation completes.
for ($i = 0; $i < 500; $i++) {
    $slug = $i === 0 ? 'index' : 'page-' . $i;
    file_put_contents($root . '/preview/' . $slug . '.php', '<?php $page=["title"=>"Page","slug"=>"' . $slug . '"]; ?><a href="/about">About</a>' . str_repeat('<p>Text</p>', 40));
}
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

$before = state();
$beforePages = $db->query('SELECT * FROM pages ORDER BY id');
$id = bin2hex(random_bytes(16));
$body = ['mutation_id' => $id, 'routeId' => 'route:/about', 'newPath' => '/company'];
[$process, $pipes] = worker('/site-control/url-rename', $body);
$killed = false;
$deadline = microtime(true) + 15;
while (microtime(true) < $deadline) {
    clearstatcache();
    if (is_file($root . '/preview/company.php') && !is_file($root . '/preview/about.php')) {
        $killed = proc_terminate($process, 9);
        break;
    }
    if (!proc_get_status($process)['running']) break;
    usleep(100);
}
$out = stream_get_contents($pipes[1]); fclose($pipes[1]);
$err = stream_get_contents($pipes[2]); fclose($pipes[2]);
proc_close($process);
check($killed, 'A real URL rename worker is killed after source deletion');
check(state() !== $before && !is_file($root . '/preview/about.php'), 'Process termination leaves an actual partial website mutation');
$journal = new SiteMutationJournal($db);
$pending = $journal->get($id, 1);
check($pending['status'] === 'applying' && is_int($pending['snapshotId']), 'Killed operation retains its mutation identity and pre-write snapshot');
check($journal->get($id, 2) === null, 'Mutation recovery results are private to the requesting user');
$lock = SiteMutationLock::acquire();
$journal->recoverInterrupted();
$recovered = $journal->get($id, 1);
check($recovered['status'] === 'failed' && $recovered['restored'] === true && $recovered['httpCode'] === 409,
    'Recovery retains a confirmed interrupted-and-restored terminal result');
check(state() === $before && $db->query('SELECT * FROM pages ORDER BY id') === $beforePages,
    'Recovery restores every original file, permission, directory, and page ID exactly');
unset($lock);
$snapshotCount = $db->scalar('SELECT COUNT(*) FROM snapshots');
$retry = response('/site-control/url-rename', $body);
check($retry['httpCode'] === 409 && ($retry['response']['error']['restored'] ?? null) === true
    && state() === $before && $db->scalar('SELECT COUNT(*) FROM snapshots') === $snapshotCount,
    'Retry returns the retained recovery outcome without rerunning the mutation or taking another snapshot');
$alteredBody = $body; $alteredBody['newPath'] = '/other';
$different = response('/site-control/url-rename', $alteredBody);
check($different['httpCode'] === 409 && str_contains($different['response']['error']['message'], 'different request') && state() === $before,
    'A retry identifier cannot authorize a changed mutation');

$successId = bin2hex(random_bytes(16));
$renameBody = ['mutation_id' => $successId, 'pageId' => 'page:about.php', 'newTitle' => 'Our story'];
$done = response('/site-control/page-rename', $renameBody);
check($done['httpCode'] === 200 && $journal->get($successId, 1)['status'] === 'applied', 'Successful deterministic endpoint retains its terminal response');
$successState = state(); $snapshotCount = $db->scalar('SELECT COUNT(*) FROM snapshots');
$doneAgain = response('/site-control/page-rename', array_reverse($renameBody, true));
check($doneAgain === $done && state() === $successState && $db->scalar('SELECT COUNT(*) FROM snapshots') === $snapshotCount,
    'Successful retry is idempotent even when JSON object key order changes');

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
chmod($root . '/preview/about.php', 0444);
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
chmod($root . '/preview/about.php', 0644);
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
