<?php
declare(strict_types=1);

namespace VoxelSite;

/** Bounded System One routing adapter (Choice/Noul), not a generator or full SDK. */
final class TypeSafeHttpClient implements TypeSafeClientInterface
{
    private const ENDPOINT = 'https://api.typesafe.ai/v1/systemone';
    private const MAX_RESPONSE_BYTES = 65536;
    private \Closure $transport;

    public function __construct(#[\SensitiveParameter] private string $key, ?callable $transport = null)
    {
        RouterSecrets::remember($key);
        if (!preg_match('/^[\x21-\x7E]{1,4096}$/D', $key)) { throw new \RuntimeException('governor_configuration'); }
        $this->transport = $transport === null ? $this->post(...) : \Closure::fromCallable($transport);
    }

    public function __debugInfo(): array { return ['endpoint' => self::ENDPOINT]; }

    public function evaluate(array $state, array $questions): array
    {
        $start = hrtime(true);
        $base = ['status' => 'error', 'answers' => [], 'model' => null, 'usage' => null,
            'cost_usd' => null, 'duration_ms' => 0.0, 'http_status' => null, 'calls' => 0, 'error' => 'invalid_request'];
        try {
            $this->validateQuestions($questions);
            $body = json_encode(RouterSecrets::redact(['model' => 'jev-latest', 'state' => $state, 'questions' => $questions]), JSON_THROW_ON_ERROR);
            if (strlen($body) > 32768) { return $base; }
        } catch (\Throwable) { return $base; }
        $base['calls'] = 1;
        try {
            $reply = ($this->transport)(self::ENDPOINT,
                ['Authorization: Bearer ' . $this->key, 'Content-Type: application/json', 'Accept: application/json'], $body);
        } catch (\Throwable) {
            $base['error'] = 'transport_unavailable';
            $base['duration_ms'] = (hrtime(true) - $start) / 1e6;
            return $base;
        }
        $base['duration_ms'] = (hrtime(true) - $start) / 1e6;
        $base['http_status'] = is_int($reply['status'] ?? null) ? $reply['status'] : null;
        if ($base['http_status'] !== 200) { $base['error'] = 'http_error'; return $base; }
        $base['error'] = 'invalid_response';
        if (!is_string($reply['body'] ?? null) || strlen($reply['body']) > self::MAX_RESPONSE_BYTES) { return $base; }
        try {
            $response = json_decode($reply['body'], true, 32, JSON_THROW_ON_ERROR);
            if (!is_array($response) || !is_string($response['model'] ?? null)
                || !preg_match('/^jev-[a-zA-Z0-9._-]{1,80}$/D', $response['model'])
                || !is_array($response['answers'] ?? null)) { return $base; }
            $answers = [];
            foreach ($questions as $id => $question) {
                $answer = $response['answers'][$id] ?? null;
                if (!is_array($answer) || ($answer['type'] ?? null) !== $question['type']) { return $base; }
                if ($question['type'] === 'noul') {
                    if (!$this->probability($answer['noul'] ?? null)) { return $base; }
                    $answers[$id] = ['type' => 'noul', 'noul' => $answer['noul']];
                    continue;
                }
                $probabilities = $answer['probabilities'] ?? null;
                $choice = $answer['choice'] ?? null;
                if (!is_string($choice) || !array_key_exists($choice, $question['criteria'])
                    || !$this->probability($answer['confidence'] ?? null) || !is_array($probabilities)
                    || count($probabilities) !== count($question['criteria'])
                    || array_diff(array_keys($question['criteria']), array_keys($probabilities)) !== []) { return $base; }
                foreach ($probabilities as $probability) { if (!$this->probability($probability)) { return $base; } }
                if (abs(array_sum($probabilities) - 1) > 0.001 || $probabilities[$choice] < max($probabilities)) { return $base; }
                $answers[$id] = ['type' => 'choice', 'choice' => $choice, 'confidence' => $answer['confidence'], 'probabilities' => $probabilities];
            }
            $usage = $response['usage'] ?? [];
            foreach (['input_tokens', 'output_tokens'] as $field) {
                if (!is_int($usage[$field] ?? null) || $usage[$field] < 0) { return $base; }
            }
            return RouterSecrets::redact(array_replace($base, ['status' => 'ok', 'answers' => $answers, 'error' => null,
                'model' => $response['model'], 'usage' => array_intersect_key($usage, array_flip(['input_tokens', 'output_tokens']))]));
        } catch (\Throwable) { return $base; }
    }

    private function probability(mixed $value): bool
    {
        return (is_float($value) || is_int($value)) && is_finite((float) $value) && $value >= 0 && $value <= 1;
    }

    private function validateQuestions(array $questions): void
    {
        if ($questions === [] || count($questions) > 16) { throw new \RuntimeException(); }
        foreach ($questions as $id => $question) {
            if (!is_string($id) || !preg_match('/^[a-zA-Z0-9_-]{1,80}$/D', $id) || !is_array($question)
                || !is_string($question['instructions'] ?? null) || $question['instructions'] === ''
                || !in_array($question['type'] ?? null, ['choice', 'noul'], true)) { throw new \RuntimeException(); }
            if ($question['type'] === 'choice') {
                $criteria = $question['criteria'] ?? null;
                if (!is_array($criteria) || $criteria === [] || count($criteria) > 255) { throw new \RuntimeException(); }
                foreach ($criteria as $option => $description) {
                    if (!is_string($option) || !preg_match('/^[a-zA-Z0-9_-]{1,80}$/D', $option)
                        || (!is_string($description) && $description !== null)) { throw new \RuntimeException(); }
                }
            }
        }
    }

    /** Fixed destination, TLS verification, no redirects, one attempt, hard bounds. */
    private function post(string $url, #[\SensitiveParameter] array $headers, string $body): array
    {
        if (!function_exists('curl_init')) { throw new \RuntimeException('transport_unavailable'); }
        $curl = curl_init($url);
        $response = '';
        try {
            curl_setopt_array($curl, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body, CURLOPT_HTTPHEADER => $headers,
                CURLOPT_CONNECTTIMEOUT_MS => 1000, CURLOPT_TIMEOUT_MS => 5000, CURLOPT_FOLLOWLOCATION => false,
                CURLOPT_PROTOCOLS => CURLPROTO_HTTPS, CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2,
                CURLOPT_WRITEFUNCTION => static function ($handle, string $chunk) use (&$response): int {
                    if (strlen($response) + strlen($chunk) > self::MAX_RESPONSE_BYTES) { return 0; }
                    $response .= $chunk; return strlen($chunk);
                }]);
            if (curl_exec($curl) === false) { throw new \RuntimeException('transport_unavailable'); }
            return ['status' => (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE), 'body' => $response];
        } finally { curl_close($curl); }
    }
}
