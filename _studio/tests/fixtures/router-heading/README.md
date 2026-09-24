# Governor heading proof — frozen fixture v1

Binding scope: `.ai/VoxelSite-30001-Router-Plan.md`, release target **1.31.0**.
The original pre-implementation freeze was not recorded in Git. The review
checkpoint now commits the existing bytes separately from the production proof;
it does not retroactively establish that earlier chronology. `freeze.json` records
the reviewed fixture/harness hashes before benchmark corrections. `fixture.json`
records exact starting-file SHA-256 hashes, prompt, target source/hash, trusted
facts, candidate and expected apply/reject cases. `expected-index.php` is the
exact accepted output. Fixture edits require an explicit version/change note;
do not update expected bytes just to make an implementation pass.

Git checkpoint: `246c5936ba78cb5e57f4f67cc862196f31cf2454` (parent:
`5053182d498917de477362f83948955a3456a872`). Its 17 files contain the fixture,
tests, harness, and freeze manifest; no production engine changes. The 16 hashes
in `freeze.json` describe blobs **at that commit**, including the original harness.
Subsequent benchmark corrections are separate changes. The seven starting files,
prompt/case manifest, and accepted output remain byte-identical to the checkpoint.
The checkpoint can be inspected without relying on the current working tree:

```sh
git show --stat 246c5936ba78cb5e57f4f67cc862196f31cf2454
git show 246c5936ba78cb5e57f4f67cc862196f31cf2454:_studio/tests/fixtures/router-heading/freeze.json
```

Run from the repository root:

```sh
php _studio/tests/RouterHeadingPatchTest.php
php _studio/tests/RouterHeadingBenchmark.php
php _studio/tests/RouterHeadingBenchmark.php --legacy-only
```

The legacy benchmark copies current engine/prompts/static handlers into a
random temporary application, creates a fresh SQLite schema, and calls the real
`PromptEngine::execute()` with an `AIProviderInterface` fake. It never opens a
customer database or calls a network provider. The Governor comparison uses the
same starting files and request, a canned text candidate and a fake claim gate.
All temporary applications/sites are removed after the run.

The report separates routing/generation/gate/repair calls, tokens, nullable cost
and local fake-call duration, with retry/repair counts and task completion. No
repair loop runs here: its usage bucket is explicitly zero in every row. Tokens use
`ceil(bytes / 4)` over actual fake inputs/outputs, not a provider tokenizer.
No historical averages are substituted. Routing is not implemented in this
proof and is reported as zero calls. Claim rejections are `reject-correct` and
never enter savings comparisons. Canned output does not establish live quality,
Jev accuracy, model latency, or the program's 50% production stop-rule result.

## Legacy completion and derived artifacts

Before and after the real legacy call, the harness hashes every preview file,
shared asset, and public output file. Report paths use `preview/`, `assets/`, and
`public/` prefixes to distinguish duplicate filenames. Only disposable runtime
files (`_studio/` outside preview, the vendor loader, and the fixture marker) are
outside this comparison. Additions and deletions count as changes too.

`preview/index.php` is the selected target. Legacy success requires the expected
heading, removal of the old heading, and a successful engine result. Legacy's
existing target normalization (stylesheet/script injection) remains allowed;
the staged proof separately requires byte-exact output. The following are the
**only** allowed non-target changes, listed under `file_changes.derived` with
before/after SHA-256 hashes and the applied rule:

| Exact path | Allowed operation | Source of legacy side effect |
| --- | --- | --- |
| `assets/css/tailwind.css` | Create or rebuild; never delete | `TailwindCompiler` |
| `assets/js/icon-resolver.js`, `assets/js/navigation.js` | Create only | `FileManager` shipped handlers |
| `preview/_partials/schema.php`, `public/_partials/schema.php` | Create only | `AEOGenerator::generateAll()` |
| `public/llms.txt`, `public/robots.txt`, `public/sitemap.xml`, `public/mcp.php` | Create only | `AEOGenerator::generateAll()` |

All other changed paths, including existing source files at create-only derived
paths, are `file_changes.unexpected`. Any such change makes completion `wrong-file`
even with a correct heading, sets `savings_eligible` to false, excludes the baseline
from comparisons, and makes the benchmark exit 1. No wildcard directory exemptions.
This is a fixture-specific accounting rule, not a production authorization policy
or validation of generated artifact contents.

The benchmark test injects unrelated preview additions/edits/deletions, a shared
data-file edit, and a public-file addition after both legacy actions. It also runs
the report with the test-only `--legacy-fault=preview-change` option to verify that
incorrect baselines cannot yield savings, and checks derived overwrite/deletion
restrictions. These faults only touch disposable applications.

## Proof boundary

Phase 5 connects `GovernorHeading` and `StagedHeadingPatch` to the shared
`PromptEngine::execute()` entry point for one uniquely selected literal heading
in `enforce` mode. Phase 6 adds deterministic replacements and read-only question/noop
outcomes below. Other enforce actions/routes refuse explicitly. Fresh/off
stays legacy with zero Jev calls; shadow remains observational. Missing active keys
refuse generation. No route chips or settings UI is added. The Phase 6 fourth slice
below adds owner-override API wiring without UI. The later Phase 6 repair
slice below adds the bounded generated-candidate repair loop. Production route/gate transport uses the existing TypeSafe adapter;
all verification commands below inject fakes and make no live provider calls.
`VERSION` stays 1.30.0 until a release is cut; this proof targets 1.31.0.

The contract accepts a code-allowlisted existing PHP page path (including nested
pages), an exact unique literal `<h1>`–`<h6>` address, its SHA-256, and diagnostic
base revision. Plain text only; PHP-generated headings and child markup need a
later target resolver. Generator chunks stay in memory. Candidate validation and
the injected typed claim gate run before the FileManager factory is invoked.
Missing/malformed/non-finite gate answers and generation failures refuse apply.
The candidate text is HTML-escaped; original tags, attributes and all other bytes
are preserved. Heading copy does not require CSS or AEO work.

Before applying, the implementation rechecks the **whole file** as well as the
initial span. This conservatively rejects intervening changes elsewhere in the
same file too. `FileManager::writeGovernedFile()` verifies canonical target identity
and the file hash again, bypasses legacy autofix, validates PHP without execution,
and atomically replaces the accepted file. No revision history is integrated yet.

The advisory lock does **not** serialize existing legacy writers that ignore it,
and an external writer can still race the final check/rename. This is a tested
staged-patch proof, not a claim of full concurrent-editor transaction safety.
Phase 5 retains that concurrency limitation and deliberately returns no revision
ID; it does not claim revision/undo support. The HTML check is conservative static source analysis,
not a general browser DOM/source mapping or arbitrary-PHP sandbox.

Additional checks:

```sh
php _studio/tests/RouterHeadingBenchmarkTest.php
php _studio/tests/RouterSettingsTest.php
php _studio/tests/TypeSafeClientTest.php
php _studio/tests/RouterShadowTest.php
php _studio/tests/PromptContractTest.php
php _studio/tests/AICallLedgerTest.php
php _studio/tests/RouterLedgerIntegrationTest.php
php _studio/tests/RouterGateLedgerTest.php
php _studio/tests/RouterHeadingServiceTest.php
php _studio/tests/RouterEnforceTest.php
php _studio/tests/RouterDeterministicPatchTest.php
php _studio/tests/RouterOutcomesTest.php
php _studio/tests/RouterRepairBudgetTest.php
php _studio/tests/RouterRepairTest.php
php _studio/tests/RouterAgentContinuationTest.php
php _studio/tests/RouterClaimOverrideTest.php
php _studio/tests/RouterOverrideConcurrencyTest.php
php _studio/tests/RouterPendingHeadingTest.php
php _studio/tests/RouterOwnerEndpointTest.php
```

The tests inspect the complete temporary site during generator chunks and inside
the gate, assert no FileManager construction before acceptance, check exactly one
accepted apply, and preserve CSS/data/discovery/unrelated-page bytes. Regressions
also cover PHP islands inside comments/scripts, symlinks, malformed gate trees,
a late writer-boundary edit and a writer pointed at the wrong preview root.
The benchmark child pins its paths and checks that application classes were loaded
from its disposable copy, even when the caller has existing test-path overrides.

## Phase 2 configuration boundary

`GovernorSettings` validates configuration. Phase 3 consumes it during generation;
Phase 5 enables the bounded enforced heading path described below.
Missing/deleted/corrupt keys in stored shadow/enforce mode are reported as
`governor.configuration_error` in Studio and Agent settings reads; those reads
retain the active mode, never silently report `off`.

The existing authenticated, CSRF-protected Studio `PUT /settings` accepts:

- `governor.mode`: `off`, `shadow`, or `enforce`; absent defaults to `off`.
- `governor.typesafe_api_key`: a write-only token, encrypted with the existing
  server APP_KEY. Omit to retain it. Null/empty removes it; active mode requires
  `governor.mode=off` in the same request before removal is accepted.
- `governor.model_map`: empty to clear, or exactly `cheap` and `frontier`, each
  containing only `provider` (one of the five existing IDs) and `model` (an ID).
  Credentials and provider base URLs are not permitted in this map.

Only the owner may mutate these fields. Unauthorized mixed requests return 403
without saving even ordinary fields; validation errors return 422 and configuration
errors return 409, also without writes. Agent settings mutation keeps its existing
allowlist and cannot configure Governor. No PATCH route or new endpoint is added.

`Settings::getAll()` excludes the TypeSafe field entirely. Explicit server `get()`
can read its ciphertext; generic Studio/Agent reads cannot. Both settings responses
include boolean `governor.typesafe_configured` (stored-key presence, not remote key
validation). The five existing generator keys remain masked on Studio GET.
Named TypeSafe fields and values registered during configuration access are
redacted before Logger serialization and `prompt_log` insert/update, including
JSON action data and exception messages. This is not universal detection of an
unknown secret pasted into arbitrary text. The Phase 3 adapter registers its
credential before diagnostics. No raw credential is added to prompt state.

`RouterSettingsTest.php` uses random synthetic values in disposable databases;
it neither reads installed config nor calls a network provider. Its real endpoint
dispatch supplies router identity and config, while Agent PUT uses a child-only
input stream. Auth/session/CSRF middleware is unchanged. It tests ownership,
atomic failures, modes/maps, encryption errors, key exclusion, log persistence,
and byte-identical legacy files and generator requests for fresh/off installs.

## Phase 3 shadow boundary

`PromptEngine::execute()` checks configuration before registering legacy shutdown
recovery. Missing/deleted/unreadable active keys produce `governor_configuration`.
Studio receives a readable SSE error; Agent/headless jobs store a terminal error.
Phase 3 originally refused all configured enforce requests. Phase 5 replaces only
that temporary refusal with the bounded heading path; it never falls back to legacy.

In shadow, `GovernorShadow` runs after conversation ownership validation and
before provider creation, context building, revisions, or generation writes. The
default `SiteContext` is now constructed lazily at the existing build point.
Off never constructs a TypeSafe client or calls Jev. Shadow observes once, stores
typed answers or a fixed failure, then runs the unchanged generator path. Even a
contradictory answer, outage, or malformed response cannot change generator inputs,
model selection, or generated output. There is no RoutePolicy application yet.

Observations live in `prompt_log.action_data.governor_shadow` and a `governor` log
entry: answers, model, response usage, nullable cost, duration, request count,
fixed errors, state hash, and versioned threshold values. They are kept out of the
action data passed to prompts/providers and retained when design-direction metadata
is saved. Phase 4 adds a `call_id` reference to the canonical ledger row below;
this observation must not be counted as another call.
The existing heading benchmark still runs off and reports zero routing calls;
`GovernorShadowTest` separately verifies the shadow call and stored observation.

Lightweight state includes at most 4,000 request characters, an 80-character action,
100 page IDs/titles (160 characters per title), and site name/tagline (200/300).
A target is emitted only for an explicit canonical PHP path with one unique
literal heading selection (up to 1,024 bytes) in a file up to 256 KiB. Code supplies
`target_0`, source address, and span hash. Unresolved selections supply no target;
the model can choose only `none` or code-supplied IDs. No path is guessed from a
slug. No full page, sectionHtml, settings map, CSS, images, or submissions are sent.
This heading resolver is observational and does not authorize any legacy write.

`TypeSafeHttpClient` follows the official [API](https://docs.typesafe.ai/api) and
[primitives](https://docs.typesafe.ai/primitives): fixed HTTPS System One endpoint,
Bearer header, `jev-latest`, typed Choice criteria and Noul questions. Noul has a
probability and no invented confidence. This adapter supports the routing subset
(Choice/Noul); Phase 5 reuses Noul for the claim gate, while Score remains outside
this slice. It validates
all requested answers, option probabilities, and nonnegative integer token usage;
unrelated response fields and raw error bodies are discarded. Cost stays null.
Production transport verifies TLS, disables redirects, limits requests to 32 KiB
and responses to 64 KiB, and makes one attempt with a 1-second connection timeout
and 5-second total timeout. Shadow may therefore add up to that transport wait;
it is not an asynchronous background classifier. Live service behavior is UNVERIFIED.

`TypeSafeClientTest` injects HTTP replies without network access. `GovernorShadowTest`
uses the real adapter over `FakeTypeSafeTransport` and the real PromptEngine over
the generator fake, for inline/section edits and both new and preallocated prompt
rows. Preallocated jobs enter in `streaming`, matching the worker handoff. It
compares exact generator requests and complete output hashes against fresh legacy,
excluding only measured durations. It checks no context build/revision/site change
before classification, stored observations, and secret absence in calls, prompt
rows, and logs. Separate interactive cases parse actual SSE error payloads. Site
hashes are taken after engine shutdown callbacks to catch late mutation on refusal.
Provider-construction ordering is established by the code placement; tests inject
an already-created generator fake. These fixtures do not measure live Jev accuracy,
network latency, production pricing, or the release's generation-token stop rule.
All synthetic secrets are random at runtime in disposable applications; none are
stored in the frozen fixture or committed configuration.

## Phase 4 call ledger

Migration `007_ai_call_ledger.php` adds one metadata-only SQLite table,
`ai_call_ledger`, through the existing Migrator. The migration's schema version is
1.31.0; the application `VERSION` stays 1.30.0 until release. No schema changes
are attempted by a provider call. Tests apply migrations only in disposable data.

`AICallLedger` records an opaque random call ID, nullable `prompt_log_id`, kind,
method, provider, model, status, input/output tokens, nullable cost, duration,
fixed error code, and start/finish times. Kinds are `classify` (TypeSafe routing),
`generation` (generator stream/complete, including legacy planning/evaluation),
`gate` (injected claim evaluation), and `repair` (existing syntax repair).
Methods are `evaluate`, `complete`, and `stream`. Each logical method invocation
starts one `running` row and updates it once to `success` or `error`; repeated
finish calls cannot overwrite a terminal row. Prompt deletion retains the record
with a null link. There is no new public ledger endpoint or UI.

This counts **logical method calls**, not hidden provider HTTP attempts. Existing
structured-output fallback retries remain inside that logical call; their number
and per-attempt usage are not exposed by `AIProviderInterface` and are not claimed.
The wall-clock duration includes callback work for stream calls, so it is not pure
model latency. A killed process can leave `running` rows; no recovery result is
invented. Missing schema or persistence errors emit a fixed warning and preserve
legacy execution. Such failures can leave gaps; this is not a billing-grade ledger.

`LedgeredAIProvider` forwards exact arguments, response text, callback payloads,
and original exceptions. `AIProviderFactory::create()` wraps normal production
providers; PromptEngine binds both factory-created and injected providers to its
prompt row without nesting duplicate wrappers. Thus evaluator, critic, and syntax
repair `complete()` calls are covered, along with standalone IntentClassifier and
PlanBuilder calls created by the factory. Standalone orchestration has no prompt
job and keeps a null link. Connection-test providers from `createWithKey()` are
not generator calls and are not wrapped. Raw provider objects used directly by
other callers require an explicit wrapper.

`complete()` returns only text in the current interface: its token usage and cost
remain null, with no token estimate substituted. Streams retain positive counters
and the provider's reported model. All five legacy providers can use zero counters
when upstream usage was absent, so stream zeros conservatively become null **only
in the ledger copy**. This loses knowledge of a genuine zero but avoids claiming
an unmeasured call was free. Typed TypeSafe usage can retain an explicit zero.
Costs remain null unless explicitly supplied as numeric `cost_usd`; no estimator
or pricing lookup runs. Production provider streams do not currently supply cost.

Shadow allocates its prompt row before classification, records exactly one
classify result/failure, and stores its call ID in the observation. Off produces
generator accounting but zero Jev calls/classifier rows. Configuration refusals
and unsupported enforce remain unable to reach generation. `StagedHeadingPatch`
accepts an optional ledger for the isolated proof and requires a healthy one in
Phase 5 production enforcement. Generation and gate attempts retain their
before-write ordering. Generic injected gates default to unknown provider/model;
the production caller supplies `typesafe` / `jev-latest` and a successful response
can supply the resolved model. A valid forbidden-claim answer is a successful gate
call even when apply is rejected; malformed answers and exceptions are call errors.
Invalid candidates never call the gate and produce no gate row.

No prompt, state, page source, candidate, response body, Authorization header, or
raw exception field exists in the ledger. Identifiers and numeric values are
validated; known registered secrets are excluded. Core tests use random runtime
secrets, an in-memory database, exact argument/exception checks, and missing-schema
faults. Integration tests inspect real PromptEngine rows for both Studio allocation
and preallocated Agent jobs, including an evaluator's caught complete exception.
Gate tests inspect the running row inside the callback and unchanged site hashes
before acceptance. Existing settings, shadow-equivalence, staged-write, wrong-file,
and benchmark suites must continue to pass alongside these checks.


## Phase 5 enforced heading integration

The shared Studio/Agent `PromptEngine::execute()` branches before constructing
its default FileManager/RevisionManager or installing legacy shutdown recovery.
`GovernorHeading` accepts writes only through `inline_edit` / `section_edit`, a registered
`pages.file_path`, and one exact literal heading selection. Nested page paths work.
If both `selection` and `sectionHtml` are supplied, they must agree; an entire
section or browser-rewritten HTML is not silently treated as a source address.
No source path comes from Jev. A supplied span hash must match; the whole-file hash
is captured before routing and checked again before generation and apply. Phase 6
also permits read-only `free_prompt` requests without a file target.

Requests must be nonempty valid UTF-8 text of at most 4,000 characters. Oversized
requests are refused, not truncated. Generated heading routing requires `edit_copy`, `one_section`,
`repair_target=target_0`, `model_tier=cheap|frontier`, and Choice confidence >= 0.80
for every consumed Choice. `needs_file_write` must be >= 0.65 and
`looks_like_prompt_injection` < 0.70. Uncertainty or another route refuses.
The cheap/frontier answer establishes eligibility in this slice; the selected
configured BYOK generator still runs. `governor.model_map` selection is not yet
wired and recorded `generation_tier` says `configured`, not a claimed tier switch.
Phase 6 adds the `none` / question / noop split below; generated-route model-map
selection and the owner-facing override workflow remain deferred; bounded generated-candidate repairs
are described in the subsequent slice below.

Generator chunks stay in memory. The prompt contains only the exact request,
selected heading text and bounded site name/tagline facts. The claim gate gets
only candidate text and those known facts. Site name/tagline are not a complete
verified business-facts registry; claim accuracy remains UNVERIFIED. A valid Noul
`forbidden_claims >= 0.60` blocks the candidate. The subsequent repair slice below permits at most two targeted repairs of a
rejected generated candidate. Deterministic replacements are never regenerated. After gate acceptance the whole-file hash is rechecked, the writer is
constructed, and `writeGovernedFile()` compares again and applies one exact span.
CSS/AEO and legacy stream writes never run on this path, even after shutdown.

Route, generation and gate receive one linked ledger row each on success. Sticky
ledger failures (including a missing/deleted row) prohibit apply. Model metadata
survives rebinding a factory-created provider. Unknown usage/cost stays null;
production SSE does not pretend the edit was free. Active key access is rechecked
before generation, gate and writer creation. Cancellation and expired/deleted job
rows stop apply; existing throttled liveness updates continue without streaming
candidate text. These checks do not create a transaction across external settings,
legacy writers and the final rename.

Success reports only that this heading was checked, with `revision_id=null`.
No revision snapshot or undo integration is added. Rejections emit a readable error
and terminal job status, with no legacy fallback. A post-apply job-recording failure
explicitly says the heading was applied; it does not report rollback or retry the
write. Hard process termination can still leave job/call metadata incomplete.
Manual edits and publishing remain outside Governor coverage.

`GovernorHeadingServiceTest` covers typed routing, malformed/conflicting answers,
thresholds, input limits, literal targets, drift, unavailable ledger at multiple
boundaries, key loss, cancellation and gate failures. `GovernorEnforceTest` runs
both actions through the real engine in disposable applications for Studio-style
allocation and preallocated Agent jobs, plus actual interactive SSE. It checks
all site hashes after shutdown, one exact accepted write, unchanged rejected sites,
preserved concurrent edits, three linked call rows, no context/CSS/revision work,
secret exclusion and honest post-apply errors.

The integration suite separately compares **matched successful** production-path
fake heading edits with the frozen legacy requests and asserts >= 50% generation
token reduction for each action. Like the original benchmark, this is a byte-count
estimate, not a live tokenizer, quality evaluation, pricing or latency measurement.
Router/gate calls are checked separately and not hidden in generation savings.
The original benchmark still runs its isolated staged proof with zero routing
calls; its existing rejection and wrong-file exclusions are unchanged.


## Phase 6, first slice — none / question / noop

Three distinct outcomes now pass through the same enforced engine branch:

- **Explicit replacement (`model_tier=none`, `intent=edit_copy`):** code extracts
  one exact replacement from the full user message. It constructs no generator,
  calls no generator and records no generation/repair ledger row. The existing
  literal-target, candidate validation, TypeSafe gate, candidate hash, cancellation,
  strict ledger, whole-file recheck and one-write path remains mandatory.
- **Question (`intent=question`):** returns `status=answered` with an actual
  deterministic answer from the bounded fact state. No generator, gate or writer
  is constructed. The only AI call is routing. Missing facts are stated explicitly.
- **Noop (`intent=noop`):** returns `status=acknowledged` and “No changes requested.
  Everything is unchanged.” It does not share the question-answer branch or silently
  skip the request. No generator, gate or writer runs; only routing is ledgered.

All consumed Choices still require >= 0.80 confidence. Read-only outcomes require
`model_tier=none`, `repair_target=none` and `needs_file_write < 0.65`; contradictory
write probability refuses instead of becoming success. The injection threshold
and active-key/ledger/cancellation guards remain in force. This slice does not
add a cheap read-only LLM; question routes requesting cheap/frontier refuse.

The explicit replacement grammar is intentionally narrow and case-insensitive:

```text
Replace the selected heading with "Fresh sourdough, every morning".
Set the selected heading to "Fresh sourdough, every morning".
```

The full message must match one of those instructions, with optional outside
whitespace and final period. The double-quoted value is a JSON string: escaped
quotes and Unicode escapes are decoded deterministically. No arbitrary quoted
substring, Jev answer, action-data replacement, extra clause or pasted instruction
inside another message supplies replacement authority. Missing/ambiguous syntax
returns an explicit clarification with an example; it never falls back to generation.
The resulting literal text must be nonblank valid UTF-8, at most 200 characters,
with no markup or control characters. Surrounding replacement spaces are preserved;
HTML-sensitive characters are escaped only when assembling the candidate source.
A registered secret embedded in the literal refuses rather than writing its value
or silently substituting a redaction marker. Identical output still makes no write
and is reported explicitly through the existing unchanged-candidate refusal.

Read-only chat may use `free_prompt`; this exposes no file targets/options even
if action data supplies a path. Writes still require the two scoped editor actions.
Scoped question/noop requests retain their existing unique-target validation.
Examples of supported deterministic questions are “What is the site name?”,
“What is the site tagline?”, “Which pages exist?” and “What is the selected
heading?”. The answer uses configured name/tagline, up to 100 registered page
IDs/titles, or the selected heading respectively. Other questions explicitly say
verified information is unavailable and list the supported facts; they do not
invent business claims or invoke a broad generator. This is a bounded English
fact lookup, not general conversational question answering.

Studio SSE and Agent job persistence keep `answered` and `acknowledged` distinct
inside `action_data.governor_enforce`. Both have a successful terminal job with a
visible `ai_response`/done message and an empty `files_modified` list. Neither emits
`file_complete` or candidate token events. Deterministic applies emit one file
completion only after acceptance. Cost remains null because routing/gating cost
is unknown; no-generation does not mean a free TypeSafe call.

`GovernorDeterministicPatchTest` verifies the shared primitive with null and
throwing generators, exact replacement bytes, escaping, gates, strict ledger
failure, cancellation, stale hashes, concurrent edits and unchanged unrelated
files. `GovernorOutcomesTest` drives the real shared engine with fake-backed
routing and both allocation styles, plus real interactive SSE, for all three
outcomes and their failure cases. Service tests also assert zero generator factory
calls and code-owned target allowlists. All tests remain offline and disposable.
Frozen Phase 0–1 prompts, starting files and expected results are unchanged;
new outcome scenarios live in tests, not edits to that historical fixture.

The first outcome slice did not include repairs. The next authorized repair slice
is documented below. The owner override backend proof follows that slice below;
the owner-facing workflow, broader failure-mode work and Studio chrome remain deferred.


## Phase 6, second slice — persistent two-repair maximum

Only generated headings can enter this loop. An `invalid_candidate` or a completed
claim check returning `forbidden_claims` permits a targeted repair; other failures
stop immediately. Each repair receives the same brief, original selected heading
and known facts, plus a fixed `repair_reason`. No rejected model output controls
a path, address, scope, prompt instruction or replacement authority. Candidate text
stays in memory and passes the same validation, gate and fresh whole-file/hash
checks. Only the final accepted candidate constructs a writer and changes one span.

Migration `008_router_job_budget.php` adds four metadata fields per prompt job:
job ID, SHA-256 target fingerprint, initial-generation-started flag and repairs-used
counter. The fingerprint binds the canonical path, exact source address, span hash
and pre-routing whole-file hash; source and candidate text are not stored there.
The internal schema revision is **1.31.0.1**, so the existing version-based Migrator
upgrades databases already at schema 1.31.0. This is a schema revision, not a product
release: application VERSION remains 1.30.0 and the release target remains 1.31.0.
The real Migrator upgrade and repeat-run behavior are tested.

Before invoking a governed provider, `AICallLedger::startGovernedGeneration()`
uses `BEGIN IMMEDIATE` to reserve the initial generation or one of two repairs and
insert its running ledger row in one committed SQLite transaction. The provider
runs after the transaction ends. A repair gets kind `repair`, never another initial
`generation` row. Failure or an interrupted/running attempt consumes its slot.
A process killed between reservation and invocation can conservatively consume a
slot without making a call; such a running reservation is not proof of billed usage.
Unknown tokens/cost remain null. Six-process contention is tested for two slots.

The counter survives new service/ledger instances, same-job re-entry,
and call-ledger cleanup. A different target fingerprint on that job refuses.
An absent budget cannot be silently recreated when prior generation/repair rows
prove the job already ran. Missing schema, failed reservations, lost accounting,
and unavailable gates refuse apply. This is not protection against an administrator
manually resetting both budget and accounting data; no reset API is introduced.

After two unsuccessful repairs, `repair_limit_exhausted` asks the user to review
the heading and revise the request. There is no third repair/provider invocation,
no partial apply and no legacy fallback. None/question/noop still use zero generator
calls and do not enter this loop. A new user job has a new allowance; re-entry into
the same job cannot relabel a repair as another initial generation. At that
checkpoint production callers had no owner override workflow or additional repair branch.

The cap covers logical targeted generator invocations. The shipped heading prompt
uses plain-text stream options; provider structured-output fallback branches are
not enabled on this path. Provider network implementations remain unchanged.
Off/shadow calls retain their existing behavior and observational ledger semantics.

`GovernorRepairBudgetTest` checks durable counters, independent instances, target
pins, errors/running slots, failed ledger insertion/counter update, missing budget,
real migration upgrade and concurrent PHP processes. `GovernorRepairTest` exercises
real PromptEngine jobs with successive fake candidates, shape and claim rejection,
repair success, exhaustion, same-job re-entry, changed targets, cancellation, key loss,
ledger failure, transport failure, gate outage and exact final writes. Repair rows
are linked to the job and retain separate tokens, nullable cost and duration.

`GovernorAgentContinuationTest` dispatches an unchanged copy of the production
Agent POST `/prompt` endpoint in a disposable tree. It exhausts the source job,
then sends `continue_from` and proves that the endpoint reuses the conversation
but allocates a **new `prompt_log` job**. That new job receives its own initial
generation and two repairs through the real ledger/provider wrapper with a fake
generator. The old job remains exhausted; same-job re-entry still refuses.
Missing and foreign-key continuation sources create no jobs or workers.
Router authentication is supplied by the harness; the detached worker only
acknowledges its arguments. This tests endpoint allocation and budget semantics,
not authentication middleware, the full background worker or a live model.
There is no conversation-wide or user-wide repair cap.

The historical benchmark's repair bucket remains zero because those isolated
fixture rows make no repairs. New repair tests report actual repair rows rather
than changing the frozen historical expectations. Rejected/exhausted jobs are not
credited as savings. Live repair quality, pricing and latency remain UNVERIFIED.

That checkpoint stopped before the owner override backend proof below.

## Phase 6, third slice — owner override backend proof

At this checkpoint, `GovernorClaimOverride` was a server-side proof API. Its constructor receives an
authenticated user ID and a code-built path allowlist. `approve()` resolves the
current role from `users`, requires enforce mode and a readable server-side key,
and stores consent to an exact candidate SHA-256 plus canonical relative path,
source address, span hash, required whole-file hash and canonical preview-root
hash. A nonempty, bounded reason and server timestamp are mandatory. Known secrets
are rejected in all supplied audit fields, including otherwise valid hex hashes.
The audit does not store generated candidate text or provider credentials.

Migration `009_router_claim_overrides.php` adds only this audit table; its
`1.31.0.2` schema revision does not change product `VERSION` (`1.30.0`). Existing
approval rows are never updated to authorize another candidate or target.
The owner identity is supplied by trusted application code, not accepted from a
model response or an untrusted role field. No HTTP endpoint, request payload
field, Agent permission, settings UI or owner-facing interaction is implemented.
`GovernorHeading` and `PromptEngine` do not construct this service. Thus this is
backend proof, not a claim that owners can approve blocked edits in Studio yet.

The optional typed service and approval ID on `StagedHeadingPatch` require strict
healthy call accounting. The patch checks configuration and owner availability,
validates the in-memory candidate, runs and records the claim gate, then permits
`consume()` only for a valid completed `forbidden_claims >= 0.60` result. Gate
errors, malformed/nonfinite answers and ledger failure never consult an override.
An accepted gate needs no override and does not consume one. Owner metadata and
reason never enter model state. Registered secret text cannot enter the gate via
an override candidate.

Consumption matches the exact owner, candidate and source binding, rechecks the
owner/key, and commits `consumed_at` under `BEGIN IMMEDIATE` before the first
writer construction. Concurrent attempts authorize at most once. Nested caller
transactions, failed/ignored audit updates and missing audit storage refuse;
there is no runtime schema recreation. A valid approval is permission to accept
that claim only: cancellation, fresh owner/config/ledger checks, whole-file hash
checks and the same atomic governed writer still precede apply. A repaired hash B
cannot use approval for hash A. A different preview root cannot reuse consent,
even if its relative path and file bytes match.

`consumed_at` means **permission spent**, not “applied.” Cancellation, drift or
writer failure after consumption can leave a spent approval with no file change.
That is intentionally fail closed. Replaying the same approval fails even if the
original source bytes are restored. No expiry or conversation-wide approval
policy is added; consent is one-use and bound to content/target, not a job budget.
The per-job generator repair allowance remains independent and unchanged.

`GovernorClaimOverrideTest` exercises the real staged gate/write path with fakes:
owner checks, stored metadata, invalid/secret fields, candidate/repair A-to-B,
path/address/root mismatch, gate failures, revoked key/role, cancellation, ledger
and audit failures, replay, human edits and exactly one final governed write.
`GovernorOverrideConcurrencyTest` races six separate PHP processes against one
approval, verifies exactly one consumption, and covers durable audit failure and
caller-transaction boundaries. Both use disposable fixtures/databases and
ephemeral keys, never installed credentials or live providers.

At that checkpoint, off/shadow generation and production enforce request behavior were unchanged.
No publish protection, shared-writer serialization, revision/undo integration,
model-map selection or live quality/cost claim is added. Stop here for review
before any owner-facing wiring, broader failure-mode work or Studio chrome.

## Phase 6, fourth slice — production owner-override API

`GovernorHeading` now retains only the final validated candidate whose completed
claim gate blocked apply. Earlier repaired candidates, invalid output, outages,
and Agent jobs create no approval opportunity. Migration
`010_router_pending_headings.php` stores this pending candidate and exact target
under a random server-generated ID (schema `1.31.0.3`, product still `1.30.0`).
Same-job re-entry supersedes earlier pending IDs. Pending bytes are separate from
the consent audit; neither table contains credentials.

An owner receives `pending_candidate_id` in the terminal Studio SSE error. The
following authenticated Studio routes expose the backend without adding UI:

- `GET /governor/pending/:id`: inspect the exact server-held candidate and target.
- `POST /governor/pending/:id/approve`: body contains only a nonempty `reason`;
  requires the session CSRF token. No candidate, path, hash, user or approval ID
  may be supplied as authoritative request data.

Both require a current owner session. Editor/viewer, Agent/Bearer and demo requests
refuse. Unknown IDs return 404, invalid consent bodies 422, stale/used candidates
409, and missing active configuration a visible error. `GovernorPendingHeading`
revalidates the original blocked job, server-held hash/target, current source,
owner and configuration. It creates exact-binding consent, reserves the pending
ID once, and runs a fresh ledgered claim gate through the same staged patch.
Gate failure cannot use consent. A completed blocking gate consumes it; a fresh
safe gate needs no consumption. Both paths retain the final cancellation,
configuration, ledger and whole-file checks before the sole governed write.
No generator or repair call is made during approval, and no repair allowance is
reset. This applies preview bytes; it does not publish them.

The pending reservation is single-use, including failures and interrupted
requests. Concurrent losers may leave unused consent audit rows, but cannot
reuse them through HTTP. A consumed approval does not prove apply. If the file
was applied but final outcome recording failed, the response says applied with
`pending_recording_failed`; it does not claim rollback. There is no automatic
retry, expiry, pending-list UI, revision/undo or general shared-writer locking.

`GovernorPendingHeadingTest` exercises real PromptEngine retention and owner SSE
discovery in disposable benchmark applications, then service-level refusal and
apply with fakes. `GovernorOwnerEndpointTest` executes copied production router,
authentication, CSRF and endpoint code against real disposable sessions; only
the TypeSafe transport is faked. It checks all authorization/body boundaries,
replay, source drift, key loss and gate outage. Four concurrent approval requests
must produce one gate and one exact write, with no SQLite write transaction held
while the fake gate waits. These are separate generation and endpoint integration
proofs, not a browser-driven end-to-end interaction or live TypeSafe validation.

Decision-prompt extraction remains deferred. When separately authorized, use
`_studio/prompts/decisions/` as code-owned/read-only policy, never today's editable
`custom_prompts` path. No Phase 7 or Studio chrome is part of this slice.

## Phase 7 — failure-mode audit

Run `php _studio/tests/RouterFailureModesTest.php` for the additional 186-case
failure matrix through the real PromptEngine and TypeSafe HTTP response parser.
It covers Studio SSE and preallocated headless Agent jobs; inline/section edits
and unbounded free prompts; missing/corrupt keys and key loss during the turn;
routing/gate outages; HTTP 401/429/503; empty, null and oversized bodies; missing
answers, wrong answer types, invalid Noul values, missing usage and invalid model
metadata. Every case refuses without apply or legacy fallback. The tests verify
unchanged site snapshots after shutdown, bounded call counts, error ledger rows,
no pending override candidate, secret exclusion and explicit Studio errors.

Existing shadow/settings suites prove off/unconfigured legacy equivalence with
zero vendor calls and active missing-key refusal. Existing deterministic,
pending-heading and owner-endpoint suites cover the no-generator and approval
paths. The audit required no production code changes. All transports are fakes;
live provider availability and behavior remain unverified. No release or later
phase is included.
