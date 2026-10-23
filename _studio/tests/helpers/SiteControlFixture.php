<?php
declare(strict_types=1);

/** Self-contained Site Control site: no installed DB or generated checkout files. */
function createSiteControlFixture(string $root): array
{
    if ((new ReflectionMethod(\VoxelSite\FileManager::class,'__construct'))->getNumberOfParameters()<2) throw new RuntimeException('Workspace injection is required.');
    foreach (['preview/assets/css','preview/assets/js','preview/_partials','published/assets','data','snapshots'] as $path) mkdir($root.'/'.$path,0700,true);
    $root=realpath($root);
    if (!$root || !str_starts_with($root,realpath(sys_get_temp_dir()).'/')) throw new RuntimeException('Fixture must use a canonical temporary root.');
    foreach (['VS_TEST_PREVIEW_DIR'=>$root.'/preview','VS_TEST_ASSETS_DIR'=>$root.'/published/assets','VS_TEST_DOC_ROOT'=>$root.'/published',
        'VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/data/workspace','VS_TEST_MUTATION_LOCK'=>$root.'/site.lock','VS_TEST_SNAPSHOT_DIR'=>$root.'/snapshots','VS_TEST_REVISIONS_DIR'=>$root.'/data/revisions'] as $key=>$value) putenv($key.'='.$value);
    foreach (['logDir'=>$root.'/data','initialized'=>true] as $key=>$value) (new ReflectionProperty(\VoxelSite\Logger::class,$key))->setValue(null,$value);
    \VoxelSite\Database::resetInstance();$db=\VoxelSite\Database::getInstance($root.'/studio.db');(new \VoxelSite\Migrator($db,new \VoxelSite\Settings($db)))->run();
    $db->update('site_workspace_state',['format'=>2],'id=1');
    $db->insert('users',['email'=>'fixture@example.invalid','name'=>'Fixture','role'=>'owner','password_hash'=>'fixture','created_at'=>now(),'updated_at'=>now()]);
    file_put_contents($root.'/preview/.htaccess',\VoxelSite\SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
    $nav=[];
    foreach (['index'=>'Home','about'=>'About','contact'=>'Contact','work'=>'Work','services'=>'Services'] as $slug=>$title) {
        file_put_contents($root.'/preview/'.$slug.'.php',"<?php \$page = ['title'=>'$title','slug'=>'$slug']; include __DIR__ . '/_partials/header.php'; ?>\n<h1>$title</h1>\n<a href='/about'>About</a>\n<?php include __DIR__ . '/_partials/footer.php'; ?>");
        $entry=['href'=>$slug==='index'?'/':'/'.$slug,'label'=>$title];if ($slug==='index')$entry['home']=true;$nav[]=$entry;
    }
    file_put_contents($root.'/preview/_partials/header.php','<!DOCTYPE html><html><body><?php include __DIR__ . "/nav.php"; ?><main>');
    file_put_contents($root.'/preview/_partials/footer.php','</main><footer><a href="/about">About</a></footer></body></html>');
    file_put_contents($root.'/preview/_partials/nav.php',"<?php\n".\VoxelSite\NavLinksParser::serialize($nav)."\n?>\n<nav><ul><?php foreach (\$navLinks as \$link): ?><li><a href=\"<?= \$link['href'] ?>\"><?= \$link['label'] ?></a></li><?php endforeach; ?></ul></nav>");
    file_put_contents($root.'/preview/assets/css/style.css',':root { --color-primary: #123456; }');
    $workspace=new \VoxelSite\SiteWorkspace($db,$root.'/preview',$root.'/published',$root.'/data/workspace',$root.'/published/assets');
    $files=new \VoxelSite\FileManager($db,$workspace);$files->syncPageRegistry(true);return [$db,$files];
}

/** Model the displayed client preconditions; explicit supplied identities remain untouched. */
function siteControlRequest(string $dbPath,array $body):array
{
    $db=new \SQLite3($dbPath,SQLITE3_OPEN_READONLY);
    $version=(int)$db->querySingle('SELECT draft_version FROM site_workspace_state WHERE id=1');$db->close();
    return $body+['operation_id'=>'test_'.bin2hex(random_bytes(16)),'base_draft_version'=>'draft:'.$version];
}

/** Verify an actual committed operation, review digest and revision attribution. */
function siteControlRetainedOperation(string $dbPath,array $data):bool
{
    $operation=$data['operation']??[];$result=$operation['result']??[];
    if(($operation['status']??null)!=='succeeded'||!is_int($result['revision_id']??null)||!is_string($result['change_set_id']??null))return false;
    $db=new \SQLite3($dbPath,SQLITE3_OPEN_READONLY);
    $statement=$db->prepare('SELECT r.id FROM revisions r JOIN agent_revision_attribution a ON a.revision_id=r.id JOIN agent_operations o ON o.id=a.operation_id JOIN agent_change_sets c ON c.id=o.preparation_id WHERE r.id=:revision AND o.operation_id=:operation AND c.id=:review AND c.sealed_digest=:digest');
    foreach(['revision'=>$result['revision_id'],'operation'=>$operation['operation_id'],'review'=>$result['change_set_id'],'digest'=>$result['digest']] as $key=>$value)$statement->bindValue(':'.$key,$value,is_int($value)?SQLITE3_INTEGER:SQLITE3_TEXT);
    $valid=$statement->execute()->fetchArray(SQLITE3_ASSOC)!==false;$db->close();return $valid;
}

/** Content/projection guard around every endpoint call, including rejected inputs.
 * Reservation lifecycle may refresh workspace.updated_at; version and reservation
 * identity must still be unchanged after rejection or verified restoration. */
function siteControlState(string $dbPath):array
{
    $root=dirname($dbPath);$db=new \SQLite3($dbPath,SQLITE3_OPEN_READONLY);$state=[];
    foreach(['pages','collections','revisions','site_workspace_state'] as $table){$rows=[];$result=$db->query('SELECT * FROM '.$table.' ORDER BY id');while($row=$result->fetchArray(SQLITE3_ASSOC)){if($table==='site_workspace_state')unset($row['updated_at']);$rows[]=$row;}$state[$table]=$rows;}$db->close();
    foreach(['preview','published'] as $folder){$hashes=[];foreach(new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($root.'/'.$folder,\FilesystemIterator::SKIP_DOTS)) as $file){if($file->isLink())throw new RuntimeException('Unexpected fixture symlink.');if($file->isFile())$hashes[substr($file->getPathname(),strlen($root.'/'.$folder)+1)]=hash_file('sha256',$file->getPathname());}ksort($hashes);$state[$folder]=$hashes;}
    return $state;
}
function siteControlAssertInvariant(string $dbPath,array $before,array $response,string $method,?string $failure):void
{
    $after=siteControlState($dbPath);
    if($before['published']!==$after['published'])throw new RuntimeException('Draft authoring wrote published fixture files.');
    if($method==='GET'||($response['response']['ok']??false)!==true){
        if($before!==$after){$difference=[];foreach($before as $key=>$value)if($value!==$after[$key])$difference[$key]=['before'=>$value,'after'=>$after[$key]];throw new RuntimeException('Rejected/read-only operation changed state: '.json_encode($difference));}
    }
    if($failure!==null){
        $operation=$response['response']['error']['details']['operation']??[];
        if(($operation['status']??null)!=='failed_restored'||($operation['result']['restoration']['restored']??null)!==true||($operation['result']['restoration']['remaining_paths']??null)!==[])
            throw new RuntimeException('The injected execution checkpoint did not report complete verified restoration.');
    }
}
