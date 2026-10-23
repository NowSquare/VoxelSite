<?php
declare(strict_types=1);
require __DIR__.'/McpStudioAuthoringRoutesTest.php';
use VoxelSite\Agent\{ActorPolicy,BriefStore,ChangeSetService,ChangeSetStore,CompileService,JsonSchema,PageManagementService,ToolContracts};
use VoxelSite\{AgentAuth,Settings,SiteWorkspace};
copy(dirname(__DIR__).'/api/endpoints/pages.php',$root.'/_studio/api/endpoints/pages.php');
if (!is_dir($root.'/_studio/api/agent/v1')) mkdir($root.'/_studio/api/agent/v1',0700,true);
foreach(['router.php','pages.php','compile.php'] as $file)copy(dirname(__DIR__).'/api/agent/v1/'.$file,$root.'/_studio/api/agent/v1/'.$file);
$beforeRows=$db->query('SELECT * FROM pages ORDER BY id');$beforeVersion=$workspace->status();
$list=authoringRoute('GET','/pages');stageCheck($list['status']===200&&isset($list['body']['data']['draft_version']),'Studio page list returns a captured version');
$read=authoringRoute('GET','/pages/work')['body']['data'];
stageCheck(isset($read['page']['content_sha256'])&&$db->query('SELECT * FROM pages ORDER BY id')===$beforeRows&&$workspace->status()===$beforeVersion,'Page GET list/detail are observational and return exact source hash');
function pageInput(string $id,array $read):array{return ['operation_id'=>$id,'base_draft_version'=>$read['draft_version'],'expected_content_sha256'=>$read['page']['content_sha256']];}
function pageFinish(string $method,string $path,array $input):array{
    $result=authoringRoute($method,$path,$input);for($i=0;($result['body']['data']['operation']['status']??'')==='applying'&&$i<30;$i++)$result=authoringRoute($method,$path,$input+['checkpoint'=>$result['body']['data']['operation']['checkpoint']]);return $result;
}
$input=pageInput('page-combined-001',$read)+['title'=>'Work & repairs','slug'=>'projects','nav_label'=>'Our projects'];
$result=pageFinish('PUT','/pages/work',$input);if($result['status']!==200)fwrite(STDERR,json_encode($result)."\n");
stageCheck($result['status']===200&&$result['body']['data']['page']['slug']==='projects'&&$result['body']['data']['page']['title']==='Work & repairs','Combined title, slug and navigation label applies atomically');
stageCheck(pageFinish('PUT','/pages/work',$input)['body']===$result['body'],'Renamed page replay uses retained identity after original route disappears');
$bad=$input;$bad['title']='Other';stageCheck(pageFinish('PUT','/pages/work',$bad)['status']===409,'Changed input cannot reuse a completed page identity');
$read=authoringRoute('GET','/pages/projects')['body']['data'];$navInput=pageInput('page-flags-001',$read)+['is_published'=>false];
$hash=hash_file('sha256',$root.'/draft/projects.php');$version=$workspace->status()['draft_version'];$revisions=$db->scalar('SELECT COUNT(*) FROM revisions');
$result=pageFinish('PUT','/pages/projects/nav',$navInput);
if($result['status']!==200)fwrite(STDERR,json_encode($result)."\n");
stageCheck($result['status']===200&&$result['body']['data']['page']['is_published']===0&&hash_file('sha256',$root.'/draft/projects.php')===$hash,'Metadata-only navigation flag retains unchanged source bytes');
stageCheck($workspace->status()['draft_version']===$version+1&&$db->scalar('SELECT COUNT(*) FROM revisions')===$revisions+1,'Metadata-only change creates one real projected revision/version');
$review=$db->queryOne('SELECT payload_json FROM agent_change_sets WHERE id=?',[$result['body']['data']['operation']['result']['change_set_id']]);$payload=json_decode($review['payload_json'],true);
stageCheck(count($payload['page_changes'])===1&&$payload['page_changes'][0]['before']['is_published']===1&&$payload['page_changes'][0]['after']['is_published']===0,'Exact metadata before/after is visible in sealed review');
stageCheck(pageFinish('PUT','/pages/projects/nav',$navInput)['body']===$result['body']&&$db->scalar('SELECT COUNT(*) FROM revisions')===$revisions+1,'Metadata retry cannot add another revision');
$changeId=$result['body']['data']['operation']['result']['change_set_id'];$tampered=$payload;$tampered['page_changes'][0]['after']['is_published']=1;
$db->update('agent_change_sets',['payload_json'=>json_encode($tampered)],'id=?',[$changeId]);
$reviewStore=new ChangeSetStore($db,new ActorPolicy($db),dirname($workspace->draftRoot()).'/data/agent/changes');
stageReject(fn()=>$reviewStore->get($owner,$changeId),'content_conflict','Corrupted visible metadata cannot disagree with the sealed projection');
$db->update('agent_change_sets',['payload_json'=>$review['payload_json']],'id=?',[$changeId]);
$history=new VoxelSite\WebsiteHistoryService($db,$workspace,$root.'/private/history');
foreach(['undo'=>1,'redo'=>0] as $direction=>$flag){
    $state=$history->revisions->state($owner);$plan=$history->revisions->prepare($owner,(object)['request_id'=>'metadata-'.$direction.'-001','action'=>$direction,'head_version'=>$state['head_version'],'base_draft_version'=>$state['draft_version']]);
    $operationId='metadata-'.$direction.'-apply-001';$applied=$history->revisions->apply($owner,(object)['operation_id'=>$operationId,'plan_id'=>$plan['plan_id'],'digest'=>$plan['digest']]);
    for($i=0;($applied['status']??'')==='applying'&&$i<30;$i++)$applied=$history->restores->continue($owner,$operationId,$applied['checkpoint']);
    stageCheck($applied['status']==='succeeded'&&(int)$db->scalar("SELECT is_published FROM pages WHERE slug='projects'")===$flag,'Metadata-only revision '.$direction);
}
$stale=pageInput('page-stale-001',$read)+['title'=>'Stale'];stageCheck(pageFinish('PUT','/pages/projects',$stale)['status']===409,'Page adapter rejects stale displayed version');
$read=authoringRoute('GET','/pages/projects')['body']['data'];$wrong=pageInput('page-hash-001',$read)+['title'=>'Wrong hash'];$wrong['expected_content_sha256']=str_repeat('0',64);
stageCheck(pageFinish('PUT','/pages/projects',$wrong)['status']===409,'Page adapter rejects a wrong source hash');
$order=['operation_id'=>'page-order-001','base_draft_version'=>$read['draft_version'],'order'=>['projects','index','linked-1']];
$result=pageFinish('PUT','/pages/reorder',$order);stageCheck($result['status']===200,'Existing partial page order has a sealed projection');
$serviceRead=$service->pages->list($owner,(object)['limit'=>2]);JsonSchema::validate(JsonSchema::output($serviceRead),PageManagementService::outputSchema('list'));
stageReject(fn()=>$service->pages->list($owner,(object)['offset'=>2,'limit'=>2]),'content_conflict','Page continuation requires its displayed version');
$read=$service->pages->read($owner,(object)['slug'=>'projects']);JsonSchema::validate(JsonSchema::output($read),PageManagementService::outputSchema('read'));stageCheck($read['page']['content_sha256']===hash('sha256',$read['page']['content']),'Typed page reads match exact content hashes');
$policy=new ActorPolicy($db);$changes=new ChangeSetService($db,$policy,$workspace,new BriefStore($db,$policy),new ChangeSetStore($db,$policy,dirname($workspace->draftRoot()).'/data/agent/changes'));
$compile=new CompileService($changes);$compileInput=(object)['request_id'=>'compile-review-001','base_draft_version'=>'draft:'.$workspace->status()['draft_version']];
$compileReview=$compile->prepare($owner,$compileInput);JsonSchema::validate(JsonSchema::output($compileReview),CompileService::outputSchema());stageCheck($compileReview['files']===[],'Typed compile prepares an honest no-effect review');
stageReject(fn()=>$compile->prepare($owner,(object)['request_id'=>'compile-stale-001','base_draft_version'=>'draft:0']),'content_conflict','Compile preparation rejects stale source version');
$missingSeo=$service->pages->seoRead($owner,(object)['path'=>'_root/robots.txt']);stageCheck($missingSeo['exists']===false&&$missingSeo['content_sha256']===null,'Absent SEO source exposes an explicit absence precondition');
VoxelSite\Agent\WorkspaceFiles::write($root.'/draft','_root/robots.txt',"User-agent: *\nDisallow: /private\n");
$seo=$service->pages->seoRead($owner,(object)['path'=>'_root/robots.txt']);JsonSchema::validate(JsonSchema::output($seo),PageManagementService::outputSchema('seo_read'));
stageCheck($seo['content_sha256']===hash('sha256',$seo['content'])&&$service->read($owner,'_root/robots.txt')['content']===$seo['content'],'MCP and Studio SEO reads share bounded exact source');
stageReject(fn()=>$service->pages->seoRead($owner,(object)['path'=>'_root/robots.txt','draft_version'=>'draft:0']),'content_conflict','SEO reads reject stale expected versions');
stageReject(fn()=>$service->pages->seoRead($owner,(object)['path'=>'_studio/data/config.json']),'invalid_schema','SEO read cannot select private configuration');
unlink($root.'/draft/_root/robots.txt');
$auth=new AgentAuth($db);$key=$auth->createKey('Page fixture','editor',['pages:read','pages:write','compile:trigger']);
stageReject(fn()=>$policy->fromRestCredential($key['id'],'authoring'),'credential_migration_required','REST page editing cannot guess the installation owner');
$policy->bindRestCredential($owner,$key['id'],1);(new Settings($db))->set('agent_api_enabled',true);
function restPageRoute(string $method,string $path,array $body=[],array $query=[],?string $token=null):array{
    global $root,$key;$input=['surface'=>'rest','method'=>$method,'path'=>$path,'body'=>$body,'query'=>$query,'key'=>$token??$key['key']];
    $process=proc_open([PHP_BINARY,__DIR__.'/helpers/call-studio-authoring.php',$root],[['pipe','r'],['pipe','w'],['pipe','w']],$pipes);
    fwrite($pipes[0],json_encode($input));fclose($pipes[0]);$out=stream_get_contents($pipes[1]);$err=stream_get_contents($pipes[2]);fclose($pipes[1]);fclose($pipes[2]);$code=proc_close($process);if($code!==0)throw new RuntimeException($err.$out);return json_decode($out,true,32,JSON_THROW_ON_ERROR);
}
$list=restPageRoute('GET','/pages');if($list['status']!==200)fwrite(STDERR,json_encode($list)."\n");stageCheck($list['status']===200&&isset($list['body']['data']['draft_version']),'Real REST router uses bounded bound-account page list');
$create=['operation_id'=>'rest-page-create-001','base_draft_version'=>$list['body']['data']['draft_version'],'expected_content_sha256'=>null,'slug'=>'rest-page','title'=>'REST page','content'=>"<?php \$page=['title'=>'REST page','slug'=>'rest-page']; include __DIR__.'/_partials/header.php'; ?><h1>REST page</h1><?php include __DIR__.'/_partials/footer.php'; ?>"];
$made=restPageRoute('POST','/pages',$create);if($made['status']!==201)fwrite(STDERR,json_encode($made)."\n");stageCheck($made['status']===201&&$made['body']['data']['page']['slug']==='rest-page','Real REST create retains a new page with explicit absence');
stageCheck(restPageRoute('POST','/pages',$create)['body']===$made['body'],'REST create response loss does not duplicate a page');
$read=restPageRoute('GET','/pages/rest-page')['body']['data'];$save=pageInput('rest-page-save-001',$read)+['content'=>$read['page']['content'].'<!-- REST edited -->'];
$saved=restPageRoute('PUT','/pages/rest-page',$save);stageCheck($saved['status']===200&&$saved['body']['data']['operation']['status']==='succeeded','REST update uses displayed source/version and shared operation');
$read=restPageRoute('GET','/pages/rest-page')['body']['data'];$delete=pageInput('rest-page-delete-001',$read);$deleted=restPageRoute('DELETE','/pages/rest-page',$delete);
stageCheck($deleted['status']===200&&!is_file($root.'/draft/rest-page.php')&&restPageRoute('DELETE','/pages/rest-page',$delete)['body']===$deleted['body'],'REST deletion replays after its source disappears');
$compileRequest=['operation_id'=>'rest-compile-001','base_draft_version'=>'draft:'.$workspace->status()['draft_version']];$compiled=restPageRoute('POST','/compile',$compileRequest);
stageCheck($compiled['status']===200&&restPageRoute('POST','/compile',$compileRequest)['body']===$compiled['body'],'REST compile retains one exact no-effect receipt');
stageCheck(restPageRoute('POST','/compile',[])['status']===422,'REST compile refuses an implicit unversioned mutation');
$assets=$auth->createKey('Assets only','editor',['assets:read','assets:write']);$policy->bindRestCredential($owner,$assets['id'],1);
stageReject(fn()=>$policy->require($policy->fromRestCredential($assets['id'],'authoring'),['files:write']),'permission_denied','Assets grant cannot inherit page authoring through a purpose conversion');
$compileOnly=$auth->createKey('Compile only','editor',['compile:trigger']);$policy->bindRestCredential($owner,$compileOnly['id'],1);
stageReject(fn()=>$policy->require($policy->fromRestCredential($compileOnly['id'],'authoring'),['structure:write']),'permission_denied','Compile grant cannot inherit structural editing');
$db->delete('api_keys','id=?',[$key['id']]);stageCheck(restPageRoute('POST','/compile',$compileRequest)['status']===401,'Revoked REST key cannot replay a retained compile');
stageCheck(SiteWorkspace::inventory($root.'/live')===$live,'Every page and compile path preserves all live bytes');
echo "Pages and compile: {$checks} checks passed.\n";
