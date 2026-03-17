<?php

declare(strict_types=1);

/**
 * Agent API — Pages Endpoint
 *
 * GET    /pages        — List pages (paginated)
 * GET    /pages/:slug  — Get single page with content
 * POST   /pages        — Create a new page
 * PUT    /pages/:slug  — Update page content/metadata/slug
 * DELETE /pages/:slug  — Delete a page
 *
 * Receives $_agentContext from router.php.
 */

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\Logger;
use VoxelSite\PageService;
use VoxelSite\RevisionManager;

$ctx    = $_agentContext;
$method = $ctx['method'];
$params = $ctx['params'];

$db          = Database::getInstance();
$pageService = new PageService($db);

// ═══════════════════════════════════════════
//  GET /pages — List pages (paginated)
// ═══════════════════════════════════════════

if ($method === 'GET' && empty($params['slug'])) {
    $page    = max(1, (int) ($_GET['page'] ?? 1));
    $perPage = min(100, max(1, (int) ($_GET['per_page'] ?? 50)));

    $result = $pageService->listPages($page, $perPage);

    agentResponse(['data' => $result]);
    return;
}

// ═══════════════════════════════════════════
//  GET /pages/:slug — Single page
// ═══════════════════════════════════════════

if ($method === 'GET' && isset($params['slug'])) {
    $page = $pageService->getPage($params['slug']);

    if (!$page) {
        Logger::warning('agent-api', 'Page not found', [
            'slug'      => $params['slug'],
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentError(404, 'not_found', "Page '{$params['slug']}' not found.");
        return;
    }

    agentResponse(['data' => ['page' => $page]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /pages — Create page
// ═══════════════════════════════════════════

if ($method === 'POST') {
    $body    = json_decode(file_get_contents('php://input'), true) ?? [];
    $slug    = $body['slug'] ?? '';
    $title   = $body['title'] ?? '';
    $content = $body['content'] ?? '';

    // Create revision before writing
    $revisionManager = new RevisionManager($db);
    $filePath = PageService::normalizeSlug($slug);
    $filePath = ($filePath === 'index' ? 'index.php' : $filePath . '.php');

    try {
        $revisionId = $revisionManager->createRevision(
            [['path' => $filePath, 'action' => 'write']],
            "Agent API: Create page '{$slug}'",
            0 // API operations use user_id 0
        );

        $result = $pageService->createPage($slug, $title, $content, 'api');

        $revisionManager->captureAfterState($revisionId, [
            ['path' => $filePath, 'action' => 'write'],
        ]);

        Logger::info('agent-api', 'Page created', [
            'slug'      => $slug,
            'title'     => $title,
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);

        agentResponse(['data' => $result], 201);
    } catch (\RuntimeException $e) {
        $code = $e->getCode();
        $errorCode = match (true) {
            $code === 409         => 'conflict',
            $code === 404         => 'not_found',
            str_contains($e->getMessage(), 'traversal') => 'invalid_path',
            default               => 'validation_error',
        };
        $httpCode = match (true) {
            $code >= 400 && $code < 600 => $code,
            default                     => 422,
        };
        Logger::exception('agent-api', $e, [
            'operation' => 'page_create',
            'slug'      => $slug,
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentError($httpCode, $errorCode, $e->getMessage());
    }
    return;
}

// ═══════════════════════════════════════════
//  PUT /pages/:slug — Update page
// ═══════════════════════════════════════════

if ($method === 'PUT' && isset($params['slug'])) {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    // Create revision before writing
    $revisionManager = new RevisionManager($db);
    $existingPage = $pageService->getPage($params['slug']);

    if (!$existingPage) {
        Logger::warning('agent-api', 'Page not found for update', [
            'slug'      => $params['slug'],
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentError(404, 'not_found', "Page '{$params['slug']}' not found.");
        return;
    }

    $operations = [['path' => $existingPage['file_path'], 'action' => 'write']];

    try {
        $revisionId = $revisionManager->createRevision(
            $operations,
            "Agent API: Update page '{$params['slug']}'",
            0
        );

        $result = $pageService->updatePage($params['slug'], $body, 'api');

        // Capture after state (may have been renamed)
        $afterPath = $result['page']['file_path'] ?? $existingPage['file_path'];
        $revisionManager->captureAfterState($revisionId, [
            ['path' => $afterPath, 'action' => 'write'],
        ]);

        Logger::info('agent-api', 'Page updated', [
            'slug'      => $params['slug'],
            'new_slug'  => $result['page']['slug'] ?? $params['slug'],
            'fields'    => array_keys($body),
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);

        agentResponse(['data' => $result]);
    } catch (\RuntimeException $e) {
        $code = $e->getCode();
        $errorCode = match (true) {
            $code === 409         => 'conflict',
            $code === 404         => 'not_found',
            $code === 422         => 'validation_error',
            str_contains($e->getMessage(), 'traversal') => 'invalid_path',
            default               => 'validation_error',
        };
        $httpCode = match (true) {
            $code >= 400 && $code < 600 => $code,
            default                     => 422,
        };
        Logger::exception('agent-api', $e, [
            'operation' => 'page_update',
            'slug'      => $params['slug'],
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentError($httpCode, $errorCode, $e->getMessage());
    }
    return;
}

// ═══════════════════════════════════════════
//  DELETE /pages/:slug — Delete page
// ═══════════════════════════════════════════

if ($method === 'DELETE' && isset($params['slug'])) {
    try {
        $result = $pageService->deletePage($params['slug']);

        Logger::info('agent-api', 'Page deleted', [
            'slug'      => $params['slug'],
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);

        agentResponse(['data' => $result]);
    } catch (\RuntimeException $e) {
        $code = $e->getCode();
        $errorCode = match (true) {
            $code === 404 => 'not_found',
            $code === 422 => 'validation_error',
            default       => 'validation_error',
        };
        $httpCode = match (true) {
            $code >= 400 && $code < 600 => $code,
            default                     => 422,
        };
        Logger::exception('agent-api', $e, [
            'operation' => 'page_delete',
            'slug'      => $params['slug'],
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentError($httpCode, $errorCode, $e->getMessage());
    }
    return;
}
