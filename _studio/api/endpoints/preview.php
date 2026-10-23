<?php

declare(strict_types=1);

/**
 * Preview Endpoint
 *
 * GET /preview?path=index.php      — Render a PHP page from preview/
 * GET /preview?path=assets/...     — Serve an asset file
 * GET /preview/diff                — Show pending publish diff
 *
 * This is what fills the preview iframe. It renders PHP pages from
 * _studio/preview/ (executing includes so _partials/ are resolved)
 * and serves static assets from /assets/ (CSS, JS, images, fonts).
 *
 * Security:
 * - Every path is validated with realpath() against allowed directories
 * - No ../ traversal possible — the resolved path must start with
 *   the preview or assets directory prefix
 * - Binary files are served with correct MIME types
 * - Rendered HTML gets a hot-reload script injected before </body>
 */

$method = $_REQUEST['_route_method'];
$path   = $_REQUEST['_route_path'];

// This authenticated route intentionally never reads submitted fields or files.
if ($method === 'POST' && $path === '/preview/validate') {
    header('Cache-Control: no-store, private');
    header('Referrer-Policy: no-referrer');
    header('X-Robots-Tag: noindex, nofollow');
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > \VoxelSite\Agent\PreviewHttpController::MAX_BODY_BYTES) {
        http_response_code(413);
        header('Content-Type: application/json; charset=utf-8');
        echo '{"ok":false,"error":{"code":"size_limit","message":"Preview validation accepts at most 64 KiB. Nothing was submitted."}}';
        exit;
    }
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="en"><meta charset="utf-8"><title>Draft preview</title><main><h1>Nothing was submitted</h1><p>'
        .htmlspecialchars(\VoxelSite\Agent\PreviewService::validation()['message'],ENT_QUOTES,'UTF-8')
        .'</p><p>Use your browser’s Back button to return to the draft.</p></main></html>';
    exit;
}

// ═══════════════════════════════════════════
//  GET /preview — Serve a preview file
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/preview') {
    $requestedPath = $_GET['path'] ?? 'index.php';
    $previewRouteBase = \VoxelSite\InstallationUrl::studioPath().'/api/router.php?_path=%2Fpreview&path=';

    if (!\VoxelSite\DemoMode::isActive()) {
        try {
            $db=\VoxelSite\Database::getInstance();
            $service=new \VoxelSite\Agent\PreviewService($db,new \VoxelSite\Agent\ActorPolicy($db),new \VoxelSite\SiteWorkspace($db));
            header('Cache-Control: no-store, private');
            header('X-Content-Type-Options: nosniff');
            header('X-Robots-Tag: noindex, nofollow');
            header('Referrer-Policy: no-referrer');
            if (($_GET['view'] ?? '') === 'manifest') {
                header('Content-Type: application/json; charset=utf-8');
                echo \VoxelSite\Agent\CanonicalJson::encode($service->publicManifest());
            } else {
                if (!is_string($requestedPath)) throw new \RuntimeException('Invalid preview path.');
                $render=$service->studio($requestedPath,isset($_GET['embed']));
                http_response_code($render['status']);
                header('Content-Type: '.$render['mime']);
                echo $render['content'] !== '' ? $render['content'] : '<h1>Preview unavailable</h1><p>'
                    .htmlspecialchars($render['diagnostics'][0]['message'] ?? 'Inspect the draft PHP before previewing it.',ENT_QUOTES,'UTF-8').'</p>';
            }
        } catch (\Throwable) {
            http_response_code(409);
            header('Content-Type: application/json; charset=utf-8');
            echo '{"ok":false,"error":{"code":"workspace_unavailable","message":"This draft could not be previewed. Inspect its files and workspace status."}}';
        }
        exit;
    }

    // ── Sanitize: strip leading slashes, null bytes, and normalize ──
    $requestedPath = str_replace("\0", '', $requestedPath);
    $requestedPath = str_replace('\\', '/', $requestedPath);
    $requestedPath = ltrim($requestedPath, '/');

    // Block obvious traversal attempts early
    if (str_contains($requestedPath, '..') || str_contains($requestedPath, '//')) {
        header('Content-Type: application/json');
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => [
            'code'    => 'invalid_path',
            'message' => 'Invalid file path.',
        ]]);
        exit;
    }

    $studioDir = dirname(__DIR__, 2);
    $isDemoPreview = \VoxelSite\DemoMode::isActive();
    $workspace = null;
    try {
        if ($isDemoPreview) {
            $previewDir = $studioDir . '/demo/preview';
            $assetsDir = $studioDir . '/demo/assets';
            if (str_starts_with($requestedPath, 'assets/')) {
                $relative = substr($requestedPath, 7);
                $absolutePath = \VoxelSite\SiteWorkspace::resolveWithin($assetsDir, $relative);
                if (!is_file($absolutePath) && preg_match('~^(library|icons|images|fonts)/~', $relative)) {
                    $absolutePath = \VoxelSite\SiteWorkspace::resolveWithin(dirname($studioDir) . '/assets', $relative);
                }
            } else {
                $absolutePath = \VoxelSite\SiteWorkspace::resolveWithin($previewDir, $requestedPath);
            }
        } else {
            $workspace = new \VoxelSite\SiteWorkspace();
            $previewDir = $workspace->draftRoot();
            $assetsDir = $workspace->draftAssetsRoot();
            $absolutePath = $workspace->resolveDraft($requestedPath);
            if (str_ends_with(strtolower($requestedPath), '.php')) {
                $preflight = $workspace->preflight();
                if (!$preflight['ok']) throw new \RuntimeException('workspace_preflight_failed: ' . json_encode($preflight['issues']));
            }
        }
    } catch (\RuntimeException $error) {
        header('Content-Type: application/json');
        header('Cache-Control: no-store');
        http_response_code(409);
        echo json_encode(['ok' => false, 'error' => ['code' => 'workspace_unavailable', 'message' => $error->getMessage()]]);
        exit;
    }

    // ── Security: realpath() validation ──
    // We must verify the resolved path stays within allowed directories
    if (!file_exists($absolutePath)) {
        // For new sites with no preview yet, return a friendly placeholder
        if ($requestedPath === 'index.php') {
            header('Content-Type: text/html; charset=utf-8');
            echo \VoxelSite\PreviewRenderer::injectHotReload(\VoxelSite\PreviewRenderer::getEmptyPreviewHtml(),$previewRouteBase);
            exit;
        }

        header('Content-Type: application/json');
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "File not found: {$requestedPath}",
        ]]);
        exit;
    }

    $realPath = $absolutePath; // The canonical resolver already refused every symlink component.

    // ── Determine MIME type ──
    $extension = strtolower(pathinfo($realPath, PATHINFO_EXTENSION));
    $mimeType = \VoxelSite\PreviewRenderer::getMimeType($extension);

    // ── Serve the file ──
    header('Content-Type: ' . $mimeType);
    header('Cache-Control: no-cache, no-store, must-revalidate'); // Preview = always fresh
    header('X-Content-Type-Options: nosniff');
    header('X-Robots-Tag: noindex, nofollow');
    header('Referrer-Policy: no-referrer');

    if ($extension === 'php') {
        // PHP files: render via ob_start/include so partials are resolved
        $originalDir = getcwd();

        // The production draft already contains real private assets. Demo
        // preview is a shipped sample and may retain its separate legacy link.
        // No persistent asset link is created by a read request.

        // Bust opcache for this file AND all partials so undo/redo
        // changes are reflected immediately without stale bytecode.
        if (function_exists('opcache_invalidate')) {
            opcache_invalidate($realPath, true);
            $partialsDir = $previewDir . '/_partials';
            if (is_dir($partialsDir)) {
                foreach (glob($partialsDir . '/*.php') as $partial) {
                    opcache_invalidate($partial, true);
                }
            }
        }

        // ── VE-002: Instrumented include for source provenance ──
        // Create instrumented copies in an isolated temp directory so
        // the real source files are never mutated.
        $tempDir = \VoxelSite\PreviewRenderer::createInstrumentedPreviewCopy($previewDir, $requestedPath);
        $instrumentationAvailable = ($tempDir !== null);

        if ($instrumentationAvailable) {
            $tempEntryFile = $tempDir . '/' . $requestedPath;
            $runDir = $tempDir;
        } else {
            // Fail-safe: render from real source but do NOT trust
            // the output for visual editing — no markers will exist.
            $tempEntryFile = $realPath;
            $runDir = $previewDir;
        }

        chdir($runDir);
        ob_start();
        try {
            include $tempEntryFile;
        } catch (\Throwable $e) {
            ob_end_clean();
            chdir($originalDir);
            \VoxelSite\PreviewRenderer::cleanupTempPreviewDir($tempDir);
            header('Content-Type: text/html; charset=utf-8');
            echo '<h1>Preview Error</h1><pre>' . htmlspecialchars($e->getMessage()) . '</pre>';
            exit;
        }
        $content = ob_get_clean();
        chdir($originalDir);
        \VoxelSite\PreviewRenderer::cleanupTempPreviewDir($tempDir);

        // ── VE-002: Annotate rendered HTML with source addresses ──
        // If instrumentation was available, run the full provenance pipeline.
        // If not, mark everything unsafe so the visual editor cannot mutate.
        if ($instrumentationAvailable) {
            $content = \VoxelSite\PreviewRenderer::annotateSourceAddresses($content, $requestedPath);
        } else {
            $content = \VoxelSite\PreviewRenderer::annotateFailSafe($content, $requestedPath);
        }

        // Bust CSS cache — the root .htaccess sets 1-year expiry for CSS.
        // Without this, the browser serves stale tailwind.css / style.css
        // after the AI regenerates them, causing an unstyled flash.
        $content = \VoxelSite\PreviewRenderer::bustAssetCache($content, $assetsDir);

        $content = \VoxelSite\PreviewAssetRouter::rewrite($content, $requestedPath, 'html', $previewRouteBase);

        // ── Prevent Flash of Unstyled Content (demo mode) ──
        // In demo mode, CSS is routed through the PHP API (slower than
        // static file serving). The browser may render the HTML before
        // the stylesheet response arrives. Hide <body> until CSS loads.
        // Skip for ?embed=1 thumbnails — they use sandboxed iframes
        // without allow-scripts, so the reveal <script> would never run
        // and the body would stay invisible forever.
        if ($isDemoPreview && !isset($_GET['embed'])) {
            $foucStyle = '<style id="vs-fouc-guard">body{opacity:0!important}</style>';
            $foucReveal = '<script>document.getElementById("vs-fouc-guard")?.remove()</script>';
            $content = str_replace('</head>', $foucStyle . '</head>', $content);
            // Place the reveal right before </body> — at this point all
            // render-blocking stylesheets have been parsed.
            $content = str_replace('</body>', $foucReveal . '</body>', $content);
        }

        // Inject hot-reload into rendered HTML
        $content = \VoxelSite\PreviewRenderer::injectHotReload($content, $previewRouteBase);

        // Inject visual editor bridge
        $content = \VoxelSite\PreviewRenderer::injectVisualEditorBridge($content);

        // Inject Actions Bar for preview (if active actions exist)
        $content = \VoxelSite\PreviewRenderer::injectActionsBar($content);

        // When loaded as an embedded preview (iframe thumbnail), inject CSS
        // to disable reveal animations. The iframe sandbox blocks JS, so
        // IntersectionObserver never fires and sections stay invisible at
        // opacity:0. Mirrors designs.php:218-227.
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
    } elseif (\VoxelSite\PreviewRenderer::isTextType($extension)) {
        $content = file_get_contents($realPath);
        echo \VoxelSite\PreviewAssetRouter::rewrite($content, $requestedPath, $extension, $previewRouteBase);
    } else {
        // Binary files: stream directly
        header('Content-Length: ' . filesize($realPath));
        readfile($realPath);
    }

    exit;
}

// ═══════════════════════════════════════════
//  GET /preview/diff — Pending changes diff
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/preview/diff') {
    // In demo mode, there are no "pending publish changes"
    if (\VoxelSite\DemoMode::isActive()) {
        jsonResponse(['ok' => true, 'data' => [
            'changes'     => [],
            'counts'      => ['added' => 0, 'modified' => 0, 'deleted' => 0],
            'has_changes' => false,
            'message'     => 'No pending publish changes.',
        ]]);
        return;
    }

    try {
        $db=\VoxelSite\Database::getInstance();$workspace=new \VoxelSite\SiteWorkspace($db);
        $policy=new \VoxelSite\Agent\ActorPolicy($db);
        $actor=\VoxelSite\Agent\BusinessStudioAdapter::actor();
        $root=dirname($workspace->draftRoot()).'/data/agent/releases';
        $publish=new \VoxelSite\Agent\PublishPlanService($db,$policy,$workspace,
            new \VoxelSite\Agent\ReleaseStore($db,$policy,$root),new \VoxelSite\Agent\OperationStore($db,$policy,$workspace->mutationLockPath()));
        $input=[];
        foreach(['offset','limit'] as $key)if(isset($_GET[$key])){
            if(!is_string($_GET[$key]) || !preg_match('/^(0|[1-9][0-9]{0,3})$/D',$_GET[$key]))
                throw new \VoxelSite\Agent\OperationException('invalid_schema','Use bounded integer pagination values.');
            $input[$key]=(int)$_GET[$key];
        }
        if(isset($_GET['version']))$input['version']=$_GET['version'];
        $service=new \VoxelSite\Agent\PublicationDiffService($db,$policy,$workspace,$publish);
        jsonResponse(['ok'=>true,'data'=>$service->read($actor,(object)$input)]);
    } catch(\VoxelSite\Agent\OperationException $error) {
        jsonResponse(['ok'=>false,'error'=>['code'=>$error->errorCode,'message'=>$error->getMessage(),'details'=>$error->details]],
            $error->errorCode==='permission_denied'?403:($error->errorCode==='invalid_schema'?422:409));
    }
    return;
}

// ── Fallback ──
header('Content-Type: application/json');
http_response_code(404);
echo json_encode(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Preview endpoint not found.',
]]);
exit;

// ═══════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════

/**
 * Map file extension to MIME type.
 *
 * Covers all file types the AI can generate or that users
 * might upload as assets.
 */
