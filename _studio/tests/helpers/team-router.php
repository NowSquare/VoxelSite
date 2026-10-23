<?php
declare(strict_types=1);
// Loopback-only disposable test router, copied beside its own migrated DB.
$url=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
if($url!=='/_studio/api/router.php') {
    $file=realpath(__DIR__.$url);
    if($file && str_starts_with($file,__DIR__.'/_studio/ui/') && is_file($file) && in_array(pathinfo($file,PATHINFO_EXTENSION),['js','css','woff2','woff'],true)) {
        header('Content-Type: '.match(pathinfo($file,PATHINFO_EXTENSION)){'js'=>'text/javascript','css'=>'text/css',default=>'font/woff2'});readfile($file);return;
    }
    if($url==='/' && is_file(__DIR__.'/index.html')){header('Content-Type: text/html');readfile(__DIR__.'/index.html');return;}
    http_response_code(404);return;
}
require __DIR__.'/_studio/engine/bootstrap.php';
\VoxelSite\Database::getInstance(__DIR__.'/_studio/data/studio.db');
function jsonResponse(array $data,int $status=200):never {http_response_code($status);header('Content-Type: application/json');echo json_encode($data);exit;}
function getJsonBody():array {return json_decode(file_get_contents('php://input',false,null,0,131073),true,32,JSON_THROW_ON_ERROR);}
$path=$_GET['_path']??'';
$_REQUEST['_route_path']=$path;$_REQUEST['_route_method']=$_SERVER['REQUEST_METHOD'];
$_REQUEST['_user']=['id'=>(int)($_SERVER['HTTP_X_FIXTURE_USER']??1)];
if(preg_match('~^/team(?:/([0-9]+))?(?:/password)?$~D',$path,$match)) {
    $_REQUEST['_route_params']=isset($match[1])?['id'=>(int)$match[1]]:[];
    require __DIR__.'/_studio/api/endpoints/team.php';return;
}
if(str_starts_with($path,'/settings/mcp')) {
    $_REQUEST['_route_params']=preg_match('~/approvals/([^/]+)/~',$path,$match)?['id'=>$match[1]]:[];
    require __DIR__.'/_studio/api/endpoints/mcp-connections.php';return;
}
jsonResponse(['ok'=>false],404);
