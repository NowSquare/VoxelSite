<?php
declare(strict_types=1);

// Scripted HTTP outcomes, not model-led authoring or visual/design qualification.
$outer=realpath(dirname(__DIR__,2));$temporary=realpath(sys_get_temp_dir());
if(!$outer||!$temporary||!str_starts_with($outer,$temporary.'/'))throw new RuntimeException('Run this suite from a disposable outer source copy.');
$socket=stream_socket_server('tcp://127.0.0.1:0',$errno,$error);if(!$socket)throw new RuntimeException($error);
$port=(int)substr(strrchr(stream_socket_get_name($socket,false),':'),1);fclose($socket);
$process=proc_open([PHP_BINARY,__DIR__.'/helpers/create-mcp-client-fixture.php',(string)$port],[['pipe','r'],['pipe','w'],['pipe','w']],$pipes,$outer);
fclose($pipes[0]);$output=stream_get_contents($pipes[1]);fclose($pipes[1]);$errors=stream_get_contents($pipes[2]);fclose($pipes[2]);$exit=proc_close($process);
if($exit!==0||$errors!=='')throw new RuntimeException('Fixture creation failed: '.$output.$errors);
$fixture=json_decode($output,true,32,JSON_THROW_ON_ERROR);$root=realpath($fixture['root']);
if(!$root||!str_starts_with($root,$temporary.'/vs-mcp-client-'))throw new RuntimeException('Unsafe fixture root.');
require $root.'/site/_studio/engine/bootstrap.php';
use VoxelSite\Agent\{CanonicalJson,CredentialService,JsonSchema,OperationActor,ProtocolProfile,WorkspaceFiles};
use VoxelSite\{ActionRegistry,Database,Encryption,Settings,SiteWorkspace};
if(!str_starts_with((new ReflectionClass(Database::class))->getFileName(),$root.'/site/'))throw new RuntimeException('Application must load only copied runtime.');
$db=Database::getInstance();$settings=new Settings($db);$config=json_decode(file_get_contents($root.'/site/_studio/data/config.json'),true);
$encryption=new Encryption($config['app_key']);
foreach(['claude','openai','gemini','deepseek','openai_compatible'] as $provider)$settings->set('ai_'.$provider.'_api_key',$encryption->encrypt('fixture-provider-never-send'));
$settings->setMany(['ai_provider'=>'openai','ai_model'=>'fixture-model','evaluator_enabled'=>true,'design_review_enabled'=>true,
    'governor.mode'=>'enforce','governor.typesafe_api_key'=>$encryption->encrypt('fixture-router-never-send')]);
$savedSettings=$db->query("SELECT * FROM settings WHERE key LIKE 'ai_%' OR key LIKE 'governor.%' OR key IN ('evaluator_enabled','design_review_enabled') ORDER BY key");
$workspace=new SiteWorkspace($db);$token=trim(file_get_contents($fixture['credential_file']));
$owner=new OperationActor('user',1,null,[],'studio_configured',null);
$narrow=(new CredentialService($db))->create($owner,1,'edit','Workflow without structure',null);
$scopes=json_decode($db->scalar('SELECT scopes FROM api_keys WHERE id=?',[$narrow['id']]),true);
$db->update('api_keys',['scopes'=>json_encode(array_values(array_diff($scopes,['structure:write'])))],'id=?',[$narrow['id']]);
file_put_contents($root.'/site/index.php','PUBLISHED HOME SENTINEL');
mkdir($root.'/site/assets/data',0700,true);file_put_contents($root.'/site/assets/data/site.json','{"published":"unchanged"}');
$server=proc_open([PHP_BINARY,'-d','display_errors=1','-S','127.0.0.1:'.$port,$root.'/router.php'],[['pipe','r'],['file',$root.'/server.log','a'],['file',$root.'/server.log','a']],$serverPipes,$root);
fclose($serverPipes[0]);$ready=false;
for($i=0;$i<100;$i++){if($connection=@stream_socket_client('tcp://127.0.0.1:'.$port,$n,$e,0.05)){fclose($connection);$ready=true;break;}usleep(20000);}
if(!$ready)throw new RuntimeException('HTTP fixture did not start.');
$checks=0;$sequence=0;$schemas=[];$cases=[];$continuations=0;
function workflowCheck(bool $ok,string $label):void {global $checks;$checks++;if(!$ok)throw new RuntimeException('FAIL '.$label);echo 'PASS '.$label."\n";}
function workflowRpc(string $method,array $params=[],?string $credential=null):array {
    global $sequence,$token,$fixture;
    $handle=curl_init($fixture['endpoint']);curl_setopt_array($handle,[CURLOPT_POST=>true,CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>20,
        CURLOPT_HTTPHEADER=>['Content-Type: application/json','Accept: application/json, text/event-stream','Authorization: Bearer '.($credential??$token),'MCP-Protocol-Version: '.ProtocolProfile::COMPATIBILITY],
        CURLOPT_POSTFIELDS=>json_encode(['jsonrpc'=>'2.0','id'=>++$sequence,'method'=>$method,'params'=>(object)$params],JSON_THROW_ON_ERROR)]);
    $bytes=curl_exec($handle);$status=curl_getinfo($handle,CURLINFO_RESPONSE_CODE);
    if($bytes===false)throw new RuntimeException(curl_error($handle));
    return ['status'=>$status,'body'=>json_decode($bytes,true,128,JSON_THROW_ON_ERROR)];
}
function workflowTool(string $name,array $args=[],?string $credential=null):array {
    global $schemas;
    JsonSchema::validate(json_decode(json_encode((object)$args,JSON_THROW_ON_ERROR)), $schemas[$name]['inputSchema']);
    $r=workflowRpc('tools/call',['name'=>$name,'arguments'=>(object)$args],$credential);
    if($r['status']!==200||($r['body']['result']['isError']??true))throw new RuntimeException($name.': '.json_encode($r,JSON_THROW_ON_ERROR));
    $result=$r['body']['result']['structuredContent'];
    JsonSchema::validate(json_decode(json_encode($result,JSON_THROW_ON_ERROR)), $schemas[$name]['outputSchema']);
    return $result;
}
function workflowLive():array {
    global $root;$out=[];$base=$root.'/site';
    $scan=function(string $directory,string $prefix='')use(&$scan,&$out):void{
        foreach(new DirectoryIterator($directory) as $entry){if($entry->isDot())continue;$path=$prefix.$entry->getFilename();
            if($path==='_studio'||$path==='vendor')continue;
            if($entry->isLink())throw new RuntimeException('Unexpected published fixture symlink.');
            if($entry->isDir())$scan($entry->getPathname(),$path.'/');else $out[$path]=hash_file('sha256',$entry->getPathname());
        }
    };$scan($base);ksort($out);return $out;
}
function workflowDraft():array {global $workspace;return WorkspaceFiles::read($workspace);}
function workflowDiff(array $review,string $path,string $side):?string {
    $joined='';$offset=0;
    do{$part=workflowTool('voxelsite_changes_diff',['change_set_id'=>$review['change_set_id'],'path'=>$path,'side'=>$side,'offset'=>$offset,'max_bytes'=>8192]);
        $data=$part['sides'][$side]??null;if($data===null)return null;
        if($data['binary'])throw new RuntimeException('Workflow text fixture unexpectedly became binary.');
        $joined.=$data['content'];$offset=$data['next_offset'];
    }while($offset!==null);
    workflowCheck(hash('sha256',$joined)===$data['hash'],'Diff chunks retain exact '.$side.' hash: '.$path);return $joined;
}
function workflowApply(string $label,string $tool,array $input,array $expected,array $normalized=[]):array {
    global $db,$workspace,$cases,$continuations;
    $before=workflowDraft();$live=workflowLive();$version=(int)$workspace->status()['draft_version'];$revisionCount=$db->count('revisions');$pages=$db->query('SELECT * FROM pages ORDER BY id');
    $review=workflowTool($tool,$input);
    workflowCheck(workflowDraft()===$before&&workflowLive()===$live&&$db->query('SELECT * FROM pages ORDER BY id')===$pages,$label.': prepare preserves draft, live and page metadata');
    workflowCheck(CanonicalJson::digest(workflowTool('voxelsite_changes_get',['change_set_id'=>$review['change_set_id']]))===CanonicalJson::digest($review),$label.': get returns exact retained review');
    $wanted=$before;
    foreach($expected as $path=>$content){if($content===null)unset($wanted[$path]);else $wanted[$path]=$content;}
    foreach($review['files'] as $file){$path=$file['path'];$old=workflowDiff($review,$path,'before');$new=workflowDiff($review,$path,'after');
        workflowCheck($old===($before[$path]??null),$label.': exact original review source '.$path);
        if(in_array($path,$normalized,true)){
            workflowCheck(in_array($path,$review['normalized_files'],true)&&str_contains($new,'--color-primary: #334b36;'),$label.': normalized tokens are disclosed and retain supplied palette');$wanted[$path]=$new;
        }elseif(!array_key_exists($path,$expected)){
            workflowCheck(in_array($path,['assets/css/tailwind.css','assets/js/navigation.js','assets/js/icon-resolver.js'],true)&&in_array($path,$review['derived_files'],true),$label.': only declared compiler/shipped derived source changes');$wanted[$path]=$new;
        }else workflowCheck($new===$expected[$path],$label.': exact expected authored source '.$path);
    }
    workflowCheck(workflowDraft()===$before&&workflowLive()===$live,$label.': get and diff are read-only');
    $apply=['change_set_id'=>$review['change_set_id'],'digest'=>$review['digest'],'operation_id'=>'workflow-apply-'.$label];
    $state=workflowTool('voxelsite_changes_apply',$apply);$steps=0;
    while($state['status']==='applying'&&$steps++<40){$continuations++;$state=workflowTool('voxelsite_operations_continue',['operation_id'=>$apply['operation_id'],'checkpoint'=>$state['checkpoint']]);}
    workflowCheck($state['status']==='succeeded'&&$state['result']['provider_calls']===0,$label.': HTTP apply reaches one provider-free success');
    ksort($wanted);$actual=workflowDraft();ksort($actual);
    workflowCheck($actual===$wanted&&workflowLive()===$live,$label.': complete draft matches review and all published bytes remain unchanged');
    workflowCheck((int)$workspace->status()['draft_version']===$version+1&&$db->count('revisions')===$revisionCount+1,$label.': exactly one draft version and revision');
    workflowCheck(CanonicalJson::digest(workflowTool('voxelsite_changes_apply',$apply))===CanonicalJson::digest($state)
        &&CanonicalJson::digest(workflowTool($tool,$input))===CanonicalJson::digest($review)
        &&$db->count('revisions')===$revisionCount+1&&(int)$workspace->status()['draft_version']===$version+1,$label.': stable HTTP prepare/apply replay creates no extra revision');
    $cases[$label]=['change_set_id'=>$review['change_set_id'],'operation_id'=>$apply['operation_id'],'digest'=>$review['digest'],'revision_id'=>$state['result']['revision_id'],'continuations'=>$steps,'expected_paths'=>array_keys($expected)];
    return $review;
}
function workflowRecipe(string $action,array $expected,array $normalized=[]):array {
    global $workspace;
    $context=workflowTool('voxelsite_site_context',['action'=>$action,'max_bytes'=>32768]);
    workflowCheck($context['action']===$action&&count($context['rules'])===4&&$context['provider_calls']===0,$action.': own context advertises four rule documents');
    foreach($context['rules'] as $rule){$joined='';$offset=0;do{$chunk=workflowTool('voxelsite_rules_read',['action'=>$action,'kind'=>$rule['kind'],'digest'=>$rule['sha256'],'offset'=>$offset,'max_bytes'=>8192]);$joined.=$chunk['content'];$offset=$chunk['next_offset'];}while($offset!==null);
        workflowCheck(strlen($joined)===$rule['bytes']&&hash('sha256',$joined)===$rule['sha256'],$action.': reconstructs exact '.$rule['kind'].' rules');}
    $briefInput=['request_id'=>'workflow-brief-'.$action,'action'=>$action,'instruction'=>'Apply the supplied deterministic fixture outcome.','max_bytes'=>32768];
    $brief=workflowTool('voxelsite_authoring_brief',$briefInput);
    workflowCheck($brief['action']===$action&&$brief['context']['action']===$action&&$brief['provider_calls']===0
        &&CanonicalJson::digest(workflowTool('voxelsite_authoring_get',['brief_id'=>$brief['brief_id']]))===CanonicalJson::digest($brief)
        &&CanonicalJson::digest(workflowTool('voxelsite_authoring_brief',$briefInput))===CanonicalJson::digest($brief),$action.': own retained brief and replay');
    $before=workflowDraft();$operations=[];
    foreach($expected as $path=>$content){$op=['type'=>isset($before[$path])?($content===null?'delete':'replace'):'create','path'=>$path,'expected_hash'=>isset($before[$path])?hash('sha256',$before[$path]):null];if($content!==null)$op['content']=$content;$operations[]=(object)$op;}
    return workflowApply($action,'voxelsite_changes_prepare',['request_id'=>'workflow-review-'.$action,'base_draft_version'=>$brief['base_draft_version'],'brief_id'=>$brief['brief_id'],'summary'=>'Scripted '.$action.' outcome','operations'=>$operations],$expected,$normalized);
}
function workflowVisual(string $label,string $anchor,string $replacement,string $strategy='block-replace'):array {
    global $workspace;$source=workflowDraft()['index.php'];
    workflowCheck(substr_count($source,$anchor)===1,$label.': fixture has one explicit source address');
    $edit=(object)['path'=>'index.php','expected_hash'=>hash('sha256',$source),'source_address'=>$anchor,'content_hash'=>hash('sha256',$anchor),'replacement'=>$replacement,'strategy'=>$strategy];
    return workflowApply($label,'voxelsite_structure_prepare',['request_id'=>'workflow-visual-'.$label,'base_draft_version'=>'draft:'.$workspace->status()['draft_version'],'intent'=>(object)['type'=>'visual','edits'=>[$edit]]],['index.php'=>str_replace($anchor,$replacement,$source)]);
}
try{
    $initialize=workflowRpc('initialize',['protocolVersion'=>ProtocolProfile::COMPATIBILITY,'capabilities'=>(object)[],'clientInfo'=>['name'=>'Scripted workflow probe','version'=>'1']]);
    workflowCheck($initialize['status']===200,'Actual nested MCP HTTP endpoint initializes');
    $listed=workflowRpc('tools/list');foreach($listed['body']['result']['tools'] as $tool)$schemas[$tool['name']]=$tool;
    $ids=array_column((new ActionRegistry())->getActions(),'id');$advertised=$schemas['voxelsite_site_context']['inputSchema']['properties']['action']['enum'];sort($ids);sort($advertised);
    workflowCheck($ids===$advertised&&count($ids)===11,'Discovered context schema advertises all eleven registered recipes');
    $briefIds=$schemas['voxelsite_authoring_brief']['inputSchema']['properties']['action']['enum'];sort($briefIds);workflowCheck($briefIds===$ids,'Discovered brief schema advertises the same eleven recipes');
    $visual=array_values(array_filter($schemas['voxelsite_structure_prepare']['inputSchema']['properties']['intent']['oneOf'],fn($s)=>($s['properties']['type']['const']??null)==='visual'));
    workflowCheck(count($visual)===1&&$visual[0]['properties']['edits']['items']['properties']['strategy']['enum']===['token-edit','attribute-edit','line-replace','block-replace','block-insert','meta-edit','content-edit'],'Discovered visual schema exposes exact bounded source strategies');
    $header='<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="/assets/css/tailwind.css"></head><body><main>';
    $footer='</main></body></html>';
    $home="<?php \$page=['title'=>'Home','slug'=>'index']; include __DIR__ . '/_partials/header.php'; ?>\n<h1 class=\"text-3xl\">Workshop</h1>\n<section id=\"intro\"><p class=\"lead\">Original introduction</p><a href=\"/about\">About</a></section>\n<section id=\"order\"><p>A</p><p>B</p><p>C</p></section>\n<section id=\"duplicate\"><span>Repeated</span><span>Repeated</span></section>\n<?php include __DIR__ . '/_partials/footer.php'; ?>\n";
    $about="<?php \$page=['title'=>'About','slug'=>'about']; include __DIR__ . '/_partials/header.php'; ?>\n<h1>About</h1><p>Our original story.</p>\n<?php include __DIR__ . '/_partials/footer.php'; ?>\n";
    $nav='<nav><a href="/">Home</a><a href="/about">About</a></nav>';
    $initial=['index.php'=>$home,'about.php'=>$about,'_partials/header.php'=>$header,'_partials/footer.php'=>$footer,'_partials/nav.php'=>$nav,'assets/css/style.css'=>":root { --color-primary: #334b36; --font-body: Arial, sans-serif; --font-heading: Georgia, serif; }\n",'assets/data/site.json'=>"{\"business_name\":\"Workshop\",\"hours\":\"09:00–17:00\"}\n"];
    for($i=1;$i<=21;$i++)$initial['assets/js/workflow-'.$i.'.js']='/* Fixture script '.$i.' */';
    workflowRecipe('create_site',$initial,['assets/css/style.css']);workflowCheck($cases['create_site']['continuations']>0,'Large create recipe requires explicit HTTP checkpoint continuation');
    workflowCheck($db->count('pages')===2,'Create recipe projects two page records');
    workflowRecipe('add_page',['faq.php'=>str_replace(['About','about','Our original story.'],['FAQ','faq','Answers to common questions.'],$about),'_partials/nav.php'=>str_replace('</nav>','<a href="/faq">FAQ</a></nav>',$nav)]);
    workflowRecipe('edit_page',['about.php'=>str_replace('Our original story.','Our repaired and expanded story.',workflowDraft()['about.php'])]);
    workflowRecipe('free_prompt',['about.php'=>str_replace('</h1>','</h1><p>Open 10:00–18:00.</p>',workflowDraft()['about.php']),'assets/data/site.json'=>"{\"business_name\":\"Workshop\",\"hours\":\"10:00–18:00\"}\n"]);
    workflowRecipe('change_design',['assets/css/style.css'=>str_replace(['#334b36','──'],['#b45a22','--'],workflowDraft()['assets/css/style.css'])]);
    workflowRecipe('restyle_site',['assets/css/style.css'=>str_replace(['#b45a22','Arial, sans-serif'],['#284c72','Verdana, sans-serif'],workflowDraft()['assets/css/style.css']),'index.php'=>str_replace('text-3xl','text-4xl',workflowDraft()['index.php']),'about.php'=>str_replace('<h1>','<h1 class="text-4xl">',workflowDraft()['about.php'])]);
    // Seed an honestly pre-existing unresolved dependency; import must disclose it, not fabricate a repair.
    file_put_contents($workspace->draftRoot().'/about.php',workflowDraft()['about.php']."<?php if (false) include __DIR__ . '/_partials/legacy-optional.php'; ?>\n");
    $import=workflowRecipe('import_site',['imported.php'=>'<article><h1>Supplied standalone page</h1><script src="/assets/js/imported.js"></script></article>','assets/js/imported.js'=>'document.documentElement.dataset.imported = "supplied";']);
    workflowCheck(in_array('pre_existing_dependency',array_column($import['validation']['warnings'],'code'),true)&&!file_exists($workspace->draftRoot().'/_partials/legacy-optional.php'),'Import discloses existing unresolved dependency without inventing its source');
    workflowRecipe('optimize_aeo',['about.php'=>str_replace("'title'=>'About'","'title'=>'Workshop repair specialists','description'=>'Repair services supplied by the owner'",workflowDraft()['about.php']).'<script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"Workshop"}</script>','assets/data/site.json'=>"{\"business_name\":\"Workshop\",\"hours\":\"10:00–18:00\",\"description\":\"Repair services supplied by the owner\"}\n"]);
    workflowRecipe('inline_edit',['about.php'=>str_replace('expanded story.','expanded local story.',workflowDraft()['about.php'])]);
    workflowRecipe('section_edit',['index.php'=>str_replace('<section id="intro"><p class="lead">Original introduction</p><a href="/about">About</a></section>','<section id="intro"><p class="lead">Reviewed introduction</p><a href="/about">About</a></section>',workflowDraft()['index.php'])]);
    workflowRecipe('add_section',['index.php'=>str_replace("<?php include __DIR__ . '/_partials/footer.php'; ?>",'<section id="added"><h2>Visit the workshop</h2></section>'."\n<?php include __DIR__ . '/_partials/footer.php'; ?>",workflowDraft()['index.php'])]);
    workflowVisual('set_text','<h1 class="text-4xl">Workshop</h1>','<h1 class="text-4xl">Local workshop</h1>','content-edit');
    workflowVisual('add_class_token','<p class="lead">Reviewed introduction</p>','<p class="lead text-lg">Reviewed introduction</p>','token-edit');
    workflowVisual('remove_class_token','<p class="lead text-lg">Reviewed introduction</p>','<p class="lead">Reviewed introduction</p>','token-edit');
    workflowVisual('set_class_list','<p class="lead">Reviewed introduction</p>','<p class="text-base font-medium">Reviewed introduction</p>','token-edit');
    workflowVisual('set_attribute','<a href="/about">About</a>','<a href="/about" aria-label="About the workshop">About</a>','attribute-edit');
    workflowVisual('replace_html','<p class="text-base font-medium">Reviewed introduction</p>','<p class="text-base"><strong>Updated</strong> introduction</p>');
    workflowVisual('delete_node','<section id="added"><h2>Visit the workshop</h2></section>','');
    workflowVisual('insert_node','<section id="order"><p>A</p><p>B</p><p>C</p></section>','<section id="order"><p>A</p><p>B</p><p>C</p><p>D</p></section>');
    workflowVisual('move_before','<section id="order"><p>A</p><p>B</p><p>C</p><p>D</p></section>','<section id="order"><p>B</p><p>A</p><p>C</p><p>D</p></section>');
    workflowVisual('move_after','<section id="order"><p>B</p><p>A</p><p>C</p><p>D</p></section>','<section id="order"><p>A</p><p>C</p><p>B</p><p>D</p></section>');
    workflowVisual('fallback','<strong>Updated</strong> introduction','<strong>Precisely updated</strong> introduction','content-edit');
    $source=workflowDraft()['index.php'];$version='draft:'.$workspace->status()['draft_version'];$before=workflowDraft();$revisionCount=$db->count('revisions');
    foreach(['stale'=>['hash'=>str_repeat('0',64),'anchor'=>'<p>A</p>'],'duplicate'=>['hash'=>hash('sha256',$source),'anchor'=>'<span>Repeated</span>']] as $name=>$probe){
        $args=['request_id'=>'workflow-reject-'.$name,'base_draft_version'=>$version,'intent'=>['type'=>'visual','edits'=>[['path'=>'index.php','expected_hash'=>$probe['hash'],'source_address'=>$probe['anchor'],'content_hash'=>hash('sha256',$probe['anchor']),'replacement'=>'<p>Unsafe</p>','strategy'=>'content-edit']]]];
        $response=workflowRpc('tools/call',['name'=>'voxelsite_structure_prepare','arguments'=>$args]);workflowCheck(($response['body']['result']['isError']??false)===true&&str_contains(json_encode($response),'content_conflict'),$name.': HTTP visual source conflict refuses guessed targeting');}
    $denied=workflowRpc('tools/call',['name'=>'voxelsite_structure_prepare','arguments'=>['request_id'=>'workflow-reject-scope','base_draft_version'=>$version,'intent'=>['type'=>'visual','edits'=>[['path'=>'index.php','expected_hash'=>hash('sha256',$source),'source_address'=>'<p>A</p>','content_hash'=>hash('sha256','<p>A</p>'),'replacement'=>'<p>X</p>','strategy'=>'content-edit']]]]],$narrow['key']);
    workflowCheck($denied['status']===403,'Missing structure grant is rejected at actual HTTP dispatch');
    workflowCheck(workflowDraft()===$before&&$db->count('revisions')===$revisionCount,'Stale, duplicate and denied edits leave source and revisions unchanged');
    $requests=array_map(fn($line)=>json_decode($line,true),file($root.'/requests.ndjson',FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES));
    workflowCheck(array_sum(array_column($requests,'provider_attempts'))===0,'Every actual HTTP request makes zero provider or Router dispatch attempts');
    workflowCheck($savedSettings===$db->query("SELECT * FROM settings WHERE key LIKE 'ai_%' OR key LIKE 'governor.%' OR key IN ('evaluator_enabled','design_review_enabled') ORDER BY key"),'Saved provider, Router and review settings remain unchanged');
    workflowCheck(count($cases)===22&&$db->count('revisions')===22,'All eleven recipes and eleven visual outcomes retain exactly twenty-two revisions');
    workflowCheck(!preg_match('/(?:PHP )?(?:Warning|Deprecated|Fatal error|Notice):/',file_get_contents($root.'/server.log')),'Actual HTTP server log has no PHP diagnostics');
    $evidence=['kind'=>'scripted_workflow_http_outcomes','php'=>PHP_VERSION,'checks'=>$checks,'cases'=>$cases,'requests'=>count($requests),'provider_attempts'=>0,'continuations'=>$continuations,'qualification'=>'No model-led authorship, DOM-selector generality, visual design or native-client qualification'];
    file_put_contents($root.'/workflow-evidence.json',json_encode($evidence,JSON_THROW_ON_ERROR|JSON_PRETTY_PRINT));
    echo "Workflow HTTP: $checks checks; 22 cases; fixture $root\n";
}finally{proc_terminate($server);proc_close($server);Database::resetInstance();}
