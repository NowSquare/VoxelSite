<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/engine/bootstrap.php';
use VoxelSite\Agent\{CapabilityCatalog,CapabilityDefinition,CapabilityRegistry,ToolContracts};

$checks=0;
function futureCheck(bool $ok,string $label):void {
    global $checks;$checks++;if(!$ok)throw new RuntimeException('FAIL '.$label);echo "PASS $label\n";
}
function futureReject(callable $fn,string $fragment,string $label):void {
    try{$fn();}catch(LogicException $error){futureCheck(str_contains($error->getMessage(),$fragment),$label);return;}
    futureCheck(false,$label);
}
$registry=CapabilityCatalog::core();
$route=['surface'=>'studio','method'=>'POST','route'=>'/collections/items','handler'=>'_studio/api/endpoints/collections.php'];
$routes=['studio POST /collections/items'=>$route];
futureReject(fn()=>$registry->assertFutureFeatureParity($routes,[]),'studio POST /collections/items',
    'Activating a collections route without a mapping names the exact missing route');
$contacts=['studio GET /contacts'=>['surface'=>'studio','method'=>'GET','route'=>'/contacts']];
futureReject(fn()=>$registry->assertFutureFeatureParity($contacts,[]),'studio GET /contacts',
    'Activating Contacts independently triggers the future-feature gate');
$row=$route+['id'=>'fixture.collections.create','service_seams'=>['Agent/FixtureService'],
    'mcp'=>['status'=>'pending','tools'=>[],'tests'=>[],'evidence'=>[]]];
futureReject(fn()=>$registry->assertFutureFeatureParity($routes,[$row]),'unverified',
    'A pending inventory entry cannot qualify an activated feature');
$row['mcp']=['status'=>'verified','tools'=>['voxelsite_fixture_collection_create'],
    'tests'=>['_studio/tests/McpFutureParityTest.php'],'evidence'=>['synthetic gate test only']];
futureReject(fn()=>$registry->assertFutureFeatureParity($routes,[$row]),'unregistered',
    'An invented tool name cannot satisfy future coverage');
$definition=new CapabilityDefinition('voxelsite_fixture_collection_create',ToolContracts::object([]),
    ToolContracts::object(['provider_calls'=>['const'=>0]]),['files:write'],'draft_write','fixture.collection',true,
    ['fixture.collections.create'],'Synthetic contract used only to test the release gate.');
$synthetic=new CapabilityRegistry([$definition]);
$synthetic->assertFutureFeatureParity($routes,[$row]);
futureCheck(true,'Explicit verified mapping, shared service, tests and registered capability satisfy the synthetic gate');
$synthetic->assertFutureFeatureParity(['studio GET /collections-summary'=>['route'=>'/collections-summary']],[]);
futureCheck(true,'Feature matching respects path segments instead of superficial prefixes');
$router=file_get_contents(dirname(__DIR__).'/api/router.php');
$active='';
foreach(token_get_all($router) as $token)$active.=is_array($token)?(in_array($token[0],[T_COMMENT,T_DOC_COMMENT],true)?'':$token[1]):$token;
futureCheck(!preg_match('~[\'"]/(?:collections|contacts)(?:/|[\'"])~',$active),
    'Future-feature hooks leave collections and Contacts unshipped');
echo "MCP future parity: {$checks} checks passed\n";
