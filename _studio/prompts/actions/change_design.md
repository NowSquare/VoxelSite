# Action: Change Design

You are modifying the visual design of the website. This is a site-wide change — colors, typography, spacing, or overall aesthetic.

## Critical Requirement: Prefer Token-Level Changes

Design changes come in two types. **Always prefer token-level changes** — they're cheaper, faster, and the TailwindCompiler handles the rest automatically.

### Token-Level Changes (colors, fonts, spacing, radii)

**Output only `assets/css/style.css`** (and `_partials/header.php` if fonts change). Do NOT re-output page files.

Why this works: All pages use Tailwind utility classes like `bg-primary-500`, `text-accent-300`, `py-section`, `font-heading`. These resolve to `var(--c-primary-500)`, `var(--c-accent-300)`, etc. Changing the token VALUE in style.css automatically changes every element that references it — across every page, instantly, with zero page re-output.

Examples of token-level changes:
- "Make it warmer" → update `--c-primary-*` and `--c-accent-*` scales to warmer hues
- "Use a different font" → update `--font-heading` and/or `--font-body`, update Google Fonts `<link>` in `_partials/header.php`
- "More whitespace" → update `--section-padding-y`, `--stack-gap`, `--grid-gap`
- "Rounder corners" → update `--radius-default`, `--radius-sm`, `--radius-md`, `--radius-lg`
- "Darker backgrounds" → update `--c-bg`, `--c-surface`, `--c-bg-alt` values

### Structural Changes (layout, grid patterns, new sections)

**Output affected page files** with updated Tailwind utility classes, plus `style.css` if token values also change.

Examples of structural changes:
- "Change the grid from 3 columns to 2" → update pages that use `md:grid-cols-3` to `md:grid-cols-2`
- "Make the header fixed" → update `_partials/header.php` and `_partials/nav.php`
- "Add a sidebar layout" → update affected page files

### Combined Changes

When the user says "make it more modern" or "redesign everything," interpret as:
1. First, update token values in `style.css` `:root` block (colors, fonts, spacing, radii)
2. Then, only if the layout/structure also needs to change, output affected pages
3. Always update `_partials/header.php` if font families change (Google Fonts link)

## Design Intelligence — Always Update

**Every design change is a DI update.** You are changing the visual personality of this site. The design intelligence notes must reflect the new reality, not the old one.

**Read:** Check the DESIGN INTELLIGENCE section in your context before making changes. Understand the current design philosophy so your changes are coherent, not random. If the DI says "no gradients" and the user asks for "more depth," try shadows and layering before introducing gradients — unless the user explicitly overrides.

**Write:** After making the design change, include a merge operation for `assets/data/design-intelligence.json` updating every affected note:
- Changed colors → update `color_strategy`
- Changed fonts → update `typography_personality`
- Changed spacing → update `spacing_philosophy`
- Changed layout patterns → update `layout_patterns`
- Changed component styles → update `component_vocabulary`
- Full redesign → update everything

## Site Memory — Capture Preferences

If the user's design request reveals a preference, add it to memory:
- "I hate gradients" → memory: `design_preference_no_gradients`
- "Always use dark backgrounds" → memory: `design_preference_dark_bg`
- "Make it feel more luxurious" → memory: `aesthetic_preference`
- "Our brand color is #2563eb" → memory: `brand_color`

These preferences persist across conversations, ensuring the AI never repeats a rejected direction.

## Design Change Types

### Colors
- Update the `--c-primary-*`, `--c-secondary-*`, `--c-accent-*`, `--c-neutral-*` shade scales in style.css `:root`
- Update semantic mappings (`--c-surface`, `--c-bg`, `--c-text`, `--c-border`, etc.)
- Verify contrast ratios meet WCAG AA (4.5:1 for body text)
- When shifting warm-to-cool or light-to-dark, review all semantic color tokens

### Typography
- Update `--font-heading`, `--font-body`, `--font-accent`, `--font-mono` tokens
- Use Google Fonts CDN — update the `<link>` tag in `_partials/header.php`
- Adjust `--text-*` size scale `clamp()` values if the new fonts have different visual sizing
- Review heading hierarchy — some fonts need adjusted weights or letter-spacing

### Spacing
- Update `--section-padding-y`, `--container-padding`, `--stack-gap`, `--grid-gap`
- Check that the spacing tokens scale proportionally
- Dense layouts need tighter gaps; airy layouts need larger ones

### Overall Aesthetic
- Interpret as coordinated change across colors, typography, and spacing
- Reference the style preferences from the create_site action for guidance
- Prefer updating style.css tokens over re-outputting pages

## Process

1. Read the current design tokens from the DESIGN TOKENS section in context
2. Read the current design intelligence from the DESIGN INTELLIGENCE section in context
3. Understand the requested change — is it token-level, structural, or both?
4. For token-level changes: update values in `style.css` `:root` block
5. For font changes: also update `_partials/header.php` (Google Fonts link)
6. For structural changes: output affected pages with updated Tailwind classes
7. For partials changes: output `_partials/header.php`, `_partials/nav.php`, `_partials/footer.php` as needed
8. Update `assets/data/design-intelligence.json` with the new design decisions
9. The TailwindCompiler will automatically recompile `tailwind.css` after your changes — you never need to output `tailwind.css`

## Common Mistakes to Avoid

- **Re-outputting pages for a pure token change.** If only colors/fonts/spacing changed, output ONLY `style.css` (and `header.php` for fonts). Pages inherit via `var()` references automatically.
- **Outputting `tailwind.css`.** Never. The TailwindCompiler generates this automatically.
- **Adding component classes to `style.css`.** Never create classes like `.hero`, `.card`, `.btn-primary`, `.section-header` in `style.css`. Use Tailwind utility classes directly in HTML. Custom CSS classes bypass the visual editor and TailwindCompiler.
- **Using `style.css` for things Tailwind handles.** Only use `style.css` for `:root` tokens and effects Tailwind can't express (`@keyframes`, pseudo-element content, `[data-reveal]`).
- Changing colors without checking contrast ratios
- Using `var()` references directly in HTML when a Tailwind theme alias exists (use `bg-primary-500` not `style="background: var(--c-primary-500)"`)
- Creating a design that looks good on desktop but breaks on mobile
- **Forgetting to update design intelligence.** Every design change needs a DI merge.

