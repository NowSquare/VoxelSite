<?php
declare(strict_types=1);
// VOXELSITE_UPDATE_GATE_V1 — stable bridge contract, excluded from system replacement.
$factoryGate=__DIR__.'/factory-reset-gate.php';
if(is_file($factoryGate)&&!is_link($factoryGate))require_once $factoryGate;
if(!defined('VOXELSITE_UPDATE_RUNTIME_INTERNAL')&&(file_exists(__DIR__.'/data/updates/active.json')||is_link(__DIR__.'/data/updates/active.json'))){
    require __DIR__.'/update-runtime.php';
    exit;
}
