<?php

declare(strict_types=1);

/**
 * Site Orchestration API Endpoint (Phase B)
 *
 * POST /site-control/orchestrate
 *
 * Accepts a site-wide prompt and streams orchestration events via SSE.
 *
 * Pipeline stages:
 *   B-2: classify → discover
 *   B-4: scope regions
 *   B-5: build plan (LLM call #2)
 *   B-7: approve → patch → verify
 */

use VoxelSite\Logger;
use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\SiteGraphIndexer;
use VoxelSite\IntentClassifier;
use VoxelSite\SurfaceDiscovery;
use VoxelSite\RegionScoper;
use VoxelSite\PlanBuilder;
use VoxelSite\PatchExecutor;

$user   = $_REQUEST['_user'] ?? null;
$method = $_REQUEST['_route_method'];
$path   = $_REQUEST['_route_path'];

// ── Role guard: owner and editor only ──
if (($user['role'] ?? '') === 'viewer') {
    jsonResponse(['ok' => false, 'error' => [
        'code'    => 'forbidden',
        'message' => 'Site orchestration requires editor or owner access.',
    ]], 403);
    return;
}

// ── Parse request body once — both handlers need it ──
$body = ($method === 'POST') ? getJsonBody() : [];

// ═══════════════════════════════════════════
//  POST /site-control/orchestrate
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/site-control/orchestrate') {
    $prompt = trim($body['prompt'] ?? '');

    if ($prompt === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Prompt is required.',
        ]], 400);
        return;
    }

    Logger::info('site-control', 'Orchestration started', [
        'prompt' => mb_substr($prompt, 0, 200),
        'user_id' => $user['id'] ?? null,
    ]);

    // ── Begin SSE stream ──
    set_time_limit(0);
    ini_set('max_execution_time', '0');
    ignore_user_abort(true);

    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no');

    while (ob_get_level()) {
        ob_end_flush();
    }

    // Helper: emit an SSE event
    $emitSSE = function (string $type, array $data) {
        $data['type'] = $type;
        $payload = "data: " . json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n\n";
        @file_put_contents('php://output', $payload);
        @flush();
    };

    // ───────────────────────────────────────────
    //  Stage 1: Build Site Graph
    // ───────────────────────────────────────────

    $emitSSE('status', [
        'step'    => 'orch:started',
        'message' => 'Analyzing your request…',
        'prompt'  => $prompt,
    ]);

    try {
        $db = Database::getInstance();
        $fileManager = new FileManager($db);
        $indexer = new SiteGraphIndexer($db, $fileManager);
        $graph = $indexer->buildGraph();
        $graphSummary = $graph->summary();
    } catch (\Throwable $e) {
        Logger::error('site-control', 'Graph build failed during orchestration', [
            'error' => $e->getMessage(),
        ]);
        $emitSSE('error', [
            'step'    => 'orch:error',
            'message' => 'Could not build site graph: ' . $e->getMessage(),
        ]);
        exit;
    }

    // ───────────────────────────────────────────
    //  Stage 2: Intent Classification (LLM call #1)
    // ───────────────────────────────────────────

    $emitSSE('status', [
        'step'    => 'orch:classifying',
        'message' => 'Classifying intent…',
    ]);

    // Build compact site context for the classifier
    $siteContext = [
        'pages'    => $graph->getNodesByType('page'),
        'partials' => $graph->getNodesByType('partial'),
        'tokens'   => $graph->getNodesByType('token'),
    ];

    $intent = null;
    $classifierFailed = false;

    try {
        $classifier = new IntentClassifier();
        $intent = $classifier->classify($prompt, $siteContext);
    } catch (\Throwable $e) {
        // LLM call failed — fall back to keyword heuristic
        Logger::warning('site-control', 'IntentClassifier failed, using heuristic', [
            'error'  => $e->getMessage(),
            'prompt' => mb_substr($prompt, 0, 200),
        ]);
        $classifierFailed = true;
        $intent = fallbackClassify($prompt);
    }

    $emitSSE('status', [
        'step'       => 'orch:intent',
        'message'    => ($classifierFailed ? '[heuristic] ' : '') .
                        'Intent: ' . $intent['category'] . ' (' . $intent['scope'] . ')',
        'category'   => $intent['category'],
        'scope'      => $intent['scope'],
        'keywords'   => $intent['keywords'],
        'summary'    => $intent['summary'],
        'heuristic'  => $classifierFailed,
    ]);

    // ───────────────────────────────────────────
    //  Stage 3: Surface Discovery (graph queries)
    // ───────────────────────────────────────────

    $emitSSE('status', [
        'step'    => 'orch:discovering',
        'message' => 'Discovering affected files…',
    ]);

    try {
        $discovery = new SurfaceDiscovery($graph);
        $surfaces  = $discovery->discover($intent);
    } catch (\Throwable $e) {
        Logger::error('site-control', 'SurfaceDiscovery failed', [
            'error' => $e->getMessage(),
        ]);
        $emitSSE('error', [
            'step'    => 'orch:error',
            'message' => 'Discovery failed: ' . $e->getMessage(),
        ]);
        exit;
    }

    $candidateCount = count($surfaces['candidates']);
    $affectedPageCount = count($surfaces['affected_pages']);
    $skippedCount = count($surfaces['skipped']);

    $emitSSE('status', [
        'step'           => 'orch:discovery',
        'message'        => "Found {$candidateCount} candidate file(s) affecting {$affectedPageCount} page(s)" .
                            ($skippedCount > 0 ? " ({$skippedCount} skipped)" : ''),
        'candidates'     => $surfaces['candidates'],
        'affected_pages' => $surfaces['affected_pages'],
        'skipped'        => $surfaces['skipped'],
    ]);

    // If no candidates, short-circuit — nothing to scope or plan
    if ($candidateCount === 0) {
        $emitSSE('done', [
            'step'         => 'orch:no_candidates',
            'message'      => 'No candidate files found for this request.',
            'filesChanged' => 0,
            'summary'      => 'No candidate files found.',
            'intent'       => $intent,
            'discovery'    => $surfaces,
        ]);
        exit;
    }

    // ───────────────────────────────────────────
    //  Stage 4: Region Scoping (file reads)
    // ───────────────────────────────────────────

    $emitSSE('status', [
        'step'    => 'orch:scoping',
        'message' => 'Scoping relevant regions…',
    ]);

    try {
        $scoper = new RegionScoper($fileManager);
        $scoped = $scoper->scope($surfaces['candidates'], $intent);
    } catch (\Throwable $e) {
        Logger::error('site-control', 'RegionScoper failed', [
            'error' => $e->getMessage(),
        ]);
        $emitSSE('error', [
            'step'    => 'orch:error',
            'message' => 'Region scoping failed: ' . $e->getMessage(),
        ]);
        exit;
    }

    $regionCount = 0;
    foreach ($scoped as $s) {
        $regionCount += count($s['regions']);
    }

    $emitSSE('status', [
        'step'       => 'orch:scoped',
        'message'    => "Scoped {$regionCount} region(s) across {$candidateCount} file(s)",
        'scoped'     => array_map(function ($s) {
            // Send metadata only, not full content (keep SSE payload small)
            return [
                'file'        => $s['file'],
                'type'        => $s['type'],
                'strategy'    => $s['strategy'],
                'total_lines' => $s['total_lines'],
                'regions'     => array_map(fn($r) => [
                    'start' => $r['start'],
                    'end'   => $r['end'],
                    'label' => $r['label'],
                ], $s['regions']),
            ];
        }, $scoped),
    ]);

    // ───────────────────────────────────────────
    //  Stage 5: Plan Building (LLM call #2)
    // ───────────────────────────────────────────

    $emitSSE('status', [
        'step'    => 'orch:planning',
        'message' => 'Building edit plan…',
    ]);

    $plan = null;
    $planFailed = false;

    try {
        $planner = new PlanBuilder();
        $plan = $planner->build($intent, $scoped, $prompt);
    } catch (\Throwable $e) {
        Logger::error('site-control', 'PlanBuilder failed', [
            'error' => $e->getMessage(),
        ]);
        $planFailed = true;
        $plan = [
            'edits'      => [],
            'summary'    => 'Plan generation failed: ' . $e->getMessage(),
            'risk_level' => 'high',
        ];
    }

    $editCount = count($plan['edits']);

    $emitSSE('status', [
        'step'       => 'orch:plan',
        'message'    => $planFailed
            ? '[error] Plan generation failed'
            : "{$editCount} edit(s) planned — {$plan['risk_level']} risk",
        'plan'       => $plan,
        'failed'     => $planFailed,
    ]);

    // ───────────────────────────────────────────
    //  Done: send full payload for review panel
    //  B-7+ will add: patch → verify → report
    // ───────────────────────────────────────────

    $emitSSE('done', [
        'step'         => 'orch:plan_ready',
        'message'      => $plan['summary'],
        'filesChanged' => 0,
        'summary'      => $plan['summary'],
        'intent'       => $intent,
        'discovery'    => $surfaces,
        'plan'         => $plan,
    ]);

    Logger::info('site-control', 'Orchestration plan complete', [
        'prompt'     => mb_substr($prompt, 0, 200),
        'intent'     => $intent,
        'candidates' => $candidateCount,
        'edits'      => $editCount,
        'risk'       => $plan['risk_level'],
    ]);

    exit;
}


// ═══════════════════════════════════════════
//  POST /site-control/apply
// ═══════════════════════════════════════════

if ($path === '/site-control/apply' && $method === 'POST') {
    $edits = $body['edits'] ?? [];

    if (empty($edits)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'no_edits',
            'message' => 'No edits provided.',
        ]], 400);
        exit;
    }

    // ── Log the edit manifest so support can see what was attempted ──
    $editManifest = array_map(function ($e) {
        return [
            'file'     => $e['file'] ?? '?',
            'strategy' => $e['strategy'] ?? '?',
            'anchored' => $e['anchored'] ?? false,
            'desc'     => mb_substr($e['description'] ?? '', 0, 120),
        ];
    }, $edits);

    Logger::info('site-control', 'Apply requested', [
        'edit_count' => count($edits),
        'user_id'    => $user['id'] ?? null,
        'edits'      => $editManifest,
    ]);

    // SSE setup — match the orchestrate endpoint's contract exactly
    set_time_limit(0);
    ini_set('max_execution_time', '0');
    ignore_user_abort(true);

    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no');

    while (ob_get_level()) {
        ob_end_flush();
    }

    $emitSSE = function (string $type, array $data) {
        $data['type'] = $type;
        $payload = "data: " . json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n\n";
        @file_put_contents('php://output', $payload);
        @flush();
    };

    $emitSSE('status', [
        'phase'   => 'start',
        'message' => 'Applying ' . count($edits) . ' edit(s)…',
    ]);

    // Execute with emit-time logging — each phase is persisted the instant it's created.
    // If the process crashes mid-patch, the partial transcript is already on disk.
    $db = Database::getInstance();
    $fileManager = new FileManager($db);

    $onEmit = function (array $entry) use ($emitSSE) {
        // Persist to server log at emit time
        $logLevel = ($entry['status'] === 'ok') ? 'info' : 'warning';
        Logger::$logLevel('site-control', 'apply:' . $entry['phase'], [
            'file'   => $entry['file'],
            'status' => $entry['status'],
            'detail' => $entry['detail'],
            'bytes'  => $entry['bytes'] ?? null,
            'ms'     => $entry['ms'] ?? null,
        ]);

        // Stream to browser simultaneously
        $emitSSE('status', [
            'phase'   => $entry['phase'],
            'file'    => $entry['file'],
            'status'  => $entry['status'],
            'message' => $entry['detail'],
            'bytes'   => $entry['bytes'] ?? null,
            'ms'      => $entry['ms'] ?? null,
        ]);
    };

    $executor = new PatchExecutor($fileManager, $onEmit);

    try {
        $result = $executor->execute($edits);
    } catch (\Throwable $e) {
        // Unexpected crash — the partial transcript is already on disk
        // via the onEmit callback. Log the exception context as well.
        Logger::critical('site-control', 'Apply crashed', [
            'exception' => get_class($e),
            'message'   => $e->getMessage(),
            'file'      => $e->getFile(),
            'line'      => $e->getLine(),
            'trace'     => mb_substr($e->getTraceAsString(), 0, 2000),
        ]);

        $emitSSE('error', [
            'phase'          => 'crash',
            'message'        => 'Internal error during patch execution.',
            'rollback_clean' => false,
            'verification'   => [],
            'duration_ms'    => null,
        ]);

        @flush();
        exit;
    }

    if ($result['success']) {
        $emitSSE('done', [
            'phase'        => 'complete',
            'message'      => $result['files_changed'] . ' file(s) patched and verified.',
            'filesChanged' => $result['files_changed'],
            'verification' => $result['verification'],
            'duration_ms'  => $result['duration_ms'],
        ]);

        // Persist verification summary
        $verifyCompact = array_map(function ($v) {
            $checks = array_map(function ($c) {
                return ($c['passed'] ? '✓' : '✗') . ' ' . $c['check'];
            }, $v['checks'] ?? []);
            return $v['file'] . ': ' . implode(', ', $checks);
        }, $result['verification'] ?? []);

        Logger::info('site-control', 'Apply complete', [
            'files_changed' => $result['files_changed'],
            'duration_ms'   => $result['duration_ms'],
            'verification'  => $verifyCompact,
        ]);
    } else {
        $emitSSE('error', [
            'phase'          => 'failed',
            'message'        => $result['error'] ?? 'Patch execution failed.',
            'rollback_clean' => $result['rollback_clean'] ?? true,
            'verification'   => $result['verification'],
            'duration_ms'    => $result['duration_ms'],
        ]);

        // Persist failure with full context
        $failedChecks = [];
        foreach ($result['verification'] ?? [] as $v) {
            foreach ($v['checks'] ?? [] as $c) {
                if (!$c['passed']) {
                    $failedChecks[] = $v['file'] . ':' . $c['check'] . ' — ' . ($c['detail'] ?? '');
                }
            }
        }

        Logger::error('site-control', 'Apply failed', [
            'error'          => $result['error'] ?? 'Unknown',
            'rollback_clean' => $result['rollback_clean'] ?? true,
            'duration_ms'    => $result['duration_ms'],
            'failed_checks'  => $failedChecks ?: null,
        ]);
    }

    // Ensure the final event is delivered
    @flush();

    exit;
}

// ── Fallback: unknown route ──
jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Unknown site-orchestrate route.',
]], 404);

// ═══════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════

/**
 * Keyword-based heuristic fallback when the LLM classifier is unavailable.
 * Crude but ensures the pipeline can still discover files without AI.
 */
function fallbackClassify(string $prompt): array
{
    $lower = strtolower($prompt);

    // Category heuristic
    $category = 'content';
    if (preg_match('/\b(color|font|style|css|spacing|theme|dark\s*mode|border|shadow|gradient)\b/', $lower)) {
        $category = 'style';
    } elseif (preg_match('/\b(seo|meta\s*tag|title\s*tag|description|og:|twitter:|schema)\b/', $lower)) {
        $category = 'seo';
    } elseif (preg_match('/\b(nav|menu|link|breadcrumb|sidebar|footer\s*link)\b/', $lower)) {
        $category = 'navigation';
    } elseif (preg_match('/\b(add\s*page|remove\s*page|section|layout|restructure)\b/', $lower)) {
        $category = 'structure';
    }

    // Scope heuristic
    $scope = 'site-wide';
    if (preg_match('/\b(?:on|for|the)\s+(\w+)\s+page\b/', $lower, $m)) {
        $scope = 'page:' . $m[1];
    }

    // Extract keywords (simple word extraction)
    $words = preg_split('/\s+/', $lower);
    $stopWords = array_flip(['the', 'a', 'an', 'is', 'are', 'on', 'in', 'to', 'for', 'and', 'or', 'of', 'my', 'all', 'across', 'change', 'update', 'make', 'add', 'site', 'page', 'pages']);
    $keywords = [];
    foreach ($words as $w) {
        $w = trim($w, '.,!?;:');
        if (strlen($w) > 2 && !isset($stopWords[$w]) && count($keywords) < 5) {
            $keywords[] = $w;
        }
    }

    return [
        'category' => $category,
        'scope'    => $scope,
        'keywords' => $keywords,
        'summary'  => 'Heuristic classification (LLM unavailable).',
    ];
}
