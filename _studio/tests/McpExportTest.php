<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
require __DIR__.'/helpers/SiteControlFixture.php';
use VoxelSite\{Database,ExportService,Settings,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,CanonicalJson,CredentialService,DownloadGrantStore,DownloadHttpController,JsonSchema,OperationActor,OperationException,OperationStore,PublishPlanService,ReleaseStore,WorkspaceFiles};
$checks=0;
function exportCheck(bool $ok,string $label):void {global $checks;$checks++;if(!$ok)throw new RuntimeException('FAIL '.$label);echo 'PASS '.$label."\n";}
function exportReject(callable $call,string $code,string $label):void {try{$call();}catch(OperationException $error){exportCheck($error->errorCode===$code,$label.' ['.$error->errorCode.']');return;}exportCheck(false,$label);}
function exportRemove(string $path):void {if(is_link($path)||is_file($path)){unlink($path);return;}if(!is_dir($path))return;foreach(new DirectoryIterator($path)as$entry)if(!$entry->isDot())exportRemove($entry->getPathname());rmdir($path);}
function exportCommand(array $command,?string $cwd=null,string $stdin=''):array {
    $process=proc_open($command,[0=>['pipe','r'],1=>['pipe','w'],2=>['pipe','w']],$pipes,$cwd);
    if(!is_resource($process))throw new RuntimeException('Cannot execute portable fixture.');fwrite($pipes[0],$stdin);fclose($pipes[0]);
    $stdout=stream_get_contents($pipes[1]);$stderr=stream_get_contents($pipes[2]);fclose($pipes[1]);fclose($pipes[2]);$exit=proc_close($process);return compact('stdout','stderr','exit');
}
function exportExtract(DownloadGrantStore $store,string $id,string $root):void {
    mkdir($root,0700,true);$zip=new ZipArchive();$zip->open($store->stage($id).'/site.zip');$zip->extractTo($root);$zip->close();
}
$root=realpath(sys_get_temp_dir()).'/vs-export-'.bin2hex(random_bytes(6));
try {
    [$db,$fm]=createSiteControlFixture($root);
    $workspace=new SiteWorkspace($db,$root.'/preview',$root.'/published',$root.'/data/workspace',$root.'/published/assets');
    $policy=new ActorPolicy($db);$credentials=new CredentialService($db);$owner=new OperationActor('user',1,null,[],'studio_configured',null);
    $key=$credentials->create($owner,1,'edit','Export fixture',null);$actor=$policy->fromCredential($key['id']);
    $other=$policy->fromCredential($credentials->create($owner,1,'edit','Other export actor',null)['id']);
    (new Settings($db))->set('site_url','https://fixture.invalid');
    foreach(['preview/work','preview/assets/forms','preview/assets/data','preview/assets/images','published/assets/library','published/assets/icons','data/actions']as$dir)mkdir($root.'/'.$dir,0700,true);
    file_put_contents($root.'/preview/work/detail.php','<?php $page=["title"=>"Nested"]; include __DIR__."/../_partials/header.php"; ?><h1>Nested portable page</h1><i data-lucide="mail" class="icon text-red-500"></i><a href="/about?ref=export#team">About</a><img src="/assets/images/local.svg"><img src="/assets/library/portable.svg"><img src="https://cdn.invalid/photo.webp"><form action="/submit.php" method="post"><input type="hidden" name="form_id" value="contact"><input name="name"><button>Send</button></form><?php include __DIR__."/../_partials/footer.php"; ?>');
    file_put_contents($root.'/preview/_partials/footer.php','</main><link rel="stylesheet" href="/actions-bar.css?v=1"><script src="/actions-bar.js?v=1" defer></script></body></html>');
    file_put_contents($root.'/preview/assets/images/local.svg','<svg xmlns="http://www.w3.org/2000/svg"><title>Local</title></svg>');
    file_put_contents($root.'/preview/assets/css/static-assets.css','.image{background:url("/assets/images/local.svg")}');
    file_put_contents($root.'/published/assets/library/portable.svg','<svg xmlns="http://www.w3.org/2000/svg"><title>Immutable portable asset</title></svg>');
    file_put_contents($root.'/published/assets/icons/mail.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><path d="M1 1h20v20H1z"/></svg>');
    file_put_contents($root.'/preview/assets/forms/contact.json',json_encode(['id'=>'contact','name'=>'Contact','fields'=>[['name'=>'name','type'=>'text','label'=>'Name','required'=>true]],'submission'=>['success_message'=>'Received']]));
    file_put_contents($root.'/preview/assets/data/site.json','{"name":"Portable fixture","description":"Public data"}');
    file_put_contents($root.'/preview/assets/data/menu.json','{"categories":[{"name":"Lunch","items":[]}]}');
    file_put_contents($root.'/preview/assets/data/memory.json','{"secret":"AUTHORING_MEMORY_SENTINEL"}');
    file_put_contents($root.'/preview/config.php','PRIVATE_CONFIG_SENTINEL');
    file_put_contents($root.'/published/private.php','UNOWNED_PHP_SENTINEL');
    $fm->syncPageRegistry(true);
    $store=new DownloadGrantStore($db,$policy,$workspace,$root.'/data/agent/exports');
    $publisher=new PublishPlanService($db,$policy,$workspace,new ReleaseStore($db,$policy,$root.'/data/agent/releases'),new OperationStore($db,$policy,$workspace->mutationLockPath()),$root.'/data/actions',$root.'/data/published-manifest.json');
    $service=new ExportService($db,$policy,$workspace,$store,$publisher);
    $request=static fn($id,$format='php',$source='draft')=>(object)['request_id'=>$id,'source'=>$source,'version'=>$service->currentVersion($source),'format'=>$format];
    foreach(['prepare','create','status','download']as$method){JsonSchema::assertSupported(ExportService::inputSchema($method));JsonSchema::assertSupported(ExportService::outputSchema($method));}
    exportCheck(true,'Export discovery schemas are explicit and supported');
    $draftBefore=SiteWorkspace::inventory($root.'/preview');$liveBefore=SiteWorkspace::inventory($root.'/published');$stateBefore=$workspace->status();
    $review=$service->prepare($actor,$request('export-php-001'));
    JsonSchema::validate(JsonSchema::output($review),ExportService::outputSchema('prepare'));
    exportCheck($review['status']==='ready'&&$review['source']==='draft'&&$review['format']==='php','Preparation seals a reviewed draft PHP archive');
    exportCheck($review['provider_calls']===0 && $review['archive_bytes']>0 && $review['file_count']===count($review['files']),'Review contains explicit checksum, size and file inventory');
    exportCheck($workspace->status()===$stateBefore&&SiteWorkspace::inventory($root.'/preview')===$draftBefore&&SiteWorkspace::inventory($root.'/published')===$liveBefore,'Preparation does not mutate draft, live site or versions');
    $names=array_column($review['files'],'path');
    exportCheck(in_array('work/detail.php',$names,true)&&in_array('_partials/header.php',$names,true)&&in_array('assets/library/portable.svg',$names,true),'Recursive pages, partials and referenced immutable assets are portable');
    exportCheck(!in_array('config.php',$names,true)&&!in_array('assets/data/memory.json',$names,true)&&!in_array('private.php',$names,true),'Private configuration, authoring memory and unowned public PHP are excluded');
    exportCheck(!array_filter($names,static fn($path)=>str_starts_with($path,'_studio/')||str_contains($path,'actions-bar')||str_contains($path,'studio.db')),'Studio, Action runtime and database internals are excluded');
    exportCheck($review['dependencies']['studio_mcp']===false&&$review['dependencies']['public_mcp']==='read_only'&&str_contains($review['dependencies']['forms'],'PHP 8.2'),'Dependency report distinguishes public reads, Studio management and standalone forms');
    exportCheck(in_array('https://cdn.invalid/photo.webp',$review['dependencies']['remote_urls'],true),'Remote dependencies remain explicit without network fetching');
    exportCheck(CanonicalJson::digest($service->prepare($actor,$request('export-php-001')))===CanonicalJson::digest($review),'Exact preparation replay returns the retained archive');
    exportReject(fn()=>$service->prepare($actor,$request('export-php-001','html')),'idempotency_conflict','Request identity cannot change archive format');
    exportReject(fn()=>$service->download($actor,(object)['export_id'=>$review['export_id']]),'content_conflict','Uncreated reviews cannot mint download grants');
    exportReject(fn()=>$service->create($actor,(object)['export_id'=>$review['export_id'],'digest'=>str_repeat('0',64),'operation_id'=>'export-create-001']),'content_conflict','Creation consumes the exact reviewed digest');
    $created=$service->create($actor,(object)['export_id'=>$review['export_id'],'digest'=>$review['digest'],'operation_id'=>'export-create-001']);
    JsonSchema::validate(JsonSchema::output($created),ExportService::outputSchema('create'));
    exportCheck($created['status']==='created'&&$created['operation_id']==='export-create-001','Creation returns a durable stable operation identity');
    exportCheck($service->create($actor,(object)['export_id'=>$review['export_id'],'digest'=>$review['digest'],'operation_id'=>'export-create-001'])===$created,'Lost creation acknowledgement replays without archive duplication');
    exportReject(fn()=>$service->status($other,(object)['export_id'=>$review['export_id']]),'permission_denied','One credential cannot inspect another credential export');
    $narrow=$policy->fromCredential($credentials->create($owner,1,'edit','Narrow export reader',null)['id']);
    $db->update('api_keys',['scopes'=>'["export:read"]'],'id = ?',[$narrow->credentialId]);
    exportReject(fn()=>$service->prepare($narrow,$request('export-narrow-001')),'permission_denied','Export scope alone cannot broaden source, asset or form read authority');
    mkdir($root.'/other-live/assets',0700,true);
    $otherWorkspace=new SiteWorkspace($db,$root.'/preview',$root.'/other-live',$root.'/data/workspace',$root.'/other-live/assets');
    $otherStore=new DownloadGrantStore($db,$policy,$otherWorkspace,$root.'/data/agent/exports');
    exportReject(fn()=>$otherStore->get($actor,$review['export_id']),'permission_denied','Retained exports are bound to the canonical installation roots');
    $download=$service->download($actor,(object)['export_id'=>$review['export_id']]);$ticket=explode('#',$download['download_url'],2)[1];
    JsonSchema::validate(JsonSchema::output($download),ExportService::outputSchema('download'));
    exportCheck(!str_contains($download['download_url'],'?')&&$download['single_use']&&$download['expires_at']<=time()+120,'Download capability is single-use and fragment-only for two minutes');
    exportCheck($db->scalar('SELECT token_hash FROM agent_download_grants')===hash('sha256',$ticket)&&!str_contains(CanonicalJson::encode($db->query('SELECT * FROM agent_download_grants')),$ticket),'Download store retains only hashed tickets');
    $http=new DownloadHttpController($store,'https://fixture.invalid:443/customer');
    $bootstrap=$http->handle('GET',[]);exportCheck($bootstrap['status']===200&&str_contains($bootstrap['body'],'history.replaceState')&&str_contains($bootstrap['headers']['Content-Security-Policy'],'sha256-'),'Browser handoff clears fragment before POST and uses a strict script policy');
    exportCheck($http->handle('DELETE',[])['status']===405,'Download endpoint refuses unsupported methods');
    exportCheck($http->handle('POST',['Origin'=>'https://evil.invalid','Content-Type'=>'application/json'],json_encode(['ticket'=>$ticket]))['status']===403,'Download POST requires the canonical installation Origin');
    exportCheck($http->handle('POST',['Content-Type'=>'application/json'],json_encode(['ticket'=>$ticket]))['status']===403,'Missing Origin cannot consume a browser download grant');
    exportCheck($http->handle('POST',['Origin'=>'https://fixture.invalid','Content-Type'=>'text/plain'],json_encode(['ticket'=>$ticket]))['status']===409,'Download exchange rejects unsupported content types');
    exportCheck($http->handle('POST',['Origin'=>'https://fixture.invalid','Content-Type'=>'application/json'],'{"ticket":[]}')['status']===409,'Malformed ticket input fails before any archive read');
    exportCheck($http->handle('POST',['Origin'=>'https://fixture.invalid','Content-Type'=>'application/json'],str_repeat('x',257))['status']===409,'Download request body is bounded before parsing');
    $stream=$http->handle('POST',['Origin'=>'https://fixture.invalid','Content-Type'=>'application/json'],json_encode(['ticket'=>$ticket]));
    $archive=stream_get_contents($stream['stream']['handle']);fclose($stream['stream']['handle']);
    exportCheck($stream['status']===200&&hash('sha256',$archive)===$review['archive_sha256']&&strlen($archive)===$review['archive_bytes'],'Download accepts the browser Origin for saved default port 443 and streams the verified archive');unset($archive);
    exportReject(fn()=>$store->openDownload($ticket),'download_expired','A consumed download ticket cannot replay');
    exportExtract($store,$review['export_id'],$root.'/portable-php');
    $render=exportCommand([PHP_BINARY,$root.'/portable-php/work/detail.php'],$root.'/portable-php');
    exportCheck($render['exit']===0&&str_contains($render['stdout'],'Nested portable page')&&!str_contains($render['stdout'],'actions-bar'),'Extracted PHP page and shared partials render on a separate root without Studio');
    $form=exportCommand([PHP_BINARY,'-r','$_SERVER["REQUEST_METHOD"]="POST"; $_SERVER["HTTP_X_REQUESTED_WITH"]="XMLHttpRequest"; $_POST=["form_id"=>"contact","name"=>"Portable visitor"]; include '.var_export($root.'/portable-php/submit.php',true).';'],$root.'/portable-php');
    exportCheck($form['exit']===0&&str_contains($form['stdout'],'success')&&count(glob($root.'/portable-php/_submissions/contact/*.json'))===1,'Standalone form fallback stores a fresh submission without Studio or SQLite');
    exportCheck(!is_dir($root.'/portable-php/_studio')&&!is_dir($root.'/portable-php/vendor'),'Portable PHP has no Studio or Composer dependency');
    $mcpSource=file_get_contents($root.'/portable-php/mcp.php');
    exportCheck(!str_contains($mcpSource,'ActionManager')&&!str_contains($mcpSource,'submit_form')&&!str_contains($mcpSource,'vendor/autoload'),'Portable public MCP has no write tools, Actions or autoload dependency');
    // Exercise the exact exported endpoint on a separate document root.
    $socket=stream_socket_server('tcp://127.0.0.1:0',$errno,$error);if(!$socket)throw new RuntimeException('Cannot start local portability listener: '.$error);
    $address=stream_socket_get_name($socket,false);fclose($socket);
    $server=proc_open([PHP_BINARY,'-S',$address,'-t',$root.'/portable-php'],[0=>['pipe','r'],1=>['file',$root.'/server.log','a'],2=>['file',$root.'/server.log','a']],$pipes,$root.'/portable-php');
    if(!is_resource($server))throw new RuntimeException('Cannot start portable PHP host.');fclose($pipes[0]);
    try {
        $ready=false;for($i=0;$i<40;$i++){$probe=@fsockopen(explode(':',$address)[0],(int)explode(':',$address)[1],$errno,$error,0.1);if($probe){fclose($probe);$ready=true;break;}usleep(25000);}if(!$ready)throw new RuntimeException('Portable PHP host did not start.');
        $call=static function(string $method,array $params=[])use($address):array {
            $body=json_encode(['jsonrpc'=>'2.0','id'=>1,'method'=>$method,'params'=>(object)$params]);
            $context=stream_context_create(['http'=>['method'=>'POST','header'=>"Content-Type: application/json\r\n",'content'=>$body,'timeout'=>2,'ignore_errors'=>true]]);
            return json_decode(file_get_contents('http://'.$address.'/mcp.php',false,$context),true,32,JSON_THROW_ON_ERROR);
        };
        $listed=$call('tools/list');exportCheck(array_column($listed['result']['tools'],'name')===['get_business_info','get_menu'],'Separate PHP host advertises only currently available public read tools');
        $business=$call('tools/call',['name'=>'get_business_info','arguments'=>(object)[]]);exportCheck(str_contains($business['result']['content'][0]['text'],'Portable fixture'),'Read-only public MCP serves exported public data on the separate host');
        exportCheck(str_contains($call('resources/read',['uri'=>'site://info'])['result']['contents'][0]['text'],'Portable fixture'),'Portable resources retain the shipped site://info URI');
        exportCheck(isset($call('resources/read',['uri'=>'site://memory'])['error']),'Portable public resources do not expose authoring memory');
        exportCheck(isset($call('tools/call',['name'=>'submit_form'])['error']),'Portable public MCP explicitly rejects form submission tools');
        exportCheck(str_contains(file_get_contents('http://'.$address.'/work/detail.php'),'Nested portable page'),'Portable recursive page is served by the separate PHP host');
    }finally{proc_terminate($server);proc_close($server);}
    $html=$service->prepare($actor,$request('export-html-001','html'));
    JsonSchema::validate(JsonSchema::output($html),ExportService::outputSchema('prepare'));
    exportExtract($store,$html['export_id'],$root.'/portable-html');
    $static=file_get_contents($root.'/portable-html/work/detail.html');
    exportCheck(str_contains($static,'href="../about.html?ref=export#team"')&&str_contains($static,'src="../assets/images/local.svg"'),'Static nested routes and root assets are rebased with query and fragment preserved');
    exportCheck(str_contains($static,'action="../submit.php"')&&!str_contains($static,'VoxelSitePreview')&&!str_contains($static,'data-vs-source'),'Portable rendering preserves live forms and removes preview-only runtime and instrumentation');
    exportCheck(str_contains(file_get_contents($root.'/portable-html/assets/css/static-assets.css'),'url("../../assets/images/local.svg")'),'Static CSS root asset references are rebased for the exported stylesheet location');
    exportCheck(str_contains(ExportService::rewriteStatic('<img srcset="/assets/a.webp 1x, /assets/b.webp 2x">','work/detail.php',[]),'srcset="../assets/a.webp 1x,../assets/b.webp 2x"'),'Static responsive image sources retain descriptors and relative asset paths');
    exportCheck(str_contains($static,'<svg')&&str_contains($static,'class="icon text-red-500"')&&!str_contains($static,'data-lucide="mail"'),'Static literal icons are embedded with utility classes and no fetch dependency');
    exportCheck(!is_dir($root.'/portable-html/_partials')&&!is_file($root.'/portable-html/work/detail.php')&&!is_file($root.'/portable-html/mcp.php'),'Static export contains rendered pages without PHP partials or public MCP claims');
    exportCheck(is_file($root.'/portable-html/submit.php')&&$html['dependencies']['php']&&$html['dependencies']['public_mcp']==='omitted','Static export truthfully declares the standalone form PHP dependency');
    exportReject(fn()=>$service->create($actor,(object)['export_id'=>$html['export_id'],'digest'=>$html['digest'],'operation_id'=>'export-create-001']),'idempotency_conflict','Creation operation cannot be reused for another export');
    // Permission narrowing after a link was minted is enforced at actual download.
    $grant=$store->grant($actor,$review['export_id']);$scopes=$db->scalar('SELECT scopes FROM api_keys WHERE id = ?',[$actor->credentialId]);
    $db->update('api_keys',['scopes'=>json_encode(array_values(array_diff(json_decode($scopes,true),['forms:read'])))],'id = ?',[$actor->credentialId]);
    exportReject(fn()=>$store->openDownload($grant['ticket']),'permission_denied','A grant cannot retain removed form-read authority');$db->update('api_keys',['scopes'=>$scopes],'id = ?',[$actor->credentialId]);
    $db->update('users',['role'=>'viewer'],'id = 1');exportReject(fn()=>$store->openDownload($grant['ticket']),'permission_denied','Current role ceiling revokes export access');$db->update('users',['role'=>'owner'],'id = 1');
    $db->update('studio_mcp_credentials',['revoked_at'=>time()],'key_id = ?',[$actor->credentialId]);exportReject(fn()=>$store->openDownload($grant['ticket']),'permission_denied','Revoked credentials invalidate previously minted grants');$db->update('studio_mcp_credentials',['revoked_at'=>null],'key_id = ?',[$actor->credentialId]);
    $db->update('agent_download_grants',['expires_at'=>time()-1],'token_hash = ?',[hash('sha256',$grant['ticket'])]);exportReject(fn()=>$store->openDownload($grant['ticket']),'download_expired','Download tickets expire independently of the archive');
    $grant=$store->grant($actor,$review['export_id']);$archivePath=$store->stage($review['export_id']).'/site.zip';$handle=fopen($archivePath,'r+b');fwrite($handle,'BAD');fclose($handle);
    exportReject(fn()=>$store->openDownload($grant['ticket']),'content_conflict','Same-size archive tampering is caught by checksum verification');
    // Publish via the same retained executor, with a clean managed source.
    unlink($root.'/preview/config.php');
    $plan=$publisher->prepare($actor=(new ActorPolicy($db))->fromCredential($credentials->create($owner,1,'publish','Publish export fixture',null)['id']),(object)['request_id'=>'export-publish-001','base_draft_version'=>$service->currentVersion('draft')]);
    $published=$publisher->publish($actor,(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest'],'operation_id'=>'export-publish-op']);
    while($published['status']==='applying')$published=$publisher->continue($actor,$published['operation_id'],$published['checkpoint']);
    exportCheck($published['status']==='succeeded','Fixture has an exact managed published release');
    $publishedReview=$service->prepare($actor,$request('export-published-001','php','published'));
    exportCheck($publishedReview['version']===$workspace->status()['release_id']&&!in_array('private.php',array_column($publishedReview['files'],'path'),true),'Published export pins release identity and never scans unowned public files');
    exportCheck(in_array('robots.txt',array_column($publishedReview['files'],'path'),true)&&in_array('sitemap.xml',array_column($publishedReview['files'],'path'),true),'Owned generated root metadata is retained in published archives');
    $exportsBefore = $db->count('agent_exports');
    $studioVersion = $service->studioStatus($owner)['version'];
    exportCheck($exportsBefore === $db->count('agent_exports') && $studioVersion === $publishedReview['version'], 'Studio version inspection is pure and names the published release');
    exportReject(fn() => $service->createStudio($owner, (object)['format' => 'php', 'version' => $studioVersion]),
        'invalid_schema', 'Studio export requires a stable caller operation identity');
    exportReject(fn() => $service->createStudio($owner, (object)['format' => 'php', 'operation_id' => 'studio-export-missing-version']),
        'invalid_schema', 'Studio export requires the displayed published version');
    exportReject(fn() => $service->createStudio($owner, (object)['format' => 'php', 'operation_id' => 'studio-export-stale-version', 'version' => 'release_' . str_repeat('0', 32)]),
        'content_conflict', 'Studio export does not refresh a stale published version');
    $studioInput = (object)['format' => 'php', 'operation_id' => 'studio-export-retained-001', 'version' => $studioVersion];
    $studioExport = $service->createStudio($owner, $studioInput);
    exportCheck($studioExport['status'] === 'created' && $studioExport['version'] === $studioVersion, 'Studio exports use the shared retained archive service');
    $db->update('site_workspace_state', ['release_id' => 'release_' . str_repeat('a', 32)], 'id = 1');
    exportCheck($service->createStudio($owner, $studioInput) === $studioExport, 'Lost Studio download response reuses the original archive after another publication');
    $db->update('site_workspace_state', ['release_id' => $studioVersion], 'id = 1');
    $db->update('agent_exports', ['expires_at' => time() - 1], 'request_id = ?', ['studio-export-stale-version']);
    $store->pruneExpired();
    file_put_contents($root.'/preview/about.php','NEWER_DRAFT_SENTINEL');
    exportCheck($service->status($actor,(object)['export_id'=>$publishedReview['export_id']])['archive_sha256']===$publishedReview['archive_sha256'],'Later draft edits do not change the immutable published export');
    exportReject(fn()=>$service->prepare($actor,(object)['request_id'=>'export-stale-001','source'=>'draft','version'=>'draft:999','format'=>'php']),'content_conflict','Preparation refuses stale source versions');
    $oldTime=ini_get('max_execution_time');ini_set('max_execution_time','5');
    exportReject(fn()=>$service->prepare($actor,$request('export-low-time-001')),'host_capability_unavailable','Hosts with insufficient request time fail before archive work');ini_set('max_execution_time',$oldTime);
    $large=$root.'/preview/assets/images/huge.png';$handle=fopen($large,'wb');ftruncate($handle,ExportService::MAX_BYTES+1);fclose($handle);
    exportReject(fn()=>$service->prepare($actor,$request('export-large-001')),'host_capability_unavailable','Oversized source refuses before loading or archiving its bytes');unlink($large);
    $lowMemory=exportCommand([PHP_BINARY,'-d','memory_limit=16M','-r','require '.var_export(dirname(__DIR__).'/engine/bootstrap.php',true).'; $service=(new ReflectionClass(\\VoxelSite\\ExportService::class))->newInstanceWithoutConstructor(); try {(new ReflectionMethod($service,"hostBudget"))->invoke($service); exit(3);} catch(\\VoxelSite\\Agent\\OperationException $error){echo $error->errorCode;}']);
    exportCheck($lowMemory['exit']===0&&$lowMemory['stdout']==='host_capability_unavailable','Low-memory PHP hosts refuse preparation before allocating source bytes');
    for($i=0;$i<10;$i++)file_put_contents($root.'/preview/generated-'.$i.'.php','<?php echo str_repeat("x",950000);');
    $oldMemory=ini_get('memory_limit');ini_set('memory_limit','64M');
    exportReject(fn()=>$service->prepare($actor,$request('export-expanded-001','html')),'host_capability_unavailable','Rendered output is prospectively bounded before each write');
    ini_set('memory_limit',$oldMemory);
    $expanded=$db->queryOne('SELECT id FROM agent_exports WHERE request_id = ?', ['export-expanded-001']);
    $output=$store->stage($expanded['id']).'/output';$size=0;
    foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($output,FilesystemIterator::SKIP_DOTS)) as $entry)if($entry->isFile())$size+=$entry->getSize();
    exportCheck($size<10*950000&&!is_file($store->stage($expanded['id']).'/site.zip'),'Refused expansion leaves bounded staging and no finalized archive');
    for($i=0;$i<10;$i++)unlink($root.'/preview/generated-'.$i.'.php');
    $db->update('agent_exports',['expires_at'=>time()-1],'id = ?',[$review['export_id']]);
    exportReject(fn()=>$service->status($policy->fromCredential($key['id']),(object)['export_id'=>$review['export_id']]),'export_expired','Expired archive reads do not revive authority');
    exportCheck($store->pruneExpired()===1&&!is_dir(dirname($archivePath))&&(int)$db->scalar('SELECT staged_bytes FROM agent_exports WHERE id = ?',[$review['export_id']])===0,'Bounded expiry cleanup removes private artifacts before releasing quota');
    exportReject(fn()=>$service->prepare($policy->fromCredential($key['id']),$request('export-php-001')),'export_expired','Expiry retains a request tombstone instead of silently regenerating changed source');
    echo $checks." export checks passed\n";
}finally{Database::resetInstance();exportRemove($root);}
