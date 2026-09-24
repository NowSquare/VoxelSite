<?php

declare(strict_types=1);

namespace VoxelSite;

/** Configuration only. Does not route turns, construct providers, or call Jev. */
final class RouterSettings
{
    private \Closure $encryptionFactory;

    public function __construct(private Settings $settings, ?callable $encryptionFactory = null)
    {
        $this->encryptionFactory = $encryptionFactory !== null ? \Closure::fromCallable($encryptionFactory) : static function (): Encryption {
            $config = loadConfig();
            return new Encryption($config['app_key'] ?? '');
        };
    }

    /** Safe state for Studio/Agent reads. Invalid active modes never become off. */
    public function publicStatus(): array
    {
        $this->settings->clearCache();
        $mode = $this->settings->get('governor.mode', 'off');
        $stored = $this->settings->get(RouterSecrets::KEY);
        $error = null;
        try {
            $this->validateMode($mode);
            if ($mode !== 'off') { $this->requireKey($stored); }
        } catch (\RuntimeException $e) {
            $error = ['code' => 'governor_configuration', 'message' => $e->getMessage()];
        }
        $mapError = null;
        try {
            $this->validateModelMap($this->settings->get('governor.model_map', []), $this->settings->get('ai_provider', 'claude'));
        } catch (\RuntimeException) {
            $mapError = ['code' => 'governor_model_map', 'message' => 'The saved models do not match your AI provider. Choose both models again and save AI Router. Until then, edits use your default model.'];
        }
        return [
            'governor.mode' => in_array($mode, ['off', 'shadow', 'enforce'], true) ? $mode : null,
            'governor.typesafe_configured' => is_string($stored) && $stored !== '',
            'governor.configuration_error' => $error,
            'governor.model_map_error' => $mapError,
        ];
    }

    /**
     * Validate the complete Router delta before the endpoint's atomic setMany.
     * A null/empty key clears it; active modes must be turned off in that same PUT.
     * No request values appear in validation errors or diagnostic messages.
     */
    public function prepareUpdates(#[\SensitiveParameter] array $input, string $role): array
    {
        $updates = [];
        foreach ($input as $key => $value) {
            if ($key === 'governor' || str_starts_with((string) $key, 'governor.')) { $updates[$key] = $value; }
        }
        if ($updates === []) { return []; }
        if ($role !== 'owner') { throw new \RuntimeException('Only the owner can change AI Router settings.', 403); }
        foreach (array_keys($updates) as $key) {
            if (!in_array($key, ['governor.mode', 'governor.model_map', RouterSecrets::KEY], true)) {
                throw new \RuntimeException('Unknown or read-only Router setting.', 422);
            }
        }
        $this->settings->clearCache();
        $mode = array_key_exists('governor.mode', $updates) ? $updates['governor.mode'] : $this->settings->get('governor.mode', 'off');
        $this->validateMode($mode);
        if (array_key_exists('governor.model_map', $updates)) {
            $provider = array_key_exists('ai_provider', $input) ? $input['ai_provider'] : $this->settings->get('ai_provider', 'claude');
            $this->validateModelMap($updates['governor.model_map'], $provider);
        }
        // Provider-only updates leave the old bindings intact. publicStatus()
        // flags mismatches; only an explicit owner map update replaces them.
        if (array_key_exists(RouterSecrets::KEY, $updates)) {
            $key = $updates[RouterSecrets::KEY];
            if ($key === null || $key === '') {
                $updates[RouterSecrets::KEY] = null;
            } else {
                if (!is_string($key) || !preg_match('/^[\x21-\x7E]{1,4096}$/D', $key)) {
                    throw new \RuntimeException('TypeSafe key must be a non-empty token without whitespace, or null to remove it.', 422);
                }
                RouterSecrets::remember($key);
                try {
                    $updates[RouterSecrets::KEY] = ($this->encryptionFactory)()->encrypt($key);
                    RouterSecrets::remember($updates[RouterSecrets::KEY]);
                } catch (\Throwable) {
                    throw new \RuntimeException('Router cannot store the key. Check the server encryption configuration.', 409);
                }
            }
        }
        $stored = array_key_exists(RouterSecrets::KEY, $updates) ? $updates[RouterSecrets::KEY] : $this->settings->get(RouterSecrets::KEY);
        if ($mode !== 'off') { $this->requireKey($stored); }
        return $updates;
    }

    private function validateMode(mixed $mode): void
    {
        if (!in_array($mode, ['off', 'shadow', 'enforce'], true)) {
            throw new \RuntimeException('Router mode must be off, shadow, or enforce.', 422);
        }
    }

    /** Server adapter access only. Never include this value in state or responses. */
    public function typeSafeKey(): string
    {
        $this->settings->clearCache();
        return $this->requireKey($this->settings->get(RouterSecrets::KEY));
    }

    private function requireKey(#[\SensitiveParameter] mixed $stored): string
    {
        if (!is_string($stored) || $stored === '') {
            throw new \RuntimeException('AI Router needs a TypeSafe key. Add one in Settings; edits continue with your default model.', 409);
        }
        RouterSecrets::remember($stored);
        try {
            $key = ($this->encryptionFactory)()->decrypt($stored);
            if ($key === '' || !preg_match('/^[\x21-\x7E]{1,4096}$/D', $key)) { throw new \RuntimeException(); }
            RouterSecrets::remember($key);
            return $key;
        } catch (\Throwable) {
            throw new \RuntimeException('AI Router cannot read the TypeSafe key. Replace it in Settings; edits continue with your default model.', 409);
        }
    }

    private function validateModelMap(mixed $map, mixed $provider): void
    {
        $valid = is_array($map) && ($map === [] || (count($map) === 2 && isset($map['cheap'], $map['frontier'])));
        if ($valid) {
            foreach ($map as $entry) {
                if (!is_array($entry) || count($entry) !== 2
                    || !in_array($entry['provider'] ?? null, ['claude', 'openai', 'gemini', 'deepseek', 'openai_compatible'], true)
                    || $entry['provider'] !== $provider
                    || !is_string($entry['model'] ?? null)
                    || str_contains($entry['model'], '://')
                    || !preg_match('/^[a-zA-Z0-9_.:\/+\-]{1,200}$/D', $entry['model'])) {
                    $valid = false;
                    break;
                }
            }
        }
        if (!$valid) { throw new \RuntimeException('Router model map must contain cheap and frontier model IDs for the saved AI provider, or an empty map. Reload Settings if the provider changed. Credentials and provider URLs are not allowed.', 422); }
    }
}
