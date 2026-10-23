<?php
/** Portable public read-only MCP. No Studio authentication, management tools or Action execution. */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
if (($_SERVER['REQUEST_METHOD']??'')!=='POST') {header('Allow: POST');http_response_code(405);echo '{"error":"Use POST."}';exit;}
$stream=fopen('php://input','rb');$body=$stream?stream_get_contents($stream,65537):'';if($stream)fclose($stream);
$request=is_string($body)&&strlen($body)<=65536?json_decode($body,true):null;
if(!is_array($request)||array_is_list($request)||($request['jsonrpc']??'')!=='2.0'){http_response_code(400);echo '{"jsonrpc":"2.0","id":null,"error":{"code":-32700,"message":"Invalid request."}}';exit;}
$id=$request['id']??null;$params=$request['params']??[];
if(!is_array($params) || (isset($params['name']) && !is_string($params['name'])) || (isset($params['uri']) && !is_string($params['uri']))
    || (isset($params['arguments']) && !is_array($params['arguments']))) {
    http_response_code(400);echo json_encode(['jsonrpc'=>'2.0','id'=>$id,'error'=>['code'=>-32602,'message'=>'Invalid public parameters.']]);exit;
}
$read=static function(string $name):?array {
    $path=__DIR__.'/assets/data/'.$name.'.json';
    if(!is_file($path)||is_link($path)||filesize($path)>1048576)return null;
    $bytes=file_get_contents($path,false,null,0,1048577);
    return is_string($bytes)&&strlen($bytes)<=1048576&&is_array($data=json_decode($bytes,true))?$data:null;
};
$data=[];$total=0;$count=0;
foreach(new DirectoryIterator(__DIR__.'/assets/data') as $entry) {
    if($entry->isDot())continue;
    if(++$count>700)break;
    if(!preg_match('/^([a-z][a-z0-9_-]*)\.json$/D',$entry->getFilename(),$match)
        || in_array($match[1],['memory','design-intelligence'],true) || $entry->isLink() || !$entry->isFile())continue;
    if($entry->getSize()>1048576 || $total+$entry->getSize()>8388608)continue;
    if(($value=$read($match[1]))!==null){$data[$match[1]]=$value;$total+=$entry->getSize();}
}
ksort($data,SORT_STRING);
$result=null;$error=null;
switch($request['method']??'') {
case 'initialize':$result=['protocolVersion'=>'2025-03-26','serverInfo'=>['name'=>'Public website data','version'=>'1.0.0'],'capabilities'=>['resources'=>['listChanged'=>false],'tools'=>['listChanged'=>false]]];break;
case 'notifications/initialized':http_response_code(204);exit;
case 'resources/list':$resources=[];foreach($data as $name=>$value)$resources[]=['uri'=>'site://'.($name==='site'?'info':$name),'name'=>$name,'mimeType'=>'application/json'];$result=['resources'=>$resources];break;
case 'resources/read':$resource=substr((string)($params['uri']??''),7);$name=$resource==='info'?'site':$resource;if(($params['uri']??'')==='site://'.$resource&&isset($data[$name]))$result=['contents'=>[['uri'=>'site://'.$resource,'mimeType'=>'application/json','text'=>json_encode($data[$name],JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE)]]];else $error=['code'=>-32602,'message'=>'Unknown public resource.'];break;
case 'tools/list':
    $tools=[];foreach(['get_business_info'=>'site','get_menu'=>'menu','get_services'=>'services','get_faq'=>'faq'] as $tool=>$name)if(isset($data[$name])) {
        $properties=match($name){'menu'=>['category'=>['type'=>'string','maxLength'=>200]],'faq'=>['query'=>['type'=>'string','maxLength'=>200]],default=>(object)[]};
        $tools[]=['name'=>$tool,'description'=>'Read public '.$name.' data.','inputSchema'=>['type'=>'object','properties'=>$properties,'additionalProperties'=>false],'annotations'=>['readOnlyHint'=>true,'destructiveHint'=>false]];
    }$result=['tools'=>$tools];break;
case 'tools/call':
    $name=['get_business_info'=>'site','get_menu'=>'menu','get_services'=>'services','get_faq'=>'faq'][$params['name']??'']??null;
    if($name===null||!isset($data[$name])){$error=['code'=>-32601,'message'=>'Unknown public read tool.'];break;}
    $value=$data[$name];$args=$params['arguments']??[];
    if($name==='menu'&&is_string($args['category']??null))$value['categories']=array_values(array_filter($value['categories']??[],static fn($item)=>stripos($item['name']??'',substr($args['category'],0,200))!==false));
    if($name==='faq'&&is_string($args['query']??null))$value=array_values(array_filter($value['questions']??$value['faq']??$value['items']??[],static fn($item)=>stripos(($item['question']??'').' '.($item['answer']??''),substr($args['query'],0,200))!==false));
    $result=['content'=>[['type'=>'text','text'=>json_encode($value,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE)]]];break;
default:$error=['code'=>-32601,'message'=>'Unknown public method.'];
}
echo json_encode(['jsonrpc'=>'2.0','id'=>$id]+($error?['error'=>$error]:['result'=>$result]),JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
