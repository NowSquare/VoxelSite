<?php
declare(strict_types=1);
$root=realpath($argv[1]??'');
if(!$root||!str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-studio-authoring-')||!is_file($root.'/.authoring-routes'))throw new RuntimeException('Disposable authoring fixture required.');
$input=json_decode(stream_get_contents(STDIN),true,32,JSON_THROW_ON_ERROR);
require_once $root . '/vendor/autoload.php';
spl_autoload_register(static function(string $class)use($root):void{if(str_starts_with($class,'VoxelSite\\')){$path=$root.'/_studio/engine/'.str_replace('\\','/',substr($class,10)).'.php';if(is_file($path))require_once $path;}},true,true);
foreach(['VS_TEST_PREVIEW_DIR'=>$root.'/draft','VS_TEST_DOC_ROOT'=>$root.'/live','VS_TEST_ASSETS_DIR'=>$root.'/live/assets','VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/private/workspace','VS_TEST_MUTATION_LOCK'=>$root.'/private/site.lock','VS_TEST_REVISIONS_DIR'=>$root.'/private/revisions'] as $key=>$value)putenv($key.'='.$value);
require_once $root.'/_studio/engine/bootstrap.php';
VoxelSite\Database::getInstance($root.'/private/studio.db');
final class AuthoringInputStream {
    public $context;private int $offset=0;private string $body='';
    public function stream_open($path,$mode,$options,&$openedPath):bool{global $input;if($path!=='php://input')return false;$this->body=json_encode($input['body']??[],JSON_THROW_ON_ERROR);return true;}
    public function stream_read($count):string{$part=substr($this->body,$this->offset,$count);$this->offset+=strlen($part);return $part;}
    public function stream_eof():bool{return $this->offset>=strlen($this->body);}
    public function stream_stat():array{return [];}
}
$_SERVER=['REQUEST_METHOD'=>$input['method'],'REQUEST_URI'=>'/_studio/api/router.php','SCRIPT_NAME'=>'/_studio/api/router.php','REMOTE_ADDR'=>'127.0.0.1','HTTP_X_VS_TOKEN'=>str_repeat('a',64)];
$_COOKIE=['vs_session'=>str_repeat('a',64)];$_GET=['_path'=>$input['path']]+($input['query']??[]);$_POST=$_REQUEST=[];
if(($input['surface']??'studio')==='rest'){
    $_SERVER['REQUEST_URI']='/_studio/api/agent/v1'.$input['path'];
    $_SERVER['SCRIPT_NAME']='/_studio/api/agent/v1/router.php';
    $_SERVER['HTTP_AUTHORIZATION']='Bearer '.($input['key']??'');$_COOKIE=[];
}
stream_wrapper_unregister('php');stream_wrapper_register('php',AuthoringInputStream::class);
ob_start();register_shutdown_function(static function():void{$body=ob_get_clean();stream_wrapper_restore('php');echo json_encode(['status'=>http_response_code()?:200,'body'=>json_decode($body,true)??$body],JSON_THROW_ON_ERROR);});
VoxelSite\Agent\ProviderCallPolicy::runExternal(static function()use($root,$input):void{
    require $root.((($input['surface']??'studio')==='rest')?'/_studio/api/agent/v1/router.php':'/_studio/api/router.php');
});
