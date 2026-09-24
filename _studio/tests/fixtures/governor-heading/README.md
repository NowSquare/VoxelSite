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

Git checkpoint: `246c5936ba78cb5e57f4f67cc862196f31cf2454` (parent:
`5053182d498917de477362f83948955a3456a872`). Its 17 files contain the fixture,
tests, harness, and freeze manifest; no production engine changes. The 16 hashes
in `freeze.json` describe blobs **at that commit**, including the original harness.
Subsequent benchmark corrections are separate changes. The seven starting files,
prompt/case manifest, and accepted output remain byte-identical to the checkpoint.
The checkpoint can be inspected without relying on the current working tree:

```sh
git show --stat 246c5936ba78cb5e57f4f67cc862196f31cf2454
git show 246c5936ba78cb5e57f4f67cc862196f31cf2454:_studio/tests/fixtures/governor-heading/freeze.json
```

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
