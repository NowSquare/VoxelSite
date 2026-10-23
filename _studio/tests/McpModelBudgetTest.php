<?php
declare(strict_types=1);
require __DIR__.'/McpApplicationTest.php';
use VoxelSite\Agent\{CapabilityCatalog,JsonSchema};
use VoxelSite\{Encryption,ModelCapabilitySettings};
$budgetKey=$credentials->create($owner,1,'read','Budget reader',null,null,['settings:read']);
$before=$db->query('SELECT * FROM settings ORDER BY key');
$response=$call('tools/call',['name'=>'voxelsite_settings_model_budget','arguments'=>(object)['provider'=>'openai','model'=>'gpt-5','max_tokens'=>32000]],$budgetKey);
appCheck($response['status']===200&&!($response['body']['result']['isError']??true),'Pure model budget is registered and runs through provider-forbidden MCP dispatch');
$budgetTool=fn(array $input)=>$tool('voxelsite_settings_model_budget',$input,$budgetKey);
function budgetStudio(string $root,array $body):array{
 $process=proc_open([PHP_BINARY,__DIR__.'/helpers/call-model-budget.php',$root],[['pipe','r'],['pipe','w'],['pipe','w']],$pipes,$root);
 fwrite($pipes[0],json_encode($body));fclose($pipes[0]);$out=stream_get_contents($pipes[1]);fclose($pipes[1]);$err=stream_get_contents($pipes[2]);fclose($pipes[2]);$exit=proc_close($process);
 if($exit!==0||$err!=='')throw new RuntimeException('Budget route failed: '.$err);return json_decode($out,true,32,JSON_THROW_ON_ERROR);
}
$defaults=['claude'=>['claude-sonnet-4-5-20250514',64000,200000],'openai'=>['gpt-5',128000,400000],
 'gemini'=>['gemini-2.0-flash',8192,1048576],'deepseek'=>['deepseek-chat',16384,64000],'openai_compatible'=>['',8192,32000]];
$nativeClasses=['claude'=>'ClaudeProvider','openai'=>'OpenAIProvider','gemini'=>'GeminiProvider','deepseek'=>'DeepSeekProvider','openai_compatible'=>'OpenAICompatibleProvider'];
foreach($defaults as $provider=>[$model,$limit,$context]){
 $native=(new ReflectionClass('VoxelSite\\Providers\\'.$nativeClasses[$provider]))->newInstanceWithoutConstructor();
 appCheck(($native->getModels()[0]['id']??'')===$model,'Pure default stays aligned with native fallback list for '.$provider);
 $input=['provider'=>$provider,'max_tokens'=>128000];$read=$budgetTool($input);$studio=budgetStudio($root,$input);
 appCheck($read['budget']['model']===$model&&$read['budget']['model_limit']===$limit&&$read['budget']['context_window']===$context,'Pure budget preserves native static fallback for '.$provider);
 appCheck($read['budget']['effective']===$limit&&$read['focused_budget']['effective']===min(16000,$limit),'Full and focused caps agree for '.$provider);
 appCheck($studio['status']===200&&$studio['response']['data']===$read&&$studio['provider_attempts']===0,'Studio and MCP use the same pure budget for '.$provider);
}
$settings->set('ai_openai_api_key',(new Encryption($applicationKey))->encrypt('secret-must-not-decrypt'));
$settings->set('ai_openai_compatible_base_url','http://127.0.0.1:9/v1');
$limits=['base_url'=>'http://127.0.0.1:9/v1','models'=>['fixture-model'=>['max_output_tokens'=>24000,'context_window'=>64000]]];
$settings->set(ModelCapabilitySettings::OVERRIDES_KEY,$limits);
$before=$db->query('SELECT * FROM settings ORDER BY key');$stateBefore=[$workspace->status(),$db->count('revisions'),$db->count('agent_operations')];
$input=['provider'=>'openai_compatible','model'=>'fixture-model','max_tokens'=>32000];$read=$budgetTool($input);
appCheck($read['budget']['effective']===24000&&$read['focused_budget']['effective']===16000&&$read['budget']['context_window']===64000&&$read['source']==='override','Saved exact-model compatible override is used without accessing the endpoint');
appCheck($budgetTool($input+['base_url'=>'http://127.0.0.1:8/v1'])['source']==='fallback','A different compatible endpoint never inherits saved limits');
appCheck($budgetTool(array_replace($input,['model'=>'prefix/fixture-model']))['source']==='fallback','Friendly model aliases do not inherit exact-match limits');
$empty=$input+['model_limits'=>['base_url'=>'http://127.0.0.1:9/v1','models'=>(object)[]]];
appCheck($budgetTool($empty)['source']==='fallback','An explicit empty override previews cleared limits');
ModelCapabilitySettings::recordModels($settings,'claude','',[['id'=>'local-catalog-model','max_output_tokens'=>90000,'context_window'=>500000]]);
$before=$db->query('SELECT * FROM settings ORDER BY key');
appCheck($budgetTool(['provider'=>'claude','model'=>'local-catalog-model'])['source']==='metadata','Budget read uses already retained metadata without model discovery');
appCheck($budgetTool(['provider'=>'openai','model'=>'gpt-6.1-sol'])['source']==='documented','Exact documented model keeps its disclosed limit source');
foreach([['max_tokens'=>999],['max_tokens'=>128001],['max_tokens'=>'32000'],['provider'=>'unknown'],['model'=>str_repeat('x',257)],['model'=>"bad\nmodel"],['unknown'=>true],
 ['model_limits'=>['base_url'=>'http://wrong.invalid','models'=>(object)[]]],['model_limits'=>['base_url'=>'http://127.0.0.1:9/v1','models'=>['x'=>['max_output_tokens'=>64001,'context_window'=>64000]]]]] as $bad){
 $rejected=$call('tools/call',['name'=>'voxelsite_settings_model_budget','arguments'=>(object)array_replace($input,$bad)],$budgetKey);
 appCheck($rejected['body']['result']['isError']??false,'Invalid bounded budget input is refused: '.json_encode($bad));
}
$denied=$call('tools/call',['name'=>'voxelsite_settings_model_budget','arguments'=>(object)[]],$readKey);
appCheck($denied['status']===403,'Ordinary site-read grant does not expose configuration budget');
appCheck($before===$db->query('SELECT * FROM settings ORDER BY key')&&$stateBefore===[$workspace->status(),$db->count('revisions'),$db->count('agent_operations')],'Budget reads preserve settings, versions, revisions and operations');
appCheck(!str_contains(json_encode($read),'secret-must-not-decrypt')&&$GLOBALS['lifecycle_provider_attempts']===0,'No credential disclosure or provider transport occurs');
echo "MCP model budget: $checks combined checks passed\n";
