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

    // ─── Post-decode normalization ────────────────────────────────────

    /** Maximum issues for evaluator results (matches prompt: "10 issues maximum"). */
    private const EVALUATOR_MAX_ISSUES = 10;

    /** Maximum issues for brand-voice results (matches prompt: "maximum 5 issues"). */
    private const BRAND_VOICE_MAX_ISSUES = 5;

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
     * @param string     $schemaName  'evaluator', 'brandVoice', or 'brand_voice'
     * @param array|null $decoded     The json_decode'd response
     * @return array Normalized result with `issues` truncated to cap
     * @throws \InvalidArgumentException If $schemaName is not a recognized schema
     */
    public static function normalizeResult(string $schemaName, ?array $decoded): array
    {
        $result = is_array($decoded) ? $decoded : ['issues' => []];

        if (!isset($result['issues']) || !is_array($result['issues'])) {
            $result['issues'] = [];
        }

        $maxItems = match ($schemaName) {
            'evaluator'                => self::EVALUATOR_MAX_ISSUES,
            'brandVoice', 'brand_voice' => self::BRAND_VOICE_MAX_ISSUES,
            default => throw new \InvalidArgumentException(
                "Unknown schema name '{$schemaName}'. Expected 'evaluator' or 'brandVoice'."
            ),
        };

        if (count($result['issues']) > $maxItems) {
            $result['issues'] = array_slice($result['issues'], 0, $maxItems);
        }

        return $result;
    }
}
