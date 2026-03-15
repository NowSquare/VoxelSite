<?php
$siteName = 'Studioform';
$page = [
  'title'       => 'Brand & Digital Design Practice',
  'description' => 'Studioform is a small brand and digital design practice. We build identity systems, websites, and creative strategy for startups, cultural organisations, and product companies.',
  'slug'        => 'home',
];
include '_partials/header.php';
?>

<!-- ═══════════════════════════════════════════════════
     HERO
════════════════════════════════════════════════════ -->
<section class="hero-section">
  <div class="hero-inner">
    <div class="hero-content">
      <span class="eyebrow" data-reveal>Brand &amp; Digital Design Practice</span>
      <h1 class="hero-headline" data-reveal>We design things<br><em>worth&nbsp;seeing.</em></h1>
      <p class="hero-body" data-reveal>
        Identity systems, websites, and creative strategy for startups,
        cultural organisations, and product companies who care about how
        they show up in the world.
      </p>
      <div class="hero-cta" data-reveal>
        <a href="/work" class="btn-primary">View our work</a>
        <a href="/contact" class="btn-ghost">Start a project</a>
      </div>
    </div>
    <div class="hero-aside" data-reveal>
      <div class="hero-image-wrap">
        <img src="/assets/library/gallery/vs-gal_concrete-frame_architecture-minimal_light_dark-text.png"
             alt="Minimal concrete frame — a study in proportion and light"
             class="hero-image"
             width="800" height="800">
      </div>
      <div class="hero-stat-block">
        <div class="hero-stat">
          <span class="stat-number">12+</span>
          <span class="stat-label">Years of practice</span>
        </div>
        <div class="hero-stat">
          <span class="stat-number">80+</span>
          <span class="stat-label">Projects completed</span>
        </div>
        <div class="hero-stat">
          <span class="stat-number">3</span>
          <span class="stat-label">Disciplines mastered</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════
     SELECTED WORK — FEATURED PROJECTS
════════════════════════════════════════════════════ -->
<section class="section-featured">
  <div class="section-header-row" data-reveal>
    <h2 class="section-heading">Selected work</h2>
    <a href="/work" class="section-link">
      View all projects
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
    </a>
  </div>

  <!-- Project 01 — Large hero project -->
  <article class="project-hero" data-reveal>
    <a href="/work" class="project-hero-image-wrap" aria-label="View Søren &amp; Co. — Brand Identity case study">
      <img src="/assets/library/gallery/vs-gal_shell-spiral_architecture-abstract_light_dark-text.png"
           alt="Shell spiral — abstract architectural geometry, Søren and Co brand study"
           class="project-hero-image"
           width="800" height="800"
           loading="lazy">
      <div class="project-hero-overlay"></div>
    </a>
    <div class="project-hero-meta">
      <span class="project-tag">Brand Identity</span>
      <h3 class="project-hero-title">
        <a href="/work">Søren &amp; Co.</a>
      </h3>
      <p class="project-hero-desc">
        Complete rebrand for a Scandinavian furniture maker. A visual language
        rooted in craft, material honesty, and Nordic restraint — applied across
        packaging, digital, and showroom environments.
      </p>
      <a href="/work" class="project-cta-link">
        View case study
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </a>
    </div>
  </article>

  <!-- Projects 02 & 03 — Side by side -->
  <div class="project-pair" data-reveal-stagger>

    <article class="project-card">
      <a href="/work" class="project-card-image-wrap" aria-label="View Meridian Architects case study">
        <img src="/assets/library/gallery/vs-gal_sunlit-stairwell_architecture-interior_light_dark-text.png"
             alt="Sunlit stairwell interior — Meridian Architects identity project"
             class="project-card-image"
             width="800" height="800"
             loading="lazy">
      </a>
      <div class="project-card-meta">
        <span class="project-tag">Website &amp; Identity</span>
        <h3 class="project-card-title"><a href="/work">Meridian Architects</a></h3>
        <p class="project-card-desc">Website and visual identity for a London architecture practice. Systematic, architectural typography meets generous white space.</p>
        <a href="/work" class="project-cta-link">
          View case study
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    </article>

    <article class="project-card">
      <a href="/work" class="project-card-image-wrap" aria-label="View Forma Skincare case study">
        <img src="/assets/library/gallery/vs-gal_serum-bottle_beauty-retail_light_dark-text.png"
             alt="Serum bottle — Forma Skincare brand identity"
             class="project-card-image"
             width="800" height="800"
             loading="lazy">
      </a>
      <div class="project-card-meta">
        <span class="project-tag">Brand Strategy</span>
        <h3 class="project-card-title"><a href="/work">Forma Skincare</a></h3>
        <p class="project-card-desc">Brand strategy and identity for a direct-to-consumer skincare line. Positioning, naming system, and visual language for launch.</p>
        <a href="/work" class="project-cta-link">
          View case study
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    </article>

  </div>

  <!-- Project 04 — Wide banner -->
  <article class="project-banner" data-reveal>
    <a href="/work" class="project-banner-image-wrap" aria-label="View Atelier Roux case study">
      <img src="/assets/library/gallery/vs-gal_arched-doorway_architecture-interior_warm_dark-text.png"
           alt="Arched doorway interior — Atelier Roux cultural identity"
           class="project-banner-image"
           width="800" height="800"
           loading="lazy">
      <div class="project-banner-overlay">
        <div class="project-banner-content">
          <span class="project-tag project-tag--light">Creative Strategy</span>
          <h3 class="project-banner-title">Atelier Roux</h3>
          <p class="project-banner-desc">Strategic repositioning for a Paris-based contemporary gallery. Brand narrative, communications framework, and digital presence.</p>
          <span class="project-cta-link project-cta-link--light">
            View case study
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </div>
      </div>
    </a>
  </article>

</section>

<!-- ═══════════════════════════════════════════════════
     SERVICES OVERVIEW
════════════════════════════════════════════════════ -->
<section class="section-services">
  <div class="services-inner">
    <div class="services-intro" data-reveal>
      <span class="eyebrow">What we do</span>
      <h2 class="section-heading">Three disciplines.<br>One standard.</h2>
    </div>

    <div class="services-grid" data-reveal-stagger>

      <div class="service-item">
        <div class="service-number">01</div>
        <h3 class="service-title">Brand Identity</h3>
        <p class="service-desc">
          Visual systems built to last. Logo, typography, colour, photography
          direction, and the rules that hold it all together across every touchpoint.
        </p>
        <a href="/services" class="service-link">
          Identity work
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>

      <div class="service-item">
        <div class="service-number">02</div>
        <h3 class="service-title">Website Design</h3>
        <p class="service-desc">
          Considered digital experiences from concept through to code.
          We design and build websites that feel as deliberate as the
          brands they represent.
        </p>
        <a href="/services" class="service-link">
          Web work
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>

      <div class="service-item">
        <div class="service-number">03</div>
        <h3 class="service-title">Creative Strategy</h3>
        <p class="service-desc">
          Positioning, narrative, and the connective tissue between business
          decisions and design output. Strategy that makes every creative
          choice intentional.
        </p>
        <a href="/services" class="service-link">
          Strategy work
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>

    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════
     PROCESS
════════════════════════════════════════════════════ -->
<section class="section-process">
  <div class="process-inner">
    <div class="process-intro" data-reveal>
      <span class="eyebrow">How we work</span>
      <h2 class="section-heading">Discovery to delivery.</h2>
      <p class="process-lead">
        Every project follows the same deliberate arc. Not because we're rigid —
        because good design takes the same shape every time it's done properly.
      </p>
    </div>

    <div class="process-steps" data-reveal-stagger>

      <div class="process-step">
        <span class="step-number">01</span>
        <h3 class="step-title">Discovery</h3>
        <p class="step-desc">
          We begin by listening. Understanding the business, the audience,
          the competitive landscape, and — most importantly — what success
          actually looks like for this project.
        </p>
      </div>

      <div class="process-step">
        <span class="step-number">02</span>
        <h3 class="step-title">Strategy</h3>
        <p class="step-desc">
          We synthesise research into a clear creative brief and positioning
          framework. This document is the anchor for every design decision
          that follows. Nothing arbitrary.
        </p>
      </div>

      <div class="process-step">
        <span class="step-number">03</span>
        <h3 class="step-title">Design</h3>
        <p class="step-desc">
          We explore widely, then commit decisively. You see one refined direction
          — not three competing options. We present the solution we'd stake
          our reputation on.
        </p>
      </div>

      <div class="process-step">
        <span class="step-number">04</span>
        <h3 class="step-title">Delivery</h3>
        <p class="step-desc">
          Handover is as important as the work itself. You leave with a system
          you can use independently: guidelines, assets, templates, and
          documentation that answers every future question.
        </p>
      </div>

    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════
     ABOUT / PHILOSOPHY
════════════════════════════════════════════════════ -->
<section class="section-about">
  <div class="about-inner">
    <div class="about-image-col" data-reveal>
      <div class="about-image-wrap">
        <img src="/assets/library/gallery/vs-gal_open-notebook_professional-coaching_warm_dark-text.png"
             alt="Open notebook — the considered, craft-led approach of the Studioform practice"
             class="about-image"
             width="800" height="800"
             loading="lazy">
      </div>
    </div>
    <div class="about-text-col" data-reveal>
      <span class="eyebrow">About the studio</span>
      <h2 class="about-heading">Minimal, considered,<br>built to last.</h2>
      <p class="about-body">
        Studioform is a small design practice. We work with a tight roster of
        clients at a time, which means every project gets the attention it deserves.
        No juniors, no account managers — the people who pitch the work are
        the people who do the work.
      </p>
      <p class="about-body">
        We have a strong point of view: design should solve problems and be
        beautiful doing it. We don't chase trends. We don't decorate for
        decoration's sake. We build visual systems that make organisations
        look and feel exactly as good as they are.
      </p>
      <a href="/studio" class="btn-secondary">More about us</a>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════
     TESTIMONIALS
════════════════════════════════════════════════════ -->
<section class="section-testimonials">
  <div class="testimonials-inner">
    <div class="testimonials-header" data-reveal>
      <span class="eyebrow">What clients say</span>
      <h2 class="section-heading">In their words.</h2>
    </div>

    <div class="testimonials-grid" data-reveal-stagger>

      <blockquote class="testimonial-card">
        <div class="testimonial-quote-mark">&ldquo;</div>
        <p class="testimonial-text">
          Studioform didn't just give us a logo — they gave us a complete way
          of seeing ourselves. The identity system has held up perfectly through
          two years of growth and a full product expansion.
        </p>
        <footer class="testimonial-footer">
          <div>
            <cite class="testimonial-author">Erik Lindqvist</cite>
            <span class="testimonial-role">Founder, Søren &amp; Co.</span>
          </div>
        </footer>
      </blockquote>

      <blockquote class="testimonial-card">
        <div class="testimonial-quote-mark">&ldquo;</div>
        <p class="testimonial-text">
          They pushed back on our brief in the best possible way. What we
          thought we wanted and what we actually needed turned out to be
          very different things. The result is far better for it.
        </p>
        <footer class="testimonial-footer">
          <div>
            <cite class="testimonial-author">Priya Sharma</cite>
            <span class="testimonial-role">CEO, Forma Skincare</span>
          </div>
        </footer>
      </blockquote>

      <blockquote class="testimonial-card">
        <div class="testimonial-quote-mark">&ldquo;</div>
        <p class="testimonial-text">
          The process was as impressive as the output. One clear direction,
          well-argued and beautifully executed. No endless revision cycles.
          No design by committee. Just good work, delivered with confidence.
        </p>
        <footer class="testimonial-footer">
          <div>
            <cite class="testimonial-author">James Collier</cite>
            <span class="testimonial-role">Director, Meridian Architects</span>
          </div>
        </footer>
      </blockquote>

    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════
     CTA
════════════════════════════════════════════════════ -->
<section class="section-cta" data-reveal>
  <div class="cta-inner">
    <span class="eyebrow eyebrow--light">Ready when you are</span>
    <h2 class="cta-heading">Let's make something<br><em>worth&nbsp;making.</em></h2>
    <p class="cta-body">
      We take on a small number of projects each year. If you're working on
      something that deserves serious design thinking, we'd like to hear about it.
    </p>
    <div class="cta-actions">
      <a href="/contact" class="btn-cta">Start a conversation</a>
    </div>
  </div>
</section>

<?php include '_partials/footer.php'; ?>