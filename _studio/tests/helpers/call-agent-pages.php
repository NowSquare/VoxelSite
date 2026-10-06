<?php

declare(strict_types=1);

$root = realpath($argv[1] ?? '');
if ($root === false || !str_starts_with($root, realpath(sys_get_temp_dir()) . '/')
    || !is_file($root . '/.agent-pages-test')) {
    throw new RuntimeException('Disposable Agent pages installation required.');
}
foreach (['router.php', 'pages.php'] as $file) {
    if (hash_file('sha256', $root . '/_studio/api/agent/v1/' . $file)
        !== hash_file('sha256', dirname(__DIR__, 2) . '/api/agent/v1/' . $file)) {
        throw new RuntimeException('Agent endpoint copy differs from production.');
    }
}
$input = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
require_once dirname(__DIR__, 3) . '/vendor/autoload.php';
spl_autoload_register(static function (string $class) use ($root): void {
    if (str_starts_with($class, 'VoxelSite\\')) {
        $path = $root . '/_studio/engine/' . str_replace('\\', '/', substr($class, 10)) . '.php';
        if (is_file($path)) {
            require_once $path;
        }
    }
}, true, true);
putenv('VS_TEST_PREVIEW_DIR');
putenv('VS_TEST_ASSETS_DIR');
require_once $root . '/_studio/engine/bootstrap.php';

if (($input['operation'] ?? '') === 'setup') {
    $db = VoxelSite\Database::getInstance();
    (new VoxelSite\Migrator($db))->run();
    foreach ([1 => 'editor', 7 => 'owner'] as $id => $role) {
        $db->insert('users', ['id' => $id, 'email' => $role . '@example.test',
            'password_hash' => 'not-a-login', 'name' => 'Test ' . $role, 'role' => $role,
            'created_at' => now(), 'updated_at' => now()]);
    }
    (new VoxelSite\Settings($db))->set('agent_api_enabled', true);
    $auth = new VoxelSite\AgentAuth($db);
    $keys = [];
    foreach (['agent', 'editor', 'viewer'] as $role) {
        $keys[$role] = $auth->createKey('Test ' . $role, $role)['key'];
    }
    (new VoxelSite\PageService($db))->createPage('existing', 'Existing', '<?php /* original */ ?><h1>Existing</h1>');
    echo json_encode($keys, JSON_THROW_ON_ERROR);
    exit;
}

// Replace only the CLI request-body transport; routing, auth and storage are real.
final class AgentPagesInputStream
{
    public $context;
    private int $offset = 0;
    private string $body = '';
    public function stream_open($path, $mode, $options, &$openedPath): bool
    {
        global $input;
        if ($path !== 'php://input') {
            return false;
        }
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
$_SERVER = ['REQUEST_METHOD' => $input['method'],
    'REQUEST_URI' => '/_studio/api/agent/v1' . $input['path'], 'REMOTE_ADDR' => '127.0.0.1'];
if (isset($input['key'])) {
    $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $input['key'];
}
$_GET = $_POST = $_COOKIE = [];
stream_wrapper_unregister('php');
stream_wrapper_register('php', AgentPagesInputStream::class);
ob_start();
register_shutdown_function(static function (): void {
    $raw = ob_get_clean();
    stream_wrapper_restore('php');
    echo json_encode(['status' => http_response_code() ?: 200,
        'response' => json_decode($raw, true, 512, JSON_THROW_ON_ERROR)], JSON_THROW_ON_ERROR);
});
require $root . '/_studio/api/agent/v1/router.php';
