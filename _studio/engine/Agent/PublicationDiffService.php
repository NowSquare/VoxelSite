<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,SiteMutationLock,SiteWorkspace};

/** Pure source/publication comparison; a status poll never allocates a publish review. */
final class PublicationDiffService
{
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,private PublishPlanService $publish) {}
    public static function inputSchema():array
    {return ToolContracts::object(['offset'=>ToolContracts::integer(1201),'limit'=>['type'=>'integer','minimum'=>1,'maximum'=>100],'version'=>ToolContracts::hash()],[]);}
    public static function outputSchema():array
    {
        $c=ToolContracts::class;
        return $c::object(['version'=>$c::hash(),'draft_version'=>$c::version(),'release_id'=>$c::nullable($c::text(128)),
            'comparison'=>['enum'=>['source_to_release','draft_to_live','unpublished']],
            'changes'=>$c::list($c::object(['path'=>$c::text(600),'type'=>['enum'=>['added','modified','deleted']],
                'reason'=>['enum'=>['source_changed','live_drift','publication_settings_changed']],
                'preview_size'=>$c::integer(WorkspaceFiles::MAX_BYTES),'production_size'=>$c::integer(PublishPlanService::MAX_BYTES),
                'draft_hash'=>$c::nullable($c::hash()),'baseline_hash'=>$c::nullable($c::hash()),'live_hash'=>$c::nullable($c::hash())]),100),
            'counts'=>$c::object(['added'=>$c::integer(1201),'modified'=>$c::integer(1201),'deleted'=>$c::integer(1201)]),
            'total'=>$c::integer(1201),'next_offset'=>$c::nullable($c::integer(1201)),'has_changes'=>['type'=>'boolean'],
            'message'=>$c::text(300),'provider_calls'=>['const'=>0]]);
    }
    public function read(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema());
        $this->policy->require($actor,['site:read','files:read','assets:read','forms:read']);
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);
        $this->workspace->assertReady();$state=$this->workspace->status();
        $source=WorkspaceFiles::read($this->workspace);$hashes=WorkspaceFiles::hashes($source);
        $sizes=array_map('strlen',$source);unset($source);
        try{$managed=$this->publish->publishedManifest();}catch(OperationException $error){
            if($error->errorCode!=='not_published')throw $error;$managed=[];
        }
        $live=$this->live($managed);$baseline=$live['hashes'];$comparison=$managed===[]?'unpublished':'draft_to_live';$manifest=null;
        if($state['release_id']!==null){
            $row=$this->db->queryOne('SELECT substr(p.manifest_json,1,1048577) AS manifest_json,p.digest FROM site_releases r JOIN agent_publish_plans p ON p.id=r.plan_id WHERE r.id=?',[$state['release_id']]);
            if($row){
                if(strlen($row['manifest_json'])>1048576)throw new OperationException('size_limit','The publication source manifest exceeds its read limit.');
                try{$manifest=json_decode($row['manifest_json'],true,64,JSON_THROW_ON_ERROR);}catch(\JsonException){throw new OperationException('content_conflict','The retained publication source is invalid.');}
                if(!is_array($manifest)||!hash_equals($row['digest'],CanonicalJson::digest($manifest))||
                    ($manifest['after']??null)!==$managed || !is_array($manifest['source_hashes']??null) || count($manifest['source_hashes'])>WorkspaceFiles::MAX_FILES)
                    throw new OperationException('content_conflict','The retained publication source failed verification.');
                $baseline=$manifest['source_hashes'];$comparison='source_to_release';
                foreach($baseline as $path=>$hash){SitePathPolicy::canonical($path);JsonSchema::validate($hash,ToolContracts::hash());}
            }
        }
        $configuration=$this->publish->currentConfigurationDigest();$changes=[];
        foreach(array_unique(array_merge(array_keys($baseline),array_keys($hashes))) as $path){
            if(($baseline[$path]??null)===($hashes[$path]??null))continue;
            $changes[$path]=['path'=>$path,'type'=>!isset($baseline[$path])?'added':(!isset($hashes[$path])?'deleted':'modified'),
                'reason'=>'source_changed','preview_size'=>$sizes[$path]??0,'production_size'=>$live['sizes'][$path]??0,
                'draft_hash'=>$hashes[$path]??null,'baseline_hash'=>$baseline[$path]??null,'live_hash'=>$live['hashes'][$path]??null];
        }
        if($manifest!==null){
            foreach($managed as $path=>$expected){
                if(($live['hashes'][$path]??null)===$expected)continue;
                $changes[$path]??=['path'=>$path,'type'=>'modified','reason'=>'live_drift',
                    'preview_size'=>$sizes[$path]??0,'production_size'=>$live['sizes'][$path]??0,
                    'draft_hash'=>$hashes[$path]??null,'baseline_hash'=>$expected,'live_hash'=>$live['hashes'][$path]??null];
            }
            if($configuration!==($manifest['configuration_digest']??null))
                $changes['publication-settings']=['path'=>'publication-settings','type'=>'modified','reason'=>'publication_settings_changed',
                    'preview_size'=>0,'production_size'=>0,'draft_hash'=>null,'baseline_hash'=>null,'live_hash'=>null];
        }
        ksort($changes,SORT_STRING);$version=CanonicalJson::digest([$state['draft_version'],$state['release_id'],$hashes,$baseline,$live['hashes'],$configuration]);
        if(isset($input->version)&&!hash_equals($version,$input->version))throw new OperationException('content_conflict','The publication comparison changed. Restart from the first page.');
        $offset=$input->offset??0;$limit=$input->limit??50;$total=count($changes);
        if($offset>0&&!isset($input->version))throw new OperationException('content_conflict','Diff continuation requires its original inventory version.');
        if($offset>$total)throw new OperationException('invalid_schema','The diff offset is beyond this comparison.');
        $counts=['added'=>0,'modified'=>0,'deleted'=>0];foreach($changes as $change)$counts[$change['type']]++;
        return ['version'=>$version,'draft_version'=>'draft:'.$state['draft_version'],'release_id'=>$state['release_id'],'comparison'=>$comparison,
            'changes'=>array_values(array_slice($changes,$offset,$limit)),'counts'=>$counts,'total'=>$total,
            'next_offset'=>$offset+$limit<$total?$offset+$limit:null,'has_changes'=>$total>0,
            'message'=>$total===0?'No pending publish changes.':$total.' pending publish change(s).','provider_calls'=>0];
    }
    private function live(array $managed):array
    {
        if(count($managed)>PublishPlanService::MAX_FILES)throw new OperationException('size_limit','The managed publication exceeds 700 files.');
        $hashes=[];$sizes=[];$total=0;$start=microtime(true);
        foreach($managed as $path=>$expected){
            PublishPlanService::destination($path);$full=$this->workspace->resolvePublished($path,true);clearstatcache(true,$full);
            if(!file_exists($full)){$hashes[$path]=null;$sizes[$path]=0;continue;}
            $before=lstat($full);
            if(!$before||is_link($full)||!is_file($full)||($total+=$before['size'])>PublishPlanService::MAX_BYTES)
                throw new OperationException('size_limit','Managed live files exceed the 40 MiB comparison budget.');
            $hash=hash_file('sha256',$full);$verify=hash_file('sha256',$full);clearstatcache(true,$full);$after=lstat($full);
            if(!is_string($hash)||$hash!==$verify||!$after||is_link($full)||$before['ino']!==$after['ino']||$before['size']!==$after['size']||$before['mtime']!==$after['mtime'])
                throw new OperationException('content_conflict','A live file changed during comparison.');
            $hashes[$path]=$hash;$sizes[$path]=$before['size'];
            if(microtime(true)-$start>4)throw new OperationException('host_capability_unavailable','The live comparison exceeds this host read budget.');
        }
        return ['hashes'=>$hashes,'sizes'=>$sizes];
    }
}
