<?php
declare(strict_types=1);

/** Disposable roots are established before any filesystem-aware service exists. */
function mcpServiceFixture(): array
{
    $root=sys_get_temp_dir().'/vs-mcp-service-'.bin2hex(random_bytes(8));
    foreach (['_studio/data','_studio/preview/assets','assets'] as $path) mkdir($root.'/'.$path,0700,true);
    foreach (['VS_TEST_PREVIEW_DIR'=>$root.'/_studio/preview','VS_TEST_ASSETS_DIR'=>$root.'/_studio/preview/assets',
        'VS_TEST_DOC_ROOT'=>$root,'VS_TEST_MUTATION_LOCK'=>$root.'/_studio/data/site-mutation.lock',
        'VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/_studio/data/workspace-migration'] as $key=>$value) putenv($key.'='.$value);
    foreach (['logDir'=>$root.'/_studio/data','initialized'=>true] as $property=>$value) {
        (new ReflectionProperty(\VoxelSite\Logger::class,$property))->setValue(null,$value);
    }
    \VoxelSite\Database::resetInstance();
    $db=\VoxelSite\Database::getInstance($root.'/_studio/data/studio.db');
    $db->exec("CREATE TABLE users (id INTEGER PRIMARY KEY, role TEXT, disabled_at TEXT); INSERT INTO users VALUES (1,'owner',NULL),(2,'editor',NULL)");
    $db->exec("CREATE TABLE site_workspace_state (id INTEGER PRIMARY KEY, format INTEGER, draft_version INTEGER, release_id TEXT, reservation_operation_id TEXT, updated_at INTEGER)");
    $db->exec("INSERT INTO site_workspace_state VALUES(1,2,0,NULL,NULL,0)");
    $db->exec('CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)');
    foreach (['014_agent_operation_identity','019_agent_asset_transfers'] as $migration) {
        $definition=require dirname(__DIR__,3).'/engine/migrations/'.$migration.'.php';
        ($definition['up'])($db);
    }
    file_put_contents($root.'/_studio/preview/.htaccess',\VoxelSite\SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
    $workspace=new \VoxelSite\SiteWorkspace($db,$root.'/_studio/preview',$root,$root.'/_studio/data/workspace-migration');
    $policy=new \VoxelSite\Agent\ActorPolicy($db);
    $credentials=new \VoxelSite\Agent\CredentialService($db);
    $owner=new \VoxelSite\Agent\OperationActor('user',1,null,[],'studio_configured',null);
    $keys=[];
    foreach (['writer'=>'edit','reader'=>'read','other'=>'edit'] as $name=>$preset) {
        $key=$credentials->create($owner,2,$preset,'Fixture '.$name,null);
        $keys[$name]=$policy->fromCredential($key['id']);
    }
    return [$root,$db,$workspace,$policy,$keys,$credentials,$owner];
}

function mcpCopyFixture(string $source,string $target): void
{
    if (is_dir($source)) {
        if (!is_dir($target)) mkdir($target,0700,true);
        foreach (scandir($source) as $entry) if ($entry!=='.' && $entry!=='..') mcpCopyFixture($source.'/'.$entry,$target.'/'.$entry);
    } else { copy($source,$target); }
}
