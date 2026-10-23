<?php
declare(strict_types=1);
$root=realpath($argv[1]??'');if(!$root||!str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-update-')||!is_file($root.'/.update-routes'))throw new RuntimeException('Disposable update fixture required.');
$input=json_decode(stream_get_contents(STDIN),true,32,JSON_THROW_ON_ERROR);
foreach(['VS_TEST_PREVIEW_DIR'=>$root.'/draft','VS_TEST_DOC_ROOT'=>$root.'/live','VS_TEST_ASSETS_DIR'=>$root.'/live/assets','VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/private/workspace','VS_TEST_MUTATION_LOCK'=>$root.'/private/site.lock','VS_TEST_REVISIONS_DIR'=>$root.'/private/revisions'] as $key=>$value)putenv($key.'='.$value);
require_once $root.'/live/_studio/engine/bootstrap.php';
VoxelSite\Database::getInstance($root.'/live/_studio/data/studio.db');
foreach(['logDir'=>$root.'/private','initialized'=>true] as $key=>$value)(new ReflectionProperty(VoxelSite\Logger::class,$key))->setValue(null,$value);
final class UpdateRouteInput {
    public $context;private int $offset=0;private string $body='';
    public function stream_open($path,$mode,$options,&$openedPath):bool {global $input;if($path!=='php://input')return false;$this->body=json_encode($input['body']??[],JSON_THROW_ON_ERROR);return true;}
    public function stream_read($count):string{$chunk=substr($this->body,$this->offset,$count);$this->offset+=strlen($chunk);return $chunk;}
    public function stream_eof():bool{return $this->offset>=strlen($this->body);}
    public function stream_stat():array{return [];}
}
$_SERVER=['REQUEST_METHOD'=>$input['method'],'REQUEST_URI'=>'/_studio/api/router.php','SCRIPT_NAME'=>'/_studio/api/router.php','REMOTE_ADDR'=>'127.0.0.1','HTTP_X_VS_TOKEN'=>$input['csrf']??str_repeat('f',64)];
$_COOKIE=['vs_session'=>str_repeat('f',64)];$_GET=['_path'=>$input['path']]+($input['query']??[]);$_POST=$_REQUEST=[];
stream_wrapper_unregister('php');stream_wrapper_register('php',UpdateRouteInput::class);
ob_start();register_shutdown_function(static function():void{$out=ob_get_clean();stream_wrapper_restore('php');echo json_encode(['status'=>http_response_code()?:200,'body'=>json_decode($out,true)??$out],JSON_THROW_ON_ERROR);});
VoxelSite\Agent\ProviderCallPolicy::runExternal(static function()use($root):void{require $root.'/live/_studio/api/router.php';});
