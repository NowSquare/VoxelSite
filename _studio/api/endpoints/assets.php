<?php
declare(strict_types=1);

use VoxelSite\{Database,SiteWorkspace};
use VoxelSite\Agent\{AssetHttpAdapter,OperationActor,OperationException};

// Session authentication and CSRF remain router responsibilities. Asset edits
// use the private workspace and retained change/recovery services.
$method=$_REQUEST['_route_method'];
$path=$_REQUEST['_route_path'];
try {
    $db=Database::getInstance();
    $actor=new OperationActor('user',(int)($_REQUEST['_user']['id']??0),null,[],'studio_configured',null);
    $adapter=new AssetHttpAdapter($db,new SiteWorkspace($db),legacyMetadata:dirname(__DIR__,2).'/data/assets-meta.json');
    if ($method==='GET' && $path==='/assets') {
        jsonResponse(['ok'=>true,'data'=>$adapter->list($actor,$_GET)]);
        return;
    }
    if ($method==='POST' && $path==='/assets/upload') {
        $files=$_FILES['file']??null;
        if (!is_array($files) || !isset($files['name'],$files['tmp_name'],$files['error'])) {
            throw new OperationException('invalid_schema','Choose a file to upload.');
        }
        $multiple=is_array($files['name']);$count=$multiple?count($files['name']):1;
        if($count!==1)throw new OperationException('invalid_schema','Send one file per request, using its reviewed draft version. Continue with the committed version for the next file.');
        $file=[];
        foreach(['name','tmp_name','error'] as $field)$file[$field]=$multiple?($files[$field][0]??null):$files[$field];
        if(!is_string($file['name']) || !is_string($file['tmp_name']) || $file['error']!==UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name']))
            throw new OperationException('invalid_schema','The upload was incomplete. Choose the file again.');
        $uploaded=$adapter->upload($actor,$_POST,$file);
        jsonResponse(['ok'=>true,'data'=>['uploaded'=>[$uploaded],'errors'=>[],'operation'=>$uploaded['operation']]]);
        return;
    }
    $raw=file_get_contents('php://input',false,null,0,16385);
    if ($raw===false || strlen($raw)>16384) throw new OperationException('size_limit','Asset edits must be at most 16 KiB.');
    $input=json_decode($raw,true,16,JSON_THROW_ON_ERROR);
    if (!is_array($input) || array_is_list($input)) throw new OperationException('invalid_schema','Send an asset edit object.');
    $action=match([$method,$path]) {
        ['PUT','/assets/meta']=>'metadata',
        ['DELETE','/assets']=>'delete',
        ['POST','/assets/folder']=>'folder',
        default=>throw new OperationException('invalid_schema','Unknown asset action.'),
    };
    jsonResponse(['ok'=>true,'data'=>$adapter->mutate($actor,$action,$input)]);
} catch(OperationException $e) {
    jsonResponse(['ok'=>false,'error'=>['code'=>$e->errorCode,'message'=>$e->getMessage(),'details'=>$e->details]],
        $e->errorCode==='permission_denied'?403:($e->errorCode==='invalid_schema'||$e->errorCode==='invalid_path'?422:409));
} catch(\JsonException|\TypeError $e) {
    jsonResponse(['ok'=>false,'error'=>['code'=>'invalid_schema','message'=>'Send valid asset fields.']],422);
} catch(\RuntimeException $e) {
    jsonResponse(['ok'=>false,'error'=>['code'=>'host_capability_unavailable','message'=>'Asset storage is unavailable. Check the private workspace status.']],503);
}
