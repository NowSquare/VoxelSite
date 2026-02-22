<?php

declare(strict_types=1);

/**
 * Export Endpoint
 *
 * POST /export — Download the published website as a ZIP archive.
 *
 * Supports two formats:
 *   - php  → Complete PHP website with pages, partials, assets, and form handler.
 *   - html → Static HTML export with pages rendered to plain .html files.
 *
 * The export reads from the PUBLISHED production state (document root),
 * NOT from the preview directory. This ensures downloads always reflect
 * what is live.
 *
 * Asset bundling includes only referenced assets — files in the library
 * but not referenced by any page are excluded.
 *
 * Remote images from the VoxelSite curated library are fetched and
 * saved locally in assets/images/ with URL references rewritten.
 *
 * ZIP is streamed directly to the browser — no temp file on disk.
 */

use VoxelSite\Database;
use VoxelSite\Logger;
use VoxelSite\Settings;

$method = $_REQUEST['_route_method'];
$path   = $_REQUEST['_route_path'];

if ($method !== 'POST' || $path !== '/export') {
    jsonResponse(['ok' => false, 'error' => [
        'code'    => 'not_found',
        'message' => 'Export endpoint not found.',
    ]], 404);
    return;
}

// ── Parse request ──
$body = getJsonBody();
$format = $body['format'] ?? 'php';

if (!in_array($format, ['php', 'html'], true)) {
    jsonResponse(['ok' => false, 'error' => [
        'code'    => 'invalid_format',
        'message' => 'Format must be "php" or "html".',
    ]], 400);
    return;
}

$db       = Database::getInstance();
$settings = new Settings($db);
$docRoot  = dirname(__DIR__, 3);
$assetsDir = $docRoot . '/assets';

// ── Verify the site has been published at least once ──
$lastPublished = $settings->get('last_published_at');
if (empty($lastPublished)) {
    jsonResponse(['ok' => false, 'error' => [
        'code'    => 'not_published',
        'message' => 'Your site has not been published yet. Publish first, then download.',
    ]], 422);
    return;
}

// ── Build the site slug for the ZIP filename ──
$siteName = $settings->get('site_name', 'my-site');
$siteSlug = preg_replace('/[^a-z0-9]+/i', '-', strtolower(trim($siteName)));
$siteSlug = trim($siteSlug, '-') ?: 'site';
$dateStamp = date('Y-m-d');
$zipFilename = "{$siteSlug}-{$format}-{$dateStamp}.zip";

// ── Collect production PHP pages ──
$phpPages = [];
foreach (glob($docRoot . '/*.php') ?: [] as $file) {
    $basename = basename($file);
    // Never include Studio, form handler internals, or system files
    if (in_array($basename, ['_studio.php', 'LocalValetDriver.php', 'test_list.php', 'submit.php', 'mcp.php'], true)) {
        continue;
    }
    $phpPages[] = $basename;
}

if (empty($phpPages)) {
    jsonResponse(['ok' => false, 'error' => [
        'code'    => 'no_pages',
        'message' => 'No published pages found to export.',
    ]], 422);
    return;
}

// ── Collect partials ──
$partials = [];
$partialsDir = $docRoot . '/_partials';
if (is_dir($partialsDir)) {
    foreach (glob($partialsDir . '/*.php') ?: [] as $file) {
        $partials[] = '_partials/' . basename($file);
    }
}

// ── Read all page content to discover referenced assets ──
$allPageContent = '';
foreach ($phpPages as $page) {
    $content = file_get_contents($docRoot . '/' . $page);
    if ($content !== false) $allPageContent .= $content;
}
foreach ($partials as $partial) {
    $content = file_get_contents($docRoot . '/' . $partial);
    if ($content !== false) $allPageContent .= $content;
}

// Also read CSS files for any url() references
$cssContent = '';
$cssDir = $assetsDir . '/css';
if (is_dir($cssDir)) {
    foreach (glob($cssDir . '/*.css') ?: [] as $cssFile) {
        $content = file_get_contents($cssFile);
        if ($content !== false) $cssContent .= $content;
    }
}

// ── Collect referenced assets ──
// CSS and JS are always needed and always included fully.
// Everything else (images, library, fonts, etc.) is only included
// if referenced in the page content, CSS, or JS — this avoids
// bundling hundreds of unused curated library images.
$assetFiles = [];

// Also read JS files for asset references (e.g. lazy-loaded images)
$jsContent = '';
$jsDir = $assetsDir . '/js';
if (is_dir($jsDir)) {
    foreach (glob($jsDir . '/*.js') ?: [] as $jsFile) {
        $content = file_get_contents($jsFile);
        if ($content !== false) $jsContent .= $content;
    }
}

// Combine all content for reference checking
$allContent = $allPageContent . $cssContent . $jsContent;

// Always include css/ and js/ directories fully
foreach (['css', 'js'] as $alwaysDir) {
    $dir = $assetsDir . '/' . $alwaysDir;
    if (!is_dir($dir)) continue;
    collectDirectoryFiles($dir, $assetsDir, $assetFiles);
}

// Selectively include assets from all other directories.
// Only files whose path or filename appears in the combined content
// of PHP pages, partials, CSS, or JS will be bundled.
foreach (['images', 'library', 'fonts', 'uploads', 'files', 'icons', 'data'] as $subdir) {
    $dir = $assetsDir . '/' . $subdir;
    if (!is_dir($dir)) continue;

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($iterator as $file) {
        if (!$file->isFile()) continue;
        $basename = $file->getBasename();
        if (str_starts_with($basename, '.')) continue;

        $relativePath = $subdir . '/' . ltrim(
            str_replace($dir, '', $file->getPathname()),
            DIRECTORY_SEPARATOR
        );
        $relativePath = str_replace('\\', '/', $relativePath);

        // Include if the path or filename appears anywhere in pages/css/js
        if (str_contains($allContent, $relativePath)
            || str_contains($allContent, $basename)) {
            $assetFiles[$relativePath] = $file->getPathname();
        }
}
}

// ── Discover and fetch remote images ──
// Look for remote image URLs and download them for inclusion
$remoteImages = [];
if (preg_match_all('#https?://[^"\'>\s]+\.(?:jpg|jpeg|png|gif|webp|svg)#i', $allPageContent, $matches)) {
    $seen = [];
    foreach ($matches[0] as $url) {
        if (isset($seen[$url])) continue;
        $seen[$url] = true;

        $host = parse_url($url, PHP_URL_HOST);
        if (!$host) continue;

        // Skip CDN/font URLs — only fetch actual image assets
        if (str_contains($host, 'fonts.googleapis.com')
            || str_contains($host, 'fonts.gstatic.com')
            || str_contains($host, 'cdnjs.cloudflare.com')) {
            continue;
        }

        // Generate a local filename from the URL
        $urlPath = parse_url($url, PHP_URL_PATH);
        $remoteBasename = basename($urlPath ?: 'image.jpg');
        $safeName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $remoteBasename);
        $localRelPath = 'images/' . $safeName;

        // Avoid collisions
        $counter = 1;
        while (isset($assetFiles[$localRelPath]) || isset($remoteImages[$localRelPath])) {
            $ext = pathinfo($safeName, PATHINFO_EXTENSION);
            $stem = pathinfo($safeName, PATHINFO_FILENAME);
            $localRelPath = "images/{$stem}_{$counter}.{$ext}";
            $counter++;
        }

        $remoteImages[$localRelPath] = $url;
    }
}

// ── Include favicon ──
$faviconPath = $docRoot . '/favicon.ico';
$includeFavicon = file_exists($faviconPath)
    && (str_contains($allPageContent, 'favicon') || str_contains($allPageContent, 'favicon.ico'));

// ── Build the ZIP in memory ──
$zip = new ZipArchive();
$tmpFile = tempnam(sys_get_temp_dir(), 'vs_export_');

if ($zip->open($tmpFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
    @unlink($tmpFile);
    jsonResponse(['ok' => false, 'error' => [
        'code'    => 'zip_failed',
        'message' => 'Could not create export archive.',
    ]], 500);
    return;
}

$prefix = $siteSlug . '/';

// ── Add pages ──
foreach ($phpPages as $page) {
    $content = file_get_contents($docRoot . '/' . $page);
    if ($content === false) continue;

    if ($format === 'html') {
        // Render PHP to HTML via output buffering
        $htmlContent = renderPhpToHtml($docRoot . '/' . $page, $docRoot);
        if ($htmlContent !== null) {
            // Rewrite .php links to .html
            $htmlContent = rewritePhpLinksToHtml($htmlContent);
            // Rewrite absolute paths to relative so files work from desktop
            $htmlContent = rewriteAbsolutePathsToRelative($htmlContent, $phpPages);
            // Rewrite remote image URLs to local paths
            foreach ($remoteImages as $localPath => $remoteUrl) {
                $htmlContent = str_replace($remoteUrl, 'assets/' . $localPath, $htmlContent);
            }
            $htmlPage = preg_replace('/\.php$/', '.html', $page);
            $zip->addFromString($prefix . $htmlPage, $htmlContent);
        }
    } else {
        // PHP export — rewrite remote image URLs
        foreach ($remoteImages as $localPath => $remoteUrl) {
            $content = str_replace($remoteUrl, 'assets/' . $localPath, $content);
        }
        $zip->addFromString($prefix . $page, $content);
    }
}

// ── Add partials (PHP only) ──
if ($format === 'php') {
    foreach ($partials as $partial) {
        $content = file_get_contents($docRoot . '/' . $partial);
        if ($content === false) continue;
        // Rewrite remote image URLs
        foreach ($remoteImages as $localPath => $remoteUrl) {
            $content = str_replace($remoteUrl, 'assets/' . $localPath, $content);
        }
        $zip->addFromString($prefix . $partial, $content);
    }
}

// ── Add local assets ──
foreach ($assetFiles as $relPath => $absPath) {
    if (is_file($absPath)) {
        $zip->addFile($absPath, $prefix . 'assets/' . $relPath);
    }
}

// ── Fetch and add remote images ──
foreach ($remoteImages as $localPath => $remoteUrl) {
    $imageData = @file_get_contents($remoteUrl, false, stream_context_create([
        'http' => [
            'timeout' => 10,
            'user_agent' => 'VoxelSite Export/1.0',
        ],
        'ssl' => [
            'verify_peer' => false,
        ],
    ]));

    if ($imageData !== false && strlen($imageData) > 0) {
        $zip->addFromString($prefix . 'assets/' . $localPath, $imageData);
    }
}

// ── Add favicon ──
if ($includeFavicon) {
    $zip->addFile($faviconPath, $prefix . 'favicon.ico');
}

// ── PHP-only extras: mcp.php, robots.txt, llms.txt ──
if ($format === 'php') {
    // Include mcp.php (MCP server for AI agents)
    // Remove the vendor/autoload.php dependency since the export doesn't
    // include the vendor directory. Read-only tools (business info, menu,
    // FAQ, services) work standalone — they just read JSON files.
    $mcpPath = $docRoot . '/mcp.php';
    if (file_exists($mcpPath)) {
        $mcpContent = file_get_contents($mcpPath);
        // Remove the require vendor/autoload.php line
        $mcpContent = preg_replace(
            "/require_once\s+.*?vendor\/autoload\.php['\"];\s*\n/",
            "// vendor/autoload.php not included in export\n",
            $mcpContent
        );
        $zip->addFromString($prefix . 'mcp.php', $mcpContent);
    }

    // Include robots.txt (stripped of _studio references)
    $robotsPath = $docRoot . '/robots.txt';
    if (file_exists($robotsPath)) {
        $robotsContent = file_get_contents($robotsPath);
        // Remove Disallow: /_studio/ lines (no Studio in exports)
        $robotsContent = preg_replace('/^Disallow:\s*\/_studio\/\s*$/m', '', $robotsContent);
        // Clean up double blank lines
        $robotsContent = preg_replace("/\n{3,}/", "\n\n", trim($robotsContent)) . "\n";
        $zip->addFromString($prefix . 'robots.txt', $robotsContent);
    }

    // Include llms.txt (AI site description)
    $llmsPath = $docRoot . '/llms.txt';
    if (file_exists($llmsPath)) {
        $zip->addFile($llmsPath, $prefix . 'llms.txt');
    }
}

// ── Add .htaccess for PHP exports (basic rewrite rules) ──
if ($format === 'php') {
    $htaccessContent = generateExportHtaccess();
    $zip->addFromString($prefix . '.htaccess', $htaccessContent);
}

$zip->close();

// ── Stream the ZIP to the browser ──
$fileSize = filesize($tmpFile);

// Override the default JSON Content-Type set by router
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $zipFilename . '"');
header('Content-Length: ' . $fileSize);
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');

readfile($tmpFile);
@unlink($tmpFile);

Logger::info('system', 'Website exported', [
    'format'       => $format,
    'filename'     => $zipFilename,
    'pages'        => count($phpPages),
    'assets'       => count($assetFiles),
    'remote_images' => count($remoteImages),
    'size_bytes'   => $fileSize,
]);

exit;

// ═══════════════════════════════════════════
//  Helper Functions
// ═══════════════════════════════════════════

/**
 * Collect all files in a directory recursively into the $files array.
 *
 * @param string $dir      Absolute path to scan
 * @param string $baseDir  Base directory to compute relative paths from
 * @param array  $files    Output array: relativePath => absolutePath
 */
function collectDirectoryFiles(string $dir, string $baseDir, array &$files): void
{
    if (!is_dir($dir)) return;

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($iterator as $file) {
        if (!$file->isFile()) continue;
        $basename = $file->getBasename();
        if (str_starts_with($basename, '.')) continue;

        $relativePath = ltrim(
            str_replace($baseDir, '', $file->getPathname()),
            DIRECTORY_SEPARATOR
        );
        $relativePath = str_replace('\\', '/', $relativePath);
        $files[$relativePath] = $file->getPathname();
    }
}

/**
 * Render a PHP file to HTML string using output buffering.
 *
 * Changes working directory to the document root so that
 * relative includes (like _partials/nav.php) resolve correctly.
 *
 * @return string|null The rendered HTML, or null on failure
 */
function renderPhpToHtml(string $phpFilePath, string $docRoot): ?string
{
    if (!file_exists($phpFilePath)) {
        return null;
    }

    $originalDir = getcwd();

    try {
        chdir($docRoot);
        ob_start();
        include $phpFilePath;
        $html = ob_get_clean();
        chdir($originalDir);
        return $html ?: null;
    } catch (\Throwable $e) {
        ob_end_clean();
        chdir($originalDir);
        return null;
    }
}

/**
 * Rewrite internal .php links to .html in rendered HTML content.
 *
 * Converts href="about.php" → href="about.html",
 * href="contact.php" → href="contact.html", etc.
 * Also handles relative paths like href="./about.php".
 */
function rewritePhpLinksToHtml(string $html): string
{
    // Rewrite href attributes pointing to .php files
    $html = preg_replace(
        '/href="([^"]*?)\.php"/i',
        'href="$1.html"',
        $html
    );

    // Rewrite action attributes on forms (may point to .php)
    // But keep submit.php references since there's no submit handler in HTML exports
    $html = preg_replace(
        '/action="(?!submit\.php)([^"]*?)\.php"/i',
        'action="$1.html"',
        $html
    );

    return $html;
}

/**
 * Rewrite absolute paths to relative paths in HTML content.
 *
 * Converts:
 *   /assets/css/style.css  → assets/css/style.css
 *   /favicon.ico           → favicon.ico
 *   /about                 → about.html (clean URLs)
 *   /                      → index.html
 *
 * The $phpPages array (e.g. ['index.php', 'about.php', 'contact.php'])
 * is used to build the list of known page slugs so that clean URLs
 * like /about are rewritten to about.html. Only known pages are
 * rewritten — external or unknown paths are left untouched.
 */
function rewriteAbsolutePathsToRelative(string $html, array $phpPages = []): string
{
    // Rewrite src="/assets/..." and href="/assets/..."
    $html = preg_replace(
        '/((?:src|href|poster|action)\s*=\s*["\'])\/(assets\/)/i',
        '$1$2',
        $html
    );

    // Rewrite src="/favicon.ico" href="/favicon.ico"
    $html = preg_replace(
        '/((?:src|href)\s*=\s*["\'])\/favicon\.ico/i',
        '${1}favicon.ico',
        $html
    );

    // Rewrite url(/assets/...) in inline styles
    $html = preg_replace(
        '/url\(\s*(["\']?)\/(assets\/)/i',
        'url($1$2',
        $html
    );

    // Build a list of known page slugs from the PHP filenames
    // e.g. ['index.php', 'about.php'] → ['index', 'about']
    $slugs = [];
    foreach ($phpPages as $page) {
        $slug = preg_replace('/\.php$/', '', $page);
        if ($slug !== '' && $slug !== 'index') {
            $slugs[] = preg_quote($slug, '/');
        }
    }

    // Rewrite clean URLs: /about → about.html, /contact → contact.html
    // Only rewrites known page slugs to avoid breaking external links
    if (!empty($slugs)) {
        $slugPattern = implode('|', $slugs);
        $html = preg_replace(
            '/(href\s*=\s*["\'])\/(' . $slugPattern . ')(["\'])/i',
            '$1$2.html$3',
            $html
        );
    }

    // Root "/" link → index.html
    $html = preg_replace(
        '/(href\s*=\s*["\'])\/(["\'])/i',
        '${1}index.html${2}',
        $html
    );

    return $html;
}

/**
 * Generate a minimal .htaccess for PHP exports.
 */
function generateExportHtaccess(): string
{
    return <<<'HTACCESS'
# VoxelSite Exported Site
# Basic configuration for Apache/shared hosting

# Enable URL rewriting
<IfModule mod_rewrite.c>
    RewriteEngine On
</IfModule>

# Serve correct MIME types
<IfModule mod_mime.c>
    AddType text/css .css
    AddType application/javascript .js
    AddType image/svg+xml .svg
    AddType image/webp .webp
    AddType font/woff2 .woff2
    AddType font/woff .woff
</IfModule>

# Cache static assets (1 year)
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
</IfModule>
HTACCESS;
}
