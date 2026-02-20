<?php

declare(strict_types=1);

/**
 * VoxelSite Installation Wizard
 *
 * Standalone page (not inside the SPA). This is the buyer's very
 * first experience. Four steps:
 *
 * 1. Requirements check (PHP version, extensions, permissions)
 * 2. AI configuration (API key, model selection, connection test)
 * 3. Admin account creation (name, email, password)
 * 4. Site setup (name, tagline, starting mode)
 *
 * After completion: creates database, seeds settings, creates admin
 * user, generates APP_KEY, writes config.json, redirects to Studio.
 *
 * Security: exits immediately if already installed.
 */

require_once __DIR__ . '/engine/bootstrap.php';

// ── Already installed? Get out. ──
if (isInstalled()) {
    header('Location: /_studio/');
    exit;
}

// ── Resolve asset path ──
$basePath = '/_studio';
?>
<!DOCTYPE html>
<html lang="en" data-theme="forge">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">

  <title>Install — VoxelSite</title>
  <link rel="icon" href="<?= $basePath ?>/ui/favicon.ico" type="image/x-icon">

  <link rel="stylesheet" href="<?= $basePath ?>/ui/fonts/inter/inter.css">
  <link rel="stylesheet" href="<?= $basePath ?>/ui/dist/studio.css?v=<?= filemtime(__DIR__ . '/ui/dist/studio.css') ?>">

  <script>
    (function() {
      var t = localStorage.getItem('vs-theme');
      if (!t) t = 'forge';
      document.documentElement.setAttribute('data-theme', t);
    })();
  </script>
</head>
<body class="bg-vs-bg-base text-vs-text-primary min-h-screen flex items-center justify-center p-6">

  <!-- Faint forge glow behind the card -->
  <div class="fixed inset-0 pointer-events-none" aria-hidden="true"
       style="background: radial-gradient(circle at 50% 50%, rgba(244,160,36,0.03) 0%, transparent 70%);"></div>

  <!-- Installer card -->
  <div id="installer" class="relative w-full max-w-[520px]">
    <!-- Content will be rendered by the installer JS module -->
    <noscript>
      <div class="bg-vs-bg-surface border border-vs-border-subtle rounded-2xl shadow-xl p-10 text-center">
        <p class="text-vs-text-secondary">VoxelSite requires JavaScript to install. Please enable JavaScript and refresh.</p>
      </div>
    </noscript>
  </div>

  <!-- Installer script (standalone, not part of the SPA) -->
  <script type="module" src="<?= $basePath ?>/ui/pages/installer.js?v=<?= filemtime(__DIR__ . '/ui/pages/installer.js') ?>"></script>

</body>
</html>
