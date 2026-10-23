<?php
declare(strict_types=1);
require_once __DIR__.'/helpers/lifecycle-provider-trap.php';
require_once dirname(__DIR__).'/engine/bootstrap.php';
require_once __DIR__.'/helpers/SiteControlFixture.php';
require_once __DIR__.'/helpers/StudioRuntimeFixture.php';

use VoxelSite\{AgentAuth,Database,ExportService,Settings,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,CanonicalJson,CredentialService,DownloadGrantStore,OperationActor,OperationException,OperationStore,PublishPlanService,ReleaseStore};

$checks=0;$servers=[];$GLOBALS['lifecycle_provider_attempts']=0;
function publicDataCheck(bool $ok,string $label):void {global $checks;$checks++;if(!$ok)throw new RuntimeException('FAIL '.$label);echo 'PASS '.$label."\n";}
function publicDataReject(callable $call,string $code,string $label):void {try{$call();}catch(OperationException $e){publicDataCheck($e->errorCode===$code,$label.' ['.$e->errorCode.']');return;}publicDataCheck(false,$label);}
function publicDataRemove(string $path):void {if(is_link($path)||is_file($path)){unlink($path);return;}if(!is_dir($path))return;foreach(new DirectoryIterator($path)as$entry)if(!$entry->isDot())publicDataRemove($entry->getPathname());rmdir($path);}
function publicDataServer(string $root,?string $router=null):string {
    global $servers;
    $socket=stream_socket_server('tcp://127.0.0.1:0',$errno,$error);if(!$socket)throw new RuntimeException('Cannot allocate disposable listener: '.$error);
    $address=stream_socket_get_name($socket,false);fclose($socket);
    $command=[PHP_BINARY,'-d','display_errors=1','-S',$address,'-t',$root];if($router!==null)$command[]=$router;
    $log=dirname($root).'/'.basename($root).'-http.log';
    $server=proc_open($command,[['pipe','r'],['file',$log,'a'],['file',$log,'a']],$pipes,$root);
    if(!is_resource($server))throw new RuntimeException('Cannot start public-data HTTP fixture.');fclose($pipes[0]);$servers[]=[$server,$log];
    for($i=0;$i<50;$i++){$probe=@fsockopen('127.0.0.1',(int)substr(strrchr($address,':'),1),$errno,$error,.1);if($probe){fclose($probe);return 'http://'.$address;}usleep(20000);}
    throw new RuntimeException('Public-data fixture did not start.');
}
function publicDataHttp(string $url,mixed $body,?string $token=null):array {
    $curl=curl_init($url);$headers=['Content-Type: application/json'];if($token!==null)$headers[]='Authorization: Bearer '.$token;
    curl_setopt_array($curl,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>is_string($body)?$body:json_encode($body,JSON_THROW_ON_ERROR),CURLOPT_HTTPHEADER=>$headers,CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>10]);
    $bytes=curl_exec($curl);if(!is_string($bytes))throw new RuntimeException('HTTP fixture failed: '.curl_error($curl));
    return ['status'=>curl_getinfo($curl,CURLINFO_HTTP_CODE),'body'=>json_decode($bytes,true,32,JSON_THROW_ON_ERROR)];
}
function publicDataMcp(string $base,string $method,array $params=[]):array {return publicDataHttp($base.'/mcp.php',['jsonrpc'=>'2.0','id'=>1,'method'=>$method,'params'=>(object)$params]);}
function publicDataTool(string $base,string $name,array $arguments=[]):array {
    $result=publicDataMcp($base,'tools/call',['name'=>$name,'arguments'=>(object)$arguments]);
    publicDataCheck($result['status']===200&&isset($result['body']['result']['content'][0]['text']),'Public MCP '.$name.' responds over real HTTP');
    return json_decode($result['body']['result']['content'][0]['text'],true,16,JSON_THROW_ON_ERROR);
}

$root=realpath(sys_get_temp_dir()).'/vs-public-data-'.bin2hex(random_bytes(6));
try {
    [$db,$files]=createSiteControlFixture($root);
    $workspace=new SiteWorkspace($db,$root.'/preview',$root.'/published',$root.'/data/workspace',$root.'/published/assets');
    $policy=new ActorPolicy($db);$owner=new OperationActor('user',1,null,[],'studio_configured',null);
    $actor=$policy->fromCredential((new CredentialService($db))->create($owner,1,'publish','Public-data fixture',null)['id']);
    $settings=new Settings($db);$settings->set('site_url','https://published.example.invalid');$settings->set('agent_api_enabled',true);
    foreach(['preview/assets/data','data/actions']as$dir)mkdir($root.'/'.$dir,0700,true);
    $documents=[
        'site'=>['name'=>'Published bicycle workshop','description'=>'Published repairs and advice'],
        'menu'=>['currency'=>'EUR','categories'=>[['name'=>'Workshop refreshments','items'=>[['name'=>'Tea','price'=>2]]],['name'=>'Weekend specials','items'=>[['name'=>'Coffee','price'=>3]]]]],
        'services'=>['services'=>[['name'=>'Published puncture repair','price'=>15],['name'=>'Published safety check','price'=>25]]],
        'faq'=>['questions'=>[['question'=>'When are weekend repairs available?','answer'=>'Published Saturday hours'],['question'=>'Do you accept walk-ins?','answer'=>'Published weekend walk-ins welcome'],['question'=>'Where is the shop?','answer'=>'Published town centre']]],
    ];
    $documents=json_decode(CanonicalJson::encode($documents),true,16,JSON_THROW_ON_ERROR);
    foreach($documents as $name=>$value)file_put_contents($root.'/preview/assets/data/'.$name.'.json',CanonicalJson::encode($value));
    foreach(['memory','design-intelligence']as$name)file_put_contents($root.'/preview/assets/data/'.$name.'.json','{"secret":"AUTHORING_MEMORY_SENTINEL"}');
    $publisher=new PublishPlanService($db,$policy,$workspace,new ReleaseStore($db,$policy,$root.'/data/agent/releases'),new OperationStore($db,$policy,$workspace->mutationLockPath()),$root.'/data/actions',$root.'/data/published-manifest.json');
    $plan=$publisher->prepare($actor,(object)['request_id'=>'public-data-publish','base_draft_version'=>'draft:'.$workspace->status()['draft_version']]);
    $published=$publisher->publish($actor,(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest'],'operation_id'=>'public-data-publish-op']);
    while($published['status']==='applying')$published=$publisher->continue($actor,$published['operation_id'],$published['checkpoint']);
    publicDataCheck($published['status']==='succeeded'&&is_file($root.'/published/mcp.php'),'Real publication creates the generated public MCP endpoint');
    foreach($documents as $name=>$value)file_put_contents($root.'/preview/assets/data/'.$name.'.json','{"private":"PRIVATE_DRAFT_SENTINEL"}');
    \VoxelSite\Tests\StudioRuntimeFixture::copy($root.'/published');
    copy(__DIR__.'/helpers/lifecycle-provider-trap.php',$root.'/provider-trap.php');
    file_put_contents($root.'/router.php',<<<'PHP'
<?php
$GLOBALS['lifecycle_provider_attempts']=0;
require __DIR__.'/provider-trap.php';
register_shutdown_function(static function():void {file_put_contents(__DIR__.'/provider-attempts.log',(string)$GLOBALS['lifecycle_provider_attempts']."\n",FILE_APPEND);});
if(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH)!=='/rest')return false;
require __DIR__.'/published/_studio/engine/bootstrap.php';
\VoxelSite\Database::getInstance(__DIR__.'/studio.db');
foreach(['logDir'=>__DIR__.'/data','initialized'=>true]as$key=>$value)(new ReflectionProperty(\VoxelSite\Logger::class,$key))->setValue(null,$value);
require __DIR__.'/published/_studio/api/agent/v1/router.php';
PHP);
    $auth=new AgentAuth($db);$key=$auth->createKey('Published reads','agent',['tools:invoke']);$policy->bindRestCredential($owner,$key['id'],1);
    // Avoid the default rate budget obscuring the schema and boundary assertions.
    $db->update('api_keys',['rate_limit'=>1000],'id=?',[$key['id']]);
    $base=publicDataServer($root.'/published',$root.'/router.php');
    $rest=static fn(string $name,array $args=[])=>publicDataHttp($base.'/rest?_path=tools%2Finvoke',['name'=>$name,'arguments'=>(object)$args],$key['key']);
    $names=['get_business_info'=>'site','get_menu'=>'menu','get_services'=>'services','get_faq'=>'faq'];
    $before=siteControlState($root.'/studio.db');
    foreach($names as$name=>$document){$response=$rest($name);publicDataCheck($response['status']===200&&$response['body']['data']===$documents[$document],'REST '.$name.' reads exact published data while the private draft differs');}
    $menu=$documents['menu'];$menu['categories']=[$menu['categories'][1]];
    $faq=array_slice($documents['faq']['questions'],0,2);
    publicDataCheck($rest('get_menu',['category'=>'wEeKeNd'])['body']['data']===$menu,'REST category filter is case-insensitive and retains the public document envelope');
    publicDataCheck($rest('get_faq',['query'=>'WEEKEND'])['body']['data']===$faq,'REST FAQ query matches question and answer and returns the exact public subset');
    foreach(['get_menu'=>['category',[]],'get_faq'=>['query',[]]]as$name=>[$field,$empty]){
        $value=$rest($name,[$field=>str_repeat('x',200)]);
        publicDataCheck($value['status']===200&&($name==='get_menu'?$value['body']['data']['categories']:$value['body']['data'])===$empty,$name.' accepts the 200-character boundary');
        foreach([str_repeat('x',201),7,['not'=>'text']]as$invalid)publicDataCheck($rest($name,[$field=>$invalid])['status']===422,$name.' rejects overlong or incorrectly typed filters');
    }
    foreach(array_keys($names)as$name)publicDataCheck($rest($name,['source'=>'draft'])['status']===422,$name.' has a closed argument object and cannot select the draft');
    publicDataCheck(publicDataHttp($base.'/rest?_path=tools%2Finvoke',['name'=>'get_menu','arguments'=>(object)[],'extra'=>true],$key['key'])['status']===422,'REST rejects unknown envelope fields');
    publicDataCheck(publicDataHttp($base.'/rest?_path=tools%2Finvoke',str_repeat(' ',131073),$key['key'])['status']===422,'REST bounds the request before JSON parsing');
    $db->update('site_workspace_state',['reservation_operation_id'=>'public-read-fixture-reservation'],'id=1');
    publicDataCheck($rest('get_business_info')['body']['data']===$documents['site'],'An outstanding private mutation reservation does not block public observations');
    $db->update('site_workspace_state',['reservation_operation_id'=>null],'id=1');
    $path=$root.'/published/assets/data/services.json';$original=file_get_contents($path);
    try {
        // Two bounded strings make the exact total read limit reachable without exceeding a field limit.
        $atLimit='{"a":"'.str_repeat('x',32760).'","b":"'.str_repeat('y',32761).'"}';
        publicDataCheck(strlen($atLimit)===65536,'Fixture exercises exactly the published 64 KiB document boundary');
        file_put_contents($path,$atLimit);publicDataCheck($rest('get_services')['status']===200,'REST accepts a valid document at the 64 KiB limit');
        file_put_contents($path,$atLimit.' ');publicDataCheck($rest('get_services')['status']===422,'REST refuses a document one byte beyond the read limit');
        file_put_contents($path,'{invalid');publicDataCheck($rest('get_services')['status']===422,'REST rejects malformed published JSON without substituting private data');
        unlink($path);publicDataCheck($rest('get_services')['body']['data']===['message'=>'No published services information is available.'],'Missing live data never falls back to an existing private draft');
        symlink($root.'/preview/assets/data/services.json',$path);$linked=$rest('get_services');publicDataCheck($linked['status']>=400&&!str_contains(CanonicalJson::encode($linked),'PRIVATE_DRAFT_SENTINEL'),'REST refuses a public symlink targeting private draft data');unlink($path);
    }finally{if(is_link($path))unlink($path);file_put_contents($path,$original);}
    $scopes=$db->scalar('SELECT scopes FROM api_keys WHERE id=?',[$key['id']]);$db->update('api_keys',['scopes'=>'["pages:read"]'],'id=?',[$key['id']]);
    publicDataCheck($rest('get_business_info')['status']===403,'Published tool reads still require the actual REST tool grant');$db->update('api_keys',['scopes'=>$scopes],'id=?',[$key['id']]);
    $db->delete('agent_rest_owners','key_id=?',[$key['id']]);
    publicDataCheck($rest('get_business_info')['status']===403,'Published tool reads cannot authenticate through a missing bound account');$policy->bindRestCredential($owner,$key['id'],1);

    $store=new DownloadGrantStore($db,$policy,$workspace,$root.'/data/agent/exports');$exports=new ExportService($db,$policy,$workspace,$store,$publisher);
    $hosts=['generated public endpoint'=>$base];
    foreach(['php','html']as$format){
        $review=$exports->prepare($actor,(object)['request_id'=>'public-export-'.$format,'source'=>'published','version'=>$exports->currentVersion('published'),'format'=>$format]);
        $created=$exports->create($actor,(object)['export_id'=>$review['export_id'],'digest'=>$review['digest'],'operation_id'=>'public-export-create-'.$format]);
        publicDataCheck($created['status']==='created'&&$review['source']==='published','Published '.$format.' export is reviewed and durably created');
        $target=$root.'/portable-'.$format;mkdir($target,0700);$zip=new ZipArchive();if($zip->open($store->stage($review['export_id']).'/site.zip')!==true||!$zip->extractTo($target))throw new RuntimeException('Cannot extract reviewed archive.');$zip->close();
        publicDataCheck(!is_dir($target.'/_studio')&&!is_dir($target.'/vendor')&&!is_file($target.'/assets/data/memory.json')&&!is_file($target.'/assets/data/design-intelligence.json'),'Portable '.$format.' excludes Studio, its dependency loader and authoring memory');
        foreach($documents as$name=>$value)publicDataCheck(json_decode(file_get_contents($target.'/assets/data/'.$name.'.json'),true)===$value,'Portable '.$format.' '.$name.' is the exact published data, never the newer draft');
        $portableBase=publicDataServer($target);
        if($format==='php'){$hosts['portable PHP endpoint']=$portableBase;publicDataCheck($review['dependencies']['public_mcp']==='read_only','Portable PHP declares the public read interface');}
        else {publicDataCheck(!is_file($target.'/mcp.php')&&$review['dependencies']['public_mcp']==='omitted','Static export does not claim a PHP MCP endpoint');publicDataCheck(str_contains(file_get_contents($portableBase.'/index.html'),'<h1>Home</h1>'),'Static published HTML renders independently over HTTP');}
    }
    foreach($hosts as$label=>$host){
        $listed=publicDataMcp($host,'tools/list');$available=array_column($listed['body']['result']['tools']??[],'name');
        publicDataCheck($listed['status']===200&&array_diff(array_keys($names),$available)===[],$label.' advertises all four available public data tools');
        foreach($names as$name=>$document)publicDataCheck(publicDataTool($host,$name)===$documents[$document],$label.' '.$name.' returns the exact published document');
        publicDataCheck(publicDataTool($host,'get_menu',['category'=>'WEEKEND'])===$menu,$label.' applies the public category filter');
        publicDataCheck(publicDataTool($host,'get_faq',['query'=>'weekend'])===$faq,$label.' applies the public FAQ filter');
        $resources=publicDataMcp($host,'resources/list');
        publicDataCheck(!str_contains(CanonicalJson::encode($resources),'site://memory')&&!str_contains(CanonicalJson::encode($resources),'site://design-intelligence'),$label.' hides authoring resources from discovery');
        foreach(['memory','design-intelligence']as$resource)publicDataCheck(isset(publicDataMcp($host,'resources/read',['uri'=>'site://'.$resource])['body']['error']),$label.' refuses explicit '.$resource.' resource reads');
        publicDataCheck(json_decode(publicDataMcp($host,'resources/read',['uri'=>'site://info'])['body']['result']['contents'][0]['text'],true)===$documents['site'],$label.' keeps the public site resource exact');
    }
    publicDataCheck(!is_file($root.'/published/assets/data/memory.json')&&!is_file($root.'/published/assets/data/design-intelligence.json'),'Publication excludes both authoring-only documents');
    publicDataCheck(siteControlState($root.'/studio.db')===$before,'Reads and published exports preserve all draft/live bytes, page projections and workspace version');
    foreach(['memory','design-intelligence']as$name){
        $curl=curl_init($base.'/assets/data/'.$name.'.json');curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>10]);$body=curl_exec($curl);
        publicDataCheck(curl_getinfo($curl,CURLINFO_HTTP_CODE)===404&&is_string($body)&&!str_contains($body,'AUTHORING_MEMORY_SENTINEL'),'Direct public '.$name.' URL cannot expose private authoring context');
        publicDataCheck($files->readFile('assets/data/'.$name.'.json')==='{"secret":"AUTHORING_MEMORY_SENTINEL"}','Private FileManager still reads '.$name.' for authoring');
    }
    // Represent an already managed release produced before this exclusion. The
    // current-release manifest is seeded explicitly; sealed publish receipts
    // remain untouched, as they must during a real upgrade.
    $releaseId=$workspace->status()['release_id'];$release=$db->queryOne('SELECT * FROM site_releases WHERE id=?',[$releaseId]);
    $managed=json_decode($release['manifest_json'],true,64,JSON_THROW_ON_ERROR);$prior=[];
    foreach(['memory','design-intelligence']as$name){$path='assets/data/'.$name.'.json';$prior[$path]='{"old_private_context":"'. $name .'"}';file_put_contents($root.'/published/'.$path,$prior[$path]);$managed[$path]=hash('sha256',$prior[$path]);}
    $db->update('site_releases',['manifest_json'=>CanonicalJson::encode($managed),'digest'=>CanonicalJson::digest($managed)],'id=?',[$releaseId]);
    $cleanup=$publisher->prepare($actor,(object)['request_id'=>'public-private-cleanup-review','base_draft_version'=>'draft:'.$workspace->status()['draft_version']]);
    $effects=array_column($cleanup['files'],null,'path');
    foreach($prior as$path=>$bytes)publicDataCheck(in_array($path,$cleanup['deletions'],true)&&$effects[$path]['action']==='delete'&&$effects[$path]['before_hash']===hash('sha256',$bytes)&&$effects[$path]['after_hash']===null&&file_get_contents($root.'/published/'.$path)===$bytes,'Previously managed '.$path.' receives an exact reviewed deletion without early mutation');
    file_put_contents($root.'/published/assets/data/memory.json','EXTERNAL_CHANGE_AFTER_REVIEW');
    $race=$publisher->publish($actor,(object)['plan_id'=>$cleanup['plan_id'],'digest'=>$cleanup['digest'],'operation_id'=>'public-private-cleanup-race']);
    publicDataCheck($race['status']==='failed_restored'&&$race['result']['error']['code']==='content_conflict','Private-context cleanup refuses live drift after review');
    publicDataCheck(file_get_contents($root.'/published/assets/data/memory.json')==='EXTERNAL_CHANGE_AFTER_REVIEW','Cleanup rejection preserves the external writer bytes');
    file_put_contents($root.'/published/assets/data/memory.json',$prior['assets/data/memory.json']);
    $cleanup=$publisher->prepare($actor,(object)['request_id'=>'public-private-cleanup-retry','base_draft_version'=>'draft:'.$workspace->status()['draft_version']]);
    $removed=$publisher->publish($actor,(object)['plan_id'=>$cleanup['plan_id'],'digest'=>$cleanup['digest'],'operation_id'=>'public-private-cleanup-publish']);
    while($removed['status']==='applying')$removed=$publisher->continue($actor,$removed['operation_id'],$removed['checkpoint']);
    publicDataCheck($removed['status']==='succeeded'&&array_diff(array_keys($prior),$removed['result']['removed'])===[],'Reviewed cleanup removes both previously managed authoring-only public files');
    foreach(array_keys($prior)as$path)publicDataCheck(!is_file($root.'/published/'.$path)&&$files->readFile($path)==='{"secret":"AUTHORING_MEMORY_SENTINEL"}','Cleanup keeps '.$path.' exclusively in the private draft');
    file_put_contents($root.'/published/assets/data/memory.json','UNOWNED_EXTERNAL_FILE');
    $unowned=$publisher->prepare($actor,(object)['request_id'=>'public-private-unowned','base_draft_version'=>'draft:'.$workspace->status()['draft_version']]);
    publicDataCheck(!in_array('assets/data/memory.json',array_column($unowned['files'],'path'),true)&&file_get_contents($root.'/published/assets/data/memory.json')==='UNOWNED_EXTERNAL_FILE','Excluded unowned live files are preserved and never adopted into the managed domain');
    file_put_contents($root.'/preview/unproven.php','<h1>Draft candidate</h1>');file_put_contents($root.'/published/unproven.php','EXTERNAL_UNPROVEN_PAGE');
    publicDataReject(fn()=>$publisher->prepare($actor,(object)['request_id'=>'public-private-unproven','base_draft_version'=>'draft:'.$workspace->status()['draft_version']]),'ownership_conflict','The private-file exclusion does not bypass ordinary live ownership refusal');
    publicDataCheck(file_get_contents($root.'/published/unproven.php')==='EXTERNAL_UNPROVEN_PAGE','Rejected ownership preserves the unrelated external page');
    $attempts=array_filter(explode("\n",trim(file_get_contents($root.'/provider-attempts.log'))),static fn($value)=>$value!=='0');
    publicDataCheck($attempts===[]&&$GLOBALS['lifecycle_provider_attempts']===0,'Actual REST, publication and public/export reads make zero provider or Router transport attempts');
    foreach($servers as[$server,$log])publicDataCheck(!preg_match('/(?:PHP )?(?:Warning|Deprecated|Fatal error|Notice):/',file_get_contents($log)),'HTTP fixture log has no PHP diagnostics');
    echo $checks." public-data boundary checks passed\n";
} finally {
    foreach($servers as[$server]){proc_terminate($server);proc_close($server);}Database::resetInstance();publicDataRemove($root);
}
