<?php
$siteName = 'Studioform';
$page = [
  'title'       => 'About',
  'description' => "Studioform is a small brand and digital design practice. We work with a limited number of clients each year, building identity systems, websites, and creative strategy that last.",
  'slug'        => 'about',
];
include '_partials/header.php';
?>

<!-- ============================================================
     ABOUT HEADER
     ============================================================ -->
<section class="pt-32 pb-20 px-6">
  <div class="max-w-[1200px] mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12" data-reveal>
      <div class="lg:col-span-8">
        <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-6">About</p>
        <h1 class="font-heading text-[clamp(3rem,7vw,5rem)] font-light leading-[1.05] tracking-tight text-[#111110]">
          A studio built<br>on restraint.
        </h1>
      </div>
    </div>
  </div>
</section>

<!-- ============================================================
     PHILOSOPHY — Wide statement with image
     ============================================================ -->
<section class="px-6 pb-32">
  <div class="max-w-[1200px] mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

      <div class="lg:col-span-6" data-reveal>
        <div class="relative overflow-hidden rounded-[3px] aspect-square">
          <img
            src="/assets/library/gallery/vs-gal_arched-doorway_architecture-interior_warm_dark-text.jpeg"
            alt="Arched doorway — architecture interior with warm light"
            class="w-full h-full object-cover"
            width="800" height="800"
            loading="lazy">
        </div>
      </div>

      <div class="lg:col-span-5 lg:col-start-8 pt-8" data-reveal>

        <div class="space-y-6 font-body text-sm leading-relaxed text-[#6B6B68] mb-12">
          <p>
            Studioform was founded on the belief that the best design is mostly subtraction. Not decoration for its own sake. Not the trend of the moment. Design that endures because it was made with intention.
          </p>
          <p>
            We are a small practice. That is a deliberate choice. We take on a limited number of projects each year — not because we can't grow, but because we've seen what happens to quality when a studio tries to do everything for everyone.
          </p>
          <p>
            Our clients are founders, cultural directors, and product leads who understand that design is how their business is perceived before anyone speaks to them. They care about getting it right.
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-6 border-t border-[#E2E1DD] pt-10">
          <?php
          $stats = [
            ['num' => '11', 'suffix' => '', 'label' => 'Years practice'],
            ['num' => '80', 'suffix' => '+', 'label' => 'Projects completed'],
            ['num' => '4', 'suffix' => '', 'label' => 'Projects per year'],
          ];
          foreach ($stats as $s): ?>
            <div>
              <p class="font-heading text-4xl font-light text-[#111110] leading-none mb-2">
                <span data-count="<?= $s['num'] ?>" data-suffix="<?= $s['suffix'] ?>">0</span>
              </p>
              <p class="font-body text-xs text-[#6B6B68]"><?= htmlspecialchars($s['label']) ?></p>
            </div>
          <?php endforeach; ?>
        </div>

      </div>
    </div>
  </div>
</section>

<!-- ============================================================
     VALUES — Three principles
     ============================================================ -->
<section class="py-32 px-6 bg-[#111110]">
  <div class="max-w-[1200px] mx-auto">

    <div class="mb-20" data-reveal>
      <p class="font-body text-xs tracking-widest uppercase text-white/30 mb-4">How we think</p>
      <h2 class="font-heading text-[clamp(2.5rem,5vw,3.75rem)] font-light leading-tight tracking-tight text-white">
        Three principles.
      </h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10" data-reveal-stagger>
      <?php
      $values = [
        [
          'title' => 'Restraint over decoration',
          'body'  => "We remove before we add. Every element on the page earns its place or it doesn't stay. This is harder than decoration, and it produces work that lasts longer.",
        ],
        [
          'title' => 'Substance before surface',
          'body'  => "We don't start designing until we understand the strategy. The visual is the expression of an idea. If there's no idea, there's nothing to express.",
        ],
        [
          'title' => 'Long relationships, not projects',
          'body'  => "We'd rather work with fewer clients over many years than many clients once. The best work happens when trust has been built and the designer understands the business deeply.",
        ],
      ];
      foreach ($values as $v): ?>
        <div class="bg-[#111110] p-12">
          <h3 class="font-heading text-2xl font-light text-white mb-5 leading-snug">
            <?= htmlspecialchars($v['title']) ?>
          </h3>
          <p class="font-body text-sm leading-relaxed text-white/40">
            <?= htmlspecialchars($v['body']) ?>
          </p>
        </div>
      <?php endforeach; ?>
    </div>

  </div>
</section>

<!-- ============================================================
     SELECTED CLIENTS
     ============================================================ -->
<section class="py-32 px-6">
  <div class="max-w-[1200px] mx-auto">

    <div class="mb-16" data-reveal>
      <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-4">Client roster</p>
      <h2 class="font-heading text-[clamp(2.5rem,5vw,3.75rem)] font-light leading-tight tracking-tight text-[#111110]">
        Organisations we've worked with.
      </h2>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-[#E2E1DD]" data-reveal-stagger>
      <?php
      $clients = [
        'Arkiteka Studio', 'Nordisk Furniture', 'Forme Skincare', 'Modus Foundation',
        'Kova Studios', 'Plinth Ventures', 'Ouro Hotels', 'Aira Wellness',
        'Bode Press', 'Seren Institute', 'Matter Works', 'Gilt Society',
      ];
      foreach ($clients as $client): ?>
        <div class="bg-[#F8F7F4] px-8 py-8 flex items-center justify-center hover:bg-[#F0EFEB] transition-colors duration-200">
          <span class="font-heading text-base font-light text-[#6B6B68] text-center leading-tight">
            <?= htmlspecialchars($client) ?>
          </span>
        </div>
      <?php endforeach; ?>
    </div>

  </div>
</section>

<!-- ============================================================
     PROCESS BRIEF
     ============================================================ -->
<section class="py-32 px-6 bg-[#F0EFEB]">
  <div class="max-w-[1200px] mx-auto">

    <div class="mb-16" data-reveal>
      <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-4">How we work</p>
      <h2 class="font-heading text-[clamp(2.5rem,5vw,3.75rem)] font-light leading-tight tracking-tight text-[#111110]">
        We start by listening.
      </h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10" data-reveal-stagger>
      <?php
      $process = [
        ['num' => '01', 'title' => 'Discovery', 'desc' => "Understanding your business, audience, and competitive landscape."],
        ['num' => '02', 'title' => 'Strategy', 'desc' => "Positioning, voice, and visual direction. The backbone."],
        ['num' => '03', 'title' => 'Design', 'desc' => "Identity systems, web design, art direction. Shown early and often."],
        ['num' => '04', 'title' => 'Delivery', 'desc' => "Full handover with guidelines, assets, and post-launch support."],
      ];
      foreach ($process as $p): ?>
        <div>
          <p class="font-body text-xs tracking-widest uppercase text-[#3D5A73] mb-5"><?= $p['num'] ?></p>
          <h3 class="font-heading text-xl font-light text-[#111110] mb-3"><?= htmlspecialchars($p['title']) ?></h3>
          <p class="font-body text-sm leading-relaxed text-[#6B6B68]"><?= htmlspecialchars($p['desc']) ?></p>
        </div>
      <?php endforeach; ?>
    </div>

  </div>
</section>

<!-- ============================================================
     CTA
     ============================================================ -->
<section class="py-24 px-6 border-t border-[#E2E1DD]">
  <div class="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10" data-reveal>
    <div>
      <h2 class="font-heading text-[clamp(2rem,4vw,3rem)] font-light tracking-tight text-[#111110] mb-3">
        Interested in working with us?
      </h2>
      <p class="font-body text-sm text-[#6B6B68]">We're currently taking enquiries for Q3 2026.</p>
    </div>
    <a href="/contact" class="flex-shrink-0 inline-flex items-center gap-2 font-body text-sm font-medium tracking-widest uppercase text-white bg-[#111110] px-8 py-4 rounded-[2px] transition-all duration-200 hover:bg-[#3D5A73] hover:-translate-y-0.5">
      Start a conversation <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
    </a>
  </div>
</section>

<?php include '_partials/footer.php'; ?>