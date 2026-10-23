<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,Settings,SiteWorkspace,SiteMutationLock,SiteRecovery,GitUpdater};

/** Exact review and allocation; the frozen runtime owns system-file activation. */
final class UpdateService
{
    private string $root;
    private string $database;
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,
        private UpdatePackageStore $packages,private AdminApprovalStore $approvals,private OperationStore $operations,
        ?string $projectRoot=null)
    {
        $this->root=$projectRoot??$workspace->publishedRoot();if(realpath($this->root)!==$this->root||is_link($this->root))throw new \InvalidArgumentException('The update root must be canonical.');
        $main=array_values(array_filter($db->query('PRAGMA database_list'),fn($row)=>$row['name']==='main'))[0]??null;
        if(!$main||!is_file($main['file']))throw new \InvalidArgumentException('The update database must be a retained file.');$this->database=$main['file'];
    }
    public static function inputSchema(string $method):array
    {
        $c=ToolContracts::class;
        return match($method){
            'inspect'=>$c::object([]),'prepare'=>$c::object(['package_id'=>$c::id('update'),'operation_id'=>$c::requestId()]),
            'packages'=>$c::object(['offset'=>$c::integer(100),'limit'=>['type'=>'integer','minimum'=>1,'maximum'=>20]],[]),
            'stage_local'=>$c::object(['request_id'=>$c::requestId(),'filename'=>['type'=>'string','pattern'=>'^[A-Za-z0-9][A-Za-z0-9_.-]{0,119}\.zip$']]),
            'stage_git'=>$c::object(['request_id'=>$c::requestId()]),
            'apply'=>$c::object(['plan_id'=>$c::id('admin'),'digest'=>$c::hash()]),
            default=>throw new \InvalidArgumentException('Unknown update method.'),
        };
    }
    public static function outputSchema(string $method):array
    {
        $c=ToolContracts::class;
        return match($method){
            'inspect'=>$c::object(['current_version'=>$c::text(64),'zip_supported'=>['type'=>'boolean'],'runtime_supported'=>['type'=>'boolean'],'git_supported'=>['type'=>'boolean'],'message'=>$c::text(2000),'limits'=>$c::object(['archive_bytes'=>$c::integer(),'expanded_bytes'=>$c::integer(),'entries'=>$c::integer(),'review_files'=>$c::integer()]),'provider_calls'=>['const'=>0]]),
            'prepare'=>AdminApprovalStore::outputSchema(),'apply'=>$c::operation(),
            'stage_local','stage_git'=>UpdatePackageStore::outputSchema(),
            'packages'=>$c::object(['current_version'=>$c::text(64),'packages'=>$c::list($c::object(['filename'=>$c::text(124),'version'=>$c::text(64),'size'=>$c::integer(UpdatePackagePolicy::MAX_ARCHIVE_BYTES),'modified'=>$c::text(40)]),20),'next_offset'=>$c::nullable($c::integer(100)),'provider_calls'=>['const'=>0]]),
            default=>throw new \InvalidArgumentException('Unknown update method.'),
        };
    }
    public static function resultSchema():array
    {$c=ToolContracts::class;return $c::object(['operation_id'=>$c::requestId(),'provider_calls'=>['const'=>0],'from_version'=>$c::text(64),'to_version'=>$c::text(64),'files_updated'=>$c::integer(1500),'files_preserved'=>$c::integer(UpdatePackagePolicy::MAX_ENTRIES),'migrations_run'=>$c::integer(100),'package_sha256'=>$c::hash(),'restoration'=>$c::restoration(),'reload_required'=>['const'=>true]]);}
    public function inspect(OperationActor $actor,\stdClass $input):array
    {
        $this->policy->require($actor,['updates:write']);JsonSchema::validate($input,self::inputSchema('inspect'));
        $runtime=$this->runtimeSupported();
        return ['current_version'=>$this->version(),'zip_supported'=>class_exists(\ZipArchive::class),'runtime_supported'=>$runtime,'git_supported'=>(new GitUpdater($this->root))->available()['ok'],
            'message'=>$runtime?'Updates require an exact package review and a current owner approval.':'This installation needs the permanent update recovery bridge before supported updates can run.',
            'limits'=>['archive_bytes'=>UpdatePackagePolicy::MAX_ARCHIVE_BYTES,'expanded_bytes'=>UpdatePackagePolicy::MAX_INFLATED_BYTES,'entries'=>UpdatePackagePolicy::MAX_ENTRIES,'review_files'=>1500],'provider_calls'=>0];
    }
    public function packages(OperationActor $actor,\stdClass $input):array
    {
        $this->policy->require($actor,['updates:write']);JsonSchema::validate($input,self::inputSchema('packages'));
        if(!class_exists(\ZipArchive::class))throw new OperationException('host_capability_unavailable','The PHP ZIP extension is required to inspect update packages.');
        $directory=SiteWorkspace::resolveWithin($this->root,'dist');$files=[];
        if(is_dir($directory)){
            $entries=0;foreach(new \DirectoryIterator($directory) as $entry){if($entry->isDot())continue;if(++$entries>200)throw new OperationException('size_limit','The distribution directory exceeds its scan budget.');if(preg_match('/^[A-Za-z0-9][A-Za-z0-9_.-]{0,119}\.zip$/D',$entry->getFilename()))$files[]=$entry->getFilename();}
        }
        sort($files,SORT_STRING);if(count($files)>100)throw new OperationException('size_limit','Too many retained distribution packages.');$out=[];$start=microtime(true);$offset=$input->offset??0;$limit=$input->limit??20;
        foreach(array_slice($files,$offset,$limit) as $name){
            $path=SiteWorkspace::resolveWithin($directory,$name);$stat=lstat($path);if(!$stat||!is_file($path)||$stat['size']>UpdatePackagePolicy::MAX_ARCHIVE_BYTES)continue;
            $zip=new \ZipArchive();if($zip->open($path,\ZipArchive::CHECKCONS)!==true)continue;
            try{$inventory=UpdatePackagePolicy::inventory($zip);$out[]=['filename'=>$name,'version'=>$inventory['version'],'size'=>$stat['size'],'modified'=>gmdate('c',$stat['mtime'])];}catch(OperationException){}finally{$zip->close();}
            if(microtime(true)-$start>4)throw new OperationException('host_capability_unavailable','Package listing exceeds this host scan budget.');
        }
        return ['current_version'=>$this->version(),'packages'=>$out,'next_offset'=>$offset+$limit<count($files)?$offset+$limit:null,'provider_calls'=>0];
    }
    public function stageLocal(OperationActor $actor,\stdClass $input):array
    {
        $this->policy->require($actor,['updates:write']);JsonSchema::validate($input,self::inputSchema('stage_local'));
        $directory=SiteWorkspace::resolveWithin($this->root,'dist');if(!is_dir($directory))throw new OperationException('not_found','The distribution directory is unavailable.');
        return $this->packages->importArchive($actor,SiteWorkspace::resolveWithin($directory,$input->filename),$input->filename,$input->request_id,'local');
    }
    public function stageGit(OperationActor $actor,\stdClass $input):array
    {
        $this->policy->require($actor,['updates:write']);JsonSchema::validate($input,self::inputSchema('stage_git'));$this->workspace->assertReady();
        $sourceRoot=$this->packages->root();if(!is_dir($sourceRoot)&&!mkdir($sourceRoot,0700))throw new OperationException('host_capability_unavailable','Private Git staging is unavailable.');
        if(!is_file($sourceRoot.'/.htaccess'))WorkspaceFiles::write($sourceRoot,'.htaccess',"Require all denied\nDeny from all\n");
        $key='source-'.hash('sha256',$actor->identity()."\0".$input->request_id);$archive=SiteWorkspace::resolveWithin($sourceRoot,$key.'.zip');
        $lock=fopen(SiteWorkspace::resolveWithin($sourceRoot,$key.'.lock'),'c');if(!$lock||!flock($lock,LOCK_EX|LOCK_NB)){if($lock)fclose($lock);throw new OperationException('site_busy','This exact Git candidate is still being staged.');}
        try{
            $prior=$this->packages->priorSource($actor,$input->request_id,'git');
            if($prior){if(is_file($archive)&&!unlink($archive))throw new OperationException('write_failed','Cannot release the retained Git source.');$this->packages->releaseSource($actor,$input->request_id);return $prior;}
            $reservation=$this->packages->reserveSource($actor,$input->request_id);
            $meta=$reservation['metadata_json']===null?null:json_decode($reservation['metadata_json'],true,16,JSON_THROW_ON_ERROR);
            // A process may have died before sealing its archive. Rebuild the same retained commit.
            if(is_file($archive)&&!unlink($archive))throw new OperationException('write_failed','Cannot restart the exact Git archive.');
            try{$meta=(new GitUpdater($this->root))->stageCandidate($archive,$meta,
                fn(array $identity)=>$this->packages->retainSource($actor,$input->request_id,$identity));}
            catch(\RuntimeException $error){throw new OperationException('host_capability_unavailable',$error->getMessage());}
            if(!$meta['ok'])throw new OperationException('host_capability_unavailable',$meta['message']);
            $state=$this->packages->importArchive($actor,$archive,'git-'.$meta['to_sha'].'.zip',$input->request_id,'git');
            if(!unlink($archive))throw new OperationException('write_failed','Cannot release the retained Git source.');
            $this->packages->releaseSource($actor,$input->request_id);
            return $state;
        }finally{flock($lock,LOCK_UN);fclose($lock);}
    }
    public function prepare(OperationActor $actor,\stdClass $input):array
    {
        $this->policy->require($actor,['updates:write','operations:read']);JsonSchema::validate($input,self::inputSchema('prepare'));
        $existing=$this->db->queryOne('SELECT * FROM agent_update_reviews WHERE actor_key=? AND request_id=?',[$actor->identity(),$input->operation_id]);
        if($existing){
            $this->packages->staged($actor,$input->package_id);
            if($existing['package_id']!==$input->package_id)throw new OperationException('idempotency_conflict','This update review identity belongs to another package.');
            return $this->finishReview($actor,$input,json_decode($existing['manifest_json'],true,64,JSON_THROW_ON_ERROR),$existing['manifest_json']);
        }
        $this->workspace->assertReady();if(!$this->runtimeSupported())throw new OperationException('host_capability_unavailable','Install the permanent update recovery bridge before updating.');
        $package=$this->packages->staged($actor,$input->package_id);$inventory=$package['manifest'];
        if($package['row']['status']!=='staged')throw new OperationException('content_conflict','This package already belongs to a retained update review.');
        if(!version_compare($inventory['version'],$this->version(),'>'))throw new OperationException('unsupported_package','Supported updates must increase the installed version. Downgrades require a separate recovery workflow.');
        foreach(array_merge(['_studio/engine/bootstrap.php','_studio/mcp.php'],isset($inventory['files']['submit.php'])?['submit.php']:[]) as $entry){
            $bytes=BusinessContracts::read($package['directory'],'candidate/'.$entry,UpdatePackagePolicy::MAX_FILE_BYTES);
            if($bytes===null||!UpdatePackagePolicy::gateContract($bytes,$entry))throw new OperationException('unsupported_package','This package does not retain the independent update gate before executable application code.');
        }
        $lock=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);SiteRecovery::assertWritable($this->db);
        $manifest=['root'=>$this->root,'storage'=>$this->packages->root(),'database'=>$this->database,'lock_path'=>$this->workspace->mutationLockPath(),'from_version'=>$this->version(),'to_version'=>$inventory['version'],'archive_hash'=>$package['row']['expected_hash'],'preserved_files'=>$inventory['skipped_files'],'files'=>[],'migrations'=>[]];
        $start=microtime(true);$beforeTotal=0;$candidateTotal=array_sum(array_column($inventory['files'],'bytes'));$reservedBase=(int)$package['row']['expected_bytes']*2+$candidateTotal;$otherReserved=(int)$this->db->scalar('SELECT COALESCE(SUM(reserved_bytes),0) FROM agent_update_packages WHERE id!=?',[$input->package_id])+(int)$this->db->scalar('SELECT COALESCE(SUM(reserved_bytes),0) FROM agent_update_sources');$schema=(new Settings($this->db))->get('schema_version','0.0.0');
        foreach($inventory['files'] as $path=>$file){
            if(!UpdatePackagePolicy::managed($path))throw new OperationException('invalid_package','The retained candidate contains an unsupported destination.');
            $after=BusinessContracts::read($package['directory'],'candidate/'.$path,UpdatePackagePolicy::MAX_FILE_BYTES);
            if($after===null||strlen($after)!==$file['bytes']||!hash_equals($file['sha256'],hash('sha256',$after)))throw new OperationException('content_conflict','A staged update file changed before review.');
            $before=BusinessContracts::read($this->root,$path,UpdatePackagePolicy::MAX_FILE_BYTES);
            if($before!==$after){
                if(count($manifest['files'])>=1500)throw new OperationException('host_capability_unavailable','This update exceeds the 1,500 changed-file review budget.');
                $beforeTotal+=strlen($before??'');if($otherReserved+$reservedBase+$beforeTotal>UpdatePackageStore::MAX_STORAGE||disk_free_space($package['directory'])<strlen($before??'')+8388608)throw new OperationException('size_limit','Retaining update originals would exceed the private storage budget.');
                $this->db->update('agent_update_packages',['reserved_bytes'=>max((int)$package['row']['reserved_bytes'],$reservedBase+$beforeTotal)],'id=?',[$input->package_id]);
                if($before!==null)WorkspaceFiles::write($package['directory'],'before/'.$path,$before);
                $manifest['files'][]=['path'=>$path,'effect'=>'replace','before_hash'=>$before===null?null:hash('sha256',$before),'after_hash'=>$file['sha256'],'before_bytes'=>strlen($before??''),'after_bytes'=>$file['bytes']];
            }
            if(preg_match('~^_studio/engine/migrations/[0-9]+_[A-Za-z0-9_]+\.php$~D',$path)){
                if(!preg_match('/[\'"]version[\'"]\s*=>\s*[\'"]([0-9]+(?:\.[0-9]+){2,4})[\'"]/',$after,$match))throw new OperationException('unsupported_package','An update migration has no inspectable literal version.');
                if(version_compare($match[1],$schema,'>'))$manifest['migrations'][]=['path'=>$path,'version'=>$match[1],'sha256'=>$file['sha256']];
            }
            if(microtime(true)-$start>5)throw new OperationException('host_capability_unavailable','This update exceeds the host preparation time budget.');
        }
        if(count($manifest['migrations'])>100)throw new OperationException('host_capability_unavailable','This update exceeds the migration count budget.');
        usort($manifest['migrations'],fn($a,$b)=>strcmp($a['path'],$b['path']));
        // Keep VERSION last; the running application remains maintenance-gated until all bytes and schema verify.
        usort($manifest['files'],fn($a,$b)=>($a['path']==='VERSION'?1:0)<=>($b['path']==='VERSION'?1:0)?:strcmp($a['path'],$b['path']));
        $manifest['closure']=$this->executionClosure($inventory['files'],$start);
        $runtime=$this->freezeRuntime($package['directory']);$manifest['runtime_files']=$runtime;
        $json=CanonicalJson::encode($manifest);if(strlen($json)>1048576)throw new OperationException('size_limit','The exact update review exceeds its retained manifest budget.');
        $this->db->transaction(function()use($actor,$input,$json):void{$this->db->insert('agent_update_reviews',['plan_id'=>'pending_'.$input->package_id,'package_id'=>$input->package_id,'actor_key'=>$actor->identity(),'request_id'=>$input->operation_id,'manifest_json'=>$json]);$this->db->update('agent_update_packages',['status'=>'prepared'],'id=?',[$input->package_id]);});
        return $this->finishReview($actor,$input,$manifest,$json);
    }
    private function finishReview(OperationActor $actor,\stdClass $input,array $manifest,string $json):array
    {
        $review=['summary'=>'Update VoxelSite from '.$manifest['from_version'].' to '.$manifest['to_version'].'.','effects'=>[count($manifest['files']).' exact system files will be replaced.',count($manifest['migrations']).' schema migrations will run after file verification.'],'preserved'=>['Website pages and partials','Private draft, data, credentials and business records','Hosting rules and the independent recovery bridge'],'secret_fields'=>[],'files'=>$manifest['files'],'final_boundary'=>'The independent runtime keeps status and recovery available while Studio is in maintenance. Once schema execution begins, file-only rollback is unavailable; a failed migration requires database and code recovery together.'];
        $plan=$this->approvals->prepare($actor,$input->operation_id,'update.apply',['package_id'=>$input->package_id,'manifest_sha256'=>hash('sha256',$json),'runtime_hash'=>hash('sha256',CanonicalJson::encode($manifest['runtime_files']))],$review,['updates:write','operations:read']);
        $this->db->update('agent_update_reviews',['plan_id'=>$plan['plan_id']],'actor_key=? AND request_id=?',[$actor->identity(),$input->operation_id]);
        return $plan;
    }
    public function apply(OperationActor $actor,\stdClass $input):array
    {
        $this->policy->require($actor,['updates:write','operations:read']);JsonSchema::validate($input,self::inputSchema('apply'));
        $plan=$this->approvals->authorizeExecution($actor,$input->plan_id,$input->digest,function(array $payload,array $plan)use($actor,$input):string{
            $review=$this->db->queryOne('SELECT * FROM agent_update_reviews WHERE plan_id=?',[$input->plan_id]);
            if(!$review||$review['package_id']!==$payload['package_id']||!hash_equals($payload['manifest_sha256'],hash('sha256',$review['manifest_json'])))throw new OperationException('content_conflict','The retained exact update review changed.');
            $manifest=json_decode($review['manifest_json'],true,64,JSON_THROW_ON_ERROR);
            $row=$this->operations->prepare($actor,$plan['operation_id'],'update.apply',(object)['plan_id'=>$input->plan_id,'digest'=>$input->digest],'system:'.$manifest['from_version'],$review['package_id']);
            $this->db->insert('agent_update_jobs',['operation_row_id'=>$row['id'],'package_id'=>$review['package_id'],'plan_id'=>$input->plan_id,'manifest_json'=>$review['manifest_json'],'manifest_sha256'=>$payload['manifest_sha256'],'runtime_hash'=>$payload['runtime_hash']]);
            return $row['operation_id'];
        });
        $row=$this->operations->get($actor,$plan['result']['operation_id']);
        return $row['state']==='prepared'?$this->continue($actor,$row['operation_id'],0):OperationRunner::publicState($row);
    }
    public function continue(OperationActor $actor,string $operationId,int $checkpoint):array
    {
        $this->policy->require($actor,['updates:write','operations:read']);$row=$this->operations->get($actor,$operationId);
        if($row['kind']!=='update.apply')throw new OperationException('invalid_schema','This is not a system update operation.');
        if($row['phase']==='migrations'&&class_exists(Database::class,false)){
            $job=$this->db->queryOne('SELECT migration_index,manifest_json FROM agent_update_jobs WHERE operation_row_id=?',[$row['id']]);
            $manifest=$job?json_decode($job['manifest_json'],true,64,JSON_THROW_ON_ERROR):[];
            if($job&&(int)$job['migration_index']<count($manifest['migrations']??[]))return OperationRunner::publicState($row);
        }
        $runtime=$this->runtime($row);
        try{return $runtime->advance($actor->attribution(),$operationId,$checkpoint);}
        catch(\VoxelSite\UpdateRuntime\Failure $error){throw new OperationException($error->errorCode,$error->getMessage());}
    }
    private function runtime(array $row):\VoxelSite\UpdateRuntime\Runtime
    {
        $job=$this->db->queryOne('SELECT * FROM agent_update_jobs WHERE operation_row_id=?',[$row['id']]);if(!$job)throw new OperationException('recovery_required','The update runtime is missing.');
        $manifest=json_decode($job['manifest_json'],true,64,JSON_THROW_ON_ERROR);$directory=$this->packages->root().'/'.$job['package_id'];
        foreach($manifest['runtime_files'] as $path=>$hash){$bytes=BusinessContracts::read($directory,'runtime/'.$path,2097152);if($bytes===null||!hash_equals($hash,hash('sha256',$bytes)))throw new OperationException('recovery_required','The frozen update runtime failed integrity verification.');}
        if(class_exists(\VoxelSite\UpdateRuntime\Runtime::class,false)){
            $loaded=(new \ReflectionClass(\VoxelSite\UpdateRuntime\Runtime::class))->getFileName();
            if(!$loaded||!hash_equals($manifest['runtime_files']['core.php'],hash_file('sha256',$loaded)))throw new OperationException('host_capability_unavailable','Continue this update in a fresh independent runtime request.');
        }else require_once $directory.'/runtime/core.php';
        return new \VoxelSite\UpdateRuntime\Runtime($this->root,$this->packages->root(),$this->database,$this->workspace->mutationLockPath());
    }
    private function freezeRuntime(string $directory):array
    {
        $files=['core.php'=>dirname(__DIR__,2).'/static/update-runtime-core.php','profile.php'=>__DIR__.'/ProtocolProfile.php',
            'ProviderCallPolicy.php'=>__DIR__.'/ProviderCallPolicy.php','ProviderCallForbidden.php'=>__DIR__.'/ProviderCallForbidden.php'];$hashes=[];
        foreach($files as $name=>$source){$bytes=BusinessContracts::read(dirname($source),basename($source),2097152);if($bytes===null)throw new OperationException('host_capability_unavailable','The independent update runtime is unavailable.');WorkspaceFiles::write($directory,'runtime/'.$name,$bytes);$hashes[$name]=hash('sha256',$bytes);}
        return $hashes;
    }
    /** Seal existing autoload dependencies as well as every candidate, even byte-identical files. */
    private function executionClosure(array $candidate,float $start):array
    {
        $closure=$candidate;$total=array_sum(array_column($candidate,'bytes'));
        foreach(['_studio/engine','vendor'] as $relative){
            $directory=SiteWorkspace::resolveWithin($this->root,$relative);if(!is_dir($directory))continue;
            $iterator=new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($directory,\FilesystemIterator::SKIP_DOTS),\RecursiveIteratorIterator::SELF_FIRST);
            foreach($iterator as $file){
                if($file->isLink())throw new OperationException('unsupported_package','Update execution dependencies cannot use symlinks.');
                if($file->isDir())continue;
                $path=substr($file->getPathname(),strlen($this->root)+1);
                if(!isset($closure[$path])){
                    $bytes=BusinessContracts::read($this->root,$path,UpdatePackagePolicy::MAX_FILE_BYTES);
                    if($bytes===null)throw new OperationException('content_conflict','An update dependency changed during review.');
                    $closure[$path]=['bytes'=>strlen($bytes),'sha256'=>hash('sha256',$bytes)];$total+=strlen($bytes);
                }
                if(count($closure)>UpdatePackagePolicy::MAX_ENTRIES||$total>UpdatePackagePolicy::MAX_INFLATED_BYTES)throw new OperationException('host_capability_unavailable','The update execution dependency closure exceeds this host budget.');
                if(microtime(true)-$start>5)throw new OperationException('host_capability_unavailable','Update dependency verification exceeds this host time budget.');
            }
        }
        ksort($closure,SORT_STRING);return $closure;
    }
    private function runtimeSupported():bool
    {
        foreach(['_studio/update-runtime.php','_studio/update-gate.php'] as $path){$bytes=BusinessContracts::read($this->root,$path,65536);if($bytes===null||!str_contains($bytes,'VOXELSITE_UPDATE_GATE_V1'))return false;}
        $cached=filter_var(ini_get('opcache.enable'),FILTER_VALIDATE_BOOLEAN)&&(PHP_SAPI!=='cli'||filter_var(ini_get('opcache.enable_cli'),FILTER_VALIDATE_BOOLEAN));
        if($cached&&(!function_exists('opcache_get_status')||!function_exists('opcache_is_script_cached')||!function_exists('opcache_invalidate')||!is_array(@opcache_get_status(false))))return false;
        return function_exists('flock')&&extension_loaded('pdo_sqlite');
    }
    private function version():string
    {$version=trim(BusinessContracts::read($this->root,'VERSION',64)??'0.0.0');return preg_match('/^[0-9]+(?:\.[0-9]+){2,4}(?:-[A-Za-z0-9.-]+)?$/D',$version)?$version:'0.0.0';}
}
