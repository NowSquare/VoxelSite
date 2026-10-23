<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
require __DIR__.'/helpers/LegacyUpgradeFixture.php';

use VoxelSite\{AgentAuth,Migrator,Settings};
use VoxelSite\Agent\{CredentialService,OperationException};

$checks=0; $roots=[]; $server=null;
function legacyRestCheck(bool $ok,string $label):void {
    global $checks; if(!$ok)throw new RuntimeException('FAIL '.$label);$checks++;echo 'PASS '.$label."\n";
}
function legacyRestHttp(string $method,string $path,array $key,?array $body=null):array {
    global $port;
    $curl=curl_init('http://127.0.0.1:'.$port.'/?_path='.rawurlencode($path));
    curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_TIMEOUT=>15,
        CURLOPT_HTTPHEADER=>['Content-Type: application/json','Authorization: Bearer '.$key['key']]]);
    if($body!==null)curl_setopt($curl,CURLOPT_POSTFIELDS,json_encode($body,JSON_THROW_ON_ERROR));
    $bytes=curl_exec($curl);$status=curl_getinfo($curl,CURLINFO_HTTP_CODE);unset($curl);
    return ['status'=>$status,'body'=>json_decode((string)$bytes,true)];
}
try {
    $f=legacyUpgradeFixture();$roots[]=$f['root'];extract($f);
    legacyRestCheck($legacy['schema_version']==='1.31.2.2' && !array_key_exists('audience',$legacy['rows'][0]),
        'Keys were issued by frozen 1.32.0 authentication on its original schema');
    $columns=array_keys($legacy['rows'][0]);
    legacyRestCheck($db->query('SELECT '.implode(',',$columns).' FROM api_keys ORDER BY id')===$legacy['rows'],
        'Upgrade preserves every existing REST key field, hash, scope and rate limit');
    legacyRestCheck((int)$db->scalar('SELECT COUNT(*) FROM agent_rest_owners WHERE user_id=1')===3,
        'One existing owner receives all pre-upgrade REST bindings without a manual request');
    $publisher=$legacy['keys']['publisher'];
    $actor=$policy->fromRestCredential($publisher['id']);
    legacyRestCheck(array_diff($actor->scopes,['operations:read','publish:write','site:read','files:read','assets:read','forms:read'])===[],
        'Legacy publishing gains only its fixed adapter scopes');
    foreach(['mail:send','restore:live','credentials:write','files:write'] as $scope) {
        try {$policy->require($actor,[$scope]);legacyRestCheck(false,'Legacy publisher has no '.$scope);}
        catch(OperationException $error){legacyRestCheck($error->errorCode==='permission_denied','Legacy publisher has no '.$scope);}
    }
    $_SERVER['HTTP_AUTHORIZATION']='Bearer '.$publisher['key'];
    try {(new CredentialService($db))->authenticate();legacyRestCheck(false,'REST key remains outside MCP audience');}
    catch(OperationException $error){legacyRestCheck($error->errorCode==='permission_denied','REST key remains outside MCP audience');}
    unset($_SERVER['HTTP_AUTHORIZATION']);
    file_put_contents($root.'/router.php',"<?php require __DIR__.'/_studio/api/agent/v1/router.php';");
    $socket=stream_socket_server('tcp://127.0.0.1:0',$errno,$error);
    if(!$socket)throw new RuntimeException('Disposable HTTP socket unavailable: '.$error);
    $port=(int)substr(strrchr(stream_socket_get_name($socket,false),':'),1);fclose($socket);
    $server=proc_open([PHP_BINARY,'-S','127.0.0.1:'.$port,$root.'/router.php'],
        [['pipe','r'],['file',$root.'/http.log','a'],['file',$root.'/http.log','a']],$pipes,$root);fclose($pipes[0]);
    for($i=0;$i<50;$i++){if($probe=@fsockopen('127.0.0.1',$port,$errno,$error,.1)){fclose($probe);break;}usleep(20000);}
    $schemaResponse=legacyRestHttp('GET','schema',['key'=>'invalid-for-public-schema']);
    $publishSchema=$schemaResponse['body']['paths']['/publish']['post']??[];
    $inputSchema=$publishSchema['requestBody']['content']['application/json']['schema']??[];
    legacyRestCheck($schemaResponse['status']===200&&in_array('operation_id',$inputSchema['required']??[],true)
        &&isset($inputSchema['properties']['operation_id']['pattern'],$inputSchema['properties']['checkpoint'])
        &&isset($publishSchema['responses']['200'],$publishSchema['responses']['202'],$publishSchema['responses']['409']),
        'Public REST schema advertises stable publish identity and retained continuation without needing authentication');
    foreach($legacy['keys'] as $name=>$key) legacyRestCheck(legacyRestHttp('GET','pages',$key)['status']===200,
        'Upgraded '.$name.' key reads pages through the production HTTP router');
    foreach(['reader','editor'] as $name) legacyRestCheck(legacyRestHttp('POST','publish',$legacy['keys'][$name],['operation_id'=>'legacy-denied-'.$name])['status']===403,
        'Upgraded '.$name.' key does not gain a publish grant');
    $missing=legacyRestHttp('POST','publish',$publisher,[]);
    legacyRestCheck($missing['status']===409 && ($missing['body']['error']['code']??null)==='invalid_schema',
        'Actual REST publish rejects a missing stable operation identity');
    $request=['operation_id'=>'legacy-http-publish-001'];
    $published=legacyRestHttp('POST','publish',$publisher,$request);
    for($i=0;$i<50 && ($published['body']['data']['operation']['status']??null)==='applying';$i++) {
        $published=legacyRestHttp('POST','publish',$publisher,$request+['checkpoint'=>$published['body']['data']['operation']['checkpoint']]);
    }
    legacyRestCheck($published['status']===200 && ($published['body']['data']['operation']['status']??null)==='succeeded',
        'The existing 1.32.0 publisher completes production HTTP publication without rebinding');
    $outputSchema=$publishSchema['responses']['200']['content']['application/json']['schema']['properties']['data']['properties']??[];
    $data=$published['body']['data'];
    legacyRestCheck(($outputSchema['published']['type']??null)==='array'&&isset($outputSchema['operation']['properties']['checkpoint'])
        &&is_array($data['published'])&&$data['operation']['operation_id']===$request['operation_id']
        &&is_int($data['operation']['checkpoint'])&&$data['recovery_snapshot_required']===true&&$data['provider_calls']===0,
        'Actual HTTP publication matches the schema’s array result and retained operation envelope');
    $again=legacyRestHttp('POST','publish',$publisher,$request);
    legacyRestCheck($again===$published && (int)$db->scalar("SELECT COUNT(*) FROM agent_operations WHERE operation_id='legacy-http-publish-001'")===1,
        'HTTP retry returns the original publish result and creates no second operation');
    $db->update('users',['role'=>'viewer'],'id=1');
    legacyRestCheck(legacyRestHttp('POST','publish',$publisher,['operation_id'=>'legacy-demoted-publish'])['status']===403,
        'Migrated binding observes the current account role on every request');
    $db->update('users',['role'=>'owner'],'id=1');
    $new=(new AgentAuth($db))->createKey('Created after upgrade','agent');
    (new Migrator($db,new Settings($db)))->run();
    $migration=require dirname(__DIR__).'/engine/migrations/024_rest_operation_owners.php';($migration['up'])($db);
    $denied=legacyRestHttp('GET','pages',$new);
    legacyRestCheck($denied['status']===409 && ($denied['body']['error']['code']??null)==='credential_migration_required',
        'Later raw keys remain unbound after migration replay and actual requests');
    (new AgentAuth($db))->revokeKey($publisher['id']);
    legacyRestCheck(legacyRestHttp('GET','pages',$publisher)['status']===401,'Revoking an upgraded key still invalidates HTTP authentication');
    proc_terminate($server);proc_close($server);$server=null;
    foreach([0,2] as $owners) {
        $f=legacyUpgradeFixture($owners);$roots[]=$f['root'];
        legacyRestCheck((int)$f['db']->scalar('SELECT COUNT(*) FROM agent_rest_owners')===0,
            $owners.' owners never cause an inferred REST identity');
        try {$f['policy']->fromRestCredential($f['legacy']['keys']['publisher']['id']);legacyRestCheck(false,'Ambiguous key remains unbound');}
        catch(OperationException $error){legacyRestCheck($error->errorCode==='credential_migration_required','Ambiguous ownership requires explicit Studio binding');}
    }
    echo "$checks legacy REST upgrade checks passed\n";
} finally {
    if(is_resource($server)){proc_terminate($server);proc_close($server);}
    VoxelSite\Database::resetInstance();foreach($roots as $path)legacyUpgradeRemove($path);
}
