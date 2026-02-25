<?php

declare(strict_types=1);

namespace VoxelSite\Providers;

use VoxelSite\AIProviderInterface;
use RuntimeException;

/**
 * Google Gemini AI provider.
 *
 * Uses the Gemini REST API with API key authentication.
 * Model listing via the /v1beta/models endpoint.
 *
 * API: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 * Models: https://generativelanguage.googleapis.com/v1beta/models
 */
class GeminiProvider implements AIProviderInterface
{
    private const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

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
        return 'gemini';
    }

    public function getName(): string
    {
        return 'Google Gemini';
    }

    public function getModels(): array
    {
        return [
            ['id' => 'gemini-2.0-flash',   'name' => 'Gemini 2.0 Flash',    'tier' => 'fast'],
            ['id' => 'gemini-2.0-flash-lite', 'name' => 'Gemini 2.0 Flash Lite', 'tier' => 'fast'],
            ['id' => 'gemini-1.5-pro',     'name' => 'Gemini 1.5 Pro',      'tier' => 'premium'],
            ['id' => 'gemini-1.5-flash',   'name' => 'Gemini 1.5 Flash',    'tier' => 'fast'],
        ];
    }

    /**
     * Fetch models from Google's models API.
     *
     * Filters to only include generateContent-capable models.
     */
    public function listModels(): array
    {
        if (empty($this->apiKey)) {
            return $this->getModels();
        }

        try {
            $url = self::BASE_URL . '/models?key=' . urlencode($this->apiKey) . '&pageSize=100';

            $ch = curl_init($url);
            curl_setopt_array($ch, [
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
            if (!is_array($data) || !isset($data['models'])) {
                return $this->getModels();
            }

            $models = [];
            foreach ($data['models'] as $model) {
                $name = $model['name'] ?? '';
                if (empty($name)) continue;

                // Only include models that support generateContent
                $methods = $model['supportedGenerationMethods'] ?? [];
                if (!in_array('generateContent', $methods) && !in_array('streamGenerateContent', $methods)) {
                    continue;
                }

                // Strip "models/" prefix from name
                $id = str_replace('models/', '', $name);

                // Skip legacy models
                if (str_starts_with($id, 'gemini-1.0') || str_starts_with($id, 'aqa')) {
                    continue;
                }

                $models[] = [
                    'id'         => $id,
                    'name'       => $model['displayName'] ?? $id,
                    'created_at' => '',
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

        $url = self::BASE_URL . '/models?key=' . urlencode($this->apiKey) . '&pageSize=1';

        $ch = curl_init($url);
        curl_setopt_array($ch, [
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
        if ($httpCode === 400 || $httpCode === 403) {
            throw new RuntimeException('authentication_error: API key is invalid (HTTP ' . $httpCode . ')');
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
                'placeholder' => 'AIza...',
                'required'    => true,
                'help_url'    => 'https://aistudio.google.com/apikey',
                'help_text'   => 'Get a key from Google AI Studio',
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
            // Minimal test: list models (cheap, no generation cost)
            $url = self::BASE_URL . '/models?key=' . urlencode($key) . '&pageSize=1';

            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 15,
                CURLOPT_CONNECTTIMEOUT => 10,
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
        $model = $options['model'] ?? $this->model ?? $this->getModels()[0]['id'];
        $maxTokens = $this->resolveMaxTokens((int) ($options['max_tokens'] ?? $this->maxTokens), (string) $model);
        $isStructured = !empty($options['structured_output']);
        $structuredFallbackTried = !empty($options['_structured_fallback_tried']);

        // Convert messages to Gemini format
        $contents = [];
        foreach ($messages as $msg) {
            $role = $msg['role'] === 'assistant' ? 'model' : 'user';
            $contents[] = [
                'role'  => $role,
                'parts' => [['text' => $msg['content']]],
            ];
        }

        $url = self::BASE_URL . "/models/{$model}:streamGenerateContent?alt=sse&key=" . urlencode($this->apiKey);

        $payload = [
            'contents'         => $contents,
            'systemInstruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            'generationConfig' => [
                'maxOutputTokens' => $maxTokens,
            ],
        ];
        if ($isStructured) {
            $payload['generationConfig']['responseMimeType'] = 'application/json';
            $payload['generationConfig']['responseSchema'] = $this->getStructuredResponseSchema();
        }

        $fullResponse = '';
        $usage = ['input_tokens' => 0, 'output_tokens' => 0];
        $errorBody = '';

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_TIMEOUT        => 900,
            CURLOPT_CONNECTTIMEOUT => 15,
            CURLOPT_LOW_SPEED_LIMIT => 1,
            CURLOPT_LOW_SPEED_TIME  => 180,
            CURLOPT_WRITEFUNCTION  => function ($ch, $data) use (&$fullResponse, &$usage, &$errorBody, $onToken) {
                $lines = explode("\n", $data);

                foreach ($lines as $line) {
                    $line = trim($line);
                    if ($line === '' || str_starts_with($line, 'event:')) continue;
                    if (!str_starts_with($line, 'data: ')) {
                        $errorBody .= $line;
                        continue;
                    }

                    $json = substr($line, 6);
                    $event = json_decode($json, true);
                    if (!is_array($event)) continue;

                    // Extract text from candidates
                    $text = $event['candidates'][0]['content']['parts'][0]['text'] ?? '';
                    if ($text !== '') {
                        $fullResponse .= $text;
                        $onToken($text);
                    }

                    // Usage metadata
                    if (isset($event['usageMetadata'])) {
                        $usage['input_tokens'] = $event['usageMetadata']['promptTokenCount'] ?? 0;
                        $usage['output_tokens'] = $event['usageMetadata']['candidatesTokenCount'] ?? 0;
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

        if ($isStructured && !$structuredFallbackTried && $this->shouldRetryWithoutSchema($httpCode, $errorBody) && empty($fullResponse)) {
            $fallbackOptions = $options;
            $fallbackOptions['structured_output'] = false;
            $fallbackOptions['_structured_fallback_tried'] = true;
            $this->stream($systemPrompt, $messages, $onToken, $onComplete, $fallbackOptions);
            return;
        }

        if (!empty($error)) {
            throw new RuntimeException("Gemini API connection failed: {$error}");
        }

        if ($httpCode === 429) throw new RuntimeException('rate_limited');
        if ($httpCode === 403) throw new RuntimeException('invalid_api_key');
        if ($httpCode >= 500) throw new RuntimeException('provider_unavailable');

        if ($httpCode !== 200 && empty($fullResponse)) {
            $apiMessage = $this->extractApiErrorMessage($errorBody);
            if ($apiMessage !== '') {
                throw new RuntimeException("Gemini API error (HTTP {$httpCode}): {$apiMessage}");
            }
            throw new RuntimeException("Gemini API returned HTTP {$httpCode}");
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
        $maxTokens = $this->resolveMaxTokens((int) ($options['max_tokens'] ?? $this->maxTokens), (string) $model);
        $isStructured = !empty($options['structured_output']);
        $structuredFallbackTried = !empty($options['_structured_fallback_tried']);

        $contents = [];
        foreach ($messages as $msg) {
            $role = $msg['role'] === 'assistant' ? 'model' : 'user';
            $contents[] = [
                'role'  => $role,
                'parts' => [['text' => $msg['content']]],
            ];
        }

        $url = self::BASE_URL . "/models/{$model}:generateContent?key=" . urlencode($this->apiKey);

        $payload = [
            'contents'         => $contents,
            'systemInstruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            'generationConfig' => [
                'maxOutputTokens' => $maxTokens,
            ],
        ];
        if ($isStructured) {
            $payload['generationConfig']['responseMimeType'] = 'application/json';
            $payload['generationConfig']['responseSchema'] = $this->getStructuredResponseSchema();
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 120,
            CURLOPT_CONNECTTIMEOUT => 10,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if (!empty($error)) {
            throw new RuntimeException("Gemini API connection failed: {$error}");
        }

        $decoded = json_decode($response, true);
        if (!is_array($decoded) || $httpCode !== 200) {
            $msg = $decoded['error']['message'] ?? "HTTP {$httpCode}";
            if ($isStructured && !$structuredFallbackTried && $this->shouldRetryWithoutSchema($httpCode, (string) json_encode($decoded))) {
                $fallbackOptions = $options;
                $fallbackOptions['structured_output'] = false;
                $fallbackOptions['_structured_fallback_tried'] = true;
                return $this->complete($systemPrompt, $messages, $fallbackOptions);
            }
            throw new RuntimeException("Gemini API error: {$msg}");
        }

        return $decoded['candidates'][0]['content']['parts'][0]['text'] ?? '';
    }

    public function estimateTokens(string $text): int
    {
        return (int) ceil(strlen($text) / 3.5);
    }

    /**
     * Conservative maxOutputTokens caps to avoid 400s across Gemini variants.
     */
    private function resolveMaxTokens(int $requested, string $model): int
    {
        $requested = max(1, $requested);
        $id = strtolower($model);

        if (str_contains($id, 'pro')) {
            return min($requested, 16384);
        }

        if (str_contains($id, 'flash')) {
            return min($requested, 8192);
        }

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

    private function shouldRetryWithoutSchema(int $httpCode, string $errorBody): bool
    {
        if (!in_array($httpCode, [400, 422], true)) {
            return false;
        }

        $msg = strtolower($this->extractApiErrorMessage($errorBody));
        if ($msg === '') {
            // Many schema validation failures return 400 with sparse bodies.
            return true;
        }

        return str_contains($msg, 'schema')
            || str_contains($msg, 'responseschema')
            || str_contains($msg, 'response schema')
            || str_contains($msg, 'responsemimetype')
            || str_contains($msg, 'json schema');
    }

    /**
     * Context window sizes for Gemini models (in tokens).
     *
     * Gemini models have very large context windows.
     */
    public function getContextWindow(string $model): int
    {
        $windows = [
            'gemini-2.0-flash'      => 1_048_576,
            'gemini-2.0-flash-lite' => 1_048_576,
            'gemini-1.5-pro'        => 2_097_152,
            'gemini-1.5-flash'      => 1_048_576,
        ];

        if (isset($windows[$model])) {
            return $windows[$model];
        }

        // Generous default — Gemini models tend to have very large windows
        return 1_048_576;
    }

    public function estimateCost(int $inputTokens, int $outputTokens, string $model): array
    {
        $pricing = [
            'gemini-2.0-flash'      => ['input' => 0.10, 'output' => 0.40],
            'gemini-2.0-flash-lite' => ['input' => 0.0,  'output' => 0.0],
            'gemini-1.5-pro'        => ['input' => 1.25, 'output' => 5.00],
            'gemini-1.5-flash'      => ['input' => 0.075, 'output' => 0.30],
        ];

        $rates = $pricing[$model] ?? $pricing['gemini-2.0-flash'];

        $inputCost = ($inputTokens / 1_000_000) * $rates['input'];
        $outputCost = ($outputTokens / 1_000_000) * $rates['output'];

        return [
            'input_cost'  => round($inputCost, 6),
            'output_cost' => round($outputCost, 6),
            'total_cost'  => round($inputCost + $outputCost, 6),
        ];
    }

    /**
     * Gemini response schema for deterministic operation payloads.
     *
     * @return array<string, mixed>
     */
    private function getStructuredResponseSchema(): array
    {
        return [
            'type' => 'OBJECT',
            'required' => ['assistant_message', 'operations'],
            'properties' => [
                'assistant_message' => [
                    'type' => 'STRING',
                ],
                'operations' => [
                    'type' => 'ARRAY',
                    'items' => [
                        'type' => 'OBJECT',
                        'required' => ['path', 'action'],
                        'properties' => [
                            'path' => ['type' => 'STRING'],
                            'action' => [
                                'type' => 'STRING',
                                'enum' => ['write', 'delete', 'merge'],
                            ],
                            'content' => ['type' => 'STRING'],
                        ],
                    ],
                ],
            ],
        ];
    }
}
