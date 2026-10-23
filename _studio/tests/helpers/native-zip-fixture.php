<?php
declare(strict_types=1);
// External qualification helper. Never ship or copy this into the ZIP webroot.
$root=realpath($argv[1]??'');$phase=$argv[2]??'';
if(PHP_SAPI!=='cli'||!$root||$root!==($argv[1]??'')||!str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-native-mcp-')
    ||!is_file($root.'/.native-mcp-fixture')||!in_array($phase,['configure','inspect','capture','revoke'],true))throw new RuntimeException('Canonical marked native ZIP fixture required.');
$fixture=json_decode(file_get_contents($root.'/fixture.json'),true,32,JSON_THROW_ON_ERROR);$site=$fixture['site_root'];
if(realpath($site)!==$site||!str_starts_with($site,realpath(sys_get_temp_dir()).'/')||is_link($site)||is_dir($site.'/.git'))throw new RuntimeException('Isolated extracted site required.');
$GLOBALS['lifecycle_provider_attempts']=0;require __DIR__.'/lifecycle-provider-trap.php';
require $site.'/_studio/engine/bootstrap.php';
if(!str_starts_with((new ReflectionClass(VoxelSite\Database::class))->getFileName(),$site.'/'))throw new RuntimeException('Runtime escaped the actual ZIP.');
use VoxelSite\{Database,Encryption,Settings,SiteWorkspace};
use VoxelSite\Agent\{CanonicalJson,CredentialService,OperationActor,ReleaseStore,ActorPolicy,WorkspaceFiles};
$db=Database::getInstance($site.'/_studio/data/studio.db');$settings=new Settings($db);$workspace=new SiteWorkspace($db);$workspace->assertReady();
$ownerId=(int)$db->scalar("SELECT id FROM users WHERE role='owner' ORDER BY id LIMIT 1");
if($ownerId<1)throw new RuntimeException('Real installer owner is required.');
$owner=new OperationActor('user',$ownerId,null,[],'studio_configured',null);
if($phase==='configure'){
    if(is_file($root.'/credential.txt'))throw new RuntimeException('Do not silently replace a qualification credential.');
    $encryption=new Encryption(loadConfig()['app_key']);
    $values=['site_url'=>$fixture['base_url'],'workspace_base_url'=>$fixture['base_url'],'site_name'=>'Spoke & Saturday — fictional workshop',
        'studio_mcp_enabled'=>true,'agent_api_enabled'=>true,'ai_setup_mode'=>'external','ai_provider'=>'claude',
        'evaluator_enabled'=>true,'design_review_enabled'=>true,'governor.mode'=>'enforce',
        'governor.typesafe_api_key'=>$encryption->encrypt('synthetic-router-fixture-only')];
    foreach(['claude','openai','gemini','deepseek','openai_compatible']as$provider)$values['ai_'.$provider.'_api_key']=$encryption->encrypt('synthetic-'.$provider.'-fixture-only');
    $settings->setMany($values);
    $key=(new CredentialService($db))->create($owner,$ownerId,'publish','Native '.$fixture['client'].' ZIP qualification',$fixture['client'],time()+21600,['restore:live']);
    file_put_contents($root.'/credential.txt',$key['key']);chmod($root.'/credential.txt',0600);
    file_put_contents($root.'/credential-id.txt',(string)$key['id']);chmod($root.'/credential-id.txt',0600);
}
if($phase==='revoke')(new CredentialService($db))->revoke($owner,(int)file_get_contents($root.'/credential-id.txt'));
$protected=['ai_setup_mode','ai_provider','evaluator_enabled','design_review_enabled','governor.mode','governor.typesafe_api_key'];
foreach(['claude','openai','gemini','deepseek','openai_compatible']as$provider)$protected[]='ai_'.$provider.'_api_key';
$configuration=[];foreach($protected as$key)$configuration[$key]=$settings->get($key);
$policy=new ActorPolicy($db);$releases=new ReleaseStore($db,$policy,$site.'/_studio/data/agent/releases');
$state=$workspace->status();$managed=$releases->managed($state['release_id'])??[];$live=[];
foreach($managed as$path=>$hash){$absolute=$workspace->resolvePublished($path);if(!is_file($absolute)||is_link($absolute)||hash_file('sha256',$absolute)!==$hash)throw new RuntimeException('Published manifest drift: '.$path);$live[$path]=$hash;}
$result=['phase'=>$phase,'php'=>PHP_VERSION,'product_version'=>trim(file_get_contents($site.'/VERSION')),'workspace'=>$state,
    'provider_configuration_sha256'=>CanonicalJson::digest($configuration),'installation_config_sha256'=>hash_file('sha256',$site.'/_studio/data/config.json'),
    'protected_settings_enabled'=>['synthetic_credentials'=>5,'router_mode'=>$settings->get('governor.mode'),'evaluator'=>$settings->get('evaluator_enabled'),'design_review'=>$settings->get('design_review_enabled')],
    'draft_hashes'=>WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)),'published_hashes'=>$live,
    'operations'=>$db->query('SELECT operation_id,kind,state,phase,before_version,after_version,result_json FROM agent_operations ORDER BY created_at,id'),
    'snapshots'=>$db->query('SELECT id,domain,label,status FROM site_snapshot_captures ORDER BY created_at,id'),
    'publish_plans'=>$db->query('SELECT id,digest,status FROM agent_publish_plans ORDER BY created_at,id'),
    'restore_plans'=>$db->query('SELECT id,digest,status FROM agent_restore_plans ORDER BY created_at,id'),
    'credential_id'=>(int)file_get_contents($root.'/credential-id.txt'),'provider_attempts'=>$GLOBALS['lifecycle_provider_attempts']];
if($phase==='capture'){
    $label=$argv[3]??'';if(!preg_match('/^[a-z][a-z0-9-]{0,49}$/D',$label))throw new RuntimeException('Capture label required.');
    $destination=$root.'/captures/'.$label;if(file_exists($destination))throw new RuntimeException('Capture is immutable.');mkdir($destination,0700,true);
    foreach($live as$path=>$hash){$target=$destination.'/site/'.$path;if(!is_dir(dirname($target)))mkdir(dirname($target),0700,true);
        $bytes=file_get_contents($workspace->resolvePublished($path));if(hash('sha256',$bytes)!==$hash)throw new RuntimeException('Capture changed during read.');file_put_contents($target,$bytes);}
    file_put_contents($destination.'/state.json',json_encode($result,JSON_THROW_ON_ERROR|JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
}
if($result['provider_attempts']!==0)throw new RuntimeException('Unexpected provider transport attempt.');
echo json_encode($result,JSON_THROW_ON_ERROR|JSON_UNESCAPED_SLASHES)."\n";
