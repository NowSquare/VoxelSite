<?php
$business = json_decode(file_get_contents($siteRoot . '/assets/data/site.json'), true, 32, JSON_THROW_ON_ERROR);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($page['title'] . ' | ' . $business['business_name'], ENT_QUOTES, 'UTF-8') ?></title>
  <meta name="description" content="<?= htmlspecialchars($page['description'], ENT_QUOTES, 'UTF-8') ?>">
  <link rel="stylesheet" href="/assets/css/style.css">
  <link rel="stylesheet" href="/assets/css/tailwind.css">
</head>
<body class="bg-white text-zinc-900">
<a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>
<main id="main">
