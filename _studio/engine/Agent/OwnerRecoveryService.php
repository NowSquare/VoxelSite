<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, SiteMutationLock, SiteWorkspace};

/** Current owner authority can roll back a retained job without impersonating its actor. */
final class OwnerRecoveryService
{
    public function __construct(private Database $db, private ActorPolicy $policy, private SiteWorkspace $workspace,
        private OperationStore $operations, private array $handlers, private ?ActionService $actions = null) {}

    public static function resultSchema(): array
    {
        $c = ToolContracts::class;
        return $c::object(['operation_id' => $c::text(128), 'recovery_id' => $c::id('op'),
            'status' => ['enum' => ['succeeded', 'failed_restored', 'recovery_required']],
            'original_actor' => $c::object(['type' => ['enum' => ['user', 'api_key', 'rest_key']],
                'user_id' => $c::integer(), 'credential_id' => $c::nullable($c::integer()), 'client_name' => $c::nullable($c::text(100))]),
            'recovered_by' => $c::integer(), 'recovered_at' => $c::integer(), 'resumed' => ['const' => false],
            'restoration' => $c::object(['restored' => ['type' => 'boolean'], 'remaining_paths' => $c::list($c::text(600), 1500),
                'acknowledged' => ['const' => true], 'recipient' => $c::text(320), 'delivery_status' => ['enum' => ['accepted', 'failed', 'unknown']]],
                ['restored', 'remaining_paths']),
            'provider_calls' => ['const' => 0], 'error' => $c::object(['code' => $c::text(100), 'message' => $c::text(1000)]),
            'original_outcome' => $c::object(['error'=>$c::object(['code'=>$c::text(100),'message'=>$c::text(4096)]),
                'restoration'=>$c::restoration()]),
            'acknowledged' => ['const' => true], 'recipient' => $c::text(320), 'delivery_status' => ['enum' => ['accepted', 'failed', 'unknown']],
            'external_send' => ['const' => true], 'message' => $c::text(1000)],
            ['operation_id', 'recovery_id', 'status', 'original_actor', 'recovered_by', 'recovered_at', 'resumed', 'restoration', 'provider_calls']);
    }

    public function list(OperationActor $owner): array
    {
        $this->policy->requireOwnerSession($owner);
        $items = array_map(fn($op) => $this->metadata($op), $this->operations->ownerRecoveryList($owner));
        foreach ($this->actions?->pendingChanges($owner)['items'] ?? [] as $item) $items[] = $item + ['recovery_id' => $item['operation_id'], 'source' => 'action'];
        return ['items' => $items, 'provider_calls' => 0];
    }

    /** Pure inspection does not create a receipt, claim work, or restore bytes. */
    public function inspect(OperationActor $owner, string $id): array
    {
        $this->policy->requireOwnerSession($owner);
        if (str_starts_with($id, 'business_')) {
            foreach ($this->actions?->pendingChanges($owner)['items'] ?? [] as $item) if ($item['operation_id'] === $id) {
                return $item + ['recovery_id' => $id, 'source' => 'action'];
            }
            throw new OperationException('not_found', 'This interrupted Action is unavailable.');
        }
        return $this->metadata($this->operations->ownerRecoveryGet($owner, $id));
    }

    /** Explicit review persists only redacted paths, hashes and attribution. */
    public function review(OperationActor $owner, string $id): array
    {
        $this->policy->requireOwnerSession($owner);
        if (str_starts_with($id, 'business_')) {
            if (!$this->actions) throw new OperationException('not_found', 'Action recovery is unavailable.');
            return $this->actions->inspectChange($owner, $id) + ['recovery_id' => $id, 'review_id' => $id, 'source' => 'action'];
        }
        $op = $this->operations->ownerRecoveryGet($owner, $id);
        $lock = SiteMutationLock::acquire($this->workspace->mutationLockPath(), $this->db, $id);
        $op = $this->operations->ownerRecoveryGet($owner, $id);
        $view = $this->metadata($op);
        if (!$view['eligible']) throw new OperationException('recovery_required', $view['diagnostic'] ?: 'This operation is not eligible for recovery.');
        if ($this->db->count('agent_owner_recovery_reviews', 'result_json IS NULL AND expires_at>?', [time()]) >= 64) {
            throw new OperationException('size_limit', 'Too many pending recovery reviews. Wait for older reviews to expire.');
        }
        $row = ['id' => 'recovery_' . bin2hex(random_bytes(16)), 'operation_id' => $id, 'owner_id' => $owner->userId,
            'site_key' => $this->siteKey(), 'state_digest' => OperationStore::recoveryStateDigest($op),
            'review_json' => CanonicalJson::encode($view), 'created_at' => time(), 'expires_at' => time() + 900];
        $row['digest'] = CanonicalJson::digest($row);
        $this->db->insert('agent_owner_recovery_reviews', $row);
        return $view + ['review_id' => $row['id'], 'digest' => $row['digest'], 'expires_at' => $row['expires_at']];
    }

    public function recover(OperationActor $owner, string $id, string $reviewId, string $digest): array
    {
        $this->policy->requireOwnerSession($owner);
        JsonSchema::validate($digest, ToolContracts::hash());
        return ProviderCallPolicy::runExternal(function () use ($owner, $id, $reviewId, $digest): array {
            if (str_starts_with($id, 'business_')) {
                if (!$this->actions || $reviewId !== $id) throw new OperationException('invalid_schema', 'Choose this Action’s recovery review.');
                return $this->actions->recover($owner, $id, $digest);
            }
            $op = $this->operations->ownerRecoveryGet($owner, $id);
            $review = $this->db->queryOne('SELECT * FROM agent_owner_recovery_reviews WHERE id=? AND operation_id=? AND owner_id=?',
                [$reviewId, $id, $owner->userId]);
            if (!$review || $review['site_key'] !== $this->siteKey() || !hash_equals($review['digest'], $digest)) {
                throw new OperationException('permission_denied', 'Use the exact recovery review created by this owner.');
            }
            if ($review['result_json'] !== null) return json_decode($review['result_json'], true, 64, JSON_THROW_ON_ERROR);
            $lock = SiteMutationLock::acquire($this->workspace->mutationLockPath(), $this->db, $id);
            $this->policy->requireOwnerSession($owner);
            $op = $this->operations->ownerRecoveryGet($owner, $id);
            if ((int) $review['expires_at'] <= time()) throw new OperationException('review_expired', 'Review the interrupted operation again.');
            $view = $this->metadata($op);
            if (!$view['eligible'] || !hash_equals($review['state_digest'], OperationStore::recoveryStateDigest($op))
                || !hash_equals(hash('sha256', $review['review_json']), hash('sha256', CanonicalJson::encode($view)))) {
                throw new OperationException('content_conflict', 'The reviewed state changed. Conflicting bytes were preserved; inspect again.');
            }
            $claimed = $this->operations->claimOwnerRecovery($owner, $id, $review['state_digest']);
            try { $restoration = ($this->handlers[$op['kind']]['restore'])($claimed); }
            catch (\Throwable) { $restoration = ['restored' => false, 'remaining_paths' => ['recovery_manifest']]; }
            return $this->operations->finishOwnerRecovery($owner, $claimed, $restoration, $reviewId);
        });
    }

    private function metadata(array $op): array
    {
        $supported = isset($this->handlers[$op['kind']]);
        $eligible = $supported && in_array($op['state'], ['applying', 'recovery_required'], true)
            && ($op['lease_expires_at'] === null || $op['lease_expires_at'] <= time())
            && $this->db->scalar('SELECT reservation_operation_id FROM site_workspace_state WHERE id=1') === $op['id'];
        $diagnostic = !$supported ? 'This operation needs a specialized recovery path.' : '';
        $paths = [];
        if ($supported) {
            try {
                $paths = isset($this->handlers[$op['kind']]['view']) ? ($this->handlers[$op['kind']]['view'])($op) : $this->websitePaths($op);
                if (count($paths) > 1500) throw new OperationException('size_limit', 'Recovery exceeds the qualified path budget.');
                foreach ($paths as &$path) {
                    $path['state'] = $path['current_hash'] === $path['before_hash'] ? 'before'
                        : ($path['current_hash'] === $path['after_hash'] ? 'after' : 'conflict');
                    if ($path['state'] === 'conflict') { $eligible = false; $diagnostic = 'Affected paths contain unrelated changes. Preserve them and reconcile manually.'; }
                }
                unset($path);
            } catch (\Throwable) { $eligible = false; $diagnostic = 'The retained manifest or a target path cannot be safely verified.'; }
        }
        if ($op['lease_expires_at'] !== null && $op['lease_expires_at'] > time()) $diagnostic = 'A worker still owns this operation. Wait for its lease to end.';
        return ['recovery_id' => $op['id'], 'operation_id' => $op['operation_id'], 'source' => 'operation',
            'kind' => $op['kind'], 'status' => $op['state'], 'checkpoint' => $op['checkpoint_number'],
            'original_actor' => $op['actor'], 'created_at' => $op['created_at'], 'paths' => $paths,
            'eligible' => $eligible, 'diagnostic' => $diagnostic,
            'action' => $this->handlers[$op['kind']]['action'] ?? 'restore_before',
            'delivery_intent' => isset($this->handlers[$op['kind']]['intent']) ? ($this->handlers[$op['kind']]['intent'])($op) : null,
            'provider_calls' => 0];
    }

    private function websitePaths(array $op): array
    {
        $paths = [];
        foreach ($op['recovery']['files'] ?? [] as $file) {
            $domain = $file['domain'] ?? ($op['kind'] === 'publish.apply' ? 'published' : 'draft');
            if (!in_array($domain, ['draft', 'published'], true)) throw new OperationException('invalid_path', 'Unsupported recovery domain.');
            $target = $domain === 'draft' ? $this->workspace->resolveDraft($file['path'], true) : $this->workspace->resolvePublished($file['path'], true);
            $paths[] = ['domain' => $domain, 'path' => $file['path'], 'before_hash' => $file['before_hash'],
                'after_hash' => $file['after_hash'], 'current_hash' => self::hashPath($target)];
        }
        return $paths;
    }

    public static function hashPath(string $target): ?string
    {
        clearstatcache(true, $target);
        if (!file_exists($target)) return null;
        if (is_link($target) || !is_file($target) || filesize($target) > 33554432) throw new OperationException('invalid_path', 'Unsafe recovery path.');
        $hash = hash_file('sha256', $target);
        if (!is_string($hash)) throw new OperationException('host_capability_unavailable', 'Cannot hash the recovery target.');
        return $hash;
    }

    public static function assertClaim(Database $db, SiteWorkspace $workspace, array $op): void
    {
        $row = $db->queryOne('SELECT state,phase,lease_token FROM agent_operations WHERE id=?', [$op['id'] ?? '']);
        if (!SiteMutationLock::held($workspace->mutationLockPath()) || !$row || $row['state'] !== 'applying'
            || $row['phase'] !== 'owner_recovering' || !is_string($row['lease_token'])
            || !hash_equals($row['lease_token'], $op['lease_token'] ?? '')
            || $db->scalar('SELECT reservation_operation_id FROM site_workspace_state WHERE id=1') !== $op['id']) {
            throw new \LogicException('An owner recovery claim under the common lock is required.');
        }
    }
    private function siteKey(): string
    { return CanonicalJson::digest([$this->workspace->draftRoot(), $this->workspace->publishedRoot(), $this->workspace->mutationLockPath()]); }
}
