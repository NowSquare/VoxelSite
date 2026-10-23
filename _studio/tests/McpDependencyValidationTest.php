<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/engine/bootstrap.php';
use VoxelSite\Agent\{ChangeSetValidator, JsonSchema, OperationException, PublishPlanService, SitePathPolicy, ToolContracts};

$checks = 0; $failures = [];
function dependencyCase(string $label, callable $test): void {
    global $checks, $failures; $checks++;
    try { if ($test() !== true) throw new RuntimeException('Assertion failed'); echo "PASS {$label}\n"; }
    catch (Throwable $error) { $failures[] = $label; echo "FAIL {$label}: {$error->getMessage()}\n"; }
}
function dependencyReject(callable $test, string $code): bool {
    try { $test(); } catch (OperationException $error) { return $error->errorCode === $code; }
    return false;
}
$validator = new ChangeSetValidator();
$partials = array_fill_keys(['_partials/header.php','_partials/nav.php','_partials/footer.php'], '');
foreach (['https://cdn.example.com/assets/images/hero.png', '//cdn.example.com/assets/images/hero.png',
    'custom:assets/images/hero.png', 'https://cdn.example.com/image?fallback=/assets/images/hero.png'] as $url) {
    dependencyCase('External URL is not a managed dependency: ' . $url, fn() => $validator->dependencies($partials + ['index.php'=>'<img src="'.$url.'">'], []) === []);
}
$before = $partials + ['index.php'=>'<img src="/assets/images/missing.png">', 'assets/css/style.css'=>':root{}'];
$after = $before; $after['assets/css/style.css'] = ':root{--color-primary:#123456}';
dependencyCase('CSS-only change reports an existing broken reference as a warning', function() use($validator,$before,$after): bool {
    $warnings = $validator->dependencies($after,$before);
    JsonSchema::validate(JsonSchema::output(['blocking'=>[], 'warnings'=>$warnings, 'not_run'=>[]]), ToolContracts::validation());
    return count($warnings) === 1 && $warnings[0]['code'] === 'pre_existing_dependency' && $warnings[0]['path'] === 'index.php';
});
$changedPage = $before; $changedPage['index.php'] .= '<h1>Updated copy</h1>';
dependencyCase('Changed page can retain its old broken reference with a warning', fn() => count($validator->dependencies($changedPage,$before)) === 1);
$imported = ['index.php'=>'<!doctype html><h1>Imported page</h1>', 'assets/css/style.css'=>':root{}'];
$importedAfter = $imported; $importedAfter['assets/css/style.css'] .= 'body{color:black}';
dependencyCase('Imported site without shared partials permits a CSS edit with warnings', fn() => count($validator->dependencies($importedAfter,$imported)) === 3);
dependencyCase('A new site still requires its shared partials', fn() => dependencyReject(fn()=>$validator->dependencies($imported,[]),'invalid_schema'));
$newReference = $before; $newReference['index.php'] .= '<img src="/assets/images/new-missing.png">';
dependencyCase('A new missing managed reference blocks the complete change', fn() => dependencyReject(fn()=>$validator->dependencies($newReference,$before),'invalid_schema'));
$withAsset = $partials + ['index.php'=>'<img src="/assets/images/hero.png">', 'assets/images/hero.png'=>'image'];
$withoutAsset = $withAsset; unset($withoutAsset['assets/images/hero.png']);
dependencyCase('Deleting an asset still referenced by unchanged source blocks', fn() => dependencyReject(fn()=>$validator->dependencies($withoutAsset,$withAsset),'invalid_schema'));
$withInclude = $partials + ['index.php'=>"<?php include __DIR__ . '/_partials/extra.php';", '_partials/extra.php'=>'<p>Extra</p>'];
$withoutInclude = $withInclude; unset($withoutInclude['_partials/extra.php']);
dependencyCase('Deleting a partial still included by unchanged source blocks', fn() => dependencyReject(fn()=>$validator->dependencies($withoutInclude,$withInclude),'invalid_schema'));
dependencyCase('Pre-existing missing PHP include is a warning', fn() => count($validator->dependencies($withoutInclude,$withoutInclude)) === 1);
dependencyCase('Relative and root local assets remain validated beside external URLs', fn() => dependencyReject(fn()=>$validator->dependencies($partials + ['assets/css/style.css'=>'body{background:url(https://cdn.example.com/assets/images/hero.png),url(/assets/images/missing.png)}'],[]),'invalid_schema'));
$many = $partials + ['index.php'=>implode('',array_map(fn($i)=>'<img src="/assets/images/missing-'.$i.'.png">',range(1,510)))];
dependencyCase('Warning overflow is explicit and remains inside the public schema', function() use($validator,$many): bool {
    $warnings = $validator->dependencies($many,$many);
    JsonSchema::validate(JsonSchema::output(['blocking'=>[], 'warnings'=>$warnings, 'not_run'=>[]]), ToolContracts::validation());
    return count($warnings) === 500 && $warnings[499]['code'] === 'dependency_warnings_truncated';
});
$unicode = $partials + ['index.php'=>"<?php include __DIR__ . '/".str_repeat('頁',900).".php';"];
dependencyCase('Bounded warning text preserves valid UTF-8 source names', function() use($validator,$unicode): bool {
    $warnings = $validator->dependencies($unicode,$unicode);
    JsonSchema::validate(JsonSchema::output(['blocking'=>[], 'warnings'=>$warnings, 'not_run'=>[]]), ToolContracts::validation());
    return count($warnings) === 1 && mb_check_encoding($warnings[0]['message'],'UTF-8');
});
foreach (['aaa'=>'aa', 'ababa'=>'aba'] as $source=>$anchor) {
    dependencyCase('Overlapping exact anchor is ambiguous: '.$source.'/'.$anchor, fn() => dependencyReject(fn()=>$validator->resolve([(object)[
        'type'=>'edit','path'=>'index.php','expected_hash'=>hash('sha256',$source),'before'=>$anchor,'after'=>'new']],['index.php'=>$source]),'content_conflict'));
}
dependencyCase('Unique exact anchor replaces only its byte span', function() use($validator): bool {
    $result = $validator->resolve([(object)['type'=>'edit','path'=>'index.php','expected_hash'=>hash('sha256','aabaa'),'before'=>'aba','after'=>'X']],['index.php'=>'aabaa']);
    return $result['index.php']['content'] === 'aXa';
});
foreach (['api/actions.php','API/actions.php','actions/submit.php','i18n/en.php','data/config.php','dist/index.php'] as $path) {
    dependencyCase('Authoring excludes shipped directory: '.$path, fn() => dependencyReject(fn()=>SitePathPolicy::canonical($path,true),'invalid_path'));
    dependencyCase('Change sets cannot supply a shipped handler: '.$path, fn()=>dependencyReject(fn()=>$validator->resolve([(object)[
        'type'=>'create','path'=>$path,'expected_hash'=>null,'content'=>'<?php echo "replacement";']],[]),'invalid_path'));
    // actions/submit.php is an explicit engine-generated release output. It
    // remains publishable by that generator, never by a user change set.
    if ($path !== 'actions/submit.php') dependencyCase('Publication excludes shipped directory: '.$path, fn() => dependencyReject(fn()=>PublishPlanService::destination($path),'invalid_path'));
}
dependencyCase('Nested user pages and managed asset data remain authorable', fn()=>SitePathPolicy::canonical('services/actions.php',true)==='services/actions.php'
    && SitePathPolicy::canonical('assets/data/site.json',true)==='assets/data/site.json');
echo "Dependency validation: {$checks} checks, ".count($failures)." failed\n";
exit($failures ? 1 : 0);
