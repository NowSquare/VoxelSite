<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
use VoxelSite\{Database,FileManager,Logger,Migrator,Settings,SiteMutationLock,SiteWorkspace};

$checks=0;
function versionCheck(bool $ok,string $message):void {
    global $checks;if (!$ok) throw new RuntimeException($message);
    $checks++;echo "PASS $message\n";
}
versionCheck((new ReflectionMethod(FileManager::class,'__construct'))->getNumberOfParameters()>=2,
    'FileManager accepts a disposable workspace');
$root=realpath(sys_get_temp_dir()).'/vs-legacy-version-'.bin2hex(random_bytes(6));
foreach (['draft/assets/data','staged/assets/data','live/assets','private'] as $dir) mkdir($root.'/'.$dir,0700,true);
$root=realpath($root);
putenv('VS_TEST_MUTATION_LOCK='.$root.'/private/site.lock');
foreach (['logDir'=>$root.'/private','initialized'=>true] as $property=>$value)
    (new ReflectionProperty(Logger::class,$property))->setValue(null,$value);
$db=Database::getInstance($root.'/private/studio.db');
(new Migrator($db,new Settings($db)))->run();
$db->update('site_workspace_state',['format'=>2],'id = 1');
foreach (['draft','staged'] as $dir) file_put_contents($root.'/'.$dir.'/.htaccess',
    SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
$workspace=new SiteWorkspace($db,$root.'/draft',$root.'/live',$root.'/private/state');
$files=new FileManager($db,$workspace);
$version=static fn()=>(int)$db->scalar('SELECT draft_version FROM site_workspace_state WHERE id = 1');
versionCheck($files->readFile('assets/data/example.json')===null && $version()===0,'Read does not advance a draft version');
$lock=SiteMutationLock::acquire($workspace->mutationLockPath(),$db);
$files->writeExactFile('assets/data/example.json','{"value":1}');
$files->writeExactFile('assets/data/another.json','{"value":2}');
versionCheck($version()===1,'Several legacy file writes under one common lock invalidate once');
unset($lock);
$files->deleteFile('assets/data/missing.json');
versionCheck($version()===1,'Deleting an absent file does not invalidate the draft');
$files->deleteFile('assets/data/another.json');
versionCheck($version()===2,'A later legacy deletion advances the draft version');
$staged=new FileManager($db,new SiteWorkspace($db,$root.'/staged',$root.'/live',$root.'/private/staged',
    tracksDraftVersion:false));
$staged->writeExactFile('assets/data/example.json','{"candidate":true}');
versionCheck($version()===2 && file_get_contents($root.'/draft/assets/data/example.json')==='{"value":1}',
    'Candidate normalization changes neither canonical bytes nor draft version');
$lock=SiteMutationLock::acquire($workspace->mutationLockPath(),$db,'retained-fixture-operation');
$files->writeExactFile('assets/data/example.json','{"value":3}');
versionCheck($version()===2,'A retained operation owns its atomic final version transition');
unset($lock);
$lock=SiteMutationLock::acquire($workspace->mutationLockPath(),$db);
$db->beginTransaction();
$workspace->invalidateDraft();
versionCheck($version()===3,'Legacy invalidation participates in the current transaction');
$db->rollBack();
$workspace->invalidateDraft();
versionCheck($version()===3,'A rolled-back invalidation cannot suppress a later write under the same lock');
unset($lock);
versionCheck(!file_exists($root.'/live/assets/data/example.json'),'Legacy version tracking leaves published bytes untouched');
$db->insert('agent_business_changes',['id'=>'business-fixture-001','actor_key'=>'user:1','user_id'=>1,'request_id'=>'business-fixture-request',
    'request_digest'=>str_repeat('a',64),'site_key'=>'fixture','status'=>'prepared','payload_json'=>'{}','result_json'=>'{}','created_at'=>time()]);
try {
    SiteMutationLock::acquire($workspace->mutationLockPath(),$db);
    versionCheck(false,'Unresolved live Action change blocks website writers');
} catch(VoxelSite\Agent\OperationException $error) {
    versionCheck($error->errorCode==='recovery_required','Unresolved live Action change blocks website writers');
}
$businessLock=SiteMutationLock::acquire($workspace->mutationLockPath(),$db,businessOperationId:'business-fixture-001');
$nested=SiteMutationLock::acquire($workspace->mutationLockPath(),$db);
versionCheck(SiteMutationLock::held($workspace->mutationLockPath()),'The trusted owning Action continuation can acquire nested common locks');
unset($nested,$businessLock);
$db->update('agent_business_changes',['status'=>'succeeded'],'id = ?',['business-fixture-001']);
$settled=SiteMutationLock::acquire($workspace->mutationLockPath(),$db);
versionCheck(SiteMutationLock::held($workspace->mutationLockPath()),'Completed Action journal releases ordinary website writers');
unset($settled);
echo "Legacy draft versions: $checks checks passed.\n";
