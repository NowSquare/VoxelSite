<?php
declare(strict_types=1);

// Seed only an explicit disposable browser fixture, never the source installation.
if(PHP_SAPI!=='cli')throw new RuntimeException('Review scenario seeding is CLI only.');
$given=rtrim($argv[1]??'','/');$root=realpath($given);$temporary=realpath(sys_get_temp_dir());
$scenario=$argv[2]??'';
if(!$root || $root!==$given || !$temporary || !str_starts_with($root,$temporary.'/vs-studio-review-')
    || is_link($given) || !is_file($root.'/.studio-review-fixture') || is_link($root.'/.studio-review-fixture')
    || file_get_contents($root.'/.studio-review-fixture')!=='Disposable browser review only.'
    || realpath($root.'/site')!==$root.'/site' || is_dir($root.'/.git') || is_dir($root.'/site/.git'))
    throw new RuntimeException('Pass the canonical root of a disposable Studio review fixture.');
if(!in_array($scenario,['approval','connections','recovery','conflict','snapshot','update-package','inspect'],true))
    throw new RuntimeException('Choose approval, connections, recovery, conflict, snapshot, update-package, or inspect.');
$fixture=json_decode(file_get_contents($root.'/fixture.json'),true,16,JSON_THROW_ON_ERROR);
if(($fixture['root']??null)!==$root)throw new RuntimeException('Fixture metadata does not match its root.');
foreach(['site/_studio/engine/bootstrap.php','site/_studio/data/config.json','site/_studio/data/studio.db'] as $path)
    if(realpath($root.'/'.$path)!==$root.'/'.$path || is_link($root.'/'.$path))throw new RuntimeException('Fixture runtime paths must be local and unlinked.');
$receipt=$root.'/scenario-'.$scenario.'.json';
if(is_file($receipt) && $scenario!=='inspect') { echo file_get_contents($receipt);exit; }
require $root.'/provider-trap.php';
require $root.'/site/_studio/engine/bootstrap.php';
if(!str_starts_with((new ReflectionClass(VoxelSite\Database::class))->getFileName(),$root.'/site/'))
    throw new RuntimeException('Scenario runtime escaped the disposable installation.');
use VoxelSite\{AgentAuth,Database,FileManager,Settings,SiteWorkspace,SnapshotService,StudioOwnerRecovery};
use VoxelSite\Agent\{ActorPolicy,AdminApprovalStore,AdministrationService,AuthoringBriefService,BriefStore,
    ChangeSetExecutor,ChangeSetService,ChangeSetStore,ConnectionService,ContextService,CredentialService,
    McpApplication,OperationActor,OperationStore,ProtocolProfile,ReleaseStore};
$db=Database::getInstance($root.'/site/_studio/data/studio.db');
$workspace=new SiteWorkspace($db);$policy=new ActorPolicy($db);
$ownerId=(int)$db->scalar("SELECT id FROM users WHERE role='owner' AND disabled_at IS NULL ORDER BY id LIMIT 1");
$owner=new OperationActor('user',$ownerId,null,[],'studio_configured',null);
$policy->requireOwnerSession($owner);
$config=json_decode(file_get_contents($root.'/site/_studio/data/config.json'),true,16,JSON_THROW_ON_ERROR);
$credentials=new CredentialService($db);$private=$root.'/site/_studio/data/agent';
$operations=new OperationStore($db,$policy,$workspace->mutationLockPath());
$GLOBALS['lifecycle_provider_attempts']=0;
function reviewRequest(array $key,string $method='tools/list',array $params=[],?string $body=null):array {
    global $db,$workspace,$config,$private,$credentials;
    return McpApplication::create($db,$config,$workspace,$private)->handle('POST',[
        'content-type'=>'application/json','accept'=>'application/json, text/event-stream',
        'mcp-protocol-version'=>ProtocolProfile::COMPATIBILITY,'authorization'=>'Bearer '.$key['key']],
        $body??json_encode(['jsonrpc'=>'2.0','id'=>1,'method'=>$method,'params'=>(object)$params],JSON_THROW_ON_ERROR),
        static function(string $token)use($credentials){$_SERVER['HTTP_AUTHORIZATION']='Bearer '.$token;return $credentials->authenticate(null,true);});
}
$result=['scenario'=>$scenario,'root'=>$root];
switch($scenario) {
    case 'approval':
        $key=$credentials->create($owner,$ownerId,'read','Codex team review','Codex',null,['team:write']);
        if(reviewRequest($key)['status']!==200)throw new RuntimeException('Approval author did not authenticate.');
        $actor=$policy->fromCredential($key['id']);
        $admin=new AdministrationService($db,$policy,new AdminApprovalStore($db,$policy,$workspace,$config['app_key']));
        $plan=$admin->prepare($actor,(object)['operation_id'=>'browser-owner-approval-001','intent'=>(object)[
            'type'=>'team.create','name'=>'Review contributor','email'=>'contributor-review@example.invalid',
            'password'=>'Disposable-contributor-2026!','role'=>'editor']]);
        if($plan['status']!=='pending')throw new RuntimeException('Expected a real pending owner approval.');
        $result+=['credential_id'=>$key['id'],'plan_id'=>$plan['plan_id'],'digest'=>$plan['digest'],'status'=>$plan['status']];
        break;
    case 'connections':
        if(!$db->scalar("SELECT name FROM sqlite_master WHERE name='studio_mcp_connection_events'"))
            throw new RuntimeException('Create a fresh review fixture from the C2 runtime with migration 039.');
        $ids=[];
        foreach(['waiting','authenticated','used','permission_denied','authentication_failed','revoked','expired'] as $state) {
            $key=$credentials->create($owner,$ownerId,'read','Review '.$state,'Codex',time()+86400);$ids[$state]=$key['id'];
            if($state==='authenticated')reviewRequest($key,body:'{not-json');
            elseif($state==='used')reviewRequest($key);
            elseif($state==='permission_denied')reviewRequest($key,'tools/call',['name'=>'voxelsite_publish_prepare','arguments'=>(object)[]]);
            elseif($state==='authentication_failed') {$_SERVER['HTTP_AUTHORIZATION']='Bearer '.$key['key'];(new AgentAuth($db))->authenticate('rest');}
            elseif($state==='revoked'){$credentials->revoke($owner,$key['id']);reviewRequest($key);}
            elseif($state==='expired'){$db->update('studio_mcp_credentials',['expires_at'=>time()-1],'key_id = ?',[$key['id']]);reviewRequest($key);}
        }
        $userId=(new VoxelSite\Auth($db))->createUser('Inactive review account','inactive-review@example.invalid','Disposable-inactive-2026!','viewer');
        $key=$credentials->create($owner,$userId,'read','Review disabled account','Claude Code');$ids['disabled']=$key['id'];
        $db->update('users',['disabled_at'=>time()],'id = ?',[$userId]);reviewRequest($key);
        $rows=(new ConnectionService($db,$workspace,$config))->status($owner)['connections'];$states=[];
        foreach($ids as $expected=>$id) {
            $row=array_values(array_filter($rows,static fn($row)=>$row['id']===$id))[0];
            if($row['connection_state']!==$expected)throw new RuntimeException('Unexpected seeded connection state: '.$expected);
            $states[$expected]=['id'=>$id,'state'=>$row['connection_state']];
        }
        $result+=['connections'=>$states];break;
    case 'recovery':
        $key=$credentials->create($owner,$ownerId,'edit','Interrupted Codex edit','Codex');
        if(reviewRequest($key)['status']!==200)throw new RuntimeException('Recovery author did not authenticate.');
        $actor=$policy->fromCredential($key['id']);$briefs=new BriefStore($db,$policy);
        $brief=(new AuthoringBriefService(new ContextService($db,$policy,$workspace),$briefs))->create($actor,
            ['request_id'=>'browser-recovery-brief','action'=>'edit_page']);
        $changes=new ChangeSetStore($db,$policy,$private.'/changes');$edits=[];
        foreach(['index.php','about.php'] as $path) {
            $content=file_get_contents($workspace->resolveDraft($path));
            $after=str_replace('</section>','<p>Retained browser review edit.</p></section>',$content);
            if($after===$content)throw new RuntimeException('Review page has no expected section.');
            $edits[]=(object)['type'=>'replace','path'=>$path,'expected_hash'=>hash('sha256',$content),'content'=>$after];
        }
        $plan=(new ChangeSetService($db,$policy,$workspace,$briefs,$changes))->prepare($actor,(object)[
            'request_id'=>'browser-recovery-plan','base_draft_version'=>'draft:'.$workspace->status()['draft_version'],
            'brief_id'=>$brief['brief_id'],'summary'=>'Two interrupted review page edits','operations'=>$edits]);
        $executor=new ChangeSetExecutor($db,$policy,$workspace,$changes,$operations,1);
        $partial=$executor->apply($actor,(object)['operation_id'=>'browser-recovery-apply','change_set_id'=>$plan['change_set_id'],'digest'=>$plan['digest']]);
        if($partial['status']!=='applying')throw new RuntimeException('Expected an interrupted bounded two-file change.');
        $operation=$operations->get($actor,$partial['operation_id']);$credentials->revoke($owner,$key['id']);
        $view=StudioOwnerRecovery::create($db,$workspace,$config)->inspect($owner,$operation['id']);
        if(!$view['eligible'] || count($view['paths'])<2)throw new RuntimeException('Retained change is not owner-recoverable.');
        $result+=['credential_id'=>$key['id'],'operation_id'=>$operation['id'],'public_operation_id'=>$partial['operation_id'],
            'checkpoint'=>$partial['checkpoint'],'status'=>$partial['status'],'eligible'=>$view['eligible'],'paths'=>$view['paths']];
        break;
    case 'conflict':
        $path='index.php';$beforeVersion=$workspace->status()['draft_version'];
        $before=file_get_contents($workspace->resolveDraft($path));$after=$before."\n<!-- External review edit: keep this saved version. -->\n";
        (new FileManager($db,$workspace))->writeExactFile($path,$after);
        $afterVersion=$workspace->status()['draft_version'];
        if($afterVersion<=$beforeVersion || file_get_contents($workspace->resolveDraft($path))!==$after)
            throw new RuntimeException('External exact write did not advance the draft version.');
        $result+=['path'=>$path,'before_version'=>$beforeVersion,'after_version'=>$afterVersion,
            'before_hash'=>hash('sha256',$before),'after_hash'=>hash('sha256',$after)];break;
    case 'snapshot':
        $snapshots=new SnapshotService($db,$policy,$workspace,new ReleaseStore($db,$policy,$private.'/releases'),$operations,
            $private.'/snapshots',$root.'/site/_studio/data/snapshots',$root.'/site/_studio/data/actions');
        $capture=$snapshots->create($owner,(object)['operation_id'=>'browser-snapshot-create','domain'=>'draft','label'=>'Before browser review']);
        for($step=0;$capture['status']==='applying' && $step<100;$step++)
            $capture=$snapshots->continue($owner,$capture['operation_id'],$capture['checkpoint']);
        if($capture['status']!=='succeeded')throw new RuntimeException('Review snapshot did not complete.');
        $result+=['status'=>$capture['status'],'snapshot'=>$capture['result']];break;
    case 'update-package':
        // Deliberately small UI-review fixture, never a release qualification artifact.
        $dist=$root.'/site/dist';if(!is_dir($dist))mkdir($dist,0700);
        if(realpath($dist)!==$dist || is_link($dist))throw new RuntimeException('Review ZIP directory must be local.');
        $path=$dist.'/ui-review.zip';$zip=new ZipArchive();
        if($zip->open($path,ZipArchive::CREATE|ZipArchive::OVERWRITE)!==true)throw new RuntimeException('Cannot create review ZIP.');
        $zip->addFromString('VERSION','1.33.0-rc.1');
        foreach(['_studio/engine/bootstrap.php','_studio/mcp.php'] as $file)
            $zip->addFromString($file,file_get_contents($root.'/site/'.$file));
        $zip->close();
        $result+=['path'=>$path,'sha256'=>hash_file('sha256',$path),'version'=>'1.33.0-rc.1',
            'purpose'=>'Developer UI review only; not release qualification','entries'=>3];break;
    case 'inspect':
        $result+=['workspace'=>$workspace->status(),'connections'=>(new ConnectionService($db,$workspace,$config))->status($owner),
            'recovery'=>StudioOwnerRecovery::create($db,$workspace,$config)->list($owner)];break;
}
unset($_SERVER['HTTP_AUTHORIZATION']);
if(($GLOBALS['lifecycle_provider_attempts']??0)!==0)throw new RuntimeException('Fixture scenario attempted a provider call.');
$result['provider_calls']=0;
$output=json_encode($result,JSON_THROW_ON_ERROR|JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES)."\n";
if($scenario!=='inspect')file_put_contents($receipt,$output);
echo $output;
