<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,SiteMutationLock,SiteWorkspace};

/** REST names are projections of the shared business services, never independent writers. */
final class BusinessRestAdapter
{
    private BusinessStudioAdapter $services;
    public function __construct(private Database $db,private SiteWorkspace $workspace,?BusinessStudioAdapter $services=null)
    {
        $this->services=$services??new BusinessStudioAdapter($db,$workspace);
    }
    public function submissions(OperationActor $actor,array $query):array
    {
        unset($query['_path']);
        $allowed=['source','kind','form_id','entity_id','status','record_source','search','date_from','date_to','cursor','limit','per_page','page'];
        if(array_diff(array_keys($query),$allowed))throw new OperationException('invalid_schema','Unsupported inbox filter.');
        if(isset($query['page']) && (string)$query['page']!=='1')throw new OperationException('invalid_schema','Continue with next_cursor instead of offset page numbers.');
        $input=[];
        foreach(['kind','entity_id','status','search','date_from','date_to','cursor'] as $key)if(isset($query[$key]))$input[$key]=$query[$key];
        if(isset($query['source'])){
            if(!in_array($query['source'],['form','action','all'],true) || isset($input['kind']))throw new OperationException('invalid_schema','Choose one form or Action source filter.');
            $input['kind']=$query['source'];
        }
        if(isset($query['form_id'])){
            if(isset($input['entity_id']) || !is_string($query['form_id']))throw new OperationException('invalid_schema','Choose one form identifier.');
            $id=$query['form_id'];
            if(str_starts_with($id,'action_')){
                if(isset($input['kind']) && $input['kind']!=='action')throw new OperationException('invalid_schema','Action identifiers require the Action source.');
                $input['kind']='action';$id=substr($id,7);
            }
            $input['entity_id']=$id;
        }
        if(isset($query['record_source']))$input['source']=$query['record_source'];
        if(isset($query['limit'],$query['per_page']))throw new OperationException('invalid_schema','Choose one page size.');
        if(isset($query['limit']) || isset($query['per_page']))$input['limit']=$this->integer($query['limit']??$query['per_page'],1,100);
        $result=$this->services->submissions->list($actor,(object)$input);
        return ['submissions'=>$result['records'],'next_cursor'=>$result['next_cursor'],'consistency'=>$result['consistency'],'provider_calls'=>0];
    }
    public function tools(OperationActor $actor,array $query):array
    {
        unset($query['_path']);$input=$query;
        foreach(['offset','limit'] as $key)if(isset($input[$key]))$input[$key]=$this->integer($input[$key],$key==='limit'?1:0,$key==='limit'?50:200);
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);
        $page=$this->services->actions->list($actor,(object)$input);
        $this->services->policy->require($actor,['site:read','forms:read']);
        $tools=$this->fixedTools();
        // list() seals and bounds the full Action inventory before the legacy schema formatter reads it.
        $definitions=$this->services->actions->manager()->listTools();
        $routes=$this->routes($actor);
        $selected=array_column($page['items'],null,'id');
        foreach($definitions as $definition){
            $route=$routes[$definition['name']]??null;
            if(!$route || !isset($selected[$route['id']]))continue;
            $definition['version']=$selected[$route['id']]['version'];
            $definition['action_id']=$route['id'];
            $definition['required_request_fields']=$route['kind']==='availability'?['action_id','version']:['action_id','version','request_id'];
            $tools[]=$definition;
        }
        $result=['tools'=>$tools,'version'=>$page['version'],'next_offset'=>$page['next_offset'],'total_actions'=>$page['total'],'provider_calls'=>0];
        if(strlen(CanonicalJson::encode($result))>196608)throw new OperationException('size_limit','Tool discovery exceeds 192 KiB. Request fewer Actions.');
        return $result;
    }
    public function invoke(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,ToolContracts::object(['name'=>ToolContracts::text(160),'arguments'=>BusinessContracts::map(),
            'version'=>ToolContracts::hash(),'request_id'=>ToolContracts::requestId(),'action_id'=>BusinessContracts::id()],['name','arguments']));
        BusinessContracts::bounded($input->arguments);
        $args=$input->arguments;$name=$input->name;
        if(in_array($name,['get_business_info','get_menu','get_services','get_faq'],true))return $this->data($actor,$name,$args);
        if($name==='list_forms'){
            $props=FormService::inputSchema('list');unset($props['properties']['source']);$props['required']=[];
            JsonSchema::validate($args,$props);
            return $this->services->forms->list($actor,(object)(['source'=>'published']+(array)$args));
        }
        if($name==='get_form_schema'){
            JsonSchema::validate($args,ToolContracts::object(['form_id'=>BusinessContracts::id()]));
            return $this->services->forms->get($actor,(object)['source'=>'published','form_id'=>$args->form_id]);
        }
        if($name==='submit_form'){
            $schema=ToolContracts::object(['form_id'=>BusinessContracts::id(),'data'=>BusinessContracts::map()]);
            JsonSchema::validate($args,$schema);
            $this->requireMutation($input);
            return $this->services->submissions->submit($actor,(object)['form_id'=>$args->form_id,'data'=>$args->data,
                'version'=>$input->version,'request_id'=>$input->request_id]);
        }
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);
        if(!isset($input->action_id))throw new OperationException('invalid_schema','Send action_id from the reviewed tool discovery.');
        $id=$input->action_id;
        $kind=match($name){'make_'.str_replace('-','_',$id),$id=>'create','cancel_'.$id=>'cancel','check_'.$id.'_availability'=>'availability',default=>null};
        if(!$kind)throw new OperationException('not_found','The tool name does not match its Action identifier.');
        if(!isset($input->version))throw new OperationException('invalid_schema','Send the definition version returned by tool discovery.');
        $mapped=(object)['action_id'=>$id,'version'=>$input->version,'data'=>$args];
        if($kind==='availability'){
            $definition=$this->services->actions->get($actor,(object)['action_id'=>$id])['definition'];
            if(!($definition['active']??false) || !($definition['companion_tools']['check_availability']??false) || empty($definition['constraints']['capacity']['enabled']))
                throw new OperationException('permission_denied','Availability lookup is disabled for this Action.');
            return $this->services->actions->availability($actor,$mapped);
        }
        $this->requireMutation($input);$mapped->kind=$kind;$mapped->request_id=$input->request_id;
        return $this->services->actions->invoke($actor,$mapped);
    }
    private function requireMutation(\stdClass $input):void
    {
        if(!isset($input->version,$input->request_id))throw new OperationException('invalid_schema','Send the reviewed version and a stable request_id in the tool request envelope.');
    }
    private function routes(OperationActor $actor):array
    {
        $routes=[];$offset=0;$version=null;
        do{
            $input=['offset'=>$offset,'limit'=>50];if($version!==null)$input['version']=$version;
            $page=$this->services->actions->list($actor,(object)$input);$version=$page['version'];
            foreach($page['items'] as $item){
                if(!$item['active'])continue;
                $id=$item['id'];$action=$this->services->actions->get($actor,(object)['action_id'=>$id])['definition'];
                $names=['make_'.str_replace('-','_',$id)=>'create',$id=>'create'];
                if(($action['companion_tools']['check_availability']??false) && !empty($action['constraints']['capacity']['enabled']))$names['check_'.$id.'_availability']='availability';
                if($action['companion_tools']['cancel_by_code']??false)$names['cancel_'.$id]='cancel';
                foreach($names as $name=>$kind){
                    if(isset($routes[$name]) || in_array($name,array_column($this->fixedTools(),'name'),true))throw new OperationException('content_conflict','Action tool names collide. Rename the conflicting Action before invoking it.');
                    $routes[$name]=['id'=>$id,'kind'=>$kind];
                }
            }
            $offset=$page['next_offset'];
        }while($offset!==null);
        return $routes;
    }
    private function fixedTools():array
    {
        $definitions=[
            'get_business_info'=>['Read published business information.',ToolContracts::object([]),[]],
            'get_menu'=>['Read the published menu.',ToolContracts::object(['category'=>ToolContracts::text(200)],[]),[]],
            'get_services'=>['Read published services.',ToolContracts::object([]),[]],
            'get_faq'=>['Read published frequently asked questions.',ToolContracts::object(['query'=>ToolContracts::text(200)],[]),[]],
            'list_forms'=>['List published form schemas.',ToolContracts::object(['offset'=>ToolContracts::integer(200),'limit'=>['type'=>'integer','minimum'=>1,'maximum'=>100],'version'=>ToolContracts::hash()],[]),[]],
            'get_form_schema'=>['Read a published form and its required submission version.',ToolContracts::object(['form_id'=>BusinessContracts::id()]),[]],
            'submit_form'=>['Create a real record. Notifications require explicit mail access.',ToolContracts::object(['form_id'=>BusinessContracts::id(),'data'=>BusinessContracts::map()]),['version','request_id']],
        ];
        $tools=[];foreach($definitions as $name=>[$description,$schema,$required])$tools[]=['name'=>$name,'description'=>$description,'inputSchema'=>$schema,'required_request_fields'=>$required];
        return $tools;
    }
    private function data(OperationActor $actor,string $name,\stdClass $args):array
    {
        $this->services->policy->require($actor,['site:read']);$this->workspace->assertReady();
        $defs=array_column($this->fixedTools(),null,'name');JsonSchema::validate($args,$defs[$name]['inputSchema']);
        $file=match($name){'get_business_info'=>'site','get_menu'=>'menu','get_services'=>'services','get_faq'=>'faq'};
        // This single published document is observational. The bounded read
        // checks file identity and size; a private draft writer must not make
        // public business information unavailable.
        $bytes=BusinessContracts::read($this->workspace->publishedRoot(),'assets/data/'.$file.'.json',65536);
        if($bytes===null)return ['message'=>'No published '.$file.' information is available.'];
        try{$value=json_decode($bytes,false,16,JSON_THROW_ON_ERROR);}catch(\JsonException){throw new OperationException('invalid_schema','Published business information contains invalid JSON.');}
        if(!is_object($value)&&!is_array($value))throw new OperationException('invalid_schema','Published business information must be a JSON object or list.');
        $data=BusinessContracts::bounded($value);
        if($name==='get_menu' && isset($args->category,$data['categories']) && is_array($data['categories']))
            $data['categories']=array_values(array_filter($data['categories'],static fn($item)=>is_array($item)&&is_string($item['name']??null)&&stripos($item['name'],$args->category)!==false));
        if($name==='get_faq' && isset($args->query)){
            $items=$data['questions']??$data['faq']??$data['items']??[];
            if(!is_array($items))throw new OperationException('invalid_schema','Published FAQ entries must be a list.');
            return array_values(array_filter($items,static fn($item)=>is_array($item)&&
                ((is_string($item['question']??null)&&stripos($item['question'],$args->query)!==false) ||
                 (is_string($item['answer']??null)&&stripos($item['answer'],$args->query)!==false))));
        }
        return $data;
    }
    private function integer(mixed $value,int $min,int $max):int
    {
        if((!is_string($value)&&!is_int($value)) || !preg_match('/^(0|[1-9][0-9]{0,3})$/D',(string)$value) || (int)$value<$min || (int)$value>$max)
            throw new OperationException('invalid_schema','Pagination values are outside their supported range.');
        return (int)$value;
    }
}
