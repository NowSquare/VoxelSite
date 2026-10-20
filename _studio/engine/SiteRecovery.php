<?php

declare(strict_types=1);

namespace VoxelSite;

/** Keep later edits out of a website whose previous rollback is incomplete. */
final class SiteRecovery
{
    /** Caller holds the shared mutation lock; explicit snapshot restoration is exempt. */
    public static function assertWritable(Database $db): void
    {
        foreach (self::failedRows($db, 'site_control_plans') as $row) {
            $result = json_decode($row['result_json'] ?? 'null', true, 512, JSON_THROW_ON_ERROR);
            if (self::needsRecovery($result, $row['recovery_snapshot_id'] ?? null, $result['rollback_clean'] ?? null)) {
                self::block($row['recovery_snapshot_id'] ?? null);
            }
        }
        foreach (self::failedRows($db, 'site_control_mutations') as $row) {
            $response = json_decode($row['response_json'] ?? 'null', true, 512, JSON_THROW_ON_ERROR);
            if (self::needsRecovery($response, $row['snapshot_id'] ?? null, $response['error']['restored'] ?? null)) {
                self::block($row['snapshot_id'] ?? null);
            }
        }
    }

    /** Only after a user-selected snapshot has been fully restored, synced and compiled. */
    public static function resolveAfterSnapshot(Database $db, int $snapshotId, ?callable $recordRestoredOutcome = null): void
    {
        if ($snapshotId < 1 || $db->queryOne('SELECT id FROM snapshots WHERE id = ?', [$snapshotId]) === null) {
            throw new \RuntimeException('The restored recovery snapshot is not available.');
        }
        $note = 'Recovery completed by restoring snapshot #' . $snapshotId . '. The original website change was not retried.';
        $db->transaction(static function () use ($db, $snapshotId, $note, $recordRestoredOutcome): void {
            foreach (self::failedRows($db, 'site_control_plans') as $row) {
                $result = json_decode($row['result_json'] ?? 'null', true, 512, JSON_THROW_ON_ERROR);
                if (!self::needsRecovery($result, $row['recovery_snapshot_id'] ?? null, $result['rollback_clean'] ?? null)) continue;
                $result['recovery_resolved'] = true;
                $result['recovery_resolved_by_snapshot'] = $snapshotId;
                $result['recovery_note'] = $note;
                $db->update('site_control_plans', ['result_json' => json_encode($result, JSON_THROW_ON_ERROR)], 'id = ?', [$row['id']]);
            }
            foreach (self::failedRows($db, 'site_control_mutations') as $row) {
                $response = json_decode($row['response_json'] ?? 'null', true, 512, JSON_THROW_ON_ERROR);
                if (!self::needsRecovery($response, $row['snapshot_id'] ?? null, $response['error']['restored'] ?? null)) continue;
                $response['recovery_resolved'] = true;
                $response['error']['recovery_resolved'] = true;
                $response['error']['recovery_resolved_by_snapshot'] = $snapshotId;
                $response['error']['recovery_note'] = $note;
                $db->update('site_control_mutations', ['response_json' => json_encode($response, JSON_THROW_ON_ERROR)], 'id = ?', [$row['id']]);
            }
            // A completed restore and the released recovery gate must commit together.
            if ($recordRestoredOutcome !== null) $recordRestoredOutcome();
        });
    }

    private static function failedRows(Database $db, string $table): array
    {
        if (!$db->scalar('SELECT COUNT(*) FROM sqlite_master WHERE type = ? AND name = ?', ['table', $table])) return [];
        return $db->query('SELECT * FROM ' . $table . ' WHERE status = ?', ['failed']);
    }

    private static function needsRecovery(mixed $outcome, mixed $snapshotId, mixed $restored): bool
    {
        return ($outcome['recovery_resolved'] ?? false) !== true
            && ($restored === false || ($snapshotId !== null && $restored !== true));
    }

    private static function block(mixed $snapshotId): never
    {
        $snapshot = $snapshotId === null ? '' : ' Recovery snapshot: #' . (int) $snapshotId . '.';
        throw new \RuntimeException('A previous website change has incomplete recovery. Restore a snapshot in Designs → History before another website change.' . $snapshot);
    }
}
