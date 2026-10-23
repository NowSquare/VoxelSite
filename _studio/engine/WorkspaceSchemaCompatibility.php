<?php
declare(strict_types=1);

namespace VoxelSite;

/** Exact generated 1.32.0 template compatibility, never a custom-PHP rewrite. */
final class WorkspaceSchemaCompatibility
{
    public const PATH = '_partials/schema.php';
    public const BEFORE = '3ed8baec160d3c89b82a8f06bf5a10e75e74621c0291af1e71eb241757e2fe0e';
    public const AFTER = 'eef1d3bdd2b55582f34da009d9658fa549368d3378dbe0b5939c47c9da8a8ce5';

    public static function replacement(string $path, string $source): ?string
    {
        // 479d356 AEOGenerator::generateSchemaPartial(), the complete nowdoc.
        if ($path !== self::PATH || !hash_equals(self::BEFORE, hash('sha256', $source))) return null;
        $replacement = str_replace("\$_SERVER['DOCUMENT_ROOT']", 'dirname(__DIR__)', $source, $count);
        if ($count !== 2 || !hash_equals(self::AFTER, hash('sha256', $replacement))) {
            throw new \RuntimeException('workspace_migration_corrupt: Canonical schema conversion differs from its reviewed target.');
        }
        return $replacement;
    }

    /** Validate retained originals before allowing either forward or reverse writes. */
    public static function receipt(string $path, mixed $receipt): array
    {
        if (!is_array($receipt) || count($receipt) !== 4
            || ($receipt['before_sha256'] ?? null) !== self::BEFORE
            || ($receipt['after_sha256'] ?? null) !== self::AFTER
            || !is_string($receipt['before_base64'] ?? null) || strlen($receipt['before_base64']) !== 8524
            || !is_int($receipt['mode'] ?? null) || $receipt['mode'] < 0 || $receipt['mode'] > 0777) {
            throw new \RuntimeException('workspace_migration_corrupt: Invalid canonical schema receipt.');
        }
        $before = base64_decode($receipt['before_base64'], true);
        $after = is_string($before) ? self::replacement($path, $before) : null;
        if ($after === null) throw new \RuntimeException('workspace_migration_corrupt: Schema receipt does not contain the known original.');
        return ['before' => $before, 'after' => $after, 'mode' => $receipt['mode']];
    }
}
