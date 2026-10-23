<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Patch Executor (Phase B-7/B-8/B-9)
 *
 * Transactional, source-anchored patch engine with structured execution
 * transcript and deterministic post-verification.
 *
 * Contract:
 *   1. Only anchored edits are accepted
 *   2. File is re-read before every mutation
 *   3. before_snippet must be found verbatim in the current file
 *   4. Only the approved snippet is replaced — no regenerated content
 *   5. Snapshot is taken before any write
 *   6. Post-write syntax validation (PHP lint, JSON parse)
 *   7. Post-write re-read verifies after_snippet exists
 *   8. If ANY edit fails, ALL mutations are rolled back
 *   9. Every step emits a structured phase event with timing
 *  10. Final result includes a deterministic verification report
 *
 * A plan is not permission to improvise.
 */
class PatchExecutor
{
    private FileManager $fileManager;

    /** @var list<array{file: string, original: string|null}> */
    private array $snapshots = [];

    /** @var list<array{phase: string, file: string, status: string, detail: string, bytes: int|null, ms: float|null}> */
    private array $log = [];

    /** @var bool Whether any mutation has been written to disk */
    private bool $hasMutated = false;

    /** @var bool Whether rollback completed without errors */
    private bool $rollbackClean = true;

    /** @var float Execution start time */
    private float $startTime;

    /** @var list<array{file: string, checks: list<array{check: string, passed: bool, detail: string}>}> */
    private array $verification = [];

    private array $changedFiles = [];
    private array $remainingChangedFiles = [];
    private bool $compileAttempted = false;

    /** @var callable|null Fires at the instant each phase event is created */
    private $onEmit = null;

    public function __construct(?FileManager $fileManager = null, ?callable $onEmit = null)
    {
        $db = Database::getInstance();
        $this->fileManager = $fileManager ?? new FileManager($db);
        $this->onEmit = $onEmit;
    }

    /**
     * Execute a set of anchored edits with structured transcript and post-verify.
     *
     * @param list<array> $edits Anchored edits from PlanBuilder
     *
     * @return array{
     *   success: bool,
     *   files_changed: int,
     *   log: list<array>,
     *   verification: list<array>,
     *   error: string|null,
     *   rollback_clean: bool,
     *   duration_ms: float
     * }
     */
    public function execute(array $edits): array
    {
        $this->snapshots = [];
        $this->log = [];
        $this->verification = [];
        $this->hasMutated = false;
        $this->rollbackClean = true;
        $this->startTime = microtime(true);
        $this->changedFiles = [];
        $this->remainingChangedFiles = [];
        $this->compileAttempted = false;

        if ($edits === [] || !array_is_list($edits)) {
            return $this->result(false, 'No anchored edits to execute');
        }
        $byFile = [];
        $strategies = ['token-edit', 'attribute-edit', 'line-replace', 'block-replace', 'block-insert', 'meta-edit', 'content-edit'];
        foreach ($edits as $edit) {
            if (!is_array($edit) || ($edit['anchored'] ?? false) !== true
                || !is_string($edit['file'] ?? null) || $edit['file'] === ''
                || !is_string($edit['before_snippet'] ?? null) || $edit['before_snippet'] === ''
                || !is_string($edit['after_snippet'] ?? null)
                || !in_array($edit['strategy'] ?? '', $strategies, true)) {
                $this->emit('reject', is_array($edit) ? (string) ($edit['file'] ?? '?') : '?', 'refused', 'The complete plan must contain valid anchored edits. Nothing was changed.');
                return $this->result(false, 'No anchored plan: one or more edits are invalid. Build a new plan.');
            }
            if ($edit['file'] === 'assets/css/tailwind.css') {
                return $this->result(false, 'The generated Tailwind bundle cannot be edited directly.');
            }
            $byFile[$edit['file']][] = $edit;
        }

        // Validate the entire transaction against original files before any write.
        // Patches never anchor to text produced by another edit in the same plan.
        $prepared = [];
        try {
            foreach ($byFile as $file => $fileEdits) {
                $original = $this->fileManager->readFile($file);
                if ($original === null) {
                    throw new \RuntimeException('Cannot read file: ' . $file);
                }
                foreach ($fileEdits as $edit) {
                    if (isset($edit['source_hash']) && (!is_string($edit['source_hash'])
                        || !hash_equals($edit['source_hash'], hash('sha256', $original)))) {
                        throw new \RuntimeException('File changed after review: ' . $file . '. Build a new plan.');
                    }
                }
                $this->snapshots[] = ['file' => $file, 'original' => $original];
                $this->emit('snapshot', $file, 'ok', 'Original source captured', strlen($original));
                $prepared[$file] = $this->prepareFile($file, $original, $fileEdits);
                $this->validateSyntax($file, $prepared[$file]);
            }
            // Compilation is part of the transaction, including its derived file.
            $this->snapshots[] = ['file' => 'assets/css/tailwind.css', 'original' => $this->fileManager->readFile('assets/css/tailwind.css')];
        } catch (\Throwable $e) {
            $this->emit('reject', '', 'refused', $e->getMessage());
            return $this->result(false, $e->getMessage());
        }

        try {
            foreach ($prepared as $file => $modified) {
                $original = $this->originalFor($file);
                $current = $this->fileManager->readFile($file);
                if ($current !== $original) {
                    throw new \RuntimeException('File changed during apply: ' . $file);
                }
                $this->emit('read', $file, 'ok', 'Source hash confirmed', strlen($current));
                if ($modified === $current) {
                    $this->emit('patch', $file, 'skip', 'No changes after applying edits');
                    continue;
                }
                $this->hasMutated = true;
                $this->changedFiles[] = $file;
                $this->fileManager->writeExactFile($file, $modified);
                $this->emit('patch', $file, 'ok', 'Exact approved bytes written', strlen($modified));
                if ($this->fileManager->readFile($file) !== $modified) {
                    throw new \RuntimeException('Written file differs from approved patch: ' . $file);
                }
                $checks = $this->verifyFile($file, $byFile[$file]);
                $this->verification[] = ['file' => $file, 'checks' => $checks];
                foreach ($checks as $check) {
                    if (!$check['passed']) throw new \RuntimeException('Verification failed in ' . $file . ': ' . $check['detail']);
                }
                $this->emit('verify', $file, 'ok', count($checks) . ' check(s) passed');
            }
            if (!$this->hasMutated) {
                return $this->result(false, 'The plan makes no changes. Build a new plan.');
            }
            $this->compileAttempted = true;
            $compiled = $this->fileManager->compileTailwind();
            if (($compiled['ok'] ?? false) !== true) {
                throw new \RuntimeException('Tailwind compilation failed.');
            }
            $this->emit('compile', 'assets/css/tailwind.css', 'ok', 'Tailwind bundle compiled');
            $this->fileManager->syncPageRegistry(true);
            $this->emit('index', '', 'ok', 'Page registry refreshed from files');
        } catch (\Throwable $e) {
            $this->emit('crash', $file ?? '', 'error', $e->getMessage());
            return $this->rollbackAndReturn('Patch execution failed: ' . $e->getMessage());
        }

        $this->emit('done', '', 'ok', count($this->changedFiles) . ' file(s) patched and verified');
        return $this->result(true, null, count($this->changedFiles));
    }

    /** Build all replacements from the same immutable original source. */
    private function prepareFile(string $file, string $original, array $edits): string
    {
        $result = self::prepareSource($file, $original, $edits);
        $this->emit('anchor', $file, 'ok', 'Source anchors are unique and do not overlap');
        return $result;
    }

    /** Pure shared preparation; callers validate typed edits and source hashes. */
    public static function prepareSource(string $file, string $original, array $edits): string
    {
        $patches = [];
        foreach ($edits as $edit) {
            $before = $edit['before_snippet'];
            $matches = substr_count($original, $before);
            if ($matches !== 1) {
                throw new \RuntimeException($matches === 0
                    ? 'Anchor drift in ' . $file . ': before_snippet not found in current file'
                    : 'Ambiguous anchor in ' . $file . ': before_snippet appears ' . $matches . ' times');
            }
            $start = strpos($original, $before);
            $length = strlen($before);
            if ($edit['strategy'] === 'block-insert') {
                if ($edit['after_snippet'] === '') throw new \RuntimeException('Empty after_snippet for insert in ' . $file);
                // Preserve the existing insert-after-anchor-line contract.
                $anchorEnd = $start + $length;
                $lineEnd = str_ends_with($before, "\n") ? $anchorEnd - 1 : strpos($original, "\n", $anchorEnd);
                $start = $lineEnd === false ? strlen($original) : $lineEnd + 1;
                $length = 0;
                $replacement = ($lineEnd === false ? "\n" : '') . $edit['after_snippet'] . "\n";
            } else {
                $replacement = $edit['after_snippet'];
            }
            foreach ($patches as $patch) {
                $end = $start + $length;
                $otherEnd = $patch['start'] + $patch['length'];
                $overlap = $length === 0 && $patch['length'] === 0 ? $start === $patch['start']
                    : ($length === 0 ? $start >= $patch['start'] && $start < $otherEnd
                    : ($patch['length'] === 0 ? $patch['start'] >= $start && $patch['start'] < $end
                    : $start < $otherEnd && $patch['start'] < $end));
                if ($overlap) throw new \RuntimeException('Overlapping edits in ' . $file . '. Build a new plan.');
            }
            $patches[] = ['start' => $start, 'length' => $length, 'replacement' => $replacement];
        }
        usort($patches, fn(array $a, array $b) => $b['start'] <=> $a['start']);
        foreach ($patches as $patch) {
            $original = substr_replace($original, $patch['replacement'], $patch['start'], $patch['length']);
        }
        return $original;
    }

    private function validateSyntax(string $file, string $content): void
    {
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if ($ext === 'php') {
            try { token_get_all($content, TOKEN_PARSE); }
            catch (\ParseError $e) { throw new \RuntimeException('Invalid PHP syntax in ' . $file . ': ' . $e->getMessage()); }
        } elseif ($ext === 'json') {
            json_decode($content, true, 512, JSON_THROW_ON_ERROR);
        } elseif ($ext === 'css') {
            $check = $this->lintCss($content, $file);
            if (!$check['passed']) throw new \RuntimeException('Invalid CSS syntax in ' . $file . ': ' . $check['detail']);
        }
    }

    private function originalFor(string $file): ?string
    {
        foreach ($this->snapshots as $snapshot) {
            if ($snapshot['file'] === $file) return $snapshot['original'];
        }
        return null;
    }

    // ═══════════════════════════════════════════
    //  Post-Write Verification (B9)
    // ═══════════════════════════════════════════

    /**
     * Run deterministic post-write checks on a changed file.
     *
     * @return list<array{check: string, passed: bool, detail: string}>
     */
    private function verifyFile(string $file, array $edits): array
    {
        $checks = [];

        // Check 1: Re-read from disk
        $content = $this->fileManager->readFile($file);
        if ($content === null) {
            $checks[] = ['check' => 'readable', 'passed' => false, 'detail' => 'Cannot re-read file after write'];
            return $checks;
        }
        $checks[] = ['check' => 'readable', 'passed' => true, 'detail' => 'File re-read (' . strlen($content) . ' bytes)'];

        // Check 2: Verify each after_snippet exists
        foreach ($edits as $i => $edit) {
            $afterSnippet = $edit['after_snippet'] ?? '';
            if ($afterSnippet === '') continue;

            $label = 'after_snippet[' . $i . ']';
            if (str_contains($content, $afterSnippet)) {
                $checks[] = ['check' => $label, 'passed' => true, 'detail' => 'Confirmed in written file'];
            } else {
                $checks[] = ['check' => $label, 'passed' => false, 'detail' => 'Not found in written file'];
                return $checks; // Fatal — stop checking
            }
        }

        // Check 3: Syntax validation by file type
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

        if ($ext === 'php') {
            // token_get_all(TOKEN_PARSE) validates without requiring a shell binary.
            $this->validateSyntax($file, $content);
            $checks[] = ['check' => 'php_lint', 'passed' => true, 'detail' => 'Syntax validated at write time'];
        } elseif ($ext === 'json') {
            $checks[] = $this->lintJson($content, $file);
        } elseif ($ext === 'css') {
            $checks[] = $this->lintCss($content, $file);
        }

        return $checks;
    }

    /**
     * JSON parse check.
     */
    private function lintJson(string $content, string $file): array
    {
        json_decode($content);
        if (json_last_error() === JSON_ERROR_NONE) {
            return ['check' => 'json_parse', 'passed' => true, 'detail' => 'Valid JSON'];
        }
        return ['check' => 'json_parse', 'passed' => false, 'detail' => 'Invalid JSON: ' . json_last_error_msg()];
    }

    /**
     * Basic CSS syntax check — brace balance.
     */
    private function lintCss(string $content, string $file): array
    {
        $opens = substr_count($content, '{');
        $closes = substr_count($content, '}');
        if ($opens !== $closes) {
            return ['check' => 'css_braces', 'passed' => false,
                    'detail' => "Unbalanced braces: {$opens} open, {$closes} close"];
        }
        return ['check' => 'css_braces', 'passed' => true, 'detail' => 'CSS braces balanced'];
    }

    // ═══════════════════════════════════════════
    //  Rollback & Logging
    // ═══════════════════════════════════════════

    /**
     * Roll back all snapshots and return a failure result.
     */
    private function rollbackAndReturn(string $reason): array
    {
        if ($this->hasMutated) {
            $this->emit('rollback', '', 'start', 'Restoring original files and compiled CSS');
            foreach ($this->snapshots as $snapshot) {
                // A later target may have changed independently before we wrote it.
                // Restore only writes attempted by this transaction.
                if (!in_array($snapshot['file'], $this->changedFiles, true)
                    && !($this->compileAttempted && $snapshot['file'] === 'assets/css/tailwind.css')) {
                    continue;
                }
                try {
                    if ($this->fileManager->readFile($snapshot['file']) !== $snapshot['original']) {
                        if ($snapshot['original'] === null) {
                            $this->fileManager->deleteFile($snapshot['file']);
                        } else {
                            $this->fileManager->writeExactFile($snapshot['file'], $snapshot['original']);
                        }
                    }
                    if ($this->fileManager->readFile($snapshot['file']) !== $snapshot['original']) {
                        throw new \RuntimeException('Restored bytes do not match original source');
                    }
                    $this->emit('rollback', $snapshot['file'], 'ok', 'Original bytes verified');
                } catch (\Throwable $e) {
                    $this->rollbackClean = false;
                    $this->remainingChangedFiles[] = $snapshot['file'];
                    $this->emit('rollback', $snapshot['file'], 'failed', 'Cannot verify restoration: ' . $e->getMessage());
                }
            }
            try {
                $this->fileManager->syncPageRegistry(true);
            } catch (\Throwable $e) {
                $this->rollbackClean = false;
                $this->emit('index', '', 'failed', 'Files restored; page registry refresh failed: ' . $e->getMessage());
            }
            $this->emit('rollback', '', $this->rollbackClean ? 'ok' : 'partial',
                $this->rollbackClean ? 'All original bytes restored and verified' : 'Recovery is incomplete; use the safety snapshot');
        }
        return $this->result(false, $reason);
    }

    /**
     * Emit a structured phase event.
     */
    private function emit(string $phase, string $file, string $status, string $detail, ?int $bytes = null): void
    {
        $entry = [
            'phase'  => $phase,
            'file'   => $file,
            'status' => $status,
            'detail' => $detail,
            'bytes'  => $bytes,
            'ms'     => round((microtime(true) - $this->startTime) * 1000, 1),
        ];
        $this->log[] = $entry;

        // Fire at emit time — persists each phase to disk before continuing
        if ($this->onEmit !== null) {
            ($this->onEmit)($entry);
        }
    }

    /**
     * Build the result array with verification report.
     */
    private function result(bool $success, ?string $error = null, int $filesChanged = 0): array
    {
        return [
            'success'        => $success,
            'files_changed'  => $filesChanged,
            'changed_files' => $this->changedFiles,
            'remaining_changed_files' => $this->remainingChangedFiles,
            'restoration_verified' => $this->rollbackClean,
            'log'            => $this->log,
            'verification'   => $this->verification,
            'error'          => $error,
            'rollback_clean' => $this->rollbackClean,
            'duration_ms'    => round((microtime(true) - $this->startTime) * 1000, 1),
        ];
    }
}
