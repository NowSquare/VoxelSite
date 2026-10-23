<?php

declare(strict_types=1);

/**
 * Agent API — Publish Endpoint
 *
 * POST /publish — Publish preview → production
 * Requires a stable operation_id. Retries must reuse it; checkpoint resumes the
 * retained operation instead of preparing a second publication.
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
    $db = \VoxelSite\Database::getInstance();
    $actor = (new \VoxelSite\Agent\ActorPolicy($db))->fromRestCredential((int) ($ctx['keyData']['id'] ?? 0));
    $service = new PublishService($db);
    $result = $service->publish($createSnapshot, 'api', $actor, $body);

    Logger::info('agent-api', 'Site published', [
        'snapshot'        => $createSnapshot,
        'files_published' => $result['files_published'] ?? null,
        'key_label'       => $ctx['keyData']['label'] ?? 'unknown',
    ]);

    $state = $result['operation']['status'];
    if (in_array($state, ['failed_restored', 'recovery_required', 'expired', 'cancelled'], true)) {
        agentError(409, $result['operation']['result']['error']['code'] ?? $state,
            $result['operation']['result']['error']['message'] ?? 'Publication needs attention. Inspect its retained operation.',
            ['operation' => $result['operation']]);
    } else agentResponse(['data' => $result], $state === 'succeeded' ? 200 : 202);
} catch (\VoxelSite\Agent\OperationException $e) {
    agentError($e->errorCode === 'permission_denied' ? 403 : 409, $e->errorCode, $e->getMessage(), $e->details);
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
