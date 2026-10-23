<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/engine/bootstrap.php';

use VoxelSite\Agent\CapabilityDefinition;
use VoxelSite\Agent\CapabilityRegistry;
use VoxelSite\Agent\JsonSchema;
use VoxelSite\Agent\OperationException;

$checks = 0;
function registryCheck(bool $ok, string $label): void {
    global $checks;
    $checks++;
    if (!$ok) { fwrite(STDERR, "FAIL {$label}\n"); exit(1); }
    echo "PASS {$label}\n";
}
function registryReject(callable $call, string $label): void {
    try { $call(); } catch (InvalidArgumentException|OperationException $e) { registryCheck(true, $label); return; }
    registryCheck(false, $label);
}
registryCheck(class_exists(CapabilityRegistry::class), 'Typed capability registry exists');
$input = ['type' => 'object', 'properties' => ['path' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 200],
    'limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100]],
    'required' => ['path'], 'additionalProperties' => false];
$output = ['type' => 'object', 'properties' => ['content' => ['type' => 'string']],
    'required' => ['content'], 'additionalProperties' => false];
$read = new CapabilityDefinition('voxelsite_files_read', $input, $output, ['files:read'],
    'read', 'files.read', true, ['studio.get.files.content'], 'Read one draft source. Use its hash before editing.');
$registry = new CapabilityRegistry([$read]);
registryCheck($registry->get($read->name) === $read, 'Lookup returns the registered definition');
registryReject(fn () => $registry->register($read), 'Duplicate names fail');
registryReject(fn () => new CapabilityDefinition('execute', $input, $output, [], 'read', 'files.read', true, [], 'Bad'), 'Tool names are namespaced');
registryReject(fn () => new CapabilityDefinition('voxelsite_bad', $input, $output, [], 'unknown', 'files.read', true, [], 'Bad'), 'Unknown effects fail');
registryReject(fn () => new CapabilityDefinition('voxelsite_prompt', $input, $output, ['files:write'], 'draft_write', 'prompt.run', false, [], 'Bad'), 'Provider-dependent handlers cannot register');
registryReject(fn () => new CapabilityDefinition('voxelsite_bad', ['type' => 'object'], $output, ['files:read'], 'read', 'files.read', true, [], 'Bad'), 'Unbounded object contracts fail registration');
JsonSchema::validate((object) ['path' => 'index.php', 'limit' => 10], $input);
registryReject(fn () => JsonSchema::validate((object) ['path' => 'index.php', 'secret' => true], $input), 'Unknown request fields fail');
registryReject(fn () => JsonSchema::validate((object) ['limit' => 10], $input), 'Missing required field fails');
registryReject(fn () => JsonSchema::validate((object) ['path' => '', 'limit' => 101], $input), 'String and numeric bounds fail');
registryReject(fn () => JsonSchema::validate((object) ['path' => 'x', 'limit' => 1.5], $input), 'Integer constraint rejects fractional input');
registryReject(fn () => JsonSchema::validate([], $input), 'JSON array cannot masquerade as request object');
registryReject(fn () => JsonSchema::validate((object) ['content' => 1], $output), 'Invalid service output fails validation');
$union = ['oneOf' => [
    ['type' => 'object', 'properties' => ['kind' => ['const' => 'delete']], 'required' => ['kind'], 'additionalProperties' => false],
    ['type' => 'object', 'properties' => ['kind' => ['const' => 'write'], 'body' => ['type' => 'string']], 'required' => ['kind','body'], 'additionalProperties' => false],
]];
JsonSchema::validate((object) ['kind' => 'delete'], $union);
registryReject(fn () => JsonSchema::validate((object) ['kind' => 'delete', 'body' => 'unexpected'], $union), 'Operation-specific fields remain strict');
registryCheck($read->tool()['annotations']['readOnlyHint'] === true, 'Read effect has truthful tool annotation');
registryCheck($read->tool()['annotations']['openWorldHint'] === false, 'Local reads do not imply external dispatch');
echo "Capability registry: {$checks} checks passed\n";
