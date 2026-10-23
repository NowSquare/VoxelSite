<?php
declare(strict_types=1);
use VoxelSite\Agent\{BusinessStudioAdapter,OperationException,JsonSchema,BusinessContracts};
$method=$_REQUEST['_route_method'];$path=$_REQUEST['_route_path'];$params=$_REQUEST['_route_params']??[];
try {
    $services=new BusinessStudioAdapter();
    // The existing public endpoint exposes only the generated public manifest.
    if($method==='GET'&&$path==='/agentic/manifest'){jsonResponse(['ok'=>true,'data'=>$services->actions->manager()->generateManifest()]);return;}
    $actor=BusinessStudioAdapter::actor();$id=$params['id']??null;
    $change=static function(array $intent,array $body=[])use($services,$actor):array {
        return $services->actions->change($actor,BusinessStudioAdapter::bodyObject(['request_id'=>BusinessStudioAdapter::requestId($body),'version'=>$body['configuration_version']??null,'intent'=>$intent]));
    };
    if($method==='GET'&&$path==='/agentic/actions') {
        $all=[];$offset=0;$version=null;$stats=$services->submissions->summaries($actor,'action');
        do{$input=['offset'=>$offset,'limit'=>50];if($version!==null)$input['version']=$version;$page=$services->actions->list($actor,(object)$input);$version=$page['version'];foreach($page['items'] as $summary){$item=$services->actions->get($actor,(object)['action_id'=>$summary['id']]);$def=$item['definition'];$def['_version']=$item['version'];$def['_stats']=$stats[$summary['id']]??['total'=>0,'by_status'=>[],'last_activity'=>null];$all[]=$def;}$offset=$page['next_offset'];}while($offset!==null);
        jsonResponse(['ok'=>true,'data'=>['actions'=>$all,'configuration_version'=>$services->actions->configurationVersion()]]);return;
    }
    if($method==='POST'&&$path==='/agentic/actions/reorder') {$body=getJsonBody();$op=$change(['type'=>'reorder','order'=>$body['order']??[]],$body);jsonResponse(['ok'=>true,'data'=>['updated'=>count($op['changed_ids']),'operation'=>$op]]);return;}
    if($path==='/agentic/actions/bar-settings') {
        $current=$services->actions->bar($actor,(object)[]);if($method==='GET'){jsonResponse(['ok'=>true,'data'=>$current]);return;}
        if($method==='PUT'){$body=getJsonBody();$settings=array_intersect_key($body,$current['settings'])+$current['settings'];$op=$change(['type'=>'bar','settings'=>$settings],$body);jsonResponse(['ok'=>true,'data'=>['settings'=>$settings,'operation'=>$op]]);return;}
    }
    if($method==='GET'&&in_array($path,['/agentic/templates','/agentic/actions/templates'],true)) {
        $page=$services->actions->templates($actor,(object)['limit'=>50]);if($page['next_offset']!==null)throw new OperationException('size_limit','Template inventory exceeds the Studio response limit.');$ids=array_column($page['items'],'id');$templates=array_values(array_filter($services->actions->manager()->listTemplates(),fn($template)=>in_array($template['id']??null,$ids,true)));jsonResponse(['ok'=>true,'data'=>['templates'=>$templates,'configuration_version'=>$services->actions->configurationVersion()]]);return;
    }
    if(in_array($method,['GET','POST'],true)&&in_array($path,['/agentic/manifest','/agentic/actions/manifest'],true)){jsonResponse(['ok'=>true,'data'=>$services->actions->manifest($actor,(object)[])['manifest']]);return;}
    if($method==='POST'&&$path==='/agentic/actions/from-template') {
        $body=getJsonBody();$template=(string)($body['template_id']??'');$new=(string)($body['id']??$body['custom_id']??substr($template,0,41).'-'.substr(hash('sha256',BusinessStudioAdapter::requestId($body)),0,8));JsonSchema::validate($new,BusinessContracts::id());
        $op=$change(['type'=>'from_template','template_id'=>$template,'new_id'=>$new],$body);jsonResponse(['ok'=>true,'data'=>['action'=>$services->actions->get($actor,(object)['action_id'=>$new])['definition'],'operation'=>$op]],201);return;
    }
    if($method==='POST'&&$path==='/agentic/actions') {
        $body=getJsonBody();$definition=$body;unset($definition['request_id'],$definition['configuration_version'],$definition['_stats'],$definition['_version']);$actionId=$definition['id']??'';
        $op=$change(['type'=>'save','mode'=>'create','definition'=>$definition],$body);jsonResponse(['ok'=>true,'data'=>['action'=>$services->actions->get($actor,(object)['action_id'=>$actionId])['definition'],'operation'=>$op]],201);return;
    }
    if($id!==null&&$method==='POST'&&str_ends_with($path,'/duplicate')) {
        $body=getJsonBody();$new=(string)($body['new_id']??'');if($new==='')$new=substr($id,0,41).'-'.substr(hash('sha256',BusinessStudioAdapter::requestId($body)),0,8);
        $op=$change(['type'=>'duplicate','action_id'=>$id,'new_id'=>$new],$body);jsonResponse(['ok'=>true,'data'=>['action'=>$services->actions->get($actor,(object)['action_id'=>$new])['definition'],'operation'=>$op]],201);return;
    }
    if($id!==null&&$method==='POST'&&str_ends_with($path,'/test')) {
        $body=getJsonBody();$read=$services->actions->get($actor,(object)['action_id'=>$id]);$result=$services->actions->validate($actor,(object)['action_id'=>$id,'version'=>$read['version'],'data'=>BusinessStudioAdapter::bodyObject($body)]);jsonResponse(['ok'=>$result['valid'],'data'=>$result+['ok'=>$result['valid'],'test'=>true]]);return;
    }
    if($id!==null&&$method==='GET'&&str_ends_with($path,'/records')){jsonResponse(['ok'=>true,'data'=>$services->submissions->legacyPage($actor,'action',$id,$_GET)]);return;}
    if($id!==null&&$method==='GET'&&str_ends_with($path,'/records/export')){$csv=$services->submissions->legacyExport($actor,'action',$id,$_GET);header('Content-Type: text/csv; charset=utf-8');header('Content-Disposition: attachment; filename="'.$id.'_records_'.date('Y-m-d').'.csv"');header('Cache-Control: private, no-store');echo $csv;return;}
    if($id!==null&&$method==='GET'&&isset($params['rid'],$params['field'])) {
        $record=$services->submissions->read($actor,(object)['kind'=>'action','entity_id'=>$id,'record_id'=>(int)$params['rid']])['record'];$input=(object)['kind'=>'action','entity_id'=>$id,'record_id'=>(int)$params['rid'],'field'=>$params['field'],'version'=>$record['version']];$file=$services->submissions->openAttachment($actor,$input);
        header('Content-Type: application/octet-stream');header('Content-Disposition: attachment; filename="'.str_replace('"',"'",$file['filename']).'"');header('Content-Length: '.$file['size']);header('Cache-Control: private, no-store');header('X-Content-Type-Options: nosniff');
        try {while(!feof($file['handle']))echo fread($file['handle'],65536);}finally{fclose($file['handle']);}return;
    }
    if($id!==null&&isset($params['rid'])&&in_array($method,['PUT','DELETE'],true)){$body=getJsonBody();$input=$services->mutationInput($actor,'action',$id,(int)$params['rid'],$body);$op=$method==='PUT'?$services->submissions->update($actor,$input):$services->submissions->delete($actor,$input);jsonResponse(['ok'=>true,'data'=>['message'=>$method==='PUT'?'Status updated.':'Record deleted.','operation'=>$op,'changed_records'=>array_map(fn($r)=>$r+['kind'=>'action','entity_id'=>$id],$op['versions'])]]);return;}
    if($id!==null&&$method==='POST'&&str_ends_with($path,'/records/bulk')) {
        $body=getJsonBody();$records=$body['records']??null;if(!is_array($records))throw new OperationException('content_conflict','Explicit displayed record versions are required for a bulk change.');$records=array_map(fn($record)=>(object)$record,$records);
        $op=$services->submissions->bulk($actor,(object)['kind'=>'action','entity_id'=>$id,'records'=>$records,'status'=>$body['status']??'','request_id'=>BusinessStudioAdapter::requestId($body)]);jsonResponse(['ok'=>true,'data'=>['updated'=>count($op['changed_ids']),'operation'=>$op]]);return;
    }
    if($id!==null&&$method==='POST'&&str_ends_with($path,'/records/purge')) {
        $body=getJsonBody();$cutoff=$body['before']??null;$records=$body['records']??null;if(!is_string($cutoff)||!is_array($records))throw new OperationException('content_conflict','Purge requires an explicit cutoff and reviewed record versions.');$records=array_map(fn($record)=>(object)$record,$records);
        $op=$records?$services->submissions->purge($actor,(object)['kind'=>'action','entity_id'=>$id,'records'=>$records,'before'=>$cutoff,'request_id'=>BusinessStudioAdapter::requestId($body)]):null;$count=count($records);jsonResponse(['ok'=>true,'data'=>['purged'=>$count,'more'=>(bool)($body['more']??false),'message'=>$count.' record(s) purged.','operation'=>$op]]);return;
    }
    if($id!==null&&!str_contains($path,'/records')) {
        if($method==='GET'){$read=$services->actions->get($actor,(object)['action_id'=>$id]);$action=$read['definition'];$action['_stats']=$services->submissions->summaries($actor,'action')[$id]??['total'=>0,'by_status'=>[]];jsonResponse(['ok'=>true,'data'=>['action'=>$action,'version'=>$read['version'],'configuration_version'=>$services->actions->configurationVersion()]]);return;}
        if(in_array($method,['PUT','DELETE'],true)){$body=getJsonBody();$definition=$body;unset($definition['request_id'],$definition['configuration_version'],$definition['_stats'],$definition['_version']);$definition['id']=$id;$op=$change($method==='DELETE'?['type'=>'delete','action_id'=>$id]:['type'=>'save','mode'=>'update','definition'=>$definition],$body);jsonResponse(['ok'=>true,'data'=>['action'=>$method==='PUT'?$services->actions->get($actor,(object)['action_id'=>$id])['definition']:null,'message'=>$method==='DELETE'?'Action deleted.':'Action updated.','operation'=>$op]]);return;}
    }
    jsonResponse(['ok'=>false,'error'=>['code'=>'not_found','message'=>'Agentic actions endpoint not found.']],404);
}catch(OperationException $error){jsonResponse(['ok'=>false,'error'=>['code'=>$error->errorCode,'message'=>$error->getMessage(),'details'=>$error->details]],$error->errorCode==='permission_denied'?403:($error->errorCode==='not_found'?404:409));}
