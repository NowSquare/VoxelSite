import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const textEscape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const attrEscape = value => textEscape(value).replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const source = await readFile(new URL('../ui/src/views/settings-mcp.js', import.meta.url), 'utf8');
const context = vm.createContext({
  escapeHtml: textEscape, escapeAttr: attrEscape, Date, URLSearchParams,
  apiOperation: async () => { throw new Error('Unexpected operation'); }, pendingOperationInput: () => null,
  FormData: class { constructor(form) { this.fields = form.fields; } get(key) { return this.fields[key] ?? null; }
    getAll(key) { const value=this.fields[key]; return value===undefined?[]:Array.isArray(value)?value:[value]; } },
});
vm.runInContext(source.replace(/^import .*;\n/gm, '').replaceAll('export ', ''), context);
const data = {
  enabled: false, workspace_ready: true, configuration_override: false,
  endpoint: 'https://example.invalid/sub/_studio/mcp.php', billing: 'No VoxelSite provider calls.',
  accounts: [{ id: 1, name: 'Owner', role: 'owner' }, { id: 2, name: 'Viewer', role: 'viewer' }],
  connections: [{ id: 7, label: 'Reader " onclick="evil()', user_id: 1, scopes: ['site:read'], revoked_at: null, expires_at: null }],
  qualification: { status: 'unqualified', clients: [] }, rest_connections: [],
};
function element(value = '') {
  const classes = new Set();
  return { value, checked: false, disabled: false, type: '', textContent: '', isConnected: true, handlers: {},
    classList: { add: c => classes.add(c), remove: c => classes.delete(c), toggle: (c, enabled) => enabled ? classes.add(c) : classes.delete(c), contains: c => classes.has(c) },
    addEventListener(event, fn) { this.handlers[event] = fn; },
    fire(event) { return this.handlers[event]?.({ currentTarget: this, target: this, preventDefault() {} }); },
    reportValidity() { return true; }, focus() { this.focused = true; }, click() { return this.fire('click'); },
  };
}
function container() {
  const view = { isConnected: true, fields: {}, html: '',
    set innerHTML(html) {
      for (const field of Object.values(this.fields)) field.isConnected = false;
      this.html = html;
      this.fields = Object.fromEntries(['mcp-feedback','mcp-toggle','mcp-copy-endpoint','mcp-copy-secret','mcp-show-secret',
        'mcp-dismiss-secret','mcp-secret','mcp-secret-value','mcp-create','mcp-account','mcp-live-restore','mcp-label',
        'mcp-load-retry','mcp-config','mcp-setup-instructions','mcp-setup-docs','mcp-copy-config','mcp-copy-task','mcp-check-result','mcp-connection-options'].map(id => [id, element()]));
      this.fields['mcp-account'].value = '1';
      this.radios = ['read','edit','publish'].map(element);
      this.clients = ['codex','claude','other'].map(element);
      this.submit = element();
      this.claim = element(); this.claim.dataset = { mcpReveal: 'admin_fixture' };
      this.fields['mcp-create'].querySelector = () => this.submit;
      this.fields['mcp-create'].fields = { user_id: '1', preset: 'edit', label: 'New connection', expiry_days: '30' };
    },
    get innerHTML() { return this.html; },
    querySelector(selector) {
      if (selector === '[name="preset"][value="read"]') return this.radios[0];
      return this.fields[selector.slice(1)];
    },
    querySelectorAll(selector) { return selector === '[name="client"]' ? this.clients : selector === '[name="preset"]' ? this.radios :
      selector === '[data-mcp-reveal]' ? [this.claim] : []; },
  };
  return view;
}
test('Connection copy explains separate publish/live restore access and escapes attributes', () => {
  const html = context.renderMcpConnections(data, 1);
  assert.ok(html.includes('name="preset" value="edit" checked'));
  assert.ok(html.includes('Also allow restoring the live website'));
  assert.ok(html.includes('Your conversation stays in your AI tool'));
  assert.ok(html.includes('No qualified client run'));
  assert.ok(html.includes('aria-label="Revoke Reader &quot; onclick=&quot;evil()"'));
  assert.ok(!html.includes('aria-label="Revoke Reader " onclick="evil()'));
  assert.ok(html.includes('for="mcp-label"') && html.includes('aria-live="polite"'));
});
test('Demo connections are explicitly sample data without a qualification claim', () => {
  const html = context.renderMcpConnections({ ...data, demo: true, enabled: true,
    connections: [{ ...data.connections[0], label: 'Sample connection', connection_state: 'used', last_used_at: 1700000000 }] }, 1);
  assert.ok(html.includes('No real connection or credential exists'));
  assert.ok(html.includes('Sample last used'));
  assert.ok(!html.includes('No qualified client run') && !html.includes('Client compatibility qualified'));
  assert.match(html, /id="mcp-toggle"[^>]*disabled/);
  assert.match(html, /type="submit"[^>]*disabled/);
  assert.match(html, /data-mcp-revoke="7"[^>]*disabled/);
});
test('Demo connection handlers never send credential or configuration writes', async () => {
  const view = container(); let writes = 0;
  const write = async () => { writes++; throw new Error('Demo must not send a write'); };
  await context.bindMcpConnections(view, {
    api: { get: async () => ({ ok: true, data: { ...data, demo: true, enabled: true } }), post: write },
    operation: write, user: { id: 1, role: 'owner' }, clipboard: {},
  });
  await view.fields['mcp-toggle'].fire('click');
  await view.fields['mcp-create'].fire('submit');
  await view.claim.fire('click');
  assert.equal(writes, 0);
  assert.ok(view.fields['mcp-feedback'].textContent.includes('Demo'));
});
test('Non-owner UI makes no connection administration request', async () => {
  const view = container();
  await context.bindMcpConnections(view, {
    user: { id: 2, role: 'editor' }, clipboard: {},
    api: { get() { throw new Error('No owner query allowed'); } },
  });
  assert.ok(view.innerHTML.includes('Ask the site owner'));
});
test('Approved credential delivery lists metadata and a deliberate claim action', () => {
  const html=context.renderMcpConnections({...data,pending_secrets:[{
    plan_id:'admin_fixture',credential_id:11,label:'Reader <script>',audience:'studio_mcp',
  }]},1);
  assert.ok(html.includes('Reader &lt;script&gt;'));
  assert.ok(html.includes('data-mcp-reveal="admin_fixture"'));
  assert.ok(html.includes('Claim credential'));
  assert.ok(html.includes('If a response is lost, revoke that credential'));
  assert.ok(!html.includes('vxs_'));
});
test('Creation automatically reveals once after the durable receipt and dismissal clears it', async () => {
  const view = container(); const copied = []; const posts = [];
  const secret = 'vxs_disposable_ui_fixture_secret';
  const api = {
    get: async () => ({ ok: true, data }),
    post: async (path, body) => { posts.push({ path, body }); return { ok: true, data: path.endsWith('/reveal') ? { key: secret } : { plan_id: 'admin_fixture', operation: { status: 'succeeded' } } }; },
  };
  await context.bindMcpConnections(view, { api, operation: api.post, user: { id: 1, role: 'owner' }, clipboard: { writeText: async value => copied.push(value) } });
  await view.fields['mcp-copy-endpoint'].fire('click');
  assert.deepEqual(copied, [data.endpoint]);
  await view.fields['mcp-create'].fire('submit');
  assert.equal(posts[0].path, '/settings/mcp/connections');
  assert.equal(posts[0].body.preset, 'edit');
  assert.equal(posts[0].body.client_name, 'Codex');
  assert.equal(posts[0].body.live_restore, false);
  assert.equal(posts[0].body.access_groups.length, 0);
  assert.equal(posts[0].body.expiry_days, 30, 'Creation sends a duration to the server');
  assert.ok(!Object.hasOwn(posts[0].body, 'expires_at'), 'The browser clock cannot set credential expiry');
  assert.equal(posts[1].path, '/settings/mcp/approvals/admin_fixture/reveal');
  assert.equal(view.fields['mcp-secret-value'].value, secret);
  assert.ok(!JSON.stringify(posts).includes(secret), 'Mutation inputs and reveal requests contain no returned secret');
  assert.equal(view.fields['mcp-secret-value'].type, 'password');
  assert.ok(view.fields['mcp-secret-value'].focused);
  assert.ok(!view.innerHTML.includes(secret), 'Secret never enters generated HTML');
  await view.fields['mcp-copy-endpoint'].fire('click');
  assert.deepEqual(copied, [data.endpoint, data.endpoint], 'Shareable endpoint never includes the credential');
  await view.fields['mcp-copy-secret'].fire('click');
  assert.equal(copied.at(-1), secret);
  view.fields['mcp-show-secret'].checked = true;
  view.fields['mcp-show-secret'].fire('change');
  assert.equal(view.fields['mcp-secret-value'].type, 'text');
  const dismissed = view.fields['mcp-dismiss-secret'].fire('click');
  assert.equal(view.fields['mcp-secret-value'].value, '');
  await dismissed;
  assert.ok(!view.innerHTML.includes(secret));
  assert.ok(view.fields['mcp-check-result'].focused);
});
test('Selecting a viewer removes write and live restore selection', async () => {
  const view = container();
  await context.bindMcpConnections(view, { api: { get: async () => ({ ok: true, data }) },
    user: { id: 1, role: 'owner' }, clipboard: {} });
  view.fields['mcp-live-restore'].checked = true;
  view.fields['mcp-account'].value = '2';
  view.fields['mcp-account'].fire('change');
  assert.equal(view.fields['mcp-live-restore'].disabled, true);
  assert.equal(view.fields['mcp-live-restore'].checked, false);
  assert.equal(view.radios[0].checked, true);
  assert.equal(view.radios[1].disabled, true);
  assert.equal(view.radios[2].disabled, true);
});
test('External/later installer has no provider controls and no automatic model request', async () => {
  const installer = await readFile(new URL('../ui/pages/installer.js', import.meta.url), 'utf8');
  const calls = []; const root = { innerHTML: '' };
  const sandbox = vm.createContext({
    window: { location: { href: 'https://example.invalid/sub/_studio/install.php' } }, URL,
    document: { getElementById: () => root }, console, setTimeout,
    fetch: async (url, options) => { calls.push({ url, options }); return { text: async () => '{"ok":true}' }; },
  });
  vm.runInContext(installer.replace(/\ninit\(\);\s*$/, ''), sandbox);
  for (const mode of ['external', 'later']) {
    const html = vm.runInContext(`state.aiSetupMode = '${mode}'; renderStep2();`, sandbox);
    assert.ok(!html.includes('id="ai-api-key"'));
    assert.ok(!html.includes('id="btn-verify"'));
    assert.ok(html.includes('Continue'));
  }
  assert.equal(calls.length, 0);
  await vm.runInContext(`apiPost('/install/check')`, sandbox);
  assert.ok(calls[0].url.startsWith('/sub/_studio/api/router.php?'));
});

test('Client choices provide a site-based default label and secret-free setup', () => {
  const html = context.renderMcpConnections({ ...data, site_name: 'Bakery <East>' }, 1);
  for (const client of ['Codex', 'Claude Code', 'Other MCP client']) assert.ok(html.includes(client));
  assert.ok(html.includes('value="Codex · Bakery &lt;East&gt;"'));
  assert.ok(!html.includes('maxlength="100" required'));
  const codex = context.mcpClientSetup('codex', data.endpoint);
  assert.ok(codex.snippet.includes('bearer_token_env_var = "VOXELSITE_MCP_TOKEN"'));
  assert.ok(codex.snippet.includes(data.endpoint));
  const claude = context.mcpClientSetup('claude', data.endpoint);
  const config = JSON.parse(claude.snippet);
  assert.equal(config.mcpServers.voxelsite.type, 'http');
  assert.equal(config.mcpServers.voxelsite.headers.Authorization, 'Bearer ${VOXELSITE_MCP_TOKEN}');
  assert.ok(!codex.snippet.includes('vxs_') && !claude.snippet.includes('vxs_'));
  assert.ok(context.mcpClientSetup('other', data.endpoint).instructions.includes('Streamable HTTP'));
});
test('Every server-observed connection state includes a truthful next action', () => {
  const states = {
    waiting: ['Waiting for Codex to connect', 'View setup'],
    authenticated: ['Authenticated request received', 'Start the first task'],
    used: ['Last used', 'View permissions'],
    authentication_failed: ['Authentication failed', 'Review setup'],
    permission_denied: ['Insufficient permission', 'Choose a permitted task'],
    disabled: ['Connections are disabled', 'Enable connections'],
    revoked: ['Credential revoked', 'Create a replacement'],
    expired: ['Credential expired', 'Create a replacement'],
    unknown: ['Status unavailable', 'Check result'],
  };
  for (const [state, expected] of Object.entries(states)) {
    const html = context.renderMcpConnections({ ...data, enabled: true, connections: [{ ...data.connections[0],
      client_name: 'Codex', connection_state: state, disabled_reason: 'connections_disabled',
      first_authenticated_at: 1700000000, last_authenticated_at: 1700000100, last_used_at: 1700000200,
      last_auth_failure: { at: 1700000300, code: 'permission_denied' },
      last_permission_denial: { at: 1700000400, tool: 'site_publish_apply', required_scopes: ['site:publish'] },
    }] }, 1);
    for (const text of expected) assert.ok(html.includes(text), `${state}: ${text}`);
    assert.ok(!html.includes('Active session'));
  }
  const disabled = context.renderMcpConnections({ ...data, connections: [{ ...data.connections[0], connection_state: 'disabled', disabled_reason: 'account_inactive' }] }, 1);
  assert.ok(disabled.includes('Account is inactive') && disabled.includes('Choose an active account'));
});
test('Host setup and unknown results give useful actions without inventing a connection', () => {
  const html = context.renderMcpConnections({ ...data, workspace_ready: false, endpoint: null, connections: [] }, 1);
  assert.ok(html.includes('Finish private draft setup'));
  assert.ok(html.includes('Streamable HTTP'));
  assert.ok(html.includes('Check result'));
  assert.ok(html.includes('Read the website and summarize'));
  assert.ok(!html.includes(' · Active'));
});

test('Client switching updates default names and setup while preserving an edited name', async () => {
  const view = container(); const copied = [];
  await context.bindMcpConnections(view, { api: { get: async () => ({ ok: true, data: { ...data, site_name: 'Bakery' } }) },
    user: { id: 1, role: 'owner' }, clipboard: { writeText: async text => copied.push(text) } });
  assert.equal(view.fields['mcp-label'].value, 'Codex · Bakery');
  view.clients[1].checked = true; await view.clients[1].fire('change');
  assert.equal(view.fields['mcp-label'].value, 'Claude Code · Bakery');
  assert.equal(JSON.parse(view.fields['mcp-config'].value).mcpServers.voxelsite.headers.Authorization, 'Bearer ${VOXELSITE_MCP_TOKEN}');
  view.fields['mcp-label'].value = 'Agency assistant';
  view.clients[0].checked = true; await view.clients[0].fire('change');
  assert.equal(view.fields['mcp-label'].value, 'Agency assistant');
  await view.fields['mcp-copy-config'].fire('click');
  assert.ok(copied[0].includes('bearer_token_env_var'));
  assert.equal(view.fields['mcp-feedback'].textContent, 'Configuration copied.');
  assert.ok(!view.fields['mcp-feedback'].textContent.includes('connected'));
});
test('An uncertain creation retries the retained input instead of a newly edited form', async () => {
  const view = container(); let retained = null; const calls = []; let reveals = 0;
  const api = { get: async () => ({ ok: true, data }), post: async () => { reveals++; return { ok: true, data: { key: 'disposable_secret' } }; } };
  const operation = async (path, body) => {
    calls.push(structuredClone(body));
    if (calls.length === 1) { retained = structuredClone(body); throw new Error('Lost acknowledgement'); }
    assert.deepEqual(body, retained); retained = null;
    return { ok: true, data: { plan_id: 'retained_plan', operation: { status: 'succeeded' } } };
  };
  await context.bindMcpConnections(view, { api, operation, pending: () => retained, user: { id: 1, role: 'owner' }, clipboard: {} });
  await view.fields['mcp-create'].fire('submit');
  assert.equal(reveals, 0);
  assert.equal(view.submit.textContent, 'Retry creation');
  assert.ok(view.fields['mcp-feedback'].textContent.includes('same request'));
  view.fields['mcp-create'].fields.label = 'Different input';
  await view.fields['mcp-create'].fire('submit');
  assert.deepEqual(calls[1], calls[0]); assert.equal(reveals, 1);
});
test('Parallel submissions allocate one creation and reveal once', async () => {
  const view = container(); let finish; let creates = 0; let reveals = 0;
  await context.bindMcpConnections(view, { api: { get: async () => ({ ok: true, data }), post: async () => { reveals++; return { ok: true, data: { key: 'disposable_secret' } }; } },
    operation: () => { creates++; return new Promise(resolve => { finish = resolve; }); }, user: { id: 1, role: 'owner' }, clipboard: {} });
  const first = view.fields['mcp-create'].fire('submit'); await view.fields['mcp-create'].fire('submit');
  finish({ ok: true, data: { plan_id: 'only_plan' } }); await first;
  assert.equal(creates, 1); assert.equal(reveals, 1);
});
test('Lost one-time reveal asks for result inspection without automatic reveal retry', async () => {
  const view = container(); let reveals = 0;
  await context.bindMcpConnections(view, { api: { get: async () => ({ ok: true, data }), post: async () => { reveals++; throw new Error('Lost secret response'); } },
    operation: async () => ({ ok: true, data: { plan_id: 'claimed_plan' } }), user: { id: 1, role: 'owner' }, clipboard: {} });
  await view.fields['mcp-create'].fire('submit');
  assert.equal(reveals, 1); assert.equal(view.fields['mcp-secret-value'].value, '');
  assert.ok(view.fields['mcp-feedback'].textContent.includes('Check result before retrying'));
  assert.ok(view.fields['mcp-feedback'].textContent.includes('revoke it and create a replacement'));
  assert.equal(view.submit.disabled, true); assert.ok(view.fields['mcp-check-result'].focused);
});
test('Already-claimed credentials show replacement guidance and never expose an empty secret', async () => {
  const view = container();
  await context.bindMcpConnections(view, { api: { get: async () => ({ ok: true, data }), post: async () => ({ ok: false, error: { code: 'secret_unavailable' } }) },
    operation: async () => ({ ok: true, data: { plan_id: 'claimed_plan' } }), user: { id: 1, role: 'owner' }, clipboard: {} });
  await view.fields['mcp-create'].fire('submit');
  assert.equal(view.fields['mcp-secret-value'].value, '');
  assert.ok(view.fields['mcp-feedback'].textContent.includes('cannot be shown again'));
});
test('Refresh or another mutation cannot discard a visible one-time secret', async () => {
  const view = container(); let gets = 0; let operations = 0;
  await context.bindMcpConnections(view, { api: { get: async () => { gets++; return { ok: true, data }; }, post: async () => ({ ok: true, data: { key: 'disposable_secret' } }) },
    operation: async () => { operations++; return { ok: true, data: { plan_id: 'new_plan' } }; }, user: { id: 1, role: 'owner' }, clipboard: {} });
  await view.fields['mcp-create'].fire('submit');
  await view.fields['mcp-check-result'].fire('click');
  await view.fields['mcp-toggle'].fire('click');
  assert.equal(gets, 1); assert.equal(operations, 1);
  assert.equal(view.fields['mcp-secret-value'].value, 'disposable_secret');
});
test('A failed refresh preserves the last known status and gives a retry action', async () => {
  const view = container(); let gets = 0;
  await context.bindMcpConnections(view, { api: { get: async () => ++gets === 1 ? { ok: true, data } : { ok: false, error: { code: 'network_error' } } },
    user: { id: 1, role: 'owner' }, clipboard: {} });
  const html = view.innerHTML;
  await view.fields['mcp-check-result'].fire('click');
  assert.equal(view.innerHTML, html);
  assert.ok(view.fields['mcp-feedback'].textContent.includes('Last known states'));
});
test('Connection state comes from the server and is independent of the browser clock', () => {
  const html = context.renderMcpConnections({ ...data, enabled: true, connections: [{ ...data.connections[0], connection_state: 'waiting', expires_at: 1 }] }, 1);
  assert.ok(html.includes('Waiting for your AI tool to connect'));
  assert.ok(!html.includes('Credential expired'));
  assert.ok(!source.includes('localStorage') && !source.includes('sessionStorage'));
});

test('Known authentication failures explain their bounded cause without reflecting secrets', () => {
  const causes = { audience_mismatch: 'wrong interface', credential_revoked: 'has been revoked', credential_expired: 'has expired', account_inactive: 'is inactive' };
  for (const [code, text] of Object.entries(causes)) {
    const html = context.renderMcpConnections({ ...data, connections: [{ ...data.connections[0], connection_state: 'authentication_failed', last_auth_failure: { code, at: 1700000000 } }] }, 1);
    assert.ok(html.includes(text));
  }
});
test('A stale response after leaving the view cannot reveal a credential', async () => {
  const view = container(); let finish; let reveals = 0;
  await context.bindMcpConnections(view, { api: { get: async () => ({ ok: true, data }), post: async () => { reveals++; return { ok: true, data: { key: 'disposable_secret' } }; } },
    operation: () => new Promise(resolve => { finish = resolve; }), user: { id: 1, role: 'owner' }, clipboard: {} });
  const creation = view.fields['mcp-create'].fire('submit'); view.innerHTML = '<p>Different view</p>';
  finish({ ok: true, data: { plan_id: 'new_plan' } }); await creation;
  assert.equal(reveals, 0); assert.equal(view.fields['mcp-secret-value'].value, '');
});
test('A stale secret response after rerender is discarded', async () => {
  const view = container(); let finish; let started;
  const revealing = new Promise(resolve => { started = resolve; });
  await context.bindMcpConnections(view, { api: { get: async () => ({ ok: true, data }), post: () => new Promise(resolve => { finish = resolve; started(); }) },
    operation: async () => ({ ok: true, data: { plan_id: 'new_plan' } }), user: { id: 1, role: 'owner' }, clipboard: {} });
  const creation = view.fields['mcp-create'].fire('submit'); await revealing;
  view.innerHTML = '<p>Different view</p>'; finish({ ok: true, data: { key: 'disposable_secret' } }); await creation;
  assert.equal(view.fields['mcp-secret-value'].value, '');
});
test('Qualification text follows the versioned backend record', () => {
  const html = context.renderMcpConnections({ ...data, qualification: { schema_version: 1, product_version: '9.8.7', status: 'qualified' } }, 1);
  assert.ok(html.includes('Client compatibility qualified for 9.8.7'));
  assert.ok(!html.includes('No qualified client run'));
});

test('An in-flight result check cannot race credential creation and erase its secret', async () => {
  const view = container(); let finish; let gets = 0; let creates = 0;
  await context.bindMcpConnections(view, { api: {
    get: async () => ++gets === 1 ? { ok: true, data } : new Promise(resolve => { finish = resolve; }),
    post: async () => ({ ok: true, data: { key: 'disposable_secret' } }),
  }, operation: async () => { creates++; return { ok: true, data: { plan_id: 'new_plan' } }; },
  user: { id: 1, role: 'owner' }, clipboard: {} });
  const checking = view.fields['mcp-check-result'].fire('click');
  await view.fields['mcp-create'].fire('submit');
  const createdDuringCheck = creates;
  finish({ ok: true, data }); await checking;
  assert.equal(createdDuringCheck, 0);
});
