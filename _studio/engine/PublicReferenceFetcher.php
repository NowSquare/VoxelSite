<?php
declare(strict_types=1);
namespace VoxelSite;

/** Bounded public HTTP reads. Every redirect gets a fresh, pinned address check. */
final class PublicReferenceFetcher
{
    public const MAX_BYTES = 1048576;
    private const MAX_SECONDS = 15;
    public function __construct(private ?\Closure $resolver = null, private ?\Closure $transport = null) {}

    public function validateUrl(string $url): string
    {
        if (strlen($url)>2048 || preg_match('/[\x00-\x20\x7f\\\\]/',$url) || !filter_var($url,FILTER_VALIDATE_URL)) {
            throw new \RuntimeException('Use a public HTTP or HTTPS URL without credentials.');
        }
        $parts=parse_url($url); $scheme=strtolower($parts['scheme']??''); $host=strtolower(trim($parts['host']??'','[]'));
        if (!in_array($scheme,['http','https'],true) || isset($parts['user']) || isset($parts['pass']) || isset($parts['fragment'])
            || ($parts['port']??($scheme==='https'?443:80))!==($scheme==='https'?443:80)) {
            throw new \RuntimeException('Use a public HTTP or HTTPS URL on its standard port, without credentials or fragments.');
        }
        if (filter_var($host,FILTER_VALIDATE_IP)) {
            if (!self::isPublicIp($host)) throw new \RuntimeException('Private, local and reserved network targets are not allowed.');
        } elseif (!preg_match('/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/D',$host)
            || preg_match('/\.(?:localhost|local|internal|home|test|invalid)$/D',$host)) {
            throw new \RuntimeException('Use a public DNS name or public IP address.');
        }
        return $url;
    }

    public static function isPublicIp(string $ip): bool
    {
        if (filter_var($ip,FILTER_VALIDATE_IP,FILTER_FLAG_NO_PRIV_RANGE|FILTER_FLAG_NO_RES_RANGE)===false) return false;
        $packed=inet_pton($ip);
        if ($packed===false) return false;
        if (strlen($packed)===4) {
            $n=unpack('N',$packed)[1];
            foreach ([
                ['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],
                ['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.168.0.0',16],
                ['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',4],['240.0.0.0',4],
            ] as [$base,$bits]) {
                $mask=(0xffffffff << (32-$bits)) & 0xffffffff;
                if (($n & $mask)===(unpack('N',inet_pton($base))[1] & $mask)) return false;
            }
            return true;
        }
        // Only globally routed unicast; exclude transition/special and documentation ranges.
        if ((ord($packed[0]) & 0xe0)!==0x20) return false;
        if (substr($packed,0,2)==="\x20\x02" || substr($packed,0,4)==="\x20\x01\x0d\xb8") return false;
        return !(substr($packed,0,2)==="\x20\x01" && ord($packed[2])<2);
    }

    /** @return array{url:string,status:int,mime_type:string,body:string,bytes:int,sha256:string} */
    public function fetch(string $url,array $allowedTypes=['text/html','application/xhtml+xml'],int $limit=self::MAX_BYTES): array
    {
        if ($limit<1 || $limit>self::MAX_BYTES) throw new \InvalidArgumentException('Invalid reference read budget.');
        $deadline=microtime(true)+self::MAX_SECONDS;
        for ($hop=0;$hop<=3;$hop++) {
            $url=$this->validateUrl($url);$parts=parse_url($url);$host=trim($parts['host'],'[]');
            $ips=filter_var($host,FILTER_VALIDATE_IP)?[$host]:$this->resolve($host);
            if (!$ips || count($ips)>32) throw new \RuntimeException('This reference has no bounded public DNS answer.');
            foreach ($ips as $ip) if (!is_string($ip) || !self::isPublicIp($ip)) throw new \RuntimeException('Private, local and reserved DNS targets are not allowed.');
            $remaining=(int)ceil(($deadline-microtime(true))*1000);
            if ($remaining<=0) throw new \RuntimeException('The reference download timed out.');
            $response=$this->transport!==null
                ? ($this->transport)($url,$ips[0],$limit,$remaining)
                : $this->request($url,$ips[0],$limit,$remaining);
            if (!is_array($response) || !is_int($response['status']??null) || !is_array($response['headers']??null)
                || !is_string($response['body']??null) || ($response['complete']??false)!==true
                || strlen($response['body'])>$limit || microtime(true)>$deadline) {
                throw new \RuntimeException('The reference download was incomplete or exceeded its limit.');
            }
            $headers=array_change_key_case($response['headers'],CASE_LOWER);
            if (isset($headers['content-encoding']) && strtolower($headers['content-encoding'])!=='identity') throw new \RuntimeException('Compressed reference responses are unsupported.');
            if (isset($headers['content-length']) && (!ctype_digit($headers['content-length']) || (int)$headers['content-length']!==strlen($response['body']))) {
                throw new \RuntimeException('The reference download length does not match its response.');
            }
            if (in_array($response['status'],[301,302,303,307,308],true)) {
                if ($hop===3 || !is_string($headers['location']??null)) throw new \RuntimeException('The reference has too many or invalid redirects.');
                $url=self::resolveUrl($url,$headers['location']);continue;
            }
            $mime=strtolower(trim(explode(';',$headers['content-type']??'')[0]));
            if ($response['status']>=200 && $response['status']<300 && !in_array($mime,$allowedTypes,true)) {
                throw new \RuntimeException('This reference content type is not supported.');
            }
            return ['url'=>$url,'status'=>$response['status'],'mime_type'=>$mime,'body'=>$response['body'],
                'bytes'=>strlen($response['body']),'sha256'=>hash('sha256',$response['body'])];
        }
        throw new \RuntimeException('The reference redirect limit was exceeded.');
    }

    public static function resolveUrl(string $base,string $location): string
    {
        if ($location==='' || strlen($location)>2048 || preg_match('/[\x00-\x20\x7f\\\\]/',$location)) throw new \RuntimeException('Invalid reference redirect.');
        if (preg_match('~^[a-z][a-z0-9+.-]*:~i',$location)) return $location;
        $parts=parse_url($base);
        if (str_starts_with($location,'//')) return $parts['scheme'].':'.$location;
        $origin=$parts['scheme'].'://'.$parts['host'].(isset($parts['port'])?':'.$parts['port']:'');
        if (str_starts_with($location,'?')) return $origin.($parts['path']??'/').$location;
        $path=str_starts_with($location,'/')?$location:dirname($parts['path']??'/').'/'.$location;
        $query=strpos($path,'?');$suffix=$query===false?'':substr($path,$query);$path=$query===false?$path:substr($path,0,$query);
        $segments=[];
        foreach (explode('/',$path) as $part) { if ($part==='' || $part==='.') continue;if ($part==='..') array_pop($segments);else $segments[]=$part; }
        return $origin.'/'.implode('/',$segments).$suffix;
    }

    private function resolve(string $host): array
    {
        if ($this->resolver!==null) return ($this->resolver)($host);
        if (!function_exists('dns_get_record')) throw new \RuntimeException('This host cannot safely resolve public references.');
        $records=@dns_get_record($host,DNS_A|DNS_AAAA);
        if (!is_array($records)) return [];
        $ips=[];
        foreach ($records as $record) if (isset($record['ip']) || isset($record['ipv6'])) $ips[]=$record['ip']??$record['ipv6'];
        return array_values(array_unique($ips));
    }

    private function request(string $url,string $ip,int $limit,int $milliseconds): array
    {
        if (!function_exists('curl_init') || !defined('CURLOPT_RESOLVE')) throw new \RuntimeException('This host needs cURL address pinning for reference imports.');
        $parts=parse_url($url);$host=strtolower(trim($parts['host'],'[]'));$port=strtolower($parts['scheme'])==='https'?443:80;
        $body='';$headers=[];$headerBytes=0;$handle=curl_init($url);
        curl_setopt_array($handle,[
            CURLOPT_FOLLOWLOCATION=>false,CURLOPT_PROTOCOLS=>CURLPROTO_HTTP|CURLPROTO_HTTPS,
            CURLOPT_PROXY=>'',CURLOPT_RETURNTRANSFER=>false,CURLOPT_CONNECTTIMEOUT_MS=>min(5000,$milliseconds),
            CURLOPT_TIMEOUT_MS=>$milliseconds,CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2,
            CURLOPT_HTTPHEADER=>['Accept: */*','Accept-Encoding: identity'],CURLOPT_USERAGENT=>'VoxelSite-Reference/1.0',
            CURLOPT_RESOLVE=>[$host.':'.$port.':'.(str_contains($ip,':')?'['.$ip.']':$ip)],
            CURLOPT_WRITEFUNCTION=>static function ($handle,string $chunk) use (&$body,$limit): int {
                if (strlen($body)+strlen($chunk)>$limit) return 0;$body.=$chunk;return strlen($chunk);
            },
            CURLOPT_HEADERFUNCTION=>static function ($handle,string $line) use (&$headers,&$headerBytes): int {
                $headerBytes+=strlen($line);if ($headerBytes>16384) return 0;
                if (preg_match('~^HTTP/~i',$line)) $headers=[];
                elseif (str_contains($line,':')) {[$name,$value]=explode(':',$line,2);$name=strtolower(trim($name));
                    if (isset($headers[$name]) && in_array($name,['location','content-length','content-type','content-encoding'],true)) return 0;
                    $headers[$name]=trim($value);
                }
                return strlen($line);
            },
        ]);
        try {
            $ok=curl_exec($handle);$status=(int)curl_getinfo($handle,CURLINFO_HTTP_CODE);$connected=(string)curl_getinfo($handle,CURLINFO_PRIMARY_IP);
            if ($ok===false || inet_pton($connected)!==inet_pton($ip)) throw new \RuntimeException('The public reference could not be downloaded safely within its limits.');
            return ['status'=>$status,'headers'=>$headers,'body'=>$body,'complete'=>true];
        } finally {curl_close($handle);}
    }
}
