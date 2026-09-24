<?php

declare(strict_types=1);

namespace VoxelSite;

/** TypeSafe-only redaction at settings, diagnostic, and prompt-log boundaries. */
final class RouterSecrets
{
    public const KEY = 'governor.typesafe_api_key';

    /** Request-local values; never persisted or serialized. */
    private static array $values = [];

    public static function remember(#[\SensitiveParameter] mixed $value): void
    {
        if (is_string($value) && $value !== '') {
            self::$values[$value] = '[redacted]';
            // Also protect values embedded in serialized JSON or exception text.
            $encoded = json_encode($value);
            if ($encoded !== false) { self::$values[substr($encoded, 1, -1)] = '[redacted]'; }
        }
    }

    public static function redact(#[\SensitiveParameter] mixed $value, int $depth = 0): mixed
    {
        if ($depth > 16) { return '[omitted: nesting limit]'; }
        if (is_array($value)) {
            $safe = [];
            foreach ($value as $key => $item) {
                if (in_array($key, [self::KEY, 'typesafe_api_key'], true)) { continue; }
                if (is_string($key) && strtr($key, self::$values) !== $key) { continue; }
                $safe[$key] = self::redact($item, $depth + 1);
            }
            return $safe;
        }
        if (!is_string($value)) { return $value; }
        // prompt_log.action_data is JSON text, not an array at the DB boundary.
        $decoded = json_decode($value, true);
        if (is_array($decoded)) {
            $safe = self::redact($decoded, $depth + 1);
            if ($safe !== $decoded) {
                return json_encode($safe, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
            }
        }
        return self::$values === [] ? $value : strtr($value, self::$values);
    }
}
