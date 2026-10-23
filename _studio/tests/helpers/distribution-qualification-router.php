<?php
declare(strict_types=1);
// External loopback adapter. It is never copied into a release ZIP.
$root=realpath(getenv('VS_DISTRIBUTION_ROOT')?:'');
if(!$root || !str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-distribution-')
    || !is_file($root.'/.distribution-fixture') || !in_array($_SERVER['REMOTE_ADDR']??'', ['127.0.0.1','::1'],true)) {
    http_response_code(403);return;
}
$site=$root.'/site';$path=rawurldecode(parse_url($_SERVER['REQUEST_URI']??'/',PHP_URL_PATH)??'/');
if(str_contains($path,"\0")||str_contains($path,'..')||str_contains($path,'\\')){http_response_code(404);return;}
// PHP's developer server does not process .htaccess. This explicit adapter
// models the required private-directory rule; it does not qualify Apache/cPanel.
foreach(['/_studio/preview/','/_studio/data/','/_studio/tests/','/_data/','/dist/'] as $private)
    if(str_starts_with($path,$private)){http_response_code(403);return;}
$GLOBALS['lifecycle_provider_attempts']=0;
require __DIR__.'/lifecycle-provider-trap.php';
register_shutdown_function(static function()use($root,$path):void{
    file_put_contents($root.'/http-events.ndjson',json_encode(['path'=>$path,'status'=>http_response_code()?:200,
        'provider_attempts'=>$GLOBALS['lifecycle_provider_attempts']??0],JSON_THROW_ON_ERROR)."\n",FILE_APPEND);
});
if(str_starts_with($path,'/_studio/api/'))$relative='_studio/api/router.php';
else $relative=ltrim($path,'/')?:'index.php';
if($relative==='_studio/' || $relative==='_studio')$relative='_studio/index.php';
$file=realpath($site.'/'.$relative);
if(!$file||!str_starts_with($file,$site.'/')||!is_file($file)){http_response_code(404);return;}
if(str_ends_with($file,'.php')){
    $_SERVER['SCRIPT_FILENAME']=$file;$_SERVER['SCRIPT_NAME']='/'.$relative;
    $_SERVER['SERVER_ADDR']='127.0.0.1';require $file;return;
}
header('Content-Type: '.match(pathinfo($file,PATHINFO_EXTENSION)){
    'css'=>'text/css','js'=>'text/javascript','json'=>'application/json','svg'=>'image/svg+xml',default=>'application/octet-stream'});
readfile($file);
