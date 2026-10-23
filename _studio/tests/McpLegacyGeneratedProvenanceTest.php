<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
require __DIR__.'/helpers/LegacyGeneratedFixture.php';
use VoxelSite\{Database,WorkspaceMigration};
$checks=0;$failures=[];$roots=[];
function generatedCheck(bool $ok,string $label):void {global $checks,$failures;$checks++;if(!$ok)$failures[]=$label;echo($ok?'PASS ':'FAIL ').$label."\n";}
function generatedFixture(?callable $callback=null):array {global $roots;return legacyGeneratedFixture(static function($root,$db,$workspace)use($callback,&$roots):void{$roots[]=$root;if($callback!==null)$callback($root,$db,$workspace);});}
function generatedHashes(array $f):array {return method_exists(WorkspaceMigration::class,'publishedGeneratedHashes')?(new WorkspaceMigration($f['workspace'],$f['db']))->publishedGeneratedHashes():[];}
try {
    $f=generatedFixture();$expected=[];
    foreach(['_partials/schema.php','mcp.php','robots.txt','sitemap.xml','submit.php'] as $path)$expected[$path]=hash_file('sha256',$f['root'].'/'.$path);
    ksort($expected);
    generatedCheck(generatedHashes($f)===$expected,'Activation retains exact independently recognized legacy generated and shipped output hashes');
    generatedCheck(str_contains(file_get_contents($f['root'].'/sitemap.xml'),'/services/repairs</loc>')&&!in_array('services/repairs.php',json_decode(file_get_contents($f['root'].'/_studio/data/published-manifest.json'),true)['files'],true),'Historical generator fixture reproduces private nested sitemap route omitted from old publication inventory');
    $proof=json_decode(file_get_contents($f['workspace']->migrationRoot().'/manifest.json'),true);
    generatedCheck(isset($proof['generated_publication']),'Recognition is retained during explicit migration, before any new publish candidate');
    file_put_contents($f['workspace']->draftRoot().'/index.php','<h1>Later private revision</h1>');
    (new VoxelSite\Settings($f['db']))->set('site_url','https://changed.example.invalid');
    $f['db']->update('pages',['title'=>'Later title','nav_order'=>99],'slug=?',['index']);
    generatedCheck(generatedHashes($f)===$expected,'Later draft/config/page changes cannot redefine retained legacy ownership');
    foreach(['robots directive'=>['robots.txt',fn($s)=>str_replace('Allow: /','Disallow: /',$s)],
        'sitemap URL'=>['sitemap.xml',fn($s)=>str_replace('upgrade.example.invalid','other.example.invalid',$s)],
        'sitemap date'=>['sitemap.xml',fn($s)=>preg_replace('#<lastmod>[^<]+</lastmod>#','<lastmod>2001-01-01</lastmod>',$s)],
        'sitemap priority'=>['sitemap.xml',fn($s)=>str_replace('<priority>0.8</priority>','<priority>0.9</priority>',$s)],
        'sitemap order'=>['sitemap.xml',function($s){preg_match_all('#  <url>.*?  </url>\n#s',$s,$matches);return str_replace(implode('',$matches[0]),implode('',array_reverse($matches[0])),$s);}],
        'sitemap element'=>['sitemap.xml',fn($s)=>str_replace('</urlset>','<extra />'."\n".'</urlset>',$s)],
        'custom PHP'=>['mcp.php',fn($s)=>$s."\n// Local customization"]] as $label=>[$path,$change]) {
        $f=generatedFixture(static fn($root)=>file_put_contents($root.'/'.$path,$change(file_get_contents($root.'/'.$path))));
        generatedCheck(!isset(generatedHashes($f)[$path]),'Unknown output is not adopted: '.$label);
    }
    $f=generatedFixture(static function($root,$db):void{(new VoxelSite\Settings($db))->delete('last_published_at');});
    generatedCheck(generatedHashes($f)===[],'Known output bytes alone without legacy publication state confer no ownership');
    $f=generatedFixture(static function($root):void{unlink($root.'/_studio/data/published-manifest.json');});
    generatedCheck(generatedHashes($f)===[],'No old publication manifest means no generated output adoption');
    $f=generatedFixture();$path=$f['workspace']->migrationRoot().'/manifest.json';$proof=json_decode(file_get_contents($path),true);
    unset($proof['generated_publication']);file_put_contents($path,json_encode($proof));
    generatedCheck(generatedHashes($f)===[],'Missing receipt never performs late recognition from current bytes');
    $f=generatedFixture();$path=$f['workspace']->migrationRoot().'/manifest.json';$proof=json_decode(file_get_contents($path),true);
    $proof['generated_publication']['inputs']['base_url']='https://forged.example.invalid';
    foreach(['robots.txt','sitemap.xml'] as $output)$proof['generated_publication']['files'][$output]=hash('sha256',str_replace('https://upgrade.example.invalid','https://forged.example.invalid',file_get_contents($f['root'].'/'.$output)));
    file_put_contents($path,json_encode($proof));
    try{generatedHashes($f);generatedCheck(false,'Replacing recipe inputs and corresponding hashes cannot replace the activation seal');}
    catch(RuntimeException){generatedCheck(true,'Replacing recipe inputs and corresponding hashes cannot replace the activation seal');}
    foreach(['invalid date'=>static function($root):void{$path=$root.'/_studio/data/published-manifest.json';$m=json_decode(file_get_contents($path),true);$m['updated_at']='2026-02-30T12:00:00Z';file_put_contents($path,json_encode($m));},
        'site ownership mismatch'=>static function($root):void{file_put_contents($root.'/assets/data/site.json','{"name":"Unproven edited site"}');},
        'URL controls'=>static function($root,$db):void{(new VoxelSite\Settings($db))->set('site_url',"https://upgrade.example.invalid/\nextra");}] as $label=>$edit) {
        $f=generatedFixture($edit);generatedCheck(generatedHashes($f)===[],'Insufficient independent inputs confer no ownership: '.$label);
    }
    foreach(['linked output'=>static function($root):void{rename($root.'/robots.txt',$root.'/custom-robots.txt');symlink($root.'/custom-robots.txt',$root.'/robots.txt');},
        'oversized output'=>static function($root):void{file_put_contents($root.'/robots.txt',str_repeat('x',1048577));},
        'oversized route inventory'=>static function($root,$db):void{for($i=0;$i<500;$i++)$db->insert('pages',['slug'=>'extra-'.$i,'title'=>'Extra','file_path'=>'extra-'.$i.'.php','created_at'=>now(),'updated_at'=>now()]);}] as $label=>$edit) {
        try{generatedFixture($edit);generatedCheck(false,'Unsafe capture source is refused: '.$label);}
        catch(RuntimeException){generatedCheck(true,'Unsafe capture source is refused: '.$label);}
    }
    $f=generatedFixture();$path=$f['workspace']->migrationRoot().'/manifest.json';$original=file_get_contents($path);
    (new VoxelSite\Settings($f['db']))->delete('workspace_legacy_generated_seal');
    try{generatedHashes($f);generatedCheck(false,'Unsealed nonempty receipt is refused without late recapture');}
    catch(RuntimeException){generatedCheck(file_get_contents($path)===$original,'Unsealed nonempty receipt is refused without late recapture');}
    $f=generatedFixture(static function($root,$db,$workspace):void{
        $process=proc_open([PHP_BINARY,__DIR__.'/helpers/LegacyGeneratedFixture.php','--crash-generated-seal',$root],[['pipe','r'],['pipe','w'],['pipe','w']],$pipes,$root);
        fclose($pipes[0]);$out=stream_get_contents($pipes[1]);fclose($pipes[1]);$err=stream_get_contents($pipes[2]);fclose($pipes[2]);$exit=proc_close($process);
        generatedCheck($exit===88&&$out===''&&$err===''&&$workspace->status()['format']===1,'Child process exits after independent seal retention, before activation');
    });
    generatedCheck(count(generatedHashes($f))===5&&$f['workspace']->status()['ready'],'Fresh migration continuation uses the already sealed recognition after process loss');
    $f=generatedFixture(static function($root,$db,$workspace):void{
        $process=proc_open([PHP_BINARY,__DIR__.'/helpers/LegacyGeneratedFixture.php','--crash-generated-seal',$root,'generated_manifest_retained'],[['pipe','r'],['pipe','w'],['pipe','w']],$pipes,$root);
        fclose($pipes[0]);$out=stream_get_contents($pipes[1]);fclose($pipes[1]);$err=stream_get_contents($pipes[2]);fclose($pipes[2]);$exit=proc_close($process);
        generatedCheck($exit===88&&$out===''&&$err===''&&(new VoxelSite\Settings($db))->get('workspace_legacy_generated_seal')===null,'Child process exits after manifest retention and before independent DB seal');
        $migration=new WorkspaceMigration($workspace,$db);
        try{$migration->run(2);generatedCheck(false,'Unsealed interrupted capture cannot be silently resealed');}
        catch(RuntimeException){generatedCheck(is_link($workspace->draftAssetsRoot())&&$workspace->status()['format']===1,'Unsealed interrupted capture cannot be silently resealed');}
        generatedCheck($migration->rollback()['status']==='rolled_back','Explicit rollback clears an interrupted unsealed capture');
    });
    generatedCheck(count(generatedHashes($f))===5,'Migration may recognize original outputs again only after explicit rollback');
    $capturedRoot=null;
    try{generatedFixture(static function($root,$db,$workspace)use(&$capturedRoot):void{
        $capturedRoot=$root;
        $migration=new class($workspace,$db) extends WorkspaceMigration {
            protected function checkpoint(string $stage,array $manifest):void {if($stage==='generated_sealed')file_put_contents($this->output,'CUSTOM AFTER CAPTURE');}
            public string $output;
        };
        $migration->output=$root.'/robots.txt';$migration->run(1);
    });generatedCheck(false,'Live drift after capture is refused before private asset activation');}
    catch(RuntimeException){generatedCheck(is_string($capturedRoot)&&is_link($capturedRoot.'/_studio/preview/assets')&&file_get_contents($capturedRoot.'/robots.txt')==='CUSTOM AFTER CAPTURE','Live drift after capture is refused before private asset activation');}
    $f=generatedFixture();(new WorkspaceMigration($f['workspace'],$f['db']))->rollback();
    generatedCheck((new VoxelSite\Settings($f['db']))->get('workspace_legacy_generated_seal')===null&&generatedHashes($f)===[],'Explicit rollback removes receipt and its independent seal');
    echo "$checks legacy generated provenance checks, ".count($failures)." failures\n";
} finally {Database::resetInstance();foreach($roots as $root)legacyUpgradeRemove($root);}
exit($failures?1:0);
