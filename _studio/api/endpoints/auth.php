<?php

declare(strict_types=1);

/**
 * Auth API Endpoints
 *
 * POST /auth/login  — Authenticate with email + password
 * POST /auth/logout — Destroy session
 * GET  /auth/session — Get current session info
 *
 * Login is the only unprotected endpoint (requiresAuth: false
 * in the router). Logout and session require a valid session.
 */

use VoxelSite\Auth;
use VoxelSite\Validator;

$method = $_REQUEST['_route_method'];
$path = $_REQUEST['_route_path'];

$auth = new Auth();

// ═══════════════════════════════════════════
//  POST /auth/login
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/auth/login') {
    $body = getJsonBody();

    // ── Validate input ──
    $emailError = Validator::email($body['email'] ?? '');
    if ($emailError !== null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => $emailError,
        ]], 422);
        return;
    }

    if (empty($body['password'])) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Password is required.',
        ]], 422);
        return;
    }

    // ── Check rate limiting ──
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    if ($auth->isRateLimited($ip)) {
        $resetIn = $auth->getRateLimitReset($ip);
        $minutes = max(1, (int) ceil($resetIn / 60));

        jsonResponse(['ok' => false, 'error' => [
            'code'       => 'rate_limited',
            'message'    => "Too many login attempts. Try again in {$minutes} minute" . ($minutes > 1 ? 's' : '') . '.',
            'retry_after' => $resetIn,
        ]], 429);
        return;
    }

    // ── Attempt login ──
    $result = $auth->login(
        $body['email'],
        $body['password'],
        $ip,
        $_SERVER['HTTP_USER_AGENT'] ?? ''
    );

    if ($result === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'invalid_credentials',
            'message' => 'Email or password is incorrect.',
        ]], 401);
        return;
    }

    jsonResponse([
        'ok'   => true,
        'data' => [
            'user'  => $result['user'],
            'token' => $result['token'],
        ],
    ]);
    return;
}

// ═══════════════════════════════════════════
//  GET /auth/recovery-mode
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/auth/recovery-mode') {
    $settings = new \VoxelSite\Settings();
    $driver = $settings->get('mail.driver', 'none');

    // Show file-based recovery only when no mail provider is selected.
    // The .reset file mechanism always works on the backend regardless,
    // but the UI instructions only appear for 'none'.
    $mode = ($driver === 'none' || $driver === '') ? 'file' : 'email';

    jsonResponse([
        'ok'   => true,
        'data' => [
            'mode' => $mode,
        ],
    ]);
    return;
}

// ═══════════════════════════════════════════
//  POST /auth/send-reset
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/auth/send-reset') {
    $body = getJsonBody();

    // ── Validate email ──
    $emailError = Validator::email($body['email'] ?? '');
    if ($emailError !== null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => $emailError,
        ]], 422);
        return;
    }

    // ── Rate limiting ──
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    if ($auth->isRateLimited($ip)) {
        $resetIn = $auth->getRateLimitReset($ip);
        $minutes = max(1, (int) ceil($resetIn / 60));

        jsonResponse(['ok' => false, 'error' => [
            'code'       => 'rate_limited',
            'message'    => "Too many attempts. Try again in {$minutes} minute" . ($minutes > 1 ? 's' : '') . '.',
            'retry_after' => $resetIn,
        ]], 429);
        return;
    }

    $result = $auth->sendResetEmail($body['email']);

    if (!$result['ok']) {
        $auth->recordAttempt($ip, (string) ($body['email'] ?? ''), false);
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'send_failed',
            'message' => $result['error'],
        ]], 500);
        return;
    }

    // Always show success (don't reveal whether the email exists)
    jsonResponse([
        'ok'   => true,
        'data' => ['message' => 'If an account exists with that email, a recovery link has been sent.'],
    ]);
    return;
}

// ═══════════════════════════════════════════
//  POST /auth/reset-with-token
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/auth/reset-with-token') {
    $body = getJsonBody();
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

    $token = $body['token'] ?? '';
    if (empty($token) || strlen($token) !== 64) {
        $auth->recordAttempt($ip, 'reset-token', false);
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Invalid reset token.',
        ]], 422);
        return;
    }

    $newPassword = $body['new_password'] ?? '';
    if (strlen($newPassword) < 8) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'New password must be at least 8 characters.',
        ]], 422);
        return;
    }

    // ── Rate limiting ──
    if ($auth->isRateLimited($ip)) {
        $resetIn = $auth->getRateLimitReset($ip);
        $minutes = max(1, (int) ceil($resetIn / 60));

        jsonResponse(['ok' => false, 'error' => [
            'code'       => 'rate_limited',
            'message'    => "Too many attempts. Try again in {$minutes} minute" . ($minutes > 1 ? 's' : '') . '.',
            'retry_after' => $resetIn,
        ]], 429);
        return;
    }

    $result = $auth->resetPasswordWithToken($token, $newPassword);

    if (!$result['ok']) {
        $auth->recordAttempt($ip, 'reset-token', false);
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'reset_failed',
            'message' => $result['error'],
        ]], 400);
        return;
    }

    jsonResponse([
        'ok'   => true,
        'data' => ['message' => 'Password has been reset. You can now sign in.'],
    ]);
    return;
}

// ═══════════════════════════════════════════
//  POST /auth/reset-password  (file-based)
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/auth/reset-password') {
    $body = getJsonBody();

    // ── Validate input ──
    $emailError = Validator::email($body['email'] ?? '');
    if ($emailError !== null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => $emailError,
        ]], 422);
        return;
    }

    $newPassword = $body['new_password'] ?? '';
    if (strlen($newPassword) < 8) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'New password must be at least 8 characters.',
        ]], 422);
        return;
    }

    // ── Rate limiting (reuse login rate limiter) ──
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    if ($auth->isRateLimited($ip)) {
        $resetIn = $auth->getRateLimitReset($ip);
        $minutes = max(1, (int) ceil($resetIn / 60));

        jsonResponse(['ok' => false, 'error' => [
            'code'       => 'rate_limited',
            'message'    => "Too many attempts. Try again in {$minutes} minute" . ($minutes > 1 ? 's' : '') . '.',
            'retry_after' => $resetIn,
        ]], 429);
        return;
    }

    // ── Attempt reset ──
    $result = $auth->resetPasswordWithFile($body['email'], $newPassword);

    if (!$result['ok']) {
        $auth->recordAttempt($ip, (string) ($body['email'] ?? ''), false);
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'reset_failed',
            'message' => $result['error'],
        ]], 400);
        return;
    }

    jsonResponse([
        'ok'   => true,
        'data' => ['message' => 'Password has been reset. You can now sign in.'],
    ]);
    return;
}

// ═══════════════════════════════════════════
//  POST /auth/logout
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/auth/logout') {
    $auth->logout();

    jsonResponse(['ok' => true, 'data' => ['message' => 'Signed out.']]);
    return;
}

// ═══════════════════════════════════════════
//  GET /auth/session
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/auth/session') {
    $user = $_REQUEST['_user'] ?? null;

    if ($user === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'unauthorized',
            'message' => 'No active session.',
        ]], 401);
        return;
    }

    jsonResponse([
        'ok'   => true,
        'data' => [
            'user'  => $user,
            'token' => $_COOKIE['vs_session'] ?? null,
        ],
    ]);
    return;
}

// ═══════════════════════════════════════════
//  PUT /auth/profile — Update user profile
// ═══════════════════════════════════════════

if ($method === 'PUT' && $path === '/auth/profile') {
    $user = $_REQUEST['_user'] ?? null;
    if ($user === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'unauthorized',
            'message' => 'Not authenticated.',
        ]], 401);
        return;
    }

    $body = getJsonBody();

    $name = trim($body['name'] ?? '');
    $email = trim($body['email'] ?? '');

    if (empty($name) || strlen($name) < 2) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Name must be at least 2 characters.',
        ]], 422);
        return;
    }

    $emailError = Validator::email($email);
    if ($emailError !== null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => $emailError,
        ]], 422);
        return;
    }

    try {
        $auth->updateProfile((int) $user['id'], $name, $email);
        jsonResponse([
            'ok'   => true,
            'data' => [
                'message' => 'Profile updated.',
                'user'    => array_merge($user, ['name' => $name, 'email' => $email]),
            ],
        ]);
    } catch (\Throwable $e) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'update_failed',
            'message' => $e->getMessage(),
        ]], 400);
    }
    return;
}

// ═══════════════════════════════════════════
//  PUT /auth/password — Change password
// ═══════════════════════════════════════════

if ($method === 'PUT' && $path === '/auth/password') {
    $user = $_REQUEST['_user'] ?? null;
    if ($user === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'unauthorized',
            'message' => 'Not authenticated.',
        ]], 401);
        return;
    }

    $body = getJsonBody();

    $currentPassword = $body['current_password'] ?? '';
    $newPassword = $body['new_password'] ?? '';

    if (empty($currentPassword)) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Current password is required.',
        ]], 422);
        return;
    }

    if (strlen($newPassword) < 8) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'New password must be at least 8 characters.',
        ]], 422);
        return;
    }

    $result = $auth->updatePassword((int) $user['id'], $currentPassword, $newPassword);
    if (!$result) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'invalid_password',
            'message' => 'Current password is incorrect.',
        ]], 400);
        return;
    }

    jsonResponse([
        'ok'   => true,
        'data' => ['message' => 'Password updated.'],
    ]);
    return;
}

// ── Shouldn't reach here (router handles matching) ──
jsonResponse(['ok' => false, 'error' => [
    'code'    => 'not_found',
    'message' => 'Auth endpoint not found.',
]], 404);
