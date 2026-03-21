<?php
$siteName = 'Studioform';
$page = [
  'title'       => 'Work',
  'description' => 'Selected projects by Studioform — brand identity, website design, and creative strategy for startups, cultural organisations, and product companies.',
  'slug'        => 'portfolio',
];
include '_partials/header.php';
?>

<?php
$projects = json_decode(file_get_contents(__DIR__ . '/assets/data/portfolio.json'), true);
?>

<!-- Page Header -->
<section class="pt-40 pb-16 px-6 lg:px-10 max-w-[var(--max-width)] mx-auto">
  <div data-reveal>
    <p class="text-xs tracking-[0.14em] uppercase text-[var(--color-muted)] font-medium mb-6">Selected projects</p>
    <h1 class="font-['Cormorant_Garamond'] text-[clamp(3rem,6vw,5.5rem)] font-light text-[var(--color-ink)] leading-[1.05]">
      Our work.
    </h1>
  </div>
</section>

<!-- Filter Bar -->
<div class="px-6 lg:px-10 max-w-[var(--max-width)] mx-auto mb-12" data-reveal>
  <div class="flex flex-wrap gap-3 border-t border-[var(--color-border)] pt-6">
    <button
      data-filter="all"
      class="portfolio-filter portfolio-filter--active text-xs tracking-[0.1em] uppercase font-medium px-4 py-2 transition-colors duration-200">
      All
    </button>
    <button
      data-filter="identity"
      class="portfolio-filter text-xs tracking-[0.1em] uppercase font-medium px-4 py-2 transition-colors duration-200">
      Brand Identity
    </button>
    <button
      data-filter="web"
      class="portfolio-filter text-xs tracking-[0.1em] uppercase font-medium px-4 py-2 transition-colors duration-200">
      Web Design
    </button>
    <button
      data-filter="strategy"
      class="portfolio-filter text-xs tracking-[0.1em] uppercase font-medium px-4 py-2 transition-colors duration-200">
      Strategy
    </button>
  </div>
</div>

<!-- Portfolio Grid -->
<section class="px-6 lg:px-10 max-w-[var(--max-width)] mx-auto pb-32">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-2" id="portfolio-grid" data-reveal-stagger>

    <?php foreach ($projects['projects'] as $project): ?>
    <article
      class="portfolio-item group cursor-pointer"
      data-category="<?= htmlspecialchars($project['category']) ?>">
      <div class="relative overflow-hidden">
        <img
          src="<?= htmlspecialchars($project['image']) ?>"
          alt="<?= htmlspecialchars($project['image_alt']) ?>"
          class="w-full aspect-square object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          loading="lazy"
          width="800" height="800">
        <div class="absolute inset-0 bg-[var(--color-ink)] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
      </div>
      <div class="py-5 flex items-start justify-between gap-4 border-b border-[var(--color-border)]">
        <div>
          <h2 class="text-base font-medium text-[var(--color-ink)] tracking-[-0.01em] mb-1">
            <?= htmlspecialchars($project['title']) ?>
          </h2>
          <p class="text-xs text-[var(--color-muted)] font-light"><?= htmlspecialchars($project['subtitle']) ?></p>
        </div>
        <span class="text-xs tracking-[0.1em] uppercase text-[var(--color-muted)] font-medium pt-0.5 whitespace-nowrap">
          <?= htmlspecialchars($project['discipline']) ?>
        </span>
      </div>
    </article>
    <?php endforeach; ?>

  </div>
</section>

<!-- CTA -->
<section class="py-24 bg-[var(--color-bg-alt)]" data-reveal>
  <div class="max-w-[var(--max-width)] mx-auto px-6 lg:px-10 text-center">
    <h2 class="font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-light text-[var(--color-ink)] leading-[1.1] mb-8">
      Interested in working<br><em class="italic">together?</em>
    </h2>
    <a href="/contact" class="inline-flex items-center gap-2 text-sm font-medium tracking-[0.08em] uppercase text-[var(--color-ink)] border-b border-[var(--color-ink)] pb-1 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors duration-300">
      Start a conversation
      <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
    </a>
  </div>
</section>

<?php include '_partials/footer.php'; ?>