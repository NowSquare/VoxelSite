<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, Settings, SiteWorkspace};

/** Bounded read models and explicitly requested diagnostic actions. */
final class DiagnosticsService
{
    public const MAX_LOG_BYTES = 8388608;
    public function __construct(private Database $db, private ActorPolicy $policy, private SiteWorkspace $workspace,
        private OperationStore $operations, private ?string $logsRoot = null, #[\SensitiveParameter] private ?string $appKey = null)
    { $this->logsRoot ??= dirname($workspace->draftRoot()) . '/logs'; }
    public static function inputSchema(string $method): array
    {
        if (in_array($method, ['logs_delete', 'history_delete', 'repair', 'cancel'], true)) return DiagnosticMutationService::inputSchema($method);
        $page = ['limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 50],
            'before_id' => ['type' => 'integer', 'minimum' => 1], 'max_bytes' => ['type' => 'integer', 'minimum' => 4096, 'maximum' => 65536]];
        $fields = match ($method) {
            'system' => [], 'usage' => ['all_users' => ['type' => 'boolean']],
            'history' => $page + ['conversation_id' => ['type' => 'string', 'maxLength' => 100]],
            'mail_log' => ['limit' => $page['limit']],
            'conversations' => ['limit' => $page['limit'], 'offset' => ['type' => 'integer', 'minimum' => 0, 'maximum' => 10000]],
            'conversation' => ['conversation_id' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 100],
                'limit' => $page['limit'], 'offset' => ['type' => 'integer', 'minimum' => 0, 'maximum' => 10000],
                'max_bytes' => ['type' => 'integer', 'minimum' => 8192, 'maximum' => 65536]],
            'logs' => ['limit' => $page['limit'], 'offset' => ['type' => 'integer', 'minimum' => 0, 'maximum' => 256],
                'inventory_version' => self::version()],
            'log_read' => ['file' => ['type' => 'string', 'pattern' => '^[A-Za-z0-9][A-Za-z0-9_.-]{0,100}\\.log$'],
                'offset' => ['type' => 'integer', 'minimum' => 0, 'maximum' => self::MAX_LOG_BYTES],
                'max_bytes' => $page['max_bytes'], 'version' => self::version()],
            default => throw new \InvalidArgumentException('Unknown diagnostics operation.'),
        };
        $required = match ($method) { 'history' => ['limit', 'max_bytes'], 'conversation' => ['conversation_id', 'limit', 'max_bytes'],
            'logs', 'conversations' => ['limit'], 'log_read' => ['file', 'offset', 'max_bytes'], default => array_keys($fields) };
        return self::object($fields, $required);
    }
    public static function outputSchema(string $method): array
    {
        $s = ['type' => 'string']; $n = ['type' => 'integer']; $nullableInt = ['type' => ['integer', 'null']];
        return match ($method) {
            'system' => self::object(['php_version' => $s, 'sqlite_version' => $s, 'sapi' => $s,
                'memory_limit' => $s, 'max_execution_seconds' => $n, 'upload_max_bytes' => $n,
                'workspace_ready' => ['type' => 'boolean'], 'draft_version' => $n,
                'capabilities' => self::object(array_fill_keys(['curl', 'zip', 'openssl', 'fileinfo', 'mbstring'], ['type' => 'boolean'])),
                'provider_calls' => ['const' => 0]]),
            'usage' => self::object(['all_users' => ['type' => 'boolean'],
                'models' => ['type' => 'array', 'maxItems' => 200, 'items' => self::object(['model' => $s, 'requests' => $n,
                    'input_tokens' => $n, 'output_tokens' => $n, 'estimated_cost' => ['type' => 'number']])],
                'provider_calls' => ['const' => 0]]),
            'history' => self::object(['history' => ['type' => 'array', 'maxItems' => 50, 'items' => self::object([
                'id' => $n, 'version' => self::version(), 'conversation_id' => ['type' => ['string', 'null']], 'action_type' => ['type' => ['string', 'null']],
                'user_prompt' => $s, 'ai_message' => $s, 'status' => $s, 'created_at' => $s,
                'tokens_input' => $nullableInt, 'tokens_output' => $nullableInt, 'cost_estimate' => ['type' => ['number', 'null']],
                'files_modified' => ['type' => ['string', 'null']], 'interrupted' => ['type' => 'boolean'], 'truncated' => ['type' => 'boolean']])],
                'next_before_id' => $nullableInt, 'redacted' => ['const' => true], 'provider_calls' => ['const' => 0]]),
            'conversations' => self::object(['conversations' => ['type' => 'array', 'maxItems' => 50, 'items' => self::object([
                'id' => $s, 'title' => $s, 'page_scope' => ['type' => ['string', 'null']], 'is_active' => ['type' => 'boolean'],
                'created_at' => $s, 'updated_at' => $s])], 'next_offset' => $nullableInt, 'provider_calls' => ['const' => 0]]),
            'conversation' => self::object(['conversation' => self::object([
                'id' => $s, 'title' => $s, 'page_scope' => ['type' => ['string', 'null']], 'is_active' => ['type' => 'boolean'],
                'created_at' => $s, 'updated_at' => $s, 'draft_version' => $s,
                'prompts' => ['type' => 'array', 'maxItems' => 50, 'items' => self::object(
                    self::outputSchema('history')['properties']['history']['items']['properties'] + [
                        'evaluation_issues' => ['type' => ['string', 'null']], 'status_message' => ['type' => ['string', 'null']],
                        'last_progress_at' => ['type' => ['string', 'null']]])],
                'pagination' => self::object(['limit' => $n, 'offset' => $n, 'requested_offset' => $n, 'count' => $n,
                    'total' => $n, 'next_offset' => $nullableInt, 'truncated' => ['type' => 'boolean']])]),
                'redacted' => ['const' => true], 'provider_calls' => ['const' => 0]]),
            'logs' => self::object(['logs' => ['type' => 'array', 'maxItems' => 50, 'items' => self::object([
                'name' => $s, 'size' => $n, 'modified' => $n, 'readable' => ['type' => 'boolean']])],
                'inventory_version' => $s, 'next_offset' => $nullableInt, 'total' => $n, 'provider_calls' => ['const' => 0]]),
            'log_read' => self::object(['file' => $s, 'content' => $s, 'offset' => $n, 'next_offset' => $nullableInt,
                'total_bytes' => $n, 'version' => $s, 'redacted' => ['const' => true], 'provider_calls' => ['const' => 0]]),
            'mail_log' => self::object(['entries' => ['type' => 'array', 'maxItems' => 50, 'items' => self::object([
                'time' => $s, 'level' => $s, 'message' => $s])], 'redacted' => ['const' => true], 'provider_calls' => ['const' => 0]]),
            default => throw new \InvalidArgumentException('Unknown diagnostics output.'),
        };
    }
    public function system(OperationActor $actor): array
    {
        $this->policy->require($actor, ['diagnostics:read']);
        $state = $this->workspace->status(); $ready = true;
        try { $this->workspace->assertReady(); } catch (\Throwable) { $ready = false; }
        $limits = array_map(self::iniBytes(...), [ini_get('upload_max_filesize') ?: '0', ini_get('post_max_size') ?: '0']);
        return ['php_version' => PHP_VERSION, 'sqlite_version' => (string) $this->db->scalar('SELECT sqlite_version()'), 'sapi' => PHP_SAPI,
            'memory_limit' => (string) ini_get('memory_limit'), 'max_execution_seconds' => (int) ini_get('max_execution_time'),
            'upload_max_bytes' => min($limits), 'workspace_ready' => $ready, 'draft_version' => (int) $state['draft_version'],
            'capabilities' => array_combine(['curl', 'zip', 'openssl', 'fileinfo', 'mbstring'], array_map(extension_loaded(...), ['curl', 'zip', 'openssl', 'fileinfo', 'mbstring'])),
            'provider_calls' => 0];
    }
    public function usage(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('usage')); $this->policy->require($actor, ['history:read']);
        if ($input->all_users) $this->policy->require($actor, ['diagnostics:read']);
        $where = $input->all_users ? '' : ' AND user_id = ?'; $params = $input->all_users ? [] : [$actor->userId];
        $rows = $this->db->query("SELECT ai_model AS model, COUNT(*) AS requests, COALESCE(SUM(tokens_input),0) AS input_tokens,
            COALESCE(SUM(tokens_output),0) AS output_tokens, COALESCE(SUM(cost_estimate),0) AS estimated_cost
            FROM prompt_log WHERE (status IN ('success','partial') OR tokens_input > 0)" . $where . ' GROUP BY ai_model ORDER BY estimated_cost DESC LIMIT 201', $params);
        if (count($rows) > 200) throw new OperationException('size_limit', 'Usage inventory exceeds the supported model budget.');
        foreach ($rows as &$row) {
            $row['model'] = mb_substr((string) $row['model'], 0, 200);
            foreach (['requests', 'input_tokens', 'output_tokens'] as $key) $row[$key] = (int) $row[$key];
            $row['estimated_cost'] = (float) $row['estimated_cost'];
        }
        unset($row);
        return ['all_users' => $input->all_users, 'models' => (new DiagnosticRedactor($this->db, $this->appKey))->value($rows), 'provider_calls' => 0];
    }
    public function history(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('history')); $this->policy->require($actor, ['history:read']);
        $where = 'user_id = ?'; $params = [$actor->userId];
        if (isset($input->before_id)) { $where .= ' AND id < ?'; $params[] = $input->before_id; }
        if (isset($input->conversation_id)) { $where .= ' AND conversation_id = ?'; $params[] = $input->conversation_id; }
        // Bound database materialization before decoding or redacting logs.
        $rows = $this->db->query('SELECT id,conversation_id,action_type,
            CASE WHEN length(user_prompt) <= 65536 THEN user_prompt ELSE \'[Oversized prompt omitted]\' END AS user_prompt,
            CASE WHEN length(ai_response) <= 262144 THEN ai_response ELSE \'[Oversized response omitted]\' END AS ai_response,
            length(user_prompt) AS prompt_length,length(ai_response) AS response_length,
            status,created_at,last_progress_at,tokens_input,tokens_output,cost_estimate,
            CASE WHEN length(files_modified) <= 65536 THEN files_modified ELSE NULL END AS files_modified
            FROM prompt_log WHERE ' . $where . ' ORDER BY id DESC LIMIT ' . ($input->limit + 1), $params);
        $redactor = new DiagnosticRedactor($this->db, $this->appKey); $items = []; $bytes = 128;
        foreach (array_slice($rows, 0, $input->limit) as $row) {
            $item = ['id' => (int) $row['id'], 'version' => DiagnosticMutationService::promptVersion($row), 'conversation_id' => $row['conversation_id'], 'action_type' => $row['action_type'],
                'user_prompt' => mb_strcut($redactor->text((string) $row['user_prompt']), 0, 12000),
                'ai_message' => mb_strcut($redactor->text((new \VoxelSite\ResponseParser())->extractAssistantMessage((string) $row['ai_response'])), 0, 12000),
                'status' => $row['status'], 'created_at' => $row['created_at'],
                'tokens_input' => $row['tokens_input'] === null ? null : (int) $row['tokens_input'],
                'tokens_output' => $row['tokens_output'] === null ? null : (int) $row['tokens_output'],
                'cost_estimate' => $row['cost_estimate'] === null ? null : (float) $row['cost_estimate'],
                'files_modified' => $row['files_modified'] === null ? null : mb_strcut((string) $redactor->value($row['files_modified']), 0, 4000),
                'interrupted' => $row['status'] === 'streaming' && (strtotime($row['last_progress_at'] ?: $row['created_at']) ?: time()) < time() - 180,
                'truncated' => (int) $row['prompt_length'] > 12000 || (int) $row['response_length'] > 12000];
            if (strlen(CanonicalJson::encode($item)) + $bytes > $input->max_bytes) {
                if ($items !== []) break;
                $item['user_prompt'] = mb_strcut($item['user_prompt'], 0, 1000); $item['ai_message'] = mb_strcut($item['ai_message'], 0, 1000);
                $item['files_modified'] = null; $item['truncated'] = true;
                // JSON escapes can expand a source byte sixfold. Trim the
                // encoded response, rather than assuming character lengths fit.
                while (strlen(CanonicalJson::encode($item)) + $bytes > $input->max_bytes) {
                    $key = strlen($item['user_prompt']) >= strlen($item['ai_message']) ? 'user_prompt' : 'ai_message';
                    if ($item[$key] === '') throw new OperationException('size_limit', 'History metadata exceeds the response budget.');
                    $item[$key] = mb_strcut($item[$key], 0, (int) floor(strlen($item[$key]) / 2));
                }
            }
            $items[] = $item; $bytes += strlen(CanonicalJson::encode($item));
        }
        return ['history' => $items, 'next_before_id' => count($rows) > count($items) && $items ? end($items)['id'] : null, 'redacted' => true, 'provider_calls' => 0];
    }
    public function conversations(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('conversations')); $this->policy->require($actor, ['history:read']);
        $offset = $input->offset ?? 0;
        $rows = $this->db->query('SELECT id,CASE WHEN length(title) <= 65536 THEN title ELSE \'[Oversized title omitted]\' END AS title,page_scope,is_active,created_at,updated_at FROM conversations
            WHERE user_id = ? ORDER BY updated_at DESC,id LIMIT ' . ($input->limit + 1) . ' OFFSET ' . $offset, [$actor->userId]);
        $items = array_slice($rows, 0, $input->limit);
        $redactor = new DiagnosticRedactor($this->db, $this->appKey);
        foreach ($items as &$item) { $item['is_active'] = (bool) $item['is_active']; $item['title'] = mb_strcut($redactor->text($item['title']), 0, 300); }
        unset($item);
        return ['conversations' => $redactor->value($items),
            'next_offset' => count($rows) > count($items) ? $offset + count($items) : null, 'provider_calls' => 0];
    }
    /** The Studio conversation view and external diagnostics share one bounded read. */
    public function conversation(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('conversation'));
        $this->policy->require($actor, ['history:read']);
        $row = $this->db->queryOne("SELECT id,substr(title,1,300) AS title,substr(page_scope,1,1000) AS page_scope,
            is_active,created_at,updated_at FROM conversations WHERE id=? AND user_id=?", [$input->conversation_id, $actor->userId]);
        if (!$row) throw new OperationException('not_found', 'Conversation not found.');
        $redactor = new DiagnosticRedactor($this->db, $this->appKey);
        $row = $redactor->value($row); $row['is_active'] = (bool) $row['is_active'];
        $total = $this->db->count('prompt_log', 'conversation_id=? AND user_id=?', [$input->conversation_id, $actor->userId]);
        $requested = $input->offset ?? 0;
        $offset = $input->offset ?? max(0, $total - $input->limit);
        $ids = $this->db->query('SELECT id FROM prompt_log WHERE conversation_id=? AND user_id=? ORDER BY id ASC LIMIT ? OFFSET ?',
            [$input->conversation_id, $actor->userId, $input->limit, $offset]);
        $prompts = [];
        if ($ids) {
            $read = $this->history($actor, (object) ['conversation_id' => $input->conversation_id, 'limit' => count($ids),
                'before_id' => (int) end($ids)['id'] + 1, 'max_bytes' => $input->max_bytes - 4096]);
            $prompts = array_reverse($read['history']);
            foreach ($prompts as &$prompt) {
                $extra = $this->db->queryOne("SELECT CASE WHEN length(evaluation_issues)<=8192 THEN evaluation_issues ELSE NULL END AS evaluation_issues,
                    substr(status_message,1,1000) AS status_message,last_progress_at FROM prompt_log WHERE id=? AND user_id=?",
                    [$prompt['id'], $actor->userId]);
                $prompt += $redactor->value($extra);
            }
            unset($prompt);
            $offset += count($ids) - count($prompts);
        }
        $row['draft_version'] = 'draft:' . $this->workspace->status()['draft_version'];
        do {
            $row['prompts'] = $prompts;
            $next = $offset + count($prompts);
            $row['pagination'] = ['limit' => $input->limit, 'offset' => $offset, 'requested_offset' => $requested,
                'count' => count($prompts), 'total' => $total, 'next_offset' => $next < $total ? $next : null,
                'truncated' => count($prompts) < count($ids)];
            $result = ['conversation' => $row, 'redacted' => true, 'provider_calls' => 0];
            if (strlen(CanonicalJson::encode($result)) <= $input->max_bytes) return $result;
            if (count($prompts) > 1) { array_shift($prompts); $offset++; continue; }
            if ($prompts && ($prompts[0]['evaluation_issues'] !== null || $prompts[0]['status_message'] !== null)) {
                $prompts[0]['evaluation_issues'] = $prompts[0]['status_message'] = null;
                $prompts[0]['truncated'] = true; continue;
            }
            throw new OperationException('size_limit', 'Conversation metadata exceeds the response budget.');
        } while (true);
    }
    public function logs(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('logs')); $this->policy->require($actor, ['diagnostics:read']);
        $items = []; $entries = 0;
        if (is_dir($this->logsRoot)) foreach (new \DirectoryIterator($this->logsRoot) as $entry) {
            if ($entry->isDot()) continue;
            if (++$entries > 256) throw new OperationException('size_limit', 'Log inventory exceeds its qualified budget.');
            if (!preg_match('/^[A-Za-z0-9][A-Za-z0-9_.-]{0,100}\\.log$/D', $entry->getFilename())) continue;
            $path = SiteWorkspace::resolveWithin($this->logsRoot, $entry->getFilename());
            if (!is_file($path)) continue;
            $items[] = ['name' => $entry->getFilename(), 'size' => filesize($path), 'modified' => filemtime($path), 'readable' => filesize($path) <= self::MAX_LOG_BYTES];
        }
        usort($items, fn($a, $b) => [$b['modified'], $b['name']] <=> [$a['modified'], $a['name']]);
        $version = CanonicalJson::digest($items); $offset = $input->offset ?? 0;
        if (($offset && !isset($input->inventory_version)) || (isset($input->inventory_version) && $input->inventory_version !== $version)) throw new OperationException('content_conflict', 'Logs changed. Restart the first page.');
        $slice = array_slice($items, $offset, $input->limit); $next = $offset + count($slice);
        return ['logs' => $slice, 'inventory_version' => $version, 'next_offset' => $next < count($items) ? $next : null, 'total' => count($items), 'provider_calls' => 0];
    }
    public function readLog(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('log_read')); $this->policy->require($actor, ['diagnostics:read']);
        [$safe, $version] = $this->logSnapshot($input->file);
        if (($input->offset > 0 && !isset($input->version)) || (isset($input->version) && $input->version !== $version)) throw new OperationException('content_conflict', 'The log changed. Restart its first page.');
        $content = mb_strcut($safe, $input->offset, max(1, (int) floor(($input->max_bytes - 512) / 6)), 'UTF-8');
        $next = $input->offset + strlen($content);
        return ['file' => $input->file, 'content' => $content, 'offset' => $input->offset,
            'next_offset' => $next < strlen($safe) ? $next : null, 'total_bytes' => strlen($safe), 'version' => $version,
            'redacted' => true, 'provider_calls' => 0];
    }
    /** HTTP attachment uses the identical bounded source and field redaction. */
    public function exportLog(OperationActor $actor, string $file): string
    {
        JsonSchema::validate((object) ['file' => $file, 'offset' => 0, 'max_bytes' => 4096], self::inputSchema('log_read'));
        $this->policy->require($actor, ['diagnostics:read']);
        return $this->logSnapshot($file)[0];
    }
    public function mailLog(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('mail_log')); $this->policy->require($actor, ['diagnostics:read']);
        $root = dirname($this->workspace->draftRoot()) . '/data';
        if (!file_exists(SiteWorkspace::resolveWithin($root, 'mail.log'))) return ['entries' => [], 'redacted' => true, 'provider_calls' => 0];
        [$safe] = $this->logSnapshot('mail.log', $root); $entries = [];
        foreach (array_slice(explode("\n", trim($safe)), -$input->limit) as $line) {
            if (preg_match('/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)] (.+)$/', $line, $m)) $entries[] = [
                'time' => $m[1], 'level' => $m[2], 'message' => mb_strcut($m[3], 0, 1000)];
        }
        return ['entries' => $entries, 'redacted' => true, 'provider_calls' => 0];
    }
    private function logSnapshot(string $file, ?string $root = null): array
    {
        $path = SiteWorkspace::resolveWithin($root ?? $this->logsRoot, $file);
        if (!is_file($path)) throw new OperationException('content_conflict', 'The log file is unavailable.');
        $size = filesize($path);
        if ($size > self::MAX_LOG_BYTES) throw new OperationException('size_limit', 'This log exceeds the qualified 8 MiB read budget. Rotate it before reading through Studio.');
        $raw = file_get_contents($path, false, null, 0, $size + 1);
        if (!is_string($raw) || strlen($raw) !== $size) throw new OperationException('content_conflict', 'The log changed while reading.');
        $safe = (new DiagnosticRedactor($this->db, $this->appKey))->text(mb_convert_encoding($raw, 'UTF-8', 'UTF-8'));
        $version = CanonicalJson::digest(['redacted' => $safe, 'bytes' => $size, 'mtime' => filemtime($path)]);
        return [$safe, $version];
    }
    public function mutate(OperationActor $actor, string $action, \stdClass $input): array
    { return $this->mutations()->execute($actor, $action, $input); }
    public function continue(OperationActor $actor, string $id, int $checkpoint): array
    { return $this->mutations()->continue($actor, $id, $checkpoint); }
    public function recover(OperationActor $actor, string $id): array
    { return $this->mutations()->recover($actor, $id); }
    public static function resultSchema(): array { return DiagnosticMutationService::resultSchema(); }
    private function mutations(): DiagnosticMutationService
    { return new DiagnosticMutationService($this->db, $this->policy, $this->workspace, $this->operations, $this->logsRoot, $this); }
    private static function iniBytes(string $value): int
    {
        $factor = match (strtolower(substr(trim($value), -1))) { 'g' => 1073741824, 'm' => 1048576, 'k' => 1024, default => 1 };
        return max(0, (int) $value * $factor);
    }
    private static function version(): array { return ['type' => 'string', 'pattern' => '^[a-f0-9]{64}$']; }
    private static function object(array $fields, ?array $required = null): array
    { return ['type' => 'object', 'properties' => $fields, 'required' => $required ?? array_keys($fields), 'additionalProperties' => false]; }
}
