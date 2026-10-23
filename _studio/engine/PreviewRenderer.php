<?php
declare(strict_types=1);
namespace VoxelSite;
use VoxelSite\Agent\{OperationException, ProviderCallPolicy, SitePathPolicy, WorkspaceFiles};

/** One render path for Studio and credential-scoped browser/text previews. */
final class PreviewRenderer
{
    public const MAX_RENDER_BYTES=1048576;

    public function __construct(private SiteWorkspace $workspace) {}

    public function render(string $path,string $routeBase,array $options=[]): array
    {
        return $this->renderInternal($path,$routeBase,$options,false);
    }

    /** Trusted export callers supply a retained private workspace, never request options. */
    public function renderPortable(string $path): array
    {
        return $this->renderInternal($path,'',[],true);
    }

    private function renderInternal(string $path,string $routeBase,array $options,bool $portable): array
    {
        return ProviderCallPolicy::runExternal(function () use ($path,$routeBase,$options,$portable): array {
            SitePathPolicy::canonical($path);
            $this->workspace->assertReady();
            $absolute=$this->workspace->resolveDraft($path);
            if (!is_file($absolute)) {
                return ['status'=>404,'mime'=>'text/html; charset=utf-8','content'=>$path === 'index.php' ? self::getEmptyPreviewHtml() : '',
                    'diagnostics'=>[['code'=>'not_found','message'=>'This draft page is not available.']],'rendered'=>false];
            }
            $extension=strtolower(pathinfo($path,PATHINFO_EXTENSION));
            if ($extension !== 'php') return $this->asset($path,$absolute,$extension,$routeBase);
            if (SitePathPolicy::type($path) !== 'page') throw new OperationException('invalid_path','Render a site page, not a shared partial.');
            // Bound source inventory before instrumentation copies or PHP execution.
            WorkspaceFiles::read($this->workspace);
            $preflight=$this->workspace->preflight();
            if (!$preflight['ok']) return ['status'=>409,'mime'=>'text/html; charset=utf-8','content'=>'','diagnostics'=>$preflight['issues'],'rendered'=>false];
            $temporary=null; $original=getcwd(); $level=ob_get_level(); $content='';
            $errorHandler=false; $renderError=null; $instrumented=false;
            try {
                $temporary=$portable ? null : self::createInstrumentedPreviewCopy($this->workspace->draftRoot(),$path);
                $instrumented=$temporary !== null;
                $entry=$instrumented ? $temporary.'/'.$path : $absolute;
                chdir($instrumented ? $temporary : $this->workspace->draftRoot());
                set_error_handler(static function (int $severity,string $message,string $file,int $line): bool {
                    if (!(error_reporting() & $severity)) return false;
                    throw new \ErrorException($message,0,$severity,$file,$line);
                });
                $errorHandler=true;
                if (function_exists('opcache_invalidate')) opcache_invalidate($entry,true);
                ob_start(static function (string $chunk) use (&$content): string {
                    if (strlen($content)+strlen($chunk)>self::MAX_RENDER_BYTES) throw new OperationException('size_limit','Rendered HTML exceeds the 1 MiB preview limit.');
                    $content.=$chunk;
                    return '';
                },8192);
                // Authored PHP has the same code-trust boundary as Studio.
                // Do not introduce owner/session credentials into its local scope.
                (static function (string $entry): void { include $entry; })($entry);
                ob_end_flush();
            } catch (\Throwable $error) {
                $renderError=$error;
            } finally {
                if ($errorHandler) restore_error_handler();
                while (ob_get_level()>$level) ob_end_clean();
                if ($original !== false) chdir($original);
                self::cleanupTempPreviewDir($temporary);
            }
            if ($renderError !== null) {
                return ['status'=>422,'mime'=>'text/html; charset=utf-8','content'=>'','rendered'=>false,
                    'diagnostics'=>[['code'=>$renderError instanceof OperationException ? $renderError->errorCode : 'render_failed',
                        'message'=>'The draft could not be rendered. Inspect its PHP and dependencies; no successful visual check is recorded.',
                        'line'=>$renderError->getLine()]]];
            }
            if ($portable) return ['status'=>200,'mime'=>'text/html; charset=utf-8','content'=>$content,'rendered'=>true,'diagnostics'=>[]];
            $content=$instrumented ? self::annotateSourceAddresses($content,$path) : self::annotateFailSafe($content,$path);
            $content=self::bustAssetCache($content,$this->workspace->draftAssetsRoot());
            $content=PreviewAssetRouter::rewrite($content,$path,'html',$routeBase);
            $content=$this->runtime($content,$options,$routeBase);
            if (($options['studio'] ?? false) === true) {
                $content=self::injectHotReload($content,$routeBase);
                $content=self::injectVisualEditorBridge($content);
            }
            if (($options['has_actions'] ?? false) === true) $content=self::injectActionsBar($content,true);
            if (($options['embed'] ?? false) === true) {
                $content=str_ireplace('</head>','<style>[data-reveal],[data-reveal-stagger]>*{opacity:1!important;transform:none!important;visibility:visible!important;transition:none!important}</style></head>',$content);
            }
            if (strlen($content)>self::MAX_RENDER_BYTES) throw new OperationException('size_limit','Rendered preview decorations exceed the 1 MiB limit.');
            return ['status'=>200,'mime'=>'text/html; charset=utf-8','content'=>$content,'rendered'=>true,
                'diagnostics'=>[['code'=>'javascript_navigation_not_isolated',
                    'message'=>'Authored JavaScript can navigate to the live site. Static links and assets use preview routes; inspect scripted navigation separately.']]];
        });
    }

    private function asset(string $path,string $absolute,string $extension,string $base): array
    {
        if (SitePathPolicy::type($path) === 'partial') throw new OperationException('invalid_path','Shared partials are not static preview assets.');
        $size=filesize($absolute);
        $text=self::isTextType($extension) || $extension === 'mjs';
        $limit=$text ? self::MAX_RENDER_BYTES : WorkspaceFiles::MAX_BYTES;
        if ($size === false || $size>$limit) throw new OperationException('size_limit','This preview dependency exceeds its read limit.');
        $content=file_get_contents($absolute,false,null,0,$limit+1);
        if ($content === false || strlen($content)>$limit) throw new OperationException('host_capability_unavailable','Cannot read this preview dependency.');
        if ($text) $content=PreviewAssetRouter::rewrite($content,$path,$extension,$base);
        return ['status'=>200,'mime'=>$extension === 'mjs' ? 'application/javascript; charset=utf-8' : self::getMimeType($extension),
            'content'=>$content,'rendered'=>false,'diagnostics'=>[]];
    }

    private function runtime(string $html,array $options,string $routeBase=PreviewAssetRouter::BASE): string
    {
        $routes=PreviewAssetRouter::runtimeRoutes($routeBase);
        $validation=$options['validation_url'] ?? $routes['validation_url'];
        $manifest=$options['manifest_url'] ?? $routes['manifest_url'];
        foreach ([$validation,$manifest] as $url) {
            if (!is_string($url) || preg_match('/[\x00-\x20<>"\']/', $url)) {
                throw new \InvalidArgumentException('Preview runtime routes must be trusted local Studio endpoints.');
            }
            PreviewAssetRouter::installationPrefix($url);
        }
        $target=htmlspecialchars($validation,ENT_QUOTES|ENT_HTML5,'UTF-8');
        // Disable ordinary forms, including no-JavaScript and per-button overrides.
        $html=preg_replace_callback('~<form\b([^>]*)>~is',static function (array $match) use ($target): string {
            $attrs=preg_replace('~\s(?:action|method|target)\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+)~i','',$match[1]);
            return '<form'.$attrs.' action="'.$target.'" method="post" data-voxelsite-preview-form="true">';
        },$html) ?? $html;
        $html=preg_replace('~\bformaction\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+)~i','formaction="'.$target.'"',$html) ?? $html;
        $html=preg_replace('~\bformmethod\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+)~i','formmethod="post"',$html) ?? $html;
        $configuration=json_encode(['mode'=>'preview','forms'=>'disabled','actions'=>'disabled','manifest_url'=>$manifest,'submit_url'=>$validation],
            JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);
        $runtime='<script>window.VoxelSitePreview=Object.freeze('.$configuration.');</script>';
        // It must precede deferred and inline first-party scripts in the page.
        if (preg_match('~<head\b[^>]*>~i',$html)) return preg_replace('~(<head\b[^>]*>)~i','$1'.$runtime,$html,1) ?? $html;
        return $runtime.$html;
    }

    public static function getMimeType(string $extension): string
    {
        return match ($extension) {
            // Text
            'html', 'htm' => 'text/html; charset=utf-8',
            'php'         => 'text/html; charset=utf-8',  // PHP renders to HTML
            'css'         => 'text/css; charset=utf-8',
            'js', 'mjs'   => 'application/javascript; charset=utf-8',
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
    public static function isTextType(string $extension): bool
    {
        return in_array($extension, [
            'html', 'htm', 'css', 'js', 'mjs', 'json', 'xml', 'svg', 'txt', 'md',
        ], true);
    }

    /**
     * @return array<int, string>
     */
    public static function collectManagedPreviewFiles(string $previewDir): array
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
    public static function loadJsonSafe(string $path, array $fallback): array
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
    public static function collectCurrentAssetHashes(string $assetsDir): array
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
    public static function injectHotReload(string $html,string $routeBase=PreviewAssetRouter::BASE): string
    {
        $prefix=PreviewAssetRouter::installationPrefix($routeBase);
        $script = <<<'HOTRELOAD'
    <!-- VoxelSite Hot-Reload -->
    <script>
    (function() {
      // Build a preview URL that works on EVERY server (Apache + Nginx).
      // Uses the explicit router.php?_path= format — no mod_rewrite needed.
      var PREVIEW_BASE = __VOXELSITE_PREVIEW_BASE__;
      var INSTALLATION_PREFIX = __VOXELSITE_INSTALLATION_PREFIX__;

      function toPreviewUrl(rawHref) {
        if (!rawHref) return null;

        var href = rawHref.trim();
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
          return null;
        }

        var targetUrl;
        try {
          var currentPath = new URLSearchParams(window.location.search).get('path') || 'index.php';
          targetUrl = new URL(href, window.location.origin + INSTALLATION_PREFIX + '/' + currentPath);
        } catch (_) {
          return null;
        }

        if (targetUrl.origin !== window.location.origin) return null;

        var path;
        try { path = decodeURIComponent(targetUrl.pathname || '/'); } catch (_) { return null; }

        // Already a preview URL (either rewrite or router.php format)
        if (/(^|\/)\_studio(\/|$)/.test(path)) {
          return null; // Let it through as-is
        }

        var prefix = decodeURIComponent(INSTALLATION_PREFIX);
        if (prefix && (path === prefix || path.startsWith(prefix + '/'))) {
          path = path.slice(prefix.length);
        }

        var relPath = path.replace(/^\/+/, '');
        if (!relPath) relPath = 'index.php';
        if (relPath.endsWith('/')) relPath += 'index.php';
        if (!/\.[a-z0-9]+$/i.test(relPath)) relPath += '.php';

        var query = new URLSearchParams(targetUrl.search);
        Array.from(query.keys()).forEach(function(key) {
          var authority = key.split('[')[0].replace(/[ .]/g, '_');
          if (['path', 'view', '_path'].includes(authority)) query.delete(key);
        });
        return PREVIEW_BASE + encodeURIComponent(relPath).replace(/%2F/gi, '/') + (query.toString() ? '&' + query.toString() : '') + targetUrl.hash;
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
              var styleUrl = new URL(href, window.location.href);
              styleUrl.searchParams.set('t', Date.now());
              link.setAttribute('href', styleUrl.pathname + styleUrl.search + styleUrl.hash);
            }
          });
        }
      });
    })();
    </script>
    HOTRELOAD;
        $flags=JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR;
        $script=str_replace(['__VOXELSITE_PREVIEW_BASE__','__VOXELSITE_INSTALLATION_PREFIX__'],
            [json_encode($routeBase,$flags),json_encode($prefix,$flags)],$script);

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
    public static function injectVisualEditorBridge(string $html): string
    {
        $bridgePath = dirname(__DIR__) . '/ui/visual-editor-bridge.js';
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
    public static function bustAssetCache(string $html, string $assetsDir): string
    {
        $docRoot = dirname($assetsDir); // one level up from /assets/

        // Helper: append ?v={mtime} to a local asset path
        $bust = function (string $href) use ($docRoot): string {
            $filePath = \VoxelSite\SiteWorkspace::resolveWithin($docRoot, ltrim($href, '/'));
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
    public static function getEmptyPreviewHtml(): string
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
    public static function injectActionsBar(string $html, ?bool $hasActions = null): string
    {
        $hasActive = $hasActions === true;

        if ($hasActions !== null) {
            // The shared service supplied a bounded public manifest projection.
        } elseif (\VoxelSite\DemoMode::isActive()) {
            // Demo mode has active actions defined in demo-handler.php
            $hasActive = true;
        } else {
            // Quick check: do active actions exist?
            $actionsDir = dirname(__DIR__) . '/data/actions';
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
        $staticDir = dirname(__DIR__) . '/static';
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
    public static function createInstrumentedPreviewCopy(string $previewDir, string $requestedPath): ?string
    {
        $mainFile = \VoxelSite\SiteWorkspace::resolveWithin($previewDir, $requestedPath);
        if (!is_file($mainFile)) return null;
        $tempDir = realpath(sys_get_temp_dir()) . '/vx-preview-' . bin2hex(random_bytes(12));
        if (!mkdir($tempDir, 0700, true)) return null;
        try {
            $copy = function (string $relative = '') use (&$copy, $previewDir, $requestedPath, $tempDir): void {
                $sourceDir = $relative === '' ? $previewDir : \VoxelSite\SiteWorkspace::resolveWithin($previewDir, $relative);
                foreach (scandir($sourceDir) as $name) {
                    if ($name === '.' || $name === '..' || ($relative === '' && in_array($name, ['assets', '.htaccess', '.user.ini'], true))) continue;
                    $path = $relative === '' ? $name : $relative . '/' . $name;
                    $source = \VoxelSite\SiteWorkspace::resolveWithin($previewDir, $path);
                    $target = $tempDir . '/' . $path;
                    if (is_dir($source)) {
                        if (!mkdir($target, 0700)) throw new \RuntimeException('Cannot create temporary preview directory.');
                        $copy($path);
                    } elseif (is_file($source)) {
                        $content = file_get_contents($source);
                        if ($path === $requestedPath || (str_starts_with($path, '_partials/') && str_ends_with($path, '.php'))) {
                            $content = self::instrumentPhpIncludes($content, dirname($path) === '.' ? '' : dirname($path) . '/');
                        }
                        if (file_put_contents($target, $content) !== strlen($content)) throw new \RuntimeException('Cannot copy preview source.');
                    }
                }
            };
            $copy();
            $assets = str_contains($previewDir, '/demo/') ? dirname($previewDir) . '/assets' : $previewDir . '/assets';
            \VoxelSite\SiteWorkspace::inventory($assets);
            if (!function_exists('symlink') || !@symlink($assets, $tempDir . '/assets')) {
                self::recursiveCopyDir($assets, $tempDir . '/assets');
            }
            return $tempDir;
        } catch (\Throwable $error) {
            self::cleanupTempPreviewDir($tempDir);
            throw $error;
        }
    }

    /**
     * Recursively copy a directory tree. Used as fallback when symlinks
     * are disabled on the host.
     */
    public static function recursiveCopyDir(string $src, string $dst): void
    {
        if (!is_dir($dst) && !mkdir($dst, 0700, true)) throw new \RuntimeException('Cannot create preview asset directory.');
        $entries = @scandir($src);
        if ($entries === false) throw new \RuntimeException('Cannot read preview assets.');
        foreach ($entries as $entry) {
            if ($entry === '.' || $entry === '..') continue;
            $s = \VoxelSite\SiteWorkspace::resolveWithin($src, $entry);
            $d = $dst . '/' . $entry;
            if (is_dir($s)) {
                self::recursiveCopyDir($s, $d);
            } else {
                if (!copy($s, $d) || hash_file('sha256', $s) !== hash_file('sha256', $d)) {
                    throw new \RuntimeException('Cannot copy complete preview assets.');
                }
            }
        }
    }

    /**
     * Rewrite include/require statements in PHP source to wrap them
     * with VX provenance markers.
     */
    public static function instrumentPhpIncludes(string $source, string $basePath): string
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
    public static function cleanupTempPreviewDir(?string $tempDir): void
    {
        if (!$tempDir) return;
        $prefix = realpath(sys_get_temp_dir()) . '/vx-preview-';
        if (!str_starts_with($tempDir, $prefix)) return;
        if (!is_dir($tempDir)) return;

        self::recursiveDeleteDir($tempDir);
    }

    /**
     * Recursively delete a directory and all its contents.
     * Handles symlinks (unlinks without following) and real directories.
     */
    public static function recursiveDeleteDir(string $dir): void
    {
        $entries = @scandir($dir);
        if (!$entries) return;

        foreach ($entries as $entry) {
            if ($entry === '.' || $entry === '..') continue;
            $path = $dir . '/' . $entry;
            if (is_link($path)) {
                @unlink($path);
            } elseif (is_dir($path)) {
                self::recursiveDeleteDir($path);
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
    public static function annotateFailSafe(string $html, string $pageFile): string
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
     *   Step 1: Annotate ALL elements with page-level defaults (data-vx-*=page).
     *   Step 2: Re-parse provenance zones from the post-annotation HTML (offsets valid).
     *   Step 3: Override: build a per-element map (outer zones first, inner zones overwrite),
     *           then apply in a single regex pass. No substring splicing.
     *   Step 4: Strip provenance markers from final output.
     */
    public static function annotateSourceAddresses(string $html, string $pageFile): string
    {
        // Step 1: Annotate ALL opening tags with page-level defaults.
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

        // Step 2: Re-parse zones from the POST-ANNOTATION HTML.
        // Step 1 changed every tag (adding data-vx-* attrs), shifting all
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

        // Step 3: Override attributes for elements inside partial zones.
        //
        // Pass A: Build a per-element override map. Process outermost zones
        // first; inner zones overwrite, giving them priority.
        // (Zones are ordered innermost-first from the stack parser.)
        $elementOverrides = [];

        foreach (array_reverse($zones) as $zone) {
            $file = $zone['file'];
            $kind = str_starts_with($file, '_partials/') ? 'partial' : 'page';

            $segment = substr($html, $zone['contentStart'], $zone['contentEnd'] - $zone['contentStart']);
            preg_match_all('/data-vx-node-key="([^"]*)"/', $segment, $keyMatches);
            if (!empty($keyMatches[1])) {
                foreach ($keyMatches[1] as $origKey) {
                    $elementOverrides[$origKey] = [
                        'file' => $file,
                        'kind' => $kind,
                        'editable' => 'true',
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

        // Step 3.5: Re-number main-file nodeKeys sequentially.
        //
        // After Step 3 reassigned partial elements to per-file counters,
        // the remaining main-file elements still carry their Step 1 indices
        // which counted ALL rendered tags (including from includes). The JS
        // source extractor counts tags in the SOURCE file from 0, and the
        // source file doesn't contain the include's expanded content. So
        // nodeKey "index.php:30" would point to the 30th rendered tag but
        // only the 4th source tag. Re-count so indices match source position.
        $mainFileCounter = 0;
        $escapedPageFile = htmlspecialchars($pageFile);
        $html = preg_replace_callback(
            '/data-vx-node-key="' . preg_quote($escapedPageFile, '/') . ':\d+"/',
            function ($m) use ($escapedPageFile, &$mainFileCounter) {
                return 'data-vx-node-key="' . $escapedPageFile . ':' . $mainFileCounter++ . '"';
            },
            $html
        ) ?? $html;

        // Step 4: Strip provenance markers from final output.
        $html = preg_replace('/<!-- vx:partial:(?:start|end):[a-zA-Z0-9_\-\/]+\.php -->/', '', $html) ?? $html;

        return $html;
    }

}
