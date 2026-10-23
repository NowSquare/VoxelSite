<?php
declare(strict_types=1);
/** Studio downloads use the same retained archive and current actor policy as MCP. */
use VoxelSite\{Database,ExportService,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,DownloadGrantStore,OperationActor,OperationException,OperationStore,ProviderCallPolicy,PublishPlanService,ReleaseStore};

if(!in_array($_REQUEST['_route_method']??'',['GET','POST'],true) || ($_REQUEST['_route_path']??'')!=='/export') {
    jsonResponse(['ok'=>false,'error'=>['code'=>'not_found','message'=>'Export endpoint not found.']],404);return;
}
ProviderCallPolicy::runExternal(static function():void {
    try {
        $db=Database::getInstance();$workspace=new SiteWorkspace($db);$policy=new ActorPolicy($db);
        $actor=new OperationActor('user',(int)($_REQUEST['_user']['id']??0),null,[],'forbidden',null);
        $policy->require($actor,DownloadGrantStore::SCOPES);
        $data=dirname($workspace->draftRoot()).'/data';$store=new DownloadGrantStore($db,$policy,$workspace,$data.'/agent/exports');
        $publish=new PublishPlanService($db,$policy,$workspace,new ReleaseStore($db,$policy,$data.'/agent/releases'),
            new OperationStore($db,$policy,$workspace->mutationLockPath()),$data.'/actions',$data.'/published-manifest.json');
        $service=new ExportService($db,$policy,$workspace,$store,$publish);
        if ($_REQUEST['_route_method']==='GET') {
            jsonResponse(['ok'=>true,'data'=>$service->studioStatus($actor)]);return;
        }
        $review=$service->createStudio($actor,(object)getJsonBody());
        $grant=$store->grant($actor,$review['export_id']);$download=$store->openDownload($grant['ticket']);
        header('Content-Type: application/zip');header('Content-Length: '.$download['bytes']);
        header('Content-Disposition: attachment; filename="'.$download['filename'].'"');
        header('Cache-Control: no-store, private');header('Referrer-Policy: no-referrer');header('X-Content-SHA256: '.$download['sha256']);
        header('X-VoxelSite-Export-Id: '.$review['export_id']);header('X-VoxelSite-Export-Version: '.$review['version']);
        $out=fopen('php://output','wb');try{stream_copy_to_stream($download['handle'],$out,$download['bytes']);}
        finally{fclose($download['handle']);if(is_resource($out))fclose($out);}
    }catch(OperationException $error) {
        jsonResponse(['ok'=>false,'error'=>['code'=>$error->errorCode,'message'=>$error->getMessage(),'details'=>$error->details]],
            match($error->errorCode){'permission_denied'=>403,'not_published'=>422,'invalid_format','invalid_schema'=>400,default=>409});
    }
});
