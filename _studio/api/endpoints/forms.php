<?php
declare(strict_types=1);
use VoxelSite\Agent\{BusinessStudioAdapter,OperationException};
$method=$_REQUEST['_route_method'];$path=$_REQUEST['_route_path'];$params=$_REQUEST['_route_params']??[];
try {
    $services=new BusinessStudioAdapter();$actor=BusinessStudioAdapter::actor();$formId=$params['formId']??null;
    if($method==='GET'&&$path==='/forms') {
        $forms=[];$offset=0;$version=null;
        do {$input=['source'=>'published','offset'=>$offset,'limit'=>100];if($version!==null)$input['version']=$version;$page=$services->forms->list($actor,(object)$input);$version=$page['version'];foreach($page['forms'] as $form)$forms[$form['id']]=$form+['created'=>null];$offset=$page['next_offset'];}while($offset!==null);
        $counts=[];$inboxAllowed=true;try{$counts=$services->submissions->summaries($actor,'form');}catch(OperationException $error){if($error->errorCode!=='permission_denied')throw $error;$inboxAllowed=false;}
        foreach($forms as $id=>&$form){$form['total']=$inboxAllowed?($counts[$id]['total']??0):null;$form['unread']=$inboxAllowed?($counts[$id]['unread']??0):null;}unset($form);
        foreach($counts as $id=>$count)if(!isset($forms[$id]))$forms[$id]=['id'=>$id,'name'=>$id.' (deleted)','description'=>'Schema removed — submissions still available','fields'=>0,'total'=>$count['total'],'unread'=>$count['unread'],'orphaned'=>true,'created'=>null];
        jsonResponse(['ok'=>true,'data'=>['forms'=>array_values($forms),'total_unread'=>$inboxAllowed?array_sum(array_column($counts,'unread')):null,'inbox_access'=>$inboxAllowed]]);return;
    }
    if($method==='GET'&&$formId!==null&&!str_contains($path,'/submissions')) {
        $form=$services->forms->get($actor,(object)['source'=>'published','form_id'=>$formId]);$stats=null;
        try{$count=$services->submissions->summaries($actor,'form')[$formId]??['total'=>0,'by_status'=>[]];$stats=array_merge(['total'=>$count['total'],'new'=>0,'read'=>0,'replied'=>0,'archived'=>0],$count['by_status']);}catch(OperationException $error){if($error->errorCode!=='permission_denied')throw $error;}
        jsonResponse(['ok'=>true,'data'=>['form'=>$form['definition'],'version'=>$form['version'],'stats'=>$stats]]);return;
    }
    if($method==='GET'&&$formId!==null&&str_ends_with($path,'/export')) {
        $csv=$services->submissions->legacyExport($actor,'form',$formId,$_GET);header('Content-Type: text/csv; charset=utf-8');header('Content-Disposition: attachment; filename="'.$formId.'_submissions_'.date('Y-m-d').'.csv"');header('Cache-Control: private, no-store');echo $csv;return;
    }
    if($method==='GET'&&$formId!==null&&str_contains($path,'/submissions')) {
        if(isset($_GET['record_id'])){$r=$services->submissions->read($actor,(object)['kind'=>'form','entity_id'=>$formId,'record_id'=>(int)$_GET['record_id']])['record'];jsonResponse(['ok'=>true,'data'=>['submissions'=>[$r+['id'=>$r['record_id'],'form_id'=>$formId]],'total'=>1,'page'=>1,'per_page'=>1]]);return;}
        $filters=$_GET;if(($filters['status']??'')==='all')unset($filters['status']);if(($filters['source']??'')==='all')unset($filters['source']);$result=$services->submissions->legacyPage($actor,'form',$formId,$filters);$result['submissions']=$result['records'];unset($result['records']);jsonResponse(['ok'=>true,'data'=>$result]);return;
    }
    if(in_array($method,['PUT','DELETE'],true)&&$formId!==null&&isset($params['id'])) {
        $body=getJsonBody();$input=$services->mutationInput($actor,'form',$formId,(int)$params['id'],$body);$result=$method==='PUT'?$services->submissions->update($actor,$input):$services->submissions->delete($actor,$input);jsonResponse(['ok'=>true,'data'=>['message'=>$method==='PUT'?'Submission updated':'Submission deleted','operation'=>$result,'changed_records'=>array_map(fn($r)=>$r+['kind'=>'form','entity_id'=>$formId],$result['versions'])]]);return;
    }
    jsonResponse(['ok'=>false,'error'=>['code'=>'not_found','message'=>'Form endpoint not found.']],404);
}catch(OperationException $error){jsonResponse(['ok'=>false,'error'=>['code'=>$error->errorCode,'message'=>$error->getMessage(),'details'=>$error->details]],$error->errorCode==='permission_denied'?403:($error->errorCode==='not_found'?404:409));}
