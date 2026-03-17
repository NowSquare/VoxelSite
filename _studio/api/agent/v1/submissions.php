<?php

declare(strict_types=1);

/**
 * Agent API — Submissions Endpoint
 *
 * GET /submissions — List form and action submissions (paginated)
 *
 * Query params:
 *   ?form_id=contact      — Filter by form ID
 *   ?status=new           — Filter by status
 *   ?source=form|action   — Filter by source type (default: both)
 *   ?page=1&per_page=50   — Pagination
 *
 * Pagination strategy:
 *   When source=form or source=action, pagination is applied directly to the
 *   single database query. When source is omitted (both), all matching rows
 *   from both databases are collected, globally sorted by created_at DESC,
 *   then paginated once. This ensures stable, duplicate-free page boundaries.
 *
 * Receives $_agentContext from router.php.
 */

use VoxelSite\Logger;

$ctx = $_agentContext;

$formId  = $_GET['form_id'] ?? null;
$status  = $_GET['status'] ?? null;
$source  = $_GET['source'] ?? null; // 'form', 'action', or null (both)
$page    = max(1, (int) ($_GET['page'] ?? 1));
$perPage = min(100, max(1, (int) ($_GET['per_page'] ?? 50)));

$docRoot = dirname(__DIR__, 4);
$dataDir = $docRoot . '/_data';

// Determine which sources to include
$includeForm   = ($source === null || $source === 'form');
$includeAction = ($source === null || $source === 'action');

// When mixing sources, we need global sort + paginate, so fetch unbounded.
// When single source, we can paginate at the DB level.
$singleSource = ($source === 'form' || $source === 'action');

$allRows = [];
$totalForm = 0;
$totalAction = 0;

// ── Form submissions from submissions.db ──

$formDbPath = $dataDir . '/submissions.db';

if ($includeForm && file_exists($formDbPath)) {
    try {
        $pdo = new \PDO('sqlite:' . $formDbPath, null, null, [
            \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        ]);

        $where = [];
        $params = [];

        if ($formId !== null && !str_starts_with($formId, 'action_')) {
            $where[] = 'form_id = ?';
            $params[] = $formId;
        }
        if ($status !== null) {
            $where[] = 'status = ?';
            $params[] = $status;
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        // Count
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM submissions {$whereClause}");
        $countStmt->execute($params);
        $totalForm = (int) $countStmt->fetchColumn();

        // Skip fetch if filtering exclusively for action_* IDs
        if ($formId === null || !str_starts_with($formId, 'action_')) {
            $sql = "SELECT id, form_id, data, status, ip_address, user_agent, created_at, updated_at
                    FROM submissions {$whereClause}
                    ORDER BY created_at DESC";

            // Single-source: paginate at DB level
            if ($singleSource) {
                $offset = ($page - 1) * $perPage;
                $sql .= " LIMIT ? OFFSET ?";
                $params[] = $perPage;
                $params[] = $offset;
            }

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            foreach ($stmt->fetchAll() as $row) {
                $row['data'] = json_decode($row['data'] ?? '{}', true);
                $row['source'] = 'form';
                $allRows[] = $row;
            }
        }
    } catch (\Throwable $e) {
        Logger::error('agent-api', 'Failed to query form submissions', [
            'error'     => $e->getMessage(),
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
    }
}

// ── Action submissions from actions.db (table: action_records) ──

$actionsDbPath = $dataDir . '/actions.db';

if ($includeAction && file_exists($actionsDbPath)) {
    try {
        $pdo = new \PDO('sqlite:' . $actionsDbPath, null, null, [
            \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        ]);

        // Verify schema
        $tableCheck = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='action_records'");
        if ($tableCheck->fetch()) {
            $where = [];
            $params = [];

            if ($formId !== null) {
                $actionFilterId = str_starts_with($formId, 'action_')
                    ? substr($formId, 7)
                    : $formId;
                $where[] = 'action_id = ?';
                $params[] = $actionFilterId;
            }
            if ($status !== null) {
                $where[] = 'status = ?';
                $params[] = $status;
            }

            $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

            // Count
            $countStmt = $pdo->prepare("SELECT COUNT(*) FROM action_records {$whereClause}");
            $countStmt->execute($params);
            $totalAction = (int) $countStmt->fetchColumn();

            $sql = "SELECT id, action_id, confirmation_code, data, status, ip_address, source, created_at, updated_at
                    FROM action_records {$whereClause}
                    ORDER BY created_at DESC";

            // Single-source: paginate at DB level
            if ($singleSource) {
                $offset = ($page - 1) * $perPage;
                $sql .= " LIMIT ? OFFSET ?";
                $params[] = $perPage;
                $params[] = $offset;
            }

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            foreach ($stmt->fetchAll() as $row) {
                $row['data'] = json_decode($row['data'] ?? '{}', true);
                $row['form_id'] = 'action_' . $row['action_id'];
                $row['source'] = 'action';
                $allRows[] = $row;
            }
        }
    } catch (\Throwable $e) {
        Logger::error('agent-api', 'Failed to query action submissions', [
            'error'     => $e->getMessage(),
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
    }
}

// ── Global pagination for mixed sources ──

$total = $totalForm + $totalAction;

if (!$singleSource) {
    // Global sort by created_at DESC across both sources
    usort($allRows, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));

    // Apply pagination once on the merged, sorted result
    $offset = ($page - 1) * $perPage;
    $submissions = array_slice($allRows, $offset, $perPage);
} else {
    $submissions = $allRows;
}

agentResponse(['data' => [
    'submissions' => $submissions,
    'total'       => $total,
    'page'        => $page,
    'per_page'    => $perPage,
]]);
