/* ============================================================
   Studioform — main.js
   Global behaviour: scroll reveal, sticky header class.
   navigation.js (shipped) handles mobile menu toggling.
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ── Scroll Reveal ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(el => {
    revealObserver.observe(el);
  });

  /* ── Project image parallax-lite (subtle vertical drift on scroll) ── */
  const heroMedia = document.querySelector('[data-hero-media]');
  if (heroMedia && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      heroMedia.style.transform = `translateY(${scrolled * 0.12}px)`;
    }, { passive: true });
  }

  /* ── Counter animation for stats ── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1200;
        const start = performance.now();

        const tick = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out expo
          const eased = 1 - Math.pow(2, -10 * progress);
          el.textContent = Math.round(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => countObserver.observe(el));
  }

  /* ── Marquee: duplicate content for seamless loop ── */
  const marqueeTrack = document.querySelector('[data-marquee-track]');
  if (marqueeTrack) {
    const clone = marqueeTrack.innerHTML;
    marqueeTrack.innerHTML = clone + clone;
  }

});