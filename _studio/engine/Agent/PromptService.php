<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, SiteWorkspace};

/** Shipped prompt files are immutable; owner edits create versioned overrides. */
final class PromptService
{
    public const MAX_BYTES = 262144;
    private OperationRunner $runner;
    public function __construct(private Database $db, private ActorPolicy $policy, private SiteWorkspace $workspace,
        private OperationStore $operations, private ?string $shippedRoot = null, private ?string $customRoot = null)
    {
        $this->shippedRoot ??= dirname($workspace->draftRoot()) . '/prompts';
        $this->customRoot ??= dirname($workspace->draftRoot()) . '/custom_prompts';
        $this->runner = new OperationRunner($db, $policy, $operations, $workspace->mutationLockPath(), false);
    }
    public static function inputSchema(string $method): array
    {
        $path = ['type' => 'string', 'pattern' => '^[A-Za-z0-9_-]+(?:/[A-Za-z0-9_-]+)*\\.md$', 'maxLength' => 160];
        $version = ['type' => 'string', 'pattern' => '^[a-f0-9]{64}$'];
        $id = ['type' => 'string', 'pattern' => '^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$'];
        $fields = match ($method) {
            'list' => [],
            'read' => ['path' => $path, 'offset' => ['type' => 'integer', 'minimum' => 0, 'maximum' => self::MAX_BYTES],
                'max_bytes' => ['type' => 'integer', 'minimum' => 4096, 'maximum' => 65536], 'version' => $version],
            'update' => ['operation_id' => $id, 'path' => $path, 'version' => $version,
                'content' => ['type' => 'string', 'maxLength' => self::MAX_BYTES]],
            'reset' => ['operation_id' => $id, 'path' => $path, 'version' => $version],
            default => throw new \InvalidArgumentException('Unknown prompt operation.'),
        };
        return self::object($fields, $method === 'read' ? ['path', 'offset', 'max_bytes'] : null);
    }
    public static function outputSchema(string $method): array
    {
        $meta = ['path' => ['type' => 'string'], 'version' => ['type' => 'string'],
            'source' => ['enum' => ['shipped', 'override']], 'total_bytes' => ['type' => 'integer']];
        if ($method === 'list') return self::object(['prompts' => ['type' => 'array', 'maxItems' => 128, 'items' => self::object($meta)],
            'provider_calls' => ['const' => 0]]);
        if ($method === 'read') return self::object($meta + ['content' => ['type' => 'string'], 'offset' => ['type' => 'integer'],
            'next_offset' => ['type' => ['integer', 'null']], 'shipped_read_only' => ['const' => true], 'provider_calls' => ['const' => 0]]);
        throw new \InvalidArgumentException('Unknown prompt output.');
    }
    public static function resultSchema(): array
    {
        return self::object(['path' => ['type' => 'string'], 'version' => ['type' => 'string'], 'customized' => ['type' => 'boolean'],
            'history_id' => ['type' => 'integer'], 'provider_calls' => ['const' => 0]]);
    }
    public function list(OperationActor $actor): array
    {
        $this->policy->require($actor, ['prompts:read']);
        $inventory = SiteWorkspace::inventory($this->shippedRoot); $items = []; $bytes = 0;
        foreach ($inventory['files'] as $path => $_) {
            if (!str_ends_with($path, '.md')) continue;
            if (count($items) >= 128) throw new OperationException('size_limit', 'Prompt inventory exceeds the qualified budget.');
            $source = $this->source($path); $bytes += strlen($source['content']);
            if ($bytes > 8388608) throw new OperationException('size_limit', 'Prompt inventory exceeds 8 MiB.');
            $items[] = $this->metadata($source);
        }
        return ['prompts' => $items, 'provider_calls' => 0];
    }
    public function read(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('read')); $this->policy->require($actor, ['prompts:read']);
        $source = $this->source($input->path);
        if (($input->offset && !isset($input->version)) || (isset($input->version) && $input->version !== $source['version'])) throw new OperationException('content_conflict', 'Prompt content changed. Restart its first page.');
        $content = mb_strcut($source['content'], $input->offset, max(1, (int) floor(($input->max_bytes - 512) / 6)), 'UTF-8');
        $next = $input->offset + strlen($content);
        return $this->metadata($source) + ['content' => $content, 'offset' => $input->offset,
            'next_offset' => $next < strlen($source['content']) ? $next : null, 'shipped_read_only' => true, 'provider_calls' => 0];
    }
    public function update(OperationActor $actor, \stdClass $input): array { return $this->mutate($actor, $input, false); }
    public function reset(OperationActor $actor, \stdClass $input): array { return $this->mutate($actor, $input, true); }
    private function mutate(OperationActor $actor, \stdClass $input, bool $reset): array
    {
        JsonSchema::validate($input, self::inputSchema($reset ? 'reset' : 'update'));
        $this->policy->require($actor, ['prompts:read', 'prompts:write']);
        if (!$reset && (strlen($input->content) > self::MAX_BYTES || !mb_check_encoding($input->content, 'UTF-8'))) throw new OperationException('size_limit', 'Prompt content must be UTF-8 and at most 256 KiB.');
        $digest = CanonicalJson::digest($input); $kind = $reset ? 'prompts.reset' : 'prompts.update';
        $row = $this->db->transaction(function () use ($actor, $input, $reset, $digest, $kind): array {
            $row = $this->db->queryOne('SELECT * FROM agent_configuration_requests WHERE actor_key = ? AND operation_id = ?', [$actor->identity(), $input->operation_id]);
            if ($row) {
                if ($row['kind'] !== $kind || $row['request_digest'] !== $digest) throw new OperationException('idempotency_conflict', 'This prompt operation belongs to different input.');
                return $row;
            }
            if ($this->db->count('agent_configuration_requests', 'payload_json IS NOT NULL') >= 100) throw new OperationException('size_limit', 'Too many pending administrative requests.');
            $source = $this->source($input->path);
            if ($source['version'] !== $input->version) throw new OperationException('content_conflict', 'The prompt changed. Review its current version.');
            $payload = ['path' => $input->path, 'shipped_hash' => $source['shipped_hash'], 'before' => $source['override'],
                'after' => $reset ? null : $input->content];
            $id = 'prompt_' . bin2hex(random_bytes(16));
            $this->db->insert('agent_configuration_requests', ['id' => $id, 'actor_key' => $actor->identity(),
                'operation_id' => $input->operation_id, 'kind' => $kind, 'request_digest' => $digest,
                'payload_json' => CanonicalJson::encode($payload), 'created_at' => time()]);
            return ['id' => $id];
        });
        return $this->runner->start($actor, $input->operation_id, $kind,
            (object) ['path' => $input->path, 'version' => $input->version, 'content_digest' => $digest],
            $input->version, $row['id'], ['prompts:read', 'prompts:write'],
            fn($op) => $this->step($actor, $op), fn($op) => $this->restore($op));
    }
    public function continue(OperationActor $actor, string $id, int $checkpoint): array
    {
        $this->ownedOperation($actor, $id);
        return $this->runner->continue($actor, $id, $checkpoint, ['prompts:read', 'prompts:write'],
            fn($op) => $this->step($actor, $op), fn($op) => $this->restore($op), fn($op) => $this->consistent($op));
    }
    public function recover(OperationActor $actor, string $id): array
    {
        $this->ownedOperation($actor, $id);
        return $this->runner->recover($actor, $id, ['prompts:write'], fn($op) => $this->restore($op));
    }
    private function ownedOperation(OperationActor $actor, string $id): void
    {
        if (!in_array($this->operations->get($actor, $id)['kind'], ['prompts.update', 'prompts.reset'], true)) throw new OperationException('invalid_schema', 'Use this operation’s own continuation.');
    }
    private function step(OperationActor $actor, array $op): array
    {
        $payload = $this->payload($op);
        if (!$this->consistent($op)) throw new OperationException('content_conflict', 'Prompt files changed outside the reviewed operation.');
        $this->operations->recordRecovery($actor, $op['operation_id'], $op['lease_token'], ['request_id' => $op['preparation_id'], 'path' => $payload['path']]);
        $this->write($payload['path'], $payload['after']);
        $source = $this->source($payload['path']);
        if ($source['override'] !== $payload['after']) throw new OperationException('host_capability_unavailable', 'Prompt override verification failed.');
        $historyId = (int) $this->db->scalar('SELECT COALESCE(MAX(id),0)+1 FROM agent_prompt_versions');
        $result = ['path' => $payload['path'], 'version' => $source['version'], 'customized' => $payload['after'] !== null, 'history_id' => $historyId, 'provider_calls' => 0];
        $this->operations->finish($actor, $op['operation_id'], $op['lease_token'], 'succeeded', $result, $source['version'], function () use ($payload, $op, $actor, $source, $historyId): void {
            $this->db->insert('agent_prompt_versions', ['id' => $historyId, 'path' => $payload['path'],
                'before_hash' => $op['before_version'], 'after_hash' => $source['version'], 'operation_internal_id' => $op['id'],
                'actor_json' => CanonicalJson::encode($actor->attribution()), 'before_content' => $payload['before'],
                'after_content' => $payload['after'], 'created_at' => time()]);
            $this->db->update('agent_configuration_requests', ['payload_json' => null], 'id = ?', [$op['preparation_id']]);
        });
        return ['committed' => true];
    }
    private function consistent(array $op): bool
    {
        $payload = $this->payload($op); $source = $this->source($payload['path']);
        return $source['shipped_hash'] === $payload['shipped_hash']
            && ($source['override'] === $payload['before'] || $source['override'] === $payload['after']);
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
        if (!$this->consistent($op)) return ['restored' => false, 'remaining_paths' => ['custom_prompts/' . $payload['path']]];
        $this->write($payload['path'], $payload['before']);
        $ok = $this->source($payload['path'])['override'] === $payload['before'];
        return ['restored' => $ok, 'remaining_paths' => $ok ? [] : ['custom_prompts/' . $payload['path']]];
    }
    private function payload(array $op): array
    {
        $row = $this->db->queryOne('SELECT payload_json FROM agent_configuration_requests WHERE id = ?', [$op['preparation_id']]);
        if (!$row || $row['payload_json'] === null) throw new OperationException('content_conflict', 'Retained prompt preparation is unavailable.');
        return json_decode($row['payload_json'], true, 32, JSON_THROW_ON_ERROR);
    }
    private function source(string $path): array
    {
        JsonSchema::validate((object) ['path' => $path, 'offset' => 0, 'max_bytes' => 4096], self::inputSchema('read'));
        $shipped = $this->bytes(SiteWorkspace::resolveWithin($this->shippedRoot, $path));
        if ($shipped === null) throw new OperationException('invalid_path', 'Choose an existing shipped prompt. New prompt paths are not allowed.');
        $override = $this->bytes(SiteWorkspace::resolveWithin($this->customRoot, $path));
        $hash = hash('sha256', $shipped);
        return ['path' => $path, 'content' => $override ?? $shipped, 'override' => $override, 'shipped_hash' => $hash,
            'version' => CanonicalJson::digest(['shipped' => $hash, 'override' => $override === null ? null : hash('sha256', $override)])];
    }
    private function bytes(string $path): ?string
    {
        if (!file_exists($path)) return null;
        if (!is_file($path) || filesize($path) > self::MAX_BYTES) throw new OperationException('size_limit', 'The prompt source exceeds the qualified 256 KiB budget.');
        $size = filesize($path); $bytes = file_get_contents($path, false, null, 0, $size + 1);
        if (!is_string($bytes) || strlen($bytes) !== $size || !mb_check_encoding($bytes, 'UTF-8')) throw new OperationException('content_conflict', 'Prompt source is invalid or changed while reading.');
        return $bytes;
    }
    private function write(string $path, ?string $content): void
    {
        $target = SiteWorkspace::resolveWithin($this->customRoot, $path);
        if ($content === null) {
            if (is_file($target) && !unlink($target)) throw new OperationException('host_capability_unavailable', 'Cannot reset the custom prompt.');
        } else {
            WorkspaceFiles::write($this->customRoot, '.htaccess', "Require all denied\nDeny from all\n");
            WorkspaceFiles::write($this->customRoot, $path, $content);
        }
    }
    private function metadata(array $source): array
    { return ['path' => $source['path'], 'version' => $source['version'], 'source' => $source['override'] === null ? 'shipped' : 'override', 'total_bytes' => strlen($source['content'])]; }
    private static function object(array $fields, ?array $required = null): array
    { return ['type' => 'object', 'properties' => $fields, 'required' => $required ?? array_keys($fields), 'additionalProperties' => false]; }
}
