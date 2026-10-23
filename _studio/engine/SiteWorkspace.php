<?php
declare(strict_types=1);

namespace VoxelSite;

/**
 * Canonical filesystem boundaries shared by Studio, REST and MCP.
 * Roots are server configuration, never request input. All final file targets
 * must pass a resolver; a root getter alone is not authorization to access it.
 */
final class SiteWorkspace
{
    public const FORMAT = 2;
    public const ACCESS_MARKER = '# VoxelSite private draft workspace';
    private Database $db;
    private string $draft;
    private string $published;
    private string $publishedAssets;
    private string $migration;

    public function __construct(?Database $db = null, ?string $draftRoot = null,
        ?string $publishedRoot = null, ?string $stateRoot = null, ?string $publishedAssetsRoot = null,
        private bool $tracksDraftVersion = true)
    {
        $this->db = $db ?? Database::getInstance();
        $draftRoot ??= getenv('VS_TEST_PREVIEW_DIR') ?: dirname(__DIR__) . '/preview';
        $testAssets = getenv('VS_TEST_ASSETS_DIR') ?: null;
        $explicitPublishedRoot = $publishedRoot !== null;
        $publishedRoot ??= getenv('VS_TEST_DOC_ROOT') ?: ($testAssets ? dirname($testAssets) : dirname(__DIR__, 2));
        $this->draft = self::trustedRoot($draftRoot);
        $this->published = self::trustedRoot($publishedRoot);
        $this->publishedAssets = self::trustedRoot($publishedAssetsRoot
            ?? ($explicitPublishedRoot ? $this->published . '/assets' : ($testAssets ?? $this->published . '/assets')));
        $this->migration = self::trustedRoot($stateRoot
            ?? (getenv('VS_TEST_WORKSPACE_STATE_DIR') ?: dirname($this->draft) . '/data/workspace-migration'));
        if ($this->draft === $this->published || $this->draft . '/assets' === $this->publishedAssets) {
            throw new \RuntimeException('Draft and published workspace roots must be different.');
        }
    }

    public function draftRoot(): string { return $this->draft; }
    public function draftAssetsRoot(): string { return $this->draft . '/assets'; }
    public function publishedRoot(): string { return $this->published; }
    public function publishedAssetsRoot(): string { return $this->publishedAssets; }
    public function migrationRoot(): string { return $this->migration; }
    public function mutationLockPath(): string
    { return getenv('VS_TEST_MUTATION_LOCK') ?: dirname($this->draft) . '/data/site-mutation.lock'; }

    /** Invalidate external reviews before a legacy writer changes canonical bytes. */
    public function invalidateDraft(): void
    {
        if ($this->tracksDraftVersion) SiteMutationLock::draftWillChange($this->db, $this->mutationLockPath());
    }

    public function status(): array
    {
        // Only a pre-migration schema is a setup state. Storage, locking
        // and other query failures must retain their operational meaning.
        $exists = $this->db->queryOne("SELECT name FROM sqlite_master WHERE name = 'site_workspace_state' AND type IN ('table', 'view')");
        $state = $exists ? $this->db->queryOne('SELECT * FROM site_workspace_state WHERE id = 1') : null;
        return ['format' => (int) ($state['format'] ?? 1), 'ready' => (int) ($state['format'] ?? 1) === self::FORMAT,
            'draft_version' => (int) ($state['draft_version'] ?? 0),
            'release_id' => $state['release_id'] ?? null,
            'reservation_operation_id' => $state['reservation_operation_id'] ?? null];
    }

    public function assertReady(): void
    {
        $this->assertRootIntegrity();
        if (!$this->status()['ready']) {
            throw new WorkspaceNotReadyException('workspace_migration_required: Finish the private draft migration before reading or editing website files.');
        }
        self::resolveWithin($this->draft, 'assets');
        if (!is_dir($this->draftAssetsRoot())) {
            throw new WorkspaceNotReadyException('workspace_unavailable: Private draft assets are missing. Resume workspace recovery.');
        }
        $protection = self::resolveWithin($this->draft, '.htaccess');
        $access = is_file($protection) ? (string) file_get_contents($protection) : '';
        if (!str_contains($access, self::ACCESS_MARKER) || !str_contains($access, 'Require all denied')
            || !str_contains($access, 'Deny from all')) {
            throw new WorkspaceNotReadyException('workspace_unavailable: Private draft access protection is missing.');
        }
    }

    public function isImmutable(string $relative): bool
    {
        $relative = self::normalizeRelative($relative);
        return $relative === 'assets/library' || str_starts_with($relative, 'assets/library/')
            || $relative === 'assets/icons' || str_starts_with($relative, 'assets/icons/');
    }

    public function resolveDraft(string $relative, bool $forWrite = false): string
    {
        $this->assertReady();
        $relative = self::normalizeRelative($relative);
        $this->assertSitePath($relative);
        if ($this->isImmutable($relative)) {
            if ($forWrite) {
                throw new \RuntimeException('immutable_asset: Copy this library item to a managed draft asset before editing it.');
            }
            return self::resolveWithin($this->publishedAssets, substr($relative, 7));
        }
        if ($relative === '.htaccess' || $relative === '.user.ini') {
            throw new \RuntimeException('Draft access configuration is not a website file.');
        }
        return self::resolveWithin($this->draft, $relative);
    }

    public function resolvePublished(string $relative, bool $forWrite = false): string
    {
        $this->assertRootIntegrity();
        $relative = self::normalizeRelative($relative);
        $this->assertSitePath($relative);
        if ($forWrite && $this->isImmutable($relative)) {
            throw new \RuntimeException('immutable_asset: Published library and icon files are read-only.');
        }
        return str_starts_with($relative, 'assets/')
            ? self::resolveWithin($this->publishedAssets, substr($relative, 7))
            : self::resolveWithin($this->published, $relative);
    }

    /** Report source reads that cannot silently become isolated preview reads. */
    public function preflight(): array
    {
        $issues = [];
        $transforms = [];
        try {
            $allowSchemaMigration = !$this->status()['ready'];
            $inventory = self::inventory($this->draft, ['assets']);
            foreach ($inventory['files'] as $relative => $metadata) {
                if (str_contains($relative, '/') && in_array(basename($relative), ['.htaccess', '.user.ini'], true)) {
                    $issues[] = ['code' => 'nested_access_configuration', 'path' => $relative,
                        'message' => 'Remove nested server access rules before enabling private draft storage.'];
                }
                if (!str_ends_with(strtolower($relative), '.php')) { continue; }
                $source = file_get_contents(self::resolveWithin($this->draft, $relative));
                if (!is_string($source)) { throw new \RuntimeException('Cannot inspect draft PHP: ' . $relative); }
                $replacement = $allowSchemaMigration ? WorkspaceSchemaCompatibility::replacement($relative, $source) : null;
                if ($replacement !== null) {
                    // Validate the exact candidate through the ordinary checks below.
                    // Migration retains and applies this disclosed change at activation.
                    $transforms[$relative] = ['before_sha256' => hash('sha256', $source),
                        'after_sha256' => hash('sha256', $replacement), 'before_base64' => base64_encode($source),
                        'mode' => $metadata['mode']];
                    $source = $replacement;
                }
                $pattern = '/\$_SERVER\s*\[\s*[\'"]DOCUMENT_ROOT[\'"]\s*\]/';
                if (preg_match($pattern, $source, $match, PREG_OFFSET_CAPTURE)
                    || (($position = strpos($source, $this->publishedAssets)) !== false
                        && ($match = [[$this->publishedAssets, $position]]))) {
                    $issues[] = ['code' => 'hardcoded_published_read', 'path' => $relative,
                        'line' => substr_count(substr($source, 0, $match[0][1]), "\n") + 1,
                        'message' => 'This PHP file reads the published document root. Use a path relative to the draft page or shared partial before enabling isolated preview.'];
                }
            }
        } catch (\RuntimeException $error) {
            $issues[] = ['code' => 'unsafe_workspace_path', 'message' => $error->getMessage()];
        }
        return ['ok' => $issues === [], 'issues' => $issues, 'source_transforms' => $transforms];
    }

    private function assertSitePath(string $relative): void
    {
        foreach (explode('/', $relative) as $segment) {
            if (in_array($segment, ['.htaccess', '.user.ini', '.env', '.git'], true)) {
                throw new \RuntimeException('Server access configuration is not a generated website file.');
            }
        }
        $first = explode('/', $relative, 2)[0];
        if (in_array($first, ['_studio', '_data', '_prompts', 'vendor', 'node_modules', '.git', '.env'], true)) {
            throw new \RuntimeException('Path is outside the generated website.');
        }
    }

    /** Shared no-follow check for migration and final file resolution. */
    public static function resolveWithin(string $root, string $relative): string
    {
        $relative = self::normalizeRelative($relative);
        clearstatcache(true, $root);
        if (is_link($root)) { throw new \RuntimeException('workspace_unsafe_path: Symlink roots are not allowed.'); }
        if (file_exists($root) && !is_dir($root)) { throw new \RuntimeException('Workspace root is not a directory.'); }
        $path = rtrim($root, '/');
        foreach (explode('/', $relative) as $part) {
            $path .= '/' . $part;
            clearstatcache(true, $path);
            if (is_link($path)) { throw new \RuntimeException('workspace_unsafe_path: Symlink paths are not allowed: ' . $relative); }
            if (file_exists($path) && !is_dir($path) && !is_file($path)) {
                throw new \RuntimeException('workspace_unsafe_path: Only regular files and directories are allowed.');
            }
        }
        return $path;
    }

    public static function normalizeRelative(string $relative): string
    {
        if ($relative === '' || preg_match('/[\x00-\x1f\x7f\\\\]/', $relative) || str_starts_with($relative, '/')
            || str_contains($relative, ':') || str_contains($relative, '//')) {
            throw new \RuntimeException('Invalid workspace-relative path.');
        }
        foreach (explode('/', $relative) as $part) {
            if ($part === '' || $part === '.' || $part === '..') { throw new \RuntimeException('Invalid workspace-relative path.'); }
        }
        return $relative;
    }

    /** Detect replacement of a server-owned root's canonical ancestors. */
    public function assertRootIntegrity(): void
    {
        foreach ([$this->draft, $this->published, $this->publishedAssets, $this->migration] as $root) {
            for ($path = $root; $path !== '/' && $path !== '.'; $path = dirname($path)) {
                clearstatcache(true, $path);
                if (is_link($path)) throw new \RuntimeException('workspace_unsafe_path: A configured root or ancestor became a symlink.');
            }
        }
    }

    /**
     * Read a deterministic no-follow inventory. Exclusions apply only to
     * named top-level directories and are used for immutable or legacy assets.
     */
    public static function inventory(string $root, array $exclude = []): array
    {
        if (is_link($root) || !is_dir($root)) { throw new \RuntimeException('workspace_unsafe_path: Source directory is unavailable or is a symlink.'); }
        $files = []; $directories = [];
        $walk = function (string $relative = '') use (&$walk, &$files, &$directories, $root, $exclude): void {
            $directory = $relative === '' ? $root : self::resolveWithin($root, $relative);
            $names = scandir($directory);
            if ($names === false) { throw new \RuntimeException('Cannot read workspace directory.'); }
            foreach ($names as $name) {
                if ($name === '.' || $name === '..' || ($relative === '' && in_array($name, $exclude, true))) { continue; }
                $path = $relative === '' ? $name : $relative . '/' . $name;
                $absolute = self::resolveWithin($root, $path);
                if (is_dir($absolute)) {
                    $directories[$path] = fileperms($absolute) & 0777;
                    $walk($path);
                } elseif (is_file($absolute)) {
                    $before = lstat($absolute);
                    $hash = hash_file('sha256', $absolute);
                    clearstatcache(true, $absolute);
                    $after = lstat($absolute);
                    if ($before === false || $after === false || $hash === false || is_link($absolute)
                        || $before['ino'] !== $after['ino'] || $before['size'] !== $after['size']
                        || $before['mtime'] !== $after['mtime']) {
                        throw new \RuntimeException('workspace_source_changed: A file changed during inventory.');
                    }
                    $files[$path] = ['sha256' => $hash, 'size' => $after['size'], 'mode' => $after['mode'] & 0777];
                } else {
                    throw new \RuntimeException('workspace_unsafe_path: Unsupported filesystem entry.');
                }
            }
        };
        $walk(); ksort($files); ksort($directories);
        return ['files' => $files, 'directories' => $directories];
    }

    /** Resolve only server-supplied ancestors; descendants stay no-follow. */
    private static function trustedRoot(string $path): string
    {
        if (!str_starts_with($path, '/') || preg_match('/[\x00-\x1f\x7f]/', $path)) {
            throw new \RuntimeException('Workspace roots must be absolute server paths.');
        }
        $path = rtrim($path, '/');
        if (is_link($path)) { throw new \RuntimeException('Workspace roots cannot be symlinks.'); }
        $existing = $path; $suffix = [];
        while (!file_exists($existing)) {
            array_unshift($suffix, basename($existing));
            $parent = dirname($existing);
            if ($parent === $existing) { throw new \RuntimeException('Workspace root has no existing parent.'); }
            $existing = $parent;
        }
        $real = realpath($existing);
        if ($real === false || !is_dir($real)) { throw new \RuntimeException('Workspace root is unavailable.'); }
        return $real . ($suffix === [] ? '' : '/' . implode('/', $suffix));
    }
}
