<?php

declare(strict_types=1);

/**
 * Agent API — Settings Endpoint
 *
 * GET /settings — Read public-safe settings (redacted)
 * PUT /settings — Update whitelisted settings
 *
 * Receives $_agentContext from router.php.
 */

use VoxelSite\Logger;
use VoxelSite\Settings;

$ctx      = $_agentContext;
$method   = $ctx['method'];
$settings = $ctx['settings'];

// ═══════════════════════════════════════════
//  GET /settings — Redacted read
// ═══════════════════════════════════════════

if ($method === 'GET') {
    // Public-safe settings — no API keys, no encryption keys, no passwords
    $publicKeys = [
        'site_name', 'site_tagline', 'site_language', 'site_url', 'site_favicon',
        'ai_provider',
        'nav_style', 'mobile_nav_style', 'footer_style',
        'auto_snapshot', 'max_snapshots', 'max_revisions',
        'last_published_at', 'publish_count',
        'agent_api_enabled', 'agent_api_allowed_origins',
    ];

    $all = $settings->getAll();
    $redacted = [];
    foreach ($publicKeys as $key) {
        if (array_key_exists($key, $all)) {
            $redacted[$key] = $all[$key];
        }
    }

    agentResponse(['data' => ['settings' => $redacted]]);
    return;
}

// ═══════════════════════════════════════════
//  PUT /settings — Update whitelisted keys
// ═══════════════════════════════════════════

if ($method === 'PUT') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    // Writable settings via Agent API — subset of Studio whitelist,
    // explicitly excluding AI API keys and sensitive configuration
    $writableKeys = [
        'site_name', 'site_tagline', 'site_language', 'site_url', 'site_favicon',
        'nav_style', 'mobile_nav_style', 'footer_style',
        'auto_snapshot', 'max_snapshots', 'max_revisions',
    ];

    $updates = [];
    $rejected = [];

    foreach ($body as $key => $value) {
        if (in_array($key, $writableKeys, true)) {
            $updates[$key] = $value;
        } else {
            $rejected[] = $key;
        }
    }

    if (empty($updates)) {
        Logger::warning('agent-api', 'Settings update: all keys rejected', [
            'rejected'  => $rejected,
            'key_label' => $ctx['keyData']['label'] ?? 'unknown',
        ]);
        agentError(422, 'validation_error', 'No valid settings provided.', [
            'rejected_keys' => $rejected,
            'writable_keys' => $writableKeys,
        ]);
        return;
    }

    $settings->setMany($updates);

    Logger::info('agent-api', 'Settings updated', [
        'updated'   => array_keys($updates),
        'rejected'  => $rejected,
        'key_label' => $ctx['keyData']['label'] ?? 'unknown',
    ]);

    agentResponse(['data' => [
        'updated'  => array_keys($updates),
        'rejected' => $rejected,
    ]]);
    return;
}
