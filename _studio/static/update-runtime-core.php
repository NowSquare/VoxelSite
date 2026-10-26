<?php
declare(strict_types=1);
namespace VoxelSite\UpdateRuntime;

/** Frozen per update. Native PHP/PDO only: never autoload a partly replaced engine. */
final class Failure extends \RuntimeException
{
    public function __construct(public readonly string $errorCode,string $message){parent::__construct($message);}
}
final class Runtime
{
    public const MAX_FILE=16777216;
    private \PDO $pdo;
    public function __construct(private string $root,private string $storage,private string $database,private string $lockPath,private ?\Closure $checkpointHook=null)
    {
        $this->root=$root=self::nativePath($root);$this->storage=$storage=self::nativePath($storage);
        $this->database=$database=self::nativePath($database);$this->lockPath=$lockPath=self::nativePath($lockPath);
        foreach([$root,$storage] as $directory){self::assertAncestors($directory);if(($real=realpath($directory))===false||self::nativePath($real)!==$directory)throw new Failure('invalid_path','Update roots must be canonical directories.');}
        self::path(dirname($database),basename($database));self::path(dirname($lockPath),basename($lockPath));
        if(!is_file($database))throw new Failure('host_capability_unavailable','The retained update database is unavailable.');
        $this->pdo=new \PDO('sqlite:'.$database,null,null,[\PDO::ATTR_ERRMODE=>\PDO::ERRMODE_EXCEPTION,\PDO::ATTR_DEFAULT_FETCH_MODE=>\PDO::FETCH_ASSOC]);
        $this->pdo->exec('PRAGMA busy_timeout=2000');$this->pdo->exec('PRAGMA foreign_keys=ON');
    }
    /** Caller must obtain this identity from a verified token, never request JSON. */
    public function authorize(array $actor,bool $ownerSession=false):void
    {
        $user=$this->one('SELECT * FROM users WHERE id=?',[$actor['user_id']??0]);
        if(!$user||$user['role']!=='owner'||!empty($user['disabled_at'])||(array_key_exists('is_active',$user)&&!$user['is_active']))throw new Failure('permission_denied','A current owner account is required.');
        if(($actor['type']??null)==='user'){
            if(($actor['credential_id']??null)!==null)throw new Failure('permission_denied','Invalid session identity.');
            return;
        }
        if($ownerSession||($actor['type']??null)!=='api_key')throw new Failure('permission_denied','Use the owner account in Studio for recovery.');
        $key=$this->one('SELECT k.audience,k.scopes,c.user_id,c.revoked_at,c.expires_at FROM api_keys k JOIN studio_mcp_credentials c ON c.key_id=k.id WHERE k.id=?',[$actor['credential_id']??0]);
        $scopes=$key?json_decode($key['scopes'],true):[];
        if(!$key||$key['audience']!=='studio_mcp'||(int)$key['user_id']!==(int)$actor['user_id']||$key['revoked_at']!==null||($key['expires_at']!==null&&(int)$key['expires_at']<=time())||!is_array($scopes)||array_diff(['updates:write','operations:read'],$scopes))throw new Failure('permission_denied','This update connection no longer has the required authority.');
    }
    public function authenticate(?string $bearer,?string $session):array
    {
        if($bearer!==null){
            if(strlen($bearer)>512)throw new Failure('permission_denied','Invalid update credential.');
            $row=$this->one('SELECT k.id,c.user_id FROM api_keys k JOIN studio_mcp_credentials c ON c.key_id=k.id WHERE k.key_hash=?',[hash('sha256',$bearer)]);
            if(!$row)throw new Failure('permission_denied','Invalid update credential.');
            $actor=['type'=>'api_key','user_id'=>(int)$row['user_id'],'credential_id'=>(int)$row['id']];
        }else{
            if(!is_string($session)||!preg_match('/^[a-f0-9]{64}$/D',$session))throw new Failure('permission_denied','A current owner session is required.');
            $row=$this->one('SELECT user_id FROM sessions WHERE id=? AND expires_at>?',[$session,gmdate('Y-m-d\TH:i:s\Z')]);
            if(!$row)throw new Failure('permission_denied','The owner session expired.');
            $actor=['type'=>'user','user_id'=>(int)$row['user_id'],'credential_id'=>null];
        }
        $this->authorize($actor);return $actor;
    }
    public function status(array $actor,string $operationId):array
    {$this->authorize($actor);return $this->present($this->operation($actor,$operationId));}
    public function ownerStatus(array $owner,string $operationRowId):array
    {$this->authorize($owner,true);$row=$this->ownerOperation($operationRowId);return ['operation'=>$this->present($row),'recovery_id'=>$row['id'],'can_continue'=>$row['actor_key']==='user:'.$owner['user_id']];}
    public function advance(array $actor,string $operationId,int $checkpoint):array
    {
        $this->authorize($actor);$row=$this->operation($actor,$operationId);
        if(in_array($row['state'],['succeeded','failed_restored','cancelled','expired'],true)){$this->clearGate($row['id']);return $this->present($row);}
        if($row['state']==='recovery_required')return $this->present($row);
        $lock=$this->lock($row['id']);
        try{
            $this->authorize($actor);$row=$this->operation($actor,$operationId);$job=$this->job($row);
            if($job['phase']==='rollback')throw new Failure('recovery_required','Owner rollback is in progress. The original update cannot resume.');
            if((int)$row['checkpoint_number']!==$checkpoint)throw new Failure('content_conflict','Read the latest update checkpoint before continuing.');
            if($row['lease_expires_at']!==null&&(int)$row['lease_expires_at']>time())throw new Failure('site_busy','An update worker still holds this checkpoint.');
            $plan=$this->one('SELECT approved_by,status,consumed_at FROM agent_admin_plans WHERE id=?',[$job['plan_id']]);
            if(!$plan||$plan['status']!=='authorized'||$plan['consumed_at']===null)throw new Failure('approval_required','This exact update has no consumed owner approval.');
            $this->authorize(['type'=>'user','user_id'=>(int)$plan['approved_by'],'credential_id'=>null],true);
            if($row['state']==='prepared'&&(int)$row['expires_at']<=time())throw new Failure('review_expired','The authorized update execution expired before activation.');
            $manifest=$this->manifest($job);
            $this->pdo->beginTransaction();
            $this->exec("UPDATE agent_operations SET state='applying',lease_token=?,lease_expires_at=?,updated_at=? WHERE id=?",[bin2hex(random_bytes(24)),time()+45,time(),$row['id']]);
            $this->exec('UPDATE site_workspace_state SET reservation_operation_id=?,updated_at=? WHERE id=1',[$row['id'],time()]);
            $this->pdo->commit();
            $this->activateGate($job,$row);
            try{
                $this->verifyStates($manifest,false);
                if($job['phase']==='migrations')return $this->migrate($actor,$row,$job,$manifest);
                $cursor=(int)$job['cursor'];$start=microtime(true);$bytes=0;$count=0;
                while($cursor<count($manifest['files'])&&$count<50&&$bytes<4194304&&microtime(true)-$start<4){
                    $entry=$manifest['files'][$cursor];$current=self::bytes($this->root,$entry['path']);
                    $this->assertState($entry,$current);
                    if(self::hash($current)!==$entry['after_hash']){
                        $after=self::bytes($this->storage,$job['package_id'].'/candidate/'.$entry['path']);
                        if(self::hash($after)!==$entry['after_hash'])throw new Failure('recovery_required','A staged system file failed integrity verification.');
                        self::write($this->root,$entry['path'],$after);
                        if($this->checkpointHook!==null)($this->checkpointHook)('after_file_write');
                    }
                    $cursor++;$count++;$bytes+=$entry['after_bytes'];
                }
                $phase=$cursor===count($manifest['files'])?'migrations':'files';
                $this->pdo->beginTransaction();$this->authorize($actor);$this->exec('UPDATE agent_update_jobs SET phase=?,cursor=? WHERE operation_row_id=?',[$phase,$cursor,$row['id']]);$this->checkpoint($row,$phase);$this->pdo->commit();
                return $this->status($actor,$operationId);
            }catch(\Throwable $error){
                if($this->pdo->inTransaction())$this->pdo->rollBack();
                $this->exec("UPDATE agent_operations SET state='recovery_required',phase='recovery_required',lease_token=NULL,lease_expires_at=NULL,result_json=?,updated_at=? WHERE id=?",[json_encode(['provider_calls'=>0,'restoration'=>['restored'=>false,'required'=>true,'remaining_paths'=>['system_update']],'error'=>['code'=>$error instanceof Failure?$error->errorCode:'update_failed','message'=>$error instanceof Failure?$error->getMessage():'The update stopped. Inspect the retained recovery review.']],JSON_THROW_ON_ERROR),time(),$row['id']]);
                return $this->status($actor,$operationId);
            }
        }finally{flock($lock,LOCK_UN);fclose($lock);}
    }
    public function inspectRecovery(array $owner,string $operationRowId):array
    {
        $this->authorize($owner,true);$row=$this->ownerOperation($operationRowId);$lock=$this->lock($row['id']);
        try{$row=$this->ownerOperation($operationRowId);$job=$this->job($row);$manifest=$this->manifest($job);$paths=[];$eligible=!(bool)$job['schema_started'];
            if(!in_array($row['state'],['applying','recovery_required'],true))throw new Failure('content_conflict','Only an interrupted active update can be reviewed for recovery.');
            if($row['lease_expires_at']!==null&&(int)$row['lease_expires_at']>time())throw new Failure('site_busy','Wait for the active update worker before reviewing recovery.');
            $start=microtime(true);foreach($manifest['files'] as $entry){$hash=self::hash(self::bytes($this->root,$entry['path']));$state=$hash===$entry['before_hash']?'before':($hash===$entry['after_hash']?'after':'conflict');if($state==='conflict')$eligible=false;$paths[]=['path'=>$entry['path'],'state'=>$state,'current_hash'=>$hash];if(microtime(true)-$start>5)throw new Failure('host_capability_unavailable','Recovery verification exceeded the host time budget.');}
            $review=['recovery_id'=>$row['id'],'operation_id'=>$row['operation_id'],'original_actor'=>json_decode($row['actor_json'],true),'action'=>'restore_before','eligible'=>$eligible,'schema_started'=>(bool)$job['schema_started'],'paths'=>$paths,'expires_at'=>time()+900,'owner_id'=>(int)$owner['user_id'],'provider_calls'=>0];
            $digest=hash('sha256',self::canonical($review).$job['manifest_json']);$this->exec('UPDATE agent_update_jobs SET recovery_digest=?,recovery_expires_at=?,recovery_owner_id=? WHERE operation_row_id=?',[$digest,$review['expires_at'],$owner['user_id'],$row['id']]);return $review+['digest'=>$digest];
        }finally{flock($lock,LOCK_UN);fclose($lock);}
    }
    public function rollback(array $owner,string $operationRowId,string $digest,int $checkpoint):array
    {
        $this->authorize($owner,true);$row=$this->ownerOperation($operationRowId);$lock=$this->lock($row['id']);
        try{
            $row=$this->ownerOperation($operationRowId);$job=$this->job($row);$manifest=$this->manifest($job);
            if((int)$job['recovery_owner_id']!==(int)$owner['user_id']||!hash_equals($job['recovery_digest']??'',$digest))throw new Failure('content_conflict','Review the exact update recovery first.');
            if($row['state']==='failed_restored'){$this->clearGate($row['id']);return $this->present($row);}
            if(!in_array($row['state'],['applying','recovery_required'],true))throw new Failure('content_conflict','This update cannot be rolled back from its current state.');
            if((int)$job['recovery_expires_at']<time()||(int)$row['checkpoint_number']!==$checkpoint)throw new Failure('content_conflict','The recovery review or checkpoint expired.');
            if($job['schema_started'])throw new Failure('recovery_required','Schema execution began. Restore the database and system files together using the retained recovery records; file-only rollback is unavailable.');
            if($row['lease_expires_at']!==null&&(int)$row['lease_expires_at']>time())throw new Failure('site_busy','Wait for the active update worker before recovering.');
            $this->verifyStates($manifest,false);
            // Initial review binds exact current states; subsequent explicit recovery checkpoints bind the same originals.
            if($job['phase']!=='rollback'){
                $paths=[];foreach($manifest['files'] as $entry){$hash=self::hash(self::bytes($this->root,$entry['path']));$paths[]=['path'=>$entry['path'],'state'=>$hash===$entry['before_hash']?'before':($hash===$entry['after_hash']?'after':'conflict'),'current_hash'=>$hash];}
                $review=['recovery_id'=>$row['id'],'operation_id'=>$row['operation_id'],'original_actor'=>json_decode($row['actor_json'],true),'action'=>'restore_before','eligible'=>true,'schema_started'=>false,'paths'=>$paths,'expires_at'=>(int)$job['recovery_expires_at'],'owner_id'=>(int)$owner['user_id'],'provider_calls'=>0];
                if(!hash_equals($digest,hash('sha256',self::canonical($review).$job['manifest_json'])))throw new Failure('content_conflict','System bytes changed after recovery review.');
                $this->exec("UPDATE agent_update_jobs SET phase='rollback',cursor=0 WHERE operation_row_id=?",[$row['id']]);$job['cursor']=0;
            }
            $cursor=(int)$job['cursor'];$count=0;$bytes=0;$start=microtime(true);
            while($cursor<count($manifest['files'])&&$count<50&&$bytes<4194304&&microtime(true)-$start<4){
                $entry=$manifest['files'][$cursor];$current=self::bytes($this->root,$entry['path']);$this->assertState($entry,$current);
                if(self::hash($current)!==$entry['before_hash']){
                    $before=$entry['before_hash']===null?null:self::bytes($this->storage,$job['package_id'].'/before/'.$entry['path']);
                    if(self::hash($before)!==$entry['before_hash'])throw new Failure('recovery_required','A retained original failed verification.');
                    self::write($this->root,$entry['path'],$before);
                }$cursor++;$count++;$bytes+=$entry['before_bytes'];
            }
            $this->pdo->beginTransaction();$this->authorize($owner,true);$this->exec('UPDATE agent_update_jobs SET cursor=?,recovered_by=?,recovered_at=? WHERE operation_row_id=?',[$cursor,$owner['user_id'],time(),$row['id']]);
            if($cursor===count($manifest['files'])){
                $this->verifyStates($manifest,true);$result=['provider_calls'=>0,'restoration'=>['restored'=>true,'required'=>false,'remaining_paths'=>[]],'error'=>['code'=>'operation_restored','message'=>'The owner restored the exact original system files. The interrupted update will not resume.']];
                $this->finish($row,'failed_restored',$result,null);
            }else{$this->checkpoint($row,'owner_update_rollback');}
            $this->pdo->commit();if($cursor===count($manifest['files']))$this->clearGate($row['id']);return $this->present($this->ownerOperation($row['id']));
        }finally{if($this->pdo->inTransaction())$this->pdo->rollBack();flock($lock,LOCK_UN);fclose($lock);}
    }
    private function migrate(array $actor,array $row,array $job,array $manifest):array
    {return \VoxelSite\Agent\ProviderCallPolicy::runExternal(fn()=>$this->migrateStep($actor,$row,$job,$manifest));}
    private function migrateStep(array $actor,array $row,array $job,array $manifest):array
    {
        $this->verifyClosure($manifest);
        if((int)$job['migration_index']<count($manifest['migrations'])){
            // A fresh stable-bridge request is required; no mixed or already-loaded old Database class.
            if(class_exists('VoxelSite\\Database',false))throw new Failure('host_capability_unavailable','Continue schema activation through the independent update runtime.');
            $migration=$manifest['migrations'][(int)$job['migration_index']];
            if(self::hash(self::bytes($this->root,$migration['path']))!==$migration['sha256'])throw new Failure('recovery_required','The exact approved migration failed integrity verification.');
            $this->invalidateCodeCache($manifest);
            $this->exec('UPDATE agent_update_jobs SET schema_started=1 WHERE operation_row_id=?',[$row['id']]);
            define('VOXELSITE_UPDATE_RUNTIME_INTERNAL',true);
            require_once $this->root.'/_studio/engine/bootstrap.php';
            $db=\VoxelSite\Database::getInstance($this->database);$this->pdo=$db->getPdo();
            $definition=require self::path($this->root,$migration['path']);
            if(!is_array($definition)||($definition['version']??null)!==$migration['version']||!is_callable($definition['up']??null))throw new Failure('invalid_package','The approved migration definition is invalid.');
            $this->pdo->beginTransaction();($definition['up'])($db);
            $setting=$this->one("SELECT key FROM settings WHERE key='schema_version'");
            if($setting)$this->exec("UPDATE settings SET value=?,updated_at=? WHERE key='schema_version'",[json_encode($migration['version']),gmdate('Y-m-d\TH:i:s\Z')]);
            else $this->exec("INSERT INTO settings(key,value,updated_at) VALUES('schema_version',?,?)",[json_encode($migration['version']),gmdate('Y-m-d\TH:i:s\Z')]);
            $this->authorize($actor);$this->exec('UPDATE agent_update_jobs SET migration_index=migration_index+1 WHERE operation_row_id=?',[$row['id']]);$this->checkpoint($row,'migrations');$this->pdo->commit();if($this->checkpointHook!==null)($this->checkpointHook)('after_schema_commit');return $this->status($actor,$row['operation_id']);
        }
        $result=['operation_id'=>$row['operation_id'],'provider_calls'=>0,'from_version'=>$manifest['from_version'],'to_version'=>$manifest['to_version'],'files_updated'=>count($manifest['files']),'files_preserved'=>$manifest['preserved_files'],'migrations_run'=>count($manifest['migrations']),'package_sha256'=>$manifest['archive_hash'],'restoration'=>['restored'=>null,'required'=>false,'remaining_paths'=>[]],'reload_required'=>true];
        $this->pdo->beginTransaction();$this->authorize($actor);$this->exec("UPDATE agent_update_packages SET status='activated' WHERE id=?",[$job['package_id']]);$this->finish($row,'succeeded',$result,'system:'.$manifest['to_version']);$this->pdo->commit();$this->clearGate($row['id']);if(function_exists('opcache_reset'))opcache_reset();return $this->status($actor,$row['operation_id']);
    }
    private function operation(array $actor,string $id):array
    {if(!preg_match('/^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$/D',$id))throw new Failure('invalid_schema','Invalid operation identity.');$key=$actor['type'].':'.($actor['credential_id']??$actor['user_id']);$row=$this->one("SELECT * FROM agent_operations WHERE actor_key=? AND operation_id=? AND kind='update.apply'",[$key,$id]);if(!$row||(int)$row['user_id']!==(int)$actor['user_id'])throw new Failure('permission_denied','This update belongs to another connection.');return $row;}
    private function ownerOperation(string $id):array
    {if(!preg_match('/^op_[a-f0-9]{32}$/D',$id))throw new Failure('invalid_schema','Invalid recovery identity.');$row=$this->one("SELECT * FROM agent_operations WHERE id=? AND kind='update.apply'",[$id]);if(!$row)throw new Failure('not_found','The retained update is unavailable.');return $row;}
    private function job(array $row):array
    {$job=$this->one('SELECT * FROM agent_update_jobs WHERE operation_row_id=?',[$row['id']]);if(!$job)throw new Failure('recovery_required','The retained update manifest is missing.');$this->manifest($job);return $job;}
    private function manifest(array $job):array
    {
        $hash=hash('sha256',$job['manifest_json']);
        $review=$this->one('SELECT manifest_json,package_id FROM agent_update_reviews WHERE plan_id=?',[$job['plan_id']]);
        $plan=$this->one('SELECT operation_id,digest FROM agent_admin_plans WHERE id=?',[$job['plan_id']]);
        $operation=$this->one('SELECT operation_id,request_json FROM agent_operations WHERE id=?',[$job['operation_row_id']]);
        $request=$operation?json_decode($operation['request_json'],true):null;
        if(!hash_equals($job['manifest_sha256']??'',$hash)||!$review||!hash_equals($hash,hash('sha256',$review['manifest_json']))||$review['package_id']!==$job['package_id']
            ||!$plan||!$operation||$plan['operation_id']!==$operation['operation_id']||($request['plan_id']??null)!==$job['plan_id']||($request['digest']??null)!==$plan['digest'])
            throw new Failure('recovery_required','The retained update manifest no longer matches its exact approved operation.');
        $manifest=json_decode($job['manifest_json'],true,64,JSON_THROW_ON_ERROR);if(($manifest['root']??null)!==$this->root||($manifest['storage']??null)!==$this->storage||($manifest['database']??null)!==$this->database||($manifest['lock_path']??null)!==$this->lockPath)throw new Failure('permission_denied','The update belongs to a different installation.');return $manifest;
    }
    private function verifyClosure(array $manifest):void
    {
        $start=microtime(true);$closure=$manifest['closure']??null;
        if(!is_array($closure)||count($closure)>8000)throw new Failure('recovery_required','The approved dependency closure is invalid.');
        foreach(['_studio/engine','vendor'] as $relative){
            $directory=self::path($this->root,$relative);if(!is_dir($directory))continue;
            $iterator=new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($directory,\FilesystemIterator::SKIP_DOTS),\RecursiveIteratorIterator::SELF_FIRST);
            $seen=0;foreach($iterator as $file){
                if(++$seen>16000||$file->isLink())throw new Failure('recovery_required','The update dependency tree changed.');
                $pathname=self::nativePath($file->getPathname());$prefix=rtrim($this->root,'/').'/';
                if(!str_starts_with($pathname,$prefix)||(!$file->isDir()&&!isset($closure[substr($pathname,strlen($prefix))])))throw new Failure('recovery_required','An unreviewed executable dependency was preserved; schema activation is stopped.');
                if(microtime(true)-$start>5)throw new Failure('host_capability_unavailable','Dependency verification exceeded the host time budget.');
            }
        }
        $total=0;foreach($closure as $path=>$file){
            $bytes=self::bytes($this->root,$path);$total+=strlen($bytes??'');
            if($bytes===null||strlen($bytes)!==$file['bytes']||self::hash($bytes)!==$file['sha256'])throw new Failure('recovery_required','An approved system dependency failed integrity verification: '.$path);
            if($total>268435456||microtime(true)-$start>5)throw new Failure('host_capability_unavailable','Dependency verification exceeded the host budget.');
        }
    }
    private function invalidateCodeCache(array $manifest):void
    {
        $enabled=filter_var(ini_get('opcache.enable'),FILTER_VALIDATE_BOOLEAN)
            &&(PHP_SAPI!=='cli'||filter_var(ini_get('opcache.enable_cli'),FILTER_VALIDATE_BOOLEAN));
        if(!$enabled)return;
        if(!function_exists('opcache_get_status')||!function_exists('opcache_invalidate')||!function_exists('opcache_is_script_cached')
            ||!is_array(@opcache_get_status(false)))throw new Failure('host_capability_unavailable','This host cannot verify and invalidate cached PHP before exact schema execution.');
        foreach(array_keys($manifest['closure']) as $path){
            if(!preg_match('/\.(?:php|inc)$/iD',$path))continue;$absolute=self::path($this->root,$path);
            if(opcache_is_script_cached($absolute)&&!opcache_invalidate($absolute,true))throw new Failure('host_capability_unavailable','A cached PHP dependency could not be invalidated.');
        }
        clearstatcache();
    }
    private function assertState(array $entry,?string $current):void
    {if(!in_array(self::hash($current),[$entry['before_hash'],$entry['after_hash']],true))throw new Failure('recovery_required','Conflicting system bytes were preserved: '.$entry['path']);}
    private function verifyStates(array $manifest,bool $onlyBefore):void
    {$start=microtime(true);foreach($manifest['files'] as $entry){$bytes=self::bytes($this->root,$entry['path']);if($onlyBefore&&self::hash($bytes)!==$entry['before_hash'])throw new Failure('recovery_required','Original system verification failed.');$this->assertState($entry,$bytes);if(microtime(true)-$start>5)throw new Failure('host_capability_unavailable','System verification exceeded the host time budget.');}}
    private function lock(string $operationRowId)
    {$path=self::path(dirname($this->lockPath),basename($this->lockPath));$h=fopen($path,'c');if(!$h||!flock($h,LOCK_EX|LOCK_NB)){if($h)fclose($h);throw new Failure('site_busy','Another site operation is active.');}$reservation=$this->one('SELECT reservation_operation_id FROM site_workspace_state WHERE id=1');if(!$reservation||($reservation['reservation_operation_id']!==null&&$reservation['reservation_operation_id']!==$operationRowId)||$this->one("SELECT id FROM agent_business_changes WHERE status='prepared' LIMIT 1")){flock($h,LOCK_UN);fclose($h);throw new Failure('site_busy','Another retained operation reserves this installation.');}return $h;}
    private function activateGate(array $job,array $row):void
    {self::write($this->storage,'active.json',self::canonical(['operation_row_id'=>$row['id'],'package_id'=>$job['package_id'],'runtime_hash'=>$job['runtime_hash']]));}
    private function clearGate(string $id):void
    {$bytes=self::bytes($this->storage,'active.json');if($bytes!==null&&(json_decode($bytes,true)['operation_row_id']??null)===$id)unlink(self::path($this->storage,'active.json'));}
    private function checkpoint(array $row,string $phase):void
    {$this->exec('UPDATE agent_operations SET phase=?,checkpoint_number=checkpoint_number+1,checkpoint_json=?,lease_token=NULL,lease_expires_at=NULL,updated_at=? WHERE id=?',[$phase,json_encode(['runtime'=>'independent']),time(),$row['id']]);}
    private function finish(array $row,string $state,array $result,?string $after):void
    {$this->exec('UPDATE agent_operations SET state=?,phase=?,result_json=?,after_version=?,lease_token=NULL,lease_expires_at=NULL,updated_at=? WHERE id=?',[$state,$state,json_encode($result,JSON_THROW_ON_ERROR),$after,time(),$row['id']]);$this->exec('UPDATE site_workspace_state SET reservation_operation_id=NULL,updated_at=? WHERE id=1 AND reservation_operation_id=?',[time(),$row['id']]);}
    private function present(array $row):array
    {return ['operation_id'=>$row['operation_id'],'kind'=>'update.apply','status'=>$row['state'],'phase'=>$row['phase'],'checkpoint'=>(int)$row['checkpoint_number'],'before_version'=>$row['before_version'],'after_version'=>$row['after_version'],'result'=>$row['result_json']?json_decode($row['result_json'],true):null,'provider_calls'=>0,'result_retention_seconds'=>2592000,'result_pruned'=>$row['result_pruned_at']!==null,'next_action'=>$row['state']==='applying'?'operations_continue':($row['state']==='recovery_required'?'explicit_recovery':null)];}
    private function one(string $sql,array $params=[]):?array {$s=$this->pdo->prepare($sql);$s->execute($params);return $s->fetch()?:null;}
    private function exec(string $sql,array $params=[]):void {$s=$this->pdo->prepare($sql);$s->execute($params);}
    public static function canonical(mixed $value):string
    {$normalize=function($value)use(&$normalize){if(is_array($value)){if(!array_is_list($value))ksort($value,SORT_STRING);foreach($value as $k=>$v)$value[$k]=$normalize($v);}return $value;};return json_encode($normalize($value),JSON_THROW_ON_ERROR|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);}
    public static function hash(?string $bytes):?string {return $bytes===null?null:hash('sha256',$bytes);}
    private static function nativePath(string $path):string
    {return DIRECTORY_SEPARATOR==='\\'?str_replace('\\','/',$path):$path;}
    private static function assertAncestors(string $path):void
    {
        for($depth=0;$depth<256;$depth++){
            clearstatcache(true,$path);
            if(is_link($path))throw new Failure('invalid_path','System updates cannot follow symlinks.');
            $parent=self::nativePath(dirname($path));
            if($parent===$path||$path==='/'||$path==='.')return;
            $path=$parent;
        }
        throw new Failure('invalid_path','System path depth exceeds its boundary.');
    }
    public static function path(string $root,string $relative):string
    {
        $root=self::nativePath($root);self::assertAncestors($root);
        if(($real=realpath($root))===false||self::nativePath($real)!==$root||$relative===''||strlen($relative)>512||str_starts_with($relative,'/')||str_contains($relative,'\\')||str_contains($relative,':'))throw new Failure('invalid_path','Invalid system path.');
        $current=rtrim($root,'/');
        foreach(explode('/',$relative) as $part){
            if($part===''||$part==='.'||$part==='..'||preg_match('/[\x00-\x1f\x7f]/',$part)
                ||(DIRECTORY_SEPARATOR==='\\'&&(preg_match('/[. ]$/D',$part)||preg_match('/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iD',$part))))throw new Failure('invalid_path','Invalid system path component.');
            $current.='/'.$part;clearstatcache(true,$current);
            if(is_link($current))throw new Failure('invalid_path','System updates cannot follow symlinks.');
            if(file_exists($current)&&self::nativePath(realpath($current)?:'')!==$current)throw new Failure('invalid_path','System path resolution changed.');
        }
        return $current;
    }
    public static function bytes(string $root,string $path):?string
    {$absolute=self::path($root,$path);clearstatcache(true,$absolute);if(!file_exists($absolute))return null;$s=lstat($absolute);if(!$s||!is_file($absolute)||$s['size']>self::MAX_FILE)throw new Failure('size_limit','A system file exceeds the retained update budget.');$bytes=file_get_contents($absolute,false,null,0,$s['size']+1);clearstatcache(true,$absolute);$after=lstat($absolute);if($bytes===false||strlen($bytes)!==$s['size']||!$after||$after['ino']!==$s['ino']||$after['size']!==$s['size']||$after['mtime']!==$s['mtime']||is_link($absolute))throw new Failure('content_conflict','System bytes changed while being read.');return $bytes;}
    public static function write(string $root,string $path,?string $bytes):void
    {$absolute=self::path($root,$path);if($bytes===null){if(is_file($absolute)&&!unlink($absolute))throw new Failure('write_failed','Could not restore an absent system file.');return;}if(!is_dir(dirname($absolute))&&!mkdir(dirname($absolute),0755,true))throw new Failure('write_failed','Cannot create a system directory.');$tmp=tempnam(dirname($absolute),'.update-');if($tmp===false)throw new Failure('write_failed','Cannot stage a system file.');try{if(file_put_contents($tmp,$bytes)!==strlen($bytes)||!chmod($tmp,0644)||!rename($tmp,$absolute))throw new Failure('write_failed','Cannot activate a system file.');if(self::hash(self::bytes($root,$path))!==self::hash($bytes))throw new Failure('recovery_required','Activated system bytes failed verification.');}finally{if(is_file($tmp))unlink($tmp);}}
}
