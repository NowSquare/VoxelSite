<?php
declare(strict_types=1);
$root=realpath($argv[1]);
if (!$root || !str_starts_with($root,realpath(sys_get_temp_dir()).'/')
    || !preg_match('~/(?:vs-snapshot-retention-|voxelsite_snapshot_recovery_)[a-f0-9]+$~D',$root)) {
    throw new RuntimeException('Disposable snapshot fixture required.');
}
putenv('VS_TEST_DOC_ROOT='.$root);
foreach (['PREVIEW_DIR'=>'preview','ASSETS_DIR'=>'assets','SNAPSHOT_DIR'=>'snapshots','MUTATION_LOCK'=>'mutation.lock'] as $key=>$dir) putenv('VS_TEST_'.$key.'='.$root.'/'.$dir);
require dirname(__DIR__,2).'/engine/bootstrap.php';
foreach (['logDir'=>$root.'/logs','initialized'=>true] as $key=>$value) (new ReflectionProperty(\VoxelSite\Logger::class,$key))->setValue(null,$value);
$db=\VoxelSite\Database::getInstance($root.'/studio.db');
$createFunction=method_exists($db->getPdo(),'createFunction') ? 'createFunction' : 'sqliteCreateFunction';
$flag=$argv[4] ?? '';
if ($flag==='--fail-rollback') {
    $db->getPdo()->$createFunction('make_rollback_unwritable',static function() use($root):int {
        chmod($root.'/preview',0555); return 1;
    });
    $db->exec("CREATE TEMP TRIGGER fail_projection BEFORE UPDATE ON pages BEGIN SELECT make_rollback_unwritable(); SELECT RAISE(ABORT,'Injected page projection failure'); END");
}
if ($flag==='--fail-after-write') {
    $db->exec("CREATE TEMP TRIGGER fail_projection BEFORE UPDATE ON pages BEGIN SELECT RAISE(ABORT,'Injected page projection failure after file writes'); END");
}
if ($flag==='--pause-before-projection') {
    $db->getPdo()->$createFunction('pause_projection',static function() use($root):int {
        file_put_contents($root.'/restore-paused','restoration files written'); usleep(10000000); return 1;
    });
    $db->exec('CREATE TEMP TRIGGER pause_projection BEFORE UPDATE ON pages BEGIN SELECT pause_projection(); END');
}
if ($flag==='--fail-outcome') {
    $db->exec("CREATE TEMP TRIGGER fail_restore_outcome BEFORE UPDATE ON agent_operations WHEN NEW.state='succeeded' BEGIN SELECT RAISE(ABORT,'Injected restore outcome persistence failure'); END");
}
$response=null;$httpCode=200;$body=[];
function jsonResponse(mixed $data,int $status=200):void {global $response,$httpCode;$response=$data;$httpCode=$status;}
function getJsonBody():array {global $body;return $body;}
function snapshotRequest(string $method,string $path,?string $id,array $input=[]):array {
    global $response,$httpCode,$body;
    $body=$input;$response=null;$httpCode=200;
    $_REQUEST=['_route_method'=>$method,'_route_path'=>$path,'_route_params'=>$id===null ? [] : ['id'=>$id],'_user'=>['id'=>1,'role'=>'owner']];
    require dirname(__DIR__,2).'/api/endpoints/snapshots.php';
    return ['httpCode'=>$httpCode,'response'=>$response];
}
$method=$argv[2];$id=$argv[3];$identity='snapshot-fixture-'.bin2hex(random_bytes(12));
if ($method==='GET') {
    $result=snapshotRequest('GET','/snapshots',null);
} elseif ($method==='POST') {
    $review=snapshotRequest('POST','/snapshots/'.$id.'/prepare-restore',$id,['request_id'=>$identity.'-review','domain'=>'draft']);
    if (($review['response']['ok'] ?? false)!==true) $result=$review;
    else {
        $input=['operation_id'=>$identity,'plan_id'=>$review['response']['data']['plan_id'],'digest'=>$review['response']['data']['digest']];
        $result=snapshotRequest('POST','/snapshots/'.$id.'/restore',$id,$input);
        for($i=0;$result['httpCode']===202 && $i<100;$i++) {
            $input['checkpoint']=$result['response']['data']['operation']['checkpoint'];
            $result=snapshotRequest('POST','/snapshots/'.$id.'/restore',$id,$input);
        }
        $result['review']=$review['response']['data'];
    }
} else {
    $review=snapshotRequest('GET','/snapshots/'.$id.'/delete-review',$id);
    if (($review['response']['ok'] ?? false)!==true) $result=$review;
    else $result=snapshotRequest('DELETE','/snapshots/'.$id,$id,['operation_id'=>$identity,'version'=>$review['response']['data']['version'] ?? str_repeat('0',64)]);
}
echo json_encode($result,JSON_THROW_ON_ERROR);
