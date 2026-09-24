# Governor heading proof — frozen fixture v1

Binding scope: `.ai/VoxelSite-30001-Governor-Plan.md`, release target **1.31.0**.
The original pre-implementation freeze was not recorded in Git. The review
checkpoint now commits the existing bytes separately from the production proof;
it does not retroactively establish that earlier chronology. `freeze.json` records
the reviewed fixture/harness hashes before benchmark corrections. `fixture.json`
records exact starting-file SHA-256 hashes, prompt, target source/hash, trusted
facts, candidate and expected apply/reject cases. `expected-index.php` is the
exact accepted output. Fixture edits require an explicit version/change note;
do not update expected bytes just to make an implementation pass.

Run from the repository root:

```sh
php _studio/tests/GovernorHeadingPatchTest.php
php _studio/tests/GovernorHeadingBenchmark.php
php _studio/tests/GovernorHeadingBenchmark.php --legacy-only
```

The legacy benchmark copies current engine/prompts/static handlers into a
random temporary application, creates a fresh SQLite schema, and calls the real
`PromptEngine::execute()` with an `AIProviderInterface` fake. It never opens a
customer database or calls a network provider. The Governor comparison uses the
same starting files and request, a canned text candidate and a fake claim gate.
All temporary applications/sites are removed after the run.

The report separates routing/generation/gate tokens, nullable cost and local
fake-call duration, with retry/repair counts and task completion. Tokens use
`ceil(bytes / 4)` over actual fake inputs/outputs, not a provider tokenizer.
No historical averages are substituted. Routing is not implemented in this
proof and is reported as zero calls. Claim rejections are `reject-correct` and
never enter savings comparisons. Canned output does not establish live quality,
Jev accuracy, model latency, or the program's 50% production stop-rule result.

## Proof boundary

`StagedHeadingPatch` is deliberately **not connected to `PromptEngine::execute()`**
or an HTTP endpoint yet. Studio/Agent keep their existing behavior. There are no
Governor settings, route chips, network adapter, live claims classifier, override
flow, repair loop, or new migrations in this milestone. `VERSION` stays 1.30.0
until a release is cut; this proof targets 1.31.0.

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
Keep it unwired until the next integration review addresses shared writer locking
and revision ownership. The HTML check is conservative static source analysis,
not a general browser DOM/source mapping or arbitrary-PHP sandbox.

Additional checks:

```sh
php _studio/tests/GovernorHeadingBenchmarkTest.php
```

The tests inspect the complete temporary site during generator chunks and inside
the gate, assert no FileManager construction before acceptance, check exactly one
accepted apply, and preserve CSS/data/discovery/unrelated-page bytes. Regressions
also cover PHP islands inside comments/scripts, symlinks, malformed gate trees,
a late writer-boundary edit and a writer pointed at the wrong preview root.
The benchmark child pins its paths and checks that application classes were loaded
from its disposable copy, even when the caller has existing test-path overrides.
