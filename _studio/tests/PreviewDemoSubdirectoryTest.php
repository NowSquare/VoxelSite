<?php
declare(strict_types=1);

// This endpoint uses its installation-relative demo paths. It must only run
// from a disposable source copy, even though the fixture filenames are unique.
$root=realpath(dirname(__DIR__,2));
$temporaryRoots=array_filter([realpath(sys_get_temp_dir()),realpath('/tmp')]);
if (!is_string($root) || !array_filter($temporaryRoots,static fn(string $temporary):bool=>str_starts_with($root,$temporary.'/'))) {
    throw new RuntimeException('Run PreviewDemoSubdirectoryTest from a disposable copy under the system temporary directory.');
}
$name='preview-subdirectory-'.bin2hex(random_bytes(8));
$page=dirname(__DIR__).'/demo/preview/'.$name.'.php';
$css=dirname(__DIR__).'/demo/assets/css/'.$name.'.css';
foreach ([dirname($page),dirname($css)] as $directory) if (!is_dir($directory)) mkdir($directory,0700,true);
file_put_contents($page,'<!doctype html><html><head></head><body><a href="/about?lang=nl#team">About</a><img src="/assets/images/logo.png"></body></html>');
file_put_contents($css,'.logo{background:url("../images/logo.png")}');
$checks=0;
$call=static function(string $prefix,string $path): string {
    $pipes=[];
    $process=proc_open([PHP_BINARY,__DIR__.'/helpers/call-preview-demo.php',$prefix,$path],[1=>['pipe','w'],2=>['pipe','w']],$pipes);
    if (!is_resource($process)) throw new RuntimeException('Cannot start the copied demo endpoint.');
    $body=stream_get_contents($pipes[1]);$errors=stream_get_contents($pipes[2]);
    fclose($pipes[1]);fclose($pipes[2]);$status=proc_close($process);
    if ($status!==0) throw new RuntimeException('Copied demo endpoint failed: '.$errors);
    return $body;
};
$check=static function(bool $ok,string $label) use (&$checks):void {
    $checks++;
    if (!$ok) throw new RuntimeException('FAIL '.$label);
    echo 'PASS '.$label."\n";
};
try {
    foreach (['/tenant','/tenant.v1','/tenant%2Ev1','/tenant&review'] as $prefix) {
        $base=$prefix.'/_studio/api/router.php?_path=%2Fpreview&path=';
        $html=$call($prefix,$name.'.php');
        $check(str_contains($html,htmlspecialchars($base.'about.php&lang=nl#team',ENT_QUOTES|ENT_HTML5,'UTF-8')),
            $prefix.': demo page links retain the installation route');
        $check(str_contains($html,htmlspecialchars($base.'assets/images/logo.png',ENT_QUOTES|ENT_HTML5,'UTF-8')),
            $prefix.': demo image references retain the installation route');
        $check(str_contains($html,'var PREVIEW_BASE = '.json_encode($base,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_SLASHES)),
            $prefix.': demo hot reload retains the installation route');
        $check(str_contains($call($prefix,'assets/css/'.$name.'.css'),$base.'assets/images/logo.png'),
            $prefix.': demo CSS dependencies retain the installation route');
    }
    echo "Demo preview: {$checks} checks passed\n";
} finally {
    unlink($page);unlink($css);
}
