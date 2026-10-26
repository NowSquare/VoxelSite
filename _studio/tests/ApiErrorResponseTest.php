<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';

$root = sys_get_temp_dir() . '/voxelsite-api-errors-' . bin2hex(random_bytes(8));
mkdir($root, 0700);
$server = null;
$checks = 0;
function check(bool $condition, string $message): void {
    global $checks;
    if (!$condition) throw new RuntimeException($message);
    $checks++;
}
function request(string $url): array {
    $context = stream_context_create(['http' => ['ignore_errors' => true, 'timeout' => 5]]);
    $stream = fopen($url, 'rb', false, $context);
    if ($stream === false) throw new RuntimeException('HTTP fixture failed');
    $body = stream_get_contents($stream);
    $headers = stream_get_meta_data($stream)['wrapper_data'];
    fclose($stream);
    preg_match('/\s(\d{3})\s/', $headers[0], $match);
    return [(int) $match[1], $body, implode("\n", $headers)];
}
function removeFixture(string $path): void {
    foreach (new DirectoryIterator($path) as $entry) {
        if ($entry->isDot()) continue;
        $entry->isDir() && !$entry->isLink() ? removeFixture($entry->getPathname()) : unlink($entry->getPathname());
    }
    rmdir($path);
}

try {
    \VoxelSite\Tests\StudioRuntimeFixture::copy($root);
    mkdir($root . '/_studio/logs', 0700);
    file_put_contents($root . '/ready.php', '<?php echo "ready";');
    // Only the leaf endpoint is replaced: bootstrap, routing and middleware
    // run their production bytes, with deterministic failures at dispatch.
    file_put_contents($root . '/_studio/api/endpoints/install.php', <<<'PHP'
<?php
$mode = $_GET['mode'] ?? 'exception';
if ($mode === 'intentional') {
    jsonResponse(['ok' => false, 'error' => ['code' => 'invalid_schema', 'message' => 'Choose a provider.']], 422);
    exit;
}
if (in_array($mode, ['buffered', 'nested', 'fixed-buffer'], true)) {
    ob_start(null, 0, $mode === 'fixed-buffer'
        ? PHP_OUTPUT_HANDLER_CLEANABLE | PHP_OUTPUT_HANDLER_FLUSHABLE
        : PHP_OUTPUT_HANDLER_STDFLAGS);
    echo 'private/path secret-api-key';
    if ($mode === 'nested') { ob_start(); echo '<p>private/path secret-api-key</p>'; }
}
if ($mode === 'sse') {
    header('Content-Type: text/event-stream');
    echo "data: {\"type\":\"token\",\"content\":\"Working\"}\n\n";
    flush();
}
if ($mode === 'committed') {
    echo '{"ok":true,"data":{"saved":true}}';
    flush();
}
throw new InvalidArgumentException('private/path secret-api-key');
PHP);
    $socket = stream_socket_server('tcp://127.0.0.1:0', $errno, $error);
    if ($socket === false) throw new RuntimeException('Cannot reserve fixture port');
    $address = stream_socket_get_name($socket, false);
    fclose($socket);
    $server = proc_open([PHP_BINARY, '-d', 'display_errors=0', '-d', 'output_buffering=0',
        '-d', 'error_log=' . $root . '/php-errors.log', '-S', $address, '-t', $root],
        [0 => ['pipe', 'r'], 1 => ['file', $root . '/server.log', 'a'], 2 => ['file', $root . '/server.log', 'a']], $pipes);
    if (!is_resource($server)) throw new RuntimeException('Cannot start fixture server');
    fclose($pipes[0]);
    $ready = false;
    for ($attempt = 0; $attempt < 100; $attempt++) {
        $probe = @fsockopen('127.0.0.1', (int) substr(strrchr($address, ':'), 1), $errno, $error, 0.05);
        if ($probe) { fclose($probe); $ready = true; break; }
        usleep(20000);
    }
    check($ready, 'Fixture server starts');
    $base = 'http://' . $address . '/_studio/api/router.php?_path=';
    [$status, $raw, $headers] = request($base . '/install/providers');
    $data = json_decode($raw, true);
    check($status === 500, 'Uncaught endpoint exception has HTTP 500');
    check(($data['ok'] ?? null) === false && ($data['error']['code'] ?? null) === 'internal_error', 'Uncaught exception has a structured JSON error');
    check(str_contains(strtolower($headers), 'content-type: application/json'), 'Fallback sets JSON content type');
    check(!str_contains($raw, 'private/path') && !str_contains($raw, 'secret-api-key'), 'Response does not expose exception details');
    foreach (['buffered', 'nested', 'fixed-buffer'] as $mode) {
        [$status, $raw] = request($base . '/install/providers&mode=' . $mode);
        check($status === 500 && (json_decode($raw, true)['error']['code'] ?? null) === 'internal_error'
            && !str_contains($raw, 'private/path') && !str_contains($raw, 'secret-api-key'),
            'Buffered output is discarded safely: ' . $mode);
    }
    [$status, $raw] = request($base . '/pages');
    check($status === 401 && json_decode($raw, true)['error']['code'] === 'unauthorized', 'Authorization response remains unchanged');
    [$status, $raw] = request($base . '/install/providers&mode=intentional');
    check($status === 422 && json_decode($raw, true)['error']['message'] === 'Choose a provider.', 'Intentional endpoint status and error survive');
    [$status, $raw, $headers] = request($base . '/install/providers&mode=sse');
    check($status === 200 && str_contains($headers, 'text/event-stream'), 'Started SSE retains its status and content type');
    $events = array_values(array_map(static fn($event) => json_decode(substr($event, 6), true),
        array_filter(explode("\n\n", trim($raw)), static fn($event) => trim($event) !== '')));
    check(count($events) === 2 && $events[0]['type'] === 'token' && $events[1]['type'] === 'error'
        && $events[1]['code'] === 'internal_error', 'Started SSE ends with a valid terminal error frame');
    check(!str_contains($raw, 'secret-api-key'), 'SSE error does not expose exception details');
    [$status, $raw] = request($base . '/install/providers&mode=committed');
    check($status === 200 && $raw === '{"ok":true,"data":{"saved":true}}', 'Committed non-SSE response is not corrupted by appended JSON');
    file_put_contents($root . '/_studio/engine/bootstrap.php', "\nthrow new RuntimeException('bootstrap-secret');\n", FILE_APPEND);
    [$status, $raw] = request($base . '/install/providers');
    check($status === 500 && (json_decode($raw, true)['error']['code'] ?? null) === 'internal_error'
        && !str_contains($raw, 'bootstrap-secret'), 'Bootstrap exceptions also receive a safe JSON error');
    echo "Passed {$checks} API error response checks.\n";
} finally {
    if (is_resource($server)) { proc_terminate($server); proc_close($server); }
    removeFixture($root);
}
