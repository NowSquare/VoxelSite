<?php
declare(strict_types=1);
$root=realpath(__DIR__);
if(!$root || !str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-studio-review-')
    || !is_file($root.'/.studio-review-fixture'))throw new RuntimeException('Disposable browser review router required.');
if(!in_array($_SERVER['REMOTE_ADDR']??'', ['127.0.0.1','::1'],true)){http_response_code(403);return;}
$GLOBALS['lifecycle_provider_attempts']=0;
require $root.'/provider-trap.php';
register_shutdown_function(static function()use($root):void {
    file_put_contents($root.'/requests.ndjson',json_encode(['method'=>$_SERVER['REQUEST_METHOD'],
        'path'=>parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH),'status'=>http_response_code()?:200,
        'route'=>is_string($_GET['_path']??null)&&preg_match('~^/[A-Za-z0-9/_-]{0,240}$~D',$_GET['_path'])?$_GET['_path']:null,
        'provider_attempts'=>$GLOBALS['lifecycle_provider_attempts']],JSON_THROW_ON_ERROR)."\n",FILE_APPEND);
});
$path=rawurldecode(parse_url($_SERVER['REQUEST_URI']??'',PHP_URL_PATH)??'');
if(!str_starts_with($path,'/review/')||str_contains($path,"\0")||str_contains($path,'..')){http_response_code(404);return;}
$relative=substr($path,8);
if($relative==='_studio'||$relative==='_studio/')$relative='_studio/index.php';
if(str_starts_with($relative,'_studio/api/') && !str_starts_with($relative,'_studio/api/mcp/')){
    $_SERVER['SCRIPT_NAME']='/review/_studio/api/router.php';
    $_SERVER['SCRIPT_FILENAME']=$root.'/site/_studio/api/router.php';
    require $_SERVER['SCRIPT_FILENAME'];return;
}
$entry=in_array($relative,['_studio/index.php','_studio/install.php','_studio/workspace.php','_studio/mcp.php',
    '_studio/api/mcp/preview.php','_studio/api/mcp/download.php','_studio/update-runtime.php','_studio/factory-reset.php'],true);
$asset=str_starts_with($relative,'_studio/ui/') && in_array(strtolower(pathinfo($relative,PATHINFO_EXTENSION)),
    ['js','css','woff','woff2','ttf','svg','png','ico','json'],true);
if(!$entry&&!$asset){http_response_code(404);return;}
$file=realpath($root.'/site/'.$relative);
if(!$file||!str_starts_with($file,$root.'/site/')||!is_file($file)){http_response_code(404);return;}
if($entry){$_SERVER['SCRIPT_NAME']='/review/'.$relative;$_SERVER['SCRIPT_FILENAME']=$file;require $file;return;}
header('Content-Type: '.match(strtolower(pathinfo($file,PATHINFO_EXTENSION))){
    'js'=>'text/javascript','css'=>'text/css','json'=>'application/json','svg'=>'image/svg+xml','png'=>'image/png',
    'ico'=>'image/x-icon','woff'=>'font/woff','woff2'=>'font/woff2','ttf'=>'font/ttf',default=>'application/octet-stream'});
readfile($file);
