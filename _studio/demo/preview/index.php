<?php
$siteName = 'Studioform';
$page = [
  'title'       => 'Brand & Digital Design Practice',
  'description' => "Studioform is a small brand and digital design practice. We do three things well: brand identity systems, website design, and creative strategy. Work that is minimal, considered, and built to last.",
  'slug'        => 'home',
];
include '_partials/header.php';
?>

<!-- ============================================================
     HERO
     ============================================================ -->
<section class="min-h-[92vh] flex flex-col justify-end pt-36 pb-20 px-6 lg:px-10 max-w-[var(--max-width)] mx-auto">

  <div class="max-w-4xl" data-reveal>
    <p class="text-xs tracking-[0.14em] uppercase text-[var(--color-muted)] font-medium mb-8">
      Brand &amp; Digital Design Practice
    </p>
    <h1 class="font-['Cormorant_Garamond'] text-[clamp(3rem,7vw,6.5rem)] font-light leading-[1.05] tracking-tight text-[var(--color-ink)] mb-10">
      We design brands<br>
      <em class="italic">worth noticing.</em>
    </h1>
    <div class="flex flex-col sm:flex-row items-start gap-6">
      <a href="/portfolio"
         class="inline-flex items-center gap-2 text-sm font-medium tracking-[0.08em] uppercase text-[var(--color-ink)] border-b border-[var(--color-ink)] pb-1 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors duration-300">
        View our work
        <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
      </a>
      <a href="/contact"
         class="inline-flex items-center gap-2 text-sm font-medium tracking-[0.08em] uppercase text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors duration-300">
        Start a project
      </a>
    </div>
  </div>

  <!-- Scroll indicator -->
  <div class="mt-20 flex items-center gap-4" data-reveal>
    <div class="w-px h-12 bg-[var(--color-border)]"></div>
    <p class="text-xs tracking-[0.1em] uppercase text-[var(--color-muted)] font-light">Selected work below</p>
  </div>
</section>

<!-- ============================================================
     FEATURED PROJECTS
     ============================================================ -->
<section class="py-4 px-6 lg:px-10 max-w-[var(--max-width)] mx-auto" id="work">

  <!-- Project 01 — Scandinavian furniture maker -->
  <article class="featured-project grid grid-cols-1 lg:grid-cols-2 gap-0 mb-2 group" data-reveal>
    <div class="relative overflow-hidden aspect-[4/3] lg:aspect-auto lg:min-h-[560px]">
      <img
        src="/assets/library/gallery/vs-gal_concrete-frame_architecture-minimal_light_dark-text.jpeg"
        alt="Minimal concrete architecture — Halden furniture rebrand identity system"
        class="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        loading="lazy"
        width="800" height="800">
      <div class="absolute inset-0 bg-[var(--color-ink)] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
    </div>
    <div class="bg-[var(--color-bg-alt)] flex flex-col justify-between p-10 lg:p-14">
      <div>
        <span class="text-xs tracking-[0.12em] uppercase text-[var(--color-muted)] font-medium">01 — Brand Identity</span>
        <h2 class="font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,3rem)] font-light leading-[1.1] mt-4 mb-6 text-[var(--color-ink)]">
          Halden — Complete rebrand for a Scandinavian furniture maker
        </h2>
        <p class="text-sm leading-relaxed text-[var(--color-muted)] max-w-sm font-light">
          A ground-up identity system capturing the quiet precision of Nordic craft. Wordmark, type hierarchy, colour system, and brand guidelines across print and digital.
        </p>
      </div>
      <div class="mt-10 flex items-center gap-3">
        <a href="/portfolio" class="text-xs tracking-[0.1em] uppercase font-medium text-[var(--color-ink)] inline-flex items-center gap-2 border-b border-[var(--color-ink)] pb-1 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors duration-300">
          View project
          <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
        </a>
        <span class="text-xs text-[var(--color-muted)] font-light ml-auto">Furniture / Scandinavian</span>
      </div>
    </div>
  </article>

  <!-- Project 02 — London architecture practice -->
  <article class="featured-project grid grid-cols-1 lg:grid-cols-2 gap-0 mb-2 group" data-reveal>
    <div class="bg-[var(--color-ink)] flex flex-col justify-between p-10 lg:p-14 lg:order-first order-last">
      <div>
        <span class="text-xs tracking-[0.12em] uppercase text-white/40 font-medium">02 — Web &amp; Identity</span>
        <h2 class="font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,3rem)] font-light leading-[1.1] mt-4 mb-6 text-white">
          Carver &amp; Bell — Website and visual identity for a London architecture practice
        </h2>
        <p class="text-sm leading-relaxed text-white/60 max-w-sm font-light">
          From naming through to launch. A portfolio site built around the project photography with a type-led identity that reflects the firm's structural sensibility.
        </p>
      </div>
      <div class="mt-10 flex items-center gap-3">
        <a href="/portfolio" class="text-xs tracking-[0.1em] uppercase font-medium text-white inline-flex items-center gap-2 border-b border-white/40 pb-1 hover:border-white transition-colors duration-300">
          View project
          <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
        </a>
        <span class="text-xs text-white/30 font-light ml-auto">Architecture / London</span>
      </div>
    </div>
    <div class="relative overflow-hidden aspect-[4/3] lg:aspect-auto lg:min-h-[560px]">
      <img
        src="/assets/library/gallery/vs-gal_arched-doorway_architecture-interior_warm_dark-text.jpeg"
        alt="Arched doorway interior — Carver and Bell architecture practice identity"
        class="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        loading="lazy"
        width="800" height="800">
    </div>
  </article>

  <!-- Project 03 — DTC skincare brand strategy -->
  <article class="featured-project grid grid-cols-1 lg:grid-cols-2 gap-0 group" data-reveal>
    <div class="relative overflow-hidden aspect-[4/3] lg:aspect-auto lg:min-h-[560px]">
      <img
        src="/assets/library/gallery/vs-gal_serum-bottle_beauty-retail_light_dark-text.jpeg"
        alt="Minimal serum bottle — Forme skincare brand strategy"
        class="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        loading="lazy"
        width="800" height="800">
    </div>
    <div class="bg-[var(--color-bg-alt)] flex flex-col justify-between p-10 lg:p-14">
      <div>
        <span class="text-xs tracking-[0.12em] uppercase text-[var(--color-muted)] font-medium">03 — Brand Strategy</span>
        <h2 class="font-['Cormorant_Garamond'] text-[clamp(2rem,3.5vw,3rem)] font-light leading-[1.1] mt-4 mb-6 text-[var(--color-ink)]">
          Forme — Brand strategy for a direct-to-consumer skincare line
        </h2>
        <p class="text-sm leading-relaxed text-[var(--color-muted)] max-w-sm font-light">
          Positioning, brand narrative, tone of voice, and visual direction for a new skincare label targeting the considered consumer. From research through to creative brief.
        </p>
      </div>
      <div class="mt-10 flex items-center gap-3">
        <a href="/portfolio" class="text-xs tracking-[0.1em] uppercase font-medium text-[var(--color-ink)] inline-flex items-center gap-2 border-b border-[var(--color-ink)] pb-1 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors duration-300">
          View project
          <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
        </a>
        <span class="text-xs text-[var(--color-muted)] font-light ml-auto">Skincare / DTC</span>
      </div>
    </div>
  </article>

</section>

<!-- View all work link -->
<div class="py-16 px-6 lg:px-10 max-w-[var(--max-width)] mx-auto" data-reveal>
  <a href="/portfolio" class="inline-flex items-center gap-3 text-sm tracking-[0.08em] uppercase font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors duration-300">
    <span class="w-8 h-px bg-current"></span>
    All projects
    <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
  </a>
</div>

<!-- ============================================================
     SERVICES OVERVIEW
     ============================================================ -->
<section class="py-24 lg:py-32 bg-[var(--color-ink)]">
  <div class="max-w-[var(--max-width)] mx-auto px-6 lg:px-10">

    <div class="mb-16" data-reveal>
      <p class="text-xs tracking-[0.14em] uppercase text-white/30 font-medium mb-5">What we do</p>
      <h2 class="font-['Cormorant_Garamond'] text-[clamp(2.5rem,5vw,4.5rem)] font-light text-white leading-[1.05]">
        Three disciplines.<br>One practice.
      </h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10" data-reveal-stagger>

      <!-- Identity -->
      <div class="bg-[var(--color-ink)] p-10 lg:p-12">
        <p class="font-['Cormorant_Garamond'] text-5xl font-light text-white/20 mb-8">01</p>
        <h3 class="text-white text-lg font-medium mb-4 tracking-[-0.01em]">Brand Identity</h3>
        <p class="text-sm text-white/50 leading-relaxed font-light mb-8">
          Visual identity systems built to endure. Logo and wordmark, typography, colour, iconography, photography direction, and the guidelines that hold it all together.
        </p>
        <a href="/services" class="text-xs tracking-[0.1em] uppercase text-white/40 hover:text-white transition-colors duration-200 inline-flex items-center gap-2">
          Learn more
          <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
        </a>
      </div>

      <!-- Web -->
      <div class="bg-[var(--color-ink)] p-10 lg:p-12">
        <p class="font-['Cormorant_Garamond'] text-5xl font-light text-white/20 mb-8">02</p>
        <h3 class="text-white text-lg font-medium mb-4 tracking-[-0.01em]">Website Design</h3>
        <p class="text-sm text-white/50 leading-relaxed font-light mb-8">
          Websites that are designed as much as they are built. Considered structure, refined interaction, and performance that supports the brand rather than undermining it.
        </p>
        <a href="/services" class="text-xs tracking-[0.1em] uppercase text-white/40 hover:text-white transition-colors duration-200 inline-flex items-center gap-2">
          Learn more
          <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
        </a>
      </div>

      <!-- Strategy -->
      <div class="bg-[var(--color-ink)] p-10 lg:p-12">
        <p class="font-['Cormorant_Garamond'] text-5xl font-light text-white/20 mb-8">03</p>
        <h3 class="text-white text-lg font-medium mb-4 tracking-[-0.01em]">Creative Strategy</h3>
        <p class="text-sm text-white/50 leading-relaxed font-light mb-8">
          The thinking before the making. Positioning, audience definition, brand narrative, tone of voice — the strategic foundation that makes the design mean something.
        </p>
        <a href="/services" class="text-xs tracking-[0.1em] uppercase text-white/40 hover:text-white transition-colors duration-200 inline-flex items-center gap-2">
          Learn more
          <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
        </a>
      </div>

    </div>

  </div>
</section>

<!-- ============================================================
     PHILOSOPHY / ABOUT STRIP
     ============================================================ -->
<section class="py-24 lg:py-36 px-6 lg:px-10">
  <div class="max-w-[var(--max-width)] mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

      <div data-reveal>
        <p class="text-xs tracking-[0.14em] uppercase text-[var(--color-muted)] font-medium mb-6">Our approach</p>
        <h2 class="font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.8rem)] font-light text-[var(--color-ink)] leading-[1.1] mb-8">
          No trends.<br>No decoration<br><em class="italic">for its own sake.</em>
        </h2>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed max-w-md font-light mb-6">
          We are a small practice. We work closely with a select number of clients each year and are involved at every stage — from the earliest strategic conversations through to launch and beyond.
        </p>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed max-w-md font-light mb-10">
          The work we make is minimal not because minimalism is fashionable, but because we believe that clarity is kindness. When a brand speaks clearly, its audience listens.
        </p>
        <a href="/about" class="inline-flex items-center gap-2 text-sm font-medium tracking-[0.08em] uppercase text-[var(--color-ink)] border-b border-[var(--color-ink)] pb-1 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors duration-300">
          About the studio
          <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
        </a>
      </div>

      <div class="relative" data-reveal>
        <img
          src="/assets/library/gallery/vs-gal_open-notebook_professional-coaching_warm_dark-text.jpeg"
          alt="Open notebook on a desk — creative process at Studioform"
          class="w-full aspect-[4/5] object-cover"
          loading="lazy"
          width="800" height="800">
        <div class="absolute -bottom-6 -left-6 w-24 h-24 border border-[var(--color-border)] hidden lg:block"></div>
      </div>

    </div>
  </div>
</section>

<!-- ============================================================
     PROCESS
     ============================================================ -->
<section class="py-24 lg:py-32 bg-[var(--color-bg-alt)]">
  <div class="max-w-[var(--max-width)] mx-auto px-6 lg:px-10">

    <div class="mb-16" data-reveal>
      <p class="text-xs tracking-[0.14em] uppercase text-[var(--color-muted)] font-medium mb-5">How we work</p>
      <h2 class="font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.8rem)] font-light text-[var(--color-ink)] leading-[1.1]">
        From discovery<br>to delivery.
      </h2>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" data-reveal-stagger>

      <div class="pt-8 border-t border-[var(--color-border)]">
        <p class="font-['Cormorant_Garamond'] text-4xl text-[var(--color-muted)]/40 font-light mb-6">01</p>
        <h3 class="text-base font-medium text-[var(--color-ink)] mb-3 tracking-[-0.01em]">Discovery</h3>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
          We start by listening. Deeply understanding your business, your audience, and the problem you're asking design to solve.
        </p>
      </div>

      <div class="pt-8 border-t border-[var(--color-border)]">
        <p class="font-['Cormorant_Garamond'] text-4xl text-[var(--color-muted)]/40 font-light mb-6">02</p>
        <h3 class="text-base font-medium text-[var(--color-ink)] mb-3 tracking-[-0.01em]">Strategy</h3>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
          Positioning, direction, and creative brief. We define where you should stand and what your brand should stand for before a single mark is made.
        </p>
      </div>

      <div class="pt-8 border-t border-[var(--color-border)]">
        <p class="font-['Cormorant_Garamond'] text-4xl text-[var(--color-muted)]/40 font-light mb-6">03</p>
        <h3 class="text-base font-medium text-[var(--color-ink)] mb-3 tracking-[-0.01em]">Design</h3>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
          The making. Iterative, focused, and always in dialogue with you. We share work in progress and refine through conversation, not revision rounds.
        </p>
      </div>

      <div class="pt-8 border-t border-[var(--color-border)]">
        <p class="font-['Cormorant_Garamond'] text-4xl text-[var(--color-muted)]/40 font-light mb-6">04</p>
        <h3 class="text-base font-medium text-[var(--color-ink)] mb-3 tracking-[-0.01em]">Delivery</h3>
        <p class="text-sm text-[var(--color-muted)] leading-relaxed font-light">
          Production, implementation, and handover. Every project ends with a full set of assets, guidelines, and the knowledge to use them confidently.
        </p>
      </div>

    </div>
  </div>
</section>

<!-- ============================================================
     TESTIMONIALS
     ============================================================ -->
<section class="py-24 lg:py-36 px-6 lg:px-10">
  <div class="max-w-[var(--max-width)] mx-auto">

    <p class="text-xs tracking-[0.14em] uppercase text-[var(--color-muted)] font-medium mb-16" data-reveal>Selected client voices</p>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

      <blockquote class="flex flex-col gap-6 pt-8 border-t border-[var(--color-border)]" data-reveal>
        <p class="font-['Cormorant_Garamond'] text-xl font-light leading-[1.5] text-[var(--color-ink)] italic">
          "Studioform brought a clarity to our brand that we had been searching for for years. The new identity is precise, considered, and unmistakably ours."
        </p>
        <footer class="mt-auto">
          <p class="text-sm font-medium text-[var(--color-ink)]">Erik Lindqvist</p>
          <p class="text-xs text-[var(--color-muted)] font-light">Creative Director, Halden</p>
        </footer>
      </blockquote>

      <blockquote class="flex flex-col gap-6 pt-8 border-t border-[var(--color-border)]" data-reveal>
        <p class="font-['Cormorant_Garamond'] text-xl font-light leading-[1.5] text-[var(--color-ink)] italic">
          "Working with a studio that understands architecture at both a practical and conceptual level made all the difference. The site communicates who we are without trying too hard."
        </p>
        <footer class="mt-auto">
          <p class="text-sm font-medium text-[var(--color-ink)]">Amara Bell</p>
          <p class="text-xs text-[var(--color-muted)] font-light">Partner, Carver &amp; Bell Architects</p>
        </footer>
      </blockquote>

      <blockquote class="flex flex-col gap-6 pt-8 border-t border-[var(--color-border)]" data-reveal>
        <p class="font-['Cormorant_Garamond'] text-xl font-light leading-[1.5] text-[var(--color-ink)] italic">
          "The brand strategy work set the entire direction for our launch. Studioform went far beyond the brief — they helped us understand who we were for and why that mattered."
        </p>
        <footer class="mt-auto">
          <p class="text-sm font-medium text-[var(--color-ink)]">Priya Nair</p>
          <p class="text-xs text-[var(--color-muted)] font-light">Founder, Forme Skincare</p>
        </footer>
      </blockquote>

    </div>
  </div>
</section>

<!-- ============================================================
     CTA
     ============================================================ -->
<section class="py-24 lg:py-36 bg-[var(--color-ink)]" data-reveal>
  <div class="max-w-[var(--max-width)] mx-auto px-6 lg:px-10 text-center">
    <p class="text-xs tracking-[0.14em] uppercase text-white/30 font-medium mb-8">Work with us</p>
    <h2 class="font-['Cormorant_Garamond'] text-[clamp(2.5rem,6vw,5.5rem)] font-light text-white leading-[1.05] mb-10">
      Have a project<br><em class="italic">in mind?</em>
    </h2>
    <a href="/contact"
       class="inline-flex items-center gap-3 text-sm font-medium tracking-[0.08em] uppercase text-white border-b border-white/40 pb-1 hover:border-white transition-colors duration-300">
      Get in touch
      <i class="icon-sm" data-lucide="arrow-right" aria-hidden="true"></i>
    </a>
  </div>
</section>

<?php include '_partials/footer.php'; ?>