<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Demo Mode — read-only experience layer.
 *
 * Activated by the presence of a `.demo` file in the project root
 * (next to index.php and _studio/). The file may be empty — its
 * existence alone is the signal. No database setting, no UI toggle.
 *
 * When active:
 * - All write API endpoints return 403 with a demo-mode message
 * - AI prompt/generation requests are hard-blocked (zero API calls)
 * - The login page pre-fills demo credentials and shows a banner
 * - A persistent "Demo Mode" badge appears in the Studio top bar
 *
 * To enable:  touch .demo  (in the project root)
 * To disable: rm .demo     (instant — no restart required)
 */
class DemoMode
{
    /** Cached result so we only hit the filesystem once per request */
    private static ?bool $active = null;

    /**
     * Check if demo mode is active.
     *
     * Looks for a `.demo` file in the project root directory.
     * Result is cached for the duration of the request.
     */
    public static function isActive(): bool
    {
        if (self::$active !== null) {
            return self::$active;
        }

        $projectRoot = dirname(__DIR__, 2);
        self::$active = file_exists($projectRoot . '/.demo');

        return self::$active;
    }

    /**
     * If demo mode is active, send a 403 response and exit.
     *
     * Call this at the top of any write endpoint or before
     * dispatching state-changing routes in the router.
     */
    public static function blockIfActive(): void
    {
        if (!self::isActive()) {
            return;
        }

        http_response_code(403);
        echo json_encode([
            'ok'    => false,
            'error' => [
                'code'    => 'demo_mode',
                'message' => 'Demo mode — this action is disabled.',
            ],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Routes that are allowed in demo mode (read-only).
     *
     * Everything not in this list is blocked for state-changing methods
     * (POST, PUT, DELETE). GET requests are always allowed.
     */
    private const ALLOWED_WRITE_ROUTES = [
        // Auth: login and session management must work
        'POST /auth/login',
        'POST /auth/logout',
    ];

    /**
     * Check if a specific route should be blocked in demo mode.
     *
     * GET requests are never blocked. POST/PUT/DELETE requests
     * are blocked unless they appear in the allow list.
     *
     * @param string $method HTTP method (GET, POST, PUT, DELETE)
     * @param string $path   Route path (e.g., /ai/prompt)
     * @return bool True if the route should be blocked
     */
    public static function shouldBlock(string $method, string $path): bool
    {
        if (!self::isActive()) {
            return false;
        }

        // GET requests are always allowed (read-only)
        if ($method === 'GET') {
            return false;
        }

        // Check the allow list
        $routeKey = $method . ' ' . $path;
        foreach (self::ALLOWED_WRITE_ROUTES as $allowed) {
            if ($routeKey === $allowed) {
                return false;
            }
        }

        // All other write requests are blocked
        return true;
    }
}
