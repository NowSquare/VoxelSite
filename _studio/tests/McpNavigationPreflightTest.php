<?php
declare(strict_types=1);
require __DIR__.'/McpApplicationTest.php';
use VoxelSite\Agent\CanonicalJson;
function navStudio(string $root,string $page):array{
    $process=proc_open([PHP_BINARY,__DIR__.'/helpers/call-navigation-preflight.php',$root,$page],[['pipe','r'],['pipe','w'],['pipe','w']],$pipes,$root);
    fclose($pipes[0]);$out=stream_get_contents($pipes[1]);fclose($pipes[1]);$error=stream_get_contents($pipes[2]);fclose($pipes[2]);
    if(proc_close($process)!==0||$error!=='')throw new RuntimeException($error.$out);return json_decode($out,true,32,JSON_THROW_ON_ERROR);
}
$response=$call('tools/call',['name'=>'voxelsite_structure_navigation','arguments'=>(object)['page_file'=>'about.php']],$readKey);
appCheck($response['status']===200&&!($response['body']['result']['isError']??true),'Navigation preflight has its own exact typed read');
$path=$root.'/draft/_partials/nav.php';$original=file_get_contents($path);
$canonical="<?php\n\$navLinks = [['href'=>'/','label'=>'Home','home'=>true],['href'=>'/about','label'=>'About','children'=>[['href'=>'/child','label'=>'Child']]]]; ?>";
foreach(['canonical'=>$canonical,'nav_parse_error'=>"<?php\n\$navLinks = [['href'=>getRoute('about'),'label'=>'About']]; ?>",
    'needs_normalization'=>'<nav><a href="/">Home</a><a href="/about">About</a></nav>',
    'unsupported_layout'=>'<nav></nav><nav></nav><nav><a href="/about">About</a></nav>','nav_missing'=>null] as $expected=>$source){
    if($source===null)unlink($path);else file_put_contents($path,$source);
    $before=[$db->query('SELECT * FROM pages ORDER BY id'),$workspace->status(),$db->count('revisions'),$db->count('agent_operations')];
    $read=$tool('voxelsite_structure_navigation',['page_file'=>'about.php'],$readKey);$studio=navStudio($root,'page:about.php');
    if($read['navStatus']!==$expected||$studio['status']!==200||CanonicalJson::digest($studio['response']['data']??null)!==CanonicalJson::digest($read))fwrite(STDERR,json_encode(['expected'=>$expected,'mcp'=>$read,'studio'=>$studio])."\n");
    appCheck($read['navStatus']===$expected&&$studio['status']===200&&CanonicalJson::digest($studio['response']['data'])===CanonicalJson::digest($read),'Exact Studio and MCP navigation taxonomy: '.$expected);
    appCheck($before===[$db->query('SELECT * FROM pages ORDER BY id'),$workspace->status(),$db->count('revisions'),$db->count('agent_operations')]
        &&($source===null?!file_exists($path):file_get_contents($path)===$source),'Navigation inspection never normalizes source, syncs pages or changes history: '.$expected);
    if($expected==='canonical')appCheck($read['isInNav']&&$read['hasHomeEntry']&&$read['currentPosition']===['parentHref'=>null,'index'=>0,'siblingCount'=>1]
        &&count($read['navTree'])===1,'Canonical inspection preserves pinned Home, movable tree and exact position');
}
file_put_contents($path,$canonical);$home=$tool('voxelsite_structure_navigation',['page_file'=>'index.php'],$readKey);
appCheck($home['isHomepage']&&$home['isInNav']&&$home['currentPosition']===null,'Home is explicitly pinned outside the movable position list');
appCheck($call('tools/call',['name'=>'voxelsite_structure_navigation','arguments'=>(object)['page_file'=>'missing.php']],$readKey)['body']['result']['isError']??false,'Missing page is an explicit refusal');
file_put_contents($path,str_repeat('x',1048577));appCheck($call('tools/call',['name'=>'voxelsite_structure_navigation','arguments'=>(object)['page_file'=>'about.php']],$readKey)['body']['result']['isError']??false,'Oversized navigation is refused before parsing');
unlink($path);file_put_contents($root.'/outside-nav.php',$canonical);symlink($root.'/outside-nav.php',$path);
appCheck($call('tools/call',['name'=>'voxelsite_structure_navigation','arguments'=>(object)['page_file'=>'about.php']],$readKey)['body']['result']['isError']??false,'Navigation inspection refuses a linked source');unlink($path);file_put_contents($path,$original);
$db->update('api_keys',['scopes'=>json_encode(['site:read'])],'id=?',[$readKey['id']]);
appCheck($call('tools/call',['name'=>'voxelsite_structure_navigation','arguments'=>(object)['page_file'=>'about.php']],$readKey)['status']===403,'Navigation read rechecks current file-read authority');
appCheck($GLOBALS['lifecycle_provider_attempts']===0,'Navigation preflight never calls a provider');
echo "MCP navigation preflight: $checks combined checks passed\n";
