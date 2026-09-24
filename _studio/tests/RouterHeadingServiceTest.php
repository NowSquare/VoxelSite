<?php
declare(strict_types=1);

namespace VoxelSite {
    // Isolated configuration seam: never read the installed app key or database.
    function loadConfig(): array { return $GLOBALS['heading_service_config']; }
}
namespace {
require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
require_once __DIR__ . '/helpers/RouterHeadingFixture.php';

use VoxelSite\{AICallLedger, Database, Encryption, FileManager, RouterHeading, Settings, TypeSafeClientInterface};
use VoxelSite\Tests\{RouterHeadingFixture as Fixture, HeadingFakeProvider};

$passed = 0; $errors = [];
function check(bool $ok, string $message): void { global $passed, $errors; $ok ? $passed++ : $errors[] = $message; }
function finish(): never {
    global $passed, $errors;
    foreach ($errors as $error) { echo "FAIL: {$error}\n"; }
    echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
    exit($errors === [] ? 0 : 1);
}
check(class_exists(RouterHeading::class), 'Enforced heading service exists');
if (!class_exists(RouterHeading::class)) { finish(); }

final class HeadingRouteClient implements TypeSafeClientInterface
{
    public array $calls = [];
    public ?Closure $duringRoute = null;
    public ?Closure $duringGate = null;
    public array $changes = [];
    public string $failure = '';
    public function evaluate(array $state, array $questions): array {
        $this->calls[] = ['state' => $state, 'questions' => $questions];
        $gate = isset($questions['forbidden_claims']);
        if ($gate && $this->duringGate) { ($this->duringGate)(); }
        if (!$gate && $this->duringRoute) { ($this->duringRoute)(); }
        if ($this->failure === ($gate ? 'gate_throw' : 'route_throw')) { throw new RuntimeException('raw private failure'); }
        if ($this->failure === ($gate ? 'gate_error' : 'route_error')) { return ['status' => 'error', 'answers' => ['forbidden_claims' => ['type' => 'noul', 'noul' => 0]]]; }
        $answer = ['status' => 'ok', 'model' => 'jev-fixture', 'usage' => ['input_tokens' => 40, 'output_tokens' => 10], 'answers' => []];
        foreach ($questions as $id => $question) {
            if ($question['type'] === 'noul') {
                $answer['answers'][$id] = ['type' => 'noul', 'noul' => $id === 'needs_file_write' ? 0.99 : 0.01];
            } else {
                $choice = ['intent' => 'edit_copy', 'scope' => 'one_section', 'model_tier' => 'cheap', 'repair_target' => 'target_0'][$id];
                $answer['answers'][$id] = ['type' => 'choice', 'choice' => $choice, 'confidence' => 0.99];
            }
            if (isset($this->changes[$id])) { $answer['answers'][$id] = array_replace($answer['answers'][$id], $this->changes[$id]); }
        }
        return $answer;
    }
}

function scenario(array $case = []): array {
    $root = Fixture::create();
    $oldPreview = getenv('VS_TEST_PREVIEW_DIR');
    putenv('VS_TEST_PREVIEW_DIR=' . $root);
    Database::resetInstance();
    $db = Database::getInstance(':memory:');
    $db->exec('CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)');
    $db->exec('CREATE TABLE pages (id INTEGER PRIMARY KEY, title TEXT, file_path TEXT, page_type TEXT)');
    $db->exec('CREATE TABLE prompt_log (id INTEGER PRIMARY KEY)');
    $db->insert('prompt_log', ['id' => 1]);
    $migration = require __DIR__ . '/../engine/migrations/007_ai_call_ledger.php';
    ($migration['up'])($db);
    $budgetMigration = require __DIR__ . '/../engine/migrations/008_router_job_budget.php';
    ($budgetMigration['up'])($db);
    $fixture = Fixture::manifest();
    $path = $case['path'] ?? 'index.php';
    $selection = $fixture['target']['source_address'];
    $original = file_get_contents($root . '/index.php');
    if ($path === 'services/bread.php') { mkdir($root . '/services'); file_put_contents($root . '/' . $path, $original); }
    $db->insert('pages', ['id' => 1, 'title' => 'Home', 'file_path' => $path, 'page_type' => $case['page_type'] ?? 'page']);
    if (isset($case['content'])) { file_put_contents($root . '/index.php', str_replace('@heading@', $selection, $case['content'])); }
    $settings = new Settings($db);
    $key = bin2hex(random_bytes(24));
    $GLOBALS['heading_service_config'] = ['app_key' => Encryption::generateKey()];
    $settings->setMany(['governor.mode' => 'enforce', 'site_name' => 'Canal Bakery', 'site_tagline' => 'Bread by the canal']);
    $settings->set('governor.typesafe_api_key', (new Encryption($GLOBALS['heading_service_config']['app_key']))->encrypt($key));
    if (!empty($case['missing_key'])) { $settings->set('governor.typesafe_api_key', null); }
    $client = new HeadingRouteClient();
    $client->changes = $case['answers'] ?? [];
    $client->failure = $case['failure'] ?? '';
    $cancelled = false;
    $mutate = static function (string $phase) use ($case, $root, $path, $db, $settings, &$cancelled): void {
        if (($case['drift'] ?? '') === $phase) { file_put_contents($root . '/' . $path, "\n<!-- concurrent edit -->", FILE_APPEND); }
        if (($case['delete_key'] ?? '') === $phase) { $settings->set('governor.typesafe_api_key', null); }
        if (($case['cancel'] ?? '') === $phase) { $cancelled = true; }
        if (($case['drop_ledger'] ?? '') === $phase) { $db->exec('DROP TABLE IF EXISTS ai_call_ledger'); }
    };
    $client->duringRoute = fn() => $mutate('route');
    $client->duringGate = fn() => $mutate('gate');
    $provider = new HeadingFakeProvider($case['candidate'] ?? $fixture['accepted_candidate']);
    $provider->duringChunk = fn() => $mutate('generation');
    $generators = 0; $writers = 0; $clients = 0; $ordered = true;
    $service = new RouterHeading($db, $settings, function (string $provided) use ($key, $client, &$clients) {
        check($provided === $key, 'Client receives only the decrypted runtime key'); $clients++; return $client;
    });
    $request = ['action_type' => $case['action'] ?? 'inline_edit', 'user_prompt' => $fixture['prompt'],
        'action_data' => ['path' => $path, 'selection' => $selection, 'sectionHtml' => $selection]];
    if (array_key_exists('prompt', $case)) { $request['user_prompt'] = $case['prompt']; }
    if (!empty($case['escaped_secret'])) {
        $encoded = implode('', array_map(static fn(string $char): string => sprintf('\\u%04x', ord($char)), str_split($key)));
        $request['user_prompt'] = 'Replace the selected heading with "' . $encoded . '".';
    }
    if (isset($case['data'])) { $request['action_data'] = array_replace($request['action_data'], $case['data']); }
    if (!empty($case['section_only'])) { unset($request['action_data']['selection']); }
    $before = Fixture::snapshot($root);
    if (($case['drop_ledger'] ?? '') === 'before') { $db->exec('DROP TABLE ai_call_ledger'); }
    try {
        $result = $service->execute($request, 1,
            function () use ($provider, &$generators, &$ordered, $client) {
                $ordered = $ordered && count($client->calls) === 1; $generators++; return $provider;
            },
            function () use ($db, &$writers, &$ordered, $client) {
                $ordered = $ordered && count($client->calls) === 2; $writers++; return new FileManager($db);
            }, static function () use (&$cancelled): bool { return $cancelled; });
    } catch (Throwable $e) { $result = ['status' => 'error', 'reason' => $e->getMessage()]; }
    $rows = $db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE name = 'ai_call_ledger'") ? $db->query('SELECT * FROM ai_call_ledger ORDER BY rowid') : [];
    $report = compact('result', 'rows', 'generators', 'writers', 'clients', 'ordered', 'before');
    $report['after'] = Fixture::snapshot($root);
    $report['calls'] = $client->calls;
    $report['generation_calls'] = $provider->calls;
    $report['content'] = file_get_contents($root . '/' . $path);
    check(!str_contains(json_encode([$result, $rows, $client->calls, $provider->calls]), $key), 'Runtime credential absent from state, results, ledger and generator');
    Database::closeInstance();
    Fixture::remove($root);
    putenv($oldPreview === false ? 'VS_TEST_PREVIEW_DIR' : 'VS_TEST_PREVIEW_DIR=' . $oldPreview);
    return $report;
}

foreach ([[], ['action' => 'section_edit', 'section_only' => true], ['path' => 'services/bread.php']] as $case) {
    $r = scenario($case);
    check($r['result']['status'] === 'applied' && $r['writers'] === 1 && $r['generators'] === 1 && $r['ordered'], 'Successful path routes, generates, gates, then constructs one writer');
    check(array_column($r['rows'], 'kind') === ['classify', 'generation', 'gate'] && array_column($r['rows'], 'status') === ['success', 'success', 'success'], 'Exactly three successful calls linked to the prompt row');
    check(($r['rows'][2]['provider'] ?? null) === 'typesafe' && ($r['rows'][2]['model'] ?? null) === 'jev-fixture', 'Successful production gate records TypeSafe and the resolved Jev model');
    check(array_unique(array_column($r['rows'], 'prompt_log_id')) === [1], 'Every call has the owning prompt row');
    $gateState = $r['calls'][1]['state'] ?? [];
    check(array_keys($gateState) === ['candidate', 'trusted_facts'], 'Gate receives only candidate and explicit trusted facts');
    $changes = array_keys(array_diff_assoc($r['after'], $r['before']));
    check($changes === [$case['path'] ?? 'index.php'], 'Only the registered target file changes');
}
foreach (['none', 'question', 'noop'] as $outcome) {
    $answers = ['model_tier' => ['choice' => 'none']];
    $prompt = 'Replace the selected heading with "Fresh sourdough, every morning".';
    if ($outcome !== 'none') {
        $answers += ['intent' => ['choice' => $outcome], 'repair_target' => ['choice' => 'none'], 'needs_file_write' => ['noul' => 0.01]];
        $prompt = $outcome === 'question' ? 'What is the site name?' : 'Leave it unchanged.';
    }
    $r = scenario(['prompt' => $prompt, 'answers' => $answers, 'action' => $outcome === 'none' ? 'inline_edit' : 'free_prompt']);
    check($r['generators'] === 0 && $r['generation_calls'] === [], $outcome . ' never constructs or calls a generator');
    check($r['result']['generation_tier'] === 'none', $outcome . ' records deterministic execution');
    check($r['result']['status'] === ['none' => 'applied', 'question' => 'answered', 'noop' => 'acknowledged'][$outcome], 'Three distinct service outcomes');
    if ($outcome !== 'none') {
        check($r['writers'] === 0 && $r['after'] === $r['before'], 'Read-only path never constructs a writer or changes a file');
        check($r['calls'][0]['state']['targets'] === [] && array_keys($r['calls'][0]['questions']['repair_target']['criteria']) === ['none'], 'Free chat exposes no file target or target option');
    }
}
$r = scenario(['answers' => ['intent' => ['confidence' => 0.80], 'scope' => ['confidence' => 0.80],
    'repair_target' => ['confidence' => 0.80], 'model_tier' => ['choice' => 'frontier', 'confidence' => 0.80],
    'needs_file_write' => ['noul' => 0.65], 'looks_like_prompt_injection' => ['noul' => 0.699], 'forbidden_claims' => ['noul' => 0.599]]]);
check($r['result']['status'] === 'applied' && $r['result']['route']['model_tier'] === 'frontier'
    && $r['result']['generation_tier'] === 'configured', 'Exact minimum Choice/write confidence passes; frontier is eligibility, configured provider performs generation');
$constraint = ' Keep the layout.  ';
$exactPrompt = '  ' . str_repeat('é', 4000 - mb_strlen('  ' . $constraint)) . $constraint;
check(mb_strlen($exactPrompt) === 4000, 'Exact-limit fixture contains 4000 characters');
$r = scenario(['prompt' => $exactPrompt]);
$generationInput = json_decode($r['generation_calls'][0]['messages'][0]['content'] ?? '{}', true);
check($r['result']['status'] === 'applied' && ($r['calls'][0]['state']['request'] ?? null) === $exactPrompt
    && ($generationInput['request'] ?? null) === $exactPrompt, 'Valid boundary request reaches route and generator intact, including final constraints and whitespace');
$cases = [
    'invalid empty request' => ['prompt' => '', 'reason' => 'invalid_request'],
    'invalid blank request' => ['prompt' => " \t\n", 'reason' => 'invalid_request'],
    'invalid null request' => ['prompt' => null, 'reason' => 'invalid_request'],
    'invalid numeric request' => ['prompt' => 123, 'reason' => 'invalid_request'],
    'invalid array request' => ['prompt' => ['text' => 'Shorten it'], 'reason' => 'invalid_request'],
    'invalid oversized request' => ['prompt' => str_repeat('a', 4001), 'reason' => 'invalid_request'],
    'invalid oversized multibyte request' => ['prompt' => str_repeat('é', 4001), 'reason' => 'invalid_request'],
    'escaped credential replacement' => ['escaped_secret' => true, 'answers' => ['model_tier' => ['choice' => 'none']], 'reason' => 'explicit_replacement_required'],
    'unsupported action' => ['action' => 'create_site', 'reason' => 'unsupported_action'],
    'unregistered page' => ['page_type' => 'partial', 'reason' => 'invalid_target'],
    'bad span hash' => ['data' => ['content_hash' => str_repeat('0', 64)], 'reason' => 'content_changed'],
    'inconsistent selection' => ['data' => ['sectionHtml' => '<h1>Different</h1>'], 'reason' => 'invalid_target'],
    'empty selection' => ['data' => ['selection' => ''], 'reason' => 'invalid_target'],
    'oversize selection' => ['data' => ['selection' => '<h1>' . str_repeat('x', 1024) . '</h1>'], 'reason' => 'invalid_target'],
    'nested markup' => ['data' => ['selection' => '<h1><span>Bread</span></h1>'], 'reason' => 'invalid_target'],
    'path traversal' => ['data' => ['path' => '../index.php'], 'reason' => 'invalid_target'],
    'PHP heading string' => ['content' => '<?php $heading = \'@heading@\';', 'reason' => 'invalid_target'],
    'script heading string' => ['content' => '<script>let heading = "@heading@";</script>', 'reason' => 'invalid_target'],
    'ambiguous heading' => ['content' => '@heading@@heading@', 'reason' => 'ambiguous_address'],
    'missing heading' => ['content' => '<h1>Other</h1>', 'reason' => 'missing_address'],
    'heading in comment' => ['content' => '<!-- @heading@ -->', 'reason' => 'invalid_target'],
    'route outage' => ['failure' => 'route_throw', 'reason' => 'routing_unavailable'],
    'route failed status' => ['failure' => 'route_error', 'reason' => 'routing_unavailable'],
    'scope expansion' => ['answers' => ['scope' => ['choice' => 'whole_site']], 'reason' => 'unsupported_route'],
    'raw model path' => ['answers' => ['repair_target' => ['choice' => 'index.php']], 'reason' => 'unsupported_route'],
    'none without replacement' => ['answers' => ['model_tier' => ['choice' => 'none']], 'reason' => 'explicit_replacement_required'],
    'question write contradiction' => ['answers' => ['intent' => ['choice' => 'question']], 'reason' => 'routing_uncertain'],
    'noop write contradiction' => ['answers' => ['intent' => ['choice' => 'noop']], 'reason' => 'routing_uncertain'],
    'low confidence' => ['answers' => ['intent' => ['confidence' => 0.79]], 'reason' => 'routing_uncertain'],
    'string confidence' => ['answers' => ['scope' => ['confidence' => '0.99']], 'reason' => 'routing_invalid'],
    'wrong answer type' => ['answers' => ['needs_file_write' => ['type' => 'choice']], 'reason' => 'routing_invalid'],
    'injection threshold' => ['answers' => ['looks_like_prompt_injection' => ['noul' => 0.70]], 'reason' => 'prompt_injection'],
    'no write' => ['answers' => ['needs_file_write' => ['noul' => 0.64]], 'reason' => 'routing_uncertain'],
    'gate outage' => ['failure' => 'gate_throw', 'reason' => 'gate_unavailable'],
    'gate error cannot pass' => ['failure' => 'gate_error', 'reason' => 'gate_unavailable'],
    'forbidden claims' => ['answers' => ['forbidden_claims' => ['noul' => 0.60]], 'reason' => 'repair_limit_exhausted'],
    'wrong gate type' => ['answers' => ['forbidden_claims' => ['type' => 'choice']], 'reason' => 'gate_invalid'],
    'NaN confidence' => ['answers' => ['scope' => ['confidence' => NAN]], 'reason' => 'routing_invalid'],
    'infinite write probability' => ['answers' => ['needs_file_write' => ['noul' => INF]], 'reason' => 'routing_invalid'],
    'negative injection probability' => ['answers' => ['looks_like_prompt_injection' => ['noul' => -0.1]], 'reason' => 'routing_invalid'],
    'NaN gate probability' => ['answers' => ['forbidden_claims' => ['noul' => NAN]], 'reason' => 'gate_invalid'],
    'string gate probability' => ['answers' => ['forbidden_claims' => ['noul' => '0.01']], 'reason' => 'gate_invalid'],
    'invalid candidate' => ['candidate' => '<h1>Bad</h1>', 'reason' => 'repair_limit_exhausted'],
    'missing key' => ['missing_key' => true, 'reason' => 'governor_configuration'],
];
foreach (['intent', 'scope', 'repair_target', 'model_tier'] as $id) {
    $cases['low ' . $id . ' confidence'] = ['answers' => [$id => ['confidence' => 0.799]], 'reason' => 'routing_uncertain'];
}
foreach (['route', 'generation', 'gate'] as $phase) {
    $cases['drift ' . $phase] = ['drift' => $phase, 'reason' => 'content_changed'];
    $cases['delete key ' . $phase] = ['delete_key' => $phase, 'reason' => 'governor_configuration'];
    $cases['cancel ' . $phase] = ['cancel' => $phase, 'reason' => 'generation_cancelled'];
    $cases['ledger loss ' . $phase] = ['drop_ledger' => $phase, 'reason' => 'ledger_unavailable'];
}
$cases['ledger missing'] = ['drop_ledger' => 'before', 'reason' => 'ledger_unavailable'];
$log = tempnam(sys_get_temp_dir(), 'heading-ledger-warning-');
$oldLog = ini_set('error_log', $log);
foreach ($cases as $name => $case) {
    $r = scenario($case);
    check($r['result']['reason'] === $case['reason'], $name . ' refuses with fixed reason (got ' . $r['result']['reason'] . ')');
    check($r['writers'] === 0, $name . ' constructs no writer');
    if ($name === 'gate outage') {
        $gateRows = array_values(array_filter($r['rows'], static fn(array $row): bool => $row['kind'] === 'gate'));
        check(count($gateRows) === 1 && $gateRows[0]['status'] === 'error'
            && $gateRows[0]['provider'] === 'typesafe' && $gateRows[0]['model'] === 'jev-latest',
            'Gate outage retains the known TypeSafe provider and requested Jev model');
    }
    if (!isset($case['drift'])) { check($r['after'] === $r['before'], $name . ' leaves every fixture file unchanged'); }
    if ($case['reason'] === 'invalid_request' || in_array($name, ['escaped credential replacement', 'unsupported action', 'unregistered page', 'bad span hash', 'inconsistent selection', 'missing key'], true)) {
        check($r['clients'] === 0 && $r['generators'] === 0 && $r['rows'] === [], $name . ' fails before clients, provider construction and ledger calls');
    }
}
Database::resetInstance();
$db = Database::getInstance(':memory:');
$db->exec('CREATE TABLE prompt_log (id INTEGER PRIMARY KEY)');
$migration = require __DIR__ . '/../engine/migrations/007_ai_call_ledger.php';
($migration['up'])($db);
$ledger = new AICallLedger($db);
$id = $ledger->start('gate', 'typesafe', 'jev-latest', 'evaluate');
$db->delete('ai_call_ledger', 'id = ?', [$id]);
$ledger->finish($id, 'success');
check(!$ledger->isHealthy(), 'Disappeared running row fails strict health, even without a database exception');
$id = $ledger->start('gate', 'typesafe', 'jev-latest', 'evaluate');
$ledger->finish($id, 'success');
check(!$ledger->isHealthy(), 'Ledger failure remains sticky after successful persistence');
$ledger = new AICallLedger($db);
$id = $ledger->start('gate', 'typesafe', 'jev-latest', 'evaluate');
$ledger->finish($id, 'success');
$ledger->finish($id, 'success');
check($ledger->isHealthy(), 'Normal duplicate terminal finish does not invalidate healthy accounting');
Database::closeInstance();
ini_set('error_log', $oldLog); unlink($log);
finish();
}
