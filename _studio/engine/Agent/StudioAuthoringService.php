<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,SiteWorkspace,SiteMutationLock};

/** Studio is an adapter to retained, provider-free authoring operations. */
final class StudioAuthoringService
{
    public const PROTECTED_FILES = ['index.php','_partials/header.php','_partials/nav.php','_partials/footer.php','_partials/schema.php',
        'assets/css/style.css','assets/css/tailwind.css','assets/js/main.js','assets/js/navigation.js','assets/js/form-handler.js',
        'assets/data/site.json','assets/data/memory.json','assets/data/design-intelligence.json'];
    private ActorPolicy $policy;
    private ChangeSetStore $store;
    private ChangeSetService $changes;
    private ChangeSetExecutor $executor;
    private OperationStore $operations;
    public readonly SiteStructureService $structure;
    public readonly PageManagementService $pages;
    public function __construct(private Database $db,public readonly SiteWorkspace $workspace,?\Closure $executionHook=null)
    {
        $this->policy=new ActorPolicy($db);
        $this->store=new ChangeSetStore($db,$this->policy,dirname($workspace->draftRoot()).'/data/agent/changes');
        $this->changes=new ChangeSetService($db,$this->policy,$workspace,new BriefStore($db,$this->policy),$this->store);
        $this->operations=new OperationStore($db,$this->policy,$workspace->mutationLockPath());
        $this->executor=new ChangeSetExecutor($db,$this->policy,$workspace,$this->store,$this->operations,20,$executionHook);
        $this->structure=new SiteStructureService($db,$this->policy,$workspace,$this->changes);
        $this->pages=new PageManagementService($db,$this->policy,$workspace,$this->changes);
    }
    public static function actor(): OperationActor {return new OperationActor('user',(int)($_REQUEST['_user']['id']??0),null,[],'studio_configured',null);}
    public function read(OperationActor $actor,string $path): array
    {
        $this->policy->require($actor,['files:read']);SitePathPolicy::canonical($path);
        if(SitePathPolicy::type($path)==='seo'){
            $result=$this->pages->seoRead($actor,(object)['path'=>$path]);
            if(!$result['exists'])throw new OperationException('not_found','File not found.');
            unset($result['exists'],$result['provider_calls']);return $result;
        }
        if(SitePathPolicy::type($path)==='binary')throw new OperationException('invalid_path','Read binary assets through Assets.');
        if(SitePathPolicy::type($path)==='forms')$this->policy->require($actor,['forms:read']);
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);$this->workspace->assertReady();
        $absolute=$this->workspace->resolveDraft($path);
        if(!is_file($absolute))throw new OperationException('not_found','File not found.');
        if(filesize($absolute)>ChangeSetValidator::MAX_FILE_BYTES)throw new OperationException('size_limit','The editor supports source files up to 1 MiB.');
        $content=file_get_contents($absolute,false,null,0,ChangeSetValidator::MAX_FILE_BYTES+1);
        if($content===false||strlen($content)>ChangeSetValidator::MAX_FILE_BYTES||!mb_check_encoding($content,'UTF-8'))throw new OperationException('size_limit','Source is not bounded UTF-8 text.');
        return ['path'=>$path,'content'=>$content,'content_sha256'=>hash('sha256',$content),'draft_version'=>'draft:'.$this->workspace->status()['draft_version']];
    }
    public function fileChange(OperationActor $actor,string $action,array $input): array
    {
        $c=ToolContracts::class;$fields=['operation_id'=>$c::requestId(),'base_draft_version'=>$c::version(),'checkpoint'=>$c::integer(1000)];
        $required=['operation_id','base_draft_version'];
        if($action!=='compile'){$fields+=['path'=>$c::path(),'expected_content_sha256'=>$action==='create'?['type'=>'null']:$c::hash()];$required=array_merge($required,['path','expected_content_sha256']);}
        if(in_array($action,['save','create'],true)){$fields['content']=['type'=>'string','maxLength'=>ChangeSetValidator::MAX_FILE_BYTES];if($action==='save')$required[]='content';}
        if(!in_array($action,['save','create','delete','compile'],true))throw new OperationException('invalid_schema','Unknown editor action.');
        JsonSchema::validate((object)$input,$c::object($fields,$required));
        $this->policy->require($actor,['files:read','files:write','changes:apply']);
        $intent=$input;unset($intent['checkpoint'],$intent['operation_id'],$intent['base_draft_version']);$intent=['action'=>$action]+$intent;
        $path=$input['path']??'assets/css/tailwind.css';
        if($action!=='compile') {
            SitePathPolicy::canonical($path,false);
            if($path==='assets/css/tailwind.css'||SitePathPolicy::type($path)==='binary')throw new OperationException('permission_denied','Use compilation or Assets for this file.');
            if($action==='delete'&&in_array($path,self::PROTECTED_FILES,true))throw new OperationException('permission_denied','This core file cannot be deleted.');
            if(SitePathPolicy::type($path)==='forms')$this->policy->require($actor,['forms:read','forms:write']);
        }
        if(SitePathPolicy::type($path)==='seo') {
            if($action==='create')throw new OperationException('invalid_schema','Use the SEO override controls to create this file.');
            $structureIntent=(object)['type'=>'seo_override','path'=>$path,'expected_hash'=>$input['expected_content_sha256'],'content'=>$action==='delete'?null:$input['content']];
            $result=$this->structureChange($actor,$input,$structureIntent);
            return $this->fileResult($path,$input,$result);
        }
        $request=(object)['request_id'=>self::requestId($input['operation_id']),'base_draft_version'=>$input['base_draft_version'],
            'brief_id'=>'files:v1','summary'=>'Studio '.$action.($action==='compile'?' styles':': '.$path),'intent'=>(object)$intent];
        if($action==='compile') {
            $request=CompileService::request(self::requestId($input['operation_id']),$input['base_draft_version']);
            return $this->fileResult($path,$input,$this->run($actor,$input,$request,
                fn()=>(new CompileService($this->changes))->prepare($actor,(object)[
                    'request_id'=>$request->request_id,'base_draft_version'=>$request->base_draft_version])));
        }
        $operation=$this->run($actor,$input,$request,fn()=>$this->changes->prepareFiles($actor,$request,function(array $before)use($action,$path,$input):array {
            if($action==='compile')return ['operations'=>[]];
            $hash=isset($before[$path])?hash('sha256',$before[$path]):null;
            if($hash!==$input['expected_content_sha256'])throw new OperationException('content_conflict','This source changed after it was displayed. Review the current file before saving.');
            if($action!=='create'&&$hash===null)throw new OperationException('content_conflict','This file no longer exists.');
            $op=(object)['type'=>match($action){'save'=>'replace','create'=>'create','delete'=>'delete'},'path'=>$path,'expected_hash'=>$hash];
            if($action!=='delete')$op->content=$input['content']??match(pathinfo($path,PATHINFO_EXTENSION)){'php'=>"<?php\n\n",'css'=>"/* {$path} */\n",'js'=>"// {$path}\n",'json'=>"{}\n",default=>''};
            if(SitePathPolicy::isMergeOnly($path)) {
                try{$old=json_decode($before[$path]??'{}',false,64,JSON_THROW_ON_ERROR);$new=json_decode($op->content,false,64,JSON_THROW_ON_ERROR);}catch(\JsonException){throw new OperationException('invalid_schema','Memory and design intelligence must be JSON objects.');}
                if(!$old instanceof \stdClass||!$new instanceof \stdClass)throw new OperationException('invalid_schema','Memory and design intelligence must be JSON objects.');
                $op=(object)['type'=>'merge','path'=>$path,'expected_hash'=>$hash,'delta'=>(object)['set'=>$new,'remove'=>array_values(array_diff(array_keys(get_object_vars($old)),array_keys(get_object_vars($new))))]];
            }
            return ['operations'=>[$op]];
        }));
        return $this->fileResult($path,$input,$operation);
    }
    /** Closed Studio request contract shared by the HTTP adapter and injected execution tests. */
    public function structuralRequest(OperationActor $actor,string $path,array $body):array
    {
        $c=ToolContracts::class;
        $common=['operation_id'=>$c::requestId(),'base_draft_version'=>$c::version(),'checkpoint'=>$c::integer(1000)];
        $fields=match($path){
            '/site-control/url-rename'=>['routeId'=>$c::text(240),'newPath'=>$c::text(240)],
            '/site-control/page-rename'=>['pageId'=>$c::text(240),'newTitle'=>$c::text(200)],
            '/site-control/page-delete'=>['pageId'=>$c::text(240),'replacementHref'=>$c::text(240)],
            '/site-control/nav-reorder'=>['pageId'=>$c::text(240),'targetParentHref'=>$c::nullable($c::text(240)),'targetIndex'=>$c::integer(500)],
            '/site-control/structural-move'=>['pageId'=>$c::text(240),'targetParent'=>['type'=>'string','maxLength'=>80],'targetIndex'=>$c::nullable($c::integer(500))],
            default=>throw new OperationException('invalid_path','Unknown structural route.'),
        };
        $required=array_values(array_diff(array_keys($common+$fields),['checkpoint','replacementHref']));
        if($path==='/site-control/structural-move')$required=array_values(array_diff($required,['targetIndex']));
        JsonSchema::validate((object)$body,$c::object($common+$fields,$required));
        if($path==='/site-control/url-rename') {
            if(!str_starts_with($body['routeId'],'route:/'))throw new OperationException('invalid_path','Choose a route from the displayed graph.');
            $old=substr($body['routeId'],7);$new=trim($body['newPath'],'/');
            $slug=$old===''?'index':$old;$page=$slug.'.php';
            if(dirname($new)!==dirname($slug))throw new OperationException('invalid_schema','Keep the current parent. Use Move to change it.');
            $intent=['type'=>'url','page_file'=>$page,'new_slug'=>basename($new)];
        }else{
            if(!str_starts_with($body['pageId'],'page:'))throw new OperationException('invalid_path','Choose a page from the displayed graph.');
            $page=substr($body['pageId'],5);
            $intent=match($path){
                '/site-control/page-rename'=>['type'=>'title','page_file'=>$page,'title'=>$body['newTitle']],
                '/site-control/page-delete'=>['type'=>'delete','page_file'=>$page,'replacement_href'=>$body['replacementHref']??'#'],
                '/site-control/nav-reorder'=>['type'=>'nav_reorder','page_file'=>$page,'parent_href'=>$body['targetParentHref'],'index'=>$body['targetIndex']],
                '/site-control/structural-move'=>['type'=>'move','page_file'=>$page,'target_parent'=>$body['targetParent'],'target_index'=>$body['targetIndex']??null],
            };
        }
        $operation=$this->structureChange($actor,$body,(object)$intent);
        $data=$this->structureResult($operation,$page,$intent);
        if(!in_array($operation['status'],['succeeded','applying'],true)) throw new OperationException($operation['status'],'The reviewed change failed; inspect the retained operation before retrying.',['operation'=>$operation]);
        return $data;
    }
    public function structureChange(OperationActor $actor,array $input,\stdClass $intent): array
    {
        $this->policy->require($actor,['files:read','files:write','changes:apply','structure:write','site:read']);
        $prepare=(object)['request_id'=>self::requestId($input['operation_id']??''),'base_draft_version'=>$input['base_draft_version']??null,'intent'=>$intent];
        JsonSchema::validate($prepare,SiteStructureService::inputSchema('prepare'));
        $request=(object)['request_id'=>$prepare->request_id,'base_draft_version'=>$prepare->base_draft_version,'brief_id'=>'structure:v1','summary'=>'Reviewed site structure: '.$intent->type,'intent'=>$intent];
        return $this->run($actor,$input,$request,fn()=>$this->structure->prepare($actor,$prepare));
    }
    public function pageChange(OperationActor $actor,string $action,?string $slug,array $input):array
    {
        $c=ToolContracts::class;$fields=['operation_id'=>$c::requestId(),'base_draft_version'=>$c::version(),'checkpoint'=>$c::integer(1000)];
        $required=['operation_id','base_draft_version'];
        if($action==='reorder'){$fields['order']=PageManagementService::intentSchemas()[3]['properties']['order'];$required[]='order';}
        else{
            $fields['expected_content_sha256']=$action==='create'?['type'=>'null']:$c::hash();$required[]='expected_content_sha256';
            if($action==='create'){
                $schema=PageManagementService::intentSchemas()[0];
                foreach(['slug','title','content'] as $key){$fields[$key]=$schema['properties'][$key];$required[]=$key;}
            }elseif($action==='delete')$fields['replacementHref']=['type'=>'string','minLength'=>1,'maxLength'=>240];
            elseif(in_array($action,['update','navigation'],true))$fields+=PageManagementService::valuesSchema($action==='navigation')['properties'];
            else throw new OperationException('invalid_schema','Unknown page action.');
        }
        JsonSchema::validate((object)$input,$c::object($fields,$required));
        $path=$slug===null?null:$slug.'.php';if($path!==null)SitePathPolicy::canonical($path,true);
        if($action==='reorder')$intent=(object)['type'=>'pages_reorder','order'=>$input['order']];
        elseif($action==='create')$intent=(object)['type'=>'page_create','slug'=>$input['slug'],'title'=>$input['title'],'content'=>$input['content'],'expected_hash'=>null];
        elseif($action==='delete')$intent=(object)['type'=>'delete','page_file'=>$path,'replacement_href'=>$input['replacementHref']??'#','expected_hash'=>$input['expected_content_sha256']];
        else{
            $values=array_diff_key($input,array_flip(['operation_id','base_draft_version','checkpoint','expected_content_sha256']));
            $intent=(object)['type'=>$action==='navigation'?'page_navigation':'page_update','page_file'=>$path,'expected_hash'=>$input['expected_content_sha256'],'values'=>(object)$values];
        }
        $operation=$this->structureChange($actor,$input,$intent);
        $result=['operation'=>$operation,'draft_version'=>$operation['after_version'],'updated_files'=>$operation['result']['changed_paths']??[],
            'page'=>null,'renamed'=>false,'old_slug'=>$slug,'suggested_prompt'=>null,'message'=>'The reviewed page change completed.'];
        $row=$this->db->queryOne('SELECT manifest_json,sealed_digest FROM agent_change_sets WHERE id=?',[$operation['result']['change_set_id']??null]);
        if($row){
            $manifest=json_decode($row['manifest_json'],true,64,JSON_THROW_ON_ERROR);
        if(!hash_equals($row['sealed_digest'],CanonicalJson::digest($manifest)))throw new OperationException('content_conflict','Retained structural review failed its integrity check.');
            $old=null;foreach($manifest['projection']['before']??[] as $page)if($page['slug']===$slug)$old=$page;
            foreach($manifest['projection']['after']??[] as $page)
                if(($old!==null&&$page['id']===$old['id'])||($action==='create'&&$page['slug']===$input['slug'])){$result['page']=$page;break;}
            $result['renamed']=$old!==null&&$result['page']!==null&&$old['slug']!==$result['page']['slug'];
        }
        return $result;
    }
    private static function requestId(string $id): string
    {
        JsonSchema::validate($id,ToolContracts::requestId());return 'studio_'.hash('sha256',$id);
    }
    private function run(OperationActor $actor,array $input,\stdClass $request,\Closure $prepare): array
    {
        // Compare the original typed intent before a replay, including when its
        // retained review has expired or an operation currently reserves the site.
        $previous=$this->db->queryOne('SELECT id FROM agent_operations WHERE actor_key=? AND operation_id=?',[$actor->identity(),$input['operation_id']]);
        if($previous){
            $operation=$this->operations->get($actor,$input['operation_id']);
            $review=$this->db->queryOne('SELECT request_digest FROM agent_change_sets WHERE id=?',[$operation['preparation_id']]);
            if(!$review||!hash_equals($review['request_digest'],CanonicalJson::digest($request)))throw new OperationException('idempotency_conflict','This operation identity belongs to different authoring input.');
            if(isset($input['checkpoint']))return $this->executor->continue($actor,$input['operation_id'],$input['checkpoint']);
            return OperationRunner::publicState($operation);
        }
        if(isset($input['checkpoint']))throw new OperationException('content_conflict','No retained operation exists for this continuation.');
        $review=$prepare();
        return $this->executor->apply($actor,(object)['operation_id'=>$input['operation_id'],'change_set_id'=>$review['change_set_id'],'digest'=>$review['digest']]);
    }
    /** Legacy UI labels derived solely from the retained exact projection. */
    public function structureResult(array $operation,string $page,array $intent): array
    {
        $data=['operation'=>$operation,'draft_version'=>$operation['after_version'],'updatedFiles'=>$operation['result']['changed_paths']??[],
            'message'=>$operation['status']==='succeeded'?'The reviewed website change completed.':'Applying the reviewed website change.','snapshotId'=>null];
        if($operation['status']!=='succeeded')return $data;
        $row=$this->db->queryOne('SELECT manifest_json,sealed_digest FROM agent_change_sets WHERE id=?',[$operation['result']['change_set_id']]);
        if(!$row)return $data;
        $manifest=json_decode($row['manifest_json'],true,64,JSON_THROW_ON_ERROR);
        if(!hash_equals($row['sealed_digest'],CanonicalJson::digest($manifest)))throw new OperationException('content_conflict','Retained structural review failed its integrity check.');
        $before=$manifest['projection']['before']??[];$after=$manifest['projection']['after']??[];
        $next=array_column($after,null,'id');$source=null;$moved=[];
        foreach($before as $old){
            if($old['file_path']===$page)$source=$old;
            $new=$next[$old['id']]??null;
            if($new&&$old['file_path']!==$new['file_path'])$moved[]=['oldFilePath'=>$old['file_path'],'newFilePath'=>$new['file_path'],'title'=>$new['title']];
        }
        if($source){$new=$next[$source['id']]??null;
            if($intent['type']==='url')$data+=['oldPageId'=>'page:'.$page,'pageSlug'=>$new['slug']??null,'oldPath'=>'/'.$source['slug'],'newPath'=>'/'.($new['slug']??''),'newPageId'=>'page:'.($new['file_path']??'')];
            if($intent['type']==='title')$data+=['status'=>'renamed','oldTitle'=>$source['title'],'newTitle'=>$new['title'],'pageSlug'=>$new['slug']];
            if($intent['type']==='delete')$data+=['deletedPage'=>['title'=>$source['title'],'slug'=>$source['slug'],'filePath'=>$page],'replacementHref'=>$intent['replacement_href']];
        }
        if($intent['type']==='move')$data+=['movedPages'=>$moved,'totalPagesMoved'=>count($moved)];
        // Derive presentation details only from hash-checked retained sources.
        // A replay must never inspect newer mutable draft bytes.
        $root=$this->store->stagingRoot($manifest['change_set_id']);
        $read=function(string $path,bool $original)use($root,$manifest):?string {
            $hash=$manifest[$original?'before':'after'][$path]??null;if($hash===null)return null;
            $changed=($manifest['before'][$path]??null)!==($manifest['after'][$path]??null);
            $location=SiteWorkspace::resolveWithin($root.($original&&$changed?'/before':'/draft'),$path);
            if(!is_file($location)||filesize($location)>ChangeSetValidator::MAX_FILE_BYTES)throw new OperationException('content_conflict','Retained structural source is missing or exceeds its byte limit.');
            $text=file_get_contents($location,false,null,0,ChangeSetValidator::MAX_FILE_BYTES+1);
            if($text===false||!hash_equals($hash,hash('sha256',$text)))throw new OperationException('content_conflict','Retained structural source failed its integrity check.');
            return $text;
        };
        $oldNavSource=$read('_partials/nav.php',true);$newNavSource=$read('_partials/nav.php',false);
        $oldNav=$oldNavSource===null?null:\VoxelSite\NavLinksParser::parse($oldNavSource);
        $newNav=$newNavSource===null?null:\VoxelSite\NavLinksParser::parse($newNavSource);
        $sourceHref=$source?($source['slug']==='index'?'/':'/'.$source['slug']):null;
        $oldPosition=$oldNav!==null&&$sourceHref!==null?\VoxelSite\NavLinksParser::findPosition($oldNav,$sourceHref):null;
        if($source&&$intent['type']==='title') {
            $data['navStatus']=$oldNavSource===null?'missing':($oldNav===null?'legacy':'canonical');
            $label=function(?array $entries)use(&$label,$sourceHref):?string{foreach($entries??[] as $entry){if($entry['href']===$sourceHref)return $entry['label'];if(isset($entry['children'])&&($found=$label($entry['children']))!==null)return $found;}return null;};
            $data['navLabelUpdated']=$label($oldNav)!==$label($newNav);
        }
        if($source&&$intent['type']==='nav_reorder') {
            $position=$newNav!==null?\VoxelSite\NavLinksParser::findPosition($newNav,$sourceHref):null;
            $data+=['pageId'=>'page:'.$page,'oldParentHref'=>$oldPosition['parentHref']??null,'oldIndex'=>$oldPosition['index']??null,
                'newParentHref'=>$position['parentHref']??null,'newIndex'=>$position['index']??null,'normalized'=>$oldNav===null];
        }
        if($source&&$intent['type']==='delete') {
            $removed=$oldNav===null?['removed'=>false,'promoted'=>0]:\VoxelSite\SiteStructureTransforms::remove($oldNav,$sourceHref);
            $data+=['navEntryRemoved'=>$removed['removed'],'navChildrenPromoted'=>$removed['promoted']];
        }
        if($intent['type']==='move') {
            foreach($data['movedPages'] as &$movedPage) {
                $oldHref='/'.substr($movedPage['oldFilePath'],0,-4);$newHref='/'.substr($movedPage['newFilePath'],0,-4);
                $movedPage['navRemoved']=$oldNav!==null&&\VoxelSite\NavLinksParser::isInNav($oldNav,$oldHref)
                    &&($newNav===null||!\VoxelSite\NavLinksParser::isInNav($newNav,$newHref));
            }unset($movedPage);
        }
        if($source&&in_array($intent['type'],['url','move','delete'],true)) {
            $map=[];foreach($moved as $move)$map[substr($move['oldFilePath'],0,-4)]=substr($move['newFilePath'],0,-4);
            $targets=$intent['type']==='delete'?[$source['slug']=>null]:$map;
            $references=[];$cleaned=[];$count=0;
            foreach($manifest['files'] as $entry) {
                $path=$entry['path'];if(($intent['type']==='delete'&&$path===$page)||!in_array(SitePathPolicy::type($path),['page','partial'],true)||$entry['before_hash']===null)continue;
                $text=$read($path,true);$hits=0;
                foreach(\VoxelSite\PageService::hrefAttributes($text) as $attribute) {
                    $route=\VoxelSite\PageService::resolveInternalRoute($attribute['href'],$path);
                    if($route!==null&&array_key_exists(ltrim($route,'/'),$targets))$hits++;
                }
                if($path==='_partials/nav.php'&&$oldNav!==null) {
                    $walk=function(array $entries)use(&$walk,&$hits,$targets):void{foreach($entries as $entry){if(array_key_exists(ltrim($entry['href'],'/'),$targets))$hits++;if(isset($entry['children']))$walk($entry['children']);}};$walk($oldNav);
                }
                if($hits){$references[]=['path'=>$path,'count'=>$hits];$count+=$hits;}
                if($intent['type']==='delete'&&\VoxelSite\PageService::removeReferencesFromSource($text,$path,$source['slug'],$intent['replacement_href'])!==$text)$cleaned[]=$path;
            }
            $data+=['affectedReferences'=>$references,'totalAffectedReferences'=>$count,'referenceCount'=>$count,'suggestedPrompt'=>null];
            if($intent['type']==='delete')$data+=['referencesCleanedUp'=>count($cleaned),'cleanedUpFiles'=>$cleaned];
        }
        return $data;
    }
    private function fileResult(string $path,array $input,array $operation): array
    {
        $row=$this->db->queryOne('SELECT manifest_json,sealed_digest FROM agent_change_sets WHERE id=?',[$operation['result']['change_set_id']??null]);
        try {$manifest=is_string($row['manifest_json']??null)?json_decode($row['manifest_json'],true,64,JSON_THROW_ON_ERROR):null;}
        catch(\JsonException){throw new OperationException('content_conflict','Retained file review failed its integrity check.');}
        if(($operation['status']==='succeeded'||$manifest!==null) && (!is_array($manifest)
            || !is_string($row['sealed_digest']??null) || !is_string($operation['result']['digest']??null)
            || !hash_equals($row['sealed_digest'],CanonicalJson::digest($manifest))
            || !hash_equals($row['sealed_digest'],$operation['result']['digest'])))
            throw new OperationException('content_conflict','Retained file review failed its integrity check.');
        $hash=$manifest['after'][$path]??null;
        return ['path'=>$path,'changed'=>in_array($path,$operation['result']['changed_paths']??[],true),
            'content_sha256'=>$hash,'draft_version'=>$operation['after_version'],'revision_id'=>$operation['result']['revision_id']??null,
            'tailwindCompiled'=>in_array('assets/css/tailwind.css',$operation['result']['changed_paths']??[],true),'file'=>null,'operation'=>$operation];
    }
}
