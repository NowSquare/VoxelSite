<?php

declare(strict_types=1);

namespace VoxelSite;

use RuntimeException;

/**
 * Factory for creating AI provider instances.
 *
 * Reads the configured provider from Settings and instantiates
 * the appropriate class. Supports Claude, OpenAI, Gemini, DeepSeek,
 * and any OpenAI-compatible server.
 */
class AIProviderFactory
{
    /** @var array<string, class-string<AIProviderInterface>> */
    private static array $providers = [
        'claude'            => Providers\ClaudeProvider::class,
        'openai'            => Providers\OpenAIProvider::class,
        'gemini'            => Providers\GeminiProvider::class,
        'deepseek'          => Providers\DeepSeekProvider::class,
        'openai_compatible' => Providers\OpenAICompatibleProvider::class,
    ];

    /**
     * Create an AI provider instance from current settings.
     *
     * Reads provider type, API key (decrypted), and model from
     * the settings table. Returns a fully configured provider
     * ready to stream or complete.
     */
    public static function create(?Settings $settings = null, ?Encryption $encryption = null): AIProviderInterface
    {
        $settings = $settings ?? new Settings();
        $providerId = $settings->get('ai_provider', 'claude');

        if (!isset(self::$providers[$providerId])) {
            throw new RuntimeException(
                "Unknown AI provider: '{$providerId}'. Available: " . implode(', ', array_keys(self::$providers))
            );
        }

        // Decrypt the API key
        $config = loadConfig();
        if ($config === null || empty($config['app_key'])) {
            throw new RuntimeException(
                'APP_KEY not found in config.json. Re-run the installer.'
            );
        }

        $encryption = $encryption ?? new Encryption($config['app_key']);

        $encryptedKey = $settings->get("ai_{$providerId}_api_key");

        // OpenAI Compatible doesn't require an API key (local servers)
        if (empty($encryptedKey) && $providerId !== 'openai_compatible') {
            throw new RuntimeException(
                "No API key configured for {$providerId}. Add one in Settings → AI Provider."
            );
        }

        $apiKey = !empty($encryptedKey) ? $encryption->decrypt($encryptedKey) : '';
        $model = $settings->get("ai_{$providerId}_model", '');
        $maxTokens = (int) $settings->get('ai_max_tokens', 32000);

        $providerClass = self::$providers[$providerId];

        // OpenAI Compatible needs base_url
        if ($providerId === 'openai_compatible') {
            $baseUrl = $settings->get('ai_openai_compatible_base_url', '');
            return new $providerClass($apiKey, $model, $maxTokens, $baseUrl);
        }

        return new $providerClass($apiKey, $model, $maxTokens);
    }

    /**
     * Create a provider with an explicit API key (for testing connections).
     *
     * Used during installation and settings when the key hasn't
     * been saved yet.
     */
    public static function createWithKey(string $providerId, string $apiKey, string $model = '', string $baseUrl = ''): AIProviderInterface
    {
        if (!isset(self::$providers[$providerId])) {
            throw new RuntimeException("Unknown AI provider: '{$providerId}'.");
        }

        $providerClass = self::$providers[$providerId];

        // OpenAI Compatible needs base_url
        if ($providerId === 'openai_compatible') {
            return new $providerClass($apiKey, $model ?: null, 32000, $baseUrl);
        }

        return new $providerClass($apiKey, $model ?: null, 32000);
    }

    /**
     * Get metadata for all registered providers.
     *
     * @return array<string, array{id: string, name: string, models: array, config_fields: array}>
     */
    public static function listProviders(): array
    {
        $list = [];
        foreach (self::$providers as $id => $class) {
            try {
                if ($id === 'openai_compatible') {
                    $instance = new $class('', null, 0, '');
                } else {
                    $instance = new $class('', null, 0);
                }
                $list[$id] = [
                    'id'            => $instance->getId(),
                    'name'          => $instance->getName(),
                    'models'        => $instance->getModels(),
                    'config_fields' => $instance->getConfigFields(),
                ];
            } catch (\Throwable) {
                $list[$id] = ['id' => $id, 'name' => $id, 'models' => [], 'config_fields' => []];
            }
        }

        return $list;
    }

    /**
     * Fetch live models for a provider using an API key.
     *
     * Used by the installer and settings page to populate the
     * model dropdown after API key verification.
     *
     * @return array<int, array{id: string, name: string, created_at?: string}>
     */
    public static function fetchModels(string $providerId, string $apiKey, string $baseUrl = ''): array
    {
        $provider = self::createWithKey($providerId, $apiKey, '', $baseUrl);
        return $provider->listModels();
    }
}
