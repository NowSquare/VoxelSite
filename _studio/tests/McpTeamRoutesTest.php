<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';

require_once dirname(__DIR__).'/engine/bootstrap.php';
require __DIR__.'/fixtures/mcp/ServiceFixture.php';
use VoxelSite\{Database,Encryption,Logger,Migrator,Settings,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,AdminApprovalStore,AdministrationService,CanonicalJson,CredentialAdministrationService,CredentialService,OperationActor};
$root=realpath(sys_get_temp_dir()).'/vs-team-routes-'.bin2hex(random_bytes(6));
foreach(['_studio/data','_studio/preview/assets','assets'] as $path)mkdir($root.'/'.$path,0700,true);
foreach(['VS_TEST_PREVIEW_DIR'=>$root.'/_studio/preview','VS_TEST_ASSETS_DIR'=>$root.'/assets','VS_TEST_DOC_ROOT'=>$root,
    'VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/_studio/data/workspace','VS_TEST_MUTATION_LOCK'=>$root.'/_studio/data/site.lock'] as $key=>$value)putenv($key.'='.$value);
foreach(['logDir'=>$root.'/_studio/data','initialized'=>true] as $key=>$value)(new ReflectionProperty(Logger::class,$key))->setValue(null,$value);
$db=Database::getInstance($root.'/_studio/data/studio.db');(new Migrator($db,new Settings($db)))->run();
foreach(['owner','editor','viewer'] as $id=>$role)$db->insert('users',['id'=>$id+1,'name'=>ucfirst($role),'email'=>$role.'@example.invalid','role'=>$role,'password_hash'=>'not-a-login','created_at'=>now(),'updated_at'=>now()]);
$db->update('site_workspace_state',['format'=>2],'id=1');
$key=Encryption::generateKey();file_put_contents($root.'/_studio/data/config.json',json_encode(['app_key'=>$key]));
file_put_contents($root.'/_studio/preview/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
$workspace=new SiteWorkspace($db);$policy=new ActorPolicy($db);$owner=new OperationActor('user',1,null,[],'studio_configured',null);
$approvals=new AdminApprovalStore($db,$policy,$workspace,$key);$service=new AdministrationService($db,$policy,$approvals);
$baseline=[$workspace->status(),SiteWorkspace::inventory($root.'/assets')];
\VoxelSite\Tests\StudioRuntimeFixture::copy($root);copy(__DIR__.'/helpers/team-router.php',$root.'/router.php');
$socket=stream_socket_server('tcp://127.0.0.1:0',$errno,$error);
if(!$socket)throw new RuntimeException('Cannot open disposable loopback fixture: '.$error);
$port=(int)substr(strrchr(stream_socket_get_name($socket,false),':'),1);fclose($socket);
(new Settings($db))->set('site_url','http://127.0.0.1:'.$port);
$server=proc_open([PHP_BINARY,'-S','127.0.0.1:'.$port,$root.'/router.php'],[['pipe','r'],['file',$root.'/server.log','a'],['file',$root.'/server.log','a']],$pipes,$root);
fclose($pipes[0]);$checks=0;
function teamRouteCheck(bool $ok,string $label):void {global $checks;$checks++;if(!$ok)throw new RuntimeException('FAIL '.$label);echo 'PASS '.$label."\n";}
function teamHttp(string $method,string $path,?array $body=null,int $user=1):array {
    global $port;$curl=curl_init('http://127.0.0.1:'.$port.'/_studio/api/router.php?_path='.rawurlencode($path));
    curl_setopt_array($curl,[CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>10,CURLOPT_HTTPHEADER=>['Content-Type: application/json','X-Fixture-User: '.$user]]);
    if($body!==null)curl_setopt($curl,CURLOPT_POSTFIELDS,json_encode($body));
    $raw=curl_exec($curl);return ['status'=>curl_getinfo($curl,CURLINFO_HTTP_CODE),'body'=>json_decode((string)$raw,true)];
}
try {
    for($i=0;$i<50;$i++){if($probe=@fsockopen('127.0.0.1',$port,$errno,$error,.1)){fclose($probe);break;}usleep(20000);}
    $listed=teamHttp('GET','/team');$ownerMember=$listed['body']['data']['members'][0]??[];
    teamRouteCheck($listed['status']===200 && isset($ownerMember['version']) && array_key_exists('last_login_at',$ownerMember),'Studio team list returns redacted versions and last active metadata');
    teamRouteCheck(teamHttp('GET','/team',null,2)['status']===403 && teamHttp('GET','/team',null,3)['status']===403,'Current database roles protect team management');
    $create=['operation_id'=>'http-team-create-001','name'=>'Route editor','email'=>'route@example.invalid','password'=>'disposable-create-secret','role'=>'editor'];
    $response=teamHttp('POST','/team',$create);$created=$response['body']['data']??[];$member=$created['member']??[];
    teamRouteCheck($response['status']===201 && $created['operation']['status']==='succeeded' && isset($member['version']),'Owner form submission prepares approves and applies its exact team change');
    teamRouteCheck(teamHttp('POST','/team',$create)['body']['data']['operation']===$created['operation'] && $db->count('users')===4,'Lost create response replays the same consumed receipt without another account');
    teamRouteCheck(!str_contains(json_encode($created),'disposable-create-secret') && !str_contains(json_encode($db->query('SELECT * FROM agent_admin_plans')),'disposable-create-secret'),'Team secrets appear in neither response nor retained plaintext storage');
    $id=$member['id'];$oldVersion=$member['version'];
    $plan=$service->prepare($owner,(object)['operation_id'=>'external-team-edit-001','intent'=>(object)['type'=>'team.update','user_id'=>$id,'version'=>$oldVersion,'fields'=>(object)['name'=>'External editor']]]);
    $approvals->approve($owner,$plan['plan_id'],$plan['digest']);$external=$service->apply($owner,(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest']]);
    $stale=teamHttp('PUT','/team/'.$id,['operation_id'=>'http-stale-team-001','version'=>$oldVersion,'name'=>'Stale browser']);
    teamRouteCheck($stale['status']===409 && $stale['body']['error']['code']==='content_conflict','Stale Studio edit cannot overwrite an external team change');
    $saved=teamHttp('PUT','/team/'.$id,['operation_id'=>'http-team-update-001','version'=>$external['result']['version'],'name'=>'Reviewed editor','role'=>'viewer'])['body']['data'];
    teamRouteCheck($saved['member']['name']==='Reviewed editor' && $saved['member']['role']==='viewer','Reviewed Studio update preserves member response shape');
    $db->insert('sessions',['user_id'=>$id,'id'=>'fixture-session','created_at'=>now(),'expires_at'=>gmdate('Y-m-d\TH:i:s\Z',time()+3600),'ip_address'=>'127.0.0.1','user_agent'=>'Fixture']);
    $password=['operation_id'=>'http-team-password-001','version'=>$saved['member']['version'],'password'=>'disposable-reset-secret'];
    $reset=teamHttp('POST','/team/'.$id.'/password',$password)['body']['data'];
    teamRouteCheck($reset['message']==='Password has been reset.' && $db->count('sessions','user_id=?',[$id])===0 && password_verify($password['password'],$db->scalar('SELECT password_hash FROM users WHERE id=?',[$id])),'Password reset retains message shape and revokes previous sessions');
    teamRouteCheck(teamHttp('POST','/team/'.$id.'/password',$password)['body']['data']['operation']===$reset['operation'],'Password reset replay succeeds using its original version');
    teamRouteCheck(teamHttp('DELETE','/team/1',['operation_id'=>'http-owner-delete-001','version'=>$ownerMember['version']])['status']===403,'Studio cannot remove the owner');
    teamRouteCheck(teamHttp('POST','/team/1/password',['operation_id'=>'http-owner-password-001','version'=>$ownerMember['version'],'password'=>'not-allowed-secret'])['status']===403,'Studio team API cannot reset the owner password');
    teamRouteCheck(teamHttp('PUT','/team/'.$id,['name'=>'No version'])['status']===422,'Team writes require an operation ID and exact member version');
    $version=CanonicalJson::digest($db->queryOne('SELECT * FROM users WHERE id=?',[$id]));
    $deleted=teamHttp('DELETE','/team/'.$id,['operation_id'=>'http-team-delete-001','version'=>$version])['body']['data'];
    teamRouteCheck($deleted['deleted'] && $db->scalar('SELECT disabled_at FROM users WHERE id=?',[$id])!==null,'Studio removal preserves deleted response and inactive history identity');
    teamRouteCheck(teamHttp('DELETE','/team/'.$id,['operation_id'=>'http-team-delete-001','version'=>$version])['body']['data']===$deleted,'Removal replays without reviving or repeating account changes');
    teamRouteCheck([$workspace->status(),SiteWorkspace::inventory($root.'/assets')]===$baseline,'Team routes leave website draft and published files unchanged');
    echo "$checks team HTTP checks passed\n";
    if(in_array('--browser',$argv,true)) {
        $credentials=new CredentialService($db);$requester=$credentials->create($owner,1,'read','Fixture requesting connection',null,null,['credentials:write']);
        $externalActor=$policy->fromCredential($requester['id']);$credentialAdmin=new CredentialAdministrationService($db,$policy,$approvals);
        foreach(['pending'=>'Pending reviewed connection','ready'=>'Ready to save fixture'] as $state=>$label) {
            $review=$credentialAdmin->prepare($externalActor,(object)['operation_id'=>'browser-credential-'.$state,'intent'=>(object)['type'=>'credential.create','audience'=>'studio_mcp',
                'user_id'=>1,'label'=>$label,'preset'=>'read','extra_scopes'=>[],'expires_at'=>time()+3600]]);
            if($state==='ready'){$approvals->approve($owner,$review['plan_id'],$review['digest']);$credentialAdmin->apply($externalActor,(object)['plan_id'=>$review['plan_id'],'digest'=>$review['digest']]);}
        }
        foreach(['src','dist'] as $path)mcpCopyFixture(dirname(__DIR__).'/ui/'.$path,$root.'/_studio/ui/'.$path);
        foreach(['api.js','state.js'] as $path)copy(dirname(__DIR__).'/ui/'.$path,$root.'/_studio/ui/'.$path);
        copy(__DIR__.'/helpers/team-browser.html',$root.'/index.html');
        file_put_contents('/private/tmp/voxelsite-team-fixture.json',json_encode(['root'=>$root,'port'=>$port]));
        echo "Browser fixture: http://127.0.0.1:$port\n";
        while(!file_exists($root.'/stop'))sleep(1);
    }
}finally{proc_terminate($server);proc_close($server);}
