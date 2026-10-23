<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
use VoxelSite\{Database,Encryption,Logger,Migrator,Settings,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,AdminApprovalStore,CanonicalJson,CredentialService,JsonSchema,OperationActor,OperationException,OperationStore,PublishPlanService,ReleaseStore,ResetInventory,ResetService,WorkspaceFiles};
$checks=0;
function resetCheck(bool $ok,string $label):void {global $checks;$checks++;if(!$ok)throw new RuntimeException('FAIL '.$label);echo "PASS $label\n";}
function resetReject(callable $fn,string $code,string $label):void {
    try{$fn();}catch(OperationException $error){resetCheck($error->errorCode===$code,$label.' ('.$error->errorCode.')');return;}resetCheck(false,$label);
}
$root=realpath(sys_get_temp_dir()).'/vs-mcp-reset-'.bin2hex(random_bytes(6));
foreach(['studio/preview/assets','live/assets','studio/data','studio/revisions'] as $path)mkdir($root.'/'.$path,0700,true);
$root=realpath($root);
if(!str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-mcp-reset-'))throw new RuntimeException('Disposable reset fixture required.');
foreach(['logDir'=>$root.'/studio/data','initialized'=>true] as $property=>$value)(new ReflectionProperty(Logger::class,$property))->setValue(null,$value);
$db=Database::getInstance($root.'/studio/data/test.db');(new Migrator($db,new Settings($db)))->run();
$db->insert('users',['name'=>'Owner','email'=>'owner@example.invalid','password_hash'=>'no-login','role'=>'owner','created_at'=>now(),'updated_at'=>now()]);
$db->update('site_workspace_state',['format'=>2],'id = 1');
$workspace=new SiteWorkspace($db,$root.'/studio/preview',$root.'/live',$root.'/studio/data/workspace',$root.'/live/assets');
file_put_contents($root.'/studio/preview/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
$policy=new ActorPolicy($db);$owner=new OperationActor('user',1,null,[],'studio_configured',null);
$credentials=new CredentialService($db);
$key=$credentials->create($owner,1,'read','Reset fixture',null,null,['reset:site','reset:installation']);
$actor=$policy->fromCredential($key['id']);
$appKey=Encryption::generateKey();$approvals=new AdminApprovalStore($db,$policy,$workspace,$appKey);
$operations=new OperationStore($db,$policy,$workspace->mutationLockPath());
$releases=new ReleaseStore($db,$policy,$root.'/studio/data/agent/releases');
$publish=new PublishPlanService($db,$policy,$workspace,$releases,$operations);
$landing=$root.'/studio/data/default-index.php';file_put_contents($landing,"<?php echo 'Fresh site';");
$inventory=new ResetInventory($db,$workspace,$publish,$root.'/studio',$landing);
$makeService=fn(?Closure $hook=null)=>new ResetService($db,$policy,$workspace,$approvals,$operations,$inventory,$root.'/studio/data/agent/resets',1,$hook);
$service=$makeService();
$seed=function()use($root,$db):void{
    foreach(['studio/preview/index.php'=>'Draft','studio/preview/assets/css/style.css'=>'Draft CSS',
        'studio/preview/assets/images/keep.jpg'=>'Private upload','studio/data/actions/example.json'=>'{"id":"example"}',
        'studio/revisions/example.php'=>'History','live/index.php'=>'Live','live/about.php'=>'About',
        'live/custom-hosting.php'=>'Unrelated hosting','live/assets/images/keep.jpg'=>'Public upload',
        'studio/data/collections/_schema/keep.json'=>'{}'] as $path=>$bytes)WorkspaceFiles::write($root,$path,$bytes);
    $manifest=['index.php'=>hash('sha256','Live'),'about.php'=>hash('sha256','About')];
    $release='release_'.bin2hex(random_bytes(16));
    $db->insert('site_releases',['id'=>$release,'plan_id'=>'fixture_'.bin2hex(random_bytes(4)),'operation_id'=>'fixture_'.bin2hex(random_bytes(4)),
        'actor_json'=>'{}','draft_version'=>0,'manifest_json'=>CanonicalJson::encode($manifest),'digest'=>CanonicalJson::digest($manifest),'created_at'=>time()]);
    $db->update('site_workspace_state',['release_id'=>$release],'id = 1');
    if(!is_dir($root.'/live/_data'))mkdir($root.'/live/_data',0700,true);
    $business=new PDO('sqlite:'.$root.'/live/_data/submissions.db');
    $business->exec('CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY,data TEXT)');
    $business->exec("INSERT OR REPLACE INTO submissions VALUES (1,'private record')");
    $business->exec('CREATE TABLE IF NOT EXISTS agent_business_receipts (request_id TEXT PRIMARY KEY,response TEXT)');
    $business->exec("INSERT OR REPLACE INTO agent_business_receipts VALUES ('old-request','retained-response')");
    $business->exec('CREATE TABLE IF NOT EXISTS agent_business_deliveries (id TEXT PRIMARY KEY,state TEXT,completed_at INTEGER)');
    $business->exec("INSERT OR REPLACE INTO agent_business_deliveries VALUES ('old-delivery','pending',NULL)");
    $business=null;
};
$seed();
$request=(object)['operation_id'=>'reset-site-review-001','base_draft_version'=>'draft:0'];
$review=$service->prepare($actor,$request);
JsonSchema::validate(JsonSchema::output($review),AdminApprovalStore::outputSchema());
resetCheck($review['action']==='site.reset' && $review['status']==='pending','Site reset stages a separate owner review');
resetCheck($service->prepare($actor,$request)===$review,'Reset preparation replays immutable inventory');
$paths=array_column($review['review']['files'],'path');
resetCheck(in_array('published/about.php',$paths,true) && !in_array('published/custom-hosting.php',$paths,true),'Reset affects managed publication paths only');
resetCheck(!in_array('draft/assets/images/keep.jpg',$paths,true),'Site reset preserves uploaded assets');
$apply=(object)['plan_id'=>$review['plan_id'],'digest'=>$review['digest']];
resetReject(fn()=>$service->apply($actor,$apply),'approval_required','Agent cannot self-confirm a reset');
resetReject(fn()=>$approvals->approve($actor,$review['plan_id'],$review['digest']),'permission_denied','A credential cannot issue an owner reset approval');
$approvals->approve($owner,$review['plan_id'],$review['digest']);
$result=$service->apply($actor,$apply);
resetCheck($result['status']==='applying' && $result['checkpoint']===1,'Reset advances through bounded checkpoints');
$replay=$service->apply($actor,$apply);
resetCheck($replay===$result,'Repeated reset apply reads its operation without advancing');
while($result['status']==='applying')$result=$service->continue($actor,$result['operation_id'],$result['checkpoint']);
resetCheck($result['status']==='succeeded' && $result['after_version']==='draft:1','Reset completes once and advances draft version once');
resetCheck(!is_file($root.'/studio/preview/index.php') && !is_file($root.'/live/about.php')
    && file_get_contents($root.'/live/index.php')===file_get_contents($landing),'Reset removes reviewed content and installs the retained landing page');
resetCheck(file_get_contents($root.'/live/custom-hosting.php')==='Unrelated hosting'
    && file_get_contents($root.'/studio/preview/assets/images/keep.jpg')==='Private upload','Reset preserves unrelated hosting and uploads');
resetCheck($service->apply($actor,$apply)===$result,'Completed reset replay retains its final result');
$business=new PDO('sqlite:'.$root.'/live/_data/submissions.db');
resetCheck((int)$business->query('SELECT COUNT(*) FROM submissions')->fetchColumn()===0
    && (int)$business->query('SELECT COUNT(*) FROM agent_business_receipts')->fetchColumn()===1
    && $business->query("SELECT state FROM agent_business_deliveries WHERE id='old-delivery'")->fetchColumn()==='failed',
    'Business reset clears records, retains retry receipts and cancels unsent delivery intents');
$business=null;
$seed();
$failure=$makeService(function(string $phase):void {if($phase==='after_file')throw new RuntimeException('Deliberate reset failure');});
$failedReview=$failure->prepare($actor,(object)['operation_id'=>'reset-failure-review','base_draft_version'=>'draft:1']);
$approvals->approve($owner,$failedReview['plan_id'],$failedReview['digest']);
$failed=$failure->apply($actor,(object)['plan_id'=>$failedReview['plan_id'],'digest'=>$failedReview['digest']]);
resetCheck($failed['status']==='failed_restored' && file_get_contents($root.'/studio/preview/index.php')==='Draft',
    'Partial reset failure restores and verifies original affected bytes');
resetCheck($workspace->status()['draft_version']===1 && $db->scalar('SELECT reservation_operation_id FROM site_workspace_state WHERE id=1')===null,
    'Restored failure preserves the version and releases the reservation');
$stale=$service->prepare($actor,(object)['operation_id'=>'reset-stale-review-001','base_draft_version'=>'draft:1']);
$approvals->approve($owner,$stale['plan_id'],$stale['digest']);
file_put_contents($root.'/studio/preview/index.php','External drift');
resetReject(fn()=>$service->apply($actor,(object)['plan_id'=>$stale['plan_id'],'digest'=>$stale['digest']]),'content_conflict','Exact owner approval cannot reset later file changes');
resetCheck(file_get_contents($root.'/studio/preview/index.php')==='External drift','A stale review never overwrites unrelated changes');
$seed();
$driftService=$makeService(function(string $phase,array $file)use($root):void{
    if($phase==='after_file' && $file['domain']==='draft' && $file['path']==='index.php'){
        file_put_contents($root.'/studio/preview/index.php','Third-party replacement');
        throw new RuntimeException('Deliberate interruption with later drift');
    }
});
$driftReview=$driftService->prepare($actor,(object)['operation_id'=>'reset-drift-recovery','base_draft_version'=>'draft:1']);
$approvals->approve($owner,$driftReview['plan_id'],$driftReview['digest']);
$drift=$driftService->apply($actor,(object)['plan_id'=>$driftReview['plan_id'],'digest'=>$driftReview['digest']]);
while($drift['status']==='applying')$drift=$driftService->continue($actor,$drift['operation_id'],$drift['checkpoint']);
resetCheck($drift['status']==='recovery_required' && file_get_contents($root.'/studio/preview/index.php')==='Third-party replacement',
    'Recovery refuses to overwrite an unknown third-party replacement');
$view=$service->recoveryView($operations->get($actor,$drift['operation_id']));
resetCheck(count($view)>0 && in_array(hash('sha256','Third-party replacement'),array_column($view,'current_hash'),true),
    'Owner recovery inspection exposes exact affected hashes without repairing files');
unlink($root.'/studio/preview/index.php'); // Owner reconciles the unknown replacement to the known reset state.
$repaired=$service->recover($actor,$drift['operation_id']);
resetCheck($repaired['status']==='failed_restored' && file_get_contents($root.'/studio/preview/index.php')==='Draft',
    'Explicit repair restores retained originals after third-party reconciliation');
$additions=$service->prepare($actor,(object)['operation_id'=>'reset-addition-review','base_draft_version'=>'draft:1']);
$approvals->approve($owner,$additions['plan_id'],$additions['digest']);
file_put_contents($root.'/studio/data/actions/later.json','{}');
resetReject(fn()=>$service->apply($actor,(object)['plan_id'=>$additions['plan_id'],'digest'=>$additions['digest']]),
    'content_conflict','New Action definitions invalidate the reviewed deletion set');
unlink($root.'/studio/data/actions/later.json');
$damaged=$service->prepare($actor,(object)['operation_id'=>'reset-damaged-review','base_draft_version'=>'draft:1']);
$approvals->approve($owner,$damaged['plan_id'],$damaged['digest']);
$retained=$db->queryOne('SELECT * FROM agent_reset_plans WHERE approval_id=?',[$damaged['plan_id']]);
file_put_contents($root.'/studio/data/agent/resets/'.$retained['id'].'/before/0','Damaged original');
resetReject(fn()=>$service->apply($actor,(object)['plan_id'=>$damaged['plan_id'],'digest'=>$damaged['digest']]),
    'recovery_required','Missing or damaged recovery originals prevent reset activation');
resetCheck($approvals->get($actor,$damaged['plan_id'])['status']==='approved','Failed preflight never consumes owner approval');
echo "MCP reset: {$checks} checks passed\n";
