<?php

declare(strict_types=1);

/**
 * Site Graph API Endpoints (read-only)
 *
 * GET /site-graph              — Full graph index with summary, nodes, and edges
 * GET /site-graph/blast-radius — Blast radius for a specific node (?node=<nodeId>)
 *
 * These endpoints are read-only. No mutations, no side effects.
 */

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\SiteGraphIndexer;

$user   = $_REQUEST['_user'] ?? null;
$method = $_REQUEST['_route_method'];
$path   = $_REQUEST['_route_path'];

// ── Role guard: owner and editor only ──
// The blanket viewer write-block in router.php doesn't cover GET endpoints.
// Site graph is a creative tool — viewers should not access it.
if ($user['role'] === 'viewer') {
    jsonResponse(['ok' => false, 'error' => [
        'code'    => 'forbidden',
        'message' => 'Site workspace requires editor or owner access.',
    ]], 403);
    return;
}

// ═══════════════════════════════════════════
//  GET /site-graph — Full graph index
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/site-graph') {
    try {
        $startTime = microtime(true);

        $db = Database::getInstance();
        $fileManager = new FileManager($db);
        $indexer = new SiteGraphIndexer($db, $fileManager);
        $graph = $indexer->buildGraph();

        $buildTimeMs = round((microtime(true) - $startTime) * 1000, 1);

        $data = $graph->toArray();
        $summary = $graph->summary();

        jsonResponse(['ok' => true, 'data' => [
            'summary'       => $summary,
            'nodes'         => $data['nodes'],
            'edges'         => $data['edges'],
            'built_at'      => gmdate('Y-m-d\TH:i:s\Z'),
            'build_time_ms' => $buildTimeMs,
        ]]);
    } catch (\Throwable $e) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'graph_build_failed',
            'message' => 'Could not build site graph: ' . $e->getMessage(),
        ]], 500);
    }

    return;
}

// ═══════════════════════════════════════════
//  GET /site-graph/blast-radius — Impact query
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/site-graph/blast-radius') {
    $nodeId = trim((string) ($_GET['node'] ?? ''));

    if ($nodeId === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Missing required query parameter: node (e.g., ?node=partial:_partials/nav.php)',
        ]], 400);
        return;
    }

    try {
        $db = Database::getInstance();
        $fileManager = new FileManager($db);
        $indexer = new SiteGraphIndexer($db, $fileManager);
        $graph = $indexer->buildGraph();

        $targetNode = $graph->getNode($nodeId);
        if ($targetNode === null) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'not_found',
                'message' => "Node not found in graph: {$nodeId}",
            ]], 404);
            return;
        }

        $affectedPages = $graph->getBlastRadius($nodeId);
        $summary = $graph->summary();
        $isGlobal = count($affectedPages) === $summary['pages'];

        jsonResponse(['ok' => true, 'data' => [
            'target'         => $targetNode,
            'affected_pages' => $affectedPages,
            'affected_count' => count($affectedPages),
            'total_pages'    => $summary['pages'],
            'is_global'      => $isGlobal,
        ]]);
    } catch (\Throwable $e) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'query_failed',
            'message' => 'Could not compute blast radius: ' . $e->getMessage(),
        ]], 500);
    }

    return;
}

// ── Fallback ──
jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Site graph endpoint not found.',
]], 404);
