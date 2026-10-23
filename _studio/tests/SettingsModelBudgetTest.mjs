import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { modelOptions, normalizeModelEndpoint, modelLimitsForEndpoint, updateModelLimits,
  renderModelBudget, bindModelBudgetControls } from '../ui/src/views/settings-model-budget.js';

const source = await readFile(new URL('../ui/src/views/settings.js', import.meta.url), 'utf8');
const autoLoadSource = source.slice(source.indexOf('async function autoLoadModels('), source.indexOf('\nfunction renderSysRow('));
const select = { value: 'saved-private-model', innerHTML: '', isConnected: true, dispatchEvent() {} };
const context = vm.createContext({
  document: { getElementById: id => id === 'set-ai-model' ? select : null },
  api: { get: async () => ({ ok: false }) },
  escapeHtml: value => value,
  Event: class {},
  modelDiscoveryRequest: 0,
  modelOptions,
});
vm.runInContext(autoLoadSource, context);
await context.autoLoadModels('saved-private-model');
assert.ok(select.innerHTML.includes('value="saved-private-model"'), 'Failed model discovery must retain the saved model');
context.api.get = async () => ({ ok: true, data: { models: [{ id: 'new-model', name: 'New model' }] } });
await context.autoLoadModels('saved-private-model');
assert.ok(select.innerHTML.includes('value="saved-private-model" selected'), 'Discovery omitting a saved model must preserve selection');
assert.ok(select.innerHTML.includes('value="new-model"'), 'Discovered models remain available');
assert.ok(modelOptions([{ id: '" onfocus="bad', name: '<unsafe>' }]).includes('&quot; onfocus=&quot;bad'), 'Model IDs are escaped');
assert.ok(modelOptions([{ id: 'safe', name: '<unsafe>' }]).includes('&lt;unsafe&gt;'), 'Model names are escaped');

const endpoint = 'https://models.example.test';
const saved = { base_url: `${endpoint}/v1`, models: {
  'private-model': { max_output_tokens: 32000, context_window: 128000 },
  'other-model': { max_output_tokens: 64000, context_window: 256000 },
} };
assert.equal(normalizeModelEndpoint(' https://models.example.test/ '), saved.base_url);
assert.equal(normalizeModelEndpoint('https://models.example.test/v2/'), 'https://models.example.test/v2');
assert.equal(normalizeModelEndpoint(''), 'http://localhost:11434/v1');
assert.deepEqual(modelLimitsForEndpoint(saved, endpoint).models, saved.models, 'Equivalent endpoint forms retain overrides');
assert.deepEqual(modelLimitsForEndpoint(saved, 'https://different.example.test').models, {}, 'Endpoint changes discard all overrides');
const updated = updateModelLimits(saved, 'private-model', '48000', '160000');
assert.equal(updated.settings.models['private-model'].max_output_tokens, 48000);
assert.deepEqual(updated.settings.models['other-model'], saved.models['other-model'], 'Editing a model preserves other exact IDs');
assert.equal(saved.models['private-model'].max_output_tokens, 32000, 'Draft editing leaves original settings untouched');
assert.ok(!Object.hasOwn(updateModelLimits(saved, 'private-model', '', '').settings.models, 'private-model'), 'Clearing both fields removes only that override');
for (const [output, window] of [['32000', ''], ['', '32000'], ['32001', '32000'], ['0', '64000'], ['1.5', '64000'], ['2000001', '2000001']]) {
  assert.ok(updateModelLimits(saved, 'private-model', output, window).error, `Invalid limits ${output}/${window} reject`);
}
assert.equal(updateModelLimits(saved, 'private-model', '128000', '2097152').settings.models['private-model'].context_window, 2097152,
  'Large documented context windows remain valid');
assert.ok(updateModelLimits(saved, 'private-model', '128000', '10000001').error, 'Context windows above the supported range reject');

function element(value = '') {
  return {
    value, textContent: '', innerHTML: '', isConnected: true, hidden: false, open: false,
    handlers: {}, addEventListener(name, callback) { this.handlers[name] = callback; },
    dispatch(name) { this.handlers[name]?.(); },
    setCustomValidity(message) { this.validityMessage = message; },
    reportValidity() { return !this.validityMessage; },
  };
}
const fields = new Map([
  ['set-ai-model', element('private-model')], ['set-max-tokens', element('64000')],
  ['set-base-url', element(endpoint)], ['set-model-output-limit', element()],
  ['set-model-context-window', element()], ['set-model-budget', element()],
  ['set-model-limits-error', element()], ['set-model-limits', element()],
]);
const pending = [];
const controls = bindModelBudgetControls({ querySelector: selector => fields.get(selector.slice(1)) }, {
  settings: { ai_provider: 'openai_compatible', ai_openai_compatible_model_limits: saved }, delay: 0, canEditModelLimits: true,
  post: (path, payload, options) => new Promise(resolve => pending.push({ path, payload: structuredClone(payload), options, resolve })),
});
const tick = () => new Promise(resolve => setTimeout(resolve, 5));
const get = id => fields.get(id);
await tick();
assert.equal(pending[0].path, '/settings/model-budget');
assert.equal(pending[0].options.silent, true, 'Budget previews never flash the global Saved indicator');
assert.equal(get('set-model-output-limit').value, 32000, 'Selected model shows its saved override');
assert.equal(pending[0].payload.max_tokens, 64000);
get('set-model-output-limit').value = '48000';
get('set-model-context-window').value = '160000';
get('set-ai-model').value = 'other-model';
get('set-ai-model').dispatch('change');
assert.equal(get('set-model-output-limit').value, 64000, 'Switching models loads that model’s override');
get('set-ai-model').value = 'private-model';
get('set-ai-model').dispatch('change');
assert.equal(get('set-model-output-limit').value, 48000, 'Switching back restores the edited override');
get('set-max-tokens').value = '96000';
get('set-max-tokens').dispatch('input');
await tick();
const response = (configured, effective, source = 'override') => ({ ok: true, data: {
  budget: { configured, effective, model_limit: 48000, context_window: 160000, provider: 'openai_compatible' },
  focused_budget: { effective: 16000 }, source,
} });
pending.at(-1).resolve(response(96000, 48000));
await tick();
assert.ok(get('set-model-budget').innerHTML.includes(`${(96000).toLocaleString()} tokens`));
pending[0].resolve(response(64000, 32000));
await tick();
assert.ok(get('set-model-budget').innerHTML.includes(`${(96000).toLocaleString()} tokens`), 'A late older response cannot replace the current budget');
assert.ok(!get('set-model-budget').innerHTML.includes(`${(64000).toLocaleString()} tokens`));
get('set-base-url').value = 'https://different.example.test/v1';
get('set-base-url').dispatch('input');
assert.equal(get('set-model-output-limit').value, '', 'Changing endpoint clears visible model limits');
assert.deepEqual(controls.collectLimits().models, {}, 'Changing endpoint clears other model overrides before saving');
await tick();
assert.deepEqual(pending.at(-1).payload.model_limits.models, {}, 'Old endpoint overrides never reach a new endpoint preview');
get('set-model-output-limit').value = '50000';
assert.equal(controls.collectLimits(), null, 'Incomplete overrides block saving');
assert.equal(get('set-model-limits-error').hidden, false, 'Invalid limits display a field error');
assert.ok(get('set-model-limits-error').textContent.includes('both'));
controls.invalidate();
assert.ok(renderModelBudget(response(96000, 8192, 'fallback').data).includes('Conservative defaults'), 'Unknown compatible model fallback is explicit');
assert.ok(renderModelBudget(response(96000, 48000).data).includes('16,000 tokens'), 'Section edit ceiling is explained');
let demoRequests = 0;
get('set-model-output-limit').value = '';
const demoControls = bindModelBudgetControls({ querySelector: selector => fields.get(selector.slice(1)) }, {
  settings: { ai_provider: 'openai_compatible' }, delay: 0, demoMode: true,
  post: async () => { demoRequests++; return response(64000, 8192); },
});
await tick();
assert.equal(demoRequests, 0, 'Demo mode never calls the budget POST endpoint');
assert.equal(get('set-model-budget').textContent, 'Model limits appear after setup.');
demoControls.invalidate();

const saveConfigurationSource = source.slice(source.indexOf('async function saveConfiguration('), source.indexOf('\nfunction mailSettingValues('));
const bindSettingsSource = source.slice(source.indexOf('function bindSettingsEvents('), source.indexOf('\n// ─── Email Settings Events'));
for (const role of ['owner', 'editor']) {
  const roleFields = new Map([
    ['set-ai-model', element('private-model')], ['set-max-tokens', element('64000')],
    ['set-base-url', element(endpoint)], ['set-model-output-limit', element()],
    ['set-model-context-window', element()], ['set-model-budget', element()],
    ['set-model-limits-error', element()], ['btn-save-settings', element()],
    ['set-api-key', element('new-fixture-key')],
  ]);
  const roleContainer = { querySelector: selector => roleFields.get(selector.slice(1)) };
  let budgetBinding, savedBody, previewBody, readiness;
  const roleContext = vm.createContext({
    document: {
      getElementById: id => id === 'settings-content' ? roleContainer : roleFields.get(id),
      documentElement: { dataset: {} },
    },
    window: { demoGuard: () => false },
    store: { get: () => ({ role }), set: (key, value) => { if (key === 'aiConfigured') readiness = value; } },
    api: {
      get: async () => ({ ok: true, data: { ai_configured: true } }),
      post: async (_, body) => { previewBody = body; return response(64000, 32000); },
      put: async (_, body) => { savedBody = body; return { ok: true }; },
    },
    configurationVersions: { provider: 'fixture-version' },
    configurationGroupKeys: { provider: ['ai_openai_compatible_model', 'ai_max_tokens', 'ai_openai_compatible_api_key', 'ai_openai_compatible_model_limits'] },
    pendingOperationInput: () => null,
    apiOperation: async (path, body, method) => {
      assert.equal(path, '/settings'); assert.equal(method, 'put');
      assert.equal(body.versions.provider, 'fixture-version', 'Settings save carries the displayed configuration version');
      savedBody = body.values; return { ok: true };
    },
    bindModelBudgetControls: (container, options) => {
      budgetBinding = bindModelBudgetControls(container, { ...options, delay: 0 });
      return budgetBinding;
    },
  });
  vm.runInContext(saveConfigurationSource + "\n" + bindSettingsSource, roleContext);
  roleContext.bindSettingsEvents({ ai_provider: 'openai_compatible', ai_openai_compatible_model_limits: saved }, {});
  assert.equal(Boolean(roleFields.get('set-model-output-limit').readOnly), role !== 'owner', `${role}: output override access`);
  assert.equal(Boolean(roleFields.get('set-model-context-window').readOnly), role !== 'owner', `${role}: context override access`);
  assert.equal(roleFields.get('set-model-output-limit').value, 32000, `${role}: saved override remains visible`);
  await tick();
  assert.equal(Object.hasOwn(previewBody, 'model_limits'), role === 'owner', `${role}: editor previews use the server’s saved overrides`);
  assert.ok(roleFields.get('set-model-budget').innerHTML.includes(`${(32000).toLocaleString()} tokens`), `${role}: saved override budget is displayed`);
  await roleFields.get('btn-save-settings').handlers.click();
  assert.equal(readiness, true, `${role}: successful configuration refreshes built-in AI availability`);
  assert.equal(savedBody.ai_openai_compatible_model, 'private-model', `${role}: ordinary model setting is saved`);
  assert.equal(savedBody.ai_max_tokens, 64000, `${role}: ordinary output ceiling is saved`);
  assert.equal(savedBody.ai_openai_compatible_api_key, 'new-fixture-key', `${role}: ordinary API key setting is saved`);
  assert.equal(Object.hasOwn(savedBody, 'ai_openai_compatible_model_limits'), role === 'owner', `${role}: only owners send override updates`);
  if (role === 'owner') assert.deepEqual(savedBody.ai_openai_compatible_model_limits.models, saved.models);
  assert.equal(saved.models['private-model'].max_output_tokens, 32000, `${role}: saved overrides remain unchanged`);
  budgetBinding.invalidate();
}
console.log('Passed: model discovery, endpoint isolation, per-model overrides, validation, and stale budget responses');
