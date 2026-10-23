<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,FileManager,PatchExecutor,SitePlanStore,SiteWorkspace};

/** Historical identities remain separate from reviewed shared operations. */
final class LegacySiteControlService
{
    private const MAX_RECORD_BYTES=2097152;
    private const STRATEGIES=['token-edit','attribute-edit','line-replace','block-replace','block-insert','meta-edit','content-edit'];
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,private ChangeSetService $changes){}

    public static function inputSchema(string $method):array
    {
        $kind=$method==='mutation_read'?'mutation':'plan';
        $fields=[$kind.'_id'=>['type'=>'string','pattern'=>'^[a-f0-9]{'.($kind==='plan'?48:32).'}$']];
        if($method==='plan_prepare')return ToolContracts::object($fields+[
            'request_id'=>ToolContracts::requestId(),'base_draft_version'=>ToolContracts::version(),'record_digest'=>ToolContracts::hash()]);
        if(!in_array($method,['plan_read','mutation_read'],true))throw new \LogicException('Unknown legacy method.');
        return ToolContracts::object($fields+['record_digest'=>ToolContracts::hash(),'offset'=>ToolContracts::integer(self::MAX_RECORD_BYTES),
            'max_bytes'=>['type'=>'integer','minimum'=>2048,'maximum'=>65536]],[$kind.'_id']);
    }
    public static function outputSchema(string $method):array
    {
        if($method==='plan_prepare')return ToolContracts::object(['legacy_plan_id'=>['type'=>'string','pattern'=>'^[a-f0-9]{48}$'],
            'legacy_record_digest'=>ToolContracts::hash(),'review'=>ToolContracts::changeReview(),'provider_calls'=>['const'=>0]]);
        $kind=$method==='plan_read'?'plan':'mutation';
        $fields=[$kind.'_id'=>['type'=>'string','pattern'=>'^[a-f0-9]{'.($kind==='plan'?48:32).'}$'],
            'status'=>['enum'=>['ready','applying','applied','failed']],'created_at'=>ToolContracts::integer(),
            'snapshot_id'=>ToolContracts::nullable(ToolContracts::integer()),'record_digest'=>ToolContracts::hash(),
            'trust'=>['const'=>'untrusted_historical_source'],'content'=>ToolContracts::text(65536),'offset'=>ToolContracts::integer(self::MAX_RECORD_BYTES),
            'next_offset'=>ToolContracts::nullable(ToolContracts::integer(self::MAX_RECORD_BYTES)),'total_bytes'=>ToolContracts::integer(self::MAX_RECORD_BYTES),
            'max_bytes'=>ToolContracts::integer(65536),'provider_calls'=>['const'=>0]];
        $fields+=$kind==='plan'?['expires_at'=>ToolContracts::integer()]:['route_path'=>ToolContracts::text(256),'http_code'=>ToolContracts::nullable(['type'=>'integer','minimum'=>100,'maximum'=>599])];
        return ToolContracts::object($fields);
    }
    public function read(OperationActor $actor,\stdClass $input,string $kind):array
    {
        return ProviderCallPolicy::runExternal(function()use($actor,$input,$kind):array{
            $this->policy->require($actor,$kind==='plan'?['site:read','files:read']:['site:read','files:read','forms:read','operations:read']);
            JsonSchema::validate($input,self::inputSchema($kind.'_read'));
            $row=$this->row($actor,$kind,$input->{$kind.'_id'});
            $payload=$this->payload($actor,$kind,$row);
            $digest=CanonicalJson::digest($row);
            if((isset($input->record_digest)&&!hash_equals($digest,$input->record_digest))||(($input->offset??0)>0&&!isset($input->record_digest)))
                throw new OperationException('content_conflict','Read the current historical record before continuing its exact digest.');
            $content=CanonicalJson::encode($payload);$offset=$input->offset??0;$budget=$input->max_bytes??16384;
            if(strlen($content)>self::MAX_RECORD_BYTES)self::invalid();
            if($offset>strlen($content)||($offset>0&&$offset<strlen($content)&&(ord($content[$offset])&0xc0)===0x80))self::invalid();
            $result=[$kind.'_id'=>$row['id'],'status'=>$row['status'],'created_at'=>(int)$row['created_at'],
                'snapshot_id'=>$row[$kind==='plan'?'recovery_snapshot_id':'snapshot_id']===null?null:(int)$row[$kind==='plan'?'recovery_snapshot_id':'snapshot_id'],
                'record_digest'=>$digest,'trust'=>'untrusted_historical_source','content'=>'','offset'=>$offset,'next_offset'=>null,
                'total_bytes'=>strlen($content),'max_bytes'=>$budget,'provider_calls'=>0];
            $result+=$kind==='plan'?['expires_at'=>(int)$row['expires_at']]:['route_path'=>$row['route_path'],'http_code'=>$row['http_code']===null?null:(int)$row['http_code']];
            $take=min(strlen($content)-$offset,$budget-1024);
            do{
                $part=mb_strcut($content,$offset,max(0,$take),'UTF-8');$result['content']=$part;
                $next=$offset+strlen($part);$result['next_offset']=$next<strlen($content)?$next:null;
                $take-=max(1,strlen(CanonicalJson::encode($result))-$budget);
            }while(strlen(CanonicalJson::encode($result))>$budget&&$take>=0);
            if($result['content']===''&&$offset<strlen($content))throw new OperationException('size_limit','Increase the historical read budget.');
            JsonSchema::validate(JsonSchema::output($result),self::outputSchema($kind.'_read'));return $result;
        });
    }
    public function prepare(OperationActor $actor,\stdClass $input):array
    {
        $this->policy->require($actor,['site:read','files:read','files:write','changes:apply']);
        JsonSchema::validate($input,self::inputSchema('plan_prepare'));
        $request=(object)['request_id'=>$input->request_id,'base_draft_version'=>$input->base_draft_version,'brief_id'=>'files:legacy-plan-v1',
            'summary'=>'Import reviewed legacy Site plan','intent'=>(object)['action'=>'legacy_plan_import','legacy_plan_id'=>$input->plan_id,'record_digest'=>$input->record_digest]];
        $review=$this->changes->prepareFiles($actor,$request,function(array $before)use($actor,$input):array{
            // This read and conversion run inside the common writer lock. No
            // native begin/recovery method is called and no native status moves.
            $row=$this->row($actor,'plan',$input->plan_id);
            if(!hash_equals($input->record_digest,CanonicalJson::digest($row)))throw new OperationException('content_conflict','The historical plan record changed. Read it again.');
            if($row['status']!=='ready'||(int)$row['expires_at']<time())throw new OperationException('content_conflict','Only an unexpired ready legacy plan can be imported.');
            $plan=$this->payload($actor,'plan',$row)['plan'];
            if(($plan->applicable??true)!==true||!is_string($plan->site_fingerprint??null)
                ||!hash_equals($plan->site_fingerprint,SitePlanStore::sourceFingerprint(new FileManager($this->db,$this->workspace))))
                throw new OperationException('content_conflict','The draft changed since the legacy review. Prepare a new change from current source.');
            $groups=[];
            foreach($plan->edits as $edit){
                $path=SitePathPolicy::canonical($edit->file,true);
                if(SitePathPolicy::isMergeOnly($path)||SitePathPolicy::type($path)==='binary')throw new OperationException('invalid_path','Legacy source edits cannot replace merge-only data or binary assets.');
                if(SitePathPolicy::type($path)==='forms')$this->policy->require($actor,['forms:read','forms:write']);
                if(($edit->anchored??null)!==true||!in_array($edit->strategy??null,self::STRATEGIES,true)
                    ||!is_string($edit->source_hash??null)||!preg_match('/^[a-f0-9]{64}$/D',$edit->source_hash)
                    ||!is_string($edit->before_snippet??null)||$edit->before_snippet===''||strlen($edit->before_snippet)>1048576
                    ||!is_string($edit->after_snippet??null)||strlen($edit->after_snippet)>1048576)self::invalid();
                if(!isset($before[$path])||!hash_equals($edit->source_hash,hash('sha256',$before[$path])))throw new OperationException('content_conflict','A legacy source hash no longer matches the draft.',['path'=>$path]);
                $groups[$path][]=(array)$edit;
            }
            $operations=[];
            foreach($groups as $path=>$edits){
                try{$content=PatchExecutor::prepareSource($path,$before[$path],$edits);}
                catch(\RuntimeException){throw new OperationException('content_conflict','Legacy anchors are absent, ambiguous or overlapping. Prepare a new review.',['path'=>$path]);}
                $operations[]=(object)['type'=>'replace','path'=>$path,'expected_hash'=>hash('sha256',$before[$path]),'content'=>$content];
            }
            return ['operations'=>$operations];
        });
        return ['legacy_plan_id'=>$input->plan_id,'legacy_record_digest'=>$input->record_digest,'review'=>$review,'provider_calls'=>0];
    }
    private function row(OperationActor $actor,string $kind,string $id):array
    {
        $table=$kind==='plan'?'site_control_plans':'site_control_mutations';
        // Bound SQLite values before materializing historical JSON in PHP.
        $columns=$kind==='plan'?['id','status','created_at','expires_at','recovery_snapshot_id','plan_json','result_json','manifest_json']
            :['id','status','created_at','snapshot_id','route_path','http_code','request_hash','response_json'];
        $length=implode('+',array_map(static fn($name)=>'COALESCE(length(CAST('.$name.' AS BLOB)),0)',$columns));
        $size=$this->db->queryOne("SELECT ($length) AS bytes FROM $table WHERE id=? AND user_id=?",[$id,$actor->userId]);
        if($size===null)throw new OperationException('not_found','This account has no matching historical Site record.');
        if((int)$size['bytes']>self::MAX_RECORD_BYTES)throw new OperationException('size_limit','The historical Site record exceeds the 2 MiB read limit.');
        $row=$this->db->queryOne('SELECT '.implode(',',$columns)." FROM $table WHERE id=? AND user_id=? AND ($length)<=?",[$id,$actor->userId,self::MAX_RECORD_BYTES]);
        if($row===null)throw new OperationException('content_conflict','The historical Site record changed during its bounded read.');
        if(!in_array($row['status'],['ready','applying','applied','failed'],true)||(int)$row['created_at']<0)self::invalid();
        return $row;
    }
    private function payload(OperationActor $actor,string $kind,array $row):array
    {
        try{
            if($kind==='mutation')return ['response'=>$row['response_json']===null?null:json_decode($row['response_json'],false,64,JSON_THROW_ON_ERROR)];
            $plan=json_decode($row['plan_json'],false,64,JSON_THROW_ON_ERROR);
            $result=$row['result_json']===null?null:json_decode($row['result_json'],false,64,JSON_THROW_ON_ERROR);
        }catch(\JsonException){self::invalid();}
        if(!$plan instanceof \stdClass||!is_array($plan->edits??null)||count($plan->edits)<1||count($plan->edits)>40)self::invalid();
        foreach($plan->edits as $edit){
            if(!$edit instanceof \stdClass||!is_string($edit->file??null))self::invalid();
            $path=SitePathPolicy::canonical($edit->file);
            if(SitePathPolicy::type($path)==='forms')$this->policy->require($actor,['forms:read']);
        }
        return ['plan'=>$plan,'result'=>$result];
    }
    private static function invalid():never{throw new OperationException('invalid_schema','The retained historical Site record is invalid or exceeds its declared bounds.');}
}
