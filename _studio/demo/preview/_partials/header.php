<?php
$navLinks = [
  ['label' => 'Work',     'href' => '/work',     'slug' => 'work'],
  ['label' => 'Services', 'href' => '/services', 'slug' => 'services'],
  ['label' => 'Studio',   'href' => '/studio',   'slug' => 'studio'],
  ['label' => 'Contact',  'href' => '/contact',  'slug' => 'contact'],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($page['title'] ?? 'Home') ?> — <?= htmlspecialchars($siteName ?? 'Studioform') ?></title>
  <meta name="description" content="<?= htmlspecialchars($page['description'] ?? '') ?>">
  <meta property="og:title" content="<?= htmlspecialchars($page['title'] ?? 'Home') ?> — <?= htmlspecialchars($siteName ?? 'Studioform') ?>">
  <meta property="og:description" content="<?= htmlspecialchars($page['description'] ?? '') ?>">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/tailwind.css">
  <link rel="stylesheet" href="/assets/css/style.css">
  <?php if (file_exists(__DIR__ . '/schema.php')) include __DIR__ . '/schema.php'; ?>
</head>
<body>
  <?php include __DIR__ . '/nav.php'; ?>
  <main>