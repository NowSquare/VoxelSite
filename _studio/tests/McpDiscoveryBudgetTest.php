<?php
declare(strict_types=1);
require __DIR__.'/McpApplicationTest.php';
use VoxelSite\Agent\{ActorPolicy,CanonicalJson,ProtocolProfile};
$measurement=['kind'=>'actual_synthetic_wire_bytes','php'=>PHP_VERSION,'catalogs'=>[],'contexts'=>[],'rules'=>[]];
foreach(['read'=>ActorPolicy::presets()['read']['scopes'],'edit'=>ActorPolicy::presets()['edit']['scopes'],
    'publish'=>ActorPolicy::presets()['publish']['scopes'],'administrative'=>ActorPolicy::ceiling('owner')] as $grant=>$scopes){
    $credential=$credentials->create($owner,1,'read','Discovery '.$grant,null);$db->update('api_keys',['scopes'=>json_encode($scopes)],'id=?',[$credential['id']]);
    foreach(ProtocolProfile::versions() as $version){
        $response=$call('tools/list',[],$credential,$version);$tools=$response['body']['result']['tools']??[];
        appCheck($response['status']===200&&count($tools)>0,$grant.' discovery works on '.$version);
        $fieldBytes=[];foreach(['name','description','inputSchema','outputSchema','annotations'] as $field){
            $fieldBytes[$field]=array_sum(array_map(static fn($tool)=>strlen(json_encode($tool[$field],JSON_THROW_ON_ERROR|JSON_UNESCAPED_SLASHES)),$tools));}
        $measurement['catalogs'][]=['grant'=>$grant,'protocol'=>$version,'tool_count'=>count($tools),'serialized_value_bytes_by_field'=>$fieldBytes,
            'body_json_bytes'=>strlen(json_encode($response['body'],JSON_THROW_ON_ERROR|JSON_UNESCAPED_SLASHES)),
            'tools_json_bytes'=>strlen(json_encode($tools,JSON_THROW_ON_ERROR|JSON_UNESCAPED_SLASHES))];
    }
}
foreach([2048,4096,8192,32768] as $budget){
    $context=$tool('voxelsite_site_context',['action'=>'edit_page','max_bytes'=>$budget]);
    $bytes=strlen(CanonicalJson::encode($context));
    appCheck($bytes<=$budget&&$context['size_bytes']===$bytes,'Actual context respects whole-result '.$budget.' byte budget');
    $measurement['contexts'][]=['requested_bytes'=>$budget,'actual_bytes'=>$bytes,'declared_chars'=>$context['size_chars'],
        'manifest_count'=>count($context['manifest']),'section_count'=>count($context['sections']),'omissions'=>$context['omissions']];
}
foreach($context['rules'] as $reference){
    $offset=0;$joined='';$chunks=0;$maximum=0;
    do{
        $chunk=$tool('voxelsite_rules_read',['action'=>'edit_page','kind'=>$reference['kind'],'digest'=>$reference['sha256'],'offset'=>$offset,'max_bytes'=>2048]);
        $bytes=strlen(CanonicalJson::encode($chunk));$maximum=max($maximum,$bytes);$joined.=$chunk['content'];$offset=$chunk['next_offset'];$chunks++;
    }while($offset!==null);
    appCheck($maximum<=2048&&hash('sha256',$joined)===$reference['sha256']&&strlen($joined)===$reference['bytes'],
        'Exact '.$reference['kind'].' rule reconstruction preserves its digest within each whole-response budget');
    $measurement['rules'][]=['kind'=>$reference['kind'],'source_bytes'=>strlen($joined),'chunks'=>$chunks,'maximum_response_bytes'=>$maximum,'sha256'=>$reference['sha256']];
}
appCheck($GLOBALS['lifecycle_provider_attempts']===0,'Discovery measurement and bounded context never dispatch providers');
file_put_contents($root.'/discovery-measurements.json',json_encode($measurement,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR));
echo 'DISCOVERY_MEASUREMENTS '.json_encode($measurement,JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR)."\n";
echo "MCP discovery budgets: $checks combined checks passed\n";
