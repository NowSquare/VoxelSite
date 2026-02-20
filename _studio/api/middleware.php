<?php

declare(strict_types=1);

/**
 * API middleware: authentication and CSRF validation.
 *
 * These functions are called by the router before dispatching
 * to endpoint handlers. They enforce two security layers:
 *
 * 1. Session authentication — every API call (except login) must
 *    include a valid session cookie. The session is looked up in
 *    the database, not PHP's default session handler.
 *
 * 2. CSRF protection — every state-changing request (POST/PUT/DELETE)
 *    must include an X-VS-Token header matching the session ID.
 *    This prevents cross-site request forgery because the attacker
 *    can't read the session cookie value to set the header.
 */

use VoxelSite\Database;

/**
 * Validate the session cookie and return the authenticated user.
 *
 * Reads the 'vs_session' cookie, looks it up in the sessions table,
 * verifies it hasn't expired, and returns the associated user record.
 * Returns null if authentication fails for any reason.
 *
 * @return array{id: int, email: string, name: string, role: string}|null
 */
function authenticateRequest(): ?array
{
    $sessionId = $_COOKIE['vs_session'] ?? null;
    if ($sessionId === null || strlen($sessionId) !== 64) {
        return null;
    }

    $db = Database::getInstance();
    $now = gmdate('Y-m-d\TH:i:s\Z');

    // Join sessions → users, check expiry in one query
    $row = $db->queryOne(
        "SELECT u.id, u.email, u.name, u.role
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.id = ? AND s.expires_at > ?",
        [$sessionId, $now]
    );

    return $row;
}

/**
 * Validate the CSRF token header.
 *
 * The frontend includes the session ID as the X-VS-Token header
 * on every state-changing request. Because cookies are HttpOnly,
 * JavaScript reads the token from a meta tag or state store —
 * but a cross-origin attacker can't access it.
 *
 * This is a simple but effective CSRF mitigation: the attacker
 * can trigger a request with the cookie (automatic), but can't
 * set the custom header (requires reading the token value).
 */
function validateCsrf(): bool
{
    $token = $_SERVER['HTTP_X_VS_TOKEN'] ?? null;
    $sessionId = $_COOKIE['vs_session'] ?? null;

    if ($token === null || $sessionId === null) {
        return false;
    }

    return hash_equals($sessionId, $token);
}

/**
 * Read the JSON request body.
 *
 * Returns the decoded body as an associative array, or an empty
 * array if the body is empty or not valid JSON. Used by POST/PUT
 * endpoint handlers to read structured input.
 *
 * @return array<string, mixed>
 */
function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}
