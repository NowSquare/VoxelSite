import { escapeAttr as esc } from '../helpers.js';

const keyMask = '••••••••';
const providers = ['claude', 'openai', 'gemini', 'deepseek', 'openai_compatible'];
const providerLabels = { claude: 'Claude', openai: 'OpenAI', gemini: 'Gemini', deepseek: 'DeepSeek', openai_compatible: 'OpenAI-Compatible' };
const reasons = {
  governor_configuration: 'Routing needs a TypeSafe key. Default editing remains available.',
  forbidden_claims: 'The proposed claim is not supported by the known business facts.',
  gate_unavailable: 'The claim check was unavailable. No candidate was approved.',
  gate_invalid: 'The claim check returned an invalid result. No candidate was approved.',
  routing_unavailable: 'The routing check was unavailable.',
  routing_invalid: 'The routing check returned an invalid result.',
  routing_uncertain: 'The router could not choose confidently.',
  content_changed: 'The page changed during the request. Refresh before trying again.',
  invalid_target: 'Select one plain-text heading in a registered page.',
  missing_address: 'Select one plain-text heading in a registered page.',
  ambiguous_address: 'The selection matched more than one heading. Select a unique heading.',
  explicit_replacement_required: 'Provide the exact replacement heading.',
  repair_limit_exhausted: 'Two targeted repairs were used. Revise the request before starting a new edit.',
  prompt_injection: 'The request could expand the edit beyond its allowed scope.',
  ledger_unavailable: 'Call accounting was unavailable. Ask the owner to check the database.',
  generation_failed: 'Generation failed. Try the edit again.',
  generation_cancelled: 'The request was cancelled.',
  identical_candidate: 'The proposed heading was unchanged.',
  invalid_candidate: 'The proposed heading did not pass validation.',
  unsupported_action: 'This historical check did not support the requested action.',
  unsupported_route: 'This historical check did not support the requested action.',
  invalid_request: 'Use a text request of at most 4,000 characters.',
};

const routingReasons = {
  configuration_error: 'Add a TypeSafe key to enable routing.',
  classification_unavailable: 'The router was unavailable.', low_confidence: 'The router was unsure.',
  invalid_classification: 'The router returned an invalid choice.', unsafe_classification: 'The request needs default handling.',
  ambiguous_write: 'The request needs default handling.', request_too_large: 'The request needs full instructions.',
  routing_unavailable: 'The router was unavailable.', routing_invalid: 'The router returned an invalid choice.',
  routing_uncertain: 'The router was unsure.', model_map_missing: 'Choose both routing models.',
  model_map_invalid: 'Check your routing models.', model_map_mismatch: 'Models do not match your AI provider.',
  unsupported_action: 'This request uses its normal editing path.', ledger_unavailable: 'Routing could not be recorded.',
};
const workLabels = { edit_copy: 'Copy edit', edit_layout: 'Layout edit', add_page: 'New page', new_site: 'New site', theme: 'Design change', restyle: 'Restyle', question: 'Question', noop: 'No change' };

const recipeLabels = { create_site: 'Create site', import_site: 'Import site', restyle_site: 'Restyle site', edit_page: 'Edit page', change_design: 'Change design', add_page: 'Add page', optimize_aeo: 'Search visibility', section_edit: 'Edit section', add_section: 'Add section', inline_edit: 'Edit selection', free_prompt: 'General request', question: 'Answer question', noop: 'No change', replace_text: 'Exact replacement' };
const contextLabels = { legacy: 'Default', focused: 'Selected content', full: 'Full site context', readonly: 'Relevant site details' };

export function renderRouterActivity(activity) {
  if (!activity?.available) return '<p class="text-sm text-vs-warning" role="status">Recorded outcomes could not be loaded. Reload Settings to try again.</p>';
  if (!activity.items?.length) return '<p class="text-sm text-vs-text-secondary">No recorded requests yet.</p>';
  return `<ul class="flex flex-col gap-4">${activity.items.map(item => {
    if (item.kind === 'routing') {
      const outcome = item.status === 'preview' ? 'Preview: suggested choices only. Editing used defaults.'
        : item.status === 'routed' ? 'Automatic routing used.'
        : item.status === 'off' ? 'AI Router off. Default settings used.'
        : 'Default settings used. ' + (routingReasons[item.reason] || 'Routing was unavailable.');
      const actual = item.models?.length ? `Model: ${item.models.join(', ')}.` : 'No generation model recorded.';
      const proposal = item.status === 'preview' ? ` Suggested model: ${item.proposed_model || 'default'}.` : '';
      const detail = `${item.status === 'preview' ? 'Suggested work' : 'Work'}: ${workLabels[item.intent] || 'Default'}; instructions: ${recipeLabels[item.recipe] || 'Default'}; context: ${contextLabels[item.context] || 'Default'}.`;
      return `<li class="text-sm text-vs-text-secondary"><strong>Turn ${Number(item.id)}</strong><p>${esc(outcome)}</p><p class="text-xs mt-1">${esc(actual + proposal + ' ' + detail)}</p></li>`;
    }
    let outcome;
    if (item.mode === 'shadow') {
      outcome = `Historical preview; request ${item.status}. No edit check.`;
    } else if (item.status === 'applied') {
      outcome = item.reason === 'accepted_owner_override'
        ? 'This edit was applied with an owner override.' : 'Historical heading check: edit applied.';
    } else if (item.status === 'answered') outcome = 'Answered the question. No files changed.';
    else if (item.status === 'acknowledged') outcome = 'No changes requested. No files changed.';
    else outcome = 'This edit was not applied. ' + (reasons[item.reason] || 'The edit could not be completed safely.');
    const generation = item.generation_calls > 0
      ? `${item.generation_calls} recorded generation/repair call(s) via ${item.providers.join(', ')}.`
      : 'No generation calls recorded.';
    const route = item.mode === 'enforce' && item.intent !== 'unknown'
      ? `Route: ${item.intent}; requested tier: ${item.requested_tier}. ` : '';
    return `<li class="text-sm text-vs-text-secondary"><strong>Historical turn ${Number(item.id)}</strong><p>${esc(outcome)}</p><p class="text-xs mt-1">${esc(route + generation)}</p></li>`;
  }).join('')}</ul>`;
}

export function renderRouterSettings(settings, role, activity) {
  if (!settings) return '<section class="vs-settings-card"><h2 class="vs-settings-card-title">AI Router</h2><p class="text-sm text-vs-error" role="alert">AI Router settings could not be loaded. Reload Settings before making changes.</p></section>';
  const mode = settings['governor.mode'];
  const map = settings['governor.model_map'] || {};
  const error = settings['governor.configuration_error'];
  const provider = settings.ai_provider ?? 'claude';
  const hasMap = Object.keys(map).length > 0;
  const mapMatches = !hasMap || (Object.keys(map).length === 2 && ['cheap', 'frontier'].every(tier =>
    map[tier]?.provider === provider && typeof map[tier]?.model === 'string'));
  const mapError = settings['governor.model_map_error']?.message || (!mapMatches
    ? 'The saved models do not match this provider. Choose two models or clear them, then click Save AI Router.' : '');
  const owner = role === 'owner';
  const fields = ['cheap', 'frontier'].map(tier => `
    <div class="flex flex-col gap-2"><label for="governor-${tier}-model" class="block text-sm font-medium text-vs-text-secondary">${tier === 'cheap' ? 'Faster' : 'Stronger'} model</label>
      <select id="governor-${tier}-model" class="vs-input" disabled aria-describedby="governor-model-help governor-model-save-help governor-model-status">${governorModelOptions([], !mapError ? map[tier]?.model || '' : '', 'loading')}</select></div>`).join('');
  return `<section id="governor-settings" class="vs-settings-card" aria-labelledby="governor-title">
    <h2 id="governor-title" class="vs-settings-card-title">AI Router</h2>
    <p class="vs-settings-card-subtitle">Automatically selects the model and instructions for each request.</p>
    <p class="text-sm text-vs-text-secondary mb-4">Powered by TypeSafe’s Jev model. If routing is unavailable, editing uses your default settings.</p>
    <p class="text-sm text-vs-text-secondary mb-4">Saved setting: ${mode === 'off' ? 'Off' : 'On'}. TypeSafe key: ${settings['governor.typesafe_configured'] ? 'stored' : 'not stored'}.</p>
    ${mapError ? `<p class="text-sm text-vs-warning mb-4" role="alert">${esc(mapError)}</p>` : ''}
    ${error ? `<p class="text-sm text-vs-error mb-4" role="alert">${esc(error.message)}</p>` : ''}
    ${owner ? `<form id="governor-form" data-provider="${esc(provider)}" data-key-stored="${Boolean(settings['governor.typesafe_configured'])}" data-model-state="loading" data-map-mismatch="${Boolean(mapError)}" class="flex flex-col gap-6">
      <label class="flex min-h-11 items-center gap-3 cursor-pointer">
        <span class="relative inline-flex h-5 w-9 shrink-0">
          <input id="governor-enabled" type="checkbox" role="switch" class="peer sr-only" ${mode !== 'off' ? 'checked' : ''} aria-describedby="governor-enabled-help" />
          <span aria-hidden="true" class="vs-toggle-track absolute inset-0 rounded-full bg-vs-border-medium peer-checked:bg-vs-accent peer-focus-visible:outline-2 peer-focus-visible:outline-vs-accent peer-focus-visible:outline-offset-2"></span>
          <span aria-hidden="true" class="vs-toggle-thumb pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out peer-checked:translate-x-4 motion-reduce:transition-none"></span>
        </span>
        <span class="min-w-0"><span class="block text-sm font-medium text-vs-text-primary">Enable AI Router</span><span id="governor-enabled-help" class="block text-xs text-vs-text-secondary mt-1">Off uses your default model and instructions.</span></span>
      </label>
      <p class="text-sm text-vs-text-secondary">Save to apply your choice. All editing tools remain available.</p>
      <input id="governor-remove-key" type="checkbox" hidden />
      <div id="governor-key-controls"${mode === 'off' && !settings['governor.typesafe_configured'] ? ' hidden' : ''}><div class="flex flex-col gap-2"><label for="governor-key" class="block text-sm font-medium text-vs-text-secondary">TypeSafe key</label>
        <div class="flex flex-wrap items-center gap-2">
          <input id="governor-key" value="${settings['governor.typesafe_configured'] ? keyMask : ''}" type="password" autocomplete="new-password" class="vs-input flex-1 min-w-0" maxlength="4096" ${mode === 'off' ? 'disabled' : ''} aria-describedby="governor-key-help governor-key-removal-status governor-save-status" />
          ${settings['governor.typesafe_configured'] ? '<button id="governor-remove-key-button" type="button" class="vs-btn vs-btn-ghost vs-btn-sm">Remove key</button>' : ''}
        </div>
        <p id="governor-key-help" class="text-xs text-vs-text-secondary mt-1">${settings['governor.typesafe_configured'] ? (mode === 'off' ? 'Turn on AI Router to replace this key.' : 'Leave unchanged to keep your key. Enter a new key to replace it.') : 'Enter your TypeSafe key, then save.'}</p>
        <p id="governor-key-removal-status" class="text-sm text-vs-warning empty:hidden" role="status" aria-live="polite"></p>
        <a href="https://console.typesafe.ai/keys" target="_blank" rel="noopener noreferrer" class="text-xs text-vs-accent">Get a key in the TypeSafe console</a>
      </div></div>
      <div id="governor-model-controls"${mode === 'off' ? ' hidden' : ''}><fieldset class="min-w-0 flex flex-col gap-4"><legend class="text-sm font-medium text-vs-text-secondary mb-2">Models</legend>
        <p id="governor-model-help" class="text-sm text-vs-text-secondary">Use the faster model for small edits and the stronger model for larger changes.</p>
        <p id="governor-model-save-help" class="text-sm text-vs-text-secondary">Choose both models for ${esc(providerLabels[provider] || 'Unknown provider')}, then save. Leave both empty to use your default model.</p>
        ${fields}
        <p id="governor-model-status" class="text-xs text-vs-text-secondary" role="status" aria-live="polite">Loading models…</p>
        <button id="governor-clear-models" type="button" class="vs-btn vs-btn-secondary vs-btn-sm">Clear saved models</button>
      </fieldset></div>
      <p id="governor-save-status" class="text-sm text-vs-text-secondary empty:hidden" role="status" aria-live="polite"></p>
      <div class="vs-settings-card-footer"><button type="submit" class="vs-btn vs-btn-primary vs-btn-sm">Save AI Router</button></div>
    </form>` : '<p class="text-sm text-vs-text-secondary mb-4">Only the owner can change these settings.</p>'}
    <h3 class="text-sm font-medium mt-4 mb-4">Your recent requests</h3>
    ${renderRouterActivity(activity)}
  </section>`;
}

// Keep the selected ID even when the provider no longer lists it. Never pick
// the first result implicitly or turn a failed lookup into an empty saved map.
export function governorModelOptions(models, selected, state = 'ready') {
  const available = models.filter(model => typeof model?.id === 'string' && /^[a-zA-Z0-9_.:/+\-]{1,200}$/.test(model.id) && !model.id.includes('://'));
  // List APIs do not share a parent field. Recognize naming conventions,
  // never invent families for arbitrary OpenAI-compatible model IDs.
  const family = id => {
    const claude = id.match(/^claude-(?:\d+(?:-\d+)?-)?([a-z]+)(?:-|$)/i);
    if (claude) return `Claude ${claude[1][0].toUpperCase()}${claude[1].slice(1)}`;
    const gpt = id.match(/^(gpt-\d+(?:\.\d+)?[a-z]?)(?:-|$)/i);
    if (gpt) return gpt[1].toUpperCase();
    const reasoning = id.match(/^(o\d+)(?:-|$)/i);
    if (reasoning) return reasoning[1];
    const gemini = id.match(/^(gemini-\d+(?:\.\d+)?)(?:-|$)/i);
    if (gemini) return gemini[1].replace(/^gemini-/i, 'Gemini ');
    const deepseek = id.match(/^deepseek-(v\d+(?:\.\d+)?|r\d+)(?:-|$)/i);
    if (deepseek) return `DeepSeek ${deepseek[1].toUpperCase()}`;
    return 'Other models';
  };
  const modelDate = model => {
    const date = typeof model.created_at === 'string' && /^\d{4}-\d{2}-\d{2}(?:T|$)/.test(model.created_at)
      ? Date.parse(model.created_at) : NaN;
    return Number.isFinite(date) && date > 0 ? date : -Infinity;
  };
  const newestFirst = (a, b) => a === b ? 0 : a > b ? -1 : 1;
  const groups = new Map();
  for (const model of available) {
    const label = family(model.id);
    if (!groups.has(label)) groups.set(label, { label, date: -Infinity, models: [] });
    const group = groups.get(label);
    group.models.push(model);
    group.date = Math.max(group.date, modelDate(model));
  }
  const ordered = [...groups.values()].sort((a, b) => {
    if (a.label === 'Other models' || b.label === 'Other models') return a.label === b.label ? 0 : a.label === 'Other models' ? 1 : -1;
    const dated = newestFirst(a.date, b.date);
    if (dated) return dated;
    // Versioned families can be ordered without dates (e.g. Gemini 3 vs 2.5).
    const av = a.label.match(/^(GPT-|Gemini |o|DeepSeek [VR])(\d+(?:\.\d+)?)$/);
    const bv = b.label.match(/^(GPT-|Gemini |o|DeepSeek [VR])(\d+(?:\.\d+)?)$/);
    return av && bv && av[1] === bv[1] ? bv[2].localeCompare(av[2], 'en', { numeric: true }) : 0;
  });
  const missing = selected && !available.some(model => model.id === selected);
  const options = ordered.map(group => {
    group.models.sort((a, b) => newestFirst(modelDate(a), modelDate(b)));
    const items = group.models.map(model => `<option value="${esc(model.id)}" ${model.id === selected ? 'selected' : ''}>${esc(model.name || model.id)}</option>`).join('');
    return ordered.length === 1 && group.label === 'Other models' ? items : `<optgroup label="${esc(group.label)}">${items}</optgroup>`;
  }).join('');
  return `<option value="" ${!selected ? 'selected' : ''}>No saved model</option>`
    + (missing ? `<option value="${esc(selected)}" selected>${esc(selected)} (${state === 'loading' ? 'saved' : 'saved; unavailable in model list'})</option>` : '')
    + options;
}

export async function loadRouterModels(form, getModels) {
  const selects = ['cheap', 'frontier'].map(tier => form.querySelector(`#governor-${tier}-model`));
  const status = form.querySelector('#governor-model-status');
  const clear = form.querySelector('#governor-clear-models');
  for (const select of selects) select.addEventListener('change', () => { form.dataset.modelsDirty = 'true'; });
  clear.addEventListener('click', () => {
    for (const select of selects) select.value = '';
    form.dataset.modelsDirty = 'true';
    status.textContent = 'Click Save AI Router to remove the saved models.';
  });
  try {
    const { ok, data } = await getModels();
    if (data?.provider !== undefined && data.provider !== form.dataset.provider) {
      form.dataset.modelState = 'stale';
      clear.disabled = true;
      status.textContent = 'The AI provider changed. Reload Settings before saving AI Router.';
      return;
    }
    if (!ok || data?.provider !== form.dataset.provider || !Array.isArray(data.models)) throw new Error();
    const models = data.models.filter(model => typeof model?.id === 'string' && /^[a-zA-Z0-9_.:/+\-]{1,200}$/.test(model.id) && !model.id.includes('://'));
    form.dataset.modelState = models.length ? 'ready' : 'empty';
    for (const select of selects) {
      select.innerHTML = governorModelOptions(models, select.value);
      select.disabled = !models.length;
    }
    if (form.dataset.modelsDirty === 'true') return;
    status.textContent = !models.length
      ? 'No models available. Check AI Provider settings; saved models are kept.'
      : form.dataset.mapMismatch === 'true'
        ? 'Choose both models for this provider or clear the saved models, then click Save AI Router.'
        : 'Choose both models to replace your saved choices.';
  } catch {
    form.dataset.modelState = 'error';
    if (form.dataset.modelsDirty !== 'true') status.textContent = 'Models could not be loaded. Reload Settings to retry; saved models will be kept.';
  }
}

export function governorPayload(form) {
  const value = id => form.querySelector('#' + id).value;
  const mode = form.querySelector('#governor-enabled').checked ? 'enforce' : 'off';
  const remove = form.querySelector('#governor-remove-key').checked;
  if (remove && mode !== 'off') throw new Error('Select Off before removing the TypeSafe key.');
  // Hidden setup fields must not prevent turning Router off or silently
  // replace saved settings. Key removal remains an explicit visible action.
  if (mode === 'off') return remove
    ? { 'governor.mode': mode, 'governor.typesafe_api_key': null }
    : { 'governor.mode': mode };
  const map = {};
  if (form.dataset.modelState === 'stale') throw new Error('The AI provider changed. Reload Settings before saving AI Router.');
  for (const tier of ['cheap', 'frontier']) {
    const model = value(`governor-${tier}-model`).trim();
    if (model) map[tier] = { provider: form.dataset.provider, model };
  }
  if (Object.keys(map).length === 1) throw new Error('Choose both models, or click Clear saved models, then click Save AI Router.');
  if (Object.values(map).some(pair => !providers.includes(pair.provider) || pair.model.includes('://') || !/^[a-zA-Z0-9_.:/+\-]{1,200}$/.test(pair.model))) {
    throw new Error('Use a model ID without spaces, credentials or a provider URL.');
  }
  const body = { 'governor.mode': mode, 'governor.model_map': Object.keys(map).length ? map : [] };
  if (form.dataset.modelState && form.dataset.modelsDirty !== 'true') delete body['governor.model_map'];
  if (remove) body['governor.typesafe_api_key'] = null;
  else if (value('governor-key') && value('governor-key') !== keyMask) body['governor.typesafe_api_key'] = value('governor-key');
  return body;
}

export function bindRouterSettings(container, { getRole, put, reload, getModels, demoGuard = () => false }) {
  const uncertainSaveMessage = 'Could not confirm the save. Reload Settings to check the stored configuration before trying again.';
  const form = container.querySelector('#governor-form');
  if (!form || getRole() !== 'owner') return;
  let modelsRequested = false;
  const updateMode = () => {
    const off = !form.querySelector('#governor-enabled').checked;
    const stored = form.dataset.keyStored === 'true';
    const pending = form.querySelector('#governor-remove-key').checked;
    form.querySelector('#governor-key-controls').hidden = off && !stored;
    form.querySelector('#governor-key').disabled = off || pending;
    form.querySelector('#governor-enabled').disabled = pending;
    const help = form.querySelector('#governor-key-help');
    if (help) {
      help.hidden = pending;
      help.textContent = stored
        ? (off ? 'Turn on AI Router to replace this key.' : 'Leave unchanged to keep your key. Enter a new key to replace it.')
        : 'Enter your TypeSafe key, then save.';
    }
    form.querySelector('#governor-model-controls').hidden = off;
    // Keep values across mode changes; fetch the existing provider list only
    // when the owner opens the controls. This never calls TypeSafe.
    if (!off && getModels && !modelsRequested) {
      modelsRequested = true;
      loadRouterModels(form, getModels);
    }
  };
  const removeButton = form.querySelector('#governor-remove-key-button');
  let wasEnabled = false;
  removeButton?.addEventListener('click', () => {
    if (demoGuard() || getRole() !== 'owner' || form.querySelector('button[type="submit"]').disabled) return;
    const removal = form.querySelector('#governor-remove-key');
    const enabled = form.querySelector('#governor-enabled');
    removal.checked = !removal.checked;
    if (removal.checked) { wasEnabled = enabled.checked; enabled.checked = false; }
    else { enabled.checked = wasEnabled; }
    removeButton.textContent = removal.checked ? 'Undo' : 'Remove key';
    form.querySelector('#governor-key-removal-status').textContent = removal.checked
      ? 'Save to remove this key and turn off AI Router.' : '';
    updateMode();
  });
  form.addEventListener('change', updateMode);
  updateMode();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (getRole() !== 'owner' || demoGuard()) return;
    const button = form.querySelector('button[type="submit"]');
    if (button.disabled) return;
    const status = form.querySelector('#governor-save-status');
    let body;
    try { body = governorPayload(form); }
    catch (error) { status.textContent = error.message; return; }
    button.disabled = true;
    status.textContent = 'Saving AI Router…';
    try {
      const response = await put('/settings', body);
      // Clear transient key material after every request, including failures.
      form.querySelector('#governor-key').value = '';
      delete body['governor.typesafe_api_key'];
      if (response.ok) { await reload(); }
      else if (response.error?.code === 'network_error') status.textContent = uncertainSaveMessage;
      else status.textContent = response.error?.code === 'governor_configuration'
        ? 'Enter a readable TypeSafe key to enable routing. Editing can still use your default settings.'
        : 'AI Router settings were not saved. Reload Settings to check the saved AI provider, then check your owner access and field values.';
    } catch {
      status.textContent = uncertainSaveMessage;
    } finally {
      form.querySelector('#governor-key').value = '';
      delete body['governor.typesafe_api_key'];
      button.disabled = false;
    }
  });
}
