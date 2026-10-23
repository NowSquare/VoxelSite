<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
use VoxelSite\{Database,Encryption,Logger,Migrator,Settings,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,AdminApprovalStore,CanonicalJson,CredentialService,OperationActor,OperationException,
    OperationStore,PublishPlanService,ReleaseStore,ResetInventory,ResetService};

function resetCrashFixture(string $root,bool $seed):array
{
    if($seed)foreach(['studio/preview/assets','studio/data','live/assets'] as $dir)mkdir($root.'/'.$dir,0700,true);
    $root=realpath($root);
    if(!$root || !str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-reset-crash-'))throw new RuntimeException('Disposable reset fixture required.');
    foreach(['logDir'=>$root.'/studio/data','initialized'=>true] as $key=>$value)(new ReflectionProperty(Logger::class,$key))->setValue(null,$value);
    $db=Database::getInstance($root.'/studio/data/test.db');
    if($seed){
        (new Migrator($db,new Settings($db)))->run();
        $db->insert('users',['name'=>'Owner','email'=>'reset@example.invalid','password_hash'=>'no-login','role'=>'owner','created_at'=>now(),'updated_at'=>now()]);
        $db->update('site_workspace_state',['format'=>2],'id=1');
        file_put_contents($root.'/studio/preview/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
        file_put_contents($root.'/studio/preview/index.php','Original draft');
        file_put_contents($root.'/live/index.php','Original live');
        file_put_contents($root.'/live/unrelated.txt','Preserved hosting');
        file_put_contents($root.'/studio/data/default-index.php',"<?php echo 'Fresh site';");
        $db->insert('pages',['slug'=>'index','title'=>'Original page','file_path'=>'index.php','created_at'=>now(),'updated_at'=>now()]);
        $db->insert('conversations',['id'=>'conversation-fixture','user_id'=>1,'title'=>'Original conversation','created_at'=>now(),'updated_at'=>now()]);
        $db->insert('prompt_log',['conversation_id'=>'conversation-fixture','user_id'=>1,'user_prompt'=>'Retained usage history',
            'ai_provider'=>'fixture','ai_model'=>'fixture','created_at'=>now()]);
        $manifest=['index.php'=>hash('sha256','Original live')];$release='release_'.str_repeat('a',32);
        $db->insert('site_releases',['id'=>$release,'plan_id'=>'fixture','operation_id'=>'fixture','actor_json'=>'{}','draft_version'=>0,
            'manifest_json'=>CanonicalJson::encode($manifest),'digest'=>CanonicalJson::digest($manifest),'created_at'=>time()]);
        $db->update('site_workspace_state',['release_id'=>$release],'id=1');
    }
    $workspace=new SiteWorkspace($db,$root.'/studio/preview',$root.'/live',$root.'/studio/data/workspace',$root.'/live/assets');
    $policy=new ActorPolicy($db);$owner=new OperationActor('user',1,null,[],'studio_configured',null);
    if($seed){
        $key=(new CredentialService($db))->create($owner,1,'read','Reset worker',null,null,['reset:site']);
        file_put_contents($root.'/fixture.json',json_encode(['key'=>$key['id'],'app_key'=>Encryption::generateKey()],JSON_THROW_ON_ERROR));
    }
    $fixture=json_decode(file_get_contents($root.'/fixture.json'),true,16,JSON_THROW_ON_ERROR);
    $actor=$policy->fromCredential($fixture['key']);$approvals=new AdminApprovalStore($db,$policy,$workspace,$fixture['app_key']);
    $operations=new OperationStore($db,$policy,$workspace->mutationLockPath());
    $publish=new PublishPlanService($db,$policy,$workspace,new ReleaseStore($db,$policy,$root.'/studio/data/agent/releases'),$operations);
    $inventory=new ResetInventory($db,$workspace,$publish,$root.'/studio',$root.'/studio/data/default-index.php');
    $make=fn(?Closure $hook=null)=>new ResetService($db,$policy,$workspace,$approvals,$operations,$inventory,$root.'/studio/data/agent/resets',100,$hook);
    return [$root,$db,$workspace,$actor,$owner,$approvals,$operations,$make];
}

if(($argv[1]??'')==='--run'){
    [,,$phase,$path]=$argv;
    [$root,$db,$workspace,$actor,$owner,$approvals,$operations,$make]=resetCrashFixture($path,true);
    $hook=function(string $at)use($phase,$root):void{
        if($at!==$phase)return;
        file_put_contents($root.'/killed-at.txt',$at);
        posix_kill(getmypid(),SIGKILL);
    };
    $service=$make($hook);
    $review=$service->prepare($actor,(object)['operation_id'=>'reset-crash-operation','base_draft_version'=>'draft:0']);
    $approvals->approve($owner,$review['plan_id'],$review['digest']);
    $input=(object)['plan_id'=>$review['plan_id'],'digest'=>$review['digest']];
    file_put_contents($root.'/request.json',json_encode($input,JSON_THROW_ON_ERROR));
    $service->apply($actor,$input);
    throw new RuntimeException('The crash hook did not terminate the worker.');
}
if(($argv[1]??'')==='--check'){
    [,,$phase,$path]=$argv;
    [$root,$db,$workspace,$actor,$owner,$approvals,$operations,$make]=resetCrashFixture($path,false);
    $checks=0;$check=function(bool $ok,string $label)use(&$checks,$phase):void{
        if(!$ok)throw new RuntimeException('FAIL '.$phase.': '.$label);$checks++;echo "PASS $phase: $label\n";
    };
    $service=$make();$before=SiteWorkspace::inventory($root.'/live');
    $operation=$operations->get($actor,'reset-crash-operation');
    $check(SiteWorkspace::inventory($root.'/live')===$before,'status polling does not change website bytes');
    if($phase==='after_commit'){
        $check($operation['state']==='succeeded','committed reset survives a lost response');
        $result=$service->apply($actor,json_decode(file_get_contents($root.'/request.json')));
    }else{
        $check($operation['state']==='applying' && $operation['recovery']!==null,'recovery manifest exists before interrupted destructive writes');
        $check($db->count('pages')===1 && $db->count('conversations')===1 && $workspace->status()['draft_version']===0,
            'uncommitted projection deletion and version changes roll back');
        try{$service->continue($actor,'reset-crash-operation',$operation['checkpoint_number']);$check(false,'active lease is protected');}
        catch(OperationException $error){$check($error->errorCode==='site_busy','active lease is protected');}
        $db->update('agent_operations',['lease_expires_at'=>time()-1],'id=?',[$operation['id']]);
        $result=$service->continue($actor,'reset-crash-operation',$operation['checkpoint_number']);
    }
    $check($result['status']==='succeeded' && $workspace->status()['draft_version']===1,'explicit continuation commits reset exactly once');
    $check($db->count('pages')===0 && $db->count('conversations')===0 && $db->count('prompt_log')===1,
        'the final projection clears reviewed rows and preserves usage history');
    clearstatcache();
    $check(!is_file($root.'/studio/preview/index.php') && file_get_contents($root.'/live/index.php')===file_get_contents($root.'/studio/data/default-index.php'),
        'final website bytes match the retained reset candidate');
    $check(file_get_contents($root.'/live/unrelated.txt')==='Preserved hosting' && $workspace->status()['reservation_operation_id']===null,
        'unrelated hosting survives and verified completion releases the reservation');
    $check($service->apply($actor,json_decode(file_get_contents($root.'/request.json')))===$result,'replay cannot repeat reset');
    echo "RESET_CRASH_CHECKS=$checks\n";exit(0);
}
if(!function_exists('posix_kill') || !function_exists('proc_open'))throw new RuntimeException('Development crash tests require posix and proc_open; these are not buyer dependencies.');
$total=0;
foreach(['after_file','after_projection','after_commit'] as $phase){
    $root=realpath(sys_get_temp_dir()).'/vs-reset-crash-'.bin2hex(random_bytes(6));
    foreach(['--run','--check'] as $mode){
        $process=proc_open([PHP_BINARY,__FILE__,$mode,$phase,$root],[['pipe','r'],['pipe','w'],['pipe','w']],$pipes);
        if(!is_resource($process))throw new RuntimeException('Cannot start isolated crash worker.');
        fclose($pipes[0]);$out=stream_get_contents($pipes[1]);fclose($pipes[1]);
        $err=stream_get_contents($pipes[2]);fclose($pipes[2]);$code=proc_close($process);
        if(($mode==='--run' && (!is_file($root.'/killed-at.txt') || $code===0)) || ($mode==='--check' && $code!==0))
            throw new RuntimeException($out.$err."\nFixture: $root");
        if($mode==='--check'){echo $out;if(preg_match('/RESET_CRASH_CHECKS=(\d+)/',$out,$match))$total+=(int)$match[1];}
    }
}
echo "Reset crash recovery: $total checks passed with real process termination.\n";
