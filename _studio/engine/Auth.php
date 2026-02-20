<?php

declare(strict_types=1);

namespace VoxelSite;

use RuntimeException;

/**
 * Authentication engine — login, logout, session management.
 *
 * Uses custom session tokens (64-char hex) stored in the sessions
 * table, not PHP's built-in session handler. This gives us explicit
 * control over expiry, token format, and cookie attributes without
 * relying on session.save_handler configuration.
 *
 * Security measures:
 * - Passwords hashed with bcrypt (PASSWORD_DEFAULT)
 * - Rate limiting: 5 failed attempts per IP per 15 minutes
 * - Session tokens: 64 hex chars (256 bits of entropy)
 * - Cookie: HttpOnly, Secure (when on HTTPS), SameSite=Lax
 * - 30-day session expiry
 */
class Auth
{
    private Database $db;

    /** Rate limit: max failed attempts before lockout */
    private const MAX_ATTEMPTS = 5;

    /** Rate limit: window in minutes */
    private const LOCKOUT_MINUTES = 15;

    /** Session lifetime in days */
    private const SESSION_DAYS = 30;

    public function __construct(?Database $db = null)
    {
        $this->db = $db ?? Database::getInstance();
    }

    // ═══════════════════════════════════════════
    //  Login
    // ═══════════════════════════════════════════

    /**
     * Attempt to log in with email and password.
     *
     * Returns the session token on success, or null on failure.
     * Handles rate limiting, password verification, session creation,
     * and login attempt logging in one method.
     *
     * @return array{token: string, user: array}|null
     */
    public function login(string $email, string $password, string $ip, string $userAgent): ?array
    {
        // Check rate limiting first — before even touching the users table
        if ($this->isRateLimited($ip)) {
            return null;
        }

        $email = strtolower(trim($email));

        // Find user by email
        $user = $this->db->queryOne(
            'SELECT id, email, name, role, password_hash FROM users WHERE email = ?',
            [$email]
        );

        // Log the attempt regardless of outcome
        $success = false;

        if ($user !== null && password_verify($password, $user['password_hash'])) {
            $success = true;
        }

        $this->logAttempt($ip, $email, $success);

        if (!$success) {
            return null;
        }

        // ── Create session ──
        $token = $this->generateSessionToken();
        $now = now();
        $expiresAt = gmdate('Y-m-d\TH:i:s\Z', time() + (self::SESSION_DAYS * 86400));

        $this->db->insert('sessions', [
            'id'         => $token,
            'user_id'    => $user['id'],
            'ip_address' => $ip,
            'user_agent' => substr($userAgent, 0, 512),
            'expires_at' => $expiresAt,
            'created_at' => $now,
        ]);

        // Update last login timestamp
        $this->db->update('users', ['last_login_at' => $now], 'id = ?', [$user['id']]);

        // Set the session cookie
        $this->setSessionCookie($token);

        return [
            'token' => $token,
            'user'  => [
                'id'    => $user['id'],
                'email' => $user['email'],
                'name'  => $user['name'],
                'role'  => $user['role'],
            ],
        ];
    }

    // ═══════════════════════════════════════════
    //  Logout
    // ═══════════════════════════════════════════

    /**
     * Destroy the current session.
     *
     * Removes the session from the database and clears the cookie.
     * Does not throw if the session doesn't exist (idempotent).
     */
    public function logout(?string $token = null): void
    {
        $token = $token ?? ($_COOKIE['vs_session'] ?? null);

        if ($token !== null) {
            $this->db->delete('sessions', 'id = ?', [$token]);
        }

        // Clear the cookie regardless
        $this->clearSessionCookie();
    }

    // ═══════════════════════════════════════════
    //  Session Validation
    // ═══════════════════════════════════════════

    /**
     * Get the currently authenticated user from the session cookie.
     *
     * Returns null if no valid session exists. This is the method
     * the middleware calls on every API request.
     *
     * @return array{id: int, email: string, name: string, role: string}|null
     */
    public function getCurrentUser(): ?array
    {
        $token = $_COOKIE['vs_session'] ?? null;
        if ($token === null || strlen($token) !== 64) {
            return null;
        }

        $now = now();

        $row = $this->db->queryOne(
            "SELECT u.id, u.email, u.name, u.role
             FROM sessions s
             JOIN users u ON u.id = s.user_id
             WHERE s.id = ? AND s.expires_at > ?",
            [$token, $now]
        );

        return $row;
    }

    // ═══════════════════════════════════════════
    //  User Management
    // ═══════════════════════════════════════════

    /**
     * Create a new user account.
     *
     * Used during installation (owner role) and potentially for
     * adding admin users later.
     *
     * @return int The new user's ID
     */
    public function createUser(string $name, string $email, string $password, string $role = 'admin'): int
    {
        $email = strtolower(trim($email));
        $now = now();

        return $this->db->insert('users', [
            'email'         => $email,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            'name'          => trim($name),
            'role'          => $role,
            'created_at'    => $now,
            'updated_at'    => $now,
        ]);
    }

    /**
     * Update user password. Requires knowing the current password.
     *
     * Returns true on success, false if current password is wrong.
     */
    public function updatePassword(int $userId, string $currentPassword, string $newPassword): bool
    {
        $user = $this->db->queryOne(
            'SELECT password_hash FROM users WHERE id = ?',
            [$userId]
        );

        if ($user === null || !password_verify($currentPassword, $user['password_hash'])) {
            return false;
        }

        $this->db->update('users', [
            'password_hash' => password_hash($newPassword, PASSWORD_DEFAULT),
            'updated_at'    => now(),
        ], 'id = ?', [$userId]);

        return true;
    }

    /**
     * Update user profile (name, email).
     */
    public function updateProfile(int $userId, string $name, string $email): void
    {
        $this->db->update('users', [
            'name'       => trim($name),
            'email'      => strtolower(trim($email)),
            'updated_at' => now(),
        ], 'id = ?', [$userId]);
    }

    /**
     * Reset password using server-file verification.
     *
     * For self-hosted systems without email: the owner places a
     * `.reset` file in `_data/` (proving server access), then
     * submits their email + new password through the UI.
     *
     * The `.reset` file is consumed (deleted) after successful reset.
     *
     * @return array{ok: bool, error?: string}
     */
    public function resetPasswordWithFile(string $email, string $newPassword): array
    {
        $resetFile = dirname(__DIR__, 2) . '/_data/.reset';

        if (!is_file($resetFile)) {
            return [
                'ok'    => false,
                'error' => 'No reset token found. Create a file named ".reset" in your _data/ directory, then try again.',
            ];
        }

        $email = strtolower(trim($email));

        $user = $this->db->queryOne(
            'SELECT id FROM users WHERE email = ?',
            [$email]
        );

        if ($user === null) {
            return [
                'ok'    => false,
                'error' => 'No account found with that email address.',
            ];
        }

        // Reset the password
        $this->db->update('users', [
            'password_hash' => password_hash($newPassword, PASSWORD_DEFAULT),
            'updated_at'    => now(),
        ], 'id = ?', [$user['id']]);

        // Consume the reset file — one-time use
        @unlink($resetFile);

        // Destroy all existing sessions for this user (force re-login)
        $this->db->delete('sessions', 'user_id = ?', [$user['id']]);

        return ['ok' => true];
    }

    /**
     * Send a password reset email with a time-limited token.
     *
     * Generates a 64-char hex token, stores it in `_data/.reset-token`
     * as JSON (email + token hash + expiry), and emails the user a
     * direct reset link: `/_studio/?reset=TOKEN`
     *
     * Token expires after 1 hour. Only one active token at a time.
     *
     * @return array{ok: bool, error?: string}
     */
    public function sendResetEmail(string $email): array
    {
        $email = strtolower(trim($email));

        $user = $this->db->queryOne(
            'SELECT id, name FROM users WHERE email = ?',
            [$email]
        );

        if ($user === null) {
            // Don't reveal whether the email exists — always show success
            return ['ok' => true];
        }

        // Generate token
        $token = bin2hex(random_bytes(32)); // 64 hex chars
        $tokenFile = dirname(__DIR__, 2) . '/_data/.reset-token';

        // Store token data (hashed token for comparison, raw is emailed)
        $tokenData = [
            'email'      => $email,
            'token_hash' => hash('sha256', $token),
            'expires_at' => time() + 3600, // 1 hour
            'created_at' => gmdate('Y-m-d\TH:i:s\Z'),
        ];

        file_put_contents($tokenFile, json_encode($tokenData, JSON_PRETTY_PRINT));

        // Build reset URL
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $resetUrl = "{$protocol}://{$host}/_studio/?reset={$token}";

        // Send email
        $mailer = \VoxelSite\Mailer::getInstance();
        $subject = 'Reset your VoxelSite password';
        $body = "Hi {$user['name']},\n\n"
              . "We received a request to reset your password.\n\n"
              . "Click the link below to set a new password:\n"
              . "{$resetUrl}\n\n"
              . "This link expires in 1 hour.\n\n"
              . "If you didn't request this, you can safely ignore this email.\n";

        $sent = $mailer->send($email, $subject, $body);

        if (!$sent) {
            // Clean up the token file if email failed
            @unlink($tokenFile);
            return [
                'ok'    => false,
                'error' => 'Failed to send the reset email. Check your mail configuration in Settings.',
            ];
        }

        return ['ok' => true];
    }

    /**
     * Reset password using an emailed token.
     *
     * Verifies the token against `_data/.reset-token`, checks expiry,
     * resets the password, consumes the token file, destroys sessions.
     *
     * @return array{ok: bool, error?: string}
     */
    public function resetPasswordWithToken(string $token, string $newPassword): array
    {
        $tokenFile = dirname(__DIR__, 2) . '/_data/.reset-token';

        if (!is_file($tokenFile)) {
            return [
                'ok'    => false,
                'error' => 'Invalid or expired reset link. Please request a new one.',
            ];
        }

        $tokenData = json_decode(file_get_contents($tokenFile), true);
        if (!$tokenData) {
            @unlink($tokenFile);
            return [
                'ok'    => false,
                'error' => 'Invalid reset token. Please request a new one.',
            ];
        }

        // Check expiry
        if (time() > ($tokenData['expires_at'] ?? 0)) {
            @unlink($tokenFile);
            return [
                'ok'    => false,
                'error' => 'This reset link has expired. Please request a new one.',
            ];
        }

        // Verify token (constant-time comparison)
        $expectedHash = $tokenData['token_hash'] ?? '';
        if (!hash_equals($expectedHash, hash('sha256', $token))) {
            return [
                'ok'    => false,
                'error' => 'Invalid reset link. Please request a new one.',
            ];
        }

        // Find the user
        $email = $tokenData['email'] ?? '';
        $user = $this->db->queryOne(
            'SELECT id FROM users WHERE email = ?',
            [$email]
        );

        if ($user === null) {
            @unlink($tokenFile);
            return [
                'ok'    => false,
                'error' => 'Account not found.',
            ];
        }

        // Reset the password
        $this->db->update('users', [
            'password_hash' => password_hash($newPassword, PASSWORD_DEFAULT),
            'updated_at'    => now(),
        ], 'id = ?', [$user['id']]);

        // Consume the token — one-time use
        @unlink($tokenFile);

        // Destroy all existing sessions
        $this->db->delete('sessions', 'user_id = ?', [$user['id']]);

        return ['ok' => true];
    }


    // ═══════════════════════════════════════════
    //  Rate Limiting
    // ═══════════════════════════════════════════

    /**
     * Check if an IP address is currently rate-limited.
     *
     * Counts failed login attempts in the last LOCKOUT_MINUTES.
     * Returns true if the limit is exceeded.
     */
    public function isRateLimited(string $ip): bool
    {
        $since = gmdate('Y-m-d\TH:i:s\Z', time() - (self::LOCKOUT_MINUTES * 60));

        $count = $this->db->scalar(
            "SELECT COUNT(*) FROM login_attempts
             WHERE ip_address = ? AND attempted_at > ? AND success = 0",
            [$ip, $since]
        );

        return (int) $count >= self::MAX_ATTEMPTS;
    }

    /**
     * Get the number of seconds until rate limit expires for an IP.
     * Returns 0 if not rate-limited.
     */
    public function getRateLimitReset(string $ip): int
    {
        if (!$this->isRateLimited($ip)) {
            return 0;
        }

        $since = gmdate('Y-m-d\TH:i:s\Z', time() - (self::LOCKOUT_MINUTES * 60));

        $oldest = $this->db->scalar(
            "SELECT MIN(attempted_at) FROM login_attempts
             WHERE ip_address = ? AND attempted_at > ? AND success = 0",
            [$ip, $since]
        );

        if ($oldest === null) {
            return 0;
        }

        $resetTime = strtotime($oldest) + (self::LOCKOUT_MINUTES * 60);
        $remaining = $resetTime - time();

        return max(0, $remaining);
    }

    /**
     * Record an auth-related attempt for shared rate limiting.
     *
     * Used by password reset endpoints so failed reset attempts
     * count toward the same IP-based throttling as login failures.
     */
    public function recordAttempt(string $ip, string $email, bool $success): void
    {
        $email = strtolower(trim($email));
        $this->logAttempt($ip, $email, $success);
    }

    // ═══════════════════════════════════════════
    //  Session Cleanup
    // ═══════════════════════════════════════════

    /**
     * Remove expired sessions from the database.
     *
     * Called opportunistically (not on every request — that would
     * be wasteful). The router or a lightweight cron can call this.
     */
    public function cleanExpiredSessions(): int
    {
        return $this->db->delete('sessions', 'expires_at < ?', [now()]);
    }

    /**
     * Remove old login attempt records (older than 24 hours).
     */
    public function cleanOldAttempts(): int
    {
        $cutoff = gmdate('Y-m-d\TH:i:s\Z', time() - 86400);
        return $this->db->delete('login_attempts', 'attempted_at < ?', [$cutoff]);
    }

    // ═══════════════════════════════════════════
    //  Private Helpers
    // ═══════════════════════════════════════════

    /**
     * Generate a cryptographically secure 64-character hex token.
     * 32 random bytes → 64 hex characters → 256 bits of entropy.
     */
    private function generateSessionToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Log a login attempt for rate limiting.
     */
    private function logAttempt(string $ip, string $email, bool $success): void
    {
        $this->db->insert('login_attempts', [
            'ip_address'   => $ip,
            'email'        => $email,
            'success'      => $success ? 1 : 0,
            'attempted_at' => now(),
        ]);
    }

    /**
     * Set the session cookie with secure attributes.
     *
     * HttpOnly: JavaScript can't read the cookie (XSS protection)
     * SameSite=Lax: prevents CSRF from external sites
     * Secure: only sent over HTTPS (when applicable)
     * Path: scoped to /_studio/ only
     */
    private function setSessionCookie(string $token): void
    {
        $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
                 || (int)($_SERVER['SERVER_PORT'] ?? 0) === 443;

        setcookie('vs_session', $token, [
            'expires'  => time() + (self::SESSION_DAYS * 86400),
            'path'     => '/_studio/',
            'secure'   => $isSecure,
            'httponly'  => true,
            'samesite' => 'Lax',
        ]);
    }

    /**
     * Clear the session cookie.
     */
    private function clearSessionCookie(): void
    {
        setcookie('vs_session', '', [
            'expires'  => time() - 3600,
            'path'     => '/_studio/',
            'httponly'  => true,
            'samesite' => 'Lax',
        ]);
    }
}
