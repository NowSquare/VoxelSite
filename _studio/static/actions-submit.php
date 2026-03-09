<?php

/**
 * Actions Submit Handler — Shipped PHP
 *
 * Receives form submissions from the Actions Bar (and REST API).
 * Thin wrapper around ActionManager::execute().
 *
 * Deployed to /actions/submit.php during publish.
 * Also used at runtime in preview via the preview environment.
 *
 * Request format (JSON — MCP/API callers):
 *   POST /actions/submit.php
 *   Content-Type: application/json
 *   Body: { "action_id": "reservation", "data": { ...fields... } }
 *
 * Request format (FormData — Actions Bar with file uploads):
 *   POST /actions/submit.php
 *   Content-Type: multipart/form-data
 *   Fields: action_id, field values, file uploads
 *
 * Response format:
 *   { "ok": true, "message": "...", "confirmation_code": "XYZA1234" }
 *   { "ok": false, "error": "...", "message": "..." }
 */

declare(strict_types=1);

// CORS for cross-origin requests (if embed scenario)
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed', 'message' => 'POST only.']);
    exit;
}

// Detect content type — support both JSON and FormData
$contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
$isJson = str_contains($contentType, 'application/json');

if ($isJson) {
    // JSON body (MCP/API callers — no file upload support)
    $raw = file_get_contents('php://input');
    $body = json_decode($raw ?: '', true);

    if (!is_array($body)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'invalid_json', 'message' => 'Invalid request body.']);
        exit;
    }

    $actionId = $body['action_id'] ?? '';
    $data = $body['data'] ?? $body;
} else {
    // FormData (Actions Bar — supports file uploads via $_FILES)
    $actionId = $_POST['action_id'] ?? '';
    $data = $_POST;
    unset($data['action_id']); // Don't pass action_id as a field value

    // Parse JSON-encoded array values (multiselect sends as JSON strings from FormData)
    foreach ($data as $key => $value) {
        if (is_string($value) && str_starts_with($value, '[') && str_ends_with($value, ']')) {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                $data[$key] = $decoded;
            }
        }
    }
}

if (empty($actionId)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'missing_action_id', 'message' => 'action_id is required.']);
    exit;
}

// Bootstrap the engine
// This file is deployed to /actions/submit.php — _studio/ is one level up from the site root
$studioDir = dirname(__DIR__) . '/_studio';
$bootstrapPath = $studioDir . '/engine/bootstrap.php';

if (!file_exists($bootstrapPath)) {
    // Fallback: try to find it relative to this file's actual location
    $studioDir = dirname(__DIR__, 2) . '/_studio';
    $bootstrapPath = $studioDir . '/engine/bootstrap.php';
}

if (!file_exists($bootstrapPath)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'engine_not_found', 'message' => 'Action engine not found.']);
    exit;
}

require_once $bootstrapPath;

$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$toolName = 'make_' . str_replace('-', '_', $actionId);

$manager = new \VoxelSite\ActionManager();

// Add source marker
$data['_source'] = 'web';

$result = $manager->execute($toolName, $data, $ip, false);

// Set appropriate HTTP status
$httpStatus = 200;
if (!$result['ok']) {
    $httpStatus = match ($result['error'] ?? '') {
        'validation_failed' => 422,
        'rate_limited' => 429,
        'capacity_full', 'duplicate', 'outside_hours' => 409,
        default => 400,
    };
}

http_response_code($httpStatus);
echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

