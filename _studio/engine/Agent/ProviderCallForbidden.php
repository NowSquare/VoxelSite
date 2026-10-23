<?php
declare(strict_types=1);

namespace VoxelSite\Agent;

/** A policy refusal, never a provider outage or a successful skipped review. */
final class ProviderCallForbidden extends \RuntimeException
{
    public readonly string $errorCode;

    public function __construct(public readonly string $operation = 'provider_call')
    {
        $this->errorCode = 'provider_call_forbidden';
        parent::__construct(
            'Built-in AI calls are disabled for this external-agent operation. Use the connected agent to provide reasoning or review.',
            403
        );
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }
}
