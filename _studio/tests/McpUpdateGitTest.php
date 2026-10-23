<?php
declare(strict_types=1);
require __DIR__.'/McpUpdateTest.php';
use VoxelSite\GitUpdater;
use VoxelSite\Agent\UpdatePackagePolicy;
function ugGit(string $cwd,array $args):string {
    $process=proc_open(array_merge(['/usr/bin/git','-c','user.name=Fixture','-c','user.email=fixture@example.invalid'],$args),[0=>['pipe','r'],1=>['pipe','w'],2=>['pipe','w']],$pipes,$cwd);
    if(!is_resource($process))throw new RuntimeException('Git fixture unavailable');fclose($pipes[0]);$out=stream_get_contents($pipes[1]);$error=stream_get_contents($pipes[2]);fclose($pipes[1]);fclose($pipes[2]);if(proc_close($process)!==0)throw new RuntimeException('Git fixture failed: '.$error);return trim($out);
}
$remote=$root.'/upstream.git';$working=$root.'/upstream-work';mkdir($remote);ugGit($remote,['init','--bare','--initial-branch=main']);
ugGit($root.'/live',['init','--initial-branch=main']);ugGit($root.'/live',['add','VERSION','_studio/engine/bootstrap.php','_studio/mcp.php']);ugGit($root.'/live',['commit','-m','Fixture base']);ugGit($root.'/live',['remote','add','origin',$remote]);ugGit($root.'/live',['push','-u','origin','main']);
ugGit($root,['clone',$remote,$working]);file_put_contents($working.'/VERSION','1.36.0');ugGit($working,['add','VERSION']);ugGit($working,['commit','-m','Fixture update']);ugGit($working,['push','origin','main']);
$before=ugGit($root.'/live',['rev-parse','HEAD']);$target=ugGit($working,['rev-parse','HEAD']);$state=$updates->stageGit($other,(object)['request_id'=>'git-stage-operation']);
upCheck($state['status']==='extracting'&&ugGit($root.'/live',['rev-parse','HEAD'])===$before&&trim(file_get_contents($root.'/live/VERSION'))==='1.34.0','Git preparation retains an archive without resetting tracked or website files');
upCheck((int)$db->scalar('SELECT COUNT(*) FROM agent_update_sources')===0,'A fully imported Git source releases its temporary archive reservation');
file_put_contents($working.'/VERSION','1.37.0');ugGit($working,['add','VERSION']);ugGit($working,['commit','-m','Fixture later update']);ugGit($working,['push','origin','main']);
upCheck($updates->stageGit($other,(object)['request_id'=>'git-stage-operation'])===$state,'A lost Git-stage response replays its exact prior commit after upstream moves');
$done=$packages->finish($other,(object)['package_id'=>$state['package_id'],'expected_index'=>0]);upCheck($done['version']==='1.36.0','Git and upload sources share the same package integrity validator');
$bounded=$root.'/bounded.zip';$retained=null;$reservedBeforeBytes=false;
try{(new GitUpdater($root.'/live'))->stageCandidate($bounded,null,static function($identity)use(&$retained,&$reservedBeforeBytes,$bounded){$retained=$identity;$reservedBeforeBytes=!file_exists($bounded);},100);upCheck(false,'Small Git archive bound refuses output');}
catch(RuntimeException $error){upCheck(!file_exists($bounded)&&$reservedBeforeBytes&&is_array($retained),'Git stdout is capped before writing excess bytes and removes incomplete archives');}
// A retry uses the already selected commit even if upstream changed again.
$fixed=$root.'/fixed.zip';$fixedState=(new GitUpdater($root.'/live'))->stageCandidate($fixed,['from_sha'=>$before,'to_sha'=>$target]);$zip=new ZipArchive();$zip->open($fixed);$fixedVersion=UpdatePackagePolicy::inventory($zip)['version'];$zip->close();upCheck($fixedState['to_sha']===$target&&$fixedVersion==='1.36.0','Interrupted Git staging can rebuild the retained exact commit without another fetch selection');
$source=$packages->reserveSource($other,'expired-git-source');$name='source-'.hash('sha256',$other->identity()."\0expired-git-source");file_put_contents($packages->root().'/'.$name.'.zip','partial');$db->update('agent_update_sources',['created_at'=>1],'request_id=?',['expired-git-source']);$clean=$packages->cleanup($owner,(object)[]);
upCheck($clean['expired_sources']===1&&!file_exists($packages->root().'/'.$name.'.zip')&&(int)$db->scalar('SELECT reserved_bytes FROM agent_update_sources WHERE request_id=?',['expired-git-source'])===0,'Expired partial Git archives are pruned within the shared bounded cleanup budget');
upReject(fn()=>$packages->reserveSource($other,'expired-git-source'),'review_expired','Git source expiry keeps an identity tombstone instead of silently selecting a new commit');
echo "\n{$checks} combined update/Git checks passed\n";
