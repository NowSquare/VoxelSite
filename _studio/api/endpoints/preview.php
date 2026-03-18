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

    // ── Demo mode: swap to demo directories ──
    // When .demo is active, serve from _studio/demo/preview/ and
    // _studio/demo/assets/ (CSS, JS), falling back to the live /assets/
    // for shared resources (images, fonts, library).
    $isDemoPreview = \VoxelSite\DemoMode::isActive();
    if ($isDemoPreview) {
        $previewDir = $studioDir . '/demo/preview';
        $demoAssetsDir = $studioDir . '/demo/assets';
    }

    // Determine which directory to look in
    if (str_starts_with($requestedPath, 'assets/')) {
        // Asset files: CSS, JS, images, fonts
        // Strip the 'assets/' prefix since the assets dir IS /assets/
        $relativePath = substr($requestedPath, 7); // Remove 'assets/'

        if ($isDemoPreview) {
            // Two-tier lookup: demo assets first, then live shared assets.
            // Demo has its own css/ and js/ copies. Shared resources
            // (images, fonts, library) live only at the project-level /assets/.
            $demoCandidate = $demoAssetsDir . '/' . $relativePath;
            if (file_exists($demoCandidate)) {
                $absolutePath = $demoCandidate;
                $securityBase = $demoAssetsDir;
            } else {
                $absolutePath = $assetsDir . '/' . $relativePath;
                $securityBase = $assetsDir;
            }
        } else {
            $absolutePath = $assetsDir . '/' . $relativePath;
            $securityBase = $assetsDir;
        }
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
        $originalDir = getcwd();

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
        $tempDir = createInstrumentedPreviewCopy($previewDir, $requestedPath);
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
            cleanupTempPreviewDir($tempDir);
            header('Content-Type: text/html; charset=utf-8');
            echo '<h1>Preview Error</h1><pre>' . htmlspecialchars($e->getMessage()) . '</pre>';
            exit;
        }
        $content = ob_get_clean();
        chdir($originalDir);
        cleanupTempPreviewDir($tempDir);

        // ── VE-002: Annotate rendered HTML with source addresses ──
        // If instrumentation was available, run the full provenance pipeline.
        // If not, mark everything unsafe so the visual editor cannot mutate.
        if ($instrumentationAvailable) {
            $content = annotateSourceAddresses($content, $requestedPath);
        } else {
            $content = annotateFailSafe($content, $requestedPath);
        }

        // Bust CSS cache — the root .htaccess sets 1-year expiry for CSS.
        // Without this, the browser serves stale tailwind.css / style.css
        // after the AI regenerates them, causing an unstyled flash.
        $content = bustAssetCache($content, $assetsDir);

        // ── Demo mode: rewrite CSS/JS asset URLs to go through preview API ──
        // Without this, <link href="/assets/css/style.css"> loads directly from
        // the live webroot, bypassing demo asset isolation. We rewrite these to
        // /_studio/api/router.php?_path=/preview&path=assets/css/style.css
        // which hits the two-tier demo asset resolution in this file.
        // This mirrors the exact approach designs.php uses for saved designs.
        if ($isDemoPreview) {
            $previewBase = '/_studio/api/router.php?_path=%2Fpreview&path=';
            $content = preg_replace_callback(
                '/(href|src)=["\']\/([^"\'?#]+\.(css|js))(?:\?[^"\']*)?["\']/',
                function (array $m) use ($previewBase) {
                    $path = $m[2];
                    if (str_starts_with($path, 'assets/css/') || str_starts_with($path, 'assets/js/')) {
                        return $m[1] . '="' . $previewBase . urlencode($path) . '"';
                    }
                    return $m[0]; // Leave other assets (images, fonts, CDNs) as-is
                },
                $content
            ) ?? $content;
        }

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
        $content = injectHotReload($content);

        // Inject visual editor bridge
        $content = injectVisualEditorBridge($content);

        // Inject Actions Bar for preview (if active actions exist)
        $content = injectActionsBar($content);

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

    $studioDir = dirname(__DIR__, 2);
    $previewDir = $studioDir . '/preview';
    $docRoot = dirname($studioDir);
    $assetsDir = $docRoot . '/assets';
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

    // ── Asset file diff (CSS/JS/JSON) ──
    // Assets are shared — no preview/production separation. Compare
    // current file hashes against hashes stored at the last publish.
    $publishedAssetHashes = is_array($manifest['asset_hashes'] ?? null)
        ? $manifest['asset_hashes']
        : [];

    if (!empty($publishedAssetHashes)) {
        $currentAssetHashes = collectCurrentAssetHashes($assetsDir);

        // Files modified or added since last publish
        foreach ($currentAssetHashes as $assetPath => $currentHash) {
            if (isset($publishedAssetHashes[$assetPath])) {
                if ($currentHash !== $publishedAssetHashes[$assetPath]) {
                    $fullPath = $docRoot . '/' . $assetPath;
                    $changes[] = [
                        'path' => $assetPath,
                        'type' => 'modified',
                        'preview_size' => file_exists($fullPath) ? (filesize($fullPath) ?: 0) : 0,
                        'production_size' => file_exists($fullPath) ? (filesize($fullPath) ?: 0) : 0,
                    ];
                }
            } else {
                // New asset file not present at last publish
                $fullPath = $docRoot . '/' . $assetPath;
                $changes[] = [
                    'path' => $assetPath,
                    'type' => 'added',
                    'preview_size' => file_exists($fullPath) ? (filesize($fullPath) ?: 0) : 0,
                    'production_size' => 0,
                ];
            }
        }

        // Files that existed at publish but have been deleted
        foreach ($publishedAssetHashes as $assetPath => $publishedHash) {
            if (!isset($currentAssetHashes[$assetPath])) {
                $changes[] = [
                    'path' => $assetPath,
                    'type' => 'deleted',
                    'preview_size' => 0,
                    'production_size' => 0,
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
 * Collect SHA-256 hashes of current editable asset files (CSS, JS, JSON).
 *
 * Used by the diff endpoint to compare against hashes stored at publish time.
 *
 * @return array<string, string>  Relative path => SHA-256 hash
 */
function collectCurrentAssetHashes(string $assetsDir): array
{
    $hashes = [];
    $subdirs = ['css', 'js', 'data'];

    foreach ($subdirs as $subdir) {
        $dir = $assetsDir . '/' . $subdir;
        if (!is_dir($dir)) {
            continue;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($iterator as $file) {
            if (!$file->isFile()) {
                continue;
            }

            $name = $file->getFilename();
            if (str_starts_with($name, '.')) {
                continue;
            }

            $ext = strtolower($file->getExtension());
            if (!in_array($ext, ['css', 'js', 'json'], true)) {
                continue;
            }

            $relativePath = 'assets/' . $subdir . '/' . ltrim(
                str_replace('\\', '/', substr($file->getPathname(), strlen($dir))),
                '/'
            );

            $hash = @hash_file('sha256', $file->getPathname());
            if ($hash !== false) {
                $hashes[$relativePath] = $hash;
            }
        }
    }

    ksort($hashes);
    return $hashes;
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
      // Bust CSS cache without full reload — skip external links (Google Fonts, CDNs)
      document.querySelectorAll('link[rel="stylesheet"]').forEach(function(link) {
        var href = link.getAttribute('href');
        if (href && href.charAt(0) !== 'h' && href.substr(0,2) !== '//') {
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

/**
 * Inject the Actions Bar (CSS + JS) into the preview HTML.
 *
 * Only injects when active actions exist. The JS detects preview mode
 * and fetches the manifest from the Studio API instead of /actions/manifest.json.
 */
function injectActionsBar(string $html): string
{
    $hasActive = false;

    if (\VoxelSite\DemoMode::isActive()) {
        // Demo mode has active actions defined in demo-handler.php
        $hasActive = true;
    } else {
        // Quick check: do active actions exist?
        $actionsDir = dirname(__DIR__, 2) . '/data/actions';
        if (!is_dir($actionsDir)) {
            return $html;
        }

        foreach (glob($actionsDir . '/*.json') as $file) {
            $content = file_get_contents($file);
            if ($content !== false) {
                $def = json_decode($content, true);
                if (is_array($def) && ($def['active'] ?? false)) {
                    $hasActive = true;
                    break;
                }
            }
        }
    }

    if (!$hasActive) {
        return $html;
    }

    // Read shipped CSS and JS
    $staticDir = dirname(__DIR__, 2) . '/static';
    $css = @file_get_contents($staticDir . '/actions-bar.css');
    $js = @file_get_contents($staticDir . '/actions-bar.js');

    if (empty($css) || empty($js)) {
        return $html;
    }

    $injection = "\n<!-- VoxelSite Actions Bar (Preview) -->\n"
        . "<style>\n{$css}\n</style>\n"
        . "<script>\n{$js}\n</script>\n";

    if (stripos($html, '</body>') !== false) {
        $html = str_ireplace('</body>', $injection . '</body>', $html);
    } else {
        $html .= $injection;
    }

    return $html;
}

// ═══════════════════════════════════════════
//  VE-002: Source Address Annotation
// ═══════════════════════════════════════════

/**
 * Create an isolated temp-directory copy of the preview with
 * instrumented PHP includes. The real source files are never mutated.
 *
 * Returns the temp directory path, or null on failure.
 */
function createInstrumentedPreviewCopy(string $previewDir, string $requestedPath): ?string
{
    $tempDir = sys_get_temp_dir() . '/vx-preview-' . uniqid('', true);
    if (!@mkdir($tempDir, 0755, true)) {
        return null;
    }

    // Instrument the main page file
    $mainFile = $previewDir . '/' . $requestedPath;
    if (!file_exists($mainFile)) {
        @rmdir($tempDir);
        return null;
    }

    // Create subdirectory for nested pages (e.g., "pages/about.php")
    $subDir = dirname($requestedPath);
    if ($subDir !== '.' && $subDir !== '') {
        @mkdir($tempDir . '/' . $subDir, 0755, true);
    }

    $content = file_get_contents($mainFile);
    file_put_contents($tempDir . '/' . $requestedPath, instrumentPhpIncludes($content, ''));

    // Instrument partials
    $partialsDir = $previewDir . '/_partials';
    if (is_dir($partialsDir)) {
        @mkdir($tempDir . '/_partials', 0755, true);
        foreach (glob($partialsDir . '/*.php') as $partialFile) {
            $content = file_get_contents($partialFile);
            file_put_contents(
                $tempDir . '/_partials/' . basename($partialFile),
                instrumentPhpIncludes($content, '_partials/')
            );
        }
    }

    // Mirror everything else (assets, images, non-PHP dirs) so
    // CSS/JS/images resolve correctly from the temp working directory.
    // Prefer symlinks for speed; fall back to copy on hosts that disable them.
    $entries = @scandir($previewDir);
    if ($entries) {
        foreach ($entries as $entry) {
            if ($entry === '.' || $entry === '..') continue;
            if ($entry === '_partials' || $entry === $requestedPath) continue;
            $targetInTemp = $tempDir . '/' . $entry;
            if (file_exists($targetInTemp) || is_link($targetInTemp)) continue;
            $source = $previewDir . '/' . $entry;
            if (!@symlink($source, $targetInTemp)) {
                // Symlinks disabled — fall back to copy
                if (is_dir($source)) {
                    recursiveCopyDir($source, $targetInTemp);
                } else {
                    @copy($source, $targetInTemp);
                }
            }
        }
    }

    return $tempDir;
}

/**
 * Recursively copy a directory tree. Used as fallback when symlinks
 * are disabled on the host.
 */
function recursiveCopyDir(string $src, string $dst): void
{
    @mkdir($dst, 0755, true);
    $entries = @scandir($src);
    if (!$entries) return;
    foreach ($entries as $entry) {
        if ($entry === '.' || $entry === '..') continue;
        $s = $src . '/' . $entry;
        $d = $dst . '/' . $entry;
        if (is_dir($s)) {
            recursiveCopyDir($s, $d);
        } else {
            @copy($s, $d);
        }
    }
}

/**
 * Rewrite include/require statements in PHP source to wrap them
 * with VX provenance markers.
 */
function instrumentPhpIncludes(string $source, string $basePath): string
{
    // ── Order matters: most-specific pattern first ──
    // The conditional pattern must be processed BEFORE the unconditional
    // ones, otherwise the unconditional `include __DIR__` pattern matches
    // the include inside `if (...) include ...;` and rewrites it first.

    // 1. if (file_exists(...)) include __DIR__ . '/something.php';
    //    Markers go INSIDE the if block to preserve control flow exactly.
    //    Without this, markers would be emitted even when the branch is not taken.
    //    The condition regex handles one level of nested parens (e.g. file_exists()).
    $source = preg_replace_callback(
        '/(if\s*\((?:[^()]*|\([^)]*\))*\)\s*)(include|require|include_once|require_once)(\s+__DIR__\s*\.\s*[\'"]\/([a-zA-Z0-9_\-]+\.php)[\'\"]\s*);/',
        function ($m) use ($basePath) {
            $file = $basePath . $m[4];
            $includeStmt = $m[2] . $m[3];
            return "{$m[1]}{ echo '<!-- vx:partial:start:{$file} -->'; {$includeStmt}; echo '<!-- vx:partial:end:{$file} -->'; }";
        },
        $source
    ) ?? $source;

    // 2. include '_partials/something.php'
    //    Skip if already instrumented by Pattern 1 (avoid double markers).
    $source = preg_replace_callback(
        '/\b(include|require|include_once|require_once)\s+[\'"]((_partials\/)?[a-zA-Z0-9_\-\/]+\.php)[\'"]\s*;/',
        function ($m) use (&$source) {
            $file = $m[2];
            // Guard: if this include is already wrapped in markers, skip it
            $pos = strpos($source, $m[0]);
            if ($pos !== false && $pos > 0) {
                $before = substr($source, max(0, $pos - 200), min($pos, 200));
                if (str_contains($before, "vx:partial:start:{$file}")) return $m[0];
            }
            return "echo '<!-- vx:partial:start:{$file} -->'; {$m[0]} echo '<!-- vx:partial:end:{$file} -->';";
        },
        $source
    ) ?? $source;

    // 3. include __DIR__ . '/nav.php'
    //    Skip if already instrumented by Pattern 1 (avoid double markers).
    $source = preg_replace_callback(
        '/\b(include|require|include_once|require_once)\s+__DIR__\s*\.\s*[\'"]\/([a-zA-Z0-9_\-]+\.php)[\'"]\s*;/',
        function ($m) use ($basePath, &$source) {
            $file = $basePath . $m[2];
            // Guard: if this include is already wrapped in markers, skip it
            $pos = strpos($source, $m[0]);
            if ($pos !== false && $pos > 0) {
                $before = substr($source, max(0, $pos - 200), min($pos, 200));
                if (str_contains($before, "vx:partial:start:{$file}")) return $m[0];
            }
            return "echo '<!-- vx:partial:start:{$file} -->'; {$m[0]} echo '<!-- vx:partial:end:{$file} -->';";
        },
        $source
    ) ?? $source;

    return $source;
}

/**
 * Recursively delete a temp preview directory.
 * Safety: only deletes directories with the vx-preview- prefix.
 * Handles both symlinks and deep copied subtrees.
 */
function cleanupTempPreviewDir(?string $tempDir): void
{
    if (!$tempDir) return;
    $prefix = sys_get_temp_dir() . '/vx-preview-';
    if (!str_starts_with($tempDir, $prefix)) return;
    if (!is_dir($tempDir)) return;

    recursiveDeleteDir($tempDir);
}

/**
 * Recursively delete a directory and all its contents.
 * Handles symlinks (unlinks without following) and real directories.
 */
function recursiveDeleteDir(string $dir): void
{
    $entries = @scandir($dir);
    if (!$entries) return;

    foreach ($entries as $entry) {
        if ($entry === '.' || $entry === '..') continue;
        $path = $dir . '/' . $entry;
        if (is_link($path)) {
            @unlink($path);
        } elseif (is_dir($path)) {
            recursiveDeleteDir($path);
        } else {
            @unlink($path);
        }
    }
    @rmdir($dir);
}

/**
 * Fail-safe annotation: used when instrumented preview copy could not
 * be created (e.g. temp directory unavailable). Marks every selectable
 * HTML element as unsafe/non-editable so the Visual Editor renders
 * read-only toolbars everywhere instead of silently allowing mutation
 * on un-instrumented output.
 *
 * Crucially, data-vx-source-file is left EMPTY because provenance is
 * unknown. This prevents the editor from linking to the wrong file.
 */
function annotateFailSafe(string $html, string $pageFile): string
{
    $skipTags = ['html','head','body','script','style','link','meta','noscript','br','hr','wbr','col','colgroup','iframe','template','svg','path','circle','line','polyline','rect','ellipse','polygon','g','defs','use','symbol','clippath','mask'];
    $skipSet = array_flip($skipTags);
    $idx = 0;

    return preg_replace_callback(
        '/<([a-z][a-z0-9]*)(\s[^>]*)?(\/?)>/i',
        function ($m) use ($skipSet, &$idx) {
            $tag = strtolower($m[1]);
            $attrs = $m[2] ?? '';
            $selfClose = $m[3] ?? '';

            if (isset($skipSet[$tag])) return $m[0];
            if (str_contains($attrs, 'data-vx-source')) return $m[0];
            if (preg_match('/(?:id|class)=["\'](?:vx-|vs-)/', $attrs)) return $m[0];

            $nodeKey = 'failsafe:' . $idx++;
            $vxAttrs = ' data-vx-source-file=""'
                     . ' data-vx-source-kind="unsafe"'
                     . " data-vx-node-key=\"{$nodeKey}\""
                     . ' data-vx-editable="false"';

            return "<{$tag}{$attrs}{$vxAttrs}{$selfClose}>";
        },
        $html,
        -1
    ) ?? $html;
}

/**
 * Parse provenance markers in rendered HTML and annotate content elements
 * with data-vx-* attributes for the Visual Editor bridge.
 *
 * Architecture:
 *   Step 1: Check partials for PHP loop constructs (file-name-only, no offsets).
 *   Step 2: Annotate ALL elements with page-level defaults (data-vx-*=page).
 *   Step 3: Re-parse provenance zones from the post-annotation HTML (offsets valid).
 *   Step 4: Override: build a per-element map (outer zones first, inner zones overwrite),
 *           then apply in a single regex pass. No substring splicing.
 *   Step 5: Strip provenance markers from final output.
 */
function annotateSourceAddresses(string $html, string $pageFile): string
{
    // Step 1: Check which partials contain PHP loop constructs.
    $loopPartials = [];
    $previewDir = dirname(__DIR__, 2) . '/preview';
    preg_match_all('/<!-- vx:partial:start:([a-zA-Z0-9_\-\/]+\.php) -->/', $html, $partialMatches);
    foreach (array_unique($partialMatches[1]) as $partialFile) {
        $partialPath = $previewDir . '/' . $partialFile;
        if (file_exists($partialPath)) {
            $src = file_get_contents($partialPath);
            $loopPartials[$partialFile] = (bool) preg_match('/\b(foreach|for|while)\s*\(/', $src);
        } else {
            $loopPartials[$partialFile] = false;
        }
    }

    // Step 2: Annotate ALL opening tags with page-level defaults.
    $skipTags = ['html','head','body','script','style','link','meta','noscript','br','hr','wbr','col','colgroup','iframe','template','svg','path','circle','line','polyline','rect','ellipse','polygon','g','defs','use','symbol','clippath','mask'];
    $skipSet = array_flip($skipTags);

    $nodeCounters = [];
    $html = preg_replace_callback(
        '/<([a-z][a-z0-9]*)(\s[^>]*)?(\/?)?>/i',
        function ($m) use ($skipSet, $pageFile, &$nodeCounters) {
            $tag = strtolower($m[1]);
            $attrs = $m[2] ?? '';
            $selfClose = $m[3] ?? '';

            if (isset($skipSet[$tag])) return $m[0];
            if (str_contains($attrs, 'data-vx-source')) return $m[0];
            if (preg_match('/(?:id|class)=["\'](?:vx-|vs-)/', $attrs)) return $m[0];

            if (!isset($nodeCounters[$pageFile])) $nodeCounters[$pageFile] = 0;
            $idx = $nodeCounters[$pageFile]++;
            $nodeKey = htmlspecialchars($pageFile . ':' . $idx);

            $vxAttrs = " data-vx-source-file=\"{$pageFile}\""
                     . " data-vx-source-kind=\"page\""
                     . " data-vx-node-key=\"{$nodeKey}\""
                     . ' data-vx-editable="true"';

            return "<{$tag}{$attrs}{$vxAttrs}{$selfClose}>";
        },
        $html,
        -1,
        $count
    ) ?? $html;

    // Step 3: Re-parse zones from the POST-ANNOTATION HTML.
    // Step 2 changed every tag (adding data-vx-* attrs), shifting all
    // byte offsets. The provenance markers are still intact.
    $zones = [];
    preg_match_all(
        '/<!-- vx:partial:(start|end):([a-zA-Z0-9_\-\/]+\.php) -->/',
        $html, $zoneMatches, PREG_OFFSET_CAPTURE | PREG_SET_ORDER
    );

    $openStack = [];
    foreach ($zoneMatches as $m) {
        $action = $m[1][0];
        $file = $m[2][0];
        $offset = (int) $m[0][1];
        $markerLen = strlen($m[0][0]);

        if ($action === 'start') {
            $openStack[] = ['file' => $file, 'contentStart' => $offset + $markerLen];
        } elseif ($action === 'end' && $openStack) {
            $open = array_pop($openStack);
            if ($open['file'] === $file) {
                $zones[] = [
                    'file' => $file,
                    'contentStart' => $open['contentStart'],
                    'contentEnd' => $offset,
                ];
            }
        }
    }

    // Step 4: Override attributes for elements inside partial zones.
    //
    // Pass A: Build a per-element override map. Process outermost zones
    // first; inner zones overwrite, giving them priority.
    // (Zones are ordered innermost-first from the stack parser.)
    $elementOverrides = [];

    foreach (array_reverse($zones) as $zone) {
        $file = $zone['file'];
        $kind = str_starts_with($file, '_partials/') ? 'partial' : 'page';
        $hasLoops = $loopPartials[$file] ?? false;
        $effectiveKind = $hasLoops ? 'unsafe' : $kind;
        $effectiveEditable = $hasLoops ? 'false' : 'true';

        $segment = substr($html, $zone['contentStart'], $zone['contentEnd'] - $zone['contentStart']);
        preg_match_all('/data-vx-node-key="([^"]*)"/', $segment, $keyMatches);
        if (!empty($keyMatches[1])) {
            foreach ($keyMatches[1] as $origKey) {
                $elementOverrides[$origKey] = [
                    'file' => $file,
                    'kind' => $effectiveKind,
                    'editable' => $effectiveEditable,
                    'chain' => $file,
                ];
            }
        }
    }

    // Pass B: Single regex pass to apply all overrides.
    if (!empty($elementOverrides)) {
        $globalNodeCounters = [];
        $html = preg_replace_callback(
            '/<([a-z][a-z0-9]*)(\s[^>]*?)(data-vx-node-key="([^"]*)")([^>]*?)(\/?)?>/i',
            function ($m) use ($elementOverrides, &$globalNodeCounters) {
                $origKey = $m[4];
                if (!isset($elementOverrides[$origKey])) return $m[0];

                $ov = $elementOverrides[$origKey];
                $file = $ov['file'];

                if (!isset($globalNodeCounters[$file])) $globalNodeCounters[$file] = 0;
                $newKey = htmlspecialchars($file . ':' . $globalNodeCounters[$file]++);
                $chain = htmlspecialchars($ov['chain']);

                $fullAttrs = $m[2] . $m[3] . $m[5];
                $fullAttrs = preg_replace('/data-vx-source-file="[^"]*"/', 'data-vx-source-file="' . htmlspecialchars($file) . '"', $fullAttrs);
                $fullAttrs = preg_replace('/data-vx-source-kind="[^"]*"/', 'data-vx-source-kind="' . $ov['kind'] . '"', $fullAttrs);
                $fullAttrs = preg_replace('/data-vx-editable="[^"]*"/', 'data-vx-editable="' . $ov['editable'] . '"', $fullAttrs);
                $fullAttrs = preg_replace('/data-vx-node-key="[^"]*"/', 'data-vx-node-key="' . $newKey . '"', $fullAttrs);

                if (!str_contains($fullAttrs, 'data-vx-include-chain')) {
                    $fullAttrs = preg_replace(
                        '/(data-vx-source-kind="[^"]*")/',
                        '$1 data-vx-include-chain="' . $chain . '"',
                        $fullAttrs
                    );
                } else {
                    $fullAttrs = preg_replace('/data-vx-include-chain="[^"]*"/', 'data-vx-include-chain="' . $chain . '"', $fullAttrs);
                }

                return "<{$m[1]}{$fullAttrs}{$m[6]}>";
            },
            $html
        ) ?? $html;
    }

    // Step 5: Strip provenance markers from final output.
    $html = preg_replace('/<!-- vx:partial:(?:start|end):[a-zA-Z0-9_\-\/]+\.php -->/', '', $html) ?? $html;

    return $html;
}
