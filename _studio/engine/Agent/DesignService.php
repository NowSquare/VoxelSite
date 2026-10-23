<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, DesignManager, DesignTokens, PreviewRenderer, Settings, SiteMutationLock, SiteWorkspace, SnapshotService};

/** Named private draft archives; saved designs never install live files. */
final class DesignService
{
    private OperationRunner $runner;
    public function __construct(private Database $db, private ActorPolicy $policy, private SiteWorkspace $workspace,
        private DesignManager $designs, private RestorePlanService $restores, private OperationStore $operations,
        private ?string $actionsRoot = null, private ?string $previewRoot = null, private int $filesPerStep = 20)
    {
        $data = dirname($workspace->draftRoot()) . '/data';
        $this->actionsRoot ??= $data . '/actions';
        $this->previewRoot ??= $data . '/agent/design-previews';
        if ($filesPerStep < 1 || $filesPerStep > 100) throw new \InvalidArgumentException('A bounded design copy budget is required.');
        $this->runner = new OperationRunner($db, $policy, $operations, $workspace->mutationLockPath());
    }
    public static function inputSchema(string $method): array
    {
        $id = ['type' => 'string', 'pattern' => '^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$'];
        $design = ['type' => 'string', 'pattern' => '^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$'];
        $name = ['type' => 'string', 'minLength' => 1, 'maxLength' => 120];
        $description = ['type' => 'string', 'maxLength' => 1000];
        $version = ['type' => 'string', 'pattern' => '^[a-f0-9]{64}$'];
        $fields = match ($method) {
            'list' => ['limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 50], 'offset' => ['type' => 'integer', 'minimum' => 0, 'maximum' => 256], 'inventory_version' => $version],
            'save' => ['operation_id' => $id, 'name' => $name, 'description' => $description],
            'rename' => ['operation_id' => $id, 'design_id' => $design, 'version' => $version, 'name' => $name, 'description' => $description],
            'delete' => ['operation_id' => $id, 'design_id' => $design, 'version' => $version],
            'load' => ['request_id' => $id, 'design_id' => $design, 'base_draft_version' => ['type' => 'string', 'pattern' => '^draft:[0-9]+$']],
            'new' => ['request_id' => $id, 'base_draft_version' => ['type' => 'string', 'pattern' => '^draft:[0-9]+$']],
            'apply' => RestorePlanService::inputSchema('apply')['properties'],
            'get' => RestorePlanService::inputSchema('get')['properties'],
            'preview' => ['design_id' => $design, 'path' => ['type' => 'string', 'maxLength' => 240], 'max_bytes' => ['type' => 'integer', 'minimum' => 4096, 'maximum' => 262144]],
            default => throw new \InvalidArgumentException('Unknown design operation.'),
        };
        $schema = self::object($fields);
        if ($method === 'list') $schema['required'] = ['limit'];
        return $schema;
    }
    public static function metadataSchema(): array
    {
        $s = ['type' => 'string'];
        return self::object(['id' => $s, 'name' => $s, 'description' => $s, 'site_name' => $s, 'initial_prompt' => $s,
            'created_at' => $s, 'updated_at' => $s, 'version' => $s, 'archive_format' => ['type' => 'integer'],
            'domains' => ['type' => 'array', 'items' => ['const' => 'draft']], 'page_count' => ['type' => 'integer'],
            'file_count' => ['type' => 'integer'], 'is_system_backup' => ['type' => 'boolean'], 'protected' => ['type' => 'boolean'],
            'design_tokens' => ['type' => 'object', 'properties' => [], 'additionalProperties' => ['type' => 'string'], 'maxProperties' => 80]]);
    }
    public static function outputSchema(string $method): array
    {
        if (in_array($method, ['load', 'new', 'get'], true)) return RestorePlanService::outputSchema();
        if ($method === 'list') return self::object(['designs' => ['type' => 'array', 'maxItems' => 50, 'items' => self::metadataSchema()],
            'active_id' => ['type' => ['string', 'null']], 'inventory_version' => ['type' => 'string'],
            'total' => ['type' => 'integer'], 'next_offset' => ['type' => ['integer', 'null']], 'provider_calls' => ['const' => 0]]);
        if ($method === 'preview') return self::object(['design_id' => ['type' => 'string'], 'archive_format' => ['type' => 'integer'],
            'domains' => ['type' => 'array', 'items' => ['const' => 'draft']], 'html' => ['type' => ['string', 'null']],
            'html_bytes' => ['type' => 'integer'], 'rendered' => ['type' => 'boolean'], 'status' => ['type' => 'integer'],
            'diagnostics' => ['type' => 'array', 'items' => ['type' => 'string']], 'provider_calls' => ['const' => 0]]);
        throw new \InvalidArgumentException('Unknown design output.');
    }
    public static function resultSchema(string $method): array
    {
        if (in_array($method, ['save', 'rename'], true)) return self::object(['design' => self::metadataSchema(), 'provider_calls' => ['const' => 0]]);
        if ($method === 'delete') return self::object(['design_id' => ['type' => 'string'], 'deleted' => ['const' => true],
            'retained_history' => ['const' => true], 'provider_calls' => ['const' => 0]]);
        return RestorePlanService::resultSchema();
    }
    public function list(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('list'));
        $this->policy->require($actor, ['designs:read']);
        $items = array_map(fn($meta) => $this->view($meta), $this->designs->list());
        $version = CanonicalJson::digest($items); $offset = $input->offset ?? 0;
        if (($offset > 0 && !isset($input->inventory_version)) || (isset($input->inventory_version) && $input->inventory_version !== $version)) {
            throw new OperationException('content_conflict', 'Saved designs changed. Restart the library page.');
        }
        $slice = array_slice($items, $offset, $input->limit); $next = $offset + count($slice);
        return ['designs' => $slice, 'active_id' => (new Settings($this->db))->get('active_design_id'),
            'inventory_version' => $version, 'total' => count($items), 'next_offset' => $next < count($items) ? $next : null, 'provider_calls' => 0];
    }
    public function save(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('save'));
        $this->policy->require($actor, ['designs:write', 'files:read', 'assets:read']);
        $row = $this->db->transaction(function () use ($actor, $input): array {
            $digest = CanonicalJson::digest($input);
            $row = $this->db->queryOne('SELECT * FROM agent_designs WHERE actor_key = ? AND operation_id = ?', [$actor->identity(), $input->operation_id]);
            if ($row) {
                if ($row['request_digest'] !== $digest) throw new OperationException('idempotency_conflict', 'This design operation ID belongs to different input.');
                return $row;
            }
            if ($this->db->count('agent_designs') >= 64 || (int) $this->db->scalar('SELECT COALESCE(SUM(staged_bytes),0) FROM agent_designs') + WorkspaceFiles::MAX_BYTES > 536870912) {
                throw new OperationException('size_limit', 'Retained design storage is full.');
            }
            $id = 'design_' . bin2hex(random_bytes(16));
            $this->db->insert('agent_designs', ['id' => $id, 'actor_key' => $actor->identity(), 'user_id' => $actor->userId,
                'operation_id' => $input->operation_id, 'request_digest' => $digest, 'status' => 'capturing',
                'staged_bytes' => WorkspaceFiles::MAX_BYTES, 'created_at' => time(), 'updated_at' => time()]);
            return $this->db->queryOne('SELECT * FROM agent_designs WHERE id = ?', [$id]);
        });
        return $this->runner->start($actor, $input->operation_id, 'designs.save', $input, 'draft:' . $this->workspace->status()['draft_version'],
            $row['id'], ['designs:write', 'files:read', 'assets:read'], fn($op) => $this->capture($actor, $op), fn($op) => $this->captureFailure($op));
    }
    public function rename(OperationActor $actor, \stdClass $input): array { return $this->mutateMetadata($actor, $input, 'rename'); }
    public function delete(OperationActor $actor, \stdClass $input): array { return $this->mutateMetadata($actor, $input, 'delete'); }
    private function mutateMetadata(OperationActor $actor, \stdClass $input, string $method): array
    {
        JsonSchema::validate($input, self::inputSchema($method));
        return $this->runner->start($actor, $input->operation_id, 'designs.' . $method, $input,
            'draft:' . $this->workspace->status()['draft_version'], null, ['designs:write', 'designs:read'],
            fn($op) => $this->metadataStep($actor, $op), fn() => ['restored' => true, 'remaining_paths' => []]);
    }
    public function continue(OperationActor $actor, string $id, int $checkpoint): array
    {
        $op = $this->operations->get($actor, $id);
        if (!in_array($op['kind'], ['designs.save', 'designs.rename', 'designs.delete'], true)) throw new OperationException('invalid_schema', 'Use this operation’s own continuation.');
        return $this->runner->continue($actor, $id, $checkpoint,
            $op['kind'] === 'designs.save' ? ['designs:write', 'files:read', 'assets:read'] : ['designs:write', 'designs:read'],
            $op['kind'] === 'designs.save' ? fn($op) => $this->capture($actor, $op) : fn($op) => $this->metadataStep($actor, $op),
            fn($op) => $this->captureFailure($op), fn() => true);
    }
    public function recover(OperationActor $actor, string $id): array
    {
        $op = $this->operations->get($actor, $id);
        if (!in_array($op['kind'], ['designs.save', 'designs.rename', 'designs.delete'], true)) throw new OperationException('invalid_schema', 'Use this operation’s own recovery.');
        return $this->runner->recover($actor, $id, ['designs:write'], fn($op) => $this->captureFailure($op));
    }
    public function prepareLoad(OperationActor $actor, \stdClass $input): array { return $this->prepare($actor, $input, 'load'); }
    public function prepareNew(OperationActor $actor, \stdClass $input): array { return $this->prepare($actor, $input, 'new'); }
    private function prepare(OperationActor $actor, \stdClass $input, string $method): array
    {
        JsonSchema::validate($input, self::inputSchema($method));
        return $this->restores->prepareTransition($actor, (object) ['request_id' => $input->request_id,
            'snapshot_id' => 'design_' . CanonicalJson::digest($input), 'domain' => 'draft'], 'designs.' . $method,
            function (array $current) use ($input, $method): array {
                if ($input->base_draft_version !== 'draft:' . $this->workspace->status()['draft_version']) throw new OperationException('content_conflict', 'The draft changed before design review.');
                $archive = $method === 'load' ? $this->designs->archive($input->design_id)
                    : ['action_digest' => $current['action_digest'], 'domains' => ['draft' => ['files' => [], 'metadata' => ['pages' => []]]]];
                // Uploaded images/fonts are shared content within the private
                // draft. Loading a design never resets those newer uploads.
                foreach ($current['domains']['draft']['files'] as $path => $bytes) if (!DesignManager::isDesignPath($path)) $archive['domains']['draft']['files'][$path] = $bytes;
                return ['archive' => $archive, 'transition' => ['design_id' => $method === 'load' ? $input->design_id : null,
                    'expected_active_design' => (new Settings($this->db))->get('active_design_id')]];
            });
    }
    public function get(OperationActor $actor, string $id): array
    {
        $plan = $this->restores->get($actor, $id);
        if (!str_starts_with($plan['transition'] ?? '', 'designs.')) throw new OperationException('invalid_schema', 'Choose a reviewed design transition.');
        return $plan;
    }
    public function apply(OperationActor $actor, \stdClass $input): array
    { return $this->restores->applyTransition($actor, $input, ['designs.load', 'designs.new']); }

    public function preview(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('preview'));
        if (!str_ends_with($input->path, '.php')) throw new OperationException('invalid_path', 'Text preview requires a saved PHP page.');
        $render = $this->previewResponse($actor, $input->design_id, $input->path);
        $result = ['design_id' => $input->design_id, 'archive_format' => $render['archive_format'], 'domains' => ['draft'],
            'html' => $render['content'], 'html_bytes' => strlen($render['content']), 'rendered' => $render['rendered'],
            'status' => $render['status'], 'diagnostics' => array_map(fn($item) => $item['code'] . ': ' . $item['message'], $render['diagnostics']), 'provider_calls' => 0];
        if (strlen(CanonicalJson::encode($result)) > $input->max_bytes) {
            $result['html'] = null; $result['diagnostics'][] = 'Rendered HTML exceeds this response budget. Increase max_bytes or use the authenticated design preview.';
        }
        if (strlen(CanonicalJson::encode($result)) > $input->max_bytes) throw new OperationException('size_limit', 'Preview diagnostics exceed the response budget.');
        return $result;
    }

    /** Authenticated Studio asset/page responses use the same saved-design boundary. */
    public function previewResponse(OperationActor $actor, string $id, string $path, bool $embed = true): array
    {
        $this->policy->require($actor, ['designs:read', 'preview:read', 'files:read', 'assets:read']);
        return ProviderCallPolicy::runExternal(function () use ($id, $path, $embed): array {
            $lock = SiteMutationLock::acquire($this->workspace->mutationLockPath(), $this->db);
            $archive = $this->designs->archive($id);
            $files = $archive['domains']['draft']['files'];
            foreach (WorkspaceFiles::read($this->workspace) as $name => $bytes) if (!DesignManager::isDesignPath($name)) $files[$name] = $bytes;
            if (count($files) > WorkspaceFiles::MAX_FILES || array_sum(array_map('strlen', $files)) > WorkspaceFiles::MAX_BYTES) throw new OperationException('size_limit', 'Saved design preview exceeds the private workspace budget.');
            $root = SiteWorkspace::resolveWithin($this->previewRoot, bin2hex(random_bytes(16)));
            try {
                if (!mkdir($root . '/assets', 0700, true)) throw new OperationException('host_capability_unavailable', 'Cannot create a private design preview.');
                WorkspaceFiles::write($this->previewRoot, '.htaccess', "Require all denied\nDeny from all\n");
                WorkspaceFiles::write($root, '.htaccess', SiteWorkspace::ACCESS_MARKER . "\nRequire all denied\nDeny from all\n");
                foreach ($files as $name => $bytes) WorkspaceFiles::write($root, $name, $bytes);
                $staged = new SiteWorkspace($this->db, $root, $this->workspace->publishedRoot(), $root . '-state', $this->workspace->publishedAssetsRoot(), false);
                $settings = new Settings($this->db);
                $installation = rtrim((string) parse_url((string) $settings->get('workspace_base_url', $settings->get('site_url', '')), PHP_URL_PATH), '/');
                $base = $installation . '/_studio/api/router.php?_path=' . rawurlencode('/designs/' . $id . '/preview') . '&path=';
                return (new PreviewRenderer($staged))->render($path, $base, ['studio' => false, 'embed' => $embed, 'has_actions' => false,
                    'validation_url' => $installation . '/_studio/api/router.php?_path=%2Fpreview%2Fvalidate'])
                    + ['archive_format' => (int) ($archive['metadata']['archive_format'] ?? 1)];
            } finally {
                if (is_dir($root)) {
                    $inventory = SiteWorkspace::inventory($root); $paths = array_keys($inventory['files'] + $inventory['directories']);
                    usort($paths, fn($a, $b) => strlen($b) <=> strlen($a));
                    foreach ($paths as $name) { $full = SiteWorkspace::resolveWithin($root, $name); is_dir($full) ? rmdir($full) : unlink($full); }
                    rmdir($root);
                }
            }
        });
    }

    private function capture(OperationActor $actor, array $op): array
    {
        $this->workspace->assertReady();
        $row = $this->db->queryOne("SELECT * FROM agent_designs WHERE id = ? AND status = 'capturing'", [$op['preparation_id']]);
        if (!$row) throw new OperationException('content_conflict', 'The design capture is unavailable.');
        $files = array_filter(WorkspaceFiles::read($this->workspace), fn($path) => DesignManager::isDesignPath($path), ARRAY_FILTER_USE_KEY);
        $manifest = ['format' => 3, 'files' => WorkspaceFiles::hashes($files), 'metadata' => ['pages' => $this->db->query('SELECT * FROM pages ORDER BY id')],
            'action_digest' => PublishPlanService::actionDigest($this->actionsRoot)];
        $digest = CanonicalJson::digest($manifest);
        if ($row['digest'] !== null && $row['digest'] !== $digest) throw new OperationException('content_conflict', 'Draft source changed during design capture.');
        if ($row['digest'] === null) $this->db->update('agent_designs', ['manifest_json' => CanonicalJson::encode($manifest), 'digest' => $digest], 'id = ?', [$row['id']]);
        $root = $this->designs->directory($row['id']);
        if (!is_dir($root . '/preview/assets') && !mkdir($root . '/preview/assets', 0700, true)) throw new OperationException('host_capability_unavailable', 'Cannot create private design storage.');
        if (disk_free_space($root) < WorkspaceFiles::MAX_BYTES) throw new OperationException('host_capability_unavailable', 'Insufficient space for design capture.');
        WorkspaceFiles::write($this->designs->root(), '.htaccess', "Require all denied\nDeny from all\n");
        WorkspaceFiles::write($root . '/preview', '.htaccess', SiteWorkspace::ACCESS_MARKER . "\nRequire all denied\nDeny from all\n");
        $paths = array_keys($files); $next = (int) ($op['checkpoint']['next_file'] ?? 0); $end = min(count($paths), $next + $this->filesPerStep);
        for (; $next < $end; $next++) WorkspaceFiles::write($root . '/preview', $paths[$next], $files[$paths[$next]]);
        if ($next < count($paths)) return ['complete' => false, 'phase' => 'design_capture', 'checkpoint' => ['next_file' => $next], 'recovery' => ['design_id' => $row['id']]];
        foreach ($manifest['files'] as $path => $hash) if (hash_file('sha256', SiteWorkspace::resolveWithin($root . '/preview', $path)) !== $hash) throw new OperationException('content_conflict', 'Saved design bytes failed verification.');
        $settings = new Settings($this->db); $tokens = DesignTokens::parse($files['assets/css/style.css'] ?? '');
        $tokens = array_slice(array_filter($tokens, fn($key) => str_starts_with($key, '--color-') || str_starts_with($key, '--font-'), ARRAY_FILTER_USE_KEY), 0, 80, true);
        $meta = ['id' => $row['id'], 'name' => $op['request']['name'], 'description' => $op['request']['description'],
            'site_name' => (string) $settings->get('site_name', ''), 'initial_prompt' => (string) $settings->get('initial_prompt', ''),
            'created_at' => gmdate('c', (int) $row['created_at']), 'updated_at' => gmdate('c'), 'archive_format' => 3, 'domains' => ['draft'],
            'page_count' => count($manifest['metadata']['pages']), 'file_count' => count($files), 'is_system_backup' => false, 'design_tokens' => $tokens];
        WorkspaceFiles::write($root, 'metadata.json', CanonicalJson::encode($meta));
        $this->operations->finish($actor, $op['operation_id'], $op['lease_token'], 'succeeded',
            ['design' => $this->view($meta, true), 'provider_calls' => 0], null, function () use ($row, $meta, $files, $settings): void {
                $this->db->update('agent_designs', ['status' => 'valid', 'metadata_json' => CanonicalJson::encode($meta),
                    'staged_bytes' => array_sum(array_map('strlen', $files)), 'updated_at' => time()], 'id = ?', [$row['id']]);
                $settings->set('active_design_id', $row['id']);
            });
        return ['committed' => true];
    }
    /** Trusted rollback-only seam; cannot be used as normal actor continuation. */
    public function restoreForOwnerRecovery(array $operation): array
    {
        OwnerRecoveryService::assertClaim($this->db, $this->workspace, $operation);
        return $this->captureFailure($operation);
    }

    private function captureFailure(array $op): array
    {
        if ($op['kind'] === 'designs.save') $this->db->update('agent_designs', ['status' => 'failed'], "id = ? AND status = 'capturing'", [$op['preparation_id']]);
        return ['restored' => true, 'remaining_paths' => []];
    }
    private function metadataStep(OperationActor $actor, array $op): array
    {
        $input = $op['request']; $meta = $this->designs->readMetadata($input['design_id']);
        if ($meta === null || $this->view($meta)['version'] !== $input['version']) throw new OperationException('content_conflict', 'Saved design metadata changed.');
        $deleted = $op['kind'] === 'designs.delete';
        if ($deleted && $this->protected($input['design_id'])) throw new OperationException('content_conflict', 'This design is required by active or retained history.');
        if (!$deleted) { $meta['name'] = $input['name']; $meta['description'] = $input['description']; $meta['updated_at'] = gmdate('c'); }
        $result = $deleted ? ['design_id' => $input['design_id'], 'deleted' => true, 'retained_history' => true, 'provider_calls' => 0]
            : ['design' => $this->view($meta), 'provider_calls' => 0];
        $this->operations->finish($actor, $op['operation_id'], $op['lease_token'], 'succeeded', $result, null, function () use ($meta, $deleted): void {
            $patch = ['status' => $deleted ? 'deleted' : 'valid', 'metadata_json' => CanonicalJson::encode($meta), 'updated_at' => time()];
            if ($this->db->count('agent_designs', 'id = ?', [$meta['id']])) $this->db->update('agent_designs', $patch, 'id = ?', [$meta['id']]);
            else $this->db->insert('agent_designs', $patch + ['id' => $meta['id'], 'actor_key' => 'legacy', 'user_id' => 0,
                'operation_id' => 'legacy_' . $meta['id'], 'request_digest' => CanonicalJson::digest($meta), 'staged_bytes' => 0,
                'created_at' => strtotime($meta['created_at'] ?? '') ?: time()]);
        });
        return ['committed' => true];
    }
    private function protected(string $id): bool
    {
        if ((new Settings($this->db))->get('active_design_id') === $id) return true;
        if ($this->db->scalar('SELECT COUNT(*) FROM agent_revision_design_state WHERE before_design_id = ? OR after_design_id = ?', [$id, $id])) return true;
        foreach ($this->db->query("SELECT manifest_json FROM agent_restore_plans WHERE status IN ('ready','applied')") as $row) {
            $manifest = json_decode($row['manifest_json'], true, 64, JSON_THROW_ON_ERROR);
            if (($manifest['transition']['design_id'] ?? null) === $id) return true;
        }
        return false;
    }
    private function view(array $meta, ?bool $protected = null): array
    {
        $tokens = []; foreach (array_slice((array) ($meta['design_tokens'] ?? []), 0, 80, true) as $key => $value) if (is_string($value)) $tokens[$key] = mb_substr($value, 0, 500);
        return ['id' => $meta['id'], 'name' => (string) ($meta['name'] ?? ''), 'description' => (string) ($meta['description'] ?? ''),
            'site_name' => (string) ($meta['site_name'] ?? ''), 'initial_prompt' => (string) ($meta['initial_prompt'] ?? ''),
            'created_at' => (string) ($meta['created_at'] ?? ''), 'updated_at' => (string) ($meta['updated_at'] ?? ''),
            'version' => CanonicalJson::digest($meta), 'archive_format' => (int) ($meta['archive_format'] ?? 1), 'domains' => ['draft'],
            'page_count' => (int) ($meta['page_count'] ?? 0), 'file_count' => (int) ($meta['file_count'] ?? 0),
            'is_system_backup' => (bool) ($meta['is_system_backup'] ?? false), 'protected' => $protected ?? $this->protected($meta['id']),
            'design_tokens' => (object) $tokens];
    }
    private static function object(array $fields): array
    { return ['type' => 'object', 'properties' => $fields, 'required' => array_keys($fields), 'additionalProperties' => false]; }
}
