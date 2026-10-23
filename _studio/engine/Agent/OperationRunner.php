<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, SiteMutationLock, SiteRecovery};

/** Bounded trusted steps. A retry reads; only explicit continuation advances. */
final class OperationRunner
{
    public function __construct(private Database $db, private ActorPolicy $policy,
        private OperationStore $store, private ?string $lockPath = null, private bool $requiresWritableSite = true) {}

    public function start(OperationActor $actor,string $operationId,string $kind,\stdClass $request,
        string $beforeVersion,?string $preparationId,array $scopes,callable $step,callable $restore): array
    {
        return ProviderCallPolicy::runExternal(function () use ($actor,$operationId,$kind,$request,$beforeVersion,$preparationId,$scopes,$step,$restore): array {
            $this->policy->require($actor,$scopes);
            $row = $this->store->prepare($actor,$operationId,$kind,$request,$beforeVersion,$preparationId);
            if ($row['state'] !== 'prepared') return self::publicState($row);
            $lock = SiteMutationLock::acquire($this->lockPath,$this->db,$row['id']);
            if ($this->requiresWritableSite) SiteRecovery::assertWritable($this->db);
            $claimed = $this->store->claim($actor,$operationId,0);
            return $this->advance($actor,$claimed,$step,$restore);
        });
    }

    public function continue(OperationActor $actor,string $operationId,int $expectedCheckpoint,array $scopes,
        callable $step,callable $restore,callable $verifyInterrupted): array
    {
        return ProviderCallPolicy::runExternal(function () use ($actor,$operationId,$expectedCheckpoint,$scopes,$step,$restore,$verifyInterrupted): array {
            $this->policy->require($actor,$scopes);
            $row = $this->store->get($actor,$operationId);
            if (in_array($row['state'],OperationStore::TERMINAL,true) || $row['state']==='recovery_required') return self::publicState($row);
            $lock = SiteMutationLock::acquire($this->lockPath,$this->db,$row['id']);
            if ($row['checkpoint_number'] !== $expectedCheckpoint) throw new OperationException('content_conflict','Read the latest operation checkpoint before continuing.');
            if ($row['lease_expires_at'] !== null && $row['lease_expires_at'] <= time()) {
                $row = $this->store->reconcile($actor,$operationId,$verifyInterrupted);
            }
            $claimed = $this->store->claim($actor,$operationId,$expectedCheckpoint);
            return $this->advance($actor,$claimed,$step,$restore);
        });
    }

    public function recover(OperationActor $actor,string $operationId,array $scopes,callable $restore): array
    {
        return ProviderCallPolicy::runExternal(function () use ($actor,$operationId,$scopes,$restore): array {
            $row = $this->store->get($actor,$operationId);
            $lock = SiteMutationLock::acquire($this->lockPath,$this->db,$row['id']);
            $claimed = $this->store->claimRecovery($actor,$operationId,$scopes);
            try { $restoration = $restore($claimed); }
            catch (\Throwable) { $restoration = ['restored'=>false,'remaining_paths'=>['recovery_manifest']]; }
            $ok = ($restoration['restored'] ?? false) === true;
            // A later recovery reports its current result without erasing the
            // first failed restoration. Never recursively retain result blobs.
            $prior = $claimed['result'];
            $original = $prior['original_outcome'] ?? (isset($prior['error'], $prior['restoration'])
                ? ['error'=>$prior['error'],'restoration'=>$prior['restoration']] : null);
            $history = $original === null ? [] : ['original_outcome'=>$original];
            $this->store->finish($actor,$operationId,$claimed['lease_token'],$ok?'failed_restored':'recovery_required',
                ['provider_calls'=>0,'restoration'=>$restoration,'error'=>['code'=>$ok?'operation_restored':'recovery_required',
                    'message'=>$ok?'Original affected files and projections were restored and verified.':'Some affected paths still need recovery.']] + $history);
            return self::publicState($this->store->get($actor,$operationId));
        });
    }

    public static function publicState(array $row): array
    {
        return ['operation_id'=>$row['operation_id'],'kind'=>$row['kind'],'status'=>$row['state'],'phase'=>$row['phase'],
            'checkpoint'=>$row['checkpoint_number'],'before_version'=>$row['before_version'],'after_version'=>$row['after_version'],
            'result'=>$row['result'],'provider_calls'=>0,'result_retention_seconds'=>OperationStore::RETENTION_SECONDS,
            'result_pruned'=>$row['result_pruned_at'] !== null,
            'next_action'=>$row['state']==='applying' ? 'operations_continue' : ($row['state']==='recovery_required'?'explicit_recovery':null)];
    }

    private function advance(OperationActor $actor,array $row,callable $step,callable $restore): array
    {
        try {
            $progress = $step($row);
            if (($progress['committed'] ?? false) === true) return self::publicState($this->store->get($actor,$row['operation_id']));
            if (($progress['complete'] ?? false) === true) {
                $this->store->finish($actor,$row['operation_id'],$row['lease_token'],'succeeded',$progress['result'],$progress['after_version'] ?? null);
            } else {
                $this->store->checkpoint($actor,$row['operation_id'],$row['lease_token'],$progress['phase'],$progress['checkpoint'],$progress['recovery']);
            }
        } catch (\Throwable $error) {
            // A callback may have committed before a later response/cleanup
            // failed. Re-read the journal before even considering a rollback.
            $current = $this->store->workerState($actor,$row['operation_id'],$row['lease_token']);
            if (in_array($current['state'],OperationStore::TERMINAL,true)) return self::publicState($current);
            try { $restoration = $restore($current); }
            catch (\Throwable) { $restoration = ['restored'=>false,'remaining_paths'=>['recovery_manifest']]; }
            $restored = ($restoration['restored'] ?? false) === true;
            $this->store->finish($actor,$row['operation_id'],$row['lease_token'],$restored?'failed_restored':'recovery_required',
                ['provider_calls'=>0,'restoration'=>$restoration,'error'=>[
                    'code'=>$error instanceof OperationException ? $error->errorCode : 'operation_failed',
                    'message'=>$error instanceof OperationException ? $error->getMessage() : 'The operation could not finish. Inspect its retained recovery result.',
                ]]);
        }
        return self::publicState($this->store->get($actor,$row['operation_id']));
    }
}
