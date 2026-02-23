<?php

/**
 * Custom Valet Driver for VoxelSite.
 *
 * Laravel Herd uses Valet under the hood. This driver tells Valet
 * how to route VoxelSite's URLs:
 *
 * - /_studio/api/*  → _studio/api/router.php
 * - /_studio/install.php → serve directly
 * - /_studio/ui/*   → serve static files
 * - /_studio/*      → _studio/index.php (SPA)
 * - /*              → serve static files or index.php (clean URLs)
 *
 * This file is development-only. On production (Apache shared hosting),
 * the .htaccess files handle the same routing.
 */

class LocalValetDriver extends \Valet\Drivers\BasicValetDriver
{
    /**
     * Determine if this driver should serve the request.
     */
    public function serves(string $sitePath, string $siteName, string $uri): bool
    {
        // This driver serves any site that has a _studio directory
        return is_dir($sitePath . '/_studio');
    }

    /**
     * Determine if the incoming request is for a static file.
     */
    public function isStaticFile(string $sitePath, string $siteName, string $uri): string|false
    {
        // Serve static UI assets directly (studio CSS, JS, fonts)
        if (preg_match('#^/_studio/ui/#', $uri)) {
            $filePath = $sitePath . $uri;
            if (is_file($filePath)) {
                return $filePath;
            }
        }

        // Serve preview static files (non-PHP assets referenced by preview pages)
        // PHP files go through the preview endpoint for rendering + hot-reload injection
        if (preg_match('#^/_studio/preview/.+\.(css|js|json|svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|otf)$#i', $uri)) {
            $filePath = $sitePath . $uri;
            if (is_file($filePath)) {
                return $filePath;
            }
        }

        // Serve root static files (CSS, JS, images for the generated website)
        if (preg_match('#^/assets/#', $uri)) {
            $filePath = $sitePath . $uri;
            if (is_file($filePath)) {
                return $filePath;
            }
        }

        // Serve root static files (not PHP, not in _studio/ or assets/)
        if (!str_starts_with($uri, '/_studio/') && !str_starts_with($uri, '/assets/')) {
            $filePath = $sitePath . $uri;
            if (is_file($filePath)) {
                return $filePath;
            }
        }

        return false;
    }

    /**
     * Get the fully resolved path to the application's front controller.
     */
    public function frontControllerPath(string $sitePath, string $siteName, string $uri): ?string
    {
        // Ensure DOCUMENT_ROOT is set — Valet/Herd may leave it empty,
        // which breaks AI-generated code using $_SERVER['DOCUMENT_ROOT'].
        $_SERVER['DOCUMENT_ROOT'] = $sitePath;

        // API routes → router.php
        if (preg_match('#^/_studio/api/#', $uri)) {
            // Set REQUEST_URI so the router can parse the path
            $_SERVER['REQUEST_URI'] = $uri;
            return $sitePath . '/_studio/api/router.php';
        }

        // Install page
        if ($uri === '/_studio/install.php' || $uri === '/_studio/install') {
            return $sitePath . '/_studio/install.php';
        }

        // Studio SPA (any /_studio/* route that isn't a static file or API)
        if (str_starts_with($uri, '/_studio/') || $uri === '/_studio') {
            return $sitePath . '/_studio/index.php';
        }

        // Root website: / → index.php or default placeholder
        if ($uri === '/' || $uri === '') {
            if (is_file($sitePath . '/index.php')) {
                return $sitePath . '/index.php';
            }
            // No published site yet — show the pre-install placeholder
            return $sitePath . '/_studio/data/default-index.php';
        }

        // Shipped PHP endpoints — serve directly when requested by exact path
        // (submit.php for forms, mcp.php for AI tool integration)
        if ($uri === '/submit.php') {
            return $sitePath . '/submit.php';
        }
        if ($uri === '/mcp.php') {
            return $sitePath . '/mcp.php';
        }

        // Clean URLs: /about → about.php or about.html
        $cleanPath = ltrim($uri, '/');
        if ($cleanPath) {
            // First try the exact path (handles URIs that already include .php)
            if (is_file($sitePath . '/' . $cleanPath)) {
                return $sitePath . '/' . $cleanPath;
            }
            if (is_file($sitePath . '/' . $cleanPath . '.php')) {
                return $sitePath . '/' . $cleanPath . '.php';
            }
            if (is_file($sitePath . '/' . $cleanPath . '.html')) {
                return $sitePath . '/' . $cleanPath . '.html';
            }
        }

        // Fallback — serve homepage or pre-install placeholder
        if (is_file($sitePath . '/index.php')) {
            return $sitePath . '/index.php';
        }
        return $sitePath . '/_studio/data/default-index.php';
    }
}
