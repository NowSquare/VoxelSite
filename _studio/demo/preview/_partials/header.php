<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($page['title'] ?? 'Home') ?> — Studioform</title>
  <meta name="description" content="<?= htmlspecialchars($page['description'] ?? 'Studioform is a brand and digital design practice. Brand identity systems, website design, and creative strategy for startups, cultural organisations, and product companies.') ?>">

  <!-- Open Graph -->
  <meta property="og:title" content="<?= htmlspecialchars($page['title'] ?? 'Home') ?> — Studioform">
  <meta property="og:description" content="<?= htmlspecialchars($page['description'] ?? 'Brand identity, website design, and creative strategy for businesses that care about how they show up.') ?>">
  <meta property="og:type" content="website">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/assets/css/tailwind.css">
  <link rel="stylesheet" href="/assets/css/style.css">

  <?php if (file_exists(__DIR__ . '/schema.php')) include __DIR__ . '/schema.php'; ?>
</head>
<body class="antialiased bg-[var(--color-bg)] text-[var(--color-text)]">
  <?php include __DIR__ . '/nav.php'; ?>
  <main>