<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
require __DIR__.'/helpers/LegacyUpgradeFixture.php';

use VoxelSite\{Database,SiteWorkspace,WorkspaceMigration};
use VoxelSite\Agent\{OperationException,SitePathPolicy,WorkspaceFiles};

$checks=0;$failures=[];
function scaffoldCheck(bool $ok,string $label):void {
    global $checks,$failures;$checks++;
    if(!$ok)$failures[]=$label;
    echo ($ok?'PASS ':'FAIL ').$label."\n";
}
function scaffoldReject(callable $call,string $label,?string $code=null):void {
    try{$call();scaffoldCheck(false,$label);}
    catch(RuntimeException $error){
        $actual=$error instanceof OperationException?$error->errorCode:$error->getMessage();
        scaffoldCheck($code===null || str_starts_with($actual,$code),$label);
    }
}
function scaffoldSuccess(callable $call,string $label):mixed {
    try{$result=$call();scaffoldCheck(true,$label);return $result;}
    catch(RuntimeException $error){scaffoldCheck(false,$label.' ('.$error->getMessage().')');return null;}
}

$f=legacyUpgradeFixture();
try {
    $migration=new WorkspaceMigration($f['workspace'],$f['db']);
    $migration->rollback();
    // Use the exact nested placeholders produced by build-dist.sh, before the
    // real legacy-assets migration. They must never become managed content.
    $directories=['images','files','fonts','css','js','data','forms'];
    $markers=[];
    foreach($directories as $directory){
        $path='assets/'.$directory.'/.gitkeep';$markers[]=$path;
        if(!is_dir(dirname($f['root'].'/'.$path)))mkdir(dirname($f['root'].'/'.$path),0700,true);
        file_put_contents($f['root'].'/'.$path,'');
    }
    file_put_contents($f['workspace']->draftRoot().'/.gitkeep','');
    do{$result=$migration->run(2);}while($result['status']==='pending');
    foreach($markers as $path){
        scaffoldCheck(is_file($f['workspace']->draftRoot().'/'.$path)
            && filesize($f['workspace']->draftRoot().'/'.$path)===0,'Migration preserves regular empty '.$path);
        scaffoldReject(fn()=>SitePathPolicy::canonical($path),'Scaffold is still outside managed authoring: '.$path,'invalid_path');
    }
    $sources=scaffoldSuccess(fn()=>WorkspaceFiles::read($f['workspace']),'Packaged scaffold permits bounded workspace inventory');
    if(is_array($sources))scaffoldCheck(!array_filter(array_keys($sources),fn($p)=>str_contains($p,'.gitkeep'))
        && ($sources['assets/images/logo.png']??null)==='LEGACY IMAGE','Only actual managed sources enter review inventory');
    $proof=scaffoldSuccess(fn()=>$migration->publishedAssetHashes(),'Empty scaffold permits original publication ownership proof');
    if(is_array($proof))scaffoldCheck(!array_filter(array_keys($proof),fn($p)=>str_contains($p,'.gitkeep'))
        && ($proof['assets/images/logo.png']??null)===hash('sha256','LEGACY IMAGE'),'Scaffold adds no published ownership and real hashes remain exact');

    $plan=scaffoldSuccess(fn()=>$f['plans']->prepare($f['owner'],(object)['request_id'=>'scaffold-first-review',
        'base_draft_version'=>'draft:'.$f['workspace']->status()['draft_version']]),'First publication prepares directly from packaged scaffolds');
    if(is_array($plan)){
        $managed=array_merge(array_column($plan['files'],'path'),$plan['deletions']);
        scaffoldCheck(!array_filter($managed,fn($p)=>str_contains($p,'.gitkeep')),'Publication never writes or deletes scaffold markers');
        $input=(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest'],'operation_id'=>'scaffold-first-publish'];
        $state=$f['plans']->publish($f['owner'],$input);
        for($i=0;$i<100 && $state['status']==='applying';$i++)$state=$f['plans']->continue($f['owner'],$input->operation_id,$state['checkpoint']);
        scaffoldCheck($state['status']==='succeeded' && str_contains(file_get_contents($f['root'].'/index.php'),'Upgraded draft homepage'),
            'First real publication succeeds with migrated scaffold placeholders');
        foreach($markers as $path)scaffoldCheck(is_file($f['root'].'/'.$path) && filesize($f['root'].'/'.$path)===0,
            'Publication preserves unowned scaffold '.$path);
    }

    $draft=$f['workspace']->draftRoot();$marker=$draft.'/assets/forms/.gitkeep';
    foreach(['.gitkeep','assets/forms/.gitkeep'] as $path){
        file_put_contents($draft.'/'.$path,'not an empty scaffold');
        scaffoldReject(fn()=>WorkspaceFiles::read($f['workspace']),'Nonempty '.$path.' is rejected','invalid_path');
        file_put_contents($draft.'/'.$path,'');
    }
    unlink($marker);mkdir($marker);
    scaffoldReject(fn()=>WorkspaceFiles::read($f['workspace']),'A directory named .gitkeep is not a scaffold','invalid_path');
    rmdir($marker);file_put_contents($marker,'');
    file_put_contents($f['root'].'/empty-outside','');unlink($marker);symlink($f['root'].'/empty-outside',$marker);
    scaffoldReject(fn()=>WorkspaceFiles::read($f['workspace']),'An empty symlink target is not a scaffold','workspace_unsafe_path');
    unlink($marker);file_put_contents($marker,'');
    rename($draft.'/assets/forms',$draft.'/assets/forms-original');symlink($f['root'].'/assets/forms',$draft.'/assets/forms');
    scaffoldReject(fn()=>WorkspaceFiles::read($f['workspace']),'A linked scaffold parent is rejected','workspace_unsafe_path');
    unlink($draft.'/assets/forms');rename($draft.'/assets/forms-original',$draft.'/assets/forms');
    foreach(['assets/forms/.other','assets/forms/.gitkeep.json','assets/forms/deeper/.gitkeep','assets/.hidden/.gitkeep'] as $path){
        if(!is_dir(dirname($draft.'/'.$path)))mkdir(dirname($draft.'/'.$path),0700,true);
        file_put_contents($draft.'/'.$path,'');
        scaffoldReject(fn()=>WorkspaceFiles::read($f['workspace']),'Unlisted dotfile remains rejected: '.$path,'invalid_path');
        unlink($draft.'/'.$path);
    }
    rmdir($draft.'/assets/forms/deeper');rmdir($draft.'/assets/.hidden');

    $manifestPath=$f['workspace']->migrationRoot().'/manifest.json';$original=file_get_contents($manifestPath);
    $manifest=json_decode($original,true,32,JSON_THROW_ON_ERROR);$relative='forms/.gitkeep';
    foreach(['nonempty','wrong_hash','uncopied','invalid_mode'] as $case){
        $bad=$manifest;
        if($case==='nonempty'){$bad['inventory']['files'][$relative]['size']=1;$bad['inventory']['files'][$relative]['sha256']=hash('sha256','x');}
        if($case==='wrong_hash')$bad['inventory']['files'][$relative]['sha256']=hash('sha256','x');
        if($case==='uncopied')$bad['copied'][$relative]=false;
        if($case==='invalid_mode')$bad['inventory']['files'][$relative]['mode']=-1;
        file_put_contents($manifestPath,json_encode($bad,JSON_THROW_ON_ERROR));
        scaffoldReject(fn()=>$migration->publishedAssetHashes(),'Invalid scaffold evidence is rejected: '.$case);
    }
    foreach(['forms/../forms/.gitkeep','forms/.other','images/deeper/.gitkeep'] as $path){
        $bad=$manifest;$bad['inventory']['files'][$path]=$bad['inventory']['files'][$relative];$bad['copied'][$path]=true;
        file_put_contents($manifestPath,json_encode($bad,JSON_THROW_ON_ERROR));
        scaffoldReject(fn()=>$migration->publishedAssetHashes(),'Noncanonical scaffold evidence is rejected: '.$path);
    }
    file_put_contents($manifestPath,$original);
    $liveMarker=$f['root'].'/assets/forms/.gitkeep';unlink($liveMarker);symlink($f['root'].'/empty-outside',$liveMarker);
    scaffoldReject(fn()=>$migration->publishedAssetHashes(),'Publication evidence does not ignore a linked live scaffold','workspace_unsafe_path');
    unlink($liveMarker);file_put_contents($liveMarker,'');
    // Ownership is historical: a newer draft marker cannot change the original
    // verified migration metadata or grant ownership over its newer bytes.
    file_put_contents($marker,'new unowned draft bytes');
    $historical=scaffoldSuccess(fn()=>$migration->publishedAssetHashes(),'Original empty-marker evidence is independent of newer draft bytes');
    if(is_array($historical))scaffoldCheck(!isset($historical['assets/forms/.gitkeep']),'Historical exclusion never adopts new draft marker content');
    file_put_contents($marker,'');
    $bad=$manifest;
    for($i=count($bad['inventory']['files']);$i<=700;$i++){
        $path='images/budget-'.$i.'.png';$bad['inventory']['files'][$path]=['size'=>0,'sha256'=>hash('sha256',''),'mode'=>0644];$bad['copied'][$path]=true;
    }
    file_put_contents($manifestPath,json_encode($bad,JSON_THROW_ON_ERROR));
    scaffoldReject(fn()=>$migration->publishedAssetHashes(),'Scaffold exemption preserves the 700-file provenance limit','workspace_migration_corrupt');
    file_put_contents($manifestPath,$original);

    $inventory=scaffoldSuccess(fn()=>WorkspaceFiles::read($f['workspace']),'Valid scaffold inventory recovers after rejected entries');
    if(is_array($inventory)){
        $added=[];
        for($i=count($inventory);$i<WorkspaceFiles::MAX_FILES;$i++){
            $path=$draft.'/assets/images/budget-'.$i.'.png';file_put_contents($path,'x');$added[]=$path;
        }
        $limit=scaffoldSuccess(fn()=>WorkspaceFiles::read($f['workspace']),'Scaffolds do not consume the 500 managed-file allowance');
        if(is_array($limit))scaffoldCheck(count($limit)===WorkspaceFiles::MAX_FILES,'Managed-file budget remains exactly 500');
        $extra=$draft.'/assets/images/over-budget.png';file_put_contents($extra,'x');
        scaffoldReject(fn()=>WorkspaceFiles::read($f['workspace']),'A 501st managed file is still rejected','host_capability_unavailable');unlink($extra);
        foreach($added as $path)unlink($path);
    }
    $large=$draft.'/assets/images/large.png';$handle=fopen($large,'wb');ftruncate($handle,WorkspaceFiles::MAX_BYTES+1);fclose($handle);
    scaffoldReject(fn()=>WorkspaceFiles::read($f['workspace']),'Scaffolds do not bypass the source byte budget','host_capability_unavailable');unlink($large);
    for($i=0;$i<WorkspaceFiles::MAX_FILES*3;$i++)mkdir($draft.'/assets/images/scan-'.$i);
    scaffoldReject(fn()=>WorkspaceFiles::read($f['workspace']),'Scaffolds preserve the directory entry scan budget','host_capability_unavailable');
    echo "$checks checks, ".count($failures)." failures\n";
} finally {Database::resetInstance();legacyUpgradeRemove($f['root']);}
exit($failures===[]?0:1);
