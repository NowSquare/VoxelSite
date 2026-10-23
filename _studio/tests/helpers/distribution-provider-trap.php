<?php
declare(strict_types=1);
// Harness-only tripwires. Allow exactly the activation service's real same-server
// privacy probe while still counting/refusing all provider and Router dispatch.
namespace VoxelSite\Providers {
    function curl_init(?string $url=null):\CurlHandle|false{$GLOBALS['lifecycle_provider_attempts']++;throw new \RuntimeException('Provider connection attempted.');}
    function curl_exec(\CurlHandle $handle):string|bool{$GLOBALS['lifecycle_provider_attempts']++;throw new \RuntimeException('Provider dispatch attempted.');}
    function curl_multi_exec(\CurlMultiHandle $handle,int &$running):int{$GLOBALS['lifecycle_provider_attempts']++;throw new \RuntimeException('Parallel provider dispatch attempted.');}
}
namespace VoxelSite {
    function curl_init(?string $url=null):\CurlHandle|false {
        $caller=debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS,2)[1]??[];
        $base=$GLOBALS['distribution_privacy_base']??null;
        if(($caller['class']??null)!==WorkspaceAccessProbe::class || ($caller['function']??null)!=='request'
            || !is_string($base)||!is_string($url)||!str_starts_with($url,$base.'/_studio/')){
            $GLOBALS['lifecycle_provider_attempts']++;throw new \RuntimeException('Router or unrelated network connection attempted.');
        }
        $handle=\curl_init($url);
        if($handle!==false){$GLOBALS['distribution_privacy_handles']??=new \SplObjectStorage();$GLOBALS['distribution_privacy_handles'][$handle]=true;}
        return $handle;
    }
    function curl_exec(\CurlHandle $handle):string|bool {
        $caller=debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS,2)[1]??[];
        if(($caller['class']??null)!==WorkspaceAccessProbe::class || ($caller['function']??null)!=='request'
            || !isset($GLOBALS['distribution_privacy_handles']) || !isset($GLOBALS['distribution_privacy_handles'][$handle])){
            $GLOBALS['lifecycle_provider_attempts']++;throw new \RuntimeException('Router or unrelated network dispatch attempted.');
        }
        $GLOBALS['distribution_privacy_requests']=($GLOBALS['distribution_privacy_requests']??0)+1;
        return \curl_exec($handle);
    }
}
