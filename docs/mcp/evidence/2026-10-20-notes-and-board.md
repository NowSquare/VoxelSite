# Notes and board shared services

Local development evidence, 2026-10-20. This does not qualify a production installation or an external client.

## Shared behavior

`NoteService` and `BoardService` now serve MCP and the Studio notes/cards HTTP adapters. Private notes remain scoped to their user, with explicit notes access. Shared board access has separate grants; the viewer role can read the board but cannot write or read private notes. Note promotion requires permission to read the source note and its current version.

Each mutation requires a request identity. Updates, trash, restore, archive, and deletion require the canonical hash of the record read by the client. Moves also require the displayed board ordering hash. The record write and exact replay response commit together in one SQLite transaction. Current authorization is checked again on replay.

Migration 029 adds `notes_board_requests`. Results expire after seven days. Explicit writes reclaim at most 100 expired payloads per transaction; identity/digest tombstones remain so a delayed retry cannot recreate deleted data. Receipts are bounded to 10,000 per actor and 100,000 total, with 64 MiB per actor and 512 MiB total retained payloads. These are hard storage limits, not an automatic deletion of request identities.

Lists use pinned collection versions and bounded summaries. Full reads preserve exact Unicode text. Each collection is bounded to 5,000 records and 32 MiB of title/body text; individual bodies are limited to 64 KiB. Existing IDs, note promotion metadata, pin limits, card order, original-column archive restoration, and the 30-second note undo window remain supported. Reading notes, searching, and listing never purge trash.

No notes or board operation changes website draft versions or live files, invokes a provider, or implicitly broadens website authoring scopes.

## Studio behavior

`business-workspace.js` retains original record versions and unsaved local fields in memory. It serializes writes and retries the exact original identity after a lost response before saving newer typing. An account change clears private cached state. Private text is not saved in browser storage.

The notes editor reads full detail before opening, promoting, or using a list item as prompt text. Markdown preview retains the complete body during autosave. Card text is flushed before changing columns, archiving, deleting, or navigating. An unresolved conflict blocks navigation and keeps local text visible. Loading a saved version requires explicit review; typing during that review invalidates the discard choice. The action itself never writes. Column and linked-page selectors have associated labels.

## Verification

- `php _studio/tests/McpNotesBoardTest.php`: scoped CRUD, Unicode search, bounded summaries, pin limits, cross-client stale edits, move ordering, archive/undo, expired trash, retained retries, current authorization, and unchanged draft/live state.
- `node --test _studio/tests/McpNotesBoardUiTest.mjs`: 17 focused state tests for pagination, captured versions, in-flight typing, lost-response identities, promotion, explicit conflict review, and account switching.
- `php _studio/tests/McpNotesBoardRoutesTest.php`: 16 checks through copied production endpoints and a fresh temporary database. The loopback listener requires the supported sandbox escalation. No installed database is read or migrated.
- The four existing notes/cards creation fixtures in `SiteMutationRoutePolicyTest.php` now supply stable request IDs. The conversation-history fixture subsection belongs to its separate repair tranche.

## Disposable browser review

`McpNotesBoardRoutesTest.php --browser` serves copied production view modules and shipped CSS with real isolated notes/cards endpoints. It has a synthetic owner and no real credentials, providers, or installed site state.

Observed:

- Saving a note while Markdown preview is open preserves the complete text through navigation.
- A simulated external note edit causes the stale browser save to fail. The exact local body remains on screen, and navigation is blocked.
- The saved-version review displays the saved text; explicit acceptance loads it. Note promotion copies that full version to the shared board.
- Editing a card body immediately before selecting another column retains the body.
- Archive and Undo restore the same card in its original column.
- The final card view exposes accessible Column and Linked page selector names.

Screenshots: `/private/tmp/voxelsite-notes-conflict-review.png` and `/private/tmp/voxelsite-board-reviewed.png`.

The browser viewport override had no effect on this connection, so this record makes no mobile verification claim. The override was reset. Browser fixture controls are test-only. Broader application and connection UI evidence is recorded separately.
