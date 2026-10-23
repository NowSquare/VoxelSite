<?php
declare(strict_types=1);
define('MCP_PUBLISH_FIXTURE_ONLY',true);
require __DIR__.'/McpPublishTest.php';
use VoxelSite\{ActionManager,SnapshotService,SiteWorkspace};
use VoxelSite\Agent\{ActionService,ActionConfiguration,CanonicalJson,JsonSchema,WorkspaceFiles,OperationException};
function actionFixture(?Closure $hook=null):array {
    $f=publishFixture();$root=$f['root'];
    $site=['name'=>'Published business','hours'=>['open'=>'09:00','close'=>'17:00'],
        'actions_bar'=>['theme'=>'bottom-bar','visibility'=>'all-pages','pages'=>[],'color_scheme'=>'light','brand_color'=>'']];
    WorkspaceFiles::write($root.'/draft','assets/data/site.json',CanonicalJson::encode($site));
    $definition=['id'=>'contact','name'=>'Contact','description'=>'Contact the business','active'=>true,
        'fields'=>[['name'=>'name','type'=>'text','required'=>true],['name'=>'time','type'=>'time']],'constraints'=>['operating_hours'=>['enabled'=>true]],'notifications'=>['guest_notify'=>false,'owner_notify'=>false]];
    WorkspaceFiles::write($root.'/private/actions','contact.json',CanonicalJson::encode($definition));
    $actions=new ActionService($f['db'],$f['policy'],$f['workspace'],$root.'/private/actions',$root.'/live/_data/actions.db',
        $root.'/draft/assets/data/site.json',dirname(__DIR__).'/action-templates',executionHook:$hook);
    $snapshots=new SnapshotService($f['db'],$f['policy'],$f['workspace'],$f['releases'],$f['operations'],$root.'/private/snapshots',$root.'/private/legacy-snapshots',$root.'/private/actions',100);
    return $f+compact('actions','snapshots','definition','site');
}
function actionInput(array $f,string $id,array $intent):stdClass {return (object)['request_id'=>$id,'version'=>$f['actions']->configurationVersion(),'intent'=>json_decode(CanonicalJson::encode($intent))];}
function actionPublish(array $f,string $id):array {$r=publishComplete($f,publishPrepare($f,$id.'-review'),$id.'-apply');publishCheck($r['status']==='succeeded','Real publish succeeds: '.$id);return $r;}
function actionCapture(array $f,string $id):array {$r=$f['snapshots']->create($f['owner'],(object)['operation_id'=>$id,'domain'=>'published','label'=>'Action release']);for($i=0;$r['status']==='applying'&&$i<100;$i++)$r=$f['snapshots']->continue($f['owner'],$id,$r['checkpoint']);return $r;}
$scenario=$argv[1]??'all';
if(in_array($scenario,['all','construction'],true)) {
    $f=actionFixture();$input=actionInput($f,'missing-assets-bar',['type'=>'bar','settings'=>$f['site']['actions_bar']]);
    rename($f['root'].'/draft/assets',$f['root'].'/private/held-assets');
    $recovery=\VoxelSite\StudioOwnerRecovery::create($f['db'],$f['workspace']);
    publishCheck($recovery->list($f['owner'])['items']===[],'Owner recovery remains constructible and readable with missing draft assets');
    $adapter=new \VoxelSite\Agent\BusinessStudioAdapter($f['db'],$f['workspace']);
    $server=\VoxelSite\Agent\McpApplication::create($f['db'],[],$f['workspace'],$f['root'].'/private/mcp');
    publishCheck($adapter->actions instanceof ActionService&&$server instanceof \VoxelSite\Agent\McpServer,'Studio and MCP wiring do not require an intact draft just to construct recovery-capable services');
    try{$f['actions']->change($f['owner'],$input);throw new LogicException('Bar writes must require ready draft assets');}
    catch(\VoxelSite\WorkspaceNotReadyException $e){publishCheck(str_contains($e->getMessage(),'Private draft assets are missing'),'Actual bar writes still require private draft readiness');}
    publishCheck(!is_dir($f['root'].'/draft/assets')&&(int)$f['db']->scalar('SELECT COUNT(*) FROM agent_business_changes')===0,'Read-only construction does not recreate assets or start a write');
}
if(in_array($scenario,['all','bar'],true)) {
    $f=actionFixture();actionPublish($f,'initial-bar');$live=SiteWorkspace::inventory($f['root'].'/live');$v=$f['workspace']->status()['draft_version'];
    $settings=$f['site']['actions_bar'];$settings['theme']='floating-fab';
    $input=actionInput($f,'private-bar-save',['type'=>'bar','settings'=>$settings]);$result=$f['actions']->change($f['owner'],$input);
    JsonSchema::validate(JsonSchema::output($result),ActionService::outputSchema('change'));
    publishCheck($result['effect']==='draft_write'&&!$result['public_effects_immediate'],'Bar save truthfully reports a private draft effect');
    publishCheck($f['workspace']->status()['draft_version']===$v+1&&CanonicalJson::digest(json_decode(file_get_contents($f['root'].'/draft/assets/data/site.json'),true)['actions_bar'])===CanonicalJson::digest($settings),'Canonical draft settings and version commit together');
    publishCheck(SiteWorkspace::inventory($f['root'].'/live')===$live,'Bar save leaves every published byte unchanged');
    publishCheck($f['actions']->change($f['owner'],$input)===$result&&$f['workspace']->status()['draft_version']===$v+1,'Bar retry does not advance draft twice');
    $draft=$f['site'];$draft['name']='Unpublished name';$draft['hours']=['open'=>'18:00','close'=>'22:00'];$draft['actions_bar']=$settings;
    WorkspaceFiles::write($f['root'].'/draft','assets/data/site.json',CanonicalJson::encode($draft));
    $definition=$f['definition'];$definition['name']='Updated contact';$change=actionInput($f,'definition-after-bar',['type'=>'save','definition'=>$definition]);$f['actions']->change($f['owner'],$change);
    $manifest=json_decode(file_get_contents($f['root'].'/live/actions/manifest.json'),true);
    publishCheck($manifest['bar_settings']['theme']==='bottom-bar'&&!str_contains(CanonicalJson::encode($manifest),'Unpublished name'),'Immediate definition update uses published configuration');
    $pin=$f['actions']->get($f['owner'],(object)['action_id'=>'contact']);$hoursInput=(object)['action_id'=>'contact','version'=>$pin['version'],'data'=>(object)['name'=>'Visit','time'=>'10:00']];
    publishCheck($f['actions']->validate($f['owner'],$hoursInput)['valid'],'Business validation accepts published operating hours despite different draft hours');
    $submission=clone $hoursInput;$submission->kind='create';$submission->request_id='published-hours-submission';
    publishCheck($f['actions']->invoke($f['owner'],$submission)['record_created'],'Real Action invocation follows the published operating hours');
    $preview=new ActionManager($f['root'].'/private/actions',$f['root'].'/preview-unused.db',$f['root'].'/draft/assets/data/site.json');
    publishCheck($preview->generateManifest()['bar_settings']['theme']==='floating-fab'&&$f['actions']->manager()->generateManifest()['bar_settings']['theme']==='bottom-bar','Independent draft and live managers retain separate configuration');
    publishCheck(!$preview->validateSubmission($definition,['name'=>'Visit','time'=>'10:00'])['valid'],'Draft preview validation sees the distinct unpublished hours');
    $defaultManager=new ActionManager();publishCheck((new ReflectionProperty(ActionManager::class,'siteDataPath'))->getValue($defaultManager)===dirname(__DIR__,2).'/assets/data/site.json','Public ActionManager default resolves published site configuration');
    $plan=publishPrepare($f,'bar-sealed-review');$draft['actions_bar']['theme']='minimal-pill';WorkspaceFiles::write($f['root'].'/draft','assets/data/site.json',CanonicalJson::encode($draft));
    publishCheck(publishComplete($f,$plan,'bar-stale-apply')['status']==='failed_restored','Config changed after publish review is refused');
    actionPublish($f,'bar-fresh-publish');publishCheck(json_decode(file_get_contents($f['root'].'/live/actions/manifest.json'),true)['bar_settings']['theme']==='minimal-pill','Published manifest contains canonical draft bar theme');
}
if(in_array($scenario,['all','release'],true)) {
    $f=actionFixture();$published=actionPublish($f,'initial-action');$plan=$f['releases']->get($f['actor'],$published['result']['plan_id']??$f['db']->scalar('SELECT plan_id FROM site_releases LIMIT 1'));
    $originalPlan=CanonicalJson::digest($plan);$definition=$f['definition'];$definition['name']='New contact label';$input=actionInput($f,'live-action-edit',['type'=>'save','definition'=>$definition]);
    $result=$f['actions']->change($f['owner'],$input);$release=$f['workspace']->status()['release_id'];
    publishCheck($f['releases']->managed($release)['actions/manifest.json']===hash_file('sha256',$f['root'].'/live/actions/manifest.json'),'Immediate Action edit updates current managed release hash');
    publishCheck(CanonicalJson::digest($f['releases']->get($f['actor'],$plan['id']))===$originalPlan,'Action edit preserves immutable publish plan');
    $capture=actionCapture($f,'capture-after-action');publishCheck($capture['status']==='succeeded','Published capture succeeds after an immediate Action edit');
    $restore=new \VoxelSite\Agent\RestorePlanService($f['db'],$f['policy'],$f['workspace'],$f['snapshots'],$f['releases'],$f['operations'],$f['root'].'/private/restores',100);
    try{$restore->prepare($f['owner'],(object)['request_id'=>'old-action-archive','snapshot_id'=>$published['result']['release_id'],'domain'=>'published']);throw new LogicException('Old Action archive should refuse');}
    catch(OperationException $e){publishCheck($e->errorCode==='content_conflict'&&str_contains($e->getMessage(),'Archived Action artifacts'),'Old archives retain explicit current-definition compatibility refusal');}
    $review=$restore->prepare($f['owner'],(object)['request_id'=>'current-action-archive','snapshot_id'=>$capture['result']['snapshot_id'],'domain'=>'published']);
    $restored=$restore->apply($f['owner'],(object)['operation_id'=>'restore-current-action','plan_id'=>$review['plan_id'],'digest'=>$review['digest']]);
    for($i=0;$restored['status']==='applying'&&$i<100;$i++)$restored=$restore->continue($f['owner'],'restore-current-action',$restored['checkpoint']);
    publishCheck($restored['status']==='succeeded','Compatible current Action archive restores successfully');
    publishCheck($f['actions']->change($f['owner'],$input)===$result,'Definition retry replays without another transition');
}
if(in_array($scenario,['all','recovery'],true)) {
    $f=actionFixture(function($phase){if($phase==='after_files')throw new RuntimeException('Injected Action commit interruption');});actionPublish($f,'recovery-initial');
    $before=SiteWorkspace::inventory($f['root'].'/live');$managed=$f['releases']->managed($f['workspace']->status()['release_id']);$definition=$f['definition'];$definition['name']='Interrupted contact';$input=actionInput($f,'action-crash-before-commit',['type'=>'save','definition'=>$definition]);
    try{$f['actions']->change($f['owner'],$input);throw new LogicException('Expected interruption');}catch(RuntimeException $e){if($e->getMessage()!=='Injected Action commit interruption')throw $e;}
    $pending=$f['actions']->pendingChanges($f['owner'])['items'][0];publishCheck($pending['eligible'],'Owner can review exact interrupted file and release states');
    publishReject(fn()=>publishPrepare($f,'blocked-by-action'),'recovery_required','Pending Action journal blocks unrelated publication');
    $review=$f['actions']->inspectChange($f['owner'],$pending['operation_id']);$f['actions']->recover($f['owner'],$pending['operation_id'],$review['digest']);
    publishCheck(SiteWorkspace::inventory($f['root'].'/live')['files']===$before['files']&&$f['releases']->managed($f['workspace']->status()['release_id'])===$managed,'Owner recovery restores manifest bytes and managed release provenance');
    publishCheck($f['actions']->recover($f['owner'],$pending['operation_id'],$review['digest'])['status']==='failed_restored','Owner rollback retry retains its terminal identity');
    $interrupt=true;$f=actionFixture(function($phase)use(&$interrupt){if($phase==='after_files'&&$interrupt){$interrupt=false;throw new RuntimeException('Interrupted once');}});actionPublish($f,'retry-initial');
    $definition=$f['definition'];$definition['name']='Resumed contact';$input=actionInput($f,'action-resume-exact',['type'=>'save','definition'=>$definition]);
    try{$f['actions']->change($f['owner'],$input);}catch(RuntimeException $e){if($e->getMessage()!=='Interrupted once')throw $e;}
    $done=$f['actions']->change($f['owner'],$input);
    publishCheck($done['public_effects_immediate']&&$f['releases']->managed($f['workspace']->status()['release_id'])['actions/manifest.json']===hash_file('sha256',$f['root'].'/live/actions/manifest.json'),'Exact retry completes the same interrupted file/provenance transition');
    publishCheck((int)$f['db']->scalar('SELECT COUNT(*) FROM agent_business_changes')===1,'Interrupted retry does not allocate another business journal');
    $f=actionFixture(function($phase){if($phase==='after_files')throw new RuntimeException('Drift fixture interruption');});actionPublish($f,'conflict-initial');
    $definition=$f['definition'];$definition['name']='Conflicting contact';$input=actionInput($f,'action-conflict-review',['type'=>'save','definition'=>$definition]);
    try{$f['actions']->change($f['owner'],$input);}catch(RuntimeException $e){if($e->getMessage()!=='Drift fixture interruption')throw $e;}
    file_put_contents($f['root'].'/live/actions/manifest.json','External manifest');
    $pending=$f['actions']->pendingChanges($f['owner'])['items'][0];publishCheck(!$pending['eligible'],'Owner recovery marks external Action manifest edits ineligible');
    $review=$f['actions']->inspectChange($f['owner'],$pending['operation_id']);
    publishReject(fn()=>$f['actions']->recover($f['owner'],$pending['operation_id'],$review['digest']),'recovery_required','Owner recovery refuses external manifest drift');
    publishCheck(file_get_contents($f['root'].'/live/actions/manifest.json')==='External manifest','Refusal preserves external manifest bytes');

}
if(in_array($scenario,['all','race'],true)) {
    foreach(['save','delete'] as $kind) {
        $external='{"id":"contact","name":"External change"}';
        $f=actionFixture(function($phase,$entry)use($external){if($phase==='before_entry'&&$entry['path']==='contact.json')file_put_contents($entry['root'].'/'.$entry['path'],$external);});
        actionPublish($f,'race-'.$kind);
        $definition=$f['definition'];$definition['name']='Planned change';
        $intent=$kind==='save'?['type'=>'save','definition'=>$definition]:['type'=>'delete','action_id'=>'contact'];
        $input=actionInput($f,'race-before-'.$kind,$intent);
        publishReject(fn()=>$f['actions']->change($f['owner'],$input),'recovery_required','External change before '.$kind.' cannot be overwritten or deleted');
        publishCheck(file_get_contents($f['root'].'/private/actions/contact.json')===$external&&$f['db']->scalar('SELECT status FROM agent_business_changes')==='prepared','Refused '.$kind.' preserves external bytes and leaves an interrupted journal');
    }
}
if(in_array($scenario,['all','dependency'],true)) {
    $publicPath=null;$f=actionFixture(function($phase)use(&$publicPath){if($phase==='after_files')file_put_contents($publicPath,'{"name":"Externally changed public config"}');});
    actionPublish($f,'dependency-initial');$publicPath=$f['workspace']->resolvePublished('assets/data/site.json');$manifest=file_get_contents($f['root'].'/live/actions/manifest.json');
    $definition=$f['definition'];$definition['name']='Changed after captured config';$input=actionInput($f,'dependency-final-check',['type'=>'save','definition'=>$definition]);
    publishReject(fn()=>$f['actions']->change($f['owner'],$input),'recovery_required','Changed public config before commit cannot yield a successful Action receipt');
    $pending=$f['actions']->pendingChanges($f['owner'])['items'][0];$review=$f['actions']->inspectChange($f['owner'],$pending['operation_id']);
    $f['actions']->recover($f['owner'],$pending['operation_id'],$review['digest']);
    publishCheck(file_get_contents($publicPath)==='{"name":"Externally changed public config"}'&&file_get_contents($f['root'].'/live/actions/manifest.json')===$manifest,'Dependency-conflict recovery preserves external config and restores owned manifest bytes');
}
if(in_array($scenario,['all','public_writer'],true)) {
    $f=actionFixture();actionPublish($f,'custom-assets-initial');
    $site=$f['site'];$site['actions_bar']['theme']='minimal-pill';
    WorkspaceFiles::write($f['root'].'/custom-assets','data/site.json',CanonicalJson::encode($site));
    $workspace=new SiteWorkspace($f['db'],$f['root'].'/draft',$f['root'].'/live',$f['root'].'/private/workspace',$f['root'].'/custom-assets');
    $f['actions']=new ActionService($f['db'],$f['policy'],$workspace,$f['root'].'/private/actions',$f['root'].'/live/_data/actions.db',$f['root'].'/draft/assets/data/site.json',dirname(__DIR__).'/action-templates');
    $definition=$f['definition'];$definition['name']='Custom public assets';
    $f['actions']->change($f['owner'],actionInput($f,'custom-assets-edit',['type'=>'save','definition'=>$definition]));
    $metadata=json_decode($f['db']->scalar('SELECT metadata_json FROM agent_business_changes'),true);
    publishCheck(json_decode(file_get_contents($f['root'].'/live/actions/manifest.json'),true)['bar_settings']['theme']==='minimal-pill'&&$metadata['published_site_hash']===hash_file('sha256',$f['root'].'/custom-assets/data/site.json'),'Manifest generation and dependency seal use the same custom published assets root');
    $manifest=$f['root'].'/live/actions/manifest.json';$before=file_get_contents($manifest);$parent=dirname($manifest);
    chmod($parent,0500);clearstatcache();
    try {
        publishCheck(!is_writable($parent),'Fixture denies public destination staging');
        $definition['name']='Blocked staging';
        $input=actionInput($f,'public-staging-refusal',['type'=>'save','definition'=>$definition]);
        publishReject(fn()=>$f['actions']->change($f['owner'],$input),'write_failed','Unwritable public parent refuses staging without a fallback temporary file');
        publishCheck(file_get_contents($manifest)===$before&&(fileperms($manifest)&0777)===0644&&glob($parent.'/.action-*')===[],'Staging refusal preserves the public manifest and leaves no temporary artifact');
    } finally {chmod($parent,0755);}
}
if(in_array($scenario,['all','legacy'],true)) {
    $f=actionFixture();$site=$f['site'];unset($site['actions_bar']);WorkspaceFiles::write($f['root'].'/draft','assets/data/site.json',CanonicalJson::encode($site));
    $legacy=dirname($f['workspace']->draftRoot()).'/assets/data/site.json';WorkspaceFiles::write(dirname($legacy),'site.json',CanonicalJson::encode(['actions_bar'=>$f['site']['actions_bar']+['position'=>'bottom-bar']]));
    $before=WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace']));$bar=$f['actions']->bar($f['owner'],(object)[]);
    publishCheck($bar['migration_required']&&$bar['settings']['theme']==='bottom-bar','Legacy-only bar settings stay visible for explicit save');
    publishReject(fn()=>publishPrepare($f,'legacy-config-blocked'),'configuration_migration_required','Publish refuses unresolved legacy-only config with actionable error');
    publishCheck(WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace']))===$before,'Legacy reads and publish review never backfill draft');
    $f['actions']->change($f['owner'],actionInput($f,'legacy-bar-explicit-save',['type'=>'bar','settings'=>$bar['settings']]));
    publishCheck(!$f['actions']->bar($f['owner'],(object)[])['migration_required'],'Explicit save resolves legacy configuration without overwriting site fields');
    actionPublish($f,'legacy-config-publish');
    $f=actionFixture();$canonicalBefore=file_get_contents($f['root'].'/draft/assets/data/site.json');
    $legacy=ActionConfiguration::legacyPath($f['workspace']);$legacyBefore='{"name":"Legacy original","actions_bar":{"theme":"minimal-pill"}}';$legacyAfter='{"name":"Legacy original","actions_bar":{"theme":"floating-fab"}}';
    WorkspaceFiles::write(dirname($legacy),basename($legacy),$legacyAfter);
    $legacyService=new ActionService($f['db'],$f['policy'],$f['workspace'],$f['root'].'/private/actions',$f['root'].'/live/_data/actions.db',$legacy,dirname(__DIR__).'/action-templates');
    $id='business_'.str_repeat('c',32);
    $f['db']->insert('agent_business_changes',['id'=>$id,'actor_key'=>$f['owner']->identity(),'user_id'=>1,'site_key'=>$legacyService->siteKey(),'request_id'=>'pre-upgrade-bar-change','request_digest'=>str_repeat('a',64),'status'=>'prepared',
        'payload_json'=>CanonicalJson::encode([['root'=>dirname($legacy),'path'=>basename($legacy),'before'=>$legacyBefore,'after'=>$legacyAfter]]),'result_json'=>'{}','created_at'=>time(),'action_kind'=>'action.bar']);
    publishCheck($f['actions']->siteKey()===$legacyService->siteKey()&&$f['actions']->pendingChanges($f['owner'])['items'][0]['operation_id']===$id,'Canonical service preserves pre-upgrade pending journal identity');
    rename($f['root'].'/draft/assets',$f['root'].'/private/held-assets');putenv('VS_TEST_ACTIONS_DIR='.$f['root'].'/private/actions');
    try {
        $recovery=\VoxelSite\StudioOwnerRecovery::create($f['db'],$f['workspace']);
        publishCheck($recovery->list($f['owner'])['items'][0]['operation_id']===$id,'Unified owner recovery can locate an old journal while draft assets are missing');
        $review=$recovery->review($f['owner'],$id);$recovery->recover($f['owner'],$id,$review['review_id'],$review['digest']);
    } finally {putenv('VS_TEST_ACTIONS_DIR');rename($f['root'].'/private/held-assets',$f['root'].'/draft/assets');}
    publishCheck(file_get_contents($legacy)===$legacyBefore&&file_get_contents($f['root'].'/draft/assets/data/site.json')===$canonicalBefore,'Old owner recovery restores exact legacy target without remapping it into draft');
    publishCheck(!$f['actions']->bar($f['owner'],(object)[])['migration_required']&&$f['actions']->bar($f['owner'],(object)[])['settings']['theme']==='bottom-bar','Explicit canonical draft settings take precedence over legacy values');

}
echo "Action draft/release: $checks checks passed.\n";
