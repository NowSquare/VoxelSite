<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

use VoxelSite\{Database, SiteMutationLock, SiteWorkspace, SnapshotRetention, SnapshotService};

/** Exact archive removal. Retained releases and recovery dependencies cannot be deleted. */
final class SnapshotDeletionService
{
    private OperationRunner $runner;
    private const SCOPES = ['snapshots:read', 'snapshots:write'];
    public function __construct(private Database $db, private ActorPolicy $policy, private SiteWorkspace $workspace,
        private OperationStore $operations, private string $capturesRoot, private string $legacyRoot,
        private int $filesPerStep = 20, private ?\Closure $testHook = null)
    {
        if ($filesPerStep < 1 || $filesPerStep > 100) throw new \InvalidArgumentException('Bounded deletion steps are required.');
        $this->runner = new OperationRunner($db, $policy, $operations, $workspace->mutationLockPath(), false);
    }
    public static function inputSchema(string $method): array
    {
        $id = ['type' => 'string', 'maxLength' => 80];
        return self::object($method === 'inspect' ? ['snapshot_id' => $id] : [
            'operation_id' => ['type' => 'string', 'pattern' => '^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$'],
            'snapshot_id' => $id, 'version' => ['type' => 'string', 'pattern' => '^[a-f0-9]{64}$']]);
    }
    public static function outputSchema(): array
    {
        return self::object(['snapshot_id' => ['type' => 'string'], 'version' => ['type' => ['string', 'null']],
            'protected' => ['type' => 'boolean'], 'reason' => ['type' => ['string', 'null']],
            'files' => ['type' => 'array', 'maxItems' => SnapshotService::MAX_FILES, 'items' => self::object([
                'path' => ['type' => 'string'], 'sha256' => ['type' => 'string'], 'bytes' => ['type' => 'integer']])],
            'bytes' => ['type' => 'integer'], 'provider_calls' => ['const' => 0]]);
    }
    public static function resultSchema(): array
    {
        return self::object(['snapshot_id' => ['type' => 'string'], 'deleted' => ['const' => true],
            'version' => ['type' => 'string'], 'files_deleted' => ['type' => 'integer'],
            'bytes_deleted' => ['type' => 'integer'], 'provider_calls' => ['const' => 0]]);
    }
    public function inspect(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('inspect'));
        $this->policy->require($actor, ['snapshots:read']);
        $reason = $this->protection($input->snapshot_id);
        if ($reason !== null) return ['snapshot_id' => $input->snapshot_id, 'version' => null, 'protected' => true,
            'reason' => $reason, 'files' => [], 'bytes' => 0, 'provider_calls' => 0];
        $source = $this->source($input->snapshot_id);
        return ['snapshot_id' => $input->snapshot_id, 'version' => $source['version'], 'protected' => false,
            'reason' => null, 'files' => $source['review'], 'bytes' => $source['bytes'], 'provider_calls' => 0];
    }
    public function protection(string $id): ?string
    {
        if (preg_match('/^(publish|release|safety)_[a-f0-9]{32}$/D', $id)) return 'This archive is retained for publication or restoration recovery.';
        if (!preg_match('/^(snapshot_[a-f0-9]{32}|legacy_[1-9][0-9]*)$/D', $id)) throw new OperationException('invalid_schema', 'Choose a returned snapshot ID.');
        if ($this->db->count('agent_restore_plans', 'snapshot_id=?', [$id])) return 'A retained restoration review or audit depends on this snapshot.';
        if (str_starts_with($id, 'legacy_') && in_array((int) substr($id, 7), SnapshotRetention::protectedIds($this->db), true)) {
            return 'This snapshot is required for website recovery.';
        }
        if (str_starts_with($id, 'snapshot_')) {
            $row = $this->db->queryOne('SELECT status FROM site_snapshot_captures WHERE id=?', [$id]);
            if (!$row) throw new OperationException('not_found', 'The snapshot is unavailable.');
            if ($row['status'] !== 'valid') return 'Only a completed snapshot can be deleted.';
        }
        return null;
    }
    public function delete(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('delete'));
        return ProviderCallPolicy::runExternal(function () use ($actor, $input): array {
            $this->policy->require($actor, self::SCOPES);
            $digest = CanonicalJson::digest($input);
            $row = $this->db->queryOne('SELECT * FROM agent_snapshot_deletions WHERE actor_key=? AND operation_id=?', [$actor->identity(), $input->operation_id]);
            if ($row && !hash_equals($row['request_digest'], $digest)) throw new OperationException('idempotency_conflict', 'This deletion identity belongs to another request.');
            if (!$row) {
                $lock = SiteMutationLock::acquire($this->workspace->mutationLockPath(), $this->db);
                if (($reason = $this->protection($input->snapshot_id)) !== null) throw new OperationException('snapshot_required_for_recovery', $reason);
                $source = $this->source($input->snapshot_id);
                if (!hash_equals($source['version'], $input->version)) throw new OperationException('content_conflict', 'The archive changed. Inspect it again before deletion.');
                if ((int) $this->db->scalar('SELECT COALESCE(SUM(length(payload_json)),0) FROM agent_snapshot_deletions') + strlen(CanonicalJson::encode($source['payload'])) > 134217728) {
                    throw new OperationException('size_limit', 'Retained deletion recovery storage is full.');
                }
                $row = ['id' => 'snapshot_delete_' . bin2hex(random_bytes(16))];
                $this->db->transaction(function () use ($actor, $input, $digest, $source, $row): void {
                    $this->db->insert('agent_snapshot_deletions', $row + ['actor_key' => $actor->identity(), 'operation_id' => $input->operation_id,
                        'snapshot_id' => $input->snapshot_id, 'version' => $input->version, 'request_digest' => $digest,
                        'payload_json' => CanonicalJson::encode($source['payload']), 'payload_digest' => CanonicalJson::digest($source['payload']), 'created_at' => time()]);
                    $this->operations->prepare($actor, $input->operation_id, 'snapshots.delete', $input, $input->version, $row['id']);
                });
                if ($this->testHook !== null) ($this->testHook)('after_prepare', $row);
                unset($lock);
            }
            return $this->runner->start($actor, $input->operation_id, 'snapshots.delete', $input, $input->version, $row['id'], self::SCOPES,
                fn($op) => $this->step($actor, $op), fn($op) => $this->restore($op));
        });
    }
    public function continue(OperationActor $actor, string $id, int $checkpoint): array
    {
        $this->assertKind($actor, $id);
        return $this->runner->continue($actor, $id, $checkpoint, self::SCOPES,
            fn($op) => $this->step($actor, $op), fn($op) => $this->restore($op), fn($op) => $this->consistent($op));
    }
    public function recover(OperationActor $actor, string $id): array
    {
        $this->assertKind($actor, $id);
        return $this->runner->recover($actor, $id, self::SCOPES, fn($op) => $this->restore($op));
    }
    public function recoveryView(array $op): array
    {
        $payload = $this->payload($op); $out = [];
        foreach ($payload['files'] as $path => $file) $out[] = ['domain' => 'snapshots', 'path' => $path,
            'before_hash' => $file['sha256'], 'after_hash' => null,
            'current_hash' => $this->hash($this->root($payload), $path)];
        return $out;
    }
    public function restoreForOwnerRecovery(array $op): array
    {
        OwnerRecoveryService::assertClaim($this->db, $this->workspace, $op);
        return $this->restore($op);
    }
    /** Bounded maintenance preserves identities and never guesses that a worker did nothing. */
    public static function pruneTerminal(Database $db, string $lockPath, int $limit = 1): int
    {
        if (!SiteMutationLock::held($lockPath)) throw new \LogicException('Snapshot cleanup requires the common site lock.');
        if ($db->scalar('SELECT reservation_operation_id FROM site_workspace_state WHERE id=1') !== null) return 0;
        $rows = $db->query("SELECT d.id,o.id AS operation_id,o.state FROM agent_snapshot_deletions d
            JOIN agent_operations o ON o.preparation_id=d.id AND o.kind='snapshots.delete'
            WHERE d.payload_json IS NOT NULL AND (
                (o.state IN ('succeeded','failed_restored','expired','cancelled') AND o.result_pruned_at IS NOT NULL)
                OR (o.state='prepared' AND o.expires_at<=? AND o.checkpoint_number=0
                    AND o.lease_token IS NULL AND o.lease_expires_at IS NULL AND o.recovery_json='{}'))
            ORDER BY d.created_at LIMIT " . max(1, min(5, $limit)), [time()]);
        $count = 0;
        foreach ($rows as $row) {
            $count += $db->transaction(function () use ($db, $row): int {
                if ($row['state'] === 'prepared') {
                    $changed = $db->update('agent_operations', ['state' => 'expired', 'phase' => 'expired', 'updated_at' => time(),
                        'result_json' => CanonicalJson::encode(['provider_calls' => 0, 'error' => [
                            'code' => 'review_expired', 'message' => 'This unstarted archive deletion expired. No archive files were removed.']])],
                        "id=? AND state='prepared' AND expires_at<=? AND checkpoint_number=0
                            AND lease_token IS NULL AND lease_expires_at IS NULL AND recovery_json='{}'",
                        [$row['operation_id'], time()]);
                    if ($changed !== 1) return 0;
                }
                return $db->update('agent_snapshot_deletions', ['payload_json' => null], 'id=? AND payload_json IS NOT NULL', [$row['id']]);
            });
        }
        return $count;
    }
    private function step(OperationActor $actor, array $op): array
    {
        $payload = $this->payload($op);
        if (($reason = $this->protection($payload['snapshot_id'])) !== null) throw new OperationException('snapshot_required_for_recovery', $reason);
        if (!$this->consistent($op)) throw new OperationException('content_conflict', 'The retained archive changed after review.');
        $this->operations->recordRecovery($actor, $op['operation_id'], $op['lease_token'], ['deletion_id' => $op['preparation_id']]);
        $op['recovery'] = ['deletion_id' => $op['preparation_id']];
        $paths = array_keys($payload['files']); $index = (int) ($op['checkpoint']['next_file'] ?? 0);
        $end = min(count($paths), $index + $this->filesPerStep);
        for (; $index < $end; $index++) {
            $path = SiteWorkspace::resolveWithin($this->root($payload), $paths[$index]);
            if (file_exists($path) && !unlink($path)) throw new OperationException('host_capability_unavailable', 'Cannot remove the reviewed archive file.');
            if ($this->testHook !== null) ($this->testHook)('after_file', $op);
        }
        if ($index < count($paths)) return ['complete' => false, 'phase' => 'snapshot_delete',
            'checkpoint' => ['next_file' => $index], 'recovery' => ['deletion_id' => $op['preparation_id']]];
        if (!$this->consistent($op)) throw new OperationException('content_conflict', 'The archive changed during deletion.');
        foreach ($paths as $path) if ($this->hash($this->root($payload), $path) !== null) throw new OperationException('content_conflict', 'Archive deletion is incomplete.');
        // Empty directories carry no user bytes. Remove only the exact captured directories.
        foreach (array_reverse($payload['directories']) as $path) {
            $absolute = SiteWorkspace::resolveWithin($this->root($payload), $path);
            if (is_dir($absolute) && !rmdir($absolute)) throw new OperationException('content_conflict', 'The archive contains an unreviewed entry.');
        }
        $result = ['snapshot_id' => $payload['snapshot_id'], 'deleted' => true, 'version' => $op['before_version'],
            'files_deleted' => count($paths), 'bytes_deleted' => $payload['bytes'], 'provider_calls' => 0];
        $this->operations->finish($actor, $op['operation_id'], $op['lease_token'], 'succeeded', $result, null, function () use ($payload, $op): void {
            if ($payload['type'] === 'legacy') $this->db->delete('snapshots', 'id=?', [$payload['row']['id']]);
            else $this->db->update('site_snapshot_captures', ['status' => 'failed', 'staged_bytes' => 0], 'id=?', [$payload['snapshot_id']]);
            $this->db->update('agent_snapshot_deletions', ['payload_json' => null, 'deleted_at' => time()], 'id=?', [$op['preparation_id']]);
        });
        return ['committed' => true];
    }
    private function consistent(array $op): bool
    {
        $payload = $this->payload($op);
        $table = $payload['type'] === 'legacy' ? 'snapshots' : 'site_snapshot_captures';
        if (CanonicalJson::digest($this->db->queryOne('SELECT * FROM ' . $table . ' WHERE id=?', [$payload['row']['id']])) !== CanonicalJson::digest($payload['row'])) return false;
        foreach ($payload['files'] as $path => $file) {
            $hash = $this->hash($this->root($payload), $path);
            if ($hash !== null && $hash !== $file['sha256']) return false;
            if (!$op['recovery'] && $hash === null) return false;
        }
        if ($payload['type'] === 'capture') {
            $actual = $this->inventory($this->capturesRoot, $payload['snapshot_id']);
            if (array_diff(array_keys($actual['files']), array_keys($payload['files']))) return false;
            if (array_diff($actual['directories'], $payload['directories'])) return false;
        }
        return true;
    }
    private function restore(array $op): array
    {
        if (!$op['recovery']) return ['restored' => true, 'remaining_paths' => []];
        $payload = $this->payload($op);
        if (!$this->consistent($op)) return ['restored' => false, 'remaining_paths' => array_keys($payload['files'])];
        foreach ($payload['directories'] as $path) {
            $absolute = SiteWorkspace::resolveWithin($this->root($payload), $path);
            if (!is_dir($absolute) && !mkdir($absolute, 0700, true)) throw new OperationException('host_capability_unavailable', 'Cannot restore archive directory.');
        }
        foreach ($payload['files'] as $path => $file) WorkspaceFiles::write($this->root($payload), $path, base64_decode($file['before'], true));
        foreach ($payload['files'] as $path => $file) if ($this->hash($this->root($payload), $path) !== $file['sha256']) return ['restored' => false, 'remaining_paths' => [$path]];
        return ['restored' => true, 'remaining_paths' => []];
    }
    private function source(string $id): array
    {
        $legacy = str_starts_with($id, 'legacy_');
        $row = $this->db->queryOne('SELECT * FROM ' . ($legacy ? 'snapshots' : 'site_snapshot_captures') . ' WHERE id=?', [$legacy ? (int) substr($id, 7) : $id]);
        if (!$row) throw new OperationException('not_found', 'The snapshot is unavailable.');
        if ($legacy && (!is_string($row['filename']) || basename($row['filename']) !== $row['filename'])) throw new OperationException('invalid_path', 'The archive filename is unsafe.');
        $root = $legacy ? $this->legacyRoot : $this->capturesRoot;
        if (!$legacy && !is_dir(SiteWorkspace::resolveWithin($root, $id))) throw new OperationException('content_conflict', 'The retained archive directory is missing.');
        $inventory = $legacy ? ['files' => [$row['filename'] => $this->read($root, $row['filename'])], 'directories' => []]
            : $this->inventory($root, $id);
        $files = $review = []; $bytes = 0;
        foreach ($inventory['files'] as $path => $content) {
            $bytes += strlen($content);
            if ($bytes > SnapshotService::MAX_BYTES) throw new OperationException('size_limit', 'The archive exceeds the 32 MiB deletion budget.');
            $hash = hash('sha256', $content);
            $files[$path] = ['before' => base64_encode($content), 'sha256' => $hash];
            $review[] = ['path' => $path, 'sha256' => $hash, 'bytes' => strlen($content)];
        }
        $version = CanonicalJson::digest(['row' => $row, 'files' => $review, 'directories' => $inventory['directories']]);
        return ['version' => $version, 'review' => $review, 'bytes' => $bytes, 'payload' => [
            'snapshot_id' => $id, 'type' => $legacy ? 'legacy' : 'capture', 'row' => $row, 'files' => $files,
            'directories' => $inventory['directories'], 'bytes' => $bytes]];
    }
    private function inventory(string $root, string $directory): array
    {
        $files = []; $directories = []; $bytes = 0; $entries = 0;
        $walk = function (string $path, int $depth) use (&$walk, &$files, &$directories, &$bytes, &$entries, $root): void {
            if ($depth > 32) throw new OperationException('size_limit', 'Archive directory depth exceeds its budget.');
            $absolute = SiteWorkspace::resolveWithin($root, $path);
            if (!file_exists($absolute)) return;
            if (!is_dir($absolute)) throw new OperationException('invalid_path', 'The archive directory is unsafe.');
            $directories[] = $path;
            foreach (new \DirectoryIterator($absolute) as $entry) {
                if ($entry->isDot()) continue;
                if (++$entries > SnapshotService::MAX_FILES * 4) throw new OperationException('size_limit', 'Archive inventory exceeds its entry budget.');
                $relative = $path . '/' . $entry->getFilename();
                $safe = SiteWorkspace::resolveWithin($root, $relative);
                if (is_dir($safe)) $walk($relative, $depth + 1);
                else {
                    if (count($files) >= SnapshotService::MAX_FILES) throw new OperationException('size_limit', 'The archive has too many files.');
                    $content = $this->read($root, $relative); $bytes += strlen($content);
                    if ($bytes > SnapshotService::MAX_BYTES) throw new OperationException('size_limit', 'Archive bytes exceed their budget.');
                    $files[$relative] = $content;
                }
            }
        };
        $walk($directory, 0); ksort($files, SORT_STRING); sort($directories, SORT_STRING);
        return compact('files', 'directories');
    }
    private function read(string $root, string $path): string
    {
        $absolute = SiteWorkspace::resolveWithin($root, $path);
        $before = lstat($absolute);
        if (!$before || !is_file($absolute) || $before['size'] > SnapshotService::MAX_BYTES) throw new OperationException('size_limit', 'The archive file is unavailable or oversized.');
        $bytes = file_get_contents($absolute, false, null, 0, $before['size'] + 1);
        clearstatcache(true, $absolute); $after = lstat($absolute);
        if (!is_string($bytes) || !$after || strlen($bytes) !== $before['size'] || $before['ino'] !== $after['ino']
            || $before['mtime'] !== $after['mtime'] || $before['size'] !== $after['size']) throw new OperationException('content_conflict', 'The archive changed while reading.');
        return $bytes;
    }
    private function hash(string $root, string $path): ?string
    {
        $absolute = SiteWorkspace::resolveWithin($root, $path);
        return file_exists($absolute) ? hash('sha256', $this->read($root, $path)) : null;
    }
    private function payload(array $op): array
    {
        if ($op['kind'] !== 'snapshots.delete') throw new OperationException('invalid_schema', 'Use this operation’s own archive journal.');
        $row = $this->db->queryOne('SELECT * FROM agent_snapshot_deletions WHERE id=? AND actor_key=? AND operation_id=?',
            [$op['preparation_id'], $op['actor_key'], $op['operation_id']]);
        if (!is_string($row['payload_json'] ?? null) || strlen($row['payload_json']) > 47185920) throw new OperationException('recovery_required', 'The deletion originals are unavailable.');
        $payload = json_decode($row['payload_json'], true, 64, JSON_THROW_ON_ERROR);
        if (!hash_equals($row['payload_digest'], CanonicalJson::digest($payload))) throw new OperationException('recovery_required', 'The retained deletion journal failed verification.');
        return $payload;
    }
    private function root(array $payload): string { return $payload['type'] === 'legacy' ? $this->legacyRoot : $this->capturesRoot; }
    private function assertKind(OperationActor $actor, string $id): void
    { if ($this->operations->get($actor, $id)['kind'] !== 'snapshots.delete') throw new OperationException('invalid_schema', 'Use this operation’s own continuation.'); }
    private static function object(array $fields): array
    { return ['type' => 'object', 'properties' => $fields, 'required' => array_keys($fields), 'additionalProperties' => false]; }
}
