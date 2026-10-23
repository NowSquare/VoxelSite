<?php
declare(strict_types=1);
require __DIR__.'/McpApplicationTest.php';

use VoxelSite\Agent\{CanonicalJson, ProtocolProfile, WorkspaceFiles};

foreach (range(1, 25) as $index) {
    file_put_contents($root.'/draft/assets/data/archive-fixture-'.$index.'.json', '{"fixture":true}');
}
$before = [$workspace->status(), WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)),
    VoxelSite\SiteWorkspace::inventory($root.'/live')];
foreach (ProtocolProfile::versions() as $protocol) {
    $names = array_column($call('tools/list', [], $key, $protocol)['body']['result']['tools'], 'name');
    appCheck(in_array('voxelsite_snapshots_delete_review', $names, true)
        && in_array('voxelsite_snapshots_delete', $names, true), $protocol.': exact snapshot deletion tools are advertised');
}
$readNames = array_column($call('tools/list', [], $readKey)['body']['result']['tools'], 'name');
appCheck(in_array('voxelsite_snapshots_delete_review', $readNames, true)
    && !in_array('voxelsite_snapshots_delete', $readNames, true), 'Read connection sees deletion review without removal authority');
$capture = $finish($tool('voxelsite_snapshots_create', [
    'operation_id' => 'binding-delete-capture', 'domain' => 'draft', 'label' => 'Disposable deletion review',
]), 'binding-delete-capture');
$id = $capture['result']['snapshot_id'];
$review = $tool('voxelsite_snapshots_delete_review', ['snapshot_id' => $id]);
appCheck(!$review['protected'] && count($review['files']) > 20, 'Deletion review exposes exact bounded archive hashes');
$input = ['operation_id' => 'binding-delete-archive', 'snapshot_id' => $id, 'version' => $review['version']];
$state = $tool('voxelsite_snapshots_delete', $input);
appCheck($state['status'] === 'applying', 'Archive removal returns a bounded checkpoint through the MCP contract');
$done = $finish($state, $input['operation_id']);
appCheck($done['status'] === 'succeeded' && $done['result']['deleted'] === true
    && $done['result']['files_deleted'] === count($review['files']), 'Generic continuation completes the exact snapshot deletion');
appCheck(CanonicalJson::digest($tool('voxelsite_snapshots_delete', $input)) === CanonicalJson::digest($done),
    'Lost final acknowledgement returns the original result after archive removal');
$protected = $tool('voxelsite_snapshots_delete_review', ['snapshot_id' => $snapshotId]);
appCheck($protected['protected'] && $protected['version'] === null,
    'A snapshot referenced by restoration remains visibly protected');
appCheck($before === [$workspace->status(), WorkspaceFiles::hashes(WorkspaceFiles::read($workspace)),
    VoxelSite\SiteWorkspace::inventory($root.'/live')], 'Snapshot removal preserves draft version, source and live bytes');
appCheck($GLOBALS['lifecycle_provider_attempts'] === 0, 'Snapshot deletion wire calls never invoke a provider');
echo "MCP snapshot deletion binding: {$checks} combined checks passed\n";
