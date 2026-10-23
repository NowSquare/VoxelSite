# Studio authoring adapters — 2026-10-20

Studio file writes now prepare exact private bytes through `StudioAuthoringService`, `ChangeSetService::prepareFiles`, and `ChangeSetExecutor`. The canonical authoring rules resolver supplies the retained rules digest. Saves/deletes require the displayed content hash and draft version; create requires a captured draft version and explicit absent hash. Compile accepts no arbitrary source operations. Every write requires a caller operation identity. A sealed empty effect retains success after source verification without creating a revision or advancing the draft version.

The five deterministic Site Control mutations delegate to `SiteStructureService`. Their response labels and moved/deleted identities derive from the retained projection. The router exempts only these shared adapters from its older outer mutation lock/journal; the executor owns the canonical lock, reservation, checkpoint, and recovery. Provider orchestration remains separate. Graph reads use a bounded workspace snapshot and return a draft version without synchronizing SQL page records.

The editor captures source versions, retains dirty buffers, and sends stable operations. Visual transforms bind saves to the exact read they transformed. File create/delete/compile use captured inventory versions. Structural controls preserve their loaded graph version and resume the same retained body after an uncertain response. Raw edited source is not retained in browser session storage. Existing pending legacy structural journals retain their read-only recovery path.

Verified on disposable roots, with provider calls forbidden for routed requests:

- `php _studio/tests/McpStudioAuthoringTest.php`: 14 checks.
- `php _studio/tests/McpStudioAuthoringRoutesTest.php`: 33 total checks (includes those 14), using copied production router/middleware/endpoints. Includes a structural change exceeding 20 files, explicit continuation, incorrect checkpoint rejection, mixed-state graph refusal, all five structural routes, source/version CAS, replay, and unchanged live bytes.
- `php _studio/tests/McpChangeSetTest.php`: 38 checks.
- `php _studio/tests/McpSiteStructureTest.php`: 58 checks.
- Node `McpStudioAuthoringUiTest.mjs`, `SiteMutationUiTest.mjs`, `McpWorkspaceUiTest.mjs`: 24 checks.
- Root reported `ExternalOnlyInstallTest.php`: 78 checks after integrating the new file request contract and current connection identity fields.

Not claimed: browser visual qualification of these latest adapter changes; subdirectory SPA qualification; updated production bundle until lead rebuild; full legacy structural-suite qualification.

The older suites `SiteControlPageRenameTest.php`, `SiteControlPageDeleteTest.php`, `SiteControlNavReorderTest.php`, `SiteControlStructuralMoveTest.php`, and `SiteControlUrlRenameApplyTest.php` require explicit test-contract migration. Their helpers `call-nav-endpoint.php` and `call-site-control-endpoint.php` still send unversioned bodies without caller identities. They also assert legacy snapshot IDs, bespoke validation codes, and old endpoint-specific forced-failure environment hooks. Those assertions were not relabeled passing or removed. Their semantic scenarios need migration to the current sealed review/operation result and shared runner fault-injection contract. The shared runner and new copied-router tests provide focused current evidence, not a substitute claim that all old tests pass.
