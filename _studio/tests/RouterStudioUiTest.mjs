import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { renderRouterSettings, renderRouterActivity, governorPayload, bindRouterSettings, loadRouterModels, governorModelOptions } from '../ui/src/views/router.js';
let passed = 0;
const check = (condition, message) => { assert.ok(condition, message); passed++; };
const secret = randomBytes(32).toString('hex');
const settings = { 'governor.mode': 'enforce', 'governor.typesafe_configured': true, 'governor.typesafe_api_key': secret };
for (const role of ['owner', 'editor', 'viewer', undefined]) {
  const html = renderRouterSettings(settings, role, { available: true, items: [] });
  check(html.includes('id="governor-form"') === (role === 'owner'), `${role} form access`);
  check(!html.includes(secret), 'Even an unexpected secret field is never rendered');
  check(html.includes('Automatically selects the model and instructions') && html.includes('editing uses your default settings'), 'Routing purpose and fallback are clear');
}
for (const mode of ['off', 'shadow', 'enforce']) {
  const html = renderRouterSettings({ ...settings, 'governor.mode': mode }, 'owner');
  for (const id of ['key', 'model']) {
    check(html.includes(`id="governor-${id}-controls" hidden`) === (mode === 'off' && id === 'model'), `${mode}: ${id} visibility follows mode on initial render`);
  }
  check(html.indexOf('If routing is unavailable') < html.indexOf('id="governor-key-controls"'), `${mode}: fallback notice remains outside hidden controls`);
  check(!html.includes('Test Connection'), `${mode}: no pretend connection check`);
}
const owner = renderRouterSettings(settings, 'owner', { available: false });
// Keep native form semantics while presenting the controls as styled choices.
for (const mode of ['off', 'shadow', 'enforce']) {
  const html = renderRouterSettings({ ...settings, 'governor.mode': mode }, 'owner');
  const toggle = html.match(/<input[^>]*id="governor-enabled"[^>]*>/)?.[0];
  check(toggle?.includes('type="checkbox"') && toggle.includes('role="switch"'), `${mode}: router uses a native checkbox switch`);
  check(/ checked(?:\s|\/?>)/.test(toggle) === (mode !== 'off'), `${mode}: enabled state matches saved configuration`);
  check(!html.includes('type="radio"'), `${mode}: no routing mode choices remain`);
}
check(owner.includes('id="governor-remove-key-button" type="button"') && owner.includes('>Remove key</button>'), 'Stored key has a removal action beside the field');
check(!owner.includes('Requires Off.') && !owner.includes('Remove stored key'), 'No deletion switch or manual prerequisite');
for (const mode of ['off', 'enforce']) {
  const empty = renderRouterSettings({ ...settings, 'governor.mode': mode, 'governor.typesafe_configured': false }, 'owner');
  check(!empty.includes('governor-remove-key-button'), `${mode}: no removal action when no key exists`);
  check(empty.includes('id="governor-key-controls" hidden') === (mode === 'off'), `${mode}: unconfigured key follows setup visibility`);
}
for (const provider of ['claude', 'openai', 'gemini', 'deepseek', 'openai_compatible']) {
  const map = { cheap: { provider, model: 'custom-small' }, frontier: { provider, model: 'custom-large' } };
  const html = renderRouterSettings({ ...settings, ai_provider: provider, 'governor.model_map': map }, 'owner');
  check(!html.includes('governor-cheap-provider') && !html.includes('governor-frontier-provider'), 'No independent provider controls');
  check(html.includes(`data-provider="${provider}"`) && html.includes('custom-small') && html.includes('custom-large'), 'Both model fields bind to the saved provider');
}
for (const map of [
  { cheap: { provider: 'openai', model: 'stale-small' }, frontier: { provider: 'claude', model: 'stale-large' } },
  { cheap: { provider: 'openai', model: 'stale-small' }, frontier: { provider: 'openai', model: 'stale-large' } },
]) {
  const html = renderRouterSettings({ ...settings, ai_provider: 'claude', 'governor.model_map': map }, 'owner');
  check(!html.includes('stale-small') && !html.includes('stale-large'), 'Old cross-provider IDs never populate the new provider fields');
  check(html.includes('Choose two models') && html.includes('then click Save AI Router') && html.includes('role="alert"'), 'Obsolete map has explicit migration guidance');
}
check(renderRouterSettings({ ...settings, 'governor.model_map': {
  cheap: { provider: 'claude', model: '" onfocus="x' }, frontier: { provider: 'claude', model: 'large' },
} }, 'owner').includes('&quot; onfocus=&quot;x'), 'Unexpected model attributes stay escaped');
check(!renderRouterSettings(null, 'owner').includes('governor-form'), 'Failed settings read never offers a form with guessed defaults');
check(owner.includes('id="governor-key" value="••••••••" type="password"'), 'Configured key displays synthetic password dots');
check(owner.includes('>TypeSafe key</label>') && owner.includes('https://console.typesafe.ai/keys'), 'Consistent label and console link');
check(renderRouterSettings({ ...settings, 'governor.typesafe_configured': false }, 'owner').includes('id="governor-key" value=""'), 'Unconfigured key is empty');
check(owner.includes('Use the faster model') && owner.includes('stronger model for larger changes'), 'Model choices are active');
check(owner.includes('could not be loaded'), 'Unavailable is distinct from empty history');
for (const [state, map] of [
  ['empty', {}],
  ['normal', { cheap: { provider: 'claude', model: 'small' }, frontier: { provider: 'claude', model: 'large' } }],
  ['mismatch', { cheap: { provider: 'openai', model: 'old-small' }, frontier: { provider: 'openai', model: 'old-large' } }],
]) {
  const html = renderRouterSettings({ ...settings, ai_provider: 'claude', 'governor.model_map': map }, 'owner');
  const block = html.match(/<fieldset[^>]*><legend[^>]*>Models<\/legend>([\s\S]*?)<\/fieldset>/)[1];
  check(block.includes('Faster model') && block.includes('Stronger model') && !/Model map|Cheap|Frontier|AI Settings/.test(block), `${state}: plain labels without internal jargon`);
  check(block.indexOf('Use the faster model') < block.indexOf('<select') && block.includes('Leave both empty to use your default model'), `${state}: limitation leads with accurate destination before fields`);
  check(block.includes('Choose both models') && block.includes('then save') && block.includes('Clear saved models'), `${state}: explicit store and clear instructions beside fields`);
  check([...block.matchAll(/<p[^>]*>(.*?)<\/p>/gs)].every(([, text]) => text.split(/[.!?]+/).filter(part => part.trim()).length <= 2), `${state}: help blocks contain at most two sentences`);
  check(html.includes('The saved models do not match') === (state === 'mismatch'), `${state}: recovery appears only for a mismatch`);
  check([...block.matchAll(/<select[^>]*>/g)].length === 2 && [...block.matchAll(/<option value="([^"]*)" selected/g)].every(([, value]) => state === 'normal' ? ['small', 'large'].includes(value) : value === ''), `${state}: rendered values retain normal, empty and mismatch behavior`);
}

check(renderRouterSettings({ ...settings, 'governor.configuration_error': { message: '<broken key>' } }, 'editor').includes('&lt;broken key&gt;'), 'Config error visible and escaped');
check(renderRouterSettings({ ...settings, 'governor.model_map_error': { message: '<untrusted>' } }, 'owner').includes('&lt;untrusted&gt;'), 'Map warning escaped');
for (const mode of ['off', 'shadow', 'enforce']) {
  const html = renderRouterSettings({ ...settings, 'governor.mode': mode }, 'owner');
  check(html.includes('>AI Router</h2>') && html.includes('Enable AI Router') && !html.includes('Preview') && !html.includes('>Automatic</option>'), 'Plain router and mode labels');
  check(!html.includes('inactive') && !html.includes('Only edits to a selected'), 'No obsolete editing restriction');
}
const routed = (overrides = {}) => renderRouterActivity({ available: true, items: [{ id: 20, kind: 'routing', mode: 'enforce', status: 'routed', intent: 'edit_copy', recipe: 'copy_edit', context: 'focused', models: ['actual-small'], ...overrides }] });
check(routed().includes('actual-small') && routed().includes('Copy edit') && routed().includes('Selected content'), 'Actual model, work and context visible');
check(routed({ status: 'preview', proposed_model: 'suggested-small' }).includes('suggested-small') && routed({ status: 'preview' }).includes('Editing used defaults'), 'Preview distinguishes suggested and actual models');
check(routed({ status: 'fallback', reason: 'routing_unavailable' }).includes('Default settings used') && !routed({ status: 'fallback' }).includes('checked'), 'Fallback never claims certification');
check(routed({ models: ['<unsafe>'] }).includes('&lt;unsafe&gt;'), 'Activity model display escapes values');
const summary = (overrides = {}) => renderRouterActivity({ available: true, items: [{ id: 1, mode: 'enforce', status: 'rejected', reason: 'gate_unavailable', intent: 'edit_copy', requested_tier: 'cheap', generation_calls: 1, providers: ['claude'], ...overrides }] });
check(summary().includes('not applied') && summary().includes('claim check was unavailable'), 'Gate failure display');
check(summary().includes('requested tier: cheap') && summary().includes('via claude'), 'Requested tier and actual provider distinguished');
check(summary({ generation_calls: 0 }).includes('No generation calls recorded'), 'No call inferred from cheap tier');
check(summary({ status: 'answered' }).includes('Answered the question'), 'Question display');
check(summary({ status: 'acknowledged' }).includes('No changes requested'), 'Noop display');
check(summary({ status: 'applied', reason: 'accepted' }).includes('Historical heading check'), 'Old checks explicitly historical');
check(summary({ status: 'applied', reason: 'accepted_owner_override' }).includes('owner override'), 'Override distinct from clean check');
check(summary({ mode: 'shadow', status: 'error' }).includes('No edit check'), 'Shadow never implies gated apply');
for (const reason of ['forbidden_claims','routing_unavailable','routing_invalid','gate_invalid','governor_configuration','repair_limit_exhausted','content_changed']) {
  check(!summary({ reason }).includes('could not be completed safely'), `${reason} gets specific explanation`);
}
function harness() {
  const fields = new Map();
  for (const id of ['governor-key','governor-cheap-model','governor-frontier-model','governor-remove-key','governor-save-status','governor-key-controls','governor-model-controls']) fields.set('#'+id, { value: '', checked: false, textContent: '' });
  fields.set('#governor-enabled', { checked: true });
  fields.set('button[type="submit"]', { disabled: false });
  const form = { dataset: { provider: 'claude' }, querySelector: selector => fields.get(selector), addEventListener: (name, handler) => { form[name] = handler; } };
  return { form, fields, container: { querySelector: () => form }, submit: () => form.submit({ preventDefault() {} }) };
}
// Removing a saved key is reversible until the normal Save action.
for (const initiallyEnabled of [false, true]) {
  const h = harness(); h.form.dataset.keyStored = 'true';
  h.fields.get('#governor-enabled').checked = initiallyEnabled;
  h.fields.get('#governor-key').value = '••••••••';
  const remove = { textContent: 'Remove key', addEventListener(event, handler) { this[event] = handler; } };
  h.fields.set('#governor-remove-key-button', remove);
  h.fields.set('#governor-key-removal-status', { textContent: '' });
  h.fields.set('#governor-key-help', { textContent: '' });
  let sent, requests = 0;
  bindRouterSettings(h.container, { getRole: () => 'owner', put: async (_, body) => { sent = structuredClone(body); requests++; return {ok: false}; }, reload: async () => {} });
  check(!h.fields.get('#governor-key-controls').hidden, 'Stored key remains manageable while router is off');
  remove.click();
  check(requests === 0 && remove.textContent === 'Undo', 'Remove stages a reversible change without sending a request');
  check(!h.fields.get('#governor-enabled').checked && h.fields.get('#governor-enabled').disabled, 'Pending removal turns router off and prevents incompatible enable');
  check(h.fields.get('#governor-key').disabled && h.fields.get('#governor-key-removal-status').textContent.includes('Save to remove'), 'Pending removal disables replacement and explains Save');
  remove.click();
  check(h.fields.get('#governor-enabled').checked === initiallyEnabled && !h.fields.get('#governor-enabled').disabled, 'Undo restores original enabled state');
  check(h.fields.get('#governor-key').value === '••••••••' && !h.fields.get('#governor-remove-key').checked, 'Undo preserves saved key and cancels deletion');
  remove.click(); await h.submit();
  check(requests === 1 && JSON.stringify(sent) === JSON.stringify({'governor.mode':'off', 'governor.typesafe_api_key':null}), 'Save atomically removes key and turns routing off');
  check(remove.textContent === 'Undo' && h.fields.get('#governor-remove-key').checked, 'Rejected save retains pending removal for correction or undo');
}
let h = harness();
{
  let requests = 0;
  h.fields.get('#governor-enabled').checked = false;
  h.fields.set('#governor-model-status', {});
  h.fields.set('#governor-clear-models', {});
  for (const id of ['governor-cheap-model', 'governor-frontier-model', 'governor-clear-models']) {
    const field = h.fields.get('#' + id);
    field.addEventListener = (event, handler) => { field[event] = handler; };
  }
  h.fields.get('#governor-key').value = '••••••••';
  h.fields.get('#governor-cheap-model').value = 'saved-small';
  h.fields.get('#governor-frontier-model').value = 'saved-large';
  bindRouterSettings(h.container, { getRole: () => 'owner', getModels: async () => {
    requests++;
    return { ok: true, data: { provider: 'claude', models: [{ id: 'another', name: 'Another model' }] } };
  } });
  check(requests === 0 && h.fields.get('#governor-key-controls').hidden && h.fields.get('#governor-model-controls').hidden, 'Off hides setup without requesting models');
  for (const mode of ['shadow', 'off', 'enforce', 'off']) {
    h.fields.get('#governor-enabled').checked = mode !== 'off';
    h.form.change();
    await Promise.resolve();
    check(h.fields.get('#governor-key-controls').hidden === (mode === 'off') && h.fields.get('#governor-model-controls').hidden === (mode === 'off'), `${mode}: live mode change updates visibility`);
    check(h.fields.get('#governor-key').value === '••••••••' && h.fields.get('#governor-cheap-model').value === 'saved-small' && h.fields.get('#governor-frontier-model').value === 'saved-large', `${mode}: visibility never resets key or saved models`);
  }
  check(requests === 1, 'Repeated toggles request models only once');
  check(!Object.hasOwn(governorPayload(h.form), 'governor.typesafe_api_key'), 'Toggling modes never submits synthetic dots');
  h.form.dataset.modelsDirty = 'true';
  h.form.dataset.modelState = 'stale';
  h.fields.get('#governor-cheap-model').value = '';
  h.fields.get('#governor-key').value = secret;
  check(JSON.stringify(governorPayload(h.form)) === JSON.stringify({ 'governor.mode': 'off' }), 'Off saves despite hidden incomplete/stale models and preserves saved key/map');

  h.fields.get('#governor-remove-key').checked = true;
  check(governorPayload(h.form)['governor.typesafe_api_key'] === null, 'Key removal remains possible while setup is hidden in Off');
}
h = harness();
check(!Object.hasOwn(governorPayload(h.form),'governor.typesafe_api_key'), 'Blank key preserves stored key');
check(governorPayload(h.form)['governor.mode'] === 'enforce', 'Enabled switch saves automatic routing compatibility value');
h.fields.get('#governor-enabled').checked=false;
h.fields.get('#governor-remove-key').checked=true;
check(governorPayload(h.form)['governor.typesafe_api_key']===null,'Explicit key removal');
h.fields.get('#governor-enabled').checked=true;
assert.throws(()=>governorPayload(h.form),/Select Off/); passed++;
h = harness(); h.fields.get('#governor-cheap-model').value='small';
assert.throws(()=>governorPayload(h.form),/both models/); passed++;
h.fields.get('#governor-frontier-model').value='large';
check(governorPayload(h.form)['governor.model_map'].cheap.model==='small','Complete map payload');
check(Object.values(governorPayload(h.form)['governor.model_map']).every(pair => pair.provider === 'claude'), 'Payload binds both tiers to the saved provider');
h.fields.get('#governor-cheap-model').value='https://bad.test';
assert.throws(()=>governorPayload(h.form), /provider URL/); passed++;
h = harness(); h.fields.get('#governor-key').value = '••••••••';
check(!Object.hasOwn(governorPayload(h.form), 'governor.typesafe_api_key'), 'Unchanged synthetic dots are never submitted');
for (const state of ['loading', 'error', 'empty', 'ready']) {
  h = harness(); h.form.dataset.modelState = state;
  check(!Object.hasOwn(governorPayload(h.form), 'governor.model_map'), `${state}: unchanged map omitted rather than silently cleared`);
  h.form.dataset.modelsDirty = 'true';
  check(Array.isArray(governorPayload(h.form)['governor.model_map']), `${state}: explicit clear submits removal`);
}
h = harness(); h.form.dataset.modelState = 'stale';
assert.throws(() => governorPayload(h.form), /provider changed/); passed++;
check(governorModelOptions([{ id: 'small', name: '<Readable Small>' }], 'small').includes('&lt;Readable Small&gt;'), 'Readable model names are escaped');
check(governorModelOptions([], 'retired').includes('retired (saved; unavailable'), 'Unavailable saved model stays selected');
check(!governorModelOptions([{ id: 'https://credentials.test' }], '').includes('credentials.test'), 'Malformed provider IDs excluded');
for (const outcome of ['ready', 'empty', 'error', 'mismatch', 'missing-provider', 'old-map', 'clear-during-load']) {
  h = harness();
  h.form.dataset.modelState = 'loading';
  h.form.dataset.mapMismatch = outcome === 'old-map' ? 'true' : 'false';
  for (const id of ['governor-model-status', 'governor-clear-models']) h.fields.set('#' + id, {});
  for (const id of ['governor-cheap-model', 'governor-frontier-model', 'governor-clear-models']) {
    const field = h.fields.get('#' + id);
    field.disabled = id !== 'governor-clear-models';
    field.addEventListener = (event, handler) => { field[event] = handler; };
  }
  h.fields.get('#governor-cheap-model').value = outcome === 'old-map' ? '' : 'retired';
  h.fields.get('#governor-frontier-model').value = outcome === 'old-map' ? '' : 'small';
  let resolve;
  const promise = loadRouterModels(h.form, () => new Promise(r => { resolve = r; }));
  if (outcome === 'clear-during-load') h.fields.get('#governor-clear-models').click();
  resolve({ ok: outcome !== 'error', data: { provider: outcome === 'mismatch' ? 'openai' : outcome === 'missing-provider' ? undefined : 'claude', models: outcome === 'empty' ? [] : [{ id: 'small', name: 'Small Model' }] } });
  await promise;
  const status = h.fields.get('#governor-model-status').textContent;
  if (outcome === 'mismatch') {
    check(h.form.dataset.modelState === 'stale' && h.fields.get('#governor-clear-models').disabled, 'Provider race disables stale clear');
    assert.throws(() => governorPayload(h.form), /provider changed/); passed++;
  } else if (['error', 'missing-provider'].includes(outcome)) {
    check(status.includes('could not be loaded') && h.fields.get('#governor-cheap-model').disabled, `${outcome}: safe error and disabled selects`);
  } else if (outcome === 'empty') {
    check(status.includes('No models') && h.fields.get('#governor-cheap-model').disabled, 'Empty state preserves saved choices');
  } else {
    check(!h.fields.get('#governor-cheap-model').disabled && h.fields.get('#governor-cheap-model').innerHTML.includes('Small Model'), `${outcome}: dropdowns load readable names`);
    if (outcome === 'old-map') check(status.includes('Choose both'), 'Mismatched map requires explicit replacement');
    if (outcome === 'clear-during-load') check(status.includes('remove') && h.fields.get('#governor-cheap-model').value === '', 'Late lookup does not undo explicit clear');
  }
  if (outcome !== 'mismatch') check(Object.hasOwn(governorPayload(h.form), 'governor.model_map') === (outcome === 'clear-during-load'), `${outcome}: no accidental map mutation`);
}
for (const outcome of ['success','config','forbidden','network']) {
  h=harness(); h.fields.get('#governor-key').value=secret;
  let sent, reloads=0;
  bindRouterSettings(h.container,{getRole:()=> 'owner', put:async(path,body)=>{ sent=structuredClone(body); check(path==='/settings','Existing settings API'); if(outcome==='network')throw new Error(secret); return { ok:outcome==='success', error:{code:outcome==='config'?'governor_configuration':'forbidden',message:secret} }; },reload:async()=>{reloads++;}});
  await h.submit();
  check(sent['governor.typesafe_api_key']===secret,'Key sent only in PUT payload');
  check(h.fields.get('#governor-key').value==='','Transient key cleared on every outcome');
  check(!h.fields.get('#governor-save-status').textContent.includes(secret),'Server/transport error cannot echo key');
  check(reloads===(outcome==='success'?1:0),'Only successful save reloads');
  check(h.fields.get('button[type="submit"]').disabled===false,'Save unlocks after response');
  if(outcome==='config')check(h.fields.get('#governor-save-status').textContent.includes('readable TypeSafe key'),'Config error actionable');
  if(outcome==='network')check(h.fields.get('#governor-save-status').textContent.includes('Could not confirm'),'Uncertain network outcome honest');
}
// Exercise the real adapter: a committed PUT can lose its response or receive
// invalid JSON, which api.put normalizes into a returned network_error.
const originalGlobals = Object.fromEntries(['fetch', 'window', 'localStorage'].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
try {
  globalThis.window = {};
  globalThis.localStorage = { getItem: () => null };
  const { api } = await import('../ui/api.js');
  for (const outcome of ['lost-response', 'invalid-json', 'truncated-json', 'forbidden', 'config']) {
    h = harness();
    h.fields.get('#governor-key').value = secret;
    h.fields.get('#governor-enabled').checked = true;
    let committed, requestBody, response, reloads = 0, requests = 0;
    const uncertain = !['forbidden', 'config'].includes(outcome);
    globalThis.fetch = async (url, options) => {
      requests++;
      check(url === '/_studio/api/router.php?_path=%2Fsettings' && options.method === 'PUT', 'Real adapter sends settings PUT');
      const received = JSON.parse(options.body);
      check(received['governor.typesafe_api_key'] === secret, 'Transient key reaches simulated server only in body');
      if (!uncertain) return new Response(JSON.stringify({ ok: false, error: { code: outcome === 'config' ? 'governor_configuration' : 'forbidden', message: secret } }), { status: outcome === 'config' ? 422 : 403 });
      committed = structuredClone(received);
      if (outcome === 'lost-response') throw new TypeError(secret);
      return new Response(outcome === 'invalid-json' ? '<html>Bad gateway</html>' : '{"ok":true,"data":', { status: 200 });
    };
    bindRouterSettings(h.container, {
      getRole: () => 'owner',
      put: async (path, body) => { requestBody = body; response = await api.put(path, body); return response; },
      reload: async () => { reloads++; },
    });
    await h.submit();
    const message = h.fields.get('#governor-save-status').textContent;
    check(requests === 1 && reloads === 0, 'Failed response neither retries nor reloads automatically');
    check(h.fields.get('#governor-key').value === '' && !Object.hasOwn(requestBody, 'governor.typesafe_api_key'), 'Input and request object release transient key');
    check(!message.includes(secret), 'Adapter failure never displays secret');
    check(!h.fields.get('button[type="submit"]').disabled, 'Adapter failure unlocks save');
    if (uncertain) {
      check(committed?.['governor.mode'] === 'enforce' && committed?.['governor.typesafe_api_key'] === secret, 'Simulated server committed settings before response failure');
      check(response.error?.code === 'network_error', 'Real adapter normalizes response failure');
      check(message.includes('Could not confirm') && message.includes('Reload Settings') && message.includes('check the stored configuration') && !message.includes('were not saved'), `${outcome}: committed save is uncertain and requires verification`);
    } else {
      check(!committed, 'Definitive rejection did not commit');
      check(message.includes(outcome === 'config' ? 'readable TypeSafe key' : 'were not saved'), 'Definitive rejection retains actionable failure message');
    }
  }
} finally {
  for (const [name, descriptor] of Object.entries(originalGlobals)) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else delete globalThis[name];
  }
}
for(const role of ['editor','viewer']) {
  h=harness(); bindRouterSettings(h.container,{getRole:()=>role,put:()=>{throw new Error('Unauthorized write');}});
  check(!h.form.submit,`${role} has no save handler`);
}
h=harness();let role='owner',writes=0;
bindRouterSettings(h.container,{getRole:()=>role,put:()=>writes++});role='editor';await h.submit();
check(writes===0,'Role rechecked at submit');
console.log(`Passed: ${passed}\nFailed: 0`);
