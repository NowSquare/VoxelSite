<?php
declare(strict_types=1);
require __DIR__.'/McpApplicationTest.php';
use VoxelSite\Agent\{ActorPolicy,AdminApprovalStore,CanonicalJson,WorkspaceFiles};

$businessKey=$credentials->create($owner,1,'publish','Full business wire fixture',null,null,ActorPolicy::ceiling('owner'));
$businessTool=fn($name,$input=[])=>$tool($name,$input,$businessKey);
$finishBusiness=function(array $state)use($businessTool):array{
    for($i=0;$state['status']==='applying' && $i<100;$i++)
        $state=$businessTool('voxelsite_operations_continue',['operation_id'=>$state['operation_id'],'checkpoint'=>$state['checkpoint']]);
    appCheck($state['status']==='succeeded','Business operation completed: '.$state['kind']);
    return $state;
};
$initial=[$workspace->status(),WorkspaceFiles::hashes(WorkspaceFiles::read($workspace))];
$form=$businessTool('voxelsite_forms_get',['source'=>'published','form_id'=>'enquiry']);
$validated=$businessTool('voxelsite_forms_validate',['source'=>'published','form_id'=>'enquiry','version'=>$form['version'],
    'data'=>(object)['name'=>'Fixture visitor','email'=>'fixture@example.invalid','message'=>'Repair enquiry']]);
appCheck($validated['valid'] && !$validated['record_created'] && !$validated['email_sent'],
    'Form validation passes the MCP schema without creating records or notification');
$submitInput=['form_id'=>'enquiry','version'=>$form['version'],'request_id'=>'wire-form-submit-001',
    'data'=>(object)['name'=>'Fixture visitor','email'=>'fixture@example.invalid','message'=>'Repair enquiry']];
$submitted=$businessTool('voxelsite_forms_submit',$submitInput);
appCheck($submitted['record_created'] && $submitted['record_id']>0 && $submitted['deliveries']===[],
    'Real form submission returns a durable record identity without implicit mail');
appCheck($businessTool('voxelsite_forms_submit',$submitInput)===$submitted,'Wire form retry does not insert a second record');
$inbox=$businessTool('voxelsite_submissions_list',['kind'=>'form','entity_id'=>'enquiry']);
$record=$inbox['records'][0];
appCheck(count($inbox['records'])===1 && $record['record_id']===$submitted['record_id'],'Inbox listing passes typed record contract');
$businessTool('voxelsite_submissions_update',['kind'=>'form','entity_id'=>'enquiry','record_id'=>$record['record_id'],
    'version'=>$record['version'],'request_id'=>'wire-form-notes-001','notes'=>'Reviewed fixture record']);
$csv=$businessTool('voxelsite_submissions_export',['kind'=>'form','entity_id'=>'enquiry']);
appCheck($csv['rows']===1 && $csv['formula_protection']==='apostrophe_prefix','Scoped CSV export passes bounded wire contract');
$definition=(object)['id'=>'contact','name'=>'Contact fixture','description'=>'Synthetic Action','active'=>true,
    'fields'=>[(object)['name'=>'name','type'=>'text','required'=>true]],
    'notifications'=>(object)['guest_notify'=>false,'owner_notify'=>false],
    'companion_tools'=>(object)['cancel_by_code'=>true],'confirmation'=>(object)['code_length'=>6]];
$bar=$businessTool('voxelsite_actions_bar');
$actionChange=$businessTool('voxelsite_actions_change',['request_id'=>'wire-action-create-001','version'=>$bar['version'],
    'intent'=>(object)['type'=>'save','definition'=>$definition]]);
appCheck($actionChange['public_effects_immediate'],'Action definitions report their immediate public effect');
$action=$businessTool('voxelsite_actions_get',['action_id'=>'contact']);
$actionInput=['action_id'=>'contact','version'=>$action['version'],'request_id'=>'wire-action-invoke-001','kind'=>'create','data'=>(object)['name'=>'Visitor']];
$invoked=$businessTool('voxelsite_actions_invoke',$actionInput);
appCheck($invoked['record_created'] && $businessTool('voxelsite_actions_invoke',$actionInput)===$invoked,
    'Real Action invocation and replay pass the catalog response contract');
appCheck([$workspace->status(),WorkspaceFiles::hashes(WorkspaceFiles::read($workspace))]===$initial,
    'Business record and live Action changes do not alter the private draft version or bytes');
$bar=$businessTool('voxelsite_actions_bar');$beforeBarVersion=$workspace->status()['draft_version'];$beforeBarLive=\VoxelSite\SiteWorkspace::inventory($root.'/live');
$barSettings=$bar['settings'];$barSettings['theme']='floating-fab';
$barInput=['request_id'=>'wire-bar-draft-001','version'=>$bar['version'],'intent'=>(object)['type'=>'bar','settings'=>(object)$barSettings]];
$barChanged=$businessTool('voxelsite_actions_change',$barInput);
appCheck($barChanged['effect']==='draft_write'&&!$barChanged['public_effects_immediate']&&$workspace->status()['draft_version']===$beforeBarVersion+1,
    'MCP bar settings report a versioned private draft effect through the typed response');
appCheck($businessTool('voxelsite_actions_change',$barInput)===$barChanged&&\VoxelSite\SiteWorkspace::inventory($root.'/live')===$beforeBarLive,
    'MCP bar retry retains its receipt and leaves public bytes unchanged');
$identity=$businessTool('voxelsite_settings_read',['group'=>'identity']);
$changed=$finishBusiness($businessTool('voxelsite_settings_update',['operation_id'=>'wire-settings-001','group'=>'identity',
    'version'=>$identity['version'],'values'=>(object)['site_name'=>'Wire settings fixture']]));
appCheck($changed['result']['group']==='identity' && $businessTool('voxelsite_settings_read',['group'=>'identity'])['values']['site_name']==='Wire settings fixture',
    'Typed settings updates preserve their result contract through MCP');
WorkspaceFiles::write($root.'/prompts','fixture.md',"Fixture shipped prompt.\n");
$prompts=$businessTool('voxelsite_prompts_list');
$prompt=$businessTool('voxelsite_prompts_read',['path'=>'fixture.md','offset'=>0,'max_bytes'=>4096]);
$updated=$finishBusiness($businessTool('voxelsite_prompts_update',['operation_id'=>'wire-prompt-001','path'=>'fixture.md',
    'version'=>$prompt['version'],'content'=>"Fixture custom prompt.\n"]));
appCheck($updated['result']['customized'] && file_get_contents($root.'/prompts/fixture.md')==="Fixture shipped prompt.\n",
    'Prompt mutation creates only a custom override through the typed operation contract');
$reset=$finishBusiness($businessTool('voxelsite_prompts_reset',['operation_id'=>'wire-prompt-reset-001','path'=>'fixture.md','version'=>$updated['result']['version']]));
appCheck(!$reset['result']['customized'],'Prompt reset restores shipped instructions without changing shipped bytes');
$system=$businessTool('voxelsite_diagnostics_system');
$usage=$businessTool('voxelsite_diagnostics_usage',['all_users'=>false]);
$history=$businessTool('voxelsite_diagnostics_history',['limit'=>5,'max_bytes'=>8192]);
appCheck($system['workspace_ready'] && $usage['provider_calls']===0 && $history['redacted'],
    'Diagnostics and personal history remain typed, bounded and provider-free');
$credentialPlan=$businessTool('voxelsite_credentials_prepare',['operation_id'=>'wire-credential-create-001','intent'=>(object)[
    'type'=>'credential.create','audience'=>'studio_mcp','user_id'=>1,'label'=>'Owner delivered wire key',
    'preset'=>'read','extra_scopes'=>[],'expires_at'=>time()+86400]]);
(new AdminApprovalStore($db,$policy,$workspace,$applicationKey))->approve($owner,$credentialPlan['plan_id'],$credentialPlan['digest']);
$credentialResult=$businessTool('voxelsite_credentials_apply',['plan_id'=>$credentialPlan['plan_id'],'digest'=>$credentialPlan['digest']]);
appCheck($credentialResult['result']['secret_delivery']==='studio_once' && !str_contains(json_encode($credentialResult),'vxs_'),
    'Credential wire mutation delivers only metadata to the requesting connection');
WorkspaceFiles::write($root.'/data','default-index.php',"<?php echo 'Reset fixture';");
$resetPlan=$businessTool('voxelsite_reset_prepare',['operation_id'=>'wire-reset-site-001',
    'base_draft_version'=>'draft:'.$workspace->status()['draft_version']]);
(new AdminApprovalStore($db,$policy,$workspace,$applicationKey))->approve($owner,$resetPlan['plan_id'],$resetPlan['digest']);
$resetResult=$finishBusiness($businessTool('voxelsite_reset_apply',['plan_id'=>$resetPlan['plan_id'],'digest'=>$resetPlan['digest']]));
appCheck($resetResult['result']['reset']==='site' && $resetResult['result']['files_changed']>0,
    'Exact owner-approved site reset passes the MCP review and retained operation schemas');
appCheck($GLOBALS['lifecycle_provider_attempts']===0,'Business and configuration integration made no provider transport attempt');
echo "MCP business binding: {$checks} combined checks passed\n";
