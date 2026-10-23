<?php
declare(strict_types=1);
namespace VoxelSite;

/** One cooperating website writer at a time, including background generation. */
final class SiteMutationLock
{
    private static array $locks = [];
    private function __construct(private string $path) {}
    private function __clone() {}

    public static function acquire(?string $path = null, ?Database $db = null, ?string $operationId = null, ?string $businessOperationId = null): self
    {
        $path ??= getenv('VS_TEST_MUTATION_LOCK') ?: dirname(__DIR__) . '/data/site-mutation.lock';
        if (isset(self::$locks[$path])) {
            self::assertReservation($db ?? Database::currentInstance(), $operationId ?? self::$locks[$path]['operationId']);
            self::assertBusinessReservation($db ?? Database::currentInstance(), $businessOperationId ?? self::$locks[$path]['businessOperationId']);
            self::$locks[$path]['count']++;
            return new self($path);
        }
        if (!is_dir(dirname($path)) && !mkdir(dirname($path), 0755, true)) {
            throw new \RuntimeException('Cannot create website lock directory.');
        }
        $handle = fopen($path, 'c');
        if (!$handle || !flock($handle, LOCK_EX | LOCK_NB)) {
            if ($handle) { fclose($handle); }
            throw new \VoxelSite\Agent\OperationException('site_busy',
                'Another website change is in progress. Wait for it to finish and try again.');
        }
        try {
            self::assertReservation($db ?? Database::currentInstance(), $operationId);
            self::assertBusinessReservation($db ?? Database::currentInstance(), $businessOperationId);
        } catch (\Throwable $e) {
            flock($handle, LOCK_UN);
            fclose($handle);
            throw $e;
        }
        self::$locks[$path] = ['handle' => $handle, 'count' => 1, 'operationId' => $operationId,'businessOperationId'=>$businessOperationId];
        return new self($path);
    }

    public static function held(?string $path = null): bool
    {
        $path ??= getenv('VS_TEST_MUTATION_LOCK') ?: dirname(__DIR__) . '/data/site-mutation.lock';
        return isset(self::$locks[$path]);
    }

    /**
     * Legacy writers invalidate once per common lock. Retained operations own
     * their version transition and record it atomically with their final result.
     * Call before replacing bytes: a failed write may conservatively invalidate
     * a review, but a partial write must never leave the old version accepted.
     */
    public static function draftWillChange(Database $db, ?string $path = null): void
    {
        $path ??= getenv('VS_TEST_MUTATION_LOCK') ?: dirname(__DIR__) . '/data/site-mutation.lock';
        if (!isset(self::$locks[$path])) throw new \LogicException('Draft changes require the common site lock.');
        if (self::$locks[$path]['operationId'] !== null) return;
        if (!$db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'site_workspace_state'")) return;
        $state = $db->queryOne('SELECT format,draft_version FROM site_workspace_state WHERE id = 1');
        if (!$state || (int) $state['format'] !== SiteWorkspace::FORMAT) return;
        $version = (int) $state['draft_version'];
        if ((self::$locks[$path]['invalidatedVersion'] ?? null) === $version) return;
        $db->getPdo()->prepare('UPDATE site_workspace_state SET draft_version = draft_version + 1, updated_at = ? WHERE id = 1')->execute([time()]);
        self::$locks[$path]['invalidatedVersion'] = $version + 1;
    }

    /** Attach a newly persisted reservation to nested calls in the same request. */
    public static function bindOperation(string $operationId, ?string $path = null): void
    {
        $path ??= getenv('VS_TEST_MUTATION_LOCK') ?: dirname(__DIR__) . '/data/site-mutation.lock';
        if (!isset(self::$locks[$path])) throw new \LogicException('Cannot bind an operation without its site lock.');
        $owner = self::$locks[$path]['operationId'];
        if ($owner !== null && $owner !== $operationId) throw new \LogicException('The site lock already belongs to another operation.');
        self::$locks[$path]['operationId'] = $operationId;
    }

    private static function assertReservation(?Database $db, ?string $operationId): void
    {
        if ($db === null || !$db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'site_workspace_state'")) return;
        $reserved = $db->scalar('SELECT reservation_operation_id FROM site_workspace_state WHERE id = 1');
        if ($reserved === null || $reserved === $operationId) return;
        $state = $db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'agent_operations'")
            ? $db->scalar('SELECT state FROM agent_operations WHERE id = ?', [$reserved]) : 'recovery_required';
        throw new \VoxelSite\Agent\OperationException($state === 'recovery_required' ? 'recovery_required' : 'site_busy',
            $state === 'recovery_required'
                ? 'A retained operation needs recovery before another website change. Open Connections in Studio to inspect it.'
                : 'A retained operation reserves this workspace. Finish or recover it before another website change.');
    }

    private static function assertBusinessReservation(?Database $db,?string $operationId):void
    {
        if($db===null || !$db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='agent_business_changes'"))return;
        foreach($db->query("SELECT id FROM agent_business_changes WHERE status='prepared' LIMIT 2") as $row) {
            if($row['id']!==$operationId)throw new \VoxelSite\Agent\OperationException('recovery_required',
                'An interrupted Action configuration change must finish or recover before another website change.');
        }
    }

    public function __destruct()
    {
        if (!isset(self::$locks[$this->path])) { return; }
        if (--self::$locks[$this->path]['count'] === 0) {
            $handle = self::$locks[$this->path]['handle'];
            flock($handle, LOCK_UN);
            fclose($handle);
            unset(self::$locks[$this->path]);
        }
    }
}
