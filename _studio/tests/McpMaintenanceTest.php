<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
use VoxelSite\{Database,Logger,Migrator,Settings,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,CredentialService,MaintenanceService,OperationActor,OperationException,OperationStore,RequestBudget};
$checks=0;
function maintenanceCheck(bool $ok,string $message):void {
    global $checks;if (!$ok) throw new RuntimeException('FAIL '.$message);$checks++;echo "PASS $message\n";
}
$root=realpath(sys_get_temp_dir()).'/vs-mcp-maintenance-'.bin2hex(random_bytes(6));
foreach (['draft/assets','live/assets','private/changes','private/uploads','private/releases'] as $dir) mkdir($root.'/'.$dir,0700,true);
foreach (['logDir'=>$root.'/private','initialized'=>true] as $key=>$value) (new ReflectionProperty(Logger::class,$key))->setValue(null,$value);
putenv('VS_TEST_MUTATION_LOCK='.$root.'/private/site.lock');
$db=Database::getInstance($root.'/private/studio.db');(new Migrator($db,new Settings($db)))->run();
$db->insert('users',['id'=>1,'name'=>'Owner','email'=>'maintenance@example.invalid','password_hash'=>'not-a-login',
    'role'=>'owner','created_at'=>now(),'updated_at'=>now()]);
$db->update('site_workspace_state',['format'=>2],'id=1');
file_put_contents($root.'/draft/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
file_put_contents($root.'/draft/index.php','Private draft unchanged');file_put_contents($root.'/live/index.php','Live unchanged');
$workspace=new SiteWorkspace($db,$root.'/draft',$root.'/live',$root.'/private/workspace',$root.'/live/assets');
$policy=new ActorPolicy($db);$owner=new OperationActor('user',1,null,[],'studio_configured',null);
$key=(new CredentialService($db))->create($owner,1,'publish','Maintenance fixture',null);
$actor=$policy->fromCredential($key['id']);
$budget=new RequestBudget($db,$policy);
$window=intdiv(time(),RequestBudget::WINDOW)*RequestBudget::WINDOW;
$db->insert('agent_request_budgets',['credential_id'=>$key['id'],'bucket'=>'polls','window_start'=>$window,'request_count'=>RequestBudget::POLLS]);
try {$budget->consume($actor,'tools/call',(object)['name'=>'voxelsite_operations_get']);maintenanceCheck(false,'Exhausted polling refuses');}
catch (OperationException $error) {maintenanceCheck($error->errorCode==='rate_limited' && $error->details['bucket']==='polls','Exhausted polling refuses with its own bucket');}
$budget->consume($actor,'tools/call',(object)['name'=>'voxelsite_operations_continue']);
maintenanceCheck($db->scalar("SELECT request_count FROM agent_request_budgets WHERE bucket='requests'")===1,
    'Exhausted polling leaves explicit continuation budget available');
$db->update('agent_request_budgets',['window_start'=>$window-3600],"bucket='polls'");
$budget->consume($actor,'tools/call',(object)['name'=>'voxelsite_operations_get']);
maintenanceCheck($db->scalar("SELECT request_count FROM agent_request_budgets WHERE bucket='polls'")===1,'A new poll window resets its counter');
$sequence=0;
$seedChange=function(string $label,int $files=1) use($db,$actor,$root,&$sequence):string {
    $id='change_'.str_pad(dechex(++$sequence),32,'0',STR_PAD_LEFT);
    $db->insert('agent_change_sets',['id'=>$id,'actor_key'=>$actor->identity(),'user_id'=>1,'credential_id'=>$actor->credentialId,
        'request_id'=>$label,'request_digest'=>hash('sha256',$label),'base_draft_version'=>'draft:0','brief_id'=>'brief_fixture',
        'summary'=>$label,'status'=>'ready','manifest_json'=>'{}','sealed_digest'=>str_repeat('a',64),'payload_json'=>'{}',
        'staged_bytes'=>4096,'created_at'=>time()-3600,'expires_at'=>time()-1]);
    mkdir($root.'/private/changes/'.$id,0700);
    for ($i=0;$i<$files;$i++) file_put_contents($root.'/private/changes/'.$id.'/file-'.$i.'.txt','Retained staging');
    return $id;
};
$expired=$seedChange('expired-review-001',8);$protected=$seedChange('protected-review-001');$unsafe=$seedChange('unsafe-review-001');
$operations=new OperationStore($db,$policy,$workspace->mutationLockPath());
$operation=$operations->prepare($actor,'pending-apply-001','changes.apply',(object)['change_set_id'=>$protected],'draft:0',$protected);
$external=$root.'/external-sentinel.txt';file_put_contents($external,'Never delete');
symlink($external,$root.'/private/changes/'.$unsafe.'/a-symlink.txt');
$run=function(int $entries=3) use($db,$policy,$workspace,$root,$actor):array {
    $db->update('agent_maintenance_state',['last_run'=>0],'id=1');
    return (new MaintenanceService($db,$policy,$workspace,$root.'/private',$entries,0.25))->run($actor);
};
$first=$run();
maintenanceCheck(!$first['skipped'] && $first['entries']<=3,'Cleanup obeys a hard file-entry budget');
maintenanceCheck($db->scalar('SELECT staged_bytes FROM agent_change_sets WHERE id=?',[$expired])===4096,
    'Partial cleanup preserves its complete storage reservation');
for ($i=0;$i<5;$i++) $run();
maintenanceCheck(!file_exists($root.'/private/changes/'.$expired)
    && $db->scalar('SELECT staged_bytes FROM agent_change_sets WHERE id=?',[$expired])===0,'Repeated bounded steps release quota only after complete verified deletion');
maintenanceCheck($db->scalar('SELECT status FROM agent_change_sets WHERE id=?',[$expired])==='expired'
    && $db->scalar('SELECT request_digest FROM agent_change_sets WHERE id=?',[$expired])===hash('sha256','expired-review-001'),
    'Expired review preserves compact replay identity and request digest');
maintenanceCheck(is_file($root.'/private/changes/'.$protected.'/file-0.txt')
    && $db->scalar('SELECT staged_bytes FROM agent_change_sets WHERE id=?',[$protected])===4096,
    'Prepared operation protects its expired review and retained bytes');
maintenanceCheck(file_get_contents($external)==='Never delete' && is_link($root.'/private/changes/'.$unsafe.'/a-symlink.txt')
    && $db->scalar('SELECT staged_bytes FROM agent_change_sets WHERE id=?',[$unsafe])===4096,
    'Symlink staging fails closed without following it or releasing quota');
$db->update('site_workspace_state',['reservation_operation_id'=>$operation['id']],'id=1');
maintenanceCheck($run()['skipped'],'An active workspace reservation skips opportunistic cleanup');
$db->update('site_workspace_state',['reservation_operation_id'=>null],'id=1');
unlink($root.'/private/changes/'.$unsafe.'/a-symlink.txt');
$run(200);
$upload='upload_'.str_repeat('b',32);
$db->insert('agent_asset_uploads',['id'=>$upload,'actor_key'=>$actor->identity(),'user_id'=>1,'credential_id'=>$key['id'],
    'path'=>'assets/images/fixture.png','mime_type'=>'image/png','expected_bytes'=>20,'expected_hash'=>str_repeat('c',64),
    'status'=>'uploading','created_at'=>time()-86401,'expires_at'=>time()-1]);
$db->insert('agent_asset_requests',['actor_key'=>$actor->identity(),'action'=>'begin','request_id'=>'expired-upload-001',
    'upload_id'=>$upload,'request_digest'=>str_repeat('d',64),'result_json'=>'{}','created_at'=>time()-86401]);
mkdir($root.'/private/uploads/'.$upload);file_put_contents($root.'/private/uploads/'.$upload.'/chunk','unfinished bytes');
$run(200);
maintenanceCheck(!file_exists($root.'/private/uploads/'.$upload)
    && $db->scalar('SELECT expected_bytes FROM agent_asset_uploads WHERE id=?',[$upload])===0,
    'Expired upload cleanup releases disk and accounted capacity');
maintenanceCheck($db->scalar('SELECT request_digest FROM agent_asset_requests WHERE upload_id=?',[$upload])===str_repeat('d',64),
    'Expired upload keeps its request digest tombstone');
$reset='reset_'.str_repeat('e',32);$heldReset='reset_'.str_repeat('f',32);
foreach([$reset,$heldReset] as $id) {
    $db->insert('agent_reset_plans',['id'=>$id,'actor_key'=>$actor->identity(),'request_id'=>$id,
        'request_digest'=>hash('sha256',$id),'status'=>'ready','staged_bytes'=>4096,
        'manifest_json'=>'{}','created_at'=>time()-3600,'expires_at'=>time()-1]);
    mkdir($root.'/private/resets/'.$id,0700,true);
    for($i=0;$i<8;$i++)file_put_contents($root.'/private/resets/'.$id.'/before-'.$i,'reset original');
}
$operations->prepare($actor,'retained-reset-001','site.reset',(object)['reset_id'=>$heldReset],'draft:0',$heldReset);
$run(3);
maintenanceCheck($db->scalar('SELECT staged_bytes FROM agent_reset_plans WHERE id=?',[$reset])===4096,
    'Partial reset cleanup preserves its full storage accounting');
for($i=0;$i<5;$i++)$run(3);
maintenanceCheck(!is_dir($root.'/private/resets/'.$reset)
    && $db->scalar('SELECT staged_bytes FROM agent_reset_plans WHERE id=?',[$reset])===0
    && $db->scalar('SELECT status FROM agent_reset_plans WHERE id=?',[$reset])==='expired',
    'Expired reset cleanup is bounded and keeps an identity tombstone');
maintenanceCheck($db->scalar('SELECT request_digest FROM agent_reset_plans WHERE id=?',[$reset])===hash('sha256',$reset),
    'Reset cleanup preserves the original request digest');
maintenanceCheck(is_file($root.'/private/resets/'.$heldReset.'/before-0')
    && $db->scalar('SELECT staged_bytes FROM agent_reset_plans WHERE id=?',[$heldReset])===4096,
    'Prepared reset work protects its recovery originals from expiry cleanup');
maintenanceCheck(file_get_contents($root.'/draft/index.php')==='Private draft unchanged'
    && file_get_contents($root.'/live/index.php')==='Live unchanged','Maintenance never edits draft or live content');
echo "MCP maintenance: {$checks} checks passed.\n";
