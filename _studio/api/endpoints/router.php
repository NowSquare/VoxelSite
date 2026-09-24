<?php
declare(strict_types=1);

use VoxelSite\{Database, DemoMode, RouterPendingHeading, Settings};

// Re-read the authenticated principal; no caller-supplied user/role is authority.
$user = authenticateRequest();
if ($user === null) {
    jsonResponse(['ok' => false, 'error' => ['code' => 'unauthorized', 'message' => 'Sign in as the owner.']], 401);
    return;
}
if ($user['role'] !== 'owner' || DemoMode::isActive() || !empty($_SERVER['HTTP_AUTHORIZATION'])
    || !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    jsonResponse(['ok' => false, 'error' => ['code' => 'override_forbidden', 'message' => 'Only the signed-in Studio owner can review or approve this edit.']], 403);
    return;
}
$method = $_REQUEST['_route_method'];
$id = $_REQUEST['_route_params']['id'] ?? '';
if ($method === 'POST' && !validateCsrf()) {
    jsonResponse(['ok' => false, 'error' => ['code' => 'csrf_failed', 'message' => 'Refresh and try again.']], 403);
    return;
}
$reason = null;
if ($method === 'POST') {
    $body = getJsonBody();
    if (array_keys($body) !== ['reason'] || !is_string($body['reason']) || trim($body['reason']) === '') {
        jsonResponse(['ok' => false, 'error' => ['code' => 'override_invalid', 'message' => 'Provide only a reason for approving the displayed candidate.']], 422);
        return;
    }
    $reason = $body['reason'];
}
try {
    $service = new RouterPendingHeading(Database::getInstance(), new Settings());
    $result = $method === 'GET' ? $service->read($id, (int) $user['id']) : $service->approve($id, (int) $user['id'], $reason);
    if ($method === 'GET' || $result['status'] === 'applied') {
        jsonResponse(['ok' => true, 'data' => $result,
            'message' => $method === 'GET' ? 'Review this exact heading before approving.'
                : ($result['reason'] === 'pending_recording_failed' ? 'The edit was applied, but its record could not be completed. Refresh before retrying.' : 'The owner-reviewed heading was applied.')]);
        return;
    }
    $code = $result['reason'];
} catch (Throwable $error) {
    $code = in_array($error->getMessage(), ['override_forbidden','override_invalid','governor_configuration','pending_unavailable','pending_not_found'], true)
        ? $error->getMessage() : 'override_unavailable';
}
$message = match ($code) {
    'governor_configuration' => 'Restore the server-side TypeSafe key in enforce mode before approving.',
    'pending_not_found' => 'This pending candidate was not found.',
    'pending_unavailable', 'content_changed' => 'This candidate is stale, already used, or no longer available. Review a new edit.',
    'override_invalid' => 'Provide a nonempty reason of at most 1,000 characters without secrets or control characters.',
    'gate_unavailable', 'gate_invalid' => 'The claim check could not be completed. Nothing was applied.',
    default => 'The approval could not be applied safely. Refresh and review the edit before trying again.',
};
jsonResponse(['ok' => false, 'error' => ['code' => $code, 'message' => $message]],
    $code === 'override_forbidden' ? 403 : ($code === 'override_invalid' ? 422 : ($code === 'pending_not_found' ? 404 : 409)));
