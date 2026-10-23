<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Agent\ActorPolicy;
use VoxelSite\Agent\CapabilityDefinition;
use VoxelSite\Agent\CapabilityRegistry;
use VoxelSite\Agent\CredentialService;
use VoxelSite\Agent\McpServer;
use VoxelSite\Agent\OperationActor;
use VoxelSite\Agent\OperationException;
use VoxelSite\Agent\ProtocolProfile;
use VoxelSite\Agent\ProviderCallForbidden;
use VoxelSite\Agent\ProviderCallPolicy;
use VoxelSite\AgentAuth;
use VoxelSite\Database;

$checks = 0;
$failures = [];
function protocolCheck(bool $ok, string $label): void
{
    global $checks, $failures;
    $checks++;
    if (!$ok) $failures[] = $label;
    echo ($ok ? 'PASS ' : 'FAIL ') . $label . "\n";
}
function wire(array $response): array
{
    return json_decode(json_encode($response, JSON_THROW_ON_ERROR), true, 64, JSON_THROW_ON_ERROR);
}
function request(string $method, string $version, array $params = [], string|int|null $id = 1): array
{
    if ($version === ProtocolProfile::CURRENT) {
        $params['_meta'] = (object) [
            ProtocolProfile::VERSION_META => $version,
            ProtocolProfile::CAPABILITIES_META => new stdClass(),
            ProtocolProfile::CLIENT_META => (object) ['name' => 'Fixture client', 'version' => '1'],
        ];
    }
    $request = ['jsonrpc' => '2.0', 'method' => $method, 'params' => (object) $params];
    if ($id !== null) $request['id'] = $id;
    return $request;
}

if (!class_exists(McpServer::class)) {
    protocolCheck(false, 'Protocol adapter exists');
    exit(1);
}
$root = sys_get_temp_dir() . '/vs-mcp-protocol-' . bin2hex(random_bytes(6));
mkdir($root, 0700, true);
// The legacy logger has no constructor seam; pin its sink before credentials
// emit audit records. Do not touch the installation's logs or their retention.
foreach (['logDir' => $root, 'initialized' => true] as $property => $value) {
    (new ReflectionProperty(\VoxelSite\Logger::class, $property))->setValue(null, $value);
}
$db = Database::getInstance($root . '/studio.db');
$db->exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, role TEXT, disabled_at TEXT)');
$db->exec("INSERT INTO users VALUES (1,'Owner','owner',NULL)");
new AgentAuth($db);
$migration = require dirname(__DIR__) . '/engine/migrations/014_agent_operation_identity.php';
($migration['up'])($db);
$policy = new ActorPolicy($db);
$credentials = new CredentialService($db);
$owner = new OperationActor('user', 1, null, [], 'studio_configured', null);
$credential = $credentials->create($owner, 1, 'read', 'Protocol fixture', null);
$actor = $policy->fromCredential($credential['id']);
$empty = ['type' => 'object', 'properties' => [], 'additionalProperties' => false];
$input = ['type' => 'object', 'properties' => ['value' => ['type' => 'string', 'maxLength' => 80]],
    'required' => ['value'], 'additionalProperties' => false];
$output = ['type' => 'object', 'properties' => ['value' => ['type' => 'string']], 'required' => ['value'], 'additionalProperties' => false];
$registry = new CapabilityRegistry([
    new CapabilityDefinition('voxelsite_echo', $input, $output, ['site:read'], 'read', 'fixture.echo', true, [], 'Return fixture data.'),
    new CapabilityDefinition('voxelsite_write', $empty, $empty, ['files:write'], 'draft_write', 'fixture.write', true, [], 'Write fixture data.'),
    new CapabilityDefinition('voxelsite_failure', $empty, $empty, ['site:read'], 'read', 'fixture.failure', true, [], 'Return a domain failure.'),
    new CapabilityDefinition('voxelsite_provider', $empty, $empty, ['site:read'], 'read', 'fixture.provider', true, [], 'Check provider boundary.'),
    new CapabilityDefinition('voxelsite_broken', $empty, $output, ['site:read'], 'read', 'fixture.broken', true, [], 'Check output contract.'),
]);
$calls = 0;
$authCalls = 0;
$providerBoundary = false;
$resolver = static function (string $handler) use (&$calls): callable {
    return static function (OperationActor $actor, stdClass $args) use ($handler, &$calls): array {
        $calls++;
        return match ($handler) {
            'fixture.echo' => ['value' => $args->value],
            'fixture.failure' => throw new OperationException('stale_hash', 'Read the current draft and retry.', ['path' => 'index.php']),
            'fixture.provider' => (static function (): array { ProviderCallPolicy::assertAllowed('fixture'); return []; })(),
            'fixture.broken' => ['value' => 123],
            default => [],
        };
    };
};
$server = new McpServer($registry, $policy, $resolver, ['https://fixture.test'], 'test');
$authenticate = static function (string $token) use (&$authCalls, &$providerBoundary, $credential, $actor): OperationActor {
    $authCalls++;
    try { ProviderCallPolicy::assertAllowed('authentication'); }
    catch (ProviderCallForbidden) { $providerBoundary = true; }
    if ($token !== $credential['key']) throw new OperationException('permission_denied', 'Invalid credential.');
    return $actor;
};
$base = ['Content-Type' => 'application/json', 'Accept' => 'application/json, text/event-stream',
    'Authorization' => 'Bearer ' . $credential['key']];
$send = static function (array|string $payload, string $version, array $replace = [], string $httpMethod = 'POST', ?callable $auth = null)
    use ($server, $base, $authenticate): array {
    $headers = $base + ['MCP-Protocol-Version' => $version];
    if ($version === ProtocolProfile::CURRENT && is_array($payload)) {
        $headers['Mcp-Method'] = $payload['method'] ?? '';
        $params = (array) ($payload['params'] ?? []);
        if (in_array($payload['method'] ?? '', ['tools/call', 'prompts/get', 'resources/read'], true)) {
            $headers['Mcp-Name'] = $params['name'] ?? $params['uri'] ?? '';
        }
    }
    foreach ($replace as $key => $value) {
        if ($value === null) unset($headers[$key]); else $headers[$key] = $value;
    }
    return wire($server->handle($httpMethod, $headers, is_string($payload) ? $payload : json_encode($payload, JSON_THROW_ON_ERROR), $auth ?? $authenticate));
};

foreach (ProtocolProfile::versions() as $version) {
    $modern = $version === ProtocolProfile::CURRENT;
    $prefix = $version . ': ';
    $fixture = json_decode(file_get_contents(__DIR__ . '/fixtures/mcp/protocol/' . $version . '.json'), true, 64, JSON_THROW_ON_ERROR);
    protocolCheck($fixture['profile'] === $version && $fixture['evidence'] === 'synthetic_protocol_fixture', $prefix . 'fixture makes no client qualification claim');
    $opening = $modern ? request('server/discover', $version) : [
        'jsonrpc' => '2.0', 'id' => 1, 'method' => 'initialize',
        'params' => (object) ['protocolVersion' => $version, 'capabilities' => new stdClass(), 'clientInfo' => (object) ['name' => 'Fixture', 'version' => '1']],
    ];
    $response = $send($opening, $version, $modern ? [] : ['MCP-Protocol-Version' => null]);
    protocolCheck($response['status'] === 200, $prefix . 'opening succeeds');
    $result = $response['body']['result'];
    protocolCheck(array_keys($result['capabilities']) === ['tools'] && $result['capabilities']['tools'] === [], $prefix . 'only implemented tools advertised');
    protocolCheck(!isset($response['headers']['Mcp-Session-Id']), $prefix . 'no protocol session is minted');
    protocolCheck($modern ? $result['supportedVersions'] === ProtocolProfile::versions() : $result['protocolVersion'] === $version, $prefix . 'version result matches profile');
    if (!$modern) {
        $response = $send(request('notifications/initialized', $version, [], null), $version);
        protocolCheck($response['status'] === 202 && $response['body'] === null, $prefix . 'initialized notification has no body');
        $response = $send(request('ping', $version), $version);
        protocolCheck(json_encode($server->handle('POST', $base + ['MCP-Protocol-Version' => $version], '{"jsonrpc":"2.0","id":1,"method":"ping"}', $authenticate)['body']['result']) === '{}', $prefix . 'ping result encodes as an object');
    }
    $response = $send(request('tools/list', $version, [], 'list-1'), $version);
    $result = $response['body']['result'];
    $names = array_column($result['tools'], 'name');
    $sorted = $names;
    sort($sorted);
    protocolCheck($response['body']['id'] === 'list-1' && $names === $sorted && !in_array('voxelsite_write', $names), $prefix . 'discovery is stable and scope-filtered');
    protocolCheck($modern ? $result['resultType'] === 'complete' && $result['ttlMs'] === 0 && $result['cacheScope'] === 'private'
        : !isset($result['resultType'], $result['ttlMs'], $result['cacheScope']), $prefix . 'result and cache fields match profile');
    protocolCheck($modern ? isset($result['_meta'][ProtocolProfile::SERVER_META]) : !isset($result['_meta']), $prefix . 'identity metadata matches profile');
    $payload = request('tools/call', $version, ['name' => 'voxelsite_echo', 'arguments' => (object) ['value' => 'hello']], 0);
    $response = $send($payload, $version);
    protocolCheck($response['status'] === 200 && $response['body']['id'] === 0 && $response['body']['result']['structuredContent'] === ['value' => 'hello']
        && json_decode($response['body']['result']['content'][0]['text'], true) === ['value' => 'hello'], $prefix . 'structured result and text agree');
    $payload['params']->arguments = (object) ['unexpected' => true];
    $response = $send($payload, $version);
    protocolCheck($response['body']['result']['isError'] === true, $prefix . 'tool validation is an actionable execution error');
    $response = $send(request('tools/call', $version, ['name' => 'voxelsite_failure']), $version);
    protocolCheck($response['status'] === 200 && $response['body']['result']['isError'] === true
        && !isset($response['body']['result']['structuredContent']), $prefix . 'domain errors do not violate declared output schemas');
    $response = $send(request('tools/call', $version, ['name' => 'voxelsite_provider']), $version);
    protocolCheck($response['status'] === 200 && $response['body']['result']['isError'] === true, $prefix . 'provider calls fail before transport');
    $response = $send(request('tools/call', $version, ['name' => 'voxelsite_broken']), $version);
    protocolCheck($response['status'] === 500 && $response['body']['error']['code'] === -32603, $prefix . 'invalid handler output fails safely');
    $before = $calls;
    foreach (['voxelsite_write' => 403, 'missing_tool' => 400] as $tool => $status) {
        $response = $send(request('tools/call', $version, ['name' => $tool]), $version);
        protocolCheck($response['status'] === $status && $calls === $before, $prefix . $tool . ' cannot dispatch');
    }
    foreach (['notifications/initialized', 'tools/call'] as $method) {
        $response = $send(request($method, $version, ['name' => 'voxelsite_echo', 'arguments' => (object) ['value' => 'hidden']], null), $version);
        protocolCheck($calls === $before && ($modern || $method === 'tools/call' ? $response['status'] === 400 : $response['status'] === 202), $prefix . $method . ' notification does not dispatch');
    }
    $response = $send(request('resources/list', $version), $version);
    protocolCheck($response['status'] === ($modern ? 404 : 200) && $response['body']['error']['code'] === -32601, $prefix . 'unsupported method returns protocol error');
    $response = $send(request('tools/list', $version, ['cursor' => 'unissued']), $version);
    protocolCheck($response['body']['error']['code'] === -32602, $prefix . 'unissued cursor is rejected');
    foreach ($fixture['invalidBodies'] as $bad) {
        $response = $send($bad['body'], $version);
        protocolCheck($response['status'] === 400 && $response['body']['error']['code'] === $bad['code'], $prefix . $bad['label']);
    }
    foreach (['GET', 'DELETE', 'OPTIONS', 'PUT'] as $method) {
        $response = $send(request('tools/list', $version), $version, [], $method);
        protocolCheck($response['status'] === 405 && $response['headers']['Allow'] === 'POST', $prefix . $method . ' rejected');
    }
    foreach ([null, 'Basic abc', 'Bearer wrong', 'Bearer a,b'] as $authorization) {
        $response = $send(request('tools/list', $version), $version, ['Authorization' => $authorization]);
        protocolCheck($response['status'] === 401 && isset($response['headers']['WWW-Authenticate']), $prefix . 'missing or invalid bearer rejected');
    }
    foreach (['https://evil.test', 'null', 'https://fixture.test.evil.test', 'https://fixture.test/', 'https://fixture.test@evil.test', 'https://fixture.test https://evil.test'] as $origin) {
        $response = $send(request('tools/list', $version), $version, ['Origin' => $origin]);
        protocolCheck($response['status'] === 403, $prefix . 'origin denied: ' . $origin);
    }
    $response = $send(request('tools/list', $version), $version, ['Origin' => 'https://FIXTURE.test:443']);
    protocolCheck($response['status'] === 200, $prefix . 'configured origin canonicalization is accepted');
    foreach (['application/json', 'text/event-stream', 'application/json, text/event-stream;q=0', '*/*'] as $accept) {
        protocolCheck($send(request('tools/list', $version), $version, ['Accept' => $accept])['status'] === 406, $prefix . 'both transport response types required');
    }
    protocolCheck($send(request('tools/list', $version), $version, ['Content-Type' => 'text/plain'])['status'] === 415, $prefix . 'non-JSON request rejected');
    protocolCheck($send(str_repeat(' ', McpServer::MAX_BODY_BYTES + 1), $version)['status'] === 413, $prefix . 'body byte limit enforced');
    protocolCheck($send(request('tools/list', $version), $version, ['Content-Length' => (string) (McpServer::MAX_BODY_BYTES + 1)])['status'] === 413, $prefix . 'declared oversized body rejected');
}

$version = ProtocolProfile::CURRENT;
$payload = request('tools/list', $version);
foreach (['MCP-Protocol-Version', 'Mcp-Method'] as $header) {
    protocolCheck($send($payload, $version, [$header => null])['body']['error']['code'] === -32020, 'Modern required header: ' . $header);
}
protocolCheck($send($payload, $version, ['Mcp-Method' => 'tools/call'])['body']['error']['code'] === -32020, 'Modern method/header disagreement rejected');
$payload['params']->_meta->{ProtocolProfile::VERSION_META} = ProtocolProfile::COMPATIBILITY;
protocolCheck($send($payload, $version)['body']['error']['code'] === -32020, 'Modern version/header disagreement rejected');
$payload = request('tools/list', $version);
unset($payload['params']->_meta->{ProtocolProfile::CAPABILITIES_META});
protocolCheck($send($payload, $version)['body']['error']['code'] === -32602, 'Modern capability metadata required');
$payload = request('tools/list', $version);
unset($payload['params']->_meta->{ProtocolProfile::CLIENT_META});
protocolCheck($send($payload, $version)['status'] === 200, 'Modern client name is optional and never authorization');
$payload = request('tools/call', $version, ['name' => 'voxelsite_echo', 'arguments' => (object) ['value' => 'encoded']]);
protocolCheck($send($payload, $version, ['Mcp-Name' => '=?base64?' . base64_encode('voxelsite_echo') . '?='])['status'] === 200, 'Modern encoded Mcp-Name is decoded before comparison');
foreach ([null, 'voxelsite_failure', '=?base64?%%%?=', ' voxelsite_echo'] as $name) {
    protocolCheck($send($payload, $version, ['Mcp-Name' => $name])['body']['error']['code'] === -32020, 'Modern missing/malformed/mismatched name rejected');
}
$response = $send(request('tools/list', '1900-01-01'), '1900-01-01');
protocolCheck($response['status'] === 400 && $response['body']['error']['code'] === -32022
    && $response['body']['error']['data']['supported'] === ProtocolProfile::versions(), 'Unknown version includes supported versions');
protocolCheck($send(request('initialize', $version), $version)['body']['error']['code'] === -32601, 'Modern initialize is not a handshake');
protocolCheck($send(request('ping', $version), $version)['body']['error']['code'] === -32601, 'Removed modern ping is not advertised or implemented');
protocolCheck($send(request('tools/list', $version), $version, ['authorization' => $base['Authorization']])['status'] === 400, 'Duplicate header names fail closed');
$payload = request('tóols/list', $version);
protocolCheck($send($payload, $version)['body']['error']['code'] === -32020, 'Modern method header rejects non-ASCII field values');
$payload = request('tools/call', $version, ['name' => 'voxelsite_echo', 'arguments' => []]);
$before = $calls;
protocolCheck($send($payload, $version)['body']['error']['code'] === -32602 && $calls === $before, 'Array arguments cannot dispatch an object-contract tool');
$payload = request('tools/call', $version, ['name' => 'voxelsite_echo', 'arguments' => (object) ['value' => 'x'], 'task' => (object) ['ttl' => 1]]);
protocolCheck($send($payload, $version)['body']['error']['code'] === -32602 && $calls === $before, 'Unadvertised task requests cannot dispatch');
$response = $send(request('tools/list', $version), $version, [], 'POST',
    static fn () => throw new OperationException('rate_limited', 'Limit', ['retry_after' => 21]));
protocolCheck($response['status'] === 429 && $response['headers']['Retry-After'] === '21', 'Rate limit returns bounded retry guidance');
protocolCheck($send(request('tools/list', $version), $version, [], 'POST', static fn () => $owner)['status'] === 401, 'Session actor cannot enter bearer endpoint');
protocolCheck($providerBoundary, 'Provider prohibition includes authentication and all dispatch');
$credentials->revoke($owner, $credential['id']);
protocolCheck($send(request('tools/list', $version), $version)['status'] === 401, 'Revoked identity cannot reuse an authenticated actor');
ProviderCallPolicy::assertAllowed('after_request');
protocolCheck(true, 'Request provider scope unwinds after success and failure');

// Execute the real entry source in a disposable installation shell. Its
// disabled path must finish before any installation database/factory is used.
$entryRoot = $root . '/entry';
mkdir($entryRoot . '/engine/Agent', 0700, true);
copy(dirname(__DIR__) . '/mcp.php', $entryRoot . '/mcp.php');
// Preserve the real pre-bootstrap maintenance bridge while intentionally
// omitting the trusted application catalog from this installation shell.
foreach (['update-gate.php', 'factory-reset-gate.php'] as $gate) {
    copy(dirname(__DIR__) . '/' . $gate, $entryRoot . '/' . $gate);
}
foreach (['ProviderCallPolicy', 'ProviderCallForbidden'] as $name) {
    copy(dirname(__DIR__) . '/engine/Agent/' . $name . '.php', $entryRoot . '/engine/Agent/' . $name . '.php');
}
$bootstrap = "<?php\nfunction loadConfig(): ?array { return []; }\n"
    . "function isInstalled(): bool { throw new RuntimeException('Must not inspect installation'); }\n";
file_put_contents($entryRoot . '/engine/bootstrap.php', $bootstrap);
$process = proc_open([PHP_BINARY, $entryRoot . '/mcp.php'], [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, $root);
if (is_resource($process)) {
    fclose($pipes[0]);
    $entryOutput = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $entryError = stream_get_contents($pipes[2]); fclose($pipes[2]);
    $exit = proc_close($process);
    $entryResult = json_decode($entryOutput, true);
    protocolCheck($exit === 0 && $entryError === '' && ($entryResult['error']['message'] ?? '') === 'Studio MCP is not enabled on this installation.',
        'HTTP entry fails closed before installation access when the trusted catalog is absent');
} else {
    protocolCheck(false, 'HTTP entry subprocess started');
}

echo "MCP protocol: {$checks} checks, " . count($failures) . " failures\n";
exit($failures ? 1 : 0);
