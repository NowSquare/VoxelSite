<?php

declare(strict_types=1);

// Invoked only by the benchmark with a disposable application root.
$root = $argv[1] ?? '';
if (!is_file($root . '/.governor-fixture')) {
    throw new RuntimeException('Refusing to run legacy engine outside a disposable fixture');
}
$root = realpath($root);
require $root . '/_studio/engine/bootstrap.php';
require __DIR__ . '/RouterLegacyBenchmark.php';
require __DIR__ . '/FakeTypeSafeTransport.php';

// Parent processes may have test overrides; never inherit their filesystem targets.
putenv('VS_TEST_PREVIEW_DIR=' . $root . '/_studio/preview');
putenv('VS_TEST_ASSETS_DIR=' . $root . '/assets');
foreach (['PromptEngine', 'FileManager', 'SiteContext', 'RevisionManager', 'Logger', 'TailwindCompiler', 'AEOGenerator'] as $class) {
    $source = (new ReflectionClass('VoxelSite\\' . $class))->getFileName();
    if (!str_starts_with($source, $root . '/_studio/engine/')) {
        throw new RuntimeException('Refusing non-isolated engine class: ' . $class);
    }
}

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\PromptEngine;
use VoxelSite\Settings;
use VoxelSite\Tests\RouterHeadingFixture;
use VoxelSite\Tests\RouterLegacyBenchmark;
use VoxelSite\Tests\HeadingFakeProvider;

$db = Database::getInstance($root . '/_studio/data/studio.db');
foreach (glob($root . '/_studio/engine/migrations/*.php') as $file) {
    $migration = require $file;
    ($migration['up'])($db);
}
$user = $db->insert('users', ['email' => 'fixture@example.test', 'password_hash' => 'not-a-login', 'name' => 'Fixture',
    'role' => 'owner', 'created_at' => now(), 'updated_at' => now()]);
$settings = new Settings($db);
$settings->setMany(['site_name' => 'Canal Bakery', 'site_tagline' => 'Bread by the canal',
    'ai_max_tokens' => 32000, 'evaluator_enabled' => false, 'design_review_enabled' => false]);
// Optional runtime-only configuration for off-mode legacy equivalence tests.
// stdin avoids putting synthetic encrypted key material in process arguments.
$input = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
$settings->setMany($input['settings']);
$scenario = $input['scenario'];
$secret = null; $encryptedSecret = null;
if (isset($scenario['mode'])) { $settings->set('governor.mode', $scenario['mode']); }
if (!empty($scenario['key'])) {
    $secret = bin2hex(random_bytes(32));
    $appKey = \VoxelSite\Encryption::generateKey();
    file_put_contents($root . '/_studio/data/config.json', json_encode(['app_key' => $appKey]));
    $encryptedSecret = (new \VoxelSite\Encryption($appKey))->encrypt($secret);
    $settings->set('governor.typesafe_api_key', $encryptedSecret);
} elseif (!empty($scenario['corrupt_key'])) {
    $settings->set('governor.typesafe_api_key', 'corrupted');
}
$fixture = RouterHeadingFixture::manifest();
$action = $argv[2] ?? 'inline_edit';
if (!in_array($action, ['inline_edit', 'section_edit'], true)) {
    throw new RuntimeException('Invalid fixture action');
}
$virtual = $action === 'inline_edit' ? '__inline_snippet__' : '__section_snippet__';
$provider = new HeadingFakeProvider('<file path="' . $virtual . '">' . "\n" . $fixture['expected_heading'] . "\n</file>\n<message>Heading updated.</message>");
$fm = new FileManager($db);
$fm->syncPageRegistry();
$before = RouterLegacyBenchmark::siteSnapshot($root);
class ShadowContextProbe extends \VoxelSite\SiteContext
{
    public int $builds = 0;
    public function build(?string $focusPageSlug = null, ?string $conversationId = null, ?int $userId = null, int $maxChars = 0, ?string $actionType = null): array
    {
        $this->builds++;
        return parent::build($focusPageSlug, $conversationId, $userId, $maxChars, $actionType);
    }
}
$context = new ShadowContextProbe($db, $settings, $fm);
$beforeClassifyUnchanged = false;
$transport = new \VoxelSite\Tests\FakeTypeSafeTransport($scenario['transport'] ?? 'ok', function () use ($root, $before, $provider, $context, $db, &$beforeClassifyUnchanged) {
    $beforeClassifyUnchanged = $provider->calls === [] && $context->builds === 0 && $db->count('revisions') === 0
        && RouterLegacyBenchmark::siteSnapshot($root) === $before;
});
$clientConstructions = 0;
$clientFactory = function (#[\SensitiveParameter] string $key) use ($transport, &$clientConstructions) {
    $clientConstructions++;
    return new \VoxelSite\TypeSafeHttpClient($key, $transport);
};
$governor = new \VoxelSite\AIRouter($db, $settings, $clientFactory);
$engine = new PromptEngine($db, $settings, $provider, fileManager: $fm, siteContext: $context, governorRouter: $governor);
if (($scenario['action_override'] ?? null) === 'create_site') { $action = 'create_site'; }
$actionData = ['path' => 'index.php', 'selection' => $fixture['target']['source_address'], 'sectionHtml' => $fixture['target']['source_address']];
$jobId = null;
if (!empty($scenario['preallocated'])) {
    $jobId = $db->insert('prompt_log', ['user_id' => (int) $user, 'user_prompt' => $fixture['prompt'],
        'action_type' => $action, 'action_data' => json_encode($actionData), 'ai_provider' => 'fake', 'ai_model' => 'fixture',
        'status' => 'streaming', 'created_at' => now()]);
}
ob_start();
$engine->execute(['user_id' => (int) $user, 'user_prompt' => $fixture['prompt'], 'action_type' => $action,
    'page_scope' => 'index', 'action_data' => $actionData, 'headless' => empty($scenario['interactive']), 'prompt_log_id' => $jobId]);
if (ob_get_level() > 0) { ob_end_clean(); }
// Test-only fault injection at the completion boundary. Each mutation preserves
// the correct heading so it cannot be caught by the old heading-only predicate.
switch ($argv[3] ?? '') {
    case '': break;
    case 'preview-change': file_put_contents($root . '/_studio/preview/_partials/nav.php', '<nav>Wrong file</nav>'); break;
    case 'preview-add': file_put_contents($root . '/_studio/preview/unrequested.php', '<p>Wrong file</p>'); break;
    case 'preview-delete': unlink($root . '/_studio/preview/bakery/index.php'); break;
    case 'shared-asset-change': file_put_contents($root . '/assets/data/site.json', '{"unexpected":true}'); break;
    case 'public-add': file_put_contents($root . '/unrequested.php', '<p>Wrong file</p>'); break;
    default: throw new RuntimeException('Unknown benchmark fault');
}
$content = file_get_contents($root . '/_studio/preview/index.php');
$row = $db->queryOne('SELECT id, status, error_message, action_data FROM prompt_log ORDER BY id DESC LIMIT 1');
$after = RouterLegacyBenchmark::siteSnapshot($root);
$changes = RouterLegacyBenchmark::classifyChanges($before, $after);
$completion = ($row['status'] ?? '') === 'success' && str_contains($content, $fixture['expected_heading'])
    && !str_contains($content, $fixture['target']['source_address']) ? 'pass' : 'skip-incorrect';
if ($changes['unexpected'] !== []) { $completion = 'wrong-file'; }
$report = ['action' => $action, 'calls' => $provider->calls, 'status' => ['status' => $row['status'], 'error_message' => $row['error_message']],
    'task_completion' => $completion, 'file_changes' => $changes,
    'before_files' => $before, 'files' => $after];
$report['shadow'] = json_decode($row['action_data'] ?? '{}', true)['governor_routing'] ?? null;
$report['typesafe_requests'] = $transport->requests;
$report['client_constructions'] = $clientConstructions;
$report['before_classify_unchanged'] = $beforeClassifyUnchanged;
$report['context_builds'] = $context->builds;
$report['prompt_log_id'] = (int) $row['id'];
$report['ledger'] = $db->scalar("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'ai_call_ledger'")
    ? $db->query('SELECT * FROM ai_call_ledger ORDER BY started_at, id') : [];
$diagnostics = json_encode($report) . json_encode($db->query('SELECT * FROM prompt_log'));
foreach (glob($root . '/_studio/logs/*.log') as $file) { $diagnostics .= file_get_contents($file); }
$report['secrets_excluded'] = ($secret === null || !str_contains($diagnostics, $secret))
    && ($encryptedSecret === null || !str_contains($diagnostics, $encryptedSecret));
// Run after PromptEngine's shutdown callbacks: a refused turn must not leave
// late CSS/AEO mutations that an earlier snapshot would miss.
register_shutdown_function(function () use ($root, $report, $before) {
    $report['files'] = RouterLegacyBenchmark::siteSnapshot($root);
    $report['file_changes'] = RouterLegacyBenchmark::classifyChanges($before, $report['files']);
    if ($report['file_changes']['unexpected'] !== []) { $report['task_completion'] = 'wrong-file'; }
    file_put_contents($root . '/legacy-result.json', json_encode($report, JSON_THROW_ON_ERROR));
});
