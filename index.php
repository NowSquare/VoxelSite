<?php
/**
 * VoxelSite Default Landing Page
 *
 * SHIPPED CODE — DO NOT DELETE VIA RESET
 *
 * Shown when no AI-generated site has been published yet.
 * Displays the site name and tagline in a clean, minimal design
 * with a discreet key icon linking to the Studio.
 *
 * Once the user publishes their first site, this file is overwritten
 * by the AI-generated index.php.
 */

declare(strict_types=1);

// ── Try to load site name from Studio settings ──
$siteName = 'VoxelSite';
$tagline  = '';

$studioDbPath = __DIR__ . '/_studio/data/studio.db';
if (file_exists($studioDbPath)) {
    try {
        $db = new PDO('sqlite:' . $studioDbPath);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $db->prepare('SELECT key, value FROM settings WHERE key IN (?, ?)');
        $stmt->execute(['site_name', 'site_tagline']);

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $val = json_decode($row['value'], true) ?? $row['value'];
            if ($row['key'] === 'site_name' && !empty($val)) {
                $siteName = $val;
            }
            if ($row['key'] === 'site_tagline' && !empty($val)) {
                $tagline = $val;
            }
        }
    } catch (Throwable $e) {
        // Silently fall back to defaults
    }
}

// ── Check if Studio is installed ──
$configPath = __DIR__ . '/_studio/data/config.json';
$isInstalled = file_exists($configPath);
$studioUrl = $isInstalled ? '/_studio/' : '/_studio/install.php';

// Pre-install: show VoxelSite branding with box icon + default tagline
$isDefault = ($siteName === 'VoxelSite');
if ($isDefault && empty($tagline)) {
    $tagline = 'Your story deserves a website.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($siteName) ?></title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    @font-face {
      font-family: 'Inter';
      src: url('/_studio/ui/fonts/inter/Inter-Variable.woff2') format('woff2');
      font-weight: 100 900;
      font-display: swap;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0e0e11;
      color: #e8e6e1;
      -webkit-font-smoothing: antialiased;
      overflow: hidden;
    }

    /* Pulsing amber aura */
    .aura {
      position: fixed;
      inset: 0;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .aura::before {
      content: '';
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(244,160,36,0.08) 0%, rgba(244,160,36,0.02) 40%, transparent 70%);
      animation: aura-pulse 4s ease-in-out infinite;
    }

    @keyframes aura-pulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.15); opacity: 1; }
    }

    .container {
      text-align: center;
      padding: 2rem;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      color: #f4a024;
      margin: 0 auto 1.25rem;
    }

    .site-name {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.1;
      color: #f0ede6;
    }

    .tagline {
      font-size: clamp(1rem, 2.5vw, 1.25rem);
      font-weight: 400;
      color: rgba(232, 230, 225, 0.45);
      margin-top: 0.75rem;
      letter-spacing: -0.01em;
    }

    /* Discreet key icon — bottom right */
    .studio-key {
      position: fixed;
      bottom: 1.25rem;
      right: 1.25rem;
      width: 28px;
      height: 28px;
      color: rgba(232, 230, 225, 0.12);
      transition: color 0.3s ease;
      text-decoration: none;
    }

    .studio-key:hover {
      color: rgba(244, 160, 36, 0.5);
    }

    .studio-key svg {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>

  <div class="aura" aria-hidden="true"></div>

  <div class="container">
    <?php if ($isDefault): ?>
      <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="1.5"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
        <path d="m3.3 7 8.7 5 8.7-5"/>
        <path d="M12 22V12"/>
      </svg>
    <?php endif; ?>
    <h1 class="site-name"><?= htmlspecialchars($siteName) ?></h1>
    <?php if (!empty($tagline)): ?>
      <p class="tagline"><?= htmlspecialchars($tagline) ?></p>
    <?php endif; ?>
  </div>

  <a href="<?= $studioUrl ?>" class="studio-key" aria-label="Open Studio">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="1.5"
         stroke-linecap="round" stroke-linejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5"/>
      <path d="m21 2-9.3 9.3"/>
      <path d="m18.5 2 3 3"/>
      <path d="m15 5 3 3"/>
    </svg>
  </a>

</body>
</html>
