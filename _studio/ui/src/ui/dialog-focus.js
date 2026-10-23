/** Keep keyboard focus in the active dialog and return it to its launcher. */
export function activateDialogFocus(dialog, { initialFocus, returnFocus = document.activeElement, onEscape } = {}) {
  let active = true;
  const available = element => element && !element.disabled && !element.closest('[hidden], [inert], [aria-hidden="true"]')
    && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
  const controls = () => [...dialog.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
    .filter(element => element.tabIndex >= 0 && available(element));
  const isTopDialog = () => {
    const dialogs = [...document.querySelectorAll('[role="dialog"], .vs-modal-overlay.is-visible')].filter(available);
    const top = dialogs.at(-1);
    return !top || top === dialog || top.contains(dialog) || dialog.contains(top);
  };
  const focusFirst = () => {
    const target = typeof initialFocus === 'function' ? initialFocus() : initialFocus;
    (available(target) ? target : controls()[0] || dialog).focus();
  };
  const onKeydown = event => {
    if (!active || !isTopDialog()) return;
    if (event.key === 'Escape' && onEscape) {
      event.preventDefault();
      event.stopImmediatePropagation();
      onEscape();
    } else if (event.key === 'Tab') {
      const items = controls();
      const first = items[0] || dialog;
      const last = items.at(-1) || dialog;
      if (!dialog.contains(document.activeElement) || document.activeElement === dialog || (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    }
  };
  const onFocus = event => {
    if (active && isTopDialog() && !dialog.contains(event.target)) focusFirst();
  };
  const release = ({ restoreFocus = true } = {}) => {
    if (!active) return;
    active = false;
    document.removeEventListener('keydown', onKeydown, true);
    document.removeEventListener('focusin', onFocus, true);
    observer.disconnect();
    const target = typeof returnFocus === 'function' ? returnFocus() : returnFocus;
    if (restoreFocus && target?.isConnected) target.focus();
  };
  const observer = new MutationObserver(() => {
    if (!dialog.isConnected) release({ restoreFocus: false });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('keydown', onKeydown, true);
  document.addEventListener('focusin', onFocus, true);
  focusFirst();
  return release;
}
