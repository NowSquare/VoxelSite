<?php
declare(strict_types=1);
require_once __DIR__ . '/StudioRuntimeFixture.php';

// Developer-only disposable web installation. Never reads installed config,
// generated website files, credentials, or business data from the checkout.
$port=filter_var($argv[1]??null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1024,'max_range'=>65535]]);
if (!$port) throw new RuntimeException('Pass a localhost test port.');
$source=dirname(__DIR__,3);
$root=realpath(sys_get_temp_dir()).'/vs-mcp-client-'.bin2hex(random_bytes(6));
mkdir($root,0700);$root=realpath($root);mkdir($root.'/site',0700);
function clientFixtureCopy(string $from,string $to):void {
    if (is_link($from)) throw new RuntimeException('Client fixture sources cannot be symlinks.');
    if (is_file($from)) {
        if (!is_dir(dirname($to))) mkdir(dirname($to),0700,true);
        if (!copy($from,$to)) throw new RuntimeException('Cannot copy client fixture source.');
        return;
    }
    mkdir($to,0700,true);
    foreach (scandir($from) as $name) if ($name!=='.' && $name!=='..') clientFixtureCopy($from.'/'.$name,$to.'/'.$name);
}
\VoxelSite\Tests\StudioRuntimeFixture::copy($root.'/site',$source);
foreach (['_studio/data/logs','_studio/preview/assets','assets'] as $path) mkdir($root.'/site/'.$path,0700,true);
copy(__DIR__.'/lifecycle-provider-trap.php',$root.'/provider-trap.php');
require $root.'/site/_studio/engine/bootstrap.php';
if (!str_starts_with((new ReflectionClass(VoxelSite\Database::class))->getFileName(),$root.'/site/'))
    throw new RuntimeException('Client fixture loaded non-isolated application source.');
$db=VoxelSite\Database::getInstance();
$settings=new VoxelSite\Settings($db);
(new VoxelSite\Migrator($db,$settings))->run();
$db->insert('users',['name'=>'Client fixture owner','email'=>'client@example.invalid','password_hash'=>'not-a-login',
    'role'=>'owner','created_at'=>now(),'updated_at'=>now()]);
file_put_contents($root.'/site/_studio/data/config.json',json_encode(['app_key'=>VoxelSite\Encryption::generateKey()],JSON_THROW_ON_ERROR));
$db->update('site_workspace_state',['format'=>2],'id = 1');
file_put_contents($root.'/site/_studio/preview/.htaccess',VoxelSite\SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
$base='http://127.0.0.1:'.$port.'/nested';
$settings->setMany(['site_url'=>$base,'workspace_base_url'=>$base,'site_name'=>'MCP client fixture','studio_mcp_enabled'=>true,'ai_setup_mode'=>'external']);
$owner=new VoxelSite\Agent\OperationActor('user',1,null,[],'studio_configured',null);
$key=(new VoxelSite\Agent\CredentialService($db))->create($owner,1,'publish','Disposable client qualification',null,time()+7200,['restore:live']);
file_put_contents($root.'/credential.txt',$key['key']);chmod($root.'/credential.txt',0600);
file_put_contents($root.'/fixture.json',json_encode(['root'=>$root,'endpoint'=>$base.'/_studio/mcp.php','credential_id'=>$key['id'],
    'created_at'=>gmdate('c'),'source_commit'=>null,'qualification'=>'working-tree-copy'],JSON_THROW_ON_ERROR|JSON_PRETTY_PRINT));
file_put_contents($root.'/router.php', <<<'PHP'
<?php
declare(strict_types=1);
$GLOBALS['lifecycle_provider_attempts']=0;
require __DIR__.'/provider-trap.php';
$body=file_get_contents('php://input');
$rpc=json_decode($body,true);
register_shutdown_function(static function() use($rpc):void {
    file_put_contents(__DIR__.'/requests.ndjson',json_encode([
        'method'=>$_SERVER['REQUEST_METHOD']??'','path'=>parse_url($_SERVER['REQUEST_URI']??'',PHP_URL_PATH),
        'rpc_method'=>$rpc['method']??null,'tool'=>$rpc['params']['name']??null,
        'protocol_header'=>$_SERVER['HTTP_MCP_PROTOCOL_VERSION']??null,'requested_protocol'=>$rpc['params']['protocolVersion']??null,
        'client'=>$rpc['params']['clientInfo']??null,'status'=>http_response_code()?:200,
        'provider_attempts'=>$GLOBALS['lifecycle_provider_attempts']],JSON_THROW_ON_ERROR)."\n",FILE_APPEND);
});
$path=rawurldecode(parse_url($_SERVER['REQUEST_URI']??'',PHP_URL_PATH)??'');
if (!str_starts_with($path,'/nested/') || str_contains($path,"\0")) {http_response_code(404);exit;}
$relative=substr($path,8);
if (str_starts_with($relative,'_studio/') && !in_array($relative,['_studio/mcp.php','_studio/api/mcp/preview.php'],true)) {
    http_response_code(403);exit;
}
$target=realpath(__DIR__.'/site/'.$relative);
if (!$target || !str_starts_with($target,__DIR__.'/site/') || !is_file($target)) {http_response_code(404);exit;}
if (str_ends_with($target,'.php')) {
    $_SERVER['SCRIPT_FILENAME']=$target;$_SERVER['SCRIPT_NAME']='/nested/'.$relative;
    require $target;
} else {
    header('Content-Type: '.(match(pathinfo($target,PATHINFO_EXTENSION)) {
        'css'=>'text/css','js'=>'text/javascript','json'=>'application/json','svg'=>'image/svg+xml','png'=>'image/png',
        default=>'application/octet-stream',
    }));
    readfile($target);
}
PHP);
echo json_encode(['root'=>$root,'endpoint'=>$base.'/_studio/mcp.php','credential_file'=>$root.'/credential.txt'],JSON_THROW_ON_ERROR)."\n";
