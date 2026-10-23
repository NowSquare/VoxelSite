<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database,SiteMutationLock,SiteWorkspace};

/** Small optional maintenance steps; no worker or cron required by the host. */
final class MaintenanceService
{
    private int $entries=0;
    private float $deadline=0;
    public function __construct(private Database $db,private ActorPolicy $policy,private SiteWorkspace $workspace,
        private string $root,private int $entryBudget=200,private float $seconds=0.05)
    {
        if (!str_starts_with($root,'/') || $entryBudget<1 || $entryBudget>1000 || $seconds<=0 || $seconds>0.25) {
            throw new \InvalidArgumentException('Invalid trusted maintenance configuration.');
        }
    }
    public function run(OperationActor $actor):array
    {
        $this->policy->require($actor,[]);
        $result=['completed'=>0,'entries'=>0,'skipped'=>true];
        $maintenance=null;$upload=null;
        try {
            // Active or unresolved work owns all retained material until it
            // finishes. Cleanup does not contend with that worker's lock.
            if ($this->workspace->status()['reservation_operation_id']!==null) return $result;
            if ((int)$this->db->scalar('SELECT last_run FROM agent_maintenance_state WHERE id=1')>time()-30) return $result;
            for ($parent=$this->root;$parent!=='/';$parent=dirname($parent)) {
                if (is_link($parent)) return $result;
            }
            if (!is_dir($this->root) && !mkdir($this->root,0700,true)) return $result;
            $maintenance=$this->lock(SiteWorkspace::resolveWithin($this->root,'maintenance.lock'));
            if (!$maintenance) return $result;
            $website=SiteMutationLock::acquire($this->workspace->mutationLockPath(),$this->db);
            if ((int)$this->db->scalar('SELECT last_run FROM agent_maintenance_state WHERE id=1')>time()-30) return $result;
            $this->db->update('agent_maintenance_state',['last_run'=>time()],'id=1');
            $this->deadline=microtime(true)+$this->seconds;$this->entries=0;$result['skipped']=false;

            // Compact identities survive pruning; an expired request cannot
            // allocate a new brief or redraw its design direction on replay.
            $briefs=$this->db->query('SELECT id FROM agent_briefs b WHERE expires_at<=? AND pruned_at IS NULL
                AND NOT EXISTS (SELECT 1 FROM agent_change_sets c WHERE c.brief_id=b.id AND c.status!=?) ORDER BY expires_at LIMIT 5',
                [time(),'expired']);
            foreach ($briefs as $row) {
                if ($this->outOfTime()) break;
                $this->db->update('agent_briefs',['payload_json'=>'{}','direction_json'=>null,
                    'context_refs_json'=>'[]','pruned_at'=>time()],'id=?',[$row['id']]);$result['completed']++;
            }
            $operations=new OperationStore($this->db,$this->policy,$this->workspace->mutationLockPath());
            if (!$this->outOfTime()) $result['completed']+=$operations->pruneResults(5);
            if (!$this->outOfTime()) $result['completed']+=SnapshotDeletionService::pruneTerminal($this->db,$this->workspace->mutationLockPath(),1);

            $protected="NOT EXISTS (SELECT 1 FROM agent_operations o WHERE o.preparation_id=c.id
                AND (o.state IN ('prepared','applying','recovery_required') OR o.result_pruned_at IS NULL))";
            foreach ([
                ['table'=>'agent_change_sets','directory'=>'changes','prefix'=>'change','extra'=>''],
                ['table'=>'agent_publish_plans','directory'=>'releases','prefix'=>'publish',
                    'extra'=>" AND c.status!='published' AND NOT EXISTS (SELECT 1 FROM site_releases r WHERE r.plan_id=c.id)
                        AND NOT EXISTS (SELECT 1 FROM agent_restore_plans r WHERE r.snapshot_id=c.id)"],
            ] as $spec) {
                if ($this->outOfTime()) break;
                $rows=$this->db->query("SELECT c.id FROM {$spec['table']} c WHERE c.expires_at<=? AND c.pruned_at IS NULL
                    AND $protected {$spec['extra']} ORDER BY c.expires_at LIMIT 2",[time()]);
                foreach ($rows as $row) {
                    if ($this->outOfTime()) break;
                    if (!preg_match('/^'.$spec['prefix'].'_[a-f0-9]{32}$/D',$row['id'])) continue;
                    $target=SiteWorkspace::resolveWithin($this->root,$spec['directory'].'/'.$row['id']);
                    if (!$this->removeBounded($target)) continue;
                    $this->db->update($spec['table'],['status'=>'expired','staged_bytes'=>0,'manifest_json'=>null,
                        'payload_json'=>null,'pruned_at'=>time()],'id=?',[$row['id']]);$result['completed']++;
                }
            }
            if (!$this->outOfTime()) {
                $resets=$this->db->query("SELECT c.id FROM agent_reset_plans c WHERE c.expires_at<=? AND c.staged_bytes>0
                    AND $protected
                    AND NOT EXISTS (SELECT 1 FROM agent_admin_plans a WHERE a.id=c.approval_id
                        AND a.status IN ('pending','approved') AND a.expires_at>?)
                    ORDER BY c.expires_at LIMIT 1",[time(),time()]);
                foreach($resets as $row) {
                    if(!preg_match('/^reset_[a-f0-9]{32}$/D',$row['id']) || $this->outOfTime())continue;
                    if(!$this->removeBounded(SiteWorkspace::resolveWithin($this->root,'resets/'.$row['id'])))continue;
                    // The identity remains a tombstone. Accounting is released
                    // only after every retained file has been removed.
                    $this->db->update('agent_reset_plans',['status'=>'expired','staged_bytes'=>0,'manifest_json'=>null],
                        'id=?',[$row['id']]);$result['completed']++;
                }
            }
            if (!$this->outOfTime() && is_dir(SiteWorkspace::resolveWithin($this->root,'uploads'))) {
                $upload=$this->lock(SiteWorkspace::resolveWithin($this->root,'uploads/transfers.lock'));
                if ($upload) {
                    $rows=$this->db->query('SELECT id FROM agent_asset_uploads WHERE expires_at<=? AND pruned_at IS NULL ORDER BY expires_at LIMIT 1',[time()]);
                    foreach ($rows as $row) {
                        if (!preg_match('/^upload_[a-f0-9]{32}$/D',$row['id']) || $this->outOfTime()) continue;
                        if (!$this->removeBounded(SiteWorkspace::resolveWithin($this->root,'uploads/'.$row['id']))) continue;
                        $this->db->transaction(function() use($row):void {
                            $this->db->delete('agent_asset_chunks','upload_id=?',[$row['id']]);
                            $this->db->update('agent_asset_requests',['result_json'=>null],'upload_id=?',[$row['id']]);
                            $this->db->update('agent_asset_uploads',['expected_bytes'=>0,'received_bytes'=>0,'result_json'=>null,
                                'final_bytes'=>null,'pruned_at'=>time()],'id=?',[$row['id']]);
                        });$result['completed']++;
                    }
                }
            }
        } catch (\Throwable) {
            // Failure never releases accounting or changes a live/draft path.
            // The next authorized allocation can retry the retained remainder.
        } finally {
            foreach ([$upload,$maintenance] as $handle) if (is_resource($handle)) {flock($handle,LOCK_UN);fclose($handle);}
        }
        $result['entries']=$this->entries;
        return $result;
    }
    private function outOfTime():bool {return $this->entries >= $this->entryBudget || microtime(true)>=$this->deadline;}
    private function lock(string $path) {
        $handle=fopen($path,'c');
        if (!$handle || !flock($handle,LOCK_EX|LOCK_NB)) {if ($handle) fclose($handle);return null;}
        chmod($path,0600);return $handle;
    }
    private function removeBounded(string $path):bool
    {
        if (is_link($path)) return false;
        if (!file_exists($path)) return true;
        if ($this->outOfTime()) return false;
        if (is_file($path)) {++$this->entries;return unlink($path);}
        if (!is_dir($path)) return false;
        foreach (new \DirectoryIterator($path) as $entry) {
            if ($entry->isDot()) continue;
            if ($this->outOfTime()) return false;
            $child=SiteWorkspace::resolveWithin($path,$entry->getFilename());
            if (!$this->removeBounded($child)) return false;
        }
        if ($this->outOfTime()) return false;
        ++$this->entries;return rmdir($path);
    }
}
