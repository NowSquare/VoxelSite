<?php

declare(strict_types=1);

namespace VoxelSite\Providers;

use VoxelSite\AIProviderInterface;
use RuntimeException;

/**
 * OpenAI GPT provider.
 *
 * Supports GPT-4o, o1, o3, and future models via the Chat Completions
 * API with SSE streaming. Model listing uses the /v1/models endpoint.
 *
 * API: https://api.openai.com/v1/chat/completions
 * Models: https://api.openai.com/v1/models
 */
class OpenAIProvider implements AIProviderInterface
{
    private const API_URL = 'https://api.openai.com/v1/chat/completions';
    private const MODELS_URL = 'https://api.openai.com/v1/models';
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
        return 'openai';
    }

    public function getName(): string
    {
        return 'OpenAI';
    }

    public function getModels(): array
    {
        return [
            ['id' => 'gpt-4o',     'name' => 'GPT-4o',      'tier' => 'balanced'],
            ['id' => 'gpt-4o-mini', 'name' => 'GPT-4o Mini', 'tier' => 'fast'],
            ['id' => 'o3-mini',     'name' => 'o3 Mini',     'tier' => 'fast'],
        ];
    }

    /**
     * Fetch models live from OpenAI's API.
     *
     * Filters to only include chat-capable models (gpt-*, o1-*, o3-*).
     * Excludes embedding, TTS, whisper, dall-e, and moderation models.
     */
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

            // Filter to chat-capable models only
            $chatPrefixes = ['gpt-4', 'gpt-3.5', 'o1', 'o3', 'o4', 'chatgpt'];
            $excludePrefixes = ['gpt-4-base', 'gpt-4o-realtime', 'gpt-4o-audio', 'gpt-4o-mini-realtime', 'gpt-4o-mini-audio'];

            $models = [];
            foreach ($data['data'] as $model) {
                $id = $model['id'] ?? '';
                if (empty($id)) continue;

                // Must start with a chat-capable prefix
                $isChatModel = false;
                foreach ($chatPrefixes as $prefix) {
                    if (str_starts_with($id, $prefix)) {
                        $isChatModel = true;
                        break;
                    }
                }
                if (!$isChatModel) continue;

                // Skip known non-chat variants
                $isExcluded = false;
                foreach ($excludePrefixes as $excl) {
                    if (str_starts_with($id, $excl)) {
                        $isExcluded = true;
                        break;
                    }
                }
                if ($isExcluded) continue;

                $models[] = [
                    'id'         => $id,
                    'name'       => $this->formatModelName($id),
                    'created_at' => isset($model['created']) ? date('Y-m-d\TH:i:s\Z', $model['created']) : '',
                ];
            }

            // Sort newest first
            usort($models, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));

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

        // Reuse listModels() parse logic — on success the data is valid
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
                'help_url'    => 'https://platform.openai.com/api-keys',
                'help_text'   => 'Get a key from OpenAI Platform',
            ],
        ];
    }

    public function validateConfig(array $config): bool
    {
        $key = $config['api_key'] ?? '';
        if (empty($key) || !str_starts_with($key, 'sk-')) {
            return false;
        }

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

    public function stream(
        string $systemPrompt,
        array $messages,
        callable $onToken,
        callable $onComplete,
        array $options = []
    ): void {
        $model = $options['model'] ?? $this->model ?? $this->getModels()[0]['id'];
        $maxTokens = $options['max_tokens'] ?? $this->maxTokens;
        $isStructured = !empty($options['structured_output']);

        // Prepend system message
        array_unshift($messages, ['role' => 'system', 'content' => $systemPrompt]);

        $payload = [
            'model'      => $model,
            'max_tokens' => $maxTokens,
            'messages'   => $messages,
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
            CURLOPT_WRITEFUNCTION  => function ($ch, $data) use (&$fullResponse, &$usage, &$toolArgsByIndex, &$toolNamesByIndex, $isStructured, $onToken) {
                $lines = explode("\n", $data);

                foreach ($lines as $line) {
                    $line = trim($line);
                    if (empty($line) || !str_starts_with($line, 'data: ')) continue;

                    $json = substr($line, 6);
                    if ($json === '[DONE]') continue;

                    $event = json_decode($json, true);
                    if (!is_array($event)) continue;

                    // Extract text from delta
                    $delta = $event['choices'][0]['delta'] ?? [];
                    $text = $delta['content'] ?? '';
                    if ($text !== '') {
                        $fullResponse .= $text;
                        $onToken($text);
                    }

                    // Structured mode: collect tool call argument chunks.
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

                    // Usage info (OpenAI includes it in the final chunk)
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

        if (!empty($error)) {
            throw new RuntimeException("OpenAI API connection failed: {$error}");
        }

        if ($httpCode === 429) throw new RuntimeException('rate_limited');
        if ($httpCode === 401) throw new RuntimeException('invalid_api_key');
        if ($httpCode >= 500) throw new RuntimeException('provider_unavailable');

        if ($httpCode !== 200 && empty($fullResponse)) {
            throw new RuntimeException("OpenAI API returned HTTP {$httpCode}");
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
        $model = $options['model'] ?? $this->model ?? $this->getModels()[0]['id'];
        $maxTokens = $options['max_tokens'] ?? $this->maxTokens;
        $isStructured = !empty($options['structured_output']);

        array_unshift($messages, ['role' => 'system', 'content' => $systemPrompt]);

        $payload = [
            'model'      => $model,
            'max_tokens' => $maxTokens,
            'messages'   => $messages,
        ];
        if ($isStructured) {
            $payload['tools'] = [$this->getStructuredToolDefinition()];
            $payload['tool_choice'] = [
                'type' => 'function',
                'function' => ['name' => self::STRUCTURED_TOOL_NAME],
            ];
        }

        $response = $this->apiCall($payload);

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
     * Context window sizes for OpenAI models (in tokens).
     */
    public function getContextWindow(string $model): int
    {
        $windows = [
            'gpt-4o'      => 128_000,
            'gpt-4o-mini' => 128_000,
            'gpt-4-turbo' => 128_000,
            'o1'          => 200_000,
            'o1-mini'     => 128_000,
            'o3-mini'     => 200_000,
        ];

        // Exact match first
        if (isset($windows[$model])) {
            return $windows[$model];
        }

        // Prefix match for versioned model IDs (e.g. gpt-4o-2024-08-06)
        foreach ($windows as $prefix => $size) {
            if (str_starts_with($model, $prefix)) {
                return $size;
            }
        }

        return 128_000;
    }

    public function estimateCost(int $inputTokens, int $outputTokens, string $model): array
    {
        $pricing = [
            'gpt-4o'      => ['input' => 2.50, 'output' => 10.00],
            'gpt-4o-mini' => ['input' => 0.15, 'output' => 0.60],
            'o3-mini'     => ['input' => 1.10, 'output' => 4.40],
        ];

        $rates = $pricing[$model] ?? $pricing['gpt-4o'];

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
            throw new RuntimeException("OpenAI API connection failed: {$error}");
        }

        $decoded = json_decode($response, true);
        if (!is_array($decoded)) {
            throw new RuntimeException("Invalid response from OpenAI API (HTTP {$httpCode})");
        }

        if ($httpCode !== 200) {
            $msg = $decoded['error']['message'] ?? "HTTP {$httpCode}";
            throw new RuntimeException("OpenAI API error: {$msg}");
        }

        return $decoded;
    }

    /**
     * Format a model ID into a human-readable name.
     */
    private function formatModelName(string $id): string
    {
        $map = [
            'gpt-4o' => 'GPT-4o',
            'gpt-4o-mini' => 'GPT-4o Mini',
            'gpt-4-turbo' => 'GPT-4 Turbo',
            'gpt-3.5-turbo' => 'GPT-3.5 Turbo',
            'o1' => 'o1',
            'o1-mini' => 'o1 Mini',
            'o1-preview' => 'o1 Preview',
            'o3-mini' => 'o3 Mini',
            'chatgpt-4o-latest' => 'ChatGPT-4o Latest',
        ];

        return $map[$id] ?? $id;
    }

    /**
     * Structured tool contract for deterministic file operations.
     *
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
