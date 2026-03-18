<?php

declare(strict_types=1);

/**
 * Demo Mode — GET Override Handler
 *
 * Dispatched by the router when DemoMode::shouldOverride() returns true.
 * Serves demo data in place of live workspace data for all overridden routes.
 *
 * This file is `require`d from router.php, so it has access to:
 *   $method, $path, $params — from the router
 *   $_REQUEST['_route_params'], $_REQUEST['_route_path'], etc.
 *   $_REQUEST['_user'] — the authenticated user (DEMO_USER with role='demo')
 *
 * Two types of responses:
 * 1. Fixture-backed: load JSON from _studio/demo/fixtures/, rebase dates
 * 2. Stub/block: return safe empty responses for blocked routes
 *
 * The /auth/session route uses cookie-branching:
 * - Demo token cookie → synthetic response (role: owner)
 * - Real session cookie → run auth.php, patch site_name only
 */

use VoxelSite\DemoMode;
use VoxelSite\DemoDataProvider;

require_once dirname(__DIR__, 2) . '/engine/DemoDataProvider.php';

$path   = $_REQUEST['_route_path'] ?? '';
$params = $_REQUEST['_route_params'] ?? [];


// ═══════════════════════════════════════════
//  Auth Routes
// ═══════════════════════════════════════════

if ($path === '/auth/session') {
    $cookie = $_COOKIE['vs_session'] ?? null;

    if ($cookie === DemoMode::DEMO_SESSION_TOKEN) {
        // ── Demo session: return synthetic data ──
        // No auth.php needed — there's no DB session to look up
        jsonResponse(['ok' => true, 'data' => [
            'site_name' => DemoDataProvider::siteName(),
            'user'      => [
                'id'    => DemoMode::DEMO_USER['id'],
                'email' => DemoMode::DEMO_USER['email'],
                'name'  => DemoMode::DEMO_USER['name'],
                'role'  => 'owner',  // Frontend normalization
            ],
            'token'     => DemoMode::DEMO_SESSION_TOKEN,
            'demo'      => true,
        ]]);
        return;
    }

    // ── Real session: run auth.php, patch site_name only ──
    // A real owner logged in during demo mode. Preserve their
    // identity and token, only replace the site name.
    ob_start();
    require __DIR__ . '/auth.php';
    $output = ob_get_clean();

    $response = json_decode($output, true);
    if ($response && ($response['ok'] ?? false)) {
        $response['data']['site_name'] = DemoDataProvider::siteName();
        // Do NOT change the role — they're a real user
    }

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return;
}


// ═══════════════════════════════════════════
//  File Editor Routes
// ═══════════════════════════════════════════

if ($path === '/files') {
    // Scan demo preview + assets directories, matching the shape of
    // listEditableFiles() in files.php (path, group, language, size, modified, protected, readonly).
    $studioDir  = dirname(__DIR__, 2);
    $previewDir = $studioDir . '/demo/preview';
    $demoAssets = $studioDir . '/demo/assets';
    $now        = time();
    $files      = [];
    $posIdx     = 0;

    // Helper: build a single file meta entry with rebased timestamp
    $buildMeta = function (string $relativePath, string $absolutePath, string $group) use ($now, &$posIdx): array {
        $ext = strtolower(pathinfo($relativePath, PATHINFO_EXTENSION));
        $langMap = ['php' => 'php', 'css' => 'css', 'js' => 'javascript', 'json' => 'json', 'md' => 'markdown', 'txt' => 'plaintext'];
        $language = $langMap[$ext] ?? 'plaintext';

        // Spread timestamps over the last 7 days (most recent first)
        $offset = $posIdx * 3600 * 4;
        $posIdx++;

        return [
            'path'      => $relativePath,
            'group'     => $group,
            'language'  => $language,
            'size'      => (int) filesize($absolutePath),
            'modified'  => gmdate('Y-m-d\TH:i:s\Z', $now - $offset),
            'protected' => in_array($relativePath, [
                'index.php',
                '_partials/header.php', '_partials/nav.php', '_partials/footer.php', '_partials/schema.php',
                'assets/css/style.css', 'assets/css/tailwind.css',
                'assets/js/main.js', 'assets/js/navigation.js', 'assets/js/form-handler.js',
                'assets/data/site.json', 'assets/data/memory.json', 'assets/data/design-intelligence.json',
            ], true) || str_starts_with($relativePath, '_prompts/'),
            'readonly'  => $relativePath === 'assets/css/tailwind.css',
        ];
    };

    // 1. Page files (*.php in preview root)
    foreach (glob($previewDir . '/*.php') ?: [] as $absPath) {
        if (is_file($absPath)) {
            $files[] = $buildMeta(basename($absPath), $absPath, 'page');
        }
    }

    // 2. Partials (_partials/*.php)
    $partialsDir = $previewDir . '/_partials';
    if (is_dir($partialsDir)) {
        foreach (glob($partialsDir . '/*.php') ?: [] as $absPath) {
            if (is_file($absPath)) {
                $files[] = $buildMeta('_partials/' . basename($absPath), $absPath, 'partial');
            }
        }
    }

    // 3. CSS files
    if (is_dir($demoAssets . '/css')) {
        foreach (glob($demoAssets . '/css/*.css') ?: [] as $absPath) {
            if (is_file($absPath)) {
                $files[] = $buildMeta('assets/css/' . basename($absPath), $absPath, 'style');
            }
        }
    }

    // 4. JS files
    if (is_dir($demoAssets . '/js')) {
        foreach (glob($demoAssets . '/js/*.js') ?: [] as $absPath) {
            if (is_file($absPath)) {
                $files[] = $buildMeta('assets/js/' . basename($absPath), $absPath, 'script');
            }
        }
    }

    // 5. Data JSON files from demo-owned copies (never live /assets/data/)
    $demoDataDir = $demoAssets . '/data';
    if (is_dir($demoDataDir)) {
        foreach (glob($demoDataDir . '/*.json') ?: [] as $absPath) {
            if (is_file($absPath)) {
                $files[] = $buildMeta('assets/data/' . basename($absPath), $absPath, 'data');
            }
        }
    }

    // 6. Config files (SEO & AI section: robots.txt, llms.txt)
    $demoConfigDir = $studioDir . '/demo/config';
    $configFiles = ['robots.txt', 'llms.txt'];
    foreach ($configFiles as $configFile) {
        $absPath = $demoConfigDir . '/' . $configFile;
        if (is_file($absPath)) {
            $files[] = $buildMeta('_root/' . $configFile, $absPath, 'config');
        }
    }

    // 7. Prompt files (SYSTEM PROMPTS section)
    $demoPromptsDir = $studioDir . '/demo/prompts';
    if (is_dir($demoPromptsDir)) {
        $promptIterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($demoPromptsDir, FilesystemIterator::SKIP_DOTS)
        );
        foreach ($promptIterator as $item) {
            if (!$item->isFile() || strtolower($item->getExtension()) !== 'md') continue;
            $relativeTail = substr($item->getPathname(), strlen($demoPromptsDir) + 1);
            $relativePath = '_prompts/' . str_replace('\\', '/', $relativeTail);
            $meta = $buildMeta($relativePath, $item->getPathname(), 'prompt');
            $meta['custom'] = false;
            $files[] = $meta;
        }
    }

    // Sort by group order (matching files.php: page → partial → style → script → data)
    $groupOrder = ['page' => 0, 'partial' => 1, 'style' => 2, 'script' => 3, 'data' => 4, 'config' => 5, 'prompt' => 6];
    usort($files, static function (array $a, array $b) use ($groupOrder): int {
        $la = $groupOrder[$a['group']] ?? 99;
        $lb = $groupOrder[$b['group']] ?? 99;
        if ($la !== $lb) return $la <=> $lb;
        return strnatcasecmp($a['path'], $b['path']);
    });

    jsonResponse(['ok' => true, 'data' => ['files' => $files]]);
    return;
}

if ($path === '/files/content') {
    // Serve file content read-only from demo directories ONLY.
    // No live /assets/ fallback — all demo file content stays within _studio/demo/.
    $requestedPath = trim((string) ($_GET['path'] ?? ''));

    // Validate path (no traversal, no empty)
    if ($requestedPath === '' || str_contains($requestedPath, '..') || str_starts_with($requestedPath, '/')) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Invalid file path.',
        ]], 422);
        return;
    }

    $studioDir  = dirname(__DIR__, 2);
    $demoBase   = $studioDir . '/demo';
    $absolutePath = null;

    if (str_starts_with($requestedPath, 'assets/')) {
        // Asset files: demo copies only (css, js, data)
        $assetRel = substr($requestedPath, 7); // strip 'assets/'
        $demoCandidate = $demoBase . '/assets/' . $assetRel;

        if (is_file($demoCandidate)) {
            $absolutePath = $demoCandidate;
        }
    } elseif (str_starts_with($requestedPath, '_root/')) {
        // Config files: robots.txt, llms.txt
        $configFile = substr($requestedPath, 6); // strip '_root/'
        $absolutePath = $demoBase . '/config/' . $configFile;
    } elseif (str_starts_with($requestedPath, '_prompts/')) {
        // Prompt files
        $promptFile = substr($requestedPath, 9); // strip '_prompts/'
        $absolutePath = $demoBase . '/prompts/' . $promptFile;
    } elseif (str_starts_with($requestedPath, '_partials/')) {
        $absolutePath = $demoBase . '/preview/' . $requestedPath;
    } else {
        // Page files
        $absolutePath = $demoBase . '/preview/' . $requestedPath;
    }

    if ($absolutePath === null || !is_file($absolutePath)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'File not found.',
        ]], 404);
        return;
    }

    // Security: verify resolved path stays within demo directory
    $realPath = realpath($absolutePath);
    $demoRealBase = realpath($demoBase);
    if (!$demoRealBase || !str_starts_with($realPath, $demoRealBase)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'forbidden',
            'message' => 'Access denied.',
        ]], 403);
        return;
    }

    $content = file_get_contents($absolutePath);

    // Build file meta matching the live contract
    $ext = strtolower(pathinfo($requestedPath, PATHINFO_EXTENSION));
    $langMap = ['php' => 'php', 'css' => 'css', 'js' => 'javascript', 'json' => 'json', 'md' => 'markdown', 'txt' => 'plaintext'];
    $language = $langMap[$ext] ?? 'plaintext';

    $groupMap = ['php' => 'page', 'css' => 'style', 'js' => 'script', 'json' => 'data'];
    $group = $groupMap[$ext] ?? 'page';
    if (str_starts_with($requestedPath, '_partials/')) $group = 'partial';
    if (str_starts_with($requestedPath, '_root/'))     $group = 'config';
    if (str_starts_with($requestedPath, '_prompts/'))  $group = 'prompt';

    jsonResponse(['ok' => true, 'data' => [
        'path'    => $requestedPath,
        'content' => $content,
        'file'    => [
            'path'      => $requestedPath,
            'group'     => $group,
            'language'  => $language,
            'size'      => strlen($content),
            'modified'  => gmdate('Y-m-d\TH:i:s\Z', (int) filemtime($absolutePath)),
            'protected' => in_array($requestedPath, [
                'index.php',
                '_partials/header.php', '_partials/nav.php', '_partials/footer.php', '_partials/schema.php',
                'assets/css/style.css', 'assets/css/tailwind.css',
                'assets/js/main.js', 'assets/js/navigation.js', 'assets/js/form-handler.js',
                'assets/data/site.json', 'assets/data/memory.json', 'assets/data/design-intelligence.json',
            ], true) || str_starts_with($requestedPath, '_prompts/'),
            'readonly'  => $requestedPath === 'assets/css/tailwind.css',
        ],
    ]]);
    return;
}


// Note: /preview and /preview/diff pass through to preview.php,
// which is demo-aware and swaps directories when DemoMode::isActive().
// This ensures the full preview pipeline (hot-reload, preview bridge,
// link rewriting, asset cache busting, visual editor bridge) runs
// correctly without maintaining a second rendering path.


// ═══════════════════════════════════════════
//  Pages & Content
// ═══════════════════════════════════════════

if ($path === '/pages') {
    // Scan demo preview directory for PHP pages, matching the shape of
    // GET /pages in pages.php (slug, title, is_homepage, nav_order, etc.)
    $studioDir  = dirname(__DIR__, 2);
    $previewDir = $studioDir . '/demo/preview';
    $now        = time();
    $pages      = [];

    // PHP pages in the preview root (not _partials)
    $pageFiles = glob($previewDir . '/*.php') ?: [];
    sort($pageFiles); // Consistent ordering

    foreach ($pageFiles as $idx => $absPath) {
        if (!is_file($absPath)) continue;
        $filename = basename($absPath);
        $slug = pathinfo($filename, PATHINFO_FILENAME); // index.php → index
        $isHomepage = ($slug === 'index') ? 1 : 0;

        // Extract title from the page content (match $page['title'] = '...' or <title>...)
        $content = file_get_contents($absPath);
        $title = ucfirst(str_replace('-', ' ', $slug));

        // Try PHP $page array format first
        if (preg_match("/['\"]title['\"]\s*=>\s*['\"]([^'\"]+)['\"]/", $content, $m)) {
            $title = $m[1];
        }
        // Fallback: HTML <title> tag
        elseif (preg_match('/<title>([^<]+)<\/title>/i', $content, $m)) {
            $title = trim(preg_replace('/\s*[\|–—]\s*.*$/', '', $m[1]));
        }

        $pages[] = [
            'id'          => $idx + 1,
            'slug'        => $slug,
            'title'       => $title,
            'description' => null,
            'file_path'   => $filename,
            'page_type'   => 'page',
            'nav_order'   => $isHomepage ? 0 : $idx,
            'nav_label'   => null,
            'is_published' => 1,
            'is_homepage'  => $isHomepage,
            'last_ai_edit' => gmdate('Y-m-d\TH:i:s\Z', $now - 3600 * ($idx + 1)),
            'created_at'   => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 6),
            'updated_at'   => gmdate('Y-m-d\TH:i:s\Z', $now - 3600 * ($idx + 1)),
            'size'         => (int) filesize($absPath),
            'path'         => $filename,
            'modified'     => gmdate('Y-m-d\TH:i:s\Z', $now - 3600 * ($idx + 1)),
        ];
    }

    // Sort: homepage first, then by nav_order
    usort($pages, static function (array $a, array $b): int {
        if ($a['is_homepage'] !== $b['is_homepage']) return $b['is_homepage'] - $a['is_homepage'];
        return ($a['nav_order'] ?? 99) <=> ($b['nav_order'] ?? 99);
    });

    jsonResponse(['ok' => true, 'data' => [
        'pages'       => $pages,
        'directories' => [],
        'current_dir' => '',
    ]]);
    return;
}

if (str_starts_with($path, '/pages/')) {
    // Individual page detail: extract slug, find file, return content
    $slug = trim(substr($path, strlen('/pages/')), '/');
    $studioDir  = dirname(__DIR__, 2);
    $previewDir = $studioDir . '/demo/preview';

    $filename = ($slug === 'index') ? 'index.php' : $slug . '.php';
    $absPath  = $previewDir . '/' . $filename;

    if (!is_file($absPath)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => "Page '{$slug}' not found.",
        ]], 404);
        return;
    }

    $content = file_get_contents($absPath);
    $title = ucfirst(str_replace('-', ' ', $slug));
    if (preg_match("/['\"]title['\"]\s*=>\s*['\"]([^'\"]+)['\"]/", $content, $m)) {
        $title = $m[1];
    }

    $now = time();
    jsonResponse(['ok' => true, 'data' => ['page' => [
        'id'           => 1,
        'slug'         => $slug,
        'title'        => $title,
        'description'  => null,
        'file_path'    => $filename,
        'page_type'    => 'page',
        'nav_order'    => $slug === 'index' ? 0 : 1,
        'nav_label'    => null,
        'is_published' => 1,
        'is_homepage'  => $slug === 'index' ? 1 : 0,
        'last_ai_edit' => gmdate('Y-m-d\TH:i:s\Z', $now - 3600),
        'created_at'   => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 6),
        'updated_at'   => gmdate('Y-m-d\TH:i:s\Z', $now - 3600),
        'content'      => $content,
        'size'         => strlen($content),
    ]]]);
    return;
}


// ═══════════════════════════════════════════
//  Design Library
// ═══════════════════════════════════════════

// Demo designs — 6 entries matching the VoxelSite-09-demo-site-prompts.md showcase.
// The first (Studioform) is the active design. It previews from _studio/demo/preview/.
// Others show styled placeholder previews with their palette colors.

$now = time();
$demoDesigns = [
    [
        'id'             => 'demo-studioform',
        'name'           => 'Studioform',
        'description'    => 'Clean, confident portfolio site. Bold editorial typography, warm monochrome palette, large project images with generous white space.',
        'initial_prompt' => 'Build a website for my design studio, Studioform. We\'re a small brand and digital design practice.',
        'site_name'      => 'Studioform',
        'page_count'     => 5,
        'file_count'     => 14,
        'design_tokens'  => [
            '--color-bg'      => '#faf9f7',
            '--color-ink'     => '#111110',
            '--color-accent'  => '#c8a96e',
            '--color-ink-mid' => '#3a3935',
            '--color-rule'    => '#e0ded9',
            '--font-display'  => "'Cormorant Garamond', Georgia, serif",
            '--font-body'     => "'DM Sans', system-ui, sans-serif",
        ],
        'created_at'     => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 6),
        'updated_at'     => gmdate('Y-m-d\TH:i:s\Z', $now - 3600 * 2),
    ],
    [
        'id'             => 'demo-lumen',
        'name'           => 'Lumen',
        'description'    => 'Dark gallery aesthetic. Architectural lighting studio with dramatic negative space and illuminated project photography.',
        'initial_prompt' => 'Build a website for my architectural lighting design studio, Lumen. Dark palette, restrained typography.',
        'site_name'      => 'Lumen',
        'page_count'     => 4,
        'file_count'     => 11,
        'design_tokens'  => [
            '--color-bg'      => '#0a0a0a',
            '--color-ink'     => '#f0ede8',
            '--color-accent'  => '#d4a853',
            '--color-ink-mid' => '#a09c94',
            '--color-rule'    => '#2a2826',
            '--font-display'  => "'Inter', system-ui, sans-serif",
            '--font-body'     => "'Inter', system-ui, sans-serif",
        ],
        'created_at'     => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 5),
        'updated_at'     => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 5),
    ],
    [
        'id'             => 'demo-maison-verte',
        'name'           => 'Maison Verte',
        'description'    => 'Warm, editorial hospitality site. Boutique hotel with muted earth tones, elegant serif typography, and curated imagery.',
        'initial_prompt' => 'Build a website for my boutique hotel, Maison Verte. Warm, muted colour palette — think aged linen and aged brass.',
        'site_name'      => 'Maison Verte',
        'page_count'     => 5,
        'file_count'     => 13,
        'design_tokens'  => [
            '--color-bg'      => '#f5f0e8',
            '--color-ink'     => '#2c2418',
            '--color-accent'  => '#8b6f47',
            '--color-ink-mid' => '#6b5d4e',
            '--color-rule'    => '#d9cebe',
            '--font-display'  => "'Playfair Display', Georgia, serif",
            '--font-body'     => "'Source Sans 3', system-ui, sans-serif",
        ],
        'created_at'     => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 4),
        'updated_at'     => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 4),
    ],
    [
        'id'             => 'demo-atlas',
        'name'           => 'Atlas Architecture',
        'description'    => 'Image-forward architecture portfolio. Generous white space, large project photographs, restrained Swiss typography.',
        'initial_prompt' => 'Create a website for my architecture practice, Atlas Architecture. Generous white space, large project photography.',
        'site_name'      => 'Atlas Architecture',
        'page_count'     => 5,
        'file_count'     => 12,
        'design_tokens'  => [
            '--color-bg'      => '#ffffff',
            '--color-ink'     => '#1a1a1a',
            '--color-accent'  => '#4a6741',
            '--color-ink-mid' => '#666666',
            '--color-rule'    => '#e5e5e5',
            '--font-display'  => "'Space Grotesk', system-ui, sans-serif",
            '--font-body'     => "'Inter', system-ui, sans-serif",
        ],
        'created_at'     => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 3),
        'updated_at'     => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 3),
    ],
    [
        'id'             => 'demo-ferrum',
        'name'           => 'Ferrum Studio',
        'description'    => 'Dark craft aesthetic. Industrial metalwork studio with raw textures, strong visual identity, and portfolio-first layout.',
        'initial_prompt' => 'Create a website for my metalworking studio, Ferrum Studio. Dark palette, raw textures, portfolio grid.',
        'site_name'      => 'Ferrum Studio',
        'page_count'     => 4,
        'file_count'     => 10,
        'design_tokens'  => [
            '--color-bg'      => '#121210',
            '--color-ink'     => '#e8e4dd',
            '--color-accent'  => '#c17f3a',
            '--color-ink-mid' => '#918b82',
            '--color-rule'    => '#2e2c28',
            '--font-display'  => "'Libre Baskerville', Georgia, serif",
            '--font-body'     => "'DM Sans', system-ui, sans-serif",
        ],
        'created_at'     => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 2),
        'updated_at'     => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 2),
    ],
    [
        'id'             => 'demo-ember-oak',
        'name'           => 'Ember & Oak',
        'description'    => 'Warm specialty café. Rich amber and dark wood palette, inviting typography, menu-focused layout.',
        'initial_prompt' => 'Build a website for my café, Ember & Oak. Rich, warm colour palette — think dark wood and amber light.',
        'site_name'      => 'Ember & Oak',
        'page_count'     => 4,
        'file_count'     => 11,
        'design_tokens'  => [
            '--color-bg'      => '#1c1816',
            '--color-ink'     => '#f0e6d8',
            '--color-accent'  => '#d4913a',
            '--color-ink-mid' => '#b09e8a',
            '--color-rule'    => '#3a322c',
            '--font-display'  => "'Fraunces', Georgia, serif",
            '--font-body'     => "'Work Sans', system-ui, sans-serif",
        ],
        'created_at'     => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 1),
        'updated_at'     => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 1),
    ],
];

if ($path === '/designs') {
    jsonResponse(['ok' => true, 'data' => [
        'designs'   => $demoDesigns,
        'active_id' => 'demo-studioform',
    ]]);
    return;
}

// Design preview reader — serves HTML documents for design-card iframes.
// The active design (Studioform) uses the full demo preview site.
// Other designs get palette-aware placeholder previews.
if (str_starts_with($path, '/designs/') && str_ends_with($path, '/preview')) {
    // Extract design ID from path: /designs/{id}/preview
    $designId = '';
    if (preg_match('#^/designs/([^/]+)/preview$#', $path, $m)) {
        $designId = $m[1];
    }

    // Active design: delegate to the live preview pipeline.
    // preview.php is demo-aware and swaps to _studio/demo/preview/ +
    // _studio/demo/assets/. This gives us hot-reload, preview bridge,
    // asset URL rewriting, visual editor bridge, and embed overrides
    // for free — no hand-rolled duplicate to maintain.
    if ($designId === 'demo-studioform') {
        $_REQUEST['_route_path'] = '/preview';
        $_REQUEST['_route_method'] = 'GET';
        if (!isset($_GET['path'])) $_GET['path'] = 'index.php';
        require __DIR__ . '/preview.php';
        return;
    }

    // ────────────────────────────────────────────────
    //  Unique landing pages per design
    // ────────────────────────────────────────────────
    //
    //  Each design gets a bespoke landing page — different layout,
    //  sections, images, and visual hierarchy. No two should look alike.
    //  Gallery images are referenced from /assets/library/gallery/.
    //  Google Fonts are loaded per design for faithful typography.

    $design = null;
    foreach ($demoDesigns as $d) {
        if ($d['id'] === $designId) {
            $design = $d;
            break;
        }
    }

    if (!$design) {
        http_response_code(404);
        echo 'Design not found';
        return;
    }

    $bg      = $design['design_tokens']['--color-bg'] ?? '#faf9f7';
    $ink     = $design['design_tokens']['--color-ink'] ?? '#111110';
    $accent  = $design['design_tokens']['--color-accent'] ?? '#888888';
    $muted   = $design['design_tokens']['--color-ink-mid'] ?? '#888888';
    $rule    = $design['design_tokens']['--color-rule'] ?? '#e0ded9';
    $heading = $design['design_tokens']['--font-display'] ?? 'Georgia, serif';
    $body    = $design['design_tokens']['--font-body'] ?? 'system-ui, sans-serif';
    $name    = htmlspecialchars($design['name'] ?? 'Design');

    // Google Fonts link per design
    $fontLinks = match($designId) {
        'demo-lumen'        => '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">',
        'demo-maison-verte' => '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500&display=swap" rel="stylesheet">',
        'demo-atlas'        => '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">',
        'demo-ferrum'       => '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">',
        'demo-ember-oak'    => '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500&display=swap" rel="stylesheet">',
        default             => '',
    };

    // Image base path for gallery
    $img = '/assets/library/gallery';

    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-cache, no-store, must-revalidate');

    // ── Design-specific landing pages ──

    if ($designId === 'demo-lumen') {
        // ────────────────────────────────────────
        //  LUMEN — Architectural Lighting Studio
        //  Dark theme, dramatic hero, gallery grid
        // ────────────────────────────────────────
        echo <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lumen — Light as a Spatial Event</title>
{$fontLinks}
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: {$body}; background: {$bg}; color: {$ink}; -webkit-font-smoothing: antialiased; }
  img { display: block; width: 100%; height: 100%; object-fit: cover; }

  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 48px; position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(10,10,10,0.85); backdrop-filter: blur(12px);
  }
  .nav-logo { font-family: {$heading}; font-size: 1rem; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; }
  .nav-links { display: flex; gap: 32px; font-size: 0.7rem; color: {$muted}; text-transform: uppercase; letter-spacing: 0.12em; }

  .hero {
    position: relative; height: 100vh; display: flex; align-items: flex-end;
    padding: 80px 48px; overflow: hidden;
  }
  .hero-img { position: absolute; inset: 0; }
  .hero-img::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.3) 50%, rgba(10,10,10,0.1) 100%);
  }
  .hero-content { position: relative; z-index: 2; max-width: 680px; }
  .hero-content h1 {
    font-family: {$heading}; font-size: clamp(2.8rem, 6vw, 5rem);
    font-weight: 300; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 24px;
  }
  .hero-content p { font-size: 0.95rem; color: {$muted}; line-height: 1.7; max-width: 440px; margin-bottom: 40px; }
  .hero-line { width: 48px; height: 1px; background: {$accent}; margin-bottom: 20px; }

  .section-label {
    font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.2em;
    color: {$muted}; margin-bottom: 40px;
  }
  .gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
  .gallery-item { aspect-ratio: 4/3; overflow: hidden; position: relative; }
  .gallery-item::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(10,10,10,0.4) 0%, transparent 50%);
  }

  .about {
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px;
    padding: 120px 48px; border-top: 1px solid {$rule};
  }
  .about h2 {
    font-family: {$heading}; font-size: clamp(1.6rem, 3vw, 2.4rem);
    font-weight: 300; line-height: 1.2;
  }
  .about p { font-size: 0.9rem; color: {$muted}; line-height: 1.8; }

  .stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid {$rule}; border-bottom: 1px solid {$rule};
  }
  .stat {
    padding: 48px; text-align: center;
    border-right: 1px solid {$rule};
  }
  .stat:last-child { border-right: none; }
  .stat-num { font-family: {$heading}; font-size: 2.4rem; font-weight: 300; margin-bottom: 8px; }
  .stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: {$muted}; }

  .footer { padding: 48px; text-align: center; font-size: 0.75rem; color: {$muted}; border-top: 1px solid {$rule}; }
</style>
</head>
<body>
<nav class="nav">
  <div class="nav-logo">Lumen</div>
  <div class="nav-links"><span>Projects</span><span>Philosophy</span><span>Studio</span><span>Contact</span></div>
</nav>

<section class="hero">
  <div class="hero-img"><img src="{$img}/vs-gal_golden-pane_interior-editorial_warm_dark-text.jpeg" alt="Light installation"></div>
  <div class="hero-content">
    <div class="hero-line"></div>
    <h1>Light as a<br>spatial event</h1>
    <p>We design lighting for galleries, architectural spaces, and cultural institutions. Each project treats light as material, not decoration.</p>
  </div>
</section>

<section style="padding: 120px 48px;">
  <div class="section-label">Selected Work</div>
  <div class="gallery">
    <div class="gallery-item"><img src="{$img}/vs-gal_concentric-rings_architecture-abstract_light_dark-text.jpeg" alt="Museum installation"></div>
    <div class="gallery-item"><img src="{$img}/vs-gal_diagonal-rails_interior-editorial_cool_dark-text.jpeg" alt="Gallery lighting"></div>
    <div class="gallery-item"><img src="{$img}/vs-gal_golden-orb_abstract-creative_dark_light-text.jpeg" alt="Light sculpture"></div>
  </div>
</section>

<section class="stats">
  <div class="stat"><div class="stat-num">47</div><div class="stat-label">Installations</div></div>
  <div class="stat"><div class="stat-num">12</div><div class="stat-label">Countries</div></div>
  <div class="stat"><div class="stat-num">8</div><div class="stat-label">Awards</div></div>
  <div class="stat"><div class="stat-num">15</div><div class="stat-label">Years</div></div>
</section>

<section class="about">
  <div><h2>Where architecture<br>meets light</h2></div>
  <div><p>Our work sits at the intersection of architecture and art. We believe light shapes how people experience space — it directs attention, creates atmosphere, and reveals material qualities that would otherwise go unnoticed.<br><br>Each commission begins with the space itself. We study natural light patterns, material surfaces, and the intended experience before proposing a lighting concept.</p></div>
</section>

<footer class="footer">© Lumen Studio. Light as a spatial event.</footer>
</body>
</html>
HTML;
        return;
    }

    if ($designId === 'demo-maison-verte') {
        // ────────────────────────────────────────
        //  MAISON VERTE — Boutique Hotel
        //  Warm editorial, split hero, elegant serif
        // ────────────────────────────────────────
        echo <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Maison Verte — A Quiet Address in the Marais</title>
{$fontLinks}
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: {$body}; background: {$bg}; color: {$ink}; -webkit-font-smoothing: antialiased; }
  img { display: block; width: 100%; height: 100%; object-fit: cover; }

  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px; border-bottom: 1px solid {$rule};
  }
  .nav-logo { font-family: {$heading}; font-size: 1.4rem; font-weight: 400; }
  .nav-links { display: flex; gap: 28px; font-size: 0.75rem; color: {$muted}; text-transform: uppercase; letter-spacing: 0.1em; }

  .hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 85vh; }
  .hero-text {
    display: flex; flex-direction: column; justify-content: center;
    padding: 80px 64px;
  }
  .hero-tagline {
    font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.2em;
    color: {$accent}; margin-bottom: 32px;
  }
  .hero-text h1 {
    font-family: {$heading}; font-size: clamp(2.4rem, 5vw, 3.8rem);
    font-weight: 400; line-height: 1.15; margin-bottom: 28px;
  }
  .hero-text h1 em { font-style: italic; color: {$accent}; }
  .hero-text p { font-size: 0.9rem; color: {$muted}; line-height: 1.8; max-width: 380px; margin-bottom: 36px; }
  .hero-cta {
    display: inline-block; padding: 14px 32px; font-size: 0.7rem;
    text-transform: uppercase; letter-spacing: 0.12em; font-family: {$body};
    background: {$ink}; color: {$bg}; text-decoration: none; border-radius: 2px;
    width: fit-content;
  }
  .hero-img { overflow: hidden; }

  .features {
    display: grid; grid-template-columns: repeat(3, 1fr);
    border-top: 1px solid {$rule};
  }
  .feature {
    padding: 56px 40px; border-right: 1px solid {$rule};
  }
  .feature:last-child { border-right: none; }
  .feature h3 { font-family: {$heading}; font-size: 1.2rem; font-weight: 400; margin-bottom: 12px; }
  .feature p { font-size: 0.85rem; color: {$muted}; line-height: 1.7; }
  .feature-num { font-size: 0.6rem; color: {$accent}; letter-spacing: 0.15em; margin-bottom: 20px; }

  .gallery-strip {
    display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 2px;
    border-top: 1px solid {$rule};
  }
  .gallery-strip-item { aspect-ratio: 3/4; overflow: hidden; }
  .gallery-strip-item:nth-child(2) { aspect-ratio: auto; }

  .quote {
    padding: 100px 48px; text-align: center;
    border-top: 1px solid {$rule};
  }
  .quote blockquote {
    font-family: {$heading}; font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 400; font-style: italic; line-height: 1.5;
    max-width: 640px; margin: 0 auto 24px;
  }
  .quote cite { font-size: 0.75rem; color: {$muted}; font-style: normal; letter-spacing: 0.1em; text-transform: uppercase; }

  .footer {
    display: flex; justify-content: space-between; align-items: center;
    padding: 32px 48px; font-size: 0.75rem; color: {$muted};
    border-top: 1px solid {$rule};
  }
</style>
</head>
<body>
<nav class="nav">
  <div class="nav-logo">Maison Verte</div>
  <div class="nav-links"><span>Rooms</span><span>The House</span><span>Neighbourhood</span><span>Gallery</span><span>Enquire</span></div>
</nav>

<section class="hero">
  <div class="hero-text">
    <div class="hero-tagline">Paris · Le Marais</div>
    <h1>A quiet address<br>in <em>the Marais</em></h1>
    <p>Twelve rooms in a converted townhouse. Vintage furniture, original mouldings, contemporary art, and a courtyard garden where guests take breakfast in summer.</p>
    <a href="#" class="hero-cta">View Rooms</a>
  </div>
  <div class="hero-img"><img src="{$img}/vs-gal_arched-courtyard_architecture-hospitality_warm_dark-text.jpeg" alt="Hotel courtyard"></div>
</section>

<section class="features">
  <div class="feature">
    <div class="feature-num">01</div>
    <h3>The Rooms</h3>
    <p>Each of our twelve rooms is individually designed. Period furniture meets contemporary art in spaces that feel discovered, not decorated.</p>
  </div>
  <div class="feature">
    <div class="feature-num">02</div>
    <h3>The Garden</h3>
    <p>A hidden courtyard planted with jasmine and old roses. Breakfast here in summer — fresh pastries, local cheeses, pressed juice.</p>
  </div>
  <div class="feature">
    <div class="feature-num">03</div>
    <h3>The Library Bar</h3>
    <p>A small bar with collected books, natural wines, and the kind of conversation that only happens when the Wi-Fi is intentionally slow.</p>
  </div>
</section>

<section class="gallery-strip">
  <div class="gallery-strip-item"><img src="{$img}/vs-gal_narrow-passage_architecture-hospitality_warm_dark-text.jpeg" alt="Hotel corridor"></div>
  <div class="gallery-strip-item"><img src="{$img}/vs-gal_stone-colonnade_architecture-hospitality_warm_dark-text.jpeg" alt="Hotel exterior"></div>
  <div class="gallery-strip-item"><img src="{$img}/vs-gal_blue-shutters_vintage-architecture_warm_dark-text.jpeg" alt="Room window"></div>
</section>

<section class="quote">
  <blockquote>"The kind of place you tell one friend about<br>and ask them not to tell anyone else."</blockquote>
  <cite>Condé Nast Traveller</cite>
</section>

<footer class="footer">
  <span>Maison Verte · 14 Rue des Archives, 75004 Paris</span>
  <span>© Maison Verte</span>
</footer>
</body>
</html>
HTML;
        return;
    }

    if ($designId === 'demo-atlas') {
        // ────────────────────────────────────────
        //  ATLAS ARCHITECTURE — Residential Firm
        //  Light, clean, Swiss grid, image-forward
        // ────────────────────────────────────────
        echo <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Atlas Architecture — Houses That Belong Where They Stand</title>
{$fontLinks}
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: {$body}; background: {$bg}; color: {$ink}; -webkit-font-smoothing: antialiased; }
  img { display: block; width: 100%; height: 100%; object-fit: cover; }

  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px; border-bottom: 1px solid {$rule};
  }
  .nav-logo { font-family: {$heading}; font-size: 1.1rem; font-weight: 500; letter-spacing: 0.04em; }
  .nav-links { display: flex; gap: 28px; font-size: 0.72rem; color: {$muted}; text-transform: uppercase; letter-spacing: 0.1em; }

  .hero { padding: 100px 48px 60px; max-width: 900px; }
  .hero-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.2em; color: {$accent}; margin-bottom: 28px; }
  .hero h1 {
    font-family: {$heading}; font-size: clamp(2.6rem, 5vw, 4.2rem);
    font-weight: 500; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 24px;
  }
  .hero p { font-size: 1rem; color: {$muted}; line-height: 1.7; max-width: 540px; }

  .project-grid {
    display: grid; grid-template-columns: 7fr 5fr; gap: 2px;
    margin: 0 48px; border-top: 1px solid {$rule};
  }
  .project-large { aspect-ratio: 16/10; overflow: hidden; }
  .project-stack { display: grid; grid-template-rows: 1fr 1fr; gap: 2px; }
  .project-stack-item { overflow: hidden; }

  .project-info {
    display: grid; grid-template-columns: 1fr 1fr; gap: 40px;
    padding: 60px 48px;
  }
  .project-card { }
  .project-card h3 { font-family: {$heading}; font-size: 1.1rem; font-weight: 500; margin-bottom: 6px; }
  .project-card .meta { font-size: 0.72rem; color: {$muted}; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
  .project-card p { font-size: 0.85rem; color: {$muted}; line-height: 1.7; }

  .services {
    display: grid; grid-template-columns: repeat(3, 1fr);
    border-top: 1px solid {$rule}; border-bottom: 1px solid {$rule};
  }
  .service {
    padding: 48px; border-right: 1px solid {$rule};
  }
  .service:last-child { border-right: none; }
  .service h3 { font-family: {$heading}; font-size: 1rem; font-weight: 500; margin-bottom: 10px; }
  .service p { font-size: 0.82rem; color: {$muted}; line-height: 1.7; }

  .philosophy {
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px;
    padding: 100px 48px;
  }
  .philosophy h2 { font-family: {$heading}; font-size: 1.8rem; font-weight: 500; line-height: 1.25; }
  .philosophy p { font-size: 0.9rem; color: {$muted}; line-height: 1.8; }

  .footer { padding: 32px 48px; font-size: 0.72rem; color: {$muted}; border-top: 1px solid {$rule}; }
</style>
</head>
<body>
<nav class="nav">
  <div class="nav-logo">Atlas Architecture</div>
  <div class="nav-links"><span>Projects</span><span>Practice</span><span>Services</span><span>Contact</span></div>
</nav>

<section class="hero">
  <div class="hero-label">Architecture Practice</div>
  <h1>Houses that belong<br>where they stand</h1>
  <p>Residential architecture grounded in place. We design homes — new builds and sensitive renovations — that respond to landscape and climate rather than fashion.</p>
</section>

<div class="project-grid">
  <div class="project-large"><img src="{$img}/vs-gal_concrete-frame_architecture-minimal_light_dark-text.jpeg" alt="Coastal home"></div>
  <div class="project-stack">
    <div class="project-stack-item"><img src="{$img}/vs-gal_sunlit-stairwell_architecture-interior_light_dark-text.jpeg" alt="Interior stairwell"></div>
    <div class="project-stack-item"><img src="{$img}/vs-gal_arched-doorway_architecture-interior_warm_dark-text.jpeg" alt="Stone renovation"></div>
  </div>
</div>

<section class="project-info">
  <div class="project-card">
    <h3>Coastal Timber Frame</h3>
    <div class="meta">Gothenburg Coast · 2024</div>
    <p>A timber-frame home on the Swedish coast. Larch cladding, deep overhangs, and floor-to-ceiling glazing facing the archipelago.</p>
  </div>
  <div class="project-card">
    <h3>Highland Stone Restoration</h3>
    <div class="meta">Scottish Highlands · 2023</div>
    <p>A sensitive renovation of a 19th-century crofter's cottage. Original stone walls retained, with contemporary insertions in glass and steel.</p>
  </div>
</section>

<section class="services">
  <div class="service"><h3>New Builds</h3><p>From concept through planning and construction. Homes designed from the site up, using locally sourced materials.</p></div>
  <div class="service"><h3>Renovations</h3><p>Sensitive interventions that honour what exists while creating something new. Old buildings deserve careful hands.</p></div>
  <div class="service"><h3>Consultation</h3><p>Planning advice, feasibility studies, and design direction for projects at any stage.</p></div>
</section>

<section class="philosophy">
  <div><h2>Architecture<br>shaped by place</h2></div>
  <div><p>Every site has a story written in its contours, its light, its weather. We read that story before we draw a line. Materials are sourced locally where possible — not as a rule, but because buildings that use what's around them tend to feel inevitable rather than imposed.<br><br>The result is architecture that doesn't fight its surroundings. Houses that belong where they stand.</p></div>
</section>

<footer class="footer">Atlas Architecture · Stockholm & Edinburgh</footer>
</body>
</html>
HTML;
        return;
    }

    if ($designId === 'demo-ferrum') {
        // ────────────────────────────────────────
        //  FERRUM STUDIO — Custom Metalwork
        //  Dark, raw, craft-focused, portfolio grid
        // ────────────────────────────────────────
        echo <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ferrum Studio — Custom Metalwork</title>
{$fontLinks}
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: {$body}; background: {$bg}; color: {$ink}; -webkit-font-smoothing: antialiased; }
  img { display: block; width: 100%; height: 100%; object-fit: cover; }

  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px; border-bottom: 1px solid {$rule};
  }
  .nav-logo { font-family: {$heading}; font-size: 1.2rem; font-weight: 400; letter-spacing: 0.02em; }
  .nav-links { display: flex; gap: 24px; font-size: 0.7rem; color: {$muted}; text-transform: uppercase; letter-spacing: 0.1em; }

  .hero {
    display: grid; grid-template-columns: 1fr 1fr; min-height: 80vh;
  }
  .hero-text {
    display: flex; flex-direction: column; justify-content: center;
    padding: 60px 64px;
  }
  .hero-text h1 {
    font-family: {$heading}; font-size: clamp(2.2rem, 4.5vw, 3.6rem);
    font-weight: 400; line-height: 1.15; margin-bottom: 24px;
  }
  .hero-text h1 em { font-style: italic; color: {$accent}; }
  .hero-text p { font-size: 0.9rem; color: {$muted}; line-height: 1.8; max-width: 420px; margin-bottom: 36px; }
  .hero-cta {
    display: inline-block; padding: 14px 28px; font-size: 0.7rem;
    text-transform: uppercase; letter-spacing: 0.12em;
    border: 1px solid {$accent}; color: {$accent}; text-decoration: none;
    width: fit-content;
  }
  .hero-img { overflow: hidden; }

  .portfolio { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px; border-top: 2px solid {$rule}; }
  .portfolio-item { position: relative; aspect-ratio: 1; overflow: hidden; }
  .portfolio-item::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(18,18,16,0.7) 0%, transparent 60%);
  }
  .portfolio-label {
    position: absolute; bottom: 20px; left: 20px; z-index: 2;
    font-family: {$heading}; font-size: 0.9rem;
  }

  .process {
    display: grid; grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid {$rule}; border-bottom: 1px solid {$rule};
  }
  .step {
    padding: 48px 32px; border-right: 1px solid {$rule};
  }
  .step:last-child { border-right: none; }
  .step-num { font-size: 2.4rem; font-family: {$heading}; color: {$accent}; margin-bottom: 16px; font-weight: 400; }
  .step h3 { font-size: 0.95rem; margin-bottom: 8px; }
  .step p { font-size: 0.8rem; color: {$muted}; line-height: 1.7; }

  .statement {
    padding: 100px 48px; text-align: center;
  }
  .statement h2 {
    font-family: {$heading}; font-size: clamp(1.6rem, 3vw, 2.8rem);
    font-weight: 400; line-height: 1.3; max-width: 700px; margin: 0 auto;
  }
  .statement h2 em { color: {$accent}; font-style: italic; }

  .materials {
    display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
    border-top: 1px solid {$rule};
  }
  .material { position: relative; aspect-ratio: 16/9; overflow: hidden; }
  .material-overlay {
    position: absolute; bottom: 0; left: 0; right: 0; padding: 32px;
    background: linear-gradient(to top, rgba(18,18,16,0.85) 0%, transparent 100%);
    z-index: 2;
  }
  .material-overlay h3 { font-family: {$heading}; font-size: 1rem; margin-bottom: 4px; }
  .material-overlay p { font-size: 0.75rem; color: {$muted}; }

  .footer { padding: 32px 48px; font-size: 0.72rem; color: {$muted}; border-top: 1px solid {$rule}; display: flex; justify-content: space-between; }
</style>
</head>
<body>
<nav class="nav">
  <div class="nav-logo">Ferrum Studio</div>
  <div class="nav-links"><span>Portfolio</span><span>Process</span><span>Materials</span><span>Commission</span></div>
</nav>

<section class="hero">
  <div class="hero-text">
    <h1>Custom metalwork<br>for homes <em>&amp; makers</em></h1>
    <p>Everything is made to order. No catalogue, no off-the-shelf. The process starts with a conversation and ends with something built to last decades.</p>
    <a href="#" class="hero-cta">Start a Commission</a>
  </div>
  <div class="hero-img"><img src="{$img}/vs-gal_brushed-steel_industrial-metalwork_cool_light-text.jpeg" alt="Steel fabrication"></div>
</section>

<section class="portfolio">
  <div class="portfolio-item"><img src="{$img}/vs-gal_rusted-beam_industrial-metalwork_dark_light-text.jpeg" alt="Custom railings"><div class="portfolio-label">Railings</div></div>
  <div class="portfolio-item"><img src="{$img}/vs-gal_weld-seam_industrial-metalwork_dark_light-text.jpeg" alt="Furniture"><div class="portfolio-label">Furniture</div></div>
  <div class="portfolio-item"><img src="{$img}/vs-gal_rusty-handle_vintage-craft_warm_dark-text.jpeg" alt="Architectural details"><div class="portfolio-label">Details</div></div>
</section>

<section class="process">
  <div class="step"><div class="step-num">01</div><h3>Conversation</h3><p>We discuss the space, the function, and the aesthetic you're after.</p></div>
  <div class="step"><div class="step-num">02</div><h3>Design</h3><p>Hand sketches and technical drawings. You approve before any steel is cut.</p></div>
  <div class="step"><div class="step-num">03</div><h3>Fabrication</h3><p>Every piece forged, welded, and finished by hand in our workshop.</p></div>
  <div class="step"><div class="step-num">04</div><h3>Installation</h3><p>Delivered and fitted. Built to outlast the building it lives in.</p></div>
</section>

<section class="statement">
  <h2>No catalogue. No templates.<br>Just <em>honest craft</em> built to last.</h2>
</section>

<section class="materials">
  <div class="material">
    <img src="{$img}/vs-gal_stacked-plates_craft-artisan_warm_dark-text.jpeg" alt="Raw steel">
    <div class="material-overlay"><h3>Raw Steel</h3><p>Hot-rolled, mill-scale, Corten</p></div>
  </div>
  <div class="material">
    <img src="{$img}/vs-gal_clay-pot_craft-artisan_warm_dark-text.jpeg" alt="Bronze & brass">
    <div class="material-overlay"><h3>Bronze & Brass</h3><p>Cast, patinated, hand-finished</p></div>
  </div>
</section>

<footer class="footer">
  <span>Ferrum Studio · Melbourne</span>
  <span>Custom metalwork since 2012</span>
</footer>
</body>
</html>
HTML;
        return;
    }

    if ($designId === 'demo-ember-oak') {
        // ────────────────────────────────────────
        //  EMBER & OAK — Specialty Coffee
        //  Warm, inviting, menu-focused, amber tones
        // ────────────────────────────────────────
        echo <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ember &amp; Oak — Slow Roasts. Good Company.</title>
{$fontLinks}
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: {$body}; background: {$bg}; color: {$ink}; -webkit-font-smoothing: antialiased; }
  img { display: block; width: 100%; height: 100%; object-fit: cover; }

  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px; border-bottom: 1px solid {$rule};
  }
  .nav-logo { font-family: {$heading}; font-size: 1.4rem; font-weight: 400; }
  .nav-links { display: flex; gap: 24px; font-size: 0.7rem; color: {$muted}; text-transform: uppercase; letter-spacing: 0.1em; }

  .hero {
    display: grid; grid-template-columns: 1fr 1fr; min-height: 85vh;
  }
  .hero-img { overflow: hidden; }
  .hero-text {
    display: flex; flex-direction: column; justify-content: center;
    padding: 60px 64px;
  }
  .hero-badge {
    display: inline-block; font-size: 0.6rem; text-transform: uppercase;
    letter-spacing: 0.2em; color: {$accent}; border: 1px solid {$rule};
    padding: 6px 14px; margin-bottom: 36px; width: fit-content; border-radius: 20px;
  }
  .hero-text h1 {
    font-family: {$heading}; font-size: clamp(2.4rem, 5vw, 4rem);
    font-weight: 300; line-height: 1.1; margin-bottom: 24px;
  }
  .hero-text h1 em { font-style: italic; color: {$accent}; }
  .hero-text p { font-size: 0.9rem; color: {$muted}; line-height: 1.8; max-width: 400px; }

  .features {
    display: grid; grid-template-columns: repeat(3, 1fr);
    border-top: 1px solid {$rule}; border-bottom: 1px solid {$rule};
  }
  .feat {
    padding: 48px 40px; border-right: 1px solid {$rule};
    text-align: center;
  }
  .feat:last-child { border-right: none; }
  .feat-icon { font-size: 1.6rem; margin-bottom: 16px; }
  .feat h3 { font-family: {$heading}; font-size: 1rem; font-weight: 400; margin-bottom: 8px; }
  .feat p { font-size: 0.8rem; color: {$muted}; line-height: 1.7; }

  .menu-section {
    display: grid; grid-template-columns: 1fr 1fr; gap: 0;
    border-bottom: 1px solid {$rule};
  }
  .menu-panel { padding: 64px 48px; }
  .menu-panel:first-child { border-right: 1px solid {$rule}; }
  .menu-title {
    font-family: {$heading}; font-size: 1.4rem; font-weight: 400;
    margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid {$rule};
  }
  .menu-item {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 12px 0; border-bottom: 1px solid rgba(58,50,44,0.3);
  }
  .menu-item-name { font-size: 0.9rem; }
  .menu-item-price { font-size: 0.85rem; color: {$accent}; font-family: {$heading}; }
  .menu-item-desc { font-size: 0.75rem; color: {$muted}; margin-top: 4px; }

  .gallery-row {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px; border-bottom: 1px solid {$rule};
  }
  .gallery-row-item { aspect-ratio: 4/3; overflow: hidden; }

  .quote {
    padding: 80px 48px; text-align: center;
    border-bottom: 1px solid {$rule};
  }
  .quote blockquote {
    font-family: {$heading}; font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 300; font-style: italic; line-height: 1.5;
    max-width: 560px; margin: 0 auto;
  }

  .hours {
    display: grid; grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid {$rule};
  }
  .hours-panel {
    padding: 48px; border-right: 1px solid {$rule};
  }
  .hours-panel:last-child { border-right: none; }
  .hours-panel h3 { font-family: {$heading}; font-size: 1.1rem; font-weight: 400; margin-bottom: 20px; }
  .hours-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 0.85rem; }
  .hours-row span:last-child { color: {$muted}; }

  .footer { padding: 32px 48px; font-size: 0.72rem; color: {$muted}; border-top: 1px solid {$rule}; text-align: center; }
</style>
</head>
<body>
<nav class="nav">
  <div class="nav-logo">Ember & Oak</div>
  <div class="nav-links"><span>Menu</span><span>Our Story</span><span>Hours</span><span>Find Us</span></div>
</nav>

<section class="hero">
  <div class="hero-img"><img src="{$img}/vs-gal_cafe-cortado_food-coffee_dark_light-text.jpeg" alt="Coffee"></div>
  <div class="hero-text">
    <div class="hero-badge">Specialty Coffee · Honest Food</div>
    <h1>Slow roasts.<br><em>Good company.</em></h1>
    <p>Single-origin coffees, slow-roasted in small batches. Sourdough sandwiches, seasonal salads, and house-baked pastries. A neighbourhood spot that feels like it's always been here.</p>
  </div>
</section>

<section class="features">
  <div class="feat"><div class="feat-icon">☕</div><h3>Single Origins</h3><p>Slow-roasted beans from Ethiopia, Colombia, and Guatemala. Brewed fresh every hour.</p></div>
  <div class="feat"><div class="feat-icon">🍞</div><h3>Baked Daily</h3><p>Sourdough from our own starter. Pastries, buns, and seasonal specials made each morning.</p></div>
  <div class="feat"><div class="feat-icon">🌿</div><h3>Local & Seasonal</h3><p>Ingredients from farms we know. Menus that change with what's growing.</p></div>
</section>

<section class="menu-section">
  <div class="menu-panel">
    <div class="menu-title">Coffee</div>
    <div class="menu-item"><div><div class="menu-item-name">Espresso</div><div class="menu-item-desc">Single or double shot</div></div><div class="menu-item-price">3.50</div></div>
    <div class="menu-item"><div><div class="menu-item-name">Cortado</div><div class="menu-item-desc">Equal parts espresso and steamed milk</div></div><div class="menu-item-price">4.00</div></div>
    <div class="menu-item"><div><div class="menu-item-name">Flat White</div><div class="menu-item-desc">Double ristretto, velvety microfoam</div></div><div class="menu-item-price">4.50</div></div>
    <div class="menu-item"><div><div class="menu-item-name">Pour Over</div><div class="menu-item-desc">Single origin, brewed to order</div></div><div class="menu-item-price">5.00</div></div>
  </div>
  <div class="menu-panel">
    <div class="menu-title">Kitchen</div>
    <div class="menu-item"><div><div class="menu-item-name">Sourdough & Butter</div><div class="menu-item-desc">House-baked with cultured butter</div></div><div class="menu-item-price">4.50</div></div>
    <div class="menu-item"><div><div class="menu-item-name">Egg & Greens</div><div class="menu-item-desc">Poached eggs, seasonal greens, chilli oil</div></div><div class="menu-item-price">12.00</div></div>
    <div class="menu-item"><div><div class="menu-item-name">Grain Bowl</div><div class="menu-item-desc">Farro, roasted veg, tahini, herbs</div></div><div class="menu-item-price">14.00</div></div>
    <div class="menu-item"><div><div class="menu-item-name">Daily Pastry</div><div class="menu-item-desc">Ask what's fresh — it changes daily</div></div><div class="menu-item-price">5.50</div></div>
  </div>
</section>

<section class="gallery-row">
  <div class="gallery-row-item"><img src="{$img}/vs-gal_crema-topdown_food-coffee_dark_light-text.jpeg" alt="Latte art"></div>
  <div class="gallery-row-item"><img src="{$img}/vs-gal_golden-croissant_food-bakery_warm_dark-text.jpeg" alt="Pastries"></div>
  <div class="gallery-row-item"><img src="{$img}/vs-gal_marble-latte_food-coffee_light_dark-text.jpeg" alt="Interior"></div>
</section>

<section class="quote">
  <blockquote>"The kind of café you describe to friends<br>by how it makes you feel."</blockquote>
</section>

<section class="hours">
  <div class="hours-panel">
    <h3>Opening Hours</h3>
    <div class="hours-row"><span>Monday – Friday</span><span>7:00 – 17:00</span></div>
    <div class="hours-row"><span>Saturday</span><span>8:00 – 18:00</span></div>
    <div class="hours-row"><span>Sunday</span><span>8:30 – 16:00</span></div>
  </div>
  <div class="hours-panel">
    <h3>Find Us</h3>
    <div style="font-size: 0.9rem; color: {$muted}; line-height: 1.8;">
      42 Elm Street<br>Fitzroy, Melbourne 3065<br><br>
      On the corner of Elm and Rose,<br>behind the vintage bookshop.
    </div>
  </div>
</section>

<footer class="footer">Ember & Oak · Slow roasts, good company.</footer>
</body>
</html>
HTML;
        return;
    }

    // ── Fallback: should not reach here ──
    // If a new design is added but has no custom preview yet,
    // show a minimal branded placeholder.
    header('Content-Type: text/html; charset=utf-8');
    echo <<<HTML
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{$name}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:{$body};background:{$bg};color:{$ink};display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;-webkit-font-smoothing:antialiased}h1{font-family:{$heading};font-size:2rem;font-weight:400;margin-bottom:8px}p{color:{$muted};font-size:0.9rem}</style>
</head><body><div><h1>{$name}</h1><p>Preview coming soon</p></div></body></html>
HTML;
    return;
}




// ═══════════════════════════════════════════
//  AI & Conversations
// ═══════════════════════════════════════════

if ($path === '/ai/history') {
    jsonResponse(['ok' => true, 'data' => ['prompts' => []]]);
    return;
}

if ($path === '/ai/conversations') {
    jsonResponse(['ok' => true, 'data' => ['conversations' => []]]);
    return;
}

if (str_starts_with($path, '/ai/conversations/')) {
    jsonResponse(['ok' => false, 'error' => [
        'code'    => 'not_found',
        'message' => 'Conversation not found.',
    ]], 404);
    return;
}

if ($path === '/ai/diagnostics') {
    jsonResponse(['ok' => true, 'data' => [
        'status' => 'demo',
        'message' => 'AI diagnostics are not available in demo mode.',
    ]]);
    return;
}

if (str_starts_with($path, '/ai/actions/')) {
    // Individual action detail — passthrough is handled by DemoMode::shouldOverride
    // which checks PASSTHROUGH_ROUTES first. If we got here, it's a parametric
    // route like /ai/actions/:id that should be overridden.
    jsonResponse(['ok' => false, 'error' => [
        'code'    => 'not_found',
        'message' => 'Action not found.',
    ]], 404);
    return;
}


// ═══════════════════════════════════════════
//  Revisions
// ═══════════════════════════════════════════

if ($path === '/revisions/state') {
    jsonResponse(['ok' => true, 'data' => [
        'can_undo' => false,
        'can_redo' => false,
    ]]);
    return;
}

if ($path === '/revisions/list') {
    jsonResponse(['ok' => true, 'data' => [
        'revisions' => [],
    ]]);
    return;
}


// ═══════════════════════════════════════════
//  Assets
// ═══════════════════════════════════════════

if ($path === '/assets') {
    $now = time();
    $docRoot = dirname(__DIR__, 3);
    $category = $_GET['category'] ?? null;
    $assets = [];

    // 4 curated gallery images as demo assets
    $galleryImages = [
        'vs-gal_concrete-frame_architecture-minimal_light_dark-text.jpeg',
        'vs-gal_arched-courtyard_architecture-hospitality_warm_dark-text.jpeg',
        'vs-gal_balanced-cairn_wellness-zen_cool_light-text.jpeg',
        'vs-gal_cafe-cortado_food-coffee_dark_light-text.jpeg',
    ];

    if (!$category || $category === 'images') {
        foreach ($galleryImages as $i => $filename) {
            $absPath = $docRoot . '/assets/library/gallery/' . $filename;
            $size = is_file($absPath) ? (int) filesize($absPath) : 128000;
            $assets[] = [
                'path'      => '/assets/library/gallery/' . $filename,
                'filename'  => $filename,
                'extension' => 'png',
                'category'  => 'images',
                'size'      => $size,
                'modified'  => date('Y-m-d H:i:s', $now - ($i * 86400)),
                'width'     => 800,
                'height'    => 800,
                'thumbnail' => '/assets/library/gallery/' . $filename,
                'meta'      => ['alt' => ucwords(str_replace(['-', '_', 'vs-gal '], [' ', ' ', ''], pathinfo($filename, PATHINFO_FILENAME)))],
            ];
        }
    }

    // CSS and JS assets (matching the live scan of /assets/css and /assets/js)
    $codeAssets = [
        ['path' => '/assets/css/style.css',    'filename' => 'style.css',    'ext' => 'css', 'cat' => 'css'],
        ['path' => '/assets/css/tailwind.css',  'filename' => 'tailwind.css',  'ext' => 'css', 'cat' => 'css'],
        ['path' => '/assets/js/main.js',        'filename' => 'main.js',       'ext' => 'js',  'cat' => 'js'],
        ['path' => '/assets/js/navigation.js',  'filename' => 'navigation.js', 'ext' => 'js',  'cat' => 'js'],
        ['path' => '/assets/js/form-handler.js', 'filename' => 'form-handler.js', 'ext' => 'js', 'cat' => 'js'],
    ];

    foreach ($codeAssets as $i => $ca) {
        if ($category && $category !== $ca['cat']) continue;
        // Use demo copy size if available, fall back to live
        $studioDir = dirname(__DIR__, 2);
        $demoCopy = $studioDir . '/demo/assets/' . substr($ca['path'], 8); // strip '/assets/'
        $liveCopy = $docRoot . $ca['path'];
        $absPath = is_file($demoCopy) ? $demoCopy : (is_file($liveCopy) ? $liveCopy : null);
        $size = $absPath ? (int) filesize($absPath) : 4096;

        $assets[] = [
            'path'      => $ca['path'],
            'filename'  => $ca['filename'],
            'extension' => $ca['ext'],
            'category'  => $ca['cat'],
            'size'      => $size,
            'modified'  => date('Y-m-d H:i:s', $now - (($i + 3) * 86400)),
        ];
    }

    jsonResponse(['ok' => true, 'data' => [
        'assets' => $assets,
        'count'  => count($assets),
    ]]);
    return;
}


// ═══════════════════════════════════════════
//  Snapshots
// ═══════════════════════════════════════════

if ($path === '/snapshots') {
    jsonResponse(['ok' => true, 'data' => [
        'snapshots' => [],
    ]]);
    return;
}


// ═══════════════════════════════════════════
//  Forms & Submissions
// ═══════════════════════════════════════════

if ($path === '/forms') {
    $now = time();
    jsonResponse(['ok' => true, 'data' => [
        'forms' => [
            [
                'id'          => 'contact',
                'name'        => 'Contact Form',
                'description' => 'General enquiries from the contact page.',
                'fields'      => 3,
                'total'       => 4,
                'unread'      => 1,
                'created'     => gmdate('c', $now - 86400 * 14),
            ],
        ],
        'total_unread' => 1,
    ]]);
    return;
}

if (str_starts_with($path, '/forms/')) {
    // /forms/:formId, /forms/:formId/submissions, etc.
    if (str_contains($path, '/submissions/export')) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'forbidden',
            'message' => 'Export is not available in demo mode.',
        ]], 403);
        return;
    }

    if (str_contains($path, '/submissions')) {
        $now = time();
        $allSubmissions = [
            [
                'id'         => 1,
                'form_id'    => 'contact',
                'data'       => ['name' => 'Olivia Chen', 'email' => 'olivia@example.com', 'message' => "We're looking for a studio to handle our brand refresh. Love what you did with the architectural photography — could we set up a call next week?"],
                'status'     => 'new',
                'source'     => 'web',
                'ip_address' => '203.0.113.42',
                'user_agent' => 'Mozilla/5.0',
                'referrer'   => 'https://example.com/',
                'created_at' => gmdate('c', $now - 3600 * 4),
                'updated_at' => null,
                'read_at'    => null,
                'notes'      => null,
            ],
            [
                'id'         => 2,
                'form_id'    => 'contact',
                'data'       => ['name' => 'James Wright', 'email' => 'james@example.com', 'message' => 'Hi there — we have a product launch in Q3 and need identity, website, and packaging. What does your process look like for a full-scope engagement?'],
                'status'     => 'read',
                'source'     => 'web',
                'ip_address' => '198.51.100.17',
                'user_agent' => 'Mozilla/5.0',
                'referrer'   => 'https://example.com/work',
                'created_at' => gmdate('c', $now - 86400 * 2),
                'updated_at' => gmdate('c', $now - 86400),
                'read_at'    => gmdate('c', $now - 86400),
                'notes'      => null,
            ],
            [
                'id'         => 3,
                'form_id'    => 'contact',
                'data'       => ['name' => 'Sara Lindqvist', 'email' => 'sara@example.com', 'message' => 'Beautiful work. We run a small architecture practice and are interested in a website that feels as considered as our buildings. Would love to discuss.'],
                'status'     => 'replied',
                'source'     => 'web',
                'ip_address' => '192.0.2.88',
                'user_agent' => 'Mozilla/5.0',
                'referrer'   => 'https://example.com/studio',
                'created_at' => gmdate('c', $now - 86400 * 5),
                'updated_at' => gmdate('c', $now - 86400 * 3),
                'read_at'    => gmdate('c', $now - 86400 * 4),
                'notes'      => 'Sent portfolio PDF and availability.',
            ],
            [
                'id'         => 4,
                'form_id'    => 'contact',
                'data'       => ['name' => 'Tom Baker', 'email' => 'tom@example.com', 'message' => 'Quick question — do you offer ongoing retainer packages for brand maintenance, or is it project-based only?'],
                'status'     => 'archived',
                'source'     => 'web',
                'ip_address' => '198.51.100.200',
                'user_agent' => 'Mozilla/5.0',
                'referrer'   => 'https://example.com/services',
                'created_at' => gmdate('c', $now - 86400 * 10),
                'updated_at' => gmdate('c', $now - 86400 * 8),
                'read_at'    => gmdate('c', $now - 86400 * 9),
                'notes'      => 'Referred to partnership page.',
            ],
        ];

        // Apply filters matching forms.js query params
        $filterStatus = $_GET['status'] ?? null;
        $filterSource = $_GET['source'] ?? null;
        $filterSearch = $_GET['search'] ?? null;
        $page    = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($_GET['per_page'] ?? 20)));

        $filtered = $allSubmissions;

        if ($filterStatus && $filterStatus !== 'all') {
            $filtered = array_filter($filtered, fn($s) => $s['status'] === $filterStatus);
        }
        if ($filterSource && $filterSource !== 'all') {
            $filtered = array_filter($filtered, fn($s) => $s['source'] === $filterSource);
        }
        if ($filterSearch) {
            $q = mb_strtolower($filterSearch);
            $filtered = array_filter($filtered, function ($s) use ($q) {
                $blob = mb_strtolower(json_encode($s['data'], JSON_UNESCAPED_UNICODE));
                return str_contains($blob, $q);
            });
        }

        $filtered = array_values($filtered);
        $total = count($filtered);
        $offset = ($page - 1) * $perPage;
        $paged  = array_slice($filtered, $offset, $perPage);

        jsonResponse(['ok' => true, 'data' => [
            'submissions' => $paged,
            'total'       => $total,
            'page'        => $page,
            'per_page'    => $perPage,
        ]]);
        return;
    }

    // Individual form detail: /forms/contact
    $now = time();
    jsonResponse(['ok' => true, 'data' => [
        'form' => [
            'id'          => 'contact',
            'name'        => 'Contact Form',
            'description' => 'General enquiries from the contact page.',
            'fields'      => [
                ['name' => 'name',    'label' => 'Full Name', 'type' => 'text',     'required' => true],
                ['name' => 'email',   'label' => 'Email',     'type' => 'email',    'required' => true],
                ['name' => 'message', 'label' => 'Message',   'type' => 'textarea', 'required' => true],
            ],
            'created_at' => gmdate('c', $now - 86400 * 14),
        ],
        'stats' => [
            'total'    => 4,
            'new'      => 1,
            'read'     => 1,
            'replied'  => 1,
            'archived' => 1,
        ],
    ]]);
    return;
}


// ═══════════════════════════════════════════
//  Agentic Actions (shared definitions)
// ═══════════════════════════════════════════

// Single source of truth for demo action definitions.
// Used by: manifest, list, detail, records, and bar-settings.
// Moved above the manifest handler so both consumers read the same data.

$demoBarSettings = [
    'theme'        => 'bottom-bar',
    'visibility'   => 'all-pages',
    'pages'        => [],
    'color_scheme' => 'light',
    'brand_color'  => '#EA580C',
];

$demoActions = [
    'book-consultation' => [
        'id'          => 'book-consultation',
        'name'        => 'Book a Consultation',
        'description' => 'Schedule a free 30-minute discovery call to discuss your project.',
        'icon'        => 'calendar',
        'active'      => true,
        'version'     => 1,
        'order'       => 0,
        'created_at'  => gmdate('c', time() - 86400 * 21),
        'updated_at'  => gmdate('c', time() - 86400 * 3),
        'fields'      => [
            ['name' => 'name',            'label' => 'Your Name',       'type' => 'text',     'required' => true],
            ['name' => 'email',           'label' => 'Email Address',   'type' => 'email',    'required' => true],
            ['name' => 'preferred_date',  'label' => 'Preferred Date',  'type' => 'date',     'required' => true],
            ['name' => 'project_brief',   'label' => 'Project Brief',   'type' => 'textarea', 'required' => false],
        ],
        'confirmation_message' => 'Thanks! We\'ll confirm your consultation within 24 hours.',
        'notification_email'   => 'studio@example.com',
        'responses'            => ['success' => 'Thanks! We\'ll confirm your consultation within 24 hours.'],
        '_stats' => [
            'total' => 3, 'today' => 1,
            'last_created_at' => gmdate('c', time() - 3600 * 2),
            'by_status' => ['pending' => 1, 'confirmed' => 1, 'completed' => 1],
        ],
    ],
    'request-quote' => [
        'id'          => 'request-quote',
        'name'        => 'Request a Quote',
        'description' => 'Get a detailed proposal for brand identity, web design, or creative direction.',
        'icon'        => 'file-text',
        'active'      => true,
        'version'     => 1,
        'order'       => 1,
        'created_at'  => gmdate('c', time() - 86400 * 14),
        'updated_at'  => gmdate('c', time() - 86400 * 1),
        'fields'      => [
            ['name' => 'company',    'label' => 'Company Name',  'type' => 'text',     'required' => true],
            ['name' => 'email',      'label' => 'Work Email',    'type' => 'email',    'required' => true],
            ['name' => 'services',   'label' => 'Services',      'type' => 'select',   'required' => true, 'options' => ['Brand Identity', 'Web Design', 'Creative Direction', 'Full Package']],
            ['name' => 'budget',     'label' => 'Budget Range',  'type' => 'select',   'required' => false, 'options' => ['Under $5k', '$5k–$15k', '$15k–$50k', '$50k+']],
            ['name' => 'details',    'label' => 'Project Details', 'type' => 'textarea', 'required' => true],
        ],
        'confirmation_message' => 'Your quote request has been received. We\'ll be in touch within 2 business days.',
        'notification_email'   => 'studio@example.com',
        'responses'            => ['success' => 'Your quote request has been received. We\'ll be in touch within 2 business days.'],
        '_stats' => [
            'total' => 5, 'today' => 0,
            'last_created_at' => gmdate('c', time() - 86400),
            'by_status' => ['pending' => 2, 'confirmed' => 3, 'completed' => 0],
        ],
    ],
];


// ═══════════════════════════════════════════
//  Agentic Manifest (preview Actions Bar)
// ═══════════════════════════════════════════

// The preview actions-bar.js fetches GET /agentic/manifest to render buttons.
// Derives the manifest from $demoActions (matching ActionManager::generateManifest()
// shape) so the preview bar and Studio Actions page always agree on fields/schema.
if ($path === '/agentic/manifest') {
    $manifestActions = [];
    foreach ($demoActions as $action) {
        $publicFields = [];
        foreach ($action['fields'] as $field) {
            $publicField = [
                'name'     => $field['name'],
                'type'     => $field['type'],
                'label'    => $field['label'] ?? $field['name'],
                'required' => $field['required'] ?? false,
            ];
            if (!empty($field['options']))   $publicField['options'] = $field['options'];
            if (!empty($field['placeholder'])) $publicField['placeholder'] = $field['placeholder'];
            $publicFields[] = $publicField;
        }
        $manifestActions[] = [
            'id'          => $action['id'],
            'name'        => $action['name'],
            'description' => $action['description'] ?? '',
            'icon'        => $action['icon'] ?? 'circle',
            'fields'      => $publicFields,
            'responses'   => $action['responses'] ?? [],
        ];
    }

    // submit_url points to the demo-safe stub (POST /agentic/demo-submit)
    // handled by router.php — returns a fake success, writes nothing.
    jsonResponse(['ok' => true, 'data' => [
        'actions'      => $manifestActions,
        'site_name'    => 'Studioform',
        'submit_url'   => '/_studio/api/router.php?_path=/agentic/demo-submit',
        'bar_settings' => $demoBarSettings,
    ]]);
    return;
}


// ═══════════════════════════════════════════
//  Agentic Actions
// ═══════════════════════════════════════════

if ($path === '/agentic/actions/bar-settings') {
    jsonResponse(['ok' => true, 'data' => [
        'settings' => $demoBarSettings,
    ]]);
    return;
}

if (str_starts_with($path, '/agentic/actions/')) {
    // /agentic/actions/:id, /agentic/actions/:id/records, etc.
    if (str_contains($path, '/records/export') || str_contains($path, '/files/')) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'forbidden',
            'message' => 'Export is not available in demo mode.',
        ]], 403);
        return;
    }

    // Extract action ID from path
    $pathParts = explode('/', trim($path, '/'));
    // path = /agentic/actions/:id[/records]  →  parts: [agentic, actions, :id, ...]
    $actionId = $pathParts[2] ?? '';

    if (str_contains($path, '/records')) {
        // Return sample records for the first action, with filter support
        if ($actionId === 'book-consultation') {
            $now = time();
            $allRecords = [
                [
                    'id'         => 1,
                    'action_id'  => 'book-consultation',
                    'data'       => ['name' => 'Elara Voss', 'email' => 'elara@example.com', 'preferred_date' => date('Y-m-d', $now + 86400 * 3), 'project_brief' => 'Rebranding our boutique architecture firm — need identity, website, and stationery.'],
                    'status'     => 'pending',
                    'ip_address' => '203.0.113.12',
                    'created_at' => gmdate('c', $now - 3600 * 2),
                    'updated_at' => null,
                ],
                [
                    'id'         => 2,
                    'action_id'  => 'book-consultation',
                    'data'       => ['name' => 'Marcus Webb', 'email' => 'marcus@example.com', 'preferred_date' => date('Y-m-d', $now + 86400 * 7), 'project_brief' => 'We run a wellness retreat and need a new website that reflects our ethos.'],
                    'status'     => 'confirmed',
                    'ip_address' => '198.51.100.34',
                    'created_at' => gmdate('c', $now - 86400 * 3),
                    'updated_at' => gmdate('c', $now - 86400 * 2),
                ],
                [
                    'id'         => 3,
                    'action_id'  => 'book-consultation',
                    'data'       => ['name' => 'Nina Park', 'email' => 'nina@example.com', 'preferred_date' => date('Y-m-d', $now - 86400), 'project_brief' => 'Looking for creative direction on a product launch — packaging and campaign visuals.'],
                    'status'     => 'completed',
                    'ip_address' => '192.0.2.55',
                    'created_at' => gmdate('c', $now - 86400 * 10),
                    'updated_at' => gmdate('c', $now - 86400 * 5),
                ],
            ];

            // Apply filters matching actions.js query params
            $filterStatus = $_GET['status'] ?? null;
            $filterSearch = $_GET['search'] ?? null;
            $page    = max(1, (int) ($_GET['page'] ?? 1));
            $perPage = min(100, max(1, (int) ($_GET['per_page'] ?? 20)));

            $filtered = $allRecords;

            if ($filterStatus && $filterStatus !== 'all') {
                $filtered = array_filter($filtered, fn($r) => $r['status'] === $filterStatus);
            }
            if ($filterSearch) {
                $q = mb_strtolower($filterSearch);
                $filtered = array_filter($filtered, function ($r) use ($q) {
                    $blob = mb_strtolower(json_encode($r['data'], JSON_UNESCAPED_UNICODE));
                    return str_contains($blob, $q);
                });
            }

            $filtered = array_values($filtered);
            $total = count($filtered);
            $offset = ($page - 1) * $perPage;
            $paged  = array_slice($filtered, $offset, $perPage);

            jsonResponse(['ok' => true, 'data' => ['records' => $paged, 'total' => $total, 'page' => $page, 'per_page' => $perPage]]);
        } else {
            jsonResponse(['ok' => true, 'data' => ['records' => [], 'total' => 0, 'page' => 1, 'per_page' => 20]]);
        }
        return;
    }

    // Individual action detail
    if (isset($demoActions[$actionId])) {
        $action = $demoActions[$actionId];
        jsonResponse(['ok' => true, 'data' => ['action' => $action, 'stats' => $action['_stats']]]);
    } else {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Action not found.',
        ]], 404);
    }
    return;
}

// Catch-all for /agentic/actions list (without trailing /)
if ($path === '/agentic/actions') {
    jsonResponse(['ok' => true, 'data' => ['actions' => array_values($demoActions)]]);
    return;
}


// ═══════════════════════════════════════════
//  Settings
// ═══════════════════════════════════════════

if ($path === '/settings') {
    // Must return data.settings envelope matching settings.php:49
    // settings.js:50 reads: s = settingsRes.data?.settings || {}
    $projectRoot = dirname(__DIR__, 3);
    $versionFile = $projectRoot . '/VERSION';
    $version = file_exists($versionFile) ? trim(file_get_contents($versionFile)) : '1.0.0';

    jsonResponse(['ok' => true, 'data' => [
        'settings' => [
            'site_name'        => 'Studioform',
            'site_tagline'     => 'Brand identity and digital design.',
            'site_language'    => 'en',
            'site_url'         => '',
            'site_favicon'     => null,
            'ai_provider'      => 'claude',
            'ai_claude_model'  => 'claude-sonnet-4-20250514',
            'ai_claude_api_key' => null,
            'ai_claude_api_key_set' => false,
            'ai_max_tokens'    => 16000,
            'available_providers' => [
                'claude' => [
                    'id' => 'claude',
                    'name' => 'Anthropic Claude',
                    'models' => [
                        ['id' => 'claude-sonnet-4-5-20250514', 'name' => 'Claude Sonnet 4.5', 'tier' => 'balanced'],
                        ['id' => 'claude-sonnet-4-20250514',   'name' => 'Claude Sonnet 4',   'tier' => 'fast'],
                    ],
                    'config_fields' => [
                        ['key' => 'api_key', 'label' => 'API Key', 'type' => 'password', 'placeholder' => 'sk-ant-api03-...', 'required' => true, 'help_url' => 'https://console.anthropic.com/account/keys', 'help_text' => 'Get a key from Anthropic Console'],
                    ],
                ],
                'openai' => [
                    'id' => 'openai',
                    'name' => 'OpenAI',
                    'models' => [
                        ['id' => 'gpt-4o',      'name' => 'GPT-4o',      'tier' => 'balanced'],
                        ['id' => 'gpt-4o-mini', 'name' => 'GPT-4o Mini', 'tier' => 'fast'],
                        ['id' => 'o3-mini',      'name' => 'o3 Mini',     'tier' => 'fast'],
                    ],
                    'config_fields' => [
                        ['key' => 'api_key', 'label' => 'API Key', 'type' => 'password', 'placeholder' => 'sk-...', 'required' => true, 'help_url' => 'https://platform.openai.com/api-keys', 'help_text' => 'Get a key from OpenAI Platform'],
                    ],
                ],
                'gemini' => [
                    'id' => 'gemini',
                    'name' => 'Google Gemini',
                    'models' => [
                        ['id' => 'gemini-2.0-flash',      'name' => 'Gemini 2.0 Flash',      'tier' => 'fast'],
                        ['id' => 'gemini-2.0-flash-lite', 'name' => 'Gemini 2.0 Flash Lite', 'tier' => 'fast'],
                        ['id' => 'gemini-1.5-pro',        'name' => 'Gemini 1.5 Pro',        'tier' => 'premium'],
                        ['id' => 'gemini-1.5-flash',      'name' => 'Gemini 1.5 Flash',      'tier' => 'fast'],
                    ],
                    'config_fields' => [
                        ['key' => 'api_key', 'label' => 'API Key', 'type' => 'password', 'placeholder' => 'AIza...', 'required' => true, 'help_url' => 'https://aistudio.google.com/apikey', 'help_text' => 'Get a key from Google AI Studio'],
                    ],
                ],
                'deepseek' => [
                    'id' => 'deepseek',
                    'name' => 'DeepSeek',
                    'models' => [
                        ['id' => 'deepseek-chat',     'name' => 'DeepSeek V3', 'tier' => 'balanced'],
                        ['id' => 'deepseek-reasoner', 'name' => 'DeepSeek R1', 'tier' => 'premium'],
                    ],
                    'config_fields' => [
                        ['key' => 'api_key', 'label' => 'API Key', 'type' => 'password', 'placeholder' => 'sk-...', 'required' => true, 'help_url' => 'https://platform.deepseek.com/api_keys', 'help_text' => 'Get a key from DeepSeek Platform'],
                    ],
                ],
                'openai_compatible' => [
                    'id' => 'openai_compatible',
                    'name' => 'OpenAI Compatible',
                    'models' => [],
                    'config_fields' => [
                        ['key' => 'base_url', 'label' => 'Server URL', 'type' => 'url', 'placeholder' => 'http://127.0.0.1:1234', 'required' => true, 'help_text' => 'Ollama: localhost:11434 · LM Studio: 127.0.0.1:1234'],
                        ['key' => 'api_key', 'label' => 'API Key', 'type' => 'password', 'placeholder' => 'Optional for local servers', 'required' => false, 'help_text' => 'Leave empty for Ollama/LM Studio'],
                    ],
                ],
            ],
        ],
    ]]);
    return;
}

if ($path === '/settings/models') {
    jsonResponse(['ok' => true, 'data' => [
        'models' => [],
    ]]);
    return;
}

if ($path === '/settings/system') {
    // Must return data.system envelope matching settings.php:250-265
    // settings.js:51 reads: sys = systemRes.data?.system || {}
    $projectRoot = dirname(__DIR__, 3);
    $versionFile = $projectRoot . '/VERSION';
    $version = file_exists($versionFile) ? trim(file_get_contents($versionFile)) : '1.0.0';

    jsonResponse(['ok' => true, 'data' => [
        'system' => [
            'version'        => $version,
            'php_version'    => PHP_VERSION,
            'sqlite_version' => \SQLite3::version()['versionString'] ?? 'unknown',
            'database_size'  => 0,
            'preview_size'   => 0,
            'assets_size'    => 0,
            'max_upload'     => ini_get('upload_max_filesize') ?: '2M',
            'memory_limit'   => ini_get('memory_limit'),
            'max_execution'  => ini_get('max_execution_time'),
        ],
    ]]);
    return;
}

if ($path === '/settings/mail') {
    // Must return data.config + data.presets matching settings.php:276-279
    // settings.js:67 reads: mailConfig = mailRes.data?.config || {}
    // settings.js:68 reads: mailPresets = mailRes.data?.presets || {}
    // Config keys must match Mailer::getConfig() exactly (Mailer.php:282-293)
    jsonResponse(['ok' => true, 'data' => [
        'config' => [
            'driver'          => 'php_mail',
            'from_address'    => 'hello@example.com',
            'from_name'       => 'Studioform',
            'smtp_host'       => '',
            'smtp_port'       => 587,
            'smtp_username'   => '',
            'smtp_password'   => '',
            'smtp_encryption' => 'tls',
            'mailpit_host'    => 'localhost',
            'mailpit_port'    => 1025,
        ],
        'presets' => [],
    ]]);
    return;
}

if ($path === '/settings/mail/log') {
    jsonResponse(['ok' => true, 'data' => ['entries' => []]]);
    return;
}

if ($path === '/settings/usage') {
    // Must match the shape at settings.php:475-483 that settings.js:65 expects:
    // usageData.models.length (line 409) and usageData.totals.request_count (line 413)
    jsonResponse(['ok' => true, 'data' => [
        'models' => [],
        'totals' => [
            'request_count'       => 0,
            'total_input_tokens'  => 0,
            'total_output_tokens' => 0,
            'total_cost'          => 0,
        ],
    ]]);
    return;
}

if ($path === '/settings/logs') {
    jsonResponse(['ok' => true, 'data' => ['logs' => []]]);
    return;
}

if ($path === '/settings/logs/download') {
    jsonResponse(['ok' => false, 'error' => [
        'code'    => 'forbidden',
        'message' => 'Log download is not available in demo mode.',
    ]], 403);
    return;
}


// ═══════════════════════════════════════════
//  Notes
// ═══════════════════════════════════════════

if ($path === '/notes') {
    $demoNotes = DemoDataProvider::notes();
    jsonResponse(['ok' => true, 'data' => ['notes' => $demoNotes]]);
    return;
}

if ($path === '/notes/search') {
    $demoNotes = DemoDataProvider::notes();
    $q = strtolower(trim($_GET['q'] ?? ''));

    if ($q !== '') {
        $demoNotes = array_values(array_filter($demoNotes, static function (array $n) use ($q): bool {
            return str_contains(strtolower($n['title']), $q)
                || str_contains(strtolower($n['body']), $q);
        }));
    }

    jsonResponse(['ok' => true, 'data' => ['notes' => $demoNotes]]);
    return;
}

if (str_starts_with($path, '/notes/')) {
    // /notes/:id — detail view
    $noteId = (int) trim(substr($path, strlen('/notes/')), '/');
    $demoNotes = DemoDataProvider::notes();
    $note = null;
    foreach ($demoNotes as $n) {
        if ($n['id'] === $noteId) {
            $note = $n;
            break;
        }
    }

    if (!$note) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Note not found.',
        ]], 404);
        return;
    }

    jsonResponse(['ok' => true, 'data' => ['note' => $note]]);
    return;
}


// ═══════════════════════════════════════════
//  Team
// ═══════════════════════════════════════════

if ($path === '/team') {
    jsonResponse(['ok' => true, 'data' => DemoDataProvider::team()]);
    return;
}


// ═══════════════════════════════════════════
//  Update / Misc
// ═══════════════════════════════════════════

if ($path === '/update/dist-packages') {
    jsonResponse(['ok' => true, 'data' => ['packages' => []]]);
    return;
}


// ═══════════════════════════════════════════
//  Fallback — should not reach here
// ═══════════════════════════════════════════

// If shouldOverride() matched but no handler caught it,
// return a safe stub rather than leaking live data.
jsonResponse(['ok' => true, 'data' => []]);
