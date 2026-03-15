<?php
$siteName = 'Studioform';
$page = [
  'title'       => 'Work',
  'description' => 'Selected projects from Studioform — brand identity, website design, and creative strategy for startups, cultural organisations, and product companies.',
  'slug'        => 'work',
];
include '_partials/header.php';
?>

<!-- Page Header -->
<section class="page-header">
  <div class="page-header-inner" data-reveal>
    <span class="eyebrow">Portfolio</span>
    <h1 class="page-title">All work</h1>
    <p class="page-subtitle">
      A selection of projects spanning brand identity, digital design,
      and creative strategy. Each one different. Each one considered.
    </p>
  </div>
</section>

<!-- Filter Bar -->
<div class="portfolio-filter" data-reveal>
  <div class="portfolio-filter-inner">
    <button class="filter-btn filter-btn--active" data-filter="all">All</button>
    <button class="filter-btn" data-filter="identity">Identity</button>
    <button class="filter-btn" data-filter="web">Web</button>
    <button class="filter-btn" data-filter="strategy">Strategy</button>
  </div>
</div>

<!-- Portfolio Grid -->
<section class="portfolio-grid-section">
  <div class="portfolio-grid" id="portfolio-grid">

    <!-- Row 1: 2 equal -->
    <article class="portfolio-item" data-category="identity">
      <a href="#" class="portfolio-item-link" aria-label="View Søren &amp; Co. — Brand Identity">
        <div class="portfolio-item-image-wrap">
          <img src="/assets/library/gallery/vs-gal_shell-spiral_architecture-abstract_light_dark-text.png"
               alt="Shell spiral form — Søren and Co. brand identity project"
               class="portfolio-item-image"
               width="800" height="800"
               loading="lazy">
        </div>
        <div class="portfolio-item-info">
          <span class="project-tag">Brand Identity</span>
          <h2 class="portfolio-item-title">Søren &amp; Co.</h2>
          <span class="portfolio-item-year">2024</span>
        </div>
      </a>
    </article>

    <article class="portfolio-item" data-category="web">
      <a href="#" class="portfolio-item-link" aria-label="View Meridian Architects — Website &amp; Identity">
        <div class="portfolio-item-image-wrap">
          <img src="/assets/library/gallery/vs-gal_sunlit-stairwell_architecture-interior_light_dark-text.png"
               alt="Sunlit architectural stairwell — Meridian Architects digital identity"
               class="portfolio-item-image"
               width="800" height="800"
               loading="lazy">
        </div>
        <div class="portfolio-item-info">
          <span class="project-tag">Website &amp; Identity</span>
          <h2 class="portfolio-item-title">Meridian Architects</h2>
          <span class="portfolio-item-year">2024</span>
        </div>
      </a>
    </article>

    <!-- Row 2: 1 wide + 1 narrow -->
    <article class="portfolio-item portfolio-item--wide" data-category="strategy">
      <a href="#" class="portfolio-item-link" aria-label="View Atelier Roux — Creative Strategy">
        <div class="portfolio-item-image-wrap">
          <img src="/assets/library/gallery/vs-gal_arched-doorway_architecture-interior_warm_dark-text.png"
               alt="Arched doorway interior — Atelier Roux gallery strategic rebrand"
               class="portfolio-item-image"
               width="800" height="800"
               loading="lazy">
        </div>
        <div class="portfolio-item-info">
          <span class="project-tag">Creative Strategy</span>
          <h2 class="portfolio-item-title">Atelier Roux</h2>
          <span class="portfolio-item-year">2023</span>
        </div>
      </a>
    </article>

    <article class="portfolio-item" data-category="identity">
      <a href="#" class="portfolio-item-link" aria-label="View Forma Skincare — Brand Strategy">
        <div class="portfolio-item-image-wrap">
          <img src="/assets/library/gallery/vs-gal_serum-bottle_beauty-retail_light_dark-text.png"
               alt="Serum bottle — Forma Skincare brand identity and strategy"
               class="portfolio-item-image"
               width="800" height="800"
               loading="lazy">
        </div>
        <div class="portfolio-item-info">
          <span class="project-tag">Brand Strategy</span>
          <h2 class="portfolio-item-title">Forma Skincare</h2>
          <span class="portfolio-item-year">2023</span>
        </div>
      </a>
    </article>

    <!-- Row 3: 3 equal -->
    <article class="portfolio-item" data-category="identity">
      <a href="#" class="portfolio-item-link" aria-label="View Vance Studio — Brand Identity">
        <div class="portfolio-item-image-wrap">
          <img src="/assets/library/gallery/vs-gal_wooden-bowl_craft-artisan_light_dark-text.png"
               alt="Turned wooden bowl — Vance Studio craft brand identity"
               class="portfolio-item-image"
               width="800" height="800"
               loading="lazy">
        </div>
        <div class="portfolio-item-info">
          <span class="project-tag">Brand Identity</span>
          <h2 class="portfolio-item-title">Vance Studio</h2>
          <span class="portfolio-item-year">2023</span>
        </div>
      </a>
    </article>

    <article class="portfolio-item" data-category="web">
      <a href="#" class="portfolio-item-link" aria-label="View Croft House — Website Design">
        <div class="portfolio-item-image-wrap">
          <img src="/assets/library/gallery/vs-gal_window-drape_interior-editorial_light_dark-text.png"
               alt="Draped window interior — Croft House residential website"
               class="portfolio-item-image"
               width="800" height="800"
               loading="lazy">
        </div>
        <div class="portfolio-item-info">
          <span class="project-tag">Website Design</span>
          <h2 class="portfolio-item-title">Croft House</h2>
          <span class="portfolio-item-year">2022</span>
        </div>
      </a>
    </article>

    <article class="portfolio-item" data-category="strategy">
      <a href="#" class="portfolio-item-link" aria-label="View Parallel Press — Creative Strategy">
        <div class="portfolio-item-image-wrap">
          <img src="/assets/library/gallery/vs-gal_desk-journal_professional-coaching_warm_dark-text.png"
               alt="Desk journal — Parallel Press editorial strategy project"
               class="portfolio-item-image"
               width="800" height="800"
               loading="lazy">
        </div>
        <div class="portfolio-item-info">
          <span class="project-tag">Creative Strategy</span>
          <h2 class="portfolio-item-title">Parallel Press</h2>
          <span class="portfolio-item-year">2022</span>
        </div>
      </a>
    </article>

    <!-- Row 4: 1 full-width feature -->
    <article class="portfolio-item portfolio-item--featured" data-category="identity">
      <a href="#" class="portfolio-item-link" aria-label="View Concentric — Brand Identity System">
        <div class="portfolio-item-image-wrap">
          <img src="/assets/library/gallery/vs-gal_concentric-rings_architecture-abstract_light_dark-text.png"
               alt="Concentric architectural rings — visual identity system study"
               class="portfolio-item-image"
               width="800" height="800"
               loading="lazy">
        </div>
        <div class="portfolio-item-info">
          <span class="project-tag">Brand Identity</span>
          <h2 class="portfolio-item-title">Concentric Systems</h2>
          <span class="portfolio-item-year">2022</span>
        </div>
      </a>
    </article>

  </div>
</section>

<!-- CTA -->
<section class="section-cta section-cta--compact" data-reveal>
  <div class="cta-inner">
    <h2 class="cta-heading">Have a project in mind?</h2>
    <p class="cta-body">We'd like to hear about it.</p>
    <a href="/contact" class="btn-cta">Get in touch</a>
  </div>
</section>

<?php include '_partials/footer.php'; ?>