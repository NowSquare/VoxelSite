<?php
declare(strict_types=1);
use VoxelSite\{Database, SiteWorkspace, StudioConfigurationService, RouterSettings};
use VoxelSite\Agent\{OperationException, SettingsService};

$ctx = $_agentContext;
try {
    $db = Database::getInstance();
    $configuration = new StudioConfigurationService($db, new SiteWorkspace($db));
    $actor = $configuration->policy->fromRestCredential((int) ($ctx['keyData']['id'] ?? 0), 'settings');
    $groups = ['identity', 'navigation', 'retention'];
    if ($ctx['method'] === 'GET') {
        $values = $versions = $groupKeys = [];
        foreach ($groups as $group) {
            $read = $configuration->settings->read($actor, (object) ['group' => $group]);
            $values += (array) $read['values']; $versions[$group] = $read['version']; $groupKeys[$group] = array_keys(SettingsService::fields($group));
        }
        foreach (['site_favicon', 'ai_provider', 'last_published_at', 'publish_count', 'agent_api_enabled', 'agent_api_allowed_origins'] as $key) $values[$key] = $ctx['settings']->get($key);
        $values = array_merge($values, (new RouterSettings($ctx['settings']))->publicStatus());
        agentResponse(['data' => ['settings' => $values, 'versions' => $versions, 'group_keys' => $groupKeys]]); return;
    }
    $body = json_decode(file_get_contents('php://input'), true, 32, JSON_THROW_ON_ERROR);
    if (!is_array($body) || !is_array($body['values'] ?? null)) throw new OperationException('invalid_schema', 'Include operation_id, typed values and their reviewed versions.');
    $allowed = []; foreach ($groups as $group) $allowed += SettingsService::fields($group);
    if (array_diff(array_keys($body['values']), array_keys($allowed))) throw new OperationException('invalid_schema', 'REST settings accept site identity, navigation and retention only. Use Studio for provider, mail, secrets and favicon administration.');
    $operation = $configuration->saveSettings($actor, $body);
    if (in_array($operation['status'], ['applying', 'succeeded'], true)) agentResponse(['data' => ['operation' => $operation, 'updated' => $operation['result']['changed_keys'] ?? []]], $operation['status'] === 'applying' ? 202 : 200);
    else agentError(409, $operation['result']['error']['code'] ?? $operation['status'], $operation['result']['error']['message'] ?? 'This configuration change needs attention.', ['operation' => $operation]);
} catch (OperationException $error) {
    agentError(match ($error->errorCode) { 'permission_denied' => 403, 'invalid_schema' => 422, default => 409 }, $error->errorCode, $error->getMessage(), $error->details);
} catch (JsonException) { agentError(422, 'invalid_schema', 'Use a valid JSON settings request.'); }
