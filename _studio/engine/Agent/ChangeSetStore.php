<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, SiteWorkspace};

/** Metadata and bytes stay private. Only the sealed reviewed manifest can apply. */
final class ChangeSetStore
{
    public const MAX_STORAGE_BYTES = 536870912;
    // Covers both retained versions, transient replacements, generated scripts,
    // directory entries and the bounded manifest before any staging write.
    public const RESERVATION_BYTES = 2 * WorkspaceFiles::MAX_BYTES + 8 * 1048576;
    public const METADATA_ALLOWANCE_BYTES = 1048576;

    public function __construct(private Database $db, private ActorPolicy $policy, private string $root)
    {
        if (!str_starts_with($root, '/') || is_link($root)) throw new \InvalidArgumentException('A trusted private staging root is required.');
    }

    public function reserve(OperationActor $actor, array $request): array
    {
        $this->policy->require($actor, ['files:write','changes:apply']);
        $requestId = $request['request_id'];
        if (!is_string($requestId) || !preg_match('/^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$/D', $requestId)) throw new OperationException('invalid_schema', 'Use a stable request ID of 8–128 letters, digits, dashes or underscores.');
        $digest = CanonicalJson::digest($request);
        return $this->db->transaction(function () use ($actor,$request,$requestId,$digest): array {
            $existing = $this->db->queryOne('SELECT * FROM agent_change_sets WHERE actor_key = ? AND request_id = ?', [$actor->identity(),$requestId]);
            if ($existing) {
                if (!hash_equals($digest,$existing['request_digest'])) throw new OperationException('idempotency_conflict','This request ID belongs to a different change set.');
                $row = $this->decode($actor,$existing);
                if ($row['status'] === 'preparing') {
                    $this->reserveCapacity((int)$row['staged_bytes']);
                    $this->db->update('agent_change_sets',['staged_bytes'=>self::RESERVATION_BYTES],'id = ?',[$row['id']]);
                    $row['staged_bytes'] = self::RESERVATION_BYTES;
                }
                return $row;
            }
            if ($this->db->scalar("SELECT COUNT(*) FROM agent_change_sets WHERE actor_key = ? AND expires_at > ?",[$actor->identity(),time()]) >= 32
                || $this->db->scalar("SELECT COUNT(*) FROM agent_change_sets WHERE status != 'expired'") >= 512) {
                throw new OperationException('size_limit','The preparation storage limit was reached. Clean expired preparations in Studio before trying again.');
            }
            $this->reserveCapacity(0);
            $id = 'change_' . bin2hex(random_bytes(16));
            $this->db->insert('agent_change_sets', [
                'id'=>$id,'actor_key'=>$actor->identity(),'user_id'=>$actor->userId,'credential_id'=>$actor->credentialId,
                'request_id'=>$requestId,'request_digest'=>$digest,'base_draft_version'=>$request['base_draft_version'],
                'brief_id'=>$request['brief_id'],'summary'=>$request['summary'],'status'=>'preparing',
                'staged_bytes'=>self::RESERVATION_BYTES,
                'created_at'=>time(),'expires_at'=>time()+1800,
            ]);
            return $this->get($actor,$id);
        });
    }

    public function get(OperationActor $actor, string $id): array
    {
        $this->policy->require($actor, ['files:read']);
        self::validId($id);
        $row = $this->db->queryOne('SELECT * FROM agent_change_sets WHERE id = ?',[$id]);
        if (!$row) throw new OperationException('permission_denied','This change set is not available to this connection.');
        return $this->decode($actor,$row);
    }

    /** A started operation retains its recovery material after review expiry. */
    public function forOperation(OperationActor $actor,array $operation): array
    {
        $this->policy->require($actor,['files:read']);
        if ($operation['actor_key'] !== $actor->identity() || $operation['state'] !== 'applying'
            || $operation['kind'] !== 'changes.apply') throw new \LogicException('An applying change operation is required.');
        $id = $operation['preparation_id'];
        self::validId($id);
        $row = $this->db->queryOne('SELECT * FROM agent_change_sets WHERE id = ?',[$id]);
        if (!$row) throw new OperationException('recovery_required','The operation’s retained change set is missing.');
        return $this->decode($actor,$row,true);
    }

    /** Commit together with the operation result and revision. */
    public function markApplied(OperationActor $actor,string $id): void
    {
        if (!$this->db->getPdo()->inTransaction()) throw new \LogicException('Applying a review requires the domain transaction.');
        if ($this->db->update('agent_change_sets',['status'=>'applied'],'id = ? AND actor_key = ? AND status = ?',[$id,$actor->identity(),'ready']) !== 1) {
            throw new OperationException('content_conflict','This change set was already applied.');
        }
    }

    public function stagingRoot(string $id, bool $create = false): string
    {
        self::validId($id);
        $target = SiteWorkspace::resolveWithin($this->root,$id);
        if (!$create) {
            if (!is_dir($target)) {
                throw new OperationException('content_conflict','Retained staging is missing or unsafe. Prepare a new review.');
            }
            return $target;
        }
        foreach ([$this->root,$target] as $path) {
            if (is_link($path)) throw new OperationException('invalid_path','The staging directory is unsafe.');
            if (!is_dir($path) && !mkdir($path,0700,true)) throw new OperationException('host_capability_unavailable','Cannot create private staging storage.');
        }
        $access = SiteWorkspace::resolveWithin($this->root,'.htaccess');
        if (!is_file($access) && file_put_contents($access,"Require all denied\nDeny from all\n") === false) throw new OperationException('host_capability_unavailable','Cannot protect private staging storage.');
        return $target;
    }

    /** Never release crash accounting until every incomplete staging entry is gone. */
    public function discardIncomplete(OperationActor $actor,string $id,bool $releaseReservation = true): void
    {
        self::validId($id);
        $row = $this->db->queryOne('SELECT * FROM agent_change_sets WHERE id = ?',[$id]);
        if (!$row || $row['actor_key'] !== $actor->identity() || (int)$row['user_id'] !== $actor->userId) {
            throw new OperationException('permission_denied','This change set is not available to this connection.');
        }
        // An exception after sealing must not destroy retained reviewed bytes.
        if ($row['status'] !== 'preparing') return;
        $target = SiteWorkspace::resolveWithin($this->root,$id);
        if (file_exists($target)) {
            if (!is_dir($target)) throw new OperationException('recovery_required','Incomplete staging is unsafe. Its storage reservation remains retained.');
            $entries = 0;
            $remove = function (string $directory) use (&$remove,&$entries,$target): void {
                foreach (new \DirectoryIterator($directory) as $entry) {
                    if ($entry->isDot()) continue;
                    if (++$entries > WorkspaceFiles::MAX_FILES * 12) throw new OperationException('recovery_required','Incomplete staging exceeds its cleanup budget. Its reservation remains retained.');
                    $relative = substr($entry->getPathname(),strlen($target)+1);
                    $path = SiteWorkspace::resolveWithin($target,$relative);
                    if (is_dir($path)) $remove($path);
                    elseif (!is_file($path) || !unlink($path)) throw new OperationException('recovery_required','Cannot remove incomplete staging. Its storage reservation remains retained.');
                }
                if (!rmdir($directory)) throw new OperationException('recovery_required','Cannot remove an incomplete staging directory. Its reservation remains retained.');
            };
            $remove($target);
        }
        clearstatcache(true,$target);
        if (file_exists($target) || is_link($target)) throw new OperationException('recovery_required','Incomplete staging remains. Its storage reservation is still retained.');
        if ($releaseReservation) {
            $this->db->update('agent_change_sets',['staged_bytes'=>0],'id = ? AND status = ?',[$id,'preparing']);
        }
    }

    public function seal(OperationActor $actor, string $id, array $manifest, array $payload, int $bytes): array
    {
        $row = $this->get($actor,$id);
        $this->policy->require($actor,['files:write','changes:apply']);
        $digest = CanonicalJson::digest($manifest);
        $payload['digest'] = $digest;
        $manifestJson = CanonicalJson::encode($manifest);
        $payloadJson = CanonicalJson::encode($payload);
        $accountedBytes = $bytes + strlen($manifestJson) + strlen($payloadJson) + self::METADATA_ALLOWANCE_BYTES;
        if ($bytes < 0 || $accountedBytes > (int)$row['staged_bytes']) {
            throw new OperationException('size_limit','The retained review exceeds its reserved storage. Split the work into smaller change sets.');
        }
        if ($this->db->update('agent_change_sets',[
            'manifest_json'=>$manifestJson,'sealed_digest'=>$digest,'payload_json'=>$payloadJson,
            'staged_bytes'=>$accountedBytes,'status'=>'ready',
        ],'id = ? AND status = ?',[$id,'preparing']) !== 1) throw new OperationException('content_conflict','This preparation was already sealed.');
        return $this->get($actor,$id);
    }

    private function reserveCapacity(int $existingBytes): void
    {
        $used = (int)$this->db->scalar('SELECT COALESCE(SUM(staged_bytes),0) FROM agent_change_sets');
        if ($used - $existingBytes + self::RESERVATION_BYTES > self::MAX_STORAGE_BYTES) {
            throw new OperationException('size_limit','There is not enough retained preparation storage for this attempt. Clean expired preparations in Studio before trying again.');
        }
    }

    private function decode(OperationActor $actor, array $row, bool $allowExpired = false): array
    {
        if ($row['actor_key'] !== $actor->identity() || (int)$row['user_id'] !== $actor->userId) throw new OperationException('permission_denied','This change set is not available to this connection.');
        if (!$allowExpired && (int)$row['expires_at'] <= time()) throw new OperationException('review_expired','This review expired. Prepare a new change set with a new request ID.');
        $row['manifest'] = $row['manifest_json'] === null ? null : json_decode($row['manifest_json'],true,64,JSON_THROW_ON_ERROR);
        if ($row['manifest'] !== null) $this->policy->require($actor,$row['manifest']['read_scopes'] ?? ['files:read']);
        if ($row['manifest'] !== null && !hash_equals($row['sealed_digest'],CanonicalJson::digest($row['manifest']))) throw new OperationException('content_conflict','The retained change manifest failed its integrity check.');
        $row['payload'] = $row['payload_json'] === null ? null : json_decode($row['payload_json'],true,64,JSON_THROW_ON_ERROR);
        if(isset($row['manifest']['page_changes'])
            && CanonicalJson::digest($row['manifest']['page_changes'])!==CanonicalJson::digest($row['payload']['page_changes']??null))
            throw new OperationException('content_conflict','The retained page metadata review failed its integrity check.');
        unset($row['manifest_json'],$row['payload_json']);
        return $row;
    }
    private static function validId(string $id): void {
        if (!preg_match('/^change_[a-f0-9]{32}$/D',$id)) throw new OperationException('invalid_schema','Use the returned change-set ID.');
    }
}
