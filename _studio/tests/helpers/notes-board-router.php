<?php
declare(strict_types=1);
// Disposable test router only; this file is copied beside a fresh fixture DB.
$url=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
if($url!=='/_studio/api/router.php') {
    $file=realpath(__DIR__.$url);
    if($file && str_starts_with($file,__DIR__.'/_studio/ui/') && is_file($file) && in_array(pathinfo($file,PATHINFO_EXTENSION),['js','css','woff','woff2'],true)) {
        header('Content-Type: '.match(pathinfo($file,PATHINFO_EXTENSION)){'js'=>'text/javascript','css'=>'text/css',default=>'font/woff2'});
        readfile($file);return;
    }
    if($url==='/' && is_file(__DIR__.'/index.html')){header('Content-Type: text/html');readfile(__DIR__.'/index.html');return;}
    http_response_code(404);return;
}
require __DIR__.'/_studio/engine/bootstrap.php';
\VoxelSite\Database::getInstance(__DIR__.'/_studio/data/studio.db');
function jsonResponse(array $data,int $status=200):never {http_response_code($status);header('Content-Type: application/json');echo json_encode($data);exit;}
$path=$_GET['_path']??'';
if($path==='/pages')jsonResponse(['ok'=>true,'data'=>['pages'=>[]]]);
if(!preg_match('~^/(notes|cards)(?:/([0-9]+))?(?:/(search|archived|restore|archive|move))?$~D',$path,$match)
    && !in_array($path,['/notes/search','/cards/archived'],true))jsonResponse(['ok'=>false],404);
$kind=str_starts_with($path,'/notes')?'notes':'cards';
$_REQUEST['_route_path']=$path;$_REQUEST['_route_method']=$_SERVER['REQUEST_METHOD'];
$_REQUEST['_route_params']=isset($match[2])&&$match[2]!==''?['id'=>(int)$match[2]]:[];
$_REQUEST['_user']=['id'=>(int)($_SERVER['HTTP_X_FIXTURE_USER']??1)];
require __DIR__.'/_studio/api/endpoints/'.$kind.'.php';
