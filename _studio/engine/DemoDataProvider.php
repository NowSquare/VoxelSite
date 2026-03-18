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

    /**
     * Demo notes for the /notes endpoint.
     *
     * 4 believable notes for the Studioform persona — two pinned
     * (brand copy and portfolio approach), two unpinned (social
     * strategy and client testimonials). Matches the shape returned
     * by NoteManager::listForUser().
     *
     * @return array<int, array>
     */
    public static function notes(): array
    {
        $now = time();

        return [
            [
                'id'         => 1,
                'user_id'    => 0,
                'title'      => 'About page copy',
                'body'       => "Studioform was founded in 2019 with a simple belief: every brand deserves design that feels intentional.\n\nWe're a small team — three designers and a strategist — working from a converted warehouse in East London. Our work spans brand identity, digital design, and creative direction.\n\n**What we stand for:**\n- Clarity over cleverness\n- Restraint as a design tool\n- Long-term partnerships, not one-off projects\n\nDraft this as a warm, confident narrative. Not corporate. Think: the kind of studio you'd want to have coffee with.",
                'pinned'     => 1,
                'created_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 5),
                'updated_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 3600 * 4),
                'deleted_at' => null,
            ],
            [
                'id'         => 2,
                'user_id'    => 0,
                'title'      => 'Portfolio approach',
                'body'       => "# How we want to present work\n\nDon't list projects chronologically. Group by *type of thinking*:\n\n1. **Brand systems** — Lumen, Maison Verte (full identity + digital)\n2. **Digital products** — Atlas Architecture, Ember & Oak (website-focused)\n3. **Creative direction** — Ferrum Studio (art direction + photography)\n\nEach case study should have:\n- One hero image (full-bleed)\n- 2-3 sentence project brief\n- 3-4 detail shots\n- One client quote\n\nKeep the writing short. Let the work speak.",
                'pinned'     => 1,
                'created_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 3),
                'updated_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 3600 * 8),
                'deleted_at' => null,
            ],
            [
                'id'         => 3,
                'user_id'    => 0,
                'title'      => 'Social content ideas',
                'body'       => "Instagram themes to try this month:\n\n- **Process shots** — show sketches, moodboards, early wireframes\n- **Studio life** — the coffee, the light, the mess\n- **Before/after** — side-by-side of client brand evolution\n- **Typography close-ups** — details people don't usually see\n\nPosting cadence: 3x/week. Stories daily.\n\nHashtags: #designstudio #brandidentity #portfoliodesign #studiolife",
                'pinned'     => 0,
                'created_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 2),
                'updated_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 1),
                'deleted_at' => null,
            ],
            [
                'id'         => 4,
                'user_id'    => 0,
                'title'      => 'Client testimonials',
                'body'       => "Quotes to feature on the site:\n\n> \"Studioform didn't just design our brand — they helped us understand what we actually stand for.\"\n> — Sarah Chen, Atlas Architecture\n\n> \"The restraint in their work is what makes it powerful. Nothing extra, nothing missing.\"\n> — James Whitfield, Lumen\n\n> \"Working with them felt like a conversation, not a transaction. Three years in and we still call them first.\"\n> — Ana Petrova, Maison Verte\n\nNeed to ask Marcus if he's okay being quoted too.",
                'pinned'     => 0,
                'created_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 1),
                'updated_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 3600 * 2),
                'deleted_at' => null,
            ],
        ];
    }
}
