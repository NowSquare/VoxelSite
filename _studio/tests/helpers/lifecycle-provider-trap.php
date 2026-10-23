<?php
declare(strict_types=1);

// Test-only tripwires at the namespaces used by the shipped transports.
// They fail locally before any socket can reach a provider.
namespace VoxelSite\Providers {
    function curl_init(?string $url = null): \CurlHandle|false {
        $GLOBALS['lifecycle_provider_attempts']++;
        throw new \RuntimeException('Lifecycle attempted a provider connection.');
    }
    function curl_exec(\CurlHandle $handle): string|bool {
        $GLOBALS['lifecycle_provider_attempts']++;
        throw new \RuntimeException('Lifecycle attempted a provider dispatch.');
    }
    function curl_multi_exec(\CurlMultiHandle $handle, int &$running): int {
        $GLOBALS['lifecycle_provider_attempts']++;
        throw new \RuntimeException('Lifecycle attempted a parallel provider dispatch.');
    }
}
namespace VoxelSite {
    function curl_init(?string $url = null): \CurlHandle|false {
        $GLOBALS['lifecycle_provider_attempts']++;
        throw new \RuntimeException('Lifecycle attempted a Router connection.');
    }
    function curl_exec(\CurlHandle $handle): string|bool {
        $GLOBALS['lifecycle_provider_attempts']++;
        throw new \RuntimeException('Lifecycle attempted a Router dispatch.');
    }
}
