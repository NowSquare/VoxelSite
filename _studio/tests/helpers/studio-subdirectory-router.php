<?php
declare(strict_types=1);

$root=realpath(__DIR__);
if (!$root || !str_starts_with($root,realpath(sys_get_temp_dir()).'/vs-studio-subdir-')
    || !is_file($root.'/.studio-subdirectory-test')) throw new RuntimeException('Disposable HTTP fixture required.');
$path=parse_url($_SERVER['REQUEST_URI']??'/',PHP_URL_PATH);
if (!is_string($path) || !preg_match('~^(/(?:tenant|tenant&review))?/_studio(?:/|$)~D',$path,$match)) {
    http_response_code(404);return;
}
$prefix=$match[1]??'';$studio=$root.$prefix.'/_studio';
if ($path===$prefix.'/_studio/_cookie.php') {
    require $studio.'/engine/bootstrap.php';
    // Exercise the actual cookie writers without creating an installed database.
    $auth=(new ReflectionClass(VoxelSite\Auth::class))->newInstanceWithoutConstructor();
    $command=$_GET['command']??'read';
    if ($command==='reset-email') {
        // The real Auth implementation uses an in-memory database and a mail sink.
        class SubdirectoryMailSink {
            public static string $body='';
            public static function getInstance():self {return new self();}
            public function send(string $to,string $subject,string $body):bool {self::$body=$body;return true;}
        }
        class_alias(SubdirectoryMailSink::class,'VoxelSite\\Mailer');
        $db=VoxelSite\Database::getInstance(':memory:');
        $db->exec('CREATE TABLE users (id INTEGER PRIMARY KEY,email TEXT,name TEXT)');
        $db->insert('users',['id'=>1,'email'=>'fixture@example.invalid','name'=>'Fixture']);
        $auth=new VoxelSite\Auth($db);$result=$auth->sendResetEmail('fixture@example.invalid');
        header('Content-Type: application/json');echo json_encode(['result'=>$result,'email'=>SubdirectoryMailSink::$body]);return;
    }
    if ($command==='set' || $command==='clear') {
        $method=new ReflectionMethod(VoxelSite\Auth::class,$command==='set'?'setSessionCookie':'clearSessionCookie');
        $method->invokeArgs($auth,$command==='set'?[str_repeat('a',64)]:[]);
    }
    header('Content-Type: application/json');echo json_encode(['cookie'=>$_COOKIE['vs_session']??null]);return;
}
if (str_starts_with($path,$prefix.'/_studio/api/') && !str_contains($path,'router.php')) {
    // Model Apache rewriting: the URL remains nested, SCRIPT_NAME identifies the executing router.
    $_SERVER['SCRIPT_NAME']=$prefix.'/_studio/api/router.php';
    require $studio.'/api/router.php';return;
}
return false;
