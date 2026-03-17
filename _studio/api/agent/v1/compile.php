<?php

declare(strict_types=1);

/**
 * Agent API — Compile Endpoint
 *
 * POST /compile — Trigger Tailwind CSS recompilation
 *
 * Receives $_agentContext from router.php.
 */

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\Logger;

$ctx = $_agentContext;
$db  = Database::getInstance();
$fm  = new FileManager($db);

try {
    $result = $fm->compileTailwind();

    Logger::info('agent-api', 'CSS compiled', [
        'key_label' => $ctx['keyData']['label'] ?? 'unknown',
    ]);

    agentResponse(['data' => $result]);
} catch (\Throwable $e) {
    Logger::exception('agent-api', $e, [
        'operation' => 'compile',
        'key_label' => $ctx['keyData']['label'] ?? 'unknown',
    ]);
    agentError(500, 'compile_failed', $e->getMessage());
}
