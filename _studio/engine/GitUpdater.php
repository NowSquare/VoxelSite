<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Local Git capability inspection and bounded exact-commit archive staging.
 * Activation belongs to Agent\UpdateService and its reviewed native runtime.
 * All commands use argv arrays, non-interactive credentials and time limits.
 */
final class GitUpdater
{
    private string $root;
    private string $lockFile;
    private ?string $gitBin = null;
    private ?float $deadline = null;

    public function __construct(string $root, ?string $lockFile = null)
    {
        $this->root = rtrim(FilesystemPath::normalize($root), '/');
        $this->lockFile = $lockFile ?? $this->root . '/.git-update.lock';
    }

    // ── Public API ──────────────────────────────────────────────

    /**
     * Cheap, local-only capability probe — no network. Used to decide whether
     * to show the Git card at all.
     *
     * @return array{ok: bool, reason: ?string}
     */
    public function available(): array
    {
        if (!self::canExec()) {
            return ['ok' => false, 'reason' => 'Process execution is disabled on this server (proc_open).'];
        }
        if (!is_dir($this->root . '/.git')) {
            return ['ok' => false, 'reason' => 'This install is not a Git checkout.'];
        }
        if ($this->git(['--version'], 10)['code'] !== 0) {
            return ['ok' => false, 'reason' => 'The git command is not available on this server.'];
        }
        return ['ok' => true, 'reason' => null];
    }

    /** Stage an exact fetched commit without resetting or cleaning the checkout. */
    public function stageCandidate(string $archivePath, ?array $retained = null, ?callable $retain = null, int $maxBytes = 134217728): array
    {
        $parent=FilesystemPath::realpath(dirname($archivePath));
        if(!$parent||is_link(dirname($archivePath))||is_link($archivePath)||file_exists($archivePath))throw new \RuntimeException('Use a new private archive destination.');
        $this->deadline=microtime(true)+8;
        try {
            if ($retained === null) {
                $status=$this->status(true);
                if(!$status['can_update'])return ['ok'=>false,'state'=>$status['state'],'message'=>$status['message']];
                $target=$this->git(['rev-parse','--verify','@{u}^{commit}']);
                if($target['code']!==0||!preg_match('/^[a-f0-9]{40,64}$/D',$target['out']))return ['ok'=>false,'state'=>'unsupported_host','message'=>'The exact upstream commit could not be resolved.'];
                $retained=['from_sha'=>$status['current_sha'],'to_sha'=>$target['out']];
                if ($retain !== null) $retain($retained);
            }
            if (!preg_match('/^[a-f0-9]{40,64}$/D', $retained['to_sha'] ?? '')
                || !preg_match('/^[a-f0-9]{40,64}$/D', $retained['from_sha'] ?? '')) {
                throw new \RuntimeException('The retained Git commit identity is invalid.');
            }
            $this->archiveBounded($retained['to_sha'],$archivePath,$maxBytes);
            return ['ok'=>true,'state'=>'staged']+$retained+['archive'=>$archivePath];
        } finally {$this->deadline=null;}
    }

    /** Stream stdout into an already reserved private budget; git never writes the destination itself. */
    private function archiveBounded(string $commit, string $destination, int $maxBytes): void
    {
        if ($maxBytes < 1 || $maxBytes > 134217728) throw new \InvalidArgumentException('Invalid Git archive budget.');
        $out=fopen($destination,'xb');
        if (!$out) throw new \RuntimeException('Cannot create the private Git archive.');
        chmod($destination,0600);
        $process=null;$pipes=[];$complete=false;
        try {
            $process=proc_open([$this->gitBin(),'-C',$this->root,'archive','--format=zip',$commit],
                [0=>['pipe','r'],1=>['pipe','w'],2=>['pipe','w']],$pipes,$this->root,$this->env());
            if (!is_resource($process)) throw new \RuntimeException('Cannot start the bounded Git archive.');
            fclose($pipes[0]);stream_set_blocking($pipes[1],false);stream_set_blocking($pipes[2],false);
            $written=0;$errors=0;$exit=-1;
            while (true) {
                $info=proc_get_status($process);
                if (!$info['running'] && $info['exitcode']>=0) $exit=$info['exitcode'];
                $chunk=fread($pipes[1],65536);$err=fread($pipes[2],8192);
                if ($chunk===false || $err===false) throw new \RuntimeException('The Git archive stream failed.');
                if ($written+strlen($chunk)>$maxBytes) throw new \RuntimeException('The Git archive exceeds the reserved package size.');
                if ($chunk!=='' && fwrite($out,$chunk)!==strlen($chunk)) throw new \RuntimeException('Cannot retain the Git archive.');
                $written+=strlen($chunk);$errors+=strlen($err);
                if ($errors>1048576 || microtime(true)>=($this->deadline??0)) throw new \RuntimeException('Git staging exceeded its host execution budget.');
                if (!$info['running'] && feof($pipes[1]) && feof($pipes[2])) break;
                if ($chunk==='' && $err==='') usleep(10000);
            }
            foreach ([1,2] as $index) fclose($pipes[$index]);
            $code=proc_close($process);$process=null;
            if (($code===-1?$exit:$code)!==0 || $written===0) throw new \RuntimeException('The exact Git commit could not be archived.');
            $complete=true;
        } finally {
            if (is_resource($process)) {proc_terminate($process,9);foreach($pipes as $pipe)if(is_resource($pipe))fclose($pipe);proc_close($process);}
            fclose($out);
            if (!$complete && is_file($destination)) unlink($destination);
        }
    }

    /**
     * Full status snapshot. With $fetch=true it runs `git fetch` first so the
     * behind/ahead counts reflect the remote — this makes a network call.
     *
     * @return array<string,mixed>
     */
    public function status(bool $fetch = false): array
    {
        $s = [
            'is_repo'     => false,
            'exec_ok'     => self::canExec(),
            'git_version' => null,
            'branch'      => null,
            'upstream'    => null,
            'current_sha' => null,
            'short_sha'   => null,
            'behind'      => 0,
            'ahead'       => 0,
            'dirty'       => false,
            'dirty_files' => [],
            'fetched'     => false,
            'fetch_ok'    => null,
            'fetch_error' => null,
            'version'     => $this->versionFile(),
            'state'       => 'unknown',
            'message'     => '',
            'can_update'  => false,
        ];

        $avail = $this->available();
        if (!$avail['ok']) {
            $s['state']   = is_dir($this->root . '/.git') ? 'setup_needed' : 'not_repo';
            $s['message'] = (string) $avail['reason'];
            return $s;
        }

        $s['is_repo']     = true;
        $s['git_version'] = trim(str_ireplace('git version', '', $this->git(['--version'])['out']));

        $branch = $this->git(['rev-parse', '--abbrev-ref', 'HEAD']);
        $s['branch'] = $branch['code'] === 0 ? $branch['out'] : null;

        $sha = $this->git(['rev-parse', 'HEAD']);
        if ($sha['code'] === 0) {
            $s['current_sha'] = $sha['out'];
            $s['short_sha']   = substr($sha['out'], 0, 12);
        }

        // Dirty = modified/staged TRACKED files only. `-uno` ignores the many
        // untracked runtime files a live install legitimately has.
        $st = $this->git(['status', '--porcelain', '-uno']);
        if ($st['code'] === 0 && $st['out'] !== '') {
            $s['dirty'] = true;
            $s['dirty_files'] = array_slice(
                array_values(array_filter(array_map('trim', explode("\n", $st['out'])))),
                0,
                20
            );
        }

        $upstream = $this->git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
        $hasUpstream = $upstream['code'] === 0 && $upstream['out'] !== '';
        $s['upstream'] = $hasUpstream ? $upstream['out'] : null;

        if (!$hasUpstream) {
            $s['state']   = 'no_upstream';
            $s['message'] = 'No upstream branch is configured. Run: git branch --set-upstream-to=origin/'
                          . ($s['branch'] ?? 'main');
            return $s;
        }

        if ($fetch) {
            $f = $this->git(['fetch', '--quiet', '--no-tags'], 90);
            $s['fetched']  = true;
            $s['fetch_ok'] = $f['code'] === 0;
            if ($f['code'] !== 0) {
                $s['fetch_error'] = self::firstLine($f['err'] ?: $f['out'])
                    ?: ($f['timed_out'] ? 'Timed out reaching the repository.' : 'Could not reach the repository.');
            }
        }

        $lr = $this->git(['rev-list', '--left-right', '--count', 'HEAD...@{u}']);
        if ($lr['code'] === 0 && preg_match('/^(\d+)\s+(\d+)$/', trim($lr['out']), $m)) {
            $s['ahead']  = (int) $m[1];
            $s['behind'] = (int) $m[2];
        }

        // Collapse to a single coarse state for the UI.
        if ($s['dirty']) {
            $s['state']   = 'dirty';
            $s['message'] = 'Local code changes detected. Resolve them before updating.';
        } elseif ($s['fetched'] && $s['fetch_ok'] === false) {
            $s['state']   = 'setup_needed';
            $s['message'] = 'Could not reach the repository. ' . (string) $s['fetch_error'];
        } elseif ($s['ahead'] > 0) {
            $s['state']   = 'ahead';
            $s['message'] = 'This install has ' . $s['ahead'] . ' local commit(s) not in the repository; refusing to reset.';
        } elseif ($s['behind'] > 0) {
            $s['state']   = 'update_available';
            $s['message'] = $s['behind'] . ' update' . ($s['behind'] === 1 ? '' : 's') . ' available.';
        } else {
            $s['state']   = 'up_to_date';
            $s['message'] = 'Up to date.';
        }

        $s['can_update'] = $s['state'] === 'update_available';
        return $s;
    }

    /** Legacy callers must enter the shared reviewed workflow. */
    public function update(?callable $migrate = null): array
    {
        return ['ok'=>false,'state'=>'review_required','message'=>'Prepare and approve the exact Git package through the shared update service.'];
    }

    // ── Internals ───────────────────────────────────────────────

    private function versionFile(): string
    {
        $f = $this->root . '/VERSION';
        return is_file($f) ? (trim((string) file_get_contents($f)) ?: '0.0.0') : '0.0.0';
    }

    private static function canExec(): bool
    {
        if (!function_exists('proc_open')) {
            return false;
        }
        $disabled = array_map('trim', explode(',', (string) ini_get('disable_functions')));
        return !in_array('proc_open', $disabled, true);
    }

    private static function firstLine(string $s): string
    {
        $s = trim($s);
        if ($s === '') {
            return '';
        }
        $nl = strpos($s, "\n");
        return $nl === false ? $s : substr($s, 0, $nl);
    }

    /**
     * Resolve the git binary. PATH resolution for the argv form of proc_open is
     * unreliable across SAPIs, so prefer well-known absolute locations and fall
     * back to a bare "git" (resolved via the env PATH) as a last resort.
     */
    private function gitBin(): string
    {
        if ($this->gitBin !== null) {
            return $this->gitBin;
        }
        $candidates = DIRECTORY_SEPARATOR === '\\' ? [] : ['/usr/bin/git', '/usr/local/bin/git', '/opt/homebrew/bin/git', '/bin/git'];
        foreach ($candidates as $candidate) {
            if (is_executable($candidate)) {
                return $this->gitBin = $candidate;
            }
        }
        return $this->gitBin = 'git';
    }

    /**
     * Run a fixed git argv (no shell) with a hard timeout and non-interactive
     * credential handling.
     *
     * @param string[] $args
     * @return array{code:int, out:string, err:string, timed_out:bool}
     */
    private function git(array $args, int $timeoutSec = 30): array
    {
        if($this->deadline!==null){
            $remaining=$this->deadline-microtime(true);
            if($remaining<=0)return ['code'=>124,'out'=>'','err'=>'The Git preparation time budget expired.','timed_out'=>true];
            $timeoutSec=min($timeoutSec,max(1,(int)ceil($remaining)));
        }
        // Bound slow HTTPS transfers so a stalled remote can't pin a worker.
        $cmd = array_merge(
            [$this->gitBin(), '-C', $this->root, '-c', 'http.lowSpeedLimit=1000', '-c', 'http.lowSpeedTime=20'],
            $args
        );
        $descriptors = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $proc = @proc_open($cmd, $descriptors, $pipes, $this->root, $this->env());
        if (!is_resource($proc)) {
            return ['code' => -1, 'out' => '', 'err' => 'Failed to start git.', 'timed_out' => false];
        }

        // Close stdin immediately — git must never block waiting for input.
        if (isset($pipes[0]) && is_resource($pipes[0])) {
            fclose($pipes[0]);
        }
        stream_set_blocking($pipes[1], false);
        stream_set_blocking($pipes[2], false);

        $out = '';
        $err = '';
        $start = microtime(true);
        $timedOut = false;

        while (true) {
            $info = proc_get_status($proc);
            $out .= stream_get_contents($pipes[1]);
            $err .= stream_get_contents($pipes[2]);
            if(strlen($out)+strlen($err)>1048576){$timedOut=true;proc_terminate($proc,9);break;}

            if (!$info['running']) {
                break;
            }
            if ((microtime(true) - $start) > $timeoutSec || ($this->deadline!==null&&microtime(true)>=$this->deadline)) {
                $timedOut = true;
                proc_terminate($proc, 9);
                break;
            }
            usleep(40000); // 40ms
        }

        $out .= stream_get_contents($pipes[1]);
        $err .= stream_get_contents($pipes[2]);
        foreach ([$pipes[1], $pipes[2]] as $p) {
            if (is_resource($p)) {
                fclose($p);
            }
        }

        $code = proc_close($proc);
        if($code===-1&&isset($info['exitcode'])&&$info['exitcode']>=0)$code=(int)$info['exitcode'];
        if ($timedOut) {
            $code = 124;
            $err  = trim($err . "\nTimed out after {$timeoutSec}s.");
        }

        return ['code' => $code, 'out' => trim($out), 'err' => trim($err), 'timed_out' => $timedOut];
    }

    /**
     * Environment for git: inherit the real environment (so PATH, the SSH agent,
     * and credential helpers keep working) but force non-interactive behaviour so
     * a web request can never hang on a password/passphrase prompt.
     *
     * @return array<string,string>
     */
    private function env(): array
    {
        $base = getenv();
        if (!is_array($base)) {
            $base = [];
        }
        // Windows environment names are case-insensitive and commonly use Path.
        // Adding a POSIX PATH can shadow the host's actual Git installation.
        $pathKey = 'PATH';
        if (DIRECTORY_SEPARATOR === '\\') {
            foreach (array_keys($base) as $key) {
                if (strcasecmp($key, 'PATH') === 0) { $pathKey = $key; break; }
            }
        }
        if (empty($base[$pathKey]) && DIRECTORY_SEPARATOR !== '\\') {
            $base['PATH'] = '/usr/local/bin:/usr/bin:/bin';
        }
        $home = $base['HOME'] ?? (DIRECTORY_SEPARATOR === '\\' ? ($base['USERPROFILE'] ?? '') : '');
        if ($home === '' || !is_dir($home)) {
            $home = $this->root;
        }

        return array_merge($base, [
            'HOME'                => $home,
            'GIT_TERMINAL_PROMPT' => '0',
            'GIT_SSH_COMMAND'     => 'ssh -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new',
            'GCM_INTERACTIVE'     => 'never',
            'LC_ALL'              => 'C',
        ]);
    }
}
