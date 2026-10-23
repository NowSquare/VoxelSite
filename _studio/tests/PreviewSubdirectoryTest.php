<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
use VoxelSite\{PreviewAssetRouter,PreviewRenderer};
$checks=0;$failures=0;
function psCheck(bool $ok,string $label):void {global $checks,$failures;$checks++;if(!$ok)$failures++;echo ($ok?'PASS ':'FAIL ').$label."\n";}
foreach(['/tenant','/tenant.v1','/tenant%2Ev1','/tenant&review'] as $prefix) {
    $base=$prefix.'/_studio/api/router.php?_path=%2Fpreview&path=';
    $already=$base.'about.php&lang=nl#team';
    psCheck(PreviewAssetRouter::url($already,'index.php',true,$base)===$already,$prefix.': already routed preview links are preserved');
    psCheck(PreviewAssetRouter::url($prefix.'/assets/css/site.css?v=2#sheet','index.php',false,$base)===$base.'assets/css/site.css&v=2#sheet',$prefix.': installation prefix is removed from absolute assets');
    psCheck(PreviewAssetRouter::url(rawurldecode($prefix).'/about?lang=nl#team','index.php',true,$base)===$base.'about.php&lang=nl#team',$prefix.': encoded and decoded prefixes address the same local page');
    psCheck(PreviewAssetRouter::url('/about?lang=nl#team','index.php',true,$base)===$base.'about.php&lang=nl#team',$prefix.': generated root-absolute page links stay in preview');
    psCheck(PreviewAssetRouter::url('/other/_studio/api/router.php?_path=%2Fpreview&path=secret.php','index.php',true,$base)==='/other/_studio/api/router.php?_path=%2Fpreview&path=secret.php',$prefix.': another installation is never remapped as local draft content');
    psCheck(PreviewAssetRouter::url('/tenant-other/assets/a.png','index.php',false,$base)===$base.'tenant-other/assets/a.png',$prefix.': prefix stripping requires a whole path segment');
    psCheck(PreviewAssetRouter::url('/about?path=secret.php&%76iew=manifest&_path=/settings&lang=nl','index.php',true,$base)===$base.'about.php&lang=nl',$prefix.': source queries cannot override preview routing authority');
    psCheck(PreviewAssetRouter::url('./%61bout?lang=nl#team','index.php',true,$base)===$base.'about.php&lang=nl#team',$prefix.': encoded page path is decoded exactly once');
    try {PreviewAssetRouter::url($prefix.'/%2e%2e/private','index.php',true,$base);psCheck(false,$prefix.': encoded traversal refuses to escape the installation');}
    catch(RuntimeException){psCheck(true,$prefix.': encoded traversal refuses to escape the installation');}
    $renderer=(new ReflectionClass(PreviewRenderer::class))->newInstanceWithoutConstructor();$runtime=new ReflectionMethod(PreviewRenderer::class,'runtime');
    try {$html=$runtime->invoke($renderer,'<html><head></head><body><form></form></body></html>',[], $base);psCheck(str_contains($html,htmlspecialchars($prefix.'/_studio/api/router.php?_path=%2Fpreview%2Fvalidate',ENT_QUOTES|ENT_HTML5,'UTF-8')),$prefix.': runtime defaults follow the trusted transport');}
    catch(Throwable){psCheck(false,$prefix.': runtime defaults follow the trusted transport');}
    $hot=PreviewRenderer::injectHotReload('<body></body>',$base);
    psCheck(str_contains($hot,'var PREVIEW_BASE = '.json_encode($base,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_SLASHES)),$prefix.': hot reload uses the same trusted preview transport');
}
echo "\n{$checks} checks, {$failures} failures\n";exit($failures?1:0);
