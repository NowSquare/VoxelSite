<?php
/**
 * VoxelSite Notes API
 *
 * Endpoints for the Studio Notes feature — a frictionless, auto-saving
 * writing surface for business owners to capture thoughts and draft copy.
 *
 * Routes:
 *   GET    /notes              → List all active notes
 *   POST   /notes              → Create a new note
 *   GET    /notes/search       → Search notes by title and body
 *   GET    /notes/:id          → Get a single note
 *   PUT    /notes/:id          → Update a note (auto-save target)
 *   DELETE /notes/:id          → Soft-delete a note
 *   POST   /notes/:id/restore  → Restore a soft-deleted note
 */

declare(strict_types=1);

use VoxelSite\NoteManager;
use VoxelSite\Logger;

$path   = $_REQUEST['_route_path'];
$method = $_REQUEST['_route_method'];
$params = $_REQUEST['_route_params'] ?? [];
$user   = $_REQUEST['_user'];

$noteManager = new NoteManager();
$userId = (int) $user['id'];

// ═══════════════════════════════════════════
//  GET /notes — List all active notes
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/notes') {
    $notes = $noteManager->listForUser($userId);

    jsonResponse(['ok' => true, 'data' => ['notes' => $notes]]);
    exit;
}

// ═══════════════════════════════════════════
//  GET /notes/search?q= — Search notes
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/notes/search') {
    $query = trim($_GET['q'] ?? '');

    if ($query === '') {
        // Empty search returns full list
        $notes = $noteManager->listForUser($userId);
    } else {
        $notes = $noteManager->search($userId, $query);
    }

    jsonResponse(['ok' => true, 'data' => ['notes' => $notes]]);
    exit;
}

// ═══════════════════════════════════════════
//  POST /notes — Create a new note
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/notes') {
    $body = getJsonBody();
    $title = trim($body['title'] ?? '');
    $noteBody = $body['body'] ?? '';

    $note = $noteManager->create($userId, $title, $noteBody);

    Logger::info('notes', 'Note created', [
        'note_id' => $note['id'],
        'user_id' => $userId,
    ]);

    jsonResponse(['ok' => true, 'data' => ['note' => $note]], 201);
    exit;
}

// ═══════════════════════════════════════════
//  GET /notes/:id — Get a single note
// ═══════════════════════════════════════════

if ($method === 'GET' && isset($params['id'])) {
    $noteId = (int) $params['id'];
    $note = $noteManager->getById($noteId, $userId);

    if (!$note) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Note not found.',
        ]], 404);
        exit;
    }

    jsonResponse(['ok' => true, 'data' => ['note' => $note]]);
    exit;
}

// ═══════════════════════════════════════════
//  PUT /notes/:id — Update a note (auto-save)
// ═══════════════════════════════════════════

if ($method === 'PUT' && isset($params['id']) && !str_contains($path, '/restore')) {
    $noteId = (int) $params['id'];
    $body = getJsonBody();

    $fields = [];
    if (array_key_exists('title', $body))  $fields['title']  = $body['title'];
    if (array_key_exists('body', $body))   $fields['body']   = $body['body'];
    if (array_key_exists('pinned', $body)) $fields['pinned'] = (int) $body['pinned'];

    $result = $noteManager->update($noteId, $userId, $fields);

    if ($result['note'] === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Note not found.',
        ]], 404);
        exit;
    }

    $response = ['ok' => true, 'data' => ['note' => $result['note']]];

    if ($result['pin_limit']) {
        $response['data']['pin_limit'] = true;
        $response['data']['pin_limit_message'] = 'You can pin up to 5 notes.';
    }

    jsonResponse($response);
    exit;
}

// ═══════════════════════════════════════════
//  DELETE /notes/:id — Soft-delete a note
// ═══════════════════════════════════════════

if ($method === 'DELETE' && isset($params['id'])) {
    $noteId = (int) $params['id'];
    $deleted = $noteManager->softDelete($noteId, $userId);

    if (!$deleted) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Note not found.',
        ]], 404);
        exit;
    }

    Logger::info('notes', 'Note soft-deleted', [
        'note_id' => $noteId,
        'user_id' => $userId,
    ]);

    jsonResponse(['ok' => true, 'data' => ['deleted' => true]]);
    exit;
}

// ═══════════════════════════════════════════
//  POST /notes/:id/restore — Restore a soft-deleted note
// ═══════════════════════════════════════════

if ($method === 'POST' && isset($params['id']) && str_contains($path, '/restore')) {
    $noteId = (int) $params['id'];
    $note = $noteManager->restore($noteId, $userId);

    if (!$note) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Note not found or already restored.',
        ]], 404);
        exit;
    }

    Logger::info('notes', 'Note restored', [
        'note_id' => $noteId,
        'user_id' => $userId,
    ]);

    jsonResponse(['ok' => true, 'data' => ['note' => $note]]);
    exit;
}

// ═══════════════════════════════════════════
//  Fallback — no matching route
// ═══════════════════════════════════════════

jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'No matching Notes endpoint.',
]], 404);
