/** Preserve Site inspection focus when the workspace replaces its DOM. */
const selectionControls = [
  { selector: '.vs-site-tree-select[data-select-page]', attribute: 'data-select-page' },
  { selector: '.vs-site-card-body[data-select-page]', attribute: 'data-select-page' },
  { selector: '.vs-impact-item[data-node-id]', attribute: 'data-node-id' },
  { selector: '.vs-impact-ref-item[data-node-id]', attribute: 'data-node-id' },
];

export function captureSelectionFocus(root, activeElement) {
  if (!activeElement || !root.contains(activeElement)) return null;
  for (const control of selectionControls) {
    if (!activeElement.matches(control.selector)) continue;
    const value = activeElement.getAttribute(control.attribute);
    const peers = [...root.querySelectorAll(control.selector)].filter(element => element.getAttribute(control.attribute) === value);
    return { ...control, value, index: peers.indexOf(activeElement) };
  }
  return null;
}

export function restoreSelectionFocus(root, saved) {
  if (!saved) return;
  const peers = [...root.querySelectorAll(saved.selector)].filter(element => element.getAttribute(saved.attribute) === saved.value);
  peers[saved.index]?.focus({ preventScroll: true });
}
