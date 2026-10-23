<?php
declare(strict_types=1);
require __DIR__.'/McpUpdateTest.php';
use VoxelSite\Agent\{UpdateService,UpdatePackageStore,OperationException};
use VoxelSite\{Settings,Database};
// The inherited fixture uses only canonical temporary roots, including the production bridge layout.
$db->update('studio_mcp_credentials',['revoked_at'=>null],'key_id=?',[$other->credentialId]);
$session=bin2hex(random_bytes(32));$db->insert('sessions',['id'=>$session,'user_id'=>1,'ip_address'=>'127.0.0.1','user_agent'=>'update-fixture','created_at'=>now(),'expires_at'=>gmdate('Y-m-d\TH:i:s\Z',time()+3600)]);
(new Settings($db))->set('site_url','https://update-fixture.invalid');
$engine=dirname(__DIR__).'/engine';
$bootstrap=file_get_contents($engine.'/bootstrap.php');
$autoloader='<?php spl_autoload_register(static function(string $class):void { $prefix="VoxelSite\\\\"; if(str_starts_with($class,$prefix)){ $path=dirname(__DIR__)."/_studio/engine/".str_replace("\\\\","/",substr($class,strlen($prefix))).".php"; if(is_file($path))require_once $path; }});';
$migration="<?php return ['version'=>'1.36.0','up'=>static function(\\VoxelSite\\Database \$db):void {\$db->exec('CREATE TABLE update_probe (id INTEGER PRIMARY KEY)');}];";
$fixtureFiles=['VERSION'=>'1.36.0','_studio/engine/bootstrap.php'=>$bootstrap,'_studio/mcp.php'=>file_get_contents(dirname(__DIR__).'/mcp.php'),
    'vendor/autoload.php'=>$autoloader,'_studio/engine/Database.php'=>file_get_contents($engine.'/Database.php'),'_studio/engine/RouterSecrets.php'=>file_get_contents($engine.'/RouterSecrets.php'),
    '_studio/engine/migrations/900_update_probe.php'=>$migration];
// This pending migration is already byte-identical at review: it must still be sealed and checked.
@mkdir($root.'/live/_studio/engine/migrations',0700,true);file_put_contents($root.'/live/_studio/engine/migrations/900_update_probe.php',$migration);
$httpPackage=upStage($fixtureFiles,'http-update-package');$httpReview=$updates->prepare($other,(object)['package_id'=>$httpPackage['package_id'],'operation_id'=>'http-update-operation']);
$approvals->approve($owner,$httpReview['plan_id'],$httpReview['digest']);$httpOperation=$updates->apply($other,(object)['plan_id'=>$httpReview['plan_id'],'digest'=>$httpReview['digest']]);$httpInternal=$operations->get($other,$httpOperation['operation_id']);
$server=stream_socket_server('tcp://127.0.0.1:0',$errno,$errstr);if(!$server)throw new RuntimeException('Local HTTP fixture unavailable: '.$errstr);
$address=stream_socket_get_name($server,false);fclose($server);$port=(int)substr(strrchr($address,':'),1);
$log=$root.'/http-runtime.log';$process=proc_open([PHP_BINARY,'-d','opcache.enable_cli=1','-d','opcache.validate_timestamps=0','-d','opcache.file_update_protection=0','-S','127.0.0.1:'.$port,'-t',$root.'/live'],[0=>['pipe','r'],1=>['file',$log,'a'],2=>['file',$log,'a']],$pipes,$root.'/live');if(!is_resource($process))throw new RuntimeException('Cannot start fixture HTTP server');fclose($pipes[0]);
register_shutdown_function(static function()use($process){if(is_resource($process)){proc_terminate($process);proc_close($process);}});
for($i=0;$i<50;$i++){$socket=@stream_socket_client('tcp://127.0.0.1:'.$port,$errno,$errstr,.1);if($socket){fclose($socket);break;}usleep(40000);}
function urHttp(mixed $body,array $headers=[],string $method='POST',string $path='/_studio/update-runtime.php'):array {
    global $port;$defaults=['Content-Type'=>'application/json','Accept'=>'application/json, text/event-stream'];$head=[];foreach(array_merge($defaults,$headers) as $key=>$value)if($value!==null)$head[]=$key.': '.$value;
    $payload=is_string($body)?$body:json_encode($body,JSON_THROW_ON_ERROR);$context=stream_context_create(['http'=>['method'=>$method,'header'=>implode("\r\n",$head),'content'=>$method==='GET'?'':$payload,'ignore_errors'=>true,'timeout'=>8]]);
    $bytes=file_get_contents('http://127.0.0.1:'.$port.$path,false,$context);preg_match('/\s(\d{3})\s/',$http_response_header[0]??'', $match);return ['status'=>(int)($match[1]??0),'body'=>json_decode($bytes?:'',true),'raw'=>$bytes];
}
$bearer=['Authorization'=>'Bearer '.$otherKey['key']];$cookie=['Cookie'=>'vs_session='.$session,'X-VS-Token'=>$session];
$read=['action'=>'status','operation_id'=>$httpOperation['operation_id']];
$navigation=urHttp('', ['Accept'=>'text/html','Cookie'=>'vs_session='.$session], 'GET');upCheck($navigation['status']===200&&str_contains($navigation['raw'],'Restore exact originals'),'The frozen owner recovery page remains reachable without the application bootstrap');
upCheck(urHttp('', ['Accept'=>'text/html'], 'GET')['status']===403,'The recovery page does not disclose its CSRF token without a current session cookie');
upCheck(urHttp($read,$bearer)['body']['data']===$httpOperation,'Real HTTP runtime reads the retained operation without advancing');
upCheck(urHttp($read,['X-VS-Token'=>$session])['status']===403,'A session token without its HttpOnly cookie is rejected');
upCheck(urHttp($read,$cookie+['Origin'=>'https://outside.invalid'])['status']===403,'Foreign Origin cannot reach update effects');
upCheck(urHttp($read,$bearer+['Content-Type'=>'application/jsonp'])['status']===415,'JSON lookalike media types are rejected');
upCheck(urHttp('{',$bearer)['status']===400,'Malformed JSON has a controlled client error');
upCheck(urHttp($read+['surprise'=>true],$bearer)['status']===400,'Unexpected Studio runtime request properties are rejected');
upCheck(urHttp($read,$bearer,'GET')['status']===405,'JSON runtime GET cannot advance or dispatch work');
$init=['jsonrpc'=>'2.0','id'=>1,'method'=>'initialize','params'=>['protocolVersion'=>'2025-11-25','capabilities'=>(object)[],'clientInfo'=>['name'=>'fixture','version'=>'1']]];
upCheck(urHttp($init,$bearer)['body']['result']['protocolVersion']==='2025-11-25','Frozen runtime supports the pinned compatibility handshake');
$meta=['io.modelcontextprotocol/protocolVersion'=>'2026-07-28','io.modelcontextprotocol/clientCapabilities'=>(object)[]];
$discover=['jsonrpc'=>'2.0','id'=>2,'method'=>'server/discover','params'=>['_meta'=>$meta]];$modern=$bearer+['MCP-Protocol-Version'=>'2026-07-28','MCP-Method'=>'server/discover'];
$discovery=urHttp($discover,$modern);upCheck($discovery['status']===200&&$discovery['body']['result']['supportedVersions']===['2026-07-28','2025-11-25']&&$discovery['body']['result']['ttlMs']===0,'Modern discovery advertises only the supported frozen profile');
upCheck(urHttp($discover,array_merge($modern,['Accept'=>'application/json']))['status']===406,'MCP transport requires both supported response media types');
upCheck(urHttp($discover,$modern+['MCP-Session-Id'=>'invented'])['status']===400,'Runtime does not advertise or accept protocol sessions');
upCheck(urHttp($discover,array_merge($modern,['MCP-Method'=>'tools/list']))['body']['error']['code']===-32020,'Modern request method headers must match the body');
$call=['jsonrpc'=>'2.0','id'=>3,'method'=>'tools/call','params'=>['_meta'=>$meta,'name'=>'voxelsite_operations_get','arguments'=>['operation_id'=>$httpOperation['operation_id']]]];$callHeaders=$bearer+['MCP-Protocol-Version'=>'2026-07-28','MCP-Method'=>'tools/call','MCP-Name'=>'voxelsite_operations_get'];
upCheck(urHttp($call,$callHeaders)['body']['result']['structuredContent']===$httpOperation,'Modern status keeps the ordinary operation contract');
$beforeCheckpoint=$db->scalar('SELECT checkpoint_number FROM agent_operations WHERE id=?',[$httpInternal['id']]);
$db->update('agent_request_budgets',['request_count'=>600],'credential_id=? AND bucket=?',[$other->credentialId,'polls']);upCheck(urHttp($call,$callHeaders)['status']===429,'Exhausted polling budget fails without consuming continuation budget');
upCheck($db->scalar('SELECT checkpoint_number FROM agent_operations WHERE id=?',[$httpInternal['id']])===$beforeCheckpoint,'HTTP and protocol reads leave the update checkpoint unchanged');
// The unchanged pending migration must never execute after post-review drift.
file_put_contents($root.'/live/_studio/engine/migrations/900_update_probe.php',$migration."\n// drift");
$drift=urHttp(['action'=>'continue','operation_id'=>$httpOperation['operation_id'],'checkpoint'=>$httpOperation['checkpoint']],$bearer);
upCheck($drift['body']['data']['status']==='recovery_required'&&!$db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE name='update_probe'"),'An unchanged but pending migration is hash checked before execution');
upCheck(!(bool)$db->scalar('SELECT schema_started FROM agent_update_jobs WHERE operation_row_id=?',[$httpInternal['id']]),'Dependency drift stops before the schema boundary');
file_put_contents($root.'/live/_studio/engine/migrations/900_update_probe.php',$migration);
$reviewResponse=urHttp(['action'=>'recovery_review','recovery_id'=>$httpInternal['id']],$cookie);$recovery=$reviewResponse['body']['data'];
upCheck($recovery['eligible']&&$recovery['original_actor']['credential_id']===$other->credentialId,'Current owner can review exact rollback after external update interruption');
$rollback=urHttp(['action'=>'rollback','recovery_id'=>$httpInternal['id'],'digest'=>$recovery['digest'],'checkpoint'=>$httpOperation['checkpoint']],$cookie);
upCheck($rollback['body']['data']['status']==='failed_restored','Owner HTTP recovery consumes the exact receipt and restores before bytes');
// Mutating an immutable retained manifest never changes terminal status or permits replay effects.
$job=$db->queryOne('SELECT * FROM agent_update_jobs WHERE operation_row_id=?',[$httpInternal['id']]);$db->update('agent_update_jobs',['manifest_json'=>$job['manifest_json'].' '],'operation_row_id=?',[$httpInternal['id']]);
upCheck(urHttp(['action'=>'continue','operation_id'=>$httpOperation['operation_id'],'checkpoint'=>1],$bearer)['status']===409,'Retained manifest corruption is rejected before loading frozen code');$db->update('agent_update_jobs',['manifest_json'=>$job['manifest_json']],'operation_row_id=?',[$httpInternal['id']]);
// New reviewed candidate reuses the valid migration and executes through a fresh HTTP process.
$fixtureFiles['VERSION']='1.37.0';$pkg=upStage($fixtureFiles,'migration-success-package');$plan=$updates->prepare($other,(object)['package_id'=>$pkg['package_id'],'operation_id'=>'migration-success-operation']);$approvals->approve($owner,$plan['plan_id'],$plan['digest']);$state=$updates->apply($other,(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest']]);
$response=urHttp(['action'=>'continue','operation_id'=>$state['operation_id'],'checkpoint'=>$state['checkpoint']],$bearer);$state=$response['body']['data']??[];
upCheck(($state['status']??null)==='applying'&&$db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE name='update_probe'")===1,'A fresh runtime executes the exact approved schema transaction');
$response=urHttp(['action'=>'continue','operation_id'=>$state['operation_id'],'checkpoint'=>$state['checkpoint']],$bearer);$state=$response['body']['data']??[];
upCheck(($state['status']??null)==='succeeded'&&$state['result']['migrations_run']===1,'Schema commit and its retained checkpoint complete before update success');
upCheck(urHttp(['action'=>'status','operation_id'=>$state['operation_id']],$bearer)['body']['data']===$state,'Terminal HTTP status remains available after maintenance closes');

// Kill a real native runtime process after a file rename and before checkpoint persistence.
$crashFiles=$fixtureFiles;$crashFiles['VERSION']='1.38.0';for($i=0;$i<80;$i++)$crashFiles['_studio/engine/Crash'.$i.'.php']='<?php return '.($i+500).';';
$pkg=upStage($crashFiles,'crash-update-package');$plan=$updates->prepare($other,(object)['package_id'=>$pkg['package_id'],'operation_id'=>'crash-update-operation']);$approvals->approve($owner,$plan['plan_id'],$plan['digest']);$crashState=$updates->apply($other,(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest']]);$crashInternal=$operations->get($other,$crashState['operation_id']);
$parameters=['core'=>$packages->root().'/'.$pkg['package_id'].'/runtime/core.php','root'=>$root.'/live','storage'=>$packages->root(),'database'=>$root.'/live/_studio/data/studio.db','lock'=>$workspace->mutationLockPath(),'actor'=>$other->attribution(),'operation'=>$crashState['operation_id'],'checkpoint'=>$crashState['checkpoint'],'marker'=>$root.'/kill.marker'];
file_put_contents($root.'/native-parameters.json',json_encode($parameters,JSON_THROW_ON_ERROR));
file_put_contents($root.'/native-crash.php', <<<'CHILD'
<?php
$p=json_decode(file_get_contents($argv[1]),true,32,JSON_THROW_ON_ERROR);require $p['core'];
$parameters=(new ReflectionMethod(VoxelSite\UpdateRuntime\Runtime::class,'__construct'))->getParameters();if(!isset($parameters[4])||$parameters[4]->getName()!=='checkpointHook')throw new RuntimeException('Trusted fault seam unavailable');
$runtime=new VoxelSite\UpdateRuntime\Runtime($p['root'],$p['storage'],$p['database'],$p['lock'],static function($point)use($p){if($point==='after_file_write'){file_put_contents($p['marker'],'written');posix_kill(getmypid(),SIGKILL);}});
$runtime->advance($p['actor'],$p['operation'],$p['checkpoint']);
CHILD);
$child=proc_open([PHP_BINARY,$root.'/native-crash.php',$root.'/native-parameters.json'],[0=>['pipe','r'],1=>['pipe','w'],2=>['pipe','w']],$childPipes,$root);fclose($childPipes[0]);$childOut=stream_get_contents($childPipes[1]);$childError=stream_get_contents($childPipes[2]);fclose($childPipes[1]);fclose($childPipes[2]);$childCode=proc_close($child);
upCheck($childCode!==0&&is_file($root.'/kill.marker')&&(int)$db->scalar('SELECT checkpoint_number FROM agent_operations WHERE id=?',[$crashInternal['id']])===$crashState['checkpoint'],'SIGKILL after real file activation leaves the earlier retained checkpoint');
$db->update('agent_operations',['lease_expires_at'=>time()-1],'id=?',[$crashInternal['id']]);
do{$response=urHttp(['action'=>'continue','operation_id'=>$crashState['operation_id'],'checkpoint'=>$crashState['checkpoint']],$bearer);$crashState=$response['body']['data']??[];}while(($crashState['status']??null)==='applying');
upCheck(($crashState['status']??null)==='succeeded'&&file_get_contents($root.'/live/_studio/engine/Crash79.php')==='<?php return 579;','Expired-lease continuation converges from exact before/after bytes after process death');
// A cached old migration must not execute merely because its path matches verified new bytes.
$cachePath='_studio/engine/migrations/901_cache_probe.php';$oldCache="<?php return ['version'=>'1.39.0','up'=>static function(\\VoxelSite\\Database \$db):void {\$db->exec(\"CREATE TABLE cache_probe(value TEXT DEFAULT 'OLD')\");}];";
file_put_contents($root.'/live/'.$cachePath,$oldCache);
file_put_contents($root.'/live/_studio/cache-prime.php','<?php header("Content-Type: application/json"); $file=__DIR__."/engine/migrations/901_cache_probe.php"; echo json_encode(["compiled"=>opcache_compile_file($file),"cached"=>opcache_is_script_cached($file)]);');
$primed=urHttp('',[],'GET','/_studio/cache-prime.php');upCheck(($primed['body']['cached']??false)===true,'The HTTP fixture has an old migration cached with timestamp validation disabled');
$cacheFiles=$fixtureFiles;$cacheFiles['VERSION']='1.39.0';$cacheFiles[$cachePath]=str_replace("DEFAULT 'OLD'","DEFAULT 'NEW'",$oldCache);
$pkg=upStage($cacheFiles,'cache-update-package');$plan=$updates->prepare($other,(object)['package_id'=>$pkg['package_id'],'operation_id'=>'cache-update-operation']);$approvals->approve($owner,$plan['plan_id'],$plan['digest']);$cacheState=$updates->apply($other,(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest']]);
do{$response=urHttp(['action'=>'continue','operation_id'=>$cacheState['operation_id'],'checkpoint'=>$cacheState['checkpoint']],$bearer);$cacheState=$response['body']['data']??[];}while(($cacheState['status']??null)==='applying');
$schema=$db->scalar("SELECT sql FROM sqlite_master WHERE name='cache_probe'");upCheck(($cacheState['status']??null)==='succeeded'&&is_string($schema)&&str_contains($schema,"DEFAULT 'NEW'"),'OPcache is invalidated before executing the exact approved migration bytes');
// Revocation between file writes and checkpoint commit cannot authorize a completed step.
$revocationFiles=$fixtureFiles;$revocationFiles['VERSION']='1.40.0';for($i=0;$i<80;$i++)$revocationFiles['_studio/engine/Revocation'.$i.'.php']='<?php return '.($i+900).';';
$pkg=upStage($revocationFiles,'mid-revoke-package');$plan=$updates->prepare($other,(object)['package_id'=>$pkg['package_id'],'operation_id'=>'mid-revoke-operation']);$approvals->approve($owner,$plan['plan_id'],$plan['digest']);$revokedState=$updates->apply($other,(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest']]);$revokedInternal=$operations->get($other,$revokedState['operation_id']);
$parameters=['core'=>$packages->root().'/'.$pkg['package_id'].'/runtime/core.php','root'=>$root.'/live','storage'=>$packages->root(),'database'=>$root.'/live/_studio/data/studio.db','lock'=>$workspace->mutationLockPath(),'actor'=>$other->attribution(),'operation'=>$revokedState['operation_id'],'checkpoint'=>$revokedState['checkpoint']];
file_put_contents($root.'/revoke-parameters.json',json_encode($parameters,JSON_THROW_ON_ERROR));
file_put_contents($root.'/native-revoke.php', <<<'CHILD'
<?php
$p=json_decode(file_get_contents($argv[1]),true,32,JSON_THROW_ON_ERROR);require $p['core'];$revoked=false;
$runtime=new VoxelSite\UpdateRuntime\Runtime($p['root'],$p['storage'],$p['database'],$p['lock'],static function($point)use($p,&$revoked){if($point==='after_file_write'&&!$revoked){$pdo=new PDO('sqlite:'.$p['database']);$s=$pdo->prepare('UPDATE studio_mcp_credentials SET revoked_at=? WHERE key_id=?');$s->execute([time(),$p['actor']['credential_id']]);$revoked=true;}});
try{$runtime->advance($p['actor'],$p['operation'],$p['checkpoint']);}catch(VoxelSite\UpdateRuntime\Failure $error){if($error->errorCode==='permission_denied')exit(12);throw $error;}
CHILD);
$child=proc_open([PHP_BINARY,$root.'/native-revoke.php',$root.'/revoke-parameters.json'],[0=>['pipe','r'],1=>['pipe','w'],2=>['pipe','w']],$childPipes,$root);fclose($childPipes[0]);stream_get_contents($childPipes[1]);stream_get_contents($childPipes[2]);fclose($childPipes[1]);fclose($childPipes[2]);$childCode=proc_close($child);
$row=$db->queryOne('SELECT state,checkpoint_number FROM agent_operations WHERE id=?',[$revokedInternal['id']]);upCheck($childCode===12&&$row['state']==='recovery_required'&&(int)$row['checkpoint_number']===$revokedState['checkpoint'],'Authority revoked during writes is rechecked before checkpoint commit');
$review=urHttp(['action'=>'recovery_review','recovery_id'=>$revokedInternal['id']],$cookie)['body']['data'];
do{$response=urHttp(['action'=>'rollback','recovery_id'=>$revokedInternal['id'],'digest'=>$review['digest'],'checkpoint'=>$revokedState['checkpoint']],$cookie);$revokedState=$response['body']['data']??[];}while(($revokedState['status']??null)==='recovery_required');
upCheck(($revokedState['status']??null)==='failed_restored'&&!file_exists($root.'/live/_studio/engine/Revocation79.php'),'Independent owner recovery restores interrupted writes after mid-request revocation');
$db->update('studio_mcp_credentials',['revoked_at'=>null],'key_id=?',[$other->credentialId]);
// A migration error rolls its SQL back, but never claims that file-only restoration reverses schema execution.
$failureFiles=$fixtureFiles;$failureFiles['VERSION']='1.40.0';$failureFiles['_studio/engine/migrations/902_failed_probe.php']="<?php return ['version'=>'1.40.0','up'=>static function(\\VoxelSite\\Database \$db):void {\$db->exec('CREATE TABLE failed_probe(id INTEGER)'); throw new \\RuntimeException('fixture migration failure');}];";
$pkg=upStage($failureFiles,'failure-update-package');$plan=$updates->prepare($other,(object)['package_id'=>$pkg['package_id'],'operation_id'=>'failure-update-operation']);$approvals->approve($owner,$plan['plan_id'],$plan['digest']);$failed=$updates->apply($other,(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest']]);
$response=urHttp(['action'=>'continue','operation_id'=>$failed['operation_id'],'checkpoint'=>$failed['checkpoint']],$bearer);$failed=$response['body']['data']??[];$failedInternal=$operations->get($other,$failed['operation_id']);
upCheck(($failed['status']??null)==='recovery_required'&&(int)$db->scalar("SELECT COUNT(*) FROM sqlite_master WHERE name='failed_probe'")===0,'A failing migration rolls back its SQL and retains a truthful recovery-required outcome');
$review=urHttp(['action'=>'recovery_review','recovery_id'=>$failedInternal['id']],$cookie)['body']['data'];upCheck($review['schema_started']&&!$review['eligible'],'Owner recovery refuses file-only rollback once schema execution began');
echo "\n{$checks} combined update checks passed\n";
