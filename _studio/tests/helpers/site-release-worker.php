<?php
declare(strict_types=1);
$root=$argv[1];
require $root.'/_studio/engine/bootstrap.php';
$lock=VoxelSite\SiteMutationLock::acquire();
$db=VoxelSite\Database::getInstance();$files=new VoxelSite\FileManager($db);$store=new VoxelSite\SitePlanStore($db,$files);
$source=$files->readFile('_partials/footer.php');
$edit=['file'=>'_partials/footer.php','strategy'=>'line-replace','anchored'=>true,
    'before_snippet'=>'Original shared footer','after_snippet'=>'Interrupted footer <span class="p-9">changed</span>',
    'source_hash'=>hash('sha256',$source)];
$id=$store->create(1,['applicable'=>true,'edits'=>[$edit],'summary'=>'Controlled interrupted apply']);
$store->begin($id,1);
(new VoxelSite\PatchExecutor($files,static function(array $event)use($id):void{
    if($event['phase']==='compile') {
        echo json_encode(['id'=>$id,'phase'=>'compiled'])."\n";fflush(STDOUT);
        // Parent kills this process while original backups and applying state are durable.
        sleep(60);
    }
}))->execute([$edit]);
