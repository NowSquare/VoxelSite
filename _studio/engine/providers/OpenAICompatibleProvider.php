<?php

declare(strict_types=1);

namespace VoxelSite\Providers;

use VoxelSite\AIProviderInterface;
use RuntimeException;

/**
 * OpenAI-Compatible provider.
 *
 * Supports any server that speaks the OpenAI Chat Completions format:
 * - Ollama (http://localhost:11434)
 * - LM Studio (http://127.0.0.1:1234)
 * - Together AI, Groq, Fireworks, etc.
 * - Self-hosted vLLM, llama.cpp, etc.
 *
 * The user provides a base URL (e.g. http://127.0.0.1:1234).
 * /v1 is auto-appended if not already present.
 */
class OpenAICompatibleProvider implements AIProviderInterface
{
    private const STRUCTURED_TOOL_NAME = 'apply_voxelsite_changes';

    private string $apiKey;
    private ?string $model;
    private int $maxTokens;
    private string $baseUrl;

    public function __construct(string $apiKey, ?string $model = null, int $maxTokens = 16000, string $baseUrl = '')
    {
        $this->apiKey = $apiKey;
        $this->model = $model;
        $this->maxTokens = $maxTokens;
        $this->baseUrl = self::normalizeBaseUrl($baseUrl ?: 'http://localhost:11434');
    }

    /**
     * Normalize the base URL: strip trailing slash, auto-append /v1 if missing.
     *
     * Users enter http://127.0.0.1:1234, we turn it into http://127.0.0.1:1234/v1
     */
    private static function normalizeBaseUrl(string $url): string
    {
        $url = rtrim($url, '/');

        // Auto-append /v1 if the URL doesn't already end with it
        if (!preg_match('#/v\d+$#', $url)) {
            $url .= '/v1';
        }

        return $url;
    }

    public function getId(): string
    {
        return 'openai_compatible';
    }

    public function getName(): string
    {
        return 'OpenAI Compatible';
    }

    public function getModels(): array
    {
        // No static fallback — models depend entirely on the server
        return [];
    }

    /**
     * Fetch models from the compatible server.
     *
     * Most OpenAI-compatible servers support GET /v1/models.
     */
    public function listModels(): array
    {
        try {
            $url = $this->baseUrl . '/models';

            $headers = ['Content-Type: application/json'];
            if (!empty($this->apiKey)) {
                $headers[] = 'Authorization: Bearer ' . $this->apiKey;
            }

            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_HTTPHEADER     => $headers,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 10,
                CURLOPT_CONNECTTIMEOUT => 5,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200 || empty($response)) {
                return [];
            }

            $data = json_decode($response, true);
            if (!is_array($data) || !isset($data['data'])) {
                return [];
            }

            $models = [];
            foreach ($data['data'] as $model) {
                $id = $model['id'] ?? '';
                if (empty($id)) continue;

                $models[] = [
                    'id'         => $id,
                    'name'       => $id,
                    'created_at' => isset($model['created']) ? date('Y-m-d\TH:i:s\Z', $model['created']) : '',
                ];
            }

            return $models;
        } catch (\Throwable) {
            return [];
        }
    }

    public function testConnection(): array
    {
        $url = $this->baseUrl . '/models';

        $headers = ['Content-Type: application/json'];
        if (!empty($this->apiKey)) {
            $headers[] = 'Authorization: Bearer ' . $this->apiKey;
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_CONNECTTIMEOUT => 5,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if (!empty($curlError)) {
            throw new RuntimeException('Could not reach server at ' . $this->baseUrl . ': ' . $curlError);
        }
        if ($httpCode === 401) {
            throw new RuntimeException('authentication_error: API key is invalid (HTTP 401)');
        }
        if ($httpCode === 0 || $httpCode >= 500) {
            throw new RuntimeException("Server at {$this->baseUrl} returned HTTP {$httpCode}. Is it running?");
        }
        if ($httpCode !== 200 || empty($response)) {
            throw new RuntimeException("Unexpected response from server (HTTP {$httpCode})");
        }

        return $this->listModels();
    }

    public function getConfigFields(): array
    {
        return [
            [
                'key'         => 'base_url',
                'label'       => 'Server URL',
                'type'        => 'url',
                'placeholder' => 'http://127.0.0.1:1234',
                'required'    => true,
                'help_text'   => 'Ollama: localhost:11434 · LM Studio: 127.0.0.1:1234',
            ],
            [
                'key'         => 'api_key',
                'label'       => 'API Key',
                'type'        => 'password',
                'placeholder' => 'Optional for local servers',
                'required'    => false,
                'help_text'   => 'Leave empty for Ollama/LM Studio',
            ],
        ];
    }

    public function validateConfig(array $config): bool
    {
        $baseUrl = self::normalizeBaseUrl($config['base_url'] ?? $this->baseUrl);
        $key = $config['api_key'] ?? $this->apiKey;

        try {
            $headers = ['Content-Type: application/json'];
            if (!empty($key)) {
                $headers[] = 'Authorization: Bearer ' . $key;
            }

            $ch = curl_init($baseUrl . '/models');
            curl_setopt_array($ch, [
                CURLOPT_HTTPHEADER     => $headers,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 10,
                CURLOPT_CONNECTTIMEOUT => 5,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            return $httpCode === 200;
        } catch (\Throwable) {
            return false;
        }
    }

    public function stream(
        string $systemPrompt,
        array $messages,
        callable $onToken,
        callable $onComplete,
        array $options = []
    ): void {
        $model = $options['model'] ?? $this->model ?? '';
        $maxTokens = $this->resolveMaxTokens((int) ($options['max_tokens'] ?? $this->maxTokens), (string) $model);
        $isStructured = !empty($options['structured_output']);
        $structuredFallbackTried = !empty($options['_structured_fallback_tried']);

        if (empty($model)) {
            throw new RuntimeException('No model selected. Please choose a model first.');
        }

        $requestMessages = $messages;
        array_unshift($requestMessages, ['role' => 'system', 'content' => $systemPrompt]);

        $payload = [
            'model'      => $model,
            'max_tokens' => $maxTokens,
            'messages'   => $requestMessages,
            'stream'     => true,
        ];
        if ($isStructured) {
            $payload['tools'] = [$this->getStructuredToolDefinition()];
            $payload['tool_choice'] = [
                'type' => 'function',
                'function' => ['name' => self::STRUCTURED_TOOL_NAME],
            ];
        }

        $fullResponse = '';
        $usage = ['input_tokens' => 0, 'output_tokens' => 0];
        $lastActivityTime = microtime(true);
        $toolArgsByIndex = [];
        $toolNamesByIndex = [];
        $errorBody = '';

        $headers = [
            'Content-Type: application/json',
        ];
        if (!empty($this->apiKey)) {
            $headers[] = 'Authorization: Bearer ' . $this->apiKey;
        }

        $ch = curl_init($this->baseUrl . '/chat/completions');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_TIMEOUT        => 900,  // 15 min absolute ceiling
            CURLOPT_CONNECTTIMEOUT => 30,   // Local servers may take longer to accept
            CURLOPT_LOW_SPEED_LIMIT => 1,
            CURLOPT_LOW_SPEED_TIME  => 180,

            // SSE keepalive via progress callback — fires periodically even
            // during idle waits. This is a first line of defence; the
            // curl_multi loop below is the guaranteed fallback.
            CURLOPT_NOPROGRESS     => false,
            CURLOPT_PROGRESSFUNCTION => function () use (&$lastActivityTime) {
                $now = microtime(true);
                if (($now - $lastActivityTime) > 15) {
                    try {
                        echo ": keepalive\n\n";
                        flush();
                    } catch (\Throwable $e) {
                        // Output failed (connection closed) — ignore
                    }
                    $lastActivityTime = $now;
                }
                // Always return 0 — never abort the AI request.
                // With ignore_user_abort(true), files are still saved
                // even if the proxy disconnects.
                return 0;
            },

            CURLOPT_WRITEFUNCTION  => function ($ch, $data) use (&$fullResponse, &$usage, &$lastActivityTime, &$toolArgsByIndex, &$toolNamesByIndex, &$errorBody, $isStructured, $onToken) {
                $lastActivityTime = microtime(true);
                $lines = explode("\n", $data);

                foreach ($lines as $line) {
                    $line = trim($line);
                    if (empty($line)) continue;
                    if (!str_starts_with($line, 'data: ')) {
                        // Non-SSE payloads (e.g. JSON API errors) are useful for diagnostics.
                        $errorBody .= $line;
                        continue;
                    }

                    $json = substr($line, 6);
                    if ($json === '[DONE]') continue;

                    $event = json_decode($json, true);
                    if (!is_array($event)) continue;

                    $delta = $event['choices'][0]['delta'] ?? [];
                    $text = $delta['content'] ?? '';
                    if ($text !== '') {
                        $fullResponse .= $text;
                        $onToken($text);
                    }

                    if ($isStructured && isset($delta['tool_calls']) && is_array($delta['tool_calls'])) {
                        foreach ($delta['tool_calls'] as $toolCall) {
                            if (!is_array($toolCall)) {
                                continue;
                            }

                            $index = (int) ($toolCall['index'] ?? 0);
                            $toolName = (string) ($toolCall['function']['name'] ?? '');
                            if ($toolName !== '') {
                                $toolNamesByIndex[$index] = $toolName;
                            }

                            $argDelta = (string) ($toolCall['function']['arguments'] ?? '');
                            if ($argDelta !== '') {
                                $toolArgsByIndex[$index] = ($toolArgsByIndex[$index] ?? '') . $argDelta;
                                $onToken($argDelta);
                            }
                        }
                    }

                    if (isset($event['usage'])) {
                        $usage['input_tokens'] = $event['usage']['prompt_tokens'] ?? 0;
                        $usage['output_tokens'] = $event['usage']['completion_tokens'] ?? 0;
                    }
                }

                return strlen($data);
            },
        ]);

        // ── Non-blocking execution with keepalive ──
        // 
        // Local models (LM Studio, Ollama) can take minutes to process
        // a prompt before generating the first token. During this time,
        // no data flows over the connection. Without keepalives, the
        // proxy (nginx via Valet) kills the connection after 60s.
        //
        // curl_multi_exec() lets us run the request non-blocking and
        // emit SSE keepalive comments every 15 seconds, guaranteed —
        // even if CURLOPT_PROGRESSFUNCTION doesn't fire during idle waits.

        $startTime = microtime(true);
        $mh = curl_multi_init();
        curl_multi_add_handle($mh, $ch);

        $running = 0;
        do {
            $status = curl_multi_exec($mh, $running);

            if ($status !== CURLM_OK) {
                break;
            }

            // Send keepalive every 15 seconds of silence
            $now = microtime(true);
            if (($now - $lastActivityTime) > 15) {
                try {
                    echo ": keepalive\n\n";
                    if (ob_get_level()) ob_flush();
                    flush();
                } catch (\Throwable $e) {
                    // Connection closed — continue anyway
                }
                $lastActivityTime = $now;
            }

            // Wait for activity — max 1 second so keepalive loop runs
            if ($running > 0) {
                curl_multi_select($mh, 1.0);
            }
        } while ($running > 0);

        curl_multi_remove_handle($mh, $ch);
        curl_multi_close($mh);

        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        $durationMs = (int) ((microtime(true) - $startTime) * 1000);

        // Structured mode fallback for compatible servers that reject tools.
        if ($isStructured && !$structuredFallbackTried && $this->shouldRetryWithoutTools($httpCode, $errorBody) && empty($fullResponse)) {
            $fallbackOptions = $options;
            $fallbackOptions['structured_output'] = false;
            $fallbackOptions['_structured_fallback_tried'] = true;
            $this->stream($systemPrompt, $messages, $onToken, $onComplete, $fallbackOptions);
            return;
        }

        if (!empty($error)) {
            throw new RuntimeException("API connection failed: {$error}");
        }

        if ($httpCode === 429) throw new RuntimeException('rate_limited');
        if ($httpCode === 401) throw new RuntimeException('invalid_api_key');
        if ($httpCode >= 500) throw new RuntimeException('provider_unavailable');

        if ($httpCode !== 200 && empty($fullResponse)) {
            $decodedError = json_decode($errorBody, true);
            $apiMessage = '';
            if (is_array($decodedError)) {
                $apiMessage = (string) (
                    $decodedError['error']['message']
                    ?? $decodedError['message']
                    ?? ''
                );
            }

            if ($apiMessage !== '') {
                throw new RuntimeException("API error (HTTP {$httpCode}): {$apiMessage}");
            }

            throw new RuntimeException("API returned HTTP {$httpCode}");
        }

        if ($isStructured && !empty($toolArgsByIndex)) {
            ksort($toolArgsByIndex);
            foreach ($toolArgsByIndex as $index => $rawArgs) {
                $toolName = $toolNamesByIndex[$index] ?? self::STRUCTURED_TOOL_NAME;
                if ($toolName === self::STRUCTURED_TOOL_NAME && trim($rawArgs) !== '') {
                    $fullResponse = $this->normalizeStructuredPayload($rawArgs);
                    break;
                }
            }
        }

        $onComplete($fullResponse, [
            'input_tokens'  => $usage['input_tokens'],
            'output_tokens' => $usage['output_tokens'],
            'duration_ms'   => $durationMs,
            'model'         => $model,
        ]);
    }

    public function complete(
        string $systemPrompt,
        array $messages,
        array $options = []
    ): string {
        $model = $options['model'] ?? $this->model ?? '';
        $maxTokens = $this->resolveMaxTokens((int) ($options['max_tokens'] ?? $this->maxTokens), (string) $model);
        $isStructured = !empty($options['structured_output']);
        $structuredFallbackTried = !empty($options['_structured_fallback_tried']);

        if (empty($model)) {
            throw new RuntimeException('No model selected.');
        }

        array_unshift($messages, ['role' => 'system', 'content' => $systemPrompt]);

        $headers = [
            'Content-Type: application/json',
        ];
        if (!empty($this->apiKey)) {
            $headers[] = 'Authorization: Bearer ' . $this->apiKey;
        }

        $payload = json_encode([
            'model'      => $model,
            'max_tokens' => $maxTokens,
            'messages'   => $messages,
        ] + ($isStructured ? [
            'tools' => [$this->getStructuredToolDefinition()],
            'tool_choice' => [
                'type' => 'function',
                'function' => ['name' => self::STRUCTURED_TOOL_NAME],
            ],
        ] : []));

        $ch = curl_init($this->baseUrl . '/chat/completions');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 120,
            CURLOPT_CONNECTTIMEOUT => 10,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if (!empty($error)) {
            throw new RuntimeException("API connection failed: {$error}");
        }

        $decoded = json_decode($response, true);
        if (!is_array($decoded) || $httpCode !== 200) {
            $msg = $decoded['error']['message'] ?? "HTTP {$httpCode}";
            if ($isStructured && !$structuredFallbackTried && $this->shouldRetryWithoutTools($httpCode, (string) json_encode($decoded))) {
                $fallbackOptions = $options;
                $fallbackOptions['structured_output'] = false;
                $fallbackOptions['_structured_fallback_tried'] = true;
                return $this->complete($systemPrompt, array_slice($messages, 1), $fallbackOptions);
            }
            throw new RuntimeException("API error: {$msg}");
        }

        if ($isStructured) {
            $toolArgs = $decoded['choices'][0]['message']['tool_calls'][0]['function']['arguments'] ?? '';
            if (is_string($toolArgs) && trim($toolArgs) !== '') {
                return $this->normalizeStructuredPayload($toolArgs);
            }
        }

        return $decoded['choices'][0]['message']['content'] ?? '';
    }

    public function estimateTokens(string $text): int
    {
        return (int) ceil(strlen($text) / 3.5);
    }

    /**
     * Conservative cap for arbitrary compatible servers.
     *
     * We don't know the target model's true output limit, so prefer
     * compatibility over aggressively large defaults (global default is 32000).
     */
    private function resolveMaxTokens(int $requested, string $model): int
    {
        $requested = max(1, $requested);
        $id = strtolower($model);

        if (preg_match('/^o\d/', $id) === 1) {
            return min($requested, 32000);
        }

        if (str_starts_with($id, 'gpt-') || str_starts_with($id, 'chatgpt-')) {
            return min($requested, 16384);
        }

        // Many local/open-source models expose much smaller generation limits.
        return min($requested, 8192);
    }

    private function extractApiErrorMessage(string $raw): string
    {
        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            return '';
        }

        return (string) ($decoded['error']['message'] ?? $decoded['message'] ?? '');
    }

    private function shouldRetryWithoutTools(int $httpCode, string $errorBody): bool
    {
        if (!in_array($httpCode, [400, 404, 422, 501], true)) {
            return false;
        }

        $msg = strtolower($this->extractApiErrorMessage($errorBody));
        if ($msg === '') {
            return true;
        }

        return str_contains($msg, 'tool')
            || str_contains($msg, 'function')
            || str_contains($msg, 'tool_choice')
            || str_contains($msg, 'unsupported')
            || str_contains($msg, 'schema');
    }

    /**
     * Context window for OpenAI-compatible servers.
     *
     * We can't know the actual context window for arbitrary models,
     * so we return a conservative default. This prevents the budget
     * formula from being too generous for small local models.
     */
    public function getContextWindow(string $model): int
    {
        return 32_000;
    }

    public function estimateCost(int $inputTokens, int $outputTokens, string $model): array
    {
        // Local models are typically free
        return [
            'input_cost'  => 0.0,
            'output_cost' => 0.0,
            'total_cost'  => 0.0,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function getStructuredToolDefinition(): array
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => self::STRUCTURED_TOOL_NAME,
                'description' => 'Return planned filesystem operations for the site update.',
                'parameters' => [
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
            ],
        ];
    }

    private function normalizeStructuredPayload(string $raw): string
    {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return (string) json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        return trim($raw);
    }
}
