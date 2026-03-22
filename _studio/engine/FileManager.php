<?php

declare(strict_types=1);

namespace VoxelSite;

use RuntimeException;

/**
 * Manages file operations in the preview directory.
 *
 * The AI produces file operations (write, delete). This class
 * executes them safely in _studio/preview/, validates paths,
 * and syncs the pages table to reflect what files exist.
 *
 * Security is paramount: every path is validated with realpath()
 * to prevent directory traversal. The preview directory is the
 * only writable target. _studio/ internals are never touchable.
 */
class FileManager
{
    private string $previewPath;
    private string $assetsPath;
    private string $promptsPath;
    private string $customPromptsPath;
    private Database $db;

    public function __construct(?Database $db = null)
    {
        $this->db = $db ?? Database::getInstance();
        $this->previewPath = dirname(__DIR__) . '/preview';
        $this->assetsPath = dirname(__DIR__, 2) . '/assets';
        $this->promptsPath = dirname(__DIR__) . '/prompts';
        $this->customPromptsPath = dirname(__DIR__) . '/custom_prompts';
    }

    /**
     * Execute a list of file operations in the preview directory.
     *
     * Each operation is {path, action, content}. Paths are relative
     * to the site root (e.g., "index.php", "assets/css/style.css").
     *
     * PHP page files go to _studio/preview/.
     * _partials/*.php go to _studio/preview/_partials/.
     *
     * @param array<int, array{path: string, action: string, content: string|array|null}> $operations
     * @return array{written: string[], deleted: string[], errors: string[], warnings: string[]}
     */
    public function executeOperations(array $operations): array
    {
        $written = [];
        $deleted = [];
        $errors = [];
        $warnings = [];

        foreach ($operations as $op) {
            $path = $op['path'];
            $action = $op['action'];

            try {
                if ($action === 'write') {
                    $warning = $this->writeFile($path, $op['content']);
                    $written[] = $path;
                    if ($warning !== null) {
                        $warnings[] = $warning;
                    }
                } elseif ($action === 'delete') {
                    $this->deleteFile($path);
                    $deleted[] = $path;
                } elseif ($action === 'merge') {
                    $this->mergeJsonFile($path, $op['content']);
                    $written[] = $path;
                }
            } catch (\Throwable $e) {
                Logger::error('files', 'File operation failed', [
                    'path'      => $path,
                    'action'    => $action,
                    'exception' => $e->getMessage(),
                    'trace'     => $e->getTraceAsString(),
                ]);
                $errors[] = "{$path}: {$e->getMessage()}";
            }
        }

        return [
            'written'  => $written,
            'deleted'  => $deleted,
            'errors'   => $errors,
            'warnings' => $warnings,
        ];
    }

    /**
     * Compile the generated Tailwind bundle from current preview files.
     *
     * @return array{ok: bool, class_count: int}
     */
    public function compileTailwind(): array
    {
        $compiler = new TailwindCompiler();
        return $compiler->compile();
    }

    /**
     * Ensure assets/css/style.css exists.
     *
     * If the AI response was truncated and didn't include style.css,
     * generated pages link to it via <link href="/assets/css/style.css">
     * which returns "No input file specified" on Nginx servers.
     *
     * When style.css doesn't exist, create a minimal fallback with
     * neutral design tokens so the site has basic styling.
     */
    public function ensureStyleCssExists(): void
    {
        $stylePath = $this->assetsPath . '/css/style.css';

        // If style.css already exists and has content, don't overwrite
        if (file_exists($stylePath) && filesize($stylePath) > 50) {
            return;
        }

        // Extract font and color hints from generated preview files
        $bgColor = '#ffffff';
        $textColor = '#1a1a1a';
        $fontBody = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        $fontHeading = $fontBody;

        // Try to detect colors from preview files (look for bg-[...], text-[...])
        $headerPath = $this->previewPath . '/_partials/header.php';
        if (file_exists($headerPath)) {
            $headerContent = file_get_contents($headerPath);
            if ($headerContent !== false) {
                // Extract body background color from class like bg-[#xxx]
                if (preg_match('/bg-\[([#][0-9a-fA-F]{3,8})\]/', $headerContent, $m)) {
                    $bgColor = $m[1];
                }
                // Extract text color from class like text-[#xxx]
                if (preg_match('/text-\[([#][0-9a-fA-F]{3,8})\]/', $headerContent, $m)) {
                    $textColor = $m[1];
                }
                // Extract Google Font from the fonts URL
                if (preg_match('/family=([A-Za-z+]+)/', $headerContent, $m)) {
                    $fontName = str_replace('+', ' ', $m[1]);
                    $fontBody = "'{$fontName}', -apple-system, system-ui, sans-serif";
                    $fontHeading = $fontBody;
                }
            }
        }

        $css = <<<CSS
/* Fallback design tokens (auto-generated) */
:root {
  --color-bg: {$bgColor};
  --color-text: {$textColor};
  --color-primary: #2563eb;
  --color-primary-light: #3b82f6;
  --font-body: {$fontBody};
  --font-heading: {$fontHeading};
  --max-width: 1200px;

  /* Standard Tokens */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  --text-6xl: 3.75rem;
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  --space-4xl: 6rem;
  --radius-default: 4px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.15);
}

html { scroll-behavior: smooth; }
body { margin: 0; }

/* Base typography */
body { font-family: var(--font-body); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading, var(--font-body)); }
CSS;

        $dir = dirname($stylePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        // Atomic write
        $tmpPath = $stylePath . '.tmp.' . getmypid();
        file_put_contents($tmpPath, $css);
        rename($tmpPath, $stylePath);

        Logger::info('files', 'Created fallback style.css (AI did not generate one)', [
            'path' => $stylePath,
            'size' => strlen($css),
        ]);
    }

    /**
     * Determine whether editing/deleting a path can affect Tailwind output.
     *
     * Tailwind classes are extracted from preview page/partial markup, not
     * from assets CSS/JS files.
     */
    public function pathAffectsTailwind(string $relativePath): bool
    {
        $path = strtolower(str_replace('\\', '/', trim($relativePath)));
        if ($path === '') {
            return false;
        }

        if (str_starts_with($path, 'assets/')) {
            return false;
        }

        return str_ends_with($path, '.php') || str_ends_with($path, '.html');
    }

    /**
     * @param array<int, string> $paths
     */
    public function pathsAffectTailwind(array $paths): bool
    {
        foreach ($paths as $path) {
            if ($this->pathAffectsTailwind((string) $path)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Write a file to the appropriate location.
     *
     * PHP page files → _studio/preview/
     * _partials/*.php → _studio/preview/_partials/
     * CSS/JS files → /assets/css/ or /assets/js/
     *
     * Creates parent directories as needed.
     *
     * @return string|null Warning message if PHP syntax error detected, null if OK
     */
    public function writeFile(string $relativePath, string $content): ?string
    {
        // Auto-fix common AI model mistakes before writing
        $content = $this->fixCommonModelMistakes($relativePath, $content);

        $absolutePath = $this->resolvePath($relativePath, true);
        $dir = dirname($absolutePath);
        if (!is_dir($dir)) {
            if (!mkdir($dir, 0755, true)) {
                throw new RuntimeException("Cannot create directory: {$dir}");
            }
        }

        // Write atomically: write to temp, then rename
        $tmpPath = $absolutePath . '.tmp.' . getmypid();
        $result = file_put_contents($tmpPath, $content);

        if ($result === false) {
            @unlink($tmpPath);
            throw new RuntimeException("Cannot write file: {$relativePath}");
        }

        if (!rename($tmpPath, $absolutePath)) {
            @unlink($tmpPath);
            throw new RuntimeException("Cannot finalize file: {$relativePath}");
        }

        // Validate PHP syntax after writing
        if (str_ends_with($relativePath, '.php')) {
            $warning = $this->lintPhpFile($absolutePath, $relativePath);
            if ($warning !== null) {
                return $warning;
            }
        }

        return null;
    }

    /**
     * Fix common AI model output mistakes.
     *
     * AI models frequently produce:
     * - CSS with `.root` instead of `:root`
     * - header.php without tailwind.css link
     * - Unescaped apostrophes in PHP single-quoted strings (We're, Let's, etc.)
     * - href="/home" instead of href="/"
     */
    private function fixCommonModelMistakes(string $path, string $content): string
    {
        // ── PHP: Fix unescaped apostrophes in single-quoted strings ──
        // This is the #1 AI code generation bug. The AI writes:
        //   'description' => 'We're here to help'
        // which breaks PHP because the ' in We're closes the string.
        // Fix: find single-quoted strings with English contractions and
        // switch them to double-quoted strings (safe for HTML content).
        if (str_ends_with($path, '.php')) {
            $content = $this->fixPhpApostrophes($content);
            $content = $this->fixPreEncodedHtmlEntities($content);
        }

        // CSS: Fix .root { → :root { (variables on class instead of pseudo-class)
        if (str_ends_with($path, '.css')) {
            $content = preg_replace('/^\.root\s*\{/m', ':root {', $content);

            // Sanitize non-ASCII characters that break CSS parsing on some servers.
            // AI models use Unicode box-drawing (═══, ───), em dashes (—), curly
            // quotes (' ' " "), and other decorative chars in CSS comments.
            // If the web server doesn't send charset=utf-8 for CSS files, browsers
            // may misinterpret these multi-byte sequences and fail to parse the
            // entire stylesheet — breaking all styling.
            $content = $this->sanitizeCssEncoding($content);
        }

        // CSS: Inject standard design tokens into style.css
        // The AI only outputs colors, fonts, and layout width — standard tokens
        // (type scale, spacing, borders, shadows) are injected here to save prompt tokens.
        if ($path === 'assets/css/style.css' || $path === 'style.css') {
            $content = $this->injectStandardTokens($content);
        }

        // PHP files with <head>: Ensure tailwind.css is included
        // The TailwindCompiler generates this file — without it, all utility classes are unstyled.
        // AI models may name the head partial anything (header.php, head.php, layout.php)
        // or embed the <head> block directly in page files — check all PHP files.
        if (str_ends_with($path, '.php') && str_contains($content, '</head>') && !str_contains($content, 'tailwind.css')) {
            // Insert before the first existing stylesheet link
            if (preg_match('/<link\s+rel="stylesheet"/', $content)) {
                $content = preg_replace(
                    '/(<link\s+rel="stylesheet")/',
                    '<link rel="stylesheet" href="/assets/css/tailwind.css">' . "\n  $1",
                    $content,
                    1
                );
            } elseif (str_contains($content, '</head>')) {
                // No stylesheet links at all — insert before </head>
                $content = str_replace(
                    '</head>',
                    '  <link rel="stylesheet" href="/assets/css/tailwind.css">' . "\n</head>",
                    $content
                );
            }
        }

        // PHP/HTML: Fix href="/home" → href="/" (index.php is served at /)
        // AI models frequently link to /home, /index, or /index.php which all 404
        if (str_ends_with($path, '.php') || str_ends_with($path, '.html')) {
            $content = preg_replace(
                '/href="\/(?:home|index(?:\.php)?)"/',
                'href="/"',
                $content
            );
        }

        // PHP pages: Ensure file_get_contents(__DIR__ . '/assets/data/...')
        // has a file_exists() guard. AI models omit this check ~30% of the
        // time, causing PHP warnings in preview mode (where __DIR__ is not the
        // docroot and the assets/ symlink may not exist yet).
        // Only targets page files (not partials which use __DIR__ for includes).
        if (str_ends_with($path, '.php') && !str_starts_with($path, '_partials/')) {
            $content = $this->ensureDataFileGuard($content);
        }

        // _partials/header.php: Ensure it includes head.php if it exists
        // AI models sometimes split the document head into a separate head.php
        // but forget to include it from header.php, leaving pages without CSS.
        if ($path === '_partials/header.php'
            && !str_contains($content, '</head>')
            && !str_contains($content, 'head.php')
        ) {
            // Prepend include_once for head.php at the start of the PHP block
            $content = preg_replace(
                '/^<\?php\b/m',
                "<?php\ninclude_once __DIR__ . '/head.php';",
                $content,
                1
            );
        }

        // PHP: Extract inline <script> blocks into separate JS files.
        // AI models frequently dump JavaScript directly into PHP files, creating
        // syntax risks (JS apostrophes in PHP context) and bloated file sizes.
        // This extracts each <script>...</script> block into assets/js/{page}.js.
        if (str_ends_with($path, '.php') && preg_match('/<script>[\s\S]+?<\/script>/i', $content)) {
            $content = $this->extractInlineScripts($path, $content);
        }

        // PHP with forms: Ensure form-handler.js is included.
        // The shipped form handler provides preview detection + AJAX submission.
        // Like tailwind.css injection, this guarantees correct form behavior
        // without requiring the AI to generate any form JavaScript.
        if (str_ends_with($path, '.php')
            && str_contains($content, 'action="/submit.php"')
            && !str_contains($content, 'form-handler.js')
        ) {
            if (str_contains($content, '</body>')) {
                // Monolithic page or footer partial — inject directly
                $content = str_replace(
                    '</body>',
                    '<script src="/assets/js/form-handler.js" defer></script>' . "\n</body>",
                    $content
                );
            } else {
                // Partial-based architecture: the form is in a content page
                // but </body> lives in the footer partial. Inject there.
                $this->injectFormHandlerIntoFooter();
            }

            // Ensure the shipped file exists in assets/js/
            $this->ensureShippedFormHandler();
        }

        // Navigation: Replace AI-generated navigation.js with the shipped version.
        // The AI often generates broken mobile nav JS (missing scroll lock, wrong
        // selectors, missing transitionEnd). The shipped version is battle-tested.
        if ($path === 'assets/js/navigation.js') {
            $this->ensureShippedNavigation();
            // Return early — the shipped file is written directly, not via preview
            return $content;
        }

        // Icon resolver: Replace AI-generated icon-resolver.js with the shipped version.
        // Like navigation.js — the shipped version is canonical and handles
        // data-lucide hydration, alias mapping, and fallback behavior.
        if ($path === 'assets/js/icon-resolver.js') {
            $this->ensureShippedIconResolver();
            return $content;
        }

        // NOTE: icon-resolver.js injection into footer is NOT done per-file.
        // It is called unconditionally by PromptEngine after all writes,
        // so ordering doesn't matter. See ensureShippedIconResolver() and
        // injectIconResolverIntoFooter().

        // Nav partial: structural fixes for mobile menu.
        // 1. Move #mobile-menu outside <header> (backdrop-filter trap)
        // 2. Ensure a close button exists inside the menu
        // 3. Ensure minimal CSS safety net in style.css
        if ($path === '_partials/nav.php' && str_contains($content, 'mobile-menu')) {
            $content = $this->fixMobileMenuPlacement($content);
            $content = $this->ensureMobileMenuCloseButton($content);
            $this->ensureMobileNavCss();
        }

        // PHP/HTML: Normalize data-lucide icon names.
        // Auto-fix safe aliases (underscore→hyphen, known misspellings)
        // so the icon resolver can find the file on disk.
        if ((str_ends_with($path, '.php') || str_ends_with($path, '.html'))
            && str_contains($content, 'data-lucide=')
        ) {
            $content = $this->normalizeDataLucideNames($content);
        }

        return $content;
    }

    /**
     * Ensure JSON data file reads have file_exists() guards.
     *
     * Wraps bare patterns like:
     *   $data = json_decode(file_get_contents(__DIR__ . '/assets/data/xxx.json'), true);
     * with a safe file_exists() check:
     *   $data = (($f = __DIR__ . '/assets/data/xxx.json') && file_exists($f)) ? json_decode(file_get_contents($f), true) : [];
     *
     * This prevents PHP warnings when the data file doesn't exist
     * (e.g., in preview mode where __DIR__ may not have an assets/ child,
     * or the data file hasn't been created yet).
     */
    private function ensureDataFileGuard(string $content): string
    {
        // Only target the specific pattern: json_decode(file_get_contents(__DIR__ . '/assets/data/...'))
        // Skip if the line already has a file_exists check nearby
        return preg_replace_callback(
            '/^(\h*)\$(\w+)\s*=\s*json_decode\(\s*file_get_contents\(\s*(__DIR__\s*\.\s*[\'"]\/assets\/data\/[^\'"]+[\'"])\s*\)\s*,\s*true\s*\)\s*;/m',
            function (array $m) use ($content) {
                $indent = $m[1];
                $var = $m[2];
                $pathExpr = $m[3];
                $fullMatch = $m[0];

                // Check if there's already a file_exists guard within 3 lines above
                $pos = strpos($content, $fullMatch);
                if ($pos !== false) {
                    $before = substr($content, max(0, $pos - 300), min($pos, 300));
                    if (str_contains($before, 'file_exists')) {
                        return $fullMatch; // Already guarded
                    }
                }

                // Wrap with safe pattern
                return "{$indent}\${$var} = ((\$_f = {$pathExpr}) && file_exists(\$_f)) ? json_decode(file_get_contents(\$_f), true) : [];";
            },
            $content
        ) ?? $content;
    }

    /**
     * Move #mobile-menu outside <header> if it's nested inside.
     *
     * backdrop-filter on <header> creates a CSS containing block, which
     * traps position:fixed children inside the header's height. This is
     * the #1 cause of broken mobile menus in generated sites.
     *
     * Strategy: extract the mobile-menu div from inside <header> and
     * append it after </header>. This is a structural fix, not cosmetic.
     */
    private function fixMobileMenuPlacement(string $content): string
    {
        // Quick check: is mobile-menu inside <header>?
        $headerClosePos = strrpos($content, '</header>');
        if ($headerClosePos === false) {
            return $content;
        }

        // Find the mobile-menu div
        $menuStart = strpos($content, '<div class="mobile-menu"');
        if ($menuStart === false) {
            // Try alternate markup patterns
            $menuStart = strpos($content, '<div id="mobile-menu"');
        }
        if ($menuStart === false) {
            return $content;
        }

        // If mobile-menu starts BEFORE </header>, it's inside — needs moving
        if ($menuStart >= $headerClosePos) {
            return $content; // Already outside — nothing to do
        }

        // Extract the mobile-menu block.
        // Find the matching closing </div> by counting nesting depth.
        $depth = 0;
        $pos = $menuStart;
        $len = strlen($content);
        $menuEnd = null;

        while ($pos < $len) {
            $nextOpen = strpos($content, '<div', $pos + 1);
            $nextClose = strpos($content, '</div>', $pos + 1);

            if ($nextClose === false) {
                break; // Malformed HTML, bail
            }

            if ($nextOpen !== false && $nextOpen < $nextClose) {
                $depth++;
                $pos = $nextOpen;
            } else {
                if ($depth === 0) {
                    $menuEnd = $nextClose + strlen('</div>');
                    break;
                }
                $depth--;
                $pos = $nextClose;
            }
        }

        if ($menuEnd === null) {
            return $content; // Couldn't determine menu boundaries, bail safely
        }

        // Extract the menu HTML
        $menuHtml = substr($content, $menuStart, $menuEnd - $menuStart);

        // Remove it from its current position
        $content = substr($content, 0, $menuStart) . substr($content, $menuEnd);

        // Clean up any extra whitespace left behind
        $content = preg_replace('/\n\s*\n\s*\n/', "\n\n", $content);

        // Insert after </header>
        $headerClosePos = strrpos($content, '</header>');
        if ($headerClosePos !== false) {
            $insertAt = $headerClosePos + strlen('</header>');
            $content = substr($content, 0, $insertAt)
                . "\n\n" . $menuHtml . "\n"
                . substr($content, $insertAt);

            Logger::info('files', 'Moved #mobile-menu outside <header> (backdrop-filter fix)');
        }

        return $content;
    }

    /**
     * Ensure #mobile-menu contains an explicit close button.
     *
     * Mobile UX best practice: users should always see a clear way to
     * dismiss the menu. While the shipped navigation.js supports ESC,
     * overlay-click, and link-click close, a visible button is expected.
     *
     * Checks for any known close button pattern. If none exists, injects
     * a minimal accessible close button as the first child of the menu.
     * The shipped navigation.js already handles .mobile-menu-close.
     */
    private function ensureMobileMenuCloseButton(string $content): string
    {
        // Check if any close button already exists inside the mobile-menu
        $closePatterns = [
            'mobile-menu-close',
            'data-close-menu',
            'nav-close',
            'menu-close',
            'icon-close',     // Icon-swap pattern (close icon inside toggle)
        ];

        foreach ($closePatterns as $pattern) {
            if (str_contains($content, $pattern)) {
                return $content; // Already has a close mechanism
            }
        }

        // No close button found — inject one as the first child of #mobile-menu
        $closeBtn = '<button class="mobile-menu-close" aria-label="Close navigation">' . "\n"
            . '      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
            . '<line x1="18" y1="6" x2="6" y2="18"></line>'
            . '<line x1="6" y1="6" x2="18" y2="18"></line>'
            . '</svg>' . "\n"
            . '    </button>';

        // Find the opening tag of mobile-menu and insert after it
        $pattern = '/(<div[^>]*id="mobile-menu"[^>]*>)/s';
        if (preg_match($pattern, $content, $m, PREG_OFFSET_CAPTURE)) {
            $insertAt = $m[0][1] + strlen($m[0][0]);
            $content = substr($content, 0, $insertAt)
                . "\n    " . $closeBtn . "\n"
                . substr($content, $insertAt);

            Logger::info('files', 'Injected close button into #mobile-menu');
        }

        return $content;
    }

    /**
     * Inject critical mobile nav CSS into style.css if missing.
     *
     * Only injects the absolute minimum that prevents a completely
     * broken mobile menu. The AI owns all design decisions — colors,
     * fonts, animations, padding. This only catches:
     *   - Missing position:fixed (menu doesn't cover viewport)
     *   - Missing background-color (page bleeds through)
     *   - Missing .is-open transition (menu never appears)
     */
    private function ensureMobileNavCss(): void
    {
        $stylePath = $this->assetsPath . '/css/style.css';
        if (!file_exists($stylePath)) {
            return;
        }

        $css = file_get_contents($stylePath);
        if ($css === false) {
            return;
        }

        $inject = [];

        // 1. Ensure .mobile-menu has position:fixed for full-viewport coverage
        if (!preg_match('/\.mobile-menu\s*\{[^}]*position\s*:\s*fixed/s', $css)) {
            $inject[] = <<<'SAFETY'

/* -- Mobile Nav Safety Net (auto-injected) -- */
.mobile-menu {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9999;
}
SAFETY;
        }

        // 2. Ensure .mobile-menu has a background-color
        if (!preg_match('/\.mobile-menu\s*\{[^}]*background[-\w]*\s*:/s', $css)) {
            $inject[] = '.mobile-menu { background-color: var(--color-bg, #111); }';
        }

        // 3. Ensure .mobile-menu.is-open exists (without this, menu never shows)
        if (!str_contains($css, '.mobile-menu.is-open')) {
            $inject[] = <<<'SAFETY'
.mobile-menu { opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
.mobile-menu.is-open { opacity: 1; pointer-events: auto; }
SAFETY;
        }

        // 4. Ensure .mobile-menu-close has baseline styling
        if (!str_contains($css, '.mobile-menu-close')) {
            $inject[] = <<<'SAFETY'
.mobile-menu-close {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: inherit;
  padding: 0.5rem;
  line-height: 1;
  z-index: 1;
}
SAFETY;
        }

        // 5. Ensure .icon.hidden { display: none } overrides .icon { display: inline-block }
        // style.css loads after tailwind.css, so .icon's display:inline-block
        // wins over .hidden's display:none by cascade order. Without this,
        // the icon-swap toggle (hamburger ↔ close) breaks.
        if (str_contains($css, '.icon') && !str_contains($css, '.icon.hidden')) {
            $inject[] = '.icon.hidden { display: none; }';
        }

        if (!empty($inject)) {
            $css .= "\n" . implode("\n", $inject) . "\n";
            file_put_contents($stylePath, $css);

            Logger::info('files', 'Injected mobile nav CSS safety net', [
                'rules_added' => count($inject),
            ]);
        }
    }

    /**
     * Safe alias map for common AI hallucinations in data-lucide values.
     * Mirrors a subset of the alias map in icon-resolver.js for server-side normalization.
     *
     * IMPORTANT: Only alias names that do NOT exist as files in /assets/icons/.
     * If a name has a real .svg file on disk, the AI may have chosen it deliberately.
     * Verified against Lucide icon set — each source name confirmed missing.
     *
     * @var array<string, string>
     */
    private const ICON_ALIASES = [
        'email'       => 'mail',
        'location'    => 'map-pin',
        'time'        => 'clock',
        'cancel'      => 'x',
        'telephone'   => 'phone',
        'call'        => 'phone',
        'address'     => 'map-pin',
        'envelope'    => 'mail',
        'right-arrow' => 'arrow-right',
        'left-arrow'  => 'arrow-left',
        'tick'        => 'check',
        'checkmark'   => 'check',
        'remove'      => 'x',
        'close'       => 'x',
        'pencil-edit' => 'pencil',
        'gear'        => 'settings',
        'question'    => 'help-circle',
        'login'       => 'log-in',
        'logout'      => 'log-out',
        'signin'      => 'log-in',
        'signout'     => 'log-out',
        'profile'     => 'user',
        'account'     => 'user',
        'person'      => 'user',
        'people'      => 'users',
        'team'        => 'users',
        'photo'       => 'image',
        'picture'     => 'image',
        'hide'        => 'eye-off',
        'visible'     => 'eye',
        'invisible'   => 'eye-off',
        'cart'        => 'shopping-cart',
        'basket'      => 'shopping-cart',
        'bag'         => 'shopping-bag',
        'payment'     => 'credit-card',
        'money'       => 'dollar-sign',
        'dollar'      => 'dollar-sign',
        'lightning'   => 'zap',
        'fast'        => 'zap',
        'magic'       => 'sparkles',
        'refresh'     => 'refresh-cw',
        'reload'      => 'refresh-cw',
        'sync'        => 'refresh-cw',
        'like'        => 'thumbs-up',
        'dislike'     => 'thumbs-down',
        'happy'       => 'smile',
        'sad'         => 'frown',
        'directions'  => 'map',
        'chart'       => 'bar-chart-2',
        'graph'       => 'bar-chart-2',
        'analytics'   => 'bar-chart-2',
        'trending'    => 'trending-up',
        'growth'      => 'trending-up',
        'sort'        => 'arrow-up-down',
        'stop'        => 'square',
        'print'       => 'printer',
        'price'       => 'tag',
    ];

    /**
     * Normalize data-lucide icon names in file content.
     *
     * Applies safe alias mapping server-side so the written file
     * already contains the canonical icon name. This works alongside
     * the client-side alias map in icon-resolver.js as defense in depth.
     */
    private function normalizeDataLucideNames(string $content): string
    {
        return preg_replace_callback(
            '/data-lucide=["\']([^"\']+)["\']/i',
            function (array $m): string {
                $raw = trim(strtolower($m[1]));
                $normalized = str_replace('_', '-', $raw);
                $resolved = self::ICON_ALIASES[$normalized] ?? $normalized;
                if ($resolved !== $raw) {
                    return 'data-lucide="' . $resolved . '"';
                }
                return $m[0];
            },
            $content
        );
    }

    /**
     * Validate data-lucide icon names in written PHP files against assets/icons/.
     *
     * Scans the given list of written file paths for data-lucide="..." references,
     * checks each icon name exists as a .svg file in assets/icons/, and logs any
     * unresolved names for supportability.
     *
     * This is a post-write validation pass — it does not modify files.
     * The inline normalizeDataLucideNames() handles auto-fix during write.
     *
     * @param string[] $writtenPaths Relative file paths that were written
     * @return array{valid: int, missing: array<string, string[]>}
     */
    public function validateIconNames(array $writtenPaths): array
    {
        $iconDir = $this->assetsPath . '/icons';
        $valid = 0;
        $missing = [];  // name => [file1, file2, ...]

        // Build a set of available icon names (without .svg extension)
        $available = [];
        if (is_dir($iconDir)) {
            $files = @scandir($iconDir);
            if ($files !== false) {
                foreach ($files as $file) {
                    if (!str_starts_with($file, '.') && str_ends_with($file, '.svg')) {
                        $available[substr($file, 0, -4)] = true;
                    }
                }
            }
        }

        if (empty($available)) {
            return ['valid' => 0, 'missing' => []];
        }

        foreach ($writtenPaths as $relativePath) {
            if (!str_ends_with($relativePath, '.php') && !str_ends_with($relativePath, '.html')) {
                continue;
            }

            try {
                $absolutePath = $this->resolvePath($relativePath, false);
            } catch (\Throwable) {
                continue;
            }
            if (!file_exists($absolutePath)) {
                continue;
            }

            $content = @file_get_contents($absolutePath);
            if ($content === false || !str_contains($content, 'data-lucide=')) {
                continue;
            }

            if (preg_match_all('/data-lucide=["\']([^"\']+)["\']/i', $content, $matches)) {
                foreach ($matches[1] as $name) {
                    $normalized = str_replace('_', '-', trim(strtolower($name)));
                    $resolved = self::ICON_ALIASES[$normalized] ?? $normalized;

                    if (isset($available[$resolved])) {
                        $valid++;
                    } else {
                        $missing[$resolved][] = $relativePath;
                    }
                }
            }
        }

        // Log any missing icons for supportability
        if (!empty($missing)) {
            Logger::warning('files', 'Unresolved data-lucide icon names', [
                'missing' => array_map(fn($files) => array_unique($files), $missing),
                'valid_count' => $valid,
            ]);
        }

        return ['valid' => $valid, 'missing' => $missing];
    }

    /**
     * Copy the shipped form-handler.js into assets/js/.
     * Always overwrites — ensures bug fixes in the shipped code propagate
     * to existing sites without requiring a full site regeneration.
     */
    private function ensureShippedFormHandler(): void
    {
        $dest = $this->assetsPath . '/js/form-handler.js';
        $source = dirname(__DIR__) . '/static/form-handler.js';

        if (!file_exists($source)) {
            return;
        }

        // Always overwrite if content differs (size check as fast path)
        if (file_exists($dest) && filesize($dest) === filesize($source) && md5_file($dest) === md5_file($source)) {
            return; // Already up to date
        }

        $dir = dirname($dest);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        copy($source, $dest);
    }

    /**
     * Copy the shipped navigation.js into assets/js/.
     *
     * Like form-handler.js: the AI generates a navigation.js, but we
     * replace it with the canonical version that handles:
     *   - Toggle open/close with .is-open class
     *   - Body scroll lock (overflow: hidden)
     *   - Escape key to close
     *   - Close on link click
     *   - Close on overlay click
     *   - Scroll-aware sticky header (.is-scrolled)
     *
     * The AI is still responsible for the HTML structure and CSS styling.
     * This file only handles behavior.
     */
    private function ensureShippedNavigation(): void
    {
        $dest = $this->assetsPath . '/js/navigation.js';
        $source = dirname(__DIR__) . '/static/navigation.js';

        if (!file_exists($source)) {
            return;
        }

        $dir = dirname($dest);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        // Always overwrite — shipped version takes precedence
        copy($source, $dest);
    }

    /**
     * Inject form-handler.js into _partials/footer.php.
     *
     * Called when a content page contains a form but doesn't have </body>
     * (standard partial-based architecture). The footer partial is where
     * </body> lives, so the script tag is injected there.
     */
    private function injectFormHandlerIntoFooter(): void
    {
        $footerPath = $this->resolvePath('_partials/footer.php', true);
        if (!file_exists($footerPath)) {
            return;
        }

        $footer = file_get_contents($footerPath);
        if (str_contains($footer, 'form-handler.js')) {
            return; // Already injected
        }

        if (str_contains($footer, '</body>')) {
            $footer = str_replace(
                '</body>',
                '<script src="/assets/js/form-handler.js" defer></script>' . "\n</body>",
                $footer
            );
            file_put_contents($footerPath, $footer);
        }
    }

    /**
     * Copy the shipped icon-resolver.js into assets/js/.
     *
     * Like navigation.js: the AI may generate an icon-resolver.js, but we
     * replace it with the canonical version that handles:
     *   - data-lucide → inline SVG hydration from /assets/icons/
     *   - Alias mapping for common AI hallucinations
     *   - Graceful fallback for missing icons
     *   - MutationObserver for dynamic content
     *
     * Called unconditionally by PromptEngine after all writes.
     */
    public function ensureShippedIconResolver(): void
    {
        $dest = $this->assetsPath . '/js/icon-resolver.js';
        $source = dirname(__DIR__) . '/static/icon-resolver.js';

        if (!file_exists($source)) {
            return;
        }

        $dir = dirname($dest);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        // Always overwrite — shipped version takes precedence
        copy($source, $dest);
    }

    /**
     * Inject icon-resolver.js into _partials/footer.php.
     *
     * Unconditionally ensures icon-resolver.js is loaded. Handles both
     * partial-based sites (footer.php) and monolithic pages (standalone
     * PHP files with </body>). Called by PromptEngine after all writes.
     */
    public function injectIconResolverIntoFooter(): void
    {
        // 1. Try partial-based: inject into _partials/footer.php
        $footerPath = $this->resolvePath('_partials/footer.php', true);
        if (file_exists($footerPath)) {
            $footer = file_get_contents($footerPath);
            if (!str_contains($footer, 'icon-resolver.js') && str_contains($footer, '</body>')) {
                $footer = str_replace(
                    '</body>',
                    '<script src="/assets/js/icon-resolver.js" defer></script>' . "\n</body>",
                    $footer
                );
                file_put_contents($footerPath, $footer);
            }
            return; // Footer partial exists — partial-based site, done.
        }

        // 2. Monolithic fallback: scan preview PHP files for </body>
        $previewDir = $this->previewPath;
        if (!is_dir($previewDir)) {
            return;
        }

        $phpFiles = glob($previewDir . '/*.php') ?: [];
        foreach ($phpFiles as $file) {
            if (!is_file($file)) {
                continue;
            }
            $content = file_get_contents($file);
            if ($content === false) {
                continue;
            }
            if (str_contains($content, '</body>') && !str_contains($content, 'icon-resolver.js')) {
                $content = str_replace(
                    '</body>',
                    '<script src="/assets/js/icon-resolver.js" defer></script>' . "\n</body>",
                    $content
                );
                file_put_contents($file, $content);
            }
        }
    }

    /**
     * Check whether any active action definitions exist.
     */
    public function hasActiveActions(): bool
    {
        $actionsDir = dirname(__DIR__) . '/data/actions';
        if (!is_dir($actionsDir)) {
            return false;
        }

        foreach (glob($actionsDir . '/*.json') as $file) {
            $content = @file_get_contents($file);
            if ($content !== false) {
                $def = json_decode($content, true);
                if (is_array($def) && ($def['active'] ?? false)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Copy the shipped actions-bar.js and actions-bar.css into the project root.
     *
     * Unlike form-handler.js (which goes to assets/js/), the Actions Bar assets
     * are deployed to the document root during publish because they need to be
     * self-contained alongside the manifest and submit handler.
     */
    public function ensureShippedActionsBar(string $docRoot): void
    {
        $staticDir = dirname(__DIR__) . '/static';

        foreach (['actions-bar.js', 'actions-bar.css'] as $file) {
            $source = $staticDir . '/' . $file;
            $dest = $docRoot . '/' . $file;

            if (!file_exists($source)) {
                continue;
            }

            // Skip if identical
            if (file_exists($dest) && filesize($dest) === filesize($source) && md5_file($dest) === md5_file($source)) {
                continue;
            }

            @copy($source, $dest);
        }
    }

    /**
     * Inject actions-bar.js + CSS into the footer partial.
     *
     * Mirrors injectFormHandlerIntoFooter() — for partial-based sites.
     *
     * @param string|null $docRoot When provided, injects into the production
     *   footer at $docRoot/_partials/footer.php (used during publish).
     *   When null, injects into the preview footer (default).
     */
    public function injectActionsBarIntoFooter(?string $docRoot = null): void
    {
        if ($docRoot !== null) {
            $footerPath = rtrim($docRoot, '/') . '/_partials/footer.php';
        } else {
            $footerPath = $this->resolvePath('_partials/footer.php', true);
        }

        if (!file_exists($footerPath)) {
            return;
        }

        $footer = file_get_contents($footerPath);

        // Compute cache-busting hashes
        $jsHash = '';
        $cssHash = '';
        if ($docRoot !== null) {
            $jsFile = rtrim($docRoot, '/') . '/actions-bar.js';
            $cssFile = rtrim($docRoot, '/') . '/actions-bar.css';
            if (file_exists($jsFile)) $jsHash = substr(md5_file($jsFile), 0, 8);
            if (file_exists($cssFile)) $cssHash = substr(md5_file($cssFile), 0, 8);
        }

        if (str_contains($footer, 'actions-bar.js')) {
            // Already injected — update cache-bust versions
            $changed = false;
            if ($jsHash) {
                $newFooter = preg_replace(
                    '#(actions-bar\.js)(\?v=[a-f0-9]+)?#',
                    '$1?v=' . $jsHash,
                    $footer
                );
                if ($newFooter !== $footer) { $footer = $newFooter; $changed = true; }
            }
            if ($cssHash) {
                $newFooter = preg_replace(
                    '#(actions-bar\.css)(\?v=[a-f0-9]+)?#',
                    '$1?v=' . $cssHash,
                    $footer
                );
                if ($newFooter !== $footer) { $footer = $newFooter; $changed = true; }
            }
            if ($changed) {
                file_put_contents($footerPath, $footer);
            }
            return;
        }

        if (str_contains($footer, '</body>')) {
            $jsVersion = '';
            $cssVersion = '';
            if ($docRoot !== null) {
                $jsFile = rtrim($docRoot, '/') . '/actions-bar.js';
                $cssFile = rtrim($docRoot, '/') . '/actions-bar.css';
                if (file_exists($jsFile)) $jsVersion = '?v=' . substr(md5_file($jsFile), 0, 8);
                if (file_exists($cssFile)) $cssVersion = '?v=' . substr(md5_file($cssFile), 0, 8);
            }
            $injection = '<link rel="stylesheet" href="/actions-bar.css' . $cssVersion . '">' . "\n"
                . '<script src="/actions-bar.js' . $jsVersion . '" defer></script>' . "\n";
            $footer = str_replace('</body>', $injection . '</body>', $footer);
            file_put_contents($footerPath, $footer);
        }
    }

    /**
     * Fix unescaped apostrophes in PHP single-quoted strings.
     *
     * AI models write English contractions inside single-quoted PHP strings:
     *   'description' => 'We're here to help.',
     * This is invalid PHP because the ' in We're closes the string.
     *
     * Strategy: Find lines with => 'text' assignments where the text
     * portion contains word-internal apostrophes (letter'letter, like
     * We're, don't, Let's). Switch to double-quoted strings.
     *
     * This runs BEFORE php -l, so it prevents errors at zero cost.
     */
    private function fixPhpApostrophes(string $content): string
    {
        $lines = explode("\n", $content);
        $changed = false;

        foreach ($lines as $i => $line) {
            // Quick pre-check: must have => ' and a word-internal apostrophe
            if (!str_contains($line, "=> '")) continue;
            // Check for word-internal apostrophe: letter'letter (contraction)
            if (!preg_match("/[a-zA-Z]'[a-zA-Z]/", $line)) continue;

            // This line has a PHP array assignment with a contraction.
            // Find the => 'value' part and reconstruct with double quotes.
            // Pattern: everything up to => ', then the value (which may contain
            // unescaped apostrophes), then the closing pattern (', or '];)
            //
            // Since PHP already sees the contraction-' as closing the string,
            // we can't use a standard regex. Instead, find the first => '
            // and the LAST unescaped ' on the line that's followed by
            // ,  ] ; or end-of-line to determine the true string boundaries.

            $arrowPos = strpos($line, "=> '");
            if ($arrowPos === false) continue;

            $valueStart = $arrowPos + 4; // After => '

            // Find the true end of the intended string value.
            // Look backwards from end of line for closing pattern: ', or '] or ';
            $trimmed = rtrim($line);
            $lastQuote = null;

            // Search from end for a ' that's followed by , ] ; or is at end
            for ($j = strlen($trimmed) - 1; $j > $valueStart; $j--) {
                if ($trimmed[$j] === "'") {
                    $after = substr($trimmed, $j + 1);
                    $after = ltrim($after);
                    if ($after === '' || $after[0] === ',' || $after[0] === ']' || $after[0] === ';' || $after[0] === ')') {
                        $lastQuote = $j;
                        break;
                    }
                }
            }

            if ($lastQuote === null || $lastQuote <= $valueStart) continue;

            $before = substr($line, 0, $arrowPos + 3); // everything up to =>
            $value = substr($line, $valueStart, $lastQuote - $valueStart);
            $after = substr($line, $lastQuote + 1);

            // Escape $ for double-quoted context (prevents variable interpolation)
            $value = str_replace('$', '\\$', $value);

            $lines[$i] = $before . ' "' . $value . '"' . $after;
            $changed = true;
        }

        return $changed ? implode("\n", $lines) : $content;
    }

    /**
     * Decode pre-encoded HTML entities inside PHP page metadata strings.
     *
     * AI models sometimes output HTML entities inside PHP string literals:
     *   'title' => 'Brand &amp; Digital Design Practice',
     *
     * Since header.php already calls htmlspecialchars() on $page['title'],
     * the pre-encoded &amp; gets double-encoded to &amp;amp; in the output.
     *
     * Fix: decode common entities (&amp; &lt; &gt; &quot; &#039;) back to
     * their plain-text equivalents in 'title' and 'description' values.
     * Only targets lines matching 'key' => 'value' patterns.
     */
    private function fixPreEncodedHtmlEntities(string $content): string
    {
        // Target specific metadata keys — these are the values that
        // header.php passes through htmlspecialchars()
        $keys = ['title', 'description'];

        $changed = false;
        $lines = explode("\n", $content);

        foreach ($lines as $i => $line) {
            // Quick pre-check: must contain => and one of the target keys
            if (!str_contains($line, '=>')) {
                continue;
            }

            // Match: 'title' => '...' or "title" => '...' (with optional whitespace)
            foreach ($keys as $key) {
                $pattern = "/(['\"]" . preg_quote($key) . "['\"])\\s*=>\\s*['\"](.+?)['\"]/";
                if (!preg_match($pattern, $line, $m)) {
                    continue;
                }

                $value = $m[2];
                // Only decode if it actually contains HTML entities
                if (!str_contains($value, '&') || !preg_match('/&(?:amp|lt|gt|quot|#0?39);/', $value)) {
                    continue;
                }

                $decoded = html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                if ($decoded !== $value) {
                    $lines[$i] = str_replace($value, $decoded, $line);
                    $changed = true;
                }
            }
        }

        return $changed ? implode("\n", $lines) : $content;
    }

    /**
     * Inject standard design tokens into style.css.
     *
     * The AI only outputs colors, fonts, and layout width. Standard tokens
     * (type scale, spacing, borders, shadows) are injected programmatically
     * so we don't waste prompt tokens on values that never change.
     *
     * Tokens are inserted after the closing `}` of the `:root` block.
     * If a token already exists (AI included it), we skip it.
     */
    private function injectStandardTokens(string $content): string
    {
        $standardTokens = [
            // Type scale
            '--text-xs' => '0.75rem',
            '--text-sm' => '0.875rem',
            '--text-base' => '1rem',
            '--text-lg' => '1.125rem',
            '--text-xl' => '1.25rem',
            '--text-2xl' => '1.5rem',
            '--text-3xl' => '1.875rem',
            '--text-4xl' => '2.25rem',
            '--text-5xl' => '3rem',
            '--text-6xl' => '3.75rem',
            // Spacing
            '--space-xs' => '0.25rem',
            '--space-sm' => '0.5rem',
            '--space-md' => '1rem',
            '--space-lg' => '1.5rem',
            '--space-xl' => '2rem',
            '--space-2xl' => '3rem',
            '--space-3xl' => '4rem',
            '--space-4xl' => '6rem',
            // Borders
            '--radius-default' => '4px',
            '--radius-sm' => '4px',
            '--radius-md' => '8px',
            '--radius-lg' => '12px',
            '--radius-xl' => '16px',
            '--radius-full' => '9999px',
            // Shadows
            '--shadow-sm' => '0 1px 3px rgba(0, 0, 0, 0.08)',
            '--shadow-md' => '0 4px 12px rgba(0, 0, 0, 0.1)',
            '--shadow-lg' => '0 10px 30px rgba(0, 0, 0, 0.12)',
            '--shadow-xl' => '0 20px 40px rgba(0, 0, 0, 0.15)',
        ];

        // Build injection block with only missing tokens
        $inject = [];
        foreach ($standardTokens as $prop => $value) {
            // Skip if already defined anywhere in the file
            if (str_contains($content, $prop . ':') || str_contains($content, $prop . ' :')) {
                continue;
            }
            $inject[] = "  {$prop}: {$value};";
        }

        if (empty($inject)) {
            // All tokens already present
            return $this->ensureBaseResets($content);
        }

        $tokenBlock = "\n  /* ── Standard Tokens (auto-injected) ── */\n"
            . implode("\n", $inject) . "\n";

        // Insert before the closing } of :root
        if (preg_match('/(:root\s*\{[^}]*)(})/s', $content, $m, PREG_OFFSET_CAPTURE)) {
            $insertPos = $m[2][1]; // position of the closing }
            $content = substr($content, 0, $insertPos) . $tokenBlock . substr($content, $insertPos);
        } else {
            // No :root block — wrap tokens in one and prepend
            $content = ":root {\n" . implode("\n", $inject) . "\n}\n\n" . $content;
        }

        return $this->ensureBaseResets($content);
    }

    /**
     * Ensure html/body base resets are present in style.css.
     */
    private function ensureBaseResets(string $content): string
    {
        if (!str_contains($content, 'scroll-behavior')) {
            $content .= "\nhtml { scroll-behavior: smooth; }\n";
        }
        if (!preg_match('/body\s*\{[^}]*margin\s*:/s', $content)) {
            $content .= "body { margin: 0; }\n";
        }

        // Ensure font-family is applied using the design token variables.
        // Without this, --font-body and --font-heading are defined but orphaned —
        // no selector references them, so the browser falls back to its default serif.
        if (!str_contains($content, 'font-family')) {
            $content .= "\n/* ── Base typography (auto-injected) ── */\n";
            $content .= "body { font-family: var(--font-body, 'Inter', -apple-system, system-ui, sans-serif); }\n";
            $content .= "h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading, var(--font-body, 'Inter', -apple-system, system-ui, sans-serif)); }\n";
        }

        return $content;
    }

    /**
     * Extract inline <script> blocks from a PHP file into a separate JS file.
     *
     * AI models frequently dump JavaScript directly into PHP files.
     * This causes:
     * - PHP syntax errors when JS contains apostrophes or special chars
     * - Bloated PHP files that are harder to auto-repair
     * - Unnecessary rewrites of JS when only HTML/PHP changes
     *
     * Strategy: find all <script>...</script> blocks (without src attribute),
     * combine their contents into a single JS file, and replace the inline
     * blocks with a <script src="..."> reference.
     */
    private function extractInlineScripts(string $phpPath, string $content): string
    {
        // Match <script>...</script> but NOT <script src="...">
        $pattern = '/<script(?:\s+(?!src\b)[^>]*)?>(\s*\n?)([\s\S]*?)<\/script>/i';

        if (!preg_match_all($pattern, $content, $matches, PREG_SET_ORDER)) {
            return $content;
        }

        // Collect all inline JS
        $jsBlocks = [];
        foreach ($matches as $match) {
            $js = trim($match[2]);
            if ($js !== '') {
                $jsBlocks[] = $js;
            }
        }

        if (empty($jsBlocks)) {
            return $content;
        }

        // Derive the JS filename from the PHP path:
        //   index.php → assets/js/index.js
        //   _partials/nav.php → assets/js/nav.js
        //   about.php → assets/js/about.js
        $basename = pathinfo(basename($phpPath), PATHINFO_FILENAME);
        $jsRelPath = "assets/js/{$basename}.js";
        $jsAbsPath = $this->resolvePath($jsRelPath, true);

        // Ensure directory exists
        $jsDir = dirname($jsAbsPath);
        if (!is_dir($jsDir)) {
            mkdir($jsDir, 0755, true);
        }

        // Combine JS blocks, wrap in IIFE for scope isolation
        $combinedJs = "// Auto-extracted from {$phpPath}\n";
        if (count($jsBlocks) === 1) {
            $combinedJs .= $jsBlocks[0] . "\n";
        } else {
            foreach ($jsBlocks as $i => $block) {
                $combinedJs .= "// --- Block " . ($i + 1) . " ---\n";
                $combinedJs .= $block . "\n\n";
            }
        }

        // Write the JS file atomically
        $tmpPath = $jsAbsPath . '.tmp.' . getmypid();
        file_put_contents($tmpPath, $combinedJs);
        rename($tmpPath, $jsAbsPath);

        // Replace ALL inline script blocks in the PHP content with a single
        // <script src> reference at the position of the first match
        $firstReplaced = false;
        $scriptTag = '<script src="/assets/js/' . $basename . '.js"></script>';

        $content = preg_replace_callback($pattern, function ($match) use (&$firstReplaced, $scriptTag) {
            $js = trim($match[2]);
            if ($js === '') {
                return $match[0]; // Leave empty scripts alone
            }
            if (!$firstReplaced) {
                $firstReplaced = true;
                return $scriptTag;
            }
            return ''; // Remove subsequent inline scripts
        }, $content);

        return $content;
    }

    /**
     * Lint a PHP file after writing.
     *
     * Uses token_get_all() to check for syntax errors entirely in-process.
     * No CLI binary needed — works on every hosting environment, including
     * shared hosting where exec() is disabled.
     *
     * Returns a warning string if the file has errors, or null if it's clean.
     */
    private function lintPhpFile(string $absolutePath, string $relativePath): ?string
    {
        $content = @file_get_contents($absolutePath);
        if ($content === false) {
            return null; // Can't read → skip
        }

        try {
            // token_get_all() throws ParseError on syntax errors
            @token_get_all($content, TOKEN_PARSE);
        } catch (\ParseError $e) {
            $errorMsg = $e->getMessage();
            $errorLine = $e->getLine();

            Logger::warning('files', 'PHP syntax error detected', [
                'path'  => $relativePath,
                'error' => $errorMsg,
                'line'  => $errorLine,
            ]);

            return "PHP syntax error in {$relativePath} on line {$errorLine}: {$errorMsg}";
        }

        return null;
    }

    /**
     * Delete a file from preview or assets.
     *
     * Silently succeeds if the file doesn't exist (idempotent).
     */
    public function deleteFile(string $relativePath): void
    {
        $absolutePath = $this->resolvePath($relativePath, true);

        if (file_exists($absolutePath)) {
            unlink($absolutePath);
        }
    }

    /**
     * Read a file's content from preview or assets.
     *
     * Returns null if the file doesn't exist.
     */
    public function readFile(string $relativePath): ?string
    {
        $absolutePath = $this->resolvePath($relativePath, false);
        if (!is_file($absolutePath)) {
            return null;
        }

        $content = file_get_contents($absolutePath);
        if ($content === false) {
            throw new RuntimeException("Cannot read file: {$relativePath}");
        }

        return $content;
    }

    /**
     * List all PHP page files in the preview directory.
     *
     * Only lists root-level .php files (not _partials/).
     *
     * @return array<int, array{path: string, slug: string, size: int, modified: string}>
     */
    public function listPreviewFiles(): array
    {
        $filesBySlug = [];

        $phpMatches = glob($this->previewPath . '/*.php') ?: [];
        foreach ($phpMatches as $file) {
            $filename = basename($file);
            $slug = $filename === 'index.php' ? 'index' : pathinfo($filename, PATHINFO_FILENAME);

            $filesBySlug[$slug] = [
                'path'     => $filename,
                'slug'     => $slug,
                'size'     => filesize($file),
                'modified' => gmdate('Y-m-d\TH:i:s\Z', filemtime($file)),
            ];
        }

        // Legacy HTML fallback: only include when no PHP page with same slug exists.
        $htmlMatches = glob($this->previewPath . '/*.html') ?: [];
        foreach ($htmlMatches as $file) {
            $filename = basename($file);
            $slug = $filename === 'index.html' ? 'index' : pathinfo($filename, PATHINFO_FILENAME);

            if (isset($filesBySlug[$slug])) {
                continue;
            }

            $filesBySlug[$slug] = [
                'path'     => $filename,
                'slug'     => $slug,
                'size'     => filesize($file),
                'modified' => gmdate('Y-m-d\TH:i:s\Z', filemtime($file)),
            ];
        }

        ksort($filesBySlug);
        return array_values($filesBySlug);
    }

    /**
     * List contents of a directory within preview/ for folder navigation.
     *
     * Returns both subdirectories and page files in the given relative path.
     * Directories prefixed with _ (like _partials) are excluded.
     *
     * @param string $relativeDir Relative path within preview/, e.g. '' or 'blog/2025'
     * @return array{directories: array, files: array}
     */
    public function listPreviewDirectory(string $relativeDir = ''): array
    {
        $relativeDir = trim(str_replace('\\', '/', $relativeDir), '/');

        $targetDir = $this->previewPath;
        if ($relativeDir !== '') {
            $targetDir .= '/' . $relativeDir;
        }

        // Security: verify the target stays within preview/
        if (!is_dir($targetDir)) {
            return ['directories' => [], 'files' => []];
        }

        $realTarget = realpath($targetDir) ?: $targetDir;
        $realPreview = realpath($this->previewPath) ?: $this->previewPath;
        if (!$this->pathWithinBase($realTarget, $realPreview)) {
            return ['directories' => [], 'files' => []];
        }

        $directories = [];
        $files = [];

        $items = scandir($targetDir);
        if ($items === false) {
            return ['directories' => [], 'files' => []];
        }

        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;
            if (str_starts_with($item, '_')) continue; // Skip _partials, etc.
            if (str_starts_with($item, '.')) continue; // Skip hidden files

            $fullPath = $targetDir . '/' . $item;

            if (is_dir($fullPath)) {
                // Count items inside (files + subdirs, excluding hidden/_prefixed)
                $childCount = 0;
                $children = scandir($fullPath);
                if ($children !== false) {
                    foreach ($children as $child) {
                        if ($child === '.' || $child === '..' || str_starts_with($child, '_') || str_starts_with($child, '.')) continue;
                        $childCount++;
                    }
                }

                $directories[] = [
                    'type'       => 'directory',
                    'name'       => $item,
                    'path'       => $relativeDir !== '' ? $relativeDir . '/' . $item : $item,
                    'item_count' => $childCount,
                ];
            } elseif (preg_match('/\.(php|html)$/i', $item)) {
                $slug = pathinfo($item, PATHINFO_FILENAME);
                if ($item === 'index.php' || $item === 'index.html') {
                    $slug = 'index';
                }

                $relativePath = $relativeDir !== '' ? $relativeDir . '/' . $item : $item;

                $files[] = [
                    'type'     => 'file',
                    'path'     => $relativePath,
                    'slug'     => $slug,
                    'size'     => filesize($fullPath),
                    'modified' => gmdate('Y-m-d\TH:i:s\Z', filemtime($fullPath)),
                ];
            }
        }

        // Sort: directories first (alphabetically), then files
        usort($directories, fn($a, $b) => strcasecmp($a['name'], $b['name']));
        usort($files, fn($a, $b) => strcasecmp($a['slug'], $b['slug']));

        return ['directories' => $directories, 'files' => $files];
    }

    /**
     * Recursively list ALL page files across the entire preview directory tree.
     *
     * Returns a flat array of files (no directory grouping). Skips directories
     * prefixed with _ (like _partials) and hidden/dot files.
     *
     * @return array<int, array{path: string, slug: string, size: int, modified: string}>
     */
    public function listPreviewFilesRecursive(): array
    {
        $files = [];
        $this->scanPreviewDirRecursive($this->previewPath, '', $files);
        usort($files, function ($a, $b) {
            // Homepage first
            if ($a['slug'] === 'index' && $b['slug'] !== 'index') return -1;
            if ($b['slug'] === 'index' && $a['slug'] !== 'index') return 1;
            return strcasecmp($a['path'], $b['path']);
        });
        return $files;
    }

    /**
     * Internal recursive scanner for listPreviewFilesRecursive.
     */
    private function scanPreviewDirRecursive(string $absoluteDir, string $relativePrefix, array &$results): void
    {
        $items = @scandir($absoluteDir);
        if ($items === false) return;

        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;
            if (str_starts_with($item, '.')) continue;   // hidden files
            if (str_starts_with($item, '_')) continue;    // _partials, etc.

            $fullPath = $absoluteDir . '/' . $item;
            $relativePath = $relativePrefix !== '' ? $relativePrefix . '/' . $item : $item;

            if (is_dir($fullPath)) {
                $this->scanPreviewDirRecursive($fullPath, $relativePath, $results);
            } elseif (preg_match('/\.(php|html)$/i', $item)) {
                $slug = pathinfo($item, PATHINFO_FILENAME);
                if ($item === 'index.php' || $item === 'index.html') {
                    $slug = 'index';
                }

                $results[] = [
                    'path'     => $relativePath,
                    'slug'     => $slug,
                    'size'     => filesize($fullPath),
                    'modified' => gmdate('Y-m-d\TH:i:s\Z', filemtime($fullPath)),
                ];
            }
        }
    }

    /**
     * Sync the pages database table with files on disk.
     *
     * Scans preview/ for PHP page files, adds missing pages,
     * removes stale records. Called after every AI operation
     * to keep the registry accurate.
     *
     * Also infers nav_order from the nav partial when pages are
     * missing ordering data, so the Studio grid matches the
     * website's actual navigation order.
     */
    public function syncPageRegistry(): void
    {
        $now = now();
        $files = $this->listPreviewFiles();
        $existingSlugs = [];

        foreach ($files as $file) {
            $existingSlugs[] = $file['slug'];

            // Check if page exists in DB
            $existing = $this->db->queryOne(
                'SELECT id FROM pages WHERE slug = ?',
                [$file['slug']]
            );

            if ($existing === null) {
                // Determine title from PHP file if possible
                $title = $this->extractTitle($file['path']);

                $this->db->insert('pages', [
                    'slug'       => $file['slug'],
                    'title'      => $title ?? ucfirst(str_replace('-', ' ', $file['slug'])),
                    'file_path'  => $file['path'],
                    'is_homepage' => $file['slug'] === 'index' ? 1 : 0,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // Remove pages whose files no longer exist
        if (!empty($existingSlugs)) {
            $placeholders = implode(',', array_fill(0, count($existingSlugs), '?'));
            $this->db->delete(
                'pages',
                "slug NOT IN ({$placeholders}) AND page_type = 'page'",
                $existingSlugs
            );
        } else {
            $this->db->delete('pages', "page_type = 'page'");
        }

        // Infer nav_order from the nav partial for pages that are missing it.
        // This ensures the Studio grid matches the website's actual nav order.
        $this->syncNavOrderFromPartial();
    }

    /**
     * Parse the nav partial to infer nav_order for pages without one.
     *
     * Reads the <a href="..."> links from _partials/nav.php and assigns
     * sequential nav_order values to matching pages that currently have
     * nav_order = NULL.
     */
    private function syncNavOrderFromPartial(): void
    {
        // Only run if any pages are missing nav_order
        $missingCount = $this->db->queryOne(
            "SELECT COUNT(*) as cnt FROM pages WHERE nav_order IS NULL AND page_type = 'page'"
        );
        if (!$missingCount || (int) $missingCount['cnt'] === 0) {
            return;
        }

        $navContent = $this->readFile('_partials/nav.php');
        if ($navContent === null) {
            return;
        }

        // Extract href slugs from nav links in order
        if (!preg_match_all('/<a\b[^>]*\bhref\s*=\s*["\']([^"\']+)["\']/', $navContent, $matches)) {
            return;
        }

        $order = 1;
        foreach ($matches[1] as $href) {
            // Normalize href to slug: "/" => "index", "/about" => "about", "/about.php" => "about"
            $href = trim($href, '/');
            $href = preg_replace('/\.php$/', '', $href) ?? $href;
            $slug = $href === '' ? 'index' : $href;

            // Only update pages that don't already have a nav_order
            $page = $this->db->queryOne(
                "SELECT id, nav_order FROM pages WHERE slug = ?",
                [$slug]
            );

            if ($page && $page['nav_order'] === null) {
                $this->db->update('pages', ['nav_order' => $order], 'id = ?', [(int) $page['id']]);
            }

            $order++;
        }
    }

    /**
     * Clear all AI-generated site files and database records.
     *
     * Removes: preview PHP pages, _partials, CSS files, JS files,
     *          snapshot zips, collection data (not schemas),
     *          form definitions and submission database.
     * Preserves: user-uploaded images/files, Lucide icons, _studio internals,
     *            collection schemas, user settings, API keys, prompt_log (usage data).
     * Clears: pages, conversations, messages, revisions,
     *         snapshots, collections database tables.
     * Removes: _studio/revisions/ and _studio/data/snapshots/ contents.
     *
     * @return array{pages_deleted: int, files_deleted: int, tables_cleared: string[]}
     */
    public function clearSite(): array
    {
        $pagesDeleted = 0;
        $filesDeleted = 0;

        // 1. Delete all PHP page files from preview/
        $pageFiles = glob($this->previewPath . '/*.php') ?: [];
        foreach ($pageFiles as $file) {
            if (is_file($file)) {
                unlink($file);
                $pagesDeleted++;
                $filesDeleted++;
            }
        }

        // 2. Delete _partials/ directory from preview
        $partialsPath = $this->previewPath . '/_partials';
        if (is_dir($partialsPath)) {
            $filesDeleted += $this->removeDirectoryContents($partialsPath);
            rmdir($partialsPath);
        }

        // 3. Delete AI-generated CSS files (style.css, tailwind.css, legacy foundation.css)
        $cssDir = $this->assetsPath . '/css';
        if (is_dir($cssDir)) {
            $cssFiles = glob($cssDir . '/*.css') ?: [];
            foreach ($cssFiles as $file) {
                if (is_file($file)) {
                    unlink($file);
                    $filesDeleted++;
                }
            }
        }

        // 4. Delete AI-generated JS files (skip shipped handlers)
        $jsDir = $this->assetsPath . '/js';
        if (is_dir($jsDir)) {
            $skipJs = ['form-handler.js', 'actions-bar.js', 'navigation.js', 'icon-resolver.js'];
            $jsFiles = glob($jsDir . '/*.js') ?: [];
            foreach ($jsFiles as $file) {
                if (is_file($file) && !in_array(basename($file), $skipJs, true)) {
                    unlink($file);
                    $filesDeleted++;
                }
            }
        }

        // 4b. Delete AI-generated data layer files
        $dataDir = $this->assetsPath . '/data';
        if (is_dir($dataDir)) {
            $filesDeleted += $this->removeDirectoryContents($dataDir);
            rmdir($dataDir);
        }

        // 4c. Delete AI-generated form definitions
        $formsDir = $this->assetsPath . '/forms';
        if (is_dir($formsDir)) {
            $filesDeleted += $this->removeDirectoryContents($formsDir);
            rmdir($formsDir);
        }

        // 4c-ii. Delete form submissions database
        $submissionsDb = dirname($this->assetsPath) . '/_data/submissions.db';
        foreach ([$submissionsDb, $submissionsDb . '-journal', $submissionsDb . '-wal', $submissionsDb . '-shm'] as $dbFile) {
            if (file_exists($dbFile)) {
                @unlink($dbFile);
                $filesDeleted++;
            }
        }

        // ── 4d. Delete published root-level files ──
        // When a site is published, pages and AEO files are copied to the
        // document root. We must clean those up too, otherwise the old
        // published site keeps showing after a reset.
        $rootDir = dirname($this->assetsPath);  // project root

        // Published PHP page files (index.php, about.php, etc.)
        // Keep only shipped core files that are NOT AI-generated.
        $shippedRootFiles = ['submit.php', 'LocalValetDriver.php'];
        $rootPhpFiles = glob($rootDir . '/*.php') ?: [];
        foreach ($rootPhpFiles as $file) {
            $basename = basename($file);
            if (!in_array($basename, $shippedRootFiles, true)) {
                @unlink($file);
                $pagesDeleted++;
                $filesDeleted++;
            }
        }

        // AEO-generated files
        $aeoFiles = ['llms.txt', 'robots.txt', 'mcp.php'];
        foreach ($aeoFiles as $aeoFile) {
            $aeoPath = $rootDir . '/' . $aeoFile;
            if (file_exists($aeoPath)) {
                @unlink($aeoPath);
                $filesDeleted++;
            }
        }

        // ── Agentic files ──
        // Published actions files at root
        $actionsPublished = $rootDir . '/actions';
        if (is_dir($actionsPublished)) {
            $filesDeleted += $this->removeDirectoryContents($actionsPublished);
            @rmdir($actionsPublished);
        }

        // Published actions-bar assets at root
        foreach (['actions-bar.js', 'actions-bar.css'] as $barFile) {
            $barPath = $rootDir . '/' . $barFile;
            if (file_exists($barPath)) {
                @unlink($barPath);
                $filesDeleted++;
            }
        }

        // Actions database
        $actionsDb = $rootDir . '/_data/actions.db';
        foreach ([$actionsDb, $actionsDb . '-journal', $actionsDb . '-wal', $actionsDb . '-shm'] as $dbFile) {
            if (file_exists($dbFile)) {
                @unlink($dbFile);
                $filesDeleted++;
            }
        }

        // Action definitions (user-created data in _studio/data/actions/)
        $actionsDataDir = dirname(__DIR__) . '/data/actions';
        if (is_dir($actionsDataDir)) {
            $filesDeleted += $this->removeDirectoryContents($actionsDataDir);
        }

        // Published _partials/ at root
        $rootPartials = $rootDir . '/_partials';
        if (is_dir($rootPartials)) {
            $filesDeleted += $this->removeDirectoryContents($rootPartials);
        }

        // 5. Clear revision snapshot files
        $revisionsDir = dirname(__DIR__) . '/revisions';
        if (is_dir($revisionsDir)) {
            $this->removeDirectoryContents($revisionsDir);
        }

        // 5b. Remove publish manifest so stale file deletions don't apply to a fresh site.
        $publishManifest = dirname(__DIR__) . '/data/published-manifest.json';
        if (file_exists($publishManifest)) {
            unlink($publishManifest);
            $filesDeleted++;
        }

        // 5c. Clear snapshot zip files
        $snapshotsDataDir = dirname(__DIR__) . '/data/snapshots';
        if (is_dir($snapshotsDataDir)) {
            $filesDeleted += $this->removeDirectoryContents($snapshotsDataDir);
        }

        // 5d. Clear collection data (keep _schema/ which defines the collection structure)
        $collectionsDir = dirname(__DIR__) . '/data/collections';
        if (is_dir($collectionsDir)) {
            $items = new \DirectoryIterator($collectionsDir);
            foreach ($items as $item) {
                if ($item->isDot()) continue;
                if ($item->getFilename() === '_schema') continue; // preserve schema definitions
                $itemPath = $item->getPathname();
                if ($item->isDir()) {
                    $filesDeleted += $this->removeDirectoryContents($itemPath);
                    @rmdir($itemPath);
                } else {
                    @unlink($itemPath);
                    $filesDeleted++;
                }
            }
        }

        // 6. Clear database tables (preserve users, sessions, settings, prompt_log)
        // prompt_log is usage accounting — it persists across design switches
        // and site resets. Only "Reset installation" (which deletes the entire
        // database file) wipes it.
        $tablesToClear = ['pages', 'conversations', 'revisions', 'snapshots', 'collections'];
        foreach ($tablesToClear as $table) {
            $this->db->exec("DELETE FROM {$table}");
        }

        // Messages are in conversations via foreign key, but clear explicitly
        // in case FK cascade isn't set up
        try {
            $this->db->exec("DELETE FROM messages");
            $tablesToClear[] = 'messages';
        } catch (\Throwable $e) {
            // Table may not exist yet
        }

        // Reset revision pointer so UI/undo state can't point to deleted revisions.
        $settings = new Settings($this->db);
        $settings->set('revision_pointer', 0);

        // Restore the shipped default landing page (shows site name + tagline).
        // The AI-generated index.php overwrites this on publish; we restore it on reset.
        $shippedDefault = dirname(__DIR__) . '/data/default-index.php';
        if (file_exists($shippedDefault)) {
            @copy($shippedDefault, $rootDir . '/index.php');
        }

        return [
            'pages_deleted'  => $pagesDeleted,
            'files_deleted'  => $filesDeleted,
            'tables_cleared' => $tablesToClear,
        ];
    }

    /**
     * Recursively remove all files and subdirectories inside a directory.
     *
     * The directory itself is NOT removed — only its contents.
     *
     * @return int Number of files deleted
     */
    private function removeDirectoryContents(string $dir): int
    {
        $count = 0;
        $items = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($items as $item) {
            if ($item->isDir()) {
                rmdir($item->getPathname());
            } else {
                unlink($item->getPathname());
                $count++;
            }
        }

        return $count;
    }

    /**
     * Merge a partial update into an existing JSON file.
     *
     * Used for memory.json and design-intelligence.json — files that
     * accumulate knowledge across conversations. The AI sends deltas
     * (set/remove), not full replacements.
     *
     * Policy: only assets/data/*.json files can be merged.
     *
     * --- Design decisions (read before modifying) ---
     *
     * FLAT MERGE ONLY (top-level keys). No deep/nested patching.
     * Why: deep merge requires conflict resolution strategy (what
     * happens when the AI sets a nested key that was manually edited?).
     * Flat merge is deterministic — a key is overwritten or removed,
     * full stop. The AI controls data shape via the value it sets.
     * If it wants nested structure, the entire value is the nested object.
     *
     * STRICT PATH ENFORCEMENT (assets/data/*.json only).
     * Why: merge bypasses the preview sandbox — writes go directly
     * to production. Limiting to data files keeps the blast radius
     * small. If you're tempted to allow merge on site.json or other
     * files, remember that merge operations are invisible to the user
     * (no preview step). Data files are ephemeral knowledge; page
     * files are the user's visible website. Different trust levels.
     *
     * @param string $relativePath Relative path (e.g. "assets/data/memory.json")
     * @param array  $delta       {"set": {key: value, ...}, "remove": [key, ...]}
     */
    private function mergeJsonFile(string $relativePath, array $delta): void
    {
        // Policy enforcement: merge only allowed on assets/data/*.json
        if (!preg_match('#^assets/data/[a-zA-Z0-9_.-]+\.json$#', $relativePath)) {
            throw new RuntimeException(
                "Merge not allowed on '{$relativePath}' — only assets/data/*.json files support merge."
            );
        }

        $absolutePath = $this->resolvePath($relativePath, true);

        // Read existing file, or start from empty object
        $existing = [];
        if (file_exists($absolutePath)) {
            $raw = file_get_contents($absolutePath);
            if ($raw !== false && trim($raw) !== '') {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) {
                    $existing = $decoded;
                }
            }
        }

        // Apply "set" entries — top-level key overwrites, any value type
        $setEntries = $delta['set'] ?? [];
        if (!is_array($setEntries)) {
            $setEntries = [];
        }

        $removeEntries = $delta['remove'] ?? [];
        if (!is_array($removeEntries)) {
            $removeEntries = [];
        }

        // Warn on no-op merge (debugging aid for prompt tuning)
        if (empty($setEntries) && empty($removeEntries)) {
            error_log("[VoxelSite] No-op merge on {$relativePath} — delta has no set/remove entries");
        }

        foreach ($setEntries as $key => $value) {
            $existing[$key] = $value;
        }

        // Apply "remove" entries — delete top-level keys
        foreach ($removeEntries as $key) {
            if (is_string($key) || is_int($key)) {
                unset($existing[$key]);
            }
        }

        // Write back atomically (same pattern as writeFile)
        $encoded = json_encode(
            $existing,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );

        if ($encoded === false) {
            throw new RuntimeException("Cannot encode merged JSON for: {$relativePath}");
        }

        // Ensure parent directory exists
        $dir = dirname($absolutePath);
        if (!is_dir($dir)) {
            if (!mkdir($dir, 0755, true)) {
                throw new RuntimeException("Cannot create directory: {$dir}");
            }
        }

        $tmpPath = $absolutePath . '.tmp.' . getmypid();
        $result = file_put_contents($tmpPath, $encoded . "\n");

        if ($result === false) {
            @unlink($tmpPath);
            throw new RuntimeException("Cannot write merged file: {$relativePath}");
        }

        if (!rename($tmpPath, $absolutePath)) {
            @unlink($tmpPath);
            throw new RuntimeException("Cannot finalize merged file: {$relativePath}");
        }
    }

    /**
     * Resolve a relative file path to an absolute path.
     *
     * PHP page files go to preview/. _partials/ go to preview/_partials/.
     * Asset files go to /assets/.
     * All paths are validated against the allowed base directory to
     * prevent directory traversal.  Logical (unresolved) path containment
     * is checked first so symlinked deployments (Forge, Envoyer) work,
     * then a realpath() fallback for extra safety.
     */
    private function resolvePath(string $relativePath, bool $forWrite = false): string
    {
        $normalizedPath = $this->normalizeRelativePath($relativePath);

        // Keep both the raw (logical) and realpath-resolved bases.
        // Logical paths work across symlink boundaries; resolved paths
        // serve as a secondary safety net.
        $previewBase  = $this->previewPath;
        $assetsBase   = $this->assetsPath;
        $promptsBase  = $this->promptsPath;
        $customBase   = $this->customPromptsPath;

        if (str_starts_with($normalizedPath, 'assets/')) {
            $assetRelativePath = substr($normalizedPath, strlen('assets/'));
            if ($assetRelativePath === '') {
                throw new RuntimeException("Invalid file path: {$relativePath}");
            }
            $baseDir = $assetsBase;
            $absolutePath = rtrim($assetsBase, '/\\') . '/' . $assetRelativePath;
        } elseif (str_starts_with($normalizedPath, '_prompts/')) {
            $promptRelativePath = substr($normalizedPath, strlen('_prompts/'));
            if ($promptRelativePath === '') {
                throw new RuntimeException("Invalid file path: {$relativePath}");
            }
            
            // Core fallback logic for updater overwrite protection
            if ($forWrite) {
                // Always write to custom_prompts directory so updater doesn't kill modifications
                $baseDir = $customBase;
                $absolutePath = rtrim($customBase, '/\\') . '/' . $promptRelativePath;
                $dir = dirname($absolutePath);
                if (!is_dir($dir)) {
                    mkdir($dir, 0755, true);
                }
            } else {
                // Read from custom_prompts if exists, otherwise fallback to vanilla prompts
                $customPath = rtrim($customBase, '/\\') . '/' . $promptRelativePath;
                if (is_file($customPath)) {
                    $baseDir = $customBase;
                    $absolutePath = $customPath;
                } else {
                    $baseDir = $promptsBase;
                    $absolutePath = rtrim($promptsBase, '/\\') . '/' . $promptRelativePath;
                }
            }
        } else {
            $baseDir = $previewBase;
            $absolutePath = rtrim($previewBase, '/\\') . '/' . $normalizedPath;
        }

        $parentDir = dirname($absolutePath);
        $existingParent = $this->findExistingParentDirectory($parentDir);
        if ($existingParent === null) {
            throw new RuntimeException("Cannot resolve directory for: {$relativePath}");
        }

        // 1) Logical (symlink-safe) containment check — works even when
        //    symlinks make realpath() resolve to a different mount.
        if ($this->pathWithinBase($existingParent, $baseDir)) {
            return $absolutePath;
        }

        // 2) Fallback: realpath()-based containment for non-symlink setups
        $realParent = realpath($existingParent);
        $realBase   = realpath($baseDir);
        if ($realParent !== false && $realBase !== false
            && $this->pathWithinBase($realParent, $realBase)) {
            return $absolutePath;
        }

        throw new RuntimeException(
            "Security: file path resolves outside allowed directories: {$relativePath}"
        );
    }

    private function normalizeRelativePath(string $relativePath): string
    {
        $path = trim(str_replace('\\', '/', $relativePath));
        if ($path === '') {
            throw new RuntimeException('File path cannot be empty.');
        }

        if (str_contains($path, "\0") || str_starts_with($path, '/')
            || preg_match('/^[A-Za-z]:\//', $path)) {
            throw new RuntimeException("Invalid file path: {$relativePath}");
        }

        $segments = [];
        foreach (explode('/', $path) as $segment) {
            if ($segment === '' || $segment === '.') {
                continue;
            }
            if ($segment === '..') {
                throw new RuntimeException("Security: directory traversal blocked: {$relativePath}");
            }
            if (!preg_match('/^[A-Za-z0-9_.-]+$/', $segment)) {
                throw new RuntimeException("Invalid path segment in: {$relativePath}");
            }
            $segments[] = $segment;
        }

        if ($segments === []) {
            throw new RuntimeException("Invalid file path: {$relativePath}");
        }

        return implode('/', $segments);
    }

    private function findExistingParentDirectory(string $path): ?string
    {
        $current = $path;
        for ($i = 0; $i < 64; $i++) {
            if (is_dir($current)) {
                return $current;
            }
            $parent = dirname($current);
            if ($parent === $current) {
                return null;
            }
            $current = $parent;
        }

        return null;
    }

    private function pathWithinBase(string $path, string $base): bool
    {
        $normalizedPath = rtrim(str_replace('\\', '/', $path), '/');
        $normalizedBase = rtrim(str_replace('\\', '/', $base), '/');

        return $normalizedPath === $normalizedBase
            || str_starts_with($normalizedPath, $normalizedBase . '/');
    }

    /**
     * Extract the page title from a PHP page file in preview.
     *
     * Looks for the $page['title'] variable assignment first (PHP pages),
     * then falls back to <title> tag extraction.
     */
    private function extractTitle(string $filename): ?string
    {
        $path = $this->previewPath . '/' . $filename;
        if (!file_exists($path)) {
            return null;
        }

        $content = file_get_contents($path);
        if ($content === false) {
            return null;
        }

        // Try PHP $page array first: $page = ['title' => 'About Us', ...]
        if (preg_match('/[\'"]title[\'"]\s*=>\s*[\'"](.*?)[\'"]/i', $content, $match)) {
            return trim($match[1]);
        }

        // Fallback: try <title> tag (for partials like header.php)
        if (preg_match('/<title>([^<]+)<\/title>/i', $content, $match)) {
            return trim(html_entity_decode($match[1]));
        }

        return null;
    }

    /**
     * Replace non-ASCII decorative characters in CSS with safe ASCII equivalents.
     *
     * AI models often use Unicode box-drawing characters (═══, ───), em dashes (—),
     * smart quotes (' ' " "), and other decorative chars in CSS comments. These are
     * valid UTF-8, but if the web server doesn't include charset=utf-8 in the
     * Content-Type header for CSS files, browsers may interpret them incorrectly,
     * producing garbled multi-byte sequences that can confuse the CSS parser.
     *
     * This method replaces common decorative Unicode characters with ASCII equivalents
     * to make CSS files encoding-safe. Only affects known decorative patterns —
     * CSS property values (font names, content strings) are untouched because they
     * rarely use these specific characters.
     */
    private function sanitizeCssEncoding(string $css): string
    {
        $replacements = [
            // Box-drawing characters → ASCII equivalents
            "\xE2\x95\x90" => '=',  // ═ (double horizontal)
            "\xE2\x95\x91" => '|',  // ║ (double vertical)
            "\xE2\x95\x94" => '+',  // ╔
            "\xE2\x95\x97" => '+',  // ╗
            "\xE2\x95\x9A" => '+',  // ╚
            "\xE2\x95\x9D" => '+',  // ╝
            "\xE2\x94\x80" => '-',  // ─ (single horizontal)
            "\xE2\x94\x82" => '|',  // │ (single vertical)
            "\xE2\x94\x8C" => '+',  // ┌
            "\xE2\x94\x90" => '+',  // ┐
            "\xE2\x94\x94" => '+',  // └
            "\xE2\x94\x98" => '+',  // ┘
            "\xE2\x94\x9C" => '+',  // ├
            "\xE2\x94\xA4" => '+',  // ┤
            "\xE2\x94\xAC" => '+',  // ┬
            "\xE2\x94\xB4" => '+',  // ┴
            "\xE2\x94\xBC" => '+',  // ┼

            // Typography → ASCII
            "\xE2\x80\x94" => '--', // — (em dash)
            "\xE2\x80\x93" => '-',  // – (en dash)
            "\xE2\x80\x98" => "'",  // ' (left single quote)
            "\xE2\x80\x99" => "'",  // ' (right single quote)
            "\xE2\x80\x9C" => '"',  // " (left double quote)
            "\xE2\x80\x9D" => '"',  // " (right double quote)
            "\xE2\x80\xA6" => '...', // … (ellipsis)
            "\xC2\xA0"     => ' ',  // non-breaking space
        ];

        return strtr($css, $replacements);
    }
}
