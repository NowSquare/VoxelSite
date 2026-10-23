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
require_once $root . '/vendor/autoload.php';
spl_autoload_register(static function (string $class) use ($root): void {
    if (str_starts_with($class, 'VoxelSite\\')) {
        $path = $root . '/_studio/engine/' . str_replace('\\', '/', substr($class, 10)) . '.php';
        if (is_file($path)) {
            require_once $path;
        }
    }
}, true, true);
putenv('VS_TEST_PREVIEW_DIR=' . $root . '/_studio/preview');
putenv('VS_TEST_ASSETS_DIR=' . $root . '/assets');
putenv('VS_TEST_DOC_ROOT=' . $root);
putenv('VS_TEST_WORKSPACE_STATE_DIR=' . $root . '/_studio/data/workspace');
putenv('VS_TEST_REVISIONS_DIR=' . $root . '/_studio/revisions');
putenv('VS_TEST_MUTATION_LOCK=' . $root . '/_studio/data/site-mutation.lock');
require_once $root . '/_studio/engine/bootstrap.php';

if (($input['operation'] ?? '') === 'setup') {
    $db = VoxelSite\Database::getInstance();
    (new VoxelSite\Migrator($db))->run();
    if (!str_starts_with((new ReflectionClass(VoxelSite\FileManager::class))->getFileName(), $root . '/')
        || (new ReflectionMethod(VoxelSite\FileManager::class, '__construct'))->getNumberOfParameters() < 2) {
        throw new RuntimeException('Fixture FileManager and explicit workspace injection are required.');
    }
    if (!is_dir($root . '/assets')) mkdir($root . '/assets', 0700, true);
    $workspace = new VoxelSite\SiteWorkspace($db, $root . '/_studio/preview', $root);
    $db->update('site_workspace_state',['format'=>2],'id=1');
    file_put_contents($root.'/_studio/preview/.htaccess',VoxelSite\SiteWorkspace::ACCESS_MARKER."\nRequire all denied\nDeny from all\n");
    foreach ([1 => 'editor', 7 => 'owner', 9 => 'viewer'] as $id => $role) {
        $db->insert('users', ['id' => $id, 'email' => $role . '@example.test',
            'password_hash' => 'not-a-login', 'name' => 'Test ' . $role, 'role' => $role,
            'created_at' => now(), 'updated_at' => now()]);
    }
    (new VoxelSite\Settings($db))->set('agent_api_enabled', true);
    $auth = new VoxelSite\AgentAuth($db);
    $keys = [];
    foreach (['agent', 'editor', 'viewer'] as $role) {
        $key=$auth->createKey('Test '.$role,$role);$keys[$role]=$key['key'];
        $policy=new VoxelSite\Agent\ActorPolicy($db);
        $policy->bindRestCredential(new VoxelSite\Agent\OperationActor('user',7,null,[],'studio_configured',null),$key['id'],['agent'=>7,'editor'=>1,'viewer'=>9][$role]);
    }
    $fixture=dirname(__DIR__).'/fixtures/mcp/site-lifecycle/site';
    foreach(VoxelSite\SiteWorkspace::inventory($fixture)['files'] as $path=>$meta)VoxelSite\Agent\WorkspaceFiles::write($root.'/_studio/preview',$path,file_get_contents($fixture.'/'.$path));
    VoxelSite\Agent\WorkspaceFiles::write($root.'/_studio/preview','existing.php',"<?php \$page=['title'=>'Existing','slug'=>'existing']; include __DIR__.'/_partials/header.php'; ?><h1>Existing</h1><?php include __DIR__.'/_partials/footer.php'; ?>");
    VoxelSite\Agent\WorkspaceFiles::write($root.'/_studio/preview','_partials/nav.php',"<?php\n".VoxelSite\NavLinksParser::serialize([['label'=>'Home','href'=>'/','home'=>true],['label'=>'Existing','href'=>'/existing']])."\n?><nav></nav>");
    VoxelSite\Agent\WorkspaceFiles::write($root.'/_studio/preview','assets/js/form-handler.js',file_get_contents(dirname(__DIR__,2).'/static/form-handler.js'));
    (new VoxelSite\FileManager($db,$workspace))->syncPageRegistry(true);
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
