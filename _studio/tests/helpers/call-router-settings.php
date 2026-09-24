<?php

declare(strict_types=1);

// Real endpoint dispatch; only router authentication/body/config are supplied by
// this CLI harness. Never bootstrap the installed application or read its config.
require_once dirname(__DIR__, 3) . '/vendor/autoload.php';

$input = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
$root = $argv[1] ?? '';
if (!is_file($root . '/.governor-settings-test')) {
    throw new RuntimeException('Disposable settings test root required');
}
\VoxelSite\Database::getInstance($root . '/settings.db');
foreach (['initialized' => true, 'logDir' => $root . '/logs'] as $name => $value) {
    (new ReflectionProperty(\VoxelSite\Logger::class, $name))->setValue(null, $value);
}
$response = null;
$status = 200;
function getJsonBody(): array { global $input; return $input['body'] ?? []; }
function loadConfig(): ?array { global $input; return $input['config'] ?? null; }
function jsonResponse(mixed $data, int $code = 200): void
{
    global $response, $status; $response = $data; $status = $code;
}
function agentResponse(array $data, int $code = 200): void { jsonResponse($data, $code); }
function agentError(int $code, string $name, string $message, array $details = []): void
{
    jsonResponse(['error' => ['code' => $name, 'message' => $message, 'details' => $details]], $code);
}

if (($input['surface'] ?? 'studio') === 'agent') {
    // Agent uses php://input directly. Substitute only that stream in this child
    // so the real endpoint's PUT allowlist can be exercised without a web server.
    class SettingsInputStream
    {
        public $context;
        private int $offset = 0;
        private string $body = '';
        public function stream_open($path, $mode, $options, &$openedPath): bool
        {
            global $input;
            if ($path !== 'php://input' || $mode !== 'rb') { return false; }
            $this->body = json_encode($input['body'] ?? []);
            return true;
        }
        public function stream_read($count): string
        {
            $part = substr($this->body, $this->offset, $count); $this->offset += strlen($part); return $part;
        }
        public function stream_eof(): bool { return $this->offset >= strlen($this->body); }
        public function stream_stat(): array { return []; }
    }
    stream_wrapper_unregister('php');
    stream_wrapper_register('php', SettingsInputStream::class);
    $_agentContext = ['method' => $input['method'] ?? 'GET', 'settings' => new \VoxelSite\Settings(), 'keyData' => ['label' => 'test']];
    require dirname(__DIR__, 2) . '/api/agent/v1/settings.php';
} else {
    $_REQUEST['_route_method'] = $input['method'] ?? 'GET';
    $_REQUEST['_route_path'] = '/settings';
    $_REQUEST['_user'] = ['role' => $input['role'] ?? '', 'id' => 1];
    require dirname(__DIR__, 2) . '/api/endpoints/settings.php';
}
echo json_encode(['status' => $status, 'response' => $response], JSON_THROW_ON_ERROR);
