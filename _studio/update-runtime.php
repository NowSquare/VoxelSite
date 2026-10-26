<?php
declare(strict_types=1);
// VOXELSITE_UPDATE_GATE_V1 — permanent, native-PHP-only update/recovery bridge.
// Never require the application bootstrap here.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');header('Referrer-Policy: no-referrer');
$rpcId=null;$rpc=false;$httpStatus=409;$rpcCode=-32600;
$fail=static function(string $message,int $status=400,int $code=-32600)use(&$httpStatus,&$rpcCode):never{$httpStatus=$status;$rpcCode=$code;throw new RuntimeException($message);};
$exact=static function(stdClass $value,array $keys)use($fail):void{if(array_diff(array_keys((array)$value),$keys)||array_diff($keys,array_keys((array)$value)))$fail('Unexpected update request fields.');};
$one=static function(PDO $pdo,string $sql,array $args=[]):?array{$statement=$pdo->prepare($sql);$statement->execute($args);return $statement->fetch()?:null;};
$nativePath=static fn(string $path):string=>DIRECTORY_SEPARATOR==='\\'?str_replace('\\','/',$path):$path;
// Keep this bridge independent of every mutable application/runtime file.
$checkedPath=static function(string $path)use($nativePath):string{
    $path=$nativePath($path);$ancestor=$path;
    for($depth=0;$depth<256;$depth++){
        clearstatcache(true,$ancestor);
        if(is_link($ancestor))throw new RuntimeException('Update recovery paths cannot follow symlinks.');
        $parent=$nativePath(dirname($ancestor));
        if($parent===$ancestor||$ancestor==='/'||$ancestor==='.')break;
        $ancestor=$parent;
    }
    if($depth===256||($real=realpath($path))===false||$nativePath($real)!==$path)throw new RuntimeException('Update recovery storage is unavailable.');
    return $path;
};
try{
    $root=$checkedPath(dirname(__DIR__));$storage=$root.'/_studio/data/updates';$database=$root.'/_studio/data/studio.db';
    foreach([$storage,$database] as $target)$checkedPath($target);
    $pdo=new PDO('sqlite:'.$database,null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);$pdo->exec('PRAGMA busy_timeout=2000');
    $method=$_SERVER['REQUEST_METHOD']??'GET';
    $navigation=$method==='GET'&&str_contains(strtolower($_SERVER['HTTP_ACCEPT']??''),'text/html');
    if($method!=='POST'&&!$navigation){header('Allow: POST');http_response_code(405);echo json_encode(['ok'=>false,'error'=>['code'=>'update_maintenance','message'=>'A retained system update is active. Use the signed-in Studio update screen or the existing MCP operation status and continuation tools.'],'runtime'=>'update-runtime.php']);return;}
    if(!$navigation&&strtolower(trim(explode(';',$_SERVER['CONTENT_TYPE']??'')[0]))!=='application/json')$fail('Use a JSON update request.',415);
    if(isset($_SERVER['CONTENT_LENGTH'])&&(!ctype_digit($_SERVER['CONTENT_LENGTH'])||(float)$_SERVER['CONTENT_LENGTH']>65536))$fail('The update request exceeds its body limit.',413);
    $body=$navigation?json_encode(['action'=>'owner_status','recovery_id'=>'']):file_get_contents('php://input',false,null,0,65537);if($body===false||strlen($body)>65536)$fail('The update request exceeds its body limit.',413);
    try{$request=json_decode($body,false,32,JSON_THROW_ON_ERROR);}catch(JsonException){$fail('Invalid JSON.',400,-32700);}if(!$request instanceof stdClass)$fail('Use one request object.');
    $rpc=property_exists($request,'jsonrpc');$rpcId=$request->id??null;
    if($rpc&&($request->jsonrpc!=='2.0'||!is_string($request->method??null)||$request->method===''||strlen($request->method)>128
        ||array_diff(array_keys((array)$request),['jsonrpc','id','method','params'])
        ||(property_exists($request,'id')&&!is_string($rpcId)&&!is_int($rpcId))))$fail('Invalid JSON-RPC request.');
    $headers=[];foreach($_SERVER as $key=>$value)if(str_starts_with($key,'HTTP_')){
        if(!is_string($value)||strlen($value)>8192||preg_match('/[\x00-\x08\x0a-\x1f\x7f]/',$value))$fail('Malformed HTTP headers.');
        $headers[strtolower(str_replace('_','-',substr($key,5)))]=$value;
    }
    $authorization=$headers['authorization']??$_SERVER['REDIRECT_HTTP_AUTHORIZATION']??'';
    if($authorization!==''&&!preg_match('/^Bearer ([A-Za-z0-9._~+\/-]+=*)$/iD',$authorization,$match))$fail('A current update credential is required.',401);
    $bearer=$authorization!==''?$match[1]:null;$session=$navigation?($_COOKIE['vs_session']??null):($headers['x-vs-token']??null);
    if($bearer!==null){
        $identity=$one($pdo,'SELECT k.id,c.user_id FROM api_keys k JOIN studio_mcp_credentials c ON c.key_id=k.id WHERE k.key_hash=?',[hash('sha256',$bearer)]);
        if(!$identity)$fail('A current update credential is required.',401);
        $actorKey='api_key:'.$identity['id'];
    }else{
        if(!is_string($session)||!preg_match('/^[a-f0-9]{64}$/D',$session)||!is_string($_COOKIE['vs_session']??null)||!hash_equals($_COOKIE['vs_session'],$session))$fail('Use the current owner session and CSRF header.',403);
        $identity=$one($pdo,'SELECT user_id FROM sessions WHERE id=? AND expires_at>?',[$session,gmdate('Y-m-d\TH:i:s\Z')]);
        if(!$identity)$fail('The owner session expired.',401);
        $actorKey='user:'.$identity['user_id'];
    }
    $site=$pdo->query("SELECT value FROM settings WHERE key='site_url'")->fetchColumn();$site=is_string($site)?json_decode($site,true):null;
    if(isset($headers['origin'])){
        $parts=is_string($site)?parse_url($site):false;$origin=$parts&&isset($parts['scheme'],$parts['host'])?strtolower($parts['scheme'].'://'.$parts['host']).(isset($parts['port'])?':'.$parts['port']:''):null;
        if($origin===null||!hash_equals($origin,strtolower($headers['origin'])))$fail('This update origin is not allowed.',403);
    }
    $activePath=$storage.'/active.json';$active=null;
    if(is_file($activePath)&&!is_link($activePath)){
        $active=json_decode(file_get_contents($activePath,false,null,0,4097),true,16,JSON_THROW_ON_ERROR);
    }
    $operationRowId=$active['operation_row_id']??($request->recovery_id??null);
    if($operationRowId!==null){
        if(!is_string($operationRowId)||!preg_match('/^op_[a-f0-9]{32}$/D',$operationRowId))throw new RuntimeException('Invalid recovery identity.');
        $statement=$pdo->prepare('SELECT j.*,o.operation_id FROM agent_update_jobs j JOIN agent_operations o ON o.id=j.operation_row_id WHERE j.operation_row_id=?');$statement->execute([$operationRowId]);
    }else{
        $operationId=$rpc?($request->params->arguments->operation_id??null):($request->operation_id??null);
        if(!is_string($operationId)||!preg_match('/^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$/D',$operationId))throw new RuntimeException('Select a retained update operation.');
        // Operation identities are private to the current authenticated namespace.
        $statement=$pdo->prepare('SELECT j.*,o.operation_id FROM agent_update_jobs j JOIN agent_operations o ON o.id=j.operation_row_id WHERE o.operation_id=? AND o.actor_key=? AND o.user_id=?');$statement->execute([$operationId,$actorKey,$identity['user_id']]);
    }
    $job=$statement->fetch();if(!$job||!preg_match('/^update_[a-f0-9]{32}$/D',$job['package_id'])||strlen($job['manifest_json'])>1048576)throw new RuntimeException('The retained update runtime is unavailable.');
    $review=$one($pdo,'SELECT manifest_json,package_id FROM agent_update_reviews WHERE plan_id=?',[$job['plan_id']]);
    $manifestHash=hash('sha256',$job['manifest_json']);
    if(!$review||$review['package_id']!==$job['package_id']||!hash_equals($job['manifest_sha256']??'',$manifestHash)||!hash_equals($manifestHash,hash('sha256',$review['manifest_json'])))$fail('The retained update no longer matches its reviewed manifest.',409);
    $manifest=json_decode($job['manifest_json'],true,64,JSON_THROW_ON_ERROR);
    if(($manifest['root']??null)!==$root||($manifest['storage']??null)!==$storage||($manifest['database']??null)!==$database)throw new RuntimeException('The retained update belongs to another installation.');
    $runtimeDir=$storage.'/'.$job['package_id'].'/runtime';
    foreach([$storage.'/'.$job['package_id'],$runtimeDir] as $directory)$checkedPath($directory);
    $hashes=$manifest['runtime_files']??[];
    if(array_keys($hashes)!==['ProviderCallForbidden.php','ProviderCallPolicy.php','core.php','profile.php'])throw new RuntimeException('The update runtime file set is invalid.');
    $canonical=json_encode($hashes,JSON_THROW_ON_ERROR|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
    if(!hash_equals($job['runtime_hash'],hash('sha256',$canonical)))throw new RuntimeException('The update runtime receipt failed verification.');
    foreach($hashes as $name=>$hash){$file=$runtimeDir.'/'.$name;if(is_link($file)||!is_file($file)||filesize($file)>2097152)throw new RuntimeException('The update runtime is unavailable.');$bytes=file_get_contents($file,false,null,0,2097153);if($bytes===false||!hash_equals($hash,hash('sha256',$bytes)))throw new RuntimeException('The frozen update runtime failed integrity verification.');}
    require_once $runtimeDir.'/ProviderCallPolicy.php';require_once $runtimeDir.'/core.php';require_once $runtimeDir.'/profile.php';
    $runtime=new VoxelSite\UpdateRuntime\Runtime($root,$storage,$database,$manifest['lock_path']);
    $actor=$runtime->authenticate($bearer,$session);
    $server=['name'=>'VoxelSite Studio MCP update runtime','version'=>'1'];
    if($rpc){
        if($bearer===null)throw new VoxelSite\UpdateRuntime\Failure('permission_denied','MCP update requests require their original Studio MCP bearer credential.');
        $accepts=static function(string $type)use($headers):bool{foreach(explode(',',$headers['accept']??'') as $item){$parts=array_map('trim',explode(';',strtolower($item)));$media=array_shift($parts);$quality=1.0;foreach($parts as $part)if(str_starts_with($part,'q='))$quality=(float)substr($part,2);if($quality>0&&in_array($media,[$type,'*/*'],true))return true;}return false;};
        if(!$accepts('application/json')||!$accepts('text/event-stream'))$fail('Accept must include application/json and text/event-stream.',406);
        if(isset($headers['mcp-session-id']))$fail('This update runtime does not use MCP sessions.');
        if(property_exists($request,'params')&&!$request->params instanceof stdClass)$fail('Use an object for MCP params.',400,-32602);
        $params=$request->params??new stdClass();
        if(property_exists($params,'_meta')&&!$params->_meta instanceof stdClass)$fail('Use an object for request metadata.',400,-32602);
        $bodyVersion=$params->_meta->{VoxelSite\Agent\ProtocolProfile::VERSION_META}??null;
        $version=$request->method==='initialize'&&$bodyVersion===null?VoxelSite\Agent\ProtocolProfile::COMPATIBILITY:($headers['mcp-protocol-version']??null);
        if($bodyVersion!==null&&($bodyVersion!==$version||$version===VoxelSite\Agent\ProtocolProfile::COMPATIBILITY))$fail('Protocol version and metadata do not match.',400,-32020);
        if(!in_array($version,VoxelSite\Agent\ProtocolProfile::versions(),true))$fail('Use a supported MCP protocol version.',400,-32022);
        $profile=new VoxelSite\Agent\ProtocolProfile($version);if(($request->params??null)!==null&&!$request->params instanceof stdClass)throw new RuntimeException('Use an object for MCP params.');
        if($invalid=$profile->validate($request,$headers))$fail($invalid['message'],400,$invalid['code']);
        $params=$request->params??new stdClass();
        $allowedParams=$request->method==='initialize'?['protocolVersion','capabilities','clientInfo']:($request->method==='tools/call'?['name','arguments','_meta']:['_meta']);
        if(array_diff(array_keys((array)$params),$allowedParams))$fail('Unsupported MCP request fields.',400,-32602);
        $poll=$request->method==='tools/call'&&($params->name??null)==='voxelsite_operations_get';$bucket=$poll?'polls':'requests';$limit=$poll?600:1000;$window=intdiv(time(),3600)*3600;
        $pdo->beginTransaction();try{$budget=$one($pdo,'SELECT * FROM agent_request_budgets WHERE credential_id=? AND bucket=?',[$actor['credential_id'],$bucket]);$count=$budget&&(int)$budget['window_start']===$window?(int)$budget['request_count']:0;
            if($count>=$limit){header('Retry-After: '.max(1,$window+3600-time()));$fail('This request budget is temporarily exhausted.',429);}
            $budgetWrite=$pdo->prepare('INSERT INTO agent_request_budgets(credential_id,bucket,window_start,request_count) VALUES(?,?,?,?) ON CONFLICT(credential_id,bucket) DO UPDATE SET window_start=excluded.window_start,request_count=excluded.request_count');$budgetWrite->execute([$actor['credential_id'],$bucket,$window,$count+1]);$pdo->commit();
        }catch(Throwable $error){if($pdo->inTransaction())$pdo->rollBack();throw $error;}
        if($request->method==='notifications/initialized'&&!$profile->modern()){http_response_code(202);return;}
        if($rpcId===null)throw new RuntimeException('Update requests require a JSON-RPC identity.');
        if($request->method==='initialize'&&!$profile->modern())$result=['protocolVersion'=>$version,'capabilities'=>['tools'=>new stdClass()],'serverInfo'=>$server];
        elseif($request->method==='server/discover'&&$profile->modern())$result=$profile->result(['supportedVersions'=>VoxelSite\Agent\ProtocolProfile::versions(),'capabilities'=>['tools'=>new stdClass()]],$server,true);
        elseif($request->method==='ping'&&!$profile->modern())$result=$profile->result([],$server);
        elseif($request->method==='tools/list'){
            $tools=[];foreach(['get','continue'] as $kind){$properties=['operation_id'=>['type'=>'string','pattern'=>'^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$']];if($kind==='continue')$properties['checkpoint']=['type'=>'integer','minimum'=>0];$tools[]=['name'=>'voxelsite_operations_'.$kind,'description'=>$kind==='get'?'Read the retained system update; this never advances it.':'Continue one bounded step of the exact approved system update.','inputSchema'=>['type'=>'object','properties'=>$properties,'required'=>array_keys($properties),'additionalProperties'=>false]];}$result=$profile->result(['tools'=>$tools],$server,true);
        }elseif($request->method==='tools/call'){
            $args=$params->arguments??null;if(!$args instanceof stdClass||!is_string($args->operation_id??null))throw new RuntimeException('Select the exact update operation.');
            if(!in_array($params->name??null,['voxelsite_operations_get','voxelsite_operations_continue'],true))throw new VoxelSite\UpdateRuntime\Failure('update_maintenance','Only system update status and continuation are available during activation.');
            $allowed=$params->name==='voxelsite_operations_get'?['operation_id']:['operation_id','checkpoint'];
            if(array_diff(array_keys((array)$args),$allowed)||array_diff($allowed,array_keys((array)$args)))throw new RuntimeException('Unexpected update operation arguments.');
            if($params->name==='voxelsite_operations_continue'&&(!is_int($args->checkpoint)||$args->checkpoint<0))throw new RuntimeException('Use the exact integer checkpoint.');
            $value=$params->name==='voxelsite_operations_get'?$runtime->status($actor,$args->operation_id):$runtime->advance($actor,$args->operation_id,$args->checkpoint);
            $result=$profile->result(['content'=>[['type'=>'text','text'=>json_encode($value,JSON_THROW_ON_ERROR)]],'structuredContent'=>(object)$value,'isError'=>false],$server);
        }else $fail('Method unavailable during update maintenance.',$profile->modern()?404:200,-32601);
        echo json_encode(['jsonrpc'=>'2.0','id'=>$rpcId,'result'=>(object)$result],JSON_THROW_ON_ERROR);return;
    }
    if($navigation)$request->recovery_id=$job['operation_row_id'];
    $action=$request->action??null;
    $keys=match($action){'status'=>['action','operation_id'],'continue'=>['action','operation_id','checkpoint'],'owner_status','recovery_review'=>['action','recovery_id'],'rollback'=>['action','recovery_id','digest','checkpoint'],default=>[]};
    if(!$keys)$fail('Choose an explicit update operation.');$exact($request,$keys);
    foreach(array_diff($keys,['checkpoint']) as $key)if(!is_string($request->$key))$fail('Update identities must be strings.');
    if(isset($request->digest)&&!preg_match('/^[a-f0-9]{64}$/D',$request->digest))$fail('Use the exact reviewed recovery digest.');
    $value=match($action){
        'owner_status'=>$runtime->ownerStatus($actor,$request->recovery_id),
        'status'=>$runtime->status($actor,(string)($request->operation_id??'')),
        'continue'=>is_int($request->checkpoint??null)&&$request->checkpoint>=0?$runtime->advance($actor,(string)($request->operation_id??''),$request->checkpoint):throw new RuntimeException('Use an exact integer checkpoint.'),
        'recovery_review'=>$runtime->inspectRecovery($actor,(string)($request->recovery_id??'')),
        'rollback'=>is_int($request->checkpoint??null)&&$request->checkpoint>=0?$runtime->rollback($actor,(string)($request->recovery_id??''),(string)($request->digest??''),$request->checkpoint):throw new RuntimeException('Use an exact integer checkpoint.'),
        default=>throw new RuntimeException('Choose update status, continuation or explicit owner recovery.'),
    };
    if($navigation){
        $nonce=base64_encode(random_bytes(18));header('Content-Type: text/html; charset=utf-8');
        header("Content-Security-Policy: default-src 'none'; script-src 'nonce-".$nonce."'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
        $scriptPath=$_SERVER['SCRIPT_NAME']??'/_studio/update-runtime.php';$studioOffset=strpos($scriptPath,'/_studio/');$studioBase=$studioOffset===false?'/_studio/':substr($scriptPath,0,$studioOffset+9);
        $seed=json_encode(['token'=>$session,'state'=>$value,'url'=>$studioBase.'update-runtime.php'],JSON_THROW_ON_ERROR|JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT);
        echo '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>VoxelSite update recovery</title><main><h1>System update</h1><p>Studio is paused while this exact update finishes. Status reads do not advance it.</p><pre id="state"></pre><p id="message" role="status"></p><button id="refresh">Refresh status</button> <button id="continue" hidden>Continue approved update</button> <button id="review">Review original-file recovery</button> <button id="restore" hidden>Restore exact originals</button><pre id="receipt"></pre><a href="'.htmlspecialchars($studioBase,ENT_QUOTES).'">Return to Studio</a></main><script nonce="'.htmlspecialchars($nonce,ENT_QUOTES).'">const seed='.$seed.';';
        echo <<<'UPDATE_JS'
let state=seed.state,receipt=null;
const display=()=>{document.getElementById('state').textContent=JSON.stringify(state.operation,null,2);document.getElementById('continue').hidden=!state.can_continue||!['prepared','applying'].includes(state.operation.status);document.getElementById('review').hidden=!['applying','recovery_required'].includes(state.operation.status);};
const send=async body=>{const response=await fetch(seed.url,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-VS-Token':seed.token},body:JSON.stringify(body)});const result=await response.json();if(!result.ok)throw new Error(result.error?.message||'The request was not acknowledged. Refresh status before continuing.');return result.data;};
const execute=async task=>{for(const button of document.querySelectorAll('button'))button.disabled=true;try{document.getElementById('message').textContent='';await task();display();}catch(error){document.getElementById('message').textContent=error.message;}finally{for(const button of document.querySelectorAll('button'))button.disabled=false;}};
document.getElementById('refresh').onclick=()=>execute(async()=>{state=await send({action:'owner_status',recovery_id:state.recovery_id});});
document.getElementById('continue').onclick=()=>execute(async()=>{state.operation=await send({action:'continue',operation_id:state.operation.operation_id,checkpoint:state.operation.checkpoint});});
document.getElementById('review').onclick=()=>execute(async()=>{receipt=await send({action:'recovery_review',recovery_id:state.recovery_id});document.getElementById('receipt').textContent=JSON.stringify(receipt,null,2);document.getElementById('restore').hidden=!receipt.eligible;if(!receipt.eligible)document.getElementById('message').textContent='This update needs code and database recovery together. File-only rollback is unavailable.';});
document.getElementById('restore').onclick=()=>execute(async()=>{state.operation=await send({action:'rollback',recovery_id:state.recovery_id,digest:receipt.digest,checkpoint:state.operation.checkpoint});if(state.operation.status==='failed_restored')document.getElementById('restore').hidden=true;});
display();
</script></html>
UPDATE_JS;
        return;
    }
    echo json_encode(['ok'=>true,'data'=>$value],JSON_THROW_ON_ERROR);
}catch(Throwable $error){
    $known=$error instanceof VoxelSite\UpdateRuntime\Failure;$code=$known?$error->errorCode:'update_runtime_unavailable';$message=$known?$error->getMessage():'The update request could not be validated. Retained recovery data was preserved.';
    http_response_code($known?($code==='permission_denied'?403:409):$httpStatus);if($httpStatus===401)header('WWW-Authenticate: Bearer realm="VoxelSite Studio update"');
    echo json_encode($rpc?['jsonrpc'=>'2.0','id'=>$rpcId,'error'=>['code'=>$rpcCode,'message'=>$message,'data'=>['code'=>$code]]]:['ok'=>false,'error'=>['code'=>$code,'message'=>$message]],JSON_THROW_ON_ERROR);
}
