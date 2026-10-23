<?php
declare(strict_types=1);

// Exercise the actual fixture handler without bootstrapping installed settings,
// credentials, database connections, or vendor network clients.
require_once __DIR__ . '/../engine/DemoMode.php';
function jsonResponse(array $response): void { $GLOBALS['demoResponse'] = $response; }
function demoRequest(string $path): array {
    $_REQUEST = ['_route_path' => $path];
    require __DIR__ . '/../api/endpoints/demo-handler.php';
    return $GLOBALS['demoResponse']['data'];
}
$passed = 0;
$errors = [];
function check(bool $ok, string $message): void {
    global $passed, $errors;
    if ($ok) { $passed++; } else { $errors[] = $message; }
}
$data = demoRequest('/settings');
$settings = $data['settings'];
check(($settings['governor.mode'] ?? null) === 'off', 'Demo presents routing as Off');
check(($settings['governor.typesafe_configured'] ?? null) === false, 'Demo has no configured key');
check(($settings['governor.model_map'] ?? null) === [], 'Demo has no routing model choices');
foreach (['governor.configuration_error', 'governor.model_map_error'] as $key) {
    check(array_key_exists($key, $settings) && $settings[$key] === null, 'Demo has no configuration failure: ' . $key);
}
check(($data['governor_activity'] ?? null) === ['available' => true, 'items' => []], 'Demo activity is empty, not unavailable');
check(!array_key_exists('governor.typesafe_api_key', $settings), 'Demo excludes TypeSafe secret field');
$models = demoRequest('/settings/models');
check(($models['provider'] ?? null) === $settings['ai_provider'], 'Model response identifies the saved provider');
check($models['models'] === [], 'Demo model response is static and empty');
check(($settings['ai_configured'] ?? null) === true, 'Demo settings show the sample built-in AI experience');
check(($settings['ai_claude_api_key_set'] ?? null) === true && $settings['ai_claude_api_key'] === null, 'Demo provider is presented as configured without a secret');
$_COOKIE['vs_session'] = \VoxelSite\DemoMode::DEMO_SESSION_TOKEN;
$session = demoRequest('/auth/session');
check(($session['ai_configured'] ?? null) === true && ($session['demo'] ?? false), 'Demo startup shows the same sample configured state');
unset($_COOKIE['vs_session']);
// Exercise the real auth handler and its output-buffer branch with inert
// dependencies, so this test cannot open an installed database or provider.
$ownerProbe = <<<'PHP'
namespace VoxelSite {
    class Auth {}
    class Settings { public function get($key, $default = null) { return 'Real site'; } }
    class AiSetup { public static function configured($settings): bool { return false; } }
}
namespace {
    function jsonResponse($response, $status = 200): void { echo json_encode($response); }
    require $argv[1] . '/engine/DemoMode.php';
    $_COOKIE['vs_session'] = 'owner-session-fixture';
    $_REQUEST = ['_route_method' => 'GET', '_route_path' => '/auth/session',
        '_user' => ['id' => 42, 'name' => 'Real owner', 'role' => 'owner']];
    require $argv[1] . '/api/endpoints/demo-handler.php';
}
PHP;
$ownerOutput = [];
$ownerExit = 0;
exec(escapeshellarg(PHP_BINARY) . ' -r ' . escapeshellarg($ownerProbe) . ' ' . escapeshellarg(dirname(__DIR__)), $ownerOutput, $ownerExit);
$ownerSession = json_decode(implode("\n", $ownerOutput), true)['data'] ?? [];
check($ownerExit === 0 && ($ownerSession['ai_configured'] ?? null) === true && ($ownerSession['demo'] ?? null) === true, 'Real owner in demo gets the same sample startup state');
check(($ownerSession['user'] ?? null) === ['id' => 42, 'name' => 'Real owner', 'role' => 'owner'] && ($ownerSession['token'] ?? null) === 'owner-session-fixture', 'Real owner identity, role and token are preserved');
check(($ownerSession['site_name'] ?? null) === 'Studioform', 'Real owner sees the demo site name');
$mcp = demoRequest('/settings/mcp');
check(($mcp['demo'] ?? false) && ($mcp['endpoint'] ?? null) === 'https://example.invalid/_studio/mcp.php', 'Demo MCP uses a labelled non-working example endpoint');
check(($mcp['qualification']['status'] ?? null) === 'unqualified', 'Demo never claims a qualified client run');
$connection = $mcp['connections'][0] ?? [];
check(($connection['demo'] ?? false) && str_contains($connection['label'] ?? '', 'Sample') && is_int($connection['last_used_at'] ?? null), 'Demo has labelled sample usage for a synthetic connection');
check(!array_key_exists('key', $connection) && !array_key_exists('key_hash', $connection) && ($mcp['pending_secrets'] ?? null) === [], 'Demo MCP creates no secret or pending credential');
check((demoRequest('/settings/recovery')['items'] ?? null) === [], 'Demo recovery is an explicit empty list');
$activity = demoRequest('/settings/mcp/activity');
check(($activity['draft_version'] ?? null) === 'draft:0' && array_key_exists('last_external_revision', $activity) && $activity['last_external_revision'] === null, 'Demo polling has a stable empty activity response');
$inspection = demoRequest('/update/inspect');
check(($inspection['demo'] ?? false) && ($inspection['runtime_supported'] ?? null) === true && ($inspection['git_supported'] ?? null) === false, 'Demo update inspection is a static supported-layout fixture');
check(($inspection['provider_calls'] ?? null) === 0, 'Demo update inspection calls no provider');
check((demoRequest('/settings/api-keys')['keys'] ?? null) === [], 'Demo REST inventory does not read real credentials');
$workspace = demoRequest('/workspace/status');
check(($workspace['demo'] ?? false) && ($workspace['ready'] ?? null) === true && ($workspace['base_url'] ?? null) === 'https://example.invalid', 'Demo workspace status is synthetic');

// Set only the request-local cache; never create an installed .demo marker.
$active = new ReflectionProperty(\VoxelSite\DemoMode::class, 'active');
$active->setValue(null, true);
try {
    check(\VoxelSite\DemoMode::shouldBlock('PUT', '/settings'), 'Demo blocks Router settings writes');
    check(\VoxelSite\DemoMode::shouldBlock('POST', '/ai/prompt'), 'Demo blocks AI generation');
    foreach (['/settings/mcp', '/settings/recovery', '/settings/mcp/activity', '/update/inspect', '/settings/api-keys', '/workspace/status'] as $path) {
        check(\VoxelSite\DemoMode::shouldOverride('GET', $path), 'Demo reads use fixture: ' . $path);
        check(!\VoxelSite\DemoMode::shouldOverride('POST', $path), 'Demo fixture is GET-only: ' . $path);
        check(\VoxelSite\DemoMode::shouldBlock('POST', $path), 'Demo blocks writes: ' . $path);
    }
    foreach (['/settings/mcp/connections', '/settings/mcp/approvals/sample/reveal', '/settings/recovery/sample/restore', '/workspace/migrate', '/update/stage-local'] as $path) {
        check(\VoxelSite\DemoMode::shouldBlock('POST', $path), 'Demo blocks credential, recovery and update execution: ' . $path);
    }
    check(\VoxelSite\DemoMode::shouldBlock('DELETE', '/settings/mcp/connections/1'), 'Demo blocks connection revocation');
} finally { $active->setValue(null, null); }
foreach ($errors as $error) { fwrite(STDERR, "FAIL: $error\n"); }
echo "$passed passed, " . count($errors) . " failed\n";
exit($errors === [] ? 0 : 1);
