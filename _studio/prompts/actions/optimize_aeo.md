# Action: Optimize for AI Discovery (AEO)

You are analyzing an existing website and optimizing it for AI Engine Optimization (AEO) — making the site easily discoverable, understandable, and referenceable by AI assistants, search engines, and AI agents.

## What You Must Do

1. **Audit the data layer** — Review existing `assets/data/site.json` and any feature data files. Identify:
   - Missing or incomplete fields in `site.json` (contact info, hours, social links, `features` array)
   - Structured content in HTML pages that should have a corresponding data file but doesn't
   - Data files that are out of sync with the page content

2. **Enhance `site.json`** — Fill in any gaps:
   - Ensure `description` is a compelling, complete paragraph (not a tagline repeat)
   - Ensure `features` accurately lists all site features
   - Add `site_type` if missing
   - Add `language` if missing

3. **Create missing feature data files** — If the site has:
   - A menu page with items in HTML but no `menu.json` → create it
   - A services page with services in HTML but no `services.json` → create it
   - FAQ content anywhere but no `faq.json` → create it
   - Team members on pages but no `team.json` → create it
   - Same pattern for: products, pricing, events, testimonials, portfolio, gallery

4. **Ensure pages read from data** — Pages that display structured content should read from JSON files via `json_decode(file_get_contents(__DIR__ . '/assets/data/{feature}.json'), true)`, not hardcode it. Update pages to read from data files.

5. **Add meta descriptions** — Ensure every page has a meaningful `<meta name="description">` in its `<head>` section. The description should be:
   - 150–160 characters
   - Unique per page
   - Written for both humans and AI models (clear, informative, keyword-rich without stuffing)

6. **Add FAQ schema potential** — If the site doesn't have explicit FAQ content but has common questions answered in the copy, extract 3–5 Q&A pairs into a new `assets/data/faq.json`.

## Output Rules

- Output all changed/new files using the standard file operation format
- Preserve all existing design, layout, and styling — this is a data optimization, not a redesign
- Only modify HTML structure where necessary to read from data files
- Always use `__DIR__` for data file paths (NOT `$_SERVER['DOCUMENT_ROOT']` — it can be empty in Herd/Valet)
- Always check `file_exists()` before reading data files

## Site Memory — Extract During Audit

While auditing the data layer, you'll encounter business facts embedded in HTML that should be in memory. Extract them:
- Business name, type, and description from site.json or page content
- Contact details found in footer or contact pages
- Service/product offerings found in page content
- Any structured data that reveals business characteristics

Include a merge operation for `assets/data/memory.json` with whatever you discover. Use `"confidence": "inferred"` since these facts come from the existing site, not directly from the user.

**Do NOT update design intelligence.** AEO is a data optimization, not a visual change.

## Quality Check

After optimization, every VoxelSite site should have:
- [ ] `assets/data/site.json` with complete business identity
- [ ] Feature data files for all structured content
- [ ] Pages reading from data files (single source of truth)
- [ ] Meta descriptions on every page
- [ ] FAQ data (explicit or extracted from content)
- [ ] Site memory populated with business facts discovered during audit
