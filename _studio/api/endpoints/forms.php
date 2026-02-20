<?php
/**
 * VoxelSite Forms & Submissions API
 *
 * Endpoints for managing form schemas and their submissions.
 * - Lists form definitions from assets/forms/*.json
 * - Queries submissions from _data/submissions.db (shared with submit.php)
 * - Supports filtering, status updates, notes, CSV export
 *
 * Routes:
 *   GET    /forms                         → List all forms with submission counts
 *   GET    /forms/:formId                 → Get single form details + recent submissions
 *   GET    /forms/:formId/submissions     → List submissions (with filters)
 *   GET    /forms/:formId/submissions/export → CSV export
 *   PUT    /forms/:formId/submissions/:id → Update submission (status, notes)
 *   DELETE /forms/:formId/submissions/:id → Delete a submission
 */

declare(strict_types=1);

use VoxelSite\Logger;

$path   = $_REQUEST['_route_path'];
$method = $_REQUEST['_route_method'];
$params = $_REQUEST['_route_params'] ?? [];

// Resolve project root reliably — DOCUMENT_ROOT is empty in Herd/Valet.
// This file lives at _studio/api/endpoints/, so project root is 3 levels up.
$docRoot  = dirname(__DIR__, 3);
$formsDir = $docRoot . '/assets/forms';
$dataDir  = $docRoot . '/_data';
$dbPath   = $dataDir . '/submissions.db';

// ═══════════════════════════════════════════
//  Helper: Load all form schemas
// ═══════════════════════════════════════════

function loadFormSchemas(string $formsDir): array
{
    $forms = [];
    if (!is_dir($formsDir)) {
        return $forms;
    }

    foreach (glob($formsDir . '/*.json') as $file) {
        $content = file_get_contents($file);
        $schema = json_decode($content, true);
        if ($schema && isset($schema['id'])) {
            $forms[$schema['id']] = $schema;
        }
    }

    return $forms;
}

// ═══════════════════════════════════════════
//  Helper: Get submissions database
// ═══════════════════════════════════════════

function getSubmissionsDb(string $dbPath): ?PDO
{
    if (!file_exists($dbPath)) {
        return null;
    }

    try {
        $db = new PDO('sqlite:' . $dbPath);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->exec('PRAGMA journal_mode=WAL');
        return $db;
    } catch (PDOException $e) {
        Logger::error('forms', 'Failed to connect to submissions database', [
            'db_path'   => $dbPath,
            'exception' => $e->getMessage(),
        ]);
        return null;
    }
}

// ═══════════════════════════════════════════
//  Helper: Count submissions per form
// ═══════════════════════════════════════════

function getSubmissionCounts(?PDO $db): array
{
    if (!$db) {
        return [];
    }

    try {
        $stmt = $db->query('SELECT form_id, COUNT(*) as total, SUM(CASE WHEN status = \'new\' THEN 1 ELSE 0 END) as unread FROM submissions GROUP BY form_id');
        $counts = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $counts[$row['form_id']] = [
                'total'  => (int) $row['total'],
                'unread' => (int) $row['unread'],
            ];
        }
        return $counts;
    } catch (PDOException $e) {
        return [];
    }
}

// ═══════════════════════════════════════════
//  Route: GET /forms — List all forms
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/forms') {
    $schemas = loadFormSchemas($formsDir);
    $db = getSubmissionsDb($dbPath);
    $counts = getSubmissionCounts($db);

    $forms = [];
    foreach ($schemas as $id => $schema) {
        $c = $counts[$id] ?? ['total' => 0, 'unread' => 0];
        $forms[] = [
            'id'          => $id,
            'name'        => $schema['name'] ?? $id,
            'description' => $schema['description'] ?? '',
            'fields'      => count($schema['fields'] ?? []),
            'total'       => $c['total'],
            'unread'      => $c['unread'],
            'created'     => date('c', filemtime($formsDir . '/' . $id . '.json')),
        ];
    }

    // Include orphaned submissions (form_ids in DB but no matching schema)
    foreach ($counts as $formId => $c) {
        if (!isset($schemas[$formId]) && $c['total'] > 0) {
            $forms[] = [
                'id'          => $formId,
                'name'        => $formId . ' (deleted)',
                'description' => 'Schema removed — submissions still available',
                'fields'      => 0,
                'total'       => $c['total'],
                'unread'      => $c['unread'],
                'orphaned'    => true,
                'created'     => null,
            ];
        }
    }

    // Also count total unread across all forms
    $totalUnread = array_sum(array_column($forms, 'unread'));

    jsonResponse([
        'ok'   => true,
        'data' => [
            'forms'        => $forms,
            'total_unread' => $totalUnread,
        ],
    ]);
    exit;
}

// ═══════════════════════════════════════════
//  Route: GET /forms/:formId — Form detail
// ═══════════════════════════════════════════

if ($method === 'GET' && isset($params['formId']) && !str_contains($path, '/submissions')) {
    $formId = $params['formId'];
    $schemas = loadFormSchemas($formsDir);

    if (!isset($schemas[$formId])) {
        jsonResponse(['ok' => false, 'error' => ['code' => 'not_found', 'message' => 'Form not found']], 404);
        exit;
    }

    $schema = $schemas[$formId];
    $db = getSubmissionsDb($dbPath);

    // Get submission stats
    $stats = ['total' => 0, 'new' => 0, 'read' => 0, 'replied' => 0, 'archived' => 0];
    if ($db) {
        try {
            $stmt = $db->prepare('SELECT status, COUNT(*) as count FROM submissions WHERE form_id = ? GROUP BY status');
            $stmt->execute([$formId]);
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $stats[$row['status']] = (int) $row['count'];
                $stats['total'] += (int) $row['count'];
            }
        } catch (PDOException $e) {
            // Silently continue with zero counts
        }
    }

    jsonResponse([
        'ok'   => true,
        'data' => [
            'form'  => $schema,
            'stats' => $stats,
        ],
    ]);
    exit;
}

// ═══════════════════════════════════════════
//  Route: GET /forms/:formId/submissions
// ═══════════════════════════════════════════

if ($method === 'GET' && isset($params['formId']) && str_contains($path, '/submissions') && !str_contains($path, '/export')) {
    $formId = $params['formId'];
    $db = getSubmissionsDb($dbPath);

    if (!$db) {
        jsonResponse(['ok' => true, 'data' => ['submissions' => [], 'total' => 0, 'page' => 1, 'per_page' => 20]]);
        exit;
    }

    // Filters
    $status  = $_GET['status'] ?? null;
    $source  = $_GET['source'] ?? null;
    $search  = $_GET['search'] ?? null;
    $page    = max(1, (int) ($_GET['page'] ?? 1));
    $perPage = min(100, max(1, (int) ($_GET['per_page'] ?? 20)));
    $offset  = ($page - 1) * $perPage;

    // Build query
    $where = ['form_id = ?'];
    $bindings = [$formId];

    if ($status && $status !== 'all') {
        $where[] = 'status = ?';
        $bindings[] = $status;
    }
    if ($source && $source !== 'all') {
        $where[] = 'source = ?';
        $bindings[] = $source;
    }
    if ($search) {
        $where[] = 'data LIKE ?';
        $bindings[] = '%' . $search . '%';
    }

    $whereClause = implode(' AND ', $where);

    try {
        // Total count
        $countStmt = $db->prepare("SELECT COUNT(*) FROM submissions WHERE {$whereClause}");
        $countStmt->execute($bindings);
        $total = (int) $countStmt->fetchColumn();

        // Fetch submissions
        $stmt = $db->prepare(
            "SELECT id, form_id, data, status, ip_address, user_agent, referrer, source, created_at, updated_at, read_at, notes
             FROM submissions
             WHERE {$whereClause}
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?"
        );
        $allBindings = array_merge($bindings, [$perPage, $offset]);
        $stmt->execute($allBindings);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Parse JSON data and build response
        $submissions = array_map(function ($row) {
            $row['data'] = json_decode($row['data'], true) ?? [];
            $row['id'] = (int) $row['id'];
            return $row;
        }, $rows);

        jsonResponse([
            'ok'   => true,
            'data' => [
                'submissions' => $submissions,
                'total'       => $total,
                'page'        => $page,
                'per_page'    => $perPage,
            ],
        ]);
    } catch (PDOException $e) {
        Logger::error('forms', 'Failed to query submissions', [
            'form_id'   => $formId,
            'exception' => $e->getMessage(),
        ]);
        jsonResponse(['ok' => false, 'error' => ['code' => 'db_error', 'message' => 'Failed to query submissions']], 500);
    }
    exit;
}

// ═══════════════════════════════════════════
//  Route: GET /forms/:formId/submissions/export — CSV export
// ═══════════════════════════════════════════

if ($method === 'GET' && isset($params['formId']) && str_contains($path, '/export')) {
    $formId = $params['formId'];
    $db = getSubmissionsDb($dbPath);

    if (!$db) {
        jsonResponse(['ok' => false, 'error' => ['code' => 'no_data', 'message' => 'No submissions database found']], 404);
        exit;
    }

    // Load schema for headers
    $schemas = loadFormSchemas($formsDir);
    $schema = $schemas[$formId] ?? null;

    try {
        $stmt = $db->prepare('SELECT * FROM submissions WHERE form_id = ? ORDER BY created_at DESC');
        $stmt->execute([$formId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($rows)) {
            jsonResponse(['ok' => false, 'error' => ['code' => 'no_data', 'message' => 'No submissions to export']], 404);
            exit;
        }

        // Determine all unique data keys across submissions
        $dataKeys = [];
        foreach ($rows as $row) {
            $data = json_decode($row['data'], true) ?? [];
            foreach (array_keys($data) as $key) {
                if (!in_array($key, $dataKeys)) {
                    $dataKeys[] = $key;
                }
            }
        }

        // Map data keys to labels from schema
        $fieldLabels = [];
        if ($schema) {
            foreach ($schema['fields'] as $field) {
                $fieldLabels[$field['name']] = $field['label'] ?? $field['name'];
            }
        }

        // Build CSV
        $output = fopen('php://temp', 'r+');

        // Headers
        $headers = ['ID', 'Status', 'Source'];
        foreach ($dataKeys as $key) {
            $headers[] = $fieldLabels[$key] ?? $key;
        }
        $headers[] = 'IP Address';
        $headers[] = 'Submitted At';
        $headers[] = 'Notes';
        fputcsv($output, $headers);

        // Rows
        foreach ($rows as $row) {
            $data = json_decode($row['data'], true) ?? [];
            $csvRow = [
                $row['id'],
                $row['status'],
                $row['source'],
            ];
            foreach ($dataKeys as $key) {
                $value = $data[$key] ?? '';
                $csvRow[] = is_array($value) ? implode(', ', $value) : (string) $value;
            }
            $csvRow[] = $row['ip_address'];
            $csvRow[] = $row['created_at'];
            $csvRow[] = $row['notes'] ?? '';
            fputcsv($output, $csvRow);
        }

        rewind($output);
        $csvContent = stream_get_contents($output);
        fclose($output);

        $filename = $formId . '_submissions_' . date('Y-m-d') . '.csv';

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        echo $csvContent;
    } catch (PDOException $e) {
        Logger::error('forms', 'Failed to export submissions', [
            'form_id'   => $formId,
            'exception' => $e->getMessage(),
        ]);
        jsonResponse(['ok' => false, 'error' => ['code' => 'db_error', 'message' => 'Failed to export submissions']], 500);
    }
    exit;
}

// ═══════════════════════════════════════════
//  Route: PUT /forms/:formId/submissions/:id — Update submission
// ═══════════════════════════════════════════

if ($method === 'PUT' && isset($params['formId']) && isset($params['id'])) {
    $formId = $params['formId'];
    $subId  = (int) $params['id'];
    $db = getSubmissionsDb($dbPath);

    if (!$db) {
        jsonResponse(['ok' => false, 'error' => ['code' => 'no_data', 'message' => 'No submissions database found']], 404);
        exit;
    }

    $body = getJsonBody();
    $updates = [];
    $bindings = [];

    // Status update
    $validStatuses = ['new', 'read', 'replied', 'archived'];
    if (isset($body['status']) && in_array($body['status'], $validStatuses, true)) {
        $updates[] = 'status = ?';
        $bindings[] = $body['status'];

        // Auto-set read_at on first read
        if ($body['status'] !== 'new') {
            $updates[] = 'read_at = COALESCE(read_at, ?)';
            $bindings[] = date('c');
        }
    }

    // Notes update
    if (array_key_exists('notes', $body)) {
        $updates[] = 'notes = ?';
        $bindings[] = $body['notes'];
    }

    if (empty($updates)) {
        jsonResponse(['ok' => false, 'error' => ['code' => 'no_changes', 'message' => 'No valid fields to update']], 400);
        exit;
    }

    $updates[] = 'updated_at = ?';
    $bindings[] = date('c');

    // Add WHERE bindings
    $bindings[] = $subId;
    $bindings[] = $formId;

    try {
        $sql = 'UPDATE submissions SET ' . implode(', ', $updates) . ' WHERE id = ? AND form_id = ?';
        $stmt = $db->prepare($sql);
        $stmt->execute($bindings);

        if ($stmt->rowCount() === 0) {
            jsonResponse(['ok' => false, 'error' => ['code' => 'not_found', 'message' => 'Submission not found']], 404);
            exit;
        }

        jsonResponse(['ok' => true, 'data' => ['message' => 'Submission updated']]);
    } catch (PDOException $e) {
        jsonResponse(['ok' => false, 'error' => ['code' => 'db_error', 'message' => 'Failed to update submission']], 500);
    }
    exit;
}

// ═══════════════════════════════════════════
//  Route: DELETE /forms/:formId/submissions/:id
// ═══════════════════════════════════════════

if ($method === 'DELETE' && isset($params['formId']) && isset($params['id'])) {
    $formId = $params['formId'];
    $subId  = (int) $params['id'];
    $db = getSubmissionsDb($dbPath);

    if (!$db) {
        jsonResponse(['ok' => false, 'error' => ['code' => 'no_data', 'message' => 'No submissions database found']], 404);
        exit;
    }

    try {
        $stmt = $db->prepare('DELETE FROM submissions WHERE id = ? AND form_id = ?');
        $stmt->execute([$subId, $formId]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(['ok' => false, 'error' => ['code' => 'not_found', 'message' => 'Submission not found']], 404);
            exit;
        }

        jsonResponse(['ok' => true, 'data' => ['message' => 'Submission deleted']]);
    } catch (PDOException $e) {
        jsonResponse(['ok' => false, 'error' => ['code' => 'db_error', 'message' => 'Failed to delete submission']], 500);
    }
    exit;
}

// Fallback
jsonResponse(['ok' => false, 'error' => ['code' => 'not_found', 'message' => 'Form endpoint not found']], 404);
