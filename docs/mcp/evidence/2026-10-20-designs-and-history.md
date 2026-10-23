# Designs, revisions, and Studio history

This records local verification of T11/T16 services and adapters. It does not qualify the full MCP milestone or a deployed host.

Saved designs now capture private PHP, CSS, JavaScript, structured data, and form definitions through a bounded retained operation. Loading or starting a design uses a sealed restoration plan; newer uploaded images/files/fonts/media remain in the private draft. Published files remain unchanged. Legacy archives report their known draft domain and format, and unsupported formats fail before mutation. Design deletion hides unprotected archives while retaining their bytes; active and referenced designs cannot be deleted.

Reviewed undo/redo pins the active revision head, source captures, page/collection projection, and active-design state. A replay returns the retained transition result. Restoring from an undone head archives the abandoned branch rather than making it part of active redo navigation. Ordinary divergent edits cannot redo the discarded branch.

Unpublish has its own `unpublish:write` authority for the existing owner/editor roles. It reviews exact offline bytes and removal of managed release files, retains a live safety archive, and preserves unrelated hosting files, private draft files, page metadata, and revision state.

Studio uses the same services through `WebsiteHistoryService`. History lists retained captures, releases, restoration safety archives, and legacy archives with stable pagination. Restore explicitly selects draft, published, or both; a file review precedes apply. The shared UI operation helper retains the request identity through lost responses, advances only explicit checkpoints, stops after 100 continuation requests, and preserves `recovery_required`. A reopened restore dialog resumes the same sealed plan. When browser storage is disabled, the open tab retains identity in memory; persistence across closing that tab is unavailable.

Verification on disposable fixture roots:

- `McpDesignHistoryTest.php`: 31 checks.
- `McpRestoreTest.php`: 65 checks, including real SIGKILL at capture, file replacement, projection, and commit boundaries.
- `SiteRevisionContractTest.php`: 11 checks.
- Snapshot ownership, retention, and recovery suites: 13, 34, and 18 checks.
- `McpHistoryUiTest.mjs` and `SiteSnapshotUiTest.mjs`: 10 checks.
- PHP syntax checks and `git diff --check` passed.

No provider or external transport was invoked. The 2,075 generated-site file hashes match the retained post-recovery baseline without additions or removals. The pre-existing `_studio/preview/assets` symlink retains its March 21 birth/modified time and was not migrated by these tests. Earlier `style.css` recovery remains a reconstruction from retained design bytes, without a preincident hash; this verification does not establish an exact preincident restoration.

Modern design/snapshot/restore archives are retained and quota bounded. Automatic deletion of protected history is not claimed. Browser rendering on a deployed shared host and the final bundled Studio build remain separate qualification steps.
