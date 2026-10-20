<?php
declare(strict_types=1);

// Exercise actual provider requests against an in-process transport, without API calls.
namespace VoxelSite\Providers {
    function curl_init($url = null) { return (object) ['url' => $url, 'options' => []]; }
    function curl_setopt_array($ch, array $options): bool { $ch->options = $options + $ch->options; return true; }
    function curl_setopt($ch, $key, $value): bool { $ch->options[$key] = $value; return true; }
    function curl_exec($ch) {
        $GLOBALS['capability_payload'] = json_decode($ch->options[CURLOPT_POSTFIELDS] ?? '{}', true);
        if (isset($ch->options[CURLOPT_WRITEFUNCTION])) {
            foreach ($GLOBALS['capability_events'] as $event) {
                ($ch->options[CURLOPT_WRITEFUNCTION])($ch, 'data: ' . json_encode($event) . "\n\n");
            }
            return true;
        }
        return json_encode($GLOBALS['capability_response']);
    }
    function curl_getinfo($ch, $key = null) { return $key === CURLINFO_HTTP_CODE ? 200 : []; }
    function curl_error($ch): string { return ''; }
    function curl_errno($ch): int { return 0; }
    function curl_close($ch): void {}
    function curl_multi_init() { return new \stdClass(); }
    function curl_multi_add_handle($mh, $ch): int { $mh->handle = $ch; return CURLM_OK; }
    function curl_multi_exec($mh, &$running): int { curl_exec($mh->handle); $running = 0; return CURLM_OK; }
    function curl_multi_remove_handle($mh, $ch): int { return CURLM_OK; }
    function curl_multi_close($mh): void {}
}

namespace {
require_once __DIR__ . '/../engine/AIProviderInterface.php';
require_once __DIR__ . '/../engine/Logger.php';
foreach (['OpenAI', 'Claude', 'Gemini', 'DeepSeek', 'OpenAICompatible'] as $name) {
    require_once __DIR__ . '/../engine/providers/' . $name . 'Provider.php';
}

$passed = 0;
$errors = [];
function capCheck(bool $ok, string $message): void {
    global $passed, $errors;
    if ($ok) { $passed++; } else { $errors[] = $message; }
}
function capResolve(object $provider, int $requested, string $model): int {
    return (new ReflectionMethod($provider, 'resolveMaxTokens'))->invoke($provider, $requested, $model);
}
$providers = [
    ['OpenAI', 'gpt-6.1-sol', 128000, 1050000],
    ['Claude', 'claude-sonnet-5-5', 128000, 1000000],
    ['Claude', 'claude-opus-5-5', 128000, 1000000],
    ['Claude', 'claude-haiku-5-5', 128000, 1000000],
    ['DeepSeek', 'deepseek-flash', 393216, 1000000],
    ['DeepSeek', 'deepseek-v4-pro', 393216, 1000000],
];
foreach ($providers as [$name, $model, $limit, $context]) {
    $class = 'VoxelSite\\Providers\\' . $name . 'Provider';
    $provider = new $class('test-key', $model);
    capCheck(capResolve($provider, 110000, $model) === 110000, "$model respects requested 110000 budget");
    capCheck(capResolve($provider, 1000000, $model) === $limit, "$model caps at documented output limit");
    capCheck($provider->getContextWindow($model) === $context, "$model context uses documented capacity");
    capCheck((new ReflectionMethod($provider, 'resolveMaxTokens'))->isPublic(), "$model exposes effective budget");
}

$fallbacks = [
    ['OpenAI', 'unknown', 16384, 128000],
    ['OpenAI', 'gpt-unknown', 16384, 128000],
    ['Claude', 'unknown', 16384, 128000],
    ['Claude', 'claude-opus-future', 32768, 200000],
    ['DeepSeek', 'unknown', 8192, 64000],
    ['Gemini', 'unknown', 8192, 1048576],
    ['OpenAICompatible', 'gpt-6.1-sol', 16384, 32000],
    ['OpenAICompatible', 'openai/gpt-6.1-sol', 8192, 32000],
    ['OpenAICompatible', 'claude-sonnet-5-5-high', 8192, 32000],
];
foreach ($fallbacks as [$name, $model, $limit, $context]) {
    $class = 'VoxelSite\\Providers\\' . $name . 'Provider';
    $provider = new $class('test-key', $model);
    capCheck(capResolve($provider, 110000, $model) === $limit, "$name/$model retains conservative fallback");
    capCheck($provider->getContextWindow($model) === $context, "$name/$model fallback context");
}

foreach (['OpenAI', 'Claude', 'Gemini', 'DeepSeek', 'OpenAICompatible'] as $name) {
    $model = match ($name) {
        'OpenAI' => 'gpt-custom', 'DeepSeek' => 'deepseek-custom', default => 'custom-model',
    };
    $class = 'VoxelSite\\Providers\\' . $name . 'Provider';
    $metadata = [$model => ['max_output_tokens' => 128000, 'context_window' => 1000000, 'source' => 'override']];
    $provider = $name === 'OpenAICompatible'
        ? new $class('test-key', $model, 110000, 'https://example.invalid/v1', $metadata)
        : new $class('test-key', $model, 110000, $metadata);
    capCheck(capResolve($provider, 110000, $model) === 110000, "$name consumes exact metadata");
    capCheck($provider->getContextWindow($model) === 1000000, "$name consumes metadata context");
    capCheck(capResolve($provider, 0, $model) === 1, "$name keeps positive budget");
    $GLOBALS['capability_response'] = [
        'choices' => [['message' => ['content' => 'ok']]],
        'content' => [['type' => 'text', 'text' => 'ok']],
        'candidates' => [['content' => ['parts' => [['text' => 'ok']]]]],
    ];
    $provider->complete('System', [['role' => 'user', 'content' => 'Hello']]);
    $payload = $GLOBALS['capability_payload'];
    $out = $payload['max_tokens'] ?? $payload['max_completion_tokens'] ?? $payload['generationConfig']['maxOutputTokens'] ?? null;
    capCheck($out === 110000, "$name complete wire budget matches resolver");
    if ($name === 'DeepSeek') { continue; } // Fragmented streams covered by DeepSeekStreamTest.
    $reason = $name === 'Claude' ? 'max_tokens' : ($name === 'Gemini' ? 'MAX_TOKENS' : 'length');
    $GLOBALS['capability_events'] = match ($name) {
        'Claude' => [
            ['type' => 'message_delta', 'delta' => ['stop_reason' => $reason], 'usage' => ['output_tokens' => 110000]],
            ['type' => 'message_delta', 'delta' => ['stop_reason' => null]],
        ],
        'Gemini' => [
            ['candidates' => [['finishReason' => $reason]]],
            ['usageMetadata' => ['candidatesTokenCount' => 110000]],
        ],
        default => [
            ['choices' => [['delta' => [], 'finish_reason' => $reason]]],
            ['choices' => [], 'usage' => ['completion_tokens' => 110000]],
        ],
    };
    $usage = [];
    $provider->stream('System', [['role' => 'user', 'content' => 'Hello']], static function () {},
        static function ($text, $value) use (&$usage) { $usage = $value; });
    $payload = $GLOBALS['capability_payload'];
    $out = $payload['max_tokens'] ?? $payload['max_completion_tokens'] ?? $payload['generationConfig']['maxOutputTokens'] ?? null;
    capCheck($out === 110000, "$name stream wire budget matches resolver");
    capCheck(($usage['finish_reason'] ?? null) === $reason, "$name retains finish reason after usage-only event");
}
$openai = new \VoxelSite\Providers\OpenAIProvider('test-key', 'gpt-6.1-sol', 110000);
$openai->complete('System', [['role' => 'user', 'content' => 'Hello']], ['temperature' => 0.5]);
capCheck(($GLOBALS['capability_payload']['max_completion_tokens'] ?? null) === 110000, 'Sol uses max_completion_tokens');
capCheck(!isset($GLOBALS['capability_payload']['max_tokens']), 'Sol omits obsolete max_tokens');
capCheck(($GLOBALS['capability_payload']['messages'][0]['role'] ?? null) === 'developer', 'Sol uses developer role');
capCheck(!isset($GLOBALS['capability_payload']['temperature']), 'Sol omits unsupported temperature');

foreach (['Claude', 'Gemini', 'OpenAICompatible'] as $name) {
    $GLOBALS['capability_response'] = $name === 'Gemini' ? ['models' => [
        ['name' => 'models/gemini-custom', 'supportedGenerationMethods' => ['generateContent'], 'inputTokenLimit' => 1000000, 'outputTokenLimit' => 128000],
    ]] : ['data' => [
        $name === 'Claude'
            ? ['id' => 'custom', 'max_input_tokens' => 1000000, 'max_tokens' => 128000]
            : ['id' => 'custom', 'context_length' => 1000000, 'top_provider' => ['max_completion_tokens' => 128000]],
        ['id' => 'invalid', 'max_input_tokens' => -1, 'max_tokens' => '99999999', 'context_window' => 0],
    ]];
    $class = 'VoxelSite\\Providers\\' . $name . 'Provider';
    $provider = $name === 'OpenAICompatible'
        ? new $class('test-key', null, 16000, 'https://example.invalid/v1')
        : new $class('test-key');
    $models = $provider->listModels();
    capCheck(($models[0]['max_output_tokens'] ?? null) === 128000, "$name exposes live output limit");
    capCheck(($models[0]['context_window'] ?? null) === 1000000, "$name exposes live context");
    capCheck(!isset($models[1]['max_output_tokens']), "$name rejects invalid live limit");
}
if (class_exists(\VoxelSite\ModelCapabilities::class)) {
    $result = \VoxelSite\ModelCapabilities::resolve('openai', 'gpt-6.1-sol', [
        'gpt-6.1-sol' => ['max_output_tokens' => 64000, 'context_window' => 500000, 'source' => 'metadata'],
    ]);
    capCheck($result === ['max_output_tokens' => 64000, 'context_window' => 500000, 'source' => 'metadata'], 'Native live metadata supersedes catalog');
    $result = \VoxelSite\ModelCapabilities::resolve('openai_compatible', 'alias', [
        'alias' => ['max_output_tokens' => 110000, 'context_window' => 1000000, 'source' => 'override'],
    ]);
    capCheck($result['source'] === 'override', 'Explicit override source preserved');
    capCheck(\VoxelSite\ModelCapabilities::resolve('openai_compatible', 'alias-other', [
        'alias' => ['max_output_tokens' => 110000, 'context_window' => 1000000],
    ])['source'] === 'fallback', 'Capability metadata does not leak across aliases');
} else {
    capCheck(false, 'Shared capability registry exists');
}
foreach ($errors as $error) { echo "FAIL: $error\n"; }
echo "$passed passed, " . count($errors) . " failed\n";
exit($errors === [] ? 0 : 1);
}
