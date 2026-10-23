<?php
declare(strict_types=1);
use VoxelSite\Agent\{BusinessStudioAdapter,UpdateStudioAdapter,OperationException,ProviderCallPolicy,JsonSchema,ToolContracts};
ProviderCallPolicy::runExternal(static function():void {
    try {
        $services=new UpdateStudioAdapter();$actor=BusinessStudioAdapter::actor();
        $method=$_REQUEST['_route_method'];$path=$_REQUEST['_route_path'];
        if($method==='GET'){
            $value=match($path){
                '/update/inspect','/update/git-status'=>$services->updates->inspect($actor,(object)[]),
                '/update/dist-packages'=>$services->updates->packages($actor,(object)['offset'=>(int)($_GET['offset']??0),'limit'=>(int)($_GET['limit']??20)]),
                default=>throw new OperationException('not_found','Update endpoint not found.'),
            };
        }elseif($method==='POST'&&$path==='/update/upload'){
            $upload=$_FILES['update_zip']??null;$requestId=BusinessStudioAdapter::requestId($_POST);
            if(!$upload||($upload['error']??UPLOAD_ERR_NO_FILE)!==UPLOAD_ERR_OK||!is_string($upload['tmp_name']??null)||!is_uploaded_file($upload['tmp_name']))throw new OperationException('invalid_package','Upload one complete ZIP package within the PHP upload limit.');
            $name=$upload['name']??'';JsonSchema::validate($name,['type'=>'string','pattern'=>'^[A-Za-z0-9][A-Za-z0-9_.-]{0,119}\.zip$']);
            $value=$services->packages->importArchive($actor,$upload['tmp_name'],$name,$requestId,'upload');
        }elseif($method==='POST'){
            $input=BusinessStudioAdapter::bodyObject(getJsonBody());
            $value=match($path){
                '/update/apply-local'=>$services->updates->stageLocal($actor,$input),
                '/update/git-update'=>$services->updates->stageGit($actor,$input),
                '/update/package-begin'=>$services->packages->begin($actor,$input),
                '/update/package-chunk'=>$services->packages->chunk($actor,$input),
                '/update/package-finish'=>$services->packages->finish($actor,$input),
                '/update/package-get'=>$services->packages->get($actor,$input),
                '/update/prepare'=>$services->updates->prepare($actor,$input),
                '/update/approve'=>(static function()use($services,$actor,$input):array{JsonSchema::validate($input,ToolContracts::object(['plan_id'=>ToolContracts::id('admin'),'digest'=>ToolContracts::hash()]));return $services->approvals->approve($actor,$input->plan_id,$input->digest);})(),
                '/update/apply'=>$services->updates->apply($actor,$input),
                '/update/cleanup'=>$services->packages->cleanup($actor,$input),
                default=>throw new OperationException('not_found','Update endpoint not found.'),
            };
        }else throw new OperationException('not_found','Update endpoint not found.');
        jsonResponse(['ok'=>true,'data'=>$value]);
    }catch(OperationException $error){jsonResponse(['ok'=>false,'error'=>['code'=>$error->errorCode,'message'=>$error->getMessage(),'details'=>$error->details]],$error->errorCode==='permission_denied'?403:($error->errorCode==='not_found'?404:409));}
});
