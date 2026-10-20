<?php
declare(strict_types=1);
$root = $argv[1];
require $root . '/_studio/engine/bootstrap.php';
$db=VoxelSite\Database::getInstance(); (new VoxelSite\Migrator($db))->run();
foreach ([1=>'owner',2=>'editor',3=>'viewer'] as $id=>$role) {
    $db->insert('users',['id'=>$id,'email'=>$role.'@example.test','password_hash'=>password_hash('fixture-password',PASSWORD_BCRYPT),
        'name'=>ucfirst($role),'role'=>$role,'created_at'=>now(),'updated_at'=>now()]);
    $db->insert('sessions',['id'=>str_repeat((string)$id,64),'user_id'=>$id,'ip_address'=>'127.0.0.1','user_agent'=>'fixture',
        'expires_at'=>gmdate('Y-m-d\TH:i:s\Z',time()+86400),'created_at'=>now()]);
}
file_put_contents($root.'/_studio/data/config.json',json_encode(['app_key'=>base64_encode(random_bytes(32))]));
$settings=new VoxelSite\Settings($db);
foreach (['ai_provider'=>'openai_compatible','ai_openai_compatible_model'=>'fixture-model',
    'ai_openai_compatible_base_url'=>$argv[2],'site_name'=>'Release fixture','site_url'=>$argv[3],
    'installed_at'=>now(),'version'=>'1.31.2'] as $key=>$value) { $settings->set($key,$value); }
$nav=[['href'=>'/','label'=>'Home','home'=>true],['href'=>'/about','label'=>'About'],
    ['href'=>'/services','label'=>'Services','children'=>[['href'=>'/services/team','label'=>'Team']]]];
file_put_contents($root.'/_studio/preview/_partials/nav.php',"<?php\n".VoxelSite\NavLinksParser::serialize($nav)."\nforeach (\$navLinks as \$link): ?><a href=\"<?= \$link['href'] ?>\"><?= \$link['label'] ?></a><?php endforeach; ?>");
file_put_contents($root.'/_studio/preview/_partials/header.php','<!DOCTYPE html><html><head><meta charset="utf-8"><title><?= $page[\'title\'] ?></title><link rel="stylesheet" href="/assets/css/style.css"><link rel="stylesheet" href="/assets/css/tailwind.css"></head><body><?php include __DIR__ . "/nav.php"; ?><main>');
file_put_contents($root.'/_studio/preview/_partials/footer.php','</main><footer><p>Original shared footer</p></footer></body></html>');
foreach (['index'=>'Home','about'=>'About','services'=>'Services','services/team'=>'Team'] as $slug=>$title) {
    $prefix=str_contains($slug,'/')?'/../':'/';
    file_put_contents($root.'/_studio/preview/'.$slug.'.php','<?php $page = [\'title\'=>\''.$title.'\',\'slug\'=>\''.$slug.'\']; include __DIR__ . \''.$prefix.'_partials/header.php\'; ?>' . "\n" . '<section class="p-7 text-primary"><h1>'.$title.'</h1><p>Local copy</p><a href="/about">About one</a><a href="/about?x=2#details">About two</a></section><?php include __DIR__ . \''.$prefix.'_partials/footer.php\'; ?>');
}
file_put_contents($root.'/assets/css/style.css',':root { --color-primary: #123456; --color-text: #111111; --color-bg: #ffffff; }');
file_put_contents($root.'/index.php','<!DOCTYPE html><html><body><h1>Published original</h1></body></html>');
$fm=new VoxelSite\FileManager($db); $fm->syncPageRegistry(); $fm->compileTailwind();
echo "Fixture initialized.\n";
