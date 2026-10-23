<?php
declare(strict_types=1);
use VoxelSite\{Database, SiteWorkspace};
use VoxelSite\Agent\{ConnectionService, JsonSchema, OperationActor, OperationException, ToolContracts};

$db=Database::getInstance();
$user=$_REQUEST['_user']??[];
$actor=new OperationActor('user',(int)$user['id'],null,[],'studio_configured',null);
$service=new ConnectionService($db,new SiteWorkspace($db),loadConfig()??[]);
$path=$_REQUEST['_route_path'];$method=$_REQUEST['_route_method'];$params=$_REQUEST['_route_params']??[];
header('Cache-Control: no-store');
try {
    if ($method==='GET' && $path==='/settings/mcp/activity') $result=$service->activity($actor);
    elseif ($method==='GET' && $path==='/settings/mcp') $result=$service->status($actor,array_intersect_key($_GET,array_flip(['mcp_offset','mcp_version','rest_offset','rest_version'])));
    elseif ($method==='POST' && $path==='/settings/mcp') {
        $body=(object)getJsonBody();
        $result=$service->setEnabled($actor,$body);
    } elseif ($method==='POST' && $path==='/settings/mcp/connections') {
        $result=$service->create($actor,(object)getJsonBody());
    } elseif ($method==='POST' && $path==='/settings/mcp/rest-bind') {
        $body=(object)getJsonBody();
        $result=$service->bindRest($actor,$body);
    } elseif ($method==='POST' && isset($params['id']) && preg_match('~^/settings/mcp/approvals/[^/]+/(approve|cancel|reveal)$~D',$path,$match)) {
        $body=(object)getJsonBody();
        JsonSchema::validate($body,$match[1]==='reveal'?ToolContracts::object([]):ToolContracts::object(['digest'=>ToolContracts::hash()]));
        $approvals=new \VoxelSite\Agent\AdminApprovalStore($db,new \VoxelSite\Agent\ActorPolicy($db),new SiteWorkspace($db),(loadConfig()??[])['app_key']??'');
        $result=$match[1]==='reveal'?$approvals->revealSecret($actor,$params['id']):$approvals->{$match[1]}($actor,$params['id'],$body->digest);
    } elseif ($method==='DELETE' && isset($params['id']) && ctype_digit($params['id'])) {
        $result=$service->revoke($actor,(int)$params['id'],(object)getJsonBody());
    } else throw new OperationException('invalid_schema','Unknown connection operation.');
    jsonResponse(['ok'=>true,'data'=>$result]);
} catch (OperationException $error) {
    jsonResponse(['ok'=>false,'error'=>['code'=>$error->errorCode,'message'=>$error->getMessage()]],
        $error->errorCode==='permission_denied'?403:409);
} catch (\VoxelSite\WorkspaceNotReadyException $error) {
    jsonResponse(['ok'=>false,'error'=>['code'=>'connection_unavailable',
        'message'=>'Finish private draft setup before enabling this connection.']],409);
} catch (Throwable $error) {
    \VoxelSite\Logger::exception('connections',$error);
    jsonResponse(['ok'=>false,'error'=>['code'=>'connection_failed',
        'message'=>'The connection request could not be completed. Retry the same request.']],500);
}
