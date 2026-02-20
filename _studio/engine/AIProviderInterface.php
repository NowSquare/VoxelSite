<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * AI Provider contract.
 *
 * Every AI provider (Claude, future GPT, etc.) implements this
 * interface. The PromptEngine talks to providers exclusively
 * through these methods — it never knows or cares which specific
 * AI is behind the curtain.
 *
 * Why an interface for a single provider?
 * - Future-proofing: adding GPT or Gemini becomes a new class,
 *   not a refactor.
 * - Testability: a MockProvider can stand in during development.
 * - Clean boundaries: the provider handles API details, the
 *   engine handles orchestration.
 */
interface AIProviderInterface
{
    /**
     * Unique identifier for this provider (e.g., 'claude', 'openai').
     */
    public function getId(): string;

    /**
     * Human-readable display name (e.g., 'Anthropic Claude').
     */
    public function getName(): string;

    /**
     * Static fallback model list (used when no API key is available).
     *
     * @return array<int, array{id: string, name: string, tier: string}>
     *   tier: 'fast' | 'balanced' | 'premium'
     */
    public function getModels(): array;

    /**
     * Fetch available models live from the provider's API.
     *
     * Requires a valid API key. Returns models sorted by relevance
     * (newest/recommended first). Falls back to getModels() on failure.
     *
     * @return array<int, array{id: string, name: string, created_at?: string}>
     */
    public function listModels(): array;

    /**
     * Test that the API connection works with the configured key.
     *
     * Unlike listModels() which silently falls back to hardcoded
     * defaults, this method THROWS on failure so the error can be
     * surfaced to the user (in Settings → Test Connection).
     *
     * @return array<int, array{id: string, name: string, created_at?: string}> Models on success
     * @throws \RuntimeException On auth, rate-limit, or connection errors
     */
    public function testConnection(): array;

    /**
     * Configuration fields this provider needs from the user.
     *
     * Returns field definitions for the UI to render dynamically.
     * Every provider needs at least 'api_key'. OpenAI-compatible
     * providers also need 'base_url'.
     *
     * @return array<int, array{key: string, label: string, type: string, placeholder: string, required: bool, help_url?: string, help_text?: string}>
     */
    public function getConfigFields(): array;

    /**
     * Validate provider-specific configuration (API key, etc.).
     *
     * Returns true if the config is valid and a connection can
     * be established. Used during installation and settings.
     *
     * @param array<string, mixed> $config Provider config values
     */
    public function validateConfig(array $config): bool;

    /**
     * Stream a response from the AI, calling $onToken for each chunk.
     *
     * This is the primary method for real-time AI generation.
     * Tokens flow through SSE to the browser for live streaming.
     *
     * @param string   $systemPrompt The complete system prompt
     * @param array    $messages     Conversation history [{role, content}]
     * @param callable $onToken      Called with each text chunk: fn(string $token)
     * @param callable $onComplete   Called when done: fn(string $fullResponse, array $usage)
     * @param array    $options      Provider-specific options (model, max_tokens, etc.)
     */
    public function stream(
        string $systemPrompt,
        array $messages,
        callable $onToken,
        callable $onComplete,
        array $options = []
    ): void;

    /**
     * Get a complete (non-streaming) response.
     *
     * Used for lightweight operations where streaming isn't needed
     * (e.g., generating a short summary or validating a prompt).
     */
    public function complete(
        string $systemPrompt,
        array $messages,
        array $options = []
    ): string;

    /**
     * Estimate token count for a text string.
     * Doesn't need to be exact — used for context size management.
     */
    public function estimateTokens(string $text): int;

    /**
     * Get the context window size (in tokens) for a specific model.
     *
     * Used by PromptEngine to calculate input budgets. The budget
     * formula needs the full context window, not just the output
     * token cap, to avoid accidentally treating a small output
     * limit as the model's total capacity.
     *
     * Returns a conservative default if the model is unknown.
     */
    public function getContextWindow(string $model): int;

    /**
     * Estimate cost for a given token count.
     *
     * @return array{input_cost: float, output_cost: float, total_cost: float}
     */
    public function estimateCost(int $inputTokens, int $outputTokens, string $model): array;
}
