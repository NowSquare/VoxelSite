<?php
declare(strict_types=1);
require_once __DIR__.'/helpers/StudioRuntimeFixture.php';
require_once __DIR__.'/helpers/DisposableStudioHttp.php';
require_once dirname(__DIR__).'/engine/bootstrap.php';
use VoxelSite\{Database,Encryption,Migrator,Settings,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,CanonicalJson,OperationActor,OperationStore,PublicationDiffService,PublishPlanService,ReleaseStore};
$checks=0;function ownerRouteCheck(bool $pass,string $label):void{global $checks;$checks++;if(!$pass)throw new RuntimeException('FAIL '.$label);echo 'PASS '.$label."\n";}
$root=realpath(sys_get_temp_dir()).'/vs-owner-routes-'.bin2hex(random_bytes(6));mkdir($root,0700);
VoxelSite\Tests\StudioRuntimeFixture::copy($root);
foreach(['_studio/preview/assets/images','assets/images'] as $path)mkdir($root.'/'.$path,0700,true);
$appKey=Encryption::generateKey();file_put_contents($root.'/_studio/data/config.json',json_encode(['app_key'=>$appKey]));
foreach(['VS_TEST_PREVIEW_DIR'=>$root.'/_studio/preview','VS_TEST_DOC_ROOT'=>$root,'VS_TEST_ASSETS_DIR'=>$root.'/assets',
    'VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/_studio/data/workspace','VS_TEST_MUTATION_LOCK'=>$root.'/_studio/data/site.lock',
    'VS_TEST_REVISIONS_DIR'=>$root.'/_studio/revisions'] as $key=>$value)putenv($key.'='.$value);
$db=Database::getInstance($root.'/_studio/data/studio.db');(new Migrator($db,new Settings($db)))->run();
$db->insert('users',['name'=>'Owner','email'=>'owner@example.invalid','password_hash'=>'no-login','role'=>'owner','created_at'=>now(),'updated_at'=>now()]);
$db->insert('sessions',['id'=>str_repeat('1',64),'user_id'=>1,'created_at'=>now(),'expires_at'=>gmdate('c',time()+3600),'ip_address'=>'127.0.0.1','user_agent'=>'Owner route fixture']);
$db->update('site_workspace_state',['format'=>2],'id=1');file_put_contents($root.'/_studio/preview/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
$workspace=new SiteWorkspace($db);$policy=new ActorPolicy($db);$owner=new OperationActor('user',1,null,[],'studio_configured',null);
$hashes=[];for($i=0;$i<25;$i++){$path=$i===0?'index.php':'page'.$i.'.php';file_put_contents($root.'/'.$path,'Live '.$i);file_put_contents($root.'/_studio/preview/'.$path,'Draft '.$i);$hashes[$path]=hash('sha256','Live '.$i);}
file_put_contents($root.'/hosting.txt','Keep hosting');file_put_contents($root.'/assets/images/keep.jpg','Public upload');file_put_contents($root.'/_studio/preview/assets/images/keep.jpg','Private upload');
$release='release_'.bin2hex(random_bytes(16));$db->insert('site_releases',['id'=>$release,'plan_id'=>'fixture','operation_id'=>'fixture',
    'actor_json'=>'{}','draft_version'=>0,'manifest_json'=>CanonicalJson::encode($hashes),'digest'=>CanonicalJson::digest($hashes),'created_at'=>time()]);
$db->update('site_workspace_state',['release_id'=>$release],'id=1');
$operations=new OperationStore($db,$policy,$workspace->mutationLockPath());
$publisher=new PublishPlanService($db,$policy,$workspace,new ReleaseStore($db,$policy,$root.'/_studio/data/agent/releases'),$operations);
$server=new VoxelSite\Tests\DisposableStudioHttp($root);
try{
    $before=[$workspace->status(),$db->count('agent_publish_plans'),$db->count('agent_operations'),$db->count('revisions')];
    $diff=$server->request('GET','/preview/diff',null,['limit'=>'10']);
    $shared=(new PublicationDiffService($db,$policy,$workspace,$publisher))->read($owner,(object)['limit'=>10]);
    ownerRouteCheck($diff['status']===200&&CanonicalJson::digest($diff['body']['data'])===CanonicalJson::digest($shared),'Actual preview diff route equals the pure typed comparison');
    ownerRouteCheck($before===[$workspace->status(),$db->count('agent_publish_plans'),$db->count('agent_operations'),$db->count('revisions')],'Actual diff GET leaves reviews, operations, revisions and draft version unchanged');
    ownerRouteCheck($server->request('GET','/preview/diff',null,['limit'=>'01'])['status']===422,'Actual diff route rejects noncanonical pagination');
    $factory=$server->request('POST','/site/reset-install/prepare',['operation_id'=>'owner-factory-discard','base_draft_version'=>'draft:0']);
    ownerRouteCheck($factory['status']===200&&$factory['body']['data']['status']==='ready','Actual factory preparation retains an owner review');
    $exact=['plan_id'=>$factory['body']['data']['plan_id'],'digest'=>$factory['body']['data']['digest']];
    ownerRouteCheck($server->request('POST','/site/reset-install/discard',$exact,[],false)['status']===403,'Actual factory discard requires current owner CSRF');
    $bad=$exact;$bad['digest']=str_repeat('0',64);
    ownerRouteCheck($server->request('POST','/site/reset-install/discard',$bad)['status']===409,'Actual factory discard rejects a different review digest');
    do{$discard=$server->request('POST','/site/reset-install/discard',$exact);if($discard['status']!==200)throw new RuntimeException($discard['raw']);}while(!$discard['body']['data']['complete']);
    ownerRouteCheck(file_get_contents($root.'/index.php')==='Live 0'&&is_file($root.'/_studio/data/studio.db'),'Actual discard releases unstarted review bytes without removing website or account state');
    ownerRouteCheck($server->request('GET','/site/reset')['body']['data']['draft_version']==='draft:0','Actual reset GET exposes the current draft version');
    $input=['operation_id'=>'owner-reset-route','base_draft_version'=>'draft:0'];
    ownerRouteCheck($server->request('POST','/site/reset/prepare',$input,[],false)['status']===403,'Actual reset preparation requires owner CSRF');
    $prepared=$server->request('POST','/site/reset/prepare',$input);$plan=$prepared['body']['data']??[];
    ownerRouteCheck($prepared['status']===200&&$plan['status']==='pending','Actual reset preparation uses a pending exact owner review');
    ownerRouteCheck($server->request('GET','/site/reset',null,['plan_id'=>$plan['plan_id']])['body']['data']===$plan,'Actual reset plan GET returns the retained review unchanged');
    $apply=['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest'],'confirm'=>'RESET'];
    ownerRouteCheck($server->request('POST','/site/reset',$apply,[],false)['status']===403,'Actual reset activation requires fresh owner CSRF');
    $bad=$apply;$bad['digest']=str_repeat('0',64);ownerRouteCheck($server->request('POST','/site/reset',$bad)['status']===409,'Actual reset activation refuses a stale review digest');
    $wrong=$operations->prepare($owner,'owner-wrong-kind','changes.apply',(object)[],'draft:0',null);
    foreach(['GET','POST'] as $method){$response=$method==='GET'?$server->request('GET','/site/reset',null,['operation_id'=>'owner-wrong-kind']):$server->request('POST','/site/reset/recover',['operation_id'=>'owner-wrong-kind']);
        ownerRouteCheck($response['status']===422,'Actual reset '.$method.' rejects unrelated operation identity');}
    $started=$server->request('POST','/site/reset',$apply);$state=$started['body']['data']??[];
    ownerRouteCheck($started['status']===200&&$state['status']==='applying','Actual owner activation starts bounded reset work');
    ownerRouteCheck($server->request('GET','/site/reset',null,['operation_id'=>'owner-reset-route'])['body']['data']===$state,'Actual reset polling does not advance a checkpoint');
    $stale=$server->request('POST','/site/reset/continue',['operation_id'=>'owner-reset-route','checkpoint'=>0]);
    ownerRouteCheck($stale['status']===409,'Actual reset continuation refuses an old checkpoint');
    while($state['status']==='applying'){$response=$server->request('POST','/site/reset/continue',['operation_id'=>'owner-reset-route','checkpoint'=>$state['checkpoint']]);if($response['status']!==200)throw new RuntimeException($response['raw']);$state=$response['body']['data'];}
    ownerRouteCheck($state['status']==='succeeded'&&!is_file($root.'/page24.php')&&file_get_contents($root.'/hosting.txt')==='Keep hosting'
        &&file_get_contents($root.'/assets/images/keep.jpg')==='Public upload','Actual reset continuation finishes with hosting and uploads preserved');
    ownerRouteCheck($server->request('POST','/site/reset',$apply)['body']['data']===$state,'Actual completed reset replay preserves one retained result');
    file_put_contents($root.'/_studio/preview/index.php','Recovery original');
    $approvals=new VoxelSite\Agent\AdminApprovalStore($db,$policy,$workspace,$appKey);
    $reset=new VoxelSite\Agent\ResetService($db,$policy,$workspace,$approvals,$operations,
        new VoxelSite\Agent\ResetInventory($db,$workspace,$publisher,$root.'/_studio',$root.'/_studio/data/default-index.php'),
        $root.'/_studio/data/agent/resets',20,static function(string $phase,array $file)use($root):void{
            if($phase==='after_file'&&$file['domain']==='draft'&&$file['path']==='index.php'){
                file_put_contents($root.'/_studio/preview/index.php','Independent replacement');throw new RuntimeException('Fixture reset interruption');
            }
        });
    $repairPlan=$reset->prepare($owner,(object)['operation_id'=>'owner-route-recovery','base_draft_version'=>'draft:1']);
    $approvals->approve($owner,$repairPlan['plan_id'],$repairPlan['digest']);
    $failed=$reset->apply($owner,(object)['plan_id'=>$repairPlan['plan_id'],'digest'=>$repairPlan['digest']]);
    while($failed['status']==='applying')$failed=$reset->continue($owner,$failed['operation_id'],$failed['checkpoint']);
    ownerRouteCheck($failed['status']==='recovery_required'&&$server->request('GET','/site/reset',null,['operation_id'=>'owner-route-recovery'])['body']['data']===$failed,
        'Actual reset status read preserves failed recovery truth and independent changed bytes');
    ownerRouteCheck($server->request('POST','/site/reset/recover',['operation_id'=>'owner-route-recovery'],[],false)['status']===403,'Actual reset recovery requires fresh owner CSRF');
    unlink($root.'/_studio/preview/index.php');
    $repaired=$server->request('POST','/site/reset/recover',['operation_id'=>'owner-route-recovery']);
    ownerRouteCheck($repaired['status']===200&&$repaired['body']['data']['status']==='failed_restored'
        &&file_get_contents($root.'/_studio/preview/index.php')==='Recovery original'&&$workspace->status()['draft_version']===1,
        'Actual authorized recovery restores exact originals without a successful reset or version advance');
    ownerRouteCheck($repaired['body']['data']['result']['original_outcome']===['error'=>$failed['result']['error'],'restoration'=>$failed['result']['restoration']],
        'Actual recovery retains the earliest failed restoration outcome');
}finally{$server->close();}
echo "$checks owner route checks passed\n";
