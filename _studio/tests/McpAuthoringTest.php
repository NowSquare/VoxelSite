<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
require __DIR__.'/fixtures/mcp/ServiceFixture.php';
use VoxelSite\Agent\{FileReadService,JsonSchema,OperationException};
use VoxelSite\SiteWorkspace;

$checks=0; $failures=[];
function authorCheck(bool $ok,string $label): void {
    global $checks,$failures; $checks++; if (!$ok) $failures[]=$label; echo ($ok?'PASS ':'FAIL ').$label."\n";
}
function authorReject(callable $call,string $label): void {
    try { $call(); authorCheck(false,$label); } catch (RuntimeException) { authorCheck(true,$label); }
}
[$root,$db,$workspace,$policy,$actors,$credentials,$owner]=mcpServiceFixture();
mcpCopyFixture(__DIR__.'/fixtures/mcp/site-lifecycle/site',$workspace->draftRoot());
$before=SiteWorkspace::inventory($root.'/assets');
$reads=new FileReadService($db,$policy,$workspace);
foreach (['list','read','search','listAssets'] as $method) {
    JsonSchema::assertSupported(FileReadService::inputSchema($method));
    JsonSchema::assertSupported(FileReadService::outputSchema($method));
}
$first=$reads->list($actors['reader'],(object)['limit'=>2]);
JsonSchema::validate(JsonSchema::output($first),FileReadService::outputSchema('list'));
authorCheck(count($first['files'])===2 && $first['next_offset']===2 && $first['truncated'],'Listing advertises exact continuation');
$all=$first['files']; $page=$first;
while ($page['next_offset']!==null) {
    $page=$reads->list($actors['reader'],(object)['limit'=>2,'offset'=>$page['next_offset'],'inventory_version'=>$first['inventory_version']]);
    $all=array_merge($all,$page['files']);
}
authorCheck(count($all)===$first['total'] && count(array_unique(array_column($all,'path')))===count($all),'Stable pages enumerate complete fixture without duplicates');
$names=array_column($all,'path');
authorCheck(in_array('services/repairs.php',$names) && in_array('_partials/header.php',$names)
    && in_array('assets/js/service-copy.js',$names) && in_array('assets/data/site.json',$names),'Pages, partials, scripts and structured data are inspectable');
authorCheck(!in_array('.htaccess',$names) && !in_array('_studio/data/studio.db',$names),'Inspection excludes private configuration');
authorReject(fn()=>$reads->list($actors['reader'],(object)['offset'=>2]),'Continuation requires inventory version');
$source=$reads->read($actors['reader'],(object)['path'=>'index.php','max_bytes'=>40]);
$joined=$source['content']; $next=$source['next_offset'];
while ($next!==null) {
    $part=$reads->read($actors['reader'],(object)['path'=>'index.php','max_bytes'=>40,'offset'=>$next,'expected_hash'=>$source['sha256']]);
    $joined.=$part['content']; $next=$part['next_offset'];
}
authorCheck($joined===file_get_contents($workspace->draftRoot().'/index.php'),'Ranged reads return every exact source byte');
JsonSchema::validate(JsonSchema::output($source),FileReadService::outputSchema('read'));
authorReject(fn()=>$reads->read($actors['reader'],(object)['path'=>'index.php','offset'=>1]),'Ranged read requires source hash');
$image=$reads->read($actors['reader'],(object)['path'=>'assets/images/workshop.png']);
authorCheck($image['content_encoding']==='base64' && hash('sha256',base64_decode($image['content']))===$image['sha256'],'Binary reads use explicit base64');
file_put_contents($workspace->draftRoot().'/utf8.php',"Aé🙂B");
$unicode=$reads->read($actors['reader'],(object)['path'=>'utf8.php','max_bytes'=>4]);
$tail=$reads->read($actors['reader'],(object)['path'=>'utf8.php','offset'=>$unicode['next_offset'],'expected_hash'=>$unicode['sha256']]);
authorCheck($unicode['content'].$tail['content']==="Aé🙂B" && mb_check_encoding($unicode['content'],'UTF-8'),'Ranges preserve UTF-8 without skipped or repeated bytes');
authorReject(fn()=>$reads->read($actors['reader'],(object)['path'=>'utf8.php','offset'=>2,'expected_hash'=>$unicode['sha256']]),'Mid-character offsets are rejected');
$search=$reads->search($actors['reader'],(object)['query'=>'assets','limit'=>2]);
JsonSchema::validate(JsonSchema::output($search),FileReadService::outputSchema('search'));
authorCheck(count($search['matches'])===2 && $search['truncated'],'Search provides explicit bounded continuation');
$more=$reads->search($actors['reader'],(object)['query'=>'assets','limit'=>2,'offset'=>$search['next_offset'],'inventory_version'=>$search['inventory_version']]);
authorCheck($search['matches'][0]!==$more['matches'][0],'Search offsets advance across source matches');
file_put_contents($workspace->draftRoot().'/utf8.php','changed');
authorReject(fn()=>$reads->list($actors['reader'],(object)['offset'=>2,'inventory_version'=>$first['inventory_version']]),'Out-of-band source edits invalidate pagination');
authorReject(fn()=>$reads->read($actors['reader'],(object)['path'=>'utf8.php','expected_hash'=>$unicode['sha256']]),'Stale source hash is rejected');
foreach (['_studio/data/studio.db','../index.php','php://filter','.htaccess'] as $path) {
    authorReject(fn()=>$reads->read($actors['reader'],(object)['path'=>$path]),'Private/traversal path rejected');
}
symlink($root.'/_studio/data/studio.db',$workspace->draftRoot().'/leak.php');
authorReject(fn()=>$reads->read($actors['reader'],(object)['path'=>'leak.php']),'Symlink file cannot expose private bytes');
unlink($workspace->draftRoot().'/leak.php');
$db->update('site_workspace_state',['reservation_operation_id'=>'another-operation'],'id = 1');
authorReject(fn()=>$reads->list($actors['reader'],new stdClass()),'Checkpointed mutation cannot expose a mixed source inventory');
$db->update('site_workspace_state',['reservation_operation_id'=>null],'id = 1');
$scopedId=$actors['other']->credentialId;
$db->update('api_keys',['scopes'=>json_encode(['files:read'])],'id = ?',[$scopedId]);
$scoped=$policy->fromCredential($scopedId);
authorReject(fn()=>$reads->read($scoped,(object)['path'=>'assets/forms/enquiry.json']),'Files-only read cannot expose form definitions');
authorReject(fn()=>$reads->read($scoped,(object)['path'=>'assets/images/workshop.png']),'Files-only read cannot expose binary assets');
$narrow=$reads->list($scoped,new stdClass());
authorCheck(!in_array('assets/forms/enquiry.json',array_column($narrow['files'],'path'),true)
    && !in_array('assets/images/workshop.png',array_column($narrow['files'],'path'),true),'Narrowed listing filters protected paths and hashes');
$narrowSearch=$reads->search($scoped,(object)['query'=>'form']);
authorCheck(!in_array('assets/forms/enquiry.json',array_column($narrowSearch['matches'],'path'),true),'Narrowed search cannot return form excerpts');
authorReject(fn()=>$reads->list($scoped,(object)['prefix'=>'assets/forms/']),'Explicit denied prefix fails with permission denial');
$db->update('api_keys',['scopes'=>json_encode(['assets:read'])],'id = ?',[$scopedId]);
$assetOnly=$policy->fromCredential($scopedId);
$assetListing=$reads->listAssets($assetOnly,new stdClass());
authorCheck(in_array('assets/images/workshop.png',array_column($assetListing['files'],'path'),true)
    && !in_array('assets/data/site.json',array_column($assetListing['files'],'path'),true)
    && !in_array('assets/forms/enquiry.json',array_column($assetListing['files'],'path'),true),'Asset-only listing exposes only its authorized file domain');
$otherInventory=$reads->list($actors['writer'],new stdClass());
authorCheck($otherInventory['inventory_version']!==$reads->list($actors['reader'],new stdClass())['inventory_version'],'Inventory cursors bind the connection identity');
$credentials->revoke($owner,$actors['reader']->credentialId);
authorReject(fn()=>$reads->list($actors['reader'],new stdClass()),'Revocation applies to file inspection');
authorCheck(SiteWorkspace::inventory($root.'/assets')===$before,'Inspection leaves all published asset bytes untouched');
echo "MCP authoring inspection: {$checks} checks, ".count($failures)." failures\n";
exit($failures?1:0);
