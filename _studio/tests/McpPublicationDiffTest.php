<?php
declare(strict_types=1);
require __DIR__.'/McpApplicationTest.php';
use VoxelSite\Agent\{CanonicalJson,OperationException,PublicationDiffService,WorkspaceFiles};
appCheck(class_exists(PublicationDiffService::class),'Publication comparison has a pure shared read service');
$stateBefore=[$workspace->status(),$db->count('agent_publish_plans'),$db->count('agent_operations'),$db->count('revisions')];
$first=$tool('voxelsite_publish_diff',['limit'=>1]);
appCheck($first['comparison']==='draft_to_live' && $first['has_changes'],'Restored releases without source lineage have an explicit live comparison');
appCheck($stateBefore===[$workspace->status(),$db->count('agent_publish_plans'),$db->count('agent_operations'),$db->count('revisions')],'Diff reads create no review, operation, revision or version change');
if($first['next_offset']!==null){
    $next=$tool('voxelsite_publish_diff',['limit'=>1,'offset'=>$first['next_offset'],'version'=>$first['version']]);
    appCheck($next['changes'][0]['path']!==$first['changes'][0]['path'],'Diff continuation is bounded and does not repeat paths');
}
$review=$tool('voxelsite_publish_prepare',['request_id'=>'diff-publish-review','base_draft_version'=>'draft:'.$workspace->status()['draft_version']]);
$published=$finish($tool('voxelsite_publish_apply',['plan_id'=>$review['plan_id'],'digest'=>$review['digest'],'operation_id'=>'diff-publish-apply']),'diff-publish-apply');
appCheck($published['status']==='succeeded','Fixture has a current exact source publication');
$clean=$tool('voxelsite_publish_diff');
appCheck(!$clean['has_changes'] && $clean['comparison']==='source_to_release','Generated publication output does not create false draft differences');
$path=$root.'/draft/about.php';$before=file_get_contents($path);file_put_contents($path,$before."\n<!-- local edit -->");
$changed=$tool('voxelsite_publish_diff',['limit'=>1]);
appCheck($changed['counts']['modified']===1 && $changed['changes'][0]['reason']==='source_changed','Draft byte changes are visible without a new publish plan');
$stale=$call('tools/call',['name'=>'voxelsite_publish_diff','arguments'=>(object)['offset'=>1,'version'=>$clean['version']]]);
appCheck($stale['body']['result']['isError']??false,'Diff cursor rejects changed source even before version bookkeeping');
file_put_contents($path,$before);
$livePath=$root.'/live/about.php';$liveBefore=file_get_contents($livePath);file_put_contents($livePath,$liveBefore."\n<!-- hosting edit -->");
$drift=$tool('voxelsite_publish_diff');
appCheck($drift['has_changes'] && $drift['changes'][0]['reason']==='live_drift','Managed live drift is visible separately from draft edits');
file_put_contents($livePath,$liveBefore);
file_put_contents($root.'/live/unrelated-host.php','Private hosting sentinel');
appCheck(!$tool('voxelsite_publish_diff')['has_changes'],'Unrelated hosting files never enter the managed comparison');
$settings->set('site_url','https://changed-fixture.invalid');
$configured=$tool('voxelsite_publish_diff');
appCheck(in_array('publication_settings_changed',array_column($configured['changes'],'reason'),true),'Publication configuration changes have their own explicit diff entry');
$readPlan=$db->queryOne('SELECT * FROM agent_publish_plans WHERE id=?',[$review['plan_id']]);
$db->update('agent_publish_plans',['manifest_json'=>$readPlan['manifest_json'].' '],'id=?',[$review['plan_id']]);
// Whitespace is not a semantic corruption; a changed value must fail its digest.
$corrupt=json_decode($readPlan['manifest_json'],true);$corrupt['source_hashes']['about.php']=str_repeat('0',64);
$db->update('agent_publish_plans',['manifest_json'=>CanonicalJson::encode($corrupt)],'id=?',[$review['plan_id']]);
$broken=$call('tools/call',['name'=>'voxelsite_publish_diff','arguments'=>(object)[]]);
appCheck($broken['body']['result']['isError']??false,'Corrupt retained publication source is refused');
appCheck($GLOBALS['lifecycle_provider_attempts']===0,'Pure publication comparison never calls a provider');
echo "MCP publication diff: $checks combined checks passed\n";
