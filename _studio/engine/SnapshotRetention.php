<?php
declare(strict_types=1);

namespace VoxelSite;

/** Share one archive limit without deleting the files needed to finish recovery. */
final class SnapshotRetention
{
    /** Call while holding the website mutation lock. */
    public static function protectedIds(Database $db, array $currentIds = []): array
    {
        $ids = array_fill_keys(array_map('intval', $currentIds), true);
        foreach ([['site_control_plans', 'recovery_snapshot_id', 'result_json'],
            ['site_control_mutations', 'snapshot_id', 'response_json']] as [$table, $snapshotColumn, $resultColumn]) {
            if (!$db->scalar('SELECT COUNT(*) FROM sqlite_master WHERE type = ? AND name = ?', ['table', $table])) continue;
            foreach ($db->query('SELECT status, ' . $snapshotColumn . ', ' . $resultColumn . ' FROM ' . $table . " WHERE status IN ('applying', 'failed') AND " . $snapshotColumn . ' IS NOT NULL') as $row) {
                $required = $row['status'] === 'applying';
                if (!$required) {
                    $result = json_decode($row[$resultColumn] ?? 'null', true);
                    $resolved = ($result['recovery_resolved'] ?? false) === true;
                    $restored = $table === 'site_control_plans' ? ($result['rollback_clean'] ?? null) : ($result['error']['restored'] ?? null);
                    $required = !$resolved && $restored !== true;
                }
                if ($required) $ids[(int) $row[$snapshotColumn]] = true;
            }
        }
        unset($ids[0]);
        return array_keys($ids);
    }

    /** Keep newest ordinary archives within the cap; protected recovery can exceed it. */
    public static function enforce(Database $db, Settings $settings, string $snapshotDir, array $currentIds = []): void
    {
        $limit = (int) $settings->get('max_snapshots', '20');
        if ($limit <= 0) return;
        $rows = $db->query('SELECT id, filename FROM snapshots ORDER BY created_at DESC, id DESC');
        $protected = array_fill_keys(self::protectedIds($db, $currentIds), true);
        $protectedCount = count(array_filter($rows, static fn (array $row): bool => isset($protected[(int) $row['id']])));
        $ordinaryBudget = max(0, $limit - $protectedCount);
        foreach ($rows as $row) {
            if (isset($protected[(int) $row['id']])) continue;
            if ($ordinaryBudget-- > 0) continue;
            self::remove($db, $snapshotDir, $row);
        }
    }

    /** Do not discard metadata when the archive could not be removed. */
    public static function remove(Database $db, string $snapshotDir, array $row): void
    {
        $filename = $row['filename'];
        if (!is_string($filename) || basename($filename) !== $filename) throw new \RuntimeException('Invalid snapshot archive path.');
        $path = rtrim($snapshotDir, '/\\') . '/' . $filename;
        if ((file_exists($path) || is_link($path)) && !@unlink($path)) {
            throw new \RuntimeException('Could not remove snapshot #' . (int) $row['id'] . '. Check snapshot directory permissions and available storage.');
        }
        $db->delete('snapshots', 'id = ?', [$row['id']]);
    }
}
