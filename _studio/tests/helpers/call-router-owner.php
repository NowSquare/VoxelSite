<?php
declare(strict_types=1);

namespace {
    // Only the TypeSafe transport is replaced. Authentication, CSRF, demo mode,
    // route dispatch and the endpoint all run their unchanged production bytes.
    $root = realpath($argv[1] ?? '');
    if ($root === false || !is_file($root . '/.governor-owner-endpoint-test')
        || !str_starts_with($root, realpath(sys_get_temp_dir()) . '/')) {
        fwrite(STDERR, "Disposable owner endpoint root required\n"); exit(2);
    }
    $source = dirname(__DIR__, 2);
    foreach (['api/router.php', 'api/middleware.php', 'engine/bootstrap.php', 'engine/DemoMode.php'] as $path) {
        if (hash_file('sha256', $root . '/_studio/' . $path) !== hash_file('sha256', $source . '/' . $path)) {
            fwrite(STDERR, "Production routing copy changed\n"); exit(2);
        }
    }
    foreach (['api/endpoints/router.php', 'engine/RouterPendingHeading.php'] as $path) {
        if (is_file($source . '/' . $path) && (!is_file($root . '/_studio/' . $path)
            || hash_file('sha256', $root . '/_studio/' . $path) !== hash_file('sha256', $source . '/' . $path))) {
            fwrite(STDERR, "Production Router copy changed\n"); exit(2);
        }
    }
    $input = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
    require_once dirname(__DIR__, 3) . '/vendor/autoload.php';
    spl_autoload_register(static function (string $class) use ($root): void {
        if (!str_starts_with($class, 'VoxelSite\\')) { return; }
        $relative = str_replace('\\', '/', substr($class, strlen('VoxelSite\\')));
        if (str_starts_with($relative, 'Providers/')) { $relative = 'providers/' . substr($relative, 10); }
        $path = $root . '/_studio/engine/' . $relative . '.php';
        if (is_file($path)) { require_once $path; }
    }, true, true);
    require_once $root . '/_studio/engine/TypeSafeClientInterface.php';
    $GLOBALS['ownerProbeRoot'] = $root;
    $GLOBALS['ownerProbeMode'] = $input['gate_mode'] ?? 'blocked';
    $GLOBALS['ownerProbePauseGate'] = ($input['pause_gate'] ?? false) === true;
}

namespace VoxelSite {
    final class TypeSafeHttpClient implements TypeSafeClientInterface
    {
        public function __construct(#[\SensitiveParameter] string $key, ?callable $transport = null) {
            RouterSecrets::remember($key);
        }
        public function evaluate(array $state, array $questions): array {
            if (RouterSecrets::redact($state) !== $state) { throw new \RuntimeException('Secret reached fake gate'); }
            file_put_contents($GLOBALS['ownerProbeRoot'] . '/gate-calls.jsonl',
                json_encode(['state' => $state, 'questions' => array_keys($questions)], JSON_THROW_ON_ERROR) . "\n", FILE_APPEND | LOCK_EX);
            if ($GLOBALS['ownerProbePauseGate']) {
                $root = $GLOBALS['ownerProbeRoot'];
                file_put_contents($root . '/gate-ready', 'ready');
                $deadline = microtime(true) + 10;
                while (!is_file($root . '/gate-release') && microtime(true) < $deadline) { usleep(1000); }
                if (!is_file($root . '/gate-release')) { throw new \RuntimeException('Fixture gate barrier timed out'); }
            }
            if ($GLOBALS['ownerProbeMode'] === 'down') { throw new \RuntimeException('Fixture gate unavailable'); }
            return ['status' => 'ok', 'answers' => ['forbidden_claims' => ['type' => 'noul', 'noul' => 0.9]],
                'model' => 'jev-fixture', 'usage' => ['input_tokens' => 1, 'output_tokens' => 1],
                'cost_usd' => null, 'duration_ms' => 0.0, 'calls' => 1, 'error' => null];
        }
    }
}

namespace {
    final class OwnerEndpointInputStream
    {
        public $context;
        private int $offset = 0;
        private string $body = '';
        public function stream_open($path, $mode, $options, &$openedPath): bool {
            global $input;
            if ($path !== 'php://input' || $mode !== 'rb') { return false; }
            $this->body = json_encode($input['body'] ?? [], JSON_THROW_ON_ERROR);
            return true;
        }
        public function stream_read($count): string {
            $part = substr($this->body, $this->offset, $count); $this->offset += strlen($part); return $part;
        }
        public function stream_eof(): bool { return $this->offset >= strlen($this->body); }
        public function stream_stat(): array { return []; }
    }
    $_SERVER = ['REQUEST_METHOD' => $input['method'], 'REQUEST_URI' => '/_studio/api' . $input['path'],
        'REMOTE_ADDR' => '127.0.0.1', 'SERVER_PORT' => '443', 'HTTPS' => 'on'];
    $_COOKIE = isset($input['session']) ? ['vs_session' => $input['session']] : [];
    if (isset($input['csrf'])) { $_SERVER['HTTP_X_VS_TOKEN'] = $input['csrf']; }
    if (isset($input['authorization'])) { $_SERVER['HTTP_AUTHORIZATION'] = $input['authorization']; }
    $_GET = []; $_POST = []; $_REQUEST = [];
    // Deliberately avoid FileManager's path environment seam: copied classes must
    // resolve their normal production defaults to the disposable installation.
    putenv('VS_TEST_PREVIEW_DIR'); putenv('VS_TEST_ASSETS_DIR');
    ini_set('error_log', $root . '/_studio/logs/php-errors.log');
    stream_wrapper_unregister('php');
    stream_wrapper_register('php', OwnerEndpointInputStream::class);
    ob_start();
    register_shutdown_function(static function (): void {
        $raw = ob_get_clean();
        stream_wrapper_restore('php');
        $code = http_response_code();
        echo json_encode(['status' => $code === false ? 200 : $code,
            'response' => json_decode($raw, true), 'valid_json' => json_last_error() === JSON_ERROR_NONE], JSON_THROW_ON_ERROR);
    });
    require $root . '/_studio/api/router.php';
}
