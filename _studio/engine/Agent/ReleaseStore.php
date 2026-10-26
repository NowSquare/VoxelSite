<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, SiteWorkspace};

/** Retained candidates and original live bytes are immutable after sealing. */
final class ReleaseStore
{
    public const RESERVATION_BYTES = 100663296;
    public const MAX_STORAGE_BYTES = 536870912;
    public const TTL = 1800;

    public function __construct(private Database $db, private ActorPolicy $policy, private string $root)
    {
        $this->root = \VoxelSite\FilesystemPath::normalize($root);
        if (!\VoxelSite\FilesystemPath::isAbsolute($this->root) || is_link($this->root)) throw new \InvalidArgumentException('A trusted private release root is required.');
    }

    public function reserve(OperationActor $actor, array $request): array
    {
        $this->policy->require($actor,['publish:write','files:read','assets:read','forms:read']);
        return $this->db->transaction(function () use ($actor,$request): array {
            $digest=CanonicalJson::digest($request);
            $row=$this->db->queryOne('SELECT * FROM agent_publish_plans WHERE actor_key = ? AND request_id = ?',[$actor->identity(),$request['request_id']]);
            if ($row) {
                if (!hash_equals($row['request_digest'],$digest)) throw new OperationException('idempotency_conflict','This request ID belongs to a different publish preparation.');
                return $this->decode($actor,$row);
            }
            if ((int)$this->db->scalar('SELECT COUNT(*) FROM agent_publish_plans WHERE actor_key = ? AND staged_bytes > 0',[$actor->identity()])>=32
                || (int)$this->db->scalar('SELECT COUNT(*) FROM agent_publish_plans WHERE staged_bytes > 0')>=512
                || (int)$this->db->scalar('SELECT COALESCE(SUM(staged_bytes),0) FROM agent_publish_plans')+self::RESERVATION_BYTES>self::MAX_STORAGE_BYTES) {
                throw new OperationException('size_limit','Retained publish storage is full. Review its retention before preparing another release.');
            }
            $id='publish_'.bin2hex(random_bytes(16));
            $this->db->insert('agent_publish_plans',[
                'id'=>$id,'actor_key'=>$actor->identity(),'user_id'=>$actor->userId,'credential_id'=>$actor->credentialId,
                'request_id'=>$request['request_id'],'request_digest'=>$digest,'status'=>'preparing',
                'staged_bytes'=>self::RESERVATION_BYTES,'created_at'=>time(),'expires_at'=>time()+self::TTL,
            ]);
            return $this->get($actor,$id);
        });
    }

    public function get(OperationActor $actor,string $id,bool $started=false): array
    {
        $this->policy->require($actor,['publish:write','files:read','assets:read','forms:read']);
        self::validId($id);
        $row=$this->db->queryOne('SELECT * FROM agent_publish_plans WHERE id = ?',[$id]);
        if (!$row) throw new OperationException('permission_denied','This publish plan is unavailable to this connection.');
        return $this->decode($actor,$row,$started);
    }

    public function seal(OperationActor $actor,string $id,array $manifest,array $payload,int $bytes): array
    {
        $this->get($actor,$id);
        $digest=CanonicalJson::digest($manifest);
        $payload['digest']=$digest;
        $manifestJson=CanonicalJson::encode($manifest);$payloadJson=CanonicalJson::encode($payload);
        $bytes+=strlen($manifestJson)+strlen($payloadJson)+1048576;
        if ($bytes>self::RESERVATION_BYTES) throw new OperationException('size_limit','The publish candidate exceeds its reserved storage.');
        if ($this->db->update('agent_publish_plans',['status'=>'ready','manifest_json'=>$manifestJson,
            'payload_json'=>$payloadJson,'digest'=>$digest,'staged_bytes'=>$bytes],
            "id = ? AND actor_key = ? AND status = 'preparing'",[$id,$actor->identity()])!==1) {
            throw new OperationException('content_conflict','This publish plan was already sealed.');
        }
        return $this->get($actor,$id);
    }

    public function stage(string $id,bool $create=false): string
    {
        self::validId($id);
        $target=SiteWorkspace::resolveWithin($this->root,$id);
        if ($create) {
            foreach ([$this->root,$target] as $dir) {
                if (!is_dir($dir) && !mkdir($dir,0700,true)) throw new OperationException('host_capability_unavailable','Cannot create private release storage.');
            }
            $access=SiteWorkspace::resolveWithin($this->root,'.htaccess');
            if (!is_file($access)) WorkspaceFiles::write($this->root,'.htaccess',"Require all denied\nDeny from all\n");
            $rules=file_get_contents($access);
            if ($rules===false || !str_contains($rules,'Require all denied') || !str_contains($rules,'Deny from all')) {
                throw new OperationException('host_capability_unavailable','Private release storage is not protected.');
            }
            $free=disk_free_space($this->root);
            if ($free===false || $free<self::RESERVATION_BYTES) throw new OperationException('host_capability_unavailable','Insufficient disk space for publish staging and recovery.');
        }
        if (!is_dir($target)) throw new OperationException('content_conflict','The retained publish candidate is missing.');
        return $target;
    }

    public function resetIncomplete(OperationActor $actor,string $id): void
    {
        $row=$this->get($actor,$id);
        if ($row['status']!=='preparing') return;
        $path=SiteWorkspace::resolveWithin($this->root,$id);
        if (!is_dir($path)) return;
        $entries=0;
        $remove=function(string $directory) use (&$remove,&$entries,$path):void {
            foreach (new \DirectoryIterator($directory) as $item) {
                if ($item->isDot()) continue;
                if (++$entries>5000) throw new OperationException('recovery_required','Incomplete release staging exceeds its cleanup budget.');
                $safe=SiteWorkspace::resolveWithin($path,\VoxelSite\FilesystemPath::relative($item->getPathname(),$path));
                if (is_dir($safe)) $remove($safe);
                elseif (!is_file($safe) || !unlink($safe)) throw new OperationException('recovery_required','Incomplete release staging could not be removed.');
            }
            if (!rmdir($directory)) throw new OperationException('recovery_required','Incomplete release storage remains reserved.');
        };
        $remove($path);
    }

    /** Called inside OperationStore::finish's domain transaction. */
    public function commit(OperationActor $actor,array $plan,array $operation,string $releaseId): void
    {
        if (!$this->db->getPdo()->inTransaction()) throw new \LogicException('A release requires the operation transaction.');
        if ($this->db->update('agent_publish_plans',['status'=>'published'],"id = ? AND status = 'ready'",[$plan['id']])!==1) {
            throw new OperationException('content_conflict','This candidate has already been published.');
        }
        $manifest=$plan['manifest'];
        $this->db->insert('site_releases',['id'=>$releaseId,'plan_id'=>$plan['id'],'operation_id'=>$operation['id'],
            'actor_json'=>CanonicalJson::encode($actor->attribution()),'before_release_id'=>$manifest['before_release_id'],
            'draft_version'=>$manifest['draft_version'],'manifest_json'=>CanonicalJson::encode($manifest['after']),
            'digest'=>CanonicalJson::digest($manifest['after']),'created_at'=>time()]);
    }

    public function managed(?string $releaseId): ?array
    {
        if ($releaseId===null) return null;
        $row=$this->db->queryOne('SELECT * FROM site_releases WHERE id = ?',[$releaseId]);
        if (!$row) throw new OperationException('content_conflict','The current managed release record is missing.');
        $manifest=json_decode($row['manifest_json'],true,64,JSON_THROW_ON_ERROR);
        if (!hash_equals($row['digest'],CanonicalJson::digest($manifest))) throw new OperationException('content_conflict','The managed release manifest failed verification.');
        return $manifest;
    }

    /** Journal only the current managed manifest; sealed candidates and archive bytes stay immutable. */
    public function actionTransition(SiteWorkspace $workspace,string $before,string $after):?array
    {
        $id=$workspace->status()['release_id'];if($id===null)return null;
        $manifest=$this->managed($id);
        if(($manifest['actions/manifest.json']??null)!==hash('sha256',$before))throw new OperationException('content_conflict','The current release does not own these Action manifest bytes.');
        $next=$manifest;$next['actions/manifest.json']=hash('sha256',$after);
        return ['release_id'=>$id,'before'=>$manifest,'after'=>$next];
    }
    public function assertActionTransition(SiteWorkspace $workspace,array $transition):void
    {
        if($workspace->status()['release_id']!==$transition['release_id'])throw new OperationException('recovery_required','The managed release changed outside the retained Action transition.');
        $current=$this->managed($transition['release_id']);$digest=CanonicalJson::digest($current);
        if($digest!==CanonicalJson::digest($transition['before'])&&$digest!==CanonicalJson::digest($transition['after']))throw new OperationException('recovery_required','The managed release hashes changed outside the retained Action transition.');
    }
    public function commitActionTransition(SiteWorkspace $workspace,array $transition,bool $restore):void
    {
        if(!$this->db->getPdo()->inTransaction())throw new \LogicException('Action provenance requires its journal transaction.');
        $this->assertActionTransition($workspace,$transition);$manifest=$transition[$restore?'before':'after'];
        $this->db->update('site_releases',['manifest_json'=>CanonicalJson::encode($manifest),'digest'=>CanonicalJson::digest($manifest)],'id=?',[$transition['release_id']]);
    }

    private function decode(OperationActor $actor,array $row,bool $started=false): array
    {
        if ($row['actor_key']!==$actor->identity() || (int)$row['user_id']!==$actor->userId) throw new OperationException('permission_denied','This publish plan belongs to another connection.');
        if ($row['status']==='expired' || ($row['pruned_at']??null)!==null) throw new OperationException('review_expired','Retained publish bytes were removed by the retention policy. Prepare a new review.');
        if (!$started && (int)$row['expires_at']<=time()) throw new OperationException('review_expired','The publish review expired. Prepare a new plan.');
        $row['manifest']=$row['manifest_json']===null?null:json_decode($row['manifest_json'],true,64,JSON_THROW_ON_ERROR);
        $row['payload']=$row['payload_json']===null?null:json_decode($row['payload_json'],true,64,JSON_THROW_ON_ERROR);
        if ($row['manifest']!==null && !hash_equals($row['digest'],CanonicalJson::digest($row['manifest']))) {
            throw new OperationException('content_conflict','The publish manifest failed verification.');
        }
        unset($row['manifest_json'],$row['payload_json']);return $row;
    }
    private static function validId(string $id):void
    {
        if (!preg_match('/^publish_[a-f0-9]{32}$/D',$id)) throw new OperationException('invalid_schema','Use the returned publish-plan ID.');
    }
}
