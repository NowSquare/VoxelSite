<?php
$siteName = 'Studioform';
$page = [
  'title'       => 'Work',
  'description' => "Selected projects from Studioform — brand identity systems, website design, and creative strategy for startups, cultural organisations, and product companies.",
  'slug'        => 'portfolio',
];
include '_partials/header.php';
?>

<!-- ============================================================
     PORTFOLIO HEADER
     ============================================================ -->
<section class="pt-32 pb-16 px-6">
  <div class="max-w-[1200px] mx-auto">
    <div class="max-w-[600px]" data-reveal>
      <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-6">Our work</p>
      <h1 class="font-heading text-[clamp(3rem,7vw,5rem)] font-light leading-[1.05] tracking-tight text-[#111110]">
        Selected<br>projects.
      </h1>
    </div>
  </div>
</section>

<!-- ============================================================
     PORTFOLIO FILTER LABELS
     ============================================================ -->
<section class="px-6 pb-16">
  <div class="max-w-[1200px] mx-auto">
    <div class="flex flex-wrap gap-3 border-t border-[#E2E1DD] pt-10" id="portfolio-filters" data-reveal>
      <?php $filters = ['All', 'Identity', 'Website', 'Strategy', 'Cultural', 'Product']; ?>
      <?php foreach ($filters as $i => $f): ?>
        <button
          class="filter-btn font-body text-xs tracking-widest uppercase px-4 py-2 rounded-full border transition-all duration-200 bg-transparent cursor-pointer <?= $i === 0 ? 'border-[#111110] text-[#111110]' : 'border-[#E2E1DD] text-[#6B6B68] hover:border-[#111110] hover:text-[#111110]' ?>"
          data-filter="<?= $i === 0 ? 'all' : strtolower($f) ?>"
          <?= $i === 0 ? 'aria-pressed="true"' : 'aria-pressed="false"' ?>>
          <?= htmlspecialchars($f) ?>
        </button>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ============================================================
     PORTFOLIO GRID — Full project listing
     ============================================================ -->
<section class="px-6 pb-40">
  <div class="max-w-[1200px] mx-auto">

    <?php
    $projects = [
      [
        'image'    => '/assets/library/gallery/vs-gal_sunlit-stairwell_architecture-interior_light_dark-text.jpeg',
        'alt'      => 'Sunlit stairwell — architecture and interior photography',
        'category' => 'Identity & Website',
        'client'   => 'Arkiteka Studio',
        'location' => 'London, UK',
        'tags'     => ['identity', 'website'],
        'year'     => '2024',
        'span'     => 'large',
      ],
      [
        'image'    => '/assets/library/gallery/vs-gal_sheer-glow_interior-editorial_light_dark-text.jpeg',
        'alt'      => 'Sheer glow — interior editorial photography',
        'category' => 'Identity System',
        'client'   => 'Nordisk Furniture',
        'location' => 'Oslo, NO',
        'tags'     => ['identity'],
        'year'     => '2024',
        'span'     => 'half',
      ],
      [
        'image'    => '/assets/library/gallery/vs-gal_botanical-pump_beauty-retail_light_dark-text.jpeg',
        'alt'      => 'Botanical pump — beauty retail product photography',
        'category' => 'Brand Strategy',
        'client'   => 'Forme Skincare',
        'location' => 'London, UK',
        'tags'     => ['strategy', 'identity'],
        'year'     => '2023',
        'span'     => 'half',
      ],
      [
        'image'    => '/assets/library/gallery/vs-gal_concentric-rings_architecture-abstract_light_dark-text.jpeg',
        'alt'      => 'Concentric rings — architecture abstract photography',
        'category' => 'Website Design',
        'client'   => 'Modus Foundation',
        'location' => 'Berlin, DE',
        'tags'     => ['website'],
        'year'     => '2023',
        'span'     => 'half',
      ],
      [
        'image'    => '/assets/library/gallery/vs-gal_prism-cube_abstract-creative_light_dark-text.jpeg',
        'alt'      => 'Prism cube — abstract creative photography',
        'category' => 'Creative Direction',
        'client'   => 'Kova Studios',
        'location' => 'Amsterdam, NL',
        'tags'     => ['strategy'],
        'year'     => '2023',
        'span'     => 'half',
      ],
      [
        'image'    => '/assets/library/gallery/vs-gal_concrete-frame_architecture-minimal_light_dark-text.jpeg',
        'alt'      => 'Concrete frame — architecture minimal photography',
        'category' => 'Brand Identity',
        'client'   => 'Plinth Ventures',
        'location' => 'London, UK',
        'tags'     => ['identity', 'strategy'],
        'year'     => '2022',
        'span'     => 'large',
      ],
      [
        'image'    => '/assets/library/gallery/vs-gal_window-drape_interior-editorial_light_dark-text.jpeg',
        'alt'      => 'Window drape — interior editorial photography',
        'category' => 'Website & Identity',
        'client'   => 'Ouro Hotels',
        'location' => 'Lisbon, PT',
        'tags'     => ['website', 'identity'],
        'year'     => '2022',
        'span'     => 'half',
      ],
      [
        'image'    => '/assets/library/gallery/vs-gal_serum-bottle_beauty-retail_light_dark-text.jpeg',
        'alt'      => 'Serum bottle — beauty retail product photography',
        'category' => 'Brand Strategy',
        'client'   => 'Aira Wellness',
        'location' => 'Copenhagen, DK',
        'tags'     => ['strategy'],
        'year'     => '2022',
        'span'     => 'half',
      ],
    ];
    ?>

    <!-- Masonry-style grid: large items span 2 columns, half items span 1 -->
    <div id="portfolio-grid" class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <?php foreach ($projects as $p):
        $tagStr = implode(' ', $p['tags']);
        $isLarge = $p['span'] === 'large';
        $aspect = 'aspect-[4/5]';
        $colSpan = $isLarge ? 'md:col-span-2' : '';
      ?>

        <article
          class="project-card group cursor-pointer <?= $colSpan ?>"
          data-tags="<?= htmlspecialchars($tagStr) ?>"
          data-reveal>
          <div class="relative overflow-hidden rounded-[3px] <?= $aspect ?> mb-5">
            <img
              src="<?= htmlspecialchars($p['image']) ?>"
              alt="<?= htmlspecialchars($p['alt']) ?>"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              width="800" height="800"
              loading="lazy">
            <div class="absolute inset-0 bg-[#111110] opacity-0 group-hover:opacity-8 transition-opacity duration-500"></div>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-1">
                <?= htmlspecialchars($p['category']) ?>
                <?php if (!empty($p['location'])): ?>
                  — <?= htmlspecialchars($p['location']) ?>
                <?php endif; ?>
              </p>
              <h2 class="font-heading <?= $isLarge ? 'text-2xl' : 'text-xl' ?> font-light text-[#111110]">
                <?= htmlspecialchars($p['client']) ?>
              </h2>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <span class="font-body text-xs text-[#B4B3B0]"><?= htmlspecialchars($p['year']) ?></span>
              <?php foreach ($p['tags'] as $tag): ?>
                <span class="font-body text-xs tracking-wide text-[#6B6B68] border border-[#E2E1DD] px-3 py-1 rounded-full">
                  <?= htmlspecialchars(ucfirst($tag)) ?>
                </span>
              <?php endforeach; ?>
            </div>
          </div>
        </article>

      <?php endforeach; ?>

    </div>

  </div>
</section>

<!-- ============================================================
     ENQUIRY NUDGE
     ============================================================ -->
<section class="py-24 px-6 bg-[#F0EFEB] border-t border-[#E2E1DD]">
  <div class="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10" data-reveal>
    <div>
      <h2 class="font-heading text-[clamp(2rem,4vw,3rem)] font-light tracking-tight text-[#111110] mb-3">
        Interested in working together?
      </h2>
      <p class="font-body text-sm text-[#6B6B68]">We take on a small number of projects each year.</p>
    </div>
    <a href="/contact" class="flex-shrink-0 inline-flex items-center gap-2 font-body text-sm font-medium tracking-widest uppercase text-white bg-[#111110] px-8 py-4 rounded-[2px] transition-all duration-200 hover:bg-[#3D5A73] hover:-translate-y-0.5">
      Start a conversation <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
    </a>
  </div>
</section>

<!-- ============================================================
     PORTFOLIO FILTER SCRIPT
     ============================================================ -->
<script>
(function() {
  'use strict';

  var filters = document.getElementById('portfolio-filters');
  var grid    = document.getElementById('portfolio-grid');
  if (!filters || !grid) return;

  var buttons = filters.querySelectorAll('[data-filter]');
  var cards   = grid.querySelectorAll('[data-tags]');

  function filterBy(tag) {
    // Update button states
    buttons.forEach(function(btn) {
      var isActive = btn.getAttribute('data-filter') === tag;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      // Active: dark border + text. Inactive: light border + muted text
      btn.style.borderColor = isActive ? '#111110' : '';
      btn.style.color       = isActive ? '#111110' : '';
    });

    // Filter cards
    cards.forEach(function(card) {
      var cardTags = card.getAttribute('data-tags') || '';
      var show     = tag === 'all' || cardTags.indexOf(tag) !== -1;
      card.style.display = show ? '' : 'none';
    });
  }

  // Attach click handlers
  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBy(btn.getAttribute('data-filter'));
    });
  });
})();
</script>

<?php include '_partials/footer.php'; ?>