<?php
declare(strict_types=1);

namespace VoxelSite\Agent;

/** A safe, actionable application error. Transport errors stay in the MCP adapter. */
class OperationException extends \RuntimeException
{
    public function __construct(
        public readonly string $errorCode,
        string $message,
        public readonly array $details = [],
    ) {
        parent::__construct($message);
    }
}
