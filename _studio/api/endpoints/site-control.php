<?php
declare(strict_types=1);
use VoxelSite\{Database,NavLinksParser,SiteWorkspace};
use VoxelSite\Agent\{StudioAuthoringService,OperationException,JsonSchema,ToolContracts};
$method=$_REQUEST['_route_method'];$path=$_REQUEST['_route_path'];
$db=Database::getInstance();$workspace=new SiteWorkspace($db);
$services=new StudioAuthoringService($db,$workspace);$actor=StudioAuthoringService::actor();
try {
    (new \VoxelSite\Agent\ActorPolicy($db))->require($actor,['structure:write','site:read','files:read']);
    if($method==='POST') {
        $data=$services->structuralRequest($actor,$path,getJsonBody());
        jsonResponse(['ok'=>true,'data'=>$data],$data['operation']['status']==='applying'?202:200);return;
    }
if ($method === 'GET' && $path === '/site-control/nav-preflight') {
    $pageId = trim($_GET['pageId'] ?? '');

    if ($pageId === '') {
        jsonResponse(['ok' => false, 'error' => [
            'code'    => 'missing_field',
            'message' => 'pageId is required.',
        ]], 400);
        return;
    }

    $filePath = str_starts_with($pageId, 'page:') ? substr($pageId, 5) : $pageId;
    $data=(new \VoxelSite\Agent\NavigationPreflightService($db,new \VoxelSite\Agent\ActorPolicy($db),$workspace))
        ->read($actor,(object)['page_file'=>$filePath]);
    jsonResponse(['ok'=>true,'data'=>$data]);
    return;
}

    jsonResponse(['ok'=>false,'error'=>['code'=>'not_found','message'=>'Endpoint not found.']],404);
}catch(OperationException $error){
    jsonResponse(['ok'=>false,'error'=>['code'=>$error->errorCode,'message'=>$error->getMessage(),'details'=>$error->details]],
        match($error->errorCode){'permission_denied'=>403,'invalid_schema','invalid_path','size_limit'=>422,'not_found'=>404,default=>409});
}
