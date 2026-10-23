<?php
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
require_once __DIR__ . '/helpers/RouterHeadingFixture.php';
require_once __DIR__ . '/helpers/SettingsServiceFixture.php';

use VoxelSite\Database;
use VoxelSite\Settings;
use VoxelSite\ModelCapabilitySettings;
use VoxelSite\Tests\RouterHeadingFixture;

$passed = 0; $failed = [];
function capabilityCheck(bool $ok, string $label): void {
    global $passed, $failed;
    $ok ? $passed++ : $failed[] = $label;
}
function capabilityRequest(string $root, array $request): array {
    $process = proc_open([PHP_BINARY, __DIR__ . '/helpers/call-router-settings.php', $root],
        [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    fwrite($pipes[0], json_encode($request)); fclose($pipes[0]);
    $out = stream_get_contents($pipes[1]); $err = stream_get_contents($pipes[2]);
    fclose($pipes[1]); fclose($pipes[2]);
    if (proc_close($process) !== 0 || $err !== '') { throw new RuntimeException('Settings fixture failed: ' . $err); }
    return json_decode($out, true, 512, JSON_THROW_ON_ERROR);
}
$root = sys_get_temp_dir() . '/voxelsite-capabilities-' . bin2hex(random_bytes(8));
mkdir($root, 0700); mkdir($root . '/logs', 0700);
file_put_contents($root . '/.governor-settings-test', 'disposable');
$db = Database::getInstance($root . '/settings.db');
initializeSettingsServiceFixture($db, $root);
$settings = new Settings($db);
$url = 'http://localhost:11434';
$limits = ['base_url' => $url, 'models' => ['my-alias' => ['max_output_tokens' => 128000, 'context_window' => 1000000]]];
try {
    $request = ['method' => 'PUT', 'role' => 'owner', 'body' => [
        'ai_openai_compatible_base_url' => $url, 'ai_openai_compatible_model_limits' => $limits]];
    $result = capabilityRequest($root, $request);
    capabilityCheck($result['status'] === 200, 'Valid per-model capability save succeeds');
    capabilityCheck(isset((new Settings($db))->get('ai_openai_compatible_model_limits')['models']['my-alias']), 'Per-model capabilities persist');
    $before = $db->query('SELECT * FROM settings ORDER BY key');
    foreach ([0, -1, 2.5, '64000', 2000001, true, []] as $bad) {
        $invalid = $limits;
        $invalid['models']['my-alias']['max_output_tokens'] = $bad;
        $r = capabilityRequest($root, ['method' => 'PUT', 'role' => 'owner', 'body' => [
            'site_name' => 'Must not save', 'ai_openai_compatible_model_limits' => $invalid]]);
        capabilityCheck($r['status'] === 422, 'Invalid model limit rejected: ' . json_encode($bad));
        capabilityCheck($db->query('SELECT * FROM settings ORDER BY key') === $before, 'Rejected mixed settings request writes nothing');
    }
    $invalid = $limits; $invalid['models']['my-alias']['context_window'] = 32000;
    $r = capabilityRequest($root, ['method' => 'PUT', 'role' => 'owner', 'body' => ['ai_openai_compatible_model_limits' => $invalid]]);
    capabilityCheck($r['status'] === 422, 'Output cannot exceed total context');
    $r = capabilityRequest($root, ['method' => 'PUT', 'role' => 'editor', 'body' => ['ai_openai_compatible_model_limits' => $limits]]);
    capabilityCheck($r['status'] === 403, 'Only owner may change model limits');
    $budgetRequest = ['method' => 'POST', 'role' => 'owner', 'path' => '/settings/model-budget', 'body' => [
        'provider' => 'openai_compatible', 'model' => 'my-alias', 'max_tokens' => 110000, 'base_url' => $url]];
    $r = capabilityRequest($root, $budgetRequest);
    capabilityCheck(($r['response']['data']['budget']['effective'] ?? null) === 110000, 'Budget preview uses saved exact model override');
    capabilityCheck(($r['response']['data']['focused_budget']['effective'] ?? null) === 16000, 'Budget preview includes section action cap');
    $budgetRequest['body']['base_url'] = 'http://localhost:9999';
    $r = capabilityRequest($root, $budgetRequest);
    capabilityCheck(($r['response']['data']['budget']['effective'] ?? null) === 8192, 'Changing endpoint cannot inherit old model capacity');
    $budgetRequest['body']['base_url'] = $url;
    $budgetRequest['body']['model'] = 'prefix/my-alias';
    $r = capabilityRequest($root, $budgetRequest);
    capabilityCheck(($r['response']['data']['budget']['effective'] ?? null) === 8192, 'Friendly aliases do not inherit exact model capacity');
    $budgetRequest['body']['model'] = 'my-alias';
    $budgetRequest['body']['model_limits'] = ['base_url' => $url, 'models' => []];
    $r = capabilityRequest($root, $budgetRequest);
    capabilityCheck(($r['response']['data']['budget']['effective'] ?? null) === 8192, 'Unsaved cleared override previews fallback');
    capabilityCheck($db->query('SELECT * FROM settings ORDER BY key') === $before, 'Budget preview is read only');

    capabilityCheck(class_exists(ModelCapabilitySettings::class), 'Capability settings helper exists');
    if (class_exists(ModelCapabilitySettings::class)) {
        $large = ['base_url' => $url, 'models' => ['large-context' => ['max_output_tokens' => 65536, 'context_window' => 2097152]]];
        $r = capabilityRequest($root, ['method' => 'POST', 'path' => '/settings/model-budget', 'body' => [
            'provider' => 'openai_compatible', 'model' => 'large-context', 'base_url' => $url,
            'max_tokens' => 64000, 'model_limits' => $large,
        ]]);
        capabilityCheck(($r['response']['data']['budget']['context_window'] ?? null) === 2097152, 'Valid context above two million is accepted');
        ModelCapabilitySettings::recordModels($settings, 'claude', '', [
            ['id' => 'catalog-model', 'max_output_tokens' => 96000, 'context_window' => 500000],
            ['id' => 'invalid', 'max_output_tokens' => 'oops', 'context_window' => 100000],
        ]);
        $map = ModelCapabilitySettings::forProvider($settings, 'claude');
        capabilityCheck(($map['catalog-model']['max_output_tokens'] ?? 0) === 96000, 'Valid discovered metadata is retained');
        capabilityCheck(!isset($map['invalid']), 'Invalid discovered metadata is ignored');
        ModelCapabilitySettings::recordModels($settings, 'gemini', '', [
            ['id' => 'large-context', 'max_output_tokens' => 65536, 'context_window' => 2097152],
        ]);
        capabilityCheck((ModelCapabilitySettings::forProvider($settings, 'gemini')['large-context']['context_window'] ?? null) === 2097152, 'Valid large discovered context is retained');
        ModelCapabilitySettings::recordModels($settings, 'openai_compatible', $url, [
            ['id' => 'my-alias', 'max_output_tokens' => 9000, 'context_window' => 48000],
        ]);
        $map = ModelCapabilitySettings::forProvider($settings, 'openai_compatible', $url);
        capabilityCheck($map['my-alias']['max_output_tokens'] === 128000, 'Explicit override takes precedence over model-list metadata');
        capabilityCheck(ModelCapabilitySettings::forProvider($settings, 'openai_compatible', 'http://other.test') === [], 'Discovered capabilities stay scoped to endpoint');
    }
} finally { RouterHeadingFixture::remove($root); }
foreach ($failed as $failure) { fwrite(STDERR, "FAIL: $failure\n"); }
echo "Model capability settings: $passed passed, " . count($failed) . " failed\n";
exit($failed ? 1 : 0);
