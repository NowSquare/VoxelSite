<?php

declare(strict_types=1);
require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';


require_once dirname(__DIR__, 2) . '/vendor/autoload.php';

use VoxelSite\Database;

$passed = 0;
$errors = [];
function check(bool $ok, string $message): void
{
    global $passed, $errors;
    $ok ? $passed++ : $errors[] = $message;
}
function copyTree(string $source, string $target): void
{
    mkdir($target, 0700, true);
    foreach (scandir($source) as $name) {
        if ($name === '.' || $name === '..') { continue; }
        is_dir($source . '/' . $name)
            ? copyTree($source . '/' . $name, $target . '/' . $name)
            : copy($source . '/' . $name, $target . '/' . $name);
    }
}
function removeTree(string $path): void
{
    foreach (scandir($path) as $name) {
        if ($name === '.' || $name === '..') { continue; }
        $file = $path . '/' . $name;
        is_dir($file) && !is_link($file) ? removeTree($file) : unlink($file);
    }
    rmdir($path);
}
function requestPages(string $root, array $input): array
{
    $process = proc_open([PHP_BINARY, __DIR__ . '/helpers/call-agent-pages.php', $root],
        [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
    if (!is_resource($process)) { throw new RuntimeException('Cannot start Agent pages test.'); }
    fwrite($pipes[0], json_encode($input, JSON_THROW_ON_ERROR));
    fclose($pipes[0]);
    $output = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $stderr = stream_get_contents($pipes[2]); fclose($pipes[2]);
    if (proc_close($process) !== 0 || $stderr !== '') {
        throw new RuntimeException('Agent pages subprocess failed: ' . $stderr);
    }
    return json_decode($output, true, 512, JSON_THROW_ON_ERROR);
}

$root = sys_get_temp_dir() . '/voxelsite-agent-pages-' . bin2hex(random_bytes(8));
mkdir($root, 0700);
$root=realpath($root);
file_put_contents($root . '/.agent-pages-test', 'disposable');
try {
    \VoxelSite\Tests\StudioRuntimeFixture::copy($root);
    mkdir($root . '/_studio/preview', 0700);
    $keys = requestPages($root, ['operation' => 'setup']);
    $db = Database::getInstance($root . '/_studio/data/studio.db');
    check((int) $db->scalar('PRAGMA foreign_keys') === 1, 'Foreign-key enforcement stays enabled');
    check($db->count('users', 'id = ?', [0]) === 0, 'Installation has no artificial user ID zero');
    check(requestPages($root, ['method' => 'GET', 'path' => '/pages', 'key' => $keys['agent']])['status'] === 200,
        'Authenticated page listing succeeds');
    $schema = requestPages($root, ['method' => 'GET', 'path' => '/schema']);
    check($schema['status'] === 200, 'Public schema remains accessible without authentication');
    foreach ([['/pages', 'post'], ['/pages/{slug}', 'put']] as [$path, $method]) {
        check(isset($schema['response']['paths'][$path][$method]['responses']['409']),
            "$method schema documents bound-credential and source conflicts");
    }
    $version=static fn()=> 'draft:'.$db->scalar('SELECT draft_version FROM site_workspace_state WHERE id=1');
    $original = file_get_contents($root . '/_studio/preview/existing.php');
    $payload = ['slug' => 'created', 'title' => 'Created', 'content' => '<?php /* created */ ?><h1>Created</h1>'];
    foreach (['agent', 'editor'] as $role) {
        $slug = 'created-' . $role;
        $create = requestPages($root, ['method' => 'POST', 'path' => '/pages', 'key' => $keys[$role],
            'body' => array_replace($payload, ['slug' => $slug,'operation_id'=>'old-create-'.$role.'-001','base_draft_version'=>$version(),'expected_content_sha256'=>null])]);
        if($create['status']!==201)fwrite(STDERR,json_encode($create)."\n");
        check($create['status'] === 201, "$role page creation returns 201");
        check(is_file($root . '/_studio/preview/' . $slug . '.php'), "$role page creation writes its file");
        $revision = $db->queryOne('SELECT * FROM revisions ORDER BY id DESC LIMIT 1');
        check($revision !== null && (int) $revision['user_id'] === ($role==='agent'?7:1), "$role creation revision references the explicitly bound account");
        check($revision !== null && is_file($root . '/_studio/revisions/' . $revision['id'] . '/after/' . $slug . '.php'),
            "$role creation captures its after-state");
        $content = '<?php /* updated by ' . $role . ' */ ?><h1>Updated</h1>';
        $before = file_get_contents($root . '/_studio/preview/existing.php');
        $body=['operation_id'=>'old-update-'.$role.'-001','base_draft_version'=>$version(),'expected_content_sha256'=>hash('sha256',$before),'content'=>$content];
        $spoof=requestPages($root,['method'=>'PUT','path'=>'/pages/existing','key'=>$keys[$role],'body'=>$body+['user_id'=>7]]);
        check($spoof['status']===422,"$role cannot supply revision attribution");
        $update = requestPages($root, ['method' => 'PUT', 'path' => '/pages/existing', 'key' => $keys[$role], 'body'=>$body]);
        if($update['status']!==200)fwrite(STDERR,json_encode($update)."\n");
        check($update['status'] === 200, "$role page update returns 200");
        check(str_contains(file_get_contents($root . '/_studio/preview/existing.php'), 'updated by ' . $role), "$role update writes the requested content");
        $revision = $db->queryOne('SELECT * FROM revisions ORDER BY id DESC LIMIT 1');
        check($revision !== null && (int) $revision['user_id'] === ($role==='agent'?7:1), "$role update uses current bound account attribution");
        $beforePath = $root . '/_studio/revisions/' . ($revision['id'] ?? 0) . '/before/existing.php';
        check(is_file($beforePath) && file_get_contents($beforePath) === $before, "$role update preserves its before-state");
    }
    $revisions = $db->query('SELECT * FROM revisions ORDER BY id');
    check(count($revisions) === 4, 'Every successful write records one revision');
    check(requestPages($root, ['method' => 'POST', 'path' => '/pages', 'body' => $payload])['status'] === 401,
        'Page creation still requires authentication');
    foreach ([['POST', '/pages', $payload], ['PUT', '/pages/existing', ['content' => $original]]] as [$method, $path, $body]) {
        $denied = requestPages($root, compact('method', 'path', 'body') + ['key' => $keys['viewer']]);
        check($denied['status'] === 403, "$method denies a read-only key");
    }
    check($db->query('SELECT * FROM revisions ORDER BY id') === $revisions, 'Denied writes create no revisions');
    // Account demotion must fail before any revision/history mutation.
    $db->update('users', ['role' => 'viewer'], 'id = ?', [7]);
    check(requestPages($root, ['method' => 'GET', 'path' => '/pages', 'key' => $keys['agent']])['status'] === 200,
        'Demoted account may still read pages');
    if (count($revisions) === 4) {
        $db->update('revisions', ['is_undone' => 1], 'id = ?', [$revisions[3]['id']]);
        $db->update('settings', ['value' => json_encode($revisions[2]['id'])], 'key = ?', ['revision_pointer']);
    }
    $revisions = $db->query('SELECT * FROM revisions ORDER BY id');
    $content = file_get_contents($root . '/_studio/preview/existing.php');
    foreach ([['POST', '/pages', $payload], ['PUT', '/pages/existing', ['content' => $original]]] as [$method, $path, $body]) {
        $body+=['operation_id'=>'demoted-'.strtolower($method).'-001','base_draft_version'=>$version(),'expected_content_sha256'=>$method==='POST'?null:hash('sha256',$content)];
        $missing = requestPages($root, compact('method', 'path', 'body') + ['key' => $keys['agent']]);
        check($missing['status'] === 403 && ($missing['response']['error']['code'] ?? '') === 'permission_denied',
            "$method rechecks the bound account's current authority");
        check($db->query('SELECT * FROM revisions ORDER BY id') === $revisions, "$method demoted-account failure preserves redo history");
        check(!is_file($root . '/_studio/preview/created.php')
            && file_get_contents($root . '/_studio/preview/existing.php') === $content,
            "$method demoted-account failure leaves page files unchanged");
    }
    check($db->query('PRAGMA foreign_key_check') === [], 'All stored records preserve foreign-key integrity');
    check($db->count('users', 'id = ?', [0]) === 0, 'No write inserts an artificial API user');
} catch (Throwable $error) {
    $errors[] = $error->getMessage();
} finally {
    Database::resetInstance();
    removeTree($root);
}
foreach ($errors as $error) { echo "FAIL: {$error}\n"; }
echo "Agent pages revisions: {$passed} passed, " . count($errors) . " failed\n";
exit($errors === [] ? 0 : 1);
