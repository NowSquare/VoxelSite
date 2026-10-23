<?php
declare(strict_types=1);
namespace VoxelSite;

use VoxelSite\Agent\{ActorPolicy, OperationActor, OperationException, OperationRunner, OperationStore, ReleaseStore, RestorePlanService};

/** Studio adapters share the same retained operation artifacts as management MCP. */
final class WebsiteHistoryService
{
    public readonly SnapshotService $snapshots;
    public readonly RestorePlanService $restores;
    public readonly OperationStore $operations;
    public readonly ActorPolicy $policy;
    public readonly \VoxelSite\Agent\DesignService $designs;
    public readonly \VoxelSite\Agent\RevisionService $revisions;

    public function __construct(private Database $db, private SiteWorkspace $workspace, ?string $privateRoot = null)
    {
        $data = dirname($workspace->draftRoot()) . '/data';
        $privateRoot ??= $data . '/agent';
        $this->policy = new ActorPolicy($db);
        $this->operations = new OperationStore($db, $this->policy, $workspace->mutationLockPath());
        $releases = new ReleaseStore($db, $this->policy, $privateRoot . '/releases');
        $this->snapshots = new SnapshotService($db, $this->policy, $workspace, $releases, $this->operations,
            $privateRoot . '/snapshots', getenv('VS_TEST_SNAPSHOT_DIR') ?: $data . '/snapshots', $data . '/actions');
        $this->restores = new RestorePlanService($db, $this->policy, $workspace, $this->snapshots, $releases,
            $this->operations, $privateRoot . '/restores');
        $this->designs = new \VoxelSite\Agent\DesignService($db, $this->policy, $workspace, new DesignManager($db, $workspace),
            $this->restores, $this->operations, $data . '/actions', $privateRoot . '/design-previews');
        $this->revisions = new \VoxelSite\Agent\RevisionService($db, $this->policy, $workspace, $this->restores,
            stagingRoot: $privateRoot . '/revision-previews');
    }

    public function rollback(OperationActor $actor, array $request): array
    {
        $this->policy->require($actor, ['restore:live']);
        $id = $request['operation_id'] ?? null;
        if (!is_string($id) || !preg_match('/^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$/D', $id)) {
            throw new OperationException('invalid_schema', 'Live rollback requires a stable operation_id. Prepare and review a published-domain restoration.');
        }
        if (($prior = $this->resume($actor, $id, $request, 'restore.apply')) !== null) return $prior;
        $releaseId = $this->workspace->status()['release_id'];
        $release = $releaseId === null ? null : $this->db->queryOne('SELECT * FROM site_releases WHERE id = ?', [$releaseId]);
        if (!$release) throw new OperationException('content_conflict', 'No retained managed publication is available for live rollback. Legacy draft archives cannot prove a previous live state.');
        $snapshotId = str_starts_with($release['plan_id'], 'restore_')
            ? 'safety_' . substr($release['plan_id'], 8) : $release['plan_id'];
        $plan = $this->restores->prepare($actor, (object) ['request_id' => $id,
            'snapshot_id' => $snapshotId, 'domain' => 'published']);
        return $this->restores->apply($actor, (object) ['plan_id' => $plan['plan_id'],
            'digest' => $plan['digest'], 'operation_id' => $id]);
    }

    public function capture(OperationActor $actor, array $request): array
    {
        $id = $this->operationId($request);
        $input = (object) ['operation_id' => $id, 'domain' => $request['domain'] ?? null, 'label' => $request['label'] ?? ''];
        \VoxelSite\Agent\JsonSchema::validate($input, SnapshotService::inputSchema('create'));
        if (array_key_exists('checkpoint', $request)) {
            $op = $this->operations->get($actor, $id);
            if ($op['kind'] !== 'snapshots.create' || \VoxelSite\Agent\CanonicalJson::digest($op['request']) !== \VoxelSite\Agent\CanonicalJson::digest($input)) {
                throw new OperationException('idempotency_conflict', 'This operation belongs to a different snapshot request.');
            }
            if (!is_int($request['checkpoint']) || $request['checkpoint'] < 0) throw new OperationException('invalid_schema', 'Use the returned snapshot checkpoint.');
            return $this->snapshots->continue($actor, $id, $request['checkpoint']);
        }
        return $this->snapshots->create($actor, $input);
    }

    public function restoreSnapshot(OperationActor $actor, string $snapshotId, array $request): array
    {
        $id = $this->operationId($request);
        $input = (object) ['operation_id' => $id, 'plan_id' => $request['plan_id'] ?? null, 'digest' => $request['digest'] ?? null];
        \VoxelSite\Agent\JsonSchema::validate($input, RestorePlanService::inputSchema('apply'));
        $plan = $this->db->queryOne('SELECT actor_key,snapshot_id,payload_json FROM agent_restore_plans WHERE id = ?', [$input->plan_id]);
        if (!$plan || $plan['actor_key'] !== $actor->identity()) throw new OperationException('permission_denied', 'The selected restoration review is unavailable.');
        $payload = json_decode($plan['payload_json'], true, 64, JSON_THROW_ON_ERROR);
        if ($plan['snapshot_id'] !== $snapshotId || isset($payload['transition'])) throw new OperationException('idempotency_conflict', 'Choose the review for this snapshot.');
        if (array_key_exists('checkpoint', $request)) {
            $op = $this->operations->get($actor, $id);
            if ($op['kind'] !== 'restore.apply' || \VoxelSite\Agent\CanonicalJson::digest($op['request'])
                !== \VoxelSite\Agent\CanonicalJson::digest(['plan_id' => $input->plan_id, 'digest' => $input->digest])) {
                throw new OperationException('idempotency_conflict', 'This operation belongs to a different restoration.');
            }
            if (!is_int($request['checkpoint']) || $request['checkpoint'] < 0) throw new OperationException('invalid_schema', 'Use the returned restoration checkpoint.');
            return $this->restores->continue($actor, $id, $request['checkpoint']);
        }
        return $this->restores->apply($actor, $input);
    }

    public function deleteSnapshot(OperationActor $actor, string $snapshotId, array $request): array
    {
        $id = $this->operationId($request);
        $input = (object) ['operation_id' => $id, 'snapshot_id' => $snapshotId, 'version' => $request['version'] ?? null];
        \VoxelSite\Agent\JsonSchema::validate($input, \VoxelSite\Agent\SnapshotDeletionService::inputSchema('delete'));
        if (array_key_exists('checkpoint', $request)) {
            $prior = $this->operations->get($actor, $id);
            if ($prior['kind'] !== 'snapshots.delete' || \VoxelSite\Agent\CanonicalJson::digest($prior['request']) !== \VoxelSite\Agent\CanonicalJson::digest($input)) {
                throw new OperationException('idempotency_conflict', 'This operation belongs to a different archive deletion.');
            }
            if (!is_int($request['checkpoint']) || $request['checkpoint'] < 0) throw new OperationException('invalid_schema', 'Use the returned deletion checkpoint.');
            return $this->snapshots->deletions()->continue($actor, $id, $request['checkpoint']);
        }
        return $this->snapshots->deletions()->delete($actor, $input);
    }

    public function unpublish(OperationActor $actor, array $request): array
    {
        $this->policy->require($actor, ['unpublish:write']);
        $id = $request['operation_id'] ?? null;
        if (!is_string($id) || !preg_match('/^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$/D', $id)) {
            throw new OperationException('invalid_schema', 'Unpublish requires a stable operation_id.');
        }
        if (($prior = $this->resume($actor, $id, $request, 'site.unpublish')) !== null) return $prior;
        $releaseId = $this->workspace->status()['release_id'];
        if ($releaseId === null) throw new OperationException('content_conflict', 'No retained managed release exists to unpublish.');
        $service = new \VoxelSite\Agent\UnpublishService($this->policy, $this->workspace, $this->restores);
        $plan = $service->prepare($actor, (object) ['request_id' => $id, 'release_id' => $releaseId]);
        return $service->apply($actor, (object) ['plan_id' => $plan['plan_id'], 'digest' => $plan['digest'], 'operation_id' => $id]);
    }

    public function revision(OperationActor $actor, string $action, array $request): array
    {
        if (!in_array($action, ['undo', 'redo'], true)) throw new OperationException('invalid_schema', 'Choose undo or redo.');
        $id = $this->operationId($request);
        if (($prior = $this->resume($actor, $id, $request, 'revisions.' . $action)) !== null) return $prior;
        $state = $this->revisions->state($actor);
        $plan = $this->revisions->prepare($actor, (object) ['request_id' => $id, 'action' => $action,
            'head_version' => $request['head_version'] ?? $state['head_version'],
            'base_draft_version' => $request['base_draft_version'] ?? $state['draft_version']]);
        return $this->revisions->apply($actor, (object) ['operation_id' => $id, 'plan_id' => $plan['plan_id'], 'digest' => $plan['digest']]);
    }

    public function design(OperationActor $actor, string $method, array $request, ?string $designId = null): array
    {
        $id = $this->operationId($request);
        if (in_array($method, ['load', 'new'], true)) {
            $this->policy->require($actor, ['designs:write', 'designs:read']);
            if ($designId !== null) {
                try { $op = $this->operations->get($actor, $id); }
                catch (OperationException $error) { if ($error->errorCode !== 'permission_denied') throw $error; $op = null; }
                if ($op !== null) {
                    $plan = $this->db->queryOne('SELECT manifest_json FROM agent_restore_plans WHERE id = ?', [$op['preparation_id']]);
                    $manifest = $plan ? json_decode($plan['manifest_json'], true, 64, JSON_THROW_ON_ERROR) : [];
                    if (($manifest['transition']['design_id'] ?? null) !== $designId) throw new OperationException('idempotency_conflict', 'This operation belongs to a different saved design.');
                }
            }
            if (($prior = $this->resume($actor, $id, $request, 'designs.' . $method)) !== null) return $prior;
            $input = (object) ['request_id' => $id, 'base_draft_version' => $request['base_draft_version'] ?? 'draft:' . $this->workspace->status()['draft_version']];
            if ($method === 'load') $input->design_id = $designId;
            $plan = $method === 'load' ? $this->designs->prepareLoad($actor, $input) : $this->designs->prepareNew($actor, $input);
            return $this->designs->apply($actor, (object) ['operation_id' => $id, 'plan_id' => $plan['plan_id'], 'digest' => $plan['digest']]);
        }
        if (!in_array($method, ['save', 'rename', 'delete'], true)) throw new OperationException('invalid_schema', 'Unknown design operation.');
        try { $prior = $this->operations->get($actor, $id); }
        catch (OperationException $error) { if ($error->errorCode !== 'permission_denied') throw $error; $prior = null; }
        if ($prior && $prior['kind'] !== 'designs.' . $method) throw new OperationException('idempotency_conflict', 'This operation belongs to another action.');
        $input = ['operation_id' => $id];
        if ($method !== 'delete') $input += ['name' => $request['name'] ?? '', 'description' => $request['description'] ?? ''];
        if ($method !== 'save') {
            $meta = (new DesignManager($this->db, $this->workspace))->readMetadata((string) $designId);
            $input += ['design_id' => $designId, 'version' => $request['version'] ?? $prior['request']['version'] ?? \VoxelSite\Agent\CanonicalJson::digest($meta)];
        }
        if (array_key_exists('checkpoint', $request)) {
            if (!$prior || !is_int($request['checkpoint']) || $request['checkpoint'] < 0) throw new OperationException('invalid_schema', 'Use the returned design checkpoint.');
            if (\VoxelSite\Agent\CanonicalJson::digest($input) !== \VoxelSite\Agent\CanonicalJson::digest($prior['request'])) throw new OperationException('idempotency_conflict', 'Design continuation input changed.');
            return $this->designs->continue($actor, $id, $request['checkpoint']);
        }
        return $this->designs->{$method}($actor, (object) $input);
    }

    private function operationId(array $request): string
    {
        $id = $request['operation_id'] ?? null;
        if (!is_string($id) || !preg_match('/^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$/D', $id)) throw new OperationException('invalid_schema', 'Use a stable operation_id for this website change.');
        return $id;
    }

    private function resume(OperationActor $actor, string $id, array $request, string $kind): ?array
    {
        try { $prior = $this->operations->get($actor, $id); }
        catch (OperationException $error) {
            if ($error->errorCode !== 'permission_denied') throw $error;
            $prior = null;
        }
        if ($prior !== null) {
            if ($prior['kind'] !== $kind) throw new OperationException('idempotency_conflict', 'This operation ID belongs to another action.');
            if (array_key_exists('checkpoint', $request)) {
                if (!is_int($request['checkpoint']) || $request['checkpoint'] < 0) throw new OperationException('invalid_schema', 'Use the returned checkpoint.');
                return $this->restores->continue($actor, $id, $request['checkpoint']);
            }
            if ($prior['state'] !== 'prepared') return OperationRunner::publicState($prior);
            return $this->restores->apply($actor, (object) ($prior['request'] + ['operation_id' => $id]));
        }
        if (array_key_exists('checkpoint', $request)) throw new OperationException('content_conflict', 'No matching retained operation exists to continue.');
        return null;
    }
}
