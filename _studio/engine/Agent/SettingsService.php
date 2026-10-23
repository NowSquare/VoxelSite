<?php
declare(strict_types=1);
namespace VoxelSite\Agent;
use VoxelSite\{Database, Encryption, Mailer, ModelCapabilitySettings, RouterSecrets, RouterSettings, Settings, SiteMutationLock, SiteWorkspace, Validator};

/** Typed configuration only. Reads and writes never test or discover providers. */
final class SettingsService
{
    private OperationRunner $runner;
    public function __construct(private Database $db, private ActorPolicy $policy, private SiteWorkspace $workspace,
        private OperationStore $operations, #[\SensitiveParameter] private ?string $appKey = null, private ?\Closure $mailTransport = null)
    {
        $this->runner = new OperationRunner($db, $policy, $operations, $workspace->mutationLockPath(), false);
    }
    public static function fields(string $group): array
    {
        $text = fn(int $max = 200) => ['type' => 'string', 'maxLength' => $max];
        $bool = ['type' => 'boolean']; $secret = ['type' => ['string', 'null'], 'maxLength' => 4096];
        $providers = ['claude', 'openai', 'gemini', 'deepseek', 'openai_compatible'];
        $model = ['type' => 'string', 'pattern' => '^[a-zA-Z0-9_.:/+\\-]{1,200}$'];
        $fields = match ($group) {
            'identity' => ['site_name' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 100],
                'site_tagline' => $text(500), 'site_language' => ['type' => 'string', 'pattern' => '^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$'],
                'site_url' => $text(2048)],
            'generation' => ['ai_max_tokens' => ['type' => 'integer', 'minimum' => 1000, 'maximum' => 128000],
                'evaluator_enabled' => $bool, 'design_review_enabled' => $bool],
            'provider' => ['ai_provider' => ['enum' => $providers], 'ai_openai_compatible_base_url' => $text(2048)],
            'retention' => ['auto_snapshot' => $bool, 'max_snapshots' => ['type' => 'integer', 'minimum' => 0, 'maximum' => 10000],
                'max_revisions' => ['type' => 'integer', 'minimum' => 0, 'maximum' => 10000]],
            'navigation' => ['nav_style' => ['type' => 'string', 'pattern' => '^[a-z][a-z0-9_-]{0,49}$'],
                'mobile_nav_style' => ['type' => 'string', 'pattern' => '^[a-z][a-z0-9_-]{0,49}$'],
                'footer_style' => ['type' => 'string', 'pattern' => '^[a-z][a-z0-9_-]{0,49}$']],
            'public_api' => ['agent_api_enabled' => $bool, 'agent_api_allowed_origins' => $text(4096)],
            'router' => ['governor.mode' => ['enum' => ['off', 'shadow', 'enforce']],
                RouterSecrets::KEY => $secret,
                'governor.model_map' => self::object([
                    'cheap' => self::object(['provider' => ['enum' => $providers], 'model' => $model]),
                    'frontier' => self::object(['provider' => ['enum' => $providers], 'model' => $model]),
                ], [])],
            'mail' => ['mail.driver' => ['enum' => ['none', 'php_mail', 'smtp', 'mailpit']],
                'mail.from_address' => $text(254), 'mail.from_name' => $text(200), 'mail.smtp.host' => $text(253),
                'mail.smtp.port' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 65535],
                'mail.smtp.username' => $text(200), 'mail.smtp.password' => $secret,
                'mail.smtp.encryption' => ['enum' => ['tls', 'ssl', 'none']], 'mail.mailpit.host' => $text(253),
                'mail.mailpit.port' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 65535]],
            'model_limits' => [ModelCapabilitySettings::OVERRIDES_KEY => self::object([
                'base_url' => $text(2048), 'models' => ['type' => 'object', 'properties' => [], 'maxProperties' => 200,
                    'additionalProperties' => self::object(['max_output_tokens' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 2000000],
                        'context_window' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 10000000]])]])],
            default => throw new OperationException('invalid_schema', 'Choose a supported typed setting group.'),
        };
        if ($group === 'provider') foreach ($providers as $provider) {
            $fields['ai_' . $provider . '_model'] = $model;
            $fields['ai_' . $provider . '_api_key'] = $secret;
        }
        return $fields;
    }
    public static function groups(): array
    { return ['identity', 'generation', 'provider', 'retention', 'navigation', 'public_api', 'router', 'mail', 'model_limits']; }
    public static function inputSchema(string $method): array
    {
        if ($method === 'read') return self::object(['group' => ['enum' => self::groups()]]);
        if ($method === 'mail_test') return self::object(['operation_id' => self::id(), 'recipient' => ['type' => 'string', 'maxLength' => 254],
            'configuration_version' => self::version()]);
        if ($method !== 'update') throw new \InvalidArgumentException('Unknown setting operation.');
        $choices = [];
        foreach (self::groups() as $group) {
            $values = self::object(self::fields($group), []); $values['minProperties'] = 1;
            $choices[] = self::object(['operation_id' => self::id(), 'group' => ['const' => $group],
                'version' => self::version(), 'values' => $values]);
        }
        return ['oneOf' => $choices];
    }
    public static function outputSchema(): array
    {
        $choices = [];
        foreach (self::groups() as $group) {
            $fields = $configured = [];
            foreach (self::fields($group) as $key => $schema) {
                if (self::secret($key)) $configured[$key] = ['type' => 'boolean'];
                else $fields[$key] = ['anyOf' => [$schema, ['type' => 'null']]];
            }
            $choices[] = self::object(['group' => ['const' => $group], 'version' => self::version(),
                'values' => self::object($fields), 'configured' => self::object($configured),
                'provider_calls' => ['const' => 0], 'provider_actions_url' => ['type' => 'string']]);
        }
        return ['oneOf' => $choices];
    }
    public static function resultSchema(string $method = 'update'): array
    {
        if ($method === 'mail_test') return self::object(['recipient' => ['type' => 'string'],
            'delivery_status' => ['enum' => ['accepted', 'failed', 'unknown']], 'external_send' => ['const' => true],
            'message' => ['type' => 'string'], 'provider_calls' => ['const' => 0]]);
        return self::object(['group' => ['enum' => self::groups()], 'version' => self::version(),
            'changed_keys' => ['type' => 'array', 'items' => ['type' => 'string']], 'provider_calls' => ['const' => 0]]);
    }
    public function read(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('read'));
        $this->policy->require($actor, ['settings:read']);
        // Mail and routing configuration are owner administration even without secrets.
        if (in_array($input->group, ['mail', 'router', 'model_limits'], true)) $this->policy->require($actor, ['settings:write']);
        $values = $configured = []; $settings = new Settings($this->db);
        foreach (self::fields($input->group) as $key => $_) {
            $value = $settings->get($key);
            if (self::secret($key)) $configured[$key] = is_string($value) && $value !== '';
            else $values[$key] = ($_['type'] ?? null) === 'boolean' && in_array($value, [0, 1], true) ? (bool) $value : $value;
        }
        foreach (['governor.model_map'] as $key) if (isset($values[$key]) && $values[$key] === []) $values[$key] = (object) [];
        if (isset($values[ModelCapabilitySettings::OVERRIDES_KEY]['models']) && $values[ModelCapabilitySettings::OVERRIDES_KEY]['models'] === []) {
            $values[ModelCapabilitySettings::OVERRIDES_KEY]['models'] = (object) [];
        }
        $base = rtrim((string) parse_url((string) $settings->get('workspace_base_url', $settings->get('site_url', '')), PHP_URL_PATH), '/');
        return ['group' => $input->group, 'version' => $this->groupVersion($input->group), 'values' => (object) $values,
            'configured' => (object) $configured, 'provider_calls' => 0, 'provider_actions_url' => $base . '/_studio/#/settings/ai'];
    }
    public function update(OperationActor $actor, #[\SensitiveParameter] \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('update'));
        $scopes = ['settings:write'];
        $values = json_decode(CanonicalJson::encode($input->values), true, 32, JSON_THROW_ON_ERROR);
        $hasSecret = (bool) array_filter(array_keys($values), self::secret(...));
        if ($hasSecret) $scopes[] = 'settings:secrets';
        $this->policy->require($actor, $scopes);
        $digest = self::hasSecretMaterial($values) ? hash_hmac('sha256', CanonicalJson::encode($input), $this->key()) : CanonicalJson::digest($input);
        $row = $this->db->queryOne('SELECT * FROM agent_configuration_requests WHERE actor_key = ? AND operation_id = ?', [$actor->identity(), $input->operation_id]);
        if ($row && ($row['kind'] !== 'settings.update' || !hash_equals($row['request_digest'], $digest))) {
            throw new OperationException('idempotency_conflict', 'This setting operation belongs to different input.');
        }
        if (!$row) {
            $patch = $this->validatePatch($input->group, $values);
            $row = $this->reserve($actor, $input->operation_id, 'settings.update', $digest,
                ['group' => $input->group, 'version' => $input->version, 'patch' => $patch, 'scopes' => $scopes]);
        }
        // Secret values and ciphertext never enter operation request/result/audit JSON.
        $public = (object) ['group' => $input->group, 'version' => $input->version, 'request_digest' => $digest,
            'changed_keys' => array_keys($values), 'secret_update' => $hasSecret];
        return $this->runner->start($actor, $input->operation_id, 'settings.update', $public, $input->version,
            $row['id'], $scopes, fn($op) => $this->applySettings($actor, $op), fn() => ['restored' => true, 'remaining_paths' => []]);
    }
    /** Studio's existing form saves several known groups as one atomic change. */
    public function updateStudio(OperationActor $actor, string $operationId, #[\SensitiveParameter] array $input, array $versions): array
    {
        $this->policy->require($actor, ['settings:write']);
        $fields = []; $groupFor = [];
        foreach (self::groups() as $group) foreach (self::fields($group) as $key => $schema) { $fields[$key] = $schema; $groupFor[$key] = $group; }
        foreach ($input as $key => $value) if (self::secret($key) && is_string($value) && str_starts_with($value, '••')) unset($input[$key]);
        JsonSchema::validate(json_decode(json_encode($input, JSON_FORCE_OBJECT | JSON_THROW_ON_ERROR), false, 32, JSON_THROW_ON_ERROR), self::object($fields, []));
        if ($input === []) throw new OperationException('invalid_schema', 'Choose at least one configuration value.');
        $groups = []; foreach ($input as $key => $value) $groups[$groupFor[$key]][$key] = $value;
        if (array_diff(array_keys($versions), array_keys($groups)) || array_diff(array_keys($groups), array_keys($versions))) throw new OperationException('invalid_schema', 'Include the reviewed version of each changed setting group.');
        foreach ($versions as $version) JsonSchema::validate($version, self::version());
        $secret = (bool) array_filter(array_keys($input), self::secret(...));
        $scopes = array_merge(['settings:write'], $secret ? ['settings:secrets'] : []); $this->policy->require($actor, $scopes);
        $request = ['values' => $input, 'versions' => $versions];
        $digest = self::hasSecretMaterial($input) ? hash_hmac('sha256', CanonicalJson::encode($request), $this->key()) : CanonicalJson::digest($request);
        $row = $this->db->queryOne('SELECT * FROM agent_configuration_requests WHERE actor_key = ? AND operation_id = ?', [$actor->identity(), $operationId]);
        if ($row && ($row['kind'] !== 'settings.update' || $row['request_digest'] !== $digest)) throw new OperationException('idempotency_conflict', 'This setting operation belongs to different input.');
        if (!$row) {
            $patch = [];
            foreach ($groups as $group => $values) $patch += $this->validatePatch($group, $values, $input);
            $row = $this->reserve($actor, $operationId, 'settings.update', $digest,
                ['group' => array_key_first($groups), 'version' => $versions[array_key_first($groups)], 'versions' => $versions, 'patch' => $patch, 'scopes' => $scopes]);
        }
        return $this->runner->start($actor, $operationId, 'settings.update',
            (object) ['versions' => $versions, 'request_digest' => $digest, 'changed_keys' => array_keys($input), 'secret_update' => $secret],
            CanonicalJson::digest($versions), $row['id'], $scopes,
            fn($op) => $this->applySettings($actor, $op), fn() => ['restored' => true, 'remaining_paths' => []]);
    }
    public function continue(OperationActor $actor, string $id, int $checkpoint): array
    {
        $op = $this->operations->get($actor, $id);
        if (!in_array($op['kind'], ['settings.update', 'mail.test'], true)) throw new OperationException('invalid_schema', 'Use this operation’s continuation.');
        $scopes = $op['kind'] === 'mail.test' ? ['mail:send'] : array_merge(['settings:write'], ($op['request']['secret_update'] ?? false) ? ['settings:secrets'] : []);
        return $this->runner->continue($actor, $id, $checkpoint, $scopes,
            fn($op) => $op['kind'] === 'mail.test' ? $this->dispatchMail($actor, $op) : $this->applySettings($actor, $op),
            fn($op) => $this->rollbackState($op), fn() => true);
    }
    public function testMail(OperationActor $actor, \stdClass $input): array
    {
        JsonSchema::validate($input, self::inputSchema('mail_test'));
        $this->policy->require($actor, ['mail:send']);
        if (!filter_var($input->recipient, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $input->recipient)) throw new OperationException('invalid_schema', 'Use one valid test recipient.');
        return $this->runner->start($actor, $input->operation_id, 'mail.test',
            (object) ['recipient' => $input->recipient, 'configuration_version' => $input->configuration_version, 'external_send' => true],
            $input->configuration_version, null, ['mail:send'],
            fn($op) => $this->dispatchMail($actor, $op), fn($op) => $this->rollbackState($op));
    }
    private function dispatchMail(OperationActor $actor, array $op): array
    {
        $intent = $this->db->queryOne('SELECT * FROM agent_mail_dispatches WHERE operation_internal_id = ?', [$op['id']]);
        if (!$intent) {
            if ($this->groupVersion('mail') !== $op['request']['configuration_version']) throw new OperationException('content_conflict', 'Mail configuration changed. Review it before sending a test.');
            if ((new Settings($this->db))->get('mail.driver', 'none') === 'none') throw new OperationException('invalid_schema', 'Configure a mail driver before sending a test.');
            $this->policy->require($actor, ['mail:send']);
            // Commit intent before external dispatch. An interrupted worker
            // never treats a missing acknowledgement as permission to resend.
            $this->db->insert('agent_mail_dispatches', ['operation_internal_id' => $op['id'],
                'recipient' => $op['request']['recipient'], 'configuration_version' => $op['request']['configuration_version'],
                'state' => 'dispatching', 'started_at' => time()]);
            try {
                if ($this->mailTransport !== null) $sent = ($this->mailTransport)($op['request']['recipient']);
                else { Mailer::resetInstance(); $sent = Mailer::getInstance()->testConnection($op['request']['recipient']); }
                // A false return can include a lost SMTP acknowledgement. Do
                // not assert non-delivery unless the transport proves refusal.
                $state = ($sent['success'] ?? false) === true ? 'accepted'
                    : (($sent['definitely_not_sent'] ?? false) === true ? 'failed' : 'unknown');
            } catch (\Throwable) { $state = 'unknown'; }
            $this->db->update('agent_mail_dispatches', ['state' => $state, 'finished_at' => time()], 'operation_internal_id = ?', [$op['id']]);
        } else $state = $intent['state'] === 'dispatching' ? 'unknown' : $intent['state'];
        $result = $this->mailResult($op['request']['recipient'], $state);
        $this->operations->finish($actor, $op['operation_id'], $op['lease_token'], 'succeeded', $result, null, function () use ($op, $state): void {
            $this->db->update('agent_mail_dispatches', ['state' => $state, 'finished_at' => time()], 'operation_internal_id = ?', [$op['id']]);
        });
        return ['committed' => true];
    }
    public function recover(OperationActor $actor, string $id): array
    {
        $op = $this->operations->get($actor, $id);
        if (!in_array($op['kind'], ['settings.update', 'mail.test'], true)) throw new OperationException('invalid_schema', 'Use this operation’s recovery.');
        if ($op['kind'] !== 'mail.test') return $this->runner->recover($actor, $id, ['settings:write'], fn($op) => $this->rollbackState($op));
        $lock = SiteMutationLock::acquire($this->workspace->mutationLockPath(), $this->db, $op['id']);
        $claimed = $this->operations->claimRecovery($actor, $id, ['mail:send']);
        $intent = $this->db->queryOne('SELECT state FROM agent_mail_dispatches WHERE operation_internal_id = ?', [$op['id']]);
        $state = !$intent ? 'failed' : ($intent['state'] === 'dispatching' ? 'unknown' : $intent['state']);
        $this->operations->finish($actor, $id, $claimed['lease_token'], 'succeeded', $this->mailResult($op['request']['recipient'], $state));
        return OperationRunner::publicState($this->operations->get($actor, $id));
    }
    private function rollbackState(array $op): array
    {
        $uncertain = $op['kind'] === 'mail.test' && $this->db->count('agent_mail_dispatches', 'operation_internal_id = ?', [$op['id']]) > 0;
        return ['restored' => !$uncertain, 'remaining_paths' => $uncertain ? ['external_mail_delivery'] : []];
    }
    public function restoreForOwnerRecovery(array $operation): array
    {
        OwnerRecoveryService::assertClaim($this->db, $this->workspace, $operation);
        return $this->rollbackState($operation);
    }
    private function mailResult(string $recipient, string $state): array
    {
        return ['recipient' => $recipient, 'delivery_status' => $state, 'external_send' => true, 'provider_calls' => 0,
            'message' => match ($state) {
                'accepted' => 'The mail transport accepted the test message. Inbox delivery is not confirmed.',
                'failed' => 'The test message was not sent.',
                default => 'The send outcome is unknown. This operation will not send again; check the recipient mailbox before choosing a new test.',
            }];
    }
    private function applySettings(OperationActor $actor, array $op): array
    {
        $row = $this->db->queryOne('SELECT payload_json FROM agent_configuration_requests WHERE id = ?', [$op['preparation_id']]);
        $payload = $row ? json_decode($row['payload_json'], true, 64, JSON_THROW_ON_ERROR) : null;
        if (!is_array($payload)) throw new OperationException('content_conflict', 'Retained configuration is unavailable.');
        foreach ($payload['versions'] ?? [$payload['group'] => $payload['version']] as $group => $version) {
            if ($this->groupVersion($group) !== $version) throw new OperationException('content_conflict', 'A setting group changed after review.');
        }
        $this->policy->require($actor, $payload['scopes']);
        $after = $this->groupVersion($payload['group'], $payload['patch']);
        $result = ['group' => $payload['group'], 'version' => $after, 'changed_keys' => array_keys($payload['patch']), 'provider_calls' => 0];
        $this->operations->finish($actor, $op['operation_id'], $op['lease_token'], 'succeeded', $result, $after, function () use ($payload, $op): void {
            $settings = new Settings($this->db);
            foreach ($payload['patch'] as $key => $value) $settings->set($key, $value);
            $this->db->update('agent_configuration_requests', ['payload_json' => null], 'id = ?', [$op['preparation_id']]);
        });
        Mailer::resetInstance();
        return ['committed' => true];
    }
    private function validatePatch(string $group, #[\SensitiveParameter] array $values, #[\SensitiveParameter] array $allValues = []): array
    {
        $settings = new Settings($this->db);
        foreach ($values as $key => $value) {
            if (is_string($value) && preg_match('/[\x00-\x1f\x7f]/', $value)) throw new OperationException('invalid_schema', 'Configuration text cannot contain control characters.');
            if ($key === 'site_name' && Validator::siteName($value) !== null) throw new OperationException('invalid_schema', 'Use a valid site name.');
            if (in_array($key, ['site_url', 'ai_openai_compatible_base_url'], true) && $value !== '') {
                $url = parse_url($value);
                if (!is_array($url) || !in_array($url['scheme'] ?? '', ['http', 'https'], true) || empty($url['host'])
                    || isset($url['user']) || isset($url['pass']) || isset($url['query']) || isset($url['fragment'])) {
                    throw new OperationException('invalid_schema', 'Use an HTTP or HTTPS URL without credentials, query, or fragment.');
                }
            }
            if ($key === 'mail.from_address' && $value !== '' && !filter_var($value, FILTER_VALIDATE_EMAIL)) throw new OperationException('invalid_schema', 'Use a valid sender email address.');
            if (in_array($key, ['mail.smtp.host', 'mail.mailpit.host'], true) && $value !== '' && !preg_match('/^[A-Za-z0-9._:\\[\\]-]+$/D', $value)) throw new OperationException('invalid_schema', 'Use a mail server hostname or address.');
            if (self::secret($key) && $key !== RouterSecrets::KEY) {
                if ($value !== null && $value !== '' && preg_match('/^ai_.+_api_key$/D', $key) && !preg_match('/^[\x21-\x7e]{1,4096}$/D', $value)) throw new OperationException('invalid_schema', 'Provider keys must contain a printable token.');
                $values[$key] = $value === null || $value === '' ? null : (new Encryption($this->key()))->encrypt($value);
            }
        }
        if ($group === 'router') {
            try { $values = (new RouterSettings($settings, fn() => new Encryption($this->key())))->prepareUpdates($values + (isset($allValues['ai_provider']) ? ['ai_provider' => $allValues['ai_provider']] : []), 'owner'); }
            catch (\Throwable $error) { throw new OperationException($error->getCode() === 409 ? 'governor_configuration' : 'invalid_schema', 'Router settings are invalid or its secret cannot be stored. Choose matching provider models and a configured key for active routing.'); }
        }
        if ($group === 'model_limits') {
            try { $values[ModelCapabilitySettings::OVERRIDES_KEY] = ModelCapabilitySettings::validateOverrides($values[ModelCapabilitySettings::OVERRIDES_KEY], (string) ($allValues['ai_openai_compatible_base_url'] ?? $settings->get('ai_openai_compatible_base_url', ''))); }
            catch (\Throwable) { throw new OperationException('invalid_schema', 'Model limits must match the saved compatible server and valid context/output bounds.'); }
        }
        if (isset($values['agent_api_allowed_origins'])) foreach (array_filter(array_map('trim', explode(',', $values['agent_api_allowed_origins']))) as $origin) {
            if ($origin !== '*' && !preg_match('~^https?://[A-Za-z0-9.\\[\\]:_-]+/?$~D', $origin)) throw new OperationException('invalid_schema', 'Allowed origins must be comma-separated HTTP/HTTPS origins or *.');
        }
        return $values;
    }
    private function groupVersion(string $group, array $patch = []): string
    {
        $settings = new Settings($this->db); $values = [];
        foreach (self::fields($group) as $key => $_) $values[$key] = array_key_exists($key, $patch) ? $patch[$key] : $settings->get($key);
        return CanonicalJson::digest($values);
    }
    private static function hasSecretMaterial(array $values): bool
    { foreach ($values as $key => $value) if (self::secret($key) && is_string($value) && $value !== '') return true; return false; }
    private function reserve(OperationActor $actor, string $id, string $kind, string $digest, array $payload): array
    {
        return $this->db->transaction(function () use ($actor, $id, $kind, $digest, $payload): array {
            $existing = $this->db->queryOne('SELECT * FROM agent_configuration_requests WHERE actor_key = ? AND operation_id = ?', [$actor->identity(), $id]);
            if ($existing) {
                if ($existing['kind'] !== $kind || $existing['request_digest'] !== $digest) throw new OperationException('idempotency_conflict', 'This administrative operation belongs to different input.');
                return $existing;
            }
            if ($this->db->count('agent_configuration_requests', 'payload_json IS NOT NULL') >= 100) throw new OperationException('size_limit', 'Too many pending configuration requests.');
            $request = 'configuration_' . bin2hex(random_bytes(16));
            $this->db->insert('agent_configuration_requests', ['id' => $request, 'actor_key' => $actor->identity(),
                'operation_id' => $id, 'kind' => $kind, 'request_digest' => $digest,
                'payload_json' => CanonicalJson::encode($payload), 'created_at' => time()]);
            return ['id' => $request];
        });
    }
    private function key(): string
    {
        $key = $this->appKey ?? (loadConfig()['app_key'] ?? '');
        try { new Encryption($key); } catch (\Throwable) { throw new OperationException('host_capability_unavailable', 'Secret storage requires valid installation encryption.'); }
        return $key;
    }
    private static function secret(string $key): bool { return str_ends_with($key, '_api_key') || $key === 'mail.smtp.password'; }
    private static function id(): array { return ['type' => 'string', 'pattern' => '^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$']; }
    private static function version(): array { return ['type' => 'string', 'pattern' => '^[a-f0-9]{64}$']; }
    private static function object(array $fields, ?array $required = null): array
    { return ['type' => 'object', 'properties' => $fields, 'required' => $required ?? array_keys($fields), 'additionalProperties' => false]; }
}
