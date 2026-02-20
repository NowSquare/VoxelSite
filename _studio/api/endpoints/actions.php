<?php

declare(strict_types=1);

/**
 * Actions API Endpoint
 *
 * GET /ai/actions     — List all available actions with their metadata
 * GET /ai/actions/:id — Get steps for a specific action
 *
 * This endpoint reads from ActionRegistry, which defines the
 * available actions, their wizard steps, and how they map to
 * prompt templates.
 */

use VoxelSite\ActionRegistry;

$method = $_REQUEST['_route_method'];
$path   = $_REQUEST['_route_path'];
$params = $_REQUEST['_route_params'] ?? [];

$registry = new ActionRegistry();

// ═══════════════════════════════════════════
//  GET /ai/actions — List all actions
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/ai/actions') {
    jsonResponse([
        'ok'   => true,
        'data' => [
            'actions' => $registry->getActions(),
        ],
    ]);
    return;
}

// ═══════════════════════════════════════════
//  GET /ai/actions/:id — Get action steps
// ═══════════════════════════════════════════

if ($method === 'GET' && str_starts_with($path, '/ai/actions/')) {
    $actionId = $params['id'] ?? '';

    if (!$registry->exists($actionId)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Action '{$actionId}' not found.",
        ]], 404);
        return;
    }

    $steps = $registry->getSteps($actionId);

    jsonResponse([
        'ok'   => true,
        'data' => [
            'action' => $actionId,
            'steps'  => $steps,
        ],
    ]);
    return;
}

// ── Fallback ──
jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Actions endpoint not found.',
]], 404);
