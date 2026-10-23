<?php
declare(strict_types=1);
// Developer harness, deliberately outside the package being qualified.
$root=realpath($argv[1]??'');$phase=$argv[2]??'';$base=$argv[3]??'';
if(PHP_SAPI!=='cli'||!$root||$root!==($argv[1]??'')
    ||!str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-distribution-')
    ||!is_file($root.'/.distribution-fixture')||realpath($root.'/site')!==$root.'/site')
    throw new RuntimeException('Canonical disposable distribution root required.');
$site=$root.'/site';
if(!in_array($phase,['legacy-seed','activate','lifecycle','inspect','revoke'],true))throw new RuntimeException('Unknown distribution phase.');
// Activation needs real same-server HTTP privacy probes. Other stages trap all
// provider dispatch before network; no application runtime source is replaced.
$GLOBALS['lifecycle_provider_attempts']=0;
if($phase==='activate')$GLOBALS['distribution_privacy_base']=$base;
require __DIR__.'/distribution-provider-trap.php';
require $site.'/_studio/engine/bootstrap.php';
if(!str_starts_with((new ReflectionClass(VoxelSite\Database::class))->getFileName(),$site.'/'))throw new RuntimeException('Loaded runtime outside ZIP/baseline installation.');
use VoxelSite\{Database,FileManager,Migrator,Settings,SiteWorkspace,SnapshotService,WorkspaceActivationService};
use VoxelSite\Agent\{ActorPolicy,AuthoringBriefService,BriefStore,ChangeSetExecutor,ChangeSetService,ChangeSetStore,
    ContextService,CredentialService,FileReadService,OperationActor,OperationStore,PublishPlanService,ReleaseStore,RestorePlanService,WorkspaceFiles};
$db=Database::getInstance($site.'/_studio/data/studio.db');$settings=new Settings($db);$checks=[];
function distributionCheck(bool $ok,string $message):void{global $checks;if(!$ok)throw new RuntimeException('FAIL '.$message);$checks[]=$message;}
function distributionCopy(string $from,string $to):void{
    if(is_link($from)||is_link($to))throw new RuntimeException('Fixture content copy refuses links.');
    if(is_dir($from)){if(!is_dir($to))mkdir($to,0700,true);foreach(scandir($from) as $name)if($name!=='.'&&$name!=='..')distributionCopy($from.'/'.$name,$to.'/'.$name);}
    else{if(!is_dir(dirname($to)))mkdir(dirname($to),0700,true);if(!copy($from,$to))throw new RuntimeException('Content copy failed.');}
}
function distributionFinish(object $service,OperationActor $actor,array $state):array{
    for($i=0;$state['status']==='applying'&&$i<150;$i++)$state=$service->continue($actor,$state['operation_id'],$state['checkpoint']);
    distributionCheck($state['status']==='succeeded','Retained '.$state['operation_id'].' completes');return $state;
}
function distributionDigest(string $path):array{
    $result=[];if(!is_dir($path))return $result;
    foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path,FilesystemIterator::SKIP_DOTS)) as $entry){
        if($entry->isLink())continue;if($entry->isFile())$result[substr($entry->getPathname(),strlen($path)+1)]=hash_file('sha256',$entry->getPathname());
    }ksort($result);return $result;
}
if($phase==='legacy-seed'){
    distributionCheck(trim(file_get_contents($site.'/VERSION'))==='1.32.0','Baseline is actually 1.32.0');
    $fixture=dirname(__DIR__).'/fixtures/mcp/site-lifecycle/site';
    foreach(scandir($fixture) as $name)if(!in_array($name,['.','..','assets'],true))distributionCopy($fixture.'/'.$name,$site.'/_studio/preview/'.$name);
    distributionCopy($fixture.'/assets',$site.'/assets');
    $assets=$site.'/_studio/preview/assets';if(is_dir($assets)){foreach(scandir($assets) as $name)if(!in_array($name,['.','..','.gitkeep'],true))throw new RuntimeException('Unexpected baseline draft assets');@unlink($assets.'/.gitkeep');rmdir($assets);}
    if(!file_exists($assets)&&!is_link($assets))symlink('../../assets',$assets);
    $settings->setMany(['site_url'=>$base,'agent_api_enabled'=>true]);
    (new FileManager($db))->syncPageRegistry(true);
    (new VoxelSite\PublishService($db,$settings))->publish(false,'studio');
    // Distinct installation-owned bytes expose any accidental seed replacement.
    foreach(['index.php'=>"\n<!-- retained legacy homepage -->\n",'favicon.ico'=>"\nRETAINED-LEGACY-FAVICON\n",
        '.htaccess'=>"\n# Retained legacy host configuration\n",'LocalValetDriver.php'=>"\n/* Retained legacy local driver */\n"] as $path=>$suffix){
        distributionCheck(is_file($site.'/'.$path),'Real baseline contains '.$path);
        file_put_contents($site.'/'.$path,$suffix,FILE_APPEND);
    }
    $key=(new VoxelSite\AgentAuth($db))->createKey('Pre-upgrade REST publisher','agent');
    file_put_contents($root.'/legacy-credential.txt',$key['key']);chmod($root.'/legacy-credential.txt',0600);
    file_put_contents($root.'/legacy-key.json',json_encode($db->queryOne('SELECT * FROM api_keys WHERE id = ?',[$key['id']]),JSON_THROW_ON_ERROR));
    file_put_contents($site.'/hosting-preserved.txt','UNRELATED HOSTING BYTES');
    if(!is_dir($site.'/_data'))mkdir($site.'/_data',0700);
    file_put_contents($site.'/_data/qualification-preserved.json','{"private":"retained business bytes"}');
    distributionCheck(is_file($site.'/index.php'),'Real baseline publisher created the legacy live page');
}elseif($phase==='activate'){
    $result=(new Migrator($db,$settings))->run();$workspace=new SiteWorkspace($db);
    $url=parse_url($base);$activation=new WorkspaceActivationService($workspace,$db);
    for($i=0;$i<150;$i++){
        $state=$activation->continue($base,['SERVER_ADDR'=>'127.0.0.1','SERVER_PORT'=>$url['port']],10);
        if($state['status']==='complete')break;
    }
    distributionCheck($state['status']==='complete'&&$workspace->status()['ready'],'Real privacy probe and bounded workspace migration complete');
    distributionCheck((bool)$db->scalar("SELECT name FROM sqlite_master WHERE name='studio_mcp_connection_events'"),'Migration039 is active');
    $settings->setMany(['site_url'=>$base,'studio_mcp_enabled'=>true,'agent_api_enabled'=>true]);
    if(is_file($root.'/legacy-key.json')){
        $old=json_decode(file_get_contents($root.'/legacy-key.json'),true,32,JSON_THROW_ON_ERROR);$current=$db->queryOne('SELECT * FROM api_keys WHERE id = ?',[$old['id']]);
        foreach($old as $field=>$value)if($field!=='last_used_at')distributionCheck($current[$field]===$value,'Upgrade preserves REST '.$field);
        distributionCheck((int)$db->scalar('SELECT user_id FROM agent_rest_owners WHERE key_id = ?',[$old['id']])===1,'Upgrade binds legacy REST key to sole owner');
    }
}elseif($phase==='lifecycle'){
    $workspace=new SiteWorkspace($db);$workspace->assertReady();$policy=new ActorPolicy($db);
    $owner=new OperationActor('user',1,null,[],'studio_configured',null);$credentials=new CredentialService($db);
    $key=$credentials->create($owner,1,'publish','ZIP lifecycle',null,time()+3600,['restore:live']);$actor=$policy->fromCredential($key['id']);
    file_put_contents($root.'/mcp-credential.txt',$key['key']);chmod($root.'/mcp-credential.txt',0600);file_put_contents($root.'/mcp-credential-id.txt',(string)$key['id']);
    $fm=new FileManager($db,$workspace);
    if(!is_file($workspace->resolveDraft('about.php'))){
        $fixture=dirname(__DIR__).'/fixtures/mcp/site-lifecycle/site';
        foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($fixture,FilesystemIterator::SKIP_DOTS)) as $entry)
            if($entry->isFile())$fm->writeExactFile(substr($entry->getPathname(),strlen($fixture)+1),file_get_contents($entry->getPathname()));
    }
    $fm->syncPageRegistry(true);
    $private=$site.'/_studio/data/agent';$operations=new OperationStore($db,$policy,$workspace->mutationLockPath());
    $releases=new ReleaseStore($db,$policy,$private.'/releases');$publish=new PublishPlanService($db,$policy,$workspace,$releases,$operations,filesPerStep:2);
    $plan=$publish->prepare($actor,(object)['request_id'=>'zip-publish-plan-001','base_draft_version'=>'draft:'.$workspace->status()['draft_version']]);
    $published=distributionFinish($publish,$actor,$publish->publish($actor,(object)['operation_id'=>'zip-publish-apply-001','plan_id'=>$plan['plan_id'],'digest'=>$plan['digest']]));
    distributionCheck(is_file($site.'/mcp.php')&&is_file($site.'/index.php'),'Publication installs public endpoints and homepage');
    $reader=new FileReadService($db,$policy,$workspace);$read=$reader->read($actor,(object)['path'=>'index.php']);
    distributionCheck($read['sha256']===hash_file('sha256',$workspace->resolveDraft('index.php')),'Governed file read matches private draft bytes');
    $snapshots=new SnapshotService($db,$policy,$workspace,$releases,$operations,$private.'/snapshots',$site.'/_studio/data/snapshots',$site.'/_studio/data/actions',2);
    $capture=distributionFinish($snapshots,$actor,$snapshots->create($actor,(object)['operation_id'=>'zip-capture-001','domain'=>'both','label'=>'ZIP lifecycle before edit']));
    $before=WorkspaceFiles::hashes(WorkspaceFiles::read($workspace));$live=hash_file('sha256',$site.'/index.php');
    $briefs=new BriefStore($db,$policy);$changes=new ChangeSetStore($db,$policy,$private.'/changes');
    $brief=(new AuthoringBriefService(new ContextService($db,$policy,$workspace),$briefs))->create($actor,['request_id'=>'zip-edit-brief-001','action'=>'edit_page']);
    $old=file_get_contents($workspace->resolveDraft('index.php'));$new=str_replace('</section>','<p>ZIP lifecycle reviewed draft edit.</p></section>',$old);
    distributionCheck($new!==$old,'Lifecycle fixture has a concrete page edit');
    $change=(new ChangeSetService($db,$policy,$workspace,$briefs,$changes))->prepare($actor,(object)['request_id'=>'zip-edit-plan-001',
        'base_draft_version'=>'draft:'.$workspace->status()['draft_version'],'brief_id'=>$brief['brief_id'],'summary'=>'ZIP draft edit',
        'operations'=>[(object)['type'=>'replace','path'=>'index.php','expected_hash'=>hash('sha256',$old),'content'=>$new]]]);
    $executor=new ChangeSetExecutor($db,$policy,$workspace,$changes,$operations,1);
    distributionFinish($executor,$actor,$executor->apply($actor,(object)['operation_id'=>'zip-edit-apply-001','change_set_id'=>$change['change_set_id'],'digest'=>$change['digest']]));
    distributionCheck(hash_file('sha256',$site.'/index.php')===$live,'Draft edit leaves live bytes unchanged');
    $restore=new RestorePlanService($db,$policy,$workspace,$snapshots,$releases,$operations,$snapshots->restoreRoot(),2);
    $review=$restore->prepare($actor,(object)['request_id'=>'zip-restore-plan-001','snapshot_id'=>$capture['result']['snapshot_id'],'domain'=>'draft']);
    distributionFinish($restore,$actor,$restore->apply($actor,(object)['operation_id'=>'zip-restore-apply-001','plan_id'=>$review['plan_id'],'digest'=>$review['digest']]));
    distributionCheck(WorkspaceFiles::hashes(WorkspaceFiles::read($workspace))===$before&&hash_file('sha256',$site.'/index.php')===$live,'Snapshot restore returns exact draft bytes without changing live');
    $recoveryKey=$credentials->create($owner,1,'edit','ZIP interrupted actor',null);$recoveryActor=$policy->fromCredential($recoveryKey['id']);
    $recoveryBrief=(new AuthoringBriefService(new ContextService($db,$policy,$workspace),$briefs))->create($recoveryActor,['request_id'=>'zip-recovery-brief','action'=>'edit_page']);
    $recoveryEdits=[];
    foreach(['index.php','about.php'] as $path){$content=file_get_contents($workspace->resolveDraft($path));$recoveryEdits[]=(object)[
        'type'=>'replace','path'=>$path,'expected_hash'=>hash('sha256',$content),'content'=>str_replace('</section>','<p>Interrupted ZIP edit.</p></section>',$content)];}
    $recoveryPlan=(new ChangeSetService($db,$policy,$workspace,$briefs,$changes))->prepare($recoveryActor,(object)[
        'request_id'=>'zip-recovery-plan','base_draft_version'=>'draft:'.$workspace->status()['draft_version'],'brief_id'=>$recoveryBrief['brief_id'],
        'summary'=>'ZIP recovery checkpoint','operations'=>$recoveryEdits]);
    $partial=$executor->apply($recoveryActor,(object)['operation_id'=>'zip-recovery-apply','change_set_id'=>$recoveryPlan['change_set_id'],'digest'=>$recoveryPlan['digest']]);
    distributionCheck($partial['status']==='applying','Real ZIP runtime retains an interrupted change checkpoint');
    $operation=$operations->get($recoveryActor,$partial['operation_id']);$credentials->revoke($owner,$recoveryKey['id']);
    $ownerRecovery=\VoxelSite\StudioOwnerRecovery::create($db,$workspace,loadConfig());$recovery=$ownerRecovery->review($owner,$operation['id']);
    $recovered=$ownerRecovery->recover($owner,$operation['id'],$recovery['review_id'],$recovery['digest']);
    distributionCheck($recovered['status']==='failed_restored' && WorkspaceFiles::hashes(WorkspaceFiles::read($workspace))===$before,
        'Owner restores exact bytes after original ZIP actor revocation');
    $actions=new \VoxelSite\Agent\ActionService($db,$policy,$workspace,$site.'/_studio/data/actions',$site.'/_data/actions.db',
        \VoxelSite\Agent\ActionConfiguration::draftPath($workspace),$site.'/_studio/action-templates');
    distributionCheck($actions->templates($owner,new stdClass())['total']===9,'ZIP runtime exposes all nine shipped Action templates');
    $mode=trim(file_get_contents($root.'/.distribution-mode'));
    if($mode==='fresh')distributionCheck(!is_dir($site.'/_studio/tests'),'Fresh ZIP contains no executable tests');
    distributionCheck(!array_filter(get_included_files(),static fn($path)=>str_starts_with($path,$site.'/_studio/tests/')),
        'Lifecycle loads no application code from retained legacy tests');
}elseif($phase==='revoke'){
    $credentials=new CredentialService($db);$owner=new OperationActor('user',1,null,[],'studio_configured',null);
    $credentials->revoke($owner,(int)file_get_contents($root.'/mcp-credential-id.txt'));$checks[]='Lifecycle MCP credential revoked';
}
distributionCheck(($GLOBALS['lifecycle_provider_attempts']??0)===0,'No provider calls');
$result=['phase'=>$phase,'php'=>PHP_VERSION,'checks'=>$checks,'version'=>trim(file_get_contents($site.'/VERSION')),
    'schema_version'=>$settings->get('schema_version'),'migrations'=>array_map('basename',glob($site.'/_studio/engine/migrations/*.php')),
    'schema_sha256'=>hash('sha256',json_encode($db->query("SELECT type,name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name"),JSON_THROW_ON_ERROR)),
    'public_assets_sha256'=>hash('sha256',json_encode(distributionDigest($site.'/assets'),JSON_THROW_ON_ERROR)),
    'config_sha256'=>hash_file('sha256',$site.'/_studio/data/config.json'),'draft'=>distributionDigest($site.'/_studio/preview'),
    'public_index_sha256'=>is_file($site.'/index.php')?hash_file('sha256',$site.'/index.php'):null,
    'business_canary_sha256'=>is_file($site.'/_data/qualification-preserved.json')?hash_file('sha256',$site.'/_data/qualification-preserved.json'):null,
    'hosting_canary_sha256'=>is_file($site.'/hosting-preserved.txt')?hash_file('sha256',$site.'/hosting-preserved.txt'):null,
    'legacy_tests_present'=>is_dir($site.'/_studio/tests'),'provider_attempts'=>$GLOBALS['lifecycle_provider_attempts']??0];
$result['privacy_probe_requests']=$GLOBALS['distribution_privacy_requests']??0;
echo json_encode($result,JSON_THROW_ON_ERROR|JSON_UNESCAPED_SLASHES)."\n";
