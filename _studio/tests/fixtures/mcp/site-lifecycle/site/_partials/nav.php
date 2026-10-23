<?php $navLinks = [
    ['url' => '/', 'label' => 'Workshop', 'slug' => 'index'],
    ['url' => '/about', 'label' => 'About', 'slug' => 'about'],
    ['url' => '/services/repairs', 'label' => 'Repairs', 'slug' => 'services/repairs'],
]; ?>
<nav aria-label="Main navigation" class="mx-auto flex max-w-5xl flex-wrap gap-6 border-b px-6 py-5">
  <?php foreach ($navLinks as $link): ?>
    <a href="<?= htmlspecialchars($link['url'], ENT_QUOTES, 'UTF-8') ?>"<?php if ($page['slug'] === $link['slug']): ?> aria-current="page"<?php endif; ?> class="underline-offset-4 hover:underline"><?= htmlspecialchars($link['label'], ENT_QUOTES, 'UTF-8') ?></a>
  <?php endforeach; ?>
</nav>
