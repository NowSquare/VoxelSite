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
      if (!t) t = 'light';
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

  <!-- Theme toggle -->
  <button id="btn-login-theme" class="vs-login-theme-toggle" title="Toggle light/dark mode">
    <svg id="theme-sun" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    <svg id="theme-moon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  </button>
  <script>
    (function(){
      const btn = document.getElementById('btn-login-theme');
      const sun = document.getElementById('theme-sun');
      const moon = document.getElementById('theme-moon');
      
      function updateIcon() {
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        if (theme === 'light') {
          sun.style.display = 'block';
          moon.style.display = 'none';
        } else {
          sun.style.display = 'none';
          moon.style.display = 'block';
        }
      }
      
      updateIcon();
      
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'light' ? 'dark' : 'light';
        
        localStorage.setItem('vs-theme', next);
        document.documentElement.setAttribute('data-theme', next);
        
        btn.style.transform = 'rotate(180deg) scale(0.8)';
        btn.style.opacity = '0';
        setTimeout(() => {
          updateIcon();
          btn.style.transform = 'rotate(0deg) scale(1)';
          btn.style.opacity = '1';
        }, 150);
      });
    })();
  </script>

</body>
</html>
