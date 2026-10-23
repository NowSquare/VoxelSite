<?php
declare(strict_types=1);
require_once __DIR__.'/helpers/lifecycle-provider-trap.php';
$GLOBALS['lifecycle_provider_attempts']=0;
require_once dirname(__DIR__).'/engine/bootstrap.php';
use VoxelSite\Agent\{ActorPolicy, CanonicalJson, CapabilityCatalog, CredentialService, McpApplication, OperationActor,
    ProtocolProfile, ProviderCallForbidden, ProviderCallPolicy, WorkspaceFiles};
use VoxelSite\{Database, Encryption, FileManager, Logger, Migrator, Settings, SiteWorkspace};

$checks=0;
function appCheck(bool $ok,string $label):void {
    global $checks;$checks++;
    if (!$ok) throw new RuntimeException('FAIL '.$label);
    echo 'PASS '.$label."\n";
}
appCheck((new ReflectionMethod(FileManager::class,'__construct'))->getNumberOfParameters()>=2,
    'Application test requires workspace injection before creating a fixture');
$root=sys_get_temp_dir().'/vs-mcp-app-'.bin2hex(random_bytes(6));
foreach (['draft/assets','live/assets','private'] as $directory) mkdir($root.'/'.$directory,0700,true);
$root=realpath($root);
foreach (['VS_TEST_PREVIEW_DIR'=>$root.'/draft','VS_TEST_DOC_ROOT'=>$root.'/live',
    'VS_TEST_ASSETS_DIR'=>$root.'/live/assets','VS_TEST_MUTATION_LOCK'=>$root.'/private/site.lock',
    'VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/private/workspace','VS_TEST_REVISIONS_DIR'=>$root.'/private/revisions'] as $key=>$value) {
    putenv($key.'='.$value);
}
foreach (['logDir'=>$root.'/private','initialized'=>true] as $property=>$value) {
    (new ReflectionProperty(Logger::class,$property))->setValue(null,$value);
}
$db=Database::getInstance($root.'/private/studio.db');
(new Migrator($db,new Settings($db)))->run();
$db->insert('users',['email'=>'application@example.invalid','password_hash'=>'not-a-login','role'=>'owner',
    'name'=>'Application fixture','created_at'=>now(),'updated_at'=>now()]);
$db->update('site_workspace_state',['format'=>2],'id = 1');
file_put_contents($root.'/draft/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
file_put_contents($root.'/live/hosting.txt','Untouched hosting file');
$settings=new Settings($db);$settings->set('site_url','https://fixture.invalid/subdirectory');
$profile=getenv('VS_MCP_LIFECYCLE_PROFILE')?:'empty';
if (!in_array($profile,['empty','configured'],true)) throw new RuntimeException('Unknown lifecycle test profile.');
if ($profile==='configured') {
    $encryption=new Encryption(Encryption::generateKey());
    foreach (['claude','openai','gemini','deepseek','openai_compatible'] as $provider)
        $settings->set('ai_'.$provider.'_api_key',$encryption->encrypt('sk-fixture-provider-key-never-send'));
    $settings->setMany(['ai_provider'=>'openai','ai_model'=>'fixture-model','evaluator_enabled'=>true,
        'design_review_enabled'=>true,'governor.mode'=>'enforce','governor.typesafe_api_key'=>$encryption->encrypt('fixture-router-key')]);
}
$providerSettings=$db->query("SELECT * FROM settings WHERE key LIKE 'ai_%' OR key LIKE 'governor.%' OR key IN ('evaluator_enabled','design_review_enabled') ORDER BY key");
$workspace=new SiteWorkspace($db,$root.'/draft',$root.'/live',$root.'/private/workspace',$root.'/live/assets');
$policy=new ActorPolicy($db);$credentials=new CredentialService($db);
$owner=new OperationActor('user',1,null,[],'studio_configured',null);
$key=$credentials->create($owner,1,'publish','Application test',null,null,['restore:live','unpublish:write']);
$readKey=$credentials->create($owner,1,'read','Read-only test',null);
$applicationKey=Encryption::generateKey();
$server=McpApplication::create($db,['app_key'=>$applicationKey],$workspace,$root.'/private/agent');
$requestNumber=0;$providerGuards=0;
$call=function(string $method,array $params=[],?array $credential=null,string $version=ProtocolProfile::COMPATIBILITY)
    use($server,$credentials,$key,&$requestNumber,&$providerGuards):array {
    $credential??=$key;
    $headers=['Content-Type'=>'application/json','Accept'=>'application/json, text/event-stream',
        'Authorization'=>'Bearer '.$credential['key'],'MCP-Protocol-Version'=>$version];
    if ($version===ProtocolProfile::CURRENT) {
        $params['_meta']=(object)[ProtocolProfile::VERSION_META=>$version,ProtocolProfile::CAPABILITIES_META=>(object)[],
            ProtocolProfile::CLIENT_META=>(object)['name'=>'Synthetic PHP integration','version'=>'1']];
        $headers['Mcp-Method']=$method;
        if ($method==='tools/call') $headers['Mcp-Name']=$params['name'];
    }
    $request=['jsonrpc'=>'2.0','id'=>++$requestNumber,'method'=>$method,'params'=>(object)$params];
    $response=$server->handle('POST',$headers,json_encode($request,JSON_THROW_ON_ERROR),
        function(string $token) use($credentials,&$providerGuards):OperationActor {
            try {ProviderCallPolicy::assertAllowed('integration-test');}
            catch (ProviderCallForbidden) {$providerGuards++;}
            $_SERVER['HTTP_AUTHORIZATION']='Bearer '.$token;
            try {return $credentials->authenticate();}
            finally {unset($_SERVER['HTTP_AUTHORIZATION']);}
        });
    return json_decode(json_encode($response,JSON_THROW_ON_ERROR),true,128,JSON_THROW_ON_ERROR);
};
$tool=function(string $name,array|stdClass $arguments=[],?array $credential=null) use($call,$server,$policy,$key):array {
    $response=$call('tools/call',['name'=>$name,'arguments'=>(object)$arguments],$credential);
    if ($response['status']!==200 || ($response['body']['result']['isError']??true)) {
        // Expose the underlying contract violation only inside the fixture.
        $resolver=(new ReflectionProperty($server,'handlerResolver'))->getValue($server);
        $registry=(new ReflectionProperty($server,'registry'))->getValue($server);
        $registry->dispatch($name,(object)$arguments,$policy->fromCredential(($credential??$key)['id']),$policy,$resolver);
        throw new RuntimeException('Unexpected tool response: '.json_encode($response,JSON_THROW_ON_ERROR));
    }
    return $response['body']['result']['structuredContent'];
};
foreach (ProtocolProfile::versions() as $version) {
    $listed=$call('tools/list',[],null,$version);
    appCheck($listed['status']===200 && count($listed['body']['result']['tools'])===count(CapabilityCatalog::core()->visible($policy->fromCredential($key['id']),$policy)),
        $version.': real catalog advertises every authorized tool');
}
$visible=$call('tools/list',[],$readKey)['body']['result']['tools'];
appCheck(!in_array('voxelsite_changes_apply',array_column($visible,'name'),true),'Read connection never advertises draft application');
$denied=$call('tools/call',['name'=>'voxelsite_changes_apply','arguments'=>(object)[]],$readKey);
appCheck($denied['status']===403,'Dispatch rechecks mutation authority before parsing mutation arguments');
$site=$tool('voxelsite_site_get');
appCheck($site['workspace_ready'] && $site['draft_version']==='draft:0' && $site['page_count']===0,'Site summary exposes initial state and typed limits');
$context=$tool('voxelsite_site_context',['max_bytes'=>8192]);
appCheck($context['provider_calls']===0 && count($context['rules'])===4,'Real context passes its advertised result schema');
$rules=$context['rules'][0];
$rule=$tool('voxelsite_rules_read',['action'=>$context['action'],'kind'=>$rules['kind'],'digest'=>$rules['sha256']]);
appCheck($rule['sha256']===$rules['sha256'] && $rule['content']!=='','Canonical rule references can be read through the advertised tool');
$brief=$tool('voxelsite_authoring_brief',['request_id'=>'application-brief-001','action'=>'create_site']);
appCheck($brief['direction']!==null && $brief['base_draft_version']==='draft:0','External authoring retains a typed design direction');
appCheck($tool('voxelsite_authoring_get',['brief_id'=>$brief['brief_id']])===$brief,'Retained brief retrieval matches its original response');
$fixture=__DIR__.'/fixtures/mcp/site-lifecycle/site';
$image=file_get_contents($fixture.'/assets/images/workshop.png');
$upload=$tool('voxelsite_assets_upload_begin',['request_id'=>'application-upload-001','path'=>'assets/images/workshop.png',
    'bytes'=>strlen($image),'sha256'=>hash('sha256',$image),'mime_type'=>'image/png']);
$chunk=$tool('voxelsite_assets_upload_chunk',['request_id'=>'application-chunk-001','upload_id'=>$upload['upload_id'],
    'offset'=>0,'data_base64'=>base64_encode($image),'sha256'=>hash('sha256',$image)]);
appCheck($chunk['next_offset']===strlen($image),'Chunked asset tool acknowledges exact received bytes');
$asset=$tool('voxelsite_assets_upload_finish',['request_id'=>'application-finish-001','upload_id'=>$upload['upload_id']]);
appCheck($asset['status']==='finalized' && !file_exists($root.'/draft/assets/images/workshop.png'),
    'Finalized upload remains outside draft and public files');
$operations=[];
foreach (SiteWorkspace::inventory($fixture)['files'] as $path=>$unused) {
    if ($path==='assets/images/workshop.png') {
        $operations[]=(object)['type'=>'attach_asset','path'=>$path,'expected_hash'=>null,'upload_id'=>$asset['upload_id']];
    } elseif (in_array($path,['assets/data/memory.json','assets/data/design-intelligence.json'],true)) {
        $operations[]=(object)['type'=>'merge','path'=>$path,'expected_hash'=>null,
            'delta'=>(object)['set'=>json_decode(file_get_contents($fixture.'/'.$path)),'remove'=>[]]];
    } else {
        $operations[]=(object)['type'=>'create','path'=>$path,'expected_hash'=>null,'content'=>file_get_contents($fixture.'/'.$path)];
    }
}
$live=SiteWorkspace::inventory($root.'/live');
$review=$tool('voxelsite_changes_prepare',['request_id'=>'application-review-001','base_draft_version'=>'draft:0',
    'brief_id'=>$brief['brief_id'],'summary'=>'Create complete application fixture','operations'=>$operations]);
appCheck($tool('voxelsite_changes_get',['change_set_id'=>$review['change_set_id']])===$review,'Prepared review is immutable through MCP retrieval');
$diff=$tool('voxelsite_changes_diff',['change_set_id'=>$review['change_set_id'],'path'=>'assets/css/tailwind.css','max_bytes'=>2048]);
appCheck($diff['sides']['after']['truncated'],'Exact generated CSS review exposes source continuation');
$input=['change_set_id'=>$review['change_set_id'],'digest'=>$review['digest'],'operation_id'=>'application-apply-001'];
$applied=$tool('voxelsite_changes_apply',$input);
for ($i=0;$applied['status']==='applying' && $i<20;$i++) {
    $applied=$tool('voxelsite_operations_continue',['operation_id'=>$input['operation_id'],'checkpoint'=>$applied['checkpoint']]);
}
appCheck($applied['status']==='succeeded' && $applied['result']['provider_calls']===0,'Real MCP dispatch creates the complete three-page draft');
appCheck($tool('voxelsite_operations_get',['operation_id'=>$input['operation_id']])===$applied,
    'Operation status exposes the retained result without private lease or recovery internals');
appCheck($tool('voxelsite_changes_apply',$input)===$applied && $db->scalar('SELECT COUNT(*) FROM revisions')===1,
    'Wire-level apply replay creates no second revision');
$files=$tool('voxelsite_files_list',['limit'=>2]);
appCheck($files['truncated'] && $files['next_offset']===2,'Bounded source inventory reports explicit continuation');
$page=$tool('voxelsite_files_read',['path'=>'index.php','max_bytes'=>64]);
appCheck($page['truncated'] && $page['draft_version']==='draft:1','Source read returns committed draft version and hash');
$search=$tool('voxelsite_files_search',['query'=>'repair','case_sensitive'=>false]);
appCheck(count($search['matches'])>0,'External client can inspect created source with bounded search');
$assets=$tool('voxelsite_assets_list');
appCheck(in_array('assets/images/workshop.png',array_column($assets['assets'],'path'),true),'Attached normalized asset is visible in the authorized draft inventory');
appCheck(SiteWorkspace::inventory($root.'/live')===$live,'Entire MCP authoring lifecycle leaves published bytes unchanged');
$preview=$tool('voxelsite_preview_render',['path'=>'index.php','draft_version'=>'draft:1','max_bytes'=>4096]);
if (!$preview['rendered']) throw new RuntimeException('Preview failed: '.json_encode($preview,JSON_THROW_ON_ERROR));
appCheck($preview['html']===null && $preview['omissions']!==[],
    'Preview reports when rendered HTML exceeds its whole-response budget');
$preview=$tool('voxelsite_preview_render',['path'=>'index.php','draft_version'=>'draft:1','max_bytes'=>196608]);
appCheck($preview['rendered'] && $preview['status']===200 && $preview['html']!==null,
    'Preview render uses the same committed draft and passes its response contract');
$browser=$tool('voxelsite_preview_open',['path'=>'index.php','draft_version'=>'draft:1']);
appCheck(str_starts_with($browser['browser_url'],'https://fixture.invalid/subdirectory/_studio/api/mcp/preview.php#ticket='),
    'Browser handoff pins the configured subdirectory and puts its one-use ticket in the fragment');
$plan=$tool('voxelsite_publish_prepare',['request_id'=>'application-publish-plan-001','base_draft_version'=>'draft:1']);
appCheck($tool('voxelsite_publish_get',['plan_id'=>$plan['plan_id']])===$plan
    && SiteWorkspace::inventory($root.'/live')===$live,'Publish review is retained and leaves live bytes unchanged');
$publishInput=['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest'],'operation_id'=>'application-publish-001'];
$published=$tool('voxelsite_publish_apply',$publishInput);
for ($i=0;$published['status']==='applying' && $i<50;$i++) {
    $published=$tool('voxelsite_operations_continue',['operation_id'=>$publishInput['operation_id'],'checkpoint'=>$published['checkpoint']]);
}
appCheck($published['status']==='succeeded' && $published['result']['provider_calls']===0,
    'Publish uses the shared operation continuation and validated success shape');
appCheck($tool('voxelsite_publish_apply',$publishInput)===$published,
    'Publish retry returns the same durable release result');
appCheck(file_get_contents($root.'/live/hosting.txt')==='Untouched hosting file',
    'Publishing preserves unrelated hosting files');
foreach ($plan['files'] as $file) {
    appCheck(($file['after_hash']===null?!file_exists($root.'/live/'.$file['path'])
        :hash_file('sha256',$root.'/live/'.$file['path'])===$file['after_hash']),
        'Published bytes match the reviewed hash: '.$file['path']);
}
$finish=function(array $state,string $id) use($tool):array {
    for ($i=0;$state['status']==='applying' && $i<80;$i++) {
        $state=$tool('voxelsite_operations_continue',['operation_id'=>$id,'checkpoint'=>$state['checkpoint']]);
    }
    return $state;
};
$capture=$finish($tool('voxelsite_snapshots_create',['operation_id'=>'application-snapshot-001','domain'=>'both','label'=>'First complete site']),
    'application-snapshot-001');
appCheck($capture['status']==='succeeded' && $capture['result']['domains']===['draft','published'],
    'Snapshot captures explicit website domains through bounded shared continuation');
$snapshotId=$capture['result']['snapshot_id'];
$inspected=$tool('voxelsite_snapshots_inspect',['snapshot_id'=>$snapshotId]);
appCheck($inspected['validity']==='valid' && in_array('credentials',$inspected['excluded_domains'],true),
    'Snapshot inspection verifies retained bytes and reports excluded business domains');
$history=$tool('voxelsite_snapshots_list',['limit'=>2]);
appCheck(count($history['snapshots'])===2 && $history['next_offset']!==null,'Snapshot history is bounded with an explicit continuation cursor');
$historyNext=$tool('voxelsite_snapshots_list',['limit'=>2,'offset'=>$history['next_offset'],'inventory_version'=>$history['inventory_version']]);
appCheck(count($historyNext['snapshots'])>0,'Snapshot cursor reaches older retained archives');
$graph=$tool('voxelsite_structure_graph',['kind'=>'nodes','limit'=>2]);
appCheck(count($graph['items'])===2 && $graph['draft_version']==='draft:1','Typed structure inspection exposes the current draft graph');
$renamed=$tool('voxelsite_structure_prepare',['request_id'=>'application-title-001','base_draft_version'=>'draft:1',
    'intent'=>(object)['type'=>'title','page_file'=>'about.php','title'=>'About our workshop']]);
$renamedState=$finish($tool('voxelsite_changes_apply',['change_set_id'=>$renamed['change_set_id'],'digest'=>$renamed['digest'],
    'operation_id'=>'application-title-apply-001']),'application-title-apply-001');
appCheck($renamedState['status']==='succeeded' && $db->scalar("SELECT title FROM pages WHERE file_path='about.php'")==='About our workshop',
    'Structural intent shares exact review application and page projection');
$secondPlan=$tool('voxelsite_publish_prepare',['request_id'=>'application-publish-plan-002','base_draft_version'=>'draft:2']);
$secondRelease=$finish($tool('voxelsite_publish_apply',['plan_id'=>$secondPlan['plan_id'],'digest'=>$secondPlan['digest'],
    'operation_id'=>'application-publish-002']),'application-publish-002');
appCheck($secondRelease['status']==='succeeded','Modified draft publishes as a separate reviewed release');
$draftBeforeRestore=WorkspaceFiles::hashes(WorkspaceFiles::read($workspace));
$pagesBeforeRestore=$db->query('SELECT * FROM pages ORDER BY id');
$restore=$tool('voxelsite_restore_prepare',['request_id'=>'application-restore-001','snapshot_id'=>$snapshotId,'domain'=>'published']);
appCheck(CanonicalJson::digest($tool('voxelsite_restore_get',['plan_id'=>$restore['plan_id']]))===CanonicalJson::digest($restore),
    'Published-only restoration requires a retained exact review');
$restoreInput=['plan_id'=>$restore['plan_id'],'digest'=>$restore['digest'],'operation_id'=>'application-restore-apply-001'];
$restored=$finish($tool('voxelsite_restore_apply',$restoreInput),'application-restore-apply-001');
appCheck($restored['status']==='succeeded' && $restored['result']['domain']==='published'
    && WorkspaceFiles::hashes(WorkspaceFiles::read($workspace))===$draftBeforeRestore
    && $db->query('SELECT * FROM pages ORDER BY id')===$pagesBeforeRestore,
    'Published-only wire restoration preserves current draft files and page projection');
appCheck($tool('voxelsite_restore_apply',$restoreInput)===$restored,'Restoration replay returns one durable outcome');
appCheck(hash_file('sha256',$root.'/live/about.php')===$review['files'][array_search('about.php',array_column($review['files'],'path'),true)]['after_hash'],
    'Restored public page equals the original captured release');
appCheck($providerGuards===$requestNumber,'Every protocol request enters the provider-forbidden boundary before authentication');
appCheck($GLOBALS['lifecycle_provider_attempts']===0,'No built-in provider or Router transport attempted network dispatch');
appCheck($providerSettings===$db->query("SELECT * FROM settings WHERE key LIKE 'ai_%' OR key LIKE 'governor.%' OR key IN ('evaluator_enabled','design_review_enabled') ORDER BY key"),
    'External lifecycle leaves saved provider and review configuration unchanged');
$evidence=['kind'=>'synthetic_wire_lifecycle','profile'=>$profile,'php'=>PHP_VERSION,'checks'=>$checks,
    'host'=>['disabled_functions'=>array_values(array_filter(explode(',',ini_get('disable_functions')))),
        'memory_limit'=>ini_get('memory_limit'),'max_execution_time'=>(int)ini_get('max_execution_time'),
        'upload_max_filesize'=>ini_get('upload_max_filesize'),'post_max_size'=>ini_get('post_max_size')],
    'protocols'=>ProtocolProfile::versions(),'provider_requests'=>$GLOBALS['lifecycle_provider_attempts'],
    'live_before'=>$live,'live_after'=>SiteWorkspace::inventory($root.'/live'),
    'draft_version'=>$workspace->status()['draft_version'],'snapshot_id'=>$snapshotId,
    'operations'=>$db->query('SELECT id,kind,state FROM agent_operations ORDER BY id'),
    'revisions'=>$db->query('SELECT id,description FROM revisions ORDER BY id'),
    'release_id'=>$workspace->status()['release_id'],'client_qualification'=>false];
file_put_contents($root.'/evidence.json',json_encode($evidence,JSON_THROW_ON_ERROR|JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
echo "MCP application: {$checks} checks passed; synthetic wire integration, no real-client qualification. Fixture {$root}\n";
