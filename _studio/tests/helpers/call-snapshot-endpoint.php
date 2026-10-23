<?php
declare(strict_types=1);
// Preserve the legacy helper interface; requests use current reviewed restoration.
$argv=[$argv[0],dirname($argv[1]),'POST',$argv[4],$argv[5] ?? ''];
require __DIR__.'/call-snapshot-retention-endpoint.php';
