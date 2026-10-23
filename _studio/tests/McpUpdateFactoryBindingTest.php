<?php
declare(strict_types=1);
require_once __DIR__.'/helpers/lifecycle-provider-trap.php';
require_once dirname(__DIR__).'/engine/bootstrap.php';
use VoxelSite\{Database,Encryption,FileManager,Logger,Migrator,Settings,SiteWorkspace};
use VoxelSite\Agent\{ActorPolicy,AdminApprovalStore,CapabilityCatalog,CredentialService,McpApplication,OperationActor,ProtocolProfile,WorkspaceFiles};
$checks=0;
function adminWireCheck(bool $ok,string $label):void {global $checks;$checks++;if(!$ok)throw new RuntimeException('FAIL '.$label);echo 'PASS '.$label."\n";}
adminWireCheck((new ReflectionMethod(FileManager::class,'__construct'))->getNumberOfParameters()>=2,'Administrative wire fixture requires isolated workspace support');
$root=realpath(sys_get_temp_dir()).'/vs-admin-wire-'.bin2hex(random_bytes(6));
foreach(['_studio/preview/assets','_studio/data','assets'] as $dir)mkdir($root.'/'.$dir,0700,true);
$root=realpath($root);
foreach(['VS_TEST_PREVIEW_DIR'=>$root.'/_studio/preview','VS_TEST_DOC_ROOT'=>$root,'VS_TEST_ASSETS_DIR'=>$root.'/assets',
    'VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/_studio/data/workspace','VS_TEST_MUTATION_LOCK'=>$root.'/_studio/data/site.lock',
    'VS_TEST_REVISIONS_DIR'=>$root.'/_studio/revisions','VS_TEST_ACTIONS_DIR'=>$root.'/_studio/data/actions'] as $name=>$value)putenv($name.'='.$value);
foreach(['logDir'=>$root.'/_studio/data','initialized'=>true] as $name=>$value)(new ReflectionProperty(Logger::class,$name))->setValue(null,$value);
Database::resetInstance();$db=Database::getInstance($root.'/_studio/data/studio.db');(new Migrator($db,new Settings($db)))->run();
$db->insert('users',['name'=>'Owner','email'=>'wire@example.invalid','password_hash'=>'fixture','role'=>'owner','created_at'=>now(),'updated_at'=>now()]);
$db->update('site_workspace_state',['format'=>2],'id=1');
$workspace=new SiteWorkspace($db,$root.'/_studio/preview',$root,$root.'/_studio/data/workspace',$root.'/assets');
file_put_contents($root.'/_studio/preview/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
file_put_contents($root.'/index.php','UNRELATED WEBSITE');file_put_contents($root.'/VERSION',"1.33.0\n");
file_put_contents($root.'/_studio/data/default-index.php','SHIPPED LANDING');
foreach(['update-runtime.php','update-gate.php'] as $file)copy(dirname(__DIR__).'/'.$file,$root.'/_studio/'.$file);
$applicationKey=Encryption::generateKey();file_put_contents($root.'/_studio/data/config.json',json_encode(['app_key'=>$applicationKey]));
$policy=new ActorPolicy($db);$owner=new OperationActor('user',1,null,[],'studio_configured',null);$credentials=new CredentialService($db);
$key=$credentials->create($owner,1,'read','Administrative wire',null,null,['updates:write','reset:installation']);
$read=$credentials->create($owner,1,'read','Ordinary read',null);$actor=$policy->fromCredential($key['id']);
$server=McpApplication::create($db,['app_key'=>$applicationKey],$workspace);
$sequence=0;
$call=function(string $method,array $params=[],?array $credential=null,string $profile=ProtocolProfile::COMPATIBILITY)use($server,$credentials,$key,&$sequence):array{
    $credential??=$key;$headers=['Content-Type'=>'application/json','Accept'=>'application/json, text/event-stream','Authorization'=>'Bearer '.$credential['key'],'MCP-Protocol-Version'=>$profile];
    if($profile===ProtocolProfile::CURRENT){$headers['Mcp-Method']=$method;if($method==='tools/call')$headers['Mcp-Name']=$params['name'];$params['_meta']=(object)[ProtocolProfile::VERSION_META=>$profile,ProtocolProfile::CAPABILITIES_META=>(object)[],ProtocolProfile::CLIENT_META=>(object)['name'=>'Administrative wire fixture','version'=>'1']];}
    $result=$server->handle('POST',$headers,json_encode(['jsonrpc'=>'2.0','id'=>++$sequence,'method'=>$method,'params'=>(object)$params],JSON_THROW_ON_ERROR),
        function(string $token)use($credentials):OperationActor{$_SERVER['HTTP_AUTHORIZATION']='Bearer '.$token;try{return $credentials->authenticate();}finally{unset($_SERVER['HTTP_AUTHORIZATION']);}});
    return json_decode(json_encode($result),true,128,JSON_THROW_ON_ERROR);
};
$tool=function(string $name,array $input=[])use($call,$server,$policy,$key):array{
    $out=$call('tools/call',['name'=>$name,'arguments'=>(object)$input]);
    if($out['status']!==200 || ($out['body']['result']['isError']??true)){
        $resolver=(new ReflectionProperty($server,'handlerResolver'))->getValue($server);
        CapabilityCatalog::core()->dispatch($name,(object)$input,$policy->fromCredential($key['id']),$policy,$resolver);
        throw new RuntimeException(json_encode($out));
    }
    return $out['body']['result']['structuredContent'];
};
foreach(ProtocolProfile::versions() as $profile){
    $names=array_column($call('tools/list',[],null,$profile)['body']['result']['tools'],'name');
    adminWireCheck(in_array('voxelsite_updates_apply',$names,true)&&in_array('voxelsite_factory_reset_prepare',$names,true)&&!in_array('voxelsite_factory_reset_apply',$names,true),$profile.': update activation is scoped; factory completion stays in Studio');
}
$names=array_column($call('tools/list',[],$read)['body']['result']['tools'],'name');
adminWireCheck(!in_array('voxelsite_updates_apply',$names,true)&&!in_array('voxelsite_factory_reset_prepare',$names,true),'Default read grant does not advertise administrative writes');
$inspection=$tool('voxelsite_updates_inspect');
adminWireCheck($inspection['runtime_supported']&&$inspection['current_version']==='1.33.0','Update inspection passes the full catalog wire contract');
adminWireCheck($tool('voxelsite_updates_packages')['packages']===[],'No distribution directory is reported as an empty package list');
$archive=$root.'/wire-package.zip';$zip=new ZipArchive();$zip->open($archive,ZipArchive::CREATE);
$zip->addFromString('VERSION',"1.34.0\n");$zip->addFromString('_studio/engine/bootstrap.php',"<?php declare(strict_types=1); require_once dirname(__DIR__).'/update-gate.php';");
$zip->addFromString('_studio/mcp.php',"<?php declare(strict_types=1); require_once __DIR__.'/update-gate.php';");
for($i=0;$i<105;$i++)$zip->addFromString('_studio/engine/Wire'.$i.'.php','<?php return '.$i.';');$zip->close();
$bytes=file_get_contents($archive);
$begin=['request_id'=>'wire-package-001','filename'=>'wire-package.zip','bytes'=>strlen($bytes),'sha256'=>hash('sha256',$bytes)];
$pkg=$tool('voxelsite_update_package_begin',$begin);
adminWireCheck($tool('voxelsite_update_package_begin',$begin)===$pkg,'Package allocation replays its wire identity');
$chunk=['package_id'=>$pkg['package_id'],'request_id'=>'wire-chunk-001','offset'=>0,'data_base64'=>base64_encode($bytes),'sha256'=>hash('sha256',$bytes)];
$uploaded=$tool('voxelsite_update_package_chunk',$chunk);
adminWireCheck($tool('voxelsite_update_package_chunk',$chunk)===$uploaded,'Wire chunk acknowledgement is stable');
do{$pkg=$tool('voxelsite_update_package_finish',['package_id'=>$pkg['package_id'],'expected_index'=>$pkg['next_index']]);}while($pkg['status']==='extracting');
adminWireCheck($tool('voxelsite_update_package_get',['package_id'=>$pkg['package_id']])===$pkg,'Completed package reads do not execute candidate PHP');
$reviewInput=['package_id'=>$pkg['package_id'],'operation_id'=>'wire-update-001'];
$review=$tool('voxelsite_updates_prepare',$reviewInput);$apply=['plan_id'=>$review['plan_id'],'digest'=>$review['digest']];
adminWireCheck($tool('voxelsite_updates_prepare',$reviewInput)===$review,'Exact update review is stable through MCP');
$denied=$call('tools/call',['name'=>'voxelsite_updates_apply','arguments'=>(object)$apply]);
adminWireCheck(($denied['body']['result']['isError']??false) || $denied['status']===403,'MCP cannot supply its own owner approval');
(new AdminApprovalStore($db,$policy,$workspace,$applicationKey))->approve($owner,$review['plan_id'],$review['digest']);
$operation=$tool('voxelsite_updates_apply',$apply);
adminWireCheck($tool('voxelsite_updates_apply',$apply)===$operation,'Activation retry returns the original checkpoint');
for($i=0;$operation['status']==='applying'&&$i<20;$i++)$operation=$tool('voxelsite_operations_continue',['operation_id'=>$operation['operation_id'],'checkpoint'=>$operation['checkpoint']]);
adminWireCheck($operation['status']==='succeeded'&&$operation['result']['to_version']==='1.34.0','Shared continuation accepts the typed frozen-runtime result');
adminWireCheck(file_get_contents($root.'/index.php')==='UNRELATED WEBSITE','MCP system update preserves public hosting files');
$cleanup=$tool('voxelsite_update_package_cleanup');adminWireCheck($cleanup['expired_packages']===0,'Cleanup keeps referenced update and recovery evidence');
$factoryInput=['operation_id'=>'wire-factory-001','base_draft_version'=>'draft:0'];
$unowned=$call('tools/call',['name'=>'voxelsite_factory_reset_prepare','arguments'=>(object)$factoryInput]);
adminWireCheck($unowned['body']['result']['isError']??false,'Factory review refuses an unowned public homepage');
// Establish an explicit synthetic publication receipt; never adopt unrelated hosting files.
$owned=['index.php'=>hash_file('sha256',$root.'/index.php')];$releaseId='release_'.bin2hex(random_bytes(16));
$db->insert('site_releases',['id'=>$releaseId,'plan_id'=>'fixture-publication','operation_id'=>'fixture-publication',
    'actor_json'=>VoxelSite\Agent\CanonicalJson::encode($owner->attribution()),'draft_version'=>0,
    'manifest_json'=>VoxelSite\Agent\CanonicalJson::encode($owned),'digest'=>VoxelSite\Agent\CanonicalJson::digest($owned),'created_at'=>time()]);
$db->update('site_workspace_state',['release_id'=>$releaseId],'id=1');
$factory=$tool('voxelsite_factory_reset_prepare',$factoryInput);
adminWireCheck($factory['studio_completion_required']&&$factory['review']['final_boundary']!==''&&isset($factory['review']['tables']),'Factory preparation returns exact removal inventory and explicit owner boundary');
adminWireCheck($tool('voxelsite_factory_reset_get',['plan_id'=>$factory['plan_id']])===$factory,'Factory review retrieval is pure and typed');
adminWireCheck(!is_file($root.'/_studio/data/factory-resets/active.json')&&is_file($root.'/_studio/data/studio.db'),'MCP preparation never activates installation cleanup');
adminWireCheck(($GLOBALS['lifecycle_provider_attempts']??0)===0,'Administrative wire tools make zero provider requests');
echo "$checks update/factory binding checks passed\n";
