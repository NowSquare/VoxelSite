<?php

declare(strict_types=1);

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
file_put_contents($root . '/.agent-pages-test', 'disposable');
try {
    copyTree(__DIR__ . '/../engine', $root . '/_studio/engine');
    copyTree(__DIR__ . '/../api/agent/v1', $root . '/_studio/api/agent/v1');
    mkdir($root . '/_studio/preview', 0700);
    symlink(realpath(dirname(__DIR__, 2) . '/vendor'), $root . '/vendor');
    $keys = requestPages($root, ['operation' => 'setup']);
    $db = Database::getInstance($root . '/_studio/data/studio.db');
    check((int) $db->scalar('PRAGMA foreign_keys') === 1, 'Foreign-key enforcement stays enabled');
    check($db->count('users', 'id = ?', [0]) === 0, 'Installation has no artificial user ID zero');
    check(requestPages($root, ['method' => 'GET', 'path' => '/pages', 'key' => $keys['agent']])['status'] === 200,
        'Authenticated page listing succeeds');
    $schema = requestPages($root, ['method' => 'GET', 'path' => '/schema']);
    check($schema['status'] === 200, 'Public schema remains accessible without authentication');
    foreach ([['/pages', 'post'], ['/pages/{slug}', 'put']] as [$path, $method]) {
        check(isset($schema['response']['paths'][$path][$method]['responses']['500']),
            "$method schema documents the missing-owner server error");
    }
    $original = file_get_contents($root . '/_studio/preview/existing.php');
    $payload = ['slug' => 'created', 'title' => 'Created', 'content' => '<?php /* created */ ?><h1>Created</h1>'];
    foreach (['agent', 'editor'] as $role) {
        $slug = 'created-' . $role;
        $create = requestPages($root, ['method' => 'POST', 'path' => '/pages', 'key' => $keys[$role],
            'body' => array_replace($payload, ['slug' => $slug])]);
        check($create['status'] === 201, "$role page creation returns 201");
        check(is_file($root . '/_studio/preview/' . $slug . '.php'), "$role page creation writes its file");
        $revision = $db->queryOne('SELECT * FROM revisions ORDER BY id DESC LIMIT 1');
        check($revision !== null && (int) $revision['user_id'] === 7, "$role creation revision references the real owner");
        check($revision !== null && is_file($root . '/_studio/revisions/' . $revision['id'] . '/after/' . $slug . '.php'),
            "$role creation captures its after-state");
        $content = '<?php /* updated by ' . $role . ' */ ?><h1>Updated</h1>';
        $before = file_get_contents($root . '/_studio/preview/existing.php');
        $update = requestPages($root, ['method' => 'PUT', 'path' => '/pages/existing', 'key' => $keys[$role],
            'body' => ['content' => $content, 'user_id' => 1]]);
        check($update['status'] === 200, "$role page update returns 200");
        check(file_get_contents($root . '/_studio/preview/existing.php') === $content, "$role update writes the requested content");
        $revision = $db->queryOne('SELECT * FROM revisions ORDER BY id DESC LIMIT 1');
        check($revision !== null && (int) $revision['user_id'] === 7, "$role update uses owner attribution regardless of caller-supplied user_id");
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
    // A malformed installation must fail before any revision/history mutation.
    $db->update('users', ['role' => 'editor'], 'id = ?', [7]);
    check(requestPages($root, ['method' => 'GET', 'path' => '/pages', 'key' => $keys['agent']])['status'] === 200,
        'Missing-owner guard only affects writes');
    if (count($revisions) === 4) {
        $db->update('revisions', ['is_undone' => 1], 'id = ?', [$revisions[3]['id']]);
        $db->update('settings', ['value' => json_encode($revisions[2]['id'])], 'key = ?', ['revision_pointer']);
    }
    $revisions = $db->query('SELECT * FROM revisions ORDER BY id');
    $content = file_get_contents($root . '/_studio/preview/existing.php');
    foreach ([['POST', '/pages', $payload], ['PUT', '/pages/existing', ['content' => $original]]] as [$method, $path, $body]) {
        $missing = requestPages($root, compact('method', 'path', 'body') + ['key' => $keys['agent']]);
        check($missing['status'] === 500 && ($missing['response']['error']['code'] ?? '') === 'no_owner',
            "$method reports missing installation owner explicitly");
        check($db->query('SELECT * FROM revisions ORDER BY id') === $revisions, "$method missing-owner failure preserves redo history");
        check(!is_file($root . '/_studio/preview/created.php')
            && file_get_contents($root . '/_studio/preview/existing.php') === $content,
            "$method missing-owner failure leaves page files unchanged");
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
