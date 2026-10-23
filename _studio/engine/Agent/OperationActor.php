<?php
declare(strict_types=1);

namespace VoxelSite\Agent;

/** Constructed by trusted authentication, never from a tool's arguments. */
final readonly class OperationActor
{
    public function __construct(
        public string $type,
        public int $userId,
        public ?int $credentialId,
        public array $scopes,
        public string $providerPolicy,
        public ?string $clientName,
    ) {
        if (!in_array($type, ['user', 'api_key', 'rest_key'], true) || $userId < 1
            || ($type !== 'user' && ($credentialId === null || $credentialId < 1))
            || ($type === 'user' && $credentialId !== null)
            || !in_array($providerPolicy, ['forbidden', 'studio_configured'], true)
            || ($type !== 'user' && $providerPolicy !== 'forbidden')) {
            throw new \InvalidArgumentException('Invalid operation actor.');
        }
        foreach ($scopes as $scope) {
            if (!is_string($scope)) throw new \InvalidArgumentException('Invalid actor scope.');
        }
    }

    public function identity(): string
    {
        return $this->type . ':' . ($this->credentialId ?? $this->userId);
    }

    public function attribution(): array
    {
        return ['type' => $this->type, 'user_id' => $this->userId,
            'credential_id' => $this->credentialId, 'client_name' => $this->clientName];
    }
}
