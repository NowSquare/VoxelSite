<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/engine/bootstrap.php';
use VoxelSite\Agent\{ChangeSetValidator, OperationException};
$checks = 0;
function changeCheck(bool $ok, string $label): void {
    global $checks; $checks++;
    if (!$ok) { fwrite(STDERR, "FAIL {$label}\n"); exit(1); } echo "PASS {$label}\n";
}
function changeReject(callable $fn, string $code, string $label): void {
    try { $fn(); } catch (OperationException $e) { changeCheck($e->errorCode === $code, $label . ' (' . $e->errorCode . ')'); return; }
    changeCheck(false, $label);
}
changeCheck(class_exists(ChangeSetValidator::class), 'Complete change validation exists');
$validator = new ChangeSetValidator();
$create = (object) ['type' => 'create', 'path' => 'index.php', 'expected_hash' => null, 'content' => '<?php $page = []; ?><h1>Hello</h1>'];
$current = [];
$validated = $validator->resolve([$create], $current);
changeCheck($validated['index.php']['content'] === $create->content, 'Resolve complete new source without executing it');
changeReject(fn () => $validator->resolve([$create,$create], []), 'invalid_schema', 'Duplicate operations fail together');
changeReject(fn () => $validator->resolve([(object) array_merge((array) $create, ['extra' => true])], []), 'invalid_schema', 'Unknown operation fields fail');
changeReject(fn () => $validator->resolve([$create], ['index.php' => 'newer']), 'content_conflict', 'Creation requires absence');
changeReject(fn () => $validator->resolve([(object) ['type' => 'replace','path'=>'index.php','expected_hash'=>str_repeat('a',64),'content'=>'new']], ['index.php'=>'old']), 'content_conflict', 'Replacement checks source hash');
$hash = hash('sha256', 'same same');
changeReject(fn () => $validator->resolve([(object) ['type' => 'edit','path'=>'index.php','expected_hash'=>$hash,'before'=>'same','after'=>'new']], ['index.php'=>'same same']), 'content_conflict', 'Ambiguous exact edit fails');
changeReject(fn () => $validator->resolve([(object) ['type' => 'create','path'=>'assets/css/tailwind.css','expected_hash'=>null,'content'=>'bad']], []), 'invalid_path', 'Derived CSS cannot be supplied');
changeReject(fn () => $validator->resolve([(object) ['type' => 'create','path'=>'assets/data/memory.json','expected_hash'=>null,'content'=>'{}']], []), 'invalid_schema', 'Memory replacement is rejected');
$memory = (object) ['type'=>'merge','path'=>'assets/data/memory.json','expected_hash'=>null,
    'delta'=>(object) ['set'=>(object) ['business_name'=>(object) ['value'=>'Example','confidence'=>'stated']], 'remove'=>[]]];
$merged = $validator->resolve([$memory], []);
changeCheck(json_decode($merged['assets/data/memory.json']['content'],true)['business_name']['value'] === 'Example', 'Memory merges preserve its value/confidence contract');
$memory->delta->set->business_name->confidence = 'fabricated';
changeReject(fn () => $validator->resolve([$memory], []), 'invalid_schema', 'Invalid memory confidence fails');
changeReject(fn () => $validator->resolve([(object) ['type'=>'create','path'=>'assets/data/site.json','expected_hash'=>null,'content'=>'{bad']], []), 'invalid_schema', 'Malformed JSON fails');
changeReject(fn () => $validator->resolve([(object) ['type'=>'create','path'=>'index.php','expected_hash'=>null,'content'=>'<?php this is invalid syntax']], []), 'invalid_schema', 'Malformed PHP fails without include or exec');
changeReject(fn () => $validator->resolve([(object) ['type'=>'create','path'=>'index.php','expected_hash'=>null,'content'=>str_repeat('x',1048577)]], []), 'size_limit', 'Oversized source fails before staging');
$effect = sys_get_temp_dir() . '/vs-no-include-' . bin2hex(random_bytes(4));
$validator->resolve([(object) ['type'=>'create','path'=>'index.php','expected_hash'=>null,
    'content'=>'<?php file_put_contents(' . var_export($effect,true) . ', "bad");']], []);
changeCheck(!file_exists($effect), 'PHP validation never executes submitted source');
echo "Change validator: {$checks} checks passed\n";
