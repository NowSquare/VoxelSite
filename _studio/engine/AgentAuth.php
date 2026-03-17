<?php

declare(strict_types=1);

namespace VoxelSite;

use RuntimeException;

/**
 * Agent API authentication — Bearer token validation, scope enforcement, rate limiting.
 *
 * This class handles the entire auth lifecycle for the Agent API
 * (`/_studio/api/agent/v1/`). It is separate from the session-based
 * Auth class which handles human users logging in via the Studio UI.
 *
 * Security model:
 * ─────────────────
 * - API keys are 32 random bytes → 64 hex chars, prefixed with `vxs_` (68 chars total)
 * - Keys are stored as SHA-256 hashes (never plaintext, never reversible)
 * - Each key has a role (owner, editor, viewer, agent) and granular scopes
 * - Rate limiting is per-key, per-hour (SQLite counter, not in-memory)
 * - Every request is logged to the structured Logger (channel: 'agent-api')
 *
 * Key format: vxs_<64 hex chars>  (68 chars total)
 * Example:    vxs_a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef12345678
 *
 * Why SHA-256 hashes instead of AES encryption (like AI provider keys)?
 * ───────────────────────────────────────────────────────────────────────
 * AI provider keys need decryption (we send them to external APIs).
 * Agent API keys never need to be read back — we only compare hashes.
 * One-way hashing is simpler and more secure for this use case:
 * even if the database leaks, the keys are unrecoverable.
 *
 * @see Auth — session-based authentication for human users
 * @see Encryption — AES-256-CBC encryption for AI provider keys
 */
class AgentAuth
{
    private Database $db;

    /** API key prefix — makes keys greppable in logs */
    private const KEY_PREFIX = 'vxs_';

    /** Hex length after the prefix: 32 random bytes → 64 hex chars */
    private const KEY_HEX_LENGTH = 64;

    /** Total key length: prefix (4) + hex (64) = 68 chars */
    private const KEY_TOTAL_LENGTH = 68;

    /** Valid roles for API keys — matches the user role system */
    private const VALID_ROLES = ['owner', 'editor', 'viewer', 'agent'];

    /** All available scopes, grouped by resource */
    private const ALL_SCOPES = [
        'pages:read',
        'pages:write',
        'settings:read',
        'settings:write',
        'compile:trigger',
        'publish:trigger',
        'submissions:read',
        'assets:read',
        'assets:write',
        'tools:invoke',
    ];

    /** Default scopes per role — principle of least privilege */
    private const ROLE_DEFAULTS = [
        'owner'  => ['pages:read', 'pages:write', 'settings:read', 'settings:write',
                      'compile:trigger', 'publish:trigger', 'submissions:read',
                      'assets:read', 'assets:write', 'tools:invoke'],
        'editor' => ['pages:read', 'pages:write', 'compile:trigger',
                      'submissions:read', 'assets:read', 'assets:write', 'tools:invoke'],
        // Agent: full automation access (pages, assets, compile, publish, submissions, tools).
        // Intentionally excludes settings:write — an agent should not be able to
        // disable the API or change allowed origins (would lock itself out).
        'agent'  => ['pages:read', 'pages:write', 'settings:read',
                      'compile:trigger', 'publish:trigger', 'submissions:read',
                      'assets:read', 'assets:write', 'tools:invoke'],
        'viewer' => ['pages:read', 'settings:read', 'submissions:read', 'assets:read'],
    ];

    /** Default rate limits per role (requests per hour) */
    private const RATE_LIMITS = [
        'owner'  => 1000,
        'editor' => 500,
        'agent'  => 300,
        'viewer' => 200,
    ];

    // ── Auth result statuses ──
    public const AUTH_OK             = 'ok';
    public const AUTH_NO_HEADER      = 'no_header';
    public const AUTH_MALFORMED      = 'malformed';
    public const AUTH_INVALID_KEY    = 'invalid_key';
    public const AUTH_RATE_LIMITED   = 'rate_limited';

    public function __construct(?Database $db = null)
    {
        if (DemoMode::isActive()) {
            throw new RuntimeException('Agent API is disabled in demo mode.');
        }
        $this->db = $db ?? Database::getInstance();
        $this->ensureTable();
    }

    // ═══════════════════════════════════════════
    //  Key Management
    // ═══════════════════════════════════════════

    /**
     * Generate a new API key.
     *
     * Returns the plaintext key (displayed once to the user) and
     * the key metadata. The plaintext key is NEVER stored — only
     * its SHA-256 hash.
     *
     * @param string   $label  Human-readable name ("SEO automation", "Zapier sync")
     * @param string   $role   One of: owner, editor, viewer, agent
     * @param string[] $scopes Granular permissions (defaults to role defaults)
     * @return array{key: string, id: int, label: string, role: string, scopes: string[]}
     */
    public function createKey(string $label, string $role, array $scopes = []): array
    {
        if (!in_array($role, self::VALID_ROLES, true)) {
            throw new RuntimeException("Invalid role: {$role}. Must be one of: " . implode(', ', self::VALID_ROLES));
        }

        // Default to role-appropriate scopes if none specified
        if (empty($scopes)) {
            $scopes = self::ROLE_DEFAULTS[$role] ?? [];
        }

        // Validate all scopes
        $invalid = array_diff($scopes, self::ALL_SCOPES);
        if (!empty($invalid)) {
            throw new RuntimeException('Invalid scopes: ' . implode(', ', $invalid));
        }

        // Enforce role ceiling — can't grant scopes beyond what the role allows
        $allowed = self::ROLE_DEFAULTS[$role] ?? [];
        $exceeding = array_diff($scopes, $allowed);
        if (!empty($exceeding)) {
            throw new RuntimeException(
                "Scopes exceed role '{$role}' ceiling: " . implode(', ', $exceeding)
            );
        }

        // Generate the key: vxs_ + 64 hex chars (32 random bytes)
        $plaintext = self::KEY_PREFIX . bin2hex(random_bytes(32));
        $hash = hash('sha256', $plaintext);

        $now = now();
        $rateLimit = self::RATE_LIMITS[$role] ?? 100;

        $id = $this->db->insert('api_keys', [
            'key_hash'     => $hash,
            'key_prefix'   => substr($plaintext, 0, 12),  // 'vxs_a1b2c3d4' — for display
            'label'        => trim($label),
            'role'         => $role,
            'scopes'       => json_encode(array_values($scopes)),
            'rate_limit'   => $rateLimit,
            'last_used_at' => null,
            'created_at'   => $now,
        ]);

        Logger::info('agent-api', 'API key created', [
            'key_id'     => $id,
            'label'      => $label,
            'role'       => $role,
            'scopes'     => $scopes,
            'key_prefix' => substr($plaintext, 0, 12),
        ]);

        return [
            'key'    => $plaintext,
            'id'     => $id,
            'label'  => $label,
            'role'   => $role,
            'scopes' => $scopes,
        ];
    }

    /**
     * List all API keys (without hashes — display only).
     *
     * Returns key_prefix, label, role, scopes, rate_limit, last_used_at, created_at.
     *
     * @return array<int, array<string, mixed>>
     */
    public function listKeys(): array
    {
        return $this->db->query(
            'SELECT id, key_prefix, label, role, scopes, rate_limit, last_used_at, created_at
             FROM api_keys
             ORDER BY created_at DESC'
        );
    }

    /**
     * Revoke (delete) an API key. Idempotent.
     */
    public function revokeKey(int $keyId): bool
    {
        $deleted = $this->db->delete('api_keys', 'id = ?', [$keyId]);

        if ($deleted > 0) {
            Logger::info('agent-api', 'API key revoked', ['key_id' => $keyId]);

            // Clean up rate limit entries for this key
            $this->db->delete('api_key_rate_limits', 'key_id = ?', [$keyId]);
        }

        return $deleted > 0;
    }

    // ═══════════════════════════════════════════
    //  Request Authentication
    // ═══════════════════════════════════════════

    /**
     * Authenticate an incoming request from the Authorization header.
     *
     * Returns a structured result array that distinguishes between
     * success, missing/malformed headers, invalid keys, and rate
     * limiting — so the router can emit the correct HTTP status
     * (401 vs 429) and include rate-limit headers.
     *
     * @return array{status: string, key?: array, rate_limit?: int, remaining?: int, retry_after?: int}
     *
     * Possible `status` values:
     * - AUTH_OK:          Valid key, within rate limit. `key` is populated.
     * - AUTH_NO_HEADER:   No Authorization header found. → 401
     * - AUTH_MALFORMED:   Header present but wrong format. → 401
     * - AUTH_INVALID_KEY: Valid format but key not found in DB. → 401
     * - AUTH_RATE_LIMITED: Valid key but rate limit exceeded. → 429
     *                     `rate_limit`, `remaining`, `retry_after` are populated.
     */
    public function authenticate(): array
    {
        $header = $this->extractAuthorizationHeader();

        // No Authorization header at all
        if ($header === '') {
            return ['status' => self::AUTH_NO_HEADER];
        }

        // Extract Bearer token — must match vxs_ + 64 hex chars (68 total)
        if (!preg_match('/^Bearer\s+(vxs_[a-f0-9]{' . self::KEY_HEX_LENGTH . '})$/i', $header, $matches)) {
            return ['status' => self::AUTH_MALFORMED];
        }

        $plaintext = $matches[1];
        $hash = hash('sha256', $plaintext);

        $key = $this->db->queryOne(
            'SELECT id, label, role, scopes, rate_limit FROM api_keys WHERE key_hash = ?',
            [$hash]
        );

        if ($key === null) {
            Logger::warning('agent-api', 'Authentication failed: invalid key', [
                'key_prefix' => substr($plaintext, 0, 12),
                'ip'         => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            ]);
            return ['status' => self::AUTH_INVALID_KEY];
        }

        $keyId     = (int) $key['id'];
        $rateLimit = (int) $key['rate_limit'];

        // Check rate limit — return full rate info for response headers
        if ($this->isRateLimited($keyId, $rateLimit)) {
            $retryAfter = $this->getRetryAfterSeconds();

            Logger::warning('agent-api', 'Rate limited', [
                'key_id'      => $keyId,
                'rate_limit'  => $rateLimit,
                'retry_after' => $retryAfter,
            ]);

            return [
                'status'      => self::AUTH_RATE_LIMITED,
                'rate_limit'  => $rateLimit,
                'remaining'   => 0,
                'retry_after' => $retryAfter,
            ];
        }

        // Record usage
        $this->recordUsage($keyId);

        // Update last_used_at
        $this->db->update('api_keys', ['last_used_at' => now()], 'id = ?', [$keyId]);

        $scopes    = json_decode($key['scopes'], true) ?: [];
        $remaining = $this->getRemainingRequests($keyId, $rateLimit);

        return [
            'status'     => self::AUTH_OK,
            'key'        => [
                'id'     => $keyId,
                'role'   => $key['role'],
                'scopes' => $scopes,
                'label'  => $key['label'],
            ],
            'rate_limit' => $rateLimit,
            'remaining'  => $remaining,
        ];
    }

    /**
     * Extract the Authorization header from all common sources.
     *
     * Apache/FastCGI on shared hosting often strips the Authorization
     * header. This method checks three sources in priority order:
     *
     * 1. $_SERVER['HTTP_AUTHORIZATION'] — standard CGI variable
     * 2. $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] — set by Apache mod_rewrite
     * 3. getallheaders() — available on Apache + php_module and PHP 7.3+ for FastCGI
     *
     * If none work, the .htaccess SetEnvIf fallback (documented in
     * the Agent API setup guide) ensures the header reaches PHP:
     *   SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
     */
    private function extractAuthorizationHeader(): string
    {
        // 1. Standard — works on most setups
        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            return trim($_SERVER['HTTP_AUTHORIZATION']);
        }

        // 2. Apache mod_rewrite redirect — common on shared hosting
        if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            return trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
        }

        // 3. getallheaders() — available on Apache + php_module, PHP 7.3+ FastCGI
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            if ($headers !== false) {
                // Header names are case-insensitive per HTTP spec
                foreach ($headers as $name => $value) {
                    if (strtolower($name) === 'authorization') {
                        return trim($value);
                    }
                }
            }
        }

        return '';
    }

    /**
     * Check if the authenticated key has the required scope.
     *
     * Call this after authenticate() returns AUTH_OK, before
     * executing the requested operation.
     *
     * @param array  $keyData       The `key` array from authenticate() result
     * @param string $requiredScope The scope needed (e.g., 'pages:write')
     */
    public function hasScope(array $keyData, string $requiredScope): bool
    {
        return in_array($requiredScope, $keyData['scopes'] ?? [], true);
    }

    /**
     * Require a scope — throws if the key lacks it.
     *
     * Convenience wrapper for endpoint handlers:
     *   $auth->requireScope($result['key'], 'pages:write');
     *
     * @throws RuntimeException
     */
    public function requireScope(array $keyData, string $requiredScope): void
    {
        if (!$this->hasScope($keyData, $requiredScope)) {
            Logger::warning('agent-api', 'Scope denied', [
                'key_id'         => $keyData['id'],
                'required_scope' => $requiredScope,
                'granted_scopes' => $keyData['scopes'],
            ]);

            throw new RuntimeException(
                "Insufficient scope: this key does not have '{$requiredScope}'. "
                . "Granted scopes: " . implode(', ', $keyData['scopes'])
            );
        }
    }

    // ═══════════════════════════════════════════
    //  Rate Limiting
    // ═══════════════════════════════════════════

    /**
     * Check if a key has exceeded its hourly rate limit.
     *
     * Uses a simple SQLite counter with hourly window buckets.
     * No in-memory state — works across multiple PHP processes.
     */
    private function isRateLimited(int $keyId, int $maxPerHour): bool
    {
        $windowStart = gmdate('Y-m-d\TH:00:00\Z');

        $count = $this->db->scalar(
            'SELECT request_count FROM api_key_rate_limits
             WHERE key_id = ? AND window_start = ?',
            [$keyId, $windowStart]
        );

        return $count !== null && (int) $count >= $maxPerHour;
    }

    /**
     * Record a request for rate limiting.
     *
     * Uses parameterized queries (not string interpolation) and
     * consistent ISO 8601 UTC timestamps matching now() format.
     */
    private function recordUsage(int $keyId): void
    {
        $windowStart = gmdate('Y-m-d\TH:00:00\Z');

        // Upsert: create the window row if it doesn't exist, otherwise increment
        $this->db->getPdo()->prepare(
            'INSERT INTO api_key_rate_limits (key_id, window_start, request_count)
             VALUES (?, ?, 1)
             ON CONFLICT(key_id, window_start) DO UPDATE SET request_count = request_count + 1'
        )->execute([$keyId, $windowStart]);

        // Probabilistic cleanup: ~2% chance per request
        // Uses the same ISO 8601 format as window_start for reliable comparison
        if (random_int(1, 50) === 1) {
            $cutoff = gmdate('Y-m-d\TH:00:00\Z', time() - 86400);
            $this->db->getPdo()->prepare(
                'DELETE FROM api_key_rate_limits WHERE window_start < ?'
            )->execute([$cutoff]);
        }
    }

    /**
     * Get remaining requests for a key in the current window.
     *
     * Used by endpoint handlers to include rate limit headers
     * in the response (X-RateLimit-Remaining).
     */
    public function getRemainingRequests(int $keyId, int $maxPerHour): int
    {
        $windowStart = gmdate('Y-m-d\TH:00:00\Z');

        $count = $this->db->scalar(
            'SELECT request_count FROM api_key_rate_limits
             WHERE key_id = ? AND window_start = ?',
            [$keyId, $windowStart]
        );

        $used = $count !== null ? (int) $count : 0;
        return max(0, $maxPerHour - $used);
    }

    /**
     * Get seconds until the current rate limit window resets.
     *
     * Returns seconds remaining in the current hour window.
     * Used for the Retry-After response header on 429 responses.
     */
    private function getRetryAfterSeconds(): int
    {
        $now = time();
        $nextHour = (int) ceil($now / 3600) * 3600;
        return max(1, $nextHour - $now);
    }

    // ═══════════════════════════════════════════
    //  Response Helpers
    // ═══════════════════════════════════════════

    /**
     * Send a JSON error response and exit.
     *
     * Standardized error format for all Agent API endpoints.
     */
    public static function errorResponse(int $httpCode, string $errorCode, string $message, array $details = []): never
    {
        http_response_code($httpCode);
        header('Content-Type: application/json');

        $response = [
            'error' => [
                'code'    => $errorCode,
                'message' => $message,
            ],
        ];

        if (!empty($details)) {
            $response['error']['details'] = $details;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Send a JSON success response and exit.
     */
    public static function successResponse(array $data, int $httpCode = 200): never
    {
        http_response_code($httpCode);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * Send appropriate response headers for rate limiting.
     *
     * Should be called by the router on every authenticated response,
     * not just 429 errors. Enterprise clients expect these headers.
     */
    public static function sendRateLimitHeaders(array $authResult): void
    {
        if (isset($authResult['rate_limit'])) {
            header('X-RateLimit-Limit: ' . $authResult['rate_limit']);
        }
        if (isset($authResult['remaining'])) {
            header('X-RateLimit-Remaining: ' . $authResult['remaining']);
        }
        // Always send reset timestamp (next hour boundary)
        $nextHour = (int) ceil(time() / 3600) * 3600;
        header('X-RateLimit-Reset: ' . $nextHour);

        if ($authResult['status'] === self::AUTH_RATE_LIMITED && isset($authResult['retry_after'])) {
            header('Retry-After: ' . $authResult['retry_after']);
        }
    }

    // ═══════════════════════════════════════════
    //  Schema
    // ═══════════════════════════════════════════

    /**
     * Create the api_keys and rate limit tables if they don't exist.
     *
     * Called lazily on first use. Safe to call multiple times (idempotent).
     * Uses the same pattern as Migrator.php — IF NOT EXISTS guards.
     */
    private function ensureTable(): void
    {
        $this->db->exec('
            CREATE TABLE IF NOT EXISTS api_keys (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                key_hash    TEXT    NOT NULL UNIQUE,
                key_prefix  TEXT    NOT NULL,
                label       TEXT    NOT NULL,
                role        TEXT    NOT NULL DEFAULT \'agent\',
                scopes      TEXT    NOT NULL DEFAULT \'[]\',
                rate_limit  INTEGER NOT NULL DEFAULT 100,
                last_used_at TEXT,
                created_at  TEXT    NOT NULL
            )
        ');

        $this->db->exec('
            CREATE TABLE IF NOT EXISTS api_key_rate_limits (
                key_id       INTEGER NOT NULL,
                window_start TEXT    NOT NULL,
                request_count INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (key_id, window_start)
            )
        ');
    }

    /**
     * Get all available scopes (for Settings UI).
     *
     * @return string[]
     */
    public static function getAllScopes(): array
    {
        return self::ALL_SCOPES;
    }

    /**
     * Get default scopes for a role (for Settings UI).
     *
     * @return string[]
     */
    public static function getDefaultScopes(string $role): array
    {
        return self::ROLE_DEFAULTS[$role] ?? [];
    }

    /**
     * Get the default rate limit for a role.
     */
    public static function getDefaultRateLimit(string $role): int
    {
        return self::RATE_LIMITS[$role] ?? 100;
    }
}
