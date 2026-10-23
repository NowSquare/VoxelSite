import assert from 'node:assert/strict';
import { test } from 'node:test';
import { webcrypto } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// Exercise real History handlers at the DOM/API boundary without a browser or host writes.
const nodes = new Map();
const button = dataset => ({ dataset, value: '', handlers: {}, classList: { add() {}, remove() {} }, addEventListener(type, handler) { this.handlers[type] = handler; }, click() { return this.handlers.click?.(); }, remove() { nodes.delete(this.id); } });
const history = button({ tab: 'history' });
const gallery = button({ tab: 'gallery' });
const inspect = button({});
const restore = button({});
const list = { innerHTML: '', querySelectorAll(selector) {
  if (selector === '[data-inspect-id]') { inspect.dataset = { inspectId: this.innerHTML.match(/data-inspect-id="([^"]+)"/)[1] }; return [inspect]; }
  if (selector === '[data-restore-id]') {
    const match = this.innerHTML.match(/data-restore-id="([^"]+)" data-domains="([^"]+)"/);
    restore.dataset = { restoreId: match[1], domains: match[2] }; return [restore];
  }
  return [];
} };
nodes.set('designs-content', { innerHTML: '' }); nodes.set('snapshots-list', list);
const stored = new Map();
globalThis.window = {};
globalThis.crypto ??= webcrypto;
globalThis.localStorage = { getItem: () => null };
globalThis.sessionStorage = { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) };
globalThis.requestAnimationFrame = callback => callback();
globalThis.document = {
  createElement() { return { ...button({}), querySelector() { return null; }, appendChild() {}, _html: '', get innerHTML() { return this._html; }, set innerHTML(value) {
    this._html = value;
    for (const match of value.matchAll(/id="([^"]+)"/g)) {
      const element = button({}); element.id = match[1]; element.value = match[1] === 'snap-restore-domain' ? 'draft' : ''; nodes.set(match[1], element);
    }
  }, set textContent(value) { this._html = String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); } }; },
  getElementById: id => nodes.get(id) ?? null,
  querySelectorAll: () => [gallery, history],
  addEventListener() {}, removeEventListener() {},
  body: { appendChild(node) { nodes.set(node.id, node); } },
};
const snapshot = { snapshot_id: 'snapshot_1234', label: 'Before Site apply', domains: ['draft', 'published'], format: 3,
  file_count: 4, bytes: 1024, created_at: '2026-10-20T09:00:00Z', protected: true, validity: 'valid', excluded_domains: ['submissions', 'secrets', 'Action definitions'], diagnostics: [] };
const { api } = await import('../ui/api.js');
api.get = async path => ({ ok: true, data: path.startsWith('/snapshots?')
  ? { snapshots: [snapshot], total: 1, next_offset: null, inventory_version: 'a'.repeat(64) }
  : path.endsWith('/inspect') ? snapshot : { designs: [] } });
const calls = [];
let loseApply = false;
api.post = async (path, body) => {
  calls.push({ path, body });
  if (path.endsWith('/prepare-restore')) return { ok: true, data: { plan_id: 'restore_1234', digest: 'b'.repeat(64), domain: body.domain,
    files: [{ path: 'index.php', domain: body.domain, action: 'write' }], safety_snapshot_id: 'safety_1234', excluded_domains: ['submissions', 'secrets'] } };
  if (loseApply) return { ok: false, error: { code: 'network_error', message: 'Connection lost' } };
  return { ok: true, data: { operation: { status: 'succeeded', result: {} } } };
};
const { renderDesignsView } = await import('../ui/src/views/designs.js');
renderDesignsView();
await new Promise(resolve => setTimeout(resolve, 0));
history.click();
await new Promise(resolve => setTimeout(resolve, 0));

test('History shows modern identity, captured domains, and protected retention', () => {
  assert.match(list.innerHTML, /Before Site apply/);
  assert.match(list.innerHTML, /snapshot_1234/);
  assert.match(list.innerHTML, /Draft \+ Published/);
  assert.match(list.innerHTML, /Retained for history/);
  assert.doesNotMatch(list.innerHTML, /data-delete-snap-id/);
});

test('Details verify selected archive and display explicit domain exclusions', async () => {
  await inspect.click();
  const details = nodes.get('vs-snapshot-preview-overlay').innerHTML;
  assert.match(details, /snapshot_1234/);
  assert.match(details, /Draft \+ Published/);
  assert.match(details, /submissions, secrets, Action definitions/);
  assert.match(details, />valid<\/dd>/);
});

test('Restore selects a domain and reviews affected files before any apply request', async () => {
  restore.click();
  const modal = nodes.get('vs-snapshot-restore-overlay').innerHTML;
  assert.match(modal, /Draft only preserves the live website/);
  assert.match(modal, /Published only preserves your newer draft/);
  nodes.get('snap-restore-domain').value = 'published';
  await nodes.get('snap-restore-submit').click();
  assert.equal(calls.length, 1);
  assert.match(calls[0].path, /prepare-restore$/);
  assert.equal(calls[0].body.domain, 'published');
  assert.match(nodes.get('snap-restore-review').innerHTML, /index.php/);
  assert.match(nodes.get('snap-restore-review').innerHTML, /safety_1234/);
  assert.equal(nodes.get('snap-restore-submit').textContent, 'Restore live website');
});

test('Lost apply response keeps its review and operation identity when the dialog reopens', async () => {
  loseApply = true;
  await nodes.get('snap-restore-submit').click();
  assert.equal(calls.length, 2);
  const original = calls[1].body;
  restore.click();
  assert.match(nodes.get('vs-snapshot-restore-overlay').innerHTML, /Continue restoration/);
  loseApply = false;
  await nodes.get('snap-restore-submit').click();
  assert.equal(calls.length, 3);
  assert.deepEqual(calls[2].body, original);
  assert.equal(calls[2].body.plan_id, 'restore_1234');
});


const deleteViewSource = (await readFile(new URL('../ui/src/views/designs.js', import.meta.url), 'utf8'))
  .replace(/^import .*;\n/gm, '').replaceAll('export ', '');
const modalSource = (await readFile(new URL('../ui/src/ui/modals.js', import.meta.url), 'utf8'))
  .replace(/^import .*;\n/gm, '').replaceAll('export ', '');

function deletionFocusFixture() {
  const id = 'snapshot_' + 'a'.repeat(32), handlers = new Map(), timers = [], reads = [];
  const document = { activeElement: null, body: {} };
  const element = dataset => ({ dataset, isConnected: true, disabled: false,
    classList: { add() {}, remove() {} }, addEventListener() {},
    focus() { if (this.isConnected) document.activeElement = this; } });
  const original = element({ deleteSnapId: id }); document.activeElement = original;
  const originalHistory = { isConnected: true }; let currentHistory = originalHistory;
  const close = element({}), confirm = element({}), status = element({});
  const overlay = {
    isConnected: false, classList: { add() {}, remove() {} }, addEventListener() {},
    contains(node) { return [close, confirm, status].includes(node); },
    querySelector(selector) { return ({ '[data-delete-close]': close, '[data-delete-confirm]': confirm, '[data-delete-status]': status })[selector]; },
    querySelectorAll() { return [close, confirm]; },
    remove() { this.isConnected = false; if (this.contains(document.activeElement)) document.activeElement = document.body; },
  };
  document.getElementById = key => key === 'designs-content' ? currentHistory
    : key === 'vs-snapshot-delete-overlay' && overlay.isConnected ? overlay : null;
  document.createElement = () => overlay;
  document.body.appendChild = () => { overlay.isConnected = true; };
  document.addEventListener = (name, handler) => handlers.set(name, handler);
  document.removeEventListener = (name, handler) => { if (handlers.get(name) === handler) handlers.delete(name); };
  let finish;
  const operation = new Promise(resolve => { finish = resolve; });
  const context = vm.createContext({ document, URLSearchParams,
    requestAnimationFrame: callback => callback(), setTimeout: callback => { timers.push(callback); },
    escapeHtml: value => String(value), escapeAttr: value => String(value), showToast() {},
    pendingOperationInput: () => null, apiOperation: () => operation,
    api: { get: async path => {
      reads.push(path);
      return { ok: true, data: { protected: false, version: 'b'.repeat(64), files: [], bytes: 0 } };
    } },
  });
  vm.runInContext(modalSource + '\n' + deleteViewSource, context);
  return { document, overlay, original, reads,
    open: () => context.showSnapshotDeleteModal(id),
    replaceHistory(kind = 'delete') {
      original.isConnected = false; originalHistory.isConnected = false;
      const replacement = element(kind === 'pending' ? { pendingDelete: id } : { deleteSnapId: id });
      const create = element({});
      currentHistory = { isConnected: true,
        querySelectorAll(selector) {
          assert.equal(selector, '[data-delete-snap-id], [data-pending-delete]', 'snapshot IDs must not enter CSS selectors');
          return [element({ deleteSnapId: 'different-snapshot' }), ...(kind === 'absent' ? [] : [replacement])];
        },
        querySelector(selector) { assert.equal(selector, '#btn-create-snapshot'); return create; },
      };
      return kind === 'absent' ? create : replacement;
    },
    escape() { handlers.get('keydown')({ key: 'Escape', preventDefault() {} }); },
    finishAnimation() { for (const timer of timers.splice(0)) timer(); },
    elsewhere() { const target = element({}); target.focus(); return target; },
    beginDelete() { return confirm.onclick({ currentTarget: confirm }); },
    finishDelete() { finish({ ok: true }); },
  };
}

for (const kind of ['delete', 'pending', 'absent']) {
  test(`Snapshot Escape returns to the current History ${kind} target after responsive rerender`, async () => {
    const f = deletionFocusFixture(); await f.open();
    const current = f.replaceHistory(kind);
    f.escape(); f.finishAnimation();
    assert.equal(f.overlay.isConnected, false);
    assert.equal(f.document.activeElement, current);
    assert.equal(f.reads.length, 1, 'closing never reloads or deletes the archive');
  });
}

test('Snapshot Escape after rerender preserves focus deliberately moved outside its dialog', async () => {
  const f = deletionFocusFixture(); await f.open(); f.replaceHistory();
  const elsewhere = f.elsewhere();
  f.escape(); f.finishAnimation();
  assert.equal(f.document.activeElement, elsewhere);
});

test('Late snapshot deletion response cannot refocus or reload a replacement History after Escape', async () => {
  const f = deletionFocusFixture(); await f.open();
  const pending = f.beginDelete(); f.replaceHistory(); f.escape();
  const elsewhere = f.elsewhere();
  f.finishDelete(); await pending; f.finishAnimation();
  assert.equal(f.document.activeElement, elsewhere);
  assert.equal(f.reads.length, 1, 'old container must not trigger a new history load');
});
