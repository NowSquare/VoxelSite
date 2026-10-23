<?php
declare(strict_types=1);

namespace VoxelSite;

/** Explicit owner-triggered HTTP qualification; never called by a file read. */
final class WorkspaceAccessProbe
{
    private Settings $settings;
    private ?\Closure $transport;

    public function __construct(private SiteWorkspace $workspace, private Database $db, ?callable $transport = null)
    {
        $this->settings = new Settings($db);
        $this->transport = $transport === null ? null : \Closure::fromCallable($transport);
    }

    public static function canonicalBase(string $base): string
    {
        $parts = parse_url(trim($base));
        if (!is_array($parts) || !in_array($parts['scheme'] ?? '', ['https', 'http'], true)
            || empty($parts['host']) || isset($parts['user'], $parts['pass'])
            || isset($parts['user']) || isset($parts['query']) || isset($parts['fragment'])
            || !preg_match('/^[a-z0-9.-]+$/iD', $parts['host'])
            || (isset($parts['port']) && ($parts['port'] < 1 || $parts['port'] > 65535))) {
            throw new \RuntimeException('Enter the configured public website URL, including its installation directory when applicable.');
        }
        $path = rtrim($parts['path'] ?? '', '/');
        if ($path !== '' && !preg_match('~^/[a-z0-9._/-]+$~iD', $path)) {
            throw new \RuntimeException('The configured installation URL contains an unsupported path.');
        }
        if (str_contains($path, '//') || str_contains($path, '..')) throw new \RuntimeException('Invalid installation URL path.');
        return strtolower($parts['scheme']) . '://' . strtolower($parts['host'])
            . (isset($parts['port']) ? ':' . $parts['port'] : '') . $path;
    }

    public function verify(string $base, array $server): array
    {
        $base = self::canonicalBase($base);
        $address = $server['SERVER_ADDR'] ?? '';
        $port = (int) ($server['SERVER_PORT'] ?? 0);
        if (!filter_var($address, FILTER_VALIDATE_IP) || $port < 1 || $port > 65535) {
            throw new \RuntimeException('Privacy verification is unavailable: the web server must supply its own address and listener port.');
        }
        if ($this->transport === null && !extension_loaded('curl')) {
            throw new \RuntimeException('Privacy verification requires PHP cURL. Enable the extension and retry.');
        }
        $this->workspace->assertRootIntegrity();
        $access = SiteWorkspace::resolveWithin($this->workspace->draftRoot(), '.htaccess');
        $old = is_file($access) ? file_get_contents($access) : null;
        if (!is_string($old) && $old !== null) throw new \RuntimeException('Cannot read existing draft access rules.');
        if (!$this->settings->has('workspace_access_before')) {
            $this->settings->set('workspace_access_before', ['content' => $old === null ? null : base64_encode($old)]);
        }
        $deny = ($old ?? '');
        if (!str_contains($deny, SiteWorkspace::ACCESS_MARKER)) {
            $deny .= "\n" . SiteWorkspace::ACCESS_MARKER . "\n<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n"
                . "<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n";
            if (file_put_contents($access, $deny, LOCK_EX) !== strlen($deny)) throw new \RuntimeException('Cannot protect the private draft directory.');
        }
        $nonce = bin2hex(random_bytes(24));
        $control = bin2hex(random_bytes(24));
        $directory = SiteWorkspace::resolveWithin($this->workspace->draftRoot(), 'workspace-check-' . $nonce);
        if (!mkdir($directory . '/nested', 0755, true)) throw new \RuntimeException('Cannot create privacy verification files.');
        if (!chmod($directory, 0755) || !chmod($directory . '/nested', 0755)) {
            rmdir($directory . '/nested'); rmdir($directory);
            throw new \RuntimeException('Cannot establish readable HTTP privacy verification files.');
        }
        $this->settings->set('workspace_access_probe', ['nonce' => $nonce, 'value' => $control, 'expires' => time() + 60]);
        $extensions = ['php', 'css', 'js', 'json', 'png', 'woff2'];
        try {
            foreach ($extensions as $extension) {
                $bytes = $extension === 'php' ? '<?php echo ' . var_export($control, true) . ';' : $control;
                if (file_put_contents($directory . '/nested/probe.' . $extension, $bytes) !== strlen($bytes)) {
                    throw new \RuntimeException('Cannot write privacy verification files.');
                }
                if (!chmod($directory . '/nested/probe.' . $extension, 0644)) throw new \RuntimeException('Cannot establish readable HTTP privacy verification files.');
            }
            $controlResponse = $this->request($base . '/_studio/api/router.php?_path=%2Fworkspace%2Fprobe&nonce=' . $nonce, $address, $port);
            if ($controlResponse['status'] !== 200 || !hash_equals($control, $controlResponse['body'])) {
                throw new \RuntimeException('Privacy verification could not reach this installation at the configured URL. Check its URL, TLS certificate, and server routing.');
            }
            $statuses = [];
            foreach ($extensions as $extension) {
                $response = $this->request($base . '/_studio/preview/workspace-check-' . $nonce . '/nested/probe.' . $extension, $address, $port);
                $statuses[$extension] = $response['status'];
                if (!in_array($response['status'], [403, 404], true)) {
                    throw new \RuntimeException('Direct draft URLs are still accessible. Configure your web server to deny the entire /_studio/preview/ directory, then retry.');
                }
            }
            $proof = ['base_url' => $base, 'verified_at' => time(), 'statuses' => $statuses,
                'access_sha256' => hash_file('sha256', $access), 'draft_root' => $this->workspace->draftRoot()];
            $this->settings->set('workspace_access_verified', $proof);
            return $proof;
        } finally {
            foreach ($extensions as $extension) {
                $file = $directory . '/nested/probe.' . $extension;
                if (is_file($file)) unlink($file);
            }
            rmdir($directory . '/nested');
            rmdir($directory);
            $this->settings->delete('workspace_access_probe');
        }
    }

    /** Public nonce control contains no installation data or credentials. */
    public static function control(Database $db, string $nonce): ?string
    {
        $probe = (new Settings($db))->get('workspace_access_probe');
        if (!is_array($probe) || !is_string($probe['nonce'] ?? null) || ($probe['expires'] ?? 0) < time()
            || !hash_equals($probe['nonce'], $nonce)) return null;
        return is_string($probe['value'] ?? null) ? $probe['value'] : null;
    }

    private function request(string $url, string $address, int $port): array
    {
        if ($this->transport !== null) return ($this->transport)($url, $address, $port);
        $parts = parse_url($url);
        $urlPort = $parts['port'] ?? ($parts['scheme'] === 'https' ? 443 : 80);
        $target = str_contains($address, ':') ? '[' . $address . ']' : $address;
        $body = '';
        $handle = curl_init($url);
        if ($handle === false) throw new \RuntimeException('Privacy verification could not initialize cURL.');
        curl_setopt_array($handle, [
            CURLOPT_CONNECT_TO => [$parts['host'] . ':' . $urlPort . ':' . $target . ':' . $port],
            CURLOPT_PROXY => '', CURLOPT_FOLLOWLOCATION => false, CURLOPT_MAXREDIRS => 0,
            CURLOPT_CONNECTTIMEOUT_MS => 1500, CURLOPT_TIMEOUT_MS => 3000,
            CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
            CURLOPT_HTTPHEADER => ['Accept: text/plain', 'Cache-Control: no-cache'],
            CURLOPT_WRITEFUNCTION => static function ($handle, string $bytes) use (&$body): int {
                if (strlen($body) + strlen($bytes) > 16384) return 0;
                $body .= $bytes;
                return strlen($bytes);
            },
        ]);
        $ok = curl_exec($handle);
        $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        if ($ok === false) throw new \RuntimeException('Privacy verification could not complete the bounded same-server request. Check TLS, routing, and available PHP workers.');
        return ['status' => $status, 'body' => $body];
    }
}
