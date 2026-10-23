<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, Settings, SiteWorkspace};

/** Favicon is explicit live configuration, independent of draft publication. */
final class FaviconService
{
    private OperationRunner $runner;
    public function __construct(private Database $db, private ActorPolicy $policy, private SiteWorkspace $workspace,
        private OperationStore $operations, private ?AssetTransferService $uploads = null)
    { $this->runner = new OperationRunner($db, $policy, $operations, $workspace->mutationLockPath(), false); }
    public static function inputSchema(string $method): array
    {
        $fields = ['operation_id' => ['type' => 'string', 'pattern' => '^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$'],
            'version' => ['type' => 'string', 'pattern' => '^[a-f0-9]{64}$']];
        if ($method === 'read') $fields = [];
        elseif ($method === 'update') $fields += ['upload_id' => ['type' => 'string', 'pattern' => '^upload_[a-f0-9]{32}$'],
            'path' => ['type' => 'string', 'pattern' => '^assets/images/[A-Za-z0-9_./-]+\\.ico$', 'maxLength' => 200]];
        elseif ($method !== 'delete') throw new \InvalidArgumentException('Unknown favicon action.');
        return self::object($fields);
    }
    public static function outputSchema(): array
    { return self::object(['version' => ['type' => 'string'], 'configured' => ['type' => 'boolean'], 'sha256' => ['type' => ['string', 'null']],
        'url' => ['type' => ['string', 'null']], 'effect' => ['const' => 'live_configuration'], 'provider_calls' => ['const' => 0]]); }
    public function read(OperationActor $actor): array
    { $this->policy->require($actor, ['settings:read']); return $this->state(); }
    public function update(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('update')); $this->policy->require($actor, ['settings:write', 'assets:write']);
        $uploads = $this->uploads ?? new AssetTransferService($this->db, $this->policy, $this->workspace,
            dirname($this->workspace->draftRoot()) . '/data/agent/uploads');
        $bytes = $uploads->finalizedBytes($actor, $input->upload_id, $input->path);
        return $this->updateBytes($actor, $input->operation_id, $input->version, $bytes);
    }
    public function delete(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('delete'));
        return $this->updateBytes($actor, $input->operation_id, $input->version, null);
    }
    /** Trusted bounded multipart adapter; never accepts a caller-controlled target path. */
    public function updateBytes(OperationActor $actor, string $id, string $version, ?string $bytes): array
    {
        JsonSchema::validate((object) ['operation_id' => $id, 'version' => $version], self::inputSchema('delete'));
        $this->policy->require($actor, ['settings:write']);
        if ($bytes !== null) {
            if (strlen($bytes) > 524288) throw new OperationException('size_limit', 'Use an ICO file no larger than 512 KiB.');
            AssetDocumentValidator::icon($bytes);
        }
        $request = (object) ['version' => $version, 'sha256' => $bytes === null ? null : hash('sha256', $bytes), 'effect' => 'live_configuration'];
        $digest = CanonicalJson::digest($request); $kind = $bytes === null ? 'settings.favicon_delete' : 'settings.favicon_update';
        $row = $this->db->queryOne('SELECT * FROM agent_configuration_requests WHERE actor_key=? AND operation_id=?', [$actor->identity(), $id]);
        if ($row && ($row['kind'] !== $kind || $row['request_digest'] !== $digest)) throw new OperationException('idempotency_conflict', 'This favicon action belongs to different input.');
        if (!$row) {
            $lock = \VoxelSite\SiteMutationLock::acquire($this->workspace->mutationLockPath(), $this->db);
            try {
                $this->policy->require($actor, ['settings:write']);
                $before = $this->bytes(); $setting = (new Settings($this->db))->get('site_favicon');
                if (CanonicalJson::digest(['hash' => $before === null ? null : hash('sha256', $before), 'setting' => $setting]) !== $version) {
                    throw new OperationException('content_conflict', 'The live favicon changed. Review it again.');
                }
                if ($this->db->count('agent_configuration_requests', 'payload_json IS NOT NULL') >= 100) throw new OperationException('size_limit', 'Too many pending administrative requests.');
                $payload = ['before' => $before === null ? null : base64_encode($before),
                    'after' => $bytes === null ? null : base64_encode($bytes), 'setting' => $setting];
                $row = ['id' => 'favicon_' . bin2hex(random_bytes(16))];
                $this->db->insert('agent_configuration_requests', $row + ['actor_key' => $actor->identity(), 'operation_id' => $id, 'kind' => $kind,
                    'request_digest' => $digest, 'payload_json' => CanonicalJson::encode($payload), 'created_at' => time()]);
            } finally { unset($lock); }
        }
        return $this->runner->start($actor, $id, $kind, $request, $version, $row['id'], ['settings:write'],
            fn($op) => $this->step($actor, $op), fn($op) => $this->restore($op));
    }
    public function continue(OperationActor $actor, string $id, int $checkpoint): array
    {
        $this->owned($actor, $id);
        return $this->runner->continue($actor, $id, $checkpoint, ['settings:write'], fn($op) => $this->step($actor, $op),
            fn($op) => $this->restore($op), fn($op) => $this->consistent($op));
    }
    public function recover(OperationActor $actor, string $id): array
    {
        $this->owned($actor, $id);
        return $this->runner->recover($actor, $id, ['settings:write'], fn($op) => $this->restore($op));
    }
    private function owned(OperationActor $actor, string $id): void
    { if (!in_array($this->operations->get($actor, $id)['kind'], ['settings.favicon_update', 'settings.favicon_delete'], true)) throw new OperationException('invalid_schema', 'Use this operation’s own continuation.'); }
    private function step(OperationActor $actor, array $op): array
    {
        $payload = $this->payload($op);
        if (!$this->consistent($op)) throw new OperationException('content_conflict', 'The reviewed live favicon changed.');
        $this->operations->recordRecovery($actor, $op['operation_id'], $op['lease_token'], ['request_id' => $op['preparation_id'], 'path' => 'favicon.ico']);
        $this->write($payload['after']);
        $url = $payload['after'] === null ? null : 'favicon.ico';
        $state = $this->state($url, true);
        $this->operations->finish($actor, $op['operation_id'], $op['lease_token'], 'succeeded', $state, $state['version'], function () use ($url, $op): void {
            (new Settings($this->db))->set('site_favicon', $url);
            $this->db->update('agent_configuration_requests', ['payload_json' => null], 'id=?', [$op['preparation_id']]);
        });
        return ['committed' => true];
    }
    private function consistent(array $op): bool
    {
        $payload = $this->payload($op); $bytes = $this->bytes(); $current = $bytes === null ? null : base64_encode($bytes);
        return ($current === $payload['before'] || $current === $payload['after'])
            && (new Settings($this->db))->get('site_favicon') === $payload['setting'];
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
        if (!$this->consistent($op)) return ['restored' => false, 'remaining_paths' => ['favicon.ico']];
        $payload = $this->payload($op); $this->write($payload['before']);
        $bytes = $this->bytes(); $ok = ($bytes === null ? null : base64_encode($bytes)) === $payload['before'];
        return ['restored' => $ok, 'remaining_paths' => $ok ? [] : ['favicon.ico']];
    }
    private function state(?string $override = null, bool $useOverride = false): array
    {
        $bytes = $this->bytes(); $hash = $bytes === null ? null : hash('sha256', $bytes);
        $url = $useOverride ? $override : (new Settings($this->db))->get('site_favicon');
        return ['version' => CanonicalJson::digest(['hash' => $hash, 'setting' => $url]), 'configured' => $bytes !== null, 'sha256' => $hash,
            'url' => is_string($url) ? $url : null, 'effect' => 'live_configuration', 'provider_calls' => 0];
    }
    private function bytes(): ?string
    {
        $path = SiteWorkspace::resolveWithin($this->workspace->publishedRoot(), 'favicon.ico');
        if (!file_exists($path)) return null;
        if (!is_file($path) || filesize($path) > 524288) throw new OperationException('size_limit', 'The existing favicon exceeds the qualified size.');
        $size = filesize($path); $bytes = file_get_contents($path, false, null, 0, $size + 1);
        if (!is_string($bytes) || strlen($bytes) !== $size) throw new OperationException('content_conflict', 'The favicon changed during capture.');
        return $bytes;
    }
    private function write(?string $encoded): void
    {
        $path = SiteWorkspace::resolveWithin($this->workspace->publishedRoot(), 'favicon.ico');
        if ($encoded === null) { if (file_exists($path) && !unlink($path)) throw new OperationException('host_capability_unavailable', 'Cannot remove the reviewed favicon.'); }
        else {
            WorkspaceFiles::write($this->workspace->publishedRoot(), 'favicon.ico', base64_decode($encoded, true));
            if (!chmod($path, 0644)) throw new OperationException('host_capability_unavailable', 'Cannot make the favicon publicly readable.');
        }
    }
    private function payload(array $op): array
    {
        $value = $this->db->scalar('SELECT payload_json FROM agent_configuration_requests WHERE id=?', [$op['preparation_id']]);
        if (!is_string($value)) throw new OperationException('content_conflict', 'Retained favicon preparation is unavailable.');
        return json_decode($value, true, 32, JSON_THROW_ON_ERROR);
    }
    private static function object(array $fields): array
    { return ['type' => 'object', 'properties' => $fields, 'required' => array_keys($fields), 'additionalProperties' => false]; }
}
