<?php
declare(strict_types=1);
require_once dirname(__DIR__,2).'/engine/bootstrap.php';
$root=realpath($argv[1]??'');if(!$root||!str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-mcp-app-'))throw new RuntimeException('Disposable fixture required.');
VoxelSite\Database::getInstance($root.'/private/studio.db');$response=null;$status=200;
function jsonResponse(mixed $data,int $code=200):void{global $response,$status;$response=$data;$status=$code;}
$_GET=['pageId'=>$argv[2]];$_REQUEST=['_route_method'=>'GET','_route_path'=>'/site-control/nav-preflight','_user'=>['id'=>1,'role'=>'owner']];
VoxelSite\Agent\ProviderCallPolicy::runExternal(static function():void{require dirname(__DIR__,2).'/api/endpoints/site-control.php';});
echo json_encode(['status'=>$status,'response'=>$response],JSON_THROW_ON_ERROR);
