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
        // Shared mutation services acquire the owning operation's lock.
        // A generic lock here would reject its retained continuation.
        if (($method === 'POST' && in_array($route, ['/publish', '/publish/rollback', '/publish/unpublish',
                '/revisions/undo', '/revisions/redo', '/designs', '/designs/new', '/designs/:id/load',
                '/assets/upload', '/assets/folder', '/snapshots/capture', '/snapshots/:id/prepare-restore',
                '/snapshots/:id/apply-restore','/site/reset','/site/reset/prepare','/site/reset/continue','/site/reset/recover'], true))
            || (in_array($method, ['PUT', 'DELETE'], true) && $route === '/designs/:id')
            || ($method === 'PUT' && $route === '/assets/meta')
            || ($method === 'DELETE' && $route === '/assets')
            || (in_array($method, ['PUT', 'DELETE'], true) && $route === '/settings/prompts/content')) return self::NONE;

        // All archive aliases use retained shared operations and acquire their own lock.
        if (($method === 'POST' && in_array($route, ['/snapshots', '/snapshots/:id/restore'], true))
            || ($method === 'DELETE' && $route === '/snapshots/:id')) return self::NONE;
        // A confirmed factory reset removes the entire installation, including
        // recovery records. Ordinary site reset cannot yet verify every removal.
        // Installation cleanup owns its exact inventory and independent final receipt.
        if ($method === 'POST' && in_array($route, ['/site/reset-install', '/site/reset-install/prepare', '/site/reset-install/discard'], true)) return self::NONE;

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
        if (($method === 'POST' && $route === '/publish') || $route === '/assets') return self::NONE;
        // The detached worker acquires its own lock and rechecks recovery.
        // Keeping the enqueue request's preflight lock would race that worker.
        if ($method === 'POST' && $route === '/prompt') return self::ENQUEUE;
        if (in_array($route, ['/pages', '/pages/:slug', '/compile', '/publish', '/assets'], true)) return self::WRITE;
        return self::NONE;
    }
}
