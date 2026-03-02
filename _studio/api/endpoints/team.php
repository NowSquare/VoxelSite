<?php

declare(strict_types=1);

/**
 * Team API Endpoints — Owner-only team member management.
 *
 * GET    /team           — List all team members
 * POST   /team           — Add a team member
 * PUT    /team/:id       — Update a team member
 * DELETE /team/:id       — Remove a team member
 * POST   /team/:id/password — Reset a team member's password
 *
 * All endpoints require owner role. Editors and viewers get 403.
 */

use VoxelSite\Auth;
use VoxelSite\Validator;
use VoxelSite\Logger;

$user = $_REQUEST['_user'] ?? null;
$params = $_REQUEST['_route_params'] ?? [];

// ── Owner-only guard ──
// Team management is restricted to the owner. Editors and viewers
// can't see or modify team members.
if ($user['role'] !== 'owner') {
    jsonResponse(['ok' => false, 'error' => [
        'code'    => 'forbidden',
        'message' => 'Team management requires owner access.',
    ]], 403);
    return;
}

$auth = new Auth();


// ═══════════════════════════════════════════
//  GET /team — List all team members
// ═══════════════════════════════════════════

if ($method === 'GET' && $path === '/team') {
    $users = $auth->listUsers();

    jsonResponse([
        'ok'   => true,
        'data' => ['members' => $users],
    ]);
    return;
}


// ═══════════════════════════════════════════
//  POST /team — Add a team member
// ═══════════════════════════════════════════

if ($method === 'POST' && $path === '/team') {
    $body = getJsonBody();

    // Validate required fields
    $name = trim($body['name'] ?? '');
    $email = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';
    $role = $body['role'] ?? 'editor';

    if (strlen($name) < 2) {
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

    if (strlen($password) < 8) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Password must be at least 8 characters.',
        ]], 422);
        return;
    }

    // Only allow editor or viewer roles
    if (!in_array($role, ['editor', 'viewer'], true)) {
        $role = 'editor';
    }

    try {
        $newId = $auth->createUser($name, $email, $password, $role);
        $newUser = $auth->getUser($newId);

        Logger::info('api', 'Team member created', [
            'new_user_id' => $newId,
            'role'        => $role,
            'created_by'  => $user['id'],
        ]);

        jsonResponse([
            'ok'   => true,
            'data' => ['member' => $newUser],
        ], 201);
    } catch (\Throwable $e) {
        $message = 'Failed to create team member.';
        if (str_contains($e->getMessage(), 'UNIQUE constraint failed')) {
            $message = 'A user with this email already exists.';
        }

        Logger::error('api', 'Team member creation failed', [
            'exception' => $e->getMessage(),
            'email'     => $email,
        ]);

        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'create_failed',
            'message' => $message,
        ]], 400);
    }
    return;
}


// ═══════════════════════════════════════════
//  PUT /team/:id — Update a team member
// ═══════════════════════════════════════════

if ($method === 'PUT' && isset($params['id'])) {
    $memberId = (int) $params['id'];
    $body = getJsonBody();

    $updates = [];

    if (isset($body['name'])) {
        $name = trim($body['name']);
        if (strlen($name) < 2) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'validation',
                'message' => 'Name must be at least 2 characters.',
            ]], 422);
            return;
        }
        $updates['name'] = $name;
    }

    if (isset($body['email'])) {
        $emailError = Validator::email($body['email']);
        if ($emailError !== null) {
            jsonResponse(['ok' => false, 'error' => [
                'code'    => 'validation',
                'message' => $emailError,
            ]], 422);
            return;
        }
        $updates['email'] = $body['email'];
    }

    if (isset($body['role'])) {
        $updates['role'] = $body['role'];
    }

    $result = $auth->updateUser($memberId, $updates);

    if (!$result['ok']) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'update_failed',
            'message' => $result['error'],
        ]], 400);
        return;
    }

    $updatedUser = $auth->getUser($memberId);

    Logger::info('api', 'Team member updated', [
        'member_id'  => $memberId,
        'updates'    => array_keys($updates),
        'updated_by' => $user['id'],
    ]);

    jsonResponse([
        'ok'   => true,
        'data' => ['member' => $updatedUser],
    ]);
    return;
}


// ═══════════════════════════════════════════
//  DELETE /team/:id — Remove a team member
// ═══════════════════════════════════════════

if ($method === 'DELETE' && isset($params['id'])) {
    $memberId = (int) $params['id'];

    $result = $auth->deleteUser($memberId);

    if (!$result['ok']) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'delete_failed',
            'message' => $result['error'],
        ]], 400);
        return;
    }

    Logger::info('api', 'Team member deleted', [
        'member_id'  => $memberId,
        'deleted_by' => $user['id'],
    ]);

    jsonResponse(['ok' => true, 'data' => ['deleted' => true]]);
    return;
}


// ═══════════════════════════════════════════
//  POST /team/:id/password — Reset member password
// ═══════════════════════════════════════════

if ($method === 'POST' && isset($params['id']) && str_ends_with($path, '/password')) {
    $memberId = (int) $params['id'];
    $body = getJsonBody();
    $newPassword = $body['password'] ?? '';

    if (strlen($newPassword) < 8) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'validation',
            'message' => 'Password must be at least 8 characters.',
        ]], 422);
        return;
    }

    // Can't reset the owner's password through the team API
    $member = $auth->getUser($memberId);
    if ($member === null) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'not_found',
            'message' => 'User not found.',
        ]], 404);
        return;
    }

    if ($member['role'] === 'owner') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'forbidden',
            'message' => 'Use Edit Profile to change the owner password.',
        ]], 403);
        return;
    }

    $success = $auth->setPassword($memberId, $newPassword);

    if (!$success) {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'reset_failed',
            'message' => 'Failed to reset password.',
        ]], 400);
        return;
    }

    Logger::info('api', 'Team member password reset', [
        'member_id' => $memberId,
        'reset_by'  => $user['id'],
    ]);

    jsonResponse(['ok' => true, 'data' => ['message' => 'Password updated.']]);
    return;
}
