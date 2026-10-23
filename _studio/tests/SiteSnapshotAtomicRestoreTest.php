<?php
declare(strict_types=1);
require dirname(__DIR__) . '/engine/bootstrap.php';
require dirname(__DIR__) . '/engine/SiteControlSnapshots.php';
use VoxelSite\{Database, FileManager, Logger, Migrator, Settings, SiteWorkspace};

$root = sys_get_temp_dir() . '/vs-snapshot-atomic-' . bin2hex(random_bytes(8));
foreach (['draft/nested','draft/assets/css','live/assets','private/snapshots'] as $path) mkdir($root.'/'.$path,0700,true);
foreach (['VS_TEST_PREVIEW_DIR'=>$root.'/draft','VS_TEST_DOC_ROOT'=>$root.'/live','VS_TEST_ASSETS_DIR'=>$root.'/live/assets',
    'VS_TEST_MUTATION_LOCK'=>$root.'/private/site.lock','VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/private/workspace',
    'VS_TEST_SNAPSHOT_DIR'=>$root.'/private/snapshots'] as $key=>$value) putenv($key.'='.$value);
foreach (['logDir'=>$root.'/private','initialized'=>true] as $key=>$value) (new ReflectionProperty(Logger::class,$key))->setValue(null,$value);
$db = Database::getInstance($root.'/private/studio.db'); (new Migrator($db,new Settings($db)))->run();
$db->update('site_workspace_state',['format'=>2],'id = 1');
file_put_contents($root.'/draft/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
$source = '<?php $page=["title"=>"Original","slug"=>"index"]; ?><h1>Original</h1>';
file_put_contents($root.'/draft/index.php',$source); chmod($root.'/draft/index.php',0640);
file_put_contents($root.'/draft/nested/team.php','<h1>Original team</h1>'); chmod($root.'/draft/nested/team.php',0640); chmod($root.'/draft/nested',0750);
file_put_contents($root.'/draft/assets/css/style.css',':root{--color-primary:#123456}');
$workspace = new SiteWorkspace($db,$root.'/draft',$root.'/live',$root.'/private/workspace',$root.'/live/assets');
$files = new FileManager($db,$workspace); $files->syncPageRegistry(true);
$checks=0; $failures=[];
function atomicCheck(bool $ok,string $label): void { global $checks,$failures; $checks++; if(!$ok)$failures[]=$label; echo ($ok?'PASS ':'FAIL ').$label."\n"; }
function atomicVersion(): int { global $workspace; return $workspace->status()['draft_version']; }
function atomicMode(string $path): int { clearstatcache(true,$path); return fileperms($path)&07777; }
$snapshot = createSiteControlSnapshot($db,'Atomic restore fixture','Exact source, metadata and version restoration',null,$workspace);
atomicCheck($snapshot['ok'],'Capture a verified legacy safety archive');
$id=(int)$snapshot['snapshot']['id']; $pages=$db->query('SELECT * FROM pages ORDER BY id');
$path=$root.'/draft/index.php'; file_put_contents($path,'Changed before restore'); $handle=fopen($path,'rb'); $version=atomicVersion();
$result=restoreSiteControlSnapshot($db,$id,$workspace);
atomicCheck($result['ok'] && file_get_contents($path)===$source && atomicMode($path)===0640,'Restore exact file bytes and mode');
atomicCheck(stream_get_contents($handle)==='Changed before restore','An open reader retains the old inode while restoration atomically replaces the path'); fclose($handle);
atomicCheck(atomicVersion()===$version+1,'Legacy byte restoration invalidates the draft version exactly once');
file_put_contents($root.'/draft/new.php','<h1>New page</h1>'); $version=atomicVersion();
$result=restoreSiteControlSnapshot($db,$id,$workspace);
atomicCheck($result['ok'] && !file_exists($root.'/draft/new.php') && atomicVersion()===$version+1,'Deletion-only restoration invalidates the draft version');
$db->update('pages',['title'=>'Changed projection'],'id = ?',[$pages[0]['id']]); $version=atomicVersion();
$result=restoreSiteControlSnapshot($db,$id,$workspace);
atomicCheck($result['ok'] && $db->query('SELECT * FROM pages ORDER BY id')===$pages && atomicVersion()===$version+1,'Projection-only restoration is exact and invalidates stale draft reviews');
chmod($path,0600); $version=atomicVersion();
$result=restoreSiteControlSnapshot($db,$id,$workspace);
atomicCheck($result['ok'] && atomicMode($path)===0640 && atomicVersion()===$version+1,'Metadata-only restoration invalidates the draft version');

file_put_contents($path,'First changed file'); file_put_contents($root.'/draft/nested/team.php','Blocked changed team');
chmod($root.'/draft/nested',0550); $version=atomicVersion(); $warnings=[];
set_error_handler(function(int $level,string $message)use(&$warnings): bool { $warnings[]=$message; return true; });
try { $result=restoreSiteControlSnapshot($db,$id,$workspace); } finally { restore_error_handler(); }
atomicCheck(!$result['ok'] && file_get_contents($path)===$source && file_get_contents($root.'/draft/nested/team.php')==='Blocked changed team',
    'Failed later atomic replacement reports failure and leaves its existing bytes complete');
atomicCheck(atomicMode($root.'/draft/nested')===0550 && atomicMode($root.'/draft/nested/team.php')===0640,
    'Failed restoration does not claim or apply the blocked directory metadata');
atomicCheck(atomicVersion()===$version+1 && $warnings===[] && glob($root.'/draft/nested/.site-*')===[],
    'Partial restoration invalidates once and leaves no warnings or temporary debris');
chmod($root.'/draft/nested',0750); $version=atomicVersion();
$result=restoreSiteControlSnapshot($db,$id,$workspace);
atomicCheck($result['ok'] && file_get_contents($root.'/draft/nested/team.php')==='<h1>Original team</h1>'
    && atomicMode($root.'/draft/nested')===0750 && atomicVersion()===$version+1,'Explicit retry restores remaining bytes and permissions after the host is repaired');

$zip=new ZipArchive(); $zip->open($root.'/private/snapshots/'.$snapshot['snapshot']['filename']);
$zip->addFromString('preview/index.php','Corrupt archived bytes'); $zip->close();
$version=atomicVersion(); $result=restoreSiteControlSnapshot($db,$id,$workspace);
atomicCheck(!$result['ok'] && atomicVersion()===$version && file_get_contents($path)===$source,'Invalid archive verification changes neither bytes nor draft version');
echo "Atomic snapshot restore: {$checks} checks, ".count($failures)." failed; fixture {$root}\n";
exit($failures?1:0);
