<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{SiteWorkspace};

/** Unpublishing owns only files in the retained managed release. */
final class UnpublishService
{
    public function __construct(private ActorPolicy $policy, private SiteWorkspace $workspace,
        private RestorePlanService $restores, private ?string $placeholder = null)
    { $this->placeholder ??= dirname(__DIR__, 2) . '/data/default-unpublish-index.php'; }

    public static function inputSchema(string $method): array
    {
        if ($method === 'apply') return RestorePlanService::inputSchema('apply');
        if ($method === 'get') return RestorePlanService::inputSchema('get');
        if ($method !== 'prepare') throw new \InvalidArgumentException('Unknown unpublish method.');
        $fields = ['request_id' => ['type' => 'string', 'pattern' => '^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$'],
            'release_id' => ['type' => 'string', 'pattern' => '^release_[a-f0-9]{32}$']];
        return ['type' => 'object', 'properties' => $fields, 'required' => array_keys($fields), 'additionalProperties' => false];
    }
    public static function outputSchema(): array { return RestorePlanService::outputSchema(); }

    public function prepare(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('prepare'));
        $this->policy->require($actor, ['unpublish:write', 'files:read', 'assets:read']);
        return $this->restores->prepareTransition($actor, (object) ['request_id' => $input->request_id,
            'snapshot_id' => 'unpublish_' . CanonicalJson::digest($input), 'domain' => 'published'], 'site.unpublish',
            function (array $current) use ($input): array {
                if ($this->workspace->status()['release_id'] !== $input->release_id) throw new OperationException('content_conflict', 'The managed live release changed before unpublish review.');
                if (is_link($this->placeholder) || !is_file($this->placeholder) || filesize($this->placeholder) > 1048576) {
                    throw new OperationException('host_capability_unavailable', 'The shipped offline page is missing or unsafe.');
                }
                $bytes = file_get_contents($this->placeholder, false, null, 0, 1048577);
                if (!is_string($bytes) || strlen($bytes) > 1048576) throw new OperationException('host_capability_unavailable', 'Cannot retain the shipped offline page.');
                return ['archive' => ['action_digest' => $current['action_digest'],
                    'domains' => ['published' => ['files' => ['index.php' => $bytes], 'metadata' => ['release_id' => null]]]], 'transition' => []];
            });
    }
    public function get(OperationActor $actor, string $id): array
    {
        $plan = $this->restores->get($actor, $id);
        if (($plan['transition'] ?? null) !== 'site.unpublish') throw new OperationException('invalid_schema', 'Choose an unpublish review.');
        return $plan;
    }
    public function apply(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('apply'));
        return $this->restores->applyTransition($actor, $input, ['site.unpublish']);
    }
}
