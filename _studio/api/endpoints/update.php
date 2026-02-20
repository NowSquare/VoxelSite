<?php

declare(strict_types=1);

/**
 * Update API Endpoint
 *
 * POST /update/upload       — Upload a zip file to update VoxelSite
 * GET  /update/dist-packages — List update zips found in /dist/
 * POST /update/apply-local   — Apply update from a zip in /dist/
 *
 * The zip is extracted and all system files are overwritten.
 * User-generated content is preserved (pages, uploads, database, config).
 *
 * Protected directories (never overwritten):
 *   _studio/preview/     — User's website pages (AI-generated)
 *   _studio/revisions/   — Revision history
 *   _studio/snapshots/   — Manual snapshots
 *   _studio/backups/     — Backups
 *   _studio/logs/        — Log files
 *   _studio/data/        — Database, config, collections
 *   _data/               — Form submissions, auth tokens
 *   assets/images/       — User uploaded images
 *   assets/files/        — User uploaded files
 *   assets/fonts/        — User uploaded fonts
 *   assets/data/         — AI-generated data (memory, design-intelligence)
 *   assets/css/          — AI-generated stylesheets
 *   assets/js/           — AI-generated scripts
 *   assets/forms/        — Form configuration
 *   .ai/                 — AI configuration docs
 *   .git/                — Git repository
 *   node_modules/        — NPM packages (dev only)
 *
 * Root-level PHP pages (index.php, contact.php, etc.) created by the AI
 * are also preserved — they live alongside submit.php and LocalValetDriver.php.
 */

use VoxelSite\Logger;

$method = $_REQUEST['_route_method'];
$path = $_REQUEST['_route_path'];

// ═══════════════════════════════════════════
//  GET /update/dist-packages — List zips in /dist/
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/update/dist-packages') {
    $projectRoot = dirname(__DIR__, 3);
    $distDir = $projectRoot . '/dist';
    $currentVersionFile = $projectRoot . '/VERSION';
    $currentVersion = file_exists($currentVersionFile) ? trim(file_get_contents($currentVersionFile)) : '0.0.0';

    $packages = [];

    if (is_dir($distDir)) {
        $files = glob($distDir . '/*.zip');
        foreach ($files as $zipPath) {
            $filename = basename($zipPath);
            $size = filesize($zipPath);

            // Try to read VERSION from inside the zip
            $version = null;
            $zip = new ZipArchive();
            if ($zip->open($zipPath) === true) {
                $prefix = detectZipPrefix($zip);
                $versionContent = $zip->getFromName($prefix . 'VERSION');
                if ($versionContent !== false) {
                    $version = trim($versionContent);
                }
                $zip->close();
            }

            if ($version === null) continue; // Not a valid VoxelSite package

            $packages[] = [
                'filename' => $filename,
                'version'  => $version,
                'size'     => $size,
                'modified' => date('Y-m-d H:i:s', filemtime($zipPath)),
            ];
        }

        // Sort by version descending (newest first)
        usort($packages, function ($a, $b) {
            return version_compare($b['version'], $a['version']);
        });
    }

    jsonResponse(['ok' => true, 'data' => [
        'packages'        => $packages,
        'current_version' => $currentVersion,
    ]]);
    return;
}

// ═══════════════════════════════════════════
//  POST /update/apply-local — Apply from /dist/
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/update/apply-local') {
    $body = getJsonBody();
    $filename = $body['filename'] ?? '';

    if (empty($filename) || !preg_match('/^[\w.\-]+\.zip$/i', $filename)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Invalid filename.',
        ]], 422);
        return;
    }

    $projectRoot = dirname(__DIR__, 3);
    $zipPath = $projectRoot . '/dist/' . $filename;

    // Security: ensure the resolved path is inside dist/
    $realPath = realpath($zipPath);
    $realDistDir = realpath($projectRoot . '/dist');
    if ($realPath === false || $realDistDir === false || !str_starts_with($realPath, $realDistDir . '/')) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'Update package not found in the dist directory.',
        ]], 404);
        return;
    }

    // From here, reuse the same extraction logic as upload
    $zip = new ZipArchive();
    $openResult = $zip->open($realPath);
    if ($openResult !== true) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'invalid_zip',
            'message' => 'Could not open the zip file. It may be corrupted.',
        ]], 422);
        return;
    }

    $prefix = detectZipPrefix($zip);
    $versionEntry = $prefix . 'VERSION';
    $versionContent = $zip->getFromName($versionEntry);

    if ($versionContent === false) {
        $zip->close();
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'invalid_package',
            'message' => 'This doesn\'t look like a VoxelSite update package. Missing VERSION file.',
        ]], 422);
        return;
    }

    $newVersion = trim($versionContent);
    $currentVersionFile = $projectRoot . '/VERSION';
    $currentVersion = file_exists($currentVersionFile) ? trim(file_get_contents($currentVersionFile)) : '0.0.0';

    Logger::info('update', 'Starting local update from dist/', [
        'from_version' => $currentVersion,
        'to_version'   => $newVersion,
        'filename'     => $filename,
        'zip_entries'  => $zip->numFiles,
        'prefix'       => $prefix,
    ]);

    $result = applyUpdate($zip, $prefix, $projectRoot, $newVersion, $currentVersion, $filename);
    $zip->close();

    if ($result['ok']) {
        jsonResponse(['ok' => true, 'data' => $result['data']]);
    } else {
        jsonResponse(['ok' => false, 'error' => $result['error']], $result['status'] ?? 500);
    }
    return;
}

// ═══════════════════════════════════════════
//  POST /update/upload — Upload & apply update
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/update/upload') {
    $projectRoot = dirname(__DIR__, 3);

    // ── Validate upload ──
    if (empty($_FILES['update_zip']) || $_FILES['update_zip']['error'] !== UPLOAD_ERR_OK) {
        $errorCode = $_FILES['update_zip']['error'] ?? UPLOAD_ERR_NO_FILE;
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE   => 'The file exceeds the server upload limit. Increase upload_max_filesize in php.ini.',
            UPLOAD_ERR_FORM_SIZE  => 'The file exceeds the form size limit.',
            UPLOAD_ERR_PARTIAL    => 'The file was only partially uploaded. Try again.',
            UPLOAD_ERR_NO_FILE    => 'No file was uploaded.',
            UPLOAD_ERR_NO_TMP_DIR => 'Server missing temp directory.',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
        ];

        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'upload_failed',
            'message' => $errorMessages[$errorCode] ?? 'Upload failed with error code ' . $errorCode,
        ]], 422);
        return;
    }

    $tmpFile = $_FILES['update_zip']['tmp_name'];
    $originalName = $_FILES['update_zip']['name'] ?? 'update.zip';

    // Verify it's actually a zip
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($tmpFile);
    if (!in_array($mimeType, ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'])) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'invalid_file',
            'message' => 'Please upload a .zip file. Detected type: ' . $mimeType,
        ]], 422);
        return;
    }

    // ── Open the zip ──
    $zip = new ZipArchive();
    $openResult = $zip->open($tmpFile);
    if ($openResult !== true) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'invalid_zip',
            'message' => 'Could not open the zip file. It may be corrupted.',
        ]], 422);
        return;
    }

    // ── Validate it's a VoxelSite update ──
    // Must contain a VERSION file at the root (or inside a single wrapper directory)
    $prefix = detectZipPrefix($zip);
    $versionEntry = $prefix . 'VERSION';
    $versionContent = $zip->getFromName($versionEntry);

    if ($versionContent === false) {
        $zip->close();
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'invalid_package',
            'message' => 'This doesn\'t look like a VoxelSite update package. Missing VERSION file.',
        ]], 422);
        return;
    }

    $newVersion = trim($versionContent);
    $currentVersionFile = $projectRoot . '/VERSION';
    $currentVersion = file_exists($currentVersionFile) ? trim(file_get_contents($currentVersionFile)) : '0.0.0';

    Logger::info('update', 'Starting update', [
        'from_version' => $currentVersion,
        'to_version'   => $newVersion,
        'zip_file'     => $originalName,
        'zip_entries'  => $zip->numFiles,
        'prefix'       => $prefix,
    ]);

    $result = applyUpdate($zip, $prefix, $projectRoot, $newVersion, $currentVersion, $originalName);
    $zip->close();

    // Clean up temp file
    @unlink($tmpFile);

    if ($result['ok']) {
        jsonResponse(['ok' => true, 'data' => $result['data']]);
    } else {
        jsonResponse(['ok' => false, 'error' => $result['error']], $result['status'] ?? 500);
    }
    return;
}

jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Update endpoint not found.',
]], 404);

// ═══════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════

/**
 * Detect if the zip has a single wrapper directory.
 *
 * Many zip tools (including GitHub's "Download ZIP") wrap everything
 * in a top-level directory like "voxelsite-cms/". We detect this and
 * strip it during extraction.
 *
 * @return string The prefix to strip (empty string if no wrapper)
 */
function detectZipPrefix(ZipArchive $zip): string
{
    if ($zip->numFiles === 0) return '';

    $firstName = $zip->getNameIndex(0);
    if ($firstName === false) return '';

    // Check if the first entry is a directory
    if (str_ends_with($firstName, '/')) {
        // Verify ALL entries start with this prefix
        $prefix = $firstName;
        for ($i = 1; $i < min($zip->numFiles, 20); $i++) {
            $name = $zip->getNameIndex($i);
            if ($name !== false && !str_starts_with($name, $prefix)) {
                return ''; // Not all files have this prefix
            }
        }
        return $prefix;
    }

    return '';
}

/**
 * Extract and apply an update from an already-opened ZipArchive.
 *
 * Shared by both the upload and apply-local endpoints.
 *
 * @return array{ok: bool, data?: array, error?: array, status?: int}
 */
function applyUpdate(
    ZipArchive $zip,
    string $prefix,
    string $projectRoot,
    string $newVersion,
    string $currentVersion,
    string $sourceLabel
): array {
    // ── Define protected paths ──
    // These directories/files will NOT be overwritten by the update.
    $protectedPrefixes = [
        // User content
        '_studio/preview/',
        '_studio/revisions/',
        '_studio/snapshots/',
        '_studio/backups/',
        '_studio/logs/',
        '_studio/data/',
        '_studio/custom_prompts/',
        '_data/',

        // User assets (AI-generated and uploaded)
        'assets/images/',
        'assets/files/',
        'assets/fonts/',
        'assets/data/',
        'assets/css/',
        'assets/js/',
        'assets/forms/',

        // Dev / meta
        '.ai/',
        '.git/',
        'node_modules/',
    ];

    // ── Extract files ──
    $extracted = 0;
    $skipped = 0;
    $errors = [];

    for ($i = 0; $i < $zip->numFiles; $i++) {
        $entryName = $zip->getNameIndex($i);
        if ($entryName === false) continue;

        // Strip zip prefix (e.g., "voxelsite-v1.2.0/")
        $relativePath = $prefix ? substr($entryName, strlen($prefix)) : $entryName;

        // Skip empty paths and directory entries
        if ($relativePath === '' || $relativePath === false || str_ends_with($relativePath, '/')) {
            continue;
        }

        // Skip protected paths
        $isProtected = false;
        foreach ($protectedPrefixes as $protectedPrefix) {
            if (str_starts_with($relativePath, $protectedPrefix)) {
                $isProtected = true;
                break;
            }
        }

        if ($isProtected) {
            $skipped++;
            continue;
        }

        // Security: prevent path traversal
        if (str_contains($relativePath, '..') || str_starts_with($relativePath, '/')) {
            $skipped++;
            continue;
        }

        // Read the file content
        $content = $zip->getFromIndex($i);
        if ($content === false) {
            $errors[] = $relativePath;
            continue;
        }

        // Ensure target directory exists
        $targetPath = $projectRoot . '/' . $relativePath;
        $targetDir = dirname($targetPath);
        if (!is_dir($targetDir)) {
            if (!mkdir($targetDir, 0755, true)) {
                $errors[] = $relativePath . ' (mkdir failed)';
                continue;
            }
        }

        // Write the file
        if (file_put_contents($targetPath, $content) === false) {
            $errors[] = $relativePath . ' (write failed)';
            continue;
        }

        $extracted++;
    }

    Logger::info('update', 'Update complete', [
        'version'   => $newVersion,
        'source'    => $sourceLabel,
        'extracted' => $extracted,
        'skipped'   => $skipped,
        'errors'    => count($errors),
    ]);

    if (!empty($errors) && $extracted === 0) {
        return [
            'ok'     => false,
            'status' => 500,
            'error'  => [
                'code'    => 'extraction_failed',
                'message' => 'Failed to extract any files. The zip may be corrupted or permissions are wrong.',
            ],
        ];
    }

    return [
        'ok'   => true,
        'data' => [
            'message'       => "Updated to v{$newVersion} successfully.",
            'from_version'  => $currentVersion,
            'to_version'    => $newVersion,
            'files_updated' => $extracted,
            'files_skipped' => $skipped,
            'errors'        => $errors,
        ],
    ];
}
