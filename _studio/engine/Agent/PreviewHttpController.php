<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

/** Preview-only HTTP authority. This controller never starts a Studio session. */
final class PreviewHttpController
{
    public const MAX_BODY_BYTES=65536;
    public function __construct(private PreviewService $service,private bool $secureCookie=true) {}

    public function handle(string $method,array $query,array $headers,string $body,array $cookies): array
    {
        return ProviderCallPolicy::runExternal(function () use ($method,$query,$headers,$body,$cookies): array {
            $responseHeaders=['Cache-Control'=>'no-store, private','Pragma'=>'no-cache','X-Robots-Tag'=>'noindex, nofollow',
                'Referrer-Policy'=>'no-referrer','X-Content-Type-Options'=>'nosniff'];
            try {
                if (strlen($body)>self::MAX_BODY_BYTES) throw new OperationException('size_limit','Preview requests accept at most 64 KiB. No submission was processed.');
                $headers=array_change_key_case($headers,CASE_LOWER);
                if (isset($headers['content-length']) && (!ctype_digit((string)$headers['content-length'])
                    || (int)$headers['content-length']>self::MAX_BODY_BYTES)) {
                    throw new OperationException('size_limit','Preview requests accept at most 64 KiB. No submission was processed.');
                }
                $view=$query['view'] ?? '';
                if (!is_string($view)) throw new OperationException('invalid_schema','Invalid preview request.');
                if ($method === 'POST' && $view === 'exchange') {
                    if (!is_string($headers['origin'] ?? null)) throw new OperationException('permission_denied','The preview exchange requires a same-origin request.');
                    if (!str_starts_with(strtolower($headers['content-type'] ?? ''),'application/x-www-form-urlencoded')) {
                        throw new OperationException('invalid_schema','Use the preview handoff form to exchange this ticket.');
                    }
                    parse_str($body,$input);
                    if (array_keys($input) !== ['ticket'] || !is_string($input['ticket'])) throw new OperationException('invalid_schema','A single preview ticket is required.');
                    $exchange=$this->service->exchange($input['ticket'],$headers['origin'],$headers['sec-fetch-site'] ?? null);
                    $responseHeaders['Set-Cookie']=PreviewService::COOKIE_NAME.'='.$exchange['cookie']
                        .'; Path='.$this->service->endpointPath().'; Max-Age='.max(0,$exchange['expires_at']-time())
                        .'; HttpOnly; SameSite=Strict'.($this->secureCookie ? '; Secure' : '');
                    $responseHeaders['Location']=$this->service->endpointPath().'?path='.rawurlencode($exchange['entry_path']);
                    return ['status'=>303,'headers'=>$responseHeaders,'body'=>''];
                }
                $cookie=$cookies[PreviewService::COOKIE_NAME] ?? '';
                if (!is_string($cookie)) $cookie='';
                if ($method === 'GET' && $view === '' && !isset($query['path'])) {
                    $nonce=base64_encode(random_bytes(18));
                    $responseHeaders['Content-Type']='text/html; charset=utf-8';
                    $responseHeaders['Content-Security-Policy']="default-src 'none'; script-src 'nonce-{$nonce}'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'";
                    return ['status'=>200,'headers'=>$responseHeaders,'body'=>$this->handoff($nonce)];
                }
                if ($method === 'GET' && $view === 'manifest') {
                    $responseHeaders['Content-Type']='application/json; charset=utf-8';
                    return ['status'=>200,'headers'=>$responseHeaders,'body'=>CanonicalJson::encode($this->service->browserManifest($cookie))];
                }
                if ($method === 'POST' && $view === 'validate') {
                    $validation=$this->service->browserValidation($cookie);
                    $responseHeaders['Content-Type']='text/html; charset=utf-8';
                    return ['status'=>200,'headers'=>$responseHeaders,'body'=>'<!doctype html><html lang="en"><meta charset="utf-8"><title>Draft preview</title><main><h1>Nothing was submitted</h1><p>'
                        .htmlspecialchars($validation['message'],ENT_QUOTES,'UTF-8').'</p><p>Use your browser’s Back button to return to the draft.</p></main></html>'];
                }
                if ($method !== 'GET' || $view !== '' || !is_string($query['path'] ?? null)) throw new OperationException('invalid_schema','This preview route is unavailable.');
                $render=$this->service->browser($cookie,$query['path']);
                $responseHeaders['Content-Type']=$render['mime'];
                $content=$render['content'];
                if ($render['status']>=400 && $content === '') {
                    $content='<!doctype html><html lang="en"><meta charset="utf-8"><title>Preview unavailable</title><main><h1>Preview unavailable</h1><p>'
                        .htmlspecialchars($render['diagnostics'][0]['message'] ?? 'Inspect this draft before previewing it.',ENT_QUOTES,'UTF-8').'</p></main></html>';
                }
                return ['status'=>$render['status'],'headers'=>$responseHeaders,'body'=>$content];
            } catch (OperationException $error) {
                $responseHeaders['Content-Type']='application/json; charset=utf-8';
                $status=match ($error->errorCode) {'permission_denied'=>403,'preview_expired'=>410,'size_limit'=>413,'content_conflict','site_busy'=>409,default=>400};
                return ['status'=>$status,'headers'=>$responseHeaders,'body'=>CanonicalJson::encode(['ok'=>false,'error'=>['code'=>$error->errorCode,'message'=>$error->getMessage()]])];
            } catch (\Throwable) {
                $responseHeaders['Content-Type']='application/json; charset=utf-8';
                return ['status'=>503,'headers'=>$responseHeaders,'body'=>'{"ok":false,"error":{"code":"host_capability_unavailable","message":"This preview could not be served. Check the draft and installation settings."}}'];
            }
        });
    }

    private function handoff(string $nonce): string
    {
        $endpoint=json_encode($this->service->endpointPath(),JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);
        return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Open draft preview</title></head><body>'
            .'<main><h1>Open draft preview</h1><p id="status">Opening the scoped draft preview…</p><noscript>This handoff needs JavaScript once to exchange its ticket. The resulting preview also supports ordinary form fallbacks.</noscript></main>'
            .'<script nonce="'.htmlspecialchars($nonce,ENT_QUOTES,'UTF-8').'">(function(){var endpoint='.$endpoint.';var ticket=new URLSearchParams(location.hash.slice(1)).get("ticket");'
            .'history.replaceState(null,"",endpoint);if(!ticket||!/^[a-f0-9]{64}$/.test(ticket)){document.getElementById("status").textContent="Open the fresh preview link returned by your connected assistant.";return;}'
            .'fetch(endpoint+"?view=exchange",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({ticket:ticket}).toString()})'
            .'.then(function(response){if(!response.ok)throw new Error("exchange");location.replace(response.url);})'
            .'.catch(function(){document.getElementById("status").textContent="This preview link was used or expired. Request a fresh browser preview.";});})();</script></body></html>';
    }
}
