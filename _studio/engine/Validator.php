<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Input validation utilities.
 *
 * Every user-submitted value must pass through validation before
 * touching the database or filesystem. This class provides reusable
 * validation methods that return clear, actionable error messages
 * following the Voice Guide: honest, specific, no jargon.
 */
class Validator
{
    /**
     * Validate an email address.
     *
     * @return string|null Error message, or null if valid
     */
    public static function email(string $email): ?string
    {
        $email = trim($email);

        if (empty($email)) {
            return 'Email is required.';
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return 'That doesn\'t look like a valid email address.';
        }

        if (strlen($email) > 254) {
            return 'Email address is too long.';
        }

        return null;
    }

    /**
     * Validate a password.
     *
     * Requires minimum 8 characters. No complexity rules — length
     * is the primary security factor, and complex rules train users
     * to write passwords on sticky notes.
     */
    public static function password(string $password): ?string
    {
        if (strlen($password) < 8) {
            return 'Password must be at least 8 characters.';
        }

        if (strlen($password) > 1000) {
            return 'Password is too long.';
        }

        return null;
    }

    /**
     * Validate a user name.
     */
    public static function name(string $name): ?string
    {
        $name = trim($name);

        if (empty($name)) {
            return 'Name is required.';
        }

        if (strlen($name) > 100) {
            return 'Name is too long (max 100 characters).';
        }

        return null;
    }

    /**
     * Validate a page slug.
     *
     * Slugs are lowercase, alphanumeric with hyphens. No leading/
     * trailing hyphens. No consecutive hyphens. 'index' is allowed
     * (it's the homepage).
     */
    public static function slug(string $slug): ?string
    {
        $slug = trim($slug);

        if (empty($slug)) {
            return 'Slug is required.';
        }

        if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
            return 'Slug can only contain lowercase letters, numbers, and hyphens.';
        }

        if (strlen($slug) > 100) {
            return 'Slug is too long (max 100 characters).';
        }

        // Reserved slugs that would conflict with system paths
        $reserved = ['_studio', 'assets', 'vendor', 'api'];
        if (in_array($slug, $reserved, true)) {
            return "'{$slug}' is a reserved name. Choose a different slug.";
        }

        return null;
    }

    /**
     * Validate a site name.
     */
    public static function siteName(string $name): ?string
    {
        $name = trim($name);

        if (empty($name)) {
            return 'Site name is required.';
        }

        if (strlen($name) > 200) {
            return 'Site name is too long (max 200 characters).';
        }

        return null;
    }

    /**
     * Validate a file path for security.
     *
     * Prevents directory traversal and writes outside allowed
     * directories. This is critical — a malicious AI response
     * could try to write to /_studio/engine/ or /etc/passwd.
     *
     * @param string   $path    The path to validate
     * @param string[] $allowed Allowed path prefixes
     */
    public static function filePath(string $path, array $allowed = []): ?string
    {
        $path = trim($path);

        if (empty($path)) {
            return 'File path is required.';
        }

        // Block directory traversal
        if (str_contains($path, '..')) {
            return 'File path cannot contain "..".';
        }

        // Block absolute paths
        if (str_starts_with($path, '/')) {
            return 'File path cannot be absolute.';
        }

        // Block writes to _studio directory
        if (str_starts_with($path, '_studio/') || str_starts_with($path, '_studio\\')) {
            return 'Cannot write files inside the _studio directory.';
        }

        // Check against allowed patterns if specified
        if (!empty($allowed)) {
            $matchesAllowed = false;
            foreach ($allowed as $prefix) {
                if (str_starts_with($path, $prefix) || preg_match($prefix, $path)) {
                    $matchesAllowed = true;
                    break;
                }
            }
            if (!$matchesAllowed) {
                return "File path '{$path}' is not in an allowed location.";
            }
        }

        return null;
    }

    /**
     * Validate an API key format (basic check).
     */
    public static function apiKey(string $key, string $provider = 'claude'): ?string
    {
        $key = trim($key);

        // OpenAI Compatible doesn't require a key (local servers)
        if ($provider === 'openai_compatible') {
            return null;
        }

        if (empty($key)) {
            return 'API key is required.';
        }

        if ($provider === 'claude') {
            if (!str_starts_with($key, 'sk-ant-')) {
                return 'Claude API keys start with "sk-ant-". Check that you copied the full key from console.anthropic.com.';
            }

            if (strlen($key) < 40) {
                return 'That key looks too short. Make sure you copied the entire key.';
            }
        }

        if ($provider === 'openai') {
            if (!str_starts_with($key, 'sk-')) {
                return 'OpenAI API keys start with "sk-". Check that you copied the full key from platform.openai.com.';
            }
        }

        if ($provider === 'gemini') {
            if (!str_starts_with($key, 'AIza')) {
                return 'Gemini API keys start with "AIza". Get one from aistudio.google.com/apikey.';
            }
        }

        return null;
    }

    /**
     * Validate required fields in a data array.
     *
     * Returns the first error found, or null if all pass.
     *
     * @param array<string, mixed> $data     The input data
     * @param string[]             $required Keys that must be non-empty
     */
    public static function required(array $data, array $required): ?string
    {
        foreach ($required as $field) {
            if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
                $label = str_replace('_', ' ', $field);
                return ucfirst($label) . ' is required.';
            }
        }

        return null;
    }
}
