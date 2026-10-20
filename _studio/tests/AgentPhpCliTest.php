<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
require_once __DIR__ . '/helpers/RouterHeadingFixture.php';

use VoxelSite\Database;
use VoxelSite\Tests\RouterHeadingFixture;

$passed = 0;
$errors = [];
function check(bool $ok, string $message): void
{
    global $passed, $errors;
    $ok ? $passed++ : $errors[] = $message;
}

function cliWrapper(string $path, string $root, string $label): void
{
    file_put_contents($path, "#!/bin/sh\n"
        . 'if [ "$1" != "-r" ]; then printf %s ' . escapeshellarg($label)
        . ' > ' . escapeshellarg($root . '/selected-php') . "; fi\n"
        . 'exec ' . escapeshellarg(PHP_BINARY) . ' "$@"' . "\n");
    chmod($path, 0700);
}

foreach (['bindir', 'cli-binary', 'no-cli', 'non-cli', 'failed-probe', 'not-executable', 'exec-disabled'] as $scenario) {
    $root = sys_get_temp_dir() . '/agent-php-cli-' . bin2hex(random_bytes(8));
    mkdir($root, 0700);
    $root = realpath($root);
    file_put_contents($root . '/.governor-continuation-test', 'disposable');
    Database::resetInstance();
    try {
        foreach (['_studio/api/agent/v1', '_studio/worker', '_studio/logs', "PHP installation's bin"] as $path) {
            mkdir($root . '/' . $path, 0700, true);
        }
        copy(__DIR__ . '/../api/agent/v1/prompt.php', $root . '/_studio/api/agent/v1/prompt.php');
        file_put_contents($root . '/_studio/worker/prompt-runner.php', <<<'PHP'
<?php
$args = getopt('', ['job:', 'key-id:', 'root:']);
$root = $args['root'];
if (!is_file($root . '/.governor-continuation-test')) { exit(2); }
$ack = $root . '/worker.json';
file_put_contents($ack . '.tmp', json_encode($args));
rename($ack . '.tmp', $ack);
PHP);
        $db = Database::getInstance($root . '/studio.db');
        foreach (glob(__DIR__ . '/../engine/migrations/*.php') as $path) {
            $migration = require $path;
            ($migration['up'])($db);
        }
        $db->insert('users', ['email' => 'fixture@example.test', 'password_hash' => 'not-a-login', 'name' => 'Fixture',
            'role' => 'owner', 'created_at' => '2026-09-24', 'updated_at' => '2026-09-24']);

        // A valid executable exposed as PHP_BINARY by a web SAPI must be ignored.
        cliWrapper($root . '/web-binary', $root, 'binary');
        $installed = $root . "/PHP installation's bin/php";
        if ($scenario === 'bindir' || $scenario === 'exec-disabled') {
            cliWrapper($installed, $root, 'installation');
        } elseif ($scenario === 'non-cli' || $scenario === 'failed-probe') {
            $sapi = $scenario === 'non-cli' ? 'fpm-fcgi' : 'cli';
            $exit = $scenario === 'non-cli' ? 0 : 1;
            file_put_contents($installed, "#!/bin/sh\nprintf %s {$sapi}\nexit {$exit}\n");
            chmod($installed, 0700);
        } elseif ($scenario === 'not-executable') {
            cliWrapper($installed, $root, 'installation');
            chmod($installed, 0600);
        }

        $command = [PHP_BINARY];
        if ($scenario === 'exec-disabled') {
            array_push($command, '-d', 'disable_functions=exec');
        }
        array_push($command, __DIR__ . '/helpers/call-agent-php-cli.php', $root, $scenario);
        $child = proc_open($command, [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes);
        if (!is_resource($child)) {
            throw new RuntimeException('Cannot start endpoint probe');
        }
        fwrite($pipes[0], json_encode(['body' => ['prompt' => 'Update the bakery heading',
            'php_binary' => $root . '/web-binary'], 'key_id' => 41], JSON_THROW_ON_ERROR));
        fclose($pipes[0]);
        $stdout = stream_get_contents($pipes[1]); fclose($pipes[1]);
        $stderr = stream_get_contents($pipes[2]); fclose($pipes[2]);
        $exit = proc_close($child);
        if ($exit !== 0 || $stderr !== '') {
            throw new RuntimeException('Endpoint probe failed: ' . $stderr);
        }
        $result = json_decode($stdout, true, 512, JSON_THROW_ON_ERROR);

        // Also wait on unexpected 202 responses during the red phase so cleanup
        // cannot race a detached worker that the old endpoint wrongly launched.
        if ($result['status'] === 202) {
            $deadline = microtime(true) + 5;
            while (!is_file($root . '/worker.json') && microtime(true) < $deadline) {
                usleep(10000);
            }
            if (!is_file($root . '/worker.json')) {
                throw new RuntimeException('Disposable worker did not acknowledge job');
            }
        }

        if (in_array($scenario, ['bindir', 'cli-binary'], true)) {
            check($result['status'] === 202, "{$scenario}: usable CLI queues a job");
            check($db->count('conversations') === 1 && $db->count('prompt_log') === 1,
                "{$scenario}: accepted request allocates one conversation and job");
            $selected = is_file($root . '/selected-php') ? file_get_contents($root . '/selected-php') : null;
            check($selected === ($scenario === 'bindir' ? 'installation' : 'binary'),
                "{$scenario}: worker uses the verified installation or CLI binary");
            $ack = json_decode(file_get_contents($root . '/worker.json'), true);
            check($ack === ['job' => (string) $result['response']['data']['id'], 'key-id' => '41', 'root' => $root],
                "{$scenario}: real detached CLI worker receives allocated job and key");
        } else {
            $expectedCode = $scenario === 'exec-disabled' ? 'exec_unavailable' : 'php_cli_unavailable';
            check($result['status'] === 503 && ($result['response']['error']['code'] ?? '') === $expectedCode,
                "{$scenario}: unavailable CLI returns a synchronous 503 {$expectedCode}");
            check($db->count('conversations') === 0 && $db->count('prompt_log') === 0,
                "{$scenario}: rejection allocates no conversation or job");
            check(!is_file($root . '/worker.json') && !is_file($root . '/selected-php'),
                "{$scenario}: rejection starts no worker");
        }
    } catch (Throwable $error) {
        $errors[] = "{$scenario}: {$error->getMessage()}";
    } finally {
        Database::resetInstance();
        RouterHeadingFixture::remove($root);
    }
}

foreach ($errors as $error) {
    echo "FAIL: {$error}\n";
}
echo "Passed: {$passed}\nFailed: " . count($errors) . "\n";
exit($errors === [] ? 0 : 1);
