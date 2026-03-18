<?php
/**
 * VoxelSite Board API
 *
 * Endpoints for the Studio Board (Kanban) feature — a shared task board
 * visible to all team members. Viewers have read-only access.
 *
 * Routes:
 *   GET    /cards              → List all active cards
 *   POST   /cards              → Create a new card
 *   GET    /cards/archived     → List archived cards
 *   GET    /cards/:id          → Get a single card
 *   PUT    /cards/:id          → Update a card
 *   DELETE /cards/:id          → Delete a card permanently
 *   PUT    /cards/:id/move     → Move a card (column + position)
 *   POST   /cards/:id/archive  → Archive a card
 *   POST   /cards/:id/restore  → Restore an archived card
 *
 * Permission model:
 *   - Owner/Editor: full read + write access
 *   - Viewer: read-only (GET endpoints only)
 *   - Write operations (POST/PUT/DELETE) are blocked at the router level
 *     for viewers via the generic viewer guard, but we add an explicit
 *     check here as defense-in-depth.
 */

declare(strict_types=1);

use VoxelSite\CardManager;
use VoxelSite\Logger;

$path   = $_REQUEST['_route_path'];
$method = $_REQUEST['_route_method'];
$params = $_REQUEST['_route_params'] ?? [];
$user   = $_REQUEST['_user'];

// Board is readable by all roles. Write operations are blocked
// at the router level for viewers, but we add defense-in-depth here.
$isViewer = ($user['role'] === 'viewer');

$cardManager = new CardManager();
$userId = (int) $user['id'];

// ═══════════════════════════════════════════
//  GET /cards — List all active cards
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/cards') {
    $cards = $cardManager->listActive();

    jsonResponse(['ok' => true, 'data' => ['cards' => $cards]]);
    exit;
}

// ═══════════════════════════════════════════
//  GET /cards/archived — List archived cards
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/cards/archived') {
    $cards = $cardManager->listArchived();

    jsonResponse(['ok' => true, 'data' => ['cards' => $cards]]);
    exit;
}

// ═══════════════════════════════════════════
//  POST /cards — Create a new card
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/cards') {
    if ($isViewer) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'forbidden',
            'message' => 'Viewers have read-only access to the Board.',
        ]], 403);
        exit;
    }

    $body = getJsonBody();
    $title = trim($body['title'] ?? '');

    if ($title === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Card title is required.',
        ]], 422);
        exit;
    }

    $card = $cardManager->create(
        $userId,
        $title,
        $body['body'] ?? '',
        $body['column_name'] ?? 'todo',
        $body['linked_page'] ?? null,
        isset($body['source_note_id']) ? (int) $body['source_note_id'] : null
    );

    Logger::info('board', 'Card created', [
        'card_id' => $card['id'],
        'user_id' => $userId,
        'column'  => $card['column_name'],
    ]);

    jsonResponse(['ok' => true, 'data' => ['card' => $card]], 201);
    exit;
}

// ═══════════════════════════════════════════
//  GET /cards/:id — Get a single card
// ═══════════════════════════════════════════

if ($method === 'GET' && isset($params['id']) && !str_contains($path, '/archived')) {
    $cardId = (int) $params['id'];
    $card = $cardManager->getById($cardId);

    if (!$card) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Card not found.',
        ]], 404);
        exit;
    }

    jsonResponse(['ok' => true, 'data' => ['card' => $card]]);
    exit;
}

// ═══════════════════════════════════════════
//  PUT /cards/:id/move — Move a card (column + position)
// ═══════════════════════════════════════════

if ($method === 'PUT' && isset($params['id']) && str_contains($path, '/move')) {
    if ($isViewer) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'forbidden',
            'message' => 'Viewers have read-only access to the Board.',
        ]], 403);
        exit;
    }

    $cardId = (int) $params['id'];
    $body = getJsonBody();

    $columnName = $body['column_name'] ?? null;
    $position = isset($body['position']) ? (int) $body['position'] : null;

    if (!$columnName || $position === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Both column_name and position are required.',
        ]], 422);
        exit;
    }

    if (!in_array($columnName, ['todo', 'in_progress', 'done'], true)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Invalid column_name.',
        ]], 422);
        exit;
    }

    $card = $cardManager->move($cardId, $userId, $columnName, $position);

    if (!$card) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Card not found.',
        ]], 404);
        exit;
    }

    jsonResponse(['ok' => true, 'data' => ['card' => $card]]);
    exit;
}

// ═══════════════════════════════════════════
//  POST /cards/:id/archive — Archive a card
// ═══════════════════════════════════════════

if ($method === 'POST' && isset($params['id']) && str_contains($path, '/archive')) {
    if ($isViewer) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'forbidden',
            'message' => 'Viewers have read-only access to the Board.',
        ]], 403);
        exit;
    }

    $cardId = (int) $params['id'];
    $archived = $cardManager->archive($cardId, $userId);

    if (!$archived) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Card not found or already archived.',
        ]], 404);
        exit;
    }

    Logger::info('board', 'Card archived', [
        'card_id' => $cardId,
        'user_id' => $userId,
    ]);

    jsonResponse(['ok' => true, 'data' => ['archived' => true]]);
    exit;
}

// ═══════════════════════════════════════════
//  POST /cards/:id/restore — Restore an archived card
// ═══════════════════════════════════════════

if ($method === 'POST' && isset($params['id']) && str_contains($path, '/restore')) {
    if ($isViewer) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'forbidden',
            'message' => 'Viewers have read-only access to the Board.',
        ]], 403);
        exit;
    }

    $cardId = (int) $params['id'];
    $card = $cardManager->restore($cardId, $userId);

    if (!$card) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Card not found or not archived.',
        ]], 404);
        exit;
    }

    Logger::info('board', 'Card restored', [
        'card_id' => $cardId,
        'user_id' => $userId,
    ]);

    jsonResponse(['ok' => true, 'data' => ['card' => $card]]);
    exit;
}

// ═══════════════════════════════════════════
//  PUT /cards/:id — Update a card
// ═══════════════════════════════════════════

if ($method === 'PUT' && isset($params['id']) && !str_contains($path, '/move')) {
    if ($isViewer) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'forbidden',
            'message' => 'Viewers have read-only access to the Board.',
        ]], 403);
        exit;
    }

    $cardId = (int) $params['id'];
    $body = getJsonBody();

    $fields = [];
    if (array_key_exists('title', $body))       $fields['title']       = $body['title'];
    if (array_key_exists('body', $body))         $fields['body']        = $body['body'];
    if (array_key_exists('column_name', $body))  $fields['column_name'] = $body['column_name'];
    if (array_key_exists('linked_page', $body))  $fields['linked_page'] = $body['linked_page'];
    if (array_key_exists('archived', $body))     $fields['archived']    = (int) $body['archived'];

    $card = $cardManager->update($cardId, $userId, $fields);

    if ($card === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Card not found.',
        ]], 404);
        exit;
    }

    jsonResponse(['ok' => true, 'data' => ['card' => $card]]);
    exit;
}

// ═══════════════════════════════════════════
//  DELETE /cards/:id — Permanently delete a card
// ═══════════════════════════════════════════

if ($method === 'DELETE' && isset($params['id'])) {
    if ($isViewer) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'forbidden',
            'message' => 'Viewers have read-only access to the Board.',
        ]], 403);
        exit;
    }

    $cardId = (int) $params['id'];
    $deleted = $cardManager->delete($cardId);

    if (!$deleted) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Card not found.',
        ]], 404);
        exit;
    }

    Logger::info('board', 'Card deleted', [
        'card_id' => $cardId,
        'user_id' => $userId,
    ]);

    jsonResponse(['ok' => true, 'data' => ['deleted' => true]]);
    exit;
}

// ═══════════════════════════════════════════
//  Fallback — no matching route
// ═══════════════════════════════════════════

jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'No matching Board endpoint.',
]], 404);
