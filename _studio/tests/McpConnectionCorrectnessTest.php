<?php
declare(strict_types=1);
namespace VoxelSite\Agent {
    function time():int {return $GLOBALS['connection_test_now']??\time();}
}
namespace {
require __DIR__.'/McpCredentialAdministrationTest.php';
use VoxelSite\Agent\{ConnectionService,CredentialAdministrationService,JsonSchema,OperationException,PreviewService};

$connectionChecks=0;$connectionFailures=0;
function connectionCheck(bool $ok,string $label):void {
    global $connectionChecks,$connectionFailures;$connectionChecks++;if(!$ok)$connectionFailures++;
    echo ($ok?'PASS ':'FAIL ').$label."\n";
}
function connectionReject(callable $call,string $code,string $label):void {
    try{$call();}catch(OperationException $error){connectionCheck($error->errorCode===$code,$label.' ['.$error->errorCode.']');return;}
    connectionCheck(false,$label);
}
connectionCheck(str_contains(implode(' ',$rest['review']['effects']),'REST role: viewer.'),
    'Owner REST credential review includes the role controlling privileged routes');
connectionCheck(PreviewService::canonicalOrigin('https://SITE.example:443/customer')==='https://site.example',
    'Saved HTTPS default port matches a browser Origin');
connectionCheck(PreviewService::canonicalOrigin('http://SITE.example:80/customer')==='http://site.example',
    'Saved HTTP default port matches a browser Origin');
connectionCheck(PreviewService::canonicalOrigin('https://site.example:8443/customer')==='https://site.example:8443',
    'Non-default installation ports remain part of Origin authority');

$duration=(object)['operation_id'=>'duration-review-001','intent'=>(object)[
    'type'=>'credential.create','audience'=>'studio_mcp','user_id'=>2,'label'=>'Server-timed credential',
    'preset'=>'edit','extra_scopes'=>[],'expiry_days'=>30,
]];
try {
    $reviewedAt=time();$durationPlan=$service->prepare($credentialActor,$duration);
    connectionCheck(str_contains(implode(' ',$durationPlan['review']['effects']),'30 days after creation'),
        'Owner reviews the retained duration without trusting a browser timestamp');
    sleep(2);
    $store->approve($owner,$durationPlan['plan_id'],$durationPlan['digest']);
    $started=time();$durationResult=$service->apply($credentialActor,(object)['plan_id'=>$durationPlan['plan_id'],'digest'=>$durationPlan['digest']]);
    $expiry=(int)$db->scalar('SELECT expires_at FROM studio_mcp_credentials WHERE key_id=?',[$durationResult['result']['entity_id']]);
    connectionCheck($expiry>=$started+30*86400 && $expiry<=time()+30*86400 && $expiry>$reviewedAt+30*86400,
        'Expiry starts at server execution after delayed approval');
    $GLOBALS['connection_test_now']=$durationPlan['expires_at']+1;
    connectionCheck($service->apply($credentialActor,(object)['plan_id'=>$durationPlan['plan_id'],'digest'=>$durationPlan['digest']])===$durationResult
        && (int)$db->scalar('SELECT expires_at FROM studio_mcp_credentials WHERE key_id=?',[$durationResult['result']['entity_id']])===$expiry,
        'Completed duration request replays after review expiry without extending credential life');
    unset($GLOBALS['connection_test_now']);
    $changed=clone $duration;$changed->intent=clone $duration->intent;$changed->intent->expiry_days=7;
    connectionReject(fn()=>$service->prepare($credentialActor,$changed),'idempotency_conflict','A retained identity cannot change credential duration');
    $pending=clone $duration;$pending->operation_id='duration-expired-pending';
    $expiredDuration=$service->prepare($credentialActor,$pending);
    $GLOBALS['connection_test_now']=$expiredDuration['expires_at']+1;
    connectionReject(fn()=>$store->approve($owner,$expiredDuration['plan_id'],$expiredDuration['digest']),'review_expired',
        'An unexecuted expired duration review cannot be approved');
}catch(Throwable $error){connectionCheck(false,'Duration workflow: '.$error->getMessage());}
finally {unset($GLOBALS['connection_test_now']);}
foreach(['both','neither','zero','too_long','fraction'] as $case) {
    $invalid=clone $duration;$invalid->operation_id='duration-invalid-'.$case;$invalid->intent=clone $duration->intent;
    if($case==='both')$invalid->intent->expires_at=time()+86400;
    elseif($case==='neither')unset($invalid->intent->expiry_days);
    else $invalid->intent->expiry_days=match($case){'zero'=>0,'too_long'=>367,default=>1.5};
    connectionReject(fn()=>$service->prepare($credentialActor,$invalid),'invalid_schema','Closed expiry schema rejects '.$case);
}
$connectionService=new ConnectionService($db,$workspace,['app_key'=>\VoxelSite\Encryption::generateKey()]);
$connectionInput=(object)['operation_id'=>'studio-duration-001','user_id'=>1,'preset'=>'read','label'=>'Server duration','expiry_days'=>7];
try {
    $beforeCreate=time();$createdDuration=$connectionService->create($owner,$connectionInput);
    $createdExpiry=(int)$db->scalar('SELECT expires_at FROM studio_mcp_credentials WHERE key_id=?',[$createdDuration['credential_id']]);
    connectionCheck($createdExpiry>=$beforeCreate+7*86400 && $createdExpiry<=time()+7*86400,
        'Studio connection form accepts a server-resolved duration');
    connectionCheck($connectionService->create($owner,$connectionInput)===$createdDuration,
        'Studio duration retry returns the retained credential receipt');
}catch(Throwable $error){connectionCheck(false,'Studio duration workflow: '.$error->getMessage());}
$legacyInput=(object)['operation_id'=>'studio-legacy-expiry-001','user_id'=>1,'preset'=>'read','label'=>'Legacy pending input','expires_at'=>time()+86400];
try {
    $legacyCreated=$connectionService->create($owner,$legacyInput);
    connectionCheck((int)$db->scalar('SELECT expires_at FROM studio_mcp_credentials WHERE key_id=?',[$legacyCreated['credential_id']])===$legacyInput->expires_at
        && $connectionService->create($owner,$legacyInput)===$legacyCreated,
        'Pre-update pending absolute-expiry input retains exact identity and expiry');
}catch(Throwable $error){connectionCheck(false,'Legacy timestamp workflow: '.$error->getMessage());}
$db->update('site_workspace_state',['format'=>1],'id=1');
try{$workspace->assertReady();connectionCheck(false,'Workspace setup failure has its own exception type');}
catch(\VoxelSite\WorkspaceNotReadyException){connectionCheck(true,'Workspace setup failure has its own exception type');}
catch(Throwable){connectionCheck(false,'Workspace setup failure has its own exception type');}
$db->update('site_workspace_state',['format'=>2],'id=1');
$db->exec('ALTER TABLE site_workspace_state RENAME TO fixture_workspace_state');
try {
    connectionCheck($workspace->status()['format']===1,'A genuinely absent workspace schema retains the legacy setup state');
} finally {$db->exec('ALTER TABLE fixture_workspace_state RENAME TO site_workspace_state');}
$unreadableDatabase=new class extends \VoxelSite\Database {
    public function __construct() {}
    public function queryOne(string $sql,array $params=[]):?array {throw new PDOException('disk I/O error');}
};
$unreadableWorkspace=new \VoxelSite\SiteWorkspace($unreadableDatabase,$workspace->draftRoot(),$workspace->publishedRoot());
try {$unreadableWorkspace->assertReady();connectionCheck(false,'Workspace storage read failures retain their operational exception');}
catch(PDOException $error){connectionCheck($error->getMessage()==='disk I/O error','Workspace storage read failures retain their operational exception');}
catch(Throwable){connectionCheck(false,'Workspace storage read failures retain their operational exception');}
echo "MCP connection correctness: {$connectionChecks} checks, {$connectionFailures} failures\n";
exit($connectionFailures?1:0);
}
