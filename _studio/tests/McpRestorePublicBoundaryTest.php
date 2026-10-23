<?php
declare(strict_types=1);

// The child creates a genuine retained review with the exact pre-policy service.
// It never loads that historical implementation in the current-process test.
if (($argv[1] ?? '') === '--old-review') {
    $historical = __DIR__.'/fixtures/pre-private-context-boundary/RestorePlanService.php';
    if (hash_file('sha256', $historical) !== 'ff8e2dc618daa497aba09f8d5128d5c93ff9693e5fc6032553e41176ac8a785b') throw new RuntimeException('Historical restore fixture drifted.');
    require $historical;
}
require_once __DIR__.'/helpers/lifecycle-provider-trap.php';
require_once dirname(__DIR__).'/engine/bootstrap.php';
require_once __DIR__.'/helpers/SiteControlFixture.php';

use VoxelSite\{Database, Logger, Settings, SiteWorkspace, SnapshotService};
use VoxelSite\Agent\{ActorPolicy, CanonicalJson, OperationActor, OperationException, OperationStore, PublishPlanService, ReleaseStore, RestorePlanService, WorkspaceFiles};

$GLOBALS['lifecycle_provider_attempts']=0;
$checks=0;$roots=[];
function boundaryCheck(bool $ok,string $label):void {global $checks;$checks++;if(!$ok)throw new RuntimeException('FAIL '.$label);echo 'PASS '.$label."\n";}
function boundaryDone(object $service,OperationActor $actor,array $result):array {
    $steps=0;while($result['status']==='applying'&&$steps++<100)$result=$service->continue($actor,$result['operation_id'],$result['checkpoint']);
    return $result;
}
function boundaryServices(string $root,Database $db):array {
    $workspace=new SiteWorkspace($db,$root.'/preview',$root.'/published',$root.'/data/workspace',$root.'/published/assets');
    $policy=new ActorPolicy($db);$actor=new OperationActor('user',1,null,[],'studio_configured',null);
    $releases=new ReleaseStore($db,$policy,$root.'/data/agent/releases');
    $operations=new OperationStore($db,$policy,$workspace->mutationLockPath());
    $publisher=new PublishPlanService($db,$policy,$workspace,$releases,$operations,$root.'/data/actions',$root.'/data/published-manifest.json');
    $snapshots=new SnapshotService($db,$policy,$workspace,$releases,$operations,$root.'/data/agent/snapshots',$root.'/snapshots',$root.'/data/actions');
    $restore=new RestorePlanService($db,$policy,$workspace,$snapshots,$releases,$operations,$snapshots->restoreRoot(),1);
    return compact('root','db','workspace','actor','publisher','snapshots','restore');
}
function boundaryPublish(array $f,string $id):array {
    $plan=$f['publisher']->prepare($f['actor'],(object)['request_id'=>$id.'-review','base_draft_version'=>'draft:'.$f['workspace']->status()['draft_version']]);
    $value=boundaryDone($f['publisher'],$f['actor'],$f['publisher']->publish($f['actor'],(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest'],'operation_id'=>$id]));
    if($value['status']!=='succeeded')throw new RuntimeException(CanonicalJson::encode($value));return $value;
}
function boundaryApply(array $f,array $plan,string $id):array {
    return boundaryDone($f['restore'],$f['actor'],$f['restore']->apply($f['actor'],(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest'],'operation_id'=>$id]));
}
function boundaryOldReview(array $f,string $snapshot,string $id,bool $start=false):array {
    $result=proc_open([PHP_BINARY,__FILE__,'--old-review',$f['root'],$snapshot,$id,$start?'start':'prepare'],[['pipe','r'],['pipe','w'],['pipe','w']],$pipes);
    if(!is_resource($result))throw new RuntimeException('Cannot run historical preparation.');fclose($pipes[0]);
    $out=stream_get_contents($pipes[1]);$error=stream_get_contents($pipes[2]);fclose($pipes[1]);fclose($pipes[2]);$status=proc_close($result);
    if($status!==0||$error!=='')throw new RuntimeException('Historical preparation failed: '.$out.$error);
    return json_decode($out,true,32,JSON_THROW_ON_ERROR);
}
function boundaryRemove(string $path):void {if(is_link($path)||is_file($path)){unlink($path);return;}if(!is_dir($path))return;foreach(new DirectoryIterator($path)as$item)if(!$item->isDot())boundaryRemove($item->getPathname());rmdir($path);}

if (($argv[1] ?? '') === '--old-review') {
    [$root,$snapshot,$id,$mode]=array_slice($argv,2);
    if(realpath($root)!==$root||!str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-restore-boundary-')||!is_file($root.'/.fixture'))throw new RuntimeException('Marked disposable fixture required.');
    foreach(['VS_TEST_PREVIEW_DIR'=>$root.'/preview','VS_TEST_ASSETS_DIR'=>$root.'/published/assets','VS_TEST_DOC_ROOT'=>$root.'/published',
        'VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/data/workspace','VS_TEST_MUTATION_LOCK'=>$root.'/site.lock','VS_TEST_SNAPSHOT_DIR'=>$root.'/snapshots','VS_TEST_REVISIONS_DIR'=>$root.'/data/revisions']as$key=>$value)putenv($key.'='.$value);
    foreach(['logDir'=>$root.'/data','initialized'=>true]as$key=>$value)(new ReflectionProperty(Logger::class,$key))->setValue(null,$value);
    $f=boundaryServices($root,Database::getInstance($root.'/studio.db'));
    $plan=$f['restore']->prepare($f['actor'],(object)['request_id'=>$id.'-review','snapshot_id'=>$snapshot,'domain'=>'published']);
    $value=['plan'=>$plan];
    if($mode==='start')$value['operation']=$f['restore']->apply($f['actor'],(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest'],'operation_id'=>$id]);
    if($GLOBALS['lifecycle_provider_attempts']!==0)throw new RuntimeException('Historical preparation attempted a provider.');
    echo CanonicalJson::encode($value);exit;
}

try {
    foreach(['memory','design-intelligence']as$name){
        $root=realpath(sys_get_temp_dir()).'/vs-restore-boundary-'.bin2hex(random_bytes(6));$roots[]=$root;
        [$db,$files]=createSiteControlFixture($root);file_put_contents($root.'/.fixture','Disposable restore policy regression');
        $f=boundaryServices($root,$db);(new Settings($db))->set('site_url','https://fixture.invalid');
        $path='assets/data/'.$name.'.json';$old='{"private_context":"'.$name.' before policy"}';
        $files->writeExactFile($path,$old);$files->writeExactFile('assets/data/editorial.json','{"public_copy":"Original"}');
        $files->writeExactFile('assets/data/zz-public.json','{"public_copy":"Original second target"}');
        boundaryPublish($f,'boundary-first-'.$name);
        // Seed only the old managed live projection. Its real snapshot is sealed
        // by the service, while immutable existing publish receipts stay intact.
        $release=$f['workspace']->status()['release_id'];$managed=json_decode($db->scalar('SELECT manifest_json FROM site_releases WHERE id=?',[$release]),true);
        file_put_contents($root.'/published/'.$path,$old);$managed[$path]=hash('sha256',$old);
        $db->update('site_releases',['manifest_json'=>CanonicalJson::encode($managed),'digest'=>CanonicalJson::digest($managed)],'id=?',[$release]);
        $captured=boundaryDone($f['snapshots'],$f['actor'],$f['snapshots']->create($f['actor'],(object)['operation_id'=>'boundary-capture-'.$name,'domain'=>'both','label'=>'Before public context policy']));
        boundaryCheck($captured['status']==='succeeded','Capture preserves the original '.$name.' archive');$snapshot=$captured['result']['snapshot_id'];
        $files->writeExactFile('assets/data/zz-public.json','{"public_copy":"Newer second target"}');
        boundaryPublish($f,'boundary-cleanup-'.$name);
        boundaryCheck(!is_file($root.'/published/'.$path),'Current publication removes managed '.$name.' from live');
        $before=siteControlState($root.'/studio.db');
        foreach(['published','both']as$domain){
            $rejected=false;
            try{$f['restore']->prepare($f['actor'],(object)['request_id'=>'boundary-refuse-'.$name.'-'.$domain,'snapshot_id'=>$snapshot,'domain'=>$domain]);}
            catch(OperationException $e){$rejected=$e->errorCode==='invalid_path'&&($e->details['path']??null)===$path&&str_contains($e->getMessage(),'Private authoring context cannot be restored to the public website');}
            boundaryCheck($rejected,'New '.$domain.' restore refuses exact '.$path.' with an explanatory error');
            boundaryCheck(siteControlState($root.'/studio.db')===$before,'Refused '.$domain.' preparation makes no website or projection changes');
            boundaryCheck($db->count('agent_restore_plans',"request_id=? AND status='ready'",['boundary-refuse-'.$name.'-'.$domain])===0,'Refusal does not seal a ready restoration');
        }
        boundaryCheck($f['snapshots']->inspect($f['actor'],$snapshot)['validity']==='valid','Historical archive remains inspectable without filtering '.$name);
        $files->writeExactFile($path,'{"private_context":"Newer private bytes"}');$db->update('site_workspace_state',['draft_version'=>1],'id=1');
        $liveBefore=siteControlState($root.'/studio.db')['published'];
        $draft=$f['restore']->prepare($f['actor'],(object)['request_id'=>'boundary-draft-'.$name,'snapshot_id'=>$snapshot,'domain'=>'draft']);
        $restored=boundaryApply($f,$draft,'boundary-draft-apply-'.$name);
        boundaryCheck($restored['status']==='succeeded'&&$files->readFile($path)===$old,'Draft-only restore retains exact private '.$name.' bytes');
        boundaryCheck(siteControlState($root.'/studio.db')['published']===$liveBefore,'Draft-only restoration never exposes '.$name.' publicly');

        $oldPlan=boundaryOldReview($f,$snapshot,'boundary-retained-'.$name)['plan'];$before=siteControlState($root.'/studio.db');
        boundaryCheck(in_array($path,array_column($oldPlan['files'],'path'),true),'Exact historical service seals a retained '.$name.' live write');
        $denied=boundaryApply($f,$oldPlan,'boundary-retained-apply-'.$name);
        boundaryCheck($denied['status']==='failed_restored'&&($denied['result']['error']['code']??null)==='invalid_path','Current apply refuses the pre-policy retained '.$name.' target');
        boundaryCheck(siteControlState($root.'/studio.db')===$before&&!is_file($root.'/published/'.$path),'Retained-plan refusal makes no forward live or draft writes');

        // Genuine old partial operation: a current continuation must refuse
        // further forward work and may only roll back its retained before-state.
        $oldStarted=boundaryOldReview($f,$snapshot,'boundary-interrupted-'.$name,true)['operation'];
        boundaryCheck($oldStarted['status']==='applying'&&is_file($root.'/published/'.$path),'Historical executor starts a bounded '.$name.' restoration');
        $continued=boundaryDone($f['restore'],$f['actor'],$f['restore']->continue($f['actor'],$oldStarted['operation_id'],$oldStarted['checkpoint']));
        boundaryCheck($continued['status']==='failed_restored'&&($continued['result']['error']['code']??null)==='invalid_path','Continuation rechecks the current public policy for '.$name);
        boundaryCheck(siteControlState($root.'/studio.db')===$before&&!is_file($root.'/published/'.$path),'Policy refusal preserves rollback to exact before-state for '.$name);
    }

    // The policy is an exact path boundary, not a ban on JSON or draft archives.
    $files->writeExactFile('assets/data/editorial.json','{"public_copy":"Newer"}');
    foreach(['memory-public','design-intelligence-public']as$publicName)$files->writeExactFile('assets/data/'.$publicName.'.json','{"public_copy":"Allowed nearby name"}');
    boundaryPublish($f,'boundary-editorial-new');
    $safe=boundaryDone($f['snapshots'],$f['actor'],$f['snapshots']->create($f['actor'],(object)['operation_id'=>'boundary-safe-capture','domain'=>'published','label'=>'Public JSON only']));
    $files->writeExactFile('assets/data/editorial.json','{"public_copy":"Latest"}');boundaryPublish($f,'boundary-editorial-latest');
    $safePlan=$f['restore']->prepare($f['actor'],(object)['request_id'=>'boundary-safe-review','snapshot_id'=>$safe['result']['snapshot_id'],'domain'=>'published']);
    $safeRestore=boundaryApply($f,$safePlan,'boundary-safe-restore');
    boundaryCheck($safeRestore['status']==='succeeded'&&file_get_contents($root.'/published/assets/data/editorial.json')==='{"public_copy":"Newer"}','Unrelated public JSON still restores exactly');
    boundaryCheck($files->readFile('assets/data/editorial.json')==='{"public_copy":"Latest"}','Safe published restoration keeps the newer private draft');
    foreach(['memory-public','design-intelligence-public']as$publicName)boundaryCheck(file_get_contents($root.'/published/assets/data/'.$publicName.'.json')==='{"public_copy":"Allowed nearby name"}','The public policy does not ban nearby '.$publicName.' paths');

    // A failed safe cleanup must still recover its exact prior state, including
    // a historically managed private file. Forward policy never filters rollback.
    $release=$f['workspace']->status()['release_id'];$managed=json_decode($db->scalar('SELECT manifest_json FROM site_releases WHERE id=?',[$release]),true);
    file_put_contents($root.'/published/'.$path,$old);$managed[$path]=hash('sha256',$old);
    $db->update('site_releases',['manifest_json'=>CanonicalJson::encode($managed),'digest'=>CanonicalJson::digest($managed)],'id=?',[$release]);
    $beforeCleanup=siteControlState($root.'/studio.db');
    $cleanupPlan=$f['restore']->prepare($f['actor'],(object)['request_id'=>'boundary-safe-cleanup-review','snapshot_id'=>$safe['result']['snapshot_id'],'domain'=>'published']);
    boundaryCheck(count($cleanupPlan['files'])===1&&$cleanupPlan['files'][0]['path']===$path&&$cleanupPlan['files'][0]['after_hash']===null,'Safe restore reviews deletion of a historically managed private public file');
    $failure=new RestorePlanService($db,new ActorPolicy($db),$f['workspace'],$f['snapshots'],new ReleaseStore($db,new ActorPolicy($db),$root.'/data/agent/releases'),
        new OperationStore($db,new ActorPolicy($db),$f['workspace']->mutationLockPath()),$f['snapshots']->restoreRoot(),1,
        static function(string $phase):void {if($phase==='after_file')throw new OperationException('content_conflict','Injected cleanup interruption.');});
    $failed=$failure->apply($f['actor'],(object)['plan_id'=>$cleanupPlan['plan_id'],'digest'=>$cleanupPlan['digest'],'operation_id'=>'boundary-safe-cleanup-failure']);
    boundaryCheck($failed['status']==='failed_restored'&&($failed['result']['restoration']['restored']??false),'Failed safe cleanup reports verified recovery');
    boundaryCheck(siteControlState($root.'/studio.db')===$beforeCleanup&&file_get_contents($root.'/published/'.$path)===$old,'Recovery preserves exact before bytes instead of silently filtering historical state');
    boundaryCheck($GLOBALS['lifecycle_provider_attempts']===0,'Public restoration boundary makes zero provider or Router attempts');
    echo $checks." restore public-boundary checks passed\n";
}finally{Database::resetInstance();foreach($roots as$root)boundaryRemove($root);}
