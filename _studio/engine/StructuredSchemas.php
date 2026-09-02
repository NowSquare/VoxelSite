<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Structured Output Schema Registry.
 *
 * Central registry of JSON Schema definitions for provider-enforced
 * structured output. These schemas are passed to providers via the
 * `structured_output` option as an alternative to prompt-only JSON.
 *
 * Why not inline the schemas in the engine classes?
 * ─────────────────────────────────────────────────
 * 1. Schemas are shared across providers — each provider wraps them
 *    differently (Claude: tools, OpenAI: functions, Gemini: responseSchema)
 *    but the JSON Schema core is identical.
 * 2. Single source of truth for the contract between prompt and parser.
 * 3. Easy to test schema validity independently.
 *
 * Usage:
 *   $provider->complete($prompt, $messages, [
 *       'structured_output' => StructuredSchemas::evaluator(),
 *   ]);
 *
 * The returned array contains:
 * - 'schema':      JSON Schema definition (the subset all providers accept)
 * - 'tool_name':   Tool/function name for Claude/OpenAI tool-calling
 * - 'description': Human-readable description for the tool
 *
 * Note: The main site-generation flow deliberately does NOT use structured
 * output — wrapping PHP/HTML/CSS inside JSON strings is escape-heavy and
 * brittle. These schemas are exclusively for small, machine-consumed
 * review/audit outputs. See PromptEngine.php, line ~409.
 */
class StructuredSchemas
{
    /**
     * Schema for post-generation quality evaluation.
     *
     * Matches the output contract defined in _studio/prompts/evaluator.md.
     * Returns an array of issues with severity, category, file location,
     * description, and a suggested fix.
     *
     * Severity rules:
     * - error:   broken things (auto-fixed)
     * - warning: inconsistencies (auto-fixed)
     * - info:    improvements (logged only)
     */
    public static function evaluator(): array
    {
        return [
            'tool_name'   => 'voxelsite_evaluator_result',
            'description' => 'Return the quality evaluation results as structured JSON with categorized issues.',
            'schema'      => [
                'type'                 => 'object',
                'additionalProperties' => false,
                'required'             => ['issues'],
                'properties'           => [
                    'issues' => [
                        'type'     => 'array',
                        'maxItems' => 10,
                        'items'    => [
                            'type'                 => 'object',
                            'additionalProperties' => false,
                            'required'             => ['severity', 'category', 'file', 'description', 'suggested_fix'],
                            'properties'           => [
                                'severity' => [
                                    'type' => 'string',
                                    'enum' => ['error', 'warning', 'info'],
                                ],
                                'category' => [
                                    'type' => 'string',
                                    'enum' => [
                                        'broken_link',
                                        'missing_alt',
                                        'heading_hierarchy',
                                        'missing_meta',
                                        'spacing_inconsistency',
                                        'nav_completeness',
                                        'missing_nav_padding',
                                        'design_token_consistency',
                                        'accessibility',
                                        'mobile_responsiveness',
                                    ],
                                ],
                                'file' => [
                                    'type' => 'string',
                                ],
                                'line' => [
                                    'type' => 'integer',
                                ],
                                'description' => [
                                    'type' => 'string',
                                ],
                                'suggested_fix' => [
                                    'type' => 'string',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Schema for brand voice consistency review.
     *
     * Matches the output contract defined in _studio/prompts/brand-voice-review.md.
     * Returns an array of tone deviations with severity, file location,
     * description, and a directional suggestion (not rewritten copy).
     */
    public static function brandVoice(): array
    {
        return [
            'tool_name'   => 'voxelsite_brand_voice_result',
            'description' => 'Return brand voice consistency check results as structured JSON.',
            'schema'      => [
                'type'                 => 'object',
                'additionalProperties' => false,
                'required'             => ['issues'],
                'properties'           => [
                    'issues' => [
                        'type'     => 'array',
                        'maxItems' => 5,
                        'items'    => [
                            'type'                 => 'object',
                            'additionalProperties' => false,
                            'required'             => ['severity', 'category', 'file', 'description', 'suggested_fix'],
                            'properties'           => [
                                'severity' => [
                                    'type' => 'string',
                                    'enum' => ['warning', 'info'],
                                ],
                                'category' => [
                                    'type' => 'string',
                                    'enum' => ['brand_voice'],
                                ],
                                'file' => [
                                    'type' => 'string',
                                ],
                                'line' => [
                                    'type' => 'integer',
                                ],
                                'description' => [
                                    'type' => 'string',
                                ],
                                'suggested_fix' => [
                                    'type' => 'string',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Schema for the design critic (DesignCriticEngine).
     *
     * Matches the output contract in _studio/prompts/critic.md: a score
     * out of 10, a one-sentence verdict, at most three gaps (each with an
     * area, an observation and a fix), and at most six AI tells.
     *
     * Numeric bounds are not expressed in the schema on purpose — not every
     * provider honors them — so normalizeResult() clamps the score.
     */
    public static function designCritic(): array
    {
        return [
            'tool_name'   => 'voxelsite_design_review_result',
            'description' => 'Return the design review as structured JSON: a score out of 10, a one-sentence verdict, the biggest gaps, and any AI tells.',
            'schema'      => [
                'type'                 => 'object',
                'additionalProperties' => false,
                'required'             => ['score', 'verdict', 'gaps', 'tells'],
                'properties'           => [
                    'score'   => ['type' => 'integer'],
                    'verdict' => ['type' => 'string'],
                    'gaps'    => [
                        'type'     => 'array',
                        'maxItems' => 3,
                        'items'    => [
                            'type'                 => 'object',
                            'additionalProperties' => false,
                            'required'             => ['area', 'observation', 'fix'],
                            'properties'           => [
                                'area' => [
                                    'type' => 'string',
                                    'enum' => ['hierarchy', 'typography', 'color', 'spacing', 'distinctiveness', 'copy', 'ai_tells', 'responsiveness'],
                                ],
                                'observation' => ['type' => 'string'],
                                'fix'         => ['type' => 'string'],
                            ],
                        ],
                    ],
                    'tells' => [
                        'type'     => 'array',
                        'maxItems' => 6,
                        'items'    => ['type' => 'string'],
                    ],
                ],
            ],
        ];
    }

    // ─── Post-decode normalization ────────────────────────────────────

    /** Maximum issues for evaluator results (matches prompt: "10 issues maximum"). */
    private const EVALUATOR_MAX_ISSUES = 10;

    /** Maximum issues for brand-voice results (matches prompt: "maximum 5 issues"). */
    private const BRAND_VOICE_MAX_ISSUES = 5;

    /** Caps for design critic results (match critic.md: three gaps, six tells). */
    private const CRITIC_MAX_GAPS  = 3;
    private const CRITIC_MAX_TELLS = 6;

    /**
     * Normalize a decoded structured result.
     *
     * Some providers (notably Gemini) cannot enforce `maxItems` in their
     * schema implementation. This method guarantees the issues array is
     * truncated to the schema's stated cap, regardless of what the
     * provider actually returned.
     *
     * Callers should always run the decoded JSON through this method:
     *
     *   $raw    = json_decode($provider->complete(...), true);
     *   $result = StructuredSchemas::normalizeResult('evaluator', $raw);
     *
     * @param string     $schemaName  'evaluator', 'brandVoice' / 'brand_voice', or 'designCritic' / 'design_critic'
     * @param array|null $decoded     The json_decode'd response
     * @return array Normalized result with `issues` truncated to cap
     * @throws \InvalidArgumentException If $schemaName is not a recognized schema
     */
    public static function normalizeResult(string $schemaName, ?array $decoded): array
    {
        if ($schemaName === 'designCritic' || $schemaName === 'design_critic') {
            return self::normalizeDesignCritic($decoded);
        }

        $result = is_array($decoded) ? $decoded : ['issues' => []];

        if (!isset($result['issues']) || !is_array($result['issues'])) {
            $result['issues'] = [];
        }

        $maxItems = match ($schemaName) {
            'evaluator'                => self::EVALUATOR_MAX_ISSUES,
            'brandVoice', 'brand_voice' => self::BRAND_VOICE_MAX_ISSUES,
            default => throw new \InvalidArgumentException(
                "Unknown schema name '{$schemaName}'. Expected 'evaluator', 'brandVoice' or 'designCritic'."
            ),
        };

        if (count($result['issues']) > $maxItems) {
            $result['issues'] = array_slice($result['issues'], 0, $maxItems);
        }

        return $result;
    }
    /**
     * Normalize a decoded design critic result to a fixed shape.
     *
     * Score clamped to 1..10 (null when absent or non-numeric), gaps capped
     * at three with string fields, tells capped at six non-empty strings.
     *
     * @return array{score: ?int, verdict: string, gaps: list<array{area: string, observation: string, fix: string}>, tells: list<string>}
     */
    private static function normalizeDesignCritic(?array $decoded): array
    {
        $decoded = is_array($decoded) ? $decoded : [];

        $score = null;
        if (isset($decoded['score']) && is_numeric($decoded['score'])) {
            $score = (int) max(1, min(10, (int) round((float) $decoded['score'])));
        }

        $gaps = [];
        foreach ((array) ($decoded['gaps'] ?? []) as $gap) {
            if (!is_array($gap)) {
                continue;
            }
            $observation = trim((string) ($gap['observation'] ?? ''));
            $fix         = trim((string) ($gap['fix'] ?? ''));
            if ($observation === '' && $fix === '') {
                continue;
            }
            $gaps[] = [
                'area'        => trim((string) ($gap['area'] ?? 'design')) ?: 'design',
                'observation' => $observation,
                'fix'         => $fix,
            ];
            if (count($gaps) >= self::CRITIC_MAX_GAPS) {
                break;
            }
        }

        $tells = [];
        foreach ((array) ($decoded['tells'] ?? []) as $tell) {
            if (!is_scalar($tell)) {
                continue;
            }
            $tell = trim((string) $tell);
            if ($tell === '') {
                continue;
            }
            $tells[] = $tell;
            if (count($tells) >= self::CRITIC_MAX_TELLS) {
                break;
            }
        }

        return [
            'score'   => $score,
            'verdict' => trim((string) ($decoded['verdict'] ?? '')),
            'gaps'    => $gaps,
            'tells'   => $tells,
        ];
    }
}
