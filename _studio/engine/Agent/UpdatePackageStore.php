<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,SiteWorkspace,SiteMutationLock};

/** Bytes remain inert in private storage until an exact owner-approved update consumes them. */
final class UpdatePackageStore
{
    public const CHUNK_BYTES=262144;
    public const MAX_STORAGE=536870912;
    private string $root;
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,string $root)
    {
        $root=\VoxelSite\FilesystemPath::normalize($root);
        $parent=\VoxelSite\FilesystemPath::realpath(dirname($root));if(!$parent||is_link(dirname($root)))throw new \InvalidArgumentException('Update storage needs an existing private parent.');
        $this->root=SiteWorkspace::resolveWithin($parent,basename($root));
    }
    public static function inputSchema(string $method):array
    {
        $c=ToolContracts::class;$id=['package_id'=>$c::id('update')];
        return match($method){
            'begin'=>$c::object(['request_id'=>$c::requestId(),'filename'=>['type'=>'string','pattern'=>'^[A-Za-z0-9][A-Za-z0-9_.-]{0,119}\.zip$'],'bytes'=>['type'=>'integer','minimum'=>1,'maximum'=>UpdatePackagePolicy::MAX_ARCHIVE_BYTES],'sha256'=>$c::hash()]),
            'chunk'=>$c::object($id+['request_id'=>$c::requestId(),'offset'=>$c::integer(UpdatePackagePolicy::MAX_ARCHIVE_BYTES),'data_base64'=>['type'=>'string','minLength'=>4,'maxLength'=>4*(int)ceil(self::CHUNK_BYTES/3)],'sha256'=>$c::hash()]),
            'finish'=>$c::object($id+['expected_index'=>$c::integer(UpdatePackagePolicy::MAX_ENTRIES)]),
            'get'=>$c::object($id),
            default=>throw new \InvalidArgumentException('Unknown update transfer method.'),
        };
    }
    public static function outputSchema():array
    {
        $c=ToolContracts::class;
        return $c::object(['package_id'=>$c::id('update'),'status'=>['enum'=>['uploading','extracting','staged','prepared','activated','error','expired']],
            'filename'=>$c::text(124),'sha256'=>$c::hash(),'bytes'=>$c::integer(UpdatePackagePolicy::MAX_ARCHIVE_BYTES),
            'received_bytes'=>$c::integer(UpdatePackagePolicy::MAX_ARCHIVE_BYTES),'next_index'=>$c::integer(UpdatePackagePolicy::MAX_ENTRIES),
            'total_files'=>$c::integer(UpdatePackagePolicy::MAX_ENTRIES),'preserved_files'=>$c::integer(UpdatePackagePolicy::MAX_ENTRIES),
            'version'=>$c::nullable($c::text(64)),'expires_at'=>$c::integer(),'max_chunk_bytes'=>$c::integer(self::CHUNK_BYTES),'provider_calls'=>['const'=>0]]);
    }
    public function begin(OperationActor $actor,\stdClass $input):array
    {return $this->beginSource($actor,$input,false);}
    private function beginSource(OperationActor $actor,\stdClass $input,bool $local,string $sourceKind='upload'):array
    {
        $this->authorize($actor);JsonSchema::validate($input,self::inputSchema('begin'));$lock=$this->lock();
        try{
            $digest=CanonicalJson::digest($input);$prior=$this->db->queryOne('SELECT * FROM agent_update_packages WHERE actor_key=? AND request_id=?',[$actor->identity(),$input->request_id]);
            if($prior){$this->authorizeRow($actor,$prior);if($prior['source_kind']!==$sourceKind||!hash_equals($prior['request_digest'],$digest))throw new OperationException('idempotency_conflict','This update request identity has different input.');return $this->present($prior);}
            $hostLimit=$local?UpdatePackagePolicy::MAX_ARCHIVE_BYTES:min(UpdatePackagePolicy::MAX_ARCHIVE_BYTES,self::iniBytes((string)ini_get('upload_max_filesize')),self::iniBytes((string)ini_get('post_max_size')));
            if($input->bytes>$hostLimit)throw new OperationException('size_limit','The update package exceeds this installation or PHP upload limit.');
            if((int)$this->db->scalar("SELECT COUNT(*) FROM agent_update_packages WHERE status!='expired'")>=16)throw new OperationException('size_limit','Private update package retention is full. Run bounded expired-package cleanup.');
            $reserved=$input->bytes*2;$this->quota($reserved);
            $id='update_'.bin2hex(random_bytes(16));$this->db->insert('agent_update_packages',['id'=>$id,'actor_key'=>$actor->identity(),'user_id'=>$actor->userId,'site_key'=>$this->siteKey(),'request_id'=>$input->request_id,'request_digest'=>$digest,'source_kind'=>$sourceKind,'source_label'=>$input->filename,'expected_bytes'=>$input->bytes,'expected_hash'=>$input->sha256,'reserved_bytes'=>$reserved,'status'=>'uploading','created_at'=>time(),'expires_at'=>time()+86400]);
            return $this->get($actor,(object)['package_id'=>$id]);
        }finally{$this->unlock($lock);}
    }
    /** Trusted upload/dist/Git adapters supply the source path; tool arguments never do. */
    public function importArchive(OperationActor $actor,string $path,string $filename,string $requestId,string $sourceKind='local'):array
    {
        $this->authorize($actor);
        if(!in_array($sourceKind,['local','git','upload'],true))throw new \InvalidArgumentException('Unsupported trusted update source.');
        $path=\VoxelSite\FilesystemPath::normalize($path);
        $parent=\VoxelSite\FilesystemPath::realpath(dirname($path));if(!$parent)throw new OperationException('not_found','The update archive is unavailable.');
        $path=SiteWorkspace::resolveWithin($parent,basename($path));$stat=lstat($path);
        if(!$stat||!is_file($path)||$stat['size']<1||$stat['size']>UpdatePackagePolicy::MAX_ARCHIVE_BYTES)throw new OperationException('size_limit','The update archive exceeds its bounded file budget.');
        $stream=fopen($path,'rb');if(!$stream)throw new OperationException('not_found','The update archive cannot be read.');
        $hash=hash_init('sha256');$size=0;$start=microtime(true);
        try{while(!feof($stream)){$bytes=fread($stream,65536);if($bytes===false)throw new OperationException('invalid_package','The update archive could not be read.');$size+=strlen($bytes);if($size>$stat['size'])throw new OperationException('content_conflict','The update archive changed while being read.');hash_update($hash,$bytes);if(microtime(true)-$start>5)throw new OperationException('host_capability_unavailable','This archive exceeds the host read budget.');}}
        finally{fclose($stream);}
        if($size!==$stat['size'])throw new OperationException('content_conflict','The update archive changed while being read.');
        $state=$this->beginSource($actor,(object)['request_id'=>$requestId,'filename'=>$filename,'bytes'=>$size,'sha256'=>hash_final($hash)],$sourceKind!=='upload',$sourceKind);
        if($state['status']!=='uploading')return $state;
        $lock=$this->lock();
        try{
            $row=$this->row($actor,$state['package_id']);if($row['status']!=='uploading')return $this->present($row);
            if((int)$row['received_bytes']!==0)throw new OperationException('content_conflict','This package already has a different transfer in progress.');
            $directory=$this->directory($row['id']);$temporary=SiteWorkspace::resolveWithin($directory,'package.zip.part');if(is_link($temporary))throw new OperationException('invalid_path','The update staging path is invalid.');
            $in=fopen($path,'rb');$out=fopen($temporary,'wb');if(!$in||!$out){if($in)fclose($in);if($out)fclose($out);throw new OperationException('write_failed','The update archive cannot be retained.');}
            $copied=0;$hash=hash_init('sha256');$start=microtime(true);
            try{while(!feof($in)){$bytes=fread($in,65536);if($bytes===false)throw new OperationException('invalid_package','The update source could not be read.');$copied+=strlen($bytes);if($copied>$size||fwrite($out,$bytes)!==strlen($bytes))throw new OperationException('write_failed','The update source changed or could not be retained.');hash_update($hash,$bytes);if(microtime(true)-$start>5)throw new OperationException('host_capability_unavailable','This archive exceeds the host retention budget.');}}
            finally{fclose($in);fclose($out);}
            if($copied!==$size||!hash_equals($row['expected_hash'],hash_final($hash)))throw new OperationException('content_conflict','The update source changed before retention.');
            if(!chmod($temporary,0600)||!rename($temporary,$directory.'/package.zip'))throw new OperationException('write_failed','The archive could not be sealed.');
            $this->db->update('agent_update_packages',['source_kind'=>$sourceKind,'received_bytes'=>$size,'status'=>'extracting'],'id=?',[$row['id']]);
            return $this->get($actor,(object)['package_id'=>$row['id']]);
        }finally{$this->unlock($lock);}
    }
    public function chunk(OperationActor $actor,\stdClass $input):array
    {
        $this->authorize($actor);JsonSchema::validate($input,self::inputSchema('chunk'));$bytes=base64_decode($input->data_base64,true);
        if($bytes===false||$bytes===''||base64_encode($bytes)!==$input->data_base64||strlen($bytes)>self::CHUNK_BYTES||!hash_equals($input->sha256,hash('sha256',$bytes)))throw new OperationException('invalid_schema','Provide a bounded canonical chunk and its exact hash.');
        $lock=$this->lock();
        try{
            $row=$this->row($actor,$input->package_id);$prior=$this->db->queryOne('SELECT * FROM agent_update_chunks WHERE package_id=? AND (byte_offset=? OR request_id=?)',[$row['id'],$input->offset,$input->request_id]);
            if($prior&&((int)$prior['byte_offset']!==$input->offset||(int)$prior['byte_length']!==strlen($bytes)||$prior['request_id']!==$input->request_id||!hash_equals($prior['sha256'],$input->sha256)))throw new OperationException('idempotency_conflict','This update chunk identity is already reserved for different bytes.');
            if($prior&&(int)$row['received_bytes']>=$input->offset+strlen($bytes))return $this->present($row);
            if($row['status']!=='uploading'||(int)$row['received_bytes']!==$input->offset)throw new OperationException('content_conflict','Continue at the package received_bytes offset.');
            if($input->offset+strlen($bytes)>(int)$row['expected_bytes'])throw new OperationException('size_limit','This chunk exceeds the declared package size.');
            if(!$prior)$this->db->insert('agent_update_chunks',['package_id'=>$row['id'],'byte_offset'=>$input->offset,'byte_length'=>strlen($bytes),'sha256'=>$input->sha256,'request_id'=>$input->request_id]);
            WorkspaceFiles::write($this->directory($row['id']),'chunk-'.$input->offset.'.bin',$bytes);
            $this->db->update('agent_update_packages',['received_bytes'=>$input->offset+strlen($bytes)],'id=?',[$row['id']]);
            return $this->get($actor,(object)['package_id'=>$row['id']]);
        }finally{$this->unlock($lock);}
    }
    /** Explicit checkpoint continuation: repeating an earlier index is a pure acknowledgement. */
    public function finish(OperationActor $actor,\stdClass $input):array
    {
        $this->authorize($actor);JsonSchema::validate($input,self::inputSchema('finish'));$lock=$this->lock();
        try{
            $row=$this->row($actor,$input->package_id);
            if($input->expected_index>(int)$row['extract_index'])throw new OperationException('content_conflict','Read the current package extraction checkpoint.');
            if($input->expected_index<(int)$row['extract_index']||in_array($row['status'],['staged','prepared','activated'],true))return $this->present($row);
            if((int)$row['received_bytes']!==(int)$row['expected_bytes'])throw new OperationException('content_conflict','Upload all declared package bytes before validation.');
            $this->memoryBudget();$directory=$this->directory($row['id']);$archive=SiteWorkspace::resolveWithin($directory,'package.zip');
            if($row['status']==='uploading')$this->assemble($row,$archive);
            $this->verifyArchive($row,$archive);
            $zip=new \ZipArchive();if($zip->open($archive,\ZipArchive::CHECKCONS)!==true)throw new OperationException('invalid_package','The update archive is corrupt or unsupported.');
            try{
                $inventory=UpdatePackagePolicy::inventory($zip);$manifest=$row['manifest_json']?json_decode($row['manifest_json'],true,64,JSON_THROW_ON_ERROR):null;
                if(!$manifest){
                    $reserved=(int)$row['expected_bytes']*2+array_sum(array_column($inventory['entries'],'bytes'))*2;
                    $this->quota($reserved-(int)$row['reserved_bytes']);
                    $manifest=$inventory+['files'=>[]];$this->db->update('agent_update_packages',['status'=>'extracting','manifest_json'=>CanonicalJson::encode($manifest),'reserved_bytes'=>$reserved],'id=?',[$row['id']]);
                }elseif(CanonicalJson::digest($inventory)!==CanonicalJson::digest(array_intersect_key($manifest,$inventory)))throw new OperationException('content_conflict','Retained update metadata changed.');
                $index=(int)$row['extract_index'];$count=0;$bytes=0;$start=microtime(true);
                while($index<count($manifest['entries'])&&$count<100&&$bytes<4194304&&microtime(true)-$start<4){
                    $entry=$manifest['entries'][$index];$content=UpdatePackagePolicy::entryBytes($zip,$entry);
                    WorkspaceFiles::write($directory,'candidate/'.$entry['path'],$content);
                    $manifest['files'][$entry['path']]=['bytes'=>strlen($content),'sha256'=>hash('sha256',$content)];$index++;$count++;$bytes+=strlen($content);
                }
                $this->db->update('agent_update_packages',['extract_index'=>$index,'manifest_json'=>CanonicalJson::encode($manifest),'status'=>$index===count($manifest['entries'])?'staged':'extracting'],'id=?',[$row['id']]);
            }finally{$zip->close();}
            return $this->get($actor,(object)['package_id'=>$row['id']]);
        }finally{$this->unlock($lock);}
    }
    public function get(OperationActor $actor,\stdClass $input):array
    {JsonSchema::validate($input,self::inputSchema('get'));return $this->present($this->row($actor,$input->package_id));}
    /** Trusted service use only; never include private roots or archive manifests in a tool result. */
    public function staged(OperationActor $actor,string $id):array
    {$row=$this->row($actor,$id);if(!in_array($row['status'],['staged','prepared','activated'],true))throw new OperationException('content_conflict','Finish validating this update package first.');return ['row'=>$row,'directory'=>$this->directory($id),'manifest'=>json_decode($row['manifest_json'],true,64,JSON_THROW_ON_ERROR)];}
    public function root():string {return $this->root;}
    /** Trusted Git adapter reservation precedes every byte, including interrupted staging. */
    public function reserveSource(OperationActor $actor,string $requestId):array
    {
        $this->authorize($actor);JsonSchema::validate($requestId,ToolContracts::requestId());$lock=$this->lock();
        try {
            $row=$this->db->queryOne('SELECT * FROM agent_update_sources WHERE actor_key=? AND request_id=?',[$actor->identity(),$requestId]);
            if ($row) {
                if (!hash_equals($row['site_key'],$this->siteKey())) throw new OperationException('permission_denied','This source belongs to another installation.');
                if($row['pruned_at']!==null||(int)$row['created_at']<time()-86400)throw new OperationException('review_expired','This exact Git staging request expired.');
                return $row;
            }
            if ((int)$this->db->scalar('SELECT COUNT(*) FROM agent_update_sources WHERE pruned_at IS NULL')>=16) throw new OperationException('size_limit','Private update source retention is full.');
            $this->quota(UpdatePackagePolicy::MAX_ARCHIVE_BYTES);
            $row=['actor_key'=>$actor->identity(),'request_id'=>$requestId,'site_key'=>$this->siteKey(),'reserved_bytes'=>UpdatePackagePolicy::MAX_ARCHIVE_BYTES,'metadata_json'=>null,'created_at'=>time()];
            $this->db->insert('agent_update_sources',$row);return $row;
        } finally {$this->unlock($lock);}
    }
    public function retainSource(OperationActor $actor,string $requestId,array $metadata):void
    {
        $this->authorize($actor);$json=CanonicalJson::encode($metadata);
        if(strlen($json)>4096)throw new OperationException('size_limit','The retained source identity is too large.');
        $this->db->update('agent_update_sources',['metadata_json'=>$json],'actor_key=? AND request_id=? AND metadata_json IS NULL',[$actor->identity(),$requestId]);
    }
    public function releaseSource(OperationActor $actor,string $requestId):void
    {$this->authorize($actor);$this->db->delete('agent_update_sources','actor_key=? AND request_id=?',[$actor->identity(),$requestId]);}
    public function priorSource(OperationActor $actor,string $requestId,string $kind):?array
    {
        $this->authorize($actor);$row=$this->db->queryOne('SELECT * FROM agent_update_packages WHERE actor_key=? AND request_id=?',[$actor->identity(),$requestId]);
        if(!$row)return null;$this->authorizeRow($actor,$row);
        if($row['source_kind']!==$kind)throw new OperationException('idempotency_conflict','This update request belongs to another source.');
        return $row['status']==='uploading'?null:$this->present($row);
    }
    public static function cleanupSchema():array
    {$c=ToolContracts::class;return $c::object(['removed_files'=>$c::integer(100),'expired_packages'=>$c::integer(16),'expired_sources'=>$c::integer(16),'has_more'=>['type'=>'boolean'],'provider_calls'=>['const'=>0]]);}
    /** Expiry tombstones keep request identities; approved jobs and recovery originals are never pruned early. */
    public function cleanup(OperationActor $actor,\stdClass $input):array
    {
        $this->authorize($actor);JsonSchema::validate($input,ToolContracts::object([]));
        $siteLock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);$lock=$this->lock();
        $result=['removed_files'=>0,'expired_packages'=>0,'expired_sources'=>0,'has_more'=>false,'provider_calls'=>0];$start=microtime(true);
        try{
            $rows=$this->db->query("SELECT p.* FROM agent_update_packages p WHERE p.pruned_at IS NULL AND p.expires_at<?
                AND NOT EXISTS(SELECT 1 FROM agent_update_reviews r JOIN agent_admin_plans a ON a.id=r.plan_id
                    WHERE r.package_id=p.id AND (a.expires_at>=? OR a.status IN ('pending','approved') AND a.expires_at>=?))
                AND NOT EXISTS(SELECT 1 FROM agent_update_jobs j JOIN agent_operations o ON o.id=j.operation_row_id
                    WHERE j.package_id=p.id AND (o.state IN ('prepared','applying','recovery_required') OR o.result_pruned_at IS NULL))
                ORDER BY p.created_at LIMIT 16",[time(),time(),time()]);
            foreach($rows as $row){
                $directory=SiteWorkspace::resolveWithin($this->root,$row['id']);$remaining=false;$runtimeBytes=0;
                if(is_dir($directory)){
                    $iterator=new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($directory,\FilesystemIterator::SKIP_DOTS),\RecursiveIteratorIterator::CHILD_FIRST);
                    $seen=0;
                    foreach($iterator as $file){
                        if(++$seen>16000)throw new OperationException('size_limit','A retained update tree exceeds its cleanup scan budget.');
                        $relative=\VoxelSite\FilesystemPath::relative($file->getPathname(),$directory);$path=SiteWorkspace::resolveWithin($directory,$relative);
                        if($file->isLink())throw new OperationException('invalid_path','Update cleanup cannot follow a symlink.');
                        if($relative==='runtime'||str_starts_with($relative,'runtime/')){if($file->isFile())$runtimeBytes+=$file->getSize();continue;}
                        if($result['removed_files']>=100||microtime(true)-$start>4){$remaining=true;break;}
                        if($file->isDir()){if(count(scandir($path))===2&&!rmdir($path))throw new OperationException('write_failed','Cannot remove an expired staging directory.');}
                        elseif($file->isFile()){if(!unlink($path))throw new OperationException('write_failed','Cannot remove expired update staging.');$result['removed_files']++;}
                        else throw new OperationException('invalid_path','Unsupported expired staging file.');
                    }
                }
                if($remaining){$result['has_more']=true;break;}
                $this->db->update('agent_update_packages',['status'=>'expired','manifest_json'=>null,'reserved_bytes'=>$runtimeBytes,'pruned_at'=>time()],'id=?',[$row['id']]);$result['expired_packages']++;
            }
            if(!$result['has_more']){
                foreach($this->db->query('SELECT * FROM agent_update_sources WHERE pruned_at IS NULL AND created_at<? ORDER BY created_at LIMIT 16',[time()-86400]) as $source){
                    if($result['removed_files']>=100||microtime(true)-$start>4){$result['has_more']=true;break;}
                    $name='source-'.hash('sha256',$source['actor_key']."\0".$source['request_id']);
                    $sourceLock=fopen(SiteWorkspace::resolveWithin($this->root,$name.'.lock'),'c');
                    if(!$sourceLock||!flock($sourceLock,LOCK_EX|LOCK_NB)){if($sourceLock)fclose($sourceLock);$result['has_more']=true;continue;}
                    try{$path=SiteWorkspace::resolveWithin($this->root,$name.'.zip');if(is_file($path)){if(!unlink($path))throw new OperationException('write_failed','Cannot remove an expired Git archive.');$result['removed_files']++;}
                        $this->db->update('agent_update_sources',['reserved_bytes'=>0,'pruned_at'=>time()],'actor_key=? AND request_id=?',[$source['actor_key'],$source['request_id']]);$result['expired_sources']++;
                    }finally{flock($sourceLock,LOCK_UN);fclose($sourceLock);}
                }
            }
            return $result;
        }finally{$this->unlock($lock);unset($siteLock);}
    }
    public function siteKey():string {return CanonicalJson::digest([$this->workspace->publishedRoot(),$this->root]);}
    private function authorize(OperationActor $actor):void {$this->policy->require($actor,['updates:write']);$this->workspace->assertReady();if(!class_exists(\ZipArchive::class))throw new OperationException('host_capability_unavailable','The PHP ZIP extension is required for supported updates.');}
    private function row(OperationActor $actor,string $id):array
    {$this->authorize($actor);JsonSchema::validate($id,ToolContracts::id('update'));$row=$this->db->queryOne('SELECT * FROM agent_update_packages WHERE id=?',[$id]);if(!$row)throw new OperationException('not_found','The update package is unavailable.');$this->authorizeRow($actor,$row);return $row;}
    private function authorizeRow(OperationActor $actor,array $row):void
    {if($row['actor_key']!==$actor->identity()||(int)$row['user_id']!==$actor->userId||!hash_equals($row['site_key'],$this->siteKey()))throw new OperationException('permission_denied','The update package belongs to another connection or installation.');if((int)$row['expires_at']<time()&&!in_array($row['status'],['prepared','activated'],true))throw new OperationException('review_expired','This staged update package expired.');}
    private function present(array $row):array
    {$m=$row['manifest_json']?json_decode($row['manifest_json'],true,64,JSON_THROW_ON_ERROR):[];return ['package_id'=>$row['id'],'status'=>$row['status'],'filename'=>$row['source_label'],'sha256'=>$row['expected_hash'],'bytes'=>(int)$row['expected_bytes'],'received_bytes'=>(int)$row['received_bytes'],'next_index'=>(int)$row['extract_index'],'total_files'=>count($m['entries']??[]),'preserved_files'=>$m['skipped_files']??0,'version'=>$m['version']??null,'expires_at'=>(int)$row['expires_at'],'max_chunk_bytes'=>self::CHUNK_BYTES,'provider_calls'=>0];}
    private function quota(int $additional):void
    {if((int)$this->db->scalar('SELECT COALESCE(SUM(reserved_bytes),0) FROM agent_update_packages')+(int)$this->db->scalar('SELECT COALESCE(SUM(reserved_bytes),0) FROM agent_update_sources')+$additional>self::MAX_STORAGE||disk_free_space($this->directory())<max(0,$additional)+8388608)throw new OperationException('size_limit','Private update retention exceeds its storage budget. Review retained packages in Studio.');}
    private function memoryBudget():void
    {$limit=self::iniBytes((string)ini_get('memory_limit'));if($limit!==PHP_INT_MAX&&$limit-memory_get_usage(true)<UpdatePackagePolicy::MAX_FILE_BYTES*3+16777216)throw new OperationException('host_capability_unavailable','This host has insufficient remaining memory for bounded update validation.');}
    private static function iniBytes(string $value):int
    {if($value===''||$value==='-1'||$value==='0')return PHP_INT_MAX;$suffix=strtolower(substr($value,-1));return (int)$value*match($suffix){'g'=>1073741824,'m'=>1048576,'k'=>1024,default=>1};}
    private function directory(?string $id=null):string
    {
        if(is_link($this->root))throw new OperationException('invalid_path','Private update storage cannot use a symlink.');
        if(!is_dir($this->root)&&!mkdir($this->root,0700))throw new OperationException('host_capability_unavailable','Private update storage is unavailable.');
        if(!is_file($this->root.'/.htaccess'))WorkspaceFiles::write($this->root,'.htaccess',"Require all denied\nDeny from all\n");
        $protection=BusinessContracts::read($this->root,'.htaccess',4096);if(!str_contains($protection??'','Require all denied')||!str_contains($protection??'','Deny from all'))throw new OperationException('host_capability_unavailable','Private update storage access protection is missing.');
        if($id===null)return $this->root;$path=SiteWorkspace::resolveWithin($this->root,$id);if(!is_dir($path)&&!mkdir($path,0700))throw new OperationException('host_capability_unavailable','Cannot create private update staging.');return $path;
    }
    private function lock() { $h=fopen(SiteWorkspace::resolveWithin($this->directory(),'updates.lock'),'c');if(!$h||!flock($h,LOCK_EX|LOCK_NB)){if($h)fclose($h);throw new OperationException('site_busy','Another update package request is active.');}return $h; }
    private function unlock($h):void {flock($h,LOCK_UN);fclose($h);}
    private function assemble(array $row,string $path):void
    {
        $parts=$this->db->query('SELECT * FROM agent_update_chunks WHERE package_id=? ORDER BY byte_offset',[$row['id']]);$tmp=$path.'.part';if(is_link($tmp))throw new OperationException('invalid_path','Update assembly cannot use a symlink.');
        $out=fopen($tmp,'wb');if(!$out)throw new OperationException('host_capability_unavailable','Cannot assemble the update archive.');
        $hash=hash_init('sha256');$offset=0;$start=microtime(true);
        try{foreach($parts as $part){
            if((int)$part['byte_offset']!==$offset)throw new OperationException('content_conflict','Update chunks are not contiguous.');
            $bytes=BusinessContracts::read(dirname($path),'chunk-'.$offset.'.bin',self::CHUNK_BYTES);
            if($bytes===null||strlen($bytes)!==(int)$part['byte_length']||!hash_equals($part['sha256'],hash('sha256',$bytes)))throw new OperationException('content_conflict','A retained update chunk failed integrity verification.');
            if(fwrite($out,$bytes)!==strlen($bytes))throw new OperationException('write_failed','Cannot assemble update bytes.');hash_update($hash,$bytes);$offset+=strlen($bytes);
            if(microtime(true)-$start>5)throw new OperationException('host_capability_unavailable','This package exceeds the host assembly time budget.');
        }if($offset!==(int)$row['expected_bytes']||!hash_equals($row['expected_hash'],hash_final($hash)))throw new OperationException('content_conflict','The assembled update archive does not match its declared hash.');}
        finally{fclose($out);}
        if(!chmod($tmp,0600)||!rename($tmp,$path))throw new OperationException('write_failed','Cannot seal the update archive.');
    }
    private function verifyArchive(array $row,string $path):void
    {
        $path=SiteWorkspace::resolveWithin(dirname($path),basename($path));$stream=fopen($path,'rb');if(!$stream)throw new OperationException('content_conflict','The retained archive is missing.');
        $hash=hash_init('sha256');$size=0;$start=microtime(true);
        try{while(!feof($stream)){$chunk=fread($stream,65536);if($chunk===false)throw new OperationException('content_conflict','The retained archive is unreadable.');$size+=strlen($chunk);if($size>(int)$row['expected_bytes'])throw new OperationException('content_conflict','The retained archive grew after upload.');hash_update($hash,$chunk);if(microtime(true)-$start>5)throw new OperationException('host_capability_unavailable','Archive integrity verification exceeded the host budget.');}}
        finally{fclose($stream);}
        if($size!==(int)$row['expected_bytes']||!hash_equals($row['expected_hash'],hash_final($hash)))throw new OperationException('content_conflict','The retained archive no longer matches its uploaded hash.');
    }
}
