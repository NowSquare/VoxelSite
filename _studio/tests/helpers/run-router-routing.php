<?php
declare(strict_types=1);
$root = realpath($argv[1] ?? '') ?: '';
if (!is_file($root . '/.routing-fixture')) { throw new RuntimeException('Disposable routing root required'); }
putenv('VS_TEST_PREVIEW_DIR=' . $root . '/_studio/preview');
putenv('VS_TEST_ASSETS_DIR=' . $root . '/assets');
require $root . '/_studio/engine/bootstrap.php';
require __DIR__ . '/RouterHeadingFixture.php';
foreach (['PromptEngine', 'AIRouter', 'FileManager', 'SiteContext', 'RevisionManager', 'Logger', 'TailwindCompiler', 'AEOGenerator'] as $class) {
    if (!str_starts_with((new ReflectionClass('VoxelSite\\' . $class))->getFileName(), $root . '/_studio/engine/')) {
        throw new RuntimeException('Non-isolated production class: ' . $class);
    }
}
$scenario = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
$db = \VoxelSite\Database::getInstance($root . '/_studio/data/studio.db');
foreach (glob($root . '/_studio/engine/migrations/*.php') as $file) { $migration = require $file; ($migration['up'])($db); }
$user = $db->insert('users', ['email' => 'routing@example.test', 'password_hash' => 'not-a-login', 'name' => 'Routing',
    'role' => 'owner', 'created_at' => now(), 'updated_at' => now()]);
$settings = new \VoxelSite\Settings($db);
$settings->setMany(['site_name' => 'Canal Bakery', 'ai_provider' => 'claude', 'ai_claude_model' => 'routing-default',
    'ai_max_tokens' => $scenario['max_tokens'] ?? 32000, 'evaluator_enabled' => false, 'design_review_enabled' => false,
    'governor.mode' => $scenario['mode'] ?? 'enforce',
    'governor.model_map' => ['cheap' => ['provider' => 'claude', 'model' => 'routing-cheap'],
        'frontier' => ['provider' => ($scenario['fault'] ?? '') === 'map_mismatch' ? 'openai' : 'claude', 'model' => 'routing-frontier']]]);
$secret = bin2hex(random_bytes(32));
$appKey = \VoxelSite\Encryption::generateKey();
file_put_contents($root . '/_studio/data/config.json', json_encode(['app_key' => $appKey]));
$encrypted = (new \VoxelSite\Encryption($appKey))->encrypt($secret);
if (($scenario['fault'] ?? '') !== 'missing_key') { $settings->set('governor.typesafe_api_key', $encrypted); }
$action = $scenario['action'] ?? 'inline_edit';
$selection = '<p>Sourdough is baked each morning.</p>';
$replacement = '<p>Fresh bread daily.</p>';
$original = file_get_contents($root . '/_studio/preview/index.php');
$actionData = $scenario['action_data'] ?? [];
if (in_array($action, ['inline_edit', 'section_edit'], true)) {
    $actionData = ['path' => 'index.php', 'selection' => $selection, 'sectionHtml' => $selection];
}
$response = match (($scenario['intent'] ?? '') === 'add_page' ? 'add_page' : $action) {
    'inline_edit' => '<file path="__inline_snippet__">' . $replacement . '</file>',
    'section_edit' => '<file path="__section_snippet__">' . $replacement . '</file>',
    'add_page' => '<file path="services.php">' . str_replace($selection, '<p>ROUTING_CREATED_PAGE</p>', $original) . '</file>',
    default => '<file path="index.php">' . str_replace($selection, $replacement, $original) . '</file>',
};
$response = preg_replace('/(<file[^>]*>)/', '$1' . "\n", $response);
$response = str_replace('</file>', "\n</file>\n", $response);
$response .= '<message>Updated the requested content.</message>';
if (($scenario['intent'] ?? '') === 'question') {
    $response = '<file path="index.php">' . "\n" . str_replace($selection, '<p>MALICIOUS_QUESTION_WRITE</p>', $original) . "\n</file>\n<message>The bakery sells sourdough.</message>";
}
final class RoutingProvider implements \VoxelSite\AIProviderInterface
{
    public \VoxelSite\Tests\HeadingFakeProvider $inner;
    public function __construct(string $response) { $this->inner = new \VoxelSite\Tests\HeadingFakeProvider($response); }
    public function getId(): string { return 'claude'; }
    public function getName(): string { return 'Routing fixture'; }
    public function getModels(): array { return array_map(fn($id) => ['id' => $id, 'name' => $id, 'tier' => 'fast'], ['routing-default', 'routing-cheap', 'routing-frontier']); }
    public function listModels(): array { return $this->getModels(); }
    public function testConnection(): array { return $this->getModels(); }
    public function getConfigFields(): array { return []; }
    public function validateConfig(array $config): bool { return true; }
    public function getContextWindow(string $model): int { return 200000; }
    public function estimateTokens(string $text): int { return $this->inner->estimateTokens($text); }
    public function estimateCost(int $inputTokens, int $outputTokens, string $model): array { return $this->inner->estimateCost($inputTokens, $outputTokens, $model); }
    public function complete(string $systemPrompt, array $messages, array $options = []): string {
        $answer = '';
        $this->inner->stream($systemPrompt, $messages, static function ($token) {}, function ($response) use (&$answer) { $answer = $response; }, $options);
        return $answer;
    }
    public function stream(string $systemPrompt, array $messages, callable $onToken, callable $onComplete, array $options = []): void { $this->inner->stream($systemPrompt, $messages, $onToken, $onComplete, $options); }
}
final class RoutingTypedClient implements \VoxelSite\TypeSafeClientInterface
{
    public array $requests = [];
    public function __construct(private array $scenario, private ?\Closure $afterClassify = null) {}
    public function evaluate(array $state, array $questions): array
    {
        $this->requests[] = ['state' => $state, 'questions' => $questions];
        if (($this->scenario['fault'] ?? '') === 'outage') { throw new RuntimeException('Synthetic router outage'); }
        $choices = ['intent' => $this->scenario['intent'] ?? 'edit_copy', 'scope' => $this->scenario['scope'] ?? 'one_section',
            'model_tier' => $this->scenario['tier'] ?? 'cheap', 'repair_target' => isset($state['targets']['target_0']) ? 'target_0' : 'none'];
        $answers = [];
        foreach ($questions as $id => $question) {
            if ($question['type'] === 'noul') {
                $answers[$id] = ['type' => 'noul', 'noul' => $id === 'needs_file_write' && !in_array($choices['intent'], ['question', 'noop'], true) ? 0.99 : 0.01];
            } else {
                $choice = $choices[$id];
                $probabilities = array_fill_keys(array_keys($question['criteria']), 0.0);
                $confidence = ($this->scenario['fault'] ?? '') === 'low_confidence' ? 0.3 : 0.99;
                $probabilities[$choice] = $confidence;
                $answers[$id] = ['type' => 'choice', 'choice' => $choice, 'confidence' => $confidence, 'probabilities' => $probabilities];
            }
        }
        if ($this->afterClassify !== null) { ($this->afterClassify)(); }
        return ['status' => 'ok', 'answers' => $answers, 'model' => 'jev-fixture', 'calls' => 1,
            'usage' => ['input_tokens' => 100, 'output_tokens' => 50]];
    }
}
$provider = new RoutingProvider($response);
if (!empty($scenario['stale'])) {
    $provider->inner->duringChunk = function () use ($root, $original, $selection) {
        file_put_contents($root . '/_studio/preview/index.php', str_replace($selection, '<p>Concurrent owner edit.</p>', $original));
    };
}
$afterClassify = !empty($scenario['stale_classification']) ? function () use ($root, $original, $selection) {
    file_put_contents($root . '/_studio/preview/index.php', str_replace($selection, '<p>Concurrent owner edit.</p>', $original));
} : null;
$client = new RoutingTypedClient($scenario, $afterClassify); $constructions = 0;
$factory = function (#[\SensitiveParameter] string $key) use ($client, &$constructions) { $constructions++; return $client; };
if (!empty($scenario['cancel'])) {
    $provider->inner->duringChunk = function () use ($db, $provider) {
        $provider->inner->duringChunk = null;
        $db->update('prompt_log', ['status' => 'error', 'error_message' => 'Generation was cancelled.'], "status = ?", ['streaming']);
        // The real engine polls cancellation once per second. Cross that boundary.
        usleep(1100000);
    };
}
$siteData = json_decode(file_get_contents($root . '/assets/data/site.json'), true, 512, JSON_THROW_ON_ERROR);
$siteData['routing_test_fact'] = 'ROUTING_DATA_SOURCE_SENTINEL';
if (!empty($scenario['oversized_context'])) { $siteData['routing_large_data'] = str_repeat('Large site fact. ', 60000); }
file_put_contents($root . '/assets/data/site.json', json_encode($siteData, JSON_THROW_ON_ERROR));
$fm = new \VoxelSite\FileManager($db); $fm->syncPageRegistry();
$before = \VoxelSite\Tests\RouterHeadingFixture::snapshot($root . '/_studio/preview');
$beforeAssets = \VoxelSite\Tests\RouterHeadingFixture::snapshot($root . '/assets');
$router = new \VoxelSite\AIRouter($db, $settings, $factory);
$engine = new \VoxelSite\PromptEngine($db, $settings, $provider, fileManager: $fm, governorRouter: $router);
$jobId = null;
if (!empty($scenario['preallocated'])) {
    $jobId = $db->insert('prompt_log', ['user_id' => (int) $user, 'user_prompt' => $scenario['prompt'] ?? 'Shorten the selected paragraph.',
        'action_type' => $action, 'action_data' => json_encode($actionData), 'ai_provider' => 'claude', 'ai_model' => 'routing-default',
        'status' => 'streaming', 'created_at' => now()]);
}
ob_start();
$engine->execute(['user_id' => (int) $user, 'user_prompt' => $scenario['prompt'] ?? 'Shorten the selected paragraph.',
    'action_type' => $action, 'page_scope' => (array_key_exists('page_scope', $scenario) ? $scenario['page_scope'] : 'index'), 'action_data' => $actionData, 'headless' => empty($scenario['interactive']), 'prompt_log_id' => $jobId]);
if (ob_get_level() > 0) { ob_end_clean(); }
$row = $db->queryOne('SELECT * FROM prompt_log ORDER BY id DESC LIMIT 1');
$report = ['calls' => $provider->inner->calls, 'requests' => $client->requests, 'client_constructions' => $constructions,
    'preallocated_id' => $jobId, 'prompt_count' => $db->count('prompt_log'), 'row' => $row, 'metadata' => json_decode($row['action_data'] ?? '{}', true),
    'ledger' => $db->query('SELECT * FROM ai_call_ledger ORDER BY started_at, id'),
    'revisions' => $db->count('revisions'), 'before_assets' => $beforeAssets,
    'default_model' => $settings->get('ai_claude_model'), 'before' => $before];
if (!empty($scenario['undo'])) {
    $report['before_undo'] = file_get_contents($root . '/_studio/preview/index.php');
    $report['undo_result'] = (new \VoxelSite\RevisionManager($db, $settings, $fm))->undo();
    $undone = file_get_contents($root . '/_studio/preview/index.php');
    $report['undo_restored'] = str_contains($undone, $selection) && !str_contains($undone, $replacement);
}
register_shutdown_function(function () use ($root, $report, $secret, $encrypted) {
    $report['after_assets'] = \VoxelSite\Tests\RouterHeadingFixture::snapshot($root . '/assets');
    $report['after'] = \VoxelSite\Tests\RouterHeadingFixture::snapshot($root . '/_studio/preview');
    $report['content'] = file_get_contents($root . '/_studio/preview/index.php');
    $report['created'] = is_file($root . '/_studio/preview/services.php') ? file_get_contents($root . '/_studio/preview/services.php') : null;
    $diagnostics = json_encode($report);
    foreach (glob($root . '/_studio/logs/*.log') as $log) { $diagnostics .= file_get_contents($log); }
    $report['secrets_excluded'] = !str_contains($diagnostics, $secret) && !str_contains($diagnostics, $encrypted);
    file_put_contents($root . '/routing-result.json', json_encode($report, JSON_THROW_ON_ERROR));
});
