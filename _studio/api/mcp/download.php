<?php
declare(strict_types=1);
require_once dirname(__DIR__,2).'/engine/Agent/ProviderCallPolicy.php';
\VoxelSite\Agent\ProviderCallPolicy::runExternal(static function():void {
    require_once dirname(__DIR__,2).'/engine/bootstrap.php';
    try {
        $config=loadConfig();
        if(\VoxelSite\DemoMode::isActive() || !isInstalled())throw new \RuntimeException('Export downloads unavailable.');
        $db=\VoxelSite\Database::getInstance();$workspace=new \VoxelSite\SiteWorkspace($db);$policy=new \VoxelSite\Agent\ActorPolicy($db);
        $settings=new \VoxelSite\Settings($db);
        if(!\VoxelSite\Agent\ConnectionService::enabled($settings,$config))throw new \RuntimeException('Export downloads unavailable.');
        $base=(string)$settings->get('workspace_base_url',$settings->get('site_url',''));
        $store=new \VoxelSite\Agent\DownloadGrantStore($db,$policy,$workspace,dirname($workspace->draftRoot()).'/data/agent/exports');
        $headers=[];foreach($_SERVER as $key=>$value)if(str_starts_with($key,'HTTP_'))$headers[str_replace('_','-',substr($key,5))]=$value;
        foreach(['CONTENT_TYPE'=>'Content-Type','CONTENT_LENGTH'=>'Content-Length'] as $key=>$name)if(isset($_SERVER[$key]))$headers[$name]=$_SERVER[$key];
        $stream=fopen('php://input','rb');$body=$stream?stream_get_contents($stream,257):'';if($stream)fclose($stream);
        $response=(new \VoxelSite\Agent\DownloadHttpController($store,$base))->handle($_SERVER['REQUEST_METHOD']??'', $headers,is_string($body)?$body:'');
        http_response_code($response['status']);foreach($response['headers'] as $name=>$value)header($name.': '.$value);
        if($response['stream']!==null) {
            $out=fopen('php://output','wb');try{stream_copy_to_stream($response['stream']['handle'],$out,$response['stream']['bytes']);}
            finally{fclose($response['stream']['handle']);if(is_resource($out))fclose($out);}
        }else echo $response['body'];
    }catch(\Throwable) {
        http_response_code(503);header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store, private');header('Referrer-Policy: no-referrer');
        echo '{"error":{"code":"host_capability_unavailable","message":"Scoped export downloads are unavailable on this installation."}}';
    }
});
