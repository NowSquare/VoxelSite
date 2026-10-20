<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Database;
use VoxelSite\FileManager;
use VoxelSite\TailwindCompiler;

$root = sys_get_temp_dir() . '/vs-file-safety-' . bin2hex(random_bytes(6));
mkdir($root . '/preview', 0700, true);
mkdir($root . '/assets/css', 0700, true);
putenv('VS_TEST_PREVIEW_DIR=' . $root . '/preview');
putenv('VS_TEST_ASSETS_DIR=' . $root . '/assets');
$fm = new FileManager(Database::getInstance($root . '/studio.db'));
(new VoxelSite\Migrator(Database::getInstance()))->run();
$failures = [];
$check = static function (bool $ok, string $name) use (&$failures): void {
    echo ($ok ? 'PASS ' : 'FAIL ') . $name . "\n";
    if (!$ok) { $failures[] = $name; }
};
$original = '<?php $page = [\'title\' => \'Exact\']; ?><h1>Original</h1>';
file_put_contents($root . '/preview/index.php', $original);
chmod($root . '/preview/index.php', 0640);
$check(method_exists($fm, 'writeExactFile'), 'Reviewed patches have an exact writer without generation transforms');
if (method_exists($fm, 'writeExactFile')) {
    $fm->writeExactFile('index.php', $original);
    $check(file_get_contents($root . '/preview/index.php') === $original, 'Restoration preserves every original byte');
    clearstatcache();
    $check((fileperms($root . '/preview/index.php') & 0777) === 0640, 'Atomic replacement preserves file permissions');
    symlink($root . '/outside.php', $root . '/preview/escape.php');
    file_put_contents($root . '/outside.php', 'outside');
    $rejected = false;
    try { $fm->writeExactFile('escape.php', 'changed'); } catch (Throwable) { $rejected = true; }
    $check($rejected && file_get_contents($root . '/outside.php') === 'outside', 'Exact writer refuses symlink escape');
}
file_put_contents($root . '/assets/css/style.css', ':root { --color-fixturebrand: #123456; }');
$compiler = new TailwindCompiler($root . '/assets/css');
$check(str_contains($compiler->compileClasses(['bg-fixturebrand']), 'var(--color-fixturebrand)'), 'Compiler reads tokens from the fixture assets');
if (method_exists($fm, 'writeExactFile')) {
    file_put_contents($root . '/preview/index.php', '<h1 class="bg-fixturebrand p-7">Fixture</h1>');
    $result = $fm->compileTailwind();
    $css = @file_get_contents($root . '/assets/css/tailwind.css') ?: '';
    $check($result['ok'] && str_contains($css, '.p-7') && str_contains($css, 'var(--color-fixturebrand)'), 'FileManager compiles only the isolated files and output');
    chmod($root . '/assets/css/tailwind.css', 0640);
    $compiledOwner = fileowner($root . '/assets/css/tailwind.css');
    $fm->compileTailwind(); clearstatcache();
    $check((fileperms($root . '/assets/css/tailwind.css') & 0777) === 0640
        && fileowner($root . '/assets/css/tailwind.css') === $compiledOwner, 'Compilation preserves existing file permissions and ownership');
}
$metadata = <<<'PHP'
<?php $page = ['title' => 'Baker\'s story', 'description' => 'Bread, baked daily.']; ?><h1>Story</h1>
PHP;
file_put_contents($root . '/preview/index.php', $metadata);
$fm->syncPageRegistry(true);
$page = Database::getInstance()->queryOne('SELECT title, description FROM pages WHERE slug = ?', ['index']);
$check($page['title'] === "Baker's story" && $page['description'] === 'Bread, baked daily.', 'File truth refreshes escaped title and description projections');
file_put_contents($root . '/preview/index.php', '<?php $page = [\'title\'=>\'New story\']; ?>');
$fm->syncPageRegistry(true);
$page = Database::getInstance()->queryOne('SELECT title, description FROM pages WHERE slug = ?', ['index']);
$check($page['description'] === null, 'Removing file description clears stale metadata');
echo 'Fixture: ' . $root . "\n";
exit($failures ? 1 : 0);
