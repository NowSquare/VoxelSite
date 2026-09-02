<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Design critic — a second, isolated opinion on the design itself.
 *
 * The evaluator (EvaluatorEngine) is a defect checker: broken links,
 * missing alt text, heading order. It deliberately does not judge design.
 * This engine does. It scores one page the way a studio would (hierarchy,
 * typography, color, spacing, distinctiveness, copy, AI tells) and names
 * the three gaps that would move the score most.
 *
 * Isolation is the point. A model reviewing its own output stays inside
 * its own rationale. The critic therefore receives only the result: the
 * page source, the design tokens, the navigation and footer, and the
 * direction brief the builder was given. Never the user's prompt, never
 * the conversation, never the builder's message.
 *
 * Shared hosting has no browser, so the critic reads HTML instead of a
 * screenshot. That makes it weaker on layout and strong on tells,
 * typography and copy, which is where the gaps usually are.
 *
 * One critique, no revision loop, advisory only. Results are shaped like
 * evaluator issues (toIssues) so the existing "Expert Review" panel shows
 * them and the "Add to chat" button turns any gap into the next prompt.
 * Every failure path returns a null score and never blocks generation.
 */
final class DesignCriticEngine
{
    /** Actions whose result is a page worth reviewing. Snippet edits are not. */
    private const REVIEWABLE_ACTIONS = [
        'create_site', 'free_prompt', 'import_site', 'restyle_site',
        'edit_page', 'add_page', 'change_design',
    ];

    private const MAX_PAGE_CHARS  = 45000;
    private const MAX_TOTAL_CHARS = 90000;

    private AIProviderInterface $provider;
    private string $promptsDir;

    public function __construct(AIProviderInterface $provider, ?string $promptsDir = null)
    {
        $this->provider   = $provider;
        $this->promptsDir = $promptsDir ?? dirname(__DIR__) . '/prompts';
    }

    /**
     * Should a review run for this action and this set of file operations?
     * Requires a reviewable action and at least one written page, partial
     * or the stylesheet (a token-only design change still changes the page).
     *
     * @param array<int, array{path?: string, action?: string}> $operations
     */
    public static function appliesTo(string $actionType, array $operations): bool
    {
        if (!in_array($actionType, self::REVIEWABLE_ACTIONS, true)) {
            return false;
        }

        foreach ($operations as $op) {
            if (($op['action'] ?? '') === 'delete') {
                continue;
            }
            $path = (string) ($op['path'] ?? '');
            if (str_ends_with($path, '.php') || $path === 'assets/css/style.css') {
                return true;
            }
        }

        return false;
    }

    /**
     * Review one page.
     *
     * @param array<string, string> $pages          path => source (usually one page)
     * @param string                $styleCss       full style.css; only the :root block is sent
     * @param string|null           $navHtml        _partials/nav.php
     * @param string|null           $footerHtml     _partials/footer.php
     * @param string|null           $directionBlock rendered DesignDirection block, when one was drawn
     * @param array                 $options        provider options (model, ...)
     *
     * @return array{score: ?int, verdict: string, gaps: list<array{area: string, observation: string, fix: string}>, tells: list<string>}
     */
    public function review(
        array $pages,
        string $styleCss = '',
        ?string $navHtml = null,
        ?string $footerHtml = null,
        ?string $directionBlock = null,
        array $options = []
    ): array {
        $empty = ['score' => null, 'verdict' => '', 'gaps' => [], 'tells' => []];

        try {
            $systemPrompt = $this->loadPrompt();
            if ($systemPrompt === '' || $pages === []) {
                return $empty;
            }

            $context = $this->buildContext($pages, $styleCss, $navHtml, $footerHtml, $directionBlock);

            $providerOptions = array_merge([
                'max_tokens'        => 1024,
                'structured_output' => StructuredSchemas::designCritic(),
            ], $options);

            $raw = $this->provider->complete(
                $systemPrompt,
                [['role' => 'user', 'content' => $context]],
                $providerOptions
            );

            $decoded = json_decode($raw, true);
            if (!is_array($decoded)) {
                // Prompt-only fallback may wrap the JSON in fences or prose.
                if (preg_match('/\{[\s\S]*\}/', $raw, $m)) {
                    $decoded = json_decode($m[0], true);
                }
            }

            $result = StructuredSchemas::normalizeResult('designCritic', is_array($decoded) ? $decoded : null);

            Logger::info('critic', 'Design review complete', [
                'score'      => $result['score'],
                'gap_count'  => count($result['gaps']),
                'tell_count' => count($result['tells']),
                'raw_length' => strlen($raw),
            ]);

            return $result;
        } catch (\Throwable $e) {
            Logger::error('critic', 'Design review failed', [
                'error' => $e->getMessage(),
                'class' => get_class($e),
            ]);

            return $empty;
        }
    }

    /**
     * Shape a review as evaluation issues so the existing Expert Review
     * panel renders it without new frontend code.
     *
     * The summary row and the gaps are warnings when the page scored under
     * 8 and plain suggestions otherwise; tells are always suggestions.
     *
     * @param array{score: ?int, verdict: string, gaps: list<array{area: string, observation: string, fix: string}>, tells: list<string>} $review
     * @return list<array{severity: string, category: string, file: string, description: string, suggested_fix: string}>
     */
    public static function toIssues(array $review, string $primaryFile): array
    {
        if ($review['score'] === null) {
            return [];
        }

        $score    = (int) $review['score'];
        $severity = $score >= 8 ? 'info' : 'warning';
        $issues   = [];

        $verdict  = trim((string) ($review['verdict'] ?? ''));
        $issues[] = [
            'severity'      => $severity,
            'category'      => 'design_review',
            'file'          => $primaryFile,
            'description'   => "Design review: {$score}/10." . ($verdict !== '' ? ' ' . $verdict : ''),
            'suggested_fix' => $score >= 9
                ? 'Studio-level. Nothing to do.'
                : 'Work through the gaps below in order; each one is the single change the reviewer thought would move the score most.',
        ];

        foreach ($review['gaps'] as $gap) {
            $area = trim((string) ($gap['area'] ?? 'design'));
            $issues[] = [
                'severity'      => $severity,
                'category'      => 'design_review',
                'file'          => $primaryFile,
                'description'   => '[' . $area . '] ' . trim((string) ($gap['observation'] ?? '')),
                'suggested_fix' => trim((string) ($gap['fix'] ?? '')),
            ];
        }

        foreach ($review['tells'] as $tell) {
            $tell = trim((string) $tell);
            if ($tell === '') {
                continue;
            }
            $issues[] = [
                'severity'      => 'info',
                'category'      => 'ai_tell',
                'file'          => $primaryFile,
                'description'   => 'Reads as machine-made: ' . $tell,
                'suggested_fix' => 'Remove it, or replace it with something specific to this business.',
            ];
        }

        return $issues;
    }

    // ─── Internals ───────────────────────────────────────────────────

    private function loadPrompt(): string
    {
        $path = $this->promptsDir . '/critic.md';

        if (!file_exists($path)) {
            Logger::warning('critic', 'Critic prompt not found — skipping design review', ['path' => $path]);
            return '';
        }

        $content = file_get_contents($path);
        if ($content === false || trim($content) === '') {
            Logger::warning('critic', 'Critic prompt unreadable — skipping design review', ['path' => $path]);
            return '';
        }

        return $content;
    }

    /**
     * Assemble what the critic sees, and nothing else.
     *
     * @param array<string, string> $pages
     */
    private function buildContext(
        array $pages,
        string $styleCss,
        ?string $navHtml,
        ?string $footerHtml,
        ?string $directionBlock
    ): string {
        $parts = [];

        if ($directionBlock !== null && trim($directionBlock) !== '') {
            $parts[] = "=== THE BRIEF THE BUILDER WAS GIVEN ===\n" . trim($directionBlock);
        }

        $root = self::extractRootBlock($styleCss);
        if ($root !== '') {
            $parts[] = "=== DESIGN TOKENS (style.css :root) ===\n" . $root;
        }

        if ($navHtml !== null && trim($navHtml) !== '') {
            $parts[] = "=== NAVIGATION (_partials/nav.php) ===\n" . self::clip(trim($navHtml), 12000);
        }

        if ($footerHtml !== null && trim($footerHtml) !== '') {
            $parts[] = "=== FOOTER (_partials/footer.php) ===\n" . self::clip(trim($footerHtml), 12000);
        }

        foreach ($pages as $path => $source) {
            $parts[] = "=== PAGE: {$path} ===\n" . self::clip((string) $source, self::MAX_PAGE_CHARS);
        }

        $context = implode("\n\n", $parts);

        return self::clip($context, self::MAX_TOTAL_CHARS);
    }

    private static function extractRootBlock(string $css): string
    {
        if ($css === '') {
            return '';
        }
        if (preg_match('/:root\s*\{[^}]*\}/s', $css, $m)) {
            return trim($m[0]);
        }
        return '';
    }

    private static function clip(string $text, int $max): string
    {
        if (strlen($text) <= $max) {
            return $text;
        }
        return substr($text, 0, $max) . "\n<!-- truncated for review -->";
    }
}
