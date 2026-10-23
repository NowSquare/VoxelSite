<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
require __DIR__.'/fixtures/mcp/ServiceFixture.php';
use VoxelSite\{Database,FileManager,Logger,Migrator,Settings,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,CanonicalJson,CredentialService,JsonSchema,OperationActor,OperationException,OperationStore,PublishPlanService,ReleaseStore,WorkspaceFiles};

$checks=0;
function publishCheck(bool $ok,string $label):void {global $checks;$checks++;if(!$ok)throw new RuntimeException('FAIL '.$label);echo 'PASS '.$label."\n";}
function publishReject(callable $fn,string $code,string $label):void {
    try{$fn();}catch(OperationException $e){publishCheck($e->errorCode===$code,$label.' ('.$e->errorCode.')');return;}
    publishCheck(false,$label);
}
function jsonResponse(mixed $data,int $status=200):void {$GLOBALS['publish_endpoint_response']=[$data,$status];}
function getJsonBody():array {return $GLOBALS['publish_endpoint_input']??[];}
function publishDiff():array {
    $_REQUEST['_route_method']='GET';$_REQUEST['_route_path']='/preview/diff';$_REQUEST['_user']=['id'=>1];
    require dirname(__DIR__).'/api/endpoints/preview.php';
    return $GLOBALS['publish_endpoint_response'][0]['data'];
}
function publishFixture(int $budget=20,?\Closure $hook=null,?string $givenRoot=null):array {
    if((new ReflectionMethod(FileManager::class,'__construct'))->getNumberOfParameters()<2)throw new RuntimeException('Missing isolated FileManager constructor.');
    $root=$givenRoot??sys_get_temp_dir().'/vs-mcp-publish-'.bin2hex(random_bytes(8));
    foreach(['draft/assets','live/assets','private/actions'] as $path)mkdir($root.'/'.$path,0700,true);
    $root=realpath($root);
    if(!$root || !str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-mcp-publish-'))throw new RuntimeException('Fixture root must be canonical and temporary.');
    foreach(['VS_TEST_PREVIEW_DIR'=>$root.'/draft','VS_TEST_DOC_ROOT'=>$root.'/live','VS_TEST_ASSETS_DIR'=>$root.'/live/assets',
        'VS_TEST_MUTATION_LOCK'=>$root.'/private/site.lock','VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/private/workspace',
        'VS_TEST_REVISIONS_DIR'=>$root.'/private/revisions','VS_TEST_SNAPSHOT_DIR'=>$root.'/private/snapshots'] as $key=>$value)putenv($key.'='.$value);
    foreach(['logDir'=>$root.'/private','initialized'=>true] as $key=>$value)(new ReflectionProperty(Logger::class,$key))->setValue(null,$value);
    Database::resetInstance();$db=Database::getInstance($root.'/private/studio.db');
    (new Migrator($db,new Settings($db)))->run();
    $db->insert('users',['id'=>1,'email'=>'publish@example.invalid','name'=>'Publish fixture','role'=>'owner','password_hash'=>'unusable','created_at'=>now(),'updated_at'=>now()]);
    $db->update('site_workspace_state',['format'=>2],'id = 1');
    file_put_contents($root.'/draft/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
    mcpCopyFixture(__DIR__.'/fixtures/mcp/site-lifecycle/site',$root.'/draft');
    $workspace=new SiteWorkspace($db,$root.'/draft',$root.'/live',$root.'/private/workspace',$root.'/live/assets');
    $fm=new FileManager($db,$workspace);$fm->syncPageRegistry(true);
    $policy=new ActorPolicy($db);$owner=new OperationActor('user',1,null,[],'studio_configured',null);
    $credentials=new CredentialService($db);$key=$credentials->create($owner,1,'publish','Publish fixture',null);
    $actor=$policy->fromCredential($key['id']);
    (new Settings($db))->set('site_url','https://fixture.invalid');
    $releases=new ReleaseStore($db,$policy,$root.'/private/releases');
    $operations=new OperationStore($db,$policy,$workspace->mutationLockPath());
    $service=new PublishPlanService($db,$policy,$workspace,$releases,$operations,$root.'/private/actions',$root.'/private/published-manifest.json',$budget,$hook);
    return compact('root','db','workspace','policy','credentials','owner','actor','releases','operations','service');
}
function publishReopen(string $root):array {
    foreach(['VS_TEST_PREVIEW_DIR'=>$root.'/draft','VS_TEST_DOC_ROOT'=>$root.'/live','VS_TEST_ASSETS_DIR'=>$root.'/live/assets',
        'VS_TEST_MUTATION_LOCK'=>$root.'/private/site.lock','VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/private/workspace',
        'VS_TEST_REVISIONS_DIR'=>$root.'/private/revisions','VS_TEST_SNAPSHOT_DIR'=>$root.'/private/snapshots'] as $key=>$value)putenv($key.'='.$value);
    foreach(['logDir'=>$root.'/private','initialized'=>true] as $key=>$value)(new ReflectionProperty(Logger::class,$key))->setValue(null,$value);
    Database::resetInstance();$db=Database::getInstance($root.'/private/studio.db');
    $workspace=new SiteWorkspace($db,$root.'/draft',$root.'/live',$root.'/private/workspace',$root.'/live/assets');
    $policy=new ActorPolicy($db);$actor=$policy->fromCredential(1);
    $releases=new ReleaseStore($db,$policy,$root.'/private/releases');
    $operations=new OperationStore($db,$policy,$workspace->mutationLockPath());
    $service=new PublishPlanService($db,$policy,$workspace,$releases,$operations,$root.'/private/actions',$root.'/private/published-manifest.json',2);
    return compact('root','db','workspace','policy','actor','releases','operations','service');
}
function publishPrepare(array $f,string $request='publish-review-001'):array {
    return $f['service']->prepare($f['actor'],(object)['request_id'=>$request,'base_draft_version'=>'draft:'.$f['workspace']->status()['draft_version']]);
}
function publishInput(array $plan,string $id='publish-operation-001'):stdClass {
    return (object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest'],'operation_id'=>$id];
}
function publishComplete(array $f,array $plan,string $id='publish-operation-001'):array {
    $result=$f['service']->publish($f['actor'],publishInput($plan,$id));
    $steps=0;
    while($result['status']==='applying' && $steps++<100)$result=$f['service']->continue($f['actor'],$id,$result['checkpoint']);
    return $result;
}

if(defined('MCP_PUBLISH_FIXTURE_ONLY'))return;

if(($argv[1]??'')==='--crash') {
    [$phase,$root]=array_slice($argv,2);
    $f=publishFixture(100,function($seen)use($phase):void{if($seen===$phase)posix_kill(getmypid(),SIGKILL);},$root);
    $plan=publishPrepare($f);
    file_put_contents($f['root'].'/private/crash-plan.json',json_encode($plan,JSON_THROW_ON_ERROR));
    publishComplete($f,$plan);
    exit(3);
}

try {
    foreach(['prepare','get'] as $method){JsonSchema::assertSupported(PublishPlanService::inputSchema($method));JsonSchema::assertSupported(PublishPlanService::outputSchema($method));}
    JsonSchema::assertSupported(PublishPlanService::inputSchema('publish'));JsonSchema::assertSupported(PublishPlanService::resultSchema());
    $f=publishFixture(2);
    $liveBefore=SiteWorkspace::inventory($f['root'].'/live');
    $draftBefore=WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace']));
    $pagesBefore=$f['db']->query('SELECT * FROM pages ORDER BY id');
    $plan=publishPrepare($f);
    JsonSchema::validate(JsonSchema::output($plan),PublishPlanService::outputSchema('prepare'));
    publishCheck($plan['status']==='ready' && strlen($plan['digest'])===64,'Review seals an exact candidate digest');
    publishCheck(SiteWorkspace::inventory($f['root'].'/live')===$liveBefore,'Preparing a release leaves published bytes untouched');
    publishCheck(WorkspaceFiles::hashes(WorkspaceFiles::read($f['workspace']))===$draftBefore && $f['db']->query('SELECT * FROM pages ORDER BY id')===$pagesBefore,'Publish generators leave draft source and page metadata untouched');
    foreach(['assets/css/tailwind.css','mcp.php','robots.txt','sitemap.xml','_partials/schema.php','submit.php'] as $path) {
        publishCheck(in_array($path,array_column($plan['files'],'path'),true),'Review contains generated '.$path);
    }
    publishCheck(CanonicalJson::digest(publishPrepare($f))===CanonicalJson::digest($plan),'Preparation retry returns the retained review');
    $first=$f['service']->publish($f['actor'],publishInput($plan));
    publishCheck($first['status']==='applying' && $first['checkpoint']===1 && $f['workspace']->status()['reservation_operation_id']!==null,'Bounded publish reserves the workspace across requests');
    publishCheck(CanonicalJson::digest($first)===CanonicalJson::digest($f['service']->publish($f['actor'],publishInput($plan))),'Start retry does not advance a checkpoint');
    $done=publishComplete($f,$plan);
    JsonSchema::validate(JsonSchema::output($done['result']),PublishPlanService::resultSchema());
    publishCheck($done['status']==='succeeded' && str_starts_with($done['result']['release_id'],'release_'),'Continuation finishes and retains a release ID');
    publishCheck($f['workspace']->status()['reservation_operation_id']===null && $f['workspace']->status()['draft_version']===0,'Publish releases reservation without modifying draft version');
    publishCheck($f['db']->query('SELECT * FROM pages ORDER BY id')===$pagesBefore,'Publication preserves draft page metadata');
    $retained=$f['releases']->get($f['actor'],$plan['plan_id']);
    foreach($retained['manifest']['after'] as $path=>$hash)publishCheck(hash_file('sha256',$f['workspace']->resolvePublished($path))===$hash,'Installed bytes match review: '.$path);
    publishCheck(CanonicalJson::digest($done)===CanonicalJson::digest(publishComplete($f,$plan)) && (int)$f['db']->scalar('SELECT COUNT(*) FROM site_releases')===1,'Lost response retry returns the same committed release');
    file_put_contents($f['root'].'/live/hosting-document.txt','Unrelated hosting file');
    unlink($f['root'].'/draft/about.php');
    $f['db']->update('site_workspace_state',['draft_version'=>1],'id = 1');
    $removed=publishPrepare($f,'publish-review-002');
    publishCheck(in_array('about.php',$removed['deletions'],true) && is_file($f['root'].'/live/about.php'),'Deleted draft page remains live until its publish plan applies');
    $releaseTwo=publishComplete($f,$removed,'publish-operation-002');
    publishCheck($releaseTwo['status']==='succeeded' && !file_exists($f['root'].'/live/about.php')
        && file_get_contents($f['root'].'/live/hosting-document.txt')==='Unrelated hosting file','Managed deletion preserves unrelated hosting files');

    $f=publishFixture();file_put_contents($f['root'].'/live/index.php','Unowned existing homepage');
    publishReject(fn()=>publishPrepare($f),'ownership_conflict','Unproven existing destinations cannot be adopted silently');
    publishCheck(file_get_contents($f['root'].'/live/index.php')==='Unowned existing homepage','Ownership rejection leaves existing live bytes unchanged');
    file_put_contents($f['root'].'/private/published-manifest.json','{"files":["index.php"]}');
    $plan=publishPrepare($f,'publish-review-legacy');
    publishCheck($plan['files'][array_search('index.php',array_column($plan['files'],'path'))]['before_hash']===hash('sha256','Unowned existing homepage'),'Validated legacy manifest proves bounded ownership');
    file_put_contents($f['root'].'/live/index.php','Changed after review');
    $stale=publishComplete($f,$plan);
    publishCheck($stale['status']==='failed_restored' && $stale['result']['error']['code']==='content_conflict'
        && file_get_contents($f['root'].'/live/index.php')==='Changed after review','Changed live precondition rejects before mutation');

    $f=publishFixture();$plan=publishPrepare($f);file_put_contents($f['root'].'/draft/index.php','Changed draft');
    $stale=publishComplete($f,$plan);
    publishCheck($stale['status']==='failed_restored' && !file_exists($f['root'].'/live/index.php'),'Out-of-band draft changes invalidate review');
    $f=publishFixture();$plan=publishPrepare($f);(new Settings($f['db']))->set('site_url','https://changed.invalid');
    publishCheck(publishComplete($f,$plan)['status']==='failed_restored','Changed generation configuration invalidates review');
    $f=publishFixture();$plan=publishPrepare($f);$input=publishInput($plan);$input->digest=str_repeat('a',64);
    publishCheck($f['service']->publish($f['actor'],$input)['status']==='failed_restored','Publish requires the exact reviewed digest');
    $f=publishFixture();$plan=publishPrepare($f);file_put_contents($f['releases']->stage($plan['plan_id']).'/candidate/index.php','Tampered');
    publishCheck(publishComplete($f,$plan)['status']==='failed_restored','Corrupted retained candidate cannot publish');
    $f=publishFixture(20,function($phase):void{if($phase==='after_file')throw new RuntimeException('Injected copy failure');});
    file_put_contents($f['root'].'/live/index.php','Original home');
    file_put_contents($f['root'].'/private/published-manifest.json','{"files":["index.php"]}');
    $before=SiteWorkspace::inventory($f['root'].'/live');$plan=publishPrepare($f);
    $failed=publishComplete($f,$plan);
    publishCheck($failed['status']==='failed_restored' && SiteWorkspace::inventory($f['root'].'/live')['files']===$before['files'],'Partial copy failure restores and verifies original live files');
    $f=publishFixture();$plan=publishPrepare($f);
    $f['db']->update('agent_publish_plans',['expires_at'=>time()-1],'id = ?',[$plan['plan_id']]);
    publishCheck(publishComplete($f,$plan)['status']==='failed_restored','Expired review cannot start publication');
    $f=publishFixture();$plan=publishPrepare($f);
    $other=$f['credentials']->create($f['owner'],1,'publish','Other connection',null);
    publishReject(fn()=>$f['service']->get($f['policy']->fromCredential($other['id']),$plan['plan_id']),'permission_denied','A second connection cannot inspect another publish candidate');
    $f['db']->update('users',['role'=>'viewer'],'id = 1');
    publishReject(fn()=>publishComplete($f,$plan),'permission_denied','Current role ceiling prevents publishing an older prepared plan');
    $f=publishFixture();$plan=publishPrepare($f);
    $f['db']->update('api_keys',['scopes'=>json_encode(['files:read'])],'id = ?',[$f['actor']->credentialId]);
    publishReject(fn()=>publishComplete($f,$plan),'permission_denied','Scope narrowing applies to a retained publish plan');
    foreach(['_studio/mcp.php','_data/actions.db','.htaccess','assets/library/gallery/example.jpg','LocalValetDriver.php','../index.php'] as $path) {
        publishReject(fn()=>PublishPlanService::destination($path),'invalid_path','Protected destination rejected: '.$path);
    }
    $f=publishFixture();$plan=publishPrepare($f);
    publishReject(fn()=>$f['service']->prepare($f['actor'],(object)['request_id'=>'publish-review-001','base_draft_version'=>'draft:2']),'idempotency_conflict','Request identity cannot be reused for a different publication');
    $f=publishFixture(1);$plan=publishPrepare($f);$pending=$f['service']->publish($f['actor'],publishInput($plan));
    $f['db']->update('agent_publish_plans',['expires_at'=>time()-1],'id = ?',[$plan['plan_id']]);
    publishCheck(publishComplete($f,$plan)['status']==='succeeded','Review expiry never strands an already started publication');
    $f=publishFixture(1);$plan=publishPrepare($f);$pending=$f['service']->publish($f['actor'],publishInput($plan));
    $f['credentials']->revoke($f['owner'],$f['actor']->credentialId);
    publishReject(fn()=>$f['service']->continue($f['actor'],'publish-operation-001',$pending['checkpoint']),'permission_denied','Revocation stops further publication checkpoints');
    publishCheck($f['workspace']->status()['reservation_operation_id']!==null,'Revoked unfinished publication retains its recovery reservation');

    $f=publishFixture(100,function($phase,$operation):void {
        if($phase!=='after_file')return;
        global $f,$plan;
        $original=$f['releases']->stage($plan['plan_id']).'/before/index.php';
        if(is_file($original))file_put_contents($original,'Corrupt recovery original');
        throw new RuntimeException('Injected unavailable original');
    });
    file_put_contents($f['root'].'/live/index.php','Original homepage');
    file_put_contents($f['root'].'/private/published-manifest.json','{"files":["index.php"]}');
    $plan=publishPrepare($f);$failed=publishComplete($f,$plan);
    publishCheck($failed['status']==='recovery_required' && $f['workspace']->status()['reservation_operation_id']!==null,'Missing recovery original reports incomplete restoration and retains reservation');
    file_put_contents($f['releases']->stage($plan['plan_id']).'/before/index.php','Original homepage');
    $grants=$f['actor']->scopes;$grants[]='restore:live';
    $f['db']->update('api_keys',['scopes'=>json_encode($grants)],'id = ?',[$f['actor']->credentialId]);
    $repaired=$f['service']->recover($f['policy']->fromCredential($f['actor']->credentialId),'publish-operation-001');
    publishCheck($repaired['status']==='failed_restored' && $f['workspace']->status()['reservation_operation_id']===null,'Explicit authorized recovery verifies repaired originals and clears reservation');

    $f=publishFixture(2);
    mkdir($f['root'].'/live/assets/library',0700,true);file_put_contents($f['root'].'/live/assets/library/shared.svg','<svg/>');
    file_put_contents($f['root'].'/private/actions/book.json',json_encode(['id'=>'book','name'=>'Book','active'=>true,'fields'=>[]]));
    $plan=publishPrepare($f);
    publishCheck(in_array('actions/manifest.json',array_column($plan['files'],'path'),true)
        && in_array('actions-bar.js',array_column($plan['files'],'path'),true),'Active Actions artifacts are staged and reviewed before publication');
    publishCheck(!in_array('assets/library/shared.svg',array_column($plan['files'],'path'),true),'Immutable shared library bytes are never repackaged');
    file_put_contents($f['root'].'/private/actions/book.json','{"id":"book","name":"Changed","active":true,"fields":[]}');
    publishCheck(publishComplete($f,$plan)['status']==='failed_restored','Changed immediate Action definitions invalidate sealed publish artifacts');
    $f=publishFixture();
    file_put_contents($f['root'].'/private/actions/book.json','{"id":"book","name":"Book","active":true,"fields":[]}');
    $site=json_decode(file_get_contents($f['root'].'/draft/assets/data/site.json'),true);
    $site['name']='Second isolated candidate';
    file_put_contents($f['root'].'/draft/assets/data/site.json',json_encode($site));
    $plan=publishPrepare($f);
    $actionManifest=json_decode(file_get_contents($f['releases']->stage($plan['plan_id']).'/candidate/actions/manifest.json'),true);
    publishCheck($actionManifest['site_name']==='Second isolated candidate','Action generation cannot reuse site data cached by a previous staged root');
    $f=publishFixture(2);
    $adapter=new \VoxelSite\PublishService($f['db'],new Settings($f['db']),$f['workspace'],$f['service']);
    $request=['operation_id'=>'studio-publish-001'];
    $result=$adapter->publish(false,'studio',$f['owner'],$request);
    publishCheck($result['operation']['status']==='applying' && $result['recovery_snapshot_required'],'Studio publish keeps bounded steps and mandatory recovery when optional snapshot is disabled');
    publishCheck(CanonicalJson::digest($result)===CanonicalJson::digest($adapter->publish(false,'studio',$f['owner'],$request)),'Studio retry returns existing checkpoint without preparing another candidate');
    while($result['operation']['status']==='applying')$result=$adapter->publish(false,'studio',$f['owner'],$request+['checkpoint'=>$result['operation']['checkpoint']]);
    publishCheck($result['operation']['status']==='succeeded' && isset($result['message'],$result['published'],$result['removed'],$result['errors'])
        && $result['snapshot_id']!==null,'Studio response retains legacy fields and verified recovery identity');
    publishCheck((new Settings($f['db']))->get('publish_count')===1,'Publication metadata commits once with the durable result');
    publishCheck(publishDiff()['has_changes']===false,'Studio diff compares retained source, ignoring sealed generation differences');
    file_put_contents($f['root'].'/draft/index.php',file_get_contents($f['root'].'/draft/index.php')."\n<!-- pending -->");
    publishCheck(publishDiff()['has_changes']===true,'Studio diff detects a later draft edit after exact publication');
    publishReject(fn()=>$adapter->publish(false,'api'),'credential_migration_required','Shared publish adapter never infers an account for an unbound caller');
    $f=publishFixture();
    $restId=$f['db']->insert('api_keys',['key_hash'=>hash('sha256','fixture-rest-key'),'key_prefix'=>'vxs_fixture','label'=>'REST fixture',
        'role'=>'agent','scopes'=>'["publish:trigger"]','rate_limit'=>100,'created_at'=>now(),'audience'=>'rest']);
    publishReject(fn()=>$f['policy']->fromRestCredential($restId),'credential_migration_required','Unbound legacy REST credentials must be explicitly connected to an account');
    $f['policy']->bindRestCredential($f['owner'],$restId,1);
    $restActor=$f['policy']->fromRestCredential($restId);
    $adapter=new \VoxelSite\PublishService($f['db'],new Settings($f['db']),$f['workspace'],$f['service']);
    $beforeMissingId=SiteWorkspace::inventory($f['root'].'/live');
    publishReject(fn()=>$adapter->publish(false,'api',$restActor),'invalid_schema','REST publish requires a stable caller operation ID');
    publishCheck(SiteWorkspace::inventory($f['root'].'/live')===$beforeMissingId && $f['db']->count('agent_operations')===0,
        'A missing REST publish identity creates no operation and changes no live bytes');
    $request=['operation_id'=>'rest-publish-001'];
    $result=$adapter->publish(false,'api',$restActor,$request);
    while($result['operation']['status']==='applying')$result=$adapter->publish(false,'api',$restActor,$request+['checkpoint'=>$result['operation']['checkpoint']]);
    publishCheck($result['operation']['status']==='succeeded' && $result['actor']['type']==='rest_key'
        && $result['actor']['credential_id']===$restId,'Bound REST publish uses its own credential attribution and the shared exact service');
    $publishedCount=(new Settings($f['db']))->get('publish_count');
    publishCheck($adapter->publish(false,'api',$restActor,$request)===$result
        && (new Settings($f['db']))->get('publish_count')===$publishedCount,
        'REST publication replay retains the same release and publication count');
    $f=publishFixture();$settings=new Settings($f['db']);
    foreach(['router_enabled','evaluator_enabled','design_critic_enabled'] as $key)$settings->set($key,true);
    $plan=publishPrepare($f);
    publishCheck(publishComplete($f,$plan)['result']['provider_calls']===0,'Publishing remains provider-free when routing and review settings are enabled');
    $f=publishFixture();
    foreach(\VoxelSite\ShippedSiteProvenance::FILES as $path=>$expected) {
        $packaged=dirname(__DIR__,2).'/'.$path;
        publishCheck(hash_file('sha256',$packaged)===$expected,'Reviewed package baseline matches '.$path);
        copy($packaged,$f['root'].'/live/'.$path);
    }
    \VoxelSite\ShippedSiteProvenance::capture($f['db'],$f['workspace']);
    publishCheck(count(\VoxelSite\ShippedSiteProvenance::verified($f['db'],$f['workspace']))===2,'Fresh installer records only exact known shipped bootstrap files');
    $plan=publishPrepare($f);
    publishCheck(publishComplete($f,$plan)['status']==='succeeded','First publication can replace verified shipped homepage and form handler');
    $f=publishFixture();
    copy(dirname(__DIR__,2).'/index.php',$f['root'].'/live/index.php');
    \VoxelSite\ShippedSiteProvenance::capture($f['db'],$f['workspace']);
    file_put_contents($f['root'].'/live/index.php','Customer hosting homepage after installation');
    publishReject(fn()=>publishPrepare($f),'ownership_conflict','Changed bootstrap bytes lose their shipped provenance before ownership');
    $f=publishFixture();
    mkdir($f['root'].'/live/assets/files',0700,true);$large=str_repeat('x',20*1048576);$paths=[];
    for($i=0;$i<5;$i++){$path='assets/files/large-'.$i.'.txt';file_put_contents($f['root'].'/live/'.$path,$large);$paths[]=$path;}
    unset($large);
    file_put_contents($f['root'].'/private/published-manifest.json',json_encode(['files'=>$paths]));
    publishReject(fn()=>publishPrepare($f),'size_limit','Cumulative recovery quota rejects before the next oversized retain write');
    $row=$f['db']->queryOne('SELECT id FROM agent_publish_plans');
    $retainedBytes=0;
    foreach(SiteWorkspace::inventory($f['releases']->stage($row['id']))['files'] as $path=>$unused)$retainedBytes+=filesize($f['releases']->stage($row['id']).'/'.$path);
    publishCheck($retainedBytes<=2*PublishPlanService::MAX_BYTES,'Failed preparation never exceeds its candidate and recovery byte reservation');

    $f=publishFixture();
    WorkspaceFiles::write($f['root'].'/draft','_root/robots.txt',"User-agent: *\nDisallow: /private\n");
    WorkspaceFiles::write($f['root'].'/draft','_root/llms.txt',"# Explicit site policy\nOwner reviewed content.\n");
    $plan=publishPrepare($f);JsonSchema::validate(json_decode(json_encode($plan)),PublishPlanService::outputSchema('prepare'));
    publishCheck($plan['seo_policy']===['llms.txt'=>'preserved_draft_override','robots.txt'=>'preserved_draft_override'],'Publish review discloses preserved SEO override policy');
    $seoEntries=array_filter($plan['files'],fn($entry)=>in_array($entry['path'],['robots.txt','llms.txt'],true));
    publishCheck(count($seoEntries)===2 && !array_filter($seoEntries,fn($entry)=>$entry['generated']),'Preserved SEO bytes are not falsely labeled generated');
    $result=publishComplete($f,$plan);
    publishCheck($result['status']==='succeeded' && file_get_contents($f['root'].'/live/robots.txt')===file_get_contents($f['root'].'/draft/_root/robots.txt') && file_get_contents($f['root'].'/live/llms.txt')===file_get_contents($f['root'].'/draft/_root/llms.txt'),'Publication preserves complete exact SEO override files');
    publishCheck(!is_dir($f['root'].'/live/_root') && !in_array('robots.txt',$result['result']['aeo_files'],true),'Private SEO namespace is not published and preservation is not claimed as AEO generation');

    if(function_exists('posix_kill') && defined('SIGKILL'))foreach(['after_capture','after_file','after_commit'] as $phase) {
        $path=sys_get_temp_dir().'/vs-mcp-publish-'.bin2hex(random_bytes(8));
        $proc=proc_open([PHP_BINARY,__FILE__,'--crash',$phase,$path],[['pipe','r'],['pipe','w'],['pipe','w']],$pipes);
        fclose($pipes[0]);$out=stream_get_contents($pipes[1]);fclose($pipes[1]);$err=stream_get_contents($pipes[2]);fclose($pipes[2]);$status=proc_close($proc);
        publishCheck($status!==0 && is_file($path.'/private/crash-plan.json'),'Worker was interrupted at '.$phase);
        $f=publishReopen(realpath($path));$plan=json_decode(file_get_contents($path.'/private/crash-plan.json'),true,64,JSON_THROW_ON_ERROR);
        $row=$f['operations']->get($f['actor'],'publish-operation-001');
        if($row['state']==='applying') {
            $f['db']->update('agent_operations',['lease_expires_at'=>time()-1],'id = ?',[$row['id']]);
            $continued=$f['service']->continue($f['actor'],'publish-operation-001',$row['checkpoint_number']);
            while($continued['status']==='applying')$continued=$f['service']->continue($f['actor'],'publish-operation-001',$continued['checkpoint']);
        } else $continued=publishComplete($f,$plan);
        publishCheck($continued['status']==='succeeded' && (int)$f['db']->scalar('SELECT COUNT(*) FROM site_releases')===1,'Interrupted '.$phase.' resumes or returns exactly one verified release');
    }
    echo "MCP publish: {$checks} checks, 0 failures\n";
}catch(Throwable $e){fwrite(STDERR,$e->getMessage()."\n".$e->getTraceAsString()."\n");exit(1);}
