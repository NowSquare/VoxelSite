<?php
declare(strict_types=1);
require_once __DIR__ . '/helpers/StudioRuntimeFixture.php';

use VoxelSite\Tests\StudioRuntimeFixture;

$root = realpath(sys_get_temp_dir()) . '/vs-runtime-fixture-' . bin2hex(random_bytes(8));
mkdir($root, 0700);
$checks = 0;
function runtimeCheck(bool $ok, string $message): void {
    global $checks;
    if (!$ok) throw new RuntimeException('FAIL ' . $message);
    $checks++;
    echo "PASS $message\n";
}
function runtimeRemove(string $path): void {
    if (is_link($path) || is_file($path)) { unlink($path); return; }
    foreach (scandir($path) as $name) if ($name !== '.' && $name !== '..') runtimeRemove($path . '/' . $name);
    rmdir($path);
}
try {
    mkdir($root . '/_studio/data', 0700, true);
    file_put_contents($root . '/_studio/data/config.json', '{"fixture":"preserved"}');
    file_put_contents($root . '/VERSION', '1.32.0-fixture');
    StudioRuntimeFixture::copy($root);
    foreach (['engine/bootstrap.php', 'engine/Agent/McpApplication.php', 'update-gate.php', 'update-runtime.php',
        'factory-reset-gate.php', 'factory-reset.php', 'static/update-runtime-core.php',
        'static/factory-reset-runtime.php', 'static/mcp-standalone.php', 'mcp.php', 'agent-capabilities.json', 'mcp-client-qualification.json'] as $path) {
        runtimeCheck(is_file($root . '/_studio/' . $path)
            && hash_file('sha256', $root . '/_studio/' . $path) === hash_file('sha256', dirname(__DIR__) . '/' . $path),
            'Required runtime dependency is an exact production copy: ' . $path);
    }
    runtimeCheck(file_get_contents($root . '/_studio/data/config.json') === '{"fixture":"preserved"}'
        && file_get_contents($root . '/VERSION') === '1.32.0-fixture', 'Runtime copy preserves prepared fixture state and upgrade version');
    runtimeCheck(!file_exists($root . '/_studio/data/studio.db') && !is_dir($root . '/_studio/preview')
        && !is_dir($root . '/assets') && !is_dir($root . '/_data'), 'Runtime copy never imports the installed website, database or business records');
    $templateHashes = [];
    foreach (['appointment', 'callback', 'contact', 'event-registration', 'feedback', 'newsletter',
        'quote-request', 'reservation', 'waitlist'] as $id) {
        $path = '/_studio/action-templates/' . $id . '.json';
        $templateHashes[$id] = hash_file('sha256', dirname(__DIR__, 2) . $path);
        runtimeCheck(is_file($root . $path) && hash_file('sha256', $root . $path) === $templateHashes[$id],
            'Shipped Action template is an exact production copy: ' . $id);
    }
    $code = 'require ' . var_export($root . '/_studio/engine/bootstrap.php', true) . '; echo (new ReflectionClass(VoxelSite\\Database::class))->getFileName();';
    $process = proc_open([PHP_BINARY, '-r', $code], [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes, $root);
    fclose($pipes[0]); $out = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $err = stream_get_contents($pipes[2]); fclose($pipes[2]); $exit = proc_close($process);
    runtimeCheck($exit === 0 && $err === '' && $out === $root . '/_studio/engine/Database.php', 'Copied Composer autoload resolves only copied application classes');
    file_put_contents($root . '/template-inventory.php', <<<'PHP'
<?php
require __DIR__ . '/_studio/engine/bootstrap.php';
$db = VoxelSite\Database::getInstance(__DIR__ . '/_studio/data/fixture-templates.db');
$db->exec("CREATE TABLE users (id INTEGER PRIMARY KEY, role TEXT); INSERT INTO users VALUES (1, 'owner')");
$policy = new VoxelSite\Agent\ActorPolicy($db);
$workspace = new VoxelSite\SiteWorkspace($db, __DIR__ . '/_studio/preview', __DIR__, __DIR__ . '/_studio/data/workspace-migration', __DIR__ . '/assets');
$service = new VoxelSite\Agent\ActionService($db, $policy, $workspace, __DIR__ . '/_studio/data/actions',
    __DIR__ . '/_data/actions.db', __DIR__ . '/_studio/assets/data/site.json', __DIR__ . '/_studio/action-templates');
$owner = new VoxelSite\Agent\OperationActor('user', 1, null, [], 'studio_configured', null);
echo json_encode($service->templates($owner, new stdClass()), JSON_THROW_ON_ERROR);
PHP);
    $process = proc_open([PHP_BINARY, $root . '/template-inventory.php'], [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes, $root);
    fclose($pipes[0]); $out = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $err = stream_get_contents($pipes[2]); fclose($pipes[2]); $exit = proc_close($process);
    $inventory = json_decode($out, true);
    $copiedHashes = array_column($inventory['items'] ?? [], 'version', 'id');
    ksort($copiedHashes); ksort($templateHashes);
    runtimeCheck($exit === 0 && $err === '' && ($inventory['total'] ?? null) === 9
        && array_key_exists('next_offset', $inventory) && $inventory['next_offset'] === null && ($inventory['provider_calls'] ?? null) === 0
        && $copiedHashes === $templateHashes, 'Copied runtime lists all nine shipped Action templates with their exact versions');
    try { StudioRuntimeFixture::copy(dirname(__DIR__, 2)); runtimeCheck(false, 'Source checkout must be rejected'); }
    catch (RuntimeException $error) { runtimeCheck(str_contains($error->getMessage(), 'disposable'), 'Runtime copy rejects its source checkout'); }
    symlink($root . '/_studio', $root . '/linked');
    try { StudioRuntimeFixture::copy($root . '/linked'); runtimeCheck(false, 'Linked destination must be rejected'); }
    catch (RuntimeException $error) { runtimeCheck(str_contains($error->getMessage(), 'disposable'), 'Runtime copy rejects a linked destination'); }
    echo "$checks runtime fixture checks passed\n";
} finally { runtimeRemove($root); }
