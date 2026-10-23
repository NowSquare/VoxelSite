<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';

$checks=0;$failures=0;
function sdCheck(bool $ok,string $label):void {global $checks,$failures;$checks++;if(!$ok)$failures++;echo ($ok?'PASS ':'FAIL ').$label."\n";}
$root=sys_get_temp_dir().'/vs-studio-subdir-'.bin2hex(random_bytes(8));mkdir($root,0700);$root=realpath($root);file_put_contents($root.'/.studio-subdirectory-test','fixture');
$assets=['ui/favicon.ico','ui/fonts/inter/inter.css','ui/dist/studio.css','ui/lib/marked.min.js','ui/lib/prism.min.js','ui/dist/studio.js'];
foreach(['','/tenant','/tenant&review'] as $prefix) {
    $project=$root.$prefix;
    if (!is_dir($project)) mkdir($project,0700,true);
    \VoxelSite\Tests\StudioRuntimeFixture::copy($project);
    foreach($assets as $file){$target=$project.'/_studio/'.$file;if(!is_dir(dirname($target)))mkdir(dirname($target),0700,true);file_put_contents($target,'fixture asset '.$file);}
    mkdir($project.'/_data',0700);
}
copy(__DIR__.'/helpers/studio-subdirectory-router.php',$root.'/router.php');
$socket=stream_socket_server('tcp://127.0.0.1:0',$errno,$error);
if(!$socket)throw new RuntimeException('Local fixture listener unavailable: '.$error);
$address=stream_socket_get_name($socket,false);$port=(int)substr(strrchr($address,':'),1);fclose($socket);
$log=$root.'/http.log';$process=proc_open([PHP_BINARY,'-S','127.0.0.1:'.$port,'-t',$root,$root.'/router.php'],[0=>['pipe','r'],1=>['file',$log,'a'],2=>['file',$log,'a']],$pipes,$root);
if(!is_resource($process))throw new RuntimeException('Cannot start disposable HTTP server.');fclose($pipes[0]);
$deadline=microtime(true)+5;
do {$ready=@fsockopen('127.0.0.1',$port,$errno,$error,0.1);if($ready){fclose($ready);break;}usleep(20000);}while(microtime(true)<$deadline);
if(!$ready){proc_terminate($process);proc_close($process);throw new RuntimeException('Fixture server did not start: '.file_get_contents($log));}
function sdHttp(CurlHandle $curl,string $path,?array $body=null,array $headers=[]):array {
    global $port;$received=[];
    curl_setopt_array($curl,[CURLOPT_URL=>'http://127.0.0.1:'.$port.$path,CURLOPT_RETURNTRANSFER=>true,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_TIMEOUT=>5,CURLOPT_HEADERFUNCTION=>static function($curl,string $line)use(&$received):int{$received[]=trim($line);return strlen($line);},CURLOPT_HTTPHEADER=>array_merge(['Content-Type: application/json'],$headers),CURLOPT_CUSTOMREQUEST=>$body===null?'GET':'POST',CURLOPT_POSTFIELDS=>$body===null?null:json_encode($body)]);
    $response=curl_exec($curl);if($response===false)throw new RuntimeException(curl_error($curl));
    return ['status'=>curl_getinfo($curl,CURLINFO_HTTP_CODE),'body'=>$response,'headers'=>implode("\n",$received)];
}
try {
    foreach(['','/tenant','/tenant&review'] as $prefix) {
        $base=$prefix.'/_studio';$label=$prefix?:'root';$curl=curl_init();curl_setopt($curl,CURLOPT_COOKIEFILE,'');
        $response=sdHttp($curl,$base.'/index.php');
        sdCheck($response['status']===302&&str_contains($response['headers'],'Location: '.$base.'/install.php'),$label.': uninstalled shell redirects within its installation');
        file_put_contents($root.$prefix.'/.demo','');
        $response=sdHttp($curl,$base.'/index.php');
        sdCheck($response['status']===200&&str_contains($response['body'],'data-demo="true"'),$label.': real Studio shell works without an installed database');
        preg_match_all('~(?:href|src)="([^"]+/ui/[^"]+)"~',$response['body'],$matches);
        sdCheck(count($matches[1])===count($assets),$label.': shell includes all six local assets');
        foreach($matches[1] as $url) {
            $url=html_entity_decode($url,ENT_QUOTES,'UTF-8');$asset=sdHttp($curl,$url);
            sdCheck(str_starts_with($url,$base.'/ui/')&&$asset['status']===200&&str_starts_with($asset['body'],'fixture asset '),$label.': shell asset resolves '.$url);
        }
        if(str_contains($prefix,'&'))sdCheck(str_contains($response['body'],'/tenant&amp;review/_studio/ui/')&&!str_contains($response['body'],'="/tenant&review/'),$label.': base path is escaped in HTML attributes');
        $response=sdHttp($curl,$base.'/_cookie.php?command=set');
        sdCheck(str_contains($response['headers'],'path='.$base.'/')&&stripos($response['headers'],'HttpOnly')!==false&&stripos($response['headers'],'SameSite=Lax')!==false,$label.': Auth session cookie keeps its security attributes and installation path');
        sdCheck(json_decode(sdHttp($curl,$base.'/_cookie.php')['body'],true)['cookie']===str_repeat('a',64),$label.': browser sends Auth cookie to this installation');
        $other=$prefix===''?'/tenant/_studio':'/_studio';
        sdCheck(json_decode(sdHttp($curl,$other.'/_cookie.php')['body'],true)['cookie']===null,$label.': Auth cookie is isolated from another installation');
        $response=sdHttp($curl,$base.'/_cookie.php?command=clear');
        sdCheck(str_contains($response['headers'],'path='.$base.'/')&&str_contains($response['headers'],'Max-Age=0'),$label.': Auth clears the same cookie path');
        sdCheck(json_decode(sdHttp($curl,$base.'/_cookie.php')['body'],true)['cookie']===null,$label.': cleared Auth cookie is no longer sent');
        $reset=json_decode(sdHttp($curl,$base.'/_cookie.php?command=reset-email')['body'],true);
        sdCheck(($reset['result']['ok']??false)&&str_contains($reset['email']??'','http://127.0.0.1:'.$port.$base.'/?reset='),$label.': password reset email links to this installation without SMTP');
        $demo=['email'=>'demo@example.com','password'=>'welcome3210'];
        $response=sdHttp($curl,$base.'/api/router.php?_path=%2Fauth%2Flogin',$demo);$token=json_decode($response['body'],true)['data']['token']??'';
        sdCheck($response['status']===200&&strlen($token)===64&&str_contains($response['headers'],'path='.$base.'/'),$label.': demo login cookie uses this installation');
        $response=sdHttp($curl,$base.'/api/router.php?_path=%2Fauth%2Flogout',[],['X-VS-Token: '.$token]);
        sdCheck($response['status']===200&&str_contains($response['headers'],'path='.$base.'/')&&str_contains($response['headers'],'Max-Age=0'),$label.': demo logout receives and clears its nested cookie');
        $response=sdHttp($curl,$base.'/api/auth/login',$demo);
        sdCheck($response['status']===200&&strlen(json_decode($response['body'],true)['data']['token']??'')===64,$label.': rewritten API route resolves its installation prefix');
        unset($curl);
        sdCheck(!file_exists($root.$prefix.'/_studio/data/studio.db')&&!file_exists($root.$prefix.'/_studio/data/config.json'),$label.': no installed database or configuration was created');
    }
} finally {proc_terminate($process);proc_close($process);}
echo "\n{$checks} checks, {$failures} failures\nHTTP log: {$log}\n";exit($failures?1:0);
