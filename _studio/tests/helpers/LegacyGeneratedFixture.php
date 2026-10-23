<?php
declare(strict_types=1);

if (($argv[1] ?? '') === '--generate-legacy-aeo') {
    $root=realpath($argv[2]??'');
    if(!$root || !str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-legacy-upgrade-'))throw new RuntimeException('Disposable legacy root required.');
    require $root.'/_studio/engine/bootstrap.php';
    $historical=dirname(__DIR__).'/fixtures/upgrade-1.32.0/AEOGenerator.php';
    if(hash_file('sha256',$historical)!=='2497a33f347805cb01d430dd9d0a4a1b03c2f2494e61d7eff7b6585d44d06589')throw new RuntimeException('Historical generator changed.');
    require $historical;
    VoxelSite\Database::getInstance($root.'/_studio/data/studio.db');
    $generator=new VoxelSite\AEOGenerator();
    foreach(['assetsPath'=>$root.'/assets','previewPath'=>$root.'/_studio/preview','docRoot'=>$root] as $key=>$value)(new ReflectionProperty($generator,$key))->setValue($generator,$value);
    $url=(new VoxelSite\Settings())->get('site_url');
    foreach(['_partials/schema.php'=>$generator->generateSchemaPartial(),'mcp.php'=>$generator->generateMcpServer(),
        'robots.txt'=>$generator->generateRobotsTxt($url),'sitemap.xml'=>$generator->generateSitemapXml($url)] as $path=>$bytes)file_put_contents($root.'/'.$path,$bytes);
    copy($root.'/_partials/schema.php',$root.'/_studio/preview/_partials/schema.php');
    exit;
}

if (($argv[1] ?? '') === '--crash-generated-seal') {
    $root=realpath($argv[2]??'');
    if(!$root || !str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-legacy-upgrade-'))exit(91);
    require $root.'/_studio/engine/bootstrap.php';
    putenv('VS_TEST_MUTATION_LOCK='.$root.'/_studio/data/site-mutation.lock');
    $db=VoxelSite\Database::getInstance($root.'/_studio/data/studio.db');
    $workspace=new VoxelSite\SiteWorkspace($db,$root.'/_studio/preview',$root,$root.'/_studio/data/workspace-migration',$root.'/assets');
    $migration=new class($workspace,$db) extends VoxelSite\WorkspaceMigration {
        public string $phase='generated_sealed';
        protected function checkpoint(string $stage,array $manifest):void {if($stage===$this->phase)exit(88);}
    };
    $migration->phase=($argv[3]??'generated_sealed');
    $migration->run(2);exit(92);
}

require_once __DIR__.'/LegacyUpgradeFixture.php';

/** The real old generator runs before activation; current publisher is not an oracle. */
function legacyGeneratedFixture(?callable $beforeMigration=null):array
{
    return legacyUpgradeFixture(1,'published',static function(string $root,VoxelSite\Database $db,VoxelSite\SiteWorkspace $workspace)use($beforeMigration):void {
        foreach(['_partials','_studio/preview/_partials','_studio/preview/services'] as $dir)mkdir($root.'/'.$dir,0700,true);
        file_put_contents($root.'/_studio/preview/services/repairs.php','<h1>Legacy repair service</h1>');
        foreach(['index','services/repairs'] as $position=>$slug)$db->insert('pages',['slug'=>$slug,'title'=>$slug,'file_path'=>$slug.'.php','nav_order'=>$position,'is_published'=>1,'created_at'=>now(),'updated_at'=>now()]);
        $manifestPath=$root.'/_studio/data/published-manifest.json';$manifest=json_decode(file_get_contents($manifestPath),true);
        $manifest['updated_at']=now();file_put_contents($manifestPath,json_encode($manifest));
        (new VoxelSite\Settings($db))->set('last_published_at',$manifest['updated_at']);
        $process=proc_open([PHP_BINARY,__FILE__,'--generate-legacy-aeo',$root],[['pipe','r'],['pipe','w'],['pipe','w']],$pipes,$root);
        fclose($pipes[0]);$out=stream_get_contents($pipes[1]);fclose($pipes[1]);$err=stream_get_contents($pipes[2]);fclose($pipes[2]);$exit=proc_close($process);
        if($exit!==0||$out!==''||$err!=='')throw new RuntimeException('Historical generation failed: '.$out.$err);
        // The real updater replaces this shipped root handler, independently of AEO.
        copy(dirname(__DIR__,3).'/submit.php',$root.'/submit.php');
        if(hash_file('sha256',$root.'/submit.php')!=='6cb302a2cba0814dbca05d2ea8446ab9bff526e4f25a5efdd2c080c8394434d3')throw new RuntimeException('Shipped root handler changed.');
        if($beforeMigration!==null)$beforeMigration($root,$db,$workspace);
    });
}
