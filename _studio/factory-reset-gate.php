<?php
declare(strict_types=1);
// VOXELSITE_FACTORY_RESET_GATE_V1 — runs before config, autoload and database creation.
$factoryMarker=__DIR__.'/data/factory-resets/active.json';
if(!defined('VOXELSITE_FACTORY_RUNTIME_INTERNAL')&&(file_exists($factoryMarker)||is_link($factoryMarker))){
    if(str_contains($_SERVER['HTTP_ACCEPT']??'','text/html')){
        require __DIR__.'/factory-reset.php';
    }else{
        http_response_code(503);header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');
        echo json_encode(['ok'=>false,'error'=>['code'=>'installation_maintenance',
            'message'=>'Installation cleanup is active. Open its retained Studio completion receipt.']]);
    }
    exit;
}
