<?php
declare(strict_types=1);
// Configure only as external auto_prepend_file on the isolated qualification FPM pool.
$nativeRoot=realpath(getenv('VS_NATIVE_ROOT')?:'');
if(!$nativeRoot||!str_starts_with($nativeRoot,realpath(sys_get_temp_dir()).'/vs-native-mcp-')||!is_file($nativeRoot.'/.native-mcp-fixture'))throw new RuntimeException('Native transport fixture marker required.');
$nativeFixture=json_decode(file_get_contents($nativeRoot.'/fixture.json'),true,32,JSON_THROW_ON_ERROR);
$GLOBALS['lifecycle_provider_attempts']=0;$GLOBALS['distribution_privacy_base']=$nativeFixture['base_url'];
require __DIR__.'/distribution-provider-trap.php';
$nativePath=parse_url($_SERVER['REQUEST_URI']??'',PHP_URL_PATH);
$nativeMcp=str_ends_with((string)$nativePath,'/_studio/mcp.php');$nativeRpc=$nativeMcp?json_decode(file_get_contents('php://input'),true):null;
if($nativeMcp)ob_start();
register_shutdown_function(static function()use($nativeRoot,$nativePath,$nativeMcp,$nativeRpc):void{
    $entry=['time'=>gmdate('c'),'method'=>$_SERVER['REQUEST_METHOD']??'','path'=>$nativePath,'status'=>http_response_code()?:200,
        'protocol_header'=>$_SERVER['HTTP_MCP_PROTOCOL_VERSION']??null,'provider_attempts'=>$GLOBALS['lifecycle_provider_attempts']??0,
        'privacy_probe_requests'=>$GLOBALS['distribution_privacy_requests']??0];
    if($nativeMcp){$body=ob_get_contents();$entry['request']=$nativeRpc;$entry['response']=is_string($body)?json_decode($body,true):null;
        $entry['response_bytes']=is_string($body)?strlen($body):0;if($entry['response']===null&&$body!=='')$entry['response_unparsed_sha256']=hash('sha256',$body);}
    $path=$nativeRoot.'/http-private.ndjson';file_put_contents($path,json_encode($entry,JSON_THROW_ON_ERROR|JSON_UNESCAPED_SLASHES)."\n",FILE_APPEND|LOCK_EX);chmod($path,0600);
});
