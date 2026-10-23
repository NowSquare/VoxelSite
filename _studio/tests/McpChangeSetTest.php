<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/engine/bootstrap.php';
use VoxelSite\Agent\{ActorPolicy, AuthoringBriefService, BriefStore, ChangeSetService, ChangeSetStore, ChangeSetExecutor, ContextService,
    CredentialService, OperationActor, OperationException, OperationStore, WorkspaceFiles};
use VoxelSite\{Database, FileManager, Migrator, Settings, SiteWorkspace};
$checks=0;
function stageCheck(bool $ok,string $label):void {
    global $checks;$checks++;
    if (!$ok) { fwrite(STDERR,"FAIL {$label}\n");exit(1); } echo "PASS {$label}\n";
}
function stageReject(callable $fn,string $code,string $label):void {
    try {$fn();}catch(OperationException $e){stageCheck($e->errorCode===$code,$label . ' (' . $e->errorCode . ')');return;}
    stageCheck(false,$label);
}
stageCheck((new ReflectionMethod(FileManager::class,'__construct'))->getNumberOfParameters()>=2,'Workspace constructor injection exists before touching any fixture');
$root=sys_get_temp_dir() . '/vs-mcp-changes-' . bin2hex(random_bytes(6));
foreach (['draft/assets/images','live/assets/data','private'] as $dir) mkdir($root.'/'.$dir,0700,true);
$root=realpath($root);
foreach (['logDir'=>$root.'/private','initialized'=>true] as $property=>$value) {
    (new ReflectionProperty(\VoxelSite\Logger::class,$property))->setValue(null,$value);
}
foreach (['VS_TEST_PREVIEW_DIR'=>$root.'/draft','VS_TEST_DOC_ROOT'=>$root.'/live','VS_TEST_ASSETS_DIR'=>$root.'/live/assets',
    'VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/private/workspace','VS_TEST_MUTATION_LOCK'=>$root.'/private/site.lock',
    'VS_TEST_REVISIONS_DIR'=>$root.'/private/revisions'] as $key=>$value) putenv($key.'='.$value);
$db=Database::getInstance($root.'/private/studio.db');
(new Migrator($db,new Settings($db)))->run();
$db->insert('users',['email'=>'fixture@example.invalid','password_hash'=>'not-a-login','name'=>'Fixture','role'=>'owner','created_at'=>now(),'updated_at'=>now()]);
$db->update('site_workspace_state',['format'=>2],'id = 1');
file_put_contents($root.'/draft/.htaccess',SiteWorkspace::ACCESS_MARKER . "\nRequire all denied\nDeny from all\n");
file_put_contents($root.'/live/assets/data/site.json','{"name":"Published fixture"}');
$fixture=__DIR__.'/fixtures/mcp/site-lifecycle/site';
copy($fixture.'/assets/images/workshop.png',$root.'/draft/assets/images/workshop.png');
$workspace=new SiteWorkspace($db,$root.'/draft',$root.'/live',$root.'/private/workspace',$root.'/live/assets');
$policy=new ActorPolicy($db);
$credentials=new CredentialService($db);
$owner=new OperationActor('user',1,null,[],'studio_configured',null);
$key=$credentials->create($owner,1,'edit','Fixture author',null);
$actor=$policy->fromCredential($key['id']);
$briefStore=new BriefStore($db,$policy);
$briefs=new AuthoringBriefService(new ContextService($db,$policy,$workspace),$briefStore);
$brief=$briefs->create($actor,['request_id'=>'brief-fixture-001','action'=>'create_site']);
$store=new ChangeSetStore($db,$policy,$root.'/private/changes');
$service=new ChangeSetService($db,$policy,$workspace,$briefStore,$store);
$ops=[];
foreach (SiteWorkspace::inventory($fixture)['files'] as $path=>$metadata) {
    if ($path==='assets/images/workshop.png') continue;
    $content=file_get_contents($fixture.'/'.$path);
    if (in_array($path,['assets/data/memory.json','assets/data/design-intelligence.json'],true)) {
        $ops[]=(object)['type'=>'merge','path'=>$path,'expected_hash'=>null,'delta'=>(object)['set'=>json_decode($content),'remove'=>[]]];
    } else $ops[]=(object)['type'=>'create','path'=>$path,'expected_hash'=>null,'content'=>$content];
}
$request=(object)['request_id'=>'prepare-fixture-001','base_draft_version'=>'draft:0','brief_id'=>$brief['brief_id'],
    'summary'=>'Create the synthetic repair website','operations'=>$ops];
$beforeDraft=WorkspaceFiles::hashes(WorkspaceFiles::read($workspace));
$beforeLive=SiteWorkspace::inventory($root.'/live');
$review=$service->prepare($actor,$request);
stageCheck($review['status']==='ready' && count($review['files'])>10,'Complete three-page creation produces a sealed review');
stageCheck(in_array('assets/css/tailwind.css',$review['derived_files'],true),'Compilation is disclosed in the prepared manifest');
stageCheck(WorkspaceFiles::hashes(WorkspaceFiles::read($workspace))===$beforeDraft,'Preparation leaves all draft bytes unchanged');
stageCheck(SiteWorkspace::inventory($root.'/live')===$beforeLive,'Preparation leaves every published byte unchanged');
$retry=$service->prepare($actor,$request);
stageCheck($retry===$review,'Retry returns the same sealed review and digest');
$diff=$service->readDiff($actor,$review['change_set_id'],'assets/css/tailwind.css',0,2048);
stageCheck($diff['sides']['before']===null && $diff['sides']['after']['truncated']===true && $diff['sides']['after']['next_offset']!==null,'Exact review exposes explicit source continuation');
$row=$store->get($actor,$review['change_set_id']);
foreach ($row['manifest']['files'] as $file) {
    if ($file['after_hash']!==null) stageCheck(hash_file('sha256',$store->stagingRoot($row['id']).'/draft/'.$file['path'])===$file['after_hash'],'Sealed bytes match '.$file['path']);
}
$operationStore=new OperationStore($db,$policy,$workspace->mutationLockPath());
$executor=new ChangeSetExecutor($db,$policy,$workspace,$store,$operationStore,3);
$applyInput=(object)['change_set_id'=>$row['id'],'digest'=>$review['digest'],'operation_id'=>'apply-fixture-001'];
$result=$executor->apply($actor,$applyInput);
stageCheck($result['status']==='applying' && $result['checkpoint']===1,'Bounded apply retains a checkpoint between requests');
stageCheck(SiteWorkspace::inventory($root.'/live')===$beforeLive,'Partial draft application leaves all published bytes unchanged');
for ($iteration=0;$result['status']==='applying' && $iteration<20;$iteration++) {
    $result=$executor->continue($actor,'apply-fixture-001',$result['checkpoint']);
}
stageCheck($result['status']==='succeeded','Explicit continuations finish the reviewed change set');
stageCheck($workspace->status()['draft_version']===1 && $db->scalar('SELECT COUNT(*) FROM pages')===3,'Successful commit advances one draft version and its page projection');
stageCheck($db->scalar('SELECT COUNT(*) FROM revisions')===1
    && $db->scalar('SELECT COUNT(*) FROM agent_revision_attribution')===1,'One shared revision retains external credential attribution');
stageCheck(WorkspaceFiles::hashes(WorkspaceFiles::read($workspace))===$row['manifest']['after'],'Applied draft hashes exactly match the sealed manifest');
$replay=$executor->apply($actor,$applyInput);
stageCheck($replay===$result && $db->scalar('SELECT COUNT(*) FROM revisions')===1,'Lost response replay returns the result without another revision');
stageCheck($service->prepare($actor,$request)===$review,'Prepare replay after apply preserves retained review bytes');
$changed=clone $request;$changed->summary='Different request';
stageReject(fn()=>$service->prepare($actor,$changed),'idempotency_conflict','Same request ID cannot replace a reviewed request');
$other=$credentials->create($owner,1,'edit','Other fixture author',null);
stageReject(fn()=>$service->get($policy->fromCredential($other['id']),$review['change_set_id']),'permission_denied','Another credential cannot retrieve review');
file_put_contents($store->stagingRoot($row['id']).'/draft/index.php','tampered');
stageReject(fn()=>$service->readDiff($actor,$row['id'],'index.php'),'content_conflict','Retained source corruption fails closed');
$db->update('agent_change_sets',['expires_at'=>time()-1],'id = ?',[$row['id']]);
stageReject(fn()=>$service->get($actor,$row['id']),'review_expired','Expired review cannot be reused');
stageCheck(SiteWorkspace::inventory($root.'/live')===$beforeLive,'Rejected operations preserve published bytes');

// Imported sites may retain broken dependencies and omit the generated partial
// layout. A narrow edit must disclose those problems without requiring a rebuild.
file_put_contents($root.'/draft/index.php', '<!doctype html><h1>Imported site</h1><img src="/assets/images/already-missing.png"><img src="https://cdn.example.com/assets/images/hero.png">');
foreach (['_partials/header.php','_partials/nav.php','_partials/footer.php'] as $path) unlink($root.'/draft/'.$path);
$importedBefore = WorkspaceFiles::hashes(WorkspaceFiles::read($workspace));
$css = file_get_contents($root.'/draft/assets/css/style.css');
$importedBrief = $briefs->create($actor,['request_id'=>'brief-imported-css','action'=>'change_design']);
$importedRequest = (object)['request_id'=>'prepare-imported-css','base_draft_version'=>'draft:'.$workspace->status()['draft_version'],
    'brief_id'=>$importedBrief['brief_id'],'summary'=>'Change the imported site color','operations'=>[(object)[
        'type'=>'replace','path'=>'assets/css/style.css','expected_hash'=>hash('sha256',$css),'content'=>$css."\n/* Reviewed color change */\n"]]];
$importedReview = $service->prepare($actor,$importedRequest);
stageCheck($importedReview['status']==='ready' && count(array_filter($importedReview['validation']['warnings'],fn($warning)=>$warning['code']==='pre_existing_dependency'))>=4,
    'Real CSS preparation permits an imported site and discloses its retained missing dependencies');
\VoxelSite\Agent\JsonSchema::validate(\VoxelSite\Agent\JsonSchema::output($importedReview),\VoxelSite\Agent\ToolContracts::changeReview());
stageCheck(WorkspaceFiles::hashes(WorkspaceFiles::read($workspace))===$importedBefore && SiteWorkspace::inventory($root.'/live')===$beforeLive,
    'Imported-site review preparation preserves exact draft and published bytes');
echo "Change preparation: {$checks} checks passed; fixture {$root}\n";
