<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

use VoxelSite\Database;
use VoxelSite\SiteMutationLock;

/** Durable application identity. Status reads are pure and never run recovery. */
final class OperationStore
{
    public const TERMINAL = ['succeeded', 'failed_restored', 'expired', 'cancelled'];
    public const RETENTION_SECONDS = 30 * 86400;
    public const LEASE_SECONDS = 45;

    public function __construct(private Database $db, private ActorPolicy $policy, private ?string $lockPath = null) {}

    public function prepare(OperationActor $actor, string $operationId, string $kind,
        \stdClass $request, string $beforeVersion, ?string $preparationId = null): array
    {
        $this->policy->require($actor, ['operations:read']);
        self::validateId($operationId);
        if (!preg_match('/^[a-z][a-z0-9_.]{1,100}$/D', $kind)) throw new \InvalidArgumentException('Invalid operation kind.');
        $digest = CanonicalJson::digest(['kind' => $kind, 'request' => $request, 'preparation_id' => $preparationId]);
        $prepare = function () use ($actor, $operationId, $kind, $request, $digest, $beforeVersion, $preparationId): array {
            $row = $this->find($actor, $operationId);
            if ($row) {
                if (!hash_equals($row['request_digest'], $digest)) throw new OperationException('idempotency_conflict',
                    'This operation ID was already used for a different request. Inspect that result or use a new ID.');
                return $this->decode($row);
            }
            $now = time();
            $this->db->insert('agent_operations', [
                'id' => 'op_' . bin2hex(random_bytes(16)), 'operation_id' => $operationId,
                'actor_key' => $actor->identity(), 'user_id' => $actor->userId, 'credential_id' => $actor->credentialId,
                'actor_json' => CanonicalJson::encode($actor->attribution()), 'kind' => $kind,
                'request_digest' => $digest, 'request_json' => CanonicalJson::encode($request), 'preparation_id' => $preparationId,
                'state' => 'prepared', 'before_version' => $beforeVersion, 'created_at' => $now, 'updated_at' => $now,
                'expires_at' => $now + 1800,
            ]);
            return $this->decode($this->find($actor, $operationId));
        };
        return $this->db->getPdo()->inTransaction() ? $prepare() : $this->db->transaction($prepare);
    }

    public function get(OperationActor $actor, string $operationId): array
    {
        $this->policy->require($actor, ['operations:read']);
        self::validateId($operationId);
        $row = $this->find($actor, $operationId);
        if (!$row) throw new OperationException('permission_denied', 'This operation is not available to this connection.');
        return $this->decode($row);
    }

    /** Trusted owner recovery inspection; never grants normal operation authority. */
    public function ownerRecoveryGet(OperationActor $owner, string $internalId): array
    {
        $this->policy->requireOwnerSession($owner);
        if (!preg_match('/^op_[a-f0-9]{32}$/D', $internalId)) throw new OperationException('invalid_schema', 'Choose a retained operation.');
        $row = $this->db->queryOne('SELECT * FROM agent_operations WHERE id=?', [$internalId]);
        if (!$row) throw new OperationException('not_found', 'The retained operation is unavailable.');
        return $this->decode($row);
    }

    public function ownerRecoveryList(OperationActor $owner): array
    {
        $this->policy->requireOwnerSession($owner);
        $rows = $this->db->query("SELECT * FROM agent_operations WHERE state IN ('applying','recovery_required') ORDER BY created_at,id LIMIT 101");
        if (count($rows) > 100) throw new OperationException('size_limit', 'Too many unresolved operations for this recovery inventory.');
        return array_map($this->decode(...), $rows);
    }

    public static function recoveryStateDigest(array $row): string
    {
        return CanonicalJson::digest(array_intersect_key($row, array_flip([
            'id','actor_key','actor','request_digest','preparation_id','state','phase','checkpoint_number',
            'checkpoint','recovery','before_version','after_version','lease_token','lease_expires_at',
        ])));
    }

    /** Dedicated rollback-only claim. The caller holds the operation's common lock. */
    public function claimOwnerRecovery(OperationActor $owner, string $internalId, string $expectedState): array
    {
        $this->assertLock();
        $this->policy->requireOwnerSession($owner);
        return $this->db->transaction(function () use ($owner, $internalId, $expectedState): array {
            $row = $this->ownerRecoveryGet($owner, $internalId);
            if (!hash_equals(self::recoveryStateDigest($row), $expectedState)) throw new OperationException('content_conflict', 'The reviewed operation changed.');
            if (!in_array($row['state'], ['applying', 'recovery_required'], true)
                || ($row['lease_expires_at'] !== null && $row['lease_expires_at'] > time())) {
                throw new OperationException('site_busy', 'Wait for the active worker before reviewing recovery.');
            }
            if ($this->db->scalar('SELECT reservation_operation_id FROM site_workspace_state WHERE id=1') !== $internalId) {
                throw new OperationException('recovery_required', 'The operation does not own the workspace reservation.');
            }
            $lease = bin2hex(random_bytes(24));
            if ($this->db->update('agent_operations', ['state' => 'applying', 'phase' => 'owner_recovering',
                'lease_token' => $lease, 'lease_expires_at' => time() + self::LEASE_SECONDS, 'updated_at' => time()],
                'id=? AND state=? AND checkpoint_number=?', [$internalId, $row['state'], $row['checkpoint_number']]) !== 1) {
                throw new OperationException('content_conflict', 'Another worker changed the operation.');
            }
            SiteMutationLock::bindOperation($internalId, $this->lockPath);
            return $this->ownerRecoveryGet($owner, $internalId);
        });
    }

    /** No original actor impersonation; immutable actor columns are never updated. */
    public function finishOwnerRecovery(OperationActor $owner, array $claimed, array $restoration, string $reviewId): array
    {
        $this->assertLock();
        return $this->db->transaction(function () use ($owner, $claimed, $restoration, $reviewId): array {
            $this->policy->requireOwnerSession($owner);
            $row = $this->ownerRecoveryGet($owner, $claimed['id']);
            if ($row['state'] !== 'applying' || $row['phase'] !== 'owner_recovering'
                || !hash_equals((string) $row['lease_token'], $claimed['lease_token'])) throw new OperationException('content_conflict', 'Recovery ownership changed.');
            $acknowledged = $row['kind'] === 'mail.test' && ($restoration['acknowledged'] ?? false) === true;
            $ok = $acknowledged || ($restoration['restored'] ?? false) === true;
            $state = $acknowledged ? 'succeeded' : ($ok ? 'failed_restored' : 'recovery_required');
            $result = ['operation_id' => $row['operation_id'], 'recovery_id' => $row['id'], 'status' => $state,
                'original_actor' => $row['actor'], 'recovered_by' => $owner->userId, 'recovered_at' => time(),
                'resumed' => false, 'restoration' => $restoration, 'provider_calls' => 0,
                'error' => ['code' => $ok ? 'operation_restored' : 'recovery_required',
                    'message' => $ok ? 'Original affected state was restored. The original request will not resume.'
                        : 'Some affected state still needs recovery. Conflicting bytes were preserved.']];
            $prior = $row['result'];
            $original = $prior['original_outcome'] ?? (isset($prior['error'], $prior['restoration'])
                ? ['error'=>$prior['error'],'restoration'=>$prior['restoration']] : null);
            if ($original !== null) $result['original_outcome'] = $original;
            if ($acknowledged) {
                unset($result['error']);
                $result += ['acknowledged' => true, 'recipient' => $restoration['recipient'],
                    'delivery_status' => $restoration['delivery_status'], 'external_send' => true,
                    'message' => 'The owner acknowledged the retained delivery outcome. No message was resent; inbox delivery is not confirmed.'];
                $this->db->update('agent_mail_dispatches', ['state' => $restoration['delivery_status'], 'finished_at' => time()],
                    'operation_internal_id=?', [$row['id']]);
            }
            $this->db->update('agent_operations', ['state' => $state, 'phase' => $state, 'result_json' => CanonicalJson::encode($result),
                'lease_token' => null, 'lease_expires_at' => null, 'updated_at' => time()], 'id=?', [$row['id']]);
            if ($ok && $this->db->update('site_workspace_state', ['reservation_operation_id' => null, 'updated_at' => time()],
                'id=1 AND reservation_operation_id=?', [$row['id']]) !== 1) throw new OperationException('recovery_required', 'The reservation changed during recovery.');
            if ($this->db->update('agent_owner_recovery_reviews', ['result_json' => CanonicalJson::encode($result)],
                'id=? AND operation_id=? AND owner_id=?', [$reviewId, $row['id'], $owner->userId]) !== 1) throw new OperationException('content_conflict', 'Recovery review is missing.');
            return $result;
        });
    }

    /** Trusted active worker only: revocation must not prevent safe recovery bookkeeping. */
    public function workerState(OperationActor $actor,string $operationId,string $lease): array
    {
        $this->assertLock();
        $row = $this->find($actor,$operationId);
        if (!$row || (!hash_equals((string)$row['lease_token'],$lease) && !in_array($row['state'],self::TERMINAL,true))) {
            throw new OperationException('content_conflict','This worker no longer owns the operation.');
        }
        return $this->decode($row);
    }

    /** Caller holds the common site lock, including across the conditional claim. */
    public function claim(OperationActor $actor, string $operationId, int $expectedCheckpoint): array
    {
        $this->assertLock();
        $this->policy->require($actor, []);
        return $this->db->transaction(function () use ($actor, $operationId, $expectedCheckpoint): array {
            $row = $this->get($actor, $operationId);
            if (!in_array($row['state'], ['prepared', 'applying'], true)) throw new OperationException('content_conflict', 'This operation cannot be advanced from its current state.');
            if ($row['checkpoint_number'] !== $expectedCheckpoint) throw new OperationException('content_conflict', 'The operation checkpoint changed. Read its latest state before continuing.');
            if ($row['state'] === 'prepared' && $row['expires_at'] <= time()) throw new OperationException('review_expired', 'This prepared operation expired. Prepare and review it again.');
            if ($row['lease_expires_at'] !== null) {
                if ($row['lease_expires_at'] > time()) throw new OperationException('site_busy', 'A worker still holds this operation. Poll its result before continuing.');
                // A dead worker may have written bytes. A caller must inspect and
                // reconcile those bytes before it can explicitly clear this lease.
                throw new OperationException('recovery_required', 'The worker lease expired. Reconcile the retained recovery manifest before continuing.');
            }
            $workspace = $this->db->queryOne('SELECT reservation_operation_id FROM site_workspace_state WHERE id = 1');
            if (!$workspace) throw new OperationException('feature_disabled', 'Finish the workspace upgrade in Studio before editing.');
            if ($workspace['reservation_operation_id'] !== null && $workspace['reservation_operation_id'] !== $row['id']) {
                throw new OperationException('site_busy', 'Another retained operation reserves this workspace. Finish or recover it first.');
            }
            $lease = bin2hex(random_bytes(24));
            $changed = $this->db->update('agent_operations',
                ['state' => 'applying', 'lease_token' => $lease, 'lease_expires_at' => time() + self::LEASE_SECONDS, 'updated_at' => time()],
                'id = ? AND state = ? AND checkpoint_number = ? AND lease_expires_at IS NULL',
                [$row['id'], $row['state'], $expectedCheckpoint]);
            if ($changed !== 1) throw new OperationException('content_conflict', 'Another worker advanced this operation.');
            $this->db->update('site_workspace_state', ['reservation_operation_id' => $row['id'], 'updated_at' => time()], 'id = 1');
            SiteMutationLock::bindOperation($row['id'], $this->lockPath);
            return $this->get($actor, $operationId);
        });
    }

    /** Persist the recovery manifest before the first affected byte is changed. */
    public function recordRecovery(OperationActor $actor, string $operationId, string $lease, array $manifest): void
    {
        $this->updateWorker($actor, $operationId, $lease, ['recovery_json' => CanonicalJson::encode($manifest)]);
    }

    public function checkpoint(OperationActor $actor, string $operationId, string $lease,
        string $phase, array $checkpoint, array $recovery): void
    {
        $this->assertLock();
        $row = $this->get($actor, $operationId);
        $this->updateWorker($actor, $operationId, $lease, [
            'phase' => $phase, 'checkpoint_number' => $row['checkpoint_number'] + 1,
            'checkpoint_json' => CanonicalJson::encode($checkpoint), 'recovery_json' => CanonicalJson::encode($recovery),
            'lease_token' => null, 'lease_expires_at' => null,
        ]);
    }

    /** Verification and domain commits are supplied by a trusted service in this transaction. */
    public function finish(OperationActor $actor, string $operationId, string $lease, string $state,
        array $result, ?string $afterVersion = null, ?callable $commitDomain = null): void
    {
        $this->assertLock();
        if (!in_array($state, ['succeeded', 'failed_restored', 'recovery_required'], true)) throw new \InvalidArgumentException('Invalid terminal state.');
        $finish = function () use ($actor, $operationId, $lease, $state, $result, $afterVersion, $commitDomain): void {
            // A revoked connection cannot start a step, but an already claimed
            // trusted worker must still persist its verified recovery outcome.
            $row = $this->find($actor, $operationId);
            if (!$row) throw new OperationException('content_conflict','The retained operation is missing.');
            $this->updateWorker($actor, $operationId, $lease, [
                'state' => $state, 'phase' => $state, 'result_json' => CanonicalJson::encode($result),
                'after_version' => $afterVersion, 'lease_token' => null, 'lease_expires_at' => null,
            ],false);
            if ($commitDomain !== null) $commitDomain();
            if ($state !== 'recovery_required') {
                if ($this->db->update('site_workspace_state', ['reservation_operation_id' => null, 'updated_at' => time()],
                    'id = 1 AND reservation_operation_id = ?', [$row['id']]) !== 1) {
                    throw new \RuntimeException('Cannot release the operation reservation.');
                }
            }
        };
        if ($this->db->getPdo()->inTransaction()) $finish();
        else $this->db->transaction($finish);
    }

    /** Explicit authorized repair; unlike polling this may restore affected bytes. */
    public function claimRecovery(OperationActor $actor, string $operationId, array $requiredScopes): array
    {
        $this->assertLock();
        $this->policy->require($actor,$requiredScopes);
        $row = $this->get($actor,$operationId);
        if (!in_array($row['state'],['recovery_required','applying'],true)
            || ($row['lease_expires_at'] !== null && $row['lease_expires_at'] > time())) {
            throw new OperationException('site_busy','This operation is not ready for explicit recovery.');
        }
        if ($this->db->scalar('SELECT reservation_operation_id FROM site_workspace_state WHERE id = 1') !== $row['id']) {
            throw new OperationException('recovery_required','The workspace reservation does not match this operation.');
        }
        $lease = bin2hex(random_bytes(24));
        if ($this->db->update('agent_operations',[
            'state'=>'applying','phase'=>'recovering','lease_token'=>$lease,'lease_expires_at'=>time()+self::LEASE_SECONDS,'updated_at'=>time(),
        ],'id = ? AND state = ? AND checkpoint_number = ?',[$row['id'],$row['state'],$row['checkpoint_number']]) !== 1) {
            throw new OperationException('content_conflict','The recovery state changed.');
        }
        SiteMutationLock::bindOperation($row['id'],$this->lockPath);
        return $this->get($actor,$operationId);
    }

    /**
     * Only explicit recovery invokes this after verifying actual affected hashes.
     * An expired lease alone is never evidence that writes were not performed.
     */
    public function reconcile(OperationActor $actor, string $operationId, callable $verify): array
    {
        $this->assertLock();
        $row = $this->get($actor, $operationId);
        if ($row['state'] !== 'applying' || $row['lease_expires_at'] === null || $row['lease_expires_at'] > time()) {
            throw new OperationException('content_conflict', 'This operation is not waiting for interrupted-worker reconciliation.');
        }
        $verified = $verify($row);
        if ($verified !== true) throw new OperationException('recovery_required', 'The retained manifest does not match the workspace. Restore or reconcile the affected paths.');
        if ($this->db->update('agent_operations', ['lease_token' => null, 'lease_expires_at' => null, 'updated_at' => time()],
            'id = ? AND state = ? AND lease_token = ?', [$row['id'], 'applying', $row['lease_token']]) !== 1) {
            throw new OperationException('content_conflict', 'The worker state changed during reconciliation.');
        }
        return $this->get($actor, $operationId);
    }

    /** Retain identity/digest tombstones, never prune active or unresolved records. */
    public function pruneResults(int $limit = 20): int
    {
        $limit = max(1, min(100, $limit));
        $rows = $this->db->query("SELECT id FROM agent_operations WHERE state IN ('succeeded','failed_restored','expired','cancelled')
            AND result_pruned_at IS NULL AND updated_at < ? ORDER BY updated_at LIMIT " . $limit, [time() - self::RETENTION_SECONDS]);
        foreach ($rows as $row) $this->db->update('agent_operations',
            ['result_json' => null, 'request_json' => null, 'result_pruned_at' => time()], 'id = ?', [$row['id']]);
        return count($rows);
    }

    private function updateWorker(OperationActor $actor, string $operationId, string $lease, array $values, bool $reauthorize = true): void
    {
        $this->assertLock();
        if ($reauthorize) $this->policy->require($actor, []);
        $values['updated_at'] = time();
        if ($this->db->update('agent_operations', $values,
            'actor_key = ? AND operation_id = ? AND state = ? AND lease_token = ?',
            [$actor->identity(), $operationId, 'applying', $lease]) !== 1) {
            throw new OperationException('content_conflict', 'This worker no longer owns the operation.');
        }
    }

    private function assertLock(): void
    {
        if (!SiteMutationLock::held($this->lockPath)) throw new \LogicException('The shared site mutation lock is required.');
    }
    private function find(OperationActor $actor, string $id): ?array {
        return $this->db->queryOne('SELECT * FROM agent_operations WHERE actor_key = ? AND operation_id = ?', [$actor->identity(), $id]);
    }
    private static function validateId(string $id): void {
        if (!preg_match('/^[a-zA-Z0-9][a-zA-Z0-9_-]{7,127}$/D', $id)) throw new OperationException('invalid_schema', 'Use an operation ID of 8–128 letters, digits, underscores or dashes.');
    }
    private function decode(array $row): array
    {
        foreach (['actor', 'request', 'checkpoint', 'recovery', 'result'] as $key) {
            $row[$key] = $row[$key . '_json'] === null ? null : json_decode($row[$key . '_json'], true, 64, JSON_THROW_ON_ERROR);
            unset($row[$key . '_json']);
        }
        foreach (['checkpoint_number', 'expires_at', 'created_at', 'updated_at', 'lease_expires_at', 'result_pruned_at'] as $key) {
            if ($row[$key] !== null) $row[$key] = (int) $row[$key];
        }
        return $row;
    }
}
