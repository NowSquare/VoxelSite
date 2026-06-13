<?php

declare(strict_types=1);

namespace VoxelSite;

/**
 * Git-based self-update service.
 *
 * Companion to the ZIP updater (api/endpoints/update.php). When the install is
 * a real Git checkout AND the server allows process execution, this provides a
 * one-click "pull latest" that is safe for non-interactive server updates — the
 * ZIP path stays the fallback for shared hosting that has neither git nor exec.
 *
 * Why not a naive `git pull`:
 *  - It must never hang a web request waiting for a credential/passphrase
 *    prompt (GIT_TERMINAL_PROMPT=0, ssh BatchMode=yes, hard wall-clock timeout,
 *    http low-speed limits).
 *  - It does real status detection: repo? git? upstream? clean tree?
 *    behind/ahead counts?
 *  - It refuses to destroy local work: aborts on a dirty tracked tree or when
 *    the install is ahead of the remote.
 *  - It applies deterministically with `fetch` + `reset --hard @{u}` — which
 *    only ever touches TRACKED files. It never runs `git clean`, so untracked
 *    user content (database, config, uploads, generated pages) is left alone.
 *
 * Every git invocation uses proc_open with an argv array (no shell), so there
 * is no command-injection surface and no shell parsing of paths.
 */
final class GitUpdater
{
    private string $root;
    private string $lockFile;
    private ?string $gitBin = null;

    public function __construct(string $root, ?string $lockFile = null)
    {
        $this->root = rtrim($root, '/');
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

    /**
     * Apply pending updates: fetch, hard-reset to the upstream, then run the
     * supplied migration callback. Guarded by an exclusive non-blocking lock so
     * two updates can't overlap, and re-validates status under the lock.
     *
     * @param (callable():mixed)|null $migrate Run AFTER files update; its return
     *        value is attached as migrations.result. A throw is captured, not fatal.
     * @return array<string,mixed>
     */
    public function update(?callable $migrate = null): array
    {
        $res = [
            'ok'           => false,
            'state'        => null,
            'message'      => '',
            'from_sha'     => null,
            'to_sha'       => null,
            'from_version' => $this->versionFile(),
            'to_version'   => null,
            'migrations'   => null,
            'output'       => '',
        ];

        $lock = @fopen($this->lockFile, 'c');
        if ($lock === false || !flock($lock, LOCK_EX | LOCK_NB)) {
            if (is_resource($lock)) {
                fclose($lock);
            }
            $res['state']   = 'locked';
            $res['message'] = 'Another update is already running. Try again in a moment.';
            return $res;
        }

        try {
            // Re-check under the lock, WITH a fresh fetch.
            $st = $this->status(true);

            if (!$st['is_repo'] || $st['state'] === 'no_upstream') {
                $res['state'] = $st['state'];
                $res['message'] = $st['message'];
                return $res;
            }
            if ($st['dirty']) {
                $res['state']   = 'dirty';
                $res['message'] = $st['message'];
                $res['output']  = implode("\n", $st['dirty_files']);
                return $res;
            }
            if ($st['fetched'] && $st['fetch_ok'] === false) {
                $res['state']   = 'setup_needed';
                $res['message'] = $st['message'];
                return $res;
            }
            if ($st['ahead'] > 0) {
                $res['state']   = 'ahead';
                $res['message'] = $st['message'];
                return $res;
            }

            $res['from_sha'] = $st['short_sha'];

            if ($st['behind'] === 0) {
                $res['ok']         = true;
                $res['state']      = 'up_to_date';
                $res['message']    = 'Already up to date.';
                $res['to_sha']     = $st['short_sha'];
                $res['to_version'] = $this->versionFile();
                return $res;
            }

            // Apply — tracked files only. No `git clean`: untracked user data stays.
            $reset = $this->git(['reset', '--hard', '@{u}'], 120);
            $res['output'] = trim($reset['out'] . "\n" . $reset['err']);
            if ($reset['code'] !== 0) {
                $res['state']   = 'failed';
                $res['message'] = 'git reset failed. ' . (self::firstLine($reset['err']) ?: 'See output.');
                return $res;
            }

            $to = $this->git(['rev-parse', 'HEAD']);
            $res['to_sha']     = $to['code'] === 0 ? substr($to['out'], 0, 12) : null;
            $res['to_version'] = $this->versionFile();

            // Recompile bytecode so the new PHP is used on the next request.
            if (function_exists('opcache_reset')) {
                @opcache_reset();
            }

            // Run migrations against the freshly-updated code. A migration
            // failure is a FAILED update — the files are new but the schema is
            // not, so we must never report success. We do NOT auto-roll-back the
            // code: a partially-applied migration leaves the DB in an unknown
            // state, so reverting code could deepen the mismatch rather than fix
            // it. The operator restores a DB backup or fixes forward, then retries.
            if ($migrate !== null) {
                try {
                    $res['migrations'] = ['ok' => true, 'result' => $migrate()];
                } catch (\Throwable $e) {
                    $res['migrations'] = ['ok' => false, 'error' => $e->getMessage()];
                    $res['ok']      = false;
                    $res['state']   = 'migration_failed';
                    $res['message'] = 'Files updated to v' . $res['to_version']
                        . ', but database migrations failed: ' . self::firstLine($e->getMessage())
                        . '. The site may be in an inconsistent state — restore your database'
                        . ' backup or resolve the migration, then re-run the update.';
                    return $res;
                }
            }

            $res['ok']      = true;
            $res['state']   = 'updated';
            $res['message'] = 'Updated to v' . $res['to_version'] . '.';
            return $res;
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
            @unlink($this->lockFile);
        }
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
        foreach (['/usr/bin/git', '/usr/local/bin/git', '/opt/homebrew/bin/git', '/bin/git'] as $candidate) {
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

            if (!$info['running']) {
                break;
            }
            if ((microtime(true) - $start) > $timeoutSec) {
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
        if (empty($base['PATH'])) {
            $base['PATH'] = '/usr/local/bin:/usr/bin:/bin';
        }
        $home = $base['HOME'] ?? '';
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
