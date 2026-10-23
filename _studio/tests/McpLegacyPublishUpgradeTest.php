<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
require __DIR__.'/helpers/LegacyUpgradeFixture.php';

use VoxelSite\{Database,SiteWorkspace,WorkspaceMigration};
use VoxelSite\Agent\{OperationException,PublishPlanService};

$checks=0;$roots=[];
function legacyPublishCheck(bool $ok,string $label):void {
    global $checks;if(!$ok)throw new RuntimeException('FAIL '.$label);$checks++;echo 'PASS '.$label."\n";
}
function legacyPublishFixture(string $source='published'):array {
    global $roots;$f=legacyUpgradeFixture(1,$source);$roots[]=$f['root'];return $f;
}
function legacyPublishPrepare(array $f,string $id='legacy-publish-review-001'):array {
    return $f['plans']->prepare($f['owner'],(object)['request_id'=>$id,'base_draft_version'=>'draft:'.$f['workspace']->status()['draft_version']]);
}
function legacyPublishReject(callable $call,string $label,?string $code=null):void {
    try{$call();}catch(RuntimeException $error){
        $actual=$error instanceof OperationException?$error->errorCode:$error->getMessage();
        legacyPublishCheck($code===null || str_starts_with($actual,$code),$label.' ('.$actual.')');return;
    }
    legacyPublishCheck(false,$label);
}
try {
    $f=legacyPublishFixture();
    $before=SiteWorkspace::inventory($f['root'].'/assets');
    $sitePath=$f['workspace']->draftAssetsRoot().'/data/site.json';$siteBytes=file_get_contents($sitePath);
    $configuration=$f['plans']->currentConfigurationDigest();
    file_put_contents($sitePath,'{"name":"Changed draft configuration"}');
    legacyPublishCheck($f['plans']->currentConfigurationDigest()!==$configuration,'Publish configuration binds the exact canonical draft site data');
    unlink($sitePath);
    legacyPublishCheck($f['plans']->currentConfigurationDigest()!==$configuration,'Missing draft site data has distinct configuration identity');
    file_put_contents($sitePath,$siteBytes);
    file_put_contents($f['workspace']->draftAssetsRoot().'/images/logo.png','REVIEWED NEW LOGO');
    unlink($f['workspace']->draftAssetsRoot().'/files/brochure.pdf');
    $plan=legacyPublishPrepare($f);
    $effects=array_column($plan['files'],null,'path');
    legacyPublishCheck(isset($effects['assets/images/logo.png'])
        && $effects['assets/images/logo.png']['before_hash']===hash('sha256','LEGACY IMAGE'),
        'First review adopts migrated images using their exact legacy live hash');
    legacyPublishCheck(in_array('assets/files/brochure.pdf',$plan['deletions'],true),
        'An intentionally removed draft asset is deleted only with matching migration provenance');
    $retained=json_decode($f['db']->scalar('SELECT manifest_json FROM agent_publish_plans WHERE id=?',[$plan['plan_id']]),true);
    foreach(['images/logo.png','fonts/site.woff2','files/brochure.pdf','forms/contact.json'] as $path) {
        legacyPublishCheck(($retained['before']['assets/'.$path]??null)===hash('sha256',$f['assets'][$path]),
            'Retained first-publish recovery includes exact '.$path.' bytes');
    }
    legacyPublishCheck(SiteWorkspace::inventory($f['root'].'/assets')===$before,'Preparing upgrade publication never alters live bytes');
    $input=(object)['plan_id'=>$plan['plan_id'],'digest'=>$plan['digest'],'operation_id'=>'legacy-publish-operation-001'];
    $state=$f['plans']->publish($f['owner'],$input);
    for($i=0;$i<100 && $state['status']==='applying';$i++)$state=$f['plans']->continue($f['owner'],$input->operation_id,$state['checkpoint']);
    legacyPublishCheck($state['status']==='succeeded','The first migrated legacy release publishes successfully');
    legacyPublishCheck(file_get_contents($f['root'].'/assets/images/logo.png')==='REVIEWED NEW LOGO'
        && !file_exists($f['root'].'/assets/files/brochure.pdf'),'Publication installs the reviewed edit and removal');
    legacyPublishCheck(file_get_contents($f['root'].'/hosting.txt')==='UNRELATED HOSTING'
        && file_get_contents($f['root'].'/assets/library/untouched.png')==='IMMUTABLE LIBRARY'
        && file_get_contents($f['root'].'/assets/icons/untouched.svg')==='IMMUTABLE ICON','Hosting files and immutable asset roots remain untouched');
    file_put_contents($f['workspace']->migrationRoot().'/manifest.json','not valid JSON');
    legacyPublishCheck(legacyPublishPrepare($f,'modern-release-review-001')['status']==='ready',
        'A committed modern release supersedes historical migration evidence');

    $f=legacyPublishFixture();$path=$f['root'].'/assets/images/logo.png';file_put_contents($path,'THIRD PARTY EDIT');
    legacyPublishReject(fn()=>legacyPublishPrepare($f),'Live drift since migration is refused','ownership_conflict');
    legacyPublishCheck(file_get_contents($path)==='THIRD PARTY EDIT','Refused publication preserves third-party live bytes');
    $f=legacyPublishFixture();$path=$f['root'].'/assets/images/logo.png';unlink($path);
    legacyPublishReject(fn()=>legacyPublishPrepare($f),'A third-party deletion since migration is refused','ownership_conflict');
    legacyPublishCheck(!file_exists($path),'Refused publication preserves the third-party deletion');

    $f=legacyPublishFixture();$path=$f['root'].'/assets/fonts/site.woff2';
    $f['plans']=new PublishPlanService($f['db'],$f['policy'],$f['workspace'],$f['releases'],$f['operations'],testHook:
        static function(string $phase)use($path):void{if($phase==='legacy_provenance_loaded')file_put_contents($path,'RACING THIRD PARTY');});
    legacyPublishReject(fn()=>legacyPublishPrepare($f),'Live drift between ownership lookup and retention is refused','ownership_conflict');
    legacyPublishCheck(file_get_contents($path)==='RACING THIRD PARTY','The provenance race preserves the external writer');

    $f=legacyPublishFixture();
    foreach([$f['root'].'/assets/images/unrelated.png',$f['workspace']->draftAssetsRoot().'/images/unrelated.png'] as $path) file_put_contents($path,'SAME UNOWNED BYTES');
    legacyPublishReject(fn()=>legacyPublishPrepare($f),'Matching current draft and live bytes do not establish migration ownership','ownership_conflict');
    legacyPublishCheck(file_get_contents($f['root'].'/assets/images/unrelated.png')==='SAME UNOWNED BYTES','Unproven assets remain untouched');

    $f=legacyPublishFixture('preview');
    legacyPublishReject(fn()=>legacyPublishPrepare($f),'A separate legacy draft cannot prove live asset ownership','ownership_conflict');
    $f=legacyPublishFixture();$manifestPath=$f['workspace']->migrationRoot().'/manifest.json';
    $original=file_get_contents($manifestPath);$manifest=json_decode($original,true);
    foreach(['copying','failed'] as $status) {
        $manifest['status']=$status;file_put_contents($manifestPath,json_encode($manifest));
        legacyPublishReject(fn()=>legacyPublishPrepare($f,'invalid-proof-review'),'Incomplete '.$status.' checkpoints confer no ownership','ownership_conflict');
    }
    $manifest['status']='activated';file_put_contents($manifestPath,json_encode($manifest));
    legacyPublishCheck(legacyPublishPrepare($f,'activated-proof-review')['status']==='ready',
        'Format commit before final manifest status remains usable after a crash');
    file_put_contents($manifestPath,$original);
    $manifest=json_decode($original,true);$manifest['roots']=str_repeat('0',64);file_put_contents($manifestPath,json_encode($manifest));
    legacyPublishReject(fn()=>legacyPublishPrepare($f,'invalid-proof-review'),'Evidence for different workspace roots is refused','workspace_migration_conflict');
    $manifest=json_decode($original,true);$manifest['inventory']['files']['images/logo.png']['sha256']='invalid';file_put_contents($manifestPath,json_encode($manifest));
    legacyPublishReject(fn()=>legacyPublishPrepare($f,'invalid-proof-review'),'Malformed provenance hashes are refused','workspace_migration_corrupt');
    file_put_contents($manifestPath,'{invalid JSON');
    legacyPublishReject(fn()=>legacyPublishPrepare($f,'invalid-proof-review'),'Malformed JSON evidence is refused without a fallback','workspace_migration_corrupt');
    $manifest=json_decode($original,true);$manifest['copied']['images/logo.png']=false;file_put_contents($manifestPath,json_encode($manifest));
    legacyPublishReject(fn()=>legacyPublishPrepare($f,'invalid-proof-review'),'An unverified copy cannot establish ownership','workspace_migration_corrupt');
    unlink($manifestPath);symlink($f['root'].'/_studio/data/published-manifest.json',$manifestPath);
    legacyPublishReject(fn()=>legacyPublishPrepare($f,'invalid-proof-review'),'Linked migration evidence is refused','workspace_unsafe_path');
    unlink($manifestPath);
    legacyPublishReject(fn()=>legacyPublishPrepare($f,'invalid-proof-review'),'Missing migration evidence never triggers broad live adoption','ownership_conflict');
    file_put_contents($manifestPath,$original);
    (new WorkspaceMigration($f['workspace'],$f['db']))->rollback();
    legacyPublishCheck(!file_exists($manifestPath) && (new WorkspaceMigration($f['workspace'],$f['db']))->publishedAssetHashes()===[],
        'Migration rollback removes its publication ownership evidence');
    echo "$checks legacy publish upgrade checks passed\n";
} finally {Database::resetInstance();foreach($roots as $path)legacyUpgradeRemove($path);}
