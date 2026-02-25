<?php

declare(strict_types=1);

namespace VoxelSite\Providers;

use VoxelSite\AIProviderInterface;
use RuntimeException;

/**
 * DeepSeek AI provider.
 *
 * Uses the OpenAI-compatible API format hosted at api.deepseek.com.
 * Supports DeepSeek-V3, DeepSeek-R1, and future models.
 *
 * API: https://api.deepseek.com/v1/chat/completions
 * Models: https://api.deepseek.com/v1/models
 */
class DeepSeekProvider implements AIProviderInterface
{
    private const API_URL = 'https://api.deepseek.com/v1/chat/completions';
    private const MODELS_URL = 'https://api.deepseek.com/v1/models';
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
        return 'deepseek';
    }

    public function getName(): string
    {
        return 'DeepSeek';
    }

    public function getModels(): array
    {
        return [
            ['id' => 'deepseek-chat',     'name' => 'DeepSeek V3',        'tier' => 'balanced'],
            ['id' => 'deepseek-reasoner', 'name' => 'DeepSeek R1',        'tier' => 'premium'],
        ];
    }

    public function listModels(): array
    {
        if (empty($this->apiKey)) {
            return $this->getModels();
        }

        try {
            $ch = curl_init(self::MODELS_URL);
            curl_setopt_array($ch, [
                CURLOPT_HTTPHEADER     => [
                    'Authorization: Bearer ' . $this->apiKey,
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
                if (!$this->isChatCompletionsModel($id)) continue;

                $models[] = [
                    'id'         => $id,
                    'name'       => $this->formatModelName($id),
                    'created_at' => isset($model['created']) ? date('Y-m-d\TH:i:s\Z', $model['created']) : '',
                ];
            }

            return $models ?: $this->getModels();
        } catch (\Throwable) {
            return $this->getModels();
        }
    }

    public function testConnection(): array
    {
        if (empty($this->apiKey)) {
            throw new RuntimeException('No API key provided.');
        }

        $ch = curl_init(self::MODELS_URL);
        curl_setopt_array($ch, [
            CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $this->apiKey],
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

        return $this->listModels();
    }

    public function getConfigFields(): array
    {
        return [
            [
                'key'         => 'api_key',
                'label'       => 'API Key',
                'type'        => 'password',
                'placeholder' => 'sk-...',
                'required'    => true,
                'help_url'    => 'https://platform.deepseek.com/api_keys',
                'help_text'   => 'Get a key from DeepSeek Platform',
            ],
        ];
    }

    public function validateConfig(array $config): bool
    {
        $key = $config['api_key'] ?? '';
        if (empty($key)) {
            return false;
        }

        try {
            $model = $this->resolveRuntimeModel((string) ($config['model'] ?? $this->getModels()[0]['id']));
            $response = $this->apiCall([
                'model'      => $model,
                'max_tokens' => $this->resolveMaxTokens(10, $model),
                'messages'   => [['role' => 'user', 'content' => 'Hi']],
            ]);

            return isset($response['id']);
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
        $model = $this->resolveRuntimeModel((string) ($options['model'] ?? $this->model ?? $this->getModels()[0]['id']));
        $maxTokens = $this->resolveMaxTokens((int) ($options['max_tokens'] ?? $this->maxTokens), $model);
        $isStructured = !empty($options['structured_output']);
        $structuredFallbackTried = !empty($options['_structured_fallback_tried']);

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
        $toolArgsByIndex = [];
        $toolNamesByIndex = [];
        $errorBody = '';

        $ch = curl_init(self::API_URL);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->apiKey,
            ],
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_TIMEOUT        => 900,
            CURLOPT_CONNECTTIMEOUT => 15,
            CURLOPT_LOW_SPEED_LIMIT => 1,
            CURLOPT_LOW_SPEED_TIME  => 180,
            CURLOPT_WRITEFUNCTION  => function ($ch, $data) use (&$fullResponse, &$usage, &$toolArgsByIndex, &$toolNamesByIndex, &$errorBody, $isStructured, $onToken) {
                $lines = explode("\n", $data);

                foreach ($lines as $line) {
                    $line = trim($line);
                    if ($line === '') continue;
                    if (!str_starts_with($line, 'data: ')) {
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

        $startTime = microtime(true);
        curl_exec($ch);

        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        $durationMs = (int) ((microtime(true) - $startTime) * 1000);

        if ($isStructured && !$structuredFallbackTried && $this->shouldRetryWithoutTools($httpCode, $errorBody) && empty($fullResponse)) {
            $fallbackOptions = $options;
            $fallbackOptions['structured_output'] = false;
            $fallbackOptions['_structured_fallback_tried'] = true;
            $this->stream($systemPrompt, $messages, $onToken, $onComplete, $fallbackOptions);
            return;
        }

        if (!empty($error)) {
            throw new RuntimeException("DeepSeek API connection failed: {$error}");
        }

        if ($httpCode === 429) throw new RuntimeException('rate_limited');
        if ($httpCode === 401) throw new RuntimeException('invalid_api_key');
        if ($httpCode >= 500) throw new RuntimeException('provider_unavailable');

        if ($httpCode !== 200 && empty($fullResponse)) {
            $apiMessage = $this->extractApiErrorMessage($errorBody);
            if ($apiMessage !== '') {
                throw new RuntimeException("DeepSeek API error (HTTP {$httpCode}): {$apiMessage}");
            }
            throw new RuntimeException("DeepSeek API returned HTTP {$httpCode}");
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
        $model = $this->resolveRuntimeModel((string) ($options['model'] ?? $this->model ?? $this->getModels()[0]['id']));
        $maxTokens = $this->resolveMaxTokens((int) ($options['max_tokens'] ?? $this->maxTokens), $model);
        $isStructured = !empty($options['structured_output']);
        $structuredFallbackTried = !empty($options['_structured_fallback_tried']);

        $requestMessages = $messages;
        array_unshift($requestMessages, ['role' => 'system', 'content' => $systemPrompt]);

        $payload = [
            'model'      => $model,
            'max_tokens' => $maxTokens,
            'messages'   => $requestMessages,
        ];
        if ($isStructured) {
            $payload['tools'] = [$this->getStructuredToolDefinition()];
            $payload['tool_choice'] = [
                'type' => 'function',
                'function' => ['name' => self::STRUCTURED_TOOL_NAME],
            ];
        }

        try {
            $response = $this->apiCall($payload);
        } catch (\Throwable $e) {
            $msg = strtolower($e->getMessage());
            if ($isStructured && !$structuredFallbackTried && (
                str_contains($msg, 'http 400')
                || str_contains($msg, 'http 404')
                || str_contains($msg, 'http 422')
                || str_contains($msg, 'tool')
                || str_contains($msg, 'function')
            )) {
                $fallbackOptions = $options;
                $fallbackOptions['structured_output'] = false;
                $fallbackOptions['_structured_fallback_tried'] = true;
                return $this->complete($systemPrompt, $messages, $fallbackOptions);
            }
            throw $e;
        }

        if ($isStructured) {
            $toolArgs = $response['choices'][0]['message']['tool_calls'][0]['function']['arguments'] ?? '';
            if (is_string($toolArgs) && trim($toolArgs) !== '') {
                return $this->normalizeStructuredPayload($toolArgs);
            }
        }

        return $response['choices'][0]['message']['content'] ?? '';
    }

    public function estimateTokens(string $text): int
    {
        return (int) ceil(strlen($text) / 3.5);
    }

    /**
     * Conservative output caps to avoid max_tokens 400s on future model variants.
     */
    private function resolveMaxTokens(int $requested, string $model): int
    {
        $requested = max(1, $requested);
        $id = strtolower($model);

        if (str_contains($id, 'reasoner') || str_contains($id, 'r1')) {
            return min($requested, 16384);
        }

        if (str_contains($id, 'chat') || str_contains($id, 'v3')) {
            return min($requested, 16384);
        }

        return min($requested, 8192);
    }

    /**
     * Context window sizes for DeepSeek models (in tokens).
     */
    public function getContextWindow(string $model): int
    {
        // Both DeepSeek V3 and R1 have 64K context windows
        return 64_000;
    }

    public function estimateCost(int $inputTokens, int $outputTokens, string $model): array
    {
        $pricing = [
            'deepseek-chat'     => ['input' => 0.27, 'output' => 1.10],
            'deepseek-reasoner' => ['input' => 0.55, 'output' => 2.19],
        ];

        $rates = $pricing[$model] ?? $pricing['deepseek-chat'];

        $inputCost = ($inputTokens / 1_000_000) * $rates['input'];
        $outputCost = ($outputTokens / 1_000_000) * $rates['output'];

        return [
            'input_cost'  => round($inputCost, 6),
            'output_cost' => round($outputCost, 6),
            'total_cost'  => round($inputCost + $outputCost, 6),
        ];
    }

    private function apiCall(array $payload): array
    {
        $ch = curl_init(self::API_URL);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->apiKey,
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 120,
            CURLOPT_CONNECTTIMEOUT => 10,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if (!empty($error)) {
            throw new RuntimeException("DeepSeek API connection failed: {$error}");
        }

        $decoded = json_decode($response, true);
        if (!is_array($decoded)) {
            throw new RuntimeException("Invalid response from DeepSeek API (HTTP {$httpCode})");
        }

        if ($httpCode !== 200) {
            $msg = $decoded['error']['message'] ?? "HTTP {$httpCode}";
            throw new RuntimeException("DeepSeek API error: {$msg}");
        }

        return $decoded;
    }

    private function isChatCompletionsModel(string $id): bool
    {
        $idLower = strtolower($id);

        $excluded = [
            'embed',
            'embedding',
            'rerank',
            'tts',
            'speech',
            'audio',
            'transcribe',
            'asr',
            'image',
            'moderation',
        ];
        foreach ($excluded as $needle) {
            if (str_contains($idLower, $needle)) {
                return false;
            }
        }

        // Future-proof: if it isn't obviously a non-chat model, allow it.
        return true;
    }

    private function resolveRuntimeModel(string $model): string
    {
        $model = trim($model);
        if ($model === '') {
            return $this->getModels()[0]['id'];
        }

        return $this->isChatCompletionsModel($model) ? $model : $this->getModels()[0]['id'];
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
            // 400/422 with no parsable body often means unsupported tools/function calling.
            return true;
        }

        return str_contains($msg, 'tool')
            || str_contains($msg, 'function')
            || str_contains($msg, 'tool_choice')
            || str_contains($msg, 'tools');
    }

    private function formatModelName(string $id): string
    {
        $map = [
            'deepseek-chat'     => 'DeepSeek V3',
            'deepseek-reasoner' => 'DeepSeek R1',
        ];

        return $map[$id] ?? $id;
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
