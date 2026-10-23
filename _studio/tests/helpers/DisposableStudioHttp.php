<?php
declare(strict_types=1);
namespace VoxelSite\Tests;

/** Actual PHP requests, including upload provenance, inside an outer fixture. */
final class DisposableStudioHttp
{
    private mixed $process;
    private int $port;
    private string $log;
    public function __construct(string $root,array $ini=[])
    {
        $root=realpath($root);$temporary=realpath(sys_get_temp_dir());
        if(!$root||!$temporary||!str_starts_with($root,$temporary.'/')||!is_file($root.'/_studio/api/router.php'))throw new \RuntimeException('Disposable Studio runtime required.');
        $socket=stream_socket_server('tcp://127.0.0.1:0',$number,$message);
        if(!$socket)throw new \RuntimeException('Loopback fixture unavailable: '.$message);
        $this->port=(int)substr(strrchr(stream_socket_get_name($socket,false),':'),1);fclose($socket);
        $this->log=dirname($root).'/http-'.bin2hex(random_bytes(4)).'.log';
        $command=[PHP_BINARY];foreach($ini as $key=>$value){$command[]='-d';$command[]=$key.'='.$value;}
        array_push($command,'-S','127.0.0.1:'.$this->port,'-t',$root);
        $this->process=proc_open($command,[['pipe','r'],['file',$this->log,'a'],['file',$this->log,'a']],$pipes,$root);fclose($pipes[0]);
        for($i=0;$i<100;$i++){if($probe=@fsockopen('127.0.0.1',$this->port,$number,$message,.1)){fclose($probe);return;}usleep(20000);}
        throw new \RuntimeException('Disposable HTTP server did not start.');
    }
    public function request(string $method,string $path,?array $body=null,array $query=[],bool $csrf=true,bool $multipart=false,string $session='1111111111111111111111111111111111111111111111111111111111111111'):array
    {
        $url='http://127.0.0.1:'.$this->port.'/_studio/api/router.php?'.http_build_query(['_path'=>$path]+$query);
        $curl=curl_init($url);$headers=['Accept: application/json','Cookie: vs_session='.$session];
        if($csrf)$headers[]='X-VS-Token: '.$session;
        if(!$multipart)$headers[]='Content-Type: application/json';
        curl_setopt_array($curl,[CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>30,CURLOPT_HTTPHEADER=>$headers]);
        if($body!==null)curl_setopt($curl,CURLOPT_POSTFIELDS,$multipart?$body:json_encode($body,JSON_THROW_ON_ERROR));
        $raw=curl_exec($curl);if($raw===false)throw new \RuntimeException(curl_error($curl));
        return ['status'=>curl_getinfo($curl,CURLINFO_HTTP_CODE),'body'=>json_decode($raw,true),'raw'=>$raw];
    }
    public function close():void
    {
        if(is_resource($this->process)){proc_terminate($this->process);proc_close($this->process);$this->process=null;}
        $log=file_get_contents($this->log);
        if(preg_match('/(?:PHP (?:Warning|Notice|Deprecated|Fatal|Parse)|Uncaught)/',$log))throw new \RuntimeException('Disposable HTTP diagnostics: '.$log);
    }
    public function __destruct(){if(is_resource($this->process)){proc_terminate($this->process);proc_close($this->process);}}
}
