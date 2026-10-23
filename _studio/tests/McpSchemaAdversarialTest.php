<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Agent\JsonSchema;
use VoxelSite\Agent\OperationException;

$checks = 0;
$failures = [];
function schemaCheck(bool $ok, string $label): void
{
    global $checks, $failures;
    $checks++;
    if (!$ok) $failures[] = $label;
    echo ($ok ? 'PASS ' : 'FAIL ') . $label . "\n";
}
function schemaReject(array $schema, string $label): void
{
    try { JsonSchema::assertSupported($schema); schemaCheck(false, $label); }
    catch (InvalidArgumentException) { schemaCheck(true, $label); }
}
function valueReject(mixed $value, array $schema, string $label): void
{
    try { JsonSchema::validate($value, $schema); schemaCheck(false, $label); }
    catch (OperationException $e) { schemaCheck($e->errorCode === 'invalid_schema', $label); }
}
function valueAccept(mixed $value, array $schema, string $label): void
{
    try { JsonSchema::assertSupported($schema); JsonSchema::validate($value, $schema); schemaCheck(true, $label); }
    catch (Throwable) { schemaCheck(false, $label); }
}

foreach ([
    'numeric string bound' => ['type' => 'number', 'minimum' => '4'],
    'null bound' => ['type' => 'string', 'maxLength' => null],
    'infinite bound' => ['type' => 'number', 'maximum' => INF],
    'string uniqueness flag' => ['type' => 'array', 'items' => ['type' => 'integer'], 'uniqueItems' => 'yes'],
    'associative type list' => ['type' => ['named' => 'string']],
    'duplicate type list' => ['type' => ['string', 'string']],
    'null type' => ['type' => null, 'const' => 1],
    'numeric description' => ['type' => 'string', 'description' => 1],
    'nested unsupported keyword without object type' => ['const' => 1, 'properties' => ['x' => ['$ref' => 'https://example.test/schema']]],
    'duplicate enum values' => ['enum' => [1, 1.0]],
    'non-JSON const' => ['const' => INF],
    'non-JSON default' => ['type' => 'number', 'default' => NAN],
    'invalid UTF-8 enum' => ['enum' => ["\xff"]],
    'custom header annotations' => ['type' => 'string', 'x-mcp-header' => 'Secret'],
] as $label => $schema) schemaReject($schema, 'Reject ' . $label);

$closed = ['type' => 'object', 'properties' => ['value' => ['type' => 'string']], 'additionalProperties' => false];
schemaReject($closed + ['required' => ['value', 'value']], 'Required names must be unique');
schemaReject($closed + ['required' => ['named' => 'value']], 'Required names must be a list');
schemaReject($closed + ['required' => [true]], 'Required names must be strings');
schemaReject(['type' => 'object', 'properties' => [], 'additionalProperties' => true], 'Open maps need an explicit property bound');
$map = ['type' => 'object', 'properties' => [], 'additionalProperties' => true, 'maxProperties' => 2];
valueAccept((object) ['name' => 'fixture', 'data' => (object) ['nested' => ['opaque']]], $map, 'Bounded dynamic map accepts downstream-validated values');
valueReject((object) ['one' => 1, 'two' => 2, 'three' => 3], $map, 'Dynamic map bound is enforced');
valueReject([], $map, 'Dynamic map still requires a JSON object');

$objectConst = ['const' => ['x' => 1, 'nested' => ['second' => true, 'first' => [1, 2]]]];
$value = json_decode('{"nested":{"first":[1,2],"second":true},"x":1.0}');
valueAccept($value, $objectConst, 'Compound const matches its advertised JSON wire value independent of object order');
valueReject((object) ['x' => 1, 'nested' => []], $objectConst, 'Compound const preserves object versus array distinction');
valueAccept($value, ['enum' => [null, ['x' => 1, 'nested' => ['first' => [1, 2], 'second' => true]]]], 'Compound enum matches advertised object value');
schemaReject(['enum' => [['x' => 1, 'y' => true], (object) ['y' => true, 'x' => 1.0]]], 'Equivalent compound enum values cannot duplicate');

$numbers = ['type' => 'array', 'items' => ['type' => 'number'], 'uniqueItems' => true, 'maxItems' => 25000];
valueReject([1, 1.0], $numbers, 'Numeric equality treats integer and equivalent float as duplicate');
valueReject([0, -0.0], $numbers, 'Numeric equality treats signed zero as duplicate');
valueAccept([9007199254740993, 9007199254740992.0], $numbers, 'Numeric equality does not round distinct large integers into a float');
valueAccept(range(1, 20000), $numbers, 'Large distinct lists validate without pairwise comparisons');
$objects = ['type' => 'array', 'items' => $map, 'uniqueItems' => true];
valueReject([(object) ['a' => 1, 'b' => 2], (object) ['b' => 2, 'a' => 1.0]], $objects, 'Object uniqueness ignores property order and respects numeric equality');
valueAccept([(object) ['a' => []], (object) ['a' => new stdClass()]], $objects, 'Object uniqueness preserves nested array versus object');
valueReject((object) ['value' => 'x', 'secret' => 'must not appear'], $closed, 'Root arguments remain closed');

$tooBroad = ['anyOf' => array_fill(0, 5000, ['const' => 1])];
schemaReject($tooBroad, 'Schema traversal has a finite node budget');
valueReject(range(1, 100001), ['type' => 'array', 'items' => ['type' => 'integer']], 'Runtime validation has a finite node budget');
echo "MCP schema adversarial: {$checks} checks, " . count($failures) . " failures\n";
exit($failures ? 1 : 0);
