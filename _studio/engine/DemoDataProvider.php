<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Shared Demo Data Provider.
 *
 * Single source of truth for demo fixture data that appears in
 * multiple places within demo-handler.php. Eliminates hardcoded
 * values and ensures consistency across list, detail, and session
 * endpoints.
 *
 * Usage:
 *   $siteName = DemoDataProvider::siteName();
 *   $team     = DemoDataProvider::team();
 */
class DemoDataProvider
{
    /**
     * The demo site name shown in the top bar, session, and settings.
     */
    public static function siteName(): string
    {
        return 'Studioform';
    }

    /**
     * Demo team members for the /team endpoint.
     *
     * Returns the owner + 2 sample members with rebased timestamps.
     * Matches the shape returned by GET /team in team.php.
     *
     * @return array{members: array<int, array>}
     */
    public static function team(): array
    {
        $now = gmdate('Y-m-d\TH:i:s\Z');

        return [
            'members' => [
                [
                    'id'            => 0,
                    'name'          => 'Demo User',
                    'email'         => 'demo@example.com',
                    'role'          => 'owner',
                    'created_at'    => $now,
                    'last_login_at' => $now,
                ],
                [
                    'id'            => 1,
                    'name'          => 'Lena Voss',
                    'email'         => 'lena@example.com',
                    'role'          => 'editor',
                    'created_at'    => gmdate('Y-m-d\TH:i:s\Z', time() - 86400 * 14),
                    'last_login_at' => gmdate('Y-m-d\TH:i:s\Z', time() - 3600 * 3),
                ],
                [
                    'id'            => 2,
                    'name'          => 'Marcus Chen',
                    'email'         => 'marcus@example.com',
                    'role'          => 'viewer',
                    'created_at'    => gmdate('Y-m-d\TH:i:s\Z', time() - 86400 * 7),
                    'last_login_at' => gmdate('Y-m-d\TH:i:s\Z', time() - 3600 * 8),
                ],
            ],
        ];
    }
}
