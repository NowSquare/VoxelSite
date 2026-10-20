<?php

declare(strict_types=1);

// Run: php _studio/tests/OpenAICompatibleStreamTest.php
$streamProviderFactory = static fn() => new \VoxelSite\Providers\OpenAICompatibleProvider('offline-test-key', 'local-model', 16000, 'http://localhost:11434');
$streamLabel = 'OpenAI-Compatible';
$streamApiName = 'API';
require __DIR__ . '/helpers/openai-stream-suite.php';
