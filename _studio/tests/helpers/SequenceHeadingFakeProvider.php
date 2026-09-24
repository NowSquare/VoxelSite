<?php
declare(strict_types=1);
namespace VoxelSite\Tests;
require_once __DIR__ . '/RouterHeadingFixture.php';
/** Fresh canned text per logical call; no network or installed configuration. */
final class SequenceHeadingFakeProvider implements \VoxelSite\AIProviderInterface
{
    public array $calls = [];
    public ?\Closure $duringChunk = null;
    public int $failAt = 0;
    private HeadingFakeProvider $delegate;
    public function __construct(private array $candidates) { $this->delegate = new HeadingFakeProvider(''); }
    public function stream(string $systemPrompt, array $messages, callable $onToken, callable $onComplete, array $options = []): void {
        $index = count($this->calls);
        $this->delegate = new HeadingFakeProvider($this->candidates[$index] ?? end($this->candidates));
        $this->delegate->fail = $this->failAt === $index + 1;
        $this->delegate->duringChunk = $this->duringChunk;
        $this->calls[] = [];
        try { $this->delegate->stream($systemPrompt, $messages, $onToken, $onComplete, $options); }
        finally { $this->calls[$index] = $this->delegate->calls[0] ?? []; }
    }
    public function complete(string $systemPrompt, array $messages, array $options = []): string { throw new \RuntimeException('Unexpected complete'); }
    public function getId(): string { return $this->delegate->getId(); }
    public function getName(): string { return $this->delegate->getName(); }
    public function getModels(): array { return $this->delegate->getModels(); }
    public function listModels(): array { return $this->delegate->listModels(); }
    public function testConnection(): array { return []; }
    public function getConfigFields(): array { return []; }
    public function validateConfig(array $config): bool { return true; }
    public function getContextWindow(string $model): int { return $this->delegate->getContextWindow($model); }
    public function estimateTokens(string $text): int { return $this->delegate->estimateTokens($text); }
    public function estimateCost(int $inputTokens, int $outputTokens, string $model): array { return $this->delegate->estimateCost($inputTokens,$outputTokens,$model); }
}
