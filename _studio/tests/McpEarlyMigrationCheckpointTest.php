<?php
declare(strict_types=1);
require_once __DIR__.'/helpers/lifecycle-provider-trap.php';
require_once dirname(__DIR__).'/engine/bootstrap.php';

use VoxelSite\{Database,Logger,Migrator,Settings};

$checks=0;$roots=[];
function checkpointCheck(bool $ok,string $label):void {global $checks;$checks++;if(!$ok)throw new RuntimeException('FAIL '.$label);echo 'PASS '.$label."\n";}
function checkpointHas(Database $db,string $table):bool {return (bool)$db->scalar("SELECT name FROM sqlite_master WHERE type='table' AND name=?",[$table]);}
function checkpointRows(Database $db):array {
    $out=[];
    foreach($db->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name!='settings' ORDER BY name") as $row){
        $table=$row['name'];$columns=array_column($db->query('PRAGMA table_info("'.$table.'")'),'name');
        $out[$table]=['columns'=>$columns,'rows'=>$db->query('SELECT '.implode(',',array_map(static fn($name)=>'"'.$name.'"',$columns)).' FROM "'.$table.'" ORDER BY rowid')];
    }
    return $out;
}
function checkpointSeed(Database $db):void {
    $time=1700000000;$iso='2023-11-14T22:13:20Z';$hash=hash('sha256','retained synthetic bytes');
    $actor='{ "kind": "credential", "user_id": 41, "credential_id": 301 }';
    foreach([41=>'owner',42=>'editor'] as $id=>$role)$db->insert('users',['id'=>$id,'email'=>$role.'@example.invalid','password_hash'=>'synthetic-retained-hash','name'=>$role,'role'=>$role,'created_at'=>$iso,'updated_at'=>$iso]);
    foreach([301=>'studio_mcp',302=>'rest'] as $id=>$audience)$db->insert('api_keys',['id'=>$id,'key_hash'=>hash('sha256','synthetic-key-'.$id),'key_prefix'=>'vxs_fixture_'.$id,'label'=>'Retained '.$audience,'role'=>'agent','scopes'=>'[ "files:read", "pages:read" ]','rate_limit'=>73,'last_used_at'=>$iso,'created_at'=>$iso,'audience'=>$audience]);
    $db->insert('studio_mcp_credentials',['key_id'=>301,'user_id'=>41,'client_name'=>'Retained client','expires_at'=>$time+3600,'revoked_at'=>null,'last_authenticated_at'=>$time+12,'created_at'=>$time]);
    $db->update('site_workspace_state',['format'=>2,'draft_version'=>17,'release_id'=>'retained_release','reservation_operation_id'=>'retained_applying','updated_at'=>$time],'id=1');
    foreach(['succeeded','applying'] as $state)$db->insert('agent_operations',['id'=>'retained_'.$state,'operation_id'=>'caller-'.$state,'actor_key'=>'credential:301','user_id'=>41,'credential_id'=>301,'actor_json'=>$actor,'kind'=>'changes.apply','request_digest'=>$hash,'request_json'=>'{ "path": "index.php" }','preparation_id'=>'retained_change','state'=>$state,'phase'=>$state==='applying'?'write_files':'complete','checkpoint_number'=>3,'checkpoint_json'=>'{ "next_file": 1, "total_files": 2 }','lease_token'=>$state==='applying'?'retained-lease':null,'lease_expires_at'=>$state==='applying'?$time+30:null,'before_version'=>'draft:16','after_version'=>$state==='succeeded'?'draft:17':null,'recovery_json'=>'{ "originals": ["index.php", "about.php"] }','result_json'=>$state==='succeeded'?'{ "changed": true, "provider_calls": 0 }':null,'created_at'=>$time,'updated_at'=>$time+4,'expires_at'=>$time+3600]);
    $db->insert('agent_briefs',['id'=>'retained_brief','actor_key'=>'credential:301','user_id'=>41,'credential_id'=>301,'request_id'=>'retained-brief-request','request_digest'=>$hash,'action'=>'edit_page','base_draft_version'=>'draft:16','rules_digest'=>$hash,'direction_seed'=>'retained-direction','direction_json'=>'{ "palette": "original" }','context_refs_json'=>'[ "index.php" ]','payload_json'=>'{ "immutable": true }','payload_digest'=>$hash,'created_at'=>$time,'expires_at'=>$time+3600]);
    if(checkpointHas($db,'agent_change_sets'))$db->insert('agent_change_sets',['id'=>'retained_change','actor_key'=>'credential:301','user_id'=>41,'credential_id'=>301,'request_id'=>'retained-change-request','request_digest'=>$hash,'base_draft_version'=>'draft:16','brief_id'=>'retained_brief','summary'=>'Retained exact review','status'=>'ready','manifest_json'=>'{ "files": ["index.php"] }','sealed_digest'=>$hash,'payload_json'=>'{ "reviewed": true }','staged_bytes'=>197,'created_at'=>$time,'expires_at'=>$time+3600]);
    if(checkpointHas($db,'agent_preview_grants'))$db->insert('agent_preview_grants',['id'=>'retained_preview','credential_id'=>301,'user_id'=>41,'site_key'=>$hash,'draft_version'=>'draft:17','entry_path'=>'index.php','paths_json'=>'[ "index.php" ]','ticket_hash'=>$hash,'ticket_expires_at'=>$time+120,'consumed_at'=>$time+20,'cookie_hash'=>hash('sha256','retained-cookie'),'created_at'=>$time,'expires_at'=>$time+600]);
    if(checkpointHas($db,'agent_publish_plans')){
        $db->insert('agent_publish_plans',['id'=>'retained_plan','actor_key'=>'credential:301','user_id'=>41,'credential_id'=>301,'request_id'=>'retained-publish-request','request_digest'=>$hash,'status'=>'published','manifest_json'=>'{ "after": {"index.php": "retained"} }','digest'=>$hash,'payload_json'=>'{ "review": "retained" }','staged_bytes'=>641,'created_at'=>$time,'expires_at'=>$time+3600]);
        $db->insert('site_releases',['id'=>'retained_release','plan_id'=>'retained_plan','operation_id'=>'retained_publish','actor_json'=>$actor,'before_release_id'=>null,'draft_version'=>17,'manifest_json'=>'{ "managed": ["index.php"] }','digest'=>$hash,'created_at'=>$time]);
        $db->insert('site_shipped_provenance',['path'=>'submit.php','sha256'=>$hash,'captured_at'=>$time]);
    }
    if(checkpointHas($db,'site_snapshot_captures')){
        $db->insert('site_snapshot_captures',['id'=>'retained_snapshot','actor_key'=>'credential:301','user_id'=>41,'operation_id'=>'retained-capture','request_digest'=>$hash,'actor_json'=>$actor,'status'=>'valid','manifest_json'=>'{ "domain": "both" }','digest'=>$hash,'label'=>'Retained snapshot','domain'=>'both','staged_bytes'=>733,'created_at'=>$time]);
        $db->insert('agent_restore_plans',['id'=>'retained_restore','actor_key'=>'credential:301','user_id'=>41,'credential_id'=>301,'request_id'=>'retained-restore-request','request_digest'=>$hash,'snapshot_id'=>'retained_snapshot','domain'=>'published','status'=>'ready','manifest_json'=>'{ "before": "retained_release" }','digest'=>$hash,'payload_json'=>'{ "review": "restore" }','staged_bytes'=>911,'created_at'=>$time,'expires_at'=>$time+3600]);
    }
    if(checkpointHas($db,'agent_rest_owners'))$db->insert('agent_rest_owners',['key_id'=>302,'user_id'=>42,'bound_by'=>41,'bound_at'=>$time]);
    if(checkpointHas($db,'agent_business_changes'))$db->insert('agent_business_changes',['id'=>'retained_business','actor_key'=>'credential:301','user_id'=>41,'site_key'=>$hash,'request_id'=>'retained-business-request','request_digest'=>$hash,'status'=>'prepared','payload_json'=>'[ {"path": "/retained/legacy/site.json", "before": "original"} ]','result_json'=>'{ "pending": true }','created_at'=>$time,'actor_json'=>$actor]);
    if(checkpointHas($db,'agent_admin_plans'))$db->insert('agent_admin_plans',['id'=>'retained_admin','actor_key'=>'credential:301','actor_json'=>$actor,'operation_id'=>'retained-admin-operation','action'=>'credential.create','site_key'=>$hash,'request_digest'=>$hash,'payload_ciphertext'=>'opaque-retained-ciphertext:exact==','review_json'=>'{ "expires_days": 7 }','scopes_json'=>'[ "files:read" ]','digest'=>$hash,'status'=>'approved','approved_by'=>41,'approval_expires_at'=>$time+120,'consumed_at'=>null,'result_json'=>null,'created_at'=>$time,'expires_at'=>$time+3600]);
    if(checkpointHas($db,'agent_admin_secrets'))$db->insert('agent_admin_secrets',['plan_id'=>'retained_admin','credential_id'=>301,'ciphertext'=>'opaque-retained-delivery:exact==','expires_at'=>$time+600,'claimed_at'=>null]);
    if(checkpointHas($db,'agent_snapshot_deletions'))$db->insert('agent_snapshot_deletions',['id'=>'retained_deletion','actor_key'=>'credential:301','operation_id'=>'retained-delete-operation','snapshot_id'=>'retained_snapshot','version'=>$hash,'request_digest'=>$hash,'payload_json'=>'{ "originals": "retained" }','payload_digest'=>$hash,'deleted_at'=>$time+60,'created_at'=>$time]);
    (new Settings($db))->set('retained_checkpoint_value',['exact'=>'quoted / value','number'=>17]);
}

try {
    $files=glob(dirname(__DIR__).'/engine/migrations/*.php');sort($files,SORT_STRING);
    foreach([17=>'1.33.0.4',23=>'1.33.0.10',31=>'1.33.0.18',32=>'1.33.0.19',37=>'1.33.0.24'] as $cutoff=>$expectedVersion){
        $root=realpath(sys_get_temp_dir()).'/vs-early-mcp-'.bin2hex(random_bytes(6));mkdir($root,0700);$roots[]=$root;
        foreach(['logDir'=>$root,'initialized'=>true] as $key=>$value)(new ReflectionProperty(Logger::class,$key))->setValue(null,$value);
        Database::resetInstance();$db=Database::getInstance($root.'/studio.db');$settings=new Settings($db);
        foreach($files as $file){if((int)basename($file)>$cutoff)break;$migration=require $file;$db->transaction(static function()use($migration,$db,$settings):void{($migration['up'])($db);$settings->set('schema_version',$migration['version']);});}
        checkpointCheck($settings->get('schema_version')===$expectedVersion,"Checkpoint $cutoff is built by its actual ordered migrations");
        checkpointSeed($db);$before=checkpointRows($db);$setting=$db->queryOne('SELECT * FROM settings WHERE key=?',['retained_checkpoint_value']);
        $result=(new Migrator($db,$settings))->run();
        checkpointCheck(count($result['applied'])===count($files)-$cutoff && $result['current_version']==='1.33.0.26',"Checkpoint $cutoff installs every later migration through039");
        foreach($before as $table=>$snapshot){
            $rows=$db->query('SELECT '.implode(',',array_map(static fn($name)=>'"'.$name.'"',$snapshot['columns'])).' FROM "'.$table.'" ORDER BY rowid');
            checkpointCheck($rows===$snapshot['rows'],"Checkpoint $cutoff retains exact existing columns and rows in $table");
        }
        checkpointCheck($db->queryOne('SELECT * FROM settings WHERE key=?',['retained_checkpoint_value'])===$setting,"Checkpoint $cutoff preserves unrelated configuration bytes");
        checkpointCheck((int)$db->scalar('SELECT user_id FROM agent_rest_owners WHERE key_id=302')===($cutoff<24?41:42),"Checkpoint $cutoff preserves existing REST identity or makes only the one-time unambiguous binding");
        $event=$db->queryOne('SELECT * FROM studio_mcp_connection_events WHERE key_id=301');
        checkpointCheck($event['last_authenticated_at']===1700000012 && $event['last_outcome']==='authenticated'
            && $event['first_authenticated_at']===null && $event['last_used_at']===null,"Checkpoint $cutoff does not invent first use or successful protocol use from historical authentication");
        checkpointCheck(in_array('metadata_json',array_column($db->query('PRAGMA table_info(agent_business_changes)'),'name'),true)
            && (!$db->count('agent_business_changes') || ($db->queryOne('SELECT metadata_json,metadata_digest FROM agent_business_changes')['metadata_json']===null
                && $db->queryOne('SELECT metadata_json,metadata_digest FROM agent_business_changes')['metadata_digest']===null)),"Checkpoint $cutoff installs Action metadata without rewriting old recovery payloads");
        $upgraded=checkpointRows($db);$schema=$db->query("SELECT type,name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name");$settingsBefore=$db->query('SELECT * FROM settings ORDER BY key');
        $again=(new Migrator($db,$settings))->run();
        checkpointCheck($again['applied']===[] && checkpointRows($db)===$upgraded && $db->query('SELECT * FROM settings ORDER BY key')===$settingsBefore
            && $db->query("SELECT type,name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name")===$schema,"Checkpoint $cutoff rerun is an exact schema/data no-op");
        checkpointCheck(($GLOBALS['lifecycle_provider_attempts']??0)===0,"Checkpoint $cutoff upgrade makes no provider requests");
    }
    echo "$checks early MCP migration checkpoint checks passed\n";
} finally {
    Database::resetInstance();foreach($roots as $root){foreach(glob($root.'/*') as $file)if(is_file($file))unlink($file);rmdir($root);}
}
