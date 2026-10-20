import assert from 'node:assert/strict';
import { test } from 'node:test';

// Exercise the real Designs event handlers with a small DOM boundary double.
const nodes = new Map();
const button = dataset => ({ dataset, handlers: {}, classList: { add() {}, remove() {} }, addEventListener(type, handler) { this.handlers[type] = handler; }, click() { return this.handlers.click?.(); } });
const history = button({ tab: 'history' });
const gallery = button({ tab: 'gallery' });
const preview = button({});
const restore = button({});
const list = { innerHTML: '', querySelectorAll(selector) {
  if (selector === '[data-preview-id]') {
    const match = this.innerHTML.match(/data-preview-id="([^"]+)" data-snap='([^']+)'/);
    preview.dataset = { previewId: match[1], snap: match[2].replace(/&#39;/g, "'") };
    return [preview];
  }
  if (selector === '[data-restore-id]') { restore.dataset = { restoreId: this.innerHTML.match(/data-restore-id="([^"]+)"/)[1] }; return [restore]; }
  return [];
} };
nodes.set('designs-content', { innerHTML: '' }); nodes.set('snapshots-list', list);
globalThis.window = {};
globalThis.localStorage = { getItem: () => null };
globalThis.requestAnimationFrame = callback => callback();
globalThis.document = {
  createElement() { return { innerHTML: '', set textContent(value) { this.innerHTML = String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }, classList: { add() {}, remove() {} }, addEventListener() {}, remove() {} }; },
  getElementById: id => nodes.get(id) ?? null,
  querySelectorAll: () => [gallery, history],
  addEventListener() {}, removeEventListener() {},
  body: { appendChild(node) { nodes.set(node.id, node); } },
};
const { api } = await import('../ui/api.js');
api.get = async path => ({ ok: true, data: path === '/snapshots'
  ? { snapshots: [{ id: 42, label: 'Before Site apply', description: 'Recovery for reviewed Site plan', snapshot_type: 'auto', file_count: 4, size_bytes: 1024, created_at: '2026-10-20T09:00:00Z' }] }
  : { designs: [] } });
const { renderDesignsView } = await import('../ui/src/views/designs.js');
renderDesignsView();
await new Promise(resolve => setTimeout(resolve, 0));
history.click();
await new Promise(resolve => setTimeout(resolve, 0));

test('Labeled History rows expose the snapshot identity used by recovery errors', () => {
  assert.match(list.innerHTML, /Before Site apply/);
  assert.match(list.innerHTML, /Snapshot #42/);
});

test('History snapshot details retain the same visible snapshot identity', () => {
  preview.click();
  const details = nodes.get('vs-snapshot-preview-overlay').innerHTML;
  assert.match(details, /Snapshot #42/);
  assert.match(details, />#42<\/span>/);
  assert.match(details, /Before Site apply/);
});

test('Restore confirmation names the selected snapshot and the preview/shared-asset boundary', () => {
  restore.click();
  const confirmation = nodes.get('vs-confirm-overlay').innerHTML;
  assert.match(confirmation, /Restore snapshot #42/);
  assert.match(confirmation, /preview files and shared assets/);
  assert.match(confirmation, /PHP pages still need Publish/);
});
