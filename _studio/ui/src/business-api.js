import { api } from '../api.js';
import { store } from '../state.js';
import { createBusinessApi } from './business-workspace.js';
import { showToast, showToastWithAction } from './ui/toasts.js';
import { showConfirmModal } from './ui/modals.js';

export const businessApi = createBusinessApi(api, {
  actor: () => store.get('user')?.id ?? null,
  onError(result, { kind, id, retry }) {
    if (result.error?.code === 'network_error') {
      showToastWithAction('Save not confirmed. Your local text is kept.', 'Retry save', retry, 'warning');
    } else if (result.error?.code === 'content_conflict' && id) {
      showToastWithAction('This record changed elsewhere. Your local text is kept.', 'Review saved', async () => {
        const review = await businessApi.reviewSaved(kind, id, row => showConfirmModal({
          title: 'Load the saved version?',
          description: `This replaces your local edits. Saved title: ${row.title || 'Untitled'}\n\n${row.body.slice(0, 1500)}${row.body.length > 1500 ? '…' : ''}`,
          confirmLabel: 'Use saved version', cancelLabel: 'Keep local text',
        }));
        if (review.ok) window.dispatchEvent(new CustomEvent('vs:business-record-reloaded', { detail: { kind, id, record: review.data[kind === 'notes' ? 'note' : 'card'] } }));
        else if (!review.cancelled) showToast(review.error?.message || 'Could not load the saved version.', 'error');
      }, 'warning');
    } else {
      showToast(result.error?.message || 'Could not save. Your local text is kept.', 'error');
    }
  },
});

window.addEventListener('beforeunload', event => {
  if (!businessApi.hasDirty()) return;
  event.preventDefault(); event.returnValue = '';
});
