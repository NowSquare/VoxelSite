<?php
declare(strict_types=1);
define('MCP_PUBLISH_FIXTURE_ONLY', true);
require __DIR__.'/McpPublishTest.php';
use VoxelSite\Agent\{CapabilityCatalog,ClientQualification,ConnectionService,ConnectionTelemetry,McpApplication,McpServer,OperationException,ProtocolProfile,UpdatePackagePolicy};
use VoxelSite\{AgentAuth,Settings};

$f=publishFixture();
$config=['app_key'=>base64_encode(str_repeat('a',32)),'studio_mcp'=>['enabled'=>true]];
$service=new ConnectionService($f['db'],$f['workspace'],$config);
$key=$f['credentials']->create($f['owner'],1,'read','Telemetry credential','Codex');
function connectionRemove(string $path):void {
    if(is_file($path)||is_link($path)){unlink($path);return;}
    foreach(scandir($path) as $name)if($name!=='.'&&$name!=='..')connectionRemove($path.'/'.$name);
    rmdir($path);
}
function connectionRow(ConnectionService $service,array $f,int $id):array {
    foreach($service->status($f['owner'])['connections'] as $row)if($row['id']===$id)return $row;
    throw new RuntimeException('Missing connection');
}
function connectionRequest(array $f,object $server,string $token,string $method='tools/list',array $params=[],?string $raw=null):array {
    return $server->handle('POST',['content-type'=>'application/json','accept'=>'application/json, text/event-stream',
        'mcp-protocol-version'=>ProtocolProfile::COMPATIBILITY,'authorization'=>'Bearer '.$token],
        $raw??json_encode(['jsonrpc'=>'2.0','id'=>1,'method'=>$method,'params'=>(object)$params]),
        function(string $secret)use($f){$_SERVER['HTTP_AUTHORIZATION']='Bearer '.$secret;return $f['credentials']->authenticate(null,true);});
}
try {
    $row=connectionRow($service,$f,$key['id']);
    publishCheck(($row['connection_state']??null)==='waiting','Fresh credential waits for an authenticated request');
    publishCheck($row['first_authenticated_at']===null && $row['last_used_at']===null && $row['last_auth_failure']===null
        && $row['last_permission_denial']===null,'Fresh connection has no invented telemetry');
    $version=$row['version'];
    $server=McpApplication::create($f['db'],$config,$f['workspace'],$f['root'].'/private/agent');
    $bad=connectionRequest($f,$server,$key['key'],raw:'{broken');
    $row=connectionRow($service,$f,$key['id']);
    publishCheck($bad['status']===400 && $row['connection_state']==='authenticated' && is_int($row['first_authenticated_at'])
        && $row['last_authenticated_at']!==null && $row['last_used_at']===null,'Accepted bearer with malformed protocol records authentication without successful use');
    $first=$row['first_authenticated_at'];
    $ok=connectionRequest($f,$server,$key['key']);
    $row=connectionRow($service,$f,$key['id']);
    publishCheck($ok['status']===200 && $row['connection_state']==='used' && is_int($row['last_used_at']),'A real catalog response records successful use');
    publishCheck($row['last_permission_denial']===null,'Catalog scope filtering does not invent permission denials');
    $deny=connectionRequest($f,$server,$key['key'],'tools/call',['name'=>'voxelsite_publish_prepare','arguments'=>(object)['private'=>'never store this']]);
    $row=connectionRow($service,$f,$key['id']);
    publishCheck($deny['status']===403 && $row['connection_state']==='permission_denied'
        && $row['last_permission_denial']['tool']==='voxelsite_publish_prepare'
        && $row['last_permission_denial']['required_scopes']===['publish:write'],'Actual denied tool records a bounded permission event');
    $before=$row['last_permission_denial'];
    connectionRequest($f,$server,$key['key'],'tools/call',['name'=>'unknown_'.str_repeat('secret',50),'arguments'=>(object)[]]);
    publishCheck(connectionRow($service,$f,$key['id'])['last_permission_denial']===$before,'Unknown tool input is not retained as permission telemetry');
    connectionRequest($f,$server,$key['key']);
    $row=connectionRow($service,$f,$key['id']);
    publishCheck($row['connection_state']==='used' && $row['last_permission_denial']===$before
        && $row['first_authenticated_at']===$first,'A later success in the same second clears displayed failure while retaining historical event');
    publishCheck($row['version']===$version,'Usage telemetry does not invalidate exact credential review versions');
    $gated=new McpServer(CapabilityCatalog::core(),$f['policy'],static fn()=>static fn()=>[],requestGate:
        static function(){throw new OperationException('permission_denied','Do not persist this detail',['required_scopes'=>['credentials:write']]);},telemetry:new ConnectionTelemetry($f['db']));
    $gatedResponse=connectionRequest($f,$gated,$key['key'],'tools/call',['name'=>'voxelsite_publish_prepare']);
    $row=connectionRow($service,$f,$key['id']);
    publishCheck($gatedResponse['status']===403 && $row['connection_state']==='permission_denied'
        && $row['last_permission_denial']['required_scopes']===['credentials:write'],'Permission refusal at the request gate records actual bounded required scopes');
    connectionRequest($f,$server,$key['key']);
    $failure=$f['credentials']->create($f['owner'],1,'read','Failed tool',null);
    $failed=connectionRequest($f,$server,$failure['key'],'tools/call',['name'=>'voxelsite_files_read','arguments'=>(object)[]]);
    $failureRow=connectionRow($service,$f,$failure['id']);
    publishCheck($failed['status']===200 && ((array)$failed['body']['result'])['isError']===true
        && $failureRow['connection_state']==='authenticated' && $failureRow['last_used_at']===null,'Tool-level failure does not become successful use merely because HTTP is 200');
    $f['db']->getPdo()->prepare('DELETE FROM api_keys WHERE id = ?')->execute([$failure['id']]);
    publishCheck(!$f['db']->scalar('SELECT COUNT(*) FROM studio_mcp_connection_events WHERE key_id = ?',[$failure['id']]),'Credential deletion cascades bounded telemetry');
    $dbBefore=$f['db']->query('SELECT * FROM studio_mcp_connection_events');
    connectionRequest($f,$server,'vxs_'.str_repeat('f',64));
    connectionRequest($f,$server,'invalid');
    publishCheck($dbBefore===$f['db']->query('SELECT * FROM studio_mcp_connection_events'),'Unknown or malformed credentials cannot attribute failures to another connection');
    $_SERVER['HTTP_AUTHORIZATION']='Bearer '.$key['key'];
    publishCheck((new AgentAuth($f['db']))->authenticate('rest')['status']===AgentAuth::AUTH_INVALID_KEY,'MCP credential still cannot authenticate to REST');
    $row=connectionRow($service,$f,$key['id']);
    publishCheck($row['connection_state']==='authentication_failed' && $row['last_auth_failure']['code']==='audience_mismatch','Full hash match safely attributes wrong-audience failure');
    connectionRequest($f,$server,$key['key']);
    publishCheck(connectionRow($service,$f,$key['id'])['connection_state']==='used','Successful request supersedes prior authentication failure');
    $f['db']->update('studio_mcp_credentials',['expires_at'=>time()-1],'key_id = ?',[$key['id']]);
    publishCheck(connectionRequest($f,$server,$key['key'])['status']===401,'Expired credential remains rejected');
    $row=connectionRow($service,$f,$key['id']);
    publishCheck($row['connection_state']==='expired' && $row['last_auth_failure']['code']==='credential_expired','Expiry overrides historical successful use');
    $f['credentials']->revoke($f['owner'],$key['id']);
    connectionRequest($f,$server,$key['key']);
    $row=connectionRow($service,$f,$key['id']);
    publishCheck($row['connection_state']==='revoked' && $row['last_auth_failure']['code']==='credential_revoked','Revocation is retained and its rejected attempt is attributable');
    $other=$f['credentials']->create($f['owner'],1,'read','Waiting','Claude Code');
    $disabled=new ConnectionService($f['db'],$f['workspace'],['app_key'=>$config['app_key'],'studio_mcp'=>['enabled'=>false]]);
    publishCheck(connectionRow($disabled,$f,$other['id'])['connection_state']==='disabled'
        && connectionRow($disabled,$f,$other['id'])['disabled_reason']==='connections_disabled','Installation switch truthfully disables retained credentials');
    $f['db']->insert('users',['id'=>2,'email'=>'telemetry@example.invalid','name'=>'Member','role'=>'editor','password_hash'=>'unused','created_at'=>now(),'updated_at'=>now()]);
    $member=$f['credentials']->create($f['owner'],2,'read','Member',null);
    $f['db']->update('users',['disabled_at'=>time()],'id = 2');
    connectionRequest($f,$server,$member['key']);
    $row=connectionRow($service,$f,$member['id']);
    publishCheck($row['connection_state']==='disabled' && $row['disabled_reason']==='account_inactive'
        && $row['last_auth_failure']['code']==='account_inactive','Disabled bound account is identified without exposing account secrets');
    $serialized=json_encode($f['db']->query('SELECT * FROM studio_mcp_connection_events'));
    publishCheck(!str_contains($serialized,$key['key']) && !str_contains($serialized,'never store')
        && !str_contains($serialized,'unknown_'),'Telemetry retains no bearer, arguments, error text or arbitrary tool names');
    publishCheck((int)$f['db']->scalar('SELECT COUNT(*) FROM studio_mcp_connection_events')===2,'Repeated events remain one bounded row per used credential');
    (new Settings($f['db']))->set('site_name','Saved site'); $_SERVER['HTTP_HOST']='attacker.invalid';
    $status=(new ConnectionService($f['db'],$f['workspace'],$config))->status($f['owner']);
    publishCheck($status['site_name']==='Saved site' && $status['endpoint']==='https://fixture.invalid/_studio/mcp.php','Connection context uses saved site identity and canonical endpoint');
    publishCheck($status['qualification']['status']==='unqualified' && count($status['qualification']['clients'])===3
        && $status['qualification']['record_version']==='2026-10-23.1','Current shipped record honestly leaves all clients unqualified');
    publishCheck(UpdatePackagePolicy::managed('_studio/mcp-client-qualification.json'),'Updater activates the versioned qualification record');
    $record=dirname(__DIR__).'/mcp-client-qualification.json';
    $recordVersion=json_decode(file_get_contents($record),true,512,JSON_THROW_ON_ERROR)['product_version'];
    publishCheck(ClientQualification::load('wrong-version',$record)['reason']==='version_mismatch','Qualification cannot leak across product versions');
    publishCheck(ClientQualification::load($recordVersion,$f['root'].'/missing.json')['reason']==='record_unavailable','Absent record never implies compatibility');
    file_put_contents($f['root'].'/record.json','{"status":"qualified"}');
    publishCheck(ClientQualification::load($recordVersion,$f['root'].'/record.json')['status']==='unqualified','Malformed record never implies compatibility');
    symlink($record,$f['root'].'/qualification-link.json');
    publishCheck(ClientQualification::load($recordVersion,$f['root'].'/qualification-link.json')['reason']==='record_unavailable','Qualification refuses a linked record');
    class UnreadableQualificationRecord {
        public $context;
        public function url_stat(string $path,int $flags):array{return ['mode'=>0100444,'size'=>50];}
        public function stream_open(string $path,string $mode,int $options,?string &$opened_path):bool{return false;}
    }
    stream_wrapper_register('qualificationfailure',UnreadableQualificationRecord::class);
    publishCheck(ClientQualification::load($recordVersion,'qualificationfailure://record')['reason']==='record_unavailable','A record disappearing at read time degrades without a warning or type error');
    stream_wrapper_unregister('qualificationfailure');
    $copy=json_decode(file_get_contents($record),true);$copy['clients'][0]['status']='qualified';
    file_put_contents($f['root'].'/record.json',json_encode($copy));
    publishCheck(ClientQualification::load($recordVersion,$f['root'].'/record.json')['status']==='unqualified','Qualified claim without versioned evidence is rejected');
    $copy=json_decode(file_get_contents($record),true);
    foreach($copy['clients'] as &$client){$client['status']='qualified';$client['client_versions']=['test-version'];
        $client['protocol_versions']=[ProtocolProfile::COMPATIBILITY];$client['verified_at']=time();$client['evidence']=['test-only-evidence'];}unset($client);
    file_put_contents($f['root'].'/record.json',json_encode($copy));
    publishCheck(ClientQualification::load($recordVersion,$f['root'].'/record.json')['status']==='qualified','Qualification derives from a valid versioned record rather than a hardcoded runtime claim');
    // A prior installation knows a last authentication, not the first or any successful request.
    $f['db']->exec('DROP TABLE studio_mcp_connection_events');
    $f['db']->update('studio_mcp_credentials',['last_authenticated_at'=>1234],'key_id = ?',[$other['id']]);
    $migration=require dirname(__DIR__).'/engine/migrations/039_connection_telemetry.php';$migration['up']($f['db']);
    $row=connectionRow($service,$f,$other['id']);
    publishCheck($row['first_authenticated_at']===null && $row['last_authenticated_at']===1234
        && $row['last_used_at']===null && $row['connection_state']==='authenticated','Upgrade retains known authentication without fabricating first use or successful use');
    $_SERVER['HTTP_AUTHORIZATION']='Bearer '.$other['key'];$f['credentials']->authenticate(null,true);
    $row=connectionRow($service,$f,$other['id']);
    publishCheck($row['first_authenticated_at']===null && $row['last_authenticated_at']>1234,
        'Later authentication cannot invent a historical first-use timestamp for a migrated connection');
    $f['db']->exec("CREATE TRIGGER telemetry_write_failure BEFORE INSERT ON studio_mcp_connection_events BEGIN SELECT RAISE(FAIL, 'test storage unavailable'); END");
    publishCheck(connectionRequest($f,$server,$other['key'])['status']===200,'Telemetry write failure cannot change a successful protocol response');
    publishCheck(connectionRow($service,$f,$other['id'])['last_used_at']===null,'Failed telemetry storage never invents a successful timestamp');
    $f['db']->exec('DROP TABLE studio_mcp_connection_events');
    publishCheck(connectionRequest($f,$server,$other['key'])['status']===200,'Telemetry absence in partial migration fixtures cannot change authorization');
    publishCheck(!$f['db']->scalar("SELECT name FROM sqlite_master WHERE name='studio_mcp_connection_events'"),'Authentication does not create runtime schema');
    echo "$checks connection telemetry checks passed\n";
}finally{unset($_SERVER['HTTP_AUTHORIZATION'],$_SERVER['HTTP_HOST']);connectionRemove($f['root']);}
