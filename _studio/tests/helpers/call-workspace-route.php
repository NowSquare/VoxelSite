<?php
declare(strict_types=1);

$root = realpath($argv[1] ?? '');
if ($root === false || !str_starts_with($root, realpath(sys_get_temp_dir()) . '/')
    || !is_file($root . '/.workspace-route-test')) {
    throw new RuntimeException('Disposable workspace route installation required.');
}
foreach (['router.php', 'middleware.php', 'endpoints/workspace.php'] as $file) {
    if (hash_file('sha256', $root . '/_studio/api/' . $file)
        !== hash_file('sha256', dirname(__DIR__, 2) . '/api/' . $file)) {
        throw new RuntimeException('Workspace route copy differs from production.');
    }
}
$input = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
require_once $root . '/vendor/autoload.php';
spl_autoload_register(static function (string $class) use ($root): void {
    if (str_starts_with($class, 'VoxelSite\\')) {
        $path = $root . '/_studio/engine/' . str_replace('\\', '/', substr($class, 10)) . '.php';
        if (is_file($path)) require_once $path;
    }
}, true, true);
putenv('VS_TEST_PREVIEW_DIR=' . $root . '/_studio/preview');
putenv('VS_TEST_ASSETS_DIR=' . $root . '/assets');
putenv('VS_TEST_DOC_ROOT=' . $root);
putenv('VS_TEST_MUTATION_LOCK=' . $root . '/_studio/data/site-mutation.lock');
require_once $root . '/_studio/engine/bootstrap.php';
if (!str_starts_with((new ReflectionClass(VoxelSite\SiteWorkspace::class))->getFileName(), $root . '/')) {
    throw new RuntimeException('Workspace resolver must come from disposable fixture.');
}

if (($input['operation'] ?? '') === 'setup') {
    $db = VoxelSite\Database::getInstance();
    (new VoxelSite\Migrator($db))->run();
    $sessions = [];
    foreach ([1 => 'owner', 2 => 'editor'] as $id => $role) {
        $db->insert('users', ['id' => $id, 'email' => $role . '@example.test',
            'password_hash' => 'not-a-login', 'name' => 'Test ' . $role, 'role' => $role,
            'created_at' => now(), 'updated_at' => now()]);
        $sessions[$role] = bin2hex(random_bytes(32));
        $db->insert('sessions', ['id' => $sessions[$role], 'user_id' => $id,
            'ip_address' => '127.0.0.1', 'user_agent' => 'Workspace upgrade fixture',
            'expires_at' => gmdate('Y-m-d\TH:i:s\Z', time() + 3600), 'created_at' => now()]);
    }
    echo json_encode($sessions, JSON_THROW_ON_ERROR);
    exit;
}

// CLI replaces only request-body transport; production router/auth/CSRF run.
final class WorkspaceInputStream
{
    public $context;
    private int $offset = 0;
    private string $body = '';
    public function stream_open($path, $mode, $options, &$openedPath): bool
    {
        global $input;
        if ($path !== 'php://input') return false;
        $this->body = json_encode($input['body'] ?? [], JSON_THROW_ON_ERROR);
        return true;
    }
    public function stream_read($count): string
    {
        $part = substr($this->body, $this->offset, $count);
        $this->offset += strlen($part);
        return $part;
    }
    public function stream_eof(): bool { return $this->offset >= strlen($this->body); }
    public function stream_stat(): array { return []; }
}
$_SERVER = ['REQUEST_METHOD' => $input['method'], 'REQUEST_URI' => '/_studio/api/router.php',
    'REMOTE_ADDR' => '127.0.0.1'];
if (isset($input['csrf'])) $_SERVER['HTTP_X_VS_TOKEN'] = $input['csrf'];
$_COOKIE = isset($input['session']) ? ['vs_session' => $input['session']] : [];
$_GET = ['_path' => $input['path']] + ($input['query'] ?? []);
$_POST = $_REQUEST = [];
stream_wrapper_unregister('php');
stream_wrapper_register('php', WorkspaceInputStream::class);
ob_start();
register_shutdown_function(static function (): void {
    $raw = ob_get_clean();
    stream_wrapper_restore('php');
    echo json_encode(['status' => http_response_code() ?: 200,
        'response' => json_decode($raw, true) ?? $raw], JSON_THROW_ON_ERROR);
});
require $root . '/_studio/api/router.php';
