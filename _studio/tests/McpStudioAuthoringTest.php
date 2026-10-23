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
$root=sys_get_temp_dir() . '/vs-studio-authoring-' . bin2hex(random_bytes(6));
foreach (['draft/assets/images','live/assets/data','private'] as $dir) mkdir($root.'/'.$dir,0700,true);
$root=realpath($root);
if(!$root||!str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-studio-authoring-'))throw new RuntimeException('Fixture root must be canonical and temporary.');
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

$workspace=new SiteWorkspace($db,$root.'/draft',$root.'/live',$root.'/private/workspace',$root.'/live/assets');
foreach (SiteWorkspace::inventory(__DIR__.'/fixtures/mcp/site-lifecycle/site')['files'] as $path=>$meta) WorkspaceFiles::write($root.'/draft',$path,file_get_contents(__DIR__.'/fixtures/mcp/site-lifecycle/site/'.$path));
WorkspaceFiles::write($root.'/draft','assets/js/form-handler.js',file_get_contents(dirname(__DIR__).'/static/form-handler.js'));
$owner=new OperationActor('user',1,null,[],'studio_configured',null);
$files=new FileManager($db,$workspace);$files->syncPageRegistry(true);
$service=new \VoxelSite\Agent\StudioAuthoringService($db,$workspace);
function inputFor(string $action,string $path='',?string $content=null):array {global $workspace;$abs=$path!==''?$workspace->resolveDraft($path):null;$input=['operation_id'=>'studio_'.bin2hex(random_bytes(16)),'base_draft_version'=>'draft:'.$workspace->status()['draft_version']];if($path!=='')$input+=['path'=>$path,'expected_content_sha256'=>is_file($abs)?hash_file('sha256',$abs):null];if($content!==null)$input['content']=$content;return $input;}
function finishFile(string $action,array $input):array {global $service,$owner;$out=$service->fileChange($owner,$action,$input);for($i=0;($out['operation']['status']??'')==='applying'&&$i<30;$i++)$out=$service->fileChange($owner,$action,$input+['checkpoint'=>$out['operation']['checkpoint']]);return $out;}
$live=SiteWorkspace::inventory($root.'/live');$read=$service->read($owner,'index.php');
stageCheck($read['content_sha256']===hash('sha256',$read['content'])&&preg_match('/^draft:[0-9]+$/',$read['draft_version'])===1,'Read returns exact hash and captured draft version');
$input=inputFor('save','index.php',$read['content'].'<!-- edited -->');
$out=finishFile('save',$input);stageCheck($out['operation']['status']==='succeeded','Studio save applies sealed normalized bytes');
$count=$db->scalar('SELECT COUNT(*) FROM revisions');$version=$workspace->status()['draft_version'];
stageCheck(finishFile('save',$input)===$out&&$db->scalar('SELECT COUNT(*) FROM revisions')===$count,'Lost save response replays exact result without another revision');
$altered=$input;$altered['content'].='changed';stageReject(fn()=>finishFile('save',$altered),'idempotency_conflict','Same operation identity rejects changed source intent');
stageReject(fn()=>finishFile('save',array_replace(inputFor('save','index.php','other'),['expected_content_sha256'=>str_repeat('0',64)])),'content_conflict','Wrong source hash refuses a fresh operation');
$stale=inputFor('save','index.php','stale');$stale['base_draft_version']='draft:0';stageReject(fn()=>finishFile('save',$stale),'content_conflict','Stale displayed draft version refuses write');
$empty=finishFile('save',inputFor('save','index.php',file_get_contents($root.'/draft/index.php')));stageCheck($empty['changed']===false&&$workspace->status()['draft_version']===$version&&$db->scalar('SELECT COUNT(*) FROM revisions')===$count,'Unchanged save retains success without artificial revision/version');
$compiled=finishFile('compile',inputFor('compile'));stageCheck($compiled['operation']['status']==='succeeded'&&$workspace->status()['draft_version']===$version,'Unchanged compile is a retained no-effect operation');
$create=inputFor('create','assets/js/custom.js');$created=finishFile('create',$create);stageCheck(is_file($root.'/draft/assets/js/custom.js')&&$created['operation']['status']==='succeeded','Create uses a sealed absence precondition');
$delete=inputFor('delete','assets/js/custom.js');stageCheck(finishFile('delete',$delete)['operation']['status']==='succeeded'&&!is_file($root.'/draft/assets/js/custom.js'),'Delete applies retained source hash');
stageReject(fn()=>finishFile('delete',inputFor('delete','index.php')),'permission_denied','Protected homepage deletion refuses editor bypass');
$memory=inputFor('save','assets/data/memory.json','{"business":{"value":"Workshop","confidence":"stated"}}');stageCheck(finishFile('save',$memory)['operation']['status']==='succeeded','Memory full editor input becomes an exact-hash validated merge');
stageCheck(SiteWorkspace::inventory($root.'/live')===$live,'Every Studio authoring path leaves published bytes unchanged');
// Completed receipts must derive editor hashes only from the original sealed manifest.
$changeId=$out['operation']['result']['change_set_id'];
$retained=$db->queryOne('SELECT manifest_json,expires_at FROM agent_change_sets WHERE id=?',[$changeId]);
$db->update('agent_change_sets',['expires_at'=>time()-1],'id=?',[$changeId]);
stageCheck(finishFile('save',$input)===$out,'Intact completed save replays after review expiry');
$manifest=json_decode($retained['manifest_json'],true,64,JSON_THROW_ON_ERROR);
$manifest['after']['index.php']=str_repeat('f',64);
$db->update('agent_change_sets',['manifest_json'=>\VoxelSite\Agent\CanonicalJson::encode($manifest)],'id=?',[$changeId]);
$beforeTamperRetry=[$workspace->status(),$db->scalar('SELECT COUNT(*) FROM revisions'),hash_file('sha256',$root.'/draft/index.php')];
stageReject(fn()=>finishFile('save',$input),'content_conflict','Completed save rejects altered retained hash on identical retry');
foreach(['null',null,'false','[]','{'] as $missingManifest) {
    $db->update('agent_change_sets',['manifest_json'=>$missingManifest],'id=?',[$changeId]);
    stageReject(fn()=>finishFile('save',$input),'content_conflict','Completed save refuses a missing or invalid retained manifest ('.var_export($missingManifest,true).')');
}
stageCheck([$workspace->status(),$db->scalar('SELECT COUNT(*) FROM revisions'),hash_file('sha256',$root.'/draft/index.php')]===$beforeTamperRetry,'Refused receipt replay changes no files, revision or draft version');
$db->update('agent_change_sets',['manifest_json'=>$retained['manifest_json']],'id=?',[$changeId]);
stageCheck(finishFile('save',$input)===$out,'Restored intact receipt retains exact original response');
echo "Studio authoring: {$checks} checks passed.\n";
