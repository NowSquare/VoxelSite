<?php
declare(strict_types=1);
namespace VoxelSite;

use VoxelSite\Agent\{ActorPolicy, CanonicalJson, JsonSchema, OperationActor, OperationException, OperationRunner, OperationStore, ProviderCallPolicy, PublishPlanService, ReleaseStore, SitePathPolicy, WorkspaceFiles};

/** Website archives only. Business records and credentials are never captured. */
final class SnapshotService
{
    public const MAX_FILES = 700;
    public const MAX_BYTES = 33554432;
    public const EXCLUDED = ['submissions', 'notes', 'board', 'users', 'credentials', 'mail_settings',
        'action_definitions', 'draft_settings', 'server_configuration', 'immutable_library', 'unrelated_hosting_files'];
    private OperationRunner $runner;
    private const CAPTURE_SCOPES = ['snapshots:write', 'snapshots:read', 'files:read', 'assets:read'];

    public function __construct(private Database $db, private ActorPolicy $policy, private SiteWorkspace $workspace,
        private ReleaseStore $releases, private OperationStore $operations, private string $root,
        private string $legacyRoot, private string $actionsRoot, private int $filesPerStep = 20)
    {
        if (!str_starts_with($root, '/') || is_link($root) || $filesPerStep < 1 || $filesPerStep > 100) {
            throw new \InvalidArgumentException('Trusted private snapshot storage and a bounded copy budget are required.');
        }
        // Capture preserves the current bytes without changing the website.
        // It remains available during legacy recovery, but the common lock
        // and another retained operation's reservation still prevent races.
        $this->runner = new OperationRunner($db, $policy, $operations, $workspace->mutationLockPath(), false);
    }

    public static function inputSchema(string $method): array
    {
        $fields = match ($method) {
            'create' => ['operation_id' => ['type' => 'string', 'pattern' => '^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$'],
                'domain' => ['enum' => ['draft', 'published', 'both']], 'label' => ['type' => 'string', 'maxLength' => 200]],
            'inspect' => ['snapshot_id' => ['type' => 'string', 'maxLength' => 80]],
            'list' => ['limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 50],
                'offset' => ['type' => 'integer', 'minimum' => 0, 'maximum' => 10000],
                'inventory_version' => ['type' => 'string', 'pattern' => '^[a-f0-9]{64}$']],
            default => throw new \InvalidArgumentException('Unknown snapshot method.'),
        };
        return ['type' => 'object', 'properties' => $fields, 'required' => $method === 'list' ? ['limit'] : array_keys($fields), 'additionalProperties' => false];
    }

    public static function outputSchema(string $method): array
    {
        if ($method !== 'list') throw new \InvalidArgumentException('Use metadataSchema or resultSchema for archive inspection or capture.');
        $fields = ['snapshots' => ['type' => 'array', 'maxItems' => 50, 'items' => self::metadataSchema()],
            'inventory_version' => ['type' => 'string'], 'total' => ['type' => 'integer'],
            'next_offset' => ['type' => ['integer', 'null']]];
        return ['type' => 'object', 'properties' => $fields, 'required' => array_keys($fields), 'additionalProperties' => false];
    }

    public static function metadataSchema(): array
    {
        return ['type' => 'object', 'properties' => [
            'snapshot_id' => ['type' => 'string'], 'format' => ['type' => 'integer'],
            'domains' => ['type' => 'array', 'items' => ['enum' => ['draft', 'published']]],
            'label' => ['type' => 'string'], 'created_at' => ['type' => 'string'],
            'actor' => ['type' => ['object', 'null'], 'properties' => [
                'type' => ['type' => 'string'], 'user_id' => ['type' => 'integer'],
                'credential_id' => ['type' => ['integer', 'null']], 'client_name' => ['type' => ['string', 'null']]],
                'required' => ['type', 'user_id'], 'additionalProperties' => false],
            'file_count' => ['type' => 'integer'], 'bytes' => ['type' => ['integer', 'null']],
            'protected' => ['type' => 'boolean'], 'validity' => ['enum' => ['valid', 'invalid', 'not_checked']],
            'diagnostics' => ['type' => 'array', 'items' => ['type' => 'string']],
            'excluded_domains' => ['type' => 'array', 'items' => ['type' => 'string']],
        ], 'required' => ['snapshot_id', 'format', 'domains', 'label', 'created_at', 'actor', 'file_count',
            'bytes', 'protected', 'validity', 'diagnostics', 'excluded_domains'], 'additionalProperties' => false];
    }

    public static function resultSchema(): array
    {
        $s = ['type' => 'string'];
        $fields = ['snapshot_id' => $s, 'format' => ['const' => 3],
            'domains' => ['type' => 'array', 'items' => ['enum' => ['draft', 'published']]],
            'file_count' => ['type' => 'integer'], 'bytes' => ['type' => 'integer'],
            'excluded_domains' => ['type' => 'array', 'items' => $s],
            'provider_calls' => ['const' => 0], 'retention_warning' => ['type' => ['string', 'null']]];
        return ['type' => 'object', 'properties' => $fields, 'required' => array_keys($fields), 'additionalProperties' => false];
    }

    public function create(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('create'));
        $this->policy->require($actor, self::CAPTURE_SCOPES);
        $row = $this->db->transaction(function () use ($actor, $input): array {
            $digest = CanonicalJson::digest($input);
            $row = $this->db->queryOne('SELECT * FROM site_snapshot_captures WHERE actor_key = ? AND operation_id = ?',
                [$actor->identity(), $input->operation_id]);
            if ($row) {
                if (!hash_equals($row['request_digest'], $digest)) throw new OperationException('idempotency_conflict', 'This snapshot operation ID belongs to different input.');
                return $row;
            }
            if ((int) $this->db->scalar('SELECT COUNT(*) FROM site_snapshot_captures') >= 64
                || (int) $this->db->scalar('SELECT COALESCE(SUM(staged_bytes),0) FROM site_snapshot_captures') + self::MAX_BYTES > 536870912) {
                throw new OperationException('size_limit', 'Snapshot storage is full. Review retained archives in Studio.');
            }
            $id = 'snapshot_' . bin2hex(random_bytes(16));
            $this->db->insert('site_snapshot_captures', ['id' => $id, 'actor_key' => $actor->identity(), 'user_id' => $actor->userId,
                'operation_id' => $input->operation_id, 'request_digest' => $digest, 'actor_json' => CanonicalJson::encode($actor->attribution()),
                'status' => 'capturing', 'label' => $input->label, 'domain' => $input->domain,
                'staged_bytes' => self::MAX_BYTES, 'created_at' => time()]);
            return $this->db->queryOne('SELECT * FROM site_snapshot_captures WHERE id = ?', [$id]);
        });
        return $this->runner->start($actor, $input->operation_id, 'snapshots.create', $input,
            'draft:' . $this->workspace->status()['draft_version'], $row['id'], self::CAPTURE_SCOPES,
            fn($op) => $this->captureStep($actor, $op), fn($op) => $this->captureFailure($op));
    }

    public function continue(OperationActor $actor, string $id, int $checkpoint): array
    {
        if ($this->operations->get($actor, $id)['kind'] !== 'snapshots.create') throw new OperationException('invalid_schema', 'Use this operation’s own continuation.');
        return $this->runner->continue($actor, $id, $checkpoint, self::CAPTURE_SCOPES,
            fn($op) => $this->captureStep($actor, $op), fn($op) => $this->captureFailure($op), fn($op) => true);
    }

    public function recover(OperationActor $actor, string $id): array
    {
        if ($this->operations->get($actor, $id)['kind'] !== 'snapshots.create') throw new OperationException('invalid_schema', 'Use this operation’s own recovery.');
        return $this->runner->recover($actor, $id, self::CAPTURE_SCOPES, fn($op) => $this->captureFailure($op));
    }

    public function list(OperationActor $actor, int $limit = 50): array
    {
        return $this->listPaged($actor, (object) ['limit' => $limit])['snapshots'];
    }

    public function listPaged(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('list'));
        $this->policy->require($actor, ['snapshots:read']);
        $inventory = $this->db->query("SELECT * FROM (
            SELECT id,created_at,digest || ':' || label AS signature FROM site_snapshot_captures WHERE status = 'valid'
            UNION ALL SELECT id,created_at,digest FROM site_releases
            UNION ALL SELECT id,created_at,digest || ':' || status FROM agent_publish_plans WHERE status IN ('ready','published')
            UNION ALL SELECT 'safety_' || substr(id,9),created_at,digest || ':' || status FROM agent_restore_plans WHERE status IN ('ready','applied')
            UNION ALL SELECT 'legacy_' || id,CAST(strftime('%s',created_at) AS INTEGER),filename || ':' || label || ':' || size_bytes FROM snapshots
        ) ORDER BY created_at DESC,id DESC LIMIT 10001");
        if (count($inventory) > 10000) throw new OperationException('size_limit', 'Archive inventory exceeds the supported history page budget.');
        // Required older recovery archives remain visible on the first bounded
        // history page. Include that ordering in the pagination version.
        $protected = array_fill_keys(SnapshotRetention::protectedIds($this->db), true);
        foreach ($inventory as &$item) $item['recovery_priority'] = preg_match('/^legacy_([1-9][0-9]*)$/D', $item['id'], $match)
            && isset($protected[(int)$match[1]]) ? 1 : 0;
        unset($item);
        usort($inventory, static fn($a,$b) => $b['recovery_priority'] <=> $a['recovery_priority']
            ?: (int)$b['created_at'] <=> (int)$a['created_at'] ?: strcmp($b['id'],$a['id']));
        $version = CanonicalJson::digest($inventory);
        $offset = $input->offset ?? 0;
        if (($offset > 0 && !isset($input->inventory_version))
            || (isset($input->inventory_version) && !hash_equals($version, $input->inventory_version))) {
            throw new OperationException('content_conflict', 'Archive inventory changed. Restart from the first history page.');
        }
        $out = [];
        // Listing never expands or hashes every archive. Inspection is the
        // explicit bounded verification of one selected archive's bytes.
        foreach (array_slice($inventory, $offset, $input->limit) as $row) $out[] = $this->summary($row['id']);
        $next = $offset + count($out);
        return ['snapshots' => $out, 'inventory_version' => $version, 'total' => count($inventory),
            'next_offset' => $next < count($inventory) ? $next : null];
    }

    public function inspect(OperationActor $actor, string $id): array
    {
        $this->policy->require($actor, ['snapshots:read', 'files:read', 'assets:read']);
        $view = ['snapshot_id' => $id, 'format' => 0, 'domains' => [], 'label' => '', 'created_at' => '',
            'actor' => null, 'file_count' => 0, 'bytes' => 0, 'protected' => true, 'validity' => 'invalid',
            'diagnostics' => [], 'excluded_domains' => self::EXCLUDED];
        try {
            $archive = $this->read($actor, $id);
            $view = array_replace($view, $archive['metadata'], ['validity' => 'valid']);
            foreach ($archive['domains'] as $domain) {
                $view['file_count'] += count(array_filter($domain['files'], fn($content) => $content !== null));
                $view['bytes'] += array_sum(array_map(fn($content) => strlen($content ?? ''), $domain['files']));
            }
        } catch (OperationException $error) {
            $view['diagnostics'][] = $error->errorCode . ': ' . $error->getMessage();
        } catch (\Throwable) {
            $view['diagnostics'][] = 'content_conflict: The retained archive could not be verified.';
        }
        if (preg_match('/^(legacy_[1-9][0-9]*|snapshot_[a-f0-9]{32})$/D', $id)) {
            try { $view['protected'] = $this->deletions()->protection($id) !== null; }
            catch (OperationException) { $view['protected'] = true; }
        }
        return $view;
    }

    public function deletions(): \VoxelSite\Agent\SnapshotDeletionService
    {
        return new \VoxelSite\Agent\SnapshotDeletionService($this->db, $this->policy, $this->workspace,
            $this->operations, $this->root, $this->legacyRoot, $this->filesPerStep);
    }

    /** Trusted restoration input, fully validated before any website writes. */
    public function read(OperationActor $actor, string $id): array
    {
        $this->policy->require($actor, ['snapshots:read', 'files:read', 'assets:read']);
        return ProviderCallPolicy::runExternal(function () use ($id): array {
            if (preg_match('/^legacy_([1-9][0-9]*)$/D', $id, $match)) return $this->legacy((int) $match[1]);
            if (preg_match('/^snapshot_[a-f0-9]{32}$/D', $id)) {
                $row = $this->db->queryOne("SELECT * FROM site_snapshot_captures WHERE id = ? AND status = 'valid'", [$id]);
                if (!$row) throw new OperationException('content_conflict', 'This snapshot is missing or incomplete.');
                $manifest = $this->verifiedManifest($row);
                return $this->retained($id, $manifest, $this->directory($id), $row['label'], $row['created_at'],
                    json_decode($row['actor_json'], true, 32, JSON_THROW_ON_ERROR));
            }
            if (preg_match('/^(publish|release)_[a-f0-9]{32}$/D', $id, $match)) {
                $release = $match[1] === 'release'
                    ? $this->db->queryOne('SELECT * FROM site_releases WHERE id = ?', [$id]) : null;
                if ($match[1] === 'release' && !$release) throw new OperationException('content_conflict', 'The retained release is missing.');
                $planId = $release['plan_id'] ?? $id;
                // Restored releases retain their own candidate instead of a publish plan.
                if (str_starts_with($planId, 'restore_')) return $this->restorationArchive($id, $planId, false);
                $row = $this->db->queryOne("SELECT * FROM agent_publish_plans WHERE id = ? AND status IN ('ready','published')", [$planId]);
                if (!$row) throw new OperationException('content_conflict', 'The retained publication archive is unavailable.');
                if ($row['status'] === 'ready' && (int) $row['expires_at'] <= time()) throw new OperationException('review_expired', 'This unpublished recovery archive expired with its review.');
                $manifest = $this->verifiedManifest($row);
                $before = $match[1] === 'publish';
                $hashes = $manifest[$before ? 'before' : 'after'];
                $files = $this->readHashes($this->releases->stage($planId) . ($before ? '/before' : '/candidate'), $hashes, 'published');
                return ['metadata' => ['snapshot_id' => $id, 'format' => 3, 'domains' => ['published'],
                    'label' => $before ? 'Before publication' : 'Published release', 'created_at' => gmdate('c', (int) $row['created_at']),
                    'actor' => $release ? json_decode($release['actor_json'], true) : null],
                    'action_digest' => $manifest['action_digest'] ?? null,
                    'domains' => ['published' => ['files' => $files, 'metadata' => ['release_id' => $before ? $manifest['before_release_id'] : $id]]]];
            }
            if (preg_match('/^safety_[a-f0-9]{32}$/D', $id)) return $this->restorationArchive($id, 'restore_' . substr($id, 7), true);
            throw new OperationException('invalid_schema', 'Use a returned snapshot or release ID.');
        });
    }

    public function actionDigest(): string { return PublishPlanService::actionDigest($this->actionsRoot); }
    public function restoreRoot(): string { return dirname($this->root) . '/restores'; }

    public function assertActionCompatibility(array $archive): void
    {
        $containsActions = false;
        foreach ($archive['domains'] as $domain) foreach ($domain['files'] as $path => $content) {
            if (preg_match('~^(actions/|actions-bar\\.)~', $path)
                || (is_string($content) && str_ends_with($path, '.php') && str_contains($content, 'actions-bar.'))) $containsActions = true;
        }
        $current = $this->actionDigest();
        $known = $archive['action_digest'] ?? null;
        if ((is_string($known) && !hash_equals($known, $current))
            || (!is_string($known) && ($containsActions || $current !== CanonicalJson::digest([])))) {
            throw new OperationException('content_conflict', 'Archived Action artifacts do not match the current live definitions. Reconcile those artifacts before restoring; Action definitions are excluded.');
        }
    }

    public function current(string $domain): array
    {
        $this->workspace->assertReady();
        $domains = []; $bytes = 0; $count = 0;
        foreach (self::domains($domain) as $name) {
            if ($name === 'draft') {
                $domains[$name] = ['files' => WorkspaceFiles::read($this->workspace),
                    'metadata' => ['pages' => $this->db->query('SELECT * FROM pages ORDER BY id'),
                        'collection_indexes' => $this->db->query('SELECT id, index_page_id FROM collections ORDER BY id'),
                        'draft_version' => $this->workspace->status()['draft_version']]];
                $bytes += array_sum(array_map('strlen', $domains[$name]['files']));
                $count += count($domains[$name]['files']);
            } else {
                $release = $this->workspace->status()['release_id'];
                if ($release === null) throw new OperationException('content_conflict', 'No retained managed release exists for a published snapshot.');
                $hashes = $this->releases->managed($release);
                if ($count + count($hashes) > self::MAX_FILES) throw new OperationException('size_limit', 'The selected domains contain too many files.');
                $files = [];
                foreach ($hashes as $path => $hash) {
                    PublishPlanService::destination($path);
                    $absolute = $this->workspace->resolvePublished($path);
                    $files[$path] = $this->readFile($absolute, self::MAX_BYTES - $bytes);
                    $bytes += strlen($files[$path]);
                    if (hash('sha256', $files[$path]) !== $hash) throw new OperationException('content_conflict', 'Managed live bytes differ from the retained release.', ['path' => $path]);
                }
                $domains[$name] = ['files' => $files, 'metadata' => ['release_id' => $release,
                    'publication_settings' => $this->db->query("SELECT * FROM settings WHERE key IN ('last_published_at','publish_count') ORDER BY key")]];
            }
        }
        $this->bounded($domains);
        return ['domains' => $domains, 'action_digest' => $this->actionDigest()];
    }

    public static function domains(string $domain): array
    {
        return match ($domain) {
            'draft' => ['draft'], 'published' => ['published'], 'both' => ['draft', 'published'],
            default => throw new OperationException('invalid_schema', 'Choose draft, published, or both.'),
        };
    }

    private function captureStep(OperationActor $actor, array $operation): array
    {
        $id = $operation['preparation_id'];
        $row = $this->db->queryOne('SELECT * FROM site_snapshot_captures WHERE id = ?', [$id]);
        if (!$row || $row['status'] !== 'capturing') throw new OperationException('content_conflict', 'The capture is no longer available.');
        $source = $this->current($row['domain']);
        $manifest = ['format' => 3, 'action_digest' => $source['action_digest'], 'domains' => []];
        foreach ($source['domains'] as $domain => $data) $manifest['domains'][$domain] = [
            'files' => WorkspaceFiles::hashes($data['files']), 'metadata' => $data['metadata']];
        $digest = CanonicalJson::digest($manifest);
        if ($row['digest'] !== null && !hash_equals($row['digest'], $digest)) throw new OperationException('content_conflict', 'Snapshot source changed during capture.');
        if ($row['digest'] === null) $this->db->update('site_snapshot_captures',
            ['manifest_json' => CanonicalJson::encode($manifest), 'digest' => $digest], 'id = ?', [$id]);
        $root = $this->directory($id, true);
        $entries = [];
        foreach ($source['domains'] as $domain => $data) foreach ($data['files'] as $path => $content) $entries[] = [$domain, $path, $content];
        $index = (int) ($operation['checkpoint']['next_file'] ?? 0);
        $end = min(count($entries), $index + $this->filesPerStep);
        for (; $index < $end; $index++) {
            [$domain, $path, $content] = $entries[$index];
            WorkspaceFiles::write($root . '/' . $domain, $path, $content);
        }
        if ($index < count($entries)) return ['complete' => false, 'phase' => 'snapshot_capture',
            'checkpoint' => ['next_file' => $index, 'total_files' => count($entries)], 'recovery' => ['snapshot_id' => $id]];
        $this->retained($id, $manifest, $root, $row['label'], $row['created_at'], $actor->attribution());
        $bytes = array_sum(array_map(fn($entry) => strlen($entry[2]), $entries));
        $this->operations->finish($actor, $operation['operation_id'], $operation['lease_token'], 'succeeded',
            ['snapshot_id' => $id, 'format' => 3, 'domains' => array_keys($manifest['domains']), 'file_count' => count($entries),
                'bytes' => $bytes, 'excluded_domains' => self::EXCLUDED, 'provider_calls' => 0, 'retention_warning' => null],
            null, fn() => $this->db->update('site_snapshot_captures', ['status' => 'valid', 'staged_bytes' => $bytes], 'id = ?', [$id]));
        return ['committed' => true];
    }

    /** Trusted rollback-only seam; cannot be used as normal actor continuation. */
    public function restoreForOwnerRecovery(array $operation): array
    {
        \VoxelSite\Agent\OwnerRecoveryService::assertClaim($this->db, $this->workspace, $operation);
        return $this->captureFailure($operation);
    }

    private function captureFailure(array $operation): array
    {
        $this->db->update('site_snapshot_captures', ['status' => 'failed'], 'id = ? AND status = ?', [$operation['preparation_id'], 'capturing']);
        return ['restored' => true, 'remaining_paths' => []]; // Capturing never alters website bytes.
    }

    private function summary(string $id): array
    {
        $view = ['snapshot_id' => $id, 'format' => 3, 'domains' => [], 'label' => '', 'created_at' => '',
            'actor' => null, 'file_count' => 0, 'bytes' => null, 'protected' => true, 'validity' => 'not_checked',
            'diagnostics' => ['Stored metadata only; inspect verifies retained bytes.'], 'excluded_domains' => self::EXCLUDED];
        try {
            if (str_starts_with($id, 'legacy_')) {
                $legacyId = (int) substr($id, 7);
                $row = $this->db->queryOne('SELECT * FROM snapshots WHERE id = ?', [$legacyId]);
                if (basename($row['filename']) !== $row['filename']) throw new OperationException('invalid_path', 'Unsafe archive filename.');
                $provenance = LegacySnapshotService::snapshotArchiveDomains(SiteWorkspace::resolveWithin($this->legacyRoot, $row['filename']));
                if (($provenance['unavailable'] ?? false) || $provenance['domains'] !== ['draft']) throw new OperationException('content_conflict', 'Unsupported archive provenance.');
                return array_replace($view, ['format' => $provenance['archive_format'], 'domains' => ['draft'], 'label' => (string) $row['label'],
                    'created_at' => (string) $row['created_at'], 'file_count' => (int) $row['file_count'],
                    'protected' => $this->deletions()->protection($id) !== null,
                    'actor' => $row['created_by'] === null ? null : ['type' => 'user', 'user_id' => (int) $row['created_by']]]);
            }
            if (str_starts_with($id, 'snapshot_')) {
                $row = $this->db->queryOne('SELECT * FROM site_snapshot_captures WHERE id = ?', [$id]);
                $manifest = $this->verifiedManifest($row);
                $count = 0; foreach ($manifest['domains'] as $data) $count += count($data['files']);
                return array_replace($view, ['domains' => array_keys($manifest['domains']), 'label' => $row['label'],
                    'created_at' => gmdate('c', (int) $row['created_at']), 'file_count' => $count, 'bytes' => (int) $row['staged_bytes'],
                    'protected' => $this->deletions()->protection($id) !== null,
                    'actor' => json_decode($row['actor_json'], true, 32, JSON_THROW_ON_ERROR)]);
            }
            $release = str_starts_with($id, 'release_') ? $this->db->queryOne('SELECT * FROM site_releases WHERE id = ?', [$id]) : null;
            $safety = str_starts_with($id, 'safety_');
            $planId = $safety ? 'restore_' . substr($id, 7) : ($release['plan_id'] ?? $id);
            $table = str_starts_with($planId, 'restore_') ? 'agent_restore_plans' : 'agent_publish_plans';
            $row = $this->db->queryOne('SELECT * FROM ' . $table . ' WHERE id = ?', [$planId]);
            $manifest = $this->verifiedManifest($row);
            if ($safety) {
                $count = 0; foreach ($manifest['domains'] as $data) $count += count(array_filter($data['before'], fn($hash) => $hash !== null));
                return array_replace($view, ['domains' => array_keys($manifest['domains']), 'label' => 'Before restoration',
                    'created_at' => gmdate('c', (int) $row['created_at']), 'file_count' => $count,
                    'actor' => ['type' => $row['credential_id'] === null ? 'user' : 'api_key', 'user_id' => (int) $row['user_id'],
                        'credential_id' => $row['credential_id'] === null ? null : (int) $row['credential_id']]]);
            }
            $hashes = $table === 'agent_restore_plans' ? $manifest['domains']['published']['after'] : $manifest[$release ? 'after' : 'before'];
            return array_replace($view, ['domains' => ['published'], 'label' => $release ? 'Published release' : 'Before publication',
                'created_at' => gmdate('c', (int) $row['created_at']),
                'file_count' => count(array_filter($hashes, fn($hash) => $hash !== null)),
                'actor' => $release ? json_decode($release['actor_json'], true, 32, JSON_THROW_ON_ERROR)
                    : ['type' => $row['credential_id'] === null ? 'user' : 'api_key', 'user_id' => (int) $row['user_id'], 'credential_id' => $row['credential_id']]]);
        } catch (\Throwable) {
            return array_replace($view, ['validity' => 'invalid', 'diagnostics' => ['Stored archive metadata failed verification.']]);
        }
    }

    private function retained(string $id, array $manifest, string $root, string $label, int|string $time, ?array $actor): array
    {
        $domains = []; $bytes = 0;
        foreach ($manifest['domains'] as $domain => $data) {
            if (!in_array($domain, ['draft', 'published'], true)) throw new OperationException('content_conflict', 'Unsupported archive domain.');
            $domains[$domain] = ['files' => $this->readHashes($root . '/' . $domain, $data['files'], $domain, self::MAX_BYTES - $bytes),
                'metadata' => $data['metadata']];
            $bytes += array_sum(array_map(fn($content) => strlen($content ?? ''), $domains[$domain]['files']));
            if ($domain === 'draft') self::validateDraftMetadata($data['metadata'], $domains[$domain]['files']);
        }
        $this->bounded($domains);
        return ['metadata' => ['snapshot_id' => $id, 'format' => 3, 'domains' => array_keys($domains),
            'label' => $label, 'created_at' => gmdate('c', (int) $time), 'actor' => $actor],
            'domains' => $domains, 'action_digest' => $manifest['action_digest'] ?? null];
    }

    private function restorationArchive(string $id, string $planId, bool $before): array
    {
        $row = $this->db->queryOne("SELECT * FROM agent_restore_plans WHERE id = ? AND status IN ('ready','applied')", [$planId]);
        if (!$row) throw new OperationException('content_conflict', 'The retained restoration archive is unavailable.');
        $manifest = $this->verifiedManifest($row);
        // Root is a trusted service setting recorded by the restore service,
        // never a client-provided filesystem path.
        $root = SiteWorkspace::resolveWithin($this->restoreRoot(), $planId);
        $domains = []; $bytes = 0;
        foreach ($manifest['domains'] as $name => $data) {
            if (!$before && $name !== 'published') continue;
            $domains[$name] = ['files' => $this->readHashes($root . '/' . ($before ? 'before' : 'candidate') . '/' . $name,
                $data[$before ? 'before' : 'after'], $name, self::MAX_BYTES - $bytes), 'metadata' => $data[$before ? 'before_metadata' : 'metadata']];
            $bytes += array_sum(array_map(fn($content) => strlen($content ?? ''), $domains[$name]['files']));
            if ($name === 'draft') self::validateDraftMetadata($domains[$name]['metadata'], $domains[$name]['files']);
        }
        $this->bounded($domains);
        return ['metadata' => ['snapshot_id' => $id, 'format' => 3, 'domains' => array_keys($domains),
            'label' => $before ? 'Before restoration' : 'Restored release', 'created_at' => gmdate('c', (int) $row['created_at']),
            'actor' => ['type' => 'user', 'user_id' => (int) $row['user_id'], 'credential_id' => $row['credential_id']]],
            'domains' => $domains, 'action_digest' => $manifest['action_digest']];
    }

    private function legacy(int $id): array
    {
        $row = $this->db->queryOne('SELECT * FROM snapshots WHERE id = ?', [$id]);
        if (!$row) throw new OperationException('content_conflict', 'The legacy archive is missing.');
        if (basename($row['filename']) !== $row['filename']) throw new OperationException('invalid_path', 'Unsafe legacy archive filename.');
        $path = SiteWorkspace::resolveWithin($this->legacyRoot, $row['filename']);
        if (!is_file($path) || filesize($path) > self::MAX_BYTES) throw new OperationException('size_limit', 'The legacy archive is missing or exceeds the supported read budget.');
        $zip = new \ZipArchive();
        if ($zip->open($path) !== true) throw new OperationException('content_conflict', 'The legacy archive cannot be opened.');
        try {
            if ($zip->numFiles > self::MAX_FILES * 3) throw new OperationException('size_limit', 'The legacy archive has too many entries.');
            $state = null; $files = []; $seen = []; $bytes = 0;
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $stat = $zip->statIndex($i);
                $name = $stat['name'];
                $opsys = $attributes = 0;
                if ($zip->getExternalAttributesIndex($i, $opsys, $attributes) && (($attributes >> 16) & 0170000) === 0120000) {
                    throw new OperationException('invalid_path', 'Legacy archive symlinks cannot be restored.');
                }
                if (isset($seen[$name]) || str_contains($name, '\\') || str_starts_with($name, '/')
                    || in_array('..', explode('/', $name), true)) throw new OperationException('invalid_path', 'The legacy archive contains unsafe or duplicate paths.');
                $seen[$name] = true;
                $bytes += $stat['size'];
                if ($bytes > self::MAX_BYTES) throw new OperationException('size_limit', 'Uncompressed legacy files exceed the supported read budget.');
                if (str_ends_with($name, '/')) continue;
                if ($name === 'site-control-state.json') {
                    if ($stat['size'] > 1048576) throw new OperationException('size_limit', 'Legacy snapshot metadata exceeds its read budget.');
                    $raw = $zip->getFromIndex($i);
                    try { $state = json_decode($raw, true, 64, JSON_THROW_ON_ERROR); }
                    catch (\Throwable) { throw new OperationException('content_conflict', 'The legacy restoration manifest is corrupt.'); }
                    continue;
                }
                if (!preg_match('~^(preview|assets)/(.+)$~D', $name, $match)) throw new OperationException('invalid_path', 'The legacy archive contains an unsupported domain.');
                if ($match[1] === 'preview' && str_starts_with($match[2], 'assets/')) continue;
                $relative = $match[1] === 'assets' ? $name : $match[2];
                if (preg_match('~^assets/(library|icons)/~', $relative) || in_array(basename($relative), ['.htaccess', '.user.ini', '.gitkeep'], true)) continue;
                SitePathPolicy::canonical($relative);
                $content = $zip->getFromIndex($i);
                if (!is_string($content) || strlen($content) !== $stat['size']) throw new OperationException('content_conflict', 'A legacy file failed decompression.');
                $files[$relative] = $content;
            }
            if (isset($state['domain']) && $state['domain'] !== 'draft') throw new OperationException('content_conflict', 'This legacy archive cannot be interpreted as a draft.');
            if ($state !== null && !in_array($state['format'] ?? 1, [1, 2], true)) throw new OperationException('content_conflict', 'The legacy archive format is unsupported.');
            foreach ($state['files'] ?? [] as $entry => $meta) {
                $relative = str_starts_with($entry, 'preview/') ? substr($entry, 8) : $entry;
                if (preg_match('~^assets/(library|icons)/~', $relative) || str_starts_with($entry, 'preview/assets/')
                    || in_array(basename($relative), ['.htaccess', '.user.ini', '.gitkeep'], true)) continue;
                if (!isset($files[$relative]) || hash('sha256', $files[$relative]) !== ($meta['sha256'] ?? null)) throw new OperationException('content_conflict', 'A legacy file is missing or failed its recorded checksum.');
            }
            ksort($files, SORT_STRING);
            $metadata=['pages'=>$state['pages'] ?? [],'collection_indexes'=>$state['collection_indexes'] ?? [],
                'legacy_projection'=>is_array($state) && array_key_exists('pages',$state),'legacy_permissions'=>['files'=>[],'directories'=>[]]];
            foreach (['files','directories'] as $kind) foreach ($state[$kind] ?? [] as $entry=>$attributes) {
                if (!is_string($entry) || !preg_match('~^(preview|assets)/(.+)$~D',$entry,$match)) throw new OperationException('invalid_path','Invalid legacy permission path.');
                $relative=$match[1]==='preview' ? $match[2] : $entry;
                if (str_starts_with($entry,'preview/assets/') || preg_match('~^assets/(library|icons)(?:/|$)~',$relative)
                    || in_array(basename($relative),['.htaccess','.user.ini','.gitkeep'],true)) continue;
                SiteWorkspace::normalizeRelative($relative);
                $attributes=is_int($attributes) ? ['mode'=>$attributes] : $attributes;
                if (!is_array($attributes) || !is_int($attributes['mode'] ?? null) || $attributes['mode']<0 || $attributes['mode']>07777) {
                    throw new OperationException('content_conflict','Invalid legacy file permissions.');
                }
                foreach (['uid','gid'] as $owner) if (isset($attributes[$owner]) && (!is_int($attributes[$owner]) || $attributes[$owner]<0)) throw new OperationException('content_conflict','Invalid legacy file ownership.');
                if ($kind==='files' && !array_key_exists($relative,$files)) throw new OperationException('content_conflict','Legacy permissions refer to an uncaptured file.');
                if ($kind==='directories' && !array_filter(array_keys($files),static fn($path)=>str_starts_with($path,$relative.'/'))) {
                    // Empty directories are outside the owned file manifest.
                    continue;
                }
                $metadata['legacy_permissions'][$kind][$relative]=array_intersect_key($attributes,array_flip(['mode','uid','gid']));
            }
            $domains = ['draft' => ['files' => $files, 'metadata' => $metadata]];
            self::validateDraftMetadata($domains['draft']['metadata'], $files);
            $this->bounded($domains);
            return ['metadata' => ['snapshot_id' => 'legacy_' . $id, 'format' => (int) ($state['format'] ?? 1),
                'domains' => ['draft'], 'label' => (string) ($row['label'] ?? ''), 'created_at' => (string) $row['created_at'],
                'actor' => $row['created_by'] === null ? null : ['type' => 'user', 'user_id' => (int) $row['created_by']]],
                'domains' => $domains, 'action_digest' => null];
        } finally { $zip->close(); }
    }

    private function readHashes(string $root, array $hashes, string $domain, int $budget = self::MAX_BYTES): array
    {
        $out = []; $bytes = 0;
        if (count($hashes) > self::MAX_FILES) throw new OperationException('size_limit', 'The archive contains too many files.');
        foreach ($hashes as $path => $hash) {
            $domain === 'published' ? PublishPlanService::destination($path) : SitePathPolicy::canonical($path);
            if ($hash === null) { $out[$path] = null; continue; }
            if (!is_string($hash) || !preg_match('/^[a-f0-9]{64}$/D', $hash)) throw new OperationException('content_conflict', 'The archive has an invalid checksum.');
            $content = $this->readFile(SiteWorkspace::resolveWithin($root, $path), $budget - $bytes);
            if (($bytes += strlen($content)) > self::MAX_BYTES || hash('sha256', $content) !== $hash) throw new OperationException('content_conflict', 'Retained archive bytes failed verification.');
            $out[$path] = $content;
        }
        ksort($out, SORT_STRING);
        return $out;
    }

    private function readFile(string $path, int $budget = self::MAX_BYTES): string
    {
        if (!is_file($path) || is_link($path) || filesize($path) > $budget) throw new OperationException('size_limit', 'A retained file is missing, unsafe, or oversized.');
        $size = filesize($path);
        $bytes = file_get_contents($path, false, null, 0, $size + 1);
        if (!is_string($bytes) || strlen($bytes) !== $size) throw new OperationException('content_conflict', 'A retained file changed while reading.');
        return $bytes;
    }

    /** Modern archives apply labels/navigation; verified legacy rows retain identity. */
    public static function validateDraftMetadata(array $metadata, array $files): void
    {
        $rows = $metadata['pages'] ?? [];
        if (!is_array($rows) || count($rows) > self::MAX_FILES) throw new OperationException('content_conflict', 'Invalid archived page metadata.');
        $byId = []; $paths = [];
        foreach ($rows as $row) {
            if (!is_array($row) || !is_int($row['id'] ?? null) || $row['id'] < 1
                || !is_string($row['file_path'] ?? null) || !str_ends_with($row['file_path'], '.php')
                || !isset($files[$row['file_path']]) || isset($byId[$row['id']]) || isset($paths[$row['file_path']])) {
                throw new OperationException('content_conflict', 'Archived page identities do not match captured files.');
            }
            SitePathPolicy::canonical($row['file_path']);
            foreach (['title', 'nav_label'] as $field) {
                if (isset($row[$field]) && (!is_string($row[$field]) || strlen($row[$field]) > 1000)) throw new OperationException('content_conflict', 'Invalid archived page label.');
            }
            if (isset($row['nav_order']) && !is_int($row['nav_order'])) throw new OperationException('content_conflict', 'Invalid archived navigation order.');
            if (isset($row['nav_parent_id']) && !is_int($row['nav_parent_id'])) throw new OperationException('content_conflict', 'Invalid archived navigation parent.');
            $byId[$row['id']] = $row; $paths[$row['file_path']] = true;
        }
        foreach ($byId as $id => $row) {
            $seen = [$id => true]; $parent = $row['nav_parent_id'] ?? null;
            while ($parent !== null) {
                if (!isset($byId[$parent]) || isset($seen[$parent])) throw new OperationException('content_conflict', 'Archived navigation has a missing parent or cycle.');
                $seen[$parent] = true; $parent = $byId[$parent]['nav_parent_id'] ?? null;
            }
        }
        if (($metadata['legacy_projection'] ?? false)===true) {
            $allowed=['id','slug','title','description','file_path','page_type','collection_type','collection_item_id',
                'nav_order','nav_label','nav_parent_id','is_published','is_homepage','last_ai_edit','created_at','updated_at'];
            $slugs=[];
            foreach ($rows as $row) {
                if (array_diff(array_keys($row),$allowed) || !is_string($row['slug'] ?? null) || isset($slugs[$row['slug']])
                    || !in_array($row['page_type'] ?? null,['page','collection_index','collection_item'],true)
                    || !array_key_exists('nav_parent_id',$row)) throw new OperationException('content_conflict','Invalid legacy page projection.');
                foreach (['slug','title','created_at','updated_at'] as $field) if (!is_string($row[$field] ?? null) || strlen($row[$field])>4096) {
                    throw new OperationException('content_conflict','Invalid legacy page field.');
                }
                foreach (['description','collection_type','collection_item_id','last_ai_edit'] as $field) if (isset($row[$field])
                    && (!is_string($row[$field]) || strlen($row[$field])>65536)) throw new OperationException('content_conflict','Invalid legacy page field.');
                foreach (['is_published','is_homepage'] as $field) if (isset($row[$field]) && !in_array($row[$field],[0,1],true)) {
                    throw new OperationException('content_conflict','Invalid legacy page visibility.');
                }
                $slugs[$row['slug']]=true;
            }
            $collections=$metadata['collection_indexes'] ?? [];
            if (!is_array($collections) || count($collections)>self::MAX_FILES) throw new OperationException('content_conflict','Invalid legacy collection projection.');
            $seen=[];
            foreach ($collections as $row) {
                if (!is_array($row) || array_diff(array_keys($row),['id','index_page_id']) || !is_int($row['id'] ?? null)
                    || $row['id']<1 || isset($seen[$row['id']]) || !array_key_exists('index_page_id',$row)
                    || ($row['index_page_id']!==null && (!is_int($row['index_page_id']) || !isset($byId[$row['index_page_id']])))) {
                    throw new OperationException('content_conflict','Invalid legacy collection relationship.');
                }
                $seen[$row['id']]=true;
            }
        }
    }

    private function verifiedManifest(array $row): array
    {
        try { $manifest = json_decode($row['manifest_json'], true, 64, JSON_THROW_ON_ERROR); }
        catch (\Throwable) { throw new OperationException('content_conflict', 'The retained manifest is corrupt.'); }
        if (!is_array($manifest) || !hash_equals((string) $row['digest'], CanonicalJson::digest($manifest))) throw new OperationException('content_conflict', 'The retained manifest failed verification.');
        return $manifest;
    }

    private function bounded(array $domains): void
    {
        $files = 0; $bytes = 0;
        foreach ($domains as $data) foreach ($data['files'] as $content) {
            $files++; $bytes += strlen($content ?? '');
        }
        if ($files > self::MAX_FILES || $bytes > self::MAX_BYTES) throw new OperationException('size_limit', 'The selected archive domains exceed 700 files or 32 MiB.');
    }

    private function directory(string $id, bool $create = false): string
    {
        if (!preg_match('/^snapshot_[a-f0-9]{32}$/D', $id)) throw new OperationException('invalid_schema', 'Invalid snapshot identifier.');
        $path = SiteWorkspace::resolveWithin($this->root, $id);
        if ($create) {
            if (!is_dir($path) && !mkdir($path, 0700, true)) throw new OperationException('host_capability_unavailable', 'Cannot create private snapshot storage.');
            if (disk_free_space($path) < self::MAX_BYTES) throw new OperationException('host_capability_unavailable', 'Insufficient disk space for snapshot capture.');
            WorkspaceFiles::write($this->root, '.htaccess', "Require all denied\nDeny from all\n");
        }
        return $path;
    }
}
