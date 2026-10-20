<?php

declare(strict_types=1);

/**
 * Shared stream regressions for DeepSeek, OpenAI, and OpenAI-Compatible.
 * Include from the provider's standalone *StreamTest.php entry point.
 *
 * Only the cURL transport is replaced. Provider parsing, callbacks, structured
 * output normalization, error handling, and retry behavior run unchanged.
 */

namespace VoxelSite\Providers {
    final class OpenAIStreamTransport
    {
        public static array $responses = [];
        public static array $requests = [];
    }

    function curl_init(string $url): object
    {
        if (OpenAIStreamTransport::$responses === []) {
            throw new \LogicException('Unexpected additional provider request.');
        }

        return (object) [
            'options' => [],
            'response' => array_shift(OpenAIStreamTransport::$responses),
        ];
    }

    function curl_setopt_array(object $handle, array $options): bool
    {
        $handle->options = $options;
        return true;
    }

    function curl_exec(object $handle): bool
    {
        OpenAIStreamTransport::$requests[] = json_decode($handle->options[CURLOPT_POSTFIELDS], true, 512, JSON_THROW_ON_ERROR);
        $write = $handle->options[CURLOPT_WRITEFUNCTION];
        foreach ($handle->response['chunks'] as $chunk) {
            if ($write($handle, $chunk) !== strlen($chunk)) {
                throw new \LogicException('Write callback must acknowledge every received byte.');
            }
        }
        return ($handle->response['error'] ?? '') === '';
    }

    function curl_getinfo(object $handle, int $option): int
    {
        return $handle->response['status'] ?? 200;
    }

    function curl_error(object $handle): string
    {
        return $handle->response['error'] ?? '';
    }

    function curl_close(object $handle): void
    {
    }

    function curl_multi_init(): object
    {
        return (object) ['handles' => []];
    }

    function curl_multi_add_handle(object $multi, object $handle): int
    {
        $multi->handles[] = $handle;
        return CURLM_OK;
    }

    function curl_multi_exec(object $multi, int &$running): int
    {
        foreach ($multi->handles as $handle) {
            curl_exec($handle);
        }
        $running = 0;
        return CURLM_OK;
    }

    function curl_multi_select(object $multi, float $timeout): int
    {
        return 0;
    }

    function curl_multi_remove_handle(object $multi, object $handle): int
    {
        return CURLM_OK;
    }

    function curl_multi_close(object $multi): void
    {
    }
}

namespace {
    require_once dirname(__DIR__, 2) . '/engine/AIProviderInterface.php';
    require_once dirname(__DIR__, 2) . '/engine/providers/DeepSeekProvider.php';
    require_once dirname(__DIR__, 2) . '/engine/providers/OpenAIProvider.php';
    require_once dirname(__DIR__, 2) . '/engine/providers/OpenAICompatibleProvider.php';

    use VoxelSite\Providers\OpenAIStreamTransport;

    $passed = 0;
    $failed = 0;
    $failures = [];

    function streamSame(mixed $expected, mixed $actual, string $message): void
    {
        global $passed, $failed, $failures;
        if ($expected === $actual) {
            $passed++;
            return;
        }
        $failed++;
        if (count($failures) < 20) {
            $failures[] = $message . ': expected ' . var_export($expected, true) . ', got ' . var_export($actual, true);
        }
    }

    function sse(array $event, string $newline = "\n"): string
    {
        return 'data: ' . json_encode($event, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . $newline . $newline;
    }

    function runStream(array $responses, array $options = []): array
    {
        global $streamProviderFactory;
        OpenAIStreamTransport::$responses = $responses;
        OpenAIStreamTransport::$requests = [];
        $result = ['tokens' => [], 'completions' => [], 'error' => null];
        try {
            $streamProviderFactory()->stream(
                'Return the requested files.',
                [['role' => 'user', 'content' => 'Build a café site.']],
                function (string $token) use (&$result): void {
                    $result['tokens'][] = $token;
                },
                function (string $response, array $usage) use (&$result): void {
                    $result['completions'][] = ['response' => $response, 'usage' => $usage];
                },
                $options
            );
        } catch (\RuntimeException $e) {
            $result['error'] = $e->getMessage();
        }
        $result['requests'] = OpenAIStreamTransport::$requests;
        return $result;
    }

    function assertTextStream(array $chunks, array $tokens, string $label): void
    {
        $result = runStream([['chunks' => $chunks]]);
        streamSame(null, $result['error'], "{$label}: no error");
        streamSame($tokens, $result['tokens'], "{$label}: token callbacks");
        streamSame(1, count($result['completions']), "{$label}: one completion");
        $completion = $result['completions'][0] ?? [];
        streamSame(implode('', $tokens), $completion['response'] ?? null, "{$label}: complete response");
        streamSame(10, $completion['usage']['input_tokens'] ?? null, "{$label}: input usage");
        streamSame(12, $completion['usage']['output_tokens'] ?? null, "{$label}: output usage");
    }

    $textTokens = [
        "<file path=\"index.php\" action=\"write\">\n",
        '<?php echo "Kopi Senja ☕ — café"; ?>',
        "\n</file>",
    ];
    $wire = ": keep-alive\r\n\r\n";
    foreach ($textTokens as $token) {
        $wire .= sse(['choices' => [['delta' => ['content' => $token]]]], "\r\n");
    }
    $wire .= sse(['choices' => [['delta' => [], 'finish_reason' => 'stop']]]);
    // Usage-only events have no choice and must not erase the finish reason.
    $wire .= sse(['choices' => [], 'usage' => ['prompt_tokens' => 10, 'completion_tokens' => 12]]);
    $wire .= "data: [DONE]\n\n";

    assertTextStream([$wire], $textTokens, 'all events in one callback');
    assertTextStream(str_split($wire, 7), $textTokens, 'issue #5 seven-byte chunks');
    assertTextStream(str_split($wire, 1), $textTokens, 'one-byte chunks including UTF-8');
    for ($split = 1; $split < strlen($wire); $split++) {
        assertTextStream([substr($wire, 0, $split), substr($wire, $split)], $textTokens, "text split {$split}");
    }

    $result = runStream([['chunks' => str_split($wire, 7)]]);
    streamSame('stop', $result['completions'][0]['usage']['finish_reason'] ?? null, 'finish reason survives usage-only event');
    $lengthWire = sse(['choices' => [['delta' => ['content' => 'partial'], 'finish_reason' => 'length']]]);
    $result = runStream([['chunks' => str_split($lengthWire, 1)]]);
    streamSame('length', $result['completions'][0]['usage']['finish_reason'] ?? null, 'output-limit finish reason is exposed');

    $unterminated = rtrim(sse(['choices' => [['delta' => ['content' => 'final café ☕']]]]), "\n");
    $result = runStream([['chunks' => str_split($unterminated, 7)]]);
    streamSame(['final café ☕'], $result['tokens'], 'final unterminated line emits token once');
    streamSame('final café ☕', $result['completions'][0]['response'] ?? null, 'final unterminated line is flushed');
    streamSame(null, $result['completions'][0]['usage']['finish_reason'] ?? null, 'missing finish reason stays unknown');

    $unterminatedUsage = rtrim(sse(['choices' => [], 'usage' => ['prompt_tokens' => 123, 'completion_tokens' => 456]]), "\n");
    $result = runStream([['chunks' => str_split($unterminatedUsage, 1)]]);
    streamSame(123, $result['completions'][0]['usage']['input_tokens'] ?? null, 'final unterminated usage input');
    streamSame(456, $result['completions'][0]['usage']['output_tokens'] ?? null, 'final unterminated usage output');

    $validBeforeMalformed = sse(['choices' => [['delta' => ['content' => 'retained']]]])
        . "data: {invalid JSON}\n\n"
        . "data: {\"choices\":[";
    $result = runStream([['chunks' => str_split($validBeforeMalformed, 7)]]);
    streamSame(['retained'], $result['tokens'], 'malformed complete and final records do not corrupt earlier tokens');
    streamSame('retained', $result['completions'][0]['response'] ?? null, 'malformed records are ignored');

    // Names and arguments can span model deltas as well as network callbacks.
    $toolArgs = ['{"assistant_message":"Café ☕",', '"operations":[{"path":"index.php",', '"action":"write","content":"<?php echo \\"✓\\"; ?>"}]}'];
    $toolWire = sse(['choices' => [['delta' => ['tool_calls' => [
        ['index' => 0, 'function' => ['name' => 'other_tool', 'arguments' => '{"ignored":true}']],
    ]]]]]);
    foreach (['apply_', 'voxelsite_', 'changes'] as $i => $name) {
        $toolWire .= sse(['choices' => [['delta' => ['tool_calls' => [
            ['index' => 1, 'function' => ['name' => $name, 'arguments' => $toolArgs[$i]]],
        ]]]]]);
    }
    $toolWire .= sse(['choices' => [['delta' => [], 'finish_reason' => 'tool_calls']], 'usage' => ['prompt_tokens' => 20, 'completion_tokens' => 30]]);
    $toolWire .= 'data: [DONE]'; // Final sentinel deliberately has no newline.
    $expectedTool = json_encode(json_decode(implode('', $toolArgs), true, 512, JSON_THROW_ON_ERROR), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $toolChunkings = [[$toolWire], str_split($toolWire, 1), str_split($toolWire, 7)];
    for ($split = 1; $split < strlen($toolWire); $split++) {
        $toolChunkings[] = [substr($toolWire, 0, $split), substr($toolWire, $split)];
    }
    foreach ($toolChunkings as $i => $chunks) {
        $result = runStream([['chunks' => $chunks]], ['structured_output' => true]);
        streamSame(null, $result['error'], "tool chunking {$i}: no error");
        streamSame(['{"ignored":true}', ...$toolArgs], $result['tokens'], "tool chunking {$i}: argument deltas");
        streamSame($expectedTool, $result['completions'][0]['response'] ?? null, "tool chunking {$i}: matching tool payload");
        streamSame(20, $result['completions'][0]['usage']['input_tokens'] ?? null, "tool chunking {$i}: input usage");
        streamSame(30, $result['completions'][0]['usage']['output_tokens'] ?? null, "tool chunking {$i}: output usage");
    }
    streamSame('tool_calls', $result['completions'][0]['usage']['finish_reason'] ?? null, 'structured finish reason');

    $customWire = sse(['choices' => [['delta' => ['tool_calls' => [
        ['index' => 0, 'function' => ['name' => 'review_site', 'arguments' => '{"issues":[]}']],
    ]]]]]);
    $result = runStream([['chunks' => str_split($customWire, 7)]], [
        'structured_output' => ['tool_name' => 'review_site', 'schema' => ['type' => 'object']],
    ]);
    streamSame('{"issues":[]}', $result['completions'][0]['response'] ?? null, 'custom structured tool still normalizes output');
    $result = runStream([['chunks' => str_split($customWire, 7)]]);
    streamSame([], $result['tokens'], 'text mode ignores tool argument deltas');

    // Preserve spaces and UTF-8 in JSON error bodies, even with no final newline.
    $errorBody = json_encode(['error' => ['message' => 'Balance for café is insufficient']], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
    $errorChunkings = [[$errorBody], str_split($errorBody, 1), str_split($errorBody, 7)];
    for ($split = 1; $split < strlen($errorBody); $split++) {
        $errorChunkings[] = [substr($errorBody, 0, $split), substr($errorBody, $split)];
    }
    foreach ($errorChunkings as $i => $chunks) {
        $result = runStream([['status' => 402, 'chunks' => $chunks]]);
        streamSame("{$streamApiName} error (HTTP 402): Balance for café is insufficient", $result['error'], "HTTP error chunking {$i}: message");
        streamSame([], $result['completions'], "HTTP error chunking {$i}: no completion");
        streamSame([], $result['tokens'], "HTTP error chunking {$i}: no tokens");
    }

    $toolError = '{"error":{"message":"Unsupported tool_choice for this model"}}';
    foreach ([400, 404, 422, 501] as $status) {
        $result = runStream([
            ['status' => $status, 'chunks' => str_split($toolError, 7)],
            ['chunks' => str_split($wire, 1)],
        ], ['structured_output' => true]);
        streamSame(null, $result['error'], "tool rejection {$status}: retry succeeds");
        streamSame(2, count($result['requests']), "tool rejection {$status}: exactly one retry");
        streamSame(true, isset($result['requests'][0]['tools']), "tool rejection {$status}: initial request has tools");
        streamSame(false, isset($result['requests'][1]['tools']), "tool rejection {$status}: retry omits tools");
        streamSame(false, isset($result['requests'][1]['tool_choice']), "tool rejection {$status}: retry omits tool choice");
        streamSame($textTokens, $result['tokens'], "tool rejection {$status}: fallback tokens");
        streamSame(1, count($result['completions']), "tool rejection {$status}: single completion");
        streamSame(implode('', $textTokens), $result['completions'][0]['response'] ?? null, "tool rejection {$status}: complete response");
    }

    $result = runStream([
        ['status' => 400, 'chunks' => str_split($toolError, 7)],
        ['status' => 400, 'chunks' => str_split($toolError, 7)],
    ], ['structured_output' => true]);
    streamSame(2, count($result['requests']), 'second rejection does not loop');
    streamSame("{$streamApiName} error (HTTP 400): Unsupported tool_choice for this model", $result['error'], 'second rejection preserves API error');
    streamSame([], $result['completions'], 'second rejection does not complete');

    foreach ([
        ['structured_output' => false],
        ['structured_output' => true, '_structured_fallback_tried' => true],
    ] as $options) {
        $result = runStream([['status' => 400, 'chunks' => str_split($toolError, 7)]], $options);
        streamSame(1, count($result['requests']), 'fallback guard prevents retry');
        streamSame("{$streamApiName} error (HTTP 400): Unsupported tool_choice for this model", $result['error'], 'fallback guard preserves error');
    }
    $result = runStream([['status' => 422, 'chunks' => str_split($errorBody, 1)]], ['structured_output' => true]);
    streamSame(1, count($result['requests']), 'unrelated validation error does not retry tools');
    streamSame("{$streamApiName} error (HTTP 422): Balance for café is insufficient", $result['error'], 'unrelated validation error preserves message');

    foreach ([401 => 'invalid_api_key', 429 => 'rate_limited', 500 => 'provider_unavailable'] as $status => $expected) {
        $result = runStream([['status' => $status, 'chunks' => str_split($errorBody, 7)]], ['structured_output' => true]);
        streamSame($expected, $result['error'], "HTTP {$status}: stable error category");
        streamSame(1, count($result['requests']), "HTTP {$status}: no retry");
        streamSame([], $result['completions'], "HTTP {$status}: no completion");
    }
    $result = runStream([['chunks' => [], 'error' => 'Connection reset by peer']]);
    streamSame("{$streamApiName} connection failed: Connection reset by peer", $result['error'], 'transport errors remain errors');
    streamSame([], $result['completions'], 'transport failure does not complete');

    echo "{$streamLabel} stream: {$passed} passed, {$failed} failed\n";
    foreach ($failures as $failure) {
        echo "FAIL {$failure}\n";
    }
    exit($failed > 0 ? 1 : 0);
}
