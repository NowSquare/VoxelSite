<?php
declare(strict_types=1);
require_once __DIR__.'/helpers/StudioRuntimeFixture.php';

// Execute the production handoff entrypoints in a complete disposable installation.
$root=realpath(sys_get_temp_dir()).'/vs-mcp-handoff-'.bin2hex(random_bytes(8));
mkdir($root,0700);$root=realpath($root);
\VoxelSite\Tests\StudioRuntimeFixture::copy($root);
foreach(['_studio/data/logs','_studio/data/actions','_studio/preview/assets','assets'] as $dir) {
    if(!is_dir($root.'/'.$dir))mkdir($root.'/'.$dir,0700,true);
}
function handoffCopy(string $source,string $target):void {
    if(is_link($source))throw new RuntimeException('Fixture source cannot be a link.');
    if(is_dir($source)) {
        if(!is_dir($target))mkdir($target,0700,true);
        foreach(new DirectoryIterator($source) as $entry)if(!$entry->isDot())handoffCopy($entry->getPathname(),$target.'/'.$entry->getFilename());
    }elseif(!copy($source,$target))throw new RuntimeException('Cannot copy disposable website fixture.');
}
handoffCopy(__DIR__.'/fixtures/mcp/site-lifecycle/site',$root.'/_studio/preview');
require $root.'/_studio/engine/bootstrap.php';
use VoxelSite\{Database,Encryption,ExportService,Migrator,Settings,SiteWorkspace,TailwindCompiler};
use VoxelSite\Agent\{ActorPolicy,CredentialService,DownloadGrantStore,OperationActor,OperationStore,PreviewService,PublishPlanService,ReleaseStore};
if(!str_starts_with((new ReflectionClass(Database::class))->getFileName(),$root.'/'))throw new RuntimeException('Only disposable runtime source may execute.');
$db=Database::getInstance();$settings=new Settings($db);(new Migrator($db,$settings))->run();
$db->insert('users',['name'=>'Handoff owner','email'=>'handoff@example.invalid','password_hash'=>'not-a-login','role'=>'owner','created_at'=>now(),'updated_at'=>now()]);
$db->update('site_workspace_state',['format'=>2,'draft_version'=>1],'id=1');
file_put_contents($root.'/_studio/preview/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
(new TailwindCompiler($root.'/_studio/preview/assets/css'))->compile($root.'/_studio/preview',$root.'/_studio/preview/assets/css/tailwind.css',1048576);
$config=['app_key'=>Encryption::generateKey()];
file_put_contents($root.'/_studio/data/config.json',json_encode($config,JSON_THROW_ON_ERROR));
$socket=stream_socket_server('tcp://127.0.0.1:0',$errno,$error);
if(!$socket)throw new RuntimeException('Cannot allocate disposable HTTP listener: '.$error);
$address=stream_socket_get_name($socket,false);fclose($socket);$base='http://'.$address;
$settings->setMany(['site_url'=>$base,'workspace_base_url'=>$base,'studio_mcp_enabled'=>true]);
$workspace=new SiteWorkspace($db);$policy=new ActorPolicy($db);
$owner=new OperationActor('user',1,null,[],'studio_configured',null);
$credentials=new CredentialService($db);$key=$credentials->create($owner,1,'edit','Handoff fixture',null,time()+3600);
$actor=$policy->fromCredential($key['id']);
$preview=new PreviewService($db,$policy,$workspace);
$opened=$preview->open($actor,(object)['path'=>'index.php','draft_version'=>'draft:1']);
$previewTicket=substr($opened['browser_url'],strpos($opened['browser_url'],'#ticket=')+8);
$downloads=new DownloadGrantStore($db,$policy,$workspace,$root.'/_studio/data/agent/exports');
$publisher=new PublishPlanService($db,$policy,$workspace,new ReleaseStore($db,$policy,$root.'/_studio/data/agent/releases'),
    new OperationStore($db,$policy,$workspace->mutationLockPath()),$root.'/_studio/data/actions',$root.'/_studio/data/published-manifest.json');
$exports=new ExportService($db,$policy,$workspace,$downloads,$publisher);
$review=$exports->prepare($actor,(object)['request_id'=>'handoff-export-review','source'=>'draft','version'=>'draft:1','format'=>'php']);
$exports->create($actor,(object)['export_id'=>$review['export_id'],'digest'=>$review['digest'],'operation_id'=>'handoff-export-create']);
$download=$exports->download($actor,(object)['export_id'=>$review['export_id']]);
$downloadTicket=explode('#',$download['download_url'],2)[1];
$log=$root.'/http.log';
$server=proc_open([PHP_BINARY,'-S',$address,'-t',$root],[0=>['pipe','r'],1=>['file',$log,'a'],2=>['file',$log,'a']],$pipes,$root);
if(!is_resource($server))throw new RuntimeException('Cannot start disposable HTTP server.');fclose($pipes[0]);
$checks=0;
function handoffCheck(bool $ok,string $message):void {
    global $checks;if(!$ok)throw new RuntimeException('FAIL '.$message);$checks++;echo 'PASS '.$message."\n";
}
function handoffRequest(string $path,?string $body=null,array $headers=[]):array {
    global $base;$received=[];$curl=curl_init($base.$path);
    curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_TIMEOUT=>10,
        CURLOPT_HEADERFUNCTION=>static function($curl,string $line)use(&$received):int{$received[]=trim($line);return strlen($line);},
        CURLOPT_CUSTOMREQUEST=>$body===null?'GET':'POST',CURLOPT_HTTPHEADER=>$headers]);
    if($body!==null)curl_setopt($curl,CURLOPT_POSTFIELDS,$body);
    $response=curl_exec($curl);if($response===false)throw new RuntimeException(curl_error($curl));
    return ['status'=>curl_getinfo($curl,CURLINFO_HTTP_CODE),'body'=>$response,'headers'=>implode("\n",$received)];
}
try {
    $ready=false;
    for($i=0;$i<100;$i++){$socket=@stream_socket_client('tcp://'.$address,$errno,$error,0.1);if($socket){fclose($socket);$ready=true;break;}usleep(20000);}
    handoffCheck($ready,'Disposable HTTP runtime starts');
    foreach(['preview','download'] as $endpoint) {
        $response=handoffRequest('/_studio/api/mcp/'.$endpoint.'.php');
        handoffCheck($response['status']===200 && str_contains($response['body'],'history.replaceState'),
            'Settings-enabled '.$endpoint.' handoff works without a config switch');
        handoffCheck(str_contains($response['headers'],'Cache-Control: no-store, private')
            && str_contains($response['headers'],'Referrer-Policy: no-referrer'),$endpoint.' bootstrap keeps private response headers');
    }
    $settings->set('studio_mcp_enabled',false);
    foreach(['preview','download'] as $endpoint)handoffCheck(handoffRequest('/_studio/api/mcp/'.$endpoint.'.php')['status']===503,'Disabled Settings block '.$endpoint);
    file_put_contents($root.'/_studio/data/config.json',json_encode($config+['studio_mcp'=>['enabled'=>true]],JSON_THROW_ON_ERROR));
    foreach(['preview','download'] as $endpoint)handoffCheck(handoffRequest('/_studio/api/mcp/'.$endpoint.'.php')['status']===200,'Explicit config enable controls '.$endpoint);
    $settings->set('studio_mcp_enabled',true);
    file_put_contents($root.'/_studio/data/config.json',json_encode($config+['studio_mcp'=>['enabled'=>false]],JSON_THROW_ON_ERROR));
    $previewPath='/_studio/api/mcp/preview.php?view=exchange';$downloadPath='/_studio/api/mcp/download.php';
    $previewHeaders=['Origin: '.$base,'Sec-Fetch-Site: same-origin','Content-Type: application/x-www-form-urlencoded'];
    $downloadHeaders=['Origin: '.$base,'Content-Type: application/json'];
    handoffCheck(handoffRequest($previewPath,http_build_query(['ticket'=>$previewTicket]),$previewHeaders)['status']===503,
        'Explicit config disable blocks a valid preview grant');
    handoffCheck(handoffRequest($downloadPath,json_encode(['ticket'=>$downloadTicket]),$downloadHeaders)['status']===503,
        'Explicit config disable blocks a valid download grant');
    file_put_contents($root.'/_studio/data/config.json',json_encode($config,JSON_THROW_ON_ERROR));
    $exchange=handoffRequest($previewPath,http_build_query(['ticket'=>$previewTicket]),$previewHeaders);
    handoffCheck($exchange['status']===303 && preg_match('/vs_preview_grant=([a-f0-9]{64})/',$exchange['headers'],$cookie)===1,
        'Settings-enabled entrypoint exchanges the retained preview ticket');
    $page=handoffRequest('/_studio/api/mcp/preview.php?path=index.php',null,['Cookie: vs_preview_grant='.$cookie[1]]);
    handoffCheck($page['status']===200 && str_contains($page['body'],'VoxelSitePreview'),'Production preview entrypoint renders the authorized private draft');
    $archive=handoffRequest($downloadPath,json_encode(['ticket'=>$downloadTicket]),$downloadHeaders);
    handoffCheck($archive['status']===200 && hash('sha256',$archive['body'])===$review['archive_sha256'],
        'Production download entrypoint streams the exact reviewed archive');
    handoffCheck(handoffRequest($downloadPath,json_encode(['ticket'=>$downloadTicket]),$downloadHeaders)['status']===410,
        'Production download grant remains single use');
    file_put_contents($root.'/.demo','fixture');
    foreach(['preview','download'] as $endpoint)handoffCheck(handoffRequest('/_studio/api/mcp/'.$endpoint.'.php')['status']===503,'Demo mode blocks '.$endpoint);
    unlink($root.'/.demo');
    handoffCheck(!preg_match('/(?:Warning|Deprecated|Notice|Fatal error|Parse error):/',(string)file_get_contents($log)),
        'Production handoff requests produce no PHP diagnostics');
    echo "MCP handoff routes: {$checks} checks passed. Fixture: {$root}\n";
} finally {proc_terminate($server);proc_close($server);}
