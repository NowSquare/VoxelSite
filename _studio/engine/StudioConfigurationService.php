<?php
declare(strict_types=1);
namespace VoxelSite;
use VoxelSite\Agent\{ActorPolicy, CanonicalJson, DiagnosticsService, OperationActor, OperationException, OperationStore, PromptService, SettingsService};

/** Session adapters use the same scoped services and retained operations as MCP. */
final class StudioConfigurationService
{
    public readonly ActorPolicy $policy;
    public readonly OperationStore $operations;
    public readonly SettingsService $settings;
    public readonly DiagnosticsService $diagnostics;
    public readonly PromptService $prompts;
    public readonly \VoxelSite\Agent\FaviconService $favicon;
    public function __construct(private Database $db, private SiteWorkspace $workspace, ?string $appKey = null)
    {
        $this->policy = new ActorPolicy($db);
        $this->operations = new OperationStore($db, $this->policy, $workspace->mutationLockPath());
        $this->settings = new SettingsService($db, $this->policy, $workspace, $this->operations, $appKey);
        $this->diagnostics = new DiagnosticsService($db, $this->policy, $workspace, $this->operations, appKey: $appKey);
        $this->prompts = new PromptService($db, $this->policy, $workspace, $this->operations);
        $this->favicon = new \VoxelSite\Agent\FaviconService($db, $this->policy, $workspace, $this->operations);
    }
    public function readSettings(OperationActor $actor): array
    {
        // The Studio settings shell is readable by every current session role.
        // This compatibility projection grants no generic settings/API scope.
        if ($actor->type !== 'user') throw new OperationException('permission_denied', 'Use an authenticated Studio session to read these settings.');
        $this->policy->require($actor, ['site:read']);
        $settings = new Settings($this->db);
        if ($this->db->scalar('SELECT role FROM users WHERE id = ?', [$actor->userId]) === 'viewer') {
            $values = [];
            foreach (['site_name', 'site_tagline', 'site_language', 'site_url', 'site_favicon', 'nav_style', 'mobile_nav_style', 'footer_style'] as $key) $values[$key] = $settings->get($key);
            $values = array_merge($values, (new RouterSettings($settings))->publicStatus());
            return ['settings' => $values, 'versions' => (object) [], 'group_keys' => (object) [],
                'governor_activity' => (new RouterActivity($this->db))->recent($actor->userId)];
        }
        $values = $versions = $configured = [];
        foreach (SettingsService::groups() as $group) {
            if (in_array($group, ['mail', 'router', 'model_limits'], true) && !$this->canWrite($actor)) continue;
            $read = $this->settings->read($actor, (object) ['group' => $group]);
            $values += (array) $read['values']; $configured += (array) $read['configured']; $versions[$group] = $read['version'];
        }
        foreach ($configured as $key => $set) {
            if ($key === RouterSecrets::KEY) continue;
            $values[$key] = $set ? '••••••••' : null; $values[$key . '_set'] = $set;
        }
        $settings = new Settings($this->db);
        $values['available_providers'] = AIProviderFactory::listProviders();
        $values['ai_configured'] = AiSetup::configured($settings);
        $values['site_favicon'] = $settings->get('site_favicon');
        $values = array_merge($values, (new RouterSettings($settings))->publicStatus());
        $groupKeys = []; foreach (array_keys($versions) as $group) $groupKeys[$group] = array_keys(SettingsService::fields($group));
        return ['settings' => $values, 'versions' => $versions, 'group_keys' => $groupKeys, 'favicon' => $this->favicon->read($actor),
            'governor_activity' => (new RouterActivity($this->db))->recent($actor->userId)];
    }
    public function saveSettings(OperationActor $actor, array $body): array
    {
        $id = self::operationId($body); $values = $body['values'] ?? null; $versions = $body['versions'] ?? null;
        if (!is_array($values) || !is_array($versions)) throw new OperationException('invalid_schema', 'Include typed settings and their reviewed versions.');
        // Call the service first even for retries: it binds the complete (possibly
        // secret) input using its retained private digest before any continuation.
        $operation = $this->settings->updateStudio($actor, $id, $values, $versions);
        if (isset($body['checkpoint']) && $operation['status'] === 'applying') {
            self::checkpoint($body); return $this->settings->continue($actor, $id, $body['checkpoint']);
        }
        return $operation;
    }
    public function promptFile(OperationActor $actor, string $path): array
    {
        $relative = substr($path, strlen('_prompts/')); $offset = 0; $content = ''; $version = null;
        for ($step = 0; $step < 32; $step++) {
            $input = ['path' => $relative, 'offset' => $offset, 'max_bytes' => 65536];
            if ($version !== null) $input['version'] = $version;
            $read = $this->prompts->read($actor, (object) $input);
            $content .= $read['content']; $version = $read['version'];
            if ($read['next_offset'] === null) return ['path' => $path, 'content' => $content,
                'content_sha256' => hash('sha256', $content), 'prompt_version' => $version,
                'file' => ['path' => $path, 'name' => basename($path), 'extension' => 'md', 'size' => strlen($content),
                    'group' => 'prompts', 'language' => 'markdown', 'readonly' => false, 'protected' => true, 'custom' => $read['source'] === 'override']];
            $offset = $read['next_offset'];
        }
        throw new OperationException('size_limit', 'Prompt paging exceeded its qualified budget.');
    }
    public function savePrompt(OperationActor $actor, array $body, bool $reset = false): array
    {
        $id = self::operationId($body);
        $input = ['operation_id' => $id, 'path' => $body['path'] ?? null, 'version' => $body['version'] ?? null];
        if (!$reset) $input['content'] = $body['content'] ?? null;
        $operation = $reset ? $this->prompts->reset($actor, (object) $input) : $this->prompts->update($actor, (object) $input);
        if (isset($body['checkpoint']) && $operation['status'] === 'applying') {
            self::checkpoint($body); return $this->prompts->continue($actor, $id, $body['checkpoint']);
        }
        return $operation;
    }
    private function canWrite(OperationActor $actor): bool
    { try { $this->policy->require($actor, ['settings:write']); return true; } catch (OperationException) { return false; } }
    public static function operationId(array $body): string
    {
        $id = $body['operation_id'] ?? null;
        if (!is_string($id) || !preg_match('/^[A-Za-z0-9][A-Za-z0-9_-]{7,127}$/D', $id)) throw new OperationException('invalid_schema', 'Use a stable operation_id for this change.');
        return $id;
    }
    private static function checkpoint(array $body): void
    { if (!is_int($body['checkpoint']) || $body['checkpoint'] < 0) throw new OperationException('invalid_schema', 'Use the returned operation checkpoint.'); }
}
