<?php

declare(strict_types=1);

namespace VoxelSite\Providers;

use VoxelSite\AIProviderInterface;
use RuntimeException;

/**
 * Anthropic Claude AI provider.
 *
 * Implements streaming via Claude's Messages API using Server-Sent
 * Events. Parses content_block_delta events for real-time token
 * delivery to the browser.
 *
 * API: https://api.anthropic.com/v1/messages
 * Protocol: anthropic-version 2023-06-01
 * Streaming: SSE with event types: message_start, content_block_start,
 *   content_block_delta, content_block_stop, message_delta, message_stop
 */
class ClaudeProvider implements AIProviderInterface
{
    private const API_URL = 'https://api.anthropic.com/v1/messages';
    private const MODELS_URL = 'https://api.anthropic.com/v1/models';
    private const API_VERSION = '2023-06-01';
    private const STRUCTURED_TOOL_NAME = 'apply_voxelsite_changes';

    private string $apiKey;
    private ?string $model;
    private int $maxTokens;

    public function __construct(string $apiKey, ?string $model = null, int $maxTokens = 16000)
    {
        $this->apiKey = $apiKey;
        $this->model = $model;
        $this->maxTokens = $maxTokens;
    }

    public function getId(): string
    {
        return 'claude';
    }

    public function getName(): string
    {
        return 'Anthropic Claude';
    }

    public function getModels(): array
    {
        return [
            ['id' => 'claude-sonnet-4-5-20250514', 'name' => 'Claude Sonnet 4.5', 'tier' => 'balanced'],
            ['id' => 'claude-sonnet-4-20250514',    'name' => 'Claude Sonnet 4',   'tier' => 'fast'],
        ];
    }

    /**
     * Fetch models live from Anthropic's Models API.
     *
     * GET /v1/models returns paginated results. We fetch up to
     * 100 models (way more than Anthropic offers) sorted newest-first.
     */
    public function listModels(): array
    {
        if (empty($this->apiKey)) {
            return $this->getModels();
        }

        try {
            $ch = curl_init(self::MODELS_URL . '?limit=100');
            curl_setopt_array($ch, [
                CURLOPT_HTTPHEADER     => [
                    'x-api-key: ' . $this->apiKey,
                    'anthropic-version: ' . self::API_VERSION,
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 15,
                CURLOPT_CONNECTTIMEOUT => 10,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200 || empty($response)) {
                return $this->getModels();
            }

            $data = json_decode($response, true);
            if (!is_array($data) || !isset($data['data'])) {
                return $this->getModels();
            }

            $models = [];
            foreach ($data['data'] as $model) {
                $id = $model['id'] ?? '';
                if (empty($id)) continue;

                $models[] = [
                    'id'         => $id,
                    'name'       => $model['display_name'] ?? $id,
                    'created_at' => $model['created_at'] ?? '',
                ];
            }

            return $models ?: $this->getModels();
        } catch (\Throwable) {
            return $this->getModels();
        }
    }

    /**
     * Test connection by calling the Models API.
     *
     * Unlike listModels(), this THROWS on any failure so the Settings
     * page can display the actual error to the user.
     *
     * @throws \RuntimeException On auth, rate-limit, or connection errors
     */
    public function testConnection(): array
    {
        if (empty($this->apiKey)) {
            throw new RuntimeException('No API key provided.');
        }

        $ch = curl_init(self::MODELS_URL . '?limit=100');
        curl_setopt_array($ch, [
            CURLOPT_HTTPHEADER     => [
                'x-api-key: ' . $this->apiKey,
                'anthropic-version: ' . self::API_VERSION,
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_CONNECTTIMEOUT => 10,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if (!empty($curlError)) {
            throw new RuntimeException('Connection failed: ' . $curlError);
        }

        if ($httpCode === 401) {
            throw new RuntimeException('authentication_error: API key is invalid (HTTP 401)');
        }

        if ($httpCode === 429) {
            throw new RuntimeException('rate_limited');
        }

        if ($httpCode >= 500) {
            throw new RuntimeException("provider_unavailable (HTTP {$httpCode})");
        }

        if ($httpCode !== 200 || empty($response)) {
            throw new RuntimeException("Unexpected response from API (HTTP {$httpCode})");
        }

        $data = json_decode($response, true);
        if (!is_array($data) || !isset($data['data'])) {
            throw new RuntimeException('Invalid response format from models endpoint');
        }

        $models = [];
        foreach ($data['data'] as $model) {
            $id = $model['id'] ?? '';
            if (empty($id)) continue;

            $models[] = [
                'id'         => $id,
                'name'       => $model['display_name'] ?? $id,
                'created_at' => $model['created_at'] ?? '',
            ];
        }

        return $models ?: $this->getModels();
    }

    public function getConfigFields(): array
    {
        return [
            [
                'key'         => 'api_key',
                'label'       => 'API Key',
                'type'        => 'password',
                'placeholder' => 'sk-ant-api03-...',
                'required'    => true,
                'help_url'    => 'https://console.anthropic.com/account/keys',
                'help_text'   => 'Get a key from Anthropic Console',
            ],
        ];
    }

    public function validateConfig(array $config): bool
    {
        $key = $config['api_key'] ?? '';
        if (empty($key) || !str_starts_with($key, 'sk-ant-')) {
            return false;
        }

        // Make a minimal API call to verify the key works
        try {
            $response = $this->apiCall([
                'model'      => $config['model'] ?? $this->getModels()[0]['id'],
                'max_tokens' => 10,
                'messages'   => [['role' => 'user', 'content' => 'Hi']],
            ]);

            return isset($response['id']);
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Stream a response from Claude, delivering tokens in real-time.
     *
     * Uses cURL to open a streaming connection. Parses SSE events
     * as they arrive, extracting text deltas from content_block_delta
     * events. Each delta is passed to $onToken immediately.
     *
     * The full response is accumulated and passed to $onComplete
     * along with usage statistics when the stream finishes.
     */
    public function stream(
        string $systemPrompt,
        array $messages,
        callable $onToken,
        callable $onComplete,
        array $options = []
    ): void {
        $model = $options['model'] ?? $this->model ?? $this->getModels()[0]['id'];
        $maxTokens = $this->resolveMaxTokens($options['max_tokens'] ?? $this->maxTokens, $model);
        $isStructured = !empty($options['structured_output']);

        $payload = [
            'model'      => $model,
            'max_tokens' => $maxTokens,
            'system'     => $systemPrompt,
            'messages'   => $messages,
            'stream'     => true,
        ];
        if ($isStructured) {
            $payload['tools'] = [$this->getStructuredToolDefinition()];
            $payload['tool_choice'] = [
                'type' => 'tool',
                'name' => self::STRUCTURED_TOOL_NAME,
            ];
        }

        $fullResponse = '';
        $usage = ['input_tokens' => 0, 'output_tokens' => 0];
        $lastActivityTime = microtime(true);
        $toolInputByIndex = [];
        $toolNameByIndex = [];
        $errorBody = '';

        $ch = curl_init(self::API_URL);
        $startTime = microtime(true);
        $callbackException = null;
        $lastHeartbeatTime = 0;

        // Catch SIGTERM from PHP-FPM's request_terminate_timeout.
        // Without this, the process dies silently with no log entry.
        if (function_exists('pcntl_signal') && function_exists('pcntl_async_signals')) {
            pcntl_async_signals(true);
            pcntl_signal(SIGTERM, function () use ($startTime) {
                $elapsed = round(microtime(true) - $startTime, 1);
                \VoxelSite\Logger::critical('ai', 'SIGTERM received — PHP-FPM is killing this process', [
                    'elapsed_seconds' => $elapsed,
                    'memory_mb'       => round(memory_get_usage(true) / 1048576, 1),
                ]);
                // Don't exit — let the shutdown handler run
            });
        }
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => $this->getHeaders($maxTokens, $model),
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_TIMEOUT        => 900,  // 15 min absolute safety ceiling
            CURLOPT_CONNECTTIMEOUT => 15,
            // Stall detection: abort if transfer drops below 1 byte/sec
            // for 180 seconds straight. This catches dead connections while
            // allowing slow-but-active generations (structured output can
            // have long "thinking" pauses before tokens arrive).
            CURLOPT_LOW_SPEED_LIMIT => 1,
            CURLOPT_LOW_SPEED_TIME  => 180,

            // SSE keepalive: send a comment every 10s of silence
            // to prevent proxies/browsers from closing the connection.
            // IMPORTANT: Never abort the cURL request on disconnect.
            // With ignore_user_abort(true), the script continues running
            // even if Nginx/proxy closes the FastCGI connection. All files
            // will be written to disk — the user refreshes and sees them.
            CURLOPT_NOPROGRESS     => false,
            CURLOPT_PROGRESSFUNCTION => function ($ch, $dlTotal, $dlNow) use (&$lastActivityTime, $startTime, &$lastHeartbeatTime) {
                $now = microtime(true);
                if (($now - $lastActivityTime) > 10) {
                    try {
                        @file_put_contents('php://output', ": keepalive\n\n");
                        @flush();
                    } catch (\Throwable $e) {
                        // Output failed (connection closed) — ignore
                    }
                    $lastActivityTime = $now;
                }

                // Heartbeat: log every 15s so we can see when the process dies
                if (!isset($lastHeartbeatTime) || ($now - $lastHeartbeatTime) > 15) {
                    $elapsed = (int)($now - $startTime);
                    \VoxelSite\Logger::debug('ai', 'Stream heartbeat', [
                        'elapsed_seconds'    => $elapsed,
                        'bytes_downloaded'   => $dlNow,
                        'connection_aborted' => connection_aborted(),
                        'memory_mb'          => round(memory_get_usage(true) / 1048576, 1),
                    ]);
                    $lastHeartbeatTime = $now;
                }

                return 0;
            },

            // WRITEFUNCTION is set separately below with exception handling
        ]);

        // PHP cURL doesn't propagate exceptions from WRITEFUNCTION —
        // they silently cause CURLE_WRITE_ERROR. We need to catch
        // them inside the callback and re-throw after curl_exec.
        curl_setopt($ch, CURLOPT_WRITEFUNCTION,
            function ($ch, $data) use (&$fullResponse, &$usage, &$lastActivityTime, &$toolInputByIndex, &$toolNameByIndex, &$errorBody, $isStructured, $onToken, &$callbackException) {
                if ($callbackException !== null) {
                    return 0; // Already failed, abort quickly
                }
                try {
                    $lastActivityTime = microtime(true);
                    $lines = explode("\n", $data);

                    foreach ($lines as $line) {
                        $line = trim($line);
                        if (empty($line) || str_starts_with($line, 'event:')) {
                            continue;
                        }
                        if (!str_starts_with($line, 'data: ')) {
                            $errorBody .= $line;
                            continue;
                        }
                        $json = substr($line, 6);
                        if ($json === '[DONE]') {
                            continue;
                        }
                        $event = json_decode($json, true);
                        if (!is_array($event)) {
                            continue;
                        }

                        if ($isStructured && ($event['type'] ?? '') === 'content_block_start') {
                            $index = (int) ($event['index'] ?? 0);
                            $contentBlock = $event['content_block'] ?? [];
                            if (is_array($contentBlock) && ($contentBlock['type'] ?? '') === 'tool_use') {
                                $toolName = (string) ($contentBlock['name'] ?? '');
                                if ($toolName !== '') {
                                    $toolNameByIndex[$index] = $toolName;
                                }
                                $initialInput = $contentBlock['input'] ?? null;
                                if (is_array($initialInput) && !empty($initialInput)) {
                                    $toolInputByIndex[$index] = (string) json_encode($initialInput, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                                } elseif (is_string($initialInput) && $initialInput !== '' && $initialInput !== '{}' && $initialInput !== '[]') {
                                    $toolInputByIndex[$index] = $initialInput;
                                } else {
                                    $toolInputByIndex[$index] = '';
                                }
                            }
                        }

                        if (($event['type'] ?? '') === 'content_block_delta') {
                            $delta = $event['delta'] ?? [];
                            $deltaType = (string) ($delta['type'] ?? '');
                            $text = '';
                            if ($deltaType === 'text_delta' || isset($delta['text'])) {
                                $text = (string) ($delta['text'] ?? '');
                            }
                            if ($text !== '') {
                                $fullResponse .= $text;
                                $onToken($text);
                            }
                            if ($isStructured && $deltaType === 'input_json_delta') {
                                $index = (int) ($event['index'] ?? 0);
                                $partial = (string) ($delta['partial_json'] ?? '');
                                if ($partial !== '') {
                                    $toolInputByIndex[$index] = ($toolInputByIndex[$index] ?? '') . $partial;
                                    $onToken('');
                                }
                            }
                        }

                        if (($event['type'] ?? '') === 'message_delta') {
                            $usage['output_tokens'] = $event['usage']['output_tokens'] ?? ($usage['output_tokens'] ?? 0);
                        }

                        if (($event['type'] ?? '') === 'message_start' && isset($event['message']['usage'])) {
                            $usage['input_tokens'] = $event['message']['usage']['input_tokens'] ?? 0;
                            
                        }
                    }
                    return strlen($data);
                } catch (\Throwable $e) {
                    $callbackException = $e;
                    \VoxelSite\Logger::error('ai', 'Exception inside cURL write callback', [
                        'error'   => $e->getMessage(),
                        'class'   => get_class($e),
                        'file'    => $e->getFile() . ':' . $e->getLine(),
                        'trace'   => $e->getTraceAsString(),
                    ]);
                    return 0; // Abort cURL transfer
                }
            }
        );

        curl_exec($ch);

        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErrno = curl_errno($ch);
        $error = curl_error($ch);
        curl_close($ch);

        $durationMs = (int) ((microtime(true) - $startTime) * 1000);

        // Re-throw any exception that was caught inside the callback
        if ($callbackException !== null) {
            throw $callbackException;
        }

        // Handle cURL errors
        if (!empty($error)) {
            \VoxelSite\Logger::error('ai', 'cURL error after stream', [
                'error'    => $error,
                'errno'    => $curlErrno,
                'httpCode' => $httpCode,
                'duration' => $durationMs,
                'tokens'   => $usage,
                'response_length' => strlen($fullResponse),
            ]);
            throw new RuntimeException("Claude API connection failed: {$error}");
        }

        if ($httpCode === 429) {
            throw new RuntimeException('rate_limited');
        }

        if ($httpCode === 401) {
            throw new RuntimeException('invalid_api_key');
        }

        if ($httpCode >= 500) {
            throw new RuntimeException('provider_unavailable');
        }

        if ($httpCode !== 200 && empty($fullResponse)) {
            // Try to extract the actual error message from the API response
            $apiMessage = '';
            if (!empty($errorBody)) {
                $decodedError = json_decode($errorBody, true);
                if (is_array($decodedError)) {
                    $apiMessage = (string) (
                        $decodedError['error']['message']
                        ?? $decodedError['message']
                        ?? ''
                    );
                }
            }

            if ($apiMessage !== '') {
                throw new RuntimeException("Claude API error (HTTP {$httpCode}): {$apiMessage}");
            }

            throw new RuntimeException("Claude API returned HTTP {$httpCode}");
        }

        if ($isStructured && !empty($toolInputByIndex)) {
            ksort($toolInputByIndex);
            foreach ($toolInputByIndex as $index => $rawInput) {
                $toolName = $toolNameByIndex[$index] ?? self::STRUCTURED_TOOL_NAME;
                if ($toolName === self::STRUCTURED_TOOL_NAME && trim($rawInput) !== '') {
                    $fullResponse = $this->normalizeStructuredPayload($rawInput);
                    break;
                }
            }
        }

        // Call completion handler
        $onComplete($fullResponse, [
            'input_tokens'  => $usage['input_tokens'],
            'output_tokens' => $usage['output_tokens'],
            'duration_ms'   => $durationMs,
            'model'         => $model,
        ]);
    }

    /**
     * Non-streaming completion for lightweight operations.
     */
    public function complete(
        string $systemPrompt,
        array $messages,
        array $options = []
    ): string {
        $model = $options['model'] ?? $this->model ?? $this->getModels()[0]['id'];
        $maxTokens = $this->resolveMaxTokens($options['max_tokens'] ?? $this->maxTokens, $model);
        $isStructured = !empty($options['structured_output']);

        $payload = [
            'model'      => $model,
            'max_tokens' => $maxTokens,
            'system'     => $systemPrompt,
            'messages'   => $messages,
        ];

        if ($isStructured) {
            $payload['tools'] = [$this->getStructuredToolDefinition()];
            $payload['tool_choice'] = [
                'type' => 'tool',
                'name' => self::STRUCTURED_TOOL_NAME,
            ];
        }

        $response = $this->apiCall($payload);

        if ($isStructured) {
            foreach ($response['content'] ?? [] as $block) {
                if (!is_array($block) || ($block['type'] ?? '') !== 'tool_use') {
                    continue;
                }
                if (($block['name'] ?? '') !== self::STRUCTURED_TOOL_NAME) {
                    continue;
                }

                $input = $block['input'] ?? null;
                if (is_array($input)) {
                    return (string) json_encode($input, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                }
                if (is_string($input) && trim($input) !== '') {
                    return $this->normalizeStructuredPayload($input);
                }
            }
        }

        // Extract text from content blocks
        $text = '';
        foreach ($response['content'] ?? [] as $block) {
            if (($block['type'] ?? '') === 'text') {
                $text .= $block['text'];
            }
        }

        return $text;
    }

    /**
     * Rough token estimation.
     *
     * Claude uses ~4 characters per token on average for English.
     * This is intentionally imprecise — it's used for context size
     * management, not billing. Overestimating slightly is safer
     * than underestimating (prevents context overflow).
     */
    public function estimateTokens(string $text): int
    {
        return (int) ceil(strlen($text) / 3.5);
    }

    /**
     * Context window sizes for Claude models (in tokens).
     *
     * All current Claude models use a 200K context window.
     * Haiku 3.5 also has 200K. Unknown models get a safe 128K.
     */
    public function getContextWindow(string $model): int
    {
        $modelLower = strtolower($model);

        // All Claude Sonnet/Opus 4.x and Haiku 3.5 have 200K context
        if (str_contains($modelLower, 'sonnet') ||
            str_contains($modelLower, 'opus') ||
            str_contains($modelLower, 'haiku')) {
            return 200_000;
        }

        // Conservative fallback for unknown Claude models
        return 128_000;
    }

    /**
     * Estimate cost based on Claude's published pricing.
     *
     * Prices are per million tokens. Updated for Claude 4.5 Sonnet.
     */
    public function estimateCost(int $inputTokens, int $outputTokens, string $model): array
    {
        // Pricing per million tokens (as of Feb 2026)
        $pricing = [
            'claude-sonnet-4-5-20250514' => ['input' => 3.00, 'output' => 15.00],
            'claude-sonnet-4-20250514'   => ['input' => 3.00, 'output' => 15.00],
        ];

        $rates = $pricing[$model] ?? $pricing['claude-sonnet-4-5-20250514'];

        $inputCost = ($inputTokens / 1_000_000) * $rates['input'];
        $outputCost = ($outputTokens / 1_000_000) * $rates['output'];

        return [
            'input_cost'  => round($inputCost, 6),
            'output_cost' => round($outputCost, 6),
            'total_cost'  => round($inputCost + $outputCost, 6),
        ];
    }

    /**
     * Cap max_tokens to the model's supported output limit.
     *
     * Claude model output limits (as of Feb 2026):
     * - Haiku 3.5:     8,192
     * - Sonnet 4/4.5: 64,000
     * - Opus 4:       32,768
     * - Opus 4.5+:    64,000
     * - Opus 4.6+:   128,000
     *
     * Note: Claude 3.5 Sonnet had 16K. Claude 4+ Sonnet has 64K.
     */
    private function resolveMaxTokens(int $requested, string $model): int
    {
        $modelLower = strtolower($model);

        // Opus models support much higher output limits
        if (str_contains($modelLower, 'opus')) {
            if (str_contains($modelLower, '4-6') || str_contains($modelLower, '4.6')) {
                return min($requested, 128000);
            }
            if (str_contains($modelLower, '4-5') || str_contains($modelLower, '4.5')) {
                return min($requested, 64000);
            }
            return min($requested, 32768);
        }

        // Haiku 3.5
        if (str_contains($modelLower, 'haiku')) {
            return min($requested, 8192);
        }

        // Sonnet 4/4.5 — supports 64K output tokens
        if (str_contains($modelLower, 'sonnet')) {
            return min($requested, 64000);
        }

        // Unknown models — conservative default
        return min($requested, 16384);
    }

    /**
     * Build standard API request headers.
     */
    private function getHeaders(int $maxTokens = 0, string $model = ''): array
    {
        return [
            'Content-Type: application/json',
            'x-api-key: ' . $this->apiKey,
            'anthropic-version: ' . self::API_VERSION,
        ];
    }

    /**
     * Make a non-streaming API call to Claude.
     *
     * @return array<string, mixed> Decoded JSON response
     */
    private function apiCall(array $payload): array
    {
        $model = $payload['model'] ?? '';
        $maxTokens = $payload['max_tokens'] ?? 0;

        $ch = curl_init(self::API_URL);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => $this->getHeaders($maxTokens, $model),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 120,
            CURLOPT_CONNECTTIMEOUT => 10,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if (!empty($error)) {
            throw new RuntimeException("Claude API connection failed: {$error}");
        }

        $decoded = json_decode($response, true);
        if (!is_array($decoded)) {
            throw new RuntimeException("Invalid response from Claude API (HTTP {$httpCode})");
        }

        if ($httpCode !== 200) {
            $msg = $decoded['error']['message'] ?? "HTTP {$httpCode}";
            throw new RuntimeException("Claude API error: {$msg}");
        }

        return $decoded;
    }

    /**
     * @return array<string, mixed>
     */
    private function getStructuredToolDefinition(): array
    {
        return [
            'name' => self::STRUCTURED_TOOL_NAME,
            'description' => 'Return planned filesystem operations for the site update.',
            'input_schema' => [
                'type' => 'object',
                'additionalProperties' => false,
                'required' => ['assistant_message', 'operations'],
                'properties' => [
                    'assistant_message' => ['type' => 'string'],
                    'operations' => [
                        'type' => 'array',
                        'items' => [
                            'type' => 'object',
                            'additionalProperties' => false,
                            'required' => ['path', 'action'],
                            'properties' => [
                                'path' => ['type' => 'string'],
                                'action' => ['type' => 'string', 'enum' => ['write', 'delete', 'merge']],
                                'content' => ['type' => 'string'],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    private function normalizeStructuredPayload(string $raw): string
    {
        // Safety net: Claude may prepend empty initial input like "[]" or "{}"
        // before the actual JSON object from streaming deltas.
        // Strip any leading "[]" or "{}" followed by another opening brace.
        $raw = preg_replace('/^\[\]\s*(?=\{)/', '', $raw);
        $raw = preg_replace('/^\{\}\s*(?=\{)/', '', $raw);

        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return (string) json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        return trim($raw);
    }
}
