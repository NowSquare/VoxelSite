<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,Settings,ShippedSiteProvenance,SiteMutationLock,SiteWorkspace};

/** Trusted reset preparation. Never guesses ownership from a root filename extension. */
final class ResetInventory
{
    public const MAX_FILES=1500;
    public const MAX_BYTES=33554432;
    public const MAX_FILE_BYTES=8388608;
    public const TABLES=['messages','pages','conversations','revisions','snapshots','collections'];
    private array $roots;
    public function __construct(private Database $db,private SiteWorkspace $workspace,private PublishPlanService $publish,
        private string $studioRoot,private string $defaultIndex)
    {
        $this->roots=['draft'=>$workspace->draftRoot(),'published'=>$workspace->publishedRoot(),
            'actions'=>getenv('VS_TEST_ACTIONS_DIR')?:$studioRoot.'/data/actions',
            'revisions'=>getenv('VS_TEST_REVISIONS_DIR')?:$studioRoot.'/revisions',
            'snapshots'=>$studioRoot.'/data/snapshots','collections'=>$studioRoot.'/data/collections',
            'business'=>$workspace->publishedRoot().'/_data','metadata'=>$studioRoot.'/data'];
        foreach($this->roots as $root)SiteWorkspace::resolveWithin($root,'.reset-path-check');
    }
    public function roots():array {return $this->roots;}
    public function target(string $domain,string $path):string
    {
        if(!isset($this->roots[$domain]))throw new OperationException('invalid_path','Unknown reset domain.');
        if($domain==='draft')return $this->workspace->resolveDraft($path,true);
        if($domain==='published')return $this->workspace->resolvePublished($path,true);
        return SiteWorkspace::resolveWithin($this->roots[$domain],$path);
    }
    public function tables():array
    {
        $result=[];
        foreach(self::TABLES as $table){
            if(!$this->db->scalar("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?",[$table]))continue;
            $count=$this->db->count($table);
            if($count>10000)throw new OperationException('size_limit','Reset table exceeds the qualified row budget.',['table'=>$table]);
            // Stream each row into a digest so a long conversation cannot force a full-table allocation.
            $query=$this->db->getPdo()->query('SELECT * FROM '.$table.' ORDER BY rowid');
            $hash=hash_init('sha256');$bytes=0;
            while($row=$query->fetch(\PDO::FETCH_ASSOC)){
                $json=CanonicalJson::encode($row);$bytes+=strlen($json);
                if($bytes>self::MAX_BYTES)throw new OperationException('size_limit','Reset table exceeds its data budget.',['table'=>$table]);
                hash_update($hash,strlen($json).':'.$json);
            }
            $result[$table]=['rows'=>$count,'sha256'=>hash_final($hash)];
        }
        return $result;
    }
    /** Caller holds the common lock. Staging is private and completes before approval can be used. */
    public function capture(string $stage):array
    {
        if(!SiteMutationLock::held($this->workspace->mutationLockPath()))throw new \LogicException('Reset inventory requires the common website lock.');
        $this->workspace->assertReady();
        SiteWorkspace::resolveWithin($stage,'before');
        $files=[];$retainedBytes=0;$managed=[];$inventories=$this->inventories();
        $append=function(string $domain,string $path,?string $after=null,bool $replace=false)use(&$files,&$retainedBytes,$stage):void{
            $target=$this->target($domain,$path);
            clearstatcache(true,$target);
            $exists=is_file($target);
            if(!$exists && file_exists($target))throw new OperationException('invalid_path','Reset affects regular files only.',['path'=>$path]);
            if(!$exists && !$replace)return;
            if(count($files)>=self::MAX_FILES)throw new OperationException('size_limit','Reset inventory exceeds 1,500 files.');
            $bytes=$exists?(int)filesize($target):0;
            if(($retainedBytes+=$bytes+strlen($after??''))>self::MAX_BYTES)
                throw new OperationException('size_limit','Reset recovery exceeds 32 MiB. Preserve and reduce history before preparing.');
            $before=$exists?$this->read($target,self::MAX_FILE_BYTES):null;
            $slot=(string)count($files);
            if($before!==null)WorkspaceFiles::write($stage,'before/'.$slot,$before);
            if($replace && $after!==null)WorkspaceFiles::write($stage,'after/'.$slot,$after);
            $files[]=['domain'=>$domain,'path'=>$path,'effect'=>$replace?'replace':'delete','slot'=>$slot,
                'before_hash'=>$before===null?null:hash('sha256',$before),
                'after_hash'=>$replace && $after!==null?hash('sha256',$after):null,'before_bytes'=>$bytes,'after_bytes'=>$replace?strlen($after??''):0];
        };
        foreach($inventories['draft'] as $path)$append('draft',$path);
        try{$managed=$this->publish->publishedManifest();}
        catch(OperationException $error){
            if($error->errorCode!=='not_published')throw $error;
            $managed=ShippedSiteProvenance::verified($this->db,$this->workspace);
        }
        $liveAfter=[];
        foreach($managed as $path=>$expected){
            if($this->preservedAsset($path) || $path==='submit.php'){
                $target=$this->target('published',$path);
                if(is_file($target))$liveAfter[$path]=hash('sha256',$this->read($target,self::MAX_BYTES));
                continue;
            }
            if($path==='index.php')continue;
            $append('published',$path);
        }
        $index=$this->target('published','index.php');
        if(is_file($index) && !array_key_exists('index.php',$managed))
            throw new OperationException('ownership_conflict','The live index has no managed publication ownership. Establish ownership before resetting.');
        $landing=$this->read($this->defaultIndex,1048576);
        $append('published','index.php',$landing,true);$liveAfter['index.php']=hash('sha256',$landing);
        foreach(['actions','revisions','snapshots','collections'] as $domain)
            foreach($inventories[$domain] as $path)$append($domain,$path);
        foreach(['published-manifest.json'] as $path)$append('metadata',$path);
        // SQLite is checkpointed under the same lock as public form/Action writers.
        // Candidate databases retain retry/delivery receipts, preventing old requests from becoming new sends.
        foreach(['submissions.db'=>'submissions','actions.db'=>'action_records'] as $path=>$table){
            $target=$this->target('business',$path);if(!is_file($target))continue;
            if(filesize($target)>self::MAX_BYTES-$retainedBytes)throw new OperationException('size_limit','Business database exceeds reset staging budget.');
            $pdo=new \PDO('sqlite:'.$target);$pdo->setAttribute(\PDO::ATTR_ERRMODE,\PDO::ERRMODE_EXCEPTION);
            $checkpoint=$pdo->query('PRAGMA wal_checkpoint(TRUNCATE)')->fetch(\PDO::FETCH_NUM);
            if((int)($checkpoint[0]??1)!==0)throw new OperationException('site_busy','Business database is busy. Retry reset preparation after readers finish.');
            // Reset installs a standalone SQLite image. Refuse a concurrent
            // reader that prevents leaving WAL mode; never replace a live WAL database.
            if(strtolower((string)$pdo->query('PRAGMA journal_mode=DELETE')->fetchColumn())!=='delete')
                throw new OperationException('site_busy','Business database cannot leave WAL mode for reviewed reset.');
            $pdo=null;
            $bytes=$this->read($target,self::MAX_FILE_BYTES);
            $candidate=SiteWorkspace::resolveWithin($stage,'candidate-'.$path);
            WorkspaceFiles::write($stage,'candidate-'.$path,$bytes);
            $copy=new \PDO('sqlite:'.$candidate);$copy->setAttribute(\PDO::ATTR_ERRMODE,\PDO::ERRMODE_EXCEPTION);
            $copy->exec('PRAGMA journal_mode=DELETE');
            $exists=$copy->prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?");$exists->execute([$table]);
            if($exists->fetchColumn())$copy->exec('DELETE FROM '.$table);
            $exists=$copy->query("SELECT 1 FROM sqlite_master WHERE type='table' AND name='agent_business_deliveries'");
            if($exists->fetchColumn())$copy->exec("UPDATE agent_business_deliveries SET state='failed',completed_at=".time()." WHERE state='pending'");
            $exists=null;$copy=null;
            $after=$this->read($candidate,self::MAX_FILE_BYTES);
            $append('business',$path,$after,true);
            if(!unlink($candidate))throw new OperationException('host_capability_unavailable','Cannot clear temporary reset candidate.');
        }
        ksort($liveAfter);
        return ['format'=>1,'site_key'=>CanonicalJson::digest($this->roots),
            'draft_version'=>$this->workspace->status()['draft_version'],'release_id'=>$this->workspace->status()['release_id'],
            'files'=>$files,'inventories'=>$inventories,'tables'=>$this->tables(),'live_after'=>$liveAfter,'staged_bytes'=>$retainedBytes,
            'preserved'=>['User accounts, sessions and credentials','Settings and provider usage accounting','Private notes and shared board',
                'Uploaded images, files and fonts','Collection schemas','Shipped library, icons and runtime handlers',
                'Unrelated hosting files','Retained operation and recovery archives','Business retry and delivery receipts']];
    }
    /** Detect additions as well as changes to the reviewed files. */
    public function inventories():array
    {
        $result=[];
        foreach(['draft','actions','revisions','snapshots','collections'] as $domain){
            $result[$domain]=array_values(array_filter($this->paths($this->roots[$domain]),function($path)use($domain):bool{
                if(in_array(basename($path),['.htaccess','.gitkeep'],true))return false;
                if($domain==='draft' && $this->preservedAsset($path))return false;
                return !($domain==='collections' && str_starts_with($path,'_schema/'));
            }));
        }
        $result['business']=[];
        foreach(['actions.db','submissions.db'] as $path)if(is_file($this->target('business',$path)))$result['business'][]=$path;
        return $result;
    }
    private function preservedAsset(string $path):bool
    {
        foreach(['assets/images/','assets/files/','assets/fonts/','assets/library/','assets/icons/'] as $prefix)
            if(str_starts_with($path,$prefix))return true;
        return in_array($path,['assets/js/form-handler.js','assets/js/actions-bar.js','assets/js/navigation.js','assets/js/icon-resolver.js'],true);
    }
    private function paths(string $root):array
    {
        if(!is_dir($root))return [];
        $paths=[];$entries=0;
        $walk=function(string $directory,string $prefix='')use(&$walk,&$paths,&$entries,$root):void{
            foreach(new \DirectoryIterator($directory) as $item){
                if($item->isDot())continue;
                if(++$entries>self::MAX_FILES*3 || substr_count($prefix,'/')>12)throw new OperationException('size_limit','Reset directory inventory exceeds its budget.');
                $relative=$prefix.$item->getFilename();$safe=SiteWorkspace::resolveWithin($root,$relative);
                if(is_link($safe))throw new OperationException('invalid_path','Reset refuses symlinked storage.');
                if(is_dir($safe))$walk($safe,$relative.'/');
                elseif(is_file($safe))$paths[]=$relative;
                else throw new OperationException('invalid_path','Reset refuses non-regular storage.');
            }
        };
        $walk($root);sort($paths,SORT_STRING);return $paths;
    }
    private function read(string $path,int $limit):string
    {
        clearstatcache(true,$path);
        if(is_link($path) || !is_file($path) || ($stat=lstat($path))===false || $stat['size']>$limit)
            throw new OperationException('host_capability_unavailable','Reset source is unsafe or exceeds its staging budget.');
        $bytes=file_get_contents($path,false,null,0,$stat['size']+1);clearstatcache(true,$path);$after=lstat($path);
        if(!is_string($bytes)||strlen($bytes)!==$stat['size']||!$after||is_link($path)||$after['ino']!==$stat['ino']||$after['size']!==$stat['size']||$after['mtime']!==$stat['mtime'])
            throw new OperationException('content_conflict','Reset source changed during preparation.');
        return $bytes;
    }
}
