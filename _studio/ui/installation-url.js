const STUDIO_PATH = (() => {
  const pathname = globalThis.location?.pathname ?? globalThis.window?.location?.pathname ?? '/_studio/';
  const match = pathname.match(/^(\/(?:[a-zA-Z0-9._~!$&()+,;=@-]|%[a-fA-F0-9]{2}|\/)*)_studio(?:\/|$)/);
  if (!match) return '/_studio';
  try {
    if (decodeURIComponent(match[1]).split('/').some(part => part === '.' || part === '..' || /[\\\x00-\x20\x7f]/.test(part))) return '/_studio';
  } catch { return '/_studio'; }
  // An ampersand is a path character, never an HTML entity in a rendered link.
  return `${match[1].replaceAll('&', '%26')}_studio`;
})();

/** Resolve local Studio resources within the current installation. */
export function studioUrl(path = '') {
  return `${STUDIO_PATH}/${path.replace(/^\/+/, '')}`;
}

/** Preserve existing root-installation receipts while isolating nested sites. */
export function studioStorageKey(key) {
  return STUDIO_PATH === '/_studio' ? key : `${STUDIO_PATH}:${key}`;
}
