<?php
declare(strict_types=1);
namespace VoxelSite { function loadConfig(): array { return $GLOBALS['router_config']; } }
namespace {
require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
use VoxelSite\{AICallLedger, Database, Encryption, AIRouter, Settings, TypeSafeClientInterface};
$passed = 0; $errors = [];
function verify(bool $ok, string $label): void { global $passed, $errors; $ok ? $passed++ : $errors[] = $label; }
final class RouterTestClient implements TypeSafeClientInterface {
    public array $changes = []; public array $states = []; public bool $fail = false; public ?Closure $during = null;
    public function evaluate(array $state, array $questions): array {
        $this->states[] = $state;
        if ($this->during) { ($this->during)(); }
        if ($this->fail) { throw new RuntimeException('private transport failure'); }
        $answers = [];
        foreach ($questions as $id => $q) {
            $answers[$id] = $q['type'] === 'noul' ? ['noul' => $id === 'needs_file_write' ? 0.99 : 0.01]
                : ['choice' => ['intent' => 'edit_copy', 'scope' => 'one_section', 'model_tier' => 'cheap', 'repair_target' => 'target_0'][$id], 'confidence' => 0.99];
            $answers[$id] = array_replace($answers[$id], $this->changes[$id] ?? []);
        }
        return ['status' => 'ok', 'model' => 'jev-fixture', 'answers' => $answers, 'usage' => ['input_tokens' => 20, 'output_tokens' => 10]];
    }
}
$root = sys_get_temp_dir() . '/governor-router-' . bin2hex(random_bytes(6)); mkdir($root); mkdir($root . '/nested');
file_put_contents($root . '/nested/home.php', '<h1>Hello</h1>'); putenv('VS_TEST_PREVIEW_DIR=' . $root);
Database::resetInstance(); $db = Database::getInstance(':memory:');
$db->exec('CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)');
$db->exec('CREATE TABLE pages (id INTEGER PRIMARY KEY, slug TEXT, title TEXT, file_path TEXT, page_type TEXT)');
$db->exec('CREATE TABLE prompt_log (id INTEGER PRIMARY KEY)');
$db->insert('pages', ['id' => 1, 'slug' => 'home', 'title' => 'Home', 'file_path' => 'nested/home.php', 'page_type' => 'page']);
$migration = require __DIR__ . '/../engine/migrations/007_ai_call_ledger.php'; ($migration['up'])($db);
$settings = new Settings($db); $GLOBALS['router_config'] = ['app_key' => Encryption::generateKey()]; $key = bin2hex(random_bytes(20));
$map = ['cheap' => ['provider' => 'claude', 'model' => 'small'], 'frontier' => ['provider' => 'claude', 'model' => 'large']];
$settings->setMany(['ai_provider' => 'claude', 'ai_claude_model' => 'default', 'governor.mode' => 'off', 'governor.model_map' => $map,
    'governor.typesafe_api_key' => (new Encryption($GLOBALS['router_config']['app_key']))->encrypt($key)]);
$client = new RouterTestClient(); $built = 0;
$router = new AIRouter($db, $settings, function () use ($client, &$built) { $built++; return $client; });
$ledger = new AICallLedger($db);
$request = ['action_type' => 'inline_edit', 'page_scope' => 'home', 'user_prompt' => 'Shorten this text',
    'action_data' => ['path' => 'nested/home.php', 'selection' => '<h1>Hello</h1>', 'sectionHtml' => 'PRIVATE_BODY']];
$r = $router->route($request, $ledger);
verify($r['status'] === 'off' && $r['model'] === 'default' && $built === 0, 'Off uses saved provider model without constructing TypeSafe');
$settings->set('governor.mode', 'enforce');
$r = $router->route($request, $ledger);
verify($r['status'] === 'routed' && $r['tier'] === 'cheap' && $r['context'] === 'focused', 'Bounded copy chooses cheap focused route');
verify($r['recipe'] === 'inline_edit' && $r['page_scope'] === 'home' && $r['target']['file_path'] === 'nested/home.php', 'Explicit action, scope and canonical nested path survive');
verify($r['target']['content_hash'] === hash_file('sha256', $root . '/nested/home.php'), 'Target uses entire file hash');
verify(!str_contains(json_encode($client->states), 'PRIVATE_BODY') && !str_contains(json_encode($client->states), $key), 'State excludes source bodies and secrets');
verify(!isset($client->states[0]['targets']['target_0']['source_address']), 'Selection source stays local');
$client->during = fn() => file_put_contents($root . '/nested/home.php', 'changed');
$prior = hash_file('sha256', $root . '/nested/home.php'); $r = $router->route($request, $ledger);
verify($r['target']['content_hash'] === $prior, 'Hash predates classification and concurrent changes'); $client->during = null;
foreach (['create_site', 'import_site', 'restyle_site', 'change_design', 'add_page', 'add_section', 'optimize_aeo'] as $action) {
    $r = $router->route(array_replace($request, ['action_type' => $action]), $ledger);
    verify($r['recipe'] === $action && $r['tier'] === 'frontier', 'Broad explicit action preserved with frontier floor: ' . $action);
}
$client->changes = ['intent' => ['choice' => 'question'], 'needs_file_write' => ['noul' => 0.01]];
$r = $router->route($request, $ledger);
verify($r['status'] === 'fallback' && $r['recipe'] === 'inline_edit', 'Question classification never downgrades explicit write');
$free = array_replace($request, ['action_type' => 'free_prompt']); $r = $router->route($free, $ledger);
verify($r['recipe'] === 'question' && $r['context'] === 'readonly', 'Confident question receives readonly route');
$settings->set('governor.model_map', []); $r = $router->route($free, $ledger);
verify($r['recipe'] === 'question' && $r['model'] === 'default' && $r['reason'] === 'model_map_missing', 'Questions remain readonly with configured model absent mapping');
$client->changes = []; $r = $router->route($request, $ledger);
verify($r['status'] === 'fallback' && $r['reason'] === 'model_map_missing', 'Writes fall back without model map');
$settings->set('governor.model_map', $map); $settings->set('ai_provider', 'openai'); $r = $router->route($request, $ledger);
verify($r['reason'] === 'model_map_invalid', 'Provider mismatch falls back'); $settings->set('ai_provider', 'claude');
$client->changes = ['intent' => ['confidence' => 0.79]]; $r = $router->route($request, $ledger);
verify($r['reason'] === 'low_confidence', 'Low confidence falls back');
$client->changes = ['repair_target' => ['choice' => '../../secret.php']]; $r = $router->route($request, $ledger);
verify($r['status'] === 'fallback', 'Arbitrary model path is never accepted');
$client->changes = []; $client->fail = true; $r = $router->route($request, $ledger);
verify($r['status'] === 'fallback' && !str_contains(json_encode($r), 'private'), 'Transport exception gives sanitized fallback'); $client->fail = false;
$client->changes = ['repair_target' => ['choice' => 'page_1']];
$unscoped = ['action_type' => 'free_prompt', 'user_prompt' => 'Shorten the home page heading'];
$r = $router->route($unscoped, $ledger);
verify($r['recipe'] === 'edit_page' && $r['page_scope'] === 'home', 'Free prompt resolves a registered page ID into edit recipe and slug');
foreach (['theme' => 'change_design', 'restyle' => 'restyle_site', 'add_page' => 'free_prompt'] as $intent => $recipe) {
    $client->changes = ['intent' => ['choice' => $intent], 'repair_target' => ['choice' => 'none']];
    $r = $router->route($unscoped, $ledger);
    verify($r['recipe'] === $recipe && $r['context'] === 'full' && $r['tier'] === 'frontier', 'Free broad recipe preserves required context: ' . $intent);
}
$client->changes = ['intent' => ['choice' => 'add_page'], 'repair_target' => ['choice' => 'none']];
$r = $router->route($unscoped + ['action_data' => ['page_name' => 'Services']], $ledger);
verify($r['recipe'] === 'add_page', 'Complete add page payload selects existing recipe');
$before = count($client->states); $r = $router->route(array_replace($unscoped, ['user_prompt' => str_repeat('x', 12001)]), $ledger);
verify($r['reason'] === 'request_too_large' && count($client->states) === $before, 'Oversized prompt falls back before classifier, never classifies a truncation');
$client->changes = [];
foreach (['theme', 'restyle'] as $intent) {
    $client->changes = ['intent' => ['choice' => $intent], 'repair_target' => ['choice' => 'none']];
    $r = $router->route($free, $ledger);
    verify($r['recipe'] === 'edit_page' && $r['page_scope'] === 'home', 'Selected page constrains broad free intent: ' . $intent);
    $r = $router->route(['action_type' => 'free_prompt', 'user_prompt' => 'Restyle this page', 'page_scope' => 'unknown'], $ledger);
    verify($r['status'] === 'fallback' && $r['reason'] === 'unresolved_scope', 'Unresolvable explicit scope falls back: ' . $intent);
}
$client->changes = ['intent' => ['choice' => 'noop'], 'model_tier' => ['choice' => 'none'],
    'needs_file_write' => ['noul' => 0.01], 'repair_target' => ['choice' => 'none']];
foreach (['Leave everything unchanged', 'No changes.', 'Do not change anything!'] as $prompt) {
    $r = $router->route(['action_type' => 'free_prompt', 'user_prompt' => $prompt], $ledger);
    verify($r['recipe'] === 'noop' && $r['tier'] === 'none' && $r['model'] === null, 'Explicit unchanged acknowledgement can skip generation');
}
foreach (['Change the heading', 'No changes except make the heading blue'] as $prompt) {
    $r = $router->route(['action_type' => 'free_prompt', 'user_prompt' => $prompt], $ledger);
    verify($r['status'] === 'fallback' && $r['recipe'] === 'free_prompt', 'Arbitrary request cannot be discarded as noop');
}
$r = $router->route(array_replace($request, ['user_prompt' => 'No changes']), $ledger);
verify($r['status'] === 'fallback' && $r['recipe'] === 'inline_edit', 'Explicit editor action cannot become noop');
$client->changes = ['model_tier' => ['choice' => 'none']];
$exact = array_replace($request, ['user_prompt' => 'Replace the selected heading with "New text".']);
file_put_contents($root . '/nested/home.php', '<h1>Hello</h1>');
$r = $router->route($exact, $ledger);
verify($r['recipe'] === 'replace_text' && $r['replacement'] === '<h1>New text</h1>', 'Exact HTML text replacement skips writing model');
foreach ([
    '<?php /* <h1>Hello</h1> */ ?>',
    '<?php $value = \'<h1>Hello</h1>\'; ?>',
    '<script>const x = "<h1>Hello</h1>";</script>',
    '<!-- <h1>Hello</h1> -->',
    '<div title="<h1>Hello</h1>">Other</div>',
    '<template><h1>Hello</h1></template>',
] as $source) {
    file_put_contents($root . '/nested/home.php', $source);
    $r = $router->route($exact, $ledger);
    verify($r['recipe'] !== 'replace_text', 'Executable, commented, template and attribute selections require normal generation');
}
file_put_contents($root . '/nested/home.php', '<h1>Hello</h1>');
foreach (['add_section', 'create_site', 'restyle_site', 'section_edit'] as $action) {
    $r = $router->route(array_replace($exact, ['action_type' => $action]), $ledger);
    verify($r['recipe'] === $action, 'Exact replacement cannot override explicit action: ' . $action);
}
$client->changes['scope'] = ['choice' => 'whole_site'];
$r = $router->route($exact, $ledger);
verify($r['recipe'] !== 'replace_text', 'Whole-site work cannot become a local text replacement');
$client->changes = [];
$settings->set('governor.mode', 'shadow'); $r = $router->route($request, $ledger);
verify($r['status'] === 'preview' && $r['model'] === 'default' && $r['context'] === 'legacy' && $r['proposal']['model'] === 'small', 'Preview records proposed route without applying it');
$settings->set('governor.typesafe_api_key', null); $r = $router->route($request, $ledger);
verify($r['status'] === 'fallback' && $r['reason'] === 'configuration_error', 'Missing key leaves editing available');
verify($db->queryOne("SELECT COUNT(*) n FROM ai_call_ledger WHERE kind = 'classify' AND provider = 'typesafe' AND model = 'jev-fixture'")['n'] > 0, 'Classification ledger stores resolved model identity');
unlink($root . '/nested/home.php'); rmdir($root . '/nested'); rmdir($root); putenv('VS_TEST_PREVIEW_DIR');
foreach ($errors as $error) { echo "FAIL: $error\n"; } echo "Passed: $passed\nFailed: " . count($errors) . "\n"; exit($errors === [] ? 0 : 1);
}
