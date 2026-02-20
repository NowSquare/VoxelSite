<?php

declare(strict_types=1);

/**
 * Revisions (Undo/Redo) API Endpoints
 *
 * POST /revisions/undo  — Undo current revision
 * POST /revisions/redo  — Redo next revision
 * GET  /revisions/state — Get undo/redo state
 * GET  /revisions/list  — List recent revisions
 */

use VoxelSite\RevisionManager;
use VoxelSite\Database;

$method = $_REQUEST['_route_method'];
$path = $_REQUEST['_route_path'];

$revisionManager = new RevisionManager();

// ═══════════════════════════════════════════
//  POST /revisions/undo
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/revisions/undo') {
    $result = $revisionManager->undo();

    if ($result === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'nothing_to_undo',
            'message' => 'Nothing to undo.',
        ]], 400);
        return;
    }

    jsonResponse(['ok' => true, 'data' => $result]);
    return;
}

// ═══════════════════════════════════════════
//  POST /revisions/redo
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/revisions/redo') {
    $result = $revisionManager->redo();

    if ($result === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'nothing_to_redo',
            'message' => 'Nothing to redo.',
        ]], 400);
        return;
    }

    jsonResponse(['ok' => true, 'data' => $result]);
    return;
}

// ═══════════════════════════════════════════
//  GET /revisions/state
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/revisions/state') {
    $state = $revisionManager->getState();
    jsonResponse(['ok' => true, 'data' => $state]);
    return;
}

// ═══════════════════════════════════════════
//  GET /revisions/list
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/revisions/list') {
    $db = Database::getInstance();
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));

    $revisions = $db->query(
        "SELECT id, description, files_changed, is_undone, created_at
         FROM revisions
         ORDER BY created_at DESC
         LIMIT ?",
        [$limit]
    );

    // Decode files_changed JSON for the frontend
    foreach ($revisions as &$rev) {
        $rev['files_changed'] = json_decode($rev['files_changed'], true);
    }

    $state = $revisionManager->getState();

    jsonResponse(['ok' => true, 'data' => [
        'revisions' => $revisions,
        'state'     => $state,
    ]]);
    return;
}

jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Revisions endpoint not found.',
]], 404);
