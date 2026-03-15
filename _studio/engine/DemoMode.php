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

    // ═══════════════════════════════════════════
    //  Synthetic Auth Constants
    // ═══════════════════════════════════════════

    /**
     * Deterministic session token for demo mode.
     *
     * Must be exactly 64 characters to pass the strlen check at
     * middleware.php authenticateRequest() and Auth.php getCurrentUser().
     *
     * Not a security secret — demo credentials are pre-filled in the UI.
     * This token only validates when .demo is active.
     *
     * Length: 'vs-demo-' (8) + 56 zeros = 64 ✓
     */
    public const DEMO_SESSION_TOKEN = 'vs-demo-00000000000000000000000000000000000000000000000000000000';

    public const DEMO_EMAIL    = 'demo@example.com';
    public const DEMO_PASSWORD = 'welcome3210';

    /**
     * The backend principal for demo sessions.
     *
     * role='demo' on purpose — this is what authenticateRequest() returns
     * and what backend endpoints see. The 'demo' role provides defense-in-depth:
     * endpoints like team.php that check role !== 'owner' will deny access
     * even if the route was missed in the override/block matrix.
     *
     * The frontend NEVER sees this role directly. The /auth/session response
     * and login response normalize it to 'owner' for UI visibility only.
     */
    public const DEMO_USER = [
        'id'    => 0,
        'email' => 'demo@example.com',
        'name'  => 'Studio Admin',
        'role'  => 'demo',
    ];


    // ═══════════════════════════════════════════
    //  Activation Check
    // ═══════════════════════════════════════════

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


    // ═══════════════════════════════════════════
    //  Write Blocking
    // ═══════════════════════════════════════════

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
        // Demo-safe submit stub for preview Actions Bar
        'POST /agentic/demo-submit',
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


    // ═══════════════════════════════════════════
    //  GET Override Routing
    // ═══════════════════════════════════════════

    /**
     * GET routes that should pass through to the live endpoint
     * even during demo mode. These are system-level endpoints
     * that don't expose user data.
     */
    private const PASSTHROUGH_ROUTES = [
        '/ai/actions',
        '/agentic/actions/templates',
    ];

    /**
     * GET routes that should be fully overridden with demo data.
     * Exact match required.
     */
    private const OVERRIDE_ROUTES = [
        '/auth/session',
        '/ai/history',
        '/ai/conversations',
        '/ai/diagnostics',
        '/revisions/state',
        '/revisions/list',
        '/pages',
        '/files',
        '/files/content',
        '/assets',
        // Note: /preview and /preview/diff are NOT here.
        // They pass through to preview.php, which is demo-aware
        // and swaps directories when DemoMode::isActive().
        '/snapshots',
        '/designs',
        '/settings',
        '/settings/models',
        '/settings/system',
        '/settings/mail',
        '/settings/mail/log',
        '/settings/usage',
        '/settings/logs',
        '/settings/logs/download',
        '/team',
        '/update/dist-packages',
        '/agentic/actions',               // List all actions (no trailing /)
        '/agentic/actions/bar-settings',   // Bar settings (exact route)
        '/agentic/manifest',               // Preview Actions Bar manifest
    ];

    /**
     * GET route prefixes that should be overridden with demo data.
     * Any path starting with one of these is overridden.
     */
    private const OVERRIDE_PREFIXES = [
        '/ai/conversations/',       // /ai/conversations/:id
        '/ai/actions/',             // /ai/actions/:id
        '/pages/',                  // /pages/:slug
        '/designs/',                // /designs/:id/preview
        '/forms',                   // /forms, /forms/:id, /forms/:id/submissions, etc.
        '/agentic/actions/',        // /agentic/actions/:id, /agentic/actions/:id/records, etc.
    ];

    /**
     * Check if a GET route should be overridden with demo data.
     *
     * Three-phase resolution (GET-only):
     * 1. Passthrough allowlist — never override these
     * 2. Exact match — check the override routes list
     * 3. Prefix match — check if the path starts with an override prefix
     *
     * @param string $method HTTP method
     * @param string $path   Route path
     * @return bool True if the route should be overridden
     */
    public static function shouldOverride(string $method, string $path): bool
    {
        if (!self::isActive() || $method !== 'GET') {
            return false;
        }

        // Phase 1: Passthrough — never override
        foreach (self::PASSTHROUGH_ROUTES as $route) {
            if ($path === $route) {
                return false;
            }
        }

        // Phase 2: Exact match
        if (in_array($path, self::OVERRIDE_ROUTES, true)) {
            return true;
        }

        // Phase 3: Prefix match
        foreach (self::OVERRIDE_PREFIXES as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return true;
            }
        }

        return false;
    }
}
