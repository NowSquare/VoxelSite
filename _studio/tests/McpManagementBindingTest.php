<?php
declare(strict_types=1);

// Reuse the isolated full wire fixture; never borrow the installed workspace.
require __DIR__.'/McpApplicationTest.php';

use VoxelSite\Agent\{CanonicalJson, CapabilityCatalog, WorkspaceFiles};

$resolver=(new ReflectionProperty($server,'handlerResolver'))->getValue($server);
foreach (CapabilityCatalog::core()->all() as $definition) {
    appCheck(is_callable($resolver($definition->handler)),'Registered management handler is bound: '.$definition->handler);
}
$initial=WorkspaceFiles::hashes(WorkspaceFiles::read($workspace));
$liveInitial=VoxelSite\SiteWorkspace::inventory($root.'/live');
$asset=$tool('voxelsite_assets_inspect',['path'=>'assets/images/workshop.png']);
appCheck($asset['exists'] && count($asset['references'])>0,'Asset inspection schema includes exact static reference locations');
$meta=$tool('voxelsite_assets_prepare',['request_id'=>'binding-assets-001','base_draft_version'=>'draft:2',
    'intent'=>(object)['type'=>'metadata','path'=>'assets/images/workshop.png','expected_hash'=>$asset['sha256'],
        'alt'=>'Workshop bench','description'=>'Private asset catalog entry']]);
$metaResult=$finish($tool('voxelsite_changes_apply',['change_set_id'=>$meta['change_set_id'],'digest'=>$meta['digest'],
    'operation_id'=>'binding-assets-apply-001']),'binding-assets-apply-001');
appCheck($metaResult['status']==='succeeded','Asset metadata shares typed retained application');
$state=$tool('voxelsite_revisions_state');
$history=$tool('voxelsite_revisions_list',['limit'=>2]);
appCheck(count($history['revisions'])===2 && $state['can_undo'],'Revision list and state pass catalog contracts');
$undo=$tool('voxelsite_revisions_prepare',['request_id'=>'binding-undo-plan-001','action'=>'undo',
    'head_version'=>$state['head_version'],'base_draft_version'=>$state['draft_version']]);
appCheck(CanonicalJson::digest($tool('voxelsite_revisions_get',['plan_id'=>$undo['plan_id']]))===CanonicalJson::digest($undo),
    'Undo review is retained without changing draft version');
$undone=$finish($tool('voxelsite_revisions_apply',['plan_id'=>$undo['plan_id'],'digest'=>$undo['digest'],
    'operation_id'=>'binding-undo-001']),'binding-undo-001');
appCheck($undone['status']==='succeeded' && WorkspaceFiles::hashes(WorkspaceFiles::read($workspace))===$initial,
    'Wire undo restores exact prior draft including asset metadata');
$state=$tool('voxelsite_revisions_state');
$redo=$tool('voxelsite_revisions_prepare',['request_id'=>'binding-redo-plan-001','action'=>'redo',
    'head_version'=>$state['head_version'],'base_draft_version'=>$state['draft_version']]);
$redone=$finish($tool('voxelsite_revisions_apply',['plan_id'=>$redo['plan_id'],'digest'=>$redo['digest'],
    'operation_id'=>'binding-redo-001']),'binding-redo-001');
appCheck($redone['status']==='succeeded','Wire redo follows the current active history branch');
$saved=$finish($tool('voxelsite_designs_save',['operation_id'=>'binding-design-save-001','name'=>'Binding fixture','description'=>'Disposable draft']),
    'binding-design-save-001');
appCheck($saved['status']==='succeeded' && $saved['result']['design']['domains']===['draft'],'Design capture passes shared operation result schema');
$design=$saved['result']['design'];
$library=$tool('voxelsite_designs_list',['limit'=>10]);
appCheck(in_array($design['id'],array_column($library['designs'],'id'),true),'Saved design appears in versioned library');
$rendered=$tool('voxelsite_designs_preview',['design_id'=>$design['id'],'path'=>'index.php','max_bytes'=>262144]);
appCheck($rendered['rendered'],'Saved design preview uses the retained draft archive');
$rename=$finish($tool('voxelsite_designs_rename',['operation_id'=>'binding-design-name-001','design_id'=>$design['id'],
    'version'=>$design['version'],'name'=>'Reviewed binding fixture','description'=>'Renamed disposable draft']),'binding-design-name-001');
appCheck($rename['status']==='succeeded','Design rename returns typed metadata');
$site=$tool('voxelsite_site_get');
$export=$tool('voxelsite_export_prepare',['request_id'=>'binding-export-plan-001','source'=>'draft','version'=>$site['draft_version'],'format'=>'php']);
appCheck($export['status']==='ready' && $export['dependencies']['studio_mcp']===false,'Export review explicitly excludes Studio MCP runtime');
$created=$tool('voxelsite_export_create',['export_id'=>$export['export_id'],'digest'=>$export['digest'],'operation_id'=>'binding-export-001']);
appCheck($created['status']==='created' && $tool('voxelsite_export_status',['export_id'=>$export['export_id']])===$created,
    'Export creation and status return the same retained archive');
$download=$tool('voxelsite_export_download',['export_id'=>$export['export_id']]);
appCheck($download['single_use'] && preg_match('/#[a-f0-9]{64}$/D',$download['download_url'])===1,
    'Export download keeps scoped secret in fragment');
$new=$tool('voxelsite_designs_prepare_new',['request_id'=>'binding-design-new-plan','base_draft_version'=>$site['draft_version']]);
$newState=$finish($tool('voxelsite_designs_apply',['plan_id'=>$new['plan_id'],'digest'=>$new['digest'],'operation_id'=>'binding-design-new-001']),
    'binding-design-new-001');
appCheck($newState['status']==='succeeded' && $db->count('pages')===0,'New design clears only reviewed authoring state');
$site=$tool('voxelsite_site_get');
$load=$tool('voxelsite_designs_prepare_load',['request_id'=>'binding-design-load-plan','design_id'=>$design['id'],'base_draft_version'=>$site['draft_version']]);
appCheck(CanonicalJson::digest($tool('voxelsite_designs_get',['plan_id'=>$load['plan_id']]))===CanonicalJson::digest($load),
    'Design load has a separate exact review');
$loaded=$finish($tool('voxelsite_designs_apply',['plan_id'=>$load['plan_id'],'digest'=>$load['digest'],'operation_id'=>'binding-design-load-001']),
    'binding-design-load-001');
appCheck($loaded['status']==='succeeded' && $db->count('pages')===3,'Design load restores page projection through reviewed transition');
appCheck(VoxelSite\SiteWorkspace::inventory($root.'/live')===$liveInitial,'All management draft operations preserve published bytes');
$draft=WorkspaceFiles::hashes(WorkspaceFiles::read($workspace));
$site=$tool('voxelsite_site_get');
$offline=$tool('voxelsite_unpublish_prepare',['request_id'=>'binding-unpublish-plan','release_id'=>$site['release_id']]);
appCheck(CanonicalJson::digest($tool('voxelsite_unpublish_get',['plan_id'=>$offline['plan_id']]))===CanonicalJson::digest($offline),
    'Unpublish uses an explicit retained live review');
$offlined=$finish($tool('voxelsite_unpublish_apply',['plan_id'=>$offline['plan_id'],'digest'=>$offline['digest'],
    'operation_id'=>'binding-unpublish-001']),'binding-unpublish-001');
appCheck($offlined['status']==='succeeded' && WorkspaceFiles::hashes(WorkspaceFiles::read($workspace))===$draft
    && file_get_contents($root.'/live/hosting.txt')==='Untouched hosting file','Unpublish preserves draft and unrelated hosting files');
$businessKey=$credentials->create($owner,1,'read','Business wire fixture',null,null,
    ['notes:read','notes:write','board:read','board:write','team:write','history:read']);
$businessTool=fn($name,$input=[])=>$tool($name,$input,$businessKey);
$beforeBusiness=[$workspace->status(),WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)),VoxelSite\SiteWorkspace::inventory($root.'/live')];
$noteInput=['request_id'=>'binding-note-create-001','title'=>'Über Café','body'=>'Private note content'];
$note=$businessTool('voxelsite_notes_create',$noteInput)['note'];
appCheck($businessTool('voxelsite_notes_create',$noteInput)['note']===$note && $db->count('notes')===1,
    'Private note create has a typed durable replay');
$search=$businessTool('voxelsite_notes_search',['query'=>'über']);
appCheck(count($search['notes'])===1,'Unicode note search remains in the authorized business scope');
$card=$businessTool('voxelsite_board_create',['request_id'=>'binding-card-create-001','title'=>'Review workshop',
    'source_note_id'=>$note['id'],'expected_source_note_version'=>$note['version']]);
$moved=$businessTool('voxelsite_board_move',['request_id'=>'binding-card-move-001','id'=>$card['card']['id'],
    'expected_version'=>$card['card']['version'],'expected_board_version'=>$card['board_version'],'column_name'=>'in_progress','position'=>0]);
appCheck($moved['card']['column_name']==='in_progress','Shared board move pins exact card and order versions');
$team=$businessTool('voxelsite_team_list');
$admin=$businessTool('voxelsite_administration_prepare',['operation_id'=>'binding-team-create-001',
    'intent'=>(object)['type'=>'team.create','name'=>'Wire editor','email'=>'wire@example.invalid','password'=>'disposable-wire-password','role'=>'editor']]);
appCheck($admin['status']==='pending' && count($team['members'])===1,'Administrative wire request returns a pending exact owner review');
(new VoxelSite\Agent\AdminApprovalStore($db,$policy,$workspace,$applicationKey))->approve($owner,$admin['plan_id'],$admin['digest']);
$adminResult=$businessTool('voxelsite_administration_apply',['plan_id'=>$admin['plan_id'],'digest'=>$admin['digest']]);
appCheck($adminResult['status']==='succeeded' && $db->count('users')===2,'Owner-approved team mutation passes the MCP result contract');
appCheck([$workspace->status(),WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)),VoxelSite\SiteWorkspace::inventory($root.'/live')]===$beforeBusiness,
    'Business and team operations preserve draft versions, draft bytes and public bytes');
$compileInput=['request_id'=>'binding-compile-001','base_draft_version'=>'draft:'.$workspace->status()['draft_version']];
$compiled=$tool('voxelsite_compile_prepare',$compileInput);
appCheck($compiled===$tool('voxelsite_compile_prepare',$compileInput),'Deterministic compile preparation retains its exact review');
$compileState=$tool('voxelsite_changes_apply',['change_set_id'=>$compiled['change_set_id'],'digest'=>$compiled['digest'],'operation_id'=>'binding-compile-apply-001']);
for($i=0;$compileState['status']==='applying'&&$i<20;$i++)$compileState=$tool('voxelsite_operations_continue',['operation_id'=>$compileState['operation_id'],'checkpoint'=>$compileState['checkpoint']]);
appCheck($compileState['status']==='succeeded'&&$GLOBALS['lifecycle_provider_attempts']===0,'Explicit compile applies through the shared deterministic runner');
$pageList=$tool('voxelsite_pages_list',['limit'=>1]);$pageItem=$pageList['pages'][0];
$pageRead=$tool('voxelsite_pages_read',['slug'=>$pageItem['slug'],'draft_version'=>$pageList['draft_version']]);
appCheck(hash('sha256',$pageRead['page']['content'])===$pageItem['content_sha256'],'Page source read and inventory share exact versions');
$seo=$tool('voxelsite_structure_seo_read',['path'=>'_root/robots.txt']);
appCheck($seo['content_sha256']===null || hash('sha256',$seo['content'])===$seo['content_sha256'],'SEO override read returns exact bounded source or explicit absence');
$pageChange=$tool('voxelsite_pages_prepare',['request_id'=>'binding-page-meta-001','base_draft_version'=>$pageList['draft_version'],
    'intent'=>(object)['type'=>'page_navigation','page_file'=>$pageItem['file_path'],'expected_hash'=>$pageItem['content_sha256'],
        'values'=>(object)['is_published'=>!(bool)$pageItem['is_published']]]]);
appCheck(count($pageChange['page_changes'])===1 && $pageChange['page_changes'][0]['after']['is_published']===(int)!(bool)$pageItem['is_published'],
    'Page metadata changes are visible in the exact MCP review');
$pageResult=$tool('voxelsite_changes_apply',['change_set_id'=>$pageChange['change_set_id'],'digest'=>$pageChange['digest'],'operation_id'=>'binding-page-meta-apply']);
for($i=0;$pageResult['status']==='applying'&&$i<20;$i++)$pageResult=$tool('voxelsite_operations_continue',['operation_id'=>$pageResult['operation_id'],'checkpoint'=>$pageResult['checkpoint']]);
appCheck($pageResult['status']==='succeeded'&&$tool('voxelsite_pages_read',['slug'=>$pageItem['slug']])['page']['is_published']===(int)!(bool)$pageItem['is_published'],
    'Metadata-only page changes apply through the shared revision and checkpoint contract');
$db->insert('conversations',['id'=>'binding-conversation','user_id'=>1,'title'=>'Private wire conversation','is_active'=>0,'created_at'=>now(),'updated_at'=>now()]);
$conversation=$businessTool('voxelsite_diagnostics_conversation',['conversation_id'=>'binding-conversation','limit'=>10,'max_bytes'=>8192]);
appCheck($conversation['redacted']&&$conversation['conversation']['prompts']===[],'Conversation detail has a scoped bounded MCP read contract');
appCheck($GLOBALS['lifecycle_provider_attempts']===0,'Management catalog calls made no provider network attempt');
echo "MCP management binding: {$checks} combined checks passed\n";
