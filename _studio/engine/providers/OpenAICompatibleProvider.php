<?php

declare(strict_types=1);

namespace VoxelSite\Providers;

use VoxelSite\AIProviderInterface;
use VoxelSite\Agent\ProviderCallPolicy;
use VoxelSite\Agent\ProviderCallForbidden;
use VoxelSite\ModelCapabilities;
use RuntimeException;

if (!class_exists(ProviderCallPolicy::class)) { require_once dirname(__DIR__) . '/Agent/ProviderCallPolicy.php'; }

if (!class_exists(ModelCapabilities::class)) { require_once dirname(__DIR__) . '/ModelCapabilities.php'; }

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
    private const CUSTOM_TOOL_PREFIX = 'voxelsite_structured_';

    private string $apiKey;
    private ?string $model;
    private int $maxTokens;
    private array $modelCapabilities = [];
    private string $baseUrl;

    public function __construct(string $apiKey, ?string $model = null, int $maxTokens = 16000, string $baseUrl = '', array $modelCapabilities = [])
    {
        $this->apiKey = $apiKey;
        $this->model = $model;
        $this->maxTokens = $maxTokens;
        $this->modelCapabilities = $modelCapabilities;
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
        ProviderCallPolicy::assertAllowed('model_discovery');
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

            ProviderCallPolicy::assertAllowed('provider_http_dispatch');
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

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
                    ...ModelCapabilities::fromModelMetadata($this->getId(), $model),
                ];
            }

            return $models;
        } catch (ProviderCallForbidden $error) {
            throw $error;
        } catch (\Throwable) {
            return [];
        }
    }

    public function testConnection(): array
    {
        ProviderCallPolicy::assertAllowed('provider_test');
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

        ProviderCallPolicy::assertAllowed('provider_http_dispatch');
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);

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
        ProviderCallPolicy::assertAllowed('provider_validation');
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

            ProviderCallPolicy::assertAllowed('provider_http_dispatch');
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            return $httpCode === 200;
        } catch (ProviderCallForbidden $error) {
            throw $error;
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
        ProviderCallPolicy::assertAllowed('provider_stream');
        $model = $options['model'] ?? $this->model ?? '';
        $maxTokens = $this->resolveMaxTokens((int) ($options['max_tokens'] ?? $this->maxTokens), (string) $model);
        $structuredOption = $options['structured_output'] ?? false;
        $isStructured = $structuredOption !== false;
        $structuredFallbackTried = !empty($options['_structured_fallback_tried']);

        $toolDef = null;
        $toolName = self::STRUCTURED_TOOL_NAME;
        if ($isStructured) {
            if (is_array($structuredOption)) {
                $toolName = $structuredOption['tool_name'] ?? (self::CUSTOM_TOOL_PREFIX . 'output');
                $toolDef = $this->buildToolFromSchema($structuredOption, $toolName);
            } else {
                $toolDef = $this->getStructuredToolDefinition();
            }
        }

        if (empty($model)) {
            throw new RuntimeException('No model selected. Please choose a model first.');
        }

        $requestMessages = $this->transformMessagesForVision($messages);
        array_unshift($requestMessages, ['role' => 'system', 'content' => $systemPrompt]);

        $payload = [
            'model'      => $model,
            'max_tokens' => $maxTokens,
            'messages'   => $requestMessages,
            'stream'     => true,
        ];
        $this->applyTemperature($payload, $options);
        if ($isStructured && $toolDef !== null) {
            $payload['tools'] = [$toolDef];
            $payload['tool_choice'] = [
                'type' => 'function',
                'function' => ['name' => $toolName],
            ];
        }

        $fullResponse = '';
        $usage = ['input_tokens' => 0, 'output_tokens' => 0];
        $lastActivityTime = microtime(true);
        $toolArgsByIndex = [];
        $toolNamesByIndex = [];
        $errorBody = '';
        $lineBuffer = '';

        $processLine = function (string $line) use (&$fullResponse, &$usage, &$toolArgsByIndex, &$toolNamesByIndex, &$errorBody, $isStructured, $onToken): void {
            $line = trim($line);
            if ($line === '') return;
            if (!str_starts_with($line, 'data: ')) {
                // Non-SSE payloads (e.g. JSON API errors) are useful for diagnostics.
                $errorBody .= $line;
                return;
            }

            $json = substr($line, 6);
            if ($json === '[DONE]') return;

            $event = json_decode($json, true);
            if (!is_array($event)) return;

            if (is_string($event['choices'][0]['finish_reason'] ?? null)) {
                $usage['finish_reason'] = $event['choices'][0]['finish_reason'];
            }

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
                        $toolNamesByIndex[$index] = ($toolNamesByIndex[$index] ?? '') . $toolName;
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
        };

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

            CURLOPT_WRITEFUNCTION  => function ($ch, $data) use (&$lineBuffer, &$lastActivityTime, $processLine) {
                $lastActivityTime = microtime(true);
                // Network chunks can end anywhere, including inside JSON or UTF-8.
                $lineBuffer .= $data;
                while (($newline = strpos($lineBuffer, "\n")) !== false) {
                    $line = substr($lineBuffer, 0, $newline);
                    $lineBuffer = substr($lineBuffer, $newline + 1);
                    $processLine($line);
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
            ProviderCallPolicy::assertAllowed('provider_http_dispatch');
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

        // Providers may omit the trailing newline, including on JSON error bodies.
        if ($lineBuffer !== '') {
            $processLine($lineBuffer);
        }

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
                $matchName = $toolNamesByIndex[$index] ?? $toolName;
                if ($matchName === $toolName && trim($rawArgs) !== '') {
                    $fullResponse = $this->normalizeStructuredPayload($rawArgs);
                    break;
                }
            }
        }

        $onComplete($fullResponse, [
            'finish_reason' => $usage['finish_reason'] ?? null,
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
        ProviderCallPolicy::assertAllowed('provider_complete');
        $model = $options['model'] ?? $this->model ?? '';
        $maxTokens = $this->resolveMaxTokens((int) ($options['max_tokens'] ?? $this->maxTokens), (string) $model);
        $structuredOption = $options['structured_output'] ?? false;
        $isStructured = $structuredOption !== false;
        $structuredFallbackTried = !empty($options['_structured_fallback_tried']);

        $toolDef = null;
        $toolName = self::STRUCTURED_TOOL_NAME;
        if ($isStructured) {
            if (is_array($structuredOption)) {
                $toolName = $structuredOption['tool_name'] ?? (self::CUSTOM_TOOL_PREFIX . 'output');
                $toolDef = $this->buildToolFromSchema($structuredOption, $toolName);
            } else {
                $toolDef = $this->getStructuredToolDefinition();
            }
        }

        if (empty($model)) {
            throw new RuntimeException('No model selected.');
        }

        $messages = $this->transformMessagesForVision($messages);
        array_unshift($messages, ['role' => 'system', 'content' => $systemPrompt]);

        $payloadArray = [
            'model'      => $model,
            'max_tokens' => $maxTokens,
            'messages'   => $messages,
        ];
        $this->applyTemperature($payloadArray, $options);
        if ($isStructured && $toolDef !== null) {
            $payloadArray['tools'] = [$toolDef];
            $payloadArray['tool_choice'] = [
                'type' => 'function',
                'function' => ['name' => $toolName],
            ];
        }

        // Route through apiCall() so test subclasses can simulate errors.
        // apiCall() throws with the HTTP status as $e->getCode(), so we check
        // the code directly — no brittle message-text matching needed.
        try {
            $decoded = $this->apiCall($payloadArray);
        } catch (\Throwable $e) {
            if ($isStructured && !$structuredFallbackTried
                && in_array($e->getCode(), [400, 404, 422], true)
            ) {
                \VoxelSite\Logger::warning('ai', 'API tool call rejected — retrying without structured output', [
                    'error'    => $e->getMessage(),
                    'httpCode' => $e->getCode(),
                    'tool'     => $toolName,
                    'model'    => $model,
                ]);
                $fallbackOptions = $options;
                $fallbackOptions['structured_output'] = false;
                $fallbackOptions['_structured_fallback_tried'] = true;
                return $this->complete($systemPrompt, array_slice($messages, 1), $fallbackOptions);
            }
            throw $e;
        }

        if ($isStructured) {
            $toolArgs = $decoded['choices'][0]['message']['tool_calls'][0]['function']['arguments'] ?? '';
            if (is_string($toolArgs) && trim($toolArgs) !== '') {
                return $this->normalizeStructuredPayload($toolArgs);
            }
        }

        return $decoded['choices'][0]['message']['content'] ?? '';
    }

    /**
     * Make a non-streaming API call to the compatible endpoint.
     *
     * Extracted as a protected method so test subclasses can override
     * it to simulate HTTP error responses for fallback testing.
     *
     * @param array $payload Request body (will be JSON-encoded)
     * @return array<string, mixed> Decoded JSON response
     * @throws RuntimeException On connection, decode, or HTTP errors
     */
    protected function apiCall(array $payload): array
    {
        ProviderCallPolicy::assertAllowed('provider_http');
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
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 120,
            CURLOPT_CONNECTTIMEOUT => 10,
        ]);

        ProviderCallPolicy::assertAllowed('provider_http_dispatch');
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        if (!empty($error)) {
            throw new RuntimeException("API connection failed: {$error}");
        }

        $decoded = json_decode($response, true);
        if (!is_array($decoded)) {
            throw new RuntimeException("Invalid response from API (HTTP {$httpCode})", $httpCode);
        }

        if ($httpCode !== 200) {
            $msg = $decoded['error']['message'] ?? "HTTP {$httpCode}";
            throw new RuntimeException("API error: {$msg}", $httpCode);
        }

        return $decoded;
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
    public function resolveMaxTokens(int $requested, string $model): int
    {
        $capabilities = ModelCapabilities::resolve($this->getId(), $model, $this->modelCapabilities);
        return min(max(1, $requested), $capabilities['max_output_tokens']);
    }

    private function extractApiErrorMessage(string $raw): string
    {
        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            return '';
        }

        return (string) ($decoded['error']['message'] ?? $decoded['message'] ?? '');
    }

    /**
     * Transform image blocks from the generic PromptEngine format
     * to OpenAI's vision format (image_url with base64 data URI).
     * Most compatible servers that support vision use this format.
     */
    private function transformMessagesForVision(array $messages): array
    {
        foreach ($messages as &$msg) {
            if (!is_array($msg['content'] ?? null)) {
                continue;
            }

            $transformed = [];
            foreach ($msg['content'] as $block) {
                if (($block['type'] ?? '') === 'image' && isset($block['source'])) {
                    $mediaType = $block['source']['media_type'] ?? 'image/jpeg';
                    $data = $block['source']['data'] ?? '';
                    $transformed[] = [
                        'type'      => 'image_url',
                        'image_url' => [
                            'url' => "data:{$mediaType};base64,{$data}",
                        ],
                    ];
                } else {
                    $transformed[] = $block;
                }
            }

            $msg['content'] = $transformed;
        }
        unset($msg);

        return $messages;
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
        return ModelCapabilities::resolve($this->getId(), $model, $this->modelCapabilities)['context_window'];
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

    /**
     * Build a tool definition from a custom JSON Schema.
     *
     * @param array  $schemaConfig  Must contain 'schema' (JSON Schema object)
     * @param string $toolName      The function name to use
     * @return array OpenAI-compatible tool definition
     */
    protected function buildToolFromSchema(array $schemaConfig, string $toolName): array
    {
        $schema = $schemaConfig['schema'] ?? $schemaConfig;
        unset($schema['tool_name'], $schema['description']);

        return [
            'type' => 'function',
            'function' => [
                'name' => $toolName,
                'description' => $schemaConfig['description'] ?? 'Return structured output.',
                'parameters' => $schema,
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

    /**
     * Forward a caller-supplied temperature (0–2). Most OpenAI-compatible
     * servers accept it; ones that do not return a 400 the caller sees.
     */
    private function applyTemperature(array &$payload, array $options): void
    {
        if (isset($options['temperature']) && is_numeric($options['temperature'])) {
            $payload['temperature'] = max(0.0, min(2.0, (float) $options['temperature']));
        }
    }
}
