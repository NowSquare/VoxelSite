import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// A small DOM fixture exercises the real handlers without a browser dependency.
// Rendering, geometry, and assistive-technology checks remain browser evidence.
function dom() {
  let document;
  const observers = new Set();
  class Element {
    constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.children = []; this.attrs = {}; this.handlers = {}; this.style = {}; this.dataset = {}; this.value = ''; }
    get id() { return this.attrs.id || ''; } set id(value) { this.attrs.id = value; }
    get className() { return this.attrs.class || ''; } set className(value) { this.attrs.class = value; }
    get classList() { return { contains: name => this.className.split(' ').includes(name), add: name => { this.className += ` ${name}`; }, remove: name => { this.className = this.className.split(' ').filter(c => c !== name).join(' '); }, toggle: (name, on) => on ? this.classList.add(name) : this.classList.remove(name) }; }
    get isConnected() { return this === document.body || !!this.parentElement?.isConnected; }
    get tabIndex() { return Number(this.attrs.tabindex ?? (['BUTTON','INPUT','TEXTAREA','SELECT','A'].includes(this.tagName) ? 0 : -1)); }
    set tabIndex(value) { this.attrs.tabindex = String(value); }
    setAttribute(name, value) { this.attrs[name] = String(value); if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value); }
    getAttribute(name) { return this.attrs[name] ?? null; } hasAttribute(name) { return name in this.attrs; }
    removeAttribute(name) { delete this.attrs[name]; }
    get inert() { return this.hasAttribute('inert'); } set inert(value) { value ? this.setAttribute('inert', '') : this.removeAttribute('inert'); }
    get disabled() { return this.hasAttribute('disabled'); } set disabled(value) { value ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }
    matches(selector) {
      return selector.split(',').some(part => {
        part = part.trim().replace(/:not\(\[([^\]]+)\]\)/g, (_, attr) => this.hasAttribute(attr) ? 'NEVER' : '');
        const tag = part.match(/^[a-z]+/i)?.[0];
        return (!tag || this.tagName === tag.toUpperCase()) && [...part.matchAll(/#([\w-]+)/g)].every(m => this.id === m[1]) && [...part.matchAll(/\.([\w-]+)/g)].every(m => this.classList.contains(m[1])) && [...part.matchAll(/\[([^=\]]+)(?:=["']?([^"'\]]+)["']?)?\]/g)].every(m => this.hasAttribute(m[1]) && (m[2] === undefined || this.getAttribute(m[1]) === m[2]));
      });
    }
    closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) || null; }
    contains(other) { return this === other || this.children.some(child => child.contains(other)); }
    querySelectorAll(selector) { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
    remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = null; observers.forEach(fn => fn()); }
    getClientRects() { return this.isConnected && !this.closest('[hidden],[inert]') && this.style.display !== 'none' ? [{}] : []; }
    addEventListener(name, fn, capture = false) { (this.handlers[name] ||= []).push({ fn, capture }); }
    removeEventListener(name, fn) { this.handlers[name] = (this.handlers[name] || []).filter(item => item.fn !== fn); }
    async fire(name, props = {}) {
      const event = { target: this, currentTarget: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopImmediatePropagation() { this.stopped = true; }, stopPropagation() {}, ...props };
      for (const { fn, capture } of document.handlers[name] || []) if (capture && !event.stopped) await fn(event);
      for (const { fn } of this.handlers[name] || []) if (!event.stopped) await fn(event);
      for (const { fn, capture } of document.handlers[name] || []) if (!capture && !event.stopped) await fn(event);
      return event;
    }
    focus() { if (this.isConnected && !this.inert) document.activeElement = this; }
    click() { return this.fire('click'); } setSelectionRange() {}
    set innerHTML(html) {
      this.html = html; this.children.forEach(child => { child.parentElement = null; }); this.children = [];
      const stack = [this];
      for (const match of html.matchAll(/<\/?([a-z][\w-]*)([^>]*)>/gi)) {
        if (match[0].startsWith('</')) { if (stack.length > 1) stack.pop(); continue; }
        const child = new Element(match[1]);
        for (const attr of match[2].matchAll(/([\w-]+)(?:="([^"]*)"|='([^']*)')?/g)) child.setAttribute(attr[1], attr[2] ?? attr[3] ?? '');
        stack.at(-1).appendChild(child);
        if (!['input','br','hr','img','path','circle','polyline','rect'].includes(match[1]) && !match[0].endsWith('/>')) stack.push(child);
      }
    }
    get innerHTML() { return this.html || ''; }
  }
  document = { handlers: {}, createElement: tag => new Element(tag), getElementById: id => document.body.querySelector(`#${id}`), querySelector: selector => document.body.querySelector(selector), querySelectorAll: selector => document.body.querySelectorAll(selector), addEventListener: Element.prototype.addEventListener, removeEventListener: Element.prototype.removeEventListener };
  document.body = new Element('body'); document.activeElement = document.body;
  return { document, MutationObserver: class { constructor(fn) { this.fn = fn; } observe() { observers.add(this.fn); } disconnect() { observers.delete(this.fn); } } };
}
const sources = Object.fromEntries(await Promise.all(['views/board.js','views/notes.js','ui/dialog-focus.js'].map(async path => [path, await readFile(new URL(`../ui/src/${path}`, import.meta.url), 'utf8').catch(() => '')])));
const app = await readFile(new URL('../ui/app.js', import.meta.url), 'utf8');
function fixture(view = 'board') {
  const environment = dom(); const timers = [];
  const context = vm.createContext({ ...environment, navigator: { platform: 'MacIntel' }, window: { IS_DEMO: false, matchMedia: () => ({ matches: true }) },
    setTimeout: fn => { timers.push(fn); return timers.length; }, clearTimeout() {}, requestAnimationFrame: fn => fn(), getComputedStyle: element => ({ visibility: element.style.visibility || 'visible' }),
    store: { get: key => key === 'user' ? { role: 'owner', name: 'Owner' } : key === 'pages' ? [] : key === 'route' ? view : '' },
    icons: {}, escapeHtml: String, escapeAttr: String, timeAgo: () => 'now', isMobile: () => true,
    showToast() {}, showToastWithAction() {}, onBackdropClick: (overlay, close) => overlay.addEventListener('click', event => { if (event.target === overlay) close(); }),
    closeModal: overlay => { overlay.classList.remove('is-visible'); timers.push(() => overlay.remove()); },
    api: { hasDirty: () => false, markDraft() {}, put: async () => ({ ok: true, data: { note: { id: 1, pinned: 1 } } }) },
  });
  if (sources['ui/dialog-focus.js']) vm.runInContext(sources['ui/dialog-focus.js'].replaceAll('export ', ''), context);
  const source = view === 'more' ? app.slice(app.indexOf('function renderMobileMoreSheet()'), app.indexOf('// ═', app.indexOf('function bindMobileEvents()') + 100)) : sources[`views/${view}.js`];
  vm.runInContext(source.replace(/^import .*;\n/gm, '').replaceAll('export ', ''), context);
  return { ...environment, context, timers, run: code => vm.runInContext(code, context), add(html) { const host = environment.document.createElement('div'); host.innerHTML = html; environment.document.body.appendChild(host); return host; } };
}
function openCard() {
  const f = fixture(); f.add('<button id="btn-board-add">New Card</button>'); f.document.getElementById('btn-board-add').focus(); f.context.openCreateModal(); return f;
}
test('New Card exposes a named modal and focuses its labeled title field', () => {
  const f = openCard(); const dialog = f.document.querySelector('[role="dialog"]');
  assert.ok(dialog); assert.equal(dialog.getAttribute('aria-modal'), 'true'); assert.ok(f.document.getElementById(dialog.getAttribute('aria-labelledby')));
  assert.equal(f.document.activeElement.id, 'card-new-title');
});
test('New Card traps forward/reverse Tab, skipping disabled controls', async () => {
  const f = openCard(); const first = f.document.getElementById('card-new-title'); const last = f.document.getElementById('btn-card-create');
  last.focus(); assert.ok((await last.fire('keydown', { key: 'Tab' })).defaultPrevented); assert.equal(f.document.activeElement, first);
  last.disabled = true; await first.fire('keydown', { key: 'Tab', shiftKey: true }); assert.equal(f.document.activeElement.id, 'btn-card-cancel');
});
test('New Card Escape and cancel return focus immediately and closing cannot steal it later', async () => {
  for (const action of ['escape','cancel']) {
    const f = openCard(); f.document.getElementById('card-new-title').focus();
    if (action === 'escape') await f.document.activeElement.fire('keydown', { key: 'Escape' }); else await f.document.getElementById('btn-card-cancel').click();
    assert.equal(f.document.activeElement.id, 'btn-board-add');
    f.timers.forEach(fn => fn()); assert.equal(f.document.activeElement.id, 'btn-board-add');
    assert.equal((f.document.handlers.keydown || []).length, 0);
  }
});
test('Removing an open dialog cleans its document handlers', () => {
  const f = openCard(); f.document.getElementById('vs-board-create-overlay').remove();
  assert.equal((f.document.handlers.keydown || []).length, 0); assert.equal((f.document.handlers.focusin || []).length, 0);
});
test('A newer confirmation dialog retains keyboard ownership', async () => {
  const f = openCard(); f.add('<div class="vs-modal-overlay is-visible"><div role="dialog"><button id="confirm">Confirm</button></div></div>');
  const confirm = f.document.getElementById('confirm'); confirm.focus();
  assert.equal((await confirm.fire('keydown', { key: 'Escape' })).defaultPrevented, false);
  assert.ok(f.document.getElementById('vs-board-create-overlay').classList.contains('is-visible'));
});
test('More starts inert, opens with a name and close label, traps focus and restores its trigger', async () => {
  const f = fixture('more'); f.add('<button id="btn-mobile-more" aria-expanded="false">More</button>'); f.add(f.context.renderMobileMoreSheet());
  const sheet = f.document.getElementById('mobile-more-sheet'); assert.ok(sheet.inert); assert.equal(sheet.getAttribute('aria-hidden'), 'true');
  f.context.bindMobileEvents(); const trigger = f.document.getElementById('btn-mobile-more'); trigger.focus(); await trigger.click();
  assert.equal(trigger.getAttribute('aria-expanded'), 'true'); assert.equal(sheet.inert, false);
  const dialog = sheet.querySelector('[role="dialog"]'); assert.ok(dialog); assert.ok(f.document.getElementById(dialog.getAttribute('aria-labelledby')));
  const close = f.document.getElementById('btn-mobile-more-close'); assert.equal(close.getAttribute('aria-label'), 'Close menu'); assert.equal(f.document.activeElement, close);
  const last = f.document.getElementById('btn-mobile-logout'); last.focus(); await last.fire('keydown', { key: 'Tab' }); assert.equal(f.document.activeElement, close);
  await close.fire('keydown', { key: 'Escape' }); assert.equal(f.document.activeElement, trigger); assert.ok(sheet.inert); assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal((f.document.handlers.keydown || []).length, 0);
});
test('More can reopen and close through its button or backdrop without leaked handlers', async () => {
  const f = fixture('more'); f.add('<button id="btn-mobile-more">More</button>'); f.add(f.context.renderMobileMoreSheet()); f.context.bindMobileEvents();
  for (const id of ['btn-mobile-more-close','mobile-more-backdrop']) {
    await f.document.getElementById('btn-mobile-more').click(); await f.document.getElementById(id).click();
    assert.equal(f.document.activeElement.id, 'btn-mobile-more'); assert.equal((f.document.handlers.keydown || []).length, 0);
  }
});
function openNote(mobile = true) {
  const f = fixture('notes'); f.add('<div id="vs-notes-mobile-detail"></div><div id="vs-notes-editor-content"></div><div id="vs-notes-list"></div><button id="btn-note-new">New note</button>');
  f.run('notes = [{ id: 1, title: "Note", body: "Text", pinned: 0 }]; activeNoteId = 1; mobileView = "detail";');
  f.context[mobile ? 'renderMobileDetail' : 'renderEditor']({ id: 1, title: 'Note', body: 'Text', pinned: 0 }); return f;
}
test('Mobile and desktop note controls have names, including the editor restored from preview', () => {
  for (const mobile of [true, false]) {
    const f = openNote(mobile);
    for (const [id, label] of [['btn-note-pin','Pin note'],['btn-note-delete','Delete note'],['vs-note-title','Note title'],['vs-note-body','Note body']]) assert.equal(f.document.getElementById(id).getAttribute('aria-label'), label);
    if (!mobile) { f.run('previewMode = true; previewBodyCache = "Draft";'); f.context.togglePreview(); assert.equal(f.document.getElementById('vs-note-body').getAttribute('aria-label'), 'Note body'); }
  }
});
test('Pin success updates the accessible action as well as its icon', async () => {
  const f = openNote(); await f.document.getElementById('btn-note-pin').click(); assert.equal(f.document.getElementById('btn-note-pin').getAttribute('aria-label'), 'Unpin note');
});
test('Mobile Back preserves an unsaved note when the save fails', async () => {
  const f = openNote(); f.run('flushPendingSave = async () => false;'); await f.document.getElementById('btn-note-back').click();
  assert.equal(f.run('activeNoteId'), 1); assert.equal(f.run('mobileView'), 'detail'); assert.equal(f.document.getElementById('vs-notes-mobile-detail').style.display, 'flex');
});
test('Note Back and Escape return focus to the selected list row after successful save', async () => {
  for (const action of ['back','escape']) {
    const f = openNote();
    if (action === 'back') await f.document.getElementById('btn-note-back').click(); else { f.context.handleNotesKeyboard({ key: 'Escape', preventDefault() {} }); await new Promise(resolve => setImmediate(resolve)); }
    assert.equal(f.document.activeElement.getAttribute('data-note-id'), '1', action); assert.equal(f.run('activeNoteId'), null);
    f.timers.forEach(fn => fn()); assert.equal(f.document.activeElement.getAttribute('data-note-id'), '1', `${action}: delayed editor focus`);
  }
});
test('Focus moved outside the current dialog returns inside; detached launchers are ignored', async () => {
  const f = openCard(); const trigger = f.document.getElementById('btn-board-add'); trigger.focus(); await trigger.fire('focusin');
  assert.equal(f.document.activeElement.id, 'card-new-title'); trigger.remove();
  await f.document.activeElement.fire('keydown', { key: 'Escape' });
  assert.equal((f.document.handlers.keydown || []).length, 0);
});
