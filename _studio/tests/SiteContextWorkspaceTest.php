<?php
declare(strict_types=1);
require dirname(__DIR__) . '/engine/bootstrap.php';
require __DIR__ . '/helpers/SiteControlFixture.php';
require __DIR__ . '/helpers/RouterHeadingFixture.php';

$root=sys_get_temp_dir().'/vs-context-workspace-'.bin2hex(random_bytes(8));
[$db,$files]=createSiteControlFixture($root);$root=realpath($root);
$checks=0; $failures=[];
function contextCheck(bool $ok,string $message):void {global $checks,$failures;$checks++;if(!$ok)$failures[]=$message;echo ($ok?'PASS ':'FAIL ').$message."\n";}
try {
    foreach (['data','images','forms','fonts'] as $dir) mkdir($root.'/preview/assets/'.$dir,0700,true);
    foreach (['data','images','icons','library/gallery','fonts'] as $dir) mkdir($root.'/published/assets/'.$dir,0700,true);
    file_put_contents($root.'/preview/assets/data/site.json',json_encode(['fact'=>'DRAFT_FACT_ONLY']));
    file_put_contents($root.'/preview/assets/data/only-private.json',json_encode(['fact'=>'PRIVATE_FILE_ONLY']));
    file_put_contents($root.'/preview/assets/data/memory.json',json_encode(['fact'=>['value'=>'DRAFT_MEMORY_ONLY','confidence'=>'stated']]));
    file_put_contents($root.'/preview/assets/data/design-intelligence.json',json_encode(['direction'=>'DRAFT_DESIGN_ONLY']));
    file_put_contents($root.'/published/assets/data/site.json',json_encode(['fact'=>'LIVE_FACT_FORBIDDEN']));
    file_put_contents($root.'/published/assets/data/only-live.json',json_encode(['fact'=>'LIVE_FILE_FORBIDDEN']));
    file_put_contents($root.'/published/assets/data/memory.json',json_encode(['fact'=>'LIVE_MEMORY_FORBIDDEN']));
    file_put_contents($root.'/published/assets/data/design-intelligence.json',json_encode(['direction'=>'LIVE_DESIGN_FORBIDDEN']));
    mkdir($root.'/published/assets/forms');
    file_put_contents($root.'/published/assets/forms/contact.json',json_encode(['name'=>'LIVE_FORM_FORBIDDEN']));
    file_put_contents($root.'/preview/assets/images/draft-photo.png','draft image');
    file_put_contents($root.'/published/assets/images/live-photo.png','live image');
    file_put_contents($root.'/preview/assets/fonts/draft-font.woff2','draft font');
    file_put_contents($root.'/published/assets/fonts/live-font.woff2','live font');
    file_put_contents($root.'/published/assets/icons/fixture.svg','<svg></svg>');
    file_put_contents($root.'/published/assets/library/gallery/vs-gal_bakery_food_warm_low.webp','shipped image');
    file_put_contents($root.'/preview/assets/forms/contact.json',json_encode(['id'=>'contact','name'=>'DRAFT_FORM_ONLY','fields'=>[['name'=>'email','label'=>'Email','type'=>'email']]]));
    $context=(new VoxelSite\SiteContext($db,new VoxelSite\Settings($db),$files))->build()['context'];
    foreach (['DRAFT_FACT_ONLY','PRIVATE_FILE_ONLY','DRAFT_MEMORY_ONLY','DRAFT_DESIGN_ONLY','/assets/images/draft-photo.png','/assets/fonts/draft-font.woff2','DRAFT_FORM_ONLY','1 Lucide SVG icons','vs-gal_bakery_food_warm_low.webp'] as $value) contextCheck(str_contains($context,$value),'Context retains draft/immutable source '.$value);
    foreach (['LIVE_FACT_FORBIDDEN','LIVE_FILE_FORBIDDEN','LIVE_MEMORY_FORBIDDEN','LIVE_DESIGN_FORBIDDEN','LIVE_FORM_FORBIDDEN','/assets/images/live-photo.png','/assets/fonts/live-font.woff2'] as $value) contextCheck(!str_contains($context,$value),'Context excludes published mutable source '.$value);
    contextCheck(str_contains($context,'#123456'),'Design tokens come from the injected private draft');
    $focused=(new VoxelSite\RouterContext($db,new VoxelSite\Settings($db),$files))->focused(['file_path'=>'index.php'],100000);
    contextCheck(str_contains($focused['context']??'','PRIVATE_FILE_ONLY') && !str_contains($focused['context']??'','LIVE_FILE_FORBIDDEN'),
        'Focused routing enumerates private-only data names from its injected workspace');
    mkdir($root.'/preview/services');
    file_put_contents($root.'/preview/services/team.php', "<?php \$data=json_decode(file_get_contents(dirname(__DIR__) . '/assets/data/only-private.json'),true); ?><h1 class=\"text-draft-only\">Team</h1>");
    file_put_contents($root.'/preview/assets/css/style.css',':root { --color-primary:#123456; --color-draft-only:#abcdef; }');
    mkdir($root.'/published/assets/css'); file_put_contents($root.'/published/assets/css/style.css',':root { --color-live-only:#fedcba; }');
    $graph=(new VoxelSite\SiteGraphIndexer($db,$files))->buildGraph();
    contextCheck(array_column($graph->getTokenConsumers('token:--color-draft-only'),'id')===['page:services/team.php'],
        'Token utility consumers resolve the private theme rather than the published theme');
    $siteContext=new VoxelSite\SiteContext($db,new VoxelSite\Settings($db),$files);
    $dependencies=(new ReflectionMethod($siteContext,'scanPageDataDependencies'))->invoke($siteContext);
    contextCheck(($dependencies['services/team.php']??[])===['assets/data/only-private.json'],
        'Nested pages retain their source path and private data dependency');
    file_put_contents($root.'/preview/_partials/nav.php','<a href="/draft-missing">Missing</a><a href="/about">Existing</a>');
    $prompt=new VoxelSite\PromptEngine($db,new VoxelSite\Settings($db),fileManager:$files);
    contextCheck((new ReflectionMethod($prompt,'findMissingNavPages'))->invoke($prompt)===['draft-missing.php'],
        'Missing-navigation diagnostics read the injected draft');
    foreach (['second/draft/assets','second/live/assets/library/gallery','second/state'] as $path) mkdir($root.'/'.$path,0700,true);
    file_put_contents($root.'/second/draft/.htaccess',VoxelSite\SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
    file_put_contents($root.'/second/live/assets/library/gallery/vs-gal_forest_nature_cool_high.webp','second immutable image');
    $secondFiles=new VoxelSite\FileManager($db,new VoxelSite\SiteWorkspace($db,$root.'/second/draft',$root.'/second/live',$root.'/second/state',$root.'/second/live/assets'));
    $second=(new VoxelSite\SiteContext($db,new VoxelSite\Settings($db),$secondFiles))->build()['context'];
    contextCheck(str_contains($second,'vs-gal_forest_nature_cool_high.webp') && !str_contains($second,'vs-gal_bakery_food_warm_low.webp'),
        'Separate context instances cannot reuse another workspace image library');
    file_put_contents($root.'/outside.json','{"secret":"OUTSIDE_CONTEXT_FORBIDDEN"}');
    foreach (['assets/data/memory.json'=>'buildSiteMemory','assets/data/design-intelligence.json'=>'buildDesignIntelligence',
        'assets/data/only-private.json'=>'buildDataLayer','assets/forms/contact.json'=>'buildFormSchemas'] as $path=>$method) {
        $absolute=$root.'/preview/'.$path; $original=file_get_contents($absolute); unlink($absolute); symlink($root.'/outside.json',$absolute); $rejected=false;
        try {(new ReflectionMethod($siteContext,$method))->invoke($siteContext);} catch(RuntimeException){$rejected=true;}
        finally {unlink($absolute);file_put_contents($absolute,$original);}
        contextCheck($rejected,'Managed context read refuses a symlink: '.$path);
    }
    echo "$checks context workspace checks, ".count($failures)." failed\n";
} finally {VoxelSite\Database::closeInstance();VoxelSite\Tests\RouterHeadingFixture::remove($root);}
exit($failures?1:0);
