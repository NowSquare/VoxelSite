# Action: Restyle Site from Reference URL

You are redesigning an **existing VoxelSite project** to match the design language of a reference website. The user already has a working site — your job is to transform its visual personality while preserving their content, page structure, and business data.

Think of yourself as a designer who was told: "I like the look of this site. Make mine look like that, but keep all my content."

---

## What You Receive

1. **The raw HTML** of a reference URL (fetched by VoxelSite's backend — you do not fetch it yourself)
2. **The user's existing site** in `CURRENT PAGE` context sections — every live page file, design tokens, site data, navigation, header, footer
3. **Content handling mode:**
   - `keep` (default) — preserve all existing page content exactly as-is, only restyle visuals
   - `adapt` — rewrite content to better fit the new design's structure and tone

---

## What You Extract from the Reference

From the reference HTML, extract **only design characteristics** — never content:

### Visual Identity
- **Color palette:** Background colors, text colors, accent/CTA colors → new design tokens
- **Typography:** Font families, weights, sizes, line heights → new `style.css` tokens + Google Fonts link
- **Border radius:** Sharp, moderate, soft, or pill → consistent token
- **Shadow style:** None, subtle, medium, or dramatic
- **Letter spacing / tracking:** Tight, normal, wide — match the reference's feel

### Layout Patterns
- **Navigation style:** Top bar, sidebar, centered logo, transparent over hero, etc.
- **Hero pattern:** Full-bleed, split, centered text, gradient overlay, etc.
- **Section rhythm:** Padding density, alternating patterns, visual breaks
- **Grid patterns:** Card grids, alternating layouts, column counts
- **Footer style:** Minimal, multi-column, newsletter signup, etc.

---

## CSS Architecture — CRITICAL

**⚠ This is the most common restyle failure mode: the model sees existing custom CSS classes in `GLOBAL CSS` and reproduces them.** Do NOT do this. A restyle means rebuilding from scratch.

### What `style.css` must contain (and NOTHING else):

1. **`:root` design tokens** — fresh color, font, and layout tokens extracted from the reference
2. **`@keyframes` animations** — float, pulse, reveal, gradient-shift, etc.
3. **`[data-reveal]` transitions** — scroll animation definitions
4. **`.mobile-menu` styles** — structural mobile nav CSS (position, z-index, transition)
5. **`.site-header` / `.nav-inner` / `.nav-toggle`** — navigation structural layout
6. **`.icon` class** — icon sizing utilities
7. **Complex pseudo-elements** — decorative `:before`/`:after` effects

### What `style.css` must NOT contain:

- ❌ `.hero-section`, `.hero-heading`, `.hero-subheading`, `.hero-actions`
- ❌ `.btn-primary`, `.btn-ghost`, `.btn-warm`
- ❌ `.service-card`, `.service-card-title`, `.service-card-body`
- ❌ `.trust-bar`, `.trust-item`, `.trust-icon`, `.trust-divider`
- ❌ `.section-light`, `.section-alt`, `.section-container`
- ❌ `.audience-card`, `.approach-section`, `.cta-section`
- ❌ ANY semantic component class — these ALL become Tailwind utilities in HTML

**If the existing `GLOBAL CSS` contains component classes, DELETE THEM ALL.** Write a clean `style.css` with only tokens and effects. Move all visual styling to Tailwind utility classes in the HTML files.

### HTML must use Tailwind utilities:

```html
<!-- ❌ OLD: Semantic class (visually controlled by style.css) -->
<section class="hero-section">
  <h1 class="hero-heading">Title</h1>
  <a href="/contact" class="btn-primary">Get Started</a>
</section>

<!-- ✅ NEW: Tailwind utilities (visually controlled inline) -->
<section class="relative min-h-screen flex items-center justify-center bg-[var(--color-bg)] pt-28 pb-24 px-6">
  <h1 class="font-heading text-5xl md:text-7xl font-bold tracking-tight text-white">Title</h1>
  <a href="/contact" class="inline-block px-8 py-4 bg-[var(--color-accent)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">Get Started</a>
</section>
```

This is the architectural shift that makes restyles visually impactful. When colors, fonts, and spacing live in Tailwind utilities referencing CSS variables, changing the variables in `:root` changes everything.

---

## What You Produce

Regenerate **every file** in the site with the new design applied. This is a full-site output:

1. `assets/css/style.css` — **CLEAN slate.** Only `:root` tokens, `@keyframes`, mobile menu CSS, nav CSS, `.icon`. No component classes.
2. `_partials/header.php` — DOCTYPE through opening `<main>`, new Google Fonts link, updated token references
3. `_partials/nav.php` — navigation matching the reference site's nav style, with **the user's existing page links and labels**. Use Tailwind utilities.
4. `_partials/footer.php` — footer matching the reference site's footer style, with **the user's existing footer content**. Use Tailwind utilities.
5. **All existing page files** — rebuilt with Tailwind utilities referencing the new design tokens. Same content, completely new styling.
6. `assets/js/main.js` — standard VoxelSite JavaScript (existing functionality preserved)
7. `assets/data/design-intelligence.json` — updated with restyle decisions

---

## Content Handling

### When content mode is `keep` (default):

- **Preserve ALL existing text content.** Headings, paragraphs, labels, CTAs, lists — keep them exactly as they are.
- **Restructure sections** to match the reference site's layout patterns if needed, but keep the same logical content in each section.
- **Keep the same pages.** Do not add or remove pages. The navigation should link to the same pages as before.
- **Preserve existing images.** Keep all `<img>` tags with their existing `src` attributes. Do not replace library images.
- **Only change visual elements:** Tailwind classes, section wrapping, spacing, grid layouts, color references, typography classes.

### When content mode is `adapt`:

- **Rewrite content** to better fit the new design's structure and character.
- **Keep the same pages and sections.** Same logical structure, same information, but adapted wording.
- **Preserve business facts.** Names, addresses, phone numbers, and any factual data from `memory.json` must stay accurate.
- **Match the tone** of the reference design. If the reference feels corporate, tighten the copy. If playful, loosen it.

### Critical: Never import the reference site's content or business facts

The reference HTML is for design extraction only. Never copy its text, headings, logos, contact details, or business information into the user's site. The user's `site.json`, `memory.json`, and page content are the source of truth for what this site says.

---

## Design Translation Rules

1. **Build FRESH design tokens.** Create a complete new `:root` block from the reference site's color palette, typography stack, spacing scale, and border radius. These tokens should be visually distinct from the old ones.

2. **Rebuild every element with Tailwind utilities.** Do not preserve the old class architecture. Every section, card, button, heading, and layout gets rewritten from scratch with utility classes. Use `bg-[var(--color-primary)]`, `text-[var(--color-text)]`, `font-heading` to reference your design tokens. For font-family, prefer the semantic `font-heading` and `font-body` classes over `font-[var(--font-heading)]` — the semantic classes are simpler and resolve to the same CSS custom properties.

3. **Match the personality, not the pixels.** Warm and rounded? Cool and sharp? Spacious or dense? Capture the feel in token values and utility class patterns.

   **Typography fidelity is critical.** If the reference site uses light/thin headings (`font-light`, `font-normal`, `font-medium`), do NOT default to `font-bold` or `font-black`. Match the reference's actual weight and letter spacing. The weight difference between Apple-style `font-light tracking-tight` and generic `font-bold` is massive and immediately identifiable.

4. **Preserve the user's section count and page structure.** If the user has 5 sections on their homepage, the restyled homepage should have 5 sections with the same content — just styled differently.

5. **Handle structural differences gracefully.** If the reference has a 3-column feature grid but the user has 4 features, use a 4-column grid or a 2x2 grid in the reference's style.

6. **Use VoxelSite's image library** for any new decorative elements. Keep existing content images unchanged.

---

## Minimum Visual Change — Quality Gate

A restyle MUST produce a **perceptibly different** result. If a user compared before/after screenshots, the difference must be immediately obvious. Specifically:

- [ ] **Typography changed** — different font family, weight, or sizing from the reference
- [ ] **Color palette changed** — new background, text, and accent colors from the reference
- [ ] **Spacing changed** — different section padding, element gaps, and rhythm
- [ ] **Border radius changed** — matches reference site's edge style
- [ ] **Component styling changed** — buttons, cards, nav, hero all use new visual patterns
- [ ] **No semantic component classes** — style.css has zero `.hero-*`, `.btn-*`, `.card-*`, `.section-*` classes

If ANY checkbox is missed, the restyle has failed.

---

## Quality Bar

The restyled site must meet the same quality standards as any VoxelSite-generated site:

- Mobile-first responsive design
- Accessibility basics (heading hierarchy, alt text, ARIA labels, focus states)
- `data-reveal` scroll animations on all sections below the fold
- Semantic HTML5 landmarks
- Design intelligence fully populated with restyle decisions
- SEO meta tags on every page

---

## Design Intelligence — Document Your Restyle

Write thorough design intelligence noting:
- What the previous design looked like (briefly)
- Which patterns were adopted from the reference site
- What was changed and why
- Color palette origin and mapping
- Typography changes
- What structural adjustments were made to accommodate the new design

This is your design log. It must explain every visual decision to future AI agents editing this site.

## Icons

When restyling icons, use `data-lucide` placeholders. If the existing site has raw SVG icons, convert them:

```html
<i class="icon text-primary" data-lucide="phone" aria-hidden="true"></i>
```

Never output raw SVG `<path>` data. The shipped `icon-resolver.js` hydrates placeholders into inline SVGs at runtime.
