<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,ShippedSiteProvenance,SiteMutationLock,SiteWorkspace};

/** Installation ownership is explicit; extensions never establish public ownership. */
final class FactoryResetInventory
{
    public const MAX_FILES=1500;
    public const MAX_BYTES=134217728;
    public const MAX_FILE_BYTES=33554432;
    public const PRIVATE_TREES=['preview','revisions','snapshots','backups','logs','custom_prompts',
        'data/actions','data/collections','data/designs','data/snapshots','data/backups','data/agent','data/workspace','data/workspace-migration','data/updates'];
    public const PRIVATE_FILES=['data/assets-meta.json','data/mail.log','data/published-manifest.json'];
    public function __construct(private Database $db,private SiteWorkspace $workspace,private PublishPlanService $publish)
    { require_once dirname(__DIR__,2).'/static/factory-reset-runtime.php'; }
    public function roots():array
    {return ['studio'=>dirname($this->workspace->draftRoot()),'published'=>$this->workspace->publishedRoot()];}
    public function databasePath():string
    {
        $rows=$this->db->query('PRAGMA database_list');
        foreach($rows as $row)if($row['name']==='main') {
            $file=$row['file'];$expected=$this->roots()['studio'].'/data/';
            if(!str_starts_with($file,$expected)||str_contains(substr($file,strlen($expected)),'/'))
                throw new OperationException('host_capability_unavailable','The Studio database must be inside its private data directory.');
            return $file;
        }
        throw new OperationException('host_capability_unavailable','A file-backed Studio database is required.');
    }
    public function paths():array
    {
        $roots=$this->roots();$out=[];$entries=0;
        foreach(self::PRIVATE_TREES as $tree)
            foreach(\VoxelSiteFactoryResetRuntime::paths($roots['studio'],$tree,$entries) as $path)
                if(!in_array(basename($path),['.htaccess','.gitkeep'],true))$out['studio/'.$path]=['domain'=>'studio','path'=>$path];
        foreach(self::PRIVATE_FILES as $path)
            if(\VoxelSiteFactoryResetRuntime::hashPath(\VoxelSiteFactoryResetRuntime::path($roots['studio'],$path))!==null)
                $out['studio/'.$path]=['domain'=>'studio','path'=>$path];
        try{$managed=$this->publish->publishedManifest();}
        catch(OperationException $error){
            if($error->errorCode!=='not_published')throw $error;
            $managed=ShippedSiteProvenance::verified($this->db,$this->workspace);
        }
        foreach($managed as $path=>$hash){
            if($this->preservedPublic($path))continue;
            $out['published/'.$path]=['domain'=>'published','path'=>$path];
        }
        // These directories are the documented user-upload domains, not arbitrary root assets.
        foreach(['assets/images','assets/files','assets/fonts'] as $tree)
            foreach(\VoxelSiteFactoryResetRuntime::paths($roots['published'],$tree,$entries) as $path)
                if(!in_array(basename($path),['.htaccess','.gitkeep'],true))$out['published/'.$path]=['domain'=>'published','path'=>$path];
        foreach(['_data/submissions.db','_data/actions.db'] as $path){
            $absolute=\VoxelSiteFactoryResetRuntime::path($roots['published'],$path);
            if(is_file($absolute)){
                \VoxelSiteFactoryResetRuntime::checkpoint($absolute);
                $out['published/'.$path]=['domain'=>'published','path'=>$path];
            }
        }
        $index=\VoxelSiteFactoryResetRuntime::path($roots['published'],'index.php');
        if(is_file($index)&&!array_key_exists('index.php',$managed))
            throw new OperationException('ownership_conflict','The public homepage has no verified publication ownership.');
        $out['published/index.php']=['domain'=>'published','path'=>'index.php'];
        ksort($out,SORT_STRING);
        if(count($out)>self::MAX_FILES)throw new OperationException('size_limit','Installation cleanup exceeds 1,500 files.');
        return array_values($out);
    }
    public function capture(string $stage):array
    {
        if(!SiteMutationLock::held($this->workspace->mutationLockPath()))throw new \LogicException('A common lock is required.');
        // Reserve the independently captured final database image before staging any other originals.
        $this->workspace->assertReady();$roots=$this->roots();$files=[];$size=self::MAX_FILE_BYTES+2097152;
        foreach($this->paths() as $item){
            $absolute=\VoxelSiteFactoryResetRuntime::path($roots[$item['domain']],$item['path']);
            $before=\VoxelSiteFactoryResetRuntime::readOptional($absolute);
            $after=$item['domain']==='published'&&$item['path']==='index.php'
                ?\VoxelSiteFactoryResetRuntime::readOptional(\VoxelSiteFactoryResetRuntime::path($roots['studio'],'data/default-index.php')):null;
            if($item['domain']==='published'&&$item['path']==='index.php'&&$after===null)
                throw new OperationException('host_capability_unavailable','The shipped landing page is missing.');
            $slot=(string)count($files);$size+=strlen($before??'')+strlen($after??'');
            if($size>self::MAX_BYTES)throw new OperationException('size_limit','Installation recovery exceeds 128 MiB.');
            if($before!==null)WorkspaceFiles::write($stage,'before/'.$slot,$before);
            if($after!==null)WorkspaceFiles::write($stage,'after/'.$slot,$after);
            $files[]=$item+['slot'=>$slot,'effect'=>$after===null?'delete':'replace','before_hash'=>$before===null?null:hash('sha256',$before),
                'after_hash'=>$after===null?null:hash('sha256',$after),'before_bytes'=>strlen($before??''),'after_bytes'=>strlen($after??'')];
        }
        $config=\VoxelSiteFactoryResetRuntime::readOptional(\VoxelSiteFactoryResetRuntime::path($roots['studio'],'data/config.json'));
        if($config===null)throw new OperationException('feature_disabled','Finish installation before preparing removal.');
        if($size+strlen($config)>self::MAX_BYTES)throw new OperationException('size_limit','Installation recovery exceeds 128 MiB.');
        WorkspaceFiles::write($stage,'before/config',$config);
        return ['format'=>1,'roots'=>$roots,'lock_path'=>$this->workspace->mutationLockPath(),
            'database_path'=>$this->databasePath(),'files'=>$files,
            'tables'=>\VoxelSiteFactoryResetRuntime::tables($this->db->getPdo()),
            'config_hash'=>hash('sha256',$config),'config_bytes'=>strlen($config),
            'draft_version'=>$this->workspace->status()['draft_version'],'staged_bytes'=>$size+strlen($config),
            'preserved'=>['Shipped Studio, vendor code, prompts and runtime handlers','Shipped image library and icons',
                'Collection schema directory markers (there are no shipped user collection schemas)',
                'Unrelated hosting files outside the reviewed deletion set',
                'This reset’s originals until verification; then private completion metadata with seven-day status access']];
    }
    private function preservedPublic(string $path):bool
    {
        return $path==='submit.php'||str_starts_with($path,'assets/library/')||str_starts_with($path,'assets/icons/')
            ||in_array($path,['assets/js/form-handler.js','assets/js/actions-bar.js','assets/js/navigation.js','assets/js/icon-resolver.js'],true);
    }
}
