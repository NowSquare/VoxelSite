<?php
declare(strict_types=1);
namespace VoxelSite;
use VoxelSite\Agent\{CanonicalJson, OperationException, SitePathPolicy, WorkspaceFiles};

/** Read-only bounded archive repository shared by Studio and management services. */
final class DesignManager
{
    private Database $db;
    private SiteWorkspace $workspace;
    private string $designsDir;
    public function __construct(?Database $db = null, ?SiteWorkspace $workspace = null, ?string $designsDir = null)
    {
        $this->db = $db ?? Database::getInstance();
        $this->workspace = $workspace ?? new SiteWorkspace($this->db);
        $this->designsDir = $designsDir ?? dirname($this->workspace->draftRoot()) . '/data/designs';
        $this->designsDir = FilesystemPath::normalize($this->designsDir);
        if (!FilesystemPath::isAbsolute($this->designsDir) || is_link($this->designsDir)) throw new \InvalidArgumentException('Trusted private design storage is required.');
    }
    public function root(): string { return $this->designsDir; }
    public function directory(string $id): string
    {
        if (!preg_match('/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/D', $id)) throw new OperationException('invalid_path', 'Invalid design identifier.');
        return SiteWorkspace::resolveWithin($this->designsDir, $id);
    }
    public function list(bool $includeSystemBackups = false): array
    {
        if (!is_dir($this->designsDir)) return [];
        $out = []; $count = 0;
        foreach (new \DirectoryIterator($this->designsDir) as $entry) {
            if ($entry->isDot() || $entry->getFilename() === '.htaccess') continue;
            if (++$count > 256) throw new OperationException('size_limit', 'The design library exceeds its supported inventory budget.');
            $path = $this->directory($entry->getFilename());
            if (!is_dir($path)) continue;
            $meta = $this->readMetadata($entry->getFilename());
            if ($meta !== null && ($includeSystemBackups || empty($meta['is_system_backup']))) $out[] = $meta;
        }
        usort($out, fn($a, $b) => [$b['updated_at'] ?? '', $b['id']] <=> [$a['updated_at'] ?? '', $a['id']]);
        return $out;
    }
    public function readMetadata(string $id): ?array
    {
        $path = $this->directory($id);
        $row = $this->db->queryOne('SELECT metadata_json,status FROM agent_designs WHERE id = ?', [$id]);
        if ($row !== null) return $row['status'] === 'valid' ? json_decode($row['metadata_json'], true, 32, JSON_THROW_ON_ERROR) : null;
        if (str_starts_with($id, 'design_')) return null;
        $meta = SiteWorkspace::resolveWithin($path, 'metadata.json');
        if (!is_file($meta)) return null;
        if (filesize($meta) > 262144) throw new OperationException('size_limit', 'Saved design metadata is oversized.');
        $data = json_decode(file_get_contents($meta, false, null, 0, 262145), true, 32, JSON_THROW_ON_ERROR);
        if (!is_array($data) || ($data['id'] ?? null) !== $id) throw new OperationException('content_conflict', 'Saved design metadata has an invalid identity.');
        $data['archive_format'] = $data['archive_format'] ?? 1;
        $data['domains'] = ['draft'];
        return $data;
    }
    public function archive(string $id): array
    {
        $meta = $this->readMetadata($id);
        if ($meta === null) throw new OperationException('content_conflict', 'The saved design is unavailable.');
        $root = $this->directory($id); $files = []; $bytes = 0;
        if (($meta['archive_format'] ?? 1) === 3) {
            $row = $this->db->queryOne("SELECT manifest_json,digest FROM agent_designs WHERE id = ? AND status = 'valid'", [$id]);
            $manifest = json_decode($row['manifest_json'], true, 64, JSON_THROW_ON_ERROR);
            if (CanonicalJson::digest($manifest) !== $row['digest'] || ($manifest['format'] ?? null) !== 3) throw new OperationException('content_conflict', 'The saved design manifest failed verification.');
            if (count($manifest['files']) > WorkspaceFiles::MAX_FILES) throw new OperationException('size_limit', 'The design contains too many files.');
            foreach ($manifest['files'] as $path => $hash) {
                SitePathPolicy::canonical($path);
                $files[$path] = $this->readFile(SiteWorkspace::resolveWithin($root . '/preview', $path), $bytes);
                if (hash('sha256', $files[$path]) !== $hash) throw new OperationException('content_conflict', 'A saved design file failed verification.');
            }
            $metadata = $manifest['metadata']; $actionDigest = $manifest['action_digest'];
        } elseif (($meta['archive_format'] ?? 1) === 1) {
            foreach (['preview' => '', 'css' => 'assets/css/', 'js' => 'assets/js/', 'data' => 'assets/data/', 'forms' => 'assets/forms/'] as $folder => $prefix) {
                $source = SiteWorkspace::resolveWithin($root, $folder);
                if (!is_dir($source)) continue;
                $inventory = SiteWorkspace::inventory($source, $folder === 'preview' ? ['assets'] : []);
                foreach ($inventory['files'] as $name => $entry) {
                    if (in_array(basename($name), ['.htaccess', '.gitkeep', '.user.ini'], true)) continue;
                    $path = $prefix . $name; SitePathPolicy::canonical($path);
                    if (count($files) >= WorkspaceFiles::MAX_FILES) throw new OperationException('size_limit', 'The legacy design contains too many files.');
                    $files[$path] = $this->readFile(SiteWorkspace::resolveWithin($source, $name), $bytes);
                }
            }
            $metadata = ['pages' => []]; $actionDigest = null;
        } else throw new OperationException('content_conflict', 'This saved design archive format is unsupported.');
        ksort($files, SORT_STRING);
        SnapshotService::validateDraftMetadata($metadata, $files);
        return ['metadata' => $meta, 'action_digest' => $actionDigest, 'domains' => ['draft' => ['files' => $files, 'metadata' => $metadata]]];
    }
    public static function isDesignPath(string $path): bool
    { return !str_starts_with($path, 'assets/') || (bool) preg_match('~^assets/(css|js|data|forms)/~', $path); }
    private function readFile(string $path, int &$bytes): string
    {
        if (!is_file($path) || is_link($path) || ($bytes += filesize($path)) > WorkspaceFiles::MAX_BYTES) throw new OperationException('size_limit', 'The saved design exceeds the private read budget.');
        $size = filesize($path); $content = file_get_contents($path, false, null, 0, $size + 1);
        if (!is_string($content) || strlen($content) !== $size) throw new OperationException('content_conflict', 'Saved design bytes changed while reading.');
        return $content;
    }
}
