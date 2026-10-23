<?php
declare(strict_types=1);

// This is a developer-side driver. Each application child runs with execution
// and link creation disabled; no worker or shell is available to its services.
$binaries=array_slice($argv,1)?:[PHP_BINARY];
$disabled=['exec','shell_exec','system','passthru','proc_open','popen','pcntl_fork','symlink','link'];
$runs=0;
foreach ($binaries as $binary) {
    if (!is_file($binary) || !is_executable($binary)) throw new RuntimeException('Pass absolute executable PHP paths.');
    foreach (['empty','configured'] as $profile) {
        $env=getenv();$env['VS_MCP_LIFECYCLE_PROFILE']=$profile;
        $command=[$binary,'-d','disable_functions='.implode(',',$disabled),'-d','memory_limit=128M',
            '-d','max_execution_time=5','-d','upload_max_filesize=16K','-d','post_max_size=64K',
            __DIR__.'/McpApplicationTest.php'];
        $process=proc_open($command,[['pipe','r'],['pipe','w'],['pipe','w']],$pipes,null,$env);
        if (!is_resource($process)) throw new RuntimeException('Cannot start restricted PHP fixture.');
        fclose($pipes[0]);$output=stream_get_contents($pipes[1]);fclose($pipes[1]);
        $errors=stream_get_contents($pipes[2]);fclose($pipes[2]);$code=proc_close($process);
        if ($code!==0 || $errors!=='' || !preg_match('/Fixture (.+)\n$/D',$output,$match))
            throw new RuntimeException("$binary / $profile failed:\n".$errors.$output);
        $fixture=realpath($match[1]);
        if (!$fixture || !str_starts_with($fixture,realpath(sys_get_temp_dir()).'/vs-mcp-app-'))
            throw new RuntimeException('Restricted-host evidence must stay in its disposable fixture.');
        $report=json_decode(file_get_contents($fixture.'/evidence.json'),true,128,JSON_THROW_ON_ERROR);
        if (array_diff($disabled,$report['host']['disabled_functions']) || $report['provider_requests']!==0
            || $report['host']['memory_limit']!=='128M' || $report['host']['max_execution_time']!==5)
            throw new RuntimeException('Application process did not inherit required host restrictions.');
        $runs++;
        echo "PASS PHP {$report['php']} / $profile: {$report['checks']} lifecycle checks with shell and links disabled; $fixture/evidence.json\n";
    }
}
echo "Restricted PHP profiles: $runs passed. These are CLI-host simulations, not Apache/Nginx or named-client qualification.\n";
