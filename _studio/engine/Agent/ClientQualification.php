<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

/** Client claims come only from the version-matched record shipped with this runtime. */
final class ClientQualification
{
    public static function load(string $productVersion,?string $path=null):array {
        $path??=dirname(__DIR__,2).'/mcp-client-qualification.json';
        $fallback=static fn(string $reason)=>['schema_version'=>1,'record_version'=>null,'product_version'=>$productVersion,
            'status'=>'unqualified','clients'=>[],'reason'=>$reason];
        clearstatcache(true,$path);
        if(is_link($path)||!is_file($path)||!is_readable($path))return $fallback('record_unavailable');
        // A package activation can replace the record between inspection and read.
        // Bound the read itself and keep that ordinary race off the response/logs.
        $bytes=@file_get_contents($path,false,null,0,65537);
        if($bytes===false)return $fallback('record_unavailable');
        if(strlen($bytes)>65536)return $fallback('record_invalid');
        try {
            $record=json_decode($bytes,false,16,JSON_THROW_ON_ERROR);
            $text=['type'=>'string','minLength'=>1,'maxLength'=>200,'pattern'=>'^[^\\x00-\\x1f\\x7f]+$'];
            $list=['type'=>'array','maxItems'=>20,'uniqueItems'=>true,'items'=>$text];
            $client=ToolContracts::object(['id'=>['enum'=>['codex','claude_code','other']],
                'name'=>$text,'status'=>['enum'=>['unqualified','qualified']],
                'client_versions'=>$list,'protocol_versions'=>$list,'verified_at'=>ToolContracts::nullable(ToolContracts::integer()),
                'evidence'=>$list]);
            JsonSchema::validate($record,ToolContracts::object(['schema_version'=>['const'=>1],
                'record_version'=>$text,'product_version'=>$text,'clients'=>['type'=>'array','minItems'=>1,'maxItems'=>3,'items'=>$client]]));
            if($record->product_version!==$productVersion)return $fallback('version_mismatch');
            $ids=[];$qualified=true;
            foreach($record->clients as $client) {
                if(isset($ids[$client->id]))return $fallback('record_invalid');
                $ids[$client->id]=true;
                if($client->status==='qualified' && (!$client->client_versions || !$client->protocol_versions
                    || !$client->evidence || $client->verified_at===null || $client->verified_at<1))return $fallback('record_invalid');
                $qualified=$qualified && $client->status==='qualified';
            }
            return json_decode(json_encode($record,JSON_THROW_ON_ERROR),true,16,JSON_THROW_ON_ERROR)
                +['status'=>$qualified?'qualified':'unqualified'];
        }catch(\JsonException|OperationException){return $fallback('record_invalid');}
    }
}
