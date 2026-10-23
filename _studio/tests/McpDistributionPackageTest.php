<?php
declare(strict_types=1);

// This suite exercises Step 8 on disposable staging, never git commits or a release ZIP.
$source = realpath(dirname(__DIR__, 2)); $temporaryRoot = realpath(sys_get_temp_dir());
if (!$source || !$temporaryRoot || !str_starts_with($source, $temporaryRoot . '/')) throw new RuntimeException('Run package tests from a canonical disposable outer source copy.');
require $source . '/scripts/verify-package.php';
$root = $temporaryRoot . '/vs-distribution-' . bin2hex(random_bytes(8));
mkdir($root, 0700); $root = realpath($root); $stage = $root . '/package'; mkdir($stage, 0700);
$checks = 0;
function packageCheck(bool $condition, string $label): void { global $checks; $checks++; if (!$condition) throw new RuntimeException('FAIL ' . $label); echo 'PASS ' . $label . "\n"; }
function packageCommand(array $command): array {
    global $source;
    $process = proc_open($command, [0=>['pipe','r'],1=>['pipe','w'],2=>['redirect',1]], $pipes, $source,
        array_merge(getenv(), ['PHP_BIN'=>PHP_BINARY]));
    if (!is_resource($process)) throw new RuntimeException('Cannot start package verification.');
    fclose($pipes[0]); $stdout = stream_get_contents($pipes[1]); fclose($pipes[1]);
    return ['exit'=>proc_close($process),'output'=>$stdout];
}
function packageStep(string $mode = 'fresh'): array { global $source,$stage; return packageCommand(['bash',$source.'/scripts/build-dist.sh','--verify-staging',$stage,'--mode',$mode]); }

foreach (DistributionVerifier::requiredFiles($source) as $path) {
    $from = $source . '/' . match ($path) {
        'index.php' => '_studio/data/default-index.php',
        'actions-bar.js', 'actions-bar.css' => '_studio/static/' . $path,
        default => $path,
    };
    if (!is_file($from)) throw new RuntimeException('Complete the current source before package tests: ' . $path);
    $destination = $stage . '/' . $path;
    if (!is_dir(dirname($destination))) mkdir(dirname($destination),0700,true);
    if (!copy($from,$destination)) throw new RuntimeException('Cannot copy package fixture.');
}
$required = ['submit.php','actions-bar.js','actions-bar.css','_studio/mcp.php','_studio/update-gate.php','_studio/update-runtime.php','_studio/factory-reset.php',
    '_studio/factory-reset-gate.php','_studio/static/update-runtime-core.php','_studio/static/factory-reset-runtime.php',
    '_studio/static/mcp-standalone.php','_studio/agent-capabilities.json','_studio/mcp-client-qualification.json',
    '_studio/engine/Agent/ActionConfiguration.php'];
foreach (glob($source.'/_studio/engine/migrations/*.php') ?: [] as $path) $required[] = '_studio/engine/migrations/'.basename($path);
$preserved = ['index.php','favicon.ico','.htaccess','LocalValetDriver.php'];
foreach (['fresh','upgrade'] as $mode) {
    if ($mode === 'upgrade') foreach ($preserved as $path) {
        if (is_file($stage.'/'.$path)) unlink($stage.'/'.$path);
    }
    $result = packageStep($mode);
    packageCheck($result['exit']===0, ucfirst($mode).' staging passes the exact build Step 8 gate: '.trim($result['output']));
    packageCheck(!file_exists($stage.'/_studio/tests')&&!file_exists($stage.'/docs')&&str_contains($result['output'],'development evidence and tests are intentionally not shipped'),$mode.' inventory excludes developer tests/evidence without claiming qualification');
    $studioRulesPath = '_studio/.htaccess';
    $studioRules = file_get_contents($source.'/'.$studioRulesPath);
    $testsDenial = 'RewriteRule ^tests(?:/|$) - [F,L]';
    $withoutTestsDenial = str_replace($testsDenial, '', $studioRules);
    foreach ([
        'missing' => $withoutTestsDenial,
        'commented' => str_replace($testsDenial, '# '.$testsDenial, $studioRules),
        'after routing' => str_replace('RewriteRule ^ui/ - [L]', 'RewriteRule ^ui/ - [L]'."\n    ".$testsDenial, $withoutTestsDenial),
    ] as $case => $unsafeRules) {
        // Identical source/package bytes must still fail the security contract.
        // The canonical outer-copy guard above makes this source edit disposable.
        file_put_contents($source.'/'.$studioRulesPath, $unsafeRules);
        file_put_contents($stage.'/'.$studioRulesPath, $unsafeRules);
        try { $result=packageStep($mode); packageCheck($result['exit']!==0&&str_contains($result['output'],'Retained development tests must be denied before Studio routing'),$mode.' Step 8 refuses '.$case.' retained-tests denial'); }
        finally { file_put_contents($source.'/'.$studioRulesPath,$studioRules);file_put_contents($stage.'/'.$studioRulesPath,$studioRules); }
    }
    foreach (array_merge($required,$mode==='fresh' ? $preserved : []) as $path) {
        rename($stage.'/'.$path,$root.'/held');
        try { $result=packageStep($mode); packageCheck($result['exit']!==0&&str_contains($result['output'],'Missing critical file: '.$path),$mode.' Step 8 refuses omitted '.$path); }
        finally { rename($root.'/held',$stage.'/'.$path); }
    }
    if ($mode==='upgrade') foreach ($preserved as $path) {
        file_put_contents($stage.'/'.$path,'Would overwrite installed website or hosting bytes');
        try { $result=packageStep($mode); packageCheck($result['exit']!==0&&str_contains($result['output'],'Upgrade package must preserve installed root file: '.$path),'Upgrade refuses root overwrite entry '.$path); }
        finally { unlink($stage.'/'.$path); }
    }
    $bundle=$stage.'/_studio/ui/dist/studio.js';$original=file_get_contents($bundle);file_put_contents($bundle,$original."\n/* stale package */\n");
    try { $result=packageStep($mode); packageCheck($result['exit']!==0&&str_contains($result['output'],'Package differs from reviewed source: _studio/ui/dist/studio.js'),$mode.' Step 8 refuses stale committed build output'); }
    finally { file_put_contents($bundle,$original); }
    mkdir($stage.'/_studio/tests',0700);file_put_contents($stage.'/_studio/tests/leaked.php','<?php exit;');
    try { $result=packageStep($mode); packageCheck($result['exit']!==0&&str_contains($result['output'],'must not ship: _studio/tests'),$mode.' Step 8 refuses executable development tests'); }
    finally { unlink($stage.'/_studio/tests/leaked.php');rmdir($stage.'/_studio/tests'); }
    file_put_contents($stage.'/_studio/engine/migrations/999_unreviewed.php','<?php');
    try { $result=packageStep($mode); packageCheck($result['exit']!==0&&str_contains($result['output'],'Migration inventory must exactly match'),$mode.' Step 8 refuses an unreviewed migration inventory'); }
    finally { unlink($stage.'/_studio/engine/migrations/999_unreviewed.php'); }
}
$result=packageStep('unknown');
packageCheck($result['exit']!==0&&str_contains($result['output'],'Unknown package mode'),'Unknown package mode fails closed');
$result=packageCommand([PHP_BINARY,$source.'/_studio/tests/McpParityManifestTest.php','--package-root',$stage,'--release']);
packageCheck($result['exit']!==0&&str_contains($result['output'],'cannot run the development release gate'),'Package inventory cannot bypass the development release qualification gate');
packageCheck(!file_exists($root.'/package.zip'),'Staging checks never create or qualify a release ZIP');
echo 'Distribution staging: '.$checks." checks passed.\n";
