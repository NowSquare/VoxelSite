<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{AEOGenerator, ActionManager, Database, FileManager, Settings, SiteMutationLock, SiteWorkspace, TailwindCompiler};

/** No generators run after sealing. Publication only installs retained bytes. */
final class PublishPlanService
{
    public const AUTHORING_ONLY = ['assets/data/memory.json','assets/data/design-intelligence.json'];
    private OperationRunner $runner;
    private string $actionsDir;
    private string $legacyManifest;
    public const MAX_FILES=700;
    public const MAX_BYTES=41943040;

    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,
        private ReleaseStore $releases,private OperationStore $operations,
        ?string $actionsDir=null,?string $legacyManifest=null,private int $filesPerStep=20,
        private ?\Closure $testHook=null)
    {
        if ($filesPerStep<1 || $filesPerStep>100) throw new \InvalidArgumentException('Invalid publish checkpoint budget.');
        $dataRoot=dirname($workspace->draftRoot()).'/data';
        $this->actionsDir=$actionsDir??$dataRoot.'/actions';
        $this->legacyManifest=$legacyManifest??$dataRoot.'/published-manifest.json';
        $this->runner=new OperationRunner($db,$policy,$operations,$workspace->mutationLockPath());
    }

    public static function inputSchema(string $method):array
    {
        $id=['type'=>'string','pattern'=>'^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$'];
        $plan=['type'=>'string','pattern'=>'^publish_[a-f0-9]{32}$'];
        $fields=match($method) {
            'prepare'=>['request_id'=>$id,'base_draft_version'=>['type'=>'string','pattern'=>'^draft:[0-9]+$']],
            'publish'=>['plan_id'=>$plan,'digest'=>['type'=>'string','pattern'=>'^[a-f0-9]{64}$'],'operation_id'=>$id],
            'get'=>['plan_id'=>$plan],
            default=>throw new \InvalidArgumentException('Unknown publish method.'),
        };
        return ['type'=>'object','properties'=>$fields,'required'=>array_keys($fields),'additionalProperties'=>false];
    }

    public static function outputSchema(string $method):array
    {
        if(!in_array($method,['prepare','get'],true))throw new \InvalidArgumentException('Publish execution uses the shared operation-state schema.');
        $s=['type'=>'string'];$n=['type'=>'integer','minimum'=>0];
        $paths=['type'=>'array','maxItems'=>self::MAX_FILES,'items'=>$s];
        return self::object([
            'plan_id'=>$s,'digest'=>$s,'status'=>['const'=>'ready'],'base_draft_version'=>$s,
            'before_release_id'=>['type'=>['string','null']],'expires_at'=>$n,
            'files'=>['type'=>'array','maxItems'=>self::MAX_FILES,'items'=>self::object([
                'path'=>$s,'action'=>['enum'=>['write','delete']],'before_hash'=>['type'=>['string','null']],
                'after_hash'=>['type'=>['string','null']],'bytes'=>$n,'generated'=>['type'=>'boolean'],
            ])],
            'generated_files'=>$paths,'deletions'=>$paths,
            'seo_policy'=>self::object(array_fill_keys(['robots.txt','llms.txt'],['enum'=>['generated','preserved_draft_override']])),
            'snapshot'=>self::object(['id'=>$s,'domain'=>['const'=>'published'],'file_count'=>$n]),
            'excluded_domains'=>$paths,'validation'=>self::object(['blocking'=>$paths,'not_run'=>$paths]),
            'provider_calls'=>['const'=>0],
        ]);
    }

    public static function resultSchema():array
    {
        $s=['type'=>'string'];$paths=['type'=>'array','maxItems'=>self::MAX_FILES,'items'=>$s];
        return self::object([
            'release_id'=>$s,'plan_id'=>$s,'digest'=>$s,'draft_version'=>$s,'before_version'=>$s,'after_version'=>$s,
            'published'=>$paths,'removed'=>$paths,'changed_paths'=>$paths,'snapshot_id'=>$s,
            'actor'=>self::object(['type'=>$s,'user_id'=>['type'=>'integer'],'credential_id'=>['type'=>['integer','null']],'client_name'=>['type'=>['string','null']]]),
            'provider_calls'=>['const'=>0],'errors'=>$paths,'aeo_files'=>$paths,'agentic_files'=>$paths,
            'validation'=>self::object(['blocking'=>$paths,'not_run'=>$paths]),
            'restoration'=>self::object(['required'=>['const'=>false],'restored'=>['type'=>'null']]),
        ]);
    }

    public function prepare(OperationActor $actor,\stdClass $input):array
    {
        return ProviderCallPolicy::runExternal(function() use($actor,$input):array {
            $this->policy->require($actor,['publish:write','files:read','assets:read','forms:read']);
            JsonSchema::validate($input,self::inputSchema('prepare'));
            $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);
            $this->workspace->assertReady();
            $row=$this->releases->reserve($actor,(array)$input);
            if ($row['status']!=='preparing') return $row['payload'];
            $state=$this->workspace->status();
            if ($input->base_draft_version!=='draft:'.$state['draft_version']) throw new OperationException('content_conflict','The draft version changed. Prepare a new publish review.');
            $source=WorkspaceFiles::read($this->workspace);
            if (!isset($source['index.php'])) throw new OperationException('invalid_schema','Create a homepage before publishing.');
            $this->releases->resetIncomplete($actor,$row['id']);
            $root=$this->releases->stage($row['id'],true);
            $candidate=$root.'/candidate';
            if (!mkdir($candidate.'/assets',0700,true)) throw new OperationException('host_capability_unavailable','Cannot create the publish candidate.');
            WorkspaceFiles::write($candidate,'.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
            // Keep private context in the source seal, but never feed it into
            // generated public output or retain it in the publish candidate.
            foreach($source as $path=>$content) if(!in_array($path,self::AUTHORING_ONLY,true)) WorkspaceFiles::write($candidate,$path,$content);
            $configuration=$this->configuration();
            foreach($configuration['actions'] as $path=>$content) WorkspaceFiles::write($root.'/actions-input',$path,$content);
            $generated=$this->generate($candidate,$root);
            $after=$this->candidate($candidate);
            $sourceHashes=WorkspaceFiles::hashes($source);
            $migrationHashes=[];
            $managed=$this->managed($state['release_id'],$migrationHashes);
            $this->hook('legacy_provenance_loaded',$row);
            $paths=array_values(array_unique(array_merge(array_keys($managed),array_keys($after))));sort($paths,SORT_STRING);
            if(count($paths)>self::MAX_FILES)throw new OperationException('size_limit','The combined old and new managed domains exceed 700 files. Publish a smaller transition.');
            $before=[];$effects=[];$bytes=array_sum(array_map('strlen',$after))+array_sum(array_map('strlen',$configuration['actions']));
            $conflicts=[];
            foreach($paths as $path) {
                self::destination($path);
                $absolute=$this->workspace->resolvePublished($path,true);
                // Refuse before reading or retaining an original that would
                // exceed the reservation; final accounting alone is too late.
                $content=$this->readLive($absolute,2*self::MAX_BYTES-$bytes);
                if (($content!==null && !array_key_exists($path,$managed))
                    || (isset($migrationHashes[$path]) && ($content===null || hash('sha256',$content)!==$migrationHashes[$path]))) {
                    $conflicts[]=$path;continue;
                }
                $before[$path]=$content===null?null:hash('sha256',$content);
                if ($content!==null) {WorkspaceFiles::write($root.'/before',$path,$content);$bytes+=strlen($content);}
                $afterHash=isset($after[$path])?hash('sha256',$after[$path]):null;
                if ($before[$path]!==$afterHash) $effects[]=['path'=>$path,'action'=>$afterHash===null?'delete':'write',
                    'before_hash'=>$before[$path],'after_hash'=>$afterHash,'bytes'=>isset($after[$path])?strlen($after[$path]):0,
                    'generated'=>isset($after[$path]) && ($sourceHashes[in_array($path,['robots.txt','llms.txt'],true) && isset($sourceHashes['_root/'.$path])?'_root/'.$path:$path]??null)!==$afterHash];
            }
            if ($conflicts) throw new OperationException('ownership_conflict','Existing live paths have no managed-release provenance. Review ownership in Studio before publishing.',['paths'=>$conflicts]);
            if ($bytes>2*self::MAX_BYTES) throw new OperationException('size_limit','The candidate and live recovery snapshot exceed the supported publish budget.');
            $afterHashes=WorkspaceFiles::hashes($after);
            $manifest=['format'=>1,'plan_id'=>$row['id'],'draft_version'=>(int)$state['draft_version'],
                'source_hashes'=>$sourceHashes,'configuration_digest'=>CanonicalJson::digest($configuration),
                'action_digest'=>CanonicalJson::digest($configuration['actions']),
                'before_release_id'=>$state['release_id'],'before'=>$before,'after'=>$afterHashes,'files'=>$effects,
                'generated'=>$generated,'expires_at'=>(int)$row['expires_at']];
            $payload=['plan_id'=>$row['id'],'status'=>'ready','base_draft_version'=>$input->base_draft_version,
                'before_release_id'=>$state['release_id'],'expires_at'=>(int)$row['expires_at'],'files'=>$effects,
                'generated_files'=>array_values(array_map(fn($e)=>$e['path'],array_filter($effects,fn($e)=>$e['generated']))),
                'seo_policy'=>array_combine(['robots.txt','llms.txt'],array_map(fn($path)=>isset($sourceHashes['_root/'.$path])?'preserved_draft_override':'generated',['robots.txt','llms.txt'])),
                'deletions'=>array_values(array_map(fn($e)=>$e['path'],array_filter($effects,fn($e)=>$e['action']==='delete'))),
                'snapshot'=>['id'=>$row['id'],'domain'=>'published','file_count'=>count(array_filter($before,fn($h)=>$h!==null))],
                'excluded_domains'=>['_studio','_data','server_configuration','unrelated_hosting_files','assets/library','assets/icons',...self::AUTHORING_ONLY],
                'validation'=>['blocking'=>[],'not_run'=>['browser_visual_review','external_accessibility_review']],
                'provider_calls'=>0];
            return $this->releases->seal($actor,$row['id'],$manifest,$payload,$bytes)['payload'];
        });
    }

    public function get(OperationActor $actor,string $id):array {return $this->releases->get($actor,$id)['payload'];}
    /** Internal read seam for the authenticated Studio publication diff. */
    public function publishedHashes(array $paths):array
    {
        if(count($paths)>self::MAX_FILES)throw new OperationException('size_limit','The managed publication exceeds its read budget.');
        return $this->liveHashes($paths);
    }

    public function publish(OperationActor $actor,\stdClass $input):array
    {
        JsonSchema::validate($input,self::inputSchema('publish'));
        return $this->runner->start($actor,$input->operation_id,'publish.apply',
            (object)['plan_id'=>$input->plan_id,'digest'=>$input->digest],
            $this->workspace->status()['release_id']??'unpublished',$input->plan_id,['publish:write'],
            fn($op)=>$this->step($actor,$op),fn($op)=>$this->restore($op));
    }

    public function continue(OperationActor $actor,string $id,int $checkpoint):array
    {
        $row=$this->operations->get($actor,$id);
        if ($row['kind']!=='publish.apply') throw new OperationException('invalid_schema','This operation needs a different continuation.');
        return $this->runner->continue($actor,$id,$checkpoint,['publish:write'],
            fn($op)=>$this->step($actor,$op),fn($op)=>$this->restore($op),fn($op)=>$this->consistent($op));
    }

    public function recover(OperationActor $actor,string $id):array
    {
        if ($this->operations->get($actor,$id)['kind']!=='publish.apply') throw new OperationException('invalid_schema','This operation needs a different recovery service.');
        return $this->runner->recover($actor,$id,['publish:write','restore:live'],fn($op)=>$this->restore($op));
    }

    private function step(OperationActor $actor,array $operation):array
    {
        $this->workspace->assertReady();
        $plan=$this->releases->get($actor,$operation['preparation_id'],!empty($operation['recovery']));
        if ($plan['status']!=='ready' || !hash_equals($plan['digest']??'',$operation['request']['digest'])) {
            throw new OperationException('content_conflict','The publish digest does not identify an unused reviewed candidate.');
        }
        $manifest=$plan['manifest'];$root=$this->releases->stage($plan['id']);
        $this->verifyRetained($root,$manifest);
        $state=$this->workspace->status();
        if ($state['draft_version']!==$manifest['draft_version'] || $state['release_id']!==$manifest['before_release_id']
            || WorkspaceFiles::hashes(WorkspaceFiles::read($this->workspace))!==$manifest['source_hashes']
            || CanonicalJson::digest($this->configuration())!==$manifest['configuration_digest']) {
            throw new OperationException('content_conflict','The draft, publication configuration or release changed after review.');
        }
        $recovery=$operation['recovery'];
        if (!$recovery) {
            if ($this->liveHashes(array_keys($manifest['before']))!==$manifest['before']) throw new OperationException('content_conflict','Live files changed after publish review.');
            $recovery=['plan_id'=>$plan['id'],'before'=>$manifest['before'],'after'=>$manifest['after'],'files'=>$manifest['files']];
            $this->operations->recordRecovery($actor,$operation['operation_id'],$operation['lease_token'],$recovery);
            $this->hook('after_capture',$operation);
        } elseif (!$this->consistent($operation)) {
            throw new OperationException('content_conflict','Live files changed outside this publish operation.');
        }
        $index=(int)($operation['checkpoint']['next_file']??0);
        $end=min(count($manifest['files']),$index+$this->filesPerStep);
        for(;$index<$end;$index++) {
            $entry=$manifest['files'][$index];$path=$entry['path'];
            $this->policy->require($actor,['publish:write']);
            $target=$this->workspace->resolvePublished($path,true);
            $current=$this->hash($target);
            if ($current===$entry['after_hash']) continue;
            if ($current!==$entry['before_hash']) throw new OperationException('content_conflict','A live file changed during publish.',['path'=>$path]);
            if ($entry['after_hash']===null) {
                if (is_file($target) && !unlink($target)) throw new OperationException('host_capability_unavailable','Cannot remove a managed live file.',['path'=>$path]);
            } else {
                $content=$this->readLive(SiteWorkspace::resolveWithin($root.'/candidate',$path));
                if ($content===null || hash('sha256',$content)!==$entry['after_hash']) throw new OperationException('content_conflict','The reviewed candidate bytes changed.');
                $this->writeLive($target,$content);
            }
            if ($this->hash($target)!==$entry['after_hash']) throw new OperationException('host_capability_unavailable','A live replacement failed verification.',['path'=>$path]);
            if (function_exists('opcache_invalidate')) @opcache_invalidate($target,true);
            $this->hook('after_file',$operation+['path'=>$path]);
        }
        if ($index<count($manifest['files'])) return ['complete'=>false,'phase'=>'publish_files',
            'checkpoint'=>['next_file'=>$index,'total_files'=>count($manifest['files'])],'recovery'=>$recovery];
        $expected=$manifest['after'];
        foreach($manifest['before'] as $path=>$unused) if (!array_key_exists($path,$expected)) $expected[$path]=null;
        ksort($expected,SORT_STRING);
        if ($this->liveHashes(array_keys($expected))!==$expected) throw new OperationException('content_conflict','The published domain does not match the reviewed candidate.');
        $this->policy->require($actor,['publish:write']);
        $releaseId='release_'.substr($plan['id'],8);
        $result=['release_id'=>$releaseId,'plan_id'=>$plan['id'],'digest'=>$plan['digest'],'draft_version'=>'draft:'.$manifest['draft_version'],
            'before_version'=>$manifest['before_release_id']??'unpublished','after_version'=>$releaseId,
            'changed_paths'=>array_column($manifest['files'],'path'),
            'published'=>array_values(array_column(array_filter($manifest['files'],fn($e)=>$e['action']==='write'),'path')),
            'removed'=>array_values(array_column(array_filter($manifest['files'],fn($e)=>$e['action']==='delete'),'path')),
            'snapshot_id'=>$plan['id'],'actor'=>$actor->attribution(),'provider_calls'=>0,'errors'=>[],
            'aeo_files'=>$manifest['generated']['aeo'],'agentic_files'=>$manifest['generated']['actions'],
            'validation'=>$plan['payload']['validation'],'restoration'=>['required'=>false,'restored'=>null]];
        $this->operations->finish($actor,$operation['operation_id'],$operation['lease_token'],'succeeded',$result,$releaseId,
            function() use($actor,$plan,$operation,$releaseId,$manifest):void {
                $this->releases->commit($actor,$plan,$operation,$releaseId);
                if ($this->db->update('site_workspace_state',['release_id'=>$releaseId,'updated_at'=>time()],
                    'id = 1 AND draft_version = ? AND release_id IS ?',[$manifest['draft_version'],$manifest['before_release_id']])!==1) {
                    throw new OperationException('content_conflict','Publication metadata changed during commit.');
                }
                $settings=new Settings($this->db);
                $settings->set('last_published_at',date('Y-m-d H:i:s'));
                $settings->set('publish_count',(int)$settings->get('publish_count',0)+1);
            });
        $this->hook('after_commit',$operation);
        return ['committed'=>true];
    }

    private function generate(string $candidate,string $root):array
    {
        if ((new \ReflectionMethod(FileManager::class,'__construct'))->getNumberOfParameters()<2
            || (new \ReflectionMethod(AEOGenerator::class,'__construct'))->getNumberOfParameters()<5) {
            throw new \LogicException('Publish preparation requires explicit isolated generator roots.');
        }
        $workspace=new SiteWorkspace($this->db,$candidate,$this->workspace->publishedRoot(),$root.'/state',$this->workspace->publishedAssetsRoot(),tracksDraftVersion:false);
        $files=new FileManager($this->db,$workspace);
        $files->ensureShippedNavigation();$files->ensureShippedIconResolver();
        $static=dirname(__DIR__,2).'/static';
        if (glob($candidate.'/assets/forms/*.json')) {
            foreach(['form-handler.js'=>'assets/js/form-handler.js','submit-standalone.php'=>'submit.php'] as $from=>$to) {
                WorkspaceFiles::write($candidate,$to,$this->staticBytes($static.'/'.$from));
            }
        }
        $files->versionShippedScripts();
        $actions=new ActionManager($root.'/actions-input',$root.'/unused-actions.db',$candidate.'/assets/data/site.json');
        $actionFiles=[];
        if (!empty(($manifest=$actions->generateManifest())['actions'])) {
            foreach(['actions-bar.js'=>'actions-bar.js','actions-bar.css'=>'actions-bar.css','actions-submit.php'=>'actions/submit.php'] as $from=>$to) {
                WorkspaceFiles::write($candidate,$to,$this->staticBytes($static.'/'.$from));$actionFiles[]=$to;
            }
            WorkspaceFiles::write($candidate,'actions/manifest.json',CanonicalJson::encode($manifest));
            $actionFiles[]='actions/manifest.json';
            foreach(glob($static.'/i18n/*/*.json')?:[] as $path) {
                $relative='i18n/'.basename(dirname($path)).'/'.basename($path);
                WorkspaceFiles::write($candidate,$relative,$this->staticBytes($path));$actionFiles[]=$relative;
                if (basename($path)==='actions.json') {
                    $legacy='actions/i18n/'.basename(dirname($path)).'.json';
                    WorkspaceFiles::write($candidate,$legacy,$this->staticBytes($path));$actionFiles[]=$legacy;
                }
            }
            $files->injectActionsBarIntoFooter($candidate);
        }
        $aeo=(new AEOGenerator($candidate.'/assets',$candidate,$candidate,$root.'/actions-input',$this->db))
            ->generateAll((string)(new Settings($this->db))->get('site_url',''));
        $seoOverrides=[];
        foreach(['robots.txt','llms.txt'] as $seo) {
            if(is_file($candidate.'/_root/'.$seo)) {
                WorkspaceFiles::write($candidate,$seo,$this->staticBytes($candidate.'/_root/'.$seo));
                if(!unlink($candidate.'/_root/'.$seo))throw new OperationException('host_capability_unavailable','Cannot stage root SEO output.');
                $seoOverrides[]=$seo;
            }
        }
        $compiler=new TailwindCompiler($candidate.'/assets/css');
        if (($compiler->compile($candidate,$candidate.'/assets/css/tailwind.css',1048576)['ok']??false)!==true) {
            throw new OperationException('host_capability_unavailable','Candidate CSS compilation failed.');
        }
        return ['aeo'=>array_values(array_filter($aeo['generated']??[],fn($p)=>is_file($candidate.'/'.$p) && !in_array($p,$seoOverrides,true))),'actions'=>$actionFiles];
    }

    private function configuration():array
    {
        ActionConfiguration::assertPublishReady($this->workspace);
        $siteData=$this->readLive($this->workspace->resolveDraft('assets/data/site.json'),1048576);
        return ['site_url'=>(new Settings($this->db))->get('site_url',''),'actions'=>self::actionDefinitions($this->actionsDir),
            'site_data_sha256'=>$siteData===null?null:hash('sha256',$siteData),
            'pages'=>$this->db->query('SELECT slug,title,file_path,nav_order,is_published FROM pages ORDER BY id')];
    }
    public function currentActionDigest():string {return self::actionDigest($this->actionsDir);}
    public function currentConfigurationDigest():string {return CanonicalJson::digest($this->configuration());}
    public static function actionDigest(string $trustedActionsDir):string {return CanonicalJson::digest(self::actionDefinitions($trustedActionsDir));}
    private static function actionDefinitions(string $actionsDir):array
    {
        $actions=[];$bytes=0;
        if (is_link($actionsDir))throw new OperationException('invalid_path','Action definitions cannot be loaded through a symlink.');
        if (is_dir($actionsDir)) {
            foreach(glob($actionsDir.'/*.json')?:[] as $path) {
                $safe=SiteWorkspace::resolveWithin($actionsDir,basename($path));
                if (count($actions)>=100 || ($bytes+=filesize($safe))>1048576) throw new OperationException('size_limit','Action definitions exceed the publish preparation budget.');
                $content=file_get_contents($safe,false,null,0,filesize($safe)+1);
                if ($content===false || strlen($content)!==filesize($safe)) throw new OperationException('content_conflict','Cannot read the current Action definitions.');
                $actions[basename($path)]=$content;
            }
        }
        ksort($actions,SORT_STRING);return $actions;
    }

    /** Trusted read services must still enforce their own actor scopes. Never scans the public root. */
    public function publishedManifest(): array
    {
        $state=$this->workspace->status();
        if ($state['release_id']===null && !(new Settings($this->db))->get('last_published_at')) {
            throw new OperationException('not_published','Publish the site before exporting its published version.');
        }
        return $this->managed($state['release_id']);
    }

    private function managed(?string $release,?array &$migrationHashes=null):array
    {
        if (($manifest=$this->releases->managed($release))!==null) return $manifest;
        $managed=\VoxelSite\ShippedSiteProvenance::verified($this->db,$this->workspace);
        if (is_file($this->legacyManifest)) {
            if (is_link($this->legacyManifest) || filesize($this->legacyManifest)>1048576) throw new OperationException('invalid_path','The legacy publication manifest is unsafe.');
            $legacy=json_decode((string)file_get_contents($this->legacyManifest),true,64,JSON_THROW_ON_ERROR);
            if(!is_array($legacy) || !is_array($legacy['files']??[]) || !array_is_list($legacy['files']??[])
                || !is_array($legacy['asset_hashes']??[]))throw new OperationException('invalid_schema','The legacy ownership manifest is invalid.');
            foreach($legacy['asset_hashes']??[] as $hash) {
                if(!is_string($hash) || !preg_match('/^[a-f0-9]{64}$/D',$hash))throw new OperationException('invalid_schema','The legacy asset ownership hash is invalid.');
            }
            foreach(array_merge($legacy['files']??[],array_keys($legacy['asset_hashes']??[])) as $path) {
                if (!is_string($path)) throw new OperationException('invalid_path','Legacy ownership contains an invalid path.');
                self::destination($path);$managed[$path]=null;
            }
        }
        // A draft row alone is not proof of publication: old schemas default
        // is_published to one even for a newly created, never published page.
        if ((new Settings($this->db))->get('last_published_at')) {
            foreach($this->db->query('SELECT file_path FROM pages WHERE is_published = 1') as $page) {
                $path=$page['file_path'];self::destination($path);$managed[$path]=null;
            }
        }
        $migrationHashes=[];
        if($release===null) {
            $migration=new \VoxelSite\WorkspaceMigration($this->workspace,$this->db);
            $migrationHashes=$migration->publishedAssetHashes()+$migration->publishedGeneratedHashes();
        }
        foreach($migrationHashes as $path=>$hash) {
            self::destination($path);
            if($this->hash($this->workspace->resolvePublished($path,true))!==$hash) {
                throw new OperationException('ownership_conflict','A migrated live file changed after workspace activation. Preserve or reconcile the external change before publishing.',['paths'=>[$path]]);
            }
            $managed[$path]=$hash;
        }
        if(count($managed)>self::MAX_FILES) throw new OperationException('size_limit','The legacy managed domain exceeds the publish budget.');
        ksort($managed,SORT_STRING);return $managed;
    }

    private function candidate(string $root):array
    {
        $out=[];$total=0;$entries=0;
        $walk=function(string $dir,string $prefix='') use(&$walk,&$out,&$total,&$entries,$root):void {
            foreach(new \DirectoryIterator($dir) as $item) {
                if($item->isDot())continue;
                if(++$entries>2100)throw new OperationException('size_limit','The candidate directory scan exceeds the publish budget.');
                $path=$prefix.$item->getFilename();$full=SiteWorkspace::resolveWithin($root,$path);
                if (is_dir($full)) {if(substr_count($path,'/')>10)throw new OperationException('size_limit','Candidate nesting exceeds its budget.');$walk($full,$path.'/');continue;}
                if($path==='.htaccess'||in_array($path,self::AUTHORING_ONLY,true))continue;
                self::destination($path);
                if(!is_file($full) || count($out)>=self::MAX_FILES || ($total+=filesize($full))>self::MAX_BYTES) throw new OperationException('size_limit','The candidate exceeds 700 files or 40 MiB.');
                $content=file_get_contents($full,false,null,0,filesize($full)+1);
                if($content===false || strlen($content)!==filesize($full)) throw new OperationException('content_conflict','Candidate bytes changed during inventory.');
                $out[$path]=$content;
            }
        };
        $walk($root);ksort($out,SORT_STRING);return $out;
    }

    /** Authorable destinations plus a small closed set of engine outputs. */
    public static function destination(string $path):void
    {
        if(in_array($path,['assets/css/tailwind.css','mcp.php','submit.php','llms.txt','robots.txt','sitemap.xml','actions-bar.js','actions-bar.css','actions/manifest.json','actions/submit.php'],true)
            || preg_match('#^(i18n/[a-z]{2}(?:-[A-Z]{2})?/[a-z-]+|actions/i18n/[a-z]{2}(?:-[A-Z]{2})?)\\.json$#D',$path)) return;
        SitePathPolicy::canonical($path,true);
    }

    private function verifyRetained(string $root,array $manifest):void
    {
        foreach(['before'=>$manifest['before'],'candidate'=>$manifest['after']] as $folder=>$hashes) foreach($hashes as $path=>$hash) {
            if($hash===null)continue;
            $source=SiteWorkspace::resolveWithin($root.'/'.$folder,$path);
            if($this->hash($source)!==$hash) throw new OperationException('content_conflict','Retained publish or recovery bytes failed verification.',['path'=>$path]);
        }
    }
    private function consistent(array $operation):bool
    {
        $r=$operation['recovery'];if(!$r)return true;
        foreach($this->liveHashes(array_keys($r['before'])) as $path=>$hash) {
            if($hash!==$r['before'][$path] && $hash!==($r['after'][$path]??null))return false;
        }return true;
    }
    /** Trusted rollback-only seam; cannot be used as normal actor continuation. */
    public function restoreForOwnerRecovery(array $operation): array
    {
        OwnerRecoveryService::assertClaim($this->db, $this->workspace, $operation);
        return $this->restore($operation);
    }

    private function restore(array $operation):array
    {
        $r=$operation['recovery'];if(!$r)return ['restored'=>true,'remaining_paths'=>[]];
        $root=$this->releases->stage($r['plan_id']);$remaining=[];
        foreach($r['files'] as $entry) {
            $path=$entry['path'];
            try {
                $target=$this->workspace->resolvePublished($path,true);
                $current=$this->hash($target);
                if($current!==$entry['before_hash'] && $current!==$entry['after_hash']) {
                    throw new \RuntimeException('A live path changed outside the retained publish operation.');
                }
                if($entry['before_hash']===null) {
                    if(is_file($target) && !unlink($target))throw new \RuntimeException('Cannot remove a partial release file.');
                } else {
                    $source=SiteWorkspace::resolveWithin($root.'/before',$path);
                    $content=$this->readLive($source);
                    if($content===null || hash('sha256',$content)!==$entry['before_hash'])throw new \RuntimeException('Original bytes are unavailable.');
                    $this->writeLive($target,$content);
                }
                if($this->hash($target)!==$entry['before_hash'])throw new \RuntimeException('Restore verification failed.');
                if(function_exists('opcache_invalidate'))@opcache_invalidate($target,true);
            }catch(\Throwable){$remaining[]=$path;}
        }
        try{if($this->liveHashes(array_keys($r['before']))!==$r['before'])$remaining[]='published_manifest';}
        catch(\Throwable){$remaining[]='published_manifest';}
        return ['restored'=>$remaining===[],'remaining_paths'=>array_values(array_unique($remaining))];
    }
    private function liveHashes(array $paths):array
    {
        $out=[];foreach($paths as $path){self::destination($path);$out[$path]=$this->hash($this->workspace->resolvePublished($path,true));}
        ksort($out,SORT_STRING);return $out;
    }
    private function readLive(string $path,int $byteLimit=self::MAX_BYTES):?string
    {
        clearstatcache(true,$path);
        if(!file_exists($path))return null;
        $before=lstat($path);
        if(!$before || !is_file($path) || is_link($path) || $before['size']>min($byteLimit,self::MAX_BYTES))throw new OperationException('size_limit','A live file exceeds the remaining publish recovery budget.');
        $content=file_get_contents($path,false,null,0,$before['size']+1);
        $verify=file_get_contents($path,false,null,0,$before['size']+1);
        clearstatcache(true,$path);$after=lstat($path);
        if($content===false || !$after || is_link($path) || $before['ino']!==$after['ino']
            || strlen($content)!==$before['size'] || strlen($content)!==$after['size'] || $verify!==$content) {
            throw new OperationException('content_conflict','Cannot capture consistent live bytes.');
        }
        return $content;
    }
    private function hash(string $path):?string
    {
        $content=$this->readLive($path);
        return $content===null?null:hash('sha256',$content);
    }
    private function writeLive(string $path,string $content):void
    {
        if(!is_dir(dirname($path)) && !mkdir(dirname($path),0755,true))throw new OperationException('host_capability_unavailable','Cannot create a live directory.');
        $tmp=tempnam(dirname($path),'.publish-');
        if($tmp===false)throw new OperationException('host_capability_unavailable','Cannot stage a live replacement.');
        try {
            if(file_put_contents($tmp,$content)!==strlen($content) || !chmod($tmp,0644) || !rename($tmp,$path))throw new OperationException('host_capability_unavailable','Cannot install a live replacement.');
        }finally{if(is_file($tmp))unlink($tmp);}
    }
    private function staticBytes(string $path):string
    {
        $bytes=is_file($path)?file_get_contents($path):false;
        if($bytes===false)throw new OperationException('host_capability_unavailable','A shipped publish dependency is missing.');
        return $bytes;
    }
    private function hook(string $phase,array $operation):void {if($this->testHook!==null)($this->testHook)($phase,$operation);}
    private static function object(array $fields):array
    {return ['type'=>'object','properties'=>$fields,'required'=>array_keys($fields),'additionalProperties'=>false];}
}
