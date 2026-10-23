<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,FileManager,NavLinksParser,PageService,PatchExecutor,RegionScoper,SiteGraph,SiteGraphIndexer,SiteStructureTransforms,SiteWorkspace,SurfaceDiscovery};

/** Deterministic intent becomes exact retained bytes; no provider or live writes. */
final class SiteStructureService
{
    private FileManager $files;
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,private ChangeSetService $changes)
    { $this->files=new FileManager($db,$workspace); }

    public static function inputSchema(string $method): array
    {
        $c=ToolContracts::class;
        if ($method==='graph') return $c::object(['kind'=>['enum'=>['nodes','edges','warnings']], 'offset'=>$c::integer(10000),'limit'=>['type'=>'integer','minimum'=>1,'maximum'=>100],'version'=>$c::nullable($c::hash())],['kind']);
        if ($method==='blastRadius') return $c::object(['node_id'=>$c::text(300)]);
        if ($method==='discover') return $c::object(['category'=>['enum'=>['style','seo','navigation','content','structure']], 'scope'=>$c::text(300),'keywords'=>$c::list($c::text(80),20)]);
        if ($method!=='prepare') throw new \InvalidArgumentException('Unknown structural method.');
        $page=$c::object(['type'=>['const'=>'title'],'page_file'=>$c::path(),'title'=>['type'=>'string','minLength'=>1,'maxLength'=>200]]);
        $variants=[$page];
        $variants[]=$c::object(['type'=>['const'=>'url'],'page_file'=>$c::path(),'new_slug'=>['type'=>'string','pattern'=>'^[a-z0-9]+(?:-[a-z0-9]+)*$','maxLength'=>80]]);
        $variants[]=$c::object(['type'=>['const'=>'move'],'page_file'=>$c::path(),'target_parent'=>['type'=>'string','maxLength'=>80,'pattern'=>'^(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$'],'target_index'=>$c::nullable($c::integer(500))]);
        $variants[]=$c::object(['type'=>['const'=>'delete'],'page_file'=>$c::path(),'replacement_href'=>['type'=>'string','minLength'=>1,'maxLength'=>240],
            'expected_hash'=>$c::hash()],['type','page_file','replacement_href']);
        $variants[]=$c::object(['type'=>['const'=>'nav_visible'],'page_file'=>$c::path(),'visible'=>['type'=>'boolean']]);
        $variants[]=$c::object(['type'=>['const'=>'nav_reorder'],'page_file'=>$c::path(),'parent_href'=>$c::nullable($c::text(240)),'index'=>$c::integer(500)]);
        $variants[]=$c::object(['type'=>['const'=>'visual'],'edits'=>['type'=>'array','minItems'=>1,'maxItems'=>40,'items'=>$c::object([
            'path'=>$c::path(),'expected_hash'=>$c::hash(),'source_address'=>['type'=>'string','minLength'=>1,'maxLength'=>262144],
            'content_hash'=>$c::hash(),'replacement'=>['type'=>'string','maxLength'=>262144],
            'strategy'=>['enum'=>['token-edit','attribute-edit','line-replace','block-replace','block-insert','meta-edit','content-edit']],
        ])]]);
        $variants[]=$c::object(['type'=>['const'=>'seo_override'],'path'=>['enum'=>['_root/robots.txt','_root/llms.txt']],
            'expected_hash'=>$c::nullable($c::hash()),'content'=>$c::nullable(['type'=>'string','maxLength'=>1048576])]);
        $variants=array_merge($variants,PageManagementService::intentSchemas());
        return $c::object(['request_id'=>$c::requestId(),'base_draft_version'=>$c::version(),'intent'=>['oneOf'=>$variants]]);
    }
    public static function outputSchema(string $method): array
    {
        $c=ToolContracts::class;
        if ($method==='prepare') return $c::changeReview();
        // Graph metadata comes from bounded, non-executing core indexers. A page
        // carries a bounded list; continuation pins the complete inventory hash.
        $row=['type'=>'object','properties'=>[],'additionalProperties'=>true,'maxProperties'=>32];
        return match($method) {
            'graph'=>$c::object(['version'=>$c::hash(),'draft_version'=>$c::version(),'kind'=>['enum'=>['nodes','edges','warnings']],
                'items'=>$c::list($row,100),'total'=>$c::integer(10000),'next_offset'=>$c::nullable($c::integer(10000)),'provider_calls'=>['const'=>0]]),
            'blastRadius'=>$c::object(['version'=>$c::hash(),'draft_version'=>$c::version(),'node_id'=>$c::text(300),'affected_pages'=>$c::list($row,500),'provider_calls'=>['const'=>0]]),
            'discover'=>$c::object(['version'=>$c::hash(),'draft_version'=>$c::version(),'candidates'=>$c::list($row,24),'affected_pages'=>$c::list($row,500),
                'skipped'=>$c::list($row,500),'regions'=>$c::list($row,24),'provider_calls'=>['const'=>0]]),
            default=>throw new \InvalidArgumentException('Unknown structural method.'),
        };
    }
    public function graph(OperationActor $actor,\stdClass $input): array
    {
        JsonSchema::validate($input,self::inputSchema('graph'));
        [$graph,$version,$draft]=$this->inspect($actor);
        $offset=$input->offset??0;
        if (($input->version??null)!==null && $input->version!==$version || $offset>0 && ($input->version??null)!==$version) throw new OperationException('content_conflict','The graph changed. Start its inventory again.');
        $items=$graph->toArray()[$input->kind];
        if (count($items)>10000 || $offset>count($items)) throw new OperationException('size_limit','The graph exceeds its inspection budget or offset.');
        $page=array_slice($items,$offset,$input->limit??50);$next=$offset+count($page);
        return $this->bounded(['version'=>$version,'draft_version'=>$draft,'kind'=>$input->kind,'items'=>$page,'total'=>count($items),'next_offset'=>$next<count($items)?$next:null,'provider_calls'=>0]);
    }
    public function blastRadius(OperationActor $actor,\stdClass $input): array
    {
        JsonSchema::validate($input,self::inputSchema('blastRadius'));[$graph,$version,$draft]=$this->inspect($actor);
        if ($graph->getNode($input->node_id)===null) throw new OperationException('invalid_schema','Choose an exact node ID returned by graph inspection.');
        return $this->bounded(['version'=>$version,'draft_version'=>$draft,'node_id'=>$input->node_id,'affected_pages'=>$graph->getBlastRadius($input->node_id),'provider_calls'=>0]);
    }
    public function discover(OperationActor $actor,\stdClass $input): array
    {
        JsonSchema::validate($input,self::inputSchema('discover'));[$graph,$version,$draft,$snapshotFiles]=$this->inspect($actor);
        $found=(new SurfaceDiscovery($graph))->discover((array)$input);
        if ($found['clarification_required']??false) throw new OperationException('invalid_schema',$found['message']);
        try {$regions=(new RegionScoper($snapshotFiles))->scope($found['candidates'],(array)$input);}
        catch (\RuntimeException $e) {throw new OperationException('size_limit',$e->getMessage());}
        foreach ($regions as &$region) unset($region['source_content']);unset($region);
        $this->assertInspection($version,$draft);
        return $this->bounded(['version'=>$version,'draft_version'=>$draft,'candidates'=>$found['candidates'],'affected_pages'=>$found['affected_pages'],'skipped'=>$found['skipped'],'regions'=>$regions,'provider_calls'=>0]);
    }
    public function prepare(OperationActor $actor,\stdClass $input): array
    {
        JsonSchema::validate($input,self::inputSchema('prepare'));
        $this->policy->require($actor,['site:read','files:read','files:write','changes:apply','structure:write']);
        $request=(object)['request_id'=>$input->request_id,'base_draft_version'=>$input->base_draft_version,'brief_id'=>'structure:v1',
            'summary'=>'Reviewed site structure: '.$input->intent->type,'intent'=>$input->intent];
        return $this->changes->prepareTrusted($actor,$request,fn(array $before)=>$this->plan($before,$input->intent));
    }
    private function plan(array $before,\stdClass $intent,?array $pageState=null): array
    {
        if(in_array($intent->type,['page_create','page_update','page_navigation','pages_reorder'],true))
            return PageProjectionPlanner::plan($this->db,$before,$intent,fn($sources,$step,$pages)=>$this->plan($sources,$step,$pages));
        $after=$before;$projection=null;
        if ($intent->type==='seo_override') {
            $hash=isset($before[$intent->path])?hash('sha256',$before[$intent->path]):null;
            if ($hash!==$intent->expected_hash) throw new OperationException('content_conflict','The SEO override changed. Read its current hash first.');
            if ($intent->content===null) unset($after[$intent->path]);else $after[$intent->path]=$intent->content;
        } elseif ($intent->type==='visual') {
            $group=[];
            foreach ($intent->edits as $edit) {
                $path=SitePathPolicy::canonical($edit->path,true);
                if (!in_array(SitePathPolicy::type($path),['page','partial','css','js'],true)) throw new OperationException('invalid_path','Visual edits target page, partial, CSS or JavaScript source.');
                if (!isset($before[$path]) || hash('sha256',$before[$path])!==$edit->expected_hash
                    || hash('sha256',$edit->source_address)!==$edit->content_hash) throw new OperationException('content_conflict','The selected source address changed. Read the current file and use an explicit hash-anchored edit.',['path'=>$path]);
                $group[$path][]=['before_snippet'=>$edit->source_address,'after_snippet'=>$edit->replacement,'strategy'=>$edit->strategy];
            }
            foreach ($group as $path=>$edits) {
                try {$after[$path]=PatchExecutor::prepareSource($path,$before[$path],$edits);}
                catch (\RuntimeException $e) {throw new OperationException('content_conflict',$e->getMessage().' Read current source; do not guess a selector match.');}
            }
        } else {
            $pages=$pageState??$this->db->query('SELECT * FROM pages ORDER BY id');$original=$pages;
            $byFile=[];foreach ($pages as $index=>$page) $byFile[$page['file_path']]=$index;
            foreach ($before as $path=>$source) if (SitePathPolicy::type($path)==='page' && !isset($byFile[$path])) throw new OperationException('content_conflict','The page registry needs Studio reconciliation before structural editing.',['path'=>$path]);
            $index=$byFile[$intent->page_file]??null;
            if ($index===null || !isset($before[$intent->page_file])) throw new OperationException('invalid_path','Choose an existing page file from the graph.');
            $page=$pages[$index];$slug=$page['slug'];$href=$slug==='index'?'/':'/'.$slug;
            if(isset($intent->expected_hash)&&hash('sha256',$before[$intent->page_file])!==$intent->expected_hash)
                throw new OperationException('content_conflict','The page source changed after it was displayed.');
            if (($page['is_homepage'] || $page['file_path']==='index.php') && $intent->type!=='title') throw new OperationException('invalid_schema','The homepage cannot be moved, renamed, hidden or deleted.');
            $navSource=$after['_partials/nav.php']??'';$nav=NavLinksParser::parse($navSource);
            if (in_array($intent->type,['url','move','delete'],true)) {
                $graph=(new SiteGraphIndexer($this->db,$this->snapshotFiles($before),false))->buildGraph();
                if ($graph->toArray()['warnings']) throw new OperationException('invalid_schema','Some includes or links cannot be resolved safely. Review these source files before changing routes.',['warnings'=>$graph->toArray()['warnings']]);
                if ($nav===null) {
                    // Deleting an unlisted page does not require rewriting legacy
                    // navigation. Any literal or canonical reference still blocks.
                    $safeLegacyDelete=$intent->type==='delete'&&$navSource!==''&&!NavLinksParser::hasNavLinksBlock($navSource)
                        &&PageService::removeReferencesFromSource($navSource,'_partials/nav.php',$slug,'#')===$navSource;
                    if(!$safeLegacyDelete)throw new OperationException('invalid_schema','Normalize the navigation before changing routes.');
                }
            }
            switch ($intent->type) {
                case 'title':
                    if (trim($intent->title)==='' || preg_match('/[\x00-\x1f\x7f]/',$intent->title)) throw new OperationException('invalid_schema','Use a nonempty page title without control characters.');
                    if ($intent->title===$page['title']) throw new OperationException('invalid_schema','The page already has this title.');
                    $after[$page['file_path']]=PageService::updatePhpMeta($before[$page['file_path']],$intent->title,$slug);
                    $pages[$index]['title']=$intent->title;
                    if ($nav!==null) {
                        $walk=function(array $entries) use (&$walk,$href,$page,$intent,&$pages,$index):array {
                            foreach ($entries as &$entry) {
                                if ($entry['href']===$href && $entry['label']===$page['title']) {
                                    $entry['label']=$intent->title;$pages[$index]['nav_label']=$intent->title;
                                }
                                if (isset($entry['children'])) $entry['children']=$walk($entry['children']);
                            }unset($entry);return $entries;
                        };$nav=$walk($nav);
                    }
                    break;
                case 'url': case 'move':
                    $parent=dirname($slug)==='.'?'':dirname($slug);
                    $newSlug=$intent->type==='url'?($parent===''?'':$parent.'/').$intent->new_slug:($intent->target_parent===''?'':$intent->target_parent.'/').basename($slug);
                    if ($newSlug===$slug) throw new OperationException('invalid_schema','This page already uses that route.');
                    if ($intent->type==='move' && $intent->target_parent!=='') {
                        $targets=array_values(array_filter($pages,fn($p)=>$p['slug']===$intent->target_parent && !$p['is_homepage']));
                        if (!$targets || $intent->target_parent===$slug) throw new OperationException('invalid_schema','Choose a different existing root page as the target parent.');
                    }
                    $map=[];$moves=[];
                    foreach ($before as $file=>$source) if (SitePathPolicy::type($file)==='page' && ($file===$page['file_path'] || ($intent->type==='move' && str_starts_with($file,$slug.'/')))) {
                        $old=substr($file,0,-4);$new=$newSlug.substr($old,strlen($slug));$newFile=$new.'.php';SitePathPolicy::canonical($newFile,true);
                        if (isset($before[$newFile])) throw new OperationException('content_conflict','The target page already exists.',['path'=>$newFile]);
                        $map[$old]=$new;$moves[$file]=$newFile;
                        $rowIndex=$byFile[$file];$pages[$rowIndex]['slug']=$new;$pages[$rowIndex]['file_path']=$newFile;
                        $after[$newFile]=PageService::rebasePageIncludes(PageService::updatePhpMeta($source,$pages[$rowIndex]['title'],$new),$file,$newFile);unset($after[$file]);
                    }
                    foreach ($after as $file=>$source) if (in_array(SitePathPolicy::type($file),['page','partial'],true)) $after[$file]=PageService::batchRewriteSlugReferences($source,$map,$file);
                    $navSource=$after['_partials/nav.php'];$nav=NavLinksParser::parse($navSource);
                    if ($intent->type==='move') {
                        foreach ($map as $old=>$new) {
                            if (substr_count($new,'/')>1) $nav=SiteStructureTransforms::remove($nav,'/'.$new)['navLinks'];
                            else $nav=SiteStructureTransforms::relocate($nav,'/'.$new,'/'.$new,str_contains($new,'/')?'/'.dirname($new):null)['navLinks'];
                        }
                        if ($intent->target_index!==null && NavLinksParser::isInNav($nav,'/'.$newSlug)) $nav=$this->reorder($nav,'/'.$newSlug,str_contains($newSlug,'/')?'/'.dirname($newSlug):null,$intent->target_index);
                    }
                    break;
                case 'delete':
                    if ($intent->replacement_href!=='#' && (!preg_match('~^/(?!/)[^\x00-\x20\x7f\'"<>\\\\]*$~D',$intent->replacement_href))) throw new OperationException('invalid_schema','Use # or an application-relative replacement href.');
                    if ($intent->replacement_href!=='#') {
                        $route=PageService::resolveInternalRoute($intent->replacement_href);
                        $found=array_filter($pages,fn($p)=>($p['slug']==='index'?'/':'/'.$p['slug'])===$route && $p['id']!==$page['id']);
                        if (!$found) throw new OperationException('invalid_schema','The replacement link must resolve to a surviving page.');
                    }
                    unset($after[$page['file_path']]);array_splice($pages,$index,1);
                    if($nav!==null){$nav=SiteStructureTransforms::remove($nav,$href)['navLinks'];
                        $after['_partials/nav.php']=$this->navSource($navSource,$nav);}
                    foreach ($after as $file=>$source) if (in_array(SitePathPolicy::type($file),['page','partial'],true)) $after[$file]=PageService::removeReferencesFromSource($source,$file,$slug,$intent->replacement_href);
                    $navSource=$after['_partials/nav.php'];
                    break;
                case 'nav_visible': case 'nav_reorder':
                    if ($nav===null) {
                        if (NavLinksParser::hasNavLinksBlock($navSource) || NavLinksParser::checkLayoutCompatibility($navSource)!==null || ($nav=NavLinksParser::extractFromLegacyNav($navSource))===null) throw new OperationException('invalid_schema','Navigation cannot be normalized safely.');
                        $navSource=NavLinksParser::normalizeFileContent($navSource,$nav);
                        if (!is_string($navSource)) throw new OperationException('invalid_schema','Navigation normalization failed.');
                    }
                    if ($intent->type==='nav_reorder') $nav=$this->reorder($nav,$href,$intent->parent_href,$intent->index);
                    elseif (!$intent->visible) $nav=SiteStructureTransforms::remove($nav,$href)['navLinks'];
                    elseif (!NavLinksParser::isInNav($nav,$href)) {
                        if (substr_count($slug,'/')>1) throw new OperationException('invalid_schema','Navigation supports root pages and one child level.');
                        $entry=['label'=>$page['nav_label']?:$page['title'],'href'=>$href];
                        if (!str_contains($slug,'/')) $nav[]=$entry;
                        else {
                            $found=false;foreach ($nav as &$parentEntry) if ($parentEntry['href']==='/'.dirname($slug)) {$parentEntry['children'][]=$entry;$found=true;}unset($parentEntry);
                            if (!$found) throw new OperationException('invalid_schema','Show the parent page before adding its child to navigation.');
                        }
                    }
                    break;
            }
            if ($nav!==null) $after['_partials/nav.php']=$this->navSource($navSource,$nav);
            $pages=$this->projectNavigation($pages,$nav);
            $projection=['before'=>$original,'after'=>$pages,
                'before_collections'=>$this->db->query('SELECT id, index_page_id FROM collections ORDER BY id')];
        }
        $ops=[];
        foreach (array_unique(array_merge(array_keys($before),array_keys($after))) as $path) {
            if (($before[$path]??null)===($after[$path]??null)) continue;
            $op=(object)['type'=>!isset($before[$path])?'create':(!isset($after[$path])?'delete':'replace'),'path'=>$path,'expected_hash'=>isset($before[$path])?hash('sha256',$before[$path]):null];
            if (isset($after[$path])) $op->content=$after[$path];$ops[]=$op;
        }
        if (!$ops) throw new OperationException('invalid_schema','This intent has no effect on the current source.');
        return ['operations'=>$ops,'projection'=>$projection];
    }
    private function reorder(array $nav,string $href,?string $parent,int $index): array
    {
        $position=NavLinksParser::findPosition($nav,$href);
        if (!$position) throw new OperationException('invalid_schema','Show the page in navigation before moving it.');
        if ($parent!==null && ($parent==='/' || $parent===$href || !NavLinksParser::isInNav($nav,$parent) || NavLinksParser::isNested($nav,$parent) || NavLinksParser::hasChildren($nav,$href))) throw new OperationException('invalid_schema','Choose a different root navigation parent; nested parents and moving parents with children are unsupported.');
        $count=count($nav)-(NavLinksParser::hasHomeEntry($nav)?1:0);
        if ($parent!==null) foreach ($nav as $entry) if ($entry['href']===$parent) $count=count($entry['children']??[]);
        if ($position['parentHref']===$parent) $count--;
        if ($index>$count) throw new OperationException('invalid_schema','The requested navigation index is outside its sibling list.');
        return NavLinksParser::applyMove($nav,$href,$parent,$index);
    }
    private function navSource(string $source,array $nav): string
    {
        $result=NavLinksParser::replaceNavBlock($source,NavLinksParser::serialize($nav));
        if ($result===null) throw new OperationException('invalid_schema','Cannot rewrite the exact canonical navigation block.');return $result;
    }
    private function projectNavigation(array $pages,?array $nav): array
    {
        if ($nav===null) return $pages;
        foreach ($pages as &$page) if ($page['page_type']==='page') {$page['nav_order']=null;$page['nav_parent_id']=null;}unset($page);
        $bySlug=[];foreach ($pages as $i=>$page) $bySlug[$page['slug']]=$i;
        $order=1;
        foreach ($nav as $entry) {
            if (!empty($entry['home'])) continue;
            $slug=ltrim(PageService::resolveInternalRoute($entry['href'])??'', '/');$i=$bySlug[$slug]??null;
            if ($i===null) continue;$pages[$i]['nav_order']=$order++;$childOrder=1;
            foreach ($entry['children']??[] as $child) {
                $j=$bySlug[ltrim(PageService::resolveInternalRoute($child['href'])??'','/')]??null;
                if ($j!==null) {$pages[$j]['nav_order']=$childOrder++;$pages[$j]['nav_parent_id']=$pages[$i]['id'];}
            }
        }
        return array_values($pages);
    }
    private function inspect(OperationActor $actor): array
    {
        $this->policy->require($actor,['site:read','files:read']);$this->workspace->assertReady();
        if ($this->workspace->status()['reservation_operation_id']!==null) throw new OperationException('operation_pending','Finish or recover the current operation before inspecting the graph.');
        $draft='draft:'.$this->workspace->status()['draft_version'];$sources=WorkspaceFiles::read($this->workspace);$version=$this->inspectionDigest($sources);
        $snapshotFiles=$this->snapshotFiles($sources);
        $graph=(new SiteGraphIndexer($this->db,$snapshotFiles,false))->buildGraph();$this->assertInspection($version,$draft);
        return [$graph,$version,$draft,$snapshotFiles];
    }
    private function inspectionDigest(?array $sources=null): string
    {
        $sources??=WorkspaceFiles::read($this->workspace);
        $sources=array_filter($sources,static fn($path)=>in_array(SitePathPolicy::type($path),['page','partial','css','js'],true),ARRAY_FILTER_USE_KEY);
        return CanonicalJson::digest(['files'=>WorkspaceFiles::hashes($sources),'pages'=>$this->db->query('SELECT * FROM pages ORDER BY id')]);
    }
    /** Indexers and scopers consume one bounded capture, never reopen growing files. */
    private function snapshotFiles(array $sources): FileManager
    {
        return new class($this->db,$this->workspace,$sources) extends FileManager {
            public function __construct(Database $db,SiteWorkspace $workspace,private array $sources) {parent::__construct($db,$workspace);}
            public function readFile(string $relativePath): ?string {return $this->sources[$relativePath]??null;}
            public function listPartialFiles(): array {
                $rows=[];foreach ($this->sources as $path=>$source) if (SitePathPolicy::type($path)==='partial') $rows[]=['path'=>$path,'name'=>pathinfo($path,PATHINFO_FILENAME)];
                return $rows;
            }
        };
    }
    private function assertInspection(string $version,string $draft): void
    {if ($draft!=='draft:'.$this->workspace->status()['draft_version'] || $version!==$this->inspectionDigest()) throw new OperationException('content_conflict','The source changed during inspection. Read it again.');}
    private function bounded(array $result): array
    {if (strlen(CanonicalJson::encode($result))>196608) throw new OperationException('size_limit','Narrow this inspection or use fewer graph items.');return $result;}
}
