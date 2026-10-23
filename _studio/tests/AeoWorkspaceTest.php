<?php
declare(strict_types=1);
require_once __DIR__.'/helpers/RouterLegacyBenchmark.php';

use VoxelSite\Tests\RouterLegacyBenchmark;

$checks=0;
function aeoCheck(bool $ok,string $message):void {
    global $checks;
    if(!$ok)throw new RuntimeException('FAIL '.$message);
    $checks++;echo 'PASS '.$message."\n";
}

$result=RouterLegacyBenchmark::run('inline_edit');
$changes=$result['file_changes']??[];
$changed=[];
foreach($changes as $bucket)foreach($bucket as $path=>$value)$changed[]=$path;
aeoCheck($changed!==[], 'The real legacy AI fixture executes a file change');
aeoCheck(array_filter($changed,fn($path)=>str_starts_with($path,'public/') || str_starts_with($path,'assets/'))===[],
    'Legacy AI edits leave every published file and asset unchanged');
aeoCheck(isset($result['files']['preview/_partials/schema.php']),'AI generation refreshes the private schema partial');
foreach(['llms.txt','robots.txt','mcp.php'] as $path) {
    aeoCheck(($result['files']['preview/'.$path]??null)===($result['before_files']['preview/'.$path]??null),
        'AI generation leaves '.$path.' for reviewed publish preparation');
}

require_once dirname(__DIR__).'/engine/bootstrap.php';
use VoxelSite\{AEOGenerator,Database,FileManager,Logger,Migrator,PromptEngine,Settings,SiteWorkspace};
use VoxelSite\Tests\RouterHeadingFixture;
$root=realpath(sys_get_temp_dir()).'/vs-aeo-workspace-'.bin2hex(random_bytes(6));
foreach(['draft/assets/data','draft/_partials','live/assets/data','private','actions','stage/assets/data','stage/_partials'] as $dir)mkdir($root.'/'.$dir,0700,true);
foreach(['VS_TEST_PREVIEW_DIR'=>$root.'/draft','VS_TEST_ASSETS_DIR'=>$root.'/live/assets','VS_TEST_DOC_ROOT'=>$root.'/live',
    'VS_TEST_MUTATION_LOCK'=>$root.'/private/site.lock','VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/private/state'] as $key=>$value)putenv($key.'='.$value);
foreach(['logDir'=>$root.'/private','initialized'=>true] as $key=>$value)(new ReflectionProperty(Logger::class,$key))->setValue(null,$value);
$db=Database::getInstance($root.'/private/studio.db');(new Migrator($db,new Settings($db)))->run();
$db->update('site_workspace_state',['format'=>2],'id=1');
try {
    foreach(['draft'=>'Draft source','live'=>'Published sentinel','stage'=>'Staged source'] as $dir=>$name) {
        file_put_contents($root.'/'.$dir.'/assets/data/site.json',json_encode(['name'=>$name]));
        if($dir==='live')continue;
        file_put_contents($root.'/'.$dir.'/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
        file_put_contents($root.'/'.$dir.'/_partials/header.php','<!doctype html><html><head></head><body>');
        file_put_contents($root.'/'.$dir.'/index.php','<?php include __DIR__."/_partials/header.php"; ?>');
    }
    $db->insert('pages',['slug'=>'index','title'=>'Home','file_path'=>'index.php','created_at'=>now(),'updated_at'=>now()]);
    $liveBefore=SiteWorkspace::inventory($root.'/live');
    $generator=new AEOGenerator(actionsPath:$root.'/actions',database:$db);
    $generator->generateAll('https://example.invalid');
    aeoCheck(!is_file($root.'/draft/llms.txt') && !is_file($root.'/draft/mcp.php'),'Default generator leaves public-only artifacts outside the authored draft');
    aeoCheck(SiteWorkspace::inventory($root.'/live')===$liveBefore,'Default generator cannot modify the public document root');
    aeoCheck((new SiteWorkspace($db))->status()['draft_version']===1,'Standalone draft generation invalidates prior draft reviews');
    $_SERVER['DOCUMENT_ROOT']=$root.'/live';
    ob_start();include $root.'/draft/_partials/schema.php';$rendered=ob_get_clean();
    aeoCheck(str_contains($rendered,'Draft source') && !str_contains($rendered,'Published sentinel'),'Generated schema reads the containing site rather than server document root');
    aeoCheck(substr_count(file_get_contents($root.'/draft/_partials/header.php'),'schema.php')===2,'Header includes schema exactly once');
    $draftBefore=SiteWorkspace::inventory($root.'/draft');
    $stagedWorkspace=new SiteWorkspace($db,$root.'/stage',$root.'/live',$root.'/private/stage-state',tracksDraftVersion:false);
    $engine=new PromptEngine($db,fileManager:new FileManager($db,$stagedWorkspace));
    (new ReflectionProperty(PromptEngine::class,'headless'))->setValue($engine,true);
    (new ReflectionMethod(PromptEngine::class,'autoRegenerateAEO'))->invoke($engine,[['path'=>'index.php']]);
    aeoCheck(is_file($root.'/stage/_partials/schema.php')
        && SiteWorkspace::inventory($root.'/draft')===$draftBefore,'Injected FileManager workspace remains authoritative for AI derived output');
    aeoCheck(isset(\VoxelSite\Agent\WorkspaceFiles::read(new SiteWorkspace($db))['_partials/schema.php']),
        'AI schema refresh leaves the draft readable by reviewed MCP operations');
    $candidate=new AEOGenerator($root.'/stage/assets',$root.'/stage',$root.'/stage',$root.'/actions',$db);
    $candidate->generateAll('https://example.invalid/subdir');
    aeoCheck(is_file($root.'/stage/sitemap.xml') && str_contains(file_get_contents($root.'/stage/sitemap.xml'),'https://example.invalid/subdir/'),'Explicit retained publish candidate still materializes AEO files');
    unlink($root.'/stage/_partials/header.php');unlink($root.'/stage/_partials/schema.php');rmdir($root.'/stage/_partials');
    mkdir($root.'/live/_partials');file_put_contents($root.'/live/_partials/header.php','<head>LIVE</head>');
    symlink($root.'/live/_partials',$root.'/stage/_partials');
    $liveBefore=SiteWorkspace::inventory($root.'/live');$rejected=false;
    try{$candidate->generateAll();}catch(RuntimeException){$rejected=true;}
    aeoCheck($rejected && SiteWorkspace::inventory($root.'/live')===$liveBefore,'Generated output rejects a symlinked partial directory before touching live bytes');
    unlink($root.'/stage/_partials');
    $db->update('site_workspace_state',['format'=>1],'id=1');$rejected=false;
    try{new AEOGenerator(database:$db);}catch(RuntimeException){$rejected=true;}
    aeoCheck($rejected,'Default generator refuses an unmigrated workspace');
} finally { Database::resetInstance();RouterHeadingFixture::remove($root); }
echo "$checks AEO workspace checks passed\n";
