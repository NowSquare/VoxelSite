<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,SiteWorkspace};

/** Private immutable archives; authority is checked again at every read and download. */
final class DownloadGrantStore
{
    public const TTL=1800;
    public const GRANT_TTL=120;
    public const MAX_ARCHIVE_BYTES=42991616;
    public const RESERVATION_BYTES=134217728;
    public const MAX_STORAGE_BYTES=536870912;
    public const SCOPES=['export:read','files:read','assets:read','forms:read'];

    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,private string $root)
    {
        if (!str_starts_with($root,'/') || is_link($root)) throw new \InvalidArgumentException('A trusted private export root is required.');
    }

    public function reserve(OperationActor $actor,array $request):array
    {
        $this->policy->require($actor,self::SCOPES);
        return $this->db->transaction(function()use($actor,$request):array {
            $digest=CanonicalJson::digest($request);
            $row=$this->db->queryOne('SELECT * FROM agent_exports WHERE actor_key = ? AND request_id = ?',[$actor->identity(),$request['request_id']]);
            if($row) {
                if(!hash_equals($row['request_digest'],$digest))throw new OperationException('idempotency_conflict','This request ID belongs to a different export.');
                return $this->get($actor,$row['id']);
            }
            if((int)$this->db->scalar('SELECT COALESCE(SUM(staged_bytes),0) FROM agent_exports')+self::RESERVATION_BYTES>self::MAX_STORAGE_BYTES
                || (int)$this->db->scalar("SELECT COUNT(*) FROM agent_exports WHERE status != 'expired'")>=32) {
                throw new OperationException('size_limit','Retained export storage is full. Clean expired exports before preparing another archive.');
            }
            $id='export_'.bin2hex(random_bytes(16));
            $this->db->insert('agent_exports',['id'=>$id,'actor_key'=>$actor->identity(),'actor_type'=>$actor->type,'site_key'=>$this->siteKey(),
                'user_id'=>$actor->userId,'credential_id'=>$actor->credentialId,'request_id'=>$request['request_id'],
                'request_digest'=>$digest,'status'=>'preparing','staged_bytes'=>self::RESERVATION_BYTES,'created_at'=>time(),'expires_at'=>time()+self::TTL]);
            return $this->get($actor,$id);
        });
    }

    public function get(OperationActor $actor,string $id):array
    {
        $this->policy->require($actor,self::SCOPES);
        if(!preg_match('/^export_[a-f0-9]{32}$/D',$id))throw new OperationException('permission_denied','This export is unavailable.');
        $row=$this->db->queryOne('SELECT * FROM agent_exports WHERE id = ?',[$id]);
        if(!$row || $row['actor_key']!==$actor->identity() || (int)$row['user_id']!==$actor->userId
            || !hash_equals($row['site_key'],$this->siteKey()))throw new OperationException('permission_denied','This export belongs to another connection or installation.');
        if((int)$row['expires_at']<=time() || $row['status']==='expired')throw new OperationException('export_expired','This export expired. Prepare a new export with a new request ID.');
        foreach(['manifest','payload'] as $name)$row[$name]=$row[$name.'_json']===null?null:json_decode($row[$name.'_json'],true,64,JSON_THROW_ON_ERROR);
        if($row['manifest']!==null && !hash_equals($row['digest'],CanonicalJson::digest($row['manifest'])))throw new OperationException('content_conflict','The retained export manifest changed.');
        return $row;
    }

    public function stage(string $id,bool $create=false):string
    {
        if(!preg_match('/^export_[a-f0-9]{32}$/D',$id))throw new OperationException('invalid_path','Invalid export identity.');
        $path=SiteWorkspace::resolveWithin($this->root,$id);
        if($create) {
            foreach([$this->root,$path] as $dir)if(!is_dir($dir) && !mkdir($dir,0700,true))throw new OperationException('host_capability_unavailable','Cannot create private export storage.');
            $access=SiteWorkspace::resolveWithin($this->root,'.htaccess');
            if(!is_file($access))WorkspaceFiles::write($this->root,'.htaccess',"Require all denied\nDeny from all\n");
            $rules=file_get_contents($access,false,null,0,4097);
            if($rules===false || strlen($rules)>4096 || !str_contains($rules,'Require all denied') || !str_contains($rules,'Deny from all'))throw new OperationException('host_capability_unavailable','Private export storage needs access protection.');
            if(($free=disk_free_space($this->root))===false || $free<self::RESERVATION_BYTES)throw new OperationException('host_capability_unavailable','Insufficient disk space for bounded export staging.');
        }
        if(!is_dir($path))throw new OperationException('content_conflict','The retained export archive is missing.');
        return $path;
    }

    public function seal(OperationActor $actor,string $id,array $manifest,array $payload,int $bytes):array
    {
        $this->get($actor,$id);
        $digest=CanonicalJson::digest($manifest);$payload['digest']=$digest;
        $manifestJson=CanonicalJson::encode($manifest);$payloadJson=CanonicalJson::encode($payload);
        $bytes+=strlen($manifestJson)+strlen($payloadJson);
        if($bytes>self::RESERVATION_BYTES)throw new OperationException('size_limit','Export staging exceeds its reserved size.');
        if($this->db->update('agent_exports',['status'=>'ready','manifest_json'=>$manifestJson,'payload_json'=>$payloadJson,
            'digest'=>$digest,'staged_bytes'=>$bytes],"id = ? AND actor_key = ? AND status = 'preparing'",[$id,$actor->identity()])!==1)throw new OperationException('content_conflict','This export has already been sealed.');
        return $this->get($actor,$id);
    }

    public function create(OperationActor $actor,string $id,string $digest,string $operationId):array
    {
        return $this->db->transaction(function()use($actor,$id,$digest,$operationId):array {
            $row=$this->get($actor,$id);
            if($row['digest']===null || !hash_equals($row['digest'],$digest))throw new OperationException('content_conflict','Review the current export digest before creating it.');
            $existing=$this->db->queryOne('SELECT id FROM agent_exports WHERE actor_key = ? AND operation_id = ?',[$actor->identity(),$operationId]);
            if(($existing && $existing['id']!==$id) || ($row['operation_id']!==null && $row['operation_id']!==$operationId))throw new OperationException('idempotency_conflict','This operation ID belongs to a different export creation.');
            if(!in_array($row['status'],['ready','created'],true))throw new OperationException('content_conflict','This export is not ready.');
            $this->db->update('agent_exports',['operation_id'=>$operationId,'status'=>'created'],'id = ?',[$id]);
            return $this->get($actor,$id);
        });
    }

    public function grant(OperationActor $actor,string $id):array
    {
        return $this->db->transaction(function()use($actor,$id):array {
            $row=$this->get($actor,$id);
            if($row['status']!=='created')throw new OperationException('content_conflict','Create the reviewed export before downloading it.');
            $this->db->delete('agent_download_grants','expires_at <= ? OR consumed_at IS NOT NULL',[time()]);
            if((int)$this->db->scalar('SELECT COUNT(*) FROM agent_download_grants WHERE export_id = ?',[$id])>=8
                || (int)$this->db->scalar('SELECT COUNT(*) FROM agent_download_grants')>=256)throw new OperationException('size_limit','The download grant limit was reached. Wait for existing grants to expire.');
            $token=bin2hex(random_bytes(32));$expires=min(time()+self::GRANT_TTL,(int)$row['expires_at']);
            $this->db->insert('agent_download_grants',['token_hash'=>hash('sha256',$token),'export_id'=>$id,'site_key'=>$this->siteKey(),
                'archive_hash'=>$row['manifest']['archive_sha256'],'created_at'=>time(),'expires_at'=>$expires]);
            return ['ticket'=>$token,'expires_at'=>$expires,'export_id'=>$id,'sha256'=>$row['manifest']['archive_sha256']];
        });
    }

    /** The caller validates Origin. Returns the same verified open handle it must stream and close. */
    public function openDownload(string $ticket):array
    {
        if(!preg_match('/^[a-f0-9]{64}$/D',$ticket))throw new OperationException('download_expired','This download ticket is unavailable.');
        return $this->db->transaction(function()use($ticket):array {
            $grant=$this->db->queryOne('SELECT * FROM agent_download_grants WHERE token_hash = ?',[hash('sha256',$ticket)]);
            if(!$grant || $grant['consumed_at']!==null || (int)$grant['expires_at']<=time() || !hash_equals($grant['site_key'],$this->siteKey()))throw new OperationException('download_expired','This download ticket was used or expired. Request a fresh download.');
            $row=$this->db->queryOne('SELECT * FROM agent_exports WHERE id = ?',[$grant['export_id']]);
            if(!$row)throw new OperationException('download_expired','This export is unavailable.');
            $actor=match($row['actor_type']) {
                'api_key'=>$this->policy->fromCredential((int)$row['credential_id']),
                'rest_key'=>$this->policy->fromRestCredential((int)$row['credential_id']),
                'user'=>new OperationActor('user',(int)$row['user_id'],null,[],'forbidden',null),
                default=>throw new OperationException('permission_denied','Invalid download authority.'),
            };
            $row=$this->get($actor,$row['id']);
            if($row['status']!=='created' || !hash_equals($row['manifest']['archive_sha256'],$grant['archive_hash']))throw new OperationException('content_conflict','The reviewed archive is unavailable.');
            $path=SiteWorkspace::resolveWithin($this->stage($row['id']),'site.zip');
            $handle=@fopen($path,'rb');
            if($handle===false)throw new OperationException('content_conflict','The export archive is missing.');
            try {
                $before=fstat($handle);$expected=(int)$row['manifest']['archive_bytes'];
                if(!$before || $before['size']!==$expected || $expected>self::MAX_ARCHIVE_BYTES || !flock($handle,LOCK_SH))throw new OperationException('content_conflict','The archive size changed.');
                $hash=hash_init('sha256');$bytes=0;
                while(!feof($handle)) {
                    $chunk=fread($handle,min(65536,$expected-$bytes+1));
                    if($chunk===false || ($chunk==='' && !feof($handle)))throw new OperationException('content_conflict','Cannot verify this archive.');
                    $bytes+=strlen($chunk);
                    if($bytes>$expected)throw new OperationException('content_conflict','The archive grew during verification.');
                    hash_update($hash,$chunk);
                }
                if($bytes!==$expected || fstat($handle)['size']!==$expected || !hash_equals($grant['archive_hash'],hash_final($hash)))throw new OperationException('content_conflict','The retained archive checksum changed.');
                rewind($handle);
                if($this->db->update('agent_download_grants',['consumed_at'=>time()],'token_hash = ? AND consumed_at IS NULL',[$grant['token_hash']])!==1)throw new OperationException('download_expired','This ticket was already used.');
                return ['handle'=>$handle,'bytes'=>$expected,'sha256'=>$grant['archive_hash'],'filename'=>'website-'.$row['payload']['format'].'.zip'];
            }catch(\Throwable $error){fclose($handle);throw $error;}
        });
    }

    /** Bounded maintenance preserves request/digest tombstones; active archives never change. */
    public function pruneExpired(int $limit=4):int
    {
        $count=0;$remaining=200;$deadline=microtime(true)+0.05;
        foreach($this->db->query('SELECT id FROM agent_exports WHERE expires_at <= ? AND pruned_at IS NULL LIMIT ?', [time(),max(1,min(4,$limit))]) as $row) {
            if($remaining<=0 || microtime(true)>$deadline)break;
            $path=SiteWorkspace::resolveWithin($this->root,$row['id']);
            if(is_dir($path) && !$this->removeExpired($path,$path,$remaining,$deadline))break;
            $this->db->transaction(function()use($row):void {
                $this->db->delete('agent_download_grants','export_id = ?',[$row['id']]);
                $this->db->update('agent_exports',['status'=>'expired','manifest_json'=>null,'payload_json'=>null,'staged_bytes'=>0,'pruned_at'=>time()],'id = ?',[$row['id']]);
            });$count++;
        }
        return $count;
    }

    private function removeExpired(string $root,string $path,int &$remaining,float $deadline):bool
    {
        foreach(new \DirectoryIterator($path) as $entry) {
            if($entry->isDot())continue;
            if($remaining--<=0 || microtime(true)>$deadline)return false;
            $safe=SiteWorkspace::resolveWithin($root,substr($entry->getPathname(),strlen($root)+1));
            if(is_dir($safe)) {
                if(!$this->removeExpired($root,$safe,$remaining,$deadline))return false;
            }elseif(!unlink($safe))throw new OperationException('host_capability_unavailable','Cannot remove expired export bytes.');
        }
        return rmdir($path);
    }

    public static function removeTree(string $root):void
    {
        $entries=0;
        $remove=function(string $path)use(&$remove,&$entries,$root):void {
            foreach(new \DirectoryIterator($path) as $entry) {
                if($entry->isDot())continue;
                if(++$entries>5000)throw new OperationException('size_limit','Export cleanup exceeds its bounded inventory.');
                $safe=SiteWorkspace::resolveWithin($root,substr($entry->getPathname(),strlen($root)+1));
                if(is_dir($safe))$remove($safe);elseif(!unlink($safe))throw new OperationException('host_capability_unavailable','Cannot remove expired export bytes.');
            }
            if(!rmdir($path))throw new OperationException('host_capability_unavailable','Cannot remove expired export folder.');
        };$remove($root);
    }
    private function siteKey():string{return hash('sha256',$this->workspace->draftRoot()."\n".$this->workspace->publishedRoot());}
}
