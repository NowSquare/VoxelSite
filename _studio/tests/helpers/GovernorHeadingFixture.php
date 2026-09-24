<?php

declare(strict_types=1);

namespace VoxelSite\Tests;

use RuntimeException;
use VoxelSite\AIProviderInterface;

require_once dirname(__DIR__, 2) . '/engine/AIProviderInterface.php';

final class GovernorHeadingFixture
{
    public static function manifest(): array
    {
        $root = dirname(__DIR__) . '/fixtures/governor-heading';
        $data = json_decode(file_get_contents($root . '/fixture.json'), true, 512, JSON_THROW_ON_ERROR);
        foreach ($data['files_sha256'] as $path => $hash) {
            if (hash_file('sha256', $root . '/site/' . $path) !== $hash) {
                throw new RuntimeException('Frozen fixture changed: ' . $path);
            }
        }
        if (hash_file('sha256', $root . '/expected-index.php') !== $data['expected_output_sha256']) {
            throw new RuntimeException('Frozen expected heading output changed');
        }
        return $data;
    }

    public static function create(): string
    {
        self::manifest();
        $root = sys_get_temp_dir() . '/voxelsite-governor-' . bin2hex(random_bytes(8));
        mkdir($root, 0700);
        self::copyTree(dirname(__DIR__) . '/fixtures/governor-heading/site', $root);
        return $root;
    }

    public static function copyTree(string $from, string $to): void
    {
        if (!is_dir($to)) {
            mkdir($to, 0700, true);
        }
        foreach (scandir($from) as $name) {
            if ($name === '.' || $name === '..') {
                continue;
            }
            is_dir($from . '/' . $name)
                ? self::copyTree($from . '/' . $name, $to . '/' . $name)
                : copy($from . '/' . $name, $to . '/' . $name);
        }
    }

    public static function snapshot(string $root): array
    {
        $files = [];
        $iterator = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS));
        foreach ($iterator as $file) {
            $files[substr($file->getPathname(), strlen($root) + 1)] = hash_file('sha256', $file->getPathname());
        }
        ksort($files);
        return $files;
    }

    public static function remove(string $root): void
    {
        foreach (scandir($root) as $name) {
            if ($name === '.' || $name === '..') {
                continue;
            }
            $path = $root . '/' . $name;
            is_dir($path) && !is_link($path) ? self::remove($path) : unlink($path);
        }
        rmdir($root);
    }
}

/** Deterministic bytes through the existing provider contract; never a network call. */
final class HeadingFakeProvider implements AIProviderInterface
{
    public array $calls = [];
    public ?\Closure $duringChunk = null;
    public bool $fail = false;

    public function __construct(private string $response) {}
    public function getId(): string { return 'fake'; }
    public function getName(): string { return 'Heading fixture fake'; }
    public function getModels(): array { return [['id' => 'fixture', 'name' => 'Fixture', 'tier' => 'fast']]; }
    public function listModels(): array { return $this->getModels(); }
    public function testConnection(): array { return $this->getModels(); }
    public function getConfigFields(): array { return []; }
    public function validateConfig(array $config): bool { return true; }
    public function getContextWindow(string $model): int { return 200000; }
    public function estimateTokens(string $text): int { return (int) ceil(strlen($text) / 4); }
    // Required legacy interface returns floats. Benchmark reports cost=null, never this synthetic zero.
    public function estimateCost(int $inputTokens, int $outputTokens, string $model): array
    {
        return ['input_cost' => 0.0, 'output_cost' => 0.0, 'total_cost' => 0.0];
    }
    public function complete(string $systemPrompt, array $messages, array $options = []): string
    {
        throw new RuntimeException('Unexpected complete() call in frozen heading fixture');
    }
    public function stream(string $systemPrompt, array $messages, callable $onToken, callable $onComplete, array $options = []): void
    {
        $start = hrtime(true);
        $input = $systemPrompt . json_encode($messages, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $call = ['input_tokens' => $this->estimateTokens($input), 'output_tokens' => $this->estimateTokens($this->response),
            'cost_usd' => null, 'duration_ms' => 0.0, 'system' => $systemPrompt, 'messages' => $messages, 'options' => $options];
        $this->calls[] = $call;
        if ($this->fail) {
            throw new RuntimeException('Simulated interrupted generation');
        }
        foreach (str_split($this->response, 7) as $chunk) {
            $onToken($chunk);
            if ($this->duringChunk !== null) {
                ($this->duringChunk)();
            }
        }
        $usage = ['input_tokens' => $call['input_tokens'], 'output_tokens' => $call['output_tokens'],
            'duration_ms' => (hrtime(true) - $start) / 1e6];
        $this->calls[count($this->calls) - 1]['duration_ms'] = $usage['duration_ms'];
        $onComplete($this->response, $usage);
    }
}
