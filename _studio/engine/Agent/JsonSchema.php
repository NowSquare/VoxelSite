<?php
declare(strict_types=1);

namespace VoxelSite\Agent;

/**
 * Validates the deliberately small JSON Schema vocabulary used by our tools.
 * Unknown schema keywords fail at registration; they never silently stop enforcing a contract.
 * Request objects stay stdClass so an empty JSON array cannot pass as an object.
 */
final class JsonSchema
{
    private const KEYWORDS = ['type', 'properties', 'required', 'additionalProperties', 'items',
        'minItems', 'maxItems', 'uniqueItems', 'minLength', 'maxLength', 'pattern',
        'minimum', 'maximum', 'minProperties', 'maxProperties', 'enum', 'const', 'oneOf', 'anyOf', 'description', 'title', 'default'];
    private const TYPES = ['object', 'array', 'string', 'integer', 'number', 'boolean', 'null'];
    private const MAX_SCHEMA_NODES = 4096;
    private const MAX_VALIDATION_NODES = 100000;

    public static function assertSupported(array $schema, int $depth = 0): void
    {
        $remaining = self::MAX_SCHEMA_NODES;
        self::checkSchema($schema, $depth, $remaining);
    }

    private static function checkSchema(array $schema, int $depth, int &$remaining): void
    {
        if ($depth > 32 || --$remaining < 0 || $schema === [] || array_diff(array_keys($schema), self::KEYWORDS)) {
            throw new \InvalidArgumentException('Unsupported or empty capability schema.');
        }
        $types = [];
        if (array_key_exists('type', $schema)) {
            $types = is_string($schema['type']) ? [$schema['type']] : $schema['type'];
            if (!is_array($types) || !array_is_list($types) || !$types
                || array_filter($types, static fn ($type) => !is_string($type) || !in_array($type, self::TYPES, true))
                || count($types) !== count(array_unique($types, SORT_STRING))) {
                throw new \InvalidArgumentException('Unsupported schema type.');
            }
        }
        if (!$types && !array_key_exists('const', $schema)
            && !isset($schema['enum']) && !isset($schema['oneOf']) && !isset($schema['anyOf'])) {
            throw new \InvalidArgumentException('Schema must constrain a type or value.');
        }
        if (in_array('object', $types, true)) {
            if (!isset($schema['properties']) || !is_array($schema['properties'])
                || !array_key_exists('additionalProperties', $schema)
                || ($schema['additionalProperties'] !== false && !is_array($schema['additionalProperties'])
                    && !($schema['additionalProperties'] === true && isset($schema['maxProperties'])))) {
                throw new \InvalidArgumentException('Object schemas require explicit properties and a closed or typed remainder.');
            }
        }
        // Validate every schema-bearing keyword, even where another keyword
        // (const/enum/union) supplies the type constraint.
        if (array_key_exists('properties', $schema)) {
            if (!is_array($schema['properties'])) throw new \InvalidArgumentException('Invalid object properties.');
            foreach ($schema['properties'] as $key => $child) {
                if (!is_string($key) || !is_array($child)) throw new \InvalidArgumentException('Invalid object schema.');
                self::checkSchema($child, $depth + 1, $remaining);
            }
        }
        if (array_key_exists('additionalProperties', $schema)) {
            if (is_array($schema['additionalProperties'])) {
                self::checkSchema($schema['additionalProperties'], $depth + 1, $remaining);
            } elseif ($schema['additionalProperties'] !== false
                && !($schema['additionalProperties'] === true && isset($schema['maxProperties']))) {
                throw new \InvalidArgumentException('An open map needs a property bound.');
            }
        }
        if (array_key_exists('required', $schema)) {
            $required = $schema['required'];
            if (!is_array($required) || !array_is_list($required)
                || array_filter($required, static fn ($key) => !is_string($key))
                || count($required) !== count(array_unique($required, SORT_STRING))
                || array_diff($required, array_keys($schema['properties'] ?? []))) {
                throw new \InvalidArgumentException('Required properties must be a unique list of declared names.');
            }
        }
        if (in_array('array', $types, true) && !array_key_exists('items', $schema)) {
            throw new \InvalidArgumentException('Array items need a schema.');
        }
        if (array_key_exists('items', $schema)) {
            if (!is_array($schema['items'])) throw new \InvalidArgumentException('Array items need a schema.');
            self::checkSchema($schema['items'], $depth + 1, $remaining);
        }
        foreach (['oneOf', 'anyOf'] as $union) {
            if (!array_key_exists($union, $schema)) continue;
            if (!is_array($schema[$union]) || !array_is_list($schema[$union]) || count($schema[$union]) < 1) {
                throw new \InvalidArgumentException('Invalid union schema.');
            }
            foreach ($schema[$union] as $branch) {
                if (!is_array($branch)) throw new \InvalidArgumentException('Invalid union branch.');
                self::checkSchema($branch, $depth + 1, $remaining);
            }
        }
        foreach (['minItems', 'maxItems', 'minLength', 'maxLength', 'minProperties', 'maxProperties'] as $bound) {
            if (array_key_exists($bound, $schema) && (!is_int($schema[$bound]) || $schema[$bound] < 0)) {
                throw new \InvalidArgumentException('Invalid schema bound.');
            }
        }
        foreach (['minimum', 'maximum'] as $bound) {
            if (array_key_exists($bound, $schema) && ((!is_int($schema[$bound]) && !is_float($schema[$bound]))
                || !is_finite((float) $schema[$bound]))) {
                throw new \InvalidArgumentException('Invalid number bound.');
            }
        }
        if (array_key_exists('uniqueItems', $schema) && !is_bool($schema['uniqueItems'])) {
            throw new \InvalidArgumentException('Invalid uniqueness flag.');
        }
        foreach (['description', 'title'] as $annotation) {
            if (array_key_exists($annotation, $schema) && (!is_string($schema[$annotation]) || !mb_check_encoding($schema[$annotation], 'UTF-8'))) {
                throw new \InvalidArgumentException('Invalid schema annotation.');
            }
        }
        if (array_key_exists('pattern', $schema) && (!is_string($schema['pattern']) || @preg_match(self::pattern($schema['pattern']), '') === false)) {
            throw new \InvalidArgumentException('Invalid schema pattern.');
        }
        foreach (['const', 'default'] as $valueKeyword) {
            if (array_key_exists($valueKeyword, $schema)) self::schemaValue($schema[$valueKeyword]);
        }
        if (array_key_exists('enum', $schema)) {
            if (!is_array($schema['enum']) || !array_is_list($schema['enum']) || !$schema['enum']) {
                throw new \InvalidArgumentException('Invalid enum schema.');
            }
            $seen = [];
            foreach ($schema['enum'] as $item) {
                $key = self::identity(self::schemaValue($item));
                if (isset($seen[$key])) throw new \InvalidArgumentException('Enum values must be unique.');
                $seen[$key] = true;
            }
        }
    }

    public static function validate(mixed $value, array $schema, string $path = '$', int $depth = 0): void
    {
        $remaining = self::MAX_VALIDATION_NODES;
        self::checkValue($value, $schema, $path, $depth, $remaining);
    }

    private static function checkValue(mixed $value, array $schema, string $path, int $depth, int &$remaining): void
    {
        if ($depth > 64 || --$remaining < 0) self::fail($path, 'exceeds the validation limit');
        foreach (['oneOf', 'anyOf'] as $union) {
            if (!isset($schema[$union])) continue;
            $matches = 0;
            foreach ($schema[$union] as $branch) {
                try { self::checkValue($value, $branch, $path, $depth + 1, $remaining); $matches++; }
                catch (OperationException $e) { if ($e->errorCode !== 'invalid_schema') throw $e; }
                if ($remaining < 0) self::fail($path, 'exceeds the validation limit');
                if ($union === 'anyOf' && $matches === 1) break;
                if ($union === 'oneOf' && $matches > 1) self::fail($path, 'matches more than one permitted shape');
            }
            if ($matches < 1 || ($union === 'oneOf' && $matches !== 1)) self::fail($path, 'does not match a permitted shape');
        }
        if (array_key_exists('const', $schema) && self::identity($value) !== self::identity(self::schemaValue($schema['const']))) self::fail($path, 'has an unexpected value');
        if (isset($schema['enum'])) {
            $key = self::identity($value);
            $found = false;
            foreach ($schema['enum'] as $item) {
                if ($key === self::identity(self::schemaValue($item))) { $found = true; break; }
            }
            if (!$found) self::fail($path, 'is not an allowed value');
        }
        if (isset($schema['type'])) {
            $matches = array_filter((array) $schema['type'], static fn ($type) => match ($type) {
                'object' => $value instanceof \stdClass,
                'array' => is_array($value) && array_is_list($value),
                'string' => is_string($value),
                'integer' => is_int($value) || (is_float($value) && is_finite($value) && floor($value) === $value),
                'number' => (is_int($value) || is_float($value)) && is_finite((float) $value),
                'boolean' => is_bool($value),
                'null' => $value === null,
                default => false,
            });
            if (!$matches) self::fail($path, 'has the wrong type');
        }
        if ($value instanceof \stdClass) {
            $values = get_object_vars($value);
            if (count($values) < ($schema['minProperties'] ?? 0) || count($values) > ($schema['maxProperties'] ?? PHP_INT_MAX)) self::fail($path, 'has too many or too few properties');
            foreach ($schema['required'] ?? [] as $key) {
                if (!array_key_exists($key, $values)) self::fail($path . '.' . $key, 'is required');
            }
            foreach ($values as $key => $item) {
                $child = $schema['properties'][$key] ?? $schema['additionalProperties'] ?? true;
                if ($child === false) self::fail($path . '.' . $key, 'is not permitted');
                if (is_array($child)) self::checkValue($item, $child, $path . '.' . $key, $depth + 1, $remaining);
            }
        }
        if (is_array($value)) {
            if (count($value) < ($schema['minItems'] ?? 0) || count($value) > ($schema['maxItems'] ?? PHP_INT_MAX)) self::fail($path, 'has too many or too few items');
            foreach ($value as $key => $item) {
                if (isset($schema['items'])) self::checkValue($item, $schema['items'], $path . '[' . $key . ']', $depth + 1, $remaining);
            }
            if ($schema['uniqueItems'] ?? false) {
                $seen = [];
                foreach ($value as $item) {
                    $key = self::identity($item);
                    if (isset($seen[$key])) self::fail($path, 'contains repeated items');
                    $seen[$key] = true;
                }
            }
        }
        if (is_string($value)) {
            if (!mb_check_encoding($value, 'UTF-8')) self::fail($path, 'must be valid UTF-8');
            $length = mb_strlen($value, 'UTF-8');
            if ($length < ($schema['minLength'] ?? 0) || $length > ($schema['maxLength'] ?? PHP_INT_MAX)) self::fail($path, 'is outside the text length limit');
            if (isset($schema['pattern']) && preg_match(self::pattern($schema['pattern']), $value) !== 1) self::fail($path, 'has an invalid format');
        }
        if (is_int($value) || is_float($value)) {
            if (!is_finite((float) $value) || $value < ($schema['minimum'] ?? -INF) || $value > ($schema['maximum'] ?? INF)) self::fail($path, 'is outside the numeric limit');
        }
    }

    /** Normalize trusted PHP output, preserving the JSON object/array distinction. */
    public static function output(array|object $value): \stdClass
    {
        $result = json_decode(json_encode((object) $value, JSON_THROW_ON_ERROR | JSON_INVALID_UTF8_SUBSTITUTE),
            false, 64, JSON_THROW_ON_ERROR);
        return $result;
    }

    /** Constants use exactly the JSON representation advertised by tool(). */
    private static function schemaValue(mixed $value): mixed
    {
        try {
            return json_decode(json_encode($value, JSON_THROW_ON_ERROR), false, 64, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            throw new \InvalidArgumentException('Schema values must be representable as JSON.', 0, $e);
        }
    }

    /**
     * Linear-size fingerprints for JSON Schema equality. Distinct PHP integers
     * must not be rounded through float; integral floats use their actual
     * decimal value. Object key order is irrelevant, array order is significant.
     */
    private static function identity(mixed $value, int $depth = 0): string
    {
        if ($depth > 64) self::fail('$', 'nesting is too deep');
        if ($value instanceof \stdClass) {
            $properties = get_object_vars($value);
            ksort($properties, SORT_STRING);
            $parts = [];
            foreach ($properties as $key => $item) $parts[] = [(string) $key, self::identity($item, $depth + 1)];
            $identity = ['object', $parts];
        } elseif (is_array($value) && array_is_list($value)) {
            $parts = [];
            foreach ($value as $item) $parts[] = self::identity($item, $depth + 1);
            $identity = ['array', $parts];
        } elseif (is_int($value) || is_float($value)) {
            if (!is_finite((float) $value)) self::fail('$', 'is outside the numeric limit');
            $number = is_int($value) ? (string) $value : ($value == 0 ? '0'
                : (floor($value) === $value ? sprintf('%.0F', $value) : json_encode($value, JSON_THROW_ON_ERROR)));
            $identity = ['number', $number];
        } elseif (is_string($value) && mb_check_encoding($value, 'UTF-8')) {
            $identity = ['string', $value];
        } elseif (is_bool($value) || $value === null) {
            $identity = ['literal', $value];
        } else {
            self::fail('$', 'must be a JSON value');
        }
        return hash('sha256', json_encode($identity, JSON_THROW_ON_ERROR));
    }

    private static function pattern(string $pattern): string { return '~' . str_replace('~', '\\~', $pattern) . '~u'; }

    private static function fail(string $path, string $reason): never
    {
        // Never include submitted values: callers may have accidentally pasted a secret.
        throw new OperationException('invalid_schema', 'Check the tool arguments: ' . $path . ' ' . $reason . '.', ['field' => $path]);
    }
}
