<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/vendor/autoload.php';

use VoxelSite\TypeSafeHttpClient;

$passed = 0; $errors = [];
function check(bool $ok, string $message): void { global $passed, $errors; $ok ? $passed++ : $errors[] = $message; }
if (!class_exists(TypeSafeHttpClient::class)) {
    echo "FAIL: TypeSafe adapter missing\n"; exit(1);
}
$key = bin2hex(random_bytes(32));
$questions = [
    'intent' => ['type' => 'choice', 'instructions' => 'Pick an intent', 'criteria' => ['edit_copy' => 'Edit copy', 'question' => 'Answer only']],
    'needs_file_write' => ['type' => 'noul', 'instructions' => 'Does the request require writing a file?'],
];
$valid = ['model' => 'jev-fixture', 'answers' => [
    'intent' => ['type' => 'choice', 'choice' => 'edit_copy', 'confidence' => 0.9, 'probabilities' => ['edit_copy' => 0.95, 'question' => 0.05]],
    'needs_file_write' => ['type' => 'noul', 'noul' => 0.8],
], 'usage' => ['input_tokens' => 100, 'output_tokens' => 30]];
$calls = [];
$client = new TypeSafeHttpClient($key, function (string $url, array $headers, string $body) use (&$calls, $key, $valid): array {
    $calls[] = json_decode($body, true);
    check($url === 'https://api.typesafe.ai/v1/systemone', 'Fixed HTTPS endpoint');
    check(in_array('Authorization: Bearer ' . $key, $headers, true), 'Credential goes only in Authorization');
    check(!str_contains($body, $key) && !str_contains($body, 'typesafe_api_key'), 'No secret in request state');
    return ['status' => 200, 'body' => json_encode($valid)];
});
$result = $client->evaluate(['brief' => 'Shorten heading', 'governor.typesafe_api_key' => $key], $questions);
check($result['status'] === 'ok', 'Valid response accepted');
check($result['answers'] === $valid['answers'], 'Typed Choice and Noul preserved');
check(!isset($result['answers']['needs_file_write']['confidence']), 'No invented Noul confidence');
check($result['usage'] === $valid['usage'] && $result['cost_usd'] === null, 'Reported usage retained without invented price');
check($calls[0]['model'] === 'jev-latest' && $calls[0]['questions'] === $questions, 'Documented request envelope');

$invalid = [];
$bad = $valid; unset($bad['answers']['needs_file_write']); $invalid[] = $bad;
$bad = $valid; $bad['answers']['intent']['choice'] = '../index.php'; $invalid[] = $bad;
$bad = $valid; $bad['answers']['intent']['confidence'] = '0.9'; $invalid[] = $bad;
$bad = $valid; $bad['answers']['intent']['probabilities']['question'] = -0.1; $invalid[] = $bad;
$bad = $valid; $bad['answers']['intent']['probabilities']['question'] = 0.5; $invalid[] = $bad;
$bad = $valid; $bad['answers']['intent']['choice'] = 'question'; $invalid[] = $bad;
$bad = $valid; $bad['answers']['needs_file_write']['noul'] = 1.1; $invalid[] = $bad;
$bad = $valid; $bad['answers']['needs_file_write']['type'] = 'score'; $invalid[] = $bad;
$bad = $valid; $bad['usage']['input_tokens'] = -1; $invalid[] = $bad;
foreach (array_merge(array_map(fn($body) => json_encode($body), $invalid), ['not JSON ' . $key, 'null', str_repeat('x', 65537)]) as $body) {
    $client = new TypeSafeHttpClient($key, fn() => ['status' => 200, 'body' => $body]);
    $r = $client->evaluate([], $questions);
    check($r['status'] === 'error' && $r['answers'] === [], 'Malformed/oversized response cannot provide a decision');
    check(!str_contains(json_encode($r), $key), 'Malformed response body is never reflected');
}
foreach ([301, 401, 422, 429, 500, 529] as $http) {
    $count = 0;
    $client = new TypeSafeHttpClient($key, function () use (&$count, $http, $key) { $count++; return ['status' => $http, 'body' => $key]; });
    $r = $client->evaluate([], $questions);
    check($r['status'] === 'error' && $r['http_status'] === $http && $count === 1, 'HTTP failure is explicit and bounded to one attempt');
    check(!str_contains(json_encode($r), $key), 'HTTP error body is never reflected');
}
$client = new TypeSafeHttpClient($key, function () use ($key) { throw new RuntimeException('timeout ' . $key); });
$r = $client->evaluate([], $questions);
check($r['status'] === 'error' && $r['error'] === 'transport_unavailable', 'Transport exception is normalized');
check(!str_contains(json_encode($r), $key), 'Transport exception never exposes credential');
$calls = 0;
$client = new TypeSafeHttpClient($key, function () use (&$calls) { $calls++; return []; });
$r = $client->evaluate(['brief' => str_repeat('x', 40000)], $questions);
check($r['status'] === 'error' && $calls === 0, 'Oversized request refused before transport');
$r = $client->evaluate([], ['bad' => ['type' => 'unsupported']]);
check($r['status'] === 'error' && $calls === 0, 'Unsupported question refused before transport');
ob_start(); var_dump($client); $dump = ob_get_clean();
check(!str_contains($dump, $key), 'Debug dump excludes credential and transport closure');
foreach ($errors as $error) { echo 'FAIL: ' . $error . "\n"; }
echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
exit($errors === [] ? 0 : 1);
