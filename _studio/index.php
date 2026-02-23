<?php

declare(strict_types=1);

/**
 * VoxelSite Studio — SPA Entry Point
 *
 * This is the single HTML page that serves the entire Studio admin
 * interface. All navigation happens client-side via hash routing.
 * The PHP here is minimal: check installation status, then serve
 * the HTML shell.
 */

require_once __DIR__ . '/engine/bootstrap.php';

// ── Redirect to installer if not set up ──
if (!isInstalled()) {
    header('Location: /_studio/install.php');
    exit;
}

// ── Resolve asset paths relative to _studio ──
$basePath = '/_studio';
$isDemo = \VoxelSite\DemoMode::isActive();
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark"<?= $isDemo ? ' data-demo="true"' : '' ?>>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <meta name="voxelsite-studio" content="true">
  <meta name="color-scheme" content="dark light">

  <title>Studio — VoxelSite</title>
  <link rel="icon" href="<?= $basePath ?>/ui/favicon.ico" type="image/x-icon">

  <!-- Fonts: self-hosted Inter variable (no external requests) -->
  <link rel="stylesheet" href="<?= $basePath ?>/ui/fonts/inter/inter.css">

  <!-- Studio CSS: compiled Tailwind (no runtime, no CDN) -->
  <link rel="stylesheet" href="<?= $basePath ?>/ui/dist/studio.css?v=<?= filemtime(__DIR__ . '/ui/dist/studio.css') ?>">

  <!-- Prevent FOUC: apply saved theme before paint -->
  <script>
    (function() {
      var t = localStorage.getItem('vs-theme');
      if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', t);
    })();
  </script>
</head>
<body class="bg-vs-bg-base text-vs-text-primary min-h-screen">

  <!-- The SPA mounts here -->
  <div id="app"></div>

  <!-- Vendored libraries (no CDN, no npm at runtime) -->
  <script src="<?= $basePath ?>/ui/lib/marked.min.js" defer></script>
  <script src="<?= $basePath ?>/ui/lib/prism.min.js" defer></script>

  <!-- Studio application — single bundle built by esbuild -->
  <script src="<?= $basePath ?>/ui/dist/studio.js?v=<?= filemtime(__DIR__ . '/ui/dist/studio.js') ?>" defer></script>

</body>
</html>
