<?php

declare(strict_types=1);

/**
 * Agent API — Publish Endpoint
 *
 * POST /publish — Publish preview → production
 *
 * Delegates to PublishService for the full pipeline.
 * Receives $_agentContext from router.php.
 */

use VoxelSite\Logger;
use VoxelSite\PublishService;

$ctx  = $_agentContext;
$body = json_decode(file_get_contents('php://input'), true) ?? [];
$createSnapshot = ($body['create_snapshot'] ?? true) !== false;

try {
    $service = new PublishService();
    $result = $service->publish($createSnapshot, 'api');

    Logger::info('agent-api', 'Site published', [
        'snapshot'        => $createSnapshot,
        'files_published' => $result['files_published'] ?? null,
        'key_label'       => $ctx['keyData']['label'] ?? 'unknown',
    ]);

    agentResponse(['data' => $result]);
} catch (\RuntimeException $e) {
    $code = $e->getCode();
    $errorCode = match (true) {
        $code === 422                                     => 'nothing_to_publish',
        str_contains($e->getMessage(), 'snapshot')        => 'snapshot_failed',
        default                                           => 'publish_failed',
    };
    $httpCode = match (true) {
        $code >= 400 && $code < 600 => $code,
        default                     => 500,
    };
    Logger::exception('agent-api', $e, [
        'operation' => 'publish',
        'key_label' => $ctx['keyData']['label'] ?? 'unknown',
    ]);
    agentError($httpCode, $errorCode, $e->getMessage());
}
