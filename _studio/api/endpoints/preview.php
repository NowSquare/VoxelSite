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

// ═══════════════════════════════════════════
//  GET /preview — Serve a preview file
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/preview') {
    $requestedPath = $_GET['path'] ?? 'index.php';

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

    // ── Resolve the absolute path ──
    $studioDir  = dirname(__DIR__, 2);           // _studio/
    $previewDir = $studioDir . '/preview';        // _studio/preview/
    $assetsDir  = dirname($studioDir) . '/assets'; // /assets/

    // Determine which directory to look in
    if (str_starts_with($requestedPath, 'assets/')) {
        // Asset files: CSS, JS, images, fonts
        // Strip the 'assets/' prefix since the assets dir IS /assets/
        $relativePath = substr($requestedPath, 7); // Remove 'assets/'
        $absolutePath = $assetsDir . '/' . $relativePath;
        $securityBase = $assetsDir;
    } else {
        // HTML and other preview files
        $absolutePath = $previewDir . '/' . $requestedPath;
        $securityBase = $previewDir;
    }

    // ── Security: realpath() validation ──
    // We must verify the resolved path stays within allowed directories
    if (!file_exists($absolutePath)) {
        // For new sites with no preview yet, return a friendly placeholder
        if ($requestedPath === 'index.php') {
            header('Content-Type: text/html; charset=utf-8');
            echo injectHotReload(getEmptyPreviewHtml());
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

    $realPath = realpath($absolutePath);
    $realBase = realpath($securityBase);

    // Check containment: try logical path first (handles symlinks),
    // then fall back to realpath-based check
    $normAbsolute = rtrim(str_replace('//', '/', $absolutePath), '/');
    $normBase = rtrim(str_replace('//', '/', $securityBase), '/');
    $logicalOk = str_starts_with($normAbsolute . '/', $normBase . '/');
    $realpathOk = ($realPath !== false && $realBase !== false && str_starts_with($realPath . '/', $realBase . '/'));

    if (!$logicalOk && !$realpathOk) {
        header('Content-Type: application/json');
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => [
            'code'    => 'access_denied',
            'message' => 'Access denied: path outside allowed directory.',
        ]]);
        exit;
    }

    // Use realPath if available (for opcache_invalidate, readfile, etc.)
    if ($realPath !== false) {
        // Keep using $realPath for file operations below
    } else {
        $realPath = $absolutePath;
    }

    // ── Determine MIME type ──
    $extension = strtolower(pathinfo($realPath, PATHINFO_EXTENSION));
    $mimeType = getMimeType($extension);

    // ── Serve the file ──
    header('Content-Type: ' . $mimeType);
    header('Cache-Control: no-cache, no-store, must-revalidate'); // Preview = always fresh
    header('X-Content-Type-Options: nosniff');

    if ($extension === 'php') {
        // PHP files: render via ob_start/include so partials are resolved
        // Change to preview directory so relative includes work
        $originalDir = getcwd();
        chdir($previewDir);

        // Bust opcache for this file AND all partials so undo/redo
        // changes are reflected immediately without stale bytecode.
        if (function_exists('opcache_invalidate')) {
            opcache_invalidate($realPath, true);
            // Also invalidate common partials that may be included
            $partialsDir = $previewDir . '/_partials';
            if (is_dir($partialsDir)) {
                foreach (glob($partialsDir . '/*.php') as $partial) {
                    opcache_invalidate($partial, true);
                }
            }
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

        // Bust CSS cache — the root .htaccess sets 1-year expiry for CSS.
        // Without this, the browser serves stale tailwind.css / style.css
        // after the AI regenerates them, causing an unstyled flash.
        $content = bustAssetCache($content, $assetsDir);

        // Inject hot-reload into rendered HTML
        $content = injectHotReload($content);

        // Inject visual editor bridge
        $content = injectVisualEditorBridge($content);

        echo $content;
    } elseif (isTextType($extension)) {
        $content = file_get_contents($realPath);
        echo $content;
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
    $studioDir = dirname(__DIR__, 2);
    $previewDir = $studioDir . '/preview';
    $docRoot = dirname($studioDir);
    $manifestPath = $studioDir . '/data/published-manifest.json';

    $previewFiles = collectManagedPreviewFiles($previewDir);
    $manifest = loadJsonSafe($manifestPath, ['files' => []]);
    $publishedFiles = is_array($manifest['files'] ?? null) ? $manifest['files'] : [];

    $candidates = array_values(array_unique(array_merge($previewFiles, $publishedFiles)));
    sort($candidates);

    $changes = [];

    foreach ($candidates as $relativePath) {
        $previewPath = $previewDir . '/' . $relativePath;
        $productionPath = $docRoot . '/' . $relativePath;

        $inPreview = file_exists($previewPath);
        $inProduction = file_exists($productionPath);

        if ($inPreview && !$inProduction) {
            $changes[] = [
                'path' => $relativePath,
                'type' => 'added',
                'preview_size' => filesize($previewPath) ?: 0,
                'production_size' => 0,
            ];
            continue;
        }

        if (!$inPreview && $inProduction) {
            $changes[] = [
                'path' => $relativePath,
                'type' => 'deleted',
                'preview_size' => 0,
                'production_size' => filesize($productionPath) ?: 0,
            ];
            continue;
        }

        if ($inPreview && $inProduction) {
            $previewHash = @hash_file('sha256', $previewPath);
            $productionHash = @hash_file('sha256', $productionPath);
            if ($previewHash !== $productionHash) {
                $changes[] = [
                    'path' => $relativePath,
                    'type' => 'modified',
                    'preview_size' => filesize($previewPath) ?: 0,
                    'production_size' => filesize($productionPath) ?: 0,
                ];
            }
        }
    }

    $added = count(array_filter($changes, fn($c) => $c['type'] === 'added'));
    $modified = count(array_filter($changes, fn($c) => $c['type'] === 'modified'));
    $deleted = count(array_filter($changes, fn($c) => $c['type'] === 'deleted'));

    $message = empty($changes)
        ? 'No pending publish changes.'
        : "{$added} added, {$modified} modified, {$deleted} deleted.";

    header('Content-Type: application/json');
    echo json_encode(['ok' => true, 'data' => [
        'changes' => $changes,
        'counts' => [
            'added' => $added,
            'modified' => $modified,
            'deleted' => $deleted,
        ],
        'has_changes' => !empty($changes),
        'message' => $message,
    ]]);
    exit;
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
function getMimeType(string $extension): string
{
    return match ($extension) {
        // Text
        'html', 'htm' => 'text/html; charset=utf-8',
        'php'         => 'text/html; charset=utf-8',  // PHP renders to HTML
        'css'         => 'text/css; charset=utf-8',
        'js'          => 'application/javascript; charset=utf-8',
        'json'        => 'application/json; charset=utf-8',
        'xml'         => 'application/xml; charset=utf-8',
        'svg'         => 'image/svg+xml',
        'txt'         => 'text/plain; charset=utf-8',
        'md'          => 'text/markdown; charset=utf-8',

        // Images
        'png'         => 'image/png',
        'jpg', 'jpeg' => 'image/jpeg',
        'gif'         => 'image/gif',
        'webp'        => 'image/webp',
        'avif'        => 'image/avif',
        'ico'         => 'image/x-icon',

        // Fonts
        'woff'        => 'font/woff',
        'woff2'       => 'font/woff2',
        'ttf'         => 'font/ttf',
        'otf'         => 'font/otf',
        'eot'         => 'application/vnd.ms-fontobject',

        // Documents
        'pdf'         => 'application/pdf',

        // Fallback
        default       => 'application/octet-stream',
    };
}

/**
 * Check if a file extension represents a text-based type.
 * Text files are read into memory; binary files are streamed.
 */
function isTextType(string $extension): bool
{
    return in_array($extension, [
        'html', 'htm', 'css', 'js', 'json', 'xml', 'svg', 'txt', 'md',
    ], true);
}

/**
 * @return array<int, string>
 */
function collectManagedPreviewFiles(string $previewDir): array
{
    if (!is_dir($previewDir)) {
        return [];
    }

    $files = [];
    $basePath = rtrim(str_replace('//', '/', $previewDir), '/');

    $iterator = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator(
            $previewDir,
            \RecursiveDirectoryIterator::SKIP_DOTS
        )
    );

    foreach ($iterator as $file) {
        if ($file->isFile()) {
            $name = $file->getFilename();
            // Skip dotfiles (.gitkeep, .gitignore, .DS_Store, etc.)
            if (str_starts_with($name, '.')) {
                continue;
            }
            // Use pathname (logical) instead of realPath to handle symlinks
            $filePath = str_replace('\\', '/', $file->getPathname());
            $normBase = $basePath . '/';
            if (str_starts_with($filePath, $normBase)) {
                $relativePath = substr($filePath, strlen($normBase));
                $files[] = $relativePath;
            }
        }
    }

    $files = array_values(array_unique($files));
    sort($files);

    return $files;
}

/**
 * @param array<string, mixed> $fallback
 * @return array<string, mixed>
 */
function loadJsonSafe(string $path, array $fallback): array
{
    if (!file_exists($path)) {
        return $fallback;
    }

    $raw = file_get_contents($path);
    if ($raw === false || trim($raw) === '') {
        return $fallback;
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $fallback;
}

/**
 * Inject the hot-reload script into HTML content.
 *
 * The script listens for postMessage from the parent window (app.js).
 * When a 'voxelsite:reload' message is received, it reloads the page.
 * When 'voxelsite:reload-css' is received, it busts CSS cache without
 * a full reload for smoother design iteration.
 *
 * This is injected just before </body> to not block page rendering.
 */
function injectHotReload(string $html): string
{
    $script = <<<'HOTRELOAD'
<!-- VoxelSite Hot-Reload -->
<script>
(function() {
  // Build a preview URL that works on EVERY server (Apache + Nginx).
  // Uses the explicit router.php?_path= format — no mod_rewrite needed.
  var PREVIEW_BASE = '/_studio/api/router.php?_path=%2Fpreview&path=';

  function toPreviewUrl(rawHref) {
    if (!rawHref) return null;

    var href = rawHref.trim();
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return null;
    }

    var targetUrl;
    try {
      targetUrl = new URL(href, window.location.href);
    } catch (_) {
      return null;
    }

    if (targetUrl.origin !== window.location.origin) return null;

    var path = targetUrl.pathname || '/';

    // Already a preview URL (either rewrite or router.php format)
    if (path.indexOf('/_studio/api/') === 0) {
      return null; // Let it through as-is
    }

    // Keep Studio links untouched
    if (path.startsWith('/_studio/')) {
      return null;
    }

    var relPath = path.replace(/^\/+/, '');
    if (!relPath) relPath = 'index.php';
    if (relPath.endsWith('/')) relPath += 'index.php';
    if (!/\.[a-z0-9]+$/i.test(relPath)) relPath += '.php';

    return PREVIEW_BASE + encodeURIComponent(relPath) + (targetUrl.hash ? targetUrl.hash : '');
  }

  // Extract the current preview page path and notify parent
  function notifyParentOfPath() {
    try {
      var params = new URLSearchParams(window.location.search);
      var path = params.get('path') || 'index.php';
      window.parent.postMessage('voxelsite:path:' + path, '*');
    } catch (_) {}
  }

  // Notify parent of current path on load
  notifyParentOfPath();

  // Keep internal navigation inside preview sandbox so clicking
  // site nav links does not jump to live root files.
  document.addEventListener('click', function(e) {
    var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!link) return;
    if (link.hasAttribute('download')) return;
    if (link.target && link.target.toLowerCase() === '_blank') return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var previewUrl = toPreviewUrl(link.getAttribute('href'));
    if (!previewUrl) return;

    e.preventDefault();
    window.location.href = previewUrl;
  });

  window.addEventListener('message', function(e) {
    if (e.data === 'voxelsite:reload') {
      window.location.reload();
    } else if (e.data === 'voxelsite:reload-css') {
      // Bust CSS cache without full reload
      document.querySelectorAll('link[rel="stylesheet"]').forEach(function(link) {
        var href = link.getAttribute('href');
        if (href) {
          link.setAttribute('href', href.split('?')[0] + '?t=' + Date.now());
        }
      });
    }
  });
})();
</script>
HOTRELOAD;

    // Inject before </body> if it exists, otherwise append
    if (stripos($html, '</body>') !== false) {
        $html = str_ireplace('</body>', $script . "\n</body>", $html);
    } else {
        $html .= "\n" . $script;
    }

    return $html;
}

/**
 * Inject the visual editor bridge script into HTML content.
 *
 * The bridge handles element detection, hover highlighting, inline
 * text editing, and communicates with the parent Studio window.
 * Loads after the page's own scripts to avoid conflicts.
 */
function injectVisualEditorBridge(string $html): string
{
    $bridgePath = dirname(__DIR__, 2) . '/ui/visual-editor-bridge.js';
    if (!file_exists($bridgePath)) {
        return $html;
    }

    $bridgeContent = file_get_contents($bridgePath);
    if ($bridgeContent === false || trim($bridgeContent) === '') {
        return $html;
    }

    $script = "\n<!-- VoxelSite Visual Editor Bridge -->\n<script>\n" . $bridgeContent . "\n</script>\n";

    if (stripos($html, '</body>') !== false) {
        $html = str_ireplace('</body>', $script . "</body>", $html);
    } else {
        $html .= $script;
    }

    return $html;
}

/**
 * Append file-modification timestamps to local CSS and JS asset hrefs.
 *
 * The root .htaccess sets `ExpiresByType text/css "access plus 1 year"`
 * (and the same for JS) for production performance, but this means the
 * browser caches assets aggressively. During preview, the Tailwind
 * compiler and AI both rewrite CSS/JS files — without cache-busting
 * the browser shows stale styles on the first load after regeneration.
 *
 * This rewrites:
 *   <link rel="stylesheet" href="/assets/css/tailwind.css">
 *   <script src="/assets/js/index.js"></script>
 * to:
 *   <link rel="stylesheet" href="/assets/css/tailwind.css?v=1708099200">
 *   <script src="/assets/js/index.js?v=1708099200"></script>
 *
 * The `v` parameter is the file's modification timestamp, so it only
 * changes when the file actually changes. External URLs (Google Fonts,
 * CDNs) are left untouched.
 */
function bustAssetCache(string $html, string $assetsDir): string
{
    $docRoot = dirname($assetsDir); // one level up from /assets/

    // Helper: append ?v={mtime} to a local asset path
    $bust = function (string $href) use ($docRoot): string {
        $filePath = $docRoot . $href;
        if (file_exists($filePath)) {
            return $href . '?v=' . filemtime($filePath);
        }
        return $href;
    };

    // Bust CSS: <link ... href="/path/to/file.css">
    $html = preg_replace_callback(
        '/<link\b([^>]*?)href=["\'](\/[^"\'?#]+\.css)(["\'])/',
        function (array $m) use ($bust) {
            return '<link ' . $m[1] . 'href=' . $m[3] . $bust($m[2]) . $m[3];
        },
        $html
    ) ?? $html;

    // Bust JS: <script ... src="/path/to/file.js">
    $html = preg_replace_callback(
        '/<script\b([^>]*?)src=["\'](\/[^"\'?#]+\.js)(["\'])/',
        function (array $m) use ($bust) {
            return '<script ' . $m[1] . 'src=' . $m[3] . $bust($m[2]) . $m[3];
        },
        $html
    ) ?? $html;

    return $html;
}

/**
 * Generate a friendly empty preview page.
 *
 * Shown when no preview files exist yet (before the first AI interaction).
 * Uses the Forge color palette so it feels native.
 */
function getEmptyPreviewHtml(): string
{
    return <<<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Website</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #FAFAFA;
            color: #09090B;
        }
        .empty-state {
            text-align: center;
            padding: 2rem;
            max-width: 400px;
        }
        .voxelsite-mark {
            width: 52px;
            height: 52px;
            color: #EA580C;
            margin: 0 auto 0.875rem;
            opacity: 1;
        }
        .voxelsite-mark svg {
            width: 100%;
            height: 100%;
            display: block;
        }
        h1 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #09090B;
        }
        p {
            font-size: 0.875rem;
            color: #52525B;
            line-height: 1.5;
        }

        [data-theme="dark"] body {
            background: #09090B;
            color: #FAFAFA;
        }
        [data-theme="dark"] h1 {
            color: #FAFAFA;
        }
        [data-theme="dark"] p {
            color: #A1A1AA;
        }
        [data-theme="dark"] .voxelsite-mark {
            color: #EA580C;
        }
    </style>
</head>
<body>
    <div class="empty-state">
        <div class="voxelsite-mark" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path class="voxel-top" style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
                <path class="voxel-left" style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
                <path class="voxel-right" style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
            </svg>
        </div>
        <h1>Your website will appear here</h1>
        <p>Describe what you want to build in the chat panel, and watch your website take shape in real time.</p>
    </div>
    <script>
        const syncTheme = () => {
            try {
                if (window.parent && window.parent.document.documentElement.getAttribute('data-theme') === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.removeAttribute('data-theme');
                }
            } catch(e) {}
        };
        syncTheme();
        try {
            if (window.parent) {
                new MutationObserver(syncTheme).observe(
                    window.parent.document.documentElement, 
                    { attributes: true, attributeFilter: ['data-theme'] }
                );
            }
        } catch(e) {}
    </script>
</body>
</html>
HTML;
}
