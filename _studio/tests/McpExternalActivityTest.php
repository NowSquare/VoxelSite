<?php
declare(strict_types=1);
require __DIR__.'/McpApplicationTest.php';
use VoxelSite\Agent\CanonicalJson;
function activityStudio(string $root):array{
 $process=proc_open([PHP_BINARY,__DIR__.'/helpers/call-site-activity.php',$root],[['pipe','r'],['pipe','w'],['pipe','w']],$pipes,$root);
 fclose($pipes[0]);$out=stream_get_contents($pipes[1]);fclose($pipes[1]);$err=stream_get_contents($pipes[2]);fclose($pipes[2]);$exit=proc_close($process);
 if($exit!==0||$err!=='')throw new RuntimeException('Activity route failed: '.$err);return json_decode($out,true,32,JSON_THROW_ON_ERROR);
}
$db->exec('DELETE FROM agent_revision_attribution');
$response=$call('tools/call',['name'=>'voxelsite_site_activity','arguments'=>(object)[]],$readKey);
appCheck($response['status']===200&&!($response['body']['result']['isError']??true),'External activity has a typed provider-free MCP read');
$activity=fn()=>$tool('voxelsite_site_activity',[],$readKey);
appCheck($activity()['last_external_revision']===null,'No attribution gives an explicit empty activity state');
function activityRevision($db,string $description,array $actor):int{
 $id=$db->insert('revisions',['user_id'=>1,'description'=>$description,'files_changed'=>CanonicalJson::encode([['path'=>'index.php','action'=>'write','had_previous'=>true]]),'created_at'=>now()]);
 $db->insert('agent_revision_attribution',['revision_id'=>$id,'operation_id'=>'activity-fixture-'.$id,'actor_json'=>CanonicalJson::encode($actor),'created_at'=>time()]);return $id;
}
$external=activityRevision($db,'External title edit',['type'=>'api_key','user_id'=>1,'credential_id'=>$key['id'],'client_name'=>'Connected client']);
$read=$activity();$studio=activityStudio($root);
appCheck($read['last_external_revision']['id']===$external&&$read['last_external_revision']['source']==='Connected client'&&$read['last_external_revision']['affected_files']===['index.php'],'Activity preserves recorded external client, revision and changed paths');
appCheck($studio['status']===200&&$studio['response']['data']===$read&&$studio['provider_attempts']===0,'Production Studio activity route and MCP return the same typed summary');
$local=activityRevision($db,'Local Studio edit',['type'=>'user','user_id'=>1,'credential_id'=>null,'client_name'=>null]);
appCheck($activity()['last_external_revision']['id']===$external,'Later local attributed revisions do not replace the latest external activity');
$db->update('agent_revision_attribution',['actor_json'=>CanonicalJson::encode(['type'=>'api_key','user_id'=>1,'credential_id'=>$key['id'],'client_name'=>null])],'revision_id=?',[$external]);
appCheck($activity()['last_external_revision']['source']==='Application test','Missing client name falls back to the retained credential label');
$db->update('studio_mcp_credentials',['revoked_at'=>time()],'key_id=?',[$key['id']]);
appCheck($activity()['last_external_revision']['source']==='Application test','Revocation does not erase historical attribution');
$db->delete('api_keys','id=?',[$key['id']]);
appCheck($activity()['last_external_revision']['source']==='Connected AI tool','Deleted credential receives an explicit generic historical label');
$db->update('agent_revision_attribution',['actor_json'=>CanonicalJson::encode(['type'=>'rest_key','user_id'=>1,'credential_id'=>999999,'client_name'=>'REST workflow'])],'revision_id=?',[$external]);
appCheck($activity()['last_external_revision']['source']==='REST workflow','External REST attribution is represented without inventing a model identity');
$before=[$db->query('SELECT * FROM revisions ORDER BY id'),$db->query('SELECT * FROM agent_revision_attribution ORDER BY revision_id'),$workspace->status(),$db->count('agent_operations')];
$activity();activityStudio($root);
appCheck($before===[$db->query('SELECT * FROM revisions ORDER BY id'),$db->query('SELECT * FROM agent_revision_attribution ORDER BY revision_id'),$workspace->status(),$db->count('agent_operations')],'Activity reads leave revision records, version and operations unchanged');
foreach(['actor_json'=>'{broken','files_changed'=>str_repeat('x',1048577),'description'=>str_repeat('x',4097)] as $field=>$bad){
 $table=$field==='actor_json'?'agent_revision_attribution':'revisions';$column=$field==='actor_json'?'revision_id':'id';$original=$db->scalar("SELECT $field FROM $table WHERE $column=?",[$external]);
 $db->update($table,[$field=>$bad],$column.'=?',[$external]);
 $error=$call('tools/call',['name'=>'voxelsite_site_activity','arguments'=>(object)[]],$readKey);
 appCheck($error['body']['result']['isError']??false,'Corrupt or oversized retained activity is explicitly refused: '.$field);
 $db->update($table,[$field=>$original],$column.'=?',[$external]);
}
$db->update('api_keys',['scopes'=>'[]'],'id=?',[$readKey['id']]);
appCheck($call('tools/call',['name'=>'voxelsite_site_activity','arguments'=>(object)[]],$readKey)['status']===403,'Activity rechecks narrowed credential authority on every call');
appCheck(!str_contains(json_encode($read),'credential_id')&&$GLOBALS['lifecycle_provider_attempts']===0,'Summary excludes raw actor identity and provider transports');
echo "MCP external activity: $checks combined checks passed\n";
