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

    /** @var list<array{file: string, original: string}> */
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

        // ── Gate: only anchored edits ──
        $anchored = array_filter($edits, fn($e) => ($e['anchored'] ?? false) === true);
        $rejected = array_filter($edits, fn($e) => ($e['anchored'] ?? false) !== true);

        if (!empty($rejected)) {
            foreach ($rejected as $r) {
                $this->emit('reject', $r['file'] ?? '?', 'refused',
                    'Edit not anchored: ' . ($r['anchor_issue'] ?? 'unknown'));
            }
        }

        if (empty($anchored)) {
            $this->emit('abort', '', 'refused', 'No anchored edits to execute');
            return $this->result(false, 'No anchored edits to execute');
        }

        // ── Group edits by file ──
        $byFile = [];
        foreach ($anchored as $edit) {
            $file = $edit['file'] ?? '';
            if ($file === '') continue;
            $byFile[$file][] = $edit;
        }

        // ── Sort edits within each file by line number DESCENDING ──
        // Applying from bottom to top preserves line numbers for earlier edits.
        foreach ($byFile as $file => &$fileEdits) {
            usort($fileEdits, fn($a, $b) =>
                ($b['region']['start'] ?? 0) <=> ($a['region']['start'] ?? 0)
            );
        }
        unset($fileEdits);

        // ── Phase 1: Snapshot all files ──
        foreach (array_keys($byFile) as $file) {
            $content = $this->fileManager->readFile($file);
            if ($content === null) {
                $this->emit('read', $file, 'failed', 'File not readable');
                return $this->rollbackAndReturn('Cannot read file: ' . $file);
            }
            $this->snapshots[] = ['file' => $file, 'original' => $content];
            $this->emit('snapshot', $file, 'ok', 'Snapshot taken', strlen($content));
        }

        // ── Phase 2: Apply edits per file ──
        // Wrapped in try/catch: if writeFile() or verifyFile() throws after
        // earlier files were already mutated, rollback restores ALL snapshots.
        $filesChanged = 0;
        $changedFiles = [];
        $currentFile = '';

        try {
            foreach ($byFile as $file => $fileEdits) {
                $currentFile = $file;
                // Re-read current content
                $current = $this->fileManager->readFile($file);
                if ($current === null) {
                    $this->emit('read', $file, 'failed', 'File became unreadable after snapshot');
                    return $this->rollbackAndReturn('File became unreadable: ' . $file);
                }
                $this->emit('read', $file, 'ok', 'Read file', strlen($current));

                $modified = $current;

                foreach ($fileEdits as $edit) {
                    $strategy      = $edit['strategy'] ?? 'line-replace';
                    $beforeSnippet = $edit['before_snippet'] ?? '';
                    $afterSnippet  = $edit['after_snippet'] ?? '';
                    $desc          = $edit['description'] ?? '';

                    if ($strategy === 'block-insert') {
                        $result = $this->applyInsert($modified, $edit);
                    } else {
                        $result = $this->applyReplace($modified, $beforeSnippet, $afterSnippet, $file);
                    }

                    if ($result['error'] !== null) {
                        $this->emit('anchor', $file, 'failed', $result['error']);
                        return $this->rollbackAndReturn($result['error']);
                    }

                    $this->emit('anchor', $file, 'ok',
                        'Anchored: ' . mb_substr($desc, 0, 80));
                    $modified = $result['content'];
                }

                // ── Write the patched file ──
                if ($modified === $current) {
                    $this->emit('patch', $file, 'skip', 'No changes after applying edits');
                    continue;
                }

                $this->hasMutated = true;
                $writeWarning = $this->fileManager->writeFile($file, $modified);
                if ($writeWarning !== null) {
                    $this->emit('lint', $file, 'failed', 'Syntax error: ' . $writeWarning);
                    return $this->rollbackAndReturn(
                        'Patch produced invalid syntax in ' . $file . ': ' . $writeWarning
                    );
                }
                $this->emit('patch', $file, 'ok', 'Written to disk', strlen($modified));

                // ── Phase 3: Post-write verification (B9) ──
                $fileChecks = $this->verifyFile($file, $fileEdits);
                $this->verification[] = [
                    'file'   => $file,
                    'checks' => $fileChecks,
                ];

                $failedChecks = array_filter($fileChecks, fn($c) => !$c['passed']);
                if (!empty($failedChecks)) {
                    $firstFailure = reset($failedChecks);
                    $this->emit('verify', $file, 'failed', $firstFailure['detail']);
                    return $this->rollbackAndReturn(
                        'Verification failed in ' . $file . ': ' . $firstFailure['detail']
                    );
                }

                $passedCount = count($fileChecks);
                $this->emit('verify', $file, 'ok', $passedCount . ' check(s) passed');
                $filesChanged++;
                $changedFiles[] = $file;
            }
        } catch (\Throwable $e) {
            // writeFile() or verifyFile() threw — rollback all snapshots
            $this->emit('crash', $currentFile, 'error',
                'Exception: ' . $e->getMessage());
            return $this->rollbackAndReturn(
                'Crash during patch execution: ' . $e->getMessage()
            );
        }

        // ── Success ──
        $this->emit('done', '', 'ok',
            $filesChanged . ' file(s) patched and verified');

        return $this->result(true, null, $filesChanged);
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
            // PHP lint already ran during writeFile() — fatal on failure.
            // Re-confirming here that it passed.
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
    //  Edit Application
    // ═══════════════════════════════════════════

    /**
     * Apply a find-and-replace edit.
     *
     * @return array{content: string, error: string|null}
     */
    private function applyReplace(string $content, string $before, string $after, string $file): array
    {
        if ($before === '') {
            return ['content' => $content, 'error' => "Empty before_snippet in {$file}"];
        }

        $count = substr_count($content, $before);

        if ($count === 0) {
            return [
                'content' => $content,
                'error'   => "Anchor drift in {$file}: before_snippet not found in current file"
            ];
        }

        if ($count > 1) {
            return [
                'content' => $content,
                'error'   => "Ambiguous anchor in {$file}: before_snippet appears {$count} times"
            ];
        }

        return ['content' => str_replace($before, $after, $content), 'error' => null];
    }

    /**
     * Apply a block-insert edit.
     *
     * @return array{content: string, error: string|null}
     */
    private function applyInsert(string $content, array $edit): array
    {
        $afterSnippet = $edit['after_snippet'] ?? '';
        $targetLine   = (int) ($edit['region']['start'] ?? 0);
        $file         = $edit['file'] ?? '';

        if ($afterSnippet === '') {
            return ['content' => $content, 'error' => "Empty after_snippet for insert in {$file}"];
        }

        $lines = explode("\n", $content);

        if ($targetLine < 1 || $targetLine > count($lines) + 1) {
            return [
                'content' => $content,
                'error'   => "Insert target line {$targetLine} out of range in {$file} (1-" . count($lines) . ")"
            ];
        }

        // Every insert must have a source anchor — position alone is not trustworthy
        $beforeSnippet = $edit['before_snippet'] ?? '';
        if ($beforeSnippet === '') {
            return ['content' => $content, 'error' => "Insert in {$file} has no before_snippet anchor"];
        }

        // Find the exact position of the anchor in the file
        $fullContent = implode("\n", $lines);
        $matchCount = substr_count($fullContent, $beforeSnippet);

        if ($matchCount === 0) {
            return [
                'content' => $content,
                'error'   => "Insert anchor drift in {$file}: before_snippet not found in file"
            ];
        }

        if ($matchCount > 1) {
            return [
                'content' => $content,
                'error'   => "Ambiguous insert anchor in {$file}: before_snippet appears {$matchCount} times"
            ];
        }

        // Find the line number where the snippet ends — insert after that line
        $pos = strpos($fullContent, $beforeSnippet);
        $linesBeforeMatch = substr_count(substr($fullContent, 0, $pos + strlen($beforeSnippet)), "\n");
        $targetLine = $linesBeforeMatch + 1;

        $insertLines = explode("\n", $afterSnippet);
        array_splice($lines, $targetLine, 0, $insertLines);

        return ['content' => implode("\n", $lines), 'error' => null];
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
            $this->emit('rollback', '', 'start', 'Rolling back all changes');

            foreach ($this->snapshots as $snapshot) {
                try {
                    $this->fileManager->writeFile($snapshot['file'], $snapshot['original']);
                    $this->emit('rollback', $snapshot['file'], 'ok', 'Restored to snapshot');
                } catch (\Throwable $e) {
                    $this->rollbackClean = false;
                    $this->emit('rollback', $snapshot['file'], 'failed',
                        'CRITICAL: Cannot restore — ' . $e->getMessage());
                }
            }

            $this->emit('rollback', '', $this->rollbackClean ? 'ok' : 'partial',
                $this->rollbackClean ? 'All files restored' : 'Rollback completed with errors');
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
            'log'            => $this->log,
            'verification'   => $this->verification,
            'error'          => $error,
            'rollback_clean' => $this->rollbackClean,
            'duration_ms'    => round((microtime(true) - $this->startTime) * 1000, 1),
        ];
    }
}
