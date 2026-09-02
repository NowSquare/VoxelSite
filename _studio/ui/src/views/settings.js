/**
 * VoxelSite Studio — Settings View
 *
 * Full Settings page: site identity, AI provider, email config,
 * knowledge viewer, API usage, system info, updates, danger zone.
 */

import { icons } from '../icons.js';
import { store } from '../../state.js';
import { api } from '../../api.js';
import { showToast } from '../ui/toasts.js';
import { escapeHtml } from '../helpers.js';
import { closeModal, showConfirmModal, onBackdropClick } from '../ui/modals.js';
import { router } from '../../router.js';

function renderSettingsView() {
  // Load settings on render
  setTimeout(() => loadSettings(), 0);

  return `
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Settings</h1>
        <p class="vs-page-subtitle">AI configuration, site settings, and system info.</p>
      </div>

      <div id="settings-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading settings...</div>
      </div>
    </div>
  `;
}

async function loadSettings() {
  const container = document.getElementById('settings-content');
  if (!container) return;

  const [settingsRes, systemRes, mailRes, usageRes, memoryRes, designRes, logsRes] = await Promise.all([
    api.get('/settings'),
    api.get('/settings/system'),
    api.get('/settings/mail'),
    api.get('/settings/usage'),
    api.get('/files/content?path=' + encodeURIComponent('assets/data/memory.json')),
    api.get('/files/content?path=' + encodeURIComponent('assets/data/design-intelligence.json')),
    api.get('/settings/logs'),
  ]);

  const logFiles = logsRes.data?.logs || [];

  const s = settingsRes.data?.settings || {};
  const sys = systemRes.data?.system || {};

  // Detect current favicon — always show the img, use onerror to fall back
  const currentFavicon = s.site_favicon || null;
  const faviconUrl = currentFavicon
    ? `/${currentFavicon}?v=${Date.now()}`
    : '/favicon.ico?v=' + Date.now();

  // AI Knowledge files (may not exist for new sites)
  let memoryData = null;
  let designData = null;
  try { if (memoryRes.ok && memoryRes.data?.content) memoryData = JSON.parse(memoryRes.data.content); } catch {}
  try { if (designRes.ok && designRes.data?.content) designData = JSON.parse(designRes.data.content); } catch {}
  const hasKnowledge = memoryData || designData;
  const usageData = usageRes.data || { models: [], totals: { request_count: 0, total_input_tokens: 0, total_output_tokens: 0 } };
  const providers = s.available_providers || {};
  const mailConfig = mailRes.data?.config || {};
  const mailPresets = mailRes.data?.presets || {};
  const providerIds = Object.keys(providers);
  const currentProviderId = s.ai_provider || 'claude';
  const currentProvider = providers[currentProviderId] || { name: 'Claude', models: [], config_fields: [] };
  const configFields = currentProvider.config_fields || [];
  const currentModel = s[`ai_${currentProviderId}_model`] || '';
  const keyIsSet = s[`ai_${currentProviderId}_api_key_set`] || false;

  // Provider selector
  const providerOptions = providerIds.map(pid => {
    const p = providers[pid];
    return `<option value="${escapeHtml(pid)}" ${pid === currentProviderId ? 'selected' : ''}>${escapeHtml(p.name)}</option>`;
  }).join('');

  // Dynamic config fields
  let configFieldsHtml = '';
  for (const f of configFields) {
    if (f.key === 'api_key') {
      configFieldsHtml += `
        <div>
          <label for="set-api-key" class="block text-sm font-medium text-vs-text-secondary mb-1">${escapeHtml(f.label)}${!f.required ? ' <span class="text-vs-text-ghost font-normal">(optional)</span>' : ''}</label>
          <div class="flex gap-2">
            <input id="set-api-key" type="password" value="${keyIsSet ? '••••••••••••••••' : ''}"
              class="vs-input font-mono" style="flex: 1;"
              placeholder="${escapeHtml(f.placeholder)}" />
            <button id="btn-test-api"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Test Connection
            </button>
          </div>
          <p id="api-key-status" class="text-xs mt-1.5 hidden"></p>
          ${keyIsSet
            ? '<p class="text-xs text-vs-text-ghost mt-1">Key is configured. Enter a new key to replace it.</p>'
            : (f.required
              ? '<p class="text-xs text-vs-warning mt-1">No API key set. Add one to enable AI features.</p>'
              : `<p class="text-xs text-vs-text-ghost mt-1">${escapeHtml(f.help_text || 'Optional for local servers')}</p>`)}
          ${f.help_url ? `<a href="${f.help_url}" target="_blank" rel="noopener" class="text-xs text-vs-accent hover:underline mt-1 inline-block">${escapeHtml(f.help_text || 'Get a key')} →</a>` : ''}
        </div>`;
    } else if (f.key === 'base_url') {
      configFieldsHtml += `
        <div>
          <label for="set-base-url" class="block text-sm font-medium text-vs-text-secondary mb-1">${escapeHtml(f.label)}${!f.required ? ' <span class="text-vs-text-ghost font-normal">(optional)</span>' : ''}</label>
          <input id="set-base-url" type="url" value="${escapeHtml(s.ai_openai_compatible_base_url || '')}"
            class="vs-input"
            placeholder="${escapeHtml(f.placeholder)}" />
          ${f.help_text ? `<p class="text-xs text-vs-text-ghost mt-1">${escapeHtml(f.help_text)}</p>` : ''}
        </div>`;
    }
  }

  // Model dropdown will be populated after auto-loading from API

  container.innerHTML = `
    <!-- Card: Site Identity -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">Site Identity</h2>
      <p class="vs-settings-card-subtitle">Your website name and description.</p>
      <div class="flex flex-col gap-4">
        <div>
          <label for="set-site-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Site Name</label>
          <input id="set-site-name" type="text" value="${escapeHtml(s.site_name || '')}"
            class="vs-input" />
        </div>
        <div>
          <label for="set-site-tagline" class="block text-sm font-medium text-vs-text-secondary mb-1">Tagline</label>
          <input id="set-site-tagline" type="text" value="${escapeHtml(s.site_tagline || '')}"
            class="vs-input"
            placeholder="A short description of your site" />
        </div>

        <!-- Favicon -->
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary mb-2">Favicon</label>
          <div class="vs-favicon-zone" id="vs-favicon-zone">
            <div class="vs-favicon-preview" id="vs-favicon-preview">
              <img src="${faviconUrl}" alt="Current favicon" class="vs-favicon-img" id="vs-favicon-img"
                onerror="this.style.display='none'; this.parentElement.innerHTML = '<div class=\\'vs-favicon-placeholder\\'><svg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><path d=\\'m21 15-5-5L5 21\\'/></svg></div>';" />
            </div>
            <div class="vs-favicon-info">
              <div class="vs-favicon-actions">
                <button type="button" class="vs-btn vs-btn-secondary vs-btn-xs" id="btn-favicon-upload">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload
                </button>
                ${currentFavicon ? `
                <button type="button" class="vs-btn vs-btn-ghost vs-btn-xs vs-favicon-remove" id="btn-favicon-remove" title="Remove favicon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
                ` : ''}
              </div>
              <p class="vs-favicon-hint">.ico format — max 512 KB</p>
            </div>
            <input type="file" id="vs-favicon-file" accept=".ico,image/x-icon,image/vnd.microsoft.icon" class="hidden" />
          </div>
        </div>
      </div>
      <div class="vs-settings-card-footer">
        <span id="save-identity-status" class="text-xs text-vs-text-ghost hidden"></span>
        <button id="btn-save-identity" class="vs-btn vs-btn-primary vs-btn-sm">
          Save Identity
        </button>
      </div>
    </div>

    <!-- Card: AI Engine -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Provider</h2>
      <p class="vs-settings-card-subtitle">Configure the AI engine that powers your website generation.</p>
      <div class="flex flex-col gap-4">
        <div>
          <label for="set-ai-provider" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
          <select id="set-ai-provider" class="vs-input">
            ${providerOptions}
          </select>
        </div>

        <div id="settings-config-fields">
          ${configFieldsHtml}
        </div>

        <div>
          <label for="set-ai-model" class="block text-sm font-medium text-vs-text-secondary mb-1">Model</label>
          <select id="set-ai-model" class="vs-input">
            <option value="">Loading models…</option>
          </select>
        </div>

        <div>
          <label for="set-max-tokens" class="block text-sm font-medium text-vs-text-secondary mb-1">Max Output Tokens</label>
          <input id="set-max-tokens" type="number" value="${s.ai_max_tokens || 32000}" min="1000" max="128000" step="1000"
            class="vs-input" />
          <p class="text-xs text-vs-text-ghost mt-1">Higher values allow larger website generations but cost more.</p>
        </div>

        <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; min-width: 0;">
              <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
                <input type="checkbox" id="set-evaluator-enabled" ${s.evaluator_enabled ? 'checked' : ''} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span class="vs-toggle-track" style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${s.evaluator_enabled ? 'var(--vs-accent)' : 'var(--vs-border-medium, #ccc)'};
                  transition: background 0.2s ease;
                "></span>
                <span class="vs-toggle-thumb" style="
                  position: absolute; left: ${s.evaluator_enabled ? '18px' : '2px'}; top: 2px;
                  width: 16px; height: 16px; border-radius: 50%;
                  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                  transition: left 0.2s ease;
                "></span>
              </span>
              <div style="display: flex; flex-direction: column; gap: 1px;">
                <span style="font-size: 13px; font-weight: 500; color: var(--vs-text-secondary);">
                  Expert review after generation
                </span>
                <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.4;">Surfaces heuristic HTML, accessibility, and SEO suggestions after each generation. Does not auto-fix issues — results are advisory for users comfortable reviewing web-design advice. Adds a few seconds and extra tokens per generation.</span>
              </div>
            </label>
          </div>
        </div>

        <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; min-width: 0;">
              <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
                <input type="checkbox" id="set-design-review-enabled" ${s.design_review_enabled ? 'checked' : ''} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span class="vs-toggle-track" style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${s.design_review_enabled ? 'var(--vs-accent)' : 'var(--vs-border-medium, #ccc)'};
                  transition: background 0.2s ease;
                "></span>
                <span class="vs-toggle-thumb" style="
                  position: absolute; left: ${s.design_review_enabled ? '18px' : '2px'}; top: 2px;
                  width: 16px; height: 16px; border-radius: 50%;
                  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                  transition: left 0.2s ease;
                "></span>
              </span>
              <div style="display: flex; flex-direction: column; gap: 1px;">
                <span style="font-size: 13px; font-weight: 500; color: var(--vs-text-secondary);">
                  Design review after generation
                </span>
                <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.4;">A second AI pass judges the page the way a design studio would: hierarchy, typography, color, spacing, distinctiveness and copy. Scored out of 10 with the three biggest gaps, shown in the Expert Review panel. Advisory only. Adds one extra AI call per generation.</span>
              </div>
            </label>
          </div>
        </div>
      </div>
      <div class="vs-settings-card-footer">
        <span id="save-status" class="text-xs text-vs-text-ghost hidden"></span>
        <button id="btn-save-settings" class="vs-btn vs-btn-primary vs-btn-sm">
          Save Settings
        </button>
      </div>
    </div>

    <!-- Card: Email & Notifications -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">Email & Notifications</h2>
      <p class="vs-settings-card-subtitle">Configure how VoxelSite sends transactional emails.</p>
      <div class="flex flex-col gap-4">
        <div>
          <label for="set-mail-driver" class="block text-sm font-medium text-vs-text-secondary mb-1">Delivery Method</label>
          <select id="set-mail-driver" class="vs-input">
            <option value="none" ${mailConfig.driver === 'none' ? 'selected' : ''}>Not configured</option>
            <option value="php_mail" ${mailConfig.driver === 'php_mail' ? 'selected' : ''}>PHP mail()</option>
            <option value="smtp" ${mailConfig.driver === 'smtp' ? 'selected' : ''}>SMTP</option>
            <option value="mailpit" ${mailConfig.driver === 'mailpit' ? 'selected' : ''}>Mailpit (local dev)</option>
          </select>
        </div>

        <!-- SMTP Fields -->
        <div id="mail-smtp-fields" style="display: ${mailConfig.driver === 'smtp' ? 'block' : 'none'};">
          <div class="flex flex-col gap-4">
            <div>
              <label for="set-smtp-preset" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
              <select id="set-smtp-preset" class="vs-input">
                ${Object.entries(mailPresets).map(([key, preset]) =>
                  `<option value="${escapeHtml(key)}">${escapeHtml(preset.label)}</option>`
                ).join('')}
              </select>
              <p id="smtp-preset-help" class="text-xs text-vs-text-ghost mt-1"></p>
            </div>

            <div>
              <label for="set-smtp-host" class="block text-sm font-medium text-vs-text-secondary mb-1">SMTP Host</label>
              <input id="set-smtp-host" type="text" value="${escapeHtml(mailConfig.smtp_host || '')}"
                class="vs-input"
                placeholder="smtp.example.com" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="set-smtp-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Port</label>
                <input id="set-smtp-port" type="number" value="${mailConfig.smtp_port || 587}" min="1" max="65535"
                  class="vs-input" />
              </div>
              <div>
                <label for="set-smtp-encryption" class="block text-sm font-medium text-vs-text-secondary mb-1">Encryption</label>
                <select id="set-smtp-encryption" class="vs-input">
                  <option value="tls" ${mailConfig.smtp_encryption === 'tls' ? 'selected' : ''}>TLS (STARTTLS)</option>
                  <option value="ssl" ${mailConfig.smtp_encryption === 'ssl' ? 'selected' : ''}>SSL</option>
                  <option value="none" ${mailConfig.smtp_encryption === 'none' ? 'selected' : ''}>None</option>
                </select>
              </div>
            </div>

            <div>
              <label for="set-smtp-username" class="block text-sm font-medium text-vs-text-secondary mb-1">Username</label>
              <input id="set-smtp-username" type="text" value="${escapeHtml(mailConfig.smtp_username || '')}"
                class="vs-input"
                placeholder="user@example.com" />
            </div>

            <div>
              <label for="set-smtp-password" class="block text-sm font-medium text-vs-text-secondary mb-1">Password</label>
              <div class="relative">
                <input id="set-smtp-password" type="password" value="${mailConfig.smtp_password || ''}"
                  class="vs-input font-mono"
                  style="padding-right: 40px;"
                  placeholder="Enter SMTP password" />
                <button id="btn-toggle-smtp-pass" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-vs-text-ghost hover:text-vs-text-secondary transition-colors cursor-pointer" tabindex="-1" style="background:none;border:none;padding:4px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mailpit Fields -->
        <div id="mail-mailpit-fields" style="display: ${mailConfig.driver === 'mailpit' ? 'block' : 'none'};">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="set-mailpit-host" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Host</label>
              <input id="set-mailpit-host" type="text" value="${escapeHtml(mailConfig.mailpit_host || 'localhost')}"
                class="vs-input" />
            </div>
            <div>
              <label for="set-mailpit-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Port</label>
              <input id="set-mailpit-port" type="number" value="${mailConfig.mailpit_port || 1025}" min="1" max="65535"
                class="vs-input" />
            </div>
          </div>
        </div>

        <!-- Common Fields (From address, test) -->
        <div id="mail-common-fields" style="display: ${mailConfig.driver === 'none' ? 'none' : 'block'};">
        <div class="border-t border-vs-border-subtle my-2"></div>
        <div class="flex flex-col gap-4">
        <div>
          <label for="set-mail-from-address" class="block text-sm font-medium text-vs-text-secondary mb-1">From Address</label>
          <input id="set-mail-from-address" type="email" value="${escapeHtml(mailConfig.from_address || '')}"
            class="vs-input"
            placeholder="noreply@yourdomain.com" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender on notification emails.</p>
        </div>

        <div>
          <label for="set-mail-from-name" class="block text-sm font-medium text-vs-text-secondary mb-1">From Name</label>
          <input id="set-mail-from-name" type="text" value="${escapeHtml(mailConfig.from_name || '')}"
            class="vs-input"
            placeholder="Your Site Name" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender name on notification emails.</p>
        </div>

        <div class="border-t border-vs-border-subtle"></div>

        <!-- Test Email -->
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary mb-1">Test Email</label>
          <div class="flex gap-2">
            <input id="set-mail-test-recipient" type="email" value="${escapeHtml(s.user_email || '')}"
              class="vs-input" style="flex: 1;"
              placeholder="your@email.com" />
            <button id="btn-mail-test"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Send Test
            </button>
          </div>
          <p id="mail-test-status" class="text-xs mt-1.5 hidden"></p>
        </div>
        </div>
      </div>
      </div>
      <div class="vs-settings-card-footer">
        <span id="save-mail-status" class="text-xs text-vs-text-ghost hidden"></span>
        <button id="btn-save-mail" class="vs-btn vs-btn-primary vs-btn-sm">
          Save Email Settings
        </button>
      </div>
    </div>

    ${hasKnowledge ? `
    <!-- Card: AI Knowledge -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Knowledge</h2>
      <p class="vs-settings-card-subtitle">What the AI knows about your site. These values are learned from your conversations.</p>
      <div class="vs-knowledge-cards">
        ${memoryData ? `
        <button class="vs-knowledge-card" id="btn-view-memory">
          <div class="vs-knowledge-card-icon">${icons.book}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Site Memory</span>
            <span class="vs-knowledge-card-desc">${Object.keys(memoryData).length} facts remembered</span>
          </div>
          <div class="vs-knowledge-card-arrow">${icons.chevronRight}</div>
        </button>
        ` : ''}
        ${designData ? `
        <button class="vs-knowledge-card" id="btn-view-design">
          <div class="vs-knowledge-card-icon">${icons.eye}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Design Intelligence</span>
            <span class="vs-knowledge-card-desc">${Object.keys(designData).length} design decisions</span>
          </div>
          <div class="vs-knowledge-card-arrow">${icons.chevronRight}</div>
        </button>
        ` : ''}
      </div>
      <p class="vs-knowledge-hint">
        ${icons.info}
        You can't edit these values directly — ask VoxelSite in chat to update them.
      </p>
    </div>
    ` : ''}

    <!-- Card: AI Usage -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Usage</h2>
      <p class="vs-settings-card-subtitle">Token consumption and cost tracking across models.</p>
      ${usageData.models.length === 0 ? `
        <div class="text-sm text-vs-text-ghost py-4 text-center">No usage data yet. Start generating to see stats.</div>
      ` : `
        <div class="vs-sys-grid">
          ${renderSysRow('Total Requests', Number(usageData.totals.request_count).toLocaleString())}
          ${renderSysRow('Input Tokens', Number(usageData.totals.total_input_tokens).toLocaleString())}
          ${renderSysRow('Output Tokens', Number(usageData.totals.total_output_tokens).toLocaleString())}

        </div>
        ${usageData.models.length > 1 ? `
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vs-border-subtle);">
            <div class="text-xs text-vs-text-ghost mb-2" style="text-transform: uppercase; letter-spacing: 0.05em;">Per Model</div>
            ${usageData.models.map(m => `
              <div class="vs-sys-grid" style="margin-bottom: 8px;">
                ${renderSysRow(m.ai_model || 'Unknown', Number(m.request_count).toLocaleString() + ' requests')}
                ${renderSysRow('Tokens', Number(m.total_input_tokens).toLocaleString() + ' in / ' + Number(m.total_output_tokens).toLocaleString() + ' out')}

              </div>
            `).join('')}
          </div>
        ` : ''}
      `}
    </div>

    <!-- Card: System Status -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">System Status</h2>
      <p class="vs-settings-card-subtitle">Runtime environment and resource usage.</p>
      <div class="vs-sys-grid">
        ${renderSysRow('VoxelSite', sys.version || '1.0.0')}
        ${renderSysRow('PHP', sys.php_version || '?')}
        ${renderSysRow('SQLite', sys.sqlite_version || '?')}
        ${renderSysRow('Database', formatFileSize(sys.database_size))}
        ${renderSysRow('Preview Files', formatFileSize(sys.preview_size))}
        ${renderSysRow('Assets', formatFileSize(sys.assets_size))}
        ${renderSysRow('Upload Limit', sys.max_upload || '?')}
        ${renderSysRow('Memory Limit', sys.memory_limit || '?')}
      </div>
    </div>

    <!-- Card: Git Updates (renders only when this install is a Git checkout) -->
    <div id="vs-git-update-card"></div>

    <!-- Card: Update -->
    <div class="vs-settings-card">
      <div class="flex items-center justify-between mb-1">
        <h2 class="vs-settings-card-title mb-0">Update</h2>
        <span class="vs-pill vs-pill-subtle">v${escapeHtml(sys.version || '1.0.0')}</span>
      </div>
      <p class="vs-settings-card-subtitle">Upload a VoxelSite update package (.zip) to update to the latest version. Your pages, settings, database, and uploaded files are preserved.</p>

      <!-- Detected dist packages (populated dynamically) -->
      <div id="vs-dist-packages"></div>

      <div class="vs-update-zone" id="vs-update-zone">
        <div class="vs-update-zone-idle" id="vs-update-idle">
          <div class="vs-update-zone-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div class="vs-update-zone-text">
            <span class="vs-update-zone-label">Drop update .zip here or click to browse</span>
            <span class="vs-update-zone-hint">Only system files are updated — your content stays safe</span>
            <span class="vs-update-zone-hint" style="margin-top: 4px; opacity: 0.6;">Upload limit too low? Upload the .zip to <code>/dist/</code> via FTP and it will appear above.</span>
          </div>
          <input type="file" id="vs-update-file" accept=".zip" class="hidden" />
        </div>

        <div class="vs-update-zone-progress hidden" id="vs-update-progress">
          <div class="vs-update-spinner"></div>
          <span id="vs-update-status">Uploading...</span>
        </div>

        <div class="vs-update-zone-result hidden" id="vs-update-result">
          <div id="vs-update-result-icon"></div>
          <div id="vs-update-result-message"></div>
        </div>
      </div>
    </div>

    <!-- Server Logs -->
    <div class="vs-settings-card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: ${logFiles.length > 0 ? '16px' : '0'};">
        <div>
          <h3 class="vs-settings-card-title">Server Logs</h3>
          <p class="vs-settings-card-subtitle" style="margin-bottom: 0;">Download log files for debugging.</p>
        </div>
        ${logFiles.length > 0 ? `<button id="btn-delete-all-logs" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost); white-space: nowrap;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Delete all
        </button>` : ''}
      </div>
      <div id="log-files-list" style="display: flex; flex-direction: column; gap: 6px;">
        ${logFiles.length === 0
          ? '<p style="color: var(--vs-text-ghost); font-size: var(--text-xs); margin: 0;">No log files yet.</p>'
          : logFiles.map(f => {
            const sizeKB = (f.size / 1024).toFixed(1);
            const date = new Date(f.modified * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return `<div class="vs-log-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-md);">
              <span style="font-family: var(--font-mono); font-size: 12px; color: var(--vs-text-primary);">${f.name}</span>
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; color: var(--vs-text-ghost); white-space: nowrap;">${f.lines} lines · ${sizeKB} KB · ${date}</span>
                <a href="/_studio/api/router.php?_path=%2Fsettings%2Flogs%2Fdownload&file=${encodeURIComponent(f.name)}" download class="vs-btn vs-btn-ghost vs-btn-xs" style="text-decoration: none; padding: 2px 8px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
                <button class="vs-btn vs-btn-ghost vs-btn-xs btn-delete-log" data-file="${f.name}" style="padding: 2px 8px; color: var(--vs-text-ghost);" title="Delete">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            </div>`;
          }).join('')}
      </div>
    </div>

    <!-- Card: API Access -->
    <div class="vs-settings-card" id="api-access-card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div>
          <h2 class="vs-settings-card-title" style="display: flex; align-items: center; gap: 8px;">API Access <span style="font-size: 10px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; background: color-mix(in srgb, var(--vs-accent) 12%, transparent); color: var(--vs-accent); border: 1px solid color-mix(in srgb, var(--vs-accent) 25%, transparent);">Beta</span></h2>
          <p class="vs-settings-card-subtitle" style="margin-bottom: 0;">Manage Agent API keys for external integrations and automations.</p>
        </div>
        <a href="/_studio/api/agent/v1/schema" target="_blank" rel="noopener" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost); white-space: nowrap; text-decoration: none;">
          ${icons.externalLink} View API schema
        </a>
      </div>
      <div class="flex flex-col gap-4">
        <div style="display: flex; align-items: center; gap: 10px;">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; min-width: 0;">
            <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
              <input type="checkbox" id="set-api-enabled" ${s.agent_api_enabled ? 'checked' : ''} style="position: absolute; opacity: 0; width: 0; height: 0;" />
              <span class="vs-toggle-track" style="
                position: absolute; inset: 0; border-radius: 10px;
                background: ${s.agent_api_enabled ? 'var(--vs-accent)' : 'var(--vs-border-medium, #ccc)'};
                transition: background 0.2s ease;
              "></span>
              <span class="vs-toggle-thumb" style="
                position: absolute; left: ${s.agent_api_enabled ? '18px' : '2px'}; top: 2px;
                width: 16px; height: 16px; border-radius: 50%;
                background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                transition: left 0.2s ease;
              "></span>
            </span>
            <div style="display: flex; flex-direction: column; gap: 1px;">
              <span style="font-size: 13px; font-weight: 500; color: var(--vs-text-secondary);">
                Enable Agent API
              </span>
              <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.4;">Allow external applications to manage your site via authenticated REST API.</span>
            </div>
          </label>
        </div>

        <div id="api-access-body" style="${s.agent_api_enabled ? '' : 'opacity: 0.4; pointer-events: none;'}">
          <div style="margin-bottom: 16px;">
            <label for="set-api-origins" style="display: block; font-size: 13px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;">Allowed Origins</label>
            <textarea id="set-api-origins"
              class="vs-input" rows="3"
              style="resize: vertical; font-family: var(--font-mono); font-size: 12px; height: auto; padding: 10px 14px; line-height: 1.5;"
              placeholder="*">${escapeHtml(s.agent_api_allowed_origins || '*')}</textarea>
            <p style="font-size: 11px; color: var(--vs-text-ghost); margin: 6px 0 0;">Enter <code>*</code> to allow all origins, or one origin per line (e.g. <code>https://example.com</code>).</p>
          </div>

          <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <span style="font-size: 13px; font-weight: 500; color: var(--vs-text-secondary);">API Keys</span>
              <button id="btn-generate-api-key" class="vs-btn vs-btn-secondary vs-btn-xs">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Generate Key
              </button>
            </div>
            <div id="api-keys-list">
              <div class="text-xs text-vs-text-ghost text-center py-4">Loading keys...</div>
            </div>
          </div>
        </div>
      </div>
      <div class="vs-settings-card-footer">
        <span id="save-api-status" class="text-xs text-vs-text-ghost hidden"></span>
        <button id="btn-save-api-settings" class="vs-btn vs-btn-primary vs-btn-sm">
          Save API Settings
        </button>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="vs-danger-zone">
      <h3 class="vs-danger-zone-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Danger Zone
      </h3>

      <p class="vs-danger-zone-desc">
        Clear the entire website and start fresh. This removes all pages, styles, scripts,
        conversation history, forms, and revisions. Your settings, API keys, and uploaded images are preserved.
      </p>
      <button id="btn-reset-site" class="vs-btn vs-btn-danger vs-btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Website
      </button>

      <div style="border-top: 1px solid var(--vs-border-subtle); margin: 16px 0;"></div>

      <p class="vs-danger-zone-desc">
        Completely wipe the installation — database, config, uploaded files, and all generated content.
        The installation wizard will appear so you can start from scratch.
      </p>
      <button id="btn-reset-install" class="vs-btn vs-btn-danger vs-btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        Reset Installation
      </button>
    </div>
  `;

  // Bind settings events
  bindSettingsEvents(s, providers);

  // Bind email settings events
  bindEmailSettingsEvents(mailConfig, mailPresets);

  // Bind reset button
  bindResetSiteEvent();

  // Bind reset installation button
  bindResetInstallEvent();

  // Bind API Access events
  bindApiAccessEvents(s);

  // Bind log deletion buttons (two-step confirm)
  document.querySelectorAll('.btn-delete-log').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (window.demoGuard?.()) return;
      if (btn.dataset.confirm !== 'true') {
        btn.dataset.confirm = 'true';
        btn.innerHTML = '<span style="font-size: 11px;">Sure?</span>';
        btn.style.color = 'var(--vs-error)';
        setTimeout(() => {
          if (btn.dataset.confirm === 'true') {
            btn.dataset.confirm = '';
            btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            btn.style.color = '';
          }
        }, 3000);
        return;
      }
      const file = btn.dataset.file;
      const row = btn.closest('.vs-log-row');
      if (row) row.style.opacity = '0.4';
      await api.delete('/settings/logs', { file });
      loadSettings();
    });
  });
  const deleteAllBtn = document.getElementById('btn-delete-all-logs');
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', async () => {
      if (window.demoGuard?.()) return;
      if (deleteAllBtn.dataset.confirm !== 'true') {
        deleteAllBtn.dataset.confirm = 'true';
        deleteAllBtn.textContent = 'Sure?';
        deleteAllBtn.style.color = 'var(--vs-error)';
        setTimeout(() => {
          if (deleteAllBtn.dataset.confirm === 'true') {
            deleteAllBtn.dataset.confirm = '';
            deleteAllBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete all`;
            deleteAllBtn.style.color = '';
          }
        }, 3000);
        return;
      }
      deleteAllBtn.disabled = true;
      deleteAllBtn.textContent = 'Deleting...';
      await api.delete('/settings/logs', { file: '*' });
      loadSettings();
    });
  }

  // Bind AI Knowledge viewer buttons
  const memoryBtn = document.getElementById('btn-view-memory');
  if (memoryBtn && memoryData) {
    memoryBtn.addEventListener('click', () => openKnowledgeViewer('Site Memory', memoryData, 'memory'));
  }
  const designBtn = document.getElementById('btn-view-design');
  if (designBtn && designData) {
    designBtn.addEventListener('click', () => openKnowledgeViewer('Design Intelligence', designData, 'design'));
  }

  // Bind update upload
  bindUpdateUpload();

  // Bind Git update card (renders only when this install is a Git checkout)
  bindGitUpdate();

  // Bind favicon upload
  bindFaviconUpload();

  // Auto-load models from stored credentials
  autoLoadModels(currentModel);
}

/**
 * Open a cream-themed knowledge viewer modal.
 * @param {string} title - 'Site Memory' or 'Design Intelligence'
 * @param {object} data - The parsed JSON data
 * @param {'memory'|'design'} type - Controls how entries are rendered
 */
/**
 * Compare two semver strings. Returns -1, 0, or 1.
 */
function versionCompare(a, b) {
  const pa = (a || '0').split('.').map(Number);
  const pb = (b || '0').split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

/**
 * Render the Git update card into #vs-git-update-card.
 *
 * Only shows when the install is a Git checkout. Mirrors a status-card UX —
 * "Up to date", "N updates available", "Local changes detected", "Setup needed"
 * — rather than dumping raw git output. The repo details sit in a small footnote.
 */
async function bindGitUpdate() {
  const host = document.getElementById('vs-git-update-card');
  if (!host) return;

  try {
    const { ok, data } = await api.get('/update/git-status');
    if (!ok || !data || !data.is_repo) { host.innerHTML = ''; return; } // not a Git checkout → ZIP card is the path
    renderGitCard(host, data);
  } catch (_) {
    host.innerHTML = ''; // non-critical — fall back to the ZIP card silently
  }
}

function renderGitCard(host, st) {
  const canUpdate = st.state === 'update_available';
  const pill = canUpdate
    ? '<span class="vs-pill vs-pill-success">' + st.behind + ' available</span>'
    : st.state === 'up_to_date'
      ? '<span class="vs-pill vs-pill-subtle">Up to date</span>'
      : '<span class="vs-pill vs-pill-subtle">Action needed</span>';

  const footnote = [
    st.branch ? `branch <code>${escapeHtml(st.branch)}</code>` : '',
    st.short_sha ? `at <code>${escapeHtml(st.short_sha)}</code>` : '',
    st.upstream ? `tracking <code>${escapeHtml(st.upstream)}</code>` : '',
  ].filter(Boolean).join(' · ');

  host.innerHTML = `
    <div class="vs-settings-card" id="vs-git-card">
      <div class="flex items-center justify-between mb-1">
        <h2 class="vs-settings-card-title mb-0">Git Updates</h2>
        ${pill}
      </div>
      <p class="vs-settings-card-subtitle">${escapeHtml(st.message || '')}</p>
      <div id="vs-git-body">
        ${canUpdate ? `
          <button id="btn-git-update" class="vs-btn vs-btn-primary vs-btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
            Update now
          </button>` : ''}
        ${footnote ? `<p style="font-size: 11px; color: var(--vs-text-ghost); margin: 12px 0 0;">${footnote}</p>` : ''}
      </div>
    </div>
  `;

  const btn = document.getElementById('btn-git-update');
  if (btn) btn.addEventListener('click', runGitUpdate);
}

async function runGitUpdate() {
  if (window.demoGuard?.()) return;
  const body = document.getElementById('vs-git-body');
  if (!body) return;

  const confirmOk = confirm(
    `Pull the latest changes from Git?\n\n` +
    `The app resets to match the repository (system files only). Your pages, ` +
    `database, settings, and uploaded files are preserved. A reload is required after.`
  );
  if (!confirmOk) return;

  body.innerHTML = `<div style="display: flex; align-items: center; gap: 10px;"><div class="vs-update-spinner"></div><span>Updating…</span></div>`;

  try {
    const { ok, data, error } = await api.post('/update/git-update', {});
    if (ok) {
      const migs = data.migrations?.result?.applied?.length || 0;
      body.innerHTML = `
        <div class="vs-update-result-title" style="color: var(--vs-success);">Updated to v${escapeHtml(data.to_version || '')}.</div>
        <div class="vs-update-result-meta">
          ${escapeHtml(data.from_sha || '?')} → ${escapeHtml(data.to_sha || '?')}${migs ? ` · ${migs} migration${migs === 1 ? '' : 's'} applied` : ' · no migrations needed'}
        </div>
        <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">Reload Studio</button>
      `;
    } else {
      body.innerHTML = `
        <div class="vs-update-result-title" style="color: var(--vs-error);">${escapeHtml(error?.message || 'Update failed.')}</div>
        <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="location.reload()">Close</button>
      `;
    }
  } catch (err) {
    body.innerHTML = `<div class="vs-update-result-title" style="color: var(--vs-error);">${escapeHtml(err.message || 'Network error.')}</div>`;
  }
}

/**
 * Bind the update upload zone: click-to-browse, drag-and-drop, and the upload flow.
 * Also checks for update packages in /dist/ and displays them.
 */
function bindUpdateUpload() {
  const zone = document.getElementById('vs-update-zone');
  const idleEl = document.getElementById('vs-update-idle');
  const progressEl = document.getElementById('vs-update-progress');
  const resultEl = document.getElementById('vs-update-result');
  const fileInput = document.getElementById('vs-update-file');
  const statusEl = document.getElementById('vs-update-status');
  const distContainer = document.getElementById('vs-dist-packages');

  if (!zone || !fileInput) return;

  // ── Load dist packages ──
  loadDistPackages();

  async function loadDistPackages() {
    if (!distContainer) return;
    try {
      const { ok, data } = await api.get('/update/dist-packages');
      if (!ok || !data?.packages?.length) {
        distContainer.innerHTML = '';
        return;
      }

      const currentVersion = data.current_version || '0.0.0';
      const pkgHtml = data.packages.map(pkg => {
        const sizeMB = (pkg.size / 1024 / 1024).toFixed(1);
        const isNewer = versionCompare(pkg.version, currentVersion) > 0;
        const isSame = pkg.version === currentVersion;
        const badge = isNewer
          ? '<span class="vs-pill vs-pill-success" style="font-size: 10px;">newer</span>'
          : isSame
            ? '<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">current</span>'
            : '<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">older</span>';

        return `
          <div class="vs-dist-pkg">
            <div class="vs-dist-pkg-info">
              <div class="vs-dist-pkg-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <strong>${escapeHtml(pkg.filename)}</strong>
                ${badge}
              </div>
              <div class="vs-dist-pkg-meta">v${escapeHtml(pkg.version)} · ${sizeMB} MB</div>
            </div>
            <button class="vs-btn vs-btn-primary vs-btn-sm vs-dist-apply-btn" data-filename="${escapeHtml(pkg.filename)}" data-version="${escapeHtml(pkg.version)}">
              Apply Update
            </button>
          </div>
        `;
      }).join('');

      distContainer.innerHTML = `
        <div class="vs-dist-packages-section">
          <div class="vs-dist-packages-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <span>Update packages found in <code>/dist/</code></span>
          </div>
          ${pkgHtml}
        </div>
      `;

      // Bind apply buttons
      distContainer.querySelectorAll('.vs-dist-apply-btn').forEach(btn => {
        btn.addEventListener('click', () => applyDistPackage(btn.dataset.filename, btn.dataset.version));
      });
    } catch (_) {
      // Non-critical — just don't show the section
    }
  }

  async function applyDistPackage(filename, version) {
    if (window.demoGuard?.()) return;
    const confirmOk = confirm(
      `Apply update from "${filename}" (v${version})?\n\n` +
      `This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.\n\n` +
      `A page reload is required after the update completes.`
    );
    if (!confirmOk) return;

    // Show progress
    idleEl.classList.add('hidden');
    resultEl.classList.add('hidden');
    progressEl.classList.remove('hidden');
    statusEl.textContent = `Applying ${filename}...`;
    if (distContainer) distContainer.innerHTML = '';

    try {
      const { ok, data, error } = await api.post('/update/apply-local', { filename });

      progressEl.classList.add('hidden');
      resultEl.classList.remove('hidden');

      const resultIcon = document.getElementById('vs-update-result-icon');
      const resultMsg = document.getElementById('vs-update-result-message');

      if (ok) {
        const d = data;
        resultIcon.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
        resultMsg.innerHTML = `
          <div class="vs-update-result-title">${escapeHtml(d.message)}</div>
          <div class="vs-update-result-meta">
            ${d.files_updated} files updated · ${d.files_skipped} preserved
            ${d.migrations_run ? ` · ${d.migrations_run} migration${d.migrations_run === 1 ? '' : 's'}` : ''}
            ${d.errors?.length ? ` · ${d.errors.length} errors` : ''}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `;
      } else {
        showUpdateError('Update Failed', error?.message || 'Unknown error');
      }
    } catch (err) {
      showUpdateError('Update Failed', escapeHtml(err.message || 'Network error.'));
    }
  }

  // Click zone → open file picker
  zone.addEventListener('click', (e) => {
    if (window.demoGuard?.()) return;
    if (e.target.closest('#vs-update-result')) return;
    fileInput.click();
  });

  // Drag-and-drop
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('is-dragover');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('is-dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('is-dragover');
    if (window.demoGuard?.()) return;
    const file = e.dataTransfer?.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      handleUpdateFile(file);
    }
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) handleUpdateFile(file);
    fileInput.value = ''; // Reset for re-selection
  });

  async function handleUpdateFile(file) {
    // ── Pre-flight: check file size against server upload limit ──
    const uploadLimitEl = document.querySelector('.vs-sys-grid');
    if (uploadLimitEl) {
      // Parse server upload limit from the System Status display
      const rows = uploadLimitEl.querySelectorAll('.vs-sys-value');
      let limitText = '';
      uploadLimitEl.querySelectorAll('.vs-sys-label').forEach((label, i) => {
        if (label.textContent.trim() === 'Upload Limit') {
          limitText = rows[i]?.textContent?.trim() || '';
        }
      });
      if (limitText) {
        const limitBytes = parseUploadLimit(limitText);
        if (limitBytes > 0 && file.size > limitBytes) {
          const fileMB = (file.size / 1024 / 1024).toFixed(1);
          showUpdateError(
            'File Too Large',
            `The update file is ${fileMB} MB but your server's upload limit is ${limitText}. ` +
            `Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in your php.ini to at least ${fileMB} MB, then restart your web server.`
          );
          return;
        }
      }
    }

    // Confirm before proceeding
    const confirmOk = confirm(
      `Apply update from "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)} MB)?\n\n` +
      `This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.\n\n` +
      `A page reload is required after the update completes.`
    );
    if (!confirmOk) return;

    // Show progress
    idleEl.classList.add('hidden');
    resultEl.classList.add('hidden');
    progressEl.classList.remove('hidden');
    statusEl.textContent = `Uploading ${file.name}...`;

    try {
      const formData = new FormData();
      formData.append('update_zip', file);

      // We need to use fetch directly because our api helper only sends JSON
      const token = store.get('sessionToken');
      const res = await fetch('/_studio/api/router.php?_path=%2Fupdate%2Fupload', {
        method: 'POST',
        credentials: 'same-origin',
        headers: token ? { 'X-VS-Token': token } : {},
        body: formData,
      });

      // Handle non-JSON responses (e.g., PHP errors when post_max_size is exceeded)
      const contentType = res.headers.get('content-type') || '';
      let json;
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        // PHP upload limit errors return HTML like: <br /> <b>Warning</b>: POST Content-Length...
        if (text.includes('POST Content-Length') || text.includes('upload_max_filesize') || text.includes('exceeds')) {
          showUpdateError(
            'Server Upload Limit Exceeded',
            `The file (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds your server's PHP upload limit. ` +
            `Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`
          );
          return;
        }
        showUpdateError('Upload Failed', 'The server returned an unexpected response. Check your PHP error log for details.');
        return;
      }

      json = await res.json();

      progressEl.classList.add('hidden');
      resultEl.classList.remove('hidden');

      const resultIcon = document.getElementById('vs-update-result-icon');
      const resultMsg = document.getElementById('vs-update-result-message');

      if (json.ok) {
        const d = json.data;
        resultIcon.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
        resultMsg.innerHTML = `
          <div class="vs-update-result-title">${escapeHtml(d.message)}</div>
          <div class="vs-update-result-meta">
            ${d.files_updated} files updated · ${d.files_skipped} preserved
            ${d.migrations_run ? ` · ${d.migrations_run} migration${d.migrations_run === 1 ? '' : 's'}` : ''}
            ${d.errors?.length ? ` · ${d.errors.length} errors` : ''}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `;
      } else {
        showUpdateError('Update Failed', json.error?.message || 'Unknown error');
      }
    } catch (err) {
      // Network errors or other unexpected failures
      const msg = err.message || 'Network error. Check your connection.';
      // Detect JSON parse errors (server returned HTML instead of JSON)
      if (msg.includes('Unexpected token') || msg.includes('not valid JSON')) {
        showUpdateError(
          'Server Upload Limit Exceeded',
          `The file (${(file.size / 1024 / 1024).toFixed(1)} MB) likely exceeds your server's PHP upload limit. ` +
          `Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`
        );
      } else {
        showUpdateError('Upload Failed', escapeHtml(msg));
      }
    }
  }

  /** Show an error in the update zone */
  function showUpdateError(title, message) {
    progressEl.classList.add('hidden');
    resultEl.classList.remove('hidden');
    const resultIcon = document.getElementById('vs-update-result-icon');
    const resultMsg = document.getElementById('vs-update-result-message');
    resultIcon.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    resultMsg.innerHTML = `
      <div class="vs-update-result-title" style="color: var(--vs-error);">${escapeHtml(title)}</div>
      <div class="vs-update-result-meta">${message}</div>
      <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="document.getElementById('vs-update-result').classList.add('hidden'); document.getElementById('vs-update-idle').classList.remove('hidden');">
        Try Again
      </button>
    `;
  }

  /** Parse upload limit string (e.g. "2 MB", "128M") into bytes */
  function parseUploadLimit(text) {
    const match = text.match(/([\d.]+)\s*(MB|M|GB|G|KB|K)/i);
    if (!match) return 0;
    const val = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    if (unit === 'GB' || unit === 'G') return val * 1024 * 1024 * 1024;
    if (unit === 'MB' || unit === 'M') return val * 1024 * 1024;
    if (unit === 'KB' || unit === 'K') return val * 1024;
    return 0;
  }
}

/**
 * Bind the favicon upload zone: click-to-browse, drag-and-drop,
 * upload via FormData, and remove.
 */
function bindFaviconUpload() {
  const zone = document.getElementById('vs-favicon-zone');
  const fileInput = document.getElementById('vs-favicon-file');
  const uploadBtn = document.getElementById('btn-favicon-upload');
  const removeBtn = document.getElementById('btn-favicon-remove');

  if (!zone || !fileInput) return;

  // Click upload button → open file picker
  uploadBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.demoGuard?.()) return;
    fileInput.click();
  });

  // Drag-and-drop on the zone
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('is-dragover');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('is-dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('is-dragover');
    if (window.demoGuard?.()) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFaviconFile(file);
  });

  // File input change
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) handleFaviconFile(file);
    fileInput.value = '';
  });

  // Remove button
  removeBtn?.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (window.demoGuard?.()) return;
    removeBtn.disabled = true;
    removeBtn.style.opacity = '0.5';
    try {
      const res = await api.delete('/settings/favicon');
      if (res.ok) {
        showToast('Favicon removed.', 'success');
        loadSettings();
      } else {
        showToast(res.error?.message || 'Could not remove favicon.', 'error');
      }
    } catch {
      showToast('Could not remove favicon.', 'error');
    }
  });

  async function handleFaviconFile(file) {
    // Validate client-side
    const maxSize = 512 * 1024;
    if (file.size > maxSize) {
      showToast('Favicon must be under 512 KB.', 'error');
      return;
    }

    const allowed = ['image/x-icon', 'image/vnd.microsoft.icon'];
    const extOk = /\.ico$/i.test(file.name);
    if (!extOk && !allowed.includes(file.type)) {
      showToast('Favicon must be a .ico file.', 'error');
      return;
    }

    // Show uploading state
    const preview = document.getElementById('vs-favicon-preview');
    if (preview) {
      preview.innerHTML = `<div class="vs-favicon-placeholder vs-favicon-uploading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vs-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>`;
    }

    try {
      const formData = new FormData();
      formData.append('favicon', file);

      const token = store.get('sessionToken');
      const res = await fetch('/_studio/api/router.php?_path=%2Fsettings%2Ffavicon', {
        method: 'POST',
        credentials: 'same-origin',
        headers: token ? { 'X-VS-Token': token } : {},
        body: formData,
      });

      const json = await res.json();
      if (json.ok) {
        showToast('Favicon updated.', 'success');
        loadSettings();
      } else {
        showToast(json.error?.message || 'Upload failed.', 'error');
        loadSettings();
      }
    } catch {
      showToast('Upload failed. Check your connection.', 'error');
      loadSettings();
    }
  }
}

function openKnowledgeViewer(title, data, type) {
  // Remove existing if present
  document.getElementById('vs-knowledge-overlay')?.remove();

  const formatKey = (k) => k.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  let entriesHtml = '';
  if (type === 'memory') {
    // Memory: key → { value, confidence }
    entriesHtml = Object.entries(data).map(([key, entry]) => {
      const value = typeof entry === 'object' ? (entry.value || JSON.stringify(entry)) : String(entry);
      const confidence = typeof entry === 'object' ? entry.confidence : null;
      const badgeClass = confidence === 'stated' ? 'vs-kv-badge-stated' : 'vs-kv-badge-inferred';
      return `
        <div class="vs-kv-row">
          <div class="vs-kv-label">${escapeHtml(formatKey(key))}</div>
          <div class="vs-kv-value">
            <span>${escapeHtml(value)}</span>
            ${confidence ? `<span class="vs-kv-badge ${badgeClass}">${escapeHtml(confidence)}</span>` : ''}
          </div>
        </div>`;
    }).join('');
  } else {
    // Design: key → string (long-form descriptions)
    entriesHtml = Object.entries(data).map(([key, value]) => `
      <div class="vs-kv-section">
        <div class="vs-kv-section-label">${escapeHtml(formatKey(key))}</div>
        <div class="vs-kv-section-body">${escapeHtml(String(value))}</div>
      </div>
    `).join('');
  }

  const overlay = document.createElement('div');
  overlay.id = 'vs-knowledge-overlay';
  overlay.className = 'vs-modal-overlay';
  overlay.innerHTML = `
    <div class="vs-modal vs-knowledge-modal">
      <div class="vs-knowledge-modal-header">
        <div class="vs-knowledge-modal-title-row">
          <div class="vs-knowledge-modal-icon">${type === 'memory' ? icons.book : icons.eye}</div>
          <div>
            <h2 class="vs-knowledge-modal-title">${escapeHtml(title)}</h2>
            <p class="vs-knowledge-modal-subtitle">${type === 'memory'
              ? 'Facts the AI has learned about your business from conversations.'
              : 'Design decisions the AI uses to maintain visual consistency.'}</p>
          </div>
        </div>
        <button id="vs-knowledge-close" class="vs-btn vs-btn-ghost vs-btn-icon" title="Close">${icons.x}</button>
      </div>
      <div class="vs-knowledge-modal-body">
        ${entriesHtml}
      </div>
      <div class="vs-knowledge-modal-footer">
        <span class="vs-knowledge-modal-hint">
          ${icons.info}
          These values are managed by VoxelSite. Ask in chat to update them.
        </span>
        <button id="vs-knowledge-done" class="vs-btn vs-btn-primary vs-btn-sm">Done</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  const close = () => {
    overlay.classList.remove('is-visible');
    setTimeout(() => overlay.remove(), 300);
    document.removeEventListener('keydown', escHandler);
  };
  const escHandler = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', escHandler);
  overlay.querySelector('#vs-knowledge-close')?.addEventListener('click', close);
  overlay.querySelector('#vs-knowledge-done')?.addEventListener('click', close);
  onBackdropClick(overlay, close);
}

/**
 * Bind the "Reset Website" button to open a premium confirmation modal.
 */
function bindResetSiteEvent() {
  const resetBtn = document.getElementById('btn-reset-site');
  if (!resetBtn) return;

  resetBtn.addEventListener('click', () => {
    if (window.demoGuard?.()) return;
    showResetModal();
  });
}

/**
 * Bind the "Reset Installation" button to open a factory-reset confirmation modal.
 */
function bindResetInstallEvent() {
  const btn = document.getElementById('btn-reset-install');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (window.demoGuard?.()) return;
    showResetInstallModal();
  });
}

/**
 * Show the factory reset confirmation modal with type-to-confirm UX.
 * Requires typing "RESET INSTALLATION" — deliberately longer and more explicit
 * than the site reset to prevent accidental use.
 */
function showResetInstallModal() {
  // Remove any existing modal
  const existing = document.getElementById('reset-install-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'reset-install-modal-overlay';
  overlay.className = 'vs-modal-overlay';
  overlay.innerHTML = `
    <div class="vs-modal" id="reset-install-modal">
      <div class="vs-modal-header">
        <div class="vs-modal-icon vs-modal-icon-danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </div>
        <h2 class="vs-modal-title">Reset Installation</h2>
        <p class="vs-modal-desc">This will erase <strong>everything</strong> — your database, config, account, uploaded files, and all generated content. The installation wizard will appear so you can start completely from scratch.</p>
      </div>

      <div class="vs-modal-body">
        <ul class="vs-modal-checklist">
          <li class="will-delete"><span class="check-icon">✕</span> Database (settings, conversations, revisions)</li>
          <li class="will-delete"><span class="check-icon">✕</span> Your account, API keys, and config</li>
          <li class="will-delete"><span class="check-icon">✕</span> All uploaded images, files, and fonts</li>
          <li class="will-delete"><span class="check-icon">✕</span> All generated pages, styles, and scripts</li>
          <li class="will-delete"><span class="check-icon">✕</span> Snapshots and backups</li>
        </ul>

        <label class="vs-modal-confirm-label">
          Type <code>RESET INSTALLATION</code> to confirm
        </label>
        <input
          type="text"
          id="reset-install-confirm-input"
          class="vs-modal-confirm-input"
          placeholder="Type RESET INSTALLATION here"
          autocomplete="off"
          spellcheck="false"
        />
      </div>

      <div class="vs-modal-footer">
        <button id="reset-install-cancel-btn" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
        <button id="reset-install-confirm-btn" class="vs-btn vs-btn-confirm-danger vs-btn-sm" style="position: relative; overflow: hidden;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Erase Everything
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('is-visible');
    });
  });

  // Focus the input after animation
  setTimeout(() => {
    document.getElementById('reset-install-confirm-input')?.focus();
  }, 350);

  // ── Bind modal events ──
  const confirmInput = document.getElementById('reset-install-confirm-input');
  const confirmBtn = document.getElementById('reset-install-confirm-btn');
  const cancelBtn = document.getElementById('reset-install-cancel-btn');
  const modal = document.getElementById('reset-install-modal');

  const CONFIRM_TEXT = 'RESET INSTALLATION';

  // Real-time input validation
  confirmInput?.addEventListener('input', () => {
    const isMatch = confirmInput.value.trim() === CONFIRM_TEXT;
    confirmBtn?.classList.toggle('is-enabled', isMatch);
    confirmInput.classList.toggle('is-matched', isMatch);
  });

  // Enter key to submit
  confirmInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (confirmInput.value.trim() === CONFIRM_TEXT) {
        executeResetInstall(overlay);
      } else {
        modal?.classList.add('shake');
        setTimeout(() => modal?.classList.remove('shake'), 400);
      }
    }
  });

  // Confirm button click
  confirmBtn?.addEventListener('click', () => {
    if (confirmInput?.value.trim() === CONFIRM_TEXT) {
      executeResetInstall(overlay);
    } else {
      modal?.classList.add('shake');
      setTimeout(() => modal?.classList.remove('shake'), 400);
    }
  });

  // Cancel button
  cancelBtn?.addEventListener('click', () => closeModal(overlay));

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay);
  });

  // Escape key to close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal(overlay);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Execute the factory reset — delete everything and redirect to installer.
 */
async function executeResetInstall(overlay) {
  const confirmBtn = document.getElementById('reset-install-confirm-btn');
  const confirmInput = document.getElementById('reset-install-confirm-input');

  if (!confirmBtn) return;

  // Loading state
  confirmBtn.classList.add('is-loading');
  confirmBtn.classList.remove('is-enabled');
  confirmBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Erasing…
  `;
  if (confirmInput) confirmInput.disabled = true;

  try {
    const { ok, data, error } = await api.post('/site/reset-install', { confirm: 'RESET INSTALLATION' });

    if (ok) {
      // Success — show confirmation then redirect to installer
      confirmBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `;
      confirmBtn.style.background = 'var(--vs-success)';
      confirmBtn.style.opacity = '1';

      // Full page redirect to the installer
      setTimeout(() => {
        window.location.href = data?.redirect || '/_studio/install.php';
      }, 800);
    } else {
      // Error — restore button
      confirmBtn.classList.remove('is-loading');
      confirmBtn.classList.add('is-enabled');
      confirmBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Erase Everything
      `;
      if (confirmInput) confirmInput.disabled = false;

      const desc = overlay.querySelector('.vs-modal-desc');
      if (desc) {
        const originalHTML = desc.innerHTML;
        desc.textContent = error?.message || 'Reset failed. Please try again.';
        desc.style.color = 'var(--vs-error)';
        setTimeout(() => {
          desc.innerHTML = originalHTML;
          desc.style.color = '';
        }, 4000);
      }
    }
  } catch (err) {
    confirmBtn.classList.remove('is-loading');
    confirmBtn.classList.add('is-enabled');
    confirmBtn.textContent = 'Erase Everything';
    if (confirmInput) confirmInput.disabled = false;
  }
}

/**
 * Show a warning modal that there are unsaved changes.
 * Returns a Promise that resolves to true if changes should be discarded (proceed), false if user cancelled.
 */
function confirmUnsavedChanges() {
  return new Promise((resolve) => {
    const existing = document.getElementById('unsaved-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'unsaved-modal-overlay';
    overlay.className = 'vs-modal-overlay';
    overlay.innerHTML = `
      <div class="vs-modal" id="unsaved-modal">
        <div class="vs-modal-header">
          <div class="vs-modal-icon vs-modal-icon-warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h2 class="vs-modal-title">Unsaved Changes</h2>
          <p class="vs-modal-desc">You have unsaved changes in the Code Editor. If you leave now, these changes will be permanently lost.</p>
        </div>
        <div class="vs-modal-body" style="padding-top: 12px; padding-bottom: 24px;"></div>
        <div class="vs-modal-footer">
          <button id="unsaved-cancel-btn" class="vs-btn vs-btn-secondary vs-btn-sm">Stay to Save</button>
          <button id="unsaved-discard-btn" class="vs-btn vs-btn-primary vs-btn-sm" style="background: var(--vs-error); border-color: var(--vs-error);">Discard Changes</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.offsetHeight; // reflow
    overlay.classList.add('is-visible');

    const close = (result) => {
      document.removeEventListener('keydown', handleEscape, { capture: true });
      overlay.classList.remove('is-visible');
      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 300);
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close(false);
      }
    };

    // Use capture phase so we intercept it before Command Palette or Visual Editor
    document.addEventListener('keydown', handleEscape, { capture: true });

    document.getElementById('unsaved-cancel-btn').addEventListener('click', () => close(false));
    document.getElementById('unsaved-discard-btn').addEventListener('click', () => close(true));
  });
}

/**
 * Show the reset confirmation modal with type-to-confirm UX.
 */
function showResetModal() {
  // Remove any existing modal
  const existing = document.getElementById('reset-modal-overlay');
  if (existing) existing.remove();

  // Create the modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'reset-modal-overlay';
  overlay.className = 'vs-modal-overlay';
  overlay.innerHTML = `
    <div class="vs-modal" id="reset-modal">
      <div class="vs-modal-header">
        <div class="vs-modal-icon vs-modal-icon-danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </div>
        <h2 class="vs-modal-title">Reset Website</h2>
        <p class="vs-modal-desc">This will permanently remove your generated website and all associated data. This action cannot be undone.</p>
      </div>

      <div class="vs-modal-body">
        <ul class="vs-modal-checklist">
          <li class="will-delete"><span class="check-icon">✕</span> All generated pages and partials</li>
          <li class="will-delete"><span class="check-icon">✕</span> CSS styles, Tailwind output, and JavaScript</li>
          <li class="will-delete"><span class="check-icon">✕</span> Conversation history and AI logs</li>
          <li class="will-delete"><span class="check-icon">✕</span> All revisions (undo history)</li>
          <li class="will-keep"><span class="check-icon">✓</span> Settings, API keys, and account</li>
          <li class="will-keep"><span class="check-icon">✓</span> Uploaded images and files</li>
        </ul>

        <label class="vs-modal-confirm-label">
          Type <code>RESET</code> to confirm
        </label>
        <input
          type="text"
          id="reset-confirm-input"
          class="vs-modal-confirm-input"
          placeholder="Type RESET here"
          autocomplete="off"
          spellcheck="false"
        />
      </div>

      <div class="vs-modal-footer">
        <button id="reset-cancel-btn" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
        <button id="reset-confirm-btn" class="vs-btn vs-btn-confirm-danger vs-btn-sm" style="position: relative; overflow: hidden;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Reset Everything
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('is-visible');
    });
  });

  // Focus the input after animation
  setTimeout(() => {
    document.getElementById('reset-confirm-input')?.focus();
  }, 350);

  // ── Bind modal events ──
  const confirmInput = document.getElementById('reset-confirm-input');
  const confirmBtn = document.getElementById('reset-confirm-btn');
  const cancelBtn = document.getElementById('reset-cancel-btn');
  const modal = document.getElementById('reset-modal');

  // Real-time input validation
  confirmInput?.addEventListener('input', () => {
    const isMatch = confirmInput.value.trim() === 'RESET';
    confirmBtn?.classList.toggle('is-enabled', isMatch);
    confirmInput.classList.toggle('is-matched', isMatch);
  });

  // Enter key to submit
  confirmInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (confirmInput.value.trim() === 'RESET') {
        executeReset(overlay);
      } else {
        // Shake the modal to indicate wrong input
        modal?.classList.add('shake');
        setTimeout(() => modal?.classList.remove('shake'), 400);
      }
    }
  });

  // Confirm button click
  confirmBtn?.addEventListener('click', () => {
    if (confirmInput?.value.trim() === 'RESET') {
      executeReset(overlay);
    } else {
      modal?.classList.add('shake');
      setTimeout(() => modal?.classList.remove('shake'), 400);
    }
  });

  // Cancel button
  cancelBtn?.addEventListener('click', () => closeModal(overlay));

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay);
  });

  // Escape key to close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal(overlay);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

async function executeReset(overlay) {
  const confirmBtn = document.getElementById('reset-confirm-btn');
  const confirmInput = document.getElementById('reset-confirm-input');

  if (!confirmBtn) return;

  // Loading state
  confirmBtn.classList.add('is-loading');
  confirmBtn.classList.remove('is-enabled');
  confirmBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Resetting…
  `;
  if (confirmInput) confirmInput.disabled = true;

  try {
    const { ok, data, error } = await api.post('/site/reset', { confirm: 'RESET' });

    if (ok) {
      // Clear in-memory state so the chat shows "no site" empty state
      store.set('pages', []);
      store.set('hasFormSchemas', false);
      store.set('conversations', null);
      store.set('activeConversationId', null);
      // Clear persisted conversation ID from localStorage
      try { localStorage.removeItem('vs-active-conversation'); } catch (_) {}

      // Reset publish state so footer doesn't show stale "unpublished changes"
      if (window.__vsPublishState) {
        window.__vsPublishState.hasChanges = false;
        window.__vsPublishState.counts = { added: 0, modified: 0, deleted: 0 };
        window.__vsPublishState.error = null;
      }
      window.applyPublishStateUi?.();
      // Refresh from server asynchronously
      window.refreshPublishState?.({ silent: true });

      // Success — show brief confirmation, then redirect
      confirmBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `;
      confirmBtn.style.background = 'var(--vs-success)';
      confirmBtn.style.opacity = '1';

      // Close and redirect after brief pause
      setTimeout(() => {
        closeModal(overlay);
        // Navigate to chat — the user will see a blank state ready for create_site
        if (window.location.hash !== '#/chat') {
          router.navigate('chat');
        } else {
          router.refresh();
        }
      }, 800);
    } else {
      // Error — restore button
      confirmBtn.classList.remove('is-loading');
      confirmBtn.classList.add('is-enabled');
      confirmBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Everything
      `;
      if (confirmInput) confirmInput.disabled = false;

      // Show error briefly
      const desc = overlay.querySelector('.vs-modal-desc');
      if (desc) {
        const originalText = desc.textContent;
        desc.textContent = error?.message || 'Reset failed. Please try again.';
        desc.style.color = 'var(--vs-error)';
        setTimeout(() => {
          desc.textContent = originalText;
          desc.style.color = '';
        }, 4000);
      }
    }
  } catch (err) {
    confirmBtn.classList.remove('is-loading');
    confirmBtn.classList.add('is-enabled');
    confirmBtn.textContent = 'Reset Everything';
    if (confirmInput) confirmInput.disabled = false;
  }
}

/**
 * Fetch models using the stored API key, then populate the dropdown.
 */
async function autoLoadModels(savedModel) {
  const modelSelect = document.getElementById('set-ai-model');
  if (!modelSelect) return;

  try {
    const { ok, data } = await api.get('/settings/models');

    if (ok && data?.models?.length) {
      modelSelect.innerHTML = data.models.map(m =>
        `<option value="${escapeHtml(m.id)}" ${m.id === savedModel ? 'selected' : ''}>${escapeHtml(m.name || m.id)}</option>`
      ).join('');
    } else {
      modelSelect.innerHTML = '<option value="">Test your connection to load available models</option>';
    }
  } catch {
    modelSelect.innerHTML = '<option value="">Test your connection to load available models</option>';
  }
}

function renderSysRow(label, value) {
  return `
    <div class="vs-sys-item">
      <span class="vs-sys-label">${label}</span>
      <span class="vs-sys-value">${value}</span>
    </div>
  `;
}

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '?';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

function bindSettingsEvents(currentSettings, providers) {
  let selectedProvider = currentSettings.ai_provider || 'claude';

  // Provider change — reload the page to refresh config fields
  const providerSelect = document.getElementById('set-ai-provider');
  if (providerSelect) {
    providerSelect.addEventListener('change', async (e) => {
      if (window.demoGuard?.()) { e.target.value = selectedProvider; return; }
      selectedProvider = e.target.value;
      // Save the provider change immediately, then reload settings
      await api.put('/settings', { ai_provider: selectedProvider });
      loadSettings();
    });
  }

  // Test API connection — also fetches live models
  const testBtn = document.getElementById('btn-test-api');
  const apiKeyInput = document.getElementById('set-api-key');

  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      if (window.demoGuard?.()) return;
      const key = apiKeyInput?.value?.trim() || '';
      const baseUrl = document.getElementById('set-base-url')?.value?.trim() || '';

      // For non-compatible providers, require a real key
      if (selectedProvider !== 'openai_compatible' && (!key || key.startsWith('••'))) {
        showApiStatus('Enter a new API key to test.', 'warning');
        return;
      }

      testBtn.textContent = 'Testing...';
      testBtn.disabled = true;

      const { ok, data, error } = await api.post('/settings/test-api', {
        provider: selectedProvider,
        api_key: key.startsWith('••') ? '' : key,
        base_url: baseUrl,
      });

      testBtn.textContent = 'Test Connection';
      testBtn.disabled = false;

      if (ok) {
        showApiStatus('✓ Connected successfully!', 'success');
        // Update model dropdown with live models
        if (data?.models?.length) {
          const modelSelect = document.getElementById('set-ai-model');
          if (modelSelect) {
            const currentModel = currentSettings[`ai_${selectedProvider}_model`] || '';
            modelSelect.innerHTML = data.models.map(m =>
              `<option value="${escapeHtml(m.id)}" ${m.id === currentModel ? 'selected' : ''}>${escapeHtml(m.name || m.id)}</option>`
            ).join('');
          }
        }
      } else {
        showApiStatus('✗ ' + (error?.message || 'Connection failed.'), 'error');
      }
    });
  }

  // Save Site Identity
  const identityBtn = document.getElementById('btn-save-identity');
  const identityStatus = document.getElementById('save-identity-status');

  if (identityBtn) {
    identityBtn.addEventListener('click', async () => {
      if (window.demoGuard?.()) return;
      identityBtn.textContent = 'Saving...';
      identityBtn.disabled = true;

      const updates = {
        site_name: document.getElementById('set-site-name')?.value?.trim() || '',
        site_tagline: document.getElementById('set-site-tagline')?.value?.trim() || '',
      };

      const { ok, error } = await api.put('/settings', updates);

      identityBtn.textContent = 'Save Identity';
      identityBtn.disabled = false;

      if (identityStatus) {
        identityStatus.classList.remove('hidden');
        if (ok) {
          identityStatus.textContent = '✓ Saved';
          identityStatus.className = 'text-xs text-vs-success ml-3';
          // Update topbar site name and document title
          store.set('siteName', updates.site_name);
          document.title = updates.site_name ? `Studio — ${updates.site_name}` : 'Studio — VoxelSite';
          // Refresh the topbar text in-place (no full re-render needed)
          const logoText = document.querySelector('.vs-logo-text');
          if (logoText) logoText.textContent = updates.site_name || 'VoxelSite';
        } else {
          identityStatus.textContent = '✗ ' + (error?.message || 'Failed to save.');
          identityStatus.className = 'text-xs text-vs-error ml-3';
        }
        setTimeout(() => identityStatus?.classList.add('hidden'), 3000);
      }
    });
  }

  // Save AI Provider settings
  const saveBtn = document.getElementById('btn-save-settings');
  const saveStatus = document.getElementById('save-status');

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (window.demoGuard?.()) return;
      saveBtn.textContent = 'Saving...';
      saveBtn.disabled = true;

      const updates = {
        ai_provider: selectedProvider,
        [`ai_${selectedProvider}_model`]: document.getElementById('set-ai-model')?.value || '',
        ai_max_tokens: parseInt(document.getElementById('set-max-tokens')?.value || '32000', 10),
        evaluator_enabled: document.getElementById('set-evaluator-enabled')?.checked ? 1 : 0,
        design_review_enabled: document.getElementById('set-design-review-enabled')?.checked ? 1 : 0,
      };

      // Base URL for OpenAI Compatible
      const baseUrlInput = document.getElementById('set-base-url');
      if (baseUrlInput) {
        updates.ai_openai_compatible_base_url = baseUrlInput.value.trim();
      }

      // Only send API key if it was changed (not the masked value)
      const apiKey = apiKeyInput?.value?.trim();
      if (apiKey && !apiKey.startsWith('••')) {
        updates[`ai_${selectedProvider}_api_key`] = apiKey;
      }

      const { ok, error } = await api.put('/settings', updates);

      saveBtn.textContent = 'Save Settings';
      saveBtn.disabled = false;

      if (saveStatus) {
        saveStatus.classList.remove('hidden');
        if (ok) {
          saveStatus.textContent = '✓ Saved';
          saveStatus.className = 'text-xs text-vs-success ml-3';
        } else {
          saveStatus.textContent = '✗ ' + (error?.message || 'Failed to save.');
          saveStatus.className = 'text-xs text-vs-error ml-3';
        }
        setTimeout(() => saveStatus?.classList.add('hidden'), 3000);
      }
    });
  }

  // Toggle switch animation (expert review, design review)
  ['set-evaluator-enabled', 'set-design-review-enabled'].forEach((id) => {
    const toggle = document.getElementById(id);
    if (!toggle) return;
    const label = toggle.closest('label') || toggle.parentElement;
    const track = label?.querySelector('.vs-toggle-track');
    const thumb = label?.querySelector('.vs-toggle-thumb');
    toggle.addEventListener('change', () => {
      if (track) track.style.background = toggle.checked ? 'var(--vs-accent)' : 'var(--vs-border-medium, #ccc)';
      if (thumb) thumb.style.left = toggle.checked ? '18px' : '2px';
    });
  });
}

// ─── Email Settings Events ────────────────────

function bindEmailSettingsEvents(mailConfig, presets) {
  const driverSelect = document.getElementById('set-mail-driver');
  const smtpFields = document.getElementById('mail-smtp-fields');
  const mailpitFields = document.getElementById('mail-mailpit-fields');
  const presetSelect = document.getElementById('set-smtp-preset');
  const presetHelp = document.getElementById('smtp-preset-help');

  // Try to detect which preset matches current config
  function detectPreset() {
    if (!mailConfig.smtp_host) return 'gmail';
    for (const [key, p] of Object.entries(presets)) {
      if (p.host && p.host === mailConfig.smtp_host) return key;
    }
    return 'custom';
  }

  // Set initial preset selection
  if (presetSelect) {
    const detected = detectPreset();
    presetSelect.value = detected;
    if (presetHelp && presets[detected]?.help) {
      presetHelp.textContent = presets[detected].help;
    }
  }

  // Driver change — toggle field visibility
  if (driverSelect) {
    driverSelect.addEventListener('change', () => {
      const driver = driverSelect.value;
      if (smtpFields) smtpFields.style.display = driver === 'smtp' ? 'block' : 'none';
      if (mailpitFields) mailpitFields.style.display = driver === 'mailpit' ? 'block' : 'none';
      const commonFields = document.getElementById('mail-common-fields');
      if (commonFields) commonFields.style.display = driver === 'none' ? 'none' : 'block';
    });
  }

  // Preset change — auto-fill SMTP fields
  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const preset = presets[presetSelect.value];
      if (!preset) return;

      const hostInput = document.getElementById('set-smtp-host');
      const portInput = document.getElementById('set-smtp-port');
      const encInput = document.getElementById('set-smtp-encryption');

      if (hostInput) hostInput.value = preset.host || '';
      if (portInput) portInput.value = preset.port || 587;
      if (encInput) encInput.value = preset.encryption || 'tls';
      if (presetHelp) presetHelp.textContent = preset.help || '';
    });
  }

  // Password visibility toggle
  const togglePassBtn = document.getElementById('btn-toggle-smtp-pass');
  const passInput = document.getElementById('set-smtp-password');
  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPassword = passInput.type === 'password';
      passInput.type = isPassword ? 'text' : 'password';
      togglePassBtn.innerHTML = isPassword
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    });
  }

  // Test email
  const testBtn = document.getElementById('btn-mail-test');
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      if (window.demoGuard?.()) return;
      const recipient = document.getElementById('set-mail-test-recipient')?.value?.trim();
      if (!recipient) {
        showMailTestStatus('Enter an email address to send the test to.', 'warning');
        return;
      }

      testBtn.textContent = 'Sending...';
      testBtn.disabled = true;

      const formData = collectMailFormData();
      formData.test_recipient = recipient;

      const { ok, data, error } = await api.post('/settings/mail/test', formData);

      testBtn.textContent = 'Send Test';
      testBtn.disabled = false;

      if (ok) {
        showMailTestStatus('✓ ' + (data?.message || 'Test email sent successfully!'), 'success');
      } else {
        showMailTestStatus('✗ ' + (error?.message || 'Test failed.'), 'error');
      }
    });
  }

  // Save email settings
  const saveMailBtn = document.getElementById('btn-save-mail');
  const saveMailStatus = document.getElementById('save-mail-status');

  if (saveMailBtn) {
    saveMailBtn.addEventListener('click', async () => {
      if (window.demoGuard?.()) return;
      saveMailBtn.textContent = 'Saving...';
      saveMailBtn.disabled = true;

      const formData = collectMailFormData();

      const { ok, error } = await api.post('/settings/mail', formData);

      saveMailBtn.textContent = 'Save Email Settings';
      saveMailBtn.disabled = false;

      if (saveMailStatus) {
        saveMailStatus.classList.remove('hidden');
        if (ok) {
          saveMailStatus.textContent = '✓ Saved';
          saveMailStatus.className = 'text-xs text-vs-success ml-3';
        } else {
          saveMailStatus.textContent = '✗ ' + (error?.message || 'Failed to save.');
          saveMailStatus.className = 'text-xs text-vs-error ml-3';
        }
        setTimeout(() => saveMailStatus?.classList.add('hidden'), 3000);
      }
    });
  }
}

function collectMailFormData() {
  const password = document.getElementById('set-smtp-password')?.value || '';
  return {
    driver: document.getElementById('set-mail-driver')?.value || 'none',
    from_address: document.getElementById('set-mail-from-address')?.value?.trim() || '',
    from_name: document.getElementById('set-mail-from-name')?.value?.trim() || '',
    smtp_host: document.getElementById('set-smtp-host')?.value?.trim() || '',
    smtp_port: parseInt(document.getElementById('set-smtp-port')?.value || '587', 10),
    smtp_username: document.getElementById('set-smtp-username')?.value?.trim() || '',
    smtp_password: password.startsWith('••') ? '' : password,
    smtp_encryption: document.getElementById('set-smtp-encryption')?.value || 'tls',
    mailpit_host: document.getElementById('set-mailpit-host')?.value?.trim() || 'localhost',
    mailpit_port: parseInt(document.getElementById('set-mailpit-port')?.value || '1025', 10),
  };
}

function showMailTestStatus(message, type) {
  const el = document.getElementById('mail-test-status');
  if (!el) return;
  el.classList.remove('hidden');
  el.textContent = message;
  el.className = `text-xs mt-1.5 ${
    type === 'success' ? 'text-vs-success' :
    type === 'error' ? 'text-vs-error' :
    'text-vs-warning'
  }`;
}

function showApiStatus(message, type) {
  const el = document.getElementById('api-key-status');
  if (!el) return;
  el.classList.remove('hidden');
  el.textContent = message;
  el.className = `text-xs mt-1.5 ${
    type === 'success' ? 'text-vs-success' :
    type === 'error' ? 'text-vs-error' :
    'text-vs-warning'
  }`;
}


// ═══════════════════════════════════════════
//  API Access Section
// ═══════════════════════════════════════════

function bindApiAccessEvents(s) {
  const enableToggle = document.getElementById('set-api-enabled');
  const bodyEl = document.getElementById('api-access-body');
  const saveBtn = document.getElementById('btn-save-api-settings');
  const generateBtn = document.getElementById('btn-generate-api-key');

  // Toggle enable/disable
  if (enableToggle) {
    enableToggle.addEventListener('change', () => {
      const isOn = enableToggle.checked;
      const track = enableToggle.parentElement.querySelector('.vs-toggle-track');
      const thumb = enableToggle.parentElement.querySelector('.vs-toggle-thumb');
      if (track) track.style.background = isOn ? 'var(--vs-accent)' : 'var(--vs-border-medium, #ccc)';
      if (thumb) thumb.style.left = isOn ? '18px' : '2px';
      if (bodyEl) {
        bodyEl.style.opacity = isOn ? '' : '0.4';
        bodyEl.style.pointerEvents = isOn ? '' : 'none';
      }
    });
  }

  // Save API settings
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (window.demoGuard?.()) return;
      const statusEl = document.getElementById('save-api-status');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      const payload = {
        agent_api_enabled: document.getElementById('set-api-enabled')?.checked || false,
        agent_api_allowed_origins: document.getElementById('set-api-origins')?.value?.trim() || '*',
      };

      const res = await api.put('/settings', payload);
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save API Settings';

      if (res.ok) {
        showToast('API settings saved', 'success');
        if (statusEl) {
          statusEl.textContent = 'Saved';
          statusEl.className = 'text-xs text-vs-success';
          statusEl.classList.remove('hidden');
          setTimeout(() => statusEl.classList.add('hidden'), 2000);
        }
      } else {
        showToast(res.error?.message || 'Failed to save', 'error');
      }
    });
  }

  // Load API keys
  loadApiKeys();

  // Generate key button
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      if (window.demoGuard?.()) return;
      showGenerateKeyModal();
    });
  }
}
// Role default scopes — must match AgentAuth::ROLE_DEFAULTS in AgentAuth.php.
// Used by the key generation modal to construct the scopes array when the
// user opts in to optional capabilities like prompt:execute.
const AgentAuth_ROLE_DEFAULTS = {
  owner:  ['pages:read', 'pages:write', 'settings:read', 'settings:write', 'compile:trigger', 'publish:trigger', 'submissions:read', 'assets:read', 'assets:write', 'tools:invoke'],
  editor: ['pages:read', 'pages:write', 'compile:trigger', 'submissions:read', 'assets:read', 'assets:write', 'tools:invoke'],
  agent:  ['pages:read', 'pages:write', 'settings:read', 'compile:trigger', 'publish:trigger', 'submissions:read', 'assets:read', 'assets:write', 'tools:invoke'],
  viewer: ['pages:read', 'settings:read', 'submissions:read', 'assets:read'],
};

// Opt-in scope eligibility — must match AgentAuth::OPT_IN_SCOPES in AgentAuth.php.
// Maps each opt-in scope to the roles that may receive it. Viewer is excluded from
// prompt:execute because the PromptEngine has full workspace write access.
const AgentAuth_OPT_IN_ELIGIBLE = {
  'prompt:execute': ['owner', 'editor', 'agent'],
};

async function loadApiKeys() {
  const container = document.getElementById('api-keys-list');
  if (!container) return;

  try {
    const res = await api.get('/settings/api-keys');
    const keys = res.data?.keys || [];

    if (keys.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px 16px; color: var(--vs-text-ghost);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 8px; opacity: 0.35;">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <rect x="10" y="10" width="4" height="5" rx="1"/>
            <circle cx="12" cy="9" r="1.5"/>
          </svg>
          <p style="font-size: 13px; margin: 0 0 4px; font-weight: 500;">No API keys yet</p>
          <p style="font-size: 11px; margin: 0;">Generate a key to let external applications manage your site.</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${keys.map(k => {
          const lastUsed = k.last_used_at ? new Date(k.last_used_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never';
          const created = new Date(k.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const roleColors = { agent: 'var(--vs-accent)', editor: '#3b82f6', viewer: 'var(--vs-text-ghost)', owner: '#8b5cf6' };
          const roleColor = roleColors[k.role] || 'var(--vs-text-ghost)';
          const scopes = Array.isArray(k.scopes) ? k.scopes : (typeof k.scopes === 'string' ? JSON.parse(k.scopes || '[]') : []);
          const hasPrompt = scopes.includes('prompt:execute');
          return `
            <div class="vs-api-key-row" style="display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-lg); background: var(--vs-bg-base); transition: border-color 0.15s ease, box-shadow 0.2s ease;">
              <div style="width: 36px; height: 36px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: color-mix(in srgb, ${roleColor} 10%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, ${roleColor} 18%, transparent);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${roleColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.01em;">${escapeHtml(k.label || 'Unnamed')}</span>
                  <span style="font-size: 10px; font-weight: 600; padding: 1px 7px; border-radius: var(--radius-full); color: ${roleColor}; background: color-mix(in srgb, ${roleColor} 10%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, ${roleColor} 20%, transparent); text-transform: capitalize;">${escapeHtml(k.role || 'agent')}</span>
                  ${hasPrompt ? '<span style="font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: var(--radius-full); color: var(--vs-accent); background: color-mix(in srgb, var(--vs-accent) 8%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, var(--vs-accent) 20%, transparent); letter-spacing: 0.5px;">AI</span>' : ''}
                </div>
                <div style="font-size: 11px; color: var(--vs-text-ghost); display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <code style="font-size: 10px; font-family: var(--font-mono); background: var(--vs-bg-inset); padding: 1px 5px; border-radius: var(--radius-xs); border: 1px solid var(--vs-border-subtle);">${escapeHtml(k.key_prefix || '???')}…</code>
                  <span>Created ${created}</span>
                  <span>· Last used: ${lastUsed}</span>
                </div>
              </div>
              <button class="vs-btn vs-btn-ghost vs-btn-xs btn-revoke-key" data-id="${k.id}" style="color: var(--vs-text-ghost); white-space: nowrap; flex-shrink: 0;" title="Revoke">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Revoke
              </button>
            </div>`;
        }).join('')}
      </div>`;

    // Bind revoke buttons
    container.querySelectorAll('.btn-revoke-key').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (window.demoGuard?.()) return;
        const keyId = btn.dataset.id;
        if (btn.dataset.confirm !== 'true') {
          btn.dataset.confirm = 'true';
          btn.innerHTML = '<span style="font-size: 11px; color: var(--vs-error);">Sure?</span>';
          setTimeout(() => {
            if (btn.dataset.confirm === 'true') {
              btn.dataset.confirm = '';
              btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Revoke';
            }
          }, 3000);
          return;
        }
        const row = btn.closest('.vs-api-key-row');
        if (row) row.style.opacity = '0.4';
        await api.delete(`/settings/api-keys/${keyId}`);
        showToast('API key revoked', 'success');
        loadApiKeys();
      });
    });
  } catch (e) {
    container.innerHTML = '<div style="font-size: 12px; color: var(--vs-text-ghost); text-align: center; padding: 16px 0;">Could not load API keys.</div>';
  }
}

function showGenerateKeyModal() {
  const existing = document.getElementById('generate-key-modal');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'vs-modal-overlay';
  backdrop.id = 'generate-key-modal';
  backdrop.innerHTML = `
    <div class="vs-modal" style="max-width: 440px;">
      <div class="vs-modal-header">
        <h3 class="vs-modal-title">Generate API Key</h3>
        <p class="vs-modal-desc">Create a key to let external tools and AI agents manage your site programmatically.</p>
      </div>
      <div class="vs-modal-body">
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label for="gen-key-label" style="display: block; font-size: 13px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;">Label</label>
            <input id="gen-key-label" type="text" class="vs-input" placeholder="e.g. My Website Automation" autofocus />
          </div>
          <div>
            <label for="gen-key-role" style="display: block; font-size: 13px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;">Role</label>
            <select id="gen-key-role" class="vs-input">
              <option value="agent" selected>Agent — full access (pages, assets, publish, tools)</option>
              <option value="editor">Editor — pages, assets, & tools (no publish or settings)</option>
              <option value="viewer">Viewer — read-only access</option>
            </select>
          </div>
          <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 14px; margin-top: 2px;">
            <div style="font-size: 11px; font-weight: 600; color: var(--vs-text-ghost); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">Optional capabilities</div>
            <label id="gen-key-prompt-toggle" class="vs-checkbox-label" style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--vs-border-subtle); background: var(--vs-bg-base); transition: border-color 0.15s ease, background 0.15s ease; position: relative;">
              <input type="checkbox" id="gen-key-prompt-execute" class="vs-checkbox" />
              <span class="vs-checkbox-box" style="margin-top: 1px;"></span>
              <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0;">
                <span style="font-size: 13px; font-weight: 500; color: var(--vs-text-primary);">AI Prompt Execution</span>
                <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.4;">Allow this key to run AI prompts that can create pages, edit content, and modify your site. Requires exec() on the server.</span>
              </div>
            </label>
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="cancel-generate-key">Cancel</button>
        <button class="vs-btn vs-btn-primary vs-btn-sm" id="confirm-generate-key">Generate</button>
      </div>
    </div>`;

  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('is-visible'));

  const close = () => closeModal(backdrop);

  // Escape key to dismiss
  const onKeydown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
  };
  document.addEventListener('keydown', onKeydown);

  // Clean up keydown listener when the overlay is removed
  const observer = new MutationObserver(() => {
    if (!document.body.contains(backdrop)) {
      document.removeEventListener('keydown', onKeydown);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true });

  onBackdropClick(backdrop, close);
  backdrop.querySelector('#cancel-generate-key').addEventListener('click', close);

  // Enter key in label input submits
  const labelInput = backdrop.querySelector('#gen-key-label');
  labelInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      backdrop.querySelector('#confirm-generate-key')?.click();
    }
  });

  // Interactive highlight on the prompt toggle container
  const promptToggle = backdrop.querySelector('#gen-key-prompt-execute');
  const promptLabel = backdrop.querySelector('#gen-key-prompt-toggle');
  const promptCheckbox = promptToggle;
  const promptDesc = promptLabel?.querySelector('span[style*="font-size: 11px"]');

  // Disable prompt:execute for roles that aren't eligible (e.g. viewer)
  const updatePromptEligibility = (role) => {
    const eligible = (AgentAuth_OPT_IN_ELIGIBLE['prompt:execute'] || []).includes(role);
    if (!eligible) {
      promptCheckbox.checked = false;
      promptCheckbox.disabled = true;
      promptLabel.style.opacity = '0.45';
      promptLabel.style.cursor = 'not-allowed';
      promptLabel.style.borderColor = 'var(--vs-border-subtle)';
      promptLabel.style.background = 'var(--vs-bg-base)';
      if (promptDesc) promptDesc.textContent = 'Not available for read-only roles. Prompt execution requires write access.';
    } else {
      promptCheckbox.disabled = false;
      promptLabel.style.opacity = '1';
      promptLabel.style.cursor = 'pointer';
      if (promptDesc) promptDesc.textContent = 'Allow this key to run AI prompts that can create pages, edit content, and modify your site. Requires exec() on the server.';
    }
  };

  // Listen for role changes
  const roleSelect = backdrop.querySelector('#gen-key-role');
  roleSelect?.addEventListener('change', () => updatePromptEligibility(roleSelect.value));
  // Set initial state
  updatePromptEligibility(roleSelect?.value || 'agent');

  promptToggle?.addEventListener('change', () => {
    if (promptToggle.checked) {
      promptLabel.style.borderColor = 'color-mix(in srgb, var(--vs-accent) 40%, transparent)';
      promptLabel.style.background = 'color-mix(in srgb, var(--vs-accent) 4%, var(--vs-bg-base))';
    } else {
      promptLabel.style.borderColor = 'var(--vs-border-subtle)';
      promptLabel.style.background = 'var(--vs-bg-base)';
    }
  });

  backdrop.querySelector('#confirm-generate-key').addEventListener('click', async () => {
    const label = document.getElementById('gen-key-label')?.value?.trim();
    const role = document.getElementById('gen-key-role')?.value || 'agent';
    const wantsPrompt = document.getElementById('gen-key-prompt-execute')?.checked;

    if (!label) {
      showToast('Please enter a label for the key', 'error');
      return;
    }

    const btn = backdrop.querySelector('#confirm-generate-key');
    btn.disabled = true;
    btn.textContent = 'Generating…';

    // Build the request body — only include scopes if the user opted in
    const body = { label, role };
    if (wantsPrompt) {
      body.scopes = [...(AgentAuth_ROLE_DEFAULTS[role] || AgentAuth_ROLE_DEFAULTS.agent), 'prompt:execute'];
    }

    const res = await api.post('/settings/api-keys', body);

    if (res.ok && res.data?.key) {
      close();
      showKeyRevealDialog(res.data.key, label);
      loadApiKeys();
    } else {
      btn.disabled = false;
      btn.textContent = 'Generate';
      showToast(res.error?.message || 'Failed to generate key', 'error');
    }
  });
}

function showKeyRevealDialog(plaintextKey, label) {
  const existing = document.getElementById('key-reveal-modal');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'vs-modal-overlay';
  backdrop.id = 'key-reveal-modal';
  backdrop.innerHTML = `
    <div class="vs-modal" style="max-width: 640px;">
      <div class="vs-modal-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, #22c55e 10%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, #22c55e 20%, transparent); flex-shrink: 0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <h3 class="vs-modal-title" style="margin: 0;">Key Generated</h3>
            <p class="vs-modal-desc" style="margin: 2px 0 0;">${escapeHtml(label)}</p>
          </div>
        </div>
      </div>
      <div class="vs-modal-body">
        <div style="position: relative; margin-bottom: 16px;">
          <input type="text" readonly value="${escapeHtml(plaintextKey)}" id="revealed-key-input" class="vs-input" style="width: 100%; font-family: var(--font-mono); font-size: 12.5px; padding-right: 44px; letter-spacing: 0.01em; color: var(--vs-text-primary);" />
          <button id="copy-api-key" type="button" title="Copy" style="position: absolute; right: 1px; top: 1px; bottom: 1px; width: 40px; display: flex; align-items: center; justify-content: center; background: var(--vs-bg-surface); border: none; border-left: 1px solid var(--vs-border-subtle); border-radius: 0 var(--radius-md) var(--radius-md) 0; cursor: pointer; color: var(--vs-text-ghost); transition: color 0.15s ease;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <div style="display: flex; gap: 10px; padding: 12px 14px; background: color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, var(--vs-accent) 15%, transparent); border-radius: var(--radius-md);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--vs-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div>
            <p style="font-size: 12px; color: var(--vs-text-secondary); margin: 0; font-weight: 500;">Store this key securely</p>
            <p style="font-size: 11px; color: var(--vs-text-ghost); margin: 3px 0 0; line-height: 1.45;">This key won\u2019t be shown again. If you lose it, revoke it and generate a new one.</p>
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button class="vs-btn vs-btn-primary vs-btn-sm" id="close-key-reveal">Done</button>
      </div>
    </div>`;

  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('is-visible'));

  const close = () => closeModal(backdrop);

  // Escape key to dismiss
  const onKeydown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
  };
  document.addEventListener('keydown', onKeydown);
  const observer = new MutationObserver(() => {
    if (!document.body.contains(backdrop)) {
      document.removeEventListener('keydown', onKeydown);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true });

  onBackdropClick(backdrop, close);
  backdrop.querySelector('#close-key-reveal').addEventListener('click', close);

  // Select key text on focus for easy manual copy
  const keyInput = backdrop.querySelector('#revealed-key-input');
  keyInput?.addEventListener('focus', () => keyInput.select());

  backdrop.querySelector('#copy-api-key').addEventListener('click', async () => {
    const copyBtn = backdrop.querySelector('#copy-api-key');
    try {
      await navigator.clipboard.writeText(plaintextKey);
      copyBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      copyBtn.style.color = '#22c55e';
      setTimeout(() => {
        copyBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
        copyBtn.style.color = '';
      }, 2000);
    } catch {
      // Fallback: select the text
      keyInput?.select();
    }
  });
}

export { renderSettingsView, loadSettings, confirmUnsavedChanges, bindSettingsEvents, bindEmailSettingsEvents, bindApiAccessEvents };
