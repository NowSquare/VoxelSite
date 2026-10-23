<?php
declare(strict_types=1);

// Run only from the frozen outer source copy, never from an installed checkout.
$source=realpath(dirname(__DIR__,3));
$temporary=realpath(sys_get_temp_dir());
if(!$source || !$temporary || !str_starts_with($source,$temporary.'/vs-review-current-')
    || !is_file($source.'/disposable-source.json') || is_dir($source.'/.git')) {
    throw new RuntimeException('Studio browser review requires a disposable frozen source copy.');
}
$port=filter_var($argv[1]??null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1024,'max_range'=>65535]]);
if(!$port)throw new RuntimeException('Pass a localhost test port.');
require __DIR__.'/StudioRuntimeFixture.php';
$root=$temporary.'/vs-studio-review-'.bin2hex(random_bytes(6));
mkdir($root,0700);$root=realpath($root);
mkdir($root.'/site',0700);
function reviewCopy(string $from,string $to):void {
    if(is_link($from)||is_link($to))throw new RuntimeException('Review fixtures refuse symbolic links.');
    if(is_file($from)){
        if(!is_dir(dirname($to)))mkdir(dirname($to),0700,true);
        if(!copy($from,$to))throw new RuntimeException('Cannot copy review fixture file.');
        return;
    }
    if(!is_dir($from))throw new RuntimeException('Missing fixture source: '.$from);
    if(!is_dir($to))mkdir($to,0700,true);
    foreach(scandir($from) as $name)if($name!=='.'&&$name!=='..')reviewCopy($from.'/'.$name,$to.'/'.$name);
}
VoxelSite\Tests\StudioRuntimeFixture::copy($root.'/site',$source);
reviewCopy($source.'/_studio/ui',$root.'/site/_studio/ui');
foreach(['_studio/data/logs','_studio/data/actions','_studio/preview/assets','assets'] as $path)
    if(!is_dir($root.'/site/'.$path))mkdir($root.'/site/'.$path,0700,true);
reviewCopy(__DIR__.'/../fixtures/mcp/site-lifecycle/site',$root.'/site/_studio/preview');
copy($source.'/_studio/static/form-handler.js',$root.'/site/_studio/preview/assets/js/form-handler.js');
copy(__DIR__.'/lifecycle-provider-trap.php',$root.'/provider-trap.php');
copy(__DIR__.'/studio-review-router.php',$root.'/router.php');
file_put_contents($root.'/.studio-review-fixture','Disposable browser review only.');
require $root.'/site/_studio/engine/bootstrap.php';
if(!str_starts_with((new ReflectionClass(VoxelSite\Database::class))->getFileName(),$root.'/site/'))
    throw new RuntimeException('Review runtime escaped the disposable installation.');
$db=VoxelSite\Database::getInstance();
$settings=new VoxelSite\Settings($db);
(new VoxelSite\Migrator($db,$settings))->run();
(new VoxelSite\Auth($db))->createUser('Review owner','review@example.invalid','Disposable-review-2026!','owner');
file_put_contents($root.'/site/_studio/data/config.json',json_encode(['app_key'=>VoxelSite\Encryption::generateKey()],JSON_THROW_ON_ERROR));
$db->update('site_workspace_state',['format'=>2],'id = 1');
file_put_contents($root.'/site/_studio/preview/.htaccess',VoxelSite\SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
$base='http://127.0.0.1:'.$port.'/review';
$settings->setMany(['site_url'=>$base,'workspace_base_url'=>$base,'site_name'=>'Workshop review',
    'studio_mcp_enabled'=>true,'ai_setup_mode'=>'external']);
(new VoxelSite\FileManager($db,new VoxelSite\SiteWorkspace($db)))->syncPageRegistry(true);
$metadata=['root'=>$root,'url'=>$base.'/_studio/','source'=>$source,
    'source_sha256'=>json_decode(file_get_contents($source.'/disposable-source.json'),true)['sha256'],
    'bundle_sha256'=>hash_file('sha256',$root.'/site/_studio/ui/dist/studio.js'),
    'css_sha256'=>hash_file('sha256',$root.'/site/_studio/ui/dist/studio.css'),'created_at'=>gmdate('c')];
file_put_contents($root.'/fixture.json',json_encode($metadata,JSON_THROW_ON_ERROR|JSON_PRETTY_PRINT)."\n");
echo json_encode($metadata,JSON_THROW_ON_ERROR|JSON_UNESCAPED_SLASHES)."\n";
