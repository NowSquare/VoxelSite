<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
require_once __DIR__ . '/helpers/RouterHeadingFixture.php';
require_once __DIR__ . '/helpers/RouterLegacyBenchmark.php';

use VoxelSite\Database;
use VoxelSite\Encryption;
use VoxelSite\RouterSettings;
use VoxelSite\Logger;
use VoxelSite\Settings;
use VoxelSite\Tests\RouterHeadingFixture;
use VoxelSite\Tests\RouterLegacyBenchmark;

$passed = 0;
$errors = [];
function verify(bool $condition, string $message): void
{
    global $passed, $errors; $condition ? $passed++ : $errors[] = $message;
}
function requestSettings(string $root, array $request): array
{
    $process = proc_open([PHP_BINARY, __DIR__ . '/helpers/call-router-settings.php', $root],
        [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    fwrite($pipes[0], json_encode($request, JSON_THROW_ON_ERROR)); fclose($pipes[0]);
    $output = stream_get_contents($pipes[1]); $error = stream_get_contents($pipes[2]);
    fclose($pipes[1]); fclose($pipes[2]);
    if (proc_close($process) !== 0 || $error !== '') { throw new RuntimeException('Settings helper failed (output withheld)'); }
    return json_decode($output, true, 512, JSON_THROW_ON_ERROR);
}
function absent(array $payload, array $secrets, string $message): void
{
    $json = json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
    foreach ($secrets as $secret) { verify(!str_contains($json, $secret), $message); }
}

$root = sys_get_temp_dir() . '/voxelsite-governor-settings-' . bin2hex(random_bytes(8));
mkdir($root, 0700); mkdir($root . '/logs', 0700);
file_put_contents($root . '/.governor-settings-test', 'disposable');
// Random test material exists only for this process and its disposable database.
// No working key or fixed credential is present in source or fixture files.
$appKey = Encryption::generateKey();
$secret = bin2hex(random_bytes(32));
$encryption = new Encryption($appKey);
$cipher = $encryption->encrypt($secret);
$config = ['app_key' => $appKey];
$db = Database::getInstance($root . '/settings.db');
$db->exec('CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)');
$db->exec('CREATE TABLE prompt_log (id INTEGER PRIMARY KEY, action_data TEXT, error_message TEXT, user_prompt TEXT)');
$settings = new Settings($db);
try {
    $settings->set('governor.typesafe_api_key', $cipher);
    verify(!array_key_exists('governor.typesafe_api_key', $settings->getAll()), 'Bulk settings exclude TypeSafe ciphertext');
    verify($settings->get('governor.typesafe_api_key') === $cipher, 'Explicit server read still works');
    $read = requestSettings($root, ['config' => $config]);
    absent($read, [$secret, $cipher, 'governor.typesafe_api_key'], 'Studio GET excludes the secret entirely');
    verify(class_exists(RouterSettings::class), 'Router settings contract exists');
    if (class_exists(RouterSettings::class)) {
        $settings->delete('governor.typesafe_api_key');
        $governor = new RouterSettings($settings, fn() => $encryption);
        $status = $governor->publicStatus();
        verify($status === ['governor.mode' => 'off', 'governor.typesafe_configured' => false,
            'governor.configuration_error' => null, 'governor.model_map_error' => null], 'Fresh install is off without any key');
        $before = $db->query('SELECT * FROM settings ORDER BY key');
        $agentWrite = requestSettings($root, ['surface' => 'agent', 'method' => 'PUT', 'config' => $config,
            'body' => ['governor.mode' => 'enforce', 'governor.typesafe_api_key' => $secret]]);
        verify($agentWrite['status'] === 422, 'Agent API cannot change Router settings');
        verify($db->query('SELECT * FROM settings ORDER BY key') === $before, 'Agent rejected settings are unchanged');
        absent($agentWrite, [$secret], 'Agent mutation response excludes secret values');
        foreach (['editor', 'admin', 'viewer', 'demo', ''] as $role) {
            foreach (['governor.mode' => 'enforce', 'governor.typesafe_api_key' => $secret,
                'governor.model_map' => [], 'governor.future_flag' => true] as $key => $value) {
                $before = $db->query('SELECT * FROM settings ORDER BY key');
                $r = requestSettings($root, ['method' => 'PUT', 'role' => $role, 'config' => $config,
                    'body' => ['site_name' => 'Must not change', $key => $value]]);
                verify($r['status'] === 403, 'Non-owner cannot mutate Router settings');
                verify($db->query('SELECT * FROM settings ORDER BY key') === $before, 'Mixed unauthorized request is atomic');
                absent($r, [$secret], 'Forbidden response excludes supplied key');
            }
        }
        foreach (['shadow', 'enforce'] as $mode) {
            $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'config' => $config,
                'body' => ['governor.mode' => $mode, 'site_name' => 'Must not change']]);
            verify($r['status'] === 409 && $r['response']['error']['code'] === 'governor_configuration', 'Active mode needs a key');
            verify(!$settings->has('site_name'), 'Missing key request writes no ordinary settings');
        }
        $map = ['cheap' => ['provider' => 'claude', 'model' => 'fixture-small'],
            'frontier' => ['provider' => 'claude', 'model' => 'fixture-model']];
        $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'config' => $config,
            'body' => ['governor.mode' => 'shadow', 'governor.typesafe_api_key' => $secret, 'governor.model_map' => $map]]);
        verify($r['status'] === 200, 'Owner can atomically configure mode, key and model map');
        $settings->clearCache();
        $cipher = $settings->get('governor.typesafe_api_key');
        verify(is_string($cipher) && $cipher !== $secret && $encryption->decrypt($cipher) === $secret, 'Only encrypted key is persisted');
        verify($settings->get('governor.model_map') === $map, 'Model map is stored without provider URLs or credentials');
        // Both tiers are bound to the saved provider. Changes preserve the old
        // binding until the owner explicitly replaces or clears the map.
        foreach (['openai', 'gemini', 'deepseek', 'openai_compatible'] as $provider) {
            $cross = $map;
            $cross['cheap']['provider'] = $provider;
            $before = $db->query('SELECT * FROM settings ORDER BY key');
            $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'config' => $config,
                'body' => ['site_name' => 'Must not change', 'governor.model_map' => $cross]]);
            verify($r['status'] === 422, 'Cross-provider map rejected');
            verify($db->query('SELECT * FROM settings ORDER BY key') === $before, 'Cross-provider rejection is atomic');
        }
        $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'config' => $config,
            'body' => ['ai_provider' => 'openai']]);
        verify($r['status'] === 200, 'Provider can change without rewriting the saved tier binding');
        $settings->clearCache();
        verify($settings->get('governor.model_map') === $map, 'Provider change never rebinds old model IDs');
        foreach (['studio', 'agent'] as $surface) {
            $r = requestSettings($root, ['surface' => $surface, 'config' => $config]);
            verify($r['response']['data']['settings']['governor.model_map_error']['code'] === 'governor_model_map', 'Stale binding is explicit on reads');
        }
        $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'config' => $config,
            'body' => ['governor.model_map' => $map]]);
        verify($r['status'] === 422, 'Stale form cannot save model IDs against a changed provider');
        $settings->set('governor.model_map', ['cheap' => ['provider' => 'openai', 'model' => 'small'], 'frontier' => $map['frontier']]);
        verify($governor->publicStatus()['governor.model_map_error']['code'] === 'governor_model_map', 'Existing cross-provider maps require replacement or clearing');
        foreach (['claude', 'openai', 'gemini', 'deepseek', 'openai_compatible'] as $provider) {
            $same = ['cheap' => ['provider' => $provider, 'model' => 'custom/small'],
                'frontier' => ['provider' => $provider, 'model' => 'custom/large']];
            $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'config' => $config,
                'body' => ['ai_provider' => $provider, 'governor.model_map' => $same]]);
            verify($r['status'] === 200, 'Both tiers accept model IDs for the effective saved provider');
            verify($governor->publicStatus()['governor.model_map_error'] === null, 'Valid replacement clears binding warning');
        }
        $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'config' => $config,
            'body' => ['governor.model_map' => []]]);
        verify($r['status'] === 200 && $governor->publicStatus()['governor.model_map_error'] === null, 'Explicit clear removes obsolete bindings');
        $settings->setMany(['ai_provider' => 'claude', 'governor.model_map' => $map]);
        foreach (['governor.typesafe_configured' => true, 'governor.configuration_error' => null, 'governor.model_map_error' => null, 'governor.future_flag' => true] as $key => $value) {
            $before = $db->query('SELECT * FROM settings ORDER BY key');
            $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'config' => $config, 'body' => [$key => $value]]);
            verify($r['status'] === 422 && $db->query('SELECT * FROM settings ORDER BY key') === $before, 'Derived and unknown Router fields are read-only');
        }
        $before = $db->query('SELECT * FROM settings ORDER BY key');
        $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'config' => $config,
            'body' => ['site_name' => '', 'governor.typesafe_api_key' => bin2hex(random_bytes(32))]]);
        verify($r['status'] === 422 && $db->query('SELECT * FROM settings ORDER BY key') === $before, 'Ordinary validation failure also rolls back Router changes');
        $r = requestSettings($root, ['method' => 'PUT', 'role' => 'editor', 'body' => ['site_name' => 'Canal Bakery']]);
        verify($r['status'] === 200, 'Unrelated editor settings retain legacy authorization behavior');
        foreach (['off', 'shadow', 'enforce'] as $mode) {
            $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'config' => $config, 'body' => ['governor.mode' => $mode]]);
            verify($r['status'] === 200, 'Each supported mode can be stored with a key');
            verify($governor->publicStatus()['governor.mode'] === $mode, 'Status retains configured mode');
        }
        foreach (['future', true, 1, null, [], ''] as $mode) {
            $before = $db->query('SELECT * FROM settings ORDER BY key');
            $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'config' => $config,
                'body' => ['governor.mode' => $mode, 'site_name' => 'Must not change']]);
            verify($r['status'] === 422, 'Invalid mode is rejected');
            verify($db->query('SELECT * FROM settings ORDER BY key') === $before, 'Invalid mode writes nothing');
        }
        foreach ([true, [], "bad\nkey", '   '] as $key) {
            $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'config' => $config,
                'body' => ['governor.typesafe_api_key' => $key]]);
            verify($r['status'] === 422, 'Invalid secret shape is rejected without echoing it');
        }
        foreach ([null, true, 'model', ['cheap' => ['provider' => 'claude', 'model' => 'https://bad.test'], 'frontier' => $map['frontier']], ['cheap' => ['provider' => 'claude', 'model' => 'bad model'], 'frontier' => $map['frontier']], ['cheap' => ['provider' => 'claude', 'model' => str_repeat('x', 201)], 'frontier' => $map['frontier']], ['cheap' => 'model'], ['cheap' => ['provider' => 'https://untrusted.test', 'model' => 'model'], 'frontier' => $map['frontier']],
            ['cheap' => $map['cheap'] + ['api_key' => $secret], 'frontier' => $map['frontier']]] as $invalidMap) {
            $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'config' => $config,
                'body' => ['governor.model_map' => $invalidMap]]);
            verify($r['status'] === 422, 'Invalid tier map rejected');
            absent($r, [$secret], 'Model validation does not echo supplied values');
        }
        foreach ([null, ['app_key' => 'invalid']] as $badConfig) {
            $before = $db->query('SELECT * FROM settings ORDER BY key');
            $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'config' => $badConfig,
                'body' => ['governor.typesafe_api_key' => $secret]]);
            verify($r['status'] === 409, 'Missing or invalid encryption config is explicit');
            verify($db->query('SELECT * FROM settings ORDER BY key') === $before, 'Encryption failure writes nothing');
            absent($r, [$secret], 'Encryption error is secret-free');
        }
        $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'config' => $config,
            'body' => ['governor.typesafe_api_key' => null]]);
        verify($r['status'] === 409, 'Active mode cannot lose its key via settings mutation');
        foreach (['claude', 'openai', 'gemini', 'deepseek', 'openai_compatible'] as $provider) {
            $settings->set('ai_' . $provider . '_api_key', $encryption->encrypt(bin2hex(random_bytes(24))));
        }
        foreach (['studio', 'agent'] as $surface) {
            $r = requestSettings($root, ['surface' => $surface, 'config' => $config]);
            absent($r, [$secret, $cipher, 'governor.typesafe_api_key'], 'Both settings surfaces exclude key and ciphertext');
            $safe = $r['response']['data']['settings'];
            verify($safe['governor.typesafe_configured'] === true, 'Key presence is a boolean');
            if ($surface === 'studio') {
                foreach (['claude', 'openai', 'gemini', 'deepseek', 'openai_compatible'] as $provider) {
                    verify($safe['ai_' . $provider . '_api_key'] === '••••••••', 'Existing generator key stays masked');
                }
            }
        }
        foreach ([null, 'corrupted'] as $broken) {
            $broken === null ? $settings->delete('governor.typesafe_api_key') : $settings->set('governor.typesafe_api_key', $broken);
            foreach (['studio', 'agent'] as $surface) {
                $r = requestSettings($root, ['surface' => $surface, 'config' => $config]);
                $safe = $r['response']['data']['settings'];
                verify($safe['governor.mode'] === 'enforce', 'Missing/deleted key never silently changes mode to off');
                verify($safe['governor.configuration_error']['code'] === 'governor_configuration', 'Missing/deleted/corrupt key is visible in both settings surfaces');
            }
        }
        $r = requestSettings($root, ['method' => 'PUT', 'role' => 'owner', 'body' => ['governor.mode' => 'off', 'governor.typesafe_api_key' => null]]);
        verify($r['status'] === 200, 'Owner can turn off and remove key without working encryption config');
        verify($governor->publicStatus()['governor.configuration_error'] === null, 'Off requires no TypeSafe key');
        // Register runtime values through the real config path, not a test redactor stub.
        $settings->setMany($governor->prepareUpdates(['governor.typesafe_api_key' => $secret], 'owner'));
        $cipher = $settings->get('governor.typesafe_api_key');
        $state = ['request' => 'shorten heading', 'settings' => $settings->getAll(), 'governor' => $governor->publicStatus()];
        absent($state, [$secret, $cipher, 'governor.typesafe_api_key'], 'Safe state excludes secrets even after cache reads');
        foreach (['initialized' => true, 'logDir' => $root . '/logs'] as $name => $value) {
            (new ReflectionProperty(Logger::class, $name))->setValue(null, $value);
        }
        Logger::info('governor', 'Key must not appear: ' . $secret, ['state' => $state,
            'nested' => ['governor' => ['typesafe_api_key' => bin2hex(random_bytes(20))]],
            'governor.typesafe_api_key' => $cipher, $secret => 'must be omitted']);
        Logger::exception('governor', new RuntimeException('Key must not appear: ' . $secret));
        $recursive = []; $recursive['self'] = &$recursive;
        Logger::info('governor', 'Recursive diagnostic must be bounded', $recursive);
        $log = file_get_contents($root . '/logs/' . gmdate('Y-m-d') . '.log');
        verify(!str_contains($log, $secret) && !str_contains($log, $cipher), 'Logger removes registered secrets including array keys');
        $entries = array_map(fn($line) => json_decode($line, true), explode("\n", trim($log)));
        $entry = $entries[count($entries) - 3]['ctx'];
        verify(!array_key_exists('governor.typesafe_api_key', $entry)
            && !array_key_exists('typesafe_api_key', $entry['nested']['governor']), 'Logger omits named secret fields');
        $id = $db->insert('prompt_log', ['user_prompt' => 'unchanged request',
            'action_data' => json_encode(['state' => $state, 'governor.typesafe_api_key' => $secret, $secret => 'must be omitted']), 'error_message' => $cipher]);
        $db->update('prompt_log', ['error_message' => 'No key: ' . $secret], 'id = ?', [$id]);
        absent($db->queryOne('SELECT * FROM prompt_log WHERE id = ?', [$id]), [$secret, $cipher, 'typesafe_api_key'], 'Prompt log persistence excludes TypeSafe material');
        verify($db->scalar('SELECT user_prompt FROM prompt_log WHERE id = ?', [$id]) === 'unchanged request', 'Nonsecret prompt bytes are unchanged');
        foreach (['inline_edit', 'section_edit'] as $action) {
            $fresh = RouterLegacyBenchmark::run($action);
            foreach ([['governor.mode' => 'off'], ['governor.mode' => 'off', 'governor.typesafe_api_key' => $cipher]] as $off) {
                $legacy = RouterLegacyBenchmark::run($action, '', $off);
                verify($legacy['task_completion'] === 'pass' && $legacy['files'] === $fresh['files'], 'Off preserves fresh legacy output exactly');
                $calls = static function (array $items): array {
                    return array_map(static function (array $item): array { unset($item['duration_ms']); return $item; }, $items);
                };
                verify($calls($legacy['calls']) === $calls($fresh['calls']), 'Off preserves exact generator messages, options, call count and token inputs');
                absent($legacy, [$secret, $cipher], 'Legacy fake report never contains TypeSafe material');
            }
        }
    }
    $upgradeSettings = new \VoxelSite\Settings($db);
    $upgradeSettings->set('governor.mode', 'shadow');
    $beforeUpgrade = $db->query('SELECT key, value FROM settings WHERE key != ? ORDER BY key', ['governor.mode']);
    $migration = require __DIR__ . '/../engine/migrations/011_router_enabled.php';
    ($migration['up'])($db);
    $upgradeSettings->clearCache();
    verify($upgradeSettings->get('governor.mode') === 'enforce', 'Upgrade maps old preview mode to Router On');
    verify($beforeUpgrade === $db->query('SELECT key, value FROM settings WHERE key != ? ORDER BY key', ['governor.mode']), 'Upgrade preserves keys, models and every other setting');
    ($migration['up'])($db);
    $upgradeSettings->clearCache();
    verify($upgradeSettings->get('governor.mode') === 'enforce', 'Upgrade is idempotent');
    $upgradeSettings->set('governor.mode', 'off');
    ($migration['up'])($db);
    $upgradeSettings->clearCache();
    verify($upgradeSettings->get('governor.mode') === 'off', 'Upgrade keeps disabled Router Off');
} finally {
    RouterHeadingFixture::remove($root);
}
foreach ($errors as $error) { echo 'FAIL: ' . $error . "\n"; }
echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
exit($errors === [] ? 0 : 1);
