<?php
declare(strict_types=1);

namespace VoxelSite\Agent;

if (!class_exists(ProviderCallForbidden::class)) { require_once __DIR__ . '/ProviderCallForbidden.php'; }

/**
 * Request-local boundary for VoxelSite-managed model and Router calls.
 *
 * PHP request state is independent of saved settings and other HTTP requests.
 * Every request/continuation must enter its own scope. Nested helpers can only
 * restrict the current scope; an allowed policy cannot weaken an outer refusal.
 * This does not sandbox network access by arbitrary customer PHP.
 */
final class ProviderCallPolicy
{
    private static int $forbiddenDepth = 0;

    private function __construct(public readonly string $mode) {}

    public static function externalOnly(): self
    {
        return new self('forbidden');
    }

    public static function permitted(): self
    {
        return new self('allowed');
    }

    public function isForbidden(): bool
    {
        return $this->mode === 'forbidden';
    }

    public static function runExternal(callable $callback): mixed
    {
        return self::externalOnly()->run($callback);
    }

    public function run(callable $callback): mixed
    {
        $forbidden = $this->isForbidden();
        if ($forbidden) { self::$forbiddenDepth++; }
        try {
            return $callback();
        } finally {
            if ($forbidden) { self::$forbiddenDepth--; }
        }
    }

    public static function assertAllowed(string $operation = 'provider_call'): void
    {
        if (self::$forbiddenDepth > 0) {
            throw new ProviderCallForbidden($operation);
        }
    }
}
