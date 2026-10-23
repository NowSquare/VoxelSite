import { api } from '../api.js';
import { store } from '../state.js';
import { createFormsActionsApi } from './forms-actions-workspace.js';
import { showToastWithAction, showToast } from './ui/toasts.js';
export const formsActionsApi = createFormsActionsApi(api, {
  actor: () => store.get('user')?.id ?? null,
  onError(result, { retry }) {
    if (result.error?.code === 'network_error') showToastWithAction('Change not confirmed. The exact request is kept.', 'Retry change', retry, 'warning');
    else if (result.error?.code === 'content_conflict') showToast('This information changed elsewhere. Reload and review before saving.', 'warning');
  },
});
