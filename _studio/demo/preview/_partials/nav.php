<header class="site-header" id="site-header">
  <div class="nav-inner">
    <a href="/" class="nav-logo" aria-label="Studioform — home">
      Studioform
    </a>

    <nav class="nav-desktop" aria-label="Main navigation">
      <ul class="list-none flex items-center gap-10">
        <li>
          <a href="/portfolio"
             class="nav-link <?= ($page['slug'] ?? '') === 'portfolio' ? 'nav-link--active' : '' ?>"
             <?= ($page['slug'] ?? '') === 'portfolio' ? 'aria-current="page"' : '' ?>>
            Work
          </a>
        </li>
        <li>
          <a href="/services"
             class="nav-link <?= ($page['slug'] ?? '') === 'services' ? 'nav-link--active' : '' ?>"
             <?= ($page['slug'] ?? '') === 'services' ? 'aria-current="page"' : '' ?>>
            Services
          </a>
        </li>
        <li>
          <a href="/about"
             class="nav-link <?= ($page['slug'] ?? '') === 'about' ? 'nav-link--active' : '' ?>"
             <?= ($page['slug'] ?? '') === 'about' ? 'aria-current="page"' : '' ?>>
            About
          </a>
        </li>
        <li>
          <a href="/contact"
             class="nav-link <?= ($page['slug'] ?? '') === 'contact' ? 'nav-link--active' : '' ?>"
             <?= ($page['slug'] ?? '') === 'contact' ? 'aria-current="page"' : '' ?>>
            Contact
          </a>
        </li>
      </ul>
    </nav>

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

<div class="mobile-menu" id="mobile-menu" aria-hidden="true">
  <nav aria-label="Mobile navigation">
    <ul class="list-none flex flex-col gap-1 pt-8">
      <li>
        <a href="/"
           class="mobile-nav-link <?= ($page['slug'] ?? '') === 'home' ? 'mobile-nav-link--active' : '' ?>">
          Home
        </a>
      </li>
      <li>
        <a href="/portfolio"
           class="mobile-nav-link <?= ($page['slug'] ?? '') === 'portfolio' ? 'mobile-nav-link--active' : '' ?>">
          Work
        </a>
      </li>
      <li>
        <a href="/services"
           class="mobile-nav-link <?= ($page['slug'] ?? '') === 'services' ? 'mobile-nav-link--active' : '' ?>">
          Services
        </a>
      </li>
      <li>
        <a href="/about"
           class="mobile-nav-link <?= ($page['slug'] ?? '') === 'about' ? 'mobile-nav-link--active' : '' ?>">
          About
        </a>
      </li>
      <li>
        <a href="/contact"
           class="mobile-nav-link <?= ($page['slug'] ?? '') === 'contact' ? 'mobile-nav-link--active' : '' ?>">
          Contact
        </a>
      </li>
    </ul>

    <div class="pt-10 border-t border-[var(--color-border)] mt-10">
      <a href="/contact" class="inline-block text-sm font-medium tracking-[0.08em] uppercase text-[var(--color-primary)] hover:opacity-70 transition-opacity duration-200">
        Start a project &rarr;
      </a>
    </div>
  </nav>
</div>