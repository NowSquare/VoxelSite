<?php
$siteName = 'Studioform';
$page = [
  'title'       => 'About',
  'description' => 'Studioform is a small brand and digital design practice. We work closely with a select number of clients each year on brand identity, website design, and creative strategy.',
  'slug'        => 'about',
];
include '_partials/header.php';
?>

<!-- Page Header -->
<section class="pt-40 pb-20 px-6 lg:px-10 max-w-[var(--max-width)] mx-auto">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-end" data-reveal>
    <div>
      <p class="text-xs tracking-[0.14em] uppercase text-[var(--color-muted)] font-medium mb-6">The studio</p>
      <h1 class="font-['Cormorant_Garamond'] text-[clamp(3rem,6vw,5.5rem)] font-light text-[var(--color-ink)] leading-[1.05]">
        Small by<br><em class="italic">design.</em>
      </h1>
    </div>
    <div>
      <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light max-w-md">
        Studioform is a brand and digital design practice. We are deliberately small — a core team who work closely with clients from the first conversation through to the final file.
      </p>
    </div>
  </div>
</section>

<!-- Full-bleed image -->
<div class="relative overflow-hidden w-full" style="height: clamp(300px, 45vw, 600px);" data-reveal>
  <img
    src="/assets/library/gallery/vs-gal_diagonal-rails_interior-editorial_cool_dark-text.jpeg"
    alt="Diagonal architectural rails — editorial interior photography"
    class="w-full h-full object-cover"
    loading="lazy"
    width="800" height="800">
</div>

<!-- Philosophy -->
<section class="py-24 lg:py-36 px-6 lg:px-10 max-w-[var(--max-width)] mx-auto">
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0">
    <div class="lg:col-span-3" data-reveal>
      <p class="text-xs tracking-[0.14em] uppercase text-[var(--color-muted)] font-medium pt-2">Our philosophy</p>
    </div>
    <div class="lg:col-span-7 lg:col-start-5 flex flex-col gap-6" data-reveal>
      <p class="font-['Cormorant_Garamond'] text-2xl font-light text-[var(--color-ink)] leading-[1.4] italic">
        "We believe that design is not decoration. It is how a business thinks made visible. When the thinking is clear, the design takes care of itself."
      </p>
      <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
        We started Studioform because we kept seeing the same problem: organisations investing in design without first investing in clarity. The logo would change but the positioning wouldn't. The website would launch but the story was still muddled. The identity would look better but communicate the same ambiguity as before.
      </p>
      <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
        Our practice is built on the conviction that design and strategy are not separate disciplines. The best identity work is strategic. The best strategy work is creative. We see the two as inseparable, and we structure every engagement accordingly.
      </p>
      <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
        The work we make is minimal not because minimalism is fashionable — it has not always been and will not always be — but because we believe clarity is the highest form of respect for an audience. When a brand communicates without ambiguity, people listen. When they listen, they act. That is the return on good design.
      </p>
    </div>
  </div>
</section>

<!-- Values -->
<section class="py-24 lg:py-32 bg-[var(--color-bg-alt)]">
  <div class="max-w-[var(--max-width)] mx-auto px-6 lg:px-10">
    <div class="mb-16" data-reveal>
      <p class="text-xs tracking-[0.14em] uppercase text-[var(--color-muted)] font-medium mb-5">What we stand for</p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12" data-reveal-stagger>

      <div class="pt-8 border-t border-[var(--color-border)]">
        <h3 class="text-base font-medium text-[var(--color-ink)] mb-4">Clarity over cleverness</h3>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
          We are not interested in design that demands to be noticed. We are interested in design that communicates, then steps aside. The brand should be remembered. The design should be invisible.
        </p>
      </div>

      <div class="pt-8 border-t border-[var(--color-border)]">
        <h3 class="text-base font-medium text-[var(--color-ink)] mb-4">Built to last</h3>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
          We do not chase trends. We build identities that look as right in ten years as they do today — grounded in proportion, balance, and considered restraint rather than the mood of the moment.
        </p>
      </div>

      <div class="pt-8 border-t border-[var(--color-border)]">
        <h3 class="text-base font-medium text-[var(--color-ink)] mb-4">Close collaboration</h3>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
          We are not a production studio. We take a small number of projects each year and are involved at every stage. Our clients get direct access to the people actually doing the work.
        </p>
      </div>

      <div class="pt-8 border-t border-[var(--color-border)]">
        <h3 class="text-base font-medium text-[var(--color-ink)] mb-4">Strategy first</h3>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
          Every project begins with understanding before making. We do not produce creative work without knowing the position it needs to occupy and the audience it needs to reach.
        </p>
      </div>

      <div class="pt-8 border-t border-[var(--color-border)]">
        <h3 class="text-base font-medium text-[var(--color-ink)] mb-4">Honest craft</h3>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
          We make things that work. Type set correctly. Colour chosen deliberately. Space used with intention. The craft is not decoration — it is evidence that the thinking was sound.
        </p>
      </div>

      <div class="pt-8 border-t border-[var(--color-border)]">
        <h3 class="text-base font-medium text-[var(--color-ink)] mb-4">Long-term thinking</h3>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
          We measure success not at launch but over time. The best projects we have worked on are ones where the clients return, the brand grows, and the design holds. That is what we build for.
        </p>
      </div>

    </div>
  </div>
</section>

<!-- Clients section -->
<section class="py-24 lg:py-32 px-6 lg:px-10">
  <div class="max-w-[var(--max-width)] mx-auto" data-reveal>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
      <div>
        <p class="text-xs tracking-[0.14em] uppercase text-[var(--color-muted)] font-medium mb-6">Clients &amp; collaborators</p>
        <h2 class="font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light text-[var(--color-ink)] leading-[1.1] mb-8">
          Organisations we have<br><em class="italic">had the privilege of working with.</em>
        </h2>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light max-w-md mb-10">
          Our clients are startups, cultural organisations, and product companies — united by a shared conviction that how they present themselves in the world is worth getting right.
        </p>
        <a href="/portfolio" class="inline-flex items-center gap-2 text-sm font-medium tracking-[0.08em] uppercase text-[var(--color-ink)] border-b border-[var(--color-ink)] pb-1 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors duration-300">
          See the work
          <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
        </a>
      </div>
      <div class="grid grid-cols-2 gap-px bg-[var(--color-border)]" data-reveal-stagger>
        <?php
        $clients = ["Halden", "Carver & Bell", "Forme", "Meridian", "Eastpoint Gallery", "Vault Studio", "Beacon Health", "Noorden"];
        foreach ($clients as $client): ?>
        <div class="bg-[var(--color-bg)] flex items-center justify-center py-10 px-6">
          <span class="text-sm font-medium text-[var(--color-muted)] text-center tracking-tight">
            <?= htmlspecialchars($client) ?>
          </span>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="py-24 bg-[var(--color-ink)]" data-reveal>
  <div class="max-w-[var(--max-width)] mx-auto px-6 lg:px-10 text-center">
    <h2 class="font-['Cormorant_Garamond'] text-[clamp(2.5rem,5vw,4.5rem)] font-light text-white leading-[1.05] mb-10">
      Ready to begin?
    </h2>
    <a href="/contact" class="inline-flex items-center gap-2 text-sm font-medium tracking-[0.08em] uppercase text-white border-b border-white/40 pb-1 hover:border-white transition-colors duration-300">
      Get in touch
      <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
    </a>
  </div>
</section>

<?php include '_partials/footer.php'; ?>