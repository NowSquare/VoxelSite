<?php
declare(strict_types=1);

namespace VoxelSite\Agent;

final readonly class CapabilityDefinition
{
    public function __construct(
        public string $name,
        public array $inputSchema,
        public array $outputSchema,
        public array $requiredScopes,
        public string $effect,
        public string $handler,
        public bool $providerFree,
        public array $studioOperations,
        public string $description,
        public ?bool $destructiveHint = null,
        public ?bool $idempotentHint = null,
        public bool $openWorldHint = false,
    ) {
        if (!preg_match('/^voxelsite_[a-z][a-z0-9_]{0,100}$/D', $name)
            || !in_array($effect, ['read', 'prepare', 'draft_write', 'live_write', 'admin'], true)
            || !$providerFree || !preg_match('/^[a-z][a-z0-9_.]{1,100}$/D', $handler)
            || trim($description) === '' || strlen($description) > 4000 || !$requiredScopes) {
            throw new \InvalidArgumentException('Invalid capability definition.');
        }
        foreach ($requiredScopes as $scope) {
            if (!is_string($scope) || !preg_match('/^[a-z]+:[a-z_]+$/D', $scope)) throw new \InvalidArgumentException('Invalid capability scope.');
        }
        foreach ($studioOperations as $operation) {
            if (!is_string($operation) || !preg_match('/^[a-z][a-z0-9_.-]+$/D', $operation)) throw new \InvalidArgumentException('Invalid Studio operation mapping.');
        }
        if (($inputSchema['type'] ?? null) !== 'object' || ($outputSchema['type'] ?? null) !== 'object') {
            throw new \InvalidArgumentException('Tool inputs and outputs must be objects.');
        }
        JsonSchema::assertSupported($inputSchema);
        JsonSchema::assertSupported($outputSchema);
    }

    public function tool(): array
    {
        return [
            'name' => $this->name, 'description' => $this->description,
            'inputSchema' => self::schemaForWire($this->inputSchema),
            'outputSchema' => self::schemaForWire($this->outputSchema),
            'annotations' => [
                'readOnlyHint' => $this->effect === 'read',
                'destructiveHint' => $this->effect === 'read' ? false : ($this->destructiveHint ?? true),
                'idempotentHint' => $this->effect === 'read' ? true : ($this->idempotentHint ?? false),
                'openWorldHint' => $this->openWorldHint,
            ],
        ];
    }

    private static function schemaForWire(array $schema): array
    {
        if (isset($schema['properties'])) {
            $properties = [];
            foreach ($schema['properties'] as $key => $child) $properties[$key] = self::schemaForWire($child);
            $schema['properties'] = (object) $properties;
        }
        if (isset($schema['items'])) $schema['items'] = self::schemaForWire($schema['items']);
        if (is_array($schema['additionalProperties'] ?? null)) $schema['additionalProperties'] = self::schemaForWire($schema['additionalProperties']);
        foreach (['oneOf', 'anyOf'] as $union) {
            if (isset($schema[$union])) $schema[$union] = array_map(self::schemaForWire(...), $schema[$union]);
        }
        return $schema;
    }
}
