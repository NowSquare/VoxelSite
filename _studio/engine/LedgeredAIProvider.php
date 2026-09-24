<?php
declare(strict_types=1);

namespace VoxelSite;

if (!interface_exists(AIProviderInterface::class)) { require_once __DIR__ . '/AIProviderInterface.php'; }
if (!class_exists(AICallLedger::class)) { require_once __DIR__ . '/AICallLedger.php'; }

/**
 * Accounts for logical complete/stream method calls, not hidden HTTP attempts.
 * Provider retries and transport behavior are delegated unchanged.
 */
final class LedgeredAIProvider implements AIProviderInterface
{
    private AIProviderInterface $provider;

    public function __construct(AIProviderInterface $provider, private AICallLedger $ledger,
        private ?string $model = null, private string $kind = 'generation', private bool $governedBudget = false)
    {
        // A job can bind a factory-created wrapper to its allocated prompt row.
        $this->model ??= $provider instanceof self ? $provider->model : null;
        $this->provider = $provider instanceof self ? $provider->provider : $provider;
    }

    public function complete(string $systemPrompt, array $messages, array $options = []): string
    {
        $id = $this->start('complete', $options);
        try {
            $result = $this->provider->complete($systemPrompt, $messages, $options);
            // This interface returns text only: usage and cost are unknown.
            $this->ledger->finish($id, 'success');
            return $result;
        } catch (\Throwable $error) {
            $this->ledger->finish($id, 'error', null, null, 'provider_error');
            throw $error;
        }
    }

    public function stream(string $systemPrompt, array $messages, callable $onToken, callable $onComplete,
        array $options = []): void
    {
        $id = $this->start('stream', $options);
        $completed = false;
        $usage = null;
        try {
            $this->provider->stream($systemPrompt, $messages, $onToken,
                static function (string $response, array $providedUsage) use ($onComplete, &$completed, &$usage): void {
                    $usage = $providedUsage;
                    // Existing providers initialize stream counters to zero even
                    // without upstream usage. Those zeros cannot prove measured
                    // usage; normalize only this ledger copy, never the callback.
                    foreach (['input_tokens', 'output_tokens'] as $field) {
                        if (($usage[$field] ?? null) === 0) { $usage[$field] = null; }
                    }
                    $onComplete($response, $providedUsage);
                    $completed = true;
                }, $options);
            $cost = $usage['cost_usd'] ?? null;
            $this->ledger->finish($id, $completed ? 'success' : 'error', $usage,
                is_int($cost) || is_float($cost) ? (float) $cost : null,
                $completed ? null : 'stream_incomplete',
                is_string($usage['model'] ?? null) ? $usage['model'] : null);
        } catch (\Throwable $error) {
            $this->ledger->finish($id, 'error', $usage, null, 'provider_error',
                is_string($usage['model'] ?? null) ? $usage['model'] : null);
            throw $error;
        }
    }

    private function start(string $method, array $options): ?string
    {
        $id = null;
        try {
            // An explicit empty ID is forwarded as-is by the provider contract;
            // persist unknown rather than inventing a different effective model.
            $model = $options['model'] ?? $this->model ?? ($this->provider->getModels()[0]['id'] ?? null);
            $provider = $this->provider->getId();
            $id = $this->governedBudget
                ? $this->ledger->startGovernedGeneration($provider, is_string($model) ? $model : null, $method)
                : $this->ledger->start($this->kind, $provider, is_string($model) ? $model : null, $method);
        } catch (\Throwable) { $this->ledger->markUnavailable(); }
        // Outside the metadata catch: exhaustion is a healthy refusal, not a
        // broken ledger. Complete/stream have not invoked the provider yet.
        if ($this->governedBudget && $id === null) {
            throw new \RuntimeException($this->ledger->governedFailure());
        }
        return $id;
    }

    public function getId(): string { return $this->provider->getId(); }
    public function getName(): string { return $this->provider->getName(); }
    public function getModels(): array { return $this->provider->getModels(); }
    public function listModels(): array { return $this->provider->listModels(); }
    public function testConnection(): array { return $this->provider->testConnection(); }
    public function getConfigFields(): array { return $this->provider->getConfigFields(); }
    public function validateConfig(array $config): bool { return $this->provider->validateConfig($config); }
    public function estimateTokens(string $text): int { return $this->provider->estimateTokens($text); }
    public function getContextWindow(string $model): int { return $this->provider->getContextWindow($model); }
    public function estimateCost(int $inputTokens, int $outputTokens, string $model): array
    { return $this->provider->estimateCost($inputTokens, $outputTokens, $model); }

    /** Do not expose the credential-bearing inner provider through var_dump. */
    public function __debugInfo(): array { return []; }
}
