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

if ($path === '/site/reset') {
    require __DIR__ . '/site-reset.php';
    return;
}

// ═══════════════════════════════════════════
//  POST /site/reset-install — Full factory reset
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/site/reset-install') {
    require __DIR__ . '/factory-reset.php';
    return;
}

// ── Fallback ──
jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Site endpoint not found.',
]], 404);
