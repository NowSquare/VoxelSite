<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
require_once __DIR__ . '/helpers/RouterHeadingFixture.php';

use VoxelSite\{AICallLedger, Database, LedgeredAIProvider};
use VoxelSite\Tests\{RouterHeadingFixture as Fixture, HeadingFakeProvider};

$passed = 0; $errors = [];
function check(bool $ok, string $message): void { global $passed, $errors; $ok ? $passed++ : $errors[] = $message; }
function requestPrompt(string $root, array $body, int $keyId = 41): array
{
    $child = proc_open([PHP_BINARY, __DIR__ . '/helpers/call-router-prompt.php', $root],
        [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
    if (!is_resource($child)) { throw new RuntimeException('Cannot start endpoint probe'); }
    fwrite($pipes[0], json_encode(['body' => $body, 'key_id' => $keyId], JSON_THROW_ON_ERROR));
    fclose($pipes[0]);
    $stdout = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $stderr = stream_get_contents($pipes[2]); fclose($pipes[2]);
    $exit = proc_close($child);
    if ($exit !== 0 || $stderr !== '') { throw new RuntimeException('Endpoint probe failed: ' . $stderr); }
    $result = json_decode($stdout, true, 512, JSON_THROW_ON_ERROR);
    if ($result['status'] === 202) {
        $id = $result['response']['data']['id'];
        $ack = $root . '/worker-' . $id . '.json';
        $deadline = microtime(true) + 5;
        while (!is_file($ack) && microtime(true) < $deadline) { usleep(10000); }
        if (!is_file($ack)) { throw new RuntimeException('Disposable worker did not acknowledge job'); }
        check(json_decode(file_get_contents($ack), true) === ['job' => (string) $id, 'key-id' => (string) $keyId, 'root' => $root],
            'Endpoint dispatches its allocated job to the disposable worker');
    }
    return $result;
}

function exhaustJob(Database $db, int $jobId, string $target): void
{
    $provider = new HeadingFakeProvider('A fresh bakery heading');
    // Recreate the ledger for each invocation: identity is the persisted job ID.
    for ($attempt = 0; $attempt < 4; $attempt++) {
        $ledger = new AICallLedger($db, $jobId);
        check($ledger->bindGovernedTarget($target), 'Same-job re-entry keeps the original target');
        $wrapper = new LedgeredAIProvider($provider, $ledger, 'fixture', 'generation', true);
        try {
            $wrapper->stream('Heading fixture', [], static function () {}, static function () {});
            check($attempt < 3, 'A job allows only initial generation and two repairs');
        } catch (RuntimeException $error) {
            check($attempt === 3 && $error->getMessage() === 'repair_limit_exhausted', 'Third repair refuses explicitly');
        }
    }
    check(count($provider->calls) === 3 && $ledger->governedRepairCount() === 2, 'Each job has exactly three provider calls and two repairs');
    check(array_column($db->query('SELECT kind FROM ai_call_ledger WHERE prompt_log_id = ? ORDER BY rowid', [$jobId]), 'kind')
        === ['generation', 'repair', 'repair'], 'Calls are independently accounted against this job');
}

$root = sys_get_temp_dir() . '/governor-continuation-' . bin2hex(random_bytes(8));
mkdir($root, 0700);
$root = realpath($root);
file_put_contents($root . '/.governor-continuation-test', 'disposable');
Database::resetInstance();
try {
    foreach (['_studio/api/agent/v1', '_studio/worker', '_studio/logs'] as $path) { mkdir($root . '/' . $path, 0700, true); }
    copy(__DIR__ . '/../api/agent/v1/prompt.php', $root . '/_studio/api/agent/v1/prompt.php');
    // No application bootstrap or generator: acknowledge arguments atomically,
    // as the worker's final operation, so cleanup cannot race its file reads.
    file_put_contents($root . '/_studio/worker/prompt-runner.php', <<<'PHP'
<?php
$args = getopt('', ['job:', 'key-id:', 'root:']);
$root = $args['root'];
if (!is_file($root . '/.governor-continuation-test')) { exit(2); }
$ack = $root . '/worker-' . (int) $args['job'] . '.json';
file_put_contents($ack . '.tmp', json_encode($args));
rename($ack . '.tmp', $ack);
PHP);
    $db = Database::getInstance($root . '/studio.db');
    foreach (glob(__DIR__ . '/../engine/migrations/*.php') as $path) { $migration = require $path; ($migration['up'])($db); }
    $db->insert('users', ['email' => 'fixture@example.test', 'password_hash' => 'not-a-login', 'name' => 'Fixture',
        'role' => 'owner', 'created_at' => '2026-09-24', 'updated_at' => '2026-09-24']);
    $body = ['prompt' => 'Rewrite the bakery heading', 'action_type' => 'inline_edit', 'page_scope' => 'index'];
    $first = requestPrompt($root, $body);
    check($first['status'] === 202, 'Initial Agent request queues a job');
    $oldId = (int) $first['response']['data']['id'];
    $target = 'index.php:fixture-heading:unchanged-source-hash';
    exhaustJob($db, $oldId, $target);
    $db->update('prompt_log', ['status' => 'error', 'error_message' => 'repair_limit_exhausted'], 'id = ?', [$oldId]);
    $oldJob = $db->queryOne('SELECT * FROM prompt_log WHERE id = ?', [$oldId]);
    $oldBudget = $db->queryOne('SELECT * FROM governor_job_budget WHERE prompt_log_id = ?', [$oldId]);
    $oldCalls = $db->query('SELECT * FROM ai_call_ledger WHERE prompt_log_id = ? ORDER BY rowid', [$oldId]);

    $continued = requestPrompt($root, $body + ['continue_from' => $oldId]);
    check($continued['status'] === 202, 'Agent continuation queues another job after exhaustion');
    $newId = (int) $continued['response']['data']['id'];
    $newJob = $db->queryOne('SELECT * FROM prompt_log WHERE id = ?', [$newId]);
    check($newId !== $oldId && $db->count('prompt_log') === 2, 'continue_from allocates a NEW prompt_log job');
    check($continued['response']['data']['conversation_id'] === $first['response']['data']['conversation_id']
        && $newJob['conversation_id'] === $oldJob['conversation_id'] && $db->count('conversations') === 1,
        'continue_from reuses only the conversation, not the job');
    check($newJob['api_key_id'] === $oldJob['api_key_id'] && $newJob['status'] === 'queued', 'New job retains caller ownership and starts queued');
    check($db->count('governor_job_budget', 'prompt_log_id = ?', [$newId]) === 0, 'Queuing a new job does not copy the old budget');
    exhaustJob($db, $newId, $target);
    check($db->count('governor_job_budget') === 2 && $db->count('ai_call_ledger') === 6,
        'Two jobs in one conversation each receive their own allowance');
    check($db->queryOne('SELECT * FROM prompt_log WHERE id = ?', [$oldId]) === $oldJob
        && $db->queryOne('SELECT * FROM governor_job_budget WHERE prompt_log_id = ?', [$oldId]) === $oldBudget
        && $db->query('SELECT * FROM ai_call_ledger WHERE prompt_log_id = ? ORDER BY rowid', [$oldId]) === $oldCalls,
        'New job execution does not reset or rewrite the exhausted source job');
    $oldLedger = new AICallLedger($db, $oldId);
    check($oldLedger->bindGovernedTarget($target) && $oldLedger->startGovernedGeneration('fake', 'fixture', 'stream') === null
        && $oldLedger->governedFailure() === 'repair_limit_exhausted', 'Source job still refuses same-job re-entry after continuation');

    foreach ([[$oldId, 42, 403], [999999, 41, 404]] as [$source, $key, $status]) {
        $before = $db->query('SELECT * FROM prompt_log ORDER BY id');
        $result = requestPrompt($root, $body + ['continue_from' => $source], $key);
        check($result['status'] === $status, 'Foreign or missing continuation source refuses');
        check($db->query('SELECT * FROM prompt_log ORDER BY id') === $before && $db->count('conversations') === 1
            && $db->count('governor_job_budget') === 2 && count(glob($root . '/worker-*.json')) === 2,
            'Rejected continuation creates no job, conversation, budget or worker');
    }
} catch (Throwable $error) {
    $errors[] = $error->getMessage();
} finally {
    Database::resetInstance();
    Fixture::remove($root);
}
foreach ($errors as $error) { echo "FAIL: {$error}\n"; }
echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
exit($errors === [] ? 0 : 1);
