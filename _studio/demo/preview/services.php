<?php
$siteName = 'Studioform';
$page = [
  'title'       => 'Services',
  'description' => 'Brand identity systems, website design, and creative strategy from Studioform — a small design practice for startups, cultural organisations, and product companies.',
  'slug'        => 'services',
];
include '_partials/header.php';
?>

<!-- Page Header -->
<section class="pt-40 pb-20 px-6 lg:px-10 max-w-[var(--max-width)] mx-auto">
  <div data-reveal>
    <p class="text-xs tracking-[0.14em] uppercase text-[var(--color-muted)] font-medium mb-6">What we offer</p>
    <h1 class="font-['Cormorant_Garamond'] text-[clamp(3rem,6vw,5.5rem)] font-light text-[var(--color-ink)] leading-[1.05] max-w-2xl">
      Three things.<br>Done well.
    </h1>
  </div>
</section>

<!-- Service 01 — Brand Identity -->
<section class="py-20 border-t border-[var(--color-border)]">
  <div class="max-w-[var(--max-width)] mx-auto px-6 lg:px-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24" data-reveal>
      <div>
        <span class="text-xs tracking-[0.12em] uppercase text-[var(--color-muted)] font-medium">01</span>
        <h2 class="font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light text-[var(--color-ink)] leading-[1.1] mt-4 mb-8">
          Brand Identity
        </h2>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light mb-6 max-w-md">
          We build visual identity systems that hold together across every touchpoint — from a business card to a billboard, from a website to a packaging label.
        </p>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light max-w-md">
          Identity work starts from the inside out. We understand your positioning before we consider the mark, and the system before we finalise the logo. The result is a brand that doesn't just look right — it thinks right.
        </p>
      </div>
      <div>
        <ul class="list-none flex flex-col gap-0">
          <?php
          $identityItems = [
            "Brand strategy and positioning",
            "Logo and wordmark design",
            "Typography systems",
            "Colour palette development",
            "Iconography and illustration direction",
            "Photography and art direction guidelines",
            "Brand guidelines and usage documentation",
            "Stationery and print collateral",
            "Packaging design",
            "Brand rollout support",
          ];
          foreach ($identityItems as $item): ?>
          <li class="flex items-center gap-4 py-4 border-b border-[var(--color-border)] text-sm text-[var(--color-muted)] font-light">
            <i class="icon-sm text-[var(--color-ink)] flex-shrink-0" data-lucide="minus" aria-hidden="true"></i>
            <?= htmlspecialchars($item) ?>
          </li>
          <?php endforeach; ?>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- Service 02 — Website Design -->
<section class="py-20 border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]">
  <div class="max-w-[var(--max-width)] mx-auto px-6 lg:px-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24" data-reveal>
      <div>
        <span class="text-xs tracking-[0.12em] uppercase text-[var(--color-muted)] font-medium">02</span>
        <h2 class="font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light text-[var(--color-ink)] leading-[1.1] mt-4 mb-8">
          Website Design
        </h2>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light mb-6 max-w-md">
          We design and build websites that are considered as objects. Every element earns its place. Every interaction is intentional. The result is a site that performs as well as it looks.
        </p>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light max-w-md">
          We work across CMS and custom-built environments, and we're comfortable leading both the design and the build or working alongside an existing development team.
        </p>
      </div>
      <div>
        <ul class="list-none flex flex-col gap-0">
          <?php
          $webItems = [
            "UX strategy and site architecture",
            "Wireframing and content mapping",
            "Visual design and prototyping",
            "Responsive, accessible HTML/CSS",
            "CMS integration and configuration",
            "Performance optimisation",
            "SEO foundations",
            "Animation and interaction design",
            "Ongoing support and iteration",
          ];
          foreach ($webItems as $item): ?>
          <li class="flex items-center gap-4 py-4 border-b border-[var(--color-border)] text-sm text-[var(--color-muted)] font-light">
            <i class="icon-sm text-[var(--color-ink)] flex-shrink-0" data-lucide="minus" aria-hidden="true"></i>
            <?= htmlspecialchars($item) ?>
          </li>
          <?php endforeach; ?>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- Service 03 — Creative Strategy -->
<section class="py-20 border-t border-[var(--color-border)]">
  <div class="max-w-[var(--max-width)] mx-auto px-6 lg:px-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24" data-reveal>
      <div>
        <span class="text-xs tracking-[0.12em] uppercase text-[var(--color-muted)] font-medium">03</span>
        <h2 class="font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light text-[var(--color-ink)] leading-[1.1] mt-4 mb-8">
          Creative Strategy
        </h2>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light mb-6 max-w-md">
          Sometimes the problem isn't a logo — it's the story behind it. We offer standalone strategy engagements for organisations working through a rebrand, a pivot, or a launch.
        </p>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light max-w-md">
          Strategy engagements can stand alone or feed directly into identity and web projects. Either way, the thinking is rigorous, the outcomes are practical, and the direction is one you can act on immediately.
        </p>
      </div>
      <div>
        <ul class="list-none flex flex-col gap-0">
          <?php
          $strategyItems = [
            "Brand audit and competitive review",
            "Audience research and persona definition",
            "Positioning and differentiation",
            "Brand narrative and messaging framework",
            "Tone of voice development",
            "Campaign and content strategy",
            "Creative brief writing",
            "Brand naming",
            "Launch strategy",
          ];
          foreach ($strategyItems as $item): ?>
          <li class="flex items-center gap-4 py-4 border-b border-[var(--color-border)] text-sm text-[var(--color-muted)] font-light">
            <i class="icon-sm text-[var(--color-ink)] flex-shrink-0" data-lucide="minus" aria-hidden="true"></i>
            <?= htmlspecialchars($item) ?>
          </li>
          <?php endforeach; ?>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- Who we work with -->
<section class="py-24 lg:py-32 bg-[var(--color-ink)]" data-reveal>
  <div class="max-w-[var(--max-width)] mx-auto px-6 lg:px-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-end">
      <div>
        <p class="text-xs tracking-[0.14em] uppercase text-white/30 font-medium mb-6">Who we work with</p>
        <h2 class="font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.8rem)] font-light text-white leading-[1.1]">
          Clients who care how<br><em class="italic">they show up.</em>
        </h2>
      </div>
      <div class="flex flex-col gap-6">
        <p class="text-sm text-white/50 leading-relaxed font-light">
          We work with startups navigating their first public identity, cultural organisations building presence and authority, and product companies that want design to be a genuine competitive advantage.
        </p>
        <p class="text-sm text-white/50 leading-relaxed font-light">
          What unites them is a genuine belief that how they present themselves in the world matters — and a willingness to invest in getting it right.
        </p>
        <a href="/contact" class="mt-2 inline-flex items-center gap-2 text-sm font-medium tracking-[0.08em] uppercase text-white border-b border-white/30 pb-1 hover:border-white transition-colors duration-300 w-max">
          Start a conversation
          <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
        </a>
      </div>
    </div>
  </div>
</section>

<?php include '_partials/footer.php'; ?>