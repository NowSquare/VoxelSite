<?php
declare(strict_types=1);

// Dispatch an unchanged copy of the Agent endpoint inside a disposable tree.
// Supply router context/input, without loading installed config or credentials.
require_once dirname(__DIR__, 3) . '/vendor/autoload.php';
$root = $argv[1] ?? '';
if (!is_file($root . '/.governor-continuation-test')) {
    throw new RuntimeException('Disposable continuation test root required');
}
$endpoint = $root . '/_studio/api/agent/v1/prompt.php';
if (hash_file('sha256', $endpoint) !== hash_file('sha256', dirname(__DIR__, 2) . '/api/agent/v1/prompt.php')) {
    throw new RuntimeException('Endpoint copy must match production bytes');
}
$input = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
\VoxelSite\Database::getInstance($root . '/studio.db');
foreach (['initialized' => true, 'logDir' => $root . '/_studio/logs'] as $name => $value) {
    (new ReflectionProperty(\VoxelSite\Logger::class, $name))->setValue(null, $value);
}
function now(): string { return gmdate('Y-m-d\TH:i:s\Z'); }
$response = null;
$status = 200;
function agentResponse(array $data, int $code = 200): void
{
    global $response, $status; $response = $data; $status = $code;
}
function agentError(int $code, string $name, string $message, array $details = []): void
{
    agentResponse(['error' => ['code' => $name, 'message' => $message, 'details' => $details]], $code);
}
class PromptInputStream
{
    public $context;
    private int $offset = 0;
    private string $body = '';
    public function stream_open($path, $mode, $options, &$openedPath): bool
    {
        global $input;
        if ($path !== 'php://input' || $mode !== 'rb') { return false; }
        $this->body = json_encode($input['body'], JSON_THROW_ON_ERROR);
        return true;
    }
    public function stream_read($count): string
    {
        $part = substr($this->body, $this->offset, $count);
        $this->offset += strlen($part);
        return $part;
    }
    public function stream_eof(): bool { return $this->offset >= strlen($this->body); }
    public function stream_stat(): array { return []; }
}
stream_wrapper_unregister('php');
stream_wrapper_register('php', PromptInputStream::class);
$_agentContext = ['method' => 'POST', 'params' => [], 'settings' => new \VoxelSite\Settings(),
    'keyData' => ['id' => $input['key_id'], 'label' => 'continuation fixture']];
require $endpoint;
stream_wrapper_restore('php');
echo json_encode(['status' => $status, 'response' => $response], JSON_THROW_ON_ERROR);
