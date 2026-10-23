<?php
declare(strict_types=1);

$root=realpath($argv[1]??'');
if (!$root || !str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-install-route-')
    || !is_file($root.'/.install-route-test')) throw new RuntimeException('Disposable installation required.');
$input=json_decode(stream_get_contents(STDIN),true,64,JSON_THROW_ON_ERROR);
foreach (['router.php','middleware.php','endpoints/install.php','endpoints/mcp-connections.php','endpoints/settings.php','endpoints/files.php','endpoints/site-reset.php','endpoints/api-keys.php'] as $file) {
    if (hash_file('sha256',$root.'/_studio/api/'.$file)!==hash_file('sha256',dirname(__DIR__,2).'/api/'.$file)) {
        throw new RuntimeException('Route fixture differs from production.');
    }
}
require_once $root . '/vendor/autoload.php';
spl_autoload_register(static function(string $class) use($root):void {
    if (str_starts_with($class,'VoxelSite\\')) {
        $path=$root.'/_studio/engine/'.str_replace('\\','/',substr($class,10)).'.php';
        if (is_file($path)) require_once $path;
    }
},true,true);
foreach (['VS_TEST_PREVIEW_DIR'=>$root.'/_studio/preview','VS_TEST_ASSETS_DIR'=>$root.'/assets',
    'VS_TEST_DOC_ROOT'=>$root,'VS_TEST_MUTATION_LOCK'=>$root.'/_studio/data/site-mutation.lock',
    'VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/_studio/data/workspace'] as $key=>$value) putenv($key.'='.$value);
require_once $root.'/_studio/engine/bootstrap.php';
if (!str_starts_with((new ReflectionClass(VoxelSite\Database::class))->getFileName(),$root.'/')) {
    throw new RuntimeException('Database must use disposable source.');
}
foreach (['logDir'=>$root.'/_studio/data/logs','initialized'=>true] as $property=>$value) {
    (new ReflectionProperty(VoxelSite\Logger::class,$property))->setValue(null,$value);
}
if (($input['operation']??'')==='inspect') {
    $db=VoxelSite\Database::getInstance();
    $settings=new VoxelSite\Settings($db);
    echo json_encode(['settings'=>$settings->getAll(),'users'=>$db->query('SELECT id,name,email,role,password_hash FROM users'),
        'sessions'=>$db->query('SELECT id,user_id FROM sessions'),'keys'=>$db->query('SELECT * FROM api_keys')],JSON_THROW_ON_ERROR);
    exit;
}
if (($input['operation']??'')==='activate_fixture') {
    $db=VoxelSite\Database::getInstance();
    $db->update('site_workspace_state',['format'=>2],'id = 1');
    (new VoxelSite\Settings($db))->set('workspace_base_url','https://fixture.invalid/subdirectory');
    if (is_link($root.'/_studio/preview/assets')) unlink($root.'/_studio/preview/assets');
    if (!is_dir($root.'/_studio/preview/assets')) mkdir($root.'/_studio/preview/assets',0700,true);
    file_put_contents($root.'/_studio/preview/.htaccess',VoxelSite\SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
    foreach (['_studio/preview/assets/data','assets/data'] as $dir) if (!is_dir($root.'/'.$dir)) mkdir($root.'/'.$dir,0700,true);
    file_put_contents($root.'/_studio/preview/assets/data/editor.json',"{\"draft\":true}\n");
    file_put_contents($root.'/assets/data/editor.json',"{\"published\":true}\n");
    $id=$db->insert('users',['name'=>'Editor','email'=>'editor@example.invalid','password_hash'=>'not-a-login',
        'role'=>'editor','created_at'=>now(),'updated_at'=>now()]);
    $token=bin2hex(random_bytes(32));
    $db->insert('sessions',['id'=>$token,'user_id'=>$id,'created_at'=>now(),'expires_at'=>gmdate('c',time()+3600),
        'ip_address'=>'127.0.0.1','user_agent'=>'Installation fixture']);
    echo json_encode(['editor'=>$token],JSON_THROW_ON_ERROR);exit;
}
if (($input['operation']??'')==='storage_failure_fixture') {
    $db=VoxelSite\Database::getInstance();
    $db->exec('DROP TRIGGER IF EXISTS fixture_admin_storage_failure');
    if($input['enabled']??false)$db->exec("CREATE TRIGGER fixture_admin_storage_failure BEFORE INSERT ON agent_admin_plans BEGIN SELECT RAISE(ABORT,'Fixture storage write unavailable'); END");
    echo '{"ok":true}';exit;
}
if (($input['operation']??'')==='workspace_read_failure_fixture') {
    $db=VoxelSite\Database::getInstance();
    if($input['enabled']??false) {
        $db->exec('ALTER TABLE site_workspace_state RENAME TO fixture_workspace_state');
        $db->exec('CREATE VIEW site_workspace_state AS SELECT fixture_unavailable_storage() AS id');
    } else {
        $db->exec('DROP VIEW site_workspace_state');
        $db->exec('ALTER TABLE fixture_workspace_state RENAME TO site_workspace_state');
    }
    echo '{"ok":true}';exit;
}
if (($input['operation']??'')==='prepare_admin_fixture') {
    $db=VoxelSite\Database::getInstance();$policy=new VoxelSite\Agent\ActorPolicy($db);
    $owner=new VoxelSite\Agent\OperationActor('user',1,null,[],'studio_configured',null);
    $key=(new VoxelSite\Agent\CredentialService($db))->create($owner,1,'read','Approval fixture',null,null,['team:write']);
    $approvals=new VoxelSite\Agent\AdminApprovalStore($db,$policy,new VoxelSite\SiteWorkspace($db),loadConfig()['app_key']);
    $admin=new VoxelSite\Agent\AdministrationService($db,$policy,$approvals);
    $plan=$admin->prepare($policy->fromCredential($key['id']),(object)['operation_id'=>'route-team-create-001',
        'intent'=>(object)['type'=>'team.create','name'=>'Reviewed editor','email'=>'reviewed@example.invalid',
            'password'=>'fixture-owner-review-secret','role'=>'editor']]);
    echo json_encode(['plan'=>$plan,'credential_id'=>$key['id']],JSON_THROW_ON_ERROR);exit;
}
final class InstallInputStream {
    public $context;private int $offset=0;private string $body='';
    public function stream_open($path,$mode,$options,&$openedPath):bool {
        global $input;if ($path!=='php://input') return false;
        $this->body=json_encode($input['body']??[],JSON_THROW_ON_ERROR);return true;
    }
    public function stream_read($count):string {$part=substr($this->body,$this->offset,$count);$this->offset+=strlen($part);return $part;}
    public function stream_eof():bool {return $this->offset>=strlen($this->body);}
    public function stream_stat():array {return [];}
}
$_SERVER=['REQUEST_METHOD'=>$input['method'],'REQUEST_URI'=>'/subdirectory/_studio/api/router.php',
    'SCRIPT_NAME'=>'/subdirectory/_studio/api/router.php','REMOTE_ADDR'=>'127.0.0.1'];
if (isset($input['csrf'])) $_SERVER['HTTP_X_VS_TOKEN']=$input['csrf'];
$_COOKIE=isset($input['session'])?['vs_session'=>$input['session']]:[];
$_GET=['_path'=>$input['path']]+($input['query']??[]);$_POST=$_REQUEST=[];
stream_wrapper_unregister('php');stream_wrapper_register('php',InstallInputStream::class);
ob_start();
register_shutdown_function(static function():void {
    $body=ob_get_clean();stream_wrapper_restore('php');
    echo json_encode(['status'=>http_response_code()?:200,'response'=>json_decode($body,true)??$body],JSON_THROW_ON_ERROR);
});
// Any accidentally introduced model call throws before a network transport.
VoxelSite\Agent\ProviderCallPolicy::runExternal(static function() use($root):void {require $root.'/_studio/api/router.php';});
