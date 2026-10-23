<?php
declare(strict_types=1);
namespace VoxelSite { function loadConfig(): array { return $GLOBALS['router_workspace_config']; } }
namespace {
require dirname(__DIR__) . '/engine/bootstrap.php';
require __DIR__ . '/helpers/SiteControlFixture.php';
require __DIR__ . '/helpers/RouterHeadingFixture.php';
use VoxelSite\{AICallLedger, AIRouter, Encryption, PromptEngine, RouterHeading, RouterPendingHeading, RouterShadow, Settings, TypeSafeClientInterface};

$GLOBALS['router_workspace_config']=['app_key'=>Encryption::generateKey()];
if (($argv[1] ?? '') === '--shutdown-child') {
    $shutdownRoot=$argv[2]??'';
    if (!is_file($shutdownRoot.'/.shutdown-fixture') || !str_starts_with(realpath($shutdownRoot)?:'',realpath(sys_get_temp_dir()).'/')) {
        throw new RuntimeException('Disposable shutdown fixture required');
    }
    [$defaultDb,$defaultFiles]=createSiteControlFixture($shutdownRoot.'/default');
    $defaultEnvironment=[];
    foreach (['VS_TEST_PREVIEW_DIR','VS_TEST_ASSETS_DIR','VS_TEST_DOC_ROOT','VS_TEST_WORKSPACE_STATE_DIR',
        'VS_TEST_MUTATION_LOCK','VS_TEST_SNAPSHOT_DIR','VS_TEST_REVISIONS_DIR'] as $key) $defaultEnvironment[$key]=getenv($key);
    [$injectedDb,$injectedFiles]=createSiteControlFixture($shutdownRoot.'/injected');
    $jobData=['user_id'=>1,'action_type'=>'free_prompt','user_prompt'=>'Add a script',
        'ai_provider'=>'fake','ai_model'=>'fixture','status'=>'streaming','created_at'=>now()];
    $defaultJob=$defaultDb->insert('prompt_log',$jobData);
    $injectedJob=$injectedDb->insert('prompt_log',$jobData);
    if ($defaultJob!==$injectedJob) throw new RuntimeException('The decoy must contain the same prompt ID');
    unlink($defaultFiles->workspace()->resolveDraft('assets/css/style.css'));
    unlink($injectedFiles->workspace()->resolveDraft('assets/css/style.css'));
    file_put_contents($injectedFiles->workspace()->resolveDraft('index.php'),'<main class="p-7">Injected shutdown source</main>');
    file_put_contents($shutdownRoot.'/before.json',json_encode([
        'default'=>siteControlState($shutdownRoot.'/default/studio.db'),
        'injected'=>siteControlState($shutdownRoot.'/injected/studio.db'),'job_id'=>$injectedJob,
    ],JSON_THROW_ON_ERROR));
    foreach ($defaultEnvironment as $key=>$value) putenv($key.'='.$value);
    (new ReflectionProperty(VoxelSite\Database::class,'instance'))->setValue(null,$defaultDb);
    $injectedSettings=new Settings($injectedDb);$injectedSettings->set('governor.mode','off');
    $provider=new VoxelSite\Tests\HeadingFakeProvider("<file path=\"assets/js/shutdown.js\" action=\"write\">\nconst shutdownFixture = true;\n</file>\n<message>Still streaming");
    $provider->duringChunk=static function()use($injectedFiles,$shutdownRoot):void {
        if (str_contains($injectedFiles->readFile('assets/js/shutdown.js')??'','shutdownFixture')) {
            file_put_contents($shutdownRoot.'/terminated-during-stream','progressive script write completed');
            // exit runs registered PHP shutdown handlers without normal stream completion.
            exit(73);
        }
    };
    (new PromptEngine($injectedDb,$injectedSettings,$provider,fileManager:$injectedFiles))->execute([
        'user_id'=>1,'user_prompt'=>'Add a script','action_type'=>'free_prompt','page_scope'=>'index',
        'headless'=>true,'prompt_log_id'=>$injectedJob,
    ]);
    exit(74); // The fixture must terminate inside the provider, not return normally.
}
$root=sys_get_temp_dir().'/vs-router-workspace-'.bin2hex(random_bytes(8));
[$db,$files]=createSiteControlFixture($root);$root=realpath($root); $settings=new Settings($db);
$settings->setMany(['governor.mode'=>'enforce','governor.typesafe_api_key'=>(new Encryption($GLOBALS['router_workspace_config']['app_key']))->encrypt('fixture-router-key')]);
$checks=0;$failures=[];
function routerWorkspaceCheck(bool $ok,string $label): void {global $checks,$failures;$checks++;if(!$ok)$failures[]=$label;echo ($ok?'PASS ':'FAIL ').$label."\n";}
final class WorkspaceRoutingProbe implements TypeSafeClientInterface {
    public array $states=[];
    public function evaluate(array $state,array $questions):array {$this->states[]=$state;return ['status'=>'error'];}
}
try {
    $source=$files->readFile('index.php');$selection='<h1>Home</h1>';
    mkdir($root.'/decoy');file_put_contents($root.'/decoy/index.php','<h1>Other workspace</h1>');
    // The injected writer remains authoritative even when process defaults
    // describe another workspace in this same PHP process.
    putenv('VS_TEST_PREVIEW_DIR='.$root.'/decoy');
    $request=['user_id'=>1,'action_type'=>'inline_edit','page_scope'=>'index','user_prompt'=>'Shorten this heading',
        'action_data'=>['path'=>'index.php','selection'=>$selection]];
    $client=new WorkspaceRoutingProbe();
    $router=new AIRouter($db,$settings,fn()=>$client,$files);
    $router->route($request,new AICallLedger($db));
    routerWorkspaceCheck(($client->states[0]['targets']['target_0']['content_hash']??null)===hash('sha256',$source),
        'Routing fingerprints the injected draft rather than process-default files');
    $target=['file_path'=>'index.php','source_address'=>$selection,'content_hash'=>hash('sha256',$source)];
    routerWorkspaceCheck((new ReflectionMethod($router,'literalElement'))->invoke($router,$target,$selection),
        'Literal replacement validation uses the same injected draft fingerprint');
    $client=new WorkspaceRoutingProbe();
    (new RouterShadow($db,$settings,fn()=>$client,$files))->observe($request,new AICallLedger($db));
    routerWorkspaceCheck(($client->states[0]['targets']['target_0']['source_address']??null)===$selection,
        'Shadow observation resolves selection against the injected draft');
    $job=$db->insert('prompt_log',['user_id'=>1,'action_type'=>'inline_edit','user_prompt'=>'Shorten heading',
        'ai_provider'=>'fixture','ai_model'=>'fixture','status'=>'streaming','created_at'=>now()]);
    $client=new WorkspaceRoutingProbe();$writes=0;
    (new RouterHeading($db,$settings,fn()=>$client,$files))->execute($request,$job,
        fn()=>throw new RuntimeException('Generation is not expected'),function()use($files,&$writes){$writes++;return $files;});
    routerWorkspaceCheck(($client->states[0]['targets']['target_0']['source_address']??null)===$selection && $writes===0,
        'Heading classification reads the injected target before constructing a writer');
    $headingTarget=['file_path'=>'index.php','source_address'=>$selection,'content_hash'=>hash('sha256',$selection),'expected_file_hash'=>hash('sha256',$source)];
    $pending=new RouterPendingHeading($db,$settings,null,null,$files);$id=null;
    try {$id=$pending->stage($job,$headingTarget,'Reviewed heading');}catch(RuntimeException){}
    routerWorkspaceCheck(is_string($id) && $db->scalar('SELECT preview_root_hash FROM governor_pending_headings WHERE id = ?',[$id])===hash('sha256',$files->workspace()->draftRoot()),
        'Pending owner review binds to the injected draft that supplied its source bytes');

    $prompt=new PromptEngine($db,$settings,fileManager:$files);
    (new ReflectionProperty($prompt,'headless'))->setValue($prompt,true);
    (new ReflectionProperty($prompt,'headlessJobId'))->setValue($prompt,$job);
    (new ReflectionMethod($prompt,'executeRoutedReplacement'))->invoke($prompt,$request,
        ['target'=>$target,'replacement'=>'<h1>Reviewed replacement</h1>'],$job,null);
    routerWorkspaceCheck(str_contains($files->readFile('index.php'),'<h1>Reviewed replacement</h1>')
        && file_get_contents($root.'/decoy/index.php')==='<h1>Other workspace</h1>',
        'Deterministic replacement writes only the injected draft and preserves the decoy');
    routerWorkspaceCheck($db->scalar('SELECT status FROM prompt_log WHERE id = ?',[$job])==='success',
        'Injected-root replacement retains a successful job result');

    $draft=$files->workspace()->draftRoot();$outside=$root.'/outside';mkdir($outside);
    $outsideSource='<h1>Outside workspace</h1>';file_put_contents($outside.'/index.php',$outsideSource);
    $outsideRequest=array_replace($request,['action_data'=>['path'=>'index.php','selection'=>$outsideSource]]);
    $outsideTarget=['file_path'=>'index.php','source_address'=>$outsideSource,
        'content_hash'=>hash('sha256',$outsideSource),'expected_file_hash'=>hash('sha256',$outsideSource)];
    $pendingJob=$db->insert('prompt_log',['user_id'=>1,'action_type'=>'inline_edit','user_prompt'=>'Shorten heading',
        'ai_provider'=>'fixture','ai_model'=>'fixture','status'=>'streaming','created_at'=>now()]);
    rename($draft,$draft.'-original');symlink($outside,$draft);
    try {
        $rootRejected=false;
        try {VoxelSite\GovernedFilePath::resolve($draft,'index.php');} catch (RuntimeException) {$rootRejected=true;}
        routerWorkspaceCheck($rootRejected,'Governed reads reject a draft root replaced by a symlink');
        $state=(new ReflectionMethod($router,'state'))->invoke($router,$outsideRequest);
        routerWorkspaceCheck(($state[1]??[])===[],'Routing cannot fingerprint files beyond a replaced draft root');
        routerWorkspaceCheck(!(new ReflectionMethod($router,'literalElement'))->invoke($router,$outsideTarget,$outsideSource),
            'Literal replacement validation rejects a replaced draft root');
        $shadow=new RouterShadow($db,$settings,files:$files);
        $shadowState=(new ReflectionMethod($shadow,'state'))->invoke($shadow,$outsideRequest);
        routerWorkspaceCheck(($shadowState['targets']??[])===[],'Shadow observation cannot select a heading beyond a replaced draft root');
        $client=new WorkspaceRoutingProbe();
        $headingResult=(new RouterHeading($db,$settings,fn()=>$client,$files))->execute($outsideRequest,$pendingJob,
            fn()=>throw new RuntimeException('Generation is not expected'),fn()=>$files);
        routerWorkspaceCheck(($headingResult['reason']??'')==='invalid_target' && $client->states===[],
            'Heading edits reject a replaced draft root before classification');
        $pendingRejected=false;
        try {$pending->stage($pendingJob,$outsideTarget,'Reviewed outside heading');} catch (RuntimeException) {$pendingRejected=true;}
        routerWorkspaceCheck($pendingRejected && !$db->queryOne('SELECT id FROM governor_pending_headings WHERE prompt_log_id = ?',[$pendingJob]),
            'Pending owner review cannot retain a target beyond a replaced draft root');
    } finally {unlink($draft);rename($draft.'-original',$draft);}
    $ancestor=$root.'/governed-parent';mkdir($ancestor.'/preview/nested',0700,true);
    file_put_contents($ancestor.'/preview/nested/page.php','<h1>Nested page</h1>');
    routerWorkspaceCheck(VoxelSite\GovernedFilePath::resolve($ancestor.'/preview','nested/page.php')===$ancestor.'/preview/nested/page.php',
        'Governed reads retain supported nested PHP paths under a canonical root');
    rename($ancestor,$ancestor.'-original');symlink($ancestor.'-original',$ancestor);
    try {
        $ancestorRejected=false;
        try {VoxelSite\GovernedFilePath::resolve($ancestor.'/preview','nested/page.php');} catch (RuntimeException) {$ancestorRejected=true;}
        routerWorkspaceCheck($ancestorRejected,'Governed reads reject a root ancestor replaced by a symlink');
    } finally {unlink($ancestor);rename($ancestor.'-original',$ancestor);}

    $shutdownRoot=$root.'/shutdown';mkdir($shutdownRoot);file_put_contents($shutdownRoot.'/.shutdown-fixture','disposable');
    $process=proc_open([PHP_BINARY,'-d','error_reporting=32767',__FILE__,'--shutdown-child',$shutdownRoot],
        [0=>['pipe','r'],1=>['pipe','w'],2=>['pipe','w']],$pipes);
    if (!is_resource($process)) throw new RuntimeException('Cannot start shutdown fixture');
    fclose($pipes[0]);$stdout=stream_get_contents($pipes[1]);$stderr=stream_get_contents($pipes[2]);
    fclose($pipes[1]);fclose($pipes[2]);$exitCode=proc_close($process);
    routerWorkspaceCheck($exitCode===73 && is_file($shutdownRoot.'/terminated-during-stream') && $stdout==='' && $stderr==='',
        'Subprocess terminates during generation after a progressive write without PHP diagnostics');
    $before=json_decode(file_get_contents($shutdownRoot.'/before.json'),true,512,JSON_THROW_ON_ERROR);
    $defaultAfter=siteControlState($shutdownRoot.'/default/studio.db');
    $injectedAfter=siteControlState($shutdownRoot.'/injected/studio.db');
    routerWorkspaceCheck($defaultAfter===$before['default'],
        'Shutdown leaves the process-default draft, published files, and workspace metadata unchanged');
    routerWorkspaceCheck(is_file($shutdownRoot.'/injected/preview/assets/css/style.css')
        && str_contains(file_get_contents($shutdownRoot.'/injected/preview/assets/css/tailwind.css')?:'','.p-7')
        && str_contains(file_get_contents($shutdownRoot.'/injected/preview/assets/js/shutdown.js')?:'','shutdownFixture')
        && $injectedAfter['published']===$before['injected']['published'],
        'Shutdown creates fallback CSS and compiles the injected draft while preserving its streamed file and published site');
    $readStatus=static function(string $path,int $id):string {
        $connection=new SQLite3($path,SQLITE3_OPEN_READONLY);$status=(string)$connection->querySingle('SELECT status FROM prompt_log WHERE id='.(int)$id);$connection->close();return $status;
    };
    routerWorkspaceCheck($readStatus($shutdownRoot.'/injected/studio.db',$before['job_id'])==='partial'
        && $readStatus($shutdownRoot.'/default/studio.db',$before['job_id'])==='streaming',
        'Shutdown marks only the injected database job partial even when the default database has the same job ID');
    echo "$checks router workspace checks, ".count($failures)." failed\n";
} finally {VoxelSite\Database::closeInstance();VoxelSite\Tests\RouterHeadingFixture::remove($root);}
exit($failures?1:0);
}
