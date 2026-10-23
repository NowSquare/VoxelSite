<?php
declare(strict_types=1);
namespace VoxelSite\Agent;

/** Deterministic application identity, preserving JSON objects versus arrays. */
final class CanonicalJson
{
    public static function encode(mixed $value): string
    {
        return json_encode(self::sort($value), JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION);
    }
    public static function digest(mixed $value): string { return hash('sha256', self::encode($value)); }
    private static function sort(mixed $value): mixed
    {
        if ($value instanceof \stdClass) {
            $items = get_object_vars($value); ksort($items, SORT_STRING);
            foreach ($items as &$item) $item = self::sort($item);
            return (object) $items;
        }
        if (is_array($value)) {
            if (!array_is_list($value)) ksort($value, SORT_STRING);
            foreach ($value as &$item) $item = self::sort($item);
        }
        return $value;
    }
}
