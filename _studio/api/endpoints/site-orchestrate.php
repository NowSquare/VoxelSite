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
use VoxelSite\SitePlanStore;
use VoxelSite\SiteMutationLock;
use VoxelSite\RevisionManager;

$user   = $_REQUEST['_user'] ?? null;
$method = $_REQUEST['_route_method'];
$path   = $_REQUEST['_route_path'];

// ── Role guard: owner and editor only ──
if (!in_array($user['role'] ?? '', ['owner', 'editor'], true)) {
    jsonResponse(['ok' => false, 'error' => [
        'code'    => 'forbidden',
        'message' => 'Site orchestration requires editor or owner access.',
    ]], 403);
    return;
}

// ── Parse request body once — both handlers need it ──
$body = ($method === 'POST') ? getJsonBody() : [];

if ($method === 'GET' && preg_match('#^/site-control/mutations/([a-f0-9]{32})$#D', $path, $match)) {
    $journal = new \VoxelSite\SiteMutationJournal(Database::getInstance());
    $record = $journal->get($match[1],(int)$user['id']);
    if ($record === null && !\VoxelSite\DemoMode::isActive()) {
        try {
            $missingLock = SiteMutationLock::acquire();
            $record = $journal->resolveMissing($match[1],(int)$user['id']);
        } catch (\RuntimeException) {
            // A writer may have accepted this request but not inserted its journal row yet.
            jsonResponse(['ok'=>true,'data'=>['mutation_id'=>$match[1],'status'=>'applying',
                'response'=>null,'httpCode'=>null,'snapshotId'=>null,'restored'=>null]]);
            return;
        }
    }
    if ($record === null) { jsonResponse(['ok'=>false,'error'=>['code'=>'not_found','message'=>'Change result not found.']],404); return; }
    if ($record['status'] === 'applying' && !\VoxelSite\DemoMode::isActive()) {
        try {
            $recoveryLock = SiteMutationLock::acquire();
            $journal->recoverInterrupted();
            $record = $journal->get($match[1],(int)$user['id']);
        } catch (\RuntimeException) { /* A running request owns the mutation lock. */ }
    }
    jsonResponse(['ok'=>true,'data'=>$record]);
    return;
}

if ($method === 'GET' && preg_match('#^/site-control/plans/([a-f0-9]{48})$#D', $path, $match)) {
    $db = Database::getInstance();
    $store = new SitePlanStore($db, new FileManager($db));
    $record = $store->get($match[1], (int)$user['id']);
    if ($record === null) {
        jsonResponse(['ok'=>false,'error'=>['code'=>'not_found','message'=>'Reviewed plan not found.']],404);
        return;
    }
    if ($record['status'] === 'applying' && !\VoxelSite\DemoMode::isActive()) {
        try {
            $recoveryLock = SiteMutationLock::acquire();
            $store->recoverInterrupted();
            $record = $store->get($match[1], (int)$user['id']);
        } catch (\RuntimeException) { /* A live worker still holds the lock. */ }
    }
    jsonResponse(['ok'=>true,'data'=>$record]);
    return;
}

// ═══════════════════════════════════════════
//  POST /site-control/orchestrate
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/site-control/orchestrate') {
    $prompt = is_string($body['prompt'] ?? null) ? trim($body['prompt']) : '';

    if ($prompt === '' || mb_strlen($prompt) > 4000) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Enter a request of up to 4,000 characters.',
        ]], 400);
        return;
    }

    Logger::info('site-control', 'Orchestration started', [
        'prompt' => mb_substr($prompt, 0, 200),
        'user_id' => $user['id'] ?? null,
    ]);

    try {
        $planningLock = SiteMutationLock::acquire();
        (new \VoxelSite\SiteMutationJournal(Database::getInstance()))->recoverInterrupted();
        (new SitePlanStore(Database::getInstance(), new FileManager()))->recoverInterrupted();
        \VoxelSite\SiteRecovery::assertWritable(Database::getInstance());
    } catch (\Throwable $e) {
        jsonResponse(['ok'=>false,'error'=>['code'=>'site_busy','message'=>$e->getMessage()]],409);
        return;
    }

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
            'message'      => $surfaces['message'] ?? 'No candidate files found for this request.',
            'filesChanged' => 0,
            'summary'      => $surfaces['message'] ?? 'No candidate files found.',
            'clarification_required' => $surfaces['clarification_required'] ?? false,
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

    if (!$planFailed && ($plan['applicable'] ?? true) && !empty($plan['edits'])) {
        try {
            $store = new SitePlanStore($db, $fileManager);
            $plan['plan_id'] = $store->create((int)$user['id'], $plan);
        } catch (\Throwable $e) {
            $planFailed = true;
            $plan['applicable'] = false;
            $plan['validation_errors'][] = $e->getMessage();
            $plan['summary'] = $e->getMessage();
        }
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
    $planId = $body['plan_id'] ?? null;
    if (!is_string($planId) || !preg_match('/^[a-f0-9]{48}$/D', $planId) || isset($body['edits'])) {
        jsonResponse(['ok'=>false,'error'=>['code'=>'review_required',
            'message'=>'Apply a stored reviewed plan. Build a new plan first.']],400);
        return;
    }
    try {
        $applyLock = SiteMutationLock::acquire();
        $db = Database::getInstance();
        $fileManager = new FileManager($db);
        $store = new SitePlanStore($db, $fileManager);
        $store->recoverInterrupted();
        $record = $store->begin($planId, (int)$user['id']);
    } catch (\Throwable $e) {
        jsonResponse(['ok'=>false,'error'=>['code'=>'review_conflict','message'=>$e->getMessage()]],409);
        return;
    }
    $edits = $record['plan']['edits'];

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

    if (in_array($record['status'], ['applied','failed'], true)) {
        $result = $record['result'];
        $result['message'] = $result['error'] ?? ($result['files_changed'] . ' file(s) patched and verified.');
        $emitSSE($result['success'] ? 'done' : 'error', $result);
        exit;
    }

    $emitSSE('status', [
        'phase'   => 'start',
        'message' => 'Applying ' . count($edits) . ' edit(s)…',
    ]);

    // Execute with emit-time logging — each phase is persisted the instant it's created.
    // If the process crashes mid-patch, the partial transcript is already on disk.
    $before = [];
    foreach ($edits as $edit) { $before[$edit['file']] = $fileManager->readFile($edit['file']); }

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
        if ($result['success']) {
            $ops = array_map(static fn($path) => ['path'=>$path,'action'=>'write'], array_keys($before));
            $revisions = new RevisionManager($db, null, $fileManager);
            $revisions->recordAppliedRevision($ops, 'Site: ' . ($record['plan']['summary'] ?? 'Reviewed edits'),
                (int)$user['id'], $before, function (int $revisionId) use (&$result, $store, $planId): void {
                    $result['revision_id'] = $revisionId;
                    $store->finish($planId, $result);
                });
        } else {
            $store->finish($planId, $result);
        }
        $result = $store->get($planId, (int)$user['id'])['result'];
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

        $store->recoverInterrupted();
        $recovery = $store->get($planId, (int)$user['id'])['result'];
        $emitSSE('error', $recovery + [
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
            'plan_id' => $planId,
            'changed_files' => $result['changed_files'] ?? array_keys($before),
            'recovery_snapshot_id' => $result['recovery_snapshot_id'],
            'revision_id' => $result['revision_id'] ?? null,
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
            'plan_id' => $planId,
            'remaining_changed_files' => $result['remaining_changed_files'] ?? [],
            'recovery_snapshot_id' => $result['recovery_snapshot_id'],
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
