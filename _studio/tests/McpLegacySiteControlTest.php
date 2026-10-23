<?php
declare(strict_types=1);
require __DIR__.'/McpApplicationTest.php';
use VoxelSite\SitePlanStore;
use VoxelSite\Agent\CanonicalJson;

$native=new SitePlanStore($db,new VoxelSite\FileManager($db,$workspace));
$source=file_get_contents($root.'/draft/about.php');
$anchor='The workshop is a fictional business used only in automated qualification fixtures.';
$edit=['file'=>'about.php','anchored'=>true,'source_hash'=>hash('sha256',$source),'strategy'=>'content-edit',
    'before_snippet'=>$anchor,'after_snippet'=>'This workshop now offers a reviewed repair consultation.'];
$legacyId=$native->create(1,['applicable'=>true,'edits'=>[$edit],'summary'=>'Historical consultation copy']);
$response=$call('tools/call',['name'=>'voxelsite_site_control_plan_read','arguments'=>(object)['plan_id'=>$legacyId]],$readKey);
appCheck($response['status']===200&&!($response['body']['result']['isError']??true),'Legacy native plan identity has a typed pure MCP read');
$read=$tool('voxelsite_site_control_plan_read',['plan_id'=>$legacyId],$readKey);
appCheck($read['plan_id']===$legacyId&&$read['status']==='ready'&&$read['trust']==='untrusted_historical_source'
    &&CanonicalJson::digest(json_decode($read['content'],true)['plan']['edits'][0])===CanonicalJson::digest($edit),'Plan read preserves exact historical source and distinct identity');
$before=[$db->query('SELECT * FROM site_control_plans'),$db->query('SELECT * FROM site_control_mutations'),
    $db->count('revisions'),$db->count('agent_operations'),$workspace->status(),VoxelSite\SiteWorkspace::inventory($root.'/draft'),VoxelSite\SiteWorkspace::inventory($root.'/live')];
$tool('voxelsite_site_control_plan_read',['plan_id'=>$legacyId],$readKey);
$missing=$call('tools/call',['name'=>'voxelsite_site_control_mutation_read','arguments'=>(object)['mutation_id'=>str_repeat('a',32)]],$readKey);
appCheck($missing['body']['result']['isError']??false,'Missing mutation read refuses without creating a tombstone');
appCheck($before===[$db->query('SELECT * FROM site_control_plans'),$db->query('SELECT * FROM site_control_mutations'),
    $db->count('revisions'),$db->count('agent_operations'),$workspace->status(),VoxelSite\SiteWorkspace::inventory($root.'/draft'),VoxelSite\SiteWorkspace::inventory($root.'/live')],
    'Historical reads change no plan, mutation, operation, revision, draft version or bytes');
$version='draft:'.$workspace->status()['draft_version'];
$input=['request_id'=>'legacy-import-001','base_draft_version'=>$version,'plan_id'=>$legacyId,'record_digest'=>$read['record_digest']];
$import=$tool('voxelsite_site_control_plan_prepare',$input);
$review=$import['review'];
appCheck($import['legacy_plan_id']===$legacyId&&$import['legacy_record_digest']===$read['record_digest']
    &&str_starts_with($review['change_set_id'],'change_'),'Legacy import creates a separate ordinary sealed change review');
appCheck($tool('voxelsite_site_control_plan_prepare',$input)===$import,'Lost preparation acknowledgement replays the same sealed review');
appCheck(file_get_contents($root.'/draft/about.php')===$source&&$before[6]===VoxelSite\SiteWorkspace::inventory($root.'/live'),'Legacy preparation changes neither draft nor live files');
appCheck($tool('voxelsite_changes_get',['change_set_id'=>$review['change_set_id']])===$review,'Imported review uses the normal changes_get contract');
$diff=$tool('voxelsite_changes_diff',['change_set_id'=>$review['change_set_id'],'path'=>'about.php','side'=>'after','max_bytes'=>65536]);
appCheck(str_contains(json_encode($diff),'reviewed repair consultation'),'Imported exact source is inspectable through normal diff');
$revisions=$db->count('revisions');
$apply=['change_set_id'=>$review['change_set_id'],'digest'=>$review['digest'],'operation_id'=>'legacy-import-apply-001'];
$result=$finish($tool('voxelsite_changes_apply',$apply),$apply['operation_id']);
appCheck($result['status']==='succeeded'&&file_get_contents($root.'/draft/about.php')===str_replace($anchor,$edit['after_snippet'],$source),'Ordinary apply writes the exact anchored imported outcome');
appCheck($tool('voxelsite_changes_apply',$apply)===$result&&$db->count('revisions')===$revisions+1,'Apply replay creates exactly one revision');
appCheck($native->get($legacyId,1)['status']==='ready'&&$before[6]===VoxelSite\SiteWorkspace::inventory($root.'/live'),'Native plan status stays truthful and publication remains separate');

$fresh=function(?callable $alter=null)use($native,$db,$root,$edit):string{
    $next=$edit;$next['source_hash']=hash_file('sha256',$root.'/draft/about.php');
    $next['before_snippet']=$edit['after_snippet'];$next['after_snippet']='A second reviewed consultation change.';
    $id=$native->create(1,['applicable'=>true,'edits'=>[$next]]);
    if($alter!==null){$plan=json_decode($db->scalar('SELECT plan_json FROM site_control_plans WHERE id=?',[$id]),true);$alter($plan);
        $db->update('site_control_plans',['plan_json'=>json_encode($plan,JSON_THROW_ON_ERROR)],'id=?',[$id]);}
    return $id;
};
$digest=function(string $id)use($db):string{return CanonicalJson::digest($db->queryOne('SELECT id,status,created_at,expires_at,recovery_snapshot_id,plan_json,result_json,manifest_json FROM site_control_plans WHERE id=?',[$id]));};
$attempt=0;
$prepare=function(string $id,?string $hash=null)use($call,$workspace,$digest,&$attempt):array{
    return $call('tools/call',['name'=>'voxelsite_site_control_plan_prepare','arguments'=>(object)[
        'request_id'=>'legacy-reject-'.str_pad((string)++$attempt,3,'0',STR_PAD_LEFT),'base_draft_version'=>'draft:'.$workspace->status()['draft_version'],
        'plan_id'=>$id,'record_digest'=>$hash??$digest($id)]]);
};
$reject=function(array $response,string $code,string $label):void{
    $error=json_decode($response['body']['result']['content'][0]['text']??'{}',true);
    appCheck($code==='permission_denied'?$response['status']===403:
        (($response['body']['result']['isError']??false)&&($error['error']['code']??null)===$code),$label);
};
$id=$fresh();$oldDigest=$digest($id);$db->update('site_control_plans',['expires_at'=>time()-1],'id=?',[$id]);
$reject($prepare($id),'content_conflict','Expired native review cannot be imported');
$reject($prepare($id,$oldDigest),'content_conflict','Changed retained record digest cannot be imported');
$id=$fresh();file_put_contents($root.'/draft/new-since-review.php','<h1>New page</h1>');
$reject($prepare($id),'content_conflict','Whole-site fingerprint detects independent files without a version bump');unlink($root.'/draft/new-since-review.php');
foreach([
    'source hash'=>['content_conflict',static function(&$plan){$plan['edits'][0]['source_hash']=str_repeat('0',64);}],
    'absent anchor'=>['content_conflict',static function(&$plan){$plan['edits'][0]['before_snippet']='Absent historical anchor';}],
    'overlapping anchors'=>['content_conflict',static function(&$plan){$plan['edits'][]=$plan['edits'][0];}],
    'unsupported strategy'=>['invalid_schema',static function(&$plan){$plan['edits'][0]['strategy']='unreviewed-script';}],
    'unanchored edit'=>['invalid_schema',static function(&$plan){$plan['edits'][0]['anchored']=false;}],
    'shipped handler'=>['invalid_path',static function(&$plan){$plan['edits'][0]['file']='submit.php';}],
    'merge-only memory'=>['invalid_path',static function(&$plan){$plan['edits'][0]['file']='assets/data/memory.json';}],
    'derived CSS'=>['invalid_path',static function(&$plan){$plan['edits'][0]['file']='assets/css/tailwind.css';}],
    'more than forty edits'=>['invalid_schema',static function(&$plan){$plan['edits']=array_fill(0,41,$plan['edits'][0]);}],
] as $label=>[$code,$alter])$reject($prepare($fresh($alter)),$code,'Import refuses '.$label);
$id=$fresh();$db->insert('users',['email'=>'legacy-other@example.invalid','password_hash'=>'no-login','role'=>'owner','name'=>'Other','created_at'=>now(),'updated_at'=>now()]);
$db->update('site_control_plans',['user_id'=>2],'id=?',[$id]);
$reject($prepare($id),'not_found','An account cannot import another account’s native record');
$reject($call('tools/call',['name'=>'voxelsite_site_control_plan_read','arguments'=>(object)['plan_id'=>$id]],$readKey),'not_found','An account cannot read another account’s native record');
foreach(['malformed'=>'{broken','oversized'=>str_repeat('x',2097153),'deep'=>str_repeat('[',65).'0'.str_repeat(']',65)] as $label=>$json){
    $id=$fresh();$db->update('site_control_plans',['plan_json'=>$json],'id=?',[$id]);
    $reject($call('tools/call',['name'=>'voxelsite_site_control_plan_read','arguments'=>(object)['plan_id'=>$id]],$readKey),$label==='oversized'?'size_limit':'invalid_schema','Read refuses '.$label.' historical JSON');
}
$id=$fresh(static function(&$plan){$plan['summary']=str_repeat('Text "🧰" ',5000);});
$offset=0;$joined='';$recordDigest=null;$chunks=0;
do{
    $args=['plan_id'=>$id,'max_bytes'=>2048,'offset'=>$offset];if($recordDigest!==null)$args['record_digest']=$recordDigest;
    $chunk=$tool('voxelsite_site_control_plan_read',$args,$readKey);$recordDigest=$chunk['record_digest'];$joined.=$chunk['content'];$offset=$chunk['next_offset'];$chunks++;
    appCheck(strlen(CanonicalJson::encode($chunk))<=2048&&mb_check_encoding($chunk['content'],'UTF-8'),'Whole-response historical chunk stays bounded and UTF-8 complete');
}while($offset!==null);
appCheck($chunks>1&&json_decode($joined,true)['plan']['summary']===str_repeat('Text "🧰" ',5000),'Digest-pinned chunks reconstruct exact escaped historical Unicode');
$reject($call('tools/call',['name'=>'voxelsite_site_control_plan_read','arguments'=>(object)['plan_id'=>$id,'offset'=>1]],$readKey),'content_conflict','Historical continuation requires the original record digest');
$id=$fresh(static function(&$plan){$plan['edits'][0]['file']='assets/forms/contact.json';});
$scopes=$db->scalar('SELECT scopes FROM api_keys WHERE id=?',[$readKey['id']]);
$db->update('api_keys',['scopes'=>json_encode(['site:read','files:read','operations:read'])],'id=?',[$readKey['id']]);
$reject($call('tools/call',['name'=>'voxelsite_site_control_plan_read','arguments'=>(object)['plan_id'=>$id]],$readKey),'permission_denied','Historical form source checks current path-specific scope');
$db->update('api_keys',['scopes'=>$scopes],'id=?',[$readKey['id']]);
$id=$fresh();$recoveryRead=$tool('voxelsite_site_control_plan_read',['plan_id'=>$id]);
$recoveryReview=$tool('voxelsite_site_control_plan_prepare',['request_id'=>'legacy-recovery-review',
    'base_draft_version'=>'draft:'.$workspace->status()['draft_version'],'plan_id'=>$id,'record_digest'=>$recoveryRead['record_digest']])['review'];
$recoveryBefore=[VoxelSite\Agent\WorkspaceFiles::hashes(VoxelSite\Agent\WorkspaceFiles::read($workspace)),$workspace->status()['draft_version'],$db->count('revisions')];
$changeStore=new VoxelSite\Agent\ChangeSetStore($db,$policy,$root.'/private/agent/changes');
$operationStore=new VoxelSite\Agent\OperationStore($db,$policy,$workspace->mutationLockPath());
$damagedPath=null;$savedOriginal=null;
$faulty=new VoxelSite\Agent\ChangeSetExecutor($db,$policy,$workspace,$changeStore,$operationStore,20,
    static function(string $phase,array $event)use($changeStore,$recoveryReview,&$damagedPath,&$savedOriginal):void{
        if($phase==='after_file'){
            $damagedPath=$changeStore->stagingRoot($recoveryReview['change_set_id']).'/before/'.$event['path'];
            $savedOriginal=file_get_contents($damagedPath);file_put_contents($damagedPath,'Injected lost recovery bytes');
            throw new RuntimeException('Injected imported apply interruption.');
        }
    });
$failed=$faulty->apply($policy->fromCredential($key['id']),(object)['change_set_id'=>$recoveryReview['change_set_id'],
    'digest'=>$recoveryReview['digest'],'operation_id'=>'legacy-recovery-apply']);
appCheck($failed['status']==='recovery_required'&&$tool('voxelsite_operations_get',['operation_id'=>'legacy-recovery-apply'])===$failed,
    'Imported apply interruption retains failed recovery truth without recovery on read');
file_put_contents($damagedPath,$savedOriginal);
$recovered=$tool('voxelsite_operations_recover',['operation_id'=>'legacy-recovery-apply']);
appCheck($recovered['status']==='failed_restored'&&$recoveryBefore===[VoxelSite\Agent\WorkspaceFiles::hashes(VoxelSite\Agent\WorkspaceFiles::read($workspace)),$workspace->status()['draft_version'],$db->count('revisions')],
    'Explicit shared recovery restores imported originals without a revision or version change');
appCheck($recovered['result']['original_outcome']===['error'=>$failed['result']['error'],'restoration'=>$failed['result']['restoration']]
    &&$native->get($id,1)['status']==='ready','Recovery preserves earliest failure truth and the untouched native record');
$id=$fresh();$db->update('site_control_plans',['status'=>'applying'],'id=?',[$id]);
$mutation=str_repeat('b',32);$db->insert('site_control_mutations',['id'=>$mutation,'user_id'=>1,'request_hash'=>str_repeat('c',64),
    'route_path'=>'/site/page/rename','status'=>'applying','created_at'=>time()]);
$rawBefore=[$db->query('SELECT * FROM site_control_plans'),$db->query('SELECT * FROM site_control_mutations')];
appCheck($tool('voxelsite_site_control_plan_read',['plan_id'=>$id],$readKey)['status']==='applying'
    &&$tool('voxelsite_site_control_mutation_read',['mutation_id'=>$mutation],$readKey)['status']==='applying','Reads report applying native records without initiating recovery');
appCheck($rawBefore===[$db->query('SELECT * FROM site_control_plans'),$db->query('SELECT * FROM site_control_mutations')],'Applying record reads retain every original outcome and recovery field');
appCheck($GLOBALS['lifecycle_provider_attempts']===0,'Historical reading and import never dispatch providers');

echo "MCP legacy Site control: $checks combined checks passed\n";
