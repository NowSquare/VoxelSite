<?php

declare(strict_types=1);

// Run: php _studio/tests/OpenAIStreamTest.php
$streamProviderFactory = static fn() => new \VoxelSite\Providers\OpenAIProvider('offline-test-key', 'gpt-4o');
$streamLabel = 'OpenAI';
$streamApiName = 'OpenAI API';
require __DIR__ . '/helpers/openai-stream-suite.php';
