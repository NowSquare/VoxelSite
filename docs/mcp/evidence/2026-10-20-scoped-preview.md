# Scoped draft preview evidence — 20 October 2026

This record covers the local T09 implementation and a disposable synthetic website. It does not qualify a production host, external MCP client, or marketing launch.

## Implemented boundary

`PreviewService` shares `PreviewRenderer` between Studio, bounded text rendering and the scoped browser endpoint. Render/open require the current explicit `draft_version`. Render returns actual diagnostics and an explicit omission if HTML exceeds the whole JSON response budget; it never claims a browser visual review.

`preview.open` retains at most 32 active grants per credential and 512 grants overall. Creation removes expired ephemeral grants. Tickets last 120 seconds and can be consumed once; browser authority lasts 900 seconds. Only SHA-256 ticket/cookie hashes are stored. Each read rechecks credential, user, preview/files/assets scopes, installation, draft version and allowed paths. Form schema reads additionally require `forms:read`. No owner session is opened or inherited as authority.

The browser link carries its one-use ticket only in a fragment. The bootstrap removes the fragment before a same-origin POST, the exchange responds with a 303, and the browser replaces its address with the clean target. Strict configured-origin validation rejects cross-origin exchange. Native form POST was rejected by the browser's `Origin: null` under `Referrer-Policy: no-referrer`; the verified bootstrap uses `fetch` POST to preserve origin validation. The cookie is HttpOnly, SameSite=Strict, Secure on HTTPS, and scoped to the actual configured installation script path. All responses are private/no-store, noindex and no-referrer.

HTML attributes, inline styles/scripts, CSS imports/URLs, module imports, relative fetches and interpolated asset prefixes route through the same preview authority. Tailwind arbitrary-value class text is preserved. PHP is rendered only for allowed site pages; shared partials cannot be requested as executable assets. The existing Studio PHP code-trust boundary still applies; this renderer is not a sandbox for hostile PHP.

Server-rendered forms and per-button overrides use an explicit POST validation-only route. It never reads submitted fields/files/secrets or delegates to production submission handlers. The exact Studio fallback route is authenticated and read-only; its CSRF exception is confined to that route. First-party form and Actions scripts recognize the explicit preview runtime and stop before serialization or submission. The public action projection excludes notification targets and administration fields and pins its submission target.

## Automated verification

- `php _studio/tests/McpPreviewTest.php`: 44 checks passed. Includes text-budget omission, real PHP failure diagnostics, version mismatch, hashed one-use tickets, origin defense, expiry, revocation, subdirectory paths/cookies, nested dependencies, action projection, ordinary forms, per-button overrides, request bounds and unchanged draft/live/submission bytes.
- Bundled Node `--test _studio/tests/McpPreviewUiTest.mjs`: 3 tests passed. Executes the shipped scripts in a VM with transport/serialization traps, including top-level and iframe forms and a hostile action-manifest submit URL.
- `php _studio/tests/McpWorkspaceIsolationTest.php`: 81 passed, 0 failed.
- Focused PHP lint and `git diff --check`: passed.

## Browser verification

A temporary PHP server used synthetic fixture roots, a temporary SQLite database and a canonical `/test-install` URL. No production configuration or credentials were used.

The in-app browser completed the fragment exchange, displayed ordinary forms and Actions, followed the homepage's Repairs link to a nested page, and loaded source CSS, compiled Tailwind CSS, JavaScript/module dependencies, an image and JSON data through scoped URLs. The fresh `localhost` run recorded no PHPSESSID on any request. An earlier `127.0.0.1` run had an unrelated pre-existing browser cookie; the service ignored it and the cookie-free run was repeated explicitly.

Ordinary form and Actions submissions displayed disabled notices. A fixture-only `script-src 'none'` header then disabled all scripts: the server-rewritten form/per-button fallback posted to the preview validator and displayed “Nothing was submitted.” Hash inventories verified the draft, published website and submission/action sentinel bytes remained unchanged. Revoking the temporary credential caused the next browser reload to return `permission_denied`.

Screenshot of the first-party Actions disabled result: `/private/tmp/voxelsite-scoped-preview-disabled.png` (synthetic fixture, no customer data).

Production reverse-proxy/HTTPS behavior and supported external client qualification remain outside this local evidence.
