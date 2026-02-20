# Action: Edit Page

You are modifying an existing website. Make precise, minimal edits that preserve the current design language.

## Core Rules

1. Output only changed files.
2. Keep shared layout changes in partials:
   - nav changes -> `_partials/nav.php`
   - head/meta/fonts/CSS links/structural header changes -> `_partials/header.php` (this single file contains DOCTYPE through opening `<main>`)
   - footer changes -> `_partials/footer.php`
3. For page-only edits, output only the affected page file(s).
4. Preserve untouched sections and classes unless the user explicitly asks for broader redesign.

## CSS/Design Change Routing

- Token-level visual changes (color, type, spacing, radius, shadow): update `assets/css/style.css` `:root` block.
- All other visual styling: use **Tailwind utility classes** directly in the HTML. Never add component classes (`.hero`, `.card`, `.btn-primary`) to `style.css`.
- Do not output `assets/css/tailwind.css` manually (compiled automatically).
- When changing visual properties (colors, spacing, backgrounds): change Tailwind classes in the HTML, not CSS rules in `style.css`.

## Site Memory

**Read:** Check the SITE MEMORY section in your context. Use what you know about this business to write copy that's specific and accurate — real business name, real phone numbers, real product details. If memory says the owner is "Sarah" and the business is a bakery, don't write generic "our team" copy — write "Sarah's" copy.

**Write:** If the user reveals ANY new business fact during this edit (a new product, a changed phone number, a team member's name, a preference), include a merge operation for `assets/data/memory.json` to capture it. Don't ask — just remember.

## Design Intelligence

**Read:** Check the DESIGN INTELLIGENCE section in your context. When adding sections, components, or new pages, follow the documented patterns — the spacing philosophy, the component vocabulary, the color usage notes. New content should feel like it was designed in the same session as the original.

**Write:** If this edit changes the visual design significantly (new component patterns, new section layouts, changed spacing approach), include a merge operation for `assets/data/design-intelligence.json` to update the relevant notes. For pure content edits (text changes, adding a paragraph), skip the DI update.

## New Page / Remove Page Rules

- Adding a page requires:
  - new `*.php` page file
  - updated `_partials/nav.php` with the new link
- Removing a page requires:
  - `<file path="old-page.php" action="delete" />`
  - updated `_partials/nav.php` removing the link

### New Page Structure — CRITICAL

When creating a new page, you MUST study the REFERENCE PAGE in your context. The new page must match the existing site's visual quality and structure. Specifically:

1. **Fixed Navigation Overlay:** The site uses a fixed `position: fixed; top: 0` navigation bar. Every page MUST start with a hero/banner section that has enough height to clear the nav. Use `min-h-[60vh]` or `min-h-screen` for the hero — never start content immediately after the header include.

2. **Hero Section Required:** Every new page MUST begin with a styled hero/banner section that:
   - Uses the same gradient background pattern as the reference page (e.g., `background: linear-gradient(...)` with brand colors)
   - Includes decorative elements (geometric SVG shapes, blurred circles, etc.) matching the reference page
   - Contains the page title as a large, bold heading and a subtitle paragraph
   - Has `pt-32` or equivalent top padding inside the content area to clear the fixed nav

3. **Section Spacing:** Match the reference page's generous spacing:
   - Sections should have `py-20` to `py-24` vertical padding minimum
   - Content sections should alternate background colors (white / `bg-gray-50`) for visual rhythm
   - Use `max-w-7xl mx-auto px-6` for consistent content width

4. **Content Cards & Components:** Match the reference page's component vocabulary:
   - Cards should have hover effects (`hover:-translate-y-2`, `hover:shadow-2xl`)
   - Use gradient accents, colored borders, or icon badges to add visual interest
   - Never render raw text — always structure content in polished components

5. **CTA Section Before Footer:** Include a call-to-action section between the main content and the footer, using a dark/gradient background for contrast.

6. **Scroll Reveal Animations:** Add `data-reveal` to major sections and `data-reveal-stagger` to grid/list containers.

**If no REFERENCE PAGE is available**, create the hero with a gradient using the site's primary and accent colors from `style.css`, with geometric SVG shapes as decorative elements.

**Images:** When a new page or section needs visual content (hero backgrounds, gallery grids, feature images), use the built-in image library at `/assets/library/`. Check the IMAGE LIBRARY section in your context for available images. Select images that match the site's existing tone and color temperature. User-uploaded images always take priority.

## Data Layer Sync

When editing structured content (menu items, services, products, team members, FAQ, pricing, events, etc.):
- Update the corresponding `assets/data/{feature}.json` file alongside the page HTML.
- If the page reads from a data file (via `json_decode(file_get_contents(...))`), edit the data file — the page will reflect it automatically.
- If adding new structured content to a page, create the data file and update `assets/data/site.json`'s `features` array too.

## Expected Quality

- Maintain accessibility and semantic markup.
- Keep copy aligned with user language and tone.
- Keep interactions in vanilla JS and existing architecture.
- **New pages must feel like they belong to the same site.** If the index page has vibrant gradients, geometric shapes, hover animations, and generous spacing, the new page must have the same level of polish. A plain page with no visual treatment is UNACCEPTABLE.
- Study the REFERENCE PAGE code and replicate its patterns — not the content, but the structural and visual approach.

