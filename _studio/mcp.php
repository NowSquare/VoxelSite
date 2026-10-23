<?php
declare(strict_types=1);

// VOXELSITE_UPDATE_GATE_V1: preserve operation status and continuation during replacement.
if (!is_file(__DIR__.'/update-gate.php')) {
    http_response_code(503);
    header('Content-Type:application/json');
    echo '{"error":"update_runtime_missing"}';
    exit;
}
require_once __DIR__.'/update-gate.php';

/**
 * Private Studio MCP entry point. The visitor-facing /mcp.php remains separate.
 * This endpoint stays closed until both the installation flag and trusted
 * application catalog are present. No arbitrary factory paths can be configured.
 */
require_once __DIR__ . '/engine/Agent/ProviderCallPolicy.php';

\VoxelSite\Agent\ProviderCallPolicy::runExternal(static function (): void {
    require_once __DIR__ . '/engine/bootstrap.php';

    $unavailable = static function (int $status, string $message): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        echo json_encode(['jsonrpc' => '2.0', 'error' => ['code' => -32603, 'message' => $message]]);
    };
    try {
        $config = loadConfig();
        if (($config['studio_mcp']['enabled']??null)===false
            || !class_exists(\VoxelSite\Agent\McpApplication::class)
            || \VoxelSite\DemoMode::isActive()
            || !isInstalled()) {
            $unavailable(503, 'Studio MCP is not enabled on this installation.');
            return;
        }

        // The integration factory binds only audited services and saved origins.
        // It must not derive allowed origins from Host / X-Forwarded-* headers.
        $db = \VoxelSite\Database::getInstance();
        if (!\VoxelSite\Agent\ConnectionService::enabled(new \VoxelSite\Settings($db),$config??[])) {
            $unavailable(503, 'Studio MCP is not enabled on this installation.');
            return;
        }
        $server = \VoxelSite\Agent\McpApplication::create($db, $config);
        if (!$server instanceof \VoxelSite\Agent\McpServer) {
            throw new \LogicException('Invalid MCP application binding.');
        }
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        if (!is_array($headers)) $headers = [];
        $seen = array_fill_keys(array_map('strtolower', array_keys($headers)), true);
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $name = str_replace('_', '-', substr($key, 5));
                if (!isset($seen[strtolower($name)])) {
                    $headers[$name] = $value;
                    $seen[strtolower($name)] = true;
                }
            }
        }
        foreach (['CONTENT_TYPE' => 'Content-Type', 'CONTENT_LENGTH' => 'Content-Length',
            'REDIRECT_HTTP_AUTHORIZATION' => 'Authorization'] as $key => $name) {
            if (!isset($seen[strtolower($name)]) && isset($_SERVER[$key])) {
                $headers[$name] = $_SERVER[$key];
                $seen[strtolower($name)] = true;
            }
        }
        // Read one byte beyond the cap to distinguish full-size from oversized.
        $stream = fopen('php://input', 'rb');
        $body = $stream === false ? false : stream_get_contents($stream, \VoxelSite\Agent\McpServer::MAX_BODY_BYTES + 1);
        if (is_resource($stream)) fclose($stream);
        if ($body === false) throw new \RuntimeException('Request body could not be read.');
        $response = $server->handle($_SERVER['REQUEST_METHOD'] ?? '', $headers, $body,
            static function (string $token) use ($db): \VoxelSite\Agent\OperationActor {
                $previous = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
                $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
                try { return (new \VoxelSite\Agent\CredentialService($db))->authenticate(null,true); }
                finally {
                    if ($previous === null) unset($_SERVER['HTTP_AUTHORIZATION']);
                    else $_SERVER['HTTP_AUTHORIZATION'] = $previous;
                }
            });
        // Encode before emitting headers so a serialization failure stays a
        // generic server error, never a partially delivered success.
        $body = $response['body'] === null ? '' : json_encode($response['body'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
        http_response_code($response['status']);
        foreach ($response['headers'] as $name => $value) header($name . ': ' . $value);
        echo $body;
    } catch (\Throwable) {
        $unavailable(503, 'Studio MCP could not start. Check the installation and connection settings.');
    }
});
