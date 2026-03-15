<header class="site-header" id="site-header">
  <div class="nav-inner">
    <a href="/" class="nav-logo" aria-label="Studioform — return to homepage">
      <span class="logo-word">Studio</span><span class="logo-accent">form</span>
    </a>

    <nav class="nav-desktop" aria-label="Main navigation">
      <ul class="flex items-center gap-10">
        <?php foreach ($navLinks as $link): ?>
        <li>
          <a href="<?= $link['href'] ?>"
             class="nav-link <?= ($page['slug'] ?? '') === $link['slug'] ? 'nav-link--active' : '' ?>"
             <?= ($page['slug'] ?? '') === $link['slug'] ? 'aria-current="page"' : '' ?>>
            <?= htmlspecialchars($link['label']) ?>
          </a>
        </li>
        <?php endforeach; ?>
      </ul>
    </nav>

    <button class="nav-toggle bg-transparent border-0 cursor-pointer"
            id="nav-toggle"
            aria-expanded="false"
            aria-controls="mobile-menu"
            aria-label="Open navigation">
      <span id="icon-menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <line x1="3" y1="7" x2="21" y2="7"/>
          <line x1="3" y1="17" x2="21" y2="17"/>
        </svg>
      </span>
      <span id="icon-close" class="hidden">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </span>
    </button>
  </div>
</header>

<div class="mobile-menu" id="mobile-menu" aria-hidden="true">
  <div class="mobile-menu-inner">
    <nav aria-label="Mobile navigation">
      <ul>
        <?php foreach ($navLinks as $link): ?>
        <li>
          <a href="<?= $link['href'] ?>"
             class="mobile-nav-link <?= ($page['slug'] ?? '') === $link['slug'] ? 'mobile-nav-link--active' : '' ?>"
             <?= ($page['slug'] ?? '') === $link['slug'] ? 'aria-current="page"' : '' ?>>
            <?= htmlspecialchars($link['label']) ?>
          </a>
        </li>
        <?php endforeach; ?>
      </ul>
    </nav>
    <p class="mobile-menu-tagline">Brand &amp; digital design practice</p>
  </div>
</div>