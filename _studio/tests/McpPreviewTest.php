<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
use VoxelSite\{Database, Logger, Migrator, PreviewAssetRouter, Settings, SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy, CanonicalJson, CredentialService, JsonSchema, OperationActor, OperationException,
    PreviewGrantStore, PreviewHttpController, PreviewService, WorkspaceFiles};

$checks=0;
function previewCheck(bool $ok,string $label): void {
    global $checks; $checks++;
    if (!$ok) throw new RuntimeException('FAIL '.$label);
    echo 'PASS '.$label."\n";
}
function previewReject(callable $call,string $code,string $label): void {
    try { $call(); }
    catch (OperationException $error) { previewCheck($error->errorCode === $code,$label.' ['.$error->errorCode.']'); return; }
    previewCheck(false,$label);
}
function previewCopy(string $source,string $target): void {
    if (is_dir($source)) {
        if (!is_dir($target)) mkdir($target,0700,true);
        foreach (new DirectoryIterator($source) as $entry) if (!$entry->isDot()) previewCopy($entry->getPathname(),$target.'/'.$entry->getFilename());
    } else copy($source,$target);
}
function previewRemove(string $path): void {
    if (is_link($path) || is_file($path)) { unlink($path); return; }
    if (!is_dir($path)) return;
    foreach (new DirectoryIterator($path) as $entry) if (!$entry->isDot()) previewRemove($entry->getPathname());
    rmdir($path);
}
$root=realpath(sys_get_temp_dir()).'/vs-preview-'.bin2hex(random_bytes(6));
foreach (['draft/assets','live/assets/library','live/_data','private/actions'] as $directory) mkdir($root.'/'.$directory,0700,true);
foreach (['logDir'=>$root.'/private','initialized'=>true] as $property=>$value) {
    (new ReflectionProperty(Logger::class,$property))->setValue(null,$value);
}
$db=Database::getInstance($root.'/private/studio.db');
try {
    (new Migrator($db,new Settings($db)))->run();
    $db->insert('users',['email'=>'preview@example.invalid','password_hash'=>'fixture','name'=>'Fixture','role'=>'owner','created_at'=>now(),'updated_at'=>now()]);
    $db->update('site_workspace_state',['format'=>2,'draft_version'=>4],'id = 1');
    previewCopy(__DIR__.'/fixtures/mcp/site-lifecycle/site',$root.'/draft');
    file_put_contents($root.'/draft/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
    file_put_contents($root.'/live/index.php','Published page stays unchanged.');
    file_put_contents($root.'/live/assets/library/reference.jpg','immutable asset bytes');
    file_put_contents($root.'/live/_data/submissions.db','production submission sentinel');
    file_put_contents($root.'/live/_data/actions.db','production action sentinel');
    file_put_contents($root.'/draft/explode.php','<?php throw new RuntimeException("PRIVATE_DIAGNOSTIC_SECRET");');
    file_put_contents($root.'/draft/assets/js/module.mjs','import "./service-copy.js"; fetch("../data/site.json"); fetch(`/assets/icons/${name}.svg`);');
    file_put_contents($root.'/draft/assets/css/dependencies.css','@import "./style.css"; .photo{background:url("../images/workshop.png")}');
    file_put_contents($root.'/draft/ordinary.php','<!doctype html><html lang="en"><head><title>Ordinary forms</title></head><body><main>'
        .'<form action="https://site.example.test/submit.php" method="get"><input name="message"><button type="submit" formaction="/actions/submit.php" formmethod="get">Send</button></form>'
        .'<script src="/assets/js/form-handler.js" defer></script></main></body></html>');
    copy(dirname(__DIR__).'/static/form-handler.js',$root.'/draft/assets/js/form-handler.js');
    file_put_contents($root.'/private/actions/quote.json',json_encode(['id'=>'quote','active'=>true,'name'=>'Quote','description'=>'Request a quote',
        'fields'=>[['name'=>'email','type'=>'email','label'=>'Email','required'=>true]],'notifications'=>['email'=>'PRIVATE_NOTIFICATION_TARGET'],
        'rate_limits'=>['private'=>'PRIVATE_RATE_LIMIT']]));
    (new \VoxelSite\TailwindCompiler($root.'/draft/assets/css'))->compile($root.'/draft',$root.'/draft/assets/css/tailwind.css',1048576);
    $workspace=new SiteWorkspace($db,$root.'/draft',$root.'/live',$root.'/private/workspace',$root.'/live/assets');
    $policy=new ActorPolicy($db); $credentials=new CredentialService($db);
    $owner=new OperationActor('user',1,null,[],'studio_configured',null);
    $key=$credentials->create($owner,1,'read','Preview fixture',null);
    $actor=$policy->fromCredential($key['id']);
    $grants=new PreviewGrantStore($db,$policy,$workspace);
    $service=new PreviewService($db,$policy,$workspace,$grants,null,'https://site.example.test',$root.'/private/actions');
    $http=new PreviewHttpController($service,true);
    $input=(object)['path'=>'index.php','draft_version'=>'draft:4','max_bytes'=>196608];
    $beforeDraft=WorkspaceFiles::hashes(WorkspaceFiles::read($workspace));
    $beforeLive=SiteWorkspace::inventory($root.'/live');
    foreach (['render','open'] as $method) {
        JsonSchema::assertSupported(PreviewService::inputSchema($method));
        JsonSchema::assertSupported(PreviewService::outputSchema($method));
    }
    previewCheck(true,'Public preview schemas use supported explicit fields');
    $render=$service->render($actor,$input);
    JsonSchema::validate(JsonSchema::output($render),PreviewService::outputSchema('render'));
    previewCheck($render['rendered'] && $render['status'] === 200 && is_string($render['html']),'A text-only client receives rendered draft HTML');
    previewCheck(str_contains($render['html'],'VoxelSitePreview') && $render['provider_calls'] === 0
        && $render['not_run'] !== [],'Preview exposes explicit runtime and does not invent provider or browser verification');
    previewCheck(strlen(CanonicalJson::encode($render)) <= $input->max_bytes,'Text preview counts the whole JSON response budget');
    $small=$service->render($actor,(object)['path'=>'index.php','draft_version'=>'draft:4','max_bytes'=>4096]);
    previewCheck(strlen(CanonicalJson::encode($small))<=4096 && $small['html'] === null && $small['omissions'] !== [],
        'Oversized rendered HTML is explicitly omitted rather than silently shortened');
    previewReject(fn()=>$service->render($actor,(object)['path'=>'index.php','draft_version'=>'draft:3']),'content_conflict','Rendering requires the expected current draft version');
    $broken=$service->render($actor,(object)['path'=>'explode.php','draft_version'=>'draft:4']);
    previewCheck(!$broken['rendered'] && $broken['status'] === 422 && $broken['diagnostics'][0]['code'] === 'render_failed'
        && !str_contains(CanonicalJson::encode($broken),'PRIVATE_DIAGNOSTIC_SECRET'),'Render errors are diagnostics and redact arbitrary exception text');
    previewReject(fn()=>$service->open($actor,(object)['path'=>'index.php','draft_version'=>'draft:3']),'content_conflict','Browser handoff requires the expected draft version');
    previewCheck((int)$db->scalar('SELECT COUNT(*) FROM agent_preview_grants') === 0,'A stale request allocates no preview grant');
    $opened=$service->open($actor,(object)['path'=>'index.php','draft_version'=>'draft:4']);
    JsonSchema::validate(JsonSchema::output($opened),PreviewService::outputSchema('open'));
    $ticket=substr($opened['browser_url'],strpos($opened['browser_url'],'#ticket=')+8);
    $stored=$db->queryOne('SELECT * FROM agent_preview_grants WHERE id = ?',[$opened['preview_id']]);
    previewCheck(str_contains($opened['browser_url'],'#ticket=') && !str_contains($opened['browser_url'],'?ticket=')
        && $stored['ticket_hash'] === hash('sha256',$ticket) && !str_contains(CanonicalJson::encode($stored),$ticket),
        'A one-use ticket is returned only in the fragment and stored only as a hash');
    previewCheck($opened['expires_at']-$stored['created_at']===900 && $opened['ticket_expires_at']-$stored['created_at']===120,
        'Browser authority lasts 15 minutes and its unexchanged ticket lasts two minutes');
    $bootstrap=$http->handle('GET',[],[],'',[]);
    previewCheck($bootstrap['status']===200 && str_contains($bootstrap['body'],'history.replaceState')
        && str_contains($bootstrap['body'],'method:"POST"') && !str_contains($bootstrap['body'],$ticket),
        'Handoff clears the fragment before a POST exchange and never echoes a ticket');
    $requestHeaders=['Origin'=>'https://site.example.test','Sec-Fetch-Site'=>'same-origin','Content-Type'=>'application/x-www-form-urlencoded'];
    $wrong=$http->handle('POST',['view'=>'exchange'],array_replace($requestHeaders,['Origin'=>'https://attacker.example']),http_build_query(['ticket'=>$ticket]),[]);
    previewCheck($wrong['status']===403 && $db->scalar('SELECT consumed_at FROM agent_preview_grants WHERE id = ?',[$opened['preview_id']])===null,
        'A cross-origin exchange cannot consume the ticket');
    $exchange=$http->handle('POST',['view'=>'exchange'],$requestHeaders,http_build_query(['ticket'=>$ticket]),[]);
    previewCheck($exchange['status']===303 && !str_contains($exchange['headers']['Location'],$ticket)
        && str_contains($exchange['headers']['Set-Cookie'],'Path='.PreviewService::ENDPOINT)
        && str_contains($exchange['headers']['Set-Cookie'],'HttpOnly; SameSite=Strict; Secure'),
        'Exchange redirects to a clean URL with a restricted HttpOnly cookie');
    preg_match('/^'.PreviewService::COOKIE_NAME.'=([a-f0-9]{64});/',$exchange['headers']['Set-Cookie'],$match);
    $cookie=$match[1]; $cookies=[PreviewService::COOKIE_NAME=>$cookie];
    previewCheck($http->handle('POST',['view'=>'exchange'],$requestHeaders,http_build_query(['ticket'=>$ticket]),[])['status']===410,
        'The same ticket cannot be exchanged twice');
    previewCheck($http->handle('GET',['path'=>'index.php'],[],'',[])['status']===410,'A public URL alone reveals no draft');
    foreach (['index.php','about.php','services/repairs.php','assets/css/style.css','assets/css/tailwind.css','assets/js/main.js','assets/images/workshop.png','assets/library/reference.jpg'] as $path) {
        $response=$http->handle('GET',['path'=>$path],[],'',$cookies);
        previewCheck($response['status']===200 && $response['body']!=='' && $response['headers']['Cache-Control']==='no-store, private',
            'Scoped navigation/dependency works for '.$path);
    }
    $ordinary=$http->handle('GET',['path'=>'ordinary.php'],[],'',$cookies);
    previewCheck(str_contains($ordinary['body'],'data-voxelsite-preview-form="true"')
        && str_contains($ordinary['body'],'action="/_studio/api/mcp/preview.php?view=validate"')
        && str_contains($ordinary['body'],'formmethod="post"') && !str_contains($ordinary['body'],'action="https://site.example.test/submit.php"'),
        'No-JavaScript forms and per-button overrides point only to the preview POST handler');
    $manifest=$http->handle('GET',['view'=>'manifest'],[],'',$cookies);
    $projection=json_decode($manifest['body'],true);
    previewCheck($manifest['status']===200 && $projection['submit_url']===PreviewService::ENDPOINT.'?view=validate'
        && $projection['preview'] && !str_contains($manifest['body'],'PRIVATE_'),'Preview action projection hides administration fields and pins the submission target');
    $validation=$http->handle('POST',['view'=>'validate'],['Content-Type'=>'application/x-www-form-urlencoded'],'email=secret%40example.test&message=PRIVATE_FORM_PAYLOAD',$cookies);
    previewCheck($validation['status']===200 && str_contains($validation['body'],'Nothing was submitted')
        && !str_contains($validation['body'],'PRIVATE_FORM_PAYLOAD'),'No-JavaScript validation ignores private submitted content');
    previewCheck($http->handle('POST',['view'=>'validate'],['Content-Length'=>'65537'],'',$cookies)['status']===413,
        'Oversized fallback bodies are rejected before validation');
    previewCheck($http->handle('GET',['path'=>'_studio/data/studio.db'],[],'',$cookies)['status']===400
        && $http->handle('GET',['path'=>'_partials/header.php'],[],'',$cookies)['status']===403,
        'Grant authority cannot address Studio internals or execute partials directly');
    $css=$http->handle('GET',['path'=>'assets/css/dependencies.css'],[],'',$cookies);
    $js=$http->handle('GET',['path'=>'assets/js/module.mjs'],[],'',$cookies);
    previewCheck(str_contains($css['body'],'?path=assets/css/style.css') && str_contains($css['body'],'?path=assets/images/workshop.png'),
        'CSS imports and relative image dependencies stay within preview authority');
    previewCheck($js['headers']['Content-Type']==='application/javascript; charset=utf-8'
        && str_contains($js['body'],'?path=assets/js/service-copy.js') && str_contains($js['body'],'?path=assets/data/site.json')
        && str_contains($js['body'],'?path=assets/icons/${name}.svg'),'Module imports, relative fetch and template asset URLs retain their preview routes');
    $html=PreviewAssetRouter::rewrite('<div class="bg-[url(\'../not-a-dependency.png\')]" style="background:url(\'assets/images/workshop.png\')"></div><img src=assets/images/workshop.png><script>import "./assets/js/main.js";</script>','index.php','html',PreviewService::ENDPOINT.'?path=');
    previewCheck(str_contains($html,"bg-[url('../not-a-dependency.png')]")
        && str_contains($html,'?path=assets/images/workshop.png') && str_contains($html,'?path=assets/js/main.js'),
        'HTML rewriting preserves Tailwind classes and routes inline styles, unquoted attributes and module imports');
    $subdir=new PreviewService($db,$policy,$workspace,$grants,null,'https://site.example.test/customer/site/',$root.'/private/actions');
    foreach (['/tenant.v1','/tenant%2Ev1','/tenant&review'] as $prefix) {
        $prefixed=new PreviewService($db,$policy,$workspace,$grants,null,'https://site.example.test'.$prefix,$root.'/private/actions');
        $prefixedOpen=$prefixed->open($actor,(object)['path'=>'ordinary.php','draft_version'=>'draft:4']);
        previewCheck(str_starts_with($prefixedOpen['browser_url'],'https://site.example.test'.$prefix.'/_studio/'),
            'Configured browser URL accepts a safe installation path '.$prefix);
    }
    $_SERVER['SCRIPT_NAME']='/tenant.v1/_studio/api/router.php';
    $_SERVER['HTTP_HOST']='untrusted.example';
    $studioPage=$service->studio('ordinary.php');
    previewCheck($studioPage['status']===200 && str_contains($studioPage['content'],'action="/tenant.v1/_studio/api/router.php?')
        && !str_contains($studioPage['content'],'untrusted.example'),'Studio preview derives its path from the executing script without using the request host');
    $unsetOrigin=new PreviewService($db,$policy,$workspace,$grants,null,'',$root.'/private/actions');
    previewCheck(str_contains($unsetOrigin->studio('ordinary.php')['content'],'/tenant.v1/_studio/api/router.php?'),
        'Subdirectory Studio preview works before a canonical URL is saved');
    previewReject(fn()=>$unsetOrigin->open($actor,(object)['path'=>'ordinary.php','draft_version'=>'draft:4']),
        'host_capability_unavailable','A Studio script path does not supply authority for browser grants');
    file_put_contents($root.'/draft/navigation.php','<html><head><script>location.href="/contact"; window.location="/about";</script></head><body></body></html>');
    $navigation=$service->render($actor,(object)['path'=>'navigation.php','draft_version'=>'draft:4']);
    previewCheck(in_array('javascript_navigation_not_isolated',array_column($navigation['diagnostics'],'code'),true),
        'Standalone preview explicitly reports JavaScript navigation that may leave the draft');
    unlink($root.'/draft/navigation.php');
    unset($_SERVER['SCRIPT_NAME'],$_SERVER['HTTP_HOST']);
    $subHttp=new PreviewHttpController($subdir,true);
    $subOpened=$subdir->open($actor,(object)['path'=>'ordinary.php','draft_version'=>'draft:4']);
    $subTicket=substr($subOpened['browser_url'],strpos($subOpened['browser_url'],'#ticket=')+8);
    $subExchange=$subHttp->handle('POST',['view'=>'exchange'],$requestHeaders,http_build_query(['ticket'=>$subTicket]),[]);
    preg_match('/^'.PreviewService::COOKIE_NAME.'=([a-f0-9]{64});/',$subExchange['headers']['Set-Cookie'],$subMatch);
    $subPage=$subHttp->handle('GET',['path'=>'ordinary.php'],[],'',[PreviewService::COOKIE_NAME=>$subMatch[1]]);
    previewCheck(str_starts_with($subOpened['browser_url'],'https://site.example.test/customer/site/_studio/')
        && str_starts_with($subExchange['headers']['Location'],'/customer/site/_studio/')
        && str_contains($subExchange['headers']['Set-Cookie'],'Path=/customer/site/_studio/api/mcp/preview.php;')
        && $subPage['status']===200 && str_contains($subPage['body'],'action="/customer/site/_studio/api/mcp/preview.php?view=validate"')
        && str_contains($subPage['body'],'src="/customer/site/_studio/api/mcp/preview.php?path=assets/js/form-handler.js'),
        'Subdirectory installations scope handoff, redirect, cookie, dependencies and form fallback to the actual script');
    $defaultPortService=new PreviewService($db,$policy,$workspace,$grants,null,'https://site.example.test:443/customer',$root.'/private/actions');
    $defaultPortGrant=$defaultPortService->open($actor,(object)['path'=>'ordinary.php','draft_version'=>'draft:4']);
    $defaultPortTicket=explode('#ticket=',$defaultPortGrant['browser_url'],2)[1];
    $defaultPortExchange=(new PreviewHttpController($defaultPortService,true))->handle('POST',['view'=>'exchange'],
        $requestHeaders,http_build_query(['ticket'=>$defaultPortTicket]),[]);
    previewCheck($defaultPortExchange['status']===303,'Browser Origin exchanges a grant when the saved installation URL explicitly includes port 443');
    foreach (['https://site.example.test/../escape','https://site.example.test/%2e%2e','https://user@site.example.test'] as $unsafeUrl) {
        previewReject(fn()=>PreviewService::canonicalOrigin($unsafeUrl),'host_capability_unavailable','Unsafe configured installation URL is rejected');
    }
    $db->update('agent_preview_grants',['ticket_expires_at'=>time()-1],'id = ?',[$subOpened['preview_id']]);
    previewCheck($subHttp->handle('POST',['view'=>'exchange'],$requestHeaders,http_build_query(['ticket'=>$subTicket]),[])['status']===410,
        'Expired or consumed handoff tickets cannot renew browser authority');
    $db->update('api_keys',['scopes'=>json_encode(array_values(array_diff($key['scopes'],['assets:read'])))],'id = ?',[$key['id']]);
    previewCheck($http->handle('GET',['path'=>'index.php'],[],'',$cookies)['status']===403,'Dependency scope reduction invalidates the whole retained browser capability');
    $db->update('api_keys',['scopes'=>json_encode($key['scopes'])],'id = ?',[$key['id']]);
    $db->update('site_workspace_state',['draft_version'=>5],'id = 1');
    previewCheck($http->handle('GET',['path'=>'index.php'],[],'',$cookies)['status']===410,'A changed draft invalidates an issued browser grant');
    $db->update('site_workspace_state',['draft_version'=>4],'id = 1');
    $db->update('agent_preview_grants',['expires_at'=>time()-1],'id = ?',[$opened['preview_id']]);
    previewCheck($http->handle('GET',['path'=>'index.php'],[],'',$cookies)['status']===410,'Expired browser authority fails closed');
    $db->update('agent_preview_grants',['expires_at'=>time()+900],'id = ?',[$opened['preview_id']]);
    $db->update('api_keys',['scopes'=>json_encode(array_values(array_diff($key['scopes'],['preview:read'])))],'id = ?',[$key['id']]);
    previewCheck($http->handle('GET',['path'=>'index.php'],[],'',$cookies)['status']===403,'Scope reduction invalidates an existing cookie');
    $db->update('api_keys',['scopes'=>json_encode($key['scopes'])],'id = ?',[$key['id']]);
    $credentials->revoke($owner,$key['id']);
    previewCheck($http->handle('GET',['path'=>'index.php'],[],'',$cookies)['status']===403,'Credential revocation invalidates browser access');
    previewCheck(WorkspaceFiles::hashes(WorkspaceFiles::read($workspace))===$beforeDraft && SiteWorkspace::inventory($root.'/live')===$beforeLive,
        'Rendering and first-party interactions preserve every draft, published, submission and action byte');
    previewCheck(session_status()!==PHP_SESSION_ACTIVE,'Preview authority never starts an owner session');
    echo "MCP preview: {$checks} checks passed\n";
} finally {
    Database::resetInstance();
    previewRemove($root);
}
