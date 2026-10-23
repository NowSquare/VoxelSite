<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

/** Fragment-to-POST exchange keeps bearer tickets out of HTTP request URLs and access logs. */
final class DownloadHttpController
{
    public function __construct(private DownloadGrantStore $store,private string $origin)
    { $this->origin=PreviewService::canonicalOrigin($origin); }

    public function handle(string $method,array $headers,string $body=''):array
    {
        $headers=array_change_key_case($headers,CASE_LOWER);
        $out=['Cache-Control'=>'no-store, private','Referrer-Policy'=>'no-referrer','X-Robots-Tag'=>'noindex, nofollow',
            'X-Content-Type-Options'=>'nosniff','Content-Type'=>'application/json; charset=utf-8'];
        try {
            if($method==='GET') {
                $script=<<<'JS'
(async()=>{const ticket=location.hash.slice(1);history.replaceState(null,'',location.pathname);const status=document.getElementById('status');try{if(!/^[a-f0-9]{64}$/.test(ticket))throw new Error('Request a fresh export download link.');const response=await fetch(location.pathname,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ticket}),credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok){const error=await response.json();throw new Error(error.error?.message||'The download is unavailable.');}const blob=await response.blob();const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='website.zip';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),30000);status.textContent='Your download is ready.';}catch(error){status.textContent=error.message;}})();
JS;
                $out['Content-Type']='text/html; charset=utf-8';
                $out['Content-Security-Policy']="default-src 'none'; script-src 'sha256-".base64_encode(hash('sha256',$script,true))."'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'";
                return ['status'=>200,'headers'=>$out,'body'=>'<!doctype html><html lang="en"><meta charset="utf-8"><title>Download website</title><p id="status">Preparing your download…</p><script>'.$script.'</script></html>','stream'=>null];
            }
            if($method!=='POST')return ['status'=>405,'headers'=>$out+['Allow'=>'GET, POST'],'body'=>'{"error":{"code":"method_not_allowed","message":"Use the download link or POST its ticket."}}','stream'=>null];
            if(!isset($headers['origin']) || !hash_equals($this->origin,$headers['origin']))throw new OperationException('permission_denied','The download Origin does not match this installation.');
            if(strtolower(trim(explode(';',$headers['content-type']??'')[0]))!=='application/json')throw new OperationException('invalid_schema','Send the ticket as JSON.');
            if(strlen($body)>256 || (isset($headers['content-length']) && (!ctype_digit((string)$headers['content-length']) || (int)$headers['content-length']>256)))throw new OperationException('size_limit','Download requests are limited to 256 bytes.');
            $input=json_decode($body,false,4);
            if(!$input instanceof \stdClass || array_keys((array)$input)!==['ticket'] || !is_string($input->ticket))throw new OperationException('invalid_schema','Send one download ticket.');
            $download=$this->store->openDownload($input->ticket);
            $out['Content-Type']='application/zip';$out['Content-Length']=(string)$download['bytes'];
            $out['Content-Disposition']='attachment; filename="'.$download['filename'].'"';
            $out['X-Content-SHA256']=$download['sha256'];
            return ['status'=>200,'headers'=>$out,'body'=>'','stream'=>$download];
        }catch(OperationException $error) {
            return ['status'=>$error->errorCode==='permission_denied'?403:($error->errorCode==='download_expired'||$error->errorCode==='export_expired'?410:409),
                'headers'=>$out,'body'=>json_encode(['error'=>['code'=>$error->errorCode,'message'=>$error->getMessage()]],JSON_THROW_ON_ERROR),'stream'=>null];
        }
    }
}
