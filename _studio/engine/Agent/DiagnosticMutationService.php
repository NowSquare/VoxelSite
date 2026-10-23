<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, FileManager, RevisionManager, SiteMutationLock, SiteWorkspace};

/** Explicit, retained diagnostic actions; ordinary reads never enter this class. */
final class DiagnosticMutationService
{
    private OperationRunner $runner;
    public function __construct(private Database $db, private ActorPolicy $policy, private SiteWorkspace $workspace,
        private OperationStore $store, private string $logsRoot, private DiagnosticsService $reads)
    { $this->runner = new OperationRunner($db, $policy, $store, $workspace->mutationLockPath()); }
    public static function inputSchema(string $action): array
    {
        $id = ['type' => 'string', 'pattern' => '^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$'];
        $version = ['type' => 'string', 'pattern' => '^[a-f0-9]{64}$'];
        $fields = ['operation_id' => $id] + match ($action) {
            'logs_delete' => ['files' => ['type' => 'array', 'minItems' => 1, 'maxItems' => 50,
                'items' => ['type' => 'string', 'pattern' => '^[A-Za-z0-9][A-Za-z0-9_.-]{0,100}\\.log$']], 'inventory_version' => $version],
            'history_delete' => ['entries' => ['type' => 'array', 'minItems' => 1, 'maxItems' => 50,
                'items' => self::object(['id' => ['type' => 'integer', 'minimum' => 1], 'version' => $version])]],
            'repair', 'cancel' => ['prompt_id' => ['type' => 'integer', 'minimum' => 1], 'version' => $version,
                'draft_version' => ['type' => 'string', 'pattern' => '^draft:[0-9]+$']],
            default => throw new \InvalidArgumentException('Unknown diagnostic mutation.'),
        };
        return self::object($fields);
    }
    public static function resultSchema(): array
    {
        return self::object(['action' => ['enum' => ['logs_delete', 'history_delete', 'repair', 'cancel']],
            'affected_count' => ['type' => 'integer'], 'paths' => ['type' => 'array', 'items' => ['type' => 'string']],
            'revision_id' => ['type' => ['integer', 'null']], 'provider_calls' => ['const' => 0]]);
    }
    public function execute(OperationActor $actor, string $action, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema($action));
        $this->runner = new OperationRunner($this->db, $this->policy, $this->store, $this->workspace->mutationLockPath(), $action === 'repair');
        $scopes = self::scopes($action); $this->policy->require($actor, $scopes);
        $digest = CanonicalJson::digest($input); $kind = 'diagnostics.' . $action;
        $row = $this->db->queryOne('SELECT * FROM agent_configuration_requests WHERE actor_key=? AND operation_id=?', [$actor->identity(), $input->operation_id]);
        if ($row && ($row['kind'] !== $kind || $row['request_digest'] !== $digest)) throw new OperationException('idempotency_conflict', 'This diagnostic action belongs to different input.');
        if (!$row) {
            $lock = SiteMutationLock::acquire($this->workspace->mutationLockPath(), $this->db);
            $payload = $this->prepare($actor, $action, $input);
            if ($this->db->count('agent_configuration_requests', 'payload_json IS NOT NULL') >= 100) throw new OperationException('size_limit', 'Too many retained administrative preparations.');
            $row = ['id' => 'diagnostic_' . bin2hex(random_bytes(16))];
            $this->db->insert('agent_configuration_requests', $row + ['actor_key' => $actor->identity(), 'operation_id' => $input->operation_id,
                'kind' => $kind, 'request_digest' => $digest, 'payload_json' => CanonicalJson::encode($payload), 'created_at' => time()]);
            unset($lock);
        }
        return $this->runner->start($actor, $input->operation_id, $kind, $input, $digest, $row['id'], $scopes,
            fn($op) => $this->step($actor, $op), fn($op) => $this->restore($op));
    }
    public function continue(OperationActor $actor, string $id, int $checkpoint): array
    {
        $action = $this->action($actor, $id);
        $this->runner = new OperationRunner($this->db, $this->policy, $this->store, $this->workspace->mutationLockPath(), $action === 'repair');
        return $this->runner->continue($actor, $id, $checkpoint, self::scopes($action),
            fn($op) => $this->step($actor, $op), fn($op) => $this->restore($op), fn($op) => $this->consistent($op));
    }
    public function recover(OperationActor $actor, string $id): array
    {
        $action = $this->action($actor, $id);
        return $this->runner->recover($actor, $id, self::scopes($action), fn($op) => $this->restore($op));
    }
    private function action(OperationActor $actor, string $id): string
    {
        $kind = $this->store->get($actor, $id)['kind']; $action = substr($kind, 12);
        if (!str_starts_with($kind, 'diagnostics.') || !in_array($action, ['logs_delete', 'history_delete', 'repair', 'cancel'], true)) throw new OperationException('invalid_schema', 'Use this operation’s own continuation.');
        return $action;
    }
    private function prepare(OperationActor $actor, string $action, \stdClass $input): array
    {
        $payload = ['action' => $action, 'files' => [], 'rows' => [], 'draft_version' => $this->workspace->status()['draft_version']];
        if ($action === 'logs_delete') {
            $listing = $this->reads->logs($actor, (object) ['limit' => 50]);
            if ($listing['inventory_version'] !== $input->inventory_version) throw new OperationException('content_conflict', 'The log inventory changed. Review it again.');
            $total = 0;
            if (count(array_unique($input->files)) !== count($input->files)) throw new OperationException('invalid_schema', 'Choose each log once.');
            foreach ($input->files as $name) {
                $bytes = $this->readFile($this->logsRoot, $name, DiagnosticsService::MAX_LOG_BYTES);
                if ($bytes === null || ($total += strlen($bytes)) > WorkspaceFiles::MAX_BYTES) throw new OperationException('size_limit', 'Selected logs are unavailable or exceed the 32 MiB deletion budget.');
                $payload['files'][$name] = ['before' => base64_encode($bytes), 'after' => null];
            }
        } elseif ($action === 'history_delete') {
            foreach ($input->entries as $entry) {
                $row = $this->prompt($actor, $entry->id);
                if ($row['status'] === 'streaming' || self::promptVersion($row) !== $entry->version) throw new OperationException('content_conflict', 'History changed or is still running. Review its current state.');
                $payload['rows'][(string) $entry->id] = self::promptVersion($row);
            }
            if (count($payload['rows']) !== count($input->entries)) throw new OperationException('invalid_schema', 'Choose each history entry once.');
        } else {
            $row = $this->prompt($actor, $input->prompt_id);
            if ($row['status'] !== 'streaming' || (strtotime($row['last_progress_at'] ?: $row['created_at']) ?: time()) > time() - 180) throw new OperationException('content_conflict', 'Only an interrupted generation with no heartbeat for three minutes can be repaired or cancelled.');
            if (self::promptVersion($row) !== $input->version || 'draft:' . $payload['draft_version'] !== $input->draft_version) throw new OperationException('content_conflict', 'The interrupted generation or draft changed. Review it again.');
            $payload['rows'][(string) $row['id']] = self::promptVersion($row);
            if ($action === 'repair') {
                $source = WorkspaceFiles::read($this->workspace); $candidate = $this->compile($source);
                $payload['source_hashes'] = WorkspaceFiles::hashes($source);
                foreach (array_unique(array_merge(array_keys($source), array_keys($candidate))) as $path) {
                    $before = $source[$path] ?? null; $after = $candidate[$path] ?? null;
                    if ($before === $after) continue;
                    $payload['files'][$path] = ['before' => $before === null ? null : base64_encode($before), 'after' => $after === null ? null : base64_encode($after)];
                }
            }
        }
        return $payload;
    }
    private function step(OperationActor $actor, array $op): array
    {
        $payload = $this->payload($op);
        if (!$this->consistent($op)) throw new OperationException('content_conflict', 'Diagnostic inputs changed after review.');
        foreach ($payload['rows'] as $id => $version) if (self::promptVersion($this->prompt($actor, (int) $id)) !== $version) throw new OperationException('content_conflict', 'The selected history changed.');
        if ($payload['action'] === 'repair' && !$op['recovery']
            && WorkspaceFiles::hashes(WorkspaceFiles::read($this->workspace)) !== $payload['source_hashes']) throw new OperationException('content_conflict', 'The draft changed before style repair.');
        $this->store->recordRecovery($actor, $op['operation_id'], $op['lease_token'], ['request_id' => $op['preparation_id']]);
        $root = $payload['action'] === 'logs_delete' ? $this->logsRoot : $this->workspace->draftRoot();
        foreach ($payload['files'] as $path => $file) $this->write($root, $path, $file['after']);
        $result = ['action' => $payload['action'], 'affected_count' => count($payload['rows']) + count($payload['files']),
            'paths' => array_keys($payload['files']), 'revision_id' => null, 'provider_calls' => 0];
        $commit = function (?int $revisionId = null) use ($actor, $op, $payload, $result): void {
            $result['revision_id'] = $revisionId;
            $this->store->finish($actor, $op['operation_id'], $op['lease_token'], 'succeeded', $result, null, function () use ($actor, $payload, $op): void {
                foreach ($payload['rows'] as $id => $_) {
                    if ($payload['action'] === 'history_delete') $this->db->delete('prompt_log', 'id=? AND user_id=?', [(int) $id, $actor->userId]);
                    else $this->db->update('prompt_log', ['status' => $payload['action'] === 'repair' ? 'partial' : 'error',
                        'error_message' => $payload['action'] === 'repair' ? 'Interrupted generation styles repaired explicitly.' : 'Interrupted generation cancelled explicitly.'], 'id=? AND user_id=?', [(int) $id, $actor->userId]);
                }
                if ($payload['action'] === 'repair' && $payload['files']) $this->db->update('site_workspace_state',
                    ['draft_version' => $payload['draft_version'] + 1, 'updated_at' => time()], 'id=1');
                $this->db->update('agent_configuration_requests', ['payload_json' => null], 'id=?', [$op['preparation_id']]);
            });
        };
        if ($payload['action'] === 'repair' && $payload['files']) {
            $before = $changes = [];
            foreach ($payload['files'] as $path => $file) { $before[$path] = $file['before'] === null ? null : base64_decode($file['before'], true); $changes[] = ['path' => $path, 'action' => $file['after'] === null ? 'delete' : 'write']; }
            (new RevisionManager($this->db, null, new FileManager($this->db, $this->workspace),
                getenv('VS_TEST_REVISIONS_DIR') ?: dirname($this->workspace->draftRoot()) . '/revisions'))->recordAppliedRevision(
                $changes, 'Repair interrupted generation styles', $actor->userId, $before, $commit, true);
        } else $commit();
        return ['committed' => true];
    }
    private function consistent(array $op): bool
    {
        $payload = $this->payload($op);
        if (in_array($payload['action'], ['repair', 'cancel'], true) && $this->workspace->status()['draft_version'] !== $payload['draft_version']) return false;
        if ($payload['action'] === 'repair') {
            $actual = WorkspaceFiles::hashes(WorkspaceFiles::read($this->workspace));
            $expected = $payload['source_hashes'];
            foreach ($payload['files'] as $path => $_) { unset($actual[$path], $expected[$path]); }
            if ($actual !== $expected) return false;
        }
        $root = $payload['action'] === 'logs_delete' ? $this->logsRoot : $this->workspace->draftRoot();
        foreach ($payload['files'] as $path => $file) {
            $bytes = $this->readFile($root, $path, WorkspaceFiles::MAX_BYTES);
            $encoded = $bytes === null ? null : base64_encode($bytes);
            if ($encoded !== $file['before'] && $encoded !== $file['after']) return false;
        }
        return true;
    }
    /** Trusted rollback-only seam; cannot be used as normal actor continuation. */
    public function restoreForOwnerRecovery(array $operation): array
    {
        OwnerRecoveryService::assertClaim($this->db, $this->workspace, $operation);
        return $this->restore($operation);
    }

    private function restore(array $op): array
    {
        if (!$op['recovery']) return ['restored' => true, 'remaining_paths' => []];
        $payload = $this->payload($op);
        if (!$this->consistent($op)) return ['restored' => false, 'remaining_paths' => array_keys($payload['files']) ?: ['history_state']];
        $root = $payload['action'] === 'logs_delete' ? $this->logsRoot : $this->workspace->draftRoot();
        foreach ($payload['files'] as $path => $file) $this->write($root, $path, $file['before']);
        foreach ($payload['files'] as $path => $file) {
            $bytes = $this->readFile($root, $path, WorkspaceFiles::MAX_BYTES);
            if (($bytes === null ? null : base64_encode($bytes)) !== $file['before']) return ['restored' => false, 'remaining_paths' => [$path]];
        }
        return ['restored' => true, 'remaining_paths' => []];
    }
    private function compile(array $files): array
    {
        $root = dirname($this->workspace->draftRoot()) . '/data/agent/repair-staging/' . bin2hex(random_bytes(16));
        try {
            WorkspaceFiles::write($root, '.htaccess', SiteWorkspace::ACCESS_MARKER . "\nRequire all denied\nDeny from all\n");
            foreach ($files as $path => $bytes) WorkspaceFiles::write($root, $path, $bytes);
            $stage = new SiteWorkspace($this->db, $root, $this->workspace->publishedRoot(), $root . '-state', $this->workspace->publishedAssetsRoot(), false);
            if ((new \ReflectionMethod(FileManager::class, '__construct'))->getNumberOfParameters() < 2) throw new \LogicException('Explicit workspace injection required.');
            $fm = new FileManager($this->db, $stage); $fm->ensureStyleCssExists();
            if (!($fm->compileTailwind()['ok'] ?? false)) throw new OperationException('host_capability_unavailable', 'Style repair could not compile before changing the draft.');
            return WorkspaceFiles::read($stage);
        } finally {
            if (is_dir($root)) {
                $inventory = SiteWorkspace::inventory($root); $paths = array_keys($inventory['files'] + $inventory['directories']);
                usort($paths, fn($a, $b) => strlen($b) <=> strlen($a));
                foreach ($paths as $path) { $full = SiteWorkspace::resolveWithin($root, $path); is_dir($full) ? rmdir($full) : unlink($full); }
                rmdir($root);
            }
        }
    }
    private function prompt(OperationActor $actor, int $id): array
    {
        $row = $this->db->queryOne('SELECT id,status,created_at,last_progress_at FROM prompt_log WHERE id=? AND user_id=?', [$id, $actor->userId]);
        if (!$row) throw new OperationException('permission_denied', 'This history entry is unavailable to this account.');
        return $row;
    }
    public static function promptVersion(array $row): string
    { return CanonicalJson::digest(array_intersect_key($row, array_flip(['id', 'status', 'created_at', 'last_progress_at']))); }
    private function readFile(string $root, string $relative, int $max): ?string
    {
        $path = SiteWorkspace::resolveWithin($root, $relative);
        if (!file_exists($path)) return null;
        if (!is_file($path) || filesize($path) > $max) throw new OperationException('size_limit', 'Diagnostic source exceeds its file budget.');
        $size = filesize($path); $bytes = file_get_contents($path, false, null, 0, $size + 1);
        if (!is_string($bytes) || strlen($bytes) !== $size) throw new OperationException('content_conflict', 'Diagnostic source changed during capture.');
        return $bytes;
    }
    private function write(string $root, string $path, ?string $encoded): void
    {
        if ($encoded !== null) WorkspaceFiles::write($root, $path, base64_decode($encoded, true));
        else { $target = SiteWorkspace::resolveWithin($root, $path); if (file_exists($target) && !unlink($target)) throw new OperationException('host_capability_unavailable', 'Cannot delete the reviewed diagnostic file.'); }
    }
    private function payload(array $op): array
    {
        $value = $this->db->scalar('SELECT payload_json FROM agent_configuration_requests WHERE id=?', [$op['preparation_id']]);
        if (!is_string($value)) throw new OperationException('content_conflict', 'Retained diagnostic preparation is unavailable.');
        return json_decode($value, true, 64, JSON_THROW_ON_ERROR);
    }
    private static function scopes(string $action): array
    { return match ($action) { 'logs_delete' => ['diagnostics:read', 'history:write'], 'repair' => ['history:read', 'files:write', 'assets:write'], 'cancel' => ['history:read', 'files:write'], default => ['history:write'] }; }
    private static function object(array $fields): array
    { return ['type' => 'object', 'properties' => $fields, 'required' => array_keys($fields), 'additionalProperties' => false]; }
}
