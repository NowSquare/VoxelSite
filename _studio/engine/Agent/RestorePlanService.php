<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

use VoxelSite\{Database, FileManager, RevisionManager, Settings, SiteMutationLock, SiteWorkspace, SnapshotService};

/** Reviewed domain restoration. Every mutation installs previously sealed bytes. */
final class RestorePlanService
{
    public const TTL = 1800;
    private OperationRunner $runner;
    private FileManager $files;
    public function __construct(private Database $db, private ActorPolicy $policy, private SiteWorkspace $workspace,
        private SnapshotService $snapshots, private ReleaseStore $releases, private OperationStore $operations,
        private string $root, private int $filesPerStep = 20, private ?\Closure $testHook = null)
    {
        $this->root = \VoxelSite\FilesystemPath::normalize($root);
        if (!\VoxelSite\FilesystemPath::isAbsolute($this->root) || is_link($this->root) || $this->root !== \VoxelSite\FilesystemPath::normalize($snapshots->restoreRoot()) || $filesPerStep < 1 || $filesPerStep > 100) {
            throw new \InvalidArgumentException('Trusted restoration storage and a bounded step budget are required.');
        }
        // Only the explicit legacy draft restore below may resolve an old
        // recovery gate. Other transitions still check SiteRecovery in apply().
        $this->runner = new OperationRunner($db, $policy, $operations, $workspace->mutationLockPath(), false);
        $this->files = new FileManager($db, $workspace);
    }

    public static function inputSchema(string $method): array
    {
        $id = ['type' => 'string', 'pattern' => '^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$'];
        $plan = ['type' => 'string', 'pattern' => '^restore_[a-f0-9]{32}$'];
        $fields = match ($method) {
            'prepare' => ['request_id' => $id, 'snapshot_id' => ['type' => 'string', 'maxLength' => 80],
                'domain' => ['enum' => ['draft', 'published', 'both']]],
            'apply' => ['plan_id' => $plan, 'digest' => ['type' => 'string', 'pattern' => '^[a-f0-9]{64}$'], 'operation_id' => $id],
            'get' => ['plan_id' => $plan],
            default => throw new \InvalidArgumentException('Unknown restoration method.'),
        };
        return self::object($fields);
    }

    public static function outputSchema(): array
    {
        $s = ['type' => 'string']; $hash = ['type' => ['string', 'null']];
        return self::withTransition(self::object(['plan_id' => $s, 'digest' => $s, 'status' => ['const' => 'ready'],
            'snapshot_id' => $s, 'domain' => ['enum' => ['draft', 'published', 'both']],
            'expires_at' => ['type' => 'integer'], 'safety_snapshot_id' => $s,
            'base_draft_version' => $s, 'before_release_id' => $hash,
            'files' => ['type' => 'array', 'maxItems' => SnapshotService::MAX_FILES * 2,
                'items' => self::object(['domain' => ['enum' => ['draft', 'published']], 'path' => $s,
                    'action' => ['enum' => ['write', 'delete']], 'before_hash' => $hash, 'after_hash' => $hash,
                    'bytes' => ['type' => 'integer', 'minimum' => 0]])],
            'excluded_domains' => ['type' => 'array', 'items' => $s], 'provider_calls' => ['const' => 0]]));
    }

    public static function resultSchema(): array
    {
        $s = ['type' => 'string'];
        return self::withTransition(self::object(['snapshot_id' => $s, 'plan_id' => $s, 'domain' => ['enum' => ['draft', 'published', 'both']],
            'digest' => $s, 'changed_paths' => ['type' => 'array', 'items' => $s],
            'revision_id' => ['type' => ['integer', 'null']], 'release_id' => ['type' => ['string', 'null']],
            'safety_snapshot_id' => $s, 'excluded_domains' => ['type' => 'array', 'items' => $s],
            'actor' => SnapshotService::metadataSchema()['properties']['actor'], 'provider_calls' => ['const' => 0],
            'retention_warning' => ['type' => ['string', 'null']],
            'restoration' => self::object(['required' => ['const' => false], 'restored' => ['type' => 'null']])]));
    }

    public function prepare(OperationActor $actor, \stdClass $input): array
    {
        return $this->prepareInternal($actor, $input, null, null);
    }

    /** Trusted PHP callers supply an archive planner; no tool accepts callbacks or scopes. */
    public function prepareTransition(OperationActor $actor, \stdClass $input, string $kind, \Closure $planner): array
    {
        $this->transitionScopes($kind); // Closed server-side authority map.
        return $this->prepareInternal($actor, $input, $kind, $planner);
    }

    private function prepareInternal(OperationActor $actor, \stdClass $input, ?string $kind, ?\Closure $planner): array
    {
        return ProviderCallPolicy::runExternal(function () use ($actor, $input, $kind, $planner): array {
            JsonSchema::validate($input, self::inputSchema('prepare'));
            $this->policy->require($actor, $kind === null ? $this->scopes($input->domain) : $this->transitionScopes($kind));
            if ($kind !== null && $input->domain !== ($kind === 'site.unpublish' ? 'published' : 'draft')) {
                throw new \LogicException('The trusted transition selected an incompatible website domain.');
            }
            $lock = SiteMutationLock::acquire($this->workspace->mutationLockPath(), $this->db);
            $this->workspace->assertReady();
            $row = $this->reserve($actor, $input, $kind);
            if ($row['status'] !== 'preparing') return $this->decode($actor, $row)['payload'];
            $current = $this->snapshots->current($input->domain);
            $planned = $planner === null ? null : $planner($current);
            $archive = $planned === null ? $this->snapshots->read($actor, $input->snapshot_id) : $planned['archive'];
            $this->snapshots->assertActionCompatibility($archive);
            $selected = SnapshotService::domains($input->domain);
            foreach ($selected as $domain) {
                if (!isset($archive['domains'][$domain])) throw new OperationException('invalid_schema', 'The selected archive does not contain the requested domain.', ['domain' => $domain]);
            }
            if (in_array('published', $selected, true)) $this->assertPublicAfter($archive['domains']['published']['files']);
            $state = $this->workspace->status();
            $root = $this->directory($row['id'], true);
            // Only this unsealed, actor-bound preparation owns these bytes.
            // Remove an interrupted attempt before recapturing changed sources.
            $this->clearIncomplete($root);
            if ($kind===null && str_starts_with($input->snapshot_id,'legacy_')) {
                $archive=$this->prepareLegacyDraft($archive,$current,$root);
            } elseif (isset($archive['domains']['draft']['metadata']['legacy_permissions'])) {
                // A retained safety archive can carry legacy permissions too.
                // Its current before-state needs the same rollback protection.
                $this->captureDraftPermissions($current);
            }
            $manifest = ['format' => 3, 'snapshot_id' => $input->snapshot_id, 'domain' => $input->domain,
                'draft_version' => $state['draft_version'], 'before_release_id' => $state['release_id'],
                'action_digest' => $this->snapshots->actionDigest(), 'domains' => [], 'files' => []];
            if ($kind !== null) {
                $manifest['transition'] = ['kind' => $kind] + ($planned['transition'] ?? []);
                $this->validateTransition($manifest['transition']);
            }
            $bytes = 0;
            foreach ($selected as $domain) {
                $beforeFiles = $current['domains'][$domain]['files'];
                $afterFiles = array_filter($archive['domains'][$domain]['files'], fn($content) => $content !== null);
                if ($domain === 'draft') SnapshotService::validateDraftMetadata($archive['domains'][$domain]['metadata'], $afterFiles);
                $paths = array_values(array_unique(array_merge(array_keys($beforeFiles), array_keys($afterFiles))));
                sort($paths, SORT_STRING);
                $before = []; $after = WorkspaceFiles::hashes($afterFiles);
                foreach ($paths as $path) {
                    $target = $domain === 'draft' ? $this->workspace->resolveDraft($path, true) : $this->workspace->resolvePublished($path, true);
                    // A target absent from current managed provenance may exist
                    // as unrelated hosting content. Never take its ownership.
                    if ($domain === 'published' && !array_key_exists($path, $beforeFiles) && file_exists($target)) {
                        throw new OperationException('ownership_conflict', 'A restoration target contains unrelated live bytes.', ['path' => $path]);
                    }
                    $old = $beforeFiles[$path] ?? null; $new = $afterFiles[$path] ?? null;
                    $before[$path] = $old === null ? null : hash('sha256', $old);
                    $afterHash = $after[$path] ?? null;
                    if ($old !== null) { WorkspaceFiles::write($root . '/before/' . $domain, $path, $old); $bytes += strlen($old); }
                    if ($new !== null) { WorkspaceFiles::write($root . '/candidate/' . $domain, $path, $new); $bytes += strlen($new); }
                    $modeChanged = $domain === 'draft' && isset($current['domains'][$domain]['metadata']['legacy_permissions'])
                        && CanonicalJson::digest($current['domains'][$domain]['metadata']['legacy_permissions']['files'][$path] ?? null)
                            !== CanonicalJson::digest($archive['domains'][$domain]['metadata']['legacy_permissions']['files'][$path] ?? null);
                    if ($before[$path] !== $afterHash || $modeChanged) $manifest['files'][] = ['domain' => $domain, 'path' => $path,
                        'action' => $new === null ? 'delete' : 'write', 'before_hash' => $before[$path],
                        'after_hash' => $afterHash, 'bytes' => strlen($new ?? '')];
                }
                ksort($before, SORT_STRING);
                $manifest['domains'][$domain] = ['before' => $before, 'after' => $after,
                    'before_metadata' => $current['domains'][$domain]['metadata'], 'metadata' => $archive['domains'][$domain]['metadata']];
            }
            if ($bytes > SnapshotService::MAX_BYTES * 2 || count($manifest['files']) > SnapshotService::MAX_FILES * 2) {
                throw new OperationException('size_limit', 'The restoration and its safety archive exceed the preparation budget.');
            }
            $digest = CanonicalJson::digest($manifest);
            $payload = ['plan_id' => $row['id'], 'digest' => $digest, 'status' => 'ready',
                'snapshot_id' => $input->snapshot_id, 'domain' => $input->domain, 'expires_at' => (int) $row['expires_at'],
                'safety_snapshot_id' => 'safety_' . substr($row['id'], 8),
                'base_draft_version' => 'draft:' . $state['draft_version'], 'before_release_id' => $state['release_id'],
                'files' => $manifest['files'], 'excluded_domains' => SnapshotService::EXCLUDED, 'provider_calls' => 0];
            if ($kind !== null) $payload['transition'] = $kind;
            $this->db->update('agent_restore_plans', ['status' => 'ready', 'manifest_json' => CanonicalJson::encode($manifest),
                'digest' => $digest, 'payload_json' => CanonicalJson::encode($payload), 'staged_bytes' => $bytes + 1048576],
                "id = ? AND status = 'preparing'", [$row['id']]);
            return $payload;
        });
    }

    public function get(OperationActor $actor, string $id): array { return $this->plan($actor, $id)['payload']; }

    public function apply(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('apply'));
        $plan = $this->plan($actor, $input->plan_id, true);
        if (isset($plan['manifest']['transition']) || $plan['domain']!=='draft' || !str_starts_with($plan['snapshot_id'],'legacy_')) {
            \VoxelSite\SiteRecovery::assertWritable($this->db);
        }
        return $this->runner->start($actor, $input->operation_id, $plan['manifest']['transition']['kind'] ?? 'restore.apply',
            (object) ['plan_id' => $input->plan_id, 'digest' => $input->digest],
            'draft:' . $this->workspace->status()['draft_version'], $input->plan_id, $this->planScopes($plan),
            fn($op) => $this->step($actor, $op), fn($op) => $this->recoverBytes($op));
    }

    public function applyTransition(OperationActor $actor, \stdClass $input, array $kinds): array
    {
        JsonSchema::validate($input, self::inputSchema('apply'));
        $plan = $this->plan($actor, $input->plan_id, true);
        if (!in_array($plan['manifest']['transition']['kind'] ?? null, $kinds, true)) {
            throw new OperationException('invalid_schema', 'The selected review belongs to a different history transition.');
        }
        return $this->apply($actor, $input);
    }

    public function continue(OperationActor $actor, string $id, int $checkpoint): array
    {
        $op = $this->operations->get($actor, $id);
        if (!$this->supportedKind($op['kind'])) throw new OperationException('invalid_schema', 'Use this operation’s own continuation.');
        $plan = $this->plan($actor, $op['preparation_id'], true);
        return $this->runner->continue($actor, $id, $checkpoint, $this->planScopes($plan),
            fn($op) => $this->step($actor, $op), fn($op) => $this->recoverBytes($op), fn($op) => $this->consistent($op));
    }

    public function recover(OperationActor $actor, string $id): array
    {
        $op = $this->operations->get($actor, $id);
        if (!$this->supportedKind($op['kind'])) throw new OperationException('invalid_schema', 'Use this operation’s own recovery.');
        $plan = $this->plan($actor, $op['preparation_id'], true);
        return $this->runner->recover($actor, $id, $this->planScopes($plan), fn($op) => $this->recoverBytes($op));
    }

    private function step(OperationActor $actor, array $operation): array
    {
        $this->workspace->assertReady();
        $plan = $this->plan($actor, $operation['preparation_id'], !empty($operation['recovery']));
        if ($plan['status'] !== 'ready' || !hash_equals($plan['digest'], $operation['request']['digest'])) {
            throw new OperationException('content_conflict', 'The restoration digest does not identify an unused review.');
        }
        $manifest = $plan['manifest'];
        $this->policy->require($actor, $this->planScopes($plan));
        // Retained reviews and interrupted operations can predate this policy.
        // Reject forward work while leaving their exact before-state rollback intact.
        if (isset($manifest['domains']['published'])) $this->assertPublicAfter($manifest['domains']['published']['after']);
        if (!$this->metadataMatches($manifest)) throw new OperationException('content_conflict', 'Selected-domain metadata changed after restoration review.');
        if (!hash_equals($manifest['action_digest'], $this->snapshots->actionDigest())) throw new OperationException('content_conflict', 'Live Action definitions changed after restoration review.');
        $this->verifyRetained($plan);
        $recovery = $operation['recovery'];
        if (!$recovery) {
            if (!$this->sourceMatches($manifest)) throw new OperationException('content_conflict', 'The selected website domain changed after restoration review.');
            foreach ($manifest['domains'] as $name=>$data) if ($name==='draft' && isset($data['before_metadata']['legacy_permissions'])) {
                $this->assertLegacyPermissions($data['before_metadata']['legacy_permissions']);
            }
            $recovery = ['plan_id' => $plan['id'], 'domains' => $manifest['domains'], 'files' => $manifest['files'],
                'transition' => $manifest['transition'] ?? null];
            $this->operations->recordRecovery($actor, $operation['operation_id'], $operation['lease_token'], $recovery);
            $this->hook('after_capture', $operation);
        } elseif (!$this->consistent($operation)) throw new OperationException('content_conflict', 'Interrupted restoration has bytes outside its retained before and after states.');
        $index = (int) ($operation['checkpoint']['next_file'] ?? 0);
        $end = min(count($manifest['files']), $index + $this->filesPerStep);
        for (; $index < $end; $index++) {
            $entry = $manifest['files'][$index];
            $this->policy->require($actor, $this->planScopes($plan));
            $current = $this->hash($entry['domain'], $entry['path']);
            if ($current === $entry['after_hash']) continue;
            if ($current !== $entry['before_hash']) throw new OperationException('content_conflict', 'An affected file changed during restoration.');
            $content = $entry['after_hash'] === null ? null : $this->retainedBytes($plan['id'], 'candidate', $entry['domain'], $entry['path'], $entry['after_hash']);
            $this->write($entry['domain'], $entry['path'], $content);
            if ($this->hash($entry['domain'], $entry['path']) !== $entry['after_hash']) throw new OperationException('host_capability_unavailable', 'Restored bytes failed verification.');
            $this->hook('after_file', $operation + ['path' => $entry['path'], 'domain' => $entry['domain']]);
        }
        if ($index < count($manifest['files'])) return ['complete' => false, 'phase' => 'restore_files',
            'checkpoint' => ['next_file' => $index, 'total_files' => count($manifest['files'])], 'recovery' => $recovery];
        foreach ($manifest['domains'] as $name => $data) {
            if (!$this->matches($name, $data['after'], array_keys($data['before']))) throw new OperationException('content_conflict', 'The restored domain does not match its reviewed manifest.');
            if ($name==='draft' && isset($data['before_metadata']['legacy_permissions'])) {
                $this->assertLegacyPermissions($data['before_metadata']['legacy_permissions'],$data['metadata']['legacy_permissions'],true);
            }
            if ($name==='draft' && isset($data['metadata']['legacy_permissions'])) $this->applyLegacyPermissions($data['metadata']['legacy_permissions']);
        }
        $commit = function (?int $revisionId) use ($actor, $operation, $plan, $manifest): void {
            $transition = $manifest['transition'] ?? null;
            $isRevision = str_starts_with($transition['kind'] ?? '', 'revisions.');
            if ($isRevision) $revisionId = $transition['revision_id'];
            $afterVersion = isset($manifest['domains']['draft']) ? 'draft:' . ($manifest['draft_version'] + 1) : 'release_' . substr($plan['id'], 8);
            $result = ['snapshot_id' => $manifest['snapshot_id'], 'plan_id' => $plan['id'], 'domain' => $manifest['domain'],
                'digest' => $plan['digest'], 'changed_paths' => array_map(fn($file) => $file['domain'] . ':' . $file['path'], $manifest['files']),
                'revision_id' => $revisionId, 'release_id' => isset($manifest['domains']['published']) ? 'release_' . substr($plan['id'], 8) : null,
                'safety_snapshot_id' => $plan['payload']['safety_snapshot_id'], 'excluded_domains' => SnapshotService::EXCLUDED,
                'actor' => $actor->attribution(), 'provider_calls' => 0, 'retention_warning' => null,
                'restoration' => ['required' => false, 'restored' => null]];
            if ($transition !== null) $result['transition'] = $transition['kind'];
            $this->operations->finish($actor, $operation['operation_id'], $operation['lease_token'], 'succeeded', $result, $afterVersion,
                function () use ($actor, $operation, $plan, $manifest, $revisionId, $result, $transition, $isRevision): void {
                    if (isset($manifest['domains']['draft'])) {
                        if ($isRevision && $transition['projection'] !== null) {
                            require_once dirname(__DIR__) . '/SiteControlSnapshots.php';
                            \scRestoreProjection($this->db, $transition['projection']);
                        } else $this->draftProjection($manifest['domains']['draft']['metadata']);
                        if (!$isRevision) {
                            $this->db->insert('agent_revision_projections', ['revision_id' => $revisionId,
                                'before_json' => CanonicalJson::encode($manifest['domains']['draft']['before_metadata']['pages']),
                                'after_json' => CanonicalJson::encode($this->db->query('SELECT * FROM pages ORDER BY id')),
                                'before_collections_json' => CanonicalJson::encode($manifest['domains']['draft']['before_metadata']['collection_indexes']),
                                'after_collections_json' => CanonicalJson::encode($this->db->query('SELECT id, index_page_id FROM collections ORDER BY id'))]);
                            $this->db->insert('agent_revision_attribution', ['revision_id' => $revisionId, 'operation_id' => $operation['id'],
                                'actor_json' => CanonicalJson::encode($actor->attribution()), 'created_at' => time()]);
                        } else {
                            $this->db->update('revisions', ['is_undone' => $transition['kind'] === 'revisions.undo' ? 1 : 0], 'id = ?', [$transition['revision_id']]);
                            $settings = new Settings($this->db);
                            $settings->set('revision_pointer', $transition['next_pointer']);
                            if (array_key_exists('active_design_id', $transition['projection'] ?? [])) {
                                if ($transition['projection']['active_design_id'] === null) $settings->delete('active_design_id');
                                else $settings->set('active_design_id', $transition['projection']['active_design_id']);
                            }
                        }
                        if ($this->db->update('site_workspace_state', ['draft_version' => $manifest['draft_version'] + 1, 'updated_at' => time()],
                            'id = 1 AND draft_version = ?', [$manifest['draft_version']]) !== 1) throw new OperationException('content_conflict', 'Draft version changed during restoration commit.');
                        if (str_starts_with($transition['kind'] ?? '', 'designs.')) {
                            $settings = new Settings($this->db);
                            $this->db->insert('agent_revision_design_state', ['revision_id' => $revisionId,
                                'before_design_id' => $transition['expected_active_design'], 'after_design_id' => $transition['design_id']]);
                            if ($transition['design_id'] === null) $settings->delete('active_design_id');
                            else $settings->set('active_design_id', $transition['design_id']);
                        }
                    }
                    if (isset($manifest['domains']['published'])) {
                        $published = $manifest['domains']['published']['after'];
                        $this->db->insert('site_releases', ['id' => $result['release_id'], 'plan_id' => $plan['id'], 'operation_id' => $operation['id'],
                            'actor_json' => CanonicalJson::encode($actor->attribution()), 'before_release_id' => $manifest['before_release_id'],
                            'draft_version' => $manifest['draft_version'], 'manifest_json' => CanonicalJson::encode($published),
                            'digest' => CanonicalJson::digest($published), 'created_at' => time()]);
                        if ($this->db->update('site_workspace_state', ['release_id' => $result['release_id'], 'updated_at' => time()],
                            'id = 1 AND release_id IS ?', [$manifest['before_release_id']]) !== 1) throw new OperationException('content_conflict', 'Published release changed during restoration commit.');
                        $settings = new Settings($this->db);
                        $settings->set('last_published_at', ($transition['kind'] ?? '') === 'site.unpublish' ? '' : gmdate('Y-m-d H:i:s'));
                        if (($transition['kind'] ?? '') !== 'site.unpublish') $settings->set('publish_count', (int) $settings->get('publish_count', 0) + 1);
                    }
                    if ($this->db->update('agent_restore_plans', ['status' => 'applied'], "id = ? AND status = 'ready'", [$plan['id']]) !== 1) throw new OperationException('content_conflict', 'The restore review has already been consumed.');
                    if (!isset($manifest['transition']) && $manifest['domain']==='draft'
                        && preg_match('/^legacy_([1-9][0-9]*)$/D',$manifest['snapshot_id'],$legacy)) {
                        \VoxelSite\SiteRecovery::resolveAfterSnapshot($this->db,(int)$legacy[1]);
                    }
                    $this->hook('after_projection', $operation);
                });
        };
        if (isset($manifest['domains']['draft']) && !str_starts_with($manifest['transition']['kind'] ?? '', 'revisions.')) {
            $before = []; $ops = [];
            foreach ($manifest['files'] as $entry) {
                if ($entry['domain'] !== 'draft') continue;
                $before[$entry['path']] = $entry['before_hash'] === null ? null : $this->retainedBytes($plan['id'], 'before', 'draft', $entry['path'], $entry['before_hash']);
                $ops[] = ['path' => $entry['path'], 'action' => $entry['action']];
            }
            (new RevisionManager($this->db, new Settings($this->db), $this->files))->recordAppliedRevision(
                $ops, 'Restore draft from ' . $manifest['snapshot_id'], $actor->userId, $before, $commit, true);
        } else $commit(null);
        $this->hook('after_commit', $operation);
        return ['committed' => true];
    }

    private function sourceMatches(array $manifest): bool
    {
        if (!$this->metadataMatches($manifest)) return false;
        foreach ($manifest['domains'] as $name => $data) {
            if (!$this->matches($name, $data['before'])) return false;
        }
        return true;
    }

    private function metadataMatches(array $manifest): bool
    {
        $state = $this->workspace->status();
        $transition = $manifest['transition'] ?? null;
        if ($transition !== null) {
            $settings = new Settings($this->db);
            if (array_key_exists('expected_active_design', $transition)
                && $settings->get('active_design_id') !== $transition['expected_active_design']) return false;
            if (str_starts_with($transition['kind'], 'revisions.')) {
                if ((int) $settings->get('revision_pointer', 0) !== $transition['expected_pointer']) return false;
                $revision = $this->db->queryOne('SELECT * FROM revisions WHERE id = ?', [$transition['revision_id']]);
                if (!$revision || CanonicalJson::digest($revision) !== $transition['revision_digest']
                    || $this->db->count('agent_archived_revisions', 'revision_id = ?', [$transition['revision_id']])) return false;
            }
        }
        if (isset($manifest['domains']['draft']) && $state['draft_version'] !== $manifest['draft_version']) return false;
        if (isset($manifest['domains']['published']) && $state['release_id'] !== $manifest['before_release_id']) return false;
        foreach ($manifest['domains'] as $name => $data) {
            if ($name === 'draft' && CanonicalJson::digest($this->db->query('SELECT * FROM pages ORDER BY id'))
                !== CanonicalJson::digest($data['before_metadata']['pages'])) return false;
            if ($name === 'draft' && CanonicalJson::digest($this->db->query('SELECT id, index_page_id FROM collections ORDER BY id'))
                !== CanonicalJson::digest($data['before_metadata']['collection_indexes'])) return false;
            if ($name === 'published' && CanonicalJson::digest($this->db->query("SELECT * FROM settings WHERE key IN ('last_published_at','publish_count') ORDER BY key"))
                !== CanonicalJson::digest($data['before_metadata']['publication_settings'])) return false;
        }
        return true;
    }

    private function consistent(array $operation): bool
    {
        if (!$operation['recovery']) return true;
        foreach ($operation['recovery']['domains'] as $name => $data) {
            if ($name === 'draft') {
                if (isset($data['before_metadata']['legacy_permissions'])) {
                    try { $this->assertLegacyPermissions($data['before_metadata']['legacy_permissions'],$data['metadata']['legacy_permissions'],true); }
                    catch (OperationException) { return false; }
                }
                $actual = WorkspaceFiles::hashes(WorkspaceFiles::read($this->workspace));
                if (array_diff(array_keys($actual), array_keys($data['before']), array_keys($data['after']))) return false;
            }
            foreach ($data['before'] as $path => $hash) {
                $current = $this->hash($name, $path);
                if ($current !== $hash && $current !== ($data['after'][$path] ?? null)) return false;
            }
        }
        return true;
    }

    /** Trusted rollback-only seam; cannot be used as normal actor continuation. */
    public function restoreForOwnerRecovery(array $operation): array
    {
        OwnerRecoveryService::assertClaim($this->db, $this->workspace, $operation);
        return $this->recoverBytes($operation);
    }

    private function recoverBytes(array $operation): array
    {
        $recovery = $operation['recovery'];
        if (!$recovery) return ['restored' => true, 'remaining_paths' => []];
        $remaining = [];
        foreach ($recovery['domains'] as $name=>$data) {
            if ($name!=='draft' || !isset($data['before_metadata']['legacy_permissions'])) continue;
            try {
                $this->assertLegacyPermissions($data['before_metadata']['legacy_permissions'],$data['metadata']['legacy_permissions'],true);
                $this->recoverLegacyDirectories($data['before_metadata']['legacy_permissions'],$data['metadata']['legacy_permissions']);
            } catch (\Throwable) { $remaining[]='draft:permissions'; }
        }
        foreach ($recovery['files'] as $entry) {
            if ($entry['domain']==='draft' && in_array('draft:permissions',$remaining,true)) continue;
            try {
                $current = $this->hash($entry['domain'], $entry['path']);
                if ($current !== $entry['before_hash'] && $current !== $entry['after_hash']) throw new \RuntimeException('Outside change requires explicit reconciliation.');
                $content = $entry['before_hash'] === null ? null : $this->retainedBytes($recovery['plan_id'], 'before', $entry['domain'], $entry['path'], $entry['before_hash']);
                $this->write($entry['domain'], $entry['path'], $content);
                if ($this->hash($entry['domain'], $entry['path']) !== $entry['before_hash']) throw new \RuntimeException('Recovery did not match.');
            } catch (\Throwable) { $remaining[] = $entry['domain'] . ':' . $entry['path']; }
        }
        foreach ($recovery['domains'] as $name => $data) {
            try {
                if ($name==='draft' && isset($data['before_metadata']['legacy_permissions']) && !in_array('draft:permissions',$remaining,true)) $this->applyLegacyPermissions($data['before_metadata']['legacy_permissions']);
                if (!$this->matches($name, $data['before'])) $remaining[] = $name . ':manifest';
                if ($name === 'draft' && CanonicalJson::digest($this->db->query('SELECT * FROM pages ORDER BY id'))
                    !== CanonicalJson::digest($data['before_metadata']['pages'])) $remaining[] = 'draft:page_projection';
                if ($name === 'draft' && CanonicalJson::digest($this->db->query('SELECT id, index_page_id FROM collections ORDER BY id'))
                    !== CanonicalJson::digest($data['before_metadata']['collection_indexes'])) $remaining[] = 'draft:collection_projection';
            } catch (\Throwable) { $remaining[] = $name . ':manifest'; }
        }
        // SQLite rolls back our unfinished commit. Outside metadata drift must
        // still be reported instead of claiming that the whole state recovered.
        try {
            $row = $this->db->queryOne('SELECT manifest_json FROM agent_restore_plans WHERE id = ?', [$recovery['plan_id']]);
            if (!$row || !$this->metadataMatches(json_decode($row['manifest_json'], true, 64, JSON_THROW_ON_ERROR))) {
                $remaining[] = 'metadata:reviewed_state';
            }
        } catch (\Throwable) { $remaining[] = 'metadata:reviewed_state'; }
        return ['restored' => $remaining === [], 'remaining_paths' => array_values(array_unique($remaining))];
    }

    private function draftProjection(array $metadata): void
    {
        if (($metadata['legacy_projection'] ?? false)===true) {
            require_once dirname(__DIR__).'/SiteControlSnapshots.php';
            \scRestoreProjection($this->db,$metadata);
            return;
        }
        $this->files->syncPageRegistry(true);
        $rows = $this->db->query('SELECT * FROM pages ORDER BY id');
        $byPath = []; foreach ($rows as $row) $byPath[$row['file_path']] = $row;
        $oldPaths = []; foreach ($metadata['pages'] ?? [] as $old) $oldPaths[$old['id']] = $old['file_path'];
        foreach ($metadata['pages'] ?? [] as $old) {
            $current = $byPath[$old['file_path']] ?? null;
            if (!$current) continue;
            $patch = [];
            foreach (['title', 'nav_order', 'nav_label'] as $column) if (array_key_exists($column, $old) && array_key_exists($column, $current)) $patch[$column] = $old[$column];
            if (array_key_exists('nav_parent_id', $current)) {
                $parentPath = $oldPaths[$old['nav_parent_id'] ?? 0] ?? null;
                $patch['nav_parent_id'] = $parentPath === null ? null : ($byPath[$parentPath]['id'] ?? null);
            }
            if ($patch) $this->db->update('pages', $patch, 'id = ?', [$current['id']]);
        }
    }

    /** Older ZIPs own generated source, but cannot claim later uploads by absence. */
    private function prepareLegacyDraft(array $archive,array &$current,string $root): array
    {
        $draft=&$archive['domains']['draft'];
        foreach ($current['domains']['draft']['files'] as $path=>$bytes) {
            if (!array_key_exists($path,$draft['files']) && str_starts_with($path,'assets/')
                && !preg_match('~^assets/(css|js)/~',$path)) $draft['files'][$path]=$bytes;
        }
        if (count($draft['files'])>SnapshotService::MAX_FILES || array_sum(array_map('strlen',$draft['files']))>SnapshotService::MAX_BYTES) {
            throw new OperationException('size_limit','Legacy restoration plus preserved uploads exceeds the draft archive budget.');
        }
        $permissions=$this->captureDraftPermissions($current);
        $after=$draft['metadata']['legacy_permissions'];
        foreach ($draft['files'] as $path=>$bytes) if (!isset($after['files'][$path]) && isset($permissions['files'][$path])) $after['files'][$path]=$permissions['files'][$path];
        foreach ($permissions['directories'] as $path=>$attributes) if (!isset($after['directories'][$path])) $after['directories'][$path]=$attributes;
        // Old restoration recompiled utilities. Do that in private preparation,
        // retaining the exact compiled bytes the caller will subsequently review.
        foreach ([$after['files']['assets/css/tailwind.css'] ?? null,$after['directories']['assets/css'] ?? null] as $attributes) {
            if ($attributes!==null && (($attributes['mode'] ?? 0)&0222)===0) throw new OperationException('host_capability_unavailable','Cannot compile legacy snapshot utilities with its captured read-only CSS permissions.');
        }
        $compile=$root.'/legacy-compile';
        foreach ($draft['files'] as $path=>$bytes) WorkspaceFiles::write($compile,$path,$bytes);
        $result=(new \VoxelSite\TailwindCompiler($compile.'/assets/css'))->compile($compile,$compile.'/assets/css/tailwind.css',1048576);
        if (($result['ok'] ?? false)!==true) throw new OperationException('host_capability_unavailable','Could not compile legacy snapshot utilities before review.');
        $draft['files']['assets/css/tailwind.css']=(string)file_get_contents($compile.'/assets/css/tailwind.css');
        $this->clearIncomplete($compile);
        if (!rmdir($compile)) throw new OperationException('host_capability_unavailable','Cannot remove temporary legacy compilation files.');
        $draft['metadata']['legacy_permissions']=$after;
        ksort($draft['files'],SORT_STRING);
        return $archive;
    }

    private function captureDraftPermissions(array &$current): array
    {
        require_once dirname(__DIR__).'/SiteControlSnapshots.php';
        $permissions=['files'=>[],'directories'=>[]];
        foreach ($current['domains']['draft']['files'] as $path=>$bytes) {
            $permissions['files'][$path]=array_intersect_key(\scSnapshotMetadata($this->workspace->resolveDraft($path)),array_flip(['mode','uid','gid']));
            for ($parent=dirname($path);$parent!=='.';$parent=dirname($parent)) {
                $permissions['directories'][$parent]=\scSnapshotMetadata($this->workspace->resolveDraft($parent));
            }
        }
        $current['domains']['draft']['metadata']['legacy_permissions']=$permissions;
        return $permissions;
    }

    private function applyLegacyPermissions(array $permissions): void
    {
        require_once dirname(__DIR__).'/SiteControlSnapshots.php';
        foreach ($permissions['files'] as $path=>$attributes) {
            $target=$this->workspace->resolveDraft($path);
            if (is_file($target)) \scRestoreSnapshotMetadata($target,$attributes,$path);
        }
        $directories=$permissions['directories'];
        uksort($directories,static fn($a,$b)=>strlen($b)<=>strlen($a));
        foreach ($directories as $path=>$attributes) {
            $target=$this->workspace->resolveDraft($path);
            if (is_dir($target)) \scRestoreSnapshotMetadata($target,$attributes,$path);
        }
    }

    /** Permission drift is an outside change just like a changed source hash. */
    private function assertLegacyPermissions(array $before,?array $after=null,bool $allowRemoved=false): void
    {
        require_once dirname(__DIR__).'/SiteControlSnapshots.php';
        foreach (['files','directories'] as $kind) foreach ($before[$kind] as $path=>$attributes) {
            $target=$this->workspace->resolveDraft($path,true);
            if ($allowRemoved && !file_exists($target)) continue;
            $actual=array_intersect_key(\scSnapshotMetadata($target),array_flip(['mode','uid','gid']));
            $matches=static fn($expected)=>is_array($expected)
                && CanonicalJson::digest(array_intersect_key($actual,$expected))===CanonicalJson::digest($expected);
            if (!$matches($attributes) && !$matches($after[$kind][$path] ?? null)) {
                throw new OperationException('content_conflict','Draft permissions changed outside the reviewed restoration.');
            }
        }
    }

    private function recoverLegacyDirectories(array $before,array $after): void
    {
        require_once dirname(__DIR__).'/SiteControlSnapshots.php';
        $directories=$before['directories'];
        uksort($directories,static fn($a,$b)=>strlen($a)<=>strlen($b));
        foreach ($directories as $path=>$attributes) {
            $target=$this->workspace->resolveDraft($path);
            if (!is_dir($target)) continue;
            $actual=\scSnapshotMetadata($target);
            $matches=static fn($expected)=>is_array($expected)
                && CanonicalJson::digest(array_intersect_key($actual,$expected))===CanonicalJson::digest($expected);
            if (!$matches($attributes) && !$matches($after['directories'][$path] ?? null)) {
                throw new OperationException('content_conflict','Outside directory permission changes need explicit recovery.');
            }
            \scRestoreSnapshotMetadata($target,$attributes,$path);
        }
    }

    private function matches(string $domain, array $hashes, array $extra = []): bool
    {
        if ($domain === 'draft') {
            $expected = array_filter($hashes, fn($hash) => $hash !== null);
            ksort($expected, SORT_STRING);
            return WorkspaceFiles::hashes(WorkspaceFiles::read($this->workspace)) === $expected;
        }
        foreach (array_unique(array_merge(array_keys($hashes), $extra)) as $path) if ($this->hash($domain, $path) !== ($hashes[$path] ?? null)) return false;
        return true;
    }

    private function hash(string $domain, string $path): ?string
    {
        $absolute = $domain === 'draft' ? $this->workspace->resolveDraft($path, true) : $this->workspace->resolvePublished($path, true);
        if (!file_exists($absolute)) return null;
        if (!is_file($absolute) || filesize($absolute) > SnapshotService::MAX_BYTES) throw new OperationException('invalid_path', 'A restoration target is not a bounded regular file.');
        return hash_file('sha256', $absolute);
    }

    private function write(string $domain, string $path, ?string $content): void
    {
        $target = $domain === 'draft' ? $this->workspace->resolveDraft($path, true) : $this->workspace->resolvePublished($path, true);
        if ($domain === 'draft') {
            if ($content === null) $this->files->deleteFile($path);
            else $this->files->writeExactFile($path, $content);
            return;
        }
        if ($content === null) {
            if (is_file($target) && !unlink($target)) throw new OperationException('host_capability_unavailable', 'Cannot remove a restored live file.');
        } else {
            if (!is_dir(dirname($target)) && !mkdir(dirname($target), 0755, true)) throw new OperationException('host_capability_unavailable', 'Cannot create a live restoration directory.');
            $mode = is_file($target) ? fileperms($target) & 0777 : 0644;
            $temp = tempnam(dirname($target), '.restore-');
            if ($temp === false) throw new OperationException('host_capability_unavailable', 'Cannot stage a live restoration file.');
            try {
                if (file_put_contents($temp, $content) !== strlen($content) || !chmod($temp, $mode)
                    || !rename($temp, $target)) throw new OperationException('host_capability_unavailable', 'Cannot install restored live bytes.');
            } finally { if (is_file($temp)) unlink($temp); }
        }
        if (function_exists('opcache_invalidate')) @opcache_invalidate($target, true);
    }

    private function verifyRetained(array $plan): void
    {
        foreach ($plan['manifest']['domains'] as $domain => $data) {
            foreach (['before' => 'before', 'after' => 'candidate'] as $side => $folder) foreach ($data[$side] as $path => $hash) {
                if ($hash !== null) $this->retainedBytes($plan['id'], $folder, $domain, $path, $hash);
            }
        }
    }

    private function retainedBytes(string $id, string $folder, string $domain, string $path, string $hash): string
    {
        $source = SiteWorkspace::resolveWithin($this->directory($id) . '/' . $folder . '/' . $domain, $path);
        if (!is_file($source) || filesize($source) > SnapshotService::MAX_BYTES) throw new OperationException('content_conflict', 'Retained restoration bytes are missing or oversized.');
        $bytes = file_get_contents($source, false, null, 0, filesize($source) + 1);
        if (!is_string($bytes) || hash('sha256', $bytes) !== $hash) throw new OperationException('content_conflict', 'Retained restoration bytes failed verification.');
        return $bytes;
    }

    private function assertPublicAfter(array $files): void
    {
        foreach (PublishPlanService::AUTHORING_ONLY as $path) {
            if (isset($files[$path])) throw new OperationException('invalid_path',
                'Private authoring context cannot be restored to the public website. Restore the draft or publish a reviewed current draft instead.', ['path' => $path]);
        }
    }

    private function scopes(string $domain): array
    {
        $scopes = ['snapshots:read', 'files:read', 'assets:read', 'operations:read'];
        foreach (SnapshotService::domains($domain) as $name) $scopes[] = $name === 'draft' ? 'restore:draft' : 'restore:live';
        return $scopes;
    }

    private function reserve(OperationActor $actor, \stdClass $input, ?string $kind = null): array
    {
        $digest = CanonicalJson::digest($kind === null ? $input : ['input' => $input, 'transition' => $kind]);
        $row = $this->db->queryOne('SELECT * FROM agent_restore_plans WHERE actor_key = ? AND request_id = ?', [$actor->identity(), $input->request_id]);
        if ($row) {
            if (!hash_equals($row['request_digest'], $digest)) throw new OperationException('idempotency_conflict', 'This restore preparation ID belongs to different input.');
            return $row;
        }
        if ((int) $this->db->scalar('SELECT COUNT(*) FROM agent_restore_plans') >= 64
            || (int) $this->db->scalar('SELECT COALESCE(SUM(staged_bytes),0) FROM agent_restore_plans') + SnapshotService::MAX_BYTES * 2 + 1048576 > 536870912) {
            throw new OperationException('size_limit', 'Retained restore storage is full.');
        }
        $id = 'restore_' . bin2hex(random_bytes(16));
        $this->db->insert('agent_restore_plans', ['id' => $id, 'actor_key' => $actor->identity(), 'user_id' => $actor->userId,
            'credential_id' => $actor->credentialId, 'request_id' => $input->request_id, 'request_digest' => $digest,
            'snapshot_id' => $input->snapshot_id, 'domain' => $input->domain, 'status' => 'preparing',
            'staged_bytes' => SnapshotService::MAX_BYTES * 2 + 1048576, 'created_at' => time(), 'expires_at' => time() + self::TTL]);
        return $this->db->queryOne('SELECT * FROM agent_restore_plans WHERE id = ?', [$id]);
    }

    private function plan(OperationActor $actor, string $id, bool $started = false): array
    {
        if (!preg_match('/^restore_[a-f0-9]{32}$/D', $id)) throw new OperationException('invalid_schema', 'Use the returned restoration plan ID.');
        $row = $this->db->queryOne('SELECT * FROM agent_restore_plans WHERE id = ?', [$id]);
        if (!$row) throw new OperationException('permission_denied', 'This restoration review is unavailable.');
        return $this->decode($actor, $row, $started);
    }

    private function decode(OperationActor $actor, array $row, bool $started = false): array
    {
        if ($row['actor_key'] !== $actor->identity() || (int) $row['user_id'] !== $actor->userId) throw new OperationException('permission_denied', 'This restoration review belongs to another connection.');
        if (!$started && (int) $row['expires_at'] <= time()) throw new OperationException('review_expired', 'The restore review expired. Prepare it again.');
        $row['manifest'] = $row['manifest_json'] === null ? null : json_decode($row['manifest_json'], true, 64, JSON_THROW_ON_ERROR);
        $row['payload'] = $row['payload_json'] === null ? null : json_decode($row['payload_json'], true, 64, JSON_THROW_ON_ERROR);
        if ($row['manifest'] !== null && !hash_equals($row['digest'], CanonicalJson::digest($row['manifest']))) throw new OperationException('content_conflict', 'The restoration manifest failed verification.');
        $this->policy->require($actor, $this->planScopes($row));
        return $row;
    }

    private function directory(string $id, bool $create = false): string
    {
        if (!preg_match('/^restore_[a-f0-9]{32}$/D', $id)) throw new OperationException('invalid_schema', 'Invalid restoration ID.');
        $path = SiteWorkspace::resolveWithin($this->root, $id);
        if ($create) {
            if (!is_dir($path) && !mkdir($path, 0700, true)) throw new OperationException('host_capability_unavailable', 'Cannot create private restoration storage.');
            if (disk_free_space($path) < SnapshotService::MAX_BYTES * 2 + 1048576) throw new OperationException('host_capability_unavailable', 'Insufficient disk space for restoration and safety bytes.');
            WorkspaceFiles::write($this->root, '.htaccess', "Require all denied\nDeny from all\n");
        }
        return $path;
    }

    private function clearIncomplete(string $root): void
    {
        $inventory = SiteWorkspace::inventory($root);
        $entries = array_keys($inventory['files'] + $inventory['directories']);
        usort($entries, static fn($a, $b) => strlen($b) <=> strlen($a));
        foreach ($entries as $path) {
            $absolute = SiteWorkspace::resolveWithin($root, $path);
            $ok = is_dir($absolute) ? rmdir($absolute) : unlink($absolute);
            if (!$ok) throw new OperationException('host_capability_unavailable', 'Cannot reset interrupted private preparation bytes.');
        }
    }

    private function hook(string $phase, array $operation): void { if ($this->testHook !== null) ($this->testHook)($phase, $operation); }
    private function planScopes(array $plan): array
    {
        return isset($plan['manifest']['transition']['kind'])
            ? $this->transitionScopes($plan['manifest']['transition']['kind']) : $this->scopes($plan['domain']);
    }
    private function transitionScopes(string $kind): array
    {
        $specific = match ($kind) {
            'designs.load', 'designs.new' => ['designs:read', 'designs:write'],
            'revisions.undo', 'revisions.redo' => ['revisions:write'],
            'site.unpublish' => ['unpublish:write'],
            default => throw new \LogicException('Unsupported trusted history transition.'),
        };
        return array_merge(['files:read', 'assets:read', 'operations:read'], $specific);
    }
    private function supportedKind(string $kind): bool
    { return in_array($kind, ['restore.apply', 'designs.load', 'designs.new', 'revisions.undo', 'revisions.redo', 'site.unpublish'], true); }
    private function validateTransition(array $transition): void
    {
        $kind = $transition['kind'];
        $fields = match ($kind) {
            'designs.load', 'designs.new' => ['kind', 'design_id', 'expected_active_design'],
            'revisions.undo', 'revisions.redo' => ['kind', 'expected_pointer', 'next_pointer', 'revision_id', 'revision_digest', 'projection', 'expected_active_design'],
            'site.unpublish' => ['kind'],
            default => throw new \LogicException('Unsupported trusted transition.'),
        };
        if (array_diff(array_keys($transition), $fields) || array_diff($fields, array_keys($transition))) throw new \LogicException('Trusted transition metadata must be exact.');
        if (str_starts_with($kind, 'revisions.')) {
            foreach (['expected_pointer', 'next_pointer', 'revision_id'] as $field) {
                if (!is_int($transition[$field]) || $transition[$field] < 0) throw new \LogicException('Invalid trusted revision head.');
            }
            if (!is_string($transition['revision_digest']) || !preg_match('/^[a-f0-9]{64}$/D', $transition['revision_digest'])
                || ($transition['projection'] !== null && !is_array($transition['projection']))) throw new \LogicException('Invalid trusted revision projection.');
        }
    }
    private static function withTransition(array $schema): array
    {
        $schema['properties']['transition'] = ['enum' => ['designs.load', 'designs.new', 'revisions.undo', 'revisions.redo', 'site.unpublish']];
        return $schema;
    }
    private static function object(array $fields): array
    { return ['type' => 'object', 'properties' => $fields, 'required' => array_keys($fields), 'additionalProperties' => false]; }
}
