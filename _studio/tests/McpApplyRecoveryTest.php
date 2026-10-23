<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/engine/bootstrap.php';
use VoxelSite\Agent\{ActorPolicy, AuthoringBriefService, BriefStore, ChangeSetExecutor, ChangeSetService,
    ChangeSetStore, ContextService, CredentialService, OperationActor, OperationException, OperationStore, WorkspaceFiles};
use VoxelSite\{Database, FileManager, Migrator, Settings, SiteWorkspace};

set_exception_handler(function(Throwable $error):never {
    fwrite(STDERR,$error->getMessage()."\n");
    if ($error instanceof OperationException) fwrite(STDERR,json_encode($error->details,JSON_THROW_ON_ERROR)."\n");
    fwrite(STDERR,$error->getTraceAsString()."\n");
    exit(1);
});
// Subprocesses and signals belong only to this development test. The application
// does not start workers or require proc_open/pcntl/posix on a buyer's server.
$checks=0;
function recoveryCheck(bool $ok,string $label):void {
    global $checks; $checks++;
    if (!$ok) throw new RuntimeException('FAIL '.$label);
    echo 'PASS '.$label."\n";
}
function recoveryReject(callable $fn,string $code,string $label):void {
    try {$fn();} catch (OperationException $error) {recoveryCheck($error->errorCode===$code,$label);return;}
    recoveryCheck(false,$label);
}
function recoveryFixture(string $root,bool $seed):array {
    if ((new ReflectionMethod(FileManager::class,'__construct'))->getNumberOfParameters()<2) {
        throw new RuntimeException('Fixture isolation requires workspace constructor injection.');
    }
    if ($seed) foreach (['draft','live/assets/data','private'] as $directory) mkdir($root.'/'.$directory,0700,true);
    $root=realpath($root);
    if ($root===false || !str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-mcp-recovery-')) {
        throw new RuntimeException('Fixture must be a canonical temporary directory.');
    }
    foreach (['VS_TEST_PREVIEW_DIR'=>$root.'/draft','VS_TEST_DOC_ROOT'=>$root.'/live',
        'VS_TEST_ASSETS_DIR'=>$root.'/live/assets','VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/private/workspace',
        'VS_TEST_MUTATION_LOCK'=>$root.'/private/site.lock','VS_TEST_REVISIONS_DIR'=>$root.'/private/revisions'] as $key=>$value) {
        putenv($key.'='.$value);
    }
    foreach (['logDir'=>$root.'/private','initialized'=>true] as $property=>$value) {
        (new ReflectionProperty(\VoxelSite\Logger::class,$property))->setValue(null,$value);
    }
    $db=Database::getInstance($root.'/private/studio.db');
    if ($seed) {
        (new Migrator($db,new Settings($db)))->run();
        $db->insert('users',['email'=>'recovery@example.invalid','password_hash'=>'not-a-login','name'=>'Recovery',
            'role'=>'owner','created_at'=>now(),'updated_at'=>now()]);
        $db->update('site_workspace_state',['format'=>2],'id = 1');
        file_put_contents($root.'/draft/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
        $source=__DIR__.'/fixtures/mcp/site-lifecycle/site';
        foreach (SiteWorkspace::inventory($source)['files'] as $path=>$unused) {
            if (!is_dir(dirname($root.'/draft/'.$path))) mkdir(dirname($root.'/draft/'.$path),0700,true);
            copy($source.'/'.$path,$root.'/draft/'.$path);
        }
        copy(dirname(__DIR__).'/static/form-handler.js',$root.'/draft/assets/js/form-handler.js');
        file_put_contents($root.'/live/assets/data/site.json','{"title":"Unchanged live fixture"}');
    }
    $workspace=new SiteWorkspace($db,$root.'/draft',$root.'/live',$root.'/private/workspace',$root.'/live/assets');
    $policy=new ActorPolicy($db);
    if ($seed) {
        $owner=new OperationActor('user',1,null,[],'studio_configured',null);
        (new CredentialService($db))->create($owner,1,'edit','Recovery test',null);
        $files=new FileManager($db,$workspace);
        $files->writeFile('_partials/footer.php',file_get_contents($root.'/draft/_partials/footer.php'));
        $files->syncPageRegistry(true);
    }
    // Preserve the historical actor to exercise restoration after revocation;
    // every real service still checks current authority through ActorPolicy.
    $actor=new OperationActor('api_key',1,1,ActorPolicy::presets()['edit']['scopes'],'forbidden','Recovery test');
    $store=new ChangeSetStore($db,$policy,$root.'/private/changes');
    $operations=new OperationStore($db,$policy,$workspace->mutationLockPath());
    if ($seed) {
        $briefStore=new BriefStore($db,$policy);
        $brief=(new AuthoringBriefService(new ContextService($db,$policy,$workspace),$briefStore))
            ->create($actor,['request_id'=>'recovery-brief-001','action'=>'edit_page']);
        $edits=[];
        foreach (['index.php','about.php'] as $path) {
            $content=file_get_contents($root.'/draft/'.$path);
            $edits[]=(object)['type'=>'replace','path'=>$path,'expected_hash'=>hash('sha256',$content),
                'content'=>str_replace('</section>',"<p>Reviewed recovery fixture change.</p></section>",$content)];
        }
        $review=(new ChangeSetService($db,$policy,$workspace,$briefStore,$store))->prepare($actor,(object)[
            'request_id'=>'recovery-review-001','base_draft_version'=>$brief['base_draft_version'],'brief_id'=>$brief['brief_id'],
            'summary'=>'Reviewed recovery fixture changes','operations'=>$edits]);
        file_put_contents($root.'/private/test-state.json',json_encode([
            'input'=>['change_set_id'=>$review['change_set_id'],'digest'=>$review['digest'],'operation_id'=>'recovery-apply-001'],
            'before'=>WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)),
            'pages'=>$db->query('SELECT * FROM pages ORDER BY id'),'live'=>SiteWorkspace::inventory($root.'/live'),
            'draft_version'=>$workspace->status()['draft_version'],
        ],JSON_THROW_ON_ERROR));
    }
    $state=json_decode(file_get_contents($root.'/private/test-state.json'),true,64,JSON_THROW_ON_ERROR);
    return [$root,$db,$workspace,$policy,$actor,$store,$operations,$state];
}

if (($argv[1]??'')==='--run') {
    [$mode,$case,$path]=array_slice($argv,1);
    [$root,$db,$workspace,$policy,$actor,$store,$operations,$state]=recoveryFixture($path,true);
    $hook=function(string $phase,array $operation) use($case,$db,$root,$state,$store):void {
        if ($case==='throw_after_file' && $phase==='after_file') throw new RuntimeException('Injected write failure.');
        if ($case==='external_drift' && $phase==='after_file') {
            file_put_contents($root.'/draft/'.$operation['path'],'Unrelated external file change');
            file_put_contents($root.'/private/drift-path.txt',$operation['path']);
            throw new RuntimeException('Injected third-party write before recovery.');
        }
        if ($case==='revoke_after_file' && $phase==='after_file') {
            $db->update('studio_mcp_credentials',['revoked_at'=>time()],'key_id = 1');
        }
        if ($case==='restore_failure' && $phase==='after_file') {
            // A lost original must retain the reservation until explicit repair.
            $original=$store->stagingRoot($state['input']['change_set_id']).'/before/'.$operation['path'];
            file_put_contents($root.'/private/original-path.txt',$operation['path']);
            copy($original,$root.'/private/original-index.php');
            file_put_contents($original,'corrupted recovery material');
            throw new RuntimeException('Injected failure with unavailable original.');
        }
        if ($case==='kill_'.$phase) {
            file_put_contents($root.'/private/killed-at.txt',$phase);
            posix_kill(getmypid(),SIGKILL);
        }
    };
    try {
        (new ChangeSetExecutor($db,$policy,$workspace,$store,$operations,100,$hook))->apply($actor,(object)$state['input']);
    } catch (OperationException $error) {
        if ($case!=='revoke_after_file' || $error->errorCode!=='permission_denied') throw $error;
    }
    exit(0);
}
if (($argv[1]??'')==='--check') {
    [$mode,$case,$path]=array_slice($argv,1);
    [$root,$db,$workspace,$policy,$actor,$store,$operations,$state]=recoveryFixture($path,false);
    $executor=new ChangeSetExecutor($db,$policy,$workspace,$store,$operations,100);
    $raw=$db->queryOne('SELECT * FROM agent_operations WHERE operation_id = ?',[$state['input']['operation_id']]);
    recoveryCheck($raw!==null,$case.': durable operation exists');
    if (in_array($case,['throw_after_file','revoke_after_file'],true)) {
        recoveryCheck($raw['state']==='failed_restored',$case.': failure persisted after verified restoration');
        recoveryCheck(WorkspaceFiles::hashes(WorkspaceFiles::read($workspace))===$state['before'],$case.': all original draft hashes restored');
        recoveryCheck($db->query('SELECT * FROM pages ORDER BY id')===$state['pages'],$case.': original page projection retained');
        recoveryCheck($db->scalar('SELECT COUNT(*) FROM revisions')===0 && $workspace->status()['draft_version']===$state['draft_version'],
            $case.': no failed revision or version increment');
        recoveryCheck($workspace->status()['reservation_operation_id']===null,$case.': verified restore releases reservation');
        if ($case==='revoke_after_file') recoveryReject(fn()=>$operations->get($actor,'recovery-apply-001'),'permission_denied',
            'Revoked actor cannot read or advance the retained operation');
    } elseif ($case==='external_drift') {
        $path=file_get_contents($root.'/private/drift-path.txt');
        recoveryCheck($raw['state']==='recovery_required','External drift keeps recovery unresolved');
        recoveryCheck(file_get_contents($root.'/draft/'.$path)==='Unrelated external file change',
            'Automatic recovery preserves third-party bytes outside the before/after manifests');
        $result=$executor->recover($actor,'recovery-apply-001');
        recoveryCheck($result['status']==='recovery_required'
            && in_array($path,$result['result']['restoration']['remaining_paths'],true),
            'Explicit recovery reports the conflict without overwriting it');
        recoveryCheck(file_get_contents($root.'/draft/'.$path)==='Unrelated external file change',
            'Explicit recovery preserves third-party bytes');
        recoveryCheck($workspace->status()['reservation_operation_id']===$raw['id'],
            'Unresolved external drift retains the reservation');
    } elseif ($case==='restore_failure') {
        recoveryCheck($raw['state']==='recovery_required',$case.': missing original is reported honestly');
        recoveryCheck($workspace->status()['reservation_operation_id']===$raw['id'],$case.': unresolved operation retains reservation');
        recoveryReject(fn()=>(new FileManager($db,$workspace))->writeExactFile('index.php','Unrelated mutation'),'recovery_required',
            'An unresolved restoration prevents unrelated draft writes');
        $originalPath=file_get_contents($root.'/private/original-path.txt');
        copy($root.'/private/original-index.php',$store->stagingRoot($state['input']['change_set_id']).'/before/'.$originalPath);
        $result=$executor->recover($actor,'recovery-apply-001');
        recoveryCheck($result['status']==='failed_restored' && $workspace->status()['reservation_operation_id']===null,
            'Explicit recovery verifies repaired original and clears reservation');
        recoveryCheck(WorkspaceFiles::hashes(WorkspaceFiles::read($workspace))===$state['before'],'Explicit recovery restores complete draft');
    } else {
        recoveryCheck(is_file($root.'/private/killed-at.txt'),$case.': worker terminated without cleanup');
        $beforePoll=WorkspaceFiles::hashes(WorkspaceFiles::read($workspace));
        $row=$operations->get($actor,'recovery-apply-001');
        recoveryCheck(WorkspaceFiles::hashes(WorkspaceFiles::read($workspace))===$beforePoll,$case.': polling does not mutate files');
        if ($case!=='kill_after_commit') {
            recoveryCheck($row['state']==='applying' && $row['recovery']!==null,$case.': retained recovery precedes interrupted writes');
            recoveryCheck($db->scalar('SELECT COUNT(*) FROM revisions')===0 && $workspace->status()['draft_version']===$state['draft_version'],
                $case.': uncommitted database effects rolled back');
            recoveryReject(fn()=>(new FileManager($db,$workspace))->writeExactFile('index.php','Unrelated mutation'),'site_busy',
                $case.': paused reservation blocks unrelated writer');
            recoveryReject(fn()=>$executor->continue($actor,'recovery-apply-001',$row['checkpoint_number']),'site_busy',
                $case.': active lease cannot be stolen');
            $db->update('agent_operations',['lease_expires_at'=>time()-1],'id = ?',[$row['id']]);
            $result=$executor->continue($actor,'recovery-apply-001',$row['checkpoint_number']);
        } else {
            recoveryCheck($row['state']==='succeeded',$case.': committed result survives a lost response');
            $result=$executor->apply($actor,(object)$state['input']);
        }
        recoveryCheck($result['status']==='succeeded',$case.': explicit continuation/replay succeeds');
        $change=$store->get($actor,$state['input']['change_set_id']);
        recoveryCheck(WorkspaceFiles::hashes(WorkspaceFiles::read($workspace))===$change['manifest']['after'],
            $case.': final hashes equal reviewed bytes');
        recoveryCheck($db->scalar('SELECT COUNT(*) FROM revisions')===1 && $workspace->status()['draft_version']===$state['draft_version']+1,
            $case.': exactly one revision and draft version');
        recoveryCheck($workspace->status()['reservation_operation_id']===null,$case.': successful commit releases reservation');
        recoveryCheck($executor->apply($actor,(object)$state['input'])===$result,$case.': stable result after repeated apply');
    }
    recoveryCheck(SiteWorkspace::inventory($root.'/live')===$state['live'],$case.': live files remain byte-identical');
    echo "RECOVERY_CHECKS={$checks}\n";
    exit(0);
}

if (!function_exists('posix_kill') || !function_exists('proc_open')) {
    fwrite(STDERR,"FAIL This development crash suite requires posix and proc_open; no host qualification claimed.\n");exit(1);
}
$total=0;
foreach (['throw_after_file','external_drift','revoke_after_file','restore_failure','kill_after_file','kill_after_projection','kill_after_commit'] as $case) {
    $root=realpath(sys_get_temp_dir()).'/vs-mcp-recovery-'.bin2hex(random_bytes(6));
    foreach (['--run','--check'] as $mode) {
        $pipes=[];
        $process=proc_open([PHP_BINARY,__FILE__,$mode,$case,$root],[0=>['pipe','r'],1=>['pipe','w'],2=>['pipe','w']],$pipes);
        if (!is_resource($process)) throw new RuntimeException('Cannot start development fixture process.');
        fclose($pipes[0]);$output=stream_get_contents($pipes[1]);fclose($pipes[1]);
        $errors=stream_get_contents($pipes[2]);fclose($pipes[2]);$exit=proc_close($process);
        $expectedKill=$mode==='--run' && str_starts_with($case,'kill_');
        if ((!$expectedKill && $exit!==0) || ($expectedKill && !is_file($root.'/private/killed-at.txt'))) {
            fwrite(STDERR,$output.$errors."\nFixture: {$root}\n");exit(1);
        }
        if ($mode==='--check') {
            echo $output;
            if (preg_match('/RECOVERY_CHECKS=(\d+)/',$output,$match)) $total+=(int)$match[1];
        }
    }
}
echo "Apply/recovery: {$total} checks passed, including real process termination.\n";
