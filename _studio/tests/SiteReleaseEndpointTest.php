<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';

// An actual disposable installation, routers, provider HTTP calls and streamed responses.
// No local installation, API keys, current website content or npm is needed to run this test.
$source=dirname(__DIR__,2);
$root=sys_get_temp_dir().'/vs-site-http-'.bin2hex(random_bytes(6));
mkdir($root,0700); $root=realpath($root);
if (!$root || !str_starts_with($root, realpath(sys_get_temp_dir()).'/')) throw new RuntimeException('Canonical disposable root required.');
function copyTree(string $from,string $to): void {
    if (!is_dir($to)) mkdir($to,0755,true);
    foreach (scandir($from) as $name) {
        if ($name==='.' || $name==='..') continue;
        $a=$from.'/'.$name; $b=$to.'/'.$name;
        if (is_link($a)) continue;
        is_dir($a)?copyTree($a,$b):copy($a,$b);
    }
}
function port(): int {
    $socket=stream_socket_server('tcp://127.0.0.1:0',$errno,$errstr);
    $port=(int)substr(strrchr(stream_socket_get_name($socket,false),':'),1); fclose($socket); return $port;
}
function command(array $cmd): string {
    $p=proc_open($cmd,[['pipe','r'],['pipe','w'],['pipe','w']],$pipes); fclose($pipes[0]);
    $out=stream_get_contents($pipes[1]); fclose($pipes[1]); $err=stream_get_contents($pipes[2]); fclose($pipes[2]);
    if(proc_close($p)!==0) throw new RuntimeException($err.$out); return $out;
}
$checks=0;
function check(bool $ok,string $label): void {
    global $checks; if(!$ok) throw new RuntimeException('FAIL '.$label); $checks++; echo 'PASS '.$label."\n";
}
function request(string $method,string $path,?array $body=null,?int $role=1,bool $csrf=true): array {
    global $url,$root;
    if ($body !== null && isset($body['operation_id']) && str_starts_with($path, '/site-control/') && !isset($body['base_draft_version'])) {
        $db = new PDO('sqlite:'.$root.'/_studio/data/studio.db');
        $body['base_draft_version'] = 'draft:'.$db->query('SELECT draft_version FROM site_workspace_state WHERE id=1')->fetchColumn();
    }
    if ($method === 'PUT' && $path === '/files/content' && !isset($body['operation_id'])) {
        $db = new PDO('sqlite:'.$root.'/_studio/data/studio.db');
        $body += ['operation_id'=>'editor_'.bin2hex(random_bytes(16)), 'base_draft_version'=>'draft:'.$db->query('SELECT draft_version FROM site_workspace_state WHERE id=1')->fetchColumn(),
            'expected_content_sha256'=>hash_file('sha256',$root.'/_studio/preview/'.$body['path'])];
    }
    $curl=curl_init($url.'/_studio/api/router.php?_path='.urlencode($path));
    $headers=['Accept: application/json'];
    if($role!==null) { $headers[]='Cookie: vs_session='.str_repeat((string)$role,64); if($csrf)$headers[]='X-VS-Token: '.str_repeat((string)$role,64); }
    if($body!==null)$headers[]='Content-Type: application/json';
    curl_setopt_array($curl,[CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_HTTPHEADER=>$headers,CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>20]);
    if($body!==null)curl_setopt($curl,CURLOPT_POSTFIELDS,json_encode($body));
    $raw=curl_exec($curl); $status=curl_getinfo($curl,CURLINFO_HTTP_CODE); $error=curl_error($curl); unset($curl);
    if($raw===false)throw new RuntimeException($error);
    file_put_contents($root.'/http-transcript.jsonl',json_encode(compact('method','path','body','role','status','raw'))."\n",FILE_APPEND);
    $events=[]; foreach(explode("\n",$raw) as $line) { if(str_starts_with($line,'data: '))$events[]=json_decode(substr($line,6),true); }
    if ($status === 202 && isset($body['operation_id']) && ($json = json_decode($raw,true)['data']['operation'] ?? null)) {
        $body['checkpoint'] = $json['checkpoint'];
        return request($method, $path, $body, $role, $csrf);
    }
    return ['status'=>$status,'raw'=>$raw,'json'=>json_decode($raw,true),'events'=>$events,'terminal'=>$events?end($events):null];
}
\VoxelSite\Tests\StudioRuntimeFixture::copy($root,$source);
copyTree($source.'/_studio/ui',$root.'/_studio/ui');
foreach(['_studio/preview/_partials','_studio/preview/services','assets/css','assets/js','assets/data'] as $path)mkdir($root.'/'.$path,0755,true);
copy($source.'/_studio/index.php',$root.'/_studio/index.php');
copy(__DIR__.'/helpers/site-release-provider.php',$root.'/provider.php');
$providerPort=port(); $httpPort=port(); $url='http://127.0.0.1:'.$httpPort;
$provider=proc_open([PHP_BINARY,'-S','127.0.0.1:'.$providerPort,$root.'/provider.php'],[['pipe','r'],['file',$root.'/provider.log','a'],['file',$root.'/provider.log','a']],$pipes,$root); fclose($pipes[0]);
echo command([PHP_BINARY,__DIR__.'/helpers/setup-site-release.php',$root,'http://127.0.0.1:'.$providerPort.'/v1',$url]);
file_put_contents($root.'/http-router.php', '<?php $p=parse_url($_SERVER["REQUEST_URI"],PHP_URL_PATH); if($p==="/_studio/"){require __DIR__."/_studio/index.php";return true;} if(str_starts_with($p,"/_studio/api/")){require __DIR__."/_studio/api/router.php";return true;} return false;');
$server=proc_open([PHP_BINARY,'-S','127.0.0.1:'.$httpPort,'-t',$root,$root.'/http-router.php'],[['pipe','r'],['file',$root.'/http.log','a'],['file',$root.'/http.log','a']],$pipes,$root); fclose($pipes[0]);
try {
    for($i=0;$i<50;$i++){ $c=@fsockopen('127.0.0.1',$httpPort,$e,$s,.1); if($c){fclose($c);break;} usleep(20000); }
    check(request('GET','/site-graph',null,null)['status']===401,'Graph requires a backend session');
    check(request('GET','/site-graph',null,3)['status']===403,'Viewer cannot access Site graph');
    foreach(['/site-control/orchestrate','/site-control/apply','/site-control/page-delete'] as $path) {
        check(request('POST',$path,[],3)['status']===403,$path.' denies viewer writes');
        check(request('POST',$path,[],1,false)['status']===403,$path.' requires CSRF token');
    }
    check(request('POST','/site-control/apply',['edits'=>[['file'=>'about.php','anchored'=>true]]])['status']===400,'Raw browser-supplied edits cannot bypass review');
    $graph=request('GET','/site-graph'); check($graph['status']===200,'Owner inspects actual file-backed graph');
    $planResponse=request('POST','/site-control/orchestrate',['prompt'=>'Update the shared footer copy.']);
    $done=$planResponse['terminal'];
    check(($done['type']??'')==='done' && isset($done['plan']['plan_id']),'Request to real provider adapter produces a retained reviewed plan');
    $planId=$done['plan']['plan_id'];
    check(count($done['discovery']['affected_pages'])===4,'Shared footer review discloses all four flat/nested pages');
    check(str_contains(file_get_contents($root.'/_studio/preview/_partials/footer.php'),'Original'),'Planning makes no website writes');
    check(request('GET','/site-control/plans/'.$planId,null,2)['status']===404,'Review identity is bound to the requesting user');
    $apply=request('POST','/site-control/apply',['plan_id'=>$planId]);
    check(($apply['terminal']['type']??'')==='done' && ($apply['terminal']['filesChanged']??0)===1,'Reviewed plan applies via real SSE endpoint');
    check(str_contains(file_get_contents($root.'/_studio/preview/_partials/footer.php'),'Reviewed shared footer'),'Actual shared file contains exactly the approved replacement');
    $beforeRetry=hash_file('sha256',$root.'/_studio/preview/_partials/footer.php');
    $retry=request('POST','/site-control/apply',['plan_id'=>$planId]);
    check(($retry['terminal']['type']??'')==='done' && hash_file('sha256',$root.'/_studio/preview/_partials/footer.php')===$beforeRetry,'Retry replays terminal outcome without reapplying');
    check(request('GET','/site-control/plans/'.$planId)['json']['data']['status']==='applied','Reconnect can read durable terminal result');
    $curl=curl_init($url.'/_studio/api/router.php?_path=%2Fpreview&path=services%2Fteam.php');
    curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_HTTPHEADER=>['Cookie: vs_session='.str_repeat('1',64)]]);
    $html=curl_exec($curl);unset($curl);
    check(str_contains($html,'Reviewed shared footer') && str_contains($html,'<!DOCTYPE html>'),'Authenticated nested preview renders the reviewed shared partial');
    check(str_contains(file_get_contents($root.'/index.php'),'Published original'),'Site PHP writes leave published pages unchanged');
    check(str_contains(file_get_contents($root.'/_studio/preview/assets/css/tailwind.css'),'.p-7'),'Required PHP Tailwind output exists in private draft assets');
    $files=request('GET','/files'); check($files['status']===200 && str_contains($files['raw'],'services/team.php'),'Editor lists nested files after apply');
    file_put_contents($root.'/_studio/preview/_partials/footer.php','</main><footer>Original shared footer</footer></body></html>');
    $fresh=request('POST','/site-control/orchestrate',['prompt'=>'Update the shared footer copy.']); $freshId=$fresh['terminal']['plan']['plan_id'];
    file_put_contents($root.'/_studio/preview/about.php',"\n<!-- later edit -->",FILE_APPEND);
    check(request('POST','/site-control/apply',['plan_id'=>$freshId])['status']===409,'Changes outside reviewed anchor invalidate the whole review');
    file_put_contents($root.'/.demo','true');
    foreach(['/site-control/orchestrate','/site-control/apply','/site-control/page-rename','/site-control/structural-move','/site-control/page-delete'] as $path) {
        check(request('POST',$path,['plan_id'=>$freshId])['status']===403,$path.' is blocked by backend demo guard');
    }
    unlink($root.'/.demo');
    $pdo=new PDO('sqlite:'.$root.'/_studio/data/studio.db');
    check((int)$pdo->query('SELECT COUNT(*) FROM revisions')->fetchColumn()===1,'Apply records one shared revision despite retry');
    check((int)$pdo->query('SELECT COUNT(*) FROM snapshots')->fetchColumn()===1,'Recovery snapshot is retained in existing Snapshots');

    $beforeCrash=file_get_contents($root.'/_studio/preview/_partials/footer.php');
    $cssBeforeCrash=file_get_contents($root.'/_studio/preview/assets/css/tailwind.css');
    $worker=proc_open([PHP_BINARY,__DIR__.'/helpers/site-release-worker.php',$root],
        [['pipe','r'],['pipe','w'],['file',$root.'/crash-worker.log','a']],$crashPipes);fclose($crashPipes[0]);
    stream_set_timeout($crashPipes[1],10);
    $written=json_decode(fgets($crashPipes[1]) ?: '{}',true);
    check(($written['phase']??'')==='compiled','Controlled worker reached real writes and Tailwind compilation');
    $crashId=$written['id'];
    check(request('GET','/site-control/plans/'.$crashId)['json']['data']['status']==='applying','Reconnect recognizes a worker still holding the mutation lock');
    check(request('PUT','/files/content',['path'=>'about.php','content'=>'should not write'])['status']===409,'Editor writes cannot overlap Site apply');
    check(str_contains(file_get_contents($root.'/_studio/preview/_partials/footer.php'),'Interrupted footer'),'Interrupted request really changed website bytes before process termination');
    proc_terminate($worker,9);fclose($crashPipes[1]);proc_close($worker);
    file_put_contents($root.'/.demo','true');
    check(request('GET','/site-control/plans/'.$crashId)['json']['data']['status']==='applying'
        && str_contains(file_get_contents($root.'/_studio/preview/_partials/footer.php'),'Interrupted footer'),
        'Demo GET recovery never writes website files even for a real owner');
    unlink($root.'/.demo');
    $recovery=request('GET','/site-control/plans/'.$crashId)['json']['data'];
    check($recovery['status']==='failed' && $recovery['result']['rollback_clean']===true,
        'After process kill the backend confirms verified restoration');
    check(file_get_contents($root.'/_studio/preview/_partials/footer.php')===$beforeCrash
        && file_get_contents($root.'/_studio/preview/assets/css/tailwind.css')===$cssBeforeCrash,'Killed apply restores exact source and compiled CSS');
    check(request('POST','/site-control/apply',['plan_id'=>$crashId])['terminal']['type']==='error',
        'Retry after interrupted restoration returns the same failed result without writes');

    $mutationId=bin2hex(random_bytes(16));
    $renameBody=['operation_id'=>$mutationId,'base_draft_version'=>'draft:'.$pdo->query('SELECT draft_version FROM site_workspace_state WHERE id=1')->fetchColumn(),'pageId'=>'page:about.php','newTitle'=>'Our story'];
    $rename=request('POST','/site-control/page-rename',$renameBody);
    check($rename['status']===200 && $rename['json']['ok']===true,'Real router records deterministic page rename');
    $snapshotCount=(int)$pdo->query('SELECT COUNT(*) FROM snapshots')->fetchColumn();
    $renameRetry=request('POST','/site-control/page-rename',$renameBody);
    check($renameRetry['json']===$rename['json'] && (int)$pdo->query('SELECT COUNT(*) FROM snapshots')->fetchColumn()===$snapshotCount,
        'Deterministic retry replays its response without another snapshot or mutation');
    check(request('POST','/site-control/page-rename',array_replace($renameBody,['newTitle'=>'Different']))['status']===409,
        'Mutation identity cannot authorize a different request');
    check(json_decode(command([PHP_BINARY,__DIR__.'/helpers/read-site-operation.php',$root,$mutationId,'1']),true)['state']==='succeeded',
        'Disconnected deterministic requests have retained outcomes');
    check(request('POST','/site-control/page-rename',$renameBody,2)['status']===409, 'Another user cannot reconnect to the reviewed deterministic request over HTTP');
    check(json_decode(command([PHP_BINARY,__DIR__.'/helpers/read-site-operation.php',$root,$mutationId,'2']),true)['error']==='permission_denied','Retained deterministic result is bound to its user');
    $urlChange=request('POST','/site-control/url-rename',['operation_id'=>bin2hex(random_bytes(16)),
        'routeId'=>'route:/services/team','newPath'=>'/services/people']);
    check($urlChange['status']===200 && is_file($root.'/_studio/preview/services/people.php')
        && !is_file($root.'/_studio/preview/services/team.php'),'Real router applies a nested URL change without changing its parent');
    $move=request('POST','/site-control/structural-move',['operation_id'=>bin2hex(random_bytes(16)),
        'pageId'=>'page:about.php','targetParent'=>'services','targetIndex'=>0]);
    check($move['status']===200 && is_file($root.'/_studio/preview/services/about.php'),'Real router moves an existing page and navigation together');
    $delete=request('POST','/site-control/page-delete',['operation_id'=>bin2hex(random_bytes(16)),
        'pageId'=>'page:services/people.php']);
    check($delete['status']===200 && !is_file($root.'/_studio/preview/services/people.php'),'Real router deletes the selected nested page');
    check(!str_contains(file_get_contents($root.'/_studio/preview/_partials/nav.php'),'/services/people'),
        'Delete removes the real navigation reference');
    check(request('GET','/site-graph')['json']['data']['summary']['pages']===3,'Graph refresh matches post-mutation filesystem');
    $missingId=bin2hex(random_bytes(16));
    $missing=request('GET','/site-control/mutations/'.$missingId)['json']['data'];
    check($missing['status']==='failed' && $missing['response']['error']['code']==='mutation_not_started',
        'Offline-before-acceptance recovery safely closes the missing request');
    $beforeLate=file_get_contents($root.'/_studio/preview/services/about.php');
    check(request('POST','/site-control/page-rename',['mutation_id'=>$missingId,'pageId'=>'page:services/about.php','newTitle'=>'Late request'])['status']===422
        && file_get_contents($root.'/_studio/preview/services/about.php')===$beforeLate,
        'A delayed original request cannot execute after missing-request recovery');

    // A recorded incomplete recovery must block real router writes until explicit restore.
    $failedRecord=$pdo->query("SELECT result_json FROM site_control_plans WHERE id = '".$crashId."'")->fetchColumn();
    $failedResult=json_decode($failedRecord,true);$failedResult['rollback_clean']=false;
    $update=$pdo->prepare('UPDATE site_control_plans SET result_json = ? WHERE id = ?');$update->execute([json_encode($failedResult),$crashId]);
    check(request('POST','/site-control/page-rename',['operation_id'=>bin2hex(random_bytes(16)),
        'pageId'=>'page:services/about.php','newTitle'=>'Unsafe follow-up'])['status']===409
        && file_get_contents($root.'/_studio/preview/services/about.php')===$beforeLate,
        'The real router blocks further writes while earlier recovery is incomplete');
    $restorePath='/snapshots/'.$failedResult['recovery_snapshot_id'];
    $review=request('POST',$restorePath.'/prepare-restore',['request_id'=>'restore_'.bin2hex(random_bytes(16)),'domain'=>'draft']);
    check($review['status']===200,'Explicit draft restoration is reviewed through the recovery block');
    $restore=request('POST',$restorePath.'/restore',['operation_id'=>'restore_'.bin2hex(random_bytes(16)),
        'plan_id'=>$review['json']['data']['plan_id'],'digest'=>$review['json']['data']['digest']]);
    check($restore['status']===200 && $restore['json']['ok']===true,'Explicit verified Snapshot restore remains available through the recovery block');
    check(request('POST','/site-control/page-rename',['operation_id'=>bin2hex(random_bytes(16)),
        'pageId'=>'page:about.php','newTitle'=>'After recovery'])['status']===200,
        'Verified explicit recovery permits later website edits');
    echo "$checks HTTP checks passed. Fixture: $root\nURL: $url/_studio/#/site-map\n";
    if(in_array('--serve',$argv,true)) { file_put_contents('/tmp/voxelsite-release-browser.json',json_encode(compact('root','url'))); echo "Serving for browser checks.\n"; while(!file_exists($root.'/stop-serving'))sleep(1); }
} finally { proc_terminate($server);proc_close($server);proc_terminate($provider);proc_close($provider); }
