<?php

declare(strict_types=1);

// Run: php _studio/tests/DeepSeekStreamTest.php
$streamProviderFactory = static fn() => new \VoxelSite\Providers\DeepSeekProvider('offline-test-key', 'deepseek-chat');
$streamLabel = 'DeepSeek';
$streamApiName = 'DeepSeek API';
require __DIR__ . '/helpers/openai-stream-suite.php';
