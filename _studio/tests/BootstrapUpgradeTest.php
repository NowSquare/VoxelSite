<?php
declare(strict_types=1);

// Exercise archive-order replacement in a disposable installation, never the
// real checkout. The 1.32.0 updater wrote each ZIP entry directly in entry order.
$source = dirname(__DIR__);
$root = realpath(sys_get_temp_dir()) . '/vs-bootstrap-upgrade-' . bin2hex(random_bytes(8));
mkdir($root, 0700);
if (realpath($root) !== $root || !str_starts_with($root, realpath(sys_get_temp_dir()) . '/vs-bootstrap-upgrade-')) {
    throw new RuntimeException('Canonical disposable installation required.');
}
mkdir($root . '/_studio/engine', 0700, true);
mkdir($root . '/vendor', 0700);
file_put_contents($root . '/vendor/autoload.php', '<?php file_put_contents(dirname(__DIR__)."/autoload-ran", "yes");');
file_put_contents($root . '/request.php', <<<'PHP'
<?php
ob_start();
register_shutdown_function(static function (): void {
    $body = ob_get_clean();
    echo json_encode(['status' => http_response_code() ?: 200, 'body' => $body,
        'fatal' => error_get_last(), 'autoload' => is_file(__DIR__ . '/autoload-ran')]);
});
require __DIR__ . '/' . $argv[1];
echo 'BOOTSTRAPPED';
PHP);
$checks = 0;
function upgradeCheck(bool $ok, string $label): void {
    global $checks;
    if (!$ok) throw new RuntimeException('FAIL ' . $label);
    $checks++;
    echo "PASS $label\n";
}
function upgradeRequest(string $entry): array {
    global $root;
    @unlink($root . '/autoload-ran');
    $process = proc_open([PHP_BINARY, $root . '/request.php', $entry],
        [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes, $root);
    if (!is_resource($process)) throw new RuntimeException('Cannot start disposable upgrade request.');
    fclose($pipes[0]); $out = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $error = stream_get_contents($pipes[2]); fclose($pipes[2]); $exit = proc_close($process);
    return ['exit' => $exit, 'stderr' => $error] + (json_decode($out, true) ?: ['raw' => $out]);
}
function upgradeRemove(string $path): void {
    if (is_link($path) || is_file($path)) { unlink($path); return; }
    foreach (scandir($path) as $name) if ($name !== '.' && $name !== '..') upgradeRemove($path . '/' . $name);
    rmdir($path);
}
try {
    $legacy = __DIR__ . '/fixtures/upgrade-1.32.0/bootstrap.php';
    upgradeCheck(hash_file('sha256', $legacy) === '5653af7ce563edea73cbf9114c4fc494d7922fef9bd19777fa20c83d0e863e42',
        'The legacy bootstrap remains byte-identical to release 1.32.0');
    copy($legacy, $root . '/_studio/engine/bootstrap.php');
    $before = upgradeRequest('_studio/engine/bootstrap.php');
    upgradeCheck($before['exit'] === 0 && $before['status'] === 200 && $before['body'] === 'BOOTSTRAPPED'
        && $before['autoload'], 'The frozen 1.32.0 bootstrap runs without an update gate');

    // Worst archive order: bootstrap and MCP arrive before the new stable bridge.
    foreach (['_studio/engine/bootstrap.php', '_studio/mcp.php', 'submit.php'] as $entry) {
        copy(dirname($source) . '/' . $entry, $root . '/' . $entry);
        $during = upgradeRequest($entry);
        upgradeCheck($during['exit'] === 0 && $during['status'] === 503 && $during['fatal'] === null
            && $during['stderr'] === '', $entry . ': partial legacy upgrade reports maintenance without a PHP fatal');
        upgradeCheck(!$during['autoload'] && !is_dir($root . '/_studio/data'),
            $entry . ': missing bridge never loads application code or creates installation data');
    }

    copy($source . '/update-gate.php', $root . '/_studio/update-gate.php');
    $after = upgradeRequest('_studio/engine/bootstrap.php');
    upgradeCheck($after['exit'] === 0 && $after['status'] === 200 && $after['body'] === 'BOOTSTRAPPED'
        && $after['autoload'], 'The same bootstrap resumes once the gate arrives later in the archive');

    // A damaged modern installation must never bypass an active maintenance gate.
    mkdir($root . '/_studio/data/updates', 0700, true);
    file_put_contents($root . '/_studio/data/updates/active.json', '{}');
    unlink($root . '/_studio/update-gate.php');
    $active = upgradeRequest('_studio/engine/bootstrap.php');
    upgradeCheck($active['exit'] === 0 && $active['status'] === 503 && !$active['autoload'],
        'An active retained update also fails closed when its bridge is unavailable');
    require $source . '/engine/Agent/UpdatePackagePolicy.php';
    foreach (['_studio/engine/bootstrap.php', '_studio/mcp.php', 'submit.php'] as $entry) {
        $bytes = file_get_contents(dirname($source) . '/' . $entry);
        upgradeCheck(\VoxelSite\Agent\UpdatePackagePolicy::gateContract($bytes, $entry),
            $entry . ': package validation accepts the exact guarded bridge contract');
        upgradeCheck(!\VoxelSite\Agent\UpdatePackagePolicy::gateContract(
            str_replace('http_response_code(503)', 'http_response_code(200)', $bytes), $entry),
            $entry . ': package validation rejects an altered missing-bridge guard');
        upgradeCheck(!\VoxelSite\Agent\UpdatePackagePolicy::gateContract(
            str_replace('declare(strict_types=1);', "declare(strict_types=1); echo 'before gate';", $bytes), $entry),
            $entry . ': package validation rejects work before the bridge guard');
    }
    echo "$checks bootstrap upgrade checks passed\n";
} finally { upgradeRemove($root); }
