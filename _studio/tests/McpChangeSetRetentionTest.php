<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\{Database, Migrator, Settings, SiteWorkspace, TailwindCompiler};
use VoxelSite\Agent\{ActorPolicy, AuthoringBriefService, BriefStore, CanonicalJson, ChangeSetService,
    ChangeSetStore, ContextService, CredentialService, OperationActor, OperationException, WorkspaceFiles};

$checks=0;
function retentionCheck(bool $ok,string $label): void {
    global $checks; $checks++;
    if (!$ok) throw new RuntimeException('FAIL ' . $label);
    echo 'PASS ' . $label . "\n";
}
function retentionReject(callable $call,string $code,string $label): void {
    try { $call(); }
    catch (OperationException $e) { retentionCheck($e->errorCode === $code,$label . ' [' . $e->errorCode . ']'); return; }
    retentionCheck(false,$label);
}
function retentionRemove(string $path): void {
    if (is_link($path) || is_file($path)) { unlink($path); return; }
    if (!is_dir($path)) return;
    foreach (new DirectoryIterator($path) as $entry) if (!$entry->isDot()) retentionRemove($entry->getPathname());
    rmdir($path);
}
$root=realpath(sys_get_temp_dir()) . '/vs-retention-' . bin2hex(random_bytes(6));
foreach (['draft/assets/js','draft/assets/css','live/assets/css','private'] as $dir) mkdir($root . '/' . $dir,0700,true);
$env=['VS_TEST_PREVIEW_DIR'=>$root.'/draft','VS_TEST_DOC_ROOT'=>$root.'/live','VS_TEST_ASSETS_DIR'=>$root.'/live/assets',
    'VS_TEST_WORKSPACE_STATE_DIR'=>$root.'/private/workspace','VS_TEST_MUTATION_LOCK'=>$root.'/private/site.lock'];
$previous=[];
foreach ($env as $name=>$value) { $previous[$name]=getenv($name); putenv($name.'='.$value); }
$db=Database::getInstance($root.'/private/studio.db');
try {
    (new Migrator($db,new Settings($db)))->run();
    $db->insert('users',['email'=>'retention@example.invalid','password_hash'=>'fixture','name'=>'Fixture','role'=>'owner','created_at'=>now(),'updated_at'=>now()]);
    $db->update('site_workspace_state',['format'=>2],'id = 1');
    file_put_contents($root.'/draft/.htaccess',SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
    file_put_contents($root.'/draft/assets/css/style.css',':root { --color-fixture-draft: #123456; }');
    file_put_contents($root.'/live/assets/css/style.css',':root { --color-fixture-live: #654321; }');
    file_put_contents($root.'/live/assets/css/tailwind.css','Published CSS must stay unchanged.');
    $before='const value = ' . json_encode(str_repeat("é\\\"\n\t",1600),JSON_UNESCAPED_UNICODE) . ";\n";
    $after='const updated = ' . json_encode(str_repeat("🙂é\\\"\n\t",2200),JSON_UNESCAPED_UNICODE) . ";\n";
    file_put_contents($root.'/draft/assets/js/copy.js',$before);
    $workspace=new SiteWorkspace($db,$root.'/draft',$root.'/live',$root.'/private/workspace',$root.'/live/assets');
    $policy=new ActorPolicy($db);
    $owner=new OperationActor('user',1,null,[],'studio_configured',null);
    $credential=(new CredentialService($db))->create($owner,1,'edit','Retention fixture',null);
    $actor=$policy->fromCredential($credential['id']);
    $briefStore=new BriefStore($db,$policy);
    $brief=(new AuthoringBriefService(new ContextService($db,$policy,$workspace),$briefStore))
        ->create($actor,['request_id'=>'retention-brief-001','action'=>'edit_page']);
    $store=new ChangeSetStore($db,$policy,$root.'/private/changes');
    $service=new ChangeSetService($db,$policy,$workspace,$briefStore,$store);
    $request=(object)['request_id'=>'retention-change-001','base_draft_version'=>'draft:0','brief_id'=>$brief['brief_id'],
        'summary'=>'Review bounded multibyte source','operations'=>[(object)['type'=>'replace','path'=>'assets/js/copy.js',
            'expected_hash'=>hash('sha256',$before),'content'=>$after]]];
    $draftBefore=WorkspaceFiles::hashes(WorkspaceFiles::read($workspace));
    $liveBefore=SiteWorkspace::inventory($root.'/live');
    $reserved=$store->reserve($actor,(array)$request);
    retentionCheck((int)$reserved['staged_bytes'] === ChangeSetStore::RESERVATION_BYTES,'Capacity is reserved before staging begins');
    retentionCheck(!is_dir($root.'/private/changes'),'A capacity reservation creates no staging files');
    $review=$service->prepare($actor,$request);
    $row=$store->get($actor,$review['change_set_id']);
    $stage=$store->stagingRoot($row['id']);
    $staged=SiteWorkspace::inventory($stage);
    $actual=array_sum(array_column($staged['files'],'size'));
    retentionCheck((int)$row['staged_bytes'] >= $actual + ChangeSetStore::METADATA_ALLOWANCE_BYTES,
        'Sealed accounting covers proposed bytes, originals and metadata');
    retentionCheck((int)$row['staged_bytes'] < ChangeSetStore::RESERVATION_BYTES,'Sealing releases unused conservative capacity');
    $both=$service->readDiff($actor,$row['id'],'assets/js/copy.js',0,2048);
    retentionCheck(strlen(CanonicalJson::encode($both)) <= 2048 && $both['sides']['before']['content'] !== ''
        && $both['sides']['after']['content'] !== '','A two-sided review shares one complete response budget');
    foreach (['before'=>$before,'after'=>$after] as $side=>$expected) {
        $offset=0; $joined=''; $chunks=0;
        do {
            $range=$service->readDiff($actor,$row['id'],'assets/js/copy.js',$offset,2048,$side);
            retentionCheck(strlen(CanonicalJson::encode($range)) <= 2048,'Escaped multibyte ' . $side . ' chunk fits the whole JSON budget');
            $joined.=$range['sides'][$side]['content'];
            $offset=$range['sides'][$side]['next_offset']; $chunks++;
        } while ($offset !== null);
        retentionCheck($joined === $expected && $chunks > 1,'Source-side continuation reconstructs exact ' . $side . ' bytes');
    }
    $inside=strpos($after,'🙂')+1;
    retentionReject(fn()=>$service->readDiff($actor,$row['id'],'assets/js/copy.js',$inside,2048,'after'),
        'invalid_schema','Offsets inside a multibyte character are rejected');
    retentionReject(fn()=>$service->readDiff($actor,$row['id'],'assets/js/copy.js',strlen($after)+1,2048,'after'),
        'invalid_schema','Offsets beyond the selected source are rejected');
    retentionReject(fn()=>$service->readDiff($actor,$row['id'],'assets/js/copy.js',0,256),
        'invalid_schema','An undersized whole-response budget is explicit');
    retentionCheck(SiteWorkspace::inventory($stage) === $staged,'Diff reads never mutate retained staging');
    $db->update('api_keys',['scopes'=>json_encode(array_values(array_diff($credential['scopes'],['assets:write','forms:write'])))],
        'id = ?',[$credential['id']]);
    $assetReads=0;
    $assetService=new ChangeSetService($db,$policy,$workspace,$briefStore,$store,
        function () use (&$assetReads): string { $assetReads++; return 'upload bytes'; });
    $assetRequest=clone $request; $assetRequest->request_id='retention-scope-asset';
    $assetRequest->operations=[(object)['type'=>'attach_asset','path'=>'assets/images/new.png','expected_hash'=>null,'upload_id'=>'upload_'.str_repeat('a',32)]];
    retentionReject(fn()=>$assetService->prepare($actor,$assetRequest),'permission_denied','Narrowed asset permissions reject attachment');
    retentionCheck($assetReads === 0,'Asset permission is checked before resolving upload bytes');
    $formRequest=clone $request; $formRequest->request_id='retention-scope-form';
    $formRequest->operations=[(object)['type'=>'create','path'=>'assets/forms/contact.json','expected_hash'=>null,
        'content'=>'{"id":"contact","fields":[{"name":"email","type":"email"}]}']];
    retentionReject(fn()=>$service->prepare($actor,$formRequest),'permission_denied','Narrowed form permissions reject schema authoring');
    $db->update('api_keys',['scopes'=>json_encode($credential['scopes'])],'id = ?',[$credential['id']]);

    $used=(int)$db->scalar('SELECT SUM(staged_bytes) FROM agent_change_sets');
    $db->update('agent_change_sets',['staged_bytes'=>ChangeSetStore::MAX_STORAGE_BYTES-ChangeSetStore::RESERVATION_BYTES+1],'id = ?',[$row['id']]);
    $quotaRequest=(array)$request; $quotaRequest['request_id']='retention-quota-001';
    retentionReject(fn()=>$store->reserve($actor,$quotaRequest),'size_limit','Prospective capacity rejects crossing the global quota by one byte');
    retentionCheck((int)$db->scalar('SELECT COUNT(*) FROM agent_change_sets') === 3,'Quota rejection allocates neither a record nor staging');
    $db->update('agent_change_sets',['staged_bytes'=>ChangeSetStore::MAX_STORAGE_BYTES-ChangeSetStore::RESERVATION_BYTES],'id = ?',[$row['id']]);
    $quota=$store->reserve($actor,$quotaRequest);
    retentionCheck((int)$db->scalar('SELECT SUM(staged_bytes) FROM agent_change_sets') === ChangeSetStore::MAX_STORAGE_BYTES,
        'An exact prospective quota boundary remains valid');
    $store->discardIncomplete($actor,$quota['id']);
    $db->update('agent_change_sets',['staged_bytes'=>$used],'id = ?',[$row['id']]);

    $failed=(array)$request; $failed['request_id']='retention-failed-001'; $failed['base_draft_version']='draft:999';
    $failedRow=$store->reserve($actor,$failed);
    $failedRoot=$store->stagingRoot($failedRow['id'],true);
    WorkspaceFiles::write($failedRoot.'/draft','assets/js/crash.js','proposed crash bytes');
    WorkspaceFiles::write($failedRoot.'/before','assets/js/crash.js','original crash bytes');
    WorkspaceFiles::write($failedRoot.'/state','checkpoint.json','{}');
    retentionCheck((int)$store->get($actor,$failedRow['id'])['staged_bytes'] === ChangeSetStore::RESERVATION_BYTES,
        'A simulated crash leaves its complete conservative reservation accounted');
    retentionReject(fn()=>$service->prepare($actor,(object)$failed),'content_conflict','A stale retry rejects before changing the draft');
    retentionCheck(!file_exists($failedRoot) && (int)$store->get($actor,$failedRow['id'])['staged_bytes'] === 0,
        'Failed preparation removes originals, proposed files and state before releasing capacity');
    $unsafe=(array)$request; $unsafe['request_id']='retention-unsafe-001';
    $unsafeRow=$store->reserve($actor,$unsafe);
    $unsafeRoot=$store->stagingRoot($unsafeRow['id'],true);
    file_put_contents($root.'/private/outside.txt','Do not follow this link.');
    symlink($root.'/private/outside.txt',$unsafeRoot.'/linked');
    try { $store->discardIncomplete($actor,$unsafeRow['id']); retentionCheck(false,'Unsafe cleanup must refuse symlinks'); }
    catch (RuntimeException $error) { retentionCheck(str_contains($error->getMessage(),'Symlink'),'Unsafe cleanup refuses a symlink'); }
    retentionCheck((int)$store->get($actor,$unsafeRow['id'])['staged_bytes'] === ChangeSetStore::RESERVATION_BYTES
        && file_get_contents($root.'/private/outside.txt') === 'Do not follow this link.','Failed cleanup retains accounting and preserves the outside target');
    unlink($unsafeRoot.'/linked');
    $store->discardIncomplete($actor,$unsafeRow['id']);
    $db->update('agent_change_sets',['status'=>'applied'],'id = ?',[$row['id']]);
    retentionCheck($service->prepare($actor,$request) === $review && SiteWorkspace::inventory($stage) === $staged,
        'Prepare replay after apply returns the retained result without erasing recovery bytes');
    retentionCheck($service->get($actor,$row['id']) === $review,'An applied review remains retrievable under its original retention and identity checks');
    $appliedDiff=$service->readDiff($actor,$row['id'],'assets/js/copy.js',0,2048,'after');
    retentionCheck(str_starts_with($after,$appliedDiff['sides']['after']['content']) && $appliedDiff['sides']['after']['content'] !== '',
        'An applied review remains readable with exact retained source bytes');
    retentionCheck(WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)) === $draftBefore
        && SiteWorkspace::inventory($root.'/live') === $liveBefore,'Every preparation, refusal and cleanup leaves draft and published bytes unchanged');

    $compileRoot=$root.'/private/compile';
    mkdir($compileRoot,0700,true);
    file_put_contents($compileRoot.'/index.php','<div class="flex p-4">Fixture</div>');
    $output=$compileRoot.'/tailwind.css';
    file_put_contents($output,'Existing output.');
    $compiler=new TailwindCompiler($root.'/draft/assets/css');
    $limited=$compiler->compile($compileRoot,$output,1);
    retentionCheck(($limited['error'] ?? '') === 'size_limit' && file_get_contents($output) === 'Existing output.',
        'Compiler rejects expanded output before writing beyond its reserved ceiling');
    file_put_contents($compileRoot.'/index.php','<div>No utility classes.</div>');
    $limited=$compiler->compile($compileRoot,$output,1);
    retentionCheck(($limited['error'] ?? '') === 'size_limit' && file_get_contents($output) === 'Existing output.',
        'Compiler applies the same ceiling to preflight-only output');
    foreach (['linked.php'=>$root.'/draft/assets/js/copy.js','linked-dir'=>$root.'/draft'] as $name=>$target) {
        symlink($target,$compileRoot.'/'.$name);
        try { $compiler->compile($compileRoot,$output); retentionCheck(false,'Compiler must reject source symlinks'); }
        catch (RuntimeException $error) { retentionCheck(str_contains($error->getMessage(),'symlink'),'Compiler rejects linked file or directory sources'); }
        unlink($compileRoot.'/'.$name);
    }
    retentionCheck(file_get_contents($output) === 'Existing output.','Rejected compiler scans preserve output bytes');
    $defaultCompiler=new TailwindCompiler();
    retentionCheck(str_contains($defaultCompiler->compileClasses(['bg-fixture-draft']),'--color-fixture-draft')
        && !str_contains($defaultCompiler->compileClasses(['bg-fixture-live']),'--color-fixture-live'),
        'Default compiler reads private draft theme tokens');
    $defaultResult=$defaultCompiler->compile();
    retentionCheck($defaultResult['ok'] && is_file($root.'/draft/assets/css/tailwind.css')
        && SiteWorkspace::inventory($root.'/live') === $liveBefore,'Default compilation writes private draft output and preserves published assets');
    echo "Change-set retention: {$checks} checks passed\n";
} finally {
    Database::resetInstance();
    foreach ($previous as $name=>$value) putenv($value === false ? $name : $name.'='.$value);
    retentionRemove($root);
}
