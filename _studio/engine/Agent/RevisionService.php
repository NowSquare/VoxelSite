<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, FileManager, Settings, SiteMutationLock, SiteWorkspace, SnapshotService};

/** Reviewed history transitions pin the current active branch and exact bytes. */
final class RevisionService
{
    public function __construct(private Database $db, private ActorPolicy $policy, private SiteWorkspace $workspace,
        private RestorePlanService $restores, private ?string $revisionsRoot = null, private ?string $stagingRoot = null)
    {
        $this->revisionsRoot ??= getenv('VS_TEST_REVISIONS_DIR') ?: dirname($workspace->draftRoot()) . '/revisions';
        $this->stagingRoot ??= dirname($workspace->draftRoot()) . '/data/agent/revision-previews';
    }

    public static function inputSchema(string $method): array
    {
        $fields = match ($method) {
            'state' => [],
            'list' => ['limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 50],
                'offset' => ['type' => 'integer', 'minimum' => 0, 'maximum' => 10000],
                'head_version' => ['type' => 'string', 'pattern' => '^[a-f0-9]{64}$']],
            'prepare' => ['request_id' => ['type' => 'string', 'pattern' => '^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$'],
                'action' => ['enum' => ['undo', 'redo']], 'head_version' => ['type' => 'string', 'pattern' => '^[a-f0-9]{64}$'],
                'base_draft_version' => ['type' => 'string', 'pattern' => '^draft:[0-9]+$']],
            'apply' => RestorePlanService::inputSchema('apply')['properties'],
            'get' => RestorePlanService::inputSchema('get')['properties'],
            default => throw new \InvalidArgumentException('Unknown revision operation.'),
        };
        return ['type' => 'object', 'properties' => $fields, 'required' => $method === 'list' ? ['limit'] : array_keys($fields), 'additionalProperties' => false];
    }

    public static function outputSchema(string $method): array
    {
        if (in_array($method, ['prepare', 'get'], true)) return RestorePlanService::outputSchema();
        $state = self::object(['draft_version' => ['type' => 'string'], 'head_version' => ['type' => 'string'],
            'current_pointer' => ['type' => 'integer'], 'can_undo' => ['type' => 'boolean'], 'can_redo' => ['type' => 'boolean'],
            'undo_description' => ['type' => ['string', 'null']], 'redo_description' => ['type' => ['string', 'null']],
            'total_revisions' => ['type' => 'integer'], 'provider_calls' => ['const' => 0]]);
        if ($method === 'state') return $state;
        if ($method !== 'list') throw new \InvalidArgumentException('Unknown revision output.');
        return self::object(['state' => $state, 'revisions' => ['type' => 'array', 'maxItems' => 50,
            'items' => self::object(['revision_id' => ['type' => 'integer'], 'description' => ['type' => 'string'],
                'created_at' => ['type' => 'string'], 'is_undone' => ['type' => 'boolean'], 'archived' => ['type' => 'boolean'],
                'paths' => ['type' => 'array', 'items' => ['type' => 'string']]])],
            'total' => ['type' => 'integer'], 'next_offset' => ['type' => ['integer', 'null']]]);
    }

    public function state(OperationActor $actor): array
    {
        $this->policy->require($actor, ['site:read']);
        $this->workspace->assertReady();
        $rows = $this->rows();
        $pointer = (int) (new Settings($this->db))->get('revision_pointer', 0);
        $active = array_values(array_filter($rows, fn($row) => !$row['archived']));
        $undo = array_filter($active, fn($row) => (int) $row['id'] === $pointer);
        $redo = array_filter($active, fn($row) => (int) $row['id'] > $pointer && $row['is_undone']);
        return ['draft_version' => 'draft:' . $this->workspace->status()['draft_version'],
            'head_version' => CanonicalJson::digest(['pointer' => $pointer, 'rows' => $rows]),
            'current_pointer' => $pointer, 'can_undo' => $pointer > 0 && $undo !== [], 'can_redo' => $redo !== [],
            'undo_description' => $undo === [] ? null : (string) reset($undo)['description'],
            'redo_description' => $redo === [] ? null : (string) reset($redo)['description'],
            'total_revisions' => count($active), 'provider_calls' => 0];
    }

    public function list(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('list'));
        $state = $this->state($actor); $offset = $input->offset ?? 0;
        if (($offset > 0 && !isset($input->head_version)) || (isset($input->head_version) && $input->head_version !== $state['head_version'])) {
            throw new OperationException('content_conflict', 'Revision history changed. Restart its first page.');
        }
        $rows = array_reverse($this->rows()); $items = [];
        foreach (array_slice($rows, $offset, $input->limit) as $row) {
            $items[] = ['revision_id' => (int) $row['id'], 'description' => (string) $row['description'],
                'created_at' => $row['created_at'], 'is_undone' => (bool) $row['is_undone'], 'archived' => (bool) $row['archived'],
                'paths' => array_column(json_decode($row['files_changed'], true, 64, JSON_THROW_ON_ERROR), 'path')];
        }
        $next = $offset + count($items);
        return ['state' => $state, 'revisions' => $items, 'total' => count($rows), 'next_offset' => $next < count($rows) ? $next : null];
    }

    public function prepare(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('prepare'));
        $this->policy->require($actor, ['revisions:write', 'site:read', 'files:read', 'assets:read']);
        return $this->restores->prepareTransition($actor, (object) ['request_id' => $input->request_id,
            'snapshot_id' => 'revision_' . CanonicalJson::digest($input), 'domain' => 'draft'], 'revisions.' . $input->action,
            function (array $current) use ($actor, $input): array {
                $state = $this->state($actor);
                if ($input->head_version !== $state['head_version'] || $input->base_draft_version !== $state['draft_version']) {
                    throw new OperationException('content_conflict', 'The reviewed revision head or draft version changed.');
                }
                $pointer = $state['current_pointer'];
                $active = array_values(array_filter($this->rows(), fn($row) => !$row['archived']));
                $target = null;
                foreach ($active as $row) {
                    if (($input->action === 'undo' && (int) $row['id'] === $pointer)
                        || ($input->action === 'redo' && (int) $row['id'] > $pointer && $row['is_undone'])) { $target = $row; break; }
                }
                if ($target === null) throw new OperationException('content_conflict', 'There is no active revision to ' . $input->action . '.');
                $revisionId = (int) $target['id']; unset($target['archived']);
                $next = $revisionId;
                if ($input->action === 'undo') {
                    $next = 0; foreach ($active as $row) if ((int) $row['id'] < $pointer) $next = (int) $row['id'];
                }
                $files = $current['domains']['draft']['files'];
                $phase = $input->action === 'undo' ? 'before' : 'after';
                $opposite = $phase === 'before' ? 'after' : 'before';
                $changes = json_decode($target['files_changed'], true, 64, JSON_THROW_ON_ERROR);
                foreach ($changes as $change) {
                    $path = SitePathPolicy::canonical($change['path']);
                    $expected = $this->capture($revisionId, $opposite, $change);
                    if (($files[$path] ?? null) !== $expected) throw new OperationException('content_conflict', 'A revision target has changed outside its recorded history.', ['path' => $path]);
                    $bytes = $this->capture($revisionId, $phase, $change);
                    if ($bytes === null) unset($files[$path]); else $files[$path] = $bytes;
                }
                $files = $this->compile($files);
                $projection = $this->db->queryOne('SELECT * FROM agent_revision_projections WHERE revision_id = ?', [$revisionId]);
                if ($projection !== null) {
                    $projection = ['pages' => json_decode($projection[$phase . '_json'], true, 64, JSON_THROW_ON_ERROR),
                        'collection_indexes' => $projection[$phase . '_collections_json'] === null
                            ? $current['domains']['draft']['metadata']['collection_indexes']
                            : json_decode($projection[$phase . '_collections_json'], true, 64, JSON_THROW_ON_ERROR)];
                    $design = $this->db->queryOne('SELECT * FROM agent_revision_design_state WHERE revision_id = ?', [$revisionId]);
                    if ($design !== null) $projection['active_design_id'] = $design[$phase . '_design_id'];
                }
                $metadata = $projection ?? ['pages' => array_values(array_filter($current['domains']['draft']['metadata']['pages'],
                    fn($page) => isset($files[$page['file_path']])) )];
                return ['archive' => ['action_digest' => $current['action_digest'], 'domains' => ['draft' => ['files' => $files, 'metadata' => $metadata]]],
                    'transition' => ['expected_pointer' => $pointer, 'next_pointer' => $next, 'revision_id' => $revisionId,
                        'revision_digest' => CanonicalJson::digest($target), 'projection' => $projection,
                        'expected_active_design' => (new Settings($this->db))->get('active_design_id')]];
            });
    }

    public function get(OperationActor $actor, string $id): array
    {
        $plan = $this->restores->get($actor, $id);
        if (!str_starts_with($plan['transition'] ?? '', 'revisions.')) throw new OperationException('invalid_schema', 'Choose a reviewed revision transition.');
        return $plan;
    }
    public function apply(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('apply'));
        return $this->restores->applyTransition($actor, $input, ['revisions.undo', 'revisions.redo']);
    }

    private function rows(): array
    {
        $rows = $this->db->query('SELECT revisions.*, EXISTS(SELECT 1 FROM agent_archived_revisions a WHERE a.revision_id = revisions.id) AS archived FROM revisions ORDER BY id LIMIT 10001');
        if (count($rows) > 10000) throw new OperationException('size_limit', 'Revision inventory exceeds the supported history budget.');
        return $rows;
    }
    private function capture(int $id, string $phase, array $change): ?string
    {
        if (($phase === 'before' && !$change['had_previous']) || ($phase === 'after' && $change['action'] === 'delete')) return null;
        $path = SiteWorkspace::resolveWithin($this->revisionsRoot, $id . '/' . $phase . '/' . $change['path']);
        if (!is_file($path) || filesize($path) > SnapshotService::MAX_BYTES) throw new OperationException('content_conflict', 'The retained revision is incomplete or oversized.');
        $bytes = file_get_contents($path, false, null, 0, filesize($path) + 1);
        if (!is_string($bytes) || strlen($bytes) !== filesize($path)) throw new OperationException('content_conflict', 'Revision capture changed while reading.');
        return $bytes;
    }
    private function compile(array $files): array
    {
        if (count($files) > WorkspaceFiles::MAX_FILES || array_sum(array_map('strlen', $files)) > WorkspaceFiles::MAX_BYTES) throw new OperationException('size_limit', 'The revision candidate exceeds the qualified workspace budget.');
        $root = SiteWorkspace::resolveWithin($this->stagingRoot, bin2hex(random_bytes(16)));
        try {
            if (!mkdir($root . '/assets', 0700, true)) throw new OperationException('host_capability_unavailable', 'Cannot create a private revision preview.');
            WorkspaceFiles::write($root, '.htaccess', SiteWorkspace::ACCESS_MARKER . "\nRequire all denied\nDeny from all\n");
            foreach ($files as $path => $bytes) WorkspaceFiles::write($root, $path, $bytes);
            $staged = new SiteWorkspace($this->db, $root, $this->workspace->publishedRoot(), $root . '-state', $this->workspace->publishedAssetsRoot(), false);
            if ((new \ReflectionMethod(FileManager::class, '__construct'))->getNumberOfParameters() < 2) throw new \LogicException('Explicit workspace injection is required.');
            $compiled = (new FileManager($this->db, $staged))->compileTailwind();
            if (($compiled['ok'] ?? false) !== true) throw new OperationException('host_capability_unavailable', 'Revision CSS compilation failed before review.');
            return WorkspaceFiles::read($staged);
        } finally {
            if (is_dir($root)) {
                $inventory = SiteWorkspace::inventory($root);
                $paths = array_keys($inventory['files'] + $inventory['directories']);
                usort($paths, fn($a, $b) => strlen($b) <=> strlen($a));
                foreach ($paths as $path) { $full = SiteWorkspace::resolveWithin($root, $path); is_dir($full) ? rmdir($full) : unlink($full); }
                rmdir($root);
            }
        }
    }
    private static function object(array $fields): array
    { return ['type' => 'object', 'properties' => $fields, 'required' => array_keys($fields), 'additionalProperties' => false]; }
}
