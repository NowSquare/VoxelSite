import { api } from '../../../api.js';

/** Read durable apply state. Recovery never resubmits a mutation. */
export async function waitForPlanResult(planId, {
  read = path => api.get(path, { silent: true }),
  pause = () => new Promise(resolve => setTimeout(resolve, 1000)),
  attempts = 15,
} = {}) {
  let latest = {};
  for (let attempt = 0; attempt < attempts; attempt++) {
    const response = await read('/site-control/plans/' + encodeURIComponent(planId));
    if (response.ok && response.data) {
      latest = response.data;
      if (['applied', 'failed', 'ready', 'unknown'].includes(latest.status)) return latest;
    } else if (['forbidden', 'not_found', 'unauthorized'].includes(response.error?.code)) {
      break;
    }
    if (attempt + 1 < attempts) await pause();
  }
  return { ...latest, status: 'unknown' };
}
