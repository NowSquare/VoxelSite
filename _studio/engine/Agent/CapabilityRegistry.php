<?php
declare(strict_types=1);

namespace VoxelSite\Agent;

final class CapabilityRegistry
{
    /** @var array<string, CapabilityDefinition> */
    private array $definitions = [];

    public function __construct(iterable $definitions = [])
    {
        foreach ($definitions as $definition) $this->register($definition);
    }

    public function register(CapabilityDefinition $definition): void
    {
        if (isset($this->definitions[$definition->name])) throw new \InvalidArgumentException('Duplicate capability name.');
        $this->definitions[$definition->name] = $definition;
    }

    /** @return list<CapabilityDefinition> */
    public function all(): array
    {
        $sorted = $this->definitions;
        ksort($sorted, SORT_STRING);
        return array_values($sorted);
    }

    public function get(string $name): CapabilityDefinition
    {
        return $this->definitions[$name] ?? throw new OperationException('unknown_tool', 'This tool is not available on this installation.');
    }

    /** Build/release gate only: activating a dormant feature requires explicit shared coverage. */
    public function assertFutureFeatureParity(array $routes,array $operations,array $features=['collections','contacts']):void
    {
        foreach($routes as $key=>$route) {
            $path=$route['route']??'';
            $feature=null;
            foreach($features as $candidate) {
                if($path==='/'.$candidate || str_starts_with($path,'/'.$candidate.'/')) {$feature=$candidate;break;}
            }
            if($feature===null)continue;
            $matches=array_values(array_filter($operations,static fn($row)=>
                (($row['surface']??'').' '.($row['method']??'').' '.($row['route']??''))===$key));
            if(!$matches)throw new \LogicException('Future-feature parity missing: '.$key);
            foreach($matches as $row) {
                $mapping=$row['mcp']??[];
                if(($mapping['status']??'')!=='verified' || empty($mapping['tools']) || empty($mapping['tests'])
                    || empty($mapping['evidence']) || empty($row['service_seams']))
                    throw new \LogicException('Future-feature parity is unverified: '.$key);
                foreach($mapping['tools'] as $name) {
                    if(!isset($this->definitions[$name]))throw new \LogicException('Future-feature tool is unregistered: '.$name.' for '.$key);
                    if(!$this->definitions[$name]->providerFree)throw new \LogicException('Future-feature handler must be provider-free: '.$name);
                }
            }
        }
    }

    /** Stable authorization-filtered discovery; no session- or page-dependent catalog. */
    public function visible(OperationActor $actor, ActorPolicy $policy): array
    {
        $policy->require($actor, []);
        return array_values(array_filter($this->all(), static function (CapabilityDefinition $definition) use ($actor, $policy): bool {
            try { $policy->require($actor, $definition->requiredScopes); return true; }
            catch (OperationException $e) { if ($e->errorCode !== 'permission_denied') throw $e; return false; }
        }));
    }

    /**
     * Resolver accepts only the registered handler ID and returns a trusted callable.
     * The handler receives (OperationActor, stdClass arguments, CapabilityDefinition).
     * User input can never select a PHP class, path, method or service.
     */
    public function dispatch(string $name, array|object $arguments, OperationActor $actor,
        ActorPolicy $policy, callable $handlerResolver): array
    {
        return ProviderCallPolicy::runExternal(function () use ($name, $arguments, $actor, $policy, $handlerResolver): array {
            $definition = $this->get($name);
            $policy->require($actor, $definition->requiredScopes);
            JsonSchema::validate($arguments, $definition->inputSchema);
            $handler = $handlerResolver($definition->handler);
            if (!is_callable($handler)) throw new \LogicException('Capability handler is not registered.');
            $result = $handler($actor, $arguments, $definition);
            if (!is_array($result) && !($result instanceof \stdClass)) throw new \LogicException('Capability returned an invalid result.');
            $normalized = JsonSchema::output($result);
            try { JsonSchema::validate($normalized, $definition->outputSchema); }
            catch (OperationException $e) { throw new \LogicException('Capability returned an invalid result contract.', 0, $e); }
            return (array) $normalized;
        });
    }
}
