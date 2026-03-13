<?php

declare(strict_types=1);

/**
 * StructuredSchemas contract tests.
 *
 * Run: php _studio/tests/StructuredSchemasTest.php
 *
 * Verifies:
 * - Schema shape contracts (required keys, valid JSON Schema)
 * - normalizeResult() truncation behavior
 * - normalizeResult() naming flexibility (camelCase + snake_case)
 * - normalizeResult() fail-closed on unknown schema names
 * - Provider schema wrapping helpers produce valid structures
 */

require_once dirname(__DIR__) . '/engine/StructuredSchemas.php';

// Logger stub — tests don't need real logging
if (!class_exists('VoxelSite\Logger')) {
    $loggerPath = dirname(__DIR__) . '/engine/Logger.php';
    if (file_exists($loggerPath)) {
        require_once $loggerPath;
    } else {
        eval('namespace VoxelSite; class Logger { public static function __callStatic($m, $a) {} }');
    }
}

use VoxelSite\StructuredSchemas;

$passed = 0;
$failed = 0;
$errors = [];

function record(bool $condition, string $message, array &$errors, int &$passed, int &$failed): void
{
    if ($condition) {
        $passed++;
        return;
    }

    $failed++;
    $errors[] = $message;
}

echo "=== StructuredSchemas Contract Tests ===\n\n";

// ─── Schema Shape Tests ──────────────────────────────────────────────

echo "--- Schema Shape ---\n";

$evaluator = StructuredSchemas::evaluator();
record(
    isset($evaluator['tool_name']) && is_string($evaluator['tool_name']),
    'FAIL evaluator(): missing or non-string tool_name',
    $errors, $passed, $failed
);
record(
    isset($evaluator['description']) && is_string($evaluator['description']),
    'FAIL evaluator(): missing or non-string description',
    $errors, $passed, $failed
);
record(
    isset($evaluator['schema']) && is_array($evaluator['schema']),
    'FAIL evaluator(): missing or non-array schema',
    $errors, $passed, $failed
);
record(
    ($evaluator['schema']['type'] ?? '') === 'object',
    'FAIL evaluator(): schema root type must be "object"',
    $errors, $passed, $failed
);
record(
    in_array('issues', $evaluator['schema']['required'] ?? [], true),
    'FAIL evaluator(): schema must require "issues" field',
    $errors, $passed, $failed
);
record(
    ($evaluator['schema']['properties']['issues']['maxItems'] ?? 0) === 10,
    'FAIL evaluator(): issues maxItems must be 10',
    $errors, $passed, $failed
);

// Verify evaluator severity enum
$evalSeverity = $evaluator['schema']['properties']['issues']['items']['properties']['severity']['enum'] ?? [];
record(
    $evalSeverity === ['error', 'warning', 'info'],
    'FAIL evaluator(): severity enum mismatch, got ' . json_encode($evalSeverity),
    $errors, $passed, $failed
);

// Verify evaluator category has exactly 10 values
$evalCategory = $evaluator['schema']['properties']['issues']['items']['properties']['category']['enum'] ?? [];
record(
    count($evalCategory) === 10,
    'FAIL evaluator(): expected 10 category enum values, got ' . count($evalCategory),
    $errors, $passed, $failed
);

$brandVoice = StructuredSchemas::brandVoice();
record(
    isset($brandVoice['tool_name']) && is_string($brandVoice['tool_name']),
    'FAIL brandVoice(): missing or non-string tool_name',
    $errors, $passed, $failed
);
record(
    isset($brandVoice['schema']) && is_array($brandVoice['schema']),
    'FAIL brandVoice(): missing or non-array schema',
    $errors, $passed, $failed
);
record(
    ($brandVoice['schema']['properties']['issues']['maxItems'] ?? 0) === 5,
    'FAIL brandVoice(): issues maxItems must be 5',
    $errors, $passed, $failed
);

// Verify brand voice uses enum (not const) for cross-provider compatibility
$bvCategory = $brandVoice['schema']['properties']['issues']['items']['properties']['category'] ?? [];
record(
    isset($bvCategory['enum']) && $bvCategory['enum'] === ['brand_voice'],
    'FAIL brandVoice(): category must use enum: ["brand_voice"], got ' . json_encode($bvCategory),
    $errors, $passed, $failed
);
record(
    !isset($bvCategory['const']),
    'FAIL brandVoice(): category must NOT use "const" (Gemini incompatible)',
    $errors, $passed, $failed
);

// Verify brand voice severity excludes "error" (advisory only)
$bvSeverity = $brandVoice['schema']['properties']['issues']['items']['properties']['severity']['enum'] ?? [];
record(
    $bvSeverity === ['warning', 'info'],
    'FAIL brandVoice(): severity enum should be [warning, info], got ' . json_encode($bvSeverity),
    $errors, $passed, $failed
);

// Verify tool names are unique
record(
    $evaluator['tool_name'] !== $brandVoice['tool_name'],
    'FAIL: evaluator and brandVoice must have different tool_names',
    $errors, $passed, $failed
);

// ─── normalizeResult() Truncation Tests ──────────────────────────────

echo "--- normalizeResult() Truncation ---\n";

// Evaluator: exactly at cap (10) — should pass through unchanged
$atCap = ['issues' => array_fill(0, 10, ['severity' => 'info', 'category' => 'broken_link', 'file' => 'index.php', 'description' => 'test', 'suggested_fix' => 'fix'])];
$result = StructuredSchemas::normalizeResult('evaluator', $atCap);
record(
    count($result['issues']) === 10,
    'FAIL normalizeResult(evaluator, 10 items): expected 10, got ' . count($result['issues']),
    $errors, $passed, $failed
);

// Evaluator: over cap (15) — should truncate to 10
$overCap = ['issues' => array_fill(0, 15, ['severity' => 'info', 'category' => 'broken_link', 'file' => 'index.php', 'description' => 'test', 'suggested_fix' => 'fix'])];
$result = StructuredSchemas::normalizeResult('evaluator', $overCap);
record(
    count($result['issues']) === 10,
    'FAIL normalizeResult(evaluator, 15 items): expected 10 after truncation, got ' . count($result['issues']),
    $errors, $passed, $failed
);

// Evaluator: under cap (3) — should pass through unchanged
$underCap = ['issues' => array_fill(0, 3, ['severity' => 'error', 'category' => 'missing_alt', 'file' => 'about.php', 'description' => 'test', 'suggested_fix' => 'fix'])];
$result = StructuredSchemas::normalizeResult('evaluator', $underCap);
record(
    count($result['issues']) === 3,
    'FAIL normalizeResult(evaluator, 3 items): expected 3, got ' . count($result['issues']),
    $errors, $passed, $failed
);

// Brand voice: over cap (8) — should truncate to 5
$bvOver = ['issues' => array_fill(0, 8, ['severity' => 'warning', 'category' => 'brand_voice', 'file' => 'index.php', 'description' => 'test', 'suggested_fix' => 'fix'])];
$result = StructuredSchemas::normalizeResult('brandVoice', $bvOver);
record(
    count($result['issues']) === 5,
    'FAIL normalizeResult(brandVoice, 8 items): expected 5 after truncation, got ' . count($result['issues']),
    $errors, $passed, $failed
);

// Brand voice with snake_case name — must also work
$result = StructuredSchemas::normalizeResult('brand_voice', $bvOver);
record(
    count($result['issues']) === 5,
    'FAIL normalizeResult(brand_voice snake_case, 8 items): expected 5 after truncation, got ' . count($result['issues']),
    $errors, $passed, $failed
);

// ─── normalizeResult() Edge Cases ────────────────────────────────────

echo "--- normalizeResult() Edge Cases ---\n";

// Null input — should return empty issues
$result = StructuredSchemas::normalizeResult('evaluator', null);
record(
    is_array($result['issues']) && count($result['issues']) === 0,
    'FAIL normalizeResult(evaluator, null): expected empty issues array',
    $errors, $passed, $failed
);

// Missing issues key — should return empty issues
$result = StructuredSchemas::normalizeResult('evaluator', ['something_else' => true]);
record(
    is_array($result['issues']) && count($result['issues']) === 0,
    'FAIL normalizeResult(evaluator, missing issues): expected empty issues array',
    $errors, $passed, $failed
);

// Issues is not an array — should return empty issues
$result = StructuredSchemas::normalizeResult('evaluator', ['issues' => 'not an array']);
record(
    is_array($result['issues']) && count($result['issues']) === 0,
    'FAIL normalizeResult(evaluator, issues=string): expected empty issues array',
    $errors, $passed, $failed
);

// Empty issues — should pass through
$result = StructuredSchemas::normalizeResult('evaluator', ['issues' => []]);
record(
    is_array($result['issues']) && count($result['issues']) === 0,
    'FAIL normalizeResult(evaluator, empty issues): expected empty issues array',
    $errors, $passed, $failed
);

// ─── normalizeResult() Fail-Closed on Unknown Names ──────────────────

echo "--- normalizeResult() Fail-Closed ---\n";

$unknownNames = ['unknown', 'evaluator_typo', 'brndVoice', 'EVALUATOR', ''];

foreach ($unknownNames as $name) {
    $threw = false;
    try {
        StructuredSchemas::normalizeResult($name, ['issues' => []]);
    } catch (\InvalidArgumentException $e) {
        $threw = true;
    }
    record(
        $threw,
        "FAIL normalizeResult('{$name}'): expected InvalidArgumentException for unknown schema name",
        $errors, $passed, $failed
    );
}

// ─── Schema Cross-Provider Compatibility ─────────────────────────────

echo "--- Cross-Provider Compatibility ---\n";

// Verify no schema uses 'const' anywhere (Gemini incompatible)
function findConst(array $schema, string $path = ''): array
{
    $found = [];
    foreach ($schema as $key => $value) {
        $currentPath = $path ? "{$path}.{$key}" : (string) $key;
        if ($key === 'const') {
            $found[] = $currentPath;
        }
        if (is_array($value)) {
            $found = array_merge($found, findConst($value, $currentPath));
        }
    }
    return $found;
}

$evalConsts = findConst($evaluator['schema']);
record(
    empty($evalConsts),
    'FAIL evaluator schema contains "const" at: ' . implode(', ', $evalConsts),
    $errors, $passed, $failed
);

$bvConsts = findConst($brandVoice['schema']);
record(
    empty($bvConsts),
    'FAIL brandVoice schema contains "const" at: ' . implode(', ', $bvConsts),
    $errors, $passed, $failed
);

// Verify both schemas have additionalProperties: false at root (required by Claude/OpenAI)
record(
    ($evaluator['schema']['additionalProperties'] ?? null) === false,
    'FAIL evaluator(): root must have additionalProperties: false',
    $errors, $passed, $failed
);
record(
    ($brandVoice['schema']['additionalProperties'] ?? null) === false,
    'FAIL brandVoice(): root must have additionalProperties: false',
    $errors, $passed, $failed
);

// ─── Results ─────────────────────────────────────────────────────────

echo "\n=== Results ===\n";
echo "Passed: {$passed}\n";
echo "Failed: {$failed}\n";

if (!empty($errors)) {
    echo "\n--- Failures ---\n";
    foreach ($errors as $error) {
        echo "  {$error}\n";
    }
}

echo "\nTotal: " . ($passed + $failed) . " tests\n";
exit($failed > 0 ? 1 : 0);
