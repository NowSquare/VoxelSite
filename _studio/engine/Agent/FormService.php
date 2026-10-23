<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,FormValidator,SiteWorkspace};

/** Form definitions have a private authoring domain; inbox data never enters this facade. */
final class FormService
{
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,private ?ChangeSetService $changes=null) {}
    public static function inputSchema(string $method):array {
        $source=['source'=>['enum'=>['draft','published']]];
        $id=['form_id'=>BusinessContracts::id()];
        return match($method) {
            'list'=>ToolContracts::object($source+['offset'=>ToolContracts::integer(200),'limit'=>['type'=>'integer','minimum'=>1,'maximum'=>100],
                'version'=>ToolContracts::hash()],['source']),
            'get'=>ToolContracts::object($source+$id),
            'prepare'=>ToolContracts::object($id+['request_id'=>ToolContracts::requestId(),'base_draft_version'=>ToolContracts::version(),
                'expected_hash'=>BusinessContracts::nullableVersion(),'definition'=>ToolContracts::nullable(BusinessContracts::map())]),
            'validate'=>ToolContracts::object($source+$id+['version'=>ToolContracts::hash(),'data'=>BusinessContracts::map()]),
            default=>throw new \InvalidArgumentException('Unknown form method.'),
        };
    }
    public static function outputSchema(string $method):array {
        if($method==='prepare')return ToolContracts::changeReview();
        if($method==='list')return ToolContracts::object(['source'=>['enum'=>['draft','published']],'version'=>ToolContracts::hash(),
            'forms'=>ToolContracts::list(ToolContracts::object(['id'=>BusinessContracts::id(),'name'=>ToolContracts::text(300),'description'=>ToolContracts::text(2000),
                'fields'=>ToolContracts::integer(100),'version'=>ToolContracts::hash()]),100),
            'total'=>ToolContracts::integer(200),'next_offset'=>ToolContracts::nullable(ToolContracts::integer(200)),'provider_calls'=>['const'=>0]]);
        if($method==='validate')return ToolContracts::object(['valid'=>['type'=>'boolean'],'data'=>BusinessContracts::map(),'errors'=>BusinessContracts::map(),
            'record_created'=>['const'=>false],'email_sent'=>['const'=>false],'mode'=>['const'=>'validation_only'],'provider_calls'=>['const'=>0]]);
        return ToolContracts::object(['form_id'=>BusinessContracts::id(),'source'=>['enum'=>['draft','published']],
            'version'=>ToolContracts::hash(),'definition'=>BusinessContracts::map(),'provider_calls'=>['const'=>0]]);
    }
    public function list(OperationActor $actor,\stdClass $input):array {
        $this->policy->require($actor,['forms:read']);JsonSchema::validate($input,self::inputSchema('list'));
        $root=$this->root($input->source);$dir=SiteWorkspace::resolveWithin($root,'assets/forms');$forms=[];$hashes=[];$bytes=0;$entries=0;
        if(is_dir($dir))foreach(new \DirectoryIterator($dir) as $entry) {
            if($entry->isDot())continue;if(++$entries>240)throw new OperationException('size_limit','Form directory exceeds its entry limit.');
            if(count($forms)>=200)throw new OperationException('size_limit','Form inventory exceeds 200 definitions.');
            if(!preg_match('/^([a-z0-9][a-z0-9_-]{0,63})\.json$/D',$entry->getFilename(),$match))continue;
            $form=$this->get($actor,(object)['source'=>$input->source,'form_id'=>$match[1]]);$definition=$form['definition'];
            $bytes+=strlen(CanonicalJson::encode($definition));if($bytes>4194304)throw new OperationException('size_limit','Form inventory exceeds 4 MiB.');
            $hashes[$match[1]]=$form['version'];$forms[$match[1]]=['id'=>$match[1],'name'=>mb_substr((string)($definition['name']??$match[1]),0,300),
                'description'=>mb_substr((string)($definition['description']??''),0,2000),'fields'=>count($definition['fields']),'version'=>$form['version']];
        }
        ksort($hashes,SORT_STRING);ksort($forms,SORT_STRING);$version=CanonicalJson::digest($hashes);
        if(isset($input->version)&&!hash_equals($version,$input->version))throw new OperationException('content_conflict','The form inventory changed. Restart pagination.');
        if(($input->offset??0)>0&&!isset($input->version))throw new OperationException('content_conflict','Form continuation requires its inventory version.');
        $offset=$input->offset??0;$limit=$input->limit??50;$count=count($forms);
        return ['source'=>$input->source,'version'=>$version,'forms'=>array_values(array_slice($forms,$offset,$limit)),
            'total'=>$count,'next_offset'=>$offset+$limit<$count?$offset+$limit:null,'provider_calls'=>0];
    }
    public function get(OperationActor $actor,\stdClass $input):array {
        $this->policy->require($actor,['forms:read']);JsonSchema::validate($input,self::inputSchema('get'));
        $path='assets/forms/'.$input->form_id.'.json';$bytes=BusinessContracts::read($this->root($input->source),$path);
        if($bytes===null)throw new OperationException('not_found','The form schema is unavailable.');
        (new ChangeSetValidator())->validateContent($path,$bytes);$definition=BusinessContracts::bounded(json_decode($bytes,false,32,JSON_THROW_ON_ERROR));
        return ['form_id'=>$input->form_id,'source'=>$input->source,'version'=>hash('sha256',$bytes),'definition'=>$definition,'provider_calls'=>0];
    }
    public function prepare(OperationActor $actor,\stdClass $input):array {
        JsonSchema::validate($input,self::inputSchema('prepare'));$this->policy->require($actor,['forms:read','forms:write','files:read','files:write','changes:apply']);
        if($this->changes===null)throw new OperationException('feature_disabled','Reviewed form editing is unavailable.');
        $path='assets/forms/'.$input->form_id.'.json';
        $content=null;if($input->definition!==null){BusinessContracts::bounded($input->definition);$content=CanonicalJson::encode($input->definition);}
        if($content!==null)(new ChangeSetValidator())->validateContent($path,$content);
        $request=(object)['request_id'=>$input->request_id,'base_draft_version'=>$input->base_draft_version,'brief_id'=>'forms:v1',
            'summary'=>($content===null?'Delete':'Save').' form '.$input->form_id,'intent'=>$input];
        return $this->changes->prepareForms($actor,$request,static function(array $before)use($path,$content,$input):array {
            $hash=isset($before[$path])?hash('sha256',$before[$path]):null;
            if($hash!==$input->expected_hash)throw new OperationException('content_conflict','The form schema changed. Review its current hash.');
            if($content===null && $hash===null)throw new OperationException('not_found','The form schema does not exist.');
            $operation=(object)['type'=>$content===null?'delete':($hash===null?'create':'replace'),'path'=>$path,'expected_hash'=>$hash];
            if($content!==null)$operation->content=$content;
            return ['operations'=>[$operation]];
        });
    }
    public function validate(OperationActor $actor,\stdClass $input):array {
        JsonSchema::validate($input,self::inputSchema('validate'));$form=$this->get($actor,(object)['source'=>$input->source,'form_id'=>$input->form_id]);
        if(!hash_equals($form['version'],$input->version))throw new OperationException('content_conflict','The form definition changed. Validate against its current version.');
        $data=BusinessContracts::bounded($input->data);$validator=new FormValidator($this->root($input->source).'/assets/forms',$this->root($input->source).'/assets/data');
        $result=$validator->validate($form['definition'],$data);
        foreach($form['definition']['fields'] as $field)if(($field['type']??'')==='file' && ($field['required']??$field['validation']['required']??false)) {
            $result['valid']=false;$result['errors'][$field['name']]='This required upload must be submitted through the website form.';
        }
        return ['valid'=>$result['valid'],'data'=>$result['data']?:new \stdClass(),'errors'=>$result['errors']?:new \stdClass(),
            'record_created'=>false,'email_sent'=>false,'mode'=>'validation_only','provider_calls'=>0];
    }
    private function root(string $source):string {
        $this->workspace->assertReady();return $source==='draft'?$this->workspace->draftRoot():$this->workspace->publishedRoot();
    }
}
