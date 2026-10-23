<?php

declare(strict_types=1);

/**
 * VoxelSite Engine Bootstrap
 *
 * Loaded once at the start of every request. Sets up autoloading,
 * error handling, and shared configuration. This is the single
 * entry point that all server-side code flows through.
 */

// ── Composer autoloader (ships in vendor/) ──
$autoloader = dirname(__DIR__, 2) . '/vendor/autoload.php';
if (!file_exists($autoloader)) {
    http_response_code(500);
    echo json_encode([
        'ok'    => false,
        'error' => [
            'code'    => 'missing_vendor',
            'message' => 'The vendor directory is missing. Please re-upload the complete VoxelSite package.',
        ],
    ]);
    exit;
}
require_once $autoloader;

// ── Error reporting ──
// Show errors in development, suppress display in production.
// Errors are always logged regardless.
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// ── Timezone ──
date_default_timezone_set('UTC');

// ── Config loader ──
// config.json is created by the installer and contains the APP_KEY.
// If it doesn't exist, the system is not installed yet.

/**
 * Load config.json and return as associative array.
 *
 * Returns null if the file doesn't exist (not installed).
 * Throws RuntimeException if the file exists but is unreadable.
 *
 * @return array<string, mixed>|null
 */
function loadConfig(): ?array
{
    $configPath = dirname(__DIR__) . '/data/config.json';

    if (!file_exists($configPath)) {
        return null;
    }

    $raw = file_get_contents($configPath);
    if ($raw === false) {
        throw new RuntimeException('Could not read config.json');
    }

    $config = json_decode($raw, true);
    if (!is_array($config)) {
        throw new RuntimeException('config.json is corrupted or empty');
    }

    return $config;
}

/**
 * Check if VoxelSite has been installed.
 *
 * Installation is complete when config.json exists AND the
 * database has at least one user. Both conditions must be true.
 */
function isInstalled(): bool
{
    $config = loadConfig();
    if ($config === null) {
        return false;
    }

    $dbPath = dirname(__DIR__) . '/data/studio.db';
    if (!file_exists($dbPath)) {
        return false;
    }

    try {
        $db = \VoxelSite\Database::getInstance($dbPath);
        return $db->count('users') > 0;
    } catch (\Throwable) {
        return false;
    }
}

/**
 * Get the current UTC timestamp in ISO 8601 format.
 * Used consistently across all database writes.
 */
function now(): string
{
    return gmdate('Y-m-d\TH:i:s\Z');
}
