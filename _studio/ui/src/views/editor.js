/**
 * VoxelSite Studio — Editor View
 *
 * VS Code-style file editor powered by Monaco.
 * Handles file tree, multi-tab editing, inline AI (Cmd+K),
 * the Monaco editor integration, and the standalone code editor modal.
 */

import { icons } from '../icons.js';
import { store } from '../../state.js';
import { api, apiStream } from '../../api.js';
import { showToast, showToastWithAction } from '../ui/toasts.js';
import { escapeHtml, getCodeLanguage } from '../helpers.js';
import { closeModal, showConfirmModal, showPromptModal } from '../ui/modals.js';

let monacoLoadPromise = null;

function renderEditorLayout() {
  return `
    <div class="vs-editor-layout">
      <!-- File Tree Sidebar -->
      <div id="editor-sidebar" class="vs-editor-sidebar" style="position: relative; display: flex; flex-direction: column;">
        <div class="vs-editor-sidebar-header">
          <span class="vs-editor-sidebar-title">Explorer</span>
          <div style="display:flex;gap:2px;">
            <button id="editor-new-file" class="vs-btn vs-btn-ghost vs-btn-icon" title="New file" style="width:24px;height:24px;">
              ${icons.filePlus}
            </button>
            <button id="editor-refresh-tree" class="vs-btn vs-btn-ghost vs-btn-icon" title="Refresh file list" style="width:24px;height:24px;">
              ${icons.rotateCcw}
            </button>
          </div>
        </div>
        <div style="flex: 1; overflow-y: auto;">
          <!-- SITE FILES -->
          <div class="vs-explorer-section">
            <div class="vs-explorer-section-header" data-section="site">
              <svg class="vs-explorer-caret" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              <span>SITE FILES</span>
            </div>
            <div id="editor-tree" class="vs-editor-tree" style="padding-bottom: 8px;">
              <div class="text-xs text-vs-text-ghost py-4 text-center">Loading files…</div>
            </div>
          </div>
          <!-- SEO & AI -->
          <div class="vs-explorer-section">
            <div class="vs-explorer-section-header" data-section="config">
              <svg class="vs-explorer-caret" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              <span>SEO & AI</span>
            </div>
            <div id="editor-tree-config" class="vs-editor-tree" style="padding-bottom: 8px;">
            </div>
          </div>
          <!-- SYSTEM PROMPTS -->
          <div class="vs-explorer-section">
            <div class="vs-explorer-section-header" data-section="prompts">
              <svg class="vs-explorer-caret" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              <span>SYSTEM PROMPTS</span>
            </div>
            <div id="editor-tree-prompts" class="vs-editor-tree" style="padding-bottom: 8px;">
            </div>
          </div>
        </div>
        <div id="editor-sidebar-resize" class="vs-editor-resize"></div>
      </div>

      <!-- Main Editor Area -->
      <div class="vs-editor-main">
        <!-- Editor Topbar -->
        <div class="vs-editor-topbar" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface); height: 38px;">
          <!-- Tab Bar Wrapper -->
          <div style="flex: 1; display: flex; align-items: stretch; min-width: 0; position: relative;">
            <!-- Scroll Left Button -->
            <button id="editor-tab-scroll-left" class="vs-tab-scroll-btn" style="display: none; position: absolute; left: 0; top: 0; bottom: 0; width: 24px; background: linear-gradient(to right, var(--vs-bg-surface) 60%, transparent); border: none; align-items: center; justify-content: flex-start; padding-left: 4px; z-index: 10; cursor: pointer; color: var(--vs-text-secondary);">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <!-- Tab Bar -->
            <div id="editor-tab-bar" class="vs-editor-tabs" style="flex: 1; border-bottom: none; min-width: 0; scroll-behavior: auto;">
              <div class="vs-editor-tab-empty"></div>
            </div>
            <!-- Scroll Right Button -->
            <button id="editor-tab-scroll-right" class="vs-tab-scroll-btn" style="display: none; position: absolute; right: 0; top: 0; bottom: 0; width: 24px; background: linear-gradient(to left, var(--vs-bg-surface) 60%, transparent); border: none; align-items: center; justify-content: flex-end; padding-right: 4px; z-index: 10; cursor: pointer; color: var(--vs-text-secondary);">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <!-- Editor Controls -->
          <div class="vs-editor-controls" style="display: flex; align-items: center; gap: 4px; padding: 0 12px;">
            <button id="editor-word-wrap-btn" class="vs-btn vs-btn-ghost vs-btn-icon" title="Toggle Word Wrap" style="width: 24px; height: 24px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M3 12h15a3 3 0 0 1 0 6h-4"/><path d="m11 15-3 3 3 3"/><path d="M3 18h4"/></svg>
            </button>
            <select id="editor-font-size-select" class="vs-input" title="Editor Text Size" style="height: 24px; font-size: 11px; padding: 0 24px 0 8px; width: auto; min-width: 60px; background-size: 12px; background-position: right 6px center;">
              <option value="11">11px</option>
              <option value="12">12px</option>
              <option value="13">13px</option>
              <option value="14">14px</option>
              <option value="15">15px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
            </select>
          </div>
        </div>

        <!-- Editor Host -->
        <div id="editor-host" class="vs-editor-host" style="position: relative;">
          <div id="editor-empty-state" class="vs-editor-empty">
            <div class="vs-empty-state-inner">
              <div class="vs-empty-state-icon">${icons.fileCode}</div>
              <p class="vs-empty-state-title">No file open</p>
              <p class="vs-empty-state-desc">Select a file from the explorer to start editing, or create a new file.</p>
            </div>
          </div>
          <div id="editor-monaco-container" style="width:100%;height:100%;display:none;"></div>
        </div>

        <!-- Editor Footer -->
        <div class="vs-editor-footer">
          <div id="editor-file-info" class="vs-code-meta">No file open</div>
          <div class="vs-editor-footer-actions">
            <span id="editor-status" class="vs-code-status" data-state="muted">Ready</span>
            <button id="editor-save-btn" class="vs-btn vs-btn-ghost vs-btn-xs" disabled>Saved</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize the Editor page state and Monaco instance.
 * Called once after renderEditorLayout() DOM is mounted.
 */
async function initEditorPage() {
  // State for the editor page — restore from session if available
  const saved = (() => {
    try { return JSON.parse(sessionStorage.getItem('vs-editor-state') || 'null'); }
    catch { return null; }
  })();

  const editorState = {
    files: [],
    treeData: {
      site: [],
      config: [],
      prompts: []
    },
    openTabs: [],        // [{path, baseline, dirty}]  — populated after load
    activeTab: null,
    monacoInstance: null,
    monaco: null,
    disposed: false,
    fontSize: saved?.fontSize || 13,
    wordWrap: saved?.wordWrap || false,
    expandedFolders: new Set(saved?.expandedFolders || ['_partials', 'assets', 'assets/css', 'assets/js', 'assets/data', 'assets/forms', '_prompts/actions']),
    expandedSections: new Set(saved?.expandedSections || ['site', 'config', 'prompts']),
    // Paths to restore after init
    _pendingRestore: saved ? { tabs: saved.openTabs || [], active: saved.activeTab } : null,
  };

  window.__hasUnsavedEditorChanges = () => {
    if (!editorState || !editorState.openTabs) return false;
    return editorState.openTabs.some(t => t.dirty);
  };

  // Save editor state to sessionStorage for restore on route return
  const persistEditorState = () => {
    try {
      sessionStorage.setItem('vs-editor-state', JSON.stringify({
        openTabs: editorState.openTabs.map(t => t.path),
        activeTab: editorState.activeTab,
        fontSize: editorState.fontSize,
        wordWrap: editorState.wordWrap,
        expandedFolders: [...editorState.expandedFolders],
        expandedSections: [...editorState.expandedSections],
      }));
    } catch { /* ignore quota errors */ }
  };

  // Make accessible for cleanup on route change
  window.__vsEditorPage = {
    dispose: () => {
      persistEditorState();   // ← save before teardown
      editorState.disposed = true;
      if (editorState.monacoInstance) {
        editorState.monacoInstance.dispose();
        editorState.monacoInstance = null;
      }
    }
  };

  const treeEl = document.getElementById('editor-tree');
  const treeConfigEl = document.getElementById('editor-tree-config');
  const treePromptsEl = document.getElementById('editor-tree-prompts');
  const tabBarEl = document.getElementById('editor-tab-bar');
  const hostEl = document.getElementById('editor-host');
  const emptyStateEl = document.getElementById('editor-empty-state');
  const monacoContainerEl = document.getElementById('editor-monaco-container');
  const fileInfoEl = document.getElementById('editor-file-info');
  const statusEl = document.getElementById('editor-status');
  const saveBtn = document.getElementById('editor-save-btn');
  const refreshBtn = document.getElementById('editor-refresh-tree');
  const newFileBtn = document.getElementById('editor-new-file');
  const sidebarEl = document.getElementById('editor-sidebar');
  const resizeEl = document.getElementById('editor-sidebar-resize');
  const fontSizeSelect = document.getElementById('editor-font-size-select');
  const wordWrapBtn = document.getElementById('editor-word-wrap-btn');

  // Initialize UI controls
  if (fontSizeSelect) fontSizeSelect.value = editorState.fontSize;
  const updateWordWrapUI = () => {
    if (!wordWrapBtn) return;
    if (editorState.wordWrap) {
      wordWrapBtn.style.color = 'var(--vs-accent)';
      wordWrapBtn.style.backgroundColor = 'var(--vs-accent-dim)';
    } else {
      wordWrapBtn.style.color = 'var(--vs-text-ghost)';
      wordWrapBtn.style.backgroundColor = 'transparent';
    }
  };
  updateWordWrapUI();

  // ── Helpers ──
  const setStatus = (msg, type = 'muted') => {
    if (statusEl) { statusEl.textContent = msg; statusEl.dataset.state = type; }
  };

  const isFileReadonly = (path) => {
    const file = editorState.files.find(f => f.path === path);
    return file?.readonly === true;
  };

  const getFileIcon = (path) => {
    const lower = path.toLowerCase();
    // Monochromatic icons — shape differentiates, not color.
    // PHP: code brackets </>   CSS: hash #   JS: curly braces {}   JSON: key-value
    if (lower.endsWith('.php')) return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>`;
    if (lower.endsWith('.css')) return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M12 12v4"/></svg>`;
    if (lower.endsWith('.js')) return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>`;
    if (lower.endsWith('.json')) return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`;
  };

  // ── Build tree structure from flat file list ──
  const buildTree = (files, stripPrefix = '') => {
    const root = [];
    const folderMap = {};

    const ensureFolder = (folderPath) => {
      if (folderMap[folderPath]) return folderMap[folderPath];
      const parts = folderPath.split('/');
      const name = parts[parts.length - 1];
      const parentPath = parts.slice(0, -1).join('/');
      
      const realPath = stripPrefix ? stripPrefix + folderPath : folderPath;
      const folder = { name, path: realPath, type: 'folder', children: [] };
      folderMap[folderPath] = folder;
      
      if (parentPath) {
        const parent = ensureFolder(parentPath);
        parent.children.push(folder);
      } else {
        root.push(folder);
      }
      return folder;
    };

    for (const f of files) {
      const p = stripPrefix && f.path.startsWith(stripPrefix) ? f.path.substring(stripPrefix.length) : f.path;
      const parts = p.split('/');
      
      if (parts.length === 1) {
        root.push({ name: parts[0], path: f.path, type: 'file', meta: f });
      } else {
        const folderPath = parts.slice(0, -1).join('/');
        const parent = ensureFolder(folderPath);
        parent.children.push({ name: parts[parts.length - 1], path: f.path, type: 'file', meta: f });
      }
    }

    // Sort: folders first, then alphabetically
    const sortChildren = (items) => {
      items.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      for (const item of items) {
        if (item.type === 'folder') sortChildren(item.children);
      }
    };
    sortChildren(root);
    return root;
  };

  // ── Render file tree ──
  const renderTree = () => {
    if (!treeEl) return;
    const renderItems = (items, depth = 0) => {
      return items.map(item => {
        if (item.type === 'folder') {
          const expanded = editorState.expandedFolders.has(item.path);
          return `
            <div class="vs-tree-item" data-folder="${escapeHtml(item.path)}" style="--tree-indent: ${depth};">
              <span class="vs-tree-folder-toggle" data-expanded="${expanded}">${icons.chevronRight}</span>
              <span class="vs-tree-item-icon">${expanded ? (icons.folderOpen || icons.folder) : icons.folder}</span>
              <span class="vs-tree-item-name">${escapeHtml(item.name)}</span>
            </div>
            <div class="vs-tree-folder-children" data-folder-children="${escapeHtml(item.path)}" data-collapsed="${!expanded}">
              ${renderItems(item.children, depth + 1)}
            </div>
          `;
        }
        const isActive = editorState.activeTab === item.path;
        const tab = editorState.openTabs.find(t => t.path === item.path);
        const dirtyDot = tab?.dirty ? ' •' : '';
        const isReadonly = isFileReadonly(item.path);
        const readonlyLabel = isReadonly ? ' <span style="opacity: 0.5; font-size: 0.9em; margin-left: 4px;">(read-only)</span>' : '';
        const isCustom = item.meta?.custom === true;
        const isProtected = item.meta?.protected === true;
        
        let actionBtn = '';
        const isTailwind = item.path === 'assets/css/tailwind.css';
        if (isTailwind) {
          actionBtn = `
            <button class="vs-tree-item-restore" data-compile-tailwind="true" title="Recompile Tailwind CSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`;
        } else if (isProtected) {
          if (isCustom) {
            actionBtn = `
            <button class="vs-tree-item-restore" data-restore-file="${escapeHtml(item.path)}" title="Reset to default system prompt">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`;
          }
        } else {
          actionBtn = `
            <button class="vs-tree-item-delete" data-delete-file="${escapeHtml(item.path)}" title="Delete file">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`;
        }
        
        return `
          <div class="vs-tree-item" data-file="${escapeHtml(item.path)}" data-active="${isActive}" style="--tree-indent: ${depth};">
            <span style="width: 14px; flex-shrink: 0;"></span><!-- toggle spacer for perfect vertical alignment -->
            <span class="vs-tree-item-icon">${getFileIcon(item.path)}</span>
            <span class="vs-tree-item-name">${escapeHtml(item.name)}${readonlyLabel}${dirtyDot}</span>
            ${actionBtn}
          </div>
        `;
      }).join('');
    };

    // Update section expanded state
    const updateSectionState = (sectionId, treeElement, wrapperElement) => {
      const caret = wrapperElement.querySelector('.vs-explorer-caret');
      const expanded = editorState.expandedSections.has(sectionId);
      if (expanded) {
        treeElement.style.display = 'block';
        wrapperElement.classList.add('is-expanded');
      } else {
        treeElement.style.display = 'none';
        wrapperElement.classList.remove('is-expanded');
      }
    };

    const siteHeader = document.querySelector('[data-section="site"]');
    const configHeader = document.querySelector('[data-section="config"]');
    const promptsHeader = document.querySelector('[data-section="prompts"]');

    if (siteHeader) updateSectionState('site', treeEl, siteHeader);
    if (configHeader && treeConfigEl) updateSectionState('config', treeConfigEl, configHeader);
    if (promptsHeader && treePromptsEl) updateSectionState('prompts', treePromptsEl, promptsHeader);

    treeEl.innerHTML = renderItems(editorState.treeData.site);
    if (treeConfigEl) treeConfigEl.innerHTML = renderItems(editorState.treeData.config);
    if (treePromptsEl) treePromptsEl.innerHTML = renderItems(editorState.treeData.prompts);
    
    bindTreeEvents();
  };

  // ── Render tab bar ──
  const renderTabs = () => {
    if (!tabBarEl) return;
    if (editorState.openTabs.length === 0) {
      tabBarEl.innerHTML = '<div class="vs-editor-tab-empty"></div>';
      return;
    }
    tabBarEl.innerHTML = editorState.openTabs.map(tab => {
      const isActive = tab.path === editorState.activeTab;
      const fileName = tab.path.split('/').pop();
      const isReadonly = isFileReadonly(tab.path);
      const readonlyLabel = isReadonly ? ' <span style="opacity:0.5; font-size:0.9em; margin-left:4px;">(read-only)</span>' : '';
      return `
        <div class="vs-editor-tab" data-tab="${escapeHtml(tab.path)}" data-active="${isActive}" data-dirty="${tab.dirty}">
          <span class="vs-editor-tab-dot"></span>
          <span class="vs-editor-tab-label">${escapeHtml(fileName)}${readonlyLabel}</span>
          <button class="vs-editor-tab-close" data-close-tab="${escapeHtml(tab.path)}" title="Close">${icons.x}</button>
        </div>
      `;
    }).join('') + '<div class="vs-editor-tab-empty"></div>';
    bindTabEvents();
    updateTabScrollState();
  };

  // ── Tab Scrolling Logic ──
  let scrollInterval = null;
  const startTabScroll = (direction) => {
    if (!tabBarEl) return;
    const speed = 8;
    const scrollStep = () => {
      tabBarEl.scrollLeft += (direction === 'left' ? -speed : speed);
      updateTabScrollState();
    };
    scrollStep(); // immediate step
    scrollInterval = setInterval(scrollStep, 16);
  };
  const stopTabScroll = () => {
    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
  };
  const updateTabScrollState = () => {
    const leftBtn = document.getElementById('editor-tab-scroll-left');
    const rightBtn = document.getElementById('editor-tab-scroll-right');
    if (!tabBarEl || !leftBtn || !rightBtn) return;
    
    // Check if scrollable
    const canScrollLeft = tabBarEl.scrollLeft > 0;
    const canScrollRight = tabBarEl.scrollLeft < (tabBarEl.scrollWidth - tabBarEl.clientWidth - 1); // -1 for rounding
    
    leftBtn.style.display = canScrollLeft ? 'flex' : 'none';
    rightBtn.style.display = canScrollRight ? 'flex' : 'none';
  };
  
  if (tabBarEl) {
    tabBarEl.addEventListener('scroll', updateTabScrollState, { passive: true });
    window.addEventListener('resize', updateTabScrollState, { passive: true });
  }

  const scrollLeftBtn = document.getElementById('editor-tab-scroll-left');
  const scrollRightBtn = document.getElementById('editor-tab-scroll-right');
  
  if (scrollLeftBtn) {
    scrollLeftBtn.addEventListener('mousedown', () => startTabScroll('left'));
    scrollLeftBtn.addEventListener('mouseup', stopTabScroll);
    scrollLeftBtn.addEventListener('mouseleave', stopTabScroll);
  }
  
  if (scrollRightBtn) {
    scrollRightBtn.addEventListener('mousedown', () => startTabScroll('right'));
    scrollRightBtn.addEventListener('mouseup', stopTabScroll);
    scrollRightBtn.addEventListener('mouseleave', stopTabScroll);
  }

  // ── Hide empty state, show Monaco ──
  const hideEmptyState = () => {
    if (emptyStateEl) emptyStateEl.style.display = 'none';
    if (monacoContainerEl) monacoContainerEl.style.display = '';
    // Force Monaco layout recalculation
    if (editorState.monacoInstance) {
      editorState.monacoInstance.layout();
    }
  };

  // ── Open a file in a tab ──
  const openFile = async (path) => {
    if (editorState.disposed) return;

    // Check if already in a tab
    let tab = editorState.openTabs.find(t => t.path === path);
    if (tab) {
      // Already open, just switch to it
      await switchToTab(path);
      return;
    }

    setStatus('Loading…');
    const { ok, data, error } = await api.get(`/files/content?path=${encodeURIComponent(path)}`);
    if (!ok) {
      showToast(error?.message || 'Could not load file.', 'error');
      setStatus('Load failed', 'error');
      return;
    }

    const content = typeof data?.content === 'string' ? data.content : '';
    tab = { path, baseline: content, dirty: false };
    editorState.openTabs.push(tab);

    hideEmptyState();
    await switchToTab(path);
    setEditorContent(content, path);
    setStatus('Ready');
    persistEditorState();
  };

  // ── Switch active tab ──
  const switchToTab = async (path) => {
    if (editorState.disposed) return;

    // Save current editor content to the current tab's buffer
    const currentTab = editorState.openTabs.find(t => t.path === editorState.activeTab);
    if (currentTab && editorState.monacoInstance) {
      currentTab._buffer = editorState.monacoInstance.getValue();
    }

    editorState.activeTab = path;
    const tab = editorState.openTabs.find(t => t.path === path);

    if (tab && editorState.monacoInstance) {
      // If we have a buffer, restore it; otherwise load from baseline
      const content = tab._buffer !== undefined ? tab._buffer : tab.baseline;
      setEditorContent(content, path);
    }

    updateFileInfo();
    updateSaveState();
    renderTabs();
    
    // Auto-scroll newly active tab into view
    setTimeout(() => {
      if (tabBarEl) {
        const activeTabEl = tabBarEl.querySelector('.vs-editor-tab[data-active="true"]');
        if (activeTabEl) {
          const tabRect = activeTabEl.getBoundingClientRect();
          const barRect = tabBarEl.getBoundingClientRect();
          if (tabRect.left < barRect.left) {
            tabBarEl.scrollBy({ left: tabRect.left - barRect.left, behavior: 'smooth' });
          } else if (tabRect.right > barRect.right) {
            tabBarEl.scrollBy({ left: tabRect.right - barRect.right, behavior: 'smooth' });
          }
        }
      }
    }, 10);

    renderTree();
    persistEditorState();
  };

  // ── Close a tab ──
  const closeTab = async (path) => {
    const tab = editorState.openTabs.find(t => t.path === path);
    if (tab?.dirty) {
      const discard = await showConfirmModal({
        title: 'Discard unsaved changes?',
        description: `"${path}" has unsaved edits.`,
        confirmLabel: 'Discard',
        cancelLabel: 'Cancel',
        danger: true,
      });
      if (!discard) return;
    }

    const idx = editorState.openTabs.findIndex(t => t.path === path);
    if (idx === -1) return;
    editorState.openTabs.splice(idx, 1);

    if (editorState.activeTab === path) {
      // Switch to adjacent tab or show empty state
      const nextTab = editorState.openTabs[Math.min(idx, editorState.openTabs.length - 1)];
      if (nextTab) {
        await switchToTab(nextTab.path);
      } else {
        editorState.activeTab = null;
        showEmptyState();
        updateFileInfo();
        updateSaveState();
      }
    }
    renderTabs();
    renderTree();
    persistEditorState();
  };

  // ── Delete a file ──
  const deleteFile = async (path) => {
    if (window.demoGuard?.()) return;
    const filename = path.split('/').pop();
    const confirmed = await showConfirmModal({
      title: 'Delete file?',
      description: `Are you sure you want to permanently delete "${filename}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      danger: true,
    });
    if (!confirmed) return;

    setStatus('Deleting…');
    const { ok, error } = await api.delete(`/files?path=${encodeURIComponent(path)}`);
    if (!ok) {
      showToast(error?.message || 'Could not delete file.', 'error');
      setStatus('Delete failed', 'error');
      return;
    }

    // Close the tab if it was open (skip dirty check — file is gone)
    const tabIdx = editorState.openTabs.findIndex(t => t.path === path);
    if (tabIdx !== -1) {
      editorState.openTabs.splice(tabIdx, 1);
      if (editorState.activeTab === path) {
        const nextTab = editorState.openTabs[Math.min(tabIdx, editorState.openTabs.length - 1)];
        if (nextTab) {
          await switchToTab(nextTab.path);
        } else {
          editorState.activeTab = null;
          showEmptyState();
          updateFileInfo();
          updateSaveState();
        }
      }
      renderTabs();
    }

    await loadFileTree();
    persistEditorState();
    showToast(`Deleted ${filename}`, 'success');
    setStatus('Ready');
  };

  // ── Restore a system file to its default ──
  const restoreFile = async (path) => {
    if (window.demoGuard?.()) return;
    const filename = path.split('/').pop();
    const confirmed = await showConfirmModal({
      title: 'Reset system prompt?',
      description: `Are you sure you want to reset "${filename}" to its original state? All your customizations will be lost.`,
      confirmLabel: 'Reset to default',
      cancelLabel: 'Cancel',
      danger: true,
    });
    if (!confirmed) return;

    setStatus('Resetting…');
    const { ok, error } = await api.delete(`/files?path=${encodeURIComponent(path)}`);
    if (!ok) {
      showToast(error?.message || 'Could not reset file.', 'error');
      setStatus('Reset failed', 'error');
      return;
    }

    // Force reload the file content if it is open
    const tabIdx = editorState.openTabs.findIndex(t => t.path === path);
    if (tabIdx !== -1) {
      // Trigger a silent reload for the newly restored baseline
      const { ok: okLoad, data } = await api.get(`/files/content?path=${encodeURIComponent(path)}`);
      if (okLoad && typeof data?.content === 'string') {
        const tab = editorState.openTabs[tabIdx];
        tab.baseline = data.content;
        tab.dirty = false;
        tab._buffer = data.content;
        if (editorState.activeTab === path) {
          setEditorContent(data.content, path);
        }
      }
    }

    updateSaveState();
    await loadFileTree();
    persistEditorState();
    showToast(`Reset ${filename} to default`, 'success');
    setStatus('Ready');
  };

  // ── Set Monaco content ──
  const setEditorContent = (content, path) => {
    if (!editorState.monacoInstance || !editorState.monaco) return;
    const model = editorState.monacoInstance.getModel();
    if (model) {
      editorState.monacoInstance.setValue(content);
      editorState.monaco.editor.setModelLanguage(model, getCodeLanguage(path));
      editorState.monacoInstance.updateOptions({ readOnly: window.IS_DEMO || isFileReadonly(path) });
    }
  };

  // ── Show/hide empty state ──
  const showEmptyState = () => {
    if (emptyStateEl) emptyStateEl.style.display = '';
    if (monacoContainerEl) monacoContainerEl.style.display = 'none';
  };

  // ── Update file info bar ──
  const updateFileInfo = () => {
    if (!fileInfoEl) return;
    if (!editorState.activeTab) {
      fileInfoEl.textContent = 'No file open';
      return;
    }
    const tab = editorState.openTabs.find(t => t.path === editorState.activeTab);
    const file = editorState.files.find(f => f.path === editorState.activeTab);
    const size = file?.size ? `${(Number(file.size) / 1024).toFixed(1)} KB` : '';
    const lang = getCodeLanguage(editorState.activeTab).toUpperCase();
    fileInfoEl.textContent = [editorState.activeTab, lang, size].filter(Boolean).join(' • ');
  };

  // ── Update save button state ──
  const updateSaveState = () => {
    if (!saveBtn) return;
    const tab = editorState.openTabs.find(t => t.path === editorState.activeTab);
    const isReadonly = editorState.activeTab ? isFileReadonly(editorState.activeTab) : false;

    if (isReadonly) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Read-Only';
      saveBtn.classList.remove('vs-btn-primary');
      saveBtn.classList.add('vs-btn-ghost');
      return;
    }

    if (!tab || !tab.dirty) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saved';
      saveBtn.classList.remove('vs-btn-primary');
      saveBtn.classList.add('vs-btn-ghost');
      return;
    }
    
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
    saveBtn.classList.remove('vs-btn-ghost');
    saveBtn.classList.add('vs-btn-primary');
  };

  // ── Mark current tab dirty/clean ──
  const markDirty = () => {
    const tab = editorState.openTabs.find(t => t.path === editorState.activeTab);
    if (!tab || !editorState.monacoInstance) return;
    const currentValue = editorState.monacoInstance.getValue();
    const wasDirty = tab.dirty;
    tab.dirty = currentValue !== tab.baseline;
    if (wasDirty !== tab.dirty) {
      updateSaveState();
      renderTabs();
      if (tab.dirty) {
        setStatus('Unsaved changes', 'warning');
      } else {
        setStatus('Ready');
      }
    }
  };

  // ── Save current file ──
  const saveCurrentFile = async () => {
    if (window.demoGuard?.()) return;
    const tab = editorState.openTabs.find(t => t.path === editorState.activeTab);
    if (!tab || !tab.dirty || !editorState.monacoInstance) return;

    const content = editorState.monacoInstance.getValue();
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';
    setStatus('Saving…');

    const { ok, error } = await api.put('/files/content', {
      path: tab.path,
      content: content,
    });

    if (!ok) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save';
      showToast(error?.message || 'Could not save file.', 'error');
      setStatus('Save failed', 'error');
      return;
    }

    tab.baseline = content;
    tab.dirty = false;
    tab._buffer = content;
    updateSaveState();
    renderTabs();
    renderTree();
    setStatus('Saved', 'success');
    showToast(`Saved ${tab.path}`, 'success');

    // Refresh preview if applicable
    if (tab.path.toLowerCase().endsWith('.css')) {
      window.sendPreviewMessage?.('voxelsite:reload-css');
    } else {
      window.sendPreviewMessage?.('voxelsite:reload');
    }
    setTimeout(() => window.refreshPreview?.(), 400);
    window.refreshPublishState?.({ silent: true });

    // If tailwind.css is open in a tab, reload it secretly since backend might have rebuilt it 
    const tailwindTab = editorState.openTabs.find(t => t.path === 'assets/css/tailwind.css');
    if (tailwindTab && tab.path !== 'assets/css/tailwind.css') {
      api.get(`/files/content?path=assets/css/tailwind.css`).then(({ ok, data }) => {
        if (ok && typeof data?.content === 'string') {
          tailwindTab.baseline = data.content;
          tailwindTab._buffer = data.content;
          if (editorState.activeTab === 'assets/css/tailwind.css' && editorState.monacoInstance) {
            editorState.monacoInstance.setValue(data.content);
          }
        }
      });
    }
  };

  // ── Bind tree click events ──
  const bindTreeEvents = () => {
    // File clicks
    const bindClicks = (el) => {
      if (!el) return;
      el.querySelectorAll('[data-file]').forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target.closest('[data-delete-file]')) return;
          openFile(item.dataset.file);
        });
      });
      // Bind Delete 
      el.querySelectorAll('[data-delete-file]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteFile(btn.dataset.deleteFile);
        });
      });
      
      // Bind Restore 
      el.querySelectorAll('[data-restore-file]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          restoreFile(btn.dataset.restoreFile);
        });
      });

      // Bind Tailwind recompile
      el.querySelectorAll('[data-compile-tailwind]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (window.demoGuard?.()) return;

          btn.style.opacity = '0.4';
          btn.style.pointerEvents = 'none';
          setStatus('Compiling Tailwind…');

          const { ok, data, error } = await api.post('/files/compile-tailwind');

          btn.style.opacity = '';
          btn.style.pointerEvents = '';

          if (!ok) {
            showToast(error?.message || 'Tailwind compilation failed.', 'error');
            setStatus('Compile failed', 'error');
            return;
          }

          // Update the open tab if tailwind.css is currently open
          const twPath = 'assets/css/tailwind.css';
          const tab = editorState.openTabs.find(t => t.path === twPath);
          if (tab) {
            tab.baseline = data.content;
            tab.dirty = false;
            if (editorState.activeTab === twPath && editorState.monacoInstance) {
              editorState.monacoInstance.setValue(data.content);
            }
          }

          const classCount = data.class_count ?? 0;
          showToast(`Tailwind CSS recompiled — ${classCount} utilities.`, 'success');
          setStatus('Compiled');
        });
      });
      el.querySelectorAll('.vs-tree-folder-toggle, .vs-tree-item[data-folder]').forEach(btn => {
        // Prevent double binding by removing old listeners if needed (handled by innerHTML rewrite)
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const item = btn.closest('.vs-tree-item');
          const path = item.dataset.folder;
          if (editorState.expandedFolders.has(path)) {
            editorState.expandedFolders.delete(path);
          } else {
            editorState.expandedFolders.add(path);
          }
          persistEditorState();
          renderTree();
        });
      });
    };

    bindClicks(treeEl);
    bindClicks(treeConfigEl);
    bindClicks(treePromptsEl);

    // Section headers
    document.querySelectorAll('.vs-explorer-section-header').forEach(header => {
      // Clean up old ones just to be safe by replacing element, but innerHTML is not used for container
      // Just check if we bound it already using a flag
      if (header.dataset.bound) return;
      header.dataset.bound = "true";
      header.addEventListener('click', () => {
        const sectionId = header.dataset.section;
        if (editorState.expandedSections.has(sectionId)) {
          editorState.expandedSections.delete(sectionId);
        } else {
          editorState.expandedSections.add(sectionId);
        }
        persistEditorState();
        renderTree();
      });
    });
  };

  // ── Bind tab click events ──
  const bindTabEvents = () => {
    if (!tabBarEl) return;
    tabBarEl.querySelectorAll('[data-tab]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-close-tab]')) return;
        switchToTab(el.dataset.tab);
      });
    });
    tabBarEl.querySelectorAll('[data-close-tab]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(el.dataset.closeTab);
      });
    });
  };

  // ── Sidebar resize ──
  if (resizeEl && sidebarEl) {
    let dragging = false;
    resizeEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      dragging = true;
      resizeEl.classList.add('is-dragging');
      const onMove = (e2) => {
        if (!dragging) return;
        const newWidth = Math.min(400, Math.max(200, e2.clientX));
        sidebarEl.style.width = newWidth + 'px';
      };
      const onUp = () => {
        dragging = false;
        resizeEl.classList.remove('is-dragging');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  // ── Save button ──
  saveBtn?.addEventListener('click', saveCurrentFile);

  // ── Editor Controls ──
  fontSizeSelect?.addEventListener('change', (e) => {
    const size = parseInt(e.target.value, 10);
    editorState.fontSize = size;
    if (editorState.monacoInstance) {
      editorState.monacoInstance.updateOptions({ fontSize: size });
    }
    persistEditorState();
  });

  wordWrapBtn?.addEventListener('click', () => {
    editorState.wordWrap = !editorState.wordWrap;
    updateWordWrapUI();
    if (editorState.monacoInstance) {
      editorState.monacoInstance.updateOptions({ wordWrap: editorState.wordWrap ? 'on' : 'off' });
    }
    persistEditorState();
  });

  // ── Refresh tree ──
  refreshBtn?.addEventListener('click', () => loadFileTree());

  // ── New file button ──
  newFileBtn?.addEventListener('click', async () => {
    if (window.demoGuard?.()) return;
    const filename = await showPromptModal({
      title: 'Create New File',
      description: 'Enter a filename (e.g. contact.php, assets/css/custom.css, assets/js/utils.js).',
      placeholder: 'filename.php',
      confirmLabel: 'Create',
    });
    if (!filename || !filename.trim()) return;

    const path = filename.trim();
    // Validate extension
    const ext = path.split('.').pop()?.toLowerCase();
    const allowed = ['php', 'css', 'js', 'json'];
    if (!ext || !allowed.includes(ext)) {
      showToast(`Only ${allowed.join(', ')} files can be created.`, 'warning');
      return;
    }

    // Attempt to create via the backend
    setStatus('Creating…');
    const { ok, error } = await api.post('/files/create', { path });
    if (!ok) {
      showToast(error?.message || 'Could not create file.', 'error');
      setStatus('Create failed', 'error');
      return;
    }

    // Refresh tree and open the new file
    await loadFileTree();
    await openFile(path);
    showToast(`Created ${path}`, 'success');
  });

  // ── Cmd+S to save ──
  const keyHandler = (e) => {
    if (editorState.disposed) {
      document.removeEventListener('keydown', keyHandler);
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      saveCurrentFile();
    }
  };
  document.addEventListener('keydown', keyHandler);

  // ── Load file tree ──
  const loadFileTree = async () => {
    const { ok, data, error } = await api.get('/files');
    if (!ok || !data?.files?.length) {
      if (treeEl) treeEl.innerHTML = '<div class="text-xs text-vs-text-ghost py-8 text-center">No files found. Generate a site first.</div>';
      if (treePromptsEl) treePromptsEl.innerHTML = '';
      return;
    }
    editorState.files = data.files;
    
    // Split into three sections: site files, config files (_root/), and prompts
    editorState.treeData = {
      site: buildTree(data.files.filter(f => !f.path.startsWith('_prompts/') && !f.path.startsWith('_root/'))),
      config: buildTree(data.files.filter(f => f.path.startsWith('_root/')), '_root/'),
      prompts: buildTree(data.files.filter(f => f.path.startsWith('_prompts/')), '_prompts/')
    };
    
    renderTree();
  };

  // ── Initialize Monaco ──
  const initMonaco = async () => {
    if (!monacoContainerEl) return;

    let monaco;
    try {
      monaco = await ensureMonacoReady();
    } catch {
      showToast('Monaco editor is not available.', 'warning');
      return;
    }

    editorState.monaco = monaco;
    const editorTheme = monacoThemeForCurrentUi();
    monaco.editor.setTheme(editorTheme);

    // Create Monaco inside the dedicated container (starts hidden)
    const monacoEditor = monaco.editor.create(monacoContainerEl, {
      value: '',
      language: 'php',
      theme: editorTheme,
      automaticLayout: true,
      minimap: { enabled: true, maxColumn: 80 },
      fontSize: editorState.fontSize,
      lineHeight: 21,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: editorState.wordWrap ? 'on' : 'off',
      scrollBeyondLastLine: false,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      renderLineHighlight: 'line',
      bracketPairColorization: { enabled: true },
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      padding: { top: 8 },
    });

    editorState.monacoInstance = monacoEditor;

    // Track dirty state on content change
    monacoEditor.onDidChangeModelContent(() => markDirty());

    // ── AI Inline Code Editor (Cmd+K) ──
    monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, async () => {
      // 1. Guard against read-only or empty state
      if (editorState.monacoInstance.getOption(monaco.editor.EditorOption.readOnly)) {
        showToast('Cannot use inline AI on a read-only file.', 'warning');
        return;
      }
      const activePath = editorState.activeTab;
      if (!activePath) return;

      // 2. Extract selected code
      const model = editorState.monacoInstance.getModel();
      let selection = editorState.monacoInstance.getSelection();
      let selectedText = model.getValueInRange(selection);

      // If nothing is highlighted, grab the current line contextually
      if (!selectedText || selectedText.trim() === '') {
        const pos = editorState.monacoInstance.getPosition();
        const lineContent = model.getLineContent(pos.lineNumber);
        if (lineContent.trim() === '') {
          showToast('Highlight a block of code to edit.', 'warning');
          return;
        }
        selectedText = lineContent;
        // Visually expand selection to the line so the user knows what was targeted
        editorState.monacoInstance.setSelection(new monaco.Range(pos.lineNumber, 1, pos.lineNumber, model.getLineMaxColumn(pos.lineNumber)));
      }

      // 3. Prompt user for changes
      const instruction = await showPromptModal({
        title: 'Inline AI Edit',
        label: 'Instruction',
        placeholder: 'e.g. Turn this list into a responsive 3-column grid...',
        confirmLabel: 'Generate',
        inputType: 'textarea',
      });

      if (!instruction) return; // User cancelled modal

      // 4. Run the AI code modification inline with a modal loader
      const originalContent = editorState.monacoInstance.getValue();
      editorState.monacoInstance.updateOptions({ readOnly: true });
      
      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 z-[100] flex items-center justify-center bg-[var(--vs-bg)]/50 backdrop-blur-sm';
      overlay.innerHTML = `
        <div class="flex items-center gap-4 px-6 py-4 rounded-xl" style="background: var(--vs-bg-surface); border: 1px solid var(--vs-border-medium); box-shadow: var(--vs-shadow-lg), var(--vs-cream-inset);">
          <div style="color: var(--vs-accent);">${icons.box}</div>
          <div class="vs-loading gap-1.5 opacity-70"><i></i><i></i><i></i></div>
          <span class="text-sm font-medium" style="color: var(--vs-text-primary);" id="ai-inline-status">AI is writing code...</span>
        </div>
      `;
      if (monacoContainerEl) {
        monacoContainerEl.style.position = 'relative';
        monacoContainerEl.appendChild(overlay);
      }

      setStatus('AI is editing...', 'muted');

      try {
        await apiStream('/ai/prompt', {
          user_prompt: instruction,
          action_type: 'inline_edit',
          action_data: { path: activePath, selection: selectedText },
        }, {
          onStatus: (msg) => { 
            const el = document.getElementById('ai-inline-status'); 
            if (el) el.textContent = 'Generating...'; 
          },
          onFile: () => { 
            const el = document.getElementById('ai-inline-status'); 
            if (el) el.textContent = 'Applying changes...'; 
          },
          onError: (err) => {
            showToast(err.message || 'Generation failed', 'error');
          },
          onDone: async (res) => {
            const hasModified = res.files_modified?.some(f => {
              const fPath = typeof f === 'string' ? f : (f?.path || '');
              return fPath.replace(/^\//, '') === activePath.replace(/^\//, '');
            });
            if (hasModified) {
              // Re-fetch the file content with cache buster
              const { ok, data } = await api.get(`/files/content?path=${encodeURIComponent(activePath)}&_t=${Date.now()}`);
              if (ok && data?.content) {
                const newContent = data.content;
                
                // Revert the backend file so this is strictly an unsaved edit
                await api.put('/files/content', { path: activePath, content: originalContent });

                const model = editorState.monacoInstance.getModel();
                model.setValue(newContent);
                // Also update the buffer
                const tab = editorState.openTabs.find(t => t.path === activePath);
                if (tab) {
                  tab._buffer = newContent;
                  tab.baseline = originalContent; // Keep baseline synced with backend
                }
                
                markDirty();
                showToast('Review changes and save.', 'success');
              }
            } else if (!res.partial) {
              showToast('Complete (No changes made to this file)', 'info');
            }
          }
        });
      } finally {
        editorState.monacoInstance.updateOptions({ readOnly: false });
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        setStatus('Ready', 'muted');
      }
    });
  };

  // ── Boot sequence ──
  await Promise.all([loadFileTree(), initMonaco()]);

  // ── Restore previously open tabs (if returning from another route) ──
  if (editorState._pendingRestore && editorState._pendingRestore.tabs.length > 0) {
    const { tabs, active } = editorState._pendingRestore;
    editorState._pendingRestore = null;

    // Open each tab quietly (load content)
    for (const path of tabs) {
      // Check the path actually exists in the file tree
      if (!editorState.files.some(f => f.path === path)) continue;
      const { ok, data } = await api.get(`/files/content?path=${encodeURIComponent(path)}`);
      if (ok && typeof data?.content === 'string') {
        editorState.openTabs.push({ path, baseline: data.content, dirty: false });
      }
    }

    if (editorState.openTabs.length > 0) {
      const restoreActive = active && editorState.openTabs.find(t => t.path === active)
        ? active
        : editorState.openTabs[0].path;
      hideEmptyState();
      await switchToTab(restoreActive);
      setEditorContent(
        editorState.openTabs.find(t => t.path === restoreActive)?.baseline || '',
        restoreActive,
      );
      setStatus('Ready');
    }
  }
}

function monacoThemeForCurrentUi() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'vs' : 'vs-dark';
}

async function ensureMonacoReady() {
  if (window.monaco?.editor) {
    return window.monaco;
  }

  if (monacoLoadPromise) {
    return monacoLoadPromise;
  }

  monacoLoadPromise = new Promise((resolve, reject) => {
    const loadMain = () => {
      if (!window.require) {
        reject(new Error('Monaco loader is unavailable.'));
        return;
      }

      window.MonacoEnvironment = {
        getWorkerUrl: function (workerId, label) {
          return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: '${window.location.origin}/_studio/ui/lib/monaco/'
            };
            importScripts('${window.location.origin}/_studio/ui/lib/monaco/vs/base/worker/workerMain.js');
          `)}`;
        }
      };

      window.require.config({
        paths: { vs: '/_studio/ui/lib/monaco/vs' },
      });
      window.require(['vs/editor/editor.main'], () => {
        resolve(window.monaco);
      }, () => {
        reject(new Error('Could not load Monaco editor modules.'));
      });
    };

    const existing = document.getElementById('vs-monaco-loader-script');
    if (existing) {
      if (window.require) {
        loadMain();
      } else {
        existing.addEventListener('load', loadMain, { once: true });
        existing.addEventListener('error', () => reject(new Error('Could not load Monaco loader.')), { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'vs-monaco-loader-script';
    script.src = '/_studio/ui/lib/monaco/vs/loader.js';
    script.async = true;
    script.onload = loadMain;
    script.onerror = () => reject(new Error('Could not load Monaco loader.'));
    document.head.appendChild(script);
  }).catch((error) => {
    monacoLoadPromise = null;
    throw error;
  });

  return monacoLoadPromise;
}

async function openCodeEditorModal(initialPath = '') {
  const existing = document.getElementById('vs-code-editor-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'vs-code-editor-overlay';
  overlay.className = 'vs-modal-overlay';
  overlay.innerHTML = `
    <div class="vs-modal vs-code-modal" id="vs-code-modal">
      <div class="vs-code-modal-toolbar">
        <h2 class="vs-code-modal-title">Code Editor</h2>
        <div class="vs-code-select-wrap">
          <select id="vs-code-file-select" class="vs-input"></select>
        </div>
        <div class="vs-code-toolbar-actions">
          <button id="vs-code-reload-btn" type="button" class="vs-btn vs-btn-ghost vs-btn-sm">Reload</button>
          <button id="vs-code-save-btn" type="button" class="vs-btn vs-btn-primary vs-btn-sm" disabled>Save</button>
          <button id="vs-code-close-btn" type="button" class="vs-btn vs-btn-secondary vs-btn-sm">Close</button>
        </div>
      </div>
      <div class="vs-code-editor-shell">
        <div id="vs-code-editor-host" class="vs-code-editor-host">
          <div class="text-sm text-vs-text-ghost py-12 text-center">Loading editor…</div>
        </div>
      </div>
      <div class="vs-code-modal-footer">
        <div id="vs-code-meta" class="vs-code-meta">Loading files…</div>
        <div id="vs-code-status" class="vs-code-status">Initializing…</div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  const selectEl = overlay.querySelector('#vs-code-file-select');
  const saveBtn = overlay.querySelector('#vs-code-save-btn');
  const reloadBtn = overlay.querySelector('#vs-code-reload-btn');
  const closeBtn = overlay.querySelector('#vs-code-close-btn');
  const metaEl = overlay.querySelector('#vs-code-meta');
  const statusEl = overlay.querySelector('#vs-code-status');
  const hostEl = overlay.querySelector('#vs-code-editor-host');

  const state = {
    files: [],
    path: '',
    baseline: '',
    editor: null,
    editorCleanup: null,
    closed: false,
  };

  const setStatus = (message, type = 'muted') => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.state = type;
  };

  const getSelectedMeta = () => state.files.find((f) => f.path === state.path) || null;
  const isDirty = () => Boolean(state.editor) && state.editor.getValue() !== state.baseline;

  const updateMeta = () => {
    if (!metaEl) return;
    const file = getSelectedMeta();
    if (!file) {
      metaEl.textContent = 'No file selected';
      return;
    }
    const size = file.size ? `${(Number(file.size) / 1024).toFixed(1)} KB` : '0 KB';
    const modified = file.modified ? new Date(file.modified).toLocaleString() : 'Unknown date';
    metaEl.textContent = `${file.path} • ${size} • ${modified}`;
  };

  const updateSaveButton = () => {
    if (!saveBtn) return;
    const dirty = isDirty();
    saveBtn.disabled = !dirty;
    saveBtn.textContent = dirty ? 'Save Changes' : 'Saved';
    if (dirty) {
      setStatus('Unsaved changes', 'warning');
    } else if (state.path) {
      setStatus('Saved', 'success');
    }
  };

  const closeEditor = async () => {
    if (state.closed) return;
    if (isDirty()) {
      const discard = await showConfirmModal({
        title: 'Discard unsaved changes?',
        description: 'You have unsaved edits in the code editor.',
        confirmLabel: 'Discard Changes',
        cancelLabel: 'Keep Editing',
        danger: true,
      });
      if (!discard) return;
    }

    state.closed = true;
    if (state.editorCleanup?.dispose) {
      state.editorCleanup.dispose();
      state.editorCleanup = null;
    }
    if (state.editor) {
      state.editor.dispose();
      state.editor = null;
    }
    closeModal(overlay);
  };

  const applyFileContent = (content, fileMeta = null) => {
    if (!state.editor) return;
    state.editor.setValue(content);
    state.baseline = content;

    const language = fileMeta?.language || getCodeLanguage(state.path);
    if (state.editor.setLanguage) {
      state.editor.setLanguage(language);
    }

    updateMeta();
    updateSaveButton();
  };

  const loadFile = async (pathToLoad, { silent = false } = {}) => {
    if (!pathToLoad || !state.editor) return false;

    state.path = pathToLoad;
    if (!silent) {
      setStatus('Loading file…');
    }

    const { ok, data, error } = await api.get(`/files/content?path=${encodeURIComponent(pathToLoad)}`);
    if (!ok) {
      showToast(error?.message || 'Could not load file.', 'error');
      setStatus('Load failed', 'error');
      return false;
    }

    const content = typeof data?.content === 'string' ? data.content : '';
    applyFileContent(content, data?.file || getSelectedMeta());
    return true;
  };

  const confirmDiscardIfDirty = async () => {
    if (!isDirty()) return true;
    const discard = await showConfirmModal({
      title: 'Discard unsaved changes?',
      description: 'Switching files will lose your unsaved edits.',
      confirmLabel: 'Discard Changes',
      cancelLabel: 'Keep Editing',
      danger: true,
    });
    return discard;
  };

  const handleSelectChange = async (nextPath) => {
    if (!nextPath || nextPath === state.path) return;

    const canSwitch = await confirmDiscardIfDirty();
    if (!canSwitch) {
      if (selectEl) selectEl.value = state.path;
      return;
    }

    await loadFile(nextPath);
  };

  const saveCurrentFile = async () => {
    if (!state.editor || !state.path || !saveBtn) return;

    const nextContent = state.editor.getValue();
    if (nextContent === state.baseline) {
      updateSaveButton();
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';
    setStatus('Saving…');

    const { ok, error } = await api.put('/files/content', {
      path: state.path,
      content: nextContent,
    });

    if (!ok) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
      showToast(error?.message || 'Could not save file.', 'error');
      setStatus('Save failed', 'error');
      return;
    }

    state.baseline = nextContent;
    updateSaveButton();
    setStatus('Saved', 'success');
    showToast(`Saved ${state.path}`, 'success');

    if (state.path.toLowerCase().endsWith('.css')) {
      window.sendPreviewMessage?.('voxelsite:reload-css');
    } else {
      window.sendPreviewMessage?.('voxelsite:reload');
    }
    // Hard-refresh the preview to guarantee the user sees changes immediately
    setTimeout(() => window.refreshPreview?.(), 400);
    window.refreshPublishState?.({ silent: true });

  };

  const escHandler = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeEditor();
    }
  };

  closeBtn?.addEventListener('click', () => closeEditor());
  reloadBtn?.addEventListener('click', async () => {
    if (!state.path) return;
    const canReload = await confirmDiscardIfDirty();
    if (!canReload) return;
    await loadFile(state.path);
  });
  saveBtn?.addEventListener('click', () => saveCurrentFile());
  selectEl?.addEventListener('change', (event) => {
    handleSelectChange(event.target.value);
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeEditor();
    }
  });
  document.addEventListener('keydown', escHandler);

  const removeEscHandler = () => document.removeEventListener('keydown', escHandler);
  overlay.addEventListener('transitionend', () => {
    if (!document.body.contains(overlay)) {
      removeEscHandler();
    }
  });

  try {
    const filesResponse = await api.get('/files');

    if (!filesResponse.ok || !filesResponse.data?.files?.length) {
      const errMsg = filesResponse.error?.message || 'No editable files found.';
      showToast(errMsg, 'error');
      closeEditor();
      return;
    }

    const files = filesResponse.data.files;
    state.files = files;

    if (selectEl) {
      selectEl.innerHTML = files.map((file) => {
        const group = file.group ? `${String(file.group).toUpperCase()} · ` : '';
        return `<option value="${escapeHtml(file.path)}">${escapeHtml(group + file.path)}</option>`;
      }).join('');
    }

    const preferredPath = files.find((f) => f.path === initialPath)?.path || files[0].path;
    state.path = preferredPath;
    if (selectEl) selectEl.value = preferredPath;

    hostEl.innerHTML = '';
    let monaco = null;
    try {
      monaco = await ensureMonacoReady();
    } catch (monacoError) {
      showToast('Monaco is not available yet. Using fallback editor.', 'warning');
      setStatus('Fallback editor active', 'warning');
    }

    if (monaco?.editor) {
      const editorTheme = monacoThemeForCurrentUi();
      monaco.editor.setTheme(editorTheme);
      const monacoEditor = monaco.editor.create(hostEl, {
        value: '',
        language: getCodeLanguage(preferredPath),
        theme: editorTheme,
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 13,
        lineHeight: 21,
        tabSize: 2,
        insertSpaces: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      });

      state.editor = {
        getValue: () => monacoEditor.getValue(),
        setValue: (value) => monacoEditor.setValue(value),
        setLanguage: (language) => {
          const model = monacoEditor.getModel();
          if (model) {
            monaco.editor.setModelLanguage(model, language);
          }
        },
        dispose: () => monacoEditor.dispose(),
      };
      state.editorCleanup = monacoEditor.onDidChangeModelContent(() => {
        updateSaveButton();
      });
    } else {
      hostEl.innerHTML = '<textarea id="vs-code-editor-fallback" class="vs-textarea vs-code-fallback-input" spellcheck="false"></textarea>';
      const textarea = hostEl.querySelector('#vs-code-editor-fallback');
      const inputHandler = () => updateSaveButton();
      textarea?.addEventListener('input', inputHandler);

      state.editor = {
        getValue: () => textarea?.value || '',
        setValue: (value) => {
          if (!textarea) return;
          textarea.value = value;
        },
        setLanguage: () => {},
        dispose: () => {
          textarea?.removeEventListener('input', inputHandler);
        },
      };
    }

    await loadFile(preferredPath, { silent: true });
    setStatus('Ready');
  } catch (error) {
    showToast(error?.message || 'Could not initialize code editor.', 'error');
    closeEditor();
  } finally {
    const observer = new MutationObserver(() => {
      if (!document.body.contains(overlay)) {
        removeEscHandler();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

export { renderEditorLayout, initEditorPage, monacoThemeForCurrentUi, ensureMonacoReady, openCodeEditorModal };
