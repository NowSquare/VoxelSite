<?php
declare(strict_types=1);
namespace VoxelSite;

/** Operational state stays in SQLite; recovery file contents stay in private archives. */
final class SitePlanStore
{
    private string $snapshotDir;
    public function __construct(private Database $db, private FileManager $files)
    {
        // Safe for upgrades reached before the install/update migration runner.
        $migration = require __DIR__ . '/migrations/012_site_control_plans.php';
        ($migration['up'])($db);
        $this->snapshotDir = getenv('VS_TEST_SNAPSHOT_DIR') ?: dirname(__DIR__) . '/data/snapshots';
    }

    public function create(int $userId, array $plan): string
    {
        if (($plan['applicable'] ?? true) !== true || empty($plan['edits']) || count($plan['edits']) > 40) {
            throw new \RuntimeException('The whole plan must be valid before it can be approved.');
        }
        foreach ($plan['edits'] as $edit) {
            $path = $edit['file'] ?? '';
            if (!is_string($path) || !preg_match('#^(?:[A-Za-z0-9_-]+/)*[A-Za-z0-9_.-]+\.(?:php|html|css|js|json)$#D', $path)
                || str_contains($path, '..') || str_starts_with($path, '_prompts/')
                || ($edit['anchored'] ?? false) !== true || !is_string($edit['source_hash'] ?? null)
                || in_array($path, ['assets/css/tailwind.css','assets/data/memory.json','assets/data/design-intelligence.json'], true)
                || !in_array($edit['strategy'] ?? '', ['token-edit','attribute-edit','line-replace','block-replace','block-insert','meta-edit','content-edit'], true)
                || !is_string($edit['before_snippet'] ?? null) || $edit['before_snippet'] === ''
                || !is_string($edit['after_snippet'] ?? null)) {
                throw new \RuntimeException('Invalid or unbounded reviewed edit.');
            }
            $source = $this->files->readFile($path);
            if ($source === null || !hash_equals($edit['source_hash'], hash('sha256', $source))) {
                throw new \RuntimeException('A source file changed during planning. Build a new plan.');
            }
        }
        $plan['site_fingerprint'] = $this->fingerprint();
        $id = bin2hex(random_bytes(24));
        $this->db->insert('site_control_plans', ['id'=>$id,'user_id'=>$userId,'status'=>'ready',
            'plan_json'=>json_encode($plan, JSON_THROW_ON_ERROR),'created_at'=>time(),'expires_at'=>time()+1800]);
        return $id;
    }

    public function get(string $id, int $userId): ?array
    {
        $row = $this->db->queryOne('SELECT * FROM site_control_plans WHERE id = ? AND user_id = ?', [$id,$userId]);
        if (!$row) { return null; }
        return ['plan_id'=>$id,'status'=>$row['status'],'plan'=>json_decode($row['plan_json'], true, 512, JSON_THROW_ON_ERROR),
            'result'=>$row['result_json'] ? json_decode($row['result_json'], true, 512, JSON_THROW_ON_ERROR) : null,
            'recovery_snapshot_id'=>$row['recovery_snapshot_id'] === null ? null : (int)$row['recovery_snapshot_id']];
    }

    /** Caller holds SiteMutationLock through finish(). */
    public function begin(string $id, int $userId): array
    {
        $row = $this->db->queryOne('SELECT * FROM site_control_plans WHERE id = ? AND user_id = ?', [$id,$userId]);
        if (!$row) { throw new \RuntimeException('Reviewed plan not found. Build a new plan.'); }
        if (in_array($row['status'], ['applied','failed'], true)) { return $this->get($id,$userId); }
        if ($row['status'] !== 'ready') { throw new \RuntimeException('This apply is already in progress.'); }
        if ((int)$row['expires_at'] < time()) { throw new \RuntimeException('This review expired. Build a new plan.'); }
        $plan = json_decode($row['plan_json'], true, 512, JSON_THROW_ON_ERROR);
        if (!hash_equals($plan['site_fingerprint'], $this->fingerprint())) {
            throw new \RuntimeException('The website changed after review. Build and review a new plan.');
        }
        $paths = [];
        foreach ($plan['edits'] as $edit) {
            $source = $this->files->readFile($edit['file']);
            if ($source === null || !hash_equals($edit['source_hash'], hash('sha256', $source))) {
                throw new \RuntimeException('A reviewed source file changed. Build and review a new plan.');
            }
            $paths[$edit['file']] = $source;
        }
        $paths['assets/css/tailwind.css'] = $this->files->readFile('assets/css/tailwind.css');
        [$snapshotId, $manifest] = $this->backup($id,$userId,$paths);
        $this->db->update('site_control_plans', ['status'=>'applying','recovery_snapshot_id'=>$snapshotId,
            'manifest_json'=>json_encode($manifest, JSON_THROW_ON_ERROR)], 'id = ? AND status = ?', [$id,'ready']);
        return $this->get($id,$userId);
    }

    public function finish(string $id, array $result): void
    {
        $row = $this->db->queryOne('SELECT recovery_snapshot_id FROM site_control_plans WHERE id = ?',[$id]);
        $result['plan_id'] = $id;
        $result['recovery_snapshot_id'] = isset($row['recovery_snapshot_id']) ? (int)$row['recovery_snapshot_id'] : null;
        $result['filesChanged'] = $result['files_changed'] ?? 0;
        $this->db->update('site_control_plans', ['status'=>!empty($result['success'])?'applied':'failed',
            'result_json'=>json_encode($result, JSON_THROW_ON_ERROR)], 'id = ?',[$id]);
    }

    /** Only call while holding the mutation lock: no running worker can then own these rows. */
    public function recoverInterrupted(): void
    {
        foreach ($this->db->query("SELECT * FROM site_control_plans WHERE status = 'applying'") as $row) {
            $clean = true; $remaining = [];
            $manifest = json_decode($row['manifest_json'] ?? '{}',true,512,JSON_THROW_ON_ERROR);
            $snapshot = $this->db->queryOne('SELECT filename FROM snapshots WHERE id = ?',[$row['recovery_snapshot_id']]);
            $zip = new \ZipArchive();
            $opened = $snapshot && $zip->open($this->snapshotDir . '/' . $snapshot['filename']) === true;
            foreach ($manifest as $path=>$meta) {
                try {
                    if (!$opened) { throw new \RuntimeException('Recovery archive is unavailable.'); }
                    if ($meta['exists']) {
                        $content = $zip->getFromName($meta['entry']);
                        if (!is_string($content) || !hash_equals($meta['hash'],hash('sha256',$content))) {
                            throw new \RuntimeException('Recovery bytes do not match the saved source.');
                        }
                        $this->files->writeExactFile($path,$content);
                        if ($this->files->readFile($path) !== $content) { throw new \RuntimeException('Restoration failed.'); }
                    } else {
                        $this->files->deleteFile($path);
                        if ($this->files->readFile($path) !== null) { throw new \RuntimeException('Removal failed.'); }
                    }
                } catch (\Throwable) { $clean=false; $remaining[]=$path; }
            }
            if ($opened) { $zip->close(); }
            try { $this->files->syncPageRegistry(true); } catch (\Throwable) { $clean=false; }
            $this->finish($row['id'],['success'=>false,'files_changed'=>0,'rollback_clean'=>$clean,
                'remaining_changed_files'=>$remaining,'verification'=>[],
                'error'=>$clean ? 'The apply was interrupted. Original files have been restored and verified.'
                    : 'The apply was interrupted. Some files could not be restored. Review the recovery snapshot before continuing.']);
        }
    }

    private function backup(string $id, int $userId, array $paths): array
    {
        require_once __DIR__ . '/SiteControlSnapshots.php';
        $snapshot = \createSiteControlSnapshot($this->db, 'Before Site apply', 'Recovery for reviewed Site plan ' . $id, $userId);
        if (!$snapshot['ok']) throw new \RuntimeException($snapshot['error']);
        $snapshotId = (int) $snapshot['snapshot']['id'];
        $filename = $snapshot['snapshot']['filename'];
        $manifest=[];
        foreach ($paths as $path=>$content) {
            $manifest[$path]=['exists'=>$content!==null,'hash'=>$content===null?null:hash('sha256',$content),
                'entry'=>str_starts_with($path,'assets/')?$path:'preview/'.$path];
        }
        $check=new \ZipArchive();
        if ($check->open($this->snapshotDir.'/'.$filename) !== true) { throw new \RuntimeException('Cannot verify recovery archive.'); }
        foreach ($paths as $path=>$content) {
            if ($content!==null && $check->getFromName($manifest[$path]['entry']) !== $content) {
                $check->close(); throw new \RuntimeException('Recovery archive differs from reviewed source.');
            }
        }
        $check->close();
        return [$snapshotId,$manifest];
    }

    private function fingerprint(): string
    {
        return self::sourceFingerprint($this->files);
    }

    /** Pure legacy identity comparison; constructing the store is unnecessary. */
    public static function sourceFingerprint(FileManager $files): string
    {
        $paths = array_merge(array_column($files->listPreviewFilesRecursive(),'path'),
            array_column($files->listPartialFiles(),'path'),['_partials/nav.php','assets/css/style.css']);
        $paths = array_values(array_unique($paths)); sort($paths);
        $hashes=[];
        foreach ($paths as $path) { $source=$files->readFile($path); $hashes[$path]=$source===null?null:hash('sha256',$source); }
        return hash('sha256', json_encode($hashes, JSON_THROW_ON_ERROR));
    }
}
