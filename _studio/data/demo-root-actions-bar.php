<?php

declare(strict_types=1);

/**
 * Shared Demo Root-Actions-Bar Injection Helper
 *
 * Inlines the Actions Bar CSS+JS into root demo site HTML so
 * visitors see the same interactive action forms as in the
 * Studio preview iframe.
 *
 * Usage (from a root entrypoint, inside the demo rendering block):
 *
 *   require_once __DIR__ . '/_studio/data/demo-root-actions-bar.php';
 *   $content = vsDemoInjectActionsBar($content);
 */

/**
 * Inject the Actions Bar CSS+JS into HTML if the static files exist.
 *
 * @param string $html The rendered HTML content
 * @return string The HTML with Actions Bar CSS+JS injected before </body>
 */
function vsDemoInjectActionsBar(string $html): string
{
    $staticDir = dirname(__DIR__) . '/static';
    $css = @file_get_contents($staticDir . '/actions-bar.css');
    $js  = @file_get_contents($staticDir . '/actions-bar.js');

    if (empty($css) || empty($js)) {
        return $html;
    }

    $injection = "\n<!-- VoxelSite Actions Bar (Demo Root Site) -->\n"
        . "<style>\n{$css}\n</style>\n"
        . "<script>\n{$js}\n</script>\n";

    if (stripos($html, '</body>') !== false) {
        $html = str_ireplace('</body>', $injection . '</body>', $html);
    } else {
        $html .= $injection;
    }

    return $html;
}
