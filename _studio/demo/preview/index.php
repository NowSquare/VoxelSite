<?php
$siteName = 'Studioform';
$page = [
  'title'       => 'Brand & Digital Design',
  'description' => "Studioform is a brand and digital design practice. We build identity systems, websites, and creative strategy for startups, cultural organisations, and product companies who care about how they show up.",
  'slug'        => 'home',
];
include '_partials/header.php';
?>

<!-- ============================================================
     HERO — Asymmetric split: manifesto left, project image right
     ============================================================ -->
<section class="min-h-[92vh] flex items-center pt-24 pb-16 px-6">
  <div class="max-w-[1200px] mx-auto w-full grid grid-cols-1 sm:grid-cols-12 gap-12 sm:gap-6 items-center">

    <!-- Left: text -->
    <div class="sm:col-span-5 sm:col-start-1" data-reveal>
      <p class="text-xs tracking-widest uppercase text-[#6B6B68] mb-8 font-body">
        Brand &amp; Digital Design
      </p>
      <h1 class="font-heading text-[clamp(3.5rem,7vw,5.5rem)] font-light leading-[1.05] tracking-tight text-[#111110] mb-10">
        Design that<br>
        <em class="not-italic text-[#3D5A73]">endures.</em>
      </h1>
      <p class="font-body text-base leading-relaxed text-[#6B6B68] max-w-[42ch] mb-12">
        We build brand identity systems, websites, and creative strategy for organisations that care about how they show up in the world. Minimal. Considered. Built to last.
      </p>
      <div class="flex flex-wrap gap-4 items-center">
        <a href="/portfolio" class="inline-flex items-center gap-2 font-body text-sm font-medium tracking-widest uppercase text-white bg-[#111110] px-7 py-4 rounded-[2px] transition-all duration-200 hover:bg-[#3D5A73] hover:-translate-y-0.5">
          View work
          <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
        </a>
        <a href="/contact" class="inline-flex items-center gap-2 font-body text-sm font-medium tracking-widest uppercase text-[#111110] border border-[#111110] px-7 py-4 rounded-[2px] transition-all duration-200 hover:bg-[#111110] hover:text-white hover:-translate-y-0.5">
          Start a project
        </a>
      </div>
    </div>

    <!-- Right: featured project image -->
    <div class="sm:col-span-6 sm:col-start-7 relative overflow-hidden rounded-[3px]" data-hero-media>
      <div class="relative overflow-hidden aspect-[4/5] sm:aspect-[3/4]">
        <img
          src="/assets/library/gallery/vs-gal_concrete-frame_architecture-minimal_light_dark-text.jpeg"
          alt="Concrete frame — architecture, minimal aesthetic"
          class="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
          width="800" height="800"
          loading="eager">
        <!-- Project label -->
        <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#111110]/60 to-transparent">
          <p class="font-body text-xs tracking-widest uppercase text-white/60 mb-1">Selected work</p>
          <p class="font-heading text-xl font-light text-white">Arkiteka Studio</p>
        </div>
      </div>
    </div>

  </div>
</section>

<!-- ============================================================
     MARQUEE — discipline ticker
     ============================================================ -->
<div class="overflow-hidden border-t border-b border-[#E2E1DD] py-4 bg-[#F0EFEB]">
  <div class="flex whitespace-nowrap animate-[marquee_30s_linear_infinite]" data-marquee-track>
    <?php
    $items = ['Brand Identity', 'Website Design', 'Creative Strategy', 'Visual Systems', 'Art Direction', 'Digital Experiences', 'Brand Identity', 'Website Design', 'Creative Strategy', 'Visual Systems', 'Art Direction', 'Digital Experiences'];
    foreach ($items as $item): ?>
      <span class="inline-flex items-center gap-4 mx-8 font-heading text-sm font-light tracking-widest uppercase text-[#B4B3B0]">
        <span class="inline-block w-1 h-1 rounded-full bg-[#3D5A73] flex-shrink-0"></span>
        <?= htmlspecialchars($item) ?>
      </span>
    <?php endforeach; ?>
  </div>
</div>

<!-- ============================================================
     FEATURED PROJECTS — 3 case studies
     ============================================================ -->
<section class="py-32 px-6">
  <div class="max-w-[1200px] mx-auto">

    <!-- Section header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-20" data-reveal>
      <div>
        <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-4">Selected work</p>
        <h2 class="font-heading text-[clamp(2.5rem,5vw,3.75rem)] font-light leading-tight tracking-tight text-[#111110]">
          Recent projects
        </h2>
      </div>
      <a href="/portfolio" class="font-body text-sm tracking-widest uppercase text-[#6B6B68] hover:text-[#111110] transition-colors duration-200 flex items-center gap-2 flex-shrink-0">
        All work <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
      </a>
    </div>

    <!-- Project 1 — Large featured -->
    <article class="group mb-4" data-reveal>
      <a href="/portfolio" class="block relative overflow-hidden rounded-[3px] aspect-[16/9] mb-6">
        <img
          src="/assets/library/gallery/vs-gal_sunlit-stairwell_architecture-interior_light_dark-text.jpeg"
          alt="Sunlit stairwell — architecture and interior photography"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          width="800" height="800"
          loading="lazy">
        <div class="absolute inset-0 bg-[#111110] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
        <div class="absolute top-6 right-6 w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <i class="icon-sm text-[#111110]" data-lucide="arrow-right" aria-hidden="true"></i>
        </div>
      </a>
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-2">Rebranding — Identity &amp; Web</p>
          <h3 class="font-heading text-2xl font-light text-[#111110]">Arkiteka Studio, London</h3>
        </div>
        <div class="flex flex-wrap gap-2 sm:text-right">
          <span class="font-body text-xs tracking-wide text-[#6B6B68] border border-[#E2E1DD] px-3 py-1 rounded-full">Identity</span>
          <span class="font-body text-xs tracking-wide text-[#6B6B68] border border-[#E2E1DD] px-3 py-1 rounded-full">Website</span>
        </div>
      </div>
    </article>

    <!-- Projects 2 & 3 — Side by side -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" data-reveal-stagger>

      <article class="group">
        <a href="/portfolio" class="block relative overflow-hidden rounded-[3px] aspect-square mb-6">
          <img
            src="/assets/library/gallery/vs-gal_sheer-glow_interior-editorial_light_dark-text.jpeg"
            alt="Sheer glow — interior editorial photography"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            width="800" height="800"
            loading="lazy">
          <div class="absolute inset-0 bg-[#111110] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
        </a>
        <div>
          <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-2">Identity System</p>
          <h3 class="font-heading text-xl font-light text-[#111110]">Nordisk Furniture, Oslo</h3>
        </div>
      </article>

      <article class="group">
        <a href="/portfolio" class="block relative overflow-hidden rounded-[3px] aspect-square mb-6">
          <img
            src="/assets/library/gallery/vs-gal_botanical-pump_beauty-retail_light_dark-text.jpeg"
            alt="Botanical pump — beauty retail product photography"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            width="800" height="800"
            loading="lazy">
          <div class="absolute inset-0 bg-[#111110] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
        </a>
        <div>
          <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-2">Brand Strategy</p>
          <h3 class="font-heading text-xl font-light text-[#111110]">Forme Skincare</h3>
        </div>
      </article>

    </div>

  </div>
</section>

<!-- ============================================================
     SERVICES OVERVIEW — Three disciplines
     ============================================================ -->
<section class="py-32 px-6 bg-[#111110]">
  <div class="max-w-[1200px] mx-auto">

    <div class="mb-20" data-reveal>
      <p class="font-body text-xs tracking-widest uppercase text-white/30 mb-4">What we do</p>
      <h2 class="font-heading text-[clamp(2.5rem,5vw,3.75rem)] font-light leading-tight tracking-tight text-white">
        Three disciplines.<br>One practice.
      </h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10" data-reveal-stagger>

      <!-- Brand Identity -->
      <div class="bg-[#111110] p-10 group hover:bg-[#1a1a18] transition-colors duration-300">
        <div class="mb-10">
          <span class="font-body text-xs tracking-widest uppercase text-[#3D5A73]">01</span>
        </div>
        <h3 class="font-heading text-2xl font-light text-white mb-4 leading-snug">
          Brand Identity
        </h3>
        <p class="font-body text-sm leading-relaxed text-white/40 mb-8">
          Visual identity systems that hold together across every touchpoint — logo, typography, colour, motion, and the rules that govern how they work together.
        </p>
        <a href="/services" class="inline-flex items-center gap-2 font-body text-xs tracking-widest uppercase text-white/40 group-hover:text-white/80 transition-colors duration-300">
          Learn more <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
        </a>
      </div>

      <!-- Website Design -->
      <div class="bg-[#111110] p-10 group hover:bg-[#1a1a18] transition-colors duration-300">
        <div class="mb-10">
          <span class="font-body text-xs tracking-widest uppercase text-[#3D5A73]">02</span>
        </div>
        <h3 class="font-heading text-2xl font-light text-white mb-4 leading-snug">
          Website Design
        </h3>
        <p class="font-body text-sm leading-relaxed text-white/40 mb-8">
          Designed from first principles. Not templates, not page builders. Websites that work as hard as the brand they carry — fast, accessible, and built to outlast trends.
        </p>
        <a href="/services" class="inline-flex items-center gap-2 font-body text-xs tracking-widest uppercase text-white/40 group-hover:text-white/80 transition-colors duration-300">
          Learn more <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
        </a>
      </div>

      <!-- Creative Strategy -->
      <div class="bg-[#111110] p-10 group hover:bg-[#1a1a18] transition-colors duration-300">
        <div class="mb-10">
          <span class="font-body text-xs tracking-widest uppercase text-[#3D5A73]">03</span>
        </div>
        <h3 class="font-heading text-2xl font-light text-white mb-4 leading-snug">
          Creative Strategy
        </h3>
        <p class="font-body text-sm leading-relaxed text-white/40 mb-8">
          The thinking before the making. Positioning, narrative, and direction that gives every design decision a reason to exist.
        </p>
        <a href="/services" class="inline-flex items-center gap-2 font-body text-xs tracking-widest uppercase text-white/40 group-hover:text-white/80 transition-colors duration-300">
          Learn more <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
        </a>
      </div>

    </div>

  </div>
</section>

<!-- ============================================================
     PROCESS — From discovery to delivery
     ============================================================ -->
<section class="py-32 px-6">
  <div class="max-w-[1200px] mx-auto">

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

      <!-- Sticky label column -->
      <div class="lg:col-span-4 lg:sticky lg:top-28" data-reveal>
        <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-4">How we work</p>
        <h2 class="font-heading text-[clamp(2.5rem,4vw,3.25rem)] font-light leading-tight tracking-tight text-[#111110] mb-8">
          From discovery<br>to delivery.
        </h2>
        <p class="font-body text-sm leading-relaxed text-[#6B6B68] max-w-[36ch]">
          A structured process that keeps creative decisions grounded in purpose. Every stage builds on the last.
        </p>
      </div>

      <!-- Process steps -->
      <div class="lg:col-span-7 lg:col-start-6 space-y-0" data-reveal-stagger>

        <?php
        $steps = [
          ['num' => '01', 'title' => 'Discovery', 'desc' => 'We start by listening. Understanding the business, the audience, the competitive landscape, and the gap in the market that this brand can occupy uniquely. This isn\'t a brief — it\'s a conversation.'],
          ['num' => '02', 'title' => 'Strategy', 'desc' => 'Positioning, voice, and visual direction. We define where you stand, what you stand for, and how that translates into a visual and verbal language. The strategy is the backbone everything else hangs on.'],
          ['num' => '03', 'title' => 'Design', 'desc' => 'The work itself. Identity systems, web design, art direction. We work iteratively — showing thinking early and often, not presenting a finished solution and hoping it lands.'],
          ['num' => '04', 'title' => 'Delivery', 'desc' => 'Complete handover with everything you need to maintain and extend the brand independently. Guidelines, assets, code. We don\'t disappear after launch.'],
        ];
        foreach ($steps as $step): ?>
          <div class="flex gap-8 py-10 border-b border-[#E2E1DD] first:border-t first:border-[#E2E1DD] group">
            <span class="font-body text-xs tracking-widest uppercase text-[#B4B3B0] mt-1 flex-shrink-0 w-6">
              <?= $step['num'] ?>
            </span>
            <div>
              <h3 class="font-heading text-2xl font-light text-[#111110] mb-3 group-hover:text-[#3D5A73] transition-colors duration-300">
                <?= htmlspecialchars($step['title']) ?>
              </h3>
              <p class="font-body text-sm leading-relaxed text-[#6B6B68] max-w-[52ch]">
                <?= htmlspecialchars($step['desc']) ?>
              </p>
            </div>
          </div>
        <?php endforeach; ?>

      </div>
    </div>

  </div>
</section>

<!-- ============================================================
     ABOUT — Philosophy statement
     ============================================================ -->
<section class="py-32 px-6 bg-[#F0EFEB]">
  <div class="max-w-[1200px] mx-auto">

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

      <div class="lg:col-span-5" data-reveal>
        <div class="relative overflow-hidden rounded-[3px] aspect-[3/4]">
          <img
            src="/assets/library/gallery/vs-gal_open-notebook_professional-coaching_warm_dark-text.jpeg"
            alt="Open notebook on a desk — professional workspace"
            class="w-full h-full object-cover"
            width="800" height="800"
            loading="lazy">
        </div>
      </div>

      <div class="lg:col-span-6 lg:col-start-7" data-reveal>
        <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-6">About Studioform</p>
        <blockquote class="font-heading text-[clamp(1.75rem,3.5vw,2.5rem)] font-light leading-[1.3] tracking-tight text-[#111110] mb-10">
          "We believe good design is mostly restraint. The best work we do isn't adding — it's knowing what to leave out."
        </blockquote>
        <p class="font-body text-sm leading-relaxed text-[#6B6B68] max-w-[48ch] mb-8">
          Studioform is a small practice. That's intentional. We take on a limited number of projects each year so that every client gets the attention the work deserves. Our clients are founders, cultural directors, and product leads who understand that design is a business investment, not a decoration budget.
        </p>
        <a href="/about" class="inline-flex items-center gap-2 font-body text-sm tracking-widest uppercase text-[#111110] hover:text-[#3D5A73] transition-colors duration-200">
          Our story <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
        </a>
      </div>

    </div>

  </div>
</section>

<!-- ============================================================
     TESTIMONIALS — Selected client voices
     ============================================================ -->
<section class="py-32 px-6">
  <div class="max-w-[1200px] mx-auto">

    <div class="mb-16" data-reveal>
      <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-4">What clients say</p>
      <h2 class="font-heading text-[clamp(2.5rem,5vw,3.75rem)] font-light leading-tight tracking-tight text-[#111110]">
        The work, reflected.
      </h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8" data-reveal-stagger>

      <?php
      $testimonials = [
        [
          'quote' => "Working with Studioform changed how we think about our brand entirely. They didn't give us a logo — they gave us a language.",
          'name'  => 'Anders Lindqvist',
          'role'  => 'Founder, Nordisk Furniture',
        ],
        [
          'quote' => "The website they built for us is the best thing on our portfolio. Clients mention it in the first meeting. That's never happened before.",
          'name'  => 'Elena Marchetti',
          'role'  => 'Director, Arkiteka Studio',
        ],
        [
          'quote' => "Rigorous, considered, and honest. They pushed back when we were wrong. That's rare and invaluable in a design partner.",
          'name'  => 'Priya Nair',
          'role'  => 'CEO, Forme Skincare',
        ],
      ];
      foreach ($testimonials as $t): ?>
        <div class="flex flex-col">
          <div class="flex gap-1 mb-6">
            <?php for ($i = 0; $i < 5; $i++): ?>
              <i class="icon-sm text-[#3D5A73]" data-lucide="star" aria-hidden="true"></i>
            <?php endfor; ?>
          </div>
          <blockquote class="font-heading text-xl font-light leading-relaxed text-[#111110] mb-8 flex-grow">
            "<?= htmlspecialchars($t['quote']) ?>"
          </blockquote>
          <div class="border-t border-[#E2E1DD] pt-6">
            <p class="font-body text-sm font-medium text-[#111110]"><?= htmlspecialchars($t['name']) ?></p>
            <p class="font-body text-xs text-[#6B6B68] mt-1"><?= htmlspecialchars($t['role']) ?></p>
          </div>
        </div>
      <?php endforeach; ?>

    </div>

  </div>
</section>

<!-- ============================================================
     CTA — Start a project
     ============================================================ -->
<section class="relative overflow-hidden py-40 px-6" style="background-image: url(/assets/library/backgrounds/vs-bg_navy-folds_abstract_cool_dark_light-text.jpeg); background-size: cover; background-position: center;">
  <div class="absolute inset-0 bg-[#111110] opacity-75"></div>
  <div class="relative z-10 max-w-[1200px] mx-auto text-center" data-reveal>
    <p class="font-body text-xs tracking-widest uppercase text-white/40 mb-6">Ready to begin?</p>
    <h2 class="font-heading text-[clamp(3rem,7vw,5rem)] font-light leading-tight tracking-tight text-white mb-10" style="text-shadow: 0 2px 40px rgba(0,0,0,0.4);">
      Let's make something<br>worth remembering.
    </h2>
    <a href="/contact" class="inline-flex items-center gap-3 font-body text-sm font-medium tracking-widest uppercase text-[#111110] bg-white px-10 py-5 rounded-[2px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      Start a project
      <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
    </a>
  </div>
</section>

<?php include '_partials/footer.php'; ?>