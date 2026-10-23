<?php
declare(strict_types=1);

namespace VoxelSite;

/**
 * Shared limits for request payloads, context planning, and Settings disclosure.
 * Metadata is keyed by exact model ID and scoped to the provider/endpoint by its caller.
 */
final class ModelCapabilities
{
    /**
     * Snapshot verified 2026-10-20. Never extrapolate new versions from these IDs.
     * https://developers.openai.com/api/docs/models/gpt-6.1-sol
     * https://platform.claude.com/docs/en/models/overview
     * https://api-docs.deepseek.com/api/create-chat-completion/
     * https://api-docs.deepseek.com/quick_start/pricing/
     */
    private const DOCUMENTED = [
        'openai' => [
            'gpt-6.1-sol' => [128000, 1050000],
        ],
        'claude' => [
            'claude-fable-5-1' => [128000, 1000000],
            'claude-opus-5-5' => [128000, 1000000],
            'claude-sonnet-5-5' => [128000, 1000000],
            'claude-haiku-5-5' => [128000, 1000000],
        ],
        'deepseek' => [
            'deepseek-flash' => [393216, 1000000],
            'deepseek-v4-pro' => [393216, 1000000],
        ],
    ];

    /** Existing provider getModels() defaults, without constructing a provider. */
    public static function defaultModel(string $providerId): string
    {
        return match($providerId) {
            'claude'=>'claude-sonnet-4-5-20250514','openai'=>'gpt-5','gemini'=>'gemini-2.0-flash',
            'deepseek'=>'deepseek-chat','openai_compatible'=>'',
            default=>throw new \InvalidArgumentException('Unknown provider.'),
        };
    }

    /**
     * @param array<string, array{max_output_tokens?: int, context_window?: int, source?: string}> $capabilities
     * @return array{max_output_tokens: int, context_window: int, source: string}
     */
    public static function resolve(string $providerId, string $model, array $capabilities = []): array
    {
        $known = self::DOCUMENTED[$providerId][$model] ?? null;
        [$output, $context] = $known ?? self::fallback($providerId, $model);
        $result = [
            'max_output_tokens' => $output,
            'context_window' => $context,
            'source' => $known === null ? 'fallback' : 'documented',
        ];
        $metadata = $capabilities[$model] ?? [];
        if (!is_array($metadata)) {
            return $result;
        }
        foreach (['max_output_tokens', 'context_window'] as $field) {
            if (self::positiveInteger($metadata[$field] ?? null)) {
                $result[$field] = $metadata[$field];
                $result['source'] = ($metadata['source'] ?? '') === 'override' ? 'override' : 'metadata';
            }
        }
        return $result;
    }

    /**
     * Keep only explicit token-limit fields documented by a model-list API.
     * Input limits are used conservatively as context windows; output reservation
     * remains subtracted by the engine, rather than inflating combined capacity.
     *
     * @return array{max_output_tokens?: int, context_window?: int}
     */
    public static function fromModelMetadata(string $providerId, array $model): array
    {
        $values = match ($providerId) {
            'claude' => [
                'max_output_tokens' => $model['max_tokens'] ?? null,
                'context_window' => $model['max_input_tokens'] ?? null,
            ],
            'gemini' => [
                'max_output_tokens' => $model['outputTokenLimit'] ?? null,
                'context_window' => $model['inputTokenLimit'] ?? null,
            ],
            'openai_compatible' => [
                'max_output_tokens' => $model['max_output_tokens'] ?? $model['top_provider']['max_completion_tokens'] ?? null,
                'context_window' => $model['context_window'] ?? $model['context_length'] ?? null,
            ],
            default => [],
        };
        return array_filter($values, self::positiveInteger(...));
    }

    private static function positiveInteger(mixed $value): bool
    {
        return is_int($value) && $value > 0;
    }

    /** Existing conservative limits remain fallbacks, not claims about model capacity. */
    private static function fallback(string $providerId, string $model): array
    {
        $id = strtolower($model);
        if ($providerId === 'openai_compatible') {
            // Friendly aliases do not prove the upstream model or server capacity.
            $output = preg_match('/^o\d/', $id) === 1 ? 32000
                : ((str_starts_with($id, 'gpt-') || str_starts_with($id, 'chatgpt-')) ? 16384 : 8192);
            return [$output, 32000];
        }
        if ($providerId === 'deepseek') {
            $legacy = str_contains($id, 'reasoner') || str_contains($id, 'r1')
                || str_contains($id, 'chat') || str_contains($id, 'v3');
            return [$legacy ? 16384 : 8192, 64000];
        }
        if ($providerId === 'gemini') {
            return [
                str_contains($id, 'pro') ? 16384 : 8192,
                $id === 'gemini-1.5-pro' ? 2097152 : 1048576,
            ];
        }
        if ($providerId === 'claude') {
            if (str_contains($id, 'opus')) {
                $output = str_contains($id, '4-6') || str_contains($id, '4.6') ? 128000
                    : ((str_contains($id, '4-5') || str_contains($id, '4.5')) ? 64000 : 32768);
                return [$output, 200000];
            }
            if (str_contains($id, 'haiku')) { return [8192, 200000]; }
            if (str_contains($id, 'sonnet')) { return [64000, 200000]; }
            return [16384, 128000];
        }
        if ($providerId === 'openai') {
            $output = str_starts_with($id, 'gpt-5')
                ? (str_contains($id, '-chat-latest') ? 16384 : 128000)
                : (preg_match('/^o\d/', $id) === 1 ? 32000 : 16384);
            $windows = [
                'gpt-5.4-mini' => 400000, 'gpt-5.4-nano' => 400000,
                'gpt-5.4' => 1050000, 'gpt-5.5' => 1050000,
                'gpt-5-chat' => 128000, 'gpt-5.1-chat' => 128000,
                'gpt-5' => 400000,
                'o1-mini' => 128000, 'o1' => 200000, 'o3-mini' => 200000,
            ];
            foreach ($windows as $prefix => $context) {
                if (str_starts_with($id, $prefix)) { return [$output, $context]; }
            }
            return [$output, 128000];
        }
        return [8192, 32000];
    }
}
