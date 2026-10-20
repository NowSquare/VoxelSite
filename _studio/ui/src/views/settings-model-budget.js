import { escapeAttr } from '../helpers.js';

export function modelOptions(models, selected = '') {
  const options = new Map();
  for (const model of Array.isArray(models) ? models : []) {
    if (typeof model?.id === 'string' && model.id) {
      options.set(model.id, model.name || model.id);
    }
  }
  if (selected && !options.has(selected)) options.set(selected, selected);
  if (!options.size) return '<option value="">Test your connection to load available models</option>';
  return [...options].map(([id, name]) =>
    `<option value="${escapeAttr(id)}"${id === selected ? ' selected' : ''}>${escapeAttr(name)}</option>`
  ).join('');
}

export function normalizeModelEndpoint(value) {
  const url = (String(value || '').trim() || 'http://localhost:11434').replace(/\/+$/, '');
  return /\/v\d+$/.test(url) ? url : `${url}/v1`;
}

export function modelLimitsForEndpoint(saved, endpoint) {
  const baseUrl = normalizeModelEndpoint(endpoint);
  const models = saved?.base_url && normalizeModelEndpoint(saved.base_url) === baseUrl
    && saved.models && typeof saved.models === 'object' && !Array.isArray(saved.models)
    ? { ...saved.models } : {};
  return { base_url: baseUrl, models };
}

export function updateModelLimits(settings, model, output, context) {
  const outputValue = String(output).trim();
  const contextValue = String(context).trim();
  const models = { ...settings.models };
  if (!outputValue && !contextValue) {
    delete models[model];
    return { settings: { ...settings, models } };
  }
  if (!model) return { error: 'Choose a model before setting its limits.' };
  if (!outputValue || !contextValue) {
    return { error: 'Enter both limits, or leave both blank to use detected limits.' };
  }
  const maxOutput = Number(outputValue);
  const contextWindow = Number(contextValue);
  if (!Number.isInteger(maxOutput) || maxOutput < 1 || maxOutput > 2000000
    || !Number.isInteger(contextWindow) || contextWindow < 1 || contextWindow > 10000000) {
    return { error: 'Use whole numbers: output from 1 to 2,000,000 and context from 1 to 10,000,000.' };
  }
  if (maxOutput > contextWindow) {
    return { error: 'The output limit cannot exceed the context window.' };
  }
  return { settings: { ...settings, models: { ...models, [model]: {
    max_output_tokens: maxOutput, context_window: contextWindow,
  } } } };
}

export function renderModelBudget(data) {
  const budget = data?.budget;
  const focused = data?.focused_budget;
  if (!budget || !focused) return 'Model limits could not be loaded. Try again after testing your connection.';
  const number = value => Number(value).toLocaleString();
  const source = {
    documented: 'Using documented model limits.',
    metadata: 'Using model limits reported by your endpoint.',
    override: 'Using your limits for this endpoint and exact model ID.',
    fallback: budget.provider === 'openai_compatible'
      ? 'This model has no reported limits. Conservative defaults are in use; set limits below if your host documents different values.'
      : 'Limits are not known for this model. Conservative defaults are in use.',
  }[data.source] || '';
  return `
    <dl class="grid grid-cols-1 sm:grid-cols-3 gap-2">
      ${[['Configured ceiling', budget.configured], ['Full generation', budget.effective], ['Section edits', focused.effective]].map(([label, value]) => `
        <div><dt class="text-vs-text-ghost">${label}</dt><dd class="text-vs-text-secondary font-medium">${number(value)} tokens</dd></div>
      `).join('')}
    </dl>
    <p class="mt-2">Model output limit: ${number(budget.model_limit)} · Context window: ${number(budget.context_window)} tokens.</p>
    <p class="mt-1">${source} Section edits use at most 16,000 tokens.</p>`;
}

/**
 * Keep draft overrides scoped to one endpoint and exact model IDs. The budget
 * comes from the server's generation policy; the browser does not recalculate it.
 */
export function bindModelBudgetControls(container, { settings, post, delay = 180, demoMode = false, canEditModelLimits = false }) {
  const field = id => container.querySelector(`#${id}`);
  const select = field('set-ai-model');
  const maxTokens = field('set-max-tokens');
  const baseUrl = field('set-base-url');
  const output = field('set-model-output-limit');
  const context = field('set-model-context-window');
  const status = field('set-model-budget');
  const error = field('set-model-limits-error');
  const compatible = settings.ai_provider === 'openai_compatible';
  let limits = modelLimitsForEndpoint(settings.ai_openai_compatible_model_limits, baseUrl?.value);
  let selectedModel = select.value;
  let requestVersion = 0;
  let timer;

  function showSelectedLimits() {
    if (!compatible) return;
    const saved = Object.hasOwn(limits.models, selectedModel) ? limits.models[selectedModel] : null;
    output.value = saved?.max_output_tokens ?? '';
    context.value = saved?.context_window ?? '';
    output.readOnly = !canEditModelLimits;
    context.readOnly = !canEditModelLimits;
    showError('');
  }

  function showError(message) {
    if (!compatible) return;
    error.textContent = message;
    error.hidden = !message;
    output.setCustomValidity(message);
    context.setCustomValidity(message);
  }

  function collectLimits() {
    if (!compatible) return undefined;
    if (!canEditModelLimits) return limits;
    const result = updateModelLimits(limits, selectedModel, output.value, context.value);
    showError(result.error || '');
    if (result.error) return null;
    limits = result.settings;
    return limits;
  }

  async function refresh(version) {
    if (!status.isConnected || version !== requestVersion) return;
    const modelLimits = collectLimits();
    if (modelLimits === null) {
      status.textContent = 'Complete both model limits to preview the generation budget.';
      return;
    }
    const configured = Number(maxTokens.value);
    if (!Number.isInteger(configured) || configured < 1000 || configured > 128000) {
      status.textContent = 'Enter a whole-number output ceiling from 1,000 to 128,000 tokens.';
      return;
    }
    if (!select.value) {
      status.textContent = 'Choose a model to see its generation budget.';
      return;
    }
    const payload = {
      provider: settings.ai_provider || 'claude', model: select.value,
      max_tokens: configured, base_url: baseUrl?.value?.trim() || '',
      ...(compatible && canEditModelLimits ? { model_limits: modelLimits } : {}),
    };
    try {
      const result = await post('/settings/model-budget', payload, { silent: true });
      if (!status.isConnected || version !== requestVersion) return;
      if (result.ok) status.innerHTML = renderModelBudget(result.data);
      else status.textContent = result.error?.message || 'Model limits could not be loaded. Try again after testing your connection.';
    } catch {
      if (status.isConnected && version === requestVersion) {
        status.textContent = 'Model limits could not be loaded. Try again after testing your connection.';
      }
    }
  }

  function scheduleRefresh() {
    clearTimeout(timer);
    const version = ++requestVersion;
    if (demoMode) {
      status.textContent = 'Model limits appear after setup.';
      return;
    }
    status.textContent = 'Checking model limits…';
    timer = setTimeout(() => refresh(version), delay);
  }

  select.addEventListener('change', () => {
    if (collectLimits() === null) {
      select.value = selectedModel;
      output.reportValidity();
      return;
    }
    selectedModel = select.value;
    showSelectedLimits();
    scheduleRefresh();
  });
  maxTokens.addEventListener('input', scheduleRefresh);
  if (compatible) {
    if (canEditModelLimits) {
      output.addEventListener('input', scheduleRefresh);
      context.addEventListener('input', scheduleRefresh);
    }
    baseUrl.addEventListener('input', () => {
      limits = modelLimitsForEndpoint(canEditModelLimits ? limits : settings.ai_openai_compatible_model_limits, baseUrl.value);
      showSelectedLimits();
      scheduleRefresh();
    });
  }
  showSelectedLimits();
  scheduleRefresh();

  return {
    collectLimits() {
      if (!canEditModelLimits) return undefined;
      const value = collectLimits();
      if (value === null) {
        output.reportValidity();
      }
      return value;
    },
    refresh: scheduleRefresh,
    invalidate() { clearTimeout(timer); requestVersion++; },
  };
}
