<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/engine/bootstrap.php';
use VoxelSite\Database;
$root = sys_get_temp_dir() . '/voxelsite_snapshot_recovery_' . bin2hex(random_bytes(6));
foreach (['preview/_partials', 'assets/css', 'assets/images', 'snapshots'] as $dir) mkdir($root . '/' . $dir, 0755, true);
putenv('VS_TEST_PREVIEW_DIR=' . $root . '/preview'); putenv('VS_TEST_ASSETS_DIR=' . $root . '/assets'); putenv('VS_TEST_SNAPSHOT_DIR=' . $root . '/snapshots');
$db = Database::getInstance($root . '/studio.db'); $migration = require dirname(__DIR__) . '/engine/migrations/001_initial_schema.php'; $migration['up']($db);
$db->insert('users', ['id' => 1, 'email' => 'fixture@example.test', 'password_hash' => 'unused', 'name' => 'Fixture', 'role' => 'owner', 'created_at' => now(), 'updated_at' => now()]);
$_REQUEST['_route_method'] = 'GET'; $_REQUEST['_route_path'] = '/test'; $_REQUEST['_user'] = ['id' => 1, 'role' => 'owner'];
function jsonResponse(mixed $data, int $status = 200): void {}
require dirname(__DIR__) . '/api/endpoints/snapshots.php';
$passed = 0; $failed = 0;
function verify(bool $ok, string $message): void { global $passed, $failed; if ($ok) $passed++; else { $failed++; echo "FAIL: {$message}\n"; } }
function archive(string $name, array $entries): string { global $root; $path = $root . '/snapshots/' . $name; $zip = new ZipArchive(); $zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE); foreach ($entries as $entry => $content) $zip->addFromString($entry, $content); $zip->close(); return $path; }
function seed(): void { global $root; chmod($root . '/preview/_partials', 0755); file_put_contents($root . '/preview/index.php', '<?php $page=["title"=>"Current","slug"=>"index"]; ?><h1 class="text-red-500">Current</h1>'); file_put_contents($root . '/preview/_partials/header.php', 'Current header'); file_put_contents($root . '/assets/css/style.css', ':root { --color-primary: #369; }'); file_put_contents($root . '/assets/images/kept.jpg', 'owned upload'); }
seed();
$zip = archive('unwritable.zip', ['preview/index.php' => 'Restored index', 'preview/_partials/header.php' => 'Restored header']);
chmod($root . '/preview/_partials', 0555);
$r = restoreSnapshot($zip, $root . '/preview', $root . '/assets');
verify(($r['ok'] ?? true) === false, 'real directory write failure must not report successful restoration');
verify(str_contains(file_get_contents($root . '/preview/index.php'), 'Current') && file_get_contents($root . '/preview/_partials/header.php') === 'Current header', 'writeability failure preserves all files before restoration begins');
chmod($root . '/preview/_partials', 0755);
seed(); $before = file_get_contents($root . '/preview/index.php');
$unsafe = archive('unsafe.zip', ['preview/index.php' => 'Changed', 'preview/../escaped.php' => 'escape']);
$r = restoreSnapshot($unsafe, $root . '/preview', $root . '/assets');
verify(($r['ok'] ?? true) === false && file_get_contents($root . '/preview/index.php') === $before, 'invalid archive entry rejects complete restore before clearing or writing source');
seed();
$r = restoreSnapshot($zip, $root . '/preview', $root . '/assets');
verify(($r['ok'] ?? false) === true && file_get_contents($root . '/preview/index.php') === 'Restored index' && file_get_contents($root . '/preview/_partials/header.php') === 'Restored header', 'verified restoration succeeds with exact captured content');
verify(file_get_contents($root . '/assets/images/kept.jpg') === 'owned upload', 'restoring retains uploaded asset boundary');
$s1 = createSnapshot($db, $root . '/snapshots', $root . '/preview', $root . '/assets', 'manual', 'First');
$s2 = createSnapshot($db, $root . '/snapshots', $root . '/preview', $root . '/assets', 'manual', 'Second');
verify($s1['ok'] && $s2['ok'] && $s1['snapshot']['filename'] !== $s2['snapshot']['filename'], 'public safety snapshots cannot overwrite earlier recovery archives within one second');
function restoreEndpoint(int $id, ?string $failure = null): array {
    global $root;
    $command = [PHP_BINARY, __DIR__ . '/helpers/call-snapshot-endpoint.php', $root . '/studio.db', $root . '/preview', $root . '/assets', (string) $id];
    if ($failure !== null) $command[] = $failure;
    $proc = proc_open($command, [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
    fclose($pipes[0]); $stdout = stream_get_contents($pipes[1]); fclose($pipes[1]); $stderr = stream_get_contents($pipes[2]); fclose($pipes[2]);
    if (proc_close($proc) !== 0 || !is_array($data = json_decode($stdout, true))) throw new RuntimeException($stdout . $stderr);
    return $data;
}
seed();
$fm = new \VoxelSite\FileManager($db); $fm->syncPageRegistry();
$beforeIndex = file_get_contents($root . '/preview/index.php');
$beforeRows = $db->query('SELECT * FROM pages ORDER BY id');
$targetZip = archive('target.zip', ['preview/index.php' => '<?php $page=["title"=>"Target","slug"=>"index"]; ?><h1 class="text-blue-500">Target</h1>', 'preview/_partials/header.php' => 'Target header', 'assets/css/style.css' => ':root { --color-primary: #369; }']);
$targetId = $db->insert('snapshots', ['filename' => basename($targetZip), 'snapshot_type' => 'manual', 'file_count' => 3, 'size_bytes' => filesize($targetZip), 'created_at' => now()]);
$r = restoreEndpoint($targetId, '--fail-after-write');
verify($r['httpCode'] === 500 && ($r['response']['error']['restored'] ?? false) === true && !empty($r['response']['error']['snapshotId']), 'interrupted public restore reports verified recovery and safety snapshot');
verify(file_get_contents($root . '/preview/index.php') === $beforeIndex && $db->query('SELECT * FROM pages ORDER BY id') === $beforeRows, 'endpoint restores exact source and page projection after a real first write');
$r = restoreEndpoint($targetId);
verify($r['httpCode'] === 200 && str_contains(file_get_contents($root . '/preview/index.php'), 'Target') && $db->queryOne("SELECT title FROM pages WHERE slug='index'")['title'] === 'Target', 'public restore succeeds through actual endpoint and synchronizes database');
verify(str_contains(file_get_contents($root . '/assets/css/tailwind.css'), '.text-blue-500'), 'successful public restore compiles required Tailwind from restored files');
verify(file_get_contents($root . '/assets/images/kept.jpg') === 'owned upload', 'public endpoint keeps uploaded assets');

// A captured readonly CSS file makes the compiler return false after restoration.
seed(); file_put_contents($root . '/assets/css/tailwind.css', 'captured readonly stylesheet'); chmod($root . '/assets/css/tailwind.css', 0444); chmod($root . '/assets/css', 0555);
$readonly = createSnapshot($db, $root . '/snapshots', $root . '/preview', $root . '/assets', 'manual', 'Readonly output');
chmod($root . '/assets/css', 0755); chmod($root . '/assets/css/tailwind.css', 0644);
file_put_contents($root . '/preview/index.php', '<?php $page=["title"=>"Before compiler failure","slug"=>"index"]; ?><h1>Before compiler failure</h1>');
$fm->syncPageRegistry(); $beforeIndex = file_get_contents($root . '/preview/index.php'); $beforeRows = $db->query('SELECT * FROM pages ORDER BY id');
$r = restoreEndpoint((int) $readonly['snapshot']['id']);
verify($r['httpCode'] === 500 && str_contains($r['response']['error']['message'] ?? '', 'compile'), 'Tailwind write failure cannot return public restore success');
verify(($r['response']['error']['restored'] ?? false) === true && file_get_contents($root . '/preview/index.php') === $beforeIndex && $db->query('SELECT * FROM pages ORDER BY id') === $beforeRows, 'compile failure restores prior files and exact page projection');
clearstatcache(true, $root . '/assets/css/tailwind.css');
verify((fileperms($root . '/assets/css/tailwind.css') & 0777) === 0644, 'compile failure restores prior file permissions');

seed(); $fm->syncPageRegistry(true);
$pageId = (int) $db->scalar("SELECT id FROM pages WHERE slug='index'");
$collectionId = $db->insert('collections', ['slug' => 'public-recovery-probe', 'name' => 'Public recovery probe', 'index_page_id' => $pageId, 'created_at' => now(), 'updated_at' => now()]);
$withAssociation = createSnapshot($db, $root . '/snapshots', $root . '/preview', $root . '/assets', 'manual', 'Stable page identity');
$db->delete('pages', 'id = ?', [$pageId]);
$r = restoreEndpoint((int) $withAssociation['snapshot']['id']);
verify($r['httpCode'] === 200 && (int) $db->scalar("SELECT id FROM pages WHERE slug='index'") === $pageId && (int) $db->scalar('SELECT index_page_id FROM collections WHERE id = ?', [$collectionId]) === $pageId, 'explicit public restore reinstates saved page identity and dependent collection association');

// Creating the safety archive must not evict the selected old archive before reading it.
$db->exec("UPDATE settings SET value='1' WHERE key='max_snapshots'");
$r = restoreEndpoint($targetId);
verify($r['httpCode'] === 200 && str_contains(file_get_contents($root . '/preview/index.php'), 'Target'), 'snapshot limit cannot delete the selected restore archive before restoration reads it');

$fm->syncPageRegistry(true);
$indexId = (int)$db->queryOne("SELECT id FROM pages WHERE slug='index'")['id'];
$collectionId = $db->insert('collections', ['slug'=>'recovered-posts','name'=>'Posts','index_page_id'=>$indexId,'created_at'=>now(),'updated_at'=>now()]);
$linked = createSnapshot($db, $root . '/snapshots', $root . '/preview', $root . '/assets', 'manual', 'Linked page');
$db->delete('pages','id = ?',[$indexId]);
$r = restoreEndpoint((int)$linked['snapshot']['id']);
verify($r['httpCode'] === 200 && (int)$db->queryOne("SELECT id FROM pages WHERE slug='index'")['id'] === $indexId
    && (int)$db->queryOne('SELECT index_page_id FROM collections WHERE id = ?',[$collectionId])['index_page_id'] === $indexId,
    'public safety recovery restores stable page IDs and collection index associations');

echo "Snapshot recovery: {$passed} passed, {$failed} failed. Fixture: {$root}\n";
exit($failed ? 1 : 0);
