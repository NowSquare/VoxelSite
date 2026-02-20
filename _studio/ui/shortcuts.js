/**
 * Bind keyboard shortcuts once, with light guardrails.
 *
 * @param {Record<string, (event: KeyboardEvent) => void>} map
 * Example keys: "meta+k", "ctrl+z", "meta+shift+z"
 */
export function bindShortcutMap(map) {
  if (!map || typeof map !== 'object') return;

  const normalize = (event) => {
    const parts = [];
    if (event.metaKey) parts.push('meta');
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    parts.push(String(event.key || '').toLowerCase());
    return parts.join('+');
  };

  document.addEventListener('keydown', (event) => {
    const key = normalize(event);
    const handler = map[key];
    if (!handler) return;
    handler(event);
  });
}
