# Studio MCP lifecycle fixture

This is synthetic test content, not a recorded customer site or client
qualification. The fixture covers three PHP pages, a nested route, the canonical
header/nav/footer partials, Tailwind utilities, design tokens, a JavaScript
interaction, server-side JSON reads, a form schema, a CSS asset URL, and an
uploaded PNG.

Copy `site/` into an isolated test workspace. Compile `assets/css/tailwind.css`
there using the shipped PHP compiler; it is intentionally absent from authored
input. The first-party `submit.php` handler belongs to the installed product, not
the site's authored files. Tests must install the real preview/submit handlers
and assert that a preview submission never reaches production storage.

`fixture.json` declares the intended source inventory and dependency checks.
`assets/images/workshop.png` is a deterministic 32×24 checkerboard test image.
Do not present this fixture, a passing inventory test, or a synthetic MCP request
as evidence that Codex or Claude Code completed a real lifecycle.
