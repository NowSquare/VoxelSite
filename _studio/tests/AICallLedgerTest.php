<?php
declare(strict_types=1);

require_once __DIR__ . '/../engine/Database.php';
require_once __DIR__ . '/../engine/AIProviderInterface.php';

use VoxelSite\AICallLedger;
use VoxelSite\AIProviderInterface;
use VoxelSite\Database;
use VoxelSite\RouterSecrets;
use VoxelSite\LedgeredAIProvider;

$passed = 0; $errors = [];
function check(bool $ok, string $message): void { global $passed, $errors; $ok ? $passed++ : $errors[] = $message; }
foreach (['AICallLedger', 'LedgeredAIProvider'] as $class) {
    $file = __DIR__ . '/../engine/' . $class . '.php';
    check(is_file($file), $class . ' implementation exists');
    if (is_file($file)) { require_once $file; }
}
$migrationPath = __DIR__ . '/../engine/migrations/007_ai_call_ledger.php';
check(is_file($migrationPath), 'Ledger migration exists');
if ($errors !== []) { foreach ($errors as $error) { echo "FAIL: {$error}\n"; } exit(1); }

// Disposable app fixtures may load shared contracts from the source checkout first.
$fixture = sys_get_temp_dir() . '/ledger-includes-' . bin2hex(random_bytes(6));
mkdir($fixture);
foreach (['AIProviderInterface', 'RouterSecrets', 'AICallLedger', 'LedgeredAIProvider'] as $name) {
    copy(__DIR__ . '/../engine/' . $name . '.php', $fixture . '/' . $name . '.php');
}
$bootstrap = '<?php ';
foreach (['AIProviderInterface', 'RouterSecrets', 'AICallLedger'] as $name) {
    $bootstrap .= 'require_once ' . var_export(realpath(__DIR__ . '/../engine/' . $name . '.php'), true) . ';';
}
$bootstrap .= 'require ' . var_export($fixture . '/LedgeredAIProvider.php', true) . ';';
file_put_contents($fixture . '/bootstrap.php', $bootstrap);
exec(escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg($fixture . '/bootstrap.php') . ' 2>&1', $fixtureOutput, $fixtureExit);
check($fixtureExit === 0, 'Copied engine files reuse source-loaded contracts without duplicate declarations');
foreach (glob($fixture . '/*.php') as $file) { unlink($file); }
rmdir($fixture);

final class LedgerTestProvider implements AIProviderInterface
{
    public array $calls = [];
    public array $usage = ['input_tokens' => 12, 'output_tokens' => 7, 'cost_usd' => 0.004, 'model' => 'resolved-stream-model'];
    public ?Throwable $failure = null;
    public bool $missingCompletion = false;
    public bool $metadataFailure = false;
    public string $apiKey;
    public function __construct() { $this->apiKey = bin2hex(random_bytes(24)); }
    public function getId(): string { if ($this->metadataFailure) { throw new RuntimeException('metadata'); } return 'test'; }
    public function getName(): string { return 'Test'; }
    public function getModels(): array { return [['id' => 'default-model', 'name' => 'Default', 'tier' => 'fast']]; }
    public function listModels(): array { return [['id' => 'live-model']]; }
    public function testConnection(): array { return [['id' => 'connected-model']]; }
    public function getConfigFields(): array { return [['key' => 'api_key']]; }
    public function validateConfig(array $config): bool { $this->calls[] = ['validateConfig', $config]; return true; }
    public function estimateTokens(string $text): int { $this->calls[] = ['estimateTokens', $text]; return 11; }
    public function getContextWindow(string $model): int { $this->calls[] = ['getContextWindow', $model]; return 12345; }
    public function estimateCost(int $inputTokens, int $outputTokens, string $model): array { $this->calls[] = ['estimateCost', $inputTokens, $outputTokens, $model]; return ['total_cost' => 0.5]; }
    public function complete(string $systemPrompt, array $messages, array $options = []): string {
        $this->calls[] = ['complete', $systemPrompt, $messages, $options];
        if ($this->failure) { throw $this->failure; }
        return "exact\0response";
    }
    public function stream(string $systemPrompt, array $messages, callable $onToken, callable $onComplete, array $options = []): void {
        $this->calls[] = ['stream', $systemPrompt, $messages, $options, $onToken];
        $onToken('chunk');
        if (!$this->missingCompletion) { $onComplete('full-response', $this->usage); }
        if ($this->failure) { throw $this->failure; }
    }
}

Database::resetInstance();
$db = Database::getInstance(':memory:');
$db->exec('CREATE TABLE prompt_log (id INTEGER PRIMARY KEY)');
$db->insert('prompt_log', ['id' => 1]);
$migration = require $migrationPath;
($migration['up'])($db); ($migration['up'])($db);
check($migration['version'] === '1.31.0', 'Migration has bounded release version');
$columns = array_column($db->query('PRAGMA table_info(ai_call_ledger)'), 'name');
check($columns === ['id', 'prompt_log_id', 'kind', 'provider', 'model', 'method', 'status', 'input_tokens', 'output_tokens', 'cost_usd', 'duration_ms', 'error_code', 'started_at', 'finished_at'], 'Only canonical metadata columns exist');
$ledger = new AICallLedger($db, 1);
$id = $ledger->start('classify', 'jev', 'alias', 'evaluate');
$row = $db->queryOne('SELECT * FROM ai_call_ledger WHERE id = ?', [$id]);
check(is_string($id) && strlen($id) >= 32 && $row['status'] === 'running' && $row['finished_at'] === null, 'Start allocates opaque ID and running record');
$ledger->finish($id, 'success', ['input_tokens' => 4, 'output_tokens' => 0], 0.0, null, 'resolved-model');
$row = $db->queryOne('SELECT * FROM ai_call_ledger WHERE id = ?', [$id]);
check($row['kind'] === 'classify' && $row['model'] === 'resolved-model' && $row['prompt_log_id'] === 1 && $row['input_tokens'] === 4 && $row['output_tokens'] === 0 && $row['cost_usd'] == 0 && $row['duration_ms'] >= 0 && $row['finished_at'] !== null, 'Classification records supplied usage, zero cost and resolved model');
$ledger->finish($id, 'error', ['input_tokens' => 900], 20, 'provider_error');
check($db->queryOne('SELECT * FROM ai_call_ledger WHERE id = ?', [$id]) === $row, 'Finish preserves first terminal result');
$db->delete('prompt_log', 'id = ?', [1]);
check($db->queryOne('SELECT * FROM ai_call_ledger WHERE id = ?', [$id])['prompt_log_id'] === null, 'Deleting prompt retains accounting with null linkage');
$ledger = new AICallLedger($db);
$gateId = $ledger->start('gate', 'unknown', null, 'evaluate');
$ledger->finish($gateId, 'error', ['input_tokens' => -1, 'output_tokens' => '8', 'body' => 'ignored'], NAN, 'http_error');
$gate = $db->queryOne('SELECT * FROM ai_call_ledger WHERE id = ?', [$gateId]);
check($gate['kind'] === 'gate' && $gate['input_tokens'] === null && $gate['output_tokens'] === null && $gate['cost_usd'] === null && $gate['error_code'] === 'http_error', 'Gate records validated metadata with unknown usage/cost null');

$syntheticSecret = bin2hex(random_bytes(24));
RouterSecrets::remember($syntheticSecret);
$secretId = $ledger->start('repair', 'provider-' . $syntheticSecret, 'model-' . $syntheticSecret, 'complete');
$ledger->finish($secretId, 'error', ['input_tokens' => 1, 'headers' => $syntheticSecret], null, $syntheticSecret, $syntheticSecret);
$ledger->start($syntheticSecret, 'test', 'safe', 'complete');
$ledger->start('generation', 'test', 'safe', $syntheticSecret);
$secretRow = $db->queryOne('SELECT * FROM ai_call_ledger WHERE id = ?', [$secretId]);
check($secretRow['provider'] === 'unknown' && $secretRow['model'] === null && $secretRow['error_code'] === 'call_error', 'Credential-like metadata is dropped and unknown errors normalized');
check(!str_contains(json_encode($db->query('SELECT * FROM ai_call_ledger')), $syntheticSecret), 'Registered secret absent from all persisted metadata');

$inner = new LedgerTestProvider();
$wrapper = new LedgeredAIProvider($inner, $ledger, 'configured-model');
$messages = [['role' => 'user', 'content' => 'private prompt']];
$options = ['model' => 'requested-model', 'custom' => new stdClass(), 'api_key' => $syntheticSecret];
$count = $db->count('ai_call_ledger');
check($wrapper->complete('private system', $messages, $options) === "exact\0response", 'Complete returns exact result');
check($inner->calls[0] === ['complete', 'private system', $messages, $options], 'Complete forwards exact arguments and object identities');
$last = fn() => $db->queryOne('SELECT * FROM ai_call_ledger ORDER BY rowid DESC LIMIT 1');
check($db->count('ai_call_ledger') === $count + 1 && $last()['model'] === 'requested-model' && $last()['input_tokens'] === null && $last()['cost_usd'] === null, 'Complete accounts once with unknown usage and cost');
$failure = new RuntimeException($syntheticSecret . ' raw response');
$inner->failure = $failure;
try { $wrapper->complete('system', []); check(false, 'Complete throws'); } catch (Throwable $actual) { check($actual === $failure, 'Complete rethrows original exception object'); }
check($last()['status'] === 'error' && $last()['error_code'] === 'provider_error', 'Complete error is fixed metadata');
$inner->failure = null;
$rebound = new LedgeredAIProvider($wrapper, $ledger);
$rebound->complete('system', []);
check($last()['model'] === 'configured-model', 'Rebinding a factory wrapper retains its configured model when no override is supplied');
$tokens = []; $completions = [];
$onToken = function ($token) use (&$tokens) { $tokens[] = $token; };
$onComplete = function ($response, $usage) use (&$completions) { $completions[] = [$response, $usage]; };
$wrapper->stream('system', $messages, $onToken, $onComplete, $options);
check(end($inner->calls) === ['stream', 'system', $messages, $options, $onToken] && $tokens === ['chunk'] && $completions === [['full-response', $inner->usage]], 'Stream preserves token callback identity, options and completion arguments');
check($last()['status'] === 'success' && $last()['input_tokens'] === 12 && $last()['output_tokens'] === 7 && $last()['cost_usd'] == 0.004, 'Stream records supplied usage and cost');
check($last()['model'] === 'resolved-stream-model', 'Stream resolved model replaces requested alias');
foreach ([[0, 0], [0, 8], [9, 0]] as [$inputTokens, $outputTokens]) {
    $inner->usage = ['input_tokens' => $inputTokens, 'output_tokens' => $outputTokens, 'model' => 'resolved-stream-model'];
    $wrapper->stream('system', [], $onToken, $onComplete);
    check($last()['input_tokens'] === ($inputTokens ?: null) && $last()['output_tokens'] === ($outputTokens ?: null), 'Ambiguous stream zero counters remain unknown individually');
    check(end($completions) === ['full-response', $inner->usage], 'Zero stream counters reach original callback unchanged');
}
$inner->usage = [];
$wrapper->stream('system', [], $onToken, $onComplete);
check($last()['input_tokens'] === null && $last()['output_tokens'] === null && $last()['cost_usd'] === null, 'Missing stream usage remains unknown');
$inner->missingCompletion = true;
$wrapper->stream('system', [], $onToken, $onComplete);
check($last()['status'] === 'error' && $last()['error_code'] === 'stream_incomplete', 'Missing completion is recorded as error without new exception');
$inner->missingCompletion = false;
$inner->usage = ['input_tokens' => 6, 'output_tokens' => 0, 'model' => 'resolved-error-model'];
$inner->failure = $failure;
try { $wrapper->stream('system', [], $onToken, $onComplete); } catch (Throwable $actual) { check($actual === $failure, 'Stream preserves thrown exception identity'); }
check($last()['status'] === 'error', 'Throw after onComplete still marks method failure');
check($last()['input_tokens'] === 6 && $last()['output_tokens'] === null && $last()['model'] === 'resolved-error-model', 'Thrown stream failure preserves known usage and resolved model');
$inner->failure = null;
try { $wrapper->stream('system', [], $onToken, function () use ($failure) { throw $failure; }); } catch (Throwable $actual) { check($actual === $failure, 'Completion callback exception is unchanged'); }
check($last()['status'] === 'error', 'Callback exception records error');

$db->insert('prompt_log', ['id' => 2]);
$rebound = new LedgeredAIProvider($wrapper, new AICallLedger($db, 2), 'rebound-model');
$count = $db->count('ai_call_ledger');
$rebound->complete('system', []);
check($db->count('ai_call_ledger') === $count + 1 && $last()['prompt_log_id'] === 2 && $last()['model'] === 'rebound-model', 'Rewrapping rebinds linkage without duplicate calls');
(new LedgeredAIProvider($inner, $ledger))->complete('system', []);
check($last()['model'] === 'default-model', 'Missing configured model uses first static ID');
$wrapper->complete('system', [], ['model' => '']);
check($last()['model'] === null && end($inner->calls)[3] === ['model' => ''], 'Explicit empty model remains unknown and reaches provider unchanged');
$inner->metadataFailure = true;
check($wrapper->complete('system', []) === "exact\0response", 'Metadata getter failure never changes provider execution');
$inner->metadataFailure = false;
check($wrapper->getId() === 'test' && $wrapper->getName() === 'Test' && $wrapper->getModels() === $inner->getModels() && $wrapper->listModels() === $inner->listModels() && $wrapper->testConnection() === $inner->testConnection() && $wrapper->getConfigFields() === $inner->getConfigFields(), 'Metadata methods delegate');
check($wrapper->validateConfig(['key' => 'value']) && $wrapper->estimateTokens('text') === 11 && $wrapper->getContextWindow('model') === 12345 && $wrapper->estimateCost(2, 3, 'model') === ['total_cost' => 0.5], 'Utility methods return original results');
check(array_slice($inner->calls, -4) === [['validateConfig', ['key' => 'value']], ['estimateTokens', 'text'], ['getContextWindow', 'model'], ['estimateCost', 2, 3, 'model']], 'Utility methods forward exact arguments');
ob_start(); var_dump($wrapper); $debug = ob_get_clean();
check(!str_contains($debug, $inner->apiKey) && !str_contains($debug, 'private prompt'), 'Wrapper debug omits inner provider and call payloads');
check(!str_contains(json_encode($db->query('SELECT * FROM ai_call_ledger')), 'private') && !str_contains(json_encode($db->query('SELECT * FROM ai_call_ledger')), $syntheticSecret), 'Prompts, response and secrets never persisted');

$logFile = tempnam(sys_get_temp_dir(), 'ledger-warning-');
$oldLog = ini_set('error_log', $logFile);
($migration['down'])($db);
check($wrapper->complete('system', []) === "exact\0response", 'Missing table does not change complete result');
check($ledger->start('generation', 'test', 'model', 'complete') === null, 'Missing table start returns null');
$ledger->finish($id, 'success'); $ledger->finish(null, 'success');
$warnings = file_get_contents($logFile);
check(!str_contains($warnings, 'SQL') && !str_contains($warnings, $syntheticSecret) && !str_contains($warnings, 'no such table'), 'Logging failure warnings contain no SQL or exception detail');
check($db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE name = 'ai_call_ledger'") === 0, 'No runtime schema creation');
ini_set('error_log', $oldLog); unlink($logFile);
Database::closeInstance();
foreach ($errors as $error) { echo 'FAIL: ' . $error . "\n"; }
echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
exit($errors === [] ? 0 : 1);
