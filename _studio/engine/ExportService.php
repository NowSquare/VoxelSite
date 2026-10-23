<?php
declare(strict_types=1);
namespace VoxelSite;
use VoxelSite\Agent\{ActorPolicy,CanonicalJson,DownloadGrantStore,JsonSchema,OperationActor,OperationException,ProviderCallPolicy,PublishPlanService,SitePathPolicy,ToolContracts,WorkspaceFiles};

/** Shared portable archive preparation. All source and output bytes are retained before review. */
final class ExportService
{
    public const MAX_FILES=700;
    public const MAX_BYTES=41943040;
    private float $started=0;
    private float $seconds=10;
    private int $budget=self::MAX_BYTES;
    private array $outputSizes=[];
    private int $outputBytes=0;

    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,
        private DownloadGrantStore $store,private PublishPlanService $publisher) {}

    public static function inputSchema(string $method):array
    {
        $id=['export_id'=>ToolContracts::id('export')];
        return match($method) {
            'prepare'=>ToolContracts::object(['request_id'=>ToolContracts::requestId(),'source'=>['enum'=>['draft','published']],
                'version'=>['type'=>'string','pattern'=>'^(draft:[0-9]+|release_[a-f0-9]{32}|legacy:[a-f0-9]{64})$'],'format'=>['enum'=>['php','html']]]),
            'create'=>ToolContracts::object($id+['digest'=>ToolContracts::hash(),'operation_id'=>ToolContracts::requestId()]),
            'status','download'=>ToolContracts::object($id),
            default=>throw new \InvalidArgumentException('Unknown export method.'),
        };
    }
    public static function outputSchema(string $method):array
    {
        if($method==='download')return ToolContracts::object(['export_id'=>ToolContracts::id('export'),'download_url'=>ToolContracts::text(2048),
            'expires_at'=>ToolContracts::integer(),'sha256'=>ToolContracts::hash(),'single_use'=>['const'=>true],'provider_calls'=>['const'=>0]]);
        return ToolContracts::object([
            'export_id'=>ToolContracts::id('export'),'status'=>['enum'=>['ready','created']],
            'operation_id'=>ToolContracts::nullable(ToolContracts::requestId()),'source'=>['enum'=>['draft','published']],
            'version'=>ToolContracts::text(100),'format'=>['enum'=>['php','html']],'digest'=>ToolContracts::hash(),
            'source_digest'=>ToolContracts::hash(),'archive_sha256'=>ToolContracts::hash(),'archive_bytes'=>ToolContracts::integer(DownloadGrantStore::MAX_ARCHIVE_BYTES),
            'uncompressed_bytes'=>ToolContracts::integer(self::MAX_BYTES),'file_count'=>ToolContracts::integer(self::MAX_FILES),
            'files'=>ToolContracts::list(ToolContracts::object(['path'=>ToolContracts::path(),'bytes'=>ToolContracts::integer(self::MAX_BYTES),'sha256'=>ToolContracts::hash()]),self::MAX_FILES),
            'expires_at'=>ToolContracts::integer(),'provider_calls'=>['const'=>0],
            'dependencies'=>ToolContracts::object(['php'=>['type'=>'boolean'],'forms'=>ToolContracts::text(400),'actions'=>ToolContracts::text(400),
                'studio_mcp'=>['const'=>false],'public_mcp'=>['enum'=>['read_only','omitted']],
                'remote_urls'=>ToolContracts::list(ToolContracts::text(2048),200),'not_run'=>ToolContracts::list(ToolContracts::text(200),10)]),
            'limits'=>ToolContracts::object(['max_files'=>ToolContracts::integer(self::MAX_FILES),'max_uncompressed_bytes'=>ToolContracts::integer(self::MAX_BYTES),
                'max_archive_bytes'=>ToolContracts::integer(DownloadGrantStore::MAX_ARCHIVE_BYTES),'preparation_seconds'=>ToolContracts::integer(10)]),
        ]);
    }

    /** Trusted adapter helper; callers must authorize before presenting this value. */
    public function currentVersion(string $source):string
    {
        $state=$this->workspace->status();
        if($source==='draft')return 'draft:'.$state['draft_version'];
        if($source!=='published')throw new OperationException('invalid_schema','Choose draft or published source.');
        $manifest=$this->publisher->publishedManifest();
        return $state['release_id']??'legacy:'.CanonicalJson::digest($this->publisher->publishedHashes(array_keys($manifest)));
    }

    /** Pure Studio review; the later POST must carry this exact displayed version. */
    public function studioStatus(OperationActor $actor): array
    {
        $this->policy->require($actor, DownloadGrantStore::SCOPES);
        $lock = SiteMutationLock::acquire($this->workspace->mutationLockPath(), $this->db);
        $this->workspace->assertReady();
        return ['version' => $this->currentVersion('published'), 'source' => 'published', 'provider_calls' => 0];
    }

    /** Studio projects its explicit selection into the shared retained export contract. */
    public function createStudio(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, ToolContracts::object([
            'operation_id' => ToolContracts::requestId(),
            'version' => ['type' => 'string', 'pattern' => '^(release_[a-f0-9]{32}|legacy:[a-f0-9]{64})$'],
            'format' => ['enum' => ['php', 'html']],
        ]));
        $review = $this->prepare($actor, (object)['request_id' => $input->operation_id,
            'source' => 'published', 'version' => $input->version, 'format' => $input->format]);
        return $this->create($actor, (object)['export_id' => $review['export_id'],
            'digest' => $review['digest'], 'operation_id' => $input->operation_id]);
    }

    public function prepare(OperationActor $actor,\stdClass $input):array
    {
        return ProviderCallPolicy::runExternal(function()use($actor,$input):array {
            $this->policy->require($actor,DownloadGrantStore::SCOPES);JsonSchema::validate($input,self::inputSchema('prepare'));
            $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);
            $this->workspace->assertReady();$this->hostBudget();$this->store->pruneExpired();
            $row=$this->store->reserve($actor,(array)$input);
            if($row['status']!=='preparing')return $this->present($row);
            if($input->version!==$this->currentVersion($input->source))throw new OperationException('content_conflict','The source version changed. Prepare a new export review.');
            $paths=$this->sourcePaths($input->source);$estimated=0;
            foreach($paths as $path=>$absolute) {
                $stat=lstat($absolute);if(!$stat || !is_file($absolute))throw new OperationException('content_conflict','A managed export source is missing.',['path'=>$path]);
                $estimated+=$stat['size'];
                if($estimated>$this->budget || count($paths)>self::MAX_FILES-8)throw new OperationException('host_capability_unavailable','The export exceeds this host’s bounded preparation budget.');
            }
            if($input->format==='html' && ($estimated>WorkspaceFiles::MAX_BYTES || count($paths)>WorkspaceFiles::MAX_FILES))throw new OperationException('host_capability_unavailable','Static rendering exceeds the qualified 500-file, 32 MiB preview budget.');
            $root=$this->store->stage($row['id'],true);
            foreach(['source','output'] as $dir)if(is_dir($root.'/'.$dir))DownloadGrantStore::removeTree($root.'/'.$dir);
            $zipPath=SiteWorkspace::resolveWithin($root,'site.zip');if(is_file($zipPath))unlink($zipPath);
            $this->outputSizes=[];$this->outputBytes=0;
            $source=$root.'/source';$output=$root.'/output';mkdir($source.'/assets',0700,true);mkdir($output,0700,true);
            WorkspaceFiles::write($source,'.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
            $hashes=[];$bytes=0;$remote=[];$immutable=[];$hasForms=false;$hasActions=false;$aliases=$this->iconAliases();
            $expected=$input->source==='published'?$this->publisher->publishedManifest():[];
            foreach($paths as $path=>$absolute) {
                $this->tick();$content=$this->read($absolute,$this->budget-$bytes);$bytes+=strlen($content);$hashes[$path]=hash('sha256',$content);
                if(isset($expected[$path]) && !hash_equals($expected[$path],$hashes[$path]))throw new OperationException('content_conflict','Published bytes differ from the managed release.',['path'=>$path]);
                if(str_starts_with($path,'assets/forms/'))$hasForms=true;
                if($this->textPath($path)) {
                    $offset=0;
                    while(preg_match('~https?://[^\s<>"\x27\\\\)]+~u',$content,$match,PREG_OFFSET_CAPTURE,$offset)) {
                        $url=$match[0][0];$offset=$match[0][1]+strlen($url);
                        if(strlen($url)>2048)throw new OperationException('size_limit','A remote dependency URL exceeds its limit.');
                        $remote[$url]=true;if(count($remote)>200)throw new OperationException('size_limit','This archive has too many remote dependencies.');
                    }
                    $offset=0;
                    while(preg_match('~(?:/|\\b)(assets/(?:library|icons)/[A-Za-z0-9_./-]+\\.(?:avif|webp|jpe?g|png|gif|svg))~i',$content,$match,PREG_OFFSET_CAPTURE,$offset)) {
                        $offset=$match[0][1]+strlen($match[0][0]);$immutable[$match[1][0]]=true;
                        if(count($immutable)+count($paths)>self::MAX_FILES-8)throw new OperationException('size_limit','Referenced assets exceed the portable archive inventory budget.');
                    }
                    $offset=0;
                    while(str_ends_with($path,'.php') && preg_match('~\bdata-lucide\s*=\s*["\']([A-Za-z0-9_-]{1,80})["\']~i',$content,$match,PREG_OFFSET_CAPTURE,$offset)) {
                        $offset=$match[0][1]+strlen($match[0][0]);$name=str_replace('_','-',strtolower($match[1][0]));$name=$aliases[$name]??$name;
                        $immutable['assets/icons/'.$name.'.svg']=true;
                        if(count($immutable)+count($paths)>self::MAX_FILES-8)throw new OperationException('size_limit','Referenced icons exceed the portable archive inventory budget.');
                    }
                    $hasActions=$hasActions || str_contains($content,'actions-bar.') || str_contains($content,'actions-submit.php');
                    $content=self::stripActions($content);
                }
                if (self::publicRootOutput($path)) $this->emit($output,$path,$content);
                else WorkspaceFiles::write($source,$path,$content);
            }
            foreach(array_keys($immutable) as $path) {
                if(isset($paths[$path]))continue;SitePathPolicy::canonical($path);$this->tick();
                $content=$this->read($this->workspace->resolveDraft($path),$this->budget-$bytes);$bytes+=strlen($content);
                $hashes[$path]=hash('sha256',$content);$this->emit($output,$path,$content);
            }
            if(!isset($paths['index.php']))throw new OperationException('invalid_schema','The selected source has no managed homepage.');
            $clone=new SiteWorkspace($this->db,$source,$this->workspace->publishedRoot(),$root.'/state',$this->workspace->publishedAssetsRoot(),tracksDraftVersion:false);
            $renderer=new PreviewRenderer($clone);$pages=array_keys(array_filter($paths,static fn($unused,$path)=>SitePathPolicy::type($path)==='page',ARRAY_FILTER_USE_BOTH));
            foreach($paths as $path=>$absolute) {
                $this->tick();$kind=SitePathPolicy::type($path);
                if (self::publicRootOutput($path)) continue;
                if($input->format==='html' && $kind==='partial')continue;
                if($input->format==='html' && $kind==='page') {
                    $render=$renderer->renderPortable($path);
                    if(!$render['rendered'])throw new OperationException('render_failed','A page could not be rendered for static export.',['path'=>$path,'diagnostics'=>$render['diagnostics']]);
                    $content=$this->inlinePortableIcons(self::rewriteStatic($render['content'],$path,$pages),$output,$aliases);
                    $target=substr($path,0,-4).'.html';
                }else{$content=$this->read(SiteWorkspace::resolveWithin($source,$path),$this->budget);$target=str_starts_with($path,'_root/')?substr($path,6):$path;
                    if($input->format==='html' && str_ends_with($path,'.css'))$content=self::rewriteCssAssets($content,$path);
                }
                $this->emit($output,$target,$content);
            }
            if($hasForms) {
                $this->emit($output,'submit.php',$this->shipped('submit-standalone.php'));
                $this->emit($output,'_submissions/.htaccess',"Require all denied\nDeny from all\n");
            }
            $publicMcp=$input->format==='php' && isset($paths['assets/data/site.json']);
            if($publicMcp)$this->emit($output,'mcp.php',$this->shipped('mcp-standalone.php'));
            $this->emit($output,'.htaccess',self::htaccess($input->format));
            $dependencies=['php'=>$input->format==='php' || $hasForms,
                'forms'=>$hasForms?'Standalone submit.php requires PHP 8.2+, writable _submissions and optional host mail(). No Studio inbox, file uploads or Studio rate limiting.':'No managed form schemas included.',
                'actions'=>$hasActions?'Action execution requires the original Studio installation. Action bar scripts are removed; custom Action controls require adaptation.':'Studio Action execution is not included.',
                'studio_mcp'=>false,'public_mcp'=>$publicMcp?'read_only':'omitted','remote_urls'=>array_keys($remote),
                'not_run'=>['Target-host deployment','Visual QA','Mail delivery','External dependency availability','Client-side dynamic URLs and runtime-generated icon names']];
            sort($dependencies['remote_urls'],SORT_STRING);
            $this->emit($output,'EXPORT-README.txt',"VoxelSite portable website\n\nSource: {$input->source} {$input->version}\nFormat: {$input->format}\n\n".
                ($input->format==='php'?"Host pages on PHP 8.2+. Apache clean URLs require mod_rewrite.\n":"Pages are static HTML. Forms still need the included PHP fallback on a PHP host.\n").
                $dependencies['forms']."\n".$dependencies['actions']."\nStudio management MCP, credentials, private submissions and editing tools are not included.\nPublic MCP: ".$dependencies['public_mcp'].".\nRemote URLs are preserved and not downloaded; review external hosting and licensing.\n".implode("\n",$dependencies['remote_urls'])."\n");
            $files=$this->archive($output,$zipPath);$uncompressed=array_sum(array_column($files,'bytes'));
            $archive=$this->hashArchive($zipPath);ksort($hashes,SORT_STRING);
            // Cooperating writers are locked; detect outside edits as well before sealing.
            if($input->version!==$this->currentVersion($input->source))throw new OperationException('content_conflict','Source changed while preparing the export.');
            foreach($paths as $path=>$absolute)if(!hash_equals($hashes[$path],hash('sha256',$this->read($absolute,$this->budget))))throw new OperationException('content_conflict','Source bytes changed during export.',['path'=>$path]);
            $this->policy->require($actor,DownloadGrantStore::SCOPES);$this->tick();
            $manifest=['source'=>$input->source,'version'=>$input->version,'format'=>$input->format,'source_hashes'=>$hashes,'files'=>$files,
                'archive_sha256'=>$archive['sha256'],'archive_bytes'=>$archive['bytes'],'uncompressed_bytes'=>$uncompressed,'dependencies'=>$dependencies];
            $payload=['export_id'=>$row['id'],'status'=>'ready','operation_id'=>null,'source'=>$input->source,'version'=>$input->version,'format'=>$input->format,
                'source_digest'=>CanonicalJson::digest($hashes),'archive_sha256'=>$archive['sha256'],'archive_bytes'=>$archive['bytes'],
                'uncompressed_bytes'=>$uncompressed,'file_count'=>count($files),'files'=>$files,'expires_at'=>(int)$row['expires_at'],'provider_calls'=>0,
                'dependencies'=>$dependencies,'limits'=>['max_files'=>self::MAX_FILES,'max_uncompressed_bytes'=>$this->budget,
                    'max_archive_bytes'=>DownloadGrantStore::MAX_ARCHIVE_BYTES,'preparation_seconds'=>(int)$this->seconds]];
            return $this->present($this->store->seal($actor,$row['id'],$manifest,$payload,$bytes+$uncompressed+$archive['bytes']));
        });
    }
    public function create(OperationActor $actor,\stdClass $input):array {
        JsonSchema::validate($input,self::inputSchema('create'));
        return $this->present($this->store->create($actor,$input->export_id,$input->digest,$input->operation_id));
    }
    public function status(OperationActor $actor,\stdClass $input):array {
        JsonSchema::validate($input,self::inputSchema('status'));$row=$this->store->get($actor,$input->export_id);
        if($row['status']==='preparing')throw new OperationException('operation_pending','Retry the original export preparation request.');return $this->present($row);
    }
    public function download(OperationActor $actor,\stdClass $input):array {
        JsonSchema::validate($input,self::inputSchema('download'));$grant=$this->store->grant($actor,$input->export_id);
        $settings=new Settings($this->db);$base=rtrim((string)$settings->get('workspace_base_url',$settings->get('site_url','')),'/');
        \VoxelSite\Agent\PreviewService::canonicalOrigin($base);
        return ['export_id'=>$grant['export_id'],'download_url'=>$base.'/_studio/api/mcp/download.php#'.$grant['ticket'],
            'expires_at'=>$grant['expires_at'],'sha256'=>$grant['sha256'],'single_use'=>true,'provider_calls'=>0];
    }
    private function present(array $row):array {$payload=$row['payload'];$payload['status']=$row['status'];$payload['operation_id']=$row['operation_id'];return $payload;}
    private function sourcePaths(string $source):array {
        $paths=[];$entries=0;
        if($source==='published') {
            foreach($this->publisher->publishedManifest() as $path=>$hash)if($this->included($path,true))$paths[$path]=$this->workspace->resolvePublished($path);
        } else {
            $walk=function(string $dir,string $prefix='')use(&$walk,&$paths,&$entries):void {
                foreach(new \DirectoryIterator($dir) as $entry) {
                    if($entry->isDot())continue;if(++$entries>self::MAX_FILES*3)throw new OperationException('size_limit','Export source inventory exceeds its limit.');
                    $path=$prefix.$entry->getFilename();$absolute=SiteWorkspace::resolveWithin($this->workspace->draftRoot(),$path);
                    if(is_dir($absolute)){if(substr_count($path,'/')>10)throw new OperationException('size_limit','Export directory depth exceeds its limit.');$walk($absolute,$path.'/');}
                    elseif($this->included($path))$paths[$path]=$absolute;
                }
            };$walk($this->workspace->draftRoot());
        }
        ksort($paths,SORT_STRING);return $paths;
    }
    private function included(string $path,bool $published=false):bool {
        if(in_array($path,['assets/data/memory.json','assets/data/design-intelligence.json','assets/js/actions-bar.js','assets/css/actions-bar.css'],true))return false;
        if($published && self::publicRootOutput($path))return true;
        $kind=SitePathPolicy::type($path);if($kind===null)return false;SitePathPolicy::canonical($path);return true;
    }
    private static function publicRootOutput(string $path):bool {
        return in_array($path,['robots.txt','llms.txt','sitemap.xml','favicon.ico','favicon.png','favicon.svg'],true);
    }
    private function read(string $path,int $remaining):string {
        clearstatcache(true,$path);$before=lstat($path);
        if(!$before || is_link($path) || !is_file($path))throw new OperationException('invalid_path','Export sources must be regular files.');
        if($before['size']>$remaining)throw new OperationException('host_capability_unavailable','Export bytes exceed the bounded host budget.');
        $content=file_get_contents($path,false,null,0,$before['size']+1);clearstatcache(true,$path);$after=lstat($path);
        if(!is_string($content)||strlen($content)!==$before['size']||!$after||$after['ino']!==$before['ino']||$after['size']!==$before['size']||$after['mtime']!==$before['mtime']||is_link($path))throw new OperationException('content_conflict','An export source changed during its bounded read.');return $content;
    }
    private function hostBudget():void {
        $this->started=microtime(true);
        if(!class_exists(\ZipArchive::class))throw new OperationException('host_capability_unavailable','This host needs the PHP ZIP extension.');
        $limit=trim((string)ini_get('memory_limit'));$memory=$limit==='-1'?PHP_INT_MAX:(int)$limit*match(strtolower(substr($limit,-1))){'g'=>1073741824,'m'=>1048576,'k'=>1024,default=>1};
        $available=$memory===PHP_INT_MAX?self::MAX_BYTES*6:$memory-memory_get_usage(true)-16777216;
        $this->budget=min(self::MAX_BYTES,max(0,(int)floor($available/6)));
        $execution=(int)ini_get('max_execution_time');
        if($this->budget<1048576 || ($execution>0 && $execution<10))throw new OperationException('host_capability_unavailable','This host has insufficient memory or request time for bounded ZIP preparation.');
        $this->seconds=$execution>0?min(10,max(1,(int)floor($execution/2))):10;
    }
    private function tick():void {if(microtime(true)-$this->started>$this->seconds)throw new OperationException('host_capability_unavailable','Export preparation exceeded its request budget. Reduce the site or use a host with a larger request budget.');}
    private function shipped(string $file):string {return $this->read(dirname(__DIR__).'/static/'.$file,1048576);}
    private function textPath(string $path):bool{return in_array(strtolower(pathinfo($path,PATHINFO_EXTENSION)),['php','css','js','mjs','json','txt','svg'],true);}
    private function iconAliases():array {
        $source=$this->shipped('icon-resolver.js');$aliases=[];
        if(preg_match('~var ALIASES = \{(.*?)\};~s',$source,$block)
            && preg_match_all('~[\'"]([a-z0-9_-]+)[\'"]\s*:\s*[\'"]([a-z0-9_-]+)[\'"]~',$block[1],$matches,PREG_SET_ORDER)) {
            foreach($matches as $match)$aliases[$match[1]]=$match[2];
        }
        return $aliases;
    }
    private function inlinePortableIcons(string $html,string $root,array $aliases):string {
        return preg_replace_callback('~<(i|span|svg)\b([^>]*\bdata-lucide\s*=\s*["\']([A-Za-z0-9_-]{1,80})["\'][^>]*)>\s*</\1>~i',function($match)use($root,$aliases):string {
            $name=str_replace('_','-',strtolower($match[3]));$name=$aliases[$name]??$name;
            $path=SiteWorkspace::resolveWithin($root,'assets/icons/'.$name.'.svg');
            // Runtime-generated names remain an explicit dependency, never a guessed path.
            if(!is_file($path))return $match[0];
            $svg=$this->read($path,65536);
            if(!preg_match('~<svg\b([^>]*)>(.*?)</svg>~is',$svg,$parts))throw new OperationException('invalid_schema','A shipped icon is not valid SVG.');
            $attrs=preg_replace('~\s*data-lucide\s*=\s*["\'][^"\']*["\']~i','',$match[2]);
            $base=preg_replace('~\sclass\s*=\s*["\'][^"\']*["\']~i','',$parts[1]);
            return '<svg'.$base.$attrs.'>'.$parts[2].'</svg>';
        },$html)??$html;
    }
    private function emit(string $root,string $path,string $content):void {
        $next=$this->outputBytes-($this->outputSizes[$path]??0)+strlen($content);
        if($next>$this->budget || (!isset($this->outputSizes[$path]) && count($this->outputSizes)>=self::MAX_FILES)) {
            throw new OperationException('host_capability_unavailable','Portable output exceeds the host byte or file budget. No further archive bytes were written.');
        }
        $this->tick();WorkspaceFiles::write($root,$path,$content);$this->outputSizes[$path]=strlen($content);$this->outputBytes=$next;
    }
    private function archive(string $output,string $zipPath):array {
        $zip=new \ZipArchive();if($zip->open($zipPath,\ZipArchive::CREATE|\ZipArchive::OVERWRITE)!==true)throw new OperationException('host_capability_unavailable','Cannot create the export ZIP.');
        $files=[];$bytes=0;$walk=function(string $dir,string $prefix='')use(&$walk,&$files,&$bytes,$zip,$output):void {
            foreach(new \DirectoryIterator($dir) as $entry) {
                if($entry->isDot())continue;$path=$prefix.$entry->getFilename();$safe=SiteWorkspace::resolveWithin($output,$path);$this->tick();
                if(is_dir($safe)){$walk($safe,$path.'/');continue;}
                $content=$this->read($safe,$this->budget-$bytes);$bytes+=strlen($content);
                if(count($files)>=self::MAX_FILES)throw new OperationException('size_limit','The portable archive exceeds 700 entries.');
                $files[]=['path'=>$path,'bytes'=>strlen($content),'sha256'=>hash('sha256',$content)];
                if(!$zip->addFile($safe,$path)||!$zip->setCompressionName($path,\ZipArchive::CM_STORE))throw new OperationException('host_capability_unavailable','Cannot add bounded archive bytes.');
                if(method_exists($zip,'setMtimeName'))$zip->setMtimeName($path,315532800);
            }
        };
        try{$walk($output);}catch(\Throwable $error){$zip->close();throw $error;}
        // Store mode avoids an unbounded compression workload on short-timeout hosts.
        if(!$zip->close())throw new OperationException('host_capability_unavailable','Cannot finalize the ZIP archive.');
        $check=new \ZipArchive();if($check->open($zipPath)!==true)throw new OperationException('content_conflict','Cannot verify the closed ZIP.');
        try {
            if($check->numFiles!==count($files))throw new OperationException('content_conflict','ZIP entry count changed.');$total=0;
            for($i=0;$i<$check->numFiles;$i++){$stat=$check->statIndex($i);$total+=$stat['size'];if($stat['comp_size']>$stat['size'] || $total>$this->budget)throw new OperationException('size_limit','ZIP stored or expanded bytes exceed the limit.');}
        }finally{$check->close();}
        usort($files,static fn($a,$b)=>strcmp($a['path'],$b['path']));return $files;
    }
    private function hashArchive(string $path):array {
        $handle=fopen($path,'rb');if(!$handle)throw new OperationException('content_conflict','Cannot read the finalized archive.');
        try {
            $stat=fstat($handle);if(!$stat || $stat['size']>DownloadGrantStore::MAX_ARCHIVE_BYTES)throw new OperationException('size_limit','Closed ZIP exceeds its byte limit.');
            $hash=hash_init('sha256');$count=0;while(!feof($handle)){$this->tick();$chunk=fread($handle,min(65536,$stat['size']-$count+1));if($chunk===false)throw new OperationException('content_conflict','Cannot hash closed ZIP.');$count+=strlen($chunk);if($count>$stat['size'])throw new OperationException('content_conflict','ZIP grew during hashing.');hash_update($hash,$chunk);}
            if($count!==$stat['size']||fstat($handle)['size']!==$count)throw new OperationException('content_conflict','ZIP changed during hashing.');return ['sha256'=>hash_final($hash),'bytes'=>$count];
        }finally{fclose($handle);}
    }
    private static function stripActions(string $text):string {
        return preg_replace('~<(?:script\b[^>]*src=["\'][^"\']*actions-bar\.js[^"\']*["\'][^>]*>\s*</script>|link\b[^>]*href=["\'][^"\']*actions-bar\.css[^"\']*["\'][^>]*>)\s*~i','',$text)??$text;
    }
    public static function rewriteStatic(string $html,string $page,array $pages):string {
        $prefix=str_repeat('../',substr_count($page,'/'));
        $html=preg_replace_callback('~\b(href|src|action|poster)\s*=\s*(["\'])(.*?)\2~is',static function($m)use($prefix,$page,$pages):string {
            $url=$m[3];if($url===''||str_starts_with($url,'#')||str_starts_with($url,'//')||preg_match('~^[a-z][a-z0-9+.-]*:~i',$url))return $m[0];
            preg_match('~^([^?#]*)(.*)$~s',$url,$parts);$path=$parts[1];$suffix=$parts[2];
            if(str_starts_with($path,'/'))$target=ltrim($path,'/');else {
                $segments=explode('/',(dirname($page)==='.'?'':dirname($page).'/').$path);$normalized=[];foreach($segments as $segment){if($segment==='.'||$segment==='')continue;if($segment==='..')array_pop($normalized);else $normalized[]=$segment;}$target=implode('/',$normalized);
            }
            $candidate=$target===''?'index.php':(str_ends_with($target,'.php')?$target:rtrim($target,'/').'.php');
            if(in_array($candidate,$pages,true))$target=substr($candidate,0,-4).'.html';
            elseif(str_ends_with($target,'/')&&in_array($target.'index.php',$pages,true))$target.='index.html';
            return $m[1].'='.$m[2].$prefix.$target.$suffix.$m[2];
        },$html)??$html;
        $html=preg_replace_callback('~\bsrcset\s*=\s*(["\'])(.*?)\1~is',static function($m)use($prefix):string {
            $value=preg_replace_callback('~(^|,)\s*(/(?!/)[^\s,]+)([^,]*)~',static fn($part)=>$part[1].$prefix.ltrim($part[2],'/').$part[3],$m[2]);
            return 'srcset='.$m[1].$value.$m[1];
        },$html)??$html;
        return self::rewriteCssAssets($html,$page);
    }
    private static function rewriteCssAssets(string $content,string $path):string {
        $prefix=str_repeat('../',substr_count($path,'/'));
        return preg_replace_callback('~\burl\(\s*(["\']?)/(?!/)(assets/[^)"\']+)\1\s*\)~i',
            static fn($m)=>'url('.$m[1].$prefix.$m[2].$m[1].')',$content)??$content;
    }
    private static function htaccess(string $format):string {
        return "Options -Indexes\n<IfModule mod_rewrite.c>\nRewriteEngine On\nRewriteRule ^_submissions(?:/|$) - [F,L]\n".
            ($format==='php'?"RewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME}.php -f\nRewriteRule ^(.+?)/?$ \$1.php [L]\n":"").
            "</IfModule>\n<FilesMatch \"^(?:EXPORT-README\\.txt)$\">\nRequire all denied\n</FilesMatch>\n";
    }
}
