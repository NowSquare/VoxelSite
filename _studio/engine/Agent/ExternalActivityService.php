<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,SiteWorkspace};

/** Bounded revision attribution shared by Studio and external clients. */
final class ExternalActivityService
{
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace){}
    public static function outputSchema():array
    {
        return ToolContracts::object(['draft_version'=>['type'=>'string','pattern'=>'^draft:[0-9]+$'],
            'last_external_revision'=>ToolContracts::nullable(ToolContracts::object([
                'id'=>['type'=>'integer','minimum'=>1],'description'=>ToolContracts::text(4096),
                'created_at'=>ToolContracts::text(64),'affected_files'=>ToolContracts::list(ToolContracts::text(600),500),
                'affected_files_truncated'=>['type'=>'boolean'],'source'=>ToolContracts::text(100),
            ])),'provider_calls'=>['const'=>0]]);
    }
    public function read(OperationActor $actor,\stdClass $input):array
    {
        return ProviderCallPolicy::runExternal(function()use($actor,$input):array{
            $this->policy->require($actor,['site:read']);JsonSchema::validate($input,ToolContracts::object([]));
            // Local Studio changes also carry attribution; they are not external
            // activity. Invalid retained records remain visible to validation.
            $last=$this->db->queryOne("SELECT r.id,
                CASE WHEN length(CAST(r.description AS BLOB))<=4096 THEN r.description END AS description,
                CASE WHEN length(CAST(r.created_at AS BLOB))<=64 THEN r.created_at END AS created_at,
                CASE WHEN length(CAST(r.files_changed AS BLOB))<=1048576 THEN r.files_changed END AS files_changed,
                CASE WHEN length(CAST(a.actor_json AS BLOB))<=16384 THEN a.actor_json END AS actor_json
                FROM revisions r JOIN agent_revision_attribution a ON a.revision_id=r.id
                WHERE CASE WHEN length(CAST(a.actor_json AS BLOB))>16384 THEN 1
                    WHEN json_valid(a.actor_json) THEN COALESCE(json_extract(a.actor_json,'$.type'),'invalid')!='user' ELSE 1 END
                ORDER BY r.id DESC LIMIT 1");
            if($last!==null){
                if(!is_string($last['actor_json'])||!is_string($last['files_changed'])||!is_string($last['description'])||!is_string($last['created_at']))self::invalid();
                try{$attribution=json_decode($last['actor_json'],false,16,JSON_THROW_ON_ERROR);$files=json_decode($last['files_changed'],true,32,JSON_THROW_ON_ERROR);}
                catch(\JsonException){self::invalid();}
                JsonSchema::validate($attribution,ToolContracts::actor());
                if(!in_array($attribution->type,['api_key','rest_key'],true)||!is_array($files)||!array_is_list($files)||count($files)>700)self::invalid();
                $paths=[];
                foreach($files as $file){
                    $path=is_array($file)?($file['path']??null):null;
                    if(!is_string($path)||strlen($path)>600||!mb_check_encoding($path,'UTF-8')||preg_match('/[\x00-\x1f\x7f]/',$path))self::invalid();
                    try{SiteWorkspace::normalizeRelative($path);}catch(\RuntimeException){self::invalid();}
                    $paths[]=$path;
                }
                $label=$attribution->credential_id!==null?$this->db->scalar('SELECT substr(label,1,101) FROM api_keys WHERE id=?',[$attribution->credential_id]):null;
                $last=['id'=>(int)$last['id'],'description'=>$last['description'],'created_at'=>$last['created_at'],
                    'affected_files'=>array_slice($paths,0,500),'affected_files_truncated'=>count($paths)>500,
                    'source'=>$attribution->client_name?:($label?:'Connected AI tool')];
            }
            $result=['draft_version'=>'draft:'.$this->workspace->status()['draft_version'],'last_external_revision'=>$last,'provider_calls'=>0];
            JsonSchema::validate(JsonSchema::output($result),self::outputSchema());return $result;
        });
    }
    private static function invalid():never{throw new OperationException('invalid_schema','Retained external activity is invalid or exceeds its read budget.');}
}
