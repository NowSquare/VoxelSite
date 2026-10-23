<?php
declare(strict_types=1);
$root=realpath($argv[1] ?? '');
if (!$root || !str_starts_with($root,realpath(sys_get_temp_dir()).'/') || !is_file($root.'/_studio/engine/bootstrap.php')) throw new RuntimeException('Disposable copied runtime required.');
require $root.'/_studio/engine/bootstrap.php';
$db=VoxelSite\Database::getInstance();
$actor=new VoxelSite\Agent\OperationActor('user',(int)$argv[3],null,[],'studio_configured',null);
try { echo json_encode((new VoxelSite\Agent\OperationStore($db,new VoxelSite\Agent\ActorPolicy($db),(new VoxelSite\SiteWorkspace($db))->mutationLockPath()))->get($actor,$argv[2]),JSON_THROW_ON_ERROR); }
catch (VoxelSite\Agent\OperationException $error) { echo json_encode(['error'=>$error->errorCode],JSON_THROW_ON_ERROR); }
