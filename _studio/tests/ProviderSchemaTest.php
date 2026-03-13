<?php

declare(strict_types=1);

/**
 * Provider schema wrapping + EvaluatorEngine end-to-end tests.
 *
 * Run: php _studio/tests/ProviderSchemaTest.php
 *
 * Covers:
 * - Claude tool wrapping shape (buildClaudeToolFromSchema)
 * - OpenAI function wrapping shape (buildOpenAIToolFromSchema)
 * - Gemini schema conversion (convertSchemaToGeminiFormat)
 * - DeepSeek / OpenAI-compatible wrapping shape (buildToolFromSchema)
 * - Tool-name preservation across all providers
 * - Gemini strips unsupported keywords (additionalProperties, maxItems, const)
 * - EvaluatorEngine end-to-end: fake provider → decode → normalize → capped result
 */

// ─── Bootstrap ───────────────────────────────────────────────────────

if (!class_exists('VoxelSite\Logger')) {
    $loggerPath = dirname(__DIR__) . '/engine/Logger.php';
    if (file_exists($loggerPath)) {
        require_once $loggerPath;
    } else {
        eval('namespace VoxelSite; class Logger { public static function __callStatic($m, $a) {} }');
    }
}

require_once dirname(__DIR__) . '/engine/AIProviderInterface.php';
require_once dirname(__DIR__) . '/engine/StructuredSchemas.php';
require_once dirname(__DIR__) . '/engine/EvaluatorEngine.php';
require_once dirname(__DIR__) . '/engine/providers/ClaudeProvider.php';
require_once dirname(__DIR__) . '/engine/providers/OpenAIProvider.php';
require_once dirname(__DIR__) . '/engine/providers/GeminiProvider.php';
require_once dirname(__DIR__) . '/engine/providers/DeepSeekProvider.php';
require_once dirname(__DIR__) . '/engine/providers/OpenAICompatibleProvider.php';

use VoxelSite\StructuredSchemas;
use VoxelSite\EvaluatorEngine;

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

// ─── Test Subclasses ─────────────────────────────────────────────────
// Thin wrappers that expose protected wrapping methods for testing.
// No API calls — just exercises the schema conversion logic.

class TestableClaudeProvider extends \VoxelSite\Providers\ClaudeProvider
{
    public function __construct() { /* skip parent — no API key needed */ }
    public function exposeWrap(array $config, string $name): array
    {
        return $this->buildClaudeToolFromSchema($config, $name);
    }
}

class TestableOpenAIProvider extends \VoxelSite\Providers\OpenAIProvider
{
    public function __construct() { /* skip parent */ }
    public function exposeWrap(array $config, string $name): array
    {
        return $this->buildOpenAIToolFromSchema($config, $name);
    }
}

class TestableGeminiProvider extends \VoxelSite\Providers\GeminiProvider
{
    public function __construct() { /* skip parent */ }
    public function exposeConvert(array $schema): array
    {
        return $this->convertSchemaToGeminiFormat($schema);
    }
}

class TestableDeepSeekProvider extends \VoxelSite\Providers\DeepSeekProvider
{
    public function __construct() { /* skip parent */ }
    public function exposeWrap(array $config, string $name): array
    {
        return $this->buildToolFromSchema($config, $name);
    }
}

class TestableOpenAICompatibleProvider extends \VoxelSite\Providers\OpenAICompatibleProvider
{
    public function __construct() { /* skip parent */ }
    public function exposeWrap(array $config, string $name): array
    {
        return $this->buildToolFromSchema($config, $name);
    }
}

// ─── Fake Provider for EvaluatorEngine ───────────────────────────────

class FakeProvider implements \VoxelSite\AIProviderInterface
{
    private string $responseJson;
    public array $lastOptions = [];

    public function __construct(string $responseJson)
    {
        $this->responseJson = $responseJson;
    }

    public function getId(): string { return 'fake'; }
    public function getName(): string { return 'Fake Provider'; }
    public function getModels(): array { return [['id' => 'fake-1', 'name' => 'Fake', 'tier' => 'fast']]; }
    public function listModels(): array { return $this->getModels(); }
    public function testConnection(): array { return $this->getModels(); }
    public function getConfigFields(): array { return []; }
    public function validateConfig(array $config): bool { return true; }
    public function estimateTokens(string $text): int { return (int) ceil(strlen($text) / 4); }
    public function getContextWindow(string $model): int { return 128000; }
    public function estimateCost(int $inputTokens, int $outputTokens, string $model): array
    {
        return ['input_cost' => 0, 'output_cost' => 0, 'total_cost' => 0];
    }

    public function stream(string $systemPrompt, array $messages, callable $onToken, callable $onComplete, array $options = []): void
    {
        $onToken($this->responseJson);
        $onComplete($this->responseJson, ['input_tokens' => 100, 'output_tokens' => 50, 'duration_ms' => 200, 'model' => 'fake-1']);
    }

    public function complete(string $systemPrompt, array $messages, array $options = []): string
    {
        $this->lastOptions = $options;
        return $this->responseJson;
    }
}

echo "=== Provider Schema Wrapping Tests ===\n\n";

// ─── Claude Wrapping ─────────────────────────────────────────────────

echo "--- Claude ---\n";

$claude = new TestableClaudeProvider();
$evalSchema = StructuredSchemas::evaluator();
$claudeTool = $claude->exposeWrap($evalSchema, $evalSchema['tool_name']);

record(
    ($claudeTool['name'] ?? '') === 'voxelsite_evaluator_result',
    'FAIL Claude: tool name not preserved, got ' . ($claudeTool['name'] ?? 'MISSING'),
    $errors, $passed, $failed
);
record(
    isset($claudeTool['input_schema']) && is_array($claudeTool['input_schema']),
    'FAIL Claude: missing input_schema key',
    $errors, $passed, $failed
);
record(
    ($claudeTool['input_schema']['type'] ?? '') === 'object',
    'FAIL Claude: input_schema root type must be "object"',
    $errors, $passed, $failed
);
record(
    !isset($claudeTool['input_schema']['tool_name']),
    'FAIL Claude: input_schema must not contain tool_name (config envelope key)',
    $errors, $passed, $failed
);
record(
    isset($claudeTool['description']) && str_contains($claudeTool['description'], 'evaluation'),
    'FAIL Claude: description not passed through',
    $errors, $passed, $failed
);

// Brand voice schema too
$bvSchema = StructuredSchemas::brandVoice();
$claudeBvTool = $claude->exposeWrap($bvSchema, $bvSchema['tool_name']);
record(
    ($claudeBvTool['name'] ?? '') === 'voxelsite_brand_voice_result',
    'FAIL Claude BV: tool name not preserved',
    $errors, $passed, $failed
);

// ─── OpenAI Wrapping ─────────────────────────────────────────────────

echo "--- OpenAI ---\n";

$openai = new TestableOpenAIProvider();
$openaiTool = $openai->exposeWrap($evalSchema, $evalSchema['tool_name']);

record(
    ($openaiTool['type'] ?? '') === 'function',
    'FAIL OpenAI: top-level type must be "function", got ' . ($openaiTool['type'] ?? 'MISSING'),
    $errors, $passed, $failed
);
record(
    ($openaiTool['function']['name'] ?? '') === 'voxelsite_evaluator_result',
    'FAIL OpenAI: function name not preserved',
    $errors, $passed, $failed
);
record(
    isset($openaiTool['function']['parameters']) && is_array($openaiTool['function']['parameters']),
    'FAIL OpenAI: missing function.parameters',
    $errors, $passed, $failed
);
record(
    ($openaiTool['function']['parameters']['type'] ?? '') === 'object',
    'FAIL OpenAI: parameters root type must be "object"',
    $errors, $passed, $failed
);
record(
    !isset($openaiTool['function']['parameters']['tool_name']),
    'FAIL OpenAI: parameters must not contain tool_name',
    $errors, $passed, $failed
);

// ─── DeepSeek Wrapping ───────────────────────────────────────────────

echo "--- DeepSeek ---\n";

$deepseek = new TestableDeepSeekProvider();
$dsTool = $deepseek->exposeWrap($evalSchema, $evalSchema['tool_name']);

record(
    ($dsTool['type'] ?? '') === 'function',
    'FAIL DeepSeek: top-level type must be "function"',
    $errors, $passed, $failed
);
record(
    ($dsTool['function']['name'] ?? '') === 'voxelsite_evaluator_result',
    'FAIL DeepSeek: function name not preserved',
    $errors, $passed, $failed
);
record(
    isset($dsTool['function']['parameters']) && ($dsTool['function']['parameters']['type'] ?? '') === 'object',
    'FAIL DeepSeek: parameters root type must be "object"',
    $errors, $passed, $failed
);

// ─── OpenAI Compatible Wrapping ──────────────────────────────────────

echo "--- OpenAI Compatible ---\n";

$compat = new TestableOpenAICompatibleProvider();
$compatTool = $compat->exposeWrap($evalSchema, $evalSchema['tool_name']);

record(
    ($compatTool['type'] ?? '') === 'function',
    'FAIL OpenAI Compatible: top-level type must be "function"',
    $errors, $passed, $failed
);
record(
    ($compatTool['function']['name'] ?? '') === 'voxelsite_evaluator_result',
    'FAIL OpenAI Compatible: function name not preserved',
    $errors, $passed, $failed
);

// ─── Gemini Schema Conversion ────────────────────────────────────────

echo "--- Gemini Conversion ---\n";

$gemini = new TestableGeminiProvider();
$geminiSchema = $gemini->exposeConvert($evalSchema['schema']);

// Types must be uppercased
record(
    ($geminiSchema['type'] ?? '') === 'OBJECT',
    'FAIL Gemini: root type not uppercased, got ' . ($geminiSchema['type'] ?? 'MISSING'),
    $errors, $passed, $failed
);

$issuesType = $geminiSchema['properties']['issues']['type'] ?? '';
record(
    $issuesType === 'ARRAY',
    'FAIL Gemini: issues type not uppercased, got ' . $issuesType,
    $errors, $passed, $failed
);

// additionalProperties must be stripped
record(
    !isset($geminiSchema['additionalProperties']),
    'FAIL Gemini: additionalProperties not stripped at root',
    $errors, $passed, $failed
);

// maxItems must be stripped
record(
    !isset($geminiSchema['properties']['issues']['maxItems']),
    'FAIL Gemini: maxItems not stripped from issues',
    $errors, $passed, $failed
);

// Nested item types must also be uppercased
$itemType = $geminiSchema['properties']['issues']['items']['type'] ?? '';
record(
    $itemType === 'OBJECT',
    'FAIL Gemini: nested item type not uppercased, got ' . $itemType,
    $errors, $passed, $failed
);

// Verify enum values are preserved (not uppercased — only type names get uppercased)
$severityEnum = $geminiSchema['properties']['issues']['items']['properties']['severity']['enum'] ?? [];
record(
    $severityEnum === ['error', 'warning', 'info'],
    'FAIL Gemini: severity enum values should NOT be uppercased, got ' . json_encode($severityEnum),
    $errors, $passed, $failed
);

// Test const → enum conversion
$constSchema = ['type' => 'string', 'const' => 'test_value'];
$convertedConst = $gemini->exposeConvert($constSchema);
record(
    !isset($convertedConst['const']),
    'FAIL Gemini: const not stripped',
    $errors, $passed, $failed
);
record(
    ($convertedConst['enum'] ?? []) === ['test_value'],
    'FAIL Gemini: const not converted to single-value enum, got ' . json_encode($convertedConst['enum'] ?? 'MISSING'),
    $errors, $passed, $failed
);

// Brand voice schema conversion
$bvGemini = $gemini->exposeConvert($bvSchema['schema']);
$bvCategoryEnum = $bvGemini['properties']['issues']['items']['properties']['category']['enum'] ?? [];
record(
    $bvCategoryEnum === ['brand_voice'],
    'FAIL Gemini BV: category enum not preserved, got ' . json_encode($bvCategoryEnum),
    $errors, $passed, $failed
);
record(
    !isset($bvGemini['properties']['issues']['maxItems']),
    'FAIL Gemini BV: maxItems not stripped from brand voice issues',
    $errors, $passed, $failed
);

// ─── Tool Name Preservation Across All Providers ─────────────────────

echo "--- Tool Name Preservation ---\n";

$schemas = [
    'evaluator'  => StructuredSchemas::evaluator(),
    'brandVoice' => StructuredSchemas::brandVoice(),
];

foreach ($schemas as $schemaLabel => $schema) {
    $name = $schema['tool_name'];

    // Claude
    $ct = $claude->exposeWrap($schema, $name);
    record($ct['name'] === $name, "FAIL tool name [{$schemaLabel}] Claude: expected {$name}, got " . ($ct['name'] ?? ''), $errors, $passed, $failed);

    // OpenAI
    $ot = $openai->exposeWrap($schema, $name);
    record($ot['function']['name'] === $name, "FAIL tool name [{$schemaLabel}] OpenAI: expected {$name}", $errors, $passed, $failed);

    // DeepSeek
    $dt = $deepseek->exposeWrap($schema, $name);
    record($dt['function']['name'] === $name, "FAIL tool name [{$schemaLabel}] DeepSeek: expected {$name}", $errors, $passed, $failed);

    // OpenAI Compatible
    $oct = $compat->exposeWrap($schema, $name);
    record($oct['function']['name'] === $name, "FAIL tool name [{$schemaLabel}] OpenAI Compatible: expected {$name}", $errors, $passed, $failed);
}

// ─── EvaluatorEngine End-to-End ──────────────────────────────────────

echo "--- EvaluatorEngine E2E ---\n";

// Scenario 1: Provider returns 15 issues → engine truncates to 10
$fifteenIssues = [];
for ($i = 0; $i < 15; $i++) {
    $fifteenIssues[] = [
        'severity'      => 'warning',
        'category'      => 'spacing_inconsistency',
        'file'          => "page{$i}.php",
        'line'          => $i * 10,
        'description'   => "Issue #{$i}",
        'suggested_fix' => "Fix #{$i}",
    ];
}
$fakeProvider15 = new FakeProvider(json_encode(['issues' => $fifteenIssues]));
$engine = new EvaluatorEngine($fakeProvider15, dirname(__DIR__) . '/prompts');
$result = $engine->evaluate(['index.php' => '<h1>Test</h1>'], '');

record(
    count($result['issues']) === 10,
    'FAIL E2E: 15 issues should truncate to 10, got ' . count($result['issues']),
    $errors, $passed, $failed
);

// Verify the first 10 issues are preserved (in order)
record(
    ($result['issues'][0]['file'] ?? '') === 'page0.php',
    'FAIL E2E: first issue should be page0.php',
    $errors, $passed, $failed
);
record(
    ($result['issues'][9]['file'] ?? '') === 'page9.php',
    'FAIL E2E: tenth issue should be page9.php',
    $errors, $passed, $failed
);

// Verify structured_output was passed to provider
record(
    is_array($fakeProvider15->lastOptions['structured_output'] ?? null),
    'FAIL E2E: structured_output option not passed to provider',
    $errors, $passed, $failed
);
record(
    ($fakeProvider15->lastOptions['structured_output']['tool_name'] ?? '') === 'voxelsite_evaluator_result',
    'FAIL E2E: wrong tool_name in structured_output option',
    $errors, $passed, $failed
);

// Scenario 2: Provider returns 3 issues → no truncation
$threeIssues = array_slice($fifteenIssues, 0, 3);
$fakeProvider3 = new FakeProvider(json_encode(['issues' => $threeIssues]));
$engine3 = new EvaluatorEngine($fakeProvider3, dirname(__DIR__) . '/prompts');
$result3 = $engine3->evaluate(['index.php' => '<h1>Test</h1>'], '');

record(
    count($result3['issues']) === 3,
    'FAIL E2E: 3 issues should pass through unchanged, got ' . count($result3['issues']),
    $errors, $passed, $failed
);

// Scenario 3: Provider returns invalid JSON → empty issues (no crash)
$fakeProviderBad = new FakeProvider('this is not json at all');
$engineBad = new EvaluatorEngine($fakeProviderBad, dirname(__DIR__) . '/prompts');
$resultBad = $engineBad->evaluate(['index.php' => '<h1>Test</h1>'], '');

record(
    is_array($resultBad['issues']) && count($resultBad['issues']) === 0,
    'FAIL E2E: invalid JSON should return empty issues, got ' . json_encode($resultBad),
    $errors, $passed, $failed
);

// Scenario 4: Provider returns empty issues → clean pass-through
$fakeProviderEmpty = new FakeProvider('{"issues": []}');
$engineEmpty = new EvaluatorEngine($fakeProviderEmpty, dirname(__DIR__) . '/prompts');
$resultEmpty = $engineEmpty->evaluate(['index.php' => '<h1>Test</h1>'], '');

record(
    is_array($resultEmpty['issues']) && count($resultEmpty['issues']) === 0,
    'FAIL E2E: empty issues should pass through cleanly',
    $errors, $passed, $failed
);

// Scenario 5: Provider throws → empty issues (advisory, never blocks)
$fakeProviderThrow = new class implements \VoxelSite\AIProviderInterface {
    public function getId(): string { return 'throw'; }
    public function getName(): string { return 'Throw'; }
    public function getModels(): array { return []; }
    public function listModels(): array { return []; }
    public function testConnection(): array { return []; }
    public function getConfigFields(): array { return []; }
    public function validateConfig(array $config): bool { return false; }
    public function estimateTokens(string $text): int { return 0; }
    public function getContextWindow(string $model): int { return 0; }
    public function estimateCost(int $it, int $ot, string $m): array { return ['input_cost' => 0, 'output_cost' => 0, 'total_cost' => 0]; }
    public function stream(string $sp, array $m, callable $ot, callable $oc, array $o = []): void { throw new \RuntimeException('boom'); }
    public function complete(string $sp, array $m, array $o = []): string { throw new \RuntimeException('provider exploded'); }
};
$engineThrow = new EvaluatorEngine($fakeProviderThrow, dirname(__DIR__) . '/prompts');
$resultThrow = $engineThrow->evaluate(['index.php' => '<h1>Test</h1>'], '');

record(
    is_array($resultThrow['issues']) && count($resultThrow['issues']) === 0,
    'FAIL E2E: provider exception should return empty issues, not crash',
    $errors, $passed, $failed
);

// Scenario 6: Missing prompts directory → empty issues (advisory, never blocks)
$fakeProviderNoop = new FakeProvider('{"issues": []}');
$engineMissingDir = new EvaluatorEngine($fakeProviderNoop, '/tmp/nonexistent-prompts-dir-' . uniqid());
$resultMissingDir = $engineMissingDir->evaluate(['index.php' => '<h1>Test</h1>'], '');

record(
    is_array($resultMissingDir['issues']) && count($resultMissingDir['issues']) === 0,
    'FAIL E2E: missing prompts directory should return empty issues, not throw',
    $errors, $passed, $failed
);

// Scenario 7: Prompts dir exists but evaluator.md is missing → empty issues
$tmpPromptsDir = sys_get_temp_dir() . '/evaluator-test-' . uniqid();
mkdir($tmpPromptsDir, 0755, true);
// Don't create evaluator.md — it should degrade gracefully
$engineMissingPrompt = new EvaluatorEngine($fakeProviderNoop, $tmpPromptsDir);
$resultMissingPrompt = $engineMissingPrompt->evaluate(['index.php' => '<h1>Test</h1>'], '');

record(
    is_array($resultMissingPrompt['issues']) && count($resultMissingPrompt['issues']) === 0,
    'FAIL E2E: missing evaluator.md should return empty issues, not throw',
    $errors, $passed, $failed
);
@rmdir($tmpPromptsDir);

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
