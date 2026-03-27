<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Plan Builder (Phase B-5)
 *
 * LLM call #2 in the orchestration pipeline.
 * Takes the intent + scoped regions and produces a structured edit plan.
 *
 * Input:
 *   - intent: {category, scope, keywords, summary}
 *   - scoped: [{file, type, regions: [{start, end, label, content}], strategy}]
 *
 * Output:
 *   {
 *     "edits": [
 *       {
 *         "file": "_partials/header.php",
 *         "region": {"start": 5, "end": 12},
 *         "strategy": "token-edit",
 *         "description": "Change background-color from #fff to #1a1a2e",
 *         "before_snippet": "background-color: #fff;",
 *         "after_snippet": "background-color: #1a1a2e;",
 *         "verification": "Header background should be dark blue"
 *       }
 *     ],
 *     "summary": "One sentence describing the full plan.",
 *     "risk_level": "low" | "medium" | "high"
 *   }
 *
 * Uses AIProviderInterface::complete() — structured JSON, not streaming.
 */
class PlanBuilder
{
    private AIProviderInterface $provider;

    public function __construct(?AIProviderInterface $provider = null)
    {
        $this->provider = $provider ?? AIProviderFactory::create();
    }

    /**
     * Build a structured edit plan from intent + scoped regions.
     *
     * @param array $intent  From IntentClassifier
     * @param array $scoped  From RegionScoper
     * @param string $prompt The original user prompt (for context)
     *
     * @return array{edits: list<array>, summary: string, risk_level: string}
     *
     * @throws \RuntimeException If the LLM returns unparseable JSON
     */
    public function build(array $intent, array $scoped, string $prompt): array
    {
        $systemPrompt = $this->buildSystemPrompt();
        $userMessage  = $this->buildUserMessage($intent, $scoped, $prompt);

        $raw = $this->provider->complete($systemPrompt, [
            ['role' => 'user', 'content' => $userMessage],
        ], [
            'max_tokens'  => 2048,
            'temperature' => 0.0,
        ]);

        return $this->parseResponse($raw, $scoped);
    }

    /**
     * System prompt for structured plan generation.
     */
    private function buildSystemPrompt(): string
    {
        return <<<'PROMPT'
You are a precision code editor. Given a user request, intent classification, and scoped file regions,
produce a structured edit plan. Each edit must be minimal and targeted — never rewrite more than necessary.

Respond with ONLY a JSON object — no markdown, no explanation, no code fences.

JSON schema:
{
  "edits": [
    {
      "file": "relative/path/to/file.php",
      "region": {"start": <line>, "end": <line>},
      "strategy": "token-edit" | "attribute-edit" | "line-replace" | "block-replace" | "block-insert",
      "description": "One clear sentence: what changes and why",
      "before_snippet": "the exact text being replaced (verbatim from the region)",
      "after_snippet": "the replacement text",
      "verification": "How to verify this edit worked"
    }
  ],
  "summary": "One sentence describing the complete plan.",
  "risk_level": "low" | "medium" | "high"
}

Strategy definitions:
- "token-edit": changing a single value (color, font-size, spacing, variable value)
- "attribute-edit": changing an HTML attribute (class, href, src, data-*)
- "line-replace": replacing 1-3 lines of content
- "block-replace": replacing a multi-line block (4+ lines)
- "block-insert": inserting new content at a specific position

Rules:
1. "before_snippet" must be an EXACT substring of the region content — copy verbatim
2. "after_snippet" must be a drop-in replacement — same context, only the change
3. Prefer the smallest possible edit. A token-edit is better than a line-replace.
4. Each edit must be independently verifiable
5. If a change affects multiple files, produce one edit per file
6. If the request cannot be fulfilled with the given regions, say so in the summary and return an empty edits array
7. Never invent content that wasn't requested — stay faithful to the user's words
8. "risk_level" is "low" for single-value changes, "medium" for multi-line or multi-file changes, "high" for structural rewrites
PROMPT;
    }

    /**
     * Build the user message with intent + scoped regions.
     */
    private function buildUserMessage(array $intent, array $scoped, string $prompt): string
    {
        $parts = [];

        // User request
        $parts[] = "## User Request\n{$prompt}";

        // Intent
        $parts[] = "## Intent\n" .
            "Category: {$intent['category']}\n" .
            "Scope: {$intent['scope']}\n" .
            "Summary: {$intent['summary']}\n" .
            "Keywords: " . implode(', ', $intent['keywords'] ?? []);

        // Scoped regions
        $parts[] = "## Scoped Regions";
        foreach ($scoped as $file) {
            if (empty($file['regions'])) continue;

            $parts[] = "### File: {$file['file']} (type: {$file['type']}, strategy: {$file['strategy']})";
            foreach ($file['regions'] as $region) {
                $parts[] = "Lines {$region['start']}–{$region['end']} ({$region['label']}):\n```\n{$region['content']}\n```";
            }
        }

        return implode("\n\n", $parts);
    }

    /**
     * Parse and validate the LLM response.
     *
     * Validates every edit against the scoped regions:
     * - file must be in the candidate set
     * - before_snippet must be an exact substring of a scoped region's content
     * - region bounds must fall within a scoped region
     * Edits that fail anchoring are marked `anchored: false`.
     */
    private function parseResponse(string $raw, array $scoped): array
    {
        // Strip markdown fences
        $cleaned = trim($raw);
        $cleaned = preg_replace('/^```(?:json)?\s*/i', '', $cleaned);
        $cleaned = preg_replace('/\s*```$/i', '', $cleaned);
        $cleaned = trim($cleaned);

        $data = json_decode($cleaned, true);

        if (!is_array($data)) {
            throw new \RuntimeException(
                'PlanBuilder: LLM returned unparseable response: ' . mb_substr($raw, 0, 300)
            );
        }

        // Validate edits
        $validStrategies = ['token-edit', 'attribute-edit', 'line-replace', 'block-replace', 'block-insert', 'meta-edit', 'content-edit'];
        $edits = [];

        // Build per-file index: file path → [{start, end, content}]
        $fileRegions = [];
        foreach ($scoped as $s) {
            $path = $s['file'] ?? '';
            if ($path === '') continue;
            $fileRegions[$path] = $s['regions'] ?? [];
        }

        foreach (($data['edits'] ?? []) as $edit) {
            if (!is_array($edit)) continue;

            $file = $edit['file'] ?? '';
            $strategy = $edit['strategy'] ?? 'line-replace';

            // Validate file is in our candidate set
            if (!isset($fileRegions[$file])) continue;

            // Validate strategy
            if (!in_array($strategy, $validStrategies, true)) {
                $strategy = 'line-replace';
            }

            // Validate region bounds
            $region = $edit['region'] ?? [];
            if (!isset($region['start']) || !isset($region['end'])) {
                $region = ['start' => 1, 'end' => 1];
            }
            $regionStart = (int) $region['start'];
            $regionEnd   = (int) $region['end'];

            // Check before_snippet anchoring against scoped region content
            $beforeSnippet = (string) ($edit['before_snippet'] ?? '');
            $afterSnippet  = (string) ($edit['after_snippet'] ?? '');
            $anchored      = false;
            $anchorReason  = '';

            // Helper: check if the edit's target position falls within any scoped region
            $positionInScope = false;
            $containingRegion = null;
            foreach ($fileRegions[$file] as $scopedRegion) {
                $scopedStart = (int) ($scopedRegion['start'] ?? 0);
                $scopedEnd   = (int) ($scopedRegion['end'] ?? 0);
                if ($regionStart >= $scopedStart && $regionEnd <= $scopedEnd) {
                    $positionInScope = true;
                    $containingRegion = $scopedRegion;
                    break;
                }
            }

            if ($strategy === 'block-insert') {
                // Inserts need position anchoring: target must be inside a scoped region
                if (!$positionInScope) {
                    $anchorReason = "Insert position {$regionStart}-{$regionEnd} is outside all scoped regions";
                } elseif ($beforeSnippet !== '') {
                    // If a before_snippet is provided, it must also match source
                    $regionContent = $containingRegion['content'] ?? '';
                    if ($regionContent !== '' && str_contains($regionContent, $beforeSnippet)) {
                        $anchored = true;
                    } else {
                        $anchorReason = 'Insert before_snippet not found in containing region';
                    }
                } else {
                    // Position is in scope but no before_snippet — not trustworthy
                    // B7 contract: every insert needs a real source anchor
                    $anchorReason = 'Insert requires before_snippet for source anchoring';
                }
            } elseif ($beforeSnippet === '') {
                $anchorReason = 'Missing before_snippet';
            } else {
                // Verify before_snippet is an exact substring of at least one
                // scoped region for this file, with valid bounds
                $snippetSeen = false;
                foreach ($fileRegions[$file] as $scopedRegion) {
                    $regionContent = $scopedRegion['content'] ?? '';
                    if ($regionContent === '' || !str_contains($regionContent, $beforeSnippet)) {
                        continue;
                    }
                    $snippetSeen = true;

                    // Verify edit region falls within this scoped region
                    $scopedStart = (int) ($scopedRegion['start'] ?? 0);
                    $scopedEnd   = (int) ($scopedRegion['end'] ?? 0);
                    if ($regionStart >= $scopedStart && $regionEnd <= $scopedEnd) {
                        $anchored = true;
                        $anchorReason = '';
                        break;
                    }

                    // Bounds failed for this region — record but keep searching
                    $anchorReason = "Region {$regionStart}-{$regionEnd} exceeds scoped {$scopedStart}-{$scopedEnd}";
                }

                if (!$anchored && !$snippetSeen) {
                    $anchorReason = 'before_snippet not found in scoped regions';
                }
            }

            $edits[] = [
                'file'            => $file,
                'region'          => [
                    'start' => $regionStart,
                    'end'   => $regionEnd,
                ],
                'strategy'        => $strategy,
                'description'     => trim((string) ($edit['description'] ?? '')),
                'before_snippet'  => $beforeSnippet,
                'after_snippet'   => $afterSnippet,
                'verification'    => trim((string) ($edit['verification'] ?? '')),
                'anchored'        => $anchored,
                'anchor_issue'    => $anchorReason,
            ];
        }

        // Validate risk level
        $riskLevel = $data['risk_level'] ?? 'medium';
        if (!in_array($riskLevel, ['low', 'medium', 'high'], true)) {
            $riskLevel = 'medium';
        }

        // Count anchored vs unanchored
        $anchoredCount   = count(array_filter($edits, fn($e) => $e['anchored']));
        $unanchoredCount = count($edits) - $anchoredCount;

        $summary = trim((string) ($data['summary'] ?? ''));
        if ($summary === '') {
            $summary = $anchoredCount > 0
                ? $anchoredCount . ' anchored edit(s) planned.'
                : 'No edits could be determined from the request.';
        }

        // If all edits are unanchored, escalate risk
        if (count($edits) > 0 && $anchoredCount === 0) {
            $riskLevel = 'high';
        }

        return [
            'edits'             => $edits,
            'summary'           => $summary,
            'risk_level'        => $riskLevel,
            'anchored_count'    => $anchoredCount,
            'unanchored_count'  => $unanchoredCount,
        ];
    }
}
