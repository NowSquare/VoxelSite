<?php
// _partials/nav.php
// Full-screen overlay mobile nav. Sticky header, centered logo, split nav.
$slug = $page['slug'] ?? '';
?>

<header class="site-header" id="site-header">
  <div class="nav-inner">

    <!-- Left nav links (desktop) -->
    <nav class="nav-desktop" aria-label="Left navigation">
      <ul class="list-none flex items-center gap-8">
        <li>
          <a href="/portfolio"
             class="nav-link <?= $slug === 'portfolio' ? 'nav-link--active' : '' ?>"
             <?= $slug === 'portfolio' ? 'aria-current="page"' : '' ?>>
            Work
          </a>
        </li>
        <li>
          <a href="/services"
             class="nav-link <?= $slug === 'services' ? 'nav-link--active' : '' ?>"
             <?= $slug === 'services' ? 'aria-current="page"' : '' ?>>
            Services
          </a>
        </li>
      </ul>
    </nav>

    <!-- Centered logo -->
    <a href="/" class="nav-logo" aria-label="Studioform — home">
      Studioform
    </a>

    <!-- Right nav links (desktop) -->
    <nav class="nav-desktop" aria-label="Right navigation">
      <ul class="list-none flex items-center gap-8">
        <li>
          <a href="/about"
             class="nav-link <?= $slug === 'about' ? 'nav-link--active' : '' ?>"
             <?= $slug === 'about' ? 'aria-current="page"' : '' ?>>
            About
          </a>
        </li>
        <li>
          <a href="/contact" class="nav-cta">
            Start a project
          </a>
        </li>
      </ul>
    </nav>

    <!-- Mobile toggle -->
    <button
      class="nav-toggle bg-transparent border-0 cursor-pointer"
      id="nav-toggle"
      aria-expanded="false"
      aria-controls="mobile-menu"
      aria-label="Open navigation">
      <i id="icon-menu" class="icon" data-lucide="menu" aria-hidden="true"></i>
      <i id="icon-close" class="icon hidden" data-lucide="x" aria-hidden="true"></i>
    </button>

  </div>
</header>

<!-- Mobile menu lives OUTSIDE <header> to avoid backdrop-filter containing block -->
<div class="mobile-menu" id="mobile-menu" aria-hidden="true">

  <nav aria-label="Mobile navigation" class="flex flex-col justify-center h-full px-10 py-20">
    <ul class="list-none space-y-2" data-reveal-stagger>
      <li>
        <a href="/"
           class="mobile-nav-link <?= $slug === 'home' ? 'mobile-nav-link--active' : '' ?>"
           <?= $slug === 'home' ? 'aria-current="page"' : '' ?>>
          Home
        </a>
      </li>
      <li>
        <a href="/portfolio"
           class="mobile-nav-link <?= $slug === 'portfolio' ? 'mobile-nav-link--active' : '' ?>"
           <?= $slug === 'portfolio' ? 'aria-current="page"' : '' ?>>
          Work
        </a>
      </li>
      <li>
        <a href="/services"
           class="mobile-nav-link <?= $slug === 'services' ? 'mobile-nav-link--active' : '' ?>"
           <?= $slug === 'services' ? 'aria-current="page"' : '' ?>>
          Services
        </a>
      </li>
      <li>
        <a href="/about"
           class="mobile-nav-link <?= $slug === 'about' ? 'mobile-nav-link--active' : '' ?>"
           <?= $slug === 'about' ? 'aria-current="page"' : '' ?>>
          About
        </a>
      </li>
      <li>
        <a href="/contact"
           class="mobile-nav-link <?= $slug === 'contact' ? 'mobile-nav-link--active' : '' ?>"
           <?= $slug === 'contact' ? 'aria-current="page"' : '' ?>>
          Contact
        </a>
      </li>
    </ul>

    <div class="mt-16 pt-10 border-t border-[#111110]/10">
      <a href="/contact" class="inline-block text-sm font-medium tracking-widest uppercase text-[#111110] hover:text-[#3D5A73] transition-colors duration-200">
        Start a project →
      </a>
    </div>
  </nav>

</div>