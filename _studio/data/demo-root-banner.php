<?php

declare(strict_types=1);

/**
 * Shared Demo Root-Banner Helper
 *
 * Used by ALL root entrypoints (index.php, default-index.php,
 * default-unpublish-index.php) to decide whether the "This is
 * a demo preview / Open Studio →" banner should be shown.
 *
 * Centralises the hide_banner=true parsing and the banner HTML
 * so the three files can't drift out of sync.
 *
 * Usage (from a root entrypoint, inside the demo rendering block):
 *
 *   require_once __DIR__ . '/_studio/data/demo-root-banner.php';
 *   // — OR from _studio/data/ siblings: —
 *   require_once __DIR__ . '/demo-root-banner.php';
 *
 *   $hideBanner = vsDemoShouldHideBanner($demoFile);
 *   $bannerHtml = vsDemoRootBannerHtml($hideBanner);
 */

/**
 * Parse the .demo file and return true if hide_banner=true is set.
 *
 * @param string $demoFilePath Absolute path to the .demo file
 * @return bool
 */
function vsDemoShouldHideBanner(string $demoFilePath): bool
{
    $contents = @file_get_contents($demoFilePath);
    if ($contents === false) {
        return false;
    }
    return (bool) preg_match('/^\s*hide_banner\s*=\s*true\s*$/mi', $contents);
}

/**
 * Return the demo root-banner HTML, or empty string when suppressed.
 *
 * @param bool $hide If true, return '' (banner suppressed)
 * @return string Ready-to-inject HTML
 */
function vsDemoRootBannerHtml(bool $hide): string
{
    if ($hide) {
        return '';
    }

    return '<div style="position:fixed;bottom:0;left:0;right:0;z-index:9999;'
        . 'background:rgba(14,14,17,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);'
        . 'border-top:1px solid rgba(255,255,255,0.08);padding:10px 20px;'
        . 'display:flex;align-items:center;justify-content:center;gap:12px;'
        . 'font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;color:rgba(232,230,225,0.7);">'
        . '<span>This is a demo preview</span>'
        . '<a href="/_studio/" style="display:inline-flex;align-items:center;gap:6px;'
        . 'padding:6px 14px;border-radius:6px;background:rgba(244,160,36,0.15);'
        . 'color:#f4a024;text-decoration:none;font-weight:500;font-size:12px;'
        . 'border:1px solid rgba(244,160,36,0.25);transition:all 0.15s ease;" '
        . 'onmouseover="this.style.background=\'rgba(244,160,36,0.25)\'" '
        . 'onmouseout="this.style.background=\'rgba(244,160,36,0.15)\'">'
        . 'Open Studio →</a></div>';
}
