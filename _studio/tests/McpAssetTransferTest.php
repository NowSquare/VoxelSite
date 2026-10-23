<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
require __DIR__.'/fixtures/mcp/ServiceFixture.php';
use VoxelSite\Agent\{AssetTransferService,CanonicalJson,ChangeSetValidator,JsonSchema,OperationException};
use VoxelSite\SiteWorkspace;

$checks=0; $failures=[];
function uploadCheck(bool $ok,string $label): void {
    global $checks,$failures; $checks++; if (!$ok) $failures[]=$label; echo ($ok?'PASS ':'FAIL ').$label."\n";
}
function uploadReject(callable $call,string $label,?string $code=null): void {
    try { $call(); uploadCheck(false,$label); }
    catch (RuntimeException $e) { uploadCheck($code===null || ($e instanceof OperationException && $e->errorCode===$code),$label); }
}
class InterruptedAssetTransfer extends AssetTransferService {
    public bool $interrupt=false;
    protected function writeAtomic(string $path,string $bytes): void {
        parent::writeAtomic($path,$bytes);
        if ($this->interrupt && str_contains(basename($path),'chunk-')) { $this->interrupt=false; throw new OperationException('host_capability_unavailable','Injected interruption after chunk bytes.'); }
    }
}
class NoDiskAssetTransfer extends AssetTransferService {
    protected function availableBytes(string $directory): float { return 0; }
}
[$root,$db,$workspace,$policy,$actors,$credentials,$owner]=mcpServiceFixture();
$service=new InterruptedAssetTransfer($db,$policy,$workspace,$root.'/_studio/data/uploads',1048576);
$draftBefore=SiteWorkspace::inventory($workspace->draftRoot());
$liveBefore=SiteWorkspace::inventory($root.'/assets');
foreach (['begin','chunk','finish'] as $method) {
    JsonSchema::assertSupported(AssetTransferService::inputSchema($method));
    JsonSchema::assertSupported(AssetTransferService::outputSchema($method));
}
$bytes=str_repeat("Fixture file content.\n",15000);
$begin=(object)['request_id'=>'upload-request-001','path'=>'assets/files/manual.txt','bytes'=>strlen($bytes),
    'sha256'=>hash('sha256',$bytes),'mime_type'=>'text/plain'];
$upload=$service->begin($actors['writer'],$begin);
JsonSchema::validate(JsonSchema::output($upload),AssetTransferService::outputSchema('begin'));
uploadCheck(CanonicalJson::digest($service->begin($actors['writer'],$begin))===CanonicalJson::digest($upload),'Begin retries return the original upload and limits');
uploadCheck($upload['limits']['max_chunk_bytes']<=262144 && $upload['limits']['max_file_bytes']<=1048576,'Limits cannot exceed installation/PHP ceilings');
$changed=clone $begin; $changed->path='assets/files/other.txt';
uploadReject(fn()=>$service->begin($actors['writer'],$changed),'Changed begin request conflicts','idempotency_conflict');
uploadReject(fn()=>$service->begin($actors['reader'],$begin),'Read-only credential cannot stage bytes','permission_denied');
$part=substr($bytes,0,262144);
$chunk=(object)['request_id'=>'chunk-request-001','upload_id'=>$upload['upload_id'],'offset'=>0,'data_base64'=>base64_encode($part),'sha256'=>hash('sha256',$part)];
uploadReject(fn()=>$service->chunk($actors['other'],$chunk),'Other credential cannot continue guessed upload','permission_denied');
$future=clone $chunk; $future->offset=1;
uploadReject(fn()=>$service->chunk($actors['writer'],$future),'Out-of-order chunks cannot advance','content_conflict');
$service->interrupt=true;
uploadReject(fn()=>$service->chunk($actors['writer'],$chunk),'Interrupted chunk reports failure');
$held=fopen($root.'/_studio/data/uploads/transfers.lock','c');
flock($held,LOCK_EX);
uploadReject(fn()=>$service->chunk($actors['writer'],$chunk),'Concurrent upload worker cannot claim private staging','site_busy');
flock($held,LOCK_UN); fclose($held);
$receipt=$service->chunk($actors['writer'],$chunk);
uploadCheck($receipt['next_offset']===strlen($part),'Same chunk safely resumes retained intent after interrupted bytes');
uploadCheck(CanonicalJson::digest($service->chunk($actors['writer'],$chunk))===CanonicalJson::digest($receipt),'Acknowledged chunk retries retain exact receipt');
$changedChunk=clone $chunk; $changedChunk->data_base64=base64_encode(str_repeat('X',strlen($part))); $changedChunk->sha256=hash('sha256',str_repeat('X',strlen($part)));
uploadReject(fn()=>$service->chunk($actors['writer'],$changedChunk),'Changed chunk request identity is rejected','idempotency_conflict');
$changedChunk->request_id='different-chunk-id';
uploadReject(fn()=>$service->chunk($actors['writer'],$changedChunk),'New request cannot replace previously reserved offset','idempotency_conflict');
$malformed=clone $chunk; $malformed->data_base64='!!!!';
uploadReject(fn()=>$service->chunk($actors['writer'],$malformed),'Malformed base64 is rejected','invalid_schema');
$malformed->data_base64=base64_encode(str_repeat('x',262145));
uploadReject(fn()=>$service->chunk($actors['writer'],$malformed),'Oversize decoded chunk is rejected before staging');
$finish=(object)['request_id'=>'finish-request-001','upload_id'=>$upload['upload_id']];
uploadReject(fn()=>$service->finish($actors['writer'],$finish),'Incomplete upload cannot finalize','content_conflict');
uploadReject(fn()=>$service->finalizedBytes($actors['writer'],$upload['upload_id'],$begin->path),'Incomplete upload cannot attach','content_conflict');
$part=substr($bytes,$receipt['next_offset']);
$chunk2=(object)['request_id'=>'chunk-request-002','upload_id'=>$upload['upload_id'],'offset'=>$receipt['next_offset'],'data_base64'=>base64_encode($part),'sha256'=>hash('sha256',$part)];
$receipt2=$service->chunk($actors['writer'],$chunk2);
JsonSchema::validate(JsonSchema::output($receipt2),AssetTransferService::outputSchema('chunk'));
$result=$service->finish($actors['writer'],$finish);
JsonSchema::validate(JsonSchema::output($result),AssetTransferService::outputSchema('finish'));
uploadCheck($result['sha256']===hash('sha256',$bytes) && !$result['normalized'],'Whole-file hash verifies exact uploaded text');
uploadCheck(CanonicalJson::digest($service->finish($actors['writer'],$finish))===CanonicalJson::digest($result),'Finish replay retains exact finalized metadata');
uploadCheck($service->finalizedBytes($actors['writer'],$upload['upload_id'],$begin->path)===$bytes,'Only finalized bytes reach reviewed asset reader');
uploadReject(fn()=>$service->finalizedBytes($actors['other'],$upload['upload_id'],$begin->path),'Finalized metadata remains credential-bound','permission_denied');
uploadReject(fn()=>$service->finalizedBytes($actors['writer'],$upload['upload_id'],'assets/files/renamed.txt'),'Finalized upload is bound to reviewed destination path','invalid_path');
$resolved=(new ChangeSetValidator())->resolve([(object)['type'=>'attach_asset','path'=>$begin->path,'expected_hash'=>null,'upload_id'=>$upload['upload_id']]],[],
    fn($id,$path)=>$service->finalizedBytes($actors['writer'],$id,$path));
uploadCheck($resolved[$begin->path]['content']===$bytes,'Reviewed change-set attachment consumes finalized service bytes');

$sequence=10;
$uploadWhole=static function (string $content,string $path,string $mime,?string $hash=null) use ($service,$actors,&$sequence): array {
    $id='complete-request-'.(++$sequence);
    $record=$service->begin($actors['writer'],(object)['request_id'=>$id,'path'=>$path,'bytes'=>strlen($content),'sha256'=>$hash??hash('sha256',$content),'mime_type'=>$mime]);
    for ($offset=0;$offset<strlen($content);$offset+=262144) {
        $part=substr($content,$offset,262144);
        $service->chunk($actors['writer'],(object)['request_id'=>$id.'-'.$offset,'upload_id'=>$record['upload_id'],'offset'=>$offset,'data_base64'=>base64_encode($part),'sha256'=>hash('sha256',$part)]);
    }
    return $service->finish($actors['writer'],(object)['request_id'=>$id,'upload_id'=>$record['upload_id']]);
};
$png=file_get_contents(__DIR__.'/fixtures/mcp/site-lifecycle/site/assets/images/workshop.png');
$image=$uploadWhole($png,'assets/images/workshop.png','image/png');
uploadCheck($image['image']['width']===32 && $image['image']['height']===24,'Raster decoding and shared image processing provide dimensions');
$raster=imagecreatetruecolor(300,20);
ob_start(); imagepng($raster); $wide=ob_get_clean(); unset($raster);
$thumbnail=$uploadWhole($wide,'assets/images/wide.png','image/png');
uploadCheck($thumbnail['image']['thumbnail'] && is_file($root.'/_studio/data/uploads/'.$thumbnail['upload_id'].'/thumbs/final.png'),'Shared thumbnail processing remains inside private upload storage');
$svg=$uploadWhole('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script><foreignObject><p>unsafe</p></foreignObject><rect width="10" height="10"/><use href="https://evil.test/x"/></svg>','assets/images/shape.svg','image/svg+xml');
$safe=$service->finalizedBytes($actors['writer'],$svg['upload_id'],'assets/images/shape.svg');
uploadCheck($svg['normalized'] && !str_contains($safe,'script') && !str_contains($safe,'onload') && !str_contains($safe,'evil.test') && str_contains($safe,'rect'),'SVG sanitation removes executable and external content');
uploadReject(fn()=>$uploadWhole('plain text','assets/images/fake.png','image/png'),'Extension spoof fails magic validation','invalid_schema');
uploadReject(fn()=>$uploadWhole('<?php echo 1;','assets/files/execute.txt','text/plain'),'Executable upload disguised as text is rejected','invalid_schema');
uploadReject(fn()=>$uploadWhole('complete text','assets/files/wrong-hash.txt','text/plain',str_repeat('a',64)),'Whole-file digest mismatch fails','content_conflict');
uploadReject(fn()=>$uploadWhole('<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg>&x;</svg>','assets/images/entity.svg','image/svg+xml'),'SVG entities cannot read host files','invalid_schema');
foreach (['assets/images/execute.php','assets/css/style.css','assets/library/new.png','../assets/files/escape.txt'] as $path) {
    $bad=clone $begin; $bad->request_id='invalid-'.(++$sequence); $bad->path=$path;
    uploadReject(fn()=>$service->begin($actors['writer'],$bad),'Unsafe upload destination is rejected','invalid_path');
}
$bad=clone $begin; $bad->request_id='oversize-request'; $bad->bytes=1048577;
uploadReject(fn()=>$service->begin($actors['writer'],$bad),'Oversize total rejected before staging','size_limit');
$disk=new NoDiskAssetTransfer($db,$policy,$workspace,$root.'/_studio/data/no-disk');
uploadReject(fn()=>$disk->begin($actors['writer'],(object)['request_id'=>'disk-full-request','path'=>'assets/files/a.txt','bytes'=>1,'sha256'=>hash('sha256','a'),'mime_type'=>'text/plain']),'Disk failure refuses private staging','host_capability_unavailable');
$finalPath=$root.'/_studio/data/uploads/'.$upload['upload_id'].'/final.txt';
file_put_contents($finalPath,'tampered');
uploadReject(fn()=>$service->finalizedBytes($actors['writer'],$upload['upload_id'],$begin->path),'Tampered finalized bytes cannot attach','content_conflict');
uploadReject(fn()=>$service->finish($actors['writer'],$finish),'Finish replay rechecks finalized byte integrity','content_conflict');
$db->update('agent_asset_uploads',['expires_at'=>time()-1],'id = ?',[$image['upload_id']]);
uploadReject(fn()=>$service->finalizedBytes($actors['writer'],$image['upload_id'],'assets/images/workshop.png'),'Expired uploads cannot attach','review_expired');
$credentials->revoke($owner,$actors['writer']->credentialId);
uploadReject(fn()=>$service->finish($actors['writer'],$finish),'Revocation applies even to finalized retries','permission_denied');
uploadCheck(SiteWorkspace::inventory($workspace->draftRoot())===$draftBefore,'Every staging operation leaves draft bytes untouched');
uploadCheck(SiteWorkspace::inventory($root.'/assets')===$liveBefore,'Every staging operation leaves published bytes untouched');
echo "MCP asset transfer: {$checks} checks, ".count($failures)." failures\n";
exit($failures?1:0);
