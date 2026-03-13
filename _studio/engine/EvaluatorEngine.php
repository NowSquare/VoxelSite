<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Post-generation quality evaluator.
 *
 * Runs after PromptEngine writes files to preview. Sends the generated
 * files to the AI for quality review using the evaluator prompt and
 * provider-enforced structured output (via StructuredSchemas).
 *
 * This engine uses `complete()` (non-streaming) because the output is
 * small JSON (not multi-page HTML) and the user doesn't need to see
 * it stream in real-time. The evaluation runs in the background after
 * the main generation has already delivered results to the user.
 *
 * The result is a normalized array of issues that downstream code can
 * use to trigger auto-fixes (error/warning) or log for reference (info).
 *
 * Architecture:
 *   PromptEngine.stream()  →  files written  →  EvaluatorEngine.evaluate()
 *                                                       ↓
 *                                             provider.complete() with schema
 *                                                       ↓
 *                                             normalizeResult() → issues[]
 */
class EvaluatorEngine
{
    private AIProviderInterface $provider;
    private string $promptsDir;

    public function __construct(AIProviderInterface $provider, ?string $promptsDir = null)
    {
        $this->provider = $provider;
        $this->promptsDir = $promptsDir ?? dirname(__DIR__) . '/prompts';
    }

    /**
     * Evaluate generated files for quality issues.
     *
     * @param array<string, string> $files        Map of path => content for generated files
     * @param string                $styleCss     The site's style.css content (for token checking)
     * @param string[]              $existingPages List of all page filenames in the site
     * @param array                 $options       Provider options (model, max_tokens, etc.)
     *
     * @return array{issues: array<int, array{severity: string, category: string, file: string, line?: int, description: string, suggested_fix: string}>}
     */
    public function evaluate(
        array $files,
        string $styleCss = '',
        array $existingPages = [],
        array $options = []
    ): array {
        try {
            $systemPrompt = $this->loadPrompt();

            // If the prompt couldn't be loaded, evaluation is impossible
            // but we degrade gracefully — log already emitted by loadPrompt().
            if ($systemPrompt === '') {
                return ['issues' => []];
            }

            $context = $this->buildContext($files, $styleCss, $existingPages);

            $providerOptions = array_merge([
                'max_tokens'        => 4096,
                'structured_output' => StructuredSchemas::evaluator(),
            ], $options);

            $raw = $this->provider->complete(
                $systemPrompt,
                [['role' => 'user', 'content' => $context]],
                $providerOptions
            );

            $decoded = json_decode($raw, true);

            Logger::info('evaluator', 'Evaluation complete', [
                'raw_length'   => strlen($raw),
                'decoded'      => is_array($decoded),
                'issue_count'  => is_array($decoded) ? count($decoded['issues'] ?? []) : 0,
            ]);
        } catch (\Throwable $e) {
            Logger::error('evaluator', 'Evaluation failed', [
                'error' => $e->getMessage(),
                'class' => get_class($e),
            ]);

            // Return empty issues on failure — evaluation is advisory,
            // it should never block the main generation pipeline.
            return ['issues' => []];
        }

        // Always normalize: truncates to maxItems cap, handles
        // null/malformed responses, guarantees consistent shape.
        return StructuredSchemas::normalizeResult('evaluator', $decoded);
    }

    /**
     * Load the evaluator system prompt.
     *
     * Returns an empty string on failure instead of throwing —
     * the evaluator is advisory and must never block the pipeline.
     */
    private function loadPrompt(): string
    {
        $path = $this->promptsDir . '/evaluator.md';

        if (!file_exists($path)) {
            Logger::warning('evaluator', 'Evaluator prompt not found — skipping evaluation', [
                'path' => $path,
            ]);
            return '';
        }

        $content = file_get_contents($path);
        if ($content === false) {
            Logger::warning('evaluator', 'Evaluator prompt unreadable — skipping evaluation', [
                'path' => $path,
            ]);
            return '';
        }

        return $content;
    }

    /**
     * Build the evaluation context from generated files.
     *
     * Structured as labeled sections matching what the evaluator prompt
     * documents under "Context You Receive".
     */
    private function buildContext(array $files, string $styleCss, array $existingPages): string
    {
        $parts = [];

        // 1. Existing page list (for broken link detection)
        $parts[] = "=== EXISTING PAGES ===";
        if (!empty($existingPages)) {
            $parts[] = implode("\n", $existingPages);
        } else {
            $parts[] = "(No existing pages — this is a new site)";
        }

        // 2. Style.css (for design token consistency checks)
        if ($styleCss !== '') {
            $parts[] = "\n=== style.css ===";
            $parts[] = $styleCss;
        }

        // 3. Generated files
        $parts[] = "\n=== GENERATED FILES ===";
        foreach ($files as $path => $content) {
            $parts[] = "\n--- {$path} ---";
            $parts[] = $content;
        }

        return implode("\n", $parts);
    }
}
