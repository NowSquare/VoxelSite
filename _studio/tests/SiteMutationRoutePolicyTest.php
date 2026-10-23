<?php
declare(strict_types=1);

/** Real routers: website concurrency must not freeze unrelated Studio state. */
$source = dirname(__DIR__, 2);
$root = sys_get_temp_dir() . '/vs-site-route-policy-' . bin2hex(random_bytes(6));
$checks = 0;
$failures = [];

function fixturePort(): int {
    $socket = stream_socket_server('tcp://127.0.0.1:0', $number, $message);
    if (!$socket) throw new RuntimeException($message);
    $port = (int) substr(strrchr(stream_socket_get_name($socket, false), ':'), 1);
    fclose($socket);
    return $port;
}
function fixtureCommand(array $command): string {
    $process = proc_open($command, [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
    fclose($pipes[0]);
    $output = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $error = stream_get_contents($pipes[2]); fclose($pipes[2]);
    if (proc_close($process) !== 0) throw new RuntimeException($error . $output);
    return $output;
}
function checkRoute(bool $condition, string $label): void {
    global $checks, $failures;
    $checks++;
    if (!$condition) $failures[] = $label;
    echo ($condition ? 'PASS ' : 'FAIL ') . $label . "\n";
}
function routeRequest(string $method, string $path, ?array $body = null, bool $agent = false, ?int $role = 1, bool $csrf = true): array {
    global $root, $url, $agentKey;
    $curl = curl_init($url . '/_studio/api/router.php?_path=' . urlencode(($agent ? '/agent/v1' : '') . $path));
    $headers = ['Accept: application/json'];
    if ($agent) $headers[] = 'Authorization: Bearer ' . $agentKey;
    elseif ($role !== null) {
        $headers[] = 'Cookie: vs_session=' . str_repeat((string) $role, 64);
        if ($csrf) $headers[] = 'X-VS-Token: ' . str_repeat((string) $role, 64);
    }
    if ($body !== null) $headers[] = 'Content-Type: application/json';
    curl_setopt_array($curl, [CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 20]);
    if ($body !== null) curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($body));
    $raw = curl_exec($curl);
    if ($raw === false) throw new RuntimeException(curl_error($curl));
    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE); unset($curl);
    file_put_contents($root . '/http-transcript.jsonl', json_encode(compact('method', 'path', 'body', 'agent', 'status', 'raw'), JSON_INVALID_UTF8_SUBSTITUTE) . "\n", FILE_APPEND);
    return ['status' => $status, 'raw' => $raw, 'json' => json_decode($raw, true)];
}

require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';
mkdir($root, 0700, true);
\VoxelSite\Tests\StudioRuntimeFixture::copy($root, $source);
foreach (['_studio/preview/_partials', '_studio/preview/services', 'assets/css', 'assets/js', 'assets/data', '_studio/data'] as $path) {
    if (!is_dir($root . '/' . $path)) mkdir($root . '/' . $path, 0700, true);
}
$providerPort = fixturePort(); $httpPort = fixturePort(); $url = 'http://127.0.0.1:' . $httpPort;
copy(__DIR__ . '/helpers/site-release-provider.php', $root . '/provider.php');
$providerSource = file_get_contents($root . '/provider.php');
$providerSource = str_replace("\$system=\$body['messages'][0]['content'] ?? '';", <<<'PHP'
if (!empty($body['stream'])) {
    header('Content-Type: text/event-stream');
    echo 'data: ' . json_encode(['choices' => [['delta' => ['content' => '<message>Fixture background request completed.</message>'], 'finish_reason' => null]]]) . "\n\n";
    echo 'data: ' . json_encode(['choices' => [['delta' => new stdClass(), 'finish_reason' => 'stop']]]) . "\n\n";
    echo "data: [DONE]\n\n";
    return;
}
$system=$body['messages'][0]['content'] ?? '';
PHP, $providerSource);
file_put_contents($root . '/provider.php', $providerSource);
$provider = proc_open([PHP_BINARY, '-S', '127.0.0.1:' . $providerPort, $root . '/provider.php'],
    [['pipe', 'r'], ['file', $root . '/provider.log', 'a'], ['file', $root . '/provider.log', 'a']], $pipes, $root); fclose($pipes[0]);
echo fixtureCommand([PHP_BINARY, __DIR__ . '/helpers/setup-site-release.php', $root, 'http://127.0.0.1:' . $providerPort . '/v1', $url]);
fixtureCommand([PHP_BINARY, '-r', 'require $argv[1] . "/_studio/engine/bootstrap.php"; new VoxelSite\\AgentAuth();', $root]);

// The PHP CLI resolver varies by host. Resolve to this test's PHP 8.2+ binary,
// while exercising the real prompt endpoint, detached worker and PromptEngine.
file_put_contents($root . '/fixture-cli.php', '<?php namespace VoxelSite; final class PhpCliResolver { public static function resolve(): ?string { return ' . var_export(PHP_BINARY, true) . '; } }');
file_put_contents($root . '/http-router.php', <<<'PHP'
<?php
$path = $_GET['_path'] ?? '';
if ($path === '/agent/v1/prompt' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    require __DIR__ . '/fixture-cli.php';
    // Keep the enqueue request alive until the worker attempts execution.
    // This makes holding the request's website lock across spawn reproducible.
    register_shutdown_function(static function (): void {
        $db = new PDO('sqlite:' . __DIR__ . '/_studio/data/studio.db');
        $deadline = microtime(true) + 5;
        while (microtime(true) < $deadline) {
            $status = $db->query('SELECT status FROM prompt_log ORDER BY id DESC LIMIT 1')->fetchColumn();
            if (in_array($status, ['success', 'error', 'partial'], true)) return;
            usleep(10000);
        }
    });
}
require __DIR__ . '/_studio/api/router.php';
PHP);
$server = proc_open([PHP_BINARY, '-S', '127.0.0.1:' . $httpPort, '-t', $root, $root . '/http-router.php'],
    [['pipe', 'r'], ['file', $root . '/http.log', 'a'], ['file', $root . '/http.log', 'a']], $pipes, $root); fclose($pipes[0]);
$pdo = new PDO('sqlite:' . $root . '/_studio/data/studio.db');
$agentKey = 'vxs_' . str_repeat('a', 64);
$pdo->prepare('INSERT INTO api_keys (key_hash,key_prefix,label,role,scopes,rate_limit,created_at) VALUES (?,?,?,?,?,?,?)')->execute([
    hash('sha256', $agentKey), substr($agentKey, 0, 12), 'Route policy fixture', 'owner',
    json_encode(['pages:read', 'pages:write', 'settings:read', 'settings:write', 'tools:invoke', 'compile:trigger', 'prompt:execute']), 1000, gmdate('c')]);
$pdo->prepare('INSERT OR REPLACE INTO settings (key,value,updated_at) VALUES (?,?,?)')->execute(['agent_api_enabled', 'true', gmdate('c')]);
$apiId = (int) $pdo->query('SELECT MAX(id) FROM api_keys')->fetchColumn();
$pdo->prepare('INSERT INTO agent_rest_owners (key_id,user_id,bound_by,bound_at) VALUES (?,?,?,?)')->execute([$apiId, 1, 1, time()]);

try {
    for ($i = 0; $i < 50; $i++) { $socket = @fsockopen('127.0.0.1', $httpPort, $number, $message, .1); if ($socket) { fclose($socket); break; } usleep(20000); }
    // A real managed published source lets exports prove read availability,
    // rather than merely reaching an invalid-request branch.
    $pdo->exec('UPDATE pages SET is_published = 0');
    $pdo->prepare('INSERT OR REPLACE INTO settings (key,value,updated_at) VALUES (?,?,?)')->execute(['last_published_at', json_encode(gmdate('c')), gmdate('c')]);
    file_put_contents($root . '/assets/data/site.json', json_encode(['name' => 'Published business during generation']));
    file_put_contents($root . '/_studio/data/published-manifest.json', json_encode(['files' => ['index.php'],
        'asset_hashes' => ['assets/css/style.css' => hash_file('sha256', $root . '/assets/css/style.css'),
            'assets/data/site.json' => hash_file('sha256', $root . '/assets/data/site.json')]]));
    $exportVersion = routeRequest('GET', '/export')['json']['data']['version'];
    $draftVersion = routeRequest('GET', '/site/reset')['json']['data']['draft_version'];
    $resetReview = routeRequest('POST', '/site/reset/prepare', ['operation_id' => 'route-reset-busy', 'base_draft_version' => $draftVersion])['json']['data'];
    $resetBody = ['plan_id' => $resetReview['plan_id'], 'digest' => $resetReview['digest'], 'confirm' => 'RESET'];
    $configuration = routeRequest('GET', '/settings')['json']['data'];
    $settingVersions = ['identity' => $configuration['versions']['identity']];
    $fileBefore = file_get_contents($root . '/_studio/preview/about.php');
    $conversationId = 'route-policy-stale-conversation';
    $oldTime = gmdate('Y-m-d\TH:i:s\Z', time() - 600);
    $pdo->prepare('INSERT INTO conversations (id,user_id,title,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?)')->execute([
        $conversationId, 1, 'Interrupted Chat fixture', 1, $oldTime, $oldTime]);
    $pdo->prepare('INSERT INTO prompt_log (conversation_id,user_id,action_type,user_prompt,ai_provider,ai_model,status,last_progress_at,created_at) VALUES (?,?,?,?,?,?,?,?,?)')->execute([
        $conversationId, 1, 'free_prompt', 'Interrupted Chat fixture', 'openai_compatible', 'fixture-model', 'streaming', $oldTime, $oldTime]);
    $staleJobId = (int) $pdo->lastInsertId();
    $compiledMarker = '/* Existing compiled CSS must not be replaced during another writer. */';
    file_put_contents($root . '/_studio/preview/assets/css/tailwind.css', $compiledMarker);
    $lock = fopen($root . '/_studio/data/site-mutation.lock', 'c');
    if (!flock($lock, LOCK_EX | LOCK_NB)) throw new RuntimeException('Cannot establish fixture writer.');
    foreach ([
        ['POST', '/notes', ['request_id' => 'route-lock-note-001', 'title' => 'While generation runs', 'body' => 'Keep writing notes.'], 201],
        ['POST', '/cards', ['request_id' => 'route-lock-card-001', 'title' => 'While generation runs'], 201],
        ['PUT', '/auth/profile', ['name' => 'Fixture owner', 'email' => 'owner@example.test'], 200],
        ['PUT', '/settings', ['operation_id' => 'route-settings-busy', 'versions' => $settingVersions, 'values' => ['site_tagline' => 'Available during generation']], 409],
        ['POST', '/settings/test-api', ['provider' => 'openai', 'api_key' => 'invalid'], 422],
        ['POST', '/export', ['operation_id' => 'route-export-busy', 'version' => $exportVersion, 'format' => 'php'], 409],
        ['GET', '/update/inspect', null, 200],
        ['POST', '/ai/cancel-generation', [], 422],
    ] as [$method, $path, $body, $expected]) {
        $response = routeRequest($method, $path, $body);
        checkRoute($response['status'] === $expected, $method . ' ' . $path . ' follows its lock policy while a website writer is active (' . $response['status'] . ')');
    }
    checkRoute(routeRequest('PUT', '/settings', ['operation_id' => 'route-rest-settings-busy', 'versions' => $settingVersions, 'values' => ['site_tagline' => 'Agent available']], true)['status'] === 409, 'Retained REST configuration is serialized by the common lock');
    $business = routeRequest('POST', '/tools/invoke', ['name' => 'get_business_info', 'arguments' => (object) []], true);
    checkRoute($business['status'] === 200 && ($business['json']['data']['name'] ?? null) === 'Published business during generation',
        'Agent read-only tool invocation returns published information during a website change');
    $draftVersion = routeRequest('GET', '/site/reset')['json']['data']['draft_version'];
    foreach ([['PUT', '/files/content', ['operation_id' => 'route-file-blocked', 'base_draft_version' => $draftVersion, 'expected_content_sha256' => hash('sha256', $fileBefore), 'path' => 'about.php', 'content' => 'must not write']],
        ['POST', '/site-control/page-rename', ['operation_id' => 'route-rename-blocked', 'base_draft_version' => $draftVersion, 'pageId' => 'page:about.php', 'newTitle' => 'Must not rename']],
        ['POST', '/publish', ['operation_id' => 'route-publish-blocked']], ['POST', '/revisions/undo', ['operation_id' => 'route-undo-blocked']], ['POST', '/snapshots', ['operation_id' => 'route-snapshot-busy', 'domain' => 'draft', 'label' => 'Must wait']],
        ['POST', '/site/reset', $resetBody], ['POST', '/site/reset-install/prepare', ['operation_id' => 'route-factory-busy', 'base_draft_version' => $draftVersion]]] as [$method, $path, $body]) {
        checkRoute(routeRequest($method, $path, $body)['status'] === 409, $method . ' ' . $path . ' remains serialized against the active website writer');
    }
    checkRoute(routeRequest('POST', '/compile', ['operation_id' => 'route-compile-blocked', 'base_draft_version' => $draftVersion], true)['status'] === 409, 'Agent Tailwind writes remain serialized');
    $approval = routeRequest('POST', '/governor/pending/fixture/approve', ['reason' => 'Reviewed fixture heading']);
    checkRoute(($approval['json']['error']['code'] ?? '') === 'site_busy', 'Owner heading approval shares the website lock before candidate lookup');
    $history = routeRequest('GET', '/ai/conversations/' . $conversationId);
    checkRoute($history['status'] === 200 && file_get_contents($root . '/_studio/preview/assets/css/tailwind.css') === $compiledMarker,
        'Reading interrupted Chat history stays available without compiling over an active website writer');
    checkRoute(file_get_contents($root . '/_studio/preview/about.php') === $fileBefore, 'Blocked website writes preserve the actual page bytes');
    checkRoute(routeRequest('POST', '/notes', [], false, 3)['status'] === 403, 'Narrower lock policy preserves viewer authorization');
    checkRoute(routeRequest('POST', '/notes', [], false, 1, false)['status'] === 403, 'Narrower lock policy preserves CSRF protection');
    checkRoute(routeRequest('POST', '/site/reset-install', ['confirm' => 'RESET INSTALLATION'], false, 2)['status'] === 403,
        'Only the owner can activate a reviewed installation cleanup');
    file_put_contents($root . '/.demo', 'true');
    checkRoute(routeRequest('POST', '/notes', [])['status'] === 403, 'Narrower lock policy preserves the backend demo write restriction');
    unlink($root . '/.demo');
    flock($lock, LOCK_UN); fclose($lock); $lock = null;
    $history = routeRequest('GET', '/ai/conversations/' . $conversationId);
    checkRoute($history['status'] === 200 && file_get_contents($root . '/_studio/preview/assets/css/tailwind.css') === $compiledMarker,
        'Interrupted Chat reads remain observational after the website lock is released');
    $prompt = $history['json']['data']['conversation']['prompts'][0];
    $repair = routeRequest('POST', '/ai/repair-generation', ['operation_id' => 'route-explicit-style-repair',
        'prompt_id' => $staleJobId, 'version' => $prompt['version'], 'draft_version' => $history['json']['data']['conversation']['draft_version']]);
    checkRoute($repair['status'] === 200 && file_get_contents($root . '/_studio/preview/assets/css/tailwind.css') !== $compiledMarker,
        'Explicit retained repair compiles interrupted styles under the shared lock');
    $repairedCss = file_get_contents($root . '/_studio/preview/assets/css/tailwind.css');

    $failedId = str_repeat('b', 32);
    $failure = ['ok' => false, 'error' => ['restored' => false, 'message' => 'Controlled incomplete recovery']];
    $pdo->prepare('INSERT INTO site_control_mutations (id,user_id,route_path,request_hash,status,response_json,http_code,created_at) VALUES (?,?,?,?,?,?,?,?)')->execute([
        $failedId, 1, '/site-control/page-rename', 'fixture', 'failed', json_encode($failure), 500, time()]);
    $pdo->prepare('UPDATE prompt_log SET status = ? WHERE id = ?')->execute(['streaming', $staleJobId]);
    file_put_contents($root . '/_studio/preview/assets/css/tailwind.css', $compiledMarker);
    $history = routeRequest('GET', '/ai/conversations/' . $conversationId);
    checkRoute($history['status'] === 200 && file_get_contents($root . '/_studio/preview/assets/css/tailwind.css') === $compiledMarker,
        'Reading interrupted Chat history cannot bypass incomplete recovery to change shared CSS');
    foreach ([['POST', '/notes', ['request_id' => 'route-recovery-note-001', 'title' => 'Recovery note'], 201],
        ['POST', '/cards', ['request_id' => 'route-recovery-card-001', 'title' => 'Recovery task'], 201],
        ['PUT', '/auth/password', ['current_password' => 'wrong', 'new_password' => 'fixture-password'], 400],
        ['PUT', '/settings', ['operation_id' => 'route-settings-recovery', 'versions' => $settingVersions, 'values' => ['site_tagline' => 'Available during recovery']], 200],
        ['POST', '/team', ['operation_id' => 'route-recovery-team-001', 'name' => 'Recovery helper', 'email' => 'helper@example.test', 'password' => 'fixture-password'], 201],
        ['GET', '/update/inspect', null, 200],
        ['POST', '/export', ['operation_id' => 'route-export-recovery', 'version' => $exportVersion, 'format' => 'php'], 200]] as [$method, $path, $body, $expected]) {
        $response = routeRequest($method, $path, $body);
        checkRoute($response['status'] === $expected, $method . ' ' . $path . ' stays available during incomplete recovery (' . $response['status'] . ')');
    }
    $snapshot = routeRequest('POST', '/snapshots', ['operation_id' => 'route-snapshot-recovery', 'domain' => 'draft', 'label' => 'Damaged state before recovery']);
    checkRoute($snapshot['status'] === 200 && ($snapshot['json']['ok'] ?? false), 'Manual snapshot can preserve the damaged state during incomplete recovery');
    // Keep the undo candidate valid after proving that the observational read
    // and damaged-state capture preserve the deliberately changed CSS above.
    file_put_contents($root . '/_studio/preview/assets/css/tailwind.css', $repairedCss);
    $draftVersion = routeRequest('GET', '/site/reset')['json']['data']['draft_version'];
    $resetReview = routeRequest('POST', '/site/reset/prepare', ['operation_id' => 'route-reset-recovery', 'base_draft_version' => $draftVersion])['json']['data'];
    $resetBody = ['plan_id' => $resetReview['plan_id'], 'digest' => $resetReview['digest'], 'confirm' => 'RESET'];
    checkRoute(routeRequest('PUT', '/settings', ['operation_id' => 'route-rest-settings-recovery', 'versions' => ['identity' => routeRequest('GET', '/settings', null, true)['json']['data']['versions']['identity']], 'values' => ['site_tagline' => 'Agent recovery helper']], true)['status'] === 200, 'Agent settings stay available during incomplete recovery');
    $draftVersion = routeRequest('GET', '/site/reset')['json']['data']['draft_version'];
    foreach ([['PUT', '/files/content', ['operation_id' => 'route-file-blocked', 'base_draft_version' => $draftVersion, 'expected_content_sha256' => hash('sha256', $fileBefore), 'path' => 'about.php', 'content' => 'must not write']],
        ['POST', '/site-control/page-rename', ['operation_id' => 'route-rename-blocked', 'base_draft_version' => $draftVersion, 'pageId' => 'page:about.php', 'newTitle' => 'Must not rename']],
        ['POST', '/publish', ['operation_id' => 'route-publish-blocked']], ['POST', '/revisions/undo', ['operation_id' => 'route-undo-blocked']], ['POST', '/site/reset', $resetBody]] as [$method, $path, $body]) {
        checkRoute(routeRequest($method, $path, $body)['status'] === 409, $method . ' ' . $path . ' remains blocked by incomplete recovery');
    }
    checkRoute(routeRequest('POST', '/compile', ['operation_id' => 'route-compile-blocked', 'base_draft_version' => $draftVersion], true)['status'] === 409, 'Agent website writes remain blocked by incomplete recovery');
    $approval = routeRequest('POST', '/governor/pending/fixture/approve', ['reason' => 'Reviewed fixture heading']);
    checkRoute(($approval['json']['error']['code'] ?? '') === 'site_busy', 'Owner heading approval cannot bypass incomplete website recovery');
    checkRoute(routeRequest('POST', '/site/reset-install', ['confirm' => 'wrong'])['status'] === 422,
        'A confirmation string alone cannot bypass the reviewed factory workflow');
    $pdo->exec("DELETE FROM site_control_mutations WHERE id = '" . $failedId . "'");

    $queued = routeRequest('POST', '/prompt', ['prompt' => 'Answer without modifying files.', 'action_type' => 'inline_edit'], true);
    $jobId = $queued['json']['data']['id'] ?? 0;
    checkRoute($queued['status'] === 202 && $jobId > 0, 'Agent prompt is accepted by the real queue endpoint');
    $job = $pdo->query('SELECT status,error_message FROM prompt_log WHERE id = ' . (int) $jobId)->fetch(PDO::FETCH_ASSOC);
    checkRoute($job && $job['status'] === 'success', 'Detached PromptEngine completes while the enqueue request is deliberately held open: ' . json_encode($job));

    echo $checks . ' checks, ' . count($failures) . ' failures. Fixture: ' . $root . "\n";
    if ($failures) throw new RuntimeException(count($failures) . ' route policy checks failed.');
} finally {
    if (is_resource($lock ?? null)) { flock($lock, LOCK_UN); fclose($lock); }
    proc_terminate($server); proc_close($server); proc_terminate($provider); proc_close($provider);
}
