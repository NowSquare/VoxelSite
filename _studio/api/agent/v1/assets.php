<?php

declare(strict_types=1);

/**
 * Agent API — Assets Endpoint
 *
 * GET  /assets — List asset files (paginated)
 * POST /assets — Upload an asset file (multipart/form-data)
 *
 * Receives $_agentContext from router.php.
 */

$ctx    = $_agentContext;
$method = $ctx['method'];

use VoxelSite\Logger;

$docRoot   = dirname(__DIR__, 4);
$assetsDir = $docRoot . '/assets';
$metaFile  = dirname(__DIR__, 3) . '/data/assets-meta.json';

// Explicit allowlist — only these categories are valid targets
$allowedCategories = ['images', 'css', 'js', 'fonts', 'files'];

// Blocked file extensions — never allow upload of executable types
$blockedExtensions = [
    'php', 'phtml', 'php3', 'php4', 'php5', 'php7', 'phps', 'pht', 'phar',
    'exe', 'bat', 'cmd', 'sh', 'bash', 'com', 'msi', 'dll', 'cgi', 'pl',
    'py', 'rb', 'jar', 'war', 'jsp', 'asp', 'aspx',
    'htaccess', 'htpasswd',
];

$maxUploadBytes = 10 * 1024 * 1024; // 10MB

// ═══════════════════════════════════════════
//  GET /assets — List assets (paginated)
// ═══════════════════════════════════════════

if ($method === 'GET') {
    $category = $_GET['category'] ?? null;
    $page     = max(1, (int) ($_GET['page'] ?? 1));
    $perPage  = min(100, max(1, (int) ($_GET['per_page'] ?? 50)));

    // Validate requested category against allowlist
    if ($category !== null && !in_array($category, $allowedCategories, true)) {
        Logger::warning('agent-api', 'Asset list: invalid category', [
            'category'  => $category,
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentError(422, 'invalid_category', "Category must be one of: " . implode(', ', $allowedCategories) . ".");
        return;
    }

    $meta   = file_exists($metaFile) ? (json_decode(file_get_contents($metaFile), true) ?: []) : [];
    $assets = [];

    $scanDirs = $category
        ? [$category => $assetsDir . '/' . $category]
        : array_combine($allowedCategories, array_map(fn($c) => $assetsDir . '/' . $c, $allowedCategories));

    foreach ($scanDirs as $cat => $dir) {
        if (!is_dir($dir)) continue;

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($iterator as $file) {
            if (!$file->isFile()) continue;
            if (str_starts_with($file->getFilename(), '.')) continue;
            if (str_contains($file->getRealPath(), DIRECTORY_SEPARATOR . 'thumbs' . DIRECTORY_SEPARATOR)) continue;

            $relativePath = 'assets/' . $cat . '/' . ltrim(
                str_replace($dir, '', $file->getRealPath()),
                DIRECTORY_SEPARATOR
            );
            $relativePath = str_replace('\\', '/', $relativePath);

            $ext     = strtolower($file->getExtension());
            $webPath = '/' . $relativePath;

            $asset = [
                'path'      => $webPath,
                'filename'  => $file->getFilename(),
                'extension' => $ext,
                'category'  => $cat,
                'size'      => $file->getSize(),
                'modified'  => date('Y-m-d H:i:s', $file->getMTime()),
            ];

            if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp']) && function_exists('getimagesize')) {
                $dims = @getimagesize($file->getRealPath());
                if ($dims) {
                    $asset['width']  = $dims[0];
                    $asset['height'] = $dims[1];
                }
            }

            if (isset($meta[$webPath])) {
                $asset['meta'] = $meta[$webPath];
            }

            $assets[] = $asset;
        }
    }

    usort($assets, fn($a, $b) => strcmp($b['modified'], $a['modified']));

    $total  = count($assets);
    $offset = ($page - 1) * $perPage;
    $paged  = array_slice($assets, $offset, $perPage);

    agentResponse(['data' => [
        'assets'   => $paged,
        'total'    => $total,
        'page'     => $page,
        'per_page' => $perPage,
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /assets — Upload file
// ═══════════════════════════════════════════

if ($method === 'POST') {
    if (empty($_FILES['file'])) {
        Logger::warning('agent-api', 'Asset upload: no file', [
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentError(400, 'no_file', 'No file was uploaded. Send a multipart/form-data request with a "file" field.');
        return;
    }

    $file = $_FILES['file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        Logger::warning('agent-api', 'Asset upload error', [
            'error_code' => $file['error'],
            'filename'   => $file['name'] ?? 'unknown',
            'key_label'  => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentError(400, 'upload_error', "Upload error (code {$file['error']}).");
        return;
    }

    if ($file['size'] > $maxUploadBytes) {
        Logger::warning('agent-api', 'Asset upload: file too large', [
            'filename'  => $file['name'],
            'size'      => $file['size'],
            'limit'     => $maxUploadBytes,
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentError(422, 'file_too_large', 'File exceeds 10 MB limit.');
        return;
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (in_array($ext, $blockedExtensions, true)) {
        Logger::warning('agent-api', 'Asset blocked extension', [
            'extension' => $ext,
            'filename'  => $file['name'],
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentError(422, 'blocked_type', "File type '.{$ext}' is not allowed.");
        return;
    }

    // Determine category — validate against allowlist BEFORE any filesystem call
    $imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'];
    $fontExts  = ['woff', 'woff2', 'ttf', 'otf'];
    $category = $_POST['category'] ?? null;

    if ($category !== null) {
        // User-provided category MUST be in the allowlist
        if (!in_array($category, $allowedCategories, true)) {
            Logger::warning('agent-api', 'Asset upload: invalid category', [
                'category'  => $category,
                'filename'  => $file['name'],
                'key_label' => $ctx['keyData']['label'] ?? 'unknown',
            ]);
            agentError(422, 'invalid_category', "Category must be one of: " . implode(', ', $allowedCategories) . ".");
            return;
        }
    } else {
        // Auto-detect from extension
        $category = match (true) {
            in_array($ext, $imageExts, true) => 'images',
            in_array($ext, $fontExts, true)  => 'fonts',
            $ext === 'css'                   => 'css',
            $ext === 'js'                    => 'js',
            default                          => 'files',
        };
    }

    // Sanitize filename
    $baseName = pathinfo($file['name'], PATHINFO_FILENAME);
    $safeName = strtolower(preg_replace('/[^a-z0-9-]+/i', '-', $baseName));
    $safeName = trim($safeName, '-');
    if (empty($safeName)) $safeName = 'file';
    $safeName .= '.' . $ext;

    // Category is now known-safe — build the target path
    $targetDir = $assetsDir . '/' . $category;
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    // Resolve name collisions
    $targetPath = $targetDir . '/' . $safeName;
    $counter = 2;
    while (file_exists($targetPath)) {
        $base = pathinfo($safeName, PATHINFO_FILENAME);
        $safeName = $base . '-' . $counter . '.' . $ext;
        $targetPath = $targetDir . '/' . $safeName;
        $counter++;
    }

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        Logger::error('agent-api', 'Asset file save failed', [
            'target'    => $webPath ?? 'unknown',
            'filename'  => $safeName,
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentError(500, 'upload_failed', 'Failed to save uploaded file.');
        return;
    }

    $webPath = '/assets/' . $category . '/' . $safeName;

    $result = [
        'path'      => $webPath,
        'filename'  => $safeName,
        'original'  => $file['name'],
        'extension' => $ext,
        'category'  => $category,
        'size'      => $file['size'],
    ];

    // Image dimensions
    if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp']) && function_exists('getimagesize')) {
        $dims = @getimagesize($targetPath);
        if ($dims) {
            $result['width']  = $dims[0];
            $result['height'] = $dims[1];
        }
    }

    Logger::info('agent-api', 'Asset uploaded', [
        'path'      => $webPath,
        'filename'  => $safeName,
        'original'  => $file['name'],
        'category'  => $category,
        'size'      => $file['size'],
        'key_label' => $ctx['keyData']['label'] ?? 'unknown',
    ]);

    agentResponse(['data' => $result], 201);
    return;
}
