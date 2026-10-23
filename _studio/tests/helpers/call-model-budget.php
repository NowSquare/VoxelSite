<?php
declare(strict_types=1);
require_once __DIR__.'/lifecycle-provider-trap.php';
$GLOBALS['lifecycle_provider_attempts']=0;
require_once dirname(__DIR__,2).'/engine/bootstrap.php';
$root=realpath($argv[1]??'');
if(!$root||!str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-mcp-app-')||!is_file($root.'/private/studio.db'))throw new RuntimeException('Disposable MCP fixture required.');
$db=VoxelSite\Database::getInstance($root.'/private/studio.db');
$body=json_decode(stream_get_contents(STDIN),true,32,JSON_THROW_ON_ERROR);$response=null;$status=200;
function getJsonBody():array{global $body;return $body;}
function jsonResponse(mixed $data,int $code=200):void{global $response,$status;$response=$data;$status=$code;}
$_REQUEST['_route_method']='POST';$_REQUEST['_route_path']='/settings/model-budget';$_REQUEST['_user']=['id'=>1,'role'=>'owner'];
VoxelSite\Agent\ProviderCallPolicy::runExternal(static function():void{require dirname(__DIR__,2).'/api/endpoints/settings.php';});
echo json_encode(['status'=>$status,'response'=>$response,'provider_attempts'=>$GLOBALS['lifecycle_provider_attempts']],JSON_THROW_ON_ERROR);
