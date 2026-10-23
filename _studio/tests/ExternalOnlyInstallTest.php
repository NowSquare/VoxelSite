<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';

$checks=0;
function installCheck(bool $ok,string $label):void {
    global $checks;if (!$ok) throw new RuntimeException('FAIL '.$label);$checks++;echo "PASS $label\n";
}
function installCopy(string $source,string $target):void {
    if (is_link($source)) throw new RuntimeException('Fixture source cannot be a link.');
    if (is_file($source)) {copy($source,$target);return;}
    mkdir($target,0700,true);
    foreach (scandir($source) as $name) if ($name!=='.' && $name!=='..') installCopy($source.'/'.$name,$target.'/'.$name);
}
function installRequest(string $root,array $input):array {
    $proc=proc_open([PHP_BINARY,__DIR__.'/helpers/call-install-route.php',$root],[['pipe','r'],['pipe','w'],['pipe','w']],$pipes);
    if (!is_resource($proc)) throw new RuntimeException('Cannot run disposable route fixture.');
    fwrite($pipes[0],json_encode($input,JSON_THROW_ON_ERROR));fclose($pipes[0]);
    $out=stream_get_contents($pipes[1]);fclose($pipes[1]);$err=stream_get_contents($pipes[2]);fclose($pipes[2]);
    if (proc_close($proc)!==0 || $err!=='') throw new RuntimeException($err."\n".$out);
    return json_decode($out,true,128,JSON_THROW_ON_ERROR);
}
foreach (['external','later'] as $mode) {
    $root=realpath(sys_get_temp_dir()).'/vs-install-route-'.bin2hex(random_bytes(6));
    mkdir($root,0700);file_put_contents($root.'/.install-route-test','disposable');
    \VoxelSite\Tests\StudioRuntimeFixture::copy($root);
    foreach (['_studio/data/logs','_studio/preview','assets'] as $dir) if (!is_dir($root.'/'.$dir)) mkdir($root.'/'.$dir,0700,true);
    foreach (['router.php','middleware.php','endpoints/install.php','endpoints/mcp-connections.php','endpoints/settings.php','endpoints/files.php','endpoints/site-reset.php','endpoints/api-keys.php'] as $file) {
        copy(dirname(__DIR__).'/api/'.$file,$root.'/_studio/api/'.$file);
    }
    copy(dirname(__DIR__).'/data/default-index.php',$root.'/_studio/data/default-index.php');
    $request=['method'=>'POST','path'=>'/install/complete','body'=>['ai_setup_mode'=>$mode]];
    installCheck(installRequest($root,$request)['status']===400,$mode.': owner and site details remain mandatory');
    installCheck(!file_exists($root.'/_studio/data/config.json'),$mode.': invalid setup writes no configuration');
    $request['body']+=['admin_name'=>'Install owner','admin_email'=>'install@example.invalid',
        'admin_password'=>'fixture-password-123','site_name'=>'Install fixture',
        // Stale hidden provider inputs must not become real configuration.
        'ai_provider'=>'openai','ai_api_key'=>'sk-must-not-be-stored','ai_model'=>'unused-model'];
    $response=installRequest($root,$request);
    installCheck($response['status']===200 && $response['response']['ok'],$mode.': real installer completes under provider-forbidden guard');
    installCheck($response['response']['redirect']==='/subdirectory/_studio/workspace.php',
        $mode.': installation continues at private workspace setup in its own subdirectory');
    $state=installRequest($root,['operation'=>'inspect']);
    installCheck($state['settings']['ai_provider']==='' && $state['settings']['ai_setup_mode']===$mode,
        $mode.': no provider is invented');
    installCheck(!str_contains(json_encode($state['settings']),'sk-must-not-be-stored')
        && !isset($state['settings']['ai_openai_api_key']),$mode.': stale provider credentials are discarded');
    installCheck($state['settings']['studio_mcp_enabled']===false && $state['keys']===[],
        $mode.': MCP is disabled and no credential is created during bootstrap');
    installCheck(count($state['users'])===1 && $state['users'][0]['role']==='owner'
        && password_verify('fixture-password-123',$state['users'][0]['password_hash']),$mode.': mandatory owner is stored with a password hash');
    $session=$state['sessions'][0]['id'];
    installCheck(installRequest($root,$request)['status']===403,$mode.': bootstrap cannot repeat after installation');
    $get=['method'=>'GET','path'=>'/settings/mcp','session'=>$session];
    $status=installRequest($root,$get);
    installCheck($status['status']===200 && !$status['response']['data']['enabled'],$mode.': owner can inspect disabled connections');
    $post=['method'=>'POST','path'=>'/settings/mcp','session'=>$session,'body'=>['enabled'=>true,
        'operation_id'=>'enable-connections-001','version'=>$status['response']['data']['version']]];
    installCheck(installRequest($root,$post)['status']===403,$mode.': enabling requires session-bound CSRF');
    $post['csrf']=$session;
    installCheck(installRequest($root,$post)['status']===409,$mode.': enabling requires private workspace activation');
    $editor=installRequest($root,['operation'=>'activate_fixture'])['editor'];
    installCheck(installRequest($root,['method'=>'GET','path'=>'/settings/mcp','session'=>$editor])['status']===403,
        $mode.': editor cannot administer connections');
    $enabled=installRequest($root,$post);
    installCheck($enabled['status']===200 && $enabled['response']['data']['enabled']
        && $enabled['response']['data']['endpoint']==='https://fixture.invalid/subdirectory/_studio/mcp.php',
        $mode.': explicit owner action enables the configured subdirectory endpoint');
    installCheck(installRequest($root,$post)['response']['data']['operation']===$enabled['response']['data']['operation'],
        $mode.': connection enable replay returns one retained receipt');
    $staleToggle=array_replace($post,['body'=>['operation_id'=>'stale-toggle-001','enabled'=>false,'version'=>$status['response']['data']['version']]]);
    installCheck(installRequest($root,$staleToggle)['response']['error']['code']==='content_conflict',
        $mode.': connection access change requires the displayed current version');
    installRequest($root,['operation'=>'storage_failure_fixture','enabled'=>true]);
    $storageFailure=installRequest($root,array_replace($post,['body'=>['operation_id'=>'storage-failure-toggle',
        'enabled'=>false,'version'=>$enabled['response']['data']['version']]]));
    installRequest($root,['operation'=>'storage_failure_fixture','enabled'=>false]);
    installCheck($storageFailure['status']===500 && $storageFailure['response']['error']['code']==='connection_failed'
        && !str_contains(json_encode($storageFailure),'Finish private draft setup'),
        $mode.': database write failures are not mislabeled as missing workspace setup');
    installCheck(installRequest($root,$get)['response']['data']['enabled'],
        $mode.': failed access change preserves the enabled setting');
    installRequest($root,['operation'=>'workspace_read_failure_fixture','enabled'=>true]);
    $readFailure=installRequest($root,array_replace($post,['body'=>['operation_id'=>'storage-read-failure-toggle',
        'enabled'=>false,'version'=>$enabled['response']['data']['version']]]));
    installRequest($root,['operation'=>'workspace_read_failure_fixture','enabled'=>false]);
    installCheck($readFailure['status']===500 && $readFailure['response']['error']['code']==='connection_failed'
        && !str_contains(json_encode($readFailure),'Finish private draft setup'),
        $mode.': workspace state read failures are not mislabeled as missing setup');
    $create=['method'=>'POST','path'=>'/settings/mcp/connections','session'=>$session,'csrf'=>$session,
        'body'=>['user_id'=>1,'preset'=>'edit','label'=>'Disposable connection','expiry_days'=>30,
            'operation_id'=>'create-connection-001']];
    $created=installRequest($root,$create);
    installCheck($created['status']===200 && !str_contains(json_encode($created),'vxs_'),
        $mode.': credential creation returns a retained receipt without plaintext');
    $createdAgain=installRequest($root,$create);
    installCheck($createdAgain['response']===$created['response'],
        $mode.': lost credential creation response returns the same receipt');
    $claim=['method'=>'POST','path'=>'/settings/mcp/approvals/'.$created['response']['data']['plan_id'].'/reveal',
        'session'=>$session,'csrf'=>$session,'body'=>[]];
    $claimed=installRequest($root,$claim);
    installCheck($claimed['status']===200 && str_starts_with($claimed['response']['data']['key'],'vxs_'),
        $mode.': owner deliberately claims the credential once');
    installCheck(installRequest($root,$claim)['status']===409,$mode.': claimed credential cannot be revealed twice');
    $key=$claimed['response']['data'];
    $listed=installRequest($root,$get);
    installCheck(!str_contains(json_encode($listed),$key['key'])
        && $listed['response']['data']['connections'][0]['expires_at']>time()+29*86400,
        $mode.': listing omits secret and default expiry is thirty days');
    $revokeRequest=['method'=>'DELETE','path'=>'/settings/mcp/connections/'.$created['response']['data']['credential_id'],
        'session'=>$session,'csrf'=>$session,'body'=>['operation_id'=>'revoke-connection-001',
            'version'=>$listed['response']['data']['connections'][0]['version']]];
    $revoke=installRequest($root,$revokeRequest);
    installCheck($revoke['status']===200
        && installRequest($root,$get)['response']['data']['connections'][0]['revoked_at']!==null,
        $mode.': owner revocation persists');
    installCheck(installRequest($root,$revokeRequest)['response']===$revoke['response'],
        $mode.': revoked credential replay uses its original displayed version');
    $restCreate=['method'=>'POST','path'=>'/settings/api-keys','session'=>$session,'csrf'=>$session,
        'body'=>['label'=>'REST fixture','role'=>'viewer','scopes'=>['pages:read'],'operation_id'=>'rest-create-fixture-001']];
    $restCreated=installRequest($root,$restCreate);
    installCheck($restCreated['status']===201 && !str_contains(json_encode($restCreated),'vxs_'),
        $mode.': REST creation also returns a redacted durable receipt');
    installCheck(installRequest($root,$restCreate)['response']===$restCreated['response'],
        $mode.': lost REST creation response cannot create a duplicate key');
    $restList=installRequest($root,['method'=>'GET','path'=>'/settings/api-keys','session'=>$session])['response']['data'];
    installCheck(count($restList['keys'])===1 && count($restList['pending_secrets'])===1 && $restList['keys'][0]['user_id']===1,
        $mode.': REST inventory includes its account binding, version and separate claim');
    $restRevoke=['method'=>'DELETE','path'=>'/settings/api-keys/'.$restCreated['response']['data']['credential_id'],
        'session'=>$session,'csrf'=>$session,'body'=>['operation_id'=>'rest-revoke-fixture-001','version'=>str_repeat('0',64)]];
    installCheck(installRequest($root,$restRevoke)['response']['error']['code']==='content_conflict',
        $mode.': REST revocation refuses a stale displayed credential version');
    $restRevoke['body']['version']=$restList['keys'][0]['version'];
    $restRevoked=installRequest($root,$restRevoke);
    installCheck($restRevoked['status']===200 && installRequest($root,$restRevoke)['response']===$restRevoked['response'],
        $mode.': REST revocation replays its receipt after the key has been removed');
    $review=installRequest($root,['operation'=>'prepare_admin_fixture'])['plan'];
    $approvalPath='/settings/mcp/approvals/'.$review['plan_id'].'/approve';
    $approval=['method'=>'POST','path'=>$approvalPath,'session'=>$session,'body'=>['digest'=>$review['digest']]];
    installCheck(installRequest($root,$approval)['status']===403,$mode.': owner approval requires session-bound CSRF');
    $approval['csrf']=$session;
    installCheck(installRequest($root,array_replace($approval,['session'=>$editor,'csrf'=>$editor]))['status']===403,
        $mode.': editor session cannot approve administrative elevation');
    installCheck(installRequest($root,array_replace($approval,['body'=>['digest'=>str_repeat('0',64)]]))['status']===409,
        $mode.': owner approval must match the exact retained action digest');
    $approved=installRequest($root,$approval);
    installCheck($approved['status']===200 && $approved['response']['data']['status']==='approved',
        $mode.': owner session issues a receipt for the exact pending action');
    $pending=installRequest($root,$get)['response']['data']['approvals'];
    installCheck(count($pending)===1 && !str_contains(json_encode($pending),'fixture-owner-review-secret'),
        $mode.': owner approval list exposes effects without write-only secret values');
    installCheck(count(installRequest($root,['operation'=>'inspect'])['users'])===2,
        $mode.': approval alone does not execute a team mutation');
    $models=installRequest($root,['method'=>'GET','path'=>'/settings/models','session'=>$session]);
    installCheck($models['status']===200 && $models['response']['data']['models']===[],
        $mode.': unconfigured model discovery returns without a provider call');
    $read=installRequest($root,['method'=>'GET','path'=>'/files/content','query'=>['path'=>'assets/data/editor.json'],'session'=>$session]);
    installCheck($read['status']===200 && $read['response']['data']['content']==="{\"draft\":true}\n"
        && $read['response']['data']['content_sha256']===hash('sha256',"{\"draft\":true}\n"),
        $mode.': editor reads private asset bytes and their exact save precondition');
    $save=['method'=>'PUT','path'=>'/files/content','session'=>$session,'csrf'=>$session,
        'body'=>['operation_id'=>'fixture-save-stale-001','base_draft_version'=>$read['response']['data']['draft_version'],'path'=>'assets/data/editor.json','content'=>"{\"edited\":true}\n",
            'expected_content_sha256'=>str_repeat('0',64)]];
    $conflict=installRequest($root,$save);
    installCheck($conflict['status']===409 && $conflict['response']['error']['code']==='content_conflict'
        && file_get_contents($root.'/_studio/preview/assets/data/editor.json')==="{\"draft\":true}\n",
        $mode.': stale editor save preserves the current private draft');
    $save['body']['operation_id']='fixture-save-reviewed-001';
    $save['body']['expected_content_sha256']=$read['response']['data']['content_sha256'];
    $saved=installRequest($root,$save);
    installCheck($saved['status']===200 && $saved['response']['data']['content_sha256']===hash('sha256',"{\"edited\":true}\n")
        && file_get_contents($root.'/assets/data/editor.json')==="{\"published\":true}\n",
        $mode.': successful editor save returns the committed hash without changing live assets');
    $createdFile=installRequest($root,['method'=>'POST','path'=>'/files/create','session'=>$session,'csrf'=>$session,
        'body'=>['operation_id'=>'fixture-create-file-001','base_draft_version'=>$saved['response']['data']['draft_version'],'expected_content_sha256'=>null,'path'=>'assets/data/private-new.json']]);
    installCheck($createdFile['status']===201 && is_file($root.'/_studio/preview/assets/data/private-new.json')
        && !file_exists($root.'/assets/data/private-new.json'),$mode.': editor file creation stays inside the private workspace');
    $resetVersion=installRequest($root,['method'=>'GET','path'=>'/site/reset','session'=>$session])['response']['data']['draft_version'];
    $resetRequest=['method'=>'POST','path'=>'/site/reset/prepare','session'=>$session,'csrf'=>$session,
        'body'=>['operation_id'=>'owner-site-reset-001','base_draft_version'=>$resetVersion]];
    installCheck(installRequest($root,array_replace($resetRequest,['session'=>$editor,'csrf'=>$editor]))['status']===403,
        $mode.': site reset requires the current owner account');
    $resetReview=installRequest($root,$resetRequest);
    installCheck($resetReview['status']===200 && $resetReview['response']['data']['status']==='pending'
        && is_file($root.'/_studio/preview/assets/data/private-new.json'),$mode.': exact reset preparation changes no website files');
    $resetPlan=$resetReview['response']['data'];
    $resetApply=['method'=>'POST','path'=>'/site/reset','session'=>$session,
        'body'=>['plan_id'=>$resetPlan['plan_id'],'digest'=>$resetPlan['digest'],'confirm'=>'RESET']];
    installCheck(installRequest($root,$resetApply)['status']===403,$mode.': reset approval requires session-bound CSRF');
    $resetApply['csrf']=$session;
    installCheck(installRequest($root,array_replace($resetApply,['body'=>['confirm'=>'RESET']]))['status']===422,
        $mode.': a confirmation string alone cannot authorize reset');
    $resetResult=installRequest($root,$resetApply);
    installCheck($resetResult['status']===200 && $resetResult['response']['data']['status']==='succeeded',
        $mode.': owner confirmation applies the exact displayed reset');
    installCheck(installRequest($root,$resetApply)['response']['data']===$resetResult['response']['data'],
        $mode.': repeated owner reset returns one retained operation result');
    clearstatcache();
    installCheck(!is_file($root.'/_studio/preview/assets/data/private-new.json')
        && file_get_contents($root.'/assets/data/editor.json')==="{\"published\":true}\n"
        && file_get_contents($root.'/index.php')===file_get_contents($root.'/_studio/data/default-index.php'),
        $mode.': reset deletes only the reviewed draft and managed paths, preserving unrelated public data');
}
echo "External-only installation: {$checks} checks passed through copied production routes.\n";
