/**
 * VoxelSite Studio — Application Entry Point
 *
 * Mounts the SPA shell into #app, initializes the session,
 * wires up routing, and renders the global layout.
 *
 * Layout structure (from Design Doc Part VI):
 * ┌─────────────────────────────────────────────────────┐
 * │ TOP BAR (44px)                                      │
 * ├────────────────────┬────────────────────────────────┤
 * │  CONVERSATION      │  PREVIEW (The Creation)        │
 * │  (440px resizable) │  (remaining width)             │
 * ├────────────────────┴────────────────────────────────┤
 * │ STATUS BAR (36px)                                   │
 * └─────────────────────────────────────────────────────┘
 *
 * Non-chat routes (pages, assets, etc.) use the full width
 * with max-width constraints per Design Doc.
 */

import { store } from './state.js';
import { router } from './router.js';
import { api, apiStream } from './api.js';
import { initializeTheme, toggleTheme } from './theme.js';
import { initVisualEditor, toggleVisualEditor, deactivateVisualEditor, isVisualEditorActive } from './visual-editor.js';

// ═══════════════════════════════════════════
//  Icons (inline SVG, no external requests)
// ═══════════════════════════════════════════

import { icons } from './src/icons.js';
import { renderEditorLayout, initEditorPage, monacoThemeForCurrentUi, ensureMonacoReady, openCodeEditorModal } from './src/views/editor.js';
import { renderSettingsView, loadSettings, confirmUnsavedChanges, bindSettingsEvents, bindEmailSettingsEvents } from './src/views/settings.js';
import { showToast, showToastWithAction } from './src/ui/toasts.js';
import { escapeHtml, escapeAttr, getCodeLanguage } from './src/helpers.js';
import { closeModal, showConfirmModal, showPromptModal } from './src/ui/modals.js';


// ═══════════════════════════════════════════
//  Nav Items
// ═══════════════════════════════════════════

const NAV_ITEMS = [
  { route: 'chat',        label: 'Chat' },
  { route: 'editor',      label: 'Editor' },
  { route: 'assets',      label: 'Assets' },
  // Collections removed from v1.0.0 — ships in v1.1 with full AI integration
  // { route: 'collections', label: 'Collections' },
  { route: 'forms',       label: 'Forms' },
  { route: 'actions',      label: 'Actions' },
  { route: 'snapshots',   label: 'Snapshots',  roles: ['owner', 'editor'] },
  { route: 'settings',    label: 'Settings',   roles: ['owner'] },
];

/** Routes that use the split-panel dashboard layout */
const DASHBOARD_ROUTES = ['chat', 'editor'];
const FIRST_RUN_GUIDE_KEY = 'vs-first-run-guide-dismissed';
const ONBOARDING_DRAFT_KEY = 'vs-onboarding-draft-v1';
const COMMAND_RECENTS_KEY = 'vs-prompt-recents-v1';
const COMMAND_PINS_KEY = 'vs-prompt-pins-v1';
const CODE_COLLAPSE_MIN_LINES = 8;
const CODE_COLLAPSE_PREVIEW_LINES = 5;

/** Image attachment constraints */
const MAX_IMAGE_ATTACHMENTS = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/** Pending image attachments for the next send */
let pendingImages = [];

/** Demo mode flag — read once from the server-rendered data attribute */
const IS_DEMO = document.documentElement.dataset.demo === 'true';

/**
 * Block a write action in demo mode.
 * Shows a warning toast and returns true (blocked), or false (allowed).
 */
function demoGuard() {
  if (!IS_DEMO) return false;
  showToast('Demo mode \u2014 this action is disabled.', 'warning');
  return true;
}

/**
 * Check if the current user has write access (owner or editor).
 * Viewers are read-only.
 */
function canWrite() {
  const user = store.get('user');
  return user && user.role !== 'viewer';
}

/**
 * Block a write action for viewers.
 * Shows a warning toast and returns true (blocked), or false (allowed).
 */
function viewerGuard() {
  if (canWrite()) return false;
  showToast('You have read-only access.', 'warning');
  return true;
}

/**
 * Check if current user is the owner.
 */
function isOwner() {
  const user = store.get('user');
  return user && user.role === 'owner';
}

// Expose for sub-views (editor, settings, etc.)
window.IS_DEMO = IS_DEMO;
window.demoGuard = demoGuard;
window.canWrite = canWrite;
window.viewerGuard = viewerGuard;
window.isOwner = isOwner;

// ═══════════════════════════════════════════
//  Mount
// ═══════════════════════════════════════════

const appRoot = document.getElementById('app');

/**
 * Initialize the application.
 */
async function init() {
  initializeTheme();
  initVisualEditor();

  // Configure marked to escape raw HTML in AI responses.
  // Without this, HTML tags in streamed code (e.g. <div>, <section>)
  // render as actual DOM elements inside the chat bubble, breaking the UI.
  if (window.marked) {
    window.marked.use({
      renderer: {
        html(token) {
          // Escape the raw HTML so it's shown as text, not rendered
          return escapeHtml(typeof token === 'string' ? token : token.text);
        }
      }
    });
  }
  // Check session first
  const sessionResult = await api.get('/auth/session');

  if (!sessionResult.ok || !sessionResult.data?.user) {
    // Not authenticated — redirect to login page
    // For now, show a basic login notice
    renderLoginRedirect();
    return;
  }

  // Store user + session token + site name
  store.batch(() => {
    store.set('user', sessionResult.data.user);
    store.set('sessionToken', sessionResult.data.token);
    store.set('siteName', sessionResult.data.site_name || '');
  });

  // Update document title with site name
  const siteName = sessionResult.data.site_name;
  if (siteName) {
    document.title = `Studio — ${siteName}`;
  }

  // Register routes
  window.addEventListener('beforeunload', (e) => {
    if (window.__hasUnsavedEditorChanges?.()) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  router
    .beforeEach(async (to, from) => {
      if (from.startsWith('editor') && !to.startsWith('editor')) {
        if (window.__hasUnsavedEditorChanges?.()) {
          return await confirmUnsavedChanges();
        }
      }
      return true;
    })
    .on('chat',              () => renderApp())
    .on('editor',            () => renderApp())
    .on('pages',             () => renderApp())
    .on('pages/:slug',       () => renderApp())
    .on('assets',            () => renderApp())
    // Collections routes disabled for v1.0.0
    // .on('collections',       () => renderApp())
    // .on('collections/:slug', () => renderApp())
    .on('forms',             () => renderApp())
    .on('forms/:formId',     () => renderApp())
    .on('actions',           () => renderApp())
    .on('actions/:actionId', () => renderApp())
    .on('snapshots',         () => renderApp())
    .on('settings',          () => renderApp())
    .on('team',              () => renderApp())
    .on('profile',           () => renderApp())
    .onNotFound(             () => router.navigate('chat'));

  // Listen for state changes that affect the shell
  // Theme changes are handled inline by the toggle click handler —
  // no re-render needed (CSS vars swap via data-theme attribute).
  store.on('user', (user) => { if (!user) renderLoginRedirect(); });

  // Pre-fetch pages list so the Chat empty state shows context-aware
  // suggestions on first render (design actions vs enhancement actions).
  prefetchPagesForContext();



  // Start routing
  router.start();
}

/**
 * Lightweight pre-fetch of pages so renderEmptyChat() knows
 * whether a site exists before the user visits the Pages tab.
 */
async function prefetchPagesForContext() {
  try {
    const { ok, data } = await api.get('/pages');
    if (ok && Array.isArray(data?.pages)) {
      store.set('pages', data.pages);
      // If Chat is currently showing the empty state, refresh it
      const chatMessages = document.getElementById('chat-messages');
      const emptyState = chatMessages?.querySelector('.vs-empty-state');
      if (emptyState) {
        chatMessages.innerHTML = renderEmptyChat();
        bindQuickPromptButtons();
      }
    }
  } catch (_) {
    // Non-critical — cards will default to "no site" state
  }
}



// ═══════════════════════════════════════════
//  App Shell Renderer
// ═══════════════════════════════════════════

function renderApp() {
  const route = store.get('route');
  const isDashboard = DASHBOARD_ROUTES.includes(route);

  // Visual editor state must not survive route changes — the DOM is about to be rebuilt
  if (isVisualEditorActive()) {
    deactivateVisualEditor();
  }

  // Dispose editor page Monaco instance if navigating away from editor
  if (route !== 'editor' && window.__vsEditorPage) {
    window.__vsEditorPage.dispose();
    window.__vsEditorPage = null;
  }

  let mainContent;
  if (route === 'editor') {
    mainContent = renderEditorLayout();
  } else if (isDashboard) {
    mainContent = renderDashboardLayout();
  } else {
    mainContent = renderContentLayout();
  }

  appRoot.innerHTML = `
    ${renderTopBar()}
    <div class="fixed top-[48px] bottom-[32px] left-0 right-0 overflow-hidden">
      ${mainContent}
    </div>
    ${renderStatusBar()}
    ${renderCommandPalette()}
    ${renderTeamModals()}
    ${renderOnboardingModal()}
  `;

  bindAppEvents();

  // Initialize editor page after DOM is ready
  if (route === 'editor') {
    initEditorPage();
  }
}

// ═══════════════════════════════════════════
//  Top Bar (44px)
// ═══════════════════════════════════════════

function renderTopBar() {
  const route = store.get('route');
  const user = store.get('user');
  const theme = store.get('theme');

  const navHtml = NAV_ITEMS
    .filter(item => {
      // Role gate: if item has roles array, user must have one of them
      if (item.roles && user) {
        return item.roles.includes(user.role);
      }
      return true;
    })
    .map(item => {
    const isActive = route === item.route || route.startsWith(item.route + '/');
    return `
      <a href="#/${item.route}"
         class="vs-nav-item ${isActive ? 'vs-nav-item-active' : ''}">
        ${item.label}
      </a>
    `;
  }).join('');

  return `
    <header class="vs-topbar">
      <div class="vs-topbar-inner">
        <!-- Logo + Nav -->
        <div class="flex items-center gap-1">
          <a href="#/chat" class="vs-logo">
            <span class="vs-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path class="voxel-top" style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
                <path class="voxel-left" style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
                <path class="voxel-right" style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
              </svg>
            </span>
            <span class="vs-logo-text hidden sm:inline">${escapeHtml(store.get('siteName') || 'VoxelSite')}</span>
          </a>
          <nav class="flex items-center gap-0.5" aria-label="Studio navigation">
            ${navHtml}
          </nav>
          ${IS_DEMO ? `
            <span class="vs-demo-badge" title="Read-only preview — install your own copy to get started.">
              ${icons.eye} Demo
            </span>
          ` : ''}
        </div>

        <!-- Right: Search hint + Theme + User -->
        <div class="flex items-center gap-1.5">
          <button id="btn-command-palette"
            class="vs-btn-ghost vs-btn-sm hidden sm:flex items-center gap-2"
            title="Prompt library">
            <span class="text-vs-text-ghost">Prompts...</span>
            <span class="vs-kbd">⌘K</span>
          </button>

          <button id="btn-theme-toggle"
            class="vs-btn-ghost vs-btn-icon"
            title="${theme === 'dark' ? 'Switch to light' : 'Switch to dark'}">
            ${theme === 'dark' ? icons.sun : icons.moon}
          </button>

          <div class="relative" id="user-menu-container">
            <button id="btn-user-menu"
              class="vs-btn vs-btn-ghost vs-btn-sm vs-user-btn">
              ${icons.user}
              <span class="hidden sm:inline">${escapeHtml(user?.name || 'Admin')}</span>
            </button>
            <div id="user-dropdown" class="hidden vs-dropdown right-0 top-full mt-1">
              ${user?.role !== 'owner' ? `
                <div style="padding: 8px 12px 4px;">
                  <span style="display: inline-block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; background: var(--vs-bg-inset); color: var(--vs-text-tertiary); border: 1px solid var(--vs-border-subtle);">${user?.role === 'editor' ? 'Editor' : 'Viewer'}</span>
                </div>
              ` : ''}
              <a href="#/profile" id="btn-edit-profile" class="vs-dropdown-item">
                ${icons.pencil} Edit Profile
              </a>
              ${user?.role === 'owner' ? `
                <a href="#/team" id="btn-team-nav" class="vs-dropdown-item">
                  ${icons.users} Team Members
                </a>
              ` : ''}
              <div style="border-top: 1px solid var(--vs-border-subtle); margin: 4px 0;"></div>
              <button id="btn-logout" class="vs-dropdown-item">
                ${icons.logOut} Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;
}

// ═══════════════════════════════════════════
//  Dashboard Layout (Chat + Preview)
// ═══════════════════════════════════════════

function renderDashboardLayout() {
  const sidebarWidth = store.get('sidebarWidth');
  const activeConvId = store.get('activeConversationId');
  const activePageScope = store.get('activePageScope');
  const scopeLabel = formatPageScopeLabel(activePageScope);

  return `
    <div class="flex h-full">
      <!-- Conversation Panel -->
      <div id="conversation-panel" class="h-full border-r border-vs-border-subtle bg-vs-bg-base flex flex-col relative"
           style="width: ${sidebarWidth}px; min-width: 360px; max-width: 580px;">

        <!-- Resize Handle -->
        <div id="resize-handle" class="vs-resize-handle"></div>

        <!-- Context Bar -->
        <div class="vs-panel-header">
          <div class="flex items-center gap-2">
            <button id="btn-scope-selector"
              class="vs-btn vs-btn-ghost vs-btn-sm" style="gap: 4px;">
              ${icons.fileText}
              <span id="scope-label" class="text-vs-text-secondary">${escapeHtml(scopeLabel)}</span>
              ${icons.chevronDown}
            </button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-new-chat"
              class="vs-btn vs-btn-ghost vs-btn-icon"
              title="New conversation">
              ${icons.newChat}
            </button>
            <button id="btn-toggle-history"
              class="vs-btn vs-btn-ghost vs-btn-icon"
              title="Conversation history">
              ${icons.history}
            </button>
          </div>
        </div>

        <!-- Conversation History Panel (hidden by default) -->
        <div id="conversation-history-panel" class="hidden border-b border-vs-border-subtle bg-vs-bg-surface overflow-y-auto shrink-0" style="max-height: 280px;">
          <div id="conversation-list" class="py-1">
            <div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>
          </div>
        </div>

        <!-- Chat Messages Area -->
        <div id="chat-messages" class="flex-1 overflow-y-auto px-5 py-6">
          ${renderEmptyChat()}
        </div>

        <!-- Prompt Bar -->
        <div class="vs-prompt-area">
          <div class="vs-prompt-container">
            <input type="file" id="image-file-input" accept="image/jpeg,image/png,image/gif,image/webp" multiple class="hidden" />
            <div id="image-attachments" class="vs-image-attachments" hidden></div>
            <textarea id="prompt-input"
              class="vs-prompt-input vs-textarea"
              placeholder="Describe what you want to build..."
              rows="3"
              style="max-height: 200px;"></textarea>
            <div class="vs-prompt-toolbar">
              <button id="btn-attach-image"
                class="vs-prompt-attach-btn"
                title="Attach images">
                ${icons.image}
              </button>
              <button id="btn-send"
                class="vs-prompt-send"
                title="Send (⌘+Enter)">
                ${icons.send}
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between mt-2 px-1">
            <span class="text-2xs text-vs-text-ghost">⌘+Enter to send · drop images to attach</span>
          </div>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="flex-1 h-full bg-vs-bg-well flex flex-col">
        <!-- Preview Toolbar (aligned with chat header) -->
        <div class="vs-panel-header vs-preview-toolbar">
          <div class="vs-device-toggle">
            <button class="vs-device-btn vs-device-btn-active" data-device="desktop" title="Desktop">${icons.monitor}</button>
            <button class="vs-device-btn" data-device="tablet" title="Tablet">${icons.tabletSmartphone}</button>
            <button class="vs-device-btn" data-device="mobile" title="Mobile">${icons.smartphone}</button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-visual-editor" class="vs-btn vs-btn-ghost vs-btn-xs" title="Visual editor (V)">
              ${icons.pencil} Visual
            </button>
            <button id="btn-edit-code" class="vs-btn vs-btn-ghost vs-btn-xs" title="Source code editor">
              ${icons.fileCode} Code
            </button>
            <button id="btn-refresh-preview" class="vs-btn vs-btn-ghost vs-btn-xs" title="Refresh Preview">
              ${icons.rotateCcw} Refresh
            </button>
            <div class="vs-topbar-divider"></div>
            <button id="btn-external-preview" class="vs-btn vs-btn-ghost vs-btn-icon" title="Open in new tab">
              ${icons.externalLink}
            </button>
          </div>
        </div>

        <!-- Preview Iframe -->
        <div id="preview-frame-container" class="vs-preview-frame" style="margin: 16px 20px 20px 20px;">
          <iframe id="preview-iframe" class="w-full h-full border-0" src="/_studio/api/router.php?_path=%2Fpreview&path=index.php"
            sandbox="allow-scripts allow-same-origin"
            data-voxelsite-preview
            title="Website preview"></iframe>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════
//  Content Layout (Pages, Assets, etc.)
// ═══════════════════════════════════════════

function renderContentLayout() {
  const route = store.get('route');
  const params = store.get('routeParams');

  let maxWidth = '1100px';
  if (route === 'settings' || route === 'profile') maxWidth = '680px';
  if (route === 'forms/:formId') maxWidth = '800px';
  if (route === 'actions/:actionId') maxWidth = '900px';

  return `
    <div class="h-full overflow-y-auto">
      <div class="mx-auto px-6 py-8" style="max-width: ${maxWidth};">
        ${renderPageContent(route, params)}
      </div>
    </div>
  `;
}

/**
 * Render page content based on route.
 * Each page view will be its own module in the future.
 * For now, render placeholder screens.
 */
function renderPageContent(route, params) {
  const user = store.get('user');
  const role = user?.role;

  switch (route) {
    case 'assets':
      return renderAssetsView();
    // Collections disabled for v1.0.0
    // case 'collections':
    //   return renderCollectionsView();
    // case 'collections/:slug':
    //   return renderCollectionDetailView(params.slug);
    case 'forms':
      return renderFormsView();
    case 'forms/:formId':
      return renderFormDetailView(params.formId);
    case 'actions':
      return renderActionsView();
    case 'actions/:actionId':
      return renderActionDetailView(params.actionId);
    case 'snapshots':
      return (role === 'owner' || role === 'editor') ? renderSnapshotsView() : renderAccessDenied();
    case 'settings':
      return role === 'owner' ? renderSettingsView() : renderAccessDenied();
    case 'team':
      return role === 'owner' ? renderTeamView() : renderAccessDenied();
    case 'profile':
      return renderProfileView();
    default:
      return renderPlaceholderPage('Not Found', 'This page doesn\'t exist.');
  }
}

function renderAccessDenied() {
  return `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; text-align: center; padding: 40px 24px;">
      <div style="width: 56px; height: 56px; border-radius: 16px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h1 style="font-size: 18px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.02em; margin: 0 0 8px;">Access Denied</h1>
      <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 24px; max-width: 260px; line-height: 1.5;">You don't have permission to view this page.</p>
      <a href="#/chat" style="font-size: 12px; font-weight: 500; color: var(--vs-accent); text-decoration: none; transition: opacity 0.15s;"
         onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">← Back to Chat</a>
    </div>
  `;
}

function renderPlaceholderPage(title, description) {
  return `
    <div class="vs-empty-state" style="min-height: 300px;">
      <div class="vs-empty-icon" style="animation: none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
          <path style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
          <path style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
        </svg>
      </div>
      <h1 class="vs-empty-title">${title}</h1>
      <p class="vs-empty-description" style="margin-bottom: 0;">${description}</p>
    </div>
  `;
}

// ═══════════════════════════════════════════
//  Page Icon Helper (used by chat pages modal)
// ═══════════════════════════════════════════

/**
 * Maps common page slugs to semantic Lucide icons.
 * Falls back to a generic page icon for unknown slugs.
 */
function getPageIcon(slug) {
  const map = {
    index: 'home', home: 'home',
    about: 'users', 'about-us': 'users', team: 'users',
    contact: 'mail', 'contact-us': 'mail',
    services: 'briefcase', work: 'briefcase', portfolio: 'briefcase', projects: 'briefcase',
    blog: 'book', news: 'book', articles: 'book', posts: 'book',
    shop: 'shoppingBag', store: 'shoppingBag', products: 'shoppingBag', pricing: 'shoppingBag',
    faq: 'globe', help: 'globe', support: 'globe',
  };
  const key = (slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  return icons[map[key] || 'layoutGrid'] || icons.layoutGrid;
}

// ═══════════════════════════════════════════
//  Navigation Helpers
// ═══════════════════════════════════════════

/**
 * Navigate to Chat tab and pre-fill the prompt input with a message.
 */
function navigateToChatWithPrompt(prompt) {
  router.navigate('chat');
  // Wait for the Chat view to render, then fill the prompt
  setTimeout(() => {
    const input = document.getElementById('prompt-input');
    if (input) {
      input.value = prompt;
      input.focus();
      // Auto-resize textarea to fit content
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
    }
  }, 150);
}

/**
 * Navigate to the Chat tab and immediately send a prompt, optionally attaching action payloads.
 */
function navigateToChatAndSendPrompt(prompt, options = {}) {
  router.navigate('chat');
  setTimeout(() => {
    const input = document.getElementById('prompt-input');
    const sendBtn = document.getElementById('btn-send');
    if (input && sendBtn) {
      if (options.actionType) input.dataset.actionType = options.actionType;
      if (options.actionData) input.dataset.actionData = options.actionData;
      input.value = prompt;
      sendBtn.click();
    }
  }, 150);
}

// ═══════════════════════════════════════════
//  Profile View
// ═══════════════════════════════════════════

function renderProfileView() {
  const user = store.get('user') || {};

  setTimeout(() => bindProfileEvents(), 0);

  return `
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Edit Profile</h1>
        <p class="vs-page-subtitle">Update your account details.</p>
      </div>

      <!-- Card: Profile -->
      <div class="vs-settings-card">
        <h2 class="vs-settings-card-title">Personal Info</h2>
        <p class="vs-settings-card-subtitle">Your name and email address.</p>
        <div class="flex flex-col gap-4">
          <div>
            <label class="vs-input-label" for="profile-name">Name</label>
            <input type="text" id="profile-name" class="vs-input" value="${escapeHtml(user.name || '')}" placeholder="Your name" />
          </div>
          <div>
            <label class="vs-input-label" for="profile-email">Email</label>
            <input type="email" id="profile-email" class="vs-input" value="${escapeHtml(user.email || '')}" placeholder="you@example.com" />
          </div>
        </div>
        <div class="vs-settings-card-footer">
          <span id="profile-info-feedback" class="text-sm"></span>
          <button id="btn-save-profile" class="vs-btn vs-btn-primary vs-btn-sm">
            Save Profile
          </button>
        </div>
      </div>

      <!-- Card: Password -->
      <div class="vs-settings-card">
        <h2 class="vs-settings-card-title">Change Password</h2>
        <p class="vs-settings-card-subtitle">Use a strong password with at least 8 characters.</p>
        <div class="flex flex-col gap-4">
          <div>
            <label class="vs-input-label" for="profile-current-pw">Current Password</label>
            <input type="password" id="profile-current-pw" class="vs-input" placeholder="Enter current password" autocomplete="current-password" />
          </div>
          <div>
            <label class="vs-input-label" for="profile-new-pw">New Password</label>
            <input type="password" id="profile-new-pw" class="vs-input" placeholder="Enter new password" autocomplete="new-password" />
          </div>
          <div>
            <label class="vs-input-label" for="profile-confirm-pw">Confirm New Password</label>
            <input type="password" id="profile-confirm-pw" class="vs-input" placeholder="Confirm new password" autocomplete="new-password" />
          </div>
        </div>
        <div class="vs-settings-card-footer">
          <span id="profile-pw-feedback" class="text-sm"></span>
          <button id="btn-save-password" class="vs-btn vs-btn-primary vs-btn-sm">
            Update Password
          </button>
        </div>
      </div>
    </div>
  `;
}

function bindProfileEvents() {
  // Save profile (name + email)
  const saveProfileBtn = document.getElementById('btn-save-profile');
  const profileFeedback = document.getElementById('profile-info-feedback');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
      const name = document.getElementById('profile-name')?.value?.trim();
      const email = document.getElementById('profile-email')?.value?.trim();

      if (!name || name.length < 2) {
        if (profileFeedback) {
          profileFeedback.textContent = 'Name must be at least 2 characters.';
          profileFeedback.className = 'text-sm text-vs-error';
        }
        return;
      }

      saveProfileBtn.disabled = true;
      saveProfileBtn.textContent = 'Saving...';

      const { ok, error, data } = await api.put('/auth/profile', { name, email });
      saveProfileBtn.disabled = false;
      saveProfileBtn.textContent = 'Save Profile';

      if (ok && data?.user) {
        store.set('user', data.user);
        if (profileFeedback) {
          profileFeedback.textContent = 'Profile updated.';
          profileFeedback.className = 'text-sm text-vs-success';
        }
        // Update user name in topbar
        setTimeout(() => renderApp(), 800);
      } else {
        if (profileFeedback) {
          profileFeedback.textContent = error?.message || 'Failed to update profile.';
          profileFeedback.className = 'text-sm text-vs-error';
        }
      }
    });
  }

  // Save password
  const savePwBtn = document.getElementById('btn-save-password');
  const pwFeedback = document.getElementById('profile-pw-feedback');
  if (savePwBtn) {
    savePwBtn.addEventListener('click', async () => {
      const currentPw = document.getElementById('profile-current-pw')?.value || '';
      const newPw = document.getElementById('profile-new-pw')?.value || '';
      const confirmPw = document.getElementById('profile-confirm-pw')?.value || '';

      if (!currentPw) {
        if (pwFeedback) {
          pwFeedback.textContent = 'Current password is required.';
          pwFeedback.className = 'text-sm text-vs-error';
        }
        return;
      }

      if (newPw.length < 8) {
        if (pwFeedback) {
          pwFeedback.textContent = 'New password must be at least 8 characters.';
          pwFeedback.className = 'text-sm text-vs-error';
        }
        return;
      }

      if (newPw !== confirmPw) {
        if (pwFeedback) {
          pwFeedback.textContent = 'Passwords do not match.';
          pwFeedback.className = 'text-sm text-vs-error';
        }
        return;
      }

      savePwBtn.disabled = true;
      savePwBtn.textContent = 'Updating...';

      const { ok, error } = await api.put('/auth/password', {
        current_password: currentPw,
        new_password: newPw,
      });

      savePwBtn.disabled = false;
      savePwBtn.textContent = 'Update Password';

      if (ok) {
        // Clear fields
        document.getElementById('profile-current-pw').value = '';
        document.getElementById('profile-new-pw').value = '';
        document.getElementById('profile-confirm-pw').value = '';
        if (pwFeedback) {
          pwFeedback.textContent = 'Password updated.';
          pwFeedback.className = 'text-sm text-vs-success';
        }
      } else {
        if (pwFeedback) {
          pwFeedback.textContent = error?.message || 'Failed to update password.';
          pwFeedback.className = 'text-sm text-vs-error';
        }
      }
    });
  }
}

// ═══════════════════════════════════════════
//  Team Members View (Owner Only)
// ═══════════════════════════════════════════

function renderTeamView() {
  setTimeout(() => loadTeamMembers(), 0);

  return `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 style="font-size: 20px; font-weight: 650; color: var(--vs-text-primary); letter-spacing: -0.025em; margin: 0;">Team</h1>
          <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 4px 0 0;">Manage who has access to this Studio.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-show-roles" class="vs-btn vs-btn-ghost vs-btn-sm" title="View role permissions">
            ${icons.shield} Roles
          </button>
          <button id="btn-add-member" class="vs-btn vs-btn-primary vs-btn-sm">
            ${icons.userPlus || icons.plus} Add Member
          </button>
        </div>
      </div>

      <div class="vs-team-table">
        <div class="vs-team-table-header">
          <span>Member</span>
          <span>Role</span>
          <span>Last active</span>
          <span></span>
        </div>
        <div id="team-list">
          <div style="padding: 32px 20px; text-align: center; font-size: 13px; color: var(--vs-text-ghost);">Loading team…</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Team modals — rendered at appRoot level so they sit above the topbar (z-100)
 * and the statusbar. `position: fixed; inset: 0` covers the full viewport.
 */
function renderTeamModals() {
  return `
    <!-- Add/Edit Member Modal -->
    <div id="team-modal" class="vs-team-modal hidden">
      <div class="vs-team-modal-backdrop" data-team-modal-overlay></div>
      <div class="vs-team-modal-card">
        <div class="px-6 py-5 border-b border-vs-border-subtle">
          <h2 id="team-modal-title" class="text-base font-semibold text-vs-text-primary" style="letter-spacing: -0.01em;">Add Team Member</h2>
          <p class="text-xs text-vs-text-ghost mt-1">They'll be able to sign in with these credentials.</p>
        </div>
        <div class="px-6 py-5 flex flex-col gap-4">
          <input type="hidden" id="team-edit-id" value="" />
          <div>
            <label class="vs-input-label" for="team-member-name">Name</label>
            <input type="text" id="team-member-name" class="vs-input" placeholder="Jane Smith" />
          </div>
          <div>
            <label class="vs-input-label" for="team-member-email">Email</label>
            <input type="email" id="team-member-email" class="vs-input" placeholder="jane@example.com" />
          </div>
          <div>
            <label class="vs-input-label" for="team-member-role">Role</label>
            <select id="team-member-role" class="vs-input">
              <option value="editor">Editor — can edit and publish</option>
              <option value="viewer">Viewer — read-only access</option>
            </select>
          </div>
          <div id="team-password-section">
            <label class="vs-input-label" for="team-member-password">Temporary Password</label>
            <div class="flex gap-2">
              <input type="text" id="team-member-password" class="vs-input flex-1 font-mono" placeholder="At least 8 characters" />
              <button id="btn-generate-password" class="vs-btn vs-btn-ghost vs-btn-sm" title="Generate random password">
                ${icons.rotateCcw}
              </button>
            </div>
            <p class="text-2xs text-vs-text-ghost mt-1.5">Share this password with the new team member. They can change it from their profile.</p>
          </div>
          <div id="team-modal-error" class="hidden text-sm text-vs-error"></div>
        </div>
        <div class="px-6 py-4 border-t border-vs-border-subtle flex justify-end gap-2">
          <button id="btn-team-cancel" class="vs-btn vs-btn-ghost vs-btn-sm">Cancel</button>
          <button id="btn-team-save" class="vs-btn vs-btn-primary vs-btn-sm">Add Member</button>
        </div>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div id="team-pw-modal" class="vs-team-modal hidden">
      <div class="vs-team-modal-backdrop" data-team-pw-overlay></div>
      <div class="vs-team-modal-card">
        <div class="px-6 py-5 border-b border-vs-border-subtle">
          <h2 class="text-base font-semibold text-vs-text-primary" style="letter-spacing: -0.01em;">Reset Password</h2>
          <p id="team-pw-modal-subtitle" class="text-xs text-vs-text-ghost mt-1"></p>
        </div>
        <div class="px-6 py-5 flex flex-col gap-4">
          <input type="hidden" id="team-pw-user-id" value="" />
          <div>
            <label class="vs-input-label" for="team-new-password">New Password</label>
            <div class="flex gap-2">
              <input type="text" id="team-new-password" class="vs-input flex-1 font-mono" placeholder="At least 8 characters" />
              <button id="btn-pw-generate" class="vs-btn vs-btn-ghost vs-btn-sm" title="Generate random password">
                ${icons.rotateCcw}
              </button>
            </div>
          </div>
          <div id="team-pw-error" class="hidden text-sm text-vs-error"></div>
        </div>
        <div class="px-6 py-4 border-t border-vs-border-subtle flex justify-end gap-2">
          <button id="btn-pw-cancel" class="vs-btn vs-btn-ghost vs-btn-sm">Cancel</button>
          <button id="btn-pw-save" class="vs-btn vs-btn-primary vs-btn-sm">Reset Password</button>
        </div>
      </div>
    </div>

    <!-- Role Permissions Modal -->
    <div id="team-roles-modal" class="vs-team-modal hidden">
      <div class="vs-team-modal-backdrop" data-team-roles-overlay></div>
      <div class="vs-team-modal-card" style="width: min(520px, calc(100vw - 2rem));">
        <div class="px-6 py-5 border-b border-vs-border-subtle">
          <h2 class="text-base font-semibold text-vs-text-primary" style="letter-spacing: -0.01em;">Role Permissions</h2>
          <p class="text-xs text-vs-text-ghost mt-1">What each role can do in this Studio.</p>
        </div>
        <div class="px-6 py-5">
          <div class="vs-role-matrix">
            <div class="vs-role-matrix-header">
              <span class="vs-role-matrix-label"></span>
              <span class="vs-role-badge vs-role-owner">Owner</span>
              <span class="vs-role-badge vs-role-editor">Editor</span>
              <span class="vs-role-badge vs-role-viewer">Viewer</span>
            </div>
            ${[
              ['Use AI chat',           true,  true,  false],
              ['Edit pages & code',     true,  true,  false],
              ['Manage assets',         true,  true,  false],
              ['Publish changes',       true,  true,  false],
              ['View form submissions', true,  true,  true],
              ['Preview the site',      true,  true,  true],
              ['Manage snapshots',      true,  true,  false],
              ['Change settings',       true,  false, false],
              ['Manage team members',   true,  false, false],
            ].map(([label, owner, editor, viewer]) => `
              <div class="vs-role-matrix-row">
                <span class="vs-role-matrix-label">${label}</span>
                <span class="vs-role-matrix-cell">${owner  ? '✓' : '—'}</span>
                <span class="vs-role-matrix-cell">${editor ? '✓' : '—'}</span>
                <span class="vs-role-matrix-cell">${viewer ? '✓' : '—'}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="px-6 py-4 border-t border-vs-border-subtle flex justify-end">
          <button id="btn-roles-close" class="vs-btn vs-btn-ghost vs-btn-sm">Close</button>
        </div>
      </div>
    </div>
  `;
}

function generatePassword(length = 16) {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => chars[b % chars.length]).join('');
}

function renderTeamMember(member) {
  const currentUser = store.get('user');
  const isCurrentUser = member.id === currentUser?.id;
  const isOwnerMember = member.role === 'owner';

  const roleBadgeClass = member.role === 'owner' ? 'vs-role-owner'
    : member.role === 'editor' ? 'vs-role-editor' : 'vs-role-viewer';

  const avatarClass = member.role === 'owner' ? 'vs-team-avatar-owner'
    : member.role === 'editor' ? 'vs-team-avatar-editor' : 'vs-team-avatar-viewer';

  const lastLogin = member.last_login_at
    ? new Date(member.last_login_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never';

  const actions = isOwnerMember ? '<div></div>' : `
    <div class="vs-team-row-actions">
      <button class="vs-team-action team-edit-btn" data-id="${member.id}" title="Edit">
        ${icons.pencil}
      </button>
      <button class="vs-team-action team-pw-btn" data-id="${member.id}" data-name="${escapeHtml(member.name)}" title="Reset password">
        ${icons.lock}
      </button>
      <button class="vs-team-action vs-team-action-danger team-delete-btn" data-id="${member.id}" data-name="${escapeHtml(member.name)}" title="Remove">
        ${icons.trash}
      </button>
    </div>
  `;

  return `
    <div class="vs-team-row">
      <div class="vs-team-row-identity">
        <div class="vs-team-avatar ${avatarClass}">
          ${escapeHtml(member.name).charAt(0).toUpperCase()}
        </div>
        <div style="min-width: 0;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); letter-spacing: -0.01em;">${escapeHtml(member.name)}</span>
            ${isCurrentUser ? '<span style="font-size: 10px; color: var(--vs-text-ghost);">you</span>' : ''}
          </div>
          <div style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(member.email)}</div>
        </div>
      </div>
      <div>
        <span class="vs-role-badge ${roleBadgeClass} vs-role-badge-clickable" data-role-info>${member.role}</span>
      </div>
      <div class="vs-team-row-meta">${lastLogin}</div>
      ${actions}
    </div>
  `;
}

async function loadTeamMembers() {
  const listEl = document.getElementById('team-list');
  if (!listEl) return;

  const { ok, data, error } = await api.get('/team');

  if (!ok) {
    listEl.innerHTML = `<div class="text-sm text-vs-error py-8 text-center">${error?.message || 'Failed to load team members.'}</div>`;
    return;
  }

  const members = data?.members || [];

  if (members.length === 0) {
    listEl.innerHTML = `<div class="text-sm text-vs-text-ghost py-8 text-center">No team members yet.</div>`;
  } else {
    listEl.innerHTML = members.map(m => renderTeamMember(m)).join('');
  }

  bindTeamEvents();
}

function bindTeamEvents() {
  // Add member button
  document.getElementById('btn-add-member')?.addEventListener('click', () => {
    openTeamModal();
  });

  // Show roles button
  document.getElementById('btn-show-roles')?.addEventListener('click', openRolesModal);

  // Clickable role badges → open permissions modal
  document.querySelectorAll('[data-role-info]').forEach(badge => {
    badge.addEventListener('click', openRolesModal);
  });

  // Edit buttons
  document.querySelectorAll('.team-edit-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const { ok, data } = await api.get('/team');
      if (ok) {
        const member = data.members.find(m => m.id == id);
        if (member) openTeamModal(member);
      }
    });
  });

  // Delete buttons
  document.querySelectorAll('.team-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const confirmed = await showConfirmModal({
        title: 'Remove Team Member',
        description: `Remove ${name} from the team? They will lose access to this Studio immediately.`,
        confirmLabel: 'Remove',
        danger: true,
      });
      if (!confirmed) return;
      const { ok, error } = await api.delete(`/team/${id}`);
      if (ok) {
        showToast(`${name} has been removed.`, 'success');
        loadTeamMembers();
      } else {
        showToast(error?.message || 'Failed to remove member.', 'error');
      }
    });
  });

  // Password reset buttons
  document.querySelectorAll('.team-pw-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      openPasswordResetModal(id, name);
    });
  });

  // Modal overlay clicks
  document.querySelector('[data-team-modal-overlay]')?.addEventListener('click', closeTeamModal);
  document.querySelector('[data-team-pw-overlay]')?.addEventListener('click', closePasswordModal);
  document.querySelector('[data-team-roles-overlay]')?.addEventListener('click', closeRolesModal);

  // Modal buttons
  document.getElementById('btn-team-cancel')?.addEventListener('click', closeTeamModal);
  document.getElementById('btn-pw-cancel')?.addEventListener('click', closePasswordModal);
  document.getElementById('btn-roles-close')?.addEventListener('click', closeRolesModal);

  // Generate password buttons
  document.getElementById('btn-generate-password')?.addEventListener('click', () => {
    const input = document.getElementById('team-member-password');
    if (input) input.value = generatePassword();
  });
  document.getElementById('btn-pw-generate')?.addEventListener('click', () => {
    const input = document.getElementById('team-new-password');
    if (input) input.value = generatePassword();
  });

  // Save member
  document.getElementById('btn-team-save')?.addEventListener('click', saveTeamMember);

  // Save password
  document.getElementById('btn-pw-save')?.addEventListener('click', saveTeamPassword);

  // Escape key closes any open team modal
  document.addEventListener('keydown', handleTeamEscape);
}

function handleTeamEscape(e) {
  if (e.key !== 'Escape') return;
  const teamModal = document.getElementById('team-modal');
  const pwModal = document.getElementById('team-pw-modal');
  const rolesModal = document.getElementById('team-roles-modal');

  if (rolesModal && !rolesModal.classList.contains('hidden')) {
    closeRolesModal();
    e.stopPropagation();
  } else if (pwModal && !pwModal.classList.contains('hidden')) {
    closePasswordModal();
    e.stopPropagation();
  } else if (teamModal && !teamModal.classList.contains('hidden')) {
    closeTeamModal();
    e.stopPropagation();
  }
}

function openRolesModal() {
  document.getElementById('team-roles-modal')?.classList.remove('hidden');
}

function closeRolesModal() {
  document.getElementById('team-roles-modal')?.classList.add('hidden');
}

function openTeamModal(member = null) {
  const modal = document.getElementById('team-modal');
  const title = document.getElementById('team-modal-title');
  const saveBtn = document.getElementById('btn-team-save');
  const editId = document.getElementById('team-edit-id');
  const pwSection = document.getElementById('team-password-section');
  const errorEl = document.getElementById('team-modal-error');

  if (!modal) return;

  // Reset
  document.getElementById('team-member-name').value = member?.name || '';
  document.getElementById('team-member-email').value = member?.email || '';
  document.getElementById('team-member-role').value = member?.role || 'editor';
  document.getElementById('team-member-password').value = '';
  errorEl.classList.add('hidden');
  errorEl.textContent = '';

  if (member) {
    // Edit mode
    title.textContent = 'Edit Team Member';
    saveBtn.textContent = 'Save Changes';
    editId.value = member.id;
    pwSection.style.display = 'none';
  } else {
    // Add mode
    title.textContent = 'Add Team Member';
    saveBtn.textContent = 'Add Member';
    editId.value = '';
    pwSection.style.display = '';
    // Pre-generate a password
    document.getElementById('team-member-password').value = generatePassword();
  }

  modal.classList.remove('hidden');
}

function closeTeamModal() {
  document.getElementById('team-modal')?.classList.add('hidden');
}

function openPasswordResetModal(userId, userName) {
  const modal = document.getElementById('team-pw-modal');
  const subtitle = document.getElementById('team-pw-modal-subtitle');
  const errorEl = document.getElementById('team-pw-error');

  if (!modal) return;

  document.getElementById('team-pw-user-id').value = userId;
  document.getElementById('team-new-password').value = generatePassword();
  subtitle.textContent = `Set a new password for ${userName}.`;
  errorEl.classList.add('hidden');
  errorEl.textContent = '';

  modal.classList.remove('hidden');
}

function closePasswordModal() {
  document.getElementById('team-pw-modal')?.classList.add('hidden');
}

async function saveTeamMember() {
  const editId = document.getElementById('team-edit-id')?.value;
  const name = document.getElementById('team-member-name')?.value?.trim();
  const email = document.getElementById('team-member-email')?.value?.trim();
  const role = document.getElementById('team-member-role')?.value;
  const password = document.getElementById('team-member-password')?.value;
  const errorEl = document.getElementById('team-modal-error');
  const saveBtn = document.getElementById('btn-team-save');

  // Validate
  if (!name || name.length < 2) {
    errorEl.textContent = 'Name must be at least 2 characters.';
    errorEl.classList.remove('hidden');
    return;
  }
  if (!email || !email.includes('@')) {
    errorEl.textContent = 'Please enter a valid email address.';
    errorEl.classList.remove('hidden');
    return;
  }
  if (!editId && (!password || password.length < 8)) {
    errorEl.textContent = 'Password must be at least 8 characters.';
    errorEl.classList.remove('hidden');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = editId ? 'Saving…' : 'Adding…';

  let result;
  if (editId) {
    result = await api.put(`/team/${editId}`, { name, email, role });
  } else {
    result = await api.post('/team', { name, email, role, password });
  }

  saveBtn.disabled = false;
  saveBtn.textContent = editId ? 'Save Changes' : 'Add Member';

  if (result.ok) {
    closeTeamModal();
    showToast(editId ? 'Member updated.' : `${name} has been added to the team.`, 'success');
    loadTeamMembers();
  } else {
    errorEl.textContent = result.error?.message || 'Something went wrong.';
    errorEl.classList.remove('hidden');
  }
}

async function saveTeamPassword() {
  const userId = document.getElementById('team-pw-user-id')?.value;
  const password = document.getElementById('team-new-password')?.value;
  const errorEl = document.getElementById('team-pw-error');
  const saveBtn = document.getElementById('btn-pw-save');

  if (!password || password.length < 8) {
    errorEl.textContent = 'Password must be at least 8 characters.';
    errorEl.classList.remove('hidden');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Resetting…';

  const { ok, error } = await api.post(`/team/${userId}/password`, { password });

  saveBtn.disabled = false;
  saveBtn.textContent = 'Reset Password';

  if (ok) {
    closePasswordModal();
    showToast('Password has been reset.', 'success');
  } else {
    errorEl.textContent = error?.message || 'Failed to reset password.';
    errorEl.classList.remove('hidden');
  }
}


// ═══════════════════════════════════════════
//  Assets View
// ═══════════════════════════════════════════

function renderAssetsView() {
  setTimeout(() => loadAssets(), 0);

  return `
    <div>
      <div class="flex items-center justify-between mb-8">
        <div class="vs-page-header" style="margin-bottom: 0;">
          <h1 class="vs-page-title">Assets</h1>
          <p class="vs-page-subtitle">Images, documents, and files for your website.</p>
        </div>
        <div class="flex items-center gap-2">
          <input type="file" id="asset-file-input" multiple class="hidden" />
          <button id="btn-upload-asset" class="vs-btn vs-btn-primary vs-btn-sm">
            Upload Files
          </button>
        </div>
      </div>

      <!-- Drop zone -->
      <div id="asset-dropzone" class="vs-dropzone mb-5">
        <div class="vs-dropzone-icon">${icons.upload}</div>
        <p class="vs-dropzone-title">Drag & drop files here, or click to upload</p>
        <p class="vs-dropzone-hint">Images, documents, and fonts</p>
      </div>

      <!-- Filter tabs -->
      <div class="flex gap-1 mb-4" id="asset-filters">
        <button data-filter="all" class="vs-device-btn vs-device-btn-active">All</button>
        <button data-filter="images" class="vs-device-btn">Images</button>
        <button data-filter="code" class="vs-device-btn">Code</button>
        <button data-filter="files" class="vs-device-btn">Documents</button>
        <button data-filter="fonts" class="vs-device-btn">Fonts</button>
      </div>

      <!-- Asset grid -->
      <div id="assets-grid" class="flex flex-col gap-4">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading assets...</div>
      </div>
    </div>
  `;
}

async function loadAssets(filter = 'all') {
  const container = document.getElementById('assets-grid');
  if (!container) return;

  // Bind upload button
  const uploadBtn = document.getElementById('btn-upload-asset');
  const fileInput = document.getElementById('asset-file-input');
  if (uploadBtn && fileInput) {
    uploadBtn.onclick = () => fileInput.click();
    fileInput.onchange = async () => {
      if (fileInput.files.length === 0) return;
      await uploadAssets(fileInput.files);
      fileInput.value = '';
      loadAssets(filter);
    };
  }

  // Bind drag & drop + click-to-upload
  const dropzone = document.getElementById('asset-dropzone');
  if (dropzone) {
    // Click anywhere on the dropzone to trigger file picker
    dropzone.onclick = (e) => {
      // Don't trigger if they clicked a button inside the dropzone
      if (e.target.closest('button')) return;
      fileInput?.click();
    };
    dropzone.ondragover = (e) => { e.preventDefault(); dropzone.classList.add('is-dragover'); };
    dropzone.ondragleave = () => { dropzone.classList.remove('is-dragover'); };
    dropzone.ondrop = async (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
      if (e.dataTransfer.files.length > 0) {
        await uploadAssets(e.dataTransfer.files);
        loadAssets(filter);
      }
    };
  }

  // Bind filter tabs
  const filterContainer = document.getElementById('asset-filters');
  if (filterContainer) {
    filterContainer.querySelectorAll('[data-filter]').forEach(btn => {
      btn.onclick = () => {
        filterContainer.querySelectorAll('[data-filter]').forEach(b => {
          b.className = 'vs-device-btn';
        });
        btn.className = 'vs-device-btn vs-device-btn-active';
        loadAssets(btn.dataset.filter);
      };
    });
  }

  // Fetch assets — "code" filter needs to fetch all and filter client-side
  const isCodeFilter = filter === 'code';
  const params = (!isCodeFilter && filter !== 'all') ? `?category=${filter}` : '';
  const { ok, data } = await api.get(`/assets${params}`);

  if (!ok || !data?.assets?.length) {
    container.innerHTML = `
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <p class="vs-empty-state-title">No files yet</p>
          <p class="vs-empty-state-desc">Upload images, documents, or fonts by dropping them here.</p>
          <button id="btn-empty-upload" class="vs-btn vs-btn-primary vs-btn-sm">Upload Files</button>
        </div>
      </div>
    `;
    const emptyUploadBtn = document.getElementById('btn-empty-upload');
    const headerUploadBtn = document.getElementById('btn-upload-asset');
    if (emptyUploadBtn && headerUploadBtn) {
      emptyUploadBtn.addEventListener('click', () => headerUploadBtn.click());
    }
    return;
  }

  let assets = data.assets;

  // Client-side filter for "code" tab
  if (isCodeFilter) {
    assets = assets.filter(a => a.category === 'css' || a.category === 'js');
    if (assets.length === 0) {
      container.innerHTML = `
        <div class="vs-empty-state">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">${icons.fileCode}</div>
            <p class="vs-empty-state-title">No code files</p>
            <p class="vs-empty-state-desc">CSS and JS files will appear here.</p>
          </div>
        </div>
      `;
      return;
    }
  }

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'];
  const images = assets.filter(a => a.category === 'images' && imageExts.includes(a.extension));
  const others = assets.filter(a => !imageExts.includes(a.extension) || a.category !== 'images');

  // ─── Icon map: extension → Lucide icon (replaces emojis) ───
  function getAssetIcon(ext, category) {
    if (ext === 'css') return icons.fileCode;
    if (ext === 'js')  return icons.fileCode;
    if (ext === 'json') return icons.fileJson;
    if (ext === 'pdf') return icons.filePdf;
    if (['woff2', 'woff', 'ttf', 'otf'].includes(ext)) return icons.type;
    if (['mp4', 'webm'].includes(ext)) return icons.film;
    if (['mp3', 'wav', 'ogg'].includes(ext)) return icons.music;
    if (['txt', 'md', 'csv'].includes(ext)) return icons.fileText;
    if (['doc', 'docx', 'xls', 'xlsx'].includes(ext)) return icons.fileText;
    if (category === 'images') return icons.image;
    return icons.fileText;
  }

  // Editable file extensions (can be opened in code editor)
  const editableExts = ['css', 'js', 'json', 'svg'];

  let html = '';

  // ─── Image grid ───
  if (images.length > 0) {
    html += `<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">`;
    images.forEach((asset, idx) => {
      const sizeStr = formatBytes(asset.size);
      const dims = asset.width ? `${asset.width}×${asset.height}` : '';
      const isSvg = asset.extension === 'svg';
      html += `
        <div class="vs-asset-card" data-lightbox-idx="${idx}">
          <div class="vs-asset-card-thumb${isSvg ? ' is-svg' : ''}" style="cursor:pointer">
            <img src="${asset.thumbnail || asset.path}" alt="${escapeHtml(asset.meta?.alt || asset.filename)}"
              loading="lazy" />
          </div>
          <div class="vs-asset-card-info">
            <p class="vs-asset-card-name" title="${escapeHtml(asset.filename)}">${escapeHtml(asset.filename)}</p>
            <p class="vs-asset-card-meta">${dims ? dims + ' · ' : ''}${sizeStr}</p>
          </div>
          <div class="vs-asset-card-actions">
            <button data-copy-path="${asset.path}" title="Copy web path"
              class="vs-asset-overlay-btn">${icons.copy}</button>
            <button data-delete-asset="${asset.path}" title="Delete"
              class="vs-asset-overlay-btn vs-asset-overlay-btn--danger">${icons.x}</button>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }

  // ─── File list ───
  if (others.length > 0) {
    others.forEach(asset => {
      const sizeStr = formatBytes(asset.size);
      const isEditable = editableExts.includes(asset.extension);
      html += `
        <div class="vs-asset-row group">
          <div class="flex items-center gap-3 min-w-0">
            <span class="vs-asset-row-icon">${getAssetIcon(asset.extension, asset.category)}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-vs-text-primary truncate">${escapeHtml(asset.filename)}</p>
              <p class="text-xs text-vs-text-ghost">${asset.category} · ${sizeStr}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${isEditable ? `
              <button data-edit-asset="${asset.path}" title="Edit in code editor"
                class="vs-asset-action-btn">${icons.pencil}</button>
            ` : ''}
            <button data-copy-path="${asset.path}" title="Copy web path"
              class="vs-asset-action-btn">${icons.copy}</button>
            ${asset.category !== 'css' && asset.category !== 'js' ? `
              <button data-delete-asset="${asset.path}" title="Delete"
                class="vs-asset-action-btn vs-asset-action-btn--danger">${icons.trash2}</button>
            ` : ''}
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = html;

  // ─── Bind lightbox on image card click ───
  container.querySelectorAll('[data-lightbox-idx]').forEach(card => {
    const thumb = card.querySelector('.vs-asset-card-thumb');
    if (thumb) {
      thumb.addEventListener('click', () => {
        const idx = parseInt(card.dataset.lightboxIdx, 10);
        openAssetLightbox(images, idx, filter);
      });
    }
  });

  // ─── Bind copy path (icon shows ✓ feedback) ───
  container.querySelectorAll('[data-copy-path]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copyPath).then(() => {
        const origHTML = btn.innerHTML;
        btn.innerHTML = '✓';
        btn.classList.add('vs-asset-action-copied');
        setTimeout(() => { btn.innerHTML = origHTML; btn.classList.remove('vs-asset-action-copied'); }, 1200);
      });
    });
  });

  // ─── Bind edit buttons → open code editor ───
  container.querySelectorAll('[data-edit-asset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const assetPath = btn.dataset.editAsset;
      // Convert web path to preview file path for code editor
      // e.g. /assets/css/style.css → assets/css/style.css
      const filePath = assetPath.replace(/^\//, '');
      openCodeEditorModal(filePath);
    });
  });

  // ─── Bind delete buttons ───
  container.querySelectorAll('[data-delete-asset]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const confirmed = await showConfirmModal({
        title: 'Delete Asset',
        description: `Delete ${btn.dataset.deleteAsset}?`,
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;
      const { ok } = await api.delete('/assets', { path: btn.dataset.deleteAsset });
      if (ok) {
        showToast('Asset deleted.', 'success');
        loadAssets(filter);
      } else {
        showToast('Could not delete asset.', 'error');
      }
    });
  });
}

// ─── Asset Lightbox — Cream Edition ───
// Centered vertical stack: image → filename → details → actions.
function openAssetLightbox(imageAssets, startIndex, currentFilter) {
  let currentIdx = startIndex;

  function fmtBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Remove any existing lightbox
  const existing = document.getElementById('vs-lightbox');
  if (existing) existing.remove();

  function renderInner() {
    const asset = imageAssets[currentIdx];
    const dims = asset.width ? `${asset.width}×${asset.height}` : '';
    const sizeStr = fmtBytes(asset.size);
    const detailParts = [dims, sizeStr, asset.extension?.toUpperCase()].filter(Boolean);
    const hasNav = imageAssets.length > 1;

    return `
      ${hasNav ? `
        <button class="vs-lightbox-nav vs-lightbox-nav--prev" id="lightbox-prev" title="Previous (←)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="vs-lightbox-nav vs-lightbox-nav--next" id="lightbox-next" title="Next (→)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      ` : ''}

      <div class="vs-lightbox-stage">
        <div class="vs-lightbox-center">
          <div class="vs-lightbox-image-wrap${['svg', 'png'].includes(asset.extension) ? ' is-transparent' : ''}">
            <img src="${asset.path}" alt="${escapeHtml(asset.meta?.alt || asset.filename)}" />
          </div>

          <div class="vs-lightbox-info">
            <span class="vs-lightbox-filename">${escapeHtml(asset.filename)}</span>
            <span class="vs-lightbox-details">${detailParts.join(' · ')}${hasNav ? ` · ${currentIdx + 1} / ${imageAssets.length}` : ''}</span>
          </div>

          <div class="vs-lightbox-actions">
            <button class="vs-lightbox-btn" id="lightbox-copy" title="Copy web path">
              ${icons.copy}<span>Copy path</span>
            </button>
          </div>
        </div>
      </div>

      <button class="vs-lightbox-close" id="lightbox-close" title="Close (Esc)">
        ${icons.x}
      </button>
    `;
  }

  // Create the outer shell once — only update innerHTML for navigation
  const shell = document.createElement('div');
  shell.id = 'vs-lightbox';
  shell.className = 'vs-lightbox';
  shell.setAttribute('role', 'dialog');
  shell.setAttribute('aria-label', 'Image preview');
  shell.innerHTML = renderInner();
  document.body.appendChild(shell);

  // Animate open
  requestAnimationFrame(() => {
    requestAnimationFrame(() => shell.classList.add('is-visible'));
  });

  function close() {
    shell.classList.remove('is-visible');
    setTimeout(() => shell.remove(), 400);
    document.removeEventListener('keydown', onKey);
  }

  function navigateTo(idx) {
    currentIdx = idx;
    shell.innerHTML = renderInner();
    bindLightboxEvents();
  }

  function onKey(e) {
    // Don't close lightbox if a modal (e.g. confirm delete) is open
    if (e.key === 'Escape') {
      const modal = document.querySelector('.vs-modal-overlay.is-visible');
      if (modal) return; // let the modal handle Escape
      close(); e.preventDefault();
    }
    if (e.key === 'ArrowRight' && imageAssets.length > 1) {
      navigateTo((currentIdx + 1) % imageAssets.length);
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' && imageAssets.length > 1) {
      navigateTo((currentIdx - 1 + imageAssets.length) % imageAssets.length);
      e.preventDefault();
    }
  }

  function bindLightboxEvents() {
    // Close button
    shell.querySelector('#lightbox-close')?.addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });

    // Click backdrop (the stage area outside center) to close
    shell.addEventListener('click', (e) => {
      if (e.target === shell || e.target.classList.contains('vs-lightbox-stage')) close();
    });

    // Nav buttons
    shell.querySelector('#lightbox-prev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo((currentIdx - 1 + imageAssets.length) % imageAssets.length);
    });
    shell.querySelector('#lightbox-next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo((currentIdx + 1) % imageAssets.length);
    });

    // Copy path — inline feedback on the button itself
    const copyBtn = shell.querySelector('#lightbox-copy');
    copyBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const asset = imageAssets[currentIdx];
      navigator.clipboard.writeText(asset.path).then(() => {
        // Inline feedback: swap to checkmark + "Copied!" for 2s
        const origHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = `${icons.check}<span>Copied!</span>`;
        copyBtn.style.borderColor = 'var(--vs-success)';
        copyBtn.style.color = 'var(--vs-success)';
        setTimeout(() => {
          copyBtn.innerHTML = origHtml;
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
        }, 2000);
        showToast('Path copied!', 'success');
      });
    });
  }

  document.addEventListener('keydown', onKey);
  bindLightboxEvents();
}

async function uploadAssets(fileList) {
  if (demoGuard()) return;
  if (viewerGuard()) return;

  const statusEl = document.getElementById('status-text');
  if (statusEl) statusEl.textContent = `Uploading ${fileList.length} file(s)...`;

  const formData = new FormData();
  for (const file of fileList) {
    formData.append('file[]', file);
  }

  const token = store.get('sessionToken');
  const headers = token ? { 'X-VS-Token': token } : {};

  try {
    const resp = await fetch('/_studio/api/router.php?_path=%2Fassets%2Fupload', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
      headers,
    });
    const result = await resp.json();
    if (result.ok) {
      const count = result.data?.uploaded?.length || 0;
      showToast(`${count} file(s) uploaded.`, 'success');
      if (statusEl) statusEl.textContent = `✓ ${count} file(s) uploaded`;
    } else {
      const msg = result.error?.message || 'Upload failed';
      showToast(msg, 'error');
      if (statusEl) statusEl.textContent = '✗ ' + msg;
    }
    if (statusEl) setTimeout(() => { if (statusEl) statusEl.textContent = 'Ready'; }, 4000);
  } catch (e) {
    showToast('Upload failed.', 'error');
    if (statusEl) {
      statusEl.textContent = '✗ Upload failed';
      setTimeout(() => { if (statusEl) statusEl.textContent = 'Ready'; }, 4000);
    }
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ═══════════════════════════════════════════
//  Collections View — REMOVED for v1.0.0
//  Preserved in git history for v1.1.
//  Requires full AI integration, snapshot coverage,
//  and schema validation before shipping.
// ═══════════════════════════════════════════


// ═══════════════════════════════════════════
//  Snapshots View — Time Machine
// ═══════════════════════════════════════════

/** Relative time helper — "2 mins ago", "Yesterday", "3 days ago" */
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} min${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 30) return `${diffDay} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderSnapshotsView() {
  setTimeout(() => loadSnapshots(), 0);

  return `
    <div>
      <div class="flex items-center justify-between mb-8">
        <div class="vs-page-header" style="margin-bottom: 0;">
          <h1 class="vs-page-title">Project History</h1>
          <p class="vs-page-subtitle">Restore points for your website. Experiment fearlessly.</p>
        </div>
        <button id="btn-create-snapshot" class="vs-btn vs-btn-primary vs-btn-sm">Create Snapshot</button>
      </div>
      <div id="snapshots-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading snapshots...</div>
      </div>
    </div>
  `;
}

async function loadSnapshots() {
  const container = document.getElementById('snapshots-list');
  if (!container) return;

  // ─── Bind create button → shows modal with description ───
  const createBtn = document.getElementById('btn-create-snapshot');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      showSnapshotCreateModal();
    });
  }

  const { ok, data } = await api.get('/snapshots');

  if (!ok || !data?.snapshots?.length) {
    container.innerHTML = `
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <p class="vs-empty-state-title">No snapshots yet</p>
          <p class="vs-empty-state-desc">Create your first restore point. Experiment fearlessly.</p>
          <button id="btn-empty-create-snapshot" class="vs-btn vs-btn-primary vs-btn-sm">Create Snapshot</button>
        </div>
      </div>
    `;
    const emptyBtn = document.getElementById('btn-empty-create-snapshot');
    if (emptyBtn) emptyBtn.addEventListener('click', () => showSnapshotCreateModal());
    return;
  }

  const snapshots = data.snapshots;

  container.innerHTML = `
    <div class="vs-timeline">
      ${snapshots.map((snap, i) => {
        const ago = timeAgo(snap.created_at);
        const fullDate = new Date(snap.created_at).toLocaleString();
        const sizeKB = snap.size_bytes ? (snap.size_bytes / 1024).toFixed(0) + ' KB' : '—';
        const isLast = i === snapshots.length - 1;

        // Color coding: green = pre_publish (safe), amber = manual (intentional), gray = auto
        let dotColor, badgeClass, badgeLabel;
        if (snap.snapshot_type === 'pre_publish') {
          dotColor = 'var(--vs-success)';
          badgeClass = 'vs-snap-badge-green';
          badgeLabel = 'Pre-publish';
        } else if (snap.snapshot_type === 'manual') {
          dotColor = 'var(--vs-accent)';
          badgeClass = 'vs-snap-badge-amber';
          badgeLabel = 'Manual';
        } else {
          dotColor = 'var(--vs-text-ghost)';
          badgeClass = 'vs-snap-badge-gray';
          badgeLabel = 'Auto';
        }

        const description = snap.description
          ? `<p class="vs-timeline-desc">${escapeHtml(snap.description)}</p>`
          : '';

        return `
          <div class="vs-timeline-item${isLast ? ' vs-timeline-last' : ''}">
            <div class="vs-timeline-rail">
              <div class="vs-timeline-dot" style="background: ${dotColor}; box-shadow: 0 0 0 3px color-mix(in srgb, ${dotColor} 20%, transparent);"></div>
              <div class="vs-timeline-connector"></div>
            </div>
            <div class="vs-timeline-card">
              <div class="vs-timeline-card-header">
                <div class="flex items-center gap-2">
                  <span class="${badgeClass}">${badgeLabel}</span>
                  <span class="vs-timeline-label">${escapeHtml(snap.label || 'Snapshot #' + snap.id)}</span>
                </div>
                <span class="vs-timeline-ago" title="${fullDate}">${ago}</span>
              </div>
              ${description}
              <div class="vs-timeline-meta">${snap.file_count} files · ${sizeKB}</div>
              <div class="vs-timeline-actions">
                <button data-preview-id="${snap.id}" data-snap='${JSON.stringify({ label: snap.label, description: snap.description, type: snap.snapshot_type, files: snap.file_count, size: sizeKB, date: fullDate }).replace(/'/g, '&#39;')}' class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${icons.eye} Preview
                </button>
                <button data-restore-id="${snap.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${icons.rotateCcw} Restore
                </button>
                <button data-delete-id="${snap.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
                  ${icons.trash2}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // ─── Preview buttons ───
  container.querySelectorAll('[data-preview-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const snap = JSON.parse(btn.dataset.snap);
      showSnapshotPreviewModal(snap);
    });
  });

  // ─── Restore buttons ───
  container.querySelectorAll('[data-restore-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.restoreId;
      const confirmed = await showConfirmModal({
        title: 'Restore Snapshot',
        description: 'This will overwrite your current preview. A safety snapshot of your current state will be created automatically.',
        confirmLabel: 'Restore',
      });
      if (!confirmed) return;

      btn.innerHTML = `${icons.rotateCcw} Restoring…`;
      btn.disabled = true;

      const { ok, error } = await api.post(`/snapshots/${id}/restore`);

      if (ok) {
        const statusEl = document.getElementById('status-text');
        if (statusEl) {
          statusEl.textContent = '✓ Snapshot restored';
          setTimeout(() => { if (statusEl) statusEl.textContent = 'Ready'; }, 4000);
        }
        showToast('Snapshot restored.', 'success');
        loadSnapshots();
      } else {
        showToast(error?.message || 'Failed to restore snapshot.', 'error');
        btn.innerHTML = `${icons.rotateCcw} Restore`;
        btn.disabled = false;
      }
    });
  });

  // ─── Delete buttons ───
  container.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteId;
      const confirmed = await showConfirmModal({
        title: 'Delete Snapshot',
        description: 'This snapshot will be removed permanently.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;

      btn.innerHTML = `Deleting…`;
      btn.disabled = true;

      const { ok, error } = await api.delete(`/snapshots/${id}`);

      if (ok) {
        showToast('Snapshot deleted.', 'success');
        loadSnapshots();
      } else {
        showToast(error?.message || 'Failed to delete snapshot.', 'error');
        btn.innerHTML = `${icons.trash2}`;
        btn.disabled = false;
      }
    });
  });
}

/** Create Snapshot Modal — prompts for optional description */
function showSnapshotCreateModal() {
  const existing = document.getElementById('vs-snapshot-create-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'vs-snapshot-create-overlay';
  overlay.className = 'vs-modal-overlay';
  overlay.innerHTML = `
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${icons.camera} Create Snapshot</h2>
        <p class="vs-modal-desc">Save a restore point of your current site state.</p>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Description <span class="text-vs-text-ghost">(optional)</span></label>
            <input id="snap-desc" type="text" class="vs-input w-full" placeholder="e.g. Before redesigning the header" autofocus>
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="snap-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
        <button id="snap-save" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${icons.camera} Create Snapshot</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  const close = () => closeModal(overlay);

  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.getElementById('snap-cancel')?.addEventListener('click', close);

  const descInput = document.getElementById('snap-desc');
  const saveBtn = document.getElementById('snap-save');

  // Enter key submits
  descInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveBtn?.click();
  });

  saveBtn?.addEventListener('click', async () => {
    const description = descInput?.value?.trim() || '';
    saveBtn.innerHTML = 'Creating…';
    saveBtn.disabled = true;

    const { ok, error } = await api.post('/snapshots', {
      type: 'manual',
      label: 'Manual snapshot',
      description,
    });

    close();

    if (ok) {
      showToast('Snapshot created.', 'success');
      loadSnapshots();
    } else {
      showToast(error?.message || 'Failed to create snapshot.', 'error');
    }
  });
}

/** Snapshot Preview Modal — shows details without restoring */
function showSnapshotPreviewModal(snap) {
  const existing = document.getElementById('vs-snapshot-preview-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'vs-snapshot-preview-overlay';
  overlay.className = 'vs-modal-overlay';

  let dotColor, typeName;
  if (snap.type === 'pre_publish') { dotColor = 'var(--vs-success)'; typeName = 'Pre-publish'; }
  else if (snap.type === 'manual') { dotColor = 'var(--vs-accent)'; typeName = 'Manual'; }
  else { dotColor = 'var(--vs-text-ghost)'; typeName = 'Auto'; }

  overlay.innerHTML = `
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${icons.eye} Snapshot Details</h2>
      </div>
      <div class="vs-modal-body">
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 13px;">
          <span style="color: var(--vs-text-ghost);">Type</span>
          <span style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${dotColor}; display: inline-block;"></span>
            ${typeName}
          </span>
          <span style="color: var(--vs-text-ghost);">Label</span>
          <span style="color: var(--vs-text-primary);">${escapeHtml(snap.label || '—')}</span>
          <span style="color: var(--vs-text-ghost);">Description</span>
          <span style="color: var(--vs-text-primary);">${escapeHtml(snap.description || '—')}</span>
          <span style="color: var(--vs-text-ghost);">Date</span>
          <span style="color: var(--vs-text-primary);">${snap.date}</span>
          <span style="color: var(--vs-text-ghost);">Files</span>
          <span style="color: var(--vs-text-primary);">${snap.files} files</span>
          <span style="color: var(--vs-text-ghost);">Size</span>
          <span style="color: var(--vs-text-primary);">${snap.size}</span>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="snap-preview-close" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay); });
  document.getElementById('snap-preview-close')?.addEventListener('click', () => closeModal(overlay));
}

// ═══════════════════════════════════════════
//  Forms View
// ═══════════════════════════════════════════

/**
 * Status badge color map for form submissions.
 */
const SUBMISSION_STATUS_COLORS = {
  new:      { bg: 'var(--vs-info-dim)',    text: 'var(--vs-info)',     label: 'New' },
  read:     { bg: 'var(--vs-accent-dim)',  text: 'var(--vs-accent)',   label: 'Read' },
  replied:  { bg: 'var(--vs-success-dim)', text: 'var(--vs-success)',  label: 'Replied' },
  archived: { bg: 'var(--vs-bg-raised)',   text: 'var(--vs-text-ghost)', label: 'Archived' },
};

/**
 * Render the Forms list view.
 * Shows all form schemas with submission counts and unread badges.
 */
function renderFormsView() {
  setTimeout(() => loadForms(), 0);

  return `
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <h1 class="vs-page-title">Forms</h1>
        <p class="vs-page-subtitle">View and manage submissions from your website's forms.</p>
      </div>
      <div id="forms-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading forms...</div>
      </div>
    </div>
  `;
}

async function loadForms() {
  const container = document.getElementById('forms-list');
  if (!container) return;

  const { ok, data } = await api.get('/forms');
  if (!ok || !data) {
    container.innerHTML = `<div class="text-sm text-vs-error py-6">Failed to load forms.</div>`;
    return;
  }

  const forms = data.forms || [];
  if (!forms.length) {
    container.innerHTML = `
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/></svg>
          </div>
          <p class="vs-empty-state-title">No forms yet</p>
          <p class="vs-empty-state-desc">Form entries will appear here when forms on a published website are submitted.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="flex flex-col gap-4">
      ${forms.map(form => `
        <a href="#/forms/${encodeURIComponent(form.id)}" class="vs-form-card" data-form-id="${escapeHtml(form.id)}">
          <div class="vs-form-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/><path d="M8 13h3"/><path d="M8 17h6"/></svg>
          </div>
          <div class="vs-form-card-body">
            <div class="vs-form-card-name">${escapeHtml(form.name)}</div>
            ${form.description ? `<div class="vs-form-card-desc">${escapeHtml(form.description)}</div>` : ''}
            <div class="vs-form-card-meta">
              <span>${form.fields} field${form.fields !== 1 ? 's' : ''}</span>
              <span class="vs-form-card-dot">·</span>
              <span>${form.total} submission${form.total !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div class="vs-form-card-right">
            ${form.unread > 0 ? `<span class="vs-form-unread-badge">${form.unread}</span>` : ''}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="vs-form-card-chevron"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </a>
      `).join('')}
    </div>
  `;
}

/**
 * Render the form detail view with submissions list.
 */
function renderFormDetailView(formId) {
  setTimeout(() => loadFormDetail(formId), 0);

  return `
    <div>
      <div id="form-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading form...</div>
      </div>
      <div id="form-submissions">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading submissions...</div>
      </div>
    </div>
  `;
}

async function loadFormDetail(formId) {
  const headerEl = document.getElementById('form-detail-header');
  const subsEl   = document.getElementById('form-submissions');
  if (!headerEl) return;

  // Load form details
  const { ok: formOk, data: formData } = await api.get(`/forms/${encodeURIComponent(formId)}`);
  if (!formOk || !formData) {
    headerEl.innerHTML = `<div class="text-sm text-vs-error py-6">Form not found.</div>`;
    if (subsEl) subsEl.innerHTML = '';
    return;
  }

  const form = formData.form;
  const stats = formData.stats;

  // Render header with breadcrumb and stats
  headerEl.innerHTML = `
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/forms" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Forms</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${escapeHtml(form.name || formId)}</span>
      </div>
      <h1 class="vs-page-title">${escapeHtml(form.name || formId)}</h1>
      ${form.description ? `<p class="vs-page-subtitle">${escapeHtml(form.description)}</p>` : ''}
    </div>

    <div class="vs-form-stats-row">
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${stats.total}</span>
        <span class="vs-form-stat-label">Total</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${stats.new || 0}</span>
        <span class="vs-form-stat-label">New</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-accent)">${stats.read || 0}</span>
        <span class="vs-form-stat-label">Read</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-success)">${stats.replied || 0}</span>
        <span class="vs-form-stat-label">Replied</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-text-ghost)">${stats.archived || 0}</span>
        <span class="vs-form-stat-label">Archived</span>
      </div>
    </div>

    <div class="vs-form-filter-bar">
      <div class="flex items-center gap-2 flex-wrap">
        <select id="form-filter-status" class="vs-input vs-input-compact">
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
        <select id="form-filter-source" class="vs-input vs-input-compact">
          <option value="all">All sources</option>
          <option value="web">Web</option>
          <option value="mcp">MCP / Agent</option>
        </select>
        <input type="text" id="form-filter-search" class="vs-input vs-input-compact" placeholder="Search submissions..." style="min-width: 180px;" />
      </div>
      <div class="flex items-center gap-2">
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-upgrade-to-action" title="Convert this form into an agent action">
          ${icons.zap} Upgrade to Action
        </button>
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-export-csv" ${stats.total === 0 ? 'disabled style="opacity:0.4;pointer-events:none;"' : ''} title="${stats.total === 0 ? 'No submissions to export' : 'Download submissions as CSV'}">
          ${icons.download} Export CSV
        </button>
      </div>
    </div>
  `;

  // Bind filters
  const statusFilter = document.getElementById('form-filter-status');
  const sourceFilter = document.getElementById('form-filter-source');
  const searchInput  = document.getElementById('form-filter-search');

  let searchDebounce = null;
  const reload = () => loadFormSubmissions(formId, 1);

  statusFilter?.addEventListener('change', reload);
  sourceFilter?.addEventListener('change', reload);
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(reload, 300);
  });

  // Bind Export CSV button (proper file download via fetch)
  document.getElementById('btn-export-csv')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-export-csv');
    const origHTML = btn.innerHTML;
    btn.innerHTML = `${icons.loader} Exporting...`;
    btn.disabled = true;
    try {
      const resp = await fetch(`/_studio/api/router.php?_path=${encodeURIComponent('/forms/' + formId + '/submissions/export')}`, {
        credentials: 'same-origin',
      });
      if (!resp.ok) throw new Error('Export failed');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formId}_submissions_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('CSV downloaded', 'success');
    } catch {
      showToast('Failed to export CSV', 'error');
    }
    btn.innerHTML = origHTML;
    btn.disabled = false;
  });

  // Bind "Upgrade to Action" button
  document.getElementById('btn-upgrade-to-action')?.addEventListener('click', async () => {
    if (demoGuard()) return;
    if (viewerGuard()) return;

    // Confirm before converting
    const fieldCount = (form.fields || []).length;
    const confirmed = await showConfirmModal({
      title: 'Upgrade to Agent Action',
      description: `This will create a new agent action with${fieldCount > 0 ? ` the ${fieldCount} field${fieldCount !== 1 ? 's' : ''} from` : ''} this form. It starts as a draft so you can review before going live. Your original form stays unchanged.`,
      confirmLabel: 'Create Action',
    });
    if (!confirmed) return;

    const btn = document.getElementById('btn-upgrade-to-action');
    const origHTML = btn.innerHTML;
    btn.innerHTML = `${icons.loader} Converting...`;
    btn.disabled = true;
    btn.style.opacity = '0.6';

    try {
      // Field type mapping: form → action (direct for most types)
      const FORM_TO_ACTION_TYPE = {
        text: 'text', email: 'email', number: 'number',
        select: 'select', date: 'date', textarea: 'textarea',
        tel: 'tel', url: 'url', checkbox: 'checkbox',
        radio: 'radio', hidden: 'hidden',
      };

      // Map form fields → action fields
      const actionFields = [];
      let skippedFiles = 0;

      (form.fields || []).forEach(f => {
        const actionType = FORM_TO_ACTION_TYPE[f.type];
        if (!actionType) {
          // Unsupported type (e.g. file) — skip with count
          skippedFiles++;
          return;
        }

        const actionField = {
          name: f.name,
          label: f.label || f.name,
          type: actionType,
          required: f.required || false,
        };

        // Carry over options for select/radio
        if ((actionType === 'select' || actionType === 'radio') && f.options) {
          actionField.options = f.options;
        }

        // Carry over placeholder
        if (f.placeholder) {
          actionField.placeholder = f.placeholder;
        }

        actionFields.push(actionField);
      });

      if (skippedFiles > 0) {
        showToast(`${skippedFiles} file upload field(s) skipped — actions don't support file uploads.`, 'warning');
      }

      // Build the action definition from the form
      // Append short suffix to avoid collisions if upgrading the same form twice
      const actionSlug = formId.replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const suffix = Date.now().toString(36).slice(-4);
      const actionDef = {
        id: actionSlug + '-' + suffix,
        name: form.name || formId,
        description: form.description || `Converted from form: ${formId}`,
        category: 'general',
        icon: 'circle',
        active: false, // Start as draft so the owner can review
        fields: actionFields,
        responses: {
          success: 'Thank you! Your submission has been received. Your confirmation code is {confirmation_code}.',
        },
      };

      const { ok: createOk, data: createData } = await api.post('/agentic/actions', actionDef);
      if (createOk && createData?.action) {
        showToast(`"${createData.action.name}" created as agent action`, 'success');
        window.location.hash = `#/actions/${createData.action.id}`;
      } else {
        // Show helpful message for duplicate/conflict errors
        const errCode = createData?.error?.code || '';
        const errMsg = (errCode === 'already_exists')
          ? 'An action based on this form already exists. Check the Actions tab.'
          : (createData?.error?.message || 'Failed to create action');
        showToast(errMsg, 'error');
        btn.innerHTML = origHTML;
        btn.disabled = false;
        btn.style.opacity = '';
      }
    } catch (err) {
      showToast('Failed to convert form to action', 'error');
      btn.innerHTML = origHTML;
      btn.disabled = false;
      btn.style.opacity = '';
    }
  });

  // Load initial submissions
  await loadFormSubmissions(formId, 1);
}

async function loadFormSubmissions(formId, page = 1) {
  const container = document.getElementById('form-submissions');
  if (!container) return;

  const status = document.getElementById('form-filter-status')?.value || 'all';
  const source = document.getElementById('form-filter-source')?.value || 'all';
  const search = document.getElementById('form-filter-search')?.value || '';

  let url = `/forms/${encodeURIComponent(formId)}/submissions?page=${page}&per_page=20`;
  if (status !== 'all') url += `&status=${encodeURIComponent(status)}`;
  if (source !== 'all') url += `&source=${encodeURIComponent(source)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const { ok, data } = await api.get(url);
  if (!ok || !data) {
    container.innerHTML = `<div class="text-sm text-vs-error py-4">Failed to load submissions.</div>`;
    return;
  }

  const submissions = data.submissions || [];
  const total = data.total || 0;
  const perPage = data.per_page || 20;
  const totalPages = Math.ceil(total / perPage);

  if (!submissions.length) {
    container.innerHTML = `
      <div class="vs-empty-state" style="min-height: 200px;">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <p class="vs-empty-state-title">No submissions yet</p>
          <p class="vs-empty-state-desc">Form submissions will appear here once visitors start using your forms.</p>
        </div>
      </div>
    `;
    return;
  }

  // Load the form schema so we can map field names to labels
  const { data: fData } = await api.get(`/forms/${encodeURIComponent(formId)}`);
  const formSchema = fData?.form;
  const fieldLabels = {};
  if (formSchema?.fields) {
    formSchema.fields.forEach(f => { fieldLabels[f.name] = f.label || f.name; });
  }

  container.innerHTML = `
    <div class="flex flex-col gap-4" id="submissions-list">
      ${submissions.map(sub => {
        const statusConf = SUBMISSION_STATUS_COLORS[sub.status] || SUBMISSION_STATUS_COLORS.new;
        // Extract preview fields: show first 2-3 meaningful data fields
        const previewFields = Object.entries(sub.data || {})
          .filter(([k]) => !k.startsWith('_'))
          .slice(0, 3)
          .map(([k, v]) => {
            const label = fieldLabels[k] || k;
            const val = Array.isArray(v) ? v.join(', ') : String(v);
            return `<span class="vs-sub-field"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(val.substring(0, 80))}${val.length > 80 ? '…' : ''}</span>`;
          }).join('');

        const timeAgo = formatRelativeTime(sub.created_at);
        const isMcp = sub.source === 'mcp';

        return `
          <div class="vs-submission-card" data-sub-id="${sub.id}" data-form-id="${escapeHtml(formId)}" style="border-left-color: ${statusConf.text};">
            <div class="vs-submission-header">
              <div class="flex items-center gap-2">
                <span class="vs-status-pill" style="background: ${statusConf.bg}; color: ${statusConf.text};">${statusConf.label}</span>
                ${isMcp ? '<span class="vs-mcp-badge">MCP</span>' : ''}
              </div>
              <span class="vs-submission-time">${escapeHtml(timeAgo)}</span>
            </div>
            <div class="vs-submission-preview">
              ${previewFields || '<span class="text-vs-text-ghost text-xs">No data</span>'}
            </div>
            <div class="vs-submission-actions">
              <button class="vs-btn-ghost vs-btn-sm vs-sub-view-btn" data-sub-id="${sub.id}" title="View details">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <select class="vs-sub-status-select vs-input-compact" data-sub-id="${sub.id}" style="font-size: 11px; height: 26px; padding: 2px 8px;">
                ${Object.entries(SUBMISSION_STATUS_COLORS).map(([key, conf]) =>
                  `<option value="${key}" ${sub.status === key ? 'selected' : ''}>${conf.label}</option>`
                ).join('')}
              </select>
              <button class="vs-btn-ghost vs-btn-sm vs-sub-delete-btn" data-sub-id="${sub.id}" title="Delete submission" style="color: var(--vs-text-ghost);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    ${totalPages > 1 ? `
      <div class="vs-pagination">
        ${page > 1 ? `<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${page - 1}" data-form-id="${escapeHtml(formId)}">← Previous</button>` : '<span></span>'}
        <span class="text-xs text-vs-text-ghost">Page ${page} of ${totalPages} · ${total} submission${total !== 1 ? 's' : ''}</span>
        ${page < totalPages ? `<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${page + 1}" data-form-id="${escapeHtml(formId)}">Next →</button>` : '<span></span>'}
      </div>
    ` : `
      <div class="text-center py-3">
        <span class="text-xs text-vs-text-ghost">${total} submission${total !== 1 ? 's' : ''}</span>
      </div>
    `}
  `;

  // Bind submission events
  bindSubmissionEvents(formId, page);
}

function bindSubmissionEvents(formId, currentPage) {
  // View buttons → open detail panel
  document.querySelectorAll('.vs-sub-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const subId = btn.dataset.subId;
      openSubmissionDetail(formId, subId);
    });
  });

  // Status selects → update status inline
  document.querySelectorAll('.vs-sub-status-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      const subId = sel.dataset.subId;
      const { ok } = await api.put(`/forms/${encodeURIComponent(formId)}/submissions/${subId}`, { status: sel.value });
      if (ok) {
        showToast('Status updated', 'success');
        // Refresh the card's left border color
        const card = sel.closest('.vs-submission-card');
        const conf = SUBMISSION_STATUS_COLORS[sel.value];
        if (card && conf) {
          card.style.borderLeftColor = conf.text;
          const pill = card.querySelector('.vs-status-pill');
          if (pill) {
            pill.style.background = conf.bg;
            pill.style.color = conf.text;
            pill.textContent = conf.label;
          }
        }
      } else {
        showToast('Failed to update status', 'error');
      }
    });
  });

  // Delete buttons
  document.querySelectorAll('.vs-sub-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const subId = btn.dataset.subId;
      const confirmed = await showConfirmModal({
        title: 'Delete Submission',
        description: 'This submission will be permanently deleted.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;

      const { ok } = await api.delete(`/forms/${encodeURIComponent(formId)}/submissions/${subId}`);
      if (ok) {
        showToast('Submission deleted', 'success');
        loadFormSubmissions(formId, currentPage);
      } else {
        showToast('Failed to delete submission', 'error');
      }
    });
  });

  // Pagination
  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pg = parseInt(btn.dataset.page);
      loadFormSubmissions(formId, pg);
    });
  });

  // Card click (anywhere except buttons/selects) → view detail
  document.querySelectorAll('.vs-submission-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('select')) return;
      const subId = card.dataset.subId;
      openSubmissionDetail(formId, subId);
    });
  });
}

/**
 * Open the slide-in panel showing full submission details.
 */
async function openSubmissionDetail(formId, subId) {
  // Remove existing panel
  document.getElementById('submission-detail-overlay')?.remove();

  // Find the submission data from the DOM cards
  // We re-fetch to get the latest data
  const { ok, data } = await api.get(`/forms/${encodeURIComponent(formId)}/submissions?page=1&per_page=1000`);
  if (!ok || !data) return;

  const sub = (data.submissions || []).find(s => String(s.id) === String(subId));
  if (!sub) {
    showToast('Submission not found', 'error');
    return;
  }

  // Load field labels
  const { data: fData } = await api.get(`/forms/${encodeURIComponent(formId)}`);
  const formSchema = fData?.form;
  const fieldLabels = {};
  if (formSchema?.fields) {
    formSchema.fields.forEach(f => { fieldLabels[f.name] = f.label || f.name; });
  }

  // Auto-mark as read if new
  if (sub.status === 'new') {
    await api.put(`/forms/${encodeURIComponent(formId)}/submissions/${subId}`, { status: 'read' });
    sub.status = 'read';
    // Update inline status in the list
    const sel = document.querySelector(`.vs-sub-status-select[data-sub-id="${subId}"]`);
    if (sel) sel.value = 'read';
    const card = document.querySelector(`.vs-submission-card[data-sub-id="${subId}"]`);
    if (card) {
      card.style.borderLeftColor = SUBMISSION_STATUS_COLORS.read.text;
      const pill = card.querySelector('.vs-status-pill');
      if (pill) {
        pill.style.background = SUBMISSION_STATUS_COLORS.read.bg;
        pill.style.color = SUBMISSION_STATUS_COLORS.read.text;
        pill.textContent = 'Read';
      }
    }
  }

  const statusConf = SUBMISSION_STATUS_COLORS[sub.status] || SUBMISSION_STATUS_COLORS.new;

  const overlay = document.createElement('div');
  overlay.id = 'submission-detail-overlay';
  overlay.className = 'vs-slide-overlay';
  overlay.innerHTML = `
    <div class="vs-slide-panel" id="submission-detail-panel">
      <div class="vs-slide-panel-header">
        <h2 class="text-md font-semibold text-vs-text-primary">Submission #${sub.id}</h2>
        <button id="close-sub-detail" class="vs-btn-ghost vs-btn-icon" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div class="vs-slide-panel-body">
        <div class="vs-sub-detail-meta">
          <div class="vs-sub-detail-row">
            <span class="vs-sub-detail-label">Status</span>
            <span class="vs-status-pill" style="background: ${statusConf.bg}; color: ${statusConf.text};">${statusConf.label}</span>
          </div>
          <div class="vs-sub-detail-row">
            <span class="vs-sub-detail-label">Source</span>
            <span class="text-sm text-vs-text-primary">${sub.source === 'mcp' ? 'MCP / Agent' : 'Web Form'}</span>
          </div>
          <div class="vs-sub-detail-row">
            <span class="vs-sub-detail-label">Submitted</span>
            <span class="text-sm text-vs-text-primary">${new Date(sub.created_at).toLocaleString()}</span>
          </div>
          ${sub.ip_address ? `
            <div class="vs-sub-detail-row">
              <span class="vs-sub-detail-label">IP Address</span>
              <span class="text-sm text-vs-text-tertiary font-mono">${escapeHtml(sub.ip_address)}</span>
            </div>
          ` : ''}
          ${sub.referrer ? `
            <div class="vs-sub-detail-row">
              <span class="vs-sub-detail-label">Referrer</span>
              <span class="text-sm text-vs-text-tertiary" style="word-break: break-all;">${escapeHtml(sub.referrer)}</span>
            </div>
          ` : ''}
        </div>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Submitted Data</h3>
        <div class="vs-sub-detail-fields">
          ${Object.entries(sub.data || {}).filter(([k]) => !k.startsWith('_')).map(([key, value]) => {
            const label = fieldLabels[key] || key;
            const displayVal = Array.isArray(value) ? value.join(', ') : String(value);
            return `
              <div class="vs-sub-detail-field">
                <div class="vs-sub-detail-field-label">${escapeHtml(label)}</div>
                <div class="vs-sub-detail-field-value">${escapeHtml(displayVal)}</div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Internal Notes</h3>
        <textarea id="sub-detail-notes" class="vs-input" style="min-height: 80px; resize: vertical;" placeholder="Add private notes about this submission...">${escapeHtml(sub.notes || '')}</textarea>
        <button id="btn-save-sub-notes" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-top: 8px;">Save Notes</button>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Change Status</h3>
        <select id="sub-detail-status" class="vs-input">
          ${Object.entries(SUBMISSION_STATUS_COLORS).map(([key, conf]) =>
            `<option value="${key}" ${sub.status === key ? 'selected' : ''}>${conf.label}</option>`
          ).join('')}
        </select>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
  });

  // Bind events
  const closePanel = () => {
    overlay.classList.remove('is-visible');
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });
  document.getElementById('close-sub-detail')?.addEventListener('click', closePanel);

  // Save notes
  document.getElementById('btn-save-sub-notes')?.addEventListener('click', async () => {
    const notes = document.getElementById('sub-detail-notes')?.value || '';
    const { ok } = await api.put(`/forms/${encodeURIComponent(formId)}/submissions/${subId}`, { notes });
    showToast(ok ? 'Notes saved' : 'Failed to save notes', ok ? 'success' : 'error');
  });

  // Status change from detail panel
  document.getElementById('sub-detail-status')?.addEventListener('change', async (e) => {
    const newStatus = e.target.value;
    const { ok } = await api.put(`/forms/${encodeURIComponent(formId)}/submissions/${subId}`, { status: newStatus });
    if (ok) {
      showToast('Status updated', 'success');
      // Update the list card too
      const sel = document.querySelector(`.vs-sub-status-select[data-sub-id="${subId}"]`);
      if (sel) sel.value = newStatus;
      const card = document.querySelector(`.vs-submission-card[data-sub-id="${subId}"]`);
      const conf = SUBMISSION_STATUS_COLORS[newStatus];
      if (card && conf) {
        card.style.borderLeftColor = conf.text;
        const pill = card.querySelector('.vs-status-pill');
        if (pill) {
          pill.style.background = conf.bg;
          pill.style.color = conf.text;
          pill.textContent = conf.label;
        }
      }
    } else {
      showToast('Failed to update status', 'error');
    }
  });
}

/**
 * Format a date string to relative time (e.g., "2 min ago").
 */
function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr  = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ═══════════════════════════════════════════
//  Actions View — Agentic Builder
// ═══════════════════════════════════════════

/**
 * Status badge color map for action records.
 */
const ACTION_STATUS_COLORS = {
  confirmed:  { bg: 'var(--vs-success-dim)', text: 'var(--vs-success)',  label: 'Confirmed' },
  pending:    { bg: 'var(--vs-info-dim)',    text: 'var(--vs-info)',     label: 'Pending' },
  cancelled:  { bg: 'var(--vs-error-dim)',   text: 'var(--vs-error)',    label: 'Cancelled' },
  completed:  { bg: 'var(--vs-accent-dim)',  text: 'var(--vs-accent)',   label: 'Completed' },
  rejected:   { bg: 'var(--vs-error-dim)',   text: 'var(--vs-error)',    label: 'Rejected' },
  'no-show':  { bg: 'var(--vs-bg-raised)',   text: 'var(--vs-text-ghost)', label: 'No-show' },
  archived:   { bg: 'var(--vs-bg-raised)',   text: 'var(--vs-text-ghost)', label: 'Archived' },
};

/** Template icons — emoji for each template id */
const TEMPLATE_ICONS = {
  'reservation':        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  'appointment':        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  'quote-request':      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  'waitlist':           '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  'order':              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
  'event-registration': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',
};

/**
 * Render the Actions list view.
 * Shows all action definitions with stats, status dots, and record counts.
 */
function renderActionsView() {
  setTimeout(() => loadActions(), 0);

  return `
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="vs-page-title">Agent Actions</h1>
            <p class="vs-page-subtitle">Define what AI agents and visitors can do on your website.</p>
          </div>
          <button id="btn-new-action" class="vs-btn vs-btn-primary vs-btn-sm">New Action</button>
        </div>
      </div>
      <div id="bar-settings-card"></div>
      <div id="actions-list-container">
        <div class="flex flex-col gap-4">
          ${[1,2,3].map(() => `
            <div class="vs-form-card" style="pointer-events: none;">
              <div class="vs-form-card-icon" style="background: var(--vs-bg-raised); color: transparent;">
                <svg width="22" height="22" viewBox="0 0 24 24"></svg>
              </div>
              <div class="vs-form-card-body">
                <div style="height: 14px; width: 140px; background: var(--vs-bg-raised); border-radius: 4px; margin-bottom: 6px; animation: vs-skeleton-pulse 1.5s ease-in-out infinite;"></div>
                <div style="height: 11px; width: 220px; background: var(--vs-bg-raised); border-radius: 4px; animation: vs-skeleton-pulse 1.5s ease-in-out 0.1s infinite;"></div>
              </div>
              <div class="vs-form-card-right" style="opacity: 0.3;">
                <svg width="16" height="16" viewBox="0 0 24 24"></svg>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

async function loadActions() {
  const container = document.getElementById('actions-list-container');
  if (!container) return;

  // Bind "+ New Action" button
  document.getElementById('btn-new-action')?.addEventListener('click', async () => {
    const result = await showNewActionModal();
    if (result?.ok && result.actionId) {
      window.location.hash = `#/actions/${result.actionId}`;
    }
  });

  // ── Render Bar Settings Card ──
  const barCard = document.getElementById('bar-settings-card');
  if (barCard) {
    const { ok: barOk, data: barData } = await api.get('/agentic/actions/bar-settings');
    const barSettings = (barOk && barData?.settings) || { theme: 'bottom-bar', visibility: 'all-pages' };
    const currentTheme = barSettings.theme || 'bottom-bar';
    const currentVis = barSettings.visibility || 'all-pages';

    // Mini wireframe SVGs for each theme
    const themePreviews = {
      'bottom-bar': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
        <rect x="1" y="1" width="118" height="70" rx="6" stroke="currentColor" stroke-width="1" opacity="0.2"/>
        <rect x="8" y="8" width="40" height="4" rx="2" fill="currentColor" opacity="0.12"/>
        <rect x="8" y="16" width="70" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <rect x="8" y="22" width="55" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <rect x="0" y="56" width="120" height="16" rx="0" fill="currentColor" opacity="0.1"/>
        <circle cx="30" cy="64" r="3.5" fill="currentColor" opacity="0.35"/>
        <circle cx="52" cy="64" r="3.5" fill="currentColor" opacity="0.35"/>
        <circle cx="74" cy="64" r="3.5" fill="currentColor" opacity="0.35"/>
      </svg>`,
      'floating-fab': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
        <rect x="1" y="1" width="118" height="70" rx="6" stroke="currentColor" stroke-width="1" opacity="0.2"/>
        <rect x="8" y="8" width="40" height="4" rx="2" fill="currentColor" opacity="0.12"/>
        <rect x="8" y="16" width="70" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <rect x="8" y="22" width="55" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <circle cx="100" cy="56" r="10" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.3"/>
        <line x1="96" y1="56" x2="104" y2="56" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
        <line x1="100" y1="52" x2="100" y2="60" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
      </svg>`,
      'minimal-pill': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
        <rect x="1" y="1" width="118" height="70" rx="6" stroke="currentColor" stroke-width="1" opacity="0.2"/>
        <rect x="8" y="8" width="40" height="4" rx="2" fill="currentColor" opacity="0.12"/>
        <rect x="8" y="16" width="70" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <rect x="8" y="22" width="55" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <rect x="32" y="56" width="56" height="12" rx="6" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1" stroke-opacity="0.25"/>
        <circle cx="48" cy="62" r="2.5" fill="currentColor" opacity="0.3"/>
        <circle cx="60" cy="62" r="2.5" fill="currentColor" opacity="0.3"/>
        <circle cx="72" cy="62" r="2.5" fill="currentColor" opacity="0.3"/>
      </svg>`,
    };

    const themeLabels = { 'bottom-bar': 'Bottom Bar', 'floating-fab': 'Floating FAB', 'minimal-pill': 'Minimal Pill' };
    const visLabels = { 'all-pages': 'All Pages', 'homepage-only': 'Homepage Only', 'hidden': 'Hidden' };

    barCard.innerHTML = `
      <div class="vs-settings-card" style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <h2 class="vs-settings-card-title" style="margin-bottom: 2px;">Actions Bar</h2>
            <p style="font-size: 12px; color: var(--vs-text-tertiary); margin: 0;">How actions appear on your published site.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 12px; color: var(--vs-text-secondary); white-space: nowrap;">Show on</label>
            <select id="bar-visibility" class="vs-input" style="font-size: 12px; height: 30px; padding: 4px 8px; min-width: 130px;">
              ${Object.entries(visLabels).map(([val, label]) =>
                `<option value="${val}" ${currentVis === val ? 'selected' : ''}>${label}</option>`
              ).join('')}
            </select>
          </div>
        </div>
        <div id="bar-theme-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          ${Object.entries(themePreviews).map(([theme, svg]) => {
            const isActive = theme === currentTheme;
            return `
              <button type="button" class="bar-theme-option" data-theme="${theme}" style="
                border: 2px solid ${isActive ? 'var(--vs-accent)' : 'var(--vs-border-subtle)'};
                background: ${isActive ? 'color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))' : 'var(--vs-bg-surface)'};
                border-radius: var(--radius-lg, 10px);
                padding: 14px 12px 10px;
                cursor: pointer;
                display: flex; flex-direction: column; align-items: center; gap: 8px;
                transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.12s;
                color: ${isActive ? 'var(--vs-accent)' : 'var(--vs-text-ghost)'};
                position: relative;
                outline: none;
              "
                onmouseenter="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-medium)';this.style.transform='translateY(-1px)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';}"
                onmouseleave="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-subtle)';this.style.transform='';this.style.boxShadow='';}"
              >
                <div style="width: 100%; max-width: 120px;">${svg}</div>
                <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.01em;
                  color: ${isActive ? 'var(--vs-accent)' : 'var(--vs-text-secondary)'};">${themeLabels[theme]}</span>
                ${isActive ? `<div style="
                  position: absolute; top: 8px; right: 8px; width: 16px; height: 16px;
                  background: var(--vs-accent); border-radius: 50%; display: flex;
                  align-items: center; justify-content: center;
                "><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>` : ''}
              </button>
            `;
          }).join('')}
        </div>
        <div style="display: flex; gap: 20px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--vs-border-subtle); flex-wrap: wrap; align-items: flex-start;">
          <div style="min-width: 140px;">
            <label style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); display: block; margin-bottom: 8px;">Color Scheme</label>
            <div id="bar-scheme-picker" style="display: inline-flex; border: 1px solid var(--vs-border-subtle); border-radius: 8px; overflow: hidden;">
              ${['light', 'dark'].map(s => {
                const isActive = s === (barSettings.color_scheme || 'light');
                const icons = {
                  light: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
                  dark: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
                };
                return `<button type="button" class="bar-scheme-btn" data-scheme="${s}" style="
                  border: none; padding: 7px 16px; font-size: 12px; font-weight: 500; cursor: pointer;
                  background: ${isActive ? 'var(--vs-accent)' : 'var(--vs-bg-surface)'};
                  color: ${isActive ? '#fff' : 'var(--vs-text-secondary)'};
                  transition: background 0.15s, color 0.15s;
                  display: inline-flex; align-items: center; gap: 6px;
                ">${icons[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}</button>`;
              }).join('')}
            </div>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <label style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); display: block; margin-bottom: 8px;">Brand Color</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <label style="position: relative; cursor: pointer; flex-shrink: 0;">
                <input type="color" id="bar-brand-color" value="${barSettings.brand_color || '#EA580C'}" style="
                  position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
                ">
                <div id="bar-color-swatch" style="
                  width: 32px; height: 32px; border-radius: 8px;
                  background: ${barSettings.brand_color || '#EA580C'};
                  border: 2px solid var(--vs-border-subtle);
                  transition: border-color 0.15s, box-shadow 0.15s;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                "></div>
              </label>
              <input type="text" id="bar-brand-hex" class="vs-input" value="${barSettings.brand_color || '#EA580C'}" placeholder="#EA580C" style="
                font-size: 12px; height: 32px; padding: 4px 8px; width: 88px; font-family: var(--font-mono, monospace); letter-spacing: 0.02em;
              ">
              <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                ${['#EA580C', '#2563EB', '#059669', '#7C3AED', '#DB2777', '#D97706', '#0891B2', '#374151'].map(c => `
                  <button type="button" class="bar-color-preset" data-color="${c}" title="${c}" style="
                    width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid transparent;
                    background: ${c}; cursor: pointer; transition: border-color 0.12s, transform 0.12s;
                    flex-shrink: 0; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
                  "
                    onmouseenter="this.style.transform='scale(1.15)';"
                    onmouseleave="this.style.transform='';"
                  ></button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind theme picker
    document.querySelectorAll('.bar-theme-option').forEach(btn => {
      btn.addEventListener('click', async () => {
        const theme = btn.dataset.theme;
        // Update UI immediately
        document.querySelectorAll('.bar-theme-option').forEach(b => {
          const isThis = b.dataset.theme === theme;
          b.style.borderColor = isThis ? 'var(--vs-accent)' : 'var(--vs-border-subtle)';
          b.style.background = isThis ? 'color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))' : 'var(--vs-bg-surface)';
          b.style.color = isThis ? 'var(--vs-accent)' : 'var(--vs-text-ghost)';
          b.classList.toggle('active', isThis);
          // Update label color
          const label = b.querySelector('span');
          if (label) label.style.color = isThis ? 'var(--vs-accent)' : 'var(--vs-text-secondary)';
          // Update checkmark
          const check = b.querySelector('[style*="position: absolute"]');
          if (check && !isThis) check.remove();
          if (isThis && !b.querySelector('[style*="position: absolute"]')) {
            const checkmark = document.createElement('div');
            checkmark.style.cssText = 'position:absolute;top:8px;right:8px;width:16px;height:16px;background:var(--vs-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;';
            checkmark.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
            b.appendChild(checkmark);
          }
        });
        // Save
        const { ok } = await api.put('/agentic/actions/bar-settings', { theme });
        if (ok) {
          btn.style.boxShadow = '0 0 0 3px var(--vs-accent-dim)';
          setTimeout(() => btn.style.boxShadow = '', 400);
        }
      });
    });

    // Bind visibility dropdown
    document.getElementById('bar-visibility')?.addEventListener('change', async (e) => {
      const { ok } = await api.put('/agentic/actions/bar-settings', { visibility: e.target.value });
      if (ok) showToast('Bar visibility updated', 'success');
    });

    // Bind scheme picker
    document.querySelectorAll('.bar-scheme-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const scheme = btn.dataset.scheme;
        document.querySelectorAll('.bar-scheme-btn').forEach(b => {
          const isThis = b.dataset.scheme === scheme;
          b.style.background = isThis ? 'var(--vs-accent)' : 'var(--vs-bg-surface)';
          b.style.color = isThis ? '#fff' : 'var(--vs-text-secondary)';
        });
        const { ok } = await api.put('/agentic/actions/bar-settings', { color_scheme: scheme });
        if (ok) showToast('Color scheme updated', 'success');
      });
    });

    // Bind brand color — helpers
    function updateBrandColorUI(hex) {
      const swatch = document.getElementById('bar-color-swatch');
      const hexInput = document.getElementById('bar-brand-hex');
      const nativeInput = document.getElementById('bar-brand-color');
      if (swatch) swatch.style.background = hex;
      if (hexInput && hexInput !== document.activeElement) hexInput.value = hex;
      if (nativeInput) nativeInput.value = hex;
      // Highlight matching preset
      document.querySelectorAll('.bar-color-preset').forEach(p => {
        p.style.borderColor = p.dataset.color.toLowerCase() === hex.toLowerCase() ? 'var(--vs-text-primary)' : 'transparent';
      });
    }

    // Native color picker
    document.getElementById('bar-brand-color')?.addEventListener('input', (e) => {
      updateBrandColorUI(e.target.value);
    });
    document.getElementById('bar-brand-color')?.addEventListener('change', async (e) => {
      const { ok } = await api.put('/agentic/actions/bar-settings', { brand_color: e.target.value });
      if (ok) showToast('Brand color updated', 'success');
    });

    // Hex text input
    document.getElementById('bar-brand-hex')?.addEventListener('change', async (e) => {
      let hex = e.target.value.trim();
      if (!hex.startsWith('#')) hex = '#' + hex;
      if (/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex)) {
        updateBrandColorUI(hex);
        const { ok } = await api.put('/agentic/actions/bar-settings', { brand_color: hex });
        if (ok) showToast('Brand color updated', 'success');
      }
    });

    // Preset swatches
    document.querySelectorAll('.bar-color-preset').forEach(btn => {
      btn.addEventListener('click', async () => {
        const color = btn.dataset.color;
        updateBrandColorUI(color);
        const { ok } = await api.put('/agentic/actions/bar-settings', { brand_color: color });
        if (ok) showToast('Brand color updated', 'success');
      });
    });

    // Init: highlight matching preset if any
    updateBrandColorUI(barSettings.brand_color || '#EA580C');
  }

  const { ok, data } = await api.get('/agentic/actions');
  if (!ok || !data) {
    container.innerHTML = `<div class="text-sm text-vs-error py-6">Failed to load actions.</div>`;
    return;
  }

  const actions = data.actions || [];
  if (!actions.length) {
    container.innerHTML = `
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon" style="color: var(--vs-accent);">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <p class="vs-empty-state-title">No actions yet</p>
          <p class="vs-empty-state-desc">Create your first agent action to let AI assistants and website visitors interact with your business — reservations, appointments, quotes, and more.</p>
          <button id="btn-empty-new-action" class="vs-btn vs-btn-primary vs-btn-sm" style="margin-top: 12px;">${icons.plus} New Action</button>
        </div>
      </div>
    `;
    document.getElementById('btn-empty-new-action')?.addEventListener('click', async () => {
      const result = await showNewActionModal();
      if (result?.ok && result.actionId) {
        window.location.hash = `#/actions/${result.actionId}`;
      }
    });
    return;
  }

  container.innerHTML = `
    <div id="actions-list" class="flex flex-col gap-4">
      ${actions.map((action, idx) => {
        const isActive = action.active;
        const stats = action._stats || action.stats || {};
        const total = stats.total || 0;
        const lastActivity = stats.last_created_at ? formatRelativeTime(stats.last_created_at) : '—';

        const ACTION_LIST_ICONS = {
          calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
          utensils: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
          'file-text': '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
          list: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
          'shopping-bag': '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
          ticket: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',
          clock: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
          'message-square': '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
          users: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
          mail: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
          star: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
          circle: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>',
        };
        const actionIcon = ACTION_LIST_ICONS[action.icon] || ACTION_LIST_ICONS.circle;

        return `
          <div class="vs-action-list-row vs-form-card" data-action-id="${escapeHtml(action.id)}" style="cursor: pointer; transition: box-shadow 0.15s ease;">
            <div class="vs-action-reorder" style="
              display: flex; flex-direction: column; gap: 1px; flex-shrink: 0;
              padding-right: 10px; margin-right: 4px;
              border-right: 1px solid var(--vs-border-subtle);
            ">
              <button type="button" class="action-move-up" title="Move up" style="
                border: none; background: none; cursor: pointer; padding: 2px; color: var(--vs-text-ghost);
                display: flex; align-items: center; justify-content: center; border-radius: 4px;
                transition: color 0.12s, background 0.12s;
              "
                onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
                onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
              </button>
              <button type="button" class="action-move-down" title="Move down" style="
                border: none; background: none; cursor: pointer; padding: 2px; color: var(--vs-text-ghost);
                display: flex; align-items: center; justify-content: center; border-radius: 4px;
                transition: color 0.12s, background 0.12s;
              "
                onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
                onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
            <div class="vs-form-card-icon" style="color: ${isActive ? 'var(--vs-success)' : 'var(--vs-text-ghost)'}; background: ${isActive ? 'color-mix(in srgb, var(--vs-success) 10%, transparent)' : 'var(--vs-bg-raised)'};">
              ${actionIcon}
            </div>
            <div class="vs-form-card-body">
              <div class="vs-form-card-name">${escapeHtml(action.name || action.id)}</div>
              ${action.description ? `<div class="vs-form-card-desc">${escapeHtml(action.description)}</div>` : ''}
              <div class="vs-form-card-meta">
                <span class="vs-status-pill" style="
                  background: ${isActive ? 'var(--vs-success-dim)' : 'var(--vs-bg-raised)'};
                  color: ${isActive ? 'var(--vs-success)' : 'var(--vs-text-ghost)'};
                  font-size: 11px; padding: 1px 8px;
                ">${isActive ? 'Active' : 'Draft'}</span>
                <span class="vs-form-card-dot">·</span>
                <span>${total} record${total !== 1 ? 's' : ''}</span>
                ${stats.today > 0 ? `<span class="vs-form-card-dot">·</span><span>+${stats.today} today</span>` : ''}
                <span class="vs-form-card-dot">·</span>
                <span>${lastActivity}</span>
              </div>
            </div>
            <div class="vs-form-card-right">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="vs-form-card-chevron"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Card click → navigate (skip if clicking reorder arrows)
  document.querySelectorAll('.vs-action-list-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.vs-action-reorder')) return;
      const actionId = row.dataset.actionId;
      if (actionId) window.location.hash = '#/actions/' + encodeURIComponent(actionId);
    });
  });

  // Bind action reorder arrows
  async function saveActionOrder() {
    const rows = document.querySelectorAll('#actions-list .vs-action-list-row');
    const order = Array.from(rows).map(r => r.dataset.actionId);
    await api.post('/agentic/actions/reorder', { order });
  }

  document.querySelectorAll('.action-move-up').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const row = btn.closest('.vs-action-list-row');
      const prev = row?.previousElementSibling;
      if (prev) {
        row.parentNode.insertBefore(row, prev);
        row.style.boxShadow = '0 0 0 2px var(--vs-accent-dim)';
        setTimeout(() => row.style.boxShadow = '', 300);
        await saveActionOrder();
      }
    });
  });

  document.querySelectorAll('.action-move-down').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const row = btn.closest('.vs-action-list-row');
      const next = row?.nextElementSibling;
      if (next) {
        row.parentNode.insertBefore(next, row);
        row.style.boxShadow = '0 0 0 2px var(--vs-accent-dim)';
        setTimeout(() => row.style.boxShadow = '', 300);
        await saveActionOrder();
      }
    });
  });
}

/**
 * Show the template picker modal for creating a new action.
 * Returns { ok: true, actionId } on success, null on cancel.
 */
async function showNewActionModal() {
  return new Promise(async (resolve) => {
    // Fetch templates
    const { ok, data } = await api.get('/agentic/actions/templates');
    const templates = (ok && data?.templates) || [];

    const overlay = document.createElement('div');
    overlay.className = 'vs-modal-overlay';
    overlay.innerHTML = `
      <div class="vs-modal" style="max-width: 580px;">
        <div class="vs-modal-header" style="display: flex; align-items: flex-start; justify-content: space-between;">
          <h2 class="vs-modal-title" style="margin: 0;">${icons.zap} New Agent Action</h2>
          <button id="close-new-action-modal" style="background: none; border: none; cursor: pointer; color: var(--vs-text-ghost); padding: 4px; margin: -4px -4px 0 0; line-height: 0; border-radius: var(--radius-md); transition: color 0.15s ease;" onmouseenter="this.style.color='var(--vs-text-primary)'" onmouseleave="this.style.color='var(--vs-text-ghost)'">${icons.x}</button>
        </div>
        <div class="vs-modal-body" style="padding: 20px;">
          <p class="text-sm text-vs-text-secondary" style="margin-bottom: 16px;">Choose a template to get started:</p>
          <div id="template-grid" style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
          ">
            ${templates.map(t => `
              <button class="vs-template-card" data-template-id="${escapeHtml(t.id)}" style="
                display: flex; flex-direction: column; align-items: center;
                padding: 16px 12px; border-radius: 10px;
                border: 1.5px solid var(--vs-border);
                background: var(--vs-bg-floating);
                cursor: pointer; transition: all 0.15s ease;
                text-align: center; gap: 6px;
              ">
                <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--vs-bg-raised); color: var(--vs-accent);">${TEMPLATE_ICONS[t.id] || icons.zap}</span>
                <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary);">${escapeHtml(t.name)}</span>
                <span style="font-size: 11px; color: var(--vs-text-tertiary); line-height: 1.3;">${escapeHtml(t.description || '')}</span>
              </button>
            `).join('')}
            <button class="vs-template-card" data-template-id="blank" style="
              display: flex; flex-direction: column; align-items: center;
              padding: 16px 12px; border-radius: 10px;
              border: 1.5px dashed var(--vs-border);
              background: transparent;
              cursor: pointer; transition: all 0.15s ease;
              text-align: center; gap: 6px;
            ">
              <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: transparent; color: var(--vs-text-ghost);">${icons.plus}</span>
              <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-secondary);">Blank</span>
              <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.3;">Start from scratch</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-visible'));

    const close = (result = null) => {
      document.removeEventListener('keydown', onKeydown);
      overlay.classList.remove('is-visible');
      setTimeout(() => overlay.remove(), 200);
      resolve(result);
    };
    const onKeydown = (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
    document.addEventListener('keydown', onKeydown);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.getElementById('close-new-action-modal')?.addEventListener('click', () => close());

    // Template card clicks
    overlay.querySelectorAll('.vs-template-card').forEach(card => {
      // Hover effect
      card.addEventListener('mouseenter', () => {
        card.style.borderColor = 'var(--vs-accent)';
        card.style.background = 'var(--vs-bg-raised)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = card.dataset.templateId === 'blank' ? 'var(--vs-border)' : 'var(--vs-border)';
        card.style.background = card.dataset.templateId === 'blank' ? 'transparent' : 'var(--vs-bg-floating)';
      });

      card.addEventListener('click', async () => {
        const templateId = card.dataset.templateId;

        // Disable all cards while creating
        overlay.querySelectorAll('.vs-template-card').forEach(c => {
          c.style.pointerEvents = 'none';
          c.style.opacity = '0.5';
        });
        card.style.opacity = '1';
        card.style.borderColor = 'var(--vs-accent)';

        if (templateId === 'blank') {
          // Create a blank action
          const blankDef = {
            id: 'new-action-' + Date.now().toString(36).slice(-4),
            name: 'New Action',
            description: '',
            category: 'general',
            active: false,
            fields: [
              { name: 'name', type: 'text', label: 'Full Name', required: true },
            ],
            responses: {
              success: 'Submission received. Your confirmation code is {confirmation_code}.',
            },
          };
          const { ok: createOk, data: createData } = await api.post('/agentic/actions', blankDef);
          if (createOk && createData?.action) {
            showToast('Action created', 'success');
            close({ ok: true, actionId: createData.action.id });
          } else {
            showToast(createData?.error?.message || 'Failed to create action', 'error');
            close();
          }
        } else {
          // Create from template
          const { ok: createOk, data: createData } = await api.post('/agentic/actions/from-template', {
            template_id: templateId,
          });
          if (createOk && createData?.action) {
            showToast(`${createData.action.name} created`, 'success');
            close({ ok: true, actionId: createData.action.id });
          } else {
            showToast(createData?.error?.message || 'Failed to create action', 'error');
            close();
          }
        }
      });
    });
  });
}

/**
 * Render the action detail view (settings + records).
 */
function renderActionDetailView(actionId) {
  setTimeout(() => loadActionDetail(actionId), 0);

  return `
    <div>
      <div id="action-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading action...</div>
      </div>
      <div id="action-detail-body"></div>
      <div id="action-records">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading records...</div>
      </div>
    </div>
  `;
}

async function loadActionDetail(actionId) {
  const headerEl = document.getElementById('action-detail-header');
  const bodyEl   = document.getElementById('action-detail-body');
  const recsEl   = document.getElementById('action-records');
  if (!headerEl) return;

  // Load action definition + stats
  const { ok, data } = await api.get(`/agentic/actions/${encodeURIComponent(actionId)}`);
  if (!ok || !data) {
    headerEl.innerHTML = `<div class="text-sm text-vs-error py-6">Action not found.</div>`;
    if (bodyEl) bodyEl.innerHTML = '';
    if (recsEl) recsEl.innerHTML = '';
    return;
  }

  const action = data.action;
  const stats = data.stats || {};
  const isActive = action.active;

  // Render header with breadcrumb and toolbar
  headerEl.innerHTML = `
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/actions" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Actions</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${escapeHtml(action.name || actionId)}</span>
      </div>
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <h1 class="vs-page-title">${escapeHtml(action.name || actionId)}</h1>
        <div class="flex items-center gap-2">
          <button id="btn-toggle-active" class="vs-btn ${isActive ? 'vs-btn-secondary' : 'vs-btn-primary'} vs-btn-sm" title="${isActive ? 'Deactivate this action' : 'Activate this action on your website'}">
            ${isActive ? '● Live — click to deactivate' : '○ Draft — click to go live'}
          </button>
          <button id="btn-duplicate-action" class="vs-btn vs-btn-ghost vs-btn-sm" title="Duplicate">
            ${icons.copy} Duplicate
          </button>
          <button id="btn-delete-action" class="vs-btn vs-btn-ghost vs-btn-sm" style="color: var(--vs-error);" title="Delete">
            ${icons.trash}
          </button>
        </div>
      </div>
    </div>

    <div class="vs-form-stats-row">
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${stats.total || 0}</span>
        <span class="vs-form-stat-label">Total</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-info)">${stats.by_status?.pending || 0}</span>
        <span class="vs-form-stat-label">Pending</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-success)">${stats.by_status?.confirmed || 0}</span>
        <span class="vs-form-stat-label">Confirmed</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-accent)">${stats.by_status?.completed || 0}</span>
        <span class="vs-form-stat-label">Completed</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${stats.today || 0}</span>
        <span class="vs-form-stat-label">Today</span>
      </div>
    </div>
  `;

  // Render body — identity + fields summary
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="vs-settings-card" style="margin-top: 16px;">
        <h2 class="vs-settings-card-title">Identity &amp; Config</h2>
        <div class="flex flex-col gap-4">
          <div>
            <label for="action-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Name</label>
            <input type="text" id="action-name" class="vs-input" value="${escapeHtml(action.name || '')}" />
          </div>
          <div>
            <label for="action-button-label" class="block text-sm font-medium text-vs-text-secondary mb-1">Bar Button Label <span style="font-weight: 400; color: var(--vs-text-ghost);">(short name for the actions bar)</span></label>
            <input type="text" id="action-button-label" class="vs-input" value="${escapeHtml(action.bar_button_label || '')}" placeholder="${escapeAttr(action.name || 'e.g. Register')}" />
          </div>
          <div>
            <label for="action-description" class="block text-sm font-medium text-vs-text-secondary mb-1">Description</label>
            <input type="text" id="action-description" class="vs-input" value="${escapeHtml(action.description || '')}" placeholder="What does this action do?" />
          </div>

          <div>
            <label class="block text-sm font-medium text-vs-text-secondary mb-1">Bar Icon</label>
            <p class="text-xs text-vs-text-ghost" style="margin-bottom: 8px;">Choose the icon shown in the Actions Bar on your website.</p>
            <div id="icon-picker-grid" style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${[
                ['calendar', 'Calendar'], ['clock', 'Clock'], ['utensils', 'Utensils'], ['file-text', 'Document'],
                ['list', 'List'], ['shopping-bag', 'Shop'], ['ticket', 'Ticket'], ['message-square', 'Message'],
                ['users', 'People'], ['mail', 'Mail'], ['star', 'Star'], ['circle', 'Default'],
              ].map(([key, label]) => `
                <button type="button" class="vs-icon-pick" data-icon="${key}" title="${label}" style="
                  display: flex; align-items: center; justify-content: center;
                  width: 42px; height: 42px; border-radius: var(--radius-md);
                  border: 1.5px solid ${(action.icon || 'circle') === key ? 'var(--vs-accent)' : 'var(--vs-border)'};
                  background: ${(action.icon || 'circle') === key ? 'var(--vs-accent-dim, rgba(var(--vs-accent-rgb, 200,80,40), 0.08))' : 'var(--vs-bg-floating)'};
                  color: ${(action.icon || 'circle') === key ? 'var(--vs-accent)' : 'var(--vs-text-ghost)'};
                  cursor: pointer; transition: all 0.15s ease;
                "><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${{
                  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
                  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
                  utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
                  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
                  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
                  'shopping-bag': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
                  ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
                  'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
                  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
                  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
                  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
                  circle: '<circle cx="12" cy="12" r="10"/>',
                }[key]}</svg></button>
              `).join('')}
            </div>
            <input type="hidden" id="action-icon" value="${escapeHtml(action.icon || 'circle')}" />
          </div>
        </div>
        <div class="vs-settings-card-footer">
          <button id="btn-save-action" class="vs-btn vs-btn-primary vs-btn-sm">Save Changes</button>
        </div>
      </div>

      <div class="vs-settings-card" style="margin-top: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h2 class="vs-settings-card-title" style="margin-bottom: 0;">Fields (${(action.fields || []).length})</h2>
          <button id="btn-add-field" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-bottom: 12px;">${icons.plus || '+'} Add Field</button>
        </div>
        <div id="action-fields-builder" style="display: flex; flex-direction: column; gap: 6px;">
          ${(action.fields || []).map((field, idx) => `
            <div class="vs-field-row" data-field-idx="${idx}"
              data-field-name="${escapeAttr(field.name || '')}"
              data-placeholder="${escapeAttr(field.placeholder || '')}"
              data-default="${escapeAttr(field.default_value || field.default || '')}"
              data-min="${field.min !== undefined ? field.min : ''}"
              data-max="${field.max !== undefined ? field.max : ''}"
              data-maxlength="${field.max_length || ''}"
              data-minlength="${field.min_length || ''}"
              data-options="${escapeAttr(JSON.stringify(field.options || []))}"
              data-description="${escapeAttr(field.description || '')}"
              style="
              display: grid; grid-template-columns: 44px 1.5fr 100px 44px 32px 32px; gap: 6px; align-items: center;
              padding: 8px 10px; border-radius: var(--radius-md);
              border: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface);
              transition: box-shadow 0.15s ease;
            ">
              <div style="display: flex; flex-direction: column; gap: 1px;">
                <button type="button" class="field-move-up" title="Move up" style="
                  border: none; background: none; cursor: pointer; padding: 1px; color: var(--vs-text-ghost);
                  display: flex; align-items: center; justify-content: center; border-radius: 3px;
                  transition: color 0.12s, background 0.12s;
                " ${idx === 0 ? 'disabled style="opacity:0.25;cursor:default;"' : ''}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button type="button" class="field-move-down" title="Move down" style="
                  border: none; background: none; cursor: pointer; padding: 1px; color: var(--vs-text-ghost);
                  display: flex; align-items: center; justify-content: center; border-radius: 3px;
                  transition: color 0.12s, background 0.12s;
                " ${idx === (action.fields || []).length - 1 ? 'disabled style="opacity:0.25;cursor:default;"' : ''}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              <input type="text" class="vs-input field-label" value="${escapeHtml(field.label || '')}" placeholder="Label (e.g. Guest Name)" style="font-size: 13px; height: 32px; padding: 4px 10px;" />
              <select class="vs-input field-type" style="font-size: 12px; height: 32px; padding: 4px 6px;">
                ${['text','email','tel','number','date','time','select','multiselect','textarea','url','checkbox','radio','hidden'].map(t =>
                  `<option value="${t}" ${field.type === t ? 'selected' : ''}>${t === 'multiselect' ? 'multi-select' : t}</option>`
                ).join('')}
              </select>
              <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
                <input type="checkbox" class="field-required" ${field.required ? 'checked' : ''} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${field.required ? 'var(--vs-accent)' : 'var(--vs-border-medium, #ccc)'};
                  transition: background 0.2s ease;
                "></span>
                <span style="
                  position: absolute; left: ${field.required ? '18px' : '2px'}; top: 2px;
                  width: 16px; height: 16px; border-radius: 50%;
                  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                  transition: left 0.2s ease;
                "></span>
              </label>
              <button type="button" class="field-settings" title="Field settings" style="
                border: none; background: none; cursor: pointer; padding: 4px; color: var(--vs-text-ghost);
                display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md);
                transition: color 0.12s, background 0.12s;
              "
                onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
                onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
              <button type="button" class="field-delete" title="Remove field" style="
                border: none; background: none; cursor: pointer; padding: 4px; color: var(--vs-text-ghost);
                display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md);
                transition: color 0.12s, background 0.12s;
              "
                onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';"
                onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                ${icons.trash}
              </button>
            </div>
          `).join('')}
        </div>
        ${(action.fields || []).length === 0 ? '<p class="text-sm text-vs-text-ghost" style="text-align: center; padding: 20px 0;">No fields yet. Click "Add Field" to get started.</p>' : ''}
        <div class="vs-settings-card-footer">
          <button id="btn-save-fields" class="vs-btn vs-btn-primary vs-btn-sm">Save Fields</button>
        </div>
      </div>
    `;

    // ── Toggle switch behavior for existing checkboxes ──
    function bindToggleSwitch(label) {
      const checkbox = label.querySelector('.field-required');
      if (!checkbox) return;
      const track = label.querySelectorAll('span')[0];
      const thumb = label.querySelectorAll('span')[1];
      const update = () => {
        track.style.background = checkbox.checked ? 'var(--vs-accent)' : 'var(--vs-border-medium, #ccc)';
        thumb.style.left = checkbox.checked ? '18px' : '2px';
      };
      checkbox.addEventListener('change', update);
    }
    document.querySelectorAll('.field-required').forEach(cb => {
      bindToggleSwitch(cb.closest('label'));
    });




    // Bind icon picker
    document.querySelectorAll('.vs-icon-pick').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        if (btn.dataset.icon !== document.getElementById('action-icon')?.value) {
          btn.style.borderColor = 'var(--vs-accent)';
          btn.style.color = 'var(--vs-text-secondary)';
        }
      });
      btn.addEventListener('mouseleave', () => {
        if (btn.dataset.icon !== document.getElementById('action-icon')?.value) {
          btn.style.borderColor = 'var(--vs-border)';
          btn.style.color = 'var(--vs-text-ghost)';
        }
      });
      btn.addEventListener('click', () => {
        document.querySelectorAll('.vs-icon-pick').forEach(b => {
          b.style.borderColor = 'var(--vs-border)';
          b.style.background = 'var(--vs-bg-floating)';
          b.style.color = 'var(--vs-text-ghost)';
        });
        btn.style.borderColor = 'var(--vs-accent)';
        btn.style.background = 'var(--vs-accent-dim, rgba(200,80,40,0.08))';
        btn.style.color = 'var(--vs-accent)';
        document.getElementById('action-icon').value = btn.dataset.icon;
      });
    });

    // Bind save (Identity & Config card)
    document.getElementById('btn-save-action')?.addEventListener('click', async () => {
      const updated = { ...action };
      updated.name = document.getElementById('action-name')?.value || action.name;
      updated.bar_button_label = document.getElementById('action-button-label')?.value || '';
      updated.description = document.getElementById('action-description')?.value || '';

      updated.icon = document.getElementById('action-icon')?.value || 'circle';

      const { ok: saveOk, data: saveData } = await api.put(`/agentic/actions/${encodeURIComponent(actionId)}`, updated);
      showToast(saveOk ? 'Action saved' : (saveData?.error?.message || 'Failed to save'), saveOk ? 'success' : 'error');
      if (saveOk) loadActionDetail(actionId);
    });

    // ── Field builder: helper to collect fields from the builder DOM ──
    // Slugify a label into a safe field name: "Guest Name" → "guest_name"
    function slugifyFieldName(label) {
      return label
        .toLowerCase()
        .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/[ñ]/g, 'n').replace(/[ç]/g, 'c')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/^[0-9_]+/, '')  // Must start with a letter
        .replace(/_+/g, '_')
        .replace(/_$/, '');
    }

    function collectFieldsFromBuilder() {
      const rows = document.querySelectorAll('#action-fields-builder .vs-field-row');
      const fields = [];
      const usedNames = new Set();
      rows.forEach(row => {
        const label = row.querySelector('.field-label')?.value?.trim() || '';
        const type = row.querySelector('.field-type')?.value || 'text';
        const required = row.querySelector('.field-required')?.checked || false;

        // Name: use existing saved name, or derive from label
        let name = row.dataset.fieldName || '';
        if (!name && label) {
          name = slugifyFieldName(label);
        }
        // Deduplicate
        if (usedNames.has(name)) {
          let i = 2;
          while (usedNames.has(name + '_' + i)) i++;
          name = name + '_' + i;
        }
        usedNames.add(name);

        if (name && label) {
          const field = { name, type, label, required };
          // Extended properties from data attributes
          const placeholder = row.dataset.placeholder;
          if (placeholder) field.placeholder = placeholder;
          const defaultVal = row.dataset.default;
          if (defaultVal) field.default_value = defaultVal;
          const description = row.dataset.description;
          if (description) field.description = description;
          const minVal = row.dataset.min;
          if (minVal !== '' && minVal !== undefined) field.min = Number(minVal);
          const maxVal = row.dataset.max;
          if (maxVal !== '' && maxVal !== undefined) field.max = Number(maxVal);
          const maxLen = row.dataset.maxlength;
          if (maxLen) field.max_length = Number(maxLen);
          const minLen = row.dataset.minlength;
          if (minLen) field.min_length = Number(minLen);
          const opts = row.dataset.options;
          if (opts) {
            try { field.options = JSON.parse(opts); } catch (e) { field.options = opts.split(',').map(o => o.trim()).filter(Boolean); }
          }
          fields.push(field);
        }
      });
      return fields;
    }

    // ── Field builder: Save Fields button ──
    async function saveFields() {
      // Validate: every row must have a label
      const rows = document.querySelectorAll('#action-fields-builder .vs-field-row');
      let hasError = false;
      rows.forEach(row => {
        const labelVal = row.querySelector('.field-label')?.value?.trim();
        if (!labelVal) {
          hasError = true;
          row.style.borderColor = 'var(--vs-error, #ef4444)';
          row.style.boxShadow = '0 0 0 2px rgba(239,68,68,0.15)';
          setTimeout(() => {
            row.style.borderColor = 'var(--vs-border-subtle)';
            row.style.boxShadow = '';
          }, 2000);
        }
      });
      if (hasError) {
        showToast('Every field needs a label', 'warning');
        return;
      }

      const fields = collectFieldsFromBuilder();
      if (fields.length === 0) {
        showToast('At least one field is required', 'warning');
        return;
      }
      const updated = { ...action, fields };
      const { ok: saveOk, data: saveData } = await api.put(`/agentic/actions/${encodeURIComponent(actionId)}`, updated);
      showToast(saveOk ? 'Fields saved' : (saveData?.error?.message || 'Failed to save'), saveOk ? 'success' : 'error');
      if (saveOk) loadActionDetail(actionId);
    }
    document.getElementById('btn-save-fields')?.addEventListener('click', saveFields);

    // ── Field builder: Add Field ──
    document.getElementById('btn-add-field')?.addEventListener('click', () => {
      const builder = document.getElementById('action-fields-builder');
      if (!builder) return;
      const row = document.createElement('div');
      row.className = 'vs-field-row';
      row.dataset.fieldName = '';  // Will be auto-derived from label on save
      row.dataset.placeholder = '';
      row.dataset.default = '';
      row.dataset.min = '';
      row.dataset.max = '';
      row.dataset.maxlength = '';
      row.dataset.options = '';
      row.dataset.description = '';
      row.style.cssText = `
        display: grid; grid-template-columns: 44px 1.5fr 100px 44px 32px 32px; gap: 6px; align-items: center;
        padding: 8px 10px; border-radius: var(--radius-md);
        border: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface);
        transition: box-shadow 0.15s ease;
      `;
      const gearSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
      row.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1px;">
          <button type="button" class="field-move-up" title="Move up" style="border:none;background:none;cursor:pointer;padding:1px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:3px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button type="button" class="field-move-down" title="Move down" style="border:none;background:none;cursor:pointer;padding:1px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:3px;" disabled style="opacity:0.25;cursor:default;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
        <input type="text" class="vs-input field-label" value="" placeholder="Label (e.g. Guest Name)" style="font-size: 13px; height: 32px; padding: 4px 10px;" />
        <select class="vs-input field-type" style="font-size: 12px; height: 32px; padding: 4px 6px;">
          ${['text','email','tel','number','date','time','select','multiselect','textarea','url','checkbox','radio','hidden'].map(t =>
            `<option value="${t}">${t === 'multiselect' ? 'multi-select' : t}</option>`
          ).join('')}
        </select>
        <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
          <input type="checkbox" class="field-required" style="position: absolute; opacity: 0; width: 0; height: 0;" />
          <span style="position: absolute; inset: 0; border-radius: 10px; background: var(--vs-border-medium, #ccc); transition: background 0.2s ease;"></span>
          <span style="position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: left 0.2s ease;"></span>
        </label>
        <button type="button" class="field-settings" title="Field settings" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${gearSvg}
        </button>
        <button type="button" class="field-delete" title="Remove field" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${icons.trash}
        </button>
      `;
      builder.appendChild(row);
      row.querySelector('.field-label')?.focus();
      bindToggleSwitch(row.querySelector('.field-required')?.closest('label'));
      bindMoveButtons(row);
      bindDeleteButton(row.querySelector('.field-delete'));
      bindSettingsButton(row.querySelector('.field-settings'));
    });

    // ── Field builder: Move up/down ──
    function bindMoveButtons(row) {
      row.querySelector('.field-move-up')?.addEventListener('click', () => {
        const prev = row.previousElementSibling;
        if (prev) {
          row.parentNode.insertBefore(row, prev);
          row.style.boxShadow = '0 0 0 2px var(--vs-accent-dim)';
          setTimeout(() => row.style.boxShadow = '', 300);
        }
      });
      row.querySelector('.field-move-down')?.addEventListener('click', () => {
        const next = row.nextElementSibling;
        if (next) {
          row.parentNode.insertBefore(next, row);
          row.style.boxShadow = '0 0 0 2px var(--vs-accent-dim)';
          setTimeout(() => row.style.boxShadow = '', 300);
        }
      });
    }
    document.querySelectorAll('.vs-field-row').forEach(bindMoveButtons);

    // ── Field builder: Delete with confirmation ──
    function bindDeleteButton(btn) {
      btn.addEventListener('click', async () => {
        const row = btn.closest('.vs-field-row');
        const confirmed = await showConfirmModal({
          title: 'Remove Field',
          description: 'Remove this field from this action? Click Save Fields to apply the change.',
          confirmLabel: 'Remove',
          danger: true,
        });
        if (confirmed) {
          row.style.opacity = '0';
          row.style.transform = 'translateX(20px)';
          row.style.transition = 'opacity 0.2s, transform 0.2s';
          setTimeout(() => row.remove(), 200);
        }
      });
    }
    document.querySelectorAll('.field-delete').forEach(bindDeleteButton);

    // ── Field builder: Settings modal ──
    function bindSettingsButton(btn) {
      if (!btn) return;
      btn.addEventListener('click', () => {
        const row = btn.closest('.vs-field-row');
        if (!row) return;
        const fieldType = row.querySelector('.field-type')?.value || 'text';
        const fieldLabel = row.querySelector('.field-label')?.value || row.querySelector('.field-name')?.value || 'Field';
        openFieldSettingsModal(row, fieldType, fieldLabel);
      });
    }
    document.querySelectorAll('.field-settings').forEach(bindSettingsButton);

    function openFieldSettingsModal(row, fieldType, fieldLabel) {
      // Remove any existing field settings modal
      document.getElementById('vs-field-settings-modal')?.remove();

      const placeholder = row.dataset.placeholder || '';
      const defaultVal = row.dataset.default || '';
      const minVal = row.dataset.min || '';
      const maxVal = row.dataset.max || '';
      const maxLen = row.dataset.maxlength || '';
      const options = row.dataset.options || '[]';
      const description = row.dataset.description || '';

      // Build type-specific fields
      const showPlaceholder = ['text','email','tel','url','textarea'].includes(fieldType);
      const showMinMax = fieldType === 'number';
      const showMaxLength = ['text','email','tel','url','textarea'].includes(fieldType);
      const showOptions = ['select','radio','multiselect'].includes(fieldType);
      const isMultiselect = fieldType === 'multiselect';

      const labelStyle = 'display: block; font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;';
      const groupStyle = 'margin-bottom: 16px;';

      let fieldsHtml = '';

      if (showPlaceholder) {
        fieldsHtml += `<div style="${groupStyle}">
          <label style="${labelStyle}">Placeholder</label>
          <input type="text" id="fs-placeholder" class="vs-input" value="${escapeAttr(placeholder)}" placeholder="e.g. Enter your email…" />
        </div>`;
      }

      fieldsHtml += `<div style="${groupStyle}">
        <label style="${labelStyle}">Default Value</label>
        <input type="${showMinMax ? 'number' : 'text'}" id="fs-default" class="vs-input" value="${escapeAttr(defaultVal)}" placeholder="Pre-filled value" />
      </div>`;

      if (showMinMax) {
        fieldsHtml += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; ${groupStyle}">
          <div>
            <label style="${labelStyle}">Minimum</label>
            <input type="number" id="fs-min" class="vs-input" value="${escapeAttr(minVal)}" placeholder="No limit" />
          </div>
          <div>
            <label style="${labelStyle}">Maximum</label>
            <input type="number" id="fs-max" class="vs-input" value="${escapeAttr(maxVal)}" placeholder="No limit" />
          </div>
        </div>`;
      }

      if (showMaxLength) {
        fieldsHtml += `<div style="${groupStyle}">
          <label style="${labelStyle}">Max Length</label>
          <input type="number" id="fs-maxlength" class="vs-input" value="${escapeAttr(maxLen)}" placeholder="No limit" min="1" />
        </div>`;
      }

      if (showOptions) {
        // Parse JSON array storage to newline display
        let optList;
        try { optList = JSON.parse(options); } catch (e) { optList = options.split(',').map(o => o.trim()).filter(Boolean); }
        let optionsDisplay;
        if (isMultiselect) {
          const defaults = (row.dataset.default || '').split(',').map(d => d.trim()).filter(Boolean);
          optionsDisplay = optList.map(o => (defaults.includes(o) ? '[x] ' + o : o)).join('\n');
        } else {
          optionsDisplay = optList.join('\n');
        }
        fieldsHtml += `<div style="${groupStyle}">
          <label style="${labelStyle}">Options <span style="color: var(--vs-text-ghost); font-weight: 400;">${isMultiselect ? '(one per line, prefix [x] for default)' : '(one per line)'}</span></label>
          <textarea id="fs-options" class="vs-input" rows="5" placeholder="${isMultiselect ? 'Option 1\n[x] Option 2\n[x] Option 3\nOption 4' : 'Option 1\nOption 2\nOption 3'}" style="height: auto; resize: vertical; min-height: 64px;">${escapeHtml(optionsDisplay)}</textarea>
        </div>`;
      }

      fieldsHtml += `<div style="${groupStyle}">
        <label style="${labelStyle}">Help Text <span style="color: var(--vs-text-ghost); font-weight: 400;">(shown below field)</span></label>
        <input type="text" id="fs-description" class="vs-input" value="${escapeAttr(description)}" placeholder="Optional description or instructions" />
      </div>`;

      const modal = document.createElement('div');
      modal.id = 'vs-field-settings-modal';
      modal.style.cssText = 'position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;';
      modal.innerHTML = `
        <div style="
          position: absolute; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
        " id="fs-backdrop"></div>
        <div style="
          position: relative; background: var(--vs-bg-floating, #fff); border-radius: var(--radius-lg, 12px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.2); width: 440px; max-width: 90vw; max-height: 85vh;
          overflow: hidden; animation: vsSlideUp 200ms ease-out;
        ">
          <div style="
            padding: 20px 24px 16px; border-bottom: 1px solid var(--vs-border-subtle);
            display: flex; align-items: center; justify-content: space-between;
          ">
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--vs-text-primary);">
                ${escapeHtml(fieldLabel)} Settings
              </h3>
              <span style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 2px; display: block;">
                Type: ${fieldType}
              </span>
            </div>
            <button id="fs-close" style="
              border: none; background: none; cursor: pointer; padding: 6px; color: var(--vs-text-ghost);
              display: flex; border-radius: var(--radius-md); transition: all 0.12s;
            " onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
              onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div style="padding: 20px 24px; overflow-y: auto; max-height: calc(85vh - 140px);">
            ${fieldsHtml}
          </div>
          <div style="
            padding: 16px 24px; border-top: 1px solid var(--vs-border-subtle);
            display: flex; justify-content: flex-end; gap: 8px;
          ">
            <button id="fs-cancel" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
            <button id="fs-save" class="vs-btn vs-btn-primary vs-btn-sm">Apply</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Focus first input
      setTimeout(() => modal.querySelector('input, textarea')?.focus(), 100);

      // Close handlers
      const closeModal = () => modal.remove();
      modal.querySelector('#fs-backdrop')?.addEventListener('click', closeModal);
      modal.querySelector('#fs-close')?.addEventListener('click', closeModal);
      modal.querySelector('#fs-cancel')?.addEventListener('click', closeModal);

      // Escape key
      const onEsc = (e) => { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onEsc); } };
      document.addEventListener('keydown', onEsc);

      // Save
      modal.querySelector('#fs-save')?.addEventListener('click', () => {
        if (showPlaceholder) row.dataset.placeholder = modal.querySelector('#fs-placeholder')?.value || '';
        row.dataset.default = modal.querySelector('#fs-default')?.value || '';
        if (showMinMax) {
          row.dataset.min = modal.querySelector('#fs-min')?.value || '';
          row.dataset.max = modal.querySelector('#fs-max')?.value || '';
        }
        if (showMaxLength) row.dataset.maxlength = modal.querySelector('#fs-maxlength')?.value || '';
        if (showOptions) {
          const rawOpts = modal.querySelector('#fs-options')?.value || '';
          // Parse newline-separated options (all types)
          const lines = rawOpts.split(/[\n]/).map(l => l.trim()).filter(Boolean);
          if (isMultiselect) {
            const optNames = [];
            const defaults = [];
            lines.forEach(line => {
              const match = line.match(/^\[x\]\s*(.+)$/i);
              if (match) {
                optNames.push(match[1].trim());
                defaults.push(match[1].trim());
              } else {
                optNames.push(line);
              }
            });
            row.dataset.options = JSON.stringify(optNames);
            row.dataset.default = defaults.join(',');
          } else {
            row.dataset.options = JSON.stringify(lines);
          }
        }
        row.dataset.description = modal.querySelector('#fs-description')?.value || '';

        // Visual feedback: flash the row
        row.style.boxShadow = '0 0 0 2px var(--vs-accent-dim)';
        setTimeout(() => row.style.boxShadow = '', 400);

        closeModal();
        showToast('Field settings updated', 'success');
      });
    }

    // Bind toggle active
    document.getElementById('btn-toggle-active')?.addEventListener('click', async () => {
      const updated = { ...action, active: !isActive };
      const { ok: toggleOk } = await api.put(`/agentic/actions/${encodeURIComponent(actionId)}`, updated);
      if (toggleOk) {
        showToast(updated.active ? 'Action activated' : 'Action deactivated', 'success');
        loadActionDetail(actionId); // Re-render
      } else {
        showToast('Failed to update status', 'error');
      }
    });

    // Bind duplicate
    document.getElementById('btn-duplicate-action')?.addEventListener('click', async () => {
      const confirmed = await showConfirmModal({
        title: 'Duplicate Action',
        description: `Create a copy of "${action.name}"? The copy will start as a draft.`,
        confirmLabel: 'Duplicate',
      });
      if (!confirmed) return;
      const { ok: dupOk, data: dupData } = await api.post(`/agentic/actions/${encodeURIComponent(actionId)}/duplicate`, {});
      if (dupOk && dupData?.action) {
        showToast(`"${dupData.action.name}" created`, 'success');
        window.location.hash = `#/actions/${dupData.action.id}`;
      } else {
        showToast(dupData?.error?.message || 'Failed to duplicate', 'error');
      }
    });

    // Bind delete
    document.getElementById('btn-delete-action')?.addEventListener('click', async () => {
      const confirmed = await showConfirmModal({
        title: 'Delete Action',
        description: `Delete "${action.name}"? This will permanently remove the action definition. Existing records will remain in the database but will no longer be accessible.`,
        confirmLabel: 'Delete',
        danger: true,
      });
      if (confirmed) {
        const { ok: delOk } = await api.delete(`/agentic/actions/${encodeURIComponent(actionId)}`);
        if (delOk) {
          showToast('Action deleted', 'success');
          window.location.hash = '#/actions';
        } else {
          showToast('Failed to delete action', 'error');
        }
      }
    });
  }

  // Load records
  await loadActionRecords(actionId, 1);
}

async function loadActionRecords(actionId, page = 1) {
  const container = document.getElementById('action-records');
  if (!container) return;

  const status = document.getElementById('action-filter-status')?.value || 'all';
  const search = document.getElementById('action-filter-search')?.value || '';

  let url = `/agentic/actions/${encodeURIComponent(actionId)}/records?page=${page}&per_page=20`;
  if (status !== 'all') url += `&status=${encodeURIComponent(status)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const { ok, data } = await api.get(url);
  if (!ok || !data) {
    container.innerHTML = `<div class="text-sm text-vs-error py-4">Failed to load records.</div>`;
    return;
  }

  const records = data.records || [];
  const total = data.total || 0;
  const perPage = data.per_page || 20;
  const totalPages = Math.ceil(total / perPage);

  container.innerHTML = `
    <div class="vs-settings-card" style="margin-top: 16px;">
      <h2 class="vs-settings-card-title">Records</h2>
      <div class="vs-form-filter-bar" style="margin-bottom: 12px;">
        <div class="flex items-center gap-2 flex-wrap">
          <select id="action-filter-status" class="vs-input vs-input-compact">
            <option value="all" ${status === 'all' ? 'selected' : ''}>All statuses</option>
            <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="completed" ${status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            <option value="no-show" ${status === 'no-show' ? 'selected' : ''}>No-show</option>
          </select>
          <input type="text" id="action-filter-search" class="vs-input vs-input-compact" placeholder="Search records..." value="${escapeHtml(search)}" style="min-width: 180px;" />
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-purge-records" class="vs-btn vs-btn-secondary vs-btn-sm" title="Remove old records" ${total === 0 ? 'disabled style="opacity:0.4;pointer-events:none;"' : ''}>
            ${icons.trash} Purge Old
          </button>
          <button id="btn-export-action-csv" class="vs-btn vs-btn-secondary vs-btn-sm" ${total === 0 ? 'disabled style="opacity:0.4;pointer-events:none;"' : ''} title="${total === 0 ? 'No records to export' : 'Download records as CSV'}">
            ${icons.download} Export CSV
          </button>
        </div>
      </div>

      ${records.length === 0 ? `
        <div style="text-align: center; padding: 32px 16px;">
          <div style="color: var(--vs-text-ghost); margin-bottom: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div class="text-sm" style="color: var(--vs-text-tertiary); font-weight: 500;">No records yet</div>
          <div style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 4px;">Test the action or wait for your first submission.</div>
        </div>
      ` : `
        <div style="overflow-x: auto;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--vs-border);">
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500; width: 32px;"></th>
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500;">Ref</th>
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500;">Summary</th>
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500;">Status</th>
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500;">Source</th>
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500;">Created</th>
                <th style="width: 32px;"></th>
              </tr>
            </thead>
            <tbody>
              ${records.map(rec => {
                const recData = typeof rec.data === 'string' ? JSON.parse(rec.data) : rec.data;
                const cleanData = Object.fromEntries(
                  Object.entries(recData || {}).filter(([k]) => !k.startsWith('_'))
                );
                const preview = Object.values(cleanData).filter(v => typeof v === 'string' && v.length > 0).slice(0, 2).join(' · ');
                const sc = ACTION_STATUS_COLORS[rec.status] || ACTION_STATUS_COLORS.pending;
                const sourceLabel = rec.source === 'web' ? 'Website' : rec.source === 'mcp' ? 'MCP' : rec.source === 'api' ? 'API' : rec.source || 'Website';
                return `
                  <tr style="border-bottom: 1px solid var(--vs-border-dim);" data-record-id="${rec.id}" class="vs-record-row">
                    <td style="padding: 8px 6px 8px 12px; width: 32px; vertical-align: middle;">
                      <button type="button" class="vs-record-toggle" data-rid="${rec.id}" title="Show details" style="
                        border: none; background: none; cursor: pointer; padding: 2px; color: var(--vs-text-ghost);
                        display: flex; align-items: center; transition: transform 0.15s ease;
                      ">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </td>
                    <td style="padding: 8px 12px; font-family: var(--vs-font-mono); font-size: 12px; color: var(--vs-accent);">${escapeHtml(rec.confirmation_code || '—')}</td>
                    <td style="padding: 8px 12px; color: var(--vs-text-secondary); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(preview || '—')}</td>
                    <td style="padding: 8px 12px;">
                      <select class="vs-input vs-input-compact vs-action-status-select" data-record-id="${rec.id}" style="font-size: 12px; padding: 2px 8px; min-width: auto;">
                        ${Object.entries(ACTION_STATUS_COLORS).map(([key, conf]) =>
                          `<option value="${key}" ${rec.status === key ? 'selected' : ''}>${conf.label}</option>`
                        ).join('')}
                      </select>
                    </td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${sourceLabel}</td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${formatRelativeTime(rec.created_at)}</td>
                    <td style="padding: 8px 4px; width: 32px; text-align: center;">
                      <button type="button" class="vs-record-delete" data-rid="${rec.id}" title="Delete record" style="
                        border: none; background: none; cursor: pointer; padding: 4px; color: var(--vs-text-ghost);
                        display: inline-flex; align-items: center; border-radius: var(--radius-md);
                        transition: color 0.12s, background 0.12s;
                      " onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';" onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                  <tr class="vs-record-detail" data-detail-for="${rec.id}" style="display: none;">
                    <td colspan="7" style="padding: 0 12px 12px 44px; background: var(--vs-bg-recessed, var(--vs-bg-ghost));">
                      <div style="
                        display: grid; grid-template-columns: auto 1fr; gap: 4px 16px;
                        font-size: 12px; padding: 12px 0;
                      ">
                        ${Object.entries(cleanData).map(([key, val]) => `
                          <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${escapeHtml(key.replace(/_/g, ' '))}</div>
                          <div style="color: var(--vs-text-primary); word-break: break-word; white-space: pre-wrap;">${escapeHtml(String(val || '—'))}</div>
                        `).join('')}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        ${totalPages > 1 ? `
          <div class="flex items-center justify-between" style="padding: 12px 0; font-size: 13px;">
            <button class="vs-btn vs-btn-ghost vs-btn-sm" id="action-records-prev" ${page <= 1 ? 'disabled' : ''} data-page="${page - 1}">← Previous</button>
            <span class="text-vs-text-tertiary">Page ${page} of ${totalPages} · ${total} record${total !== 1 ? 's' : ''}</span>
            <button class="vs-btn vs-btn-ghost vs-btn-sm" id="action-records-next" ${page >= totalPages ? 'disabled' : ''} data-page="${page + 1}">Next →</button>
          </div>
        ` : `
          <div class="text-sm text-vs-text-ghost text-center" style="padding: 8px 0;">${total} record${total !== 1 ? 's' : ''}</div>
        `}
      `}
    </div>
  `;

  // Bind filters
  let searchDebounce = null;
  const reload = () => loadActionRecords(actionId, 1);

  document.getElementById('action-filter-status')?.addEventListener('change', reload);
  document.getElementById('action-filter-search')?.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(reload, 300);
  });

  // Bind pagination
  document.getElementById('action-records-prev')?.addEventListener('click', (e) => {
    const p = parseInt(e.currentTarget.dataset.page);
    if (p >= 1) loadActionRecords(actionId, p);
  });
  document.getElementById('action-records-next')?.addEventListener('click', (e) => {
    const p = parseInt(e.currentTarget.dataset.page);
    if (p <= totalPages) loadActionRecords(actionId, p);
  });

  // Bind inline status changes
  // Record expand/collapse
  container.querySelectorAll('.vs-record-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const rid = btn.dataset.rid;
      const detail = container.querySelector(`.vs-record-detail[data-detail-for="${rid}"]`);
      if (!detail) return;
      const isOpen = detail.style.display !== 'none';
      detail.style.display = isOpen ? 'none' : 'table-row';
      btn.style.transform = isOpen ? '' : 'rotate(90deg)';
    });
  });

  container.querySelectorAll('.vs-action-status-select').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const recId = e.target.dataset.recordId;
      const newStatus = e.target.value;
      const { ok: updateOk } = await api.put(`/agentic/actions/${encodeURIComponent(actionId)}/records/${recId}`, { status: newStatus });
      showToast(updateOk ? 'Status updated' : 'Failed to update', updateOk ? 'success' : 'error');
    });
  });

  document.getElementById('btn-purge-records')?.addEventListener('click', async () => {
    const purgeOptions = [
      { label: 'Older than 3 days', days: 3 },
      { label: 'Older than 1 week', days: 7 },
      { label: 'Older than 2 weeks', days: 14 },
      { label: 'Older than 1 month', days: 30 },
      { label: 'Older than 3 months', days: 90 },
      { label: 'Older than 6 months', days: 180 },
      { label: 'Older than 1 year', days: 365 },
    ];

    // Use the Studio's existing modal overlay system (same as showConfirmModal)
    const existing = document.getElementById('vs-purge-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'vs-purge-overlay';
    overlay.className = 'vs-modal-overlay';
    overlay.innerHTML = `
      <div class="vs-modal" style="max-width: 400px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Purge Old Records</h2>
          <p class="vs-modal-desc">Remove records older than a chosen period. This cannot be undone.</p>
        </div>
        <div class="vs-modal-body">
          <select id="vs-purge-select" class="vs-input" style="width: 100%; font-size: 13px;">
            ${purgeOptions.map(opt =>
              `<option value="${opt.days}">${opt.label}</option>`
            ).join('')}
          </select>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-purge-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-purge-ok" class="vs-btn vs-btn-danger vs-btn-sm" type="button">Purge</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-visible'));

    const close = () => closeModal(overlay);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.getElementById('vs-purge-cancel')?.addEventListener('click', close);
    document.getElementById('vs-purge-ok')?.addEventListener('click', async () => {
      const select = document.getElementById('vs-purge-select');
      const days = parseInt(select?.value);
      const label = select?.selectedOptions[0]?.textContent || '';
      close();
      // Wait for close animation
      await new Promise(r => setTimeout(r, 200));
      const confirmed = await showConfirmModal({
        title: 'Confirm Purge',
        description: `This will permanently delete all records "${label.toLowerCase()}" for this action. This cannot be undone.`,
        confirmLabel: 'Purge',
        danger: true,
      });
      if (!confirmed) return;
      const { ok: purgeOk, data: purgeData } = await api.post(`/agentic/actions/${encodeURIComponent(actionId)}/records/purge`, { older_than_days: days });
      if (purgeOk) {
        showToast(`${purgeData?.purged || 0} record(s) purged`, 'success');
        loadActionRecords(actionId, 1);
      } else {
        showToast('Failed to purge records', 'error');
      }
    });
  });

  // Delete single record
  container.querySelectorAll('.vs-record-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const rid = btn.dataset.rid;
      const confirmed = await showConfirmModal({
        title: 'Delete Record',
        description: 'Permanently delete this record? This cannot be undone.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!confirmed) return;
      const { ok } = await api.delete(`/agentic/actions/${encodeURIComponent(actionId)}/records/${rid}`);
      if (ok) {
        showToast('Record deleted', 'success');
        loadActionRecords(actionId, page);
      } else {
        showToast('Failed to delete record', 'error');
      }
    });
  });

  // Bind Export CSV button (proper file download via fetch)
  document.getElementById('btn-export-action-csv')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-export-action-csv');
    const origHTML = btn.innerHTML;
    btn.innerHTML = `${icons.loader} Exporting...`;
    btn.disabled = true;
    try {
      const resp = await fetch(`/_studio/api/router.php?_path=${encodeURIComponent('/agentic/actions/' + actionId + '/records/export')}`, {
        credentials: 'same-origin',
      });
      if (!resp.ok) throw new Error('Export failed');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${actionId}_records_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('CSV downloaded', 'success');
    } catch {
      showToast('Failed to export CSV', 'error');
    }
    btn.innerHTML = origHTML;
    btn.disabled = false;
  });
}

// ═══════════════════════════════════════════
//  Conversation History
// ═══════════════════════════════════════════

/**
 * Toggle the conversation history panel open/closed.
 * When opened, loads the conversation list from the API.
 */
function toggleConversationHistory() {
  const panel = document.getElementById('conversation-history-panel');
  if (!panel) return;

  const isHidden = panel.classList.contains('hidden');
  if (isHidden) {
    panel.classList.remove('hidden');
    loadConversations();
  } else {
    panel.classList.add('hidden');
  }
}

/**
 * Load conversation list from the API and render into the panel.
 */
async function loadConversations() {
  const listEl = document.getElementById('conversation-list');
  if (!listEl) return;

  listEl.innerHTML = '<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>';

  const { ok, data, error } = await api.get('/ai/conversations');

  if (!ok || !data?.conversations) {
    listEl.innerHTML = `<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">${escapeHtml(error?.message || 'Could not load conversations.')}</div>`;
    return;
  }

  const conversations = data.conversations;
  const activeId = store.get('activeConversationId');

  if (conversations.length === 0) {
    listEl.innerHTML = '<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">No conversations yet. Start chatting!</div>';
    return;
  }

  listEl.innerHTML = conversations.map(conv => {
    const isActive = conv.id === activeId;
    const title = conv.title || 'Untitled conversation';
    const date = conv.updated_at
      ? new Date(conv.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '';

    return `
      <button class="vs-conv-item w-full text-left ${isActive ? 'vs-conv-item-active' : ''}"
              data-conversation-id="${escapeHtml(conv.id)}">
        <span class="mt-0.5 shrink-0 ${isActive ? 'text-vs-accent' : 'text-vs-text-ghost'}">${icons.messageCircle}</span>
        <div class="min-w-0 flex-1">
          <div class="text-vs-text-primary truncate ${isActive ? 'font-medium' : ''}" style="font-size: var(--text-sm);">${escapeHtml(title)}</div>
          <div class="vs-conv-time mt-0.5">${date}</div>
        </div>
        ${isActive ? '<span class="mt-1 w-1.5 h-1.5 rounded-full bg-vs-accent shrink-0"></span>' : ''}
      </button>
    `;
  }).join('');

  // Bind click on conversation items
  listEl.querySelectorAll('[data-conversation-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const convId = btn.dataset.conversationId;
      loadConversation(convId);
      // Close the history panel after selection
      const panel = document.getElementById('conversation-history-panel');
      if (panel) panel.classList.add('hidden');
    });
  });
}

/**
 * Load a specific conversation and render its messages.
 * @param {string} conversationId
 */
async function loadConversation(conversationId) {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;

  // Show loading state
  chatMessages.innerHTML = '<div class="flex items-center justify-center h-full text-sm text-vs-text-ghost">Loading conversation...</div>';

  const { ok, data, error } = await api.get(`/ai/conversations/${conversationId}`);

  if (!ok || !data?.conversation) {
    // Stale conversation ID (e.g. after reinstall) — clear it and show empty chat
    store.set('activeConversationId', null);
    setActivePageScope(null);
    try { localStorage.removeItem('vs-active-conversation'); } catch (_) {}
    chatMessages.innerHTML = renderEmptyChat();
    bindQuickPromptButtons();
    return;
  }

  const conversation = data.conversation;
  const prompts = conversation.prompts || [];

  // Store the active conversation ID (state + localStorage)
  store.set('activeConversationId', conversationId);
  setActivePageScope(conversation.page_scope || null);
  try { localStorage.setItem('vs-active-conversation', conversationId); } catch (_) {}

  if (prompts.length === 0) {
    chatMessages.innerHTML = renderEmptyChat();
    bindQuickPromptButtons();
    return;
  }

  // Render all messages
  let messagesHtml = '';
  let hasStreamingPrompt = false;

  for (const prompt of prompts) {
    // User message — parse embedded image thumbnails from [vx-img:...] markers
    const { text: userText, images: userImages } = parseVxImages(prompt.user_prompt);
    const historyImagesHtml = userImages.length > 0
      ? `<div class="vs-msg-user-images">${userImages.map(src =>
          `<img src="${src}" class="vs-msg-user-image" />`
        ).join('')}</div>`
      : '';

    messagesHtml += `
      <div class="mb-5">
        <div class="text-xs text-vs-text-ghost mb-1 font-medium">You</div>
        ${historyImagesHtml}
        <div class="text-sm text-vs-text-primary leading-relaxed">${escapeHtml(userText)}</div>
      </div>
    `;

    // AI response
    if (prompt.ai_response || prompt.files_modified) {
      let aiContent = '';
      const assistantMessage = typeof prompt.ai_message === 'string' && prompt.ai_message.trim() !== ''
        ? prompt.ai_message
        : prompt.ai_response;
      if (assistantMessage) {
        aiContent = renderAiResponseHtml(assistantMessage);
      }

      let filesHtml = '';
      if (prompt.files_modified) {
        try {
          const files = JSON.parse(prompt.files_modified);
          if (Array.isArray(files) && files.length > 0) {
            const badgesHtml = files.map(f => {
              const filePath = typeof f === 'string' ? f : (f.path || f);
              const isDelete = typeof f === 'object' && f.action === 'delete';
              const icon = isDelete
                ? '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>'
                : '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>';
              return `<div class="vs-file-badge ${isDelete ? 'vs-file-badge-deleted' : 'vs-file-badge-created'}">
                <span class="vs-file-badge-icon">${icon}</span>
                <span>${escapeHtml(String(filePath))}</span>
              </div>`;
            }).join('');

            const n = files.length;
            filesHtml = `
              <div class="vs-files-section vs-files-done" style="animation: none;">
                <div class="vs-files-header">
                  <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
                  <span>Files updated</span>
                  <span class="vs-files-count">${n} file${n !== 1 ? 's' : ''}</span>
                </div>
                <div class="vs-files-list">${badgesHtml}</div>
              </div>`;
          }
        } catch (_) {
          // files_modified might not be valid JSON
        }
      }

      const statusLabel = prompt.status === 'error'
        ? '<div class="mt-2 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>'
        : '';

      messagesHtml += `
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="vs-msg-ai-bubble">${aiContent}</div>
          ${filesHtml}
          ${statusLabel}
        </div>
      `;
    } else if (prompt.status === 'streaming') {
      hasStreamingPrompt = true;
      const promptId = prompt.id;
      messagesHtml += `
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="text-sm text-vs-text-tertiary leading-relaxed flex items-center gap-2">
            <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Generation in progress...
            <button onclick="window.__vsCancelStreamingPrompt && window.__vsCancelStreamingPrompt(${promptId})"
              class="vs-btn vs-btn-ghost vs-btn-xs" style="margin-left: 4px; color: var(--vs-text-tertiary);">Stop</button>
          </div>
        </div>
      `;
    } else if (prompt.status === 'partial') {
      messagesHtml += `
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="mt-1 px-3 py-2 text-sm rounded-lg" style="background: var(--vs-warning-dim, rgba(234,179,8,0.1)); color: var(--vs-warning, #eab308);">
            Generation was interrupted. Some files may be missing — send a follow-up prompt to complete the site.
          </div>
        </div>
      `;
    } else if (prompt.status === 'error') {
      messagesHtml += `
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="mt-1 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>
        </div>
      `;
    }
  }

  chatMessages.innerHTML = messagesHtml;
  chatMessages.scrollTop = chatMessages.scrollHeight;

  if (!window.__vsResumedToastByConversation) {
    window.__vsResumedToastByConversation = {};
  }

  if (hasStreamingPrompt && !window.__vsResumedToastByConversation[conversationId]) {
    showToast('Resumed generation. Continuing from where you left off.', 'warning', 4200);
    window.__vsResumedToastByConversation[conversationId] = true;
  }
  if (!hasStreamingPrompt) {
    delete window.__vsResumedToastByConversation[conversationId];
  }

  // Register the cancel handler for streaming prompts
  window.__vsCancelStreamingPrompt = async function(promptId) {
    try {
      await api.post('/ai/cancel-generation', { prompt_id: promptId });
    } catch (_) {
      // Even if API fails, clear the polling state
    }
    // Suppress resumed toast for this conversation
    if (!window.__vsResumedToastByConversation) window.__vsResumedToastByConversation = {};
    window.__vsResumedToastByConversation[conversationId] = '__cancelled__';
    // Reload to show updated state
    loadConversation(conversationId);
  };

  // If generation is still in progress on the backend (for example after
  // a refresh), poll conversation history until the final response lands.
  // Safety: stop after ~60 polls (~2.5 min) to prevent infinite loops.
  if (hasStreamingPrompt && store.get('activeConversationId') === conversationId && !store.get('aiStreaming')) {
    if (!window.__vsPollingCount) window.__vsPollingCount = {};
    window.__vsPollingCount[conversationId] = (window.__vsPollingCount[conversationId] || 0) + 1;
    if (window.__vsPollingCount[conversationId] <= 60) {
      setTimeout(() => {
        if (store.get('activeConversationId') === conversationId && !store.get('aiStreaming')) {
          loadConversation(conversationId);
        }
      }, 2500);
    } else {
      // Max polls reached — stop polling
      delete window.__vsPollingCount[conversationId];
    }
  } else {
    // Generation done or conversation changed — reset counter
    if (window.__vsPollingCount) delete window.__vsPollingCount[conversationId];
  }
}

/**
 * Start a new conversation — clear chat and reset state.
 */
function startNewConversation() {
  store.set('activeConversationId', null);
  setActivePageScope(null);
  try { localStorage.removeItem('vs-active-conversation'); } catch (_) {}

  const chatMessages = document.getElementById('chat-messages');
  if (chatMessages) {
    chatMessages.innerHTML = renderEmptyChat();
    bindQuickPromptButtons();
  }

  // Close history panel if open
  const panel = document.getElementById('conversation-history-panel');
  if (panel) panel.classList.add('hidden');

  // Focus the prompt input
  const input = document.getElementById('prompt-input');
  if (input) input.focus();
}

/**
 * Convert a page file path to a compact UI label for the scope button.
 * Derives the label from the current preview path.
 * @param {string|null} pagePath  e.g. 'contact.php', 'blog/post.php'
 * @returns {string}
 */
function formatPageScopeLabel(pagePath) {
  if (!pagePath) return 'Pages';
  // Strip .php / .html extension
  let slug = pagePath.replace(/\.(php|html)$/i, '');
  // index → Home Page
  if (slug === 'index') return 'Home Page';
  // Take only the filename (last segment) for nested paths
  const segments = slug.split('/');
  slug = segments[segments.length - 1];
  // Title case
  const words = slug.split('-').filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1));
  return words.length ? words.join(' ') : slug;
}

/**
 * Keep scope selector button label synced with the current preview page.
 */
function updateScopeSelectorUi() {
  const labelEl = document.getElementById('scope-label');
  if (!labelEl) return;
  const currentPath = window.__vsCurrentPreviewPath || null;
  labelEl.textContent = formatPageScopeLabel(currentPath);
}

/**
 * Set active page scope for the current conversation context.
 * @param {string|null} scope
 */
function setActivePageScope(scope) {
  store.set('activePageScope', scope || null);
  updateScopeSelectorUi();
  // Deactivate visual editor when navigating to a different page
  if (isVisualEditorActive()) {
    deactivateVisualEditor();
  }
}

/**
 * Open pages modal showing all CMS-generated files with edit/delete/preview actions.
 */
async function openPageScopeSelector() {
  // Remove any existing modal
  const existing = document.getElementById('vs-pages-modal-overlay');
  if (existing) existing.remove();

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'vs-pages-modal-overlay';
  overlay.className = 'vs-modal-overlay';
  overlay.innerHTML = `
    <div class="vs-modal" style="max-width: 560px; max-height: 80vh; display: flex; flex-direction: column;">
      <div class="vs-modal-header" style="flex-shrink: 0;">
        <h2 class="vs-modal-title">Your Pages</h2>
        <p class="vs-modal-desc">All pages on your website. Files scanned from the preview directory.</p>
      </div>
      <div style="height: 6px;"></div>
      <div id="vs-pages-modal-body" style="overflow-y: auto; flex: 1; padding: 0 24px 20px; min-height: 0;">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading pages...</div>
      </div>
      <div class="vs-modal-footer" style="flex-shrink: 0;">
        <button id="vs-pages-modal-close" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  // Close handlers
  const close = () => closeModal(overlay);
  overlay.querySelector('#vs-pages-modal-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Load pages from filesystem
  const body = overlay.querySelector('#vs-pages-modal-body');
  const { ok, data, error } = await api.get('/pages?flat=1');

  if (!ok || !Array.isArray(data?.pages)) {
    body.innerHTML = `
      <div class="text-sm text-vs-error py-6 text-center">
        ${escapeHtml(error?.message || 'Could not load pages.')}
      </div>
    `;
    return;
  }

  const pages = data.pages;

  if (!pages.length) {
    body.innerHTML = `
      <div class="text-center py-8">
        <div class="text-vs-text-ghost mb-2" style="opacity: 0.5;">${icons.fileText.replace('width="14"', 'width="32"').replace('height="14"', 'height="32"')}</div>
        <p class="text-sm font-medium text-vs-text-secondary mb-1">No pages yet</p>
        <p class="text-xs text-vs-text-ghost">Go to Chat and describe the website you want to create.</p>
      </div>
    `;
    return;
  }

  // Build page list HTML
  let html = `<div style="display: flex; flex-direction: column; gap: 2px;">`;

  pages.forEach(page => {
    const isHome = Boolean(Number(page.is_homepage));
    const title = page.title || page.slug || page.path;
    const filePath = page.path || page.slug + '.php';
    const displayPath = '/' + filePath.replace(/\.php$/, '').replace(/^index$/, '');
    const cleanUrl = displayPath === '/' ? '/' : displayPath;
    const icon = getPageIcon(page.slug);
    const currentPreviewPath = window.__vsCurrentPreviewPath || 'index.php';
    const isActive = currentPreviewPath === filePath;
    const sizeKb = page.size ? (page.size / 1024).toFixed(1) + ' KB' : '';

    html += `
      <div class="vs-pages-modal-item ${isActive ? 'is-active' : ''}" data-slug="${escapeHtml(page.slug)}" data-path="${escapeHtml(filePath)}" data-title="${escapeHtml(title)}" data-url="${escapeHtml(cleanUrl)}">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
          <span style="color: var(--vs-text-ghost); flex-shrink: 0;">${icon}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${escapeHtml(title)}${isHome ? ' <span style="font-size:10px; font-weight:600; color:var(--vs-accent); border: 1px solid var(--vs-accent); border-radius: 4px; padding: 0 4px; margin-left: 6px; vertical-align: middle;">HOME</span>' : ''}
            </div>
            <div style="font-size: 11px; color: var(--vs-text-ghost); font-family: var(--vs-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${escapeHtml(filePath)}${sizeKb ? ' · ' + sizeKb : ''}
            </div>
          </div>
        </div>
        <div class="vs-pages-modal-actions" style="display: flex; align-items: center; gap: 2px; flex-shrink: 0;">
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="edit" title="Edit in Chat" style="width:28px;height:28px;">
            ${icons.messageCircle}
          </button>
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="preview" title="Open in Preview" style="width:28px;height:28px;">
            ${icons.eye}
          </button>
          ${isHome ? '' : `
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="delete" title="Delete in Chat" style="width:28px;height:28px;color:var(--vs-error);">
            ${icons.trash2}
          </button>
          `}
        </div>
      </div>
    `;
  });

  html += `</div>`;
  body.innerHTML = html;

  // Update subtitle with count
  const desc = overlay.querySelector('.vs-modal-desc');
  if (desc) {
    desc.textContent = `${pages.length} page${pages.length !== 1 ? 's' : ''} found on your website.`;
  }

  // Wire action buttons
  body.querySelectorAll('.vs-pages-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = btn.closest('.vs-pages-modal-item');
      const slug = item.dataset.slug;
      const filePath = item.dataset.path;
      const title = item.dataset.title;
      const cleanUrl = item.dataset.url;
      const action = btn.dataset.action;

      if (action === 'edit') {
        // Set scope to this page and navigate to chat with edit prompt
        setActivePageScope(slug);
        close();
        navigateToChatWithPrompt(`Edit the "${title}" page (${cleanUrl}): `);
      } else if (action === 'preview') {
        // Open preview in the iframe (if on dashboard) or new tab
        const iframe = document.getElementById('preview-iframe');
        if (iframe) {
          if (isVisualEditorActive()) deactivateVisualEditor();
          iframe.src = '/_studio/api/router.php?_path=%2Fpreview&path=' + encodeURIComponent(filePath) + '&t=' + Date.now();
          window.__vsCurrentPreviewPath = filePath;
          updateScopeSelectorUi();
          close();
          showToast(`Preview: ${title}`, 'success');
        } else {
          window.open('/_studio/api/router.php?_path=%2Fpreview&path=' + encodeURIComponent(filePath), '_blank');
        }
      } else if (action === 'delete') {
        close();
        const deletePrompt = `Delete the "${title}" page (${cleanUrl}). Remove it completely: delete the file, remove it from the navigation in nav.php, remove it from the footer, and update any internal links on other pages that point to it.`;
        navigateToChatWithPrompt(deletePrompt);
      }
    });
  });

  // Wire row click → open in preview
  body.querySelectorAll('.vs-pages-modal-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.vs-pages-action')) return;
      const filePath = item.dataset.path;
      const title = item.dataset.title;
      const iframe = document.getElementById('preview-iframe');
      if (iframe) {
        iframe.src = '/_studio/api/router.php?_path=%2Fpreview&path=' + encodeURIComponent(filePath) + '&t=' + Date.now();
        window.__vsCurrentPreviewPath = filePath;
        updateScopeSelectorUi();
        close();
        showToast(`Preview: ${title}`, 'success');
      } else {
        window.open('/_studio/api/router.php?_path=%2Fpreview&path=' + encodeURIComponent(filePath), '_blank');
      }
    });
  });
}

/**
 * Re-bind quick prompt button events after re-rendering empty chat.
 * innerHTML replacement destroys event listeners, so we re-attach.
 */
function bindQuickPromptButtons() {
  document.querySelectorAll('[data-quick-prompt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const promptInput = document.getElementById('prompt-input');
      if (promptInput) {
        promptInput.value = btn.dataset.quickPrompt;
        promptInput.dataset.actionType = btn.dataset.actionType || 'free_prompt';
        promptInput.focus();
        promptInput.setSelectionRange(0, promptInput.value.length);
        promptInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });
}

// ═══════════════════════════════════════════
//  Empty Chat State
// ═══════════════════════════════════════════

function renderEmptyChat() {
  const pages = store.get('pages') || [];
  const hasSite = pages.length > 0;
  const existingSlugs = new Set(pages.map(p => p.slug));

  // ───────────────────────────────────────────
  //  Action Catalog — organized by category
  // ───────────────────────────────────────────

  // Design Foundation — shown when no site exists yet
  const designFoundation = [
    { label: 'Apply a bold, modern design', prompt: 'Build my website with a bold, modern aesthetic — dark color scheme, sharp contrast, smooth scroll animations, geometric shapes, and premium typography. Make it feel cutting-edge and conversion-focused. Decide what pages and sections make sense based on my site name and tagline.', type: 'create_site' },
    { label: 'Go for soft glassmorphism', prompt: 'Create my website with a soft glassmorphism aesthetic — frosted-glass overlays, gentle gradients, airy whitespace, rounded cards, and a light pastel palette. Make it feel fresh and approachable. Decide what pages and sections make sense based on my site name and tagline.', type: 'create_site' },
    { label: 'Use a clean, editorial layout', prompt: 'Design my website with a clean editorial aesthetic — generous whitespace, refined serif typography, muted neutral palette, and striking large imagery. Think editorial magazine meets modern web. Decide what pages and sections make sense based on my site name and tagline.', type: 'create_site' },
    { label: 'Make it vibrant and colorful', prompt: 'Build my website with a vibrant, energetic aesthetic — bright accent colors, dynamic gradients, playful micro-interactions, and bold geometric shapes. Make it pop with personality. Decide what pages and sections make sense based on my site name and tagline.', type: 'create_site' },
    { label: 'Try a luxury dark aesthetic', prompt: 'Create my website with a luxurious dark aesthetic — deep backgrounds, gold or champagne accents, cinematic hero imagery, and polished typography. Think premium brand experience. Decide what pages and sections make sense based on my site name and tagline.', type: 'create_site' },
    { label: 'Build with warm, earthy tones', prompt: 'Design my website with warm, organic tones — terracotta, sage, cream, natural textures, and inviting warmth. Make it feel human and authentic. Decide what pages and sections make sense based on my site name and tagline.', type: 'create_site' },
    { label: 'Create a corporate look', prompt: 'Build my website with a professional corporate aesthetic — structured layouts, clean navigation, blue-based professional palette, and polished typography. Make it feel trustworthy and reliable. Decide what pages and sections make sense based on my site name and tagline.', type: 'create_site' },
    { label: 'Design a playful, creative site', prompt: 'Create my website with a fun, creative aesthetic — playful typography, bright colors, quirky layout choices, and personality-driven design. Make it memorable and unique. Decide what pages and sections make sense based on my site name and tagline.', type: 'create_site' },
    { label: 'Go for a tech startup vibe', prompt: 'Build my website with a cutting-edge tech aesthetic — gradients, glow effects, dark or deep backgrounds, and futuristic typography. Make it feel innovative and forward-thinking. Decide what pages and sections make sense based on my site name and tagline.', type: 'create_site' },
    { label: 'Use a retro, vintage style', prompt: 'Design my website with a retro-inspired aesthetic — vintage color palettes, textured backgrounds, nostalgic typography, and classic charm. Make it feel timeless. Decide what pages and sections make sense based on my site name and tagline.', type: 'create_site' },
  ];

  // Page Creation — add new pages to existing site
  const pageCreation = [
    { label: 'Create a Contact page', prompt: 'Create a compelling Contact page with the business address, phone number, email, and operating hours presented in an elegant layout. Add a warm, inviting introductory paragraph. Include a map embed placeholder and clear call-to-action. Do NOT include a contact form — keep it focused on direct contact information.', type: 'create_page' },
    { label: 'Create an About page', prompt: 'Create an engaging About page that tells the company story with warmth and authenticity. Include a mission statement section, a brief history or origin story, core values displayed in an attractive grid, and a team section placeholder. Use compelling copy that builds trust and connection.', type: 'create_page' },
    { label: 'Create a Services page', prompt: 'Create a professional Services page with a hero section introducing the offerings. Display 4-6 services in an attractive card grid, each with an icon, title, short description, and CTA. Include a "Why Choose Us" section with key differentiators and a final call-to-action section.', type: 'create_page' },
    { label: 'Create a Portfolio page', prompt: 'Create a visually stunning Portfolio or Work page with a filterable project gallery. Display projects as image cards with titles and categories. Include a hero section introducing the work, and a CTA at the bottom encouraging visitors to get in touch about their own project.', type: 'create_page' },
    { label: 'Create a Pricing page', prompt: 'Create a clear, conversion-focused Pricing page with 3 pricing tiers displayed as elegant cards. Include a popular/recommended tier highlight, feature comparison list, and clear CTAs. Add a FAQ section below the pricing cards addressing common questions about billing and plans.', type: 'create_page' },
    { label: 'Create a Blog page', prompt: 'Create a Blog or News index page with an attractive grid layout for articles. Include a featured post at the top with larger imagery, followed by a 2-3 column grid of recent posts. Each post card should show an image placeholder, title, date, excerpt, and a "Read more" link.', type: 'create_page' },
    { label: 'Create a FAQ page', prompt: 'Create a helpful FAQ page with an accordion-style layout. Include 8-10 common questions organized by category. Add a hero section with a search-themed headline, and a CTA at the bottom for visitors whose questions weren\'t answered. Use smooth expand/collapse animations.', type: 'create_page' },
    { label: 'Create a Testimonials page', prompt: 'Create a dedicated Testimonials page showcasing customer reviews. Display testimonials in an attractive card layout with star ratings, customer names, and company/role. Include a hero section and a CTA encouraging visitors to become the next success story.', type: 'create_page' },
    ...(existingSlugs.has('contact') ? [] : []),
  ].filter(a => {
    // Skip page suggestions that already exist
    const labelSlug = a.label.replace(/^Create (a |an )?/i, '').replace(/ page$/i, '').toLowerCase().replace(/\s+/g, '-');
    return !existingSlugs.has(labelSlug);
  });

  // Section & Enhancement — add elements to existing pages
  const enhancements = [
    { label: 'Add a hero section', prompt: 'Add a compelling hero section to the homepage with a bold headline, supporting subtext, a primary CTA button, and a background that matches the site\'s design language. Make it attention-grabbing and conversion-focused.', type: 'enhance' },
    { label: 'Add a call-to-action section', prompt: 'Add a strong call-to-action section to the homepage, positioned before the footer. Use a contrasting background color, a compelling headline, brief supporting text, and a prominent button. Make it impossible to scroll past without noticing.', type: 'enhance' },
    { label: 'Add a testimonial section', prompt: 'Add a testimonial section to the homepage displaying 3 customer quotes in an attractive card layout. Include star ratings, customer names with roles, and styled quotation marks. Make it feel genuine and trustworthy.', type: 'enhance' },
    { label: 'Add a features section', prompt: 'Add a features or benefits section to the homepage with 4-6 items displayed in a grid. Each feature should have an icon, title, and short description. Use the site\'s existing design language and color palette.', type: 'enhance' },
    { label: 'Add a team section', prompt: 'Add a team section to the about page (or homepage if no about page exists) showing 3-4 team members in a card grid. Include image placeholders, names, roles, and short bios. Style it to match the existing design.', type: 'enhance' },
    { label: 'Add a statistics section', prompt: 'Add an impressive statistics/numbers section to the homepage with 3-4 large animated counters. Include metrics like "10+ Years Experience", "500+ Clients Served", "50+ Projects Completed". Use bold typography and the accent color.', type: 'enhance' },
    { label: 'Add a newsletter signup', prompt: 'Add a newsletter signup section with an email input field and subscribe button. Include a compelling headline like "Stay in the loop" and a brief privacy note. Style it as an attractive banner that fits the site\'s design.', type: 'enhance' },
    { label: 'Add a client logos bar', prompt: 'Add a trusted-by/client logos section to the homepage. Create 5-6 placeholder logo areas in a horizontal row with subtle grayscale styling. Include a small heading like "Trusted by" or "Our Partners". Keep it minimal and professional.', type: 'enhance' },
  ];

  // Content Quality — improve existing content
  const contentActions = [
    { label: 'Rewrite all page copy', prompt: 'Review and rewrite all text content across the website to be more engaging, professional, and conversion-focused. Improve headlines to be more compelling, tighten body copy, and ensure consistent tone of voice throughout. Keep the existing structure and design intact.', type: 'enhance' },
    { label: 'Add engaging microcopy', prompt: 'Enhance the website with thoughtful microcopy throughout — improve button labels to be action-oriented (e.g., "Get Started" instead of "Submit"), add helpful placeholder text in forms, and add subtle contextual helper text. Make every word earn its place.', type: 'enhance' },
    { label: 'Improve page headings', prompt: 'Review and improve all page headings and subheadings across the website. Make them more compelling, benefit-focused, and emotionally engaging. Replace generic headlines like "Our Services" with specific value propositions like "Solutions That Drive Growth".', type: 'enhance' },
    { label: 'Add detailed service descriptions', prompt: 'Expand the services section with detailed, persuasive descriptions for each service. Include the problem each service solves, key benefits, and a subtle CTA. Write in a tone that demonstrates expertise while remaining accessible.', type: 'enhance' },
  ];

  // Conversion & Trust — optimize for business results
  const conversionActions = [
    { label: 'Add a contact form', prompt: 'Add a well-designed contact form with fields for name, email, phone (optional), and message. Include validation styling, a clear submit button, and a brief privacy statement. Place it prominently on the contact page or add a new contact section.', type: 'enhance' },
    { label: 'Add social proof elements', prompt: 'Add social proof elements across the website — star ratings near CTAs, a "trusted by X+ customers" badge in the hero, review snippets in strategic locations, and certification or award logos. Make visitors feel confident choosing this business.', type: 'enhance' },
    { label: 'Improve navigation flow', prompt: 'Review and optimize the website navigation for better user flow. Ensure the nav menu is clear and logically ordered, add breadcrumbs where helpful, improve mobile navigation, and ensure every page has clear next-step CTAs. Make it effortless to find information.', type: 'enhance' },
    { label: 'Add a sticky header CTA', prompt: 'Add a subtle, persistent call-to-action button in the header/navigation that stays visible while scrolling. Use the accent color and action-oriented text like "Get a Quote" or "Book Now". Make it noticeable but not intrusive.', type: 'enhance' },
  ];

  // Trust & Authority — build credibility
  const trustActions = [
    { label: 'Add a process/how-it-works', prompt: 'Add a "How It Works" section to the homepage with 3-4 numbered steps explaining the process of working together. Use icons, clear titles, and brief descriptions. Include connecting lines or arrows between steps for visual flow.', type: 'enhance' },
    { label: 'Add a guarantee section', prompt: 'Add a trust-building guarantee or promise section with an appropriate icon (shield, checkmark), a bold guarantee statement, and supporting details. Position it near a CTA to reduce purchase anxiety. Style it to stand out without being gaudy.', type: 'enhance' },
    { label: 'Add an awards section', prompt: 'Add a professional awards, certifications, or credentials section. Display 3-5 achievement badges or logos in a clean horizontal layout with a subtle heading. This builds authority and trust with visitors.', type: 'enhance' },
    { label: 'Add a comparison table', prompt: 'Add a "Why Choose Us" comparison table showing how this business compares to alternatives. Use checkmarks and X marks, highlight the business column, and include 5-7 comparison points. Make the choice feel obvious.', type: 'enhance' },
  ];

  // Visual Polish — refine the design
  const polishActions = [
    { label: 'Make the design more vibrant', prompt: 'Enhance the website\'s visual energy — increase color saturation, add subtle gradient accents, brighten CTA buttons, and introduce hover animations on interactive elements. Keep the same layout and structure, but make everything feel more alive and dynamic.', type: 'enhance' },
    { label: 'Make the design more premium', prompt: 'Elevate the website\'s perceived quality — refine typography with better font sizing and spacing, add subtle shadows and depth, use more refined color transitions, and polish all micro-interactions. Make every detail feel intentional and high-end.', type: 'enhance' },
    { label: 'Improve mobile responsiveness', prompt: 'Review and enhance the mobile experience across all pages. Ensure text is readable without zooming, tap targets are appropriately sized, images scale correctly, navigation is thumb-friendly, and spacing works on small screens. Test at 375px width.', type: 'enhance' },
    { label: 'Add hover animations', prompt: 'Add polished hover animations throughout the website — subtle lift effects on cards, smooth color transitions on buttons, image zoom on gallery items, and underline animations on links. Keep animations under 300ms and use appropriate easing functions. Subtle is key.', type: 'enhance' },
    { label: 'Refine the color palette', prompt: 'Analyze and refine the current color palette for better harmony and contrast. Ensure sufficient contrast ratios for accessibility, unify accent usage, add complementary shades for depth, and ensure colors work well together across all sections.', type: 'enhance' },
    { label: 'Improve typography', prompt: 'Refine the typography across all pages — establish clear heading hierarchy, improve line heights and letter spacing, choose more distinctive font pairings, and ensure consistent sizing. Make the type system feel professional and intentional.', type: 'enhance' },
    { label: 'Add smooth scroll effects', prompt: 'Add subtle scroll-triggered animations throughout the website — fade-in-up effects for content sections, staggered reveals for card grids, and parallax-lite effects on hero backgrounds. Keep animations tasteful and performant. Use CSS transitions and Intersection Observer.', type: 'enhance' },
    { label: 'Add a dark mode toggle', prompt: 'Add a dark/light mode toggle to the website header. Implement a full dark color scheme with appropriate backgrounds, text colors, and adjusted shadows. Save the user\'s preference in localStorage. Ensure all sections look great in both modes.', type: 'enhance' },
  ];

  // Redesign — major visual changes
  const redesignActions = [
    { label: 'Switch to a dark theme', prompt: 'Transform the entire website to a sophisticated dark theme. Use deep backgrounds (#0a0a0a to #1a1a1a range), light text, adjusted image treatments, and refined shadows that work on dark surfaces. Keep the same structure and content but make everything feel cinematic and premium.', type: 'enhance' },
    { label: 'Switch to a light theme', prompt: 'Transform the entire website to a clean, bright light theme. Use white and light gray backgrounds, dark text, airy whitespace, and subtle shadows. Keep the same structure and content but make everything feel fresh, open, and approachable.', type: 'enhance' },
    { label: 'Redesign with glassmorphism', prompt: 'Redesign the website using glassmorphism design language — frosted glass cards, translucent overlays, soft blurred backgrounds, and subtle border highlights. Keep the existing content and layout structure but give every element the glass treatment.', type: 'enhance' },
    { label: 'Make it more minimalist', prompt: 'Simplify the website\'s design — increase whitespace, reduce decorative elements, use a more restrained color palette (2-3 colors max), and strip away anything that doesn\'t serve a purpose. Less is more. Keep all content but let it breathe.', type: 'enhance' },
  ];

  // ───────────────────────────────────────────
  //  Select and shuffle actions based on state
  // ───────────────────────────────────────────

  let selectedActions;
  let heading, description;

  if (!hasSite) {
    // No site yet — show design foundation actions
    heading = 'What are we building?';
    description = 'Describe your website and watch it appear in the preview. Every detail is a conversation away.';
    selectedActions = shuffleArray(designFoundation).slice(0, 6);
  } else {
    // Site exists — show a mix of enhancement actions
    heading = 'What\u2019s next?';
    description = 'Your site is live in preview. Pick a suggestion or describe any change you want.';

    // Build a weighted pool: page creation first, then enhancements, then polish
    const pool = [
      ...pageCreation,
      ...pageCreation,      // 2x weight for page creation (most impactful)
      ...enhancements,
      ...contentActions,
      ...conversionActions,
      ...trustActions,
      ...polishActions,
      ...redesignActions,
    ];

    selectedActions = shuffleArray(pool).slice(0, 6);

    // Deduplicate by label in case the 2x weighting picked the same one twice
    const seen = new Set();
    selectedActions = selectedActions.filter(a => {
      if (seen.has(a.label)) return false;
      seen.add(a.label);
      return true;
    });

    // If dedup removed some, refill from the pool
    if (selectedActions.length < 6) {
      const extras = shuffleArray(pool).filter(a => !seen.has(a.label));
      for (const a of extras) {
        if (selectedActions.length >= 6) break;
        selectedActions.push(a);
        seen.add(a.label);
      }
    }
  }

  const cardsHtml = selectedActions.map(a => {
    const escapedPrompt = escapeHtml(a.prompt).replace(/"/g, '&quot;');
    return `<button data-quick-prompt="${escapedPrompt}" data-action-type="${a.type}"
      class="vs-style-card">${escapeHtml(a.label)}</button>`;
  }).join('\n        ');

  return `
    <div class="vs-empty-state">
      <div class="vs-empty-icon vs-animate-in vs-stagger-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path class="voxel-top" style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
          <path class="voxel-left" style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
          <path class="voxel-right" style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
        </svg>
      </div>
      <h2 class="vs-empty-title vs-animate-in vs-stagger-2">${heading}</h2>
      <p class="vs-empty-description vs-animate-in vs-stagger-3">
        ${description}
      </p>
      <div class="vs-style-grid vs-animate-in vs-stagger-4">
        ${cardsHtml}
      </div>
    </div>
  `;
}

/**
 * Fisher-Yates shuffle — returns a new shuffled copy.
 */
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ═══════════════════════════════════════════
//  Status Bar (36px)
// ═══════════════════════════════════════════

function renderStatusBar() {
  return `
    <footer class="vs-statusbar">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-vs-success" title="Connected"></span>
          <span id="status-text" class="text-xs text-vs-text-ghost">Ready</span>
        </div>
        <button id="btn-undo-status" class="vs-btn vs-btn-ghost vs-btn-xs" title="Undo (⌘Z)">
          ${icons.undo} Undo
        </button>
        <button id="btn-redo-status" class="vs-btn vs-btn-ghost vs-btn-xs" title="Redo (⌘⇧Z)">
          ${icons.redo} Redo
        </button>
        <button id="btn-preview-site" class="vs-btn vs-btn-ghost vs-btn-xs">
          ${icons.externalLink} Preview
        </button>
        <button id="btn-snapshot" class="vs-btn vs-btn-ghost vs-btn-xs">
          ${icons.camera} Snapshot
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-download" class="vs-btn vs-btn-ghost vs-btn-xs" title="Download your website">
          ${icons.download} Download
        </button>
        <span id="publish-state-label" class="text-2xs text-vs-text-ghost">Checking changes...</span>
        <div class="vs-publish-split">
          <button id="btn-publish"
            class="vs-btn vs-btn-primary vs-btn-xs vs-publish-main">
            ${icons.publish} Publish
          </button>
          <button id="btn-publish-menu"
            class="vs-btn vs-btn-primary vs-btn-xs vs-publish-chevron"
            title="More publish options">
            ${icons.chevronUp}
          </button>
        </div>
      </div>
    </footer>
  `;
}

// ═══════════════════════════════════════════
//  Prompt Library
// ═══════════════════════════════════════════

function renderCommandPalette() {
  return `
    <div id="command-palette" class="hidden fixed inset-0 z-[120]">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]" data-command-overlay></div>
      <div class="absolute left-1/2 top-[12vh] w-[min(680px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-vs-border-subtle bg-vs-bg-surface shadow-2xl overflow-hidden">
        <div class="px-3 py-3">
          <input id="command-palette-input" type="text" autocomplete="off"
            class="w-full text-sm text-vs-text-primary placeholder:text-vs-text-ghost focus:outline-none"
            style="background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); border-radius: 10px; padding: 10px 14px; transition: border-color 0.15s;"
            onfocus="this.style.borderColor='var(--vs-accent)'"
            onblur="this.style.borderColor='var(--vs-border-subtle)'"
            placeholder="Search prompts...">
        </div>
        <div id="command-palette-results" class="max-h-[56vh] overflow-y-auto p-2">
          <div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>
        </div>
        <div class="px-4 py-2 border-t border-vs-border-subtle text-[11px] text-vs-text-ghost flex items-center justify-between">
          <span>↑ ↓ move</span>
          <span>Enter insert</span>
          <span>⌘P pin</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  `;
}

function getPaletteCommands() {
  const p = (id, title, group, keywords, prompt) => ({
    id, title, meta: group, group, shortcut: '', keywords, prompt,
    run: () => insertPromptIntoChat(prompt),
  });

  return [
    // ── Getting Started ──
    p('gs-build-site', 'Build a complete website', 'Getting Started', 'create site business launch', 'Create a complete high-conversion website for my business with Home, About, Services, and Contact pages. Write all content based on my business info.'),
    p('gs-redesign', 'Redesign the entire site', 'Getting Started', 'redesign restyle brand refresh', 'Redesign the entire website with a premium modern visual style. Update colors, typography, spacing, and section rhythm across all pages.'),
    p('gs-write-content', 'Write all page content', 'Getting Started', 'content copy text write', 'Write compelling, professional content for every page on the site. Use my business info and target audience to guide the tone.'),

    // ── Pages ──
    p('pg-add', 'Add a new page', 'Pages', 'page add new create', 'Add a new page called [Page Name] and include it in the navigation.'),
    p('pg-about', 'Create About page', 'Pages', 'about us story team', 'Create a compelling About page with our story, mission, values, and a team section.'),
    p('pg-services', 'Create Services page', 'Pages', 'services offerings', 'Create a Services page showcasing the services we offer with cards, icons, descriptions, and CTAs.'),
    p('pg-pricing', 'Create Pricing page', 'Pages', 'pricing plans cost', 'Create a Pricing page with [number] tiers, a comparison table, feature lists, and a FAQ section.'),
    p('pg-portfolio', 'Create Portfolio page', 'Pages', 'portfolio work projects gallery', 'Create a Portfolio page with a filterable grid showing our best projects with images and descriptions.'),
    p('pg-blog', 'Create Blog listing page', 'Pages', 'blog articles posts news', 'Create a Blog page with card-based article listing, categories, dates, and a sidebar.'),
    p('pg-faq', 'Create FAQ page', 'Pages', 'faq questions answers', 'Create a FAQ page with accordion-style questions organized by category. Include at least 10 questions.'),
    p('pg-testimonials', 'Create Testimonials page', 'Pages', 'testimonials reviews proof', 'Create a Testimonials page with customer reviews in card layout with names, roles, and star ratings.'),
    p('pg-careers', 'Create Careers page', 'Pages', 'careers jobs hiring', 'Create a Careers page with open positions, company culture section, and benefits overview.'),
    p('pg-events', 'Create Events page', 'Pages', 'events calendar schedule', 'Create an Events page listing upcoming events with dates, locations, and registration links.'),
    p('pg-gallery', 'Create Photo Gallery page', 'Pages', 'gallery photos lightbox', 'Create a Photo Gallery page with a responsive image grid and lightbox effect.'),
    p('pg-404', 'Create custom 404 page', 'Pages', '404 not found error', 'Create a custom 404 error page with a friendly message and links back to key pages.'),
    p('pg-landing', 'Create landing page', 'Pages', 'landing campaign conversion', 'Create a high-conversion landing page for [product/campaign] with hero, benefits, social proof, and CTA.'),
    p('pg-privacy', 'Create Privacy Policy', 'Pages', 'privacy policy legal gdpr', 'Create a Privacy Policy page covering data collection, cookies, and user rights.'),
    p('pg-terms', 'Create Terms of Service', 'Pages', 'terms service legal', 'Create a Terms of Service page covering usage terms, disclaimers, and liability.'),
    p('pg-rename', 'Rename a page', 'Pages', 'rename page title slug', 'Rename the [old page name] page to [new page name] and update all navigation links.'),
    p('pg-delete', 'Delete a page', 'Pages', 'delete remove page', 'Delete the [page name] page and remove it from the navigation.'),

    // ── Navigation & Layout ──
    p('nav-update', 'Update navigation menu', 'Navigation & Layout', 'nav menu links order', 'Update the navigation menu to include these links in this order: [Home, About, Services, Contact].'),
    p('nav-dropdown', 'Add dropdown to navigation', 'Navigation & Layout', 'dropdown submenu nested', 'Add a dropdown menu under [Menu Item] with sub-links: [Sub-link 1, Sub-link 2, Sub-link 3].'),
    p('nav-cta', 'Add CTA button to nav', 'Navigation & Layout', 'cta button nav header', 'Add a prominent CTA button to the navigation that says "[Button Text]" and links to [page].'),
    p('nav-sticky', 'Make header sticky', 'Navigation & Layout', 'sticky fixed header', 'Make the header navigation sticky so it stays visible when scrolling.'),
    p('nav-topbar', 'Add announcement bar', 'Navigation & Layout', 'announcement bar banner', 'Add a slim announcement bar above the navigation: "[Your announcement text]".'),
    p('ft-update', 'Update the footer', 'Navigation & Layout', 'footer links columns', 'Update the footer with columns for Quick Links, Services, Contact Info, and Social Media.'),
    p('ft-newsletter', 'Add newsletter to footer', 'Navigation & Layout', 'newsletter subscribe footer', 'Add a newsletter email signup form to the footer.'),

    // ── Content Blocks ──
    p('blk-hero', 'Add hero section', 'Content Blocks', 'hero banner headline', 'Add a hero section to [page name] with a bold headline, supporting text, and a CTA button.'),
    p('blk-cta', 'Add call-to-action section', 'Content Blocks', 'cta call action', 'Add a CTA section to [page name] with headline, description, and button linking to [destination].'),
    p('blk-team', 'Add team section', 'Content Blocks', 'team members staff', 'Add a team section with photo cards for each member showing name, role, and bio.'),
    p('blk-features', 'Add features grid', 'Content Blocks', 'features benefits cards icons', 'Add a features section with [number] cards using icons, headings, and descriptions.'),
    p('blk-stats', 'Add statistics section', 'Content Blocks', 'stats numbers counter', 'Add a stats section showing: [years in business], [happy clients], [projects completed].'),
    p('blk-testimonials', 'Add testimonials section', 'Content Blocks', 'testimonials reviews quotes', 'Add a testimonials section with customer review cards including quotes and names.'),
    p('blk-logos', 'Add client/partner logos', 'Content Blocks', 'logos clients partners trust', 'Add a trusted-by logo strip showing our client or partner logos.'),
    p('blk-timeline', 'Add timeline section', 'Content Blocks', 'timeline history milestones', 'Add a visual timeline section showing our company milestones.'),
    p('blk-process', 'Add how-it-works section', 'Content Blocks', 'process steps how works', 'Add a "How It Works" section with [number] numbered steps explaining our process.'),
    p('blk-map', 'Add map section', 'Content Blocks', 'map location embed', 'Add an embedded map section showing our location at [address].'),
    p('blk-video', 'Add video section', 'Content Blocks', 'video youtube embed', 'Add a video section to [page name] with embedded video from [URL].'),
    p('blk-accordion', 'Add accordion/FAQ section', 'Content Blocks', 'accordion faq expand collapse', 'Add an accordion FAQ section to [page name] with questions: [Q1, Q2, Q3].'),
    p('blk-banner', 'Add promotional banner', 'Content Blocks', 'banner promo offer', 'Add a promotional banner highlighting: [your offer or promotion].'),
    p('blk-comparison', 'Add comparison table', 'Content Blocks', 'comparison table versus', 'Add a comparison table comparing [Plan A] vs [Plan B] vs [Plan C].'),

    // ── Design & Styling ──
    p('ds-colors', 'Change brand colors', 'Design & Styling', 'colors palette brand', 'Change the brand colors to [primary] and [accent]. Update all buttons, headings, and accents.'),
    p('ds-fonts', 'Change fonts', 'Design & Styling', 'fonts typography', 'Change fonts to [heading font] for headings and [body font] for body text.'),
    p('ds-dark', 'Add dark mode style', 'Design & Styling', 'dark mode night', 'Redesign with a dark mode aesthetic — dark backgrounds, light text, accent colors.'),
    p('ds-light', 'Make design light and clean', 'Design & Styling', 'light clean minimal', 'Make the design lighter and cleaner with whitespace, subtle shadows, minimal aesthetic.'),
    p('ds-bold', 'Make design bold and vibrant', 'Design & Styling', 'bold vibrant colorful', 'Make the design more bold with stronger colors, larger headings, more visual impact.'),
    p('ds-spacing', 'Improve section spacing', 'Design & Styling', 'spacing rhythm padding', 'Improve vertical rhythm and spacing between sections. Add more breathing room.'),
    p('ds-buttons', 'Restyle all buttons', 'Design & Styling', 'buttons style rounded', 'Restyle all buttons to have [rounded/pill/square] corners with [hover effect].'),
    p('ds-animations', 'Add scroll animations', 'Design & Styling', 'animations scroll fade reveal', 'Add subtle scroll-reveal animations so content fades in as the user scrolls.'),

    // ── Forms ──
    p('fm-contact', 'Add contact form', 'Forms', 'contact form email', 'Add a contact form with Name, Email, Phone, Subject, and Message fields with validation.'),
    p('fm-booking', 'Add booking form', 'Forms', 'booking appointment', 'Add a booking form with Name, Email, Phone, Preferred Date, Time, and Notes.'),
    p('fm-quote', 'Add quote request form', 'Forms', 'quote estimate request', 'Add a "Get a Quote" form with Name, Email, Service Needed, Budget, and Details.'),
    p('fm-newsletter', 'Add newsletter signup', 'Forms', 'newsletter subscribe', 'Add a newsletter signup form with email field and "Subscribe" button.'),
    p('fm-feedback', 'Add feedback form', 'Forms', 'feedback survey', 'Add a feedback form with Name, Email, Rating (1-5), and Comments.'),
    p('fm-application', 'Add job application form', 'Forms', 'application job career', 'Add a job application form with Name, Email, Position, Experience, and message.'),
    p('fm-rsvp', 'Add RSVP form', 'Forms', 'rsvp event register', 'Add an RSVP form for [event name] with Name, Email, Number of Guests, and Dietary needs.'),
    p('fm-edit', 'Edit existing form', 'Forms', 'edit form update', 'Update the [form name] form: [describe your changes].'),

    // ── SEO & Discovery ──
    p('seo-meta', 'Optimize page meta tags', 'SEO & Discovery', 'seo meta title description', 'Optimize meta title and description for every page. Make them compelling and keyword-rich.'),
    p('seo-headings', 'Fix heading hierarchy', 'SEO & Discovery', 'headings h1 h2 hierarchy', 'Ensure every page has one H1 with properly nested H2 and H3 headings.'),
    p('seo-alt', 'Add image alt text', 'SEO & Discovery', 'alt text images accessibility', 'Add descriptive alt text to all images for SEO and accessibility.'),
    p('seo-schema', 'Improve schema markup', 'SEO & Discovery', 'schema structured data', 'Improve schema.org structured data to include LocalBusiness, BreadcrumbList, and FAQPage.'),

    // ── Images & Media ──
    p('img-hero', 'Change hero image', 'Images & Media', 'hero image background', 'Replace the hero image on [page name] with [describe the image].'),
    p('img-gallery', 'Add image gallery', 'Images & Media', 'gallery photos grid', 'Add an image gallery to [page name] with [number] images in a responsive grid.'),
    p('img-favicon', 'Update favicon', 'Images & Media', 'favicon icon tab', 'Update the website favicon to match our brand.'),
    p('img-logo', 'Update logo', 'Images & Media', 'logo brand header', 'Update the website logo. [Describe your logo or instructions].'),

    // ── Business Memory ──
    p('mem-phone', 'Set phone number', 'Business Memory', 'phone number telephone', 'Our phone number is [insert phone number].'),
    p('mem-email', 'Set email address', 'Business Memory', 'email contact address', 'Our email address is [insert email address].'),
    p('mem-address', 'Set business address', 'Business Memory', 'address location office', 'Our business address is [insert full address].'),
    p('mem-hours', 'Set business hours', 'Business Memory', 'hours opening times', 'Our business hours are: [Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed].'),
    p('mem-name', 'Set business name', 'Business Memory', 'business name company', 'Our business name is [insert business name].'),
    p('mem-tagline', 'Set tagline/slogan', 'Business Memory', 'tagline slogan motto', 'Our tagline is: "[insert tagline]".'),
    p('mem-about', 'Set business description', 'Business Memory', 'about description', 'We are a [type of business] that [what you do]. We serve [audience] and specialize in [specialties].'),
    p('mem-founded', 'Set founding year', 'Business Memory', 'founded year established', 'Our company was founded in [year].'),
    p('mem-team', 'Add team member info', 'Business Memory', 'team member person', '[Name] is our [role/title]. [Short bio].'),
    p('mem-service', 'Add a service we offer', 'Business Memory', 'service offering product', 'We offer [service name]: [description, pricing].'),
    p('mem-usp', 'Set unique selling points', 'Business Memory', 'usp unique value differentiator', 'Our key differentiators are: [1. ..., 2. ..., 3. ...].'),

    // ── Social & Contact ──
    p('soc-twitter', 'Set Twitter/X profile', 'Social & Contact', 'twitter x social', 'Our Twitter/X is [x.com/handle].'),
    p('soc-facebook', 'Set Facebook page', 'Social & Contact', 'facebook social', 'Our Facebook page is [facebook.com/page].'),
    p('soc-instagram', 'Set Instagram profile', 'Social & Contact', 'instagram social', 'Our Instagram is [instagram.com/handle].'),
    p('soc-linkedin', 'Set LinkedIn page', 'Social & Contact', 'linkedin professional', 'Our LinkedIn is [linkedin.com/company/name].'),
    p('soc-youtube', 'Set YouTube channel', 'Social & Contact', 'youtube video channel', 'Our YouTube channel is [youtube.com/@channel].'),
    p('soc-tiktok', 'Set TikTok profile', 'Social & Contact', 'tiktok social video', 'Our TikTok is [tiktok.com/@handle].'),
    p('soc-whatsapp', 'Set WhatsApp number', 'Social & Contact', 'whatsapp chat message', 'Our WhatsApp number is [insert number].'),
    p('soc-add-links', 'Add social links to site', 'Social & Contact', 'social links footer icons', 'Add social media icon links to the footer for all our profiles.'),

    // ── E-Commerce & CTA ──
    p('cta-buy', 'Add buy/order button', 'E-Commerce & CTA', 'buy order purchase', 'Add a prominent "Order Now" button that links to [URL].'),
    p('cta-phone', 'Add click-to-call button', 'E-Commerce & CTA', 'phone call click', 'Add a "Call Us" button that opens a phone call.'),
    p('cta-whatsapp', 'Add WhatsApp chat button', 'E-Commerce & CTA', 'whatsapp floating', 'Add a floating WhatsApp chat button in the bottom-right corner.'),
    p('cta-trial', 'Add free trial CTA', 'E-Commerce & CTA', 'free trial signup', 'Add a "Start Free Trial" section with headline, benefits, and signup button.'),
    p('cta-download', 'Add download CTA', 'E-Commerce & CTA', 'download pdf brochure', 'Add a download section for our [brochure/resource] with description and button.'),

    // ── Maintenance ──
    p('mt-copyright', 'Update copyright year', 'Maintenance', 'copyright year footer', 'Update the copyright year in the footer to the current year.'),
    p('mt-fix-links', 'Fix broken links', 'Maintenance', 'broken links fix', 'Check all links and fix any broken or dead links.'),
    p('mt-update', 'Update page content', 'Maintenance', 'update change text', 'On the [page name] page, change "[old text]" to "[new text]".'),
    p('mt-remove', 'Remove a section', 'Maintenance', 'remove delete section', 'Remove the [section name] section from the [page name] page.'),
    p('mt-reorder', 'Reorder page sections', 'Maintenance', 'reorder move arrange', 'On [page name], reorder sections to: [Section 1, Section 2, Section 3].'),

    // ── Advanced ──
    p('adv-cookie', 'Add cookie consent banner', 'Advanced', 'cookie consent gdpr', 'Add a GDPR-compliant cookie consent banner with Accept and Decline options.'),
    p('adv-analytics', 'Add analytics tracking', 'Advanced', 'analytics google tracking', 'Add Google Analytics with measurement ID: [G-XXXXXXX].'),
    p('adv-custom-css', 'Add custom CSS', 'Advanced', 'custom css style', 'Add this custom CSS: [paste your CSS].'),
    p('adv-custom-js', 'Add custom JavaScript', 'Advanced', 'custom javascript code', 'Add this JavaScript snippet: [paste your code].'),
    p('adv-accessibility', 'Improve accessibility', 'Advanced', 'accessibility a11y wcag', 'Improve accessibility: add ARIA labels, ensure contrast ratios, make elements keyboard-navigable.'),
  ];
}



function getLocalArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function setLocalArray(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

function getPinnedCommandIds() {
  return getLocalArray(COMMAND_PINS_KEY);
}

function getRecentCommandIds() {
  return getLocalArray(COMMAND_RECENTS_KEY);
}

function togglePinnedCommand(commandId) {
  const current = getPinnedCommandIds();
  const next = current.includes(commandId)
    ? current.filter((id) => id !== commandId)
    : [...current, commandId];

  setLocalArray(COMMAND_PINS_KEY, next);

  const state = window.__vsCommandPalette || { query: '', activeIndex: 0 };
  renderCommandPaletteResults(state.query || '', state.activeIndex || 0);
}

function rememberRecentCommand(commandId) {
  const current = getRecentCommandIds().filter((id) => id !== commandId);
  const next = [commandId, ...current].slice(0, 8);
  setLocalArray(COMMAND_RECENTS_KEY, next);
}

function insertPromptIntoChat(prompt) {
  if (store.get('route') !== 'chat') {
    router.navigate('chat');
    setTimeout(() => insertPromptIntoChat(prompt), 80);
    return;
  }

  const input = document.getElementById('prompt-input');
  if (!input) return;

  input.value = prompt;
  input.focus();
  input.setSelectionRange(0, input.value.length);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function queuePromptAction(prompt, actionType = 'free_prompt', autoSend = false) {
  if (store.get('route') !== 'chat') {
    router.navigate('chat');
    setTimeout(() => queuePromptAction(prompt, actionType, autoSend), 80);
    return;
  }

  const input = document.getElementById('prompt-input');
  if (!input) return;

  input.value = prompt;
  input.dataset.actionType = actionType;
  if (autoSend) {
    handleSend();
  } else {
    input.focus();
    input.setSelectionRange(0, input.value.length);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function isCommandPaletteOpen() {
  const palette = document.getElementById('command-palette');
  return !!palette && !palette.classList.contains('hidden');
}

function openCommandPalette(initialQuery = '') {
  const palette = document.getElementById('command-palette');
  const input = document.getElementById('command-palette-input');
  if (!palette || !input) return;

  palette.classList.remove('hidden');
  input.value = initialQuery;
  input.focus();
  input.select();
  renderCommandPaletteResults(initialQuery, 0);
}

function closeCommandPalette() {
  const palette = document.getElementById('command-palette');
  if (!palette) return;
  palette.classList.add('hidden');
}

function scoreSubsequence(query, source) {
  let qIndex = 0;
  let score = 0;
  let streak = 0;

  for (let i = 0; i < source.length && qIndex < query.length; i++) {
    if (source[i] === query[qIndex]) {
      score += i;
      streak += 1;
      score -= Math.min(6, streak);
      qIndex += 1;
    } else {
      streak = 0;
    }
  }

  if (qIndex < query.length) return null;
  return score;
}

function scoreCommandMatch(query, command) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return 0;

  const text = `${command.title} ${command.meta} ${command.group} ${command.keywords}`.toLowerCase();
  if (text.startsWith(q)) return 1;

  const index = text.indexOf(q);
  if (index >= 0) return 20 + index;

  const subsequenceScore = scoreSubsequence(q, text);
  if (subsequenceScore === null) return null;

  return 70 + subsequenceScore;
}

function getFilteredPaletteCommands(query) {
  const q = (query || '').trim().toLowerCase();
  const commands = getPaletteCommands();
  const pinnedIds = getPinnedCommandIds();
  const recentIds = getRecentCommandIds();

  return commands
    .map((cmd) => {
      const score = scoreCommandMatch(q, cmd);
      if (score === null) return null;
      const pinBoost = pinnedIds.includes(cmd.id) ? -12 : 0;
      const recentBoost = recentIds.includes(cmd.id) ? -8 : 0;
      return { ...cmd, __score: score + pinBoost + recentBoost };
    })
    .filter(Boolean)
    .sort((a, b) => a.__score - b.__score || a.title.localeCompare(b.title));
}

function buildPaletteSections(query) {
  const commands = getPaletteCommands();
  const byId = Object.fromEntries(commands.map((cmd) => [cmd.id, cmd]));
  const q = (query || '').trim();
  const sections = [];

  if (q !== '') {
    const filtered = getFilteredPaletteCommands(query).slice(0, 18);
    if (filtered.length > 0) {
      sections.push({ title: 'Results', commands: filtered });
    }
    return sections;
  }

  const recentIds = getRecentCommandIds();
  const pinnedIds = getPinnedCommandIds();
  const usedIds = new Set();

  const recentCommands = recentIds
    .map((id) => byId[id])
    .filter(Boolean);
  if (recentCommands.length > 0) {
    sections.push({ title: 'Recent', commands: recentCommands });
    recentCommands.forEach((cmd) => usedIds.add(cmd.id));
  }

  const pinnedCommands = pinnedIds
    .map((id) => byId[id])
    .filter((cmd) => cmd && !usedIds.has(cmd.id));
  if (pinnedCommands.length > 0) {
    sections.push({ title: 'Pinned', commands: pinnedCommands });
    pinnedCommands.forEach((cmd) => usedIds.add(cmd.id));
  }

  const groupOrder = ['Getting Started', 'Pages', 'Navigation & Layout', 'Content Blocks', 'Design & Styling', 'Forms', 'SEO & Discovery', 'Images & Media', 'Business Memory', 'Social & Contact', 'E-Commerce & CTA', 'Maintenance', 'Advanced'];
  groupOrder.forEach((group) => {
    const grouped = commands.filter((cmd) => cmd.group === group && !usedIds.has(cmd.id));
    if (grouped.length > 0) {
      sections.push({ title: group, commands: grouped });
      grouped.forEach((cmd) => usedIds.add(cmd.id));
    }
  });

  return sections;
}

function renderCommandPaletteResults(query, activeIndex = 0) {
  const container = document.getElementById('command-palette-results');
  if (!container) return;

  const sections = buildPaletteSections(query);
  const flatCommands = sections.flatMap((section) => section.commands);
  const boundedIndex = Math.max(0, Math.min(activeIndex, Math.max(0, flatCommands.length - 1)));
  const pinnedIds = getPinnedCommandIds();

  window.__vsCommandPalette = {
    commands: flatCommands,
    activeIndex: boundedIndex,
    query,
  };

  if (!flatCommands.length) {
    container.innerHTML = `<div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>`;
    return;
  }

  let html = '';
  let globalIndex = 0;

  sections.forEach((section) => {
    html += `<div class="px-2 pt-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-vs-text-ghost">${escapeHtml(section.title)}</div>`;
    section.commands.forEach((cmd) => {
      const isActive = globalIndex === boundedIndex;
      const isPinned = pinnedIds.includes(cmd.id);
      html += `
        <div class="flex items-center gap-1 px-1 py-0.5">
          <button type="button"
            data-command-index="${globalIndex}"
            class="vs-cmd-item ${isActive ? 'vs-cmd-item-active' : ''}">
            <div class="min-w-0">
              <div class="vs-cmd-item-title">${escapeHtml(cmd.title)}</div>
              <div class="vs-cmd-item-desc">${escapeHtml(cmd.prompt ? cmd.prompt.substring(0, 80) + (cmd.prompt.length > 80 ? '…' : '') : cmd.meta)}</div>
            </div>
          </button>
          <button type="button"
            data-command-pin="${escapeHtml(cmd.id)}"
            class="vs-cmd-pin ${isPinned ? 'vs-cmd-pin-active' : ''}"
            title="${isPinned ? 'Unpin' : 'Pin'}">
            ${isPinned ? '★' : '☆'}
          </button>
        </div>
      `;
      globalIndex += 1;
    });
  });

  container.innerHTML = html;

  container.querySelectorAll('[data-command-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.commandIndex || '0', 10);
      runCommandPaletteSelection(index);
    });
  });

  container.querySelectorAll('[data-command-pin]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const commandId = btn.dataset.commandPin;
      if (!commandId) return;
      togglePinnedCommand(commandId);
    });
  });
}

function runCommandPaletteSelection(index = null) {
  const state = window.__vsCommandPalette || { commands: [], activeIndex: 0 };
  const selectedIndex = index === null ? state.activeIndex : index;
  const command = state.commands[selectedIndex];
  if (!command) return;

  rememberRecentCommand(command.id);
  closeCommandPalette();
  Promise.resolve(command.run()).catch(() => {});
}

// ═══════════════════════════════════════════
//  Guided Onboarding
// ═══════════════════════════════════════════

function renderOnboardingModal() {
  return `
    <div id="onboarding-modal" class="hidden fixed inset-0 z-[130]">
      <div class="absolute inset-0 bg-black/45 backdrop-blur-[2px]" data-onboarding-overlay></div>
      <div class="absolute left-1/2 top-[8vh] w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-vs-border-subtle bg-vs-bg-surface shadow-2xl overflow-hidden">
        <div class="px-5 py-4 border-b border-vs-border-subtle flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-vs-text-secondary">Guided Website Setup</h2>
            <p id="onboarding-step-label" class="text-xs text-vs-text-ghost mt-0.5">Step 1 of 3</p>
          </div>
          <button id="btn-close-onboarding" class="vs-btn vs-btn-ghost vs-btn-xs">Close</button>
        </div>
        <div class="px-5 pt-3">
          <div id="onboarding-step-indicator" class="grid grid-cols-3 gap-2"></div>
        </div>
        <div id="onboarding-step-body" class="px-5 py-4 max-h-[54vh] overflow-y-auto"></div>
        <div class="px-5 py-4 border-t border-vs-border-subtle flex items-center justify-between">
          <button id="btn-onboarding-prev" class="vs-btn vs-btn-ghost vs-btn-sm">Back</button>
          <div class="flex items-center gap-2">
            <button id="btn-onboarding-next" class="vs-btn vs-btn-secondary vs-btn-sm">Next</button>
            <button id="btn-onboarding-generate" class="vs-btn vs-btn-primary vs-btn-sm hidden">Build Website</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function defaultOnboardingDraft() {
  return {
    business_name: '',
    business_type: '',
    offer: '',
    audience: '',
    style: 'modern-minimal',
    tone: 'confident',
    pages: ['home', 'about', 'services', 'contact'],
    content_mode: 'ai',
  };
}

function loadOnboardingDraft() {
  try {
    const raw = localStorage.getItem(ONBOARDING_DRAFT_KEY);
    if (!raw) return defaultOnboardingDraft();
    const parsed = JSON.parse(raw);
    return {
      ...defaultOnboardingDraft(),
      ...(parsed && typeof parsed === 'object' ? parsed : {}),
      pages: Array.isArray(parsed?.pages) ? parsed.pages : defaultOnboardingDraft().pages,
    };
  } catch (_) {
    return defaultOnboardingDraft();
  }
}

function saveOnboardingDraft(draft) {
  try {
    localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
  } catch (_) {}
}

function openOnboardingWizard() {
  const modal = document.getElementById('onboarding-modal');
  if (!modal) return;

  closeCommandPalette();

  window.__vsOnboarding = {
    step: 1,
    draft: loadOnboardingDraft(),
  };

  modal.classList.remove('hidden');
  renderOnboardingWizardStep();
}

function closeOnboardingWizard() {
  const modal = document.getElementById('onboarding-modal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function renderOnboardingWizardStep() {
  const state = window.__vsOnboarding || { step: 1, draft: loadOnboardingDraft() };
  const step = Math.max(1, Math.min(3, state.step || 1));
  const draft = state.draft || loadOnboardingDraft();

  const indicator = document.getElementById('onboarding-step-indicator');
  const stepLabel = document.getElementById('onboarding-step-label');
  const body = document.getElementById('onboarding-step-body');
  const prevBtn = document.getElementById('btn-onboarding-prev');
  const nextBtn = document.getElementById('btn-onboarding-next');
  const generateBtn = document.getElementById('btn-onboarding-generate');
  if (!indicator || !stepLabel || !body || !prevBtn || !nextBtn || !generateBtn) return;

  const titles = ['Business Basics', 'Audience & Style', 'Pages & Content'];
  stepLabel.textContent = `Step ${step} of 3 · ${titles[step - 1]}`;

  indicator.innerHTML = titles.map((title, idx) => {
    const isCurrent = idx + 1 === step;
    const isDone = idx + 1 < step;
    return `
      <div class="rounded-lg border px-3 py-2 text-xs ${isCurrent ? 'border-vs-accent text-vs-text-secondary bg-vs-bg-inset' : isDone ? 'border-vs-border-subtle text-vs-text-secondary' : 'border-vs-border-subtle text-vs-text-ghost'}">
        <div class="font-medium">${idx + 1}. ${escapeHtml(title)}</div>
      </div>
    `;
  }).join('');

  if (step === 1) {
    body.innerHTML = `
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Business Name</label>
          <input id="onboard-business-name" type="text" class="vs-input w-full" value="${escapeHtml(draft.business_name)}" placeholder="e.g. Harbor & Pine Studio">
        </div>
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Business Type</label>
          <input id="onboard-business-type" type="text" class="vs-input w-full" value="${escapeHtml(draft.business_type)}" placeholder="e.g. interior design studio">
        </div>
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Core Offer</label>
          <textarea id="onboard-offer" class="vs-textarea w-full" rows="4" placeholder="What do you sell or provide?">${escapeHtml(draft.offer)}</textarea>
        </div>
      </div>
    `;
  } else if (step === 2) {
    body.innerHTML = `
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Target Audience</label>
          <textarea id="onboard-audience" class="vs-textarea w-full" rows="3" placeholder="Who should this website attract?">${escapeHtml(draft.audience)}</textarea>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Visual Style</label>
            <select id="onboard-style" class="vs-input w-full">
              <option value="modern-minimal" ${draft.style === 'modern-minimal' ? 'selected' : ''}>Modern Minimal</option>
              <option value="bold-vibrant" ${draft.style === 'bold-vibrant' ? 'selected' : ''}>Bold Vibrant</option>
              <option value="elegant-classic" ${draft.style === 'elegant-classic' ? 'selected' : ''}>Elegant Classic</option>
              <option value="playful-creative" ${draft.style === 'playful-creative' ? 'selected' : ''}>Playful Creative</option>
              <option value="dark-premium" ${draft.style === 'dark-premium' ? 'selected' : ''}>Dark Premium</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Copy Tone</label>
            <select id="onboard-tone" class="vs-input w-full">
              <option value="confident" ${draft.tone === 'confident' ? 'selected' : ''}>Confident</option>
              <option value="friendly" ${draft.tone === 'friendly' ? 'selected' : ''}>Friendly</option>
              <option value="luxury" ${draft.tone === 'luxury' ? 'selected' : ''}>Luxury</option>
              <option value="playful" ${draft.tone === 'playful' ? 'selected' : ''}>Playful</option>
            </select>
          </div>
        </div>
      </div>
    `;
  } else {
    const pageOptions = [
      { key: 'home', label: 'Home' },
      { key: 'about', label: 'About' },
      { key: 'services', label: 'Services' },
      { key: 'portfolio', label: 'Portfolio' },
      { key: 'pricing', label: 'Pricing' },
      { key: 'blog', label: 'Blog' },
      { key: 'contact', label: 'Contact' },
    ];

    body.innerHTML = `
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm text-vs-text-secondary mb-2">Pages to Create</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${pageOptions.map((page) => `
              <label class="flex items-center gap-2 text-xs text-vs-text-secondary rounded-lg border border-vs-border-subtle px-2.5 py-2">
                <input type="checkbox" class="accent-[var(--vs-accent)]" data-onboard-page="${page.key}" ${draft.pages.includes(page.key) ? 'checked' : ''}>
                <span>${page.label}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Content Mode</label>
          <select id="onboard-content-mode" class="vs-input w-full">
            <option value="ai" ${draft.content_mode === 'ai' ? 'selected' : ''}>AI writes content for me</option>
            <option value="placeholder" ${draft.content_mode === 'placeholder' ? 'selected' : ''}>Use realistic placeholder content</option>
            <option value="guided" ${draft.content_mode === 'guided' ? 'selected' : ''}>Leave structured blocks for my copy</option>
          </select>
        </div>
      </div>
    `;
  }

  prevBtn.disabled = step === 1;
  nextBtn.classList.toggle('hidden', step === 3);
  generateBtn.classList.toggle('hidden', step !== 3);

  bindOnboardingStepFieldEvents();
}

function bindOnboardingStepFieldEvents() {
  const state = window.__vsOnboarding || { draft: loadOnboardingDraft() };

  const updateDraft = () => {
    state.draft = {
      ...state.draft,
      business_name: document.getElementById('onboard-business-name')?.value?.trim() || state.draft.business_name || '',
      business_type: document.getElementById('onboard-business-type')?.value?.trim() || state.draft.business_type || '',
      offer: document.getElementById('onboard-offer')?.value?.trim() || state.draft.offer || '',
      audience: document.getElementById('onboard-audience')?.value?.trim() || state.draft.audience || '',
      style: document.getElementById('onboard-style')?.value || state.draft.style || 'modern-minimal',
      tone: document.getElementById('onboard-tone')?.value || state.draft.tone || 'confident',
      content_mode: document.getElementById('onboard-content-mode')?.value || state.draft.content_mode || 'ai',
    };

    const pageChecks = document.querySelectorAll('[data-onboard-page]');
    if (pageChecks.length) {
      state.draft.pages = Array.from(pageChecks)
        .filter((el) => el.checked)
        .map((el) => el.dataset.onboardPage)
        .filter(Boolean);
    }

    saveOnboardingDraft(state.draft);
    window.__vsOnboarding = state;
  };

  [
    'onboard-business-name',
    'onboard-business-type',
    'onboard-offer',
    'onboard-audience',
    'onboard-style',
    'onboard-tone',
    'onboard-content-mode',
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', updateDraft);
    el.addEventListener('change', updateDraft);
  });

  document.querySelectorAll('[data-onboard-page]').forEach((el) => {
    el.addEventListener('change', updateDraft);
  });
}

function buildOnboardingPrompt(draft) {
  const styleMap = {
    'modern-minimal': 'Modern Minimal',
    'bold-vibrant': 'Bold Vibrant',
    'elegant-classic': 'Elegant Classic',
    'playful-creative': 'Playful Creative',
    'dark-premium': 'Dark Premium',
  };

  const toneMap = {
    confident: 'confident and clear',
    friendly: 'friendly and approachable',
    luxury: 'refined and premium',
    playful: 'energetic and playful',
  };

  const pageList = (draft.pages && draft.pages.length ? draft.pages : ['home', 'about', 'services', 'contact'])
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(', ');

  const contentInstruction = draft.content_mode === 'placeholder'
    ? 'Use realistic placeholder copy that feels context-aware.'
    : draft.content_mode === 'guided'
      ? 'Use structured content blocks that clearly indicate where final copy goes.'
      : 'Write complete high-quality content for all pages.';

  return [
    `Create a complete website for ${draft.business_name || 'my business'}.`,
    draft.business_type ? `Business type: ${draft.business_type}.` : '',
    draft.offer ? `Core offer: ${draft.offer}.` : '',
    draft.audience ? `Target audience: ${draft.audience}.` : '',
    `Style preference: ${styleMap[draft.style] || 'Modern Minimal'}.`,
    `Copy tone: ${toneMap[draft.tone] || 'confident and clear'}.`,
    `Build these pages: ${pageList}.`,
    contentInstruction,
    'Use a premium visual hierarchy, strong CTA strategy, and conversion-focused section flow.',
  ].filter(Boolean).join(' ');
}

function bindOnboardingWizardEvents() {
  const overlay = document.querySelector('[data-onboarding-overlay]');
  if (overlay) {
    overlay.addEventListener('click', () => closeOnboardingWizard());
  }

  const closeBtn = document.getElementById('btn-close-onboarding');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeOnboardingWizard());
  }

  const prevBtn = document.getElementById('btn-onboarding-prev');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const state = window.__vsOnboarding || { step: 1, draft: loadOnboardingDraft() };
      state.step = Math.max(1, (state.step || 1) - 1);
      window.__vsOnboarding = state;
      renderOnboardingWizardStep();
    });
  }

  const nextBtn = document.getElementById('btn-onboarding-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const state = window.__vsOnboarding || { step: 1, draft: loadOnboardingDraft() };
      state.step = Math.min(3, (state.step || 1) + 1);
      window.__vsOnboarding = state;
      renderOnboardingWizardStep();
    });
  }

  const generateBtn = document.getElementById('btn-onboarding-generate');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const state = window.__vsOnboarding || { step: 3, draft: loadOnboardingDraft() };
      const draft = state.draft || loadOnboardingDraft();
      const prompt = buildOnboardingPrompt(draft);

      try { localStorage.setItem(FIRST_RUN_GUIDE_KEY, '1'); } catch (_) {}
      saveOnboardingDraft(draft);
      closeOnboardingWizard();
      queuePromptAction(prompt, 'create_site', true);
    });
  }
}

// ═══════════════════════════════════════════
//  Event Binding
// ═══════════════════════════════════════════

function bindAppEvents() {
  // Theme toggle — swap theme without re-rendering the page
  const themeBtn = document.getElementById('btn-theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const newTheme = toggleTheme();

      // Update the theme button icon + tooltip without re-rendering
      const isLight = newTheme === 'light';
      themeBtn.innerHTML = isLight ? icons.sun : icons.moon;
      themeBtn.title = isLight ? 'Switch to dark' : 'Switch to light';

      // Sync Monaco editor theme if the editor page is active
      if (window.__vsEditorPage && window.monaco?.editor) {
        window.monaco.editor.setTheme(monacoThemeForCurrentUi());
      }

      // Also sync the code editor modal if open
      const codeModal = document.getElementById('vs-code-editor-overlay');
      if (codeModal && window.monaco?.editor) {
        window.monaco.editor.setTheme(monacoThemeForCurrentUi());
      }
    });
  }

  // Command palette
  const commandBtn = document.getElementById('btn-command-palette');
  if (commandBtn) {
    commandBtn.addEventListener('click', () => {
      openCommandPalette();
    });
  }

  const commandOverlay = document.querySelector('[data-command-overlay]');
  if (commandOverlay) {
    commandOverlay.addEventListener('click', () => closeCommandPalette());
  }

  const commandInput = document.getElementById('command-palette-input');
  if (commandInput) {
    commandInput.addEventListener('input', () => {
      renderCommandPaletteResults(commandInput.value, 0);
    });

    commandInput.addEventListener('keydown', (e) => {
      const state = window.__vsCommandPalette || { commands: [], activeIndex: 0 };

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        const command = state.commands[state.activeIndex];
        if (command) {
          togglePinnedCommand(command.id);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        renderCommandPaletteResults(commandInput.value, state.activeIndex + 1);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        renderCommandPaletteResults(commandInput.value, state.activeIndex - 1);
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        runCommandPaletteSelection();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeCommandPalette();
      }
    });
  }

  bindOnboardingWizardEvents();

  // User menu dropdown
  const userMenuBtn = document.getElementById('btn-user-menu');
  const dropdown = document.getElementById('user-dropdown');
  if (userMenuBtn && dropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
      if (!dropdown.classList.contains('hidden') && !dropdown.contains(e.target) && e.target !== userMenuBtn && !userMenuBtn.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  // Dropdown links — close dropdown on click
  ['btn-edit-profile', 'btn-team-nav'].forEach(id => {
    const link = document.getElementById(id);
    if (link && dropdown) {
      link.addEventListener('click', () => {
        dropdown.classList.add('hidden');
      });
    }
  });

  // Logout
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await api.post('/auth/logout');
      store.set('user', null);
      window.location.reload();
    });
  }

  // ── Status Bar: Preview ──
  const undoStatusBtn = document.getElementById('btn-undo-status');
  if (undoStatusBtn) {
    undoStatusBtn.addEventListener('click', () => { if (!demoGuard()) performUndo(); });
  }

  const redoStatusBtn = document.getElementById('btn-redo-status');
  if (redoStatusBtn) {
    redoStatusBtn.addEventListener('click', () => { if (!demoGuard()) performRedo(); });
  }

  // ── Status Bar: Preview ──
  const previewBtn = document.getElementById('btn-preview-site');
  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      window.open('/_studio/api/router.php?_path=%2Fpreview&path=index.php', '_blank');
    });
  }

  // ── Status Bar: Snapshot ──
  const snapshotBtn = document.getElementById('btn-snapshot');
  if (snapshotBtn) {
    snapshotBtn.addEventListener('click', async () => {
      if (demoGuard()) return;
      snapshotBtn.disabled = true;
      setStatusText('Creating snapshot...');

      const { ok, data, error } = await api.post('/snapshots', {
        type: 'manual',
        label: 'Manual snapshot',
      });

      snapshotBtn.disabled = false;
      setStatusText(
        ok
          ? `✓ Snapshot saved (${data?.snapshot?.file_count || 0} files)`
          : '✗ ' + (error?.message || 'Snapshot failed'),
        ok ? 'success' : 'error',
        4000
      );
    });
  }

  // ── Status Bar: Download ──
  const downloadBtn = document.getElementById('btn-download');
  if (downloadBtn) {
    // Check publish state to determine if download should be enabled
    (async () => {
      const { ok, data } = await api.get('/settings');
      const lastPublished = data?.settings?.last_published_at;
      if (!lastPublished) {
        downloadBtn.disabled = true;
        downloadBtn.title = 'Publish your site first to enable download.';
        downloadBtn.classList.add('opacity-40');
      }
    })();

    downloadBtn.addEventListener('click', () => {
      if (downloadBtn.disabled) return;
      if (demoGuard()) return;
      openDownloadModal();
    });
  }

  // ── Status Bar: Publish ──
  const publishBtn = document.getElementById('btn-publish');
  if (publishBtn) {
    applyPublishStateUi();

    publishBtn.addEventListener('click', async () => {
      if (demoGuard()) return;
      const publishState = ensurePublishState();
      if (publishState.publishing) return;

      if (publishState.hasChanges === false) {
        showToast('No unpublished changes to publish.', 'warning');
        return;
      }

      const counts = publishState.counts || { added: 0, modified: 0, deleted: 0 };
      const totalChanges = Number(counts.added || 0) + Number(counts.modified || 0) + Number(counts.deleted || 0);

      // Read persisted snapshot preference (default: true)
      const snapshotPref = localStorage.getItem('vs_publish_snapshot');
      const snapshotDefault = snapshotPref === null ? true : snapshotPref !== 'false';

      // Show custom confirm with snapshot checkbox
      const result = await showPublishConfirmModal({
        totalChanges,
        snapshotDefault,
      });
      if (!result) return;

      // Persist the snapshot preference
      localStorage.setItem('vs_publish_snapshot', String(result.createSnapshot));

      publishState.publishing = true;
      applyPublishStateUi();
      setStatusText('Publishing...');

      const { ok, data, error } = await api.post('/publish', {
        create_snapshot: result.createSnapshot,
      });
      publishState.publishing = false;

      if (ok) {
        const count = data?.published?.length || 0;
        const removed = data?.removed?.length || 0;
        const publishedMsg = removed > 0
          ? `Published ${count} file(s), removed ${removed} stale file(s).`
          : `Published ${count} file(s).`;

        showToast(publishedMsg, 'success');
        setStatusText(`✓ ${count} published, ${removed} removed`, 'success', 5000);
        store.set('previewDirty', false);
        refreshPublishState({ silent: true });

        // Open the live site
        window.open('/', '_blank');
      } else {
        showToast(error?.message || 'Publish failed.', 'error');
        setStatusText('✗ ' + (error?.message || 'Publish failed'), 'error', 5000);
        refreshPublishState({ silent: true });
      }
    });
  }

  // ── Status Bar: Publish Menu (Split Button Chevron) ──
  const publishMenuBtn = document.getElementById('btn-publish-menu');
  if (publishMenuBtn) {
    publishMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (demoGuard()) return;

      // Close any existing dropup
      const existing = document.querySelector('.vs-publish-dropup');
      if (existing) { existing.remove(); return; }

      const dropup = document.createElement('div');
      dropup.className = 'vs-publish-dropup';
      dropup.innerHTML = `
        <button type="button" class="vs-publish-dropup-item is-danger" id="btn-unpublish">
          ${icons.cloudOff} Unpublish
        </button>
      `;

      // Position relative to the split container
      const splitContainer = publishMenuBtn.closest('.vs-publish-split');
      if (splitContainer) {
        splitContainer.appendChild(dropup);
      } else {
        publishMenuBtn.parentElement.appendChild(dropup);
      }

      // Wire unpublish action
      dropup.querySelector('#btn-unpublish').addEventListener('click', async () => {
        dropup.remove();
        const confirmed = await showConfirmModal({
          title: 'Unpublish Website',
          description: 'This will take your live website offline and replace it with a default placeholder page. Your preview and all your work stays intact.',
          confirmLabel: 'Unpublish',
          danger: true,
        });
        if (!confirmed) return;

        setStatusText('Unpublishing...');
        const { ok, data, error } = await api.post('/publish/unpublish');

        if (ok) {
          showToast('Unpublished. Default page restored.', 'success');
          setStatusText('✓ Site unpublished', 'success', 5000);
          refreshPublishState({ silent: true });
        } else {
          showToast(error?.message || 'Unpublish failed.', 'error');
          setStatusText('✗ ' + (error?.message || 'Unpublish failed'), 'error', 5000);
        }
      });

      // Close on outside click
      const closeDropup = (e) => {
        if (!dropup.contains(e.target) && e.target !== publishMenuBtn) {
          dropup.remove();
          document.removeEventListener('click', closeDropup);
        }
      };
      setTimeout(() => document.addEventListener('click', closeDropup), 0);

      // Close on Escape
      const onEscape = (e) => {
        if (e.key === 'Escape') {
          dropup.remove();
          document.removeEventListener('keydown', onEscape);
          document.removeEventListener('click', closeDropup);
        }
      };
      document.addEventListener('keydown', onEscape);
    });
  }

  // Resize handle
  const handle = document.getElementById('resize-handle');
  const panel = document.getElementById('conversation-panel');
  if (handle && panel) {
    let startX, startWidth;

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startX = e.clientX;
      startWidth = panel.offsetWidth;

      const onMouseMove = (e) => {
        const diff = e.clientX - startX;
        const newWidth = Math.min(580, Math.max(340, startWidth + diff));
        panel.style.width = `${newWidth}px`;
        store.set('sidebarWidth', newWidth);
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  // Prompt input auto-resize
  const promptInput = document.getElementById('prompt-input');
  if (promptInput) {
    promptInput.addEventListener('input', () => {
      promptInput.style.height = 'auto';
      promptInput.style.height = Math.min(200, promptInput.scrollHeight) + 'px';
    });

    // Cmd/Ctrl+Enter to send. Plain Enter adds a newline (no auto-submit)
    // because users often paste large blocks of content.
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSend();
      }
    });
  }

  // Send button
  const sendBtn = document.getElementById('btn-send');
  if (sendBtn) {
    sendBtn.addEventListener('click', handleSend);
  }

  // ── Image Attachment Events ──
  const attachBtn = document.getElementById('btn-attach-image');
  const imageFileInput = document.getElementById('image-file-input');

  if (attachBtn && imageFileInput) {
    attachBtn.addEventListener('click', () => imageFileInput.click());
    imageFileInput.addEventListener('change', () => {
      if (imageFileInput.files.length > 0) {
        addImageFiles(imageFileInput.files);
        imageFileInput.value = ''; // Reset for re-selection
      }
    });
  }

  // Drag-and-drop on the prompt area
  const promptArea = document.querySelector('.vs-prompt-area');
  if (promptArea) {
    promptArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      promptArea.classList.add('vs-drag-over');
    });
    promptArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      promptArea.classList.remove('vs-drag-over');
    });
    promptArea.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      promptArea.classList.remove('vs-drag-over');
      const files = Array.from(e.dataTransfer.files).filter(f => ACCEPTED_IMAGE_TYPES.includes(f.type));
      if (files.length > 0) addImageFiles(files);
    });
  }

  // Paste images from clipboard
  if (promptInput) {
    promptInput.addEventListener('paste', (e) => {
      const items = Array.from(e.clipboardData?.items || []);
      const imageItems = items.filter(item => item.kind === 'file' && ACCEPTED_IMAGE_TYPES.includes(item.type));
      if (imageItems.length > 0) {
        e.preventDefault();
        const files = imageItems.map(item => item.getAsFile()).filter(Boolean);
        addImageFiles(files);
      }
    });
  }

  // Quick prompt and first-run guide actions
  bindQuickPromptButtons();

  // New Chat button
  const newChatBtn = document.getElementById('btn-new-chat');
  if (newChatBtn) {
    newChatBtn.addEventListener('click', startNewConversation);
  }

  // Scope selector button
  const scopeBtn = document.getElementById('btn-scope-selector');
  if (scopeBtn) {
    scopeBtn.addEventListener('click', () => {
      openPageScopeSelector();
    });
  }

  // History toggle button
  const historyBtn = document.getElementById('btn-toggle-history');
  if (historyBtn) {
    historyBtn.addEventListener('click', toggleConversationHistory);
  }

  // Visual Editor toggle button
  const visualEditorBtn = document.getElementById('btn-visual-editor');
  if (visualEditorBtn) {
    visualEditorBtn.addEventListener('click', () => toggleVisualEditor());
  }

  // Edit Code button (opens current preview page in code editor)
  const editCodeBtn = document.getElementById('btn-edit-code');
  if (editCodeBtn) {
    editCodeBtn.addEventListener('click', () => {
      const currentPath = window.__vsCurrentPreviewPath || 'index.php';
      openCodeEditorModal(currentPath);
    });
  }

  // Refresh Preview button
  const refreshPreviewBtn = document.getElementById('btn-refresh-preview');
  if (refreshPreviewBtn) {
    refreshPreviewBtn.addEventListener('click', () => refreshPreview());
  }

  // Device preview buttons (Desktop / Tablet / Mobile)
  const deviceButtons = document.querySelectorAll('[data-device]');
  const frameContainer = document.getElementById('preview-frame-container');
  if (deviceButtons.length && frameContainer) {
    const deviceWidths = {
      desktop: '100%',
      tablet:  '768px',
      mobile:  '375px',
    };

    deviceButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const device = btn.dataset.device;
        const width = deviceWidths[device] || '100%';

        // Desktop should use the natural flex sizing + existing margins.
        // Tablet/Mobile apply a centered max-width frame.
        if (device === 'desktop') {
          frameContainer.style.maxWidth = '';
          frameContainer.style.width = '';
          frameContainer.style.alignSelf = '';
        } else {
          frameContainer.style.maxWidth = width;
          frameContainer.style.width = '100%';
          frameContainer.style.alignSelf = 'center';
        }

        // Update active states using design system classes
        deviceButtons.forEach(b => {
          b.classList.remove('vs-device-btn-active');
          if (b.dataset.device === device) {
            b.classList.add('vs-device-btn-active');
          }
        });
      });
    });
  }

  // Open current preview in a new browser tab
  const externalPreviewBtn = document.getElementById('btn-external-preview');
  if (externalPreviewBtn) {
    externalPreviewBtn.addEventListener('click', () => {
      const path = window.__vsCurrentPreviewPath || 'index.php';
      window.open('/_studio/api/router.php?_path=%2Fpreview&path=' + encodeURIComponent(path), '_blank');
    });
  }

  // Expand/collapse long code snippets in AI responses
  if (!window.__vsCodeCollapseBound) {
    window.__vsCodeCollapseBound = true;
    document.addEventListener('click', (event) => {
      const toggle = event.target?.closest?.('[data-code-toggle]');
      if (!toggle) return;
      event.preventDefault();
      toggleCodeCollapse(toggle);
    });
  }

  // Keyboard shortcuts (bind once across re-renders)
  if (!window.__vsKeyboardShortcutsBound) {
    window.__vsKeyboardShortcutsBound = true;
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl+K: open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isCommandPaletteOpen()) {
          closeCommandPalette();
        } else {
          openCommandPalette();
        }
        return;
      }

      if (e.key === 'Escape' && isCommandPaletteOpen()) {
        e.preventDefault();
        closeCommandPalette();
        return;
      }

      if (e.key === 'Escape' && isOnboardingOpen()) {
        e.preventDefault();
        closeOnboardingWizard();
        return;
      }

      // Cmd/Ctrl+Z: undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        if (isCommandPaletteOpen() || isOnboardingOpen()) return;
        // Only intercept when not in an input/textarea
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        performUndo();
      }

      // Cmd/Ctrl+Shift+Z: redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        if (isCommandPaletteOpen() || isOnboardingOpen()) return;
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        performRedo();
      }

      // V: toggle visual editor (only when not in an input field)
      if (e.key === 'v' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        if (isCommandPaletteOpen() || isOnboardingOpen()) return;
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
        // Only on dashboard routes (where preview is visible)
        const route = store.get('route');
        if (!DASHBOARD_ROUTES.includes(route)) return;
        e.preventDefault();
        toggleVisualEditor();
      }

      // Escape: deactivate visual editor if active
      if (e.key === 'Escape' && isVisualEditorActive()) {
        e.preventDefault();
        deactivateVisualEditor();
        return;
      }
    });
  }

  // Restore last active conversation on chat route load.
  // This handles three scenarios:
  //   1. activeConversationId is NOT in the store but IS in localStorage → restore it
  //   2. activeConversationId IS in the store but the DOM was just rebuilt (e.g. theme toggle) → reload it
  //   3. No conversation at all → show empty chat
  const route = store.get('route');
  if (DASHBOARD_ROUTES.includes(route)) {
    try {
      const storeConvId = store.get('activeConversationId');
      const savedConvId = localStorage.getItem('vs-active-conversation');
      const convId = storeConvId || savedConvId;
      const chatMessages = document.getElementById('chat-messages');
      const hasEmptyState = chatMessages?.querySelector('.vs-empty-state');

      if (convId && !store.get('aiStreaming')) {
        // Conversation exists — reload it (DOM was rebuilt, messages are gone)
        if (!storeConvId) store.set('activeConversationId', convId);
        // Only reload if the DOM shows empty state (meaning it was just rebuilt)
        if (hasEmptyState) {
          loadConversation(convId);
        }
      } else if (!convId) {
        // Fresh install or new chat — show empty chat state
        if (chatMessages && chatMessages.children.length === 0) {
          chatMessages.innerHTML = renderEmptyChat();
          bindQuickPromptButtons();
        }
      }
    } catch (_) {}
  }

  refreshRevisionState();
  schedulePublishStatePolling();
}

// ═══════════════════════════════════════════
//  Preview — Generating Overlay
// ═══════════════════════════════════════════

/**
 * Show the generating overlay on the preview to hide unstyled partial pages.
 * Clean, professional loading state with pulsing dots and clear messaging.
 */
function showGeneratingOverlay() {
  const container = document.getElementById('preview-frame-container');
  if (!container) return;

  // Don't duplicate
  if (container.querySelector('.vs-generating-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'vs-generating-overlay';
  overlay.innerHTML = `
    <div class="vs-gen-dots">
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
    </div>
    <div class="vs-gen-title">Working on your site</div>
    <div class="vs-gen-subtitle">Content is being generated.<br>This may take a few minutes.</div>
    <div class="vs-gen-note">Please keep this page open — do not navigate away during generation.</div>
    <div class="vs-gen-progress"><div class="vs-gen-progress-bar"></div></div>
  `;

  container.appendChild(overlay);
}

/**
 * Smoothly remove the generating overlay from the preview.
 */
function hideGeneratingOverlay() {
  const overlay = document.querySelector('.vs-generating-overlay');
  if (!overlay) return;

  overlay.classList.add('removing');
  overlay.addEventListener('animationend', () => overlay.remove(), { once: true });

  // Fallback: remove after 600ms even if animationend doesn't fire
  setTimeout(() => overlay?.remove(), 600);
}

// ═══════════════════════════════════════════
//  Preview Helpers
// ═══════════════════════════════════════════

/**
 * Full reload of the preview iframe.
 *
 * Used after undo/redo and when all files finish writing.
 * Appends a cache-buster to force the browser to fetch fresh.
 */
function refreshPreview(pagePath) {
  const iframe = document.getElementById('preview-iframe');
  if (iframe) {
    // Use explicit path, or the tracked current path, or fallback to index
    const path = pagePath || window.__vsCurrentPreviewPath || 'index.php';
    iframe.src = '/_studio/api/router.php?_path=%2Fpreview&path=' + encodeURIComponent(path) + '&t=' + Date.now();
  }
}
window.refreshPreview = refreshPreview;

// Listen for preview iframe navigation notifications
if (!window.__vsPreviewPathListenerBound) {
  window.__vsPreviewPathListenerBound = true;
  window.addEventListener('message', (e) => {
    if (typeof e.data === 'string' && e.data.startsWith('voxelsite:path:')) {
      window.__vsCurrentPreviewPath = e.data.slice('voxelsite:path:'.length);
      // Keep the scope button label in sync with the previewed page
      updateScopeSelectorUi();
    }
  });
}

/**
 * Send a postMessage to the preview iframe.
 *
 * The preview endpoint injects a small hot-reload script that
 * listens for these messages:
 * - 'voxelsite:reload'      → full page reload
 * - 'voxelsite:reload-css'  → bust CSS cache only (smoother)
 */
function sendPreviewMessage(message) {
  const iframe = document.getElementById('preview-iframe');
  if (iframe && iframe.contentWindow) {
    try {
      iframe.contentWindow.postMessage(message, '*');
    } catch (_) {
      // If postMessage fails (sandbox), fall back to full reload
      refreshPreview();
    }
  }
}
window.sendPreviewMessage = sendPreviewMessage;

async function performUndo() {
  const result = await api.post('/revisions/undo');
  if (result.ok) {
    // Small delay to let filesystem settle after file restoration
    setTimeout(() => refreshPreview(), 300);
    await refreshRevisionState();
    refreshPublishState({ silent: true });
  }
}

async function performRedo() {
  const result = await api.post('/revisions/redo');
  if (result.ok) {
    // Small delay to let filesystem settle after file restoration
    setTimeout(() => refreshPreview(), 300);
    await refreshRevisionState();
    refreshPublishState({ silent: true });
  }
}

async function refreshRevisionState() {
  const { ok, data } = await api.get('/revisions/state');
  if (!ok || !data) return;

  const canUndo = Boolean(data.can_undo);
  const canRedo = Boolean(data.can_redo);
  const undoTitle = data.undo_description ? `Undo: ${data.undo_description}` : 'Nothing to undo';
  const redoTitle = data.redo_description ? `Redo: ${data.redo_description}` : 'Nothing to redo';

  ['btn-undo', 'btn-undo-status'].forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled = !canUndo;
    btn.title = undoTitle;
    btn.classList.toggle('opacity-40', !canUndo);
  });

  ['btn-redo', 'btn-redo-status'].forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled = !canRedo;
    btn.title = redoTitle;
    btn.classList.toggle('opacity-40', !canRedo);
  });
}

function ensurePublishState() {
  if (!window.__vsPublishState) {
    window.__vsPublishState = {
      hasChanges: null,
      counts: { added: 0, modified: 0, deleted: 0 },
      checking: false,
      publishing: false,
      error: null,
      intervalId: null,
    };
  }

  return window.__vsPublishState;
}

function setStatusText(message, tone = 'neutral', resetAfterMs = 0) {
  const statusEl = document.getElementById('status-text');
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = tone === 'success'
    ? 'text-xs text-vs-success'
    : tone === 'error'
      ? 'text-xs text-vs-error'
      : 'text-xs text-vs-text-ghost';

  if (window.__vsStatusResetTimer) {
    clearTimeout(window.__vsStatusResetTimer);
    window.__vsStatusResetTimer = null;
  }

  if (resetAfterMs > 0) {
    window.__vsStatusResetTimer = setTimeout(() => {
      const current = document.getElementById('status-text');
      if (!current) return;
      current.textContent = 'Ready';
      current.className = 'text-xs text-vs-text-ghost';
      window.__vsStatusResetTimer = null;
    }, resetAfterMs);
  }
}

function applyPublishStateUi() {
  const state = ensurePublishState();
  const publishBtn = document.getElementById('btn-publish');
  const chevronBtn = document.getElementById('btn-publish-menu');
  const labelEl = document.getElementById('publish-state-label');
  if (!publishBtn) return;

  // Helper to sync chevron style with main button
  const setChevronStyle = (isPrimary) => {
    if (!chevronBtn) return;
    if (isPrimary) {
      chevronBtn.classList.remove('vs-btn-ghost');
      chevronBtn.classList.add('vs-btn-primary');
    } else {
      chevronBtn.classList.remove('vs-btn-primary');
      chevronBtn.classList.add('vs-btn-ghost');
    }
  };

  const counts = state.counts || { added: 0, modified: 0, deleted: 0 };
  const totalChanges = Number(counts.added || 0) + Number(counts.modified || 0) + Number(counts.deleted || 0);

  if (state.publishing) {
    publishBtn.disabled = true;
    publishBtn.innerHTML = `${icons.publish} Publishing...`;
    if (chevronBtn) chevronBtn.disabled = true;
    if (labelEl) {
      labelEl.textContent = 'Publishing changes...';
      labelEl.className = 'text-2xs text-vs-text-tertiary';
    }
    return;
  }

  // Re-enable chevron in all non-publishing states
  if (chevronBtn) chevronBtn.disabled = false;

  if (state.checking && state.hasChanges === null) {
    publishBtn.disabled = true;
    publishBtn.innerHTML = `${icons.publish} Checking...`;
    if (labelEl) {
      labelEl.textContent = 'Checking publish status...';
      labelEl.className = 'text-2xs text-vs-text-ghost';
    }
    return;
  }

  if (state.error) {
    publishBtn.disabled = false;
    publishBtn.innerHTML = `${icons.publish} Publish`;
    setChevronStyle(true);
    if (labelEl) {
      labelEl.textContent = 'Status unavailable';
      labelEl.className = 'text-2xs text-vs-warning';
    }
    return;
  }

  if (state.hasChanges) {
    publishBtn.disabled = false;
    publishBtn.innerHTML = `${icons.publish} Publish`;
    publishBtn.classList.remove('vs-btn-ghost');
    publishBtn.classList.add('vs-btn-primary');
    setChevronStyle(true);
    if (labelEl) {
      const suffix = totalChanges === 1 ? '' : 's';
      labelEl.textContent = `${totalChanges} unpublished change${suffix}`;
      labelEl.className = 'text-2xs text-vs-accent';
    }
    return;
  }

  publishBtn.disabled = true;
  publishBtn.innerHTML = `${icons.publish} Up to date`;
  publishBtn.classList.remove('vs-btn-primary');
  publishBtn.classList.add('vs-btn-ghost');
  setChevronStyle(false);
  if (labelEl) {
    labelEl.textContent = 'No unpublished changes';
    labelEl.className = 'text-2xs text-vs-text-ghost';
  }
}
window.applyPublishStateUi = applyPublishStateUi;

/**
 * Custom publish confirm modal with snapshot checkbox.
 * Returns null if cancelled, or { createSnapshot: boolean } if confirmed.
 */
function showPublishConfirmModal({ totalChanges = 0, snapshotDefault = true }) {
  return new Promise((resolve) => {
    const existing = document.getElementById('vs-confirm-overlay');
    if (existing) existing.remove();

    const desc = totalChanges > 0
      ? `${totalChanges} unpublished change${totalChanges === 1 ? '' : 's'} will go live.`
      : 'Your current preview will be published.';

    const overlay = document.createElement('div');
    overlay.id = 'vs-confirm-overlay';
    overlay.className = 'vs-modal-overlay';
    overlay.innerHTML = `
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Publish Website</h2>
          <p class="vs-modal-desc">${escapeHtml(desc)}</p>
          <label class="vs-publish-option" for="vs-publish-snapshot-cb">
            <input type="checkbox" id="vs-publish-snapshot-cb" ${snapshotDefault ? 'checked' : ''}>
            <span class="vs-publish-check">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
            <span class="vs-publish-option-label">Create snapshot before publishing</span>
          </label>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-confirm-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-confirm-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Publish</button>
        </div>
      </div>
    `;

    const onKeydown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(null); }
    };
    const close = (value) => {
      document.removeEventListener('keydown', onKeydown);
      closeModal(overlay);
      resolve(value);
    };

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-visible'));

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(null); });
    document.getElementById('vs-confirm-cancel')?.addEventListener('click', () => close(null));
    document.getElementById('vs-confirm-ok')?.addEventListener('click', () => {
      const cb = document.getElementById('vs-publish-snapshot-cb');
      close({ createSnapshot: cb ? cb.checked : true });
    });
    document.addEventListener('keydown', onKeydown);

    // Focus the confirm button
    setTimeout(() => document.getElementById('vs-confirm-ok')?.focus(), 220);
  });
}

// ═══════════════════════════════════════════
//  Download Modal
// ═══════════════════════════════════════════

function openDownloadModal() {
  const existing = document.getElementById('vs-download-modal-overlay');
  if (existing) existing.remove();

  const publishState = ensurePublishState();
  const hasUnpublishedChanges = publishState.hasChanges === true;

  // Build the unpublished warning HTML if applicable
  const warningHtml = hasUnpublishedChanges ? `
    <div class="vs-download-warning">
      <div class="vs-download-warning-content">
        ${icons.alertTriangle}
        <span>You have unpublished changes. This export reflects your last published version.</span>
      </div>
      <a href="#" id="vs-download-publish-link" class="vs-download-publish-link">Publish first →</a>
    </div>
  ` : '';

  const overlay = document.createElement('div');
  overlay.id = 'vs-download-modal-overlay';
  overlay.className = 'vs-modal-overlay';
  overlay.innerHTML = `
    <div class="vs-modal" style="max-width: 520px;">
      <div class="vs-modal-header" style="position: relative;">
        <button id="vs-download-close" class="vs-download-close-btn" type="button" title="Close">
          ${icons.x}
        </button>
        <h2 class="vs-modal-title">Download Your Website</h2>
        <p class="vs-modal-desc">Take your files anywhere. No VoxelSite required to run them.</p>
      </div>
      <div class="vs-modal-body" style="padding-top: 16px;">
        ${warningHtml}
        <div class="vs-download-cards" id="vs-download-cards">
          <button type="button" class="vs-download-card is-selected" data-format="php">
            <div class="vs-download-card-icon">
              ${icons.fileCode}
            </div>
            <div class="vs-download-card-body">
              <div class="vs-download-card-title">
                PHP Website
                <span class="vs-download-badge">Recommended</span>
              </div>
              <p class="vs-download-card-desc">Your complete website source. PHP pages, stylesheets, scripts, and all your assets. Upload to any shared hosting with PHP support.</p>
            </div>
          </button>
          <button type="button" class="vs-download-card" data-format="html">
            <div class="vs-download-card-icon">
              ${icons.globe}
            </div>
            <div class="vs-download-card-body">
              <div class="vs-download-card-title">Static HTML</div>
              <p class="vs-download-card-desc">Every page rendered to plain HTML. Open directly in a browser, or drop on any static host or CDN. No PHP required.</p>
              <p class="vs-download-card-note">Dynamic features like contact forms require a server.</p>
            </div>
          </button>
        </div>
      </div>
      <div style="padding: 0 24px 24px;">
        <button id="vs-download-action" class="vs-btn vs-btn-primary" type="button" style="width: 100%; justify-content: center; height: 42px; font-size: 14px; font-weight: 600;">
          ${icons.download} Download PHP
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  const onEscapeKey = (e) => {
    if (e.key === 'Escape') close();
  };
  const close = () => {
    document.removeEventListener('keydown', onEscapeKey);
    closeModal(overlay);
  };
  overlay.querySelector('#vs-download-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', onEscapeKey);

  // ── Publish first link ──
  const publishLink = overlay.querySelector('#vs-download-publish-link');
  if (publishLink) {
    publishLink.addEventListener('click', (e) => {
      e.preventDefault();
      close();
      setTimeout(() => {
        const publishBtn = document.getElementById('btn-publish');
        if (publishBtn && !publishBtn.disabled) publishBtn.click();
      }, 400);
    });
  }

  // ── Card selection toggle ──
  const cards = overlay.querySelectorAll('.vs-download-card');
  const actionBtn = overlay.querySelector('#vs-download-action');
  let selectedFormat = 'php';

  cards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('is-loading')) return;
      cards.forEach(c => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      selectedFormat = card.dataset.format;
      const label = selectedFormat === 'php' ? 'Download PHP' : 'Download HTML';
      actionBtn.innerHTML = `${icons.download} ${label}`;
    });
  });

  // ── Download action ──
  let isDownloading = false;
  actionBtn.addEventListener('click', async () => {
    if (isDownloading) return;
    isDownloading = true;

    // Enter loading state
    actionBtn.disabled = true;
    actionBtn.innerHTML = `<span class="vs-download-spinner"></span> Preparing download…`;
    cards.forEach(c => c.style.pointerEvents = 'none');

    try {
      const token = store.get('sessionToken');
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/zip',
      };
      if (token) headers['X-VS-Token'] = token;

      const res = await fetch('/_studio/api/router.php?_path=%2Fexport', {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify({ format: selectedFormat }),
      });

      if (!res.ok) {
        // Try to parse an error message
        let errMsg = 'Export failed.';
        try {
          const errJson = await res.json();
          errMsg = errJson?.error?.message || errMsg;
        } catch (_) {}
        showToast(errMsg, 'error');
        return;
      }

      // Get the filename from Content-Disposition header
      const disposition = res.headers.get('Content-Disposition') || '';
      const filenameMatch = disposition.match(/filename="?(.+?)"?$/i);
      const filename = filenameMatch ? filenameMatch[1] : `site-${selectedFormat}-${new Date().toISOString().slice(0, 10)}.zip`;

      // Stream the response as a blob and trigger download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 100);

      showToast(`✓ ${filename} downloaded`, 'success');
    } catch (err) {
      showToast('Download failed. Check your connection.', 'error');
    } finally {
      isDownloading = false;
      actionBtn.disabled = false;
      const label = selectedFormat === 'php' ? 'Download PHP' : 'Download HTML';
      actionBtn.innerHTML = `${icons.download} ${label}`;
      cards.forEach(c => c.style.pointerEvents = '');
    }
  });
}

async function refreshPublishState({ silent = false } = {}) {
  const state = ensurePublishState();
  if (state.publishing) {
    applyPublishStateUi();
    return;
  }

  state.checking = true;
  if (!silent) {
    applyPublishStateUi();
  }

  const { ok, data, error } = await api.get('/preview/diff');
  state.checking = false;

  if (ok && data) {
    state.hasChanges = Boolean(data.has_changes);
    state.counts = data.counts || { added: 0, modified: 0, deleted: 0 };
    state.error = null;
  } else {
    state.error = error?.message || 'Could not check publish status.';
  }

  applyPublishStateUi();
}
window.refreshPublishState = refreshPublishState;

function schedulePublishStatePolling() {
  const state = ensurePublishState();

  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }

  refreshPublishState({ silent: true });

  state.intervalId = window.setInterval(() => {
    if (document.hidden) return;
    refreshPublishState({ silent: true });
  }, 15000);
}

// ═══════════════════════════════════════════
//  Image Attachment Helpers
// ═══════════════════════════════════════════

/**
 * Parse [vx-img:data:image/...;base64,...] markers from a user prompt string.
 * Returns { text: string (clean text without markers), images: string[] (data URLs) }.
 */
function parseVxImages(userPrompt) {
  if (!userPrompt || !userPrompt.includes('[vx-img:')) {
    return { text: userPrompt || '', images: [] };
  }

  const images = [];
  // Match [vx-img:data:image/...;base64,...] markers
  const cleaned = userPrompt.replace(/\[vx-img:(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)\]/g, (_, dataUrl) => {
    images.push(dataUrl);
    return '';
  });

  return { text: cleaned.trim(), images };
}

/**
 * Process and add image files to the pending attachments.
 * Validates size, type, and limit. Reads as base64.
 * Also generates tiny canvas-downsized thumbnails for persistence.
 */
function addImageFiles(fileList) {
  const files = Array.from(fileList);
  const remaining = MAX_IMAGE_ATTACHMENTS - pendingImages.length;

  if (remaining <= 0) {
    showToast(`Maximum ${MAX_IMAGE_ATTACHMENTS} images per message.`, 'warning');
    return;
  }

  const toProcess = files.slice(0, remaining);
  if (files.length > remaining) {
    showToast(`Only ${remaining} more image${remaining === 1 ? '' : 's'} allowed.`, 'warning');
  }

  toProcess.forEach(file => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      showToast(`${file.name}: unsupported format. Use JPEG, PNG, GIF, or WebP.`, 'warning');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      showToast(`${file.name}: too large (max 5MB).`, 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      // Extract base64 data and media type
      const match = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
      if (!match) return;

      // Generate tiny thumbnail via canvas for persistence in chat history
      const img = new Image();
      img.onload = () => {
        const thumbDataUrl = createThumbnailDataUrl(img, 120);
        pendingImages.push({
          media_type: match[1],
          data: match[2],
          name: file.name,
          preview: dataUrl,     // Full data URL for attachment strip
          thumbnail: thumbDataUrl, // Tiny ~3-5KB thumbnail for DB persistence
        });
        renderImageAttachments();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Create a tiny canvas-downsized thumbnail data URL from an Image element.
 * Outputs JPEG at quality 0.6, max dimension constrained to `maxDim` px.
 * Typical output: ~3-5KB — safe to embed in a text column.
 */
function createThumbnailDataUrl(img, maxDim = 120) {
  let w = img.naturalWidth;
  let h = img.naturalHeight;

  if (w > maxDim || h > maxDim) {
    const scale = maxDim / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', 0.6);
}

/**
 * Render the image thumbnail strip below the textarea.
 */
function renderImageAttachments() {
  const container = document.getElementById('image-attachments');
  if (!container) return;

  if (pendingImages.length === 0) {
    container.setAttribute('hidden', '');
    container.innerHTML = '';
    return;
  }

  container.removeAttribute('hidden');
  container.innerHTML = pendingImages.map((img, i) => `
    <div class="vs-image-thumb" data-index="${i}">
      <img src="${img.preview}" alt="${escapeHtml(img.name)}" />
      <button class="vs-image-thumb-remove" data-remove-index="${i}" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
  `).join('');

  // Bind remove buttons
  container.querySelectorAll('[data-remove-index]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.removeIndex, 10);
      pendingImages.splice(idx, 1);
      renderImageAttachments();
    });
  });
}

/**
 * Clear all pending image attachments.
 */
function clearImageAttachments() {
  pendingImages = [];
  renderImageAttachments();
}

// ═══════════════════════════════════════════
//  Send Message Handler
// ═══════════════════════════════════════════

async function handleSend() {
  if (demoGuard()) return;

  const input = document.getElementById('prompt-input');
  if (!input) return;

  const prompt = input.value.trim();
  const hasImages = pendingImages.length > 0;
  if (!prompt && !hasImages) return;

  // Don't allow sending while streaming
  if (store.get('aiStreaming')) return;

  input.value = '';
  input.style.height = 'auto';

  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;

  // Capture attached images before clearing
  const sentImages = [...pendingImages];
  clearImageAttachments();

  // ── Show user message (right-aligned bubble) ──
  const imageThumbsHtml = sentImages.length > 0
    ? `<div class="vs-msg-user-images">${sentImages.map(img =>
        `<img src="${img.preview}" alt="${escapeHtml(img.name)}" class="vs-msg-user-image" />`
      ).join('')}</div>`
    : '';

  const userMsgHtml = `
    <div class="vs-msg-user mb-6 mt-4">
      ${imageThumbsHtml}
      ${prompt ? `<div class="vs-msg-user-bubble">${escapeHtml(prompt)}</div>` : ''}
    </div>
  `;

  const streamId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

  // ── Prepare AI response area with typing indicator ──
  const aiMsgHtml = `
    <div class="vs-msg-ai mb-6" data-stream-id="${streamId}">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-vs-accent">${icons.box}</span>
        <span class="text-xs text-vs-text-ghost font-medium">VoxelSite</span>
      </div>
      <div data-role="typing" class="vs-typing-indicator">
        <span class="vs-typing-dot"></span>
        <span class="vs-typing-dot"></span>
        <span class="vs-typing-dot"></span>
      </div>
      <div data-role="status" hidden class="text-xs text-vs-text-tertiary mt-2 flex items-center gap-2">
        <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <span data-role="status-text"></span>
        <span data-role="status-timer" class="tabular-nums opacity-60"></span>
        <button data-role="stop-btn" class="vs-btn vs-btn-ghost vs-btn-xs" style="margin-left: 4px; color: var(--vs-text-tertiary);">Stop</button>
      </div>
      <div data-role="stream-content" hidden class="vs-msg-ai-bubble"></div>
      <div data-role="files-section" hidden class="vs-files-section">
        <div class="vs-files-header">
          <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
          <span data-role="files-label">Writing files</span>
          <span data-role="files-count" class="vs-files-count"></span>
        </div>
        <div data-role="files" class="vs-files-list"></div>
        <div data-role="files-progress" class="vs-files-progress">
          <div class="vs-files-progress-bar"></div>
        </div>
      </div>
      <div data-role="error" hidden class="mt-3 px-4 py-3 bg-vs-error-dim text-vs-error text-sm rounded-xl border border-vs-error/10"></div>
    </div>
  `;

  // Remove the empty-state cards before appending the first message.
  // Without this, the .vs-empty-state element lingers in the DOM and
  // prefetchPagesForContext() mistakes it for an idle chat, replacing
  // the entire content with a fresh empty state — wiping out the conversation.
  const emptyState = chatMessages.querySelector('.vs-empty-state');
  if (emptyState) emptyState.remove();

  // Append to existing messages (don't replace or re-render previous nodes)
  chatMessages.insertAdjacentHTML('beforeend', userMsgHtml + aiMsgHtml);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // ── Smart auto-scroll: stick to bottom unless the user scrolls up ──
  // The user must be able to scroll up during generation (e.g. to find
  // the stop button or read earlier messages) without being yanked back.
  let stickToBottom = true;
  const scrollThreshold = 80; // px from bottom to count as "at bottom"
  const onChatScroll = () => {
    const distanceFromBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight;
    stickToBottom = distanceFromBottom <= scrollThreshold;
  };
  chatMessages.addEventListener('scroll', onChatScroll);

  const scrollToBottomIfSticky = () => {
    if (stickToBottom) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  };

  const aiBlock = chatMessages.querySelector(`.vs-msg-ai[data-stream-id="${streamId}"]`);
  if (!aiBlock) return;

  const typingEl = aiBlock.querySelector('[data-role="typing"]');
  const statusEl = aiBlock.querySelector('[data-role="status"]');
  const statusTextEl = aiBlock.querySelector('[data-role="status-text"]');
  const contentEl = aiBlock.querySelector('[data-role="stream-content"]');
  const filesSectionEl = aiBlock.querySelector('[data-role="files-section"]');
  const filesEl = aiBlock.querySelector('[data-role="files"]');
  const filesLabelEl = aiBlock.querySelector('[data-role="files-label"]');
  const filesCountEl = aiBlock.querySelector('[data-role="files-count"]');
  const filesProgressEl = aiBlock.querySelector('[data-role="files-progress"]');
  const errorEl = aiBlock.querySelector('[data-role="error"]');
  const timerEl = aiBlock.querySelector('[data-role="status-timer"]');
  const showEl = (el) => {
    if (!el) return;
    el.removeAttribute('hidden');
  };
  const hideEl = (el) => {
    if (!el) return;
    el.setAttribute('hidden', '');
  };

  // ── Live generation metrics ──
  const streamStartTime = Date.now();
  let streamTokenCount = 0;
  let lastDataTime = Date.now();
  let stallWarningShown = false;
  let streamDone = false; // Prevents onStatus from overriding finalized labels

  // Update the timer every second
  const timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - streamStartTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    let timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    // Show token count if we have tokens
    if (streamTokenCount > 0) {
      timeStr += ` · ${streamTokenCount.toLocaleString()} tokens`;
    }

    if (timerEl) timerEl.textContent = `· ${timeStr}`;

    // Stall detection: warn if no data for 5 minutes
    // Local models in particular may take a very long time.
    const silenceMs = Date.now() - lastDataTime;
    if (silenceMs > 300000 && !stallWarningShown) {
      stallWarningShown = true;
      if (statusTextEl) {
        statusTextEl.textContent = 'No data for 5 min — the model may have stalled';
        statusTextEl.style.color = 'var(--vs-warning, #d97706)';
      }
    }
  }, 1000);

  // ── Disable send button during streaming ──
  store.set('aiStreaming', true);
  const sendBtn = document.getElementById('btn-send');
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.classList.add('opacity-50');
  }

  // Show generating overlay on the preview to hide unstyled partial pages
  showGeneratingOverlay();

  let streamedText = '';
  let filesModified = [];
  let streamLooksStructured = false;
  let reloadTimer = null;
  let pendingCssOnly = true;

  // ── Abort controller for cancel support ──
  const abortController = new AbortController();
  const stopBtn = aiBlock.querySelector('[data-role="stop-btn"]');
  if (stopBtn) {
    stopBtn.addEventListener('click', () => abortController.abort());
  }

  // Read action type from the input's data attribute (set by quick-prompt buttons)
  const actionType = input.dataset.actionType || 'free_prompt';
  delete input.dataset.actionType; // Clear for next use

  const rawActionData = input.dataset.actionData;
  let actionData = null;
  if (rawActionData) {
    try { actionData = JSON.parse(rawActionData); } catch (e) {}
    delete input.dataset.actionData;
  }

  // ── Stream the AI response ──
  // Embed tiny thumbnail markers in the prompt text for history persistence.
  // Format: [vx-img:data:image/jpeg;base64,...] at the start of the string.
  // These are ~3-5KB each (canvas-downsized), safe for DB text columns.
  let promptForDb = prompt || '(see attached images)';
  if (sentImages.length > 0) {
    const markers = sentImages
      .map(img => `[vx-img:${img.thumbnail}]`)
      .join('');
    promptForDb = markers + promptForDb;
  }

  const requestBody = {
    user_prompt: promptForDb,
    action_type: actionType,
    page_scope: store.get('activePageScope'),
    conversation_id: store.get('activeConversationId'),
    action_data: actionData,
  };

  // Include images if attached (send only data + media_type, not preview URLs)
  if (sentImages.length > 0) {
    requestBody.images = sentImages.map(img => ({
      data: img.data,
      media_type: img.media_type,
    }));
  }

  await apiStream('/ai/prompt', requestBody, {
    signal: abortController.signal,

    onConversation(conversationId) {
      if (!conversationId) return;
      store.set('activeConversationId', conversationId);
      try { localStorage.setItem('vs-active-conversation', conversationId); } catch (_) {}
    },

    onStatus(message) {
      // If the files section is visible, show post-streaming status
      // (e.g. 'Compiling styles...', 'Finalizing...') in the files label
      if (!streamDone && filesSectionEl && !filesSectionEl.hasAttribute('hidden') && filesLabelEl) {
        filesLabelEl.textContent = message;
      }
      if (statusEl && statusTextEl) {
        statusTextEl.textContent = message;
        showEl(statusEl);
      }
    },

    onToken(text) {
      streamedText += text;
      streamTokenCount += Math.ceil(text.length / 4); // rough token estimate
      lastDataTime = Date.now();
      stallWarningShown = false;
      if (statusTextEl) statusTextEl.style.color = '';
      const lead = streamedText.trimStart();
      if (!streamLooksStructured && lead.length > 0) {
        streamLooksStructured =
          lead.startsWith('{') ||
          lead.startsWith('```json') ||
          lead.startsWith('```') ||
          lead.startsWith('<|') ||
          // <file> tag format (non-JSON structured output)
          lead.startsWith('<message>') ||
          lead.startsWith('<file ') ||
          // Also detect structured output that starts mid-stream
          text.includes('<|') ||
          lead.includes('<|channel|>') ||
          lead.includes('"operations"') ||
          lead.includes('"assistant_message"');

        // If we just switched to structured mode, clear any raw text
        if (streamLooksStructured && contentEl) {
          contentEl.innerHTML = '';
        }
      }

      // Hide typing indicator
      hideEl(typingEl);

      if (contentEl && streamLooksStructured) {
        // ── File-tag format: extract <message> content for live display ──
        // Show only the AI's explanation, hide raw file code
        const msgMatch = streamedText.match(/<message>([\s\S]*?)(<\/message>|$)/);
        if (msgMatch) {
          const msgText = msgMatch[1].trim();
          if (msgText) {
            showEl(contentEl);
            contentEl.innerHTML = renderAiResponseHtml(msgText);
          }
        }

        // Reveal the files section when file generation starts streaming
        if (filesSectionEl && streamedText.includes('<file ')) {
          showEl(filesSectionEl);
        }
      } else if (contentEl) {
        // Non-structured: show raw text as-is (plain conversation)
        showEl(contentEl);
        contentEl.innerHTML = renderAiResponseHtml(streamedText);
        if (statusEl) hideEl(statusEl);
      }

      scrollToBottomIfSticky();
    },

    onFile(file) {
      filesModified.push(file);

      // Reveal the files section when the first file arrives
      if (filesSectionEl) showEl(filesSectionEl);

      // Update counter
      if (filesCountEl) {
        const n = filesModified.length;
        filesCountEl.textContent = `${n} file${n !== 1 ? 's' : ''}`;
      }

      // Add file badge with staggered animation
      if (filesEl) {
        const isDelete = file.action === 'delete';
        const delay = (filesModified.length - 1) * 60; // stagger 60ms per file
        const icon = isDelete
          ? '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>'
          : '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>';
        filesEl.insertAdjacentHTML('beforeend', `
          <div class="vs-file-badge ${isDelete ? 'vs-file-badge-deleted' : 'vs-file-badge-created'}" style="animation-delay: ${delay}ms">
            <span class="vs-file-badge-icon">${icon}</span>
            <span>${escapeHtml(file.path)}</span>
          </div>
        `);
      }

      // Hot-reload: debounce to batch reloads when multiple files arrive
      // in quick succession (prevents showing new HTML with old JS/CSS)
      if (!reloadTimer) pendingCssOnly = true;
      if (!file.path.endsWith('.css')) pendingCssOnly = false;
      clearTimeout(reloadTimer);
      reloadTimer = setTimeout(() => {
        if (pendingCssOnly) {
          sendPreviewMessage('voxelsite:reload-css');
        } else {
          sendPreviewMessage('voxelsite:reload');
        }
        reloadTimer = null;
        pendingCssOnly = true;
      }, 600);

      scrollToBottomIfSticky();
    },

    onDone(result) {
      streamDone = true;
      clearTimeout(reloadTimer);
      reloadTimer = null;
      clearInterval(timerInterval);
      hideEl(typingEl);
      hideEl(statusEl);

      // Finalize the files section: hide progress bar, show completion state.
      // Check both locally tracked filesModified (from file_complete events)
      // AND server-reported files (from the done event payload). Merge-only
      // operations (e.g. memory.json updates) don't emit file_complete during
      // streaming, so filesModified would be empty even though files changed.
      const serverFiles = result.files_modified || [];
      const anyFilesChanged = filesModified.length > 0 || serverFiles.length > 0;
      if (filesSectionEl && anyFilesChanged) {
        hideEl(filesProgressEl);
        filesSectionEl.classList.add('vs-files-done');
        if (filesLabelEl) filesLabelEl.textContent = result.partial ? 'Files updated (partial)' : 'Files updated';
      } else if (filesSectionEl && !filesSectionEl.hasAttribute('hidden')) {
        // Files section was shown (e.g. <file tag detected in stream) but
        // no actual files were reported — hide the section entirely.
        hideEl(filesProgressEl);
        hideEl(filesSectionEl);
      }

      // Always replace chat content with the clean server-parsed message.
      // During streaming, the raw AI output may have leaked into the DOM
      // (e.g. protocol tags, structured JSON). The done event carries
      // the properly parsed friendly message from the server.
      if (contentEl) {
        if (result.message) {
          showEl(contentEl);
          contentEl.innerHTML = renderAiResponseHtml(result.message);
        } else if (streamLooksStructured) {
          // Structured response but no message — hide the raw content
          hideEl(contentEl);
        } else {
          // Safety fallback: if raw structured markers leaked into the
          // visible text, hide them even if streamLooksStructured missed it
          const raw = contentEl.textContent || '';
          if (raw.includes('<|channel|>') || raw.includes('"operations"') || raw.includes('"assistant_message"') || raw.includes('<file ') || raw.includes('<message>')) {
            hideEl(contentEl);
            contentEl.innerHTML = '';
          }
        }
      }

      // Handle truncation and missing pages — auto-continue silently.
      // The user should never have to deal with truncation mechanics.
      // If the AI hit its token limit or the nav references pages that
      // don't exist, automatically fire a targeted follow-up prompt
      // that names exactly which files to create.
      const missingFiles = result.missing_files || [];
      if ((result.truncated || missingFiles.length > 0) && contentEl) {
        // Build a targeted prompt instead of the generic "continue"
        let continuePrompt;
        if (missingFiles.length > 0) {
          // Specific missing files — tell the AI exactly what to create
          const fileList = missingFiles.join(', ');
          continuePrompt = `The following pages are linked in the navigation but were NOT created yet: ${fileList}. Please generate ONLY these missing pages. Match the existing design, layout, and style exactly. Do NOT regenerate any files that already exist.`;
        } else {
          // Truncated but no specific missing file list — general continue
          continuePrompt = 'The previous response was truncated. Complete any unfinished files. Do NOT regenerate files that already exist.';
        }

        // Brief delay so the current stream finalizes visually, then auto-send
        setTimeout(() => {
          const input = document.getElementById('prompt-input');
          if (input && !store.get('aiStreaming')) {
            // Show the user a brief status so they know what's happening
            if (filesLabelEl) filesLabelEl.textContent = 'Generating remaining files...';
            if (filesSectionEl) {
              filesSectionEl.classList.remove('vs-files-done');
              showEl(filesSectionEl);
            }

            input.value = continuePrompt;
            input.dataset.actionType = actionType;
            handleSend();
          }
        }, 800);
      }

      // Update conversation ID for continuity
      if (result.conversation_id) {
        store.set('activeConversationId', result.conversation_id);
        try { localStorage.setItem('vs-active-conversation', result.conversation_id); } catch (_) {}
      }

      // Final preview refresh.
      // Primary: check the locally accumulated filesModified (from file_complete events).
      // Fallback: the server's done event includes files_modified in case
      // individual file_complete events were missed due to network chunking.
      // (serverFiles was already set above for files section finalization)
      const allFiles = [...filesModified, ...serverFiles];
      if (allFiles.length > 0) {
        const allPaths = allFiles.map(f => f.path || f);
        const hasIndex = allPaths.some(p => p === 'index.php');
        const modifiedPages = allPaths
          .filter(p => p.endsWith('.php') && !p.includes('/') && p !== 'index.php');

        // First generation (index.php was created) → always show homepage.
        // Subsequent generations → show the specific page that was modified.
        const isFirstGeneration = hasIndex && modifiedPages.length > 0;
        let previewPage;
        if (isFirstGeneration) {
          previewPage = 'index.php';
        } else if (modifiedPages.length > 0) {
          previewPage = modifiedPages[0];
        } else {
          previewPage = hasIndex ? 'index.php' : null;
        }

        refreshPreview(previewPage);
        store.set('previewDirty', true);
        refreshPublishState({ silent: true });
      }

      // Remove the generating overlay now that the site is ready
      hideGeneratingOverlay();

      // Re-fetch page registry so the chat knows a site exists
      // (switches prompt actions from "create" to "enhance")
      prefetchPagesForContext();

      refreshRevisionState();

      // Clean up the scroll listener now that the stream is done
      chatMessages.removeEventListener('scroll', onChatScroll);
      // Always scroll to bottom on completion — the user should see the final result
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },

    onWarning(message) {
      // Suppress truncation warnings — the system auto-continues silently.
      // Showing "Response was truncated..." would alarm the user unnecessarily.
      if (message.toLowerCase().includes('truncat')) return;

      if (filesEl) {
        filesEl.innerHTML += `
          <div class="vs-badge vs-badge-warning mt-2">${escapeHtml(message)}</div>
        `;
      }
    },

    onError(err) {
      clearTimeout(reloadTimer);
      reloadTimer = null;
      clearInterval(timerInterval);
      hideEl(typingEl);
      hideEl(statusEl);
      if (errorEl) {
        errorEl.textContent = err.message || 'Something went wrong.';
        showEl(errorEl);
      }
      // Remove generating overlay on error too
      hideGeneratingOverlay();
      // Clean up files section: hide progress, show what was completed
      if (filesProgressEl) hideEl(filesProgressEl);
      if (filesSectionEl && filesModified.length > 0) {
        filesSectionEl.classList.add('vs-files-done');
        if (filesLabelEl) filesLabelEl.textContent = 'Files updated (partial)';
      }
    },
  });

  // ── Re-enable send ──
  store.set('aiStreaming', false);
  if (sendBtn) {
    sendBtn.disabled = false;
    sendBtn.classList.remove('opacity-50');
  }
}

// ═══════════════════════════════════════════
//  Login Redirect
// ═══════════════════════════════════════════

function renderLoginRedirect() {
  appRoot.innerHTML = `
    <div class="vs-login-backdrop">
      <!-- Film grain -->
      <div class="vs-login-grain" aria-hidden="true"></div>
      <!-- Amber aura -->
      <div class="vs-login-aura" aria-hidden="true"><div class="vs-login-aura-blob"></div></div>

      <!-- Top-left logo frame -->
      <div class="vs-login-brand">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/>
          <path d="M12 22V12"/>
        </svg>
        <span>VoxelSite</span>
      </div>

      <!-- Login Card -->
      <div class="vs-login-card" id="login-card">

        <!-- ═══ Login State ═══ -->
        <div id="login-state">
          <div class="vs-login-header">
            <svg class="vs-login-logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
              <path d="m3.3 7 8.7 5 8.7-5"/>
              <path d="M12 22V12"/>
            </svg>
            <h1 class="vs-login-title">${IS_DEMO ? 'Welcome to the Demo' : 'Enter the Studio'}</h1>
            <p class="vs-login-subtitle">${IS_DEMO ? 'Explore freely — this is a live preview.' : 'Resume construction.'}</p>
          </div>

          ${IS_DEMO ? `
            <div class="vs-demo-login-banner">
              <strong>Demo Mode</strong>
              <span>Browse everything. Changes won\u2019t be saved.</span>
            </div>
          ` : ''}

          <div id="login-error" class="hidden mb-5 px-4 py-3 bg-vs-error-dim text-vs-error text-sm rounded-xl border border-vs-error/10"></div>

          <form id="login-form" class="flex flex-col gap-4">
            <div>
              <label class="vs-input-label">Email</label>
              <input id="login-email" type="email" required
                class="vs-input"
                placeholder="you@example.com"
                ${IS_DEMO ? 'value="demo@example.com"' : ''}>
            </div>

            <div>
              <div class="vs-login-field-header">
                <label class="vs-input-label">Password</label>
                ${IS_DEMO ? '' : '<button type="button" id="btn-forgot" class="vs-login-forgot">Forgot?</button>'}
              </div>
              <div class="vs-login-password-wrap">
                <input id="login-password" type="password" required
                  class="vs-input"
                  placeholder="Your password"
                  ${IS_DEMO ? 'value="welcome3210"' : ''}>
                <button type="button" id="btn-toggle-pw" class="vs-login-eye" title="Show password">
                  ${icons.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">
              ${IS_DEMO ? 'Enter Demo' : 'Open Studio'}
            </button>
          </form>

          <div class="vs-login-footer">
            <p>${IS_DEMO ? 'Read-only preview \u2014 install your own copy to get started.' : 'Your files. Your server. Your website.'}</p>
          </div>
        </div>

        <!-- ═══ Forgot State ═══ -->
        <div id="forgot-state" class="hidden">
          <div id="forgot-content">
            <div class="vs-login-header">
              <h1 class="vs-login-title">Reset Password</h1>
              <p class="vs-login-subtitle">Checking recovery options…</p>
            </div>
          </div>

          <div class="vs-login-footer">
            <button type="button" id="btn-back-login" class="vs-login-back">← Back to login</button>
          </div>
        </div>

      </div>

      <!-- Theme toggle — subtle floating button in the corner -->
      <button id="btn-login-theme" class="vs-login-theme-toggle"
        title="Toggle light/dark mode">
        ${(store.get('theme') || 'light') === 'light' ? icons.sun : icons.moon}
      </button>
    </div>
  `;

  // ─── Password show/hide ───
  const pwInput = document.getElementById('login-password');
  const toggleBtn = document.getElementById('btn-toggle-pw');
  if (toggleBtn && pwInput) {
   toggleBtn.addEventListener('click', () => {
      const isPassword = pwInput.type === 'password';
      pwInput.type = isPassword ? 'text' : 'password';
      toggleBtn.innerHTML = isPassword ? icons.eyeOff : icons.eye;
      toggleBtn.title = isPassword ? 'Hide password' : 'Show password';
    });
  }

  // ─── Theme toggle on the login page ───
  const loginThemeBtn = document.getElementById('btn-login-theme');
  if (loginThemeBtn) {
    loginThemeBtn.addEventListener('click', () => {
      const newTheme = toggleTheme();
      // Animate the icon swap
      loginThemeBtn.style.transform = 'rotate(180deg) scale(0.8)';
      loginThemeBtn.style.opacity = '0';
      setTimeout(() => {
        loginThemeBtn.innerHTML = newTheme === 'light' ? icons.sun : icons.moon;
        loginThemeBtn.style.transform = 'rotate(0deg) scale(1)';
        loginThemeBtn.style.opacity = '1';
      }, 150);
    });
  }

  /** Bind all [data-toggle-target] eye buttons in the forgot/reset forms */
  function bindResetPasswordToggles() {
    document.querySelectorAll('[data-toggle-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.toggleTarget);
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.innerHTML = isPassword ? icons.eyeOff : icons.eye;
        btn.title = isPassword ? 'Hide password' : 'Show password';
      });
    });
  }

  // ─── Forgot / Back flip ───
  const loginState  = document.getElementById('login-state');
  const forgotState = document.getElementById('forgot-state');
  const btnForgot   = document.getElementById('btn-forgot');
  const btnBack     = document.getElementById('btn-back-login');

  if (btnForgot) {
    btnForgot.addEventListener('click', async () => {
      loginState.classList.add('hidden');
      forgotState.classList.remove('hidden');

      // Fetch recovery mode and render the right form
      const forgotContent = document.getElementById('forgot-content');
      try {
        const res = await fetch('/_studio/api/router.php?_path=%2Fauth%2Frecovery-mode');
        const json = await res.json();
        const mode = json?.data?.mode || 'file';

        if (mode === 'email') {
          forgotContent.innerHTML = `
            <div class="vs-login-header">
              <h1 class="vs-login-title">Reset Password</h1>
              <p class="vs-login-subtitle">Enter your email to receive a recovery link.</p>
            </div>
            <div id="forgot-message" class="hidden mb-5 px-4 py-3 text-sm rounded-xl border"></div>
            <form id="forgot-form" class="flex flex-col gap-4">
              <div>
                <label class="vs-input-label">Email</label>
                <input id="forgot-email" type="email" required class="vs-input" placeholder="you@example.com">
              </div>
              <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Send Recovery Link</button>
            </form>
          `;
          document.getElementById('forgot-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgEl = document.getElementById('forgot-message');
            const emailInput = document.getElementById('forgot-email');
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const email = emailInput?.value?.trim();
            if (!email) return;

            // Disable button while sending
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }

            try {
              const res = await fetch('/_studio/api/router.php?_path=%2Fauth%2Fsend-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              });
              const json = await res.json();

              if (msgEl) {
                if (json.ok) {
                  msgEl.textContent = json.data?.message || 'Recovery link sent. Check your inbox.';
                  msgEl.className = 'mb-5 px-4 py-3 text-sm rounded-xl border';
                  msgEl.style.cssText = 'background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);';
                  if (emailInput) emailInput.value = '';
                } else {
                  msgEl.textContent = json.error?.message || 'Failed to send recovery email.';
                  msgEl.className = 'mb-5 px-4 py-3 text-sm rounded-xl border';
                  msgEl.style.cssText = 'background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);';
                }
                msgEl.classList.remove('hidden');
              }
            } catch (err) {
              if (msgEl) {
                msgEl.textContent = 'Network error. Please try again.';
                msgEl.className = 'mb-5 px-4 py-3 text-sm rounded-xl border';
                msgEl.style.cssText = 'background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);';
                msgEl.classList.remove('hidden');
              }
            } finally {
              if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Recovery Link'; }
            }
          });
        } else {
          // File-based recovery mode
          forgotContent.innerHTML = `
            <div class="vs-login-header">
              <h1 class="vs-login-title">Reset Password</h1>
              <p class="vs-login-subtitle">Server-side recovery — no email required.</p>
            </div>
            <div class="vs-login-reset-instructions">
              <div class="vs-login-reset-step">
                <span class="vs-login-reset-num">1</span>
                <span>Create an empty file named <code>.reset</code> in your <code>_data/</code> folder</span>
              </div>
              <div class="vs-login-reset-step">
                <span class="vs-login-reset-num">2</span>
                <span>Fill in your email and new password below</span>
              </div>
            </div>
            <div id="forgot-message" class="hidden mb-5 px-4 py-3 text-sm rounded-xl border"></div>
            <form id="forgot-form" class="flex flex-col gap-4">
              <div>
                <label class="vs-input-label">Email</label>
                <input id="forgot-email" type="email" required class="vs-input" placeholder="you@example.com">
              </div>
              <div>
                <label class="vs-input-label">New Password</label>
                <div class="vs-login-password-wrap">
                  <input id="forgot-new-password" type="password" required minlength="8" class="vs-input" placeholder="Minimum 8 characters">
                  <button type="button" data-toggle-target="forgot-new-password" class="vs-login-eye" title="Show password">${icons.eye}</button>
                </div>
              </div>
              <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Reset Password</button>
            </form>
          `;
          bindResetPasswordToggles();
          document.getElementById('forgot-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msgEl = document.getElementById('forgot-message');
            const email = document.getElementById('forgot-email')?.value;
            const newPassword = document.getElementById('forgot-new-password')?.value;
            if (!email || !newPassword) return;

            const result = await api.post('/auth/reset-password', { email, new_password: newPassword });
            if (result.ok) {
              if (msgEl) {
                msgEl.textContent = 'Password reset. You can now sign in with your new password.';
                msgEl.className = 'mb-5 px-4 py-3 text-sm rounded-xl border';
                msgEl.style.cssText = 'background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);';
                msgEl.classList.remove('hidden');
              }
              // Switch back to login after a moment
              setTimeout(() => {
                forgotState.classList.add('hidden');
                loginState.classList.remove('hidden');
              }, 2500);
            } else {
              if (msgEl) {
                msgEl.textContent = result.error?.message || 'Reset failed. Make sure the .reset file exists in _data/.';
                msgEl.className = 'mb-5 px-4 py-3 text-sm rounded-xl border';
                msgEl.style.cssText = 'background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);';
                msgEl.classList.remove('hidden');
              }
            }
          });
        }
      } catch (err) {
        forgotContent.innerHTML = `
          <div class="vs-login-header">
            <h1 class="vs-login-title">Reset Password</h1>
            <p class="vs-login-subtitle">Could not determine recovery mode. Contact your administrator.</p>
          </div>
        `;
      }
    });
  }
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      forgotState.classList.add('hidden');
      loginState.classList.remove('hidden');
    });
  }

  // ─── Auto-detect ?reset=TOKEN in URL ───
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('reset');
  if (resetToken && resetToken.length === 64 && forgotState && loginState) {
    // Clean the URL
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState(null, '', cleanUrl);

    // Show token reset form
    loginState.classList.add('hidden');
    forgotState.classList.remove('hidden');

    const forgotContent = document.getElementById('forgot-content');
    if (forgotContent) {
      forgotContent.innerHTML = `
        <div class="vs-login-header">
          <h1 class="vs-login-title">Set New Password</h1>
          <p class="vs-login-subtitle">Enter your new password below.</p>
        </div>
        <div id="forgot-message" class="hidden mb-5 px-4 py-3 text-sm rounded-xl border"></div>
        <form id="token-reset-form" class="flex flex-col gap-4">
          <div>
            <label class="vs-input-label">New Password</label>
            <div class="vs-login-password-wrap">
              <input id="token-new-password" type="password" required minlength="8" class="vs-input" placeholder="Minimum 8 characters">
              <button type="button" data-toggle-target="token-new-password" class="vs-login-eye" title="Show password">${icons.eye}</button>
            </div>
          </div>
          <div>
            <label class="vs-input-label">Confirm Password</label>
            <div class="vs-login-password-wrap">
              <input id="token-confirm-password" type="password" required minlength="8" class="vs-input" placeholder="Confirm your password">
              <button type="button" data-toggle-target="token-confirm-password" class="vs-login-eye" title="Show password">${icons.eye}</button>
            </div>
          </div>
          <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Reset Password</button>
        </form>
      `;
      bindResetPasswordToggles();

      document.getElementById('token-reset-form')?.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const msgEl = document.getElementById('forgot-message');
        const pw = document.getElementById('token-new-password')?.value;
        const confirm = document.getElementById('token-confirm-password')?.value;
        const submitBtn = ev.target.querySelector('button[type="submit"]');

        if (!pw || pw.length < 8) {
          if (msgEl) {
            msgEl.textContent = 'Password must be at least 8 characters.';
            msgEl.className = 'mb-5 px-4 py-3 text-sm rounded-xl border';
            msgEl.style.cssText = 'background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);';
            msgEl.classList.remove('hidden');
          }
          return;
        }
        if (pw !== confirm) {
          if (msgEl) {
            msgEl.textContent = 'Passwords do not match.';
            msgEl.className = 'mb-5 px-4 py-3 text-sm rounded-xl border';
            msgEl.style.cssText = 'background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);';
            msgEl.classList.remove('hidden');
          }
          return;
        }

        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Resetting...'; }

        try {
          const res = await fetch('/_studio/api/router.php?_path=%2Fauth%2Freset-with-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: resetToken, new_password: pw }),
          });
          const json = await res.json();

          if (msgEl) {
            if (json.ok) {
              msgEl.textContent = json.data?.message || 'Password reset. You can now sign in.';
              msgEl.className = 'mb-5 px-4 py-3 text-sm rounded-xl border';
              msgEl.style.cssText = 'background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);';
              msgEl.classList.remove('hidden');
              ev.target.querySelectorAll('input').forEach(i => i.disabled = true);
              if (submitBtn) submitBtn.style.display = 'none';
              setTimeout(() => {
                forgotState.classList.add('hidden');
                loginState.classList.remove('hidden');
              }, 2500);
            } else {
              msgEl.textContent = json.error?.message || 'Reset failed. The link may have expired.';
              msgEl.className = 'mb-5 px-4 py-3 text-sm rounded-xl border';
              msgEl.style.cssText = 'background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);';
              msgEl.classList.remove('hidden');
            }
          }
        } catch (err) {
          if (msgEl) {
            msgEl.textContent = 'Network error. Please try again.';
            msgEl.className = 'mb-5 px-4 py-3 text-sm rounded-xl border';
            msgEl.style.cssText = 'background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);';
            msgEl.classList.remove('hidden');
          }
        } finally {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Reset Password'; }
        }
      });
    }
  }

  // ─── Login form submit ───
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email')?.value;
      const password = document.getElementById('login-password')?.value;
      const errorEl = document.getElementById('login-error');

      if (!email || !password) return;

      const result = await api.post('/auth/login', { email, password });

      if (result.ok && result.data?.token) {
        store.batch(() => {
          store.set('user', result.data.user);
          store.set('sessionToken', result.data.token);
        });
        init(); // Re-init the app
      } else {
        if (errorEl) {
          errorEl.textContent = result.error?.message || 'Invalid email or password.';
          errorEl.classList.remove('hidden');
        }
      }
    });
  }

  refreshRevisionState();
}

// ═══════════════════════════════════════════
//  Utilities
// ═══════════════════════════════════════════

function isFirstRunGuideDismissed() {
  try {
    return localStorage.getItem(FIRST_RUN_GUIDE_KEY) === '1';
  } catch (_) {
    return false;
  }
}

function isOnboardingOpen() {
  const modal = document.getElementById('onboarding-modal');
  return !!modal && !modal.classList.contains('hidden');
}

function renderAiResponseHtml(text) {
  if (!text) return '';

  if (!window.marked) {
    return escapeHtml(text);
  }

  const html = window.marked.parse(text);
  return collapseLongCodeBlocksInHtml(html);
}

function collapseLongCodeBlocksInHtml(html) {
  if (!html || typeof html !== 'string') return '';
  if (!html.includes('<pre')) return html;

  const template = document.createElement('template');
  template.innerHTML = html;

  const blocks = template.content.querySelectorAll('pre');
  blocks.forEach((pre) => {
    const code = pre.querySelector('code');
    const raw = (code ? code.textContent : pre.textContent) || '';
    const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n+$/g, '');
    const lines = normalized ? normalized.split('\n') : [];

    if (lines.length <= CODE_COLLAPSE_MIN_LINES) return;

    const previewText = lines.slice(0, CODE_COLLAPSE_PREVIEW_LINES).join('\n') + '\n...';
    const wrapper = document.createElement('div');
    wrapper.className = 'vs-code-collapse';
    wrapper.setAttribute('data-code-collapse', '1');

    const previewPre = document.createElement('pre');
    previewPre.className = 'vs-code-collapse-preview';
    previewPre.setAttribute('data-code-preview', '1');

    const previewCode = document.createElement('code');
    if (code?.className) {
      previewCode.className = code.className;
    }
    previewCode.textContent = previewText;
    previewPre.appendChild(previewCode);

    pre.classList.add('vs-code-collapse-full', 'hidden');
    pre.setAttribute('data-code-full', '1');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'vs-code-collapse-toggle';
    toggle.setAttribute('data-code-toggle', '1');
    toggle.setAttribute('data-lines', String(lines.length));
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = `More (${lines.length} lines)`;

    const parent = pre.parentNode;
    if (!parent) return;
    parent.replaceChild(wrapper, pre);
    wrapper.appendChild(previewPre);
    wrapper.appendChild(pre);
    wrapper.appendChild(toggle);
  });

  return template.innerHTML;
}

function toggleCodeCollapse(toggleEl) {
  const wrapper = toggleEl.closest('[data-code-collapse]');
  if (!wrapper) return;

  const preview = wrapper.querySelector('[data-code-preview]');
  const full = wrapper.querySelector('[data-code-full]');
  const lines = toggleEl.dataset.lines || '';
  const expanded = wrapper.classList.toggle('is-expanded');

  if (preview) preview.classList.toggle('hidden', expanded);
  if (full) full.classList.toggle('hidden', !expanded);

  toggleEl.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  toggleEl.textContent = expanded ? 'Less' : `More${lines ? ` (${lines} lines)` : ''}`;
}


// ═══════════════════════════════════════════
//  Boot
// ═══════════════════════════════════════════

init();
