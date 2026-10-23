<?php
declare(strict_types=1);
require_once dirname(__DIR__,2).'/engine/Agent/ProviderCallPolicy.php';

\VoxelSite\Agent\ProviderCallPolicy::runExternal(static function (): void {
    require_once dirname(__DIR__,2).'/engine/bootstrap.php';
    try {
        $config=loadConfig();
        if (\VoxelSite\DemoMode::isActive() || !isInstalled()) {
            throw new \RuntimeException('Preview handoffs are unavailable.');
        }
        $db=\VoxelSite\Database::getInstance();
        $settings=new \VoxelSite\Settings($db);
        if (!\VoxelSite\Agent\ConnectionService::enabled($settings,$config)) {
            throw new \RuntimeException('Preview handoffs are unavailable.');
        }
        $origin=\VoxelSite\Agent\PreviewService::canonicalOrigin((string)$settings->get('workspace_base_url',$settings->get('site_url','')));
        $service=new \VoxelSite\Agent\PreviewService($db,new \VoxelSite\Agent\ActorPolicy($db),new \VoxelSite\SiteWorkspace($db));
        $controller=new \VoxelSite\Agent\PreviewHttpController($service,str_starts_with($origin,'https://'));
        $headers=[];
        foreach ($_SERVER as $key=>$value) {
            if (str_starts_with($key,'HTTP_')) $headers[str_replace('_','-',substr($key,5))]=$value;
        }
        if (isset($_SERVER['CONTENT_TYPE'])) $headers['Content-Type']=$_SERVER['CONTENT_TYPE'];
        if (isset($_SERVER['CONTENT_LENGTH'])) $headers['Content-Length']=$_SERVER['CONTENT_LENGTH'];
        $stream=fopen('php://input','rb');
        $body=$stream === false ? '' : stream_get_contents($stream,\VoxelSite\Agent\PreviewHttpController::MAX_BODY_BYTES+1);
        if (is_resource($stream)) fclose($stream);
        if ($body === false) throw new \RuntimeException('Cannot read preview request.');
        $response=$controller->handle($_SERVER['REQUEST_METHOD'] ?? '',$_GET,$headers,$body,$_COOKIE);
        http_response_code($response['status']);
        foreach ($response['headers'] as $name=>$value) header($name.': '.$value);
        echo $response['body'];
    } catch (\Throwable) {
        http_response_code(503);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store, private');
        header('Referrer-Policy: no-referrer');
        header('X-Robots-Tag: noindex, nofollow');
        echo '{"ok":false,"error":{"code":"host_capability_unavailable","message":"Scoped browser previews are not enabled on this installation."}}';
    }
});
