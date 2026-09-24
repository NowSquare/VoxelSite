<?php
declare(strict_types=1);

namespace VoxelSite;

if (!class_exists(RouterSecrets::class)) { require_once __DIR__ . '/RouterSecrets.php'; }

/** Metadata-only, best-effort accounting. Schema is installed by migration only. */
final class AICallLedger
{
    /** Monotonic starts live only for the current request. */
    private array $started = [];
    private bool $healthy = true;
    private ?string $governedTargetHash = null;
    private string $governedFailure = 'ledger_unavailable';
    private const ERROR_CODES = ['call_error', 'provider_error', 'stream_incomplete', 'invalid_request',
        'transport_unavailable', 'http_error', 'invalid_response', 'observation_unavailable',
        'gate_error', 'classification_error'];

    public function __construct(private Database $db, private ?int $promptLogId = null) {}

    /** Enforce callers must refuse apply after any failed accounting operation. */
    public function isHealthy(): bool { return $this->healthy; }
    public function markUnavailable(): void { $this->healthy = false; }

    /** Pin the job to one target without storing its source or selector. */
    public function bindGovernedTarget(string $fingerprint): bool
    {
        $this->governedTargetHash = null;
        if (!$this->healthy) { return false; }
        try {
            if ($this->promptLogId === null || $fingerprint === '') {
                $this->markUnavailable();
                return false;
            }
            $hash = hash('sha256', $fingerprint);
            $statement = $this->db->getPdo()->prepare('INSERT INTO governor_job_budget
                (prompt_log_id, target_hash, generation_started, repairs_used)
                SELECT ?, ?, 0, 0 WHERE NOT EXISTS (
                    SELECT 1 FROM ai_call_ledger WHERE prompt_log_id = ? AND kind IN (\'generation\', \'repair\')
                ) ON CONFLICT(prompt_log_id) DO NOTHING');
            $statement->execute([$this->promptLogId, $hash, $this->promptLogId]);
            $row = $this->governedBudget();
            if (!hash_equals($row['target_hash'], $hash)) { return false; }
            $this->governedTargetHash = $hash;
            return true;
        } catch (\Throwable) {
            $this->markUnavailable();
            self::warn();
            return false;
        }
    }

    /** Reserve one initial generation or one of two repairs before any provider call. */
    public function startGovernedGeneration(string $provider, ?string $model, string $method): ?string
    {
        if (!$this->healthy) { return null; }
        $began = false;
        $id = null;
        try {
            $pdo = $this->db->getPdo();
            if ($this->governedTargetHash === null || $pdo->inTransaction()
                || !in_array($method, ['complete', 'stream'], true)) {
                throw new \RuntimeException('ledger_unavailable');
            }
            // Acquire the SQLite write lock before reading the counter. Do not
            // join a caller transaction: the reservation must be durable first.
            $pdo->exec('BEGIN IMMEDIATE');
            $began = true;
            $row = $this->governedBudget();
            if (!hash_equals($row['target_hash'], $this->governedTargetHash)) {
                throw new \RuntimeException('ledger_unavailable');
            }
            $kind = $row['generation_started'] === 0 ? 'generation' : 'repair';
            if ($kind === 'repair' && $row['repairs_used'] >= 2) {
                $pdo->exec('ROLLBACK');
                $began = false;
                $this->governedFailure = 'repair_limit_exhausted';
                return null;
            }
            $updated = $this->db->update('governor_job_budget', [
                'generation_started' => 1,
                'repairs_used' => $row['repairs_used'] + ($kind === 'repair' ? 1 : 0),
            ], 'prompt_log_id = ?', [$this->promptLogId]);
            if ($updated !== 1) { throw new \RuntimeException('ledger_unavailable'); }
            $id = $this->start($kind, $provider, $model, $method);
            if ($id === null) { throw new \RuntimeException('ledger_unavailable'); }
            $pdo->exec('COMMIT');
            $began = false;
            return $id;
        } catch (\Throwable) {
            if ($began) {
                try { $this->db->getPdo()->exec('ROLLBACK'); } catch (\Throwable) {}
            }
            if ($id !== null) { unset($this->started[$id]); }
            $this->markUnavailable();
            self::warn();
            return null;
        }
    }

    public function governedFailure(): string
    {
        return $this->healthy ? $this->governedFailure : 'ledger_unavailable';
    }

    public function governedRepairCount(): ?int
    {
        if (!$this->healthy) { return null; }
        try { return $this->governedBudget()['repairs_used']; }
        catch (\Throwable) { $this->markUnavailable(); self::warn(); return null; }
    }

    private function governedBudget(): array
    {
        $row = $this->db->queryOne('SELECT budget.target_hash, budget.generation_started, budget.repairs_used
            FROM governor_job_budget AS budget JOIN prompt_log AS job ON job.id = budget.prompt_log_id
            WHERE budget.prompt_log_id = ?', [$this->promptLogId]);
        if ($row === null || !is_string($row['target_hash']) || !preg_match('/\A[a-f0-9]{64}\z/D', $row['target_hash'])
            || !in_array($row['generation_started'], [0, 1], true)
            || !in_array($row['repairs_used'], [0, 1, 2], true)
            || ($row['generation_started'] === 0 && $row['repairs_used'] !== 0)) {
            throw new \RuntimeException('ledger_unavailable');
        }
        return $row;
    }

    public function start(string $kind, string $provider, ?string $model, string $method): ?string
    {
        try {
            if (!in_array($kind, ['classify', 'generation', 'gate', 'repair'], true)
                || !in_array($method, ['evaluate', 'complete', 'stream'], true)
                || RouterSecrets::redact($kind) !== $kind || RouterSecrets::redact($method) !== $method) {
                $this->markUnavailable();
                return null;
            }
            $id = bin2hex(random_bytes(16));
            $started = hrtime(true);
            $this->db->insert('ai_call_ledger', [
                'id' => $id, 'prompt_log_id' => $this->promptLogId, 'kind' => $kind,
                'provider' => self::identifier($provider) ?? 'unknown', 'model' => self::identifier($model),
                'method' => $method, 'status' => 'running', 'started_at' => gmdate('Y-m-d\TH:i:s\Z'),
            ]);
            $this->started[$id] = $started;
            return $id;
        } catch (\Throwable) {
            $this->markUnavailable();
            self::warn();
            return null;
        }
    }

    /** Only terminal outcomes are accepted; the first terminal write wins. */
    public function finish(?string $id, string $status, ?array $usage = null, ?float $costUsd = null,
        ?string $errorCode = null, ?string $resolvedModel = null): void
    {
        if ($id === null || !in_array($status, ['success', 'error'], true)) { return; }
        try {
            $data = [
                'status' => $status,
                'input_tokens' => self::tokens($usage['input_tokens'] ?? null),
                'output_tokens' => self::tokens($usage['output_tokens'] ?? null),
                'cost_usd' => $costUsd !== null && is_finite($costUsd) && $costUsd >= 0 ? $costUsd : null,
                'duration_ms' => isset($this->started[$id]) ? max(0.0, (hrtime(true) - $this->started[$id]) / 1e6) : null,
                'error_code' => $status === 'error' ? self::errorCode($errorCode) : null,
                'finished_at' => gmdate('Y-m-d\TH:i:s\Z'),
            ];
            if ($resolvedModel !== null) { $data['model'] = self::identifier($resolvedModel); }
            $updated = $this->db->update('ai_call_ledger', $data, "id = ? AND status = 'running'", [$id]);
            // Zero rows is expected for duplicate finishes, but not a known open call.
            if ($updated !== 1 && isset($this->started[$id])) { $this->markUnavailable(); }
            unset($this->started[$id]);
        } catch (\Throwable) { $this->markUnavailable(); self::warn(); }
    }

    private static function identifier(?string $value): ?string
    {
        if ($value === null || RouterSecrets::redact($value) !== $value
            || !preg_match('~\A[a-zA-Z0-9][a-zA-Z0-9._:/@+-]{0,199}\z~D', $value)) { return null; }
        return $value;
    }

    private static function tokens(mixed $value): ?int
    {
        return is_int($value) && $value >= 0 ? $value : null;
    }

    private static function errorCode(?string $value): string
    {
        return $value !== null && RouterSecrets::redact($value) === $value
            && in_array($value, self::ERROR_CODES, true) ? $value : 'call_error';
    }

    private static function warn(): void
    {
        // Logging must remain observational even with an uninitialized logger.
        try {
            if (class_exists(Logger::class)) { Logger::warning('ai', 'AI call ledger unavailable.'); }
            else { error_log('AI call ledger unavailable.'); }
        } catch (\Throwable) { /* Never replace the provider outcome. */ }
    }

    public function __debugInfo(): array { return ['prompt_log_id' => $this->promptLogId]; }
}
