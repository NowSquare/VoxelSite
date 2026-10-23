<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';


$passed = 0; $errors = [];
function check(bool $ok, string $message): void
{
    global $passed, $errors;
    $ok ? $passed++ : $errors[] = $message;
}
function copyTree(string $source, string $target): void
{
    if (is_link($source)) throw new RuntimeException('Fixture source cannot contain links.');
    mkdir($target, 0700, true);
    foreach (scandir($source) as $name) {
        if ($name === '.' || $name === '..') continue;
        is_dir($source . '/' . $name) ? copyTree($source . '/' . $name, $target . '/' . $name)
            : copy($source . '/' . $name, $target . '/' . $name);
    }
}
function removeTree(string $path): void
{
    if (is_link($path) || is_file($path)) { unlink($path); return; }
    foreach (scandir($path) as $name) {
        if ($name !== '.' && $name !== '..') removeTree($path . '/' . $name);
    }
    rmdir($path);
}
function request(string $root, array $input): array
{
    $process = proc_open([PHP_BINARY, __DIR__ . '/helpers/call-workspace-route.php', $root],
        [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
    if (!is_resource($process)) throw new RuntimeException('Cannot start workspace route test.');
    fwrite($pipes[0], json_encode($input, JSON_THROW_ON_ERROR)); fclose($pipes[0]);
    $output = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $stderr = stream_get_contents($pipes[2]); fclose($pipes[2]);
    if (proc_close($process) !== 0 || $stderr !== '') throw new RuntimeException('Workspace route test failed: ' . $stderr);
    return json_decode($output, true, 512, JSON_THROW_ON_ERROR);
}
$root = sys_get_temp_dir() . '/workspace-route-' . bin2hex(random_bytes(8));
mkdir($root, 0700);
file_put_contents($root . '/.workspace-route-test', 'disposable');
try {
    \VoxelSite\Tests\StudioRuntimeFixture::copy($root);
    foreach (['router.php', 'middleware.php', 'endpoints/workspace.php'] as $file) {
        copy(__DIR__ . '/../api/' . $file, $root . '/_studio/api/' . $file);
    }
    foreach (['_studio/preview', 'assets/css'] as $directory) mkdir($root . '/' . $directory, 0700, true);
    file_put_contents($root . '/assets/css/style.css', ':root { --color-primary: #123456; }');
    file_put_contents($root . '/_studio/preview/index.php', '<main>Retained draft</main>');
    symlink('../../assets', $root . '/_studio/preview/assets');
    $sessions = request($root, ['operation' => 'setup']);
    foreach (['/workspace/status', '/workspace/migrate', '/workspace/rollback'] as $path) {
        $method = $path === '/workspace/status' ? 'GET' : 'POST';
        check(request($root, compact('method', 'path'))['status'] === 401, "$path requires a session");
        check(request($root, compact('method', 'path') + ['session' => $sessions['editor'],
            'csrf' => $sessions['editor']])['status'] === 403, "$path requires the owner");
    }
    foreach (['/workspace/migrate', '/workspace/rollback'] as $path) {
        foreach ([null, 'wrong-token'] as $csrf) {
            $result = request($root, ['method' => 'POST', 'path' => $path, 'session' => $sessions['owner'], 'csrf' => $csrf]);
            check($result['status'] === 403 && $result['response']['error']['code'] === 'csrf_failed',
                "$path verifies the session-bound CSRF token");
        }
    }
    $status = request($root, ['method' => 'GET', 'path' => '/workspace/status', 'session' => $sessions['owner']]);
    check($status['status'] === 200 && $status['response']['data']['format'] === 1,
        'Owner status reports an inactive migration');
    check(is_link($root . '/_studio/preview/assets') && !file_exists($root . '/_studio/preview/.htaccess')
        && !file_exists($root . '/_studio/data/workspace-migration'),
        'Status GET performs no copy, access rewrite, or activation');
    check(request($root, ['method' => 'GET', 'path' => '/workspace/migrate', 'session' => $sessions['owner']])['status'] === 404,
        'Migration cannot be triggered by GET');
    $blocked = request($root, ['method' => 'POST', 'path' => '/workspace/migrate', 'session' => $sessions['owner'],
        'csrf' => $sessions['owner'], 'body' => ['base_url' => 'https://configured.example.test']]);
    check($blocked['status'] === 409 && str_contains($blocked['response']['error']['message'], 'server must supply'),
        'Owner migration fails closed before network when trusted server address is unavailable');
    check(request($root, ['method' => 'GET', 'path' => '/workspace/probe', 'query' => ['nonce' => str_repeat('a', 48)]])['status'] === 404,
        'Public probe discloses nothing without an active random challenge');
    check(file_get_contents($root . '/assets/css/style.css') === ':root { --color-primary: #123456; }'
        && file_get_contents($root . '/_studio/preview/index.php') === '<main>Retained draft</main>'
        && is_link($root . '/_studio/preview/assets') && !file_exists($root . '/_studio/preview/.htaccess'),
        'Every denied or unavailable upgrade path preserves published and draft content');
} finally {
    removeTree($root);
}
foreach ($errors as $error) echo "FAIL: $error\n";
echo "Workspace upgrade routes: {$passed} passed, " . count($errors) . " failed\n";
exit($errors === [] ? 0 : 1);
