<?php

declare(strict_types=1);

namespace VoxelSite;

/** Read-only Studio projection. Never return raw action data, prompts or candidates. */
final class RouterActivity
{
    public function __construct(private Database $db) {}

    public function recent(int $userId): array
    {
        try {
            $rows = $this->db->query("SELECT id, status, action_data, error_message, system_prompt_hash FROM prompt_log
                WHERE user_id = ? AND (action_data LIKE '%\"governor_enforce\"%'
                    OR action_data LIKE '%\"governor_shadow\"%' OR action_data LIKE '%\"governor_routing\"%') ORDER BY id DESC LIMIT 10", [$userId]);
            $items = [];
            foreach ($rows as $row) {
                $data = json_decode($row['action_data'] ?? '', true);
                if (!is_array($data)) { continue; }
                if (is_array($data['governor_routing'] ?? null)) {
                    $items[] = $this->routingItem($row, $data['governor_routing']);
                    continue;
                }
                $enforce = is_array($data['governor_enforce'] ?? null);
                $result = $enforce ? $data['governor_enforce'] : ($data['governor_shadow'] ?? null);
                if (!is_array($result)) { continue; }
                // Action data can originate in a request. Corroborate it against
                // server-written job state and ledger records before claiming a check.
                if ($enforce) {
                    if ($row['system_prompt_hash'] !== null) { continue; } // Legacy generator context.
                    $outcome = $result['status'] ?? null;
                    if (in_array($outcome, ['applied', 'answered', 'acknowledged'], true)) {
                        $kind = $outcome === 'applied' ? 'gate' : 'classify';
                        if ($row['status'] !== 'success' || !(int) $this->db->scalar(
                            "SELECT COUNT(*) FROM ai_call_ledger WHERE prompt_log_id = ? AND kind = ? AND provider = 'typesafe' AND status = 'success'",
                            [(int) $row['id'], $kind])) { continue; }
                    } elseif (!in_array($row['status'], ['error', 'cancelled'], true)
                        || !is_string($result['reason'] ?? null) || $result['reason'] !== $row['error_message']) { continue; }
                } elseif (!is_string($result['call_id'] ?? null) || !(int) $this->db->scalar(
                    "SELECT COUNT(*) FROM ai_call_ledger WHERE id = ? AND prompt_log_id = ? AND kind = 'classify' AND provider = 'typesafe'",
                    [$result['call_id'], (int) $row['id']])) { continue; }
                $route = $enforce ? ($result['route'] ?? []) : [];
                $pick = static fn($value, array $allowed) => in_array($value, $allowed, true) ? $value : 'unknown';
                $calls = $this->db->query("SELECT kind, provider, status FROM ai_call_ledger
                    WHERE prompt_log_id = ? AND kind IN ('generation', 'repair')", [(int) $row['id']]);
                $providers = [];
                foreach ($calls as $call) {
                    $providers[] = $pick($call['provider'], ['claude', 'openai', 'gemini', 'deepseek', 'openai_compatible']);
                }
                $items[] = [
                    'id' => (int) $row['id'], 'mode' => $enforce ? 'enforce' : 'shadow',
                    'status' => $pick($enforce ? ($result['status'] ?? null) : $row['status'],
                        ['applied', 'answered', 'acknowledged', 'rejected', 'clarify', 'success', 'error', 'streaming', 'partial', 'queued', 'cancelled']),
                               'reason' => $pick($result['reason'] ?? $result['error'] ?? null, [
                        'accepted', 'accepted_owner_override', 'question', 'noop', 'replace_text', 'governor_configuration', 'unsupported_action', 'unsupported_route',
                        'invalid_target', 'missing_address', 'ambiguous_address', 'invalid_request', 'explicit_replacement_required',
                        'content_changed', 'routing_uncertain', 'prompt_injection', 'forbidden_claims', 'gate_unavailable',
                        'gate_invalid', 'routing_unavailable', 'routing_invalid', 'ledger_unavailable', 'repair_limit_exhausted',
                        'generation_cancelled', 'identical_candidate', 'invalid_candidate', 'generation_failed', 'observation_unavailable']),
                    'intent' => $pick($route['intent'] ?? null, ['edit_copy', 'question', 'noop', 'replace_text']),
                    'requested_tier' => $pick($route['model_tier'] ?? null, ['none', 'cheap', 'frontier']),
                    // Attempted calls, including failures; never infer generation from a requested tier.
                    'generation_calls' => count($calls), 'providers' => array_values(array_unique($providers)),
                ];
            }
            return ['available' => true, 'items' => $items];
        } catch (\Throwable) {
            return ['available' => false, 'items' => []];
        }
    }
    /** Routing metadata is server-owned; expose only bounded choices, never target or prompt data. */
    private function routingItem(array $row, array $result): array
    {
        $pick = static fn($value, array $allowed) => in_array($value, $allowed, true) ? $value : 'unknown';
        $identifier = static fn($value) => is_string($value) && preg_match('~^[a-zA-Z0-9_.:/+\\-]{1,200}$~', $value)
            && !str_contains($value, '://') ? $value : 'unknown';
        $proposal = is_array($result['proposal'] ?? null) ? $result['proposal'] : $result;
        $calls = $this->db->query("SELECT provider, model FROM ai_call_ledger
            WHERE prompt_log_id = ? AND kind IN ('generation', 'repair')", [(int) $row['id']]);
        $models = [];
        foreach ($calls as $call) {
            $models[] = $identifier($call['model']);
        }
        return [
            'id' => (int) $row['id'], 'kind' => 'routing',
            'mode' => $pick($result['mode'] ?? null, ['off', 'shadow', 'enforce']),
            'status' => $pick($result['status'] ?? null, ['off', 'preview', 'routed', 'fallback']),
            'reason' => $pick($result['reason'] ?? null, ['off', 'configuration_error', 'classification_unavailable',
                'low_confidence', 'invalid_classification', 'unsafe_classification', 'ambiguous_write',
                'model_map_invalid', 'explicit_noop', 'explicit_replacement', 'unresolved_scope', 'context_too_large', 'model_map_missing', 'routed', 'preview', 'request_too_large']),
            'intent' => $pick($proposal['intent'] ?? null, ['new_site', 'add_page', 'edit_copy', 'edit_layout', 'theme', 'restyle', 'question', 'noop', 'replace_text']),
            'recipe' => $pick($proposal['recipe'] ?? null, ['create_site', 'import_site', 'restyle_site', 'edit_page', 'change_design', 'add_page',
                'optimize_aeo', 'section_edit', 'add_section', 'inline_edit', 'free_prompt', 'question', 'noop', 'replace_text']),
            'context' => $pick($proposal['context'] ?? null, ['legacy', 'focused', 'full', 'readonly']),
            'proposed_model' => $identifier($proposal['model'] ?? null),
            'models' => array_values(array_unique($models)), 'generation_calls' => count($calls),
        ];
    }

}
