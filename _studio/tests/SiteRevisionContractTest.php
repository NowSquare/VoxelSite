<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/engine/bootstrap.php';
use VoxelSite\{Database,FileManager,Migrator,RevisionManager,Settings};
$root=sys_get_temp_dir().'/vs-site-revision-'.bin2hex(random_bytes(6));
mkdir($root.'/preview',0755,true); mkdir($root.'/assets/css',0755,true); mkdir($root.'/revisions',0755,true);
putenv('VS_TEST_PREVIEW_DIR='.$root.'/preview'); putenv('VS_TEST_ASSETS_DIR='.$root.'/assets'); putenv('VS_TEST_REVISIONS_DIR='.$root.'/revisions');
$db=Database::getInstance($root.'/studio.db'); (new Migrator($db))->run();
$db->insert('users',['id'=>1,'email'=>'owner@example.test','name'=>'Owner','role'=>'owner','password_hash'=>'disabled','created_at'=>now(),'updated_at'=>now()]);
$fm=new FileManager($db); $settings=new Settings($db); $manager=new RevisionManager($db,$settings,$fm);
$before='<head><title>Before</title></head><p class="p-2">Old copy</p>';
$after='<head><title>After</title></head><p class="p-12">New copy</p>';
file_put_contents($root.'/preview/index.php',$before); file_put_contents($root.'/assets/css/style.css',':root { --color-primary: #123456; }');
$fm->syncPageRegistry(true); $ops=[['path'=>'index.php','action'=>'write']];
$id=$manager->createRevision($ops,'Site fixture',1,null,['index.php'=>$before]);
file_put_contents($root.'/preview/index.php',$after);$manager->captureAfterState($id,$ops);$fm->syncPageRegistry(true);
$passed=0;$failures=[];
function check(bool $ok,string $name):void{global $passed,$failures;if($ok){$passed++;}else{$failures[]=$name;echo "FAIL: $name\n";}}
try{
 $manager->undo();
 check($fm->readFile('index.php')===$before,'Undo restores exact captured original without model autofixes');
 check($db->scalar("SELECT title FROM pages WHERE file_path='index.php'")==='Before','Undo refreshes file metadata projection');
 $manager->redo();
 check($fm->readFile('index.php')===$after,'Redo restores exact approved output');
 check($db->scalar("SELECT title FROM pages WHERE file_path='index.php'")==='After','Redo refreshes file metadata projection');
 $badFM=new class($db) extends FileManager { public function compileTailwind():array{return ['ok'=>false];} };
 $badManager=new RevisionManager($db,new Settings($db),$badFM);$rejected=false;
 try{$badManager->undo();}catch(Throwable){$rejected=true;}
 check($rejected && $fm->readFile('index.php')===$after,'Failed undo compilation restores current files and reports failure');
 check((int)(new Settings($db))->get('revision_pointer')===$id,'Failed undo leaves history pointer unchanged');
 $db->exec("CREATE TRIGGER reject_history_pointer BEFORE UPDATE ON settings WHEN NEW.key = 'revision_pointer' BEGIN SELECT RAISE(ABORT, 'injected pointer failure'); END");
 $rejected=false;try{$manager->undo();}catch(Throwable){$rejected=true;}
 check($rejected && $fm->readFile('index.php')===$after && (int)$db->scalar('SELECT is_undone FROM revisions WHERE id='.$id)===0,'History metadata write failure restores current files and rolls back history flags');
 $db->exec('DROP TRIGGER reject_history_pointer');
 if(!method_exists($manager,'recordAppliedRevision')){check(false,'Atomic applied-revision capture exists');}
 else{
  $manager->undo(); // Existing revision is now a future branch.
  $futureBytes=file_get_contents($root.'/revisions/'.$id.'/after/index.php');
  file_put_contents($root.'/preview/index.php',$after);
  $badRoot=$root.'/not-a-directory';file_put_contents($badRoot,'blocked');
  putenv('VS_TEST_REVISIONS_DIR='.$badRoot);
  $badCapture=new RevisionManager($db,new Settings($db),$fm);$rejected=false;
  try{$badCapture->recordAppliedRevision($ops,'Cannot capture',1,['index.php'=>$before]);}catch(Throwable){$rejected=true;}
  check($rejected && $db->count('revisions')===1 && file_get_contents($root.'/revisions/'.$id.'/after/index.php')===$futureBytes,'Capture failure preserves existing future rows and captured files');
  putenv('VS_TEST_REVISIONS_DIR='.$root.'/revisions');
  $atomic=new RevisionManager($db,new Settings($db),$fm);$rejected=false;
  try{$atomic->recordAppliedRevision($ops,'Rejected finalize',1,['index.php'=>$before],function(){throw new RuntimeException('Injected finalize failure');});}catch(Throwable){$rejected=true;}
  check($rejected && $db->count('revisions')===1 && is_file($root.'/revisions/'.$id.'/after/index.php'),'Failed atomic finalize preserves old future revision');
  $newId=$atomic->recordAppliedRevision($ops,'New branch',1,['index.php'=>$before]);
  check($db->count('revisions')===1 && !is_dir($root.'/revisions/'.$id),'Committed complete capture discards future history only after success');
  check(file_get_contents($root.'/revisions/'.$newId.'/before/index.php')===$before && file_get_contents($root.'/revisions/'.$newId.'/after/index.php')===$after,'Atomic capture stores both exact file states');
 }
}finally{
 putenv('VS_TEST_PREVIEW_DIR');putenv('VS_TEST_ASSETS_DIR');putenv('VS_TEST_REVISIONS_DIR');
 $it=new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root,FilesystemIterator::SKIP_DOTS),RecursiveIteratorIterator::CHILD_FIRST);
 foreach($it as $f){$f->isDir()?rmdir($f->getPathname()):unlink($f->getPathname());}rmdir($root);
}
echo "Passed: $passed\nFailed: ".count($failures)."\n";exit($failures?1:0);
