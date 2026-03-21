/**
 * main.js — Studioform global behaviour
 * Scroll reveal, portfolio filter
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Scroll Reveal ─────────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(el => {
    revealObserver.observe(el);
  });

  // ── Portfolio Filter ──────────────────────────────────────
  const filterButtons = document.querySelectorAll('.portfolio-filter');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  if (filterButtons.length && portfolioItems.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(b => b.classList.remove('portfolio-filter--active'));
        btn.classList.add('portfolio-filter--active');

        const filter = btn.dataset.filter;

        portfolioItems.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.classList.remove('is-hidden');
          } else {
            item.classList.add('is-hidden');
          }
        });
      });
    });
  }

  // ── Smooth Scroll for anchor links ───────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});