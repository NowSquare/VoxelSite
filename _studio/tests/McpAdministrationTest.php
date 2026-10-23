<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
use VoxelSite\{Database,Encryption,Logger,Migrator,Settings,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,AdminApprovalStore,AdministrationService,CredentialService,JsonSchema,OperationActor,OperationException};

$checks=0;
function adminCheck(bool $ok,string $label):void {
    global $checks;$checks++;if(!$ok)throw new RuntimeException('FAIL '.$label);echo "PASS $label\n";
}
function adminReject(callable $fn,string $code,string $label):void {
    try{$fn();}catch(OperationException $e){adminCheck($e->errorCode===$code,$label.' ('.$e->errorCode.')');return;}
    adminCheck(false,$label);
}
$root=realpath(sys_get_temp_dir()).'/vs-mcp-admin-'.bin2hex(random_bytes(6));
foreach(['draft/assets','live/assets','private'] as $dir)mkdir($root.'/'.$dir,0700,true);
$root=realpath($root);
if(!str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-mcp-admin-'))throw new RuntimeException('Disposable root required.');
foreach(['logDir'=>$root.'/private','initialized'=>true] as $property=>$value)
    (new ReflectionProperty(Logger::class,$property))->setValue(null,$value);
$db=Database::getInstance($root.'/private/test.db');(new Migrator($db,new Settings($db)))->run();
$db->insert('users',['name'=>'Owner','email'=>'owner@example.invalid','password_hash'=>'not-a-login','role'=>'owner','created_at'=>now(),'updated_at'=>now()]);
$db->insert('users',['name'=>'Editor','email'=>'editor@example.invalid','password_hash'=>'not-a-login','role'=>'editor','created_at'=>now(),'updated_at'=>now()]);
$db->update('site_workspace_state',['format'=>2],'id = 1');
(new Settings($db))->set('site_url','https://fixture.invalid/nested');
$workspace=new SiteWorkspace($db,$root.'/draft',$root.'/live',$root.'/private/workspace',$root.'/live/assets');
$policy=new ActorPolicy($db);$owner=new OperationActor('user',1,null,[],'studio_configured',null);
$credentials=new CredentialService($db);
$key=$credentials->create($owner,1,'read','Admin fixture',null,null,['team:write']);
$other=$credentials->create($owner,1,'read','Other admin fixture',null,null,['team:write']);
$actor=$policy->fromCredential($key['id']);$otherActor=$policy->fromCredential($other['id']);
$store=new AdminApprovalStore($db,$policy,$workspace,Encryption::generateKey());
$prepare=fn($op='admin-team-create-001')=>$store->prepare($actor,$op,'team.create',
    ['name'=>'Assistant','password'=>'fixture-secret-must-not-leak'],
    ['summary'=>'Create an editor account','effects'=>['New editor account'],'preserved'=>['Website files'],'secret_fields'=>['password']],
    ['team:write']);
$plan=$prepare();
adminCheck($plan['status']==='pending' && $plan['approval_required'],'Administrative review requires a fresh owner approval');
adminCheck($prepare()===$plan,'Preparing the same operation returns its immutable review');
adminCheck(!str_contains(json_encode($plan),'fixture-secret') &&
    !str_contains(json_encode($db->query('SELECT * FROM agent_admin_plans')),'fixture-secret'),'Review and SQLite rows never contain plaintext administrative secrets');
adminReject(fn()=>$store->prepare($actor,'admin-team-create-001','team.create',['name'=>'Different'],[],['team:write']),
    'idempotency_conflict','Operation ID cannot switch its administrative action');
adminReject(fn()=>$store->get($otherActor,$plan['plan_id']),'permission_denied','Other credential cannot inspect an administrative plan');
adminReject(fn()=>$store->approve($actor,$plan['plan_id'],$plan['digest']),'permission_denied','A credential cannot approve its own elevation');
$editor=new OperationActor('user',2,null,[],'studio_configured',null);
adminReject(fn()=>$store->approve($editor,$plan['plan_id'],$plan['digest']),'permission_denied','Editor session cannot issue owner receipt');
adminReject(fn()=>$store->executeDatabase($actor,$plan['plan_id'],$plan['digest'],fn()=>['changed'=>true]),
    'approval_required','Mutation without owner receipt is rejected');
$approved=$store->approve($owner,$plan['plan_id'],$plan['digest']);
adminCheck($approved['status']==='approved' && $approved['approved_by']===1,'Owner approval records a short-lived bound receipt');
$calls=0;
$result=$store->executeDatabase($actor,$plan['plan_id'],$plan['digest'],function($payload)use(&$calls):array {
    $calls++;adminCheck($payload['password']==='fixture-secret-must-not-leak','Only trusted execution decrypts write-only input');
    return ['changed'=>true,'provider_calls'=>0];
});
adminCheck($result['status']==='succeeded' && $calls===1,'Approved database mutation records its result atomically');
adminCheck($store->executeDatabase($actor,$plan['plan_id'],$plan['digest'],function()use(&$calls){$calls++;return [];})===$result && $calls===1,
    'Consumed approval retries return retained result without repeating work');
$expired=$prepare('admin-expired-001');$store->approve($owner,$expired['plan_id'],$expired['digest']);
$db->update('agent_admin_plans',['approval_expires_at'=>time()-1],'id = ?',[$expired['plan_id']]);
adminReject(fn()=>$store->executeDatabase($actor,$expired['plan_id'],$expired['digest'],fn()=>[]),
    'approval_expired','Expired receipt cannot authorize mutation');
$rollback=$prepare('admin-rollback-001');$store->approve($owner,$rollback['plan_id'],$rollback['digest']);
try{$store->executeDatabase($actor,$rollback['plan_id'],$rollback['digest'],function()use($db):array{
    $db->update('users',['name'=>'Wrong'],'id = 2');throw new RuntimeException('Fixture failure');
});}catch(RuntimeException $e){}
adminCheck($db->scalar('SELECT name FROM users WHERE id=2')==='Editor' && $store->get($actor,$rollback['plan_id'])['status']==='approved',
    'Failed database mutation rolls back domain and receipt consumption together');
$revoked=$prepare('admin-revoked-001');$store->approve($owner,$revoked['plan_id'],$revoked['digest']);
$credentials->revoke($owner,$key['id']);
adminReject(fn()=>$store->executeDatabase($actor,$revoked['plan_id'],$revoked['digest'],fn()=>[]),
    'permission_denied','Revocation after approval is rechecked before mutation');
$admin=new AdministrationService($db,$policy,$store);$actor=$otherActor;
$team=$admin->team($actor,new stdClass());
JsonSchema::validate(JsonSchema::output($team),AdministrationService::outputSchema('team'));
adminCheck(count($team['members'])===2 && !str_contains(json_encode($team),'password_hash'),'Team inventory has redacted typed members and version preconditions');
$input=(object)['operation_id'=>'admin-create-member-001','intent'=>(object)['type'=>'team.create',
    'name'=>'New member','email'=>'member@example.invalid','password'=>'another-fixture-secret','role'=>'editor']];
$plan=$admin->prepare($actor,$input);$store->approve($owner,$plan['plan_id'],$plan['digest']);
$apply=(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest']];$created=$admin->apply($actor,$apply);
JsonSchema::validate(JsonSchema::output($created),AdministrationService::outputSchema('apply'));
$memberId=$created['result']['entity_id'];
adminCheck($memberId>2 && password_verify('another-fixture-secret',$db->scalar('SELECT password_hash FROM users WHERE id=?',[$memberId])),
    'Approved team creation stores a password hash');
adminCheck($admin->apply($actor,$apply)===$created && $db->count('users')===3,'Team creation replay creates no duplicate account');
adminCheck($admin->prepare($actor,$input)===$created,'A successful create replay resolves before duplicate-email validation');
$version=$created['result']['version'];
$update=$admin->prepare($actor,(object)['operation_id'=>'admin-update-member-001','intent'=>(object)['type'=>'team.update',
    'user_id'=>$memberId,'version'=>$version,'fields'=>(object)['name'=>'Reviewed member','role'=>'viewer']]]);
$store->approve($owner,$update['plan_id'],$update['digest']);
$updated=$admin->apply($actor,(object)['plan_id'=>$update['plan_id'],'digest'=>$update['digest']]);
adminCheck($updated['status']==='succeeded' && $db->scalar('SELECT role FROM users WHERE id=?',[$memberId])==='viewer',
    'Owner-approved role changes use the expected current member version');
adminReject(fn()=>$admin->prepare($actor,(object)['operation_id'=>'admin-early-stale-member','intent'=>(object)['type'=>'team.update',
    'user_id'=>$memberId,'version'=>$version,'fields'=>(object)['name'=>'Stale change']]]),'content_conflict','A fresh stale team review is rejected before approval');
$stale=$admin->prepare($actor,(object)['operation_id'=>'admin-stale-member-001','intent'=>(object)['type'=>'team.update',
    'user_id'=>$memberId,'version'=>$updated['result']['version'],'fields'=>(object)['name'=>'Stale change']]]);
$db->update('users',['name'=>'Concurrent team edit'],'id=?',[$memberId]);
$store->approve($owner,$stale['plan_id'],$stale['digest']);
adminReject(fn()=>$admin->apply($actor,(object)['plan_id'=>$stale['plan_id'],'digest'=>$stale['digest']]),
    'content_conflict','Stale administrative review cannot overwrite a newer team edit');
$db->update('users',['name'=>'Reviewed member'],'id=?',[$memberId]);
$ownerVersion=$team['members'][0]['version'];
adminReject(fn()=>$admin->prepare($actor,(object)['operation_id'=>'admin-remove-owner-early','intent'=>(object)['type'=>'team.delete',
    'user_id'=>1,'version'=>$ownerVersion]]),'permission_denied','A fresh owner-removal review is rejected before approval');
$removeOwner=$store->prepare($actor,'admin-remove-owner-001','team.delete',['type'=>'team.delete','user_id'=>1,'version'=>$ownerVersion],
    ['summary'=>'Invalid retained owner deletion','effects'=>['Attempt owner deletion'],'preserved'=>['Website'],'secret_fields'=>[]],['team:write']);
$store->approve($owner,$removeOwner['plan_id'],$removeOwner['digest']);
adminReject(fn()=>$admin->apply($actor,(object)['plan_id'=>$removeOwner['plan_id'],'digest'=>$removeOwner['digest']]),
    'permission_denied','Even an approved request cannot remove the last owner');
$memberKey=$credentials->create($owner,$memberId,'read','Removed member connection',null);
$memberActor=$policy->fromCredential($memberKey['id']);
$db->exec('CREATE TABLE admin_fixture_audit (user_id INTEGER NOT NULL REFERENCES users(id), note TEXT)');
$db->insert('admin_fixture_audit',['user_id'=>$memberId,'note'=>'Retained business attribution']);
$removed=$admin->prepare($actor,(object)['operation_id'=>'admin-remove-member-001','intent'=>(object)['type'=>'team.delete',
    'user_id'=>$memberId,'version'=>$updated['result']['version']]]);
$store->approve($owner,$removed['plan_id'],$removed['digest']);
$result=$admin->apply($actor,(object)['plan_id'=>$removed['plan_id'],'digest'=>$removed['digest']]);
adminCheck($result['status']==='succeeded' && $db->count('admin_fixture_audit')===1
    && $db->scalar('SELECT disabled_at FROM users WHERE id=?',[$memberId])!==null,
    'Removing a team member preserves referenced business and audit records');
adminCheck((new VoxelSite\Auth($db))->getUser($memberId)===null && count((new VoxelSite\Auth($db))->listUsers())===2,
    'Removed member is absent from active Studio account lookups');
adminReject(fn()=>$policy->require($memberActor,['site:read']),'permission_denied','Removed member cannot reuse an MCP actor');
adminCheck((new VoxelSite\Auth($db))->login('member@example.invalid','another-fixture-secret','127.0.0.1','Fixture')===null,
    'Removed member cannot sign in with the prior password');
adminCheck($db->scalar('SELECT COUNT(*) FROM api_keys WHERE id=?',[$memberKey['id']])===0,
    'Account removal revokes its saved credential');
$job=$store->prepare($actor,'admin-job-authorize-001','team.fixture_job',[],
    ['summary'=>'Fixture job authorization','effects'=>['Allocate a durable fixture job'],'preserved'=>['Website'],'secret_fields'=>[]],['team:write']);
$store->approve($owner,$job['plan_id'],$job['digest']);
$operationStore=new VoxelSite\Agent\OperationStore($db,$policy,$workspace->mutationLockPath());
$allocationCalls=0;
$allocate=function()use($operationStore,$actor,&$allocationCalls):string{
    $allocationCalls++;
    $operationStore->prepare($actor,'admin-job-operation-001','fixture.job',(object)['fixture'=>true],'draft:0');
    return 'admin-job-operation-001';
};
$authorized=$store->authorizeExecution($actor,$job['plan_id'],$job['digest'],$allocate);
adminCheck($authorized['status']==='authorized' && $authorized['result']['changed']===false
    && $authorized['result']['operation_id']==='admin-job-operation-001',
    'File job authorization binds a retained operation without claiming it completed');
adminCheck($store->authorizeExecution($actor,$job['plan_id'],$job['digest'],$allocate)===$authorized && $allocationCalls===1,
    'A consumed job authorization cannot allocate another execution');
adminReject(fn()=>$store->cancel($owner,$job['plan_id'],$job['digest']),'content_conflict',
    'An authorized job must use its own operation recovery boundary');
$badJob=$store->prepare($actor,'admin-job-rollback-001','team.fixture_job',[],
    ['summary'=>'Fixture rollback','effects'=>['No committed job'],'preserved'=>['Website'],'secret_fields'=>[]],['team:write']);
$store->approve($owner,$badJob['plan_id'],$badJob['digest']);
try{$store->authorizeExecution($actor,$badJob['plan_id'],$badJob['digest'],function()use($operationStore,$actor):string{
    $operationStore->prepare($actor,'admin-job-rolled-back','fixture.job',(object)['fixture'=>true],'draft:0');
    throw new RuntimeException('Deliberate allocation failure');
});}catch(RuntimeException){}
adminCheck($db->count('agent_operations','operation_id = ?',['admin-job-rolled-back'])===0
    && $store->get($actor,$badJob['plan_id'])['status']==='approved',
    'Job allocation and owner receipt roll back together before any file effect');
echo "MCP administration: {$checks} checks passed\n";
