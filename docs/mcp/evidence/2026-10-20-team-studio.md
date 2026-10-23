# Team administration through shared approval services

Studio's Team adapter now uses `AdministrationService` and the retained owner approval store for create, update, password reset, and remove. A direct owner form submission prepares, approves, and applies the exact submitted fields. External connections still require a separate owner approval. Responses preserve the existing `member`, `deleted`, and password-reset `message` fields and add operation identity and exact member versions.

Fresh reviews validate current account state before retaining a plan. Retried operation identities resolve the original result before fresh duplicate-email or version checks, while apply rechecks current authorization and versions. Removed accounts retain inactive history identity. Passwords are encrypted in retained reviews and never returned in review responses.

The Team UI captures the version the owner actually viewed. A conflict preserves typed input and offers an explicit discard-and-review action; it never silently updates a precondition and retries. Lost responses retain request identity. Write-only passwords remain out of session storage. The UI handles paginated pinned inventory, provides labeled dialogs and errors, traps keyboard focus within a dialog, and restores focus after dismissal or row refresh.

Verification on October 20, 2026:

- `McpAdministrationTest.php`: 33 checks, including early stale-review rejection, a post-review race, owner protections, replay, and revoked credentials.
- `McpTeamRoutesTest.php`: 15 copied-endpoint HTTP checks with disposable database/workspace roots. Includes create/replay, stale edits, password reset/session revocation/replay, removal/replay, owner and role restrictions, and unchanged website bytes.
- `McpTeamUiTest.mjs`: 6 checks for captured versions, required account reads, password-safe pending input, pinned pagination, inventory conflict, and real client lost-response identity reuse.
- Browser component fixture loaded the actual Team and Connections source modules and shipped CSS. Observed: name focus on opening, both Tab directions wrapping, stale save retaining text and focusing the error, explicit discard loading current account, successful subsequent save, and focus returning to its row.
- Connections approval cards displayed exact effects and requesting identity. A seeded, already-created disposable credential could be claimed once, appeared in a masked password field with focus, and disappeared after dismissal; focus returned to Connection name. No real credentials or user data were used.

Screenshots: `/private/tmp/voxelsite-team-conflict.png`, `/private/tmp/voxelsite-team-reviewed.png`, and `/private/tmp/voxelsite-connections-approvals.png`.

Browser review was at an observed 1222-pixel desktop viewport. Small-screen behavior is not verified: this browser did not expose a working viewport resize capability. Component review does not establish a full installed-app or production hosting qualification.
