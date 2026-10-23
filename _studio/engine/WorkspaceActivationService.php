<?php
declare(strict_types=1);

namespace VoxelSite;

/** Production activation gate around the deterministic migration engine. */
final class WorkspaceActivationService
{
    private Settings $settings;
    public function __construct(private SiteWorkspace $workspace, private Database $db, private ?WorkspaceAccessProbe $probe = null)
    { $this->settings = new Settings($db); }

    public function continue(string $baseUrl, array $server, int $fileBudget = 100): array
    {
        $lock = SiteMutationLock::acquire($this->workspace->mutationLockPath(), $this->db);
        $baseUrl = WorkspaceAccessProbe::canonicalBase($baseUrl);
        $this->settings->set('workspace_base_url', $baseUrl);
        if ($this->workspace->status()['ready']) {
            $this->workspace->assertReady();
            return ['status' => 'complete', 'format' => SiteWorkspace::FORMAT];
        }
        $preflight = $this->workspace->preflight();
        if (!$preflight['ok']) throw new \RuntimeException('Migration needs attention: ' . json_encode($preflight['issues'], JSON_UNESCAPED_SLASHES));
        $access = SiteWorkspace::resolveWithin($this->workspace->draftRoot(), '.htaccess');
        $proof = $this->settings->get('workspace_access_verified');
        if (!is_array($proof) || ($proof['base_url'] ?? null) !== $baseUrl
            || ($proof['draft_root'] ?? null) !== $this->workspace->draftRoot()
            || ($proof['verified_at'] ?? 0) < time() - 300 || !is_file($access)
            || ($proof['access_sha256'] ?? null) !== hash_file('sha256', $access)) {
            ($this->probe ?? new WorkspaceAccessProbe($this->workspace, $this->db))->verify($baseUrl, $server);
        }
        return (new WorkspaceMigration($this->workspace, $this->db))->run($fileBudget);
    }

    public function rollback(): array
    {
        $lock = SiteMutationLock::acquire($this->workspace->mutationLockPath(), $this->db);
        $result = (new WorkspaceMigration($this->workspace, $this->db))->rollback();
        $before = $this->settings->get('workspace_access_before');
        if (is_array($before) && array_key_exists('content', $before)) {
            $access = SiteWorkspace::resolveWithin($this->workspace->draftRoot(), '.htaccess');
            if ($before['content'] === null) {
                if (is_file($access)) unlink($access);
            } else {
                $bytes = base64_decode($before['content'], true);
                if (!is_string($bytes) || file_put_contents($access, $bytes, LOCK_EX) !== strlen($bytes)) {
                    throw new \RuntimeException('Workspace layout was restored, but its previous access configuration needs recovery.');
                }
            }
            $this->settings->delete('workspace_access_before');
        }
        $this->settings->delete('workspace_access_verified');
        return $result;
    }
}
