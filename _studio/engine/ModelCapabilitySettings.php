<?php
declare(strict_types=1);

namespace VoxelSite;

use RuntimeException;

/** Validated model limits, scoped to the provider and compatible server. */
final class ModelCapabilitySettings
{
    private const CACHE_KEY = 'ai_model_capability_cache';
    public const OVERRIDES_KEY = 'ai_openai_compatible_model_limits';

    public static function normalizeBaseUrl(string $url): string
    {
        $url = rtrim(trim($url) ?: 'http://localhost:11434', '/');
        return preg_match('#/v\d+$#', $url) ? $url : $url . '/v1';
    }

    public static function validateMaxTokens(mixed $value): int
    {
        if (!is_int($value) || $value < 1000 || $value > 128000) {
            throw new RuntimeException('Max Output Tokens must be a whole number from 1,000 to 128,000.', 422);
        }
        return $value;
    }

    private static function validLimits(mixed $value): bool
    {
        if (!is_array($value)) { return false; }
        foreach (['max_output_tokens' => 2000000, 'context_window' => 10000000] as $key => $maximum) {
            if (!is_int($value[$key] ?? null) || $value[$key] < 1 || $value[$key] > $maximum) {
                return false;
            }
        }
        return $value['max_output_tokens'] <= $value['context_window'];
    }

    public static function validateOverrides(mixed $value, string $baseUrl): array
    {
        if (!is_array($value) || !is_string($value['base_url'] ?? null)
            || !is_array($value['models'] ?? null) || count($value['models']) > 200) {
            throw new RuntimeException('Model limits must include a server URL and a model list.', 422);
        }
        $url = self::normalizeBaseUrl($baseUrl);
        if (self::normalizeBaseUrl($value['base_url']) !== $url) {
            throw new RuntimeException('Model limits belong to a different server URL. Enter limits for this server.', 422);
        }
        $models = [];
        foreach ($value['models'] as $model => $limits) {
            if (!is_string($model) || trim($model) === '' || strlen($model) > 256
                || preg_match('/[\x00-\x1F\x7F]/', $model) || !self::validLimits($limits)) {
                throw new RuntimeException('Enter positive whole numbers: output up to 2,000,000 and context up to 10,000,000. Output cannot exceed context.', 422);
            }
            $models[$model] = [
                'max_output_tokens' => $limits['max_output_tokens'],
                'context_window' => $limits['context_window'],
            ];
        }
        return ['base_url' => $url, 'models' => $models];
    }

    public static function forProvider(Settings $settings, string $provider, string $baseUrl = '', ?array $overrides = null): array
    {
        $cache = $settings->get(self::CACHE_KEY, []);
        $entry = is_array($cache) ? ($cache[$provider] ?? []) : [];
        $url = $provider === 'openai_compatible' ? self::normalizeBaseUrl($baseUrl) : '';
        $models = [];
        // A failed discovery leaves the last successful metadata usable, but a
        // different compatible endpoint never inherits it.
        if (is_array($entry) && ($entry['base_url'] ?? '') === $url) {
            foreach ((array) ($entry['models'] ?? []) as $id => $limits) {
                if (self::validLimits($limits)) {
                    $models[$id] = $limits + ['source' => 'metadata'];
                }
            }
        }
        if ($provider === 'openai_compatible') {
            $overrides ??= $settings->get(self::OVERRIDES_KEY, []);
            if (is_array($overrides) && ($overrides['base_url'] ?? '') === $url) {
                foreach ((array) ($overrides['models'] ?? []) as $id => $limits) {
                    if (self::validLimits($limits)) {
                        $models[$id] = [
                            'max_output_tokens' => $limits['max_output_tokens'],
                            'context_window' => $limits['context_window'],
                            'source' => 'override',
                        ];
                    }
                }
            }
        }
        return $models;
    }

    public static function recordModels(Settings $settings, string $provider, string $baseUrl, array $models): void
    {
        $valid = [];
        foreach ($models as $model) {
            if (!is_array($model) || !is_string($model['id'] ?? null) || $model['id'] === ''
                || strlen($model['id']) > 256 || !self::validLimits($model)) {
                continue;
            }
            $valid[$model['id']] = [
                'max_output_tokens' => $model['max_output_tokens'],
                'context_window' => $model['context_window'],
            ];
            if (count($valid) >= 1000) { break; }
        }
        if ($valid === []) { return; }
        $cache = $settings->get(self::CACHE_KEY, []);
        $cache = is_array($cache) ? $cache : [];
        $cache[$provider] = [
            'base_url' => $provider === 'openai_compatible' ? self::normalizeBaseUrl($baseUrl) : '',
            'models' => $valid,
        ];
        $settings->set(self::CACHE_KEY, $cache);
    }
}
