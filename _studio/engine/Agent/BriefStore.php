<?php
declare(strict_types=1);

namespace VoxelSite\Agent;

use VoxelSite\Database;

/** A request ID retains one draw and one immutable context until its expiry. */
final class BriefStore
{
    public const TTL_SECONDS = 1800;

    public function __construct(private Database $db, private ActorPolicy $policy) {}

    public function retain(OperationActor $actor, string $requestId, array $request, callable $build): array
    {
        $this->policy->require($actor, ['context:read', 'site:read']);
        if (!preg_match('/\A[A-Za-z0-9][A-Za-z0-9_.:-]{7,127}\z/D', $requestId)) {
            throw new OperationException('invalid_schema', 'Use a stable request ID between 8 and 128 characters.');
        }
        $digest = CanonicalJson::digest($request);
        return $this->db->transaction(function () use ($actor, $requestId, $digest, $build): array {
            $existing = $this->db->queryOne('SELECT * FROM agent_briefs WHERE actor_key = ? AND request_id = ?',
                [$actor->identity(), $requestId]);
            if ($existing) {
                if (!hash_equals($existing['request_digest'], $digest)) throw new OperationException('idempotency_conflict', 'This request ID belongs to a different brief request.');
                return $this->decode($actor, $existing);
            }
            if ((int) $this->db->scalar('SELECT COUNT(*) FROM agent_briefs WHERE actor_key = ? AND expires_at > ?', [$actor->identity(), time()]) >= 32
                || (int) $this->db->scalar("SELECT COUNT(*) FROM agent_briefs WHERE payload_json != '{}'") >= 1024) {
                throw new OperationException('size_limit', 'The retained brief limit was reached. Review existing briefs or ask the owner to clean expired records.');
            }
            $id = 'brief_' . bin2hex(random_bytes(16));
            $now = time();
            $payload = $build($id, $now, $now + self::TTL_SECONDS);
            if (!is_array($payload)) throw new \LogicException('A brief builder must return a structured payload.');
            $json = CanonicalJson::encode($payload);
            if (strlen($json) > ContextService::MAX_BYTES) throw new OperationException('size_limit', 'The authoring brief exceeds its storage limit.');
            $this->db->insert('agent_briefs', [
                'id' => $id, 'actor_key' => $actor->identity(), 'user_id' => $actor->userId, 'credential_id' => $actor->credentialId,
                'request_id' => $requestId, 'request_digest' => $digest, 'action' => $payload['action'],
                'base_draft_version' => $payload['base_draft_version'], 'rules_digest' => $payload['rules_digest'],
                'direction_seed' => $payload['direction']['seed'] ?? null,
                'direction_json' => isset($payload['direction']) ? CanonicalJson::encode($payload['direction']) : null,
                'context_refs_json' => CanonicalJson::encode($payload['context']['rules']),
                'payload_json' => $json, 'payload_digest' => hash('sha256', $json),
                'created_at' => $now, 'expires_at' => $now + self::TTL_SECONDS,
            ]);
            // First delivery and replay have the same ordering and representation.
            return json_decode($json, true, 128, JSON_THROW_ON_ERROR);
        });
    }

    public function get(OperationActor $actor, string $id): array
    {
        $this->policy->require($actor, ['context:read', 'site:read']);
        if (!preg_match('/\Abrief_[a-f0-9]{32}\z/D', $id)) throw new OperationException('invalid_schema', 'Use the returned brief ID.');
        $row = $this->db->queryOne('SELECT * FROM agent_briefs WHERE id = ?', [$id]);
        if (!$row) throw new OperationException('permission_denied', 'This brief is not available to this connection.');
        return $this->decode($actor, $row);
    }

    private function decode(OperationActor $actor, array $row): array
    {
        if ($row['actor_key'] !== $actor->identity() || (int) $row['user_id'] !== $actor->userId) {
            throw new OperationException('permission_denied', 'This brief is not available to this connection.');
        }
        if ((int) $row['expires_at'] <= time()) throw new OperationException('review_expired', 'This brief expired. Request a new brief with a new request ID.');
        if (!hash_equals($row['payload_digest'], hash('sha256', $row['payload_json']))) {
            throw new OperationException('content_conflict', 'The retained brief failed its integrity check. Request a new brief.');
        }
        $payload = json_decode($row['payload_json'], true, 128, JSON_THROW_ON_ERROR);
        // Retained source data cannot outlive a scope reduction on its connection.
        $this->policy->require($actor, $payload['context']['required_scopes']);
        return $payload;
    }
}
