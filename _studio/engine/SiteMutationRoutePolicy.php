<?php

declare(strict_types=1);

namespace VoxelSite;

/** Match website concurrency to endpoint effects, independently of HTTP verbs. */
final class SiteMutationRoutePolicy
{
    private const NONE = ['lock' => false, 'recoveryGate' => false, 'releaseBeforeDispatch' => false];
    private const WRITE = ['lock' => true, 'recoveryGate' => true, 'releaseBeforeDispatch' => false];
    private const CAPTURE = ['lock' => true, 'recoveryGate' => false, 'releaseBeforeDispatch' => false];
    private const ENQUEUE = ['lock' => true, 'recoveryGate' => true, 'releaseBeforeDispatch' => true];

    /** The route is the matched table pattern, not an arbitrary request path. */
    public static function studio(string $method, string $route): array
    {
        if (!in_array($method, ['POST', 'PUT', 'DELETE'], true)) return self::NONE;

        // Archive capture must see coherent files, but must also remain available
        // to preserve a damaged website before the owner attempts recovery.
        if (($method === 'POST' && in_array($route, ['/snapshots', '/snapshots/:id/restore', '/designs'], true))
            || ($method === 'DELETE' && $route === '/snapshots/:id')) {
            return self::CAPTURE;
        }
        // A confirmed factory reset removes the entire installation, including
        // recovery records. Ordinary site reset cannot yet verify every removal.
        if ($method === 'POST' && $route === '/site/reset-install') return self::CAPTURE;

        if (str_starts_with($route, '/pages') || str_starts_with($route, '/files')
            || str_starts_with($route, '/publish') || str_starts_with($route, '/revisions')) {
            return self::WRITE;
        }
        if (in_array($route, ['/ai/prompt', '/governor/pending/:id/approve', '/assets/upload', '/assets/folder', '/assets',
            '/settings/favicon', '/designs/new', '/designs/:id/load', '/site/reset',
            '/site-control/apply', '/site-control/url-rename', '/site-control/nav-reorder',
            '/site-control/page-rename', '/site-control/page-delete', '/site-control/structural-move'], true)) {
            return self::WRITE;
        }
        // Definitions and bar settings write shared asset files. Submitted
        // records and test/tool invocation use their own data stores instead.
        if (in_array($route, ['/agentic/actions', '/agentic/actions/from-template',
            '/agentic/actions/reorder', '/agentic/actions/bar-settings',
            '/agentic/actions/:id', '/agentic/actions/:id/duplicate'], true)) {
            return self::WRITE;
        }
        return self::NONE;
    }

    public static function agent(string $method, string $route): array
    {
        if (!in_array($method, ['POST', 'PUT', 'DELETE'], true)) return self::NONE;
        // The detached worker acquires its own lock and rechecks recovery.
        // Keeping the enqueue request's preflight lock would race that worker.
        if ($method === 'POST' && $route === '/prompt') return self::ENQUEUE;
        if (in_array($route, ['/pages', '/pages/:slug', '/compile', '/publish', '/assets'], true)) return self::WRITE;
        return self::NONE;
    }
}
