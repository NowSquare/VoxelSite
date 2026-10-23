<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,SiteMutationLock,SiteWorkspace};

/** Asset intentions use the same retained review, revision and recovery path as authored files. */
final class AssetManagementService
{
    public const CATALOG='assets/data/asset-catalog.json';
    private const CATEGORIES=['images','files','fonts','media'];
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,
        private ChangeSetService $changes,private ?string $legacyMetadata=null) {}

    public static function inputSchema(string $method): array
    {
        $c=ToolContracts::class;
        if ($method==='inspect') return $c::object(['path'=>$c::path()]);
        if ($method==='list') return $c::object(['category'=>['enum'=>['images','files','fonts','media','css','js']],
            'offset'=>$c::integer(500),'limit'=>['type'=>'integer','minimum'=>1,'maximum'=>100],'draft_version'=>$c::version()],[]);
        if ($method!=='prepare') throw new \InvalidArgumentException('Unknown asset operation.');
        $hash=$c::nullable($c::hash());
        $variants=[
            $c::object(['type'=>['const'=>'folder'],'path'=>$c::path()]),
            $c::object(['type'=>['const'=>'metadata'],'path'=>$c::path(),'expected_hash'=>$c::hash(),
                'alt'=>$c::text(2000),'description'=>$c::text(4000)]),
            $c::object(['type'=>['const'=>'move'],'path'=>$c::path(),'expected_hash'=>$c::hash(),
                'destination'=>$c::path(),'rewrite_references'=>['const'=>true]]),
            $c::object(['type'=>['const'=>'replace'],'path'=>$c::path(),'expected_hash'=>$hash,'upload_id'=>$c::id('upload')]),
            $c::object(['type'=>['const'=>'delete'],'path'=>$c::path(),'expected_hash'=>$c::hash(),
                'replacement_path'=>$c::nullable($c::path())]),
        ];
        return $c::object(['request_id'=>$c::requestId(),'base_draft_version'=>$c::version(),'intent'=>['oneOf'=>$variants]]);
    }
    public static function metadataSchema(): array
    {
        $c=ToolContracts::class;
        return $c::object(['id'=>['type'=>'string','pattern'=>'^asset_[a-f0-9]{24}$'],'alt'=>$c::text(2000),'description'=>$c::text(4000)]);
    }
    public static function outputSchema(string $method): array
    {
        $c=ToolContracts::class;
        if ($method==='prepare') {$schema=$c::changeReview();$schema['required'][]='asset_references';return $schema;}
        if ($method==='inspect') return $c::object(['path'=>$c::path(),'exists'=>['type'=>'boolean'],'sha256'=>$c::nullable($c::hash()),
            'draft_version'=>$c::version(),'references'=>$c::assetReferences(),'analysis'=>['const'=>'static_source_references'],
            'not_run'=>$c::list($c::text(100),10),'provider_calls'=>['const'=>0]]);
        return $c::object(['assets'=>$c::list($c::object(['path'=>$c::path(),'filename'=>$c::text(80),
            'category'=>$c::text(20),'extension'=>$c::text(10),'size'=>$c::integer(33554432),'sha256'=>$c::hash(),
            'meta'=>self::metadataSchema()]),100),'folders'=>$c::list($c::path(),500),'total'=>$c::integer(500),
            'next_offset'=>$c::nullable($c::integer(500)),'draft_version'=>$c::version(),'provider_calls'=>['const'=>0]]);
    }
    public function list(OperationActor $actor,\stdClass $input): array
    {
        JsonSchema::validate($input,self::inputSchema('list'));$this->policy->require($actor,['assets:read']);
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);
        $files=WorkspaceFiles::read($this->workspace);$version='draft:'.$this->workspace->status()['draft_version'];
        if (isset($input->draft_version) && $input->draft_version!==$version || ($input->offset??0)>0 && ($input->draft_version??null)!==$version) {
            throw new OperationException('content_conflict','The asset list changed. Start again with the current draft version.');
        }
        $catalog=$this->catalog($files);$assets=[];
        foreach ($files as $path=>$bytes) {
            $type=SitePathPolicy::type($path);
            if (!in_array($type,['binary','css','js','derived'],true)) continue;
            $category=explode('/',$path)[1];
            if (isset($input->category) && $input->category!==$category) continue;
            if (str_contains($path,'/thumbs/')) continue;
            $assets[]=['path'=>$path,'filename'=>basename($path),'category'=>$category,'extension'=>pathinfo($path,PATHINFO_EXTENSION),
                'size'=>strlen($bytes),'sha256'=>hash('sha256',$bytes),'meta'=>$catalog['assets'][$path]??self::metadata($path)];
        }
        $offset=$input->offset??0;$limit=$input->limit??100;
        if ($offset>count($assets)) throw new OperationException('invalid_schema','Asset offset exceeds this inventory.');
        $slice=array_slice($assets,$offset,$limit);$next=$offset+count($slice);
        return $this->bounded(['assets'=>$slice,'folders'=>$catalog['folders'],'total'=>count($assets),
            'next_offset'=>$next<count($assets)?$next:null,'draft_version'=>$version,'provider_calls'=>0]);
    }
    public function inspect(OperationActor $actor,\stdClass $input): array
    {
        JsonSchema::validate($input,self::inputSchema('inspect'));$this->policy->require($actor,['assets:read','files:read']);
        $path=$this->assetPath($input->path);$lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);
        $files=WorkspaceFiles::read($this->workspace);$found=AssetReferenceIndex::find($files,$path);
        $this->authorizeReferences($actor,$found['references'],false);
        return $this->bounded(['path'=>$path,'exists'=>isset($files[$path]),'sha256'=>isset($files[$path])?hash('sha256',$files[$path]):null,
            'draft_version'=>'draft:'.$this->workspace->status()['draft_version'],'references'=>$found['references'],
            'analysis'=>'static_source_references','not_run'=>['dynamic_php_javascript_references','external_references'],'provider_calls'=>0]);
    }
    public function prepare(OperationActor $actor,\stdClass $input): array
    {
        JsonSchema::validate($input,self::inputSchema('prepare'));
        $this->policy->require($actor,['assets:read','assets:write','files:read','files:write','changes:apply']);
        $request=(object)['request_id'=>$input->request_id,'base_draft_version'=>$input->base_draft_version,'brief_id'=>'assets:v1',
            'summary'=>'Reviewed asset '.$input->intent->type,'intent'=>$input->intent];
        return $this->changes->prepareAssets($actor,$request,fn(array $before)=>$this->plan($actor,$before,$input->intent));
    }

    private function plan(OperationActor $actor,array $before,\stdClass $intent): array
    {
        $catalog=$this->catalog($before);$after=$before;$assets=[];$operations=[];$references=[];
        if ($intent->type==='folder') {
            $path=$this->folderPath($intent->path);
            if (in_array($path,$catalog['folders'],true)) throw new OperationException('content_conflict','This folder is already present.');
            $catalog['folders'][]=$path;sort($catalog['folders'],SORT_STRING);
        } else {
            $path=$this->assetPath($intent->path);$current=$before[$path]??null;
            if (($current===null?null:hash('sha256',$current))!==$intent->expected_hash) throw new OperationException('content_conflict','This asset changed. Read its current hash and prepare again.');
            if ($intent->type!=='replace' && $current===null) throw new OperationException('invalid_path','This managed asset is missing.');
            $metadata=$catalog['assets'][$path]??self::metadata($path);
            if ($intent->type==='metadata') {
                $catalog['assets'][$path]=['id'=>$metadata['id'],'alt'=>$intent->alt,'description'=>$intent->description];
            } else {
                $target=null;
                if ($intent->type==='move') {
                    $target=$this->assetPath($intent->destination);
                    if (isset($before[$target]) || $target===$path) throw new OperationException('content_conflict','The destination must be absent and different.');
                    if (pathinfo($path,PATHINFO_EXTENSION)!==pathinfo($target,PATHINFO_EXTENSION)) throw new OperationException('invalid_schema','Moving an asset must preserve its file extension.');
                } elseif ($intent->type==='delete' && $intent->replacement_path!==null) {
                    $target=$this->assetPath($intent->replacement_path);
                    if ($target===$path || !isset($before[$target])) throw new OperationException('invalid_path','Choose a different existing replacement asset.');
                }
                $found=AssetReferenceIndex::find($before,$path,$target);$references=$found['references'];
                $this->authorizeReferences($actor,$references,$target!==null);
                if ($intent->type==='delete' && $target===null && $references) throw new OperationException('content_conflict',
                    'This asset is referenced. Choose an existing replacement or remove its references first.',['reference_count'=>count($references)]);
                foreach ($found['files'] as $file=>$content) $after[$file]=$content;
                if ($intent->type==='move') {
                    $upload='upload_'.substr(hash('sha256',$path."\0".$target."\0".$current),0,32);
                    $assets[$upload]=['path'=>$target,'content'=>$current];
                    $operations[]=(object)['type'=>'attach_asset','path'=>$target,'expected_hash'=>null,'upload_id'=>$upload];
                    $catalog['assets'][$target]=$metadata;unset($catalog['assets'][$path],$after[$path]);
                } elseif ($intent->type==='replace') {
                    $operations[]=(object)['type'=>'attach_asset','path'=>$path,'expected_hash'=>$intent->expected_hash,'upload_id'=>$intent->upload_id];
                    $catalog['assets'][$path]=$metadata;
                } else {unset($catalog['assets'][$path],$after[$path]);}
            }
        }
        $catalog['format']=1;ksort($catalog['assets'],SORT_STRING);
        $serialized=$catalog;$serialized['assets']=(object)$catalog['assets'];
        $after[self::CATALOG]=json_encode($serialized,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR)."\n";
        if (strlen($after[self::CATALOG])>65536 || count($catalog['folders'])>500 || count($catalog['assets'])>500) throw new OperationException('size_limit','Asset metadata exceeds its retained catalog budget.');
        foreach (array_unique(array_merge(array_keys($before),array_keys($after))) as $path) {
            if (($before[$path]??null)===($after[$path]??null)) continue;
            $expected=isset($before[$path])?hash('sha256',$before[$path]):null;
            if (!isset($after[$path])) $operations[]=(object)['type'=>'delete','path'=>$path,'expected_hash'=>$expected];
            else $operations[]=(object)['type'=>$expected===null?'create':'replace','path'=>$path,'expected_hash'=>$expected,'content'=>$after[$path]];
        }
        return ['operations'=>$operations,'assets'=>$assets,'asset_references'=>$references];
    }
    private function authorizeReferences(OperationActor $actor,array $references,bool $write): void
    {
        foreach ($references as $reference) if (SitePathPolicy::type($reference['source_file'])==='forms') {
            $this->policy->require($actor,$write?['forms:read','forms:write']:['forms:read']);
        }
    }
    private function catalog(array $files): array
    {
        $catalog=['format'=>1,'folders'=>[],'assets'=>[]];
        if (isset($files[self::CATALOG])) {
            if (strlen($files[self::CATALOG])>65536) throw new OperationException('size_limit','The asset catalog exceeds 64 KiB.');
            try {$value=json_decode($files[self::CATALOG],false,32,JSON_THROW_ON_ERROR);}
            catch (\Throwable) {throw new OperationException('invalid_schema','The asset catalog is not valid JSON.');}
            if (!$value instanceof \stdClass || array_diff(array_keys((array)$value),['format','folders','assets']) || ($value->format??null)!==1
                || !is_array($value->folders??null) || !(($value->assets??null) instanceof \stdClass) || count($value->folders)>500 || count((array)$value->assets)>500) {
                throw new OperationException('invalid_schema','The asset catalog has an unsupported shape.');
            }
            foreach ($value->folders as $folder) {if (!is_string($folder)) throw new OperationException('invalid_schema','Invalid asset folder.');$catalog['folders'][]=$this->folderPath($folder);}
            foreach ((array)$value->assets as $path=>$meta) {
                $this->assetPath($path);JsonSchema::validate($meta,self::metadataSchema());$catalog['assets'][$path]=(array)$meta;
            }
            return $catalog;
        }
        // Legacy sidecar is a trusted server path; only public asset metadata is read.
        if ($this->legacyMetadata!==null && is_file($this->legacyMetadata)) {
            if (is_link($this->legacyMetadata) || filesize($this->legacyMetadata)>65536) throw new OperationException('size_limit','Review the legacy asset metadata before importing it.');
            $legacy=json_decode((string)file_get_contents($this->legacyMetadata),true);
            if (!is_array($legacy)) throw new OperationException('invalid_schema','The legacy asset metadata is invalid.');
            foreach ($legacy as $path=>$meta) {
                $path=ltrim((string)$path,'/');
                if (!isset($files[$path]) || SitePathPolicy::type($path)!=='binary' || !is_array($meta)) continue;
                $catalog['assets'][$path]=self::metadata($path,(string)($meta['alt']??''),(string)($meta['description']??''));
            }
        }
        return $catalog;
    }
    private static function metadata(string $path,string $alt='',string $description=''): array
    {return ['id'=>'asset_'.substr(hash('sha256',$path),0,24),'alt'=>mb_strcut($alt,0,2000,'UTF-8'),'description'=>mb_strcut($description,0,4000,'UTF-8')];}
    private function assetPath(string $path): string
    {
        SitePathPolicy::canonical($path,true);
        if (SitePathPolicy::type($path)!=='binary') throw new OperationException('invalid_path','Choose a mutable image, document, font or media asset. Edit source code through file authoring.');
        return $path;
    }
    private function folderPath(string $path): string
    {
        if (!preg_match('~^assets/(images|files|fonts|media)/[A-Za-z0-9_-][A-Za-z0-9_./-]*$~D',$path)) throw new OperationException('invalid_path','Choose a canonical mutable asset folder.');
        SitePathPolicy::canonical($path.'/folder-probe.txt',true);
        return $path;
    }
    private function bounded(array $value): array
    {
        if (strlen(CanonicalJson::encode($value))>131072) throw new OperationException('size_limit','This asset response exceeds 128 KiB. Reduce the page size.');
        return $value;
    }
}
