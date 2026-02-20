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

const icons = {
  box:        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  sun:        `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon:       `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  user:       `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  send:       `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`,
  monitor:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  tabletSmartphone: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>`,
  smartphone: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>`,
  fileText:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  undo:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
  redo:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  upload:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
  publish:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>`,
  externalLink: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  camera:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  logOut:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  newChat:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  history:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  chevronDown:`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  messageCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  home:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  pencil:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
  trash2:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  arrowUpRight:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`,
  gripVertical:`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>`,
  plus:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  users:      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  mail:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  briefcase:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  layoutGrid: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
  globe:      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  shoppingBag:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  book:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`,
  star:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  folder:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>`,
  folderOpen: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>`,
  fileCode:   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>`,
  fileJson:   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>`,
  image:      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
  type:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
  copy:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  film:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M17 7h4"/><path d="M17 11h4"/><path d="M17 15h4"/></svg>`,
  music:      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  filePdf:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  x:          `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  eye:        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`,
  alignLeft:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/></svg>`,
  hash:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>`,
  toggleLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>`,
  calendar:   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  list:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`,
  link:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  rotateCcw:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  clock:      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  chevronRight:`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  info:       `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  check:      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  filePlus:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>`,
};

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
  { route: 'snapshots',   label: 'Snapshots' },
  { route: 'settings',    label: 'Settings' },
];

/** Routes that use the split-panel dashboard layout */
const DASHBOARD_ROUTES = ['chat', 'editor'];
const FIRST_RUN_GUIDE_KEY = 'vs-first-run-guide-dismissed';
const ONBOARDING_DRAFT_KEY = 'vs-onboarding-draft-v1';
const COMMAND_RECENTS_KEY = 'vs-prompt-recents-v1';
const COMMAND_PINS_KEY = 'vs-prompt-pins-v1';
const CODE_COLLAPSE_MIN_LINES = 8;
const CODE_COLLAPSE_PREVIEW_LINES = 5;
let monacoLoadPromise = null;

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

  // Store user + session token
  store.batch(() => {
    store.set('user', sessionResult.data.user);
    store.set('sessionToken', sessionResult.data.token);
  });

  // Register routes
  router
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
    .on('snapshots',         () => renderApp())
    .on('settings',          () => renderApp())
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
            <span class="vs-logo-icon">${icons.box}</span>
            <span class="vs-logo-text hidden sm:inline">VoxelSite</span>
          </a>
          <nav class="flex items-center gap-0.5" aria-label="Studio navigation">
            ${navHtml}
          </nav>
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
            title="${theme === 'forge' ? 'Switch to light' : 'Switch to dark'}">
            ${theme === 'forge' ? icons.sun : icons.moon}
          </button>

          <div class="relative" id="user-menu-container">
            <button id="btn-user-menu"
              class="vs-btn vs-btn-ghost vs-btn-sm vs-user-btn">
              ${icons.user}
              <span class="hidden sm:inline">${escapeHtml(user?.name || 'Admin')}</span>
            </button>
            <div id="user-dropdown" class="hidden vs-dropdown right-0 top-full mt-1">
              <a href="#/profile" id="btn-edit-profile" class="vs-dropdown-item">
                ${icons.pencil} Edit Profile
              </a>
              <div style="border-top: 1px solid var(--vs-border-subtle); margin: 4px 0;"></div>
              <button id="btn-logout" class="vs-dropdown-item">
                ${icons.logOut} Sign out
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
            <textarea id="prompt-input"
              class="vs-prompt-input vs-textarea"
              placeholder="Describe what you want to build..."
              rows="3"
              style="max-height: 200px;"></textarea>
            <button id="btn-send"
              class="vs-prompt-send"
              title="Send (⌘+Enter)">
              ${icons.send}
            </button>
          </div>
          <div class="flex items-center justify-between mt-2 px-1">
            <span class="text-2xs text-vs-text-ghost">⌘+Enter to send</span>
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
            <button id="btn-edit-code" class="vs-btn vs-btn-ghost vs-btn-xs" title="Edit Code">
              ${icons.fileCode} Edit
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
    case 'snapshots':
      return renderSnapshotsView();
    case 'settings':
      return renderSettingsView();
    case 'profile':
      return renderProfileView();
    default:
      return renderPlaceholderPage('Not Found', 'This page doesn\'t exist.');
  }
}

function renderPlaceholderPage(title, description) {
  return `
    <div class="vs-empty-state" style="min-height: 300px;">
      <div class="vs-empty-icon" style="animation: none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/>
          <path d="M12 22V12"/>
        </svg>
      </div>
      <h1 class="vs-empty-title">${title}</h1>
      <p class="vs-empty-description" style="margin-bottom: 0;">${description}</p>
      <p class="text-2xs text-vs-text-ghost mt-4">Coming in a future update.</p>
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
//  Settings View
// ═══════════════════════════════════════════

function renderSettingsView() {
  // Load settings on render
  setTimeout(() => loadSettings(), 0);

  return `
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Settings</h1>
        <p class="vs-page-subtitle">AI configuration, site settings, and system info.</p>
      </div>

      <div id="settings-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading settings...</div>
      </div>
    </div>
  `;
}

async function loadSettings() {
  const container = document.getElementById('settings-content');
  if (!container) return;

  const [settingsRes, systemRes, mailRes, usageRes, memoryRes, designRes, logsRes] = await Promise.all([
    api.get('/settings'),
    api.get('/settings/system'),
    api.get('/settings/mail'),
    api.get('/settings/usage'),
    api.get('/files/content?path=' + encodeURIComponent('assets/data/memory.json')),
    api.get('/files/content?path=' + encodeURIComponent('assets/data/design-intelligence.json')),
    api.get('/settings/logs'),
  ]);

  const logFiles = logsRes.data?.logs || [];

  const s = settingsRes.data?.settings || {};
  const sys = systemRes.data?.system || {};

  // AI Knowledge files (may not exist for new sites)
  let memoryData = null;
  let designData = null;
  try { if (memoryRes.ok && memoryRes.data?.content) memoryData = JSON.parse(memoryRes.data.content); } catch {}
  try { if (designRes.ok && designRes.data?.content) designData = JSON.parse(designRes.data.content); } catch {}
  const hasKnowledge = memoryData || designData;
  const usageData = usageRes.data || { models: [], totals: { request_count: 0, total_input_tokens: 0, total_output_tokens: 0 } };
  const providers = s.available_providers || {};
  const mailConfig = mailRes.data?.config || {};
  const mailPresets = mailRes.data?.presets || {};
  const providerIds = Object.keys(providers);
  const currentProviderId = s.ai_provider || 'claude';
  const currentProvider = providers[currentProviderId] || { name: 'Claude', models: [], config_fields: [] };
  const configFields = currentProvider.config_fields || [];
  const currentModel = s[`ai_${currentProviderId}_model`] || '';
  const keyIsSet = s[`ai_${currentProviderId}_api_key_set`] || false;

  // Provider selector
  const providerOptions = providerIds.map(pid => {
    const p = providers[pid];
    return `<option value="${escapeHtml(pid)}" ${pid === currentProviderId ? 'selected' : ''}>${escapeHtml(p.name)}</option>`;
  }).join('');

  // Dynamic config fields
  let configFieldsHtml = '';
  for (const f of configFields) {
    if (f.key === 'api_key') {
      configFieldsHtml += `
        <div>
          <label for="set-api-key" class="block text-sm font-medium text-vs-text-secondary mb-1">${escapeHtml(f.label)}${!f.required ? ' <span class="text-vs-text-ghost font-normal">(optional)</span>' : ''}</label>
          <div class="flex gap-2">
            <input id="set-api-key" type="password" value="${keyIsSet ? '••••••••••••••••' : ''}"
              class="vs-input font-mono" style="flex: 1;"
              placeholder="${escapeHtml(f.placeholder)}" />
            <button id="btn-test-api"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Test Connection
            </button>
          </div>
          <p id="api-key-status" class="text-xs mt-1.5 hidden"></p>
          ${keyIsSet
            ? '<p class="text-xs text-vs-text-ghost mt-1">Key is configured. Enter a new key to replace it.</p>'
            : (f.required
              ? '<p class="text-xs text-vs-warning mt-1">No API key set. Add one to enable AI features.</p>'
              : `<p class="text-xs text-vs-text-ghost mt-1">${escapeHtml(f.help_text || 'Optional for local servers')}</p>`)}
          ${f.help_url ? `<a href="${f.help_url}" target="_blank" rel="noopener" class="text-xs text-vs-accent hover:underline mt-1 inline-block">${escapeHtml(f.help_text || 'Get a key')} →</a>` : ''}
        </div>`;
    } else if (f.key === 'base_url') {
      configFieldsHtml += `
        <div>
          <label for="set-base-url" class="block text-sm font-medium text-vs-text-secondary mb-1">${escapeHtml(f.label)}${!f.required ? ' <span class="text-vs-text-ghost font-normal">(optional)</span>' : ''}</label>
          <input id="set-base-url" type="url" value="${escapeHtml(s.ai_openai_compatible_base_url || '')}"
            class="vs-input"
            placeholder="${escapeHtml(f.placeholder)}" />
          ${f.help_text ? `<p class="text-xs text-vs-text-ghost mt-1">${escapeHtml(f.help_text)}</p>` : ''}
        </div>`;
    }
  }

  // Model dropdown will be populated after auto-loading from API

  container.innerHTML = `
    <!-- Card: Site Identity -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">Site Identity</h2>
      <p class="vs-settings-card-subtitle">Your website name and description.</p>
      <div class="space-y-4">
        <div>
          <label for="set-site-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Site Name</label>
          <input id="set-site-name" type="text" value="${escapeHtml(s.site_name || '')}"
            class="vs-input" />
        </div>
        <div>
          <label for="set-site-tagline" class="block text-sm font-medium text-vs-text-secondary mb-1">Tagline</label>
          <input id="set-site-tagline" type="text" value="${escapeHtml(s.site_tagline || '')}"
            class="vs-input"
            placeholder="A short description of your site" />
        </div>
      </div>
      <div class="vs-settings-card-footer">
        <span id="save-identity-status" class="text-xs text-vs-text-ghost hidden"></span>
        <button id="btn-save-identity" class="vs-btn vs-btn-primary vs-btn-sm">
          Save Identity
        </button>
      </div>
    </div>

    <!-- Card: AI Engine -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Provider</h2>
      <p class="vs-settings-card-subtitle">Configure the AI engine that powers your website generation.</p>
      <div class="space-y-4">
        <div>
          <label for="set-ai-provider" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
          <select id="set-ai-provider" class="vs-input">
            ${providerOptions}
          </select>
        </div>

        <div id="settings-config-fields">
          ${configFieldsHtml}
        </div>

        <div>
          <label for="set-ai-model" class="block text-sm font-medium text-vs-text-secondary mb-1">Model</label>
          <select id="set-ai-model" class="vs-input">
            <option value="">Loading models…</option>
          </select>
        </div>

        <div>
          <label for="set-max-tokens" class="block text-sm font-medium text-vs-text-secondary mb-1">Max Output Tokens</label>
          <input id="set-max-tokens" type="number" value="${s.ai_max_tokens || 32000}" min="1000" max="128000" step="1000"
            class="vs-input" />
          <p class="text-xs text-vs-text-ghost mt-1">Higher values allow larger website generations but cost more.</p>
        </div>
      </div>
      <div class="vs-settings-card-footer">
        <span id="save-status" class="text-xs text-vs-text-ghost hidden"></span>
        <button id="btn-save-settings" class="vs-btn vs-btn-primary vs-btn-sm">
          Save Settings
        </button>
      </div>
    </div>

    <!-- Card: Email & Notifications -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">Email & Notifications</h2>
      <p class="vs-settings-card-subtitle">Configure how VoxelSite sends transactional emails.</p>
      <div class="space-y-4">
        <div>
          <label for="set-mail-driver" class="block text-sm font-medium text-vs-text-secondary mb-1">Delivery Method</label>
          <select id="set-mail-driver" class="vs-input">
            <option value="none" ${mailConfig.driver === 'none' ? 'selected' : ''}>Not configured</option>
            <option value="php_mail" ${mailConfig.driver === 'php_mail' ? 'selected' : ''}>PHP mail()</option>
            <option value="smtp" ${mailConfig.driver === 'smtp' ? 'selected' : ''}>SMTP</option>
            <option value="mailpit" ${mailConfig.driver === 'mailpit' ? 'selected' : ''}>Mailpit (local dev)</option>
          </select>
        </div>

        <!-- SMTP Fields -->
        <div id="mail-smtp-fields" style="display: ${mailConfig.driver === 'smtp' ? 'block' : 'none'};">
          <div class="space-y-4">
            <div>
              <label for="set-smtp-preset" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
              <select id="set-smtp-preset" class="vs-input">
                ${Object.entries(mailPresets).map(([key, preset]) =>
                  `<option value="${escapeHtml(key)}">${escapeHtml(preset.label)}</option>`
                ).join('')}
              </select>
              <p id="smtp-preset-help" class="text-xs text-vs-text-ghost mt-1"></p>
            </div>

            <div>
              <label for="set-smtp-host" class="block text-sm font-medium text-vs-text-secondary mb-1">SMTP Host</label>
              <input id="set-smtp-host" type="text" value="${escapeHtml(mailConfig.smtp_host || '')}"
                class="vs-input"
                placeholder="smtp.example.com" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="set-smtp-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Port</label>
                <input id="set-smtp-port" type="number" value="${mailConfig.smtp_port || 587}" min="1" max="65535"
                  class="vs-input" />
              </div>
              <div>
                <label for="set-smtp-encryption" class="block text-sm font-medium text-vs-text-secondary mb-1">Encryption</label>
                <select id="set-smtp-encryption" class="vs-input">
                  <option value="tls" ${mailConfig.smtp_encryption === 'tls' ? 'selected' : ''}>TLS (STARTTLS)</option>
                  <option value="ssl" ${mailConfig.smtp_encryption === 'ssl' ? 'selected' : ''}>SSL</option>
                  <option value="none" ${mailConfig.smtp_encryption === 'none' ? 'selected' : ''}>None</option>
                </select>
              </div>
            </div>

            <div>
              <label for="set-smtp-username" class="block text-sm font-medium text-vs-text-secondary mb-1">Username</label>
              <input id="set-smtp-username" type="text" value="${escapeHtml(mailConfig.smtp_username || '')}"
                class="vs-input"
                placeholder="user@example.com" />
            </div>

            <div>
              <label for="set-smtp-password" class="block text-sm font-medium text-vs-text-secondary mb-1">Password</label>
              <div class="relative">
                <input id="set-smtp-password" type="password" value="${mailConfig.smtp_password || ''}"
                  class="vs-input font-mono"
                  style="padding-right: 40px;"
                  placeholder="Enter SMTP password" />
                <button id="btn-toggle-smtp-pass" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-vs-text-ghost hover:text-vs-text-secondary transition-colors cursor-pointer" tabindex="-1" style="background:none;border:none;padding:4px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mailpit Fields -->
        <div id="mail-mailpit-fields" style="display: ${mailConfig.driver === 'mailpit' ? 'block' : 'none'};">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="set-mailpit-host" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Host</label>
              <input id="set-mailpit-host" type="text" value="${escapeHtml(mailConfig.mailpit_host || 'localhost')}"
                class="vs-input" />
            </div>
            <div>
              <label for="set-mailpit-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Port</label>
              <input id="set-mailpit-port" type="number" value="${mailConfig.mailpit_port || 1025}" min="1" max="65535"
                class="vs-input" />
            </div>
          </div>
        </div>

        <!-- Common Fields (From address, test) -->
        <div id="mail-common-fields" style="display: ${mailConfig.driver === 'none' ? 'none' : 'block'};">
        <div class="border-t border-vs-border-subtle my-2"></div>
        <div>
          <label for="set-mail-from-address" class="block text-sm font-medium text-vs-text-secondary mb-1">From Address</label>
          <input id="set-mail-from-address" type="email" value="${escapeHtml(mailConfig.from_address || '')}"
            class="vs-input"
            placeholder="noreply@yourdomain.com" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender on notification emails.</p>
        </div>

        <div>
          <label for="set-mail-from-name" class="block text-sm font-medium text-vs-text-secondary mb-1">From Name</label>
          <input id="set-mail-from-name" type="text" value="${escapeHtml(mailConfig.from_name || '')}"
            class="vs-input"
            placeholder="Your Site Name" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender name on notification emails.</p>
        </div>

        <div class="border-t border-vs-border-subtle my-2"></div>

        <!-- Test Email -->
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary mb-1">Test Email</label>
          <div class="flex gap-2">
            <input id="set-mail-test-recipient" type="email" value="${escapeHtml(s.user_email || '')}"
              class="vs-input" style="flex: 1;"
              placeholder="your@email.com" />
            <button id="btn-mail-test"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Send Test
            </button>
          </div>
          <p id="mail-test-status" class="text-xs mt-1.5 hidden"></p>
        </div>
      </div>
      </div>
      <div class="vs-settings-card-footer">
        <span id="save-mail-status" class="text-xs text-vs-text-ghost hidden"></span>
        <button id="btn-save-mail" class="vs-btn vs-btn-primary vs-btn-sm">
          Save Email Settings
        </button>
      </div>
    </div>

    ${hasKnowledge ? `
    <!-- Card: AI Knowledge -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Knowledge</h2>
      <p class="vs-settings-card-subtitle">What the AI knows about your site. These values are learned from your conversations.</p>
      <div class="vs-knowledge-cards">
        ${memoryData ? `
        <button class="vs-knowledge-card" id="btn-view-memory">
          <div class="vs-knowledge-card-icon">${icons.book}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Site Memory</span>
            <span class="vs-knowledge-card-desc">${Object.keys(memoryData).length} facts remembered</span>
          </div>
          <div class="vs-knowledge-card-arrow">${icons.chevronRight}</div>
        </button>
        ` : ''}
        ${designData ? `
        <button class="vs-knowledge-card" id="btn-view-design">
          <div class="vs-knowledge-card-icon">${icons.eye}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Design Intelligence</span>
            <span class="vs-knowledge-card-desc">${Object.keys(designData).length} design decisions</span>
          </div>
          <div class="vs-knowledge-card-arrow">${icons.chevronRight}</div>
        </button>
        ` : ''}
      </div>
      <p class="vs-knowledge-hint">
        ${icons.info}
        You can't edit these values directly — ask VoxelSite in chat to update them.
      </p>
    </div>
    ` : ''}

    <!-- Card: AI Usage -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Usage</h2>
      <p class="vs-settings-card-subtitle">Token consumption and cost tracking across models.</p>
      ${usageData.models.length === 0 ? `
        <div class="text-sm text-vs-text-ghost py-4 text-center">No usage data yet. Start generating to see stats.</div>
      ` : `
        <div class="vs-sys-grid">
          ${renderSysRow('Total Requests', Number(usageData.totals.request_count).toLocaleString())}
          ${renderSysRow('Input Tokens', Number(usageData.totals.total_input_tokens).toLocaleString())}
          ${renderSysRow('Output Tokens', Number(usageData.totals.total_output_tokens).toLocaleString())}

        </div>
        ${usageData.models.length > 1 ? `
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vs-border-subtle);">
            <div class="text-xs text-vs-text-ghost mb-2" style="text-transform: uppercase; letter-spacing: 0.05em;">Per Model</div>
            ${usageData.models.map(m => `
              <div class="vs-sys-grid" style="margin-bottom: 8px;">
                ${renderSysRow(m.ai_model || 'Unknown', Number(m.request_count).toLocaleString() + ' requests')}
                ${renderSysRow('Tokens', Number(m.total_input_tokens).toLocaleString() + ' in / ' + Number(m.total_output_tokens).toLocaleString() + ' out')}

              </div>
            `).join('')}
          </div>
        ` : ''}
      `}
    </div>

    <!-- Card: System Status -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">System Status</h2>
      <p class="vs-settings-card-subtitle">Runtime environment and resource usage.</p>
      <div class="vs-sys-grid">
        ${renderSysRow('VoxelSite', sys.version || '1.0.0')}
        ${renderSysRow('PHP', sys.php_version || '?')}
        ${renderSysRow('SQLite', sys.sqlite_version || '?')}
        ${renderSysRow('Database', formatFileSize(sys.database_size))}
        ${renderSysRow('Preview Files', formatFileSize(sys.preview_size))}
        ${renderSysRow('Assets', formatFileSize(sys.assets_size))}
        ${renderSysRow('Upload Limit', sys.max_upload || '?')}
        ${renderSysRow('Memory Limit', sys.memory_limit || '?')}
      </div>
    </div>

    <!-- Card: Update -->
    <div class="vs-settings-card">
      <div class="flex items-center justify-between mb-1">
        <h2 class="vs-settings-card-title mb-0">Update</h2>
        <span class="vs-pill vs-pill-subtle">v${escapeHtml(sys.version || '1.0.0')}</span>
      </div>
      <p class="vs-settings-card-subtitle">Upload a VoxelSite update package (.zip) to update to the latest version. Your pages, settings, database, and uploaded files are preserved.</p>

      <!-- Detected dist packages (populated dynamically) -->
      <div id="vs-dist-packages"></div>

      <div class="vs-update-zone" id="vs-update-zone">
        <div class="vs-update-zone-idle" id="vs-update-idle">
          <div class="vs-update-zone-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div class="vs-update-zone-text">
            <span class="vs-update-zone-label">Drop update .zip here or click to browse</span>
            <span class="vs-update-zone-hint">Only system files are updated — your content stays safe</span>
            <span class="vs-update-zone-hint" style="margin-top: 4px; opacity: 0.6;">Upload limit too low? Upload the .zip to <code>/dist/</code> via FTP and it will appear above.</span>
          </div>
          <input type="file" id="vs-update-file" accept=".zip" class="hidden" />
        </div>

        <div class="vs-update-zone-progress hidden" id="vs-update-progress">
          <div class="vs-update-spinner"></div>
          <span id="vs-update-status">Uploading...</span>
        </div>

        <div class="vs-update-zone-result hidden" id="vs-update-result">
          <div id="vs-update-result-icon"></div>
          <div id="vs-update-result-message"></div>
        </div>
      </div>
    </div>

    <!-- Server Logs -->
    <div class="vs-settings-card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: ${logFiles.length > 0 ? '16px' : '0'};">
        <div>
          <h3 class="vs-settings-card-title">Server Logs</h3>
          <p class="vs-settings-card-subtitle" style="margin-bottom: 0;">Download log files for debugging.</p>
        </div>
        ${logFiles.length > 0 ? `<button id="btn-delete-all-logs" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost); white-space: nowrap;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Delete all
        </button>` : ''}
      </div>
      <div id="log-files-list" style="display: flex; flex-direction: column; gap: 6px;">
        ${logFiles.length === 0
          ? '<p style="color: var(--vs-text-ghost); font-size: var(--text-xs); margin: 0;">No log files yet.</p>'
          : logFiles.map(f => {
            const sizeKB = (f.size / 1024).toFixed(1);
            const date = new Date(f.modified * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return `<div class="vs-log-row" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--vs-bg-raised); border-radius: var(--radius-md);">
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--vs-text-secondary);">${f.name}</span>
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; color: var(--vs-text-ghost); white-space: nowrap;">${f.lines} lines · ${sizeKB} KB · ${date}</span>
                <a href="/_studio/api/router.php?_path=%2Fsettings%2Flogs%2Fdownload&file=${encodeURIComponent(f.name)}" download class="vs-btn vs-btn-ghost vs-btn-xs" style="text-decoration: none; padding: 2px 8px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
                <button class="vs-btn vs-btn-ghost vs-btn-xs btn-delete-log" data-file="${f.name}" style="padding: 2px 8px; color: var(--vs-text-ghost);" title="Delete">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            </div>`;
          }).join('')}
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="vs-danger-zone">
      <h3 class="vs-danger-zone-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Danger Zone
      </h3>

      <p class="vs-danger-zone-desc">
        Clear the entire website and start fresh. This removes all pages, styles, scripts,
        conversation history, forms, and revisions. Your settings, API keys, and uploaded images are preserved.
      </p>
      <button id="btn-reset-site" class="vs-btn vs-btn-danger vs-btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Website
      </button>

      <div style="border-top: 1px solid var(--vs-border-subtle); margin: 16px 0;"></div>

      <p class="vs-danger-zone-desc">
        Completely wipe the installation — database, config, uploaded files, and all generated content.
        The installation wizard will appear so you can start from scratch.
      </p>
      <button id="btn-reset-install" class="vs-btn vs-btn-danger vs-btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        Reset Installation
      </button>
    </div>
  `;

  // Bind settings events
  bindSettingsEvents(s, providers);

  // Bind email settings events
  bindEmailSettingsEvents(mailConfig, mailPresets);

  // Bind reset button
  bindResetSiteEvent();

  // Bind reset installation button
  bindResetInstallEvent();

  // Bind log deletion buttons (two-step confirm)
  document.querySelectorAll('.btn-delete-log').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (btn.dataset.confirm !== 'true') {
        btn.dataset.confirm = 'true';
        btn.innerHTML = '<span style="font-size: 11px;">Sure?</span>';
        btn.style.color = 'var(--vs-error)';
        setTimeout(() => {
          if (btn.dataset.confirm === 'true') {
            btn.dataset.confirm = '';
            btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            btn.style.color = '';
          }
        }, 3000);
        return;
      }
      const file = btn.dataset.file;
      const row = btn.closest('.vs-log-row');
      if (row) row.style.opacity = '0.4';
      await api.delete('/settings/logs', { file });
      loadSettings();
    });
  });
  const deleteAllBtn = document.getElementById('btn-delete-all-logs');
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', async () => {
      if (deleteAllBtn.dataset.confirm !== 'true') {
        deleteAllBtn.dataset.confirm = 'true';
        deleteAllBtn.textContent = 'Sure?';
        deleteAllBtn.style.color = 'var(--vs-error)';
        setTimeout(() => {
          if (deleteAllBtn.dataset.confirm === 'true') {
            deleteAllBtn.dataset.confirm = '';
            deleteAllBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete all`;
            deleteAllBtn.style.color = '';
          }
        }, 3000);
        return;
      }
      deleteAllBtn.disabled = true;
      deleteAllBtn.textContent = 'Deleting...';
      await api.delete('/settings/logs', { file: '*' });
      loadSettings();
    });
  }

  // Bind AI Knowledge viewer buttons
  const memoryBtn = document.getElementById('btn-view-memory');
  if (memoryBtn && memoryData) {
    memoryBtn.addEventListener('click', () => openKnowledgeViewer('Site Memory', memoryData, 'memory'));
  }
  const designBtn = document.getElementById('btn-view-design');
  if (designBtn && designData) {
    designBtn.addEventListener('click', () => openKnowledgeViewer('Design Intelligence', designData, 'design'));
  }

  // Bind update upload
  bindUpdateUpload();

  // Auto-load models from stored credentials
  autoLoadModels(currentModel);
}

/**
 * Open a cream-themed knowledge viewer modal.
 * @param {string} title - 'Site Memory' or 'Design Intelligence'
 * @param {object} data - The parsed JSON data
 * @param {'memory'|'design'} type - Controls how entries are rendered
 */
/**
 * Compare two semver strings. Returns -1, 0, or 1.
 */
function versionCompare(a, b) {
  const pa = (a || '0').split('.').map(Number);
  const pb = (b || '0').split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

/**
 * Bind the update upload zone: click-to-browse, drag-and-drop, and the upload flow.
 * Also checks for update packages in /dist/ and displays them.
 */
function bindUpdateUpload() {
  const zone = document.getElementById('vs-update-zone');
  const idleEl = document.getElementById('vs-update-idle');
  const progressEl = document.getElementById('vs-update-progress');
  const resultEl = document.getElementById('vs-update-result');
  const fileInput = document.getElementById('vs-update-file');
  const statusEl = document.getElementById('vs-update-status');
  const distContainer = document.getElementById('vs-dist-packages');

  if (!zone || !fileInput) return;

  // ── Load dist packages ──
  loadDistPackages();

  async function loadDistPackages() {
    if (!distContainer) return;
    try {
      const { ok, data } = await api.get('/update/dist-packages');
      if (!ok || !data?.packages?.length) {
        distContainer.innerHTML = '';
        return;
      }

      const currentVersion = data.current_version || '0.0.0';
      const pkgHtml = data.packages.map(pkg => {
        const sizeMB = (pkg.size / 1024 / 1024).toFixed(1);
        const isNewer = versionCompare(pkg.version, currentVersion) > 0;
        const isSame = pkg.version === currentVersion;
        const badge = isNewer
          ? '<span class="vs-pill vs-pill-success" style="font-size: 10px;">newer</span>'
          : isSame
            ? '<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">current</span>'
            : '<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">older</span>';

        return `
          <div class="vs-dist-pkg">
            <div class="vs-dist-pkg-info">
              <div class="vs-dist-pkg-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <strong>${escapeHtml(pkg.filename)}</strong>
                ${badge}
              </div>
              <div class="vs-dist-pkg-meta">v${escapeHtml(pkg.version)} · ${sizeMB} MB</div>
            </div>
            <button class="vs-btn vs-btn-primary vs-btn-sm vs-dist-apply-btn" data-filename="${escapeHtml(pkg.filename)}" data-version="${escapeHtml(pkg.version)}">
              Apply Update
            </button>
          </div>
        `;
      }).join('');

      distContainer.innerHTML = `
        <div class="vs-dist-packages-section">
          <div class="vs-dist-packages-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <span>Update packages found in <code>/dist/</code></span>
          </div>
          ${pkgHtml}
        </div>
      `;

      // Bind apply buttons
      distContainer.querySelectorAll('.vs-dist-apply-btn').forEach(btn => {
        btn.addEventListener('click', () => applyDistPackage(btn.dataset.filename, btn.dataset.version));
      });
    } catch (_) {
      // Non-critical — just don't show the section
    }
  }

  async function applyDistPackage(filename, version) {
    const confirmOk = confirm(
      `Apply update from "${filename}" (v${version})?\n\n` +
      `This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.\n\n` +
      `A page reload is required after the update completes.`
    );
    if (!confirmOk) return;

    // Show progress
    idleEl.classList.add('hidden');
    resultEl.classList.add('hidden');
    progressEl.classList.remove('hidden');
    statusEl.textContent = `Applying ${filename}...`;
    if (distContainer) distContainer.innerHTML = '';

    try {
      const { ok, data, error } = await api.post('/update/apply-local', { filename });

      progressEl.classList.add('hidden');
      resultEl.classList.remove('hidden');

      const resultIcon = document.getElementById('vs-update-result-icon');
      const resultMsg = document.getElementById('vs-update-result-message');

      if (ok) {
        const d = data;
        resultIcon.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
        resultMsg.innerHTML = `
          <div class="vs-update-result-title">${escapeHtml(d.message)}</div>
          <div class="vs-update-result-meta">
            ${d.files_updated} files updated · ${d.files_skipped} preserved
            ${d.errors?.length ? ` · ${d.errors.length} errors` : ''}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `;
      } else {
        showUpdateError('Update Failed', error?.message || 'Unknown error');
      }
    } catch (err) {
      showUpdateError('Update Failed', escapeHtml(err.message || 'Network error.'));
    }
  }

  // Click zone → open file picker
  zone.addEventListener('click', (e) => {
    if (e.target.closest('#vs-update-result')) return;
    fileInput.click();
  });

  // Drag-and-drop
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('is-dragover');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('is-dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('is-dragover');
    const file = e.dataTransfer?.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      handleUpdateFile(file);
    }
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) handleUpdateFile(file);
    fileInput.value = ''; // Reset for re-selection
  });

  async function handleUpdateFile(file) {
    // ── Pre-flight: check file size against server upload limit ──
    const uploadLimitEl = document.querySelector('.vs-sys-grid');
    if (uploadLimitEl) {
      // Parse server upload limit from the System Status display
      const rows = uploadLimitEl.querySelectorAll('.vs-sys-value');
      let limitText = '';
      uploadLimitEl.querySelectorAll('.vs-sys-label').forEach((label, i) => {
        if (label.textContent.trim() === 'Upload Limit') {
          limitText = rows[i]?.textContent?.trim() || '';
        }
      });
      if (limitText) {
        const limitBytes = parseUploadLimit(limitText);
        if (limitBytes > 0 && file.size > limitBytes) {
          const fileMB = (file.size / 1024 / 1024).toFixed(1);
          showUpdateError(
            'File Too Large',
            `The update file is ${fileMB} MB but your server's upload limit is ${limitText}. ` +
            `Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in your php.ini to at least ${fileMB} MB, then restart your web server.`
          );
          return;
        }
      }
    }

    // Confirm before proceeding
    const confirmOk = confirm(
      `Apply update from "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)} MB)?\n\n` +
      `This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.\n\n` +
      `A page reload is required after the update completes.`
    );
    if (!confirmOk) return;

    // Show progress
    idleEl.classList.add('hidden');
    resultEl.classList.add('hidden');
    progressEl.classList.remove('hidden');
    statusEl.textContent = `Uploading ${file.name}...`;

    try {
      const formData = new FormData();
      formData.append('update_zip', file);

      // We need to use fetch directly because our api helper only sends JSON
      const token = store.get('sessionToken');
      const res = await fetch('/_studio/api/router.php?_path=%2Fupdate%2Fupload', {
        method: 'POST',
        credentials: 'same-origin',
        headers: token ? { 'X-VS-Token': token } : {},
        body: formData,
      });

      // Handle non-JSON responses (e.g., PHP errors when post_max_size is exceeded)
      const contentType = res.headers.get('content-type') || '';
      let json;
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        // PHP upload limit errors return HTML like: <br /> <b>Warning</b>: POST Content-Length...
        if (text.includes('POST Content-Length') || text.includes('upload_max_filesize') || text.includes('exceeds')) {
          showUpdateError(
            'Server Upload Limit Exceeded',
            `The file (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds your server's PHP upload limit. ` +
            `Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`
          );
          return;
        }
        showUpdateError('Upload Failed', 'The server returned an unexpected response. Check your PHP error log for details.');
        return;
      }

      json = await res.json();

      progressEl.classList.add('hidden');
      resultEl.classList.remove('hidden');

      const resultIcon = document.getElementById('vs-update-result-icon');
      const resultMsg = document.getElementById('vs-update-result-message');

      if (json.ok) {
        const d = json.data;
        resultIcon.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
        resultMsg.innerHTML = `
          <div class="vs-update-result-title">${escapeHtml(d.message)}</div>
          <div class="vs-update-result-meta">
            ${d.files_updated} files updated · ${d.files_skipped} preserved
            ${d.errors?.length ? ` · ${d.errors.length} errors` : ''}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `;
      } else {
        showUpdateError('Update Failed', json.error?.message || 'Unknown error');
      }
    } catch (err) {
      // Network errors or other unexpected failures
      const msg = err.message || 'Network error. Check your connection.';
      // Detect JSON parse errors (server returned HTML instead of JSON)
      if (msg.includes('Unexpected token') || msg.includes('not valid JSON')) {
        showUpdateError(
          'Server Upload Limit Exceeded',
          `The file (${(file.size / 1024 / 1024).toFixed(1)} MB) likely exceeds your server's PHP upload limit. ` +
          `Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`
        );
      } else {
        showUpdateError('Upload Failed', escapeHtml(msg));
      }
    }
  }

  /** Show an error in the update zone */
  function showUpdateError(title, message) {
    progressEl.classList.add('hidden');
    resultEl.classList.remove('hidden');
    const resultIcon = document.getElementById('vs-update-result-icon');
    const resultMsg = document.getElementById('vs-update-result-message');
    resultIcon.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    resultMsg.innerHTML = `
      <div class="vs-update-result-title" style="color: var(--vs-error);">${escapeHtml(title)}</div>
      <div class="vs-update-result-meta">${message}</div>
      <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="document.getElementById('vs-update-result').classList.add('hidden'); document.getElementById('vs-update-idle').classList.remove('hidden');">
        Try Again
      </button>
    `;
  }

  /** Parse upload limit string (e.g. "2 MB", "128M") into bytes */
  function parseUploadLimit(text) {
    const match = text.match(/([\d.]+)\s*(MB|M|GB|G|KB|K)/i);
    if (!match) return 0;
    const val = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    if (unit === 'GB' || unit === 'G') return val * 1024 * 1024 * 1024;
    if (unit === 'MB' || unit === 'M') return val * 1024 * 1024;
    if (unit === 'KB' || unit === 'K') return val * 1024;
    return 0;
  }
}

function openKnowledgeViewer(title, data, type) {
  // Remove existing if present
  document.getElementById('vs-knowledge-overlay')?.remove();

  const formatKey = (k) => k.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  let entriesHtml = '';
  if (type === 'memory') {
    // Memory: key → { value, confidence }
    entriesHtml = Object.entries(data).map(([key, entry]) => {
      const value = typeof entry === 'object' ? (entry.value || JSON.stringify(entry)) : String(entry);
      const confidence = typeof entry === 'object' ? entry.confidence : null;
      const badgeClass = confidence === 'stated' ? 'vs-kv-badge-stated' : 'vs-kv-badge-inferred';
      return `
        <div class="vs-kv-row">
          <div class="vs-kv-label">${escapeHtml(formatKey(key))}</div>
          <div class="vs-kv-value">
            <span>${escapeHtml(value)}</span>
            ${confidence ? `<span class="vs-kv-badge ${badgeClass}">${escapeHtml(confidence)}</span>` : ''}
          </div>
        </div>`;
    }).join('');
  } else {
    // Design: key → string (long-form descriptions)
    entriesHtml = Object.entries(data).map(([key, value]) => `
      <div class="vs-kv-section">
        <div class="vs-kv-section-label">${escapeHtml(formatKey(key))}</div>
        <div class="vs-kv-section-body">${escapeHtml(String(value))}</div>
      </div>
    `).join('');
  }

  const overlay = document.createElement('div');
  overlay.id = 'vs-knowledge-overlay';
  overlay.className = 'vs-modal-overlay';
  overlay.innerHTML = `
    <div class="vs-modal vs-knowledge-modal">
      <div class="vs-knowledge-modal-header">
        <div class="vs-knowledge-modal-title-row">
          <div class="vs-knowledge-modal-icon">${type === 'memory' ? icons.book : icons.eye}</div>
          <div>
            <h2 class="vs-knowledge-modal-title">${escapeHtml(title)}</h2>
            <p class="vs-knowledge-modal-subtitle">${type === 'memory'
              ? 'Facts the AI has learned about your business from conversations.'
              : 'Design decisions the AI uses to maintain visual consistency.'}</p>
          </div>
        </div>
        <button id="vs-knowledge-close" class="vs-btn vs-btn-ghost vs-btn-icon" title="Close">${icons.x}</button>
      </div>
      <div class="vs-knowledge-modal-body">
        ${entriesHtml}
      </div>
      <div class="vs-knowledge-modal-footer">
        <span class="vs-knowledge-modal-hint">
          ${icons.info}
          These values are managed by VoxelSite. Ask in chat to update them.
        </span>
        <button id="vs-knowledge-done" class="vs-btn vs-btn-primary vs-btn-sm">Done</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  const close = () => {
    overlay.classList.remove('is-visible');
    setTimeout(() => overlay.remove(), 300);
    document.removeEventListener('keydown', escHandler);
  };
  const escHandler = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', escHandler);
  overlay.querySelector('#vs-knowledge-close')?.addEventListener('click', close);
  overlay.querySelector('#vs-knowledge-done')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

/**
 * Bind the "Reset Website" button to open a premium confirmation modal.
 */
function bindResetSiteEvent() {
  const resetBtn = document.getElementById('btn-reset-site');
  if (!resetBtn) return;

  resetBtn.addEventListener('click', () => {
    showResetModal();
  });
}

/**
 * Bind the "Reset Installation" button to open a factory-reset confirmation modal.
 */
function bindResetInstallEvent() {
  const btn = document.getElementById('btn-reset-install');
  if (!btn) return;

  btn.addEventListener('click', () => {
    showResetInstallModal();
  });
}

/**
 * Show the factory reset confirmation modal with type-to-confirm UX.
 * Requires typing "RESET INSTALLATION" — deliberately longer and more explicit
 * than the site reset to prevent accidental use.
 */
function showResetInstallModal() {
  // Remove any existing modal
  const existing = document.getElementById('reset-install-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'reset-install-modal-overlay';
  overlay.className = 'vs-modal-overlay';
  overlay.innerHTML = `
    <div class="vs-modal" id="reset-install-modal">
      <div class="vs-modal-header">
        <div class="vs-modal-icon vs-modal-icon-danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </div>
        <h2 class="vs-modal-title">Reset Installation</h2>
        <p class="vs-modal-desc">This will erase <strong>everything</strong> — your database, config, account, uploaded files, and all generated content. The installation wizard will appear so you can start completely from scratch.</p>
      </div>

      <div class="vs-modal-body">
        <ul class="vs-modal-checklist">
          <li class="will-delete"><span class="check-icon">✕</span> Database (settings, conversations, revisions)</li>
          <li class="will-delete"><span class="check-icon">✕</span> Your account, API keys, and config</li>
          <li class="will-delete"><span class="check-icon">✕</span> All uploaded images, files, and fonts</li>
          <li class="will-delete"><span class="check-icon">✕</span> All generated pages, styles, and scripts</li>
          <li class="will-delete"><span class="check-icon">✕</span> Snapshots and backups</li>
        </ul>

        <label class="vs-modal-confirm-label">
          Type <code>RESET INSTALLATION</code> to confirm
        </label>
        <input
          type="text"
          id="reset-install-confirm-input"
          class="vs-modal-confirm-input"
          placeholder="Type RESET INSTALLATION here"
          autocomplete="off"
          spellcheck="false"
        />
      </div>

      <div class="vs-modal-footer">
        <button id="reset-install-cancel-btn" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
        <button id="reset-install-confirm-btn" class="vs-btn vs-btn-confirm-danger vs-btn-sm" style="position: relative; overflow: hidden;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Erase Everything
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('is-visible');
    });
  });

  // Focus the input after animation
  setTimeout(() => {
    document.getElementById('reset-install-confirm-input')?.focus();
  }, 350);

  // ── Bind modal events ──
  const confirmInput = document.getElementById('reset-install-confirm-input');
  const confirmBtn = document.getElementById('reset-install-confirm-btn');
  const cancelBtn = document.getElementById('reset-install-cancel-btn');
  const modal = document.getElementById('reset-install-modal');

  const CONFIRM_TEXT = 'RESET INSTALLATION';

  // Real-time input validation
  confirmInput?.addEventListener('input', () => {
    const isMatch = confirmInput.value.trim() === CONFIRM_TEXT;
    confirmBtn?.classList.toggle('is-enabled', isMatch);
    confirmInput.classList.toggle('is-matched', isMatch);
  });

  // Enter key to submit
  confirmInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (confirmInput.value.trim() === CONFIRM_TEXT) {
        executeResetInstall(overlay);
      } else {
        modal?.classList.add('shake');
        setTimeout(() => modal?.classList.remove('shake'), 400);
      }
    }
  });

  // Confirm button click
  confirmBtn?.addEventListener('click', () => {
    if (confirmInput?.value.trim() === CONFIRM_TEXT) {
      executeResetInstall(overlay);
    } else {
      modal?.classList.add('shake');
      setTimeout(() => modal?.classList.remove('shake'), 400);
    }
  });

  // Cancel button
  cancelBtn?.addEventListener('click', () => closeModal(overlay));

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay);
  });

  // Escape key to close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal(overlay);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Execute the factory reset — delete everything and redirect to installer.
 */
async function executeResetInstall(overlay) {
  const confirmBtn = document.getElementById('reset-install-confirm-btn');
  const confirmInput = document.getElementById('reset-install-confirm-input');

  if (!confirmBtn) return;

  // Loading state
  confirmBtn.classList.add('is-loading');
  confirmBtn.classList.remove('is-enabled');
  confirmBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Erasing…
  `;
  if (confirmInput) confirmInput.disabled = true;

  try {
    const { ok, data, error } = await api.post('/site/reset-install', { confirm: 'RESET INSTALLATION' });

    if (ok) {
      // Success — show confirmation then redirect to installer
      confirmBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `;
      confirmBtn.style.background = 'var(--vs-success)';
      confirmBtn.style.opacity = '1';

      // Full page redirect to the installer
      setTimeout(() => {
        window.location.href = data?.redirect || '/_studio/install.php';
      }, 800);
    } else {
      // Error — restore button
      confirmBtn.classList.remove('is-loading');
      confirmBtn.classList.add('is-enabled');
      confirmBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Erase Everything
      `;
      if (confirmInput) confirmInput.disabled = false;

      const desc = overlay.querySelector('.vs-modal-desc');
      if (desc) {
        const originalHTML = desc.innerHTML;
        desc.textContent = error?.message || 'Reset failed. Please try again.';
        desc.style.color = 'var(--vs-error)';
        setTimeout(() => {
          desc.innerHTML = originalHTML;
          desc.style.color = '';
        }, 4000);
      }
    }
  } catch (err) {
    confirmBtn.classList.remove('is-loading');
    confirmBtn.classList.add('is-enabled');
    confirmBtn.textContent = 'Erase Everything';
    if (confirmInput) confirmInput.disabled = false;
  }
}

/**
 * Show the reset confirmation modal with type-to-confirm UX.
 */
function showResetModal() {
  // Remove any existing modal
  const existing = document.getElementById('reset-modal-overlay');
  if (existing) existing.remove();

  // Create the modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'reset-modal-overlay';
  overlay.className = 'vs-modal-overlay';
  overlay.innerHTML = `
    <div class="vs-modal" id="reset-modal">
      <div class="vs-modal-header">
        <div class="vs-modal-icon vs-modal-icon-danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </div>
        <h2 class="vs-modal-title">Reset Website</h2>
        <p class="vs-modal-desc">This will permanently remove your generated website and all associated data. This action cannot be undone.</p>
      </div>

      <div class="vs-modal-body">
        <ul class="vs-modal-checklist">
          <li class="will-delete"><span class="check-icon">✕</span> All generated pages and partials</li>
          <li class="will-delete"><span class="check-icon">✕</span> CSS styles, Tailwind output, and JavaScript</li>
          <li class="will-delete"><span class="check-icon">✕</span> Conversation history and AI logs</li>
          <li class="will-delete"><span class="check-icon">✕</span> All revisions (undo history)</li>
          <li class="will-keep"><span class="check-icon">✓</span> Settings, API keys, and account</li>
          <li class="will-keep"><span class="check-icon">✓</span> Uploaded images and files</li>
        </ul>

        <label class="vs-modal-confirm-label">
          Type <code>RESET</code> to confirm
        </label>
        <input
          type="text"
          id="reset-confirm-input"
          class="vs-modal-confirm-input"
          placeholder="Type RESET here"
          autocomplete="off"
          spellcheck="false"
        />
      </div>

      <div class="vs-modal-footer">
        <button id="reset-cancel-btn" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
        <button id="reset-confirm-btn" class="vs-btn vs-btn-confirm-danger vs-btn-sm" style="position: relative; overflow: hidden;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Reset Everything
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('is-visible');
    });
  });

  // Focus the input after animation
  setTimeout(() => {
    document.getElementById('reset-confirm-input')?.focus();
  }, 350);

  // ── Bind modal events ──
  const confirmInput = document.getElementById('reset-confirm-input');
  const confirmBtn = document.getElementById('reset-confirm-btn');
  const cancelBtn = document.getElementById('reset-cancel-btn');
  const modal = document.getElementById('reset-modal');

  // Real-time input validation
  confirmInput?.addEventListener('input', () => {
    const isMatch = confirmInput.value.trim() === 'RESET';
    confirmBtn?.classList.toggle('is-enabled', isMatch);
    confirmInput.classList.toggle('is-matched', isMatch);
  });

  // Enter key to submit
  confirmInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (confirmInput.value.trim() === 'RESET') {
        executeReset(overlay);
      } else {
        // Shake the modal to indicate wrong input
        modal?.classList.add('shake');
        setTimeout(() => modal?.classList.remove('shake'), 400);
      }
    }
  });

  // Confirm button click
  confirmBtn?.addEventListener('click', () => {
    if (confirmInput?.value.trim() === 'RESET') {
      executeReset(overlay);
    } else {
      modal?.classList.add('shake');
      setTimeout(() => modal?.classList.remove('shake'), 400);
    }
  });

  // Cancel button
  cancelBtn?.addEventListener('click', () => closeModal(overlay));

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay);
  });

  // Escape key to close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal(overlay);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close a modal overlay with animation.
 */
function closeModal(overlay) {
  overlay.classList.remove('is-visible');
  setTimeout(() => overlay.remove(), 350);
}

function ensureToastContainer() {
  let container = document.getElementById('vs-toast-container');
  if (container) return container;

  container = document.createElement('div');
  container.id = 'vs-toast-container';
  container.className = 'vs-toast-container';
  document.body.appendChild(container);
  return container;
}

function showToast(message, type = 'success', timeout = 3200) {
  if (!message) return;
  const container = ensureToastContainer();

  const toast = document.createElement('div');
  const safeType = ['success', 'error', 'warning'].includes(type) ? type : 'success';
  toast.className = `vs-toast vs-toast-${safeType}`;
  toast.innerHTML = `<span>${escapeHtml(String(message))}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    setTimeout(() => toast.remove(), 220);
  }, timeout);
}
window.showToast = showToast;

/**
 * Show a toast with an optional action button (e.g., "Review with AI →").
 * The toast stays longer and includes a clickable action.
 */
function showToastWithAction(message, actionLabel, onAction, type = 'success') {
  if (!message) return;
  const container = ensureToastContainer();

  const toast = document.createElement('div');
  const safeType = ['success', 'error', 'warning'].includes(type) ? type : 'success';
  toast.className = `vs-toast vs-toast-${safeType}`;
  toast.style.cursor = 'default';
  toast.innerHTML = `
    <span>${escapeHtml(String(message))}</span>
    <button type="button" class="vs-toast-action" style="
      margin-left: 12px;
      background: none;
      border: none;
      color: inherit;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
      font-size: inherit;
      padding: 0;
      opacity: 0.9;
    ">${escapeHtml(actionLabel)}</button>
  `;

  toast.querySelector('.vs-toast-action')?.addEventListener('click', (e) => {
    e.stopPropagation();
    onAction();
    toast.remove();
  });

  container.appendChild(toast);

  // Longer timeout since user may need time to read and click
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    setTimeout(() => toast.remove(), 220);
  }, 8000);
}

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

function showConfirmModal({
  title = 'Confirm Action',
  description = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
}) {
  return new Promise((resolve) => {
    const existing = document.getElementById('vs-confirm-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'vs-confirm-overlay';
    overlay.className = 'vs-modal-overlay';
    overlay.innerHTML = `
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${escapeHtml(title)}</h2>
          <p class="vs-modal-desc">${escapeHtml(description)}</p>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-confirm-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">${escapeHtml(cancelLabel)}</button>
          <button id="vs-confirm-ok" class="vs-btn ${danger ? 'vs-btn-danger' : 'vs-btn-primary'} vs-btn-sm" type="button">${escapeHtml(confirmLabel)}</button>
        </div>
      </div>
    `;

    const close = (value) => {
      closeModal(overlay);
      resolve(value);
    };

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-visible'));

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close(false);
    });
    document.getElementById('vs-confirm-cancel')?.addEventListener('click', () => close(false));
    document.getElementById('vs-confirm-ok')?.addEventListener('click', () => close(true));
  });
}

function showPromptModal({
  title = 'Enter Value',
  description = '',
  label = 'Value',
  placeholder = '',
  initialValue = '',
  confirmLabel = 'Continue',
}) {
  return new Promise((resolve) => {
    const existing = document.getElementById('vs-prompt-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'vs-prompt-overlay';
    overlay.className = 'vs-modal-overlay';
    overlay.innerHTML = `
      <div class="vs-modal" style="max-width: 560px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${escapeHtml(title)}</h2>
          ${description ? `<p class="vs-modal-desc">${escapeHtml(description)}</p>` : ''}
        </div>
        <div class="vs-modal-body">
          <label class="block text-sm text-vs-text-secondary mb-1">${escapeHtml(label)}</label>
          <input id="vs-prompt-input" type="text" class="vs-input w-full" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(initialValue)}">
        </div>
        <div class="vs-modal-footer">
          <button id="vs-prompt-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-prompt-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${escapeHtml(confirmLabel)}</button>
        </div>
      </div>
    `;

    const close = (value) => {
      closeModal(overlay);
      resolve(value);
    };

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('is-visible'));

    const input = overlay.querySelector('#vs-prompt-input');
    setTimeout(() => input?.focus(), 220);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close(null);
    });
    overlay.querySelector('#vs-prompt-cancel')?.addEventListener('click', () => close(null));
    overlay.querySelector('#vs-prompt-ok')?.addEventListener('click', () => {
      close((input?.value || '').trim());
    });
    input?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        close((input?.value || '').trim());
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        close(null);
      }
    });
  });
}

function getCodeLanguage(path = '') {
  const lower = String(path || '').toLowerCase();
  if (lower.endsWith('.php')) return 'php';
  if (lower.endsWith('.css')) return 'css';
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.js')) return 'javascript';
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
  if (lower.endsWith('.md')) return 'markdown';
  return 'javascript';
}

// ═══════════════════════════════════════════
//  Editor Page (VS Code-style)
// ═══════════════════════════════════════════

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
    expandedSections: new Set(saved?.expandedSections || ['site', 'prompts']),
    // Paths to restore after init
    _pendingRestore: saved ? { tabs: saved.openTabs || [], active: saved.activeTab } : null,
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
        if (isProtected) {
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
    const promptsHeader = document.querySelector('[data-section="prompts"]');

    if (siteHeader) updateSectionState('site', treeEl, siteHeader);
    if (promptsHeader && treePromptsEl) updateSectionState('prompts', treePromptsEl, promptsHeader);

    treeEl.innerHTML = renderItems(editorState.treeData.site);
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
      editorState.monacoInstance.updateOptions({ readOnly: isFileReadonly(path) });
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
      sendPreviewMessage('voxelsite:reload-css');
    } else {
      sendPreviewMessage('voxelsite:reload');
    }
    setTimeout(() => refreshPreview(), 400);
    refreshPublishState({ silent: true });

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
    
    // Split logically rather than storing one combined state
    editorState.treeData = {
      site: buildTree(data.files.filter(f => !f.path.startsWith('_prompts/'))),
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
  return document.documentElement.getAttribute('data-theme') === 'studio' ? 'vs' : 'vs-dark';
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
      sendPreviewMessage('voxelsite:reload-css');
    } else {
      sendPreviewMessage('voxelsite:reload');
    }
    // Hard-refresh the preview to guarantee the user sees changes immediately
    setTimeout(() => refreshPreview(), 400);
    refreshPublishState({ silent: true });

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

/**
 * Execute the site reset API call.
 */
async function executeReset(overlay) {
  const confirmBtn = document.getElementById('reset-confirm-btn');
  const confirmInput = document.getElementById('reset-confirm-input');

  if (!confirmBtn) return;

  // Loading state
  confirmBtn.classList.add('is-loading');
  confirmBtn.classList.remove('is-enabled');
  confirmBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Resetting…
  `;
  if (confirmInput) confirmInput.disabled = true;

  try {
    const { ok, data, error } = await api.post('/site/reset', { confirm: 'RESET' });

    if (ok) {
      // Clear in-memory state so the chat shows "no site" empty state
      store.set('pages', []);
      store.set('hasFormSchemas', false);
      store.set('conversations', null);
      store.set('activeConversationId', null);
      // Clear persisted conversation ID from localStorage
      try { localStorage.removeItem('vs-active-conversation'); } catch (_) {}

      // Reset publish state so footer doesn't show stale "unpublished changes"
      if (window.__vsPublishState) {
        window.__vsPublishState.hasChanges = false;
        window.__vsPublishState.counts = { added: 0, modified: 0, deleted: 0 };
        window.__vsPublishState.error = null;
      }
      applyPublishStateUi();
      // Refresh from server asynchronously
      refreshPublishState({ silent: true });

      // Success — show brief confirmation, then redirect
      confirmBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `;
      confirmBtn.style.background = 'var(--vs-success)';
      confirmBtn.style.opacity = '1';

      // Close and redirect after brief pause
      setTimeout(() => {
        closeModal(overlay);
        // Navigate to chat — the user will see a blank state ready for create_site
        if (window.location.hash !== '#/chat') {
          window.location.hash = '#/chat';
        } else {
          // Force re-render if already on chat
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      }, 800);
    } else {
      // Error — restore button
      confirmBtn.classList.remove('is-loading');
      confirmBtn.classList.add('is-enabled');
      confirmBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Everything
      `;
      if (confirmInput) confirmInput.disabled = false;

      // Show error briefly
      const desc = overlay.querySelector('.vs-modal-desc');
      if (desc) {
        const originalText = desc.textContent;
        desc.textContent = error?.message || 'Reset failed. Please try again.';
        desc.style.color = 'var(--vs-error)';
        setTimeout(() => {
          desc.textContent = originalText;
          desc.style.color = '';
        }, 4000);
      }
    }
  } catch (err) {
    confirmBtn.classList.remove('is-loading');
    confirmBtn.classList.add('is-enabled');
    confirmBtn.textContent = 'Reset Everything';
    if (confirmInput) confirmInput.disabled = false;
  }
}

/**
 * Fetch models using the stored API key, then populate the dropdown.
 */
async function autoLoadModels(savedModel) {
  const modelSelect = document.getElementById('set-ai-model');
  if (!modelSelect) return;

  try {
    const { ok, data } = await api.get('/settings/models');

    if (ok && data?.models?.length) {
      modelSelect.innerHTML = data.models.map(m =>
        `<option value="${escapeHtml(m.id)}" ${m.id === savedModel ? 'selected' : ''}>${escapeHtml(m.name || m.id)}</option>`
      ).join('');
    } else {
      modelSelect.innerHTML = '<option value="">Test your connection to load available models</option>';
    }
  } catch {
    modelSelect.innerHTML = '<option value="">Test your connection to load available models</option>';
  }
}

function renderSysRow(label, value) {
  return `
    <div class="vs-sys-item">
      <span class="vs-sys-label">${label}</span>
      <span class="vs-sys-value">${value}</span>
    </div>
  `;
}

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '?';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

function bindSettingsEvents(currentSettings, providers) {
  let selectedProvider = currentSettings.ai_provider || 'claude';

  // Provider change — reload the page to refresh config fields
  const providerSelect = document.getElementById('set-ai-provider');
  if (providerSelect) {
    providerSelect.addEventListener('change', async (e) => {
      selectedProvider = e.target.value;
      // Save the provider change immediately, then reload settings
      await api.put('/settings', { ai_provider: selectedProvider });
      loadSettings();
    });
  }

  // Test API connection — also fetches live models
  const testBtn = document.getElementById('btn-test-api');
  const apiKeyInput = document.getElementById('set-api-key');

  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      const key = apiKeyInput?.value?.trim() || '';
      const baseUrl = document.getElementById('set-base-url')?.value?.trim() || '';

      // For non-compatible providers, require a real key
      if (selectedProvider !== 'openai_compatible' && (!key || key.startsWith('••'))) {
        showApiStatus('Enter a new API key to test.', 'warning');
        return;
      }

      testBtn.textContent = 'Testing...';
      testBtn.disabled = true;

      const { ok, data, error } = await api.post('/settings/test-api', {
        provider: selectedProvider,
        api_key: key.startsWith('••') ? '' : key,
        base_url: baseUrl,
      });

      testBtn.textContent = 'Test Connection';
      testBtn.disabled = false;

      if (ok) {
        showApiStatus('✓ Connected successfully!', 'success');
        // Update model dropdown with live models
        if (data?.models?.length) {
          const modelSelect = document.getElementById('set-ai-model');
          if (modelSelect) {
            const currentModel = currentSettings[`ai_${selectedProvider}_model`] || '';
            modelSelect.innerHTML = data.models.map(m =>
              `<option value="${escapeHtml(m.id)}" ${m.id === currentModel ? 'selected' : ''}>${escapeHtml(m.name || m.id)}</option>`
            ).join('');
          }
        }
      } else {
        showApiStatus('✗ ' + (error?.message || 'Connection failed.'), 'error');
      }
    });
  }

  // Save Site Identity
  const identityBtn = document.getElementById('btn-save-identity');
  const identityStatus = document.getElementById('save-identity-status');

  if (identityBtn) {
    identityBtn.addEventListener('click', async () => {
      identityBtn.textContent = 'Saving...';
      identityBtn.disabled = true;

      const updates = {
        site_name: document.getElementById('set-site-name')?.value?.trim() || '',
        site_tagline: document.getElementById('set-site-tagline')?.value?.trim() || '',
      };

      const { ok, error } = await api.put('/settings', updates);

      identityBtn.textContent = 'Save Identity';
      identityBtn.disabled = false;

      if (identityStatus) {
        identityStatus.classList.remove('hidden');
        if (ok) {
          identityStatus.textContent = '✓ Saved';
          identityStatus.className = 'text-xs text-vs-success ml-3';
        } else {
          identityStatus.textContent = '✗ ' + (error?.message || 'Failed to save.');
          identityStatus.className = 'text-xs text-vs-error ml-3';
        }
        setTimeout(() => identityStatus?.classList.add('hidden'), 3000);
      }
    });
  }

  // Save AI Provider settings
  const saveBtn = document.getElementById('btn-save-settings');
  const saveStatus = document.getElementById('save-status');

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      saveBtn.textContent = 'Saving...';
      saveBtn.disabled = true;

      const updates = {
        ai_provider: selectedProvider,
        [`ai_${selectedProvider}_model`]: document.getElementById('set-ai-model')?.value || '',
        ai_max_tokens: parseInt(document.getElementById('set-max-tokens')?.value || '32000', 10),
      };

      // Base URL for OpenAI Compatible
      const baseUrlInput = document.getElementById('set-base-url');
      if (baseUrlInput) {
        updates.ai_openai_compatible_base_url = baseUrlInput.value.trim();
      }

      // Only send API key if it was changed (not the masked value)
      const apiKey = apiKeyInput?.value?.trim();
      if (apiKey && !apiKey.startsWith('••')) {
        updates[`ai_${selectedProvider}_api_key`] = apiKey;
      }

      const { ok, error } = await api.put('/settings', updates);

      saveBtn.textContent = 'Save Settings';
      saveBtn.disabled = false;

      if (saveStatus) {
        saveStatus.classList.remove('hidden');
        if (ok) {
          saveStatus.textContent = '✓ Saved';
          saveStatus.className = 'text-xs text-vs-success ml-3';
        } else {
          saveStatus.textContent = '✗ ' + (error?.message || 'Failed to save.');
          saveStatus.className = 'text-xs text-vs-error ml-3';
        }
        setTimeout(() => saveStatus?.classList.add('hidden'), 3000);
      }
    });
  }
}

// ─── Email Settings Events ────────────────────

function bindEmailSettingsEvents(mailConfig, presets) {
  const driverSelect = document.getElementById('set-mail-driver');
  const smtpFields = document.getElementById('mail-smtp-fields');
  const mailpitFields = document.getElementById('mail-mailpit-fields');
  const presetSelect = document.getElementById('set-smtp-preset');
  const presetHelp = document.getElementById('smtp-preset-help');

  // Try to detect which preset matches current config
  function detectPreset() {
    if (!mailConfig.smtp_host) return 'gmail';
    for (const [key, p] of Object.entries(presets)) {
      if (p.host && p.host === mailConfig.smtp_host) return key;
    }
    return 'custom';
  }

  // Set initial preset selection
  if (presetSelect) {
    const detected = detectPreset();
    presetSelect.value = detected;
    if (presetHelp && presets[detected]?.help) {
      presetHelp.textContent = presets[detected].help;
    }
  }

  // Driver change — toggle field visibility
  if (driverSelect) {
    driverSelect.addEventListener('change', () => {
      const driver = driverSelect.value;
      if (smtpFields) smtpFields.style.display = driver === 'smtp' ? 'block' : 'none';
      if (mailpitFields) mailpitFields.style.display = driver === 'mailpit' ? 'block' : 'none';
      const commonFields = document.getElementById('mail-common-fields');
      if (commonFields) commonFields.style.display = driver === 'none' ? 'none' : 'block';
    });
  }

  // Preset change — auto-fill SMTP fields
  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const preset = presets[presetSelect.value];
      if (!preset) return;

      const hostInput = document.getElementById('set-smtp-host');
      const portInput = document.getElementById('set-smtp-port');
      const encInput = document.getElementById('set-smtp-encryption');

      if (hostInput) hostInput.value = preset.host || '';
      if (portInput) portInput.value = preset.port || 587;
      if (encInput) encInput.value = preset.encryption || 'tls';
      if (presetHelp) presetHelp.textContent = preset.help || '';
    });
  }

  // Password visibility toggle
  const togglePassBtn = document.getElementById('btn-toggle-smtp-pass');
  const passInput = document.getElementById('set-smtp-password');
  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPassword = passInput.type === 'password';
      passInput.type = isPassword ? 'text' : 'password';
      togglePassBtn.innerHTML = isPassword
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    });
  }

  // Test email
  const testBtn = document.getElementById('btn-mail-test');
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      const recipient = document.getElementById('set-mail-test-recipient')?.value?.trim();
      if (!recipient) {
        showMailTestStatus('Enter an email address to send the test to.', 'warning');
        return;
      }

      testBtn.textContent = 'Sending...';
      testBtn.disabled = true;

      const formData = collectMailFormData();
      formData.test_recipient = recipient;

      const { ok, data, error } = await api.post('/settings/mail/test', formData);

      testBtn.textContent = 'Send Test';
      testBtn.disabled = false;

      if (ok) {
        showMailTestStatus('✓ ' + (data?.message || 'Test email sent successfully!'), 'success');
      } else {
        showMailTestStatus('✗ ' + (error?.message || 'Test failed.'), 'error');
      }
    });
  }

  // Save email settings
  const saveMailBtn = document.getElementById('btn-save-mail');
  const saveMailStatus = document.getElementById('save-mail-status');

  if (saveMailBtn) {
    saveMailBtn.addEventListener('click', async () => {
      saveMailBtn.textContent = 'Saving...';
      saveMailBtn.disabled = true;

      const formData = collectMailFormData();

      const { ok, error } = await api.post('/settings/mail', formData);

      saveMailBtn.textContent = 'Save Email Settings';
      saveMailBtn.disabled = false;

      if (saveMailStatus) {
        saveMailStatus.classList.remove('hidden');
        if (ok) {
          saveMailStatus.textContent = '✓ Saved';
          saveMailStatus.className = 'text-xs text-vs-success ml-3';
        } else {
          saveMailStatus.textContent = '✗ ' + (error?.message || 'Failed to save.');
          saveMailStatus.className = 'text-xs text-vs-error ml-3';
        }
        setTimeout(() => saveMailStatus?.classList.add('hidden'), 3000);
      }
    });
  }
}

function collectMailFormData() {
  const password = document.getElementById('set-smtp-password')?.value || '';
  return {
    driver: document.getElementById('set-mail-driver')?.value || 'none',
    from_address: document.getElementById('set-mail-from-address')?.value?.trim() || '',
    from_name: document.getElementById('set-mail-from-name')?.value?.trim() || '',
    smtp_host: document.getElementById('set-smtp-host')?.value?.trim() || '',
    smtp_port: parseInt(document.getElementById('set-smtp-port')?.value || '587', 10),
    smtp_username: document.getElementById('set-smtp-username')?.value?.trim() || '',
    smtp_password: password.startsWith('••') ? '' : password,
    smtp_encryption: document.getElementById('set-smtp-encryption')?.value || 'tls',
    mailpit_host: document.getElementById('set-mailpit-host')?.value?.trim() || 'localhost',
    mailpit_port: parseInt(document.getElementById('set-mailpit-port')?.value || '1025', 10),
  };
}

function showMailTestStatus(message, type) {
  const el = document.getElementById('mail-test-status');
  if (!el) return;
  el.classList.remove('hidden');
  el.textContent = message;
  el.className = `text-xs mt-1.5 ${
    type === 'success' ? 'text-vs-success' :
    type === 'error' ? 'text-vs-error' :
    'text-vs-warning'
  }`;
}

function showApiStatus(message, type) {
  const el = document.getElementById('api-key-status');
  if (!el) return;
  el.classList.remove('hidden');
  el.textContent = message;
  el.className = `text-xs mt-1.5 ${
    type === 'success' ? 'text-vs-success' :
    type === 'error' ? 'text-vs-error' :
    'text-vs-warning'
  }`;
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
        <div class="space-y-4">
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
        <div class="space-y-4">
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
      <div id="assets-grid" class="space-y-2">
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
    if (statusEl) {
      statusEl.textContent = result.ok
        ? `✓ ${result.data?.uploaded?.length || 0} file(s) uploaded`
        : '✗ ' + (result.error?.message || 'Upload failed');
      setTimeout(() => { if (statusEl) statusEl.textContent = 'Ready'; }, 4000);
    }
  } catch (e) {
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
        <div class="space-y-4">
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
  new:      { bg: 'var(--vs-warning-dim)', text: 'var(--vs-warning)',  label: 'New' },
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
    <div class="space-y-3">
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
        <span class="vs-form-stat-value" style="color: var(--vs-warning)">${stats.new || 0}</span>
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
        <a href="/_studio/api/router.php?_path=%2Fforms%2F${encodeURIComponent(formId)}%2Fsubmissions%2Fexport" target="_blank" class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-export-csv">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </a>
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
    <div class="space-y-2" id="submissions-list">
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
    // User message
    messagesHtml += `
      <div class="mb-5">
        <div class="text-xs text-vs-text-ghost mb-1 font-medium">You</div>
        <div class="text-sm text-vs-text-primary leading-relaxed">${escapeHtml(prompt.user_prompt)}</div>
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
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/>
          <path d="M12 22V12"/>
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
        <span id="publish-state-label" class="text-2xs text-vs-text-ghost">Checking changes...</span>
        <button id="btn-publish"
          class="vs-btn vs-btn-primary vs-btn-xs">
          ${icons.publish} Publish
        </button>
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
        <div class="px-4 py-3 border-b border-vs-border-subtle">
          <input id="command-palette-input" type="text" autocomplete="off"
            class="w-full bg-transparent text-sm text-vs-text-primary placeholder:text-vs-text-ghost focus:outline-none"
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
        <div class="flex items-center gap-1.5 px-1 py-0.5 rounded-xl ${isActive ? 'bg-vs-bg-inset' : ''}">
          <button type="button"
            data-command-index="${globalIndex}"
            class="flex-1 text-left px-2 py-2 rounded-lg transition-colors ${isActive ? '' : 'hover:bg-vs-bg-inset/70'}">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="text-sm text-vs-text-secondary truncate">${escapeHtml(cmd.title)}</div>
                <div class="text-xs text-vs-text-ghost truncate" style="max-width:420px">${escapeHtml(cmd.prompt ? cmd.prompt.substring(0, 80) + (cmd.prompt.length > 80 ? '…' : '') : cmd.meta)}</div>
              </div>
            </div>
          </button>
          <button type="button"
            data-command-pin="${escapeHtml(cmd.id)}"
            class="w-7 h-7 inline-flex items-center justify-center rounded-md text-xs ${isPinned ? 'text-vs-accent' : 'text-vs-text-ghost hover:text-vs-text-secondary'}"
            title="${isPinned ? 'Unpin command' : 'Pin command'}">
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
      <div class="space-y-4">
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
      <div class="space-y-4">
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
      <div class="space-y-4">
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
      const isForge = newTheme === 'forge';
      themeBtn.innerHTML = isForge ? icons.sun : icons.moon;
      themeBtn.title = isForge ? 'Switch to light' : 'Switch to dark';

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
    document.addEventListener('click', () => dropdown.classList.add('hidden'), { once: true });
  }

  // Edit Profile link — close dropdown on click
  const editProfileBtn = document.getElementById('btn-edit-profile');
  if (editProfileBtn && dropdown) {
    editProfileBtn.addEventListener('click', () => {
      dropdown.classList.add('hidden');
    });
  }

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
    undoStatusBtn.addEventListener('click', () => performUndo());
  }

  const redoStatusBtn = document.getElementById('btn-redo-status');
  if (redoStatusBtn) {
    redoStatusBtn.addEventListener('click', () => performRedo());
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

  // ── Status Bar: Publish ──
  const publishBtn = document.getElementById('btn-publish');
  if (publishBtn) {
    applyPublishStateUi();

    publishBtn.addEventListener('click', async () => {
      const publishState = ensurePublishState();
      if (publishState.publishing) return;

      if (publishState.hasChanges === false) {
        showToast('No unpublished changes to publish.', 'warning');
        return;
      }

      const counts = publishState.counts || { added: 0, modified: 0, deleted: 0 };
      const totalChanges = Number(counts.added || 0) + Number(counts.modified || 0) + Number(counts.deleted || 0);

      const confirmed = await showConfirmModal({
        title: 'Publish Website',
        description: totalChanges > 0
          ? `A snapshot will be created automatically before publishing. ${totalChanges} unpublished change(s) will go live.`
          : 'A snapshot will be created automatically before publishing.',
        confirmLabel: 'Publish',
      });
      if (!confirmed) {
        return;
      }

      publishState.publishing = true;
      applyPublishStateUi();
      setStatusText('Publishing...');

      const { ok, data, error } = await api.post('/publish');
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
  const labelEl = document.getElementById('publish-state-label');
  if (!publishBtn) return;

  const counts = state.counts || { added: 0, modified: 0, deleted: 0 };
  const totalChanges = Number(counts.added || 0) + Number(counts.modified || 0) + Number(counts.deleted || 0);

  if (state.publishing) {
    publishBtn.disabled = true;
    publishBtn.innerHTML = `${icons.publish} Publishing...`;
    if (labelEl) {
      labelEl.textContent = 'Publishing changes...';
      labelEl.className = 'text-2xs text-vs-text-tertiary';
    }
    return;
  }

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
    if (labelEl) {
      const suffix = totalChanges === 1 ? '' : 's';
      labelEl.textContent = `${totalChanges} unpublished change${suffix}`;
      labelEl.className = 'text-2xs text-vs-warning';
    }
    return;
  }

  publishBtn.disabled = true;
  publishBtn.innerHTML = `${icons.publish} Up to date`;
  publishBtn.classList.remove('vs-btn-primary');
  publishBtn.classList.add('vs-btn-ghost');
  if (labelEl) {
    labelEl.textContent = 'No unpublished changes';
    labelEl.className = 'text-2xs text-vs-text-ghost';
  }
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
//  Send Message Handler
// ═══════════════════════════════════════════

async function handleSend() {
  const input = document.getElementById('prompt-input');
  if (!input) return;

  const prompt = input.value.trim();
  if (!prompt) return;

  // Don't allow sending while streaming
  if (store.get('aiStreaming')) return;

  input.value = '';
  input.style.height = 'auto';

  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;

  // ── Show user message (right-aligned bubble) ──
  const userMsgHtml = `
    <div class="vs-msg-user mb-6 mt-4">
      <div class="vs-msg-user-bubble">${escapeHtml(prompt)}</div>
    </div>
  `;

  const streamId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

  // ── Prepare AI response area with typing indicator ──
  const aiMsgHtml = `
    <div class="vs-msg-ai mb-6" data-stream-id="${streamId}">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-vs-accent">${icons.box}</span>
        <span class="text-xs font-medium text-vs-text-tertiary">VoxelSite</span>
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

  // ── Stream the AI response ──
  await apiStream('/ai/prompt', {
    user_prompt: prompt,
    action_type: actionType,
    page_scope: store.get('activePageScope'),
    conversation_id: store.get('activeConversationId'),
  }, {
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

      chatMessages.scrollTop = chatMessages.scrollHeight;
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

      chatMessages.scrollTop = chatMessages.scrollHeight;
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

      // Handle truncation — the AI hit its token limit mid-generation
      if (result.truncated && contentEl) {
        const continueBtn = document.createElement('button');
        continueBtn.className = 'vs-btn vs-btn-primary vs-btn-sm mt-3';
        continueBtn.innerHTML = '↻ Continue generating...';
        continueBtn.addEventListener('click', () => {
          continueBtn.remove();
          const input = document.getElementById('prompt-input');
          if (input) {
            input.value = 'Continue from where you left off. Complete any unfinished files.';
            input.dataset.actionType = actionType;
            handleSend();
          }
        });
        contentEl.appendChild(continueBtn);
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

      chatMessages.scrollTop = chatMessages.scrollHeight;
    },

    onWarning(message) {
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
            <h1 class="vs-login-title">Enter the Studio</h1>
            <p class="vs-login-subtitle">Resume construction.</p>
          </div>

          <div id="login-error" class="hidden mb-5 px-4 py-3 bg-vs-error-dim text-vs-error text-sm rounded-xl border border-vs-error/10"></div>

          <form id="login-form" class="space-y-5">
            <div>
              <label class="vs-input-label">Email</label>
              <input id="login-email" type="email" required
                class="vs-input"
                placeholder="you@example.com">
            </div>

            <div>
              <div class="vs-login-field-header">
                <label class="vs-input-label">Password</label>
                <button type="button" id="btn-forgot" class="vs-login-forgot">Forgot?</button>
              </div>
              <div class="vs-login-password-wrap">
                <input id="login-password" type="password" required
                  class="vs-input"
                  placeholder="Your password">
                <button type="button" id="btn-toggle-pw" class="vs-login-eye" title="Show password">
                  ${icons.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">
              Open Studio
            </button>
          </form>

          <div class="vs-login-footer">
            <p>Your files. Your server. Your website.</p>
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
            <form id="forgot-form" class="space-y-5">
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
            <form id="forgot-form" class="space-y-5">
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
        <form id="token-reset-form" class="space-y-5">
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

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ═══════════════════════════════════════════
//  Boot
// ═══════════════════════════════════════════

init();
