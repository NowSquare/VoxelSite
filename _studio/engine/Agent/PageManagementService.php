<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,SiteWorkspace,SiteMutationLock};

/** Bounded observational page reads and reviewed source/metadata changes. */
final class PageManagementService
{
    private SiteStructureService $structure;
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,ChangeSetService $changes)
    { $this->structure=new SiteStructureService($db,$policy,$workspace,$changes); }
    public static function valuesSchema(bool $navigation=false):array {
        $c=ToolContracts::class;
        $fields=['nav_label'=>$c::nullable(['type'=>'string','maxLength'=>200]),'nav_order'=>$c::nullable($c::integer(500)),
            'is_published'=>['type'=>'boolean'],'is_homepage'=>['type'=>'boolean']];
        if(!$navigation)$fields=['title'=>['type'=>'string','minLength'=>1,'maxLength'=>200],
            'slug'=>['type'=>'string','pattern'=>'^[a-z0-9]+(?:-[a-z0-9]+)*$','maxLength'=>80],
            'content'=>['type'=>'string','maxLength'=>1048576]]+$fields;
        return $c::object($fields,[])+['minProperties'=>1];
    }
    public static function intentSchemas():array {
        $c=ToolContracts::class;
        return [
            $c::object(['type'=>['const'=>'page_create'],'slug'=>['type'=>'string','pattern'=>'^[a-z0-9]+(?:-[a-z0-9]+)*$','maxLength'=>80],
                'title'=>['type'=>'string','minLength'=>1,'maxLength'=>200],'content'=>['type'=>'string','maxLength'=>1048576],'expected_hash'=>['type'=>'null']]),
            $c::object(['type'=>['const'=>'page_update'],'page_file'=>$c::path(),'expected_hash'=>$c::hash(),'values'=>self::valuesSchema()]),
            $c::object(['type'=>['const'=>'page_navigation'],'page_file'=>$c::path(),'expected_hash'=>$c::hash(),'values'=>self::valuesSchema(true)]),
            $c::object(['type'=>['const'=>'pages_reorder'],'order'=>['type'=>'array','minItems'=>1,'maxItems'=>500,'items'=>$c::text(240)]]),
        ];
    }
    public static function inputSchema(string $method):array {
        $c=ToolContracts::class;
        return match($method){
            'list'=>$c::object(['offset'=>$c::integer(500),'limit'=>['type'=>'integer','minimum'=>1,'maximum'=>100],'draft_version'=>$c::version()],[]),
            'read'=>$c::object(['slug'=>$c::text(240),'draft_version'=>$c::version()],['slug']),
            'seo_read'=>$c::object(['path'=>['enum'=>['_root/robots.txt','_root/llms.txt']],'draft_version'=>$c::version()],['path']),
            'prepare'=>SiteStructureService::inputSchema('prepare'),
            default=>throw new \InvalidArgumentException('Unknown page method.'),
        };
    }
    public static function pageSchema(bool $content=false):array {
        $c=ToolContracts::class;
        $fields=['id'=>$c::nullable($c::integer()),'slug'=>$c::text(240),'title'=>$c::text(1000),'description'=>$c::nullable($c::text(8192)),
            'file_path'=>$c::path(),'path'=>$c::path(),'page_type'=>$c::text(40),'nav_order'=>$c::nullable($c::integer(10000)),
            'nav_label'=>$c::nullable($c::text(1000)),'is_published'=>['type'=>'integer','enum'=>[0,1]],'is_homepage'=>['type'=>'integer','enum'=>[0,1]],
            'content_sha256'=>$c::hash(),'size'=>$c::integer(1048576),'modified'=>$c::nullable($c::text(80))];
        if($content)$fields['content']=['type'=>'string','maxLength'=>1048576];
        return $c::object($fields);
    }
    public static function outputSchema(string $method):array {
        $c=ToolContracts::class;
        return match($method){
            'list'=>$c::object(['pages'=>$c::list(self::pageSchema(),100),'total'=>$c::integer(500),'next_offset'=>$c::nullable($c::integer(500)),'draft_version'=>$c::version(),'provider_calls'=>['const'=>0]]),
            'read'=>$c::object(['page'=>self::pageSchema(true),'draft_version'=>$c::version(),'provider_calls'=>['const'=>0]]),
            'seo_read'=>$c::object(['path'=>['enum'=>['_root/robots.txt','_root/llms.txt']],'content'=>$c::nullable(['type'=>'string','maxLength'=>1048576]),
                'content_sha256'=>$c::nullable($c::hash()),'exists'=>['type'=>'boolean'],'draft_version'=>$c::version(),'provider_calls'=>['const'=>0]]),
            'prepare'=>$c::changeReview(),default=>throw new \InvalidArgumentException('Unknown page method.'),
        };
    }
    public function prepare(OperationActor $actor,\stdClass $input):array{return $this->structure->prepare($actor,$input);}
    public function seoRead(OperationActor $actor,\stdClass $input):array {
        JsonSchema::validate($input,self::inputSchema('seo_read'));$this->policy->require($actor,['site:read','files:read']);
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);$this->workspace->assertReady();
        if($this->workspace->status()['reservation_operation_id']!==null)throw new OperationException('operation_pending','Finish or recover the current website operation before reading overrides.');
        $version='draft:'.$this->workspace->status()['draft_version'];$this->version($input,$version,false);
        $absolute=$this->workspace->resolveDraft($input->path);$content=null;
        if(is_file($absolute)){
            if(filesize($absolute)>1048576)throw new OperationException('size_limit','SEO source exceeds 1 MiB.');
            $content=file_get_contents($absolute,false,null,0,1048577);
            if(!is_string($content)||strlen($content)>1048576||!mb_check_encoding($content,'UTF-8'))throw new OperationException('size_limit','SEO source must be bounded UTF-8 text.');
        }
        return $this->bounded(['path'=>$input->path,'content'=>$content,'content_sha256'=>$content===null?null:hash('sha256',$content),
            'exists'=>$content!==null,'draft_version'=>$version,'provider_calls'=>0],2097152);
    }
    public function list(OperationActor $actor,\stdClass $input):array {
        JsonSchema::validate($input,self::inputSchema('list'));[$pages,$sources,$version]=$this->snapshot($actor);
        $offset=$input->offset??0;$this->version($input,$version,$offset>0);
        if($offset>count($pages))throw new OperationException('invalid_schema','Page offset exceeds inventory.');
        $items=array_slice($pages,$offset,$input->limit??50);$next=$offset+count($items);
        return $this->bounded(['pages'=>$items,'total'=>count($pages),'next_offset'=>$next<count($pages)?$next:null,'draft_version'=>$version,'provider_calls'=>0]);
    }
    public function read(OperationActor $actor,\stdClass $input):array {
        JsonSchema::validate($input,self::inputSchema('read'));[$pages,$sources,$version]=$this->snapshot($actor);$this->version($input,$version,false);
        foreach($pages as $page)if($page['slug']===$input->slug){$page['content']=$sources[$page['file_path']];return $this->bounded(['page'=>$page,'draft_version'=>$version,'provider_calls'=>0],2097152);}
        throw new OperationException('not_found','Page not found.');
    }
    public function studioList(OperationActor $actor,array $query):array {
        [$pages,$sources,$version]=$this->snapshot($actor);$dir=trim((string)($query['dir']??''),'/');
        if($dir!==''&&!preg_match('~^[a-z0-9-]+(?:/[a-z0-9-]+)*$~D',$dir))throw new OperationException('invalid_path','Choose a relative page directory.');
        $directories=[];$items=[];
        foreach($pages as $page){$path=$page['file_path'];if($dir!==''&&!str_starts_with($path,$dir.'/'))continue;$relative=$dir===''?$path:substr($path,strlen($dir)+1);
            if(empty($query['flat'])&&str_contains($relative,'/')){$name=explode('/',$relative)[0];$directories[$name]=['name'=>$name,'path'=>($dir===''?'':$dir.'/').$name];continue;}$items[]=$page;}
        return $this->bounded(['pages'=>$items,'directories'=>array_values($directories),'current_dir'=>$dir,'draft_version'=>$version,'provider_calls'=>0]);
    }
    private function snapshot(OperationActor $actor):array {
        $this->policy->require($actor,['site:read','files:read']);$lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);$this->workspace->assertReady();
        if($this->workspace->status()['reservation_operation_id']!==null)throw new OperationException('operation_pending','Finish or recover the current website operation before reading pages.');
        $sources=WorkspaceFiles::read($this->workspace);$rows=$this->db->query('SELECT * FROM pages ORDER BY id LIMIT 501');
        if(count($rows)>500)throw new OperationException('size_limit','Page inventory exceeds 500 rows.');$byFile=array_column($rows,null,'file_path');$pages=[];
        foreach($sources as $path=>$content){if(SitePathPolicy::type($path)!=='page')continue;if(strlen($content)>1048576||!mb_check_encoding($content,'UTF-8'))throw new OperationException('size_limit','Page source exceeds the bounded UTF-8 read contract.');$row=$byFile[$path]??[];$slug=$row['slug']??substr($path,0,-4);
            $pages[]=['id'=>isset($row['id'])?(int)$row['id']:null,'slug'=>$slug,'title'=>$row['title']??ucfirst(str_replace('-',' ',basename($slug))),
                'description'=>$row['description']??null,'file_path'=>$path,'path'=>$path,'page_type'=>$row['page_type']??'page',
                'nav_order'=>isset($row['nav_order'])?(int)$row['nav_order']:null,'nav_label'=>$row['nav_label']??null,'is_published'=>(int)($row['is_published']??0),
                'is_homepage'=>(int)($row['is_homepage']??($path==='index.php'?1:0)),'content_sha256'=>hash('sha256',$content),'size'=>strlen($content),'modified'=>$row['updated_at']??null];}
        if(count($pages)>500)throw new OperationException('size_limit','Page inventory exceeds 500 files.');
        usort($pages,static fn($a,$b)=>($b['is_homepage']<=>$a['is_homepage'])?:(($a['nav_order']??PHP_INT_MAX)<=>($b['nav_order']??PHP_INT_MAX))?:strcmp($a['slug'],$b['slug']));
        return [$pages,$sources,'draft:'.$this->workspace->status()['draft_version']];
    }
    private function version(\stdClass $input,string $version,bool $required):void{if(($required&&!isset($input->draft_version))||(isset($input->draft_version)&&$input->draft_version!==$version))throw new OperationException('content_conflict','The page inventory changed. Start its read again.');}
    private function bounded(array $result,int $limit=524288):array{if(strlen(CanonicalJson::encode($result))>$limit)throw new OperationException('size_limit','Narrow the page read to fit its response budget.');return $result;}
}
