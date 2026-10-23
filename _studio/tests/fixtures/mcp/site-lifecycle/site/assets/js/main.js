import { serviceLabel } from './service-copy.js';

const toggle = document.querySelector('[data-repair-toggle]');
toggle?.addEventListener('click', () => {
  const detail = document.getElementById(toggle.getAttribute('aria-controls'));
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!expanded));
  detail.hidden = expanded;
});

const status = document.querySelector('[data-service-status]');
if (status) {
  fetch('/assets/data/services.json')
    .then(response => {
      if (!response.ok) throw new Error('Service information is unavailable.');
      return response.json();
    })
    .then(data => { status.textContent = serviceLabel(data.services.length); })
    .catch(() => { status.textContent = 'Service information is unavailable.'; });
}
