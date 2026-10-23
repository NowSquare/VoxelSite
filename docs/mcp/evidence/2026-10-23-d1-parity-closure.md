# D1 shared-contract parity evidence — 2026-10-23

The manifest records **217 focused verified mappings and 52 explicit boundaries** across 269 active route/workflow rows. This closes95previously pending/implemented mappings;131historical verified rows retain their original evidence. It does not claim a final full-matrix or named-client qualification.

## Completed runs

| Run | Runtime | Result | Source SHA-256 |
|---|---|---|---|
| adapter82 | PHP8.2.35 | 14/14 suites exit0 | `37fc916dbc7ec2966d85bf6308c7819edd232674649f30d68d86b869f676c973` |
| adapter85 | Herd PHP8.5.12 | 14/14 suites exit0 | `37fc916dbc7ec2966d85bf6308c7819edd232674649f30d68d86b869f676c973` |
| navigation82 | PHP8.2.35 | 6/6 suites exit0 | `087efd001acdfe8339a9752ceaad75681ef935ec3208092cd24647dc447bd18a` |
| navigation85 | Herd PHP8.5.12 | 6/6 suites exit0 | `087efd001acdfe8339a9752ceaad75681ef935ec3208092cd24647dc447bd18a` |
| mapping82 | PHP8.2.35 | 45/46 suites exit0 | `3610cf6b58e899431bad7d27c8876a4dd048f909e21b6c4105c4f8a97cd8adfa` |
| mapping85 | Herd PHP8.5.12 | 45/46 suites exit0 | `3610cf6b58e899431bad7d27c8876a4dd048f909e21b6c4105c4f8a97cd8adfa` |

The final mapping run has one known failure on each runtime: `McpConnectionTelemetryTest.php` copies the1.33.0 qualification record but its positive oracle calls `ClientQualification::load('1.32.0', ...)`. Version mismatch remains an honest unqualified result. The failure and PHP fatal assertion are retained; these runs are not called green. Earlier adapter14/14 and navigation6/6 runs have no PHP diagnostics.

All runs used outer disposable source copies. The owner then stopped further edits/tests for release finalization. No new test, lint or release gate was run after the manifest/documentation writes. See the JSON for exact file hashes, each exit status, source identity and retained logs.

## Exact mappings and boundaries

- New typed pure reads cover local model budgets, latest external activity, exact five-state navigation preflight and bounded account-scoped native historical plans/mutations. Ready native plans convert through pure PatchExecutor into normal immutable change reviews under the common lock.
- Actual owner HTTP cases cover observational publication diff, reset review/approval/checkpoint/replay/recovery and factory review/discard. Actual update HTTP cases cover multipart, upload limits, local Git staging and retained identity before activation.
- Published visitor data/catalog stays a public-interface boundary. Existing REST routes still authenticate their own audience; they are not private files_read aliases. Owner activation/disable/status, secret delivery and factory completion remain session boundaries.
- Eleven authoring and eleven visual cases passed464checks and22scripted HTTP outcomes/revisions on PHP8.2.35/8.5.7, zero provider/Router dispatch. Full rule/brief reconstruction, exact review/diff, apply/continuation/replay and source/version/live assertions are retained. These establish supported outcome equivalence, not external model generation, generic DOM selectors or browser design acceptance.
- Early-MCP migration/public data, REST business branches, public publish schema and authoring-only published-restoration refusal have independently retained D1 records linked below.

## Discovery size

Discovery retains full inline input/output schemas and standard annotations. No capabilities, permissions or validation were removed to reduce size. Per-grant/per-protocol serialized body, tool and field sizes plus bounded context/rule reconstruction are stored in the JSON. Native client usability is a separate qualification.

## Source review

The19stale route/UI source digests were refreshed only after branch review, including the corrected REST publish schema and exact navigation contract. Collections/Contacts remain unshipped with future-feature gates. The machine-readable JSON contains all95row changes and their exact tool/test mappings.

Related evidence: [public data and migrations](2026-10-23-d1-public-boundary.md), [business REST](2026-10-23-d1-business-rest.md), [REST publish schema](2026-10-23-d1-rest-schema.md), [restoration privacy](2026-10-23-d1-restore-boundary.md).

The final manifest and docs are saved. Their post-edit release gate, a combined final-source full matrix and native-client qualification are not asserted by this record.
