# Shared page management and compilation

Focused verification on October 20, 2026. This does not qualify the complete parity milestone or a deployed host.

Studio `pages.php` and REST `pages.php` now delegate to `PageManagementService` and `StudioAuthoringService`. Reads capture bounded source/metadata under the common workspace lock, return source hashes and draft versions, refuse a reserved mixed workspace, and do not synchronize the page registry. Paginated reads require the captured version after the first page.

Page creation, combined title/slug/content/navigation changes, navigation flags and ordering, and deletion prepare exact source and page-row projections through the same structural planner and change-set executor. Caller operation IDs, captured draft versions and source hashes (or explicit null absence) bind retries. Renamed and deleted route retries return retained results without resolving an already removed current source. The review exposes exact `page_changes`; altered visible metadata is rejected against the sealed manifest. Metadata-only changes create one projected revision and version change, with tested undo/redo, without invented file edits.

REST credentials require an explicit current account binding. Fixed authoring and compile purposes intersect existing legacy grants and current account authority. Assets-only and compile-only grants cannot acquire page editing through purpose conversion. Source schemas reject caller attribution fields; revisions retain the bound user and credential. Root source `index.php` remains protected independently of editable homepage metadata.

`CompileService` provides a typed `prepare` contract (`request_id`, `base_draft_version`) and the ordinary immutable change review. Studio and REST compilation share it; MCP applies through the existing reviewed change-set contract. Compilation preserves the existing source/output/storage budgets and never publishes. An unchanged compile retains success without an artificial revision or version bump.

`PageManagementService::seoRead` supplies the exact source-read gap for `_root/robots.txt` and `_root/llms.txt`: bounded UTF-8 bytes, hash/version, explicit absence, no other paths and no live-root fallback. Studio source reading shares the same method. SEO changes remain the existing reviewed structural override intent.

Verification used disposable canonical roots, copied production routers, real authentication and provider-free policy:

| Command | Result |
| --- | --- |
| `php _studio/tests/McpPagesCompileTest.php` | 68 passed (includes 33 existing file/structure router checks) |
| `php _studio/tests/AgentPagesRevisionTest.php` | 38 passed |
| `php _studio/tests/McpSiteStructureTest.php` | 58 passed |
| `php _studio/tests/McpChangeSetTest.php` | 38 passed |
| `php _studio/tests/McpActorPolicyTest.php` | 36 passed |
| PHP syntax checks of 19 affected sources/helpers | Passed |
| `git diff --check` on owned paths | Passed |

The page revision regression now tests explicit agent/editor account attribution, rejected spoofed attribution, current account demotion, preserved redo history, exact before captures, foreign keys and no artificial API user. OpenAPI Pages/Compile documentation reflects strict identity/version/hash inputs and retained operations. Existing Studio page-write UI callers were absent; the shipped page modal, board selector and designs view consume the observational lists.

All live fixture bytes remained unchanged. No provider, external delivery, persistent installation migration, commit, deployment or new browser qualification occurred. Core catalog binding and whole-application wire regression are owned by the root integration task and are not inferred from these focused tests.
