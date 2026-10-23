<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';

require_once dirname(__DIR__).'/engine/bootstrap.php';
use VoxelSite\{Database,Encryption,Logger,Migrator,Settings,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,CanonicalJson,CredentialService,FactoryResetInventory,FactoryResetService,JsonSchema,OperationActor,OperationException,OperationStore,PublishPlanService,ReleaseStore,WorkspaceFiles};
require_once dirname(__DIR__).'/static/factory-reset-runtime.php';

if(($argv[1]??'')==='--crash'){
    [$script,$mode,$root,$id,$token,$checkpoint,$phase]=$argv;
    if(realpath($root)!==$root||!str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-factory-'))exit(91);
    $runtime=new VoxelSiteFactoryResetRuntime($root.'/_studio',$root,1,function(string $point)use($phase):void{
        if($point===$phase){posix_kill(getmypid(),SIGKILL);exit(92);}
    });
    $runtime->continue($id,$token,(int)$checkpoint);exit(0);
}
$checks=0;
function fc(bool $value,string $label):void {global $checks;$checks++;if(!$value)throw new RuntimeException('FAIL '.$label);echo "PASS $label\n";}
function fr(callable $fn,string $code,string $label):void {
    try{$fn();}catch(OperationException|VoxelSiteFactoryResetFailure $e){fc($e->errorCode===$code,$label.' ('.$e->errorCode.')');return;}
    fc(false,$label);
}
function fixture():array {
    Database::closeInstance();
    $root=realpath(sys_get_temp_dir()).'/vs-factory-'.bin2hex(random_bytes(6));
    foreach(['_studio/preview/assets','_studio/data','assets/images','assets/library','_studio/custom_prompts','_studio/logs'] as $path)mkdir($root.'/'.$path,0700,true);
    $root=realpath($root);
    if(!str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-factory-'))throw new RuntimeException('Disposable roots required.');
    foreach(['VS_TEST_PREVIEW_DIR'=>$root.'/_studio/preview','VS_TEST_PUBLISHED_ROOT'=>$root,
        'VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/_studio/data/workspace-migration','VS_TEST_MUTATION_LOCK'=>$root.'/_studio/data/site-mutation.lock',
        'VS_TEST_ACTIONS_DIR'=>$root.'/_studio/data/actions','VS_TEST_REVISIONS_DIR'=>$root.'/_studio/revisions',
        'VS_TEST_SNAPSHOTS_DIR'=>$root.'/_studio/data/snapshots'] as $key=>$value)putenv($key.'='.$value);
    foreach(['logDir'=>$root.'/_studio/logs','initialized'=>true] as $property=>$value)(new ReflectionProperty(Logger::class,$property))->setValue(null,$value);
    $db=Database::getInstance($root.'/_studio/data/studio.db');(new Migrator($db,new Settings($db)))->run();
    $db->insert('users',['name'=>'Owner','email'=>'factory@example.invalid','password_hash'=>'no-login','role'=>'owner','created_at'=>now(),'updated_at'=>now()]);
    $db->insert('users',['name'=>'Editor','email'=>'editor@example.invalid','password_hash'=>'no-login','role'=>'editor','created_at'=>now(),'updated_at'=>now()]);
    $db->update('site_workspace_state',['format'=>2],'id=1');
    $workspace=new SiteWorkspace($db,$root.'/_studio/preview',$root,$root.'/_studio/data/workspace-migration',$root.'/assets');
    file_put_contents($root.'/_studio/preview/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
    foreach(['index.php'=>'LIVE','about.php'=>'ABOUT','hosting.php'=>'UNRELATED','manual.html'=>'HOSTING HTML',
        '_studio/preview/index.php'=>'DRAFT','_studio/preview/assets/css/style.css'=>'DRAFT CSS','_studio/preview/assets/images/private.png'=>'PRIVATE UPLOAD',
        '_studio/data/config.json'=>'{"app_key":"fixture-only"}','_studio/data/default-index.php'=>'LANDING',
        '_studio/data/collections/_schema/customer.json'=>'{"name":"User schema"}','_studio/data/collections/_schema/.gitkeep'=>'',
        '_studio/custom_prompts/system.md'=>'PRIVATE PROMPT','_studio/data/actions/contact.json'=>'{"id":"contact"}',
        '_studio/data/designs/old/metadata.json'=>'{"name":"old"}','_studio/data/agent/old-archive/before/content'=>'PRIVATE HISTORY',
        'assets/images/user.png'=>'USER UPLOAD','assets/library/shipped.png'=>'LIBRARY','assets/js/form-handler.js'=>'SHIPPED RUNTIME',
        '_studio/logs/fixture.log'=>'PRIVATE LOG'] as $path=>$bytes)WorkspaceFiles::write($root,$path,$bytes);
    $map=['index.php'=>hash('sha256','LIVE'),'about.php'=>hash('sha256','ABOUT'),'assets/js/form-handler.js'=>hash('sha256','SHIPPED RUNTIME')];
    $release='release_'.bin2hex(random_bytes(16));
    $db->insert('site_releases',['id'=>$release,'plan_id'=>'fixture','operation_id'=>'fixture','actor_json'=>'{}','draft_version'=>0,
        'manifest_json'=>CanonicalJson::encode($map),'digest'=>CanonicalJson::digest($map),'created_at'=>time()]);
    $db->update('site_workspace_state',['release_id'=>$release],'id=1');
    $policy=new ActorPolicy($db);$owner=new OperationActor('user',1,null,[],'studio_configured',null);
    $key=(new CredentialService($db))->create($owner,1,'read','Factory',null,null,['reset:installation']);
    $actor=$policy->fromCredential($key['id']);
    $publish=new PublishPlanService($db,$policy,$workspace,new ReleaseStore($db,$policy,$root.'/_studio/data/agent/releases'),
        new OperationStore($db,$policy,$workspace->mutationLockPath()));
    $service=new FactoryResetService($db,$policy,$workspace,new FactoryResetInventory($db,$workspace,$publish));
    return compact('root','db','workspace','policy','owner','actor','service','key');
}
function plan(array $f,string $id='factory-review-001'):array {return $f['service']->prepare($f['actor'],(object)['operation_id'=>$id,'base_draft_version'=>'draft:0']);}
function start(array $f,array $plan,string $token):array {return $f['service']->start($f['owner'],(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest'],'confirm'=>'RESET INSTALLATION','receipt_token'=>$token]);}
function finish(VoxelSiteFactoryResetRuntime $runtime,string $id,string $token,array $state,string $action='continue'):array {
    for($n=0;$n<300&&!in_array($state['status'],['succeeded','failed_restored','recovery_required'],true);$n++)
        $state=$runtime->continue($id,$token,$state['checkpoint'],$action==='restore'&&$n===0);
    return $state;
}
function crash(array $f,array $p,string $token,int $checkpoint,string $phase):void {
    $pipes=[];$process=proc_open([PHP_BINARY,__FILE__,'--crash',$f['root'],$p['plan_id'],$token,(string)$checkpoint,$phase],
        [0=>['pipe','r'],1=>['pipe','w'],2=>['pipe','w']],$pipes);
    fclose($pipes[0]);$out=stream_get_contents($pipes[1]);$err=stream_get_contents($pipes[2]);fclose($pipes[1]);fclose($pipes[2]);
    $exit=proc_close($process);fc($exit!==0&&$err==='','Subprocess is killed at '.$phase.' ('.$exit.') '.$out.$err);
}

$f=fixture();$p=plan($f);$token=bin2hex(random_bytes(32));
JsonSchema::validate(JsonSchema::output($p),FactoryResetService::outputSchema());
fc($p['studio_completion_required']&&$p['status']==='ready','Agent receives exact review and Studio completion boundary');
fc($p===plan($f),'Preparation replays the same immutable review');
$paths=array_column($p['review']['files'],'path');
fc(in_array('published/assets/images/user.png',$paths,true)&&in_array('studio/data/collections/_schema/customer.json',$paths,true)
    &&in_array('studio/custom_prompts/system.md',$paths,true),'Factory review includes user uploads, custom schemas and prompt overrides');
fc(!in_array('published/hosting.php',$paths,true)&&!in_array('published/manual.html',$paths,true)
    &&!in_array('published/assets/library/shipped.png',$paths,true)&&!in_array('published/assets/js/form-handler.js',$paths,true),
    'Unrelated hosting files, immutable library and shipped runtime are preserved');
fr(fn()=>$f['service']->start($f['actor'],(object)['plan_id'=>$p['plan_id'],'digest'=>$p['digest'],'confirm'=>'RESET INSTALLATION','receipt_token'=>$token]),
    'permission_denied','An MCP credential cannot cross the Studio boundary');
file_put_contents($f['root'].'/about.php','DRIFT');
fr(fn()=>start($f,$p,$token),'content_conflict','Changed public bytes invalidate the exact owner review');
file_put_contents($f['root'].'/about.php','ABOUT');
$state=start($f,$p,$token);$runtime=new VoxelSiteFactoryResetRuntime($f['root'].'/_studio',$f['root'],1);
$stateHash=hash_file('sha256',$f['root'].'/_studio/data/factory-resets/'.$p['plan_id'].'/state.json');
fc($runtime->status($p['plan_id'],$token)===$state&&hash_file('sha256',$f['root'].'/_studio/data/factory-resets/'.$p['plan_id'].'/state.json')===$stateHash,
    'Completion status is a pure read');
fr(fn()=>$runtime->status($p['plan_id'],str_repeat('0',64)),'permission_denied','Wrong receipt cannot inspect or continue cleanup');
$state=$runtime->continue($p['plan_id'],$token,0);
fc($state['checkpoint']===1&&is_file($f['root'].'/_studio/data/studio.db')&&is_file($f['root'].'/_studio/data/config.json'),
    'First bounded deletion retains the installation database and config');
fc($runtime->continue($p['plan_id'],$token,0)===$state,'Old checkpoint replay cannot advance deletion');
$state=$runtime->continue($p['plan_id'],$token,$state['checkpoint'],true);$state=finish($runtime,$p['plan_id'],$token,$state);
fc($state['status']==='failed_restored'&&file_get_contents($f['root'].'/index.php')==='LIVE'
    &&file_get_contents($f['root'].'/about.php')==='ABOUT','Explicit rollback restores exact original publication bytes');
fc(!file_exists($f['root'].'/_studio/data/factory-resets/active.json')
    &&$f['db']->scalar('SELECT reservation_operation_id FROM site_workspace_state WHERE id=1')===null,'Verified rollback clears maintenance and reservation');

$f=fixture();$p=plan($f);$token=bin2hex(random_bytes(32));$state=start($f,$p,$token);
$runtime=new VoxelSiteFactoryResetRuntime($f['root'].'/_studio',$f['root'],1);
Database::closeInstance();
$blocked=false;try{Database::getInstance($f['root'].'/_studio/data/studio.db');}catch(RuntimeException){$blocked=true;}
fc($blocked,'Database construction is blocked by the durable maintenance marker');
crash($f,$p,$token,0,'after_file');
$state=$runtime->status($p['plan_id'],$token);
fc($state['checkpoint']===0,'A process death retains the prior durable checkpoint');
$state=$runtime->continue($p['plan_id'],$token,0);
fc($state['checkpoint']===1,'Retry recognizes already-applied exact file bytes');
while($state['status']==='applying')$state=$runtime->continue($p['plan_id'],$token,$state['checkpoint']);
fc($state['status']==='verifying','All file deletions verify before database finalization');
crash($f,$p,$token,$state['checkpoint'],'before_final_boundary');
$state=$runtime->status($p['plan_id'],$token);
fc($state['status']==='finalizing'&&$state['irreversible']&&is_file($f['root'].'/_studio/data/studio.db'),
    'The independent irreversible receipt commits before deleting the database');
fr(fn()=>$runtime->continue($p['plan_id'],$token,$state['checkpoint'],true),'final_boundary_passed','After the final boundary, rollback cannot be promised');
crash($f,$p,$token,$state['checkpoint'],'after_final_file');
fc(!is_file($f['root'].'/_studio/data/studio.db')&&is_file($f['root'].'/_studio/data/config.json'),
    'True interruption between database and config deletion keeps the scoped cleanup receipt');
$state=$runtime->continue($p['plan_id'],$token,$state['checkpoint']);$state=finish($runtime,$p['plan_id'],$token,$state);
fc($state['status']==='succeeded'&&!is_file($f['root'].'/_studio/data/studio.db')&&!is_file($f['root'].'/_studio/data/config.json'),
    'Receipt completes and verifies removal after its original database is gone');
fc(file_get_contents($f['root'].'/index.php')==='LANDING'&&file_get_contents($f['root'].'/hosting.php')==='UNRELATED'
    &&file_get_contents($f['root'].'/manual.html')==='HOSTING HTML'&&file_get_contents($f['root'].'/assets/library/shipped.png')==='LIBRARY',
    'Final removal preserves unrelated hosting and shipped library');
$stage=$f['root'].'/_studio/data/factory-resets/'.$p['plan_id'];
fc(count(glob($stage.'/before/*'))===0&&count(glob($stage.'/after/*'))===0
    &&!is_file($f['root'].'/_studio/data/factory-resets/active.json'),'Success erases retained originals before releasing the installation gate');
fc($runtime->continue($p['plan_id'],$token,0)===$state,'Final receipt is stable after deletion of the normal journal');
$statePath=$stage.'/state.json';$retained=json_decode(file_get_contents($statePath),true);$retained['expires_at']=time()-1;
file_put_contents($statePath,json_encode($retained));
fr(fn()=>$runtime->status($p['plan_id'],$token),'receipt_expired','Final receipt has an explicit seven-day access expiry');

$f=fixture();$p=plan($f);$token=bin2hex(random_bytes(32));$state=start($f,$p,$token);
$runtime=new VoxelSiteFactoryResetRuntime($f['root'].'/_studio',$f['root'],1);Database::closeInstance();
while($state['status']!=='purging')$state=$runtime->continue($p['plan_id'],$token,$state['checkpoint']);
$stage=$f['root'].'/_studio/data/factory-resets/'.$p['plan_id'];
while(count(glob($stage.'/before/*'))+count(glob($stage.'/after/*'))>1)$state=$runtime->continue($p['plan_id'],$token,$state['checkpoint']);
crash($f,$p,$token,$state['checkpoint'],'after_final_receipt');
$state=$runtime->status($p['plan_id'],$token);
fc($state['status']==='succeeded'&&$state['maintenance_active'],'Final receipt remains truthful when killed before releasing maintenance');
$state=$runtime->continue($p['plan_id'],$token,$state['checkpoint']);
fc(!$state['maintenance_active'],'Explicit terminal replay removes only its matching maintenance marker');

$f=fixture();$p=plan($f);$token=bin2hex(random_bytes(32));
$f['db']->update('agent_factory_plans',['expires_at'=>time()-1],'id = ?',[$p['plan_id']]);
fr(fn()=>start($f,$p,$token),'review_expired','Expired owner review cannot enter maintenance');
$before=count(glob($f['root'].'/_studio/data/factory-resets/'.$p['plan_id'].'/before/*'));
$expired=$f['service']->expire($f['owner'],$p['plan_id'],1);
fc($expired['removed']===1&&!$expired['complete']&&$before>1,'Unstarted expiry cleanup is explicitly bounded');
for($n=0;$n<100&&!$expired['complete'];$n++)$expired=$f['service']->expire($f['owner'],$p['plan_id'],2);
fc($expired['complete']&&file_get_contents($f['root'].'/index.php')==='LIVE','Expiring a review removes only private staging');
$f=fixture();$p=plan($f);
// Emulate a kill after private copying but before committing the prepared manifest.
$f['db']->update('agent_factory_plans',['status'=>'preparing','manifest_json'=>null,'digest'=>null],'id=?',[$p['plan_id']]);
$resumed=plan($f);
fc($resumed['plan_id']===$p['plan_id']&&$resumed['status']==='ready','Interrupted preparation reuses its identity and replaces only its own staging');
$discarded=$f['service']->discard($f['owner'],(object)['plan_id'=>$resumed['plan_id'],'digest'=>$resumed['digest']]);
while(!$discarded['complete'])$discarded=$f['service']->discard($f['owner'],(object)['plan_id'=>$resumed['plan_id'],'digest'=>$resumed['digest']]);
fc($discarded['complete']&&file_get_contents($f['root'].'/about.php')==='ABOUT','Explicit discard removes unstarted originals without changing the installation');

$f=fixture();$p=plan($f);$token=bin2hex(random_bytes(32));
$f['db']->update('users',['name'=>'Changed owner'],'id=1');
fr(fn()=>start($f,$p,$token),'content_conflict','Changed database rows invalidate the exact removal review');
fc(!is_file($f['root'].'/_studio/data/factory-resets/active.json'),'Stale database review leaves the installation ungated');
$f=fixture();$p=plan($f);$token=bin2hex(random_bytes(32));
$f['db']->update('studio_mcp_credentials',['revoked_at'=>time()],'key_id=?',[$f['key']['id']]);
fr(fn()=>start($f,$p,$token),'permission_denied','Revoked originating credential cannot borrow a later owner activation');
$f=fixture();$p=plan($f);$token=bin2hex(random_bytes(32));
$f['db']->update('users',['role'=>'editor'],'id=1');
fr(fn()=>start($f,$p,$token),'permission_denied','Owner demotion before activation invalidates authority');
$f=fixture();$p=plan($f);$token=bin2hex(random_bytes(32));
file_put_contents($f['root'].'/_studio/data/factory-resets/'.$p['plan_id'].'/before/0','CORRUPTED ARCHIVE');
fr(fn()=>start($f,$p,$token),'recovery_required','Corrupt retained originals prevent any cleanup activation');
$f=fixture();$p=plan($f);$token=bin2hex(random_bytes(32));
file_put_contents($f['root'].'/assets/images/new.png','NEW MANAGED UPLOAD');
fr(fn()=>start($f,$p,$token),'content_conflict','New uploads invalidate the reviewed deletion set');
$f=fixture();
WorkspaceFiles::write($f['root'],'_studio/data/updates/active.json','{}');
fr(fn()=>plan($f),'site_busy','Active update maintenance prevents factory preparation');
$f=fixture();$p=plan($f);$token=bin2hex(random_bytes(32));$state=start($f,$p,$token);
$runtime=new VoxelSiteFactoryResetRuntime($f['root'].'/_studio',$f['root'],1);
unlink($f['root'].'/about.php');symlink($f['root'].'/hosting.php',$f['root'].'/about.php');
$state=$runtime->continue($p['plan_id'],$token,0);
fc($state['status']==='recovery_required'&&file_get_contents($f['root'].'/hosting.php')==='UNRELATED','Symlink replacement stops cleanup without following its target');
Database::closeInstance();
if(in_array('--http',$argv,true)||in_array('--browser-fixture',$argv,true)){
    $f=fixture();$root=$f['root'];
    $copy=function(string $from,string $to)use(&$copy):void {
        if(is_link($from))throw new RuntimeException('Fixture source symlink rejected.');
        if(is_dir($from)){
            if(!is_dir($to))mkdir($to,0700,true);
            foreach(scandir($from) as $name)if($name!=='.'&&$name!=='..')$copy($from.'/'.$name,$to.'/'.$name);
        }elseif(!copy($from,$to))throw new RuntimeException('Fixture copy failed.');
    };
    \VoxelSite\Tests\StudioRuntimeFixture::copy($root);
    $copy(dirname(__DIR__,2).'/submit.php',$root.'/submit.php');
    foreach([1,2] as $user)$f['db']->insert('sessions',['id'=>str_repeat((string)$user,64),'user_id'=>$user,'ip_address'=>'127.0.0.1',
        'user_agent'=>'fixture','expires_at'=>gmdate('c',time()+3600),'created_at'=>now()]);
    file_put_contents($root.'/_studio/data/config.json',json_encode(['app_key'=>Encryption::generateKey()]));
    $socket=stream_socket_server('tcp://127.0.0.1:0',$errno,$error);
    if(!$socket)throw new RuntimeException('Loopback qualification unavailable: '.$error);
    $port=(int)substr(strrchr(stream_socket_get_name($socket,false),':'),1);fclose($socket);
    if(in_array('--browser-fixture',$argv,true)){
        $copy(dirname(__DIR__).'/ui',$root.'/_studio/ui');
        file_put_contents($root.'/factory-browser.php',<<<'PHP'
<?php setcookie('vs_session',str_repeat('1',64),['path'=>'/','httponly'=>true,'samesite'=>'Strict']); ?>
<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/_studio/ui/dist/studio.css"><title>Disposable factory review</title></head>
<body><main style="padding:32px"><h1>Disposable installation</h1><p>This fixture contains a managed website, an unrelated hosting file, uploads, user schemas and private history.</p><button class="vs-btn vs-btn-danger" id="open">Review installation removal</button></main>
<script type="module">
import { showFactoryResetReview } from '/_studio/ui/src/factory-reset-workspace.js';
const call=async(method,path,body)=>{const r=await fetch('/_studio/api/router.php?_path='+encodeURIComponent(path),{method,headers:{'Content-Type':'application/json','X-VS-Token':'1'.repeat(64)},...(body?{body:JSON.stringify(body)}:{})});return r.json();};
const api={get:path=>call('GET',path),post:(path,body)=>call('POST',path,body)};
document.querySelector('#open').onclick=()=>showFactoryResetReview({api,completionUrl:'/_studio/factory-reset.php'});
</script></body></html>
PHP);
        Database::closeInstance();
        echo 'BROWSER_FIXTURE '.json_encode(['root'=>$root,'port'=>$port,'url'=>'http://127.0.0.1:'.$port.'/factory-browser.php'])."\n";
        exit;
    }
    $server=proc_open([PHP_BINARY,'-S','127.0.0.1:'.$port,'-t',$root],
        [['pipe','r'],['file',$root.'/http.log','a'],['file',$root.'/http.log','a']],$pipes,$root);fclose($pipes[0]);
    $http=function(string $method,string $path,?array $body=null,int $user=1,bool $csrf=true,?string $token=null)use($port):array{
        $url='http://127.0.0.1:'.$port.($token!==null?$path:'/_studio/api/router.php?_path='.rawurlencode($path));
        $curl=curl_init($url);$headers=['Accept: application/json','Content-Type: application/json'];
        if($token!==null)$headers[]='X-VS-Reset-Token: '.$token;
        else{$headers[]='Cookie: vs_session='.str_repeat((string)$user,64);if($csrf)$headers[]='X-VS-Token: '.str_repeat((string)$user,64);}
        curl_setopt_array($curl,[CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>10,CURLOPT_HTTPHEADER=>$headers]);
        if($body!==null)curl_setopt($curl,CURLOPT_POSTFIELDS,json_encode($body));
        $raw=curl_exec($curl);return ['status'=>curl_getinfo($curl,CURLINFO_HTTP_CODE),'body'=>json_decode((string)$raw,true),'raw'=>$raw];
    };
    try{
        for($i=0;$i<50;$i++){if($probe=@fsockopen('127.0.0.1',$port,$errno,$error,.1)){fclose($probe);break;}usleep(20000);}
        fc($http('GET','/site/reset-install',null,2)['status']===403,'HTTP installation review preserves current owner authority');
        $input=['operation_id'=>'factory-http-review','base_draft_version'=>'draft:0'];
        fc($http('POST','/site/reset-install/prepare',$input,1,false)['status']===403,'HTTP preparation requires owner CSRF');
        fc($http('POST','/site/reset-install',['confirm'=>'RESET INSTALLATION'],1,false)['status']===403,'HTTP activation requires fresh CSRF');
        $response=$http('POST','/site/reset-install/prepare',$input);
        fc($response['status']===200&&($response['body']['data']['status']??'')==='ready','HTTP preparation uses the shared reviewed inventory');
        $p=$response['body']['data'];$token=bin2hex(random_bytes(32));$body=['plan_id'=>$p['plan_id'],'digest'=>$p['digest'],'confirm'=>'RESET INSTALLATION','receipt_token'=>$token];
        $response=$http('POST','/site/reset-install',$body);
        fc($response['status']===200&&($response['body']['data']['status']??'')==='applying','HTTP owner approval enters durable maintenance: '.$response['raw']);
        fc($http('GET','/settings')['status']===503,'Normal application routes stop before database access during cleanup');
        fc($http('POST','/submit.php',[],1,true,$token)['status']===503,'Public form submission is gated before recreating or changing databases');
        $bridge='/_studio/factory-reset.php';$status=$http('GET',$bridge.'?id='.$p['plan_id'],null,1,true,$token);
        fc($status['status']===200&&($status['body']['data']['checkpoint']??-1)===0,'Scoped standalone status works while normal application is gated');
        fc($http('POST',$bridge,['id'=>$p['plan_id'],'checkpoint'=>0,'action'=>'continue'],1,true,str_repeat('0',64))['status']===403,
            'Standalone continuation refuses the wrong scoped capability');
        Database::closeInstance();
        $state=$status['body']['data'];
        for($i=0;$i<100&&$state['status']!=='succeeded';$i++){
            $response=$http('POST',$bridge,['id'=>$p['plan_id'],'checkpoint'=>$state['checkpoint'],'action'=>'continue'],1,true,$token);
            if($response['status']!==200)throw new RuntimeException('HTTP cleanup failed: '.$response['raw']);
            $state=$response['body']['data'];
            if($state['status']==='recovery_required')throw new RuntimeException('HTTP cleanup needs recovery: '.$response['raw']);
        }
        fc($state['status']==='succeeded'&&!file_exists($root.'/_studio/data/studio.db'),'Actual HTTP cleanup completes after deleting Studio authentication and journal storage');
        fc($http('GET',$bridge.'?id='.$p['plan_id'],null,1,true,$token)['body']['data']===$state,'HTTP final lookup survives the deleted installation database');
    }finally{proc_terminate($server);proc_close($server);}
}
echo "$checks factory reset checks passed.\n";
