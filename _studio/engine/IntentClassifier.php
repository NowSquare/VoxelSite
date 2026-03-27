<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Intent Classifier (Phase B-2)
 *
 * LLM call #1 in the orchestration pipeline.
 * Takes the user's natural-language prompt and returns structured intent:
 *
 *   {
 *     "category": "style" | "content" | "structure" | "seo" | "navigation",
 *     "scope":    "site-wide" | "page:{slug}" | "partial:{file}" | "token:{name}",
 *     "keywords": ["color", "header", ...],
 *     "summary":  "Change the primary brand color across the site."
 *   }
 *
 * Uses AIProviderInterface::complete() — no streaming needed.
 * Small prompt, small response, fast round-trip.
 */
class IntentClassifier
{
    private AIProviderInterface $provider;

    public function __construct(?AIProviderInterface $provider = null)
    {
        $this->provider = $provider ?? AIProviderFactory::create();
    }

    /**
     * Classify a user prompt into structured intent.
     *
     * @param string $prompt     The user's natural-language request
     * @param array  $siteContext Compact site summary for grounding
     *   ['pages' => [...], 'partials' => [...], 'tokens' => [...]]
     *
     * @return array{category: string, scope: string, keywords: list<string>, summary: string}
     *
     * @throws \RuntimeException If the LLM call fails or returns unparseable JSON
     */
    public function classify(string $prompt, array $siteContext = []): array
    {
        $systemPrompt = $this->buildSystemPrompt($siteContext);

        $messages = [
            ['role' => 'user', 'content' => $prompt],
        ];

        $raw = $this->provider->complete($systemPrompt, $messages, [
            'max_tokens'  => 256,
            'temperature' => 0.0,
        ]);

        return $this->parseResponse($raw);
    }

    /**
     * Build the system prompt for intent classification.
     */
    private function buildSystemPrompt(array $siteContext): string
    {
        $siteInfo = '';
        if (!empty($siteContext)) {
            $pages    = $siteContext['pages'] ?? [];
            $partials = $siteContext['partials'] ?? [];
            $tokens   = $siteContext['tokens'] ?? [];

            $parts = [];
            if ($pages) {
                $parts[] = 'Pages: ' . implode(', ', array_map(
                    fn(array $p) => $p['label'] . ' (' . ($p['meta']['slug'] ?? $p['id']) . ')',
                    $pages
                ));
            }
            if ($partials) {
                $parts[] = 'Partials: ' . implode(', ', array_map(
                    fn(array $p) => basename($p['meta']['file_path'] ?? $p['id']),
                    $partials
                ));
            }
            if ($tokens) {
                $parts[] = 'Tokens: ' . implode(', ', array_map(
                    fn(array $t) => $t['label'],
                    array_slice($tokens, 0, 20) // Cap at 20 to keep prompt small
                ));
            }

            $siteInfo = "\n\nSite inventory:\n" . implode("\n", $parts);
        }

        return <<<PROMPT
You are a site change intent classifier. Given a user's request about their website,
classify it into a structured intent.

Respond with ONLY a JSON object — no markdown, no explanation, no code fences.

JSON schema:
{
  "category": one of "style", "content", "structure", "seo", "navigation",
  "scope": one of "site-wide", "page:{slug}", "partial:{file}", "token:{name}",
  "keywords": [array of 1-5 relevant keywords from the request],
  "summary": "One sentence describing the change in technical terms."
}

Category definitions:
- "style": CSS, colors, fonts, spacing, visual changes
- "content": Text, images, copy changes on pages
- "structure": Adding/removing pages, sections, layout changes
- "seo": Meta tags, titles, descriptions, social sharing
- "navigation": Menu items, link structure, nav ordering

Scope rules:
- Use "site-wide" if the change affects multiple pages or global elements
- Use "page:{slug}" if the change targets a specific page (e.g. "page:about")
- Use "partial:{file}" if the change targets a specific partial (e.g. "partial:_partials/header.php")
- Use "token:{name}" if the change targets a CSS custom property (e.g. "token:--color-primary")
- When ambiguous, prefer the narrowest applicable scope{$siteInfo}
PROMPT;
    }

    /**
     * Parse the LLM response into a validated intent array.
     *
     * @throws \RuntimeException If JSON parsing fails
     */
    private function parseResponse(string $raw): array
    {
        // Strip any accidental markdown fences
        $cleaned = trim($raw);
        $cleaned = preg_replace('/^```(?:json)?\s*/i', '', $cleaned);
        $cleaned = preg_replace('/\s*```$/i', '', $cleaned);
        $cleaned = trim($cleaned);

        $data = json_decode($cleaned, true);

        if (!is_array($data)) {
            throw new \RuntimeException(
                'IntentClassifier: LLM returned unparseable response: ' . mb_substr($raw, 0, 200)
            );
        }

        // Validate and normalize
        $validCategories = ['style', 'content', 'structure', 'seo', 'navigation'];
        $category = $data['category'] ?? 'content';
        if (!in_array($category, $validCategories, true)) {
            $category = 'content'; // safe fallback
        }

        $scope = $data['scope'] ?? 'site-wide';
        // Validate scope format
        if ($scope !== 'site-wide' &&
            !str_starts_with($scope, 'page:') &&
            !str_starts_with($scope, 'partial:') &&
            !str_starts_with($scope, 'token:')) {
            $scope = 'site-wide';
        }

        $keywords = $data['keywords'] ?? [];
        if (!is_array($keywords)) {
            $keywords = [];
        }
        // Cap at 5 keywords, ensure strings
        $keywords = array_slice(
            array_filter(array_map('strval', $keywords)),
            0, 5
        );

        $summary = trim((string) ($data['summary'] ?? ''));
        if ($summary === '') {
            $summary = 'Classify the user request.';
        }

        return [
            'category' => $category,
            'scope'    => $scope,
            'keywords' => array_values($keywords),
            'summary'  => $summary,
        ];
    }
}
