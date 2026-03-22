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
                'body'       => "Studioform was founded in 2019 with a simple belief: every brand deserves design that feels intentional.\n\nWe're a small team — three designers and a strategist — working from a converted warehouse in East London. Our work spans brand identity, digital design, and creative direction.\n\nWhat we stand for:\n- Clarity over cleverness\n- Restraint as a design tool\n- Long-term partnerships, not one-off projects\n\nDraft this as a warm, confident narrative. Not corporate. Think: the kind of studio you'd want to have coffee with.",
                'pinned'     => 1,
                'created_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 5),
                'updated_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 3600 * 4),
                'deleted_at' => null,
            ],
            [
                'id'         => 2,
                'user_id'    => 0,
                'title'      => 'Portfolio approach',
                'body'       => "# How we want to present work\n\nThis note uses **markdown**. Click the *eye icon* in the toolbar above to preview it rendered.\n\nDon't list projects chronologically. Group by *type of thinking*:\n\n1. **Brand systems** — Lumen, Maison Verte (full identity + digital)\n2. **Digital products** — Atlas Architecture, Ember & Oak (website-focused)\n3. **Creative direction** — Ferrum Studio (art direction + photography)\n\nEach case study should have:\n- One hero image (full-bleed)\n- 2-3 sentence project brief\n- 3-4 detail shots\n- One client quote\n\n> Keep the writing short. Let the work speak.",
                'pinned'     => 1,
                'created_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 3),
                'updated_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 3600 * 8),
                'deleted_at' => null,
            ],
            [
                'id'         => 3,
                'user_id'    => 0,
                'title'      => 'Social content ideas',
                'body'       => "Instagram themes to try this month:\n\nProcess shots — show sketches, moodboards, early wireframes\nStudio life — the coffee, the light, the mess\nBefore/after — side-by-side of client brand evolution\nTypography close-ups — details people don't usually see\n\nPosting cadence: 3x/week. Stories daily.",
                'pinned'     => 0,
                'created_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 2),
                'updated_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 1),
                'deleted_at' => null,
            ],
            [
                'id'         => 4,
                'user_id'    => 0,
                'title'      => 'Client testimonials',
                'body'       => "Quotes to feature on the site:\n\n\"Studioform didn't just design our brand — they helped us understand what we actually stand for.\"\n— Sarah Chen, Atlas Architecture\n\n\"The restraint in their work is what makes it powerful. Nothing extra, nothing missing.\"\n— James Whitfield, Lumen\n\n\"Working with them felt like a conversation, not a transaction. Three years in and we still call them first.\"\n— Ana Petrova, Maison Verte\n\nNeed to ask Marcus if he's okay being quoted too.",
                'pinned'     => 0,
                'created_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 1),
                'updated_at' => gmdate('Y-m-d\TH:i:s\Z', $now - 3600 * 2),
                'deleted_at' => null,
            ],
        ];
    }

    /**
     * Demo cards for the /cards endpoint (Board / Kanban).
     *
     * 6 cards across 3 columns: 2 To Do, 2 In Progress, 2 Done.
     * References real demo pages for linked_page fields.
     * Matches the shape returned by CardManager::listActive().
     *
     * @return array<int, array>
     */
    public static function cards(): array
    {
        $now = time();

        return [
            // ── To Do ──
            [
                'id'                 => 1,
                'title'              => 'Rewrite services page copy',
                'body'               => "The current services copy is too vague.\nNeed to be specific about deliverables:\n- Brand identity packages\n- Website design & build\n- Creative direction retainers\n\nCheck the client testimonials note for tone reference.",
                'column_name'        => 'todo',
                'position'           => 11000,
                'linked_page'        => 'services',
                'archived'           => 0,
                'created_by_user_id' => 0,
                'updated_by_user_id' => 0,
                'source_note_id'     => null,
                'created_at'         => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 3),
                'updated_at'         => gmdate('Y-m-d\TH:i:s\Z', $now - 3600 * 6),
            ],
            [
                'id'                 => 2,
                'title'              => 'Add portfolio case studies',
                'body'               => "Need 3 case studies for the work page:\n1. Lumen — full brand identity\n2. Atlas Architecture — website redesign\n3. Maison Verte — creative direction\n\nEach needs: hero image, brief, 3-4 detail shots, client quote.",
                'column_name'        => 'todo',
                'position'           => 12000,
                'linked_page'        => 'portfolio',
                'archived'           => 0,
                'created_by_user_id' => 0,
                'updated_by_user_id' => 1,
                'source_note_id'     => 2, // Promoted from "Portfolio approach" note
                'created_at'         => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 2),
                'updated_at'         => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 1),
            ],
            // ── In Progress ──
            [
                'id'                 => 3,
                'title'              => 'Update contact form fields',
                'body'               => "Add a project budget range selector and a preferred timeline field.\n\nKeep it simple — 5 fields max. Don't scare people away.",
                'column_name'        => 'in_progress',
                'position'           => 11000,
                'linked_page'        => 'contact',
                'archived'           => 0,
                'created_by_user_id' => 1,
                'updated_by_user_id' => 1,
                'source_note_id'     => null,
                'created_at'         => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 4),
                'updated_at'         => gmdate('Y-m-d\TH:i:s\Z', $now - 3600 * 2),
            ],
            [
                'id'                 => 4,
                'title'              => 'Studio page photography',
                'body'               => "Book photographer for studio shots.\nNeed: workspace, team at work, detail shots of materials.\n\nBudget: discuss with Lena.",
                'column_name'        => 'in_progress',
                'position'           => 12000,
                'linked_page'        => 'about',
                'archived'           => 0,
                'created_by_user_id' => 0,
                'updated_by_user_id' => 0,
                'source_note_id'     => null,
                'created_at'         => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 6),
                'updated_at'         => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 1),
            ],
            // ── Done ──
            [
                'id'                 => 5,
                'title'              => 'Set up navigation structure',
                'body'               => "Main nav: Home, Work, Services, Studio, Contact.\nFooter: same + social links.\n\nDone — live on all pages.",
                'column_name'        => 'done',
                'position'           => 11000,
                'linked_page'        => null,
                'archived'           => 0,
                'created_by_user_id' => 0,
                'updated_by_user_id' => 0,
                'source_note_id'     => null,
                'created_at'         => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 10),
                'updated_at'         => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 7),
            ],
            [
                'id'                 => 6,
                'title'              => 'Homepage hero section',
                'body'               => "Designed and built the hero with animated gradient.\nTagline: \"Design that feels intentional.\"\n\nClient approved — shipped.",
                'column_name'        => 'done',
                'position'           => 12000,
                'linked_page'        => 'index',
                'archived'           => 0,
                'created_by_user_id' => 0,
                'updated_by_user_id' => 1,
                'source_note_id'     => null,
                'created_at'         => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 12),
                'updated_at'         => gmdate('Y-m-d\TH:i:s\Z', $now - 86400 * 8),
            ],
        ];
    }
}
