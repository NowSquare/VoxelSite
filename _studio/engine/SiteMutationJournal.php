<?php

declare(strict_types=1);

namespace VoxelSite;

/** Durable outcomes for deterministic Site mutations, including killed PHP workers. */
final class SiteMutationJournal
{
    private static ?self $current = null;
    private ?string $currentId = null;

    public function __construct(private Database $db)
    {
        $migration = require __DIR__ . '/migrations/013_site_mutation_journal.php';
        ($migration['up'])($db);
    }

    /** Caller holds SiteMutationLock until the endpoint's terminal response is saved. */
    public function begin(string $id, int $userId, string $path, array $body): ?array
    {
        if (!preg_match('/^[a-f0-9]{32}$/D', $id)) {
            throw new \RuntimeException('A valid mutation identifier is required.');
        }
        unset($body['mutation_id']);
        $requestHash = hash('sha256', json_encode([$path, self::canonicalize($body)], JSON_THROW_ON_ERROR));
        $row = $this->db->queryOne('SELECT * FROM site_control_mutations WHERE id = ?', [$id]);
        if ($row !== null) {
            if ((int) $row['user_id'] !== $userId || $row['request_hash'] !== $requestHash) {
                throw new \RuntimeException('This mutation identifier belongs to a different request.');
            }
            if ($row['status'] === 'applying') {
                throw new \RuntimeException('This website change is still in progress. Check its result before retrying.');
            }
            return $this->get($id, $userId);
        }
        if (self::$current !== null) {
            throw new \RuntimeException('A website change is already active in this request.');
        }
        $this->db->insert('site_control_mutations', [
            'id' => $id, 'user_id' => $userId, 'request_hash' => $requestHash,
            'route_path' => $path, 'status' => 'applying', 'created_at' => time(),
        ]);
        $this->currentId = $id;
        self::$current = $this;
        return null;
    }

    /** Snapshot creation calls this before any mutable website operation can run. */
    public static function attachSnapshot(int $snapshotId): void
    {
        $journal = self::$current;
        if ($journal === null || $journal->currentId === null) return;
        if ($journal->db->update('site_control_mutations', ['snapshot_id' => $snapshotId],
            'id = ? AND status = ?', [$journal->currentId, 'applying']) !== 1) {
            throw new \RuntimeException('Cannot retain the safety snapshot for this website change.');
        }
    }

    /** Called by the response writer before sending a terminal response to the browser. */
    public static function finish(array $response, int $httpCode = 200, bool $releaseCurrent = true): void
    {
        $journal = self::$current;
        if ($journal === null || $journal->currentId === null) return;
        $id = $journal->currentId;
        $journal->saveOutcome($id, $response, $httpCode);
        if ($releaseCurrent) self::releaseCommittedOperation();
    }

    /** Use only after the terminal outcome transaction has committed. No new database write. */
    public static function releaseCommittedOperation(): void
    {
        if (self::$current !== null) self::$current->currentId = null;
        self::$current = null;
    }

    public function get(string $id, int $userId): ?array
    {
        $row = $this->db->queryOne('SELECT * FROM site_control_mutations WHERE id = ? AND user_id = ?', [$id, $userId]);
        if ($row === null) return null;
        $response = $row['response_json'] === null ? null : json_decode($row['response_json'], true, 512, JSON_THROW_ON_ERROR);
        return [
            'mutation_id' => $id, 'status' => $row['status'], 'response' => $response,
            'httpCode' => $row['http_code'] === null ? null : (int) $row['http_code'],
            'snapshotId' => $row['snapshot_id'] === null ? null : (int) $row['snapshot_id'],
            'restored' => $response['error']['restored'] ?? null,
        ];
    }

    /**
     * Resolve a request that never claimed the writer. Caller holds SiteMutationLock.
     * A durable tombstone prevents a delayed original POST from starting afterward.
     */
    public function resolveMissing(string $id, int $userId): ?array
    {
        if (!preg_match('/^[a-f0-9]{32}$/D', $id)) {
            throw new \RuntimeException('A valid mutation identifier is required.');
        }
        if ($this->db->queryOne('SELECT id FROM site_control_mutations WHERE id = ?', [$id]) !== null) {
            return $this->get($id, $userId);
        }
        $response = ['ok' => false, 'error' => [
            'code' => 'mutation_not_started', 'mutation_id' => $id,
            'snapshotId' => null, 'restored' => true,
            'message' => 'The request did not reach the website writer. Nothing was changed. Try again.',
        ]];
        $this->db->insert('site_control_mutations', [
            'id' => $id, 'user_id' => $userId, 'request_hash' => 'not-started', 'route_path' => '',
            'status' => 'failed', 'response_json' => json_encode($response, JSON_THROW_ON_ERROR),
            'http_code' => 409, 'created_at' => time(),
        ]);
        return $this->get($id, $userId);
    }

    /** A caller holding the mutation lock knows that no live worker owns these rows. */
    public function recoverInterrupted(): void
    {
        require_once __DIR__ . '/SiteControlSnapshots.php';
        foreach ($this->db->query("SELECT * FROM site_control_mutations WHERE status = 'applying'") as $row) {
            $snapshotId = $row['snapshot_id'] === null ? null : (int) $row['snapshot_id'];
            $restored = true;
            $restoreError = '';
            if ($snapshotId !== null) {
                try {
                    $result = \restoreSiteControlSnapshot($this->db, $snapshotId);
                    $restored = ($result['ok'] ?? false) === true;
                    $restoreError = $result['error'] ?? '';
                } catch (\Throwable $error) {
                    $restored = false;
                    $restoreError = $error->getMessage();
                }
            }
            $response = ['ok' => false, 'error' => [
                'code' => 'mutation_interrupted', 'mutation_id' => $row['id'],
                'snapshotId' => $snapshotId, 'restored' => $restored,
                'message' => $restored
                    ? ($snapshotId === null ? 'The website change was interrupted before it started. Nothing was changed.'
                        : 'The website change was interrupted. Original files and page records were restored and verified.')
                    : 'The website change was interrupted and restoration is incomplete. Restore the safety snapshot before continuing. ' . $restoreError,
            ]];
            $this->saveOutcome($row['id'], $response, 409);
            if (self::$current?->currentId === $row['id']) {
                self::$current->currentId = null;
                self::$current = null;
            }
        }
    }

    private function saveOutcome(string $id, array $response, int $httpCode): void
    {
        if ($this->db->update('site_control_mutations', [
            'status' => ($response['ok'] ?? false) === true ? 'applied' : 'failed',
            'response_json' => json_encode($response, JSON_THROW_ON_ERROR), 'http_code' => $httpCode,
        ], 'id = ? AND status = ?', [$id, 'applying']) !== 1) {
            throw new \RuntimeException('Cannot retain the website change result.');
        }
    }

    private static function canonicalize(array $value): array
    {
        if (!array_is_list($value)) ksort($value);
        foreach ($value as &$item) {
            if (is_array($item)) $item = self::canonicalize($item);
        }
        unset($item);
        return $value;
    }
}
