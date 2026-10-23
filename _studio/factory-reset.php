<?php
declare(strict_types=1);
define('VOXELSITE_FACTORY_RUNTIME_INTERNAL',true);
require_once __DIR__.'/static/factory-reset-runtime.php';
header('Cache-Control: no-store');
header('Referrer-Policy: no-referrer');
header('X-Content-Type-Options: nosniff');
$token=$_SERVER['HTTP_X_VS_RESET_TOKEN']??'';
$method=$_SERVER['REQUEST_METHOD']??'GET';
if($token!==''||$method!=='GET'){
    header('Content-Type: application/json; charset=utf-8');
    try{
        $runtime=new VoxelSiteFactoryResetRuntime(__DIR__,dirname(__DIR__));
        if($method==='GET'){
            if(array_diff(array_keys($_GET),['id']))VoxelSiteFactoryResetRuntime::fail('invalid_schema','Use the scoped completion identifier.');
            $result=$runtime->status((string)($_GET['id']??''),$token);
        }elseif($method==='POST'){
            $raw=file_get_contents('php://input',false,null,0,8193);
            if(!is_string($raw)||strlen($raw)>8192)VoxelSiteFactoryResetRuntime::fail('size_limit','Completion input exceeds its budget.');
            $input=json_decode($raw,true,8,JSON_THROW_ON_ERROR);
            if(!is_array($input)||array_diff(array_keys($input),['id','checkpoint','action'])
                ||!is_string($input['id']??null)||!is_int($input['checkpoint']??null)||$input['checkpoint']<0
                ||!in_array($input['action']??'', ['continue','restore'],true))
                VoxelSiteFactoryResetRuntime::fail('invalid_schema','Use the exact receipt and checkpoint.');
            $result=$runtime->continue($input['id'],$token,$input['checkpoint'],$input['action']==='restore');
        }else VoxelSiteFactoryResetRuntime::fail('invalid_schema','Use GET status or POST continuation.');
        echo json_encode(['ok'=>true,'data'=>$result],JSON_THROW_ON_ERROR|JSON_UNESCAPED_SLASHES);
    }catch(Throwable $error){
        $code=$error instanceof VoxelSiteFactoryResetFailure?$error->errorCode:'recovery_required';
        http_response_code($code==='permission_denied'?403:409);
        echo json_encode(['ok'=>false,'error'=>['code'=>$code,'message'=>$error instanceof VoxelSiteFactoryResetFailure
            ?$error->getMessage():'The retained cleanup could not be verified. Keep the completion receipt and reconcile the installation before continuing.']]);
    }
    exit;
}
$script=str_replace('\\','/',$_SERVER['SCRIPT_NAME']??'/_studio/factory-reset.php');
$position=strpos($script,'/_studio/');
$base=$position===false?'/_studio':substr($script,0,$position).'/_studio';
$safe=htmlspecialchars($base,ENT_QUOTES,'UTF-8');
?>
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Installation cleanup — VoxelSite</title>
<link rel="stylesheet" href="<?= $safe ?>/ui/dist/studio.css"></head>
<body><main style="max-width:760px;margin:48px auto;padding:24px">
<header class="vs-page-header"><h1 class="vs-page-title">Installation cleanup</h1>
<p class="vs-page-subtitle">Your retained receipt keeps this workflow available through installation removal.</p></header>
<section class="vs-settings-card" aria-label="Cleanup status">
<p id="factory-message" role="status" aria-live="polite" style="line-height:1.7">Checking the receipt saved in this tab. Reading status does not continue cleanup.</p>
<p id="factory-progress" class="vs-settings-card-subtitle" style="margin-top:12px"></p>
<div id="factory-controls" style="display:flex;flex-wrap:wrap;gap:12px;margin-top:24px"></div>
<p class="vs-settings-card-subtitle" style="margin-top:24px;line-height:1.7">Keep this tab until cleanup is verified. Save the receipt if you need to reopen the workflow.
A completed removal cannot be undone after the database boundary.</p>
</section>
<details class="vs-settings-card"><summary style="cursor:pointer">Recover from a saved receipt</summary>
<label for="factory-import" class="vs-settings-card-subtitle" style="display:block;margin-top:16px">Choose the completion receipt you saved for this installation.</label>
<input id="factory-import" type="file" accept="application/json" style="display:block;margin-top:12px;max-width:100%">
</details>
</main><script type="module">
import { mountFactoryCompletion } from <?= json_encode($base.'/ui/src/factory-reset-workspace.js',JSON_UNESCAPED_SLASHES) ?>;
mountFactoryCompletion({ endpoint: <?= json_encode($base.'/factory-reset.php',JSON_UNESCAPED_SLASHES) ?>, installer: <?= json_encode($base.'/install.php',JSON_UNESCAPED_SLASHES) ?> });
</script></body></html>
