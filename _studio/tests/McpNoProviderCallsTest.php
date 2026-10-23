<?php
declare(strict_types=1);

// All production cURL destinations are redirected to a disposable loopback
// server. A regression can only contact this fixture, never a real provider.
namespace VoxelSite\Providers {
    function curl_init(?string $url = null): \CurlHandle|false
    {
        $GLOBALS['mcp_provider_urls'][] = $url;
        return \curl_init($GLOBALS['mcp_provider_sink']);
    }
    function curl_exec(\CurlHandle $handle): string|bool
    {
        $GLOBALS['mcp_provider_dispatches']++;
        return \curl_exec($handle);
    }
    function curl_multi_exec(\CurlMultiHandle $handle, int &$running): int
    {
        $GLOBALS['mcp_provider_dispatches']++;
        return \curl_multi_exec($handle, $running);
    }
}
namespace VoxelSite {
    function loadConfig(): array { return $GLOBALS['mcp_provider_config']; }
    function curl_init(?string $url = null): \CurlHandle|false
    {
        $GLOBALS['mcp_provider_urls'][] = $url;
        return \curl_init($GLOBALS['mcp_provider_sink']);
    }
    function curl_exec(\CurlHandle $handle): string|bool
    {
        $GLOBALS['mcp_provider_dispatches']++;
        return \curl_exec($handle);
    }
}
namespace {
require_once dirname(__DIR__, 2) . '/vendor/autoload.php';

use VoxelSite\{AICallLedger, AIProviderFactory, AIProviderInterface, AIRouter, Database,
    DesignCriticEngine, Encryption, EvaluatorEngine, LedgeredAIProvider, Settings, TypeSafeHttpClient};
use VoxelSite\{RouterHeading, RouterPendingHeading, RouterShadow};
use VoxelSite\Agent\{ProviderCallForbidden, ProviderCallPolicy};

$passed = 0;
$errors = [];
function check(bool $ok, string $message): void
{
    global $passed, $errors;
    $ok ? $passed++ : $errors[] = $message;
}
function denied(callable $call, string $label): void
{
    try {
        ProviderCallPolicy::runExternal($call);
        check(false, $label . ': expected structured denial');
    } catch (ProviderCallForbidden $error) {
        check($error instanceof RuntimeException && $error->getErrorCode() === 'provider_call_forbidden'
            && $error->errorCode === 'provider_call_forbidden', $label . ': structured denial');
    } catch (Throwable $error) {
        check(false, $label . ': wrong failure ' . get_class($error) . ': ' . $error->getMessage());
    }
}

check(class_exists(ProviderCallPolicy::class), 'Request-scoped provider policy exists');
check(class_exists(ProviderCallForbidden::class), 'Structured provider denial exists');
if ($errors !== []) {
    foreach ($errors as $error) { echo "FAIL: {$error}\n"; }
    exit(1);
}

final class McpProviderSpy implements AIProviderInterface
{
    public int $calls = 0;
    public function getId(): string { return 'spy'; }
    public function getName(): string { return 'Spy'; }
    public function getModels(): array { return [['id' => 'fixture', 'name' => 'Fixture']]; }
    public function listModels(): array { $this->calls++; return []; }
    public function testConnection(): array { $this->calls++; return []; }
    public function validateConfig(array $config): bool { $this->calls++; return true; }
    public function getConfigFields(): array { return []; }
    public function estimateTokens(string $text): int { return 1; }
    public function resolveMaxTokens(int $requested, string $model): int { return $requested; }
    public function getContextWindow(string $model): int { return 1000; }
    public function estimateCost(int $inputTokens, int $outputTokens, string $model): array { return []; }
    public function complete(string $systemPrompt, array $messages, array $options = []): string
    { $this->calls++; return '{"issues":[]}'; }
    public function stream(string $systemPrompt, array $messages, callable $onToken, callable $onComplete, array $options = []): void
    { $this->calls++; $onToken('fixture'); $onComplete('fixture', []); }
}

$GLOBALS['mcp_provider_dispatches'] = 0;
$GLOBALS['mcp_provider_urls'] = [];
$GLOBALS['mcp_provider_config'] = ['app_key' => Encryption::generateKey()];
$fixture = sys_get_temp_dir() . '/mcp-provider-sink-' . bin2hex(random_bytes(8));
mkdir($fixture, 0700);
$server = null;
$pipes = [];
try {
    $listener = stream_socket_server('tcp://127.0.0.1:0', $errno, $errstr);
    if ($listener === false) { throw new RuntimeException('Cannot reserve loopback port: ' . $errstr); }
    $address = stream_socket_get_name($listener, false);
    fclose($listener);
    $GLOBALS['mcp_provider_sink'] = 'http://' . $address . '/provider';
    file_put_contents($fixture . '/router.php', '<?php file_put_contents(__DIR__ . "/requests", "request\n", FILE_APPEND);'
        . ' http_response_code(500); header("Content-Type: application/json"); echo \'{"error":"provider_request_forbidden"}\';');
    $server = proc_open([PHP_BINARY, '-S', $address, $fixture . '/router.php'],
        [0 => ['pipe', 'r'], 1 => ['file', $fixture . '/server.log', 'a'], 2 => ['file', $fixture . '/server.log', 'a']], $pipes);
    if (!is_resource($server)) { throw new RuntimeException('Cannot start loopback provider trap'); }
    fclose($pipes[0]);
    $ready = false;
    for ($i = 0; $i < 100; $i++) {
        $socket = @stream_socket_client('tcp://' . $address, $errno, $errstr, 0.05);
        if ($socket !== false) { fclose($socket); $ready = true; break; }
        usleep(10000);
    }
    if (!$ready) { throw new RuntimeException('Loopback provider trap did not start'); }

    // Prove the network trap and spies work with one explicitly allowed,
    // synthetic-key request before testing forbidden scopes.
    $control = new VoxelSite\Providers\OpenAICompatibleProvider('fixture-key', 'fixture', 32, $GLOBALS['mcp_provider_sink']);
    $control->listModels();
    check($GLOBALS['mcp_provider_dispatches'] === 1 && is_file($fixture . '/requests'),
        'Permitted provider dispatch reaches the loopback failure server');
    unlink($fixture . '/requests');
    $GLOBALS['mcp_provider_dispatches'] = 0;
    $GLOBALS['mcp_provider_urls'] = [];

    ProviderCallPolicy::assertAllowed();
    check(ProviderCallPolicy::permitted()->mode === 'allowed' && ProviderCallPolicy::externalOnly()->isForbidden(),
        'Policies expose allowed and external-only semantics');
    $sentinel = new stdClass();
    check(ProviderCallPolicy::runExternal(static fn() => $sentinel) === $sentinel,
        'External scope preserves callback return value');
    denied(static fn() => ProviderCallPolicy::assertAllowed('nested_helper'), 'Direct policy assertion');
    ProviderCallPolicy::runExternal(static function (): void {
        denied(static fn() => ProviderCallPolicy::runExternal(static fn() => ProviderCallPolicy::assertAllowed()),
            'Nested forbidden helper');
        denied(static fn() => ProviderCallPolicy::permitted()->run(static fn() => ProviderCallPolicy::assertAllowed()),
            'Permitted nested helper cannot weaken forbidden outer policy');
        denied(static fn() => ProviderCallPolicy::assertAllowed(), 'Outer scope survives nested helper completion');
    });
    ProviderCallPolicy::assertAllowed();
    $failure = new RuntimeException('callback failure');
    try {
        ProviderCallPolicy::externalOnly()->run(static function () use ($failure): void { throw $failure; });
    } catch (RuntimeException $error) {
        check($error === $failure, 'External scope preserves callback exception identity');
    }
    ProviderCallPolicy::assertAllowed();
    check(true, 'Successful and throwing scopes restore ordinary provider policy');

    Database::resetInstance();
    $db = Database::getInstance(':memory:');
    $db->exec('CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)');
    $db->exec('CREATE TABLE pages (id INTEGER PRIMARY KEY, slug TEXT, title TEXT, file_path TEXT, page_type TEXT)');
    $db->exec('CREATE TABLE prompt_log (id INTEGER PRIMARY KEY)');
    $migration = require __DIR__ . '/../engine/migrations/007_ai_call_ledger.php';
    ($migration['up'])($db);
    $settings = new Settings($db);
    $encryption = new Encryption($GLOBALS['mcp_provider_config']['app_key']);
    $ledger = new AICallLedger($db);
    $providers = [
        'claude' => VoxelSite\Providers\ClaudeProvider::class,
        'openai' => VoxelSite\Providers\OpenAIProvider::class,
        'gemini' => VoxelSite\Providers\GeminiProvider::class,
        'deepseek' => VoxelSite\Providers\DeepSeekProvider::class,
        'openai_compatible' => VoxelSite\Providers\OpenAICompatibleProvider::class,
    ];
    foreach (['missing', 'configured'] as $configuration) {
        $key = $configuration === 'missing' ? '' : 'sk-ant-fixture-' . bin2hex(random_bytes(8));
        $settings->setMany(['evaluator_enabled' => true, 'design_review_enabled' => true,
            'governor.mode' => 'enforce', 'governor.typesafe_api_key' => $key === '' ? null : $encryption->encrypt($key)]);
        foreach ($providers as $id => $class) {
            $settings->setMany(['ai_provider' => $id, "ai_{$id}_api_key" => $key === '' ? null : $encryption->encrypt($key)]);
            $before = $db->query('SELECT * FROM settings ORDER BY key');
            denied(static fn() => AIProviderFactory::create($settings, $encryption), "$configuration $id factory");
            denied(static fn() => AIProviderFactory::createWithKey($id, $key), "$configuration $id explicit factory");
            denied(static fn() => AIProviderFactory::fetchModels($id, $key), "$configuration $id model discovery");
            // Direct construction and construction before the scope both bypass
            // the factory; neither may bypass the dispatch policy.
            $provider = new $class($key, 'fixture', 32);
            $operations = [
                'listModels' => static fn($p) => $p->listModels(),
                'testConnection' => static fn($p) => $p->testConnection(),
                'validateConfig' => static fn($p) => $p->validateConfig(['api_key' => $key, 'model' => 'fixture']),
                'complete' => static fn($p) => $p->complete('system', [['role' => 'user', 'content' => 'fixture']]),
                'stream' => static fn($p) => $p->stream('system', [], static function (): void {}, static function (): void {}),
            ];
            foreach ($operations as $name => $operation) {
                denied(static fn() => $operation($provider), "$configuration $id retained instance $name");
                denied(static fn() => $operation(new $class($key, 'fixture', 32)), "$configuration $id direct instance $name");
            }
            $dispatch = new ReflectionMethod($class, 'apiCall');
            denied(static fn() => $dispatch->invokeArgs($provider, $id === 'gemini' ? [$GLOBALS['mcp_provider_sink'], []] : [[]]),
                "$configuration $id protected dispatch");
            check($before === $db->query('SELECT * FROM settings ORDER BY key'), "$configuration $id leaves stored settings unchanged");
        }
        $built = 0;
        $router = new AIRouter($db, $settings, static function () use (&$built): never {
            $built++; throw new RuntimeException('Unexpected TypeSafe factory');
        });
        denied(static fn() => $router->route(['user_prompt' => 'fixture'], $ledger), "$configuration AI Router");
        check($built === 0, "$configuration AI Router cannot construct a transport");
        denied(static fn() => (new RouterShadow($db, $settings))->observe(['user_prompt' => 'fixture'], $ledger),
            "$configuration Router shadow review");
        denied(static fn() => (new RouterHeading($db, $settings))->execute(
            ['user_prompt' => 'fixture'], 1, static fn() => null, static fn() => null
        ), "$configuration Router heading review");
        denied(static fn() => (new RouterPendingHeading($db, $settings))->approve('fixture', 1, 'fixture'),
            "$configuration Router pending review");
    }
    $spy = new McpProviderSpy();
    $wrapped = new LedgeredAIProvider($spy, $ledger);
    foreach (['listModels', 'testConnection'] as $method) {
        denied(static fn() => $wrapped->$method(), "Ledger wrapper $method");
    }
    denied(static fn() => $wrapped->validateConfig([]), 'Ledger wrapper validation');
    denied(static fn() => $wrapped->complete('system', []), 'Ledger wrapper completion');
    denied(static fn() => $wrapped->stream('system', [], static function (): void {}, static function (): void {}), 'Ledger wrapper stream');
    denied(static fn() => (new EvaluatorEngine($spy))->evaluate(['index.php' => '<main>Hello</main>']), 'Evaluator entry point');
    denied(static fn() => (new DesignCriticEngine($spy))->review(['index.php' => '<main>Hello</main>']), 'Design critic entry point');
    check($spy->calls === 0 && $db->count('ai_call_ledger') === 0, 'Forbidden work neither calls providers nor records false AI usage');
    $transportCalls = 0;
    $client = new TypeSafeHttpClient('fixture-key', static function () use (&$transportCalls): array {
        $transportCalls++; return [];
    });
    $questions = ['write' => ['type' => 'noul', 'instructions' => 'Does this write files?']];
    denied(static fn() => $client->evaluate([], $questions), 'TypeSafe injected transport');
    denied(static fn() => (new TypeSafeHttpClient('fixture-key'))->evaluate([], $questions), 'TypeSafe HTTP transport');
    $post = new ReflectionMethod(TypeSafeHttpClient::class, 'post');
    denied(static fn() => $post->invoke($client, $GLOBALS['mcp_provider_sink'], [], '{}'), 'TypeSafe direct HTTP dispatch');
    check($transportCalls === 0, 'Forbidden TypeSafe request cannot invoke injected transport');
    check($GLOBALS['mcp_provider_dispatches'] === 0 && $GLOBALS['mcp_provider_urls'] === []
        && !is_file($fixture . '/requests'), 'All forbidden paths stop before cURL setup and loopback server receives no request');
    check(ProviderCallPolicy::runExternal(static fn() => count(AIProviderFactory::listProviders())) === 5,
        'Static provider metadata remains available without network I/O');
    check($wrapped->complete('system', []) === '{"issues":[]}' && $spy->calls === 1,
        'Ordinary built-in provider behavior resumes after forbidden scopes');
} finally {
    if (is_resource($server)) { proc_terminate($server); proc_close($server); }
    foreach (glob($fixture . '/*') ?: [] as $file) { unlink($file); }
    rmdir($fixture);
    Database::resetInstance();
}
foreach ($errors as $error) { echo "FAIL: {$error}\n"; }
echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
exit($errors === [] ? 0 : 1);
}
