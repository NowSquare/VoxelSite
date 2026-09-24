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

// Set only the request-local cache; never create an installed .demo marker.
$active = new ReflectionProperty(\VoxelSite\DemoMode::class, 'active');
$active->setValue(null, true);
try {
    check(\VoxelSite\DemoMode::shouldBlock('PUT', '/settings'), 'Demo blocks Router settings writes');
    check(\VoxelSite\DemoMode::shouldBlock('POST', '/ai/prompt'), 'Demo blocks AI generation');
} finally { $active->setValue(null, null); }
foreach ($errors as $error) { fwrite(STDERR, "FAIL: $error\n"); }
echo "$passed passed, " . count($errors) . " failed\n";
exit($errors === [] ? 0 : 1);
