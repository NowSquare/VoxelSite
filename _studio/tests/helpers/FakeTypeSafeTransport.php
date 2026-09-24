<?php
declare(strict_types=1);

namespace VoxelSite\Tests;

/** Canned HTTP boundary, never a network call. No credential/header retention. */
final class FakeTypeSafeTransport
{
    public array $requests = [];
    public function __construct(private string $scenario = 'ok', private ?\Closure $beforeCall = null) {}
    public function __invoke(string $url, #[\SensitiveParameter] array $headers, string $body): array
    {
        if ($this->beforeCall !== null) { ($this->beforeCall)(); }
        $request = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        $this->requests[] = $request;
        if ($this->scenario === 'outage') { throw new \RuntimeException('Synthetic timeout'); }
        if ($this->scenario === 'malformed') { return ['status' => 200, 'body' => '{invalid']; }
        $answers = [];
        $choices = ['intent' => 'edit_copy', 'scope' => 'one_section', 'model_tier' => 'cheap', 'repair_target' => 'target_0'];
        foreach ($request['questions'] as $id => $question) {
            if ($question['type'] === 'noul') {
                $answers[$id] = ['type' => 'noul', 'noul' => $id === 'needs_file_write' ? 0.95 : 0.01];
            } else {
                $choice = $choices[$id];
                if ($this->scenario === 'disagree') { $choice = array_key_last($question['criteria']); }
                if (!array_key_exists($choice, $question['criteria'])) { $choice = array_key_first($question['criteria']); }
                $probabilities = array_fill_keys(array_keys($question['criteria']), 0.0);
                $probabilities[$choice] = 1.0;
                $answers[$id] = ['type' => 'choice', 'choice' => $choice, 'confidence' => 1.0, 'probabilities' => $probabilities];
            }
        }
        return ['status' => 200, 'body' => json_encode(['model' => 'jev-fixture', 'answers' => $answers,
            'usage' => ['input_tokens' => 100, 'output_tokens' => 50]], JSON_THROW_ON_ERROR)];
    }
}
