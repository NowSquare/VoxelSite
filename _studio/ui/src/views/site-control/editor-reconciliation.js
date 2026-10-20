/** Reconcile Editor's persisted tabs while its workspace is unmounted. */
export function reconcileEditorPaths(moves = [], deleted = []) {
  try {
    const saved = JSON.parse(sessionStorage.getItem('vs-editor-state') || 'null');
    if (saved) {
      const remap = path => moves.find(move => move.oldFilePath === path)?.newFilePath || path;
      saved.openTabs = [...new Set((saved.openTabs || []).map(remap).filter(path => !deleted.includes(path)))];
      saved.activeTab = remap(saved.activeTab);
      if (!saved.openTabs.includes(saved.activeTab)) saved.activeTab = saved.openTabs[0] || null;
      sessionStorage.setItem('vs-editor-state', JSON.stringify(saved));
    }
  } catch { /* storage is optional */ }
  for (const move of moves) window.__vsEditorPage?.reconcileMove?.(move.oldFilePath, move.newFilePath);
  for (const path of deleted) window.__vsEditorPage?.reconcileDelete?.(path);
}
