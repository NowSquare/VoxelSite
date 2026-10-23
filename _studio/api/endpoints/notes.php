<?php
declare(strict_types=1);
use VoxelSite\Database;
use VoxelSite\Agent\{ActorPolicy,NoteService,OperationActor,OperationException};

// Router supplies current session identity and CSRF enforcement. Every write
// shares the same scoped version checks and receipts as external clients.
$path=$_REQUEST['_route_path'];$method=$_REQUEST['_route_method'];$params=$_REQUEST['_route_params']??[];
try {
    $db=Database::getInstance();$actor=new OperationActor('user',(int)($_REQUEST['_user']['id']??0),null,[],'studio_configured',null);
    $service=new NoteService($db,new ActorPolicy($db));
    if($method==='GET') {
        $query=['limit'=>isset($_GET['limit'])?(int)$_GET['limit']:100];
        foreach(['offset','collection_version','state'] as $field)if(isset($_GET[$field]))$query[$field]=$field==='offset'?(int)$_GET[$field]:$_GET[$field];
        if($path==='/notes/search'){$query['query']=$_GET['q']??'';$result=$service->search($actor,(object)$query);}
        elseif(isset($params['id']))$result=$service->read($actor,(object)['id'=>(int)$params['id']]);
        else $result=$service->list($actor,(object)$query);
    } else {
        $raw=file_get_contents('php://input',false,null,0,393217);
        if($raw===false || strlen($raw)>393216)throw new OperationException('size_limit','This business edit exceeds 384 KiB.');
        $object=json_decode($raw,false,16,JSON_THROW_ON_ERROR);
        if(!$object instanceof \stdClass)throw new OperationException('invalid_schema','Send a JSON edit object with request_id and the current record version.');
        $input=(array)$object;
        if($method==='POST' && $path==='/notes'){$action='create';$request=$input;}
        else {
            $request=['id'=>(int)($params['id']??0),'request_id'=>$input['request_id']??null,'expected_version'=>$input['expected_version']??null];
            if($method==='PUT'){$action='update';$fields=$input;unset($fields['request_id'],$fields['expected_version']);$request['fields']=(object)$fields;}
            elseif($method==='DELETE')$action='trash';
            elseif($method==='POST' && str_ends_with($path,'/restore'))$action='restore';
            else throw new OperationException('invalid_schema','Unknown note action.');
        }
        $result=$service->$action($actor,(object)$request);
        if($action==='trash')$result['deleted']=true;
    }
    jsonResponse(['ok'=>true,'data'=>$result],$method==='POST' && $path==='/notes'?201:200);
} catch(OperationException $e) {
    jsonResponse(['ok'=>false,'error'=>['code'=>$e->errorCode,'message'=>$e->getMessage(),'details'=>$e->details]],
        $e->errorCode==='permission_denied'?403:($e->errorCode==='invalid_schema'?422:409));
} catch(\JsonException|\TypeError $e) {
    jsonResponse(['ok'=>false,'error'=>['code'=>'invalid_schema','message'=>'Send valid business edit fields.']],422);
}
