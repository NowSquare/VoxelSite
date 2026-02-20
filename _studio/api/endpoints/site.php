<?php

declare(strict_types=1);

/**
 * Site API Endpoints
 *
 * POST /site/reset — Clear all generated pages, files, and history
 *
 * Destructive operations require a confirmation body to prevent
 * accidental triggers. Settings, users, and uploaded assets are preserved.
 */

use VoxelSite\Database;
use VoxelSite\FileManager;

$method = $_REQUEST['_route_method'];
$path   = $_REQUEST['_route_path'];

$db = Database::getInstance();

// ═══════════════════════════════════════════
//  POST /site/reset — Clear entire website
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/site/reset') {
    $body = getJsonBody();

    // Require explicit confirmation to prevent accidental triggers
    $confirm = $body['confirm'] ?? '';
    if ($confirm !== 'RESET') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'confirmation_required',
            'message' => 'Send {"confirm": "RESET"} to confirm this destructive action.',
        ]], 422);
        return;
    }

    try {
        $fileManager = new FileManager();
        $result = $fileManager->clearSite();

        jsonResponse([
            'ok'   => true,
            'data' => [
                'message'       => 'Site cleared successfully. All pages, styles, and history have been removed.',
                'pages_deleted' => $result['pages_deleted'],
                'files_deleted' => $result['files_deleted'],
            ],
        ]);
    } catch (\Throwable $e) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'reset_failed',
            'message' => 'Failed to clear site: ' . $e->getMessage(),
        ]], 500);
    }

    return;
}

// ═══════════════════════════════════════════
//  POST /site/reset-install — Full factory reset
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/site/reset-install') {
    $body = getJsonBody();

    // Require explicit confirmation to prevent accidental triggers
    $confirm = $body['confirm'] ?? '';
    if ($confirm !== 'RESET INSTALLATION') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'confirmation_required',
            'message' => 'Send {"confirm": "RESET INSTALLATION"} to confirm this destructive action.',
        ]], 422);
        return;
    }

    try {
        $studioDir = dirname(__DIR__, 2);  // _studio/
        $rootDir   = dirname($studioDir);  // project root

        // Helper: recursively delete directory contents (keep the directory itself)
        $clearDir = function (string $dir, array $keep = []) use (&$clearDir): int {
            if (!is_dir($dir)) return 0;
            $deleted = 0;
            $items = new \DirectoryIterator($dir);
            foreach ($items as $item) {
                if ($item->isDot()) continue;
                $name = $item->getFilename();
                if (in_array($name, $keep, true)) continue;
                $path = $item->getPathname();
                if ($item->isDir()) {
                    $deleted += $clearDir($path);
                    @rmdir($path);
                } else {
                    @unlink($path);
                    $deleted++;
                }
            }
            return $deleted;
        };

        // Helper: delete a single file
        $deleteFile = function (string $path): bool {
            if (file_exists($path)) {
                return @unlink($path);
            }
            return false;
        };

        $totalDeleted = 0;

        // ── 1. Close database connection before deleting ──
        Database::closeInstance();

        // ── 2. Delete Studio runtime data ──
        $deleteFile($studioDir . '/data/studio.db');
        $deleteFile($studioDir . '/data/studio.db-journal');
        $deleteFile($studioDir . '/data/studio.db-wal');
        $deleteFile($studioDir . '/data/studio.db-shm');
        $deleteFile($studioDir . '/data/assets-meta.json');
        $deleteFile($studioDir . '/data/mail.log');

        // Clear collections data (keep _schema/)
        $collectionsDir = $studioDir . '/data/collections';
        if (is_dir($collectionsDir)) {
            $totalDeleted += $clearDir($collectionsDir, ['_schema']);
        }

        // ── 3. Delete preview, revisions, snapshots, backups ──
        $totalDeleted += $clearDir($studioDir . '/preview', ['.gitkeep']);
        $totalDeleted += $clearDir($studioDir . '/revisions', ['.gitkeep']);
        $totalDeleted += $clearDir($studioDir . '/snapshots', ['.gitkeep']);
        $totalDeleted += $clearDir($studioDir . '/backups', ['.gitkeep']);

        // ── 4. Delete uploaded assets ──
        $totalDeleted += $clearDir($rootDir . '/assets/images', ['.gitkeep']);
        $totalDeleted += $clearDir($rootDir . '/assets/files', ['.gitkeep']);
        $totalDeleted += $clearDir($rootDir . '/assets/fonts', ['.gitkeep']);

        // ── 5. Delete generated site content ──
        // CSS, JS, and data directories under assets/
        $totalDeleted += $clearDir($rootDir . '/assets/css', ['.gitkeep']);
        $totalDeleted += $clearDir($rootDir . '/assets/js', ['.gitkeep']);
        if (is_dir($rootDir . '/assets/data')) {
            $totalDeleted += $clearDir($rootDir . '/assets/data', ['.gitkeep']);
        }

        // ── 6. Delete generated site content at root ──
        // Shipped root files that must NOT be deleted
        $shippedRootFiles = ['submit.php', 'LocalValetDriver.php'];
        $rootItems = new \DirectoryIterator($rootDir);
        foreach ($rootItems as $item) {
            if ($item->isDot() || $item->isDir()) continue;
            $name = $item->getFilename();

            // Delete AI-generated HTML files
            if (str_ends_with($name, '.html')) {
                @unlink($item->getPathname());
                $totalDeleted++;
                continue;
            }

            // Delete AI-generated PHP page files (exclude shipped core files)
            if (str_ends_with($name, '.php') && !in_array($name, $shippedRootFiles, true)) {
                @unlink($item->getPathname());
                $totalDeleted++;
                continue;
            }

            // Delete AEO-generated files
            if (in_array($name, ['llms.txt', 'robots.txt'], true)) {
                @unlink($item->getPathname());
                $totalDeleted++;
            }
        }

        // Delete form definitions
        if (is_dir($rootDir . '/assets/forms')) {
            $totalDeleted += $clearDir($rootDir . '/assets/forms');
        }

        // ── 7. Delete _partials/ and _data/ content ──
        $totalDeleted += $clearDir($rootDir . '/_partials', ['.htaccess']);
        $totalDeleted += $clearDir($rootDir . '/_data', ['.htaccess']);

        // ── 8. Delete config.json LAST (marks system as uninstalled) ──
        $deleteFile($studioDir . '/data/config.json');

        // ── 8b. Restore default landing page ──
        $shippedDefault = $studioDir . '/data/default-index.php';
        if (file_exists($shippedDefault)) {
            @copy($shippedDefault, $rootDir . '/index.php');
        }

        // ── 9. Clear session cookie so the redirect to install works ──
        $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
        setcookie('vs_session', '', [
            'expires'  => time() - 86400,
            'path'     => '/_studio/',
            'httponly'  => true,
            'secure'   => $secure,
            'samesite' => 'Lax',
        ]);

        jsonResponse([
            'ok'   => true,
            'data' => [
                'message'       => 'Installation has been completely reset. You will be redirected to the installer.',
                'files_deleted' => $totalDeleted,
                'redirect'      => '/_studio/install.php',
            ],
        ]);
    } catch (\Throwable $e) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'reset_failed',
            'message' => 'Failed to reset installation: ' . $e->getMessage(),
        ]], 500);
    }

    return;
}

// ── Fallback ──
jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Site endpoint not found.',
]], 404);
