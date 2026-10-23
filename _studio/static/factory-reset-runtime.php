<?php
declare(strict_types=1);

/** No application bootstrap, provider, mutable config or deleted database is required for completion. */
final class VoxelSiteFactoryResetFailure extends RuntimeException
{
    public function __construct(public readonly string $errorCode,string $message){parent::__construct($message);}
}
final class VoxelSiteFactoryResetRuntime
{
    public const MAX_FILES=1500, MAX_BYTES=134217728, MAX_FILE_BYTES=33554432;
    private string $root;
    public function __construct(private string $studio,private string $published,private int $budget=20,private ?Closure $hook=null)
    {
        if($budget<1||$budget>100)throw new InvalidArgumentException('Invalid cleanup budget.');
        foreach([$studio,$published] as $path)if(realpath($path)!==$path||is_link($path))self::fail('invalid_path','Canonical installation roots are required.');
        $this->root=self::path($studio,'data/factory-resets');
    }
    public static function fail(string $code,string $message):never {throw new VoxelSiteFactoryResetFailure($code,$message);}
    public static function path(string $root,string $relative):string
    {
        if($relative===''||str_contains($relative,"\0")||str_contains($relative,'\\')||str_starts_with($relative,'/')
            ||preg_match('~(?:^|/)\.{1,2}(?:/|$)~',$relative)||str_contains($relative,'//'))self::fail('invalid_path','Cleanup path is invalid.');
        $current=rtrim($root,'/');
        // Validate root ancestors as well as descendants; realpath alone would follow a symlink.
        $parts=explode('/',ltrim($current,'/'));$checked='';
        foreach($parts as $part){$checked.='/'.$part;if(is_link($checked))self::fail('invalid_path','Cleanup never follows symlinks.');}
        foreach(explode('/',$relative) as $part){
            $current.='/'.$part;clearstatcache(true,$current);
            if(is_link($current))self::fail('invalid_path','Cleanup never follows symlinks.');
        }
        return $current;
    }
    public static function readOptional(string $path):?string
    {
        clearstatcache(true,$path);$before=@lstat($path);
        if(!$before)return null;
        if(is_link($path)||!is_file($path)||$before['size']>self::MAX_FILE_BYTES)self::fail('invalid_path','Cleanup source is unsafe or exceeds 32 MiB.');
        $bytes=file_get_contents($path,false,null,0,$before['size']+1);
        clearstatcache(true,$path);$after=@lstat($path);
        if(!is_string($bytes)||strlen($bytes)!==$before['size']||!$after||is_link($path)
            ||$before['ino']!==$after['ino']||$before['size']!==$after['size']||$before['mtime']!==$after['mtime'])
            self::fail('content_conflict','A cleanup source changed while being read.');
        return $bytes;
    }
    public static function hashPath(string $path):?string {$bytes=self::readOptional($path);return $bytes===null?null:hash('sha256',$bytes);}
    public static function write(string $root,string $relative,string $bytes):void
    {
        $path=self::path($root,$relative);
        if(!is_dir(dirname($path))&&!mkdir(dirname($path),0700,true))self::fail('host_capability_unavailable','Cannot create private cleanup storage.');
        $temp=tempnam(dirname($path),'.factory-');
        if($temp===false)self::fail('host_capability_unavailable','Cannot stage cleanup bytes.');
        try{
            $h=fopen($temp,'wb');
            if(!$h)self::fail('host_capability_unavailable','Cannot open cleanup storage.');
            try{
                if(fwrite($h,$bytes)!==strlen($bytes)||!fflush($h)||(function_exists('fsync')&&!fsync($h)))self::fail('host_capability_unavailable','Cannot flush cleanup storage.');
            }finally{fclose($h);}
            if(!chmod($temp,0600)||!rename($temp,$path)||self::hashPath($path)!==hash('sha256',$bytes))self::fail('host_capability_unavailable','Cannot verify cleanup storage.');
        }finally{if(is_file($temp))unlink($temp);}
    }
    public static function paths(string $root,string $prefix,int &$entries):array
    {
        $path=self::path($root,$prefix);if(!file_exists($path))return [];
        if(!is_dir($path))self::fail('invalid_path','A managed cleanup directory changed type.');
        $out=[];
        $walk=function(string $relative,int $depth)use(&$walk,&$out,&$entries,$root):void{
            if($depth>12)self::fail('size_limit','Cleanup directory depth exceeds its budget.');
            foreach(new DirectoryIterator(self::path($root,$relative)) as $entry){
                if($entry->isDot())continue;
                if(++$entries>self::MAX_FILES*4)self::fail('size_limit','Cleanup inventory exceeds its entry budget.');
                $next=$relative.'/'.$entry->getFilename();$safe=self::path($root,$next);
                if(is_dir($safe))$walk($next,$depth+1);
                elseif(is_file($safe))$out[]=$next;
                else self::fail('invalid_path','Cleanup requires regular files.');
            }
        };
        $walk($prefix,0);sort($out,SORT_STRING);return $out;
    }
    public static function checkpoint(string $database):void
    {
        self::readOptional($database);$pdo=new PDO('sqlite:'.$database,null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
        $pdo->exec('PRAGMA busy_timeout=1000');
        $r=$pdo->query('PRAGMA wal_checkpoint(TRUNCATE)')->fetch(PDO::FETCH_NUM);
        if((int)($r[0]??1)!==0||strtolower((string)$pdo->query('PRAGMA journal_mode=DELETE')->fetchColumn())!=='delete')
            self::fail('site_busy','A database reader prevents safe installation cleanup.');
        $pdo=null;
        foreach(['-wal','-shm','-journal'] as $suffix)if(is_file($database.$suffix))
            self::fail('site_busy','A database sidecar prevents safe installation cleanup.');
    }
    public static function canonical(mixed $value):string
    {
        $sort=function(mixed $v)use(&$sort):mixed {
            if(!is_array($v))return $v;
            if(!array_is_list($v))ksort($v,SORT_STRING);
            foreach($v as &$item)$item=$sort($item);return $v;
        };
        return json_encode($sort($value),JSON_THROW_ON_ERROR|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
    }
    public static function tables(PDO $pdo):array
    {
        $tables=$pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);
        if(count($tables)>150)self::fail('size_limit','Installation has too many tables for qualified cleanup.');
        $out=[];$bytes=0;$rows=0;
        foreach($tables as $name){
            // This receipt is the only metadata changed by the factory workflow itself.
            if($name==='agent_factory_plans')continue;
            if(!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D',$name))self::fail('invalid_path','Unsupported database table name.');
            $columns=$pdo->query('PRAGMA table_info("'.$name.'")')->fetchAll(PDO::FETCH_ASSOC);
            $order=implode(',',array_map(fn($c)=>'"'.str_replace('"','""',$c['name']).'"',$columns));
            $query=$pdo->query('SELECT * FROM "'.$name.'" ORDER BY '.$order);$hash=hash_init('sha256');$count=0;
            $schema=$pdo->prepare('SELECT type,name,sql FROM sqlite_master WHERE tbl_name=? ORDER BY type,name');$schema->execute([$name]);
            hash_update($hash,self::canonical($schema->fetchAll(PDO::FETCH_ASSOC)));
            while($row=$query->fetch(PDO::FETCH_ASSOC)){
                if($name==='site_workspace_state')$row['reservation_operation_id']=null;
                $json=self::canonical($row);$bytes+=strlen($json);$count++;$rows++;
                if($bytes>self::MAX_BYTES||$rows>100000)self::fail('size_limit','Installation database exceeds its cleanup review budget.');
                hash_update($hash,strlen($json).':'.$json);
            }
            $out[$name]=['rows'=>$count,'sha256'=>hash_final($hash)];
        }
        return $out;
    }
    public function status(string $id,string $token):array
    {
        [$manifest,$state]=$this->load($id,$token);
        return $this->present($manifest,$state);
    }
    public function continue(string $id,string $token,int $checkpoint,bool $rollback=false):array
    {
        [$manifest,$state]=$this->load($id,$token);
        $lockPath=$manifest['lock_path'];
        if($lockPath!==self::path($this->studio,'data/site-mutation.lock'))self::fail('invalid_path','Cleanup lock does not belong to this installation.');
        $lock=fopen($lockPath,'c');
        if(!$lock||!flock($lock,LOCK_EX|LOCK_NB))self::fail('site_busy','Another installation request holds the cleanup lock.');
        try{
            [$manifest,$state]=$this->load($id,$token);
            if(in_array($state['phase'],['succeeded','failed_restored'],true)){
                $this->clearMarker($id);
                return $this->present($manifest,$state);
            }
            if($checkpoint!==$state['checkpoint'])return $this->present($manifest,$state);
            if($rollback){
                if($state['phase']==='purging')self::fail('content_conflict','Restoration has verified. Continue removing its retained recovery bytes.');
                if($state['irreversible'])self::fail('final_boundary_passed','The database removal boundary has passed. Only exact cleanup can continue.');
                $this->verifyFiles($manifest,$id,false,true);
                $state['phase']='rolling_back';$state['cursor']=0;$state['error']=null;
                $this->save($id,$state);
            }elseif($state['phase']==='recovery_required'){
                self::fail('recovery_required','Inspect the conflict and explicitly restore retained originals before restarting.');
            }
            $phase=$state['phase'];
            try{
                if(!$state['irreversible']&&$phase!=='purging')$this->assertAuthority($manifest,$id,$rollback);
                if($phase==='applying'||$phase==='rolling_back'){
                    $reverse=$phase==='rolling_back';$files=$reverse?array_reverse($manifest['files']):$manifest['files'];
                    $end=min(count($files),$state['cursor']+$this->budget);
                    for(;$state['cursor']<$end;$state['cursor']++){
                        $file=$files[$state['cursor']];$this->applyFile($manifest,$id,$file,$reverse);
                        if($this->hook)($this->hook)('after_file',$file);
                    }
                    if($state['cursor']===count($files)){
                        $this->verifyFiles($manifest,$id,$reverse);
                        if($reverse){
                            $this->releaseReservation($manifest,$id);$state['terminal']='failed_restored';$state['phase']='purging';$state['cursor']=0;
                        }else{$state['phase']='verifying';$state['cursor']=0;}
                    }
                }elseif($phase==='verifying'){
                    $this->verifyFiles($manifest,$id,false);
                    $this->verifyNoAdditions($manifest);
                    $db=self::path($this->studio,$manifest['database_relative']);
                    self::checkpoint($db);
                    $pdo=new PDO('sqlite:'.$db,null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
                    if(self::canonical(self::tables($pdo))!==self::canonical($manifest['tables']))self::fail('content_conflict','Database contents changed after the owner review.');
                    $pdo=null;
                    $databaseBytes=self::readOptional($db);
                    if($databaseBytes===null)self::fail('recovery_required','The installation database disappeared before finalization.');
                    self::write($this->root,$id.'/before/database',$databaseBytes);
                    if(self::hashPath(self::path($this->studio,'data/config.json'))!==$manifest['config_hash'])self::fail('content_conflict','Installation config changed after review.');
                    $state['database_hash']=hash('sha256',$databaseBytes);
                    $state['phase']='finalizing';$state['irreversible']=true;
                    // A retained receipt exists before the first irreversible deletion.
                    $state['checkpoint']++;$this->save($id,$state);
                    if($this->hook)($this->hook)('before_final_boundary',[]);
                    return $this->present($manifest,$state);
                }elseif($phase==='finalizing'){
                    foreach([[$manifest['database_relative'],$state['database_hash']],['data/config.json',$manifest['config_hash']]] as [$path,$expected]){
                        $absolute=self::path($this->studio,$path);$current=self::hashPath($absolute);
                        if($current!==null&&$current!==$expected)self::fail('content_conflict','An installation file changed at the removal boundary.');
                        if($current!==null&&!unlink($absolute))self::fail('host_capability_unavailable','Cannot remove the reviewed installation file.');
                        if($this->hook)($this->hook)('after_final_file',['path'=>$path]);
                    }
                    if(self::hashPath(self::path($this->studio,$manifest['database_relative']))!==null
                        ||self::hashPath(self::path($this->studio,'data/config.json'))!==null)self::fail('recovery_required','Installation removal has not verified.');
                    $state['phase']='purging';$state['terminal']='succeeded';$state['cursor']=0;
                }elseif($phase==='purging'){
                    $slots=[];
                    foreach($manifest['files'] as $file){if($file['before_hash']!==null)$slots[]='before/'.$file['slot'];if($file['after_hash']!==null)$slots[]='after/'.$file['slot'];}
                    $slots[]='before/config';$slots[]='before/database';
                    $end=min(count($slots),$state['cursor']+$this->budget);
                    for(;$state['cursor']<$end;$state['cursor']++){
                        $path=self::path($this->root,$id.'/'.$slots[$state['cursor']]);
                        if(file_exists($path)&&!unlink($path))self::fail('host_capability_unavailable','Cannot remove verified recovery originals.');
                    }
                    if($state['cursor']===count($slots)){
                        $state['phase']=$state['terminal'];$state['completed_at']=time();$state['expires_at']=time()+604800;
                        $state['checkpoint']++;$this->save($id,$state);
                        if($this->hook)($this->hook)('after_final_receipt',[]);
                        $this->clearMarker($id);
                        return $this->present($manifest,$state);
                    }
                }else self::fail('recovery_required','Unknown retained cleanup phase.');
                $state['checkpoint']++;$this->save($id,$state);
            }catch(Throwable $error){
                // Keep the finalization phase replayable: after the boundary, rollback would lie.
                if(!$state['irreversible']&&$phase!=='purging')$state['phase']='recovery_required';
                $state['error']=$error instanceof VoxelSiteFactoryResetFailure?$error->errorCode:'recovery_required';
                $state['checkpoint']++;$this->save($id,$state);
            }
            return $this->present($manifest,$state);
        }finally{flock($lock,LOCK_UN);fclose($lock);}
    }
    private function applyFile(array $manifest,string $id,array $file,bool $reverse):void
    {
        $target=self::path($manifest['roots'][$file['domain']],$file['path']);$current=self::hashPath($target);
        $expected=$reverse?$file['before_hash']:$file['after_hash'];
        if($current===$expected)return;
        if($current!==($reverse?$file['after_hash']:$file['before_hash']))self::fail('content_conflict','An affected file has unreviewed bytes.');
        if($expected===null){if($current!==null&&!unlink($target))self::fail('host_capability_unavailable','Cannot remove a reviewed file.');}
        else{
            $bytes=self::readOptional(self::path($this->root,$id.'/'.($reverse?'before/':'after/').$file['slot']));
            if($bytes===null||hash('sha256',$bytes)!==$expected)self::fail('recovery_required','Retained cleanup bytes failed verification.');
            self::write($manifest['roots'][$file['domain']],$file['path'],$bytes);
        }
        if(self::hashPath($target)!==$expected)self::fail('recovery_required','An affected file did not verify after cleanup.');
    }
    private function verifyFiles(array $manifest,string $id,bool $before,bool $either=false):void
    {
        foreach($manifest['files'] as $file){
            $hash=self::hashPath(self::path($manifest['roots'][$file['domain']],$file['path']));
            if($either?($hash!==$file['before_hash']&&$hash!==$file['after_hash']):($hash!==($before?$file['before_hash']:$file['after_hash'])))
                self::fail('content_conflict','An affected file has unreviewed bytes.');
            if($either&&$file['before_hash']!==null&&self::hashPath(self::path($this->root,$id.'/before/'.$file['slot']))!==$file['before_hash'])
                self::fail('recovery_required','A retained original is missing or changed.');
        }
    }
    private function verifyNoAdditions(array $manifest):void
    {
        $allowed=[];foreach($manifest['files'] as $file)if($file['after_hash']!==null)$allowed[$file['domain'].'/'.$file['path']]=true;
        $entries=0;
        foreach($manifest['scan_trees'] as $domain=>$trees)foreach($trees as $tree)
            foreach(self::paths($manifest['roots'][$domain],$tree,$entries) as $path){
                if(in_array(basename($path),['.htaccess','.gitkeep'],true))continue;
                if(!isset($allowed[$domain.'/'.$path]))self::fail('content_conflict','New managed data appeared after the installation review.');
            }
    }
    private function releaseReservation(array $manifest,string $id):void
    {
        $database=self::path($this->studio,$manifest['database_relative']);if(!is_file($database))self::fail('recovery_required','The original database is missing.');
        $pdo=new PDO('sqlite:'.$database,null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
        $pdo->beginTransaction();
        $q=$pdo->prepare('UPDATE site_workspace_state SET reservation_operation_id=NULL WHERE id=1 AND reservation_operation_id=?');$q->execute([$id]);
        $q=$pdo->prepare("UPDATE agent_factory_plans SET status='failed_restored' WHERE id=?");$q->execute([$id]);$pdo->commit();$pdo=null;
    }
    private function load(string $id,string $token):array
    {
        if(!preg_match('/^factory_[a-f0-9]{32}$/D',$id)||!preg_match('/^[a-f0-9]{64}$/D',$token))self::fail('permission_denied','A scoped Studio completion receipt is required.');
        $stateBytes=self::readOptional(self::path($this->root,$id.'/state.json'));
        if($stateBytes===null)self::fail('not_found','This completion receipt is unavailable.');
        $state=json_decode($stateBytes,true,32,JSON_THROW_ON_ERROR);
        if(!hash_equals($state['token_hash']??'',hash('sha256',$token)))self::fail('permission_denied','The completion receipt does not match.');
        if(($state['expires_at']??PHP_INT_MAX)<time())self::fail('receipt_expired','The final completion receipt expired.');
        $bytes=self::readOptional(self::path($this->root,$id.'/manifest.json'));
        if($bytes===null||!hash_equals($state['manifest_seal']??'',hash_hmac('sha256',$bytes,$token)))self::fail('recovery_required','The retained cleanup inventory failed verification.');
        $manifest=json_decode($bytes,true,64,JSON_THROW_ON_ERROR);
        if($manifest['id']!==$id||self::canonical($manifest['roots'])!==self::canonical(['studio'=>$this->studio,'published'=>$this->published])
            ||count($manifest['files'])>self::MAX_FILES)self::fail('invalid_path','The cleanup inventory belongs to another installation.');
        if(!in_array($state['phase'],['succeeded','failed_restored'],true)){
            $active=self::readOptional(self::path($this->root,'active.json'));
            if($active===null||self::canonical(json_decode($active,true,8,JSON_THROW_ON_ERROR))!==self::canonical(['id'=>$id,'digest'=>hash('sha256',$bytes)]))
                self::fail('recovery_required','The active cleanup marker does not match the retained receipt.');
        }
        return [$manifest,$state];
    }
    private function save(string $id,array $state):void {self::write($this->root,$id.'/state.json',self::canonical($state));}
    private function assertAuthority(array $manifest,string $id,bool $rollback):void
    {
        $database=self::path($this->studio,$manifest['database_relative']);
        if(!is_file($database))self::fail('recovery_required','The installation database disappeared before the final boundary.');
        $pdo=new PDO('sqlite:'.$database,null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
        $q=$pdo->prepare('SELECT role,disabled_at FROM users WHERE id=?');$q->execute([$manifest['approved_by']]);$owner=$q->fetch(PDO::FETCH_ASSOC);
        if(!$owner||$owner['role']!=='owner'||$owner['disabled_at']!==null)self::fail('permission_denied','The approving owner no longer has authority.');
        $reserved=$pdo->query('SELECT reservation_operation_id FROM site_workspace_state WHERE id=1')->fetchColumn();
        if($reserved!==$id&&!($rollback&&($reserved===null||$reserved===false)))self::fail('recovery_required','Cleanup activation did not commit. Restore the retained originals.');
        $pdo=null;
    }
    private function clearMarker(string $id):void
    {
        $path=self::path($this->root,'active.json');$bytes=self::readOptional($path);
        if($bytes!==null&&json_decode($bytes,true,8,JSON_THROW_ON_ERROR)['id']===$id&&!unlink($path))self::fail('recovery_required','Completion is verified but the maintenance marker could not be removed.');
    }
    private function present(array $manifest,array $state):array
    {
        return ['plan_id'=>$manifest['id'],'operation_id'=>$manifest['operation_id'],'status'=>$state['phase'],
            'checkpoint'=>$state['checkpoint'],'files_total'=>count($manifest['files']),'files_processed'=>min(count($manifest['files']),$state['cursor']),
            'irreversible'=>$state['irreversible'],'can_restore'=>!$state['irreversible']&&!in_array($state['phase'],['purging','failed_restored'],true),
            'maintenance_active'=>is_file(self::path($this->root,'active.json')),
            'error_code'=>$state['error'],'expires_at'=>$state['expires_at']??null,'provider_calls'=>0,
            'message'=>match($state['phase']){
                'succeeded'=>'Installation files and retained originals were removed and verified. The installer is available.',
                'failed_restored'=>'Original website files were restored. The installation remains configured.',
                'recovery_required'=>'Cleanup stopped at a conflict. Original bytes are retained; no success is assumed.',
                'finalizing','purging'=>'The final removal boundary has passed. Continue the exact retained cleanup.',
                default=>'Installation cleanup is in maintenance. Continue or restore before the final boundary.',
            }];
    }
}
