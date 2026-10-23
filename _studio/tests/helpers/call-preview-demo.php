<?php
declare(strict_types=1);
require_once dirname(__DIR__,2).'/engine/bootstrap.php';
$_SERVER['SCRIPT_NAME']=$argv[1].'/_studio/api/router.php';
$_REQUEST=['_route_method'=>'GET','_route_path'=>'/preview'];
$_GET=['path'=>$argv[2],'embed'=>'1'];
(new ReflectionProperty(\VoxelSite\DemoMode::class,'active'))->setValue(null,true);
require dirname(__DIR__,2).'/api/endpoints/preview.php';
