import assert from 'node:assert/strict';
import { test } from 'node:test';
import { factoryClient, renderFactoryReview, showFactoryResetReview } from '../ui/src/factory-reset-workspace.js';
const id = 'factory_' + 'a'.repeat(32), digest = 'b'.repeat(64);
const memory = () => { const data = new Map(); return { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }; };
const review = { plan_id: id, digest, status: 'ready', review: { summary: '<script>unsafe</script>', final_boundary: 'Studio completion required.',
  files: [{ path: 'published/<img>.php', effect: 'delete', before_hash: 'before', after_hash: null }], tables: [], preserved: ['Library'] } };
test('Exact installation review escapes filenames and includes preserved data and boundary', () => {
  const html = renderFactoryReview(review);
  assert.match(html, /&lt;script&gt;unsafe/); assert.match(html, /published\/&lt;img&gt;\.php/);
  assert.match(html, /before/); assert.match(html, /Library/); assert.match(html, /Studio completion required/);
});
test('Lost activation response retains the same scoped capability across reloads', async () => {
  const storage = memory(), calls = [];
  const api = { get: async () => ({ ok: true, data: { draft_version: 'draft:0' } }),
    post: async (path, body) => { calls.push([path, body]); if (path.endsWith('/prepare')) return { ok: true, data: review }; throw new Error('Lost response'); } };
  const first = factoryClient({ api, endpoint: '/_studio/factory-reset.php', storage });
  await first.prepare(); await assert.rejects(first.start(), /Lost response/);
  const second = factoryClient({ api, endpoint: '/_studio/factory-reset.php', storage });
  assert.match(second.read().token, /^[a-f0-9]{64}$/); assert.equal(second.read().started, true);
  await assert.rejects(second.start(), /Lost response/);
  assert.deepEqual(calls[1], calls[2]);
});
test('Known review rejection leaves the review available for explicit discard', async () => {
  const storage = memory();
  const api = { get: async () => ({ ok: true, data: { draft_version: 'draft:0' } }), post: async path => path.endsWith('/prepare')
    ? { ok: true, data: review } : { ok: false, error: { code: 'review_expired', message: 'Expired' } } };
  const client = factoryClient({ api, endpoint: '/_studio/factory-reset.php', storage });
  await client.prepare(); await assert.rejects(client.start(), /Expired/); assert.equal(client.read().started, false);
});
test('Status uses a header-only secret and never mutates through GET', async () => {
  const storage = memory(), calls = [];
  const request = async (url, input) => { calls.push([url, input]); return { json: async () => ({ ok: true, data: { status: 'applying', checkpoint: 0 } }) }; };
  const client = factoryClient({ endpoint: '/_studio/factory-reset.php', storage, request });
  client.importReceipt({ plan_id: id, token: 'f'.repeat(64) }); await client.status();
  assert.equal(calls.length, 1); assert.equal(calls[0][1].method, 'GET');
  assert.ok(!calls[0][0].includes('f'.repeat(64))); assert.equal(calls[0][1].headers['X-VS-Reset-Token'], 'f'.repeat(64));
  assert.equal(calls[0][1].credentials, 'omit');
});
test('An explicit continuation has a bounded request count and preserves recovery required', async () => {
  const storage = memory(); let posts = 0;
  const request = async (url, input) => ({ json: async () => ({ ok: true, data: input.method === 'GET'
    ? { status: 'applying', checkpoint: posts } : { status: ++posts === 2 ? 'recovery_required' : 'applying', checkpoint: posts } }) });
  const client = factoryClient({ endpoint: '/_studio/factory-reset.php', storage, request });
  client.importReceipt({ plan_id: id, token: 'f'.repeat(64) });
  assert.equal((await client.advance()).status, 'recovery_required'); assert.equal(posts, 2);
  assert.equal(client.read().state.status, 'recovery_required');
});
test('Terminal receipt with a retained maintenance marker can explicitly finish marker cleanup', async () => {
  const storage = memory(); let posts = 0;
  const request = async (url, input) => ({ json: async () => ({ ok: true, data: { status: 'succeeded', checkpoint: 5,
    maintenance_active: input.method === 'GET' ? true : !(++posts) } }) });
  const client = factoryClient({ endpoint: '/_studio/factory-reset.php', storage, request });
  client.importReceipt({ plan_id: id, token: 'f'.repeat(64) });
  assert.equal((await client.advance()).maintenance_active, false); assert.equal(posts, 1);
});

// Exercise the real modal handlers with the DOM operations used by this view.
// Actual viewport layout remains a browser check; these tests model node replacement on resize.
async function withFactoryModal(run, discardResponse = async () => ({ ok: true, data: { complete: true } })) {
  const saved = new Map(['document', 'sessionStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const calls = [], nodes = new Map(), handlers = new Map();
  const document = { activeElement: null, body: {} };
  const control = id => ({ id, isConnected: true, disabled: false, textContent: '',
    focus() { if (this.isConnected) document.activeElement = this; } });
  const original = control('btn-reset-install');
  nodes.set(original.id, original); document.activeElement = original;
  const controls = new Map(['factory-review-message', 'factory-start', 'factory-confirm', 'factory-close', 'factory-review']
    .map(id => [id, control(id)]));
  const overlay = {
    isConnected: false, innerHTML: '',
    querySelector(selector) { return controls.get(selector.slice(1)); },
    querySelectorAll() { return [...controls.values()]; },
    addEventListener(name, handler) { handlers.set(name, handler); },
    contains(element) { return [...controls.values()].includes(element); },
    remove() {
      this.isConnected = false;
      if (this.contains(document.activeElement)) document.activeElement = document.body;
      for (const element of controls.values()) element.isConnected = false;
    },
  };
  document.createElement = () => overlay;
  document.getElementById = id => id === overlay.id ? (overlay.isConnected ? overlay : null) : nodes.get(id) || null;
  document.body.appendChild = element => { element.isConnected = true; };
  globalThis.document = document; globalThis.sessionStorage = memory();
  const api = {
    get: async () => ({ ok: true, data: { draft_version: 'draft:0' } }),
    post: async (path, body) => {
      calls.push({ path, body });
      if (path.endsWith('/prepare')) return { ok: true, data: { ...review, expires_at: 2_000_000_000 } };
      if (path.endsWith('/discard')) return discardResponse();
      throw new Error('This modal regression must never start installation removal.');
    },
  };
  try {
    await showFactoryResetReview({ api, completionUrl: '/_studio/factory-reset.php' });
    await run({ document, overlay, original, calls, controls,
      replaceTrigger(present = true) {
        original.isConnected = false;
        if (!present) { nodes.delete(original.id); return null; }
        const replacement = control(original.id); nodes.set(original.id, replacement); return replacement;
      },
      elsewhere() { const target = control('another-setting'); target.focus(); return target; },
      escape() { handlers.get('keydown')({ key: 'Escape', preventDefault() {} }); },
    });
    assert.ok(calls.every(call => /\/(prepare|discard)$/.test(call.path)), 'no reset activation request');
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

for (const triggerState of ['original', 'replaced', 'removed']) {
  test(`Escape closes the prepared factory review with its trigger ${triggerState}`, async () => {
    await withFactoryModal(({ document, overlay, original, replaceTrigger, escape }) => {
      const target = triggerState === 'original' ? original : replaceTrigger(triggerState === 'replaced');
      escape();
      assert.equal(overlay.isConnected, false);
      assert.equal(document.activeElement, target || document.body);
    });
  });
}

test('A completed discard cannot steal focus after Escape already closed the review', async () => {
  let finish;
  const response = new Promise(resolve => { finish = resolve; });
  await withFactoryModal(async ({ document, controls, escape, elsewhere, calls }) => {
    const pending = controls.get('factory-close').onclick();
    escape();
    const target = elsewhere();
    finish({ ok: true, data: { complete: true } });
    await pending;
    assert.equal(document.activeElement, target);
    assert.equal(calls.filter(call => call.path.endsWith('/discard')).length, 1);
  }, () => response);
});

test('Factory review footer allows its two actions to wrap at narrow widths', async () => {
  await withFactoryModal(({ overlay }) => {
    assert.match(overlay.innerHTML, /class="vs-modal-footer flex-wrap"/);
  });
});
