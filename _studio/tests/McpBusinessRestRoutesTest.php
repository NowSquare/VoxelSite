<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';

require __DIR__.'/McpBusinessRestTest.php';
function restBusinessCopy(string $from,string $to):void {
    if(is_link($from))throw new RuntimeException('Fixture copy refuses links.');
    if(is_file($from)){if(!is_dir(dirname($to)))mkdir(dirname($to),0700,true);copy($from,$to);return;}
    if(!is_dir($to))mkdir($to,0700,true);
    foreach(new DirectoryIterator($from) as $entry)if(!$entry->isDot())restBusinessCopy($entry->getPathname(),$to.'/'.$entry->getFilename());
}
\VoxelSite\Tests\StudioRuntimeFixture::copy($root);
copy(__DIR__.'/helpers/lifecycle-provider-trap.php',$root.'/provider-trap.php');
file_put_contents($root.'/router.php',<<<'PHP'
<?php
$GLOBALS['lifecycle_provider_attempts']=0;
require __DIR__.'/provider-trap.php';
register_shutdown_function(static function():void {file_put_contents(__DIR__.'/provider-attempts.log',(string)$GLOBALS['lifecycle_provider_attempts']."\n",FILE_APPEND);});
require __DIR__.'/_studio/engine/bootstrap.php';
\VoxelSite\Database::getInstance(__DIR__.'/private/studio.db');
foreach(['logDir'=>__DIR__.'/private','initialized'=>true] as $key=>$value)(new ReflectionProperty(\VoxelSite\Logger::class,$key))->setValue(null,$value);
require __DIR__.'/_studio/api/agent/v1/router.php';
PHP);
\VoxelSite\Agent\WorkspaceFiles::write($root.'/live','assets/forms/contact.json',\VoxelSite\Agent\CanonicalJson::encode($form));
$httpAction=['id'=>'http-booking','name'=>'HTTP workshop booking','description'=>'Disposable capacity fixture','active'=>true,
    'fields'=>[['name'=>'name','type'=>'text','required'=>true],['name'=>'slot','type'=>'select','options'=>['morning','evening'],'required'=>true]],
    'notifications'=>['guest_notify'=>false,'owner_notify'=>false],
    'constraints'=>['capacity'=>['enabled'=>true,'slot_fields'=>['slot'],'max_per_slot'=>1,'count_statuses'=>['confirmed']]],
    'companion_tools'=>['check_availability'=>true,'cancel_by_code'=>true],'confirmation'=>['code_length'=>6]];
\VoxelSite\Agent\WorkspaceFiles::write($root.'/private/actions','http-booking.json',\VoxelSite\Agent\CanonicalJson::encode($httpAction));
\VoxelSite\Agent\WorkspaceFiles::write($root.'/draft','assets/forms/private-only.json',\VoxelSite\Agent\CanonicalJson::encode(array_replace($form,['id'=>'private-only','name'=>'Private form'])));
$httpKey=$auth->createKey('REST HTTP','agent',['tools:invoke','submissions:read']);$policy->bindRestCredential($owner,$httpKey['id'],1);
(new \VoxelSite\Settings($db))->set('agent_api_enabled',true);
$socket=stream_socket_server('tcp://127.0.0.1:0',$errno,$error);
if(!$socket)throw new RuntimeException('Disposable HTTP socket unavailable: '.$error);
$port=(int)substr(strrchr(stream_socket_get_name($socket,false),':'),1);fclose($socket);
$server=proc_open([PHP_BINARY,'-S','127.0.0.1:'.$port,$root.'/router.php'],[['pipe','r'],['file',$root.'/http.log','a'],['file',$root.'/http.log','a']],$pipes,$root);
fclose($pipes[0]);
function restBusinessHttp(string $method,string $path,?array $body=null,?array $credential=null,array $query=[]):array {
    global $port,$httpKey;$credential??=$httpKey;
    $curl=curl_init('http://127.0.0.1:'.$port.'/?_path='.rawurlencode($path).'&'.http_build_query($query));
    curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_TIMEOUT=>10,
        CURLOPT_HTTPHEADER=>['Content-Type: application/json','Authorization: Bearer '.$credential['key']]]);
    if($body!==null)curl_setopt($curl,CURLOPT_POSTFIELDS,json_encode($body));
    $bytes=curl_exec($curl);return ['status'=>curl_getinfo($curl,CURLINFO_HTTP_CODE),'body'=>json_decode((string)$bytes,true)];
}
try {
    for($i=0;$i<50;$i++){if(@fsockopen('127.0.0.1',$port,$errno,$error,.1))break;usleep(20000);}
    $list=restBusinessHttp('GET','tools');
    restBusinessCheck($list['status']===200 && in_array('submit_form',array_column($list['body']['data']['tools']??[],'name'),true),'Production REST router returns shared tool discovery');
    $listed=restBusinessHttp('POST','tools/invoke',['name'=>'list_forms','arguments'=>(object)[]]);
    restBusinessCheck($listed['status']===200&&$listed['body']['data']['source']==='published'&&array_column($listed['body']['data']['forms'],'id')===['contact']&&$listed['body']['data']['total']===1,'HTTP list_forms returns the exact public inventory and excludes private-only forms');
    restBusinessCheck(restBusinessHttp('POST','tools/invoke',['name'=>'list_forms','arguments'=>['source'=>'draft']])['status']===422,'HTTP list_forms cannot switch its source to private draft');
    $read=restBusinessHttp('POST','tools/invoke',['name'=>'get_form_schema','arguments'=>['form_id'=>'contact']]);
    restBusinessCheck($read['status']===200 && isset($read['body']['data']['version']),'Production tool schema read returns its exact version');
    $input=['name'=>'submit_form','arguments'=>['form_id'=>'contact','data'=>['name'=>'HTTP visitor']],'version'=>$read['body']['data']['version'],'request_id'=>'http-rest-form-001'];
    $response=restBusinessHttp('POST','tools/invoke',$input);
    restBusinessCheck($response['status']===200 && $response['body']===restBusinessHttp('POST','tools/invoke',$input)['body'],'Production REST mutation and retry share the original record identity');
    $formRecordId=$response['body']['data']['record_id'];
    $bad=$input;unset($bad['request_id']);
    restBusinessCheck(restBusinessHttp('POST','tools/invoke',$bad)['status']===422,'Production REST write rejects missing request identity');
    $bad=$input;$bad['request_id']='http-rest-stale-001';$bad['version']=str_repeat('0',64);
    restBusinessCheck(restBusinessHttp('POST','tools/invoke',$bad)['status']===409,'Production REST write rejects stale form versions');
    $inbox=restBusinessHttp('GET','submissions');
    restBusinessCheck($inbox['status']===200 && isset($inbox['body']['data']['consistency']),'Production REST inbox exposes bounded keyset pagination');
    $definitions=array_column($list['body']['data']['tools'],null,'name');$definition=$definitions['make_http_booking'];
    restBusinessCheck(isset($definitions['check_http-booking_availability'],$definitions['cancel_http-booking'])&&$definition['action_id']==='http-booking','HTTP discovery binds create, availability and cancellation to the exact Action identifier');
    $availability=['name'=>'check_http-booking_availability','action_id'=>'http-booking','version'=>$definition['version'],'arguments'=>['slot'=>'morning']];
    $available=restBusinessHttp('POST','tools/invoke',$availability);
    restBusinessCheck($available['status']===200&&$available['body']['data']['result']['available']&&$available['body']['data']['result']['remaining']===1,'HTTP Action availability reads the actual unoccupied capacity');
    $booking=['name'=>'make_http_booking','action_id'=>'http-booking','version'=>$definition['version'],'arguments'=>['name'=>'HTTP booking visitor','slot'=>'morning'],'request_id'=>'http-action-booking-001'];
    $made=restBusinessHttp('POST','tools/invoke',$booking);
    restBusinessCheck($made['status']===200&&$made['body']['data']['record_created']&&is_int($made['body']['data']['record_id'])&&$made['body']===restBusinessHttp('POST','tools/invoke',$booking)['body'],'HTTP Action creation and lost-acknowledgement retry retain the same record and confirmation identity');
    $recordId=$made['body']['data']['record_id'];
    $changed=$booking;$changed['arguments']['name']='Changed request';
    restBusinessCheck(restBusinessHttp('POST','tools/invoke',$changed)['status']===409,'HTTP Action retry rejects changed input under the same identity');
    $missing=$booking;unset($missing['request_id']);restBusinessCheck(restBusinessHttp('POST','tools/invoke',$missing)['status']===422,'HTTP Action creation requires a stable caller identity');
    $occupied=restBusinessHttp('POST','tools/invoke',$availability);
    restBusinessCheck($occupied['status']===200&&!$occupied['body']['data']['result']['available']&&$occupied['body']['data']['result']['remaining']===0,'HTTP availability observes the committed Action capacity');
    $overflow=$booking;$overflow['request_id']='http-action-capacity-overflow';restBusinessCheck(restBusinessHttp('POST','tools/invoke',$overflow)['status']===422,'HTTP over-capacity invocation is refused without a second record');
    $forms=restBusinessHttp('GET','submissions',null,null,['source'=>'form','form_id'=>'contact']);
    $actions=restBusinessHttp('GET','submissions',null,null,['source'=>'action','entity_id'=>'http-booking']);
    restBusinessCheck($forms['status']===200&&count($forms['body']['data']['submissions'])===2&&array_unique(array_column($forms['body']['data']['submissions'],'kind'))===['form']&&in_array($formRecordId,array_column($forms['body']['data']['submissions'],'record_id'),true),'HTTP form filter contains only actual form records, including the retained HTTP submission');
    $records=$actions['body']['data']['submissions'];
    restBusinessCheck($actions['status']===200&&count($records)===1&&$records[0]['kind']==='action'&&$records[0]['entity_id']==='http-booking'&&$records[0]['record_id']===$recordId&&$records[0]['source']==='api'&&$records[0]['data']['name']==='HTTP booking visitor','HTTP Action filter proves one actual attributed record despite retry and capacity rejection');
    $legacyFilter=restBusinessHttp('GET','submissions',null,null,['form_id'=>'action_http-booking']);
    restBusinessCheck($legacyFilter['status']===200&&$legacyFilter['body']['data']['submissions']===$records,'HTTP legacy action_ identifier maps to the same exact Action inbox');
    $mixed=restBusinessHttp('GET','submissions',null,null,['per_page'=>1]);$seen=[];$pages=0;
    do{restBusinessCheck($mixed['status']===200&&count($mixed['body']['data']['submissions'])===1,'HTTP mixed inbox keeps each cursor page bounded');foreach($mixed['body']['data']['submissions']as$row)$seen[]=$row['kind'].':'.$row['entity_id'].':'.$row['record_id'];$cursor=$mixed['body']['data']['next_cursor'];if($cursor!==null)$mixed=restBusinessHttp('GET','submissions',null,null,['per_page'=>1,'cursor'=>$cursor]);if(++$pages>10)throw new RuntimeException('Unbounded HTTP cursor loop');}while($cursor!==null);
    restBusinessCheck(count($seen)===4&&count(array_unique($seen))===4&&in_array('form:contact:'.$formRecordId,$seen,true)&&in_array('action:http-booking:'.$recordId,$seen,true),'HTTP mixed inbox exhausts real form and Action records exactly once');
    $first=restBusinessHttp('GET','submissions',null,null,['per_page'=>1]);
    restBusinessCheck(restBusinessHttp('GET','submissions',null,null,['per_page'=>1,'source'=>'form','cursor'=>$first['body']['data']['next_cursor']])['status']===409,'HTTP cursor cannot be replayed with changed source filters');
    restBusinessCheck(restBusinessHttp('GET','submissions',null,null,['source'=>'form','form_id'=>'action_http-booking'])['status']===422,'HTTP rejects contradictory form and Action source selectors');
    $cancel=['name'=>'cancel_http-booking','action_id'=>'http-booking','version'=>$definition['version'],'arguments'=>['confirmation_code'=>$made['body']['data']['confirmation_code']],'request_id'=>'http-action-cancel-001'];
    $cancelled=restBusinessHttp('POST','tools/invoke',$cancel);
    restBusinessCheck($cancelled['status']===200&&$cancelled['body']===restBusinessHttp('POST','tools/invoke',$cancel)['body'],'HTTP cancellation replays its retained receipt exactly');
    $afterCancel=restBusinessHttp('GET','submissions',null,null,['source'=>'action','entity_id'=>'http-booking']);$afterAvailability=restBusinessHttp('POST','tools/invoke',$availability);
    restBusinessCheck(count($afterCancel['body']['data']['submissions'])===1&&$afterCancel['body']['data']['submissions'][0]['record_id']===$recordId&&$afterCancel['body']['data']['submissions'][0]['status']==='cancelled'&&$afterAvailability['body']['data']['result']['remaining']===1,'HTTP cancellation changes the original record and releases the exact capacity slot');
    $unbound=$auth->createKey('Unbound HTTP','agent',['tools:invoke']);
    restBusinessCheck(restBusinessHttp('GET','tools',null,$unbound)['status']===403,'Production REST route requires explicit account binding');
    $readOnly=$auth->createKey('Inbox HTTP','viewer',['submissions:read']);$policy->bindRestCredential($owner,$readOnly['id'],3);
    restBusinessCheck(restBusinessHttp('GET','submissions',null,$readOnly)['status']===403,'Current viewer ceiling denies private inbox data despite a legacy grant');
    $db->update('api_keys',['scopes'=>json_encode(['submissions:read'])],'id=?',[$httpKey['id']]);
    restBusinessCheck(restBusinessHttp('POST','tools/invoke',$input)['status']===403,'Production router rechecks narrowed credentials on retained retry');
    restBusinessCheck(!array_filter(explode("\n",trim(file_get_contents($root.'/provider-attempts.log'))),static fn($value)=>$value!=='0'),'All HTTP business routes make zero provider or Router attempts');
    restBusinessCheck(!preg_match('/(?:PHP )?(?:Warning|Deprecated|Notice|Fatal error):/',file_get_contents($root.'/http.log')),'HTTP business route log contains no PHP diagnostics');
    echo "$checks REST business and HTTP checks passed\n";
} finally {proc_terminate($server);proc_close($server);}
