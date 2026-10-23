<?php
declare(strict_types=1);

// Developer/CI driver only. The tested application process needs no shell.
$reports=[];
foreach (['empty','configured'] as $profile) {
    $env=getenv();$env['VS_MCP_LIFECYCLE_PROFILE']=$profile;
    $process=proc_open([PHP_BINARY,__DIR__.'/McpApplicationTest.php'],
        [['pipe','r'],['pipe','w'],['pipe','w']],$pipes,null,$env);
    if (!is_resource($process)) throw new RuntimeException('Cannot start lifecycle fixture.');
    fclose($pipes[0]);$output=stream_get_contents($pipes[1]);fclose($pipes[1]);
    $errors=stream_get_contents($pipes[2]);fclose($pipes[2]);$code=proc_close($process);
    if ($code!==0 || $errors!=='' || !preg_match('/Fixture (.+)\n$/D',$output,$match))
        throw new RuntimeException($profile." lifecycle failed:\n".$errors.$output);
    $fixture=realpath($match[1]);
    if (!$fixture || !str_starts_with($fixture,realpath(sys_get_temp_dir()).'/vs-mcp-app-'))
        throw new RuntimeException('Lifecycle evidence must stay in its disposable fixture.');
    $report=json_decode(file_get_contents($fixture.'/evidence.json'),true,128,JSON_THROW_ON_ERROR);
    if ($report['profile']!==$profile || $report['provider_requests']!==0)
        throw new RuntimeException('Lifecycle evidence did not meet the requested profile.');
    $reports[]=$report;
    echo "PASS $profile: {$report['checks']} lifecycle checks; zero built-in provider requests; $fixture/evidence.json\n";
}
echo "Lifecycle profiles: ".count($reports)." passed. Real clients and web hosts require separate qualification.\n";
