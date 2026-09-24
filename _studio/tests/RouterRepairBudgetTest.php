<?php
declare(strict_types=1);

require_once __DIR__ . '/../engine/Database.php';
require_once __DIR__ . '/../engine/LedgeredAIProvider.php';
require_once __DIR__ . '/../engine/Settings.php';
require_once __DIR__ . '/../engine/Migrator.php';

use VoxelSite\AICallLedger;
use VoxelSite\AIProviderInterface;
use VoxelSite\Database;
use VoxelSite\LedgeredAIProvider;

$passed = 0; $errors = [];
function check(bool $ok, string $message): void { global $passed, $errors; $ok ? $passed++ : $errors[] = $message; }
function report(): never {
    global $passed, $errors;
    foreach ($errors as $error) { echo "FAIL: {$error}\n"; }
    echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
    exit($errors === [] ? 0 : 1);
}

check(method_exists(AICallLedger::class, 'bindGovernedTarget'), 'Ledger binds an immutable governed job target');
check(method_exists(AICallLedger::class, 'startGovernedGeneration'), 'Ledger atomically reserves the persistent generation/repair budget');
$migrationPath = __DIR__ . '/../engine/migrations/008_router_job_budget.php';
check(is_file($migrationPath), 'Persistent job budget migration exists');
if ($errors !== []) { report(); }

final class BudgetProvider implements AIProviderInterface
{
    public int $calls = 0;
    public bool $fail = false;
    public bool $metadataFail = false;
    public function getId(): string { if ($this->metadataFail) { throw new RuntimeException('private metadata'); } return 'fake'; }
    public function getName(): string { return 'Fake'; }
    public function getModels(): array { return [['id' => 'default-model']]; }
    public function listModels(): array { return []; }
    public function testConnection(): array { return []; }
    public function getConfigFields(): array { return []; }
    public function validateConfig(array $config): bool { return true; }
    public function estimateTokens(string $text): int { return 1; }
    public function getContextWindow(string $model): int { return 1000; }
    public function estimateCost(int $inputTokens, int $outputTokens, string $model): array { return []; }
    public function complete(string $systemPrompt, array $messages, array $options = []): string {
        $this->calls++;
        if ($this->fail) { throw new RuntimeException('private provider failure'); }
        return 'private candidate';
    }
    public function stream(string $systemPrompt, array $messages, callable $onToken, callable $onComplete, array $options = []): void {
        $text = $this->complete($systemPrompt, $messages, $options);
        $onToken($text); $onComplete($text, []);
    }
}

$databasePath = tempnam(sys_get_temp_dir(), 'governor-budget-');
$warningPath = tempnam(sys_get_temp_dir(), 'governor-budget-warning-');
$oldLog = ini_set('error_log', $warningPath);
Database::resetInstance();
$db = Database::getInstance($databasePath);
$db->exec('CREATE TABLE prompt_log (id INTEGER PRIMARY KEY)');
foreach (range(1, 15) as $id) { $db->insert('prompt_log', ['id' => $id]); }
$ledgerMigration = require __DIR__ . '/../engine/migrations/007_ai_call_ledger.php';
($ledgerMigration['up'])($db);
$migration = require $migrationPath;
($migration['up'])($db); ($migration['up'])($db);
check(version_compare($migration['version'], $ledgerMigration['version'], '>'), 'New budget migration applies to existing ledger installs');
check(array_column($db->query('PRAGMA table_info(governor_job_budget)'), 'name') === ['prompt_log_id', 'target_hash', 'generation_started', 'repairs_used'], 'Job budget schema contains only canonical metadata');

$provider = new BudgetProvider();
$target = 'private target selector';
foreach (range(0, 3) as $attempt) {
    $ledger = new AICallLedger($db, 1);
    check($ledger->bindGovernedTarget($target), 'Fresh ledger instance accepts the same job target');
    $wrapper = new LedgeredAIProvider($provider, $ledger, 'configured-model', 'generation', true);
    try {
        $wrapper->complete('private system', [['role' => 'user', 'content' => 'private prompt']]);
        check($attempt < 3, 'Third repair must refuse before provider execution');
    } catch (RuntimeException $error) {
        check($attempt === 3 && $error->getMessage() === 'repair_limit_exhausted', 'Exhausted budget reports fixed failure code');
    }
}
check($provider->calls === 3 && $ledger->governedRepairCount() === 2, 'Job permits exactly one generation and two repairs across instances');
check($ledger->isHealthy() && $ledger->governedFailure() === 'repair_limit_exhausted', 'Budget exhaustion does not become a metadata failure');
check(array_column($db->query('SELECT kind FROM ai_call_ledger WHERE prompt_log_id = 1 ORDER BY rowid'), 'kind') === ['generation', 'repair', 'repair'], 'Canonical rows distinguish initial generation from both repairs');
$budget = $db->queryOne('SELECT * FROM governor_job_budget WHERE prompt_log_id = 1');
check($budget['target_hash'] === hash('sha256', $target), 'Target stored only as a SHA-256 hash');
check(!$ledger->bindGovernedTarget('different target') && $ledger->isHealthy(), 'Rebinding target refuses without invalidating healthy accounting');
check($db->queryOne('SELECT * FROM governor_job_budget WHERE prompt_log_id = 1') === $budget, 'Failed rebind preserves pin and consumed budget');
$db->delete('ai_call_ledger', 'prompt_log_id = ?', [1]);
$fresh = new AICallLedger($db, 1); $fresh->bindGovernedTarget($target);
check($fresh->startGovernedGeneration('fake', 'model', 'complete') === null && $fresh->governedFailure() === 'repair_limit_exhausted', 'Accounting cleanup cannot reset durable repair budget');

$ledger = new AICallLedger($db, 2); $ledger->bindGovernedTarget($target);
$running = $ledger->startGovernedGeneration('fake', null, 'stream');
$provider->fail = true;
$wrapper = new LedgeredAIProvider($provider, $ledger, null, 'generation', true);
try { $wrapper->complete('system', []); } catch (RuntimeException) {}
$provider->fail = false;
$wrapper->stream('system', [], static function () {}, static function () {});
$before = $provider->calls;
try { $wrapper->stream('system', [], static function () {}, static function () {}); check(false, 'Fourth attempt refuses'); }
catch (RuntimeException $error) { check($error->getMessage() === 'repair_limit_exhausted', 'Stream also refuses exhausted budget'); }
check($provider->calls === $before && $ledger->governedRepairCount() === 2 && $db->queryOne('SELECT status FROM ai_call_ledger WHERE id = ?', [$running])['status'] === 'running', 'Running and failed attempts both consume their reservations');

$ledger = new AICallLedger($db, 3); $ledger->bindGovernedTarget($target);
$outer = new LedgeredAIProvider(new LedgeredAIProvider($provider, new AICallLedger($db), 'inherited-model'), $ledger, null, 'generation', true);
$outer->complete('system', []);
check($db->queryOne('SELECT model FROM ai_call_ledger WHERE prompt_log_id = 3')['model'] === 'inherited-model' && $db->count('ai_call_ledger', 'prompt_log_id = 3') === 1, 'Governed rebind retains configured model and accounts once');

foreach ([null, 9999, 4] as $job) {
    $ledger = new AICallLedger($db, $job);
    $before = $provider->calls;
    try { (new LedgeredAIProvider($provider, $ledger, null, 'generation', true))->complete('system', []); check(false, 'Unbound or missing job refuses'); }
    catch (RuntimeException $error) { check($error->getMessage() === 'ledger_unavailable', 'Unbound or missing job fails closed with metadata code'); }
    check(!$ledger->isHealthy() && $before === $provider->calls, 'Unlinked or unbound requests never reach provider');
}
$missing = new AICallLedger($db, 9999);
check(!$missing->bindGovernedTarget($target) && !$missing->isHealthy(), 'Missing prompt row cannot acquire a budget');
$ledger = new AICallLedger($db, 5); $ledger->bindGovernedTarget($target);
$provider->metadataFail = true; $before = $provider->calls;
try { (new LedgeredAIProvider($provider, $ledger, null, 'generation', true))->complete('system', []); check(false, 'Metadata failure refuses'); }
catch (RuntimeException $error) { check($error->getMessage() === 'ledger_unavailable', 'Metadata exceptions are replaced with fixed ledger code'); }
check(!$ledger->isHealthy() && $before === $provider->calls && $ledger->governedRepairCount() === null, 'Metadata failure remains fail closed');
$provider->metadataFail = false;

$ledger = new AICallLedger($db, 6); $ledger->bindGovernedTarget($target);
$db->beginTransaction();
check($ledger->startGovernedGeneration('fake', null, 'complete') === null && $db->getPdo()->inTransaction(), 'Nested transaction refuses without rolling back caller transaction');
$db->rollBack();
check($db->queryOne('SELECT generation_started FROM governor_job_budget WHERE prompt_log_id = 6')['generation_started'] === 0, 'Nested refusal leaves budget unconsumed');

$ledger = new AICallLedger($db, 7); $ledger->bindGovernedTarget($target);
$db->exec("CREATE TRIGGER refuse_call BEFORE INSERT ON ai_call_ledger BEGIN SELECT RAISE(ABORT, 'private failure'); END");
check($ledger->startGovernedGeneration('fake', null, 'complete') === null && !$ledger->isHealthy(), 'Ledger insertion failure refuses reservation');
$db->exec('DROP TRIGGER refuse_call');
check($db->queryOne('SELECT generation_started FROM governor_job_budget WHERE prompt_log_id = 7')['generation_started'] === 0, 'Ledger insertion failure rolls back budget atomically');

$ledger = new AICallLedger($db, 11); $ledger->bindGovernedTarget($target);
$db->exec("CREATE TRIGGER ignore_budget BEFORE UPDATE ON governor_job_budget BEGIN SELECT RAISE(IGNORE); END");
check($ledger->startGovernedGeneration('fake', null, 'complete') === null && !$ledger->isHealthy(), 'Unwritten reservation fails closed even without a database exception');
check($db->count('ai_call_ledger', 'prompt_log_id = 11') === 0, 'Ignored counter update creates no accounting row');
$db->exec('DROP TRIGGER ignore_budget');

$ledger = new AICallLedger($db, 12); $ledger->bindGovernedTarget($target);
$ledger->startGovernedGeneration('fake', null, 'complete');
$db->delete('governor_job_budget', 'prompt_log_id = ?', [12]);
$ledger = new AICallLedger($db, 12);
check(!$ledger->bindGovernedTarget($target) && !$ledger->isHealthy() && $ledger->governedFailure() === 'ledger_unavailable', 'Lost budget refuses reconstruction when previous generation accounting exists');
check($db->count('governor_job_budget', 'prompt_log_id = 12') === 0, 'Lost budget cannot reset the recorded job allowance');

// Independent PHP processes race for the two remaining repair reservations.
$ledger = new AICallLedger($db, 8); $ledger->bindGovernedTarget($target); $ledger->startGovernedGeneration('fake', null, 'complete');
$childPath = tempnam(sys_get_temp_dir(), 'budget-contender-');
$source = '<?php require ' . var_export(realpath(__DIR__ . '/../engine/Database.php'), true) . '; require ' . var_export(realpath(__DIR__ . '/../engine/AICallLedger.php'), true) . '; '
    . '$db = \\VoxelSite\\Database::getInstance($argv[1]); $ledger = new \\VoxelSite\\AICallLedger($db, 8); $ledger->bindGovernedTarget(' . var_export($target, true) . '); '
    . '$id = $ledger->startGovernedGeneration("fake", null, "complete"); echo $id === null ? $ledger->governedFailure() : "reserved";';
file_put_contents($childPath, $source);
$children = [];
for ($i = 0; $i < 6; $i++) {
    $pipes = [];
    $process = proc_open([PHP_BINARY, $childPath, $databasePath], [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    fclose($pipes[0]); $children[] = [$process, $pipes];
}
$results = [];
foreach ($children as [$process, $pipes]) {
    $results[] = stream_get_contents($pipes[1]); $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[1]); fclose($pipes[2]);
    check(proc_close($process) === 0 && $stderr === '', 'Independent reservation contender exits cleanly');
}
unlink($childPath);
check(count(array_filter($results, fn($result) => $result === 'reserved')) === 2 && count(array_filter($results, fn($result) => $result === 'repair_limit_exhausted')) === 4, 'Concurrent connections grant exactly two repair reservations');
check($db->count('ai_call_ledger', 'prompt_log_id = 8') === 3 && $ledger->governedRepairCount() === 2, 'Concurrent durable budget agrees with canonical attempt rows');

$ledger = new AICallLedger($db, 9); $ledger->bindGovernedTarget($target);
$db->delete('prompt_log', 'id = ?', [9]);
check($db->count('governor_job_budget', 'prompt_log_id = 9') === 0 && $ledger->startGovernedGeneration('fake', null, 'complete') === null, 'Deleting job cascades its budget and refuses subsequent generation');
check(!str_contains(json_encode($db->query('SELECT * FROM governor_job_budget')), 'private') && !str_contains(json_encode($db->query('SELECT * FROM ai_call_ledger')), 'private'), 'No target, prompt, candidate or provider error text leaks into metadata');

($migration['down'])($db);
$ledger = new AICallLedger($db, 10); $before = $provider->calls;
check(!$ledger->bindGovernedTarget($target) && $ledger->governedRepairCount() === null, 'Missing budget schema refuses binding and metadata reads');
try { (new LedgeredAIProvider($provider, $ledger, null, 'generation', true))->complete('system', []); check(false, 'Missing schema blocks provider'); }
catch (RuntimeException $error) { check($error->getMessage() === 'ledger_unavailable' && $before === $provider->calls, 'Missing schema fails closed before provider call'); }
check($db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE name = 'governor_job_budget'") === 0, 'Governed execution never creates runtime schema');

$db->exec('CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)');
$settings = new \VoxelSite\Settings($db);
$settings->set('schema_version', '1.31.0');
$migrator = new \VoxelSite\Migrator($db, $settings);
$upgrade = $migrator->run();
check(count($upgrade['applied']) === 4 && $upgrade['current_version'] === '1.31.0.4'
    && $db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE name = 'governor_job_budget'") === 1
    && $db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE name = 'governor_claim_overrides'") === 1
    && $db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE name = 'governor_pending_headings'") === 1,
    'Real Migrator upgrades existing schema 1.31.0 with budget, owner audit and pending-candidate migrations');
check($migrator->run()['applied'] === [], 'Real Migrator applies pending Router migrations once');

$ledger = new AICallLedger($db, 13); $ledger->bindGovernedTarget($target);
($ledgerMigration['down'])($db);
$before = $provider->calls;
try { (new LedgeredAIProvider($provider, $ledger, null, 'generation', true))->complete('system', []); check(false, 'Missing call ledger blocks governed execution'); }
catch (RuntimeException $error) { check($error->getMessage() === 'ledger_unavailable' && $before === $provider->calls, 'Missing accounting schema refuses before provider call'); }
check($db->queryOne('SELECT generation_started FROM governor_job_budget WHERE prompt_log_id = 13')['generation_started'] === 0, 'Missing accounting schema rolls back reservation');

Database::closeInstance();
ini_set('error_log', $oldLog);
foreach ([$databasePath, $databasePath . '-wal', $databasePath . '-shm', $warningPath] as $path) { if (is_file($path)) { unlink($path); } }
report();
