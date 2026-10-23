<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';
require_once __DIR__ . '/helpers/DisposableStudioHttp.php';

require __DIR__.'/McpUpdateTest.php';
require __DIR__.'/fixtures/mcp/ServiceFixture.php';
file_put_contents($root.'/.update-routes','disposable');
\VoxelSite\Tests\StudioRuntimeFixture::copy($root.'/live');
file_put_contents($root.'/live/_studio/data/config.json',json_encode(['app_key'=>base64_encode(str_repeat('a',32))]));
$db->insert('sessions',['id'=>str_repeat('f',64),'user_id'=>1,'created_at'=>now(),'expires_at'=>gmdate('Y-m-d\TH:i:s\Z',time()+3600),'ip_address'=>'127.0.0.1','user_agent'=>'Update routes fixture']);
function updateRoute(string $method,string $path,array $body=[],array $query=[],?string $csrf=null):array {
    global $root;$process=proc_open([PHP_BINARY,__DIR__.'/helpers/call-update-route.php',$root],[['pipe','r'],['pipe','w'],['pipe','w']],$pipes);
    fwrite($pipes[0],json_encode(compact('method','path','body','query','csrf')));fclose($pipes[0]);$out=stream_get_contents($pipes[1]);$error=stream_get_contents($pipes[2]);fclose($pipes[1]);fclose($pipes[2]);$code=proc_close($process);if($code!==0)throw new RuntimeException($error.$out);return json_decode($out,true,64,JSON_THROW_ON_ERROR);
}
$inspect=updateRoute('GET','/update/inspect');upCheck($inspect['status']===200&&$inspect['body']['data']['runtime_supported'],'Copied Studio route uses the shared update host inspector');
upCheck(updateRoute('GET','/update/git-status')['body']['data']===$inspect['body']['data'],'Existing Git status route is a bounded local capability inspection');
mkdir($root.'/live/dist',0700);$zip=upZip(['VERSION'=>'1.35.0','_studio/engine/bootstrap.php'=>file_get_contents(dirname(__DIR__).'/engine/bootstrap.php'),'_studio/mcp.php'=>file_get_contents(dirname(__DIR__).'/mcp.php')]);copy($zip->filename,$root.'/live/dist/review.zip');$zip->close();
$list=updateRoute('GET','/update/dist-packages');upCheck($list['body']['data']['packages'][0]['filename']==='review.zip','Existing distribution route lists bounded validated packages');
upCheck(updateRoute('POST','/update/apply-local',['filename'=>'review.zip'])['status']===409,'Legacy package apply without stable identity cannot overwrite system files');
$stageInput=['filename'=>'review.zip','request_id'=>'studio-package-route'];$staged=updateRoute('POST','/update/apply-local',$stageInput);upCheck($staged['status']===200&&$staged['body']['data']['status']==='extracting'&&trim(file_get_contents($root.'/live/VERSION'))==='1.34.0','Legacy apply-local now only retains the exact package for review');
upCheck(updateRoute('POST','/update/apply-local',$stageInput)['body']===$staged['body'],'Copied staging route replays the original request');$pkg=$staged['body']['data'];
$done=updateRoute('POST','/update/package-finish',['package_id'=>$pkg['package_id'],'expected_index'=>0]);upCheck($done['status']===200&&$done['body']['data']['status']==='staged','Copied package validation route returns its explicit checkpoint');
$http=new \VoxelSite\Tests\DisposableStudioHttp($root.'/live',['upload_max_filesize'=>'2M','post_max_size'=>'4M']);
try{
    $request=static fn(string $path,array $body,bool $multipart=false,bool $csrf=true)=>$http->request('POST',$path,$body,[],$csrf,$multipart,str_repeat('f',64));
    $upload=['request_id'=>'studio-http-upload','update_zip'=>new CURLFile($root.'/live/dist/review.zip','application/zip','review.zip')];
    upCheck($request('/update/upload',$upload,true,false)['status']===403,'Actual multipart staging requires owner CSRF');
    $uploaded=$request('/update/upload',$upload,true);
    upCheck($uploaded['status']===200&&$uploaded['body']['data']['status']==='extracting','Actual multipart upload passes PHP is_uploaded_file validation and stages privately');
    upCheck($request('/update/upload',$upload,true)['body']===$uploaded['body'],'Actual multipart retry retains one package identity');
    file_put_contents($root.'/invalid.zip','not an archive');
    $invalid=$request('/update/upload',['request_id'=>'studio-http-invalid','update_zip'=>new CURLFile($root.'/invalid.zip','application/zip','invalid.zip')],true);
    if($invalid['status']===200)$invalid=$request('/update/package-finish',['package_id'=>$invalid['body']['data']['package_id'],'expected_index'=>0]);
    upCheck($invalid['status']===409&&$invalid['body']['error']['code']==='invalid_package','Actual uploaded invalid archive is refused before candidate activation');
    file_put_contents($root.'/oversized.zip',str_repeat('x',3*1024*1024));
    upCheck($request('/update/upload',['request_id'=>'studio-http-oversized','update_zip'=>new CURLFile($root.'/oversized.zip','application/zip','oversized.zip')],true)['status']===409,'Actual multipart route handles the host upload limit without accepting partial bytes');
    $unsupported=$request('/update/git-update',['request_id'=>'studio-http-no-git']);
    upCheck($unsupported['status']===409&&$unsupported['body']['error']['code']==='host_capability_unavailable','Actual Git route explicitly refuses a non-Git installation');
    $git=static function(string $directory,array $arguments):string{
        $process=proc_open(array_merge(['git','-C',$directory],$arguments),[['pipe','r'],['pipe','w'],['pipe','w']],$pipes,$directory);
        fclose($pipes[0]);$out=stream_get_contents($pipes[1]);$err=stream_get_contents($pipes[2]);fclose($pipes[1]);fclose($pipes[2]);
        if(proc_close($process)!==0)throw new RuntimeException('Disposable Git setup failed: '.$err);return trim($out);
    };
    $git($root.'/live',['init','-b','main']);$git($root.'/live',['config','user.name','Fixture']);$git($root.'/live',['config','user.email','fixture@example.invalid']);
    $git($root.'/live',['add','VERSION']);$git($root.'/live',['commit','-m','Fixture initial version']);
    $head=$git($root.'/live',['rev-parse','HEAD']);$git($root,['clone','--bare',$root.'/live',$root.'/remote.git']);
    $git($root.'/live',['remote','add','origin',$root.'/remote.git']);$git($root.'/live',['fetch','origin']);$git($root.'/live',['branch','--set-upstream-to=origin/main']);
    $git($root,['clone',$root.'/remote.git',$root.'/upstream-writer']);$git($root.'/upstream-writer',['config','user.name','Fixture']);$git($root.'/upstream-writer',['config','user.email','fixture@example.invalid']);
    file_put_contents($root.'/upstream-writer/VERSION',"1.36.0\n");mkdir($root.'/upstream-writer/vendor',0700);file_put_contents($root.'/upstream-writer/vendor/route-fixture.php','<?php return 1;');
    $git($root.'/upstream-writer',['add','VERSION','vendor/route-fixture.php']);$git($root.'/upstream-writer',['commit','-m','Fixture next version']);$git($root.'/upstream-writer',['push','origin','main']);
    $stagedGit=$request('/update/git-update',['request_id'=>'studio-http-git-stage']);
    upCheck($stagedGit['status']===200&&$stagedGit['body']['data']['status']==='extracting','Actual Git route stages an exact local upstream commit');
    upCheck($request('/update/git-update',['request_id'=>'studio-http-git-stage'])['body']===$stagedGit['body'],'Actual Git staging replay retains the same exact candidate');
    upCheck($git($root.'/live',['rev-parse','HEAD'])===$head&&trim(file_get_contents($root.'/live/VERSION'))==='1.34.0'
        &&!is_file($root.'/live/vendor/route-fixture.php'),'Actual ZIP and Git staging never reset the checkout or activate candidate PHP');
}finally{$http->close();}
$input=['package_id'=>$pkg['package_id'],'operation_id'=>'studio-update-route'];$review=updateRoute('POST','/update/prepare',$input);if($review['status']!==200)fwrite(STDERR,json_encode($review)."\n");upCheck($review['status']===200&&$review['body']['data']['status']==='pending','Studio prepares the same exact owner review as MCP');$plan=$review['body']['data'];$exact=['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest']];
upCheck(updateRoute('POST','/update/apply',$exact)['status']===409,'Unapproved Studio package cannot execute');
upCheck(updateRoute('POST','/update/approve',$exact,[],str_repeat('0',64))['status']===403,'Owner approval route requires the current session CSRF token');
$approved=updateRoute('POST','/update/approve',$exact);upCheck($approved['status']===200&&$approved['body']['data']['status']==='approved','Owner click approves the concrete retained digest');
$applied=updateRoute('POST','/update/apply',$exact);upCheck($applied['status']===200&&$applied['body']['data']['status']==='applying'&&is_file($packages->root().'/active.json'),'Studio activation returns bounded operation metadata and opens the native continuation gate');
echo "\n{$checks} combined update route checks passed\n";
