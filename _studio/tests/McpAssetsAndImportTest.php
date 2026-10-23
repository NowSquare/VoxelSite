<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
use VoxelSite\{Database,FileManager,Logger,Migrator,PublicReferenceFetcher,Settings,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,AssetHttpAdapter,AssetManagementService,AssetReferenceIndex,AssetTransferService,BriefStore,CanonicalJson,
    ChangeSetService,ChangeSetStore,ChangeSetExecutor,CredentialService,JsonSchema,OperationActor,OperationException,
    OperationStore,ReferenceImportService,WorkspaceFiles};
$checks=0;
function assetCheck(bool $ok,string $label): void {global $checks;$checks++;if (!$ok) throw new RuntimeException('FAIL '.$label);echo 'PASS '.$label."\n";}
function assetReject(callable $call,string $code,string $label): void {
    try {$call();}catch(OperationException $e){assetCheck($e->errorCode===$code,$label.' ['.$e->errorCode.']');return;}
    assetCheck(false,$label);
}
function fetchReject(callable $call,string $label): void {try {$call();}catch(RuntimeException){assetCheck(true,$label);return;}assetCheck(false,$label);}
function assetRemove(string $path): void {if (is_file($path)||is_link($path)){unlink($path);return;}if(!is_dir($path))return;foreach(new DirectoryIterator($path) as $f)if(!$f->isDot())assetRemove($f->getPathname());rmdir($path);}
$root=realpath(sys_get_temp_dir()).'/vs-assets-'.bin2hex(random_bytes(6));
foreach(['draft/assets','live/assets','private'] as $dir)mkdir($root.'/'.$dir,0700,true);
foreach(['VS_TEST_PREVIEW_DIR'=>$root.'/draft','VS_TEST_ASSETS_DIR'=>$root.'/draft/assets','VS_TEST_DOC_ROOT'=>$root.'/live',
    'VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/private/workspace','VS_TEST_MUTATION_LOCK'=>$root.'/private/site.lock',
    'VS_TEST_REVISIONS_DIR'=>$root.'/private/revisions','VS_TEST_SNAPSHOT_DIR'=>$root.'/private/snapshots'] as $key=>$value)putenv($key.'='.$value);
foreach(['logDir'=>$root.'/private','initialized'=>true] as $key=>$value)(new ReflectionProperty(Logger::class,$key))->setValue(null,$value);
Database::resetInstance();$db=Database::getInstance($root.'/private/studio.db');
try {
    (new Migrator($db,new Settings($db)))->run();
    $db->insert('users',['email'=>'assets@example.invalid','password_hash'=>'fixture','name'=>'Fixture','role'=>'owner','created_at'=>now(),'updated_at'=>now()]);
    $db->update('site_workspace_state',['format'=>2,'draft_version'=>1],'id=1');
    WorkspaceFiles::write($root.'/draft','.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
    WorkspaceFiles::write($root.'/draft','index.php','<!doctype html><html lang="en"><head><title>Assets</title></head><body><main><h1>Assets</h1><a href="/assets/files/guide.txt?download=1">Guide</a></main></body></html>');
    WorkspaceFiles::write($root.'/draft','_partials/header.php','<!doctype html><html lang="en"><head><title>Assets</title></head><body><main>');
    WorkspaceFiles::write($root.'/draft','_partials/nav.php','<nav><a href="/">Home</a></nav>');
    WorkspaceFiles::write($root.'/draft','_partials/footer.php','</main></body></html>');
    WorkspaceFiles::write($root.'/draft','assets/files/guide.txt',"Exact original bytes\n");
    WorkspaceFiles::write($root.'/draft','assets/js/references.js','fetch("../files/guide.txt");');
    WorkspaceFiles::write($root.'/draft','assets/css/references.css','.sample { background: url(../files/guide.txt); }');
    WorkspaceFiles::write($root.'/draft','assets/data/reference.json','{"url":"/assets/files/guide.txt"}');
    file_put_contents($root.'/live/assets/sentinel.txt','LIVE DOES NOT CHANGE');
    $workspace=new SiteWorkspace($db,$root.'/draft',$root.'/live',$root.'/private/workspace',$root.'/live/assets');
    $policy=new ActorPolicy($db);$owner=new OperationActor('user',1,null,[],'studio_configured',null);
    $credentials=new CredentialService($db);$key=$credentials->create($owner,1,'edit','Asset fixture',null);$actor=$policy->fromCredential($key['id']);
    $store=new ChangeSetStore($db,$policy,$root.'/private/changes');$uploads=new AssetTransferService($db,$policy,$workspace,$root.'/private/uploads');
    $changes=new ChangeSetService($db,$policy,$workspace,new BriefStore($db,$policy),$store,fn($a,$id,$path)=>$uploads->finalizedBytes($a,$id,$path));
    $operations=new OperationStore($db,$policy,$workspace->mutationLockPath());$executor=new ChangeSetExecutor($db,$policy,$workspace,$store,$operations);
    $service=new AssetManagementService($db,$policy,$workspace,$changes);$sequence=0;
    $prepare=function(array $intent)use($service,$actor,$workspace,&$sequence){$sequence++;return $service->prepare($actor,(object)['request_id'=>'asset-review-'.$sequence,'base_draft_version'=>'draft:'.$workspace->status()['draft_version'],'intent'=>(object)$intent]);};
    $apply=function(array $review)use($executor,$actor,&$sequence){$result=$executor->apply($actor,(object)['change_set_id'=>$review['change_set_id'],'digest'=>$review['digest'],'operation_id'=>'asset-apply-'.$sequence]);for($i=0;$result['status']==='applying'&&$i<40;$i++)$result=$executor->continue($actor,$result['operation_id'],$result['checkpoint']);assetCheck($result['status']==='succeeded','Asset operation finishes with a retained result');return $result;};
    foreach(['list','inspect','prepare']as$method){JsonSchema::assertSupported(AssetManagementService::inputSchema($method));JsonSchema::assertSupported(AssetManagementService::outputSchema($method));}
    assetCheck(true,'Explicit asset schemas use supported contracts');
    $before=WorkspaceFiles::hashes(WorkspaceFiles::read($workspace));$live=SiteWorkspace::inventory($root.'/live');
    $list=$service->list($actor,(object)[]);JsonSchema::validate(JsonSchema::output($list),AssetManagementService::outputSchema('list'));
    assetCheck(count($list['assets'])===3 && $list['folders']===[],'Asset list excludes arbitrary data and lists managed files');
    $inspect=$service->inspect($actor,(object)['path'=>'assets/files/guide.txt']);
    assetCheck(count($inspect['references'])===4,'Dependency inspection finds root, relative JS, CSS and JSON references');
    assetCheck($before===WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)),'List and inspect perform no lazy thumbnail or draft writes');
    $hash=hash('sha256',"Exact original bytes\n");
    assetReject(fn()=>$prepare(['type'=>'delete','path'=>'assets/files/guide.txt','expected_hash'=>$hash,'replacement_path'=>null]),'content_conflict','Referenced asset deletion requires a replacement');
    assetReject(fn()=>$prepare(['type'=>'move','path'=>'assets/files/guide.txt','expected_hash'=>$hash,'destination'=>'assets/files/space name.txt','rewrite_references'=>true]),'invalid_path','Names requiring unsafe path reinterpretation are rejected explicitly');
    assetReject(fn()=>$prepare(['type'=>'move','path'=>'assets/files/guide.txt','expected_hash'=>$hash,'destination'=>'assets/files/guide%20name.txt','rewrite_references'=>true]),'invalid_path','Encoded filename separators and spaces are not double-decoded');
    $review=$prepare(['type'=>'move','path'=>'assets/files/guide.txt','expected_hash'=>$hash,'destination'=>'assets/files/docs/guide-2.txt','rewrite_references'=>true]);
    JsonSchema::validate(JsonSchema::output($review),AssetManagementService::outputSchema('prepare'));
    assetCheck(count($review['asset_references'])===4 && $before===WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)),'Move review retains complete static effects without applying');
    $result=$apply($review);$saved=WorkspaceFiles::read($workspace);
    assetCheck(!isset($saved['assets/files/guide.txt']) && $saved['assets/files/docs/guide-2.txt']==="Exact original bytes\n",'Move preserves exact binary bytes without re-encoding');
    assetCheck(str_contains($saved['index.php'],'/assets/files/docs/guide-2.txt?download=1')
        && str_contains($saved['assets/js/references.js'],'../files/docs/guide-2.txt')
        && str_contains($saved['assets/css/references.css'],'../files/docs/guide-2.txt'),'References are rewritten with relative style and query retained');
    $catalog=json_decode($saved[AssetManagementService::CATALOG],true);
    assetCheck($catalog['assets']['assets/files/docs/guide-2.txt']['id']==='asset_'.substr(hash('sha256','assets/files/guide.txt'),0,24),'Move preserves asset identity');
    assetCheck($changes->get($actor,$review['change_set_id'])['asset_references']===$review['asset_references'],'Reference effects remain available after apply');
    $review=$prepare(['type'=>'metadata','path'=>'assets/files/docs/guide-2.txt','expected_hash'=>$hash,'alt'=>'Guide','description'=>'Updated instructions']);$apply($review);
    $review=$prepare(['type'=>'folder','path'=>'assets/images/events']);$apply($review);
    $listed=$service->list($actor,(object)[]);assetCheck(in_array('assets/images/events',$listed['folders'],true),'Empty folders are retained in revisioned draft catalog');
    $new="Replacement guide bytes\n";$path='assets/files/docs/guide-2.txt';
    $upload=$uploads->begin($actor,(object)['request_id'=>'upload-replace-begin','path'=>$path,'bytes'=>strlen($new),'sha256'=>hash('sha256',$new),'mime_type'=>'text/plain']);
    $uploads->chunk($actor,(object)['request_id'=>'upload-replace-chunk','upload_id'=>$upload['upload_id'],'offset'=>0,'data_base64'=>base64_encode($new),'sha256'=>hash('sha256',$new)]);
    $uploads->finish($actor,(object)['request_id'=>'upload-replace-finish','upload_id'=>$upload['upload_id']]);
    $review=$prepare(['type'=>'replace','path'=>$path,'expected_hash'=>$hash,'upload_id'=>$upload['upload_id']]);$apply($review);
    assetCheck(file_get_contents($root.'/draft/'.$path)===$new,'Same-name replacement uses finalized normalized upload bytes');
    $metadata=json_decode(file_get_contents($root.'/draft/'.AssetManagementService::CATALOG),true)['assets'][$path];
    assetCheck($metadata['alt']==='Guide' && $metadata['description']==='Updated instructions','Replacement preserves asset metadata and identity');
    $missing=$service->inspect($actor,(object)['path'=>'assets/files/absent.txt']);assetCheck(!$missing['exists'] && $missing['sha256']===null,'Missing assets have explicit existence state');
    assetReject(fn()=>$service->list($actor,(object)['offset'=>1]),'content_conflict','Asset pagination requires pinned draft version');
    $originalScopes=$db->scalar('SELECT scopes FROM api_keys WHERE id=?',[$key['id']]);
    $scopes=array_values(array_diff(json_decode($originalScopes,true),['assets:write']));$db->update('api_keys',['scopes'=>json_encode($scopes)],'id=?',[$key['id']]);
    assetReject(fn()=>$prepare(['type'=>'folder','path'=>'assets/images/denied']),'permission_denied','Narrowed credential cannot prepare asset mutations');
    $db->update('api_keys',['scopes'=>$originalScopes],'id=?',[$key['id']]);
    $adapter=new AssetHttpAdapter($db,$workspace,$root.'/private/http');
    $snapshot=WorkspaceFiles::hashes(WorkspaceFiles::read($workspace));
    $_SERVER['SCRIPT_NAME']='/nested/_studio/api/router.php';
    $httpList=$adapter->list($owner,[],true);
    assetCheck(str_starts_with($httpList['assets'][0]['preview_url'],'/nested/_studio/api/router.php?')
        && $snapshot===WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)),'Studio asset list uses authenticated subdirectory previews without writes');
    assetReject(fn()=>$adapter->list($owner,['page'=>2,'per_page'=>1],false),'content_conflict','REST pagination requires the first page version');
    $temporary=$root.'/private/upload.txt';file_put_contents($temporary,"Adapter upload bytes\n");
    $file=['tmp_name'=>$temporary,'name'=>'New Guide.txt'];$input=['request_id'=>'adapter-upload-001','base_draft_version'=>'draft:'.$workspace->status()['draft_version']];
    assetReject(fn()=>$adapter->upload($owner,['base_draft_version'=>$input['base_draft_version']],$file),'invalid_schema','HTTP upload refuses a missing stable request identity');
    assetReject(fn()=>$adapter->upload($owner,['request_id'=>'missing-version-001'],$file),'invalid_schema','HTTP upload refuses a missing displayed draft version');
    assetReject(fn()=>$adapter->upload($owner,['request_id'=>'stale-version-001','base_draft_version'=>'draft:999999'],$file),'content_conflict','HTTP upload cannot replace the caller precondition with the current version');
    $uploaded=$adapter->upload($owner,$input,$file);
    assetCheck($uploaded['path']==='/assets/files/new-guide.txt' && file_get_contents($root.'/draft'.$uploaded['path'])==="Adapter upload bytes\n",'HTTP upload normalizes filename and writes only reviewed private bytes');
    $version=$workspace->status()['draft_version'];$revisionCount=$db->scalar('SELECT COUNT(*) FROM revisions');
    $replayed=$adapter->upload($owner,$input,$file);
    assetCheck($replayed['operation']===$uploaded['operation'] && $version===$workspace->status()['draft_version']
        && $revisionCount===$db->scalar('SELECT COUNT(*) FROM revisions'),'HTTP upload replay returns retained result without another revision');
    file_put_contents($temporary,"Different bytes\n");
    assetReject(fn()=>$adapter->upload($owner,$input,$file),'idempotency_conflict','Upload request identity rejects changed bytes');
    file_put_contents($temporary,"Adapter upload bytes\n");
    $metadataInput=['request_id'=>'adapter-metadata-001','base_draft_version'=>'draft:'.$workspace->status()['draft_version'],'path'=>$uploaded['path'],'expected_hash'=>hash_file('sha256',$temporary),'alt'=>'Download','description'=>'Private draft file'];
    $missingHash=$metadataInput;unset($missingHash['expected_hash']);
    assetReject(fn()=>$adapter->mutate($owner,'metadata',$missingHash),'invalid_schema','Asset mutation refuses to refresh a missing displayed file hash');
    $metaResult=$adapter->mutate($owner,'metadata',$metadataInput);$version=$workspace->status()['draft_version'];
    $metaReplay=$adapter->mutate($owner,'metadata',$metadataInput);
    assetCheck($metaReplay['operation']===$metaResult['operation'] && $version===$workspace->status()['draft_version'],'HTTP metadata replay preserves original version');
    $deleteInput=['request_id'=>'adapter-delete-001','base_draft_version'=>'draft:'.$workspace->status()['draft_version'],'path'=>$uploaded['path'],'expected_hash'=>hash_file('sha256',$temporary)];
    $deleted=$adapter->mutate($owner,'delete',$deleteInput);
    $deleteReplay=$adapter->mutate($owner,'delete',$deleteInput);
    assetCheck($deleted['operation']===$deleteReplay['operation'] && !is_file($root.'/draft'.$uploaded['path']),'HTTP deletion replay succeeds after the source is absent');
    assetReject(fn()=>$adapter->upload($owner,['request_id'=>'unsafe-category-1','base_draft_version'=>'draft:'.$workspace->status()['draft_version'],'category'=>'../../private'],$file),'invalid_schema','Upload category fails before path resolution');
    $legacy=new \VoxelSite\AgentAuth($db);
    $rest=$legacy->createKey('REST assets','agent');$policy->bindRestCredential($owner,$rest['id'],1);$restActor=$policy->fromRestCredential($rest['id'],'assets');
    $restUploaded=$adapter->upload($restActor,['request_id'=>'rest-upload-001','base_draft_version'=>'draft:'.$workspace->status()['draft_version']],$file);
    assetCheck($restUploaded['operation']['status']==='succeeded','Explicitly bound REST assets use the shared private mutation service');
    assetReject(fn()=>$policy->require($restActor,['publish:write']),'permission_denied','REST asset adapter does not gain publication authority');
    WorkspaceFiles::write($root.'/draft','assets/forms/contact.json',json_encode(['id'=>'contact','fields'=>[['name'=>'email','type'=>'email']],'download'=>'/'.$path]));
    $narrow=array_values(array_diff(json_decode($originalScopes,true),['forms:read','forms:write']));
    $db->update('api_keys',['scopes'=>json_encode($narrow)],'id=?',[$key['id']]);
    assetReject(fn()=>$service->inspect($actor,(object)['path'=>$path]),'permission_denied','Dependency inspection cannot reveal form sources without forms read');
    assetReject(fn()=>$service->inspect($restActor,(object)['path'=>$path]),'permission_denied','Legacy REST asset grant does not reveal form definition references');
    $db->update('api_keys',['scopes'=>json_encode(array_values(array_diff(json_decode($originalScopes,true),['forms:write'])))],'id=?',[$key['id']]);
    assetReject(fn()=>$prepare(['type'=>'move','path'=>$path,'expected_hash'=>hash('sha256',$new),'destination'=>'assets/files/form-guide.txt','rewrite_references'=>true]),
        'permission_denied','Move touching a form requires explicit forms write');
    $db->update('api_keys',['scopes'=>$originalScopes],'id=?',[$key['id']]);
    $formReview=$prepare(['type'=>'move','path'=>$path,'expected_hash'=>hash('sha256',$new),'destination'=>'assets/files/form-guide.txt','rewrite_references'=>true]);
    $db->update('api_keys',['scopes'=>json_encode($narrow)],'id=?',[$key['id']]);
    assetReject(fn()=>$changes->get($actor,$formReview['change_set_id']),'permission_denied','Retained asset reference review rechecks form read permission');
    $db->update('api_keys',['scopes'=>$originalScopes],'id=?',[$key['id']]);
    $apply($formReview);
    assetCheck(json_decode(file_get_contents($root.'/draft/assets/forms/contact.json'),true)['download']==='/assets/files/form-guide.txt','Authorized asset move rewrites escaped form JSON through retained review');
    assetReject(fn()=>AssetReferenceIndex::find(['index.php'=>'<a href=/assets/files/guide.txt>Guide</a>'],'assets/files/guide.txt','assets/files/other.txt'),
        'invalid_schema','Unsupported literal reference syntax fails closed before a move');
    $calls=[];$providerBlocked=false;$fetcher=new PublicReferenceFetcher(static fn($host)=>['8.8.8.8'],static function($url,$ip,$limit,$timeout)use(&$calls,&$providerBlocked){
        try{\VoxelSite\Agent\ProviderCallPolicy::assertAllowed('fixture_model');}catch(\VoxelSite\Agent\ProviderCallForbidden){$providerBlocked=true;}
        $calls[]=[$url,$ip,$limit,$timeout];$body=str_contains($url,'asset.png')?"\x89PNG\r\n\x1a\nfixture":str_repeat('é"<untrusted>',400);
        return ['status'=>200,'headers'=>['content-type'=>str_contains($url,'asset.png')?'image/png':'text/html','content-length'=>(string)strlen($body)],'body'=>$body,'complete'=>true];
    });
    $reference=new ReferenceImportService($policy,$fetcher);
    $fetched=$reference->fetch($actor,(object)['url'=>'https://example.com/reference','max_bytes'=>2048]);
    JsonSchema::validate(JsonSchema::output($fetched),ReferenceImportService::outputSchema());
    assetCheck($fetched['truncated'] && $fetched['trust']==='untrusted_reference_data' && strlen(CanonicalJson::encode($fetched))<=2048,'Reference result bounds escaped JSON and labels untrusted data');
    assetCheck(mb_check_encoding($fetched['content'],'UTF-8') && $calls[0][1]==='8.8.8.8','Reference budget preserves UTF-8 and transport receives a verified pinned address');
    $binary=$reference->fetch($actor,(object)['url'=>'https://example.com/asset.png']);assetCheck($binary['encoding']==='base64' && !$binary['truncated'],'Binary references return inert base64 without installation');
    foreach(['http://127.0.0.1/a','http://169.254.169.254/latest','https://user:pass@example.com/','http://2130706433/','http://[::ffff:127.0.0.1]/','http://[2002:7f00:1::]/','https://example.com:444/a']as$url)
        fetchReject(fn()=>$fetcher->fetch($url),'Refuse unsafe reference '.$url);
    $networkCalls=0;
    $privateDns=new PublicReferenceFetcher(static fn($host)=>['8.8.8.8','10.0.0.1'],static function()use(&$networkCalls){$networkCalls++;return [];});
    fetchReject(fn()=>$privateDns->fetch('https://example.com/'),'Mixed public/private DNS fails closed');assetCheck($networkCalls===0,'Private DNS is refused before HTTP');
    $redirect=new PublicReferenceFetcher(static fn($host)=>['8.8.8.8'],static function()use(&$networkCalls){$networkCalls++;return ['status'=>302,'headers'=>['location'=>'http://169.254.169.254/'],'body'=>'','complete'=>true];});
    fetchReject(fn()=>$redirect->fetch('https://example.com/'),'Redirect to metadata IP is refused');assetCheck($networkCalls===1,'No second request follows a private redirect');
    $dnsCalls=0;$rebindCalls=0;
    $rebind=new PublicReferenceFetcher(static function($host)use(&$dnsCalls){return ++$dnsCalls===1?['8.8.8.8']:['127.0.0.1'];},
        static function()use(&$rebindCalls){$rebindCalls++;return ['status'=>302,'headers'=>['location'=>'/next'],'body'=>'','complete'=>true];});
    fetchReject(fn()=>$rebind->fetch('https://example.com/'),'Redirect resolves and checks the host again before a second request');
    assetCheck($dnsCalls===2 && $rebindCalls===1,'DNS rebinding cannot replace the pinned public destination');
    $tooLarge=new PublicReferenceFetcher(static fn($h)=>['8.8.8.8'],static fn()=>['status'=>200,'headers'=>['content-type'=>'text/html'],'body'=>str_repeat('x',1025),'complete'=>true]);
    fetchReject(fn()=>$tooLarge->fetch('https://example.com/',limit:1024),'Reference body cannot exceed the requested read budget');
    foreach([
        ['status'=>200,'headers'=>['content-type'=>'text/html','content-length'=>'100'],'body'=>'short','complete'=>true],
        ['status'=>200,'headers'=>['content-type'=>'text/html'],'body'=>'short','complete'=>false],
        ['status'=>200,'headers'=>['content-type'=>'text/html','content-encoding'=>'gzip'],'body'=>'compressed','complete'=>true],
        ['status'=>200,'headers'=>['content-type'=>'application/x-httpd-php'],'body'=>'code','complete'=>true],
    ]as$response){$bad=new PublicReferenceFetcher(static fn($h)=>['8.8.8.8'],static fn()=>$response);fetchReject(fn()=>$bad->fetch('https://example.com/'),'Incomplete, compressed or unexpected reference content is refused');}
    assetCheck(SiteWorkspace::inventory($root.'/live')===$live,'All asset operations leave live files unchanged');
    assetCheck($providerBlocked,'Reference transport stays inside the provider-forbidden boundary');
    echo "$checks asset and reference checks passed\n";
} finally {Database::resetInstance();assetRemove($root);}
