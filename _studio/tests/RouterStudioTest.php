<?php
declare(strict_types=1);
require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
require_once __DIR__ . '/helpers/RouterHeadingFixture.php';
use VoxelSite\{Database, Encryption, RouterActivity, Settings};
use VoxelSite\Tests\RouterHeadingFixture as Fixture;
$passed = 0; $errors = [];
function check(bool $ok, string $message): void { global $passed, $errors; $ok ? $passed++ : $errors[] = $message; }
function requestStudio(string $root, array $input): array {
    $child = proc_open([PHP_BINARY, __DIR__ . '/helpers/call-router-owner.php', $root], [['pipe','r'],['pipe','w'],['pipe','w']], $pipes);
    fwrite($pipes[0], json_encode($input)); fclose($pipes[0]);
    $out = stream_get_contents($pipes[1]); $err = stream_get_contents($pipes[2]); fclose($pipes[1]); fclose($pipes[2]);
    if (proc_close($child) !== 0 || $err !== '') throw new RuntimeException('Router probe failed');
    return json_decode($out, true, 512, JSON_THROW_ON_ERROR);
}
$root = sys_get_temp_dir() . '/governor-studio-' . bin2hex(random_bytes(8));
mkdir($root, 0700); $root = realpath($root);
file_put_contents($root . '/.governor-owner-endpoint-test', 'disposable');
try {
    Fixture::copyTree(__DIR__ . '/../engine', $root . '/_studio/engine');
    Fixture::copyTree(__DIR__ . '/../api', $root . '/_studio/api');
    mkdir($root . '/_studio/data',0700); mkdir($root . '/_studio/logs',0700);
    symlink(realpath(dirname(__DIR__,2) . '/vendor'),$root . '/vendor');
    $db = Database::getInstance($root . '/_studio/data/studio.db');
    foreach (glob(__DIR__ . '/../engine/migrations/*.php') as $file) { $migration = require $file; ($migration['up'])($db); }
    $sessions = [];
    foreach (['owner','editor','viewer'] as $i => $role) {
        $uid = $db->insert('users', ['email'=> $role.'@example.test','password_hash'=>'not-a-login','name'=>'Fixture','role'=>$role,'created_at'=>'2026-09-24','updated_at'=>'2026-09-24']);
        $sessions[$role] = bin2hex(random_bytes(32));
        $db->insert('sessions',['id'=>$sessions[$role],'user_id'=>$uid,'ip_address'=>'127.0.0.1','user_agent'=>'fixture','expires_at'=>gmdate('Y-m-d\TH:i:s\Z',time()+3600),'created_at'=>gmdate('Y-m-d\TH:i:s\Z')]);
    }
    $appKey = Encryption::generateKey(); $secret = bin2hex(random_bytes(32));
    file_put_contents($root.'/_studio/data/config.json',json_encode(['app_key'=>$appKey]));
    $settings = new Settings($db);
    $map = ['cheap'=>['provider'=>'claude','model'=>'small'],'frontier'=>['provider'=>'claude','model'=>'large']];
    foreach (['editor','viewer'] as $role) {
        $r = requestStudio($root,['method'=>'PUT','path'=>'/settings','session'=>$sessions[$role],'csrf'=>$sessions[$role], 'body'=>['governor.mode'=>'enforce','governor.typesafe_api_key'=>$secret,'governor.model_map'=>$map]]);
        check($r['status']===403, "$role cannot configure Router through real router");
        check(!$settings->has('governor.mode'), 'Rejected update is atomic');
        check(!str_contains(json_encode($r),$secret), 'Rejected response excludes key');
    }
    $owner = ['session'=>$sessions['owner'],'csrf'=>$sessions['owner']];
    $r = requestStudio($root,$owner+['method'=>'PUT','path'=>'/settings','body'=>['governor.mode'=>'enforce','governor.typesafe_api_key'=>$secret,'governor.model_map'=>$map]]);
    check($r['status']===200,'Owner saves mode/key/map through router');
    $settings->clearCache(); $cipher=$settings->get('governor.typesafe_api_key');
    check($cipher!==$secret && (new Encryption($appKey))->decrypt($cipher)===$secret,'Key stored encrypted');
    $r = requestStudio($root,$owner+['method'=>'PUT','path'=>'/settings','body'=>['governor.mode'=>'enforce']]);
    $settings->clearCache();
    check($r['status'] === 200, 'Unchanged key and dropdown save succeeds with mode-only payload');
    check($settings->get('governor.typesafe_api_key') === $cipher, 'Omitted synthetic dots preserve exact stored ciphertext');
    check($settings->get('governor.model_map') === $map, 'Unchanged dropdowns preserve saved model map');
    $cross = $map; $cross['cheap']['provider'] = 'openai';
    $r = requestStudio($root,$owner+['method'=>'PUT','path'=>'/settings','body'=>['governor.model_map'=>$cross]]);
    check($r['status']===422,'Real router rejects cross-provider map');
    $r = requestStudio($root,$owner+['method'=>'PUT','path'=>'/settings','body'=>['ai_provider'=>'openai']]);
    check($r['status']===200,'Real router changes saved AI provider');
    $settings->clearCache();
    check($settings->get('governor.model_map')===$map,'Provider switch preserves old binding without rebinding models');
    $r=requestStudio($root,['method'=>'GET','path'=>'/settings','session'=>$sessions['owner']]);
    check($r['response']['data']['settings']['governor.model_map_error']['code']==='governor_model_map','Router read exposes obsolete-map warning');
    $r = requestStudio($root,$owner+['method'=>'PUT','path'=>'/settings','body'=>['governor.model_map'=>$map]]);
    check($r['status']===422,'Real router rejects stale Router form');
    $r = requestStudio($root,$owner+['method'=>'PUT','path'=>'/settings','body'=>['governor.model_map'=>[]]]);
    check($r['status']===200,'Owner can clear obsolete map');
    $settings->set('ai_provider','claude');
    // No generator credential exists in this disposable installation: list lookup
    // must return an empty list plus its binding, never attempt a vendor call.
    foreach (['claude', 'openai', 'gemini', 'deepseek', 'openai_compatible'] as $providerId) {
        $settings->set('ai_provider', $providerId);
        $r = requestStudio($root, ['method'=>'GET','path'=>'/settings/models','session'=>$sessions['owner']]);
        check($r['status'] === 200 && $r['response']['data']['provider'] === $providerId, 'Model list identifies the saved provider');
        check($r['response']['data']['models'] === [], 'Missing credential returns an empty model list');
        check(!str_contains(json_encode($r), $secret), 'Model list excludes TypeSafe secret');
    }
    $settings->set('ai_provider', 'claude');
    $seed = function(int $user, array $result, string $mode='enforce') use ($db,$secret): int {
        return $db->insert('prompt_log',['user_id'=>$user,'action_type'=>'inline_edit','action_data'=>json_encode(['governor_'.$mode=>$result+['candidate'=>$secret,'candidate_hash'=>$secret]]),'user_prompt'=>$secret,'ai_provider'=>'claude','ai_model'=>'model','status'=>in_array($result['status']??'', ['applied','answered','acknowledged'],true)?'success':'error','error_message'=>$result['reason']??null,'created_at'=>'2026-09-24']);
    };
    $route=['intent'=>'edit_copy','model_tier'=>'cheap'];
    $first=$seed(1,['status'=>'applied','reason'=>'accepted','route'=>$route]);
    $recordCheck=function(int $job,string $kind,string $id) use($db):void {
        $db->insert('ai_call_ledger',['id'=>$id,'prompt_log_id'=>$job,'kind'=>$kind,'provider'=>'typesafe','model'=>'jev-fixture','method'=>'evaluate','status'=>'success','started_at'=>'2026-09-24']);
    };
    $recordCheck($first,'gate','gate-1');
    $db->insert('ai_call_ledger',['id'=>'call-1','prompt_log_id'=>$first,'kind'=>'generation','provider'=>'claude','model'=>'configured','method'=>'complete','status'=>'error','started_at'=>'2026-09-24']);
    $seed(1,['status'=>'rejected','reason'=>'gate_unavailable','route'=>$route]);
    $answer=$seed(2,['status'=>'answered','reason'=>'question','route'=>['intent'=>'question','model_tier'=>'none']]);
    $recordCheck($answer,'classify','classify-1');
    $shadow=$seed(1,['status'=>'ok','error'=>null,'call_id'=>'shadow-1'],'shadow');
    $recordCheck($shadow,'classify','shadow-1');
    $seed(1,['status'=>$secret,'reason'=>$secret,'route'=>['intent'=>$secret,'model_tier'=>$secret]]);
    foreach (['owner'=>4,'editor'=>1,'viewer'=>0] as $role=>$count) {
        $r=requestStudio($root,['method'=>'GET','path'=>'/settings','session'=>$sessions[$role]]);
        check($r['status']===200,"$role reads safe settings");
        // Helper wraps the real response under response.
        $body=$r['response'];
        check(count($body['data']['governor_activity']['items'])===$count,"$role sees only own outcomes");
        foreach ([$secret,$cipher,'governor.typesafe_api_key'] as $forbidden) check(!str_contains(json_encode($body),$forbidden),'Settings and activity exclude secrets');
    }
    $activity=(new RouterActivity($db))->recent(1);
    $byId=array_column($activity['items'],null,'id');
    check($byId[$first]['requested_tier']==='cheap' && $byId[$first]['providers']===['claude'],'Requested tier does not misrepresent actual provider');
    check($byId[$first]['generation_calls']===1,'Failed generation attempts remain visible');
    check(end($activity['items'])['id']===$first,'Newest records first');
    check($activity['items'][0]['reason']==='unknown','Unknown metadata is never reflected');
    $spoof=$seed(1,['status'=>'applied','reason'=>'accepted','route'=>$route]);
    check(!in_array($spoof,array_column((new RouterActivity($db))->recent(1)['items'],'id'),true),'Client-shaped metadata without gate cannot claim a checked edit');
    $recordCheck($spoof,'gate','spoof-gate');
    $db->update('prompt_log',['system_prompt_hash'=>'legacy-context'],'id = ?',[$spoof]);
    check(!in_array($spoof,array_column((new RouterActivity($db))->recent(1)['items'],'id'),true),'Legacy context cannot masquerade as enforced apply');
    $routingJob = $db->insert('prompt_log', ['user_id'=>1, 'action_type'=>'inline_edit',
        'action_data'=>json_encode(['governor_routing'=>['mode'=>'shadow','status'=>'preview','reason'=>'preview',
            'proposal'=>['intent'=>'edit_copy','recipe'=>'inline_edit','context'=>'focused','model'=>'proposed-small'],
            'target'=>['file_path'=>$secret], 'prompt'=>$secret]]),
        'user_prompt'=>$secret, 'ai_provider'=>'claude','ai_model'=>'default-large','status'=>'success','created_at'=>'2026-09-24']);
    $db->insert('ai_call_ledger', ['id'=>'routing-generation','prompt_log_id'=>$routingJob,'kind'=>'generation',
        'provider'=>'claude','model'=>'actual-large','method'=>'complete','status'=>'success','started_at'=>'2026-09-24']);
    $routingItems = array_column((new RouterActivity($db))->recent(1)['items'], null, 'id');
    check($routingItems[$routingJob]['models'] === ['actual-large'] && $routingItems[$routingJob]['proposed_model'] === 'proposed-small', 'Preview separates actual ledger model from proposal');
    check($routingItems[$routingJob]['recipe'] === 'inline_edit' && $routingItems[$routingJob]['context'] === 'focused', 'Routing work projection retains bounded recipe and context');
    check(!str_contains(json_encode($routingItems[$routingJob]), $secret) && !isset($routingItems[$routingJob]['target']), 'Routing activity excludes targets and arbitrary prompt metadata');
    $db->update('prompt_log', ['action_data'=>json_encode(['governor_routing'=>['mode'=>'enforce', 'status'=>'fallback', 'reason'=>'configuration_error', 'intent'=>$secret, 'recipe'=>$secret, 'context'=>$secret, 'model'=>'https://credentials.test']])], 'id = ?', [$routingJob]);
    $fallback = array_column((new RouterActivity($db))->recent(1)['items'], null, 'id')[$routingJob];
    check($fallback['status'] === 'fallback' && $fallback['reason'] === 'configuration_error', 'Missing-key fallback stays visible without a classify call');
    check($fallback['intent'] === 'unknown' && $fallback['recipe'] === 'unknown' && $fallback['proposed_model'] === 'unknown', 'Untrusted routing values and credential URLs are filtered');
    $settings->delete('governor.typesafe_api_key');
    $r=requestStudio($root,['method'=>'GET','path'=>'/settings','session'=>$sessions['editor']]);
    check($r['response']['data']['settings']['governor.configuration_error']['code']==='governor_configuration','Editor can see missing-key config error');
    check(!is_file($root.'/gate-calls.jsonl'),'Settings reads and writes make zero vendor calls');
    for($i=0;$i<12;$i++) { $job=$seed(1,['status'=>'acknowledged','reason'=>'noop']); $recordCheck($job,'classify','noop-'.$i); }
    check(count((new RouterActivity($db))->recent(1)['items'])===10,'Summary bounded to ten turns');
    $db->exec('DROP TABLE ai_call_ledger');
    check((new RouterActivity($db))->recent(1)===['available'=>false,'items'=>[]],'Storage failure is unavailable, not no activity');
} catch(Throwable $e) { $errors[]='Studio contract exception: '.$e->getMessage(); }
finally { Database::closeInstance(); Fixture::remove($root); }
foreach($errors as $error) echo "FAIL: $error\n";
echo "Passed: $passed\nFailed: ".count($errors)."\n";
exit($errors===[]?0:1);
