<?php

declare(strict_types=1);

/**
 * Assets API Endpoints
 *
 * GET    /assets         — List all assets (scanned from filesystem)
 * POST   /assets/upload  — Upload file(s) to /assets/
 * PUT    /assets/meta    — Update asset metadata (alt text, etc.)
 * DELETE /assets         — Delete an asset file
 * POST   /assets/folder  — Create a subfolder
 *
 * Philosophy: The filesystem IS the database.
 * No assets table. AssetManager scans directories on demand.
 * Files added via FTP/cPanel appear automatically.
 * A JSON sidecar stores non-derivable metadata (alt text).
 */

$method = $_REQUEST['_route_method'];
$path   = $_REQUEST['_route_path'];

$docRoot   = dirname(__DIR__, 3);
$assetsDir = $docRoot . '/assets';
$metaFile  = dirname(__DIR__, 2) . '/data/assets-meta.json';

/**
 * Check if a resolved path is inside the assets directory.
 * Works with both real directories and symlinked shared paths
 * (e.g. Forge atomic deployments where assets/ -> shared/assets/).
 */
function isInsideAssetsDir(string $targetPath, string $assetsDir): bool
{
    // Normalise the logical path (without resolving symlinks)
    $normTarget = rtrim(str_replace('//', '/', $targetPath), '/');
    $normAssets = rtrim(str_replace('//', '/', $assetsDir), '/');

    // Check 1: logical path containment (covers symlinked dirs)
    if (str_starts_with($normTarget . '/', $normAssets . '/') || $normTarget === $normAssets) {
        return true;
    }

    // Check 2: realpath containment (covers non-symlinked dirs)
    $realTarget = realpath($targetPath);
    $realAssets = realpath($assetsDir);
    if ($realTarget && $realAssets && str_starts_with($realTarget . '/', $realAssets . '/')) {
        return true;
    }

    return false;
}

// Ensure base asset directories exist
foreach (['images', 'css', 'js', 'fonts', 'files'] as $subdir) {
    $dir = $assetsDir . '/' . $subdir;
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// ═══════════════════════════════════════════
//  Allowed file types — validated by extension AND magic bytes
// ═══════════════════════════════════════════

$allowedTypes = [
    // Images
    'jpg'  => ['mime' => 'image/jpeg',    'category' => 'images', 'max_mb' => 10],
    'jpeg' => ['mime' => 'image/jpeg',    'category' => 'images', 'max_mb' => 10],
    'png'  => ['mime' => 'image/png',     'category' => 'images', 'max_mb' => 10],
    'gif'  => ['mime' => 'image/gif',     'category' => 'images', 'max_mb' => 10],
    'webp' => ['mime' => 'image/webp',    'category' => 'images', 'max_mb' => 10],
    'svg'  => ['mime' => 'image/svg+xml', 'category' => 'images', 'max_mb' => 10],
    'ico'  => ['mime' => 'image/x-icon',  'category' => 'images', 'max_mb' => 2],
    // Documents
    'pdf'  => ['mime' => 'application/pdf',  'category' => 'files', 'max_mb' => 50],
    'doc'  => ['mime' => 'application/msword', 'category' => 'files', 'max_mb' => 50],
    'docx' => ['mime' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'category' => 'files', 'max_mb' => 50],
    'xls'  => ['mime' => 'application/vnd.ms-excel', 'category' => 'files', 'max_mb' => 50],
    'xlsx' => ['mime' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'category' => 'files', 'max_mb' => 50],
    // Text
    'txt'  => ['mime' => 'text/plain',    'category' => 'files', 'max_mb' => 5],
    'md'   => ['mime' => 'text/markdown',  'category' => 'files', 'max_mb' => 5],
    'csv'  => ['mime' => 'text/csv',       'category' => 'files', 'max_mb' => 5],
    // Fonts
    'woff2' => ['mime' => 'font/woff2',   'category' => 'fonts', 'max_mb' => 5],
    'woff'  => ['mime' => 'font/woff',    'category' => 'fonts', 'max_mb' => 5],
    'ttf'   => ['mime' => 'font/ttf',     'category' => 'fonts', 'max_mb' => 5],
    'otf'   => ['mime' => 'font/otf',     'category' => 'fonts', 'max_mb' => 5],
    // Media
    'mp4'  => ['mime' => 'video/mp4',     'category' => 'files', 'max_mb' => 100],
    'webm' => ['mime' => 'video/webm',    'category' => 'files', 'max_mb' => 100],
    'mp3'  => ['mime' => 'audio/mpeg',    'category' => 'files', 'max_mb' => 50],
    'wav'  => ['mime' => 'audio/wav',     'category' => 'files', 'max_mb' => 50],
    'ogg'  => ['mime' => 'audio/ogg',     'category' => 'files', 'max_mb' => 50],
];

$allowedCategories = ['images', 'css', 'js', 'fonts', 'files'];


// ═══════════════════════════════════════════
//  GET /assets — Scan filesystem and list all files
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/assets') {
    $category = $_GET['category'] ?? null; // 'images', 'files', 'fonts', or null (all)
    $meta = loadMeta($metaFile);
    $assets = [];

    $scanDirs = $category
        ? [$category => $assetsDir . '/' . $category]
        : [
            'images' => $assetsDir . '/images',
            'css'    => $assetsDir . '/css',
            'js'     => $assetsDir . '/js',
            'fonts'  => $assetsDir . '/fonts',
            'files'  => $assetsDir . '/files',
        ];

    foreach ($scanDirs as $cat => $dir) {
        if (!is_dir($dir)) continue;

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($iterator as $file) {
            if (!$file->isFile()) continue;

            // Skip hidden/system files (.gitkeep, .DS_Store, etc.)
            if (str_starts_with($file->getFilename(), '.')) continue;

            // Skip generated thumbnails — they live in /thumbs/ subdirectories
            if (str_contains($file->getRealPath(), DIRECTORY_SEPARATOR . 'thumbs' . DIRECTORY_SEPARATOR)) continue;

            $relativePath = 'assets/' . $cat . '/' . ltrim(
                str_replace($dir, '', $file->getRealPath()),
                DIRECTORY_SEPARATOR
            );
            $relativePath = str_replace('\\', '/', $relativePath);

            $ext = strtolower($file->getExtension());
            $webPath = '/' . $relativePath;

            $asset = [
                'path'      => $webPath,
                'filename'  => $file->getFilename(),
                'extension' => $ext,
                'category'  => $cat,
                'size'      => $file->getSize(),
                'modified'  => date('Y-m-d H:i:s', $file->getMTime()),
            ];

            // Image dimensions + lazy thumbnail generation
            if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp']) && function_exists('getimagesize')) {
                $dims = @getimagesize($file->getRealPath());
                if ($dims) {
                    $asset['width'] = $dims[0];
                    $asset['height'] = $dims[1];
                }

                // Lazy thumbnail: generate on first request if missing
                $thumbDir = dirname($file->getRealPath()) . '/thumbs';
                $thumbPath = $thumbDir . '/' . $file->getFilename();
                if (!file_exists($thumbPath) && ($dims[0] ?? 0) > 240) {
                    // Generate a 240px thumbnail on-demand
                    $imageData = processImage($file->getRealPath(), $ext);
                    if (!empty($imageData['thumbnail'])) {
                        $asset['thumbnail'] = $imageData['thumbnail'];
                    }
                } elseif (file_exists($thumbPath)) {
                    $asset['thumbnail'] = '/assets/' . $cat . '/thumbs/' . $file->getFilename();
                }
            }

            // Merge metadata (alt text, description)
            if (isset($meta[$webPath])) {
                $asset['meta'] = $meta[$webPath];
            }

            $assets[] = $asset;
        }
    }

    // Sort: newest first
    usort($assets, fn($a, $b) => strcmp($b['modified'], $a['modified']));

    jsonResponse(['ok' => true, 'data' => [
        'assets' => $assets,
        'count'  => count($assets),
    ]]);
    return;
}


// ═══════════════════════════════════════════
//  POST /assets/upload — Upload file(s)
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/assets/upload') {
    if (empty($_FILES['file'])) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'no_file',
            'message' => 'No file was uploaded.',
        ]], 400);
        return;
    }

    // Support single or multiple file upload
    $files = $_FILES['file'];
    $isMultiple = is_array($files['name']);
    $fileCount = $isMultiple ? count($files['name']) : 1;

    $uploaded = [];
    $errors   = [];
    $targetCategory = $_POST['category'] ?? null; // Override auto-detection
    if ($targetCategory !== null) {
        $targetCategory = strtolower(trim((string) $targetCategory));
        if (!in_array($targetCategory, $allowedCategories, true)) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'invalid_category',
                'message' => 'Invalid asset category.',
            ]], 422);
            return;
        }
    }

    for ($i = 0; $i < $fileCount; $i++) {
        $name    = $isMultiple ? $files['name'][$i]    : $files['name'];
        $tmpName = $isMultiple ? $files['tmp_name'][$i] : $files['tmp_name'];
        $error   = $isMultiple ? $files['error'][$i]    : $files['error'];
        $size    = $isMultiple ? $files['size'][$i]      : $files['size'];

        // Check upload error
        if ($error !== UPLOAD_ERR_OK) {
            $errors[] = "{$name}: Upload error (code {$error}).";
            continue;
        }

        // Get extension
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));

        if (!isset($allowedTypes[$ext])) {
            $errors[] = "{$name}: File type '.{$ext}' is not allowed.";
            continue;
        }

        $typeConfig = $allowedTypes[$ext];

        // Check size
        $maxBytes = $typeConfig['max_mb'] * 1024 * 1024;
        if ($size > $maxBytes) {
            $errors[] = "{$name}: File exceeds {$typeConfig['max_mb']} MB limit.";
            continue;
        }

        // Validate MIME type (magic bytes, not just extension)
        $detectedMime = mime_content_type($tmpName);
        // SVG detection is unreliable with mime_content_type
        if ($ext !== 'svg' && $ext !== 'ico') {
            $expectedCategory = explode('/', $typeConfig['mime'])[0];
            $detectedCategory = explode('/', $detectedMime)[0];
            // Allow application/* for documents
            if ($expectedCategory !== 'application' && $detectedCategory !== $expectedCategory) {
                $errors[] = "{$name}: File content doesn't match extension.";
                continue;
            }
        }

        // Sanitize filename: lowercase, alpha + hyphens only
        $baseName = pathinfo($name, PATHINFO_FILENAME);
        $safeName = sanitizeFilename($baseName);
        if (empty($safeName)) $safeName = 'file';
        $safeName .= '.' . $ext;

        // Target directory
        $category = $targetCategory ?? $typeConfig['category'];
        $targetDir = $assetsDir . '/' . $category;
        if (!is_dir($targetDir)) mkdir($targetDir, 0755, true);
        if (!is_dir($targetDir) || !isInsideAssetsDir($targetDir, $assetsDir)) {
            $errors[] = "{$name}: Invalid target path.";
            continue;
        }

        // Resolve name collisions
        $targetPath = $targetDir . '/' . $safeName;
        $counter = 2;
        while (file_exists($targetPath)) {
            $safeName = sanitizeFilename($baseName) . '-' . $counter . '.' . $ext;
            $targetPath = $targetDir . '/' . $safeName;
            $counter++;
        }

        // Move uploaded file
        if (!move_uploaded_file($tmpName, $targetPath)) {
            $errors[] = "{$name}: Failed to save file.";
            continue;
        }

        $webPath = '/assets/' . $category . '/' . $safeName;

        $result = [
            'path'      => $webPath,
            'filename'  => $safeName,
            'original'  => $name,
            'extension' => $ext,
            'category'  => $category,
            'size'      => $size,
        ];

        // Image processing (thumbnails, optimization)
        if ($typeConfig['category'] === 'images' && $ext !== 'svg' && $ext !== 'ico') {
            $result['image'] = processImage($targetPath, $ext);
        }

        $uploaded[] = $result;
    }

    if (empty($uploaded) && !empty($errors)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'upload_failed',
            'message' => implode(' ', $errors),
        ]], 422);
        return;
    }

    jsonResponse(['ok' => true, 'data' => [
        'uploaded' => $uploaded,
        'errors'   => $errors,
    ]]);
    return;
}


// ═══════════════════════════════════════════
//  PUT /assets/meta — Update metadata (alt text, description)
// ═══════════════════════════════════════════

if ($method === 'PUT' && $path === '/assets/meta') {
    $input = json_decode(file_get_contents('php://input'), true);
    $assetPath = str_replace('\\', '/', (string) ($input['path'] ?? ''));
    $altText = $input['alt'] ?? null;
    $description = $input['description'] ?? null;

    if (empty($assetPath)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'missing_path',
            'message' => 'Asset path is required.',
        ]], 400);
        return;
    }

    if (!str_starts_with($assetPath, '/assets/') || str_contains($assetPath, '..')) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'invalid_path',
            'message' => 'Asset path must be inside /assets/.',
        ]], 400);
        return;
    }

    // Verify asset exists on disk and resolves inside assets root.
    $fullPath = $docRoot . $assetPath;

    if (!is_file($fullPath) || !isInsideAssetsDir($fullPath, $assetsDir)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Asset file not found.',
        ]], 404);
        return;
    }

    // Update metadata sidecar
    $meta = loadMeta($metaFile);
    $meta[$assetPath] = array_filter([
        'alt'         => $altText,
        'description' => $description,
        'updated_at'  => now(),
    ], fn($v) => $v !== null);

    saveMeta($metaFile, $meta);

    jsonResponse(['ok' => true, 'data' => [
        'path' => $assetPath,
        'meta' => $meta[$assetPath],
    ]]);
    return;
}


// ═══════════════════════════════════════════
//  DELETE /assets — Delete an asset file
// ═══════════════════════════════════════════

if ($method === 'DELETE' && $path === '/assets') {
    $input = json_decode(file_get_contents('php://input'), true);
    $assetPath = $input['path'] ?? '';

    if (empty($assetPath)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'missing_path',
            'message' => 'Asset path is required.',
        ]], 400);
        return;
    }

    // Security: validate path stays within /assets/
    $fullPath = $docRoot . $assetPath;

    if (!file_exists($fullPath) || !isInsideAssetsDir($fullPath, $assetsDir)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'invalid_path',
            'message' => 'Path is outside the assets directory.',
        ]], 403);
        return;
    }

    // Don't allow deleting CSS/JS files the site depends on
    if (str_starts_with($assetPath, '/assets/css/') || str_starts_with($assetPath, '/assets/js/')) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'protected',
            'message' => 'CSS and JS assets cannot be deleted through the asset manager.',
        ]], 403);
        return;
    }

    if (!file_exists($fullPath)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Asset file not found.',
        ]], 404);
        return;
    }

    // Delete the file
    $realPath = realpath($fullPath);
    if (!$realPath || !unlink($realPath)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'delete_failed',
            'message' => 'Could not delete asset file.',
        ]], 500);
        return;
    }

    // Remove metadata
    $meta = loadMeta($metaFile);
    unset($meta[$assetPath]);
    saveMeta($metaFile, $meta);

    // Delete thumbnail if it exists
    $thumbPath = dirname($realPath) . '/thumbs/' . basename($realPath);
    if (file_exists($thumbPath)) {
        @unlink($thumbPath);
    }

    jsonResponse(['ok' => true, 'data' => [
        'deleted' => $assetPath,
    ]]);
    return;
}


// ═══════════════════════════════════════════
//  POST /assets/folder — Create a subfolder
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/assets/folder') {
    $input = json_decode(file_get_contents('php://input'), true);
    $parentCategory = $input['category'] ?? 'images';
    $folderName = $input['name'] ?? '';

    if (empty($folderName)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'missing_name',
            'message' => 'Folder name is required.',
        ]], 400);
        return;
    }

    $safeName = sanitizeFilename($folderName);
    if (empty($safeName)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'invalid_name',
            'message' => 'Folder name contains no valid characters.',
        ]], 400);
        return;
    }

    $targetDir = $assetsDir . '/' . $parentCategory . '/' . $safeName;

    // Security: ensure path stays within assets
    $parentDir = $assetsDir . '/' . $parentCategory;
    if (!is_dir($parentDir) || !isInsideAssetsDir($parentDir, $assetsDir)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'invalid_category',
            'message' => 'Invalid asset category.',
        ]], 400);
        return;
    }

    if (is_dir($targetDir)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'already_exists',
            'message' => 'Folder already exists.',
        ]], 409);
        return;
    }

    mkdir($targetDir, 0755, true);

    jsonResponse(['ok' => true, 'data' => [
        'folder' => '/assets/' . $parentCategory . '/' . $safeName,
    ]]);
    return;
}


jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Assets endpoint not found.',
]], 404);


// ═══════════════════════════════════════════════════
//  Helper Functions
// ═══════════════════════════════════════════════════

/**
 * Sanitize a filename: lowercase, keep alpha/num/hyphens only.
 */
function sanitizeFilename(string $name): string
{
    $name = strtolower($name);
    $name = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $name);
    $name = preg_replace('/[^a-z0-9\-]/', '-', $name);
    $name = preg_replace('/-+/', '-', $name);
    return trim($name, '-');
}

/**
 * Process an uploaded image:
 * - Get dimensions
 * - Generate 400px thumbnail (if GD available)
 * - Optimize large images (>2000px → 1920px)
 */
function processImage(string $filePath, string $ext): array
{
    $result = [];

    if (!function_exists('getimagesize')) {
        return $result;
    }

    $dims = @getimagesize($filePath);
    if ($dims) {
        $result['width'] = $dims[0];
        $result['height'] = $dims[1];
    }

    // Only attempt processing if GD is available
    if (!function_exists('imagecreatetruecolor')) {
        return $result;
    }

    try {
        // Load source image
        $source = match ($ext) {
            'jpg', 'jpeg' => @imagecreatefromjpeg($filePath),
            'png'         => @imagecreatefrompng($filePath),
            'gif'         => @imagecreatefromgif($filePath),
            'webp'        => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($filePath) : false,
            default       => false,
        };

        if (!$source) return $result;

        $origW = imagesx($source);
        $origH = imagesy($source);

        // Generate thumbnail for the asset grid (240px — matches card width)
        $thumbDir = dirname($filePath) . '/thumbs';
        if (!is_dir($thumbDir)) mkdir($thumbDir, 0755, true);

        $thumbMaxW = 240;
        if ($origW > $thumbMaxW) {
            $thumbH = (int) round($origH * ($thumbMaxW / $origW));
            $thumb = imagecreatetruecolor($thumbMaxW, $thumbH);

            // Preserve transparency for PNG
            if ($ext === 'png') {
                imagealphablending($thumb, false);
                imagesavealpha($thumb, true);
            }

            imagecopyresampled($thumb, $source, 0, 0, 0, 0, $thumbMaxW, $thumbH, $origW, $origH);

            $thumbPath = $thumbDir . '/' . basename($filePath);
            match ($ext) {
                'jpg', 'jpeg' => imagejpeg($thumb, $thumbPath, 75),
                'png'         => imagepng($thumb, $thumbPath, 8),
                'gif'         => imagegif($thumb, $thumbPath),
                'webp'        => function_exists('imagewebp') ? imagewebp($thumb, $thumbPath, 75) : null,
                default       => null,
            };
            imagedestroy($thumb);

            $result['thumbnail'] = str_replace(dirname($filePath, 3), '', $thumbPath);
            $result['thumbnail'] = str_replace('\\', '/', $result['thumbnail']);
        }

        // Optimize if source is very large (>2000px)
        if ($origW > 2000) {
            $newW = 1920;
            $newH = (int) round($origH * ($newW / $origW));
            $optimized = imagecreatetruecolor($newW, $newH);

            if ($ext === 'png') {
                imagealphablending($optimized, false);
                imagesavealpha($optimized, true);
            }

            imagecopyresampled($optimized, $source, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

            match ($ext) {
                'jpg', 'jpeg' => imagejpeg($optimized, $filePath, 90),
                'png'         => imagepng($optimized, $filePath, 6),
                'webp'        => function_exists('imagewebp') ? imagewebp($optimized, $filePath, 85) : null,
                default       => null,
            };
            imagedestroy($optimized);

            $result['optimized'] = true;
            $result['width'] = $newW;
            $result['height'] = $newH;
        }

        imagedestroy($source);
    } catch (\Throwable $e) {
        // Image processing failures are non-fatal — keep the original
        $result['processing_error'] = $e->getMessage();
    }

    return $result;
}

/**
 * Load metadata from the JSON sidecar file.
 */
function loadMeta(string $metaFile): array
{
    if (!file_exists($metaFile)) return [];
    $content = file_get_contents($metaFile);
    return json_decode($content, true) ?: [];
}

/**
 * Save metadata to the JSON sidecar file.
 */
function saveMeta(string $metaFile, array $meta): void
{
    $dir = dirname($metaFile);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    file_put_contents($metaFile, json_encode($meta, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}
