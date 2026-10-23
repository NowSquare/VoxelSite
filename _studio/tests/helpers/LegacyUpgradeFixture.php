<?php
declare(strict_types=1);
require_once __DIR__ . '/StudioRuntimeFixture.php';

// The old authentication class is loaded in a separate process, then replaced
// with the current copied class before any upgraded request is executed.
if (($argv[1] ?? '') === '--seed-legacy-upgrade') {
    $root = realpath($argv[2]);
    if (!$root || !str_starts_with($root, realpath(sys_get_temp_dir()) . '/vs-legacy-upgrade-')) throw new RuntimeException('Disposable upgrade root required.');
    require $root . '/_studio/engine/bootstrap.php';
    foreach (['logDir'=>$root.'/_studio/data', 'initialized'=>true] as $property=>$value) {
        (new ReflectionProperty(VoxelSite\Logger::class, $property))->setValue(null, $value);
    }
    $db = VoxelSite\Database::getInstance($root . '/_studio/data/studio.db');
    $frozen = dirname(__DIR__) . '/fixtures/upgrade-1.32.0';
    foreach (json_decode(file_get_contents($frozen . '/runtime-sha256.json'), true, 32, JSON_THROW_ON_ERROR) as $path=>$sha) {
        if (hash_file('sha256', $frozen . '/' . $path) !== $sha) throw new RuntimeException('Historical runtime fixture changed.');
    }
    foreach (glob($frozen . '/migrations/*.php') as $file) {
        $migration = require $file;
        $db->transaction(function () use ($migration, $db): void {
            ($migration['up'])($db);
            (new VoxelSite\Settings($db))->set('schema_version', $migration['version']);
        });
    }
    for ($id=1; $id<=(int)$argv[3]; $id++) {
        $db->insert('users', ['id'=>$id, 'name'=>'Legacy owner '.$id, 'email'=>'owner'.$id.'@example.invalid',
            'role'=>'owner', 'password_hash'=>'unusable', 'created_at'=>now(), 'updated_at'=>now()]);
    }
    $auth = new VoxelSite\AgentAuth($db);
    $keys = ['publisher'=>$auth->createKey('Legacy publisher', 'agent'),
        'reader'=>$auth->createKey('Legacy reader', 'viewer', ['pages:read']),
        'editor'=>$auth->createKey('Legacy editor', 'editor', ['pages:read','pages:write'])];
    echo json_encode(['keys'=>$keys, 'rows'=>$db->query('SELECT * FROM api_keys ORDER BY id'),
        'schema_version'=>(new VoxelSite\Settings($db))->get('schema_version')], JSON_THROW_ON_ERROR);
    exit;
}

function legacyUpgradeFixture(int $owners=1, string $assetSource='published', ?Closure $beforeMigration=null): array
{
    $root = realpath(sys_get_temp_dir()) . '/vs-legacy-upgrade-' . bin2hex(random_bytes(8));
    mkdir($root, 0700);
    VoxelSite\Tests\StudioRuntimeFixture::copy($root);
    copy(dirname(__DIR__).'/fixtures/upgrade-1.32.0/AgentAuth.php', $root.'/_studio/engine/AgentAuth.php');
    $process = proc_open([PHP_BINARY, __FILE__, '--seed-legacy-upgrade', $root, (string)$owners],
        [['pipe','r'],['pipe','w'],['pipe','w']], $pipes, $root);
    fclose($pipes[0]); $out=stream_get_contents($pipes[1]); fclose($pipes[1]);
    $err=stream_get_contents($pipes[2]); fclose($pipes[2]); $exit=proc_close($process);
    if ($exit!==0 || $err!=='') throw new RuntimeException('Legacy setup failed: '.$err);
    $legacy=json_decode($out,true,64,JSON_THROW_ON_ERROR);
    copy(dirname(__DIR__,2).'/engine/AgentAuth.php', $root.'/_studio/engine/AgentAuth.php');
    foreach (['_studio/preview','assets/css','assets/data','assets/images','assets/fonts','assets/files','assets/forms','assets/library','assets/icons'] as $path) mkdir($root.'/'.$path,0700,true);
    file_put_contents($root.'/index.php','<main>Legacy live homepage</main>');
    file_put_contents($root.'/_studio/preview/index.php','<main class="p-4">Upgraded draft homepage</main>');
    $assets=['css/style.css'=>':root { --color-primary: #123456; }', 'data/site.json'=>'{"name":"Legacy site"}',
        'images/logo.png'=>'LEGACY IMAGE', 'fonts/site.woff2'=>'LEGACY FONT', 'files/brochure.pdf'=>'LEGACY FILE',
        'forms/contact.json'=>'{"id":"contact","fields":[]}'];
    foreach ($assets as $path=>$bytes) file_put_contents($root.'/assets/'.$path,$bytes);
    file_put_contents($root.'/assets/library/untouched.png','IMMUTABLE LIBRARY');
    file_put_contents($root.'/assets/icons/untouched.svg','IMMUTABLE ICON');
    file_put_contents($root.'/hosting.txt','UNRELATED HOSTING');
    if ($assetSource==='published') symlink('../../assets',$root.'/_studio/preview/assets');
    else foreach ($assets as $path=>$bytes) {
        $target=$root.'/_studio/preview/assets/'.$path;
        if (!is_dir(dirname($target))) mkdir(dirname($target),0700,true);
        file_put_contents($target,$bytes);
    }
    $assetHashes=[];
    foreach (['css/style.css','data/site.json'] as $path) $assetHashes['assets/'.$path]=hash('sha256',$assets[$path]);
    file_put_contents($root.'/_studio/data/published-manifest.json',json_encode(['files'=>['index.php'],'asset_hashes'=>$assetHashes],JSON_THROW_ON_ERROR));
    foreach (['VS_TEST_PREVIEW_DIR'=>$root.'/_studio/preview','VS_TEST_DOC_ROOT'=>$root,'VS_TEST_ASSETS_DIR'=>$root.'/assets',
        'VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/_studio/data/workspace-migration','VS_TEST_MUTATION_LOCK'=>$root.'/_studio/data/site-mutation.lock'] as $key=>$value) putenv($key.'='.$value);
    foreach (['logDir'=>$root.'/_studio/data','initialized'=>true] as $property=>$value) (new ReflectionProperty(VoxelSite\Logger::class,$property))->setValue(null,$value);
    VoxelSite\Database::resetInstance(); $db=VoxelSite\Database::getInstance($root.'/_studio/data/studio.db');
    $settings=new VoxelSite\Settings($db);
    (new VoxelSite\Migrator($db,$settings))->run();
    $settings->setMany(['agent_api_enabled'=>true,'site_url'=>'https://upgrade.example.invalid','last_published_at'=>now()]);
    $workspace=new VoxelSite\SiteWorkspace($db,$root.'/_studio/preview',$root,$root.'/_studio/data/workspace-migration',$root.'/assets');
    if ($beforeMigration !== null) $beforeMigration($root,$db,$workspace);
    do { $migration=(new VoxelSite\WorkspaceMigration($workspace,$db))->run(2); } while ($migration['status']==='pending');
    (new VoxelSite\FileManager($db,$workspace))->syncPageRegistry(true);
    $policy=new VoxelSite\Agent\ActorPolicy($db);
    $owner=new VoxelSite\Agent\OperationActor('user',1,null,[],'studio_configured',null);
    $operations=new VoxelSite\Agent\OperationStore($db,$policy,$workspace->mutationLockPath());
    $releases=new VoxelSite\Agent\ReleaseStore($db,$policy,$root.'/_studio/data/agent/releases');
    $plans=new VoxelSite\Agent\PublishPlanService($db,$policy,$workspace,$releases,$operations);
    return compact('root','db','legacy','assets','workspace','policy','owner','operations','releases','plans');
}

function legacyUpgradeRemove(string $path): void
{
    if (is_link($path)||is_file($path)) {unlink($path); return;}
    if (!is_dir($path)) return;
    foreach (scandir($path) as $entry) if ($entry!=='.'&&$entry!=='..') legacyUpgradeRemove($path.'/'.$entry);
    rmdir($path);
}
