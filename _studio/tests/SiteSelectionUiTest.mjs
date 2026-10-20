import assert from 'node:assert/strict';
import { test } from 'node:test';

const values = new Map();
globalThis.localStorage = globalThis.sessionStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: key => values.delete(key),
};
globalThis.document = {
  createElement() {
    return { set textContent(value) { this.innerHTML = String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); } };
  },
};
globalThis.window = {};

const state = await import('../ui/src/views/site-control/state.js');
const nav = await import('../ui/src/views/site-control/structure-nav.js');
const canvas = await import('../ui/src/views/site-control/canvas.js');
const page = { id: 'page:services/about.php', type: 'page', label: 'About our people', slug: 'services/about', children: [], childCount: 0 };

function fixture() {
  state.setGraphModel(state.normalizeGraph({ nodes: [page, { id: 'partial:nav.php', type: 'partial', label: 'nav.php' }], edges: [] }));
  state.setSelectedNodeId(page.id);
  state.setLastSelectedPageId(page.id);
}

test('A leaf page has a named native button for Enter and Space selection', () => {
  fixture();
  const html = nav.renderTree([page], 0);
  assert.match(html, /<button\b[^>]*class="vs-site-tree-select"[^>]*data-select-page="page:services\/about\.php"[^>]*aria-label="Inspect About our people"[^>]*aria-pressed="true"/);
  assert.doesNotMatch(html, /<button[^>]*class="vs-site-tree-select"[^>]*>[\s\S]*?<button/);
});

test('Canvas page selection has native activation separate from page action buttons', () => {
  fixture();
  const html = canvas.renderCard(page);
  assert.match(html, /<button\b[^>]*class="vs-site-card-body"[^>]*data-select-page="page:services\/about\.php"[^>]*aria-label="Inspect About our people, \/services\/about"[^>]*aria-pressed="true"/);
  const selection = html.match(/<button\b[^>]*class="vs-site-card-body"[^>]*>([\s\S]*?)<\/button>/);
  assert.ok(selection);
  assert.doesNotMatch(selection[1], /<button|data-action=/);
  assert.match(html, /data-action="rename"/);
});

test('Entity selection announces the selected state and full identity', () => {
  fixture();
  state.setSelectedNodeId('partial:nav.php');
  const html = nav.renderLeftPanel([page]);
  assert.match(html, /<button\b[^>]*data-node-id="partial:nav\.php"[^>]*aria-label="Inspect partial nav\.php"[^>]*aria-pressed="true"/);
});

test('Selection focus survives a refresh without moving focus out of other controls', async () => {
  const focus = await import('../ui/src/views/site-control/selection-focus.js').catch(error => {
    if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
    throw error;
  });
  assert.equal(typeof focus.captureSelectionFocus, 'function', 'Site selection needs focus preservation across its full DOM refresh');
  const element = (selector, id) => ({
    matches: candidate => candidate === selector,
    getAttribute: attribute => attribute === 'data-select-page' ? id : null,
    focused: false,
    focus(options) { this.focused = true; this.focusOptions = options; },
  });
  const selector = '.vs-site-tree-select[data-select-page]';
  const before = element(selector, page.id);
  const root = { children: [before], contains(node) { return this.children.includes(node); }, querySelectorAll(candidate) { return this.children.filter(node => node.matches(candidate)); } };
  const saved = focus.captureSelectionFocus(root, before);
  const after = element(selector, page.id);
  root.children = [after];
  focus.restoreSelectionFocus(root, saved);
  assert.equal(after.focused, true);
  assert.deepEqual(after.focusOptions, { preventScroll: true });
  const nestedAction = element('button[data-action="rename"]', page.id);
  root.children.push(nestedAction);
  assert.equal(focus.captureSelectionFocus(root, nestedAction), null);
  assert.equal(focus.captureSelectionFocus(root, element('input', 'rename-input')), null);
});
