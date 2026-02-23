import { store } from './state.js';

const THEME_ATTRIBUTE = 'data-theme';
const DEFAULT_THEME = 'dark';

export function initializeTheme() {
  const current = store.get('theme') || localStorage.getItem('vs-theme') || DEFAULT_THEME;
  applyTheme(current);
  return current;
}

export function applyTheme(theme) {
  const resolved = theme || DEFAULT_THEME;
  document.documentElement.setAttribute(THEME_ATTRIBUTE, resolved);
  localStorage.setItem('vs-theme', resolved);
  store.set('theme', resolved);
  return resolved;
}

export function toggleTheme() {
  const current = store.get('theme') || DEFAULT_THEME;
  return applyTheme(current === 'dark' ? 'light' : 'dark');
}
