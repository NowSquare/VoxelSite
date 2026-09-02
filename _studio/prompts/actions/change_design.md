# Action: Change Design

You are changing the visual design of an existing site: colors, typography, spacing, radius, or the overall aesthetic. Content and page structure stay unless the user asks otherwise.

## Prefer Token-Level Changes

Design changes come in two kinds. Prefer the first: it is cheaper, faster, and the TailwindCompiler does the rest.

### Token-level changes (colors and typefaces)

The site's `:root` block in `assets/css/style.css` defines the brand tokens:

```css
--color-primary, --color-primary-light, --color-primary-dark, --color-accent,
--color-bg, --color-bg-alt, --color-text, --color-text-muted, --color-border,
--font-heading, --font-body, --font-accent, --max-width
```

Pages reference them through Tailwind classes: `bg-primary`, `text-accent`, `font-heading`, `font-body`, and every other `--color-*` token by its name. The compiler resolves each `--color-*` token to a class of the same name and the `font-*` classes to the font tokens. Change the token value and every element that uses it changes on every page.

**Output only `assets/css/style.css`** (plus `_partials/header.php` when the Google Fonts link changes). Do not re-output page files.

Examples:
- "Make it warmer" → shift `--color-primary`, `--color-accent`, `--color-bg` and `--color-bg-alt` to warmer hues; check `--color-text` still meets 4.5:1 on the new grounds
- "Use a different font" → update `--font-heading` and/or `--font-body` and the `<link>` in `_partials/header.php`; keep a system fallback stack
- "Darker" → invert the ground and text tokens together (`--color-bg`, `--color-bg-alt`, `--color-text`, `--color-text-muted`, `--color-border`) and review sections that use hard-coded Tailwind greys

### Structural changes (spacing, radius, layout, components)

Spacing, corner radius, shadows, grid patterns and component shapes live in Tailwind classes in the HTML, not in tokens. **Output the affected page files** (and partials) with updated classes, plus `style.css` only if token values also change.

Examples:
- "More whitespace" → raise section padding (`py-20` → `py-28`), gaps and max-widths in the pages
- "Rounder corners" → `rounded-md` → `rounded-2xl` on cards, buttons and images across the pages
- "Change the grid from 3 columns to 2" → `md:grid-cols-3` → `md:grid-cols-2` wherever it appears
- "Make the header fixed" → `_partials/nav.php` and the nav CSS in `style.css`

### Combined changes

"Make it more modern" or "redesign everything" means:
1. New token values in `style.css` `:root` (colors, fonts)
2. Updated Tailwind classes in the pages, only where structure or component shapes also change
3. `_partials/header.php` if the font families change

Keep the site's existing signature move unless the user rejects it. A redesign that changes everything at once usually loses what made the site specific.

## Design Intelligence: Always Update

Every design change is a DI update. The notes must describe the new reality, not the old one.

**Read** the DESIGN INTELLIGENCE section before changing anything. If the notes say "no gradients, flat surfaces" and the user asks for "more depth", reach for shadows and layering before gradients, unless the user explicitly asks for them.

**Write** a merge operation for `assets/data/design-intelligence.json` covering every affected note:
- Colors → `color_strategy`
- Fonts → `typography_personality`
- Spacing → `spacing_philosophy`
- Layout → `layout_patterns`
- Components → `component_vocabulary`
- Full redesign → everything, including `visual_personality`

## Site Memory: Capture Preferences

When the request reveals a preference, remember it with a merge operation for `assets/data/memory.json`:
- "I hate gradients" → `rejected_direction_gradients`
- "Always use dark backgrounds" → `design_preference_dark_bg`
- "Make it feel more luxurious" → `aesthetic_preference`
- "Our brand color is #2563eb" → `brand_color`

These persist across conversations, so a rejected direction is never proposed again.

## Contrast and Coherence

- Check every text-on-ground pair after a color change: 4.5:1 for body text, 3:1 for large text
- When the ground flips from light to dark, review sections that use hard-coded Tailwind greys (`text-gray-600`, `bg-gray-50`); they do not follow the tokens
- New fonts change visual size: a heading that was `text-5xl` in a condensed face may need `text-4xl` in a wide one
- Keep the overlay pattern on images (`bg-black opacity-50` or a brand color) so the visual editor can still adjust it

## Process

1. Read DESIGN TOKENS and DESIGN INTELLIGENCE from the context
2. Decide: token-level, structural, or both
3. Token-level: change values in `style.css` `:root`; for fonts also change `_partials/header.php`
4. Structural: output the affected pages and partials with updated Tailwind classes
5. Merge the DI notes and any memory preferences
6. Never output `assets/css/tailwind.css`; the compiler regenerates it

## Mistakes to Avoid

- Re-outputting pages for a pure color or font change
- Inventing token names the compiler cannot resolve (`--c-primary-500`, `--section-padding-y`); only `--color-*` and `--font-*` tokens map to classes
- Adding component classes (`.hero`, `.card`, `.btn-primary`) to `style.css`; they bypass the compiler and the visual editor
- Using `style="background: var(--color-primary)"` where `bg-primary` exists
- Changing colors without checking contrast
- Adding decoration while restyling: a design change is not an invitation to add gradients, shapes or icons
- Forgetting the DI merge
