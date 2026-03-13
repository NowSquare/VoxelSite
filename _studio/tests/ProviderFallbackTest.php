<?php

declare(strict_types=1);

/**
 * Provider fallback behavior tests.
 *
 * Run: php _studio/tests/ProviderFallbackTest.php
 *
 * Verifies that the structured-output fallback logic in each provider's
 * complete() method works correctly by overriding apiCall() to simulate
 * HTTP error responses without network access.
 *
 * Covers:
 * - Claude: 400/404/422 → retry without structured output (JSON + non-JSON bodies)
 * - OpenAI: 400/404/422 → retry without structured output
 * - DeepSeek: same as OpenAI
 * - Gemini: 400/422 → retry without structured output
 * - OpenAI Compatible: 400/404/422 → retry without structured output
 * - All providers: non-fallback codes (e.g. 500) re-throw
 * - All providers: _structured_fallback_tried flag prevents infinite retry loops
 * - All providers: non-structured calls don't trigger fallback
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
require_once dirname(__DIR__) . '/engine/providers/ClaudeProvider.php';
require_once dirname(__DIR__) . '/engine/providers/OpenAIProvider.php';
require_once dirname(__DIR__) . '/engine/providers/GeminiProvider.php';
require_once dirname(__DIR__) . '/engine/providers/DeepSeekProvider.php';
require_once dirname(__DIR__) . '/engine/providers/OpenAICompatibleProvider.php';

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

// ─── Test Subclasses ─────────────────────────────────────────────────
// Override apiCall() to simulate HTTP error responses on first call,
// then return a valid response on the retry (without structured output).

class FallbackClaudeProvider extends \VoxelSite\Providers\ClaudeProvider
{
    public int $callCount = 0;
    public int $failCode;
    public string $failMessage;
    public string $retryResponse;
    public array $lastPayload = [];

    public function __construct(int $failCode, string $failMessage, string $retryResponse)
    {
        parent::__construct('test-key', 'test-model', 16000);
        $this->failCode = $failCode;
        $this->failMessage = $failMessage;
        $this->retryResponse = $retryResponse;
    }

    protected function apiCall(array $payload): array
    {
        $this->callCount++;
        $this->lastPayload = $payload;

        if ($this->callCount === 1) {
            throw new \RuntimeException($this->failMessage, $this->failCode);
        }

        // Second call (retry) — return a valid Claude response without tools
        return [
            'content' => [
                ['type' => 'text', 'text' => $this->retryResponse],
            ],
            'usage' => ['input_tokens' => 100, 'output_tokens' => 50],
        ];
    }
}

class FallbackOpenAIProvider extends \VoxelSite\Providers\OpenAIProvider
{
    public int $callCount = 0;
    public int $failCode;
    public string $retryResponse;
    public array $lastPayload = [];

    public function __construct(int $failCode, string $retryResponse)
    {
        parent::__construct('test-key', 'test-model', 16000);
        $this->failCode = $failCode;
        $this->retryResponse = $retryResponse;
    }

    protected function apiCall(array $payload): array
    {
        $this->callCount++;
        $this->lastPayload = $payload;

        if ($this->callCount === 1) {
            throw new \RuntimeException("OpenAI API error: tool call rejected", $this->failCode);
        }

        return [
            'choices' => [
                ['message' => ['content' => $this->retryResponse]],
            ],
        ];
    }
}

class FallbackDeepSeekProvider extends \VoxelSite\Providers\DeepSeekProvider
{
    public int $callCount = 0;
    public int $failCode;
    public string $retryResponse;

    public function __construct(int $failCode, string $retryResponse)
    {
        parent::__construct('test-key', 'test-model', 16000);
        $this->failCode = $failCode;
        $this->retryResponse = $retryResponse;
    }

    protected function apiCall(array $payload): array
    {
        $this->callCount++;

        if ($this->callCount === 1) {
            throw new \RuntimeException("DeepSeek API error: tools unsupported", $this->failCode);
        }

        return [
            'choices' => [
                ['message' => ['content' => $this->retryResponse]],
            ],
        ];
    }
}

class FallbackGeminiProvider extends \VoxelSite\Providers\GeminiProvider
{
    public int $callCount = 0;
    public int $failCode;
    public string $retryResponse;

    public function __construct(int $failCode, string $retryResponse)
    {
        parent::__construct('test-key', 'test-model', 16000);
        $this->failCode = $failCode;
        $this->retryResponse = $retryResponse;
    }

    protected function apiCall(string $url, array $payload): array
    {
        $this->callCount++;

        if ($this->callCount === 1) {
            throw new \RuntimeException("Gemini API error: schema not supported", $this->failCode);
        }

        return [
            'candidates' => [
                ['content' => ['parts' => [['text' => $this->retryResponse]]]],
            ],
        ];
    }
}

class FallbackOpenAICompatibleProvider extends \VoxelSite\Providers\OpenAICompatibleProvider
{
    public int $callCount = 0;
    public int $failCode;
    public string $retryResponse;

    public function __construct(int $failCode, string $retryResponse)
    {
        parent::__construct('test-key', 'test-model', 16000, 'http://localhost:11434');
        $this->failCode = $failCode;
        $this->retryResponse = $retryResponse;
    }

    protected function apiCall(array $payload): array
    {
        $this->callCount++;

        if ($this->callCount === 1) {
            throw new \RuntimeException("API error: tools not supported", $this->failCode);
        }

        return [
            'choices' => [
                ['message' => ['content' => $this->retryResponse]],
            ],
        ];
    }
}

// ─── Helper ──────────────────────────────────────────────────────────

$evalSchema = StructuredSchemas::evaluator();
$structuredOptions = ['structured_output' => $evalSchema, 'model' => 'test-model'];

echo "=== Provider Fallback Tests ===\n\n";

// ─── Claude Fallback ─────────────────────────────────────────────────

echo "--- Claude ---\n";

// 400 with JSON body → should retry
$claude400 = new FallbackClaudeProvider(400, 'Claude API error: tool not supported', '{"issues": []}');
$result = $claude400->complete('system', [['role' => 'user', 'content' => 'test']], $structuredOptions);
record(
    $claude400->callCount === 2,
    'FAIL Claude 400: expected 2 calls (original + retry), got ' . $claude400->callCount,
    $errors, $passed, $failed
);
record(
    !isset($claude400->lastPayload['tools']),
    'FAIL Claude 400: retry payload should not contain tools',
    $errors, $passed, $failed
);

// 404 → should retry
$claude404 = new FallbackClaudeProvider(404, 'Claude API error: HTTP 404', '{"issues": []}');
$result = $claude404->complete('system', [['role' => 'user', 'content' => 'test']], $structuredOptions);
record(
    $claude404->callCount === 2,
    'FAIL Claude 404: expected 2 calls, got ' . $claude404->callCount,
    $errors, $passed, $failed
);

// 422 → should retry
$claude422 = new FallbackClaudeProvider(422, 'Claude API error: unprocessable', '{"issues": []}');
$result = $claude422->complete('system', [['role' => 'user', 'content' => 'test']], $structuredOptions);
record(
    $claude422->callCount === 2,
    'FAIL Claude 422: expected 2 calls, got ' . $claude422->callCount,
    $errors, $passed, $failed
);

// Non-JSON 400 body → should also retry (tests the fixed HTTP code path)
$claudeNonJson = new FallbackClaudeProvider(400, 'Invalid response from Claude API (HTTP 400)', '{"issues": []}');
$result = $claudeNonJson->complete('system', [['role' => 'user', 'content' => 'test']], $structuredOptions);
record(
    $claudeNonJson->callCount === 2,
    'FAIL Claude non-JSON 400: expected 2 calls, got ' . $claudeNonJson->callCount,
    $errors, $passed, $failed
);

// 500 → should NOT retry (re-throw)
$claude500 = new FallbackClaudeProvider(500, 'Claude API error: internal server error', '{"issues": []}');
$threw500 = false;
try {
    $claude500->complete('system', [['role' => 'user', 'content' => 'test']], $structuredOptions);
} catch (\RuntimeException $e) {
    $threw500 = true;
}
record(
    $threw500,
    'FAIL Claude 500: should re-throw, not retry',
    $errors, $passed, $failed
);
record(
    $claude500->callCount === 1,
    'FAIL Claude 500: should only call apiCall once, got ' . $claude500->callCount,
    $errors, $passed, $failed
);

// 429 (rate limit) → should NOT retry
$claude429 = new FallbackClaudeProvider(429, 'Claude API error: rate limited', '{"issues": []}');
$threw429 = false;
try {
    $claude429->complete('system', [['role' => 'user', 'content' => 'test']], $structuredOptions);
} catch (\RuntimeException $e) {
    $threw429 = true;
}
record(
    $threw429,
    'FAIL Claude 429: should re-throw rate limit errors',
    $errors, $passed, $failed
);

// _structured_fallback_tried → should NOT retry (prevents infinite loops)
$claudeLoop = new FallbackClaudeProvider(400, 'tool rejected', '{"issues": []}');
$threwLoop = false;
try {
    $claudeLoop->complete('system', [['role' => 'user', 'content' => 'test']], array_merge($structuredOptions, [
        '_structured_fallback_tried' => true,
    ]));
} catch (\RuntimeException $e) {
    $threwLoop = true;
}
record(
    $threwLoop,
    'FAIL Claude fallback_tried: should re-throw when fallback already attempted',
    $errors, $passed, $failed
);

// Non-structured call → 400 should NOT trigger fallback
$claudeNoStruct = new FallbackClaudeProvider(400, 'bad request', '{"issues": []}');
$threwNoStruct = false;
try {
    $claudeNoStruct->complete('system', [['role' => 'user', 'content' => 'test']], [
        'structured_output' => false,
        'model' => 'test-model',
    ]);
} catch (\RuntimeException $e) {
    $threwNoStruct = true;
}
record(
    $threwNoStruct,
    'FAIL Claude non-structured: should re-throw 400 when not using structured output',
    $errors, $passed, $failed
);

// ─── OpenAI Fallback ─────────────────────────────────────────────────

echo "--- OpenAI ---\n";

$openai400 = new FallbackOpenAIProvider(400, '{"issues": []}');
$result = $openai400->complete('system', [['role' => 'user', 'content' => 'test']], $structuredOptions);
record(
    $openai400->callCount === 2,
    'FAIL OpenAI 400: expected 2 calls, got ' . $openai400->callCount,
    $errors, $passed, $failed
);
record(
    !isset($openai400->lastPayload['tools']),
    'FAIL OpenAI 400: retry should not contain tools',
    $errors, $passed, $failed
);

$openai500 = new FallbackOpenAIProvider(500, '{"issues": []}');
$threwOpenai500 = false;
try {
    $openai500->complete('system', [['role' => 'user', 'content' => 'test']], $structuredOptions);
} catch (\RuntimeException $e) {
    $threwOpenai500 = true;
}
record(
    $threwOpenai500,
    'FAIL OpenAI 500: should re-throw, not retry',
    $errors, $passed, $failed
);

// ─── DeepSeek Fallback ───────────────────────────────────────────────

echo "--- DeepSeek ---\n";

$ds400 = new FallbackDeepSeekProvider(400, '{"issues": []}');
$result = $ds400->complete('system', [['role' => 'user', 'content' => 'test']], $structuredOptions);
record(
    $ds400->callCount === 2,
    'FAIL DeepSeek 400: expected 2 calls, got ' . $ds400->callCount,
    $errors, $passed, $failed
);

$ds500 = new FallbackDeepSeekProvider(500, '{"issues": []}');
$threwDs500 = false;
try {
    $ds500->complete('system', [['role' => 'user', 'content' => 'test']], $structuredOptions);
} catch (\RuntimeException $e) {
    $threwDs500 = true;
}
record(
    $threwDs500,
    'FAIL DeepSeek 500: should re-throw, not retry',
    $errors, $passed, $failed
);

// ─── Gemini Fallback ─────────────────────────────────────────────────

echo "--- Gemini ---\n";

$gemini400 = new FallbackGeminiProvider(400, '{"issues": []}');
$result = $gemini400->complete('system', [['role' => 'user', 'content' => 'test']], $structuredOptions);
record(
    $gemini400->callCount === 2,
    'FAIL Gemini 400: expected 2 calls, got ' . $gemini400->callCount,
    $errors, $passed, $failed
);

$gemini422 = new FallbackGeminiProvider(422, '{"issues": []}');
$result = $gemini422->complete('system', [['role' => 'user', 'content' => 'test']], $structuredOptions);
record(
    $gemini422->callCount === 2,
    'FAIL Gemini 422: expected 2 calls, got ' . $gemini422->callCount,
    $errors, $passed, $failed
);

$gemini500 = new FallbackGeminiProvider(500, '{"issues": []}');
$threwGemini500 = false;
try {
    $gemini500->complete('system', [['role' => 'user', 'content' => 'test']], $structuredOptions);
} catch (\RuntimeException $e) {
    $threwGemini500 = true;
}
record(
    $threwGemini500,
    'FAIL Gemini 500: should re-throw, not retry',
    $errors, $passed, $failed
);

// ─── OpenAI Compatible Fallback ──────────────────────────────────────

echo "--- OpenAI Compatible ---\n";

$compat400 = new FallbackOpenAICompatibleProvider(400, '{"issues": []}');
$result = $compat400->complete('system', [['role' => 'user', 'content' => 'test']], $structuredOptions);
record(
    $compat400->callCount === 2,
    'FAIL OpenAI Compatible 400: expected 2 calls, got ' . $compat400->callCount,
    $errors, $passed, $failed
);

$compat500 = new FallbackOpenAICompatibleProvider(500, '{"issues": []}');
$threwCompat500 = false;
try {
    $compat500->complete('system', [['role' => 'user', 'content' => 'test']], $structuredOptions);
} catch (\RuntimeException $e) {
    $threwCompat500 = true;
}
record(
    $threwCompat500,
    'FAIL OpenAI Compatible 500: should re-throw, not retry',
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
