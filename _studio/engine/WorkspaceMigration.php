<?php
declare(strict_types=1);

namespace VoxelSite;

/**
 * Copy, verify, then activate private mutable assets under the common lock.
 * Filesystem checkpoints survive request/process loss independently of a
 * schema transaction. Published assets are always read-only migration inputs.
 */
class WorkspaceMigration
{
    private const EXCLUDED = ['library', 'icons'];
    private const GENERATED_SEAL = 'workspace_legacy_generated_seal';

    public function __construct(private SiteWorkspace $workspace, private Database $db) {}

    public function run(int $fileBudget = 100): array
    {
        if ($fileBudget < 1 || $fileBudget > 10000) { throw new \InvalidArgumentException('Migration file budget must be between 1 and 10000.'); }
        $lock = SiteMutationLock::acquire($this->workspace->mutationLockPath(), $this->db);
        $this->assertAvailable();
        if ($this->workspace->status()['ready']) {
            $this->workspace->assertReady();
            return ['status' => 'complete', 'format' => SiteWorkspace::FORMAT, 'copied' => 0, 'total' => 0];
        }
        $preflight = $this->workspace->preflight();
        if (!$preflight['ok']) {
            throw new \RuntimeException('workspace_preflight_failed: ' . json_encode($preflight['issues'], JSON_UNESCAPED_SLASHES));
        }
        $this->ensureStateDirectory();
        $manifest = $this->loadManifest();
        if ($manifest === null) {
            if ((new Settings($this->db))->get(self::GENERATED_SEAL) !== null) {
                throw new \RuntimeException('workspace_migration_conflict: Roll back the orphaned generated publication seal before restarting migration.');
            }
            $source = $this->source();
            $inventory = SiteWorkspace::inventory($source, self::EXCLUDED);
            foreach (array_keys($inventory['files']) as $relative) {
                if (in_array(basename($relative), ['.htaccess', '.user.ini'], true)) {
                    throw new \RuntimeException('workspace_preflight_failed: Review asset server access rules before migration: ' . $relative);
                }
            }
            $bytes = array_sum(array_column($inventory['files'], 'size'));
            if ($this->availableBytes($this->workspace->migrationRoot()) < $bytes + 1048576) {
                throw new \RuntimeException('workspace_insufficient_space: Free space for the draft asset copy, then retry. Published files are unchanged.');
            }
            $access = SiteWorkspace::resolveWithin($this->workspace->draftRoot(), '.htaccess');
            $manifest = [
                'version' => 1, 'status' => 'copying', 'roots' => $this->rootsDigest(),
                'source' => $source === $this->workspace->publishedAssetsRoot() ? 'published' : 'preview',
                'legacy' => $this->legacyState(), 'inventory' => $inventory, 'copied' => [],
                'source_transforms' => $preflight['source_transforms'],
                'generated_publication' => $source === $this->workspace->publishedAssetsRoot() ? LegacyGeneratedProvenance::capture($this->db,$this->workspace) : null,
                'access_before' => is_file($access) ? base64_encode((string) file_get_contents($access)) : null,
                'created_at' => time(),
            ];
            $this->saveManifest($manifest);
            $this->checkpoint('generated_manifest_retained',$manifest);
            $this->sealGenerated($manifest);
        }
        if ($manifest['roots'] !== $this->rootsDigest()) {
            throw new \RuntimeException('workspace_migration_conflict: This checkpoint belongs to different server paths.');
        }
        if (!isset($manifest['source_transforms']) && $preflight['source_transforms'] !== []
            && in_array($manifest['status'], ['copying', 'activating', 'activated'], true)) {
            // Older copying checkpoints did not have source transformation receipts.
            $manifest['source_transforms'] = $preflight['source_transforms'];
            $this->saveManifest($manifest);
        }
        foreach ($preflight['source_transforms'] as $relative => $required) {
            if (($manifest['source_transforms'][$relative] ?? null) !== $required) {
                throw new \RuntimeException('workspace_migration_conflict: The required schema transformation is missing or changed in the retained review.');
            }
        }
        if (!array_key_exists('generated_publication',$manifest) && $manifest['status'] === 'copying') {
            if ((new Settings($this->db))->get(self::GENERATED_SEAL) !== null) {
                throw new \RuntimeException('workspace_migration_conflict: The sealed generated publication receipt is missing.');
            }
            $manifest['generated_publication'] = $manifest['source'] === 'published' ? LegacyGeneratedProvenance::capture($this->db,$this->workspace) : null;
            $this->saveManifest($manifest);
            $this->checkpoint('generated_manifest_retained',$manifest);
            $this->sealGenerated($manifest);
        }
        $this->assertGeneratedSeal($manifest);
        LegacyGeneratedProvenance::assertUnchanged($this->workspace,$manifest['generated_publication'] ?? null);
        // Reject missing/forged originals before any asset activation, including
        // resumes whose source was already converted before process loss.
        $this->transformSources($manifest, false, false);
        // A crash can occur after either rename but before the format commit.
        if (in_array($manifest['status'], ['activating', 'activated'], true)) {
            return $this->activate($manifest);
        }
        if ($manifest['status'] !== 'copying') {
            throw new \RuntimeException('workspace_migration_failed: Roll back the failed migration before retrying.');
        }
        $source = $this->sourceFor($manifest);
        if (SiteWorkspace::inventory($source, self::EXCLUDED) !== $manifest['inventory']) {
            throw new \RuntimeException('workspace_source_changed: Published or legacy draft assets changed. Roll back this migration checkpoint and start again.');
        }
        $stage = $this->stageRoot();
        if (!is_dir($stage) && !mkdir($stage, 0700, true)) { throw new \RuntimeException('Cannot create private asset staging directory.'); }
        foreach ($manifest['inventory']['directories'] as $relative => $mode) {
            $directory = SiteWorkspace::resolveWithin($stage, $relative);
            if (!is_dir($directory) && !mkdir($directory, 0755, true)) { throw new \RuntimeException('Cannot stage asset directory.'); }
        }
        $processed = 0;
        foreach ($manifest['inventory']['files'] as $relative => $metadata) {
            $destination = SiteWorkspace::resolveWithin($stage, $relative);
            if (isset($manifest['copied'][$relative])) {
                if (!is_file($destination) || hash_file('sha256', $destination) !== $metadata['sha256']) {
                    throw new \RuntimeException('workspace_verification_failed: A retained staged asset changed. Roll back the checkpoint before retrying.');
                }
                continue;
            }
            if ($processed >= $fileBudget) {
                return $this->progress($manifest, 'pending');
            }
            $sourcePath = SiteWorkspace::resolveWithin($source, $relative);
            $content = file_get_contents($sourcePath);
            if (!is_string($content) || strlen($content) !== $metadata['size']
                || hash('sha256', $content) !== $metadata['sha256']) {
                throw new \RuntimeException('workspace_source_changed: An asset changed while copying. Published files are unchanged.');
            }
            $this->writeAtomic($destination, $content, $metadata['mode']);
            if (hash_file('sha256', $destination) !== $metadata['sha256']) {
                throw new \RuntimeException('workspace_verification_failed: Copied asset bytes did not match.');
            }
            $manifest['copied'][$relative] = true;
            $this->saveManifest($manifest);
            $processed++;
            $this->checkpoint('file_copied', $manifest);
        }
        if (SiteWorkspace::inventory($source, self::EXCLUDED) !== $manifest['inventory']) {
            throw new \RuntimeException('workspace_source_changed: Assets changed before activation.');
        }
        foreach (array_reverse($manifest['inventory']['directories'], true) as $relative => $mode) {
            if (!chmod(SiteWorkspace::resolveWithin($stage, $relative), $mode)) {
                throw new \RuntimeException('workspace_verification_failed: Cannot preserve draft directory permissions.');
            }
        }
        $this->verifyStage($stage, $manifest);
        $manifest['status'] = 'activating';
        $this->saveManifest($manifest);
        return $this->activate($manifest);
    }

    /**
     * Restore only the migration's former draft layout, never published bytes.
     * Completed migrations may roll back only while their draft copy is intact.
     */
    public function rollback(): array
    {
        $lock = SiteMutationLock::acquire($this->workspace->mutationLockPath(), $this->db);
        $this->assertAvailable();
        $manifest = $this->loadManifest();
        if ($manifest === null) {
            if (!$this->workspace->status()['ready']) (new Settings($this->db))->delete(self::GENERATED_SEAL);
            return ['status' => 'rolled_back', 'format' => 1];
        }
        if ($manifest['roots'] !== $this->rootsDigest()) { throw new \RuntimeException('Workspace checkpoint paths do not match.'); }
        if ($this->workspace->status()['ready']) {
            $this->verifyStage($this->workspace->draftAssetsRoot(), $manifest);
            if (SiteWorkspace::inventory($this->sourceFor($manifest), self::EXCLUDED) !== $manifest['inventory']) {
                throw new \RuntimeException('workspace_source_changed: The previous assets changed after migration; rollback would discard the current draft.');
            }
        }
        $this->restoreLayout($manifest);
        $this->db->update('site_workspace_state', ['format' => 1, 'updated_at' => time()], 'id = ?', [1]);
        $this->removeTree($this->workspace->migrationRoot());
        (new Settings($this->db))->delete(self::GENERATED_SEAL);
        return ['status' => 'rolled_back', 'format' => 1];
    }

    /** Original live bytes copied by this migration, never current draft bytes. */
    public function publishedAssetHashes(): array
    {
        $manifest=$this->publishedMigrationManifest();
        if ($manifest===null) return [];
        $files = $manifest['inventory']['files'];
        if (count($files) > 700 || array_keys($manifest['copied']) !== array_keys($files)) {
            throw new \RuntimeException('workspace_migration_corrupt: Ownership evidence is incomplete or exceeds the publication budget.');
        }
        $hashes = [];
        foreach ($files as $relative => $metadata) {
            $destination = 'assets/' . $relative;
            if ($this->workspace->isImmutable($destination) || ($manifest['copied'][$relative] ?? null) !== true
                || !is_array($metadata) || !is_string($metadata['sha256'] ?? null)
                || !preg_match('/^[a-f0-9]{64}$/D', $metadata['sha256'])
                || !is_int($metadata['size'] ?? null) || $metadata['size'] < 0
                || !is_int($metadata['mode'] ?? null) || $metadata['mode'] < 0 || $metadata['mode'] > 0777) {
                throw new \RuntimeException('workspace_migration_corrupt: Ownership evidence contains an invalid migrated asset.');
            }
            if (in_array($destination, \VoxelSite\Agent\WorkspaceFiles::SCAFFOLD_PATHS, true)) {
                // Original verified empty scaffold bytes confer no ownership.
                // Do not infer this from the current (possibly edited) draft.
                SiteWorkspace::resolveWithin($this->workspace->publishedAssetsRoot(), $relative);
                if ($metadata['size'] !== 0 || $metadata['sha256'] !== hash('sha256', '')) {
                    throw new \RuntimeException('workspace_migration_corrupt: A scaffold marker contains nonempty or invalid original bytes.');
                }
                continue;
            }
            \VoxelSite\Agent\SitePathPolicy::canonical($destination);
            $hashes[$destination] = $metadata['sha256'];
        }
        ksort($hashes, SORT_STRING);
        return $hashes;
    }

    /** Exact activation-time output recognition; no current candidate or draft reads. */
    public function publishedGeneratedHashes(): array
    {
        $manifest=$this->publishedMigrationManifest();
        if ($manifest===null) return [];
        $this->assertGeneratedSeal($manifest);
        return LegacyGeneratedProvenance::hashes($manifest['generated_publication'] ?? null);
    }

    private function generatedDigest(array $manifest): string
    {
        LegacyGeneratedProvenance::hashes($manifest['generated_publication']);
        return \VoxelSite\Agent\CanonicalJson::digest(['roots'=>$manifest['roots'],'receipt'=>$manifest['generated_publication']]);
    }

    private function sealGenerated(array $manifest): void
    {
        if (($manifest['generated_publication'] ?? null) === null) return;
        $settings=new Settings($this->db);
        if ($settings->get(self::GENERATED_SEAL) !== null) throw new \RuntimeException('workspace_migration_conflict: Generated publication evidence is already sealed.');
        $settings->set(self::GENERATED_SEAL,$this->generatedDigest($manifest));
        $this->checkpoint('generated_sealed',$manifest);
    }

    private function assertGeneratedSeal(array $manifest): void
    {
        if (($manifest['generated_publication'] ?? null) === null) return;
        $seal=(new Settings($this->db))->get(self::GENERATED_SEAL);
        if (!is_string($seal) || !hash_equals($this->generatedDigest($manifest),$seal)) {
            throw new \RuntimeException('workspace_migration_conflict: Generated publication evidence differs from its activation seal.');
        }
    }

    private function publishedMigrationManifest(): ?array
    {
        if (!$this->workspace->status()['ready']) { return null; }
        $this->workspace->assertRootIntegrity();
        $path = SiteWorkspace::resolveWithin($this->workspace->migrationRoot(), 'manifest.json');
        if (!is_file($path)) { return null; }
        $before = @lstat($path);
        if (!$before || $before['size'] > 1048576) { throw new \RuntimeException('workspace_migration_corrupt: Ownership evidence exceeds its read budget.'); }
        $bytes = @file_get_contents($path, false, null, 0, 1048577);
        $again = @file_get_contents($path, false, null, 0, 1048577);
        clearstatcache(true, $path); $after = @lstat($path);
        if ($bytes === false || !$after || is_link($path) || $before['ino'] !== $after['ino']
            || strlen($bytes) !== $before['size'] || strlen($bytes) !== $after['size'] || $bytes !== $again) {
            throw new \RuntimeException('workspace_migration_corrupt: Ownership evidence changed while reading.');
        }
        try { $manifest = json_decode($bytes, true, 32, JSON_THROW_ON_ERROR); }
        catch (\JsonException $error) { throw new \RuntimeException('workspace_migration_corrupt: Ownership evidence is not valid JSON.', 0, $error); }
        if (!is_array($manifest) || ($manifest['version'] ?? null) !== 1
            || !is_array($manifest['inventory']['files'] ?? null) || !is_array($manifest['copied'] ?? null)
            || !in_array($manifest['source'] ?? null, ['preview', 'published'], true)
            || !in_array($manifest['status'] ?? null, ['copying', 'activating', 'activated', 'complete', 'failed'], true)) {
            throw new \RuntimeException('workspace_migration_corrupt: Ownership evidence has an invalid shape.');
        }
        if (($manifest['roots'] ?? null) !== $this->rootsDigest()) {
            throw new \RuntimeException('workspace_migration_conflict: Ownership evidence belongs to different workspace roots.');
        }
        // A crash after the format commit but before the final manifest write
        // leaves "activated". Both states follow verified copy and activation;
        // a preview-sourced copy never proves ownership of published bytes.
        if ($manifest['source'] !== 'published' || !in_array($manifest['status'] ?? null, ['activated', 'complete'], true)) { return null; }
        return $manifest;
    }

    private function activate(array $manifest): array
    {
        $draftAssets = $this->workspace->draftAssetsRoot();
        $backup = $this->backupPath();
        $stage = $this->stageRoot();
        try {
            $this->assertGeneratedSeal($manifest);
            LegacyGeneratedProvenance::assertUnchanged($this->workspace,$manifest['generated_publication'] ?? null);
            // Source state must still match at every continuation boundary.
            if (SiteWorkspace::inventory($this->sourceFor($manifest), self::EXCLUDED) !== $manifest['inventory']) {
                throw new \RuntimeException('workspace_source_changed: Assets changed before workspace activation.');
            }
            if (!file_exists($backup) && !is_link($backup) && (file_exists($draftAssets) || is_link($draftAssets))) {
                if ($this->legacyState() !== $manifest['legacy']) {
                    throw new \RuntimeException('workspace_migration_conflict: The legacy preview/assets entry changed.');
                }
                if (!rename($draftAssets, $backup)) { throw new \RuntimeException('Cannot retain the previous preview/assets entry.'); }
            }
            if (!file_exists($draftAssets) && !is_link($draftAssets)) {
                $this->verifyStage($stage, $manifest);
                if (!rename($stage, $draftAssets)) { throw new \RuntimeException('Cannot activate private draft assets.'); }
            }
            $manifest['status'] = 'activated';
            $this->saveManifest($manifest);
            $this->checkpoint('activated', $manifest);
            $this->verifyStage($draftAssets, $manifest);
            $this->transformSources($manifest, false);
            $this->checkpoint('schema_transformed', $manifest);
            $this->protectDraft($manifest);
            $this->db->update('site_workspace_state', ['format' => SiteWorkspace::FORMAT, 'updated_at' => time()], 'id = ?', [1]);
            $manifest['status'] = 'complete';
            $this->saveManifest($manifest);
            $this->workspace->assertReady();
            return $this->progress($manifest, 'complete');
        } catch (\Throwable $error) {
            try {
                $this->restoreLayout($manifest);
                $this->db->update('site_workspace_state', ['format' => 1, 'updated_at' => time()], 'id = ?', [1]);
                $manifest['status'] = 'failed';
                $this->saveManifest($manifest);
            } catch (\Throwable $rollbackError) {
                throw new \RuntimeException('workspace_recovery_required: Migration could not restore its previous draft layout. '
                    . $rollbackError->getMessage(), 0, $error);
            }
            throw $error;
        }
    }

    private function restoreLayout(array $manifest): void
    {
        // Verify ownership before changing any layout or overwriting later edits.
        $this->transformSources($manifest, true);
        $draftAssets = $this->workspace->draftAssetsRoot();
        $backup = $this->backupPath();
        if (file_exists($backup) || is_link($backup)) {
            // Never follow the retained legacy symlink or a replaced live path.
            if (file_exists($draftAssets) || is_link($draftAssets)) {
                if (is_link($draftAssets)) { throw new \RuntimeException('Unexpected symlink replaced the private draft during migration.'); }
                $discard = $this->workspace->migrationRoot() . '/discarded-assets';
                if (file_exists($discard)) { $this->removeTree($discard); }
                if (!rename($draftAssets, $discard)) { throw new \RuntimeException('Cannot retain failed private asset copy.'); }
            }
            if (!rename($backup, $draftAssets)) { throw new \RuntimeException('Cannot restore former preview/assets entry.'); }
        } elseif ($manifest['legacy']['type'] === 'absent' && is_dir($draftAssets) && !is_link($draftAssets)) {
            $this->removeTree($draftAssets);
        }
        $access = SiteWorkspace::resolveWithin($this->workspace->draftRoot(), '.htaccess');
        if ($manifest['access_before'] === null) {
            if (is_file($access) && str_contains((string) file_get_contents($access), SiteWorkspace::ACCESS_MARKER)) { unlink($access); }
        } else {
            $before = base64_decode($manifest['access_before'], true);
            if (!is_string($before)) { throw new \RuntimeException('Invalid retained access configuration.'); }
            $this->writeAtomic($access, $before, 0644);
        }
    }

    private function assertAvailable(): void
    {
        $this->workspace->assertRootIntegrity();
        if ($this->workspace->status()['reservation_operation_id'] !== null) {
            throw new \RuntimeException('workspace_reserved: Complete or recover the active website operation before migrating.');
        }
        SiteRecovery::assertWritable($this->db);
        if ($this->db->queryOne('SELECT id FROM site_workspace_state WHERE id = 1') === null) {
            throw new \RuntimeException('Install the workspace schema before migrating files.');
        }
    }

    /** Only known original/target bytes authorize a write; all public bytes stay untouched. */
    private function transformSources(array $manifest, bool $restore, bool $write = true): void
    {
        $receipts = $manifest['source_transforms'] ?? [];
        if (!is_array($receipts) || count($receipts) > 1) {
            throw new \RuntimeException('workspace_migration_corrupt: Invalid source transformation inventory.');
        }
        foreach ($receipts as $relative => $receipt) {
            if ($relative !== WorkspaceSchemaCompatibility::PATH) {
                throw new \RuntimeException('workspace_migration_corrupt: Unknown source transformation path.');
            }
            $bytes = WorkspaceSchemaCompatibility::receipt($relative, $receipt);
            $path = SiteWorkspace::resolveWithin($this->workspace->draftRoot(), $relative);
            clearstatcache(true, $path); $before = @lstat($path);
            if (!$before || ($before['mode'] & 0170000) !== 0100000 || $before['size'] > 65536) {
                throw new \RuntimeException('workspace_migration_conflict: The reviewed schema file is unavailable.');
            }
            $current = @file_get_contents($path, false, null, 0, 65537);
            clearstatcache(true, $path); $after = @lstat($path);
            if (!is_string($current) || !$after || is_link($path) || $before['ino'] !== $after['ino']
                || $before['size'] !== $after['size'] || strlen($current) !== $after['size']
                || ($after['mode'] & 0777) !== $bytes['mode']
                || ($current !== $bytes['before'] && $current !== $bytes['after'])) {
                throw new \RuntimeException('workspace_migration_conflict: The reviewed schema changed; preserve it and review workspace recovery.');
            }
            if (!$write) continue;
            $target = $bytes[$restore ? 'before' : 'after'];
            if ($current !== $target) $this->writeAtomic($path, $target, $bytes['mode']);
            if (file_get_contents($path) !== $target) {
                throw new \RuntimeException('workspace_verification_failed: Schema transformation could not be verified.');
            }
        }
    }

    private function source(): string
    {
        $legacy = $this->legacyState();
        $source = $legacy['type'] === 'directory' ? $this->workspace->draftAssetsRoot() : $this->workspace->publishedAssetsRoot();
        if (!is_dir($source) || is_link($source)) { throw new \RuntimeException('workspace_source_missing: Asset source must be an existing real directory.'); }
        foreach (self::EXCLUDED as $directory) {
            if (is_link($source . '/' . $directory)) { throw new \RuntimeException('workspace_unsafe_path: Shared immutable roots cannot be symlinks.'); }
        }
        return $source;
    }

    private function sourceFor(array $manifest): string
    {
        if ($manifest['source'] === 'published') { return $this->workspace->publishedAssetsRoot(); }
        return is_dir($this->backupPath()) && !is_link($this->backupPath())
            ? $this->backupPath() : $this->workspace->draftAssetsRoot();
    }

    private function legacyState(): array
    {
        $path = $this->workspace->draftAssetsRoot();
        if (is_link($path)) {
            if (realpath($path) !== realpath($this->workspace->publishedAssetsRoot())
                || realpath($path) === false || !is_dir($this->workspace->publishedAssetsRoot())
                || is_link($this->workspace->publishedAssetsRoot())) {
                throw new \RuntimeException('workspace_unsafe_path: preview/assets has an unknown or dangling symlink target.');
            }
            return ['type' => 'symlink', 'target' => readlink($path)];
        }
        if (is_dir($path)) { return ['type' => 'directory']; }
        if (file_exists($path)) { throw new \RuntimeException('preview/assets must be a directory or the known legacy symlink.'); }
        return ['type' => 'absent'];
    }

    private function protectDraft(array $manifest): void
    {
        $before = $manifest['access_before'] === null ? '' : base64_decode($manifest['access_before'], true);
        if (!is_string($before)) { throw new \RuntimeException('Invalid retained access configuration.'); }
        $deny = "\n" . SiteWorkspace::ACCESS_MARKER . "\n"
            . "<IfModule mod_authz_core.c>\n    Require all denied\n</IfModule>\n"
            . "<IfModule !mod_authz_core.c>\n    Order allow,deny\n    Deny from all\n</IfModule>\n";
        $this->writeAtomic(SiteWorkspace::resolveWithin($this->workspace->draftRoot(), '.htaccess'), $before . $deny, 0644);
    }

    private function verifyStage(string $root, array $manifest): void
    {
        $actual = SiteWorkspace::inventory($root);
        if ($actual['files'] !== $manifest['inventory']['files']
            || $actual['directories'] !== $manifest['inventory']['directories']) {
            throw new \RuntimeException('workspace_verification_failed: Private draft assets differ from the verified migration manifest.');
        }
    }

    private function ensureStateDirectory(): void
    {
        $root = $this->workspace->migrationRoot();
        if (is_link($root)) { throw new \RuntimeException('Workspace migration state cannot be a symlink.'); }
        if (!is_dir($root) && !mkdir($root, 0700, true)) { throw new \RuntimeException('Cannot create private migration state.'); }
    }

    private function loadManifest(): ?array
    {
        $path = SiteWorkspace::resolveWithin($this->workspace->migrationRoot(), 'manifest.json');
        if (!is_file($path)) { return null; }
        $manifest = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        if (!is_array($manifest) || ($manifest['version'] ?? null) !== 1 || !is_array($manifest['inventory']['files'] ?? null)
            || !is_array($manifest['inventory']['directories'] ?? null) || !is_array($manifest['copied'] ?? null)
            || !in_array($manifest['source'] ?? null, ['preview', 'published'], true)
            || !in_array($manifest['legacy']['type'] ?? null, ['directory', 'symlink', 'absent'], true)) {
            throw new \RuntimeException('workspace_migration_corrupt: Migration checkpoint cannot be read safely.');
        }
        return $manifest;
    }

    private function saveManifest(array $manifest): void
    {
        $this->writeAtomic(SiteWorkspace::resolveWithin($this->workspace->migrationRoot(), 'manifest.json'),
            json_encode($manifest, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES), 0600);
    }

    private function writeAtomic(string $path, string $bytes, int $mode): void
    {
        if (is_link($path)) { throw new \RuntimeException('Cannot write a symlink during workspace migration.'); }
        $temporary = tempnam(dirname($path), '.workspace-');
        if ($temporary === false) { throw new \RuntimeException('Cannot stage workspace migration file.'); }
        try {
            if (file_put_contents($temporary, $bytes, LOCK_EX) !== strlen($bytes) || !chmod($temporary, $mode)
                || !rename($temporary, $path)) { throw new \RuntimeException('Cannot write and verify workspace migration file.'); }
        } finally { if (is_file($temporary)) { unlink($temporary); } }
    }

    private function removeTree(string $path): void
    {
        if (is_link($path) || is_file($path)) {
            if (!unlink($path)) { throw new \RuntimeException('Cannot remove retained workspace migration entry.'); }
            return;
        }
        if (!is_dir($path)) { return; }
        foreach (scandir($path) as $name) {
            if ($name !== '.' && $name !== '..') { $this->removeTree($path . '/' . $name); }
        }
        if (!rmdir($path)) { throw new \RuntimeException('Cannot remove workspace migration directory.'); }
    }

    private function rootsDigest(): string
    {
        return hash('sha256', json_encode([$this->workspace->draftRoot(), $this->workspace->publishedRoot(),
            $this->workspace->publishedAssetsRoot(), $this->workspace->migrationRoot()], JSON_THROW_ON_ERROR));
    }
    private function stageRoot(): string { return SiteWorkspace::resolveWithin($this->workspace->migrationRoot(), 'staged-assets'); }
    private function backupPath(): string { return $this->workspace->migrationRoot() . '/legacy-assets'; }
    private function progress(array $manifest, string $status): array
    { return ['status' => $status, 'format' => $status === 'complete' ? SiteWorkspace::FORMAT : 1,
        'copied' => count($manifest['copied']), 'total' => count($manifest['inventory']['files'])]; }
    protected function availableBytes(string $directory): float { return (float) disk_free_space($directory); }
    protected function checkpoint(string $stage, array $manifest): void {}
}
