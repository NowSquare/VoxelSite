<!--
  Context Template Reference
  
  This file documents the context sections assembled by SiteContext::build().
  It is NOT used at runtime — SiteContext.php constructs context programmatically.
  Keep this in sync with SiteContext.php when adding or modifying sections.
  
  Sections are listed in priority order (essential → important → optional).
  When the context budget is tight, optional sections are dropped first,
  then important sections (in reverse order).
  
  Last synced with SiteContext.php: 2026-03-11 (after adding DATA DEPENDENCIES)
-->

# Context Sections — Priority Order

## Priority 1: Essential (always included)

=== SITE INFORMATION ===
Name: {{site_name}}
Tagline: {{site_tagline}}
Language: {{site_language}}
Pages: {{page_count}}
Current date: {{date}}

=== SITE MEMORY ===
{{memory_json_content}}

=== DESIGN TOKENS (from assets/css/style.css) ===
{{root_block_css}}

=== DESIGN INTELLIGENCE ===
{{design_intelligence_json_content}}

=== SITE MAP ===
slug | title | type | nav_order | in_nav
{{page_rows}}

=== PAGE MANIFEST ===
Section-level structure of each page (excluding focus page).
{{per_page_section_summaries}}

=== CURRENT HEADER PARTIAL (_partials/header.php) ===
{{header_php_content}}

=== CURRENT NAVIGATION HTML (_partials/nav.php) ===
{{nav_php_content}}

=== CURRENT FOOTER HTML (_partials/footer.php) ===
{{footer_php_content}}

## Priority 2: Important (included if budget allows)

=== FOCUS PAGE: {{slug}} ({{slug}}.php) ===
{{full_page_html}}
— OR (for new pages) —
=== REFERENCE PAGE: {{slug}} ({{slug}}.php) ===
{{reference_page_html_with_instructions}}

=== CONVERSATION HISTORY ===
{{last_5_exchanges}}

=== AVAILABLE ASSETS ===
path | type | size
{{asset_rows}}

=== IMAGE LIBRARY ===
{{background_and_gallery_images_with_metadata}}

=== DATA LAYER (assets/data/) ===
{{all_data_json_files_except_memory_and_di}}

=== FORM SCHEMAS (assets/forms/) ===
{{all_form_schema_json_files}}

=== DATA DEPENDENCIES ===
{{form_data_linkages, page_data_linkages, aeo_propagation}}

=== ACTIVE AGENT ACTIONS ===
{{active_action_names_and_fields}}

## Priority 3: Optional (dropped first when over budget)

=== GLOBAL CSS ===
{{full_style_css_and_tailwind_css}}

=== AVAILABLE ICONS ===
{{lucide_icon_names}}
