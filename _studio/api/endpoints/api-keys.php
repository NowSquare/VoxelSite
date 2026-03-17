<?php

declare(strict_types=1);

/**
 * API Key Management Endpoints (Studio Router — session auth)
 *
 * GET    /settings/api-keys      — List all API keys
 * POST   /settings/api-keys      — Generate a new API key
 * DELETE /settings/api-keys/:id  — Revoke an API key
 *
 * These run inside the Studio router with session auth + CSRF.
 * Only site owners can manage API keys.
 *
 * Demo mode: returns an empty-state response before the owner guard.
 * POST and DELETE are already blocked by the Studio router's
 * DemoMode::shouldBlock() before this handler runs.
 */

use VoxelSite\AgentAuth;
use VoxelSite\DemoMode;

$method = $_REQUEST['_route_method'];
$path   = $_REQUEST['_route_path'];
$params = $_REQUEST['_route_params'] ?? [];
$user   = $_REQUEST['_user'] ?? [];

// ── Demo mode: return empty state BEFORE the owner guard ──
// Demo sessions use role='demo' (see DemoMode::DEMO_USER), which would fail
// the owner check. We want to return a deliberate empty-state response,
// not a misleading 403 "Only owners can manage API keys."
if (DemoMode::isActive()) {
    jsonResponse(['ok' => true, 'data' => [
        'keys'                => [],
        'available_scopes'    => AgentAuth::getAllScopes(),
        'agent_api_available' => false,
    ]]);
    return;
}

// ── Owner-only guard (strict — runs after demo check) ──
if (($user['role'] ?? '') !== 'owner') {
    jsonResponse(['ok' => false, 'error' => [
        'code'    => 'forbidden',
        'message' => 'Only owners can manage API keys.',
    ]], 403);
    return;
}

$auth = new AgentAuth();

// ═══════════════════════════════════════════
//  GET /settings/api-keys — List keys
// ═══════════════════════════════════════════

if ($method === 'GET') {
    $keys = $auth->listKeys();
    // Parse scopes JSON for each key
    foreach ($keys as &$key) {
        $key['scopes'] = json_decode($key['scopes'], true) ?? [];
    }
    unset($key);

    jsonResponse(['ok' => true, 'data' => [
        'keys'             => $keys,
        'available_scopes' => AgentAuth::getAllScopes(),
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /settings/api-keys — Create key
// ═══════════════════════════════════════════

if ($method === 'POST') {
    $body = getJsonBody();
    $label = trim($body['label'] ?? '');
    $role = $body['role'] ?? 'agent';
    $scopes = $body['scopes'] ?? [];

    if ($label === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Label is required.',
        ]], 422);
        return;
    }

    try {
        $result = $auth->createKey($label, $role, $scopes);
        jsonResponse(['ok' => true, 'data' => $result], 201);
    } catch (\RuntimeException $e) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => $e->getMessage(),
        ]], 422);
    }
    return;
}

// ═══════════════════════════════════════════
//  DELETE /settings/api-keys/:id — Revoke key
// ═══════════════════════════════════════════

if ($method === 'DELETE' && isset($params['id'])) {
    $deleted = $auth->revokeKey((int) $params['id']);

    if ($deleted) {
        jsonResponse(['ok' => true, 'data' => ['message' => 'API key revoked.']]);
    } else {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'API key not found.',
        ]], 404);
    }
    return;
}

jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'API keys endpoint not found.',
]], 404);
