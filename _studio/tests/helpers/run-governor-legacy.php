<?php

declare(strict_types=1);

// Invoked only by the benchmark with a disposable application root.
$root = $argv[1] ?? '';
if (!is_file($root . '/.governor-fixture')) {
    throw new RuntimeException('Refusing to run legacy engine outside a disposable fixture');
}
$root = realpath($root);
require $root . '/_studio/engine/bootstrap.php';
require __DIR__ . '/GovernorLegacyBenchmark.php';

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
use VoxelSite\Tests\GovernorHeadingFixture;
use VoxelSite\Tests\GovernorLegacyBenchmark;
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
$fixture = GovernorHeadingFixture::manifest();
$action = $argv[2] ?? 'inline_edit';
if (!in_array($action, ['inline_edit', 'section_edit'], true)) {
    throw new RuntimeException('Invalid fixture action');
}
$virtual = $action === 'inline_edit' ? '__inline_snippet__' : '__section_snippet__';
$provider = new HeadingFakeProvider('<file path="' . $virtual . '">' . "\n" . $fixture['expected_heading'] . "\n</file>\n<message>Heading updated.</message>");
$fm = new FileManager($db);
$fm->syncPageRegistry();
$before = GovernorLegacyBenchmark::siteSnapshot($root);
$engine = new PromptEngine($db, $settings, $provider, fileManager: $fm);
ob_start();
$engine->execute(['user_id' => (int) $user, 'user_prompt' => $fixture['prompt'], 'action_type' => $action,
    'page_scope' => 'index', 'action_data' => ['path' => 'index.php', 'selection' => $fixture['target']['source_address'],
    'sectionHtml' => $fixture['target']['source_address']], 'headless' => true]);
ob_end_clean();
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
$row = $db->queryOne('SELECT status, error_message FROM prompt_log ORDER BY id DESC LIMIT 1');
$after = GovernorLegacyBenchmark::siteSnapshot($root);
$changes = GovernorLegacyBenchmark::classifyChanges($before, $after);
$completion = ($row['status'] ?? '') === 'success' && str_contains($content, $fixture['expected_heading'])
    && !str_contains($content, $fixture['target']['source_address']) ? 'pass' : 'skip-incorrect';
if ($changes['unexpected'] !== []) { $completion = 'wrong-file'; }
$report = ['action' => $action, 'calls' => $provider->calls, 'status' => $row,
    'task_completion' => $completion, 'file_changes' => $changes,
    'before_files' => $before, 'files' => $after];
file_put_contents($root . '/legacy-result.json', json_encode($report, JSON_THROW_ON_ERROR));
