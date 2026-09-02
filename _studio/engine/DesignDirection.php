<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Design Direction — engineered variety for new sites.
 *
 * A language model cannot act randomly. Asked for "a unique design" it
 * returns its most probable design, which is the same design every time:
 * a serif display face over Inter, a gold accent, a centered hero. The
 * saved designs in this repository show exactly that convergence.
 *
 * This class supplies the randomness from outside the model. Before a new
 * site is generated it draws one option per design axis (hero archetype,
 * typographic family, palette, accent hue, layout grammar, corner radius,
 * motion tempo) plus one signature device, and renders the result as a
 * short context block the model treats as the client's brief.
 *
 * Why a structured draw rather than a raw random string: a frontier model
 * can turn hex noise into a coherent creative decision, a 20B local model
 * cannot. Every option below is a concrete instruction any model can act
 * on, and every option is achievable with Tailwind utilities, Google Fonts
 * and the shipped image library. None of them are effects that read as
 * machine-made (gradients, glows, floating shapes).
 *
 * The draw never overrides the user. The rendered block says so, and the
 * constraints below remove options that conflict with the wizard's style
 * card or with `rejected_direction_*` / `design_preference_*` entries in
 * Site Memory.
 *
 * Provider-agnostic by construction: plain text in the user message, no
 * tools, no sampling parameters. Used by PromptEngine for `create_site`
 * and for `free_prompt` on a site with no pages yet.
 */
final class DesignDirection
{
    /** Wizard style card id → axis constraints. Card wins over memory. */
    private const CARD_RULES = [
        'modern_minimal' => [
            'deny'    => ['two-hues', 'bright', 'motion-confident', 'motion-cinematic', 'radius-lg', 'pill', 'condensed'],
            'require' => [],
        ],
        'bold_vibrant' => [
            'deny'    => ['monochrome', 'ink-only', 'motion-hover', 'motion-cinematic', 'serif-high-contrast', 'serif-transitional'],
            'require' => [],
        ],
        'elegant_classic' => [
            'deny'    => ['two-hues', 'bright', 'grotesque', 'geometric', 'condensed', 'mono-accent', 'radius-lg', 'pill', 'motion-confident'],
            'require' => ['type' => 'serif'],
        ],
        'playful_creative' => [
            'deny'    => ['radius-0', 'serif-high-contrast', 'serif-transitional', 'monochrome', 'ink-only', 'motion-hover', 'motion-cinematic'],
            'require' => ['radius' => 'round'],
        ],
        'dark_premium' => [
            'deny'    => ['pill', 'two-hues'],
            'require' => ['palette' => 'dark'],
        ],
    ];

    /**
     * Words found in a rejected direction (key or value) → tags to remove.
     * Order matters: "sans" is checked before "serif" so that a rejected
     * "sans-serif" does not remove the serif options.
     */
    private const REJECT_WORDS = [
        'sans'        => ['sans'],
        'serif'       => ['serif'],
        'dark'        => ['dark'],
        'light'       => ['light', 'ink-only'],
        'white'       => ['light', 'ink-only'],
        'animation'   => ['motion-confident', 'motion-cinematic', 'motion'],
        'motion'      => ['motion-confident', 'motion-cinematic', 'motion'],
        'reveal'      => ['motion-confident', 'motion-cinematic', 'motion'],
        'round'       => ['round', 'pill', 'radius-lg'],
        'pill'        => ['pill'],
        'sharp'       => ['radius-0', 'sharp'],
        'square'      => ['radius-0', 'sharp'],
        'bold'        => ['two-hues', 'bright', 'display-heavy'],
        'loud'        => ['two-hues', 'bright'],
        'bright'      => ['two-hues', 'bright'],
        'vibrant'     => ['two-hues', 'bright'],
        'colourful'   => ['two-hues', 'bright'],
        'colorful'    => ['two-hues', 'bright'],
        'neon'        => ['two-hues', 'bright', 'chartreuse'],
        'monochrome'  => ['monochrome'],
        'mono'        => ['monochrome', 'mono-accent'],
        'grey'        => ['monochrome', 'charcoal'],
        'gray'        => ['monochrome', 'charcoal'],
        'photo'       => ['photo'],
        'image'       => ['photo'],
        'picture'     => ['photo'],
        'stock'       => ['photo'],
        'condensed'   => ['condensed'],
        'geometric'   => ['geometric'],
        'typograph'   => ['typographic'],
        'marquee'     => ['motion'],
        // Accent hues
        'terracotta'  => ['terracotta'], 'brick' => ['terracotta'],
        'ochre'       => ['ochre'], 'mustard' => ['ochre'], 'gold' => ['ochre'], 'yellow' => ['ochre'],
        'olive'       => ['olive'], 'sage' => ['olive'],
        'green'       => ['green'],
        'teal'        => ['teal'], 'petrol' => ['teal'],
        'blue'        => ['blue'],
        'cobalt'      => ['cobalt'], 'indigo' => ['cobalt'],
        'plum'        => ['plum'], 'burgundy' => ['plum'], 'purple' => ['plum'],
        'coral'       => ['coral'], 'salmon' => ['coral'], 'pink' => ['coral'],
        'orange'      => ['rust', 'coral'], 'rust' => ['rust'],
        'forest'      => ['moss'],
        'lime'        => ['chartreuse'], 'chartreuse' => ['chartreuse'],
        'charcoal'    => ['charcoal'],
    ];

    /** Words found in a stated preference → axis requirement. */
    private const PREFER_WORDS = [
        'dark'  => ['palette' => 'dark'],
        'light' => ['palette' => 'light'],
        'sans'  => ['type' => 'sans'],
        'serif' => ['type' => 'serif'],
    ];

    /**
     * Draw a direction.
     *
     * @param array{style?: string, memory?: array<string, mixed>} $constraints
     *   style:  create_site wizard card id (may be empty)
     *   memory: decoded assets/data/memory.json (may be empty)
     *
     * @return array{seed: string, ids: array<string, string>, choices: array<string, string>, rendered: string}
     */
    public static function draw(array $constraints = []): array
    {
        $deny    = [];
        $require = [];

        $style = (string) ($constraints['style'] ?? '');
        if ($style !== '' && isset(self::CARD_RULES[$style])) {
            $deny    = self::CARD_RULES[$style]['deny'];
            $require = self::CARD_RULES[$style]['require'];
        }

        [$memDeny, $memRequire, $brandColor] = self::constraintsFromMemory($constraints['memory'] ?? []);
        $deny    = array_values(array_unique(array_merge($deny, $memDeny)));
        $require = $require + $memRequire; // an explicit card choice outranks a remembered preference

        $picked = [];
        foreach (self::axes() as $axis => $options) {
            $pool = self::filter($options, $deny, $require[$axis] ?? null);
            $picked[$axis] = $pool[random_int(0, count($pool) - 1)];
        }

        // Motion and the marquee device disagree: no marquee on a near-static page.
        if ($picked['motion']['id'] === 'hover' && in_array('motion', $picked['signature']['tags'], true)) {
            $pool = self::filter(self::axes()['signature'], array_merge($deny, ['motion']), null);
            $picked['signature'] = $pool[random_int(0, count($pool) - 1)];
        }

        $examples = $picked['type']['examples'];
        $pairing  = $examples[random_int(0, count($examples) - 1)];

        $seed = bin2hex(random_bytes(3));

        $choices = [
            'hero'      => $picked['hero']['text'],
            'type'      => $picked['type']['text'],
            'pairing'   => $pairing[0] === $pairing[1]
                ? "{$pairing[0]} for everything"
                : "{$pairing[0]} for headings, {$pairing[1]} for body",
            'palette'   => $picked['palette']['text'],
            'accent'    => self::accentText($picked['palette']['id'], $picked['accent']['text'], $brandColor),
            'layout'    => $picked['layout']['text'],
            'radius'    => $picked['radius']['text'],
            'motion'    => $picked['motion']['text'],
            'signature' => $picked['signature']['text'],
        ];

        $ids = array_map(static fn(array $o): string => $o['id'], $picked);

        return [
            'seed'     => $seed,
            'ids'      => $ids,
            'choices'  => $choices,
            'rendered' => self::render($seed, $choices),
        ];
    }

    /**
     * Render the context block. Kept short (~150 tokens): it sits directly
     * before the user's request in the final user message, which is the
     * most salient position in the prompt.
     *
     * @param array<string, string> $choices
     */
    public static function render(string $seed, array $choices): string
    {
        $lines = [];
        $lines[] = "=== DESIGN DIRECTION (drawn for this build, seed {$seed}) ===";
        $lines[] = "Treat this as the client's brief. The user's own words, the style they chose and any rejected_direction_* entry in SITE MEMORY override it; it fills the gaps they left open. Commit to it fully. Record how you applied it in design-intelligence.json under the key \"direction\" and include the seed.";
        $lines[] = '';
        $lines[] = "Hero: {$choices['hero']}";
        $lines[] = "Type: {$choices['type']} Suggested pairing: {$choices['pairing']} (Google Fonts; a close equivalent is fine).";
        $lines[] = "Palette: {$choices['palette']}";
        $lines[] = "Accent hue: {$choices['accent']}";
        $lines[] = "Layout: {$choices['layout']}";
        $lines[] = "Corners: {$choices['radius']}";
        $lines[] = "Motion: {$choices['motion']}";
        $lines[] = "Signature move: {$choices['signature']}";

        return implode("\n", $lines);
    }

    // ─── Axes ────────────────────────────────────────────────────────

    /**
     * @return array<string, list<array{id: string, text: string, tags: list<string>, examples?: list<array{0: string, 1: string}>}>>
     */
    public static function axes(): array
    {
        return [
            'hero' => [
                ['id' => 'typographic', 'tags' => ['typographic', 'no-image'],
                 'text' => 'All typography. No image above the fold: one very large headline, one line of body text, one action. The type is the picture.'],
                ['id' => 'full-bleed-photo', 'tags' => ['photo'],
                 'text' => 'One full-bleed photograph from the library with a plain color overlay and the headline set inside it. Nothing else competes.'],
                ['id' => 'split', 'tags' => ['photo', 'split'],
                 'text' => 'A 50/50 split: text on one side, one image on the other, the seam running the full height of the viewport.'],
                ['id' => 'asymmetric', 'tags' => ['photo', 'asymmetric'],
                 'text' => 'Asymmetric: the headline in a narrow column on the left, a tall image pushed to the right edge and cropped by the viewport.'],
                ['id' => 'statement-then-image', 'tags' => ['photo', 'stacked'],
                 'text' => 'A single statement line across the full width, then the image just below the fold as the first thing you scroll into.'],
                ['id' => 'editorial-kicker', 'tags' => ['typographic', 'editorial'],
                 'text' => 'Editorial: a small kicker line, one huge headline in a single column, generous margins, the first section starting immediately below.'],
            ],
            'type' => [
                ['id' => 'serif-display-sans-body', 'tags' => ['serif', 'serif-high-contrast'],
                 'text' => 'A high-contrast serif for display, a humanist sans for body.',
                 'examples' => [['Fraunces', 'Work Sans'], ['Playfair Display', 'Source Sans 3'], ['DM Serif Display', 'Nunito Sans'], ['Bodoni Moda', 'Karla'], ['Cormorant Garamond', 'PT Sans']]],
                ['id' => 'grotesque-heavy', 'tags' => ['sans', 'grotesque', 'display-heavy'],
                 'text' => 'One grotesque family throughout: heavy weight for display, regular for body, tight tracking on headlines.',
                 'examples' => [['Space Grotesk', 'Space Grotesk'], ['Archivo', 'Archivo'], ['Manrope', 'Manrope'], ['Schibsted Grotesk', 'Schibsted Grotesk'], ['Inter Tight', 'Inter Tight']]],
                ['id' => 'geometric', 'tags' => ['sans', 'geometric'],
                 'text' => 'A geometric sans throughout, medium weights, wide tracking on small uppercase labels.',
                 'examples' => [['Outfit', 'Outfit'], ['Jost', 'Jost'], ['Urbanist', 'Urbanist'], ['Sora', 'Sora'], ['Figtree', 'Figtree']]],
                ['id' => 'transitional-serif', 'tags' => ['serif', 'serif-transitional'],
                 'text' => 'A transitional serif for everything, italics for emphasis, no sans at all.',
                 'examples' => [['Libre Baskerville', 'Libre Baskerville'], ['Source Serif 4', 'Source Serif 4'], ['Crimson Pro', 'Crimson Pro'], ['Newsreader', 'Newsreader'], ['Literata', 'Literata']]],
                ['id' => 'condensed-display', 'tags' => ['sans', 'condensed', 'display-heavy'],
                 'text' => 'A condensed display face for headlines, a quiet neutral sans for body.',
                 'examples' => [['Bebas Neue', 'Inter'], ['Oswald', 'Source Sans 3'], ['Barlow Condensed', 'Barlow'], ['Anton', 'Work Sans'], ['Big Shoulders Display', 'Karla']]],
                ['id' => 'mono-accent', 'tags' => ['sans', 'mono-accent'],
                 'text' => 'A neutral sans for body and headlines, a monospace for labels, numbers and small captions.',
                 'examples' => [['IBM Plex Sans', 'IBM Plex Mono'], ['Public Sans', 'Space Mono'], ['Rubik', 'DM Mono'], ['Instrument Sans', 'JetBrains Mono']]],
            ],
            'palette' => [
                ['id' => 'warm-neutral-accent', 'tags' => ['light', 'warm'],
                 'text' => 'Warm neutrals (cream, sand, stone) with one saturated accent used sparingly.'],
                ['id' => 'cool-neutral-warm-accent', 'tags' => ['light', 'cool'],
                 'text' => 'Cool neutrals (off-white, slate) with one warm accent.'],
                ['id' => 'monochrome', 'tags' => ['monochrome'],
                 'text' => 'Near-monochrome: one hue in several lightnesses, no second color.'],
                ['id' => 'two-hues', 'tags' => ['two-hues', 'bright'],
                 'text' => 'Two strong hues and no gray at all; the neutrals are tints of the hues.'],
                ['id' => 'dark', 'tags' => ['dark'],
                 'text' => 'Dark ground, light type, one accent.'],
                ['id' => 'ink-only', 'tags' => ['light', 'ink-only'],
                 'text' => 'Light ground, ink-dark type, color only inside the photographs.'],
            ],
            'accent' => [
                ['id' => 'terracotta', 'tags' => ['terracotta', 'warm'], 'text' => 'terracotta / brick red'],
                ['id' => 'ochre', 'tags' => ['ochre', 'warm'], 'text' => 'ochre / mustard'],
                ['id' => 'olive', 'tags' => ['olive', 'green'], 'text' => 'olive / sage green'],
                ['id' => 'teal', 'tags' => ['teal', 'green', 'blue'], 'text' => 'petrol / teal'],
                ['id' => 'cobalt', 'tags' => ['cobalt', 'blue'], 'text' => 'cobalt / indigo'],
                ['id' => 'plum', 'tags' => ['plum'], 'text' => 'plum / burgundy'],
                ['id' => 'coral', 'tags' => ['coral', 'warm'], 'text' => 'coral / salmon'],
                ['id' => 'moss', 'tags' => ['moss', 'green'], 'text' => 'deep forest green'],
                ['id' => 'rust', 'tags' => ['rust', 'warm'], 'text' => 'rust / burnt orange'],
                ['id' => 'slate-blue', 'tags' => ['blue'], 'text' => 'slate blue / steel'],
                ['id' => 'charcoal', 'tags' => ['charcoal'], 'text' => 'no color accent at all: charcoal on the ground color, with weight and scale doing the work'],
                ['id' => 'chartreuse', 'tags' => ['chartreuse', 'green', 'bright'], 'text' => 'chartreuse / lime, used in small doses'],
            ],
            'layout' => [
                ['id' => 'strict-grid', 'tags' => ['grid'],
                 'text' => 'A strict 12-column grid with hard alignment; everything snaps to it.'],
                ['id' => 'alternating-bands', 'tags' => ['bands'],
                 'text' => 'Alternating full-bleed and contained bands, the ground color changing between them.'],
                ['id' => 'narrow-column', 'tags' => ['editorial'],
                 'text' => 'A single narrow column with magazine rhythm; images break out wider than the text.'],
                ['id' => 'bento', 'tags' => ['tiles'],
                 'text' => 'Mixed-size tiles: a few large cells, several small, all on one gap size.'],
                ['id' => 'ruled-sections', 'tags' => ['editorial'],
                 'text' => 'Numbered sections separated by thin horizontal rules, with a small running label in the margin.'],
                ['id' => 'few-big', 'tags' => ['airy'],
                 'text' => 'Few sections, big type, lots of air; the page is short and every section is tall.'],
            ],
            'radius' => [
                ['id' => 'radius-0', 'tags' => ['radius-0', 'sharp'], 'text' => '0 to 2px, square corners everywhere.'],
                ['id' => 'radius-sm', 'tags' => ['radius-sm'], 'text' => '6 to 8px, barely rounded.'],
                ['id' => 'radius-lg', 'tags' => ['radius-lg', 'round'], 'text' => '12 to 16px, soft.'],
                ['id' => 'pill', 'tags' => ['pill', 'round'], 'text' => 'Pill buttons and fully rounded images; cards stay square. The contrast is the point.'],
            ],
            'motion' => [
                ['id' => 'hover', 'tags' => ['motion-hover'], 'text' => 'Near-static: hover feedback only, no scroll reveals.'],
                ['id' => 'quiet', 'tags' => ['motion-quiet'], 'text' => 'Quiet reveals around 0.6s on two or three sections, hover feedback elsewhere.'],
                ['id' => 'confident', 'tags' => ['motion-confident'], 'text' => 'Confident reveals around 0.4s with one staggered grid.'],
                ['id' => 'cinematic', 'tags' => ['motion-cinematic'], 'text' => 'Slow and cinematic: reveals over 1s, one ambient drift on a single hero element.'],
            ],
            'signature' => [
                ['id' => 'type-hero', 'tags' => ['typographic'],
                 'text' => 'A hero that is all typography: the business name or promise set enormous, nothing else above the fold.'],
                ['id' => 'numerals', 'tags' => [],
                 'text' => 'Oversized numerals: services or steps numbered 01, 02, 03 in display type larger than the headings.'],
                ['id' => 'split-screen', 'tags' => [],
                 'text' => 'A two-tone split screen: the left half one color, the right half another, content straddling the seam.'],
                ['id' => 'marquee', 'tags' => ['motion'],
                 'text' => 'A marquee: one line of services or values scrolling horizontally in a band (CSS keyframes, pauses on hover, honors reduced motion).'],
                ['id' => 'editorial-rules', 'tags' => [],
                 'text' => 'Editorial rules: thin horizontal lines and a small running label separating every section.'],
                ['id' => 'one-photo', 'tags' => ['photo'],
                 'text' => 'One photograph used once, full bleed, with the headline set inside it; every other section is type on a plain ground.'],
                ['id' => 'color-block-nav', 'tags' => [],
                 'text' => 'A color-block navigation: the header is a solid bar of the accent color with the name in a contrasting block.'],
                ['id' => 'vertical-text', 'tags' => [],
                 'text' => 'Vertical text: the business name or a section label rotated and running down the left edge of the hero.'],
                ['id' => 'sticky-side', 'tags' => [],
                 'text' => 'A sticky side column: the section title stays pinned while its content scrolls past.'],
                ['id' => 'owner-sentence', 'tags' => [],
                 'text' => "One sentence from the owner's own description set at display size as its own section: no image, no button."],
                ['id' => 'bordered-grid', 'tags' => [],
                 'text' => 'A bordered grid: cells divided by 1px lines instead of gaps and shadows, like a printed table.'],
                ['id' => 'giant-footer', 'tags' => [],
                 'text' => 'A giant footer: the business name set across the full width of the viewport as the last thing on the page.'],
            ],
        ];
    }

    // ─── Internals ───────────────────────────────────────────────────

    /**
     * Remove options carrying a denied tag; keep only options carrying the
     * required tag when one is set. Falls back to the full list rather
     * than ever returning nothing.
     *
     * @param list<array{id: string, text: string, tags: list<string>}> $options
     * @param list<string> $deny
     */
    private static function filter(array $options, array $deny, ?string $requireTag): array
    {
        $pool = array_values(array_filter($options, static function (array $o) use ($deny, $requireTag): bool {
            if (array_intersect($o['tags'], $deny) !== []) {
                return false;
            }
            if ($requireTag !== null && !in_array($requireTag, $o['tags'], true)) {
                return false;
            }
            return true;
        }));

        if ($pool === [] && $requireTag !== null) {
            // The requirement and the denials collided: honour the requirement.
            $pool = array_values(array_filter($options, static fn(array $o): bool => in_array($requireTag, $o['tags'], true)));
        }

        return $pool === [] ? $options : $pool;
    }

    /**
     * Translate Site Memory into denied tags, required tags and a brand color.
     *
     * @param array<string, mixed> $memory decoded memory.json
     * @return array{0: list<string>, 1: array<string, string>, 2: ?string}
     */
    private static function constraintsFromMemory(array $memory): array
    {
        $deny       = [];
        $require    = [];
        $brandColor = null;

        foreach ($memory as $key => $entry) {
            $key   = strtolower((string) $key);
            $value = is_array($entry) ? ($entry['value'] ?? '') : $entry;
            $value = is_scalar($value) ? (string) $value : json_encode($value);
            $text  = $key . ' ' . strtolower((string) $value);

            if ($key === 'brand_color' || $key === 'brand_colour') {
                $trimmed = trim((string) $value);
                if ($trimmed !== '') {
                    $brandColor = $trimmed;
                }
                continue;
            }

            if (str_starts_with($key, 'rejected_direction')) {
                $sansSeen = false;
                foreach (self::REJECT_WORDS as $word => $tags) {
                    if ($word === 'serif' && $sansSeen) {
                        continue; // "sans-serif" rejected → do not also reject serifs
                    }
                    if (str_contains($text, $word)) {
                        if ($word === 'sans') {
                            $sansSeen = true;
                        }
                        $deny = array_merge($deny, $tags);
                    }
                }
                continue;
            }

            if (str_starts_with($key, 'design_preference') || str_starts_with($key, 'aesthetic_preference')) {
                foreach (self::PREFER_WORDS as $word => $req) {
                    if ($word === 'serif' && str_contains($text, 'sans')) {
                        continue;
                    }
                    if (str_contains($text, $word)) {
                        $require = $require + $req;
                    }
                }
            }
        }

        return [array_values(array_unique($deny)), $require, $brandColor];
    }

    private static function accentText(string $paletteId, string $hueText, ?string $brandColor): string
    {
        if ($brandColor !== null) {
            return "the brand color {$brandColor} from SITE MEMORY, used as the single accent";
        }

        return match ($paletteId) {
            'monochrome' => "the single hue is {$hueText}",
            'ink-only'   => 'no UI accent; color appears only inside the photographs',
            'two-hues'   => "first hue {$hueText}; choose the second yourself, clearly different in temperature",
            default      => $hueText,
        };
    }
}
