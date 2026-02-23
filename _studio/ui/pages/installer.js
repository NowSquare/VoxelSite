/**
 * VoxelSite Installation Wizard
 *
 * Standalone module (not part of the SPA). Drives the 5-step
 * installation flow with full Forge styling.
 *
 * Steps:
 * 1. Requirements check (PHP, extensions, permissions)
 * 2. AI configuration (provider, API key, connection test)
 * 3. Admin account (name, email, password)
 * 4. Let's Build (starting mode + site name/tagline)
 * 5. Email configuration (driver, SMTP, test)
 *
 * All API calls go through /_studio/api/install/*.
 * No external dependencies. Pure vanilla JS + Tailwind classes.
 */

// ═══════════════════════════════════════════
//  Lucide SVG Icons (inline, no external requests)
// ═══════════════════════════════════════════

const icons = {
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  xCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  loader: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
  layoutTemplate: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
  filePlus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
};

// ═══════════════════════════════════════════
//  State
// ═══════════════════════════════════════════

const state = {
  currentStep: 1,
  totalSteps: 5,
  checks: [],
  canProceed: false,
  checksLoading: true,
  // AI provider config
  aiProvider: 'claude',
  aiApiKey: '',
  aiBaseUrl: '',
  aiModel: '',
  aiModels: [],          // live models fetched from API
  aiTestResult: null,
  aiTesting: false,
  aiVerified: false,     // true after successful verify
  showApiKey: false,
  providers: {},         // loaded from /install/providers
  providersLoading: false,
  // Admin
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  adminPasswordConfirm: '',
  showPassword: false,
  showPasswordConfirm: false,
  passwordStrength: 0,
  // Site
  siteName: '',
  siteTagline: '',
  // Email
  mailDriver: 'none',
  mailSmtpHost: '',
  mailSmtpPort: '587',
  mailSmtpEncryption: 'tls',
  mailSmtpUsername: '',
  mailSmtpPassword: '',
  showSmtpPassword: false,
  mailSmtpPreset: '',
  mailMailpitHost: 'localhost',
  mailMailpitPort: '1025',
  mailFromAddress: '',
  mailFromName: '',
  mailTestEmail: '',
  mailTestResult: null,
  mailTesting: false,
  mailPresets: {},
  // General
  installing: false,
  error: null,
};

// The installer calls router.php directly with a _path parameter.
// This bypasses URL rewriting entirely, so the installer works on
// any server (Apache, Nginx, Herd) without needing rewrite rules.
const API_BASE = '/_studio/api/router.php';

async function apiPost(endpoint, data = {}) {
  const res = await fetch(`${API_BASE}?_path=${encodeURIComponent(endpoint)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 300)}`);
  }
}

async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}?_path=${encodeURIComponent(endpoint)}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 300)}`);
  }
}

// ═══════════════════════════════════════════
//  Render Engine
// ═══════════════════════════════════════════

const root = document.getElementById('installer');

function render() {
  const boxIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path class="voxel-top" style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/><path class="voxel-left" style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/><path class="voxel-right" style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/></svg>`;

  const isCompletion = state.currentStep === 6;

  root.innerHTML = `
    <div class="flex items-center gap-2" style="position: fixed; top: 32px; left: 40px; z-index: 10;">
      <span class="text-vs-accent">${boxIcon}</span>
      <span style="font-size: 18px; font-weight: 700; color: var(--vs-text-primary); letter-spacing: -0.025em;">VoxelSite</span>
    </div>
    <div class="bg-vs-bg-surface border border-vs-border-subtle rounded-2xl shadow-xl" style="padding: 40px;">
      ${isCompletion ? '' : renderStepper()}
      <div style="${isCompletion ? '' : 'margin-top: 32px;'}">
        ${renderStep()}
      </div>
      ${state.error ? renderError(state.error) : ''}
    </div>
  `;
  bindEvents();
}

// ═══════════════════════════════════════════
//  Stepper
// ═══════════════════════════════════════════

function renderStepper() {
  const steps = [];
  for (let i = 1; i <= state.totalSteps; i++) {
    const isCompleted = i < state.currentStep;
    const isCurrent = i === state.currentStep;

    let circleClass, content;
    if (isCompleted) {
      circleClass = 'bg-vs-accent text-white';
      content = icons.check;
    } else if (isCurrent) {
      circleClass = 'bg-vs-accent-dim border-2 border-vs-accent text-vs-accent';
      content = i;
    } else {
      circleClass = 'border-2 border-vs-border-medium text-vs-text-tertiary';
      content = i;
    }

    steps.push(`<div class="flex items-center">
      <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${circleClass}">${content}</div>
      ${i < state.totalSteps ? `<div class="h-0.5 mx-1.5 ${i < state.currentStep ? 'bg-vs-accent' : ''}" style="width: 40px;${i >= state.currentStep ? ' background: var(--vs-border-medium);' : ''}"></div>` : ''}
    </div>`);
  }
  return `<div class="flex items-center justify-center">${steps.join('')}</div>`;
}

function renderStep() {
  switch (state.currentStep) {
    case 1: return renderStep1();
    case 2: return renderStep2();
    case 3: return renderStep3();
    case 4: return renderStep4();
    case 5: return renderStep5();
    case 6: return renderCompletion();
    default: return '';
  }
}

// ═══════════════════════════════════════════
//  Step 1: Requirements
// ═══════════════════════════════════════════

function renderStep1() {
  // Loading state
  if (state.checksLoading) {
    return `
      <h2 class="text-xl font-semibold text-vs-text-primary" style="margin-bottom: 24px;">System Requirements</h2>
      <div class="flex items-center justify-center py-8 text-vs-text-tertiary">
        <span class="mr-2">${icons.loader}</span> Checking requirements...
      </div>`;
  }

  const totalCount = state.checks.length;

  // ── Connection error: API unreachable, checks never loaded ──
  if (totalCount === 0 && state.error) {
    return `
      <h2 class="text-xl font-semibold text-vs-text-primary" style="margin-bottom: 24px;">System Requirements</h2>
      <div class="rounded-xl" style="padding: 20px; background: color-mix(in srgb, var(--vs-error) 8%, transparent); border: 1px solid color-mix(in srgb, var(--vs-error) 20%, transparent);">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style="background: color-mix(in srgb, var(--vs-error) 15%, transparent);">
            <span class="text-vs-error">${icons.xCircle}</span>
          </div>
          <div style="padding-top: 2px;">
            <div class="text-base font-semibold text-vs-text-primary" style="margin-bottom: 4px;">Cannot Connect to Server</div>
            <div class="text-sm text-vs-text-tertiary" style="line-height: 1.6;">
              The installer UI loaded, but it cannot reach the VoxelSite API.<br>
              This usually means PHP is not processing <code style="background: var(--vs-bg-well); padding: 1px 5px; border-radius: 4px; font-size: 0.85em;">.php</code> files correctly.
            </div>
          </div>
        </div>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid color-mix(in srgb, var(--vs-error) 15%, transparent);">
          <div class="text-sm text-vs-text-secondary" style="line-height: 1.7;">
            <strong>Troubleshooting:</strong>
            <ol style="margin: 4px 0 12px 20px; padding: 0;">
              <li>Verify PHP 8.2+ is installed and active</li>
              <li>Ensure <code style="background: var(--vs-bg-well); padding: 1px 5px; border-radius: 4px; font-size: 0.85em;">.php</code> files are processed by PHP-FPM (not served as text)</li>
              <li>Apache: enable <code style="background: var(--vs-bg-well); padding: 1px 5px; border-radius: 4px; font-size: 0.85em;">mod_rewrite</code> and set <code style="background: var(--vs-bg-well); padding: 1px 5px; border-radius: 4px; font-size: 0.85em;">AllowOverride All</code></li>
              <li>Set the web root to <code style="background: var(--vs-bg-well); padding: 1px 5px; border-radius: 4px; font-size: 0.85em;">/</code> (not <code style="background: var(--vs-bg-well); padding: 1px 5px; border-radius: 4px; font-size: 0.85em;">/public</code>)</li>
            </ol>
          </div>
        </div>
      </div>
      <div class="flex justify-end" style="margin-top: 24px;">
        <button id="btn-retry" class="px-6 py-2.5 rounded-lg text-sm font-medium bg-vs-accent text-white hover:bg-vs-accent-hover cursor-pointer transition-colors">Retry</button>
      </div>`;
  }

  const failedChecks = state.checks.filter(c => c.status === 'fail');
  const warnChecks = state.checks.filter(c => c.status === 'warn');
  const passedCount = totalCount - failedChecks.length;
  const allPassed = failedChecks.length === 0;

  let heroHtml;
  if (allPassed) {
    // ── All requirements met: green hero card ──
    heroHtml = `
      <div class="rounded-xl" style="padding: 20px; background: color-mix(in srgb, var(--vs-success) 8%, transparent); border: 1px solid color-mix(in srgb, var(--vs-success) 20%, transparent);">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style="background: color-mix(in srgb, var(--vs-success) 15%, transparent);">
            <span class="text-vs-success">${icons.checkCircle}</span>
          </div>
          <div style="padding-top: 2px;">
            <div class="text-base font-semibold text-vs-text-primary" style="margin-bottom: 2px;">System Ready</div>
            <div class="text-sm text-vs-text-tertiary">
              Your server meets all ${totalCount} requirements. You're ready to proceed.
            </div>
          </div>
        </div>
      </div>

      ${warnChecks.length > 0 ? `
        <div style="margin-top: 12px;">
          ${warnChecks.map(c => `
            <div class="flex items-center gap-2 text-vs-warning" style="padding: 4px 0;">
              <span class="shrink-0">${icons.alertTriangle}</span>
              <span class="text-sm">${c.name} — ${c.detail}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div style="margin-top: 16px;">
        <details class="group">
          <summary class="inline-flex items-center gap-1 text-sm text-vs-text-tertiary hover:text-vs-text-secondary cursor-pointer select-none transition-colors" style="list-style: none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-open:rotate-90"><polyline points="9 18 15 12 9 6"/></svg>
            View technical details
          </summary>
          <div class="rounded-lg border border-vs-border-subtle" style="margin-top: 10px; padding: 12px 16px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px;">
              ${state.checks.filter(c => c.status === 'pass').map(c => `
                <div class="flex items-center gap-2" style="padding: 3px 0;">
                  <span class="text-vs-success shrink-0">${icons.check}</span>
                  <span class="text-xs text-vs-text-tertiary" style="font-family: var(--font-mono, monospace);">${c.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </details>
      </div>`;
  } else {
    // ── Some requirements failed: red hero card ──
    heroHtml = `
      <div class="rounded-xl" style="padding: 20px; background: color-mix(in srgb, var(--vs-error) 8%, transparent); border: 1px solid color-mix(in srgb, var(--vs-error) 20%, transparent);">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style="background: color-mix(in srgb, var(--vs-error) 15%, transparent);">
            <span class="text-vs-error">${icons.xCircle}</span>
          </div>
          <div style="padding-top: 2px;">
            <div class="text-base font-semibold text-vs-text-primary" style="margin-bottom: 2px;">${failedChecks.length} Issue${failedChecks.length > 1 ? 's' : ''} Found</div>
            <div class="text-sm text-vs-text-tertiary">
              ${passedCount} of ${totalCount} requirements passed. Please resolve the following before continuing.
            </div>
          </div>
        </div>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid color-mix(in srgb, var(--vs-error) 15%, transparent);">
          ${failedChecks.map(c => `
            <div class="flex items-center gap-2 text-vs-error" style="padding: 4px 0;">
              <span class="shrink-0">${icons.xCircle}</span>
              <span class="text-sm">${c.name} — ${c.detail}</span>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  return `
    <h2 class="text-xl font-semibold text-vs-text-primary" style="margin-bottom: 24px;">System Requirements</h2>
    <div style="margin-bottom: 32px;">${heroHtml}</div>
    <div class="flex justify-end">
      ${renderButton('btn-next', 'Continue', state.canProceed)}
    </div>`;
}

// ═══════════════════════════════════════════
//  Step 2: AI Configuration
// ═══════════════════════════════════════════

function renderStep2() {
  const providers = state.providers;
  const providerIds = Object.keys(providers);
  const currentProvider = providers[state.aiProvider] || {};
  const configFields = currentProvider.config_fields || [];

  // Provider selector cards
  const providerCards = providerIds.map(pid => {
    const p = providers[pid];
    const isSelected = state.aiProvider === pid;
    const borderClass = isSelected ? 'border-vs-accent bg-vs-accent-dim' : 'border-vs-border-subtle hover:border-vs-border-medium';
    const recommended = pid === 'claude' ? `<span class="text-[11px] font-medium text-vs-accent bg-vs-accent-dim px-2 py-0.5 rounded-full">Recommended</span>` : '';
    return `<button data-provider="${pid}"
      class="text-left rounded-lg border ${borderClass} cursor-pointer transition-colors" style="padding: 12px 14px;">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-vs-text-primary">${esc(p.name)}</span>
        ${recommended}
      </div>
    </button>`;
  }).join('');

  // Dynamic config fields
  let fieldsHtml = '';
  for (const f of configFields) {
    const value = f.key === 'api_key' ? state.aiApiKey : (f.key === 'base_url' ? state.aiBaseUrl : '');
    const inputType = f.key === 'api_key' ? (state.showApiKey ? 'text' : 'password') : f.type;

    fieldsHtml += `<div style="margin-top: 16px;">`;
    fieldsHtml += `<label class="block text-sm font-medium text-vs-text-secondary" style="margin-bottom: 6px;">${esc(f.label)}${!f.required ? ' <span class="text-vs-text-ghost font-normal">(optional)</span>' : ''}</label>`;
    fieldsHtml += `<div class="relative">`;
    fieldsHtml += `<input id="input-${f.key}" type="${inputType}"
      class="w-full bg-vs-bg-input border border-vs-border-subtle rounded-lg text-sm text-vs-text-primary placeholder:text-vs-text-tertiary focus:outline-none focus:border-vs-accent focus:ring-1 focus:ring-vs-accent ${f.key === 'api_key' ? 'font-mono' : ''}"
      style="padding: 10px ${f.key === 'api_key' ? '40px' : '12px'} 10px 12px;"
      placeholder="${esc(f.placeholder)}"
      value="${esc(value)}">`;
    if (f.key === 'api_key') {
      fieldsHtml += `<button id="btn-toggle-key" type="button" class="absolute top-1/2 -translate-y-1/2 text-vs-text-tertiary hover:text-vs-text-secondary cursor-pointer" style="right: 12px;">
        ${state.showApiKey ? icons.eyeOff : icons.eye}
      </button>`;
    }
    fieldsHtml += `</div>`;
    if (f.help_url) {
      fieldsHtml += `<a href="${f.help_url}" target="_blank" rel="noopener"
        class="text-xs text-vs-accent hover:underline" style="margin-top: 6px; display: inline-block;">${esc(f.help_text || 'Get a key')} &rarr;</a>`;
    } else if (f.help_text) {
      fieldsHtml += `<p class="text-xs text-vs-text-tertiary" style="margin-top: 4px;">${esc(f.help_text)}</p>`;
    }
    fieldsHtml += `</div>`;
  }

  // Verify + status
  let verifyHtml = '';
  if (state.aiTesting) {
    verifyHtml = `<div class="flex items-center gap-2 text-vs-text-tertiary text-sm" style="margin-top: 12px;">
      <span class="animate-spin">${icons.loader}</span> Verifying and loading models...</div>`;
  } else if (state.aiTestResult) {
    if (state.aiTestResult.ok) {
      verifyHtml = `<div class="flex items-center gap-2 text-vs-success text-sm" style="margin-top: 12px;">
        ${icons.checkCircle} Connected to ${esc(state.aiTestResult.data?.provider || currentProvider.name || 'AI')}</div>`;
    } else {
      verifyHtml = `<div class="flex items-center gap-2 text-vs-error text-sm" style="margin-top: 12px;">
        ${icons.xCircle} ${esc(state.aiTestResult.error?.message || 'Connection failed')}</div>`;
    }
  }

  // Model dropdown (shown only after verification)
  let modelHtml = '';
  if (state.aiVerified && state.aiModels.length > 0) {
    const modelOptions = state.aiModels.map(m => {
      const selected = m.id === state.aiModel ? 'selected' : '';
      return `<option value="${esc(m.id)}" ${selected}>${esc(m.name || m.id)}</option>`;
    }).join('');

    modelHtml = `<div style="margin-top: 16px;">
      <label class="block text-sm font-medium text-vs-text-secondary" style="margin-bottom: 6px;">Model</label>
      <select id="select-model"
        class="w-full bg-vs-bg-input border border-vs-border-subtle rounded-lg text-sm text-vs-text-primary focus:outline-none focus:border-vs-accent focus:ring-1 focus:ring-vs-accent"
        style="padding: 10px 12px;">
        ${modelOptions}
      </select>
    </div>`;
  } else if (!state.aiVerified) {
    modelHtml = `<div style="margin-top: 16px;">
      <label class="block text-sm font-medium text-vs-text-tertiary" style="margin-bottom: 6px;">Model</label>
      <div class="text-xs text-vs-text-tertiary bg-vs-bg-inset rounded-lg" style="padding: 10px 12px;">
        Enter API key and verify to load models
      </div>
    </div>`;
  }

  const canContinue = state.aiVerified && state.aiModel;

  return `
    <h2 class="text-xl font-semibold text-vs-text-primary" style="margin-bottom: 24px;">Connect Your AI</h2>

    <div class="grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); margin-bottom: 24px;">
      ${providerCards}
    </div>

    ${fieldsHtml}

    <div style="margin-top: 16px;">
      <button id="btn-verify-key"
        class="px-4 py-2 rounded-lg text-sm font-medium bg-vs-bg-raised border border-vs-border-subtle text-vs-text-secondary hover:bg-vs-bg-surface hover:border-vs-border-medium transition-colors cursor-pointer">
        ${state.aiVerified ? '✓ Verified' : 'Verify Key'}
      </button>
      ${verifyHtml}
    </div>

    ${modelHtml}

    <div class="flex justify-between" style="margin-top: 32px;">
      <button id="btn-back" class="px-6 py-2.5 rounded-lg text-sm font-medium text-vs-text-secondary hover:text-vs-text-primary transition-colors cursor-pointer">Back</button>
      ${renderButton('btn-next', 'Continue', canContinue)}
    </div>`;
}

// ═══════════════════════════════════════════
//  Step 3: Admin Account
//  NOTE: No full re-render on input. DOM updates are surgical.
// ═══════════════════════════════════════════

function renderStep3() {
  return `
    <h2 class="text-xl font-semibold text-vs-text-primary" style="margin-bottom: 24px;">Create Your Account</h2>
    <div>
      ${field('input-name', 'Name', 'text', 'Your name', state.adminName)}
      <div style="height: 16px;"></div>
      ${field('input-email', 'Email', 'email', 'you@example.com', state.adminEmail)}
      <div id="email-error" style="margin-top: 4px;"></div>
      <div style="height: 12px;"></div>
      ${passwordField('input-password', 'Password', 'Minimum 8 characters', state.adminPassword, state.showPassword)}
      <div id="password-strength" style="margin-top: 8px;"></div>
      <div style="height: 16px;"></div>
      ${passwordField('input-password-confirm', 'Confirm Password', 'Confirm your password', state.adminPasswordConfirm, state.showPasswordConfirm)}
      <div id="password-match-error" style="margin-top: 4px;"></div>
    </div>

    <div class="flex justify-between" style="margin-top: 32px;">
      <button id="btn-back" class="px-6 py-2.5 rounded-lg text-sm font-medium text-vs-text-secondary hover:text-vs-text-primary transition-colors cursor-pointer">Back</button>
      ${renderButton('btn-next', 'Continue', false)}
    </div>`;
}

// ═══════════════════════════════════════════
//  Step 4: Name Your Site
// ═══════════════════════════════════════════

function renderStep4() {
  const canContinue = state.siteName.length > 0;

  return `
    <h2 class="text-xl font-semibold text-vs-text-primary" style="margin-bottom: 32px;">Name Your Site</h2>

    <div style="padding: 8px 0;">
      ${field('input-site-name', 'Site Name', 'text', 'My Awesome Website', state.siteName)}
      <div style="height: 16px;"></div>
      ${field('input-site-tagline', 'Tagline', 'text', 'Your business in a sentence', state.siteTagline, true)}
    </div>

    <div class="flex justify-between" style="margin-top: 32px;">
      <button id="btn-back" class="px-6 py-2.5 rounded-lg text-sm font-medium text-vs-text-secondary hover:text-vs-text-primary transition-colors cursor-pointer">Back</button>
      ${renderButton('btn-next', 'Continue', canContinue)}
    </div>`;
}

// ═══════════════════════════════════════════
//  Step 5: Email Configuration
// ═══════════════════════════════════════════

function renderStep5() {
  // Driver select
  const driverOptions = [
    { value: 'none', label: 'Not configured' },
    { value: 'php_mail', label: 'PHP mail()' },
    { value: 'smtp', label: 'SMTP' },
    { value: 'mailpit', label: 'Mailpit (local dev)' },
  ];
  const driverSelect = driverOptions.map(d =>
    `<option value="${d.value}" ${state.mailDriver === d.value ? 'selected' : ''}>${d.label}</option>`
  ).join('');

  // SMTP preset options
  let presetHtml = '';
  if (state.mailDriver === 'smtp') {
    const presetKeys = Object.keys(state.mailPresets);
    const presetOptions = presetKeys.map(k => {
      const p = state.mailPresets[k];
      return `<option value="${k}" ${state.mailSmtpPreset === k ? 'selected' : ''}>${esc(p.label)}</option>`;
    }).join('');

    presetHtml = `
      <div style="margin-top: 16px;">
        <label class="block text-sm font-medium text-vs-text-secondary" style="margin-bottom: 6px;">Provider</label>
        <select id="mail-preset"
          class="w-full bg-vs-bg-input border border-vs-border-subtle rounded-lg text-sm text-vs-text-primary focus:outline-none focus:border-vs-accent focus:ring-1 focus:ring-vs-accent"
          style="padding: 10px 12px;">
          <option value="">Custom</option>
          ${presetOptions}
        </select>
      </div>`;
  }

  // SMTP fields
  let smtpHtml = '';
  if (state.mailDriver === 'smtp') {
    smtpHtml = `
      <div style="margin-top: 16px;">
        ${field('mail-smtp-host', 'SMTP Host', 'text', 'smtp.example.com', state.mailSmtpHost)}
      </div>
      <div style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary" style="margin-bottom: 6px;">Port</label>
          <input id="mail-smtp-port" type="text"
            class="w-full bg-vs-bg-input border border-vs-border-subtle rounded-lg text-sm text-vs-text-primary placeholder:text-vs-text-tertiary focus:outline-none focus:border-vs-accent focus:ring-1 focus:ring-vs-accent"
            style="padding: 10px 12px;"
            placeholder="587" value="${esc(state.mailSmtpPort)}">
        </div>
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary" style="margin-bottom: 6px;">Encryption</label>
          <select id="mail-smtp-encryption"
            class="w-full bg-vs-bg-input border border-vs-border-subtle rounded-lg text-sm text-vs-text-primary focus:outline-none focus:border-vs-accent focus:ring-1 focus:ring-vs-accent"
            style="padding: 10px 12px;">
            <option value="tls" ${state.mailSmtpEncryption === 'tls' ? 'selected' : ''}>TLS (STARTTLS)</option>
            <option value="ssl" ${state.mailSmtpEncryption === 'ssl' ? 'selected' : ''}>SSL</option>
            <option value="none" ${state.mailSmtpEncryption === 'none' ? 'selected' : ''}>None</option>
          </select>
        </div>
      </div>
      <div style="margin-top: 16px;">
        ${field('mail-smtp-username', 'Username', 'text', 'user@example.com', state.mailSmtpUsername)}
      </div>
      <div style="margin-top: 16px;">
        ${passwordField('mail-smtp-password', 'Password', 'Enter SMTP password', state.mailSmtpPassword, state.showSmtpPassword)}
      </div>`;
  }

  // Mailpit fields
  let mailpitHtml = '';
  if (state.mailDriver === 'mailpit') {
    mailpitHtml = `
      <div style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary" style="margin-bottom: 6px;">Mailpit Host</label>
          <input id="mail-mailpit-host" type="text"
            class="w-full bg-vs-bg-input border border-vs-border-subtle rounded-lg text-sm text-vs-text-primary placeholder:text-vs-text-tertiary focus:outline-none focus:border-vs-accent focus:ring-1 focus:ring-vs-accent"
            style="padding: 10px 12px;"
            placeholder="localhost" value="${esc(state.mailMailpitHost)}">
        </div>
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary" style="margin-bottom: 6px;">Mailpit Port</label>
          <input id="mail-mailpit-port" type="text"
            class="w-full bg-vs-bg-input border border-vs-border-subtle rounded-lg text-sm text-vs-text-primary placeholder:text-vs-text-tertiary focus:outline-none focus:border-vs-accent focus:ring-1 focus:ring-vs-accent"
            style="padding: 10px 12px;"
            placeholder="1025" value="${esc(state.mailMailpitPort)}">
        </div>
      </div>`;
  }

  // From address / name
  const fromHtml = `
    <div style="border-top: 1px solid var(--vs-border-subtle); margin: 20px 0;"></div>
    <div>
      ${field('mail-from-address', 'From Address', 'email', 'noreply@yourdomain.com', state.mailFromAddress)}
      <p class="text-xs text-vs-text-tertiary" style="margin-top: 4px;">Shown as the sender on notification emails.</p>
    </div>
    <div style="margin-top: 16px;">
      ${field('mail-from-name', 'From Name', 'text', 'Your Site Name', state.mailFromName)}
      <p class="text-xs text-vs-text-tertiary" style="margin-top: 4px;">Shown as the sender name on notification emails.</p>
    </div>`;

  // Test email
  let testStatusHtml = '';
  if (state.mailTesting) {
    testStatusHtml = `<div class="flex items-center gap-2 text-vs-text-tertiary text-sm" style="margin-top: 8px;">
      <span class="animate-spin">${icons.loader}</span> Sending test email...</div>`;
  } else if (state.mailTestResult) {
    if (state.mailTestResult.ok) {
      testStatusHtml = `<div class="flex items-center gap-2 text-vs-success text-sm" style="margin-top: 8px;">
        ${icons.checkCircle} ${esc(state.mailTestResult.message || 'Test email sent!')}</div>`;
    } else {
      testStatusHtml = `<div class="flex items-center gap-2 text-vs-error text-sm" style="margin-top: 8px;">
        ${icons.xCircle} ${esc(state.mailTestResult.message || 'Failed to send test email')}</div>`;
    }
  }

  const testHtml = `
    <div style="border-top: 1px solid var(--vs-border-subtle); margin: 20px 0;"></div>
    <label class="block text-sm font-medium text-vs-text-secondary" style="margin-bottom: 6px;">Test Email</label>
    <div style="display: flex; gap: 8px; align-items: start;">
      <input id="mail-test-email" type="email"
        class="flex-1 bg-vs-bg-input border border-vs-border-subtle rounded-lg text-sm text-vs-text-primary placeholder:text-vs-text-tertiary focus:outline-none focus:border-vs-accent focus:ring-1 focus:ring-vs-accent"
        style="padding: 10px 12px;"
        placeholder="your@email.com" value="${esc(state.mailTestEmail)}">
      <button id="btn-mail-test"
        class="px-4 py-2.5 rounded-lg text-sm font-medium bg-vs-bg-raised border border-vs-border-subtle text-vs-text-secondary hover:bg-vs-bg-surface hover:border-vs-border-medium transition-colors cursor-pointer shrink-0">
        Send Test
      </button>
    </div>
    ${testStatusHtml}`;

  return `
    <h2 class="text-xl font-semibold text-vs-text-primary" style="margin-bottom: 4px;">Email Configuration</h2>
    <p class="text-sm text-vs-text-tertiary" style="margin-bottom: 24px;">Optional — you can configure this later in Settings.</p>

    <div>
      <label class="block text-sm font-medium text-vs-text-secondary" style="margin-bottom: 6px;">Delivery Method</label>
      <select id="mail-driver"
        class="w-full bg-vs-bg-input border border-vs-border-subtle rounded-lg text-sm text-vs-text-primary focus:outline-none focus:border-vs-accent focus:ring-1 focus:ring-vs-accent"
        style="padding: 10px 12px;">
        ${driverSelect}
      </select>
      <p class="text-xs text-vs-text-tertiary" style="margin-top: 8px;">You can always reset your password via server file access, even without email.</p>
    </div>

    ${presetHtml}
    ${smtpHtml}
    ${mailpitHtml}
    ${state.mailDriver !== 'none' ? fromHtml : ''}
    ${state.mailDriver !== 'none' ? testHtml : ''}

    <div class="flex justify-between items-center" style="margin-top: 32px;">
      <button id="btn-back" class="px-6 py-2.5 rounded-lg text-sm font-medium text-vs-text-secondary hover:text-vs-text-primary transition-colors cursor-pointer">Back</button>
      <div class="flex gap-3">
        <button id="btn-skip"
          class="px-6 py-2.5 rounded-lg text-sm font-medium text-vs-text-secondary hover:text-vs-text-primary transition-colors cursor-pointer">${state.mailDriver === 'none' ? 'Install without Email' : 'Skip Test & Install'}</button>
        <button id="btn-complete"
          class="py-3 rounded-lg text-sm font-semibold transition-colors ${!state.installing ? 'bg-vs-accent text-white hover:bg-vs-accent-hover cursor-pointer' : 'bg-vs-bg-raised text-vs-text-ghost cursor-not-allowed'}"
          style="padding-left: 24px; padding-right: 24px;"
          ${!state.installing ? '' : 'disabled'}>
          ${state.installing ? `<span class="inline-flex items-center gap-2"><span class="animate-spin">${icons.loader}</span> Setting up...</span>` : 'Save & Install'}
        </button>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════
//  Completion
// ═══════════════════════════════════════════

function renderCompletion() {
  // Start cycling status text after render
  setTimeout(() => {
    const msgs = ['Writing configuration...', 'Generating keys...', 'Opening Studio...'];
    let idx = 0;
    const el = document.getElementById('completion-status');
    if (el) {
      const interval = setInterval(() => {
        idx = (idx + 1) % msgs.length;
        el.style.opacity = '0';
        setTimeout(() => {
          el.textContent = msgs[idx];
          el.style.opacity = '1';
        }, 150);
      }, 800);
      setTimeout(() => clearInterval(interval), 10000);
    }
  }, 100);

  return `
    <div class="flex flex-col items-center justify-center" style="padding: 64px 0; position: relative;">
      <div class="completion-mark text-vs-accent">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24"><path class="voxel-top" style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/><path class="voxel-left" style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/><path class="voxel-right" style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/></svg>
      </div>
      <p id="completion-status" class="text-sm text-vs-text-tertiary" style="margin-top: 28px; transition: opacity 150ms ease;">Writing configuration...</p>
    </div>
    <style>
      .completion-mark {
        animation: markFadeIn 400ms ease-out forwards, diamondPulse 2s ease-in-out 600ms infinite;
        opacity: 0;
        transform: scale(0.6);
      }
      @keyframes markFadeIn { to { opacity: 1; transform: scale(1); } }
      @keyframes diamondPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    </style>`;
}

function renderError(msg) {
  return `<div class="bg-vs-error-dim text-vs-error text-sm rounded-lg" style="margin-top: 16px; padding: 12px 16px;">${esc(msg)}</div>`;
}

// ═══════════════════════════════════════════
//  Shared Components
// ═══════════════════════════════════════════

function field(id, label, type, placeholder, value, optional = false) {
  return `<div>
    <label class="block text-sm font-medium text-vs-text-secondary" style="margin-bottom: 6px;">${label}${optional ? ' <span class="text-vs-text-ghost font-normal">(optional)</span>' : ''}</label>
    <input id="${id}" type="${type}"
      class="w-full bg-vs-bg-input border border-vs-border-subtle rounded-lg text-sm text-vs-text-primary placeholder:text-vs-text-tertiary focus:outline-none focus:border-vs-accent focus:ring-1 focus:ring-vs-accent"
      style="padding: 10px 12px;"
      placeholder="${placeholder}"
      value="${esc(value)}">
  </div>`;
}

function passwordField(id, label, placeholder, value, isVisible) {
  return `<div>
    <label class="block text-sm font-medium text-vs-text-secondary" style="margin-bottom: 6px;">${label}</label>
    <div class="relative">
      <input id="${id}" type="${isVisible ? 'text' : 'password'}"
        class="w-full bg-vs-bg-input border border-vs-border-subtle rounded-lg text-sm text-vs-text-primary placeholder:text-vs-text-tertiary focus:outline-none focus:border-vs-accent focus:ring-1 focus:ring-vs-accent font-mono"
        style="padding: 10px 40px 10px 12px;"
        placeholder="${placeholder}"
        value="${esc(value)}">
      <button data-toggle-password="${id}" type="button"
        class="absolute top-1/2 -translate-y-1/2 text-vs-text-tertiary hover:text-vs-text-secondary cursor-pointer" style="right: 12px;">
        ${isVisible ? icons.eyeOff : icons.eye}
      </button>
    </div>
  </div>`;
}

function renderButton(id, label, enabled) {
  return `<button id="${id}"
    class="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors
           ${enabled ? 'bg-vs-accent text-white hover:bg-vs-accent-hover cursor-pointer' : 'bg-vs-bg-raised text-vs-text-ghost cursor-not-allowed'}"
    ${enabled ? '' : 'disabled'}>${label}</button>`;
}

// ═══════════════════════════════════════════
//  Event Binding
// ═══════════════════════════════════════════

function bindEvents() {
  const btnNext = document.getElementById('btn-next');
  const btnBack = document.getElementById('btn-back');
  const btnComplete = document.getElementById('btn-complete');

  if (btnNext) btnNext.addEventListener('click', handleNext);
  if (btnBack) btnBack.addEventListener('click', handleBack);
  if (btnComplete) btnComplete.addEventListener('click', handleComplete);

  const btnSkip = document.getElementById('btn-skip');
  if (btnSkip) btnSkip.addEventListener('click', handleComplete);

  // Retry button (shown when API is unreachable on step 1)
  const btnRetry = document.getElementById('btn-retry');
  if (btnRetry) btnRetry.addEventListener('click', () => {
    state.checksLoading = true;
    state.error = null;
    state.checks = [];
    render();
    init();
  });

  // Bind password toggle buttons globally
  bindPasswordToggles();

  switch (state.currentStep) {
    case 2: bindStep2(); break;
    case 3: bindStep3(); break;
    case 4: bindStep4Events(); break;
    case 5: bindStep5(); break;
  }
}

/** Bind all password visibility toggle buttons */
function bindPasswordToggles() {
  document.querySelectorAll('[data-toggle-password]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const inputId = btn.dataset.togglePassword;
      const input = document.getElementById(inputId);
      if (!input) return;

      // Determine which state key to toggle
      const stateKeyMap = {
        'input-password': 'showPassword',
        'input-password-confirm': 'showPasswordConfirm',
        'mail-smtp-password': 'showSmtpPassword',
      };

      const stateKey = stateKeyMap[inputId];
      if (stateKey) {
        state[stateKey] = !state[stateKey];
        input.type = state[stateKey] ? 'text' : 'password';
        const pos = input.selectionStart;
        input.focus();
        input.setSelectionRange(pos, pos);
        btn.innerHTML = state[stateKey] ? icons.eyeOff : icons.eye;
      }
    });
  });
}

function bindStep2() {
  // Provider selection
  document.querySelectorAll('[data-provider]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.aiProvider !== btn.dataset.provider) {
        state.aiProvider = btn.dataset.provider;
        state.aiApiKey = '';
        state.aiBaseUrl = '';
        state.aiModel = '';
        state.aiModels = [];
        state.aiVerified = false;
        state.aiTestResult = null;
        render();
      }
    });
  });

  // API key input
  const keyInput = document.getElementById('input-api_key');
  if (keyInput) {
    keyInput.addEventListener('input', (e) => {
      state.aiApiKey = e.target.value;
      state.aiVerified = false;
      state.aiTestResult = null;
      state.aiModels = [];
      state.aiModel = '';
    });
  }

  // Base URL input (OpenAI Compatible)
  const baseUrlInput = document.getElementById('input-base_url');
  if (baseUrlInput) {
    baseUrlInput.addEventListener('input', (e) => {
      state.aiBaseUrl = e.target.value;
      state.aiVerified = false;
      state.aiTestResult = null;
      state.aiModels = [];
      state.aiModel = '';
    });
  }

  // Toggle key visibility (Step 2 uses the old btn-toggle-key ID)
  const toggleBtn = document.getElementById('btn-toggle-key');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      state.showApiKey = !state.showApiKey;
      const input = document.getElementById('input-api_key');
      if (input) {
        input.type = state.showApiKey ? 'text' : 'password';
        const pos = input.selectionStart;
        input.focus();
        input.setSelectionRange(pos, pos);
      }
      toggleBtn.innerHTML = state.showApiKey ? icons.eyeOff : icons.eye;
    });
  }

  // Verify key button — validates + fetches models
  const verifyBtn = document.getElementById('btn-verify-key');
  if (verifyBtn) {
    verifyBtn.addEventListener('click', async () => {
      const needsKey = state.aiProvider !== 'openai_compatible';
      if (needsKey && !state.aiApiKey) return;

      state.aiTesting = true;
      state.aiTestResult = null;
      state.aiVerified = false;
      state.aiModels = [];
      state.aiModel = '';
      render();

      try {
        state.aiTestResult = await apiPost('/install/test-ai', {
          provider: state.aiProvider,
          api_key: state.aiApiKey,
          base_url: state.aiBaseUrl,
        });

        if (state.aiTestResult.ok && state.aiTestResult.data?.models) {
          state.aiVerified = true;
          state.aiModels = state.aiTestResult.data.models;
          // Auto-select first model
          if (state.aiModels.length > 0) {
            state.aiModel = state.aiModels[0].id;
          }
        }
      } catch (e) {
        state.aiTestResult = { ok: false, error: { message: 'Network error. Check your connection.' } };
      }
      state.aiTesting = false;
      render();
    });
  }

  // Model selection
  const modelSelect = document.getElementById('select-model');
  if (modelSelect) {
    modelSelect.addEventListener('change', (e) => {
      state.aiModel = e.target.value;
    });
  }
}

function bindStep3() {
  listen('input-name', v => { state.adminName = v; updateStep3Button(); });
  listen('input-email', v => { state.adminEmail = v; updateEmailError(); updateStep3Button(); });

  listen('input-password', v => {
    state.adminPassword = v;
    state.passwordStrength = calcStrength(v);
    updatePasswordStrength();
    updatePasswordMatchError();
    updateStep3Button();
  });

  listen('input-password-confirm', v => {
    state.adminPasswordConfirm = v;
    updatePasswordMatchError();
    updateStep3Button();
  });

  // Immediately evaluate button state (critical for back-navigation)
  updateStep3Button();
  updateEmailError();
  // Also restore password strength bar if password already exists
  if (state.adminPassword.length > 0) {
    state.passwordStrength = calcStrength(state.adminPassword);
    updatePasswordStrength();
  }
}

function bindStep4Events() {

  // Site fields
  listen('input-site-name', v => { state.siteName = v; updateStep4Button(); });
  listen('input-site-tagline', v => { state.siteTagline = v; });

  // Immediately evaluate button state (critical for back-navigation)
  updateStep4Button();
}

function updateStep4Button() {
  updateButtonState('btn-next', state.siteName.length > 0);
}

function bindStep5() {
  // Driver selection
  const driverSelect = document.getElementById('mail-driver');
  if (driverSelect) {
    driverSelect.addEventListener('change', (e) => {
      state.mailDriver = e.target.value;
      state.mailTestResult = null;
      render();
    });
  }

  // Preset selection
  const presetSelect = document.getElementById('mail-preset');
  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      const key = e.target.value;
      state.mailSmtpPreset = key;
      if (key && state.mailPresets[key]) {
        const preset = state.mailPresets[key];
        state.mailSmtpHost = preset.host || '';
        state.mailSmtpPort = String(preset.port || 587);
        state.mailSmtpEncryption = preset.encryption || 'tls';
      }
      render();
    });
  }

  // SMTP fields
  listen('mail-smtp-host', v => { state.mailSmtpHost = v; });
  listen('mail-smtp-port', v => { state.mailSmtpPort = v; });
  listen('mail-smtp-username', v => { state.mailSmtpUsername = v; });
  listen('mail-smtp-password', v => { state.mailSmtpPassword = v; });

  const encryptionSelect = document.getElementById('mail-smtp-encryption');
  if (encryptionSelect) {
    encryptionSelect.addEventListener('change', (e) => {
      state.mailSmtpEncryption = e.target.value;
    });
  }

  // Mailpit fields
  listen('mail-mailpit-host', v => { state.mailMailpitHost = v; });
  listen('mail-mailpit-port', v => { state.mailMailpitPort = v; });

  // From fields
  listen('mail-from-address', v => { state.mailFromAddress = v; });
  listen('mail-from-name', v => { state.mailFromName = v; });

  // Test email
  listen('mail-test-email', v => { state.mailTestEmail = v; });

  const testBtn = document.getElementById('btn-mail-test');
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      if (!state.mailTestEmail || !state.mailTestEmail.includes('@')) return;

      state.mailTesting = true;
      state.mailTestResult = null;
      render();

      try {
        const testConfig = collectMailConfig();
        const result = await apiPost('/install/test-mail', {
          config: testConfig,
          test_recipient: state.mailTestEmail,
        });

        if (result.ok) {
          state.mailTestResult = {
            ok: true,
            message: result.data?.message || 'Test email sent! Check your inbox.',
          };
        } else {
          state.mailTestResult = {
            ok: false,
            message: result.error?.message || 'Failed to send test email.',
          };
        }
      } catch (e) {
        state.mailTestResult = { ok: false, message: 'Network error.' };
      }
      state.mailTesting = false;
      render();
    });
  }
}

/** Attach input listener without re-rendering */
function listen(id, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', e => fn(e.target.value));
}

// ═══════════════════════════════════════════
//  Surgical DOM Updates (no re-render)
// ═══════════════════════════════════════════

function updateButtonState(id, enabled) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = !enabled;
  if (enabled) {
    btn.classList.remove('bg-vs-bg-raised', 'text-vs-text-ghost', 'cursor-not-allowed');
    btn.classList.add('bg-vs-accent', 'text-white', 'hover:bg-vs-accent-hover', 'cursor-pointer');
  } else {
    btn.classList.remove('bg-vs-accent', 'text-white', 'hover:bg-vs-accent-hover', 'cursor-pointer');
    btn.classList.add('bg-vs-bg-raised', 'text-vs-text-ghost', 'cursor-not-allowed');
  }
}

function updatePasswordStrength() {
  const el = document.getElementById('password-strength');
  if (!el) return;
  const s = state.passwordStrength;
  if (state.adminPassword.length === 0) { el.innerHTML = ''; return; }
  const color = s >= 80 ? 'bg-vs-success' : s >= 50 ? 'bg-vs-warning' : 'bg-vs-error';
  const label = s >= 80 ? 'Strong' : s >= 50 ? 'Fair' : 'Weak';
  el.innerHTML = `<div class="rounded-full overflow-hidden bg-vs-bg-well" style="height: 4px;">
    <div class="${color} rounded-full transition-all" style="height: 100%; width: ${s}%;"></div>
  </div><span class="text-xs text-vs-text-tertiary" style="display: block; margin-top: 4px;">${label}</span>`;
}

function updatePasswordMatchError() {
  const el = document.getElementById('password-match-error');
  if (!el) return;
  if (state.adminPasswordConfirm.length > 0 && state.adminPassword !== state.adminPasswordConfirm) {
    el.innerHTML = '<span class="text-xs text-vs-error">Passwords don\'t match</span>';
  } else {
    el.innerHTML = '';
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function updateEmailError() {
  const el = document.getElementById('email-error');
  if (!el) return;
  if (state.adminEmail.length > 0 && !isValidEmail(state.adminEmail)) {
    el.innerHTML = '<span class="text-xs text-vs-error">Please enter a valid email address</span>';
  } else {
    el.innerHTML = '';
  }
}

function updateStep3Button() {
  const valid = state.adminName.length > 0
    && isValidEmail(state.adminEmail)
    && state.adminPassword.length >= 8
    && state.adminPassword === state.adminPasswordConfirm;
  updateButtonState('btn-next', valid);
}

// ═══════════════════════════════════════════
//  Navigation
// ═══════════════════════════════════════════

function handleNext() {
  state.error = null;
  if (state.currentStep < state.totalSteps) {
    // Auto-populate email defaults when entering step 5
    if (state.currentStep === 4) {
      if (!state.mailFromAddress) {
        const domain = window.location.hostname.replace(/^www\./, '');
        state.mailFromAddress = `noreply@${domain}`;
      }
      if (!state.mailFromName) {
        state.mailFromName = state.siteName;
      }
    }
    state.currentStep++;
    render();
  }
}

function handleBack() {
  state.error = null;
  if (state.currentStep > 1) { state.currentStep--; render(); }
}

/** Collect email config from state */
function collectMailConfig() {
  const config = {
    driver: state.mailDriver,
    from_address: state.mailFromAddress,
    from_name: state.mailFromName,
  };

  if (state.mailDriver === 'smtp') {
    config.smtp_host = state.mailSmtpHost;
    config.smtp_port = parseInt(state.mailSmtpPort, 10) || 587;
    config.smtp_encryption = state.mailSmtpEncryption;
    config.smtp_username = state.mailSmtpUsername;
    config.smtp_password = state.mailSmtpPassword;
  } else if (state.mailDriver === 'mailpit') {
    config.mailpit_host = state.mailMailpitHost;
    config.mailpit_port = parseInt(state.mailMailpitPort, 10) || 1025;
  }

  return config;
}

async function handleComplete() {
  state.error = null;
  state.installing = true;
  render();

  try {
    const result = await apiPost('/install/complete', {
      ai_provider: state.aiProvider,
      ai_api_key: state.aiApiKey,
      ai_model: state.aiModel,
      ai_base_url: state.aiBaseUrl,
      admin_name: state.adminName,
      admin_email: state.adminEmail,
      admin_password: state.adminPassword,
      site_name: state.siteName,
      site_tagline: state.siteTagline,
      starting_mode: 'empty',
      mail_config: collectMailConfig(),
    });

    if (result.ok) {
      state.currentStep = 6;
      render();
      // Redirect after animation completes
      setTimeout(() => { window.location.href = '/_studio/#/chat'; }, 1400);
    } else {
      state.installing = false;
      state.error = result.error?.message || 'Installation failed. Please try again.';
      render();
    }
  } catch (e) {
    state.installing = false;
    state.error = 'Network error. Check your connection and try again.';
    render();
  }
}

// ═══════════════════════════════════════════
//  Utilities
// ═══════════════════════════════════════════

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function calcStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s += 20;
  if (pw.length >= 12) s += 15;
  if (pw.length >= 16) s += 10;
  if (/[a-z]/.test(pw)) s += 10;
  if (/[A-Z]/.test(pw)) s += 15;
  if (/[0-9]/.test(pw)) s += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) s += 20;
  return Math.min(100, s);
}

// ═══════════════════════════════════════════
//  Init
// ═══════════════════════════════════════════

async function init() {
  render();

  // Load requirements and providers in parallel
  try {
    const [checkRes, provRes] = await Promise.all([
      apiPost('/install/check'),
      apiGet('/install/providers'),
    ]);

    if (checkRes.ok) {
      state.checks = checkRes.checks;
      state.canProceed = checkRes.can_proceed;
    } else {
      state.checks = [];
      state.error = checkRes.error?.message || 'Failed to check requirements.';
    }

    if (provRes.ok && provRes.data?.providers) {
      state.providers = provRes.data.providers;
    }
  } catch (e) {
    state.checks = [];
    state.error = e.message || 'Cannot reach the server. Is PHP running?';
  }
  state.checksLoading = false;
  render();
}

init();
