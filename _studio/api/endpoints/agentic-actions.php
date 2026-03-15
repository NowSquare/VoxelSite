<?php

declare(strict_types=1);

/**
 * Agentic Actions API Endpoints
 *
 * CRUD for action definitions, record management, testing, templates,
 * manifest generation, CSV export, and record purging.
 *
 * Routes (registered in router.php):
 *   GET    /agentic/actions               — List all actions
 *   POST   /agentic/actions               — Create new action
 *   GET    /agentic/actions/:id           — Get single action
 *   PUT    /agentic/actions/:id           — Update action
 *   DELETE /agentic/actions/:id           — Delete action
 *   POST   /agentic/actions/:id/duplicate — Duplicate action
 *   POST   /agentic/actions/:id/test      — Test action (sandbox)
 *   GET    /agentic/actions/:id/records         — List records
 *   PUT    /agentic/actions/:id/records/:rid    — Update record status
 *   DELETE /agentic/actions/:id/records/:rid    — Delete record
 *   POST   /agentic/actions/:id/records/bulk    — Bulk status update
 *   GET    /agentic/actions/:id/records/export  — CSV export
 *   POST   /agentic/actions/:id/records/purge   — Purge old records
 *   GET    /agentic/templates              — List templates
 *   POST   /agentic/actions/from-template  — Create from template
 *   POST   /agentic/manifest              — Generate manifest
 */

use VoxelSite\ActionManager;

$method = $_REQUEST['_route_method'];
$path   = $_REQUEST['_route_path'];
$params = $_REQUEST['_route_params'] ?? [];

$manager = new ActionManager();

// ═══════════════════════════════════════════
//  GET /agentic/actions — List all actions
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/agentic/actions') {
    $actions = $manager->listActions();

    // Enrich with stats
    $enriched = [];
    foreach ($actions as $action) {
        $stats = $manager->getStats($action['id']);
        $action['_stats'] = $stats;
        $enriched[] = $action;
    }

    jsonResponse(['ok' => true, 'data' => ['actions' => $enriched]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /agentic/actions/reorder — Save action order
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/agentic/actions/reorder') {
    $body = json_decode(file_get_contents('php://input'), true);
    $orderedIds = $body['order'] ?? [];

    if (!is_array($orderedIds) || empty($orderedIds)) {
        jsonResponse(['ok' => false, 'error' => ['code' => 'invalid_order', 'message' => 'Order must be a non-empty array of action IDs.']], 400);
        return;
    }

    $updated = 0;
    foreach ($orderedIds as $index => $actionId) {
        $action = $manager->loadAction($actionId);
        if ($action) {
            $action['order'] = $index;
            $manager->saveAction($action);
            $updated++;
        }
    }

    // Regenerate live manifest so new order applies immediately
    $docRoot = dirname(__DIR__, 3);
    $actionsDir = $docRoot . '/actions';
    if (is_dir($actionsDir) && file_exists($actionsDir . '/manifest.json')) {
        $manifest = $manager->generateManifest();
        if ($manifest !== null) {
            file_put_contents(
                $actionsDir . '/manifest.json',
                json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            );
        }
    }

    jsonResponse(['ok' => true, 'data' => ['updated' => $updated]]);
    return;
}

// ═══════════════════════════════════════════
//  GET /agentic/actions/bar-settings — Read bar settings
//  PUT /agentic/actions/bar-settings — Update bar settings
// ═══════════════════════════════════════════

if ($path === '/agentic/actions/bar-settings') {
    $siteJsonPath = dirname(dirname(__DIR__)) . '/assets/data/site.json';
    $siteData = file_exists($siteJsonPath) ? (json_decode(file_get_contents($siteJsonPath), true) ?: []) : [];

    if ($method === 'GET') {
        $defaults = [
            'theme' => 'bottom-bar',
            'visibility' => 'all-pages',
            'pages' => [],
            'color_scheme' => 'light',
            'brand_color' => '',
        ];
        $settings = array_merge($defaults, $siteData['actions_bar'] ?? []);
        jsonResponse(['ok' => true, 'data' => ['settings' => $settings]]);
        return;
    }

    if ($method === 'PUT') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!is_array($body)) {
            jsonResponse(['ok' => false, 'error' => ['code' => 'invalid_body', 'message' => 'Request body must be JSON.']], 400);
            return;
        }

        $validThemes = ['bottom-bar', 'floating-fab', 'minimal-pill'];
        $validVisibility = ['all-pages', 'homepage-only', 'hidden'];
        $validSchemes = ['light', 'dark'];

        $settings = $siteData['actions_bar'] ?? [];
        if (isset($body['theme']) && in_array($body['theme'], $validThemes, true)) {
            $settings['theme'] = $body['theme'];
        }
        if (isset($body['visibility']) && in_array($body['visibility'], $validVisibility, true)) {
            $settings['visibility'] = $body['visibility'];
        }
        if (isset($body['pages']) && is_array($body['pages'])) {
            $settings['pages'] = $body['pages'];
        }
        if (isset($body['color_scheme']) && in_array($body['color_scheme'], $validSchemes, true)) {
            $settings['color_scheme'] = $body['color_scheme'];
        }
        if (isset($body['brand_color'])) {
            // Accept empty string (= use default) or valid hex
            $hex = ltrim($body['brand_color'], '#');
            if ($hex === '' || preg_match('/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/', $hex)) {
                $settings['brand_color'] = $hex === '' ? '' : '#' . $hex;
            }
        }

        $siteData['actions_bar'] = $settings;

        // Ensure directory exists
        $dir = dirname($siteJsonPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents($siteJsonPath, json_encode($siteData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        // Regenerate live manifest so changes apply immediately (no full republish needed)
        $docRoot = dirname(__DIR__, 3);
        $actionsDir = $docRoot . '/actions';
        if (is_dir($actionsDir) && file_exists($actionsDir . '/manifest.json')) {
            $manifest = $manager->generateManifest();
            if ($manifest !== null) {
                file_put_contents(
                    $actionsDir . '/manifest.json',
                    json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
                );
            }
            // Also sync bar CSS/JS in case they were updated
            $fileManager = new \VoxelSite\FileManager(\VoxelSite\Database::getInstance());
            $fileManager->ensureShippedActionsBar($docRoot);
        }

        jsonResponse(['ok' => true, 'data' => ['settings' => $settings]]);
        return;
    }
}

// ═══════════════════════════════════════════
//  POST /agentic/actions — Create new action
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/agentic/actions') {
    $body = getJsonBody();

    // Validate the definition
    $validation = $manager->validateDefinition($body);
    if (!$validation['valid']) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'validation_failed',
            'message' => implode(' ', $validation['errors']),
            'errors' => $validation['errors'],
            'warnings' => $validation['warnings'],
        ]], 422);
        return;
    }

    // Check if ID already exists
    $existing = $manager->loadAction($body['id']);
    if ($existing !== null) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'already_exists',
            'message' => "An action with ID '{$body['id']}' already exists.",
        ]], 409);
        return;
    }

    $body['version'] = 1;
    $body['created_at'] = date('c');
    $body['updated_at'] = date('c');

    if (!$manager->saveAction($body)) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'save_failed',
            'message' => 'Could not save action definition.',
        ]], 500);
        return;
    }

    jsonResponse(['ok' => true, 'data' => ['action' => $body]], 201);
    return;
}

// ═══════════════════════════════════════════
//  POST /agentic/actions/from-template
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/agentic/actions/from-template') {
    $body = getJsonBody();
    $templateId = $body['template_id'] ?? '';
    $customId = $body['id'] ?? null;

    if (empty($templateId)) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'missing_template',
            'message' => 'template_id is required.',
        ]], 422);
        return;
    }

    $action = $manager->createFromTemplate($templateId, $customId);
    if ($action === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'not_found',
            'message' => "Template '{$templateId}' not found.",
        ]], 404);
        return;
    }

    jsonResponse(['ok' => true, 'data' => ['action' => $action]], 201);
    return;
}

// ═══════════════════════════════════════════
//  GET /agentic/actions/:id — Get single action
// ═══════════════════════════════════════════

if ($method === 'GET' && isset($params['id']) && preg_match('#^/agentic/actions/[^/]+$#', $path)) {
    $id = $params['id'];

    $action = $manager->loadAction($id);
    if ($action === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'not_found',
            'message' => "Action '{$id}' not found.",
        ]], 404);
        return;
    }

    $stats = $manager->getStats($id);
    $action['_stats'] = $stats;

    jsonResponse(['ok' => true, 'data' => ['action' => $action, 'stats' => $stats]]);
    return;
}

// ═══════════════════════════════════════════
//  PUT /agentic/actions/:id — Update action
// ═══════════════════════════════════════════

if ($method === 'PUT' && isset($params['id'])) {
    $id = $params['id'];
    $body = getJsonBody();

    // Ensure the ID matches
    $body['id'] = $id;

    // Validate the updated definition
    $validation = $manager->validateDefinition($body);
    if (!$validation['valid']) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'validation_failed',
            'message' => implode(' ', $validation['errors']),
            'errors' => $validation['errors'],
            'warnings' => $validation['warnings'],
        ]], 422);
        return;
    }

    // Bump version
    $existing = $manager->loadAction($id);
    $body['version'] = ($existing['version'] ?? 0) + 1;
    $body['updated_at'] = date('c');
    if ($existing !== null && isset($existing['created_at'])) {
        $body['created_at'] = $existing['created_at'];
    }

    if (!$manager->saveAction($body)) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'save_failed',
            'message' => 'Could not update action definition.',
        ]], 500);
        return;
    }

    // Regenerate live manifest so icon/order/field changes apply immediately
    $docRoot = dirname(__DIR__, 3);
    $actionsDir = $docRoot . '/actions';
    if (is_dir($actionsDir) && file_exists($actionsDir . '/manifest.json')) {
        $manifest = $manager->generateManifest();
        if ($manifest !== null) {
            file_put_contents(
                $actionsDir . '/manifest.json',
                json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            );
        }
    }

    jsonResponse(['ok' => true, 'data' => $body, 'warnings' => $validation['warnings']]);
    return;
}

// ═══════════════════════════════════════════
//  DELETE /agentic/actions/:id — Delete action
// ═══════════════════════════════════════════

if ($method === 'DELETE' && isset($params['id']) && !isset($params['rid'])) {
    $id = $params['id'];

    if (!$manager->deleteAction($id)) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'not_found',
            'message' => "Action '{$id}' not found.",
        ]], 404);
        return;
    }

    // Regenerate live manifest after deletion
    $docRoot = dirname(__DIR__, 3);
    $actionsDir = $docRoot . '/actions';
    if (is_dir($actionsDir) && file_exists($actionsDir . '/manifest.json')) {
        $manifest = $manager->generateManifest();
        if ($manifest !== null) {
            file_put_contents(
                $actionsDir . '/manifest.json',
                json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            );
        }
    }

    jsonResponse(['ok' => true, 'data' => ['message' => "Action '{$id}' deleted."]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /agentic/actions/:id/duplicate
// ═══════════════════════════════════════════

if ($method === 'POST' && str_ends_with($path, '/duplicate') && isset($params['id'])) {
    $id = $params['id'];
    $body = getJsonBody();
    $newId = $body['new_id'] ?? '';

    // Validate new ID format only if explicitly provided
    if ($newId !== '' && !preg_match('/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/', $newId)) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'invalid_id',
            'message' => 'New ID must be 3-50 characters, lowercase alphanumeric with hyphens.',
        ]], 422);
        return;
    }

    $duplicate = $manager->duplicateAction($id, $newId);
    if ($duplicate === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'not_found',
            'message' => "Action '{$id}' not found.",
        ]], 404);
        return;
    }

    jsonResponse(['ok' => true, 'data' => ['action' => $duplicate]], 201);
    return;
}

// ═══════════════════════════════════════════
//  POST /agentic/actions/:id/test — Test action (sandbox)
// ═══════════════════════════════════════════

if ($method === 'POST' && str_ends_with($path, '/test') && isset($params['id'])) {
    $id = $params['id'];
    $body = getJsonBody();

    $action = $manager->loadAction($id);
    if ($action === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'not_found',
            'message' => "Action '{$id}' not found.",
        ]], 404);
        return;
    }

    $toolName = 'make_' . str_replace('-', '_', $id);
    $result = $manager->execute($toolName, $body, $_SERVER['REMOTE_ADDR'] ?? '', true);

    jsonResponse(['ok' => $result['ok'], 'data' => $result]);
    return;
}

// ═══════════════════════════════════════════
//  GET /agentic/actions/:id/records — List records
// ═══════════════════════════════════════════

if ($method === 'GET' && str_ends_with($path, '/records') && isset($params['id'])) {
    $id = $params['id'];

    $filters = [
        'page' => $_GET['page'] ?? 1,
        'per_page' => $_GET['per_page'] ?? 20,
        'status' => $_GET['status'] ?? null,
        'search' => $_GET['search'] ?? null,
        'date_from' => $_GET['date_from'] ?? null,
        'date_to' => $_GET['date_to'] ?? null,
    ];

    $result = $manager->listRecords($id, $filters);
    jsonResponse(['ok' => true, 'data' => $result]);
    return;
}

// ═══════════════════════════════════════════
//  GET /agentic/actions/:id/records/export — CSV export
// ═══════════════════════════════════════════

if ($method === 'GET' && str_ends_with($path, '/records/export') && isset($params['id'])) {
    $id = $params['id'];

    $filters = [
        'status' => $_GET['status'] ?? null,
        'date_from' => $_GET['date_from'] ?? null,
        'date_to' => $_GET['date_to'] ?? null,
    ];

    $csv = $manager->exportCsv($id, $filters);

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $id . '_records_' . date('Y-m-d') . '.csv"');
    echo $csv;
    exit;
}

// ═══════════════════════════════════════════
//  PUT /agentic/actions/:id/records/:rid — Update record status
// ═══════════════════════════════════════════

if ($method === 'PUT' && isset($params['id']) && isset($params['rid'])) {
    $body = getJsonBody();
    $status = $body['status'] ?? '';

    if (empty($status)) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'missing_status',
            'message' => 'Status is required.',
        ]], 422);
        return;
    }

    $result = $manager->updateStatus((int) $params['rid'], $status);
    if (!$result) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'invalid_status',
            'message' => "Invalid status: {$status}.",
        ]], 422);
        return;
    }

    jsonResponse(['ok' => true, 'data' => ['message' => 'Status updated.']]);
    return;
}

// ═══════════════════════════════════════════
//  GET /agentic/actions/:id/records/:rid/files/:field — Download file
// ═══════════════════════════════════════════

if ($method === 'GET' && isset($params['id']) && isset($params['rid']) && isset($params['field'])) {
    $id = $params['id'];
    $rid = (int) $params['rid'];
    $fieldName = $params['field'];

    // Load the record
    $result = $manager->listRecords($id, ['per_page' => 10000]);
    $record = null;
    foreach ($result['records'] as $r) {
        if ((int) $r['id'] === $rid) {
            $record = $r;
            break;
        }
    }

    if (!$record) {
        jsonResponse(['ok' => false, 'error' => ['code' => 'not_found', 'message' => 'Record not found.']], 404);
        return;
    }

    // Extract file data from the record's data blob
    $fileData = $record['data'][$fieldName] ?? null;
    if (!is_array($fileData) || empty($fileData['path'])) {
        jsonResponse(['ok' => false, 'error' => ['code' => 'no_file', 'message' => 'No file found for this field.']], 404);
        return;
    }

    // Resolve absolute path (validates against directory traversal)
    $absPath = $manager->getUploadAbsolutePath($fileData['path']);
    if ($absPath === null) {
        jsonResponse(['ok' => false, 'error' => ['code' => 'file_missing', 'message' => 'File no longer exists.']], 404);
        return;
    }

    // Stream the file
    $mimeType = $fileData['mime_type'] ?? 'application/octet-stream';
    $originalName = $fileData['original_name'] ?? basename($absPath);

    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: attachment; filename="' . str_replace('"', "'", $originalName) . '"');
    header('Content-Length: ' . filesize($absPath));
    header('Cache-Control: private, no-cache');
    header('X-Content-Type-Options: nosniff');

    readfile($absPath);
    exit;
}

// ═══════════════════════════════════════════
//  DELETE /agentic/actions/:id/records/:rid — Delete record
// ═══════════════════════════════════════════

if ($method === 'DELETE' && isset($params['id']) && isset($params['rid'])) {
    $manager->deleteRecord((int) $params['rid']);
    jsonResponse(['ok' => true, 'data' => ['message' => 'Record deleted.']]);
    return;
}

// ═══════════════════════════════════════════
//  POST /agentic/actions/:id/records/bulk — Bulk status update
// ═══════════════════════════════════════════

if ($method === 'POST' && str_ends_with($path, '/records/bulk') && isset($params['id'])) {
    $body = getJsonBody();
    $recordIds = $body['record_ids'] ?? [];
    $status = $body['status'] ?? '';

    if (empty($recordIds) || empty($status)) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'missing_params',
            'message' => 'record_ids and status are required.',
        ]], 422);
        return;
    }

    $updated = $manager->bulkUpdateStatus($recordIds, $status);
    jsonResponse(['ok' => true, 'data' => ['updated' => $updated]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /agentic/actions/:id/records/purge — Purge old records
// ═══════════════════════════════════════════

if ($method === 'POST' && str_ends_with($path, '/records/purge') && isset($params['id'])) {
    $body = getJsonBody();
    $olderThanDays = (int) ($body['older_than_days'] ?? 90);

    if ($olderThanDays < 1) {
        jsonResponse(['ok' => false, 'error' => [
            'code' => 'invalid_days',
            'message' => 'older_than_days must be at least 1.',
        ]], 422);
        return;
    }

    $purged = $manager->purgeOldRecords($params['id'], $olderThanDays);
    jsonResponse(['ok' => true, 'data' => ['purged' => $purged, 'message' => "{$purged} record(s) purged."]]);
    return;
}

// ═══════════════════════════════════════════
//  GET /agentic/templates — List templates
// ═══════════════════════════════════════════

if ($method === 'GET' && ($path === '/agentic/templates' || $path === '/agentic/actions/templates')) {
    $templates = $manager->listTemplates();
    jsonResponse(['ok' => true, 'data' => ['templates' => $templates]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /agentic/manifest — Generate manifest
// ═══════════════════════════════════════════

if (($method === 'POST' || $method === 'GET') && ($path === '/agentic/manifest' || $path === '/agentic/actions/manifest')) {
    $manifest = $manager->generateManifest();
    jsonResponse(['ok' => true, 'data' => $manifest]);
    return;
}

// ── Fallback ──
jsonResponse(['ok' => false, 'error' => [
    'code' => 'not_found',
    'message' => 'Agentic actions endpoint not found.',
]], 404);
