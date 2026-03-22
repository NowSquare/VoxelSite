<?php
$siteName = 'Studioform';
$page = [
  'title'       => 'Services',
  'description' => "Studioform offers brand identity systems, website design, and creative strategy. Structured engagements designed for organisations who care about lasting design.",
  'slug'        => 'services',
];
include '_partials/header.php';
?>

<!-- ============================================================
     SERVICES HEADER
     ============================================================ -->
<section class="pt-32 pb-20 px-6">
  <div class="max-w-[1200px] mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div class="lg:col-span-7" data-reveal>
        <p class="font-body text-xs tracking-widest uppercase text-[#6B6B68] mb-6">Services</p>
        <h1 class="font-heading text-[clamp(3rem,7vw,5rem)] font-light leading-[1.05] tracking-tight text-[#111110] mb-8">
          Considered work,<br>structured engagements.
        </h1>
        <p class="font-body text-base leading-relaxed text-[#6B6B68] max-w-[50ch]">
          Three disciplines, one studio. We don't offer everything to everyone — we do fewer things exceptionally well.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- ============================================================
     SERVICE 01 — Brand Identity
     ============================================================ -->
<section class="py-24 px-6 border-t border-[#E2E1DD]">
  <div class="max-w-[1200px] mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start" data-reveal>

      <!-- Image -->
      <div class="lg:col-span-5 order-2 lg:order-1">
        <div class="relative overflow-hidden rounded-[3px] aspect-[4/5]">
          <img
            src="/assets/library/gallery/vs-gal_shell-spiral_architecture-abstract_light_dark-text.jpeg"
            alt="Shell spiral — architecture abstract form"
            class="w-full h-full object-cover"
            width="800" height="800"
            loading="lazy">
        </div>
      </div>

      <!-- Text -->
      <div class="lg:col-span-6 lg:col-start-7 order-1 lg:order-2 pt-4">
        <span class="font-body text-xs tracking-widest uppercase text-[#3D5A73] mb-4 block">01</span>
        <h2 class="font-heading text-[clamp(2.25rem,4vw,3.25rem)] font-light leading-tight tracking-tight text-[#111110] mb-6">
          Brand Identity
        </h2>
        <p class="font-body text-base leading-relaxed text-[#6B6B68] mb-8 max-w-[48ch]">
          A visual identity system that holds together across every touchpoint — from a business card to a billboard, from digital product to physical packaging.
        </p>

        <div class="space-y-0 mb-10">
          <?php
          $deliverables = [
            'Logo system & variations',
            'Typography system',
            'Colour palette & usage rules',
            'Iconography & illustration direction',
            'Brand guidelines document',
            'Asset library (print & digital)',
          ];
          foreach ($deliverables as $d): ?>
            <div class="flex items-center gap-4 py-4 border-b border-[#E2E1DD] last:border-0">
              <i class="icon-sm text-[#3D5A73] flex-shrink-0" data-lucide="check" aria-hidden="true"></i>
              <span class="font-body text-sm text-[#6B6B68]"><?= htmlspecialchars($d) ?></span>
            </div>
          <?php endforeach; ?>
        </div>

        <div class="flex items-center gap-6">
          <div>
            <p class="font-body text-xs tracking-widest uppercase text-[#B4B3B0] mb-1">Starting from</p>
            <p class="font-heading text-2xl font-light text-[#111110]">£8,000</p>
          </div>
          <a href="/contact" class="inline-flex items-center gap-2 font-body text-sm font-medium tracking-widest uppercase text-white bg-[#111110] px-7 py-4 rounded-[2px] transition-all duration-200 hover:bg-[#3D5A73] hover:-translate-y-0.5">
            Enquire <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ============================================================
     SERVICE 02 — Website Design
     ============================================================ -->
<section class="py-24 px-6 border-t border-[#E2E1DD] bg-[#F0EFEB]">
  <div class="max-w-[1200px] mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start" data-reveal>

      <!-- Text -->
      <div class="lg:col-span-6 pt-4">
        <span class="font-body text-xs tracking-widest uppercase text-[#3D5A73] mb-4 block">02</span>
        <h2 class="font-heading text-[clamp(2.25rem,4vw,3.25rem)] font-light leading-tight tracking-tight text-[#111110] mb-6">
          Website Design
        </h2>
        <p class="font-body text-base leading-relaxed text-[#6B6B68] mb-8 max-w-[48ch]">
          Not templates. Not page builders. Designed from first principles for the specific business, built to be fast, accessible, and maintainable.
        </p>

        <div class="space-y-0 mb-10">
          <?php
          $web = [
            'UX strategy & sitemap',
            'Visual design (all pages + states)',
            'Responsive design (mobile + desktop)',
            'Design system documentation',
            'Hand-off to development or build',
            'Post-launch support',
          ];
          foreach ($web as $d): ?>
            <div class="flex items-center gap-4 py-4 border-b border-[#E2E1DD] last:border-0">
              <i class="icon-sm text-[#3D5A73] flex-shrink-0" data-lucide="check" aria-hidden="true"></i>
              <span class="font-body text-sm text-[#6B6B68]"><?= htmlspecialchars($d) ?></span>
            </div>
          <?php endforeach; ?>
        </div>

        <div class="flex items-center gap-6">
          <div>
            <p class="font-body text-xs tracking-widest uppercase text-[#B4B3B0] mb-1">Starting from</p>
            <p class="font-heading text-2xl font-light text-[#111110]">£6,000</p>
          </div>
          <a href="/contact" class="inline-flex items-center gap-2 font-body text-sm font-medium tracking-widest uppercase text-white bg-[#111110] px-7 py-4 rounded-[2px] transition-all duration-200 hover:bg-[#3D5A73] hover:-translate-y-0.5">
            Enquire <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>

      <!-- Image -->
      <div class="lg:col-span-5 lg:col-start-8">
        <div class="relative overflow-hidden rounded-[3px] aspect-[4/5]">
          <img
            src="/assets/library/gallery/vs-gal_diagonal-rails_interior-editorial_cool_dark-text.jpeg"
            alt="Diagonal rails — interior editorial photography"
            class="w-full h-full object-cover"
            width="800" height="800"
            loading="lazy">
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ============================================================
     SERVICE 03 — Creative Strategy
     ============================================================ -->
<section class="py-24 px-6 border-t border-[#E2E1DD]">
  <div class="max-w-[1200px] mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start" data-reveal>

      <!-- Image -->
      <div class="lg:col-span-5 order-2 lg:order-1">
        <div class="relative overflow-hidden rounded-[3px] aspect-[4/5]">
          <img
            src="/assets/library/gallery/vs-gal_desk-journal_professional-coaching_warm_dark-text.jpeg"
            alt="Desk journal — professional coaching workspace"
            class="w-full h-full object-cover"
            width="800" height="800"
            loading="lazy">
        </div>
      </div>

      <!-- Text -->
      <div class="lg:col-span-6 lg:col-start-7 order-1 lg:order-2 pt-4">
        <span class="font-body text-xs tracking-widest uppercase text-[#3D5A73] mb-4 block">03</span>
        <h2 class="font-heading text-[clamp(2.25rem,4vw,3.25rem)] font-light leading-tight tracking-tight text-[#111110] mb-6">
          Creative Strategy
        </h2>
        <p class="font-body text-base leading-relaxed text-[#6B6B68] mb-8 max-w-[48ch]">
          The thinking before the making. Positioning, narrative, audience definition, and competitive differentiation. Without this, design is guesswork.
        </p>

        <div class="space-y-0 mb-10">
          <?php
          $strat = [
            'Brand audit & competitive landscape',
            'Positioning statement & narrative',
            'Audience definition & personas',
            'Brand voice & tone guidelines',
            'Creative direction brief',
            'Campaign concept development',
          ];
          foreach ($strat as $d): ?>
            <div class="flex items-center gap-4 py-4 border-b border-[#E2E1DD] last:border-0">
              <i class="icon-sm text-[#3D5A73] flex-shrink-0" data-lucide="check" aria-hidden="true"></i>
              <span class="font-body text-sm text-[#6B6B68]"><?= htmlspecialchars($d) ?></span>
            </div>
          <?php endforeach; ?>
        </div>

        <div class="flex items-center gap-6">
          <div>
            <p class="font-body text-xs tracking-widest uppercase text-[#B4B3B0] mb-1">Starting from</p>
            <p class="font-heading text-2xl font-light text-[#111110]">£4,000</p>
          </div>
          <a href="/contact" class="inline-flex items-center gap-2 font-body text-sm font-medium tracking-widest uppercase text-white bg-[#111110] px-7 py-4 rounded-[2px] transition-all duration-200 hover:bg-[#3D5A73] hover:-translate-y-0.5">
            Enquire <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ============================================================
     BUNDLED ENGAGEMENTS
     ============================================================ -->
<section class="py-24 px-6 bg-[#111110]">
  <div class="max-w-[1200px] mx-auto">
    <div class="mb-16" data-reveal>
      <p class="font-body text-xs tracking-widest uppercase text-white/30 mb-4">Most popular</p>
      <h2 class="font-heading text-[clamp(2.5rem,5vw,3.75rem)] font-light leading-tight tracking-tight text-white">
        Full-studio engagements.
      </h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10" data-reveal-stagger>

      <!-- Bundle 1 -->
      <div class="bg-[#111110] p-12">
        <h3 class="font-heading text-2xl font-light text-white mb-3">Brand Launch</h3>
        <p class="font-body text-sm text-white/40 mb-8 max-w-[40ch] leading-relaxed">
          Strategy + Identity. Everything you need to enter the market with clarity and confidence.
        </p>
        <div class="space-y-3 mb-10">
          <?php foreach (['Creative strategy', 'Complete identity system', 'Brand guidelines'] as $item): ?>
            <div class="flex items-center gap-3">
              <i class="icon-sm text-[#3D5A73]" data-lucide="check" aria-hidden="true"></i>
              <span class="font-body text-sm text-white/60"><?= htmlspecialchars($item) ?></span>
            </div>
          <?php endforeach; ?>
        </div>
        <p class="font-heading text-3xl font-light text-white">From £10,000</p>
      </div>

      <!-- Bundle 2 -->
      <div class="bg-[#111110] p-12">
        <h3 class="font-heading text-2xl font-light text-white mb-3">Full Presence</h3>
        <p class="font-body text-sm text-white/40 mb-8 max-w-[40ch] leading-relaxed">
          Strategy + Identity + Website. End to end — from positioning to a live, designed website.
        </p>
        <div class="space-y-3 mb-10">
          <?php foreach (['Creative strategy', 'Complete identity system', 'Website design & build'] as $item): ?>
            <div class="flex items-center gap-3">
              <i class="icon-sm text-[#3D5A73]" data-lucide="check" aria-hidden="true"></i>
              <span class="font-body text-sm text-white/60"><?= htmlspecialchars($item) ?></span>
            </div>
          <?php endforeach; ?>
        </div>
        <p class="font-heading text-3xl font-light text-white">From £16,000</p>
      </div>

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
        Not sure where to start?
      </h2>
      <p class="font-body text-sm text-[#6B6B68]">Tell us what you're trying to achieve. We'll figure out the right scope together.</p>
    </div>
    <a href="/contact" class="flex-shrink-0 inline-flex items-center gap-2 font-body text-sm font-medium tracking-widest uppercase text-white bg-[#111110] px-8 py-4 rounded-[2px] transition-all duration-200 hover:bg-[#3D5A73] hover:-translate-y-0.5">
      Get in touch <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
    </a>
  </div>
</section>

<?php include '_partials/footer.php'; ?>