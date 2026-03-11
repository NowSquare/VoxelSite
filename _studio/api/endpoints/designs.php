<?php

declare(strict_types=1);

/**
 * Design Library API Endpoints
 *
 * GET    /designs            — List all saved designs
 * GET    /designs/:id/preview — Browse a saved design (preview its files)
 * POST   /designs            — Save current site as a new design
 * POST   /designs/:id/load   — Switch to a saved design
 * PUT    /designs/:id        — Update design name/description
 * DELETE /designs/:id        — Delete a saved design
 * POST   /designs/new        — Save current + clear workspace
 *
 * The Design Library lets users save, compare, and switch between
 * completely different website looks. Each design is a directory-based
 * snapshot of preview pages, CSS, JS, data, and forms.
 */

use VoxelSite\DesignManager;
use VoxelSite\Logger;

$method = $_REQUEST['_route_method'];
$path   = $_REQUEST['_route_path'];
$params = $_REQUEST['_route_params'] ?? [];

$designManager = new DesignManager();

// ═══════════════════════════════════════════
//  GET /designs — List all saved designs
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/designs') {
    try {
        $designs = $designManager->list();

        // Include the active design ID so the frontend can highlight it
        $db = \VoxelSite\Database::getInstance();
        $settings = new \VoxelSite\Settings($db);
        $activeId = $settings->get('active_design_id');

        jsonResponse(['ok' => true, 'data' => [
            'designs'   => $designs,
            'active_id' => $activeId,
        ]]);
    } catch (\Throwable $e) {
        Logger::error('system', 'Failed to list designs', [
            'exception' => $e->getMessage(),
        ]);
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'list_failed',
            'message' => 'Could not load designs.',
        ]], 500);
    }
    return;
}

// ═══════════════════════════════════════════
//  GET /designs/:id/preview — Browse a saved design
// ═══════════════════════════════════════════

if ($method === 'GET' && isset($params['id']) && str_ends_with($path, '/preview')) {
    $id = preg_replace('/[^a-zA-Z0-9-]/', '', $params['id']);
    $designDir = dirname(__DIR__, 2) . '/data/designs/' . $id;
    $assetsDir = dirname(__DIR__, 3) . '/assets';

    if (!is_dir($designDir) || !file_exists($designDir . '/metadata.json')) {
        header('Content-Type: text/html; charset=utf-8');
        http_response_code(404);
        echo '<h1>Design not found</h1>';
        exit;
    }

    $requestedPath = $_GET['path'] ?? 'index.php';
    $requestedPath = str_replace(["\0", '\\'], ['', '/'], $requestedPath);
    $requestedPath = ltrim($requestedPath, '/');

    if (str_contains($requestedPath, '..') || str_contains($requestedPath, '//')) {
        http_response_code(400);
        echo '<h1>Invalid path</h1>';
        exit;
    }

    // Resolve where to find this file:
    // 1. assets/css/  → design's own css/
    // 2. assets/js/   → design's own js/
    // 3. assets/data/ → design's own data/
    // 4. assets/forms/ → design's own forms/
    // 5. assets/*     → live shared assets (images, fonts)
    // 6. Everything else → design's preview/

    $absolutePath = null;
    $securityBase = null;

    if (str_starts_with($requestedPath, 'assets/css/')) {
        $relativePath = substr($requestedPath, 11); // Strip 'assets/css/'
        $absolutePath = $designDir . '/css/' . $relativePath;
        $securityBase = $designDir;
    } elseif (str_starts_with($requestedPath, 'assets/js/')) {
        $relativePath = substr($requestedPath, 10); // Strip 'assets/js/'
        $absolutePath = $designDir . '/js/' . $relativePath;
        $securityBase = $designDir;
    } elseif (str_starts_with($requestedPath, 'assets/data/')) {
        $relativePath = substr($requestedPath, 12); // Strip 'assets/data/'
        $absolutePath = $designDir . '/data/' . $relativePath;
        $securityBase = $designDir;
    } elseif (str_starts_with($requestedPath, 'assets/forms/')) {
        $relativePath = substr($requestedPath, 13); // Strip 'assets/forms/'
        $absolutePath = $designDir . '/forms/' . $relativePath;
        $securityBase = $designDir;
    } elseif (str_starts_with($requestedPath, 'assets/')) {
        // Shared assets (images, fonts) — use live directory
        $relativePath = substr($requestedPath, 7); // Strip 'assets/'
        $absolutePath = $assetsDir . '/' . $relativePath;
        $securityBase = $assetsDir;
    } else {
        // Preview page (PHP/HTML)
        $absolutePath = $designDir . '/preview/' . $requestedPath;
        $securityBase = $designDir;
    }

    if (!file_exists($absolutePath)) {
        http_response_code(404);
        header('Content-Type: text/html; charset=utf-8');
        echo '<h1>File not found</h1><p>' . htmlspecialchars($requestedPath) . '</p>';
        exit;
    }

    // Security: realpath validation
    $realPath = realpath($absolutePath);
    $realBase = realpath($securityBase);
    if ($realPath === false || $realBase === false || !str_starts_with($realPath . '/', $realBase . '/')) {
        http_response_code(403);
        echo '<h1>Access denied</h1>';
        exit;
    }

    $extension = strtolower(pathinfo($realPath, PATHINFO_EXTENSION));
    $mimeTypes = [
        'html' => 'text/html; charset=utf-8', 'htm' => 'text/html; charset=utf-8',
        'php'  => 'text/html; charset=utf-8',
        'css'  => 'text/css; charset=utf-8',   'js'  => 'application/javascript; charset=utf-8',
        'json' => 'application/json; charset=utf-8', 'xml' => 'application/xml; charset=utf-8',
        'svg'  => 'image/svg+xml',             'txt' => 'text/plain; charset=utf-8',
        'png'  => 'image/png',                 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',                 'webp' => 'image/webp', 'avif' => 'image/avif',
        'ico'  => 'image/x-icon',
        'woff' => 'font/woff', 'woff2' => 'font/woff2', 'ttf' => 'font/ttf', 'otf' => 'font/otf',
        'pdf'  => 'application/pdf',
    ];
    $mime = $mimeTypes[$extension] ?? 'application/octet-stream';

    header('Content-Type: ' . $mime);
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('X-Content-Type-Options: nosniff');

    if ($extension === 'php') {
        // Render PHP with correct working directory so includes resolve
        $previewDir = $designDir . '/preview';
        $originalDir = getcwd();
        chdir($previewDir);

        if (function_exists('opcache_invalidate')) {
            opcache_invalidate($realPath, true);
        }

        ob_start();
        try {
            include $realPath;
        } catch (\Throwable $e) {
            ob_end_clean();
            chdir($originalDir);
            header('Content-Type: text/html; charset=utf-8');
            echo '<h1>Preview Error</h1><pre>' . htmlspecialchars($e->getMessage()) . '</pre>';
            exit;
        }
        $content = ob_get_clean();
        chdir($originalDir);

        // Rewrite asset URLs so CSS/JS point to the design's own saved files
        // Replace /assets/css/ and /assets/js/ href/src with design preview URLs
        $designPreviewBase = "/_studio/api/router.php?_path=%2Fdesigns%2F{$id}%2Fpreview&path=";
        $content = preg_replace_callback(
            '/(href|src)=["\']\/([^"\'?#]+\.(css|js))["\']/',
            function (array $m) use ($designPreviewBase) {
                $path = $m[2];
                if (str_starts_with($path, 'assets/css/') || str_starts_with($path, 'assets/js/')) {
                    return $m[1] . '="' . $designPreviewBase . urlencode($path) . '"';
                }
                return $m[0]; // Leave other assets (images, fonts CDNs) as-is
            },
            $content
        ) ?? $content;

        // Rewrite internal navigation links so they stay in design preview
        $content = preg_replace_callback(
            '/href=["\']\/([^"\'#]*)(#[^"\']*)?["\']/',
            function (array $m) use ($designPreviewBase) {
                $linkPath = $m[1];
                $hash = $m[2] ?? '';
                // Skip external-looking paths and assets
                if (str_starts_with($linkPath, '_studio/') || str_starts_with($linkPath, 'assets/')) {
                    return $m[0];
                }
                // Treat as a page link
                if (!$linkPath) $linkPath = 'index.php';
                if (str_ends_with($linkPath, '/')) $linkPath .= 'index.php';
                if (!pathinfo($linkPath, PATHINFO_EXTENSION)) $linkPath .= '.php';
                return 'href="' . $designPreviewBase . urlencode($linkPath) . $hash . '"';
            },
            $content
        ) ?? $content;

        // When loaded as an embedded preview (iframe), inject CSS to disable
        // reveal animations. The iframe sandbox blocks JS, so IntersectionObserver
        // never fires and sections stay invisible at opacity:0.
        if (isset($_GET['embed'])) {
            $revealOverride = '<style>'
                . '[data-reveal],[data-reveal-stagger],[data-reveal-stagger]>*,'
                . '.reveal,.reveal-child,.animate-on-scroll,.scroll-reveal{'
                . 'opacity:1!important;transform:none!important;'
                . 'visibility:visible!important;transition:none!important;'
                . '}'
                . '</style>';
            $content = str_replace('</head>', $revealOverride . '</head>', $content);
        }

        echo $content;
    } elseif (in_array($extension, ['html', 'htm', 'css', 'js', 'json', 'xml', 'svg', 'txt'], true)) {
        echo file_get_contents($realPath);
    } else {
        // Binary: stream
        header('Content-Length: ' . filesize($realPath));
        readfile($realPath);
    }

    exit;
}

// ═══════════════════════════════════════════
//  POST /designs/new — Save current + clear
// ═══════════════════════════════════════════
//  (Must be before /designs to avoid matching as POST /designs)

if ($method === 'POST' && $path === '/designs/new') {
    $body = getJsonBody();
    $skipAutoSave = !empty($body['skip_auto_save']);

    try {
        $result = $designManager->newDesign($skipAutoSave);

        if (!$result['ok']) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'new_design_failed',
                'message' => $result['error'] ?? 'Could not start new design.',
            ]], 500);
            return;
        }

        jsonResponse(['ok' => true, 'data' => [
            'message'    => 'Workspace cleared. Start building your new design.',
            'auto_saved' => $result['auto_saved'] ?? null,
        ]]);
    } catch (\Throwable $e) {
        Logger::error('system', 'Failed to start new design', [
            'exception' => $e->getMessage(),
        ]);
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'new_design_failed',
            'message' => 'Could not start new design: ' . $e->getMessage(),
        ]], 500);
    }
    return;
}

// ═══════════════════════════════════════════
//  POST /designs — Save current as new design
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/designs') {
    $body = getJsonBody();

    $name = trim($body['name'] ?? '');
    $description = trim($body['description'] ?? '');

    if ($name === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation_error',
            'message' => 'Design name is required.',
        ]], 422);
        return;
    }

    try {
        $result = $designManager->save($name, $description);

        if (!$result['ok']) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'save_failed',
                'message' => $result['error'],
            ]], 500);
            return;
        }

        Logger::info('system', 'Design saved', [
            'design_id'  => $result['design']['id'],
            'name'       => $name,
            'file_count' => $result['design']['file_count'],
        ]);

        jsonResponse(['ok' => true, 'data' => [
            'message' => 'Design saved.',
            'design'  => $result['design'],
        ]]);
    } catch (\Throwable $e) {
        Logger::error('system', 'Failed to save design', [
            'exception' => $e->getMessage(),
            'name'      => $name,
        ]);
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'save_failed',
            'message' => 'Could not save design: ' . $e->getMessage(),
        ]], 500);
    }
    return;
}

// ═══════════════════════════════════════════
//  POST /designs/:id/load — Switch to design
// ═══════════════════════════════════════════

if ($method === 'POST' && isset($params['id']) && str_ends_with($path, '/load')) {
    $id = $params['id'];
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    $skipAutoSave = !empty($body['skip_auto_save']);

    try {
        $result = $designManager->load($id, $skipAutoSave);

        if (!$result['ok']) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'load_failed',
                'message' => $result['error'],
            ]], $result['error'] === 'Design not found.' ? 404 : 500);
            return;
        }

        Logger::info('system', 'Design loaded', ['design_id' => $id]);

        jsonResponse(['ok' => true, 'data' => [
            'message'    => 'Design loaded. Preview updated.',
            'auto_saved' => $result['auto_saved'] ?? null,
        ]]);
    } catch (\Throwable $e) {
        Logger::error('system', 'Failed to load design', [
            'exception' => $e->getMessage(),
            'design_id' => $id,
        ]);
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'load_failed',
            'message' => 'Could not load design: ' . $e->getMessage(),
        ]], 500);
    }
    return;
}

// ═══════════════════════════════════════════
//  PUT /designs/:id — Update name/description
// ═══════════════════════════════════════════

if ($method === 'PUT' && isset($params['id'])) {
    $id = $params['id'];
    $body = getJsonBody();

    $name = trim($body['name'] ?? '');
    $description = trim($body['description'] ?? '');

    if ($name === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation_error',
            'message' => 'Design name is required.',
        ]], 422);
        return;
    }

    try {
        $result = $designManager->update($id, $name, $description);

        if (!$result['ok']) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'update_failed',
                'message' => $result['error'],
            ]], $result['error'] === 'Design not found.' ? 404 : 500);
            return;
        }

        jsonResponse(['ok' => true, 'data' => ['message' => 'Design updated.']]);
    } catch (\Throwable $e) {
        Logger::error('system', 'Failed to update design', [
            'exception' => $e->getMessage(),
            'design_id' => $id,
        ]);
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'update_failed',
            'message' => 'Could not update design.',
        ]], 500);
    }
    return;
}

// ═══════════════════════════════════════════
//  DELETE /designs/:id — Delete a design
// ═══════════════════════════════════════════

if ($method === 'DELETE' && isset($params['id'])) {
    $id = $params['id'];

    try {
        $result = $designManager->delete($id);

        if (!$result['ok']) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'delete_failed',
                'message' => $result['error'],
            ]], $result['error'] === 'Design not found.' ? 404 : 500);
            return;
        }

        Logger::info('system', 'Design deleted', ['design_id' => $id]);
        jsonResponse(['ok' => true, 'data' => ['message' => 'Design deleted.']]);
    } catch (\Throwable $e) {
        Logger::error('system', 'Failed to delete design', [
            'exception' => $e->getMessage(),
            'design_id' => $id,
        ]);
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'delete_failed',
            'message' => 'Could not delete design.',
        ]], 500);
    }
    return;
}

// ── Fallback ──
jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Designs endpoint not found.',
]], 404);
