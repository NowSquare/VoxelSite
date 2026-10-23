<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

/** Explicit wire shapes shared by discovery, dispatch and response validation. */
final class ToolContracts
{
    public static function object(array $fields,?array $required=null):array {
        return ['type'=>'object','properties'=>$fields,'required'=>$required??array_keys($fields),'additionalProperties'=>false];
    }
    public static function text(int $max=2048):array {return ['type'=>'string','maxLength'=>$max];}
    public static function integer(int $max=PHP_INT_MAX):array {return ['type'=>'integer','minimum'=>0,'maximum'=>$max];}
    public static function nullable(array $schema):array {return ['anyOf'=>[$schema,['type'=>'null']]];}
    public static function list(array $item,int $max=500):array {return ['type'=>'array','maxItems'=>$max,'items'=>$item];}
    public static function hash():array {return ['type'=>'string','pattern'=>'^[a-f0-9]{64}$'];}
    public static function id(string $prefix):array {return ['type'=>'string','pattern'=>'^'.$prefix.'_[a-f0-9]{32}$'];}
    public static function requestId():array {return ['type'=>'string','pattern'=>'^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$'];}
    public static function path():array {return ['type'=>'string','minLength'=>1,'maxLength'=>240];}
    public static function version():array {return ['type'=>'string','pattern'=>'^draft:[0-9]+$'];}
    public static function limits():array {return self::object(['max_bytes'=>self::integer(196608),'max_chars'=>self::integer(196608)]);}
    public static function contextInput(bool $brief=false):array {
        $fields=[
            'action'=>['type'=>'string','enum'=>array_column((new \VoxelSite\ActionRegistry())->getActions(),'id')],
            'focus_paths'=>self::list(self::path(),8),
            'max_bytes'=>['type'=>'integer','minimum'=>$brief?12288:2048,'maximum'=>196608],
            'max_chars'=>['type'=>'integer','minimum'=>$brief?12288:2048,'maximum'=>196608],
        ];
        if ($brief) $fields+=[
            'request_id'=>self::requestId(),
            'style'=>['enum'=>['','modern_minimal','bold_vibrant','elegant_classic','playful_creative','dark_premium']],
            'instruction'=>self::text(2048),
        ];
        return self::object($fields,$brief?['request_id']:[]);
    }
    public static function context():array {
        $identity=self::object(array_fill_keys(['site_name','site_tagline','site_language'],self::text(2048)),[]);
        $section=self::object([
            'name'=>['enum'=>['site_identity','design_tokens','site_memory','design_intelligence','form_schema','focused_file','source_dependencies']],
            'trust'=>['const'=>'untrusted_source'],'path'=>self::path(),'sha256'=>self::hash(),
            'content'=>self::text(196608),'data'=>['anyOf'=>[$identity,self::list(self::text(240),32)]],
            'check'=>['const'=>'literal_references_only'],
        ],['name','trust']);
        return self::object([
            'draft_version'=>self::version(),'action'=>self::text(80),'trust'=>self::text(256),'provider_calls'=>['const'=>0],
            'limits'=>self::limits(),'site_state'=>self::object(['has_pages'=>['type'=>'boolean']]),
            'required_scopes'=>self::list(self::text(80),32),
            'manifest'=>self::list(self::object(['path'=>self::path(),'bytes'=>self::integer(),
                'sha256'=>self::nullable(self::hash()),'resource'=>self::text(1024)]),512),
            'sections'=>self::list($section,512),
            'rules'=>self::list(self::object(['kind'=>['enum'=>['authoring','design','accessibility','copy']],
                'sha256'=>self::hash(),'bytes'=>self::integer(),'resource'=>self::text(1024)]),4),
            'omissions'=>self::list(self::object(['reason'=>self::text(100),'count'=>self::integer()]),32),
            'size_bytes'=>self::integer(196608),'size_chars'=>self::integer(196608),
        ]);
    }
    public static function brief():array {
        $axes=['hero','type','palette','accent','layout','radius','motion','signature'];
        return self::object([
            'brief_id'=>self::id('brief'),'action'=>self::text(80),'base_draft_version'=>self::version(),
            'rules_digest'=>self::hash(),'context'=>self::context(),
            'instruction'=>self::object(['trust'=>['const'=>'user_supplied_source'],'text'=>self::text(2048)]),
            'direction'=>self::nullable(self::object(['seed'=>self::text(128),
                'ids'=>self::object(array_fill_keys($axes,self::text(128))),
                'choices'=>self::object(array_fill_keys([...$axes,'pairing'],self::text(2048))),
                'rendered'=>self::text(8192)])),
            'provider_calls'=>['const'=>0],'created_at'=>self::integer(),'expires_at'=>self::integer(),
            'review'=>self::object(['mode'=>['const'=>'external'],'not_run'=>self::list(self::text(100),10)]),
            'limits'=>self::limits(),'size_bytes'=>self::integer(196608),'size_chars'=>self::integer(196608),
        ]);
    }
    public static function validation():array {
        $diagnostic=self::object(['code'=>self::text(100),'path'=>self::path(),'message'=>self::text(2048)],['code','message']);
        return self::object(['blocking'=>self::list($diagnostic),'warnings'=>self::list($diagnostic),
            'not_run'=>self::list(self::text(100),30)]);
    }
    public static function reviewFile():array {
        return self::object(['path'=>self::path(),'effect'=>['enum'=>['create','replace','delete']],
            'before_hash'=>self::nullable(self::hash()),'after_hash'=>self::nullable(self::hash()),
            'before_bytes'=>self::integer(33554432),'after_bytes'=>self::integer(33554432)]);
    }
    public static function changeReview():array {
        $schema=self::object([
            'change_set_id'=>self::id('change'),'base_draft_version'=>self::version(),'status'=>['const'=>'ready'],
            'expires_at'=>self::integer(),'files'=>self::list(self::reviewFile()),
            'derived_files'=>self::list(self::path()),'normalized_files'=>self::list(self::path()),
            'validation'=>self::validation(),'diff_resource'=>self::text(1024),'provider_calls'=>['const'=>0],'digest'=>self::hash(),
        ]);
        $schema['properties']['asset_references']=self::assetReferences();
        $schema['properties']['page_changes']=self::pageChangesSchema();
        return $schema;
    }
    public static function pageChangesSchema():array {
        $row=self::object(['id'=>self::integer(),'slug'=>self::text(240),'title'=>self::text(1000),'file_path'=>self::path(),
            'nav_label'=>self::nullable(self::text(1000)),'nav_order'=>self::nullable(self::integer(10000)),
            'nav_parent_id'=>self::nullable(self::integer()),'is_published'=>['type'=>'integer','enum'=>[0,1]],
            'is_homepage'=>['type'=>'integer','enum'=>[0,1]]]);
        return self::list(self::object(['before'=>self::nullable($row),'after'=>self::nullable($row)]),500);
    }
    public static function pageChanges(array $before,array $after):array {
        $keys=['id','slug','title','file_path','nav_label','nav_order','nav_parent_id','is_published','is_homepage'];
        $project=static function(array $rows)use($keys):array{
            $out=[];foreach($rows as $row){$item=array_intersect_key($row,array_flip($keys));foreach($keys as $key)$item[$key]??=null;
                foreach(['id','nav_order','nav_parent_id','is_published','is_homepage'] as $key)if($item[$key]!==null)$item[$key]=(int)$item[$key];
                $out[$item['id']]=$item;}return $out;};
        $a=$project($before);$b=$project($after);$changes=[];
        foreach(array_unique(array_merge(array_keys($a),array_keys($b))) as $id)
            if(($a[$id]??null)!==($b[$id]??null))$changes[]=['before'=>$a[$id]??null,'after'=>$b[$id]??null];
        JsonSchema::validate(json_decode(json_encode($changes,JSON_THROW_ON_ERROR),false,32,JSON_THROW_ON_ERROR),self::pageChangesSchema());
        return $changes;
    }
    public static function assetReferences():array {
        return ['type'=>'array','maxItems'=>500,'items'=>self::object([
            'path'=>self::path(),'source_file'=>self::path(),'line'=>self::integer(),
            'source_url'=>self::text(2048),'replacement_url'=>self::nullable(self::text(2048)),
        ])];
    }
    public static function diff():array {
        $side=self::nullable(self::object([
            'hash'=>self::hash(),'bytes'=>self::integer(33554432),'binary'=>['type'=>'boolean'],
            'content'=>self::nullable(self::text(65536)),'offset'=>self::integer(33554432),
            'next_offset'=>self::nullable(self::integer(33554432)),'truncated'=>['type'=>'boolean'],
        ]));
        return self::object(['change_set_id'=>self::id('change'),'digest'=>self::hash(),'path'=>self::path(),
            'sides'=>self::object(['before'=>$side,'after'=>$side],[]),'max_bytes'=>self::integer(65536)]);
    }
    public static function actor():array {
        return self::object(['type'=>['enum'=>['user','api_key','rest_key']],'user_id'=>self::integer(),
            'credential_id'=>self::nullable(self::integer()),'client_name'=>self::nullable(self::text(100))]);
    }
    public static function restoration():array {
        return self::object(['restored'=>self::nullable(['type'=>'boolean']),
            'required'=>['type'=>'boolean'],'remaining_paths'=>self::list(self::text(600),1500)],['restored']);
    }
    public static function operationResult():array {
        $failure=self::object(['provider_calls'=>['const'=>0],'restoration'=>self::restoration(),
            'error'=>self::object(['code'=>self::text(100),'message'=>self::text(4096)])]);
        $failure['properties']['original_outcome']=self::object([
            'error'=>self::object(['code'=>self::text(100),'message'=>self::text(4096)]),
            'restoration'=>self::restoration()]);
        $success=self::object([
            'operation_id'=>self::requestId(),'actor'=>self::actor(),'before_version'=>self::version(),'after_version'=>self::version(),
            'changed_paths'=>self::list(self::path()),'revision_id'=>self::integer(),'change_set_id'=>self::id('change'),
            'digest'=>self::hash(),'provider_calls'=>['const'=>0],'validation'=>self::validation(),'restoration'=>self::restoration(),
        ]);
        $unchanged=$success;
        $unchanged['properties']['revision_id']=['type'=>'null'];
        $unchanged['properties']['changed_paths']=self::list(self::path(),0);
        return ['anyOf'=>[['type'=>'null'],$failure,$success,$unchanged,PublishPlanService::resultSchema(),
            \VoxelSite\SnapshotService::resultSchema(),SnapshotDeletionService::resultSchema(),RestorePlanService::resultSchema(),
            DesignService::resultSchema('save'),DesignService::resultSchema('delete'),
            SettingsService::resultSchema('update'),SettingsService::resultSchema('mail_test'),
            PromptService::resultSchema(),DiagnosticsService::resultSchema(),FaviconService::outputSchema(),
            ResetService::resultSchema(),OwnerRecoveryService::resultSchema(),UpdateService::resultSchema()]];
    }
    public static function operation():array {
        return self::object([
            'operation_id'=>self::requestId(),'kind'=>self::text(100),
            'status'=>['enum'=>['prepared','applying','succeeded','failed_restored','recovery_required','expired','cancelled']],
            'phase'=>self::text(100),'checkpoint'=>self::integer(),'before_version'=>self::text(128),
            'after_version'=>self::nullable(self::text(128)),'result'=>self::operationResult(),'provider_calls'=>['const'=>0],
            'result_retention_seconds'=>self::integer(),'result_pruned'=>['type'=>'boolean'],
            'next_action'=>['enum'=>[null,'operations_continue','explicit_recovery']],
        ]);
    }
}
