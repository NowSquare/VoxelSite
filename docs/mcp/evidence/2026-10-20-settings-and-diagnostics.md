# Settings and diagnostics verification

T21 uses shared services for typed configuration, favicon, diagnostic history/logs, and versioned prompt overrides. Studio and REST adapters call these services; the management catalog is wired separately in `McpApplication`.

- Settings accept registered groups and validated fields. Owner authority remains required for configuration writes. Secrets are write-only, encrypted with the existing format, and reported as configured booleans. Public operation records exclude plaintext and encrypted credential values. Studio persists only operation identity and public reviewed versions across reloads.
- Settings changes retain one operation identity and check reviewed versions. Metadata operations skip legacy website recovery gating but still use the common lock and reservation. They return `site_busy` while another retained website operation is active.
- The favicon is explicitly immediate live configuration at the fixed `favicon.ico` path. Its reviewed bytes, version and rollback use the same common lock; draft files remain unchanged.
- Mail tests disclose the recipient and persist dispatch intent before sending. A positive transport result means accepted, not delivered. Interrupted dispatch returns unknown without another send.
- Logs are capped at 256 directory entries and 8 MiB per readable source. Redaction covers the complete bounded source before pagination or download. History is account scoped, paginated, and bounded by encoded response size. GET history does not repair files, update generation status or compile CSS. Explicit repair/cancel/deletion operations carry reviewed versions.
- Prompt edits create versioned custom overrides; reset removes the override. Shipped prompt files remain unchanged.
- Existing REST settings writes now require `operation_id`, `values` and reviewed group `versions`. The owner-bound REST settings purpose permits only registered identity, navigation and retention fields. It grants no provider-secret, mail or Router administration.
- Provider tests, model discovery and generation remain separate Studio actions. These services make no provider calls.

Verified on disposable, canonical temporary roots with all test root overrides:

| Check | Result |
| --- | --- |
| `McpSettingsDiagnosticsTest.php` | 40 passed |
| `SiteMutationRoutePolicyTest.php` | 47 passed |
| `RouterSettingsTest.php` | 207 passed |
| `ModelCapabilitySettingsTest.php` | 31 passed |
| `PromptContractTest.php` | 232 passed |
| `McpNoProviderCallsTest.php` | 186 passed, loopback dispatch traps only |
| `McpHistoryUiTest.mjs` and `SiteSnapshotUiTest.mjs` | 11 passed |
| PHP lint / changed UI syntax / `git diff --check` | Passed |

The no-provider suite used only local interception servers. Mail delivery was represented by an injected counting transport; no external mail was sent. Tests did not change the installed site or settings. The retained post-recovery manifest covering 2,075 installed asset/preview files matched exactly after this work (zero additions, removals or hash changes). This does not change the separately recorded uncertainty about the earlier reconstructed `style.css`.

This evidence covers the named services and checks, not completion of the full parity milestone.
