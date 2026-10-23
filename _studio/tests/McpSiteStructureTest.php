<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
use VoxelSite\{Database,FileManager,Migrator,Settings,SiteWorkspace,NavLinksParser,RevisionManager};
use VoxelSite\Agent\{ActorPolicy,BriefStore,ChangeSetService,ChangeSetStore,ChangeSetExecutor,CredentialService,OperationActor,OperationException,OperationStore,SiteStructureService,WorkspaceFiles,CanonicalJson,JsonSchema,ChangeSetValidator};
$checks=0;
function ssCheck(bool $ok,string $label):void {global $checks;$checks++;if (!$ok) {fwrite(STDERR,"FAIL $label\n");exit(1);}echo "PASS $label\n";}
function ssReject(callable $fn,string $code,string $label):void {try {$fn();}catch(OperationException $e){ssCheck($e->errorCode===$code,$label.' ('.$e->errorCode.')');return;}ssCheck(false,$label);}
ssCheck((new ReflectionMethod(FileManager::class,'__construct'))->getNumberOfParameters()>=2,'Workspace injection verified before fixture setup');
$root=sys_get_temp_dir().'/vs-structure-'.bin2hex(random_bytes(8));foreach (['draft/assets','live/assets','private'] as $dir) mkdir($root.'/'.$dir,0700,true);$root=realpath($root);
foreach (['VS_TEST_PREVIEW_DIR'=>$root.'/draft','VS_TEST_ASSETS_DIR'=>$root.'/draft/assets','VS_TEST_DOC_ROOT'=>$root.'/live','VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/private/workspace','VS_TEST_MUTATION_LOCK'=>$root.'/private/site.lock','VS_TEST_REVISIONS_DIR'=>$root.'/private/revisions','VS_TEST_SNAPSHOT_DIR'=>$root.'/private/snapshots'] as $key=>$value) putenv($key.'='.$value);
foreach (['logDir'=>$root.'/private','initialized'=>true] as $key=>$value) (new ReflectionProperty(VoxelSite\Logger::class,$key))->setValue(null,$value);
Database::resetInstance();$db=Database::getInstance($root.'/private/studio.db');(new Migrator($db,new Settings($db)))->run();
$db->insert('users',['email'=>'structure@example.invalid','password_hash'=>'fixture','name'=>'Fixture','role'=>'owner','created_at'=>now(),'updated_at'=>now()]);$db->update('site_workspace_state',['format'=>2],'id=1');
file_put_contents($root.'/draft/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
$workspace=new SiteWorkspace($db,$root.'/draft',$root.'/live',$root.'/private/workspace',$root.'/live/assets');
$policy=new ActorPolicy($db);$credentials=new CredentialService($db);$owner=new OperationActor('user',1,null,[],'studio_configured',null);$key=$credentials->create($owner,1,'edit','Structure fixture',null);$actor=$policy->fromCredential($key['id']);
$files=new FileManager($db,$workspace);
foreach (['index'=>'Home','about'=>'About','about/team'=>'Team','contact'=>'Contact','work'=>'Work','work/about'=>'Other About'] as $slug=>$title) {
 $dir=str_contains($slug,'/')?'../':'';
 WorkspaceFiles::write($root.'/draft',$slug.'.php',"<?php \$page=['title'=>'$title','slug'=>'$slug']; include __DIR__ . '/{$dir}_partials/header.php'; ?>\n<h1>$title</h1>\n<a href='/about?ref=1#top'>About</a>\n<?php include __DIR__ . '/{$dir}_partials/footer.php'; ?>\n");
}
WorkspaceFiles::write($root.'/draft','_partials/header.php','<!doctype html><html><body><?php include __DIR__ . "/nav.php"; ?><main>');
WorkspaceFiles::write($root.'/draft','_partials/footer.php','</main><footer><a href="/about">About</a></footer></body></html>');
$nav=[['label'=>'Home','href'=>'/','home'=>true],['label'=>'About','href'=>'/about','children'=>[['label'=>'Team','href'=>'/about/team']]],['label'=>'Contact custom','href'=>'/contact'],['label'=>'Work','href'=>'/work']];
WorkspaceFiles::write($root.'/draft','_partials/nav.php',"<?php\n".NavLinksParser::serialize($nav)."\n?>\n<nav><?php foreach (\$navLinks as \$link): ?><a href=\"<?= \$link['href'] ?>\"><?= htmlspecialchars(\$link['label']) ?></a><?php endforeach; ?></nav>");
$files->ensureShippedNavigation();$files->ensureShippedIconResolver();$files->syncPageRegistry(true);
$db->update('pages',['nav_label'=>'Contact custom'],'slug = ?',['contact']);
$store=new ChangeSetStore($db,$policy,$root.'/private/changes');$changes=new ChangeSetService($db,$policy,$workspace,new BriefStore($db,$policy),$store);
$service=new SiteStructureService($db,$policy,$workspace,$changes);$operations=new OperationStore($db,$policy,$workspace->mutationLockPath());$executor=new ChangeSetExecutor($db,$policy,$workspace,$store,$operations,2);
$counter=0;
function ssPrepare(array $intent,?string $id=null):array {global $counter,$workspace,$service,$actor;$counter++;$input=(object)['request_id'=>$id??'structure-request-'.$counter,'base_draft_version'=>'draft:'.$workspace->status()['draft_version'],'intent'=>(object)$intent];$review=$service->prepare($actor,$input);JsonSchema::validate((object)json_decode(json_encode($review)),SiteStructureService::outputSchema('prepare'));return [$review,$input];}
function ssApply(array $review,?ChangeSetExecutor $runner=null):array {global $executor,$actor,$counter;$runner??=$executor;$id='structure-apply-'.$counter;$r=$runner->apply($actor,(object)['change_set_id'=>$review['change_set_id'],'digest'=>$review['digest'],'operation_id'=>$id]);for ($i=0;$r['status']==='applying'&&$i<30;$i++) $r=$runner->continue($actor,$id,$r['checkpoint']);return $r;}
$before=WorkspaceFiles::hashes(WorkspaceFiles::read($workspace));$rows=$db->query('SELECT * FROM pages ORDER BY id');
$graph=$service->graph($actor,(object)['kind'=>'nodes','limit'=>2]);JsonSchema::validate(json_decode(json_encode($graph)),SiteStructureService::outputSchema('graph'));
ssCheck($graph['next_offset']===2 && count($graph['items'])===2,'Graph inspection is bounded and returns inventory version');
$next=$service->graph($actor,(object)['kind'=>'nodes','offset'=>2,'version'=>$graph['version'],'limit'=>2]);ssCheck(count($next['items'])===2,'Graph continuation pins version');
ssReject(fn()=>$service->graph($actor,(object)['kind'=>'nodes','offset'=>2]),'content_conflict','Graph continuation requires inventory version');
ssCheck($rows===$db->query('SELECT * FROM pages ORDER BY id') && $before===WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)),'Graph reads do not synchronize or mutate page records');
$blast=$service->blastRadius($actor,(object)['node_id'=>'partial:_partials/header.php']);ssCheck(count($blast['affected_pages'])===6,'Blast radius finds consumers of a shared partial');
$discovery=$service->discover($actor,(object)['category'=>'content','scope'=>'page:about','keywords'=>['About']]);ssCheck(count($discovery['candidates'])===1 && !isset($discovery['regions'][0]['source_content']),'Supplied intent uses shared bounded discovery without entire hidden source copies');
$prepareVersion=$workspace->status()['draft_version'];
[$review,$input]=ssPrepare(['type'=>'title','page_file'=>'about.php','title'=>'About us']);
ssCheck($workspace->status()['draft_version']===$prepareVersion,'Private structural staging does not invalidate canonical draft version');$aboutId=$db->scalar("SELECT id FROM pages WHERE slug='about'");
ssCheck($rows===$db->query('SELECT * FROM pages ORDER BY id') && $before===WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)),'Structural prepare leaves all source and projections unchanged');
ssCheck($service->prepare($actor,$input)===$review,'Structural request retry returns same immutable digest');
ssCheck(ssApply($review)['status']==='succeeded','Title review applies through bounded common runner');
ssCheck($db->scalar("SELECT title FROM pages WHERE id=?",[$aboutId])==='About us','Title projection preserves page identity');
ssCheck(NavLinksParser::parse($files->readFile('_partials/nav.php'))[1]['label']==='About us','Matching nav label follows title');
ssCheck($service->prepare($actor,$input)===$review,'Prepare replay after commit does not regenerate from newer draft');
[$review]=ssPrepare(['type'=>'title','page_file'=>'contact.php','title'=>'Get in touch']);ssApply($review);
ssCheck(str_contains($files->readFile('_partials/nav.php'),'Contact custom'),'Custom nav label survives title rename');
ssReject(fn()=>ssPrepare(['type'=>'delete','page_file'=>'index.php','replacement_href'=>'#']),'invalid_schema','Homepage deletion is refused');
ssReject(fn()=>ssPrepare(['type'=>'url','page_file'=>'index.php','new_slug'=>'home']),'invalid_schema','Homepage URL rename is refused');
[$review]=ssPrepare(['type'=>'url','page_file'=>'about.php','new_slug'=>'company']);ssCheck(ssApply($review)['status']==='succeeded','URL rename applies');
ssCheck($db->scalar("SELECT id FROM pages WHERE slug='company'")===$aboutId && !is_file($root.'/draft/about.php'),'URL rename preserves exact ID despite another about basename');
ssCheck(str_contains($files->readFile('index.php'),'/company?ref=1#top'),'Inbound links preserve query and fragment');
ssReject(fn()=>ssPrepare(['type'=>'url','page_file'=>'company.php','new_slug'=>'contact']),'content_conflict','URL collision is rejected before staging');
[$review]=ssPrepare(['type'=>'move','page_file'=>'company.php','target_parent'=>'work','target_index'=>null]);ssCheck(ssApply($review)['status']==='succeeded','Structural move applies');
ssCheck($db->scalar("SELECT id FROM pages WHERE slug='work/company'")===$aboutId,'Structural move preserves ID');
ssCheck(str_contains($files->readFile('work/company.php'),"__DIR__ . '/../_partials/header.php'"),'Moved page includes remain relative to same partial');
ssCheck(str_contains($files->readFile('index.php'),'/work/company?ref=1#top'),'Cross-file links follow moved URL');
ssCheck(!NavLinksParser::isInNav(NavLinksParser::parse($files->readFile('_partials/nav.php')),'/about/team') && is_file($root.'/draft/about/team.php'),'Nested relocation hides grandchildren while preserving routable source');
$subtreeIds=[];
foreach (['branch','branch/leaf','branch/leaf/deep'] as $slug) {
    $prefix=str_repeat('../',substr_count($slug,'/'));
    WorkspaceFiles::write($root.'/draft',$slug.'.php',"<?php \$page=['title'=>'Branch','slug'=>'$slug']; include __DIR__ . '/{$prefix}_partials/header.php'; ?>\n<h1>Branch</h1>\n<?php include __DIR__ . '/{$prefix}_partials/footer.php'; ?>");
}
$files->syncPageRegistry(true);
foreach ($db->query("SELECT id,slug FROM pages WHERE slug LIKE 'branch%'") as $p) $subtreeIds[$p['slug']]=$p['id'];
[$review]=ssPrepare(['type'=>'move','page_file'=>'branch.php','target_parent'=>'work','target_index'=>null]);ssCheck(ssApply($review)['status']==='succeeded','Filesystem subtree moves as one reviewed operation');
foreach ($subtreeIds as $slug=>$id) ssCheck($db->scalar('SELECT id FROM pages WHERE slug=?',['work/'.$slug])===$id && is_file($root.'/draft/work/'.$slug.'.php') && !is_file($root.'/draft/'.$slug.'.php'),'Subtree descendant identity preserved: '.$slug);
ssReject(fn()=>ssPrepare(['type'=>'nav_visible','page_file'=>'work/branch/leaf.php','visible'=>true]),'invalid_schema','Too-deep pages remain routable but cannot enter shallow nav');

[$review]=ssPrepare(['type'=>'nav_visible','page_file'=>'contact.php','visible'=>false]);ssApply($review);
ssCheck($db->queryOne("SELECT nav_order FROM pages WHERE slug='contact'")['nav_order']===null && is_file($root.'/draft/contact.php'),'Hidden navigation keeps page routable');
[$review]=ssPrepare(['type'=>'nav_visible','page_file'=>'contact.php','visible'=>true]);ssApply($review);
ssCheck(NavLinksParser::isInNav(NavLinksParser::parse($files->readFile('_partials/nav.php')),'/contact'),'Show restores explicit navigation entry');
[$review]=ssPrepare(['type'=>'nav_reorder','page_file'=>'contact.php','parent_href'=>null,'index'=>0]);ssApply($review);
ssCheck(NavLinksParser::findPosition(NavLinksParser::parse($files->readFile('_partials/nav.php')),'/contact')['index']===0 && NavLinksParser::parse($files->readFile('_partials/nav.php'))[0]['href']==='/','Nav order respects pinned homepage');
$source=$files->readFile('contact.php');$edit=['path'=>'contact.php','expected_hash'=>hash('sha256',$source),'source_address'=>'<h1>Contact</h1>','content_hash'=>hash('sha256','<h1>Contact</h1>'),'replacement'=>'<h1>Contact the team</h1>','strategy'=>'content-edit'];
[$review]=ssPrepare(['type'=>'visual','edits'=>[(object)$edit]]);ssCheck(ssApply($review)['status']==='succeeded' && str_contains($files->readFile('contact.php'),'Contact the team'),'Visual source address and whole-file hash revalidated before exact patch');
ssReject(fn()=>ssPrepare(['type'=>'visual','edits'=>[(object)$edit]]),'content_conflict','Stale visual address rejected');
$source=$files->readFile('contact.php');$duplicate=$source."\n<h1>Contact the team</h1>";$files->writeExactFile('contact.php',$duplicate);$ambiguous=$edit;$ambiguous['expected_hash']=hash('sha256',$duplicate);$ambiguous['source_address']='<h1>Contact the team</h1>';$ambiguous['content_hash']=hash('sha256',$ambiguous['source_address']);
ssReject(fn()=>ssPrepare(['type'=>'visual','edits'=>[(object)$ambiguous]]),'content_conflict','Ambiguous visual address never guesses element');$files->writeExactFile('contact.php',$source);
[$review]=ssPrepare(['type'=>'seo_override','path'=>'_root/robots.txt','expected_hash'=>null,'content'=>"User-agent: *\nDisallow: /private\n"]);ssApply($review);
ssCheck($files->readFile('_root/robots.txt')==="User-agent: *\nDisallow: /private\n" && !is_file($root.'/live/robots.txt'),'SEO override is explicit private draft source');
ssReject(fn()=>(new ChangeSetValidator)->resolve([(object)['type'=>'create','path'=>'_root/other.txt','expected_hash'=>null,'content'=>'no']],[] ,null,true),'invalid_path','Trusted SEO seam cannot write arbitrary root paths');
ssReject(fn()=>(new ChangeSetValidator)->resolve([(object)['type'=>'create','path'=>'_root/llms.txt','expected_hash'=>null,'content'=>'no']],[]),'invalid_path','Generic changes cannot bypass explicit SEO operation');
[$review]=ssPrepare(['type'=>'seo_override','path'=>'_root/robots.txt','expected_hash'=>hash('sha256',$files->readFile('_root/robots.txt')),'content'=>null]);ssApply($review);ssCheck(!is_file($root.'/draft/_root/robots.txt'),'Removing override explicitly restores generated publish policy');
$contact=$db->queryOne("SELECT * FROM pages WHERE slug='contact'");
$collection=$db->insert('collections',['name'=>'Contacts','slug'=>'contacts','index_page_id'=>$contact['id'],'created_at'=>now(),'updated_at'=>now()]);
[$review]=ssPrepare(['type'=>'delete','page_file'=>'contact.php','replacement_href'=>'/']);ssCheck(ssApply($review)['status']==='succeeded','Delete applies with recovery original');
ssCheck($db->scalar('SELECT index_page_id FROM collections WHERE id=?',[$collection])===null,'Deleting collection index page clears index reference');
$history=new RevisionManager($db,new Settings($db),$files);$history->undo();
ssCheck(is_file($root.'/draft/contact.php') && $db->scalar('SELECT index_page_id FROM collections WHERE id=?',[$collection])===$contact['id'],'Undo restores exact page ID and collection reference');
$history->redo();ssCheck(!is_file($root.'/draft/contact.php') && $db->scalar('SELECT index_page_id FROM collections WHERE id=?',[$collection])===null,'Redo reapplies page deletion and collection projection');
[$review]=ssPrepare(['type'=>'title','page_file'=>'work.php','title'=>'Projects']);$db->update('pages',['nav_label'=>'Externally changed'],'slug=?',['work']);
ssCheck(ssApply($review)['status']==='failed_restored','Metadata drift blocks reviewed apply before files');
ssCheck($db->scalar("SELECT nav_label FROM pages WHERE slug='work'")==='Externally changed','Pre-apply metadata conflict preserves outside change');
[$review]=ssPrepare(['type'=>'title','page_file'=>'work.php','title'=>'Projects']);$before=WorkspaceFiles::hashes(WorkspaceFiles::read($workspace));$rows=$db->query('SELECT * FROM pages ORDER BY id');
$fault=new ChangeSetExecutor($db,$policy,$workspace,$store,$operations,20,static function($phase){if($phase==='after_projection') throw new RuntimeException('fixture projection failure');});
ssCheck(ssApply($review,$fault)['status']==='failed_restored','Projection failure rolls back whole structural operation');
ssCheck($before===WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)) && CanonicalJson::digest($rows)===CanonicalJson::digest($db->query('SELECT * FROM pages ORDER BY id')),'Projection failure restores all bytes and page identities');
[$review]=ssPrepare(['type'=>'title','page_file'=>'work.php','title'=>'Projects']);$originalScopes=$db->scalar('SELECT scopes FROM api_keys WHERE id=?',[$key['id']]);$scopes=array_values(array_diff(json_decode($originalScopes,true),['structure:write']));$db->update('api_keys',['scopes'=>json_encode($scopes)],'id=?',[$key['id']]);
ssCheck(ssApply($review)['status']==='failed_restored','Structural scope revocation is checked on apply');$db->update('api_keys',['scopes'=>$originalScopes],'id=?',[$key['id']]);
$invalid=(object)['request_id'=>'injected-projection','base_draft_version'=>'draft:'.$workspace->status()['draft_version'],'intent'=>(object)['type'=>'title','page_file'=>'work.php','title'=>'Projects'],'projection'=>['sql'=>'DELETE FROM users']];
ssReject(fn()=>$service->prepare($actor,$invalid),'invalid_schema','Caller cannot supply projection or SQL through typed intent');
[$review]=ssPrepare(['type'=>'title','page_file'=>'work.php','title'=>'Projects']);$oldLabel=$db->scalar("SELECT nav_label FROM pages WHERE slug='work'");
$drift=new ChangeSetExecutor($db,$policy,$workspace,$store,$operations,20,static function($phase)use($db){if($phase==='after_file') {$db->update('pages',['nav_label'=>'Outside metadata edit'],'slug=?',['work']);throw new RuntimeException('fixture external projection drift');}});
ssCheck(ssApply($review,$drift)['status']==='recovery_required','External metadata drift retains unresolved recovery instead of overwriting it');
ssCheck($db->scalar("SELECT nav_label FROM pages WHERE slug='work'")==='Outside metadata edit','Recovery preserves external metadata edit');
ssReject(fn()=>$service->graph($actor,(object)['kind'=>'nodes']),'operation_pending','Graph read refuses in-progress operation without implicit recovery');
$db->update('pages',['nav_label'=>$oldLabel],'slug=?',['work']);
ssCheck($executor->recover($actor,'structure-apply-'.$counter)['status']==='failed_restored','Explicit recovery verifies repaired projection and releases reservation');
// Failed attempts have no retained review; expire their fixture reservations to
// make room for the independently scoped planner tests below.
$db->exec("UPDATE agent_change_sets SET status='expired', expires_at=0 WHERE status='preparing' AND staged_bytes=0");
$scopes=array_values(array_diff(json_decode($originalScopes,true),['structure:write']));$db->update('api_keys',['scopes'=>json_encode($scopes)],'id=?',[$key['id']]);
$assetRequest=(object)['request_id'=>'asset-trusted-copy','base_draft_version'=>'draft:'.$workspace->status()['draft_version'],'brief_id'=>'assets:v1','summary'=>'Move an existing asset','intent'=>(object)['type'=>'move_asset','path'=>'assets/files/source.txt','destination'=>'assets/files/copied.txt']];
WorkspaceFiles::write($root.'/draft','assets/files/source.txt','Exact asset bytes');$upload='upload_'.substr(hash('sha256','Exact asset bytes'),0,32);
$review=$changes->prepareAssets($actor,$assetRequest,static fn($before)=>['operations'=>[
    (object)['type'=>'attach_asset','path'=>'assets/files/copied.txt','expected_hash'=>null,'upload_id'=>$upload],
    (object)['type'=>'delete','path'=>'assets/files/source.txt','expected_hash'=>hash('sha256',$before['assets/files/source.txt'])],
], 'assets'=>[$upload=>['path'=>'assets/files/copied.txt','content'=>$before['assets/files/source.txt']]]]);$counter++;
ssCheck(ssApply($review)['status']==='succeeded' && $files->readFile('assets/files/copied.txt')==='Exact asset bytes' && !is_file($root.'/draft/assets/files/source.txt'),'Trusted asset planner preserves exact bytes without structure scope or image reprocessing');
$assetRequest->request_id='asset-forbidden-seo';$assetRequest->base_draft_version='draft:'.$workspace->status()['draft_version'];
ssReject(fn()=>$changes->prepareAssets($actor,$assetRequest,static fn($before)=>['operations'=>[(object)['type'=>'create','path'=>'_root/llms.txt','expected_hash'=>null,'content'=>'forbidden']]]),'invalid_path','Asset planner cannot use structure SEO elevation');
$db->update('api_keys',['scopes'=>$originalScopes],'id=?',[$key['id']]);
ssCheck(SiteWorkspace::inventory($root.'/live')['files']===[],'Every structural operation leaves published site unchanged');
echo "$checks structural checks passed\n";
